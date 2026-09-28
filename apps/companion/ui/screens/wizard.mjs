import {profiles,profileInfo,loadProfiles,agents,techDecisions,state,el,p,btn,doBtn,heading,own,actions,wizardBar,panel,term,steps,notice,error,call,run,render} from '../lib/core.mjs';
import {openProject} from '../lib/bridge.mjs';
import {emptyAnswers,selectionForPreparation,visionFromAnswers,wordCount,WIZARD_PAGES} from '../lib/wizard-model.mjs';
import {startPreparation,preparationIsRunning,preparationPlan} from './wizard-prepare.mjs';
import {showFinished} from './wizard-done.mjs';

let saveTimer=null,saveQueue=Promise.resolve();
const draft=()=>({step:state.wizardStep,selection:structuredClone(state.selection),projectId:state.project?.id??null});
function persist(){
  if(!state.wizardActive)return Promise.resolve();
  const value=draft();
  saveQueue=saveQueue.catch(()=>{}).then(()=>call('draftSave',{draft:value}));
  return saveQueue;
}
function schedulePersist(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{void persist().catch(error);},150);}
async function flushPersist(){clearTimeout(saveTimer);await persist();}
async function suspendWizard(){
  if(!state.wizardActive)return;
  // Save A before opening B. A failed save must leave A active and retryable.
  await flushPersist();
  state.resumeDraft={...draft(),project:structuredClone(state.project)};
  state.wizardActive=false;
}
async function beforeClose(){
  if(state.busy||preparationIsRunning())return false;
  try{await flushPersist();return true;}catch(failure){error(failure);return false;}
}
function resetWizard(){state.wizardActive=true;state.wizardStep=0;state.resumeDraft=null;state.project=null;state.plan=null;state.selection=emptyAnswers();}
async function prerequisites(){await loadProfiles();state.stacks=state.stacks??await call('stackCatalog');}

async function startSetup(){
  await prerequisites();
  if(state.wizardActive){await showWizard();return;}
  if(state.resumeDraft){await resumeDraft();return;}
  resetWizard();await flushPersist();showWizard();
}
async function resumeDraft(){
  await prerequisites();const saved=state.resumeDraft??await call('draftLoad');if(!saved)return startSetup();
  state.wizardActive=true;state.wizardStep=saved.step;state.selection={...emptyAnswers(),...saved.selection};
  state.project=saved.project;state.plan=null;state.resumeDraft=null;
  if(state.wizardStep===3)await showPrepare();else showWizard();
}
async function beginWithFolder(chosen,{answers=null}={}){
  await prerequisites();
  resetWizard();
  if(answers){const initial=emptyAnswers();state.selection={...initial,...Object.fromEntries(
    Object.entries(answers).filter(([key])=>Object.hasOwn(initial,key)))};}
  state.project=chosen;
  if(!answers)state.selection.name=chosen.name.slice(0,100);
  const suggested=chosen.inspection?.recommendation;
  if(!answers&&profiles[suggested]){
    state.selection.profile=suggested;
    const focus=chosen.inspection?.focusRecommendation;
    state.selection.focus=profileInfo(suggested).focuses.some(item=>item.id===focus)?focus:profileInfo(suggested).defaultFocus;
  }
  await flushPersist();showWizard();
}
async function chooseFromHome(){
  const chosen=await call('chooseFolder');if(!chosen)return;
  const known=(await call('listProjects')).find(item=>item.root===chosen.root&&item.selection);
  if(known){await openProject(known.id);return;}
  await beginWithFolder(chosen);
}
async function startFromDuplicate(project){
  const chosen=await call('chooseFolder');if(!chosen)return;
  const old=project.selection??{};
  const answers={name:old.name??project.name,goal:old.goal??'',profile:project.mappedProfile??'research',
    focus:project.mappedFocus??profileInfo(project.mappedProfile??'research').defaultFocus,
    vision:old.vision??'',agents:old.agents?.length?[...old.agents]:['web'],
    stack:old.stack?{decision:old.stack.decision,requested:[...(old.stack.requested??[])]}:{decision:'too-early',requested:[]},
    experience:old.experience??'guided'};
  await beginWithFolder(chosen,{answers});
}
async function goStep(index){
  if(index<0||index>3)throw Error('Paso fuera del asistente');
  const previous=state.wizardStep;state.wizardStep=index;state.plan=null;
  try{await flushPersist();if(index===3)await showPrepare();else showWizard();}
  catch(failure){state.wizardStep=previous;throw failure;}
}
function rail(){return steps({onSelect:index=>void run(()=>goStep(index))});}
function showWizard(){
  const page=WIZARD_PAGES[state.wizardStep];
  if(page==='setup')showProject();else if(page==='delimitation')showFocus();
  else if(page==='vision')showVision();else return showPrepare();
}

