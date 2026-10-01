import assert from 'node:assert/strict';
import {mkdir, mkdtemp, realpath, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {_electron} from 'playwright';
import {AMBIENT} from './ambient-contract.mjs';

const output=process.argv[2];
assert(output,'Indica un directorio de evidencia para las capturas del shell.');
await mkdir(output,{recursive:true});
const appRoot=fileURLToPath(new URL('../',import.meta.url));
const executable=path.join(appRoot,'node_modules','electron','dist',process.platform==='win32'?'electron.exe':'electron');
const temp=await realpath(await mkdtemp(path.join(os.tmpdir(),'peos-electron-shell-')));
const userData=path.join(temp,'userdata'),localAppData=path.join(temp,'localappdata');
await mkdir(localAppData,{recursive:true});
let application;
const failures=[];
try{
  application=await _electron.launch({executablePath:executable,args:['.',`--user-data-dir=${userData}`],
    cwd:appRoot,env:{...process.env,LOCALAPPDATA:localAppData},timeout:60000});
  const page=await application.firstWindow({timeout:60000});
  page.on('pageerror',error=>failures.push(error.message));
  page.on('console',message=>{if(message.type()==='error')failures.push(message.text());});
  page.on('request',request=>{if(!request.url().startsWith('peos://app/'))failures.push(`Unexpected request: ${request.url()}`);});
  page.on('requestfailed',request=>failures.push(`Failed request: ${request.url()} · ${request.failure()?.errorText}`));
  await page.getByRole('heading',{name:'Prepara tus proyectos con Project Engineering OS',exact:true}).waitFor({timeout:60000});
  await page.locator('.enter').evaluate(node=>Promise.all(node.getAnimations().map(animation=>animation.finished)));
  const shell=await page.evaluate(()=>{
    const brand=document.querySelector('.brand-icon svg'),content=document.getElementById('content');
    const header=document.querySelector('.app-header'),nav=[...document.querySelectorAll('#nav button')];
    const box=brand.getBBox();
    return {url:location.href,headerHeight:Math.round(header.getBoundingClientRect().height),
      mainScroll:getComputedStyle(content).overflowY,brandWidth:box.width,brandHeight:box.height,
      active:nav.filter(button=>button.getAttribute('aria-pressed')==='true').map(button=>button.dataset.action),
      breadcrumb:document.getElementById('breadcrumb').textContent};
  });
  assert.equal(shell.url,'peos://app/index.html#/start');
  assert.equal(shell.headerHeight,56);
  assert.equal(shell.mainScroll,'auto');
  await page.screenshot({path:path.join(output,'home-electron.png')});
  assert.ok(shell.brandWidth>0&&shell.brandHeight>0,
    `The local Lucide sprite must visibly render in peos://; shell=${JSON.stringify(shell)}; failures=${JSON.stringify(failures)}`);
  assert.deepEqual(shell.active,['open-start']);
  assert.equal(shell.breadcrumb,'INICIO');
  const homeSizes=[];
  for(const motion of ['no-preference','reduce']){
  await page.emulateMedia({reducedMotion:motion});
  for(const size of [[1180,820],[1024,700],[768,700],[480,540]]){
    await application.evaluate(({BrowserWindow},dimensions)=>BrowserWindow.getAllWindows()[0].setSize(...dimensions),size);
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const layout=await page.evaluate(()=>{
      const content=document.getElementById('content'),button=document.querySelector('.home-actions .primary');
      const action=button.getBoundingClientRect(),copy=document.querySelector('.home-copy').getBoundingClientRect();
      const benefits=document.querySelector('.home-benefits').getBoundingClientRect();
      const previousScroll=content.scrollTop;
      content.scrollTop=content.scrollHeight;
      const bottom=content.getBoundingClientRect().bottom;
      let last=content.getBoundingClientRect().top;
      for(const node of content.querySelectorAll('*')){
        if(!node.getClientRects().length||node.closest('[hidden]')||getComputedStyle(node).visibility==='hidden')continue;
        const style=getComputedStyle(node),hasText=[...node.childNodes].some(child=>child.nodeType===Node.TEXT_NODE&&child.textContent.trim());
        const paintedBorder=parseFloat(style.borderBottomWidth)>0&&style.borderBottomStyle!=='none'&&style.borderBottomColor!=='rgba(0, 0, 0, 0)';
        if(hasText||paintedBorder||node.matches('button,input,select,textarea,summary'))last=Math.max(last,node.getBoundingClientRect().bottom);
      }
      const scrollMax=Math.max(0,content.scrollHeight-content.clientHeight);
      const blankAfterContent=scrollMax>0?bottom-last-Math.min(32,parseFloat(getComputedStyle(content).paddingBottom)||0):0;
      content.scrollTop=previousScroll;
      return {width:innerWidth,height:innerHeight,horizontalOverflow:content.scrollWidth-content.clientWidth,
        primaryVisible:action.top>=0&&action.bottom<=innerHeight,scrollMax,blankAfterContent,
        benefitsAfterActions:benefits.top>=action.bottom,sideBySide:benefits.left>=copy.right,
        visibleBenefitIcons:[...document.querySelectorAll('.home-benefit-icon')].filter(svg=>svg.getBBox().width>0&&svg.getBBox().height>0).length};
    });
    assert.ok(layout.horizontalOverflow<=1,'Home must reflow without horizontal scrolling');
    assert.ok(layout.primaryVisible,'The primary start action stays visible before the benefits');
    assert.ok(layout.blankAfterContent<=24,'Decorative backgrounds do not add dead scroll after the last content: '+JSON.stringify(layout));
    if(size[0]<=768)assert.ok(layout.benefitsAfterActions,'Compact Home puts the benefits after the start actions');
    else assert.ok(layout.sideBySide,'Wide Home puts the benefits beside the introduction');
    const ambient=await page.evaluate(AMBIENT);
    assert.deepEqual(ambient.problems,[],'The shared background covers the entire native viewport');
    assert.equal(layout.visibleBenefitIcons,3,'All three local decorative icons visibly render in peos://');
    const suffix=motion==='reduce'?'-reduced':'';
    await page.screenshot({path:path.join(output,`home-electron-${size[0]}${suffix}.png`)});
    if(size[0]===480){
      await page.locator('.home-benefits').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(output,`home-electron-480-benefits${suffix}.png`)});
      await page.evaluate(()=>{document.getElementById('content').scrollTop=0;});
    }
    homeSizes.push({motion,outer:{width:size[0],height:size[1]},...layout,ambient});
  }
  }
  await application.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(1180,820));
  const routes=[];
  for(const motion of ['no-preference','reduce']){
    await page.emulateMedia({reducedMotion:motion});
    await page.evaluate(()=>{
      window.__ambient=document.getAnimations().find(animation=>animation.animationName==='app-ambient-flow');
    });
    for(const [button,heading,file] of [
      ['Inicio','Prepara tus proyectos con Project Engineering OS','home'],
      ['Preparar proyecto','¿Qué vas a preparar?','step1'],
      ['Tus proyectos','Tus proyectos','projects'],['Ayuda','Ayuda','help'],
    ]){
      await page.locator('#nav').getByRole('button',{name:button,exact:true}).click();
      await page.getByRole('heading',{name:heading,exact:true}).waitFor();
      await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
      await page.locator('.enter').evaluate(node=>Promise.all(node.getAnimations().map(animation=>animation.finished)));
      const ambient=await page.evaluate(AMBIENT);
      assert.deepEqual(ambient.problems,[]);
      const continuity=await page.evaluate(()=>{
        const animation=document.getAnimations().find(item=>item.animationName==='app-ambient-flow');
        return {same:animation===window.__ambient,currentTime:animation?.currentTime??null};
      });
      assert.equal(continuity.same,true,'Navigation must retain the same background animation, not restart it');
      await page.screenshot({path:path.join(output,`${file}-electron${motion==='reduce'?'-reduced':''}.png`)});
      routes.push({motion,file,ambient,continuity});
    }
    await page.getByRole('button',{name:'Privacidad y alcance',exact:true}).click();
    await page.getByRole('heading',{name:'Tu carpeta, bajo tu control',exact:true}).waitFor();
    const privacy=await page.evaluate(AMBIENT);assert.deepEqual(privacy.problems,[]);
    await page.screenshot({path:path.join(output,`privacy-electron${motion==='reduce'?'-reduced':''}.png`)});
    routes.push({motion,file:'privacy',ambient:privacy});
    await page.getByRole('button',{name:'Cerrar',exact:true}).click();
    await page.getByText('¿Cómo funciona?',{exact:true}).click();
    const faq=await page.evaluate(AMBIENT);assert.deepEqual(faq.problems,[]);
    await page.screenshot({path:path.join(output,`help-faq-electron${motion==='reduce'?'-reduced':''}.png`)});
    routes.push({motion,file:'faq',ambient:faq});
  }
  // Deterministically sample the real CSS animation at both endpoints (test-only pause), without
  // waiting 20 seconds or generating mock screenshots. Route/resize probes above used live motion.
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.getByRole('button',{name:'Inicio',exact:true}).click();
  await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
  await page.locator('.enter').evaluate(node=>Promise.all(node.getAnimations().map(animation=>animation.finished)));
  const titleIllumination=await page.evaluate(()=>{
    const node=document.querySelector('.home-copy .hero-gradient');
    const animation=node.getAnimations().find(item=>item.animationName==='brand-illuminate');
    if(!animation)return null;
    animation.pause();const positions=[];
    for(const time of [100,450,800]){animation.currentTime=time;positions.push({time,position:getComputedStyle(node).backgroundPosition});}
    animation.currentTime=450;
    return {name:animation.animationName,duration:animation.effect.getTiming().duration,
      iterations:animation.effect.getTiming().iterations,positions,
      precedingWord:node.previousSibling.textContent,onlyBrand:node.textContent};
  });
  assert.ok(titleIllumination,'The actual title illumination exists during entry');
  assert.equal(titleIllumination.duration,900);assert.equal(titleIllumination.iterations,1);
  assert.equal(titleIllumination.precedingWord,'con ');assert.equal(titleIllumination.onlyBrand,'Project Engineering OS');
  assert.equal(new Set(titleIllumination.positions.map(frame=>frame.position)).size,3);
  await page.screenshot({path:path.join(output,'home-illumination-electron.png')});
  await page.evaluate(()=>document.querySelector('.hero-gradient').getAnimations().find(item=>item.animationName==='brand-illuminate').finish());
  const illumination=[];
  const inspectAction=async(button,where,mode)=>{
    const result=await button.evaluate((node,mode)=>{
      const style=getComputedStyle(node,'::after'),box=node.getBoundingClientRect();
      const hit=document.elementFromPoint(box.left+box.width/2,box.top+box.height/2);
      return {mode,name:style.animationName,duration:style.animationDuration,iterations:style.animationIterationCount,
        pointer:style.pointerEvents,content:style.content,opacity:style.opacity,hover:node.matches(':hover'),
        focusVisible:node.matches(':focus-visible'),disabled:node.disabled,reachable:hit===node||node.contains(hit),
        box:{width:box.width,height:box.height},outline:getComputedStyle(node).outlineWidth};
    },mode);
    illumination.push({where,...result});return result;
  };
  for(const [destination,where] of [['Inicio','home'],['Preparar proyecto','step1']]){
    await page.locator('#nav').getByRole('button',{name:destination,exact:true}).click();
    await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
    const primary=page.locator('#view button.primary').first();
    await page.mouse.move(0,0);await page.locator('#view h1').focus();
    const rest=await inspectAction(primary,where,'rest');assert.equal(rest.name,'none');
    await primary.hover();
    const hover=await inspectAction(primary,where,'hover');
    assert.equal(hover.name,'action-illuminate');assert.equal(hover.duration,'0.9s');assert.equal(hover.iterations,'1');
    assert.equal(hover.pointer,'none');assert.equal(hover.reachable,true);assert.deepEqual(hover.box,rest.box);
    const frames=await primary.evaluate(async node=>{
      await new Promise(resolve=>requestAnimationFrame(resolve));
      const animation=node.getAnimations({subtree:true}).find(item=>item.animationName==='action-illuminate');
      if(!animation)throw Error('Missing real action illumination: '+JSON.stringify({label:node.textContent,
        style:getComputedStyle(node,'::after').animationName,animations:document.getAnimations().map(item=>({name:item.animationName,target:item.effect.target?.tagName,pseudo:item.effect.pseudoElement}))}));
      animation.pause();const samples=[];
      for(const time of [100,450,800]){animation.currentTime=time;const style=getComputedStyle(node,'::after');samples.push({time,transform:style.transform,opacity:style.opacity});}
      animation.currentTime=450;return samples;
    });
    assert.equal(new Set(frames.map(frame=>frame.transform)).size,3);
    assert.equal(Number(frames[1].opacity),1);
    illumination.push({where,mode:'controlled-animation-frames',frames});
    await page.screenshot({path:path.join(output,`${where}-action-illumination-electron.png`)});
    await primary.evaluate(node=>node.getAnimations({subtree:true}).find(item=>item.animationName==='action-illuminate').finish());
    assert.equal(Number((await inspectAction(primary,where,'finished')).opacity),0,'A completed pass leaves no persistent shine');
    await page.mouse.move(0,0);await primary.blur();
    // Real keyboard focus, not an attribute pretending that the focus-visible selector matched.
    await primary.focus();await page.keyboard.press('Shift+Tab');await page.keyboard.press('Tab');
    const keyboard=await inspectAction(primary,where,'keyboard');
    assert.equal(keyboard.focusVisible,true);assert.equal(keyboard.name,'action-illuminate');assert.equal(keyboard.reachable,true);
    assert.ok(parseFloat(keyboard.outline)>=2,'Keyboard focus retains its visible outline');assert.deepEqual(keyboard.box,rest.box);
    await primary.evaluate(node=>{node.disabled=true;});
    const disabled=await inspectAction(primary,where,'disabled');assert.equal(disabled.name,'none');assert.equal(disabled.content,'none');
    await primary.evaluate(node=>{node.disabled=false;});
    await page.emulateMedia({reducedMotion:'reduce'});await primary.hover();
    const reduced=await inspectAction(primary,where,'reduced');assert.equal(reduced.name,'none');assert.equal(reduced.duration,'0s');
    assert.deepEqual((await page.evaluate(AMBIENT)).problems,[]);
    await page.emulateMedia({reducedMotion:'no-preference'});await page.mouse.move(0,0);await primary.blur();
  }
  await page.locator('#nav').getByRole('button',{name:'Inicio',exact:true}).click();
  await page.waitForFunction(()=>document.getElementById('content').getAttribute('aria-busy')==='false');
  const endpoints=[];
  for(const time of [0,20000]){
    const sample=await page.evaluate(time=>{
      const animation=document.getAnimations().find(item=>item.animationName==='app-ambient-flow');
      animation.pause();animation.currentTime=time;
      return {time,opacity:Number(getComputedStyle(document.body,'::after').opacity),
        keyframes:animation.effect.getKeyframes().map(frame=>({offset:frame.offset,opacity:frame.opacity})),
        controls:[...document.querySelectorAll('#nav button,#topbar-actions button,.home-actions button')].map(node=>{
          const box=node.getBoundingClientRect(),hit=document.elementFromPoint(box.left+box.width/2,box.top+box.height/2);
          return {label:node.textContent,reachable:hit===node||node.contains(hit)};
        })};
    },time);
    assert.equal(sample.opacity,time===0?0:1);
    assert.deepEqual(sample.keyframes,[{offset:0,opacity:'0'},{offset:1,opacity:'1'}]);
    assert.equal(sample.controls.length,7);
    assert.ok(sample.controls.every(control=>control.reachable),'Both ambient endpoints keep header/privacy/start actions reachable: '+JSON.stringify(sample.controls));
    await page.screenshot({path:path.join(output,`ambient-phase-${time}.png`)});
    endpoints.push(sample);
  }
  await page.evaluate(()=>document.getAnimations().find(item=>item.animationName==='app-ambient-flow').play());
  // Deliberate breakages must be detected by the same probe used for every shipping screen.
  const mutations=[];
  for(const css of ['body::after {pointer-events:auto!important}',
    'body::before {inset:56px 24px 0!important}',
    '.app-header {background:#000!important}',
    '.home-benefits {animation:app-ambient-flow 20s linear infinite!important}',
    '.home-benefits {animation:brand-illuminate .9s linear!important}',
    'button.primary::after {animation:action-illuminate .9s linear infinite!important}']){
    await page.evaluate(css=>{
      // CSSOM mutation of the existing local sheet keeps the shipping CSP intact: no inline style tag.
      const sheet=document.styleSheets[0];window.__ambientRule=sheet.insertRule(css,sheet.cssRules.length);
    },css);
    const mutation=await page.evaluate(AMBIENT);
    assert.ok(mutation.problems.length>0,'Ambient probe must reject '+css);
    mutations.push({css,problems:mutation.problems});
    await page.evaluate(()=>{document.styleSheets[0].deleteRule(window.__ambientRule);delete window.__ambientRule;});
  }
  assert.deepEqual((await page.evaluate(AMBIENT)).problems,[]);
  await page.getByRole('button',{name:'Ayuda',exact:true}).click();
  await page.getByRole('heading',{name:'Ayuda',exact:true}).waitFor();
  await page.locator('.enter').evaluate(node=>Promise.all(node.getAnimations().map(animation=>animation.finished)));
  await page.screenshot({path:path.join(output,'help-electron.png')});
  const help=await page.evaluate(()=>({heading:document.querySelector('#view h1')?.textContent,
    breadcrumb:document.getElementById('breadcrumb').textContent,
    active:[...document.querySelectorAll('#nav button[aria-pressed="true"]')].map(button=>button.dataset.action),
    glossaryTerms:document.querySelectorAll('#glosario dt').length}));
  assert.deepEqual(help.active,['open-help']);
  assert.equal(help.breadcrumb,'AYUDA');
  assert.deepEqual(failures,[],'The local Electron renderer must load all assets without CSP or network errors');
  const report={date:new Date().toISOString(),source:'local worktree Electron 44 with isolated userData and LOCALAPPDATA',
    boundaries:['no installer or native picker tested','no user project files touched','normal window shutdown not tested'],
    shell,homeSizes,routes,titleIllumination,illumination,endpoints,mutations,help,failures};
  await writeFile(path.join(output,'electron-shell.json'),JSON.stringify(report,null,2)+'\n');
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}finally{
  // This probe checks shell rendering, not the asynchronous draft-saving close guard. Exit only the
  // isolated Electron process that this script launched; otherwise Playwright's app.quit waits on it.
  await application?.evaluate(({app})=>{setImmediate(()=>app.exit(0));return true;}).catch(()=>{});
  await application?.close().catch(()=>{});
  assert(path.dirname(temp)===await realpath(os.tmpdir())&&path.basename(temp).startsWith('peos-electron-shell-'));
  await rm(temp,{recursive:true,force:true});
}
