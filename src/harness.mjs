import {
  lstat,
  readFile,
} from 'node:fs/promises';

import { OWNERS } from './constants.mjs';
import { packageDistributionEntries } from './distribution.mjs';
import { ConstructorError } from './errors.mjs';
import {
  normalizeLf,
  sha256,
  sha256Json,
} from './hash.mjs';
import { sortJson, stableStringify } from './json.mjs';
import {
  assertNoSymlinkEscape,
  resolveInside,
} from './paths.mjs';

export const PROJECT_OS_SOURCES = Object.freeze({
  capabilityMatrix: '.project-os/harness-capabilities.json',
  instructions: '.project-os/instructions.md',
  mcp: '.project-os/mcp.json',
  pathRules: '.project-os/path-rules.json',
  permissions: '.project-os/permissions.json',
  profiles: '.project-os/profiles.json',
  skills: '.project-os/skills.json',
});

export const HARNESS_CAPABILITY_STATES = Object.freeze([
  'native',
  'generated',
  'documented',
  'unsupported',
]);

export const HARNESS_CAPABILITY_SCHEMA = Object.freeze({
  capabilities: [
    'instructions',
    'pathRules',
    'skills',
    'permissions',
    'mcp',
    'profiles',
  ],
  harnesses: [
    'claude-code',
    'codex',
    'cursor',
    'github-copilot',
    'opencode',
  ],
});

// Señales de consumo que la CI no puede producir sin instalar el agente del proveedor y autenticar un
// modelo. Se declaran aparte de la configuración para que una no pueda leerse como la otra.
export const HARNESS_RUNTIME_SIGNALS = Object.freeze([
  'startup',
  'toolListing',
  'smoke',
]);

// Destinos retirados y su reemplazo oficial. `.project-os/harness-capabilities.json` es seed-once y
// pertenece al consumidor: el constructor no lo reescribe. Cuando la copia del consumidor todavía nombra
// una ruta retirada, la capacidad sigue entregándose por el reemplazo instalado, así que el rendering
// continúa y la desactualización queda declarada en lugar de romper el sync o de fingir un destino que
// nadie instala.
export const RETIRED_CAPABILITY_TARGETS = Object.freeze({
  '.codex/skills/project-os/SKILL.md': Object.freeze({
    replacement: '.agents/skills/project-os/SKILL.md',
    reason: 'La documentación oficial de Codex declara .agents/skills como ubicación de skills de repositorio; .codex/skills era convención heredada.',
  }),
  '.opencode/skills/project-os/SKILL.md': Object.freeze({
    replacement: '.agents/skills/project-os/SKILL.md',
    reason: 'OpenCode documenta .agents/skills junto a .opencode/skills; el constructor usa la ubicación compartida para no instalar copias redundantes del mismo SKILL.md.',
  }),
});

// Sentinels de versión mínima. No son versiones: declaran por qué no hay una que citar.
// `unversioned-service` describe un servicio sin versión instalable por el repositorio; `undetermined`
// describe una capacidad cuya documentación oficial no publica versión mínima.
export const MINIMUM_VERSION_SENTINELS = Object.freeze(['undetermined', 'unversioned-service']);

const NOT_VERIFIED = 'not-verified';
const NOT_APPLICABLE = 'not-applicable';
const FIXTURE_REFERENCE = /^fixture:[a-z0-9][a-z0-9-]*$/;
const RECEIPT_REFERENCE = /^receipt:\.project-constructor\/evidence\/[a-z0-9][a-z0-9-]*\.json$/;
const ISO_DATE = /^[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])$/;
const OFFICIAL_SOURCE = /^https:\/\/[^\s"']+$/;
const SURFACE_ID = /^[a-z0-9][a-z0-9-]*$/;
const RENDERED_SUPPORT = Object.freeze(['native', 'generated']);

const TOKENS = Object.freeze({
  PROJECT_OS_CAPABILITY_MATRIX: 'capabilityMatrix',
  PROJECT_OS_INSTRUCTIONS: 'instructions',
  PROJECT_OS_MCP: 'mcp',
  PROJECT_OS_PATH_RULES: 'pathRules',
  PROJECT_OS_PERMISSIONS: 'permissions',
  PROJECT_OS_PROFILES: 'profiles',
  PROJECT_OS_SKILLS: 'skills',
});

const TOKEN_PATTERN = /\{\{([A-Z0-9_]+)\}\}/g;

function listFrom(raw, primary, fallback = null) {
  if (Array.isArray(raw)) {
    return raw;
  }
  if (raw && Array.isArray(raw[primary])) {
    return raw[primary];
  }
  if (fallback && raw && Array.isArray(raw[fallback])) {
    return raw[fallback];
  }
  throw new ConstructorError(
    'PROJECT_OS_SCHEMA_INVALID',
    `La fuente canónica debe declarar una lista "${primary}".`,
  );
}

function uniqueIdList(items, label) {
  const ids = new Set();
  for (const item of items) {
    if (!item || typeof item !== 'object' || typeof item.id !== 'string' || item.id === '') {
      throw new ConstructorError(
        'PROJECT_OS_ID_INVALID',
        `${label} contiene una entrada sin id.`,
      );
    }
    if (ids.has(item.id)) {
      throw new ConstructorError(
        'PROJECT_OS_ID_DUPLICATE',
        `${label} contiene el id duplicado ${item.id}.`,
      );
    }
    ids.add(item.id);
  }
}

function textList(value, label) {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? [value] : null;
  if (!list || list.some((item) => typeof item !== 'string' || item.trim() === '')) {
    throw new ConstructorError('PROJECT_OS_TEXT_LIST_INVALID', `${label} debe ser texto o lista de textos.`);
  }
  return list.map((item) => normalizeLf(item));
}

function normalizePathRules(raw) {
  const rules = listFrom(raw, 'rules', 'pathRules').map((rule) => ({
    globs: textList(rule.globs ?? rule.paths ?? rule.applyTo, `globs de ${rule.id}`),
    id: rule.id,
    instructions: textList(
      rule.instructions ?? rule.content ?? rule.rule,
      `instructions de ${rule.id}`,
    ),
  }));
  uniqueIdList(rules, 'path-rules.json');
  return rules.sort((left, right) => left.id.localeCompare(right.id));
}

function normalizeSkills(raw) {
  const skills = listFrom(raw, 'skills').map((skill) => ({
    description: String(skill.description ?? ''),
    enabled: skill.enabled !== false,
    id: skill.id,
    instructions: textList(
      skill.instructions ?? skill.content ?? skill.body,
      `instructions de skill ${skill.id}`,
    ),
  }));
  uniqueIdList(skills, 'skills.json');
  return skills.sort((left, right) => left.id.localeCompare(right.id));
}

function normalizePermissions(raw) {
  const permissions = listFrom(raw, 'rules', 'permissions').map((permission) => {
    const effect = permission.effect ?? permission.mode ?? permission.action;
    if (!['allow', 'ask', 'deny'].includes(effect)) {
      throw new ConstructorError(
        'PROJECT_OS_PERMISSION_EFFECT',
        `El permiso ${permission.id} debe usar allow, ask o deny.`,
      );
    }
    return {
      commands: textList(
        permission.commands ?? permission.patterns ?? permission.command,
        `commands de permiso ${permission.id}`,
      ),
      effect,
      id: permission.id,
      reason: String(permission.reason ?? ''),
    };
  });
  uniqueIdList(permissions, 'permissions.json');
  return permissions.sort((left, right) => left.id.localeCompare(right.id));
}

function surfaceList(raw, label, capabilityLabel) {
  if (raw === undefined) {
    return [];
  }
  if (!Array.isArray(raw) || raw.some((id) => typeof id !== 'string' || !SURFACE_ID.test(id))) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_SURFACES',
      `${capabilityLabel} declara ${label} con identificadores no válidos.`,
    );
  }
  if (new Set(raw).size !== raw.length) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_SURFACES',
      `${capabilityLabel} repite una superficie en ${label}.`,
    );
  }
  return [...raw].sort((left, right) => left.localeCompare(right));
}

