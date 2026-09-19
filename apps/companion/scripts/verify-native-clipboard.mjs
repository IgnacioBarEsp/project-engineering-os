import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { portable } from './portable-path.mjs';
import { INTERACTIVE, REACH, reachProblems } from './interface-contract.mjs';

// The two copy controls of the finished wizard, driven in real Electron with the shipped main process, preload and
// service, and read back from the operating system's clipboard by the main process. A browser run cannot prove
// this: 0.3.1 copied in a browser and did nothing in the installed application, because the window holds no
// clipboard permission and the renderer swallowed the refusal.
//
// Real here: Electron from the lockfile, main.mjs, preload.cjs, service.mjs, IPC with its sender checks, the
// renderer and the clipboard. Not real: the folder picker, answered with a fixture folder because the operating
// system dialog cannot be driven by a script (measured in #117). With no second argument the source runs through
// `electron .`; with the path of a packaged executable, that artifact runs instead. Neither is the installer, and
// the record says which one ran.
//
// Isolation: a user data directory and a LOCALAPPDATA of its own, so no history, verdict or managed tool of a
// personal installation is read or written. The clipboard is shared with whoever uses this machine: its previous
// text is kept in memory, written back at the end and never recorded.
//
// In Electron 44 the main-process clipboard is asynchronous: readText and writeText return promises. Every read
// here is awaited, and the adapter main.mjs hands the service returns one too, which is why the service awaits it
// before answering.
//
//   node scripts/verify-native-clipboard.mjs <evidence directory> [<packaged application executable>]
const [output, packaged] = process.argv.slice(2);
assert(output, 'Indica un directorio de evidencia.');
await mkdir(output, { recursive: true });
const app = fileURLToPath(new URL('../', import.meta.url));
const run = promisify(execFile);
const pw = await import(process.env.PROJECT_OS_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PROJECT_OS_PLAYWRIGHT_MODULE).href : 'playwright');
const { _electron } = pw.default ?? pw;
const executable = packaged ? path.resolve(packaged)
  : path.join(app, 'node_modules', 'electron', 'dist', process.platform === 'win32' ? 'electron.exe' : 'electron');
const sha = value => createHash('sha256').update(value).digest('hex');
const git = async (...args) => (await run('git', ['-C', app, ...args], { windowsHide: true })).stdout.trim();

const workspace = await realpath(await mkdtemp(path.join(os.tmpdir(), 'peos-native-clipboard-')));
const userData = path.join(workspace, 'userdata'), localAppData = path.join(workspace, 'localappdata');
const project = path.join(workspace, 'proyecto de prueba');
await mkdir(localAppData, { recursive: true });
await mkdir(project, { recursive: true });
await writeFile(path.join(project, 'notas.txt'), 'Notas de prueba para comprobar el portapapeles.\n');
const anchors = [['<espacio de prueba>', workspace]];
const dirty = await git('status', '--porcelain');
const record = { date: new Date().toISOString(),
  ran: packaged ? 'artefacto empaquetado, sin instalar' : 'código fuente con electron .',
  executable: portable(executable, [['<app>', app]]),
  source: { commit: await git('rev-parse', 'HEAD'), dirty: dirty ? dirty.split(/\r?\n/).map(line => line.trim()) : [] },
  machine: { platform: process.platform, arch: process.arch, release: os.release(), version: os.version() },
  notADemonstrationOf: ['el instalador ni una instalación', 'el selector de carpetas del sistema, que recibe una carpeta de prueba'],
  findings: [] };
const finding = value => record.findings.push(value);

