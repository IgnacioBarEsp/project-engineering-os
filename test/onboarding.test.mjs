import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import Ajv2020 from 'ajv/dist/2020.js';

import {
  buildOnboardingPlan,
  classifyOnboarding,
  inspectOnboardingTarget,
  migrateOnboardingState,
  MAX_ONBOARDING_INPUT_BYTES,
  normalizeOnboardingAnswers,
  ONBOARDING_QUESTIONS,
  onboardingPlanText,
} from '../src/onboarding.mjs';
import { packageDistributionEntries } from '../src/distribution.mjs';
import { stableStringify } from '../src/json.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(packageRoot, 'bin', 'project-os.mjs');

async function temporary(name) {
  return mkdtemp(path.join(tmpdir(), `project-os-onboarding-${name}-`));
}

async function writeJson(root, relative, value) {
  const absolute = path.join(root, ...relative.split('/'));
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, stableStringify(value));
  return absolute;
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

async function git(root, args) {
  const response = await run('git', args, { cwd: root });
  assert.equal(response.exitCode, 0, response.stderr);
  return response.stdout.trim();
}

function preservationEvidence(id = 'content.code') {
  return [{
    category: 'content',
    id,
    path: 'src/index.mjs',
    preservation: true,
  }];
}

test('el contrato expone exactamente cinco respuestas y normaliza unknown/defer', () => {
  assert.equal(ONBOARDING_QUESTIONS.length, 5);
  assert.deepEqual(
    ONBOARDING_QUESTIONS.map((question) => question.id),
    ['project', 'guidance', 'tracker', 'agent', 'remoteSetup'],
  );
  assert.deepEqual(normalizeOnboardingAnswers({ tracker: 'defer' }), {
    agent: 'unknown',
    guidance: 'unknown',
    project: 'unknown',
    remoteSetup: 'unknown',
    tracker: 'defer',
  });
  assert.throws(
    () => normalizeOnboardingAnswers({ extra: 'ignored' }),
    (error) => error?.code === 'ONBOARDING_ANSWERS_INVALID',
  );
  assert.throws(
    () => normalizeOnboardingAnswers({ guidance: 'senior' }),
    (error) => error?.code === 'ONBOARDING_ANSWERS_INVALID'
      && error?.remediation?.includes('onboarding-answers.schema.json'),
  );
  const hostileField = 'secret-value-used-as-a-field-name';
  assert.throws(
    () => normalizeOnboardingAnswers({ [hostileField]: true }),
    (error) => {
      const report = JSON.stringify({ details: error.details, message: error.message });
      return error?.code === 'ONBOARDING_ANSWERS_INVALID'
        && !report.includes(hostileField)
        && report.includes('unknown-fields=1');
    },
  );
});

test('la matriz de rutas prioriza brownfield y conserva defaults reversibles', () => {
  assert.equal(classifyOnboarding({ answers: {}, evidence: [] }).route, 'beginner');
  assert.equal(classifyOnboarding({
    answers: { guidance: 'brief' },
    evidence: [],
  }).route, 'experienced-new');
  const brownfield = classifyOnboarding({
    answers: { guidance: 'brief', project: 'new' },
    evidence: preservationEvidence(),
  });
  assert.equal(brownfield.route, 'brownfield');
  assert.equal(brownfield.rebootstrapAllowed, false);
  assert.match(brownfield.nextSteps.at(-1), /no ejecutar rebootstrap ciego/i);

  const deferred = classifyOnboarding({
    answers: { tracker: 'defer' },
    evidence: [],
  });
  assert.deepEqual(deferred.deferredDecisions, ['tracker']);
  assert.equal(deferred.decisionStatus, 'provisional');
});

test('una carpeta vacía produce beginner sin mutación y answers no se confunde con producto', async () => {
  const root = await temporary('empty');
  await writeJson(root, 'answers.json', {
    schemaVersion: '1.0.0',
    project: 'new',
    guidance: 'guided',
    tracker: 'none',
    agent: 'codex',
    remoteSetup: 'local-only',
  });
  const before = await readdir(root);
  const result = await buildOnboardingPlan({
    answersPath: 'answers.json',
    targetRoot: root,
  });
  assert.equal(result.state.route, 'beginner');
  assert.equal(result.state.decisionStatus, 'confirmed');
  assert.equal(result.inspection.complete, true);
  assert.deepEqual(result.state.evidence, []);
  assert.equal(result.mutationPerformed, false);
  assert.deepEqual(await readdir(root), before);
});

