import {isEngineeringProfile,profileInfo,canonicalProfile,agents,rowBtn,onDate,state,el,p,btn,doBtn,actions,panel,term,notice,call,openDialog,closeDialog} from '../lib/core.mjs';
import {stackPanel,showWorkspace} from '../lib/bridge.mjs';
function statusCard(title,done,detail){const label=done==='not-requested'?'No aplica':done?'Preparado':'Por revisar';return el('article',{class:'status-card'},el('span',{class:'status-icon','aria-hidden':true,text:done==='not-requested'?'—':done?'✓':'○'}),el('h2',{text:`${title} · ${label}`}),p(detail));}
// What to do in THIS project: what it is missing, in the order it can be done, then the ways of working this
// kind of project has. The application composes it — including the text handed to an AI, so what reaches the
// clipboard is text this application wrote — and reports which of its words have a definition, so the
// definitions are offered on the screen that used them.
//
// A step that this application performs carries no text for an AI on purpose. Reading your files or preparing
// the managed tools happens here, and handing someone a prompt to ask their AI for it would be describing a
// capability their AI does not have. Those steps carry the control that does the work instead.
function guidePanel(guide,failure){
  if(!guide)return panel(el('h2',{text:'Qué hacer ahora'}),
    p(failure?.message??'Todavía no se pudo preparar esta guía.'),p(failure?.action??'Comprueba el proyecto para prepararla.','subtle'));
  const when=onDate(guide.checkedAt),drawn=new Set();
  const definitions=()=>guide.terms.length?el('p',{class:'subtle'},'Qué significan estas palabras: ',...guide.terms.flatMap((id,index)=>index?[', ',term(id)]:[term(id)]),'.'):null;
  const draw=step=>{
      // Two pending stages can share the control that resolves them — the managed tools and the development
      // files are reviewed in one flow — so the control is drawn on the first of them. Drawing it twice would
      // put the same name on the screen twice, which reads as two different things to do.
      const repeated=step.action&&drawn.has(step.action);
      if(step.action)drawn.add(step.action);
      return el('li',{class:`guide-step kind-${step.kind}`,'data-step-action':step.action??false},
        el('h3',{text:step.title}),p(step.why),
        step.prompt?[el('pre',{class:'prompt',text:step.prompt}),
          actions(btn('Copiar este paso',async()=>{const copy=await call('copyGuideStep',{guide:guide.id,step:step.index});
            notice(`Copiado: ${copy.bytes} bytes. Pégalo en tu IA.`);}))]
          :repeated?p('Se resuelve con el control del paso anterior.','subtle'):actions(doBtn(step.action)));};
  const local=guide.steps.filter(step=>!step.prompt),ai=guide.steps.filter(step=>step.prompt);
  return panel(el('h2',{text:local.length?'Completar la preparación':'Guías opcionales'}),
    local.length?p('Estas tareas las realiza Companion. No necesitas pedirle a tu IA que las haga.'):null,
    local.length?definitions():null,
    el('ol',{class:'guide'},local.map(draw),ai.length?el('li',{class:'guide-options'},
      el('details',{class:'project-ai-guidance'},el('summary',{text:'Guías para trabajar con tu IA'}),
        p('Son sugerencias para cuando quieras trabajar en el proyecto; no son necesarias para administrar su preparación.','subtle'),
        !local.length?definitions():null,el('ol',{class:'guide-optional-list'},ai.map(draw)))):null),
    when?p(`Esta guía sale de la comprobación del ${when}. Si cambiaste algo después, comprueba el proyecto otra vez.`,'subtle'):null);
}
function recovery(s){const stages=s.capabilities?.environment?['base','context','activation']:['base','context'];const labels={base:'tus elecciones',context:'la lectura de archivos',activation:'la activación de OpenSpec'};const interrupted=stages.filter(k=>k==='activation'?s.engineering.activationInterrupted:(k==='base'?s.base.base:s.context.context)==='interrupted');return el('details',{},el('summary',{text:'Continuar o deshacer una operación'}),el('p',{class:'subtle'},'Continúa una operación que quedó a medias o deshaz el último cambio de una etapa. Es la ',term('recuperacion'),': se comprueban los archivos antes de tocar nada, y una edición posterior puede impedirlo.'),
  ...interrupted.map(stage=>btn(`Continuar ${labels[stage]}`,async()=>{await call('recover',{id:state.project.id,stage,action:'resume'});await showWorkspace();})),
  actions(...[...stages].reverse().map(stage=>btn(`Deshacer ${labels[stage]}`,()=>{
    openDialog('Deshacer esta etapa',[p('Esto deshace la última operación registrada de esta etapa. Lo que no pertenece a ella se conserva. Si hay cambios posteriores, se detiene para protegerlos.'),actions(btn('Conservar',async()=>closeDialog()),btn('Deshacer etapa',async()=>{await call('recover',{id:state.project.id,stage,action:'rollback'});closeDialog();await showWorkspace();},'danger'))]);
  },'quiet'))));}

