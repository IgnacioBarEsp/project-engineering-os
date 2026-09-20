import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  GALLERY_FILE,
  PROVENANCE_SUFFIX,
  inspectScreenshotProvenance,
  listPublishedImages,
  provenanceFieldFailures,
} from '../scripts/screenshot-provenance.mjs';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const GENERATOR = 'apps/companion/scripts/capture-screenshots.mjs';
const ENGINE = 'Electron 44.0.0 Chromium 136';
const RAN = 'electron .';

// Un PNG de mentira pero con cabecera de verdad: la firma y el IHDR en su sitio, para que la comprobación
// pueda leer ancho y alto como los lee en las imágenes publicadas.
const pngBytes = (seed, width = 1164, height = 755) => {
  const bytes = Buffer.alloc(40);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(bytes, 0);
  bytes.write('IHDR', 12, 'ascii');
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);
  bytes.writeUInt32BE(seed, 36);
  return bytes;
};

function record(bytes, overrides = {}) {
  return {
    schemaVersion: 1,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length,
    width: 1164,
    height: 755,
    commit: COMMIT,
    appVersion: '0.3.2',
    ran: RAN,
    engine: ENGINE,
    window: {
      outer: { width: 1180, height: 820 },
      viewport: { width: 1164, height: 755 },
      devicePixelRatio: 1,
    },
    screen: { id: 'home', title: 'Inicio' },
    generator: GENERATOR,
    capturedAt: '2026-09-19T18:00:00.000Z',
    platform: 'Windows 11 Pro 10.0.26100',
    ...overrides,
  };
}

const COMMIT = 'a'.repeat(40);
const GALLERY = `| Fuente | Commit ${COMMIT} |\n| Entorno | Ventana real, ejecutada con \`${RAN}\` |\n| Motor | ${ENGINE} |\n`;

async function fixture(gallery = GALLERY) {
  const root = await mkdtemp(path.join(tmpdir(), 'peos-provenance-'));
  await mkdir(path.join(root, 'docs/assets/companion'), { recursive: true });
  await mkdir(path.join(root, 'docs/stitch uxui/mock'), { recursive: true });
  await mkdir(path.dirname(path.join(root, GENERATOR)), { recursive: true });
  await writeFile(path.join(root, GENERATOR), '// generador fixture\n');
  if (gallery !== null) {
    await mkdir(path.join(root, path.dirname(GALLERY_FILE)), { recursive: true });
    await writeFile(path.join(root, GALLERY_FILE), gallery);
  }
  return root;
}

