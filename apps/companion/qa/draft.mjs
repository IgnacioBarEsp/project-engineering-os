import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,readFile,readdir,realpath,rename,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import * as core from 'create-project-engineering-os';
import {createDesktopService} from '../desktop/service.mjs';
import {DRAFT_MAX_BYTES} from '../desktop/draft.mjs';
import {renderProjectVision} from '../engine/preparation.mjs';

const answer=()=>({name:'',goal:'',profile:'software',focus:'website',vision:'',agents:['web'],
  stack:{decision:'too-early',requested:[]},visionMode:'free'});
async function fixture(t){
  const dir=await realpath(await mkdtemp(path.join(tmpdir(),'peos-wizard-draft-')));
  t.after(()=>rm(dir,{recursive:true,force:true}));
  const root=path.join(dir,'project'),dataRoot=path.join(dir,'app-data');await mkdir(root);
  await writeFile(path.join(root,'original.txt'),'Original, unchanged.');
  const dependencies={dataRoot,core,chooseFolder:async()=>root,copyText:async()=>{},openExternal:async()=>{}};
  const service=await createDesktopService(dependencies);
  return {root,dataRoot,service,dependencies};
}
const isCode=code=>error=>error.code===code;

test('wizard draft survives restart and never writes to the selected folder',async t=>{
  const f=await fixture(t),folder=await f.service.chooseFolder();
  const s={...answer(),name:'Plan de negocio',profile:'business',focus:'plan',goal:'Comparar costos reales',
    vision:'Usar fuentes locales.',agents:['web','codex']};
  assert.deepEqual(await f.service.draftSave({draft:{step:2,selection:s,projectId:folder.id}}),{saved:true});
  assert.deepEqual(await readdir(f.root),['original.txt']);
  assert.equal((await readFile(path.join(f.root,'original.txt'),'utf8')),'Original, unchanged.');
  const bytes=await readFile(path.join(f.dataRoot,'draft.json'));
  const restarted=await createDesktopService(f.dependencies);
  const loaded=await restarted.draftLoad();
  assert.equal(loaded.step,2);assert.deepEqual(loaded.selection,s);
  assert.equal(loaded.project.root,folder.root);
  assert.notEqual(loaded.project.id,folder.id,'An uncommitted folder gets a fresh in-memory handle after restart');
  assert.deepEqual(await readFile(path.join(f.dataRoot,'draft.json')),bytes);
  assert.deepEqual(await readdir(f.root),['original.txt']);
  await restarted.draftSave({draft:{step:3,selection:s,projectId:loaded.project.id}});
  await restarted.draftClear();
  assert.equal(await restarted.draftLoad(),null);
  assert.deepEqual(await readdir(f.root),['original.txt']);
});

