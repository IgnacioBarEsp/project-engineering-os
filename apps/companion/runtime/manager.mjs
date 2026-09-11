import { mkdir, mkdtemp, cp, rename, rm, lstat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { assertPath, canonicalFolder, snapshot, writeChecked, withLock, json, fail } from '../engine/files.mjs';
import { extractZip } from './archive.mjs';
import { downloadArtifact } from './download.mjs';
import { inspectTree } from './tree.mjs';
import { RUNTIME_CATALOG, RUNTIME_PLATFORM } from './catalog.mjs';
import { isolatedEnvironment, runFixedProcess } from './process.mjs';
import { reviewCacheRepair, replaceReviewedCache } from './cache-repair.mjs';
import { randomUUID } from 'node:crypto';

// The reviewed npm distribution is pinned by the digest of its complete tree, vendored dependencies
// included. Packagers deduplicate and drop nested node_modules, which prunes exactly those and leaves
// an installation that cannot prepare tools. Beside a packaged application it therefore travels as a
// single archive that no file filter can thin out, extracted here by the same reviewed extractor used
// for downloads. A development run copies it from the dependency tree, the bytes the pin came from.
const npmArchive = fileURLToPath(new URL('../../npm-dist.zip', import.meta.url));
const npmSource = fileURLToPath(new URL('../node_modules/npm', import.meta.url));
const npmIsPackaged = () => existsSync(npmArchive);
const codegraphNotice = fileURLToPath(new URL('./notices/CodeGraph-LICENSE', import.meta.url));
const slotName = tool => `${tool.id}-${tool.version}-${tool.treeHash.slice(0, 12)}`;
function selectedEntries(id, name) {
  if (id === 'node') return name === 'node-v24.20.0-win-x64/node.exe' ? 'node.exe' : name === 'node-v24.20.0-win-x64/LICENSE' ? 'LICENSE' : null;
  if (id === 'codegraph') return name.startsWith('codegraph-win32-x64/lib/') ? name.slice('codegraph-win32-x64/'.length) : null;
  return name;
}

export async function createRuntimeManager({ root: target, transport = fetch } = {}) {
  await mkdir(target, { recursive: true }); const root = await canonicalFolder(target);
  const repairs = new Map();
  const toolFor = id => { if (!Object.hasOwn(RUNTIME_CATALOG, id)) fail('TOOL_UNKNOWN', 'Esta herramienta no está en el catálogo revisado.'); return RUNTIME_CATALOG[id]; };
  function platform() { if (`${process.platform}-${process.arch}` !== RUNTIME_PLATFORM) fail('PLATFORM_UNSUPPORTED', 'La preparación automática de herramientas está disponible para Windows de 64 bits.', 'Puedes seguir usando el contexto local y exportarlo a tu IA.'); }
  async function verifyPayload(payload, tool, signal) {
    const tree = await inspectTree(payload, { signal });
    if (tree.sha256 !== tool.treeHash || tree.bytes !== tool.installedBytes) fail('RUNTIME_INTEGRITY', 'Una herramienta instalada cambió o está incompleta.', 'Conserva tus proyectos. Revisa y repara esta herramienta antes de activarla.');
    const entry = await assertPath(payload, tool.entry);
    if (!(await lstat(entry)).isFile()) fail('RUNTIME_IDENTITY', 'No se encontró la herramienta revisada.');
    if (tool.packagePath) {
      const metadata = JSON.parse((await snapshot(payload, tool.packagePath, 1024 * 1024)).content);
      if (metadata.name !== tool.packageName || metadata.version !== tool.version) fail('RUNTIME_IDENTITY', 'La identidad de la herramienta no coincide.');
    }
    return { id: tool.id, version: tool.version, root: payload, entry: await realpath(entry), treeHash: tree.sha256 };
  }
  async function inspect(id, { signal } = {}) {
    const tool = toolFor(id), slot = slotName(tool), directory = await assertPath(root, slot);
    if (!await lstat(directory).catch(e => { if (e.code !== 'ENOENT') throw e; return null; })) return { id, status: 'missing' };
    try {
      const receipt = JSON.parse((await snapshot(root, `${slot}/receipt.json`, 65536)).content);
      if (receipt?.format !== 1 || receipt.id !== id || receipt.version !== tool.version || receipt.treeHash !== tool.treeHash || receipt.platform !== RUNTIME_PLATFORM) fail('RUNTIME_RECEIPT', 'El registro de la herramienta no coincide con el catálogo.');
      const checked = await verifyPayload(await canonicalFolder(path.join(directory, 'payload')), tool, signal);
      return { ...checked, status: 'verified' };
    } catch (error) {
      if (signal?.aborted) throw error;
      return { id, status: 'requires-action', code: error.code ?? 'RUNTIME_RECEIPT', message: error.message, action: error.action ?? 'Revisa y repara la herramienta. Tus proyectos se conservan.' };
    }
  }
  const api = {
    root, inspect,
    async plan(ids, controls = {}) {
      platform(); if (!Array.isArray(ids) || ids.length > 4 || new Set(ids).size !== ids.length) fail('TOOL_UNKNOWN', 'Revisa las herramientas seleccionadas.');
      const tools = [];
      for (const id of ids) {
        const tool = toolFor(id), current = await inspect(id, controls);
        tools.push({ id, name: tool.name, version: tool.version, license: tool.license, purpose: tool.purpose, source: tool.source,
          destination: path.join(root, slotName(tool)), downloadBytes: current.status === 'verified' ? 0 : tool.bytes, installedBytes: tool.installedBytes, status: current.status, action: current.action });
      }
      return { platform: RUNTIME_PLATFORM, tools, downloadBytes: tools.reduce((sum, t) => sum + t.downloadBytes, 0) };
    },
    async planRepair(id, controls = {}) {
      platform(); const tool = toolFor(id), current = await inspect(id, controls);
      if (current.status !== 'requires-action') fail('REPAIR_NOT_NEEDED', 'Esta herramienta no necesita reparación.');
      const review = await reviewCacheRepair(root, slotName(tool), { format: 1, id, version: tool.version, platform: RUNTIME_PLATFORM, treeHash: tool.treeHash, source: tool.source }, controls);
      const handle = randomUUID(); repairs.set(handle, { id, review }); if (repairs.size > 10) repairs.delete(repairs.keys().next().value);
      return { id: handle, tool: id, name: tool.name, destination: path.join(root, slotName(tool)), downloadBytes: tool.bytes, replacedBytes: review.bytes };
    },
    async repair(handle, controls = {}) {
      const plan = repairs.get(handle); if (!plan) fail('PLAN_UNKNOWN', 'Revisa de nuevo la reparación.');
      return withLock(root, async () => { repairs.delete(handle); return replaceReviewedCache(plan.review, () => installUnlocked(plan.id, controls), controls); });
    },
    async install(id, controls = {}) { return withLock(root, () => installUnlocked(id, controls)); },
  };
  async function installUnlocked(id, { signal, onProgress = () => {} } = {}) {
      platform(); const tool = toolFor(id);
        const current = await inspect(id, { signal });
        if (current.status === 'verified') return current;
        if (current.status !== 'missing') fail(current.code, current.message, current.action);
        signal?.throwIfAborted();
        const stage = await mkdtemp(path.join(root, '.stage-')), stageName = path.basename(stage), payload = path.join(stage, 'payload');
        try {
          onProgress({ stage: 'runtime', label: `Preparando ${tool.name}`, completed: 0, total: tool.bytes });
          if (tool.bundled) {
            if (npmIsPackaged()) await extractZip(npmArchive, payload, { signal });
            else await cp(npmSource, payload, { recursive: true, force: false, errorOnExist: true, verbatimSymlinks: true, filter: () => { signal?.throwIfAborted(); return true; } });
          }
          else {
            const archive = path.join(stage, 'download.zip');
            await downloadArtifact(tool, archive, { signal, transport, onProgress: progress => onProgress({ stage: 'download', label: `Descargando ${tool.name}`, ...progress }) });
            onProgress({ stage: 'runtime', label: `Comprobando ${tool.name}` });
            await extractZip(archive, payload, { signal, select: name => selectedEntries(id, name) });
            if (id === 'codegraph') { await mkdir(path.join(payload, 'NOTICES')); await cp(codegraphNotice, path.join(payload, 'NOTICES', 'CodeGraph-LICENSE'), { errorOnExist: true, force: false }); }
          }
          const verified = await verifyPayload(await canonicalFolder(payload), tool, signal);
          const home = path.join(stage, 'probe'); await mkdir(home);
          if (id === 'node' || id === 'git') {
            const probe = await runFixedProcess({ executable: verified.entry, args: ['--version'], cwd: home, env: isolatedEnvironment({ home }), signal, timeoutMs: 15000, maxOutputBytes: 4096 });
            if (probe.stdout.trim() !== (id === 'node' ? `v${tool.version}` : `git version ${tool.version}`)) fail('RUNTIME_IDENTITY', 'La herramienta no confirmó su versión revisada.');
          }
          // Only payload + identity receipt are published. Downloads/probe state stay in staging.
          const ready = path.join(stage, 'ready'); await mkdir(ready); await rename(payload, path.join(ready, 'payload'));
          await writeChecked(await canonicalFolder(ready), 'receipt.json', json({ format: 1, id, version: tool.version, platform: RUNTIME_PLATFORM, treeHash: tool.treeHash, source: tool.source }), null, 65536);
          signal?.throwIfAborted(); const destination = await assertPath(root, slotName(tool));
          if (await lstat(destination).catch(e => { if (e.code !== 'ENOENT') throw e; return null; })) fail('RUNTIME_CHANGED', 'La instalación cambió durante la preparación.');
          await rename(ready, destination);
          const finalRoot = await canonicalFolder(path.join(destination, 'payload'));
          return { ...verified, root: finalRoot, entry: await realpath(path.join(finalRoot, tool.entry)), status: 'verified' };
        } finally {
          // This name was exclusively created by this operation under the validated runtime root.
          await assertPath(root, stageName); await rm(stage, { recursive: true, force: true });
        }
  }
  return api;
}
