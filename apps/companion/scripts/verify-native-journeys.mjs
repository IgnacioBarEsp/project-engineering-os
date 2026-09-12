import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, writeFile, readFile, readdir, stat, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { portable } from './portable-path.mjs';
import { pdf, docx } from './fixtures.mjs';

// Runs the five profiles through the INSTALLED application's own window: the packaged interface, driven
// over its debugging port, against real folders on this machine.
//
// Two boundaries are stated here because they decide what this record does and does not prove.
//
// The operating system's folder picker cannot be answered from here, and that was established by
// measurement rather than assumed — it exposes no editable name field and no confirming button, synthetic
// keystrokes need a foreground a background process may not take, and the application will not abandon
// the step half-done. The shell resisting a background process choosing files for a person is a security
// property, not an obstacle to route around. So the application's own engine performs exactly the two steps
// that cannot be reached without answering that dialog — choosing the folder and applying the base, which
// is when a project first enters the history — and **everything this record claims about the interface is
// done in the window**. Choosing a folder remains a human step, and the record says so.
//
// The application runs against its own isolated data directory, so a run never touches the projects or
// history of whoever is using this machine.
//
// The window must be running the application of the branch under review, or the record describes a
// different application than the one being reviewed — which is how the previous change ended up publishing
// a measurement taken against an artifact older than the one it delivered. The package ships `asar: false`,
// so every source file is plain on disk: the digest of each one under `desktop/`, `ui/`, `engine/`,
// `context/` and `runtime/` is compared against the branch before anything is driven, the comparison is
// recorded, and a mismatch stops the run unless --sync-app is passed, which copies the branch's bytes in and
// records what they replaced. `package.json` is excluded because the packager rewrites it by design.
//
// Interface alone is not enough, and the first run here proved it: a new interface module against the
// previous main process is refused by its asset allowlist, and the window renders nothing.
//
// Syncing does not rebuild the installer. A release still comes from `npm run pack` on a clean commit.
//
//   node scripts/verify-native-journeys.mjs "<installed resources/app>" <evidence directory> [--keep] [--sync-app]
const [installedRoot, output, ...flags] = process.argv.slice(2);
assert(installedRoot && output, 'Indica el directorio resources/app instalado y un directorio de evidencia.');
const keep = flags.includes('--keep');
await mkdir(output, { recursive: true });


const PROFILES = {
  // The profiles the product defines as documents and as creative work carry the formats it names. A
  // fixture holding only the extensions the verifier can read would narrow the check to itself.
  research: { name: 'Revisión de evidencia', role: 'researcher', profile: 'research',
    goal: 'Comparar cómo se midió el resultado en cada fuente', query: 'instrumento',
    files: { 'notas.txt': 'El protocolo exige registrar el instrumento antes de comparar resultados.\n',
      'metodo.md': '# Método\n\nLa medición usa un instrumento calibrado cada semana.\n' },
    binaryFiles: { 'articulo.pdf': () => pdf(['El grupo de control incluye treinta participantes.',
      'La medición se repitió con el mismo instrumento calibrado cada semana.']) } },
  software: { name: 'Servicio de presupuesto', role: 'developer', profile: 'software',
    goal: 'Entender cómo se calcula el presupuesto antes de cambiarlo', query: 'presupuesto',
    symbol: 'calculateProjectBudget',
    files: { 'README.md': '# Servicio\n\nEl cálculo de presupuesto multiplica horas por tarifa.\n',
      'src/budget.js': 'export function calculateProjectBudget(hours, rate) {\n  return hours * rate;\n}\n' } },
  unity: { name: 'Prototipo de juego', role: 'developer', profile: 'unity',
    goal: 'Localizar cómo se calcula el puntaje antes de ajustarlo', query: 'puntaje',
    symbol: 'ComputeScore',
    files: { 'ProjectSettings/ProjectVersion.txt': 'm_EditorVersion: 6000.0.0f1\n',
      'notas.txt': 'El puntaje se calcula duplicando la evidencia recogida en la escena.\n' } },
  media: { name: 'Serie de imágenes', role: 'creator', profile: 'media',
    goal: 'Conservar la receta que produjo cada pieza', query: 'semilla',
    files: { 'notas.txt': 'La receta conserva la semilla 42 para poder repetir la pieza.\n',
      'workflow.json': '{"prompt":"Una ilustración original de un taller","seed":42}\n' },
    binaryFiles: { 'ficha.docx': () => docx(['La ficha de la serie fija la semilla 42 para repetir la pieza.',
      'Cada entrega conserva su receta junto al archivo final.']) } },
  general: { name: 'Trabajo de la semana', role: 'general', profile: 'general',
    goal: 'Encontrar los acuerdos tomados sin releer todo', query: 'acuerdo',
    files: { 'acuerdos.md': '# Acuerdos\n\nSe acordó publicar el resumen antes del viernes.\n',
      'notas.txt': 'Pendiente: confirmar el responsable de cada acuerdo.\n' } },
};

