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
