import { $, profiles, isEngineeringProfile, agents, onDate, state, el, p, btn, doBtn, own, ownHeading, actions, panel, term, field, input, select, steps, notice, error, call, run, render, openDialog, closeDialog} from '../lib/core.mjs';
import {showProjects, stackPanel} from '../lib/bridge.mjs';
async function openProject(id){state.status=await call('openProject',{id});state.project=state.status.project;state.selection={...state.selection,...state.project.selection};state.tab='overview';await showWorkspace(false);}
async function forget(project){openDialog('Quitar de la lista',[
  el('p',{},'Se quita ',own(project.name),' de esta lista. Los archivos de la carpeta se quedan donde están.'),actions(btn('Conservar',async()=>closeDialog()),btn('Quitar de la lista',async()=>{await call('forgetProject',{id:project.id});closeDialog();await showProjects();},'danger'))]);}
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
  if(!guide)return panel(el('h2',{text:'Cómo trabajar en este proyecto'}),
    p(failure?.message??'Todavía no se pudo preparar esta guía.'),p(failure?.action??'Comprueba el proyecto para prepararla.','subtle'));
  const when=onDate(guide.checkedAt),drawn=new Set();
  return panel(el('h2',{text:'Cómo trabajar en este proyecto'}),
    p(guide.pending.length?'Primero lo que falta, en el orden en que se puede hacer. Después, las formas de trabajar que tiene este tipo de proyecto.'
      :'Nada quedó pendiente. Estas son las formas de trabajar que tiene este tipo de proyecto.'),
    guide.terms.length?el('p',{class:'subtle'},'Qué significan estas palabras: ',...guide.terms.flatMap((id,index)=>index?[', ',term(id)]:[term(id)]),'.'):null,
    el('ol',{class:'guide'},guide.steps.map(step=>{
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
          :repeated?p('Se resuelve con el control del paso anterior.','subtle'):actions(doBtn(step.action)));})),
    when?p(`Esta guía sale de la comprobación del ${when}. Si cambiaste algo después, comprueba el proyecto otra vez.`,'subtle'):null);
}
async function showWorkspace(refresh=true){state.page='workspace';if(refresh)state.status=await call('status',{id:state.project.id});const s=state.status;
  state.stacks=state.stacks??await call('stackCatalog');
  // A guidance that cannot be composed must not take the project screen down with it, so the cause is shown
  // in its own panel instead of replacing the screen with an error.
  let guide=null,guideError=null;
  if(state.tab==='overview')try{guide=await call('guide',{id:state.project.id});}catch(failure){guideError=failure;}
  const offered=new Set((guide?.steps??[]).map(step=>step.action).filter(Boolean));
  const once=(id,cls)=>offered.has(id)?null:doBtn(id,cls);
  const content=[el('p',{class:'eyebrow',text:profiles[s.base.selection?.profile]?.[0]??'TU PROYECTO'}),...ownHeading(s.project.name,s.project.selection?.goal??'Comprueba cómo está y elige tu siguiente paso.',!!s.project.selection?.goal),own(s.project.root,'p',{class:'path'}),
    el('div',{class:'tool-tabs','aria-label':'Herramientas del proyecto'},Object.entries({overview:'Estado',search:'Buscar en mis archivos',recipes:'Recetas',handoff:'Continuar con mi IA'}).map(([id,label])=>{
      const b=btn(label,async()=>{state.tab=id;await showWorkspace(false);},'');b.setAttribute('aria-pressed',String(state.tab===id));return b;})),
    // One of those tabs is named with a word of this vocabulary, so its definition has to be openable from
    // every tab and not only from the one that explains it. The stricter reading of the vocabulary rule found
    // this: the word used to hide in the seam between two adjacent tab labels.
    el('p',{class:'subtle tab-note'},'Cada ',term('receta'),' es un recorrido corto para pedir un resultado concreto y comprobarlo.'),
  ];
  if(state.tab==='overview')content.push(
    el('div',{class:'status-grid'},statusCard('Tus elecciones',s.base.base==='prepared'&&s.base.inventory!=='stale',s.base.inventory==='stale'?'La carpeta cambió desde la primera mirada, así que este resumen ya no la describe. Vuelve a guardar tus elecciones para actualizarlo.':'El tipo de trabajo y las IA que elegiste.'),
      statusCard('Archivos leídos',s.context.context==='current',s.context.context==='current'?`${s.context.sources} archivos. ${s.context.coverage==='partial'?'Hay materiales fuera o con lectura pendiente.':'Cada respuesta puede decir de dónde salió.'}`:'Lee o actualiza tus archivos antes de buscar.'),
      statusCard('Desarrollo',s.engineering.files==='not-requested'?'not-requested':s.engineering.workflows==='verified',s.engineering.files==='not-requested'?'Este tipo de proyecto no necesita un proceso de software.':s.engineering.workflows==='verified'?'Herramientas e instrucciones comprobadas.':s.engineering.files==='prepared'?'Instrucciones listas; falta comprobar que OpenSpec responde.':'Hay requisitos o conflictos por resolver.')),
    guidePanel(guide,guideError),
    // What this project can do, once. An action the guidance is already offering as a pending step is not
    // repeated here: one control per action per screen, because two controls for the same thing read as two
    // different things to do. The journey harness found exactly that collision.
    panel(el('h2',{text:'Herramientas de este proyecto'}),el('p',{},s.context.context==='current'?'Busca algo en tus archivos, mira una ':'Lee tus archivos para empezar a trabajar con ellos. Después habrá ',term('receta'),s.context.context==='current'?' o sigue en tu IA.':' que te ayuden a pedir un resultado concreto.'),
      isEngineeringProfile(s.base.selection?.profile)?el('p',{class:'subtle'},'Este proyecto también usa ',term('openspec'),' y el ',term('ingenieria'),'.'):null,
      actions(once('read-files','primary'),doBtn('recheck-project'),isEngineeringProfile(s.base.selection?.profile)?once('review-development'):null)),
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
    ...[s.base.error,s.context.error,s.engineering.error,s.environment?.error,s.code?.error].filter(Boolean).map(e=>panel(el('h3',{text:e.message}),p(e.action))),recovery(s),
  );
  if(state.tab==='search'){content.push(searchView());if(s.code?.status==='verified')content.push(codeSearchView());}
  if(state.tab==='recipes'){
    const w=await call('workspace',{id:state.project.id});content.push(el('p',{class:'subtle'},'Cada ',term('receta'),' es un recorrido corto para pedir un resultado concreto y comprobarlo. El ',term('presupuesto'),' se expresa en bytes, no en ',term('token','tokens'),'.'),
      ...w.recipes.map(r=>el('article',{class:'recipe'},el('h2',{text:r.title}),p(`Necesitas: ${r.inputs.join(' · ')}`,'muted'),el('ol',{},r.steps.map(step=>el('li',{text:step}))),el('details',{},el('summary',{text:'Cómo comprobar el resultado'}),el('ul',{},r.validation.map(v=>el('li',{text:v}))),p(r.stop),p(`Presupuesto inicial: ${r.budget.contextBytes} bytes; ${r.budget.attempts} intentos antes de replantear.`,'subtle')))),
      panel(el('h2',{text:'Palabras que aparecen en estas recetas'}),el('p',{},'Estas recetas están escritas para que tu IA las siga, así que usan su vocabulario: ',
        ...['sdd','openspec','deuda','revision-adversarial','cita','fuente','contexto','inventario','ingenieria','exclusion','perfil','firma','recuperacion','mapa-de-codigo','agente'].flatMap((id,i)=>i?[', ',term(id)]:[term(id)]),'.')),
      panel(el('h2',{text:'Herramientas de relaciones entre archivos'}),p('El mapa de código de esta aplicación y los índices externos tienen estados separados. Cambiar a otra alternativa necesita revisar antes sus requisitos, su licencia y que funcione.'),...w.graphs.options.map(g=>p(`${g.id} · ${g.license} · ${g.presence==='artifact-present'?'Se encontró un índice externo sin comprobar':'Índice externo no comprobado'}.`,'subtle'))));
  }
  if(state.tab==='handoff')content.push(await handoffView(s));
  render(content,'TU PROYECTO / '+({overview:'ESTADO',search:'ARCHIVOS',recipes:'RECETAS',handoff:'TU IA'}[state.tab]));
}
function recovery(s){const stages=s.capabilities?.environment?['base','context','activation']:['base','context'];const labels={base:'tus elecciones',context:'la lectura de archivos',activation:'la activación de OpenSpec'};const interrupted=stages.filter(k=>k==='activation'?s.engineering.activationInterrupted:(k==='base'?s.base.base:s.context.context)==='interrupted');return el('details',{},el('summary',{text:'Continuar o deshacer una operación'}),el('p',{class:'subtle'},'Continúa una operación que quedó a medias o deshaz el último cambio de una etapa. Es la ',term('recuperacion'),': se comprueban los archivos antes de tocar nada, y una edición posterior puede impedirlo.'),
  ...interrupted.map(stage=>btn(`Continuar ${labels[stage]}`,async()=>{await call('recover',{id:state.project.id,stage,action:'resume'});await showWorkspace();})),
  actions(...[...stages].reverse().map(stage=>btn(`Deshacer ${labels[stage]}`,()=>{
    openDialog('Deshacer esta etapa',[p('Esto deshace la última operación registrada de esta etapa. Lo que no pertenece a ella se conserva. Si hay cambios posteriores, se detiene para protegerlos.'),actions(btn('Conservar',async()=>closeDialog()),btn('Deshacer etapa',async()=>{await call('recover',{id:state.project.id,stage,action:'rollback'});closeDialog();await showWorkspace();},'danger'))]);
  },'quiet'))));}
