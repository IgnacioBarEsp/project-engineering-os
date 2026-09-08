import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { loadBlueprint } from '../src/blueprint.mjs';
import {
  HARNESS_CAPABILITY_SCHEMA,
  HARNESS_RUNTIME_SIGNALS,
  MINIMUM_VERSION_SENTINELS,
  RETIRED_CAPABILITY_TARGETS,
  materializeHarnessBlueprint,
  resolveRetiredTargets,
} from '../src/harness.mjs';
import {
  ADAPTER_CONTRACTS,
  HARNESS_FIXTURES,
  checkCandidatePromotion,
  checkCapabilityMatrixContract,
  checkInstalledAdapters,
  fixtureId,
} from '../scripts/harness-contract.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const seedPath = path.join(packageRoot, 'blueprint', 'core', 'project-os', 'harness-capabilities.json');

async function readSeed() {
  return JSON.parse(await readFile(seedPath, 'utf8'));
}

async function materializeSeed() {
  const baseBlueprint = await loadBlueprint({});
  // A seed test must not inherit the upstream's own conditional profile selections.
  return materializeHarnessBlueprint({
    baseBlueprint,
    targetRoot: path.join(packageRoot, 'test', 'fixtures', 'nonexistent-consumer'),
  });
}

function renderedContents(blueprint) {
  return new Map(
    blueprint.entries
      .filter((entry) => entry.content !== null)
      .map((entry) => [entry.target, entry.content.toString('utf8')]),
  );
}

function cells(matrix) {
  return matrix.harnesses.flatMap((harness) => (
    HARNESS_CAPABILITY_SCHEMA.capabilities.map((capability) => ({
      capability,
      contract: harness.capabilities[capability],
      harnessId: harness.id,
      label: `${harness.id}/${capability}`,
    }))
  ));
}

function seedCell(seed, harnessId, capability) {
  return seed.harnesses.find((harness) => harness.id === harnessId).capabilities[capability];
}

async function expectMatrixFailure(mutate, code) {
  const seed = await readSeed();
  mutate(seed);
  const baseBlueprint = await loadBlueprint({});
  const entries = baseBlueprint.entries.map((entry) => (
    entry.target === '.project-os/harness-capabilities.json'
      ? { ...entry, content: Buffer.from(`${JSON.stringify(seed, null, 2)}\n`, 'utf8') }
      : entry
  ));
  await assert.rejects(
    () => materializeHarnessBlueprint({
      baseBlueprint: { ...baseBlueprint, entries },
      targetRoot: path.join(packageRoot, 'test', 'fixtures', 'nonexistent-consumer'),
    }),
    (error) => {
      assert.equal(error.code, code, `esperado ${code}, recibido ${error.code}: ${error.message}`);
      return true;
    },
  );
}

test('la semilla publicada declara verificación en las treinta celdas', async () => {
  const seed = await readSeed();
  const missing = [];
  for (const harness of seed.harnesses) {
    for (const capability of HARNESS_CAPABILITY_SCHEMA.capabilities) {
      if (!harness.capabilities[capability]?.verification) {
        missing.push(`${harness.id}/${capability}`);
      }
    }
  }
  assert.deepEqual(missing, []);
  assert.equal(seed.harnesses.length * HARNESS_CAPABILITY_SCHEMA.capabilities.length, 30);
});

test('ninguna señal de runtime está declarada como verificada', async () => {
  const blueprint = await materializeSeed();
  const declared = [];
  for (const { contract, label } of cells(blueprint.canonical.capabilityMatrix)) {
    for (const signal of HARNESS_RUNTIME_SIGNALS) {
      const value = contract.verification[signal];
      assert.ok(
        value === 'not-verified' || value.startsWith('receipt:'),
        `${label}/${signal} declara ${value}`,
      );
      if (value !== 'not-verified') declared.push(`${label}/${signal}`);
    }
  }
  // La CI no puede producir startup, tool listing ni smoke: no instala agentes de terceros ni autentica.
  assert.deepEqual(declared, []);
});

