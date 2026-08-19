import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  lstat,
  opendir,
  readFile,
} from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import { ConstructorError } from './errors.mjs';
import { sha256Json } from './hash.mjs';
import { sortJson } from './json.mjs';
import {
  normalizeRelativePath,
  resolveInside,
} from './paths.mjs';

const execFileAsync = promisify(execFile);

export const ONBOARDING_SCHEMA_VERSION = '1.0.0';
export const ONBOARDING_CLASSIFIER_VERSION = '1.0.0';
export const ONBOARDING_STATE_FORMAT_VERSION = 1;
export const DEFAULT_ONBOARDING_STATE_PATH = '.project-os/onboarding-state.json';
export const DEFAULT_MAX_SCAN_DEPTH = 4;
export const DEFAULT_MAX_SCAN_ENTRIES = 2000;
export const MAX_ONBOARDING_INPUT_BYTES = 256 * 1024;

const UNKNOWN = 'unknown';
const DEFER = 'defer';
const EVIDENCE_CATEGORIES = new Set([
  'automation',
  'content',
  'git',
  'harness',
  'inspection',
  'remote',
  'tracker',
]);
const SAFE_EVIDENCE_DETAILS = new Set([
  'EACCES',
  'EBUSY',
  'EIO',
  'ELOOP',
  'EMFILE',
  'ENAMETOOLONG',
  'ENFILE',
  'ENOENT',
  'ENOMEM',
  'ENOTDIR',
  'EPERM',
  'azure-repos',
  'bitbucket',
  'changes-present',
  'directory-unreadable',
  'git-history-unverified',
  'git-metadata-unreadable',
  'git-status-unverified',
  'git-unavailable',
  'github',
  'gitlab',
  'other',
  'read-failed',
  'symlink-not-followed',
  'unverified',
]);

export const ONBOARDING_QUESTIONS = Object.freeze([
  Object.freeze({
    id: 'project',
    prompt: '¿La carpeta contiene un proyecto que debemos conservar o empezamos desde cero?',
    values: Object.freeze(['new', 'preserve', UNKNOWN, DEFER]),
  }),
  Object.freeze({
    id: 'guidance',
    prompt: '¿Prefieres explicación guiada o una ruta breve con revisión al final?',
    values: Object.freeze(['guided', 'brief', UNKNOWN, DEFER]),
  }),
  Object.freeze({
    id: 'tracker',
    prompt: '¿Tu equipo ya usa un tracker o quieres posponer la decisión?',
    values: Object.freeze([
      'existing',
      'github-projects',
      'azure-boards',
      'jira',
      'other',
      'none',
      UNKNOWN,
      DEFER,
    ]),
  }),
  Object.freeze({
    id: 'agent',
    prompt: '¿Qué agente usarás y cuál debe poder continuar el trabajo?',
    values: Object.freeze([
      'claude',
      'codex',
      'cursor',
      'copilot',
      'opencode',
      'other',
      UNKNOWN,
      DEFER,
    ]),
  }),
  Object.freeze({
    id: 'remoteSetup',
    prompt: '¿Preparamos solo un plan local o revisamos opciones remotas después?',
    values: Object.freeze(['local-only', 'review-later', UNKNOWN, DEFER]),
  }),
]);

export const ONBOARDING_ROUTES = Object.freeze([
  'beginner',
  'experienced-new',
  'brownfield',
]);

const QUESTION_MAP = new Map(ONBOARDING_QUESTIONS.map((question) => [question.id, question]));
const QUESTION_IDS = ONBOARDING_QUESTIONS.map((question) => question.id);
const INPUT_METADATA_KEYS = new Set(['schemaVersion']);
const STATE_V1_KEYS = new Set([
  'answers',
  'classifierVersion',
  'decisionStatus',
  'deferredDecisions',
  'evidence',
  'inputHash',
  'nextSteps',
  'pendingQuestions',
  'rebootstrapAllowed',
  'route',
  'schemaVersion',
  'stateFormatVersion',
]);
const STATE_V0_KEYS = new Set([
  'answers',
  'deferred',
  'pending',
  'profile',
  'signals',
  'stateFormatVersion',
]);

const SKIPPED_DIRECTORIES = new Set([
  '.cache',
  '.expo',
  '.git',
  '.next',
  '.parcel-cache',
  '.pnpm-store',
  '.project-constructor',
  '.turbo',
  '.venv',
  '.yarn',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
  'release',
  'target',
  'vendor',
  'venv',
]);

const MANIFEST_NAMES = new Set([
  'build.gradle',
  'build.gradle.kts',
  'cargo.toml',
  'composer.json',
  'deno.json',
  'deno.jsonc',
  'go.mod',
  'mix.exs',
  'package.json',
  'pom.xml',
  'pubspec.yaml',
  'pyproject.toml',
  'requirements.txt',
]);

