import assert from 'node:assert/strict';

// Normal UI interaction only. No synthetic success, forced clicks or engine calls.
// Browser-only fixtures explicitly permit finishing at the unavailable native runtime;
// native journeys leave that option false and must complete every approved stage.
export async function finishPreparation(page,{allowUnavailable=false,measure=async()=>{},timeout=30000}={}) {
  await page.getByRole('heading',{name:'Preparar tu proyecto',exact:true}).waitFor({timeout});
  const visited=[];
  for(let count=0;count<15;count++){
    await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')!=='true',null,{timeout});
    if(await page.getByRole('heading',{name:'Resultado de la preparación',exact:true}).count())return visited;
    const failed=page.locator('.preparation-stages [data-state="failed"]');
    if(await failed.count()){
      const id=await failed.getAttribute('data-stage');
      assert.ok(allowUnavailable&&id==='environment',`Preparation failed at ${id}: ${await page.locator('#view').innerText()}`);
      assert.match(await page.locator('#view').innerText(),/Las herramientas no están disponibles en este equipo/);
      await measure('environment-unavailable');visited.push('environment-unavailable');
      await page.getByRole('button',{name:'Ver el resultado con pendientes',exact:true}).click();
      await page.getByRole('heading',{name:'Resultado de la preparación',exact:true}).waitFor({timeout});return visited;
    }
    const current=page.locator('.preparation-stages [data-state="review"]');
    assert.equal(await current.count(),1,await page.locator('#view').innerText());
    const id=await current.getAttribute('data-stage');visited.push(id);await measure(id);
    await page.getByRole('button',{name:'Aplicar este plan y continuar →',exact:true}).click();
  }
  throw Error('Preparation did not finish within its declared stage bound');
}
