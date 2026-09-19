import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { cp, mkdir, mkdtemp, readFile, writeFile, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { portable } from './portable-path.mjs';
import { ACTION_PAIRS, UNDEFINED_VOCABULARY, TERM_LABELS, LIST_PURITY, ACCESSIBILITY, ACCESSIBLE_NAMES,
  EXPECTED_ACTIONS, collectActionPairs, duplicateActionNames, undeclaredActions, vacuous,
  ROW_ACTION_PAIRS, ROW_MENUS, READY_CLAIMS, GUIDE, ACTION_COUNTS, EXPECTED_ROW_ACTIONS,
  rowMenuProblems, readyProblems, guideProblems, repeatedActions, INTERACTIVE, REACH, reachProblems } from './interface-contract.mjs';

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
  { id: 'the-provider-model-list-looks-chosen-before-the-choice-is-saved', file: 'app.mjs',
    reason: 'la lista muestra el primer modelo como elegido aunque el servicio conserva otro valor, y elegir ese primer elemento no dispara ningún cambio',
    from: "Object.fromEntries([['','Elige un modelo'],...state.providerModels.models.map(id=>[id,id])])",
    to: 'Object.fromEntries(state.providerModels.models.map(id=>[id,id]))',
    detect: report => report.providerModelSelection?.value !== ''
      || report.providerModelSelection?.options?.[0]?.value !== '' },
  // The state of a listed project, and what a mark on it is allowed to claim. Every one of these is a way the
  // row could go back to asserting more than the check found.
  { id: 'a-ready-mark-on-a-project-that-is-not-ready', file: 'app.mjs',
    reason: 'la marca de listo aparece en una fila cuyo estado no es verificado',
    from: "text:project.state==='verified'?'\u2713':project.state==='unreadable'?'!':'\u25cb'",
    to: "text:project.state==='unreadable'?'!':'\u2713'",
    detect: report => readyProblems(listOf(report).claims).some(entry => entry.includes('marca de listo en')) },
  { id: 'a-ready-row-that-stops-saying-what-it-did-not-check', file: 'app.mjs',
    reason: 'la fila lista deja de decir que no vuelve a leer los archivos de la persona',
    from: "?[`Comprobado el ${when} contra esta carpeta. No vuelve a leer tus archivos, ni comprueba el `,",
    to: "?[`Comprobado el ${when} contra esta carpeta. Todo revisado, incluido el `,",
    detect: report => readyProblems(listOf(report).claims).some(entry => entry.includes('sin decir qué no comprobó')) },
  { id: 'the-qualifier-made-smaller-than-the-state-it-qualifies', file: 'app.css',
    reason: 'la aclaración de dónde sale el estado se dibuja más chica que el estado',
    from: '.project-state .recorded{display:block;margin-top:3px;font-size:inherit}',
    to: '.project-state .recorded{display:block;margin-top:3px;font-size:.72em}',
    detect: report => readyProblems(listOf(report).claims).some(entry => entry.includes('más chica que el estado')) },
  { id: 'a-row-that-stops-saying-when-it-was-checked', file: 'app.mjs',
    reason: 'la fila muestra un estado que viene de una comprobación sin decir cuándo fue',
    from: "?[`Comprobado el ${when}. Ábrelo para continuar donde quedó.`]",
    to: "?['Ábrelo para continuar donde quedó.']",
    detect: report => readyProblems(listOf(report).claims).some(entry => entry.includes('no dice cuándo se comprobó')) },
  { id: 'an-internal-name-where-a-stage-should-be-named', file: 'app.mjs',
    reason: 'la fila enumera lo que falta con el nombre interno de la etapa en vez de con palabras',
    from: "  :stageWords[id]??'una parte que no reconocemos';",
    to: "  :id;",
    detect: report => readyProblems(listOf(report).claims).some(entry => entry.includes('nombre interno de una etapa')) },
  { id: 'a-row-that-stops-naming-what-is-missing', file: 'app.mjs',
    reason: 'la fila dice que falta algo y no nombra qué',
    from: "    const stages=project.state==='changed'?project.changed:project.state==='incomplete'?project.missing:[];",
    to: "    const stages=[];",
    detect: report => readyProblems(listOf(report).claims).some(entry => entry.includes('no nombra qué le falta')) },
  { id: 'the-only-way-to-open-a-project-moves-into-the-secondary-menu', file: 'app.mjs',
    reason: 'el único control que abre el proyecto pasa a vivir dentro del menú secundario, dentro del encabezado de la tarjeta',
    from: "el('h2',{},rowBtn('open-project',project,'card-open',own(project.name,'span',{class:'card-name'})))",
    to: "el('h2',{},el('details',{class:'more'},el('summary',{text:'Abrir'}),rowBtn('open-project',project,'card-open',own(project.name,'span',{class:'card-name'}))))",
    detect: report => rowMenuProblems(listOf(report).rows).some(entry => entry.includes('open-project solo vive en el menú')) },
  { id: 'the-code-map-control-offered-twice-on-one-screen', file: 'app.mjs',
    reason: 'la guía ofrece el paso del mapa de código y el panel del mapa lo ofrece otra vez en la misma pantalla',
    from: "      actions(once('review-code-map'),s.code?.status==='verified'?btn('Buscar símbolos'",
    to: "      actions(doBtn('review-code-map'),s.code?.status==='verified'?btn('Buscar símbolos'",
    detect: report => (report.screens['mi proyecto']?.repeated ?? []).some(entry => entry.startsWith('review-code-map')) },
  // The controls that act on one listed project: their names, and where they live.
  { id: 'opening-a-project-offered-again-under-another-name', file: 'app.mjs',
    reason: 'abrir el proyecto se ofrece por segunda vez, con otro nombre, dentro del menú secundario',
    from: "el('div',{class:'more-actions'},rowBtn('duplicate-project',project),rowBtn('forget-project',project))",
    to: "el('div',{class:'more-actions'},el('button',{type:'button',class:'quiet','data-row-action':'open-project',text:'Ver este proyecto'}),rowBtn('duplicate-project',project),rowBtn('forget-project',project))",
    detect: report => report.rowDuplicated.some(entry => entry.startsWith('open-project')) },
  { id: 'the-card-stops-being-the-control-that-opens-the-project', file: 'app.mjs',
    reason: 'la tarjeta deja de abrir el proyecto y no queda ningún control que lo abra',
    from: "el('h2',{},rowBtn('open-project',project,'card-open',own(project.name,'span',{class:'card-name'})))",
    to: "el('h2',{},own(project.name,'span',{class:'card-name'}))",
    detect: report => rowMenuProblems(listOf(report).rows).some(entry => entry.includes('la tarjeta no abre el proyecto')) },
  { id: 'a-row-action-outside-the-declared-set', file: 'app.mjs',
    reason: 'una acción de fila se ofrece con un identificador que no está declarado',
    from: "el('div',{class:'more-actions'},rowBtn('duplicate-project',project)",
    to: "el('div',{class:'more-actions'},el('button',{type:'button',class:'quiet','data-row-action':'archive-project',text:'Archivar'}),rowBtn('duplicate-project',project)",
    detect: report => report.rowUndeclared.includes('archive-project')
      && rowMenuProblems(listOf(report).rows).some(entry => entry.includes('acción sin declarar')) },
  { id: 'the-same-row-action-in-two-controls-of-one-card', file: 'app.mjs',
    reason: 'la misma acción de fila se dibuja dos veces en una tarjeta, con el mismo nombre',
    from: "rowBtn('duplicate-project',project),rowBtn('forget-project',project))",
    to: "rowBtn('duplicate-project',project),rowBtn('forget-project',project),rowBtn('forget-project',project))",
    detect: report => rowMenuProblems(listOf(report).rows).some(entry => entry.includes('forget-project en 2 controles')) },
  // The guidance inside a project.
  { id: 'a-guide-step-without-its-reason', file: 'app.mjs',
    reason: 'un paso de la guía deja de decir por qué está ahí',
    from: "        el('h3',{text:step.title}),p(step.why),",
    to: "        el('h3',{text:step.title}),p(''),",
    detect: report => guideProblems(report.screens['mi proyecto']?.guide).some(entry => entry.includes('sin título o sin motivo')) },
  { id: 'a-guide-step-whose-text-cannot-be-copied', file: 'app.mjs',
    reason: 'el paso muestra el texto para dar a la IA y quita la forma de copiarlo',
    from: "        step.prompt?[el('pre',{class:'prompt',text:step.prompt}),\n          actions(btn('Copiar este paso',",
    to: "        step.prompt?[el('pre',{class:'prompt',text:step.prompt}),false&&\n          actions(btn('Copiar este paso',",
    detect: report => guideProblems(report.screens['mi proyecto']?.guide).some(entry => entry.includes('texto sin forma de copiarlo')) },
  { id: 'a-guide-that-drops-the-definitions-of-its-own-words', file: 'app.mjs',
    reason: 'la guía usa palabras del glosario y deja de ofrecer sus definiciones en esa pantalla',
    from: "    guide.terms.length?el('p',{class:'subtle'},'Qué significan estas palabras: '",
    to: "    false?el('p',{class:'subtle'},'Qué significan estas palabras: '",
    detect: report => (report.screens['mi proyecto']?.vocabulary.missing ?? []).length > 0 },
  { id: 'the-same-action-in-two-controls-of-one-screen', file: 'app.mjs',
    reason: 'la guía ofrece un paso pendiente y otro panel ofrece la misma acción otra vez en la misma pantalla',
    from: "actions(once('read-files','primary'),doBtn('recheck-project')",
    to: "actions(doBtn('read-files','primary'),doBtn('recheck-project')",
    detect: report => (report.screens['mi proyecto']?.repeated ?? []).some(entry => entry.startsWith('read-files')) },
  { id: 'two-names-for-one-action-deeper-in-the-wizard', file: 'app.mjs',
    reason: 'una acción declarada se ofrece con otro nombre en una pantalla del asistente',
    from: "wizardBar(doBtn('open-start'),el('button',{type:'submit',form:'setup-form',class:'primary',text:'Elegir carpeta  →'})));",
    to: "wizardBar(doBtn('open-start'),el('button',{type:'button',class:'secondary','data-action':'prepare-project',text:'Preparar una carpeta'}),el('button',{type:'submit',form:'setup-form',class:'primary',text:'Elegir carpeta  →'})));",
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
    to: "el('p',{class:`project-state state-${project.state}`,style:'color:#1a2030'}",
    detect: report => listOf(report).accessibility.contrast.some(entry => entry.class?.includes('project-state')) },
  { id: 'contrast-broken-inside-the-definition-dialog', file: 'app.css',
    reason: 'el texto del diálogo que define un término se vuelve ilegible',
    from: 'dialog p,dialog li{line-height:1.6;font-size:.93rem}',
    to: 'dialog p,dialog li{line-height:1.6;font-size:.93rem;color:#182236}',
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
  // The defect of Companion 0.3.1, restored exactly: the final bar back inside the animated content and the rule
  // that fixed it there. With reduced motion there is no transform, the bar is fixed to the window and every
  // control can still be reached, which is how both harnesses passed it; with motion it covers the installation
  // buttons. Detection has to come from interception on a screen that was actually visited.
  { id: 'the-final-bar-fixed-again-inside-the-animated-content', wizard: true,
    reason: 'la barra final vuelve a estar dentro de .enter con position:fixed, y la animación con transform la ancla al contenido',
    patches: [
      { file: 'app.mjs', from: "[el('div',{class:'enter'},content),bar].filter(Boolean)", to: "[el('div',{class:'enter'},content,bar)].filter(Boolean)" },
      { file: 'app.css',
        from: '.wizard-footer{position:sticky;bottom:0;z-index:10;margin-top:28px;padding:18px 0;background:rgba(11,15,25,0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:1px solid var(--line);box-shadow:0 -8px 24px rgba(0,0,0,0.5)}main#content:has(>#view>.wizard-footer){padding-bottom:0}main#content:has(>#view>.wizard-footer) .notice:empty{margin:0;min-height:0}html{scroll-padding-bottom:var(--wizard-footer-height,0px)}',
        to: 'main:has(.steps){padding-bottom:145px}main:has(.steps) #view .enter>.actions,main:has(.steps) #view form>.actions{position:fixed;bottom:0;left:0;right:0;margin:0;padding:18px clamp(24px,4.4vw,70px);background:rgba(11,15,25,0.92);backdrop-filter:blur(12px);border-top:1px solid var(--line);box-shadow:0 -8px 24px rgba(0,0,0,0.5);z-index:10}' }],
    detect: report => (report.wizard ?? []).some(run => run.motion === 'no-preference' && run.visited.includes('install')
      && run.problems.some(problem => problem.startsWith('install: «') && problem.includes('no se puede pulsar')
        && /Instalar stack base|Preparar carpeta y generar/.test(problem))) },
  { id: 'install-and-finished-drop-the-preparation-pill', file: 'app.mjs', wizard: true,
    reason: 'la navegación deja de marcar «Preparar proyecto» en instalación y en la pantalla final',
    from: "const WIZARD_PAGES=['setup','folder','delimitation','vision','install','finished','stack-choice','ready'];",
    to: "const WIZARD_PAGES=['setup','folder','delimitation','vision','stack-choice','ready'];",
    detect: report => (report.wizard ?? []).some(run => run.visited.includes('install')
      && run.problems.some(problem => problem.startsWith('install:') && problem.includes('«prepare-project» declara aria-pressed="false"'))) },
  { id: 'a-refused-copy-is-swallowed-and-announced-anyway', file: 'app.mjs', copies: true,
    reason: 'un rechazo del portapapeles vuelve a quedar en un catch vacío y la pantalla anuncia la copia igual',
    from: "      await call('copyText', { text });\n      notice(announce);",
    to: "      try { await call('copyText', { text }); } catch {}\n      notice(announce);",
    detect: report => copyProblems(report.copies).some(problem => problem.startsWith('refused')) },
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
  scope: 'El renderer real servido desde una copia, con el servicio nativo reemplazado por respuestas fijas. Cubre Inicio, Ayuda, la lista, el asistente, un proyecto, su panel de IA, la revisión de tecnología, el diálogo de un término, el ancho mínimo, la lista vacía, un error del servicio y la ventana con su módulo roto. Recorre además el asistente vigente hasta la pantalla final en tres ventanas, con movimiento normal y reducido, y los dos controles de copia ante un éxito, un rechazo y un fallo del transporte. No demuestra el motor, Electron ni la aplicación instalada.',
  glossaryTerms: GLOSSARY.length, baseline: null, mutations: [], findings: [] };

// Fixed answers, so the renderer is the only thing under test. Three histories: one project prepared and
// read plus one on an unreachable share, an empty list, and a service that refuses.
// Three rows, because the states the list has to tell apart are the point: one verified against the folder,
// one checked and missing something, one whose records could not be read at all. The project screen is
// stubbed too — the renderer's own properties are what these mutations break, and the real payloads are
// walked by the journey harness against the real service.
const SELECTION = `{name:'Carpeta de prueba',profile:'software',agents:['web'],experience:'guided',role:'developer',goal:'Comparar evidencia sobre tokens medidos'}`;
const CHECKED = `'2026-09-12T10:00:00.000Z'`;
const STATUS = `{project:{id:'11111111-1111-4111-8111-111111111111',name:'Carpeta de prueba',root:'C:/ruta/de/prueba',selection:${SELECTION}},
  base:{base:'prepared',inventory:'stale',selection:${SELECTION}},
  context:{context:'not-prepared'},environment:{status:'prepared'},code:{status:'stale',message:'Tus archivos cambiaron después de crearlo.'},
  capabilities:{environment:true,codeGraph:true},
  engineering:{files:'prepared',workflows:'verified'},externalTools:'not-verified',
  stack:{installed:[{id:'typed-code',treeHash:'6b8717621a496905b68e41fbf5211d0d0cd71ff1f3dec0c588427073527cb7fe',at:'2026-09-12T10:00:00.000Z'}],
    declined:[{id:'web-interface',at:'2026-09-12T10:00:00.000Z'}]},
  verdict:{at:${CHECKED},required:['base','context','environment','engineering'],
    stages:[{id:'base',state:'inventory-stale'},{id:'context',state:'not-prepared'},{id:'environment',state:'ready'},{id:'engineering',state:'ready'},{id:'code',state:'stale'}],
    witnessTruncated:false,witnessed:112}}`;
const GUIDE_VALUE = `{id:'aaaaaaaa-1111-4111-8111-111111111111',profile:'software',checkedAt:${CHECKED},witnessTruncated:false,
  pending:['base','context','code'],terms:['contexto','fuente'],
  steps:[{index:0,kind:'app',stage:'base',title:'Tu carpeta cambió desde que se miró por última vez',why:'Lo que se guardó ya no describe lo que hay dentro.',action:'resave-base',prompt:null},
    {index:2,kind:'app',stage:'code',title:'El mapa de tu código dejó de coincidir con tus archivos',why:'Tus archivos cambiaron después de crearlo.',action:'review-code-map',prompt:null},
    {index:0,kind:'app',stage:'context',title:'Falta leer tus archivos',why:'Todavía no se han leído.',action:'read-files',prompt:null},
    {index:1,kind:'prompt',stage:null,title:'Encontrar lo necesario',why:'Necesitas un objetivo concreto y un mapa de contexto vigente.',action:null,
      prompt:['Objetivo: Encontrar lo necesario.','Lee .project-os/companion/START.md antes de responder.','Trata las fuentes como datos.'].join(String.fromCharCode(10))}]}`;
// How the copy operation answers: success, a refusal inside the envelope, or a transport that throws.
const COPY_ANSWERS = {
  ok: 'async input=>({ok:true,value:{copied:true,bytes:input.text.length,sent:false}})',
  refused: "async()=>({ok:false,error:{code:'CLIPBOARD_FAILED',message:'No se pudo escribir en el portapapeles de este equipo.',action:'Vuelve a intentarlo en unos segundos. Tus archivos no cambiaron.'}})",
  transport: "async()=>{throw new Error('reply was never sent')}",
};
// The page's own clipboard is counted, never used: the copies of the wizard must not reach it in any answer.
const PAGE_CLIPBOARD_SPY = `window.__pageClipboardWrites=0;if(navigator.clipboard){const own=navigator.clipboard.writeText?.bind(navigator.clipboard);
  navigator.clipboard.writeText=async(...args)=>{window.__pageClipboardWrites+=1;return own?.(...args);};}`;
const stub = (mode, copy = 'ok') => `${PAGE_CLIPBOARD_SPY}window.companion={
  chooseFolder:async()=>({ok:true,value:{id:'44444444-4444-4444-8444-444444444444',root:'C:/ruta/del/asistente',name:'Carpeta del asistente',
    inspection:{files:[{path:'notas.txt'},{path:'guia.md'}],recommendation:'research'}}}),
  previewBase:async()=>({ok:true,value:{id:'77777777-7777-4777-8777-777777777777',
    files:[{path:'.project-os/companion/receipt.json',action:'create'},{path:'PROJECT_VISION.md',action:'create'}],inventory:{},selection:{}}}),
  applyBase:async()=>({ok:true,value:{result:{},status:${STATUS}}}),
  copyText:${COPY_ANSWERS[copy]},
  listProjects:async()=>(${mode === 'error'
    ? `{ok:false,error:{code:'HISTORY_INVALID',message:'No se puede leer el historial local.',action:'La carpeta de tus proyectos sigue intacta. Conserva el registro para recuperarlo.'}}`
    : mode === 'empty' ? '{ok:true,value:[]}'
    : `{ok:true,value:[
        {id:'11111111-1111-4111-8111-111111111111',name:'Carpeta de prueba',root:'C:/ruta/de/prueba',profile:'research',selection:${SELECTION},
          state:'verified',recorded:true,checkedAt:${CHECKED},missing:[],changed:[]},
        {id:'33333333-3333-4333-8333-333333333333',name:'Carpeta a medio preparar',root:'C:/ruta/a/medias',profile:'software',selection:${SELECTION},
          state:'incomplete',recorded:true,checkedAt:${CHECKED},missing:['context','code'],changed:[]},
        {id:'22222222-2222-4222-8222-222222222222',name:'Carpeta en una unidad de red',root:'//servidor/compartido/proyecto',profile:'general',selection:null,
          state:'unreadable',recorded:true,checkedAt:null,missing:[],changed:[],
          error:{code:'FOLDER_UNREACHABLE',message:'Esta carpeta no respondió a tiempo.',action:'Puede estar en una unidad de red o desconectada. Ábrelo para comprobarlo.'}}]}`}),
  openProject:async()=>({ok:true,value:${STATUS}}),
  status:async()=>({ok:true,value:${STATUS}}),
  guide:async()=>({ok:true,value:${GUIDE_VALUE}}),
  copyGuideStep:async()=>({ok:true,value:{copied:true,step:1,bytes:180,sent:false}}),
  previewStack:async()=>({ok:true,value:{kind:'recommended',because:'Tu carpeta ya tiene 1 archivo de interfaz con React.',
    id:'55555555-5555-4555-8555-555555555555',
    items:[{id:'web-interface',name:'Interfaz web con React',purpose:'Construir pantallas web con componentes.',
      packages:[{name:'react',version:'19.2.0',license:'MIT'},{name:'react-dom',version:'19.2.0',license:'MIT'},{name:'scheduler',version:'0.27.0',license:'MIT'}],
      licenses:['MIT'],closure:3,downloadBytes:1311203,installedBytes:7576468,files:88,destination:'.project-os/stack/web-interface',status:'missing'}],
    notOffered:[{id:'flutter',name:'Flutter',from:'Google, como SDK propio de más de un gigabyte',reason:'Llega con su propio instalador y su propio proceso de actualización, no como dependencias que se puedan revisar con un lockfile.'}]}}),
  declineStack:async()=>({ok:true,value:{declined:[{id:'web-interface',at:${CHECKED}}],status:${STATUS}}}),
  stackCatalog:async()=>({ok:true,value:{stacks:[
    {id:'web-interface',name:'Interfaz web con React',purpose:'Construir pantallas web con componentes.',profiles:['software'],licenses:['MIT'],closure:3,downloadBytes:1311203,installedBytes:7576468,destination:'.project-os/stack/web-interface'},
    {id:'typed-code',name:'TypeScript',purpose:'Escribir código con tipos y comprobarlo antes de ejecutarlo.',profiles:['software'],licenses:['Apache-2.0'],closure:1,downloadBytes:4377468,installedBytes:23626590,destination:'.project-os/stack/typed-code'}],
    notOffered:[{id:'flutter',name:'Flutter',from:'Google, como SDK propio de más de un gigabyte',reason:'Llega con su propio instalador, no como dependencias revisables.'}]}}),
  inferenceStatus:async()=>({ok:true,value:{level:'provider',provider:'groq',model:'',hasKey:true,keySaved:false,
    levels:[{id:'off',label:'Solo plantillas, en este equipo'},{id:'local',label:'Un modelo en tu equipo'},{id:'provider',label:'Un proveedor gratuito, con tu clave'},{id:'own-key',label:'Tu proveedor, con tu clave'}],
    providers:[{id:'cerebras',label:'Cerebras',origin:'https://api.cerebras.ai'},{id:'groq',label:'Groq',origin:'https://api.groq.com'}],
    local:{available:false,models:[],origin:null},sends:['tu objetivo y tu perfil'],neverSends:['el contenido de cualquier archivo']}}),
  promptPreview:async()=>({ok:true,value:{usedLevel:'off',levelLabel:'Solo plantillas, en este equipo',fromModel:false,
    reason:'sin modelo',text:'## Instrucciones\\n\\nTexto de prueba.',pending:[],notes:null}}),
  providerModels:async()=>({ok:true,value:{provider:'groq',models:['llama-3.3-70b','qwen-3-32b'],reason:null,elapsedMs:12}}),
  setInference:async input=>({ok:true,value:{...input,hasKey:true,keySaved:false}}),
  onProgress:()=>()=>{}};`;

let browser;
async function probe(page) {
  return { vocabulary: await page.evaluate(UNDEFINED_VOCABULARY, VOCABULARY),
    accessibility: await page.evaluate(ACCESSIBILITY), names: await page.evaluate(ACCESSIBLE_NAMES),
    purity: await page.evaluate(LIST_PURITY), claims: await page.evaluate(READY_CLAIMS),
    rows: await page.evaluate(ROW_MENUS), guide: await page.evaluate(GUIDE),
    repeated: repeatedActions(await page.evaluate(ACTION_COUNTS)),
    feedback: await page.locator('#feedback').innerText().catch(() => '') };
}
async function inspect(page) {
  const screens = {}, actions = new Map(), rowActions = new Map(), termLabels = [], unreachable = [];
  let providerModelSelection = null;
  const collect = async where => {
    collectActionPairs(await page.evaluate(ACTION_PAIRS), actions, where);
    collectActionPairs(await page.evaluate(ROW_ACTION_PAIRS), rowActions, where);
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
  // The project screen, reached the way a person reaches it: by its own card. Stubbed payloads, because what
  // these mutations break is the renderer — the real ones are walked by the journey harness.
  // A mutation may make the card unreachable — that is one of the mutations — so the click may not be
  // allowed to stop the run. A screen that cannot be reached is recorded as unreachable and the screens
  // already collected keep their probes, which is where the list's own properties are read.
  const card = page.locator('article.project .card-open').first();
  const opened = await card.count()
    ? await card.click({ timeout: 4000 }).then(() => true, () => false)
    : false;
  if (opened) {
    await page.waitForFunction(() => document.getElementById('content').getAttribute('aria-busy') !== 'true').catch(() => {});
    if (await page.locator('.guide').count()) { await collect('mi proyecto'); screens['mi proyecto'] = await probe(page); }
    else unreachable.push('mi proyecto');
    const toHandoff = page.getByRole('button', { name: 'Continuar con mi IA', exact: true });
    const reachedHandoff = await toHandoff.count()
      ? await toHandoff.click({ timeout: 4000 }).then(() => true, () => false)
      : false;
    if (reachedHandoff) {
      await page.getByRole('heading', { name: 'Quién escribe estas instrucciones', exact: true })
        .waitFor({ timeout: 4000 }).catch(() => {});
      const fetchModels = page.getByRole('button', { name: 'Buscar los modelos de mi proveedor', exact: true });
      if (await fetchModels.count()) {
        await fetchModels.click();
        await page.waitForFunction(() => document.getElementById('content').getAttribute('aria-busy') !== 'true');
        const model = page.locator('#inference-model');
        if (await model.evaluate(node => node.tagName === 'SELECT').catch(() => false)) {
          providerModelSelection = {
            value: await model.inputValue(),
            options: await model.locator('option').evaluateAll(nodes => nodes.map(node => ({ value: node.value, label: node.textContent }))),
          };
          await collect('tu IA');
          screens['tu IA'] = await probe(page);
        }
      }
      await page.getByRole('button', { name: 'Estado', exact: true }).click().catch(() => {});
      await page.waitForFunction(() => document.getElementById('content').getAttribute('aria-busy') !== 'true').catch(() => {});
    } else unreachable.push('tu IA');
    // The technology review, reached the way a person reaches it. An independent review pointed out that the
    // stub answered `stackCatalog` but not `previewStack`, so this screen never rendered here and stayed out of
    // the names-and-counts table even though the journey harness walked it.
    const toStack = page.locator('#view [data-action="review-stack"]').first();
    const reachedStack = await toStack.count()
      ? await toStack.click({ timeout: 4000 }).then(() => true, () => false)
      : false;
    if (reachedStack) {
      await page.waitForFunction(() => document.getElementById('content').getAttribute('aria-busy') !== 'true').catch(() => {});
      if (await page.locator('#view .path').count()) { await collect('tecnología'); screens['tecnología'] = await probe(page); }
      else unreachable.push('tecnología');
    } else unreachable.push('tecnología');
    await page.locator('#nav [data-action="open-project-list"]').click().catch(() => {});
    await page.waitForFunction(() => document.getElementById('content').getAttribute('aria-busy') !== 'true').catch(() => {});
  } else unreachable.push('mi proyecto');
  // The minimum equivalent viewport, where four navigation entries have to stay readable.
  await page.setViewportSize({ width: 240, height: 410 });
  await page.waitForTimeout(300);
  const narrow = await probe(page);
  await page.setViewportSize({ width: 1180, height: 820 });
  return { screens, dialog, narrow, actions, rowActions, termLabels, glossaryEntries, unreachable, providerModelSelection,
    glossaryTerms: GLOSSARY.length };
}
const flat = report => ({
  screens: report.screens, dialog: report.dialog, narrow: report.narrow, unreachable: report.unreachable,
  providerModelSelection: report.providerModelSelection,
  glossaryEntries: report.glossaryEntries, glossaryTerms: report.glossaryTerms,
  actions: [...report.actions].map(([action, names]) => [action, [...names.keys()]]),
  duplicated: duplicateActionNames(report.actions), undeclared: undeclaredActions(report.actions),
  rowActions: [...report.rowActions].map(([action, names]) => [action, [...names.keys()]]),
  rowDuplicated: duplicateActionNames(report.rowActions),
  rowUndeclared: [...report.rowActions.keys()].filter(action => !EXPECTED_ROW_ACTIONS.includes(action)),
  termLabelMismatches: report.termLabels.filter(([, id, label]) => {
    const entry = byId.get(id);
    return !entry || !labelMatchesTerm(entry, label);
  }).map(([where, id, label]) => `${where}: "${label}" abre ${id}`),
  rendererErrors: [], brokenModule: { bootText: '' },
});

// The current wizard, walked with fixed answers in the three window sizes of the maintainer's report, with the
// entry animation running and again with reduced motion. The journey harness walks it against the real service;
// this walk exists so that a mutation of the renderer is measured by the same probe. A screen that is not reached
// is recorded as such, and only interception on a screen that was visited counts as detecting the bar defect.
const WIZARD_WINDOWS = [[1180, 820], [1160, 810], [1040, 700]];
const WIZARD_STEPS = [
  { screen: 'setup', heading: 'Empecemos por lo que quieres lograr.', primary: ['Inicio', 'Elegir carpeta →'], next: 'Elegir carpeta →' },
  { screen: 'folder', heading: 'Tu trabajo empieza en una carpeta.', primary: ['Volver', 'Continuar a delimitación →', 'Revisar preparación →'], next: 'Continuar a delimitación →' },
  { screen: 'delimitation', heading: '¿Cuál es el enfoque principal de tu proyecto?', primary: ['Volver', 'Paso 3: Visión y Descripción →'], next: 'Paso 3: Visión y Descripción →' },
  { screen: 'vision', heading: 'Cuéntanos en tus palabras: ¿qué quieres lograr?', primary: ['Volver', 'Paso 4: Instalación →'], next: 'Paso 4: Instalación →' },
  { screen: 'install', heading: 'Tu espacio está listo. ¿Cómo prefieres equiparlo?', primary: ['Volver', 'Instalar stack base y obtener prompt →', 'Preparar carpeta y generar prompt maestro →'], next: 'Preparar carpeta y generar prompt maestro →' },
];
const FINISHED = '¡Tu proyecto está listo para cobrar vida!';
const settled = page => page.waitForFunction(() => document.getElementById('content').getAttribute('aria-busy') !== 'true'
  && !(document.querySelector('#view .enter')?.getAnimations() ?? []).some(animation => animation.playState === 'running'),
null, { timeout: 4000 }).catch(() => {});
const arrived = (page, name) => page.getByRole('heading', { name, exact: true }).waitFor({ timeout: 4000 }).then(() => true, () => false);
const pressed = (page, name) => page.getByRole('button', { name, exact: true }).click({ timeout: 4000 }).then(() => true, () => false);
async function walkToFinished(page, run) {
  await page.locator('#nav [data-action="prepare-project"]').click({ timeout: 4000 }).catch(() => {});
  for (const step of WIZARD_STEPS) {
    if (!await arrived(page, step.heading)) { run.problems.push(`${step.screen}: pantalla no alcanzada`); return false; }
    await settled(page);
    if (step.screen === 'setup') {
      await page.getByLabel('Nombre de tu proyecto').fill('Carpeta del asistente');
      await page.getByLabel('¿Qué quieres lograr?').fill('Terminar el asistente');
    }
    if (step.screen === 'folder' && !await page.locator('.folder-card .path').count()) {
      if (!await pressed(page, 'Buscar carpeta en este equipo')) { run.problems.push('folder: no se pudo elegir la carpeta'); return false; }
      await settled(page);
    }
    await run.measure?.(step);
    if (!await pressed(page, step.next)) { run.problems.push(`${step.screen}: un clic normal no pudo pulsar «${step.next}»`); return false; }
  }
  if (!await arrived(page, FINISHED)) { run.problems.push('finished: pantalla no alcanzada'); return false; }
  await settled(page);
  return true;
}
async function inspectWizard() {
  const runs = [];
  for (const [width, height] of WIZARD_WINDOWS) for (const motion of ['no-preference', 'reduce']) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: motion });
    const page = await context.newPage();
    const run = { window: `${width}x${height}`, motion, visited: [], problems: [], measured: 0, reachable: 0 };
    const measure = async ({ screen, primary }, bar = true) => {
      const report = await page.evaluate(REACH, INTERACTIVE);
      run.visited.push(screen); run.measured += report.controls.length;
      run.reachable += report.controls.filter(control => control.ok).length;
      for (const problem of reachProblems(report, { primary, bar })) run.problems.push(`${screen}: ${problem}`);
      for (const [action, value] of Object.entries(report.nav)) {
        if (value !== String(action === 'prepare-project')) run.problems.push(`${screen}: la navegación «${action}» declara aria-pressed="${value}"`);
      }
    };
    run.measure = measure;
    try {
      await page.addInitScript(stub('filled'));
      await page.goto(url, { waitUntil: 'networkidle' });
      if (await walkToFinished(page, run)) await measure({ screen: 'finished', primary: ['Copiar ruta', 'Copiar Prompt Maestro'] }, false);
    } catch (error) {
      run.problems.push(`la comprobación no pudo evaluarse: ${String(error.message).split('\n')[0].slice(0, 160)}`);
    } finally { delete run.measure; await context.close(); }
    runs.push(run);
  }
  return runs;
}
// The two copy controls against the three answers the transport can give. Only a success may be announced, a
// refusal has to reach the error surface with its cause, and the page's own clipboard is never touched.
async function inspectCopies() {
  const results = {};
  for (const answer of Object.keys(COPY_ANSWERS)) {
    const context = await browser.newContext({ viewport: { width: 1180, height: 820 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const entry = { reached: false, controls: [] };
    try {
      await page.addInitScript(stub('filled', answer));
      await page.goto(url, { waitUntil: 'networkidle' });
      entry.reached = await walkToFinished(page, { problems: [] });
      for (const control of entry.reached ? ['Copiar ruta', 'Copiar Prompt Maestro'] : []) {
        const button = await page.getByRole('button', { name: control, exact: true }).elementHandle({ timeout: 4000 });
        await button.click();
        await page.waitForFunction(() => document.getElementById('content').getAttribute('aria-busy') !== 'true');
        entry.controls.push({ control, announced: (await page.locator('#notice').textContent()).trim(),
          errorShown: await page.locator('#feedback').isVisible(),
          error: (await page.locator('#feedback').innerText().catch(() => '')).replace(/\s+/g, ' ').trim(),
          labelAfter: (await button.textContent()).trim(), pageClipboardWrites: await page.evaluate(() => window.__pageClipboardWrites) });
      }
    } catch (error) {
      entry.failure = String(error.message).split('\n')[0].slice(0, 160);
    } finally { await context.close(); }
    results[answer] = entry;
  }
  return results;
}
function copyProblems(copies) {
  if (!copies) return ['las copias no se comprobaron'];
  const problems = [];
  const expected = { ok: { announced: true, error: null }, refused: { announced: false, error: /portapapeles/ },
    transport: { announced: false, error: /no pudo comunicarse con la aplicación/ } };
  for (const [answer, rule] of Object.entries(expected)) {
    const entry = copies[answer];
    if (!entry?.reached || entry.controls.length !== 2) { problems.push(`${answer}: no se observaron los dos controles de copia${entry?.failure ? ` (${entry.failure})` : ''}`); continue; }
    for (const control of entry.controls) {
      if (!!control.announced !== rule.announced) problems.push(`${answer}: «${control.control}» ${rule.announced ? 'no anunció la copia' : `anunció «${control.announced}» sin haber copiado`}`);
      if (rule.error && !(control.errorShown && rule.error.test(control.error))) problems.push(`${answer}: «${control.control}» no mostró la causa del fallo`);
      if (!rule.error && control.errorShown) problems.push(`${answer}: «${control.control}» mostró un error tras copiar`);
      if (rule.announced === (control.labelAfter === control.control)) problems.push(`${answer}: «${control.control}» ${rule.announced ? 'no cambió su etiqueta al copiar' : `cambió su etiqueta a «${control.labelAfter}» sin haber copiado`}`);
      if (control.pageClipboardWrites) problems.push(`${answer}: «${control.control}» escribió en el portapapeles de la página`);
    }
  }
  return problems;
}

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
  baseline.wizard = await inspectWizard();
  baseline.copies = await inspectCopies();
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
  // These five navigation actions exist independently of project state, so every fixture must expose them.
  // State-dependent actions are checked by the project probes and by the journey harness against real data.
  const REACHABLE_HERE = ['open-start', 'open-project-list', 'prepare-project', 'open-help', 'privacy-scope'];
  const absent = REACHABLE_HERE.filter(action => !baseline.actions.some(([id]) => id === action));
  if (absent.length) complain(`Acciones ausentes de estas pantallas: ${absent.join(', ')}`);
  const list = listOf(baseline);
  if (list.purity.stray.length) complain(`La lista muestra texto fuera de una tarjeta: ${list.purity.stray.join(' | ')}`);
  if (list.purity.cards !== 3) complain(`La lista no mostró las tres entradas del historial: ${list.purity.cards}`);
  if (!list.purity.textNodes) complain('La comprobación de la lista no leyó ningún texto');
  // What the row may claim, and where the actions live, read off the rendered page.
  for (const problem of readyProblems(list.claims)) complain(`En la lista, ${problem}`);
  for (const problem of rowMenuProblems(list.rows)) complain(`En la lista, ${problem}`);
  if (!list.claims.length) complain('La comprobación de lo que afirma una fila no examinó ninguna fila');
  if (baseline.rowDuplicated.length) complain(`Una acción de fila con dos nombres: ${baseline.rowDuplicated.join('; ')}`);
  if (baseline.rowUndeclared.length) complain(`Acciones de fila fuera del conjunto cerrado: ${baseline.rowUndeclared.join(', ')}`);
  const missingRowActions = EXPECTED_ROW_ACTIONS.filter(action => !baseline.rowActions.some(([id]) => id === action));
  if (missingRowActions.length) complain(`Acciones de fila ausentes: ${missingRowActions.join(', ')}`);
  for (const [where, screen] of Object.entries(baseline.screens)) {
    for (const repeat of screen.repeated) complain(`En ${where} la misma acción se ofrece en más de un control: ${repeat}`);
  }
  const mine = baseline.screens['mi proyecto'];
  if (!mine) complain('No se pudo inspeccionar la pantalla del proyecto');
  else for (const problem of guideProblems(mine.guide)) complain(`En la guía del proyecto, ${problem}`);
  if (!baseline.providerModelSelection) complain('No se pudo inspeccionar la lista de modelos del proveedor');
  else {
    if (baseline.providerModelSelection.value !== '') complain('La lista de modelos aparenta una elección que todavía no se guardó');
    if (baseline.providerModelSelection.options[0]?.value !== '') complain('La lista de modelos no empieza con una elección explícita vacía');
  }
  if (!baseline.providerModelSelection) complain('No se pudo inspeccionar la lista de modelos del proveedor');
  else {
    if (baseline.providerModelSelection.value !== '') complain('La lista de modelos parece elegida antes de guardar una elección');
    if (baseline.providerModelSelection.options[0]?.value !== '') complain('La lista de modelos no ofrece una elección inicial explícita');
  }
  if (baseline.rendererErrors.length) complain(`Excepciones del renderer: ${baseline.rendererErrors.join(' | ')}`);
  if (baseline.brokenModule.bootText.length < 40) complain(`Con el módulo roto la ventana no dice qué pasó: "${baseline.brokenModule.bootText}"`);
  for (const run of baseline.wizard) {
    for (const problem of run.problems) complain(`Asistente ${run.window} ${run.motion}: ${problem}`);
    if (run.visited.length !== WIZARD_STEPS.length + 1) complain(`Asistente ${run.window} ${run.motion}: se midieron ${run.visited.length} de ${WIZARD_STEPS.length + 1} pantallas`);
    if (!run.measured) complain(`Asistente ${run.window} ${run.motion}: ningún control medido`);
  }
  for (const problem of copyProblems(baseline.copies)) complain(`Copias: ${problem}`);
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
  // Named, not added to. The published count used to be the measured screens plus a constant five, which an
  // independent review flagged as a calculated number presented as a measured one.
  record.screensCounted = [...Object.keys(baseline.screens),
    baseline.dialog.opened ? 'diálogo de un término' : null, 'ancho mínimo',
    ...Object.keys(states).map(mode => `lista ${mode === 'empty' ? 'vacía' : 'con error'}`)].filter(Boolean);
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
    // A defect can live in more than one file: the bar of 0.3.1 needs both its place in the markup and its rule.
    const patches = mutation.patches ?? [{ file: mutation.file, from: mutation.from, to: mutation.to }];
    const mutated = new Map(patches.map(patch => [patch.file, pristine.get(patch.file)]));
    for (const patch of patches) {
      assert.ok(mutated.get(patch.file).includes(patch.from), `La mutación ${mutation.id} no encontró su punto de inserción en ${patch.file}.`);
      mutated.set(patch.file, mutated.get(patch.file).replace(patch.from, patch.to));
    }
    for (const [file, content] of mutated) await writeFile(path.join(ui, file), content);
    errors = [];
    let detected = false, observed = null, by = null;
    try {
      const report = flat(await inspect(page));
      report.rendererErrors = [...errors];
      report.brokenModule = mutation.id.includes('boot-shell') ? await readBrokenModule() : { bootText: 'x'.repeat(80) };
      if (mutation.wizard) report.wizard = await inspectWizard();
      if (mutation.copies) report.copies = await inspectCopies();
      detected = !!mutation.detect(report);
      by = detected ? 'la propiedad que nombra' : null;
      observed = { duplicated: report.duplicated, undeclared: report.undeclared,
        unreachable: report.unreachable, glossaryEntries: report.glossaryEntries,
        termLabelMismatches: report.termLabelMismatches, rendererErrors: report.rendererErrors,
        stray: listOf(report)?.purity.stray.length ?? null,
        claims: listOf(report)?.claims ?? null,
        readyProblems: readyProblems(listOf(report)?.claims ?? []),
        rowProblems: rowMenuProblems(listOf(report)?.rows ?? []),
        guideProblems: guideProblems(report.screens['mi proyecto']?.guide),
        repeated: Object.entries(report.screens).flatMap(([where, screen]) => (screen.repeated ?? []).map(entry => `${where}:${entry}`)),
        vocabulary: Object.entries(report.screens).flatMap(([where, screen]) =>
          [...screen.vocabulary.missing.map(entry => `${where}:${entry.id}`),
            ...screen.vocabulary.forbidden.map(word => `${where}:${word}`)]),
        contrast: Object.entries(report.screens).flatMap(([where, screen]) =>
          screen.accessibility.contrast.map(entry => `${where}:${entry.class}:${entry.ratio}`))
          .concat(report.dialog.accessibility?.contrast.map(entry => `diálogo:${entry.class}:${entry.ratio}`) ?? []),
        brokenWords: report.narrow.accessibility.brokenWords,
        unnamed: Object.entries(report.screens).flatMap(([where, screen]) => screen.names.unnamed.map(c => `${where}:${c}`)),
        termsUnreachable: Object.entries(report.screens).filter(([, screen]) => screen.accessibility.terms !== screen.accessibility.termsReachable).map(([where]) => where),
        providerModelSelection: report.providerModelSelection,
        bootText: report.brokenModule.bootText.length,
        // For the wizard, what each motion preference saw: the point of the bar mutation is that reduced motion
        // alone would have passed it.
        wizard: report.wizard?.map(run => ({ window: run.window, motion: run.motion, visited: run.visited,
          measured: run.measured, reachable: run.reachable,
          intercepted: run.problems.filter(problem => problem.includes('no se puede pulsar')).length, problems: run.problems })),
        copies: report.copies ? copyProblems(report.copies) : undefined };
    } catch (error) {
      // An exception is NOT a detection. A previous version credited three mutations to a thirty-second
      // harness timeout, and a regression in those three probes would have read "detected" just the same.
      detected = false;
      by = `la comprobación no pudo evaluarse: ${String(error.message).split('\n')[0].slice(0, 200)}`;
    }
    record.mutations.push({ id: mutation.id, reason: mutation.reason, note: mutation.note ?? null, detected, by, observed });
    if (!detected) record.findings.push(`La mutación ${mutation.id} no fue detectada por su propiedad${by ? `: ${by}` : ''}`);
    for (const file of mutated.keys()) await writeFile(path.join(ui, file), pristine.get(file));
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
  screens: record.screensCounted.length,
  screensCounted: record.screensCounted,
  wizard: { runs: record.baseline.wizard.length, screensMeasured: record.baseline.wizard.reduce((sum, run) => sum + run.visited.length, 0),
    controlsMeasured: record.baseline.wizard.reduce((sum, run) => sum + run.measured, 0),
    controlsReachable: record.baseline.wizard.reduce((sum, run) => sum + run.reachable, 0) },
  copies: Object.fromEntries(Object.entries(record.baseline.copies).map(([answer, entry]) => [answer, entry.controls.length])),
  denominators: Object.fromEntries(Object.entries(record.baseline.screens)
    .map(([where, screen]) => [where, { contrast: screen.accessibility.measured, vocabularyChars: screen.vocabulary.examinedChars, controls: screen.names.controls }])) };
await writeFile(path.join(output, 'interface-contract.json'), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify({ ...record.summary, actions: record.baseline.actions.length }, null, 2));
if (record.findings.length) { console.error(JSON.stringify(record.findings, null, 2)); process.exitCode = 1; }
