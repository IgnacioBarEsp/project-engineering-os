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
import { identityOf, distributionKey, distributionSlot, npmDistribution, readNpmSelection, npmReceipt,
  checkNpmReceipt, pendingNpmOperation, beginNpmOperation, finishNpmOperation,
  commitNpmSelection, rollbackNpmSelection, recoverNpmOperation } from './distribution-identity.mjs';

// The reviewed npm distribution is pinned by the digest of its complete tree, vendored dependencies
// included. Packagers deduplicate and drop nested node_modules, which prunes exactly those and leaves
// an installation that cannot prepare tools. Beside a packaged application it therefore travels as a
// single archive that no file filter can thin out, extracted here by the same reviewed extractor used
// for downloads. A development run copies it from the dependency tree, the bytes the pin came from.
const npmArchive = fileURLToPath(new URL('../../npm-dist.zip', import.meta.url));
const npmSource = fileURLToPath(new URL('../node_modules/npm', import.meta.url));
const npmIsPackaged = () => existsSync(npmArchive);
const codegraphNotice = fileURLToPath(new URL('./notices/CodeGraph-LICENSE', import.meta.url));
const slotName = tool => tool.id === 'npm' ? distributionSlot(identityOf(tool)) : `${tool.id}-${tool.version}-${tool.treeHash.slice(0, 12)}`;
const npmRepairIdentity = tool => { const { identity, ...flat } = npmReceipt(tool); return flat; };
function selectedEntries(id, name) {
  if (id === 'node') return name === 'node-v24.20.0-win-x64/node.exe' ? 'node.exe' : name === 'node-v24.20.0-win-x64/LICENSE' ? 'LICENSE' : null;
  if (id === 'codegraph') return name.startsWith('codegraph-win32-x64/lib/') ? name.slice('codegraph-win32-x64/'.length) : null;
  return name;
}

