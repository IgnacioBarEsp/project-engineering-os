import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, realpath, rm, writeFile, readFile, readdir, symlink, link } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { RUNTIME_CATALOG, NPM_DISTRIBUTIONS } from '../runtime/catalog.mjs';
import { json, hash, withLock } from '../engine/files.mjs';
import { createRuntimeManager } from '../runtime/manager.mjs';
import { distributionIdentity, distributionKey, distributionSlot, identityOf, npmDistribution,
  defaultNpmKey, readNpmSelection, npmReceipt, checkNpmReceipt, beginNpmOperation,
  commitNpmSelection, rollbackNpmSelection, finishNpmOperation, NPM_SELECTION, NPM_OPERATION } from '../runtime/distribution-identity.mjs';

async function fixture(t) { const root=await realpath(await mkdtemp(path.join(tmpdir(),'npm-identity-')));t.after(()=>rm(root,{recursive:true,force:true}));return root; }
const code=expected=>error=>error.code===expected;
test('complete identities separate equal-version channels, source, recipe and full-tree suffixes (synthetic identities only)',()=>{
  const official=identityOf(RUNTIME_CATALOG.npm),derived={...official,channel:'derived',recipeHash:'a'.repeat(64)};
  const variants=[official,derived,{...derived,recipeHash:'b'.repeat(64)},{...official,source:official.source+'-other'},{...official,treeHash:official.treeHash.slice(0,-1)+(official.treeHash.endsWith('a')?'b':'a')}];
  assert.equal(new Set(variants.map(distributionKey)).size,5);assert.equal(new Set(variants.map(distributionSlot)).size,5);
  for(const value of variants)assert.match(distributionSlot(value),/^[a-z0-9][a-z0-9.-]{0,120}$/);
  for(const value of [{...official,recipeHash:'a'.repeat(64)},{...derived,recipeHash:null},{...official,extra:true},{...official,source:'file:///tmp/a'},{...official,version:'../1.0.0'}])assert.throws(()=>distributionIdentity(value),code('NPM_IDENTITY'));
  assert.equal(NPM_DISTRIBUTIONS.length,1);assert.throws(()=>npmDistribution(distributionKey(derived)),code('NPM_UNKNOWN'));
  assert.throws(()=>npmDistribution('ee294c531ba0fb603d93040b014c8096975ba687978d09f317d93612bc96eb7d'),code('NPM_UNKNOWN'));
});
test('receipt exact schema rejects forged provenance, unknown keys, duplicates and vulnerable identity',()=>{
  const tool=RUNTIME_CATALOG.npm,receipt=npmReceipt(tool);checkNpmReceipt(Buffer.from(json(receipt)),tool);
  for(const value of [{...receipt,path:'elsewhere'},{...receipt,identity:{...receipt.identity,source:'https://attacker.example/'}},{...receipt,distribution:'a'.repeat(64)},{...receipt,format:1}])assert.throws(()=>checkNpmReceipt(Buffer.from(json(value)),tool));
  assert.throws(()=>checkNpmReceipt(Buffer.from(json(receipt).replace('"format": 2','"format": 2,"format": 2')),tool),code('NPM_RECEIPT'));
});
test('bounded selector refuses unknown identity, overflow, wrong keys, noncanonical JSON and links',async t=>{
  const root=await fixture(t);assert.equal((await readNpmSelection(root)).value.active,defaultNpmKey());
  const base={format:1,generation:1,active:defaultNpmKey(),previous:null};
  for(const value of [{...base,generation:Number.MAX_SAFE_INTEGER},{...base,active:'a'.repeat(64)},{...base,previous:'b'.repeat(64)},{...base,path:'../payload'}]){await writeFile(path.join(root,NPM_SELECTION),json(value));await assert.rejects(readNpmSelection(root));}
  await writeFile(path.join(root,NPM_SELECTION),'x'.repeat(65537));await assert.rejects(readNpmSelection(root),code('STATE_INVALID'));
  await rm(path.join(root,NPM_SELECTION));const other=path.join(root,'other');await writeFile(other,json(base));await link(other,path.join(root,NPM_SELECTION));await assert.rejects(readNpmSelection(root),code('LINK_REJECTED'));
});
test('generation/hash checked commit has durable readback; cancellation and stale state preserve previous bytes',async t=>{
  const root=await fixture(t);
  await withLock(root,async()=>{
    const before=await readNpmSelection(root),operation=await beginNpmOperation(root,'select',RUNTIME_CATALOG.npm,before);
    await commitNpmSelection(root,operation);assert.equal((await readNpmSelection(root)).value.generation,1);await finishNpmOperation(root,operation);
  });
  await withLock(root,async()=>{
    const before=await readNpmSelection(root),original=await readFile(path.join(root,NPM_SELECTION)),operation=await beginNpmOperation(root,'select',RUNTIME_CATALOG.npm,before);
    const abort=new AbortController();abort.abort();await assert.rejects(commitNpmSelection(root,operation,abort.signal));assert.deepEqual(await readFile(path.join(root,NPM_SELECTION)),original);
    await finishNpmOperation(root,operation);
  });
  await withLock(root,async()=>{
    const before=await readNpmSelection(root),operation=await beginNpmOperation(root,'select',RUNTIME_CATALOG.npm,before);
    const external=json({...before.value,generation:before.value.generation+2});await writeFile(path.join(root,NPM_SELECTION),external);
    await assert.rejects(commitNpmSelection(root,operation),code('FILE_CHANGED'));assert.equal(await readFile(path.join(root,NPM_SELECTION),'utf8'),external);
  });
});
test('manager installs only official full identity, preserves legacy slot and repairs with reviewed quarantine', {skip:process.platform!=='win32'||process.arch!=='x64'},async t=>{
  const root=await fixture(t),legacy=path.join(root,'npm-11.19.1-ee294c531ba0');await mkdir(legacy);await writeFile(path.join(legacy,'keep.txt'),'historical unfit slot');
  const manager=await createRuntimeManager({root});assert.equal((await manager.inspect('npm')).status,'missing');
  const installed=await manager.install('npm');assert.equal(installed.status,'verified');assert.equal(installed.version,'11.21.2');assert.equal(installed.distribution,defaultNpmKey());
  assert.equal(path.basename(path.dirname(installed.root)),distributionSlot(identityOf(RUNTIME_CATALOG.npm)));
  await assert.rejects(manager.selectNpmDistribution('a'.repeat(64),{expectedGeneration:1}),code('NPM_UNKNOWN'));
  await assert.rejects(manager.selectNpmDistribution(defaultNpmKey(),{expectedGeneration:0}),code('NPM_GENERATION'));
  const unchanged=await readFile(path.join(root,NPM_SELECTION));const abort=new AbortController();abort.abort();
  await assert.rejects(manager.selectNpmDistribution(defaultNpmKey(),{expectedGeneration:1,signal:abort.signal}));
  assert.deepEqual(await readFile(path.join(root,NPM_SELECTION)),unchanged);
  // Explicit selection failure after write restores the exact previous bytes, not a new generation.
  const before=await readNpmSelection(root);await assert.rejects(manager.selectNpmDistribution(defaultNpmKey(),{expectedGeneration:before.value.generation,onProgress(event){if(event.stage==='npm-selection-written')throw Error('readback interrupted');}}),/readback interrupted/);
  assert.deepEqual(await readFile(path.join(root,NPM_SELECTION)),before.content);
  await writeFile(path.join(installed.root,'bin/npm-cli.js'),'corrupt');assert.equal((await manager.inspect('npm')).status,'requires-action');
  const plan=await manager.planRepair('npm'),repaired=await manager.repair(plan.id);assert.equal(repaired.repaired,true);assert.equal((await manager.inspect('npm')).status,'verified');
  assert.equal(await readFile(path.join(root,repaired.retainedQuarantine,'payload/bin/npm-cli.js'),'utf8'),'corrupt');
  assert.equal(await readFile(path.join(legacy,'keep.txt'),'utf8'),'historical unfit slot');
});

