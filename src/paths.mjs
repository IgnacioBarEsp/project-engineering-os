import {
  constants as fsConstants,
} from 'node:fs';
import {
  access,
  lstat,
  open,
  realpath,
  stat,
} from 'node:fs/promises';
import {
  dirname,
  isAbsolute,
  posix,
  relative,
  resolve,
  sep,
} from 'node:path';

import { ConstructorError } from './errors.mjs';

export function normalizeRelativePath(input, label = 'ruta') {
  if (typeof input !== 'string' || input.trim() === '') {
    throw new ConstructorError('PATH_INVALID', `${label} debe ser una ruta relativa no vacía.`);
  }

  if (input.includes('\0') || /^[a-zA-Z]:/.test(input) || isAbsolute(input)) {
    throw new ConstructorError('PATH_INVALID', `${label} debe permanecer dentro de su raíz.`, {
      details: input,
    });
  }

  const normalized = posix.normalize(input.replaceAll('\\', '/')).replace(/^\.\//, '');

  if (
    normalized === '.'
    || normalized === '..'
    || normalized.startsWith('../')
    || normalized.startsWith('/')
  ) {
    throw new ConstructorError('PATH_TRAVERSAL', `${label} intenta salir de su raíz.`, {
      details: input,
      remediation: 'Use una ruta relativa sin segmentos "..".',
    });
  }

  return normalized;
}

export function resolveInside(root, relativePath, label = 'ruta') {
  const normalized = normalizeRelativePath(relativePath, label);
  const rootResolved = resolve(root);
  const destination = resolve(rootResolved, ...normalized.split('/'));
  const back = relative(rootResolved, destination);

  if (back === '..' || back.startsWith(`..${sep}`) || isAbsolute(back)) {
    throw new ConstructorError('PATH_TRAVERSAL', `${label} intenta salir de su raíz.`, {
      details: normalized,
    });
  }

  return destination;
}

function normalizedComparable(path) {
  const resolved = resolve(path);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

export function isInside(root, candidate) {
  const rootComparable = normalizedComparable(root);
  const candidateComparable = normalizedComparable(candidate);
  const suffix = candidateComparable.slice(rootComparable.length);
  return (
    candidateComparable === rootComparable
    || suffix.startsWith(sep)
  );
}

export async function assertExistingPathInsideRoot(root, candidate, label) {
  let stats;

  try {
    stats = await lstat(candidate);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return;
    }
    throw error;
  }

  if (stats.isSymbolicLink()) {
    const resolvedLink = await realpath(candidate);
    const resolvedRoot = await realpath(root);
    if (!isInside(resolvedRoot, resolvedLink)) {
      throw new ConstructorError('SYMLINK_ESCAPE', `${label} apunta fuera del repositorio.`, {
        details: candidate,
        remediation: 'Retire el enlace simbólico o seleccione otro destino.',
      });
    }
  }
}

export async function assertNoSymlinkEscape(root, relativePath) {
  const normalized = normalizeRelativePath(relativePath);
  const segments = normalized.split('/');
  let cursor = resolve(root);

  for (const segment of segments) {
    cursor = resolve(cursor, segment);
    await assertExistingPathInsideRoot(root, cursor, normalized);
  }
}

async function readBoundedHandle(handle, maxBytes, label = 'archivo') {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
    throw new TypeError('maxBytes debe ser un entero seguro no negativo.');
  }
  const metadata = await handle.stat();
  if (!metadata.isFile()) {
    const error = new Error(`${label} no es un archivo regular.`);
    error.code = 'EVIDENCE_NOT_REGULAR';
    throw error;
  }
  if (metadata.size > maxBytes) {
    const error = new Error(`${label} excede el límite de lectura.`);
    error.code = 'EVIDENCE_SIZE_LIMIT';
    throw error;
  }

  // Read at most maxBytes + 1 even if a concurrently modified file grows
  // after fstat. The extra byte distinguishes an exact-limit file from one
  // that crossed the limit during the read.
  const buffer = Buffer.alloc(maxBytes + 1);
  let bytesRead = 0;
  while (bytesRead < buffer.length) {
    const result = await handle.read(
      buffer,
      bytesRead,
      buffer.length - bytesRead,
      bytesRead,
    );
    if (result.bytesRead === 0) break;
    bytesRead += result.bytesRead;
  }
  if (bytesRead > maxBytes) {
    const error = new Error(`${label} excede el límite de lectura.`);
    error.code = 'EVIDENCE_SIZE_LIMIT';
    throw error;
  }
  return buffer.subarray(0, bytesRead);
}

export async function readBoundedFile(absolutePath, maxBytes, label = 'archivo') {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
    throw new TypeError('maxBytes debe ser un entero seguro no negativo.');
  }
  // Reject stable special files before opening them: opening a FIFO for
  // reading can otherwise wait indefinitely before fstat gets a chance to
  // reject it. O_NONBLOCK also closes that wait if the path changes to a FIFO
  // between this check and open on POSIX systems.
  const metadata = await stat(absolutePath);
  if (!metadata.isFile()) {
    const error = new Error(`${label} no es un archivo regular.`);
    error.code = 'EVIDENCE_NOT_REGULAR';
    throw error;
  }
  const flags = process.platform === 'win32'
    ? fsConstants.O_RDONLY
    : fsConstants.O_RDONLY | fsConstants.O_NONBLOCK;
  const handle = await open(absolutePath, flags);
  try {
    return await readBoundedHandle(handle, maxBytes, label);
  } finally {
    await handle.close();
  }
}

export const pathsInternals = Object.freeze({ readBoundedHandle });

export async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export function parentDirectories(relativePath) {
  const result = [];
  let cursor = posix.dirname(normalizeRelativePath(relativePath));
  while (cursor !== '.' && cursor !== '/') {
    result.push(cursor);
    cursor = posix.dirname(cursor);
  }
  return result;
}