test('cada celda renderizada cita fuente fechada, versión mínima, fixture existente y fallback', async () => {
  const blueprint = await materializeSeed();
  for (const { contract, label } of cells(blueprint.canonical.capabilityMatrix)) {
    const check = contract.verification;
    if (!['native', 'generated'].includes(contract.support)) continue;
    assert.match(check.source, /^https:\/\//, label);
    assert.match(check.sourceCheckedOn, /^\d{4}-\d{2}-\d{2}$/, label);
    assert.ok(check.minimumVersion, label);
    assert.ok(check.fallback, label);
    assert.ok(check.degradation, label);
    assert.ok(check.surfaces.length > 0, label);
    const id = fixtureId(check.configuration);
    assert.ok(id !== null, `${label} no declara fixture`);
    assert.ok(HARNESS_FIXTURES[id], `${label} declara la fixture desconocida ${id}`);
  }
});

test('toda celda degradada o no soportada conserva un fallback visible', async () => {
  const blueprint = await materializeSeed();
  for (const { contract, label } of cells(blueprint.canonical.capabilityMatrix)) {
    if (['native', 'generated'].includes(contract.support)) continue;
    assert.ok(contract.verification.fallback, `${label} degrada sin fallback`);
    assert.equal(contract.verification.configuration, 'not-applicable', label);
  }
});

test('ninguna celda native excluye superficies oficiales de su propio harness', async () => {
  const blueprint = await materializeSeed();
  const generic = [];
  for (const { contract, label } of cells(blueprint.canonical.capabilityMatrix)) {
    if (contract.support === 'native' && contract.verification.unsupportedSurfaces.length > 0) {
      generic.push(label);
    }
  }
  assert.deepEqual(generic, []);

  const copilotMcp = seedCell(blueprint.canonical.capabilityMatrix, 'github-copilot', 'mcp');
  assert.equal(copilotMcp.support, 'generated');
  assert.ok(copilotMcp.verification.unsupportedSurfaces.includes('copilot-cloud-agent'));
  assert.ok(copilotMcp.verification.surfaces.includes('copilot-cli'));
});

test('los adapters instalados cumplen su contrato offline', async () => {
  const blueprint = await materializeSeed();
  const contents = renderedContents(blueprint);
  const context = { instructions: blueprint.canonical.instructions };
  assert.deepEqual(checkInstalledAdapters(contents, context), []);
  assert.deepEqual(
    checkCapabilityMatrixContract(blueprint.canonical.capabilityMatrix, contents, context),
    [],
  );
});

test('las colecciones conservan los selectores y fallan ante archivos ausentes o ampliados', async () => {
  const blueprint = await materializeSeed();
  const contents = renderedContents(blueprint);
  const expected = [
    ['.claude/rules/project-os-documentation.md', 'paths: ["**/*.md","docs/**/*"]'],
    ['.cursor/rules/project-os-documentation.mdc', 'globs: "**/*.md,docs/**/*"'],
    ['.github/instructions/project-os-documentation.instructions.md', 'applyTo: "**/*.md,docs/**/*"'],
  ];
  for (const [file, selector] of expected) {
    assert.ok(contents.get(file).includes(selector), file);
    assert.ok(contents.get(file).includes('Keep claims linked to a current source of truth.'));
    assert.equal(contents.get(file).includes('Include a failing or negative case'), false);
  }
  for (const anchor of ['CLAUDE.md', '.claude/rules/project-os.md', '.cursor/rules/project-os.mdc', '.github/copilot-instructions.md', '.github/instructions/project-os.instructions.md']) {
    assert.equal(contents.get(anchor).includes('Keep claims linked to a current source of truth.'), false, anchor);
  }
  const missing = new Map(contents);
  missing.delete(expected[0][0]);
  assert.ok(checkInstalledAdapters(missing, { instructions: blueprint.canonical.instructions }).some((failure) => failure.includes('missing-rule:documentation')));
  const widened = new Map(contents);
  widened.set(expected[1][0], widened.get(expected[1][0]).replace('alwaysApply: false', 'alwaysApply: true'));
  assert.ok(checkInstalledAdapters(widened, { instructions: blueprint.canonical.instructions }).some((failure) => failure.includes('unconditional-rule:documentation')));
});

test('un blueprint sin colección mantiene fallback para la matriz antigua', async () => {
  const seed = await readSeed();
  const cell = seedCell(seed, 'claude-code', 'pathRules');
  Object.assign(cell, { support: 'documented', target: 'AGENTS.md', validation: 'fallback-visible' });
  cell.verification.configuration = 'not-applicable';
  const baseBlueprint = await loadBlueprint({});
  const entries = baseBlueprint.entries.filter((entry) => entry.target !== '.claude/rules/project-os.md').map((entry) => (
    entry.target === '.project-os/harness-capabilities.json' ? { ...entry, content: Buffer.from(JSON.stringify(seed)) } : entry
  ));
  const blueprint = await materializeHarnessBlueprint({ baseBlueprint: { ...baseBlueprint, entries }, targetRoot: path.join(packageRoot, 'test/fixtures/nonexistent-consumer') });
  const claude = renderedContents(blueprint).get('CLAUDE.md');
  assert.ok(claude.includes('Keep claims linked to a current source of truth.'));
  assert.equal(claude.includes('.claude/rules/project-os-documentation.md'), false);
});

test('un espejo de instrucciones que pierde el texto canónico falla el contrato', async () => {
  const blueprint = await materializeSeed();
  const contents = renderedContents(blueprint);
  const context = { instructions: blueprint.canonical.instructions };

  // Un archivo con encabezado pero sin el contenido canónico no puede probar una celda native.
  const hollow = new Map(contents);
  hollow.set('CLAUDE.md', ['# Claude Code project instructions', '', 'Generated mirror.', ''].join('\n'));
  const failures = checkInstalledAdapters(hollow, context);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /^CLAUDE\.md: canonical-instructions-not-mirrored:\d+$/);

  // Sin el texto canónico disponible el contrato se declara incapaz en vez de aprobar.
  assert.deepEqual(
    HARNESS_FIXTURES['claude-instructions']('CLAUDE.md', contents.get('CLAUDE.md'), {}),
    ['canonical-instructions-unavailable'],
  );
});

