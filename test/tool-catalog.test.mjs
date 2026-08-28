import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdir,
  mkdtemp,
  opendir,
  readFile,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import Ajv2020 from 'ajv/dist/2020.js';

import { stableStringify } from '../src/json.mjs';
import {
  assertLocalCandidatePath,
  containsLiteralSecret,
  declaredUnknowns,
  entryFailures,
  resolveEntryState,
  runToolCatalog,
  TOOL_CATALOG_SCHEMA_VERSION,
  toolCatalogText,
  validateToolCatalog,
} from '../src/tool-catalog.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(packageRoot, 'bin', 'project-os.mjs');
const schemaPath = path.join(packageRoot, 'schema', 'tool-catalog.schema.json');
const seedPath = path.join(
  packageRoot,
  'blueprint',
  'core',
  'project-os',
  'tool-catalog.json',
);

async function temporary(name) {
  return mkdtemp(path.join(tmpdir(), `project-os-tool-catalog-${name}-`));
}

function run(command, args, { cwd } = {}) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const child = spawn(command, args, {
      cwd,
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('close', (exitCode) => resolve({ exitCode, stderr, stdout }));
  });
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function writeJson(root, relative, value) {
  const absolute = path.join(root, ...relative.split('/'));
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, stableStringify(value));
  return absolute;
}

/**
 * Hashes every file under a root so a read-only claim can be proven rather
 * than asserted.
 */
async function treeFingerprint(root) {
  const entries = [];
  async function walk(current, relative) {
    const directory = await opendir(current);
    for await (const item of directory) {
      const childRelative = relative ? `${relative}/${item.name}` : item.name;
      const childAbsolute = path.join(current, item.name);
      if (item.isDirectory()) {
        await walk(childAbsolute, childRelative);
        continue;
      }
      if (!item.isFile()) continue;
      const content = await readFile(childAbsolute);
      entries.push(`${childRelative}:${createHash('sha256').update(content).digest('hex')}`);
    }
  }
  await walk(root, '');
  return entries.sort().join('\n');
}

async function seedCatalog() {
  return readJson(seedPath);
}

function baseEntry(overrides = {}) {
  return {
    auth: {
      note: 'No account is required for the local flow.',
      required: false,
      scopes: [],
      secretEnvRefs: [],
      status: 'known',
    },
    cost: { note: 'No license or service cost.', posture: 'none', status: 'known' },
    data: ['Nothing leaves the repository.'],
    id: 'sample-tool',
    kind: 'cli',
    license: { note: 'Permissive.', spdx: 'MIT', status: 'known' },
    maintenance: { note: 'Released regularly.', status: 'active' },
    need: 'Demonstrate the catalogue contract.',
    permissions: {
      execution: 'none',
      filesystem: 'read',
      network: 'none',
      note: 'Reads the working tree only.',
    },
    provenance: {
      owner: 'example',
      reference: { type: 'version', value: '1.2.3' },
      sourceUrl: 'https://example.invalid/tool',
      verifiedOn: '2026-08-28',
    },
    rollback: 'Remove the package and revert its configuration.',
    state: 'universal',
    ...overrides,
  };
}

async function bootstrapTarget(name) {
  const root = await temporary(name);
  await run('git', ['init', '-q'], { cwd: root });
  const response = await run(process.execPath, [cli, 'bootstrap', '--target', root, '--json']);
  assert.equal(response.exitCode, 0, response.stderr);
  return root;
}

test('el schema publicado compila en modo estricto y valida la semilla', async () => {
  const schema = await readJson(schemaPath);
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  const seed = await seedCatalog();
  assert.equal(validate(seed), true, JSON.stringify(validate.errors));
  assert.equal(seed.schemaVersion, TOOL_CATALOG_SCHEMA_VERSION);
  assert.equal(validateToolCatalog(seed).valid, true);
});

