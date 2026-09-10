import { closeSync, existsSync, fstatSync, lstatSync, openSync, readSync, realpathSync } from 'node:fs';
import path from 'node:path';

export const PINNED_OPENSPEC_VERSION = '1.6.0';
const CONFIG = '.project-constructor/config.json';
const PACKAGE_ENTRIES = Object.freeze({
  '@fission-ai/openspec': 'bin/openspec.js',
  'create-project-engineering-os': 'bin/project-os.mjs',
});

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  error.remediation = 'Revisa toolchainRoot y restaura la instalación local exacta; no uses una CLI global.';
  throw error;
}
function inside(root, candidate) {
  const back = path.relative(root, candidate);
  return back === '' || (!path.isAbsolute(back) && back !== '..' && !back.startsWith(`..${path.sep}`));
}
function localPath(root, relative) {
  const absolute = path.resolve(root, ...relative.split('/'));
  if (!inside(root, absolute)) fail('TOOLCHAIN_PATH_UNSAFE', 'La ruta de herramientas sale de su ubicación local.');
  let cursor = root;
  for (const segment of relative.split('/')) {
    cursor = path.join(cursor, segment);
    try {
      if (lstatSync(cursor).isSymbolicLink() && !inside(root, realpathSync(cursor))) {
        fail('TOOLCHAIN_PATH_UNSAFE', 'Un enlace de herramientas apunta fuera de la ubicación local.');
      }
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return absolute;
}
function readJson(root, relative, maxBytes = 16 * 1024 * 1024) {
  const absolute = localPath(root, relative);
  let fd;
  try { fd = openSync(absolute, 'r'); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.size > maxBytes) fail('TOOLCHAIN_METADATA_INVALID', `${relative} debe ser JSON regular de hasta ${maxBytes} bytes.`);
    const data = Buffer.alloc(stat.size + 1); let count = 0;
    while (count < data.length) {
      const read = readSync(fd, data, count, data.length - count, count);
      if (!read) break;
      count += read;
    }
    if (count > stat.size) fail('TOOLCHAIN_METADATA_INVALID', `${relative} cambió durante la lectura; vuelve a verificarlo.`);
    let value;
    try { value = JSON.parse(data.subarray(0, count).toString('utf8')); }
    catch { fail('TOOLCHAIN_METADATA_INVALID', `${relative} no contiene JSON válido.`); }
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail('TOOLCHAIN_METADATA_INVALID', `${relative} debe contener un objeto.`);
    return value;
  } finally { closeSync(fd); }
}

export function validateToolchainRoot(value) {
  if (typeof value !== 'string' || value.length > 2048 || value.length === 0
    || /[\\:\x00-\x1f\x7f\u2028\u2029]/.test(value)
    || value.split('/').some(segment => !segment || segment === '.' || segment === '..'
      || ['.git', '.project-constructor'].includes(segment.toLowerCase()) || /[. ]$/.test(segment))) {
    fail('TOOLCHAIN_LOCATION_INVALID', 'toolchainRoot debe ser una subcarpeta relativa normalizada, fuera de metadatos reservados.');
  }
  return value;
}

export function resolveLocalToolchain(projectRoot) {
  // Canonicalize the known project root, preserving common /var aliases and explicit project aliases.
  const root = realpathSync(projectRoot);
  const config = readJson(root, CONFIG, 64 * 1024);
  const declared = config && Object.hasOwn(config, 'toolchainRoot');
  const relative = declared ? validateToolchainRoot(config.toolchainRoot) : '.';
  let directory = root;
  if (declared) {
    for (const segment of relative.split('/')) {
      directory = path.join(directory, segment);
      try {
        const stat = lstatSync(directory);
        if (stat.isSymbolicLink() || !stat.isDirectory()) fail('TOOLCHAIN_LOCATION_INVALID', 'La ubicación de herramientas debe ser una carpeta local sin enlaces.');
      } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
  }
  return { projectRoot: root, directory, relative, isolated: Boolean(declared), configuration: config };
}

export function inspectLocalToolchain(location) {
  return {
    manifest: readJson(location.directory, 'package.json'),
    lockfile: readJson(location.directory, 'package-lock.json'),
  };
}

export function readProjectManifest(projectRoot) {
  return readJson(realpathSync(projectRoot), 'package.json');
}

export function inspectLocalPackage(location, packageName, expectedVersion) {
  const entry = PACKAGE_ENTRIES[packageName];
  if (!entry) fail('TOOLCHAIN_PACKAGE_INVALID', 'La herramienta no pertenece al contrato local permitido.');
  const { manifest, lockfile } = inspectLocalToolchain(location);
  const relative = `node_modules/${packageName}`;
  const installed = readJson(location.directory, `${relative}/package.json`);
  const binary = localPath(location.directory, `${relative}/${entry}`);
  const declared = manifest?.devDependencies?.[packageName] ?? manifest?.dependencies?.[packageName] ?? null;
  const locked = lockfile?.packages?.[relative]?.version ?? lockfile?.dependencies?.[packageName]?.version ?? null;
  const reasons = [];
  if (declared !== expectedVersion) reasons.push(`manifest=${declared ?? '<missing>'}`);
  if (locked !== expectedVersion) reasons.push(`lockfile=${locked ?? '<missing>'}`);
  if (installed?.name !== packageName || installed?.version !== expectedVersion) reasons.push(`installed=${installed?.name ?? '<missing>'}@${installed?.version ?? '<missing>'}`);
  const entryPresent = existsSync(binary) && lstatSync(realpathSync(binary)).isFile();
  if (!entryPresent) reasons.push('expected package entry missing');
  return { ok: reasons.length === 0, reasons, declared, locked, installed, binary, entryPresent, location: location.relative, manifest, lockfile };
}

export function resolvePinnedOpenSpec(projectRoot) {
  const location = resolveLocalToolchain(projectRoot);
  const inspected = inspectLocalPackage(location, '@fission-ai/openspec', PINNED_OPENSPEC_VERSION);
  if (!inspected.ok) fail('TOOLCHAIN_OPENSPEC_INVALID', `OpenSpec ${PINNED_OPENSPEC_VERSION} no está verificado en ${location.relative}: ${inspected.reasons.join('; ')}.`);
  return inspected.binary;
}
