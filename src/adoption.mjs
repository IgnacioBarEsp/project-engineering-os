import { lstat, open, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ConstructorError } from './errors.mjs';
import { sha256 } from './hash.mjs';
import { normalizeRelativePath, resolveInside } from './paths.mjs';

const MAX_CONSENT_BYTES = 64 * 1024;
const MAX_CONSENT_ENTRIES = 256;

export function normalizeAdoptionConsent(value = []) {
  if (!Array.isArray(value) || value.length > MAX_CONSENT_ENTRIES) {
    throw new ConstructorError('ADOPTION_CONSENT_INVALID', 'La adopción requiere una lista de hasta 256 rutas y hashes revisados.');
  }
  const targets = new Set();
  const consent = value.map(item => {
    if (!item || typeof item !== 'object' || Array.isArray(item)
      || Object.keys(item).sort().join(',') !== 'hash,target'
      || typeof item.target !== 'string' || item.target.length > 4096
      || typeof item.hash !== 'string' || !/^[a-f0-9]{64}$/.test(item.hash)) {
      throw new ConstructorError('ADOPTION_CONSENT_INVALID', 'Cada adopción debe contener solamente target y hash SHA-256.');
    }
    const target = normalizeRelativePath(item.target, 'adopción');
    const key = process.platform === 'win32' ? target.toLowerCase() : target;
    if (target !== item.target || targets.has(key)) {
      throw new ConstructorError('ADOPTION_CONSENT_INVALID', 'Las rutas de adopción deben ser únicas y estar normalizadas.');
    }
    targets.add(key);
    return { target, hash: item.hash };
  });
  return consent.sort((a, b) => a.target.localeCompare(b.target));
}

export async function readAdoptionConsent(file) {
  const handle = await open(file, 'r');
  try {
    const stats = await handle.stat();
    if (!stats.isFile() || stats.size > MAX_CONSENT_BYTES) {
      throw new ConstructorError('ADOPTION_CONSENT_INVALID', 'El consentimiento debe ser un archivo JSON de hasta 64 KiB.');
    }
    const buffer = Buffer.alloc(MAX_CONSENT_BYTES + 1);
    let length = 0;
    while (length < buffer.length) {
      const { bytesRead } = await handle.read(buffer, length, buffer.length - length, length);
      if (!bytesRead) break;
      length += bytesRead;
    }
    if (length > MAX_CONSENT_BYTES) throw new ConstructorError('ADOPTION_CONSENT_INVALID', 'El archivo de consentimiento excede 64 KiB.');
    let value;
    try { value = JSON.parse(buffer.subarray(0, length).toString('utf8')); }
    catch { throw new ConstructorError('ADOPTION_CONSENT_INVALID', 'El consentimiento no contiene JSON válido.'); }
    return normalizeAdoptionConsent(value);
  } finally { await handle.close(); }
}

export async function assertAdoptionPath(targetRoot, target) {
  const absolute = resolveInside(targetRoot, target, 'adopción');
  let cursor = resolve(targetRoot);
  for (const segment of [null, ...target.split('/')]) {
    if (segment !== null) cursor = resolve(cursor, segment);
    const stats = await lstat(cursor);
    if (stats.isSymbolicLink() || (cursor === absolute && (!stats.isFile() || stats.nlink !== 1))) {
      throw new ConstructorError('ADOPTION_LINK_UNSAFE', `La adopción de ${target} requiere un archivo regular sin enlaces.`, {
        remediation: 'Selecciona un archivo independiente y vuelve a revisar el plan.',
      });
    }
  }
}

export async function verifyAdoptionGuards(targetRoot, guards = []) {
  for (const { target, hash } of normalizeAdoptionConsent(guards)) {
    try {
      await assertAdoptionPath(targetRoot, target);
      if (sha256(await readFile(resolveInside(targetRoot, target))) === hash) continue;
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
    throw new ConstructorError('ADOPTION_INPUT_CHANGED', `${target} cambió o desapareció después de revisar su adopción.`, {
      remediation: 'Conserva tus archivos y vuelve a revisar sus rutas y hashes antes de continuar.',
    });
  }
}
