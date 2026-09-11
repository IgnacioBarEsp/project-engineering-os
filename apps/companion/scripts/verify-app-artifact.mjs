import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, readdir, stat, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

// Reads what the packager actually produced and refuses anything that was not meant to ship.
// It walks the complete installed tree, not only the application package: roughly half the bytes a
// person installs are the Electron runtime, and a check that never looks at them cannot claim the
// artifact contains only what was intended.
const app = fileURLToPath(new URL('../', import.meta.url));
if (!process.argv[2]) {
  throw new Error('Indica el directorio de salida que imprimió npm run pack. No hay valor por defecto: uno antiguo verificaría un artefacto distinto del recién construido.');
}
const output = path.resolve(process.argv[2]);
const manifest = JSON.parse(await readFile(path.join(app, 'package.json'), 'utf8'));

// Directory prefixes end with a separator so a sibling like `runtime-extra/` cannot pass as `runtime/`;
// plain names match exactly so `LICENSE.exe` cannot pass as `LICENSE`.
const APP_FILES = ['package.json', 'LICENSE', 'THIRD-PARTY-NOTICES.md'];
const APP_DIRECTORIES = ['desktop/', 'ui/', 'engine/', 'context/', 'runtime/', 'node_modules/'];
const RUNTIME_FILES = ['Project Engineering OS.exe', 'Uninstall Project Engineering OS.exe',
  'LICENSE.electron.txt', 'LICENSES.chromium.html', 'chrome_100_percent.pak', 'chrome_200_percent.pak',
  'icudtl.dat', 'resources.pak', 'snapshot_blob.bin', 'v8_context_snapshot.bin', 'vk_swiftshader_icd.json', 'version'];
const RUNTIME_EXTENSIONS = new Set(['.dll', '.bin', '.pak', '.dat', '.json', '.html', '.txt', '.exe']);
const REQUIRED_RUNTIME = ['LICENSE.electron.txt', 'LICENSES.chromium.html', 'Project Engineering OS.exe'];
const FORBIDDEN_PACKAGES = ['electron', 'electron-builder', 'playwright', 'app-builder-lib', 'dmg-builder', 'js-yaml'];
// Applied to every packaged path, dependencies included: a transitive package shipping a fixture
// credential, a document or a repository must not reach a published artifact unnoticed.
const FORBIDDEN_NAMES = [/\.docx$/i, /\.pdf$/i, /\.map$/i, /(^|\/)\.npmrc$/i, /(^|\/)\.env/i, /(^|\/)\.git(\/|$)/,
  /\.pem$/i, /\.p12$/i, /\.pfx$/i, /\.key$/i, /(^|\/)elevate\.exe$/i];
// `dist/`, `scripts/`, `build/` and `test/` are ordinary inside published packages; only the
// application's own copies of them would mean development material reached the artifact.
const FORBIDDEN_APP_NAMES = [/(^|\/)scripts\//, /(^|\/)build\//, /(^|\/)dist\//, /(^|\/)qa\//,
  /(^|\/)openspec\//, /(^|\/)evidence\//];

async function walk(root, relative = '', files = []) {
  for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
    const next = relative ? `${relative}/${entry.name}` : entry.name;
    const info = await lstat(path.join(root, next));
    assert.ok(!info.isSymbolicLink(), `El artefacto contiene un vínculo: ${next}`);
    if (entry.isDirectory()) await walk(root, next, files);
    else {
      assert.ok(info.isFile(), `El artefacto contiene una entrada que no es un archivo regular: ${next}`);
      files.push({ path: next, bytes: info.size });
    }
  }
  return files;
}

async function digest(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}

