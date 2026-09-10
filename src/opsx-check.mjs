import {
  lstat,
  readFile,
  readdir,
} from 'node:fs/promises';

import { ConstructorError } from './errors.mjs';
import { normalizeLf, sha256 } from './hash.mjs';
import { readJsonFile } from './json.mjs';
import {
  assertNoSymlinkEscape,
  normalizeRelativePath,
  pathExists,
  resolveInside,
} from './paths.mjs';
import { preflightTarget } from './preflight.mjs';
import {
  inspectSpecPurposes,
  specPurposePath,
  specPurposeRecovery,
  SPECS_ROOT,
} from './spec-purpose.mjs';
import { readInstalledState } from './state.mjs';
import { inspectLocalPackage, PINNED_OPENSPEC_VERSION, resolveLocalToolchain } from '../blueprint/core/project-constructor/toolchain.mjs';

export const OPSX_CONTRACT_PATH = '.project-os/openspec-ownership.json';
const ADAPT_RECOVERY = 'Ejecute `project-constructor opsx-adapt --target .`.';
const LOCAL_OPEN_SPEC = 'node ./.project-constructor/openspec.mjs';
const REQUIRED_WORKFLOWS = Object.freeze(['apply', 'archive', 'propose']);

function check(id, status, summary, cause, remediation = null, evidence = {}) {
  return {
    cause,
    evidence,
    id,
    remediation,
    status,
    summary,
  };
}

export function opsxGlobToRegExp(glob) {
  const normalized = normalizeRelativePath(glob, 'generatedGlob');
  let pattern = '^';
  for (let index = 0; index < normalized.length; index += 1) {
    const character = normalized[index];
    if (character === '*' && normalized[index + 1] === '*') {
      pattern += '.*';
      index += 1;
    } else if (character === '*') {
      pattern += '[^/]*';
    } else if (character === '?') {
      pattern += '[^/]';
    } else {
      pattern += character.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
    }
  }
  return new RegExp(`${pattern}$`);
}

function countOccurrences(text, needle) {
  let count = 0;
  let cursor = 0;
  while ((cursor = text.indexOf(needle, cursor)) !== -1) {
    count += 1;
    cursor += needle.length;
  }
  return count;
}