export function overviewView(s,guide,guideError){
  const offered=new Set((guide?.steps??[]).map(step=>step.action).filter(Boolean));
  const once=(id,cls)=>offered.has(id)?null:doBtn(id,cls);
  const saved=s.base.selection??s.project.selection;
  const normalized=saved?canonicalProfile(saved):null;
  const profile=normalized?profileInfo(normalized.profile):null;
  const focus=profile?.focuses?.find(item=>item.id===normalized.focus);
  const managedProject={...s.project,selection:saved,mappedProfile:normalized?.profile,mappedFocus:normalized?.focus};
  const management=el('section',{class:'panel project-management','aria-labelledby':'project-preparation-title'},
    el('h2',{id:'project-preparation-title',text:'Preparación de Companion'}),
    saved?el('dl',{class:'preparation-choices'},
      el('div',{},el('dt',{text:'Tipo de proyecto'}),el('dd',{text:profile?.label??'Por confirmar'})),
      focus?el('div',{},el('dt',{text:'Enfoque'}),el('dd',{text:focus.label})):null,
      el('div',{},el('dt',{text:'IA elegidas'}),el('dd',{text:(saved.agents??[]).map(id=>agents[id]??id).join(' · ')||'Ninguna guardada'})))
      :p('No hay elecciones guardadas para esta carpeta.'),
    p('Revisa la preparación guardada o reutilízala en otra carpeta. Quitar el proyecto de la lista no cambia sus archivos.','subtle'),
    actions(saved?once('resave-base','secondary'):null,rowBtn('duplicate-project',managedProject,'secondary'),rowBtn('forget-project',s.project,'quiet')));
  return [management,
    ...[s.base.error,s.context.error,s.engineering.error,s.environment?.error,s.code?.error].filter(Boolean).map(e=>panel(el('h3',{text:e.message}),p(e.action))),
    recovery(s),guidePanel(guide,guideError),
    el('details',{class:'project-check-details'},el('summary',{text:'Detalles de la preparación y herramientas'}),
    el('div',{class:'status-grid'},statusCard('Tus elecciones',s.base.base==='prepared'&&s.base.inventory!=='stale',s.base.inventory==='stale'?'La carpeta cambió desde la primera mirada, así que este resumen ya no la describe. Vuelve a guardar tus elecciones para actualizarlo.':'El tipo de trabajo y las IA que elegiste.'),
      statusCard('Archivos leídos',s.context.context==='current',s.context.context==='current'?`${s.context.sources} archivos. ${s.context.coverage==='partial'?'Hay materiales fuera o con lectura pendiente.':'Cada respuesta puede decir de dónde salió.'}`:'Lee o actualiza tus archivos antes de buscar.'),
      statusCard('Desarrollo',s.engineering.files==='not-requested'?'not-requested':s.engineering.workflows==='verified',s.engineering.files==='not-requested'?'Este tipo de proyecto no necesita un proceso de software.':s.engineering.workflows==='verified'?'Herramientas e instrucciones comprobadas.':s.engineering.files==='prepared'?'Instrucciones listas; falta comprobar que OpenSpec responde.':'Hay requisitos o conflictos por resolver.')),
    // What this project can do, once. An action the guidance is already offering as a pending step is not
    // repeated here: one control per action per screen, because two controls for the same thing read as two
    // different things to do. The journey harness found exactly that collision.
    panel(el('h2',{text:'Herramientas de este proyecto'}),el('p',{},s.context.context==='current'?'Busca algo en tus archivos, mira una ':'Lee tus archivos para empezar a trabajar con ellos. Después habrá ',term('receta'),s.context.context==='current'?' o sigue en tu IA.':' que te ayuden a pedir un resultado concreto.'),
      isEngineeringProfile(s.base.selection?.profile)?el('p',{class:'subtle'},'Este proyecto también usa ',term('openspec'),' y el ',term('ingenieria'),'.'):null,
      actions(once('read-files','primary'),isEngineeringProfile(s.base.selection?.profile)?once('review-development'):null)),
    s.capabilities?.codeGraph&&isEngineeringProfile(s.base.selection?.profile)?panel(el('h2',{text:`Mapa de código · ${{'not-prepared':'No preparado',empty:'Vacío',verified:'Verificado',stale:'Desactualizado',corrupt:'Corrupto','requires-repair':'Requiere reparación','requires-action':'Requiere reparación'}[s.code?.status]??'Por revisar'}`}),
      el('p',{},'Un ',term('mapa-de-codigo'),'. ',s.code?.status==='verified'?`${s.code.symbols} símbolos y ${s.code.relations} relaciones comprobados con tus archivos actuales.`:s.code?.message??'Localiza funciones y clases antes de cambiar el proyecto. Puedes añadirlo cuando tengas código.'),
      actions(once('review-code-map'),s.code?.status==='verified'?btn('Buscar símbolos',async()=>{state.tab='search';await showWorkspace(false);}):null,
        doBtn('repair-tools'))):null,
    stackPanel(s),
    // Named only where they exist: a document or a creative project has no OpenSpec and no code map, and
    // putting those words on its screen would be jargon with nothing behind it.
    isEngineeringProfile(s.base.selection?.profile)
      ?el('p',{class:'subtle'},'Que un archivo de configuración exista no demuestra que la herramienta funcione. ',term('openspec'),', el ',term('mapa-de-codigo'),' y tu IA se comprueban cada uno por su lado.')
      :p('Que un archivo exista no demuestra que la herramienta funcione. Tu IA se comprueba por su lado.','subtle'),
    ),
  ];
}