test('guidance brief en carpeta nueva produce experienced-new y es determinista', async () => {
  const root = await temporary('experienced');
  await writeJson(root, 'answers.json', { guidance: 'brief', tracker: 'defer' });
  const first = await buildOnboardingPlan({ answersPath: 'answers.json', targetRoot: root });
  const second = await buildOnboardingPlan({ answersPath: 'answers.json', targetRoot: root });
  assert.equal(first.state.route, 'experienced-new');
  assert.equal(stableStringify(first.state), stableStringify(second.state));
  assert.equal(first.state.inputHash, second.state.inputHash);
});

test('código, harness y automatización fuerzan preservación sin exponer contenido', async () => {
  const root = await temporary('brownfield');
  const secret = 'never-print-this-secret-value';
  await mkdir(path.join(root, 'src'), { recursive: true });
  await mkdir(path.join(root, '.github', 'workflows'), { recursive: true });
  await writeFile(path.join(root, 'src', 'app.js'), `export const token = '${secret}';\n`);
  await writeFile(path.join(root, 'AGENTS.md'), `${secret}\n`);
  await writeFile(path.join(root, '.github', 'workflows', 'ci.yml'), `name: ${secret}\n`);

  const result = await buildOnboardingPlan({ targetRoot: root });
  const output = stableStringify(result);
  assert.equal(result.state.route, 'brownfield');
  assert.equal(result.state.rebootstrapAllowed, false);
  assert.equal(result.state.evidence.some((item) => item.id === 'content.code'), true);
  assert.equal(result.state.evidence.some((item) => item.id === 'harness.instructions'), true);
  assert.equal(result.state.evidence.some((item) => item.id === 'automation.configuration'), true);
  assert.equal(output.includes(secret), false);
  assert.equal(output.includes(path.resolve(root)), false);
});

test('Git vacío no basta para brownfield y los inputs untracked se ignoran', async () => {
  const root = await temporary('empty-git');
  await git(root, ['init', '--quiet']);
  await writeJson(root, 'answers.json', { guidance: 'brief' });
  const result = await buildOnboardingPlan({ answersPath: 'answers.json', targetRoot: root });
  assert.equal(result.state.route, 'experienced-new');
  assert.equal(result.state.evidence.some((item) => item.id === 'git.repository'), true);
  assert.equal(result.state.evidence.some((item) => item.id === 'git.working-tree'), false);
});

test('estado default dentro de .project-os no vuelve dirty un Git vacío', async () => {
  const root = await temporary('empty-git-state');
  const initial = await buildOnboardingPlan({ targetRoot: root });
  await git(root, ['init', '--quiet']);
  await writeJson(root, '.project-os/onboarding-state.json', initial.state);
  const result = await buildOnboardingPlan({ targetRoot: root });
  assert.equal(result.state.route, 'beginner');
  assert.equal(result.state.evidence.some((item) => item.id === 'git.repository'), true);
  assert.equal(result.state.evidence.some((item) => item.id === 'git.working-tree'), false);
});

test('Git con historia, dirty state y remoto solo reporta proveedor saneado', async () => {
  const root = await temporary('git-history');
  const credential = 'sensitive-token-in-url';
  await git(root, ['init', '--quiet']);
  await writeFile(path.join(root, 'README.md'), '# Existing\n');
  await git(root, ['add', 'README.md']);
  await git(root, [
    '-c', 'user.name=Fixture',
    '-c', 'user.email=fixture@example.invalid',
    'commit', '--quiet', '-m', 'fixture',
  ]);
  await git(root, ['remote', 'add', 'origin', `https://${credential}@github.com/example/repo.git`]);
  await writeFile(path.join(root, 'README.md'), '# Dirty\n');

  const result = await buildOnboardingPlan({ targetRoot: root });
  const output = stableStringify(result);
  assert.equal(result.state.route, 'brownfield');
  assert.equal(result.state.evidence.some((item) => item.id === 'git.history'), true);
  assert.equal(result.state.evidence.some((item) => item.id === 'git.working-tree'), true);
  assert.equal(
    result.state.evidence.find((item) => item.id === 'remote.provider')?.detail,
    'github',
  );
  assert.equal(output.includes(credential), false);
  assert.equal(output.includes('example/repo'), false);
});

