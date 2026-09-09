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

// Browser verification uses the shipping renderer and engines. Only native picker/clipboard/external
// launch and IPC transport are injected. It does not claim installer or Electron sandbox coverage.
const pw=await import(process.env.PROJECT_OS_PLAYWRIGHT_MODULE?pathToFileURL(process.env.PROJECT_OS_PLAYWRIGHT_MODULE).href:'playwright');
const {chromium}=pw.default??pw, output=process.argv[2];assert(output,'Supply an evidence directory.');await mkdir(output,{recursive:true});
const temp=await realpath(await mkdtemp(path.join(tmpdir(),'peos-desktop-ui-'))),ui=fileURLToPath(new URL('../ui/',import.meta.url));
const files={'/':'index.html','/app.css':'app.css','/app.mjs':'app.mjs'};
const server=createServer(async(req,res)=>{
  if(req.method!=='GET'||!Object.hasOwn(files,req.url)){res.writeHead(404);res.end();return;}
  const f=files[req.url];res.setHeader('Content-Type',f.endsWith('.mjs')?'text/javascript':f.endsWith('.css')?'text/css':'text/html');res.end(await readFile(path.join(ui,f)));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}`;
const evidence={date:new Date().toISOString(),scope:'Real renderer and engines in browser; native transport/picker/clipboard/provider injected',checks:[],screenshots:[]};
let browser;
function pdf(){const stream='BT /F1 12 Tf 40 700 Td (Evidence: tokens must be measured with the same model.) Tj ET';const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [4 0 R] /Count 1 >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents 5 0 R >>',`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];let out='%PDF-1.4\n',offsets=[];objects.forEach((v,i)=>{offsets.push(Buffer.byteLength(out));out+=`${i+1} 0 obj\n${v}\nendobj\n`;});const start=Buffer.byteLength(out);out+=`xref\n0 6\n0000000000 65535 f \n${offsets.map(n=>`${String(n).padStart(10,'0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;return out;}
const heading=async(page,name)=>page.getByRole('heading',{name,exact:true}).waitFor();
const click=async(page,name)=>{await page.getByRole('button',{name,exact:true}).click();await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')!=='true');};
async function capture(page,name){const target=path.join(output,name+'.png');await page.screenshot({path:target,fullPage:true,mask:[page.locator('.path')],maskColor:'#e7eee4'});evidence.screenshots.push(name+'.png');}
async function noOverflow(page,label){const size=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert(size.scroll<=size.width+1,`${label}: ${JSON.stringify(size)}`);}
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
    if(['software','unity'].includes(profile))execFileSync('git',['init','-q',root],{windowsHide:true});
    const originals=new Map();for(const file of ['notes.txt','private-notes.txt'])originals.set(file,await readFile(path.join(root,file)));
    const context=await browser.newContext({viewport:{width:1180,height:820},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],opened=[],copied=[];
    page.on('pageerror',e=>errors.push(e.message));
    const service=await createDesktopService({dataRoot:path.join(temp,profile+'-history'),core,chooseFolder:async()=>root,copyText:v=>copied.push(v),openExternal:v=>opened.push(v)});
    await page.exposeFunction('qaCall',async(name,input)=>{
      if(!Object.hasOwn(service,name))return {ok:false,error:{message:'Unknown method'}};
      try{return {ok:true,value:await service[name](input)};}catch(e){return {ok:false,error:publicError(e)};}
    });
    await page.addInitScript(methods=>{window.companion=Object.fromEntries(methods.map(name=>[name,input=>window.qaCall(name,input??{})]));window.companion.onProgress=()=>()=>{};},Object.keys(service));
    await page.goto(url);await heading(page,'Dale a tu IA un buen punto de partida.');
    assert.equal(await page.locator('.enter').evaluate(n=>getComputedStyle(n).animationName),'none');
    if(profile==='research')await capture(page,'home-desktop');
    await page.getByRole('button',{name:/Preparar mi proyecto/}).click();
    const name=profile==='general'?'Estudio'.repeat(14):profile==='research'?'<img src=x onerror=alert(1)>':'Proyecto '+profile;
    await page.getByLabel('Nombre de tu proyecto').fill(name);await page.getByLabel('¿Qué quieres lograr?').fill('Comparar evidencia sobre tokens medidos');
    await page.locator(`input[name="profile"][value="${profile}"]`).check();
    assert(await page.locator('input[name="agent"][value="web"]').isChecked(),'Default AI should be reflected in the form');
    await noOverflow(page,profile+' setup');
    await click(page,'Elegir carpeta →');await click(page,'Buscar carpeta en este equipo');await click(page,'Revisar preparación →');await click(page,'Preparar proyecto →');
    if(['software','unity'].includes(profile)){await heading(page,'Un proceso claro para desarrollar.');await click(page,'Aplicar entorno →');}
    await heading(page,'Fuentes a la mano, con sus límites claros.');
    await page.getByText('Excluir materiales de este contexto',{exact:true}).click();await page.getByLabel('Una ruta relativa por línea').fill('private-notes.txt');await click(page,'Revisar con estas exclusiones');
    await click(page,'Guardar contexto y continuar →');
    if(['software','unity'].includes(profile)){await heading(page,'Conectemos el contexto con tus instrucciones.');await click(page,'Sincronizar instrucciones');await heading(page,'Una última actualización del mapa.');await click(page,'Guardar y ver mi proyecto');}
    await heading(page,name);assert.equal(await page.locator('#view img').count(),0);
    await click(page,'Buscar fuentes');await page.getByLabel('¿Qué necesitas encontrar?').fill('tokens');await click(page,'Buscar');
    await page.locator('.result').first().waitFor();const resultText=await page.locator('#search-results').innerText();assert(resultText.includes('notes.txt'));assert(!resultText.includes('private-notes.txt'));
    if(profile==='research'){assert(resultText.includes('paper.pdf · página 1'));assert(resultText.includes('protocol.docx · párrafo 1'));await capture(page,'research-sources');}
    await click(page,'Preparar contexto para compartir');await page.getByRole('dialog').waitFor();assert.equal(copied.length,0);await page.keyboard.press('Escape');
    await page.waitForFunction(()=>document.activeElement.textContent==='Preparar contexto para compartir');
    await click(page,'Preparar contexto para compartir');await click(page,'Copiar este contexto');assert.equal(copied.length,1);assert(copied[0].includes('notes.txt'));assert.equal(opened.length,0);
    await click(page,'Recetas');await page.locator('.recipe').first().waitFor();assert.equal(await page.locator('.recipe').count(),3);
    await click(page,'Continuar con mi IA');await click(page,'Abrir ChatGPT u otro chat web ↗');await page.getByRole('dialog').waitFor();
    const shown=await page.getByLabel('Instrucción inicial').innerText();await click(page,'Copiar instrucción y abrir');assert.equal(copied[1],shown);assert.equal(opened.length,1);
    await click(page,'Tus proyectos');await click(page,'Abrir →');await heading(page,name);
    for(const width of [1180,768,480,240]){await page.setViewportSize({width,height:width===240?410:820});await noOverflow(page,`${profile} ${width}px`);}
    if(profile==='general')await capture(page,'minimum-equivalent-200-percent');
    await page.setViewportSize({width:480,height:820});await click(page,'Privacidad y alcance');await page.keyboard.press('Escape');await page.waitForFunction(()=>document.activeElement.id==='privacy');
    for(const [file,content] of originals)assert.deepEqual(await readFile(path.join(root,file)),content);
    assert.deepEqual(errors,[]);evidence.checks.push(`${profile}: onboarding, reviewed real base/context writes, citations/search, exclusions, recipes, reviewed copy/handoff, reopen, keyboard dialog focus, 1180/768/480/240 CSS widths PASS; native capabilities injected`);
    await context.close();
  }
  evidence.checks.push('No renderer exceptions across five journeys; source markup rendered as text; original documents preserved.');
  await writeFile(path.join(output,'browser-evidence.json'),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence,null,2));
}catch(error){if(browser){const pages=browser.contexts().flatMap(c=>c.pages());if(pages.length){await capture(pages.at(-1),'failure');console.error((await pages.at(-1).locator('body').innerText()).slice(-6000));}}throw error;}
finally{await browser?.close();await new Promise(r=>server.close(r));assert(path.dirname(temp)===await realpath(tmpdir())&&path.basename(temp).startsWith('peos-desktop-ui-'));await rm(temp,{recursive:true,force:true});}