// El bloque de verificación separa dos afirmaciones que antes vivían en `support`: qué escribe el
// constructor y qué se ha demostrado sobre el consumo. `configuration` la produce una fixture offline;
// startup, tool listing y smoke solo pueden declararse con un receipt opt-in que la CI no genera.
function normalizeVerification(raw, support, capabilityLabel) {
  if (raw === undefined || raw === null) {
    // Compatibilidad hacia atrás: la copia seed-once del consumidor puede no declarar el bloque todavía.
    return null;
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_VERIFICATION',
      `${capabilityLabel} declara verification sin un objeto.`,
    );
  }

  const allowed = new Set([
    'minimumVersion',
    'source',
    'sourceCheckedOn',
    'configuration',
    'startup',
    'toolListing',
    'smoke',
    'surfaces',
    'unsupportedSurfaces',
    'fallback',
    'degradation',
  ]);
  const unknown = Object.keys(raw).filter((key) => !allowed.has(key));
  if (unknown.length > 0) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_VERIFICATION',
      `${capabilityLabel} declara campos de verification no soportados.`,
      { details: unknown.sort() },
    );
  }

  // Una versión mínima solo puede declararse si la documentación oficial la publica. Cuando no la publica,
  // el sentinel dice exactamente eso: inventar un número sería una afirmación fechada sin fuente.
  const minimumVersion = raw.minimumVersion ?? null;
  if (
    minimumVersion !== null
    && !MINIMUM_VERSION_SENTINELS.includes(minimumVersion)
    && !/^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?$/.test(minimumVersion)
  ) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_MINIMUM_VERSION',
      `${capabilityLabel} declara minimumVersion ${String(minimumVersion)}.`,
      {
        remediation:
          `Use una versión semver publicada por la fuente oficial, o uno de: ${MINIMUM_VERSION_SENTINELS.join(', ')}.`,
      },
    );
  }

  const source = raw.source ?? null;
  if (source !== null && (typeof source !== 'string' || !OFFICIAL_SOURCE.test(source))) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_SOURCE',
      `${capabilityLabel} debe citar la fuente oficial como una URL https.`,
    );
  }

  const sourceCheckedOn = raw.sourceCheckedOn ?? null;
  if (sourceCheckedOn !== null && (typeof sourceCheckedOn !== 'string' || !ISO_DATE.test(sourceCheckedOn))) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_SOURCE_DATE',
      `${capabilityLabel} debe fechar su fuente con formato YYYY-MM-DD.`,
    );
  }
  if ((source === null) !== (sourceCheckedOn === null)) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_SOURCE_DATE',
      `${capabilityLabel} declara fuente sin fecha o fecha sin fuente.`,
    );
  }

  const configuration = raw.configuration ?? NOT_APPLICABLE;
  if (
    typeof configuration !== 'string'
    || (configuration !== NOT_APPLICABLE && !FIXTURE_REFERENCE.test(configuration))
  ) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_CONFIGURATION',
      `${capabilityLabel} debe declarar configuration como fixture:<id> o ${NOT_APPLICABLE}.`,
    );
  }

  const signals = {};
  for (const signal of HARNESS_RUNTIME_SIGNALS) {
    const value = raw[signal] ?? NOT_VERIFIED;
    if (typeof value !== 'string' || (value !== NOT_VERIFIED && !RECEIPT_REFERENCE.test(value))) {
      throw new ConstructorError(
        'HARNESS_CAPABILITY_RUNTIME_SIGNAL',
        `${capabilityLabel} declara ${signal} sin ${NOT_VERIFIED} ni un receipt opt-in.`,
        {
          remediation:
            'Una señal de runtime solo se declara con receipt:.project-constructor/evidence/<id>.json; la configuración nunca la satisface.',
        },
      );
    }
    signals[signal] = value;
  }

  const fallback = raw.fallback ?? null;
  if (fallback !== null && (typeof fallback !== 'string' || fallback.trim() === '')) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_FALLBACK',
      `${capabilityLabel} declara un fallback vacío.`,
    );
  }

  const degradation = raw.degradation ?? null;
  if (degradation !== null && (typeof degradation !== 'string' || degradation.trim() === '')) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_DEGRADATION',
      `${capabilityLabel} declara una degradación vacía.`,
    );
  }

  const surfaces = surfaceList(raw.surfaces, 'surfaces', capabilityLabel);
  const unsupportedSurfaces = surfaceList(
    raw.unsupportedSurfaces,
    'unsupportedSurfaces',
    capabilityLabel,
  );
  const overlap = surfaces.filter((id) => unsupportedSurfaces.includes(id));
  if (overlap.length > 0) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_SURFACES',
      `${capabilityLabel} declara la misma superficie como soportada y no soportada.`,
      { details: overlap },
    );
  }

  // Una celda renderizada exige fuente fechada, fixture y fallback. Sin cualquiera de los tres la
  // afirmación sería configuración presentada como capacidad.
  if (RENDERED_SUPPORT.includes(support)) {
    const missing = [];
    if (source === null) missing.push('source');
    if (sourceCheckedOn === null) missing.push('sourceCheckedOn');
    if (minimumVersion === null) missing.push('minimumVersion');
    if (!FIXTURE_REFERENCE.test(configuration)) missing.push('configuration');
    if (fallback === null) missing.push('fallback');
    if (degradation === null) missing.push('degradation');
    if (surfaces.length === 0) missing.push('surfaces');
    if (missing.length > 0) {
      throw new ConstructorError(
        'HARNESS_CAPABILITY_UNPROVEN',
        `${capabilityLabel} declara ${support} sin la evidencia mínima de rendering.`,
        {
          details: missing,
          remediation:
            'Añada fuente oficial fechada, versión mínima, fixture, fallback, degradación y superficies, o degrade la capacidad.',
        },
      );
    }
    // Cuando alguna superficie oficial del proveedor no puede consumir el destino, la celda deja de ser
    // una fila genérica: se limita a generated y nombra las superficies excluidas.
    if (support === 'native' && unsupportedSurfaces.length > 0) {
      throw new ConstructorError(
        'HARNESS_CAPABILITY_SURFACE_DIVERGENCE',
        `${capabilityLabel} no puede declarar native mientras excluye superficies oficiales.`,
        {
          details: unsupportedSurfaces,
          remediation: 'Use generated y conserve unsupportedSurfaces con su fallback visible.',
        },
      );
    }
  } else if (fallback === null) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_FALLBACK',
      `${capabilityLabel} declara ${support} sin fallback visible.`,
      {
        remediation: 'Una superficie degradada o no soportada conserva un fallback declarado.',
      },
    );
  }

  return sortJson({
    configuration,
    degradation,
    fallback,
    minimumVersion,
    smoke: signals.smoke,
    source,
    sourceCheckedOn,
    startup: signals.startup,
    surfaces,
    toolListing: signals.toolListing,
    unsupportedSurfaces,
  });
}