test('symlinks no se siguen y una inspección incompleta elige preservación', async (t) => {
  const root = await temporary('symlink-root');
  const outside = await temporary('symlink-outside');
  const secret = 'outside-secret-must-not-leak';
  await writeFile(path.join(outside, 'secret.js'), secret);
  try {
    await symlink(outside, path.join(root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  } catch (error) {
    if (error?.code === 'EPERM') {
      t.skip('El runner no permite crear symlinks/junctions.');
      return;
    }
    throw error;
  }
  const result = await buildOnboardingPlan({ targetRoot: root });
  const output = stableStringify(result);
  assert.equal(result.inspection.complete, false);
  assert.equal(result.state.route, 'brownfield');
  assert.equal(result.state.evidence.some((item) => item.id === 'inspection.symlink'), true);
  assert.equal(output.includes(secret), false);
});

test('.git como symlink no se sigue ni activa comandos Git', async (t) => {
  const root = await temporary('git-link-root');
  const outside = await temporary('git-link-outside');
  const secret = 'git-dir-secret-must-not-leak';
  await writeFile(path.join(outside, 'config'), secret);
  try {
    await symlink(outside, path.join(root, '.git'), process.platform === 'win32' ? 'junction' : 'dir');
  } catch (error) {
    if (error?.code === 'EPERM') {
      t.skip('El runner no permite crear symlinks/junctions.');
      return;
    }
    throw error;
  }
  const result = await buildOnboardingPlan({ targetRoot: root });
  const output = stableStringify(result);
  assert.equal(result.state.route, 'brownfield');
  assert.equal(result.state.evidence.some((item) => item.id === 'inspection.git-symlink'), true);
  assert.equal(output.includes(secret), false);
});

test('el límite de entradas queda visible y nunca se interpreta como carpeta vacía', async () => {
  const root = await temporary('limit');
  await writeFile(path.join(root, 'a.txt'), 'a');
  await writeFile(path.join(root, 'b.txt'), 'b');
  const inspection = await inspectOnboardingTarget({ maxEntries: 1, targetRoot: root });
  const state = classifyOnboarding({ answers: {}, evidence: inspection.evidence });
  assert.equal(inspection.complete, false);
  assert.equal(inspection.evidence.some((item) => item.id === 'inspection.entry-limit'), true);
  assert.equal(state.route, 'brownfield');
});

test('un directorio vacío en el límite no se confunde con inspección incompleta', async () => {
  const root = await temporary('empty-depth');
  await mkdir(path.join(root, 'empty'));
  const inspection = await inspectOnboardingTarget({ maxDepth: 0, targetRoot: root });
  const state = classifyOnboarding({ answers: {}, evidence: inspection.evidence });
  assert.equal(inspection.complete, true);
  assert.equal(state.route, 'beginner');
});

test('draft v0 migra en memoria y el source queda disponible para rollback', async () => {
  const root = await temporary('state-v0');
  const legacy = {
    stateFormatVersion: 0,
    profile: 'experienced',
    answers: { tracker: 'defer' },
    signals: [],
    pending: ['agent'],
    deferred: ['tracker'],
  };
  const absolute = await writeJson(root, '.project-os/onboarding-state.json', legacy);
  const before = await readFile(absolute, 'utf8');
  const result = await buildOnboardingPlan({ targetRoot: root });
  assert.equal(result.state.route, 'experienced-new');
  assert.equal(result.migrations.length, 1);
  assert.equal(result.migrations[0].id, 'onboarding-state-v0-to-v1');
  assert.equal(result.migrations[0].reversibleBy, 'retain-source-file');
  assert.equal(await readFile(absolute, 'utf8'), before);
});

test('estado v1 reutiliza respuestas y produce estado byte-idéntico', async () => {
  const root = await temporary('state-v1');
  await writeJson(root, 'answers.json', {
    project: 'new',
    guidance: 'brief',
    tracker: 'none',
    agent: 'codex',
    remoteSetup: 'local-only',
  });
  const first = await buildOnboardingPlan({ answersPath: 'answers.json', targetRoot: root });
  await writeJson(root, '.project-os/onboarding-state.json', first.state);
  const second = await buildOnboardingPlan({ answersPath: 'answers.json', targetRoot: root });
  assert.equal(second.migrations.length, 0);
  assert.equal(stableStringify(second.state), stableStringify(first.state));
  assert.equal(second.stateSource.sourceFormatVersion, 1);
});

test('estado futuro, corrupto e inconsistente falla con recuperación explícita', async () => {
  assert.throws(
    () => migrateOnboardingState({ stateFormatVersion: 2 }),
    (error) => error?.code === 'ONBOARDING_STATE_FROM_FUTURE'
      && error?.remediation?.includes('versión'),
  );
  assert.throws(
    () => migrateOnboardingState({ stateFormatVersion: 1 }),
    (error) => error?.code === 'ONBOARDING_STATE_INVALID'
      && Boolean(error?.remediation),
  );
  const root = await temporary('invalid-json');
  await writeFile(path.join(root, 'answers.json'), '{invalid');
  await assert.rejects(
    buildOnboardingPlan({ answersPath: 'answers.json', targetRoot: root }),
    (error) => error?.code === 'ONBOARDING_INPUT_JSON_INVALID'
      && error?.remediation?.includes('answers.json'),
  );

  const valid = classifyOnboarding({ answers: {}, evidence: [] });
  assert.throws(
    () => migrateOnboardingState({ ...valid, route: 'brownfield' }),
    (error) => error?.code === 'ONBOARDING_STATE_INVALID',
  );
  assert.throws(
    () => migrateOnboardingState({
      ...valid,
      answers: { ...valid.answers, schemaVersion: '1.0.0' },
    }),
    (error) => error?.code === 'ONBOARDING_STATE_INVALID',
  );
});

test('inputs demasiado grandes fallan antes de parsear contenido', async () => {
  const root = await temporary('oversized');
  await writeFile(
    path.join(root, 'answers.json'),
    Buffer.alloc(MAX_ONBOARDING_INPUT_BYTES + 1, 0x61),
  );
  await assert.rejects(
    buildOnboardingPlan({ answersPath: 'answers.json', targetRoot: root }),
    (error) => error?.code === 'ONBOARDING_INPUT_TOO_LARGE'
      && error?.details?.includes(`max-bytes=${MAX_ONBOARDING_INPUT_BYTES}`),
  );
});

test('un error JSON no repite contenido potencialmente sensible', async () => {
  const root = await temporary('json-redaction');
  const secret = 'private-json-content-that-must-not-be-reported';
  await writeFile(path.join(root, 'answers.json'), secret);
  await assert.rejects(
    buildOnboardingPlan({ answersPath: 'answers.json', targetRoot: root }),
    (error) => {
      const report = JSON.stringify({
        details: error.details,
        message: error.message,
        remediation: error.remediation,
      });
      return error?.code === 'ONBOARDING_INPUT_JSON_INVALID'
        && report.includes('invalid-json')
        && !report.includes(secret);
    },
  );
});

test('detalle de evidencia aportado por API se reduce a vocabulario seguro', () => {
  const secret = 'literal-secret-from-external-caller';
  const state = classifyOnboarding({
    answers: {},
    evidence: [{
      category: 'inspection',
      detail: secret,
      id: 'inspection.external',
      preservation: true,
    }],
  });
  assert.equal(state.evidence[0].detail, 'unverified');
  assert.equal(stableStringify(state).includes(secret), false);
});

test('inputs que atraviesan symlink son rechazados antes de leerlos', async (t) => {
  const root = await temporary('input-link-root');
  const outside = await temporary('input-link-outside');
  await writeJson(outside, 'answers.json', { guidance: 'brief' });
  try {
    await symlink(outside, path.join(root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  } catch (error) {
    if (error?.code === 'EPERM') {
      t.skip('El runner no permite crear symlinks/junctions.');
      return;
    }
    throw error;
  }
  await assert.rejects(
    buildOnboardingPlan({ answersPath: 'linked/answers.json', targetRoot: root }),
    (error) => error?.code === 'ONBOARDING_INPUT_SYMLINK',
  );
});

test('schemas estrictos validan answers y estado real', async () => {
  const root = await temporary('schema');
  const result = await buildOnboardingPlan({ targetRoot: root });
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const answersSchema = JSON.parse(await readFile(
    path.join(packageRoot, 'schema', 'onboarding-answers.schema.json'),
    'utf8',
  ));
  const stateSchema = JSON.parse(await readFile(
    path.join(packageRoot, 'schema', 'onboarding-state.schema.json'),
    'utf8',
  ));
  const validateAnswers = ajv.compile(answersSchema);
  const validateState = ajv.compile(stateSchema);
  assert.equal(validateAnswers({ guidance: 'brief', tracker: 'defer' }), true);
  assert.equal(validateAnswers({ extra: true }), false);
  assert.equal(validateState(result.state), true, ajv.errorsText(validateState.errors));
});

test('la distribución pública incluye módulo y schemas de onboarding', async () => {
  const targets = (await packageDistributionEntries())
    .map((entry) => entry.target);
  for (const expected of [
    '.project-constructor/runtime/src/onboarding.mjs',
    '.project-constructor/runtime/schema/onboarding-answers.schema.json',
    '.project-constructor/runtime/schema/onboarding-state.schema.json',
  ]) {
    assert.equal(targets.includes(expected), true, expected);
  }
});

test('salida humana y JSON comparten ruta, decisiones y política de mutación', async () => {
  const root = await temporary('cli');
  const jsonResponse = await run(process.execPath, [
    cli,
    'onboarding-plan',
    '--target', root,
    '--json',
  ], { cwd: root });
  assert.equal(jsonResponse.exitCode, 0, jsonResponse.stderr);
  const payload = JSON.parse(jsonResponse.stdout);
  const human = onboardingPlanText(payload);
  assert.match(human, new RegExp(`Ruta: ${payload.state.route}`));
  assert.match(human, /Mutación local: no/);
  assert.match(human, /Mutación remota: no/);
  assert.match(human, new RegExp(`Preguntas pendientes: ${payload.state.pendingQuestions.join(', ')}`));

  const humanResponse = await run(process.execPath, [
    cli,
    'onboarding-plan',
    '--target', root,
  ], { cwd: root });
  assert.equal(humanResponse.exitCode, 0, humanResponse.stderr);
  assert.equal(humanResponse.stdout, human);
});

test('flags de onboarding no se aceptan en otros comandos', async () => {
  const root = await temporary('scope');
  const response = await run(process.execPath, [
    cli,
    'doctor',
    '--target', root,
    '--answers', 'answers.json',
    '--json',
  ], { cwd: root });
  assert.equal(response.exitCode, 2);
  assert.equal(JSON.parse(response.stderr).code, 'CLI_ONBOARDING_SCOPE');
});

test('errores CLI JSON no repiten keys o contenido hostil', async () => {
  const root = await temporary('cli-redaction');
  const secret = 'secret-material-in-input';
  await writeJson(root, 'answers.json', { [secret]: secret });
  const response = await run(process.execPath, [
    cli,
    'onboarding-plan',
    '--target', root,
    '--answers', 'answers.json',
    '--json',
  ], { cwd: root });
  assert.equal(response.exitCode, 2);
  assert.equal(response.stdout, '');
  assert.equal(response.stderr.includes(secret), false);
  const payload = JSON.parse(response.stderr);
  assert.equal(payload.code, 'ONBOARDING_ANSWERS_INVALID');
  assert.deepEqual(payload.details, ['unknown-fields=1']);
});
