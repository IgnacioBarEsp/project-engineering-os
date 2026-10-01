import {profiles, agents, state, el, p, btn, doBtn, heading, own, actions, wizardBar, panel, term, field, steps, notice, error, call, render, openDialog, closeDialog} from '../lib/core.mjs';
import {showFolder, showWorkspace} from '../lib/bridge.mjs';
function changes(files){return el('details',{},el('summary',{text:`Ver archivos previstos (${files.length})`}),el('ul',{class:'file-list'},files.map(f=>el('li',{text:`${{create:'Añadir',update:'Actualizar',remove:'Retirar',unchanged:'Conservar',adopt:'Conservar original',preserve:'Conservar',noop:'Sin cambios'}[f.action]??f.action} · ${f.path}`}))));}
function showBaseReview(){state.page='base-review';const s=state.selection;
  render([steps(2),...heading('Esto es lo que se va a escribir.','Primero se guardan tus elecciones y la lista de lo que hay en la carpeta. Después revisas qué archivos se leen y qué instrucciones recibe tu IA.'),
    panel(el('dl',{class:'review-grid'},[['Proyecto',s.name,true],['Tipo de trabajo',profiles[s.profile][0],false],['Tu objetivo',s.goal,true],['Tu IA',s.agents.map(a=>agents[a]).join(', '),false]].flatMap(([k,v,fromPerson])=>[el('div',{},el('dt',{text:k}),fromPerson?own(v,'dd'):el('dd',{text:v}))])),own(state.project.root,'p',{class:'path'}),changes(state.plan.files)),
    el('p',{class:'subtle'},'Uno de esos archivos es el ',term('inventario'),': la lista de lo que se encontró, con su tipo y su tamaño, y los archivos que no se pudieron leer con su motivo. No guarda el contenido completo.'),
    p('Tus archivos originales no se modifican. Se guarda un registro para poder comprobar cambios y deshacer una operación que quede a medias.','subtle'),
  ],'PREPARAR PROYECTO / REVISIÓN',wizardBar(btn('Volver',()=>showFolder()),btn('Guardar esta preparación  →',async()=>{const r=await call('applyBase',{plan:state.plan.id});state.status=r.status;state.project={...state.project,...r.status.project};
      // What the person answered about technology is asked here, once the selection is recorded and the folder
      // has been looked at, because a recommendation is only honest after both. With nothing to offer this step
      // does not exist, and the project screen is where the reason is said instead.
      const after=async()=>{if(['software','unity'].includes(s.profile))await reviewEngineering();else await prepareContext();};
      await reviewStack(after);},'primary')));}
// Technology, in the three ways the person could have answered. `items` empty is not an error and not a gap: it
// is the third answer, and it comes with the sentence that says why installing nothing is right. Nothing here
// writes anything; installing is a second, separate act, and so is refusing.
async function reviewStack(next){state.plan=await call('previewStack',{id:state.project.id});
  if(!state.plan.items.length){await next();return;}
  showStackReview(next);}
function showStackReview(next){state.page='stack-review';const plan=state.plan;
  const recommended=plan.kind==='recommended',canInstall=state.status?.capabilities?.environment!==false;
  render([...heading(recommended?'Esto es lo que tu proyecto parece necesitar.':'Esto es lo que pediste instalar.',
      'Nada se instala hasta que lo apruebes. Puedes decir que no y seguir con la preparación igual.'),
    panel(p(plan.because),...plan.items.map(item=>el('article',{},el('h2',{text:item.name}),p(item.purpose),
      p(`${item.closure} ${item.closure===1?'paquete':'paquetes'} · ${item.licenses.join(', ')} · ${downloadSize(item.downloadBytes)} de descarga · ${downloadSize(item.installedBytes)} instalados`),
      el('p',{class:'subtle'},'Directos: ',item.packages.map(pkg=>`${pkg.name} ${pkg.version} (${pkg.license})`).join(', ')),
      el('p',{class:'path',text:item.destination}),
      item.status==='verified'?p('Ya está instalada y comprobada en esta carpeta.','subtle'):null))),
    p('Queda dentro de la carpeta que administra esta aplicación. Tu package.json no se toca y tus archivos no se modifican.','subtle'),
    notOfferedPanel(plan.notOffered),
    // Installing needs the managed engine. Offering the control without it hands the person an error on click,
    // so when it is not there the screen says what is missing instead of pretending the control works.
    canInstall?null:p('Para instalar algo de esto hacen falta las herramientas de este proyecto, que todavía no están preparadas.','subtle'),
    actions(btn(recommended?'No instalar nada de esto':'Volver',async()=>{
      if(recommended&&plan.id){state.status=(await call('declineStack',{plan:plan.id})).status;notice('Registrado: no se instaló ninguna tecnología.');}
      await next();}),
      plan.id&&canInstall?btn('Instalar lo revisado',async()=>{const r=await call('applyStack',{plan:plan.id});state.status=r.status;
        notice(`Instalado: ${r.results.map(item=>item.id).join(', ')}. Está en la carpeta de la aplicación, no en tu package.json.`);await next();},'primary'):null),
  ],'TU PROYECTO / TECNOLOGÍA');}
