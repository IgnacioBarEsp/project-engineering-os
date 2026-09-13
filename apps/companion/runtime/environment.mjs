import { randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, lstat, realpath, rm } from 'node:fs/promises';
import path from 'node:path';
import { assertPath, canonicalFolder, snapshot, writeChecked, json, hash, fail, withLock } from '../engine/files.mjs';
import { createToolchainStore, TOOLCHAIN } from './toolchain.mjs';
import { createCoreBridge } from './core-bridge.mjs';
import { isolatedEnvironment, runFixedProcess } from './process.mjs';

const RECEIPT = '.project-os/companion/environment.json';
const IDS = ['node', 'npm', 'git'];
const exists = absolute => lstat(absolute).catch(error => { if (error.code !== 'ENOENT') throw error; return null; });
const same = (a, b) => process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;

async function repositoryState(root) {
  const git = await assertPath(root, '.git'), stat = await exists(git);
  if (stat) {
    if (stat.isFile()) return { kind: 'existing', pointer: (await snapshot(root, '.git', 65536)).hash };
    if (!stat.isDirectory()) fail('GIT_UNSAFE', 'El historial del proyecto tiene un formato no admitido.');
    return { kind: 'existing', config: (await snapshot(root, '.git/config', 65536)).hash, head: (await snapshot(root, '.git/HEAD', 65536)).hash };
  }
  let ancestor = path.dirname(root);
  while (true) {
    if (await exists(path.join(ancestor, '.git'))) fail('GIT_NESTED_PROJECT', 'Esta carpeta pertenece a un repositorio que empieza más arriba.', 'Elige la carpeta raíz de ese repositorio para conservar su estructura.');
    const parent = path.dirname(ancestor); if (parent === ancestor) break; ancestor = parent;
  }
  return { kind: 'new' };
}