test('la semilla describe sin activar y conserva las señales MCP separadas', async () => {
  const seed = await seedCatalog();
  for (const entry of seed.entries) {
    if (entry.kind !== 'mcp') continue;
    assert.equal(entry.mcp.enabled, false);
    for (const signal of ['configuration', 'startup', 'toolListing', 'authenticatedSmoke']) {
      assert.equal(entry.mcp[signal], 'not-verified');
    }
  }
  assert.equal(seed.policy.registrationDoesNotActivate, true);
  assert.equal(seed.policy.allowedToolsIsPortableBoundary, false);
  assert.equal(seed.policy.installationRequiresSeparateApproval, true);
});

test('un dato desconocido no puede resolver universal ni conditional', async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(await readJson(schemaPath));

  for (const field of ['license', 'cost', 'auth']) {
    const entry = baseEntry({ state: 'universal' });
    entry[field] = { ...entry[field], status: 'unknown' };
    if (field === 'license') entry.license.spdx = null;
    if (field === 'cost') entry.cost.posture = 'unknown';

    assert.deepEqual(declaredUnknowns(entry), [field]);
    const failures = entryFailures(entry);
    assert.ok(
      failures.some((item) => item.includes('no puede resolver universal')),
      `${field}: ${failures.join(' | ')}`,
    );

    const catalog = { ...(await seedCatalog()), entries: [entry] };
    assert.equal(validate(catalog), false, `${field} debería fallar en el schema`);

    entry.state = 'conditional';
    entry.condition = 'Only when a provider is chosen.';
    assert.equal(validate({ ...catalog, entries: [entry] }), false);

    entry.state = 'postponed';
    entry.condition = null;
    entry.stateReason = 'No provider selected yet.';
    entry.provenance = null;
    assert.equal(
      validate({ ...catalog, entries: [entry] }),
      true,
      JSON.stringify(validate.errors),
    );
    assert.equal(resolveEntryState(entry).resolved, 'postponed');
  }
});

test('una entrada declarada universal con dato desconocido se resuelve como pospuesta', () => {
  const entry = baseEntry({ state: 'universal' });
  entry.cost = { note: 'Depends on the provider.', posture: 'unknown', status: 'unknown' };
  const state = resolveEntryState(entry, { freshnessWindowDays: 180 });
  assert.equal(state.resolved, 'postponed');
  assert.deepEqual(state.unknowns, ['cost']);
  assert.match(state.reason, /desconocido/i);
});

test('la ausencia de un campo es error de contrato y no equivale a unknown', () => {
  const entry = baseEntry();
  delete entry.license;
  const failures = entryFailures(entry);
  assert.ok(failures.some((item) => item.includes('license es obligatorio')));
  assert.ok(failures.some((item) => item.includes('su ausencia no equivale a unknown')));
  assert.deepEqual(declaredUnknowns(entry), []);
});

test('una referencia flotante es rechazada y una exacta se acepta', async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(await readJson(schemaPath));
  const seed = await seedCatalog();

  for (const floating of ['latest', 'main', 'HEAD', 'stable', 'v1', 'next']) {
    const entry = baseEntry();
    entry.provenance.reference = { type: 'tag', value: floating };
    assert.ok(
      entryFailures(entry).some((item) => item.includes('no es una referencia exacta')),
      `${floating} debería rechazarse`,
    );
    assert.equal(validate({ ...seed, entries: [entry] }), false, floating);
  }

  const exact = baseEntry();
  exact.provenance.reference = { type: 'tag', value: 'v1.11.0' };
  assert.deepEqual(entryFailures(exact), []);
  const commit = baseEntry();
  commit.provenance.reference = { type: 'commit', value: 'a'.repeat(40) };
  assert.deepEqual(entryFailures(commit), []);
});

