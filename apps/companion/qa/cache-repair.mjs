import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile, realpath, rm, symlink, readdir } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { reviewCacheRepair, replaceReviewedCache } from '../runtime/cache-repair.mjs';
import { createRuntimeManager } from '../runtime/manager.mjs';
import { RUNTIME_CATALOG } from '../runtime/catalog.mjs';

async function fixture(t) {
  const root = await realpath(await mkdtemp(path.join(tmpdir(),'companion-repair-')));
  t.after(()=>rm(root,{recursive:true,force:true})); return root;
}
test('cache repair rejects a wrong receipt, stale review and junction; failed replacement restores corrupt bytes',async t=>{
  const root=await fixture(t), slot='node-reviewed-slot', directory=path.join(root,slot), outside=path.join(root,'project');
  await mkdir(directory);await mkdir(outside);await writeFile(path.join(outside,'keep.txt'),'Project and index preserved');
  await writeFile(path.join(directory,'receipt.json'),'{}');await writeFile(path.join(directory,'corrupt.exe'),'Corrupt owned bytes');
  const identity={format:1,id:'node',treeHash:'compiled-pin'};
  await assert.rejects(reviewCacheRepair(root,slot,identity),e=>e.code==='REPAIR_RECEIPT');
  await assert.rejects(reviewCacheRepair(root,'../project',identity),e=>e.code==='REPAIR_SLOT');
  await writeFile(path.join(directory,'receipt.json'),JSON.stringify(identity));
  let plan=await reviewCacheRepair(root,slot,identity);
  await writeFile(path.join(directory,'corrupt.exe'),'Changed after review');
  let installs=0;await assert.rejects(replaceReviewedCache(plan,async()=>installs++),e=>e.code==='PLAN_STALE');assert.equal(installs,0);
  const link=path.join(directory,'redirect');await symlink(outside,link,process.platform==='win32'?'junction':'dir');
  await assert.rejects(reviewCacheRepair(root,slot,identity),e=>e.code==='LINK_REJECTED');await rm(link);
  plan=await reviewCacheRepair(root,slot,identity);
  await assert.rejects(replaceReviewedCache(plan,async()=>{throw Error('Offline');}),/Offline/);
  assert.equal(await readFile(path.join(directory,'corrupt.exe'),'utf8'),'Changed after review');
  const result=await replaceReviewedCache(plan,async()=>{await mkdir(directory);await writeFile(path.join(directory,'verified.txt'),'New verified fixture');return {status:'verified'};});
  assert.equal(result.repaired,true);assert.equal((await readdir(root)).some(n=>n.startsWith('.repair-')),false);
  assert.equal(await readFile(path.join(outside,'keep.txt'),'utf8'),'Project and index preserved');
});

test('real bundled npm cache repair replaces corrupt managed bytes and verifies the pinned distribution', {skip:process.platform!=='win32'||process.arch!=='x64'},async t=>{
  const root=await fixture(t),manager=await createRuntimeManager({root});
  const installed=await manager.install('npm');assert.equal(installed.status,'verified');
  await writeFile(path.join(installed.root,'bin/npm-cli.js'),'Corrupted cache');
  assert.equal((await manager.inspect('npm')).status,'requires-action');
  const plan=await manager.planRepair('npm');assert.equal(plan.downloadBytes,0);
  const repaired=await manager.repair(plan.id);assert.equal(repaired.repaired,true);
  assert.equal((await manager.inspect('npm')).treeHash,RUNTIME_CATALOG.npm.treeHash);
  await assert.rejects(manager.repair(plan.id),e=>e.code==='PLAN_UNKNOWN');
});
