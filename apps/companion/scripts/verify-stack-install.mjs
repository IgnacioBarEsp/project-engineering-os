import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, writeFile, rm, realpath, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { portable } from './portable-path.mjs';

// What a project actually gets installed, measured through the service of the INSTALLED artifact against three
// synthetic folders that differ only in what the person answered about technology: one that asked for it, one
// that does not know, and one where it is too early. Then one real installation, by the product's own path, and
// then the two ways of taking it back: a tree that still matches its pin is removed, and a tree that no longer
// matches is preserved with its cause.
//
// It installs for real, so it writes into folders it creates itself and into the application's own subfolder of
// them, and it reports what it measured rather than what it expected: bytes, files and elapsed time come from
// the filesystem after the fact.
//
//   node scripts/verify-stack-install.mjs "<installed resources/app>" <evidence directory>
const [installedRoot, output] = process.argv.slice(2);
assert(installedRoot && output, 'Indica el directorio resources/app instalado y un directorio de evidencia.');
await mkdir(output, { recursive: true });

const load = relative => import(pathToFileURL(path.join(installedRoot, relative)).href);
const core = await load('node_modules/create-project-engineering-os/src/index.mjs');
const { createDesktopService } = await load('desktop/service.mjs');
const { createRuntimeManager } = await load('runtime/manager.mjs');
const { createEnvironmentEngine } = await load('runtime/environment.mjs');
const { STACKS } = await load('runtime/stack-catalog.mjs');
const installedManifest = JSON.parse(await readFile(path.join(installedRoot, 'package.json'), 'utf8'));

const runtimeRoot = path.join(process.env.LOCALAPPDATA ?? tmpdir(), 'Project Engineering OS', 'runtimes');
const workspace = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-stack-')));
const record = { date: new Date().toISOString(),
  application: { version: installedManifest.version, root: portable(installedRoot) },
  machine: `${process.platform}-${process.arch}`,
  paths: [], installed: null, withdrawal: null, findings: [] };
const finding = detail => record.findings.push({ detail });

// The three answers, each in its own folder, with the same files in each so the only difference is the answer.
const answers = [
  { id: 'asked', stack: { decision: 'chosen', requested: ['typed-code'] }, expect: 'chosen' },
  { id: 'does-not-know', stack: { decision: 'unsure', requested: [] }, expect: 'recommended' },
  { id: 'too-early', stack: { decision: 'too-early', requested: [] }, expect: 'none' },
];

// The folder has a manifest and a dependency tree of its own, because "the project's own manifest SHALL NOT be
// written" cannot be measured on a folder that has none. The first version asserted that no package.json existed,
// which is true by construction of the fixture and false for every real project — an independent review installed
// on a folder that had one, proved by digest that it was intact, and this script still reported it as touched.
async function folderFor(id) {
  const root = path.join(workspace, id);
  await mkdir(path.join(root, 'node_modules', 'suyo'), { recursive: true });
  await writeFile(path.join(root, 'App.tsx'), 'export default function App(){return null}\n');
  await writeFile(path.join(root, 'notas.md'), 'Carpeta sintetica para comprobar la profundidad de instalacion.\n');
  await writeFile(path.join(root, 'package.json'), `${JSON.stringify({ name: 'proyecto-de-la-persona', version: '2.0.0', dependencies: { suyo: '1.0.0' } }, null, 2)}\n`);
  await writeFile(path.join(root, 'package-lock.json'), `${JSON.stringify({ name: 'proyecto-de-la-persona', lockfileVersion: 3 }, null, 2)}\n`);
  await writeFile(path.join(root, 'node_modules', 'suyo', 'index.js'), 'module.exports = 1;\n');
  return root;
}

const OWNED_BY_THE_PERSON = ['package.json', 'package-lock.json', 'App.tsx', 'notas.md', 'node_modules/suyo/index.js'];
async function digestsOf(root) {
  const digests = {};
  for (const relative of OWNED_BY_THE_PERSON) {
    digests[relative] = await readFile(path.join(root, relative))
      .then(content => createHash('sha256').update(content).digest('hex'), () => null);
  }
  return digests;
}

