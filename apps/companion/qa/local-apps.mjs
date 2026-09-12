import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,mkdir,writeFile,realpath,rm,symlink } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { createLocalAppLauncher } from '../desktop/local-apps.mjs';

test('local app launch requires a reviewed regular signed executable and passes the selected folder literally',async t=>{
  const root=await realpath(await mkdtemp(path.join(tmpdir(),'companion-launch-')));t.after(()=>rm(root,{recursive:true,force:true}));
  const project=path.join(root,'project & literal'),executable=path.join(root,'app.exe'),desktop=path.join(root,'desktop.exe');
  await mkdir(project);await writeFile(executable,'signed fixture');await writeFile(desktop,'desktop fixture');
  const calls=[];let publisher='OpenAI OpCo, LLC',status='Valid',help='Usage: codex app [OPTIONS] [PATH]';
  const adapter=createLocalAppLauncher({discover:async()=>[{executable,desktop}],signature:async()=>({status,publisher}),help:async()=>help,launch:async(...args)=>calls.push(args)});
  const preview=await adapter.detect('codex');assert(preview);assert.equal(calls.length,0);
  const opened=await adapter.open(preview,project);assert.equal(opened.projectAttached,true);assert.equal(opened.agentReadProject,false);
  assert.deepEqual(calls[0],[executable,['app',project]]);
  await writeFile(executable,'modified after preview');await assert.rejects(adapter.open(preview,project),e=>e.code==='APP_CHANGED');assert.equal(calls.length,1);
  // Each refusal is reported rather than launched, and never becomes a usable candidate.
  const refuses=async()=>{const found=await adapter.detect('codex');assert.equal(found.unverified,true);
    await assert.rejects(adapter.open({...preview,files:found.files},project),e=>['APP_UNTRUSTED','APP_UNSUPPORTED'].includes(e.code));
    assert.equal(calls.length,1);};
  publisher='Untrusted Publisher';await refuses();
  publisher='OpenAI OpCo, LLC';status='NotSigned';await refuses();
  status='Valid';help='Some other interface';await refuses();
  help='Usage: codex app [OPTIONS] [PATH]';
  const link=path.join(root,'linked');await symlink(root,link,process.platform==='win32'?'junction':'dir');
  const linked=createLocalAppLauncher({discover:async()=>[{executable:path.join(link,'app.exe')}],signature:async()=>({status:'Valid',publisher:'Anysphere, Inc.'}),launch:async()=>assert.fail('must not launch')});
  assert.equal((await linked.detect('cursor')).unverified,true);await rm(link);
  for(const [agent,editor] of [['cursor','Anysphere, Inc.'],['github-copilot','Microsoft Corporation']]){
    publisher=editor;const checked=await adapter.detect(agent);assert(checked);
    await adapter.open(checked,project);assert.deepEqual(calls.at(-1),[executable,[project]]);
  }
  assert.equal(await adapter.detect('web'),null);
});

test('an installed application that cannot be verified is reported instead of silently downgraded', async t => {
  const signed = { status: 'Valid', publisher: 'Anysphere, Inc.' };
  const launcher = wrong => createLocalAppLauncher({ platform: 'win32',
    discover: async () => [{ executable: 'C:\Programs\cursor\Cursor.exe' }],
    inspectFile: async executable => ({ executable, sha256: 'a'.repeat(64) }),
    signature: async () => wrong, launch: async () => { throw new Error('must not launch'); } });
  const refused = await launcher({ status: 'Valid', publisher: 'Someone Else, Inc.' }).detect('cursor');
  assert.equal(refused.unverified, true); assert.equal(refused.code, 'APP_UNTRUSTED'); assert.equal(refused.label, 'Cursor');
  const unsigned = await launcher({ status: 'NotSigned', publisher: '' }).detect('cursor');
  assert.equal(unsigned.unverified, true);
  const accepted = await launcher(signed).detect('cursor');
  assert.equal(accepted.unverified, undefined); assert.equal(accepted.label, 'Cursor');
  // Nothing installed stays a plain absence, not a refusal.
  const absent = createLocalAppLauncher({ platform: 'win32', discover: async () => [], launch: async () => {} });
  assert.equal(await absent.detect('cursor'), null);
  assert.equal(await absent.detect('web'), null);
});

test('known installation locations distinguish absent executables from existing untrusted apps', async t => {
  const root=await realpath(await mkdtemp(path.join(tmpdir(),'companion-discovery-')));
  t.after(()=>rm(root,{recursive:true,force:true}));
  let signatures=0;
  const system={LOCALAPPDATA:root,ProgramFiles:path.join(root,'machine')};
  const launcher=createLocalAppLauncher({platform:'win32',system,
    signature:async()=>{signatures++;return {status:'NotSigned',publisher:''};},
    launch:async()=>assert.fail('discovery must not launch')});
  for(const agent of ['cursor','github-copilot'])assert.equal(await launcher.detect(agent),null);
  assert.equal(signatures,0,'nonexistent candidates never reach signature verification');
  const exe=path.join(root,'Programs','cursor','Cursor.exe');
  await mkdir(path.dirname(exe),{recursive:true});await writeFile(exe,'unsigned fixture');
  const found=await launcher.detect('cursor');
  assert.equal(found.unverified,true);assert.equal(found.code,'APP_UNTRUSTED');assert.equal(signatures,1);
  const inaccessible=createLocalAppLauncher({platform:'win32',system,
    inspectFile:async()=>{throw Object.assign(new Error('Access denied'),{code:'EACCES'});},
    launch:async()=>assert.fail('must not launch')});
  assert.equal((await inaccessible.detect('cursor')).code,'EACCES');
});

test('a recognised application with no verified folder contract is reported, never launched',async t=>{
  // Antigravity is on the maintainer's must-have list, and on the machine this was written for its
  // executable is not signed. Both facts have to reach the person without either one becoming a
  // promise: the application is recognised and reported, and it is not opened from here, because how
  // its build takes a folder has not been observed. A guess would be a fabricated capability.
  const root=await realpath(await mkdtemp(path.join(tmpdir(),'companion-antigravity-')));
  t.after(()=>rm(root,{recursive:true,force:true}));
  const executable=path.join(root,'Antigravity.exe'),project=path.join(root,'proyecto');
  await mkdir(project);await writeFile(executable,'antigravity fixture');
  let status='NotSigned',publisher='';
  const launched=[];
  const adapter=createLocalAppLauncher({discover:async()=>[{executable}],signature:async()=>({status,publisher}),
    launch:async(...args)=>launched.push(args)});

  // Unsigned, as installed here: present, and refused for the signature.
  const unsigned=await adapter.detect('antigravity');
  assert.equal(unsigned.unverified,true);assert.equal(unsigned.code,'APP_UNTRUSTED');
  assert.equal(unsigned.label,'Antigravity','La persona debe leer el nombre de la aplicación, no un identificador.');

  // Correctly signed by its publisher: still not opened, and the reason changes to say why.
  status='Valid';publisher='Google LLC';
  const signed=await adapter.detect('antigravity');
  assert.equal(signed.unverified,true);assert.equal(signed.code,'APP_UNSUPPORTED');
  assert.match(signed.message,/abre una carpeta/);

  // Neither state may reach a launch, and a wrong publisher stays refused.
  await assert.rejects(adapter.open({agent:'antigravity',executable,files:[]},project),e=>e.code==='APP_UNSUPPORTED');
  publisher='Someone Else, Inc.';
  assert.equal((await adapter.detect('antigravity')).code,'APP_UNTRUSTED');
  assert.deepEqual(launched,[],'Ninguna de estas rutas puede abrir la aplicación.');
});
