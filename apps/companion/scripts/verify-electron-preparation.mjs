import assert from 'node:assert/strict';
import {mkdir,mkdtemp,readFile,realpath,rm,writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {_electron} from 'playwright';
import {finishPreparation} from './wizard-journey.mjs';

assert.equal(process.platform,'win32','The managed environment journey requires Windows x64.');
assert.equal(process.arch,'x64');
const appRoot=fileURLToPath(new URL('../',import.meta.url));
const executable=path.join(appRoot,'node_modules/electron/dist/electron.exe');
const temp=await realpath(await mkdtemp(path.join(os.tmpdir(),'peos-electron-preparation-')));
const userData=path.join(temp,'userdata'),evidence=[];let application;
// Existing app-owned, hash-verified runtime caches may be reused. User history, projects
// and installed application files are never used. The native folder picker alone is injected.
try{
  application=await _electron.launch({executablePath:executable,args:['.',`--user-data-dir=${userData}`],cwd:appRoot,env:{...process.env},timeout:60000});
  const page=await application.firstWindow(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  page.setDefaultTimeout(120000);
  await page.getByRole('heading',{name:'Prepara tus proyectos con Project Engineering OS',exact:true}).waitFor();
  await page.evaluate(()=>{window.__progress=[];window.companion.onProgress(value=>{if(window.__progress.length<20000)window.__progress.push(value);});});
  for(const route of process.argv.includes('--cancel-only')?[]:['quick','ai']){
    const root=path.join(temp,`software-${route}`);await mkdir(root);
    const original='Una fuente: el presupuesto se calcula por horas y tarifa.\n';
    await writeFile(path.join(root,'original.txt'),original);
    await application.evaluate(({dialog},root)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[root]});},root);
    await page.locator('#nav [data-action="prepare-project"]').click();
    await page.getByRole('button',{name:'Elegir carpeta',exact:true}).click();
    await page.locator('#wizard-name').fill(`Software ${route}`);
    await page.locator('input[name="profile"][value="software"]').check();
    await page.getByRole('button',{name:'Continuar a Enfoque →',exact:true}).click();
    if(route==='quick'){
      await page.locator('input[name="stack-decision"][value="chosen"]').check();
      await page.locator('input[name="stack"][value="typed-code"]').check();
    }
    await page.getByRole('button',{name:'Continuar a Visión →',exact:true}).click();
    await page.locator('#vision-goal').fill('Preparar y comprobar una carpeta de prueba');
    await page.locator('#vision-free').fill('Conservar las fuentes originales y reportar cada etapa.');
    await page.getByRole('button',{name:'Continuar a Preparar →',exact:true}).click();
    await page.locator(`input[name="install-mode"][value="${route}"]`).check();
    await page.locator('input[name="agent"][value="claude-code"]').check();
    await page.getByRole('button',{name:'Guardar la preparación revisada →',exact:true}).click();
    const stages=await finishPreparation(page,{timeout:120000,measure:async id=>console.log(`${route}: reviewed ${id}`)});
    const checked=await page.evaluate(async root=>{
      const projects=await window.companion.listProjects();if(!projects.ok)throw Error(projects.error.message);
      const project=projects.value.find(item=>item.root===root);if(!project)throw Error('Missing project');
      const result=await window.companion.preparationResult({id:project.id});if(!result.ok)throw Error(result.error.message);
      return {result:result.value,row:project};
    },root);
    if(route==='quick'){
      assert.deepEqual(checked.result.pending,[]);assert.equal(checked.row.state,'verified');
      for(const stage of ['base','context','environment','engineering','activation','stack'])assert.ok(checked.result.done.includes(stage));
    }else{
      assert.deepEqual(checked.result.done,['base','context']);
      assert.ok(checked.result.pending.includes('environment')&&checked.result.pending.includes('engineering'));
      assert.equal(checked.row.state,'incomplete');
    }
    const text=await page.locator('pre.prompt').innerText();
    await page.getByRole('button',{name:'Copiar instrucción',exact:true}).click();
    assert.equal(await application.evaluate(({clipboard})=>clipboard.readText()),text);
    await page.getByRole('button',{name:'Copiar ruta',exact:true}).click();
    assert.equal(await application.evaluate(({clipboard})=>clipboard.readText()),root);
    assert.equal(await readFile(path.join(root,'original.txt'),'utf8'),original);
    assert.equal(text.includes(root),false);
    evidence.push({route,stages,done:checked.result.done,pending:checked.result.pending,list:checked.row.state,clipboard:'exact native text',original:'unchanged'});
    await page.locator('#nav [data-action="open-start"]').click();
  }
  const root=path.join(temp,'cancel-reading');await mkdir(root);
  for(let index=0;index<48;index++)await writeFile(path.join(root,`source-${index}.txt`),`Fuente ${index}: conservar y comprobar.\n`);
  await application.evaluate(({dialog},root)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[root]});},root);
  await page.locator('#nav [data-action="prepare-project"]').click();
  await page.getByRole('button',{name:'Elegir carpeta',exact:true}).click();
  await page.locator('input[name="profile"][value="personal"]').check();
  await page.getByRole('button',{name:'Continuar a Enfoque →',exact:true}).click();
  await page.getByRole('button',{name:'Continuar a Visión →',exact:true}).click();
  await page.locator('#vision-goal').fill('Detener y recuperar la lectura sin perder archivos');
  await page.getByRole('button',{name:'Continuar a Preparar →',exact:true}).click();
  await page.evaluate(()=>{window.__cancelProgressStart=window.__progress.length;});
  await page.getByRole('button',{name:'Guardar la preparación revisada →',exact:true}).click();
  await page.waitForFunction(()=>window.__progress.slice(window.__cancelProgressStart).some(value=>value.stage==='context'&&value.completed>0));
  const measured=await page.evaluate(()=>{const value=window.__progress.filter(value=>value.stage==='context').at(-1),bar=document.querySelector('#activity progress');
    return {completed:value.completed,total:value.total,shown:bar?.value,max:bar?.max};});
  assert.equal(measured.shown,measured.completed);assert.equal(measured.max,measured.total);
  await page.locator('#cancel').click();
  await page.locator('.preparation-stages [data-stage="context"][data-state="failed"]').waitFor();
  assert.equal(await page.locator('.preparation-stages [data-stage="base"]').getAttribute('data-state'),'done');
  await assert.rejects(readFile(path.join(root,'.project-os/companion/context/index.json')),{code:'ENOENT'});
  await page.getByRole('button',{name:'Revisar y reintentar',exact:true}).click();
  await finishPreparation(page,{timeout:120000});
  const resumed=await page.evaluate(async root=>{const list=await window.companion.listProjects();
    const project=list.value.find(item=>item.root===root);return (await window.companion.preparationResult({id:project.id})).value;},root);
  assert.deepEqual(resumed.pending,[]);
  for(let index=0;index<48;index++)assert.equal(await readFile(path.join(root,`source-${index}.txt`),'utf8'),`Fuente ${index}: conservar y comprobar.\n`);
  evidence.push({route:'cancel/retry',done:resumed.done,pending:resumed.pending,originals:48,contextWrittenBeforeApproval:false});
  const progress=await page.evaluate(()=>window.__progress.filter(value=>value.stage==='context'&&Number.isInteger(value.completed)&&value.total>0));
  assert.ok(progress.length>0);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({runtime:await application.evaluate(()=>process.versions.electron),evidence,realReadingProgress:progress.length,errors},null,2));
}finally{
  await application?.close().catch(()=>{});
  assert.equal(path.dirname(temp),await realpath(os.tmpdir()));assert.ok(path.basename(temp).startsWith('peos-electron-preparation-'));
  await rm(temp,{recursive:true,force:true});
}