function showProject(){
  state.page='setup';const s=state.selection,chosen=state.project;
  const name=el('input',{id:'wizard-name',type:'text',maxlength:100,required:true,value:s.name,
    onInput:event=>{s.name=event.target.value;schedulePersist();}});
  const profileCards=el('div',{class:'choices wizard-profiles'},Object.entries(profiles).map(([id,[label,description]])=>{
    const radio=el('input',{type:'radio',name:'profile',value:id,checked:s.profile===id,onChange:()=>{
      s.profile=id;s.focus=profileInfo(id).defaultFocus;s.stack={decision:'too-early',requested:[]};schedulePersist();}});
    return el('label',{class:'choice'},radio,el('span',{},el('strong',{text:label}),el('small',{text:description})));}));
  const folder=el('div',{class:'wizard-folder'},el('div',{},el('strong',{text:'Carpeta del proyecto'}),chosen
    ?[own(chosen.root,'p',{class:'path'}),p(`Primera mirada: ${chosen.inspection?.files?.length??0} archivos; parece ${profiles[chosen.inspection?.recommendation]?.[0]??'un tipo por confirmar'}.`,'subtle')]
    :p('Elígela o crea una nueva en el diálogo del sistema.','subtle')),
    btn(chosen?'Cambiar carpeta':'Elegir carpeta',async()=>{
      const result=await call('chooseFolder');if(!result)return;state.project=result;
      if(!s.name.trim())s.name=result.name.slice(0,100);
      // The inspection is guidance above, not permission to replace explicit answers.
      await flushPersist();showProject();},'secondary'));
  const form=el('form',{id:'wizard-project-form',onSubmit:event=>{event.preventDefault();void run(async()=>{
    if(!s.name.trim())throw {message:'Ponle un nombre al proyecto.',action:'Escribe un nombre corto para reconocerlo.'};
    if(!state.project)throw {message:'Falta elegir la carpeta.',action:'Usa Elegir carpeta para seleccionar o crear una.'};
    await goStep(1);
  });}},el('div',{class:'field'},el('label',{for:'wizard-name',text:'Nombre de tu proyecto'}),name),folder,
    el('fieldset',{},el('legend',{text:'¿Qué vas a preparar?'}),profileCards));
  render([rail(),el('p',{class:'eyebrow wizard-purpose',text:'Herramienta de preparación de proyectos para tu IA'}),el('h1',{tabindex:'-1',text:'¿Qué vas a preparar?'}),
    el('p',{class:'intro'},'Nombre, carpeta y tipo de trabajo. Tus archivos pueden aportar ',term('fuente','fuentes'),'.'),form],null,
    wizardBar(doBtn('open-start'),el('button',{type:'submit',form:'wizard-project-form',class:'primary',text:'Continuar a Enfoque  →'})));
}

