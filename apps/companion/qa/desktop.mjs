import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, realpath } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import * as core from 'create-project-engineering-os';
import { createDesktopService, DESTINATIONS } from '../desktop/service.mjs';

async function fixture(t,profile='research',options={}) {
  const dir=await realpath(await mkdtemp(path.join(tmpdir(),'companion-desktop-')));
  t.after(()=>rm(dir,{recursive:true,force:true}));
  const root=path.join(dir,'project'),dataRoot=path.join(dir,'app-data');await mkdir(root);
  await writeFile(path.join(root,'original.txt'),'Evidence: measured tokens must be reported by the model.\nNever invent a measurement.');
  const copied=[],opened=[],events=[];
  const dependencies={dataRoot,core,chooseFolder:async()=>root,copyText:async v=>copied.push(v),openExternal:async v=>opened.push(v),onProgress:e=>events.push(e),...options};
  const service=await createDesktopService(dependencies),project=await service.chooseFolder();
  const selection={name:'<img src=x onerror=alert(1)>',role:'researcher',goal:'Find evidence about measured tokens',profile,experience:'guided',agents:['web']};
  return {dir,root,dataRoot,copied,opened,events,service,project,selection,dependencies};
}
async function prepare(f) {const plan=await f.service.previewBase({id:f.project.id,selection:f.selection});await f.service.applyBase({plan:plan.id});const ctx=await f.service.previewContext({id:f.project.id});await f.service.applyContext({plan:ctx.id});return ctx;}
const code=value=>error=>error.code===value;

test('desktop five profiles: reviewed real writes, attributed search, reusable history and external handoff',async t=>{
  for(const profile of ['research','software','unity','media','general']){
    const f=await fixture(t,profile);const original=await readFile(path.join(f.root,'original.txt'));
    await prepare(f);const s=await f.service.status({id:f.project.id});assert.equal(s.base.base,'prepared');assert.equal(s.context.context,'current');
    assert.equal(s.base.selection.goal,f.selection.goal);assert.equal(s.base.selection.role,'researcher');
    assert.equal((await f.service.search({id:f.project.id,query:'measured tokens'})).hits[0].path,'original.txt');
    const e=await f.service.exportPreview({id:f.project.id,query:'measured tokens'});assert.equal(f.copied.length,0);assert.equal(e.sent,false);
    await f.service.copyExport({export:e.id});assert.equal(f.copied[0],e.text);
    const preview=await f.service.handoffPreview({id:f.project.id,agent:'web'});
    const handoff=await f.service.handoff({preview:preview.id,copy:true});assert.equal(handoff.prompt,preview.prompt);assert.equal(handoff.agentActivated,false);assert.equal(handoff.projectAttached,false);assert.equal(f.opened[0],DESTINATIONS.web);
    const reopened=await createDesktopService(f.dependencies);const history=await reopened.listProjects();assert.equal(history.length,1);
    assert.equal((await reopened.openProject({id:history[0].id})).context.context,'current');
    assert.deepEqual(await readFile(path.join(f.root,'original.txt')),original);
    await reopened.forgetProject({id:history[0].id});assert.equal((await reopened.listProjects()).length,0);assert.deepEqual(await readFile(path.join(f.root,'original.txt')),original);
  }
});