function notOfferedPanel(items){if(!items?.length)return null;
  return el('details',{},el('summary',{text:`Lo que no se instala desde aquí (${items.length})`}),
    el('div',{},items.map(item=>el('article',{},el('h3',{text:item.name}),p(`Viene de ${item.from}.`),p(item.reason,'subtle')))));}
// What the record says, without re-measuring anything: this panel is rendered from the project's state, so it
// reports what was installed or refused and when, and says so in those words.
function stackPanel(s){const unreadable=!s.stack?.installed;
  const record=unreadable?null:{installed:s.stack.installed,declined:s.stack.declined};
  const decision=s.project.selection?.stack?.decision??'too-early';
  const day=value=>String(value).slice(0,10);
  return panel(el('h2',{text:'Tecnología de este proyecto'}),
    record?.installed.length?el('ul',{},record.installed.map(item=>el('li',{text:`${stackName(s,item.id)} · instalada el ${day(item.at)}`}))):null,
    record?.declined.length?el('ul',{class:'subtle'},record.declined.map(item=>el('li',{text:`${stackName(s,item.id)} · dijiste que no el ${day(item.at)}`}))):null,
    // A record that could not be read says nothing about what is installed. The first version fell through to
    // "todavía no hay ninguna tecnología instalada", which is the one claim it had no way to make: an
    // independent review corrupted the record with a technology on disk and read that sentence back.
    unreadable?p('No se pudo leer el registro de tecnologías de este proyecto, así que esta pantalla no puede decir qué hay instalado.'):null,
    unreadable&&s.stack?.error?.message?p(s.stack.error.message,'subtle'):null,
    unreadable&&s.stack?.error?.action?p(s.stack.error.action,'subtle'):null,
    !unreadable&&!record.installed.length&&decision==='too-early'?p('Dijiste que todavía es pronto para elegir tecnología, así que no se instaló ninguna. Eso es correcto: un proyecto puede estar listo sin haber elegido una, y puedes decidirlo cuando lo pida.'):null,
    !unreadable&&!record.installed.length&&decision!=='too-early'?p('Todavía no hay ninguna tecnología instalada en este proyecto.'):null,
    actions(doBtn('review-stack'),...(record?.installed??[]).map(item=>btn(`Retirar ${stackName(s,item.id)}`,async()=>{
      const withdrawn=await call('removeStack',{id:s.project.id,stack:item.id});state.status=withdrawn.status;
      notice(withdrawn.removal==='removed'?'Se retiró: el árbol seguía coincidiendo con lo revisado.':'No había nada que retirar de esa tecnología.');await showWorkspace(false);}))));}
const stackName=(s,id)=>state.stacks?.stacks.find(entry=>entry.id===id)?.name??id;
async function reviewEngineering(){
  if(state.status?.capabilities?.environment&&state.status.environment?.status!=='prepared'){
    state.plan=await call('previewEnvironment',{id:state.project.id});showEnvironmentReview();
  }else{state.plan=await call('previewEngineering',{id:state.project.id});showEngineeringReview();}
}
const downloadSize=bytes=>`${(bytes/(1024*1024)).toLocaleString('es',{maximumFractionDigits:1})} MiB`;
async function reviewRepair(){state.page='repair-review';state.plan=await call('previewRepair',{id:state.project.id});const plan=state.plan;
  render([steps(),...heading('Recuperemos tus herramientas.','Se comprueban otra vez la ubicación y el registro de cada herramienta antes de reemplazar su copia.'),
    panel(p(plan.message),...(plan.items??[]).map(item=>el('article',{},el('h2',{text:item.name}),p(`${downloadSize(item.downloadBytes)} de descarga · ${downloadSize(item.replacedBytes)} por reemplazar`),own(item.destination,'p',{class:'path'})))),
    ...(plan.blocked??[]).map(item=>panel(el('h2',{text:item.tool}),p(item.message),p(item.action))),
    p('Tus proyectos y los índices que ya usabas se conservan. Una carpeta sin registro válido se deja como está para que la revises; no se borra sola.','subtle'),
    actions(doBtn('open-workspace'),plan.id?btn('Reparar herramientas revisadas',async()=>{state.status=(await call('applyRepair',{plan:plan.id})).status;await showWorkspace(false);},'primary'):null)],'TU PROYECTO / REPARACIÓN');}