test('interrupted repair restores only the journal-owned unchanged quarantine, and retains project/history bytes', {skip:process.platform!=='win32'||process.arch!=='x64',timeout:90000},async t=>{
  const root=await fixture(t),manager=await createRuntimeManager({root}),installed=await manager.install('npm');
  await writeFile(path.join(root,'project.txt'),'user project');await writeFile(path.join(installed.root,'bin/npm-cli.js'),'corrupt original retained');
  const before=await readFile(path.join(root,NPM_SELECTION));
  const module=fileURLToPath(new URL('../runtime/manager.mjs',import.meta.url));
  const child=spawn(process.execPath,['--input-type=module','-e',`import {pathToFileURL} from 'node:url';const {createRuntimeManager}=await import(pathToFileURL(process.argv[1]));const m=await createRuntimeManager({root:process.argv[2]});const p=await m.planRepair('npm');await m.repair(p.id,{onProgress(e){if(e.stage==='npm-quarantined')process.kill(process.pid,'SIGKILL');}});`,module,root],{windowsHide:true,stdio:['ignore','pipe','pipe']});
  let error='';child.stderr.on('data',b=>error+=b);const exit=await new Promise(resolve=>child.once('exit',(code,signal)=>resolve({code,signal})));assert.ok(exit.code!==0||exit.signal,error);
  assert.ok((await readdir(root)).includes(NPM_OPERATION));const restarted=await createRuntimeManager({root});
  assert.equal((await restarted.inspect('npm')).status,'requires-action');assert.deepEqual(await readFile(path.join(root,NPM_SELECTION)),before);
  assert.equal(await readFile(path.join(installed.root,'bin/npm-cli.js'),'utf8'),'corrupt original retained');
  assert.equal(await readFile(path.join(root,'project.txt'),'utf8'),'user project');
  const repair=await restarted.planRepair('npm');await restarted.repair(repair.id);assert.equal((await restarted.inspect('npm')).status,'verified');
});

