import { randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { assertPath, canonicalFolder, snapshot, writeChecked, json, hash, fail, withLock } from '../engine/files.mjs';
import { TOOLCHAIN, verifyToolchain } from './toolchain.mjs';
import { isolatedEnvironment, runFixedProcess } from './process.mjs';
import { AGENT_TOOL_PATHS, renderAgentTools } from './agent-tools.mjs';

const CONFIG = '.project-constructor/config.json', RECEIPT = '.project-os/companion/activation.json', JOURNAL = '.project-os/companion/activation-transaction.json';
const INPUTS = [CONFIG, '.project-constructor/openspec.mjs', '.project-constructor/toolchain.mjs', '.project-os/openspec-ownership.json', 'openspec/config.yaml'];
const SKILLS = ['apply-change', 'archive-change', 'explore', 'propose', 'sync-specs', 'update-change'];
const COMMANDS = ['apply', 'archive', 'explore', 'propose', 'sync', 'update'];
const OFFICIAL = new Set([
  ...['agents', 'claude', 'codex', 'cursor', 'github', 'opencode'].flatMap(tool => SKILLS.map(skill => `.${tool}/skills/openspec-${skill}/SKILL.md`)),
  ...COMMANDS.flatMap(command => [`.claude/commands/opsx/${command}.md`, `.cursor/commands/opsx-${command}.md`, `.github/prompts/opsx-${command}.prompt.md`, `.opencode/commands/opsx-${command}.md`]),
]);
const GENERATED = new Set([...OFFICIAL, ...AGENT_TOOL_PATHS]);
const FILE_LIMIT = 512 * 1024, JOURNAL_LIMIT = 8 * 1024 * 1024;
const digest = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const parse = state => { try { return JSON.parse(state.content); } catch { fail('ACTIVATION_INVALID', 'El registro de activación no se puede leer.'); } };
const text = bytes => { if (bytes === null) return null; try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { fail('ACTIVATION_ENCODING', 'Un archivo de instrucciones no tiene una codificación admitida.'); } };
const op = (relative, before, after) => ({ path: relative, before: text(before.content), beforeHash: before.hash, after, afterHash: hash(after) });
function validateReceipt(value, root) {
  if (value?.format !== 1 || value.rootHash !== hash(root) || value.toolchain !== TOOLCHAIN.treeHash || !Array.isArray(value.files)
    || !value.files.length || value.files.length > GENERATED.size || new Set(value.files.map(f => f.path)).size !== value.files.length
    || value.files.some(f => !GENERATED.has(f.path) || !digest(f.hash)) || !value.guards || typeof value.guards !== 'object'
    || Object.keys(value.guards).sort().join() !== [...INPUTS].sort().join() || Object.values(value.guards).some(v => !digest(v))) fail('ACTIVATION_INVALID', 'El registro no corresponde a la activación de este proyecto.');
  return value;
}
async function readReceipt(root) {
  const current = await snapshot(root, RECEIPT, FILE_LIMIT);
  return { current, value: current.content ? validateReceipt(parse(current), root) : null };
}
async function readJournal(root) {
  const current = await snapshot(root, JOURNAL, JOURNAL_LIMIT); if (!current.content) return { current, value: null };
  const value = parse(current);
  if (value?.format !== 1 || value.rootHash !== hash(root) || !['applying', 'interrupted', 'committed', 'rolled-back'].includes(value.status)
    || !/^[a-f0-9-]{36}$/.test(value.id ?? '') || !Array.isArray(value.operations) || value.operations.length < 3 || value.operations.length > GENERATED.size + 2
    || new Set(value.operations.map(o => o.path)).size !== value.operations.length
    || value.operations.some(o => ![CONFIG, RECEIPT].includes(o.path) && !GENERATED.has(o.path))) fail('ACTIVATION_JOURNAL', 'La recuperación de activación no es válida.');
  for (const operation of value.operations) {
    if ((operation.before === null ? operation.beforeHash !== null : typeof operation.before !== 'string' || hash(operation.before) !== operation.beforeHash || Buffer.byteLength(operation.before) > FILE_LIMIT)
      || typeof operation.after !== 'string' || Buffer.byteLength(operation.after) > FILE_LIMIT || hash(operation.after) !== operation.afterHash) fail('ACTIVATION_JOURNAL', 'Los archivos no coinciden con el registro de recuperación.');
  }
  const nextOperation = value.operations.find(o => o.path === RECEIPT), config = value.operations.find(o => o.path === CONFIG);
  if (!nextOperation || !config) fail('ACTIVATION_JOURNAL', 'Faltan partes de la activación guardada.');
  const next = validateReceipt(parse({ content: nextOperation.after }), root);
  if (next.guards[CONFIG] !== config.afterHash || next.files.length !== value.operations.length - 2
    || next.files.some(f => value.operations.find(o => o.path === f.path)?.afterHash !== f.hash)) fail('ACTIVATION_JOURNAL', 'La recuperación no coincide con los workflows revisados.');
  return { current, value };
}

// Only trusted construction-time adapters are injectable, so platform-neutral tests exercise
// the real journal/ownership logic without pretending to execute a Windows toolchain.
export function createActivationEngine(environment, staging = {}) {
  const plans = new Map(), core = environment.core;
  const renderTools = staging.renderAgentTools ?? renderAgentTools;
  const installStagingToolchain = staging.installToolchain ?? (async (project, verified, controls) => {
    await cp(verified.toolchain.root, path.join(project, TOOLCHAIN.relative), { recursive: true, force: false, errorOnExist: true, verbatimSymlinks: true, filter: () => { controls.signal?.throwIfAborted(); return true; } });
    await verifyToolchain(await canonicalFolder(path.join(project, TOOLCHAIN.relative)), controls);
  });
  const initializeStagingRepository = staging.initializeRepository ?? (async (project, home, verified, controls) => {
    await runFixedProcess({ executable: verified.git.entry, args: ['init', '--quiet', '--initial-branch=main', '--', project], cwd: home,
      env: isolatedEnvironment({ home, pathEntries: [path.dirname(verified.node.entry), path.dirname(verified.git.entry)] }), ...controls, timeoutMs: 15000 });
  });
  async function guards(root, next, configEither = []) {
    for (const relative of INPUTS) {
      const current = await snapshot(root, relative, FILE_LIMIT);
      const allowed = relative === CONFIG ? [next.guards[relative], ...configEither] : [next.guards[relative]];
      if (!allowed.includes(current.hash)) fail('ACTIVATION_STALE', 'Las instrucciones cambiaron después de revisar la activación.');
    }
  }
  async function synchronize(root, controls) {
    const plan = await core.runBootstrapOrSync({ command: 'sync', targetRoot: root, dryRun: true }, controls);
    if (plan.plan.summary.conflicts || plan.plan.operations.some(o => ['create', 'update', 'delete'].includes(o.operation))) fail('CONSTRUCTOR_DRIFT', 'Hay otros cambios de ingeniería que necesitan revisión antes de activar OpenSpec.');
    if (plan.status !== 'IN_SYNC') await core.runBootstrapOrSync({ command: 'sync', targetRoot: root }, controls);
  }
  async function saveJournal(root, value, beforeHash) {
    const content = json(value); await writeChecked(root, JOURNAL, content, beforeHash, JOURNAL_LIMIT); return hash(content);
  }
  async function run(root, journal, journalHash, controls = {}) {
    const next = validateReceipt(parse({ content: journal.operations.find(o => o.path === RECEIPT).after }), root);
    const config = journal.operations.find(o => o.path === CONFIG);
    await environment.resolveEnvironment(root, controls); await guards(root, next, [config.beforeHash]);
    for (const operation of journal.operations) if (![operation.beforeHash, operation.afterHash].includes((await snapshot(root, operation.path, FILE_LIMIT)).hash)) fail('RECOVERY_CONFLICT', 'Una edición posterior impide continuar la activación.');
    try {
      for (const [i, operation] of journal.operations.filter(o => o.path !== RECEIPT).entries()) {
        controls.signal?.throwIfAborted();
        if ((await snapshot(root, operation.path, FILE_LIMIT)).hash !== operation.afterHash) await writeChecked(root, operation.path, operation.after, operation.beforeHash, FILE_LIMIT);
        controls.onProgress?.({ stage: 'activation', label: 'Preparando tus instrucciones de desarrollo', completed: i + 1, total: journal.operations.length });
      }
      await synchronize(root, controls);
      const checked = await core.runOpsxCheck(root, controls);
      if (checked.status !== 'PASS') fail('OPSX_NOT_READY', 'La comprobación de OpenSpec encontró instrucciones pendientes.', 'Conserva el registro y revisa o continúa esta activación.');
      await guards(root, next);
      for (const file of next.files) if ((await snapshot(root, file.path, FILE_LIMIT)).hash !== file.hash) fail('ACTIVATION_STALE', 'Un workflow cambió durante la comprobación.');
      const receiptOperation = journal.operations.find(o => o.path === RECEIPT);
      if ((await snapshot(root, RECEIPT, FILE_LIMIT)).hash !== receiptOperation.afterHash) await writeChecked(root, RECEIPT, receiptOperation.after, receiptOperation.beforeHash, FILE_LIMIT);
      journal.status = 'committed'; await saveJournal(root, journal, journalHash);
      return { status: 'prepared', workflows: 'verified', files: next.files.length, transaction: journal.id };
    } catch (error) { journal.status = 'interrupted'; await saveJournal(root, journal, journalHash).catch(() => {}); throw error; }
  }
  return {
    async plan(target, controls = {}) {
      const root = await canonicalFolder(target), previous = await readReceipt(root), prior = await readJournal(root);
      if (['applying', 'interrupted'].includes(prior.value?.status)) fail('ACTIVATION_INTERRUPTED', 'Hay una activación interrumpida.', 'Continúa o deshaz esa activación antes de generar otra.');
      const verified = await environment.resolveEnvironment(root, controls), selection = await environment.toolchains.selection(root);
      const coreCheck = await core.runBootstrapOrSync({ command: 'sync', targetRoot: root, check: true }, controls);
      if (coreCheck.status !== 'IN_SYNC') fail('CONSTRUCTOR_DRIFT', 'Primero revisa y sincroniza las instrucciones de ingeniería.');
      const source = {}; for (const relative of INPUTS) {
        source[relative] = await snapshot(root, relative, FILE_LIMIT); if (!source[relative].content) fail('CONSTRUCTOR_MISSING', 'Faltan instrucciones del constructor para activar OpenSpec.');
      }
      if (source[CONFIG].hash !== selection.beforeHash) fail('PLAN_STALE', 'La configuración cambió durante la revisión de la activación.');
      const operationsRoot = await assertPath(environment.manager.root, 'operations'); await mkdir(operationsRoot, { recursive: true });
      const stage = await mkdtemp(path.join(operationsRoot, 'activation-')), project = path.join(stage, 'project'), home = path.join(stage, 'home');
      try {
        await mkdir(project); await mkdir(home); await mkdir(path.join(project, '.project-os'), { recursive: true });
        await installStagingToolchain(project, verified, controls);
        for (const relative of INPUTS) await writeChecked(await canonicalFolder(project), relative, relative === CONFIG ? json(selection.value) : source[relative].content, null, FILE_LIMIT);
        await initializeStagingRepository(project, home, verified, controls);
        controls.onProgress?.({ stage: 'activation', label: 'Revisando los workflows oficiales de OpenSpec' });
        await core.generate(project, controls); await core.runOpsxAdapt(project, controls);
        const stageCheck = await core.runOpsxCheck(project, controls);
        if (stageCheck.status !== 'PASS') fail('OPSX_NOT_READY', 'Los workflows generados no superaron la comprobación.');
        const agentTools = await renderTools(root, verified, environment.manager.root);
        for (const file of agentTools) {
          if (!AGENT_TOOL_PATHS.includes(file.path)) fail('TOOLS_PATH', 'Una entrada local no pertenece a Companion.');
          await writeChecked(await canonicalFolder(project), file.path, file.content, null, FILE_LIMIT);
        }
        const operations = [op(CONFIG, source[CONFIG], json(selection.value))], conflicts = [], files = [];
        for (const relative of [...GENERATED].sort()) {
          const generated = await snapshot(project, relative, FILE_LIMIT); if (!generated.content) continue;
          const current = await snapshot(root, relative, FILE_LIMIT), owned = previous.value?.files.find(f => f.path === relative);
          if (current.hash !== null && current.hash !== generated.hash && current.hash !== owned?.hash) { conflicts.push(relative); continue; }
          operations.push(op(relative, current, text(generated.content))); files.push({ path: relative, hash: generated.hash });
        }
        if (conflicts.length) return { id: null, status: 'conflict', conflicts, message: 'Ya existen workflows distintos en este proyecto.', action: 'Conserva tus instrucciones actuales y revisa su integración antes de regenerarlas.' };
        if (!files.some(f => OFFICIAL.has(f.path))) fail('OPSX_EMPTY', 'OpenSpec no produjo workflows verificables.');
        const next = { format: 1, rootHash: hash(root), toolchain: TOOLCHAIN.treeHash, files,
          guards: Object.fromEntries(INPUTS.map(p => [p, p === CONFIG ? hash(json(selection.value)) : source[p].hash])),
          generation: { package: '@fission-ai/openspec', version: '1.6.0', adapter: 'create-project-engineering-os@0.5.0', verification: 'PASS' } };
        operations.push(op(RECEIPT, previous.current, json(next)));
        const id = randomUUID(), journal = { format: 1, id: randomUUID(), rootHash: hash(root), status: 'applying', operations };
        if (Buffer.byteLength(json(journal)) > JOURNAL_LIMIT) fail('ACTIVATION_LIMIT', 'La activación supera el límite de recuperación.');
        plans.set(id, { root, journal, journalHash: prior.current.hash }); if (plans.size > 10) plans.delete(plans.keys().next().value);
        return { id, status: 'planned', files: operations.map(o => ({ path: o.path, action: o.beforeHash === o.afterHash ? 'unchanged' : o.beforeHash === null ? 'create' : 'update' })), official: 'OpenSpec 1.6.0', verifiedInStaging: true };
      } finally { await assertPath(environment.manager.root, `operations/${path.basename(stage)}`); await rm(stage, { recursive: true, force: true }); }
    },
    async apply(id, controls = {}) {
      const plan = plans.get(id); if (!plan) fail('PLAN_UNKNOWN', 'Revisa otra vez la activación.');
      return withLock(plan.root, async () => {
        for (const operation of plan.journal.operations) if ((await snapshot(plan.root, operation.path, FILE_LIMIT)).hash !== operation.beforeHash) fail('PLAN_STALE', 'Las instrucciones cambiaron después de la revisión.');
        if ((await snapshot(plan.root, JOURNAL, JOURNAL_LIMIT)).hash !== plan.journalHash) fail('PLAN_STALE', 'Otra activación cambió el proyecto.');
        controls.signal?.throwIfAborted();
        const journalHash = await saveJournal(plan.root, plan.journal, plan.journalHash); plans.delete(id);
        return run(plan.root, plan.journal, journalHash, controls);
      });
    },
    async resume(target, controls = {}) {
      const root = await canonicalFolder(target); return withLock(root, async () => {
        const journal = await readJournal(root);
        if (!['applying', 'interrupted'].includes(journal.value?.status)) fail('NOT_INTERRUPTED', 'No hay una activación interrumpida.');
        return run(root, journal.value, journal.current.hash, controls);
      });
    },
    async rollback(target, controls = {}) {
      const root = await canonicalFolder(target); return withLock(root, async () => {
        const journal = await readJournal(root); if (!journal.value || journal.value.status === 'rolled-back') return { status: 'unchanged' };
        for (const operation of journal.value.operations) if (![operation.beforeHash, operation.afterHash].includes((await snapshot(root, operation.path, FILE_LIMIT)).hash)) fail('RECOVERY_CONFLICT', 'Una edición posterior impide deshacer la activación.');
        await environment.resolveEnvironment(root, controls);
        for (const operation of [...journal.value.operations].reverse()) {
          if (operation.beforeHash !== operation.afterHash && (await snapshot(root, operation.path, FILE_LIMIT)).hash === operation.afterHash) await writeChecked(root, operation.path, operation.before, operation.afterHash, FILE_LIMIT);
        }
        await synchronize(root, controls); journal.value.status = 'rolled-back'; await saveJournal(root, journal.value, journal.current.hash);
        return { status: 'rolled-back' };
      });
    },
    async verify(target, controls = {}) {
      const root = await canonicalFolder(target), prior = await readJournal(root), receipt = await readReceipt(root);
      if (['applying', 'interrupted'].includes(prior.value?.status)) return { workflows: 'interrupted' };
      if (!receipt.value) return { workflows: 'not-verified' };
      await environment.resolveEnvironment(root, controls); await guards(root, receipt.value);
      for (const file of receipt.value.files) if ((await snapshot(root, file.path, FILE_LIMIT)).hash !== file.hash) return { workflows: 'stale', message: 'Cambió un workflow desde su activación.' };
      const checked = await core.runOpsxCheck(root, controls);
      return { workflows: checked.status === 'PASS' ? 'verified' : 'requires-action', files: receipt.value.files.length };
    },
    // Exactly the files `verify` compares one by one, plus the inputs it guards and its own two records.
    // Whoever records a verdict hashes these, so a stale workflow shows up on a list the same way it shows
    // up here.
    async witnessPaths(target) {
      const receipt = await readReceipt(await canonicalFolder(target));
      return [RECEIPT, JOURNAL, ...INPUTS, ...(receipt.value?.files ?? []).map(file => file.path)];
    },
  };
}
