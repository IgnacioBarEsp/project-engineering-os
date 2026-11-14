import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdtemp,readFile,rm,realpath} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium,_electron} from 'playwright';
import * as core from 'create-project-engineering-os';
import {createDesktopService,publicError} from '../desktop/service.mjs';
import {ASSETS,CSP} from '../desktop/assets.mjs';
import {ACCESSIBILITY} from './interface-contract.mjs';
import {AMBIENT} from './ambient-contract.mjs';

const native=process.argv.includes('--native');
const appRoot=fileURLToPath(new URL('../',import.meta.url)),temp=await realpath(await mkdtemp(path.join(tmpdir(),'peos-motion-')));
let browser,application,server,clipboard='',failCopy=false;const results=[];
try{
  const service=await createDesktopService({dataRoot:path.join(temp,'data'),core,copyText:async text=>{if(failCopy)throw Error('Clipboard unavailable');clipboard=text;}});
  if(!native){
    server=createServer(async(req,res)=>{const file=req.url==='/'?'/index.html':req.url;if(!ASSETS.has(file)){res.writeHead(404);res.end();return;}
      res.setHeader('Content-Type',ASSETS.get(file));res.setHeader('Content-Security-Policy',CSP);res.end(await readFile(path.join(appRoot,'ui',file.slice(1))));});
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    browser=await chromium.launch({...(process.platform==='win32'?{channel:'msedge'}:{}),headless:true});
  }else{
    assert.equal(process.platform,'win32');
    application=await _electron.launch({executablePath:path.join(appRoot,'node_modules/electron/dist/electron.exe'),args:['.', '--user-data-dir='+path.join(temp,'native')],cwd:appRoot});
  }
  for(const motion of ['no-preference','reduce']){
    const page=native?await application.firstWindow():await browser.newPage();
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.emulateMedia({reducedMotion:motion});
    await page.clock.install();
    if(!native){
      await page.exposeFunction('qaCall',async(name,input)=>{try{return {ok:true,value:await service[name](input)};}catch(error){return {ok:false,error:publicError(error)};}});
      await page.addInitScript(methods=>{window.companion=Object.fromEntries(methods.map(name=>[name,input=>window.qaCall(name,input??{})]));window.companion.onProgress=()=>()=>{};},Object.keys(service));
      await page.goto('http://127.0.0.1:'+server.address().port);
    }
    await page.locator('#nav [data-action="open-help"]').waitFor();
    await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
    await page.evaluate(()=>{window.__vt=0;const original=document.startViewTransition?.bind(document);
      if(original)document.startViewTransition=(...args)=>{window.__vt++;return original(...args);};});
    for(const id of ['open-help','open-project-list','open-start','prepare-project']){
      await page.locator('#nav [data-action="'+id+'"]').click();
      await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
    }
    assert.equal(await page.evaluate(()=>document.activeElement.tagName),'H1');
    const transitions=await page.evaluate(()=>window.__vt);
    assert.equal(transitions>0,motion==='no-preference');
    // Time-controlled component checks use the actual components and transport. Counts are injected
    // here (not claimed as service-operation evidence); the native clipboard itself is never injected.
    await page.evaluate(async()=>{
      const {state,el,render,wizardBar,btn}=await import('/lib/core.mjs');
      state.page='install';
      await render([el('h1',{tabindex:'-1',text:'Prueba de componentes'})],null,wizardBar(btn('Acción de prueba',async()=>{})));
      const {copyButton}=await import('/components/copy-button.mjs');
      document.querySelector('#view .enter').append(copyButton('Copiar prueba','Copiado','Prueba copiada.','Texto exacto: áéí — 149'));
    });
    await page.clock.pauseAt(await page.evaluate(()=>Date.now()+100));
    await page.evaluate(async()=>{const {notice}=await import('/lib/core.mjs');notice('Uno');notice('Dos');notice('Tres');});
    assert.deepEqual(await page.locator('.toast').allTextContents(),['Dos','Tres']);
    assert.equal(await page.locator('#notice').getAttribute('aria-live'),'polite');
    await page.clock.runFor(3999);assert.equal(await page.locator('.toast').count(),2);
    await page.clock.runFor(1);assert.equal(await page.locator('.toast').count(),0);
    await page.getByRole('button',{name:'Copiar prueba',exact:true}).click();
    await page.getByRole('button',{name:'Copiado',exact:true}).waitFor();
    assert.equal(native?await application.evaluate(({clipboard})=>clipboard.readText()):clipboard,'Texto exacto: áéí — 149');
    await page.clock.runFor(1999);assert.equal(await page.getByRole('button',{name:'Copiado',exact:true}).count(),1);
    await page.clock.runFor(1);assert.equal(await page.getByRole('button',{name:'Copiar prueba',exact:true}).count(),1);
    if(native)await application.evaluate(({clipboard})=>{globalThis.__writeClipboard=clipboard.writeText;clipboard.writeText=()=>{throw Error('QA clipboard unavailable');};});
    else failCopy=true;
    await page.getByRole('button',{name:'Copiar prueba',exact:true}).click();await page.locator('#feedback:not([hidden])').waitFor();
    assert.equal(await page.getByRole('button',{name:'Copiado',exact:true}).count(),0);assert.equal(await page.locator('.toast').count(),0);
    if(native)await application.evaluate(({clipboard})=>{clipboard.writeText=globalThis.__writeClipboard;delete globalThis.__writeClipboard;});
    else failCopy=false;
    const progress=async value=>page.evaluate(async value=>{(await import('/components/progress.mjs')).updateProgress(value);},value);
    await progress({stage:'reading',label:'Leyendo archivos'});
    await page.clock.runFor(999);assert.equal(await page.locator('#activity').isVisible(),false);
    await page.clock.runFor(1);assert.equal(await page.locator('#activity').isVisible(),true);
    assert.equal(await page.locator('#activity progress').getAttribute('value'),null);
    await progress({stage:'reading',label:'Leyendo archivos',completed:2,total:7});
    assert.equal(await page.locator('#activity progress').getAttribute('max'),'7');
    assert.equal(await page.locator('#activity progress').getAttribute('value'),'2');
    await page.clock.runFor(9000);assert.match(await page.locator('.activity-hint').innerText(),/detener/);
    assert.equal(await page.locator('.wizard-footer #activity').count(),1);
    assert.equal(await page.locator('#cancel').isEnabled(),true);
    await page.getByRole('button',{name:'Detener',exact:true}).click();
    await page.waitForFunction(()=>document.getElementById('activity-text').textContent.startsWith('Deteniendo'));
    await progress({stage:'idle'});assert.equal(await page.locator('#activity').isVisible(),false);
    // Check actual computed styles in rest, hover, focus, disabled and pressed states.
    await page.clock.resume();
    const control=page.getByRole('button',{name:'Copiar prueba',exact:true});
    const styles=[];
    for(const mode of ['rest','hover','focus','disabled','pressed']){
      if(mode==='hover')await control.hover();
      if(mode==='focus')await control.focus();
      if(mode==='disabled')await control.evaluate(node=>{node.disabled=true;});
      if(mode==='disabled')assert.equal(await control.evaluate(node=>getComputedStyle(node).opacity),'1');
      if(mode==='pressed'){await control.evaluate(node=>{node.disabled=false;});await control.hover();await page.mouse.down();}
      // Finish finite animations so contrast is not sampled halfway between two valid states.
      await page.evaluate(()=>Promise.all(document.getAnimations()
        .filter(animation=>animation.effect?.getComputedTiming().iterations!==Infinity)
        .map(animation=>animation.finished.catch(()=>{}))));
      const result=await page.evaluate(mode=>{
        const nodes=[...document.querySelectorAll('#view *')],issues=[];let animated=0;
        for(const node of nodes){
          const s=getComputedStyle(node);
          for(const key of ['animationDuration','transitionDuration']){
            const values=s[key].split(',').map(value=>parseFloat(value)*1000);
            if(values.some(value=>value>0))animated++;
            if(values.some(value=>value>300))issues.push(mode+': '+key);
          }
          if(s.animationTimingFunction.includes('ease-in')||s.transitionTimingFunction.includes('ease-in'))issues.push(mode+': ease-in');
        }
        return {mode,measured:nodes.length,animated,issues};
      },mode);
      assert.ok(result.measured>4);assert.deepEqual(result.issues,[]);
      if(motion==='reduce')assert.equal(result.animated,0);
      const contrast=await page.evaluate(ACCESSIBILITY);assert.ok(contrast.measured>0);assert.deepEqual(contrast.contrast,[]);
      styles.push(result);
      if(mode==='pressed')await page.mouse.up();
    }
    assert.deepEqual(errors,[]);
    const ambient=await page.evaluate(AMBIENT);assert.deepEqual(ambient.problems,[]);
    results.push({motion,transitions,clipboard:native?'native exact bytes + native failure':'injected transport success/failure',toasts:'max 2, 3999/4000 ms',copy:'1999/2000 ms',progress:'999/1000 ms, 2/7 real inputs, 10s stage + cancel, footer',styles,ambient});
    if(!native)await page.close();
  }
  console.log(JSON.stringify({scope:native?'Electron Windows source app, actual clipboard; progress events controlled':'Browser components with real local service; native surfaces injected',results},null,2));
}finally{
  await application?.close();await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));
  assert.ok(path.basename(temp).startsWith('peos-motion-')&&path.dirname(temp)===await realpath(tmpdir()));
  await rm(temp,{recursive:true,force:true});
}
