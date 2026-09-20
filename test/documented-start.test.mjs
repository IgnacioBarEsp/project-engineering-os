import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { documentedSteps, readDoctor, verdict, verifyDocumentedStart } from '../scripts/verify-documented-start.mjs';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));

// El bloque tiene que contener el bootstrap publicado para que el lector lo elija; el resto de las líneas son
// comandos locales, para que estas pruebas no toquen la red ni el registro.
const fixtureReadme = (first) => `# Fixture\n\nTexto.\n\n\`\`\`sh\n${first}\necho create-project-engineering-os@0.5.0 bootstrap --target .\n\`\`\`\n`;

async function fixture(readme) {
  const root = await mkdtemp(path.join(tmpdir(), 'peos-documented-start-test-'));
  await writeFile(path.join(root, 'README.md'), readme);
  return root;
}

test('lee los pasos publicados del README real, en orden', async () => {
  const steps = documentedSteps(await readFile(path.join(repoRoot, 'README.md'), 'utf8'));
  assert.equal(steps.length, 6);
  assert.match(steps[0], /^npx --yes create-project-engineering-os@\d+\.\d+\.\d+ bootstrap --target \.$/);
  assert.deepEqual(steps.slice(1), ['npm ci', 'npm run openspec:init', 'npm run project-os:opsx:adapt',
    'npm run project-os:check', 'npm run project-os:doctor']);
});

test('un README sin bloque de arranque no deja nada que comprobar', () => {
  assert.deepEqual(documentedSteps('# Sin bloque\n\nTexto.\n'), []);
  assert.deepEqual(documentedSteps('```sh\nnpm ci\n```\n'), []);
});

test('una comprobación que no pudo ejecutarse no es un PASS', () => {
  assert.equal(verdict({ unreachableRegistry: true, findings: [] }), 'NO EJECUTADA');
  assert.equal(verdict({ unreachableRegistry: true, findings: ['registro caído'] }), 'NO EJECUTADA');
  assert.equal(verdict({ findings: ['un paso salió con código 3'] }), 'FAIL');
  assert.equal(verdict({ findings: [] }), 'PASS');
  assert.equal(verdict(), 'PASS');
});

test('falla y nombra el paso cuando uno no sale con código 0', async () => {
  const root = await fixture(fixtureReadme('node --eval "process.exit(3)"'));
  try {
    const record = await verifyDocumentedStart(root);
    assert.equal(record.summary.verdict, 'FAIL');
    assert.ok(record.findings.some((f) => f.includes('código 3') && f.includes('process.exit(3)')), record.findings.join('; '));
    // Se detiene en el paso que falló: seguir mediría otra cosa.
    assert.equal(record.summary.executed, 1);
    assert.equal(record.summary.documentedSteps, 2);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('pasa cuando cada paso publicado sale con código 0', async () => {
  const root = await fixture(fixtureReadme('node --eval "process.exit(0)"'));
  try {
    const record = await verifyDocumentedStart(root);
    assert.equal(record.summary.verdict, 'PASS');
    assert.equal(record.summary.passed, 2);
    assert.deepEqual(record.findings, []);
    assert.equal(record.packageVersion, null, 'la versión solo se declara si el primer paso la nombra');
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('un error de npm que nombra el registro no es «sin red»', async () => {
  // Un 404 por una versión inexistente lleva la URL del registro en su mensaje. Tomarlo por falta de red
  // convertiría un arranque roto en «no se pudo comprobar», que es lo contrario de lo que exige la spec.
  const root = await fixture(fixtureReadme(
    'node --eval "console.error(\'npm error 404 Not Found - GET https://registry.npmjs.org/create-project-engineering-os\'); process.exit(1)"'));
  try {
    const record = await verifyDocumentedStart(root);
    assert.equal(record.summary.verdict, 'FAIL');
    assert.equal(record.unreachableRegistry, undefined);
    assert.ok(record.findings.some((f) => f.includes('código 1')), record.findings.join('; '));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('un doctor cuyo esquema no se reconoce no cuenta como «ningún FAIL»', () => {
  assert.deepEqual(readDoctor({ checks: [{ id: 'uno', status: 'PASS' }] }).findings, []);
  assert.equal(readDoctor({ checks: [{ id: 'uno', status: 'PASS' }] }).record.checks, 1);

  const unknown = readDoctor({ summary: { checks: [{ id: 'uno', status: 'FAIL' }] } });
  assert.equal(unknown.record.checks, null);
  assert.ok(unknown.findings.some((f) => f.includes('sin lista de comprobaciones')), unknown.findings.join('; '));

  const empty = readDoctor({ checks: [] });
  assert.ok(empty.findings.some((f) => f.includes('ninguna comprobación')), empty.findings.join('; '));

  const failing = readDoctor({ results: [{ id: 'profile.ui', status: 'FAIL' }, { id: 'ok', status: 'PASS' }] });
  assert.deepEqual(failing.record.fails, ['profile.ui']);
  assert.ok(failing.findings.some((f) => f.includes('1 FAIL')), failing.findings.join('; '));

  assert.ok(readDoctor(null).findings.some((f) => f.includes('JSON legible')));
});

test('un comentario del bloque publicado no es un paso', () => {
  const steps = documentedSteps('```sh\n# primero esto\nnpm ci\necho create-project-engineering-os@0.5.0 bootstrap\n```\n');
  assert.deepEqual(steps, ['npm ci', 'echo create-project-engineering-os@0.5.0 bootstrap']);
});

test('sin bloque publicado lo dice en vez de pasar en vacío', async () => {
  const root = await fixture('# Fixture\n\nSin bloque de arranque.\n');
  try {
    const record = await verifyDocumentedStart(root);
    assert.equal(record.summary.verdict, 'FAIL');
    assert.ok(record.findings.some((f) => f.includes('no hay nada que comprobar')), record.findings.join('; '));
  } finally { await rm(root, { recursive: true, force: true }); }
});