function normalizeCapabilityMatrix(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_MATRIX_SCHEMA',
      'harness-capabilities.json debe contener un objeto.',
    );
  }

  const vocabulary = raw.vocabulary;
  if (!Array.isArray(vocabulary)) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_VOCABULARY',
      'La matriz debe declarar vocabulary.',
    );
  }
  const actualVocabulary = [...new Set(vocabulary)].sort();
  const expectedVocabulary = [...HARNESS_CAPABILITY_STATES].sort();
  if (
    actualVocabulary.length !== expectedVocabulary.length
    || actualVocabulary.some((value, index) => value !== expectedVocabulary[index])
  ) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_VOCABULARY',
      'La matriz debe usar exactamente native, generated, documented y unsupported.',
      {
        details: vocabulary,
      },
    );
  }

  if (!Array.isArray(raw.harnesses)) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_HARNESSES',
      'La matriz debe declarar harnesses.',
    );
  }
  uniqueIdList(raw.harnesses, 'harness-capabilities.json');
  const actualHarnesses = raw.harnesses.map((harness) => harness.id).sort();
  const expectedHarnesses = [...HARNESS_CAPABILITY_SCHEMA.harnesses].sort();
  if (
    actualHarnesses.length !== expectedHarnesses.length
    || actualHarnesses.some((value, index) => value !== expectedHarnesses[index])
  ) {
    throw new ConstructorError(
      'HARNESS_CAPABILITY_HARNESS_SET',
      'La matriz debe cubrir exactamente los cinco harnesses soportados.',
      {
        details: actualHarnesses,
      },
    );
  }

  const harnesses = raw.harnesses.map((harness) => {
    if (
      !harness.capabilities
      || typeof harness.capabilities !== 'object'
      || Array.isArray(harness.capabilities)
    ) {
      throw new ConstructorError(
        'HARNESS_CAPABILITY_SET',
        `${harness.id} no declara capabilities.`,
      );
    }
    const actualCapabilities = Object.keys(harness.capabilities).sort();
    const expectedCapabilities = [...HARNESS_CAPABILITY_SCHEMA.capabilities].sort();
    if (
      actualCapabilities.length !== expectedCapabilities.length
      || actualCapabilities.some((value, index) => value !== expectedCapabilities[index])
    ) {
      throw new ConstructorError(
        'HARNESS_CAPABILITY_SET',
        `${harness.id} debe declarar exactamente seis capacidades.`,
        {
          details: actualCapabilities,
        },
      );
    }

    const capabilities = {};
    for (const capability of HARNESS_CAPABILITY_SCHEMA.capabilities) {
      const contract = harness.capabilities[capability];
      if (!contract || typeof contract !== 'object' || Array.isArray(contract)) {
        throw new ConstructorError(
          'HARNESS_CAPABILITY_CONTRACT',
          `${harness.id}/${capability} no declara un contrato.`,
        );
      }
      if (!HARNESS_CAPABILITY_STATES.includes(contract.support)) {
        throw new ConstructorError(
          'HARNESS_CAPABILITY_STATE',
          `${harness.id}/${capability} usa el estado ${String(contract.support)}.`,
        );
      }
      if (typeof contract.target !== 'string' || contract.target === '') {
        throw new ConstructorError(
          'HARNESS_CAPABILITY_TARGET',
          `${harness.id}/${capability} no declara target.`,
        );
      }
      if (!OWNERS.includes(contract.owner)) {
        throw new ConstructorError(
          'HARNESS_CAPABILITY_OWNER',
          `${harness.id}/${capability} usa owner no soportado.`,
        );
      }
      if (typeof contract.validation !== 'string' || contract.validation === '') {
        throw new ConstructorError(
          'HARNESS_CAPABILITY_VALIDATION',
          `${harness.id}/${capability} no declara validation.`,
        );
      }
      capabilities[capability] = {
        owner: contract.owner,
        support: contract.support,
        target: contract.target,
        validation: contract.validation,
        verification: normalizeVerification(
          contract.verification,
          contract.support,
          `${harness.id}/${capability}`,
        ),
      };
    }

    return {
      capabilities,
      id: harness.id,
    };
  }).sort((left, right) => left.id.localeCompare(right.id));

  return sortJson({
    definitions: raw.definitions ?? {},
    harnesses,
    parityPolicy: raw.parityPolicy ?? {},
    schemaVersion: String(raw.schemaVersion ?? '1.0.0'),
    vocabulary: [...HARNESS_CAPABILITY_STATES],
  });
}

