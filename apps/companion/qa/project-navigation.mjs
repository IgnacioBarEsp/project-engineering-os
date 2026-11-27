import test from 'node:test';
import assert from 'node:assert/strict';
import {deferredList,sortedProjects} from '../ui/lib/deferred-list.mjs';
import {PROJECT_TABS,projectHash,parseProjectHash} from '../ui/lib/project-route.mjs';

function clock(){let now=0,id=0;const timers=new Map();return {
  schedule(fn,ms){const key=++id;timers.set(key,{at:now+ms,fn});return key;},cancel(key){timers.delete(key);},
  tick(ms){now+=ms;for(const [key,timer]of [...timers])if(timer.at<=now){timers.delete(key);timer.fn();}},
  get pending(){return timers.size;}};}
test('loading is silent before 300 ms, visible afterwards and always cleaned on completion',async()=>{
  const fast=clock();let shown=0;
  assert.deepEqual(await deferredList(async()=>[1],()=>shown++,fast),[1]);fast.tick(10000);assert.equal(shown,0);assert.equal(fast.pending,0);
  const slow=clock();let resolve;const reading=new Promise(done=>resolve=done);
  const result=deferredList(()=>reading,()=>shown++,slow);
  slow.tick(299);assert.equal(shown,0);slow.tick(1);assert.equal(shown,1);
  resolve([2]);assert.deepEqual(await result,[2]);assert.equal(slow.pending,0);
});
test('loading times out at ten seconds and late results cannot turn it into success',async()=>{
  const timer=clock();let resolve,shown=0;
  const result=deferredList(()=>new Promise(done=>resolve=done),()=>shown++,timer);
  await Promise.resolve();timer.tick(10000);
  await assert.rejects(result,error=>error.code==='LIST_TIMEOUT');assert.equal(shown,1);assert.equal(timer.pending,0);
  resolve(['late']);await Promise.resolve();
});
test('project list sorting does not mutate data or turn missing dates into recent checks',()=>{
  const rows=[{id:'a',checkedAt:null},{id:'b',checkedAt:'2026-09-26'},{id:'c',checkedAt:'2026-08-01'},{id:'d',checkedAt:'invalid'}];
  assert.deepEqual(sortedProjects(rows).map(row=>row.id),['b','c','a','d']);assert.deepEqual(rows.map(row=>row.id),['a','b','c','d']);
});
test('internal URLs are closed, encode only opaque identity and reject malformed values',()=>{
  for(const tab of Object.keys(PROJECT_TABS))assert.deepEqual(parseProjectHash(projectHash('opaque id',tab)),{id:'opaque id',tab});
  for(const value of ['#/project/a/unknown','#/project/%/overview','#/project/a/search/extra','https://example.com'])assert.equal(parseProjectHash(value),null);
  assert.throws(()=>projectHash('a','unknown'));
});
