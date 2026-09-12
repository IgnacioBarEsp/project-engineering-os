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
import { GLOSSARY } from '../ui/glossary.mjs';
import { ACTION_PAIRS, UNDEFINED_JARGON, LIST_PURITY, ACCESSIBILITY, duplicateActionNames, missingActions } from './interface-contract.mjs';

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
// Four destinations, one name per action, and the two purity properties. The probes live in
// `interface-contract.mjs` so the mutation harness exercises this same code.
const actionsSeen=new Map();
async function collectActions(page,where){
  for(const [action,name] of await page.evaluate(ACTION_PAIRS)){
    if(!actionsSeen.has(action))actionsSeen.set(action,new Map());
    actionsSeen.get(action).set(name,where);
  }
}
// Contrast, heading order and keyboard reach measured on each screen as it is walked, rather than asserted
// once on a screen chosen for being easy. Collected and reported together so one run names every screen that
// fails instead of stopping at the first.
const a11y=new Set();
async function checkAccessibility(page,where){
  const result=await page.evaluate(ACCESSIBILITY);
  for(const entry of result.contrast)a11y.add(`${where}: contraste ${entry.ratio}:1 (requerido ${entry.required}:1) en ${entry.tag}.${entry.class} "${entry.text}"`);
  for(const problem of result.headingOrder)a11y.add(`${where}: encabezados ${problem}`);
  if(result.terms!==result.termsReachable)a11y.add(`${where}: ${result.terms-result.termsReachable} término(s) no activables con el teclado`);
  if(!result.focusable)a11y.add(`${where}: ningún control alcanzable con el teclado`);
  return result;
}
try {
  browser=await chromium.launch({...(process.platform==='win32'?{channel:'msedge'}:{}),headless:true});
  assert.equal((await fetch(url+'/desktop/service.mjs')).status,404);
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
    const context=await browser.newContext({viewport:{width:1180,height:820},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],opened=[],copied=[];
    page.on('pageerror',e=>errors.push(e.message));
    const service=await createDesktopService({dataRoot:path.join(temp,profile+'-history'),core,environment:manager&&engineeringProfile?createEnvironmentEngine(manager):null,chooseFolder:async()=>root,copyText:v=>copied.push(v),openExternal:v=>opened.push(v)});
    page.setDefaultTimeout(manager?240000:30000);
    await page.exposeFunction('qaCall',async(name,input)=>{
      if(!Object.hasOwn(service,name))return {ok:false,error:{message:'Unknown method'}};
      try{return {ok:true,value:await service[name](input)};}catch(e){return {ok:false,error:publicError(e)};}
    });
    await page.addInitScript(methods=>{window.companion=Object.fromEntries(methods.map(name=>[name,input=>window.qaCall(name,input??{})]));window.companion.onProgress=()=>()=>{};},Object.keys(service));
    await page.goto(url);await heading(page,'Dale a tu IA un buen punto de partida.');
    assert.deepEqual(await page.evaluate(UNDEFINED_JARGON),[],'Inicio must not leave the vocabulary of this repository as undefined prose');
    await collectActions(page,'inicio');await checkAccessibility(page,`${profile} inicio`);
    await click(page,'Ayuda');await heading(page,'Ayuda');await collectActions(page,'ayuda');
    await checkAccessibility(page,`${profile} ayuda`);
    assert.equal(await page.locator('#glosario dt').count(),GLOSSARY.length,'The glossary must list every defined term');
    await page.locator('#view .term').first().click();await page.getByRole('dialog').waitFor();
    assert(await page.getByRole('heading',{name:'Recuperación',exact:true}).count(),'A term opens its own definition where it appears');
    await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.getElementById('dialog').open);
    await click(page,'Inicio');await heading(page,'Dale a tu IA un buen punto de partida.');
    assert.equal(await page.locator('.enter').evaluate(n=>getComputedStyle(n).animationName),'none');
    if(profile==='research')await capture(page,'home-desktop');
    await page.locator('#view').getByRole('button',{name:'Preparar proyecto',exact:true}).click();
    const name=profile==='general'?'Estudio'.repeat(14):profile==='research'?'<img src=x onerror=alert(1)>':'Proyecto '+profile;
    await page.getByLabel('Nombre de tu proyecto').fill(name);await page.getByLabel('¿Qué quieres lograr?').fill('Comparar evidencia sobre tokens medidos');
    await page.locator(`input[name="profile"][value="${profile}"]`).check();
    assert(await page.locator('input[name="agent"][value="web"]').isChecked(),'Default AI should be reflected in the form');
    await noOverflow(page,profile+' setup');
    await checkAccessibility(page,`${profile} asistente`);
    await click(page,'Elegir carpeta →');await click(page,'Buscar carpeta en este equipo');await checkAccessibility(page,`${profile} carpeta`);
    await click(page,'Revisar preparación →');await checkAccessibility(page,`${profile} revisión`);await click(page,'Guardar esta preparación →');
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
    await checkAccessibility(page,`${profile} proyecto`);
    if(manager&&engineeringProfile){
      await heading(page,'Mapa de código · No preparado');await click(page,'Revisar mapa de código');await click(page,'Crear mapa de código');
      await heading(page,'Mapa de código · Verificado');await click(page,'Buscar símbolos');
      await page.getByLabel('Nombre del símbolo').fill(profile==='unity'?'ResearchGame':'calculateBudget');await click(page,'Buscar en el mapa');
      await page.getByRole('heading',{name:profile==='unity'?'ResearchGame':'calculateBudget',exact:true}).waitFor();
      await capture(page,profile+'-verified-code-search');
      evidence.checks.push(`${profile}: reviewed tools → constructor/adoption → official OpenSpec → context → real CodeGraph → symbol search PASS`);
    }
    await click(page,'Buscar fuentes');await page.getByLabel('¿Qué necesitas encontrar?').fill('tokens');await click(page,'Buscar');
    await page.locator('.result').first().waitFor();const resultText=await page.locator('#search-results').innerText();assert(resultText.includes('notes.txt'));assert(!resultText.includes('private-notes.txt'));
    if(profile==='research'){assert(resultText.includes('paper.pdf · página 1'));assert(resultText.includes('protocol.docx · párrafo 1'));await capture(page,'research-sources');}
    await click(page,'Preparar un texto para pegar en tu chat');await page.getByRole('dialog').waitFor();assert.equal(copied.length,0);await page.keyboard.press('Escape');
    await page.waitForFunction(()=>document.activeElement.textContent==='Preparar un texto para pegar en tu chat');
    await click(page,'Preparar un texto para pegar en tu chat');await click(page,'Copiar este texto');assert.equal(copied.length,1);assert(copied[0].includes('notes.txt'));assert.equal(opened.length,0);
    await click(page,'Recetas');await page.locator('.recipe').first().waitFor();assert.equal(await page.locator('.recipe').count(),3);
    await click(page,'Continuar con mi IA');await click(page,'Abrir ChatGPT u otro chat web ↗');await page.getByRole('dialog').waitFor();
    assert(!/^(null|undefined)$/m.test(await page.getByRole('dialog').innerText()),'Absent optional handoff content must not render as literal text');
    const shown=await page.getByLabel('Instrucción inicial').innerText();await click(page,'Copiar instrucción y abrir');assert.equal(copied[1],shown);assert.equal(opened.length,1);
    await click(page,'Tus proyectos');await heading(page,'Tus proyectos');await collectActions(page,'tus proyectos');
    const purity=await page.evaluate(LIST_PURITY);
    assert.equal(purity.cards,1,`The list must show the prepared project: ${JSON.stringify(purity)}`);
    assert.deepEqual(purity.strayParagraphs,[],'With entries on screen the list carries no prose outside a project card');
    assert.deepEqual(purity.furniture,[],'The list carries none of the home page furniture');
    assert(/Carpeta preparada/.test(await page.locator('article.project').first().innerText()),'Each entry shows its recorded state');
    await checkAccessibility(page,`${profile} tus proyectos`);
    await click(page,'Abrir →');await heading(page,name);
    for(const width of [1180,768,480,240]){await page.setViewportSize({width,height:width===240?410:820});await noOverflow(page,`${profile} ${width}px`);}
    if(profile==='general')await capture(page,'minimum-equivalent-200-percent');
    await page.setViewportSize({width:480,height:820});await click(page,'Privacidad y alcance');await page.keyboard.press('Escape');await page.waitForFunction(()=>document.activeElement.id==='privacy');
    if(manager&&engineeringProfile){
      // Last in the journey: touching a source deliberately invalidates the document context too.
      await page.setViewportSize({width:1180,height:820});
      const source=path.join(root,profile==='unity'?'Game.cs':'budget.js'),prior=await readFile(source);
      await writeFile(source,Buffer.concat([prior,Buffer.from('\n// changed source')]));await click(page,'Estado');await click(page,'Comprobar estado');await heading(page,'Mapa de código · Desactualizado');
      await writeFile(source,prior);await click(page,'Comprobar estado');await heading(page,'Mapa de código · Verificado');
      const index=path.join(root,'.project-os/companion/code/index.json'),saved=await readFile(index);
      await writeFile(index,'corrupt');await click(page,'Comprobar estado');await heading(page,'Mapa de código · Corrupto');
      await writeFile(index,saved);await click(page,'Comprobar estado');await heading(page,'Mapa de código · Verificado');
      assert.deepEqual(await readFile(index),saved);
      evidence.checks.push(`${profile}: code map stale and corrupt states are refused and recover without replacing the saved map PASS`);
    }
    for(const [file,content] of originals)assert.deepEqual(await readFile(path.join(root,file)),content);
    assert.deepEqual(errors,[]);evidence.checks.push(`${profile}: onboarding, reviewed real base/context writes, citations/search, exclusions, recipes, reviewed copy/handoff, reopen, keyboard dialog focus, 1180/768/480/240 CSS widths PASS; native capabilities injected`);
    await context.close();
  }
  assert.deepEqual([...a11y],[],'Contrast, heading order and keyboard reach must hold on every screen that was walked');
  evidence.checks.push(`Contraste, orden de encabezados y alcance por teclado comprobados en cada pantalla a la que llega cada clic, en los cinco perfiles: 0 hallazgos PASS`);
  const duplicated=duplicateActionNames(actionsSeen);
  assert.deepEqual(missingActions(actionsSeen),[],'Every declared navigable action must be present; dropping one must not satisfy the check by omission');
  assert.deepEqual(duplicated,[],'An action offered under two different names is the defect this change removes');
  evidence.checks.push(`One name per action across ${actionsSeen.size} navigable actions: ${[...actionsSeen].map(([a,n])=>`${a}="${[...n.keys()][0]}"`).join(', ')} PASS`);
  evidence.checks.push('No renderer exceptions across five journeys; source markup rendered as text; original documents preserved.');
  await writeFile(path.join(output,'browser-evidence.json'),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence,null,2));
}catch(error){if(browser){const pages=browser.contexts().flatMap(c=>c.pages());if(pages.length){await capture(pages.at(-1),'failure');console.error((await pages.at(-1).locator('body').innerText()).slice(-6000));}}throw error;}
finally{await browser?.close();await new Promise(r=>server.close(r));assert(path.dirname(temp)===await realpath(tmpdir())&&path.basename(temp).startsWith('peos-desktop-ui-'));await rm(temp,{recursive:true,force:true});}