function showEnvironmentReview(){state.page='environment-review';const plan=state.plan,allowed=plan.status==='planned';
  render([steps(2),...heading('Tus herramientas, listas en este equipo.','Se descargan las herramientas con las que se programa y se conservan las dependencias que tu proyecto ya tenía. Revisa esta instalación antes de continuar.'),
    allowed?panel(el('span',{class:'tag',text:plan.downloadBytes?`Descarga prevista: ${downloadSize(plan.downloadBytes)}`:'Ya están en este equipo y comprobadas'}),
      ...(plan.tools??[]).map(tool=>el('article',{class:'recipe'},el('h2',{text:tool.name}),p(tool.purpose),p(tool.status==='verified'?'Lista para reutilizar':tool.downloadBytes?`${downloadSize(tool.downloadBytes)} de descarga`:'Incluida en la aplicación','subtle'),
        el('details',{},el('summary',{text:'Versión, licencia y ubicación'}),p(`${tool.version} · ${tool.license}`),own(tool.source,'p',{class:'path'}),own(tool.destination,'p',{class:'path'})))),
      el('p',{},term('openspec',`OpenSpec ${plan.engineering.openspec}`),` y Project Engineering OS ${plan.engineering.core}: ${downloadSize(plan.engineering.downloadBytes)} de descarga.`),
      p(plan.git==='initialize-local'?'Se creará un historial de versiones local para este proyecto.':'Se conservará el historial de versiones que este proyecto ya tiene.'),changes(plan.files)):
      panel(el('h2',{text:plan.message??'Las herramientas necesitan atención'}),p(plan.action??'Revísalas antes de volver a intentarlo.')),
    el('p',{class:'subtle'},'Esto es el ',term('ingenieria'),'. Sirve para varios proyectos y se queda en este equipo; cerrar la aplicación no lo elimina.'),
  ],'PREPARAR PROYECTO / HERRAMIENTAS',wizardBar(doBtn('open-workspace'),doBtn('read-files'),allowed?btn('Preparar herramientas y continuar  →',async()=>{
      state.status=(await call('applyEnvironment',{plan:plan.id})).status;
      state.plan=await call('previewEngineering',{id:state.project.id});showEngineeringReview();
    },'primary'):doBtn('repair-tools')));}
function showEngineeringReview(){state.page='engineering-review';const plan=state.plan,allowed=plan.status==='planned';
  const operations=plan.plan?.operations??[];
  render([steps(2),...heading('Un proceso claro para desarrollar.','Se añaden instrucciones para tu IA, un lugar donde escribir qué va a cambiar y comprobaciones. Que funcionen se comprueba en el paso siguiente, no aquí.'),
    panel(el('span',{class:`tag ${allowed?'':'pending'}`,text:allowed?'Hay un plan listo para revisar':'Necesita atención'}),p(plan.message??(allowed?'Revisa los archivos antes de continuar.':'La carpeta tiene conflictos que hay que resolver antes.')),
      plan.action?p(plan.action,'subtle'):null,plan.incompleteTransaction?p('Hay una operación a medias. Continuar comprueba primero su registro y después completa los archivos que faltan.'):null,changes(operations.map(o=>({path:o.target,action:o.operation})))),
    plan.preservedOriginals?.length?p(`Estos archivos tuyos se conservan sin modificar: ${plan.preservedOriginals.join(', ')}.`):null,
    el('p',{class:'subtle'},'Si falta Git o hay conflictos en las instrucciones, se te dice cómo resolverlo. Mientras tanto puedes leer tus archivos, y estas instrucciones incluyen las ',term('receta','recetas'),' de tu tipo de proyecto.'),
  ],'PREPARAR PROYECTO / DESARROLLO',wizardBar(doBtn('open-workspace'),allowed?btn(plan.incompleteTransaction?'Continuar lo que quedó a medias  →':'Guardar estas instrucciones  →',async()=>{const r=await call('applyEngineering',{plan:plan.id});state.status=r.status;
      if(state.status.capabilities?.environment){state.plan=await call('previewActivation',{id:state.project.id});showActivationReview();}else await prepareContext();},'primary'):null,
      plan.incompleteTransaction?btn('Deshacer la operación a medias',()=>openDialog('Deshacer esta operación',[p('Se deshace la operación a medias que acabas de revisar. Antes se comprueba si editaste esos archivos después, para no perder tu edición.'),actions(btn('Conservar',async()=>closeDialog()),btn('Deshacer operación',async()=>{state.status=(await call('rollbackEngineering',{plan:plan.id})).status;closeDialog();await showWorkspace();},'danger'))]),'quiet'):doBtn('read-files')));}
