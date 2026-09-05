import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { lstat, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { ConstructorError } from '../errors.mjs';
import { stableStringify } from '../json.mjs';
import { normalizeRelativePath, resolveInside } from '../paths.mjs';
import { migrateOnboardingState } from '../onboarding.mjs';
import { sanitize } from '../debt/report.mjs';

export const REQUEST_PATH = '.project-os/tracker-request.json';
export const STATE_PATH = '.project-os/onboarding-state.json';
export const MAX_BYTES = 262144;
export const DAY = 86400000;
export const PROVIDERS = Object.freeze(Object.fromEntries(Object.entries({
  'github-projects': { read: ['read:project'], write: ['project'], credential: 'PROJECT_OS_GITHUB_TOKEN' },
  'azure-boards': { read: ['vso.project'], write: ['vso.project_manage'], credential: 'PROJECT_OS_AZURE_TOKEN' },
  jira: { read: ['read:jira-work'], write: ['manage:jira-configuration'], credential: 'PROJECT_OS_JIRA_TOKEN' },
}).map(([id, value]) => [id, Object.freeze({ ...value, read: Object.freeze(value.read), write: Object.freeze(value.write) })])));

export function fail(code, message) {
  throw new ConstructorError(`TRACKER_${code}`, message, {
    remediation: 'Revise el plan, la evidencia y el journal; reconcilie diferencias antes de autorizar otro intento.',
  });
}
export const hash = (value) => createHash('sha256').update(typeof value === 'string' ? value : stableStringify(value)).digest('hex');
export const same = (a, b) => stableStringify(a) === stableStringify(b);

export function keys(object, allowed, required = allowed) {
  if (!object || Array.isArray(object) || typeof object !== 'object'
    || Object.keys(object).some((key) => !allowed.includes(key))
    || required.some((key) => !Object.hasOwn(object, key))) fail('SCHEMA', 'El documento no cumple el contrato de campos.');
}
export function string(value, max = 200, pattern = null) {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u001f\u007f]/.test(value)
    || (pattern && !pattern.test(value))) fail('SCHEMA', 'Un valor de texto está vacío, fuera de límites o no es válido.');
  if (sanitize(value) !== value) fail('SENSITIVE', 'El texto parece contener una credencial; retírela antes de continuar.');
  return value;
}
export function description(value) {
  if (typeof value !== 'string' || value.length > 1000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) {
    fail('SCHEMA', 'La descripción excede los límites o contiene controles.');
  }
  if (sanitize(value) !== value) fail('SENSITIVE', 'La descripción parece contener una credencial; no se registra ni se envía.');
  return value;
}
export function validateRequest(request) {
  keys(request, ['schemaVersion', 'provider', 'action', 'connection', 'project', 'description', 'name', 'before'],
    ['schemaVersion', 'provider', 'action', 'connection']);
  if (request.schemaVersion !== 1 || !Object.hasOwn(PROVIDERS, request.provider)
    || !['create', 'configure', 'verify'].includes(request.action)) fail('SCHEMA', 'Versión, proveedor u operación no soportados.');
  const connection = request.connection;
  if (request.provider === 'github-projects') {
    keys(connection, ['owner', 'ownerType']);
    string(connection.owner, 100, /^[a-zA-Z0-9][a-zA-Z0-9-]*$/);
    if (!['user', 'organization'].includes(connection.ownerType)) fail('SCHEMA', 'Tipo de propietario GitHub inválido.');
    for (const value of [request.description, request.before?.description]) {
      if (typeof value === 'string' && value.length > 256) fail('SCHEMA', 'GitHub limita la descripción breve a 256 caracteres.');
    }
  } else if (request.provider === 'azure-boards') {
    keys(connection, ['organization']);
    string(connection.organization, 100, /^[a-zA-Z0-9][a-zA-Z0-9-]*$/);
  } else {
    keys(connection, ['site']);
    string(connection.site, 200, /^https:\/\/[a-z0-9][a-z0-9-]*\.atlassian\.net$/);
  }
  if (request.action === 'create') {
    if (request.provider !== 'github-projects' || request.project !== undefined || request.before !== undefined) {
      fail('UNSUPPORTED', 'Solo se crean proyectos GitHub privados; seleccione un proyecto existente en Azure/Jira.');
    }
    string(request.name, 100); description(request.description);
  } else {
    string(request.project, 100, /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/);
    if (request.name !== undefined) fail('SCHEMA', 'No se cambia el nombre del tracker existente.');
    if (request.action === 'configure') {
      description(request.description);
      keys(request.before, ['name', 'description']);
      string(request.before.name); description(request.before.description);
    } else if (request.before !== undefined || request.description !== undefined) {
      fail('SCHEMA', 'La verificación no admite cambios de configuración.');
    }
  }
  return request;
}

