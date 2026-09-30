// Shared by real journeys, renderer-only fixtures and deliberate negative controls.
export const QUALITY = expected => {
  const issues=[],main=document.getElementById('content'),view=document.getElementById('view');
  const visible=node=>node.getClientRects().length&&getComputedStyle(node).visibility!=='hidden'
    &&!node.closest('[hidden]')&&(!node.closest('details:not([open])')||node.closest('summary'));
  const controls=[...document.querySelectorAll('button,a[href],input,select,textarea,summary')].filter(visible);
  const nodes=[...document.querySelectorAll('*')];let motionMeasured=0,positioned=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let styleDeclarations=0;
  const inspectStyle=(style,allowLiterals=false)=>{
    for(const property of style){styleDeclarations++;
      if(!allowLiterals&&/#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i.test(style.getPropertyValue(property)))issues.push('color-outside-tokens:'+property);
    }
  };
  const inspectRules=(rules,allowLiterals=false)=>{for(const rule of rules){
    if(rule.style)inspectStyle(rule.style,allowLiterals);
    if(rule.styleSheet)inspectRules(rule.styleSheet.cssRules,rule.styleSheet.href?.endsWith('/tokens.css'));
    else if(rule.cssRules)inspectRules(rule.cssRules,allowLiterals);
  }};
  for(const sheet of document.styleSheets)inspectRules(sheet.cssRules,sheet.href?.endsWith('/tokens.css'));
  for(const node of nodes)if(node.style)inspectStyle(node.style);
  if(!styleDeclarations)issues.push('no-style-declarations');
  for(const node of nodes){
    const style=getComputedStyle(node);
    if(['fixed','sticky'].includes(style.position)){
      positioned++;
      for(let parent=node.parentElement;parent;parent=parent.parentElement){
        const ancestor=getComputedStyle(parent);
        if(ancestor.transform!=='none'||ancestor.filter!=='none'||ancestor.perspective!=='none'){
          issues.push('unsafe-containing-block:'+node.tagName+'.'+node.className);break;
        }
      }
    }
    for(const pseudo of [null,'::before','::after']){
      const s=pseudo?getComputedStyle(node,pseudo):style;motionMeasured++;
      const ambient=!reduced&&node===document.body&&pseudo==='::after'
        &&s.animationName==='app-ambient-flow'&&s.animationDuration==='20s'
        &&s.animationIterationCount==='infinite'&&s.animationDirection==='alternate'
        &&s.animationTimingFunction==='linear'&&s.pointerEvents==='none';
      const sheen=!reduced&&s.animationDuration==='0.9s'&&s.animationIterationCount==='1'
        &&s.animationTimingFunction==='linear'&&((pseudo===null&&node.matches('.hero-gradient')&&s.animationName==='brand-illuminate')
        ||(pseudo==='::after'&&node.matches('button.primary:not(:disabled):not(.danger)')&&s.animationName==='action-illuminate'&&s.pointerEvents==='none'));
      const durations=[s.animationDuration,s.transitionDuration].flatMap(value=>value.split(',').map(item=>parseFloat(item)*1000));
      if(s.transitionDuration.split(',').some(item=>parseFloat(item)*1000>300)
        ||(!ambient&&!sheen&&s.animationDuration.split(',').some(item=>parseFloat(item)*1000>300)))issues.push('motion-duration:'+node.tagName);
      if(!ambient&&s.animationName!=='none'&&s.animationIterationCount.split(',').some(item=>Number(item)>1||item.trim()==='infinite'))issues.push('motion-repeat:'+node.tagName);
      if(reduced&&durations.some(ms=>ms>0))issues.push('reduced-motion:'+node.tagName);
      if(durations.some(ms=>ms>0)&&[s.animationTimingFunction,s.transitionTimingFunction].some(value=>value.includes('ease-in')))issues.push('motion-ease-in:'+node.tagName);
    }
  }
  if(!controls.length)issues.push('no-controls');
  if(!motionMeasured)issues.push('no-motion-measurements');
  if(!positioned)issues.push('no-positioned-measurements');
  const nav=[...document.querySelectorAll('#nav [aria-pressed="true"]')].map(node=>node.dataset.action);
  if(nav.length!==1||nav[0]!==expected.nav)issues.push('route-nav');
  if(document.getElementById('breadcrumb').textContent!==expected.breadcrumb)issues.push('route-breadcrumb');
  const steps=[...view.querySelectorAll('.steps li')],current=steps.filter(node=>node.getAttribute('aria-current')==='step');
  if(expected.step!==null&&(current.length!==1||steps.indexOf(current[0])!==expected.step))issues.push('route-rail');
  if(expected.focuses){
    const focuses=[...view.querySelectorAll('input[name="focus"]')].map(node=>node.value);
    if(JSON.stringify(focuses)!==JSON.stringify(expected.focuses))issues.push('foreign-profile-focus');
  }
  for(const node of view.querySelectorAll('span.primary,div.primary,span.secondary,div.secondary,span.prompt-chip,div.prompt-chip')){
    if(visible(node))issues.push('decorative-control');
  }
  const before=main.scrollTop;main.scrollTop=main.scrollHeight;
  const rect=main.getBoundingClientRect(),endControls=controls.filter(node=>{
    const box=node.getBoundingClientRect(),center=(box.top+box.bottom)/2;
    return main.contains(node)&&center>=rect.top&&center<=rect.bottom&&box.width>0;
  });
  for(const node of endControls){
    const box=node.getBoundingClientRect(),hit=document.elementFromPoint((box.left+box.right)/2,(box.top+box.bottom)/2);
    if(hit!==node&&!node.contains(hit))issues.push('end-occlusion:'+node.tagName+'.'+node.className);
  }
  let last=rect.top;
  for(const node of main.querySelectorAll('*')){
    if(!visible(node)||!node.textContent.trim()&&!node.matches('input,select,textarea'))continue;
    const style=getComputedStyle(node);
    const text=[...node.childNodes].some(child=>child.nodeType===Node.TEXT_NODE&&child.textContent.trim());
    const paintedBorder=parseFloat(style.borderBottomWidth)>0&&style.borderBottomStyle!=='none'&&style.borderBottomColor!=='rgba(0, 0, 0, 0)';
    // Text and painted borders are content; empty layout wrappers/spacers are not.
    if(!text&&!paintedBorder&&!node.matches('button,input,select,textarea,summary'))continue;
    // Inner scrollboxes do not extend their content into the outer scroll range.
    let bottom=node.getBoundingClientRect().bottom;
    for(let parent=node.parentElement;parent&&parent!==main;parent=parent.parentElement){
      if(['auto','scroll','hidden'].includes(getComputedStyle(parent).overflowY))bottom=Math.min(bottom,parent.getBoundingClientRect().bottom);
    }
    last=Math.max(last,bottom);
  }
  const max=Math.max(0,main.scrollHeight-main.clientHeight),padding=Math.min(32,parseFloat(getComputedStyle(main).paddingBottom)||0);
  const blank=max>0?rect.bottom-last-padding:0;
  if(Math.abs(main.scrollTop-max)>1)issues.push('unreachable-scroll-end');
  if(blank>24)issues.push('dead-scroll:'+Math.round(blank));
  main.scrollTop=before;
  return {controls:controls.length,motionMeasured,styleDeclarations,positioned,endControls:endControls.length,scroll:{max,blank},issues:[...new Set(issues)]};
};
export function assertCoverage({routes,cells,profiles,choices,motions,windows,observedRoutes,observedCells}){
  const missing=[];
  for(const mode of ['no-preference','reduce'])if(!motions.includes(mode))missing.push('contract:motion:'+mode);
  for(const size of ['1180x820','1024x700','480x540'])if(!windows.includes(size))missing.push('contract:window:'+size);
  if(!routes.length&&!cells)missing.push('contract:no-routes-or-journeys');
  if(cells&&(!profiles.length||!choices.length))missing.push('contract:empty-journey-dimension');
  for(const motion of motions)for(const window of windows){
    for(const route of routes)if(!observedRoutes.has([route,motion,window].join('|')))missing.push('route:'+ [route,motion,window].join('|'));
    if(cells)for(const profile of profiles)for(const choice of choices)
      if(!observedCells.has([profile,choice,motion,window].join('|')))missing.push('journey:'+ [profile,choice,motion,window].join('|'));
  }
  return missing;
}
