import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { portable } from './portable-path.mjs';

// Genera la galería pública de Companion: siete capturas de la ventana real en Electron, cada una con su
// registro de procedencia (#143). Real aquí: Electron del lockfile, main.mjs, preload.cjs, el renderer y su
// CSP, con la ventana por defecto de la aplicación. Sustituido: el selector de carpetas del sistema, que un
// script no puede manejar, y los datos de usuario, aislados en un directorio temporal.
//
// La carpeta del proyecto es neutra: se crea bajo la carpeta pública de documentos de Windows para que el
// nombre de la cuenta de quien ejecuta no aparezca en ninguna imagen (la pantalla final muestra la ruta y el
// Prompt Maestro la incluye). Se borra al terminar.
//
// El árbol debe estar limpio: el commit que declara cada registro tiene que describir el código que se
// ejecutó, como exige pack-app.mjs. Las imágenes se escriben en docs/assets/ y se commitean después.
//
//   node scripts/capture-screenshots.mjs <directorio-de-evidencia>
const [output] = process.argv.slice(2);
assert(output, 'Indica un directorio de evidencia.');
await mkdir(output, { recursive: true });

const app = fileURLToPath(new URL('../', import.meta.url));
const repo = path.resolve(app, '..', '..');
const run = promisify(execFile);
const git = async (...args) => (await run('git', ['-C', repo, ...args], { windowsHide: true })).stdout.trim();

const dirty = await git('status', '--porcelain');
assert.equal(dirty, '', `El árbol debe estar limpio para capturar; hay cambios sin commit:\n${dirty}`);
const commit = await git('rev-parse', 'HEAD');

const pw = await import(process.env.PROJECT_OS_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PROJECT_OS_PLAYWRIGHT_MODULE).href : 'playwright');
const { _electron } = pw.default ?? pw;
const executable = path.join(app, 'node_modules', 'electron', 'dist', process.platform === 'win32' ? 'electron.exe' : 'electron');

// Carpeta de proyecto neutra: documentos públicos, compartidos por todas las cuentas.
const username = os.userInfo().username.toLowerCase();
const publicRoot = process.env.PUBLIC ?? 'C:\\Users\\Public';
const publicDocuments = path.join(publicRoot, 'Documents');
const project = path.join(publicDocuments, `peos-captura-${randomUUID().slice(0, 8)}`);
assert(!project.toLowerCase().includes(username), 'La carpeta de proyecto contendría el nombre de la cuenta.');
assert(path.dirname(project).toLowerCase() === publicDocuments.toLowerCase(), 'La carpeta de proyecto no está en documentos públicos.');

const workspace = await realpath(await mkdtemp(path.join(os.tmpdir(), 'peos-capturas-')));
const userData = path.join(workspace, 'userdata');
const localAppData = path.join(workspace, 'localappdata');
await mkdir(localAppData, { recursive: true });
await mkdir(project, { recursive: true });
await writeFile(path.join(project, 'notas.txt'), 'Notas de ejemplo para las capturas de la documentación.\n');

const record = {
  date: new Date().toISOString(),
  ran: 'electron .',
  commit,
  projectFolder: portable(project, [['<public-docs>', publicDocuments]]),
  notADemonstrationOf: ['el instalador ni una instalación', 'el selector de carpetas del sistema, que recibe una carpeta de prueba'],
  images: [],
  findings: [],
};
const finding = (value) => record.findings.push(value);

// Dimensiones reales del PNG: ancho y alto en IHDR, big-endian.
const pngSize = (bytes) => ({ width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) });

const targets = [
  { file: 'docs/assets/companion/home-companion.png', screen: { id: 'home', title: 'Dale a tu IA un buen punto de partida.' } },
  { file: 'docs/assets/companion-current-home.png', screen: { id: 'home', title: 'Dale a tu IA un buen punto de partida.' } },
  { file: 'docs/assets/companion/paso-1-perfil.png', screen: { id: 'paso-1-perfil', title: 'Empecemos por lo que quieres lograr.' } },
  { file: 'docs/assets/companion/paso-2-delimitacion.png', screen: { id: 'paso-2-delimitacion', title: '¿Cuál es el enfoque principal de tu proyecto?' } },
  { file: 'docs/assets/companion/paso-3-vision.png', screen: { id: 'paso-3-vision', title: 'Cuéntanos en tus palabras: ¿qué quieres lograr?' } },
  { file: 'docs/assets/companion/paso-4-instalacion.png', screen: { id: 'paso-4-instalacion', title: 'Tu espacio está listo. ¿Cómo prefieres equiparlo?' } },
  { file: 'docs/assets/companion/proyecto-listo-activacion.png', screen: { id: 'proyecto-listo', title: '¡Tu proyecto está listo para cobrar vida!' } },
];