const CODE_EXTENSIONS = new Set([
  '.c',
  '.cc',
  '.cpp',
  '.cs',
  '.dart',
  '.ex',
  '.exs',
  '.go',
  '.h',
  '.hpp',
  '.java',
  '.js',
  '.jsx',
  '.kt',
  '.kts',
  '.mjs',
  '.php',
  '.py',
  '.rb',
  '.rs',
  '.swift',
  '.ts',
  '.tsx',
  '.vue',
]);

const ROUTE_STEPS = Object.freeze({
  beginner: Object.freeze([
    'Explicar organización, evidencia y decisiones pendientes justo a tiempo.',
    'Preparar únicamente el entorno local aprobado.',
    'Continuar con discovery antes de elegir stack, arquitectura o CI/CD.',
  ]),
  'experienced-new': Object.freeze([
    'Revisar restricciones del entorno y decisiones operativas pendientes.',
    'Preparar el núcleo neutral sin elegir arquitectura de producto.',
    'Continuar con discovery y proponer opciones solo con contexto suficiente.',
  ]),
  brownfield: Object.freeze([
    'Inventariar y preservar archivos, herramientas, tracker y automatización existentes.',
    'Proponer únicamente gaps confirmados mediante un diff reversible.',
    'Continuar con discovery reutilizando hechos vigentes; no ejecutar rebootstrap ciego.',
  ]),
});

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && value.constructor === Object;
}

function assertExactKeys(value, allowed, code, label) {
  if (!isPlainObject(value)) {
    throw new ConstructorError(code, `${label} debe ser un objeto JSON.`, {
      remediation: `Use el schema versionado para ${label}.`,
    });
  }
  const unknown = Object.keys(value).filter((key) => !allowed.has(key));
  if (unknown.length > 0) {
    throw new ConstructorError(code, `${label} contiene campos no soportados.`, {
      details: `unknown-fields=${unknown.length}`,
      remediation: `Retire los campos desconocidos y valide ${label} contra su schema.`,
    });
  }
}

function assertStringArray(value, code, label, { knownValues = null } = {}) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new ConstructorError(code, `${label} debe ser una lista de strings.`, {
      remediation: `Restaure ${label} desde un estado versionado válido.`,
    });
  }
  if (new Set(value).size !== value.length) {
    throw new ConstructorError(code, `${label} contiene valores duplicados.`, {
      remediation: `Conserve una sola ocurrencia de cada valor en ${label}.`,
    });
  }
  if (knownValues && value.some((item) => !knownValues.has(item))) {
    throw new ConstructorError(code, `${label} contiene valores no soportados.`, {
      remediation: `Use únicamente IDs declarados por onboarding-plan.`,
    });
  }
}

function normalizedPath(value) {
  return value.split(path.sep).join('/');
}

