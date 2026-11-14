import {el,run} from '../lib/core.mjs';
import {PROJECT_TABS} from '../lib/project-route.mjs';
export function projectSegments(selected,change){
  const ids=Object.keys(PROJECT_TABS),buttons=[];
  const group=el('div',{class:'project-segments',role:'group','aria-label':'Secciones del proyecto'});
  for(const [id,label] of Object.entries(PROJECT_TABS)){
    const node=el('button',{type:'button',id:`project-tab-${id}`,'data-project-segment':id,'aria-pressed':String(id===selected),'aria-controls':'project-panel',
      onClick:()=>run(()=>change(id)),onKeydown:event=>{
        const index=ids.indexOf(id),next=event.key==='ArrowRight'?(index+1)%ids.length:event.key==='ArrowLeft'?(index+ids.length-1)%ids.length:event.key==='Home'?0:event.key==='End'?ids.length-1:null;
        if(next!==null){event.preventDefault();buttons[next].focus();}
      }},label);buttons.push(node);group.append(node);
  }
  return group;
}