function normalizeEnvironment(raw, serverId) {
  if (raw === undefined || raw === null) {
    return {};
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new ConstructorError(
      'PROJECT_OS_MCP_ENV_INVALID',
      `env de MCP ${serverId} debe ser un objeto.`,
    );
  }

  const result = {};
  for (const [name, value] of Object.entries(raw).sort(([left], [right]) => left.localeCompare(right))) {
    if (!/^[A-Z][A-Z0-9_]*$/.test(name)) {
      throw new ConstructorError(
        'PROJECT_OS_MCP_ENV_NAME',
        `La variable ${name} de MCP ${serverId} no es válida.`,
      );
    }
    const reference = typeof value === 'object' && value !== null
      ? value.fromEnv
      : value;
    if (
      typeof reference !== 'string'
      || (
        reference !== name
        && reference !== `\${${name}}`
        && !/^\$\{[A-Z][A-Z0-9_]*\}$/.test(reference)
      )
    ) {
      throw new ConstructorError(
        'PROJECT_OS_MCP_LITERAL_SECRET',
        `MCP ${serverId} debe referenciar ${name} mediante entorno, no declarar un valor literal.`,
        {
          remediation: `Use "\${${name}}" o {"fromEnv":"${name}"}.`,
        },
      );
    }
    result[name] = `\${${reference.replace(/^\$\{|\}$/g, '')}}`;
  }
  return result;
}

function normalizeHeaders(raw, serverId) {
  if (raw === undefined || raw === null) {
    return {};
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new ConstructorError(
      'PROJECT_OS_MCP_HEADERS_INVALID',
      `headers de MCP ${serverId} debe ser un objeto.`,
    );
  }

  const result = {};
  for (const [name, value] of Object.entries(raw).sort(([left], [right]) => left.localeCompare(right))) {
    if (name.trim() === '') {
      throw new ConstructorError(
        'PROJECT_OS_MCP_HEADER_NAME',
        `MCP ${serverId} contiene un header sin nombre.`,
      );
    }
    const reference = typeof value === 'object' && value !== null
      ? value.fromEnv
      : value;
    if (
      typeof reference !== 'string'
      || !/^(?:[A-Z][A-Z0-9_]*|\$\{[A-Z][A-Z0-9_]*\})$/.test(reference)
    ) {
      throw new ConstructorError(
        'PROJECT_OS_MCP_LITERAL_SECRET',
        `MCP ${serverId} debe referenciar el header ${name} mediante entorno.`,
        {
          remediation: 'Use "${VARIABLE_DE_ENTORNO}" o {"fromEnv":"VARIABLE_DE_ENTORNO"}.',
        },
      );
    }
    result[name] = `\${${reference.replace(/^\$\{|\}$/g, '')}}`;
  }
  return result;
}

function normalizeMcp(raw) {
  let entries;
  if (Array.isArray(raw)) {
    entries = raw;
  } else if (Array.isArray(raw?.servers)) {
    entries = raw.servers;
  } else if (raw?.servers && typeof raw.servers === 'object') {
    entries = Object.entries(raw.servers).map(([id, server]) => ({ id, ...server }));
  } else {
    throw new ConstructorError('PROJECT_OS_MCP_SCHEMA', 'mcp.json debe declarar servers.');
  }

  const servers = entries.map((server) => {
    if (!/^[a-zA-Z0-9_-]+$/.test(server.id ?? '')) {
      throw new ConstructorError(
        'PROJECT_OS_MCP_ID',
        `El ID MCP ${String(server.id)} no puede contener puntos ni caracteres ambiguos.`,
      );
    }
    const hasCommand = typeof server.command === 'string' && server.command !== '';
    const hasUrl = typeof server.url === 'string' && server.url !== '';
    if (server.enabled !== false && hasCommand === hasUrl) {
      throw new ConstructorError(
        'PROJECT_OS_MCP_ENDPOINT',
        `MCP ${server.id} requiere exactamente uno de command o url.`,
      );
    }
    const args = server.args ?? [];
    if (!Array.isArray(args) || args.some((value) => typeof value !== 'string')) {
      throw new ConstructorError(
        'PROJECT_OS_MCP_ARGS',
        `args de MCP ${server.id} debe ser una lista de strings.`,
      );
    }
    return {
      args,
      command: server.command ?? null,
      enabled: server.enabled !== false,
      env: normalizeEnvironment(server.env, server.id),
      headers: normalizeHeaders(server.headers, server.id),
      id: server.id,
      url: server.url ?? null,
    };
  });
  uniqueIdList(servers, 'mcp.json');
  return servers.sort((left, right) => left.id.localeCompare(right.id));
}

function requireNonEmpty(value, aliases, profileId, label) {
  for (const alias of aliases) {
    const candidate = value[alias];
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate.map((item) => String(item));
    }
    if (typeof candidate === 'string' && candidate.trim() !== '') {
      return [candidate];
    }
  }
  throw new ConstructorError(
    'PROJECT_OS_PROFILE_INCOMPLETE',
    `El perfil ${profileId} no declara ${label}.`,
  );
}

