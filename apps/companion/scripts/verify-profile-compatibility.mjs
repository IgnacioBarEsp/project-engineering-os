import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {LEGACY_PROFILE_MAP,resolveProfile} from '../engine/profiles.mjs';
import {rendererServiceFixture,selection,historicalSelection,settle,click} from './renderer-service-fixture.mjs';

export async function verifyProfileCompatibility(output){
  const fixture=await rendererServiceFixture(output);
  const selections=[...Object.keys(LEGACY_PROFILE_MAP),'software','research'].map(profile=>({profile}));
  selections.push({profile:'software',subtype:'Aplicación móvil'},{profile:'research',focus:'paper'});
  const report={scope:'Historical persisted selections with real renderer/service; native boundary injected; no plan applied.',
    cases:[],completed:false};
  try{
    for(const motion of ['no-preference','reduce']){
      for(const [index,previous] of selections.entries()){
        const id=previous.profile,test=await fixture.projectCase(id+'-'+index+'-'+motion),root=await test.folder('historical');
        const mapped=resolveProfile(previous),project=await test.prepared(root,selection('Historical '+id,mapped.profile,mapped.focus),{context:false});
        const old={name:'Historical '+id,...previous,experience:'guided',agents:['web'],goal:'Preserve historical choices'};
        const files=await historicalSelection(test,project,old),before=await Promise.all(files.map(file=>readFile(file)));
        await writeFile(path.join(root,'changed.txt'),'Inventory changed after preparation');
        await test.restart();
        const {page,context,errors}=await fixture.page(test.service,{motion});
        try{
          await click(page,'Tus proyectos');await page.locator('[data-row-action="open-project"]').click();await settle(page);
          await click(page,'Revisar tus elecciones otra vez');
          assert.equal(await page.locator('#feedback').isVisible(),false,await page.locator('#feedback').innerText());
          await page.getByRole('heading',{name:'Esto es lo que se va a escribir.',exact:true}).waitFor();
          const observed=await page.evaluate(async()=>{
            const {state}=await import('/lib/core.mjs');
            return {selection:state.selection,page:state.page,root:state.project.root,files:state.plan.files.length};
          });
          assert.equal(observed.page,'base-review');assert.equal(observed.root,root);
          assert.deepEqual([observed.selection.profile,observed.selection.focus],[mapped.profile,mapped.focus]);
          assert.equal(observed.selection.goal,old.goal);assert.ok(observed.files>0);
          assert.match(await page.locator('.review-grid').innerText(),new RegExp(mapped.definition.label.replace(/[.*+?^\${}()|[\]\\]/g,'\\$&')));
          for(let index=0;index<files.length;index++)assert.deepEqual(await readFile(files[index]),before[index],files[index]);
          assert.deepEqual(errors,[]);
          report.cases.push({legacy:previous,motion,profile:mapped.profile,focus:mapped.focus,reviewedFiles:observed.files,bytesPreserved:files.length});
        }finally{await context.close();}
      }
    }
    assert.equal(report.cases.length,selections.length*2);
    report.completed=true;return report;
  }finally{
    await writeFile(path.join(output,'profile-compatibility.json'),JSON.stringify(report,null,2)+'\n');
    await fixture.close();
  }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const report=await verifyProfileCompatibility(process.argv[2]??path.join(tmpdir(),'project-os-closeout','profile-compatibility'));
  console.log(JSON.stringify({cases:report.cases.length,completed:report.completed}));
}
