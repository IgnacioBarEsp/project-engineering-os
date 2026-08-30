import { readFile, stat } from 'node:fs/promises';

import { ConstructorError } from './errors.mjs';
import {
  assertNoSymlinkEscape,
  resolveInside,
} from './paths.mjs';

export const TOOL_CATALOG_SCHEMA_VERSION = '1.0.0';
export const TOOL_CATALOG_VERSION = '1.0.0';
export const DEFAULT_TOOL_CATALOG_PATH = '.project-os/tool-catalog.json';
export const MAX_TOOL_CATALOG_INPUT_BYTES = 256 * 1024;

const ENTRY_KINDS = Object.freeze(['cli', 'format', 'mcp', 'skill']);
const ENTRY_STATES = Object.freeze(['universal', 'conditional', 'rejected', 'postponed']);
const APPROVED_STATES = Object.freeze(['universal', 'conditional']);
const KNOWLEDGE_STATUSES = Object.freeze(['known', 'unknown']);
const REFERENCE_TYPES = Object.freeze(['commit', 'tag', 'version']);
const MCP_SIGNAL_IDS = Object.freeze([
  'configuration',
  'startup',
  'toolListing',
  'authenticatedSmoke',
]);

const IDENTIFIER = /^[a-z0-9][a-z0-9-]*$/;
const ISO_DATE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
const HTTPS_URL = /^https:\/\/\S+$/;
const ENV_REF = /^[A-Z][A-Z0-9_]*$/;
const COMMIT_REFERENCE = /^[0-9a-f]{40}$/;
const TAG_REFERENCE = /^v?[0-9]+\.[0-9]+\.[0-9]+(?:[-+][0-9A-Za-z.-]+)?$/;
const VERSION_REFERENCE = /^[0-9]+\.[0-9]+\.[0-9]+(?:[-+][0-9A-Za-z.-]+)?$/;
const URI_SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//;

