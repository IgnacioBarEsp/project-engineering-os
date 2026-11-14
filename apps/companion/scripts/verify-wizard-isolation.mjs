import assert from 'node:assert/strict';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {rendererServiceFixture,selection,settle,click} from './renderer-service-fixture.mjs';

const current=page=>page.evaluate(async()=>{
  const {state}=await import('/lib/core.mjs');
  return {selection:state.selection,root:state.project?.root,id:state.project?.id,active:state.wizardActive,
    step:state.wizardStep,page:state.page,plan:state.plan?.id};
});
async function startDraft(page,test,root){
  test.pick(root);await click(page,'Preparar proyecto');await click(page,'Elegir carpeta');
  await page.locator('#wizard-name').fill('Draft A');
  await page.locator('input[name="profile"][value="personal"]').check();
  await click(page,'Continuar a Enfoque →');await click(page,'Continuar a Visión →');
  await page.locator('#vision-goal').fill('A objective must survive');await page.locator('#vision-free').fill('A original answers');
}
async function openListed(page){
  await page.locator('#nav [data-action="open-project-list"]').click();await settle(page);
  await page.locator('[data-row-action="open-project"]').click();await settle(page);
}
async function assertDraft(test,root,step){
  const saved=await test.service.draftLoad();
  assert.equal(saved.project.root,root);assert.equal(saved.selection.goal,'A objective must survive');
  assert.equal(saved.selection.vision,'A original answers');assert.equal(saved.step,step);
}

