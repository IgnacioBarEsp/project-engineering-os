// Contrato verificable de adapters por agente.
//
// Cada fixture declarada en `verification.configuration` se resuelve aquí. El contrato comprueba lo único
// que puede comprobarse sin instalar el agente del proveedor ni autenticar un modelo: que el constructor
// escriba la ruta oficial documentada, en el formato documentado. No prueba startup, tool listing ni smoke,
// y ninguna función de este archivo puede declararlos.

import { HARNESS_CAPABILITY_SCHEMA, HARNESS_RUNTIME_SIGNALS } from '../src/harness.mjs';

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;

function parseFrontmatter(text) {
  const match = FRONTMATTER.exec(text.replace(/\r\n?/g, '\n'));
  if (!match) {
    return { fields: null, body: '', failure: 'missing-frontmatter' };
  }
  const fields = {};
  for (const line of match[1].split('\n')) {
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue;
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim();
    const raw = line.slice(separator + 1).trim();
    if (key === '' || raw === '') continue;
    fields[key] = raw.replace(/^["']|["']$/g, '');
  }
  return { fields, body: match[2], failure: null };
}

// Agent Skills: el nombre del frontmatter debe coincidir con la carpeta contenedora. Claude Code, Codex,
// Cursor, Copilot y OpenCode declaran esa misma regla, así que un solo contrato cubre las cinco.
function agentSkillFrontmatter(target, text) {
  const failures = [];
  const segments = target.split('/');
  if (segments.at(-1) !== 'SKILL.md') {
    failures.push('skill-filename');
  }
  const folder = segments.at(-2) ?? '';
  const { fields, body, failure } = parseFrontmatter(text);
  if (failure) {
    return [failure];
  }
  if (!fields.name) {
    failures.push('missing-name');
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.name)) {
    failures.push('name-not-kebab-case');
  } else if (fields.name !== folder) {
    failures.push('name-does-not-match-folder');
  }
  if (!fields.description) {
    failures.push('missing-description');
  }
  if (body.trim() === '') {
    failures.push('empty-body');
  }
  return failures;
}

function cursorRuleFrontmatter(target, text) {
  const failures = [];
  if (!target.endsWith('.mdc')) {
    failures.push('cursor-rule-extension');
  }
  const { fields, body, failure } = parseFrontmatter(text);
  if (failure) {
    return [failure];
  }
  if (!fields.description) {
    failures.push('missing-description');
  }
  if (!('alwaysApply' in fields) && !('globs' in fields)) {
    failures.push('missing-scope');
  }
  if (body.trim() === '') {
    failures.push('empty-body');
  }
  return failures;
}

function copilotPathInstructions(target, text) {
  const failures = [];
  if (!target.endsWith('.instructions.md')) {
    failures.push('copilot-instructions-extension');
  }
  const { fields, body, failure } = parseFrontmatter(text);
  if (failure) {
    return [failure];
  }
  if (!fields.applyTo) {
    failures.push('missing-apply-to');
  }
  if (body.trim() === '') {
    failures.push('empty-body');
  }
  return failures;
}

// El espejo de instrucciones debe contener el texto canónico, no solo existir. Sin esta comprobación una
// celda `native` quedaría probada por un archivo vacío con encabezado, que es exactamente el sello de goma
// que este contrato debe impedir.
function mirroredInstructions(target, text, context = {}) {
  const normalized = text.replace(/\r\n?/g, '\n');
  if (normalized.trim() === '') {
    return ['empty-document'];
  }
  const canonical = context.instructions;
  if (typeof canonical !== 'string' || canonical.trim() === '') {
    return ['canonical-instructions-unavailable'];
  }
  const missing = canonical
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length >= 24 && !line.startsWith('#'))
    .filter((line) => !normalized.includes(line));
  return missing.length > 0 ? [`canonical-instructions-not-mirrored:${missing.length}`] : [];
}

function nonEmptyMarkdown(target, text) {
  return text.replace(/\r\n?/g, '\n').trim() === '' ? ['empty-document'] : [];
}

function jsonMcpServers(target, text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return ['invalid-json'];
  }
  const servers = parsed.mcpServers ?? parsed.mcp;
  if (!servers || typeof servers !== 'object' || Array.isArray(servers)) {
    return ['missing-mcp-servers-object'];
  }
  return Object.entries(servers).flatMap(([id, server]) => (
    server && typeof server === 'object' && !Array.isArray(server) ? [] : [`invalid-server:${id}`]
  ));
}