test('un literal de secreto es rechazado y una referencia de entorno se acepta', () => {
  // Assembled at run time so the public tree never carries a token-shaped literal.
  const tokenShaped = ['gh', 'p', '_', '0123456789abcdefghij'].join('');
  const assigned = ['token', '=', 'super-secreto'].join('');

  const literal = baseEntry();
  literal.auth = { ...literal.auth, note: `Use ${assigned} to authenticate.`, required: true };
  const failures = entryFailures(literal);
  assert.ok(failures.some((item) => item.includes('literal de secreto')));
  assert.ok(
    failures.every((item) => !item.includes('super-secreto')),
    'el rechazo no debe repetir el literal',
  );

  const referenced = baseEntry();
  referenced.auth = {
    ...referenced.auth,
    note: 'The token is read from the environment.',
    required: true,
    secretEnvRefs: ['GITHUB_TOKEN'],
  };
  assert.deepEqual(entryFailures(referenced), []);
  assert.equal(containsLiteralSecret({ token: 'GITHUB_TOKEN' }), false);
  assert.equal(containsLiteralSecret({ token: '${GITHUB_TOKEN}' }), false);
  assert.equal(containsLiteralSecret({ token: tokenShaped }), true);
  assert.equal(containsLiteralSecret({ note: `Authorization: Bearer ${tokenShaped}` }), true);
});

test('allowed-tools se registra como señal y no como frontera portable', () => {
  const signal = baseEntry({
    experimentalSignals: { allowedTools: { declared: true, portableBoundary: false } },
  });
  assert.deepEqual(entryFailures(signal), []);

  const boundary = baseEntry({
    experimentalSignals: { allowedTools: { declared: true, portableBoundary: true } },
  });
  assert.ok(
    entryFailures(boundary).some((item) => item.includes('frontera portable')),
  );
});

test('ninguna señal MCP satisface a otra y enabled no puede activarse', () => {
  const entry = baseEntry({
    kind: 'mcp',
    mcp: {
      authenticatedSmoke: 'not-verified',
      configuration: { receipt: 'evidence://mcp/config', verifiedOn: '2026-08-28' },
      enabled: false,
      startup: 'not-verified',
      toolListing: 'not-verified',
    },
  });
  assert.deepEqual(entryFailures(entry), []);

  const enabled = structuredClone(entry);
  enabled.mcp.enabled = true;
  assert.ok(entryFailures(enabled).some((item) => item.includes('enabled debe permanecer en false')));

  const missing = structuredClone(entry);
  delete missing.mcp.authenticatedSmoke;
  assert.ok(
    entryFailures(missing).some((item) => item.includes('authenticatedSmoke debe declararse por separado')),
  );

  const undated = structuredClone(entry);
  undated.mcp.startup = { receipt: 'evidence://mcp/startup' };
  assert.ok(entryFailures(undated).some((item) => item.includes('verifiedOn')));

  const withoutBlock = baseEntry({ kind: 'mcp' });
  assert.ok(
    entryFailures(withoutBlock).some((item) => item.includes('obligatorio para una entrada MCP')),
  );
});

test('una verificación vencida se reporta como stale sin cambiar el estado declarado', () => {
  const entry = baseEntry({ state: 'conditional', condition: 'When a browser flow exists.' });
  entry.provenance.verifiedOn = '2020-01-01';
  const stale = resolveEntryState(entry, {
    freshnessWindowDays: 180,
    now: new Date('2026-08-28T00:00:00Z'),
  });
  assert.equal(stale.stale, true);
  assert.equal(stale.resolved, 'conditional');
  assert.match(stale.reason, /supera la ventana/i);

  const fresh = resolveEntryState(entry, {
    freshnessWindowDays: 180,
    now: new Date('2020-02-01T00:00:00Z'),
  });
  assert.equal(fresh.stale, false);
});

test('evaluate rechaza una URL y no descarga contenido', async () => {
  assert.throws(
    () => assertLocalCandidatePath('https://example.invalid/skill.json'),
    /no acepta una URL/,
  );
  assert.throws(() => assertLocalCandidatePath('file:///tmp/skill.json'), /no acepta una URL/);
  assert.throws(() => assertLocalCandidatePath(''), /requiere --candidate/);
  assert.equal(assertLocalCandidatePath('candidates/skill.json'), 'candidates/skill.json');

  const root = await bootstrapTarget('remote');
  const response = await run(process.execPath, [
    cli,
    'tool-catalog',
    'evaluate',
    '--candidate',
    'https://example.invalid/skill.json',
    '--target',
    root,
  ]);
  assert.equal(response.exitCode, 2);
  assert.match(response.stderr, /TOOL_CATALOG_CANDIDATE_REMOTE/);
});