function compareText(left, right) {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function comparableProjectPath(value) {
  const normalized = normalizedPath(value);
  return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
}

function sourceHash(raw) {
  return createHash('sha256').update(raw).digest('hex');
}

function uniqueSorted(values) {
  return [...new Set(values)].sort(compareText);
}

function normalizedEvidence(evidence) {
  return [...evidence]
    .map((item) => safeEvidence(item))
    .sort((left, right) => (
      compareText(left.id, right.id)
      || compareText(String(left.path ?? ''), String(right.path ?? ''))
    ));
}

function safeDetail(value) {
  if (value === undefined || value === null || value === '') return null;
  const detail = String(value).slice(0, 80);
  if (
    SAFE_EVIDENCE_DETAILS.has(detail)
    || /^max-(?:depth|entries)-[0-9]+$/.test(detail)
  ) {
    return detail;
  }
  return 'unverified';
}

function safeEvidence({ category, detail, id, path: relativePath, preservation }) {
  const canonicalDetail = safeDetail(detail);
  return sortJson({
    category,
    ...(canonicalDetail ? { detail: canonicalDetail } : {}),
    id,
    ...(relativePath ? { path: normalizedPath(relativePath) } : {}),
    preservation,
  });
}

function isHarnessPath(relativePath) {
  const lower = relativePath.toLowerCase();
  return lower === 'agents.md'
    || lower === 'claude.md'
    || lower === '.cursorrules'
    || lower === '.github/copilot-instructions.md'
    || lower.startsWith('.agents/skills/')
    || lower.startsWith('.claude/')
    || lower.startsWith('.codex/')
    || lower.startsWith('.cursor/rules/')
    || lower.startsWith('.opencode/');
}

function isTrackerPath(relativePath) {
  const lower = relativePath.toLowerCase();
  return lower === '.project-os/github/product-os.json'
    || lower === '.project-os/repository-governance.json'
    || lower.startsWith('.github/issue_template/')
    || lower.startsWith('.azuredevops/')
    || lower.startsWith('.jira/')
    || lower === 'jira.yml'
    || lower === 'jira.yaml';
}

function isAutomationPath(relativePath) {
  const lower = relativePath.toLowerCase();
  return lower.startsWith('.github/workflows/')
    || lower.startsWith('.circleci/')
    || lower === '.gitlab-ci.yml'
    || lower === 'azure-pipelines.yml'
    || lower === 'jenkinsfile'
    || lower === 'netlify.toml'
    || lower === 'vercel.json';
}

function isDocumentationPath(relativePath) {
  const lower = relativePath.toLowerCase();
  const name = path.posix.basename(lower);
  return name.startsWith('readme')
    || name.startsWith('contributing')
    || name.startsWith('changelog')
    || lower.startsWith('docs/') && lower.endsWith('.md')
    || lower.endsWith('.md');
}

function classifyFile(relativePath, addEvidence) {
  const lower = relativePath.toLowerCase();
  const name = path.posix.basename(lower);
  const extension = path.posix.extname(lower);

  if (isHarnessPath(relativePath)) {
    addEvidence(safeEvidence({
      category: 'harness',
      id: 'harness.instructions',
      path: relativePath,
      preservation: true,
    }));
  }
  if (isTrackerPath(relativePath)) {
    addEvidence(safeEvidence({
      category: 'tracker',
      id: 'tracker.configuration',
      path: relativePath,
      preservation: true,
    }));
  }
  if (isAutomationPath(relativePath)) {
    addEvidence(safeEvidence({
      category: 'automation',
      id: 'automation.configuration',
      path: relativePath,
      preservation: true,
    }));
  }
  if (MANIFEST_NAMES.has(name) || name.endsWith('.sln')) {
    addEvidence(safeEvidence({
      category: 'content',
      id: 'content.manifest',
      path: relativePath,
      preservation: true,
    }));
  }
  if (CODE_EXTENSIONS.has(extension)) {
    addEvidence(safeEvidence({
      category: 'content',
      id: 'content.code',
      path: relativePath,
      preservation: true,
    }));
  }
  if (isDocumentationPath(relativePath)) {
    addEvidence(safeEvidence({
      category: 'content',
      id: 'content.documentation',
      path: relativePath,
      preservation: true,
    }));
  }
}

async function targetRootStatus(targetRoot) {
  let stats;
  try {
    stats = await lstat(targetRoot);
  } catch (error) {
    throw new ConstructorError('ONBOARDING_TARGET_UNREADABLE', 'No se pudo inspeccionar el target.', {
      details: error?.code ?? 'read-failed',
      remediation: 'Compruebe que el target exista y permita lectura antes de reintentar.',
      cause: error,
    });
  }
  if (stats.isSymbolicLink()) {
    throw new ConstructorError(
      'ONBOARDING_TARGET_SYMLINK',
      'El target de onboarding no puede ser un symlink.',
      { remediation: 'Use la ruta real del directorio que desea inspeccionar.' },
    );
  }
  if (!stats.isDirectory()) {
    throw new ConstructorError('ONBOARDING_TARGET_NOT_DIRECTORY', 'El target no es un directorio.', {
      remediation: 'Seleccione una carpeta de proyecto.',
    });
  }
}

async function directoryHasEntries(absoluteDirectory) {
  const directory = await opendir(absoluteDirectory);
  try {
    return await directory.read() !== null;
  } finally {
    await directory.close();
  }
}

function gitProvider(remote) {
  const lower = remote.toLowerCase();
  if (lower.includes('github.com')) return 'github';
  if (lower.includes('dev.azure.com') || lower.includes('visualstudio.com')) return 'azure-repos';
  if (lower.includes('gitlab.com')) return 'gitlab';
  if (lower.includes('bitbucket.org')) return 'bitbucket';
  return 'other';
}

async function runGit(targetRoot, args) {
  return execFileAsync('git', [
    '-C',
    targetRoot,
    '-c',
    'core.fsmonitor=false',
    '-c',
    'core.untrackedCache=false',
    ...args,
  ], {
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_OPTIONAL_LOCKS: '0',
      GIT_TERMINAL_PROMPT: '0',
    },
    maxBuffer: 256 * 1024,
    timeout: 5000,
    windowsHide: true,
  });
}

function dirtyPaths(porcelain) {
  const records = porcelain.split('\0').filter(Boolean);
  const result = [];
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    const status = record.slice(0, 2);
    const current = record.slice(3);
    if (current) result.push(normalizedPath(current));
    if ((status.includes('R') || status.includes('C')) && records[index + 1]) {
      result.push(normalizedPath(records[index + 1]));
      index += 1;
    }
  }
  return result;
}

