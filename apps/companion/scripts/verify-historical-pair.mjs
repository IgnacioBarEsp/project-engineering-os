import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {stub} from './renderer-fixtures.mjs';
import {REACH,INTERACTIVE,reachProblems,QUALITY} from './interface-contract.mjs';

const repo=fileURLToPath(new URL('../../../',import.meta.url)),output=process.argv[2];assert.ok(output);
await mkdir(output,{recursive:true});
const git=(...args)=>execFileSync('git',args,{cwd:repo,maxBuffer:8*1024*1024});
const browser=await chromium.launch({...(process.platform==='win32'?{channel:'msedge'}:{}),headless:true});
const report={scope:'Immutable historical renderer bytes via git show; fixed service envelopes, not historical native installation. Same current reachability/containing-block and IPC copy assertions. New taxonomy/motion-token rules are not retroactively asserted against the hotfix.',runs:[]};
try{
for(const ref of ['a3b1efd','c044d2d']){
  const commit=git('rev-parse',ref).toString().trim(),files=new Map();
  for(const file of git('ls-tree','-r','--name-only',commit,'apps/companion/ui').toString().trim().split('\n')){
    const relative='/'+file.slice('apps/companion/ui/'.length),bytes=git('show',commit+':'+file);
    files.set(relative,bytes);
  }
  const server=createServer((req,res)=>{
    const file=req.url==='/'?'/index.html':req.url,bytes=files.get(file);
    if(!bytes){res.writeHead(404);res.end();return;}
    res.setHeader('Content-Type',file.endsWith('.mjs')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(bytes);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{
    for(const motion of ['no-preference','reduce'])for(const [width,height]of [[1180,820],[1024,700],[480,540]]){
      const context=await browser.newContext({viewport:{width,height},reducedMotion:motion}),page=await context.newPage();
      const run={commit,motion,window:width+'x'+height,screens:[],copies:[],issues:[],errors:[],bytes:[...files].map(([file,bytes])=>({file,sha256:createHash('sha256').update(bytes).digest('hex')}))};
      page.on('pageerror',error=>run.errors.push(error.message));page.setDefaultTimeout(5000);
      await page.addInitScript(stub('normal')+`
        window.__copies=[];window.__fallback=0;
        window.companion.copyText=async input=>{
          if(typeof input?.text!=='string')return {ok:false,error:{message:'Invalid clipboard payload',action:'Send a text object'}};
          window.__copies.push(input.text);return {ok:true,value:{copied:true,bytes:input.text.length}};
        };
        if(navigator.clipboard)navigator.clipboard.writeText=async()=>{window.__fallback++;throw new DOMException('Denied','NotAllowedError');};
      `);
      const settled=async()=>{await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')!=='true');
        await page.evaluate(()=>Promise.all((document.querySelector('#view .enter')?.getAnimations()??[]).filter(a=>Number.isFinite(a.effect.getComputedTiming().iterations)).map(a=>a.finished.catch(()=>{}))));};
      const measure=async(screen,bar=true)=>{
        await settled();
        const reach=await page.evaluate(REACH,INTERACTIVE),quality=await page.evaluate(QUALITY,{nav:'prepare-project',breadcrumb:await page.locator('#breadcrumb').textContent(),step:null});
        const issues=[...reachProblems(reach,{bar}),...quality.issues.filter(item=>item.startsWith('unsafe-containing-block'))];
        run.screens.push({screen,reach,positioned:quality.positioned,issues});
        run.issues.push(...issues.map(value=>screen+': '+value));
      };
      const press=async name=>{await page.getByRole('button',{name,exact:true}).last().click();await settled();};
      try{
        await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('#nav button').first().waitFor();
        await press('Preparar proyecto');await measure('setup');
        await page.getByLabel('Nombre de tu proyecto').fill('Prueba histórica');
        await page.getByLabel('¿Qué quieres lograr?').fill('Comprobar el fallo documentado');
        await press('Elegir carpeta →');await press('Buscar carpeta en este equipo');await measure('folder');
        await press('Continuar a delimitación →');await measure('delimitation');
        await press('Paso 3: Visión y Descripción →');await measure('vision');
        await page.locator('#vision-input').fill('Conservar las fuentes y comprobar el resultado');
        await press('Paso 4: Instalación →');await measure('install');
        await press('Instalar stack base y obtener prompt →');
        await page.getByRole('heading',{name:'¡Tu proyecto está listo para cobrar vida!',exact:true}).waitFor();await measure('finished',false);
        for(const [label,selector]of [['Copiar ruta','.finished-path-bar code'],['Copiar Prompt Maestro','.prompt-box pre']]){
          const expected=await page.locator(selector).textContent(),before=await page.evaluate(()=>window.__copies.length);
          await press(label);
          const result=await page.evaluate(()=>({copies:window.__copies,fallback:window.__fallback,notice:document.getElementById('notice').textContent}));
          const passed=result.copies.length===before+1&&result.copies.at(-1)===expected&&result.fallback===0&&!!result.notice.trim();
          run.copies.push({label,passed,ipcCalls:result.copies.length-before,fallback:result.fallback,notice:result.notice});
          if(!passed)run.issues.push('copy: '+label+' did not confirm exact native IPC success');
        }
      }catch(error){run.issues.push('journey stopped: '+error.message.split('\n')[0]);}
      await page.screenshot({path:path.join(output,ref+'-'+width+'-'+motion+'.png')});
      report.runs.push(run);await context.close();
    }
  }finally{await new Promise(resolve=>server.close(resolve));}
}
await writeFile(path.join(output,'historical-pair.json'),JSON.stringify(report,null,2)+'\n');
const old=report.runs.filter(run=>run.commit.startsWith('a3b1efd')),fixed=report.runs.filter(run=>run.commit.startsWith('c044d2d'));
assert.equal(old.length,6);assert.equal(fixed.length,6);
assert.ok(old.some(run=>run.screens.some(screen=>screen.issues.some(issue=>issue.startsWith('unsafe-containing-block')))),'Original containment defect must be observed.');
assert.ok(old.some(run=>run.copies.some(copy=>!copy.passed)),'Original copy defect must be observed, not inferred from a stopped journey.');
assert.deepEqual(fixed.flatMap(run=>run.issues.map(issue=>run.window+' '+run.motion+': '+issue)),[]);
assert.ok(fixed.every(run=>run.screens.length===6&&run.copies.length===2));
console.log(JSON.stringify({oldRuns:old.length,oldIssues:old.reduce((n,run)=>n+run.issues.length,0),hotfixRuns:fixed.length,hotfixIssues:0},null,2));
}finally{await browser.close();}