// Reject aliases, including links inside the target: locks and journals have one physical identity.
export async function safePath(root, relative) {
  const normalized = normalizeRelativePath(relative);
  let cursor = root;
  for (const part of normalized.split('/')) {
    cursor = path.join(cursor, part);
    try {
      if ((await lstat(cursor)).isSymbolicLink()) fail('SYMLINK', 'No se permiten enlaces en archivos del tracker.');
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return resolveInside(root, normalized);
}
export async function readDocument(root, relative, optional = false) {
  const file = await safePath(root, relative);
  try {
    const stats = await lstat(file);
    if (!stats.isFile() || stats.size > MAX_BYTES) fail('INPUT_LIMIT', 'El documento debe ser un archivo regular de hasta 256 KiB.');
    const raw = await readFile(file, 'utf8');
    if (Buffer.byteLength(raw) > MAX_BYTES) fail('INPUT_LIMIT', 'El documento excede 256 KiB.');
    let value;
    try { value = JSON.parse(raw.replace(/^\uFEFF/, '')); } catch { fail('JSON', 'El documento no contiene JSON válido.'); }
    return { value, hash: hash(raw) };
  } catch (error) {
    if (optional && error.code === 'ENOENT') return null;
    if (error instanceof ConstructorError) throw error;
    fail('INPUT_READ', 'No se pudo leer el documento del tracker.');
  }
}
export async function context(targetRoot, requestPath = REQUEST_PATH) {
  const root = await realpath(path.resolve(targetRoot));
  if (!(await lstat(root)).isDirectory()) fail('TARGET', 'Seleccione un directorio de proyecto.');
  const request = await readDocument(root, requestPath, true);
  const state = await readDocument(root, STATE_PATH, true);
  const canonical = state ? migrateOnboardingState(state.value) : null;
  let origin = '';
  try {
    origin = execFileSync('git', ['config', '--local', '--get', 'remote.origin.url'], {
      cwd: root, encoding: 'utf8', timeout: 5000, maxBuffer: 8192, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error) { if (error.status !== 1) fail('GIT_CONTEXT', 'No se pudo leer el origen Git local.'); }
  const github = /^(?:https:\/\/github\.com\/|git@github\.com:)[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\.git)?$/.test(origin);
  return { root, request: request?.value ?? null, tracker: canonical?.answers.tracker ?? 'unknown',
    remoteSetup: canonical?.answers.remoteSetup ?? 'unknown',
    github, evidence: canonical?.state?.evidence ?? [],
    sourceHash: hash({ request: request?.hash ?? null, state: state?.hash ?? null, origin }) };
}
export function operationsFor(request) {
  const scopes = PROVIDERS[request.provider];
  if (request.action === 'verify') return [{ id: 'project.verify', scopes: [...scopes.read], effect: 'read' }];
  return [
    ...(request.action === 'create' ? [{ id: 'project.create', scopes: [...scopes.write], effect: 'write' }] : []),
    { id: 'project.configure', scopes: [...scopes.write], effect: 'write' },
    { id: 'project.verify', scopes: [...scopes.read], effect: 'read' },
  ];
}
export async function planTracker({ targetRoot = '.', requestPath = REQUEST_PATH, createdAt = new Date().toISOString() } = {}) {
  const source = await context(targetRoot, requestPath);
  const requested = source.request ? validateRequest(source.request) : null;
  const detected = source.evidence.some((item) => item.category === 'tracker' && item.preservation === true);
  const pending = [];
  if (requested && source.remoteSetup === 'local-only') pending.push('El estado canónico limita el trabajo a local; confirme la revisión remota antes de continuar.');
  if (!requested) pending.push('Seleccione el tracker existente o confirme proveedor, recurso y operación en tracker-request.json.');
  if (requested?.action === 'create' && (source.tracker !== 'none' || detected)) {
    pending.push('La creación requiere ausencia confirmada de tracker en el estado canónico; preserve el tracker existente.');
  }
  if (requested && ['github-projects', 'azure-boards', 'jira'].includes(source.tracker)
    && source.tracker !== requested.provider) pending.push('El proveedor solicitado difiere del tracker canónico; no se migra automáticamente.');
  if (requested && ['defer', 'unknown', 'other'].includes(source.tracker)) pending.push('Confirme primero el tracker en el estado canónico.');
  const time = Date.parse(createdAt);
  if (!Number.isFinite(time)) fail('TIME', 'Fecha del plan inválida.');
  const plan = { schemaVersion: 1, targetRoot: source.root, requestPath: normalizeRelativePath(requestPath),
    sourceHash: source.sourceHash, createdAt: new Date(time).toISOString(), expiresAt: new Date(time + DAY).toISOString(),
    request: requested, status: pending.length ? 'needs-input' : 'ready', pending,
    suggestion: !requested && source.github && source.tracker === 'none' && !detected && source.remoteSetup === 'review-later' ? 'github-projects' : null,
    operations: requested ? operationsFor(requested) : [],
    dataSent: 'Identidad del proyecto, nombre y descripción aprobados; no se envía contenido del repositorio.',
    cost: 'No se compra ni activa un plan. El uso queda sujeto a la cuenta y términos del tracker elegido.',
    rollback: requested?.action === 'create' ? 'Eliminar solo el proyecto GitHub creado, todavía vacío y sin cambios.'
      : 'Restaurar solo la descripción escrita si conserva el valor del receipt; nunca eliminar un tracker existente.',
    credentialGrants: 'unverified; scopes describe the application request, not all permissions of the supplied credential',
    mutationPerformed: false };
  return { ...plan, digest: hash(plan) };
}
export function validatePlanIntegrity(plan) {
  if (!plan || typeof plan.digest !== 'string' || !/^[0-9a-f]{64}$/.test(plan.digest)) fail('PLAN', 'Digest de plan inválido.');
  const { digest, ...payload } = plan;
  if (hash(payload) !== digest || plan.schemaVersion !== 1 || !plan.request) fail('PLAN', 'El plan fue alterado o está incompleto.');
  validateRequest(plan.request);
  if (!same(plan.operations, operationsFor(plan.request))) fail('PLAN', 'Las operaciones no corresponden al contrato.');
}
export async function validateCurrentPlan(plan, targetRoot, now = Date.now()) {
  validatePlanIntegrity(plan);
  const created = Date.parse(plan.createdAt), expires = Date.parse(plan.expiresAt);
  if (!Number.isFinite(created) || expires - created !== DAY || created > now || expires <= now) fail('STALE', 'El plan ha vencido o tiene una fecha inválida.');
  const current = await planTracker({ targetRoot, requestPath: plan.requestPath, createdAt: plan.createdAt });
  if (!same(current, plan) || current.status !== 'ready') fail('CONTEXT', 'El contexto cambió o faltan decisiones confirmadas. Genere un nuevo plan.');
}
export function validateApproval(approval, plan, rollback = false, now = Date.now()) {
  keys(approval, ['schemaVersion', 'planDigest', 'actor', 'expiresAt', 'operations']);
  string(approval.actor, 100);
  const expiry = Date.parse(approval.expiresAt);
  if (approval.schemaVersion !== 1 || approval.planDigest !== plan.digest || !Number.isFinite(expiry)
    || expiry <= now || expiry > now + DAY) fail('APPROVAL', 'Aprobación ausente, obsoleta o vinculada a otro plan.');
  const wanted = rollback ? [{ id: 'project.rollback', scopes: PROVIDERS[plan.request.provider].write }]
    : plan.operations.map(({ id, scopes }) => ({ id, scopes }));
  if (!same(approval.operations, wanted)) fail('APPROVAL_SCOPE', 'La aprobación debe coincidir con cada operación y sus scopes exactos.');
}
