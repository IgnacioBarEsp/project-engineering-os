import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { cp, mkdir, mkdtemp, readFile, writeFile, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { portable } from './portable-path.mjs';
import { ACTION_PAIRS, UNDEFINED_VOCABULARY, TERM_LABELS, LIST_PURITY, ACCESSIBILITY, ACCESSIBLE_NAMES,
  EXPECTED_ACTIONS, collectActionPairs, duplicateActionNames, undeclaredActions, vacuous }
  from './interface-contract.mjs';

// A check that survives reintroducing the defect proves nothing. Each structural property of this interface
// is asserted here against the real renderer and then against deliberate mutations of a copy of it, each of
// which reintroduces a fault someone actually found. A mutation that is not detected fails this run.
//
// Three generations of this harness so far. The first shipped seven mutations; an independent review found
// twelve more that nothing on the branch detected. A second review then found that three of the eighteen
// were "detected" by a thirty-second harness timeout rather than by the probe they name, and that seven more
// bypasses were still open — a glossary word through a `placeholder` or an `aria-label`, a declared action
// renamed through `aria-label` or duplicated inside a dialog. Both are addressed here:
//
//   - **Navigation is structural, observation is by name.** The harness moves between screens by
//     `[data-action]` selector, so renaming a label no longer breaks the harness's own navigation and the
//     rename can actually be observed. A screen that cannot be reached is recorded, not fatal.
//   - **An exception is never a detection.** If a mutation makes a probe impossible to evaluate, that is
//     recorded as NOT detected and fails the run, because a regression in the probe would look identical.
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
const FILES = ['index.html', 'app.mjs', 'glossary.mjs', 'app.css'];
const pristine = new Map();
for (const file of FILES) pristine.set(file, await readFile(path.join(ui, file), 'utf8'));

const listOf = report => report.screens['tus proyectos'];
const anyScreen = (report, predicate) => Object.entries(report.screens).filter(([, screen]) => predicate(screen));
// Not a defect, and not counted as one. Changing the label in the action table renames every control that
// offers it, which is the construction doing its job — the first version of this harness listed it among the
// mutations, which inflated the detected total with a case where there was nothing to detect.
const CONSTRUCTION_PROBES = [
  { id: 'renaming-an-action-renames-every-control-at-once', file: 'app.mjs',
    property: 'la etiqueta vive con la acción, así que no se puede romper en un solo sitio',
    from: "'prepare-project':{label:'Preparar proyecto'", to: "'prepare-project':{label:'Preparar una carpeta'",
    holds: report => report.duplicated.length === 0
      && report.actions.some(([id, names]) => id === 'prepare-project'
        && names.length === 1 && names[0] === 'Preparar una carpeta') },
];

const MUTATIONS = [
  { id: 'two-names-for-one-action-deeper-in-the-wizard', file: 'app.mjs',
    reason: 'una acción declarada se ofrece con otro nombre en una pantalla del asistente',
    from: "actions(doBtn('open-start'),el('button',{type:'submit',class:'primary',text:'Elegir carpeta  →'})));",
    to: "actions(doBtn('open-start'),el('button',{type:'button',class:'secondary','data-action':'prepare-project',text:'Preparar una carpeta'}),el('button',{type:'submit',class:'primary',text:'Elegir carpeta  →'})));",
    detect: report => report.duplicated.some(entry => entry.startsWith('prepare-project')) },
  { id: 'a-second-name-only-assistive-technology-hears', file: 'app.mjs',
    reason: 'una acción declarada lleva un aria-label distinto de su texto visible, que es el nombre que dice un lector de pantalla',
    from: "$('topbar-actions').replaceChildren(doBtn('privacy-scope','quiet'));",
    to: "$('topbar-actions').replaceChildren(Object.assign(doBtn('privacy-scope','quiet'),{}));$('topbar-actions').firstChild.setAttribute('aria-label','Alcance y datos que salen de aquí');",
    detect: report => report.duplicated.some(entry => entry.startsWith('privacy-scope') && entry.includes('hablado')) },
  { id: 'a-duplicate-action-inside-a-dialog', file: 'app.mjs',
    reason: 'una acción declarada se ofrece con otro nombre dentro de un diálogo, que es donde la recogida anterior nunca miraba',
    from: "  p('Compartir con un proveedor de IA es una acción aparte y tuya.",
    to: "  el('button',{type:'button',class:'quiet','data-action':'open-project-list',text:'Ver la lista de carpetas'}),\n  p('Compartir con un proveedor de IA es una acción aparte y tuya.",
    detect: report => report.duplicated.some(entry => entry.startsWith('open-project-list') && entry.includes('diálogo')) },
  { id: 'an-action-offered-under-an-undeclared-id', file: 'app.mjs',
    reason: 'un control declara una acción que no está en el conjunto cerrado',
    from: "actions(doBtn('prepare-project','primary')),",
    to: "actions(doBtn('prepare-project','primary'),el('button',{type:'button','data-action':'go-somewhere',text:'Volver al estado'})),",
    detect: report => report.undeclared.includes('go-somewhere') },
  { id: 'greeting-back-in-the-list-as-a-paragraph', file: 'app.mjs',
    reason: 'la lista de proyectos recupera un saludo explicativo',
    from: "el('h1',{tabindex:'-1',text:'Tus proyectos'}),",
    to: "el('h1',{tabindex:'-1',text:'Tus proyectos'}),p('Hola. Aquí están las carpetas que preparaste.','intro'),",
    detect: report => listOf(report).purity.stray.length > 0 },
  { id: 'greeting-back-in-the-list-as-a-div', file: 'app.mjs',
    reason: 'el mismo saludo, en un elemento que la comprobación anterior no miraba',
    from: "el('h1',{tabindex:'-1',text:'Tus proyectos'}),",
    to: "el('h1',{tabindex:'-1',text:'Tus proyectos'}),el('div',{class:'greet',text:'Hola. Aquí están tus carpetas.'}),",
    detect: report => listOf(report).purity.stray.length > 0 },
  { id: 'greeting-back-in-the-list-as-a-details', file: 'app.mjs',
    reason: 'el mismo saludo, plegado dentro de un details',
    from: "el('h1',{tabindex:'-1',text:'Tus proyectos'}),",
    to: "el('h1',{tabindex:'-1',text:'Tus proyectos'}),el('details',{},el('summary',{text:'Cómo funciona esto'}),p('Primero eliges una carpeta.')),",
    detect: report => listOf(report).purity.stray.length > 0 },
  { id: 'numbered-steps-back-in-the-list', file: 'app.mjs',
    reason: 'los tres pasos vuelven a la lista, como lista ordenada',
    from: "el('h1',{tabindex:'-1',text:'Tus proyectos'}),",
    to: "el('h1',{tabindex:'-1',text:'Tus proyectos'}),el('ol',{class:'method'},el('li',{text:'Elige tu carpeta'}),el('li',{text:'Revisa lo que cambia'})),",
    detect: report => listOf(report).purity.stray.length > 0 },
  { id: 'term-without-definition-on-inicio', file: 'app.mjs',
    reason: 'un término técnico vuelve a aparecer en Inicio como prosa',
    from: "term('openspec'),' si lo pides.", to: "'OpenSpec',' si lo pides.",
    detect: report => report.screens.inicio.vocabulary.missing.some(entry => entry.id === 'openspec') },
  { id: 'forbidden-word-on-the-help-screen', file: 'app.mjs',
    reason: 'una palabra de la jerga de este repositorio aparece en una pantalla que no es Inicio',
    from: "p('Cómo trabaja esta aplicación, qué quiere decir que algo esté listo",
    to: "p('El harness de esta aplicación, qué quiere decir que algo esté listo",
    detect: report => report.screens.ayuda.vocabulary.forbidden.includes('harness') },
  { id: 'term-as-prose-on-a-screen-with-no-control-for-it', file: 'app.mjs',
    reason: 'un término aparece como prosa en una pantalla donde su definición no se puede abrir',
    from: "p('Cómo trabaja esta aplicación, qué quiere decir que algo esté listo",
    to: "p('El inventario y el perfil de esta aplicación, qué quiere decir que algo esté listo",
    detect: report => report.screens.ayuda.vocabulary.missing.some(entry => entry.id === 'inventario') },
  { id: 'term-as-prose-inside-a-placeholder', file: 'app.mjs',
    reason: 'un término llega a la pantalla por un placeholder, que se dibuja pero no es textContent',
    from: "function input(id,value,max,change){const n=el('input',{type:'text',id,maxlength:max,required:true,value,",
    to: "function input(id,value,max,change){const n=el('input',{type:'text',id,maxlength:max,required:true,value,placeholder:'la firma de este archivo',",
    detect: report => anyScreen(report, screen => screen.vocabulary.missing.some(entry => entry.id === 'firma')).length > 0 },
  { id: 'term-as-prose-inside-an-aria-label', file: 'index.html',
    reason: 'un término llega a la pantalla por un aria-label, que es lo que dice un lector de pantalla, y este está en todas',
    from: 'aria-label="Navegación principal"', to: 'aria-label="Navegación principal y su inventario"',
    detect: report => anyScreen(report, screen => screen.vocabulary.missing.some(entry => entry.id === 'inventario')).length > 0 },
  { id: 'action-removed-from-the-page', file: 'app.mjs',
    reason: 'se retira la declaración de una acción, que es la forma de satisfacer la comprobación por omisión',
    from: "['open-start','open-project-list','prepare-project','open-help']",
    to: "['open-start','open-project-list','prepare-project']",
    detect: report => !report.actions.some(([id]) => id === 'open-help') },
  { id: 'glossary-stops-listing-every-term', file: 'app.mjs',
    reason: 'la ayuda deja de reunir todas las definiciones',
    from: 'GLOSSARY.flatMap(', to: 'GLOSSARY.slice(0,5).flatMap(',
    detect: report => report.glossaryEntries !== report.glossaryTerms },
  { id: 'state-text-loses-its-contrast', file: 'app.mjs',
    reason: 'el estado de cada proyecto se vuelve ilegible sobre su fondo',
    from: "el('p',{class:`project-state state-${project.state}`}",
    to: "el('p',{class:`project-state state-${project.state}`,style:'color:#c9d4c9'}",
    detect: report => listOf(report).accessibility.contrast.some(entry => entry.class?.includes('project-state')) },
  { id: 'contrast-broken-inside-the-definition-dialog', file: 'app.css',
    reason: 'el texto del diálogo que define un término se vuelve ilegible',
    from: 'dialog p,dialog li{line-height:1.6;font-size:.93rem}',
    to: 'dialog p,dialog li{line-height:1.6;font-size:.93rem;color:#e2e8e2}',
    detect: report => report.dialog.accessibility.contrast.length > 0 },
  { id: 'contrast-broken-on-the-persistent-navigation', file: 'app.css',
    reason: 'la navegación, que está en todas las pantallas, se vuelve ilegible',
    from: '.nav-button:hover{color:#b9e0c2}', to: '.nav-button{color:#2a3a2e}.nav-button:hover{color:#b9e0c2}',
    detect: report => anyScreen(report, screen => screen.accessibility.contrast.some(entry => entry.class?.includes('nav-button'))).length > 0 },
  { id: 'navigation-entries-break-mid-word', file: 'app.css',
    reason: 'las entradas de navegación vuelven a partirse por la mitad de una palabra en el ancho mínimo',
    from: '@media(max-width:650px){.sidebar nav{flex-wrap:wrap;gap:10px 18px}.nav-button{overflow-wrap:normal;word-break:keep-all;white-space:nowrap}}',
    to: '@media(max-width:650px){.sidebar nav{gap:20px}.nav-button{overflow-wrap:anywhere}}',
    detect: report => report.narrow.accessibility.brokenWords.length > 0 },
  { id: 'a-term-stops-being-a-control', file: 'glossary.mjs',
    reason: 'un término deja de poder activarse con el teclado y pasa a ser texto',
    from: "return el('button', { type: 'button', class: 'term', 'data-term': id,",
    to: "return el('span', { class: 'term', 'data-term': id,",
    detect: report => anyScreen(report, screen => screen.accessibility.terms !== screen.accessibility.termsReachable).length > 0 },
  { id: 'a-term-control-opens-another-concepts-definition', file: 'app.mjs',
    reason: 'un control dice una palabra y abre la definición de otra',
    from: "term('recuperacion'),': antes de tocar nada", to: "term('token','Recuperación'),': antes de tocar nada",
    detect: report => report.termLabelMismatches.length > 0
      || report.screens.ayuda?.feedback?.includes('no nombra el término')
      || report.rendererErrors.some(message => /no nombra el término/.test(message)) },
  { id: 'a-control-loses-its-accessible-name', file: 'app.mjs',
    reason: 'un control queda sin nombre accesible, así que con un lector de pantalla es inservible',
    from: "$('topbar-actions').replaceChildren(doBtn('privacy-scope','quiet'));",
    to: "$('topbar-actions').replaceChildren(el('button',{type:'button',class:'quiet','data-action':'privacy-scope'}));",
    detect: report => anyScreen(report, screen => screen.names.unnamed.length > 0).length > 0 },
  { id: 'the-boot-shell-loses-its-stated-cause', file: 'index.html',
    reason: 'si el módulo no carga, la ventana vuelve a quedar en blanco sin decir por qué',
    from: '<div id="view"><section class="panel boot" id="boot">', to: '<div id="view"><section hidden id="boot">',
    detect: report => report.brokenModule.bootText.length < 40 },
];

const types = { '.html': 'text/html', '.css': 'text/css', '.mjs': 'text/javascript' };
let breakModule = false;
const server = createServer(async (request, response) => {
  const name = request.url === '/' ? 'index.html' : request.url.slice(1);
  if (request.method !== 'GET' || !/^[a-z.]+$/.test(name) || !Object.hasOwn(types, path.extname(name))) {
    response.writeHead(404); response.end(); return;
  }
  // The one thing a static server has to be able to do here: refuse a module, so the shell a person is left
  // with when the application cannot load itself can be read.
  if (breakModule && name === 'glossary.mjs') { response.writeHead(404); response.end(); return; }
  const body = await readFile(path.join(ui, name)).catch(() => null);
  if (!body) { response.writeHead(404); response.end(); return; }
  response.setHeader('Content-Type', types[path.extname(name)]); response.end(body);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;

const { GLOSSARY, labelMatchesTerm, byId, FORBIDDEN_WORDS } = await import(pathToFileURL(path.join(source, 'glossary.mjs')).href);
const VOCABULARY = { terms: GLOSSARY.map(entry => ({ id: entry.id, forms: entry.forms, caseSensitive: !!entry.caseSensitive })),
  forbidden: FORBIDDEN_WORDS };
const pw = await import(process.env.PROJECT_OS_PLAYWRIGHT_MODULE
  ? pathToFileURL(process.env.PROJECT_OS_PLAYWRIGHT_MODULE).href : 'playwright');
const { chromium } = pw.default ?? pw;

const record = { date: new Date().toISOString(), source: portable(source),
  scope: 'El renderer real servido desde una copia, con el servicio nativo reemplazado por respuestas fijas. Cubre Inicio, Ayuda, la lista, el asistente, el diálogo de un término, el ancho mínimo, la lista vacía, un error del servicio y la ventana con su módulo roto. No demuestra el motor ni la aplicación instalada.',
  glossaryTerms: GLOSSARY.length, baseline: null, mutations: [], findings: [] };

// Fixed answers, so the renderer is the only thing under test. Three histories: one project prepared and
// read plus one on an unreachable share, an empty list, and a service that refuses.
const stub = mode => `window.companion={
  listProjects:async()=>(${mode === 'error'
    ? `{ok:false,error:{code:'HISTORY_INVALID',message:'No se puede leer el historial local.',action:'La carpeta de tus proyectos sigue intacta. Conserva el registro para recuperarlo.'}}`
    : mode === 'empty' ? '{ok:true,value:[]}'
    : `{ok:true,value:[
        {id:'11111111-1111-4111-8111-111111111111',name:'Carpeta de prueba',root:'C:/ruta/de/prueba',profile:'research',state:'context',recorded:true},
        {id:'22222222-2222-4222-8222-222222222222',name:'Carpeta en una unidad de red',root:'//servidor/compartido/proyecto',profile:'general',state:'unreadable',recorded:true,
          error:{code:'FOLDER_UNREACHABLE',message:'Esta carpeta no respondió a tiempo.',action:'Puede estar en una unidad de red o desconectada. Ábrelo para comprobarlo.'}}]}`}),
  onProgress:()=>()=>{}};`;

let browser;
async function probe(page) {
  return { vocabulary: await page.evaluate(UNDEFINED_VOCABULARY, VOCABULARY),
    accessibility: await page.evaluate(ACCESSIBILITY), names: await page.evaluate(ACCESSIBLE_NAMES),
    purity: await page.evaluate(LIST_PURITY),
    feedback: await page.locator('#feedback').innerText().catch(() => '') };
}
async function inspect(page) {
  const screens = {}, actions = new Map(), termLabels = [], unreachable = [];
  const collect = async where => {
    collectActionPairs(await page.evaluate(ACTION_PAIRS), actions, where);
    for (const pair of await page.evaluate(TERM_LABELS)) termLabels.push([where, ...pair]);
  };
  // Navigate by the declared action, not by the label: a renamed label used to break the harness's own
  // navigation, and a mutation that stops the harness is a mutation nobody observed.
  const go = async (action, heading) => {
    const control = page.locator(`#nav [data-action="${action}"], #view [data-action="${action}"]`).first();
    if (!await control.count()) return false;
    await control.click();
    if (heading) {
      await page.getByRole('heading', { name: heading, exact: true }).waitFor({ timeout: 4000 })
        .catch(() => {});
    }
    return true;
  };
  const visit = async (where, action, heading) => {
    if (action && !await go(action, heading)) { unreachable.push(where); return; }
    await collect(where);
    screens[where] = await probe(page);
  };

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('#nav [data-action]').first().waitFor({ timeout: 10000 }).catch(() => {});
  await visit('inicio', null);
  await visit('ayuda', 'open-help', 'Ayuda');
  const glossaryEntries = await page.locator('#glosario dt').count();
  // The dialog a term opens is its own screen, and the central new mechanism of this change.
  let dialog = { title: null, opened: false };
  if (await page.locator('#view .term').count()) {
    await page.locator('#view .term').first().click();
    if (await page.getByRole('dialog').isVisible().catch(() => false)) {
      dialog = { title: await page.locator('#dialog-title').innerText(), opened: true, ...await probe(page) };
      await collect('diálogo de un término');
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.getElementById('dialog').open).catch(() => {});
    }
  }
  // The privacy dialog too: a review offered a declared action under a second name inside one.
  if (await page.locator('[data-action="privacy-scope"]').count()) {
    await page.locator('[data-action="privacy-scope"]').first().click();
    if (await page.getByRole('dialog').isVisible().catch(() => false)) {
      await collect('diálogo de privacidad');
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.getElementById('dialog').open).catch(() => {});
    }
  }
  await visit('asistente', 'prepare-project', 'Empecemos por lo que quieres lograr.');
  await visit('tus proyectos', 'open-project-list', 'Tus proyectos');
  // The minimum equivalent viewport, where four navigation entries have to stay readable.
  await page.setViewportSize({ width: 240, height: 410 });
  await page.waitForTimeout(300);
  const narrow = await probe(page);
  await page.setViewportSize({ width: 1180, height: 820 });
  return { screens, dialog, narrow, actions, termLabels, glossaryEntries, unreachable,
    glossaryTerms: GLOSSARY.length };
}
const flat = report => ({
  screens: report.screens, dialog: report.dialog, narrow: report.narrow, unreachable: report.unreachable,
  glossaryEntries: report.glossaryEntries, glossaryTerms: report.glossaryTerms,
  actions: [...report.actions].map(([action, names]) => [action, [...names.keys()]]),
  duplicated: duplicateActionNames(report.actions), undeclared: undeclaredActions(report.actions),
  termLabelMismatches: report.termLabels.filter(([, id, label]) => {
    const entry = byId.get(id);
    return !entry || !labelMatchesTerm(entry, label);
  }).map(([where, id, label]) => `${where}: "${label}" abre ${id}`),
  rendererErrors: [], brokenModule: { bootText: '' },
});

try {
  browser = await chromium.launch({ ...(process.platform === 'win32' ? { channel: 'msedge' } : {}), headless: true });
  const context = await browser.newContext({ viewport: { width: 1180, height: 820 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  let errors = [];
  page.on('pageerror', event => errors.push(event.message));
  await page.addInitScript(stub('filled'));

  // The shell a person is left with when the application cannot load its own module. Read once for the
  // baseline and once per mutation that names it.
  const readBrokenModule = async () => {
    breakModule = true;
    const broken = await browser.newContext({ viewport: { width: 1180, height: 820 }, reducedMotion: 'reduce' });
    const brokenPage = await broken.newPage();
    await brokenPage.addInitScript(stub('filled'));
    await brokenPage.goto(url, { waitUntil: 'networkidle' });
    const result = { bootText: (await brokenPage.locator('#view').innerText().catch(() => '')).replace(/\s+/g, ' ').trim(),
      navButtons: await brokenPage.locator('#nav button').count() };
    await broken.close();
    breakModule = false;
    return result;
  };

  const baseline = flat(await inspect(page));
  baseline.rendererErrors = [...errors];
  baseline.brokenModule = await readBrokenModule();
  record.baseline = baseline;
  const complain = value => record.findings.push(value);
  const everyScreen = { ...baseline.screens, 'diálogo de un término': baseline.dialog, 'ancho mínimo': baseline.narrow };
  for (const [where, screen] of Object.entries(everyScreen)) {
    if (!screen || screen.opened === false) { complain(`No se pudo inspeccionar ${where}`); continue; }
    for (const empty of vacuous(screen)) complain(`En ${where}, la comprobación no examinó nada: ${empty}`);
    for (const entry of screen.vocabulary.missing) complain(`En ${where} aparece "${entry.word}" y su definición no se puede abrir desde ahí · …${entry.context}…`);
    for (const word of screen.vocabulary.forbidden) complain(`En ${where} aparece "${word}", que no tiene definición y no debe aparecer`);
    for (const entry of screen.accessibility.contrast) complain(`Contraste en ${where}: ${entry.tag}.${entry.class} ${entry.ratio}:1 frente a ${entry.required}:1 ("${entry.text}")`);
    for (const problem of screen.accessibility.headingOrder) complain(`Encabezados en ${where}: ${problem}`);
    for (const broken of screen.accessibility.brokenWords) complain(`En ${where} una entrada se parte entre líneas: ${broken}`);
    if (screen.accessibility.terms !== screen.accessibility.termsReachable) complain(`En ${where} hay términos que no se activan con el teclado`);
    for (const control of screen.names.unnamed) complain(`En ${where} hay un control sin nombre accesible: ${control}`);
    if (!screen.names.navigationLabelled) complain(`En ${where} la navegación no tiene nombre accesible`);
    if (!screen.names.liveRegions) complain(`En ${where} no hay ninguna región en vivo para anunciar progreso o errores`);
  }
  if (baseline.unreachable.length) complain(`Pantallas que no se pudieron alcanzar: ${baseline.unreachable.join(', ')}`);
  if (!baseline.dialog.opened) complain('El diálogo de un término no se abrió');
  if (!baseline.dialog.names?.dialogNamed) complain('El diálogo no tiene nombre accesible');
  if (baseline.duplicated.length) complain(`Una acción con dos nombres: ${baseline.duplicated.join('; ')}`);
  if (baseline.undeclared.length) complain(`Acciones fuera del conjunto cerrado: ${baseline.undeclared.join(', ')}`);
  if (baseline.termLabelMismatches.length) complain(`Un control abre otra definición: ${baseline.termLabelMismatches.join('; ')}`);
  if (baseline.glossaryEntries !== GLOSSARY.length) complain(`El glosario lista ${baseline.glossaryEntries} de ${GLOSSARY.length} términos`);
  // This harness never reaches a project, so only the actions its screens can offer are expected here; the
  // closed set of all of them is asserted by the journey harness, which walks a real project.
  const REACHABLE_HERE = ['open-start', 'open-project-list', 'prepare-project', 'open-help', 'privacy-scope'];
  const absent = REACHABLE_HERE.filter(action => !baseline.actions.some(([id]) => id === action));
  if (absent.length) complain(`Acciones ausentes de estas pantallas: ${absent.join(', ')}`);
  const list = listOf(baseline);
  if (list.purity.stray.length) complain(`La lista muestra texto fuera de una tarjeta: ${list.purity.stray.join(' | ')}`);
  if (list.purity.cards !== 2) complain(`La lista no mostró las dos entradas del historial: ${list.purity.cards}`);
  if (!list.purity.textNodes) complain('La comprobación de la lista no leyó ningún texto');
  if (baseline.rendererErrors.length) complain(`Excepciones del renderer: ${baseline.rendererErrors.join(' | ')}`);
  if (baseline.brokenModule.bootText.length < 40) complain(`Con el módulo roto la ventana no dice qué pasó: "${baseline.brokenModule.bootText}"`);
  assert.deepEqual(baseline.actions.map(([id]) => id).filter(id => !EXPECTED_ACTIONS.includes(id)), [],
    'Every action a screen declares has to be in the closed set');

  // The empty and the error state of the destination this change makes the product's list.
  const states = {};
  for (const mode of ['empty', 'error']) {
    const other = await browser.newContext({ viewport: { width: 1180, height: 820 }, reducedMotion: 'reduce' });
    const otherPage = await other.newPage();
    const otherErrors = [];
    otherPage.on('pageerror', event => otherErrors.push(event.message));
    await otherPage.addInitScript(stub(mode));
    await otherPage.goto(url, { waitUntil: 'networkidle' });
    await otherPage.locator('#nav [data-action="open-project-list"]').click();
    await otherPage.waitForFunction(() => document.getElementById('content').getAttribute('aria-busy') !== 'true');
    states[mode] = { text: (await otherPage.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 400),
      feedbackVisible: await otherPage.locator('#feedback').isVisible(),
      offersTheAction: await otherPage.locator('#view [data-action="prepare-project"]').count() > 0,
      accessibility: (await probe(otherPage)).accessibility, rendererErrors: otherErrors };
    await other.close();
  }
  if (!/Aún no hay proyectos/.test(states.empty.text)) complain('La lista vacía no dice que está vacía');
  if (!states.empty.offersTheAction) complain('La lista vacía no ofrece la acción para empezar');
  if (!states.error.feedbackVisible) complain('Un error del servicio no se muestra al abrir la lista');
  if (!/historial local/.test(states.error.text)) complain('El error no explica qué pasó');
  for (const [mode, result] of Object.entries(states)) {
    for (const entry of result.accessibility.contrast) complain(`Contraste en la lista ${mode}: ${entry.tag}.${entry.class} ${entry.ratio}:1`);
    if (result.rendererErrors.length) complain(`Excepciones del renderer en la lista ${mode}: ${result.rendererErrors.join(' | ')}`);
  }
  record.states = { ...states,
    unreachableRowShowsItsCause: /no respondió a tiempo/.test(await page.locator('body').innerText()),
    brokenModule: baseline.brokenModule };
  if (!record.states.unreachableRowShowsItsCause) complain('La fila cuya carpeta no respondió no muestra su causa');

  record.constructionProbes = [];
  for (const probe of CONSTRUCTION_PROBES) {
    const target = path.join(ui, probe.file), original = pristine.get(probe.file);
    assert.ok(original.includes(probe.from), `La sonda ${probe.id} no encontró su punto de inserción.`);
    await writeFile(target, original.replace(probe.from, probe.to));
    let holds = false, by = null;
    try { holds = !!probe.holds(flat(await inspect(page))); }
    catch (error) { by = `no se pudo evaluar: ${String(error.message).split('\n')[0].slice(0, 160)}`; }
    record.constructionProbes.push({ id: probe.id, property: probe.property, holds, by });
    if (!holds) record.findings.push(`La construcción no se sostuvo en ${probe.id}${by ? `: ${by}` : ''}`);
    await writeFile(target, original);
  }

  for (const mutation of MUTATIONS) {
    const target = path.join(ui, mutation.file), original = pristine.get(mutation.file);
    assert.ok(original.includes(mutation.from), `La mutación ${mutation.id} no encontró su punto de inserción.`);
    await writeFile(target, original.replace(mutation.from, mutation.to));
    errors = [];
    let detected = false, observed = null, by = null;
    try {
      const report = flat(await inspect(page));
      report.rendererErrors = [...errors];
      report.brokenModule = mutation.id.includes('boot-shell') ? await readBrokenModule() : { bootText: 'x'.repeat(80) };
      detected = !!mutation.detect(report);
      by = detected ? 'la propiedad que nombra' : null;
      observed = { duplicated: report.duplicated, undeclared: report.undeclared,
        unreachable: report.unreachable, glossaryEntries: report.glossaryEntries,
        termLabelMismatches: report.termLabelMismatches, rendererErrors: report.rendererErrors,
        stray: listOf(report)?.purity.stray.length ?? null,
        vocabulary: Object.entries(report.screens).flatMap(([where, screen]) =>
          [...screen.vocabulary.missing.map(entry => `${where}:${entry.id}`),
            ...screen.vocabulary.forbidden.map(word => `${where}:${word}`)]),
        contrast: Object.entries(report.screens).flatMap(([where, screen]) =>
          screen.accessibility.contrast.map(entry => `${where}:${entry.class}:${entry.ratio}`))
          .concat(report.dialog.accessibility?.contrast.map(entry => `diálogo:${entry.class}:${entry.ratio}`) ?? []),
        brokenWords: report.narrow.accessibility.brokenWords,
        unnamed: Object.entries(report.screens).flatMap(([where, screen]) => screen.names.unnamed.map(c => `${where}:${c}`)),
        termsUnreachable: Object.entries(report.screens).filter(([, screen]) => screen.accessibility.terms !== screen.accessibility.termsReachable).map(([where]) => where),
        bootText: report.brokenModule.bootText.length };
    } catch (error) {
      // An exception is NOT a detection. A previous version credited three mutations to a thirty-second
      // harness timeout, and a regression in those three probes would have read "detected" just the same.
      detected = false;
      by = `la comprobación no pudo evaluarse: ${String(error.message).split('\n')[0].slice(0, 200)}`;
    }
    record.mutations.push({ id: mutation.id, reason: mutation.reason, note: mutation.note ?? null, detected, by, observed });
    if (!detected) record.findings.push(`La mutación ${mutation.id} no fue detectada por su propiedad${by ? `: ${by}` : ''}`);
    await writeFile(target, original);
  }
} finally {
  await browser?.close().catch(() => {});
  await new Promise(resolve => server.close(resolve));
  assert(path.dirname(temp) === await realpath(tmpdir()) && path.basename(temp).startsWith('peos-contract-'));
  await rm(temp, { recursive: true, force: true });
}

record.summary = { mutations: record.mutations.length,
  detected: record.mutations.filter(entry => entry.detected).length,
  constructionProbes: record.constructionProbes?.length ?? 0,
  constructionHeld: record.constructionProbes?.filter(entry => entry.holds).length ?? 0,
  findings: record.findings.length,
  screens: Object.keys(record.baseline.screens).length + 5,
  denominators: Object.fromEntries(Object.entries(record.baseline.screens)
    .map(([where, screen]) => [where, { contrast: screen.accessibility.measured, vocabularyChars: screen.vocabulary.examinedChars, controls: screen.names.controls }])) };
await writeFile(path.join(output, 'interface-contract.json'), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify({ ...record.summary, actions: record.baseline.actions.length }, null, 2));
if (record.findings.length) { console.error(JSON.stringify(record.findings, null, 2)); process.exitCode = 1; }
