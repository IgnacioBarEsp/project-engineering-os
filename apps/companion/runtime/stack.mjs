import { mkdir, mkdtemp, cp, lstat, rename, rm, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalFolder, assertPath, fail, snapshot, withLock, writeChecked, json, hash } from '../engine/files.mjs';
import { inspectTree } from './tree.mjs';
import { isolatedEnvironment, runFixedProcess } from './process.mjs';
import { STACKS, stackDecision } from './stack-catalog.mjs';
import { ensureIgnoreRules } from './regenerable.mjs';

// Installing a project technology uses the same door the engineering cache already uses: a reviewed lockfile
// that pins every package's integrity, `npm ci` with lifecycle scripts disabled in an environment with its own
// HOME so neither user nor project config enters, and the digest of the resulting tree compared against a pin
// before anything is moved into place. Nothing arrives through a free `npm install`.
//
// Unlike the engineering cache there is no shared cache between projects. The engineering cache has one because
// it is installed in every engineering project; a technology is installed by whoever asks for it. Without a
// shared cache there is no shared state that can go stale or corrupt and no repair flow is needed for it. The
// price is that two projects asking for React download it twice, and these downloads are small. Said, not hidden.
const resources = fileURLToPath(new URL('./stack/', import.meta.url));
const RECORD = '.project-os/companion/stack.json';
const MAX_RECORD = 65536;
const exists = absolute => lstat(absolute).catch(error => { if (error.code !== 'ENOENT') throw error; return null; });
// Named once, so a test can assert them and a reader can see all of them at once. `--ignore-scripts` is what
// keeps a package from running code during installation; `--bin-links=false` keeps it from writing executables;
// the registry is pinned so a configured mirror cannot substitute the packages the lockfile pinned.
export const INSTALL_ARGUMENTS = Object.freeze(['ci', '--ignore-scripts', '--bin-links=false',
  '--workspaces=false', '--registry=https://registry.npmjs.org', '--min-release-age=7', '--fund=false', '--audit=false']);
const known = id => { if (!Object.hasOwn(STACKS, id)) fail('STACK_UNKNOWN', 'Esa tecnología no está en la lista revisada.'); return STACKS[id]; };
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const isoDate = () => new Date().toISOString();

export async function verifyStackTree(entry, treeRoot, controls = {}) {
  const tree = await inspectTree(treeRoot, controls);
  if (tree.sha256 !== entry.treeHash || tree.bytes !== entry.installedBytes) {
    fail('STACK_INTEGRITY', `Lo instalado para ${entry.name} no coincide con lo revisado.`,
      'Conserva esa carpeta y revísala antes de reemplazarla. No se ejecutó nada de su contenido.');
  }
  return { root: treeRoot, treeHash: tree.sha256, bytes: tree.bytes, files: tree.files.length };
}

function validateRecord(value) {
  if (!object(value) || value.format !== 1 || typeof value.root !== 'string'
      || !Array.isArray(value.installed) || !Array.isArray(value.declined)) fail('STACK_RECORD', 'El registro de tecnologías no se puede leer.');
  for (const item of [...value.installed, ...value.declined]) {
    if (!object(item) || typeof item.id !== 'string' || typeof item.at !== 'string') fail('STACK_RECORD', 'El registro de tecnologías no tiene un formato reconocido.');
  }
  // A file on disk is not the authority on what this application offers. An independent review put arbitrary
  // text in an id and read it back on the project screen — cosmetic, because it is rendered as text and the
  // control fails closed, but a name the catalogue does not know has no business on a screen.
  value.installed = value.installed.filter(item => Object.hasOwn(STACKS, item.id));
  value.declined = value.declined.filter(item => Object.hasOwn(STACKS, item.id));
  return value;
}

