import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';

const read=name=>readFile(new URL('../ui/'+name,import.meta.url),'utf8');
const luminance=rgb=>rgb.map(channel=>channel/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4)
  .reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
const contrast=(text,background)=>(luminance(text)+.05)/(luminance(background)+.05);

test('Inicio benefits retain defined scope and local glossary controls',async()=>{
  const home=await read('screens/home.mjs');
  assert.equal((home.match(/class:'home-benefit home-benefit-/g)??[]).length,3);
  assert.match(home,/Ahora, cuando trabajes con tu IA en software, podrás revisar los cambios que documente con ',term\('openspec'\)/);
  assert.match(home,/Empieza sin usar la terminal/);
  assert.match(home,/verás cuáles se descargarán antes de aprobar/);
  assert.match(home,/Retoma o deshaz una preparación/);
  assert.match(home,/La app comprueba tus ediciones antes/);
  assert.doesNotMatch(home,/Mayor precisión|Mayor eficiencia|RAG|home-example|Contexto.*a mano|Un método, no solo prompts|Más claridad/);
});

test('App text remains AA at every ambient phase, including translucent panels and glossary hover',async()=>{
  const [tokens,pages,components]=await Promise.all([read('tokens.css'),read('pages.css'),read('components.css')]);
  const values=new Map([...tokens.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(match=>[match[1],match[2]]));
  const resolved=source=>source.replace(/var\(--([\w-]+)\)/g,(match,name)=>values.get(name)??match);
  const token=name=>{
    const match=tokens.match(new RegExp('--'+name+': #(\\w{6})'));
    assert.ok(match,'Missing color token '+name);
    return [0,2,4].map(index=>parseInt(match[1].slice(index,index+2),16));
  };
  const rule=selector=>{
    const start=pages.indexOf('\n'+selector+' {')+1;
    assert.ok(start>0,'Missing gradient rule '+selector);
    return pages.slice(start,pages.indexOf('}',start)+1);
  };
  const upperBound=(base,source)=>{
    const layers=[...resolved(source).matchAll(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([.\d]+)\s*\)/g)];
    assert.equal(layers.length,2,'Both bounded decorative gradients must be measured');
    // CSS paints the first background layer on top. For each channel and each layer, take the brighter
    // endpoint of alpha in [0, max]. This bounds every gradient pixel, even if all maxima coincided and
    // the animated decoration had opacity 1; the gradients' actual maxima occupy different locations.
    return layers.reverse().reduce((background,layer)=>{
      const alpha=Number(layer[4]);
      return background.map((channel,index)=>Math.max(channel,channel*(1-alpha)+Number(layer[index+1])*alpha));
    },base);
  };
  assert.doesNotMatch(pages,/\.home-(?:overview|benefits)::before/,'Home cannot own a clipped backdrop');
  const staticBackground=upperBound(token('surface-root'),rule('body::before'));
  const movingBackground=upperBound(staticBackground,rule('body::after'));
  for(const background of [staticBackground,movingBackground]){
    for(const color of ['slate-400','slate-300','slate-50','violet-300','cyan-300']){
      const ratio=contrast(token(color),background);
      assert.ok(ratio>=4.5,color+' on the whole-window gradient: '+ratio);
    }
  }
  const overlay=resolved(rule('.home-benefits')).match(/background:\s*rgba\((\d+),(\d+),(\d+),([.\d]+)\)/);
  assert.ok(overlay,'The benefits panel must let the shared backdrop through');
  const alpha=Number(overlay[4]);
  const benefitBackground=movingBackground.map((channel,index)=>channel*(1-alpha)+Number(overlay[index+1])*alpha);
  // The ordinary glossary hover adds this tint; focus keeps the same text/background pairing.
  assert.match(resolved(components),/\.term:hover\s*\{[^}]*background:\s*rgba\(\s*99\s*,\s*102\s*,\s*241\s*,\s*0?\.15\s*\)/);
  const hovered=benefitBackground.map((channel,index)=>Math.max(channel,channel*.85+[99,102,241][index]*.15));
  for(const color of ['slate-300','slate-50','violet-200','violet-100'])
    assert.ok(contrast(token(color),hovered)>=4.5,color+' on the benefit gradient including hover');
});
