import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';

const read=name=>readFile(new URL('../ui/'+name,import.meta.url),'utf8');
const luminance=rgb=>rgb.map(channel=>channel/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4)
  .reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
const contrast=(text,background)=>(luminance(text)+.05)/(luminance(background)+.05);

test('Approved minimal copy refinement removes the subtitle and accents the brand alone',async()=>{
  const [home,wizard]=await Promise.all([read('screens/home.mjs'),read('screens/wizard.mjs')]);
  assert.match(home,/el\('br'\),'con ',el\('span',\{class:'hero-gradient',text:'Project Engineering OS'\}\)/);
  assert.doesNotMatch(home,/hero-gradient',text:'con /);
  assert.doesNotMatch(wizard,/Nombre, carpeta y tipo de trabajo|Tus archivos pueden aportar/);
  assert.match(wizard,/text:'¿Qué vas a preparar\?'\}\),\s*form\]/);
  assert.match(wizard,/for:'wizard-name',text:'Nombre de tu proyecto'/);
  assert.match(wizard,/role:'group','aria-labelledby':'wizard-folder-label'/);
});

test('Finite illumination is limited to title entry and enabled primary hover/keyboard focus',async()=>{
  const [tokens,pages,layout]=await Promise.all([read('tokens.css'),read('pages.css'),read('layout.css')]);
  assert.match(tokens,/--dur-sheen: 900ms;/);
  assert.match(pages,/\.hero-gradient \{[^}]*animation: brand-illuminate var\(--dur-sheen\) linear;/);
  assert.match(pages,/button\.primary:not\(:disabled\):not\(\.danger\):is\(:hover,:focus-visible\)::after \{ animation: action-illuminate var\(--dur-sheen\) linear; \}/);
  assert.match(pages,/button\.primary::after \{[^}]*pointer-events: none;/);
  assert.match(pages,/button\.primary:disabled::after, button\.primary\.danger::after \{ content: none; animation: none; \}/);
  assert.match(pages,/@keyframes brand-illuminate \{ from \{ background-position: 150% 0,0 0; \} to \{ background-position: -50% 0,0 0; \} \}/);
  assert.equal((pages.match(/animation: (?:brand|action)-illuminate /g)??[]).length,2);
  assert.equal((pages.match(/var\(--dur-sheen\)/g)??[]).length,2,'The long decorative token cannot be reused on control states');
  assert.match(layout,/@media\(prefers-reduced-motion:reduce\)\{\*,\*::before,\*::after\{animation:none!important;transition:none!important/);
});

test('Maximum primary-button illumination keeps normal-text AA contrast in every state',async()=>{
  const [tokens,pages,layout]=await Promise.all([read('tokens.css'),read('pages.css'),read('layout.css')]);
  const color=name=>{
    const hex=tokens.match(new RegExp('--'+name+': #(\\w{6})'))?.[1];
    assert.ok(hex,'Missing color '+name);return [0,2,4].map(index=>parseInt(hex.slice(index,index+2),16));
  };
  const sheen=tokens.match(/--action-sheen: rgba\((\d+),(\d+),(\d+),([.\d]+)\)/);
  assert.ok(sheen);const alpha=Number(sheen[4]);
  assert.match(layout,/\.primary\{background:var\(--violet-600\);color:var\(--white\)/);
  assert.match(layout,/\.primary:hover\{background:var\(--violet-700\)/);
  assert.match(pages,/button\.primary::after \{[^}]*var\(--action-sheen\)/);
  for(const name of ['violet-600','violet-700']){
    const bright=color(name).map((channel,index)=>channel*(1-alpha)+Number(sheen[index+1])*alpha);
    assert.ok(contrast(color('pure-white'),bright)>=4.5,name+' at full sheen opacity');
  }
});