const manager = await createRuntimeManager({ root: runtimeRoot });
const environment = createEnvironmentEngine(manager);

async function serviceFor(root, id) {
  const opened = [];
  const service = await createDesktopService({ dataRoot: path.join(workspace, `${id}-data`), core, environment,
    chooseFolder: async () => root, copyText: () => {}, openExternal: value => opened.push(value) });
  return { service, opened };
}

for (const answer of answers) {
  const root = await folderFor(answer.id);
  const { service } = await serviceFor(root, answer.id);
  const project = await service.chooseFolder();
  const base = await service.previewBase({ id: project.id, selection: { name: `Proyecto ${answer.id}`,
    role: 'developer', goal: 'Comprobar que se instala lo que corresponde', profile: 'software',
    experience: 'guided', agents: ['codex'], stack: answer.stack } });
  await service.applyBase({ plan: base.id });
  const plan = await service.previewStack({ id: project.id });
  // Identity, licence, size and destination have to be on the plan before anything is written, or the screen
  // could not have shown them.
  for (const item of plan.items) {
    for (const field of ['name', 'purpose', 'packages', 'licenses', 'closure', 'downloadBytes', 'installedBytes', 'destination']) {
      if (item[field] === undefined || item[field] === null) finding(`${answer.id}: el plan de ${item.id} no trae ${field}`);
    }
    if (!item.destination.startsWith('.project-os/')) finding(`${answer.id}: ${item.id} se instalaria fuera de lo que administra la aplicacion`);
  }
  if (plan.kind !== answer.expect) finding(`${answer.id}: se esperaba ${answer.expect} y se obtuvo ${plan.kind}`);
  if (!plan.because) finding(`${answer.id}: no se dijo por que`);
  if (answer.expect === 'none' && plan.items.length) finding(`${answer.id}: se ofrecio instalar algo donde no debia`);
  const after = await service.status({ id: project.id });
  record.paths.push({ answer: answer.id, kind: plan.kind, because: plan.because,
    offered: plan.items.map(item => ({ id: item.id, licenses: item.licenses, downloadBytes: item.downloadBytes,
      installedBytes: item.installedBytes, destination: item.destination })),
    notOffered: plan.notOffered.map(item => item.id),
    installedAfterReviewing: after.stack?.installed?.map(item => item.id) ?? [],
    wroteAnything: await stat(path.join(root, '.project-os', 'stack')).then(() => true).catch(() => false) });
  if (record.paths.at(-1).wroteAnything) finding(`${answer.id}: se escribio en la carpeta con solo revisar el plan`);
}

