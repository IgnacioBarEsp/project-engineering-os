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
  const tools=el('details',{id:'project-tools',class:'project-tools',open:state.tab!=='overview',onToggle:event=>{
    if(!event.target.isConnected||event.target.open||state.tab==='overview')return;
    if(state.busy){event.target.open=true;return;}
    void run(()=>change('overview'));
  }},el('summary',{text:'Herramientas opcionales'}),
    p('Busca información en tus archivos o usa guías para tu IA solo cuando lo necesites.','subtle'),
    projectSegments(state.tab,change));
  const destination=el('section',{id:'project-panel','data-project-tab':state.tab,
    'aria-labelledby':state.tab==='overview'?'project-preparation-title':`project-tab-${state.tab}`},content);
  const normalized=canonicalProfile(s.base.selection??s.project.selection??{});
  const profile=state.profileCatalog?.profiles.find(item=>item.id===normalized.profile);
  const focus=profile?.focuses?.find(item=>item.id===normalized.focus);
  await render([
    el('header',{class:'project-header'},
      el('p',{class:'eyebrow',text:[profile?.label??profiles[s.base.selection?.profile]?.[0],focus?.label].filter(Boolean).join(' · ')}),
      ...ownHeading(s.project.name,s.project.selection?.goal??'Comprueba cómo está y elige tu siguiente paso.',!!s.project.selection?.goal),
      own(s.project.root,'p',{class:'path'}),currentVerdict(s),actions(doBtn('recheck-project'))),
    ...(state.tab==='overview'?[destination,tools]:[tools,destination]),
  ]);
  if(focusTab)state.focusAfterAction=state.tab==='overview'?document.querySelector('#project-tools > summary'):document.getElementById(`project-tab-${state.tab}`);
}
window.addEventListener('hashchange',()=>{
  if(state.page!=='workspace'||state.busy)return;
  const route=parseProjectHash(location.hash);
  if(route?.id!==state.project?.id||route.tab===state.tab)return;
  void run(async()=>{state.tab=route.tab;await showWorkspace(false,{focusTab:true});});
});
export {openProject,forget};
