import { createHash } from 'node:crypto';
import { stat } from 'node:fs/promises';

import { DEFAULT_BLUEPRINT_ROOT } from './constants.mjs';
import { assertNoSymlinkEscape, readBoundedFile, resolveInside } from './paths.mjs';
import { DEFAULT_TOOL_CATALOG_PATH, runToolCatalog } from './tool-catalog.mjs';

export const FRESHNESS_DUE_SOON_DAYS = 30;
export const FRESHNESS_RECEIPT_MAX_AGE_DAYS = 180;
export const FRESHNESS_RECEIPT_MAX_BYTES = 16 * 1024;
export const FRESHNESS_CONFIG_MAX_BYTES = 256 * 1024;
export const GITHUB_PROJECT_RECEIPT_PATH = '.project-os/evidence/github-project.json';
export const PRODUCT_OS_CONFIG_PATH = '.project-os/github/product-os.json';

const DAY_MS = 24 * 60 * 60 * 1000;
const RECEIPT_KEYS = Object.freeze([
  'schemaVersion',
  'status',
  'optIn',
  'configHash',
  'issuedAt',
  'expiresAt',
  'source',
  'verification',
  'renewalCommand',
]);
const SAFE_GITHUB_PROJECT_COMMAND = /^gh project view ([1-9][0-9]{0,8}) --owner ([A-Za-z0-9-]{1,39}) --format json$/;
const SAFE_GITHUB_PROJECT_SOURCE = /^https:\/\/github\.com\/(?:users|orgs)\/([A-Za-z0-9-]{1,39})\/projects\/([1-9][0-9]{0,8})$/;
const SECRET_TEXT = /(?:\bBearer\s+\S+|gh[pousr]_[A-Za-z0-9]{16,}|github_pat_[A-Za-z0-9_]{16,}|sk-[A-Za-z0-9_-]{12,}|AKIA[0-9A-Z]{16}|\b(?:token|secret|password|api[_-]?key)\s*[=:]\s*\S+)/i;

function plainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && Object.getPrototypeOf(value) === Object.prototype;
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => (
      `${JSON.stringify(key)}:${stableJson(value[key])}`
    )).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function canonicalTimestamp(value) {
  if (typeof value !== 'string') return null;
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) return null;
  return new Date(milliseconds).toISOString() === value ? milliseconds : null;
}

function invalid(reason) {
  return { state: 'invalid', reason };
}

export function classifyGithubProjectReceipt(receipt, { now = new Date() } = {}) {
  if (!plainObject(receipt) || Object.keys(receipt).length !== RECEIPT_KEYS.length
    || RECEIPT_KEYS.some((key) => !Object.hasOwn(receipt, key))) {
    return invalid('El recibo no coincide con el esquema fijo de vigencia.');
  }
  if (receipt.schemaVersion !== '1.0.0' || receipt.status !== 'PASS' || receipt.optIn !== true) {
    return invalid('El recibo no declara un PASS opt-in compatible.');
  }
  if (typeof receipt.configHash !== 'string' || !/^[a-f0-9]{64}$/.test(receipt.configHash)) {
    return invalid('El hash de configuración no es SHA-256 canónico.');
  }
  const sourceMatch = typeof receipt.source === 'string'
    ? receipt.source.match(SAFE_GITHUB_PROJECT_SOURCE)
    : null;
  const commandMatch = typeof receipt.renewalCommand === 'string'
    ? receipt.renewalCommand.match(SAFE_GITHUB_PROJECT_COMMAND)
    : null;
  if (!sourceMatch) {
    return invalid('La fuente del recibo no es una URL de GitHub Project permitida.');
  }
  if (typeof receipt.verification !== 'string' || receipt.verification.trim() === ''
    || receipt.verification.length > 512
    || SECRET_TEXT.test(receipt.verification)) {
    return invalid('El detalle de verificación está vacío, excede el límite o parece contener un secreto.');
  }
  if (!commandMatch) {
    return invalid('El comando de renovación debe ser una vista fija y read-only de GitHub Project.');
  }
  if (sourceMatch[1] !== commandMatch[2] || sourceMatch[2] !== commandMatch[1]) {
    return invalid('La URL fuente y el comando de renovación deben referirse al mismo owner y Project.');
  }

  const issuedAt = canonicalTimestamp(receipt.issuedAt);
  const expiresAt = canonicalTimestamp(receipt.expiresAt);
  const nowMilliseconds = now instanceof Date ? now.getTime() : Date.parse(now);
  if (!Number.isFinite(nowMilliseconds)
    || issuedAt === null
    || expiresAt === null
    || issuedAt > nowMilliseconds
    || expiresAt <= issuedAt
    || expiresAt - issuedAt > FRESHNESS_RECEIPT_MAX_AGE_DAYS * DAY_MS) {
    return invalid('Las fechas deben ser UTC canónicas, no futuras y con vigencia máxima de 180 días.');
  }

  const remainingMilliseconds = expiresAt - nowMilliseconds;
  const daysRemaining = Math.ceil(remainingMilliseconds / DAY_MS);
  return {
    state: remainingMilliseconds <= 0
      ? 'stale'
      : remainingMilliseconds <= FRESHNESS_DUE_SOON_DAYS * DAY_MS
        ? 'due-soon'
        : 'fresh',
    issuedAt: receipt.issuedAt,
    expiresAt: receipt.expiresAt,
    daysRemaining,
    renewalCommand: receipt.renewalCommand,
  };
}

