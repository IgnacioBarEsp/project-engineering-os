import {showStart, showProjects, duplicate, showHelp, showTerm, showPrivacy, startSetup, reviewStack, reviewEngineering, reviewRepair, prepareContext, reviewCode, resaveBase, openProject, forget, showWorkspace} from './bridge.mjs';
import { GLOSSARY, byId } from '../glossary.mjs';
import {el, own, term as createTerm} from './dom.mjs';
import {routeFor} from './router.mjs';
import {createScreenState} from './state.mjs';
import {actions, wizardBar} from '../components/actions-bar.mjs';
import {steps as stepRail} from '../components/step-rail.mjs';
const api=window.companion;
const $=id=>document.getElementById(id);
const profiles={
  software:['Software o página web','Código, especificaciones, aplicaciones y pruebas técnicas.'],
  science:['Investigación científica','Artículos, papers, experimentos y evidencia reproducible.'],
  studies:['Estudios y universidad','Proyectos académicos, tesis, guías y preparación de entregas.'],
  docs:['Contenido y documentación','Manuales técnicos, especificaciones y guías interactivas.'],
  mvp:['Prototipos rápidos (MVP)','Validación ágil de ideas, interfaces y pruebas de concepto.'],
  personal:['Uso personal y laboratorio','Notas, utilidades cotidianas, ideas y experimentos libres.'],
  automation:['Automatización y scripting','Scripts, bots, pipelines de datos y herramientas operativas.'],
  research:['Investigación','Artículos, PDF, documentos y evidencia.'],
  unity:['Videojuego con Unity','Escenas, scripts y un proceso de desarrollo.'],
  media:['Contenido creativo','Imágenes, música, video y sus workflows.'],
  general:['Otro proyecto','Materiales de trabajo, ideas y tareas cotidianas.']
};
const agents={codex:'Codex','claude-code':'Claude',cursor:'Cursor','github-copilot':'GitHub Copilot',opencode:'OpenCode',antigravity:'Antigravity',web:'ChatGPT u otro chat web'};
const roles={researcher:'Investigador/a',student:'Estudiante',developer:'Desarrollador/a o área de TI',freelancer:'Freelancer',creator:'Creador/a de contenido',general:'Usuario/a general'};
const techDecisions={chosen:['Sí, ya sé cuál quiero','Se te ofrece instalarla, con su licencia, su tamaño y su destino a la vista.'],
  unsure:['No sé todavía, o empiezo ahora','Se te recomienda una a partir de tu tipo de proyecto y de lo que hay en tu carpeta, y puedes decir que no.'],
  'too-early':['Es pronto para decidirlo','No se instala ninguna tecnología, y el proyecto te dice por qué eso está bien.']};
// What a listed project's state may say. Only `verified` carries the check mark, and it means two things at
// once: every stage this kind of project needs was comprobado de verdad, and nothing that check depended on
// has changed since. Anything else — no check, a folder that moved, a file that changed, a stage still
// missing — says so instead of showing a hopeful mark.
const projectStates={verified:['Listo','Cada parte que este proyecto necesita quedó comprobada.'],
  incomplete:['Le falta algo','Se comprobó y esto quedó pendiente:'],
  changed:['Hay que comprobarlo de nuevo','Cambió algo de lo que se había comprobado:'],
  unverified:['Sin comprobar','Nunca se ha comprobado en esta carpeta, o la carpeta cambió de lugar.'],
  'not-prepared':['Sin preparar','Todavía no se ha escrito nada en esta carpeta.'],
  interrupted:['Quedó algo a medias','Una operación se interrumpió. Al abrirlo puedes continuarla o deshacerla.'],
  unreadable:['No se pudo leer su registro','Tus archivos siguen donde están.']};
// A stage in the person's words, and the word depends on WHY the stage is not ready: an independent review
// added one file to a folder and the row said "tus elecciones guardadas" were missing, which was false — the
// choices were saved and it was the folder's snapshot that no longer described it. The code map and the
// inventory are named with their own terms rather than with a near-synonym that would dodge their definitions.
const stageWords={base:'tus elecciones guardadas',context:'la lectura de tus archivos',
  environment:'las herramientas de desarrollo',engineering:'las instrucciones de desarrollo'};
const stageNode=(id,state)=>id==='code'?term('mapa-de-codigo')
  :id==='base'&&state==='inventory-stale'?term('inventario')
  :stageWords[id]??'una parte que no reconocemos';
const stageList=stages=>stages.flatMap((stage,index)=>{
  const node=el('span',{class:'stage'},stageNode(stage.id??stage,stage.state));
  return index?[', ',node]:[node];});