async function addGitEvidence({ addEvidence, ignoredPaths, targetRoot }) {
  const gitPath = path.join(targetRoot, '.git');
  let gitStats;
  try {
    gitStats = await lstat(gitPath);
  } catch (error) {
    if (error?.code === 'ENOENT') return;
    addEvidence(safeEvidence({
      category: 'inspection',
      detail: error?.code ?? 'git-metadata-unreadable',
      id: 'inspection.git-metadata',
      path: '.git',
      preservation: true,
    }));
    return;
  }

  if (gitStats.isSymbolicLink()) {
    addEvidence(safeEvidence({
      category: 'inspection',
      detail: 'symlink-not-followed',
      id: 'inspection.git-symlink',
      path: '.git',
      preservation: true,
    }));
    return;
  }

  addEvidence(safeEvidence({
    category: 'git',
    id: 'git.repository',
    path: '.git',
    preservation: false,
  }));

  try {
    await runGit(targetRoot, ['rev-parse', '--verify', 'HEAD']);
    addEvidence(safeEvidence({
      category: 'git',
      id: 'git.history',
      path: '.git',
      preservation: true,
    }));
  } catch (error) {
    if (!['128', 128].includes(error?.code)) {
      addEvidence(safeEvidence({
        category: 'inspection',
        detail: error?.code === 'ENOENT' ? 'git-unavailable' : 'git-history-unverified',
        id: 'inspection.git',
        path: '.git',
        preservation: true,
      }));
      return;
    }
  }

  try {
    const { stdout } = await runGit(targetRoot, [
      'status',
      '--porcelain=v1',
      '-z',
      '--ignore-submodules=all',
      '--untracked-files=all',
    ]);
    const comparableIgnored = new Set([...ignoredPaths].map(comparableProjectPath));
    const meaningful = dirtyPaths(stdout)
      .filter((relativePath) => !comparableIgnored.has(comparableProjectPath(relativePath)));
    if (meaningful.length > 0) {
      addEvidence(safeEvidence({
        category: 'git',
        detail: 'changes-present',
        id: 'git.working-tree',
        preservation: true,
      }));
    }
  } catch (error) {
    addEvidence(safeEvidence({
      category: 'inspection',
      detail: error?.code === 'ENOENT' ? 'git-unavailable' : 'git-status-unverified',
      id: 'inspection.git-status',
      path: '.git',
      preservation: true,
    }));
  }

  try {
    const { stdout } = await runGit(targetRoot, ['remote', 'get-url', 'origin']);
    if (stdout.trim()) {
      addEvidence(safeEvidence({
        category: 'remote',
        detail: gitProvider(stdout.trim()),
        id: 'remote.provider',
        preservation: false,
      }));
    }
  } catch {
    // A repository without origin is valid and requires no warning.
  }
}

export async function inspectOnboardingTarget({
  ignoredPaths = [],
  maxDepth = DEFAULT_MAX_SCAN_DEPTH,
  maxEntries = DEFAULT_MAX_SCAN_ENTRIES,
  targetRoot,
}) {
  if (!Number.isInteger(maxDepth) || maxDepth < 0 || !Number.isInteger(maxEntries) || maxEntries < 1) {
    throw new ConstructorError('ONBOARDING_SCAN_LIMIT_INVALID', 'Los límites del scanner no son válidos.', {
      remediation: 'Use enteros positivos para entries y un depth mayor o igual a cero.',
    });
  }
  const root = path.resolve(targetRoot);
  await targetRootStatus(root);
  const ignored = new Set(ignoredPaths.map((item) => normalizeRelativePath(item)));
  const evidenceById = new Map();
  const warnings = [];
  let scannedEntries = 0;
  let stopped = false;

  const addEvidence = (record) => {
    if (!evidenceById.has(record.id)) evidenceById.set(record.id, record);
  };

  const recordIncomplete = ({ detail, id, relativePath }) => {
    const canonicalDetail = safeDetail(detail) ?? 'unverified';
    const warning = sortJson({
      detail: canonicalDetail,
      id,
      ...(relativePath ? { path: normalizedPath(relativePath) } : {}),
    });
    warnings.push(warning);
    addEvidence(safeEvidence({
      category: 'inspection',
      detail: warning.detail,
      id,
      path: warning.path,
      preservation: true,
    }));
  };

  const walk = async (relativeDirectory, depth) => {
    if (stopped) return;
    const absoluteDirectory = relativeDirectory
      ? resolveInside(root, relativeDirectory)
      : root;
    let entries = [];
    try {
      const directory = await opendir(absoluteDirectory);
      const remaining = maxEntries - scannedEntries;
      for await (const entry of directory) {
        entries.push(entry);
        if (entries.length > remaining) {
          stopped = true;
          scannedEntries = maxEntries + 1;
          recordIncomplete({
            detail: `max-entries-${maxEntries}`,
            id: 'inspection.entry-limit',
            relativePath: relativeDirectory || undefined,
          });
          return;
        }
      }
    } catch (error) {
      recordIncomplete({
        detail: error?.code ?? 'directory-unreadable',
        id: 'inspection.directory-unreadable',
        relativePath: relativeDirectory || undefined,
      });
      return;
    }
    entries.sort((left, right) => compareText(left.name, right.name));

    for (const entry of entries) {
      scannedEntries += 1;
      const relativePath = normalizedPath(path.join(relativeDirectory, entry.name));
      if (ignored.has(relativePath)) continue;
      const absolutePath = resolveInside(root, relativePath);
      let entryStats;
      try {
        entryStats = await lstat(absolutePath);
      } catch (error) {
        recordIncomplete({
          detail: error?.code ?? 'entry-unreadable',
          id: 'inspection.entry-unreadable',
          relativePath,
        });
        continue;
      }
      if (entry.isSymbolicLink() || entryStats.isSymbolicLink()) {
        recordIncomplete({
          detail: 'symlink-not-followed',
          id: 'inspection.symlink',
          relativePath,
        });
        continue;
      }
      if (entryStats.isFile()) {
        classifyFile(relativePath, addEvidence);
        continue;
      }
      if (!entryStats.isDirectory()) {
        recordIncomplete({
          detail: 'unverified',
          id: 'inspection.special-entry',
          relativePath,
        });
        continue;
      }
      if (SKIPPED_DIRECTORIES.has(entry.name.toLowerCase())) continue;
      if (depth >= maxDepth) {
        try {
          if (await directoryHasEntries(resolveInside(root, relativePath))) {
            recordIncomplete({
              detail: `max-depth-${maxDepth}`,
              id: 'inspection.depth-limit',
              relativePath,
            });
          }
        } catch (error) {
          recordIncomplete({
            detail: error?.code ?? 'directory-unreadable',
            id: 'inspection.directory-unreadable',
            relativePath,
          });
        }
        continue;
      }
      await walk(relativePath, depth + 1);
      if (stopped) return;
    }
  };

  await walk('', 0);
  await addGitEvidence({ addEvidence, ignoredPaths: ignored, targetRoot: root });

  return sortJson({
    complete: warnings.length === 0,
    evidence: normalizedEvidence(evidenceById.values()),
    limits: {
      maxDepth,
      maxEntries,
    },
    scannedEntries,
    warnings: warnings.sort((left, right) => (
      compareText(left.id, right.id)
      || compareText(String(left.path ?? ''), String(right.path ?? ''))
    )),
  });
}