export function createEnvironmentEngine(manager) {
  const toolchains = createToolchainStore(manager), plans = new Map(), repairs = new Map();
  const verificationOperations = new WeakMap();
  // A receipt records the location it was prepared for. Moving or copying the folder keeps the
  // bytes valid but invalidates every absolute path the person already reviewed, so readiness is
  // refused until a new review. Planning still reads it, otherwise a moved project could never be
  // prepared again through the app.
  async function receipt(root, { allowRelocated = false } = {}) {
    const state = await snapshot(root, RECEIPT, 65536);
    if (!state.content) return { ...state, value: null };
    let value; try { value = JSON.parse(state.content); } catch { fail('ENVIRONMENT_RECEIPT', 'El registro del entorno no se puede leer.'); }
    if (value?.format !== 1 || typeof value.root !== 'string' || !['preparing', 'prepared', 'interrupted'].includes(value.state)) fail('ENVIRONMENT_RECEIPT', 'El registro no corresponde a este entorno.');
    if (value.root !== root) {
      if (!allowRelocated) fail('ENVIRONMENT_MOVED', 'Esta carpeta preparada cambió de ubicación.', 'Revisa y prepara de nuevo las herramientas para esta ruta antes de usarlas.');
      return { ...state, value, relocated: true };
    }
    return { ...state, value };
  }
  async function resolveEnvironment(target, controls = {}) {
    const root = await canonicalFolder(target); controls.signal?.throwIfAborted();
    // A single trusted user operation may plan, execute and verify several core steps. They
    // never modify these tool trees. Verify all bytes once within that operation, not once
    // per internal call. The next operation receives new controls and rechecks the trees.
    // This does not claim an OS lock against concurrent edits by another same-user process.
    let verified = verificationOperations.get(controls);
    if (!verified) { verified = new Map(); verificationOperations.set(controls, verified); }
    if (!verified.has(root)) verified.set(root, (async () => {
      const tools = {};
      for (const id of ['node', 'git']) {
        const result = await manager.inspect(id, controls);
        if (result.status !== 'verified') fail(result.code ?? 'ENVIRONMENT_MISSING', result.message ?? 'Primero prepara las herramientas de este proyecto.', result.action ?? 'Usa Preparar herramientas para continuar.');
        tools[id] = Object.freeze(result);
      }
      const toolchain = await toolchains.inspect(root, controls);
      if (toolchain.status !== 'verified') fail(toolchain.code ?? 'ENVIRONMENT_MISSING', toolchain.message ?? 'Faltan las herramientas aisladas del proyecto.', toolchain.action ?? 'Revisa la preparación de herramientas.');
      return Object.freeze({ ...tools, toolchain: Object.freeze(toolchain) });
    })());
    return verified.get(root);
  }
  const core = createCoreBridge({ runtimeRoot: manager.root, resolveEnvironment });
  return {
    core, manager, toolchains, resolveEnvironment,
    async planRepair(controls = {}) {
      const items = [], blocked = [];
      for (const id of ['node','npm','git','codegraph','engineering']) {
        const owner = id === 'engineering' ? toolchains : manager;
        const current = id === 'engineering' ? await toolchains.cacheStatus(controls) : await manager.inspect(id, controls);
        if (current.status !== 'requires-action') continue;
        try { items.push({ ...(id === 'engineering' ? await owner.planRepair(controls) : await owner.planRepair(id, controls)), owner }); }
        catch (error) { if (controls.signal?.aborted) throw error; blocked.push({ tool: id, message: error.message, action: error.action }); }
      }
      const id = items.length ? randomUUID() : null;
      if (id) { repairs.set(id, items); if (repairs.size > 10) repairs.delete(repairs.keys().next().value); }
      return { id, status: id ? 'planned' : 'requires-action', items: items.map(({ owner, id, ...item }) => item), blocked,
        downloadBytes: items.reduce((sum, item) => sum + item.downloadBytes, 0), message: id ? 'Solo se reemplazarán los caches administrados que aparecen en esta revisión.' : 'No hay un cache cuya reparación automática pueda autorizarse.' };
    },
    async repair(id, controls = {}) {
      const items = repairs.get(id); if (!items) fail('PLAN_UNKNOWN', 'Revisa de nuevo los caches antes de repararlos.');
      repairs.delete(id); const results = [];
      for (const item of items) { controls.signal?.throwIfAborted(); results.push(await item.owner.repair(item.id, controls)); }
      return { status: 'repaired', results };
    },
    async plan(target, controls = {}) {
      const root = await canonicalFolder(target), repo = await repositoryState(root), record = await receipt(root, { allowRelocated: true });
      const local = await toolchains.inspect(root, controls), runtime = await manager.plan(IDS, controls);
      const cache = local.status === 'verified' ? { status: 'verified', downloadBytes: 0 } : await toolchains.cacheStatus(controls);
      const blocked = [local, cache, ...runtime.tools].find(t => t.status === 'requires-action');
      if (blocked) return { id: null, status: 'requires-action', message: blocked.message ?? 'Hay una herramienta que necesita reparación.', action: blocked.action };
      const id = randomUUID(), fingerprint = hash(json({ repo, receipt: record.hash, toolchain: local.status }));
      plans.set(id, { root, repo, fingerprint }); if (plans.size > 20) plans.delete(plans.keys().next().value);
      return { id, status: 'planned', root, tools: runtime.tools, git: repo.kind === 'new' ? 'initialize-local' : 'preserve-existing',
        files: [{ path: TOOLCHAIN.relative, action: local.status === 'verified' ? 'unchanged' : 'create' }, { path: RECEIPT, action: record.content ? 'update' : 'create' }],
        engineering: { core: TOOLCHAIN.core, openspec: TOOLCHAIN.openspec, license: 'MIT / ISC', downloadBytes: cache.downloadBytes, installedBytes: TOOLCHAIN.bytes },
        downloadBytes: runtime.downloadBytes + cache.downloadBytes };
    },
    async apply(id, controls = {}) {
      const plan = plans.get(id); if (!plan) fail('PLAN_UNKNOWN', 'Revisa de nuevo las herramientas antes de prepararlas.');
      const root = await canonicalFolder(plan.root), repo = await repositoryState(root), record = await receipt(root, { allowRelocated: true }), local = await toolchains.inspect(root, controls);
      if (hash(json({ repo, receipt: record.hash, toolchain: local.status })) !== plan.fingerprint) fail('PLAN_STALE', 'La carpeta cambió después de revisar las herramientas.');
      plans.delete(id); controls.signal?.throwIfAborted();
      let recordHash = record.hash;
      const save = async (state, stage) => withLock(root, async () => {
        const content = json({ format: 1, root, state, stage, core: TOOLCHAIN.core, openspec: TOOLCHAIN.openspec });
        await writeChecked(root, RECEIPT, content, recordHash, 65536); recordHash = hash(content);
      });
      await save('preparing', 'runtimes');
      try {
        const tools = {}; for (const id of IDS) tools[id] = await manager.install(id, controls);
        controls.signal?.throwIfAborted();
        // Downloading can take time. Recheck repository identity before the first Git operation.
        if (json(await repositoryState(root)) !== json(repo)) fail('PLAN_STALE', 'El historial cambió durante la descarga.');
        const homeRoot = await assertPath(manager.root, 'operations'); await mkdir(homeRoot, { recursive: true });
        const home = await mkdtemp(path.join(homeRoot, 'git-'));
        try {
          const env = isolatedEnvironment({ home, pathEntries: [path.dirname(tools.node.entry), path.dirname(tools.git.entry)] });
          if (repo.kind === 'new') {
            const template = path.join(home, 'empty-template'); await mkdir(template);
            await withLock(root, async () => {
              if (json(await repositoryState(root)) !== json(repo)) fail('PLAN_STALE', 'El historial cambió antes de prepararlo.');
              await runFixedProcess({ executable: tools.git.entry, args: ['init', '--quiet', '--initial-branch=main', `--template=${template}`, '--', root], cwd: root, env, ...controls, timeoutMs: 15000 });
            });
          }
          const checked = await runFixedProcess({ executable: tools.git.entry, args: ['-C', root, 'rev-parse', '--show-toplevel'], cwd: root, env, ...controls, timeoutMs: 15000 });
          if (!same(await realpath(checked.stdout.trim()), root)) fail('GIT_NESTED_PROJECT', 'Elige la raíz del repositorio para preparar ingeniería.');
        } finally { await assertPath(manager.root, `operations/${path.basename(home)}`); await rm(home, { recursive: true, force: true }); }
        await save('preparing', 'toolchain');
        await toolchains.install(root, tools, controls);
        await save('prepared', 'tools');
        return { status: 'prepared', workflows: 'not-verified', core: TOOLCHAIN.core, openspec: TOOLCHAIN.openspec };
      } catch (error) {
        await save('interrupted', error.code ?? 'incomplete').catch(() => {});
        throw error;
      }
    },
    async verify(target, controls = {}) {
      const root = await canonicalFolder(target);
      try {
        const record = await receipt(root);
        if (!record.value) return { status: 'not-prepared', workflows: 'not-verified' };
        await resolveEnvironment(root, controls);
        // Verified bytes do not finish an operation the person interrupted: the remaining
        // stages never ran, so readiness stays refused until it is reviewed again.
        if (record.value.state !== 'prepared') return { status: 'requires-action', code: 'ENVIRONMENT_INTERRUPTED',
          message: 'La preparación de herramientas quedó incompleta.', action: 'Vuelve a revisar y preparar las herramientas para terminarla.', stage: record.value.stage };
        return { status: 'prepared', workflows: 'not-verified' };
      }
      catch (error) { if (controls.signal?.aborted) throw error; return { status: 'requires-action', code: error.code, message: error.message, action: error.action }; }
    },
    // This stage owns one record inside the project. The managed tools themselves live outside the folder and
    // are verified by the toolchain, not by a digest a list could compare.
    witnessPaths() { return [RECEIPT]; },
  };
}
