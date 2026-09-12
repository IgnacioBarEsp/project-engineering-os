import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { portable } from './portable-path.mjs';

const exec = promisify(execFile);

// Checks what the installed application does when it is asked to open a project in a local editor: which
// applications it recognises, whose signature and publisher it verifies, which it refuses and why, and —
// with `--launch` — whether a verified one really receives the folder.
//
// Opening an editor puts a window on someone's screen, so launching is opt-in. Without the flag this
// verifies recognition and every refusal path, which is most of what can go wrong, and launches nothing.
// With the flag it opens **one** application against a synthetic folder created for the purpose, and never
// closes anything: a window that was already open may hold work nobody asked this script to risk.
//
//   node scripts/verify-local-launches.mjs "<installed resources/app>" <evidence directory> [--launch <agent>]
const [installedRoot, output, ...flags] = process.argv.slice(2);
assert(installedRoot && output, 'Indica el directorio resources/app instalado y un directorio de evidencia.');
const launchIndex = flags.indexOf('--launch');
const launchAgent = launchIndex === -1 ? null : flags[launchIndex + 1];
assert(launchIndex === -1 || launchAgent, 'Con --launch indica qué aplicación abrir.');
await mkdir(output, { recursive: true });

const { createLocalAppLauncher } = await import(pathToFileURL(path.join(installedRoot, 'desktop', 'local-apps.mjs')).href);
const installedManifest = JSON.parse(await readFile(path.join(installedRoot, 'package.json'), 'utf8'));
// The same module from this working tree, used only to tell two very different answers apart: an
// application that is not on the machine, and an application the *installed artifact* does not know about
// because it predates the change that added it. Reporting both as "not installed" would hide a real gap.
const { createLocalAppLauncher: createSourceLauncher } = await import('../desktop/local-apps.mjs');

// The real launcher, against whatever is really installed. Nothing is injected.
const launcher = createLocalAppLauncher({});
const sourceLauncher = createSourceLauncher({});
const AGENTS = ['codex', 'cursor', 'github-copilot', 'antigravity'];

const workspace = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-launch-')));
const project = path.join(workspace, 'carpeta sintetica & literal');
await mkdir(project);
await writeFile(path.join(project, 'notas.txt'), 'Carpeta sintética creada solo para comprobar la apertura local.\n');

const record = { date: new Date().toISOString(),
  application: { version: installedManifest.version, root: portable(installedRoot) },
  machine: `${process.platform}-${process.arch}`,
  // A folder name with a space and an ampersand: if the path were ever passed through a shell, this is
  // where it would break, and the launcher promises it is handed over literally.
  syntheticFolder: portable(project),
  launched: launchAgent ?? 'ninguna (usa --launch <agente> para abrir una)',
  applications: [], findings: [] };
const finding = (agent, detail) => { record.findings.push({ agent, detail }); };

