import {state,el,p,btn,doBtn,own,actions,panel,call,render} from '../lib/core.mjs';
import {projectRow} from '../components/project-row.mjs';
import {deferredList,sortedProjects} from '../lib/deferred-list.mjs';
let generation=0;
export async function showProjects(){
  const request=++generation;state.page='projects';
  const list=el('div',{class:'project-list','aria-busy':'true'});
  render([
    el('h1',{tabindex:'-1',text:'Tus proyectos'}),
    list,
  ]);
  const current=()=>request===generation&&state.page==='projects'&&list.isConnected;
  try {
    const rows=await deferredList(()=>call('listProjects'),()=>{
      if(!current())return;
      const known=state.projects.length?state.projects:[null,null,null];
      list.replaceChildren(...known.map(project=>el('div',{class:'project project-loading',role:'status','aria-label':'Leyendo el estado del proyecto'},
        project?own(project.name,'p'):null,el('span',{class:'skeleton-line','aria-hidden':'true'}),el('span',{class:'skeleton-line short','aria-hidden':'true'}))));
    });
    if(!current())return;
    state.projects=sortedProjects(rows);
    list.replaceChildren(...(state.projects.length?state.projects.map(projectRow):[
      el('div',{class:'empty-state'},p('Aún no hay proyectos en esta lista.','empty'),actions(doBtn('prepare-project','primary')))]));
  }catch(failure){if(current())list.replaceChildren(el('section',{class:'panel list-error',role:'alert'},el('h2',{text:failure.message??'No se pudo leer la lista.'}),p(failure.action??'Vuelve a intentarlo.'),actions(doBtn('open-project-list','primary'))));}
  finally{if(current())list.setAttribute('aria-busy','false');}
}
