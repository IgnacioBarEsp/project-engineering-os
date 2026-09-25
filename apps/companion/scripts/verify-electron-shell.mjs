import assert from 'node:assert/strict';
import {mkdir, mkdtemp, realpath, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {_electron} from 'playwright';

const output=process.argv[2];
assert(output,'Indica un directorio de evidencia para las capturas del shell.');
await mkdir(output,{recursive:true});
const appRoot=fileURLToPath(new URL('../',import.meta.url));
const executable=path.join(appRoot,'node_modules','electron','dist',process.platform==='win32'?'electron.exe':'electron');
const temp=await realpath(await mkdtemp(path.join(os.tmpdir(),'peos-electron-shell-')));
const userData=path.join(temp,'userdata'),localAppData=path.join(temp,'localappdata');
await mkdir(localAppData,{recursive:true});
let application;
const failures=[];
try{
  application=await _electron.launch({executablePath:executable,args:['.',`--user-data-dir=${userData}`],
    cwd:appRoot,env:{...process.env,LOCALAPPDATA:localAppData},timeout:60000});
  const page=await application.firstWindow({timeout:60000});
  page.on('pageerror',error=>failures.push(error.message));
  page.on('console',message=>{if(message.type()==='error')failures.push(message.text());});
  page.on('request',request=>{if(!request.url().startsWith('peos://app/'))failures.push(`Unexpected request: ${request.url()}`);});
  page.on('requestfailed',request=>failures.push(`Failed request: ${request.url()} · ${request.failure()?.errorText}`));
  await page.getByRole('heading',{name:'Dale a tu IA un buen punto de partida.',exact:true}).waitFor({timeout:60000});
  await page.locator('.enter').evaluate(node=>Promise.all(node.getAnimations().map(animation=>animation.finished)));
  const shell=await page.evaluate(()=>{
    const brand=document.querySelector('.brand-icon svg'),content=document.getElementById('content');
    const header=document.querySelector('.app-header'),nav=[...document.querySelectorAll('#nav button')];
    const box=brand.getBBox();
    return {url:location.href,headerHeight:Math.round(header.getBoundingClientRect().height),
      mainScroll:getComputedStyle(content).overflowY,brandWidth:box.width,brandHeight:box.height,
      active:nav.filter(button=>button.getAttribute('aria-pressed')==='true').map(button=>button.dataset.action),
      breadcrumb:document.getElementById('breadcrumb').textContent};
  });
  assert.equal(shell.url,'peos://app/index.html');
  assert.equal(shell.headerHeight,56);
  assert.equal(shell.mainScroll,'auto');
  await page.screenshot({path:path.join(output,'home-electron.png')});
  assert.ok(shell.brandWidth>0&&shell.brandHeight>0,
    `The local Lucide sprite must visibly render in peos://; shell=${JSON.stringify(shell)}; failures=${JSON.stringify(failures)}`);
  assert.deepEqual(shell.active,['open-start']);
  assert.equal(shell.breadcrumb,'INICIO');
  await page.getByRole('button',{name:'Ayuda',exact:true}).click();
  await page.getByRole('heading',{name:'Ayuda',exact:true}).waitFor();
  await page.locator('.enter').evaluate(node=>Promise.all(node.getAnimations().map(animation=>animation.finished)));
  await page.screenshot({path:path.join(output,'help-electron.png')});
  const help=await page.evaluate(()=>({heading:document.querySelector('#view h1')?.textContent,
    breadcrumb:document.getElementById('breadcrumb').textContent,
    active:[...document.querySelectorAll('#nav button[aria-pressed="true"]')].map(button=>button.dataset.action),
    glossaryTerms:document.querySelectorAll('#glosario dt').length}));
  assert.deepEqual(help.active,['open-help']);
  assert.equal(help.breadcrumb,'AYUDA');
  assert.deepEqual(failures,[],'The local Electron renderer must load all assets without CSP or network errors');
  const report={date:new Date().toISOString(),source:'local worktree Electron 44 with isolated userData and LOCALAPPDATA',
    boundaries:['no installer or native picker tested','no user project files touched'],
    shell,help,failures};
  await writeFile(path.join(output,'electron-shell.json'),JSON.stringify(report,null,2)+'\n');
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}finally{
  await application?.close().catch(()=>{});
  assert(path.dirname(temp)===await realpath(os.tmpdir())&&path.basename(temp).startsWith('peos-electron-shell-'));
  await rm(temp,{recursive:true,force:true});
}