function showFocus(){
  state.page='delimitation';const s=state.selection,info=profileInfo(s.profile),focuses=info.focuses;
  if(!focuses.some(item=>item.id===s.focus))s.focus=info.defaultFocus;
  const selected=focuses.find(item=>item.id===s.focus);
  const focusCards=el('fieldset',{},el('legend',{text:`Tipo de ${info.label.toLowerCase()}`}),
    el('div',{class:'choices wizard-focuses'},focuses.map(item=>el('label',{class:'choice'},
      el('input',{type:'radio',name:'focus',value:item.id,checked:s.focus===item.id,onChange:()=>{
        const top=document.getElementById('content').scrollTop;s.focus=item.id;
        s.stack.requested=s.stack.requested.filter(id=>item.stacks.includes(id));schedulePersist();showFocus();
        document.getElementById('content').scrollTop=top;document.querySelector(`input[name="focus"][value="${item.id}"]`)?.focus({preventScroll:true});}}),
      el('span',{},el('strong',{text:item.label}),el('small',{text:item.description}))))));
  let technology=null;
  if(info.engineering){
    const decision=el('div',{class:'choices'},Object.entries(techDecisions).map(([id,[label,hint]])=>el('label',{class:'choice'},
      el('input',{type:'radio',name:'stack-decision',value:id,checked:s.stack.decision===id,onChange:()=>{
        const top=document.getElementById('content').scrollTop;
        s.stack={decision:id,requested:id==='chosen'?s.stack.requested:[]};schedulePersist();showFocus();
        document.getElementById('content').scrollTop=top;document.querySelector(`input[name="stack-decision"][value="${id}"]`)?.focus({preventScroll:true});}}),
      el('span',{},el('strong',{text:label}),el('small',{text:hint})))));
    const offered=(state.stacks?.stacks??[]).filter(stack=>selected.stacks.includes(stack.id));
    technology=el('fieldset',{},el('legend',{text:'¿Ya sabes qué tecnología quieres usar?'}),decision,
      s.stack.decision==='chosen'&&offered.length?el('div',{class:'choices'},offered.map(stack=>el('label',{class:'choice'},
        el('input',{type:'checkbox',name:'stack',value:stack.id,checked:s.stack.requested.includes(stack.id),onChange:event=>{
          const chosen=new Set(s.stack.requested);if(event.target.checked)chosen.add(stack.id);else chosen.delete(stack.id);
          s.stack.requested=[...chosen];schedulePersist();}}),el('span',{},el('strong',{text:stack.name}),el('small',{text:stack.purpose}))))):null,
      p(offered.length?'Nada se instala sin mostrar licencia, tamaño y destino en la revisión.':'No hay una tecnología de esta app para instalar con este enfoque. Puedes continuar sin ella.','subtle'));
  }
  render([rail(),el('h1',{tabindex:'-1',text:'¿Qué tipo de trabajo harás?'}),
    el('p',{class:'intro'},`Elige un enfoque para ${info.label}. `,'Qué cuenta como ',term('fuente'),'.'),focusCards,technology],null,
    wizardBar(btn('Volver',()=>goStep(0)),btn('Continuar a Visión  →',()=>goStep(2),'primary')));
}

function showVision(){
  state.page='vision';const s=state.selection;
  const count=el('span',{class:'subtle','aria-live':'polite',text:`${wordCount(visionFromAnswers(s))} palabras · entre 50 y 400 suele bastar`});
  const preview=el('pre',{class:'prompt wizard-preview',hidden:true});
  const update=()=>{count.textContent=`${wordCount(visionFromAnswers(s))} palabras · entre 50 y 400 suele bastar`;preview.hidden=true;schedulePersist();};
  const goal=el('input',{id:'vision-goal',type:'text',maxlength:500,required:true,value:s.goal,onInput:event=>{s.goal=event.target.value;update();}});
  const modes=el('div',{class:'actions wizard-modes'},[['free','Modo libre'],['structured','Cuatro apartados']].map(([id,label])=>{
    const control=btn(label,()=>{s.visionMode=id;schedulePersist();showVision();},'secondary');control.setAttribute('aria-pressed',String(s.visionMode===id));return control;}));
  const prompt=(label,question)=>btn(label,()=>{const area=document.getElementById('vision-free');if(!area)return;
    const next=`${area.value.trim()}${area.value.trim()?'\n\n':''}${question}`;if(next.length>4000)return;
    area.value=next;s.vision=next;update();area.focus();},'quiet');
  const editor=(id,rows,max,value,change)=>{
    const area=el('textarea',{id,rows,maxlength:max,onInput:event=>{change(event.target.value);update();}});
    area.value=value;return area;
  };
  const freeEditor=editor('vision-free',7,4000,s.vision,value=>{s.vision=value;});
  freeEditor.placeholder='Escribe lo que ya sabes; no hace falta que esté perfecto.';
  const free=el('div',{class:'field'},el('label',{for:'vision-free',text:'Descripción libre (opcional)'}),
    freeEditor,
    el('div',{class:'actions'},prompt('Pregunta sobre audiencia','¿Para quién es este proyecto?'),
      prompt('Pregunta sobre materiales','¿Qué materiales o avances existen ya?'),
      prompt('Pregunta sobre límites','¿Qué no entra en este primer resultado?')));
  const section=(title,id,question,max)=>el('details',{class:'wizard-section'},el('summary',{text:title}),
    el('label',{for:id,text:question}),editor(id,3,max,s[id],value=>{s[id]=value;}));
  const goalField=el('div',{class:'field'},el('label',{for:'vision-goal',text:'¿Qué quieres lograr?'}),goal);
  const structured=el('div',{class:'wizard-sections'},
    section('Para quién','audience','¿Para quién es?',1000),
    section('Qué existe ya','existing','¿Qué archivos, decisiones o avances ya tienes?',1000),
    section('Qué no entra','outside','¿Qué queda fuera por ahora?',1000));
  render([rail(),...heading('Cuéntalo en tus palabras','Escribe el objetivo una sola vez. Puedes dejar el resto abierto y completarlo después.'),
    modes,s.visionMode==='structured'?el('details',{class:'wizard-section',open:true},el('summary',{text:'Qué quieres lograr'}),goalField):goalField,
    s.visionMode==='structured'?structured:free,count,
    actions(btn('Ver PROJECT_VISION.md antes de guardar',async()=>{
      if(!s.goal.trim())throw {message:'Primero escribe el objetivo.',action:'Una frase basta para ver la vista previa.'};
      const result=await call('previewVision',{selection:selectionForPreparation(s)});preview.textContent=result.text;preview.hidden=false;
    },'secondary')),
    preview],null,wizardBar(btn('Volver',()=>goStep(1)),btn('Continuar a Preparar  →',async()=>{
      if(!s.goal.trim())throw {message:'Falta el objetivo.',action:'Escribe qué quieres lograr antes de revisar el plan.'};
      await goStep(3);},'primary')));
}

