import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, writeFile, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { zipSync, strToU8 } from 'fflate';
import * as core from 'create-project-engineering-os';
import { createDesktopService, publicError } from '../desktop/service.mjs';
import { createRuntimeManager } from '../runtime/manager.mjs';
import { createEnvironmentEngine } from '../runtime/environment.mjs';
import { GLOSSARY, FORBIDDEN_WORDS, labelMatchesTerm, byId } from '../ui/glossary.mjs';
const VOCABULARY={terms:GLOSSARY.map(e=>({id:e.id,forms:e.forms,caseSensitive:!!e.caseSensitive})),forbidden:FORBIDDEN_WORDS};
import { ACTION_PAIRS, UNDEFINED_VOCABULARY, TERM_LABELS, LIST_PURITY, ACCESSIBILITY, ACCESSIBLE_NAMES,
  EXPECTED_ACTIONS, RUNTIME_ONLY_ACTIONS, collectActionPairs, duplicateActionNames, missingActions,
  undeclaredActions, vacuous, ROW_ACTION_PAIRS, ROW_MENUS, READY_CLAIMS, GUIDE, EXPECTED_ROW_ACTIONS,
  rowMenuProblems, readyProblems, guideProblems, guideSignature, ACTION_COUNTS, repeatedActions,
  INTERACTIVE, REACH, reachProblems } from './interface-contract.mjs';

