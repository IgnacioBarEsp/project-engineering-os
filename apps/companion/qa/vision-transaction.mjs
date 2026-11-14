import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,realpath,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createPreparationEngine} from '../engine/preparation.mjs';
const selection={name:'Proyecto',profile:'research',agents:['web'],goal:'Conservar mis palabras',vision:'Texto mío.'};
async function fixture(t){const root=await realpath(await mkdtemp(path.join(tmpdir(),'companion-vision-')));
  t.after(()=>rm(root,{recursive:true,force:true}));return {root,engine:createPreparationEngine()};}
test('vision appears in the real plan, participates in cancellation/recovery and never overwrites an original',async t=>{
  const {root,engine}=await fixture(t);const plan=await engine.plan(root,selection);
  assert.equal(plan.files.find(file=>file.path==='PROJECT_VISION.md').action,'create');
  const controller=new AbortController();
  await assert.rejects(engine.apply(plan.id,{signal:controller.signal,onProgress:value=>{if(value.completed===value.total-1)controller.abort();}}));
  assert.equal((await engine.verify(root)).base,'interrupted');
  await createPreparationEngine().resume(root);assert.match(await readFile(path.join(root,'PROJECT_VISION.md'),'utf8'),/Texto mío/);
  await engine.rollback(root);await assert.rejects(readFile(path.join(root,'PROJECT_VISION.md')),{code:'ENOENT'});
  const original=Buffer.from('\ufeff# Visión personal\r\nNo sustituir.\r\n');await writeFile(path.join(root,'PROJECT_VISION.md'),original);
  const keep=await engine.plan(root,selection);assert.equal(keep.files.find(file=>file.path==='PROJECT_VISION.md').action,'unchanged');
  await engine.apply(keep.id);assert.deepEqual(await readFile(path.join(root,'PROJECT_VISION.md')),original);
  await engine.rollback(root);assert.deepEqual(await readFile(path.join(root,'PROJECT_VISION.md')),original);
  await writeFile(path.join(root,'PROJECT_VISION.md'),Buffer.from([0xff,0xfe,0x00]));
  await assert.rejects(engine.plan(root,selection),error=>error.code==='VISION_ENCODING');
});
test('a vision created after preview invalidates the plan without overwriting it',async t=>{
  const {root,engine}=await fixture(t);const plan=await engine.plan(root,selection);
  await writeFile(path.join(root,'PROJECT_VISION.md'),'Creado por la persona.');
  await assert.rejects(engine.apply(plan.id),error=>error.code==='PLAN_STALE');
  assert.equal(await readFile(path.join(root,'PROJECT_VISION.md'),'utf8'),'Creado por la persona.');
});
test('legacy base journals remain recoverable without pretending the old operation owned the vision',async t=>{
  for(const action of ['resume','rollback']){
    const {root,engine}=await fixture(t),controller=new AbortController();
    const plan=await engine.plan(root,selection);
    await assert.rejects(engine.apply(plan.id,{signal:controller.signal,onProgress:value=>{if(value.completed===1)controller.abort();}}));
    const file=path.join(root,'.project-os/companion/transaction.json'),journal=JSON.parse(await readFile(file,'utf8'));
    journal.version=1;journal.operations=journal.operations.filter(op=>op.path!=='PROJECT_VISION.md');await writeFile(file,JSON.stringify(journal));
    await writeFile(path.join(root,'PROJECT_VISION.md'),'Archivo ajeno al journal v1.');
    await createPreparationEngine()[action](root);
    assert.equal((await engine.verify(root)).base,action==='resume'?'prepared':'not-prepared');
    assert.equal(await readFile(path.join(root,'PROJECT_VISION.md'),'utf8'),'Archivo ajeno al journal v1.');
  }
});
