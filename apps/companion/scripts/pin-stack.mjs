// Measures the pin of every reviewed project technology: the digest of the installed tree, its bytes, its file
// count and what it costs to download. It runs the same command the product runs, with the same managed engine
// and the same reviewed lockfile, because a pin measured by a different instrument is a pin for a different
// tree. It prints; it never edits the catalogue, so the number that ends up in the code is one a person put there.
//
// It also reads each package's declared licence and refuses to pin a closure that would break the catalogue's
// rules: an install script, an `os` or `cpu` constraint, or a package with no licence. A technology that cannot
// satisfy those cannot be offered, and this is where that is found out.
import { mkdtemp, mkdir, cp, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRuntimeManager } from '../runtime/manager.mjs';
import { inspectTree } from '../runtime/tree.mjs';
import { isolatedEnvironment, runFixedProcess } from '../runtime/process.mjs';
import { canonicalFolder } from '../engine/files.mjs';
import { STACKS, STACK_IDS } from '../runtime/stack-catalog.mjs';
import { INSTALL_ARGUMENTS } from '../runtime/stack.mjs';
import { portable } from './portable-path.mjs';

const resources = fileURLToPath(new URL('../runtime/stack/', import.meta.url));
const runtimeRoot = path.join(process.env.LOCALAPPDATA ?? os.homedir(), 'Project Engineering OS', 'runtimes');
const only = process.argv.slice(2).filter(value => !value.startsWith('--'));
const ids = only.length ? only : STACK_IDS;

const manager = await createRuntimeManager({ root: runtimeRoot });
const tools = {};
for (const id of ['node', 'npm', 'git']) {
  const result = await manager.inspect(id, {});
  if (result.status !== 'verified') { console.error(`No se puede medir: ${id} no está verificado (${result.status}).`); process.exit(1); }
  tools[id] = result;
}

async function closureFacts(lockPath) {
  const lock = JSON.parse(await readFile(lockPath, 'utf8'));
  const entries = Object.entries(lock.packages ?? {}).filter(([key]) => key);
  const problems = [], licenses = new Set();
  let downloadBytes = 0;
  for (const [key, value] of entries) {
    if (value.hasInstallScript) problems.push(`${key} ejecuta un script de instalación`);
    if (value.os || value.cpu) problems.push(`${key} restringe os o cpu`);
    if (!value.license) problems.push(`${key} no declara licencia`);
    else licenses.add(value.license);
    if (!value.resolved) { problems.push(`${key} no declara de dónde se descarga`); continue; }
    // The registry answers HEAD without a content-length. Asking with HEAD and reading that header gave a silent
    // zero that summed to a total of zero download bytes and reported success — a measurement that fails and one
    // that finds nothing looked identical. So the request is a GET whose header has to be a positive length, the
    // body is cancelled instead of read, and a missing or zero length is a problem rather than a total.
    const response = await fetch(value.resolved, { redirect: 'follow' });
    const header = response.headers.get('content-length'), length = Number(header);
    await response.body?.cancel().catch(() => {});
    if (!response.ok || header === null || !Number.isInteger(length) || length <= 0) { problems.push(`${key} no informa su tamaño de descarga`); continue; }
    downloadBytes += length;
  }
  return { packages: entries.length, licenses: [...licenses].sort(), downloadBytes, problems };
}

const measured = [];
for (const id of ids) {
  const entry = STACKS[id];
  if (!entry) { console.error(`Tecnología desconocida: ${id}`); process.exit(1); }
  const stage = await mkdtemp(path.join(os.tmpdir(), 'stack-pin-'));
  try {
    const payload = path.join(stage, 'payload'), home = path.join(stage, 'home');
    await mkdir(payload); await mkdir(home);
    for (const [source, name] of [['package.json', 'package.json'], ['stack-lock.json', 'package-lock.json']]) {
      await cp(path.join(resources, id, source), path.join(payload, name), { errorOnExist: true, force: false });
    }
    const facts = await closureFacts(path.join(payload, 'package-lock.json'));
    if (facts.problems.length) { console.error(`${id}: no se puede ofrecer.`); for (const problem of facts.problems) console.error(`  - ${problem}`); process.exit(1); }
    const env = isolatedEnvironment({ home, pathEntries: [path.dirname(tools.node.entry), path.dirname(tools.git.entry)] });
    const started = Date.now();
    // The product's own arguments, imported rather than repeated: a pin measured with different flags is a pin
    // for a different tree, and two copies of a list drift apart without anyone noticing.
    await runFixedProcess({ executable: tools.node.entry, args: [tools.npm.entry, ...INSTALL_ARGUMENTS],
      cwd: payload, env, timeoutMs: 180000 });
    const elapsedMs = Date.now() - started;
    const tree = await inspectTree(await canonicalFolder(payload));
    measured.push({ id, name: entry.name, packages: facts.packages, licenses: facts.licenses, files: tree.files.length,
      installedBytes: tree.bytes, downloadBytes: facts.downloadBytes, treeHash: tree.sha256, elapsedMs,
      matchesCatalogue: tree.sha256 === entry.treeHash && tree.bytes === entry.installedBytes });
  } finally { await rm(stage, { recursive: true, force: true }); }
}

console.log(JSON.stringify({ measuredAt: new Date().toISOString(), node: tools.node.version ?? null,
  runtimeRoot: portable(runtimeRoot), stacks: measured }, null, 2));
for (const item of measured) {
  console.log(`\n${item.id}: ${item.packages} paquetes, ${item.licenses.join(' | ')}, ${item.files} archivos, ` +
    `${item.installedBytes} bytes instalados, ${item.downloadBytes} bytes de descarga, ${item.elapsedMs} ms` +
    `${item.matchesCatalogue ? ' — coincide con el catálogo' : ' — NO coincide con el catálogo'}`);
}
// A mismatch used to print and exit 0, so the only tool that can actually detect catalogue drift could not be
// used as a gate — and an independent review changed a size and a digest in the catalogue with every test still
// green while the screen would have shown a false number before installing. Printing is not reporting.
const drifted = measured.filter(item => !item.matchesCatalogue);
if (drifted.length) {
  console.error(`El catálogo no coincide con lo medido en: ${drifted.map(item => item.id).join(', ')}. ` +
    'Actualiza el catálogo con estos números o averigua por qué cambió el árbol.');
  process.exitCode = 1;
}
