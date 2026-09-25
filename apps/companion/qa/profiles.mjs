import assert from 'node:assert/strict';
import test from 'node:test';
import {randomUUID} from 'node:crypto';
import {mkdir, mkdtemp, readFile, realpath, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import * as core from 'create-project-engineering-os';
import {hash, json} from '../engine/files.mjs';
import {inspectFolder} from '../engine/inventory.mjs';
import {createPreparationEngine, renderProjectVision} from '../engine/preparation.mjs';
import {createDesktopService} from '../desktop/service.mjs';
import {composePrompt} from '../context/prompts.mjs';
import {recipesFor} from '../context/recipes.mjs';
import {PROFILES, PROFILE_IDS, READABLE_PROFILE_IDS, resolveProfile, profileLabel, focusLabel,
  requiredStages, isEngineering, offeredStacks} from '../engine/profiles.mjs';

test('six profiles own every focus and all profile-driven decisions',()=>{
  assert.deepEqual(PROFILE_IDS,['software','research','studies','content','business','personal']);
  assert.equal(new Set(READABLE_PROFILE_IDS).size,READABLE_PROFILE_IDS.length);
  for(const id of PROFILE_IDS){
    const profile=PROFILES[id];
    assert.ok(profile.label&&profile.description&&profile.visionTemplate,id);
    assert.ok(Array.isArray(profile.setup)&&profile.setup.length&&Array.isArray(profile.method)&&profile.method.length,id);
    assert.ok(Array.isArray(profile.recipes)&&profile.recipes.length,id);
    assert.deepEqual(profile.stages,profile.engineering?['base','context','environment','engineering']:['base','context']);
    assert.equal(new Set(profile.focuses.map(focus=>focus.id)).size,profile.focuses.length,id);
    assert.ok(profile.focuses.length>=4,id);
    for(const item of profile.focuses){
      const resolved=resolveProfile({profile:id,focus:item.id});
      assert.equal(resolved.chosen,item);
      assert.equal(profileLabel({profile:id,focus:item.id}),profile.label);
      assert.equal(focusLabel({profile:id,focus:item.id}),item.label);
      assert.equal(isEngineering({profile:id,focus:item.id}),profile.engineering);
      assert.deepEqual(requiredStages({profile:id,focus:item.id}),profile.stages);
      assert.deepEqual(offeredStacks({profile:id,focus:item.id}),item.stacks??profile.stacks);
      assert.ok(item.label&&item.description&&item.setup.length&&item.method.length&&item.recipes.length,id+'/'+item.id);
      assert.ok(profile.focuses.some(other=>other.id!==item.id
        && JSON.stringify(other.setup)!==JSON.stringify(item.setup)
        && JSON.stringify(other.method)!==JSON.stringify(item.method)
        && JSON.stringify(other.recipes)!==JSON.stringify(item.recipes)),id+'/'+item.id);
      const rendered=composePrompt({selection:{profile:id,focus:item.id},pending:[]}).text;
      const recipeText=JSON.stringify(recipesFor({profile:id,focus:item.id}));
      assert.ok(profile.focuses.some(other=>other.id!==item.id
        && composePrompt({selection:{profile:id,focus:other.id},pending:[]}).text!==rendered
        && JSON.stringify(recipesFor({profile:id,focus:other.id}))!==recipeText),id+'/'+item.id);
    }
    const foreign=PROFILE_IDS.find(other=>other!==id);
    assert.throws(()=>resolveProfile({profile:id,focus:PROFILES[foreign].focuses[0].id}),/Enfoque ajeno/,id);
  }
});

test('historical ids resolve without editing input and retain special Unity/media behavior',()=>{
  const cases={science:['research','open'],docs:['content','technical'],mvp:['software','prototype'],
    automation:['software','automation'],unity:['software','game'],media:['content','creative'],general:['personal','open']};
  for(const [old,[profile,focus]] of Object.entries(cases)){
    const selection=Object.freeze({profile:old,name:'Proyecto anterior'}),before=JSON.stringify(selection);
    assert.deepEqual([resolveProfile(selection).profile,resolveProfile(selection).focus],[profile,focus]);
    assert.equal(JSON.stringify(selection),before);
  }
  assert.equal(isEngineering('unity'),true);
  assert.deepEqual(offeredStacks('unity'),[]);
  assert.equal(isEngineering('media'),false);
  assert.throws(()=>resolveProfile('unknown'),/Perfil desconocido/);
});

test('measured folder signals recommend a canonical profile and owned focus',async t=>{
  const cases=[
    [['ProjectSettings/ProjectVersion.txt'],'software','game'],
    [['project.godot'],'software','game'],
    [['package.json'],'software','open'],
    [['paper.tex'],'research','paper'],
    [['references.bib'],'research','paper'],
    [['analysis.ipynb'],'research','data'],
    [['slides.pptx'],'studies','presentation'],
    [['manual.md'],'content','manual'],
    [['propuesta.docx'],'business','plan'],
    [['workflow.json','image.png'],'content','creative'],
    [['note.txt'],'personal','open'],
  ];
  for(const [names,profile,focus] of cases){
    const root=await realpath(await mkdtemp(path.join(tmpdir(),'peos-profile-signal-')));
    t.after(()=>rm(root,{recursive:true,force:true}));
    for(const name of names){await mkdir(path.dirname(path.join(root,name)),{recursive:true});await writeFile(path.join(root,name),'fixture');}
    const found=await inspectFolder(root);
    assert.deepEqual([found.recommendation,found.focusRecommendation],[profile,focus],names.join(', '));
  }
});

test('a consistent 0.3.x-shaped Unity receipt and journal open without rewriting their bytes',async t=>{
  const root=await realpath(await mkdtemp(path.join(tmpdir(),'peos-legacy-profile-')));
  t.after(()=>rm(root,{recursive:true,force:true}));
  await writeFile(path.join(root,'Game.cs'),'public class Game {}');
  const engine=createPreparationEngine();
  const old={name:'Juego anterior',profile:'unity',experience:'guided',agents:['web'],goal:'Conservar el juego'};
  const fresh={...old,profile:'software',focus:'game'};
  await engine.apply((await engine.plan(root,fresh)).id);
  const namespace=path.join(root,'.project-os','companion');
  const projectPath=path.join(namespace,'project.json'),receiptPath=path.join(namespace,'receipt.json'),journalPath=path.join(namespace,'transaction.json');
  const project=JSON.parse(await readFile(projectPath,'utf8'));
  project.selection=old;const projectBytes=json(project);await writeFile(projectPath,projectBytes);
  const receipt=JSON.parse(await readFile(receiptPath,'utf8'));
  receipt.selection=old;receipt.files['project.json']=hash(projectBytes);
  const receiptBytes=json(receipt);await writeFile(receiptPath,receiptBytes);
  const journal=JSON.parse(await readFile(journalPath,'utf8'));
  journal.selection=old;
  for(const operation of journal.operations){
    if(operation.path==='.project-os/companion/project.json'){operation.after=projectBytes;operation.afterHash=hash(projectBytes);}
    if(operation.path==='.project-os/companion/receipt.json'){operation.after=receiptBytes;operation.afterHash=hash(receiptBytes);}
  }
  const journalBytes=json(journal);await writeFile(journalPath,journalBytes);
  const dataRoot=path.join(root,'app-history');
  await mkdir(dataRoot);
  const id=randomUUID();
  const historyBytes=json({version:1,items:[{id,root,name:old.name,selection:old}]});
  await writeFile(path.join(dataRoot,'projects.json'),historyBytes);
  const before=await Promise.all([projectPath,receiptPath,journalPath,path.join(dataRoot,'projects.json')].map(file=>readFile(file)));
  const service=await createDesktopService({dataRoot,core,chooseFolder:async()=>root,copyText:async()=>{},openExternal:async()=>{}});
  const rows=await service.listProjects();
  assert.equal(rows[0].profileLabel,'Software y apps');assert.equal(rows[0].focusLabel,'Videojuego');
  assert.deepEqual([rows[0].mappedProfile,rows[0].mappedFocus],['software','game']);
  assert.equal((await engine.verify(root)).selection.profile,'unity');
  assert.equal((await service.openProject({id})).base.selection.profile,'unity');
  const after=await Promise.all([projectPath,receiptPath,journalPath,path.join(dataRoot,'projects.json')].map(file=>readFile(file)));
  for(let i=0;i<before.length;i++)assert.deepEqual(after[i],before[i]);
  assert.match(renderProjectVision(old),/Perfil\*\*: Software y apps/);
  assert.doesNotMatch(renderProjectVision(old),/Perfil\*\*: unity/);
});