test('list y evaluate no escriben fuera de su salida', async () => {
  const root = await bootstrapTarget('readonly');
  await writeJson(root, 'candidates/sample.json', baseEntry());
  const before = await treeFingerprint(root);

  const list = await run(process.execPath, [cli, 'tool-catalog', 'list', '--target', root]);
  assert.equal(list.exitCode, 0, list.stderr);
  assert.match(list.stdout, /Mutación: no/);

  const evaluate = await run(process.execPath, [
    cli,
    'tool-catalog',
    'evaluate',
    '--candidate',
    'candidates/sample.json',
    '--target',
    root,
  ]);
  assert.equal(evaluate.exitCode, 0, evaluate.stderr);
  assert.match(evaluate.stdout, /Veredicto: universal/);
  assert.match(evaluate.stdout, /Descarga remota: no/);

  assert.equal(await treeFingerprint(root), before, 'el comando no debe escribir nada');
});

test('evaluate rechaza una candidata que no cumple el contrato', async () => {
  const root = await bootstrapTarget('invalid');
  const candidate = baseEntry({ state: 'universal' });
  candidate.license = { note: 'Unclear.', spdx: null, status: 'unknown' };
  await writeJson(root, 'candidates/unknown.json', candidate);

  const result = await runToolCatalog({
    candidatePath: 'candidates/unknown.json',
    subcommand: 'evaluate',
    targetRoot: root,
  });
  assert.equal(result.status, 'FAIL');
  assert.equal(result.verdict, 'rejected');
  assert.equal(result.mutationPerformed, false);
  assert.ok(result.failures.some((item) => item.includes('no puede resolver universal')));
  assert.match(toolCatalogText(result), /Veredicto: rejected/);
});

test('retirar una entrada deja el catálogo y las lecturas de estado válidos', async () => {
  const root = await bootstrapTarget('withdraw');
  const catalogRelative = '.project-os/tool-catalog.json';
  const catalogAbsolute = path.join(root, ...catalogRelative.split('/'));
  const catalog = await readJson(catalogAbsolute);
  const withdrawn = catalog.entries.find((entry) => entry.id === 'context7');
  assert.ok(withdrawn, 'la semilla debe contener context7');

  catalog.entries = catalog.entries.filter((entry) => entry.id !== 'context7');
  await writeFile(catalogAbsolute, `${stableStringify(catalog)}\n`);

  const validation = validateToolCatalog(catalog);
  assert.equal(validation.valid, true, validation.failures.join(' | '));

  const list = await runToolCatalog({ subcommand: 'list', targetRoot: root });
  assert.equal(list.status, 'PASS');
  assert.equal(list.entries.length, 3);
  assert.ok(!list.entries.some((entry) => entry.id === 'context7'));

  const doctor = await run(process.execPath, [cli, 'doctor', '--target', root, '--json']);
  assert.notEqual(doctor.exitCode, 2, doctor.stderr);
});

test('el catálogo sembrado sobrevive a una segunda ejecución sin drift', async () => {
  const root = await bootstrapTarget('idempotence');
  const catalogAbsolute = path.join(root, '.project-os', 'tool-catalog.json');
  const first = await readFile(catalogAbsolute, 'utf8');

  const second = await run(process.execPath, [cli, 'sync', '--target', root, '--check', '--json']);
  assert.equal(second.exitCode, 0, second.stderr);
  assert.equal(await readFile(catalogAbsolute, 'utf8'), first);
});

test('--candidate solo está disponible para tool-catalog', async () => {
  const root = await bootstrapTarget('scope');
  const response = await run(process.execPath, [
    cli,
    'doctor',
    '--candidate',
    'candidates/sample.json',
    '--target',
    root,
  ]);
  assert.equal(response.exitCode, 2);
  assert.match(response.stderr, /CLI_TOOL_CATALOG_SCOPE/);
});