export function validateOpsxContract(contract) {
  if (!contract || typeof contract !== 'object' || Array.isArray(contract)) {
    throw new ConstructorError(
      'OPSX_CONTRACT_INVALID',
      `${OPSX_CONTRACT_PATH} debe contener un objeto JSON.`,
    );
  }
  if (contract.owner !== 'external-openspec') {
    throw new ConstructorError(
      'OPSX_OWNER_INVALID',
      'El owner OPSX debe ser external-openspec.',
    );
  }
  if (contract.localOnly !== true || contract.allowGlobalFallback !== false) {
    throw new ConstructorError(
      'OPSX_LOCAL_CONTRACT_INVALID',
      'OpenSpec debe permanecer local y sin fallback global.',
      {
        remediation: 'Restaure localOnly=true y allowGlobalFallback=false.',
      },
    );
  }
  if (!Array.isArray(contract.generatedGlobs) || contract.generatedGlobs.length === 0) {
    throw new ConstructorError(
      'OPSX_GLOBS_INVALID',
      'El contrato OPSX debe declarar generatedGlobs.',
    );
  }
  if (!Array.isArray(contract.managedBlocks)) {
    throw new ConstructorError(
      'OPSX_BLOCKS_INVALID',
      'managedBlocks debe ser una lista.',
    );
  }
  for (const command of ['adapt', 'check', 'init', 'update']) {
    if (typeof contract.commands?.[command] !== 'string' || contract.commands[command] === '') {
      throw new ConstructorError(
        'OPSX_COMMANDS_INVALID',
        `commands.${command} debe declarar un comando explícito.`,
      );
    }
  }
  if (
    contract.commandRewrite?.from !== 'openspec'
    || contract.commandRewrite?.to !== LOCAL_OPEN_SPEC
  ) {
    throw new ConstructorError(
      'OPSX_REWRITE_INVALID',
      `commandRewrite debe convertir openspec en ${LOCAL_OPEN_SPEC}.`,
    );
  }
  const forbiddenRendererAction = [
    'mayGenerate',
    'mayPatch',
    'mayMove',
    'mayDelete',
    'mayRollback',
  ].find((key) => contract.generalRenderer?.[key] !== false);
  if (forbiddenRendererAction) {
    throw new ConstructorError(
      'OPSX_RENDERER_OWNERSHIP_DRIFT',
      `generalRenderer.${forbiddenRendererAction} debe ser false.`,
    );
  }
  if (contract.onShapeDrift !== 'FAIL') {
    throw new ConstructorError(
      'OPSX_SHAPE_POLICY_INVALID',
      'onShapeDrift debe ser FAIL para evitar falsos verdes.',
    );
  }

  const generatedGlobs = [...new Set(contract.generatedGlobs.map((glob) => (
    normalizeRelativePath(glob, 'generatedGlob')
  )))].sort();
  const matchers = generatedGlobs.map(opsxGlobToRegExp);
  const seenTargets = new Set();
  const blocks = contract.managedBlocks.map((block, index) => {
    if (
      !block
      || typeof block !== 'object'
      || typeof block.id !== 'string'
      || block.id === ''
      || !REQUIRED_WORKFLOWS.includes(block.workflow)
      || !Array.isArray(block.targets)
      || block.targets.length !== 5
      || typeof block.start !== 'string'
      || block.start === ''
      || typeof block.end !== 'string'
      || block.end === ''
      || block.start === block.end
      || typeof block.content !== 'string'
      || block.content.trim() === ''
    ) {
      throw new ConstructorError(
        'OPSX_BLOCK_SCHEMA_INVALID',
        `managedBlocks[${index}] no declara id/workflow/5 targets/start/end/content válidos.`,
      );
    }
    const targets = block.targets.map((target, targetIndex) => {
      const normalized = normalizeRelativePath(
        target,
        `managedBlocks[${index}].targets[${targetIndex}]`,
      );
      if (!matchers.some((matcher) => matcher.test(normalized))) {
        throw new ConstructorError(
          'OPSX_BLOCK_OUTSIDE_OWNER',
          `El bloque ${block.id} apunta fuera de generatedGlobs: ${normalized}.`,
        );
      }
      if (seenTargets.has(normalized)) {
        throw new ConstructorError(
          'OPSX_BLOCK_TARGET_DUPLICATE',
          `El target ${normalized} aparece en más de un bloque OPSX.`,
        );
      }
      seenTargets.add(normalized);
      return normalized;
    }).sort((left, right) => left.localeCompare(right));
    if (new Set(targets).size !== targets.length) {
      throw new ConstructorError(
        'OPSX_BLOCK_TARGET_DUPLICATE',
        `El bloque ${block.id} repite targets.`,
      );
    }
    if (block.expectedHash !== undefined && !/^[a-f0-9]{64}$/.test(block.expectedHash)) {
      throw new ConstructorError(
        'OPSX_BLOCK_HASH_INVALID',
        `expectedHash de ${block.id} no es SHA-256.`,
      );
    }
    return {
      content: normalizeLf(block.content),
      end: normalizeLf(block.end),
      expectedHash: block.expectedHash ?? null,
      id: block.id,
      required: block.required !== false,
      start: normalizeLf(block.start),
      targets,
      workflow: block.workflow ?? null,
    };
  });
  const workflows = blocks.map((block) => block.workflow).sort();
  if (
    workflows.length !== REQUIRED_WORKFLOWS.length
    || workflows.some((workflow, index) => workflow !== REQUIRED_WORKFLOWS[index])
  ) {
    throw new ConstructorError(
      'OPSX_WORKFLOWS_INVALID',
      'managedBlocks debe declarar exactamente propose, apply y archive.',
    );
  }

  return {
    ...contract,
    generatedGlobs,
    initCommand: contract.commands.init,
    managedBlocks: blocks,
    matchers,
  };
}

