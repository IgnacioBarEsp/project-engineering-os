import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { cp, mkdir, mkdtemp, readFile, writeFile, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { portable } from './portable-path.mjs';
import { ACTION_PAIRS, UNDEFINED_JARGON, LIST_PURITY, ACCESSIBILITY, EXPECTED_ACTIONS, duplicateActionNames, missingActions }
  from './interface-contract.mjs';

// A check that survives reintroducing the defect proves nothing. The three structural properties of this
// interface — one name per action, a list that is only a list, and no undefined vocabulary left as prose —
// are asserted here against the real renderer and then against five deliberate mutations, each of which
// reintroduces one of the faults the maintainer found. A mutation that is not detected fails this run.
//
// The mutations are textual patches applied to a COPY of the interface; the working tree is never edited.
//
//   node scripts/verify-interface-contract.mjs <evidence directory>
const output = process.argv[2] ?? path.join(tmpdir(), 'project-os-closeout', 'companion-contract');
await mkdir(output, { recursive: true });
const source = fileURLToPath(new URL('../ui/', import.meta.url));
const temp = await realpath(await mkdtemp(path.join(tmpdir(), 'peos-contract-')));
const ui = path.join(temp, 'ui');
await cp(source, ui, { recursive: true });
const pristine = new Map();
for (const file of ['index.html', 'app.mjs', 'glossary.mjs']) pristine.set(file, await readFile(path.join(ui, file), 'utf8'));

const MUTATIONS = [
  { id: 'two-names-for-one-action', file: 'index.html',
    reason: 'la entrada de navegación vuelve a llamarse distinto que el botón que hace lo mismo',
    from: 'data-action="prepare-project">Preparar proyecto<', to: 'data-action="prepare-project">Preparar una carpeta<',
    detect: report => duplicateActionNames(report.actions).length > 0 },
  { id: 'greeting-back-in-the-list', file: 'app.mjs',
    reason: 'la lista de proyectos recupera un saludo explicativo',
    from: "el('h1',{tabindex:'-1',text:'Tus proyectos'}),",
    to: "el('h1',{tabindex:'-1',text:'Tus proyectos'}),p('Hola. Aquí están las carpetas que preparaste.','intro'),",
    detect: report => report.purity.strayParagraphs.length > 0 && report.purity.furniture.includes('.intro') },
  { id: 'term-without-definition', file: 'app.mjs',
    reason: 'un término técnico vuelve a aparecer en Inicio como prosa, sin definición alcanzable',
    from: "term('openspec'),' si lo pides.", to: "'OpenSpec',' si lo pides.",
    detect: report => report.jargon.includes('OpenSpec') },
  { id: 'action-removed-from-the-page', file: 'index.html',
    reason: 'se retira la declaración de una acción, que es la forma de satisfacer la comprobación por omisión',
    from: ' data-action="open-help"', to: '',
    detect: report => missingActions(report.actions).includes('open-help') },
  { id: 'glossary-stops-listing-every-term', file: 'app.mjs',
    reason: 'la ayuda deja de reunir todas las definiciones',
    from: 'GLOSSARY.flatMap(', to: 'GLOSSARY.slice(0,5).flatMap(',
    detect: report => report.glossaryEntries !== report.glossaryTerms },
  { id: 'state-text-loses-its-contrast', file: 'app.mjs',
    reason: 'el estado de cada proyecto se vuelve ilegible sobre su fondo',
    from: "el('p',{class:`project-state state-${project.state}`}",
    to: "el('p',{class:`project-state state-${project.state}`,style:'color:#c9d4c9'}",
    detect: report => report.accessibility['tus proyectos'].contrast.some(entry => entry.class?.includes('project-state')) },
  { id: 'a-term-stops-being-a-control', file: 'glossary.mjs',
    reason: 'un término deja de poder activarse con el teclado y pasa a ser texto',
    from: "return el('button', { type: 'button', class: 'term'", to: "return el('span', { class: 'term'",
    detect: report => report.accessibility.ayuda.terms !== report.accessibility.ayuda.termsReachable },
];

const types = { '.html': 'text/html', '.css': 'text/css', '.mjs': 'text/javascript' };
const server = createServer(async (request, response) => {
  const name = request.url === '/' ? 'index.html' : request.url.slice(1);
  if (request.method !== 'GET' || !/^[a-z.]+$/.test(name) || !Object.hasOwn(types, path.extname(name))) {
    response.writeHead(404); response.end(); return;
  }
  const body = await readFile(path.join(ui, name)).catch(() => null);
  if (!body) { response.writeHead(404); response.end(); return; }
  response.setHeader('Content-Type', types[path.extname(name)]); response.end(body);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;

const { GLOSSARY } = await import(pathToFileURL(path.join(source, 'glossary.mjs')).href);
const pw = await import(process.env.PROJECT_OS_PLAYWRIGHT_MODULE
  ? pathToFileURL(process.env.PROJECT_OS_PLAYWRIGHT_MODULE).href : 'playwright');
const { chromium } = pw.default ?? pw;

const record = { date: new Date().toISOString(), source: portable(source),
  scope: 'El renderer real servido desde una copia, con el servicio nativo reemplazado por una respuesta fija. No demuestra el motor ni la aplicación instalada.',
  glossaryTerms: GLOSSARY.length, baseline: null, mutations: [], findings: [] };

// One project in the stubbed history, prepared and read, so the list has an entry to be pure about.
const STUB = `window.companion={
  listProjects:async()=>({ok:true,value:[{id:'11111111-1111-4111-8111-111111111111',name:'Carpeta de prueba',
    root:'C:/ruta/de/prueba',profile:'research',state:'context',recorded:true}]}),
  onProgress:()=>()=>{}};`;

let browser;
async function inspect(page) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Dale a tu IA un buen punto de partida.', exact: true }).waitFor();
  const jargon = await page.evaluate(UNDEFINED_JARGON);
  const actions = new Map();
  const collect = async where => {
    for (const [action, name] of await page.evaluate(ACTION_PAIRS)) {
      if (!actions.has(action)) actions.set(action, new Map());
      actions.get(action).set(name, where);
    }
  };
  await collect('inicio');
  const accessibility = { inicio: await page.evaluate(ACCESSIBILITY) };
  await page.getByRole('button', { name: 'Ayuda', exact: true }).click();
  await page.getByRole('heading', { name: 'Ayuda', exact: true }).waitFor();
  await collect('ayuda');
  accessibility.ayuda = await page.evaluate(ACCESSIBILITY);
  const glossaryEntries = await page.locator('#glosario dt').count();
  await page.getByRole('button', { name: 'Tus proyectos', exact: true }).click();
  await page.getByRole('heading', { name: 'Tus proyectos', exact: true }).waitFor();
  await collect('tus proyectos');
  accessibility['tus proyectos'] = await page.evaluate(ACCESSIBILITY);
  const purity = await page.evaluate(LIST_PURITY);
  return { jargon, actions, purity, glossaryEntries, accessibility, glossaryTerms: GLOSSARY.length };
}
const flat = report => ({ jargon: report.jargon, purity: report.purity,
  glossaryEntries: report.glossaryEntries, accessibility: report.accessibility,
  actions: [...report.actions].map(([action, names]) => [action, [...names.keys()]]),
  duplicated: duplicateActionNames(report.actions), missing: missingActions(report.actions) });

try {
  browser = await chromium.launch({ ...(process.platform === 'win32' ? { channel: 'msedge' } : {}), headless: true });
  const context = await browser.newContext({ viewport: { width: 1180, height: 820 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', event => errors.push(event.message));
  await page.addInitScript(STUB);

  const baseline = await inspect(page);
  record.baseline = flat(baseline);
  if (baseline.jargon.length) record.findings.push(`Inicio deja vocabulario sin definición: ${baseline.jargon.join(', ')}`);
  if (duplicateActionNames(baseline.actions).length) record.findings.push(`Una acción con dos nombres: ${duplicateActionNames(baseline.actions).join('; ')}`);
  if (missingActions(baseline.actions).length) record.findings.push(`Acciones declaradas ausentes de la página: ${missingActions(baseline.actions).join(', ')}`);
  if (baseline.purity.strayParagraphs.length) record.findings.push(`La lista trae prosa fuera de una tarjeta: ${baseline.purity.strayParagraphs.join(' | ')}`);
  if (baseline.purity.furniture.length) record.findings.push(`La lista trae mobiliario de Inicio: ${baseline.purity.furniture.join(', ')}`);
  if (baseline.purity.cards !== 1) record.findings.push(`La lista no mostró la única entrada del historial: ${baseline.purity.cards}`);
  if (baseline.glossaryEntries !== GLOSSARY.length) record.findings.push(`El glosario lista ${baseline.glossaryEntries} de ${GLOSSARY.length} términos`);
  for (const [where, result] of Object.entries(baseline.accessibility)) {
    for (const entry of result.contrast) {
      record.findings.push(`Contraste insuficiente en ${where}: ${entry.tag}.${entry.class} ${entry.ratio}:1 frente a ${entry.required}:1 requerido ("${entry.text}")`);
    }
    for (const problem of result.headingOrder) record.findings.push(`Orden de encabezados en ${where}: ${problem}`);
    if (result.terms !== result.termsReachable) {
      record.findings.push(`En ${where}, ${result.terms - result.termsReachable} término(s) no se pueden activar con el teclado`);
    }
    if (!result.focusable) record.findings.push(`En ${where} no hay ningún control alcanzable con el teclado`);
  }
  assert.deepEqual([...baseline.actions.keys()].sort(), [...EXPECTED_ACTIONS].sort(),
    'The declared set of navigable actions is part of the contract');

  for (const mutation of MUTATIONS) {
    const target = path.join(ui, mutation.file), original = pristine.get(mutation.file);
    assert.ok(original.includes(mutation.from), `La mutación ${mutation.id} no encontró su punto de inserción.`);
    await writeFile(target, original.replace(mutation.from, mutation.to));
    let detected = false, report = null;
    try { report = await inspect(page); detected = mutation.detect(report); }
    catch (error) {
      // A mutation that makes the interface unreachable is also detected: the check cannot pass.
      detected = true; report = null; record.mutations.push({ id: mutation.id, reason: mutation.reason,
        detected, by: `la comprobación no pudo completarse: ${String(error.message).split('\n')[0].slice(0, 160)}` });
    }
    if (report) record.mutations.push({ id: mutation.id, reason: mutation.reason, detected, observed: flat(report) });
    if (!detected) record.findings.push(`La mutación ${mutation.id} no fue detectada: la comprobación pasa con el defecto puesto`);
    await writeFile(target, original);
  }
  record.rendererErrors = errors;
  if (errors.length) record.findings.push(`Excepciones del renderer: ${errors.join(' | ')}`);
} finally {
  await browser?.close().catch(() => {});
  await new Promise(resolve => server.close(resolve));
  assert(path.dirname(temp) === await realpath(tmpdir()) && path.basename(temp).startsWith('peos-contract-'));
  await rm(temp, { recursive: true, force: true });
}

record.summary = { mutations: record.mutations.length,
  detected: record.mutations.filter(entry => entry.detected).length, findings: record.findings.length };
await writeFile(path.join(output, 'interface-contract.json'), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify({ ...record.summary, baseline: record.baseline.actions }, null, 2));
if (record.findings.length) { console.error(JSON.stringify(record.findings, null, 2)); process.exitCode = 1; }