const LITERAL_SECRET = new RegExp(
  [
    '\\b(?:Bearer\\s+[A-Za-z0-9._~+/=-]{8,}',
    'gh[pousr]_[A-Za-z0-9]{16,}',
    'sk-[A-Za-z0-9_-]{12,}',
    'AKIA[0-9A-Z]{16})\\b',
  ].join('|'),
);
const SECRET_ASSIGNMENT = /\b(?:api[_-]?key|password|secret|token|credential)\s*[=:]\s*([^\s,;]+)/i;
const ENV_REFERENCE_FORM = /^(?:\$\{?[A-Z][A-Z0-9_]*\}?|env:[A-Z][A-Z0-9_]*)$/;

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function nonEmptyStrings(value) {
  return Array.isArray(value)
    && value.length > 0
    && value.every((entry) => nonEmptyString(entry))
    && new Set(value).size === value.length;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function unexpectedKeys(value, allowed) {
  if (!isPlainObject(value)) return [];
  return Object.keys(value).filter((key) => !allowed.includes(key));
}

/**
 * A literal credential must never reach the catalogue. Only environment
 * references are acceptable where a credential is required.
 */
export function containsLiteralSecret(value, key = '') {
  if (Array.isArray(value)) {
    // `secretEnvRefs` holds variable names, not values, and the schema already
    // constrains each item. Blessing a bare uppercase token everywhere would
    // let an all-caps literal pass as if it were a variable name.
    if (key === 'secretEnvRefs') {
      return value.some((entry) => typeof entry !== 'string' || !ENV_REF.test(entry));
    }
    return value.some((entry) => containsLiteralSecret(entry, key));
  }
  if (isPlainObject(value)) {
    return Object.entries(value).some(
      ([childKey, child]) => containsLiteralSecret(child, childKey),
    );
  }
  if (typeof value !== 'string') return false;
  if (LITERAL_SECRET.test(value)) return true;
  const assignment = value.match(SECRET_ASSIGNMENT);
  if (assignment && !ENV_REFERENCE_FORM.test(assignment[1])) return true;
  if (!/(?:api.?key|password|secret|token|credential)/i.test(key)) return false;
  return !ENV_REFERENCE_FORM.test(value);
}

function referenceFailures(reference, prefix) {
  const failures = [];
  if (!isPlainObject(reference)) {
    failures.push(`${prefix}.reference debe ser un objeto`);
    return failures;
  }
  for (const key of unexpectedKeys(reference, ['type', 'value'])) {
    failures.push(`${prefix}.reference declara ${key} fuera del contrato`);
  }
  if (!REFERENCE_TYPES.includes(reference.type)) {
    failures.push(`${prefix}.reference.type debe ser commit, tag o version`);
    return failures;
  }
  if (!nonEmptyString(reference.value)) {
    failures.push(`${prefix}.reference.value es obligatorio`);
    return failures;
  }
  const pattern = {
    commit: COMMIT_REFERENCE,
    tag: TAG_REFERENCE,
    version: VERSION_REFERENCE,
  }[reference.type];
  if (!pattern.test(reference.value)) {
    failures.push(
      `${prefix}.reference.value no es una referencia exacta de tipo ${reference.type}`,
    );
  }
  return failures;
}

function provenanceFailures(provenance, prefix) {
  const failures = [];
  if (!isPlainObject(provenance)) {
    failures.push(`${prefix}.provenance debe ser un objeto o null`);
    return failures;
  }
  for (const key of unexpectedKeys(provenance, [
    'owner',
    'reference',
    'sourceUrl',
    'verifiedOn',
  ])) {
    failures.push(`${prefix}.provenance declara ${key} fuera del contrato`);
  }
  if (!nonEmptyString(provenance.owner)) {
    failures.push(`${prefix}.provenance.owner es obligatorio`);
  }
  if (!HTTPS_URL.test(provenance.sourceUrl ?? '')) {
    failures.push(`${prefix}.provenance.sourceUrl debe ser una URL https`);
  }
  if (!ISO_DATE.test(provenance.verifiedOn ?? '')) {
    failures.push(`${prefix}.provenance.verifiedOn debe usar el formato YYYY-MM-DD`);
  }
  failures.push(...referenceFailures(provenance.reference, prefix));
  return failures;
}

function licenseFailures(license, prefix) {
  const failures = [];
  if (!isPlainObject(license)) {
    failures.push(`${prefix}.license debe ser un objeto`);
    return failures;
  }
  for (const key of unexpectedKeys(license, ['status', 'spdx', 'note'])) {
    failures.push(`${prefix}.license declara ${key} fuera del contrato`);
  }
  if (!KNOWLEDGE_STATUSES.includes(license.status)) {
    failures.push(`${prefix}.license.status debe ser known o unknown`);
  }
  if (!Object.hasOwn(license, 'spdx')) {
    failures.push(`${prefix}.license.spdx debe declararse, aunque sea null`);
  }
  if (license.status === 'known' && !nonEmptyString(license.spdx)) {
    failures.push(`${prefix}.license declara status known sin identificador spdx`);
  }
  if (!nonEmptyString(license.note)) {
    failures.push(`${prefix}.license.note es obligatorio`);
  }
  return failures;
}

function costFailures(cost, prefix) {
  const failures = [];
  if (!isPlainObject(cost)) {
    failures.push(`${prefix}.cost debe ser un objeto`);
    return failures;
  }
  for (const key of unexpectedKeys(cost, ['status', 'posture', 'note'])) {
    failures.push(`${prefix}.cost declara ${key} fuera del contrato`);
  }
  if (!KNOWLEDGE_STATUSES.includes(cost.status)) {
    failures.push(`${prefix}.cost.status debe ser known o unknown`);
  }
  if (!['none', 'provider-plan', 'metered', 'unknown'].includes(cost.posture)) {
    failures.push(`${prefix}.cost.posture está fuera del vocabulario`);
  }
  if (cost.status === 'known' && cost.posture === 'unknown') {
    failures.push(`${prefix}.cost declara status known con posture unknown`);
  }
  if (!nonEmptyString(cost.note)) {
    failures.push(`${prefix}.cost.note es obligatorio`);
  }
  return failures;
}

function authFailures(auth, prefix) {
  const failures = [];
  if (!isPlainObject(auth)) {
    failures.push(`${prefix}.auth debe ser un objeto`);
    return failures;
  }
  for (const key of unexpectedKeys(auth, [
    'status',
    'required',
    'secretEnvRefs',
    'scopes',
    'note',
  ])) {
    failures.push(`${prefix}.auth declara ${key} fuera del contrato`);
  }
  if (!KNOWLEDGE_STATUSES.includes(auth.status)) {
    failures.push(`${prefix}.auth.status debe ser known o unknown`);
  }
  if (typeof auth.required !== 'boolean') {
    failures.push(`${prefix}.auth.required debe ser booleano`);
  }
  if (!Array.isArray(auth.secretEnvRefs)
    || auth.secretEnvRefs.some((ref) => !ENV_REF.test(ref ?? ''))) {
    failures.push(`${prefix}.auth.secretEnvRefs solo acepta referencias de entorno`);
  }
  if (!Array.isArray(auth.scopes) || auth.scopes.some((scope) => !nonEmptyString(scope))) {
    failures.push(`${prefix}.auth.scopes debe ser una lista de textos`);
  }
  if (!nonEmptyString(auth.note)) {
    failures.push(`${prefix}.auth.note es obligatorio`);
  }
  return failures;
}

function permissionsFailures(permissions, prefix) {
  const failures = [];
  if (!isPlainObject(permissions)) {
    failures.push(`${prefix}.permissions debe ser un objeto`);
    return failures;
  }
  for (const key of unexpectedKeys(permissions, [
    'filesystem',
    'network',
    'execution',
    'note',
  ])) {
    failures.push(`${prefix}.permissions declara ${key} fuera del contrato`);
  }
  if (!['none', 'read', 'write'].includes(permissions.filesystem)) {
    failures.push(`${prefix}.permissions.filesystem está fuera del vocabulario`);
  }
  if (!['none', 'outbound'].includes(permissions.network)) {
    failures.push(`${prefix}.permissions.network está fuera del vocabulario`);
  }
  if (!['none', 'scripts'].includes(permissions.execution)) {
    failures.push(`${prefix}.permissions.execution está fuera del vocabulario`);
  }
  if (!nonEmptyString(permissions.note)) {
    failures.push(`${prefix}.permissions.note es obligatorio`);
  }
  return failures;
}

function mcpSignalFailures(signal, prefix, id) {
  if (signal === 'not-verified') return [];
  if (!isPlainObject(signal)) {
    return [`${prefix}.mcp.${id} debe ser not-verified o un receipt fechado`];
  }
  const failures = [];
  for (const key of unexpectedKeys(signal, ['receipt', 'verifiedOn'])) {
    failures.push(`${prefix}.mcp.${id} declara ${key} fuera del contrato`);
  }
  if (!nonEmptyString(signal.receipt)) {
    failures.push(`${prefix}.mcp.${id} requiere un receipt`);
  }
  if (!ISO_DATE.test(signal.verifiedOn ?? '')) {
    failures.push(`${prefix}.mcp.${id} requiere verifiedOn con formato YYYY-MM-DD`);
  }
  return failures;
}

function mcpFailures(mcp, prefix) {
  const failures = [];
  if (!isPlainObject(mcp)) {
    failures.push(`${prefix}.mcp debe ser un objeto`);
    return failures;
  }
  for (const key of unexpectedKeys(mcp, ['enabled', ...MCP_SIGNAL_IDS])) {
    failures.push(`${prefix}.mcp declara ${key} fuera del contrato`);
  }
  if (mcp.enabled !== false) {
    failures.push(`${prefix}.mcp.enabled debe permanecer en false`);
  }
  for (const id of MCP_SIGNAL_IDS) {
    if (!Object.hasOwn(mcp, id)) {
      failures.push(`${prefix}.mcp.${id} debe declararse por separado`);
      continue;
    }
    failures.push(...mcpSignalFailures(mcp[id], prefix, id));
  }
  return failures;
}

function experimentalSignalsFailures(signals, prefix) {
  const failures = [];
  if (!isPlainObject(signals)) {
    failures.push(`${prefix}.experimentalSignals debe ser un objeto`);
    return failures;
  }
  for (const key of unexpectedKeys(signals, ['allowedTools'])) {
    failures.push(`${prefix}.experimentalSignals declara ${key} fuera del contrato`);
  }
  const allowedTools = signals.allowedTools;
  if (!isPlainObject(allowedTools)) {
    failures.push(`${prefix}.experimentalSignals.allowedTools debe ser un objeto`);
    return failures;
  }
  for (const key of unexpectedKeys(allowedTools, ['declared', 'portableBoundary'])) {
    failures.push(`${prefix}.experimentalSignals.allowedTools declara ${key} fuera del contrato`);
  }
  if (typeof allowedTools.declared !== 'boolean') {
    failures.push(`${prefix}.experimentalSignals.allowedTools.declared debe ser booleano`);
  }
  if (allowedTools.portableBoundary !== false) {
    failures.push(
      `${prefix}.experimentalSignals.allowedTools no puede declararse frontera portable`,
    );
  }
  return failures;
}

const ENTRY_KEYS = Object.freeze([
  'id',
  'kind',
  'state',
  'need',
  'condition',
  'stateReason',
  'provenance',
  'license',
  'cost',
  'auth',
  'data',
  'permissions',
  'maintenance',
  'rollback',
  'experimentalSignals',
  'mcp',
]);

const REQUIRED_ENTRY_KEYS = Object.freeze([
  'id',
  'kind',
  'state',
  'need',
  'provenance',
  'license',
  'cost',
  'auth',
  'data',
  'permissions',
  'maintenance',
  'rollback',
]);

export function entryFailures(entry, index = 0) {
  const prefix = `entries[${index}]`;
  const failures = [];
  if (!isPlainObject(entry)) {
    return [`${prefix} debe ser un objeto`];
  }
  for (const key of unexpectedKeys(entry, ENTRY_KEYS)) {
    failures.push(`${prefix} declara ${key} fuera del contrato`);
  }
  for (const key of REQUIRED_ENTRY_KEYS) {
    if (!Object.hasOwn(entry, key)) {
      failures.push(`${prefix}.${key} es obligatorio y su ausencia no equivale a unknown`);
    }
  }
  if (!IDENTIFIER.test(entry.id ?? '')) {
    failures.push(`${prefix}.id debe usar minúsculas y guiones`);
  }
  if (!ENTRY_KINDS.includes(entry.kind)) {
    failures.push(`${prefix}.kind está fuera del vocabulario`);
  }
  if (!ENTRY_STATES.includes(entry.state)) {
    failures.push(`${prefix}.state está fuera del vocabulario`);
  }
  if (!nonEmptyString(entry.need)) {
    failures.push(`${prefix}.need es obligatorio`);
  }
  if (!nonEmptyStrings(entry.data)) {
    failures.push(`${prefix}.data debe declarar qué se transmite`);
  }
  if (!nonEmptyString(entry.rollback)) {
    failures.push(`${prefix}.rollback es obligatorio`);
  }
  if (Object.hasOwn(entry, 'license')) {
    failures.push(...licenseFailures(entry.license, prefix));
  }
  if (Object.hasOwn(entry, 'cost')) {
    failures.push(...costFailures(entry.cost, prefix));
  }
  if (Object.hasOwn(entry, 'auth')) {
    failures.push(...authFailures(entry.auth, prefix));
  }
  if (Object.hasOwn(entry, 'permissions')) {
    failures.push(...permissionsFailures(entry.permissions, prefix));
  }
  if (isPlainObject(entry.maintenance)) {
    if (!['active', 'slow', 'unknown'].includes(entry.maintenance.status)) {
      failures.push(`${prefix}.maintenance.status está fuera del vocabulario`);
    }
    if (!nonEmptyString(entry.maintenance.note)) {
      failures.push(`${prefix}.maintenance.note es obligatorio`);
    }
  } else if (Object.hasOwn(entry, 'maintenance')) {
    failures.push(`${prefix}.maintenance debe ser un objeto`);
  }
  if (entry.provenance !== null && Object.hasOwn(entry, 'provenance')) {
    failures.push(...provenanceFailures(entry.provenance, prefix));
  }
  if (Object.hasOwn(entry, 'experimentalSignals')) {
    failures.push(...experimentalSignalsFailures(entry.experimentalSignals, prefix));
  }
  if (entry.kind === 'mcp' && !Object.hasOwn(entry, 'mcp')) {
    failures.push(`${prefix}.mcp es obligatorio para una entrada MCP`);
  }
  if (Object.hasOwn(entry, 'mcp')) {
    failures.push(...mcpFailures(entry.mcp, prefix));
  }

  const unknowns = declaredUnknowns(entry);
  if (unknowns.length > 0 && APPROVED_STATES.includes(entry.state)) {
    failures.push(
      `${prefix} declara ${unknowns.join(', ')} desconocido y no puede resolver ${entry.state}`,
    );
  }
  if (APPROVED_STATES.includes(entry.state) && !isPlainObject(entry.provenance)) {
    failures.push(`${prefix} en estado ${entry.state} exige procedencia fijada`);
  }
  if (entry.state === 'conditional' && !nonEmptyString(entry.condition)) {
    failures.push(`${prefix} en estado conditional exige declarar su condición`);
  }
  if (['rejected', 'postponed'].includes(entry.state) && !nonEmptyString(entry.stateReason)) {
    failures.push(`${prefix} en estado ${entry.state} exige stateReason`);
  }
  if (containsLiteralSecret(entry)) {
    failures.push(`${prefix} contiene un literal de secreto; use una referencia de entorno`);
  }
  return failures;
}

/**
 * Absence is a contract error; `unknown` is information. Only a declared
 * `unknown` reaches this list.
 */
export function declaredUnknowns(entry) {
  const unknowns = [];
  if (entry?.license?.status === 'unknown') unknowns.push('license');
  if (entry?.cost?.status === 'unknown') unknowns.push('cost');
  if (entry?.auth?.status === 'unknown') unknowns.push('auth');
  return unknowns;
}

const POLICY_CONTRACT = Object.freeze({
  registrationDoesNotActivate: true,
  evaluationIsReadOnly: true,
  evaluationAcceptsLocalPathsOnly: true,
  allowedToolsIsPortableBoundary: false,
  secrets: 'environment-references-only',
  installationRequiresSeparateApproval: true,
});

export function validateToolCatalog(catalog) {
  const failures = [];
  if (!isPlainObject(catalog)) {
    return { failures: ['El catálogo debe ser un objeto'], valid: false };
  }
  for (const key of unexpectedKeys(catalog, [
    'schemaVersion',
    'catalogVersion',
    'freshnessWindowDays',
    'policy',
    'entries',
  ])) {
    failures.push(`El catálogo declara ${key} fuera del contrato`);
  }
  if (catalog.schemaVersion !== TOOL_CATALOG_SCHEMA_VERSION) {
    failures.push(`schemaVersion debe ser ${TOOL_CATALOG_SCHEMA_VERSION}`);
  }
  if (catalog.catalogVersion !== TOOL_CATALOG_VERSION) {
    failures.push(`catalogVersion debe ser ${TOOL_CATALOG_VERSION}`);
  }
  if (!Number.isInteger(catalog.freshnessWindowDays)
    || catalog.freshnessWindowDays < 1
    || catalog.freshnessWindowDays > 3650) {
    failures.push('freshnessWindowDays debe ser un entero entre 1 y 3650');
  }
  if (!isPlainObject(catalog.policy)) {
    failures.push('policy debe ser un objeto');
  } else {
    for (const key of unexpectedKeys(catalog.policy, Object.keys(POLICY_CONTRACT))) {
      failures.push(`policy declara ${key} fuera del contrato`);
    }
    for (const [key, expected] of Object.entries(POLICY_CONTRACT)) {
      if (catalog.policy[key] !== expected) {
        failures.push(`policy.${key} debe ser ${JSON.stringify(expected)}`);
      }
    }
  }
  if (!Array.isArray(catalog.entries)) {
    failures.push('entries debe ser un array');
  } else {
    const seen = new Set();
    catalog.entries.forEach((entry, index) => {
      failures.push(...entryFailures(entry, index));
      if (isPlainObject(entry) && nonEmptyString(entry.id)) {
        if (seen.has(entry.id)) failures.push(`entries declara ${entry.id} más de una vez`);
        seen.add(entry.id);
      }
    });
  }
  return { failures, valid: failures.length === 0 };
}

function daysBetween(from, to) {
  const start = Date.parse(`${from}T00:00:00Z`);
  if (Number.isNaN(start)) return null;
  return Math.floor((to.getTime() - start) / 86400000);
}

/**
 * Resolves the state an entry may hold. A declared unknown can never resolve
 * as approved, so the entry falls back to `postponed`.
 */
export function resolveEntryState(entry, { freshnessWindowDays, now = new Date() } = {}) {
  const unknowns = declaredUnknowns(entry);
  if (unknowns.length > 0 && APPROVED_STATES.includes(entry?.state)) {
    return {
      reason: `Declara ${unknowns.join(', ')} desconocido; un dato desconocido no resuelve aprobado.`,
      resolved: 'postponed',
      stale: false,
      unknowns,
    };
  }
  let stale = false;
  let reason = 'La entrada conserva su estado declarado.';
  const verifiedOn = entry?.provenance?.verifiedOn ?? null;
  if (verifiedOn && Number.isInteger(freshnessWindowDays)) {
    const age = daysBetween(verifiedOn, now);
    if (age !== null && age > freshnessWindowDays) {
      stale = true;
      reason = `La verificación de ${verifiedOn} supera la ventana de ${freshnessWindowDays} días.`;
    }
  }
  return {
    reason,
    resolved: entry?.state ?? null,
    stale,
    unknowns,
  };
}

async function readLocalJson(root, relativePath, label) {
  const absolute = resolveInside(root, relativePath, label);
  await assertNoSymlinkEscape(root, relativePath);
  let stats;
  try {
    stats = await stat(absolute);
  } catch (error) {
    throw new ConstructorError(
      'TOOL_CATALOG_INPUT_MISSING',
      `No se encontró ${label} en ${relativePath}.`,
      {
        remediation: 'Ejecute bootstrap o sync para sembrar el catálogo, o indique una ruta local existente.',
        cause: error,
      },
    );
  }
  if (stats.size > MAX_TOOL_CATALOG_INPUT_BYTES) {
    throw new ConstructorError(
      'TOOL_CATALOG_INPUT_TOO_LARGE',
      `${label} supera ${MAX_TOOL_CATALOG_INPUT_BYTES} bytes.`,
      { remediation: 'Reduzca el archivo; el catálogo describe herramientas, no contenido investigado.' },
    );
  }
  const raw = await readFile(absolute, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new ConstructorError(
      'TOOL_CATALOG_INPUT_INVALID',
      `${label} no contiene JSON válido.`,
      { remediation: 'Corrija el JSON y vuelva a ejecutar; el comando no repara archivos.', cause: error },
    );
  }
}

/**
 * Investigated material is brought in by a person. Accepting a URL would turn
 * a read-only command into a fetcher of untrusted content.
 */
export function assertLocalCandidatePath(candidate) {
  if (!nonEmptyString(candidate)) {
    throw new ConstructorError(
      'TOOL_CATALOG_CANDIDATE_REQUIRED',
      'evaluate requiere --candidate con una ruta local.',
      { remediation: 'Indique la ruta de un archivo ya presente en el repositorio.' },
    );
  }
  if (URI_SCHEME.test(candidate)) {
    throw new ConstructorError(
      'TOOL_CATALOG_CANDIDATE_REMOTE',
      'evaluate no acepta una URL y no descarga contenido.',
      {
        remediation:
          'Revise el material en su origen, tráigalo al repositorio bajo su criterio y evalúe la copia local.',
      },
    );
  }
  return candidate;
}

export async function loadToolCatalog({ catalogPath = DEFAULT_TOOL_CATALOG_PATH, targetRoot }) {
  const catalog = await readLocalJson(targetRoot, catalogPath, 'el catálogo de herramientas');
  const { failures, valid } = validateToolCatalog(catalog);
  return { catalog, failures, path: catalogPath, valid };
}

export async function runToolCatalog(options) {
  const targetRoot = options.targetRoot ?? options.target ?? process.cwd();
  const action = options.subcommand ?? 'list';
  const now = options.now ?? new Date();
  if (!['list', 'evaluate'].includes(action)) {
    throw new ConstructorError(
      'TOOL_CATALOG_ACTION_UNKNOWN',
      `tool-catalog no reconoce la acción ${action}.`,
      { remediation: 'Use list o evaluate; ambas son read-only.' },
    );
  }

  const loaded = await loadToolCatalog({
    catalogPath: options.catalogPath ?? DEFAULT_TOOL_CATALOG_PATH,
    targetRoot,
  });
  const freshnessWindowDays = loaded.catalog?.freshnessWindowDays ?? null;

  if (action === 'list') {
    const entries = (Array.isArray(loaded.catalog?.entries) ? loaded.catalog.entries : []).map(
      (entry) => ({
        id: entry?.id ?? null,
        kind: entry?.kind ?? null,
        ...resolveEntryState(entry, { freshnessWindowDays, now }),
        declared: entry?.state ?? null,
      }),
    );
    return {
      action,
      catalogFailures: loaded.failures,
      catalogValid: loaded.valid,
      entries,
      mutationPerformed: false,
      status: loaded.valid ? 'PASS' : 'FAIL',
    };
  }

  const candidatePath = assertLocalCandidatePath(options.candidatePath);
  const candidate = await readLocalJson(targetRoot, candidatePath, 'la candidata');
  const failures = entryFailures(candidate, 0);
  const state = resolveEntryState(candidate, { freshnessWindowDays, now });
  const verdict = failures.length > 0 ? 'rejected' : state.resolved;
  return {
    action,
    candidate: {
      declared: candidate?.state ?? null,
      id: candidate?.id ?? null,
      kind: candidate?.kind ?? null,
      path: candidatePath,
    },
    catalogFailures: loaded.failures,
    catalogValid: loaded.valid,
    failures,
    mutationPerformed: false,
    reason: failures.length > 0
      ? 'La candidata no cumple el contrato; una entrada inválida no puede recomendarse.'
      : state.reason,
    stale: state.stale,
    status: failures.length > 0 ? 'FAIL' : 'PASS',
    unknowns: state.unknowns,
    verdict,
  };
}

export function toolCatalogText(result) {
  const lines = [
    `[${result.status}] tool-catalog ${result.action}`,
    'Mutación: no',
    'Descarga remota: no',
    `Catálogo: ${result.catalogValid ? 'válido' : 'inválido'}`,
  ];
  for (const failure of result.catalogFailures ?? []) {
    lines.push(`- ${failure}`);
  }
  if (result.action === 'list') {
    lines.push(`Entradas: ${result.entries.length}`);
    for (const entry of result.entries) {
      const stale = entry.stale ? ' (verificación vencida)' : '';
      const moved = entry.declared !== entry.resolved
        ? ` <- declarado ${entry.declared}`
        : '';
      lines.push(`- ${entry.id} [${entry.kind}] ${entry.resolved}${moved}${stale}`);
    }
    return `${lines.join('\n')}\n`;
  }
  lines.push(
    `Candidata: ${result.candidate.id ?? 'sin id'} (${result.candidate.path})`,
    `Veredicto: ${result.verdict ?? 'sin resolver'}`,
    `Motivo: ${result.reason}`,
  );
  if (result.unknowns.length > 0) {
    lines.push(`Desconocidos declarados: ${result.unknowns.join(', ')}`);
  }
  for (const failure of result.failures ?? []) {
    lines.push(`- ${failure}`);
  }
  return `${lines.join('\n')}\n`;
}