export function desiredBlockText(block) {
  const body = block.content.endsWith('\n') ? block.content : `${block.content}\n`;
  return `${block.start}\n${body}${block.end}`;
}

async function checkManagedBlock(targetRoot, block, path) {
  const checkId = `opsx.block.${block.id}.${path}`;
  await assertNoSymlinkEscape(targetRoot, path);
  const absolute = resolveInside(targetRoot, path);
  let text;
  try {
    const stats = await lstat(absolute);
    if (!stats.isFile()) {
      return check(
        checkId,
        'FAIL',
        'La ruta delimitada no es un archivo.',
        path,
        ADAPT_RECOVERY,
      );
    }
    text = normalizeLf(await readFile(absolute, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return check(
        checkId,
        block.required ? 'FAIL' : 'SKIP',
        block.required ? 'Falta un bloque OPSX requerido.' : 'El bloque opcional no existe.',
        path,
        block.required ? ADAPT_RECOVERY : null,
      );
    }
    throw error;
  }

  const startCount = countOccurrences(text, block.start);
  const endCount = countOccurrences(text, block.end);
  const startIndex = text.indexOf(block.start);
  const endIndex = text.indexOf(block.end, startIndex + block.start.length);
  if (startCount !== 1 || endCount !== 1 || endIndex < startIndex) {
    return check(
      checkId,
      'FAIL',
      'La forma del bloque delimitado cambió.',
      `start=${startCount}, end=${endCount}`,
      ADAPT_RECOVERY,
      { path },
    );
  }

  const content = text.slice(startIndex, endIndex + block.end.length);
  const actualHash = sha256(Buffer.from(content, 'utf8'));
  const expectedHash = block.expectedHash
    ?? (desiredBlockText(block) ? sha256(Buffer.from(desiredBlockText(block), 'utf8')) : null);
  if (expectedHash && actualHash !== expectedHash) {
    return check(
      checkId,
      'FAIL',
      'El bloque delimitado difiere del hash estabilizado.',
      'SHA-256 distinto',
      ADAPT_RECOVERY,
      {
        actualHash,
        expectedHash,
        path,
      },
    );
  }

  return check(
    checkId,
    'PASS',
    'El bloque delimitado conserva su forma.',
    'Delimitadores únicos y hash compatible.',
    null,
    {
      hash: actualHash,
      path,
    },
  );
}

async function walkFiles(targetRoot, relativeDirectory = '') {
  const absolute = relativeDirectory
    ? resolveInside(targetRoot, relativeDirectory)
    : targetRoot;
  let entries;
  try {
    entries = await readdir(absolute, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relative = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
    if (
      relative === '.git'
      || relative.startsWith('.git/')
      || relative === 'node_modules'
      || relative.startsWith('node_modules/')
      || relative === '.project-constructor'
      || relative.startsWith('.project-constructor/')
    ) {
      continue;
    }
    if (entry.isDirectory()) {
      files.push(...await walkFiles(targetRoot, relative));
    } else if (entry.isFile()) {
      files.push(relative);
    }
  }
  return files;
}

async function checkOpsxTransactions(targetRoot) {
  const relativeRoot = '.project-constructor/opsx-transactions';
  const absoluteRoot = resolveInside(targetRoot, relativeRoot);
  let entries;
  try {
    entries = await readdir(absoluteRoot, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return check(
        'opsx.transactions',
        'PASS',
        'No hay transacciones OPSX incompletas.',
        'El directorio transaccional aún no existe.',
      );
    }
    return check(
      'opsx.transactions',
      'FAIL',
      'No se pudieron inspeccionar las transacciones OPSX.',
      error.message,
      ADAPT_RECOVERY,
    );
  }

  const incomplete = [];
  const corrupt = [];
  for (const entry of entries
    .filter((candidate) => candidate.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name))) {
    const relative = `${relativeRoot}/${entry.name}/journal.json`;
    const journal = await readJsonFile(
      resolveInside(targetRoot, relative),
      { label: relative, optional: true },
    ).catch(() => null);
    if (
      !journal
      || journal.schemaVersion !== '1.0.0'
      || journal.id !== entry.name
      || journal.command !== 'opsx-adapt'
    ) {
      corrupt.push(relative);
    } else if (['applying', 'failed', 'rolling-back'].includes(journal.status)) {
      incomplete.push(journal.id);
    } else if (!['completed', 'rolled-back'].includes(journal.status)) {
      corrupt.push(relative);
    }
  }
  return incomplete.length === 0 && corrupt.length === 0
    ? check(
      'opsx.transactions',
      'PASS',
      'Las transacciones OPSX están en estados terminales.',
      `${entries.length} entrada(s) inspeccionadas.`,
      null,
      { journalCount: entries.length },
    )
    : check(
      'opsx.transactions',
      'FAIL',
      'Hay transacciones OPSX incompletas o corruptas.',
      [...incomplete, ...corrupt].join(', '),
      ADAPT_RECOVERY,
      { corrupt, incomplete },
    );
}

// El archive de OpenSpec publica cada capability nueva con un texto sembrado bajo `## Purpose` que
// `validate --all --strict` acepta, porque solo exige que la sección exista. El gate del upstream vivía en
// `scripts/`, que no se distribuye, así que ningún repositorio bootstrapeado lo observaba. Aquí llega al
// comando read-only que el consumidor ya ejecuta en cada comprobación rutinaria.
async function checkSpecPurposes(targetRoot) {
  // El módulo recorre el árbol y lee cada spec. Un `openspec/specs` enlazado fuera del repositorio
  // convertiría ese recorrido en una enumeración de directorios ajenos, así que se rechaza antes de leer,
  // igual que ya se hace con los targets de los bloques gestionados.
  await assertNoSymlinkEscape(targetRoot, SPECS_ROOT);
  // Un repositorio que aún no ha publicado ninguna capability no tiene `openspec/specs`. Ese estado es
  // legítimo y se distingue del árbol que existe y no se puede leer: el primero no permite afirmar nada, el
  // segundo no permite inferir un PASS.
  if (!await pathExists(resolveInside(targetRoot, SPECS_ROOT))) {
    return [check(
      'opsx.spec-purpose',
      'SKIP',
      'El repositorio aún no publica capabilities cuyo Purpose revisar.',
      `${SPECS_ROOT} no existe.`,
      'Ejecute `openspec init` y archive un change antes de esperar capabilities publicadas.',
      { path: SPECS_ROOT },
    )];
  }

  const { capabilities, failures } = await inspectSpecPurposes(targetRoot);
  const rootFailure = failures.find((failure) => failure.kind === 'specs-root-unreadable');
  if (rootFailure) {
    return [check(
      'opsx.spec-purpose',
      'FAIL',
      'No se pudo inspeccionar el árbol de specs publicadas.',
      rootFailure.kind,
      specPurposeRecovery(rootFailure),
      { path: specPurposePath(rootFailure.capability) },
    )];
  }
  if (capabilities.length === 0) {
    return [check(
      'opsx.spec-purpose',
      'SKIP',
      'El repositorio aún no publica capabilities cuyo Purpose revisar.',
      `${SPECS_ROOT} existe y no contiene capabilities.`,
      null,
      { path: SPECS_ROOT },
    )];
  }

  const byCapability = new Map(failures.map((failure) => [failure.capability, failure]));
  return capabilities.map((capability) => {
    const failure = byCapability.get(capability);
    const path = specPurposePath(capability);
    return failure
      ? check(
        `opsx.spec-purpose.${capability}`,
        'FAIL',
        'Una capability publicada no declara su Purpose redactado.',
        failure.kind,
        specPurposeRecovery(failure),
        { path },
      )
      : check(
        `opsx.spec-purpose.${capability}`,
        'PASS',
        'La capability publicada declara un Purpose redactado.',
        'Purpose presente y sin el texto sembrado por el archive.',
        null,
        { path },
      );
  });
}

export async function findOpsxGeneratedFiles(targetRoot, contract) {
  const allFiles = await walkFiles(targetRoot);
  return allFiles
    .filter((path) => contract.matchers.some((matcher) => matcher.test(path)))
    .sort((left, right) => left.localeCompare(right));
}

const BARE_OPEN_SPEC = /\bopenspec(?=(?::\*|\s+(?:archive|context|doctor|init|instructions|list|new|show|status|store|update|validate)\b))/g;

export function hasBareOpenSpecCommand(text) {
  const normalized = normalizeLf(text);
  for (const match of normalized.matchAll(BARE_OPEN_SPEC)) {
    const prefix = normalized.slice(Math.max(0, match.index - 32), match.index);
    if (!prefix.endsWith('npm exec --yes=false -- ')) {
      return true;
    }
  }
  return false;
}

export function rewriteBareOpenSpecCommands(text, replacement = LOCAL_OPEN_SPEC) {
  return normalizeLf(text).replace(BARE_OPEN_SPEC, (match, ...arguments_) => {
    const offset = arguments_.at(-2);
    const prefix = normalizeLf(text).slice(Math.max(0, offset - 32), offset);
    return prefix.endsWith('npm exec --yes=false -- ') ? match : replacement;
  });
}

export async function loadOpsxContract(targetRoot) {
  return validateOpsxContract(await readJsonFile(
    resolveInside(targetRoot, OPSX_CONTRACT_PATH),
    { label: OPSX_CONTRACT_PATH },
  ));
}

export async function checkLocalOpenSpec(targetRoot, contract) {
  const expectedPackage = '@fission-ai/openspec';
  const expectedVersion = PINNED_OPENSPEC_VERSION;
  let location;
  try {
    if (contract.package !== expectedPackage || contract.version !== expectedVersion) {
      throw new Error('El contrato OPSX no coincide con la identidad fijada por el wrapper.');
    }
    location = resolveLocalToolchain(targetRoot);
    const inspected = inspectLocalPackage(location, expectedPackage, expectedVersion);
    if (!inspected.ok) throw new Error(inspected.reasons.join('; '));
    return check('opsx.local-cli', 'PASS',
      'OpenSpec local coincide con manifiesto, lockfile, instalación y entrada del paquete.',
      expectedPackage + '@' + expectedVersion,
      null, { bin: inspected.binary, version: expectedVersion, location: location.relative });
  } catch (error) {
    return check('opsx.local-cli', 'FAIL',
      'OpenSpec local fijado no está completamente disponible.',
      error.message,
      'Revisa toolchainRoot y el contrato OPSX; restaura el lockfile y ejecuta npm ci en la ubicación seleccionada. No uses una CLI global.',
      { expectedPackage, expectedVersion, location: location?.relative ?? 'inválida', code: error.code ?? 'TOOLCHAIN_OPENSPEC_INVALID' });
  }
}

export async function runOpsxCheck({
  targetRoot = process.cwd(),
} = {}) {
  const preflight = await preflightTarget(targetRoot, {
    writable: false,
  });
  const contract = await loadOpsxContract(preflight.target);
  const state = await readInstalledState(preflight.target);
  const checks = [];
  const generatedFiles = await findOpsxGeneratedFiles(preflight.target, contract);
  const missingGlobs = contract.generatedGlobs.filter((glob, index) => (
    !generatedFiles.some((path) => contract.matchers[index].test(path))
  ));

  checks.push(missingGlobs.length === 0
    ? check(
      'opsx.generated-files',
      'PASS',
      'Las superficies OPSX configuradas existen.',
      `${generatedFiles.length} archivos externos encontrados.`,
      null,
      { count: generatedFiles.length },
    )
    : check(
      'opsx.generated-files',
      'FAIL',
      'Faltan superficies OPSX generadas por OpenSpec.',
      missingGlobs.join(', '),
      `Ejecute \`${contract.initCommand}\` y vuelva a ejecutar opsx-adapt.`,
    ));
  checks.push(await checkOpsxTransactions(preflight.target));
  checks.push(...await checkSpecPurposes(preflight.target));

  const claimed = Object.entries(state?.files ?? {})
    .filter(([path, record]) => (
      record.owner !== 'external-openspec'
      && contract.matchers.some((matcher) => matcher.test(path))
    ))
    .map(([path, record]) => `${path} (${record.owner})`)
    .sort();

  checks.push(claimed.length === 0
    ? check(
      'opsx.ownership',
      'PASS',
      'El state del constructor no reclama rutas OPSX.',
      'Ownership externo preservado.',
      null,
      { generatedGlobs: contract.generatedGlobs },
    )
    : check(
      'opsx.ownership',
      'FAIL',
      'El state del constructor reclama rutas pertenecientes a OpenSpec.',
      claimed.join(', '),
      'Retire esas rutas del renderer general y regenere mediante la CLI local de OpenSpec.',
    ));

  checks.push(check(
    'opsx.local-cli-contract',
    'PASS',
    'El contrato exige OpenSpec local y fijado.',
    `package=${contract.package}, version=${contract.version}`,
    null,
    {
      allowGlobalFallback: contract.allowGlobalFallback,
      localOnly: contract.localOnly,
      version: contract.version,
    },
  ));
  checks.push(await checkLocalOpenSpec(preflight.target, contract));

  const bareFiles = [];
  for (const path of generatedFiles) {
    const text = await readFile(resolveInside(preflight.target, path), 'utf8');
    if (hasBareOpenSpecCommand(text)) {
      bareFiles.push(path);
    }
  }
  checks.push(bareFiles.length === 0
    ? check(
      'opsx.local-cli-references',
      generatedFiles.length === 0 ? 'SKIP' : 'PASS',
      generatedFiles.length === 0
        ? 'No hay archivos OPSX para revisar referencias.'
        : 'Las referencias OPSX usan la CLI local fijada.',
      generatedFiles.length === 0 ? 'Superficies aún no generadas.' : 'No se detectó CLI bare.',
      generatedFiles.length === 0 ? contract.initCommand : null,
    )
    : check(
      'opsx.local-cli-references',
      'FAIL',
      'Hay archivos OPSX que invocan openspec sin el wrapper local.',
      bareFiles.join(', '),
      'Ejecute `project-constructor opsx-adapt --target .` después de instalar OpenSpec local.',
    ));

  if (contract.managedBlocks.length === 0) {
    checks.push(check(
      'opsx.managed-blocks',
      'SKIP',
      'No hay bloques OPSX estabilizados por un adaptador separado.',
      'managedBlocks está vacío; los archivos completos permanecen bajo owner externo.',
      null,
    ));
  } else {
    for (const block of contract.managedBlocks) {
      for (const target of block.targets) {
        if (!generatedFiles.includes(target)) {
          checks.push(check(
            `opsx.block.${block.id}.${target}`,
            block.required ? 'FAIL' : 'SKIP',
            block.required
              ? 'Falta un target OPSX requerido.'
              : 'El target opcional no existe.',
            target,
            block.required ? contract.initCommand : null,
          ));
          continue;
        }
        checks.push(await checkManagedBlock(preflight.target, block, target));
      }
    }
  }

  const status = checks.some((item) => item.status === 'FAIL') ? 'FAIL' : 'PASS';
  return {
    checks,
    command: 'opsx-check',
    exitCode: status === 'FAIL' ? 1 : 0,
    mutationPerformed: false,
    schemaVersion: '1.0.0',
    status,
  };
}