function searchView(){const results=el('div',{id:'search-results','aria-live':'polite'}),search=input('query',state.query,500,v=>state.query=v);
  const form=el('form',{onSubmit:e=>{e.preventDefault();void run(async()=>{const r=await call('search',{id:state.project.id,query:state.query});results.replaceChildren(p(r.note,'subtle'),...r.hits.map(h=>el('article',{class:'result'},p(`${h.path} · ${{line:'línea',page:'página',paragraph:'párrafo'}[h.kind]} ${h.start}`,'citation'),el('pre',{text:h.text}))));});}},
    el('div',{class:'search-line'},field('¿Qué necesitas encontrar?','query',search,'Busca palabras concretas del contenido, por ejemplo: método de evaluación.'),el('button',{type:'submit',class:'primary',text:'Buscar'})));
  return el('section',{},el('p',{class:'subtle'},'La búsqueda encuentra coincidencias en los archivos que se leyeron, y cada resultado trae su ',term('cita'),': el archivo y el lugar exacto. Solo una ',term('fuente'),' puede citarse. Lee el fragmento para decidir si respalda tu respuesta.'),form,actions(btn('Preparar un texto para pegar en tu chat',()=>previewExport(),'secondary')),results);
}
async function previewExport(){const e=await call('exportPreview',{id:state.project.id,query:state.query,maxBytes:12000});openDialog('Revisa antes de copiar',[
  p(`${e.bytes.toLocaleString('es')} bytes · ${e.included} fragmentos incluidos · ${e.omitted} omitidos.`,'subtle'),p('Este texto sigue en tu equipo. Si lo copias, podrás pegarlo en tu chat; revisa antes los datos personales y las condiciones de ese servicio.'),
  el('pre',{text:e.text,tabindex:'0','aria-label':'Texto que se copiará'}),actions(btn('Cerrar',async()=>closeDialog()),btn('Copiar este texto',async()=>{await call('copyExport',{export:e.id});notice('Texto copiado. Todavía no se ha enviado a ninguna IA.');closeDialog();},'primary'))]);}
