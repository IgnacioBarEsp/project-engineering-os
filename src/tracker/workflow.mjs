import { mkdir, open, realpath, rename, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { stableStringify } from '../json.mjs';
import { createProvider } from './providers.mjs';
import { fail, hash, readDocument, safePath, same, validateApproval, validateCurrentPlan, validatePlanIntegrity } from './model.mjs';

const STORE = '.project-os/tracker-transactions';
const journalPath = (plan) => `${STORE}/${plan.digest}.json`;

async function save(root, plan, journal) {
  const destination = await safePath(root, journalPath(plan));
  const temporary = await safePath(root, `${STORE}/.${randomUUID()}.tmp`);
  const handle = await open(temporary, 'wx', 0o600);
  try {
    await handle.writeFile(stableStringify({ ...journal, checksum: hash(journal) }));
    await handle.sync();
  } finally { await handle.close(); }
  // If replacement fails, retain the old intent journal and the temporary file for diagnosis.
  await rename(temporary, destination);
}
async function load(root, plan) {
  const stored = await readDocument(root, journalPath(plan), true);
  if (!stored) return null;
  const { checksum, ...journal } = stored.value;
  if (checksum !== hash(journal) || journal.schemaVersion !== 1 || !same(journal.plan, plan)
    || journal.targetRoot !== root) fail('JOURNAL', 'El journal no coincide con el plan y su raíz.');
  return journal;
}
async function locked(root, task) {
  await mkdir(await safePath(root, STORE), { recursive: true });
  const lockPath = await safePath(root, `${STORE}/active.lock`);
  let handle;
  try { handle = await open(lockPath, 'wx', 0o600); }
  catch (error) { if (error.code === 'EEXIST') fail('LOCKED', 'Existe una operación activa o interrumpida. Compruebe su proceso antes de recuperar el lock.'); throw error; }
  try {
    await handle.writeFile(stableStringify({ pid: process.pid, startedAt: new Date().toISOString() }));
    await handle.sync();
    return await task();
  } finally {
    await handle.close();
    await unlink(lockPath);
  }
}
function configurationMatches(snapshot, request, expectedName = null) {
  return snapshot && (expectedName === null || snapshot.name === expectedName)
    && (request.action === 'verify' || snapshot.description === request.description)
    && (request.action !== 'create' || snapshot.visibility === 'private');
}
async function report(adapter, plan, id, expected = null) {
  const snapshot = id ? await adapter.read(id) : null;
  const configured = Boolean(configurationMatches(snapshot, plan.request, expected?.name
    ?? (plan.request.action === 'create' ? plan.request.name : null)));
  const drift = expected ? !same(snapshot, expected) : false;
  const smoke = snapshot ? await adapter.smoke(snapshot.id) : null;
  return { schemaVersion: 1, planDigest: plan.digest, status: snapshot && configured && !drift && smoke ? 'PASS' : 'FAIL',
    configuration: configured ? 'PASS' : 'FAIL', existence: snapshot ? 'PASS' : 'FAIL',
    smoke: smoke ? { status: 'PASS', kind: smoke } : { status: 'SKIP', kind: 'no-project' },
    drift, snapshot, credentialGrants: 'unverified', mutationPerformed: false };
}
async function verifyRoot(targetRoot, plan) {
  validatePlanIntegrity(plan);
  const root = await realpath(path.resolve(targetRoot));
  if (root !== plan.targetRoot) fail('TARGET', 'El plan pertenece a otro directorio.');
  return root;
}

export async function verifyTracker({ targetRoot = '.', plan }, dependencies = {}) {
  const root = await verifyRoot(targetRoot, plan);
  if (plan.status !== 'ready') fail('CONTEXT', 'El plan conserva decisiones pendientes.');
  const journal = await load(root, plan);
  const id = journal?.id ?? plan.request.project;
  if (!id) return { status: 'FAIL', configuration: 'UNVERIFIED', existence: 'UNVERIFIED',
    smoke: { status: 'SKIP', kind: 'no-identity' }, mutationPerformed: false,
    reconciliation: 'No hay identidad remota registrada. Inspeccione el catálogo; no repita la creación.' };
  const adapter = createProvider(plan.request, dependencies);
  const result = await report(adapter, plan, id, journal?.phase === 'rolled-back' ? null : journal?.after);
  return { ...result, journalPhase: journal?.phase ?? null,
    reconciliation: journal && !['applied', 'rolled-back'].includes(journal.phase) ? 'Hay un resultado incompleto. Conserve el journal y reconcilie antes de otro apply.' : null };
}

export async function applyTracker({ targetRoot = '.', plan, approval }, dependencies = {}) {
  await validateCurrentPlan(plan, targetRoot);
  validateApproval(approval, plan);
  const root = plan.targetRoot;
  if (plan.request.action === 'verify') return verifyTracker({ targetRoot, plan }, dependencies);
  return locked(root, async () => {
    // Revalidate after acquiring the lock: no source or approval change is covered by an earlier check.
    await validateCurrentPlan(plan, targetRoot);
    validateApproval(approval, plan);
    const existing = await load(root, plan);
    if (existing && existing.phase !== 'applied') fail('RECONCILE', 'El journal registra un intento incompleto o revertido; no se repiten mutaciones.');
    const adapter = createProvider(plan.request, dependencies);
    if (existing) return { ...await report(adapter, plan, existing.id, existing.after), replay: true, receipt: journalPath(plan) };
    const request = plan.request;
    const journal = { schemaVersion: 1, plan, targetRoot: root, actor: approval.actor,
      startedAt: new Date().toISOString(), phase: 'preflight', created: request.action === 'create' };
    if (journal.created) {
      const owner = await adapter.discover();
      journal.phase = 'create-intent'; await save(root, plan, journal);
      journal.id = await adapter.create(owner);
      journal.phase = 'created'; await save(root, plan, journal);
      journal.before = await adapter.read(journal.id);
      if (!journal.before || journal.before.name !== request.name || journal.before.items !== 0) fail('RECONCILE', 'El proyecto recién creado no coincide con el plan.');
    } else {
      journal.before = await adapter.read(request.project);
      if (!journal.before || !same({ name: journal.before.name, description: journal.before.description }, request.before)) {
        fail('REMOTE_DRIFT', 'La configuración remota cambió respecto a la precondición aprobada.');
      }
      journal.id = journal.before.id;
    }
    // Both branches re-read before writing; never mutate by a title or a caller-supplied remote URL.
    if (!same(await adapter.read(journal.id), journal.before)) fail('REMOTE_DRIFT', 'El recurso cambió durante la preparación.');
    journal.phase = 'configure-intent'; await save(root, plan, journal);
    await adapter.configure(journal.id, request.description, journal.created);
    journal.after = await adapter.read(journal.id);
    if (!configurationMatches(journal.after, request, journal.before.name)
      || (!journal.created && journal.after.structure !== journal.before.structure)) fail('REMOTE_DRIFT', 'La relectura no coincide con el cambio aprobado.');
    journal.phase = 'configured'; await save(root, plan, journal);
    const result = await report(adapter, plan, journal.id, journal.after);
    if (result.status !== 'PASS') fail('REMOTE_DRIFT', 'El smoke o la relectura detectaron un cambio.');
    journal.phase = 'applied'; journal.completedAt = new Date().toISOString(); await save(root, plan, journal);
    return { ...result, mutationPerformed: true, replay: false, receipt: journalPath(plan) };
  });
}

export async function rollbackTracker({ targetRoot = '.', plan, approval }, dependencies = {}) {
  const root = await verifyRoot(targetRoot, plan);
  validateApproval(approval, plan, true);
  return locked(root, async () => {
    const journal = await load(root, plan);
    if (!journal || !['applied', 'configured', 'rolled-back'].includes(journal.phase) || !journal.after) {
      fail('RECONCILE', 'No hay una escritura verificada atribuible a este receipt; inspeccione el resultado incierto.');
    }
    validateApproval(approval, plan, true);
    const adapter = createProvider(plan.request, dependencies);
    const current = await adapter.read(journal.id);
    if (journal.phase === 'rolled-back') {
      if (!same(current, journal.rollbackAfter)) fail('REMOTE_DRIFT', 'El recurso cambió después del rollback.');
      return { status: 'PASS', mutationPerformed: false, replay: true, receipt: journalPath(plan) };
    }
    if (!same(current, journal.after) || (journal.created && (plan.request.provider !== 'github-projects'
      || current.items !== 0 || current.name !== plan.request.name || current.visibility !== 'private'))) {
      fail('REMOTE_DRIFT', 'El recurso tiene cambios o contenido; rollback no sobrescribe ni elimina trabajo posterior.');
    }
    journal.phase = 'rollback-intent'; journal.rollbackActor = approval.actor; await save(root, plan, journal);
    if (journal.created) await adapter.remove(journal.id);
    else await adapter.configure(journal.id, journal.before.description);
    const after = await adapter.read(journal.id);
    if (journal.created ? after !== null : !after || after.description !== journal.before.description
      || after.name !== journal.before.name || after.structure !== journal.before.structure) {
      fail('REMOTE_UNCERTAIN', 'No se pudo confirmar el resultado del rollback.');
    }
    journal.rollbackAfter = after; journal.phase = 'rolled-back'; journal.rolledBackAt = new Date().toISOString();
    await save(root, plan, journal);
    return { status: 'PASS', mutationPerformed: true, replay: false, receipt: journalPath(plan) };
  });
}