function validateAnswerEntries(rawAnswers, { partial = true } = {}) {
  const allowed = new Set([...QUESTION_IDS, ...INPUT_METADATA_KEYS]);
  assertExactKeys(rawAnswers, allowed, 'ONBOARDING_ANSWERS_INVALID', 'onboarding answers');
  if (
    Object.hasOwn(rawAnswers, 'schemaVersion')
    && rawAnswers.schemaVersion !== ONBOARDING_SCHEMA_VERSION
  ) {
    throw new ConstructorError(
      'ONBOARDING_ANSWERS_VERSION_UNSUPPORTED',
      'La versión de onboarding answers no está soportada.',
      { remediation: `Use schemaVersion ${ONBOARDING_SCHEMA_VERSION}.` },
    );
  }

  const result = {};
  for (const question of ONBOARDING_QUESTIONS) {
    if (!Object.hasOwn(rawAnswers, question.id)) {
      if (!partial) result[question.id] = UNKNOWN;
      continue;
    }
    const value = rawAnswers[question.id];
    if (!question.values.includes(value)) {
      throw new ConstructorError(
        'ONBOARDING_ANSWERS_INVALID',
        `Respuesta no soportada para ${question.id}.`,
        {
          details: `permitidas=${question.values.join(', ')}`,
          remediation: 'Corrija el archivo usando schema/onboarding-answers.schema.json.',
        },
      );
    }
    result[question.id] = value;
  }
  return sortJson(result);
}

export function normalizeOnboardingAnswers(rawAnswers = {}) {
  const partial = validateAnswerEntries(rawAnswers);
  return sortJson(Object.fromEntries(
    QUESTION_IDS.map((id) => [id, partial[id] ?? UNKNOWN]),
  ));
}

function validateEvidenceList(evidence) {
  if (!Array.isArray(evidence)) {
    throw new ConstructorError('ONBOARDING_STATE_INVALID', 'El estado v1 no declara evidence válido.', {
      remediation: 'Restaure el estado desde una salida JSON completa de onboarding-plan.',
    });
  }
  const ids = new Set();
  for (const record of evidence) {
    const allowed = new Set(['category', 'detail', 'id', 'path', 'preservation']);
    assertExactKeys(record, allowed, 'ONBOARDING_STATE_INVALID', 'evidence');
    if (
      typeof record.id !== 'string'
      || !/^[a-z0-9][a-z0-9.-]*$/.test(record.id)
      || !EVIDENCE_CATEGORIES.has(record.category)
      || typeof record.preservation !== 'boolean'
      || (record.path !== undefined && typeof record.path !== 'string')
      || (
        record.detail !== undefined
        && (typeof record.detail !== 'string' || record.detail.length < 1 || record.detail.length > 80)
      )
    ) {
      throw new ConstructorError('ONBOARDING_STATE_INVALID', 'El estado v1 contiene evidence inválido.', {
        remediation: 'Restaure el estado desde una salida JSON completa de onboarding-plan.',
      });
    }
    if (record.path !== undefined) normalizeRelativePath(record.path, 'evidence.path');
    if (ids.has(record.id)) {
      throw new ConstructorError('ONBOARDING_STATE_INVALID', 'Evidence contiene IDs duplicados.', {
        remediation: 'Conserve una sola señal por ID y vuelva a clasificar.',
      });
    }
    ids.add(record.id);
  }
}

