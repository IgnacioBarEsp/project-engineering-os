import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {assertCoverage} from '../scripts/interface-contract.mjs';
const motions=['no-preference','reduce'],windows=['1180x820','1024x700','480x540'];
const routes=['start','help'],profiles=['research','personal'],choices=['quick','ai'];
const observedRoutes=new Set(routes.flatMap(route=>motions.flatMap(motion=>windows.map(window=>[route,motion,window].join('|')))));
const observedCells=new Set(profiles.flatMap(profile=>choices.flatMap(choice=>motions.flatMap(motion=>windows.map(window=>[profile,choice,motion,window].join('|'))))));
const full={routes,cells:true,profiles,choices,motions,windows,observedRoutes,observedCells};
test('coverage requires every route and profile/choice cell, not a fixed total',()=>{
  assert.deepEqual(assertCoverage(full),[]);
  assert.ok(assertCoverage({...full,observedRoutes:new Set()}).length>=12);
  assert.ok(assertCoverage({...full,observedCells:new Set()}).length>=24);
  const one=new Set(observedCells);one.delete('personal|ai|reduce|480x540');
  assert.deepEqual(assertCoverage({...full,observedCells:one}),['journey:personal|ai|reduce|480x540']);
  assert.ok(assertCoverage({...full,routes:[...routes,'new-route']}).every(issue=>issue.includes('new-route')));
});
test('removing a dimension or declaring only reduced motion cannot produce a vacuous PASS',()=>{
  assert.ok(assertCoverage({...full,motions:['reduce']}).includes('contract:motion:no-preference'));
  assert.ok(assertCoverage({...full,windows:[]}).length>=3);
  assert.ok(assertCoverage({...full,profiles:[]}).includes('contract:empty-journey-dimension'));
  assert.ok(assertCoverage({...full,routes:[],cells:false}).includes('contract:no-routes-or-journeys'));
});
test('Windows native evidence is a required CI dependency and is preserved even after failure',async()=>{
  const ci=await readFile(new URL('../../../.github/workflows/ci.yml',import.meta.url),'utf8');
  assert.match(ci,/needs: \[matrix, dependency-audit, companion, companion-electron\]/);
  assert.match(ci,/test "\$ELECTRON_RESULT" = "success"/);
  const job=ci.slice(ci.indexOf('\n  companion-electron:'),ci.indexOf('\n  required:'));
  for(const text of ['runs-on: windows-latest','npm ci --ignore-scripts','npm run runtime:install','npm run evidence:electron','always()','if-no-files-found: error','actions/upload-artifact@'])assert.ok(job.includes(text),text);
});
