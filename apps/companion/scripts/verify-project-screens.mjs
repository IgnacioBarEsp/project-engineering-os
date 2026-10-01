import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdtemp,mkdir,readFile,writeFile,realpath,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as core from 'create-project-engineering-os';
import {chromium} from 'playwright';
import {ASSETS,CSP} from '../desktop/assets.mjs';
import {expandProjectDetails} from './project-disclosures.mjs';
import {createDesktopService,publicError} from '../desktop/service.mjs';
import {ACCESSIBILITY,READY_CLAIMS,readyProblems,GUIDE,guideProblems,ACTION_COUNTS,repeatedActions} from './interface-contract.mjs';

// Real renderer/service/fixtures. Only IPC transport, picker and clipboard are injected.
const temp=await realpath(await mkdtemp(path.join(tmpdir(),'peos-project-screens-')));
const ui=fileURLToPath(new URL('../ui/',import.meta.url));
const server=createServer(async(req,res)=>{const relative=req.url==='/'?'/index.html':req.url;
  if(req.method!=='GET'||!ASSETS.has(relative)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',ASSETS.get(relative));res.setHeader('Content-Security-Policy',CSP);res.end(await readFile(path.join(ui,relative.slice(1))));});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({...(process.platform==='win32'?{channel:'msedge'}:{}),headless:true});
let chosen;
const copied=[],opened=[];
const service=await createDesktopService({dataRoot:path.join(temp,'data'),core,chooseFolder:async()=>chosen,copyText:async text=>copied.push(text),openExternal:async url=>opened.push(url)});
const entries=[],results=[];
const captureOutput=process.argv[2];
if(captureOutput)await mkdir(captureOutput,{recursive:true});
try{
  for(let i=0;i<5;i++){
    chosen=path.join(temp,`project-${i}`);await mkdir(chosen);await writeFile(path.join(chosen,'source.txt'),'Evidencia original.');
    const project=await service.chooseFolder();
    const plan=await service.previewBase({id:project.id,selection:{name:`Proyecto ${i}`,profile:'research',focus:'open',goal:'Medir navegación',agents:['web'],installMode:'ai'}});
    await service.applyBase({plan:plan.id});const context=await service.previewContext({id:project.id});await service.applyContext({plan:context.id});
    entries.push(project);
  }
  // Malformed owned record in one disposable fixture: the other four must stay readable.
  await writeFile(path.join(entries[4].root,'.project-os','companion','receipt.json'),'{');
  for(const motion of ['reduce','no-preference']){
    const context=await browser.newContext({viewport:{width:1180,height:820},reducedMotion:motion});const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));let hold=false,hang=false,releaseList,holdPreview=false,releasePreview;const calls=[];
    await page.exposeFunction('qaCall',async(name,input)=>{calls.push(name);try{
      if(name==='listProjects'){if(hang)return await new Promise(()=>{});if(hold)await new Promise(resolve=>releaseList=resolve);}
      if(name==='exportPreview'&&holdPreview)await new Promise(resolve=>releasePreview=resolve);
      return {ok:true,value:await service[name](input)};
    }catch(error){return {ok:false,error:publicError(error)};}});
    await page.addInitScript(methods=>{window.companion=Object.fromEntries(methods.map(name=>[name,input=>{if(name==='listProjects')window.__listAt=Date.now();return window.qaCall(name,input??{});} ]));window.companion.onProgress=()=>()=>{};},Object.keys(service));
    const listAge=async age=>{
      for(let count=0;count<100&&await page.evaluate(()=>window.__listAt==null);count++)await page.clock.runFor(20);
      const elapsed=await page.evaluate(()=>window.__slowAt==null?null:Date.now()-window.__slowAt);
      assert.notEqual(elapsed,null,'List skeleton timer was not registered after rendering');
      assert.ok(elapsed<=age,'Test clock has already passed the requested boundary');
      await page.clock.runFor(age-elapsed);
    };
    await page.clock.install({time:new Date('2026-09-26T00:00:00Z')});
    await page.goto(`http://127.0.0.1:${server.address().port}`);await page.locator('#nav [data-action="open-project-list"]').waitFor();
    // Install after Playwright's clock, which replaces the native scheduling functions.
    // Anchor observations to registration rather than the later IPC microtask.
    await page.evaluate(()=>{
      const schedule=window.setTimeout;
      window.setTimeout=function(callback,delay,...args){
        if(delay===300)window.__slowAt=Date.now();
        if(delay===10000)window.__limitAt=Date.now();
        return schedule.call(this,callback,delay,...args);
      };
    });
    // Virtual renderer clock isolates the precise threshold from disk/IPC timing. Hold IPC until observed.
    hold=true;
    await page.locator('#nav [data-action="open-project-list"]').click();
    await page.waitForFunction(()=>window.__listAt!=null);
    await page.clock.pauseAt(await page.evaluate(()=>Date.now()));
    await listAge(299);assert.equal(await page.locator('.project-loading').count(),0);
    await page.clock.runFor(1);assert.equal(await page.locator('.project-loading').count(),3);
    assert.equal(await page.locator('.state-mark').count(),0);
    assert.equal(typeof releaseList,'function');releaseList();
    await page.locator('.project-list[aria-busy="false"]').waitFor();assert.equal(await page.locator('article.project').count(),5);
    assert.equal(await page.locator('.project-loading').count(),0);assert.deepEqual(readyProblems(await page.evaluate(READY_CLAIMS)),[]);
    assert.equal(await page.locator('.state-unreadable').count(),1);assert.equal(await page.locator('.state-verified').count(),4);
    hold=false;
    await page.clock.resume();
    await page.locator('article.project').filter({has:page.locator('.state-verified')}).first().locator('.card-open').click();
    await page.locator('#project-panel[data-project-tab="overview"]').waitFor();
    await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
    assert.deepEqual(guideProblems(await page.evaluate(GUIDE)),[]);
    assert.equal(await page.locator('#project-panel h2').first().innerText(),'Preparación de Companion');
    assert.equal(await page.locator('#project-tools').evaluate(node=>node.open),false);
    assert.deepEqual(repeatedActions(await page.evaluate(ACTION_COUNTS)),[]);
    const identity=(await page.url()).split('/project/')[1].split('/')[0];
    for(const width of [1180,1024,768,480]){
      await page.setViewportSize({width,height:820});
      assert.equal(await page.locator('.project-management').count(),1);
      assert.equal(await page.locator('pre.prompt').first().isVisible(),false);
      const managementAccessibility=await page.evaluate(ACCESSIBILITY);
      assert.ok(managementAccessibility.measured>0);
      assert.deepEqual(managementAccessibility.contrast,[]);
      assert.deepEqual(managementAccessibility.headingOrder,[]);
      assert.deepEqual(managementAccessibility.brokenWords,[]);
      if(captureOutput&&motion==='no-preference'&&[1180,480].includes(width)){
        await page.screenshot({path:path.join(captureOutput,`project-management-browser-${width}.png`),mask:[page.locator('.path')],maskColor:'#232735'});
      }
      const expected=await service.guide({id:identity});
      const actual=await page.evaluate(GUIDE);
      assert.equal(actual.steps.length,expected.steps.length,'Every local and optional guide step remains represented');
      assert.deepEqual(actual.steps.map(step=>[step.title,step.why]),expected.steps.map(step=>[step.title,step.why]));
      await expandProjectDetails(page);assert.deepEqual(repeatedActions(await page.evaluate(ACTION_COUNTS)),[]);
      await page.locator('#project-tools > summary').click();
      for(const [tab,key] of [['search','ArrowRight'],['recipes','ArrowRight'],['handoff','End'],['overview','Home']]){
        await page.locator('.project-segments [aria-pressed="true"]').focus();await page.keyboard.press(key);await page.keyboard.press('Enter');
        await page.locator(`#project-panel[data-project-tab="${tab}"]`).waitFor();
        await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
        assert.equal(await page.locator('.project-segments [aria-pressed="true"]').count(),1);
        assert.equal(await page.locator('#project-panel').count(),1);
        if(tab==='overview')assert.equal(await page.evaluate(()=>document.activeElement===document.querySelector('#project-tools > summary')),true);
        else assert.equal(await page.evaluate(()=>document.activeElement.dataset.projectSegment),tab);
        assert.ok(page.url().endsWith(`/project/${identity}/${tab}`));
        assert.equal(await page.locator('.guide').count(),tab==='overview'?1:0);
        assert.equal(await page.locator('#query').count(),tab==='search'?1:0);
        assert.equal(await page.locator('.recipe').count()>0,tab==='recipes');
        assert.equal(await page.getByRole('heading',{name:'Quién escribe estas instrucciones',exact:true}).count(),tab==='handoff'?1:0);
        if(tab==='search'){
          const searchTask=page.getByRole('region',{name:'Buscar en tus archivos',exact:true});
          const exportTask=page.getByRole('region',{name:'Dale información de tus archivos a tu IA',exact:true});
          const exportAction=exportTask.getByRole('button',{name:'Revisar texto de mis archivos para mi IA',exact:true});
          assert.equal(await searchTask.count(),1);assert.equal(await exportTask.count(),1);
          assert.equal(await exportAction.isDisabled(),true,'Empty-query action must remain disabled after rendering/re-entry');
          const boxes=await page.locator('.files-task').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,bottom:r.bottom};}));
          assert.equal(boxes.length,2);
          if(width>900){assert.ok(Math.abs(boxes[0].y-boxes[1].y)<=1);assert.ok(boxes[1].x>=boxes[0].x+boxes[0].width+15);}
          else{assert.ok(Math.abs(boxes[0].x-boxes[1].x)<=1);assert.ok(boxes[1].y>=boxes[0].bottom+15);}
          const searchCalls=calls.filter(n=>n==='search').length;
          await page.locator('#query').fill('Evidencia');assert.equal(await exportAction.isEnabled(),true);
          assert.equal(calls.filter(n=>n==='search').length,searchCalls,'Preparing text must not require submitting search first');
          if(captureOutput&&motion==='no-preference'&&[1180,480].includes(width)){
            await page.screenshot({path:path.join(captureOutput,`files-tasks-browser-${width}.png`)});
          }
          const copiesBefore=copied.length;
          holdPreview=true;await exportAction.click();
          await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='true');
          assert.equal(await exportAction.isDisabled(),true);assert.equal(await page.locator('#query').isDisabled(),true);
          assert.equal(typeof releasePreview,'function');releasePreview();holdPreview=false;
          await page.getByRole('dialog').waitFor();
          assert.equal(copied.length,copiesBefore,'Opening review must not copy');
          const preview=await page.getByLabel('Texto que se copiará',{exact:true}).innerText();
          assert.ok(preview.includes('source.txt'));assert.ok(preview.includes('Evidencia original.'));
          await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.getElementById('dialog').open);
          assert.equal(copied.length,copiesBefore,'Cancelling review must not copy');
          assert.equal(await exportAction.evaluate(n=>n===document.activeElement),true,'Review returns focus to its own action');
          await exportAction.click();await page.getByRole('dialog').waitFor();
          const reviewed=await page.getByLabel('Texto que se copiará',{exact:true}).innerText();
          await page.getByRole('button',{name:'Copiar este texto',exact:true}).click();
          await page.waitForFunction(()=>!document.getElementById('dialog').open);
          assert.equal(copied.length,copiesBefore+1);assert.equal(copied.at(-1),reviewed);
          assert.equal(opened.length,0,'No external AI or navigation is opened');
          await page.getByText('Texto copiado. Todavía no se ha enviado a ninguna IA.',{exact:true}).waitFor();
          await searchTask.getByRole('button',{name:'Buscar',exact:true}).click();
          await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
          assert.ok(await page.locator('#search-results article.result').count()>0);
          assert.equal(await exportAction.isEnabled(),true,'Nonempty query remains available after search');
          const below=await page.locator('#search-results').evaluate(n=>n.getBoundingClientRect().top>=document.querySelector('.files-tasks').getBoundingClientRect().bottom);
          assert.equal(below,true,'Results must follow both tasks');
          await page.locator('#query').fill('   ');assert.equal(await exportAction.isDisabled(),true);
          await searchTask.getByRole('button',{name:'Buscar',exact:true}).click();
          await page.locator('#feedback:not([hidden])').waitFor();
          await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
          assert.equal(await exportAction.isDisabled(),true,'Error recovery must not enable an empty query');
          await page.locator('#query').fill('');assert.equal(await exportAction.isDisabled(),true);
        }
        const a11y=await page.evaluate(ACCESSIBILITY);assert.ok(a11y.measured>0);
        assert.deepEqual(a11y.contrast,[]);assert.deepEqual(a11y.headingOrder,[]);assert.deepEqual(a11y.brokenWords,[]);
        assert.ok(await page.locator('#content').evaluate(node=>node.scrollWidth<=node.clientWidth+1),`${tab}/${width}: overflow`);
        results.push({motion,width,tab});
      }
    }
    const before=calls.length;
    await page.evaluate(()=>{location.hash='#/project/foreign/search';});await page.clock.runFor(50);
    assert.equal(calls.length,before);assert.equal(await page.locator('#project-panel').getAttribute('data-project-tab'),'overview');
    await page.evaluate(id=>{location.hash=`#/project/${id}/search`;},identity);await page.locator('#project-panel[data-project-tab="search"]').waitFor();
    assert.equal(await page.locator('#project-tools').evaluate(node=>node.open),true,'Direct optional route opens its navigation');
    await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
    await page.locator('#project-tools > summary').click();
    await page.locator('#project-panel[data-project-tab="overview"]').waitFor();
    await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
    assert.equal(await page.locator('#project-tools').evaluate(node=>node.open),false,'Closing optional tools returns to management');
    assert.ok(page.url().endsWith(`/project/${identity}/overview`));
    // Re-entry uses known identities but never stale verdicts. Timeout leaves no endless skeleton.
    await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
    hang=true;await page.evaluate(()=>{window.__listAt=null;});
    await page.locator('#nav [data-action="open-project-list"]').click();
    await page.waitForFunction(()=>window.__listAt!=null);
    await page.clock.pauseAt(await page.evaluate(()=>Date.now()));await listAge(300);
    assert.equal(await page.locator('.project-loading').count(),5);assert.equal(await page.locator('.state-mark').count(),0);
    const limitAge=await page.evaluate(()=>Date.now()-window.__limitAt);
    assert.ok(limitAge<=9999);await page.clock.runFor(9999-limitAge);
    assert.equal(await page.getByRole('heading',{name:'La lista tardó demasiado en responder.'}).count(),0);
    await page.clock.runFor(1);
    await page.getByRole('heading',{name:'La lista tardó demasiado en responder.'}).waitFor();
    assert.equal(await page.locator('.project-loading').count(),0);assert.equal(await page.locator('#content').getAttribute('aria-busy'),'false');
    assert.deepEqual(errors,[]);await context.close();hang=false;
  }
  for(const entry of entries)assert.equal(await readFile(path.join(entry.root,'source.txt'),'utf8'),'Evidencia original.');
  console.log(JSON.stringify({scope:'Real browser renderer/service; native surfaces injected',screens:results.length,results,filesTasks:'8 responsive/motion cells: named regions, query availability, busy/re-entry/error, preview/cancel/explicit copy, results below',exactCopies:copied.length,externalOpens:opened.length,loading:'299 ms none / 300 ms shown / 10 s error',rows:'four verified, one unreadable',originals:5,errors:0},null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));await rm(temp,{recursive:true,force:true});}
