import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { access, mkdir, mkdtemp, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

// This launches an installer and its uninstaller. The NSIS per-user uninstall identity is shared by
// every Companion install, so redirecting APPDATA alone cannot make a maintainer workstation safe. It
// refuses unless GitHub Actions (a disposable Windows VM) or an explicitly designated disposable VM runs it.
const [candidateDirectory, previousDirectory, evidenceDirectory] = process.argv.slice(2);
assert(candidateDirectory && previousDirectory && evidenceDirectory,
  'Indica directorio candidato, release anterior y directorio de evidencia.');
assert.equal(process.platform, 'win32', 'La instalación de release solo se verifica en Windows.');
assert(process.env.GITHUB_ACTIONS === 'true' || process.env.PROJECT_OS_DISPOSABLE_WINDOWS === '1',
  'Este verificador se niega a tocar una estación normal; úsalo en GitHub Actions o una VM Windows desechable declarada.');

const run = promisify(execFile);
const app = fileURLToPath(new URL('../', import.meta.url));
const hash = async file => {
  const value = createHash('sha256');
  for await (const chunk of createReadStream(file)) value.update(chunk);
  return value.digest('hex');
};
const readArtifact = async directory => {
  const manifest = JSON.parse(await readFile(path.join(directory, 'artifact-manifest.json'), 'utf8'));
  assert.match(manifest.artifact, /^ProjectEngineeringOS-Setup-\d+\.\d+\.\d+-x64\.exe$/,
    'El manifiesto debe nombrar un instalador Windows, no una ruta fuera del candidato.');
  const installer = path.join(directory, manifest.artifact);
  assert.equal(manifest.platform, 'win32-x64');
  assert.equal(manifest.tree, 'clean');
  assert.equal(manifest.signed, false);
  assert.equal(await hash(installer), manifest.sha256, 'El instalador no corresponde a su manifiesto.');
  assert.equal((await readFile(path.join(directory, 'SHA256SUMS'), 'utf8')).trim(), `${manifest.sha256}  ${manifest.artifact}`);
  return { manifest, installer };
};
const inside = (root, target) => {
  const relative = path.relative(root, target);
  return relative !== '' && !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative);
};
const candidate = await readArtifact(path.resolve(candidateDirectory));
const previous = await readArtifact(path.resolve(previousDirectory));
assert.equal(previous.manifest.version, '0.1.0', 'La ruta de actualización debe partir del Companion publicado 0.1.0.');
assert.equal(candidate.manifest.version, '0.2.1', 'La ruta de actualización debe medir el candidato 0.2.1.');
assert.equal(candidate.manifest.core, '0.5.0', 'La release de la app no cambia el núcleo fijado.');

const temporaryBase = await realpath(tmpdir());
const root = await realpath(await mkdtemp(path.join(temporaryBase, 'project-os-companion-release-')));
assert(inside(temporaryBase, root), 'El directorio de prueba no quedó dentro del temporal del runner.');
const installation = path.join(root, 'installation');
const project = path.join(root, 'project');
const appData = path.join(root, 'AppData', 'Roaming');
const localAppData = path.join(root, 'AppData', 'Local');
const runtime = path.join(localAppData, 'Project Engineering OS', 'runtimes');
const history = path.join(appData, 'Project Engineering OS', 'projects', 'history-sentinel.txt');
const runtimeSentinel = path.join(runtime, 'runtime-sentinel.txt');
const projectSentinel = path.join(project, 'project-sentinel.txt');
const environment = { ...process.env, APPDATA: appData, LOCALAPPDATA: localAppData,
  TEMP: path.join(root, 'Temp'), TMP: path.join(root, 'Temp'), USERPROFILE: path.join(root, 'User') };
for (const target of [installation, project, appData, localAppData, runtime, history, runtimeSentinel,
  projectSentinel, environment.TEMP, environment.USERPROFILE]) {
  assert(inside(root, target), `Una ruta de prueba sale del root desechable: ${target}`);
}
const execute = (file, args) => run(file, args, { env: environment, windowsHide: true, shell: false, timeout: 180000, maxBuffer: 1024 * 1024 });
const installedManifest = async () => JSON.parse(await readFile(path.join(installation, 'resources', 'app', 'package.json'), 'utf8'));
const present = async file => access(file).then(() => true, () => false);

try {
  await Promise.all([mkdir(project, { recursive: true }), mkdir(path.dirname(history), { recursive: true }),
    mkdir(runtime, { recursive: true }), mkdir(environment.TEMP, { recursive: true }), mkdir(environment.USERPROFILE, { recursive: true })]);
  await Promise.all([writeFile(projectSentinel, 'proyecto de prueba\n'), writeFile(history, 'historial de prueba\n'),
    writeFile(runtimeSentinel, 'runtime de prueba\n')]);

  // Both installers write only to this disposable runner. /S exercises NSIS file placement and update
  // paths, but does not prove that a person read or clicked the wizard.
  await execute(previous.installer, ['/S', `/D=${installation}`]);
  assert.equal((await installedManifest()).version, previous.manifest.version, 'La instalación base no contiene 0.1.0.');
  await execute(candidate.installer, ['/S', `/D=${installation}`]);
  assert.equal((await installedManifest()).version, candidate.manifest.version, 'La actualización no contiene 0.2.1.');
  await access(path.join(installation, 'Project Engineering OS.exe'));
  const uninstaller = path.join(installation, 'Uninstall Project Engineering OS.exe');
  await access(uninstaller);

  // The installed window, not a development copy, runs all five profiles against a distinct user-data
  // directory. This script checks its own clean-source identity before it drives the window.
  await run(process.execPath, [path.join(app, 'scripts', 'verify-native-journeys.mjs'),
    path.join(installation, 'resources', 'app'), path.join(evidenceDirectory, 'native')],
  { env: environment, windowsHide: true, shell: false, timeout: 20 * 60 * 1000, maxBuffer: 8 * 1024 * 1024 });

  await execute(uninstaller, ['/S']);
  assert.equal(await present(installation), false, 'El desinstalador dejó el directorio del programa.');
  for (const sentinel of [projectSentinel, history, runtimeSentinel]) {
    assert.equal(await present(sentinel), true, `El desinstalador eliminó un dato que no posee: ${path.basename(sentinel)}.`);
  }
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(path.join(evidenceDirectory, 'installer-cycle.json'), JSON.stringify({
    status: 'PASS', mode: 'automatización silenciosa en Windows desechable', previous: previous.manifest,
    candidate: candidate.manifest, update: { from: previous.manifest.version, to: candidate.manifest.version },
    preserved: ['project-sentinel.txt', 'history-sentinel.txt', 'runtime-sentinel.txt'],
    removed: ['installation'], humanObservation: 'No se afirma que una persona leyó o hizo clic en el asistente de NSIS.',
  }, null, 2) + '\n');
  console.log(JSON.stringify({ status: 'PASS', updated: `${previous.manifest.version} -> ${candidate.manifest.version}`, nativeJourneys: 5 }, null, 2));
} finally {
  // `root` originates in mkdtemp and was resolved/checked against the runner temp before any recursive
  // removal. It cannot name a project or an existing Companion install.
  if (inside(temporaryBase, root)) await rm(root, { recursive: true, force: true });
}