test('desktop rejects renderer roots, unknown handles, unsafe URLs, altered plan and oversized selection',async t=>{
  const f=await fixture(t);await assert.rejects(f.service.previewBase({id:f.project.id,root:f.root,selection:f.selection}),code('INPUT_INVALID'));
  await assert.rejects(f.service.status({id:'../../elsewhere'}),code('PROJECT_UNKNOWN'));
  await assert.rejects(f.service.previewBase({id:f.project.id,selection:{...f.selection,goal:'x'.repeat(501)}}),code('GOAL_INVALID'));
  await assert.rejects(f.service.applyBase({plan:'unknown'}),code('PLAN_UNKNOWN'));
  await assert.rejects(f.service.handoffPreview({id:f.project.id,agent:'file:///secret'}),code('HANDOFF_INVALID'));
  await assert.rejects(f.service.handoff({preview:'unknown',copy:false}),code('HANDOFF_INVALID'));
  await assert.rejects(f.service.recover({id:f.project.id,stage:'../../',action:'rollback'}),code('RECOVERY_INVALID'));
  const plan=await f.service.previewBase({id:f.project.id,selection:f.selection});await writeFile(path.join(f.root,'original.txt'),'Changed source');
  await assert.rejects(f.service.applyBase({plan:plan.id}),code('PLAN_STALE'));
  assert.equal(f.opened.length,0);assert.equal(f.copied.length,0);
});

test('desktop export requires a current reviewed receipt after exclusions or changed sources',async t=>{
  const f=await fixture(t);await prepare(f);const e=await f.service.exportPreview({id:f.project.id,query:'tokens'});
  const p=await f.service.previewContext({id:f.project.id,exclude:['original.txt']});await f.service.applyContext({plan:p.id});
  await assert.rejects(f.service.copyExport({export:e.id}),code('CONTEXT_STALE'));assert.equal(f.copied.length,0);
  await writeFile(path.join(f.root,'new.txt'),'new evidence');await assert.rejects(f.service.search({id:f.project.id,query:'evidence'}),code('CONTEXT_STALE'));
});

test('desktop serializes jobs and cancellation leaves a recoverable project in history',async t=>{
  let released,started;const start=new Promise(r=>started=r),gate=new Promise(r=>released=r);
  const f=await fixture(t);
  const slow=await createDesktopService({...f.dependencies,chooseFolder:async()=>{started();await gate;return f.root;}});
  const choosing=slow.chooseFolder();await start;
  assert.ok(await slow.job());await assert.rejects(slow.listProjects(),code('BUSY'));await slow.cancel();released();await choosing;
  assert.equal(await slow.job(),null);
  // Pause at a real write, using the trusted progress adapter; restart through persisted history.
  let service;let interrupted=false;
  service=await createDesktopService({...f.dependencies,onProgress:e=>{if(e.stage==='base'&&!interrupted){interrupted=true;void service.cancel();}}});
  const folder=await service.chooseFolder(),p=await service.previewBase({id:folder.id,selection:f.selection});
  await assert.rejects(service.applyBase({plan:p.id}),code('CANCELLED'));
  const restarted=await createDesktopService(f.dependencies),items=await restarted.listProjects();assert.equal(items.length,1);
  const state=await restarted.openProject({id:items[0].id});assert.equal(state.base.base,'interrupted');
  await restarted.recover({id:items[0].id,stage:'base',action:'resume'});
  assert.equal((await restarted.status({id:items[0].id})).base.base,'prepared');
});

test('desktop engineering uses pinned published core and preserves sync/context boundaries',async t=>{
  const f=await fixture(t,'software');execFileSync('git',['init','-q',f.root],{windowsHide:true});
  const b=await f.service.previewBase({id:f.project.id,selection:f.selection});await f.service.applyBase({plan:b.id});
  const e=await f.service.previewEngineering({id:f.project.id});assert.equal(e.status,'planned');await f.service.applyEngineering({plan:e.id});
  await writeFile(path.join(f.root,'private-notes.txt'),'confidential unpublished evidence');
  let c=await f.service.previewContext({id:f.project.id,exclude:['private-notes.txt']});await f.service.applyContext({plan:c.id});
  const s=await f.service.previewSync({id:f.project.id});assert.equal(s.status,'planned');await f.service.applyEngineering({plan:s.id});
  c=await f.service.previewContext({id:f.project.id});await f.service.applyContext({plan:c.id});
  assert.deepEqual(c.exclude,['private-notes.txt']);assert.equal((await f.service.search({id:f.project.id,query:'confidential unpublished'})).hits.some(h=>h.path==='private-notes.txt'),false);
  const state=await f.service.status({id:f.project.id});assert.equal(state.engineering.files,'prepared');assert.equal(state.engineering.workflows,'not-verified');assert.equal(state.context.context,'current');
});

