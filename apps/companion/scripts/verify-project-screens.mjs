import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdtemp,mkdir,readFile,writeFile,realpath,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as core from 'create-project-engineering-os';
import {chromium} from 'playwright';
import {ASSETS,CSP} from '../desktop/assets.mjs';
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
const service=await createDesktopService({dataRoot:path.join(temp,'data'),core,chooseFolder:async()=>chosen,copyText:async()=>{},openExternal:async()=>{}});
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
    page.on('pageerror',error=>errors.push(error.message));let hold=false,hang=false,releaseList;const calls=[];
    await page.exposeFunction('qaCall',async(name,input)=>{calls.push(name);try{
      if(name==='listProjects'){if(hang)return await new Promise(()=>{});if(hold)await new Promise(resolve=>releaseList=resolve);}
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
    assert.equal(await page.locator('#project-panel h2').first().innerText(),'Qué hacer ahora');
    assert.deepEqual(repeatedActions(await page.evaluate(ACTION_COUNTS)),[]);
    const identity=(await page.url()).split('/project/')[1].split('/')[0];
    for(const width of [1180,1024,768,480]){
      await page.setViewportSize({width,height:820});
      for(const [tab,key] of [['search','ArrowRight'],['recipes','ArrowRight'],['handoff','End'],['overview','Home']]){
        await page.locator('.project-segments [aria-pressed="true"]').focus();await page.keyboard.press(key);await page.keyboard.press('Enter');
        await page.locator(`#project-panel[data-project-tab="${tab}"]`).waitFor();
        await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
        assert.equal(await page.locator('.project-segments [aria-pressed="true"]').count(),1);
        assert.equal(await page.locator('#project-panel').count(),1);assert.equal(await page.evaluate(()=>document.activeElement.dataset.projectSegment),tab);
        assert.ok(page.url().endsWith(`/project/${identity}/${tab}`));
        assert.equal(await page.locator('.guide').count(),tab==='overview'?1:0);
        assert.equal(await page.locator('#query').count(),tab==='search'?1:0);
        assert.equal(await page.locator('.recipe').count()>0,tab==='recipes');
        assert.equal(await page.getByRole('heading',{name:'Quién escribe estas instrucciones',exact:true}).count(),tab==='handoff'?1:0);
        const a11y=await page.evaluate(ACCESSIBILITY);assert.ok(a11y.measured>0);
        assert.deepEqual(a11y.contrast,[]);assert.deepEqual(a11y.headingOrder,[]);assert.deepEqual(a11y.brokenWords,[]);
        assert.ok(await page.locator('#content').evaluate(node=>node.scrollWidth<=node.clientWidth+1),`${tab}/${width}: overflow`);
        results.push({motion,width,tab});
        if(captureOutput&&motion==='no-preference'&&width===1180&&tab==='search')
          await page.screenshot({path:path.join(captureOutput,'export-control-browser.png')});
      }
    }
    const before=calls.length;
    await page.evaluate(()=>{location.hash='#/project/foreign/search';});await page.clock.runFor(50);
    assert.equal(calls.length,before);assert.equal(await page.locator('#project-panel').getAttribute('data-project-tab'),'overview');
    await page.evaluate(id=>{location.hash=`#/project/${id}/search`;},identity);await page.locator('#project-panel[data-project-tab="search"]').waitFor();
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
  console.log(JSON.stringify({scope:'Real browser renderer/service; native surfaces injected',screens:results.length,results,loading:'299 ms none / 300 ms shown / 10 s error',rows:'four verified, one unreadable',originals:5,errors:0},null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));await rm(temp,{recursive:true,force:true});}