export async function createRuntimeManager({ root: target, transport = fetch } = {}) {
  await mkdir(target, { recursive: true }); const root = await canonicalFolder(target);
  // Only an exact operation-owned journal may recover a dead npm writer. Unknown locks remain
  // BUSY. A failed recovery is surfaced by npm inspection; other runtimes retain their contracts.
  let recoveryError;
  try { await recoverNpmOperation(root); } catch (error) { recoveryError = error; }
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
    if (id === 'npm') {
      try {
        if (recoveryError) throw recoveryError;
        if (await pendingNpmOperation(root)) fail('NPM_RECOVERY', 'La preparación de npm requiere recuperación.');
        const before = await readNpmSelection(root), tool = npmDistribution(before.value.active);
        const result = await inspectNpmSlot(tool, signal);
        if ((await readNpmSelection(root)).hash !== before.hash) fail('NPM_SELECTION_CHANGED', 'La selección cambió durante la verificación.');
        return { ...result, distribution: before.value.active, selectionGeneration: before.value.generation };
      } catch (error) {
        if (signal?.aborted) throw error;
        return { id, status:'requires-action', code:error.code ?? 'NPM_RECEIPT', message:error.message, action:error.action ?? 'Conserva los archivos y revisa la recuperación de npm.' };
      }
    }
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
        const current = await inspect(id, controls);
        const tool = id === 'npm' && current.distribution ? npmDistribution(current.distribution) : toolFor(id);
        tools.push({ id, name: tool.name, version: tool.version, license: tool.license, purpose: tool.purpose, source: tool.source,
          destination: path.join(root, slotName(tool)), downloadBytes: current.status === 'verified' ? 0 : tool.bytes, installedBytes: tool.installedBytes, status: current.status, action: current.action });
      }
      return { platform: RUNTIME_PLATFORM, tools, downloadBytes: tools.reduce((sum, t) => sum + t.downloadBytes, 0) };
    },
    async planRepair(id, controls = {}) {
      if (id === 'npm') {
        platform(); const selection = await readNpmSelection(root), tool = npmDistribution(selection.value.active), current = await inspect(id, controls);
        if (current.status !== 'requires-action') fail('REPAIR_NOT_NEEDED', 'Esta herramienta no necesita reparación.');
        if (recoveryError || await pendingNpmOperation(root)) fail('NPM_RECOVERY', 'Primero revisa la operación interrumpida de npm.');
        const slot = slotName(tool), content = (await snapshot(root, `${slot}/receipt.json`,65536)).content;
        checkNpmReceipt(content,tool);
        const review = await reviewCacheRepair(root,slot,npmRepairIdentity(tool),controls);
        if ((await readNpmSelection(root)).hash !== selection.hash) fail('PLAN_STALE', 'La selección cambió durante la revisión.');
        const handle=randomUUID();repairs.set(handle,{id,review,selectionHash:selection.hash,distribution:selection.value.active});if(repairs.size>10)repairs.delete(repairs.keys().next().value);
        return {id:handle,tool:id,name:tool.name,destination:path.join(root,slot),downloadBytes:tool.bytes,replacedBytes:review.bytes};
      }
      platform(); const tool = toolFor(id), current = await inspect(id, controls);
      if (current.status !== 'requires-action') fail('REPAIR_NOT_NEEDED', 'Esta herramienta no necesita reparación.');
      const review = await reviewCacheRepair(root, slotName(tool), { format: 1, id, version: tool.version, platform: RUNTIME_PLATFORM, treeHash: tool.treeHash, source: tool.source }, controls);
      const handle = randomUUID(); repairs.set(handle, { id, review }); if (repairs.size > 10) repairs.delete(repairs.keys().next().value);
      return { id: handle, tool: id, name: tool.name, destination: path.join(root, slotName(tool)), downloadBytes: tool.bytes, replacedBytes: review.bytes };
    },
    async repair(handle, controls = {}) {
      const plan = repairs.get(handle); if (!plan) fail('PLAN_UNKNOWN', 'Revisa de nuevo la reparación.');
      if (plan.id === 'npm') return withLock(root, async () => { repairs.delete(handle); return installNpm(controls,plan); });
      return withLock(root, async () => { repairs.delete(handle); return replaceReviewedCache(plan.review, () => installUnlocked(plan.id, controls), controls); });
    },
    async install(id, controls = {}) { return withLock(root, () => id === 'npm' ? installNpm(controls) : installUnlocked(id, controls)); },
    // Internal trusted-manager API, not exposed through renderer/IPC. A future compiled destination
    // still needs its own approval and payload gates; arbitrary identity objects/paths are rejected.
    async selectNpmDistribution(identity, { expectedGeneration, ...controls } = {}) {
      npmDistribution(identity);
      if (!Number.isSafeInteger(expectedGeneration) || expectedGeneration < 0) fail('NPM_GENERATION','Revisa la generación antes de cambiar la selección.');
      return withLock(root, () => installNpm(controls,null,{identity,expectedGeneration}));
    },
  };
  async function inspectNpmSlot(tool, signal) {
    const slot=slotName(tool), directory=await assertPath(root,slot);
    if (!await lstat(directory).catch(e=>{if(e.code!=='ENOENT')throw e;return null;}))return {id:'npm',status:'missing'};
    checkNpmReceipt((await snapshot(root,`${slot}/receipt.json`,65536)).content,tool);
    return {...await verifyPayload(await canonicalFolder(path.join(directory,'payload')),tool,signal),status:'verified'};
  }
  async function installNpm({signal,onProgress=()=>{}}={},repair=null,selectionRequest=null) {
    platform(); signal?.throwIfAborted(); if(recoveryError)throw recoveryError;
    if(await pendingNpmOperation(root))fail('NPM_RECOVERY','Primero revisa la operación interrumpida de npm.');
    const before=await readNpmSelection(root), identity=selectionRequest?.identity??before.value.active,tool=npmDistribution(identity),slot=slotName(tool);
    if(selectionRequest && before.value.generation!==selectionRequest.expectedGeneration)fail('NPM_GENERATION','La selección ya cambió; vuelve a revisarla.');
    if(repair && (repair.selectionHash!==before.hash || repair.distribution!==identity))fail('PLAN_STALE','La selección cambió desde la revisión de reparación.');
    let current;
    if(!repair)current=await inspectNpmSlot(tool,signal);
    if(current?.status==='verified'&&!selectionRequest)return {...current,distribution:identity,selectionGeneration:before.value.generation};
    let reviewed;
    if(repair) {
      reviewed=await reviewCacheRepair(root,slot,npmRepairIdentity(tool),{signal});
      if(reviewed.treeHash!==repair.review.treeHash||reviewed.receiptHash!==repair.review.receiptHash)fail('PLAN_STALE','La instalación cambió después de revisar su reparación.');
    }
    const operation=await beginNpmOperation(root,repair?'repair':selectionRequest?'select':'install',tool,before,reviewed?.treeHash??null);
    const stage=await assertPath(root,operation.stage),payload=path.join(stage,'payload'),destination=await assertPath(root,slot),quarantine=await assertPath(root,operation.quarantine);
    try {
      signal?.throwIfAborted();
      if(repair) {await rename(destination,quarantine);onProgress({stage:'npm-quarantined',label:'Conservando la instalación anterior'});}
      if(current?.status!=='verified') {
        await mkdir(stage);
        onProgress({stage:'runtime',label:`Preparando ${tool.name}`,completed:0,total:tool.bytes});
        if(npmIsPackaged())await extractZip(npmArchive,payload,{signal});
        else await cp(npmSource,payload,{recursive:true,force:false,errorOnExist:true,verbatimSymlinks:true,filter:()=>{signal?.throwIfAborted();return true;}});
        await verifyPayload(await canonicalFolder(payload),tool,signal);
        const ready=path.join(stage,'ready');await mkdir(ready);await rename(payload,path.join(ready,'payload'));
        await writeChecked(await canonicalFolder(ready),'receipt.json',json(npmReceipt(tool)),null,65536);
        signal?.throwIfAborted();
        if((await readNpmSelection(root)).hash!==before.hash)fail('NPM_SELECTION_CHANGED','La selección cambió durante la preparación.');
        if(await lstat(destination).catch(e=>{if(e.code!=='ENOENT')throw e;return null;}))fail('RUNTIME_CHANGED','La instalación cambió durante la preparación.');
        await rename(ready,destination);onProgress({stage:'npm-published',label:'Verificando la distribución preparada'});
      }
      const verified=await inspectNpmSlot(tool,signal);
      if(verified.status!=='verified')fail('RUNTIME_CHANGED','La distribución desapareció antes de confirmar su selección.');
      await commitNpmSelection(root,operation,signal,onProgress);
      await finishNpmOperation(root,operation);
      onProgress({stage:'npm-confirmed',label:'Selección verificada y registrada'});
      return {...verified,distribution:identity,selectionGeneration:before.value.generation+1,...(repair?{repaired:true,retainedQuarantine:operation.quarantine}:{})};
    } catch(error) {
      // Never discard originals or a published slot. Restore a proven unchanged quarantine only
      // into its absent slot; changed evidence remains for manual recovery.
      if(repair && !await lstat(destination).catch(e=>{if(e.code!=='ENOENT')throw e;return null;})) {
        if((await inspectTree(await canonicalFolder(quarantine))).sha256!==reviewed.treeHash)fail('NPM_RECOVERY','La cuarentena cambió; se conserva intacta.');
        await rename(quarantine,destination);
      }
      await rollbackNpmSelection(root,operation);
      await finishNpmOperation(root,operation);
      throw error;
    }
    // Stage and quarantine are retained. This avoids deleting unknown or concurrently changed
    // files, and lets a later explicit owned recovery account for every interrupted operation.
  }
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