test('failed selection update never becomes the project objective or external starting instruction',async t=>{
  const f=await fixture(t);await prepare(f);
  const plan=await f.service.previewBase({id:f.project.id,selection:{...f.selection,name:'Unapplied name',goal:'Unapplied objective'}});
  await writeFile(path.join(f.root,'new.txt'),'source drift');
  await assert.rejects(f.service.applyBase({plan:plan.id}),code('PLAN_STALE'));
  const current=await f.service.status({id:f.project.id});assert.equal(current.project.selection.goal,f.selection.goal);assert.equal(current.project.name,f.selection.name);
  const c=await f.service.previewContext({id:f.project.id});await f.service.applyContext({plan:c.id});
  const preview=await f.service.handoffPreview({id:f.project.id,agent:'web'});
  const h=await f.service.handoff({preview:preview.id,copy:false});assert.ok(h.prompt.includes(f.selection.goal));assert.ok(!h.prompt.includes('Unapplied'));
});

test('desktop exposes tampered owned-file failure without losing recovery controls',async t=>{
  const f=await fixture(t);await prepare(f);await writeFile(path.join(f.root,'.project-os/companion/context/MAP.md'),'Local edit');
  const state=await f.service.status({id:f.project.id});assert.equal(state.context.status,'requires-action');assert.ok(state.context.error.message);
  await assert.rejects(f.service.recover({id:f.project.id,stage:'context',action:'rollback'}),code('RECOVERY_CONFLICT'));
  assert.equal(await readFile(path.join(f.root,'.project-os/companion/context/MAP.md'),'utf8'),'Local edit');
});

test('reviewed handoff expires when the applied objective or context receipt changes',async t=>{
  const f=await fixture(t);await prepare(f);
  const preview=await f.service.handoffPreview({id:f.project.id,agent:'web'});
  const b=await f.service.previewBase({id:f.project.id,selection:{...f.selection,goal:'A new reviewed objective'}});await f.service.applyBase({plan:b.id});
  const c=await f.service.previewContext({id:f.project.id});await f.service.applyContext({plan:c.id});
  await assert.rejects(f.service.handoff({preview:preview.id,copy:true}),code('PLAN_STALE'));assert.equal(f.copied.length,0);assert.equal(f.opened.length,0);
  const next=await f.service.handoffPreview({id:f.project.id,agent:'web'});await f.service.handoff({preview:next.id,copy:true});
  assert.equal(f.copied[0],next.prompt);await assert.rejects(f.service.handoff({preview:next.id,copy:true}),code('HANDOFF_INVALID'));
});

test('interrupted real engineering transaction can resume or roll back through a reviewed opaque plan',async t=>{
  for(const action of ['applyEngineering','rollbackEngineering']){
    const f=await fixture(t,'software');execFileSync('git',['init','-q',f.root],{windowsHide:true});
    const b=await f.service.previewBase({id:f.project.id,selection:f.selection});await f.service.applyBase({plan:b.id});
    const original=await readFile(path.join(f.root,'original.txt'));
    await assert.rejects(core.runBootstrapOrSync({command:'bootstrap',targetRoot:f.root,injectFailureAfter:1}));
    assert.equal((await f.service.status({id:f.project.id})).engineering.interrupted,true);
    const preview=await f.service.previewEngineering({id:f.project.id});assert.equal(preview.status,'planned');assert.ok(preview.incompleteTransaction);
    const result=await f.service[action]({plan:preview.id});assert.equal(result.result.status,action==='applyEngineering'?'APPLIED':'ROLLED_BACK');
    assert.deepEqual(await readFile(path.join(f.root,'original.txt')),original);
    await assert.rejects(f.service.rollbackEngineering({plan:preview.id}),code('PLAN_UNKNOWN'));
  }
});
