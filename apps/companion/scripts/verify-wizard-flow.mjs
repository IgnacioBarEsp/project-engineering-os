import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir,mkdtemp,readFile,readdir,realpath,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import * as core from 'create-project-engineering-os';
import {ASSETS,CSP} from '../desktop/assets.mjs';
import {createDesktopService,publicError} from '../desktop/service.mjs';
import {finishPreparation} from './wizard-journey.mjs';

const pw=await import(process.env.PROJECT_OS_PLAYWRIGHT_MODULE?pathToFileURL(process.env.PROJECT_OS_PLAYWRIGHT_MODULE).href:'playwright');
const {chromium}=pw.default??pw;
const ui=fileURLToPath(new URL('../ui/',import.meta.url));
const files=new Map([['/',ASSETS.get('/index.html')],...ASSETS]);
const server=createServer(async(req,res)=>{
  if(req.method!=='GET'||!files.has(req.url)){res.writeHead(404);res.end();return;}
  const file=req.url==='/'?'/index.html':req.url;
  res.setHeader('Content-Type',files.get(req.url));res.setHeader('Content-Security-Policy',CSP);
  res.end(await readFile(path.join(ui,file.slice(1))));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}`;
const temp=await realpath(await mkdtemp(path.join(tmpdir(),'peos-wizard-flow-')));
const browser=await chromium.launch({...(process.platform==='win32'?{channel:'msedge'}:{}),headless:true});
const results=[];
async function journey(profile,focus,route){
  const root=path.join(temp,`${profile}-${route}`),dataRoot=path.join(temp,`${profile}-${route}-data`);
  await mkdir(root);await writeFile(path.join(root,'notes.txt'),'A source document.');
  const copied=[],serviceOptions={dataRoot,core,chooseFolder:async()=>root,copyText:async text=>copied.push(text),openExternal:async()=>{}};
  let service=await createDesktopService(serviceOptions);
  const viewport=route==='quick'?{width:1180,height:820}:{width:1024,height:700};
  const context=await browser.newContext({viewport,reducedMotion:route==='quick'?'reduce':'no-preference'});
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.exposeFunction('qaCall',async(name,input)=>{
    if(!Object.hasOwn(service,name))return {ok:false,error:{message:`Unknown ${name}`}};
    try{return {ok:true,value:await service[name](input)};}catch(error){return {ok:false,error:publicError(error)};}
  });
  await page.addInitScript(methods=>{window.companion=Object.fromEntries(methods.map(name=>[name,input=>window.qaCall(name,input??{})]));window.companion.onProgress=()=>()=>{};},Object.keys(service));
  const button=name=>page.getByRole('button',{name,exact:true});
  const heading=name=>page.getByRole('heading',{name,exact:true}).waitFor();
  try{
    await page.goto(url);await heading('Dale a tu IA un buen punto de partida.');
    await button('Preparar proyecto').last().click();await heading('¿Qué vas a preparar?');
    if(viewport.width===1180){const size=await page.locator('#content').evaluate(node=>({scroll:node.scrollHeight,client:node.clientHeight,
      parts:[...document.querySelectorAll('.wizard-content > *, .wizard-content form > *, .wizard-footer')].map(element=>[element.tagName,element.className,Math.round(element.getBoundingClientRect().height),Math.round(element.getBoundingClientRect().top)])}));
      assert.ok(size.scroll<=size.client+1,`Tu proyecto necesita scroll a 1180×820: ${JSON.stringify(size)}`);}
    await button('Elegir carpeta').click();await page.locator('#wizard-name').fill(`Proyecto ${profile}`);
    await page.locator(`input[name="profile"][value="${profile}"]`).check();
    if(viewport.width===1180){const size=await page.locator('#content').evaluate(node=>({scroll:node.scrollHeight,client:node.clientHeight}));
      assert.ok(size.scroll<=size.client+1,`Tu proyecto completo necesita scroll a 1180×820: ${JSON.stringify(size)}`);}
    await button('Continuar a Enfoque  →').click();await heading('¿Qué tipo de trabajo harás?');
    await page.locator(`input[name="focus"][value="${focus}"]`).check();
    if(profile==='software'){
      await page.locator('input[name="stack-decision"][value="chosen"]').check();
      await page.locator('input[name="stack"][value="typed-code"]').check();
    }
    await button('Continuar a Visión  →').click();await heading('Cuéntalo en tus palabras');
    await page.locator('#vision-goal').fill('Comprobar este recorrido sin inventar resultados');
    await button('Cuatro apartados').click();
    assert.equal(await page.locator('.wizard-section').count(),4);
    for(const [summary,id,text] of [['Para quién','audience','Mi equipo'],['Qué existe ya','existing','Mis notas'],['Qué no entra','outside','No publicar todavía']]){
      await page.getByText(summary,{exact:true}).click();await page.locator('#'+id).fill(text);
    }
    await button('Modo libre').click();await page.locator('#vision-free').fill('Solo mis palabras: una investigación con fuentes y tokens.');
    await button('Cuatro apartados').click();
    await page.getByText('Para quién',{exact:true}).click();
    assert.equal(await page.locator('#audience').inputValue(),'Mi equipo');
    await button('Modo libre').click();
    assert.equal(await page.locator('#vision-free').inputValue(),'Solo mis palabras: una investigación con fuentes y tokens.');
    await button('Ver PROJECT_VISION.md antes de guardar').click();
    assert.match(await page.locator('.wizard-preview').innerText(),/Comprobar este recorrido/);
    await button('Continuar a Preparar  →').click();await heading('Cómo quieres continuar');
    if(profile==='software'&&route==='quick'){
      await page.locator('input[name="agent"][value="web"]').click();
      await page.getByText('Elige al menos una IA.',{exact:true}).waitFor();
      assert.equal(await page.locator('input[name="agent"][value="web"]').isChecked(),true);
    }
    await page.locator(`input[name="install-mode"][value="${route}"]`).check();
    await page.locator('input[name="agent"][value="codex"]').check();
    const count=await page.locator('.wizard-file-plan li').count();assert.ok(count>0);
    const primary=await button('Guardar la preparación revisada  →').boundingBox();
    assert.ok(primary&&primary.y>=0&&primary.y+primary.height<=viewport.height,`Preparar oculta el botón principal a ${viewport.width}×${viewport.height}`);
    if(profile==='software'&&route==='ai'){
      await page.locator('.wizard-rail .step-back').first().click();await heading('¿Qué vas a preparar?');
      assert.equal(await page.locator('#wizard-name').inputValue(),'Proyecto software');
      assert.equal(await page.locator('.path').first().innerText(),root);
      await button('Continuar a Enfoque  →').click();await heading('¿Qué tipo de trabajo harás?');
      assert.equal(await page.locator('input[name="focus"]:checked').inputValue(),'website');
      assert.equal(await page.locator('input[name="stack-decision"]:checked').inputValue(),'chosen');
      assert.equal(await page.locator('input[name="stack"][value="typed-code"]').isChecked(),true);
      await button('Continuar a Visión  →').click();await heading('Cuéntalo en tus palabras');
      assert.equal(await page.locator('#vision-goal').inputValue(),'Comprobar este recorrido sin inventar resultados');
      assert.equal(await page.locator('#vision-free').inputValue(),'Solo mis palabras: una investigación con fuentes y tokens.');
      await button('Continuar a Preparar  →').click();await heading('Cómo quieres continuar');
      assert.equal(await page.locator('input[name="install-mode"]:checked').inputValue(),'ai');
      assert.equal(await page.locator('input[name="agent"][value="codex"]').isChecked(),true);
    }
    await button('Guardar la preparación revisada  →').click();
    const stages=await finishPreparation(page,{allowUnavailable:profile==='software'&&route==='quick'});
    await heading('Resultado de la preparación');
    const checked=await service.preparationResult({id:(await service.listProjects())[0].id});
    assert.ok(checked.done.includes('base')&&checked.done.includes('context'));
    if(profile==='software')assert.ok(checked.pending.includes('environment'));
    else assert.deepEqual(checked.pending,[]);
    const written=await readFile(path.join(root,'PROJECT_VISION.md'),'utf8');
    assert.match(written,/Comprobar este recorrido/);
    assert.equal((await service.listProjects()).length,1);
    assert.equal(await service.draftLoad(),null);
    assert.deepEqual(errors,[]);
    results.push({profile,route,stages,files:count,errors:errors.length});
  }catch(error){
    const visible=await page.locator('#feedback').innerText().catch(()=>'');
    throw new Error(`${profile}/${route}: ${error.message}\nFeedback: ${visible}\nPage: ${await page.locator('#view').innerText().catch(()=>'')}`);
  }finally{await context.close();}
}
async function resumeJourney(){
  const root=path.join(temp,'resume'),dataRoot=path.join(temp,'resume-data');await mkdir(root);
  await writeFile(path.join(root,'notes.txt'),'The original source.');
  const options={dataRoot,core,chooseFolder:async()=>root,copyText:async()=>{},openExternal:async()=>{}};
  let service=await createDesktopService(options);
  const context=await browser.newContext({viewport:{width:1180,height:820}}),page=await context.newPage();
  await page.exposeFunction('qaCall',async(name,input)=>{
    try{return {ok:true,value:await service[name](input)};}catch(error){return {ok:false,error:publicError(error)};}
  });
  await page.addInitScript(methods=>{window.companion=Object.fromEntries(methods.map(name=>[name,input=>window.qaCall(name,input??{})]));window.companion.onProgress=()=>()=>{};},Object.keys(service));
  try{
    await page.goto(url);await page.getByRole('heading',{name:'Dale a tu IA un buen punto de partida.'}).waitFor();
    await page.getByRole('button',{name:'Preparar proyecto',exact:true}).last().click();
    await page.getByRole('button',{name:'Elegir carpeta',exact:true}).click();
    await page.locator('#wizard-name').fill('Borrador reanudado');
    await page.getByRole('button',{name:'Continuar a Enfoque  →',exact:true}).click();
    await page.getByRole('button',{name:'Continuar a Visión  →',exact:true}).click();
    await page.locator('#vision-goal').fill('Conservar todas mis respuestas tras cerrar');
    await page.locator('#vision-free').fill('Material que escribí yo y que no debe perderse.');
    await page.waitForTimeout(350);
    assert.deepEqual(await readdir(root),['notes.txt']);
    service=await createDesktopService(options);await page.reload();
    await page.getByRole('button',{name:'Continuar borrador',exact:true}).click();
    await page.getByRole('heading',{name:'Cuéntalo en tus palabras',exact:true}).waitFor();
    assert.equal(await page.locator('#vision-goal').inputValue(),'Conservar todas mis respuestas tras cerrar');
    assert.equal(await page.locator('#vision-free').inputValue(),'Material que escribí yo y que no debe perderse.');
    assert.equal((await service.draftLoad()).project.root,root);
    assert.deepEqual(await readdir(root),['notes.txt']);
    results.push({case:'restart',answers:'preserved',projectWrites:0});
  }finally{await context.close();}
}
async function existingFolderJourney(){
  const root=path.join(temp,'software-quick'),dataRoot=path.join(temp,'software-quick-data');
  const service=await createDesktopService({dataRoot,core,chooseFolder:async()=>root,copyText:async()=>{},openExternal:async()=>{}});
  const context=await browser.newContext({viewport:{width:1180,height:820}}),page=await context.newPage();
  await page.exposeFunction('qaCall',async(name,input)=>{
    try{return {ok:true,value:await service[name](input)};}catch(error){return {ok:false,error:publicError(error)};}
  });
  await page.addInitScript(methods=>{window.companion=Object.fromEntries(methods.map(name=>[name,input=>window.qaCall(name,input??{})]));window.companion.onProgress=()=>()=>{};},Object.keys(service));
  try{
    await page.goto(url);await page.getByRole('heading',{name:'Dale a tu IA un buen punto de partida.'}).waitFor();
    await page.getByRole('button',{name:'Abrir una carpeta existente',exact:true}).click();
    await page.getByRole('heading',{name:'Proyecto software',exact:true}).waitFor();
    assert.equal(await page.locator('#feedback').isVisible(),false);
    assert.equal(await page.locator('#view h1').innerText(),'Proyecto software');
    results.push({case:'existing folder',destination:'workspace',nameInvalid:false});
  }finally{await context.close();}
}
try{
  for(const [profile,focus] of [['software','website'],['research','paper'],['studies','course'],['content','manual'],['business','plan'],['personal','open']]){
    for(const route of ['quick','ai'])await journey(profile,focus,route);
  }
  await resumeJourney();await existingFolderJourney();
  process.stdout.write(JSON.stringify({journeys:12,additional:2,results},null,2)+'\n');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));await rm(temp,{recursive:true,force:true});}
