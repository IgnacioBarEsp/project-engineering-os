import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir,mkdtemp,readFile,writeFile,realpath,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import * as core from 'create-project-engineering-os';
import {ASSETS,CSP} from '../desktop/assets.mjs';
import {createDesktopService,publicError} from '../desktop/service.mjs';
import {hash,json} from '../engine/files.mjs';

// Real renderer/service; only the native boundary is injected. No runtime downloads or user projects.
export async function rendererServiceFixture(output){
  await mkdir(output,{recursive:true});
  const parent=await realpath(tmpdir()),temp=await realpath(await mkdtemp(path.join(parent,'peos-renderer-regression-')));
  const ui=fileURLToPath(new URL('../ui/',import.meta.url));
  const server=createServer(async(req,res)=>{
    const file=req.url==='/'?'/index.html':req.url;
    if(req.method!=='GET'||!ASSETS.has(file)){res.writeHead(404);res.end();return;}
    try{res.setHeader('Content-Type',ASSETS.get(file));res.setHeader('Content-Security-Policy',CSP);res.end(await readFile(path.join(ui,file.slice(1))));}
    catch{res.writeHead(500);res.end();}
  });
  let browser;
  try{
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const pw=await import(process.env.PROJECT_OS_PLAYWRIGHT_MODULE?pathToFileURL(process.env.PROJECT_OS_PLAYWRIGHT_MODULE).href:'playwright');
    browser=await (pw.default??pw).chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
  }catch(error){await new Promise(resolve=>server.close(resolve));await rm(temp,{recursive:true,force:true});throw error;}
  const url='http://127.0.0.1:'+server.address().port;
  return {
    temp,browser,
    async projectCase(name){
      assert.match(name,/^[a-z0-9-]+$/);
      const dir=path.join(temp,name);await mkdir(dir);
      const dataRoot=path.join(dir,'app-data');
      let picked,service;
      const restart=async()=>{
        service=await createDesktopService({dataRoot,core,chooseFolder:async()=>picked,copyText:async()=>{},openExternal:async()=>{}});
        return service;
      };
      await restart();
      return {dir,dataRoot,get service(){return service;},restart,pick:root=>{picked=root;},
        async folder(name,files={'notes.txt':'Synthetic source; preserve it.'}){
          assert.match(name,/^[a-z0-9-]+$/);const root=path.join(dir,name);await mkdir(root);
          for(const [file,content] of Object.entries(files)){assert.equal(path.basename(file),file);await writeFile(path.join(root,file),content);}
          return root;
        },
        async prepared(root,selection,{context=true}={}){
          picked=root;const chosen=await service.chooseFolder();
          await service.applyBase({plan:(await service.previewBase({id:chosen.id,selection})).id});
          if(context)await service.applyContext({plan:(await service.previewContext({id:chosen.id})).id});
          return chosen;
        },
      };
    },
    async page(service,{motion='reduce',width=1180,height=820,intercept=null}={}){
      const context=await browser.newContext({viewport:{width,height},reducedMotion:motion}),page=await context.newPage(),errors=[];
      page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push(error.message));
      await page.exposeFunction('regressionCall',async(name,input)=>{
        try{if(intercept)await intercept(name,input);return {ok:true,value:await service[name](input)};}
        catch(error){return {ok:false,error:publicError(error)};}
      });
      await page.addInitScript(methods=>{
        window.companion=Object.fromEntries(methods.map(name=>[name,input=>window.regressionCall(name,input??{})]));
        window.companion.onProgress=()=>()=>{};
      },Object.keys(service));
      await page.goto(url);await page.getByRole('heading',{name:'Prepara tus proyectos con Project Engineering OS',exact:true}).waitFor();
      await settle(page);
      return {page,context,errors};
    },
    async close(){
      await browser.close();await new Promise(resolve=>server.close(resolve));
      assert.equal(path.dirname(temp),parent);assert.ok(path.basename(temp).startsWith('peos-renderer-regression-'));
      await rm(temp,{recursive:true,force:true});
    },
  };
}
export const settle=page=>page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
export async function click(page,label){await page.getByRole('button',{name:label,exact:true}).last().click();await settle(page);}
export const selection=(name,profile='personal',focus='open')=>({name,profile,focus,goal:name+' objective',
  vision:name+' original vision',agents:['web'],experience:'guided',stack:{decision:'too-early',requested:[]},installMode:'ai'});

// Make genuinely persisted 0.3.x-shaped records, not canonical aliases passed to the new writer.
export async function historicalSelection(fixture,project,old){
  const dir=path.join(project.root,'.project-os/companion');
  const projectPath=path.join(dir,'project.json'),receiptPath=path.join(dir,'receipt.json'),journalPath=path.join(dir,'transaction.json');
  const record=JSON.parse(await readFile(projectPath,'utf8'));record.selection=old;
  const projectBytes=json(record);await writeFile(projectPath,projectBytes);
  const receipt=JSON.parse(await readFile(receiptPath,'utf8'));receipt.selection=old;receipt.files['project.json']=hash(projectBytes);
  const receiptBytes=json(receipt);await writeFile(receiptPath,receiptBytes);
  const journal=JSON.parse(await readFile(journalPath,'utf8'));journal.selection=old;
  for(const op of journal.operations){
    if(op.path==='.project-os/companion/project.json'){op.after=projectBytes;op.afterHash=hash(projectBytes);}
    if(op.path==='.project-os/companion/receipt.json'){op.after=receiptBytes;op.afterHash=hash(receiptBytes);}
  }
  await writeFile(journalPath,json(journal));
  const historyPath=path.join(fixture.dataRoot,'projects.json');
  await writeFile(historyPath,json({version:1,items:[{id:project.id,root:project.root,name:old.name,selection:old}]}));
  return [projectPath,receiptPath,journalPath,historyPath];
}
