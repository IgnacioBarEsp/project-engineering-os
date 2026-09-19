import { createHash } from 'node:crypto';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

// Las imágenes publicadas como producto deben proceder de una ejecución real y declararla.
// Este módulo comprueba el registro que acompaña a cada captura y rechaza prototipos de
// diseño presentados como producto. Fallar cerrado es intencional: un hash sin registro o
// un registro sin hash es exactamente el defecto que #143 corrige.
export const PUBLISHED_ASSETS_ROOT = 'docs/assets';
export const PUBLISHED_PREFIX = 'companion';
export const PROTOTYPE_ROOTS = ['docs/stitch uxui'];
export const PROVENANCE_SUFFIX = '.provenance.json';
export const GALLERY_FILE = 'docs/companion/SCREENSHOTS.md';
// Cualquier formato que la documentación pueda publicar, no solo el que usa hoy: una imagen nueva
// en otro formato no puede colarse sin procedencia por no estar en la lista.
export const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.bmp', '.svg'];
export const PROVENANCE_FIELDS = ['schemaVersion', 'sha256', 'bytes', 'width', 'height', 'commit',
  'appVersion', 'ran', 'engine', 'window', 'screen', 'generator', 'capturedAt', 'platform'];

const SHA256_RE = /^[a-f0-9]{64}$/;
const COMMIT_RE = /^[a-f0-9]{40}$/;
// La carpeta de una cuenta, con o sin nada detrás: `C:\Users\ana`, `/home/ana/x`, `/Users/ana`.
const USER_PATH_RE = /(?:[A-Za-z]:)?[\\/](?:Users|home)[\\/][^\\/"]+/i;

const positiveInteger = (value) => Number.isInteger(value) && value > 0;
const nonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const plainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const isImage = (name) => IMAGE_EXTENSIONS.includes(path.extname(name).toLowerCase());

// Todo lo que cuelga de docs/assets y empieza por `companion`, a cualquier profundidad: el archivo
// suelto del README y la galería de hoy, y cualquier carpeta o formato que se publique mañana.
export async function listPublishedImages(root) {
  const images = [];
  const visit = async (relative, published) => {
    let entries;
    try {
      entries = await readdir(path.join(root, relative), { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const child = `${relative}/${entry.name}`;
      const inside = published || entry.name.toLowerCase().startsWith(PUBLISHED_PREFIX);
      if (entry.isDirectory()) await visit(child, inside);
      else if (inside && entry.isFile() && isImage(entry.name)) images.push(child);
    }
  };
  await visit(PUBLISHED_ASSETS_ROOT, false);
  return images;
}

async function listPrototypeImages(root) {
  const images = [];
  const visit = async (dir) => {
    let entries;
    try {
      entries = await readdir(path.join(root, dir), { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const relative = `${dir}/${entry.name}`;
      if (entry.isDirectory()) await visit(relative);
      else if (entry.isFile() && isImage(entry.name)) images.push(relative);
    }
  };
  for (const relativeRoot of PROTOTYPE_ROOTS) await visit(relativeRoot);
  return images;
}

// Ancho y alto reales del PNG, en su cabecera IHDR. Otros formatos no se miden aquí: su registro
// declara dimensiones que esta comprobación no puede contrastar, y así se dice.
const pngSize = (bytes) => (bytes.length > 24 && bytes.readUInt32BE(0) === 0x89504e47
  ? { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
  : null);

export function provenanceFieldFailures(record) {
  const failures = [];
  if (!plainObject(record)) return ['el registro no es un objeto JSON'];
  if (record.schemaVersion !== 1) failures.push('schemaVersion debe ser 1');
  if (!SHA256_RE.test(record.sha256 ?? '')) failures.push('sha256 debe ser 64 hex');
  if (!positiveInteger(record.bytes)) failures.push('bytes debe ser entero positivo');
  if (!positiveInteger(record.width)) failures.push('width debe ser entero positivo');
  if (!positiveInteger(record.height)) failures.push('height debe ser entero positivo');
  if (!COMMIT_RE.test(record.commit ?? '')) failures.push('commit debe ser 40 hex');
  if (!nonEmptyString(record.appVersion)) failures.push('appVersion falta o está vacío');
  if (!nonEmptyString(record.ran)) failures.push('ran falta o está vacío');
  if (!nonEmptyString(record.engine)) failures.push('engine falta o está vacío');
  // La ventana y la pantalla son procedencia publicada, no adornos: un objeto vacío diría lo mismo
  // que no declararlas.
  if (!plainObject(record.window)) failures.push('window debe ser un objeto');
  else {
    if (!positiveInteger(record.window.outer?.width) || !positiveInteger(record.window.outer?.height)) {
      failures.push('window.outer debe declarar width y height');
    }
    if (!positiveInteger(record.window.viewport?.width) || !positiveInteger(record.window.viewport?.height)) {
      failures.push('window.viewport debe declarar width y height');
    }
    if (!(typeof record.window.devicePixelRatio === 'number' && record.window.devicePixelRatio > 0)) {
      failures.push('window.devicePixelRatio debe ser un número positivo');
    }
  }
  if (!plainObject(record.screen)) failures.push('screen debe ser un objeto');
  else {
    if (!nonEmptyString(record.screen.id)) failures.push('screen.id falta o está vacío');
    if (!nonEmptyString(record.screen.title)) failures.push('screen.title falta o está vacío');
  }
  if (!nonEmptyString(record.generator)) failures.push('generator falta o está vacío');
  if (typeof record.capturedAt !== 'string' || Number.isNaN(Date.parse(record.capturedAt))) {
    failures.push('capturedAt debe ser una fecha ISO 8601');
  }
  if (!nonEmptyString(record.platform)) failures.push('platform falta o está vacío');
  const unknown = Object.keys(record).filter((key) => !PROVENANCE_FIELDS.includes(key));
  if (unknown.length) failures.push(`campos desconocidos para el contrato v1: ${unknown.join(', ')}`);
  return failures;
}

export async function inspectScreenshotProvenance(root) {
  const failures = [];
  const images = await listPublishedImages(root);
  // Una comprobación que no encuentra nada que comprobar no es un PASS: o falta la galería, o
  // alguien movió las imágenes fuera del alcance de esta regla.
  if (!images.length) {
    return [`sin imágenes publicadas que comprobar bajo ${PUBLISHED_ASSETS_ROOT}/${PUBLISHED_PREFIX}*`];
  }
  const prototypes = await listPrototypeImages(root);
  const prototypeHashes = new Map();
  for (const relative of prototypes) {
    try {
      const bytes = await readFile(path.join(root, relative));
      const hash = createHash('sha256').update(bytes).digest('hex');
      if (!prototypeHashes.has(hash)) prototypeHashes.set(hash, relative);
    } catch {
      // Un prototipo ilegible no puede coincidir con nada; no bloquea la comprobación.
    }
  }
  const gallery = await readFile(path.join(root, GALLERY_FILE), 'utf8').catch(() => null);
  const declared = { commits: new Map(), engines: new Set(), ran: new Set() };
  for (const relative of images) {
    const absolute = path.join(root, relative);
    let bytes;
    try {
      bytes = await readFile(absolute);
    } catch {
      continue; // listPublishedImages solo devuelve archivos existentes; se ignora la carrera.
    }
    const hash = createHash('sha256').update(bytes).digest('hex');
    const twin = prototypeHashes.get(hash);
    if (twin) {
      failures.push(`prototipo publicado como producto: ${relative} es idéntica a ${twin}`);
    }
    const recordRelative = `${relative}${PROVENANCE_SUFFIX}`;
    let raw;
    try {
      raw = await readFile(path.join(root, recordRelative), 'utf8');
    } catch {
      failures.push(`procedencia ausente: ${recordRelative}`);
      continue;
    }
    let record;
    try {
      record = JSON.parse(raw);
    } catch {
      failures.push(`procedencia ilegible: ${recordRelative} no es JSON válido`);
      continue;
    }
    for (const fieldFailure of provenanceFieldFailures(record)) {
      failures.push(`procedencia inválida: ${recordRelative}: ${fieldFailure}`);
    }
    if (plainObject(record)) {
      if (record.sha256 !== hash) {
        failures.push(`hash distinto: ${recordRelative} no coincide con los bytes de ${relative}`);
      }
      if (positiveInteger(record.bytes) && record.bytes !== bytes.length) {
        failures.push(`tamaño distinto: ${recordRelative} declara ${record.bytes}, la imagen pesa ${bytes.length}`);
      }
      // Las dimensiones se publican en la galería; recortar la imagen y recalcular hash y tamaño no
      // debe bastar para que el registro siga cuadrando.
      const size = pngSize(bytes);
      if (size && (record.width !== size.width || record.height !== size.height)) {
        failures.push(`dimensiones distintas: ${recordRelative} declara ${record.width} × ${record.height}, la imagen mide ${size.width} × ${size.height}`);
      }
      if (nonEmptyString(record.generator)) {
        const generator = record.generator;
        const outside = generator.startsWith('/') || /^[A-Za-z]:/.test(generator)
          || generator.split(/[\\/]/).includes('..');
        if (outside) {
          failures.push(`generador fuera del repositorio: ${recordRelative}: ${generator}`);
        } else {
          try {
            await access(path.join(root, generator));
          } catch {
            failures.push(`generador inexistente: ${recordRelative}: ${generator}`);
          }
        }
      }
      // En el JSON las barras de Windows viajan duplicadas; se normaliza para que la regex vea la ruta real.
      if (USER_PATH_RE.test(raw) || USER_PATH_RE.test(raw.split('\\\\').join('\\'))) {
        failures.push(`ruta de usuario en el registro: ${recordRelative}`);
      }
      if (COMMIT_RE.test(record.commit ?? '')) {
        if (!declared.commits.has(record.commit)) declared.commits.set(record.commit, []);
        declared.commits.get(record.commit).push(relative);
      }
      if (nonEmptyString(record.engine)) declared.engines.add(record.engine.trim());
      if (nonEmptyString(record.ran)) declared.ran.add(record.ran.trim());
    }
  }
  // Una galería publica un commit y una ejecución: imágenes de dos recorridos distintos no pueden
  // presentarse bajo esa misma procedencia.
  if (declared.commits.size > 1) {
    const detail = [...declared.commits.entries()]
      .map(([commit, files]) => `${commit.slice(0, 7)} (${files.length})`).join(', ');
    failures.push(`las imágenes publicadas declaran commits distintos: ${detail}`);
  }
  // Y el entorno que declara la galería tiene que ser el que dicen los registros, no una frase fija.
  if (gallery === null) {
    failures.push(`falta la galería ${GALLERY_FILE}, que declara la procedencia publicada`);
  } else {
    // El defecto que originó esta comprobación: la galería citaba un commit que no produjo las imágenes.
    for (const commit of declared.commits.keys()) {
      if (!gallery.includes(commit)) failures.push(`la galería no cita el commit de los registros: ${commit}`);
    }
    for (const engine of declared.engines) {
      if (!gallery.includes(engine)) failures.push(`la galería no declara el motor de los registros: ${engine}`);
    }
    for (const ran of declared.ran) {
      if (!gallery.includes(ran)) failures.push(`la galería no declara cómo se ejecutó según los registros: ${ran}`);
    }
  }
  return failures;
}