function codeSearchView(){const results=el('div',{'aria-live':'polite'}),query=input('symbol-query','',500,()=>{});
  return panel(el('h2',{text:'Buscar funciones y clases'}),el('p',{class:'subtle'},'Consulta el ',term('mapa-de-codigo'),'. Los archivos originales se vuelven a comprobar antes de mostrar resultados.'),
    el('form',{onSubmit:e=>{e.preventDefault();void run(async()=>{const result=await call('searchCode',{id:state.project.id,query:query.value});results.replaceChildren(p(result.note,'subtle'),
      ...result.hits.map(h=>el('article',{class:'result'},el('h3',{text:h.name}),p(`${h.path} · líneas ${h.start}–${h.end}`,'citation'),p(h.kind,'subtle'))));});}},
      el('div',{class:'search-line'},field('Nombre del símbolo','symbol-query',query,'Por ejemplo: calculateBudget o PlayerController.'),el('button',{type:'submit',class:'primary',text:'Buscar en el mapa'}))),results);
}
// Which model writes the instructions, what it receives and what it never receives, said where the
// instructions are offered rather than in a settings screen nobody opens. The level that leaves this machine
// ships off: free tiers commonly train on what they receive, and nobody can accept that on someone else's
// behalf.
function modelPanel(status,prompt){
  const refresh=async()=>{state.inference=await call('inferenceStatus');await showWorkspace(false);};
  const set=async patch=>{await call('setInference',{level:status.level,provider:status.provider,model:status.model,key:null,...patch});await refresh();};
  const chosen=id=>id===status.level;
  return panel(el('h2',{text:'Quién escribe estas instrucciones'}),
    el('p',{},`Ahora mismo: ${prompt.levelLabel}.`,prompt.reason?` ${prompt.reason.charAt(0).toUpperCase()}${prompt.reason.slice(1)}.`:''),
    el('p',{class:'subtle'},'La plantilla de esta aplicación es el piso. Un modelo solo puede reemplazarla si lo que devuelve trae las secciones completas, habla de este proyecto y no afirma nada que aquí no se afirme.'),
    el('div',{class:'levels'},status.levels.map(level=>{
      const unavailable=level.id==='local'&&!status.local.available;
      const control=el('button',{type:'button',class:chosen(level.id)?'secondary chosen':'quiet',
        'aria-pressed':String(chosen(level.id)),disabled:unavailable||undefined,
        onClick:()=>run(()=>set({level:level.id}))},level.label);
      return el('div',{class:'level'},control,
        level.id==='local'?el('small',{text:status.local.available
          ?`Hay ${status.local.models.length} modelo(s) respondiendo en tu equipo.`
          :'No hay ningún modelo respondiendo en tu equipo ahora mismo.'}):null,
        level.id==='provider'?el('small',{text:'Viene apagado. Se enciende con tu clave, y la clave no se guarda: vive solo mientras la aplicación está abierta.'}):null);})),
    ['provider','own-key'].includes(status.level)?el('div',{class:'fields'},
      field('Proveedor','inference-provider',select('inference-provider',Object.fromEntries(status.providers.map(entry=>[entry.id,entry.label])),status.provider,value=>run(()=>set({provider:value})))),
      // The list of models the provider serves, when the person has asked for it. Until then, and if the
      // provider does not answer, the free-text field stays — it is the way out, not the default. Typing an
      // exact identifier by hand was what the level asked for while `local` got a list, and the route that
      // fills this had been declared and never called since the level was built.
      el('div',{class:'field'},el('label',{for:'inference-model',text:'Modelo'}),
        state.providerModels?.provider===status.provider&&state.providerModels.models.length
          ?select('inference-model',Object.fromEntries([['','Elige un modelo'],...state.providerModels.models.map(id=>[id,id])]),
            state.providerModels.models.includes(status.model)?status.model:'',
            value=>run(()=>set({model:value})))
          :el('input',{type:'text',id:'inference-model',maxlength:'120',value:status.model,autocomplete:'off',
            onChange:e=>run(()=>set({model:e.target.value}))}),
        el('small',{text:state.providerModels?.provider===status.provider&&state.providerModels.models.length
          ?'De lo que tu proveedor dice que sirve. Se guarda al elegirlo.'
          :'El identificador exacto que usa tu proveedor. Se guarda al salir del campo.'}))):null,
    ['provider','own-key'].includes(status.level)?actions(btn('Buscar los modelos de mi proveedor',async()=>{
      const found=await call('providerModels');
      state.providerModels=found;
      notice(found.models.length
        ?`Tu proveedor dice que sirve ${found.models.length} ${found.models.length===1?'modelo':'modelos'}. Elige uno de la lista.`
        :`No se pudo traer la lista: ${found.reason??'el proveedor no respondió'}. Puedes escribir el identificador a mano.`);
      await refresh();})):null,
    status.level==='local'&&status.local.available?field('Modelo','inference-model',
      select('inference-model',Object.fromEntries(status.local.models.map(id=>[id,id])),status.model||status.local.models[0],value=>run(()=>set({model:value}))),
      'La primera respuesta puede tardar mientras tu equipo carga el modelo. Puedes detenerla.'):null,
    ['provider','own-key'].includes(status.level)?el('div',{class:'field'},
      el('label',{for:'inference-key',text:'Tu clave'}),
      el('input',{type:'password',id:'inference-key',autocomplete:'off',spellcheck:'false',
        onChange:e=>run(async()=>{await call('setInference',{level:status.level,provider:status.provider,model:status.model,key:e.target.value});await refresh();})}),
      el('small',{text:'No se guarda en ninguna parte. Si cierras la aplicación, se pide de nuevo. La emite tu proveedor desde su propio sitio; esta aplicación no la pide por ti ni la almacena.'})):null,
    el('div',{class:'sends'},
      el('div',{},el('h3',{text:'Qué se envía'}),el('ul',{},status.sends.map(item=>el('li',{text:item}))),
        el('small',{},'Tu ',term('perfil'),' es el tipo de trabajo que elegiste, no quién eres.')),
      el('div',{},el('h3',{text:'Qué nunca se envía'}),el('ul',{},status.neverSends.map(item=>el('li',{text:item}))))),
    status.level==='off'?p('Con esto apagado la aplicación está completa: las instrucciones las escribe la plantilla, aquí, sin enviar nada a ninguna parte.','subtle'):null);
}
// Deeper without reading: the person's own AI already has access to that folder, so it investigates and they
// paste the summary back. This application still opens nothing.
function investigationPanel(){
  const stored=state.notes??null;
  return panel(el('h2',{text:'Pídele a tu IA que investigue tu carpeta'}),
    p('Esta aplicación no abre tus archivos para escribir estas instrucciones. Si quieres que sean más específicas, dale este texto a la IA que ya usas y pega aquí lo que te conteste.'),
    stored?el('pre',{class:'prompt',text:stored}):null,
    actions(btn('Ver el texto para tu IA',async()=>{
      const value=await call('investigationPrompt',{id:state.project.id});
      openDialog('Para tu IA',[p('Pégale esto a la IA que ya usas. Responde con una descripción, no con el contenido de tus archivos.'),
        el('pre',{text:value.text,tabindex:'0','aria-label':'Texto para tu IA'}),
        el('div',{class:'field'},el('label',{for:'notes',text:'Lo que te contestó'}),
          el('textarea',{id:'notes',rows:'6',placeholder:'Pega aquí la respuesta'}),
          el('small',{text:'Se usa para escribir tus instrucciones y no sale de este equipo, ni siquiera hacia un modelo.'})),
        actions(btn('Volver',async()=>closeDialog()),btn('Guardar lo que me contestó',async()=>{
          const value=$('notes').value;await call('applyNotes',{id:state.project.id,notes:value});
          state.notes=value.trim()||null;closeDialog();await showWorkspace(false);
          notice(state.notes?'Guardado. Tus instrucciones ahora lo incluyen.':'Se quitó lo que habías pegado.');},'primary'))]);
    })));
}
async function handoffView(s){
  state.inference=state.inference??await call('inferenceStatus');
  const prompt=await call('promptPreview',{id:state.project.id});
  state.notes=prompt.notes??null;
  return el('section',{},panel(el('h2',{text:'Las instrucciones para tu IA sobre este proyecto'}),
      el('p',{},'Están escritas a partir de lo que elegiste y de cuántos archivos de cada tipo hay en la carpeta. Ningún archivo se abrió para escribirlas.'),
      prompt.fromModel?el('p',{class:'subtle'},`Parte de este texto lo escribió ${prompt.levelLabel.toLowerCase()} a partir de tus respuestas. Las reglas del final son de esta aplicación y van siempre, escriba quien escriba el resto.`):null,
      el('pre',{class:'prompt',text:prompt.text,tabindex:'0','aria-label':'Instrucciones para tu IA'}),
      prompt.pending.length?p('Las instrucciones dicen además qué etapas de este proyecto no están listas, para que tu IA no las dé por hechas.','subtle'):null),
    modelPanel(state.inference,prompt),
    investigationPanel(),
    panel(el('h2',{text:'Sigue en la herramienta que ya usas.'}),el('p',{},'Si tu IA está instalada en el equipo, se abre con la carpeta de este proyecto. Si es un chat en el navegador, busca y copia solo los fragmentos que quieras compartir. La diferencia es qué es una ',term('agente','IA con acceso a archivos'),'.'),
    el('p',{class:'subtle'},'Solo se abre una aplicación cuya ',term('firma'),' se pudo comprobar. Abrir la carpeta no demuestra que la IA la haya leído.'),
    actions(...(s.base.selection?.agents??[]).map(a=>btn(`Continuar con ${agents[a]}`,async()=>{
      const preview=await call('handoffPreview',{id:state.project.id,agent:a});
      const local=preview.mode==='local',manual=preview.mode==='manual';
      const open=async copy=>{const result=await call('handoff',{preview:preview.id,copy});closeDialog();
        notice(result.opened==='local'?`Se pidió abrir la carpeta en ${result.application}. No se ha comprobado que la IA la haya leído.${copy?' Instrucción copiada.':''}`
          :result.opened==='web'?'Sitio abierto e instrucción copiada. Revisa los datos antes de pegarlos o adjuntar documentos en tu chat.'
          :`No se abrió nada: ábrela tú y pega la instrucción.${copy?' Ya está copiada.':''}`);};
      // Three modes, decided by what the person chose. A desktop choice that cannot be opened ends here, with the
      // text copied and the reason said — never at a web address, which is what this screen used to promise.
      openDialog(`Continuar con ${agents[a]}`,[p(local?`Se pedirá abrir esta carpeta en ${preview.destination}, cuya firma se comprobó. Abrir no envía una instrucción ni confirma que la IA haya leído el proyecto.`
          :manual?`${agents[a]} es una aplicación de este equipo, así que ábrela tú y pega la instrucción. No se abrirá ningún sitio web: elegiste una aplicación de escritorio.`
          :`Se abrirá ${preview.destination} en tu navegador. La instrucción se copia al portapapeles; tus documentos no se envían solos.`),
        // One sentence per check that can fail, and then the launcher's own words about this application. The
        // first version of this screen dropped `unverified.message` — the specific, true sentence the previous
        // release already showed — and replaced it with a generic one deduced from whether a publisher happened
        // to be attached. An independent review found three cases where that generic sentence was false.
        manual?p(preview.causeMessage+(preview.unverified?.publisherVerified?` Su editor es ${preview.unverified.publisher}.`:''),'subtle'):null,
        manual&&preview.unverified?.message?p(preview.unverified.message,'subtle'):null,
        el('pre',{text:preview.prompt,tabindex:'0','aria-label':'Instrucción inicial'}),
        actions(btn('Volver',async()=>closeDialog()),local?btn('Abrir aplicación con esta carpeta',()=>open(false),'primary'):null,
          btn(manual?'Copiar instrucción':'Copiar instrucción y abrir',()=>open(true),local?'secondary':'primary'))]);
    })))))
}

export {openProject, forget, statusCard, guidePanel, showWorkspace, recovery, searchView, previewExport, codeSearchView, modelPanel, investigationPanel, handoffView};