const digest = async file => createHash('sha256').update(await readFile(file)).digest('hex');
async function hashesOf(root, relatives) {
  const out = {};
  for (const relative of relatives) out[relative] = await digest(path.join(root, relative));
  return out;
}

// Every source file of this branch, against the ones the installed window will actually load.
//
// Scope, stated rather than implied, because an independent review walked through three ways past the
// earlier version: a module added at the installed app root, `package.json` rewritten to point `main` at
// it, and the pinned core modified inside `node_modules`. All three now fail the guard.
//
//   - every file under the five source directories, on both sides, compared by SHA-256;
//   - the top-level entries of the installed application, against a closed list;
//   - `package.json`'s `main`, `version` and `dependencies`, which is what decides which process starts and
//     which core it loads. The rest of that file is excluded because the packager rewrites it by design;
//   - the whole tree digest of the pinned core inside `node_modules`, which the application actually runs.
//
// Every digest is recorded, matching or not: the requirement this change adds says the evidence has to name
// the interface it measured, and a record that only lists mismatches names nothing when nothing mismatched.
const SOURCE_DIRECTORIES = ['desktop', 'ui', 'engine', 'context', 'runtime'];
const ROOT_ENTRIES = ['LICENSE', 'THIRD-PARTY-NOTICES.md', 'context', 'desktop', 'engine', 'node_modules',
  'package.json', 'runtime', 'ui'];
const PINNED_CORE = 'node_modules/create-project-engineering-os';
const branchRoot = fileURLToPath(new URL('../', import.meta.url));
const syncApp = flags.includes('--sync-app');
async function filesUnder(root, directories) {
  const found = [];
  for (const directory of directories) {
    const walk = async relative => {
      for (const entry of await readdir(path.join(root, relative), { withFileTypes: true }).then(v => v, () => [])) {
        const next = `${relative}/${entry.name}`;
        if (entry.isDirectory()) await walk(next); else found.push(next);
      }
    };
    await walk(directory);
  }
  return found.sort();
}
// A single tree digest over the pinned core refuses a correct installation: the packager prunes files it
// never needs, and the first run of this guard failed on `CHANGELOG.md`, `README.md` and a nested
// `package-lock.json` with the code byte-identical and the version the same on both sides. Comparing the
// whole tree as one hash cannot tell "the packager dropped a changelog" from "someone edited the core",
// which are the two things that matter most to keep apart. So the comparison is per file, and each of the
// three outcomes gets its own verdict: a file that differs on both sides is refused, a file the branch has
// and the installation lacks is refused unless it is in the declared prune list, and a file only the
// installation has is refused outright, because that is the injection vector.
const PACKAGER_PRUNES = [/^.*\/CHANGELOG\.md$/, /^.*\/README\.md$/, /^.*\/package-lock\.json$/];
async function compareTree(relative) {
  const ours = await filesUnder(branchRoot, [relative]);
  const theirs = new Set(await filesUnder(installedRoot, [relative]));
  const differing = [], missing = [], pruned = [], byIdentityFields = [];
  for (const file of ours) {
    if (!theirs.has(file)) {
      (PACKAGER_PRUNES.some(pattern => pattern.test(file)) ? pruned : missing).push(file);
      continue;
    }
    // `removePackageScripts` and `removePackageKeywords` are on in the packager config, and they rewrite
    // every nested manifest, not only the application's own. So a manifest is compared by the fields that
    // decide what runs — name, version, type, main, exports, bin, files, dependencies — and everything else
    // by its bytes. Comparing the whole manifest would refuse a correct installation for a missing keyword
    // list, which trains a reader to ignore the guard.
    if (path.basename(file) === 'package.json') {
      const ours = manifestIdentity(JSON.parse(await readFile(path.join(branchRoot, file), 'utf8')));
      const theirs = await readFile(path.join(installedRoot, file), 'utf8')
        .then(value => manifestIdentity(JSON.parse(value)), () => null);
      if (JSON.stringify(ours) !== JSON.stringify(theirs)) differing.push(file);
      byIdentityFields.push(file);
      continue;
    }
    const ourDigest = await digest(path.join(branchRoot, file));
    const theirDigest = await digest(path.join(installedRoot, file)).then(value => value, () => null);
    if (ourDigest !== theirDigest) differing.push(file);
  }
  return { compared: ours.length, differing, missing, pruned, byIdentityFields,
    onlyInstalled: [...theirs].filter(file => !ours.includes(file)) };
}
function manifestIdentity(value) {
  return { name: value.name ?? null, version: value.version ?? null, type: value.type ?? null,
    main: value.main ?? null, exports: value.exports ?? null, bin: value.bin ?? null,
    files: value.files ?? null, dependencies: value.dependencies ?? null };
}