test('real process interruption at publication and selector-write rolls back journal-owned selection on restart', {skip:process.platform!=='win32'||process.arch!=='x64',timeout:90000},async t=>{
  for(const point of ['npm-published','npm-selection-written','npm-confirmed']) {
    const root=await fixture(t),managerFile=fileURLToPath(new URL('../runtime/manager.mjs',import.meta.url));
    const child=spawn(process.execPath,['--input-type=module','-e',`import {pathToFileURL} from 'node:url';const {createRuntimeManager}=await import(pathToFileURL(process.argv[1]));const m=await createRuntimeManager({root:process.argv[2]});await m.install('npm',{onProgress(e){if(e.stage===process.argv[3])process.kill(process.pid,'SIGKILL');}});`,managerFile,root,point],{windowsHide:true,stdio:['ignore','pipe','pipe']});
    let error='';child.stderr.on('data',b=>error+=b);const ended=await new Promise(resolve=>child.once('exit',(code,signal)=>resolve({code,signal})));assert.ok(ended.code!==0||ended.signal,error);
    if(point!=='npm-confirmed')assert.ok((await readdir(root)).includes(NPM_OPERATION));
    const restarted=await createRuntimeManager({root});
    if(point==='npm-confirmed')assert.equal((await readNpmSelection(root)).value.generation,1);
    else assert.equal((await readNpmSelection(root)).hash,null);
    assert.equal((await restarted.inspect('npm')).status,'verified');
    assert.equal((await restarted.install('npm')).status,'verified','The archived completed journal must not strand the shared lock.');
    assert.ok((await readdir(root)).some(n=>n.startsWith('npm-operation-')));assert.ok(!(await readdir(root)).includes(NPM_OPERATION));
  }
});

test('removing a published slot before confirmation rejects without advancing selection',{skip:process.platform!=='win32'||process.arch!=='x64',timeout:60000},async t=>{
  const root=await fixture(t),manager=await createRuntimeManager({root});
  await assert.rejects(manager.install('npm',{onProgress(event){
    if(event.stage==='npm-published') {
      const owned=path.resolve(root,distributionSlot(identityOf(RUNTIME_CATALOG.npm)));
      assert.equal(path.dirname(owned),root);rmSync(owned,{recursive:true,force:true});
    }
  }}),code('RUNTIME_CHANGED'));
  assert.equal((await readNpmSelection(root)).hash,null);assert.equal((await manager.inspect('npm')).status,'missing');
});