async function showPrepare(){
  const s=state.selection;
  if(!s.agents.length)throw {message:'Elige al menos una IA.',action:'Marca la que ya usas para continuar.'};
  const plan=await call('previewBase',{id:state.project.id,selection:selectionForPreparation(s)});
  state.plan=plan;state.page='install';
  const route=el('fieldset',{},el('legend',{text:'¿Cómo quieres continuar?'}),
    el('div',{class:'choices'},[
      ['quick','Prepararlo ahora','Se guardan tus elecciones y se leen los archivos. En Software también se preparan herramientas, método y tecnología elegida, con cada plan revisado.'],
      ['ai','Que mi IA se encargue','Se guardan tus elecciones y se leen los archivos. Herramientas y método quedan para tu IA, con instrucciones y comprobaciones. No se le envía nada automáticamente.'],
    ].map(([id,label,description])=>el('label',{class:'choice'},
      el('input',{type:'radio',name:'install-mode',value:id,checked:s.installMode===id,onChange:()=>void run(async()=>{
        s.installMode=id;await flushPersist();await showPrepare();})}),
      el('span',{},el('strong',{text:label}),el('small',{text:description}))))));
  const ai=el('fieldset',{},el('legend',{text:'¿Con qué IA vas a seguir?'}),
    el('div',{class:'choices'},Object.entries(agents).map(([id,label])=>el('label',{class:'choice'},
      el('input',{type:'checkbox',name:'agent',value:id,checked:s.agents.includes(id),onChange:event=>void run(async()=>{
        s.agents=event.target.checked?[...s.agents,id]:s.agents.filter(item=>item!==id);
        if(!s.agents.length){s.agents=[id];event.target.checked=true;throw {message:'Elige al menos una IA.',action:'Puedes marcar varias, pero no dejar la lista vacía.'};}
        await flushPersist();await showPrepare();})}),el('span',{},el('strong',{text:label}))))));
  const filePlan=preparationPlan(plan);
  render([rail(),...heading('Cómo quieres continuar','Revisa el plan real antes de guardar. Elegir una vía no instala nada por sí solo.'),
    route,ai,filePlan,p('Este primer plan guarda tus elecciones. Los siguientes se calculan y revisan aquí después de cada etapa. Tus originales se conservan y no se envían a ninguna IA durante la preparación.','subtle')],null,
    wizardBar(btn('Volver',()=>goStep(2)),btn('Guardar la preparación revisada  →',executePreparation,'primary')));
}
async function executePreparation(){
  await flushPersist();
  await startPreparation(state.plan,selectionForPreparation(state.selection),{onFinished:async result=>{
    state.status=result.status;state.project={...state.project,...result.status.project};state.wizardActive=false;
    try{await call('draftClear');}catch(failure){notice(`La preparación se conserva, pero el borrador no se pudo limpiar: ${failure.message}`);}
    showFinished(result);
  }});
}

export {startSetup,resumeDraft,suspendWizard,chooseFromHome,startFromDuplicate,showWizard,showProject,showFocus,showVision,showPrepare,showFinished,beforeClose};