async function readGithubProjectReceipt(root, now) {
  const absolute = resolveInside(root, GITHUB_PROJECT_RECEIPT_PATH, 'recibo GitHub Project');
  try {
    await assertNoSymlinkEscape(root, GITHUB_PROJECT_RECEIPT_PATH);
    const bytes = await readBoundedFile(absolute, FRESHNESS_RECEIPT_MAX_BYTES, 'recibo GitHub Project');
    const raw = bytes.toString('utf8');
    let receipt;
    try {
      receipt = JSON.parse(raw);
    } catch {
      return { id: 'github.project', path: GITHUB_PROJECT_RECEIPT_PATH, ...invalid('El recibo no contiene JSON válido.') };
    }
    const lifecycle = classifyGithubProjectReceipt(receipt, { now });
    if (lifecycle.state === 'invalid') {
      return { id: 'github.project', path: GITHUB_PROJECT_RECEIPT_PATH, ...lifecycle };
    }
    const configHash = await readProductOsConfigHash(root);
    if (configHash.state !== 'valid' || receipt.configHash !== configHash.hash) {
      return {
        id: 'github.project',
        path: GITHUB_PROJECT_RECEIPT_PATH,
        ...lifecycle,
        state: 'invalid',
        reason: configHash.state === 'valid'
          ? 'El recibo no corresponde al manifiesto Product OS actual.'
          : 'No se pudo comprobar el hash contra el manifiesto Product OS actual.',
      };
    }
    return {
      id: 'github.project',
      path: GITHUB_PROJECT_RECEIPT_PATH,
      ...lifecycle,
    };
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return { id: 'github.project', path: GITHUB_PROJECT_RECEIPT_PATH, state: 'missing' };
    }
    const reason = error?.code === 'EVIDENCE_SIZE_LIMIT'
      ? 'El recibo supera el límite de 16 KiB.'
      : error?.code === 'EVIDENCE_NOT_REGULAR'
        ? 'La ruta no es un archivo regular.'
        : 'No se pudo leer el recibo de forma confinada.';
    return { id: 'github.project', path: GITHUB_PROJECT_RECEIPT_PATH, ...invalid(reason) };
  }
}

async function readProductOsConfigHash(root) {
  const absolute = resolveInside(root, PRODUCT_OS_CONFIG_PATH, 'manifiesto Product OS');
  await assertNoSymlinkEscape(root, PRODUCT_OS_CONFIG_PATH);
  let raw;
  try {
    raw = await readBoundedFile(absolute, FRESHNESS_CONFIG_MAX_BYTES, 'manifiesto Product OS');
  } catch (error) {
    if (error?.code === 'ENOENT') return { state: 'missing' };
    return { state: 'invalid' };
  }
  let config;
  try {
    config = JSON.parse(raw.toString('utf8'));
  } catch {
    return { state: 'invalid' };
  }
  if (!config) return { state: 'missing' };
  return { state: 'valid', hash: sha256(`${stableJson(config)}\n`) };
}

export async function runFreshness({ target, targetRoot, now = new Date() } = {}) {
  const root = targetRoot ?? target ?? process.cwd();
  let catalogRoot = root;
  let catalogPath = DEFAULT_TOOL_CATALOG_PATH;
  let catalogSource = 'target';
  try {
    await stat(resolveInside(root, DEFAULT_TOOL_CATALOG_PATH, 'catálogo de herramientas'));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    catalogRoot = DEFAULT_BLUEPRINT_ROOT;
    catalogPath = 'core/project-os/tool-catalog.json';
    catalogSource = 'blueprint-seed';
  }
  const catalog = await runToolCatalog({ targetRoot: catalogRoot, catalogPath, now });
  const receipt = await readGithubProjectReceipt(root, now);
  const pins = catalog.entries.map((entry) => ({
    id: entry.id,
    kind: entry.kind,
    declared: entry.declared,
    resolved: entry.resolved,
    stale: entry.stale,
    reason: entry.reason,
    unknowns: entry.unknowns,
  }));
  const structurallyValid = catalog.catalogValid && receipt.state !== 'invalid';

  return {
    command: 'freshness',
    status: structurallyValid ? 'PASS' : 'FAIL',
    summary: 'La frescura se informa; ningún dato se renueva automáticamente.',
    mutationPerformed: false,
    remoteAccess: false,
    catalogSource,
    toolCatalogFailures: catalog.catalogFailures,
    pins,
    receipts: [receipt],
    exitCode: structurallyValid ? 0 : 1,
  };
}

export function freshnessText(report) {
  const lines = [
    `[${report.status}] freshness`,
    'Mutación: no',
    'Acceso remoto: no',
    'Las fechas vencidas o próximas se informan; el comando no repara ni ejecuta renovaciones.',
    `Catálogo: ${report.catalogSource}`,
    `Decisiones del catálogo: ${report.pins.length}`,
  ];
  for (const pin of report.pins) {
    const state = pin.stale ? 'stale' : pin.resolved;
    lines.push(`- ${pin.id} [${pin.kind}] ${state}: ${pin.reason}`);
  }
  lines.push(`Recibos con vencimiento: ${report.receipts.length}`);
  for (const receipt of report.receipts) {
    lines.push(`- ${receipt.id}: ${receipt.state}`);
    if (receipt.expiresAt) lines.push(`  Vence: ${receipt.expiresAt} (${receipt.daysRemaining} días)`);
    if (receipt.renewalCommand) lines.push(`  Renovación manual (no ejecutada): ${receipt.renewalCommand}`);
    if (receipt.reason) lines.push(`  Causa: ${receipt.reason}`);
  }
  for (const failure of report.toolCatalogFailures) lines.push(`- Catálogo inválido: ${failure}`);
  return `${lines.join('\n')}\n`;
}

export const freshnessInternals = Object.freeze({
  canonicalTimestamp,
  readGithubProjectReceipt,
  safeGithubProjectCommand: (command) => SAFE_GITHUB_PROJECT_COMMAND.test(command),
});