const branchFiles = await filesUnder(branchRoot, SOURCE_DIRECTORIES);
const installedFiles = await filesUnder(installedRoot, SOURCE_DIRECTORIES);
const identity = { directories: SOURCE_DIRECTORIES,
  comparedBeyondSources: ['top-level entries', 'package.json main/version/dependencies', PINNED_CORE],
  notCompared: ['the rest of package.json, which the packager rewrites', 'node_modules other than the pinned core',
    'the documentation the packager prunes from the pinned core, listed per run under pinnedCore.pruned'],
  branchCommit: null, branchTreeClean: null, files: {},
  onlyInstalled: installedFiles.filter(file => !branchFiles.includes(file)), synchronised: [], mismatched: [] };
for (const file of branchFiles) {
  const branch = await digest(path.join(branchRoot, file));
  const target = path.join(installedRoot, file);
  const before = await digest(target).then(value => value, () => null);
  if (before !== branch && syncApp) {
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(path.join(branchRoot, file), target);
    identity.synchronised.push({ file, replaced: before, installed: branch });
  }
  const installed = await digest(target).then(value => value, () => null);
  identity.files[file] = { branch, installed };
  if (installed !== branch) identity.mismatched.push(file);
}
identity.compared = branchFiles.length;
identity.matched = branchFiles.length - identity.mismatched.length;

// Anything at the installed root that this branch does not know about could be the module `main` points at.
const rootEntries = (await readdir(installedRoot, { withFileTypes: true }).then(v => v, () => []))
  .map(entry => entry.name).sort();
identity.rootEntries = rootEntries;
identity.unexpectedRootEntries = rootEntries.filter(name => !ROOT_ENTRIES.includes(name));

const branchManifest = JSON.parse(await readFile(path.join(branchRoot, 'package.json'), 'utf8'));
const installedManifestRaw = JSON.parse(await readFile(path.join(installedRoot, 'package.json'), 'utf8'));
identity.manifest = { branch: manifestIdentity(branchManifest), installed: manifestIdentity(installedManifestRaw) };
identity.manifestMatches = JSON.stringify(identity.manifest.branch) === JSON.stringify(identity.manifest.installed);

identity.pinnedCore = await compareTree(PINNED_CORE);
identity.pinnedCoreMatches = identity.pinnedCore.differing.length === 0
  && identity.pinnedCore.missing.length === 0 && identity.pinnedCore.onlyInstalled.length === 0;

