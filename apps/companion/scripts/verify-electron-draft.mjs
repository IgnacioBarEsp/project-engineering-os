import assert from 'node:assert/strict';
import {mkdir,mkdtemp,readFile,readdir,realpath,rm,writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {_electron} from 'playwright';

const appRoot=fileURLToPath(new URL('../',import.meta.url));
const executable=path.join(appRoot,'node_modules/electron/dist',process.platform==='win32'?'electron.exe':'electron');
const temp=await realpath(await mkdtemp(path.join(os.tmpdir(),'peos-electron-draft-')));
const project=path.join(temp,'project'),dataRoot=path.join(temp,'userdata'),localAppData=path.join(temp,'localappdata');
await mkdir(project);await mkdir(localAppData);await writeFile(path.join(project,'original.txt'),'Original.');
let application;
const launch=()=>_electron.launch({executablePath:executable,args:['.',`--user-data-dir=${dataRoot}`],
  cwd:appRoot,env:{...process.env,LOCALAPPDATA:localAppData},timeout:60000});
try{
  application=await launch();
  await application.evaluate(({dialog},project)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[project]});},project);
  let page=await application.firstWindow(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.getByRole('heading',{name:'Prepara tus proyectos con Project Engineering OS',exact:true}).waitFor();
  await page.getByRole('button',{name:'Preparar proyecto',exact:true}).last().click();
  await page.getByRole('button',{name:'Elegir carpeta',exact:true}).click();
  await page.getByRole('button',{name:'Continuar a Enfoque →',exact:true}).click();
  await page.getByRole('button',{name:'Continuar a Visión →',exact:true}).click();
  await page.getByRole('heading',{name:'Cuéntalo en tus palabras',exact:true}).waitFor();
  await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')!=='true');
  // Dispatch the edit and close immediately: no debounce wait before the real native close.
  await page.evaluate(()=>{
    for(const [id,value] of [['vision-goal','La última respuesta antes de cerrar'],['vision-free','Texto que no debe perderse.']]){
      const node=document.getElementById(id);node.value=value;node.dispatchEvent(new Event('input',{bubbles:true}));
    }
  });
  const closed=application.waitForEvent('close',{timeout:15000});
  await application.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].close());await closed;
  const saved=JSON.parse(await readFile(path.join(dataRoot,'projects/draft.json'),'utf8'));
  assert.equal(saved.selection.goal,'La última respuesta antes de cerrar');
  assert.equal(saved.selection.vision,'Texto que no debe perderse.');
  assert.deepEqual(await readdir(project),['original.txt']);
  application=await launch();page=await application.firstWindow();page.on('pageerror',error=>errors.push(error.message));
  await page.getByRole('button',{name:'Continuar borrador',exact:true}).click();
  await page.getByRole('heading',{name:'Cuéntalo en tus palabras',exact:true}).waitFor();
  assert.equal(await page.locator('#vision-goal').inputValue(),saved.selection.goal);
  assert.equal(await page.locator('#vision-free').inputValue(),saved.selection.vision);
  assert.deepEqual(await readdir(project),['original.txt']);assert.deepEqual(errors,[]);
  // A failed save refuses closure and retains both the malformed bytes and the visible answer.
  await writeFile(path.join(dataRoot,'projects/draft.json'),'invalid draft');
  await page.locator('#vision-free').fill('Respuesta todavía visible.');
  await application.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].close());
  await page.getByText('El borrador guardado está dañado.',{exact:true}).waitFor();
  assert.equal(page.isClosed(),false);
  assert.equal(await page.locator('#vision-free').inputValue(),'Respuesta todavía visible.');
  assert.equal(await readFile(path.join(dataRoot,'projects/draft.json'),'utf8'),'invalid draft');
  // Restore this fixture only, so the test app can close normally during cleanup.
  await writeFile(path.join(dataRoot,'projects/draft.json'),JSON.stringify(saved));
  console.log(JSON.stringify({native:'Electron 44',immediateClose:'saved',reopen:'answers restored',
    failedSave:'window remains open; bytes preserved',projectWrites:0,errors},null,2));
}finally{
  await application?.close().catch(()=>{});
  assert(path.dirname(temp)===await realpath(os.tmpdir())&&path.basename(temp).startsWith('peos-electron-draft-'));
  await rm(temp,{recursive:true,force:true});
}
