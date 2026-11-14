// Runs inside the actual renderer via page.evaluate. Only this exact body pseudo-element may repeat;
// Only exact finite title/button illumination may exceed 300ms; other long/repeating animations fail.
export const AMBIENT=()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,problems=[];
  const before=getComputedStyle(document.body,'::before'),after=getComputedStyle(document.body,'::after');
  const layers=[];
  for(const [name,style] of [['before',before],['after',after]]){
    const layer={name,position:style.position,inset:[style.top,style.right,style.bottom,style.left],
      width:parseFloat(style.width),height:parseFloat(style.height),pointer:style.pointerEvents,
      gradients:(style.backgroundImage.match(/radial-gradient/g)??[]).length,
      animation:style.animationName,duration:style.animationDuration,iterations:style.animationIterationCount};
    layers.push(layer);
    if(style.content!=='""'||style.position!=='fixed'||layer.inset.some(value=>value!=='0px')
      ||Math.abs(layer.width-innerWidth)>1||Math.abs(layer.height-innerHeight)>1)problems.push(name+': backdrop must cover the client viewport');
    if(style.pointerEvents!=='none'||style.zIndex!=='-1'||style.maskImage!=='none'
      ||parseFloat(style.borderRadius)!==0||layer.gradients!==2)problems.push(name+': clipped or interactive backdrop');
    if(style.transform!=='none'||style.filter!=='none')problems.push(name+': transformed or filtered backdrop');
  }
  if(before.animationName!=='none')problems.push('Static backdrop must not animate');
  if(reduced){
    if(after.animationName!=='none'||after.animationDuration!=='0s')problems.push('Ambient motion survives reduced motion');
  }else if(after.animationName!=='app-ambient-flow'||after.animationDuration!=='20s'
    ||after.animationTimingFunction!=='linear'||after.animationIterationCount!=='infinite'
    ||after.animationDirection!=='alternate')problems.push('Ambient motion differs from the single slow opacity cycle');
  for(const node of [document.documentElement,document.body,document.querySelector('.shell')]){
    const style=getComputedStyle(node);
    if(style.transform!=='none'||style.filter!=='none'||style.perspective!=='none')problems.push('Backdrop has a transformed layout ancestor');
  }
  if(getComputedStyle(document.body).isolation!=='isolate')problems.push('Backdrop lacks its isolated paint context');
  for(const selector of ['.shell','.app-header.sidebar','main#content']){
    if(getComputedStyle(document.querySelector(selector)).backgroundColor!=='rgba(0, 0, 0, 0)')problems.push(selector+': opaque surface hides the shared backdrop');
  }
  let measured=0;const illumination=[];
  for(const node of document.querySelectorAll('*'))for(const pseudo of [null,'::before','::after']){
    const style=getComputedStyle(node,pseudo),allowed=node===document.body&&pseudo==='::after'&&!reduced
      &&style.animationName==='app-ambient-flow'&&style.animationDuration==='20s';
    const title=pseudo===null&&node.matches('.hero-gradient')&&style.animationName==='brand-illuminate';
    const action=pseudo==='::after'&&node.matches('button.primary:not(:disabled):not(.danger)')
      &&style.animationName==='action-illuminate'&&style.pointerEvents==='none';
    const sheen=!reduced&&(title||action)&&style.animationDuration==='0.9s'
      &&style.animationIterationCount==='1'&&style.animationTimingFunction==='linear';
    if(sheen)illumination.push({tag:node.tagName,pseudo,name:style.animationName,duration:style.animationDuration});
    measured++;
    for(const key of ['animationDuration','transitionDuration']){
      const durations=style[key].split(',').map(value=>parseFloat(value)*1000);
      if(durations.some(value=>value>300)&&!((allowed||sheen)&&key==='animationDuration'))problems.push(node.tagName+pseudo+': '+key+' above 300ms');
      if(reduced&&durations.some(value=>value>0))problems.push(node.tagName+pseudo+': motion in reduced mode');
    }
    if(style.animationName!=='none'&&style.animationIterationCount.split(',').some(value=>Number(value)>1||value.trim()==='infinite')&&!allowed)
      problems.push(node.tagName+pseudo+': another repeating animation');
    if(style.animationTimingFunction.includes('ease-in')||style.transitionTimingFunction.includes('ease-in'))problems.push(node.tagName+pseudo+': ease-in');
  }
  return {reduced,measured,layers,illumination,problems};
};