const onDate=value=>{const when=new Date(value??'');return Number.isNaN(when.getTime())?null
  :when.toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'});};
const state={page:'start',tab:'overview',busy:false,projects:[],project:null,plan:null,status:null,query:'',inference:null,notes:null,stacks:null,providerModels:null,selection:{name:'',goal:'',role:'researcher',profile:'research',experience:'guided',agents:['web'],stack:{decision:'too-early',requested:[]}}};
const screenState=createScreenState();
const p=(text,cls='')=>el('p',{class:cls,text});
const btn=(text,action,cls='secondary')=>el('button',{type:'button',class:cls,onClick:()=>run(action)},text);
// One name per action, by construction. The label lives WITH the action, and `doBtn` takes no label, so a
// control cannot offer a declared action under a second name — the earlier version passed a label in and a
// review showed that six different labels reached the project screen and three reached the file reading.
// The set is closed: `interface-contract.mjs` asserts exactly these ids are present, so satisfying the check
// by deleting a control does not work either.
//
// Relative navigation is deliberately NOT in this table. "Volver" means "one step back from here", so its
// meaning is positional and depends on the screen; giving it a destination's name would be the opposite of
// the fix. What the table covers is destinations and repeatable operations.
const ACTIONS={
  'open-start':{label:'Inicio',run:()=>showStart()},
  'open-project-list':{label:'Tus proyectos',run:()=>showProjects()},
  'prepare-project':{label:'Preparar proyecto',run:()=>startSetup()},
  'open-help':{label:'Ayuda',run:()=>showHelp()},
  'privacy-scope':{label:'Privacidad y alcance',run:()=>showPrivacy()},
  'open-workspace':{label:'Ver mi proyecto',run:()=>showWorkspace()},
  'recheck-project':{label:'Comprobar de nuevo',run:()=>showWorkspace()},
  'read-files':{label:'Leer mis archivos',run:()=>prepareContext()},
  'resave-base':{label:'Revisar tus elecciones otra vez',run:()=>resaveBase()},
  'review-development':{label:'Revisar desarrollo',run:()=>reviewEngineering()},
  'review-code-map':{label:'Revisar mapa de código',run:()=>reviewCode()},
  'repair-tools':{label:'Revisar reparación de herramientas',run:()=>reviewRepair()},
  'review-stack':{label:'Revisar tecnología del proyecto',run:()=>reviewStack(()=>showWorkspace())},
};
const doBtn=(id,cls='secondary')=>{const action=ACTIONS[id];if(!action)throw Error(`Acción sin declarar: ${id}`);
  return el('button',{type:'button',class:cls,'data-action':id,onClick:()=>run(action.run)},action.label);};
// The same rule for the controls that act on one listed project. They are not destinations, so they are not
// in the table above, but a row control can carry two names just as easily: the label lives with the action
// and `rowBtn` takes none. The project's own name is added as content marked as the person's, so what a
// screen reader announces identifies the row while the interface's own name for the action stays single.
const ROW_ACTIONS={
  'open-project':{label:'Abrir este proyecto',primary:true,run:project=>openProject(project.id)},
  'duplicate-project':{label:'Duplicar esta preparación',primary:false,run:project=>duplicate(project)},
  'forget-project':{label:'Quitar de la lista',primary:false,run:project=>forget(project)},
};
const rowBtn=(id,project,cls='quiet',...before)=>{const action=ROW_ACTIONS[id];if(!action)throw Error(`Acción de fila sin declarar: ${id}`);
  return el('button',{type:'button',class:cls,'data-row-action':id,onClick:()=>run(()=>action.run(project))},
    before,el('span',{class:cls==='card-open'?'sr-only':'row-label',text:action.label}),
    el('span',{class:'sr-only','data-content':'person',text:` — ${project.name}`}));};
const heading=(title,description)=>[el('h1',{tabindex:'-1',text:title}),p(description,'intro')];
// The person's own words, and only those. `data-content="person"` says whose words these are; it is not a
// class, because a class is also a styling decision and an independent review found three places where the
// interface wrote its own prose inside one and was read as the person's content. `own()` wraps exactly the
// text that came from them, so a fallback sentence the interface supplies stays interface text.
const ownHeading=(title,description,fromPerson)=>[
  el('h1',{tabindex:'-1','data-content':'person',text:title}),
  fromPerson?own(description,'p',{class:'intro'}):p(description,'intro')];
// The final bar of a wizard screen, told apart from the action rows inside cards. `render` places it after the
// animated content, never inside it: an ancestor animated with a transform becomes the containing block of its
// fixed descendants, which is how 0.3.1 pinned this bar to the bottom of the content and hid the installation
// buttons under it. Here it stays in the flow and sticks to the bottom of the window.
const panel=(...content)=>el('section',{class:'panel'},content);
const term=createTerm(id=>showTerm(id));
function field(label,id,node,hint){return el('div',{class:'field'},el('label',{for:id,text:label}),node,hint?el('small',{text:hint}):null);}
function input(id,value,max,change){const n=el('input',{type:'text',id,maxlength:max,required:true,value,onInput:e=>change(e.target.value)});return n;}
function select(id,options,value,change){const n=el('select',{id,onChange:e=>change(e.target.value)},Object.entries(options).map(([v,label])=>el('option',{value:v,text:label})));n.value=value;return n;}
function steps(){return stepRail(state.page,state.tab);}
function notice(message){$('notice').textContent=message;}
function error(value){if($('dialog').open)closeDialog();$('feedback').replaceChildren(el('strong',{text:value.message??'No se pudo completar la acción.'}),p(value.action??'Vuelve a intentarlo.'),el('small',{text:value.code??''}));$('feedback').hidden=false;$('feedback').scrollIntoView({block:'nearest'});}
function setBusy(value){state.busy=value;document.querySelectorAll('button,input,textarea,select').forEach(n=>{if(!['cancel','close-dialog'].includes(n.id))n.disabled=value;});$('content').setAttribute('aria-busy',String(value));}
// A transport that fails says so in words a person can act on. Its own message names an internal channel.
const TRANSPORT_FAILED={code:'TRANSPORT_FAILED',message:'La ventana no pudo comunicarse con la aplicación.',
  action:'Vuelve a intentarlo. Si sigue igual, cierra la aplicación y ábrela de nuevo; tus proyectos se conservan.'};
async function call(name,input={}){let r;try{r=await api[name](input);}catch{throw TRANSPORT_FAILED;}if(!r?.ok)throw r?.error??TRANSPORT_FAILED;return r.value;}
let actionOrigin=null;
async function run(fn){if(state.busy)return;actionOrigin=document.activeElement;$('feedback').hidden=true;notice('');setBusy(true);try{await fn();}catch(e){error(e);}finally{setBusy(false);}}
// The bar covers the bottom of the window while it sticks there, so the browser is told how much: scroll padding
// keeps keyboard focus and scrolling from stopping underneath it.
const barHeight=new ResizeObserver(([entry])=>document.documentElement.style.setProperty('--wizard-footer-height',`${Math.ceil(entry.target.getBoundingClientRect().height)}px`));
function render(content,_breadcrumb,bar=null){const route=routeFor(state.page,{tab:state.tab});screenState.update(state.page,{visited:true,tab:state.tab});
  const body=el('div',{class:'enter'},content);
  const rail=body.querySelector(':scope > .steps');
  if(rail){const rest=[...body.childNodes].filter(node=>node!==rail);body.replaceChildren(el('div',{class:'wizard-layout'},el('aside',{class:'wizard-rail','aria-label':'Pasos de preparación'},rail),el('div',{class:'wizard-content'},rest)));}
  $('view').replaceChildren(...[body,bar].filter(Boolean));
  barHeight.disconnect();if(bar)barHeight.observe(bar);else document.documentElement.style.removeProperty('--wizard-footer-height');
  $('breadcrumb').textContent=route.breadcrumb;$('feedback').hidden=true;setBusy(state.busy);$('nav')?.querySelectorAll('button').forEach(b=>{const active=b.dataset.action===route.nav;b.setAttribute('aria-pressed',String(active));b.classList.toggle('active',active);});const h=$('view').querySelector('h1');h?.focus({preventScroll:true});$('content').scrollTo({top:0});}
// Inicio: what the application does, how it works, what it downloads and why, what stays here, and the one
// action that starts. Not a project list — that has its own destination and its own name.
//
// The opening sentence says what the application does and stops there. An earlier draft ended "para que
// entienda tu trabajo desde la primera pregunta", and an independent review refused it: this project
// measured prepared context against a model and published a tie — 15/15 against 15/15 — and its own
// evidence page lists model answer quality as not measured. Warmth does not buy a claim.

let dialogReturn=null;
function openDialog(title,content){dialogReturn=state.busy?actionOrigin:document.activeElement;$('dialog-title').textContent=title;$('dialog-body').replaceChildren(...content.filter(node=>node!==null&&node!==undefined));$('dialog').showModal();$('close-dialog').focus();}
function closeDialog(){$('dialog').close();}

export {api, $, profiles, agents, roles, techDecisions, projectStates, stageWords, stageNode, stageList, onDate, state, screenState, el, p, btn, ACTIONS, doBtn, ROW_ACTIONS, rowBtn, heading, own, ownHeading, actions, wizardBar, panel, term, field, input, select, steps, notice, error, setBusy, TRANSPORT_FAILED, call, actionOrigin, run, barHeight, render, dialogReturn, openDialog, closeDialog, GLOSSARY, byId};