const record = JSON.parse(await readFile(path.join(output, 'artifact-manifest.json'), 'utf8'));
const installer = path.join(output, record.artifact);
assert.equal(record.version, manifest.version, 'El manifiesto no corresponde a la versión de la app.');
assert.equal(record.platform, 'win32-x64');
assert.equal(record.tree, 'clean', 'Un artefacto construido desde un árbol sucio no tiene identidad publicable.');
assert.match(record.commit, /^[a-f0-9]{40}$/);
assert.equal(record.signed, false, 'Este flujo no firma; un manifiesto que lo declare no es verificable aquí.');
assert.ok(/^[a-f0-9]{64}$/.test(record.sha256));
assert.equal(await digest(installer), record.sha256, 'El checksum publicado no corresponde al instalador.');
assert.equal((await stat(installer)).size, record.bytes);
const sums = await readFile(path.join(output, 'SHA256SUMS'), 'utf8');
assert.equal(sums.trim(), `${record.sha256}  ${record.artifact}`);

// The signing claim is read from the artifact, not from the manifest that asserts it. A Windows
// installer can be produced from another platform, and a verdict that silently skipped this check
// there would present the weakest result as the strongest, so it is named instead.
let observedSignature = 'not-inspected';
if (process.platform === 'win32') {
  const powershell = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  const probe = await promisify(execFile)(powershell, ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command',
    '(Get-AuthenticodeSignature -LiteralPath $env:COMPANION_ARTIFACT).Status'],
    { env: { ...process.env, COMPANION_ARTIFACT: installer }, windowsHide: true, shell: false, timeout: 60000, maxBuffer: 65536 });
  observedSignature = probe.stdout.trim();
  assert.equal(observedSignature, 'NotSigned', 'El artefacto declara no estar firmado; Windows informa otra cosa.');
}

const installed = path.join(output, 'win-unpacked');
const everything = await walk(installed);
const prefix = 'resources/app/';
const packaged = everything.filter(file => file.path.startsWith(prefix)).map(file => ({ ...file, path: file.path.slice(prefix.length) }));
const runtime = everything.filter(file => !file.path.startsWith(prefix));
assert.ok(packaged.length > 100, `Se empaquetaron muy pocos archivos de la aplicación: ${packaged.length}`);

const unexpectedApp = packaged.filter(file => !APP_FILES.includes(file.path) && !APP_DIRECTORIES.some(dir => file.path.startsWith(dir)));
assert.deepEqual(unexpectedApp, [], `Rutas no permitidas en la aplicación empaquetada: ${unexpectedApp.slice(0, 10).map(f => f.path).join(', ')}`);
const unexpectedRuntime = runtime.filter(file => {
  if (RUNTIME_FILES.includes(file.path)) return false;
  if (file.path.startsWith('locales/') && file.path.endsWith('.pak')) return false;
  if (file.path.includes('/')) return true;
  return !RUNTIME_EXTENSIONS.has(path.extname(file.path).toLowerCase());
});
assert.deepEqual(unexpectedRuntime, [], `Rutas inesperadas fuera de la aplicación: ${unexpectedRuntime.slice(0, 10).map(f => f.path).join(', ')}`);
for (const required of REQUIRED_RUNTIME) {
  assert.ok(runtime.some(file => file.path === required), `Falta un archivo obligatorio del runtime: ${required}`);
}

const forbidden = everything.filter(file => FORBIDDEN_NAMES.some(rule => rule.test(file.path)));
assert.deepEqual(forbidden, [], `Contenido que no debe publicarse: ${forbidden.slice(0, 10).map(f => f.path).join(', ')}`);
const forbiddenOwn = packaged.filter(file => !file.path.startsWith('node_modules/') && FORBIDDEN_APP_NAMES.some(rule => rule.test(file.path)));
assert.deepEqual(forbiddenOwn, [], `Herramientas propias de construcción en el artefacto: ${forbiddenOwn.slice(0, 10).map(f => f.path).join(', ')}`);

