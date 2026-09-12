import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, writeFile, readFile, readdir, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { portable } from './portable-path.mjs';

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
//   node scripts/verify-native-journeys.mjs "<installed resources/app>" <evidence directory> [--keep]
const [installedRoot, output, ...flags] = process.argv.slice(2);
assert(installedRoot && output, 'Indica el directorio resources/app instalado y un directorio de evidencia.');
const keep = flags.includes('--keep');
await mkdir(output, { recursive: true });

const load = relative => import(pathToFileURL(path.join(installedRoot, relative)).href);
const core = await load('node_modules/create-project-engineering-os/src/index.mjs');
const { createDesktopService } = await load('desktop/service.mjs');
const installedManifest = JSON.parse(await readFile(path.join(installedRoot, 'package.json'), 'utf8'));
const executable = path.join(installedRoot, '..', '..', `${installedManifest.productName ?? 'Project Engineering OS'}.exe`);

const PROFILES = {
  research: { name: 'Revisión de evidencia', role: 'researcher', profile: 'research',
    goal: 'Comparar cómo se midió el resultado en cada fuente', query: 'instrumento',
    files: { 'notas.txt': 'El protocolo exige registrar el instrumento antes de comparar resultados.\n',
      'metodo.md': '# Método\n\nLa medición usa un instrumento calibrado cada semana.\n' } },
  software: { name: 'Servicio de presupuesto', role: 'developer', profile: 'software',
    goal: 'Entender cómo se calcula el presupuesto antes de cambiarlo', query: 'presupuesto',
    files: { 'README.md': '# Servicio\n\nEl cálculo de presupuesto multiplica horas por tarifa.\n',
      'src/budget.js': 'export function calculateProjectBudget(hours, rate) {\n  return hours * rate;\n}\n' } },
  unity: { name: 'Prototipo de juego', role: 'developer', profile: 'unity',
    goal: 'Localizar cómo se calcula el puntaje antes de ajustarlo', query: 'puntaje',
    files: { 'ProjectSettings/ProjectVersion.txt': 'm_EditorVersion: 6000.0.0f1\n',
      'notas.txt': 'El puntaje se calcula duplicando la evidencia recogida en la escena.\n' } },
  media: { name: 'Serie de imágenes', role: 'creator', profile: 'media',
    goal: 'Conservar la receta que produjo cada pieza', query: 'semilla',
    files: { 'notas.txt': 'La receta conserva la semilla 42 para poder repetir la pieza.\n',
      'workflow.json': '{"prompt":"Una ilustración original de un taller","seed":42}\n' } },
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

const workspace = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-native-')));
const userData = path.join(workspace, 'userdata');
const record = { date: new Date().toISOString(),
  application: { version: installedManifest.version, root: portable(installedRoot) },
  machine: `${process.platform}-${process.arch}`,
  drivenBy: 'the installed application window over its debugging port, against an isolated data directory',
  humanSteps: ['choosing the folder in the operating system picker'],
  doneByTheEngineNotTheInterface: ['choosing the folder', 'applying the base preparation'],
  notADemonstrationOf: ["the installer's own wizard pages", 'anything a person judged by reading it'],
  profiles: [], findings: [] };
const finding = (profile, stage, detail) => { record.findings.push({ profile, stage, detail }); };

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
  const before = await hashesOf(root, Object.keys(definition.files));
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
    const reviewContext = page.getByRole('button', { name: /^Preparar contexto$|Preparar solo el contexto/ }).first();
    if (await reviewContext.count()) {
      await reviewContext.click();
      await page.waitForTimeout(1500);
      const save = page.getByRole('button', { name: /Guardar contexto y continuar|Revisar con estas exclusiones/ }).first();
      if (await save.count()) {
        await save.click();
        await page.getByRole('button', { name: /^Detener$/ }).waitFor({ state: 'hidden', timeout: 120000 }).catch(() => {});
      } else finding(id, 'context', `la interfaz no ofreció guardar el contexto. Botones: ${(await page.locator('button:visible').allTextContents()).join(' | ')}`);
      step('context prepared in the interface', { screen: (await body()).slice(0, 100) });
    } else finding(id, 'context', `la interfaz no ofreció preparar el contexto. Botones visibles: ${(await page.locator('button:visible').allTextContents()).join(' | ')}`);

    // Context and a search whose answer is known in advance.
    const sources = page.getByRole('button', { name: /Buscar fuentes/ });
    if (await sources.count()) {
      await sources.first().click();
      await page.waitForTimeout(1200);
      const field = page.locator('input[type="search"], input[type="text"]:visible').last();
      await field.fill(definition.query);
      await field.press('Enter');
      await page.waitForTimeout(2500);
      const text = await body();
      // A citation is path plus a position inside it; a hit without one cannot be checked.
      const citation = text.match(/([\w.\-/]+\.(?:txt|md|json|js))\s*·\s*(línea|página|párrafo)\s*(\d+)/);
      // A string shaped like a citation is not a citation. Resolve it against the file on disk and require
      // that the line it names actually contains what was searched for, so a plausible-looking pointer to
      // the wrong place is a finding rather than a pass.
      let resolves = null;
      if (citation) {
        const [, cited, , line] = citation;
        const source = await readFile(path.join(prepared[id].root, cited), 'utf8').catch(() => null);
        const target = source?.split(/\r?\n/)[Number(line) - 1] ?? null;
        resolves = target !== null && target.toLowerCase().includes(definition.query.toLowerCase());
        if (!resolves) finding(id, 'search', `la cita ${citation[0]} no resuelve a una línea que contenga "${definition.query}"`);
      } else finding(id, 'search', `la búsqueda de "${definition.query}" no devolvió una cita comprobable`);
      step('search with citation', { query: definition.query, citation: citation?.[0] ?? null, resolvesOnDisk: resolves });
    } else finding(id, 'context', `la interfaz no ofreció buscar fuentes. Botones visibles: ${(await page.locator('button:visible').allTextContents()).join(' | ')}`);

    // Reflow at the widths the desktop window can reach.
    for (const width of [1180, 900, 600]) {
      await page.setViewportSize({ width, height: 820 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      if (overflow) finding(id, 'reflow', `desbordamiento horizontal a ${width}px`);
    }
    await page.setViewportSize({ width: 1180, height: 900 });
    step('reflow', { widths: [1180, 900, 600] });

    // The person's own files must be untouched by everything above.
    const after = await hashesOf(prepared[id].root, Object.keys(definition.files));
    const changed = Object.keys(after).filter(relative => after[relative] !== prepared[id].before[relative]);
    if (changed.length) finding(id, 'preservation', `la aplicación modificó archivos de la persona: ${changed.join(', ')}`);
    step('original files preserved', { files: Object.keys(after).length, changed });

    record.profiles.push({ profile: id, name: definition.name, steps,
      elapsedMs: Math.round(performance.now() - started) });
    console.log(`${id}: ${steps.length} pasos, ${record.findings.filter(f => f.profile === id).length} hallazgos`);
  }

  await page.screenshot({ path: path.join(output, 'native-window.png') });
  record.screenshots = ['native-window.png'];
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
  scope: 'Cada perfil abierto y recorrido en la ventana de la aplicación instalada. El motor de la propia aplicación hizo dos pasos, elegir carpeta y aplicar la base, porque no se llega a ellos sin responder el selector del sistema. Contexto, búsqueda con cita, reflujo y conservación de archivos se comprobaron en la interfaz. No demuestra el asistente del instalador.' };
await writeFile(path.join(output, 'native-journeys.json'), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record.summary, null, 2));
if (record.findings.length) { console.error(JSON.stringify(record.findings, null, 2)); process.exitCode = 1; }
if (keep) console.log('espacio de trabajo conservado en', workspace);
else {
  // A directory the operating system still holds is not a failed run: the record is already written.
  const left = await rm(workspace, { recursive: true, force: true }).then(() => null, error => error.code);
  if (left) console.log(`el sistema retiene el espacio de trabajo (${left}); queda en ${portable(workspace)}`);
}
