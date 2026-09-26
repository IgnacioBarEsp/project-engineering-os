import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
test('motion declarations use finite shared tokens without idle pulse or persistent transform',async()=>{
  const read=name=>readFile(new URL('../ui/'+name,import.meta.url),'utf8');
  const tokens=await read('tokens.css');
  for(const [key,value] of [['fast',120],['base',200],['slow',280]])assert.match(tokens,new RegExp('--dur-'+key+': '+value+'ms'));
  assert.match(tokens,/--ease-out: cubic-bezier\(0\.23, 1, 0\.32, 1\)/);
  let measured=0;
  for(const name of ['layout.css','pages.css','components.css']){
    const source=await read(name);
    assert.doesNotMatch(source,/ease-in|animation:[^;}]*infinite|animation:[^;}]*forwards/);
    for(const declaration of source.matchAll(/(?:animation|transition)(?:-duration)?:([^;}]+)/g)){
      measured++;
      assert.match(declaration[1],/var\(--dur-|none/);
    }
  }
  assert.ok(measured>=15);
  assert.match(await read('layout.css'),/button:disabled\{cursor:wait;opacity:1\}/);
});