export async function verifyWizardIsolation(output){
  const harness=await rendererServiceFixture(output),report={scope:'Real renderer and service; native boundary injected; synthetic folders.',
    cases:[],failures:[],completed:false};
  const record=async(id,motion,run)=>{
    try{await run();report.cases.push({id,motion,passed:true});}
    catch(error){report.failures.push({id,motion,message:error.message});}
  };
  try{
    for(const motion of ['no-preference','reduce']){
      for(const step of [2,3])await record('draft-project-switch-step-'+step,motion,async()=>{
        const test=await harness.projectCase('switch-'+step+'-'+motion),rootA=await test.folder('draft-a'),rootB=await test.folder('prepared-b');
        await test.prepared(rootB,selection('Prepared B'));
        let pageState=await harness.page(test.service,{motion});
        try{
          let {page}=pageState;await startDraft(page,test,rootA);
          if(step===3)await click(page,'Continuar a Preparar →');
          const original=await current(page);
          await openListed(page);assert.equal((await current(page)).root,rootB);
          assert.equal(await page.evaluate(()=>globalThis.companionBeforeClose()),true);
          await assertDraft(test,rootA,step);
          await click(page,'Preparar proyecto');let restored=await current(page);
          assert.equal(restored.root,rootA);assert.equal(restored.step,step);assert.equal(restored.selection.goal,'A objective must survive');
          if(step===3){assert.ok(restored.plan);assert.notEqual(restored.plan,original.plan);}
          assert.deepEqual(pageState.errors,[]);
          // A second browse followed by renderer/service restart must also retain A.
          await openListed(page);assert.equal(await page.evaluate(()=>globalThis.companionBeforeClose()),true);
          await pageState.context.close();await test.restart();
          pageState=await harness.page(test.service,{motion});page=pageState.page;
          await click(page,'Continuar borrador');restored=await current(page);
          assert.equal(restored.root,rootA);assert.equal(restored.step,step);assert.equal(restored.selection.vision,'A original answers');
          assert.deepEqual(await readdir(rootA),['notes.txt']);assert.equal(await readFile(path.join(rootA,'notes.txt'),'utf8'),'Synthetic source; preserve it.');
          assert.deepEqual(pageState.errors,[]);
        }finally{await pageState.context.close();}
      });
      await record('draft-save-failure-keeps-active-project',motion,async()=>{
        const test=await harness.projectCase('save-failure-'+motion),rootA=await test.folder('draft-a'),rootB=await test.folder('prepared-b');
        await test.prepared(rootB,selection('Prepared B'));
        let failSave=false,opened=0;
        const {page,context,errors}=await harness.page(test.service,{motion,intercept:async name=>{
          if(name==='draftSave'&&failSave)throw Object.assign(new Error('Injected draft write failure'),{code:'DRAFT_TEST_FAILURE'});
          if(name==='openProject')opened++;
        }});
        try{
          await startDraft(page,test,rootA);failSave=true;await openListed(page);
          assert.equal(opened,0,'Do not open another project if the draft cannot be saved');
          assert.equal((await current(page)).root,rootA);assert.equal((await current(page)).active,true);
          assert.equal(await page.locator('#feedback').isVisible(),true);
          assert.equal(await page.evaluate(()=>globalThis.companionBeforeClose()),false);
          failSave=false;assert.equal(await page.evaluate(()=>globalThis.companionBeforeClose()),true);
          await assertDraft(test,rootA,2);assert.deepEqual(errors,[]);
        }finally{await context.close();}
      });
      await record('known-folder-entry-preserves-draft',motion,async()=>{
        const test=await harness.projectCase('known-folder-'+motion),rootA=await test.folder('draft-a'),rootB=await test.folder('prepared-b');
        await test.prepared(rootB,selection('Prepared B'));const {page,context,errors}=await harness.page(test.service,{motion});
        try{
          await startDraft(page,test,rootA);await click(page,'Inicio');test.pick(rootB);
          await click(page,'Abrir una carpeta existente');assert.equal((await current(page)).root,rootB);
          assert.equal(await page.evaluate(()=>globalThis.companionBeforeClose()),true);await assertDraft(test,rootA,2);
          await click(page,'Preparar proyecto');assert.equal((await current(page)).root,rootA);
          assert.equal(await page.locator('#vision-free').inputValue(),'A original answers');assert.deepEqual(errors,[]);
        }finally{await context.close();}
      });
      await record('folder-never-overrides-explicit-answers',motion,async()=>{
        const test=await harness.projectCase('folder-choices-'+motion),first=await test.folder('first',{'paper.tex':'Synthetic article'}),
          second=await test.folder('second',{'paper.tex':'Other synthetic article'});
        const {page,context,errors}=await harness.page(test.service,{motion});
        try{
          await click(page,'Preparar proyecto');await page.locator('input[name="profile"][value="business"]').check();
          test.pick(first);await click(page,'Elegir carpeta');
          assert.equal(await page.locator('input[name="profile"]:checked').inputValue(),'business');
          assert.ok((await page.locator('.wizard-folder').innerText()).includes('Investigación y ciencia'));
          await page.locator('#wizard-name').fill('My explicit name');await page.locator('input[name="profile"][value="software"]').check();
          await click(page,'Continuar a Enfoque →');
          await page.locator('input[name="focus"][value="service"]').check();
          await page.locator('input[name="stack-decision"][value="chosen"]').check();
          await page.locator('input[name="stack"][value="typed-code"]').check();
          await click(page,'Volver');const before=(await current(page)).selection;
          test.pick(second);await click(page,'Cambiar carpeta');
          assert.deepEqual((await current(page)).selection,before);assert.equal((await current(page)).root,second);
          test.pick(null);await click(page,'Cambiar carpeta');
          assert.deepEqual((await current(page)).selection,before);assert.equal((await current(page)).root,second);
          assert.equal(await page.evaluate(()=>globalThis.companionBeforeClose()),true);
          const saved=await test.service.draftLoad();assert.deepEqual(saved.selection,before);assert.equal(saved.project.root,second);
          assert.deepEqual(await readdir(first),['paper.tex']);assert.deepEqual(await readdir(second),['paper.tex']);assert.deepEqual(errors,[]);
        }finally{await context.close();}
      });
    }
    assert.deepEqual(report.failures,[]);assert.equal(report.cases.length,10);report.completed=true;return report;
  }finally{await writeFile(path.join(output,'wizard-isolation.json'),JSON.stringify(report,null,2)+'\n');await harness.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const report=await verifyWizardIsolation(process.argv[2]??path.join(tmpdir(),'project-os-closeout','wizard-isolation'));
  console.log(JSON.stringify({cases:report.cases.length,completed:report.completed}));
}