// The process runner is injectable for one reason: the arguments that keep third-party code from running during
// an install — `--ignore-scripts`, `--bin-links=false`, the pinned registry — were not asserted by anything, and
// an independent review removed each of them in turn with all the tests still green. They are a SHALL in the
// spec, so they are checked by name now rather than read in a diff.
export function createStackStore({ run = runFixedProcess } = {}) {
  async function record(root) {
    const current = await snapshot(root, RECORD, MAX_RECORD);
    if (!current.content) return { ...current, value: { format: 1, root, installed: [], declined: [] } };
    let parsed; try { parsed = JSON.parse(current.content); } catch { fail('STACK_RECORD', 'El registro de tecnologías no se puede leer.'); }
    return { ...current, value: validateRecord(parsed) };
  }
  // Writes the record and nothing else. It used to take the folder lock itself, which deadlocked the moment it
  // was called from inside `install` — which already holds that lock — and the first real installation through
  // the product's own path failed with BUSY. Every caller that needs the lock takes it, once.
  async function save(root, value, beforeHash) {
    const content = json({ ...value, root });
    await writeChecked(root, RECORD, content, beforeHash, MAX_RECORD);
    return hash(content);
  }
  return {
    // What the record says, without re-reading any tree. Used where a list has to show something cheaply, and
    // the screen that shows it says it is recorded rather than verified — the same rule as every other stage.
    async summary(target) {
      const root = await canonicalFolder(target), current = await record(root);
      return { installed: current.value.installed.map(item => ({ ...item })), declined: current.value.declined.map(item => ({ ...item })) };
    },
    async inspect(target, id, controls = {}) {
      const entry = known(id), root = await canonicalFolder(target), absolute = await assertPath(root, entry.relative);
      if (!await exists(absolute)) return { status: 'missing' };
      try { return { status: 'verified', ...await verifyStackTree(entry, await canonicalFolder(absolute), controls) }; }
      catch (error) { if (controls.signal?.aborted) throw error;
        return { status: 'requires-action', code: error.code ?? 'STACK_INTEGRITY', message: error.message, action: error.action }; }
    },
    // Everything the person has to see before anything is written: identity, the licences of the complete
    // closure, both sizes, and the destination. The plan also carries why this technology is on the list, so a
    // recommendation cannot arrive without its sentence.
    async plan(target, selection, inventory, controls = {}) {
      const root = await canonicalFolder(target), decision = stackDecision(selection, inventory), items = [];
      for (const id of decision.stacks) {
        const entry = STACKS[id], current = await this.inspect(root, id, controls);
        items.push({ id, name: entry.name, purpose: entry.purpose, packages: entry.packages.map(p => ({ ...p })),
          licenses: [...entry.licenses], closure: entry.closure, downloadBytes: entry.downloadBytes,
          installedBytes: entry.installedBytes, files: entry.files, destination: entry.relative, status: current.status });
      }
      return { kind: decision.kind, because: decision.because, items,
        downloadBytes: items.filter(i => i.status !== 'verified').reduce((sum, i) => sum + i.downloadBytes, 0) };
    },
    async decline(target, ids) {
      const root = await canonicalFolder(target);
      return withLock(root, async () => {
        const current = await record(root), at = isoDate(), value = current.value;
        for (const id of ids) { known(id); if (!value.declined.some(item => item.id === id)) value.declined.push({ id, at }); }
        await save(root, value, current.hash);
        return { declined: value.declined.map(item => ({ ...item })) };
      });
    },
    async install(target, id, tools, controls = {}) {
      const entry = known(id), root = await canonicalFolder(target);
      return withLock(root, async () => {
        const destination = await assertPath(root, entry.relative);
        if (await exists(destination)) return { status: 'verified', ...await verifyStackTree(entry, await canonicalFolder(destination), controls) };
        const parent = await assertPath(root, path.posix.dirname(entry.relative));
        await mkdir(parent, { recursive: true });
        // Before anything heavy lands, say what regenerates. A person who prepares a project and commits it
        // should not push a node_modules they never chose to version.
        await ensureIgnoreRules(root);
        const stage = await mkdtemp(path.join(parent, '.stack-stage-'));
        try {
          const payload = path.join(stage, 'payload'), home = path.join(stage, 'home');
          await mkdir(payload); await mkdir(home);
          // The lockfile resource is stored under a distinct name for the same reason the engineering one is:
          // packagers strip a file called package-lock.json, and this is an input, not this package's own lock.
          for (const [source, name] of [['package.json', 'package.json'], ['stack-lock.json', 'package-lock.json']]) {
            await cp(path.join(resources, id, source), path.join(payload, name), { errorOnExist: true, force: false });
          }
          const env = isolatedEnvironment({ home, pathEntries: [path.dirname(tools.node.entry), path.dirname(tools.git.entry)] });
          await run({ executable: tools.node.entry, args: [tools.npm.entry, ...INSTALL_ARGUMENTS],
            cwd: payload, env, signal: controls.signal, timeoutMs: 180000 });
          // Between what the network just produced and the person's folder. Removing this line leaves freshly
          // downloaded bytes being renamed into place unverified, and until an independent review removed it
          // nothing failed: the declared mutation emptied this function's body, which other paths catch.
          const verified = await verifyStackTree(entry, await canonicalFolder(payload), controls);
          controls.signal?.throwIfAborted();
          await assertPath(root, entry.relative);
          if (await exists(destination)) fail('STACK_CHANGED', 'Esa carpeta apareció después de la revisión.');
          await rename(payload, destination);
          const current = await record(root), value = current.value;
          value.installed = [...value.installed.filter(item => item.id !== id), { id, treeHash: verified.treeHash, at: isoDate() }];
          value.declined = value.declined.filter(item => item.id !== id);
          await save(root, value, current.hash);
          return { status: 'installed', root: await realpath(destination), treeHash: verified.treeHash, bytes: verified.bytes, files: verified.files };
        } finally { await assertPath(root, `${path.posix.dirname(entry.relative)}/${path.basename(stage)}`); await rm(stage, { recursive: true, force: true }); }
      });
    },
    // Removal measures the tree again first. A tree that still matches its pin is Companion's own and can go; a
    // tree that no longer matches has something in it that Companion did not put there, and it stays.
    async remove(target, id, controls = {}) {
      const entry = known(id), root = await canonicalFolder(target);
      return withLock(root, async () => {
        const absolute = await assertPath(root, entry.relative);
        if (!await exists(absolute)) {
          const current = await record(root), value = current.value;
          if (!value.installed.some(item => item.id === id)) return { status: 'unchanged' };
          value.installed = value.installed.filter(item => item.id !== id);
          await save(root, value, current.hash);
          return { status: 'unchanged' };
        }
        await verifyStackTree(entry, await canonicalFolder(absolute), controls);
        await assertPath(root, entry.relative);
        await rm(absolute, { recursive: true, force: false });
        const current = await record(root), value = current.value;
        value.installed = value.installed.filter(item => item.id !== id);
        await save(root, value, current.hash);
        return { status: 'removed' };
      });
    },
    witnessPaths() { return [RECORD]; },
  };
}