let application, previous = null;
try {
  application = await _electron.launch({ executablePath: executable, args: [...(packaged ? [] : ['.']), `--user-data-dir=${userData}`],
    cwd: app, env: { ...process.env, LOCALAPPDATA: localAppData }, timeout: 60000 });
  // The picker is the one native step replaced, and it is replaced before anything can open it.
  await application.evaluate(({ dialog }, folder) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [folder] });
  }, project);
  previous = await application.evaluate(({ clipboard }) => clipboard.readText());
  const page = await application.firstWindow({ timeout: 60000 });
  page.setDefaultTimeout(30000);
  // Recorded, not judged: the browser harness serves the renderer without the application's CSP, so what the
  // window refuses here is part of how far a browser run speaks for the real one.
  const consoleErrors = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text().replace(/\s+/g, ' ').slice(0, 240)); });
  record.console = { errors: 0, contentSecurityPolicy: 0, distinct: [] };
  await page.getByRole('heading', { name: 'Dale a tu IA un buen punto de partida.', exact: true }).waitFor({ timeout: 60000 });

  const runtime = await application.evaluate(({ app: electronApp, BrowserWindow }) => ({
    electron: process.versions.electron, chrome: process.versions.chrome, node: process.versions.node,
    userData: electronApp.getPath('userData'), version: electronApp.getVersion(),
    outer: BrowserWindow.getAllWindows()[0].getBounds() }));
  record.runtime = { electron: runtime.electron, chrome: runtime.chrome, node: runtime.node, appVersion: runtime.version };
  record.isolation = { userData: portable(runtime.userData, anchors), localAppData: portable(localAppData, anchors),
    userDataIsTheTestOne: path.resolve(runtime.userData).toLowerCase() === path.resolve(userData).toLowerCase() };
  if (!record.isolation.userDataIsTheTestOne) finding('La aplicación no usó el directorio de datos de la prueba.');
  record.window = { outer: runtime.outer, inner: await page.evaluate(() => ({ width: innerWidth, height: innerHeight, devicePixelRatio })) };
  record.motion = { operatingSystemPrefersReduced: await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches),
    measuredWith: 'no-preference' };
  // The entry animation is what hid the defect, so it runs here whatever the machine's own setting is.
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  // The window itself still cannot write the clipboard, and the bridge offers writing and nothing else.
  record.renderer = await page.evaluate(async () => ({
    clipboardPermission: await navigator.permissions.query({ name: 'clipboard-write' }).then(state => state.state, error => `error: ${error.message}`),
    operations: Object.keys(window.companion).sort() }));
  if (record.renderer.clipboardPermission !== 'denied') finding(`La ventana tiene permiso de portapapeles: ${record.renderer.clipboardPermission}`);
  if (!record.renderer.operations.includes('copyText')) finding('El puente no ofrece copyText.');
  if (record.renderer.operations.some(name => /read|paste|clipboard/i.test(name))) finding('El puente ofrece algo más que escribir en el portapapeles.');

  const settle = () => page.waitForFunction(() => document.getElementById('content').getAttribute('aria-busy') !== 'true'
    && !(document.querySelector('#view .enter')?.getAnimations() ?? []).some(animation => animation.playState === 'running'));
  const reached = name => page.getByRole('heading', { name, exact: true }).waitFor();
  const press = async name => { await page.getByRole('button', { name, exact: true }).click({ timeout: 10000 }); await settle(); };
  await page.locator('#view').getByRole('button', { name: 'Preparar proyecto', exact: true }).click();
  await reached('Empecemos por lo que quieres lograr.');
  await page.getByLabel('Nombre de tu proyecto').fill('Prueba nativa del portapapeles');
  await page.getByLabel('¿Qué quieres lograr?').fill('Comprobar que copiar deja el texto en el portapapeles');
  await press('Elegir carpeta →'); await reached('Tu trabajo empieza en una carpeta.');
  await press('Buscar carpeta en este equipo'); await page.locator('.folder-card .path').waitFor();
  await press('Continuar a delimitación →'); await reached('¿Cuál es el enfoque principal de tu proyecto?');
  await press('Paso 3: Visión y Descripción →'); await reached('Cuéntanos en tus palabras: ¿qué quieres lograr?');
  // A suggestion adds a paragraph, so this run also goes through a vision of more than one line.
  await page.locator('.prompt-chip').first().click({ timeout: 10000 });
  await press('Paso 4: Instalación →'); await reached('Tu espacio está listo. ¿Cómo prefieres equiparlo?');
  await settle();
  const install = await page.evaluate(REACH, INTERACTIVE);
  // The bar's height reaches scroll-padding through the CSSOM. The browser harness has no CSP, so only this window
  // can show that the application's own policy lets it through.
  const scrollPadding = await page.evaluate(() => getComputedStyle(document.documentElement).scrollPaddingBottom);
  if (install.bar?.position === 'sticky' && parseFloat(scrollPadding) < install.bar.height) finding(`El scroll-padding (${scrollPadding}) no cubre la barra sticky (${install.bar.height} px).`);
  record.install = { measured: install.controls.length, reachable: install.controls.filter(control => control.ok).length,
    bar: install.bar, end: install.end, enter: install.enter, scrollPadding,
    problems: reachProblems(install, { primary: ['Volver', 'Instalar stack base y obtener prompt →', 'Preparar carpeta y generar prompt maestro →'], bar: true }) };
  for (const problem of record.install.problems) finding(`Instalación: ${problem}`);
  await page.screenshot({ path: path.join(output, 'electron-install-final.png'), mask: [page.locator('.path')], maskColor: '#e7eee4' });
  await press('Preparar carpeta y generar prompt maestro →'); await reached('¡Tu proyecto está listo para cobrar vida!');

  // Each control against a sentinel written a moment before, read back by the main process from the system.
  record.copies = [];
  for (const [control, selector] of [['Copiar ruta', '.finished-path-bar code'], ['Copiar Prompt Maestro', '.prompt-box pre']]) {
    const expected = await page.locator(selector).evaluate(node => node.textContent);
    const sentinel = `centinela ${randomUUID()}`;
    await application.evaluate(({ clipboard }, value) => clipboard.writeText(value), sentinel);
    // The element itself, because its label is what changes once the copy is confirmed.
    const button = await page.getByRole('button', { name: control, exact: true }).elementHandle();
    await button.click({ timeout: 10000 });
    await settle();
    const clipboardText = await application.evaluate(({ clipboard }) => clipboard.readText());
    const observation = { control, expectedBytes: Buffer.byteLength(expected), expectedSha256: sha(expected),
      clipboardSha256: sha(clipboardText), equal: clipboardText === expected, sentinelReplaced: clipboardText !== sentinel,
      notice: (await page.locator('#notice').textContent()).trim(), labelAfter: (await button.textContent()).trim(),
      errorShown: await page.locator('#feedback').isVisible() };
    record.copies.push(observation);
    if (!observation.equal) finding(`«${control}» no dejó en el portapapeles el texto que muestra la pantalla.`);
    if (!observation.notice) finding(`«${control}» no anunció la copia en la región de estado.`);
    if (observation.errorShown) finding(`«${control}» mostró un error.`);
  }
  await page.screenshot({ path: path.join(output, 'electron-finished.png'), fullPage: true,
    mask: [page.locator('.finished-path-bar code, .prompt-box pre, .path')], maskColor: '#e7eee4' });

  // Refusals: a request over the transport limit from this window, a request the service refuses, and the same
  // bridge in a window the application did not open. None of them may reach the clipboard.
  record.refused = [];
  const refuse = async (label, attempt) => {
    const sentinel = `centinela ${randomUUID()}`;
    await application.evaluate(({ clipboard }, value) => clipboard.writeText(value), sentinel);
    const answer = await attempt();
    // Electron 44's clipboard is asynchronous in the main process: readText resolves to the text.
    const unchanged = await application.evaluate(async ({ clipboard }, value) => (await clipboard.readText()) === value, sentinel);
    record.refused.push({ label, ok: answer?.ok ?? null, code: answer?.error?.code ?? null, clipboardUnchanged: unchanged });
    if (answer?.ok !== false) finding(`${label}: se aceptó.`);
    if (!unchanged) finding(`${label}: el portapapeles cambió.`);
  };
  await refuse('Petición de más de 64000 bytes desde la ventana de la aplicación',
    () => page.evaluate(() => window.companion.copyText({ text: 'x'.repeat(70000) })));
  await refuse('Texto de más de 32000 bytes que el transporte admite y el servicio rechaza',
    () => page.evaluate(() => window.companion.copyText({ text: 'x'.repeat(40000) })));
  await refuse('Texto vacío', () => page.evaluate(() => window.companion.copyText({ text: '   ' })));
  const preload = path.join(app, 'desktop', 'preload.cjs');
  await refuse('El mismo puente en una ventana que la aplicación no abrió', () => application.evaluate(async ({ BrowserWindow }, script) => {
    const other = new BrowserWindow({ show: false, webPreferences: { preload: script, partition: 'peos-clipboard-intruder',
      sandbox: true, contextIsolation: true, nodeIntegration: false } });
    try {
      await other.loadURL('data:text/html,<title>Otra ventana</title><p>Otra ventana</p>');
      return await other.webContents.executeJavaScript("window.companion.copyText({text:'texto desde una ventana ajena'})");
    } finally { other.destroy(); }
  }, packaged ? path.join(path.dirname(executable), 'resources', 'app', 'desktop', 'preload.cjs') : preload));
  record.console = { errors: consoleErrors.length,
    contentSecurityPolicy: consoleErrors.filter(text => /Content Security Policy/i.test(text)).length,
    distinct: [...new Set(consoleErrors)].slice(0, 5) };
} catch (error) {
  finding(`La prueba no pudo completarse: ${String(error.message).split('\n')[0].slice(0, 300)}`);
} finally {
  if (application) {
    if (previous !== null) {
      await application.evaluate(({ clipboard }, value) => clipboard.writeText(value), previous).catch(() => {});
      record.previousClipboardTextRestored = true;
    }
    await application.close().catch(() => {});
  }
  assert(path.dirname(workspace) === await realpath(os.tmpdir()) && path.basename(workspace).startsWith('peos-native-clipboard-'));
  await rm(workspace, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}

// A run that observed neither copy is not a pass, whatever else it saw.
if ((record.copies?.length ?? 0) !== 2) finding('No se observaron los dos controles de copia.');
if ((record.refused?.length ?? 0) !== 4) finding('No se observaron los cuatro rechazos.');
record.summary = { copies: record.copies?.length ?? 0, copiesEqual: record.copies?.filter(copy => copy.equal).length ?? 0,
  refused: record.refused?.length ?? 0, refusedWithoutWriting: record.refused?.filter(entry => entry.ok === false && entry.clipboardUnchanged).length ?? 0,
  findings: record.findings.length };
await writeFile(path.join(output, 'native-clipboard.json'), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record.summary, null, 2));
if (record.findings.length) { console.error(JSON.stringify(record.findings, null, 2)); process.exitCode = 1; }
