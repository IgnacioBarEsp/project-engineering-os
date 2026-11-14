import {$,agents,state,el,p,btn,actions,panel,term,field,select,notice,call,run,openDialog,closeDialog} from '../lib/core.mjs';
import {showWorkspace} from '../lib/bridge.mjs';
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
export async function handoffView(s){
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
    actions(...(s.base.selection?.agents??[]).map(a=>btn(`Abrir en ${agents[a]}`,async()=>{
      const preview=await call('handoffPreview',{id:state.project.id,agent:a});
      const local=preview.mode==='local',manual=preview.mode==='manual';
      const open=async copy=>{const result=await call('handoff',{preview:preview.id,copy});closeDialog();
        notice(result.opened==='local'?`Se pidió abrir la carpeta en ${result.application}. No se ha comprobado que la IA la haya leído.${copy?' Instrucción copiada.':''}`
          :result.opened==='web'?'Sitio abierto e instrucción copiada. Revisa los datos antes de pegarlos o adjuntar documentos en tu chat.'
          :`No se abrió nada: ábrela tú y pega la instrucción.${copy?' Ya está copiada.':''}`);};
      // Three modes, decided by what the person chose. A desktop choice that cannot be opened ends here, with the
      // text copied and the reason said — never at a web address, which is what this screen used to promise.
      openDialog(`Continuar con ${agents[a]}`,[p(local?`Se pedirá abrir esta carpeta en ${preview.destination}, cuya firma se comprobó. Abrir no envía una instrucción ni confirma que la IA haya leído el proyecto.`
          :manual&&preview.cause==='route-only'?'Esta IA tiene instrucciones para tu carpeta, pero no una apertura comprobada desde aquí. Abre tu IA y pega la instrucción. No se abrirá ningún sitio web.'
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
