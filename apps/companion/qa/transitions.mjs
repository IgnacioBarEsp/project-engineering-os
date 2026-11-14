import assert from 'node:assert/strict';
import test from 'node:test';
import {createTransitions} from '../ui/lib/transition.mjs';

test('first render, unchanged destination, reduced and unavailable API commit synchronously',async()=>{
  for(const options of [{document:{}},{document:{startViewTransition(){throw Error('must not animate');}},reduced:()=>true}]){
    const go=createTransitions(options),seen=[];
    const first=go('a',()=>seen.push('a'));assert.deepEqual(seen,['a']);await first;
    await go('b',()=>seen.push('b'));await go('b',()=>seen.push('same'));
    assert.deepEqual(seen,['a','b','same']);
  }
});
test('native snapshot callback owns the mutation, and overlapping generations cannot overwrite it',async()=>{
  const pending=[],seen=[];
  const document={startViewTransition(update){
    let resolve;const done=new Promise(r=>resolve=r);
    const entry={skip:false,commit(){update();resolve();}};pending.push(entry);
    return {skipTransition(){entry.skip=true;},ready:Promise.resolve(),finished:done,updateCallbackDone:done};
  }};
  const go=createTransitions({document});await go('a',()=>seen.push('a'));
  const second=go('b',()=>seen.push('b'));assert.deepEqual(seen,['a']);
  const third=go('c',()=>seen.push('c'));assert.equal(pending[0].skip,true);
  pending[1].commit();pending[0].commit();await Promise.all([second,third]);
  assert.deepEqual(seen,['a','c']);
});
test('a rejected snapshot still commits, an unavailable transition falls back, update errors remain visible',async()=>{
  const seen=[],document={startViewTransition(update){
    const done=Promise.resolve().then(update);
    return {skipTransition(){},ready:Promise.reject(Error('snapshot')),finished:done,updateCallbackDone:done};
  }};
  const go=createTransitions({document});await go('a',()=>{});await go('b',()=>seen.push('b'));assert.deepEqual(seen,['b']);
  await assert.rejects(go('c',()=>{throw Error('update');}),/update/);
  document.startViewTransition=()=>{throw Error('unsupported');};
  await go('d',()=>seen.push('d'));assert.deepEqual(seen,['b','d']);
});