function validateStateV1(rawState) {
  assertExactKeys(rawState, STATE_V1_KEYS, 'ONBOARDING_STATE_INVALID', 'onboarding state v1');
  if (
    rawState.schemaVersion !== ONBOARDING_SCHEMA_VERSION
    || rawState.classifierVersion !== ONBOARDING_CLASSIFIER_VERSION
    || !ONBOARDING_ROUTES.includes(rawState.route)
    || !['confirmed', 'provisional'].includes(rawState.decisionStatus)
    || typeof rawState.rebootstrapAllowed !== 'boolean'
    || !/^[a-f0-9]{64}$/.test(rawState.inputHash ?? '')
  ) {
    throw new ConstructorError('ONBOARDING_STATE_INVALID', 'El estado v1 no cumple su contrato.', {
      remediation: 'Valide el archivo con schema/onboarding-state.schema.json o restaure una copia anterior.',
    });
  }
  if (
    !isPlainObject(rawState.answers)
    || QUESTION_IDS.some((id) => !Object.hasOwn(rawState.answers, id))
    || Object.keys(rawState.answers).some((id) => !QUESTION_MAP.has(id))
  ) {
    throw new ConstructorError('ONBOARDING_STATE_INVALID', 'El estado v1 no contiene las cinco respuestas.', {
      remediation: 'Restaure el estado desde una salida JSON completa de onboarding-plan.',
    });
  }
  const answers = normalizeOnboardingAnswers(rawState.answers);
  validateEvidenceList(rawState.evidence);
  const questionIds = new Set(QUESTION_IDS);
  assertStringArray(rawState.pendingQuestions, 'ONBOARDING_STATE_INVALID', 'pendingQuestions', {
    knownValues: questionIds,
  });
  assertStringArray(rawState.deferredDecisions, 'ONBOARDING_STATE_INVALID', 'deferredDecisions', {
    knownValues: questionIds,
  });
  assertStringArray(rawState.nextSteps, 'ONBOARDING_STATE_INVALID', 'nextSteps');
  if (rawState.nextSteps.length === 0) {
    throw new ConstructorError('ONBOARDING_STATE_INVALID', 'El estado v1 no declara próximos pasos.', {
      remediation: 'Restaure una salida completa de onboarding-plan.',
    });
  }
  const canonicalEvidence = normalizedEvidence(rawState.evidence);
  const expectedPending = QUESTION_IDS.filter((id) => answers[id] === UNKNOWN);
  const expectedDeferred = QUESTION_IDS.filter((id) => answers[id] === DEFER);
  const expectedDecision = expectedPending.length === 0 && expectedDeferred.length === 0
    ? 'confirmed'
    : 'provisional';
  const expectedHash = sha256Json({ answers, evidence: canonicalEvidence });
  const expectedRoute = selectOnboardingRoute({ answers, evidence: canonicalEvidence });
  if (
    JSON.stringify(rawState.evidence) !== JSON.stringify(canonicalEvidence)
    || JSON.stringify(rawState.pendingQuestions) !== JSON.stringify(expectedPending)
    || JSON.stringify(rawState.deferredDecisions) !== JSON.stringify(expectedDeferred)
    || JSON.stringify(rawState.nextSteps) !== JSON.stringify(ROUTE_STEPS[rawState.route])
    || rawState.decisionStatus !== expectedDecision
    || rawState.rebootstrapAllowed !== (rawState.route !== 'brownfield')
    || rawState.inputHash !== expectedHash
    || rawState.route !== expectedRoute
  ) {
    throw new ConstructorError('ONBOARDING_STATE_INVALID', 'El estado v1 no es canónico o es inconsistente.', {
      remediation: 'Conserve el archivo para rollback y regenere el estado con onboarding-plan.',
    });
  }
  return { answers, state: sortJson(rawState) };
}

function migrateStateV0(rawState) {
  assertExactKeys(rawState, STATE_V0_KEYS, 'ONBOARDING_STATE_V0_INVALID', 'onboarding state v0');
  const allowedProfiles = new Set(['novice', 'experienced', 'existing', null, undefined]);
  if (!allowedProfiles.has(rawState.profile)) {
    throw new ConstructorError('ONBOARDING_STATE_V0_INVALID', 'El profile del estado v0 no es válido.', {
      remediation: 'Use novice, experienced o existing, o retire profile.',
    });
  }
  const answers = validateAnswerEntries(rawState.answers ?? {});
  if (rawState.profile === 'novice' && answers.guidance === undefined) answers.guidance = 'guided';
  if (rawState.profile === 'experienced' && answers.guidance === undefined) answers.guidance = 'brief';
  if (rawState.profile === 'existing' && answers.project === undefined) answers.project = 'preserve';
  for (const [field, label] of [
    ['signals', 'signals'],
    ['pending', 'pending'],
    ['deferred', 'deferred'],
  ]) {
    if (rawState[field] !== undefined) {
      assertStringArray(rawState[field], 'ONBOARDING_STATE_V0_INVALID', label);
    }
  }
  return normalizeOnboardingAnswers(answers);
}