function showActivationReview(){state.page='activation-review';const plan=state.plan;
  render([steps(2),...heading('Un método de trabajo para tu IA.','Se instalan los recorridos oficiales que ordenan cada cambio: primero qué se espera, después el código, al final la revisión.'),
    plan.status==='planned'?panel(el('span',{class:'tag',text:'OpenSpec 1.6.0, comprobado en una carpeta de prueba'}),el('p',{},'Se aplican esos recorridos y se conectan las herramientas. Después se comprueba que ',term('openspec'),' responde de verdad en tu proyecto. Ese método se llama ',term('sdd'),'.'),changes(plan.files)):
      panel(el('h2',{text:plan.message??'Hay instrucciones que necesitan revisión'}),p(plan.action),plan.conflicts?el('ul',{class:'file-list'},plan.conflicts.map(f=>el('li',{text:f}))):null),
  ],'PREPARAR PROYECTO / MÉTODO',wizardBar(doBtn('open-workspace'),doBtn('read-files'),plan.status==='planned'?btn('Activar y continuar  →',async()=>{
      state.status=(await call('applyActivation',{plan:plan.id})).status;await prepareContext();
    },'primary'):null));}
async function prepareContext(exclude){state.plan=await call('previewContext',{id:state.project.id,...(exclude===undefined?{}:{exclude})});showContextReview();}
function showContextReview(){state.page='context-review';const plan=state.plan,c=plan.coverage;
  const exclusion=el('textarea',{id:'exclusions',rows:3,placeholder:'carpeta-privada\nnotas-personales.txt'});
  exclusion.value=(plan.exclude??[]).join('\n');
  render([steps(3),...heading('Tus archivos, leídos y ubicables.','Al buscar, encontrarás el fragmento y el archivo, la página o el párrafo de donde salió. Revisa qué se pudo leer y qué no.'),
    panel(el('span',{class:`tag ${c.complete?'':'pending'}`,text:c.complete?'Se pudo leer todo lo previsto':'Hay archivos o partes pendientes'}),
      p(`${c.sources.length} archivos · ${c.chunks} fragmentos · ${c.textBytes.toLocaleString('es')} bytes de texto`),
      el('p',{class:'subtle'},'Cada archivo que entra aquí queda como una ',term('fuente'),', y solo una fuente puede aparecer en una ',term('cita'),'.'),
      el('details',{},el('summary',{text:'Ver qué se leyó de cada archivo'}),el('ul',{class:'file-list'},c.sources.map(s=>el('li',{text:`${s.path} · ${s.status??'inspeccionado'}${s.issues?.length?' · '+s.issues.map(i=>i.reason).join(', '):''}`})))),
      p(`${c.excluded} elementos dejados fuera. ${c.limitations.length} límites o advertencias al leer.`,'subtle'),
      c.managedInstructions?.length?el('details',{},el('summary',{text:`${c.managedInstructions.length} archivos de instrucciones generados quedan fuera de esta búsqueda`}),p('Los escribió la preparación para desarrollo y tu IA ya los recibe por su propia ruta. Si aquí aparece un archivo tuyo, revisa la preparación antes de continuar.','subtle'),el('ul',{class:'file-list'},c.managedInstructions.map(path=>el('li',{text:path})))):null,changes(plan.files)),
    el('details',{},el('summary',{text:'Dejar materiales fuera'}),el('p',{class:'subtle'},'Cada línea que escribas aquí es una ',term('exclusion'),'.'),field('Una ruta relativa por línea','exclusions',exclusion,'No incluyas letras de unidad ni rutas de otras carpetas.'),btn('Revisar con estas exclusiones',()=>prepareContext(exclusion.value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean)))),
    p('Los PDF escaneados, las imágenes y otros formatos sin texto necesitan otra herramienta. No se presentan como documentos leídos.','subtle'),
  ],'PREPARAR PROYECTO / ARCHIVOS',wizardBar(doBtn('open-workspace'),btn('Guardar y continuar  →',async()=>{
      const r=await call('applyContext',{plan:plan.id});state.status=r.status;
      if(plan.agentStatus==='canonical-planned-sync-required'){
        state.plan=await call('previewSync',{id:state.project.id});showSyncReview();
      }else await showWorkspace();
    },'primary')));}
