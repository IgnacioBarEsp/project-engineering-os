import { createHash, randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import { access, lstat, mkdir, open, realpath, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { homedir } from 'node:os';

export const NAMESPACE = '.project-os/companion';
export const hash = value => createHash('sha256').update(value).digest('hex');
export const json = value => JSON.stringify(value, null, 2) + '\n';
export class PreparationError extends Error {
  constructor(code, message, action = 'Revisa la carpeta y vuelve a comprobar.') {
    super(message); this.name = 'PreparationError'; this.code = code; this.action = action;
  }
}
export const fail = (code, message, action) => { throw new PreparationError(code, message, action); };
const equalPath = (a,b) => process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;

export async function readBounded(absolute, maxBytes) {
  const handle = await open(absolute, 'r');
  try {
    const content = Buffer.alloc(maxBytes + 1);
    let used = 0;
    while (used <= maxBytes) {
      const { bytesRead } = await handle.read(content, used, content.length - used, null);
      if (!bytesRead) return content.subarray(0, used);
      used += bytesRead;
    }
    fail('BYTE_LIMIT', 'El archivo supera el límite de lectura.');
  } finally { await handle.close(); }
}

export async function assertPath(root, relative = '') {
  const rootStat = await lstat(root);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink() || !equalPath(await realpath(root), root)) {
    fail('FOLDER_CHANGED', 'La carpeta de destino cambió o ahora pasa por un vínculo.');
  }
  if (typeof relative !== 'string' || relative.includes('\\') || relative.includes('\0') || relative.includes(':')
      || path.isAbsolute(relative) || relative.split('/').some(p => p === '..' || p === '.')) {
    fail('PATH_INVALID', 'La ruta de preparación no es válida.');
  }
  let current = root;
  for (const segment of relative ? relative.split('/') : []) {
    current = path.join(current, segment);
    try {
      const stat = await lstat(current);
      if (stat.isSymbolicLink() || (stat.isFile() && stat.nlink > 1)) {
        fail('LINK_REJECTED', 'Una ruta de preparación es un vínculo.', 'Elige una carpeta normal; no se modificaron archivos a través del vínculo.');
      }
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return current;
}

export async function canonicalFolder(input) {
  if (typeof input !== 'string' || !path.isAbsolute(input) || input.includes('\0')) fail('FOLDER_INVALID', 'Elige una carpeta con una ruta absoluta.');
  const resolved = path.resolve(input);
  let cursor = resolved;
  while (true) {
    const stat = await lstat(cursor).catch(error => {
      if (error.code === 'ENOENT') fail('FOLDER_MISSING', 'La carpeta ya no existe.', 'Elige otra carpeta o vuelve a crearla.');
      throw error;
    });
    if (stat.isSymbolicLink()) fail('LINK_REJECTED', 'La carpeta seleccionada pasa por un vínculo.', 'Selecciona directamente su carpeta de destino.');
    if (cursor === resolved && !stat.isDirectory()) fail('NOT_DIRECTORY', 'La selección no es una carpeta.');
    const parent = path.dirname(cursor); if (parent === cursor) break; cursor = parent;
  }
  const root = await realpath(resolved);
  if ([path.parse(root).root, homedir()].some(value => equalPath(path.resolve(value), root))) {
    fail('FOLDER_TOO_BROAD', 'Elige una carpeta de proyecto, no toda la unidad o tu carpeta personal.');
  }
  for (const protectedFolder of [process.env.WINDIR, process.env.ProgramFiles, process.env['ProgramFiles(x86)']].filter(Boolean)) {
    const back = path.relative(path.resolve(protectedFolder), root);
    if (!back || (!back.startsWith('..') && !path.isAbsolute(back))) fail('SYSTEM_FOLDER', 'Esta carpeta pertenece a una instalación del sistema.');
  }
  await access(root, constants.R_OK);
  return root;
}

export async function snapshot(root, relative, maxBytes = 2 * 1024 * 1024) {
  const absolute = await assertPath(root, relative);
  try {
    const stat = await lstat(absolute);
    if (!stat.isFile() || stat.size > maxBytes) fail('STATE_INVALID', 'Un archivo de preparación tiene un tipo o tamaño inesperado.');
    const content = await readBounded(absolute, maxBytes);
    if (content.length > maxBytes) fail('STATE_INVALID', 'El archivo cambió de tamaño durante la lectura.');
    return { content, hash: hash(content) };
  } catch (error) { if (error.code === 'ENOENT') return { content: null, hash: null }; throw error; }
}

export async function writeChecked(root, relative, content, beforeHash, maxBytes = 2 * 1024 * 1024) {
  const absolute = await assertPath(root, relative);
  if (content !== null && Buffer.byteLength(content) > maxBytes) fail('BYTE_LIMIT', 'La operación supera el tamaño permitido.');
  if ((await snapshot(root, relative, maxBytes)).hash !== beforeHash) fail('FILE_CHANGED', 'Un archivo cambió después de la revisión.', 'Conserva tu edición y vuelve a revisar la preparación.');
  await mkdir(path.dirname(absolute), { recursive: true });
  await assertPath(root, relative);
  if (content === null) { if (beforeHash !== null) await unlink(absolute); return; }
  if (beforeHash === null) {
    const handle = await open(absolute, 'wx', 0o600);
    try { await handle.writeFile(content); await handle.sync(); } finally { await handle.close(); }
    return;
  }
  const temporary = `${relative}.${randomUUID()}.tmp`;
  const tempPath = await assertPath(root, temporary);
  try {
    const handle = await open(tempPath, 'wx', 0o600);
    try { await handle.writeFile(content); await handle.sync(); } finally { await handle.close(); }
    if ((await snapshot(root, relative, maxBytes)).hash !== beforeHash) fail('FILE_CHANGED', 'El archivo cambió durante la preparación.');
    await assertPath(root, relative);
    await rename(tempPath, absolute);
  } finally { await unlink(tempPath).catch(error => { if (error.code !== 'ENOENT') throw error; }); }
}

export async function withLock(root, operation) {
  await canonicalFolder(root);
  await assertPath(root, `${NAMESPACE}/write.lock`);
  await mkdir(path.join(root, NAMESPACE), { recursive: true });
  const lockPath = await assertPath(root, `${NAMESPACE}/write.lock`);
  const nonce = randomUUID();
  const lockContent = json({ pid: process.pid, nonce });
  let handle;
  try { handle = await open(lockPath, 'wx', 0o600); }
  catch (error) { if (error.code === 'EEXIST') fail('BUSY', 'Ya hay una preparación en esta carpeta.', 'Espera a que termine o revisa la recuperación si la aplicación se cerró.'); throw error; }
  try {
    await handle.writeFile(lockContent); await handle.sync();
    return await operation();
  } finally {
    await handle.close();
    const current = await snapshot(root, `${NAMESPACE}/write.lock`, 4096);
    if (current.hash === hash(lockContent)) await unlink(lockPath);
    else fail('LOCK_CHANGED', 'El registro de exclusión cambió durante la operación.', 'Conserva la preparación y revisa el bloqueo antes de continuar.');
  }
}

export async function recoverAbandonedLock(target) {
  const root = await canonicalFolder(target), relative = `${NAMESPACE}/write.lock`;
  const current = await snapshot(root, relative, 4096);
  if (!current.content) return { status: 'not-needed' };
  let value; try { value = JSON.parse(current.content); } catch { fail('LOCK_INVALID', 'El registro de la operación no es legible.'); }
  if (!value || typeof value !== 'object' || Array.isArray(value) || !Number.isInteger(value.pid)
      || value.pid < 1 || value.pid > 2147483647 || !/^[a-f0-9-]{36}$/.test(value.nonce ?? '')) fail('LOCK_INVALID', 'El registro de la operación no es válido.');
  try { process.kill(value.pid, 0); fail('BUSY', 'La operación todavía tiene un proceso activo.'); }
  catch (error) { if (error.code !== 'ESRCH') throw error; }
  await writeChecked(root, relative, null, current.hash);
  return { status: 'recovered' };
}