export function migrateOnboardingState(rawState, { sourceHash: suppliedHash } = {}) {
  if (!isPlainObject(rawState) || !Number.isInteger(rawState.stateFormatVersion)) {
    throw new ConstructorError(
      'ONBOARDING_STATE_FORMAT_INVALID',
      'El estado no declara stateFormatVersion válido.',
      { remediation: 'Restaure un estado v0/v1 o ejecute sin --state.' },
    );
  }
  if (rawState.stateFormatVersion > ONBOARDING_STATE_FORMAT_VERSION) {
    throw new ConstructorError(
      'ONBOARDING_STATE_FROM_FUTURE',
      'El estado fue creado por una versión futura del clasificador.',
      { remediation: 'Use la versión de Project Engineering OS que creó ese estado.' },
    );
  }
  const hash = suppliedHash ?? sha256Json(rawState);
  if (rawState.stateFormatVersion === 0) {
    return sortJson({
      answers: migrateStateV0(rawState),
      migrations: [{
        from: 0,
        id: 'onboarding-state-v0-to-v1',
        reversibleBy: 'retain-source-file',
        sourceHash: hash,
        to: 1,
      }],
      sourceFormatVersion: 0,
      sourceHash: hash,
    });
  }
  if (rawState.stateFormatVersion !== ONBOARDING_STATE_FORMAT_VERSION) {
    throw new ConstructorError(
      'ONBOARDING_STATE_MIGRATION_MISSING',
      `No existe migración desde stateFormatVersion ${rawState.stateFormatVersion}.`,
      { remediation: 'Use una release compatible o restaure el último estado conocido.' },
    );
  }
  const validated = validateStateV1(rawState);
  return sortJson({
    answers: validated.answers,
    migrations: [],
    sourceFormatVersion: ONBOARDING_STATE_FORMAT_VERSION,
    sourceHash: hash,
    state: validated.state,
  });
}

async function assertInputFile(targetRoot, relativePath, { optional, label }) {
  const normalized = normalizeRelativePath(relativePath, label);
  const segments = normalized.split('/');
  let cursor = path.resolve(targetRoot);
  for (let index = 0; index < segments.length; index += 1) {
    cursor = path.resolve(cursor, segments[index]);
    let stats;
    try {
      stats = await lstat(cursor);
    } catch (error) {
      if (error?.code === 'ENOENT' && optional) return null;
      throw new ConstructorError('ONBOARDING_INPUT_UNREADABLE', `No se pudo leer ${label}.`, {
        details: error?.code ?? 'read-failed',
        remediation: `Compruebe que ${normalized} exista dentro del target y permita lectura.`,
        cause: error,
      });
    }
    if (stats.isSymbolicLink()) {
      throw new ConstructorError('ONBOARDING_INPUT_SYMLINK', `${label} no puede atravesar symlinks.`, {
        details: normalized,
        remediation: 'Use un archivo regular dentro del target.',
      });
    }
    if (index < segments.length - 1 && !stats.isDirectory()) {
      throw new ConstructorError('ONBOARDING_INPUT_UNREADABLE', `${label} atraviesa una ruta no directorio.`, {
        details: normalized,
        remediation: 'Corrija la ruta relativa del input.',
      });
    }
    if (index === segments.length - 1 && !stats.isFile()) {
      throw new ConstructorError('ONBOARDING_INPUT_NOT_FILE', `${label} no es un archivo regular.`, {
        details: normalized,
        remediation: 'Use un archivo JSON regular.',
      });
    }
    if (index === segments.length - 1 && stats.size > MAX_ONBOARDING_INPUT_BYTES) {
      throw new ConstructorError('ONBOARDING_INPUT_TOO_LARGE', `${label} excede el límite permitido.`, {
        details: `max-bytes=${MAX_ONBOARDING_INPUT_BYTES}`,
        remediation: 'Reduzca el JSON a respuestas o estado canónico sin adjuntar contenido del proyecto.',
      });
    }
  }
  return { absolute: resolveInside(targetRoot, normalized), relative: normalized };
}

async function readJsonInput(targetRoot, relativePath, { optional = false, label }) {
  const input = await assertInputFile(targetRoot, relativePath, { label, optional });
  if (!input) return null;
  let raw;
  try {
    raw = await readFile(input.absolute, 'utf8');
  } catch (error) {
    throw new ConstructorError('ONBOARDING_INPUT_UNREADABLE', `No se pudo leer ${label}.`, {
      details: error?.code ?? 'read-failed',
      remediation: `Compruebe permisos de ${input.relative}.`,
      cause: error,
    });
  }
  try {
    return {
      parsed: JSON.parse(raw),
      path: input.relative,
      sourceHash: sourceHash(raw),
    };
  } catch (error) {
    throw new ConstructorError('ONBOARDING_INPUT_JSON_INVALID', `${label} no contiene JSON válido.`, {
      details: 'invalid-json',
      remediation: `Corrija ${input.relative} antes de reintentar.`,
      cause: error,
    });
  }
}

