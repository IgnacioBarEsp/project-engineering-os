import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {ASSETS,CSP} from '../desktop/assets.mjs';
import {ROUTES,routeFor} from '../ui/lib/router.mjs';
import {stub,STATUS,PROFILE_CATALOG} from './renderer-fixtures.mjs';
import {QUALITY,assertCoverage} from './quality-probes.mjs';
import {AMBIENT} from './ambient-contract.mjs';
import {REACH,INTERACTIVE,reachProblems,ACCESSIBILITY} from './interface-contract.mjs';
import {finishPreparation} from './wizard-journey.mjs';

const WINDOWS=[[1180,820],[1024,700],[480,540]],MOTIONS=['no-preference','reduce'];
const extended=stub('normal')+[
'{const s='+STATUS+';s.environment.status="not-prepared";',
'const ok=value=>({ok:true,value}),result=async()=>ok({status:s});',
'Object.assign(window.companion,{',
'status:async()=>ok(s),openProject:async()=>ok(s),applyBase:result,declineStack:result,',
'previewEnvironment:async()=>ok({id:"environment-plan",status:"planned",tools:[],engineering:{openspec:"1.6.0",core:"0.5.0",downloadBytes:0},files:[],git:"existing"}),',
'applyEnvironment:async()=>{s.environment.status="prepared";return ok({status:s});},',
'previewEngineering:async()=>ok({id:"engineering-plan",status:"planned",plan:{operations:[]}}),applyEngineering:result,',
'previewActivation:async()=>ok({id:"activation-plan",status:"planned",files:[]}),applyActivation:result,',
'previewContext:async()=>ok({id:"context-plan",files:[],exclude:[],agentStatus:"canonical-planned-sync-required",coverage:{sources:[{path:"notas.txt"}],chunks:1,textBytes:40,excluded:0,limitations:[],complete:true}}),',
'applyContext:async()=>{s.context={context:"current",sources:1};return ok({status:s});},',
'previewSync:async()=>ok({id:"sync-plan",status:"planned",plan:{operations:[]}}),',
'previewCode:async()=>ok({status:"unavailable",message:"El mapa no está disponible en esta prueba.",action:"Continúa con tus documentos."}),',
'previewRepair:async()=>ok({id:null,items:[],blocked:[],message:"No hay herramientas que reemplazar."}),',
'workspace:async()=>ok({recipes:[],graphs:{options:[]}})',
'});}'
].join('\n');
export async function verifyRouteCoverage(output){
  const ui=fileURLToPath(new URL('../ui/',import.meta.url));
  const server=createServer(async(req,res)=>{
    const file=req.url==='/'?'/index.html':req.url;
    if(req.method!=='GET'||!ASSETS.has(file)){res.writeHead(404);res.end();return;}
    res.setHeader('Content-Type',ASSETS.get(file));res.setHeader('Content-Security-Policy',CSP);
    res.end(await readFile(path.join(ui,file.slice(1))));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({...(process.platform==='win32'?{channel:'msedge'}:{}),headless:true});
  const observedRoutes=new Set(),screens=[],negatives=[];
  try{
    for(const [width,height] of WINDOWS)for(const motion of MOTIONS){
      const context=await browser.newContext({viewport:{width,height},reducedMotion:motion}),page=await context.newPage(),errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.addInitScript(extended);
      await page.addInitScript(()=>{
        window.__ipcCopies=[];const copy=window.companion.copyText;
        window.companion.copyText=async input=>{window.__ipcCopies.push(input.text);return copy(input);};
        // This is the renderer-only fixture: native clipboard is verified separately in Electron.
        navigator.clipboard.writeText=async()=>{window.__pageClipboardWrites++;};
      });
      const measure=async()=>{
        await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
        await page.evaluate(()=>Promise.all(document.getAnimations().filter(a=>Number.isFinite(a.effect.getComputedTiming().iterations)).map(a=>a.finished.catch(()=>{}))));
        const current=await page.evaluate(async()=>{const {state}=await import('/lib/core.mjs');return {page:state.page,tab:state.tab,profile:state.selection.profile};});
        const expected=routeFor(current.page,current);
        if(current.page==='delimitation')expected.focuses=PROFILE_CATALOG.profiles.find(item=>item.id===current.profile).focuses.map(item=>item.id);
        const quality=await page.evaluate(QUALITY,expected),a11y=await page.evaluate(ACCESSIBILITY);
        const ambient=await page.evaluate(AMBIENT);assert.deepEqual(ambient.problems,[]);quality.ambient=ambient;
        assert.deepEqual(quality.issues,[],JSON.stringify({current,motion,width,quality}));
        assert.ok(a11y.measured>0);assert.deepEqual(a11y.contrast,[]);
        const reach=await page.evaluate(REACH,INTERACTIVE);
        if(current.page!=='connection-error')assert.deepEqual(reachProblems(reach),[],current.page);
        observedRoutes.add([current.page,motion,width+'x'+height].join('|'));
        screens.push({page:current.page,tab:current.tab,motion,window:width+'x'+height,quality,contrastMeasured:a11y.measured});
        return expected;
      };
      const press=async label=>{await page.getByRole('button',{name:label,exact:true}).last().click();return measure();};
      const go=async action=>{await page.locator('#nav [data-action="'+action+'"]').click();return measure();};
      await page.goto(url);await page.locator('#nav [data-action]').first().waitFor();await measure();
      await go('open-help');await go('prepare-project');await press('Elegir carpeta');
      await page.locator('#wizard-name').fill('Ruta de prueba');
      let expected=await press('Continuar a Enfoque →');
      // Deliberate DOM mutations: measure the exact property, restore it, verify green again.
      if(width===1180&&motion==='no-preference'){
        const cases=[
          ['foreign-profile-focus',()=>{const n=document.querySelector('input[name="focus"]');n.dataset.original=n.value;n.value='foreign';},()=>{const n=document.querySelector('input[name="focus"]');n.value=n.dataset.original;}],
          ['route-rail',()=>document.querySelector('.steps [aria-current]').setAttribute('aria-current','false'),()=>document.querySelector('.steps li:nth-child(2)').setAttribute('aria-current','step')],
          ['route-nav',()=>document.querySelector('#nav [aria-pressed="true"]').setAttribute('aria-pressed','false'),()=>document.querySelector('#nav [data-action="prepare-project"]').setAttribute('aria-pressed','true')],
          ['route-breadcrumb',()=>{document.getElementById('breadcrumb').textContent='OTRO LUGAR';},()=>{document.getElementById('breadcrumb').textContent='PREPARAR PROYECTO / ENFOQUE';}],
          ['decorative-control',()=>{const n=document.createElement('span');n.id='qa-decoration';n.className='primary';n.textContent='Acción sin botón';document.querySelector('#view .enter').append(n);},()=>document.getElementById('qa-decoration').remove()],
          ['motion-duration',()=>{document.querySelector('#view h1').style.transitionDuration='600ms';},()=>{document.querySelector('#view h1').style.transitionDuration='';}],
          ['motion-duration',()=>{document.querySelector('#view h1').style.animation='brand-illuminate 900ms linear';},()=>{document.querySelector('#view h1').style.animation='';}],
          ['motion-repeat',()=>{document.querySelector('#view h1').style.animation='action-illuminate 900ms linear infinite';},()=>{document.querySelector('#view h1').style.animation='';}],
          ['color-outside-tokens',()=>{document.querySelector('#view h1').style.color='rgba(255,0,0,0.5)';},()=>{document.querySelector('#view h1').style.color='';}],
          ['motion-ease-in',()=>{document.querySelector('#view h1').style.transition='opacity 200ms ease-in';},()=>{document.querySelector('#view h1').style.transition='';}],
          ['unsafe-containing-block',()=>{document.querySelector('#view .enter').style.transform='translateX(0)';const n=document.createElement('button');n.id='qa-fixed';n.style.position='fixed';n.textContent='Acción';document.querySelector('#view .enter').append(n);},()=>{document.getElementById('qa-fixed').remove();document.querySelector('#view .enter').style.transform='';}],
          ['end-occlusion',()=>{const n=document.createElement('div');n.id='qa-cover';Object.assign(n.style,{position:'fixed',inset:'0',zIndex:'9999'});document.body.append(n);},()=>document.getElementById('qa-cover').remove()],
          ['dead-scroll',()=>{const n=document.createElement('div');n.id='qa-spacer';n.style.height='600px';document.getElementById('content').append(n);},()=>document.getElementById('qa-spacer').remove()]
        ];
        for(const [id,breakIt,restore]of cases){
          await page.evaluate(breakIt);const found=await page.evaluate(QUALITY,expected);
          assert.ok(found.issues.some(item=>item.startsWith(id)),id+': mutation survived');
          negatives.push({id,detectedBy:found.issues.filter(item=>item.startsWith(id))});
          await page.evaluate(restore);assert.deepEqual((await page.evaluate(QUALITY,expected)).issues,[]);
        }
      }
      await press('Continuar a Visión →');await page.locator('#vision-goal').fill('Comprobar todas las rutas');
      await press('Continuar a Preparar →');await press('Guardar la preparación revisada →');
      await finishPreparation(page,{measure});await measure();
      if(width===1180&&motion==='no-preference'){
        const expected=await page.locator('pre.prompt').innerText();
        const copy=page.getByRole('button',{name:'Copiar instrucción',exact:true});
        const copyProblems=async()=>page.evaluate(expected=>{
          const issues=[];
          if(window.__ipcCopies.length!==1||window.__ipcCopies[0]!==expected)issues.push('copy-bypasses-ipc');
          if(window.__pageClipboardWrites)issues.push('page-clipboard-used');
          return issues;
        },expected);
        await copy.evaluate(node=>{window.__originalCopy=node;});
        await copy.click();await measure();assert.deepEqual(await copyProblems(),[]);
        await page.evaluate(()=>{window.__ipcCopies=[];window.__pageClipboardWrites=0;
          const original=window.__originalCopy;
          const broken=original.cloneNode(true);broken.textContent='Copiar instrucción';window.__originalCopy=original;
          broken.onclick=()=>{void navigator.clipboard.writeText(document.querySelector('pre.prompt').textContent);broken.textContent='Copiado';};
          original.replaceWith(broken);window.__brokenCopy=broken;
        });
        await copy.click();
        const issues=await copyProblems();assert.ok(issues.includes('copy-bypasses-ipc'));
        negatives.push({id:'copy-bypasses-ipc',detectedBy:issues});
        await page.evaluate(()=>{window.__brokenCopy.replaceWith(window.__originalCopy);});
      }
      await go('open-project-list');await page.locator('.card-open').first().click();await measure();
      await press('Revisar tus elecciones otra vez');await press('Guardar esta preparación →');
      await press('No instalar nada de esto');await press('Preparar herramientas y continuar →');
      await press('Guardar estas instrucciones →');await press('Activar y continuar →');
      await press('Guardar y continuar →');await press('Actualizar las instrucciones');await press('Guardar y ver mi proyecto');
      await press('Revisar reparación de herramientas');await press('Ver mi proyecto');
      await press('Revisar mapa de código');await press('Ver mi proyecto');
      for(const label of ['Archivos','Recetas','Tu IA','Estado'])await press(label);
      assert.deepEqual(errors,[]);
      if(output){await mkdir(output,{recursive:true});await page.screenshot({path:path.join(output,'routes-'+width+'-'+motion+'.png')});}
      await context.close();
      const failed=await browser.newPage({viewport:{width,height},reducedMotion:motion});await failed.goto(url);
      await failed.getByRole('heading',{name:'No se pudo conectar con la aplicación.',exact:true}).waitFor();
      const quality=await failed.evaluate(QUALITY,routeFor('connection-error'));assert.deepEqual(quality.issues,[]);
      observedRoutes.add(['connection-error',motion,width+'x'+height].join('|'));screens.push({page:'connection-error',motion,window:width+'x'+height,quality});
      await failed.close();
    }
    const contract={routes:Object.keys(ROUTES),motions:MOTIONS,windows:WINDOWS.map(w=>w.join('x')),observedRoutes};
    assert.deepEqual(assertCoverage(contract),[]);
    for(const [id,entries] of [['only-reduced-motion',[...observedRoutes].filter(key=>key.includes('|reduce|'))],['missing-route',[...observedRoutes].filter(key=>!key.startsWith('help|'))]]){
      const missing=assertCoverage({...contract,observedRoutes:new Set(entries)});assert.ok(missing.length>0);negatives.push({id,detectedBy:missing});
    }
    const report={scope:'Real renderer, fixed service payloads; NOT engine/native installation evidence',routes:Object.keys(ROUTES).length,cells:observedRoutes.size,screens,negatives};
    if(output)await writeFile(path.join(output,'route-coverage.json'),JSON.stringify(report,null,2)+'\n');
    return report;
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const report=await verifyRouteCoverage(process.argv[2]);console.log(JSON.stringify({routes:report.routes,cells:report.cells,negatives:report.negatives.length},null,2));
}
