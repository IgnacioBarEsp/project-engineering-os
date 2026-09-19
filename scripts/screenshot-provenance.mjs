import { createHash } from 'node:crypto';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

// Las imágenes publicadas como producto deben proceder de una ejecución real y declararla.
// Este módulo comprueba el registro que acompaña a cada captura y rechaza prototipos de
// diseño presentados como producto. Fallar cerrado es intencional: un hash sin registro o
// un registro sin hash es exactamente el defecto que #143 corrige.
export const PUBLISHED_IMAGE_ROOTS = ['docs/assets/companion'];
export const PUBLISHED_IMAGE_FILES = ['docs/assets/companion-current-home.png'];
export const PROTOTYPE_ROOTS = ['docs/stitch uxui'];
export const PROVENANCE_SUFFIX = '.provenance.json';

const SHA256_RE = /^[a-f0-9]{64}$/;
const COMMIT_RE = /^[a-f0-9]{40}$/;
const USER_PATH_RE = /[A-Za-z]:[\\/]Users[\\/][^\\/"]+[\\/]|[\\/]home[\\/][^\\/"]+[\\/]|~[\\/]/i;

const positiveInteger = (value) => Number.isInteger(value) && value > 0;
const nonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const plainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export async function listPublishedImages(root) {
  const images = [];
  for (const relative of PUBLISHED_IMAGE_FILES) images.push(relative);
  for (const relativeRoot of PUBLISHED_IMAGE_ROOTS) {
    let entries;
    try {
      entries = await readdir(path.join(root, relativeRoot), { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
        images.push(`${relativeRoot}/${entry.name}`);
      }
    }
  }
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
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) images.push(relative);
    }
  };
  for (const relativeRoot of PROTOTYPE_ROOTS) await visit(relativeRoot);
  return images;
}

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
  if (!plainObject(record.window)) failures.push('window debe ser un objeto');
  if (!plainObject(record.screen)) failures.push('screen debe ser un objeto');
  if (!nonEmptyString(record.generator)) failures.push('generator falta o está vacío');
  if (typeof record.capturedAt !== 'string' || Number.isNaN(Date.parse(record.capturedAt))) {
    failures.push('capturedAt debe ser una fecha ISO 8601');
  }
  if (!nonEmptyString(record.platform)) failures.push('platform falta o está vacío');
  return failures;
}

export async function inspectScreenshotProvenance(root) {
  const failures = [];
  const images = await listPublishedImages(root);
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
    }
  }
  return failures;
}