export function classifyOnboarding({ answers, evidence }) {
  const normalizedAnswers = normalizeOnboardingAnswers(answers);
  validateEvidenceList(evidence);
  const canonicalEvidence = normalizedEvidence(evidence);
  const route = selectOnboardingRoute({ answers: normalizedAnswers, evidence: canonicalEvidence });
  const pendingQuestions = QUESTION_IDS.filter((id) => normalizedAnswers[id] === UNKNOWN);
  const deferredDecisions = QUESTION_IDS.filter((id) => normalizedAnswers[id] === DEFER);
  const inputHash = sha256Json({
    answers: normalizedAnswers,
    evidence: canonicalEvidence,
  });
  return sortJson({
    answers: normalizedAnswers,
    classifierVersion: ONBOARDING_CLASSIFIER_VERSION,
    decisionStatus:
      pendingQuestions.length === 0 && deferredDecisions.length === 0
        ? 'confirmed'
        : 'provisional',
    deferredDecisions,
    evidence: canonicalEvidence,
    inputHash,
    nextSteps: ROUTE_STEPS[route],
    pendingQuestions,
    rebootstrapAllowed: route !== 'brownfield',
    route,
    schemaVersion: ONBOARDING_SCHEMA_VERSION,
    stateFormatVersion: ONBOARDING_STATE_FORMAT_VERSION,
  });
}

function selectOnboardingRoute({ answers, evidence }) {
  if (evidence.some((record) => record.preservation === true) || answers.project === 'preserve') {
    return 'brownfield';
  }
  if (answers.guidance === 'brief') return 'experienced-new';
  return 'beginner';
}

export async function buildOnboardingPlan({
  answersPath = null,
  maxDepth = DEFAULT_MAX_SCAN_DEPTH,
  maxEntries = DEFAULT_MAX_SCAN_ENTRIES,
  statePath = null,
  targetRoot,
}) {
  const root = path.resolve(targetRoot);
  await targetRootStatus(root);
  const resolvedStatePath = statePath ?? DEFAULT_ONBOARDING_STATE_PATH;
  const stateInput = await readJsonInput(root, resolvedStatePath, {
    label: 'onboarding state',
    optional: statePath === null,
  });
  const migrated = stateInput
    ? migrateOnboardingState(stateInput.parsed, { sourceHash: stateInput.sourceHash })
    : null;
  const answersInput = answersPath
    ? await readJsonInput(root, answersPath, {
      label: 'onboarding answers',
      optional: false,
    })
    : null;
  const explicitAnswers = answersInput
    ? validateAnswerEntries(answersInput.parsed)
    : {};
  const answers = normalizeOnboardingAnswers({
    ...(migrated?.answers ?? {}),
    ...explicitAnswers,
  });
  const ignoredPaths = uniqueSorted([
    resolvedStatePath,
    ...(answersPath ? [answersPath] : []),
  ].map((item) => normalizeRelativePath(item)));
  const inspection = await inspectOnboardingTarget({
    ignoredPaths,
    maxDepth,
    maxEntries,
    targetRoot: root,
  });
  const state = classifyOnboarding({
    answers,
    evidence: inspection.evidence,
  });

  return sortJson({
    command: 'onboarding-plan',
    inspection,
    migrations: migrated?.migrations ?? [],
    mode: 'read-only',
    mutationPerformed: false,
    questions: ONBOARDING_QUESTIONS,
    remote: {
      mutationPerformed: false,
      status: 'not-contacted',
    },
    state,
    stateSource: stateInput
      ? {
        path: stateInput.path,
        sourceFormatVersion: migrated.sourceFormatVersion,
        sourceHash: migrated.sourceHash,
      }
      : null,
    status: 'PLANNED',
  });
}

export async function runOnboardingPlan(options) {
  return buildOnboardingPlan({
    answersPath: options.answersPath ?? null,
    statePath: options.onboardingStatePath ?? null,
    targetRoot: options.targetRoot ?? options.target ?? process.cwd(),
  });
}

function listOrNone(values) {
  return values.length > 0 ? values.join(', ') : 'ninguna';
}

export function onboardingPlanText(result) {
  const { state } = result;
  const lines = [
    '[PLANNED] onboarding-plan',
    `Ruta: ${state.route}`,
    `Decisión: ${state.decisionStatus}`,
    `Inspección local: ${result.inspection.complete ? 'completa' : 'incompleta'}`,
    'Mutación local: no',
    'Mutación remota: no',
    `Rebootstrap permitido: ${state.rebootstrapAllowed ? 'sí' : 'no'}`,
    `Evidencia: ${state.evidence.length}`,
  ];
  for (const evidence of state.evidence) {
    const location = evidence.path ? ` (${evidence.path})` : '';
    const detail = evidence.detail ? `: ${evidence.detail}` : '';
    lines.push(`- ${evidence.id}${location}${detail}`);
  }
  lines.push(
    `Preguntas pendientes: ${listOrNone(state.pendingQuestions)}`,
    `Decisiones pospuestas: ${listOrNone(state.deferredDecisions)}`,
    'Próximos pasos:',
    ...state.nextSteps.map((step) => `- ${step}`),
  );
  if (result.migrations.length > 0) {
    lines.push(`Migraciones en memoria: ${result.migrations.map((item) => item.id).join(', ')}`);
  }
  return `${lines.join('\n')}\n`;
}