function opencodeMcpServers(target, text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return ['invalid-json'];
  }
  if (!parsed.mcp || typeof parsed.mcp !== 'object' || Array.isArray(parsed.mcp)) {
    return ['missing-mcp-object'];
  }
  return Object.entries(parsed.mcp).flatMap(([id, server]) => (
    ['local', 'remote'].includes(server?.type) ? [] : [`invalid-server-type:${id}`]
  ));
}

function opencodeInstructions(target, text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return ['invalid-json'];
  }
  if (!Array.isArray(parsed.instructions) || parsed.instructions.length === 0) {
    return ['missing-instructions-array'];
  }
  return parsed.instructions.some((entry) => typeof entry !== 'string' || entry.trim() === '')
    ? ['invalid-instruction-entry']
    : [];
}

function codexTomlMcpServers(target, text) {
  const normalized = text.replace(/\r\n?/g, '\n');
  if (!normalized.trim().startsWith('#')) {
    return ['missing-generated-header'];
  }
  const stray = normalized
    .split('\n')
    .filter((line) => /^\s*\[/.test(line) && !/^\s*\[\s*mcp_servers[.\]]/.test(line));
  return stray.length > 0 ? ['unexpected-toml-table'] : [];
}

export const HARNESS_FIXTURES = Object.freeze({
  'agent-skill-frontmatter': agentSkillFrontmatter,
  'claude-instructions': mirroredInstructions,
  'codex-instructions': mirroredInstructions,
  'codex-toml-mcp-servers': codexTomlMcpServers,
  'copilot-instructions': mirroredInstructions,
  'copilot-path-instructions': copilotPathInstructions,
  'generated-fallback': nonEmptyMarkdown,
  'cursor-rule-frontmatter': cursorRuleFrontmatter,
  'json-mcp-servers': jsonMcpServers,
  'opencode-instructions': opencodeInstructions,
  'opencode-mcp-servers': opencodeMcpServers,
});

// Adapters administrados que un harness lee aunque su celda esté degradada. Sin esta lista, un archivo como
// `.github/instructions/project-os.instructions.md` podría romper su frontmatter sin que nada falle, porque
// la celda `pathRules` declara `not-applicable` a propósito.
export const ADAPTER_CONTRACTS = Object.freeze({
  '.agents/skills/project-os/SKILL.md': 'agent-skill-frontmatter',
  '.claude/rules/project-os.md': 'generated-fallback',
  '.claude/skills/project-os/SKILL.md': 'agent-skill-frontmatter',
  '.codex/config.toml': 'codex-toml-mcp-servers',
  '.cursor/mcp.json': 'json-mcp-servers',
  '.cursor/rules/project-os.mdc': 'cursor-rule-frontmatter',
  '.github/copilot-instructions.md': 'copilot-instructions',
  '.github/instructions/project-os.instructions.md': 'copilot-path-instructions',
  '.mcp.json': 'json-mcp-servers',
  '.opencode/project-os.md': 'generated-fallback',
  'AGENTS.md': 'codex-instructions',
  'CLAUDE.md': 'claude-instructions',
  'opencode.json': 'opencode-mcp-servers',
});

/**
 * Comprueba cada adapter administrado contra su contrato, incluidos los de celdas degradadas.
 */
export function checkInstalledAdapters(contents, context = {}) {
  const failures = [];
  for (const [target, id] of Object.entries(ADAPTER_CONTRACTS)) {
    const text = contents.get(target);
    if (text === undefined) {
      failures.push(`${target}: adapter-not-installed`);
      continue;
    }
    for (const failure of HARNESS_FIXTURES[id](target, text, context)) {
      failures.push(`${target}: ${failure}`);
    }
  }
  return failures.sort((left, right) => left.localeCompare(right));
}

export function fixtureId(reference) {
  return reference?.startsWith('fixture:') ? reference.slice('fixture:'.length) : null;
}

/**
 * Comprueba el contrato de una celda contra el contenido realmente renderizado.
 * Devuelve una lista de fallos; vacía significa que el adapter cumple su contrato offline.
 */
export function checkCapabilityContract({ capability, harnessId, contract, contents, context = {} }) {
  const label = `${harnessId}/${capability}`;
  const check = contract.verification;
  const failures = [];

  if (!check) {
    return [`${label}: missing-verification`];
  }

  for (const signal of HARNESS_RUNTIME_SIGNALS) {
    if (check[signal] !== 'not-verified' && !check[signal]?.startsWith('receipt:')) {
      failures.push(`${label}: runtime-signal-not-declarable:${signal}`);
    }
  }

  const id = fixtureId(check.configuration);
  if (id === null) {
    if (['native', 'generated'].includes(contract.support)) {
      failures.push(`${label}: rendered-cell-without-fixture`);
    }
    return failures;
  }

  const fixture = HARNESS_FIXTURES[id];
  if (!fixture) {
    failures.push(`${label}: unknown-fixture:${id}`);
    return failures;
  }

  const text = contents.get(contract.target);
  if (text === undefined) {
    failures.push(`${label}: target-not-installed:${contract.target}`);
    return failures;
  }

  for (const failure of fixture(contract.target, text, context)) {
    failures.push(`${label}: ${failure}`);
  }
  return failures;
}

/**
 * Contrato de promoción de un harness candidato.
 *
 * Un candidato entra a la matriz soportada solo cuando cumple exactamente lo mismo que exige una celda
 * renderizada: renderer con destino declarado, fuente oficial fechada, versión mínima, fixture existente,
 * fallback y degradación por cada una de las seis capacidades. Parecerse a otra superficie no basta.
 */
export function checkCandidatePromotion(candidate) {
  const blockers = [];
  const label = candidate?.id ?? 'unknown-candidate';

  if (typeof candidate?.id !== 'string' || !SURFACE_ID_PATTERN.test(candidate.id ?? '')) {
    blockers.push(`${label}: invalid-candidate-id`);
  }
  if (candidate?.status !== 'unsupported') {
    blockers.push(`${label}: candidate-must-declare-unsupported`);
  }
  if (!Array.isArray(candidate?.sources) || candidate.sources.length === 0) {
    blockers.push(`${label}: missing-official-sources`);
  }

  const capabilities = candidate?.capabilities ?? {};
  for (const capability of HARNESS_CAPABILITY_SCHEMA.capabilities) {
    const entry = capabilities[capability];
    if (!entry) {
      blockers.push(`${label}/${capability}: missing-capability-assessment`);
      continue;
    }
    if (typeof entry.rendererTarget !== 'string' || entry.rendererTarget.trim() === '') {
      blockers.push(`${label}/${capability}: no-renderer-target`);
    }
    if (typeof entry.source !== 'string' || !/^https:\/\/[^\s"']+$/.test(entry.source)) {
      blockers.push(`${label}/${capability}: no-official-source`);
    }
    if (typeof entry.sourceCheckedOn !== 'string' || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(entry.sourceCheckedOn)) {
      blockers.push(`${label}/${capability}: no-dated-source`);
    }
    if (typeof entry.minimumVersion !== 'string' || entry.minimumVersion.trim() === '') {
      blockers.push(`${label}/${capability}: no-minimum-version`);
    }
    const id = fixtureId(entry.configuration);
    if (id === null) {
      blockers.push(`${label}/${capability}: no-fixture`);
    } else if (!HARNESS_FIXTURES[id]) {
      blockers.push(`${label}/${capability}: unknown-fixture:${id}`);
    }
    if (typeof entry.fallback !== 'string' || entry.fallback.trim() === '') {
      blockers.push(`${label}/${capability}: no-fallback`);
    }
    if (typeof entry.degradation !== 'string' || entry.degradation.trim() === '') {
      blockers.push(`${label}/${capability}: no-declared-degradation`);
    }
  }

  return {
    blockers: blockers.sort((left, right) => left.localeCompare(right)),
    promotable: blockers.length === 0,
  };
}

const SURFACE_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

/**
 * Aplica el contrato a la matriz completa. `contents` mapea target -> texto instalado.
 */
export function checkCapabilityMatrixContract(matrix, contents, context = {}) {
  const failures = [];
  for (const harness of matrix.harnesses) {
    for (const capability of HARNESS_CAPABILITY_SCHEMA.capabilities) {
      failures.push(...checkCapabilityContract({
        capability,
        contents,
        context,
        contract: harness.capabilities[capability],
        harnessId: harness.id,
      }));
    }
  }
  return failures.sort((left, right) => left.localeCompare(right));
}