for (const agent of AGENTS) {
  const found = await launcher.detect(agent).catch(error => ({ error: error.code ?? error.message }));
  if (found?.error) { finding(agent, `detect falló con ${found.error}`); continue; }
  if (found === null) {
    const inSource = await sourceLauncher.detect(agent).catch(() => null);
    const known = inSource !== null;
    record.applications.push({ agent, installed: false, presentOnThisMachine: known,
      offeredByInstalledArtifact: !known,
      note: known
        ? 'La aplicación está en este equipo y el árbol de trabajo la reconoce; el artefacto instalado es anterior a ese cambio. Hace falta construir e instalar un artefacto nuevo para comprobarlo aquí.'
        : 'No está instalada en este equipo.' });
    if (known) finding(agent, 'el artefacto instalado no ofrece esta IA todavía: la reconoce el código, no la versión instalada');
    continue;
  }
  if (found.unverified) {
    record.applications.push({ agent, label: found.label, installed: true, verified: false,
      code: found.code,
      // A refusal from the filesystem carries the path it failed on, and this record is versioned.
      message: portable(found.message ?? '') });
    // A refusal has to carry a code a person can act on, not just fail.
    if (!found.code) finding(agent, 'una aplicación rechazada no informó ningún código');
    continue;
  }
  record.applications.push({ agent, label: found.label, installed: true, verified: true,
    publisher: found.files?.[0]?.publisher ?? null,
    executable: portable(found.files?.[0]?.executable ?? '') });

  // The refusal paths, on a real verified application, without opening anything: a recorded identity that
  // no longer matches the bytes on disk must be refused rather than launched.
  const tampered = { ...found, files: found.files.map((file, index) => index === 0
    ? { ...file, sha256: file.sha256.replace(/^./, file.sha256[0] === 'a' ? 'b' : 'a') } : file) };
  await assert.rejects(launcher.open(tampered, project), error => error.code === 'APP_CHANGED',
    `${agent}: una identidad registrada que ya no coincide debe rechazarse con APP_CHANGED.`);
  record.applications.at(-1).refusesChangedIdentity = true;

  if (agent !== launchAgent) continue;
  // The one launch, against the synthetic folder only.
  const before = await running(found.label);
  const opened = await launcher.open(found, project);
  assert.equal(opened.opened, 'local');
  assert.equal(opened.projectAttached, true);
  // Opening a folder is not evidence that an assistant read it, and the result must not pretend otherwise.
  assert.equal(opened.agentReadProject, false, 'Abrir una carpeta no puede declarar que la IA la leyó.');
  assert.equal(opened.agentActivated, false);
  await new Promise(resolve => setTimeout(resolve, 6000));
  const after = await running(found.label);
  record.applications.at(-1).launch = { application: opened.label ?? found.label,
    processesBefore: before, processesAfter: after, appeared: after > before,
    projectAttached: opened.projectAttached, agentReadProject: opened.agentReadProject };
  if (after <= before) finding(agent, `se pidió abrir ${found.label} y no apareció ningún proceso nuevo`);
}

// Counting windows of an application by its executable name, which is all that is needed to tell whether
// asking it to open a folder actually started something.
async function running(label) {
  const names = { Cursor: 'Cursor.exe', 'Visual Studio Code': 'Code.exe', Codex: 'Codex.exe', Antigravity: 'Antigravity.exe' };
  const image = names[label];
  if (!image) return null;
  const { stdout } = await exec('tasklist', ['/FI', `IMAGENAME eq ${image}`, '/NH'], { windowsHide: true })
    .catch(() => ({ stdout: '' }));
  return stdout.split(/\r?\n/).filter(line => line.toLowerCase().includes(image.toLowerCase())).length;
}

record.summary = {
  installed: record.applications.filter(entry => entry.installed).length,
  verified: record.applications.filter(entry => entry.verified).length,
  refused: record.applications.filter(entry => entry.installed && !entry.verified).length,
  findings: record.findings.length,
  scope: 'Reconocimiento, verificación de firma y editor, y las rutas de rechazo sobre las aplicaciones realmente instaladas. Una sola apertura, contra una carpeta sintética, cuando se pide con --launch. Abrir una carpeta no demuestra que la IA la haya leído, y el registro lo dice.',
};
await writeFile(path.join(output, 'local-launches.json'), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify({ ...record.summary, applications: record.applications.map(entry =>
  `${entry.agent}:${entry.installed ? (entry.verified ? 'verificada' : entry.code) : 'no instalada'}`) }, null, 2));
if (record.findings.length) { console.error(JSON.stringify(record.findings, null, 2)); process.exitCode = 1; }
// A folder an editor is now showing must not be deleted under it, so a run that launched keeps its
// fixture and says where it is. Nothing else is left behind.
if (record.applications.some(entry => entry.launch)) {
  console.log(`carpeta sintética conservada porque una aplicación la tiene abierta: ${project}`);
} else await rm(workspace, { recursive: true, force: true }).catch(() => {});