function normalizeProfiles(raw) {
  const profileList = listFrom(raw, 'profiles', 'catalog').map((profile) => ({
    automaticValidations: requireNonEmpty(
      profile,
      ['automaticValidations', 'validations'],
      profile.id,
      'validaciones automáticas',
    ),
    closureGate: requireNonEmpty(
      profile,
      ['closureGate', 'closeGate', 'gate'],
      profile.id,
      'gate de cierre',
    ),
    id: profile.id,
    manualEvidence: requireNonEmpty(
      profile,
      ['manualEvidence', 'evidence'],
      profile.id,
      'evidencia manual',
    ),
    naConditions: requireNonEmpty(
      profile,
      ['naConditions', 'notApplicableWhen'],
      profile.id,
      'condiciones N/A',
    ),
    negativeCases: requireNonEmpty(
      profile,
      ['negativeCases', 'negativeTests'],
      profile.id,
      'casos negativos',
    ),
    rollback: requireNonEmpty(
      profile,
      ['rollback'],
      profile.id,
      'rollback',
    ),
  }));
  uniqueIdList(profileList, 'profiles.json');
  profileList.sort((left, right) => left.id.localeCompare(right.id));

  const activeRaw = raw.activeProfiles ?? raw.active ?? [];
  if (!Array.isArray(activeRaw)) {
    throw new ConstructorError(
      'PROJECT_OS_ACTIVE_PROFILES',
      'profiles.json debe declarar activeProfiles como lista.',
    );
  }
  const known = new Set(profileList.map((profile) => profile.id));
  const active = [...new Set(activeRaw.map(String))].sort((left, right) => left.localeCompare(right));
  const missing = active.filter((id) => !known.has(id));
  if (missing.length > 0) {
    throw new ConstructorError(
      'PROJECT_OS_ACTIVE_PROFILE_UNKNOWN',
      'Hay perfiles activos que no existen en el catálogo.',
      {
        details: missing,
      },
    );
  }
  return {
    active,
    profiles: profileList,
  };
}

async function readCanonicalSource(targetRoot, baseBlueprint, relativePath) {
  const manifestEntry = baseBlueprint.entries.find((entry) => entry.target === relativePath);
  if (!manifestEntry) {
    throw new ConstructorError(
      'PROJECT_OS_SOURCE_UNDECLARED',
      `${relativePath} no está declarado en manifest.json.`,
    );
  }
  if (manifestEntry.owner !== 'project') {
    throw new ConstructorError(
      'PROJECT_OS_SOURCE_OWNER',
      `${relativePath} debe usar owner project (seed-once).`,
    );
  }

  await assertNoSymlinkEscape(targetRoot, relativePath);
  const absolute = resolveInside(targetRoot, relativePath);
  try {
    const stats = await lstat(absolute);
    if (!stats.isFile()) {
      throw new ConstructorError(
        'PROJECT_OS_SOURCE_NOT_FILE',
        `${relativePath} existe pero no es un archivo regular.`,
      );
    }
    return await readFile(absolute);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      if (manifestEntry.content === null) {
        throw new ConstructorError(
          'PROJECT_OS_SOURCE_MISSING',
          `${relativePath} no existe y el blueprint no ofrece semilla.`,
        );
      }
      return manifestEntry.content;
    }
    throw error;
  }
}

function parseCanonicalJson(buffer, relativePath) {
  try {
    return JSON.parse(normalizeLf(buffer.toString('utf8')));
  } catch (error) {
    throw new ConstructorError(
      'PROJECT_OS_JSON_INVALID',
      `${relativePath} no contiene JSON válido.`,
      {
        details: error.message,
        cause: error,
      },
    );
  }
}

async function loadCanonicalProjectOs(targetRoot, baseBlueprint) {
  const buffers = {};
  for (const [id, relativePath] of Object.entries(PROJECT_OS_SOURCES)) {
    buffers[id] = await readCanonicalSource(targetRoot, baseBlueprint, relativePath);
  }

  const instructions = normalizeLf(buffers.instructions.toString('utf8'));
  if (instructions.trim() === '') {
    throw new ConstructorError(
      'PROJECT_OS_INSTRUCTIONS_EMPTY',
      `${PROJECT_OS_SOURCES.instructions} no puede estar vacío.`,
    );
  }

  return {
    capabilityMatrix: normalizeCapabilityMatrix(
      parseCanonicalJson(buffers.capabilityMatrix, PROJECT_OS_SOURCES.capabilityMatrix),
    ),
    instructions,
    mcp: normalizeMcp(parseCanonicalJson(buffers.mcp, PROJECT_OS_SOURCES.mcp)),
    pathRules: normalizePathRules(
      parseCanonicalJson(buffers.pathRules, PROJECT_OS_SOURCES.pathRules),
    ),
    permissions: normalizePermissions(
      parseCanonicalJson(buffers.permissions, PROJECT_OS_SOURCES.permissions),
    ),
    profiles: normalizeProfiles(
      parseCanonicalJson(buffers.profiles, PROJECT_OS_SOURCES.profiles),
    ),
    skills: normalizeSkills(parseCanonicalJson(buffers.skills, PROJECT_OS_SOURCES.skills)),
  };
}

function markdownPathRules(rules) {
  return rules.map((rule) => [
    `### ${rule.id}`,
    '',
    `Globs: ${rule.globs.map((glob) => `\`${glob}\``).join(', ')}`,
    '',
    ...rule.instructions.map((instruction) => `- ${instruction}`),
  ].join('\n')).join('\n\n');
}

function markdownSkills(skills) {
  return skills.map((skill) => [
    `### ${skill.id}`,
    '',
    skill.description || 'Sin descripción adicional.',
    '',
    `Estado: ${skill.enabled ? 'activa' : 'inactiva'}.`,
    '',
    ...skill.instructions.map((instruction) => `- ${instruction}`),
  ].join('\n')).join('\n\n');
}

function markdownPermissions(permissions) {
  return permissions.map((permission) => [
    `- \`${permission.effect}\` ${permission.commands.map((command) => `\`${command}\``).join(', ')}`,
    permission.reason ? `  Motivo: ${permission.reason}` : null,
  ].filter(Boolean).join('\n')).join('\n');
}

function markdownMcp(servers) {
  if (servers.length === 0) {
    return 'No hay MCP universales activos.';
  }
  return servers.map((server) => {
    const envNames = Object.keys(server.env);
    return [
      `- \`${server.id}\`: ${server.enabled ? 'activo' : 'inactivo'}.`,
      envNames.length > 0 ? `  Variables requeridas: ${envNames.join(', ')}.` : null,
    ].filter(Boolean).join('\n');
  }).join('\n');
}

