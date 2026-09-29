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
import {QUALITY,assertCoverage} from './quality-probes.mjs';
import {REACH,INTERACTIVE,reachProblems} from './interface-contract.mjs';
import {routeFor} from '../ui/lib/router.mjs';
import {PROFILE_IDS,PROFILES} from '../engine/profiles.mjs';
const WINDOWS=[[1180,820],[1024,700],[480,540]],MOTIONS=['no-preference','reduce'];

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
const output=process.argv[2]??path.join(tmpdir(),'project-os-closeout','companion-ui');
await mkdir(output,{recursive:true});
async function journey(profile,focus,route,motion,width,height){
  const root=path.join(temp,`${profile}-${route}-${motion}-${width}`),dataRoot=path.join(temp,`${profile}-${route}-${motion}-${width}-data`);
  await mkdir(root);await writeFile(path.join(root,'notes.txt'),'A source document.');
  const copied=[],serviceOptions={dataRoot,core,chooseFolder:async()=>root,copyText:async text=>copied.push(text),openExternal:async()=>{}};
  let service=await createDesktopService(serviceOptions);
  const viewport={width,height};
  const context=await browser.newContext({viewport,reducedMotion:motion});
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.exposeFunction('qaCall',async(name,input)=>{
    if(!Object.hasOwn(service,name))return {ok:false,error:{message:`Unknown ${name}`}};
    try{return {ok:true,value:await service[name](input)};}catch(error){return {ok:false,error:publicError(error)};}
  });
  await page.addInitScript(methods=>{window.companion=Object.fromEntries(methods.map(name=>[name,input=>window.qaCall(name,input??{})]));window.companion.onProgress=()=>()=>{};},Object.keys(service));
  const button=name=>page.getByRole('button',{name,exact:true});
  const screens=[];
  const measure=async()=>{
    await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
    await page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))));
    const current=await page.evaluate(async()=>{const {state}=await import('/lib/core.mjs');return {page:state.page,tab:state.tab};});
    const expected=routeFor(current.page,current);
    if(current.page==='delimitation')expected.focuses=PROFILES[profile].focuses.map(item=>item.id);
    const quality=await page.evaluate(QUALITY,expected),reach=await page.evaluate(REACH,INTERACTIVE);
    assert.deepEqual(quality.issues,[],JSON.stringify({profile,route,motion,width,page:current.page,quality}));
    assert.deepEqual(reachProblems(reach),[]);
    screens.push({page:current.page,quality,controls:reach.controls.length});
  };
  const heading=async name=>{await page.getByRole('heading',{name,exact:true}).waitFor();await measure();};
  try{
    await page.goto(url);await heading('Prepara tus proyectos con Project Engineering OS');
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
    // Agent changes persist and asynchronously rebuild the plan. Measure the new screen,
    // not the old scrolled form while its save is still in flight.
    await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
    await page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))));
    const count=await page.locator('.wizard-file-plan li').count();assert.ok(count>0);
    const primary=await button('Guardar la preparación revisada  →').boundingBox();
    assert.ok(primary&&primary.y>=0&&primary.y+primary.height<=viewport.height,`Preparar oculta el botón principal a ${viewport.width}×${viewport.height}: ${JSON.stringify(primary)}`);
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
    const stages=await finishPreparation(page,{allowUnavailable:profile==='software'&&route==='quick',measure});
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
    results.push({profile,route,motion,window:width+'x'+height,stages,files:count,errors:errors.length,screens});
  }catch(error){
    const visible=await page.locator('#feedback').innerText().catch(()=>'');
    throw new Error(`${profile}/${route}: ${error.message}\nFeedback: ${visible}\nPage: ${await page.locator('#view').innerText().catch(()=>'')}`);
  }finally{await context.close();}
}
async function resumeJourney(motion){
  const root=path.join(temp,'resume-'+motion),dataRoot=path.join(temp,'resume-data-'+motion);await mkdir(root);
  await writeFile(path.join(root,'notes.txt'),'The original source.');
  const options={dataRoot,core,chooseFolder:async()=>root,copyText:async()=>{},openExternal:async()=>{}};
  let service=await createDesktopService(options);
  const context=await browser.newContext({viewport:{width:1180,height:820},reducedMotion:motion}),page=await context.newPage();
  await page.exposeFunction('qaCall',async(name,input)=>{
    try{return {ok:true,value:await service[name](input)};}catch(error){return {ok:false,error:publicError(error)};}
  });
  await page.addInitScript(methods=>{window.companion=Object.fromEntries(methods.map(name=>[name,input=>window.qaCall(name,input??{})]));window.companion.onProgress=()=>()=>{};},Object.keys(service));
  try{
    await page.goto(url);await page.getByRole('heading',{name:'Prepara tus proyectos con Project Engineering OS'}).waitFor();
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
    results.push({case:'restart',motion,answers:'preserved',projectWrites:0});
  }finally{await context.close();}
}
async function existingFolderJourney(motion,width,height){
  const root=path.join(temp,`software-quick-${motion}-${width}`),dataRoot=root+'-data';
  let picked=root;
  const service=await createDesktopService({dataRoot,core,chooseFolder:async()=>picked,copyText:async()=>{},openExternal:async()=>{}});
  const context=await browser.newContext({viewport:{width,height},reducedMotion:motion}),page=await context.newPage(),screens=[];
  const measure=async()=>{
    await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
    await page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))));
    const current=await page.evaluate(async()=>{const {state}=await import('/lib/core.mjs');return {page:state.page,tab:state.tab};});
    const quality=await page.evaluate(QUALITY,routeFor(current.page,current));assert.deepEqual(quality.issues,[]);
    assert.deepEqual(reachProblems(await page.evaluate(REACH,INTERACTIVE)),[]);screens.push({page:current.page,quality});
  };
  await page.exposeFunction('qaCall',async(name,input)=>{
    try{return {ok:true,value:await service[name](input)};}catch(error){return {ok:false,error:publicError(error)};}
  });
  await page.addInitScript(methods=>{window.companion=Object.fromEntries(methods.map(name=>[name,input=>window.qaCall(name,input??{})]));window.companion.onProgress=()=>()=>{};},Object.keys(service));
  try{
    await page.goto(url);await page.getByRole('heading',{name:'Prepara tus proyectos con Project Engineering OS'}).waitFor();
    await page.getByRole('button',{name:'Abrir una carpeta existente',exact:true}).click();
    await page.getByRole('heading',{name:'Proyecto software',exact:true}).waitFor();
    assert.equal(await page.locator('#feedback').isVisible(),false);
    assert.equal(await page.locator('#view h1').innerText(),'Proyecto software');
    await measure();
    const before=(await readdir(root,{recursive:true})).sort(),original=await readFile(path.join(root,'notes.txt'));
    await page.locator('#nav [data-action="open-project-list"]').click();await measure();
    await page.locator('article.project details.more > summary').click();
    await page.locator('[data-row-action="forget-project"]').click();await page.getByRole('dialog').waitFor();
    await page.getByRole('dialog').getByRole('button',{name:'Quitar de la lista',exact:true}).click();await measure();
    assert.equal((await service.listProjects()).length,0);
    assert.deepEqual((await readdir(root,{recursive:true})).sort(),before);
    assert.deepEqual(await readFile(path.join(root,'notes.txt')),original);
    picked=path.join(temp,`unprepared-${motion}-${width}`);await mkdir(picked);await writeFile(path.join(picked,'source.txt'),'Original sin preparar');
    await page.locator('#nav [data-action="open-start"]').click();await measure();
    await page.getByRole('button',{name:'Abrir una carpeta existente',exact:true}).click();await measure();
    assert.equal(await page.locator('#view h1').innerText(),'¿Qué vas a preparar?');
    assert.equal(await page.locator('.wizard-folder .path').innerText(),picked);
    assert.deepEqual(await readdir(picked),['source.txt']);
    results.push({case:'existing prepared / forget / unprepared',motion,window:width+'x'+height,preparedDestination:'workspace',unpreparedDestination:'setup',originals:'preserved',screens});
  }finally{await context.close();}
}
try{
  for(const [profile,focus] of [['software','website'],['research','paper'],['studies','course'],['content','manual'],['business','plan'],['personal','open']]){
    for(const route of ['quick','ai'])for(const motion of MOTIONS)for(const [width,height] of WINDOWS)await journey(profile,focus,route,motion,width,height);
  }
  for(const motion of MOTIONS){await resumeJourney(motion);for(const [width,height] of WINDOWS)await existingFolderJourney(motion,width,height);}
  const matrix=results.filter(item=>item.profile);
  const cells=new Set(matrix.map(item=>[item.profile,item.route,item.motion,item.window].join('|')));
  assert.deepEqual(assertCoverage({routes:[],cells:true,profiles:PROFILE_IDS,choices:['quick','ai'],motions:MOTIONS,windows:WINDOWS.map(w=>w.join('x')),observedCells:cells}),[]);
  const summary={journeys:matrix.length,additional:results.length-matrix.length,screens:matrix.reduce((sum,item)=>sum+item.screens.length,0),errors:0};
  await writeFile(path.join(output,'profile-matrix.json'),JSON.stringify({scope:'Real renderer and service; native transport injected; no managed tools downloaded',...summary,results},null,2)+'\n');
  console.log(JSON.stringify(summary,null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));await rm(temp,{recursive:true,force:true});}
