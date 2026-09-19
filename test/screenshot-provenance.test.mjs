import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  PROVENANCE_SUFFIX,
  inspectScreenshotProvenance,
  provenanceFieldFailures,
} from '../scripts/screenshot-provenance.mjs';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const GENERATOR = 'apps/companion/scripts/capture-screenshots.mjs';

const pngBytes = (seed) => Buffer.from(`\x89PNG\r\n\x1a\n-fixture-${seed}`);

function record(bytes, overrides = {}) {
  return {
    schemaVersion: 1,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length,
    width: 1164,
    height: 755,
    commit: 'a'.repeat(40),
    appVersion: '0.3.2',
    ran: 'electron .',
    engine: 'Electron 44.0.0 Chromium 136',
    window: { outer: [1180, 820], viewport: [1164, 755], devicePixelRatio: 1 },
    screen: { id: 'home', title: 'Inicio' },
    generator: GENERATOR,
    capturedAt: '2026-09-19T18:00:00.000Z',
    platform: 'Windows 11 Pro 10.0.26100',
    ...overrides,
  };
}

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'peos-provenance-'));
  await mkdir(path.join(root, 'docs/assets/companion'), { recursive: true });
  await mkdir(path.join(root, 'docs/stitch uxui/mock'), { recursive: true });
  await mkdir(path.dirname(path.join(root, GENERATOR)), { recursive: true });
  await writeFile(path.join(root, GENERATOR), '// generador fixture\n');
  return root;
}

async function publish(root, name, bytes, recordOverrides) {
  const image = path.join(root, 'docs/assets/companion', name);
  await writeFile(image, bytes);
  if (recordOverrides !== null) {
    await writeFile(`${image}${PROVENANCE_SUFFIX}`, JSON.stringify(record(bytes, recordOverrides), null, 2));
  }
}

test('acepta el repositorio fixture en verde', async () => {
  const root = await fixture();
  try {
    await publish(root, 'paso-1.png', pngBytes(1));
    await publish(root, 'paso-2.png', pngBytes(2));
    await writeFile(path.join(root, 'docs/stitch uxui/mock/screen.png'), pngBytes(99));
    assert.deepEqual(await inspectScreenshotProvenance(root), []);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('rechaza la imagen idéntica a un prototipo', async () => {
  const root = await fixture();
  try {
    const mock = pngBytes(7);
    await writeFile(path.join(root, 'docs/stitch uxui/mock/screen.png'), mock);
    await publish(root, 'home.png', mock);
    const failures = await inspectScreenshotProvenance(root);
    assert.ok(failures.some((f) => f.includes('prototipo publicado como producto')
      && f.includes('home.png') && f.includes('screen.png')), failures.join('; '));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('rechaza registro ausente, ilegible y con hash o tamaño distintos', async () => {
  const root = await fixture();
  try {
    await publish(root, 'sin-registro.png', pngBytes(10), null);
    await publish(root, 'ilegible.png', pngBytes(11));
    await writeFile(path.join(root, 'docs/assets/companion/ilegible.png' + PROVENANCE_SUFFIX), '{ no json');
    const bytes = pngBytes(12);
    await publish(root, 'hash-malo.png', bytes, { sha256: 'b'.repeat(64) });
    await publish(root, 'tamano-malo.png', bytes, { bytes: bytes.length + 1 });
    const failures = await inspectScreenshotProvenance(root);
    assert.ok(failures.some((f) => f.includes('procedencia ausente') && f.includes('sin-registro.png')), failures.join('; '));
    assert.ok(failures.some((f) => f.includes('procedencia ilegible') && f.includes('ilegible.png')), failures.join('; '));
    assert.ok(failures.some((f) => f.includes('hash distinto') && f.includes('hash-malo.png')), failures.join('; '));
    assert.ok(failures.some((f) => f.includes('tamaño distinto') && f.includes('tamano-malo.png')), failures.join('; '));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('rechaza campos inválidos, generador inexistente o externo y rutas de usuario', async () => {
  const root = await fixture();
  try {
    await publish(root, 'campo-malo.png', pngBytes(20), { appVersion: '' });
    await publish(root, 'gen-malo.png', pngBytes(21), { generator: 'scripts/no-existe.mjs' });
    await publish(root, 'gen-externo.png', pngBytes(22), { generator: 'C:\\Windows\\system32\\evil.mjs' });
    await publish(root, 'ruta-usuario.png', pngBytes(23), { screen: { id: 'final', title: 'C:\\Users\\cuenta\\proyecto' } });
    const failures = await inspectScreenshotProvenance(root);
    assert.ok(failures.some((f) => f.includes('procedencia inválida') && f.includes('campo-malo.png') && f.includes('appVersion')), failures.join('; '));
    assert.ok(failures.some((f) => f.includes('generador inexistente') && f.includes('gen-malo.png')), failures.join('; '));
    assert.ok(failures.some((f) => f.includes('generador fuera del repositorio') && f.includes('gen-externo.png')), failures.join('; '));
    assert.ok(failures.some((f) => f.includes('ruta de usuario') && f.includes('ruta-usuario.png')), failures.join('; '));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('provenanceFieldFailures cubre el contrato v1', () => {
  const bytes = pngBytes(30);
  assert.deepEqual(provenanceFieldFailures(record(bytes)), []);
  assert.deepEqual(provenanceFieldFailures(null), ['el registro no es un objeto JSON']);
  for (const override of [
    { schemaVersion: 2 },
    { sha256: 'no-hex' },
    { bytes: -1 },
    { width: 0 },
    { commit: 'abc' },
    { capturedAt: 'ayer' },
    { window: null },
    { platform: ' ' },
  ]) {
    assert.ok(provenanceFieldFailures(record(bytes, override)).length > 0, JSON.stringify(override));
  }
});

test('comprueba también companion-current-home.png', async () => {
  const root = await fixture();
  try {
    const bytes = pngBytes(40);
    await writeFile(path.join(root, 'docs/assets/companion-current-home.png'), bytes);
    const failures = await inspectScreenshotProvenance(root);
    assert.ok(failures.some((f) => f.includes('procedencia ausente') && f.includes('companion-current-home.png')), failures.join('; '));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('rechaza el repositorio real mientras las imágenes sigan siendo mocks', async () => {
  // Control negativo sobre el estado verdadero: antes de las capturas de la tarea 3, la comprobación
  // debe fallar sobre el repositorio real. Tras apply, la misma llamada devuelve [] (tarea 4.3).
  const failures = await inspectScreenshotProvenance(repoRoot);
  const mockFailures = failures.filter((f) => f.startsWith('prototipo publicado como producto'));
  const recordFailures = failures.filter((f) => f.startsWith('procedencia ausente'));
  if (mockFailures.length > 0) {
    assert.equal(mockFailures.length, 7, 'las siete imágenes actuales son mocks');
    assert.ok(recordFailures.length >= 7, 'ninguna tiene registro todavía');
  } else {
    assert.deepEqual(failures, [], 'tras apply el repositorio real pasa en verde');
  }
});
