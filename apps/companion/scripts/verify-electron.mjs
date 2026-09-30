import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdir,mkdtemp,readFile,realpath,rm,writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {_electron} from 'playwright';
import {finishPreparation} from './wizard-journey.mjs';
import {QUALITY,REACH,INTERACTIVE,reachProblems} from './interface-contract.mjs';
import {routeFor} from '../ui/lib/router.mjs';
import {provenanceFieldFailures,PROVENANCE_SUFFIX} from '../../../scripts/screenshot-provenance.mjs';

assert.equal(process.platform,'win32','This required native contract runs on Windows.');
const output=process.argv[2];assert.ok(output,'Provide an evidence directory.');
await mkdir(output,{recursive:true});
const appRoot=fileURLToPath(new URL('../',import.meta.url)),repo=path.resolve(appRoot,'../..');
const git=(...args)=>execFileSync('git',args,{cwd:repo,encoding:'utf8'}).trim();
const commit=git('rev-parse','HEAD'),dirty=git('status','--porcelain','--untracked-files=all');
const files=git('ls-files','--cached','--others','--exclude-standard','apps/companion','scripts/screenshot-provenance.mjs').split('\n').filter(Boolean).sort();
const digest=createHash('sha256');
for(const file of files){digest.update(file+'\0');digest.update(await readFile(path.join(repo,file)));}
const sourceSha256=digest.digest('hex');
const appVersion=JSON.parse(await readFile(path.join(appRoot,'package.json'),'utf8')).version;
const temp=await realpath(await mkdtemp(path.join(os.tmpdir(),'peos-electron-contract-')));
const localAppData=path.join(temp,'localappdata');await mkdir(localAppData);
const report={completed:false,scope:'Source application in real Electron with isolated userData/LOCALAPPDATA; native picker alone injected; no installer or downloaded managed toolchain',commit,dirty:!!dirty,sourceSha256,screens:[],clipboard:[],failures:[]};
let application;
try{
  application=await _electron.launch({executablePath:path.join(appRoot,'node_modules/electron/dist/electron.exe'),
    args:['.','--user-data-dir='+path.join(temp,'userdata')],cwd:appRoot,
    env:{...process.env,LOCALAPPDATA:localAppData},timeout:60000});
  const page=await application.firstWindow({timeout:60000});page.setDefaultTimeout(45000);
  page.on('pageerror',error=>report.failures.push(error.message));
  page.on('console',message=>{if(message.type()==='error')report.failures.push(message.text());});
  page.on('request',request=>{if(!request.url().startsWith('peos://app/'))report.failures.push('Unexpected renderer request: '+request.url());});
  page.on('requestfailed',request=>report.failures.push('Failed renderer request: '+request.url()));
  const engine='Electron '+await application.evaluate(()=>process.versions.electron);
  const settle=async()=>{await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
    await page.evaluate(()=>Promise.all(document.getAnimations().filter(a=>Number.isFinite(a.effect.getComputedTiming().iterations)).map(a=>a.finished.catch(()=>{}))));};
  const capture=async(id,width,height,motion)=>{
    await settle();
    const current=await page.evaluate(async()=>{const {state}=await import('./lib/core.mjs');return {page:state.page,tab:state.tab};});
    const quality=await page.evaluate(QUALITY,routeFor(current.page,current));assert.deepEqual(quality.issues,[],JSON.stringify({id,width,motion,quality}));
    const reach=await page.evaluate(REACH,INTERACTIVE);assert.deepEqual(reachProblems(reach),[]);
    const outer=await application.evaluate(({BrowserWindow})=>{const [width,height]=BrowserWindow.getAllWindows()[0].getSize();return {width,height};});
    assert.deepEqual(outer,{width,height});
    const viewport=await page.evaluate(()=>({width:innerWidth,height:innerHeight,devicePixelRatio}));
    await page.evaluate(()=>{document.getElementById('content').scrollTop=0;});
    const name=id+'-'+width+'-'+motion+'.png',bytes=await page.screenshot({path:path.join(output,name)});
    const record={schemaVersion:1,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,
      width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),commit,appVersion,
      ran:'Source application via Playwright _electron; '+(dirty?'dirty tree':'clean commit')+'; source SHA-256 '+sourceSha256,
      engine,window:{outer,viewport:{width:viewport.width,height:viewport.height},devicePixelRatio:viewport.devicePixelRatio},
      screen:{id:current.page,title:await page.locator('#view h1').innerText()},generator:'apps/companion/scripts/verify-electron.mjs',
      capturedAt:new Date().toISOString(),platform:process.platform+'-'+process.arch};
    assert.deepEqual(provenanceFieldFailures(record),[]);
    await writeFile(path.join(output,name+PROVENANCE_SUFFIX),JSON.stringify(record,null,2)+'\n');
    report.screens.push({file:name,motion,quality,controls:reach.controls.length,outer,viewport});
  };
  await page.getByRole('heading',{name:'Prepara tus proyectos con Project Engineering OS',exact:true}).waitFor();
  for(const [width,height] of [[1180,820],[1024,700],[480,540]])for(const motion of ['no-preference','reduce']){
    await application.evaluate(({BrowserWindow},size)=>BrowserWindow.getAllWindows()[0].setSize(...size),[width,height]);
    await page.emulateMedia({reducedMotion:motion});
    await page.locator('#nav [data-action="open-start"]').click();await capture('home',width,height,motion);
    const project=path.join(temp,'project-'+width+'-'+motion);await mkdir(project);
    const original='Una fuente que no debe cambiar.\n';await writeFile(path.join(project,'notes.txt'),original);
    await application.evaluate(({dialog},root)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[root]});},project);
    await page.locator('#nav [data-action="prepare-project"]').click();await capture('step-1',width,height,motion);
    await page.getByRole('button',{name:'Elegir carpeta',exact:true}).click();
    await page.locator('#wizard-name').fill('Prueba nativa');
    await page.locator('input[name="profile"][value="personal"]').check();
    for(const label of ['Continuar a Enfoque →','Continuar a Visión →'])await page.getByRole('button',{name:label,exact:true}).click();
    await page.locator('#vision-goal').fill('Verificar el portapapeles nativo sin modificar mis fuentes');
    await page.getByRole('button',{name:'Continuar a Preparar →',exact:true}).click();
    await page.getByRole('button',{name:'Guardar la preparación revisada →',exact:true}).click();
    await finishPreparation(page);
    const prompt=await page.locator('pre.prompt').innerText();
    for(const [label,expected]of [['Copiar instrucción',prompt],['Copiar ruta',project]]){
      const button=page.getByRole('button',{name:label,exact:true});
      const element=await button.elementHandle();
      await application.evaluate(({clipboard})=>clipboard.writeText('sentinel-before-copy'));
      await button.click();await settle();
      assert.equal(await application.evaluate(({clipboard})=>clipboard.readText()),expected);
      assert.equal(await element.evaluate(node=>node.textContent),'Copiado');
      report.clipboard.push({window:width+'x'+height,motion,label,matched:true,chars:expected.length});
    }
    assert.equal(await readFile(path.join(project,'notes.txt'),'utf8'),original);
    await capture('finished',width,height,motion);
  }
  assert.equal(report.screens.length,18);assert.equal(report.clipboard.length,12);
  assert.deepEqual(report.failures,[]);
  report.completed=true;
  await writeFile(path.join(output,'electron-evidence.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({screens:report.screens.length,copies:report.clipboard.length,failures:report.failures,sourceSha256},null,2));
}catch(error){
  report.failures.push(error.message);
  await writeFile(path.join(output,'electron-evidence.json'),JSON.stringify(report,null,2)+'\n');
  throw error;
}finally{
  await application?.close().catch(()=>{});
  assert.equal(path.dirname(temp),await realpath(os.tmpdir()));assert.ok(path.basename(temp).startsWith('peos-electron-contract-'));
  await rm(temp,{recursive:true,force:true});
}
