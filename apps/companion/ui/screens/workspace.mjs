import {profiles,canonicalProfile,state,el,p,btn,doBtn,own,ownHeading,actions,term,call,run,render,openDialog,closeDialog} from '../lib/core.mjs';
import {showProjects,suspendWizard} from '../lib/bridge.mjs';
import {overviewView} from './project-overview.mjs';
import {filesView} from './project-files.mjs';
import {recipesView} from './project-recipes.mjs';
import {handoffView} from './project-ai.mjs';
import {currentVerdict} from '../components/project-verdict.mjs';
import {projectSegments} from '../components/project-segments.mjs';
import {parseProjectHash} from '../lib/project-route.mjs';
async function openProject(id){await suspendWizard();state.status=await call('openProject',{id});state.project=state.status.project;
  // Resolve this project's answers only. Merging global answers leaks another project's focus.
  const saved=structuredClone(state.project.selection??{});
  state.selection={...saved,...canonicalProfile(saved)};state.tab='overview';await showWorkspace(false);}
async function forget(project){openDialog('Quitar de la lista',[
  el('p',{},'Se quita ',own(project.name),' de esta lista. Los archivos de la carpeta se quedan donde están.'),actions(btn('Conservar',async()=>closeDialog()),btn('Quitar de la lista',async()=>{await call('forgetProject',{id:project.id});closeDialog();await showProjects();},'danger'))]);}

export async function showWorkspace(refresh=true,{focusTab=false}={}){
  state.page='workspace';if(refresh)state.status=await call('status',{id:state.project.id});
  const s=state.status;state.project=s.project;
  state.stacks=state.stacks??await call('stackCatalog');
  let content;
  if(state.tab==='overview'){
    let guide=null,guideError=null;
    try{guide=await call('guide',{id:state.project.id});}catch(failure){guideError=failure;}
    content=overviewView(s,guide,guideError);
  }else if(state.tab==='search')content=filesView(s);
  else if(state.tab==='recipes')content=await recipesView();
  else content=[await handoffView(s)];
  const change=async id=>{state.tab=id;await showWorkspace(false,{focusTab:true});};
  const normalized=canonicalProfile(s.base.selection??s.project.selection??{});
  const profile=state.profileCatalog?.profiles.find(item=>item.id===normalized.profile);
  const focus=profile?.focuses?.find(item=>item.id===normalized.focus);
  render([
    el('header',{class:'project-header'},
      el('p',{class:'eyebrow',text:[profile?.label??profiles[s.base.selection?.profile]?.[0],focus?.label].filter(Boolean).join(' · ')}),
      ...ownHeading(s.project.name,s.project.selection?.goal??'Comprueba cómo está y elige tu siguiente paso.',!!s.project.selection?.goal),
      own(s.project.root,'p',{class:'path'}),currentVerdict(s),actions(doBtn('recheck-project'))),
    projectSegments(state.tab,change),
    el('p',{class:'subtle tab-note'},'Cada ',term('receta'),' es un recorrido corto para pedir un resultado concreto y comprobarlo.'),
    el('section',{id:'project-panel','data-project-tab':state.tab,'aria-labelledby':`project-tab-${state.tab}`},content),
  ]);
  if(focusTab)state.focusAfterAction=()=>document.getElementById(`project-tab-${state.tab}`);
}
window.addEventListener('hashchange',()=>{
  if(state.page!=='workspace'||state.busy)return;
  const route=parseProjectHash(location.hash);
  if(route?.id!==state.project?.id||route.tab===state.tab)return;
  void run(async()=>{state.tab=route.tab;await showWorkspace(false,{focusTab:true});});
});
export {openProject,forget};