let application;
try {
  application = await _electron.launch({
    executablePath: executable,
    args: ['.', `--user-data-dir=${userData}`],
    cwd: app,
    env: { ...process.env, LOCALAPPDATA: localAppData },
    timeout: 60000,
  });
  // El único paso nativo sustituido, antes de que nada pueda abrirlo.
  await application.evaluate(({ dialog }, folder) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [folder] });
  }, project);

  const page = await application.firstWindow({ timeout: 60000 });
  page.setDefaultTimeout(30000);
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text().replace(/\s+/g, ' ').slice(0, 240));
  });

  await page.getByRole('heading', { name: 'Dale a tu IA un buen punto de partida.', exact: true }).waitFor({ timeout: 60000 });
  // La animación de entrada se ejecuta y termina en cada pantalla; no se captura a media animación.
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  const runtime = await application.evaluate(({ app: electronApp, BrowserWindow }) => ({
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    version: electronApp.getVersion(),
    outer: BrowserWindow.getAllWindows()[0].getBounds(),
  }));
  record.runtime = { electron: runtime.electron, chrome: runtime.chrome, appVersion: runtime.version };
  const viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, devicePixelRatio }));
  record.window = { outer: { width: runtime.outer.width, height: runtime.outer.height }, viewport, motion: 'no-preference' };

  const settle = () => page.waitForFunction(() => document.getElementById('content')?.getAttribute('aria-busy') !== 'true'
    && !(document.querySelector('#view .enter')?.getAnimations() ?? []).some((animation) => animation.playState === 'running'));
  const reached = (name) => page.getByRole('heading', { name, exact: true }).waitFor();
  const press = async (name) => { await page.getByRole('button', { name, exact: true }).click({ timeout: 10000 }); await settle(); };

  const capture = async (target) => {
    await settle();
    await page.evaluate(() => window.scrollTo(0, 0));
    // El encabezado real puede partir líneas; la comparación normaliza espacios, como hace el name matching.
    const heading = (await page.locator('#view h1').first().textContent()).replace(/\s+/g, ' ').trim();
    if (heading !== target.screen.title) {
      finding(`«${target.file}» se capturó bajo el encabezado «${heading.trim()}», no el esperado.`);
    }
    const bytes = await page.screenshot();
    const { width, height } = pngSize(bytes);
    const absolute = path.join(repo, target.file);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, bytes);
    const provenance = {
      schemaVersion: 1,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      bytes: bytes.length,
      width,
      height,
      commit,
      appVersion: runtime.version,
      ran: 'electron .',
      engine: `Electron ${runtime.electron}, Chromium ${runtime.chrome}`,
      window: {
        outer: { width: runtime.outer.width, height: runtime.outer.height },
        viewport: { width: viewport.width, height: viewport.height },
        devicePixelRatio: viewport.devicePixelRatio,
      },
      screen: target.screen,
      generator: 'apps/companion/scripts/capture-screenshots.mjs',
      capturedAt: new Date().toISOString(),
      platform: `${process.platform} ${os.release()}`,
    };
    const text = JSON.stringify(provenance, null, 2) + '\n';
    assert(!text.toLowerCase().includes(username), `El registro de ${target.file} contiene el nombre de la cuenta.`);
    assert(!/[A-Za-z]:[\\/]/.test(text), `El registro de ${target.file} contiene una ruta absoluta.`);
    await writeFile(`${absolute}.provenance.json`, text);
    record.images.push({ file: target.file, ...provenance });
  };

  // Inicio: la misma pantalla alimenta la galería y la imagen del README, cada una con su registro.
  await capture(targets[0]);
  await capture(targets[1]);

  await page.locator('#view').getByRole('button', { name: 'Preparar proyecto', exact: true }).click();
  await reached('Empecemos por lo que quieres lograr.');
  // Contenido neutro de ejemplo: nada de esta máquina entra en las imágenes.
  await page.getByLabel('Nombre de tu proyecto').fill('Proyecto de ejemplo');
  await page.getByLabel('¿Qué quieres lograr?').fill('Organizar los materiales del proyecto y preparar la carpeta para trabajar con mi IA.');
  await page.locator('input[name="agent"]').first().check();
  await capture(targets[2]);

  await press('Elegir carpeta →');
  await reached('Tu trabajo empieza en una carpeta.');
  await press('Buscar carpeta en este equipo');
  await page.locator('.folder-card .path').waitFor();
  await press('Continuar a delimitación →');
  await reached('¿Cuál es el enfoque principal de tu proyecto?');
  await capture(targets[3]);

  await press('Paso 3: Visión y Descripción →');
  await reached('Cuéntanos en tus palabras: ¿qué quieres lograr?');
  await capture(targets[4]);

  await press('Paso 4: Instalación →');
  await reached('Tu espacio está listo. ¿Cómo prefieres equiparlo?');
  await capture(targets[5]);

  await press('Preparar carpeta y generar prompt maestro →');
  await reached('¡Tu proyecto está listo para cobrar vida!');
  await capture(targets[6]);

  record.console = {
    errors: consoleErrors.length,
    contentSecurityPolicy: consoleErrors.filter((text) => /Content Security Policy/i.test(text)).length,
    distinct: [...new Set(consoleErrors)].slice(0, 5),
  };
} catch (error) {
  finding(`La generación no pudo completarse: ${String(error.message).split('\n')[0].slice(0, 300)}`);
} finally {
  if (application) await application.close().catch(() => {});
  if (path.dirname(project).toLowerCase() === publicDocuments.toLowerCase() && path.basename(project).startsWith('peos-captura-')) {
    await rm(project, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
  assert(path.dirname(workspace) === await realpath(os.tmpdir()) && path.basename(workspace).startsWith('peos-capturas-'));
  await rm(workspace, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}

if (record.images.length !== targets.length) {
  finding(`Se generaron ${record.images.length} de ${targets.length} imágenes.`);
}
record.summary = { images: record.images.length, findings: record.findings.length };
await writeFile(path.join(output, 'capture-run.json'), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record.summary, null, 2));
if (record.findings.length) { console.error(JSON.stringify(record.findings, null, 2)); process.exitCode = 1; }