function markdownProfiles(profiles) {
  return [
    `Perfiles activos: ${profiles.active.length > 0 ? profiles.active.join(', ') : 'ninguno'}.`,
    '',
    ...profiles.profiles.map((profile) => (
      `- \`${profile.id}\`: ${profiles.active.includes(profile.id) ? 'activo' : 'inactivo'}; gate: ${profile.closureGate.join('; ')}`
    )),
  ].join('\n');
}

function signalCell(value) {
  return value === NOT_VERIFIED ? 'no verificado' : value.replace(/^receipt:/, 'receipt ');
}

function markdownCapabilityMatrix(matrix) {
  const rows = [
    '| Harness | Capacidad | Estado | Destino | Validación | Versión mínima | Configuración | Startup | Tool listing | Smoke | Fallback |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
  ];
  const sources = [];
  const divergences = [];
  for (const harness of matrix.harnesses) {
    for (const capability of HARNESS_CAPABILITY_SCHEMA.capabilities) {
      const entry = harness.capabilities[capability];
      const check = entry.verification;
      rows.push([
        '',
        harness.id,
        capability,
        entry.support,
        entry.target,
        entry.validation,
        check?.minimumVersion ?? 'sin declarar',
        check?.configuration ?? 'sin declarar',
        signalCell(check?.startup ?? NOT_VERIFIED),
        signalCell(check?.toolListing ?? NOT_VERIFIED),
        signalCell(check?.smoke ?? NOT_VERIFIED),
        check?.fallback ?? 'sin declarar',
        '',
      ].join(' | ').trim());
      if (check?.source) {
        sources.push(`| ${harness.id} | ${capability} | ${check.source} | ${check.sourceCheckedOn} |`);
      }
      if (check && check.unsupportedSurfaces.length > 0) {
        divergences.push(
          `| ${harness.id} | ${capability} | ${check.surfaces.join(', ')} | ${check.unsupportedSurfaces.join(', ')} |`,
        );
      }
    }
  }

  const superseded = [];
  for (const harness of matrix.harnesses) {
    for (const capability of HARNESS_CAPABILITY_SCHEMA.capabilities) {
      const entry = harness.capabilities[capability];
      if (entry.supersededBy) {
        superseded.push(
          `| ${harness.id} | ${capability} | ${entry.target} | ${entry.supersededBy} |`,
        );
      }
    }
  }

  const blocks = [rows.join('\n')];
  if (superseded.length > 0) {
    blocks.push([
      '### Destinos retirados declarados por esta copia',
      '',
      'Esta copia de `.project-os/harness-capabilities.json` todavía nombra rutas retiradas. La capacidad se',
      'entrega por el reemplazo instalado, así que nada se rompe, pero la celda quedó desactualizada. El',
      'archivo es seed-once y pertenece al repositorio: el constructor no lo reescribe.',
      '',
      '| Harness | Capacidad | Destino declarado | Reemplazo instalado |',
      '|---|---|---|---|',
      ...superseded,
    ].join('\n'));
  }
  blocks.push([
    'Configuración, startup, tool listing y smoke son señales distintas. La configuración la produce una',
    'fixture offline; startup, tool listing y smoke solo pueden declararse con un receipt opt-in vigente y',
    'nunca los genera la CI. Una celda `native` describe el rendering en la superficie oficial documentada,',
    'no que un agente la haya cargado.',
  ].join('\n'));
  if (divergences.length > 0) {
    blocks.push([
      '### Superficies divergentes',
      '',
      '| Harness | Capacidad | Superficies que consumen | Superficies sin archivo versionado |',
      '|---|---|---|---|',
      ...divergences,
    ].join('\n'));
  }
  if (sources.length > 0) {
    blocks.push([
      '### Fuentes oficiales consultadas',
      '',
      '| Harness | Capacidad | Fuente | Consultada |',
      '|---|---|---|---|',
      ...sources,
    ].join('\n'));
  }
  return blocks.join('\n\n');
}

export function jsonMcpServers(servers, target) {
  return Object.fromEntries(
    servers
      .filter((server) => server.enabled)
      .map((server) => [
        server.id,
        target === 'opencode.json'
          ? sortJson(server.command
            ? {
              command: [server.command, ...(server.args ?? [])],
              enabled: true,
              ...(Object.keys(server.env ?? {}).length > 0
                ? { environment: server.env }
                : {}),
              type: 'local',
            }
            : {
              enabled: true,
              ...(Object.keys(server.headers ?? {}).length > 0
                ? { headers: server.headers }
                : {}),
              type: 'remote',
              url: server.url,
            })
          : sortJson({
            ...(server.command ? { command: server.command } : {}),
            ...((server.args ?? []).length > 0 ? { args: server.args } : {}),
            ...(Object.keys(server.env ?? {}).length > 0 ? { env: server.env } : {}),
            ...(Object.keys(server.headers ?? {}).length > 0 ? { headers: server.headers } : {}),
            ...(server.url ? { url: server.url } : {}),
          }),
      ]),
  );
}

function jsonPermissions(permissions, target) {
  if (target === 'opencode.json' || target === '.claude/settings.json') {
    return {};
  }

  return {
    allow: permissions
      .filter((permission) => permission.effect === 'allow')
      .flatMap((permission) => permission.commands)
      .sort(),
    ask: permissions
      .filter((permission) => permission.effect === 'ask')
      .flatMap((permission) => permission.commands)
      .sort(),
    deny: permissions
      .filter((permission) => permission.effect === 'deny')
      .flatMap((permission) => permission.commands)
      .sort(),
  };
}

function tomlString(value) {
  return JSON.stringify(value);
}