test('draft save rejects foreign focus, unknown fields, forged folder handle and excess bytes',async t=>{
  const f=await fixture(t),folder=await f.service.chooseFolder(),valid={step:0,selection:answer(),projectId:folder.id};
  await f.service.draftSave({draft:valid});
  const file=path.join(f.dataRoot,'draft.json'),before=await readFile(file);
  await assert.rejects(f.service.draftSave({draft:{...valid,selection:{...valid.selection,focus:'paper'}}}),isCode('DRAFT_INVALID'));
  await assert.rejects(f.service.draftSave({draft:{...valid,selection:{...valid.selection,name:'two\nlines'}}}),isCode('DRAFT_INVALID'));
  await assert.rejects(f.service.draftSave({draft:{...valid,selection:{...valid.selection,focus:'game',stack:{decision:'chosen',requested:['typed-code']}}}}),isCode('DRAFT_INVALID'));
  await assert.rejects(f.service.draftSave({draft:{...valid,selection:{...valid.selection,secret:'x'}}}),isCode('DRAFT_INVALID'));
  await assert.rejects(f.service.draftSave({draft:{...valid,projectId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'}}),isCode('PROJECT_UNKNOWN'));
  await assert.rejects(f.service.draftSave({draft:{...valid,root:f.root}}),isCode('DRAFT_INVALID'));
  await assert.rejects(f.service.draftSave({draft:{...valid,step:3}}),isCode('DRAFT_INVALID'));
  await assert.rejects(f.service.draftSave({draft:{...valid,step:1,selection:{...answer(),name:'Proyecto'},projectId:null}}),isCode('DRAFT_INVALID'));
  await assert.rejects(f.service.draftSave({draft:{...valid,selection:{...valid.selection,vision:'a'.repeat(DRAFT_MAX_BYTES)}}}),isCode('DRAFT_INVALID'));
  assert.deepEqual(await readFile(file),before);
  assert.deepEqual(await readdir(f.root),['original.txt']);
});

test('malformed draft and moved folder are refused without rewriting their evidence',async t=>{
  const f=await fixture(t),folder=await f.service.chooseFolder(),draft={step:1,selection:{...answer(),name:'Proyecto'},projectId:folder.id};
  await f.service.draftSave({draft});
  const file=path.join(f.dataRoot,'draft.json'),original=await readFile(file);await writeFile(file,'{"version":1,"step":99}');
  const bad=await readFile(file);const restarted=await createDesktopService(f.dependencies);
  await assert.rejects(restarted.draftLoad(),isCode('DRAFT_INVALID'));
  await assert.rejects(f.service.draftSave({draft}),isCode('DRAFT_INVALID'));
  assert.deepEqual(await readFile(file),bad);
  await writeFile(file,original);
  const moved=path.join(path.dirname(f.root),'renamed');await rename(f.root,moved);
  const saved=await readFile(file);const again=await createDesktopService(f.dependencies);
  await assert.rejects(again.draftLoad(),isCode('DRAFT_FOLDER_UNAVAILABLE'));
  assert.deepEqual(await readFile(file),saved);
  assert.deepEqual(await readdir(moved),['original.txt']);
  const preserved=await again.draftClear({preserveInvalid:true});
  assert.match(preserved.preservedAs,/^draft-preserved-[a-f0-9-]+\.json$/);
  assert.deepEqual(await readFile(path.join(f.dataRoot,preserved.preservedAs)),saved);
  assert.equal(await again.draftLoad(),null);
});

test('an invalid draft is quarantined, not overwritten or silently deleted',async t=>{
  const f=await fixture(t),file=path.join(f.dataRoot,'draft.json'),bad='{"version":1,"step":99}';
  await writeFile(file,bad);
  await assert.rejects(f.service.draftClear(),isCode('DRAFT_INVALID'));
  await assert.rejects(f.service.draftClear({preserveInvalid:'true'}),isCode('DRAFT_INVALID'));
  assert.equal(await readFile(file,'utf8'),bad);
  const result=await f.service.draftClear({preserveInvalid:true});
  assert.equal(await readFile(path.join(f.dataRoot,result.preservedAs),'utf8'),bad);
  assert.equal(await f.service.draftLoad(),null);
  assert.deepEqual(await readdir(f.root),['original.txt']);
});

test('vision preview is exactly the pure file renderer and writes nothing',async t=>{
  const f=await fixture(t),selection={name:'Mi trabajo',profile:'research',focus:'paper',goal:'Comparar evidencia',
    vision:'## Mi pregunta\n¿Qué muestran mis fuentes?',agents:['web'],experience:'guided',stack:{decision:'too-early',requested:[]}};
  const preview=await f.service.previewVision({selection});
  assert.equal(preview.text,renderProjectVision(selection));
  assert.equal(preview.text,(await f.service.previewVision({selection:{...selection,installMode:'quick'}})).text,
    'Changing the preparation route does not change the person vision after they preview it');
  assert.doesNotMatch(preview.text,/100%|Directrices de Ejecución|Modalidad de Configuración/);
  assert.deepEqual(await readdir(f.root),['original.txt']);
  await assert.rejects(f.service.previewVision({selection:{...selection,profile:'business',focus:'paper'}}),isCode('FOCUS_INVALID'));
});
