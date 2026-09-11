import { mkdir, mkdtemp, cp, lstat, rename, rm, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalFolder, assertPath, fail, snapshot, withLock, writeChecked, json, hash } from '../engine/files.mjs';
import { inspectTree } from './tree.mjs';
import { isolatedEnvironment, runFixedProcess } from './process.mjs';
import { randomUUID } from 'node:crypto';
import { reviewCacheRepair, replaceReviewedCache } from './cache-repair.mjs';

import { TOOLCHAIN } from './toolchain-pin.mjs';
export { TOOLCHAIN } from './toolchain-pin.mjs';
const resources = fileURLToPath(new URL('./toolchain/', import.meta.url));
const slot = `engineering-${TOOLCHAIN.core}-${TOOLCHAIN.openspec}-${TOOLCHAIN.treeHash.slice(0, 12)}`;
const exists = absolute => lstat(absolute).catch(e => { if (e.code !== 'ENOENT') throw e; return null; });

export async function verifyToolchain(root, controls = {}) {
  const tree = await inspectTree(root, controls);
  if (tree.sha256 !== TOOLCHAIN.treeHash || tree.bytes !== TOOLCHAIN.bytes) fail('TOOLCHAIN_INTEGRITY', 'Las herramientas de ingeniería cambiaron o no están completas.', 'Conserva esta carpeta y revisa su reparación. No se ejecutaron sus herramientas.');
  return { root, core: path.join(root, 'node_modules/create-project-engineering-os/src/index.mjs'),
    cli: path.join(root, 'node_modules/create-project-engineering-os/bin/project-os.mjs'),
    openspec: path.join(root, 'node_modules/@fission-ai/openspec/bin/openspec.js'), treeHash: tree.sha256 };
}