function tomlMcp(servers) {
  const blocks = [];
  for (const server of servers.filter((candidate) => candidate.enabled)) {
    blocks.push(`[mcp_servers.${server.id}]`);
    if (server.command) {
      blocks.push(`command = ${tomlString(server.command)}`);
    }
    if (server.args.length > 0) {
      blocks.push(`args = [${server.args.map(tomlString).join(', ')}]`);
    }
    if (server.url) {
      blocks.push(`url = ${tomlString(server.url)}`);
    }
    if (Object.keys(server.env).length > 0) {
      const env = Object.entries(server.env)
        .map(([name, value]) => `${name} = ${tomlString(value)}`)
        .join(', ');
      blocks.push(`env = { ${env} }`);
    }
    blocks.push('');
  }
  return blocks.join('\n').trimEnd();
}

function tomlPermissions(permissions) {
  return [
    '# Permisos documentales: Codex no debe interpretarlos como enforcement equivalente.',
    ...permissions.map((permission) => (
      `# ${permission.effect}: ${permission.commands.join(', ')}${permission.reason ? ` - ${permission.reason}` : ''}`
    )),
  ].join('\n');
}

function tokenValue(tokenId, target, canonical) {
  const isJson = target.toLowerCase().endsWith('.json');
  const isToml = target.toLowerCase().endsWith('.toml');

  switch (tokenId) {
    case 'instructions':
      if (isJson) {
        if (target === 'opencode.json') {
          return JSON.stringify(['AGENTS.md', '.opencode/project-os.md']);
        }
        return JSON.stringify(canonical.instructions);
      }
      return canonical.instructions.trimEnd();
    case 'pathRules':
      return isJson
        ? JSON.stringify(canonical.pathRules, null, 2)
        : markdownPathRules(canonical.pathRules);
    case 'skills':
      return isJson
        ? JSON.stringify(canonical.skills, null, 2)
        : markdownSkills(canonical.skills);
    case 'permissions':
      if (isToml) {
        return tomlPermissions(canonical.permissions);
      }
      return isJson
        ? JSON.stringify(jsonPermissions(canonical.permissions, target), null, 2)
        : markdownPermissions(canonical.permissions);
    case 'mcp':
      if (isToml) {
        return tomlMcp(canonical.mcp);
      }
      return isJson
        ? JSON.stringify(jsonMcpServers(canonical.mcp, target), null, 2)
        : markdownMcp(canonical.mcp);
    case 'profiles':
      return isJson
        ? JSON.stringify(canonical.profiles, null, 2)
        : markdownProfiles(canonical.profiles);
    case 'capabilityMatrix':
      return isJson
        ? JSON.stringify(canonical.capabilityMatrix, null, 2)
        : markdownCapabilityMatrix(canonical.capabilityMatrix);
    default:
      throw new ConstructorError('PROJECT_OS_TOKEN_UNKNOWN', `Token interno desconocido: ${tokenId}.`);
  }
}

function renderShell(entry, canonical) {
  if (entry.content === null || !['constructor', 'human-overlay'].includes(entry.owner)) {
    return entry;
  }
  let text = normalizeLf(entry.content.toString('utf8'));
  const declaredTokens = [...text.matchAll(TOKEN_PATTERN)].map((match) => match[1]);
  for (const rawToken of [...new Set(declaredTokens)]) {
    const tokenId = TOKENS[rawToken];
    if (!tokenId) {
      throw new ConstructorError(
        'PROJECT_OS_TOKEN_UNKNOWN',
        `El shell ${entry.source} usa el token no soportado {{${rawToken}}}.`,
      );
    }
    text = text.replaceAll(`{{${rawToken}}}`, tokenValue(tokenId, entry.target, canonical));
  }

  const unresolved = [...text.matchAll(TOKEN_PATTERN)].map((match) => match[0]);
  if (unresolved.length > 0) {
    throw new ConstructorError(
      'PROJECT_OS_TOKEN_UNRESOLVED',
      `El shell de ${entry.target} conserva tokens sin resolver.`,
      {
        details: [...new Set(unresolved)],
      },
    );
  }

  let content = Buffer.from(text, 'utf8');
  if (entry.target.toLowerCase().endsWith('.json')) {
    try {
      content = Buffer.from(stableStringify(JSON.parse(text)), 'utf8');
    } catch (error) {
      throw new ConstructorError(
        'PROJECT_OS_RENDERED_JSON_INVALID',
        `El shell renderizado de ${entry.target} no es JSON válido.`,
        {
          details: error.message,
          remediation:
            'Asegure que los tokens JSON ocupen una posición de valor y que el shell use comas correctas.',
          cause: error,
        },
      );
    }
  }

  return {
    ...entry,
    content,
    sourceHash: sha256(content),
  };
}

export function parseCodexMcpServerIds(toml) {
  const ids = new Set();
  const rootTable = /^\s*\[\s*mcp_servers\.(?:"([^"]+)"|([a-zA-Z0-9_-]+))\s*\]\s*(?:#.*)?$/;
  for (const line of normalizeLf(toml).split('\n')) {
    const match = rootTable.exec(line);
    if (match) {
      ids.add(match[1] ?? match[2]);
    }
  }
  return [...ids].sort((left, right) => left.localeCompare(right));
}

function jsonMcpIds(target, text) {
  const parsed = JSON.parse(text);
  let servers;
  if (target === 'opencode.json') {
    servers = parsed.mcp ?? parsed.mcpServers ?? {};
  } else {
    servers = parsed.mcpServers ?? parsed.mcp ?? parsed;
  }
  if (!servers || typeof servers !== 'object' || Array.isArray(servers)) {
    return [];
  }
  return Object.keys(servers).sort((left, right) => left.localeCompare(right));
}

function assertSameIds(actual, expected, target) {
  if (actual.length !== expected.length || actual.some((id, index) => id !== expected[index])) {
    throw new ConstructorError(
      'PROJECT_OS_MCP_PARITY',
      `El adaptador ${target} no conserva los MCP activos.`,
      {
        details: [
          `esperados=${expected.join(',')}`,
          `actuales=${actual.join(',')}`,
        ],
      },
    );
  }
}