// One real installation, by the product's own path. The folder that asked for a technology is the one that gets
// it, and everything reported here is read off the filesystem afterwards.
{
  const root = await folderFor('installs-for-real');
  const { service } = await serviceFor(root, 'installs-for-real');
  const project = await service.chooseFolder();
  const base = await service.previewBase({ id: project.id, selection: { name: 'Proyecto que pidio tecnologia',
    role: 'developer', goal: 'Instalar de verdad lo que se pidio', profile: 'software', experience: 'guided',
    agents: ['codex'], stack: { decision: 'chosen', requested: ['typed-code'] } } });
  await service.applyBase({ plan: base.id });
  const plan = await service.previewStack({ id: project.id });
  assert.equal(plan.items.length, 1, 'La carpeta que pidio una tecnologia tiene que tener una en el plan.');
  const shown = plan.items[0];
  const before = await digestsOf(root);
  const started = Date.now();
  const applied = await service.applyStack({ plan: plan.id });
  const elapsedMs = Date.now() - started;
  const result = applied.results[0];
  const entry = STACKS[result.id];
  const absolute = path.join(root, entry.relative);
  const manifest = JSON.parse(await readFile(path.join(absolute, 'package.json'), 'utf8'));
  const landed = await stat(path.join(absolute, 'node_modules', Object.keys(manifest.dependencies)[0]));
  record.installed = { id: result.id, elapsedMs, treeHash: result.treeHash, bytes: result.bytes, files: result.files,
    shownBeforeWriting: { name: shown.name, licenses: shown.licenses, closure: shown.closure,
      downloadBytes: shown.downloadBytes, installedBytes: shown.installedBytes, destination: shown.destination },
    matchesWhatWasShown: result.bytes === shown.installedBytes && result.treeHash === entry.treeHash,
    packageLanded: landed.isDirectory(),
    // Measured, not inferred from an absence: the same five files hashed before and after the installation.
    ownedByThePerson: OWNED_BY_THE_PERSON.length,
    ownedFilesChanged: Object.entries(await digestsOf(root))
      .filter(([relative, digest]) => digest !== before[relative]).map(([relative]) => relative),
    recordedInProject: applied.status.stack.installed.map(item => item.id) };
  if (!record.installed.matchesWhatWasShown) finding('lo instalado no coincide con lo que se mostro antes de instalarlo');
  if (!record.installed.packageLanded) finding('el paquete que se dijo que se instalaria no esta en la carpeta');
  if (record.installed.ownedFilesChanged.length) finding(`se modificaron archivos de la persona: ${record.installed.ownedFilesChanged.join(', ')}`);
  if (Object.values(before).some(digest => digest === null)) finding('la medicion previa del manifiesto de la persona no se pudo leer, asi que no mide nada');

  // Taking it back, both ways. A tree that still matches its pin goes; a tree that no longer matches stays, and
  // the person is told why instead of losing whatever they put in it.
  const marker = path.join(absolute, 'mio.txt');
  await writeFile(marker, 'esto lo puso la persona\n');
  const refused = await service.removeStack({ id: project.id, stack: result.id }).then(() => null, error => error);
  const survived = await readFile(marker, 'utf8').catch(() => null);
  await rm(marker);
  const removed = await service.removeStack({ id: project.id, stack: result.id });
  record.withdrawal = { refusedWhenChanged: refused?.code ?? null, preservedWhatWasNotOurs: survived !== null,
    removedWhenUnchanged: removed.removal === 'removed',
    gone: !(await stat(absolute).then(() => true).catch(() => false)),
    stillRecorded: removed.status.stack.installed.map(item => item.id) };
  if (record.withdrawal.stillRecorded.length) finding('una tecnologia retirada sigue en el registro del proyecto');
  if (!record.withdrawal.removedWhenUnchanged) finding('el retiro no informo que habia retirado el arbol');
  if (record.withdrawal.refusedWhenChanged !== 'STACK_INTEGRITY') finding('un arbol con cambios ajenos no se rechazo con su causa');
  if (!record.withdrawal.preservedWhatWasNotOurs) finding('se borro algo que esta aplicacion no habia puesto');
  if (!record.withdrawal.gone) finding('un arbol que coincidia con su pin no se retiro');
}

record.summary = {
  paths: record.paths.length,
  installedForReal: record.installed?.id ?? null,
  installedBytes: record.installed?.bytes ?? null,
  installedFiles: record.installed?.files ?? null,
  elapsedMs: record.installed?.elapsedMs ?? null,
  findings: record.findings.length,
  scope: 'Los tres caminos de instalacion contra tres carpetas sinteticas identicas salvo la respuesta, una instalacion real por el camino del producto, y el retiro en sus dos formas. Lo instalado se ancla por el digesto de su arbol; el package.json del proyecto no se toca.',
};
await writeFile(path.join(output, 'stack-install.json'), `${JSON.stringify(record, null, 2)}\n`);
console.log(JSON.stringify(record.summary, null, 2));
await rm(workspace, { recursive: true, force: true }).catch(() => {});
if (record.findings.length) { console.error(JSON.stringify(record.findings, null, 2)); process.exitCode = 1; }
