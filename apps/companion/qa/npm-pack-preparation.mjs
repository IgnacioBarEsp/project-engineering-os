import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, realpath, readFile, writeFile, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { extractZip } from '../runtime/archive.mjs';
import { inspectTree } from '../runtime/tree.mjs';
import { RUNTIME_CATALOG } from '../runtime/catalog.mjs';

const packFile=new URL('../scripts/pack-app.mjs',import.meta.url),app=fileURLToPath(new URL('../',import.meta.url));
for(const failure of [false,true])test(`actual npm pack preparation cleans its owned temporary copy on ${failure?'injected failure':'success'}`,{timeout:90000},async t=>{
  const temporaryBase=await realpath(tmpdir()),root=await realpath(await mkdtemp(path.join(temporaryBase,'npm-pack-')));
  assert.equal(path.dirname(root),temporaryBase);t.after(()=>rm(root,{recursive:true,force:true}));
  const original=await readFile(packFile,'utf8'),marker='\nconst packages = productionPackages(lock);',end=original.indexOf(marker);
  assert.ok(end>0,'The production npm preparation boundary changed; review the harness.');
  let source=original.slice(0,end).replace(/from '(\.{1,2}\/[^']+)'/g,(_match,relative)=>`from '${new URL(relative,packFile).href}'`)
    .replace("const app = fileURLToPath(new URL('../', import.meta.url));",`const app = ${JSON.stringify(app)};`)
    .replace("const npmArchive = path.join(app, 'build', 'npm-dist.zip');",`const npmArchive = ${JSON.stringify(path.join(root,'npm.zip'))};`);
  if(failure){const point='  npmTree = await inspectTree(await canonicalFolder(canonicalNpm));';assert.ok(source.includes(point));source=source.replace(point,"  throw Object.assign(new Error('INJECTED_PACK_FAILURE'),{code:'INJECTED_PACK_FAILURE'});\n"+point);}
  const script=path.join(root,'actual-pack-prefix.mjs');await writeFile(script,source);
  const child=spawn(process.execPath,[script],{cwd:app,env:{...process.env,TEMP:root,TMP:root,TMPDIR:root},windowsHide:true,stdio:['ignore','pipe','pipe']});
  let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);
  const timer=setTimeout(()=>child.kill('SIGKILL'),80000);t.after(()=>clearTimeout(timer));
  const exit=await new Promise(resolve=>child.once('close',(code,signal)=>resolve({code,signal})));clearTimeout(timer);
  assert.equal(exit.signal,null,stderr);assert.equal(exit.code,failure?1:0,stderr);
  if(failure)assert.match(stderr,/INJECTED_PACK_FAILURE/);
  assert.deepEqual((await readdir(root)).filter(name=>name.startsWith('companion-npm-canonical-')),[],'The production staging copy leaked.');
  assert.equal(await readFile(packFile,'utf8'),original);
  if(!failure){const destination=path.join(root,'extracted');await extractZip(path.join(root,'npm.zip'),destination);const tree=await inspectTree(await realpath(destination));assert.equal(tree.sha256,RUNTIME_CATALOG.npm.treeHash);assert.equal(tree.files.length,1944);assert.equal(tree.bytes,12296462);}
  else await assert.rejects(stat(path.join(root,'npm.zip')),error=>error.code==='ENOENT');
});
