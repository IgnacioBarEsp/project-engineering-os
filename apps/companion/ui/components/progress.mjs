import {el} from '../lib/dom.mjs';
// Service events are the only source of counts. Timers reveal waiting, never invent completion.
export function createProgress(node,{schedule=(fn,ms)=>setTimeout(fn,ms),cancel=id=>clearTimeout(id)}={}){
  const label=node.querySelector('#activity-text'),stop=node.querySelector('#cancel');
  node.querySelector('.spinner')?.remove();
  const bar=el('progress',{'aria-label':'Progreso de la operación'});
  const hint=el('span',{class:'activity-hint'});
  node.insertBefore(bar,stop);node.insertBefore(hint,stop);
  let stage=null,pending=null,long=null,value=null,slow=false;
  const clear=()=>{cancel(pending);cancel(long);pending=null;long=null;};
  const paint=()=>{
    const counted=Number.isInteger(value?.completed)&&Number.isInteger(value?.total)&&value.total>0&&value.completed>=0;
    label.textContent=value.label+(counted?` · ${value.completed} de ${value.total}`:'…');
    if(counted){bar.max=value.total;bar.value=Math.min(value.completed,value.total);}
    else bar.removeAttribute('value');
    hint.textContent=slow?'Puedes detener al terminar el paso seguro actual.':'';
    if(counted)node.hidden=false;
  };
  return {
    update(next){
      if(next.stage==='idle'){clear();stage=null;value=null;slow=false;node.hidden=true;return;}
      value=next;
      if(next.stage!==stage){
        clear();stage=next.stage;slow=false;node.hidden=true;
        pending=schedule(()=>{node.hidden=false;},1000);
        long=schedule(()=>{slow=true;paint();},10000);
      }
      paint();
    },
    mount(footer){if(footer)footer.prepend(node);else document.getElementById('feedback').after(node);},
  };
}
let controller;
export const activity=()=>controller??=createProgress(document.getElementById('activity'));
export const updateProgress=value=>activity().update(value);
export const mountProgress=footer=>activity().mount(footer);
