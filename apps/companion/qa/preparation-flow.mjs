import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,realpath,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import * as core from 'create-project-engineering-os';
import {createDesktopService} from '../desktop/service.mjs';
import {createPreparationFlow,preparationStages} from '../ui/lib/preparation-flow.mjs';
const selection={name:'Ensayo',profile:'research',focus:'open',goal:'Comparar evidencia',agents:['claude-code','gemini','kiro','windsurf'],installMode:'ai'};
async function fixture(t,chosen=selection){
  const temp=await realpath(await mkdtemp(path.join(tmpdir(),'companion-flow-')));
  t.after(()=>rm(temp,{recursive:true,force:true}));
  const root=path.join(temp,'project');await mkdir(root);await writeFile(path.join(root,'source.txt'),'Evidencia medible y comprobada.');
  const copied=[],opened=[],events=[];
  const service=await createDesktopService({dataRoot:path.join(temp,'data'),core,chooseFolder:async()=>root,
    copyText:async value=>copied.push(value),openExternal:async value=>opened.push(value),onProgress:value=>events.push(value)});
  const project=await service.chooseFolder(),initialPlan=await service.previewBase({id:project.id,selection:chosen});
  const calls=[],call=async(name,input)=>{calls.push(name);return service[name](input);};
  return {root,service,project,copied,opened,events,calls,call,initialPlan};
}
test('both non-software routes prepare real base/context with reviewed boundaries and no tools',async t=>{
  for(const installMode of ['ai','quick']){
    const chosen={...selection,installMode},f=await fixture(t,chosen);
    const flow=createPreparationFlow({call:f.call,id:f.project.id,selection:chosen,initialPlan:f.initialPlan});
    await flow.apply();
    assert.equal(flow.snapshot().stages[0].state,'done');assert.equal(flow.snapshot().stages[1].state,'review');
    assert.equal((await f.service.status({id:f.project.id})).context.context,'not-prepared');
    await flow.apply();const {result}=flow.snapshot();assert.ok(result);assert.deepEqual(result.pending,[]);
    assert.ok(result.report.stages.every(stage=>stage.state==='ready'));
    assert.ok(f.calls.every(name=>! /Environment|Engineering|Activation|Stack/.test(name)));
    assert.equal((await f.service.listProjects())[0].state,'verified');
    assert.match(await readFile(path.join(f.root,'CLAUDE.md'),'utf8'),/@AGENTS\.md/);
    assert.match(await readFile(path.join(f.root,'GEMINI.md'),'utf8'),/MAP.md/);
    const preview=await f.service.handoffPreview({id:f.project.id,agent:'gemini',purpose:'activation'});
    assert.equal(preview.mode,'manual');assert.equal(preview.cause,'route-only');
    assert.equal(preview.prompt,result.prompt);
    await f.service.handoff({preview:preview.id,copy:true});assert.equal(f.copied[0],preview.prompt);assert.deepEqual(f.opened,[]);
    assert.equal(await readFile(path.join(f.root,'source.txt'),'utf8'),'Evidencia medible y comprobada.');
  }
});
test('software delegated route names pending development; local context reserves canonical input before bootstrap',async t=>{
  for(const installMode of ['ai','quick']){
    const chosen={...selection,profile:'software',focus:'website',installMode,agents:['claude-code','codex']},f=await fixture(t,chosen);
    const flow=createPreparationFlow({call:f.call,id:f.project.id,selection:chosen,initialPlan:f.initialPlan});
    await flow.apply();assert.equal(flow.snapshot().stages[1].state,'review');
    await flow.apply();
    if(installMode==='ai'){
      assert.deepEqual(flow.snapshot().result.done,['base','context']);
      assert.ok(flow.snapshot().result.pending.includes('environment'));assert.match(flow.snapshot().result.prompt,/Tres preguntas/);
    }else{
      assert.equal(flow.snapshot().stages[2].state,'failed','No managed environment in this fixture');
      execFileSync('git',['init','-q',f.root],{windowsHide:true});
      const engineering=await f.service.previewEngineering({id:f.project.id});
      assert.equal(engineering.status,'planned',JSON.stringify(engineering));
      assert.ok(engineering.preservedOriginals.includes('.project-os/instructions.md'));
      await f.service.applyEngineering({plan:engineering.id});
      await flow.finish();assert.ok(flow.snapshot().result.pending.includes('context'),'Core ownership changed and must be re-reviewed');
      const context=await f.service.previewContext({id:f.project.id});await f.service.applyContext({plan:context.id});
      const sync=await f.service.previewSync({id:f.project.id});await f.service.applyEngineering({plan:sync.id});
      const refreshed=await f.service.previewContext({id:f.project.id});await f.service.applyContext({plan:refreshed.id});
      const final=await f.service.status({id:f.project.id});assert.equal(final.context.context,'current');assert.equal(final.engineering.files,'prepared');
    }
  }
});
test('orchestrator cancels at a commit boundary, retains done stages and never starts the next operation',async()=>{
  let flow;const calls=[];
  const call=async name=>{calls.push(name);flow.markCancelled();return {status:{base:{base:'prepared'}}};};
  flow=createPreparationFlow({call,id:'opaque',selection,initialPlan:{id:'base-plan'}});
  await flow.apply();assert.deepEqual(calls,['applyBase']);
  assert.equal(flow.snapshot().stages[0].state,'done');assert.equal(flow.snapshot().stages[1].state,'failed');
  assert.equal(flow.snapshot().stages[1].error.code,'CANCELLED');
});
test('failed preview retries get a new capability; local stage order and selected technology are explicit',async()=>{
  const chosen={...selection,profile:'software',focus:'website',installMode:'quick',stack:{decision:'chosen',requested:['typed-code']}};
  assert.deepEqual(preparationStages(chosen).map(item=>item.id),['base','context','environment','engineering','activation','stack','context-final','sync','context-refresh','base-refresh']);
  let attempts=0;const calls=[];
  const flow=createPreparationFlow({id:'opaque',selection,initialPlan:{id:'base-plan'},call:async(name,input)=>{
    calls.push([name,input]);if(name==='applyBase')return {status:{base:{base:'prepared'}}};
    if(name==='previewContext'&&attempts++===0)throw {code:'CONTEXT_STALE'};
    return {id:'new-plan'};
  }});
  await flow.apply();assert.equal(flow.snapshot().stages[1].state,'failed');await flow.retry();
  assert.equal(flow.snapshot().stages[1].state,'review');assert.equal(flow.snapshot().stages[1].plan.id,'new-plan');
  assert.equal(calls.filter(([name])=>name==='applyBase').length,1);
});