test('el skill compartido se instala una vez por superficie oficial y sin copias redundantes', async () => {
  const blueprint = await materializeSeed();
  const installed = blueprint.entries
    .map((entry) => entry.target)
    .filter((target) => target.endsWith('/SKILL.md'))
    .sort();
  assert.deepEqual(installed, [
    '.agents/skills/project-os/SKILL.md',
    '.claude/skills/project-os/SKILL.md',
  ]);
  // La ruta heredada de Codex deja de instalarse; la retirada es explícita, no un archivo huérfano nuevo.
  assert.equal(installed.includes('.codex/skills/project-os/SKILL.md'), false);
  assert.equal(installed.includes('.opencode/skills/project-os/SKILL.md'), false);

  const matrix = blueprint.canonical.capabilityMatrix;
  for (const harnessId of ['codex', 'cursor', 'github-copilot', 'opencode']) {
    assert.equal(
      seedCell(matrix, harnessId, 'skills').target,
      '.agents/skills/project-os/SKILL.md',
      harnessId,
    );
  }
  assert.equal(
    seedCell(matrix, 'claude-code', 'skills').target,
    '.claude/skills/project-os/SKILL.md',
  );
});

test('la matriz renderizada separa configuración de las señales de runtime', async () => {
  const blueprint = await materializeSeed();
  const agents = blueprint.entries
    .find((entry) => entry.target === 'AGENTS.md')
    .content.toString('utf8');
  assert.match(agents, /\| Versión mínima \| Configuración \| Startup \| Tool listing \| Smoke \| Fallback \|/);
  assert.match(agents, /### Fuentes oficiales consultadas/);
  assert.match(agents, /### Superficies divergentes/);
  assert.match(agents, /copilot-cloud-agent/);
  assert.equal(agents.includes('no verificado'), true);
});

test('Antigravity permanece unsupported y su fixture no lo promueve por similitud', async () => {
  const candidate = JSON.parse(await readFile(
    path.join(packageRoot, 'test', 'fixtures', 'harness-candidates', 'antigravity.json'),
    'utf8',
  ));
  const verdict = checkCandidatePromotion(candidate);
  assert.equal(verdict.promotable, false);
  for (const capability of HARNESS_CAPABILITY_SCHEMA.capabilities) {
    assert.ok(verdict.blockers.includes(`antigravity/${capability}: no-renderer-target`), capability);
    assert.ok(verdict.blockers.includes(`antigravity/${capability}: no-fixture`), capability);
  }

  const seed = await readSeed();
  assert.equal(seed.harnesses.some((harness) => harness.id === 'antigravity'), false);
  assert.equal(seed.harnesses.length, 5);
  const targets = seed.harnesses.flatMap((harness) => (
    Object.values(harness.capabilities).map((contract) => contract.target)
  ));
  assert.equal(targets.some((target) => /antigravity/i.test(target)), false);
});

test('un candidato completo sí sería promovible, así que el contrato no es inalcanzable', () => {
  const complete = {
    id: 'example-harness',
    status: 'unsupported',
    sources: ['https://example.test/docs'],
    capabilities: Object.fromEntries(HARNESS_CAPABILITY_SCHEMA.capabilities.map((capability) => [
      capability,
      {
        rendererTarget: `.example/${capability}.md`,
        source: 'https://example.test/docs',
        sourceCheckedOn: '2026-08-19',
        minimumVersion: '1.0.0',
        configuration: 'fixture:agent-skill-frontmatter',
        fallback: 'AGENTS.md',
        degradation: 'La fixture prueba rendering, no consumo.',
      },
    ])),
  };
  assert.deepEqual(checkCandidatePromotion(complete), { blockers: [], promotable: true });
});

test('cada contrato de adapter apunta a una fixture conocida y a un destino instalado', async () => {
  const blueprint = await materializeSeed();
  const installed = new Set(blueprint.entries.map((entry) => entry.target));
  for (const [target, id] of Object.entries(ADAPTER_CONTRACTS)) {
    assert.ok(HARNESS_FIXTURES[id], `${target} declara la fixture desconocida ${id}`);
    assert.ok(installed.has(target), `${target} no está instalado por el manifest`);
  }
});

test('caso negativo: una celda native sin fuente fechada falla el rendering', async () => {
  await expectMatrixFailure((seed) => {
    const cell = seedCell(seed, 'cursor', 'skills');
    delete cell.verification.source;
    delete cell.verification.sourceCheckedOn;
  }, 'HARNESS_CAPABILITY_UNPROVEN');
});

test('caso negativo: una celda native sin fixture falla el rendering', async () => {
  await expectMatrixFailure((seed) => {
    seedCell(seed, 'claude-code', 'skills').verification.configuration = 'not-applicable';
  }, 'HARNESS_CAPABILITY_UNPROVEN');
});

test('caso negativo: una celda native sin fallback falla el rendering', async () => {
  await expectMatrixFailure((seed) => {
    delete seedCell(seed, 'codex', 'mcp').verification.fallback;
  }, 'HARNESS_CAPABILITY_UNPROVEN');
});

test('caso negativo: una celda degradada sin fallback falla el rendering', async () => {
  await expectMatrixFailure((seed) => {
    delete seedCell(seed, 'opencode', 'permissions').verification.fallback;
  }, 'HARNESS_CAPABILITY_FALLBACK');
});

test('caso negativo: una fecha de fuente sin formato ISO falla el rendering', async () => {
  await expectMatrixFailure((seed) => {
    seedCell(seed, 'cursor', 'mcp').verification.sourceCheckedOn = '19/08/2026';
  }, 'HARNESS_CAPABILITY_SOURCE_DATE');
});

test('caso negativo: una fuente que no es https falla el rendering', async () => {
  await expectMatrixFailure((seed) => {
    seedCell(seed, 'cursor', 'mcp').verification.source = 'http://cursor.com/docs/mcp';
  }, 'HARNESS_CAPABILITY_SOURCE');
});

test('caso negativo: declarar smoke sin receipt falla el rendering', async () => {
  await expectMatrixFailure((seed) => {
    seedCell(seed, 'claude-code', 'mcp').verification.smoke = 'verified';
  }, 'HARNESS_CAPABILITY_RUNTIME_SIGNAL');
});

test('caso negativo: usar la configuración como smoke falla el rendering', async () => {
  await expectMatrixFailure((seed) => {
    seedCell(seed, 'claude-code', 'mcp').verification.smoke = 'fixture:json-mcp-servers';
  }, 'HARNESS_CAPABILITY_RUNTIME_SIGNAL');
});

test('caso negativo: una celda native con superficies excluidas falla el rendering', async () => {
  await expectMatrixFailure((seed) => {
    seedCell(seed, 'github-copilot', 'skills').verification.unsupportedSurfaces = ['copilot-visual-studio'];
  }, 'HARNESS_CAPABILITY_SURFACE_DIVERGENCE');
});

test('caso negativo: la misma superficie soportada y no soportada falla el rendering', async () => {
  await expectMatrixFailure((seed) => {
    seedCell(seed, 'github-copilot', 'mcp').verification.unsupportedSurfaces.push('copilot-cli');
  }, 'HARNESS_CAPABILITY_SURFACES');
});

test('caso negativo: un campo de verificación desconocido falla el rendering', async () => {
  await expectMatrixFailure((seed) => {
    seedCell(seed, 'codex', 'skills').verification.runtimeProven = true;
  }, 'HARNESS_CAPABILITY_VERIFICATION');
});

test('un SKILL.md cuyo nombre no coincide con su carpeta falla el contrato', () => {
  const skill = HARNESS_FIXTURES['agent-skill-frontmatter'];
  const body = 'Adapter generado.';
  assert.deepEqual(
    skill('.agents/skills/project-os/SKILL.md', `---\nname: project-os\ndescription: X\n---\n${body}`),
    [],
  );
  assert.deepEqual(
    skill('.agents/skills/project-os/SKILL.md', `---\nname: otro-nombre\ndescription: X\n---\n${body}`),
    ['name-does-not-match-folder'],
  );
  assert.deepEqual(
    skill('.agents/skills/project-os/SKILL.md', `---\nname: project-os\n---\n${body}`),
    ['missing-description'],
  );
  assert.deepEqual(
    skill('.agents/skills/project-os/SKILL.md', body),
    ['missing-frontmatter'],
  );
  assert.deepEqual(
    skill('.agents/skills/project-os/SKILL.md', `---\nname: project-os\ndescription: X\n---\n   \n`),
    ['empty-body'],
  );
});

test('una instrucción por ruta de Copilot sin applyTo falla el contrato', () => {
  const contract = HARNESS_FIXTURES['copilot-path-instructions'];
  const target = '.github/instructions/project-os.instructions.md';
  assert.deepEqual(contract(target, '---\napplyTo: "**/*"\n---\nReglas.'), []);
  assert.deepEqual(contract(target, '---\ndescription: X\n---\nReglas.'), ['missing-apply-to']);
});

test('una regla de Cursor sin alcance declarado falla el contrato', () => {
  const contract = HARNESS_FIXTURES['cursor-rule-frontmatter'];
  const target = '.cursor/rules/project-os.mdc';
  assert.deepEqual(contract(target, '---\ndescription: X\nalwaysApply: true\n---\nReglas.'), []);
  assert.deepEqual(contract(target, '---\ndescription: X\n---\nReglas.'), ['missing-scope']);
});

test('un adapter MCP sin objeto de servidores falla el contrato', () => {
  assert.deepEqual(HARNESS_FIXTURES['json-mcp-servers']('.mcp.json', '{"mcpServers":{}}'), []);
  assert.deepEqual(
    HARNESS_FIXTURES['json-mcp-servers']('.mcp.json', '{"servers":{}}'),
    ['missing-mcp-servers-object'],
  );
  assert.deepEqual(HARNESS_FIXTURES['json-mcp-servers']('.mcp.json', 'no-json'), ['invalid-json']);
  assert.deepEqual(
    HARNESS_FIXTURES['opencode-mcp-servers']('opencode.json', '{"mcp":{"x":{"type":"proxy"}}}'),
    ['invalid-server-type:x'],
  );
});

test('un adapter faltante falla el contrato en lugar de pasar en silencio', () => {
  const failures = checkInstalledAdapters(new Map());
  assert.equal(failures.length, Object.keys(ADAPTER_CONTRACTS).length);
  assert.ok(failures.every((failure) => failure.endsWith('adapter-not-installed')));
});

test('una matriz sin bloque de verificación se reporta en lugar de aprobarse', async () => {
  const blueprint = await materializeSeed();
  const stripped = {
    harnesses: blueprint.canonical.capabilityMatrix.harnesses.map((harness) => ({
      ...harness,
      capabilities: Object.fromEntries(
        Object.entries(harness.capabilities).map(([capability, contract]) => [
          capability,
          { ...contract, verification: null },
        ]),
      ),
    })),
  };
  const failures = checkCapabilityMatrixContract(stripped, renderedContents(blueprint));
  assert.equal(failures.length, 30);
  assert.ok(failures.every((failure) => failure.endsWith('missing-verification')));
});

test('una copia seed-once que nombra un destino retirado sincroniza por su reemplazo', async () => {
  const seed = await readSeed();
  // Reproduce la matriz que conserva un repositorio bootstrapeado antes de este cambio.
  seedCell(seed, 'codex', 'skills').target = '.codex/skills/project-os/SKILL.md';
  seedCell(seed, 'opencode', 'skills').target = '.opencode/skills/project-os/SKILL.md';

  const baseBlueprint = await loadBlueprint({});
  const entries = baseBlueprint.entries.map((entry) => (
    entry.target === '.project-os/harness-capabilities.json'
      ? { ...entry, content: Buffer.from(`${JSON.stringify(seed, null, 2)}\n`, 'utf8') }
      : entry
  ));
  const blueprint = await materializeHarnessBlueprint({
    baseBlueprint: { ...baseBlueprint, entries },
    targetRoot: path.join(packageRoot, 'test', 'fixtures', 'nonexistent-consumer'),
  });

  assert.deepEqual(
    blueprint.retiredCapabilityTargets.map((entry) => [entry.capability, entry.declared, entry.resolved]),
    [
      ['codex/skills', '.codex/skills/project-os/SKILL.md', '.agents/skills/project-os/SKILL.md'],
      ['opencode/skills', '.opencode/skills/project-os/SKILL.md', '.agents/skills/project-os/SKILL.md'],
    ],
  );

  // La desactualización queda declarada en el espejo generado, no silenciada.
  const agents = blueprint.entries
    .find((entry) => entry.target === 'AGENTS.md')
    .content.toString('utf8');
  assert.match(agents, /### Destinos retirados declarados por esta copia/);
  assert.match(agents, /\.codex\/skills\/project-os\/SKILL\.md \| \.agents\/skills\/project-os\/SKILL\.md/);

  // El constructor no reescribe el archivo seed-once del consumidor.
  const installedMatrix = JSON.parse(
    blueprint.entries
      .find((entry) => entry.target === '.project-os/harness-capabilities.json')
      .content.toString('utf8'),
  );
  assert.equal(
    installedMatrix.harnesses.find((harness) => harness.id === 'codex').capabilities.skills.target,
    '.codex/skills/project-os/SKILL.md',
  );
});

test('un destino ausente que no está retirado sigue fallando el rendering', async () => {
  await expectMatrixFailure((seed) => {
    seedCell(seed, 'cursor', 'mcp').target = '.cursor/inventado.json';
  }, 'HARNESS_CAPABILITY_UNPROVEN');
});

test('la resolución de destinos retirados no inventa un reemplazo que no está instalado', () => {
  const matrix = {
    harnesses: [{
      id: 'codex',
      capabilities: Object.fromEntries(HARNESS_CAPABILITY_SCHEMA.capabilities.map((capability) => [
        capability,
        { owner: 'constructor', support: 'native', target: '.codex/skills/project-os/SKILL.md', validation: 'x' },
      ])),
    }],
  };
  const resolved = resolveRetiredTargets(matrix, new Set());
  assert.deepEqual(resolved.retired, []);
  for (const capability of HARNESS_CAPABILITY_SCHEMA.capabilities) {
    assert.equal(resolved.matrix.harnesses[0].capabilities[capability].supersededBy, undefined);
  }
});

test('la semilla publicada no declara ningún destino retirado', async () => {
  const blueprint = await materializeSeed();
  assert.deepEqual(blueprint.retiredCapabilityTargets, []);
  const declared = cells(blueprint.canonical.capabilityMatrix).map(({ contract }) => contract.target);
  for (const retired of Object.keys(RETIRED_CAPABILITY_TARGETS)) {
    assert.equal(declared.includes(retired), false, retired);
  }
});

// La documentación escribe la misma tabla a mano. Sin esta comprobación la matriz canónica podría cambiar
// y las tres superficies públicas seguirían publicando el soporte anterior sin que nada fallara.
const DOC_TABLES = [
  {
    capabilities: ['instructions', 'pathRules', 'skills', 'permissions', 'mcp'],
    labels: {
      'Claude Code': 'claude-code',
      Codex: 'codex',
      Cursor: 'cursor',
      'GitHub Copilot': 'github-copilot',
      OpenCode: 'opencode',
    },
    relative: 'docs/COMPATIBILITY.md',
  },
  {
    capabilities: ['instructions', 'pathRules', 'skills', 'permissions', 'mcp', 'profiles'],
    labels: {
      'Claude Code': 'claude-code',
      Codex: 'codex',
      Cursor: 'cursor',
      'GitHub Copilot': 'github-copilot',
      OpenCode: 'opencode',
    },
    relative: 'blueprint/core/docs/engineering/COMPATIBILITY_MATRIX.md',
  },
];

test('las tablas de documentación coinciden con la matriz canónica', async () => {
  const blueprint = await materializeSeed();
  const matrix = blueprint.canonical.capabilityMatrix;

  for (const table of DOC_TABLES) {
    const text = await readFile(path.join(packageRoot, table.relative), 'utf8');
    for (const [label, harnessId] of Object.entries(table.labels)) {
      const row = text
        .split('\n')
        .find((line) => line.startsWith(`| ${label} |`));
      assert.ok(row, `${table.relative} no contiene la fila de ${label}`);
      const declared = row.split('|').slice(2, -1).map((cell) => cell.trim());
      const expected = table.capabilities.map(
        (capability) => seedCell(matrix, harnessId, capability).support,
      );
      assert.deepEqual(declared, expected, `${table.relative} / ${label}`);
    }
  }
});

test('caso negativo: una versión mínima inventada falla el rendering', async () => {
  await expectMatrixFailure((seed) => {
    seedCell(seed, 'codex', 'skills').verification.minimumVersion = '0.50';
  }, 'HARNESS_CAPABILITY_MINIMUM_VERSION');
});

test('la versión mínima solo admite semver publicado o un sentinel explicado', async () => {
  const blueprint = await materializeSeed();
  for (const { contract, label } of cells(blueprint.canonical.capabilityMatrix)) {
    const declared = contract.verification.minimumVersion;
    const isSemver = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(declared);
    assert.ok(
      isSemver || MINIMUM_VERSION_SENTINELS.includes(declared),
      `${label} declara ${declared}`,
    );
    if (!isSemver) {
      // Un sentinel sin explicación sería una casilla vacía disfrazada de dato.
      assert.match(contract.verification.degradation, /version minima/, label);
    }
  }
});

test('una matriz seed-once sin verificación sigue siendo legible para no romper consumidores', async () => {
  const seed = await readSeed();
  for (const harness of seed.harnesses) {
    for (const capability of HARNESS_CAPABILITY_SCHEMA.capabilities) {
      delete harness.capabilities[capability].verification;
    }
  }
  const baseBlueprint = await loadBlueprint({});
  const entries = baseBlueprint.entries.map((entry) => (
    entry.target === '.project-os/harness-capabilities.json'
      ? { ...entry, content: Buffer.from(`${JSON.stringify(seed, null, 2)}\n`, 'utf8') }
      : entry
  ));
  const blueprint = await materializeHarnessBlueprint({
    baseBlueprint: { ...baseBlueprint, entries },
    targetRoot: path.join(packageRoot, 'test', 'fixtures', 'nonexistent-consumer'),
  });
  for (const { contract } of cells(blueprint.canonical.capabilityMatrix)) {
    assert.equal(contract.verification, null);
  }
  const agents = blueprint.entries
    .find((entry) => entry.target === 'AGENTS.md')
    .content.toString('utf8');
  assert.match(agents, /sin declarar/);
});