export function createToolchainStore(manager) {
  const repairs = new Map(), identity = { format: 1, id: 'engineering', core: TOOLCHAIN.core, openspec: TOOLCHAIN.openspec, treeHash: TOOLCHAIN.treeHash, rootHash: hash(manager.root) };
  async function saveCacheReceipt() {
    const current = await snapshot(manager.root, `${slot}.receipt.json`, 65536);
    await writeChecked(manager.root, `${slot}.receipt.json`, json(identity), current.hash, 65536);
  }
  async function prepareCacheUnlocked(tools, { signal, onProgress = () => {} } = {}) {
      const destination = await assertPath(manager.root, slot);
      if (await exists(destination)) {
        const verified = await verifyToolchain(await canonicalFolder(destination), { signal });
        // An older verified cache can gain a receipt during explicit preparation, never status.
        await saveCacheReceipt(); return verified;
      }
      const stage = await mkdtemp(path.join(manager.root, '.toolchain-stage-'));
      try {
        const payload = path.join(stage, 'payload'), home = path.join(stage, 'home');
        await mkdir(payload); await mkdir(home);
        for (const name of ['package.json', 'package-lock.json']) await cp(path.join(resources, name), path.join(payload, name), { errorOnExist: true, force: false });
        // npm runs only in this new owned folder. Neither user/project config nor lifecycle
        // scripts enter the process; every package is pinned to its reviewed lock integrity.
        onProgress({ stage: 'runtime', label: 'Preparando las herramientas de ingeniería' });
        const env = isolatedEnvironment({ home, pathEntries: [path.dirname(tools.node.entry), path.dirname(tools.git.entry)] });
        await runFixedProcess({ executable: tools.node.entry, args: [tools.npm.entry, 'ci', '--ignore-scripts', '--bin-links=false', '--workspaces=false',
          '--registry=https://registry.npmjs.org', '--min-release-age=7', '--min-release-age-exclude=create-project-engineering-os', '--fund=false', '--audit=false'],
          cwd: payload, env, signal, timeoutMs: 180000 });
        await verifyToolchain(await canonicalFolder(payload), { signal }); signal?.throwIfAborted();
        if (await exists(destination)) fail('TOOLCHAIN_CHANGED', 'La preparación de herramientas cambió.');
        await rename(payload, destination);
        await saveCacheReceipt();
        return { root: await canonicalFolder(destination), treeHash: TOOLCHAIN.treeHash };
      } finally { await assertPath(manager.root, path.basename(stage)); await rm(stage, { recursive: true, force: true }); }
  }
  const prepareCache = (tools, controls) => withLock(manager.root, () => prepareCacheUnlocked(tools, controls));
  return {
    async planRepair(controls = {}) {
      const review = await reviewCacheRepair(manager.root, slot, identity, controls, `${slot}.receipt.json`);
      const id = randomUUID(); repairs.set(id, review); if (repairs.size > 10) repairs.delete(repairs.keys().next().value);
      return { id, tool: 'engineering', name: 'Cache de ingeniería', destination: path.join(manager.root, slot), downloadBytes: TOOLCHAIN.downloadBytes, replacedBytes: review.bytes };
    },
    async repair(id, controls = {}) {
      const review = repairs.get(id); if (!review) fail('PLAN_UNKNOWN', 'Revisa de nuevo la reparación del cache.');
      const tools = {}; for (const key of ['node','git','npm']) {
        tools[key] = await manager.inspect(key, controls);
        if (tools[key].status !== 'verified') fail('REPAIR_TOOLS', 'Repara primero el motor y las herramientas de descarga.');
      }
      return withLock(manager.root, async () => { repairs.delete(id); return replaceReviewedCache(review, () => prepareCacheUnlocked(tools, controls), controls); });
    },
    async cacheStatus(controls = {}) {
      const destination = await assertPath(manager.root, slot);
      if (!await exists(destination)) return { status: 'missing', downloadBytes: TOOLCHAIN.downloadBytes };
      try { await verifyToolchain(await canonicalFolder(destination), controls); return { status: 'verified', downloadBytes: 0 }; }
      catch (error) { if (controls.signal?.aborted) throw error; return { status: 'requires-action', downloadBytes: TOOLCHAIN.downloadBytes, code: error.code, message: error.message, action: error.action }; }
    },
    async inspect(target, controls = {}) {
      const root = await canonicalFolder(target), absolute = await assertPath(root, TOOLCHAIN.relative);
      if (!await exists(absolute)) return { status: 'missing' };
      try { return { ...await verifyToolchain(await canonicalFolder(absolute), controls), status: 'verified' }; }
      catch (e) { if (controls.signal?.aborted) throw e; return { status: 'requires-action', code: e.code ?? 'TOOLCHAIN_INVALID', message: e.message, action: e.action ?? 'Conserva la carpeta de herramientas existente y revisa su reparación.' }; }
    },
    async install(target, tools, controls = {}) {
      const root = await canonicalFolder(target);
      return withLock(root, async () => {
        const destination = await assertPath(root, TOOLCHAIN.relative);
        if (await exists(destination)) return verifyToolchain(await canonicalFolder(destination), controls);
        const cached = await prepareCache(tools, controls); controls.signal?.throwIfAborted();
        const parent = await assertPath(root, '.project-os'); await mkdir(parent, { recursive: true });
        const stage = await mkdtemp(path.join(parent, '.toolchain-stage-'));
        try {
          const payload = path.join(stage, 'payload');
          await cp(cached.root, payload, { recursive: true, force: false, errorOnExist: true, verbatimSymlinks: true, filter: () => { controls.signal?.throwIfAborted(); return true; } });
          await verifyToolchain(await canonicalFolder(payload), controls); controls.signal?.throwIfAborted();
          await assertPath(root, TOOLCHAIN.relative);
          if (await exists(destination)) fail('TOOLCHAIN_CHANGED', 'La carpeta de herramientas apareció después de la revisión.');
          await rename(payload, destination);
          return { root: await realpath(destination), treeHash: TOOLCHAIN.treeHash };
        } finally { await assertPath(root, `.project-os/${path.basename(stage)}`); await rm(stage, { recursive: true, force: true }); }
      });
    },
    async selection(target) {
      const root = await canonicalFolder(target), current = await snapshot(root, '.project-constructor/config.json', 65536);
      if (!current.content) fail('CONSTRUCTOR_MISSING', 'Primero revisa y prepara las instrucciones de ingeniería.');
      let value; try { value = JSON.parse(current.content); } catch { fail('CONFIG_INVALID', 'La configuración del constructor no se puede leer.'); }
      if (!value || Array.isArray(value) || typeof value !== 'object') fail('CONFIG_INVALID', 'La configuración del constructor no es válida.');
      if (value.toolchainRoot && value.toolchainRoot !== TOOLCHAIN.relative) fail('TOOLCHAIN_SELECTED_ELSEWHERE', 'Este proyecto ya seleccionó otra carpeta de herramientas.', 'Conserva esa configuración y revisa cómo integrar sus herramientas antes de cambiarla.');
      return { beforeHash: current.hash, value: { ...value, toolchainRoot: TOOLCHAIN.relative } };
    },
  };
}
