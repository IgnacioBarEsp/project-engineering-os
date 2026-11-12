import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, realpath, readFile, writeFile, rm, rmdir, rename, link, symlink, lstat } from 'node:fs/promises';
import { watch, writeFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { prepareNpmDevelopmentSource, checkNpmDevelopmentInventory } from '../runtime/distribution-identity.mjs';
import { inspectTree } from '../runtime/tree.mjs';
import { RUNTIME_CATALOG } from '../runtime/catalog.mjs';
import { sealNpm } from '../scripts/seal-npm.mjs';
import { installedNpmSource, npmSourceForQA } from './fixtures/npm-source.mjs';

const source=installedNpmSource;
const names=['arborist','cssesc','installed-package-contents','node-gyp','node-which','nopt','pacote','qrcode-terminal','semver']
  .flatMap(name=>['','.cmd','.ps1'].map(extension=>name+extension)).sort();
async function fixture(t) {
  const root=await realpath(await mkdtemp(path.join(tmpdir(),'npm-source-')));
  assert.equal(path.dirname(root),await realpath(tmpdir()));
  t.after(()=>rm(root,{recursive:true,force:true}));return root;
}
async function canonical(root) {const target=path.join(root,'canonical');await prepareNpmDevelopmentSource(await npmSourceForQA(root),target);return target;}
async function auxiliaries(root) {
  const bin=path.join(root,'node_modules','.bin');await mkdir(bin,{recursive:true});
  for(const name of names)await writeFile(path.join(bin,name),'untrusted auxiliary; never executed\n');return bin;
}
const rejected=error=>['NPM_SOURCE','LINK_REJECTED','RUNTIME_INTEGRITY','RUNTIME_LIMIT','RUNTIME_CHANGED','FOLDER_CHANGED'].includes(error.code);

test('official fixture and exact 27 auxiliaries preserve the official tree and deterministic sealed bytes',{timeout:90000},async t=>{
  const root=await fixture(t),input=await canonical(root);
  await auxiliaries(input);
  const raw=await inspectTree(input),first=path.join(root,'first'),second=path.join(root,'second');
  const records=await Promise.all([prepareNpmDevelopmentSource(input,first),prepareNpmDevelopmentSource(input,second)]);
  assert.deepEqual(records[0],records[1]);assert.equal(records[0].excluded.length,27);
  const tree=await inspectTree(first);assert.equal(tree.sha256,RUNTIME_CATALOG.npm.treeHash);assert.equal(tree.files.length,1944);
  assert.equal(tree.bytes,12296462);checkNpmDevelopmentInventory(records[0],tree);
  assert.deepEqual(await inspectTree(input),raw);
  const zipA=path.join(root,'a.zip'),zipB=path.join(root,'b.zip');await sealNpm(first,zipA);await sealNpm(second,zipB);
  assert.deepEqual(await readFile(zipA),await readFile(zipB));
  for(const mutate of [r=>r.input.files++,r=>r.input.bytes++,r=>r.input.sha256='0'.repeat(64),r=>r.canonical.files++,
    r=>r.excluded.pop(),r=>r.excluded[0].path='node_modules/.bin/other.cmd',r=>r.excluded[0].bytes=16385,
    r=>r.excluded[0].sha256='0'.repeat(64),r=>r.extra=true]) {
    const changed=structuredClone(records[0]);mutate(changed);assert.throws(()=>checkNpmDevelopmentInventory(changed,tree));
  }
});

test('concurrent copiers cannot share or overwrite an owned destination',{timeout:90000},async t=>{
  const root=await fixture(t);
  const input=await npmSourceForQA(root);
  const concurrent=await Promise.allSettled([prepareNpmDevelopmentSource(input,path.join(root,'shared')),prepareNpmDevelopmentSource(input,path.join(root,'shared'))]);
  assert.equal(concurrent.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(concurrent.find(r=>r.status==='rejected').reason.code,'EEXIST');
});

test('POSIX installer symlinks remain rejected by the product boundary',{skip:process.platform==='win32'},async t=>{
  const root=await fixture(t);
  const original=await lstat(path.join(source,'node_modules/.bin/arborist')).catch(error=>{if(error.code!=='ENOENT')throw error;return null;});
  let input=source;
  if(!original?.isSymbolicLink()){
    input=await canonical(root);await mkdir(path.join(input,'node_modules/.bin'),{recursive:true});
    await symlink(path.join(input,'bin/npm-cli.js'),path.join(input,'node_modules/.bin/arborist'),'file');
  }
  await assert.rejects(prepareNpmDevelopmentSource(input,path.join(root,'rejected-linked-input')),error=>error.code==='LINK_REJECTED');
});

test('unknown, partial, nested, oversized and linked auxiliaries cannot grant a verified copy',{timeout:90000},async t=>{
  const root=await fixture(t),input=await canonical(root),bin=await auxiliaries(input);let number=0;
  const reject=()=>assert.rejects(prepareNpmDevelopmentSource(input,path.join(root,`rejected-${number++}`)),rejected);
  const original=await readFile(path.join(bin,names[0]));
  await rm(path.join(bin,names[0]));await reject();await writeFile(path.join(bin,names[0]),original);
  await writeFile(path.join(bin,'unreviewed.cmd'),'unknown');await reject();await rm(path.join(bin,'unreviewed.cmd'));
  await mkdir(path.join(bin,'empty-directory'));await reject();await rmdir(path.join(bin,'empty-directory'));
  await writeFile(path.join(bin,names[0]),Buffer.alloc(16385));await reject();await writeFile(path.join(bin,names[0]),original);
  const held=path.join(root,'held');await rename(path.join(bin,names[0]),held);await link(held,path.join(bin,names[0]));await reject();
  await rm(path.join(bin,names[0]));await rename(held,path.join(bin,names[0]));
  await rename(path.join(bin,names[0]),held);await symlink(held,path.join(bin,names[0]),'file');await reject();
  await rm(path.join(bin,names[0]));await rename(held,path.join(bin,names[0]));
  // A case alias is rejected even on a case-insensitive filesystem.
  await rename(path.join(bin,names[0]),held);await rename(held,path.join(bin,names[0].toUpperCase()));await reject();
});

test('official drift, source links, overlap and existing destinations fail closed',{timeout:90000},async t=>{
  const root=await fixture(t),input=await canonical(root);let number=0;
  const reject=()=>assert.rejects(prepareNpmDevelopmentSource(input,path.join(root,`rejected-${number++}`)),rejected);
  const file=path.join(input,'bin/npm-cli.js'),original=await readFile(file);
  await writeFile(file,Buffer.concat([original,Buffer.from('\n// changed\n')]));await reject();await writeFile(file,original);
  await rm(file);await reject();await writeFile(file,original);
  await writeFile(path.join(input,'unknown.js'),'extra');await reject();await rm(path.join(input,'unknown.js'));
  const held=path.join(root,'official-held');await rename(file,held);await link(held,file);await reject();await rm(file);await rename(held,file);
  const linked=path.join(root,'linked');await symlink(input,linked,process.platform==='win32'?'junction':'dir');
  await assert.rejects(prepareNpmDevelopmentSource(linked,path.join(root,'linked-copy')),rejected);
  await assert.rejects(prepareNpmDevelopmentSource(input,path.join(input,'nested')),rejected);
  const existing=path.join(root,'existing');await mkdir(existing);await writeFile(path.join(existing,'keep'),'kept');
  await assert.rejects(prepareNpmDevelopmentSource(input,existing),error=>error.code==='EEXIST');assert.equal(await readFile(path.join(existing,'keep'),'utf8'),'kept');
});

test('observed auxiliary drift and real cancellation during copy never return verified output',{timeout:90000},async t=>{
  const root=await fixture(t),input=await canonical(root),bin=await auxiliaries(input),target=path.join(root,'drift-copy');
  let changed=false;
  const watcher=watch(root,(_event,name)=>{if(String(name)==='drift-copy'&&!changed){changed=true;writeFileSync(path.join(bin,names[0]),'changed during canonical copy\n');}});
  try {await assert.rejects(prepareNpmDevelopmentSource(input,target),error=>error.code==='RUNTIME_CHANGED');assert.equal(changed,true);}finally{watcher.close();}
  const abort=new AbortController(),cancelled=path.join(root,'cancel-copy');
  const cancellation=watch(root,(_event,name)=>{if(String(name)==='cancel-copy')abort.abort();});
  try{await assert.rejects(prepareNpmDevelopmentSource(input,cancelled,{signal:abort.signal}),error=>error.name==='AbortError');assert.equal(abort.signal.aborted,true);}finally{cancellation.close();}
  const early=new AbortController();early.abort();await assert.rejects(prepareNpmDevelopmentSource(input,path.join(root,'early'),{signal:early.signal}),error=>error.name==='AbortError');
});
