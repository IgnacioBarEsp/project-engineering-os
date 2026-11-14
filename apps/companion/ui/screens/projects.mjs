import {state,el,p,btn,doBtn,own,actions,panel,call,render} from '../lib/core.mjs';
import {skeletonRow} from '../components/skeleton.mjs';
import {emptyState} from '../components/empty-state.mjs';
import {projectRow} from '../components/project-row.mjs';
import {deferredList,sortedProjects} from '../lib/deferred-list.mjs';
let generation=0;
export async function showProjects(){
  const request=++generation;state.page='projects';
  const list=el('div',{class:'project-list','aria-busy':'true'});
  await render([
    el('h1',{tabindex:'-1',text:'Tus proyectos'}),
    list,
  ]);
  const current=()=>request===generation&&state.page==='projects'&&list.isConnected;
  try {
    const rows=await deferredList(()=>call('listProjects'),()=>{
      if(!current())return;
      const known=state.projects.length?state.projects:[null,null,null];
      list.replaceChildren(...known.map(skeletonRow));
    });
    if(!current())return;
    state.projects=sortedProjects(rows);
    list.replaceChildren(...(state.projects.length?state.projects.map(projectRow):[
      emptyState('Aún no hay proyectos en esta lista.',doBtn('prepare-project','primary'))]));
  }catch(failure){if(current())list.replaceChildren(el('section',{class:'panel list-error',role:'alert'},el('h2',{text:failure.message??'No se pudo leer la lista.'}),p(failure.action??'Vuelve a intentarlo.'),actions(doBtn('open-project-list','primary'))));}
  finally{if(current())list.setAttribute('aria-busy','false');}
}