const appRoot = path.join(installed, 'resources', 'app');
for (const name of FORBIDDEN_PACKAGES) {
  const present = await stat(path.join(appRoot, 'node_modules', name)).catch(() => null);
  assert.equal(present, null, `El artefacto incluye una dependencia de desarrollo: ${name}`);
}
const packagedManifest = JSON.parse(await readFile(path.join(appRoot, 'package.json'), 'utf8'));
assert.equal(packagedManifest.main, manifest.main);
assert.equal(packagedManifest.dependencies['create-project-engineering-os'], manifest.dependencies['create-project-engineering-os'],
  'El núcleo empaquetado no es la versión fijada.');
const core = JSON.parse(await readFile(path.join(appRoot, 'node_modules/create-project-engineering-os/package.json'), 'utf8'));
assert.equal(core.version, manifest.dependencies['create-project-engineering-os'], 'La copia del núcleo no coincide con el pin.');
assert.equal(record.core, core.version, 'El manifiesto declara un núcleo distinto del empaquetado.');

for (const required of ['LICENSE', 'THIRD-PARTY-NOTICES.md', 'runtime/notices/README.md', 'runtime/notices/CodeGraph-LICENSE',
  'runtime/toolchain/toolchain-lock.json', 'runtime/toolchain/package.json', 'runtime/toolchain/artifact-sizes.json',
  'desktop/main.mjs', 'ui/index.html', 'context/parser-worker.mjs', 'runtime/agent-entry.mjs']) {
  assert.ok(packaged.some(file => file.path === required), `Falta un archivo obligatorio en el artefacto: ${required}`);
}

// The notices describe what a person installs, so they are checked against the dependencies actually
// present in the artifact rather than against the lockfile that produced them.
const notices = await readFile(path.join(appRoot, 'THIRD-PARTY-NOTICES.md'), 'utf8');
for (const name of Object.keys(manifest.dependencies)) assert.ok(notices.includes(`| ${name} |`), `Los avisos no listan ${name}.`);
async function installedPackages(directory, scope = '', found = new Map()) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!scope && entry.name.startsWith('@')) { await installedPackages(path.join(directory, entry.name), `${entry.name}/`, found); continue; }
    const own = path.join(directory, entry.name);
    const meta = await readFile(path.join(own, 'package.json'), 'utf8').catch(() => null);
    // Keyed by name and version so a dependency present at two versions counts as two, matching the
    // way the notices enumerate them.
    if (meta) { try { const own = JSON.parse(meta); if (own.version) found.set(`${scope}${entry.name}@${own.version}`, `${scope}${entry.name}`); } catch { /* not a package manifest */ } }
    const nested = path.join(own, 'node_modules');
    if (await stat(nested).catch(() => null)) await installedPackages(nested, '', found);
  }
  return found;
}
const present = await installedPackages(path.join(appRoot, 'node_modules'));
const undocumented = [...new Set(present.values())].filter(name => !notices.includes(`| ${name} |`));
assert.deepEqual(undocumented, [], `Paquetes instalados sin aviso de licencia: ${undocumented.slice(0, 10).join(', ')}`);
assert.equal(record.packages, present.size, `El manifiesto declara ${record.packages} paquetes y el artefacto contiene ${present.size}.`);
assert.match(notices, /LICENSE\.electron\.txt/, 'Los avisos no mencionan la licencia del runtime que sí se instala.');

const result = {
  status: process.platform === 'win32' ? 'PASS' : 'PASS-PARCIAL',
  artifact: record.artifact, bytes: record.bytes, sha256: record.sha256, commit: record.commit, tree: record.tree,
  packagedFiles: packaged.length, packagedBytes: packaged.reduce((total, file) => total + file.bytes, 0),
  installedFiles: everything.length, installedBytes: everything.reduce((total, file) => total + file.bytes, 0),
  dependencies: present.size, core: record.core, signed: record.signed, observedSignature,
  scope: process.platform === 'win32'
    ? 'Contenido completo, identidad, checksum y firma real del artefacto producido. No demuestra instalación ni compatibilidad en otro equipo.'
    : 'Contenido completo, identidad y checksum. La firma no se pudo leer fuera de Windows, así que este veredicto es parcial.',
};
console.log(JSON.stringify(result, null, 2));