const commit = await new Promise(resolve => {
  const child = spawn('git', ['-C', branchRoot, 'rev-parse', 'HEAD'], { windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
  let out = ''; child.stdout.on('data', chunk => { out += chunk; });
  child.on('close', () => resolve(out.trim() || null)); child.on('error', () => resolve(null));
});
const dirty = await new Promise(resolve => {
  const child = spawn('git', ['-C', branchRoot, 'status', '--porcelain'], { windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
  let out = ''; child.stdout.on('data', chunk => { out += chunk; });
  child.on('close', () => resolve(out.trim())); child.on('error', () => resolve(null));
});
identity.branchCommit = commit;
identity.branchTreeClean = dirty === '' ? true : dirty === null ? null : false;

assert.equal(identity.mismatched.length, 0, `La ventana instalada no corre la aplicación de esta rama (${identity.mismatched.join(', ')}). Ejecuta con --sync-app para copiarla y volver a medir.`);
assert.equal(identity.onlyInstalled.length, 0, `El árbol instalado tiene archivos que esta rama no tiene (${identity.onlyInstalled.join(', ')}).`);
assert.equal(identity.unexpectedRootEntries.length, 0, `El árbol instalado tiene entradas de raíz inesperadas (${identity.unexpectedRootEntries.join(', ')}).`);
assert.ok(identity.manifestMatches, `El package.json instalado declara otro main, otra versión u otras dependencias: ${JSON.stringify(identity.manifest)}`);
assert.deepEqual(identity.pinnedCore.differing, [], `El núcleo fijado instalado tiene archivos distintos de los de esta rama.`);
assert.deepEqual(identity.pinnedCore.missing, [], `Al núcleo fijado instalado le faltan archivos que esta rama sí tiene y que el empaquetador no poda.`);
assert.deepEqual(identity.pinnedCore.onlyInstalled, [], `El núcleo fijado instalado tiene archivos que esta rama no tiene.`);


// Imported only after the guard: with --sync-app the driver would otherwise keep measuring through the
// pre-sync modules while the window runs the post-sync bytes.
const load = relative => import(pathToFileURL(path.join(installedRoot, relative)).href);
const core = await load('node_modules/create-project-engineering-os/src/index.mjs');
const { createDesktopService } = await load('desktop/service.mjs');
const installedManifest = installedManifestRaw;
const executable = path.join(installedRoot, '..', '..', `${installedManifest.productName ?? 'Project Engineering OS'}.exe`);

const workspace = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-native-')));
const userData = path.join(workspace, 'userdata');
const record = { date: new Date().toISOString(),
  application: { version: installedManifest.version, root: portable(installedRoot) },
  installedApplication: identity,
  machine: `${process.platform}-${process.arch}`,
  drivenBy: 'the installed application window over its debugging port, against an isolated data directory',
  humanSteps: ['choosing the folder in the operating system picker'],
  doneByTheEngineNotTheInterface: ['choosing the folder', 'applying the base preparation'],
  notADemonstrationOf: ["the installer's own wizard pages", 'anything a person judged by reading it'],
  profiles: [], findings: [], unverified: [] };
const finding = (profile, stage, detail) => { record.findings.push({ profile, stage, detail }); };
// The change's own rule: a native step that cannot be completed stays unverified with its cause, and is
// never replaced by a silent success. That is a different thing from the product misbehaving, so it is
// recorded in a different place and never quietly folded into the findings.
const unverified = (profile, stage, cause) => { record.unverified.push({ profile, stage, cause }); };

// Build the folders, then hand each one to the application's own engine.
//
// A project reaches the history only once base preparation begins — the engine remembers the folder for
// crash recovery at that moment, not when it is chosen. So the engine performs exactly two steps, the two
// that cannot be reached without answering the operating system's picker: choosing the folder and applying
// the base. Everything the record claims about the interface happens afterwards, in the window.
const prepared = {};
for (const [id, definition] of Object.entries(PROFILES)) {
  const root = path.join(workspace, id);
  for (const [relative, content] of Object.entries(definition.files)) {
    await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
    await writeFile(path.join(root, relative), content);
  }
  for (const [relative, make] of Object.entries(definition.binaryFiles ?? {})) {
    await writeFile(path.join(root, relative), make());
  }
  const before = await hashesOf(root, [...Object.keys(definition.files), ...Object.keys(definition.binaryFiles ?? {})]);
  const service = await createDesktopService({ dataRoot: path.join(userData, 'projects'), core,
    chooseFolder: async () => root, copyText: () => {}, openExternal: () => {} });
  const project = await service.chooseFolder();
  const base = await service.previewBase({ id: project.id, selection: { name: definition.name,
    role: definition.role, goal: definition.goal, profile: definition.profile,
    experience: 'guided', agents: ['web'] } });
  await service.applyBase({ plan: base.id });
  prepared[id] = { root, id: project.id, before };
}

const port = 9400 + (process.pid % 100);
const app = spawn(executable, [`--user-data-dir=${userData}`, `--remote-debugging-port=${port}`],
  { detached: true, stdio: 'ignore', windowsHide: true });
app.unref();

const { chromium } = await import('playwright');
let browser;
try {
  // The window needs a moment before the protocol answers; retry rather than guess a sleep.
  for (let attempt = 0; attempt < 30 && !browser; attempt += 1) {
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`).catch(() => null);
    if (!browser) await new Promise(resolve => setTimeout(resolve, 1000));
  }
  assert.ok(browser, `La aplicación instalada no respondió en el puerto ${port}.`);
  const page = browser.contexts()[0].pages()[0] ?? await browser.contexts()[0].waitForEvent('page');
  await page.waitForLoadState('domcontentloaded');
  page.setDefaultTimeout(180000);
  // Every control is disabled while an operation runs, so a click that arrives early fails on a disabled
  // element rather than on a missing one, and a stall has to be recorded as a finding rather than end the
  // run with a timeout that explains neither.
  //
  // Two different questions, and conflating them cost a spurious finding. `notBusy` asks whether the
  // application is busy right now, and is what a click needs before it lands. `settle` asks whether the
  // operation a click just started has finished — and that one has to wait for the busy indicator to
  // APPEAR first: an operation takes a moment to start, so asking only "is it hidden" answers yes about
  // the instant before the work began and returns while the screen is still the previous one.
  const stop = page.getByRole('button', { name: /^Detener$/ });
  const notBusy = (timeout = 180000) => stop.waitFor({ state: 'hidden', timeout }).then(() => true, () => false);
  const settle = async (timeout = 180000) => {
    await stop.waitFor({ state: 'visible', timeout: 4000 }).catch(() => {});
    return notBusy(timeout);
  };

  for (const [id, definition] of Object.entries(PROFILES)) {
    const started = performance.now();
    const steps = [];
    const step = (name, result) => { steps.push({ name, result }); return result; };
    const body = () => page.locator('body').innerText();

    await page.getByRole('button', { name: /Tus proyectos/ }).click();
    await page.getByRole('button', { name: /^Abrir/ }).first().waitFor();
    const listed = await page.locator('button:visible').allTextContents();
    step('open history', { entries: listed.filter(text => /^Abrir/.test(text)).length });

    // Open this profile's own card, matched on the name the engine registered, so a run cannot silently
    // walk the same project five times.
    const card = page.locator('article.project').filter({ has: page.getByRole('heading', { name: definition.name }) });
    assert.equal(await card.count(), 1, `El historial no muestra exactamente una tarjeta de "${definition.name}".`);
    await card.getByRole('button', { name: 'Abrir →' }).click();
    // Waiting for a heading with this name would pass without navigating: the history card carries the
    // same heading. Wait for the list itself to go, and for the application to stop being busy — opening
    // a project verifies its stages, and for a software profile that includes the managed tools.
    await page.locator('article.project').first().waitFor({ state: 'detached', timeout: 120000 });
    await page.getByRole('button', { name: /^Detener$/ }).waitFor({ state: 'hidden', timeout: 180000 })
      .catch(() => finding(id, 'open', 'la aplicación siguió ocupada tres minutos después de abrir el proyecto'));
    step('opened from history', { project: definition.name, heading: await page.locator('h1,h2').first().innerText() });

    // Context preparation, reviewed and then applied, in the interface.
    const reviewContext = page.getByRole('button', { name: /^Leer mis archivos$/ }).first();
    if (await reviewContext.count()) {
      await reviewContext.click();
      await page.waitForTimeout(1500);
      const save = page.getByRole('button', { name: /Guardar y continuar|Revisar con estas exclusiones/ }).first();
      if (await save.count()) {
        await save.click();
        if (!await settle()) finding(id, 'context', 'la aplicación siguió ocupada tres minutos después de guardar el contexto');
      } else finding(id, 'context', `la interfaz no ofreció guardar el contexto. Botones: ${(await page.locator('button:visible').allTextContents()).join(' | ')}`);
      step('context prepared in the interface', { screen: (await body()).slice(0, 100) });
    } else finding(id, 'context', `la interfaz no ofreció preparar el contexto. Botones visibles: ${(await page.locator('button:visible').allTextContents()).join(' | ')}`);

    // Context and a search whose answer is known in advance.
    const sources = page.getByRole('button', { name: /Buscar en mis archivos/ });
    await sources.first().waitFor({ timeout: 180000 }).catch(() => {});
    if (await sources.count()) {
      if (!await notBusy()) finding(id, 'search', 'la aplicación siguió ocupada al ir a buscar en los archivos');
      await sources.first().click();
      await page.waitForTimeout(1200);
      const field = page.locator('input[type="search"], input[type="text"]:visible').last();
      await field.fill(definition.query);
      await field.press('Enter');
      await page.waitForTimeout(2500);
      const text = await body();
      // A citation is path plus a position inside it; a hit without one cannot be checked.
      const citation = text.match(/([\w.\-/]+\.(?:txt|md|json|js|pdf|docx))\s*·\s*(línea|página|párrafo)\s*(\d+)/);
      // A string shaped like a citation is not a citation, and how far it can be resolved depends on what
      // kind of locator it is. A line number can be resolved exactly, against that line of that file. A
      // page or a paragraph points inside a PDF or a Word document, whose bytes carry no line structure:
      // resolving it against `split(newline)[n-1]` would be checking an arbitrary offset of a binary read
      // as text and calling it verified. For those, what can honestly be checked is that the cited file
      // exists and that the passage the interface displayed contains what was searched for — and the
      // record says which of the two kinds of resolution each citation got.
      let resolution = null;
      if (citation) {
        const [whole, cited, kind, position] = citation;
        const absolute = path.join(prepared[id].root, cited);
        const exists = await stat(absolute).then(() => true, () => false);
        const passage = text.slice(text.indexOf(whole) + whole.length, text.indexOf(whole) + whole.length + 400);
        if (!exists) {
          finding(id, 'search', `la cita ${whole} nombra un archivo que no existe`);
          resolution = { citation: whole, kind, resolvedBy: 'nothing', ok: false };
        } else if (kind === 'línea') {
          const source = await readFile(absolute, 'utf8').catch(() => null);
          const target = source?.split(/\r?\n/)[Number(position) - 1] ?? null;
          const ok = target !== null && target.toLowerCase().includes(definition.query.toLowerCase());
          if (!ok) finding(id, 'search', `la cita ${whole} no resuelve a una línea que contenga "${definition.query}"`);
          resolution = { citation: whole, kind, resolvedBy: 'exact-line', ok };
        } else {
          const ok = passage.toLowerCase().includes(definition.query.toLowerCase());
          if (!ok) finding(id, 'search', `el pasaje citado en ${whole} no contiene "${definition.query}"`);
          // Stated, not hidden: this is weaker than resolving a line, and the record carries the kind.
          resolution = { citation: whole, kind, resolvedBy: 'file-exists-and-passage-contains-query', ok };
        }
      } else finding(id, 'search', `la búsqueda de "${definition.query}" no devolvió una cita comprobable`);
      step('search with citation', { query: definition.query, ...resolution ?? { citation: null } });
    } else finding(id, 'context', `la interfaz no ofreció buscar en los archivos. Botones visibles: ${(await page.locator('button:visible').allTextContents()).join(' | ')}`);

    // The scenario this change added requires engineering, official OpenSpec workflows and the code map to
    // be verified for software and Unity. They are driven here, in the window, and a profile that cannot
    // reach a stage records why rather than skipping quietly.
    if (['software', 'unity'].includes(id)) {
      const stages = {};
      const press = async (pattern, wait = 120000) => {
        const control = page.getByRole('button', { name: pattern }).first();
        if (!await control.count()) return false;
        await notBusy(wait);
        if (!await control.count()) return false;
        await control.click();
        await page.getByRole('button', { name: /^Detener$/ }).waitFor({ state: 'hidden', timeout: wait }).catch(() => {});
        await page.waitForTimeout(800);
        return true;
      };
      // The stages are on the project's status tab; the search left the sources tab open, so a run that
      // never navigates back would report every stage as absent and blame the product for it.
      const status = page.getByRole('button', { name: /^Estado$/ });
      if (await status.count()) { await status.first().click(); await page.waitForTimeout(1500); }
      else finding(id, 'engineering', 'la interfaz no ofreció la pestaña de estado del proyecto');
      stages.visibleControls = await page.locator('button:visible').allTextContents();
      // The interface does not offer one fixed sequence: each stage changes which control appears next, so
      // a hard-coded chain reports "not offered" for stages that simply had not been reached yet. This
      // presses whichever known stage control is on screen, repeatedly, and records the order the interface
      // actually led through — which is also the honest thing to publish.
      const STAGES = [
        ['reviewEngineering', /Revisar desarrollo/], // was /Revisar ingeniería/],
        ['prepareTools', /Preparar herramientas y continuar/],
        // Same stage names as the archived record so the two are comparable; only the labels moved.
        ['applyEnvironment', /Guardar estas instrucciones|Continuar lo que quedó a medias/],
        ['applyEngineering', /Guardar y continuar|Guardar y ver mi proyecto/],
        ['activateWorkflows', /Activar y continuar/],
        ['reviewCodeMap', /Revisar mapa de código/],
        ['buildCodeMap', /Crear mapa de código/],
      ];
      // A stage control can come back — applying the environment brings the activation step forward again —
      // so skipping anything already walked strands the journey with that button still on screen. Repeats
      // are allowed and the order is recorded; the guard is a cap plus a stop when the same control keeps
      // appearing, which means the interface is not advancing rather than that there is more to do.
      // A stage that repeats is usually the application refusing a plan that went stale while another
      // stage ran — it says "vuelve a revisar los cambios antes de aplicarlos", which is correct. Pressing
      // the same control again just gets the same refusal, so a repeated stage is set aside for a round and
      // the walk continues with the review steps, which is what a person would do.
      const walked = [], resting = new Set();
      for (let step = 0; step < 20; step += 1) {
        let advanced = null;
        for (const [name, pattern] of STAGES) {
          if (resting.has(name)) continue;
          if (!await press(pattern, 900000)) continue;
          walked.push(name); advanced = name; break;
        }
        if (!advanced) { if (resting.size) { resting.clear(); continue; } break; }
        const tail = walked.slice(-2);
        if (tail.length === 2 && tail.every(name => name === advanced)) { resting.add(advanced); }
        const stuck = walked.slice(-4);
        if (stuck.length === 4 && stuck.every(name => name === advanced)) {
          // Reading the screen before concluding. A control that stays put while the page explains why is
          // the product declining for a reason; the same control with nothing said is a stall. Treating
          // both as the same unknown is what made the reopen check report correct behaviour as a finding.
          const said = (await body()).replace(/\s+/g, ' ');
          const reason = said.match(/[^.]*(no está|necesita|requiere|revisa|falta|cambió|pendiente)[^.]*\./i)?.[0]?.trim() ?? null;
          unverified(id, advanced, reason
            ? `el control siguió en pantalla y la interfaz explicó: "${reason.slice(0, 200)}"`
            : 'el control siguió en pantalla tras accionarlo tres veces y la interfaz no explicó nada');
          break;
        }
      }
      stages.walked = walked;
      stages.visibleControls = await page.locator('button:visible').allTextContents();
      for (const [name] of STAGES) {
        if (!walked.includes(name)) {
          unverified(id, name, `no se alcanzó. Recorrido: ${walked.join(' > ')}. Controles finales: ${stages.visibleControls.join(' | ')}`);
        }
      }

      const symbols = page.getByRole('button', { name: /Buscar símbolos/ });
      if (await symbols.count()) {
        await symbols.first().click();
        await page.waitForTimeout(1500);
        const field = page.locator('input[type="search"], input[type="text"]:visible').last();
        await field.fill(definition.symbol ?? '');
        await field.press('Enter');
        await page.waitForTimeout(2500);
        const shown = await page.locator('body').innerText();
        stages.foundSymbol = definition.symbol ? shown.includes(definition.symbol) : null;
        if (definition.symbol && !stages.foundSymbol) {
          finding(id, 'code map', `el mapa de código no devolvió el símbolo ${definition.symbol}`);
        }
      } else unverified(id, 'searchSymbols', 'no se llegó al mapa de código, así que la búsqueda de símbolos no se pudo intentar');

      step('engineering, OpenSpec and code map', stages);
    }

    // The scenario requires source preservation after **closing and reopening**. Leaving the project open
    // and asserting the same screen would prove nothing, so the project view is closed back to the history
    // and opened again, and the citation has to survive the round trip.
    await page.getByRole('button', { name: /Tus proyectos/ }).click();
    await page.locator('article.project').first().waitFor({ timeout: 60000 });
    const reopened = page.locator('article.project').filter({ has: page.getByRole('heading', { name: definition.name }) });
    await reopened.getByRole('button', { name: 'Abrir →' }).click();
    await page.locator('article.project').first().waitFor({ state: 'detached', timeout: 120000 });
    await page.getByRole('button', { name: /^Detener$/ }).waitFor({ state: 'hidden', timeout: 180000 }).catch(() => {});
    const afterReopen = page.getByRole('button', { name: /Buscar en mis archivos/ });
    await afterReopen.first().waitFor({ timeout: 180000 }).catch(() => {});
    let survived = null;
    if (await afterReopen.count()) {
      if (!await notBusy()) finding(id, 'reopen', 'la aplicación siguió ocupada tras reabrir el proyecto');
      await afterReopen.first().click();
      await page.waitForTimeout(1200);
      const field = page.locator('input[type="search"], input[type="text"]:visible').last();
      await field.fill(definition.query);
      await field.press('Enter');
      await page.waitForTimeout(2500);
      const screen = await body();
      survived = /·\s*(línea|página|párrafo)\s*\d+/.test(screen);
      if (!survived) {
        // No citation is not automatically a defect. Preparing engineering installs tools and writes files
        // into the folder, and a context that noticed its sources changed *should* refuse to cite until it
        // is regenerated. Refusing honestly and losing the index look identical from a missing citation, so
        // the screen is read: a stated stale or review-needed state is correct behaviour and is recorded as
        // such; silence with no explanation is the finding.
        const explained = /desactualizad|actualiza el contexto|revisar de nuevo|volver a preparar|cambi[oó]|Leer mis archivos|vigente|revisa (la carpeta|sus instrucciones)/i.test(screen);
        if (explained) {
          step('context refused after reopen, with reason', { explained: true });
        } else {
          finding(id, 'reopen', `tras cerrar y reabrir no hubo cita ni explicación. Pantalla: ${screen.replace(/\s+/g, ' ').slice(0, 300)}`);
        }
      }
    } else finding(id, 'reopen', 'tras reabrir, la interfaz no ofreció buscar en los archivos');
    step('closed and reopened', { citationSurvived: survived });

    // Reflow at the widths the desktop window can reach.
    for (const width of [1180, 900, 600]) {
      await page.setViewportSize({ width, height: 820 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      if (overflow) finding(id, 'reflow', `desbordamiento horizontal a ${width}px`);
    }
    await page.setViewportSize({ width: 1180, height: 900 });
    step('reflow', { widths: [1180, 900, 600] });

    // The person's own files must be untouched by everything above.
    const after = await hashesOf(prepared[id].root, Object.keys(prepared[id].before));
    const changed = Object.keys(after).filter(relative => after[relative] !== prepared[id].before[relative]);
    if (changed.length) finding(id, 'preservation', `la aplicación modificó archivos de la persona: ${changed.join(', ')}`);
    step('original files preserved', { files: Object.keys(after).length, changed });

    record.profiles.push({ profile: id, name: definition.name, steps,
      elapsedMs: Math.round(performance.now() - started) });
    console.log(`${id}: ${steps.length} pasos, ${record.findings.filter(f => f.profile === id).length} hallazgos`);
  }

  // The window shows absolute paths, which carry the account name of whoever ran this. Every text record
  // here is anchored through portable(), but no check reads an image, so a screenshot is the one place that
  // discipline silently does not apply — and an image is exactly what gets looked at. So the anchoring is
  // done in the page before each capture, on EVERY path element rather than the first one: the project list
  // shows five of them, and anchoring one of five is the same failure with a smaller radius.
  const anchor = async () => page.evaluate(({ raw, anchored }) => {
    const forms = [raw, raw.replace(/\//g, '\\')];
    const nodes = [...document.querySelectorAll('.path')];
    let replaced = 0;
    for (const node of nodes) {
      const before = node.textContent;
      for (const form of forms) {
        while (node.textContent.toLowerCase().includes(form.toLowerCase())) {
          const at = node.textContent.toLowerCase().indexOf(form.toLowerCase());
          node.textContent = node.textContent.slice(0, at) + anchored + node.textContent.slice(at + form.length);
        }
      }
      if (node.textContent !== before) replaced += 1;
    }
    // What matters is the state after: no element may still carry a drive letter or a users directory.
    const leaking = nodes.filter(node => /^[a-z]:[\\/]/i.test(node.textContent.trim())
      || /users[\\/]/i.test(node.textContent)).map(node => node.textContent.trim());
    return { nodes: nodes.length, replaced, leaking };
  }, { raw: workspace, anchored: portable(workspace) });

  const captures = [];
  const capture = async (name, before) => {
    if (before) { await before(); await page.waitForTimeout(900); }
    const anchored = await anchor();
    // The property is the state after anchoring, not how many elements were rewritten: a screen that shows
    // no path at all is a screen with nothing to leak, and reporting that as a finding would be the same
    // mistake as concluding a defect from an absence.
    if (anchored.leaking.length) finding('general', 'captura', `la captura ${name} habría mostrado una ruta sin anclar: ${anchored.leaking.join(' | ')}`);
    await page.screenshot({ path: path.join(output, `${name}.png`) });
    captures.push({ file: `${name}.png`, pathElements: anchored.nodes, anchored: anchored.replaced, leaking: anchored.leaking.length });
  };
  await capture('native-window');
  await capture('native-inicio', () => page.getByRole('button', { name: 'Inicio', exact: true }).click());
  await capture('native-proyectos', () => page.getByRole('button', { name: 'Tus proyectos', exact: true }).click());
  await capture('native-ayuda', () => page.getByRole('button', { name: 'Ayuda', exact: true }).click());
  // The four destinations, read off the installed window rather than asserted from the source.
  record.navigation = await page.evaluate(() => [...document.querySelectorAll('nav [data-action]')]
    .map(node => [node.dataset.action, node.textContent.replace(/\s+/g, ' ').trim()]));
  if (record.navigation.length !== 4) finding('general', 'navegacion', `la ventana no muestra cuatro destinos: ${JSON.stringify(record.navigation)}`);
  record.screenshots = captures;
  record.screenshotPathAnchored = captures.every(entry => entry.leaking === 0);
} finally {
  await browser?.close().catch(() => {});
  // Electron's children keep the data directory open, so end the whole tree rather than the wrapper.
  await new Promise(resolve => {
    const kill = spawn('taskkill', ['/PID', String(app.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    kill.on('close', resolve); kill.on('error', resolve);
  });
  await new Promise(resolve => setTimeout(resolve, 3000));
}

record.summary = { profiles: record.profiles.length, findings: record.findings.length,
  unverified: record.unverified.length,
  scope: 'Cada perfil abierto y recorrido en la ventana de la aplicación instalada. El motor de la propia aplicación hizo dos pasos, elegir carpeta y aplicar la base, porque no se llega a ellos sin responder el selector del sistema. Contexto, búsqueda con cita, reflujo y conservación de archivos se comprobaron en la interfaz. No demuestra el asistente del instalador.' };
await writeFile(path.join(output, 'native-journeys.json'), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record.summary, null, 2));
if (record.unverified.length) console.error(`SIN VERIFICAR:
${JSON.stringify(record.unverified, null, 2)}`);
if (record.findings.length) { console.error(JSON.stringify(record.findings, null, 2)); process.exitCode = 1; }
if (keep) console.log('espacio de trabajo conservado en', workspace);
else {
  // A directory the operating system still holds is not a failed run: the record is already written.
  const left = await rm(workspace, { recursive: true, force: true }).then(() => null, error => error.code);
  if (left) console.log(`el sistema retiene el espacio de trabajo (${left}); queda en ${portable(workspace)}`);
}