async function publish(root, name, bytes, recordOverrides) {
  const image = path.join(root, 'docs/assets/companion', name);
  await mkdir(path.dirname(image), { recursive: true });
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

test('rechaza las dimensiones que no coinciden con la imagen', async () => {
  // Recortar una captura y rehacer hash y tamaño no basta: la galería publica el tamaño de la ventana.
  const root = await fixture();
  try {
    await publish(root, 'recortada.png', pngBytes(13, 900, 500));
    const failures = await inspectScreenshotProvenance(root);
    assert.ok(failures.some((f) => f.includes('dimensiones distintas') && f.includes('recortada.png')
      && f.includes('900') && f.includes('500')), failures.join('; '));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('rechaza campos inválidos, generador inexistente o externo y rutas de usuario', async () => {
  const root = await fixture();
  try {
    await publish(root, 'campo-malo.png', pngBytes(20), { appVersion: '' });
    await publish(root, 'gen-malo.png', pngBytes(21), { generator: 'scripts/no-existe.mjs' });
    await publish(root, 'gen-externo.png', pngBytes(22), { generator: 'C:\\Windows\\system32\\evil.mjs' });
    await publish(root, 'ruta-usuario.png', pngBytes(23), { screen: { id: 'final', title: 'C:\\Users\\cuenta\\proyecto' } });
    // La carpeta de la cuenta sin nada detrás, y la forma de macOS: siguen siendo el nombre de alguien.
    await publish(root, 'ruta-final.png', pngBytes(24), { screen: { id: 'final', title: 'Carpeta C:\\Users\\cuenta' } });
    await publish(root, 'ruta-mac.png', pngBytes(25), { screen: { id: 'final', title: '/Users/cuenta/Documentos' } });
    const failures = await inspectScreenshotProvenance(root);
    assert.ok(failures.some((f) => f.includes('procedencia inválida') && f.includes('campo-malo.png') && f.includes('appVersion')), failures.join('; '));
    assert.ok(failures.some((f) => f.includes('generador inexistente') && f.includes('gen-malo.png')), failures.join('; '));
    assert.ok(failures.some((f) => f.includes('generador fuera del repositorio') && f.includes('gen-externo.png')), failures.join('; '));
    for (const name of ['ruta-usuario.png', 'ruta-final.png', 'ruta-mac.png']) {
      assert.ok(failures.some((f) => f.includes('ruta de usuario') && f.includes(name)), `${name}: ${failures.join('; ')}`);
    }
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('rechaza ventana y pantalla vacías o con campos desconocidos', async () => {
  // Declarar `window: {}` decía lo mismo que no declararla, y el contrato la publica como procedencia.
  const root = await fixture();
  try {
    await publish(root, 'ventana-vacia.png', pngBytes(26), { window: {} });
    await publish(root, 'pantalla-vacia.png', pngBytes(27), { screen: { id: '', title: '' } });
    await publish(root, 'ventana-parcial.png', pngBytes(28), {
      window: { outer: { width: 1180, height: 820 }, viewport: { width: 1164 }, devicePixelRatio: 1 },
    });
    await publish(root, 'campo-extra.png', pngBytes(29), { renderer: 'navegador' });
    const failures = await inspectScreenshotProvenance(root);
    assert.ok(failures.some((f) => f.includes('ventana-vacia.png') && f.includes('window.outer')), failures.join('; '));
    assert.ok(failures.some((f) => f.includes('pantalla-vacia.png') && f.includes('screen.id')), failures.join('; '));
    assert.ok(failures.some((f) => f.includes('ventana-parcial.png') && f.includes('window.viewport')), failures.join('; '));
    assert.ok(failures.some((f) => f.includes('campo-extra.png') && f.includes('campos desconocidos')
      && f.includes('renderer')), failures.join('; '));
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
    { height: null },
    { commit: 'abc' },
    { ran: '' },
    { engine: '  ' },
    { capturedAt: 'ayer' },
    { window: null },
    { window: { outer: { width: 1180, height: 820 }, viewport: { width: 1164, height: 755 } } },
    { screen: {} },
    { generator: '' },
    { platform: ' ' },
    { extra: true },
  ]) {
    assert.ok(provenanceFieldFailures(record(bytes, override)).length > 0, JSON.stringify(override));
  }
});

test('alcanza cualquier imagen publicada bajo docs/assets/companion*', async () => {
  // La regla es la carpeta publicada, no una lista de archivos: una imagen nueva, en otro formato o en una
  // subcarpeta, no puede colarse sin procedencia por no estar en la lista.
  const root = await fixture();
  try {
    const bytes = pngBytes(40);
    await writeFile(path.join(root, 'docs/assets/companion-current-home.png'), bytes);
    await mkdir(path.join(root, 'docs/assets/companion/galeria-2027'), { recursive: true });
    await writeFile(path.join(root, 'docs/assets/companion/galeria-2027/nueva.webp'), bytes);
    await mkdir(path.join(root, 'docs/assets/otras'), { recursive: true });
    await writeFile(path.join(root, 'docs/assets/otras/diagrama.png'), pngBytes(41));
    const encontradas = await listPublishedImages(root);
    assert.deepEqual(encontradas, [
      'docs/assets/companion/galeria-2027/nueva.webp',
      'docs/assets/companion-current-home.png',
    ]);
    const failures = await inspectScreenshotProvenance(root);
    assert.ok(failures.some((f) => f.includes('procedencia ausente') && f.includes('companion-current-home.png')), failures.join('; '));
    assert.ok(failures.some((f) => f.includes('procedencia ausente') && f.includes('nueva.webp')), failures.join('; '));
    assert.ok(!failures.some((f) => f.includes('diagrama.png')), 'un diagrama ajeno a la galería no entra');
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('no da por buena una comprobación sin nada que comprobar', async () => {
  // Mover o borrar la galería dejaba la comprobación en verde por vacío, que es el peor PASS posible.
  const root = await fixture();
  try {
    const failures = await inspectScreenshotProvenance(root);
    assert.ok(failures.some((f) => f.includes('sin imágenes publicadas que comprobar')), failures.join('; '));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('rechaza una galería con imágenes de dos ejecuciones', async () => {
  // Una ejecución interrumpida dejaba media galería del commit nuevo y media del viejo, cada mitad con su
  // registro válido.
  const root = await fixture();
  try {
    await publish(root, 'paso-1.png', pngBytes(50));
    await publish(root, 'paso-2.png', pngBytes(51), { commit: 'c'.repeat(40) });
    const failures = await inspectScreenshotProvenance(root);
    assert.ok(failures.some((f) => f.includes('commits distintos') && f.includes('aaaaaaa') && f.includes('ccccccc')), failures.join('; '));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('rechaza la galería que atribuye las imágenes a otro commit', async () => {
  // El defecto original de #143: el texto citaba un commit, una fecha y un generador que no las produjeron.
  const root = await fixture(GALLERY.replace(COMMIT, 'd'.repeat(40)));
  try {
    await publish(root, 'paso-1.png', pngBytes(55));
    const failures = await inspectScreenshotProvenance(root);
    assert.ok(failures.some((f) => f.includes('no cita el commit de los registros') && f.includes(COMMIT)), failures.join('; '));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('exige que la galería declare el entorno que dicen los registros', async () => {
  // Es lo que hace cierta la frase «ventana real»: si las capturas volvieran a salir de un navegador, sus
  // registros lo dirían y el texto publicado tendría que decirlo también.
  const root = await fixture(`| Entorno | Ventana real, ejecutada con \`${RAN}\` |\n| Motor | ${ENGINE} |\n`);
  try {
    await publish(root, 'paso-1.png', pngBytes(60), { engine: 'Chromium 152 en navegador', ran: 'node scripts/render.mjs' });
    const failures = await inspectScreenshotProvenance(root);
    assert.ok(failures.some((f) => f.includes('no declara el motor') && f.includes('Chromium 152 en navegador')), failures.join('; '));
    assert.ok(failures.some((f) => f.includes('no declara cómo se ejecutó') && f.includes('node scripts/render.mjs')), failures.join('; '));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('rechaza la galería ausente', async () => {
  const root = await fixture(null);
  try {
    await publish(root, 'paso-1.png', pngBytes(70));
    const failures = await inspectScreenshotProvenance(root);
    assert.ok(failures.some((f) => f.includes('falta la galería') && f.includes(GALLERY_FILE)), failures.join('; '));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('el repositorio real pasa en verde', async () => {
  // Control sobre el estado verdadero: antes de las capturas, esta llamada devolvía siete «prototipo
  // publicado como producto» y siete «procedencia ausente».
  assert.deepEqual(await inspectScreenshotProvenance(repoRoot), []);
});