function showSyncReview(){state.page='sync-review';const plan=state.plan;
  render([...heading('Conectemos lo leído con las instrucciones.','Las instrucciones de tu IA se rehacen a partir de lo que acabas de aprobar. Después se actualiza el resumen para incluir esos cambios.'),
    panel(changes((plan.plan?.operations??[]).map(o=>({path:o.target,action:o.operation}))),plan.message?p(plan.message):null),
    actions(doBtn('open-workspace'),plan.status==='planned'?btn('Actualizar las instrucciones',async()=>{
      const r=await call('applyEngineering',{plan:plan.id});state.status=r.status;
      state.plan=await call('previewContext',{id:state.project.id});showFinalContext();
    },'primary'):null)],'PREPARAR PROYECTO / INSTRUCCIONES');}
function showFinalContext(){state.page='context-final';const plan=state.plan;render([steps(),...heading('Una última pasada al resumen.','Las instrucciones ya están actualizadas. Guarda el resumen para que las búsquedas usen los archivos vigentes.'),panel(p(`${plan.coverage.sources.length} archivos · ${plan.coverage.chunks} fragmentos. ${plan.coverage.complete?'Se pudo leer todo lo previsto.':'Hay partes pendientes.'}`),p(`Se dejó fuera: ${plan.exclude?.join(', ')||'nada'}.`,'subtle'),changes(plan.files)),actions(btn('Guardar y ver mi proyecto',async()=>{state.status=(await call('applyContext',{plan:plan.id})).status;await showWorkspace();},'primary'))],'PREPARAR PROYECTO / ÚLTIMA PASADA');}
async function reviewCode(){state.plan=await call('previewCode',{id:state.project.id});showCodeReview();}
function showCodeReview(){state.page='code-review';const plan=state.plan,allowed=plan.status==='planned';
  render([...heading('Encuentra las piezas de tu código.','Un índice opcional de funciones, clases y cómo se relacionan. Sirve para localizar el archivo correcto antes de proponer un cambio.'),
    allowed?panel(el('span',{class:'tag',text:'CodeGraph 1.6.0 · MIT'}),p(`${plan.coverage.sources.length} archivos revisados · ${downloadSize(plan.bytes)} de código · ${downloadSize(plan.downloadBytes)} de descarga.`),
      p('Se analizan copias locales. Tus archivos y cualquier índice que ya uses se conservan.'),
      el('details',{},el('summary',{text:'Ver herramientas y archivos'}),...plan.tools.map(t=>el('div',{},p(`${t.name} · ${t.version} · ${t.license}`),own(t.source,'p',{class:'path'}),own(t.destination,'p',{class:'path'}))),
        el('ul',{class:'file-list'},plan.coverage.sources.map(f=>el('li',{text:f.path})))),changes(plan.files)):
      panel(el('h2',{text:plan.message??'El mapa necesita atención'}),p(plan.action??'La búsqueda en tus documentos sigue disponible.')),
    plan.coverage?.omitted.length?p(`${plan.coverage.omitted.length} archivos de código quedan fuera por exclusiones, formato, contenido sensible o límites.`,'subtle'):null,
    el('p',{class:'subtle'},'Esto es el ',term('mapa-de-codigo'),', y se comprueba con una consulta real. Sus relaciones son aproximaciones: tu IA tiene que leer las líneas originales y verificar cada cambio. No se instalan modelos.'),
    actions(doBtn('open-workspace'),allowed?btn('Crear mapa de código',async()=>{state.status=(await call('applyCode',{plan:plan.id})).status;await showWorkspace(false);},'primary'):null)
  ],'TU PROYECTO / MAPA DE CÓDIGO');}
// The answers of THIS project against THIS folder, reviewed like any other preparation. Not the wizard:
// starting it would leave the project and clear the answers, which is what an independent review found when
// it followed the guidance's own first step.
async function resaveBase(){const s=state.selection;
  state.plan=await call('previewBase',{id:state.project.id,selection:{name:s.name,goal:s.goal,role:s.role,
    profile:s.profile,experience:s.experience,agents:s.agents,stack:s.stack}});
  showBaseReview();}

export {changes, showBaseReview, reviewStack, showStackReview, notOfferedPanel, stackPanel, stackName, reviewEngineering, downloadSize, reviewRepair, showEnvironmentReview, showEngineeringReview, showActivationReview, prepareContext, showContextReview, showSyncReview, showFinalContext, reviewCode, showCodeReview, resaveBase};
