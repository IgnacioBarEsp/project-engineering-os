import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
test('motion is finite except for ambient opacity; illumination has a separate bounded token',async()=>{
  const read=name=>readFile(new URL('../ui/'+name,import.meta.url),'utf8');
  const tokens=await read('tokens.css');
  for(const [key,value] of [['fast',120],['base',200],['slow',280]])assert.match(tokens,new RegExp('--dur-'+key+': '+value+'ms'));
  assert.match(tokens,/--dur-ambient: 20000ms/);
  assert.match(tokens,/--dur-sheen: 900ms/);
  assert.match(tokens,/--ease-out: cubic-bezier\(0\.23, 1, 0\.32, 1\)/);
  let measured=0;
  for(const name of ['layout.css','pages.css','components.css']){
    let source=await read(name);
    if(name==='pages.css'){
      const ambient=source.match(/^body::after \{[^}]*\}/gm)??[];
      assert.equal(ambient.length,1,'Only the body opacity layer owns ambient motion');
      assert.match(ambient[0],/animation: app-ambient-flow var\(--dur-ambient\) linear infinite alternate;/);
      assert.match(source,/body::before, body::after \{ content: ''; position: fixed; inset: 0; pointer-events: none; z-index: -1; \}/);
      assert.match(source,/@keyframes app-ambient-flow \{ from \{ opacity: 0; \} to \{ opacity: 1; \} \}/);
      assert.doesNotMatch(ambient[0],/transform|filter|perspective|mask|background-position/);
      source=source.replace(ambient[0],'');
    }
    assert.doesNotMatch(source,/ease-in|animation:[^;}]*infinite|animation:[^;}]*forwards/);
    assert.doesNotMatch(source,/var\(--dur-ambient\)/,'The 20s token cannot leak into controls');
    for(const declaration of source.matchAll(/(?:animation|transition)(?:-duration)?:([^;}]+)/g)){
      measured++;
      assert.match(declaration[1],/var\(--dur-|none/);
    }
  }
  assert.ok(measured>=15);
  assert.match(await read('layout.css'),/button:disabled\{cursor:wait;opacity:1\}/);
  const nav=(await read('pages.css')).match(/\.nav-button \{([^}]+)\}/)?.[1];
  assert.ok(nav);assert.doesNotMatch(nav,/transition:\s*all/);
  assert.match(nav,/transition: color var\(--dur-base\)/);
});