function validateRenderedMcp(entries, canonical) {
  const expected = canonical.mcp
    .filter((server) => server.enabled)
    .map((server) => server.id)
    .sort((left, right) => left.localeCompare(right));
  const targets = ['.codex/config.toml', '.cursor/mcp.json', '.mcp.json', 'opencode.json'];
  for (const target of targets) {
    const entry = entries.find((candidate) => candidate.target === target);
    if (!entry) {
      continue;
    }
    const text = entry.content.toString('utf8');
    const actual = target.endsWith('.toml')
      ? parseCodexMcpServerIds(text)
      : jsonMcpIds(target, text);
    assertSameIds(actual, expected, target);
  }
}

/**
 * Resuelve destinos retirados contra su reemplazo instalado.
 *
 * Devuelve la matriz anotada y la lista de celdas desactualizadas. No edita el archivo del consumidor:
 * la anotación viaja solo en memoria y se publica como degradación visible en los espejos generados.
 */
export function resolveRetiredTargets(matrix, installedTargets) {
  const retired = [];
  const harnesses = matrix.harnesses.map((harness) => {
    const capabilities = {};
    for (const capability of HARNESS_CAPABILITY_SCHEMA.capabilities) {
      const contract = harness.capabilities[capability];
      const supersession = RETIRED_CAPABILITY_TARGETS[contract.target];
      if (
        supersession
        && !installedTargets.has(contract.target)
        && installedTargets.has(supersession.replacement)
      ) {
        retired.push({
          capability: `${harness.id}/${capability}`,
          declared: contract.target,
          reason: supersession.reason,
          resolved: supersession.replacement,
        });
        capabilities[capability] = { ...contract, supersededBy: supersession.replacement };
      } else {
        capabilities[capability] = contract;
      }
    }
    return { ...harness, capabilities };
  });

  return {
    matrix: { ...matrix, harnesses },
    retired: retired.sort((left, right) => left.capability.localeCompare(right.capability)),
  };
}

function validateCapabilityMatrix(entries, matrix) {
  const targets = new Map(entries.map((entry) => [entry.target, entry]));
  for (const harness of matrix.harnesses) {
    for (const capability of HARNESS_CAPABILITY_SCHEMA.capabilities) {
      const contract = harness.capabilities[capability];
      if (!HARNESS_CAPABILITY_STATES.includes(contract.support)) {
        throw new ConstructorError(
          'HARNESS_CAPABILITY_STATE',
          `${harness.id}/${capability} usa un estado no soportado.`,
        );
      }
      const effectiveTarget = contract.supersededBy ?? contract.target;
      const targetEntry = targets.get(effectiveTarget);
      if (!targetEntry) {
        const supersession = RETIRED_CAPABILITY_TARGETS[contract.target];
        throw new ConstructorError(
          'HARNESS_CAPABILITY_UNPROVEN',
          `${harness.id}/${capability} declara ${contract.target}, pero manifest.json no lo instala.`,
          {
            details: supersession ? [`reemplazo esperado: ${supersession.replacement}`] : [],
            remediation: supersession
              ? `${contract.target} fue retirado. ${supersession.reason} Actualice esa celda de .project-os/harness-capabilities.json a ${supersession.replacement}.`
              : 'Añada el shell correspondiente o degrade la capacidad de forma explícita.',
          },
        );
      }
      if (targetEntry.owner !== contract.owner) {
        throw new ConstructorError(
          'HARNESS_CAPABILITY_OWNER_DRIFT',
          `${harness.id}/${capability} declara owner ${contract.owner}, pero ${effectiveTarget} usa ${targetEntry.owner}.`,
        );
      }
    }
  }
}

export async function materializeHarnessBlueprint({
  baseBlueprint,
  targetRoot,
}) {
  const canonical = await loadCanonicalProjectOs(targetRoot, baseBlueprint);
  const configuredProfiles = [...baseBlueprint.activeProfiles].sort();
  if (
    configuredProfiles.length !== canonical.profiles.active.length
    || configuredProfiles.some((profile, index) => profile !== canonical.profiles.active[index])
  ) {
    throw new ConstructorError(
      'PROJECT_OS_PROFILE_SELECTION_DRIFT',
      'config.json y .project-os/profiles.json declaran perfiles activos distintos.',
      {
        details: [
          `config=${configuredProfiles.join(',')}`,
          `project-os=${canonical.profiles.active.join(',')}`,
        ],
        remediation:
          'Registre una decisión y actualice ambas superficies en una migración explícita antes de sincronizar.',
      },
    );
  }
  // Un consumidor seed-once puede nombrar todavía un destino retirado. Se resuelve contra su reemplazo
  // instalado antes de renderizar, para que la desactualización quede visible en los espejos en vez de
  // romper el sync o de desaparecer en silencio.
  const supersession = resolveRetiredTargets(
    canonical.capabilityMatrix,
    new Set(baseBlueprint.entries.map((entry) => entry.target)),
  );
  canonical.capabilityMatrix = supersession.matrix;

  const renderedEntries = baseBlueprint.entries.map((entry) => renderShell(entry, canonical));
  const distributionEntries = await packageDistributionEntries();
  const distributionHash = sha256Json(distributionEntries.map((entry) => ({
    hash: entry.sourceHash,
    source: entry.source,
    target: entry.target,
  })));
  // La identidad se calcula sobre el paquete completo, pero el consumidor no recibe una copia
  // editable del runtime. El binario se resuelve desde la dependencia exacta del lockfile.
  const entries = renderedEntries;
  const targets = new Set();
  for (const entry of entries) {
    if (targets.has(entry.target)) {
      throw new ConstructorError(
        'BLUEPRINT_TARGET_COLLISION',
        `El blueprint renderizado contiene dos owners para ${entry.target}.`,
      );
    }
    targets.add(entry.target);
  }
  validateCapabilityMatrix(entries, canonical.capabilityMatrix);
  validateRenderedMcp(entries, canonical);

  const blueprintHash = sha256Json({
    baseBlueprintHash: baseBlueprint.blueprintHash,
    canonical,
    rendered: entries.map(({ content, ...entry }) => ({
      ...entry,
      contentHash: content === null ? null : sha256(content),
    })),
  });

  return {
    ...baseBlueprint,
    blueprintHash,
    canonical,
    distributionHash,
    entries: entries.sort((left, right) => left.target.localeCompare(right.target)),
    retiredCapabilityTargets: supersession.retired,
  };
}
