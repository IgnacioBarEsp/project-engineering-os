import assert from 'node:assert/strict';
import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {ASSETS, ICON_FRAGMENTS, localAsset} from '../desktop/assets.mjs';

const root=fileURLToPath(new URL('../ui/',import.meta.url));
async function files(dir=root){
  const found=[];
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const target=path.join(dir,entry.name);
    if(entry.isDirectory())found.push(...await files(target));
    else if(entry.isFile())found.push('/'+path.relative(root,target).replaceAll(path.sep,'/'));
  }
  return found;
}

test('peos:// serves exactly the renderer assets, including nested modules and local SVG',async()=>{
  const actual=(await files()).sort(),declared=[...ASSETS.keys()].sort();
  assert.deepEqual(declared,actual);
  assert.equal(new Set(declared).size,declared.length);
  for(const file of declared){
    assert.match(file,/^\/(?:[a-z-]+\/)*[a-z-]+\.(?:html|css|mjs|svg)$/);
    assert.match(ASSETS.get(file),/^(?:text\/(?:html|css|javascript)|image\/svg\+xml)(?:; charset=utf-8)?$/);
  }
  assert.equal(localAsset('peos://app/icons.svg#icon-terminal')?.pathname,'/icons.svg');
  const sprite=await readFile(path.join(root,'icons.svg'),'utf8');
  const symbols=[...sprite.matchAll(/<symbol id="(icon-[a-z-]+)"/g)].map(match=>`#${match[1]}`).sort();
  assert.deepEqual([...ICON_FRAGMENTS].sort(),symbols);
  for(const url of ['peos://app/icons.svg#unknown','peos://app/app.mjs#unexpected',
    'peos://app/icons.svg?remote=1','peos://other/icons.svg','https://app/icons.svg','peos://app/../private.txt'])
    assert.equal(localAsset(url),null,url);
  assert.equal(localAsset('peos://app/icons.svg#icon-folder','POST'),null);
});

test('renderer remains modular, local and style-injection free',async()=>{
  const assets=await Promise.all([...ASSETS.keys()].map(async file=>[file,await readFile(path.join(root,file.slice(1)),'utf8')]));
  for(const [file,source] of assets){
    assert.ok(source.split(/\r?\n/).length<400,`${file} exceeds 399 lines`);
    assert.doesNotMatch(source,/[\u{1F300}-\u{1FAFF}]/u,`${file} contains an emoji`);
    if(file.endsWith('.mjs')){
      assert.doesNotMatch(source,/\.innerHTML\s*=|insertAdjacentHTML\s*\(/,`${file} injects markup`);
      assert.doesNotMatch(source,/\bstyle\s*:/,`${file} constructs inline style`);
    }
    if(file.endsWith('.css')&&file!=='/tokens.css')assert.doesNotMatch(source,/#[\da-f]{3,8}\b/i,`${file} contains a literal color`);
    if(file.endsWith('.svg'))assert.doesNotMatch(source,/#[\da-f]{3,8}\b/i,`${file} contains a literal color`);
  }
  assert.match(assets.find(([name])=>name==='/app.css')[1],/@layer tokens, layout, components, pages/);
});
