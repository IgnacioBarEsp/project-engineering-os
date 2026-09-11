import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as parseYaml } from 'js-yaml';
import { productionPackages, renderNotices, packageNameFromKey, installedOnWindows } from '../scripts/notices.mjs';
import { sealNpm } from '../scripts/seal-npm.mjs';
import { extractZip } from '../runtime/archive.mjs';
import { inspectTree } from '../runtime/tree.mjs';

// Producing the artifact needs Windows, a downloaded Electron runtime and several minutes, so it is
// not a test. What is testable everywhere is the contract the packaging depends on: the declared
// contents, the notices derived from the lockfile, and the settings that decide what an installation
// owns. A regression in any of those would ship the wrong bytes or delete the person's work.
const app = fileURLToPath(new URL('../', import.meta.url));
const read = relative => readFile(path.join(app, relative), 'utf8');
const config = async () => parseYaml(await read('electron-builder.yml'));

test('the packaged file list is an allowlist and cannot be turned into a whole-tree include', async () => {
  const files = (await config()).files;
  assert.ok(Array.isArray(files) && files.length >= 6, JSON.stringify(files));
  for (const entry of files) {
    assert.equal(typeof entry, 'string', `Un patron de empaquetado no es una cadena: ${JSON.stringify(entry)}`);
    const pattern = entry.startsWith('!') ? entry.slice(1) : entry;
    assert.ok(!pattern.startsWith('/') && !pattern.includes('..') && !/^[A-Za-z]:/.test(pattern),
      `Un patron de empaquetado sale del paquete: ${entry}`);
    // A pattern that starts at the package root and recurses includes everything: tests, scripts,
    // build output and any document left in the working tree. The allowlist must name directories.
    if (!entry.startsWith('!')) {
      assert.ok(!/^\*\*/.test(pattern), `Un patron incluiria todo el arbol: ${entry}`);
      assert.ok(['package.json', 'LICENSE', 'THIRD-PARTY-NOTICES.md'].includes(pattern)
        || /^(desktop|ui|engine|context|runtime)\//.test(pattern), `Patron fuera de las carpetas declaradas: ${entry}`);
    }
  }
  for (const required of ['package.json', 'desktop/**/*', 'ui/**/*', 'engine/**/*', 'context/**/*', 'runtime/**/*', 'LICENSE']) {
    assert.ok(files.includes(required), `Falta ${required} en la lista de archivos empaquetados.`);
  }
});

test('installation is per-user, guarded, and removal keeps what the application does not own', async () => {
  const built = await config();
  assert.equal(built.asar, false, 'El codigo copiado al proyecto debe ser legible por el Node administrado.');
  const nsis = built.nsis;
  assert.equal(nsis.oneClick, false, 'Una instalacion de un clic no muestra destino ni licencia.');
  assert.equal(nsis.perMachine, false, 'La instalacion es por usuario y no debe pedir administrador.');
  assert.equal(nsis.allowElevation, false);
  assert.equal(nsis.allowToChangeInstallationDirectory, true);
  assert.equal(nsis.createDesktopShortcut, true);
  assert.equal(nsis.createStartMenuShortcut, true);
  // The local history and the managed runtimes live outside the program directory on purpose.
  assert.equal(nsis.deleteAppDataOnUninstall, false, 'Desinstalar no puede borrar los datos de la persona.');
  // Elevation is disabled, so the helper would ship unused and contradict the build-tools record.
  assert.equal(nsis.packElevateHelper, false);
  assert.equal(nsis.license, 'build/license.txt');
  assert.equal(nsis.include, 'build/installer.nsh');
  assert.equal(built.win.icon, 'build/icon.ico');
  assert.equal(built.publish, null, 'Este empaquetado no publica.');
  // Choosing another binary set would change what the build downloads without changing the record.
  assert.equal(nsis.toolsets, undefined);
  assert.equal(built.electronDownload, undefined);
});

test('the custom installer steps remove the update cache and refuse a destination with other files', async () => {
  const script = await read('build/installer.nsh');
  // Without this the packager leaves a full copy of the installer behind and the license page lies.
  assert.match(script, /!macro customUnInstall/);
  assert.match(script, /Delete "\$LOCALAPPDATA\\\$\{APP_INSTALLER_STORE_FILE\}"/);
  assert.match(script, /\$\{ifNot\} \$\{isUpdated\}/, 'Durante una actualizacion el cache pertenece al instalador nuevo.');
  // Without this the uninstaller can delete a directory the person filled with their own work.
  assert.match(script, /Function \.onVerifyInstDir/);
  assert.match(script, /FindFirst/);
  assert.match(script, /\n\s+Abort\n/);
  assert.match(script, /!ifndef BUILD_UNINSTALLER/, 'La funcion del instalador no debe compilarse en el desinstalador.');
});

test('the license shown by the installer states the data handling and the real signing status', async () => {
  const license = await read('build/license.txt');
  assert.match(license, /MIT License/);
  assert.match(license, /AVISO SOBRE TUS DATOS/);
  assert.match(license, /No tiene cuenta, telemetr[ií]a ni env[ií]o\s*\n?automático de archivos/);
  assert.match(license, /Desinstalar quita solo lo que este instalador escribió/);
  assert.match(license, /ESTADO DE FIRMA/);
  assert.match(license, /no está firmado con un certificado de editor/);
  assert.match(license, /Windows mostrará una\s*\n?advertencia/);
  // No wording may suggest disabling a protection.
  assert.ok(!/desactiva|deshabilita|omite la advertencia|ignora la advertencia/i.test(license), license.slice(-600));
});

test('third-party notices name every installed package once and do not invent nested names', async () => {
  const manifest = JSON.parse(await read('package.json'));
  const lock = JSON.parse(await read('package-lock.json'));
  const packages = productionPackages(lock);
  assert.ok(packages.length > 50, `Se detectaron ${packages.length} paquetes de produccion.`);
  assert.ok(!packages.some(entry => ['electron', 'electron-builder', 'playwright'].includes(entry.name)),
    'Los avisos incluirian una dependencia de desarrollo.');
  // A lockfile key is a path; only the last segment is the package name.
  assert.equal(packageNameFromKey('node_modules/npm/node_modules/@gar/promise-retry'), '@gar/promise-retry');
  assert.equal(packageNameFromKey('node_modules/saxes'), 'saxes');
  assert.ok(!packages.some(entry => entry.name.includes('node_modules')), 'Un aviso declara un nombre de paquete inexistente.');
  // An optional dependency for another platform is not installed here, so listing it would overstate.
  assert.equal(installedOnWindows({ os: ['darwin'], cpu: ['arm64'] }), false);
  assert.equal(installedOnWindows({ os: ['win32'], cpu: ['x64'] }), true);
  assert.equal(installedOnWindows({}), true);
  assert.ok(!packages.some(entry => /^@napi-rs\/canvas-(?!win32-x64)/.test(entry.name)),
    'Los avisos listan binarios opcionales de otras plataformas.');
  const notices = renderNotices(packages, manifest.version);
  for (const name of Object.keys(manifest.dependencies)) assert.ok(notices.includes(`| ${name} |`), `Faltan los avisos de ${name}.`);
  // The Electron runtime is most of the installed bytes and is a development dependency, so it would
  // be missing from a list derived only from production dependencies.
  assert.match(notices, /## Electron runtime/);
  assert.match(notices, /LICENSE\.electron\.txt/);
  assert.match(notices, /LICENSES\.chromium\.html/);
  assert.match(notices, /Portable tools downloaded later/);
  const unknown = renderNotices([{ name: 'sin-licencia', version: '1.0.0', license: null }], '0.0.0');
  assert.match(unknown, /\| sin-licencia \| 1\.0\.0 \| declared in the package \|/);
  // The committed notices are a disclosure, so they cannot drift from the lockfile they describe.
  assert.equal(await read('THIRD-PARTY-NOTICES.md'), notices,
    'Los avisos versionados no coinciden con el lockfile. Ejecuta npm run pack para regenerarlos.');
});

test('the application declares the identity the installer shows and the pinned core it packages', async () => {
  const manifest = JSON.parse(await read('package.json'));
  assert.equal(manifest.private, true, 'La app no se publica en el registro.');
  assert.ok(manifest.description?.length > 20, 'Sin descripcion el instalador no dice que instala.');
  assert.ok(manifest.author?.name, 'Sin autor, Agregar o quitar programas muestra un editor vacio.');
  assert.equal(manifest.main, 'desktop/main.mjs');
  assert.match(manifest.dependencies['create-project-engineering-os'], /^\d+\.\d+\.\d+$/, 'El nucleo debe estar fijado exactamente.');
  assert.match(manifest.devDependencies['electron-builder'], /^\d+\.\d+\.\d+$/, 'El empaquetador debe estar fijado exactamente.');
  assert.match(manifest.devDependencies.electron, /^\d+\.\d+\.\d+$/);
  assert.equal(manifest.scripts.pack, 'node scripts/pack-app.mjs');
  assert.equal(manifest.scripts['pack:verify'], 'node scripts/verify-app-artifact.mjs');
});

test('the binaries the packager downloads at build time stay pinned to reviewed checksums', async () => {
  // These are not in the lockfile, so the recorded identities are compared against what the pinned
  // packager will actually request. A packager bump that changes a binary fails here instead of
  // downloading different bytes silently.
  const recorded = await read('build/BUILD-TOOLS.md');
  const declared = [...recorded.matchAll(/\|\s*`([^`]+)`\s*\|\s*(\d+)\s*\|\s*`([a-f0-9]{64})`\s*\|/g)]
    .map(match => ({ file: match[1], bytes: Number(match[2]), checksum: match[3] }));
  assert.equal(declared.length, 3, `Se registraron ${declared.length} binarios de construccion.`);
  const windows = await read('node_modules/app-builder-lib/out/toolsets/windows.js');
  const sevenZip = await read('node_modules/app-builder-lib/out/toolsets/7zip.js');
  for (const entry of declared) {
    const source = entry.file.startsWith('7zip') ? sevenZip : windows;
    // Bound to the call that requests it, not merely to the constant appearing somewhere in the file:
    // that file also carries checksums for binary sets this project does not select.
    assert.ok(source.includes(`"${entry.file}", "${entry.checksum}"`) || source.includes(`"${entry.file}": "${entry.checksum}"`),
      `El checksum registrado de ${entry.file} no es el que pide el empaquetador.`);
    assert.ok(entry.bytes > 1000, `Falta el tamano registrado de ${entry.file}.`);
  }
  assert.match(recorded, /Ninguno se ejecuta con privilegios elevados y ninguno entra al\s*\n?artefacto publicado/);
  assert.match(recorded, /el artefacto no se firma/);
  // The licenses of the redistributed programs are not the license of the repository hosting them.
  assert.match(recorded, /zlib\/libpng/);
  assert.match(recorded, /LGPL-2\.1/);
});

test('the application icon is a real multi-size Windows icon', async () => {
  // Nothing else reads this file until a Windows build, and CI never runs one, so a malformed icon
  // would only surface at packaging time.
  const icon = await readFile(path.join(app, 'build/icon.ico'));
  assert.equal(icon.readUInt16LE(0), 0, 'Cabecera ICO invalida.');
  assert.equal(icon.readUInt16LE(2), 1, 'El archivo no se declara como icono.');
  const count = icon.readUInt16LE(4);
  assert.ok(count >= 4 && count <= 16, `El icono declara ${count} tamanos.`);
  const sizes = new Set();
  for (let index = 0; index < count; index++) {
    const entry = 6 + index * 16;
    const width = icon[entry] === 0 ? 256 : icon[entry];
    const height = icon[entry + 1] === 0 ? 256 : icon[entry + 1];
    assert.equal(width, height, `Una entrada del icono no es cuadrada: ${width}x${height}`);
    assert.ok(!sizes.has(width), `El icono repite el tamano ${width}.`);
    sizes.add(width);
    const bytes = icon.readUInt32LE(entry + 8), offset = icon.readUInt32LE(entry + 12);
    assert.ok(offset + bytes <= icon.length, 'Una entrada del icono apunta fuera del archivo.');
    // Each image is stored as PNG, so its signature and dimensions must agree with the entry.
    assert.deepEqual([...icon.subarray(offset, offset + 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      `La imagen de ${width} pixeles no es un PNG valido.`);
    assert.equal(icon.readUInt32BE(offset + 16), width, 'El ancho del PNG no coincide con la entrada del icono.');
    assert.equal(icon.readUInt32BE(offset + 20), height, 'El alto del PNG no coincide con la entrada del icono.');
  }
  assert.ok(sizes.has(256), 'Windows necesita la variante de 256 pixeles.');
  assert.ok(sizes.has(16) && sizes.has(32), 'Faltan los tamanos pequenos que usa la barra de tareas.');
});

test('sealing and extracting a distribution preserves the nested dependencies a packager prunes', async () => {
  // A packaged application shipped npm as a directory and the packager deduplicated its vendored
  // dependencies: 431 files where the pin expects 1970. The installed application then refused to
  // prepare tools with an integrity error, after a person had installed it.
  //
  // This exercises the real sealing and the real extractor against a tree built here, rather than
  // asserting that the packer's source still contains certain words. Replacing the packaged branch
  // with the development one, or dropping nested directories while sealing, fails this test.
  const work = await mkdtemp(path.join(tmpdir(), 'companion-seal-'));
  try {
    const source = path.join(work, 'dist');
    // The shape that gets pruned: a dependency vendored inside another dependency.
    const nested = path.join(source, 'node_modules', 'outer', 'node_modules', 'inner');
    await mkdir(nested, { recursive: true });
    await writeFile(path.join(source, 'index.js'), 'export const ok = 1;\n');
    await writeFile(path.join(source, 'node_modules', 'outer', 'package.json'), '{"name":"outer"}\n');
    await writeFile(path.join(nested, 'package.json'), '{"name":"inner"}\n');
    await writeFile(path.join(nested, 'deep.js'), 'export const deep = true;\n');

    const before = await inspectTree(await realpath(source));
    const archive = path.join(work, 'sealed.zip');
    const sealed = await sealNpm(source, archive);
    assert.equal(sealed.files, 4, 'El sellado debe llevar los cuatro archivos, incluidos los dos anidados.');

    const target = path.join(work, 'extracted');
    await extractZip(archive, target);
    const after = await inspectTree(await realpath(target));
    // The pin is the digest of the complete tree. Equal digests mean nothing was dropped, reordered
    // or rewritten on the way through the archive: exactly the property the regression violated.
    assert.equal(after.sha256, before.sha256, 'El arbol extraido no coincide con el sellado.');
    assert.equal(after.bytes, before.bytes);
    assert.equal(JSON.parse(await readFile(path.join(target, 'node_modules/outer/node_modules/inner/package.json'), 'utf8')).name,
      'inner', 'La dependencia anidada no sobrevivio al sellado.');

    // Determinism: the same tree seals to the same bytes, so a rebuild does not invent a new artifact.
    const again = path.join(work, 'sealed-again.zip');
    await sealNpm(source, again);
    assert.deepEqual(await readFile(again), await readFile(archive), 'El sellado no es reproducible.');
  } finally {
    await rm(work, { recursive: true, force: true });
  }
});

test('the sealed archive is declared as an extra resource, outside every file filter', async () => {
  // The archive only protects the distribution if it actually ships. `files` is an allowlist that a
  // packager applies; `extraResources` is copied verbatim beside the application.
  const extra = (await config()).extraResources;
  assert.ok(Array.isArray(extra) && extra.length === 1, JSON.stringify(extra));
  assert.deepEqual(extra[0], { from: 'build/npm-dist.zip', to: 'npm-dist.zip' });
  const files = (await config()).files;
  assert.ok(!files.some(entry => entry.includes('npm-dist')),
    'El archivo sellado no debe depender de la lista de archivos empaquetados.');
});