// Browser verification uses the shipping renderer and engines. Only native picker/clipboard/external
// launch and IPC transport are injected. It does not claim installer or Electron sandbox coverage.
const pw=await import(process.env.PROJECT_OS_PLAYWRIGHT_MODULE?pathToFileURL(process.env.PROJECT_OS_PLAYWRIGHT_MODULE).href:'playwright');
const {chromium}=pw.default??pw, output=process.argv[2]??path.join(tmpdir(),'project-os-closeout','companion-ui');await mkdir(output,{recursive:true});
const runtimeRoot=process.argv[3];
const manager=runtimeRoot?await createRuntimeManager({root:runtimeRoot}):null;
if(manager)for(const id of ['node','npm','git','codegraph'])assert.equal((await manager.inspect(id)).status,'verified','Real browser runtime cache must be preverified; no downloads during this probe.');
const temp=await realpath(await mkdtemp(path.join(tmpdir(),'peos-desktop-ui-'))),ui=fileURLToPath(new URL('../ui/',import.meta.url));
const files={'/':'index.html','/app.css':'app.css','/app.mjs':'app.mjs','/glossary.mjs':'glossary.mjs'};
const server=createServer(async(req,res)=>{
  if(req.method!=='GET'||!Object.hasOwn(files,req.url)){res.writeHead(404);res.end();return;}
  const f=files[req.url];res.setHeader('Content-Type',f.endsWith('.mjs')?'text/javascript':f.endsWith('.css')?'text/css':'text/html');res.end(await readFile(path.join(ui,f)));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}`;
const evidence={date:new Date().toISOString(),scope:'Real renderer and engines in browser; native transport/picker/clipboard/provider injected',checks:[],screenshots:[]};
let browser;
function pdf(){const stream='BT /F1 12 Tf 40 700 Td (Evidence: tokens must be measured with the same model.) Tj ET';const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [4 0 R] /Count 1 >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents 5 0 R >>',`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];let out='%PDF-1.4\n',offsets=[];objects.forEach((v,i)=>{offsets.push(Buffer.byteLength(out));out+=`${i+1} 0 obj\n${v}\nendobj\n`;});const start=Buffer.byteLength(out);out+=`xref\n0 6\n0000000000 65535 f \n${offsets.map(n=>`${String(n).padStart(10,'0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;return out;}
const heading=async(page,name)=>page.getByRole('heading',{name,exact:true}).waitFor();
// Every click probes the screen it lands on, so coverage is not a list of screens someone remembered to
// check. The label is the screen's own h1, which is also what a person would call it.
const click=async(page,name)=>{await page.getByRole('button',{name,exact:true}).click();await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')!=='true');await checkAccessibility(page,await page.locator('#view h1').first().innerText().catch(()=>'(pantalla sin encabezado)'));};
async function capture(page,name){const target=path.join(output,name+'.png');await page.screenshot({path:target,fullPage:true,mask:[page.locator('.path')],maskColor:'#e7eee4'});evidence.screenshots.push(name+'.png');}
async function noOverflow(page,label){const size=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert(size.scroll<=size.width+1,`${label}: ${JSON.stringify(size)}`);}
// Every structural property, on every screen a click lands on. The probes live in `interface-contract.mjs`
// so the mutation harness exercises this same code.
//
// Coverage is the point here. An independent review put a duplicate name on the wizard's first screen, a
// term control pointing at another concept's definition on a screen neither harness clicked, and this
// repository's jargon inside a project card — and all three passed, because the probes ran on three screens
// chosen in advance. They now run wherever the journey goes, which is where the real screens are.
const actionsSeen=new Map(),termsSeen=[],rowActionsSeen=new Map();
async function collectActions(page,where){
  collectActionPairs(await page.evaluate(ACTION_PAIRS),actionsSeen,where);
  // The controls that act on one listed project follow the same rule, and they are collected on every screen
  // for the same reason: a second name added on a screen nobody clicked is still a second name.
  collectActionPairs(await page.evaluate(ROW_ACTION_PAIRS),rowActionsSeen,where);
  for(const [id,label] of await page.evaluate(TERM_LABELS))termsSeen.push([where,id,label]);
}
// Contrast, heading order and keyboard reach measured on each screen as it is walked, rather than asserted
// once on a screen chosen for being easy. Collected and reported together so one run names every screen that
// fails instead of stopping at the first.
const a11y=new Set(),screensSeen=new Set(),screenDenominators=[],listStates=[],guideSignatures=[];
async function checkScreen(page,where){
  screensSeen.add(where);
  await collectActions(page,where);
  const result=await page.evaluate(ACCESSIBILITY);
  for(const entry of result.contrast)a11y.add(`${where}: contraste ${entry.ratio}:1 (requerido ${entry.required}:1) en ${entry.tag}.${entry.class} "${entry.text}"`);
  for(const problem of result.headingOrder)a11y.add(`${where}: encabezados ${problem}`);
  if(result.terms!==result.termsReachable)a11y.add(`${where}: ${result.terms-result.termsReachable} término(s) no activables con el teclado`);
  if(!result.focusable)a11y.add(`${where}: ningún control alcanzable con el teclado`);
  const vocabulary=await page.evaluate(UNDEFINED_VOCABULARY,VOCABULARY);
  for(const entry of vocabulary.missing)a11y.add(`${where}: "${entry.word}" aparece y su definición no se puede abrir desde ahí · …${entry.context}…`);
  for(const word of vocabulary.forbidden)a11y.add(`${where}: "${word}" no tiene definición y no debe aparecer`);
  for(const repeat of repeatedActions(await page.evaluate(ACTION_COUNTS)))a11y.add(`${where}: la misma acción se ofrece en más de un control · ${repeat}`);
  const names=await page.evaluate(ACCESSIBLE_NAMES);
  // A probe that reports only its failures cannot be told apart from a probe that examined nothing.
  for(const empty of vacuous({accessibility:result,vocabulary,names}))a11y.add(`${where}: ${empty}`);
  for(const broken of result.brokenWords)a11y.add(`${where}: una entrada se parte entre líneas: ${broken}`);
  for(const control of names.unnamed)a11y.add(`${where}: control sin nombre accesible ${control}`);
  if(!names.navigationLabelled)a11y.add(`${where}: la navegación no tiene nombre accesible`);
  if(!names.liveRegions)a11y.add(`${where}: no hay región en vivo para anunciar progreso o errores`);
  if(!names.pressedTabs)a11y.add(`${where}: una pestaña no declara si está activa`);
  screenDenominators.push({screen:where,contrastMeasured:result.measured,vocabularyChars:vocabulary.examinedChars,
    attributes:vocabulary.attributes,controls:names.controls,focusable:result.focusable,terms:result.terms});
  return result;
}
const checkAccessibility=checkScreen;
// The current wizard, walked the way Companion 0.3.1 could not be finished: with the entry animation running, in
// the three window sizes of the maintainer's report, each once more with reduced motion for comparison, and once
// per installation choice so that both are clicked. The five-profile journey further down still walks the review
// route with reduced motion; this one exists because that one never saw the wizard break.
const WIZARD_VIEWPORTS=[[1180,820],[1160,810],[1040,700]],MOTIONS=['no-preference','reduce'];
const INSTALL={quick:'Instalar stack base y obtener prompt →',ai:'Preparar carpeta y generar prompt maestro →'};
const PRIMARY={setup:['Inicio','Elegir carpeta →'],'folder-empty':['Volver','Buscar carpeta en este equipo'],
  folder:['Cambiar carpeta','Ver mi proyecto','Volver','Continuar a delimitación →','Revisar preparación →'],
  delimitation:['Volver','Paso 3: Visión y Descripción →'],vision:['Volver','Paso 4: Instalación →'],
  install:['Volver',...Object.values(INSTALL)],finished:['Copiar ruta','Copiar Prompt Maestro','Ver mi proyecto','Tus proyectos']};
const WIZARD_SCREENS=Object.keys(PRIMARY),WITH_BAR=new Set(WIZARD_SCREENS.filter(screen=>screen!=='finished'));
const wizard={date:new Date().toISOString(),
  scope:'Renderer real y servicio real en el navegador; selector de carpeta, portapapeles y apertura externa inyectados. Asistente vigente en tres ventanas, con movimiento normal y reducido y con las dos formas de instalar.',
  viewports:WIZARD_VIEWPORTS.map(([width,height])=>`${width}x${height}`),motions:MOTIONS,branches:Object.keys(INSTALL),
  matrix:[],copies:[],problems:[]};
// Settled means the operation finished and the entry animation stopped running. Infinite decorative animations are
// not waited for, and nothing is disabled to make the wait shorter.
const settle=page=>page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')!=='true'
  &&!(document.querySelector('#view .enter')?.getAnimations()??[]).some(animation=>animation.playState==='running'));
async function walkWizard(width,height,motion,branch){
  const tag=`${width}x${height} ${motion} ${branch}`,root=path.join(temp,`wizard-${width}x${height}-${motion}-${branch}`);
  await mkdir(root);
  for(let index=0;index<12;index+=1)await writeFile(path.join(root,`nota-${index}.txt`),`Nota ${index}. `+'Texto de prueba para recorrer el asistente. '.repeat(12));
  const copied=[],errors=[],visited=[],problems=[],screens={};
  const service=await createDesktopService({dataRoot:root+'-history',core,environment:null,chooseFolder:async()=>root,copyText:v=>copied.push(v),openExternal:()=>{}});
  const context=await browser.newContext({viewport:{width,height},reducedMotion:motion}),page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(30000);
  await page.exposeFunction('qaCall',async(name,input)=>{
    if(!Object.hasOwn(service,name))return {ok:false,error:{message:'Unknown method'}};
    try{return {ok:true,value:await service[name](input)};}catch(e){return {ok:false,error:publicError(e)};}
  });
  await page.addInitScript(methods=>{window.companion=Object.fromEntries(methods.map(name=>[name,input=>window.qaCall(name,input??{})]));window.companion.onProgress=()=>()=>{};},Object.keys(service));
  const measure=async screen=>{
    await settle(page);
    const report=await page.evaluate(REACH,INTERACTIVE),a11y=await page.evaluate(ACCESSIBILITY),names=await page.evaluate(ACCESSIBLE_NAMES);
    visited.push(screen);
    // The header is measured too and reported apart: it is not part of this change, and at 1040 px its entries
    // break mid-word, which belongs to the layout rebuild in #144.
    screens[screen]={heading:report.heading,enter:report.enter,bar:report.bar,end:report.end,nav:report.nav,
      measured:report.controls.length,reachable:report.controls.filter(control=>control.ok).length,
      blocked:report.controls.filter(control=>!control.ok),
      accessibility:{contrastMeasured:a11y.measured,contrast:a11y.contrast,headingOrder:a11y.headingOrder,focusable:a11y.focusable,unnamed:names.unnamed},
      header:{brokenWords:a11y.brokenWords}};
    for(const problem of reachProblems(report,{primary:PRIMARY[screen],bar:WITH_BAR.has(screen)}))problems.push(`${screen}: ${problem}`);
    for(const entry of a11y.contrast)problems.push(`${screen}: contraste ${entry.ratio}:1 (requerido ${entry.required}:1) en ${entry.tag}.${entry.class} "${entry.text}"`);
    for(const entry of a11y.headingOrder)problems.push(`${screen}: encabezados ${entry}`);
    for(const control of names.unnamed)problems.push(`${screen}: control sin nombre accesible ${control}`);
    if(!a11y.measured||!a11y.focusable)problems.push(`${screen}: la comprobación de accesibilidad no examinó nada`);
    for(const [action,value] of Object.entries(report.nav)){
      if(value!==String(action==='prepare-project'))problems.push(`${screen}: la navegación «${action}» declara aria-pressed="${value}"`);
    }
    if(motion==='no-preference'&&branch==='ai'&&['setup','install'].includes(screen)){
      await page.screenshot({path:path.join(output,`wizard-${width}x${height}-${screen}-final.png`),mask:[page.locator('.path')],maskColor:'#e7eee4'});
      evidence.screenshots.push(`wizard-${width}x${height}-${screen}-final.png`);
    }
  };
  // An ordinary click, never forced and never a handler called from the page. When the browser refuses it, the
  // refusal is the finding, and the rest of the journey is recorded as not reached instead of being faked.
  const press=async(name,screen)=>{
    try{await page.getByRole('button',{name,exact:true}).click({timeout:5000});return true;}
    catch(error){problems.push(`${screen}: un clic normal no pudo pulsar «${name}»: ${String(error.message).split('\n').find(line=>/intercepts|not visible|not stable|not enabled/.test(line))?.trim()??'tiempo agotado'}`);return false;}
  };
  // A screen that does not arrive is recorded with whatever the window said instead, so a stopped journey carries
  // its cause rather than only the fact that it stopped.
  const reached=async(name,screen)=>{
    if(await page.getByRole('heading',{name,exact:true}).waitFor({timeout:10000}).then(()=>true,()=>false))return true;
    const said=await page.locator('#feedback').isVisible()?(await page.locator('#feedback').innerText()).replace(/\s+/g,' ').trim():null;
    problems.push(`${screen}: no se llegó a «${name}»${said?`; la ventana muestra: ${said}`:''}`);
    return false;
  };
  try{
    await page.goto(url);await reached('Dale a tu IA un buen punto de partida.','inicio');
    await page.locator('#view').getByRole('button',{name:'Preparar proyecto',exact:true}).click();
    if(!await reached('Empecemos por lo que quieres lograr.','inicio'))return;
    await measure('setup');
    if(branch==='ai'){
      // Keyboard, on the longest screen: every stop Tab reaches has to stay at least partly visible, never wholly
      // under the bar that sticks to the bottom of the window (WCAG 2.4.11), until the bar's own submit is reached.
      await page.evaluate(()=>{window.scrollTo(0,0);document.activeElement?.blur();});
      const stops=[];
      for(let index=0;index<80&&!stops.at(-1)?.submit;index+=1){
        await page.keyboard.press('Tab');
        const stop=await page.evaluate(()=>{
          const node=document.activeElement;if(!node||node===document.body)return null;
          const bar=document.querySelector('#view .wizard-footer'),box=node.getBoundingClientRect(),band=bar?.getBoundingClientRect();
          const inBar=!!bar?.contains(node);
          return {name:(node.getAttribute('aria-label')||node.labels?.[0]?.innerText||node.innerText||node.id||node.tagName).replace(/\s+/g,' ').trim().slice(0,60),
            inBar,submit:inBar&&node.type==='submit',
            underBar:!inBar&&!!band&&box.top>=band.top-0.5&&box.bottom<=band.bottom+0.5,outside:box.bottom<=0||box.top>=innerHeight};
        });
        if(stop)stops.push(stop);
      }
      screens.setup.keyboard={stops:stops.length,underBar:stops.filter(stop=>stop.underBar).map(stop=>stop.name),outside:stops.filter(stop=>stop.outside).map(stop=>stop.name),reachedSubmit:!!stops.at(-1)?.submit};
      if(stops.length<10||!screens.setup.keyboard.reachedSubmit)problems.push(`setup: con Tab no se recorrió el formulario hasta «Elegir carpeta →» (${stops.length} paradas)`);
      for(const name of screens.setup.keyboard.underBar)problems.push(`setup: al tabular, «${name}» queda oculto bajo la barra`);
      for(const name of screens.setup.keyboard.outside)problems.push(`setup: al tabular, «${name}» recibe el foco fuera de la ventana`);
      await page.evaluate(()=>window.scrollTo(0,0));
    }
    // A required field keeps the wizard where it is, by click and by Enter; valid answers advance by either.
    await page.getByLabel('Nombre de tu proyecto').fill('');
    await page.getByLabel('¿Qué quieres lograr?').fill('Terminar el asistente con la animación activa');
    await press('Elegir carpeta →','setup');
    await page.getByLabel('¿Qué quieres lograr?').press('Enter');
    const refused=await page.evaluate(()=>({screen:document.querySelector('#view h1')?.textContent,missing:document.getElementById('name')?.validity.valueMissing}));
    if(refused.screen!=='Empecemos por lo que quieres lograr.'||!refused.missing)problems.push(`setup: un nombre vacío no detuvo el asistente ${JSON.stringify(refused)}`);
    await page.getByLabel('Nombre de tu proyecto').fill('Asistente con animación');
    if(branch==='quick')await page.getByLabel('¿Qué quieres lograr?').press('Enter');else await press('Elegir carpeta →','setup');
    if(!await reached('Tu trabajo empieza en una carpeta.','setup'))return;
    if(branch==='quick'){
      // Going back keeps what was answered.
      await settle(page);
      if(!await press('Volver','folder-empty')||!await reached('Empecemos por lo que quieres lograr.','folder-empty'))return;
      const kept={name:await page.getByLabel('Nombre de tu proyecto').inputValue(),goal:await page.getByLabel('¿Qué quieres lograr?').inputValue()};
      if(kept.name!=='Asistente con animación'||kept.goal!=='Terminar el asistente con la animación activa')problems.push(`setup: al volver se perdieron las respuestas ${JSON.stringify(kept)}`);
      await settle(page);
      if(!await press('Elegir carpeta →','setup')||!await reached('Tu trabajo empieza en una carpeta.','setup'))return;
    }
    await measure('folder-empty');
    if(!await press('Buscar carpeta en este equipo','folder-empty'))return;
    await page.locator('.folder-card .path').waitFor();
    await measure('folder');
    if(!await press('Continuar a delimitación →','folder')||!await reached('¿Cuál es el enfoque principal de tu proyecto?','folder'))return;
    await measure('delimitation');
    // The last card is the one the bar covered in the maintainer's report.
    const cards=page.locator('.delimitation-card'),last=cards.nth(await cards.count()-1),title=await last.locator('h3').innerText();
    await last.click({timeout:5000}).catch(()=>problems.push(`delimitation: un clic normal no pudo elegir «${title}»`));
    await settle(page);
    if(await page.locator('.delimitation-card.selected h3').innerText().catch(()=>null)!==title)problems.push(`delimitation: «${title}» no quedó elegida`);
    if(!await press('Paso 3: Visión y Descripción →','delimitation')||!await reached('Cuéntanos en tus palabras: ¿qué quieres lograr?','delimitation'))return;
    await measure('vision');
    // The suggestions are the last content of this screen, and each one adds a paragraph. With the quick branch a
    // line break is also typed by hand: both are ordinary ways to write a vision.
    for(const chip of await page.locator('.prompt-chip strong').allInnerTexts()){
      await page.locator('.prompt-chip').filter({hasText:chip}).click({timeout:5000}).catch(()=>problems.push(`vision: un clic normal no pudo pulsar la sugerencia «${chip}»`));
    }
    if(branch==='quick'){await page.locator('#vision-input').press('End');await page.keyboard.press('Enter');await page.keyboard.type('Una línea escrita a mano.');}
    const draft=await page.locator('#vision-input').inputValue();
    for(const added of ['### Público Objetivo','### Problema Principal a Resolver','### Alcance del Primer Incremento']){
      if(!draft.includes(added))problems.push(`vision: la sugerencia «${added}» no llegó al borrador`);
    }
    if(!await press('Paso 4: Instalación →','vision')||!await reached('Tu espacio está listo. ¿Cómo prefieres equiparlo?','vision'))return;
    await measure('install');
    if(!await press(INSTALL[branch],'install')||!await reached('¡Tu proyecto está listo para cobrar vida!','install'))return;
    await measure('finished');
    // The vision keeps its paragraphs in the folder, and the objective the preparation recorded is one line.
    const written=await readFile(path.join(root,'PROJECT_VISION.md'),'utf8').catch(()=>'');
    for(const line of draft.split('\n').filter(line=>line.trim())){
      if(!written.includes(line.trim()))problems.push(`finished: PROJECT_VISION.md no conserva «${line.trim().slice(0,60)}»`);
    }
    const recorded=(await service.listProjects())[0]?.selection?.goal??'';
    if(!recorded||/[\r\n]/.test(recorded)||recorded.length>500)problems.push(`finished: el objetivo registrado no es una línea de hasta 500 caracteres ${JSON.stringify(recorded.slice(0,80))}`);
    // Both copy controls, through the service and never through the page's own clipboard, with the exact text the
    // screen shows, and a confirmation in the status region only after the copy succeeded.
    const shown={'Copiar ruta':await page.locator('.finished-path-bar code').evaluate(node=>node.textContent),
      'Copiar Prompt Maestro':await page.locator('.prompt-box pre').evaluate(node=>node.textContent)};
    for(const [control,expected] of Object.entries(shown)){
      const before=copied.length;
      if(!await press(control,'finished'))continue;
      await settle(page);
      const notice=(await page.locator('#notice').textContent()).trim(),equal=copied.length===before+1&&copied.at(-1)===expected;
      wizard.copies.push({run:tag,control,equal,bytes:Buffer.byteLength(expected),notice});
      if(!equal)problems.push(`finished: «${control}» no entregó al servicio el texto que muestra la pantalla`);
      if(!notice)problems.push(`finished: «${control}» no anunció nada en la región de estado`);
    }
    await page.locator('#nav [data-action="open-start"]').click();await reached('Dale a tu IA un buen punto de partida.','finished');
    const outside=await page.locator('#nav [data-action="prepare-project"]').getAttribute('aria-pressed');
    if(outside!=='false')problems.push(`inicio: «Preparar proyecto» sigue con aria-pressed="${outside}" fuera del asistente`);
  }finally{
    for(const screen of WIZARD_SCREENS)if(!visited.includes(screen))problems.push(`${screen}: pantalla no alcanzada`);
    if(errors.length)problems.push(`excepciones del renderer: ${errors.join(' | ')}`);
    wizard.matrix.push({viewport:`${width}x${height}`,motion,branch,screens,problems:[...problems]});
    for(const problem of problems)wizard.problems.push(`${tag} · ${problem}`);
    await context.close();
  }
}
try {
  browser=await chromium.launch({...(process.platform==='win32'?{channel:'msedge'}:{}),headless:true});
  assert.equal((await fetch(url+'/desktop/service.mjs')).status,404);
  for(const [width,height] of WIZARD_VIEWPORTS)for(const motion of MOTIONS)for(const branch of Object.keys(INSTALL))await walkWizard(width,height,motion,branch);
  const runs=wizard.matrix,wizardScreens=runs.flatMap(run=>Object.values(run.screens));
  wizard.summary={runs:runs.length,screensExpected:runs.length*WIZARD_SCREENS.length,screensVisited:wizardScreens.length,
    controlsMeasured:wizardScreens.reduce((sum,screen)=>sum+screen.measured,0),controlsReachable:wizardScreens.reduce((sum,screen)=>sum+screen.reachable,0),
    copies:wizard.copies.length,copiesEqual:wizard.copies.filter(copy=>copy.equal).length,problems:wizard.problems.length};
  await writeFile(path.join(output,'wizard-reach.json'),JSON.stringify(wizard,null,2)+'\n');
  assert.deepEqual(wizard.problems,[],'Every control of the current wizard has to be reachable with and without motion, and both copies have to go through the service');
  assert.equal(wizard.summary.screensVisited,wizard.summary.screensExpected,'Every screen of every run has to be visited');
  evidence.checks.push(`Asistente vigente: ${runs.length} recorridos (3 ventanas × 2 preferencias de movimiento × 2 formas de instalar), ${wizard.summary.screensVisited} pantallas, ${wizard.summary.controlsReachable} de ${wizard.summary.controlsMeasured} controles alcanzables al tocar su centro, ${wizard.summary.copiesEqual} de ${wizard.summary.copies} copias con el texto exacto PASS`);
  for(const profile of ['research','software','unity','media','general']){
    const root=path.join(temp,profile);await mkdir(root);
    await writeFile(path.join(root,'notes.txt'),'Evidence: tokens must be measured. A byte budget is not an observed token reduction.');
    await writeFile(path.join(root,'private-notes.txt'),'Confidential excluded material.');
    if(profile==='research'){
      await writeFile(path.join(root,'paper.pdf'),pdf());
      await writeFile(path.join(root,'protocol.docx'),zipSync({'word/document.xml':strToU8('<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Compare tokens using the same model and sources.</w:t></w:r></w:p></w:body></w:document>')}));
    }
    if(profile==='unity'){await mkdir(path.join(root,'ProjectSettings'));await writeFile(path.join(root,'ProjectSettings/ProjectVersion.txt'),'m_EditorVersion: 6000.0.0f1');}
    if(profile==='media')await writeFile(path.join(root,'workflow.json'),JSON.stringify({prompt:'An original image',seed:42}));
    const engineeringProfile=['software','unity'].includes(profile);
    if(engineeringProfile){
      await writeFile(path.join(root,profile==='unity'?'Game.cs':'budget.js'),profile==='unity'?'public class ResearchGame { public int Points() { return 2; } }':'export function calculateBudget(hours) { return hours * 2; }');
      await writeFile(path.join(root,'package.json'),'{"name":"existing-product","scripts":{"postinstall":"exit 99"}}');
      if(!manager)execFileSync('git',['init','-q',root],{windowsHide:true});
    }
    const originals=new Map();for(const file of ['notes.txt','private-notes.txt'])originals.set(file,await readFile(path.join(root,file)));
    let pickFolder=root;
    const context=await browser.newContext({viewport:{width:1180,height:820},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],opened=[],copied=[];
    page.on('pageerror',e=>errors.push(e.message));
    const service=await createDesktopService({dataRoot:path.join(temp,profile+'-history'),core,environment:manager&&engineeringProfile?createEnvironmentEngine(manager):null,chooseFolder:async()=>pickFolder,copyText:v=>copied.push(v),openExternal:v=>opened.push(v)});
    page.setDefaultTimeout(manager?240000:30000);
    await page.exposeFunction('qaCall',async(name,input)=>{
      if(!Object.hasOwn(service,name))return {ok:false,error:{message:'Unknown method'}};
      try{return {ok:true,value:await service[name](input)};}catch(e){return {ok:false,error:publicError(e)};}
    });
    await page.addInitScript(methods=>{window.companion=Object.fromEntries(methods.map(name=>[name,input=>window.qaCall(name,input??{})]));window.companion.onProgress=()=>()=>{};},Object.keys(service));
    await page.goto(url);await heading(page,'Dale a tu IA un buen punto de partida.');
    await checkScreen(page,`${profile} inicio`);
    await click(page,'Ayuda');await heading(page,'Ayuda');
    assert.equal(await page.locator('#glosario dt').count(),GLOSSARY.length,'The glossary must list every defined term');
    // The property, not the spelling: whichever term control comes first, the dialog it opens is that
    // term's own definition. Pinning one label made the check depend on the order of the help screen.
    const firstTerm=await page.locator('#view .term').first().getAttribute('data-term');
    await page.locator('#view .term').first().click();await page.getByRole('dialog').waitFor();
    await checkScreen(page,`${profile} diálogo de un término`);
    assert((await page.evaluate(ACCESSIBLE_NAMES)).dialogNamed,'The dialog has to carry an accessible name');
    assert.equal(await page.locator('#dialog-title').innerText(),byId.get(firstTerm).term,'A term opens its own definition where it appears');
    await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.getElementById('dialog').open);
    await click(page,'Inicio');await heading(page,'Dale a tu IA un buen punto de partida.');
    assert.equal(await page.locator('.enter').evaluate(n=>getComputedStyle(n).animationName),'none');
    if(profile==='research')await capture(page,'home-desktop');
    await page.locator('#view').getByRole('button',{name:'Preparar proyecto',exact:true}).click();
    const name=profile==='general'?'Estudio'.repeat(14):profile==='research'?'<img src=x onerror=alert(1)>':'Proyecto '+profile;
    await page.getByLabel('Nombre de tu proyecto').fill(name);await page.getByLabel('¿Qué quieres lograr?').fill('Comparar evidencia sobre tokens medidos');
    await page.locator(`input[name="profile"][value="${profile}"]`).check();
    assert(await page.locator('input[name="agent"][value="web"]').isChecked(),'Default AI should be reflected in the form');
    // The technology answer, and for a software project the first of the three, so the screen that shows what
    // would be installed is visited by a journey instead of only by a unit test. Nothing is installed here: the
    // journey reads the identity, the licence, the sizes and the destination and then declines.
    assert(await page.locator('input[name="stack-decision"][value="too-early"]').isChecked(),'The third answer is the one a form with no choice records');
    if(profile==='software'){await page.locator('input[name="stack-decision"][value="chosen"]').check();
      await page.locator('input[name="stack"][value="typed-code"]').check();}
    await noOverflow(page,profile+' setup');
    await checkScreen(page,`${profile} asistente`);
    await click(page,'Elegir carpeta →');await click(page,'Buscar carpeta en este equipo');
    await click(page,'Revisar preparación →');await click(page,'Guardar esta preparación →');
    if(profile==='software'){
      await heading(page,'Esto es lo que pediste instalar.');
      const shown=await page.locator('#view').innerText();
      for(const expected of ['TypeScript','Apache-2.0','1 paquete','de descarga','instalados','.project-os/stack/typed-code']){
        assert(shown.includes(expected),`La revisión de tecnología tiene que mostrar ${expected} antes de instalar nada`);
      }
      // Collapsed content is not visible text, so the list of what is not installed from here is opened and then
      // read: a summary that promises a list is not the same as a list that names Flutter and says why.
      await page.getByText('Lo que no se instala desde aquí',{exact:false}).first().click();
      const refused=await page.locator('#view').innerText();
      for(const expected of ['Flutter','editor de Unity','Python']) assert(refused.includes(expected),`Lo que no se instala desde aquí tiene que nombrar ${expected}`);
      await checkScreen(page,`${profile} tecnología`);
      await noOverflow(page,profile+' stack');
      await click(page,'Volver');
    }
    if(engineeringProfile){
      if(manager){await heading(page,'Tus herramientas, listas en este equipo.');await click(page,'Preparar herramientas y continuar →');}
      await heading(page,'Un proceso claro para desarrollar.');await click(page,'Guardar estas instrucciones →');
      if(manager){await heading(page,'Un método de trabajo para tu IA.');await click(page,'Activar y continuar →');}
    }
    await heading(page,'Tus archivos, leídos y ubicables.');
    await page.getByText('Dejar materiales fuera',{exact:true}).click();await page.getByLabel('Una ruta relativa por línea').fill('private-notes.txt');await click(page,'Revisar con estas exclusiones');
    await click(page,'Guardar y continuar →');
    if(['software','unity'].includes(profile)){await heading(page,'Conectemos lo leído con las instrucciones.');await click(page,'Actualizar las instrucciones');await heading(page,'Una última pasada al resumen.');await click(page,'Guardar y ver mi proyecto');}
    await heading(page,name);assert.equal(await page.locator('#view img').count(),0);
    if(manager&&engineeringProfile){
      await heading(page,'Mapa de código · No preparado');await click(page,'Revisar mapa de código');await click(page,'Crear mapa de código');
      await heading(page,'Mapa de código · Verificado');await click(page,'Buscar símbolos');
      await page.getByLabel('Nombre del símbolo').fill(profile==='unity'?'ResearchGame':'calculateBudget');await click(page,'Buscar en el mapa');
      await page.getByRole('heading',{name:profile==='unity'?'ResearchGame':'calculateBudget',exact:true}).waitFor();
      await capture(page,profile+'-verified-code-search');
      evidence.checks.push(`${profile}: reviewed tools → constructor/adoption → official OpenSpec → context → real CodeGraph → symbol search PASS`);
    }
    await click(page,'Buscar en mis archivos');await page.getByLabel('¿Qué necesitas encontrar?').fill('tokens');await click(page,'Buscar');
    await page.locator('.result').first().waitFor();const resultText=await page.locator('#search-results').innerText();assert(resultText.includes('notes.txt'));assert(!resultText.includes('private-notes.txt'));
    if(profile==='research'){assert(resultText.includes('paper.pdf · página 1'));assert(resultText.includes('protocol.docx · párrafo 1'));await capture(page,'research-sources');}
    await click(page,'Preparar un texto para pegar en tu chat');await page.getByRole('dialog').waitFor();assert.equal(copied.length,0);await page.keyboard.press('Escape');
    await page.waitForFunction(()=>document.activeElement.textContent==='Preparar un texto para pegar en tu chat');
    await click(page,'Preparar un texto para pegar en tu chat');await click(page,'Copiar este texto');assert.equal(copied.length,1);assert(copied[0].includes('notes.txt'));assert.equal(opened.length,0);
    await click(page,'Recetas');await page.locator('.recipe').first().waitFor();assert.equal(await page.locator('.recipe').count(),3);
    await click(page,'Continuar con mi IA');await click(page,'Continuar con ChatGPT u otro chat web');await page.getByRole('dialog').waitFor();
    assert(!/^(null|undefined)$/m.test(await page.getByRole('dialog').innerText()),'Absent optional handoff content must not render as literal text');
    const shown=await page.getByLabel('Instrucción inicial').innerText();await click(page,'Copiar instrucción y abrir');assert.equal(copied[1],shown);assert.equal(opened.length,1);
    await click(page,'Tus proyectos');await heading(page,'Tus proyectos');await collectActions(page,'tus proyectos');
    const purity=await page.evaluate(LIST_PURITY);
    assert.equal(purity.cards,1,`The list must show the prepared project: ${JSON.stringify(purity)}`);
    assert.deepEqual(purity.stray,[],'With entries on screen the only text outside a project card is the heading');
    assert.ok(purity.textNodes>0,'The purity probe has to have read some text to have checked anything');
    assert.deepEqual(purity.headings,['h1','h2'],`The list is a heading and one card per project: ${JSON.stringify(purity.headings)}`);
    // What the row may claim, read off the page: the mark only where the state is verified, every row saying
    // where its state came from at no smaller a size, a ready row saying what the check did not cover, and no
    // internal token anywhere in the row.
    const claims=await page.evaluate(READY_CLAIMS);
    assert.equal(claims.length,1,`One card, one claim: ${JSON.stringify(claims)}`);
    assert.deepEqual(readyProblems(claims),[],`${profile}: ${JSON.stringify(claims)}`);
    const menus=await page.evaluate(ROW_MENUS);
    assert.deepEqual(rowMenuProblems(menus),[],`${profile}: ${JSON.stringify(menus)}`);
    listStates.push({profile,state:claims[0].className.replace(/^.*state-/,''),text:claims[0].text.slice(0,120)});
    // A profile whose stages this installation can all verify has to be able to reach the mark, or the mark
    // is unreachable and the rule is vacuous.
    if(!engineeringProfile){
      assert.match(claims[0].className,/state-verified/,`${profile}: ${claims[0].text}`);
      assert.equal(claims[0].mark,'✓');
    }

    await page.locator('article.project .card-open').first().click();
    await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')!=='true');
    await heading(page,name);
    await checkScreen(page,`${profile} mi proyecto`);
    // The guidance for THIS project: no step without a reason, no step without either text for an AI or a
    // control that does the work here, and no internal token.
    const guide=await page.evaluate(GUIDE);
    assert.deepEqual(guideProblems(guide),[],`${profile}: ${JSON.stringify(guide)}`);
    guideSignatures.push([profile,guideSignature(guide)]);
    if(guide.steps.some(step=>step.promptChars)){
      const before=copied.length;
      await page.locator('.guide-step').filter({has:page.locator('pre.prompt')}).first()
        .getByRole('button',{name:'Copiar este paso',exact:true}).click();
      await page.waitForFunction(()=>document.getElementById('notice').textContent.includes('bytes'));
      assert.equal(copied.length,before+1,'Copying a step has to put that step on the clipboard');
      assert.equal(copied.at(-1).includes(root),false,'The text handed to an AI names no absolute path');
    }
    for(const width of [1180,768,480,240]){await page.setViewportSize({width,height:width===240?410:820});await noOverflow(page,`${profile} ${width}px`);}
    if(profile==='general')await capture(page,'minimum-equivalent-200-percent');
    await page.setViewportSize({width:480,height:820});await click(page,'Privacidad y alcance');await page.keyboard.press('Escape');await page.waitForFunction(()=>document.activeElement.dataset?.action==='privacy-scope');
    if(manager&&engineeringProfile){
      // Last in the journey: touching a source deliberately invalidates the document context too.
      await page.setViewportSize({width:1180,height:820});
      const source=path.join(root,profile==='unity'?'Game.cs':'budget.js'),prior=await readFile(source);
      await writeFile(source,Buffer.concat([prior,Buffer.from('\n// changed source')]));await click(page,'Estado');await click(page,'Comprobar de nuevo');await heading(page,'Mapa de código · Desactualizado');
      await writeFile(source,prior);await click(page,'Comprobar de nuevo');await heading(page,'Mapa de código · Verificado');
      const index=path.join(root,'.project-os/companion/code/index.json'),saved=await readFile(index);
      await writeFile(index,'corrupt');await click(page,'Comprobar de nuevo');await heading(page,'Mapa de código · Corrupto');
      await writeFile(index,saved);await click(page,'Comprobar de nuevo');await heading(page,'Mapa de código · Verificado');
      assert.deepEqual(await readFile(index),saved);
      evidence.checks.push(`${profile}: code map stale and corrupt states are refused and recover without replacing the saved map PASS`);
    }
    // A recovery rehearsal for one transaction, driven from the interface rather than asserted from the
    // engine: undo the file reading, confirm the application refuses to claim the context afterwards, and
    // confirm the person's own files came through it untouched. This is the one stage a journey without the
    // managed toolchain can undo end to end.
    if(profile==='general'){
      await page.setViewportSize({width:1180,height:820});
      await click(page,'Estado');
      await page.getByText('Continuar o deshacer una operación',{exact:true}).click();
      await click(page,'Deshacer la lectura de archivos');
      await page.getByRole('dialog').waitFor();
      assert(/deshace la última operación registrada/.test(await page.getByRole('dialog').innerText()),
        'The dialog has to say what undoing this stage does before it is done');
      await click(page,'Deshacer etapa');
      await page.getByRole('heading',{name:'Archivos leídos · Por revisar',exact:true}).waitFor();
      for(const [file,content] of originals)assert.deepEqual(await readFile(path.join(root,file)),content,
        `Recovery must not touch ${file}`);
      // A stage of a verified project broken on purpose, from the interface: the guidance gains the step that
      // is now missing, and the list stops showing the project as ready and names the stage.
      const undone=await page.evaluate(GUIDE);
      assert.notEqual(guideSignature(undone),guideSignatures.at(-1)[1],
        'Undoing a stage has to change the guidance for this project');
      assert.match(undone.steps[0].title,/Falta leer tus archivos/,JSON.stringify(undone.steps[0]));
      await click(page,'Tus proyectos');await heading(page,'Tus proyectos');
      const broken=(await page.evaluate(READY_CLAIMS))[0];
      assert.doesNotMatch(broken.className,/state-verified/,`${broken.className}: ${broken.text}`);
      assert.notEqual(broken.mark,'✓','A project with a stage undone may not carry the mark');
      assert.match(broken.text,/la lectura de tus archivos/,broken.text);
      assert.deepEqual(readyProblems([broken]),[]);
      evidence.checks.push('general: a stage of a verified project undone from the interface removes the ready mark, names the stage in the list, and adds the step to the guidance PASS');
      // Duplicating: the answers are reused, the new folder is chosen, and nothing of the original travels
      // with it. Measured on disk before anything is written, which is the only place it can be measured.
      const copyRoot=path.join(temp,'general-copia');await mkdir(copyRoot);
      await writeFile(path.join(copyRoot,'otras-notas.txt'),'Otro acuerdo, en otra carpeta.');
      pickFolder=copyRoot;
      await page.locator('article.project details.more > summary').first().click();
      await page.locator('[data-row-action="duplicate-project"]').first().click();
      await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')!=='true');
      await heading(page,'Tu trabajo empieza en una carpeta.');
      await checkScreen(page,'general duplicar carpeta');
      assert.equal(await page.locator('.folder-card h2').innerText(),path.basename(copyRoot));
      await assert.rejects(readFile(path.join(copyRoot,'.project-os/companion/receipt.json')),{code:'ENOENT'},
        'Duplicating writes nothing into the new folder before the plan is approved');
      await click(page,'Volver');await heading(page,'Empecemos por lo que quieres lograr.');
      assert.equal(await page.getByLabel('Nombre de tu proyecto').inputValue(),name,
        'Duplicating arrives with the original answers already filled in and editable');
      assert.equal(await page.getByLabel('¿Qué quieres lograr?').inputValue(),'Comparar evidencia sobre tokens medidos');
      pickFolder=root;
      evidence.checks.push('general: duplicating reuses the answers, writes nothing into the new folder before the plan is approved, and copies none of the original preparation PASS');
      await click(page,'Tus proyectos');await heading(page,'Tus proyectos');
      await page.locator('article.project .card-open').first().click();
      await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')!=='true');
      await heading(page,name);
      await click(page,'Leer mis archivos');await heading(page,'Tus archivos, leídos y ubicables.');
      await click(page,'Guardar y continuar →');await heading(page,name);
      await page.getByRole('heading',{name:'Archivos leídos · Preparado',exact:true}).waitFor();
      evidence.checks.push('general: recovery rehearsal for one transaction — the file reading was undone from the interface, the application then refused to claim it, the original documents were byte-identical, and reading again restored the state PASS');
    }
    for(const [file,content] of originals)assert.deepEqual(await readFile(path.join(root,file)),content);
    assert.deepEqual(errors,[]);evidence.checks.push(`${profile}: onboarding, reviewed real base/context writes, citations/search, exclusions, recipes, reviewed copy/handoff, reopen, keyboard dialog focus, 1180/768/480/240 CSS widths PASS; native capabilities injected`);
    await context.close();
  }
  assert.deepEqual([...a11y],[],'Contrast, heading order, keyboard reach, accessible names and the vocabulary rule must hold on every screen walked');
  const termMismatches=termsSeen.filter(([,id,label])=>{const entry=byId.get(id);return !entry||!labelMatchesTerm(entry,label);})
    .map(([where,id,label])=>`${where}: "${label}" abre ${id}`);
  assert.deepEqual(termMismatches,[],'A control that opens a definition has to name the term it opens');
  // One name per row action too, across every screen walked, and the set is closed so removing a control does
  // not satisfy the check by omission.
  assert.deepEqual(duplicateActionNames(rowActionsSeen),[],'A row action may not carry two names');
  assert.deepEqual(EXPECTED_ROW_ACTIONS.filter(action=>!rowActionsSeen.has(action)),[],'Every declared row action has to appear');
  assert.deepEqual([...rowActionsSeen.keys()].filter(action=>!EXPECTED_ROW_ACTIONS.includes(action)),[],'A row action outside the declared set has to fail');
  // The guidance has to actually differ between kinds of project, compared by its steps rather than by the
  // panel: a panel that differed only by the project name would look different with nothing else being.
  const signatures=new Map(guideSignatures);
  assert.equal(new Set(signatures.values()).size,signatures.size,
    `Two kinds of project must not show the same guidance: ${JSON.stringify([...signatures.keys()])}`);
  evidence.checks.push(`La guía difiere entre los ${signatures.size} perfiles, comparada por sus pasos PASS`);
  evidence.checks.push(`Estado mostrado por fila en la lista: ${listStates.map(e=>`${e.profile}=${e.state}`).join(', ')}`);
  evidence.listStates=listStates;
  evidence.checks.push(`Contraste, orden de encabezados, teclado, nombres accesibles y la regla de vocabulario comprobados en ${screensSeen.size} pantallas de los cinco perfiles: 0 hallazgos PASS`);
  evidence.checks.push(`${termsSeen.length} controles de definición comprobados contra el término que abren: 0 desajustes PASS`);
  const thin=screenDenominators.filter(entry=>!entry.contrastMeasured||!entry.vocabularyChars||!entry.controls);
  assert.deepEqual(thin,[],'Every screen has to report a non-zero denominator, or the pass is vacuous');
  evidence.checks.push(`Denominadores: ${Math.min(...screenDenominators.map(e=>e.contrastMeasured))}–${Math.max(...screenDenominators.map(e=>e.contrastMeasured))} elementos medidos para contraste por pantalla, ${Math.min(...screenDenominators.map(e=>e.vocabularyChars))}–${Math.max(...screenDenominators.map(e=>e.vocabularyChars))} caracteres leídos para vocabulario, ${Math.min(...screenDenominators.map(e=>e.controls))}–${Math.max(...screenDenominators.map(e=>e.controls))} controles inspeccionados PASS`);
  const duplicated=duplicateActionNames(actionsSeen);
  // Without the managed toolchain the code map and its repair do not exist, so they are out of scope here
  // rather than missing. The run says which of the two it was.
  assert.deepEqual(missingActions(actionsSeen,{runtime:!!manager}),[],'Every declared navigable action must be present; dropping one must not satisfy the check by omission');
  assert.deepEqual(undeclaredActions(actionsSeen),[],'Every action a control declares has to be in the closed set');
  const expected=EXPECTED_ACTIONS.filter(action=>manager||!RUNTIME_ONLY_ACTIONS.includes(action));
  assert.deepEqual([...actionsSeen.keys()].sort(),[...expected].sort(),'The closed set of navigable actions is part of the contract');
  assert.deepEqual(duplicated,[],'An action offered under two different names is the defect this change removes');
  evidence.checks.push(`One name per action across ${actionsSeen.size} navigable actions: ${[...actionsSeen].map(([a,n])=>`${a}="${[...n.keys()][0]}"`).join(', ')} PASS`);
  evidence.checks.push('No renderer exceptions across five journeys; source markup rendered as text; original documents preserved.');
  await writeFile(path.join(output,'browser-evidence.json'),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence,null,2));
}catch(error){if(browser){const pages=browser.contexts().flatMap(c=>c.pages());if(pages.length){await capture(pages.at(-1),'failure');console.error((await pages.at(-1).locator('body').innerText()).slice(-6000));}}throw error;}
finally{await browser?.close();await new Promise(r=>server.close(r));assert(path.dirname(temp)===await realpath(tmpdir())&&path.basename(temp).startsWith('peos-desktop-ui-'));await rm(temp,{recursive:true,force:true});}
