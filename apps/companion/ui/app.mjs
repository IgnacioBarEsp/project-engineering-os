const api=window.companion;
const $=id=>document.getElementById(id);
const profiles={research:['Investigación','Artículos, PDF, documentos y evidencia.'],software:['Software o página web','Código, especificaciones y pruebas.'],unity:['Videojuego con Unity','Escenas, scripts y un proceso de desarrollo.'],media:['Contenido creativo','Imágenes, música, video y sus workflows.'],general:['Otro proyecto','Materiales de trabajo, ideas y tareas cotidianas.']};
const agents={codex:'Codex','claude-code':'Claude','cursor':'Cursor','github-copilot':'GitHub Copilot',opencode:'OpenCode',antigravity:'Antigravity',web:'ChatGPT u otro chat web'};
const roles={researcher:'Investigador/a',student:'Estudiante',developer:'Desarrollador/a o área de TI',freelancer:'Freelancer',creator:'Creador/a de contenido',general:'Usuario/a general'};
const state={page:'home',tab:'overview',busy:false,projects:[],project:null,plan:null,status:null,query:'',selection:{name:'',goal:'',role:'researcher',profile:'research',experience:'guided',agents:['web']}};
function el(tag,props={},...children){const node=document.createElement(tag);for(const [k,v] of Object.entries(props)){if(k==='class')node.className=v;else if(k==='text')node.textContent=v;else if(k.startsWith('on'))node.addEventListener(k.slice(2).toLowerCase(),v);else if(v!==false&&v!==undefined&&v!==null)node.setAttribute(k,v===true?'':v);}for(const c of children.flat(Infinity)){if(c!==null&&c!==undefined)node.append(c instanceof Node?c:document.createTextNode(String(c)));}return node;}
const p=(text,cls='')=>el('p',{class:cls,text});
const btn=(text,action,cls='secondary')=>el('button',{type:'button',class:cls,onClick:()=>run(action)},text);
const heading=(title,description)=>[el('h1',{tabindex:'-1',text:title}),p(description,'intro')];
const actions=(...buttons)=>el('div',{class:'actions'},buttons);
const panel=(...content)=>el('section',{class:'panel'},content);
function field(label,id,node,hint){return el('div',{class:'field'},el('label',{for:id,text:label}),node,hint?el('small',{text:hint}):null);}
function input(id,value,max,change){const n=el('input',{type:'text',id,maxlength:max,required:true,value,onInput:e=>change(e.target.value)});return n;}
function select(id,options,value,change){const n=el('select',{id,onChange:e=>change(e.target.value)},Object.entries(options).map(([v,label])=>el('option',{value:v,text:label})));n.value=value;return n;}
function steps(current){return el('ol',{class:'steps','aria-label':'Preparación'},['Tu proyecto','Carpeta','Preparación','Contexto'].map((s,i)=>el('li',{'aria-current':i===current?'step':null},el('span',{text:String(i+1).padStart(2,'0')}),s)));}
function notice(message){$('notice').textContent=message;}
function error(value){if($('dialog').open)closeDialog();$('feedback').replaceChildren(el('strong',{text:value.message??'No se pudo completar la acción.'}),p(value.action??'Vuelve a intentarlo.'),el('small',{text:value.code??''}));$('feedback').hidden=false;$('feedback').scrollIntoView({block:'nearest'});}
function setBusy(value){state.busy=value;document.querySelectorAll('button,input,textarea,select').forEach(n=>{if(!['cancel','close-dialog'].includes(n.id))n.disabled=value;});$('content').setAttribute('aria-busy',String(value));}
async function call(name,input={}){const r=await api[name](input);if(!r.ok)throw r.error;return r.value;}
let actionOrigin=null;
async function run(fn){if(state.busy)return;actionOrigin=document.activeElement;$('feedback').hidden=true;notice('');setBusy(true);try{await fn();}catch(e){error(e);}finally{setBusy(false);}}
function render(content,breadcrumb){$('view').replaceChildren(el('div',{class:'enter'},content));$('breadcrumb').textContent=breadcrumb;$('feedback').hidden=true;setBusy(state.busy);const h=$('view').querySelector('h1');h?.focus({preventScroll:true});window.scrollTo(0,0);}
async function home(){state.page='home';state.projects=await call('listProjects');render([
  el('p',{class:'eyebrow',text:'MENOS PREPARACIÓN. MÁS CLARIDAD.'}),
  el('h1',{class:'hero-title',tabindex:'-1'},'Dale a tu IA',el('br'),el('em',{},'un buen punto de partida.')),
  p('Organiza el contexto de tu proyecto y continúa en la IA que ya usas. Con guía, fuentes a la mano y un siguiente paso claro.','intro'),
  actions(btn('Preparar mi proyecto  ↗',()=>{state.project=null;showSetup();},'primary')),
  el('div',{class:'feature-row'},[
    ['01','Elige tu carpeta','Usa materiales que ya tienes o comienza con una carpeta nueva.'],
    ['02','Revisa lo que cambia','Conoce los archivos que se añadirán antes de preparar el proyecto.'],
    ['03','Continúa con tu IA','Consulta fuentes y comparte solo el contexto que necesites.'],
  ].map(([num,title,body])=>el('div',{},el('b',{text:num}),el('h3',{text:title}),p(body)))),
  el('div',{class:'section-heading'},el('h2',{text:'Tus proyectos'}),el('span',{class:'tag',text:`${state.projects.length} en este equipo`})),
  state.projects.length?state.projects.map(project=>el('article',{class:'project'},el('div',{},el('h3',{text:project.name}),p(project.root,'path')),el('div',{class:'project-actions'},btn('Abrir →',()=>openProject(project.id),'quiet'),btn('Quitar del historial',()=>forget(project),'quiet')))):
    p('Aquí aparecerán las carpetas que prepares. Puedes volver a ellas cuando quieras.','empty'),
], 'TU ESPACIO DE TRABAJO');}
function showSetup(){state.page='setup';const s=state.selection;
  const types=el('fieldset',{},el('legend',{text:'¿Qué vas a hacer?'}),el('div',{class:'choices'},Object.entries(profiles).map(([id,[label,hint]])=>{
    const radio=el('input',{type:'radio',name:'profile',value:id,checked:s.profile===id,onChange:()=>{s.profile=id;}});
    return el('label',{class:'choice'},radio,el('span',{},el('strong',{text:label}),el('small',{text:hint})));})));
  const ai=el('fieldset',{},el('legend',{text:'¿Con qué IA quieres trabajar?'}),el('div',{class:'choices'},Object.entries(agents).map(([id,label])=>el('label',{class:'choice'},el('input',{type:'checkbox',name:'agent',value:id,checked:s.agents.includes(id),onChange:e=>{s.agents=e.target.checked?[...s.agents,id]:s.agents.filter(a=>a!==id);}}),el('span',{},el('strong',{text:label}))))),el('small',{text:'Puedes elegir varias. No necesitas conectar cuentas ni entregar claves.'}));
  const form=el('form',{onSubmit:e=>{e.preventDefault();void run(async()=>{if(!s.agents.length)throw{message:'Elige al menos una IA.',action:'Marca la que usas habitualmente.'};showFolder();});}},
    el('div',{class:'fields'},field('Nombre de tu proyecto','name',input('name',s.name,100,v=>s.name=v),'Por ejemplo: Evidencia para mi tesis'),field('¿Con qué perfil te identificas?','role',select('role',roles,s.role,v=>s.role=v))),
    field('¿Qué quieres lograr?','goal',input('goal',s.goal,500,v=>s.goal=v),'Un objetivo concreto ayuda a tu IA a empezar con dirección.'),types,ai,
    field('¿Cuánta guía prefieres?','experience',select('experience',{guided:'Paso a paso, con explicaciones',familiar:'Conozco las herramientas de IA'},s.experience,v=>s.experience=v)),
    actions(btn('Volver',home),el('button',{type:'submit',class:'primary',text:'Elegir carpeta  →'})));
  render([steps(0),...heading('Empecemos por lo que quieres lograr.','La preparación se adapta a tu trabajo. Puedes usar una IA de escritorio o compartir contexto con un chat web.'),form],'NUEVO PROYECTO / TU OBJETIVO');
}
function showFolder(){state.page='folder';const chosen=state.project;
  render([steps(1),...heading('Tu trabajo empieza en una carpeta.','Elige únicamente los materiales del proyecto. Si empiezas desde cero, crea una carpeta en el selector.'),
    el('div',{class:'folder-card'},el('h3',{text:chosen?chosen.name:'¿Dónde está tu proyecto?'}),p(chosen?chosen.root:'Puede contener código, documentos, PDF o tus materiales de trabajo.','path'),actions(btn(chosen?'Cambiar carpeta':'Buscar carpeta en este equipo',async()=>{const result=await call('chooseFolder');if(result){state.project=result;showFolder();}},'primary'))),
    chosen?panel(el('h3',{text:'Una primera mirada'}),p(`${chosen.inspection?.files.length??0} archivos dentro del alcance de inspección.`),p(`Tipo detectado: ${profiles[chosen.inspection?.recommendation]?.[0]??'por confirmar'}. Se usará tu elección: ${profiles[state.selection.profile][0]}.`,'subtle'),btn('Revisar estado o recuperar',()=>showWorkspace(),'quiet')):null,
    p('Los documentos se procesan en este equipo. No se envían a ninguna IA durante la preparación. Puedes excluir fuentes al revisar el contexto.','subtle'),
    actions(btn('Volver',()=>showSetup()),chosen?btn('Revisar preparación  →',async()=>{state.plan=await call('previewBase',{id:chosen.id,selection:state.selection});showBaseReview();},'primary'):null),
  ],'NUEVO PROYECTO / CARPETA');}
function changes(files){return el('details',{},el('summary',{text:`Ver archivos previstos (${files.length})`}),el('ul',{class:'file-list'},files.map(f=>el('li',{text:`${{create:'Añadir',update:'Actualizar',remove:'Retirar',unchanged:'Conservar',adopt:'Conservar original',preserve:'Conservar',noop:'Sin cambios'}[f.action]??f.action} · ${f.path}`}))));}
function showBaseReview(){state.page='base-review';const s=state.selection;
  render([steps(2),...heading('Esto es lo que vamos a preparar.','Primero guardaremos la configuración y el mapa inicial. Después revisarás las fuentes y las instrucciones para tu IA.'),
    panel(el('dl',{class:'review-grid'},[['Proyecto',s.name],['Tipo de trabajo',profiles[s.profile][0]],['Tu objetivo',s.goal],['Tu IA',s.agents.map(a=>agents[a]).join(', ')]].flatMap(([k,v])=>[el('div',{},el('dt',{text:k}),el('dd',{text:v}))])),p(state.project.root,'path'),changes(state.plan.files)),
    p('Tus archivos originales se conservan. La preparación guarda un registro para comprobar cambios y recuperar operaciones interrumpidas.','subtle'),
    actions(btn('Volver',()=>showFolder()),btn('Preparar proyecto  →',async()=>{const r=await call('applyBase',{plan:state.plan.id});state.status=r.status;state.project={...state.project,...r.status.project};
      if(['software','unity'].includes(s.profile))await reviewEngineering();else await prepareContext();},'primary')),
  ],'NUEVO PROYECTO / REVISIÓN');}
async function reviewEngineering(){
  if(state.status?.capabilities?.environment&&state.status.environment?.status!=='prepared'){
    state.plan=await call('previewEnvironment',{id:state.project.id});showEnvironmentReview();
  }else{state.plan=await call('previewEngineering',{id:state.project.id});showEngineeringReview();}
}
const downloadSize=bytes=>`${(bytes/(1024*1024)).toLocaleString('es',{maximumFractionDigits:1})} MiB`;
async function reviewRepair(){state.plan=await call('previewRepair',{id:state.project.id});const plan=state.plan;
  render([...heading('Recuperemos tus herramientas.','Se comprobarán otra vez la ubicación y el recibo antes de reemplazar cada cache administrado.'),
    panel(p(plan.message),...(plan.items??[]).map(item=>el('article',{},el('h2',{text:item.name}),p(`${downloadSize(item.downloadBytes)} de descarga · ${downloadSize(item.replacedBytes)} por reemplazar`),p(item.destination,'path')))),
    ...(plan.blocked??[]).map(item=>panel(el('h2',{text:item.tool}),p(item.message),p(item.action))),
    p('Tus proyectos y los índices externos se conservan. Una carpeta sin recibo válido requiere revisión manual; no se borra automáticamente.','subtle'),
    actions(btn('Volver al estado',()=>showWorkspace()),plan.id?btn('Reparar caches revisados',async()=>{state.status=(await call('applyRepair',{plan:plan.id})).status;await showWorkspace(false);},'primary'):null)],'TU PROYECTO / REPARACIÓN');}
function showEnvironmentReview(){state.page='environment-review';const plan=state.plan,allowed=plan.status==='planned';
  render([steps(2),...heading('Tus herramientas, listas en este equipo.','Companion prepara las herramientas de desarrollo y conserva las dependencias de tu producto. Revisa esta instalación antes de continuar.'),
    allowed?panel(el('span',{class:'tag',text:plan.downloadBytes?`Descarga prevista: ${downloadSize(plan.downloadBytes)}`:'Herramientas verificadas disponibles en este equipo'}),
      ...(plan.tools??[]).map(tool=>el('article',{class:'recipe'},el('h3',{text:tool.name}),p(tool.purpose),p(tool.status==='verified'?'Lista para reutilizar':tool.downloadBytes?`${downloadSize(tool.downloadBytes)} de descarga`:'Incluida en Companion','subtle'),
        el('details',{},el('summary',{text:'Versión, licencia y ubicación'}),p(`${tool.version} · ${tool.license}`),p(tool.source,'path'),p(tool.destination,'path')))),
      p(`OpenSpec ${plan.engineering.openspec} y Project Engineering OS ${plan.engineering.core}: ${downloadSize(plan.engineering.downloadBytes)} de descarga para las dependencias de ingeniería.`),
      p(plan.git==='initialize-local'?'Se creará un historial local para este proyecto.':'Se conservará el historial existente de este proyecto.'),changes(plan.files)):
      panel(el('h2',{text:plan.message??'El entorno necesita atención'}),p(plan.action??'Revisa las herramientas antes de volver a intentarlo.')),
    p('Puedes usar estas herramientas en varios proyectos. Sus archivos permanecen en este equipo; cerrar Companion no los elimina.','subtle'),
    actions(btn('Ver estado',()=>showWorkspace()),btn('Preparar solo el contexto',()=>prepareContext()),allowed?btn('Preparar herramientas y continuar  →',async()=>{
      state.status=(await call('applyEnvironment',{plan:plan.id})).status;
      state.plan=await call('previewEngineering',{id:state.project.id});showEngineeringReview();
    },'primary'):btn('Revisar reparación de herramientas',()=>reviewRepair())),
  ],'PREPARACIÓN / HERRAMIENTAS');}
function showEngineeringReview(){state.page='engineering-review';const plan=state.plan,allowed=plan.status==='planned';
  const operations=plan.plan?.operations??[];
  render([steps(2),...heading('Un proceso claro para desarrollar.','El entorno de ingeniería añade instrucciones, especificaciones y verificaciones. Su activación se comprueba por separado.'),
    panel(el('span',{class:`tag ${allowed?'':'pending'}`,text:allowed?'Plan disponible':'Necesita atención'}),p(plan.message??(allowed?'Revisa los archivos del entorno antes de continuar.':'La carpeta tiene conflictos que debemos resolver antes de preparar el entorno.')),
      plan.action?p(plan.action,'subtle'):null,plan.incompleteTransaction?p('Hay una operación interrumpida. Continuar verificará su registro antes de completar los archivos pendientes.'):null,changes(operations.map(o=>({path:o.target,action:o.operation})))),
    plan.preservedOriginals?.length?p(`Se conservarán sin modificar estos archivos existentes: ${plan.preservedOriginals.join(', ')}.`):null,
    p('Si falta Git o hay conflictos en las instrucciones del entorno, se indicará cómo resolverlos. Puedes preparar el contexto mientras tanto.','subtle'),
    actions(btn('Ver estado del proyecto',()=>showWorkspace()),allowed?btn(plan.incompleteTransaction?'Continuar entorno  →':'Aplicar entorno  →',async()=>{const r=await call('applyEngineering',{plan:plan.id});state.status=r.status;
      if(state.status.capabilities?.environment){state.plan=await call('previewActivation',{id:state.project.id});showActivationReview();}else await prepareContext();},'primary'):null,
      plan.incompleteTransaction?btn('Deshacer operación interrumpida',()=>openDialog('Recuperar ingeniería',[p('Se deshará la operación de ingeniería interrumpida que acabas de revisar. Se comprobarán las ediciones posteriores antes de cambiar archivos.'),actions(btn('Conservar',async()=>closeDialog()),btn('Deshacer operación',async()=>{state.status=(await call('rollbackEngineering',{plan:plan.id})).status;closeDialog();await showWorkspace();},'danger'))]),'quiet'):btn('Preparar solo el contexto',async()=>{await prepareContext();})),
  ],'PREPARACIÓN / ENTORNO DE DESARROLLO');}
function showActivationReview(){state.page='activation-review';const plan=state.plan;
  render([steps(2),...heading('Un método de trabajo para tu IA.','Los workflows oficiales de OpenSpec organizan la propuesta, las especificaciones, la implementación y la revisión de cada cambio.'),
    plan.status==='planned'?panel(el('span',{class:'tag',text:'OpenSpec 1.6.0 comprobado en una carpeta de prueba'}),p('Aplicaremos los workflows revisados y conectaremos las herramientas aisladas. Después comprobaremos que tu proyecto quedó listo.'),changes(plan.files)):
      panel(el('h2',{text:plan.message??'Hay instrucciones que necesitan revisión'}),p(plan.action),plan.conflicts?el('ul',{class:'file-list'},plan.conflicts.map(f=>el('li',{text:f}))):null),
    actions(btn('Ver estado',()=>showWorkspace()),btn('Preparar solo el contexto',()=>prepareContext()),plan.status==='planned'?btn('Activar y continuar  →',async()=>{
      state.status=(await call('applyActivation',{plan:plan.id})).status;await prepareContext();
    },'primary'):null)],'PREPARACIÓN / MÉTODO DE TRABAJO');}
async function prepareContext(exclude){state.plan=await call('previewContext',{id:state.project.id,...(exclude===undefined?{}:{exclude})});showContextReview();}
function showContextReview(){state.page='context-review';const plan=state.plan,c=plan.coverage;
  const exclusion=el('textarea',{id:'exclusions',rows:3,placeholder:'carpeta-privada\nnotas-personales.txt'});
  exclusion.value=(plan.exclude??[]).join('\n');
  render([steps(3),...heading('Fuentes a la mano, con sus límites claros.','La búsqueda local encuentra fragmentos y conserva el archivo, la página o el párrafo de origen. Revisa qué se pudo leer.'),
    panel(el('span',{class:`tag ${c.complete?'':'pending'}`,text:c.complete?'Lectura completa dentro del alcance':'Hay fuentes o partes pendientes'}),
      p(`${c.sources.length} fuentes · ${c.chunks} fragmentos · ${c.textBytes.toLocaleString('es')} bytes de texto`),
      el('details',{},el('summary',{text:'Ver cobertura por archivo'}),el('ul',{class:'file-list'},c.sources.map(s=>el('li',{text:`${s.path} · ${s.status??'inspeccionado'}${s.issues?.length?' · '+s.issues.map(i=>i.reason).join(', '):''}`})))),
      p(`${c.excluded} elementos excluidos. ${c.limitations.length} límites o advertencias de inspección.`,'subtle'),
      c.managedInstructions?.length?el('details',{},el('summary',{text:`${c.managedInstructions.length} archivos de instrucciones generados quedan fuera de esta búsqueda`}),p('Los escribió la preparación de ingeniería y tu IA ya los recibe por su propia ruta. Si aquí aparece un archivo tuyo, revisa la preparación antes de continuar.','subtle'),el('ul',{class:'file-list'},c.managedInstructions.map(path=>el('li',{text:path})))):null,changes(plan.files)),
    el('details',{},el('summary',{text:'Excluir materiales de este contexto'}),field('Una ruta relativa por línea','exclusions',exclusion,'No incluyas letras de unidad ni rutas de otras carpetas.'),btn('Revisar con estas exclusiones',()=>prepareContext(exclusion.value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean)))),
    p('Los PDF escaneados, imágenes y otros formatos sin texto necesitan herramientas adicionales. No se presentan como documentos leídos.','subtle'),
    actions(btn('Volver al estado',()=>showWorkspace()),btn('Guardar contexto y continuar  →',async()=>{
      const r=await call('applyContext',{plan:plan.id});state.status=r.status;
      if(plan.agentStatus==='canonical-planned-sync-required'){
        state.plan=await call('previewSync',{id:state.project.id});showSyncReview();
      }else await showWorkspace();
    },'primary')),
  ],'PREPARACIÓN / CONTEXTO');}
function showSyncReview(){state.page='sync-review';const plan=state.plan;
  render([...heading('Conectemos el contexto con tus instrucciones.','El constructor sincroniza sus archivos a partir de las instrucciones revisadas. Después actualizaremos el índice para incluir esos cambios.'),
    panel(changes((plan.plan?.operations??[]).map(o=>({path:o.target,action:o.operation}))),plan.message?p(plan.message):null),
    actions(btn('Volver al estado',()=>showWorkspace()),plan.status==='planned'?btn('Sincronizar instrucciones',async()=>{
      const r=await call('applyEngineering',{plan:plan.id});state.status=r.status;
      state.plan=await call('previewContext',{id:state.project.id});showFinalContext();
    },'primary'):null)],'PREPARACIÓN / INSTRUCCIONES');}
function showFinalContext(){const plan=state.plan;render([...heading('Una última actualización del mapa.','Las instrucciones ya están sincronizadas. Guarda el índice actualizado para consultar las fuentes vigentes.'),panel(p(`${plan.coverage.sources.length} fuentes · ${plan.coverage.chunks} fragmentos. ${plan.coverage.complete?'Lectura completa dentro del alcance.':'Hay partes pendientes.'}`),p(`Exclusiones conservadas: ${plan.exclude?.join(', ')||'ninguna elegida'}.`,'subtle'),changes(plan.files)),actions(btn('Guardar y ver mi proyecto',async()=>{state.status=(await call('applyContext',{plan:plan.id})).status;await showWorkspace();},'primary'))],'PREPARACIÓN / COMPROBACIÓN FINAL');}
async function reviewCode(){state.plan=await call('previewCode',{id:state.project.id});showCodeReview();}
function showCodeReview(){state.page='code-review';const plan=state.plan,allowed=plan.status==='planned';
  render([...heading('Encuentra las piezas de tu código.','Este mapa opcional identifica funciones, clases y relaciones. Ayuda a tu IA a localizar archivos antes de proponer cambios.'),
    allowed?panel(el('span',{class:'tag',text:'CodeGraph 1.6.0 · MIT'}),p(`${plan.coverage.sources.length} archivos revisados · ${downloadSize(plan.bytes)} de código · ${downloadSize(plan.downloadBytes)} de descarga.`),
      p('Se analizarán copias locales. Se conservarán tus archivos y cualquier índice que ya uses.'),
      el('details',{},el('summary',{text:'Ver herramientas y archivos'}),...plan.tools.map(t=>el('div',{},p(`${t.name} · ${t.version} · ${t.license}`),p(t.source,'path'),p(t.destination,'path'))),
        el('ul',{class:'file-list'},plan.coverage.sources.map(f=>el('li',{text:f.path})))),changes(plan.files)):
      panel(el('h2',{text:plan.message??'El mapa necesita atención'}),p(plan.action??'La búsqueda documental sigue disponible.')),
    plan.coverage?.omitted.length?p(`${plan.coverage.omitted.length} archivos de código quedan fuera por exclusiones, formato, contenido sensible o límites.`,'subtle'):null,
    p('El mapa se comprobará con una consulta real. Sus relaciones son aproximaciones estáticas: la IA debe leer las líneas originales y verificar cada cambio. No se instalan modelos ni se activa un MCP global.','subtle'),
    actions(btn('Volver al proyecto',()=>showWorkspace()),allowed?btn('Crear mapa de código',async()=>{state.status=(await call('applyCode',{plan:plan.id})).status;await showWorkspace(false);},'primary'):null)
  ],'TU PROYECTO / MAPA DE CÓDIGO');}
async function openProject(id){state.status=await call('openProject',{id});state.project=state.status.project;state.selection={...state.selection,...state.project.selection};state.tab='overview';await showWorkspace(false);}
async function forget(project){openDialog('Quitar del historial',[
  p(`Se quitará ${project.name} de esta lista. Los archivos de la carpeta se conservarán.`),actions(btn('Conservar',async()=>closeDialog()),btn('Quitar del historial',async()=>{await call('forgetProject',{id:project.id});closeDialog();await home();},'danger'))]);}
function statusCard(title,done,detail){const label=done==='not-requested'?'No aplica':done?'Preparado':'Por revisar';return el('article',{class:'status-card'},el('span',{class:'status-icon','aria-hidden':true,text:done==='not-requested'?'—':done?'✓':'○'}),el('h3',{text:`${title} · ${label}`}),p(detail));}
async function showWorkspace(refresh=true){state.page='workspace';if(refresh)state.status=await call('status',{id:state.project.id});const s=state.status;
  const content=[el('p',{class:'eyebrow',text:profiles[s.base.selection?.profile]?.[0]??'TU PROYECTO'}),...heading(s.project.name,s.project.selection?.goal??'Comprueba el estado y elige tu siguiente paso.'),p(s.project.root,'path'),
    el('div',{class:'tool-tabs','aria-label':'Herramientas del proyecto'},Object.entries({overview:'Estado',search:'Buscar fuentes',recipes:'Recetas',handoff:'Continuar con mi IA'}).map(([id,label])=>{
      const b=btn(label,async()=>{state.tab=id;await showWorkspace(false);},'');b.setAttribute('aria-pressed',String(state.tab===id));return b;})),
  ];
  if(state.tab==='overview')content.push(
    el('div',{class:'status-grid'},statusCard('Configuración',s.base.base==='prepared',s.base.inventory==='stale'?'La carpeta cambió desde el inventario inicial.':'Tu perfil y las IA elegidas.'),
      statusCard('Contexto',s.context.context==='current',s.context.context==='current'?`${s.context.sources} fuentes. ${s.context.coverage==='partial'?'Hay materiales excluidos o con lectura pendiente.':'Consulta con citas de origen.'}`:'Prepara o actualiza las fuentes antes de buscar.'),
      statusCard('Ingeniería',s.engineering.files==='not-requested'?'not-requested':s.engineering.workflows==='verified',s.engineering.files==='not-requested'?'Este tipo de proyecto no necesita un proceso de software.':s.engineering.workflows==='verified'?'Herramientas e instrucciones comprobadas.':s.engineering.files==='prepared'?'Instrucciones listas; falta comprobar la activación de OpenSpec.':'Hay requisitos o conflictos por resolver.')),
    panel(el('h2',{text:'Tu siguiente paso'}),p(s.context.context==='current'?'Busca una fuente, consulta una receta o continúa con tu IA.':'Prepara el contexto local para empezar a trabajar con tus materiales.'),
      actions(btn(s.context.context==='current'?'Revisar fuentes de nuevo':'Preparar contexto',()=>prepareContext(),'primary'),btn('Comprobar estado',()=>showWorkspace()),['software','unity'].includes(s.base.selection?.profile)?btn('Revisar ingeniería',()=>reviewEngineering()):null)),
    s.capabilities?.codeGraph&&['software','unity'].includes(s.base.selection?.profile)?panel(el('h2',{text:`Mapa de código · ${{'not-prepared':'No preparado',empty:'Vacío',verified:'Verificado',stale:'Desactualizado',corrupt:'Corrupto','requires-repair':'Requiere reparación','requires-action':'Requiere reparación'}[s.code?.status]??'Por revisar'}`}),
      p(s.code?.status==='verified'?`${s.code.symbols} símbolos y ${s.code.relations} relaciones comprobados con tus fuentes actuales.`:s.code?.message??'Localiza funciones y clases antes de cambiar el proyecto. Puedes añadirlo cuando tengas código.'),
      actions(btn(s.code?.status==='verified'?'Actualizar mapa de código':'Revisar mapa de código',()=>reviewCode()),s.code?.status==='verified'?btn('Buscar símbolos',async()=>{state.tab='search';await showWorkspace(false);}):null,
        btn('Revisar reparación de herramientas',()=>reviewRepair()))):null,
    p('Un archivo de configuración no demuestra que una herramienta externa esté funcionando. OpenSpec, los grafos y la IA requieren una comprobación propia.','subtle'),
    ...[s.base.error,s.context.error,s.engineering.error,s.environment?.error,s.code?.error].filter(Boolean).map(e=>panel(el('h3',{text:e.message}),p(e.action))),recovery(s),
  );
  if(state.tab==='search'){content.push(searchView());if(s.code?.status==='verified')content.push(codeSearchView());}
  if(state.tab==='recipes'){
    const w=await call('workspace',{id:state.project.id});content.push(p('Recorridos breves que ayudan a pedir un resultado concreto y verificarlo. El presupuesto de contexto se expresa en bytes; no son tokens medidos.','subtle'),
      ...w.recipes.map(r=>el('article',{class:'recipe'},el('h2',{text:r.title}),p(`Necesitas: ${r.inputs.join(' · ')}`,'muted'),el('ol',{},r.steps.map(step=>el('li',{text:step}))),el('details',{},el('summary',{text:'Cómo comprobar el resultado'}),el('ul',{},r.validation.map(v=>el('li',{text:v}))),p(r.stop),p(`Presupuesto inicial: ${r.budget.contextBytes} bytes; ${r.budget.attempts} intentos antes de replantear.`,'subtle')))),
      panel(el('h3',{text:'Herramientas de relaciones entre fuentes'}),p('El mapa de código de Companion y los índices externos tienen estados separados. Las alternativas necesitan una revisión de requisitos, licencia y funcionamiento.'),...w.graphs.options.map(g=>p(`${g.id} · ${g.license} · ${g.presence==='artifact-present'?'Se encontró un índice externo sin verificar':'Índice externo no verificado'}.`,'subtle'))));
  }
  if(state.tab==='handoff')content.push(handoffView(s));
  render(content,'TU PROYECTO / '+({overview:'ESTADO',search:'FUENTES',recipes:'RECETAS',handoff:'TU IA'}[state.tab]));
}
function recovery(s){const stages=s.capabilities?.environment?['base','context','activation']:['base','context'];const labels={base:'configuración',context:'preparación de contexto',activation:'activación de OpenSpec'};const interrupted=stages.filter(k=>k==='activation'?s.engineering.activationInterrupted:(k==='base'?s.base.base:s.context.context)==='interrupted');return el('details',{},el('summary',{text:'Recuperación de operaciones'}),p('Continúa una operación interrumpida o deshaz el último cambio de una etapa. Se comprueban los archivos antes de recuperar; las ediciones posteriores pueden impedirlo.','subtle'),
  ...interrupted.map(stage=>btn(`Continuar ${labels[stage]}`,async()=>{await call('recover',{id:state.project.id,stage,action:'resume'});await showWorkspace();})),
  actions(...[...stages].reverse().map(stage=>btn(`Deshacer última ${labels[stage]}`,()=>{
    openDialog('Revisar recuperación',[p('Esto revierte la última operación registrada de esta etapa. Los originales ajenos a ella se conservan. Si hay cambios posteriores, se detendrá para protegerlos.'),actions(btn('Conservar',async()=>closeDialog()),btn('Deshacer etapa',async()=>{await call('recover',{id:state.project.id,stage,action:'rollback'});closeDialog();await showWorkspace();},'danger'))]);
  },'quiet'))));}
function searchView(){const results=el('div',{id:'search-results','aria-live':'polite'}),search=input('query',state.query,500,v=>state.query=v);
  const form=el('form',{onSubmit:e=>{e.preventDefault();void run(async()=>{const r=await call('search',{id:state.project.id,query:state.query});results.replaceChildren(p(r.note,'subtle'),...r.hits.map(h=>el('article',{class:'result'},p(`${h.path} · ${{line:'línea',page:'página',paragraph:'párrafo'}[h.kind]} ${h.start}`,'citation'),el('pre',{text:h.text}))));});}},
    el('div',{class:'search-line'},field('¿Qué necesitas encontrar?','query',search,'Busca términos concretos del contenido, por ejemplo: método de evaluación.'),el('button',{type:'submit',class:'primary',text:'Buscar'})));
  return el('section',{},p('La búsqueda encuentra coincidencias en fuentes locales. Revisa el fragmento para decidir si respalda tu respuesta.','subtle'),form,actions(btn('Preparar contexto para compartir',()=>previewExport(),'secondary')),results);
}
async function previewExport(){const e=await call('exportPreview',{id:state.project.id,query:state.query,maxBytes:12000});openDialog('Revisa antes de compartir',[
  p(`${e.bytes.toLocaleString('es')} bytes · ${e.included} extractos incluidos · ${e.omitted} omitidos.`,'subtle'),p('El contenido sigue en este equipo. Al copiarlo puedes pegarlo en tu IA; revisa los datos personales y las condiciones de ese servicio.'),
  el('pre',{text:e.text,tabindex:'0','aria-label':'Contenido que se copiará'}),actions(btn('Cerrar',async()=>closeDialog()),btn('Copiar este contexto',async()=>{await call('copyExport',{export:e.id});notice('Contexto copiado. Aún no se ha enviado a ninguna IA.');closeDialog();},'primary'))]);}
function codeSearchView(){const results=el('div',{'aria-live':'polite'}),query=input('symbol-query','',500,()=>{});
  return panel(el('h2',{text:'Buscar funciones y clases'}),p('Consulta el mapa estructural de CodeGraph. Los archivos originales se vuelven a comprobar antes de mostrar resultados.','subtle'),
    el('form',{onSubmit:e=>{e.preventDefault();void run(async()=>{const result=await call('searchCode',{id:state.project.id,query:query.value});results.replaceChildren(p(result.note,'subtle'),
      ...result.hits.map(h=>el('article',{class:'result'},el('h3',{text:h.name}),p(`${h.path} · líneas ${h.start}–${h.end}`,'citation'),p(h.kind,'subtle'))));});}},
      el('div',{class:'search-line'},field('Nombre del símbolo','symbol-query',query,'Por ejemplo: calculateBudget o PlayerController.'),el('button',{type:'submit',class:'primary',text:'Buscar en el mapa'}))),results);
}
function handoffView(s){return el('section',{},panel(el('h2',{text:'Sigue en la herramienta que ya usas.'}),p('En una aplicación con acceso a archivos, abre la carpeta de este proyecto. En un chat web, busca y copia únicamente los extractos que quieras compartir.'),
    p('Revisaremos si existe una aplicación local con firma y editor admitidos. También puedes usar una instrucción o exportación revisada; abrir una carpeta no demuestra que la IA la haya leído.','subtle'),
    actions(...(s.base.selection?.agents??[]).map(a=>btn(`Abrir ${agents[a]} ↗`,async()=>{
      const preview=await call('handoffPreview',{id:state.project.id,agent:a});
      const local=preview.mode==='local';
      const open=async copy=>{const result=await call('handoff',{preview:preview.id,copy});closeDialog();notice(result.opened==='local'?`Se solicitó abrir la carpeta en ${result.application}. No se ha comprobado que la IA la haya leído.${copy?' Instrucción copiada.':''}`:'Sitio abierto e instrucción copiada. Revisa los datos antes de pegarlos o adjuntar documentos en tu chat.');};
      openDialog(`Continuar con ${agents[a]}`,[p(local?`Se solicitará abrir esta carpeta en ${preview.destination}, cuya firma se comprobó. Abrir no envía una instrucción ni confirma que la IA haya leído el proyecto.`:`Se abrirá ${preview.destination} en tu navegador. Copiaremos esta instrucción al portapapeles; tus documentos no se enviarán automáticamente.`),
        preview.unverified?p(`${preview.unverified.label} está instalado en este equipo, pero no se pudo comprobar su firma o su editor, así que no se abrirá desde aquí. ${preview.unverified.message??''}`,'subtle'):null,
        el('pre',{text:preview.prompt,tabindex:'0','aria-label':'Instrucción inicial'}),actions(btn('Volver',async()=>closeDialog()),local?btn('Abrir aplicación con esta carpeta',()=>open(false),'primary'):null,btn('Copiar instrucción y abrir',()=>open(true),local?'secondary':'primary'))]);
    })))))
}
let dialogReturn=null;
function openDialog(title,content){dialogReturn=state.busy?actionOrigin:document.activeElement;$('dialog-title').textContent=title;$('dialog-body').replaceChildren(...content.filter(node=>node!==null&&node!==undefined));$('dialog').showModal();$('close-dialog').focus();}
function closeDialog(){$('dialog').close();}
$('dialog').addEventListener('close',()=>{if(dialogReturn?.isConnected)dialogReturn.focus();});
$('close-dialog').addEventListener('click',closeDialog);
$('home').addEventListener('click',()=>run(home));
$('new').addEventListener('click',()=>run(async()=>{state.project=null;state.selection={name:'',goal:'',role:'researcher',profile:'research',experience:'guided',agents:['web']};showSetup();}));
$('privacy').addEventListener('click',()=>openDialog('Tu carpeta, bajo tu control',[
  p('Companion prepara y consulta fuentes en este equipo. No tiene cuenta, telemetría ni envío automático de documentos. El historial local conserva rutas, nombres y tus elecciones.'),
  p('El índice contiene extractos y los registros de recuperación pueden conservar versiones anteriores de los archivos que Companion administra. Protege la carpeta igual que tus documentos originales.'),
  p('Puedes quitar proyectos del historial sin borrarlos. Las exclusiones reducen el contenido del índice; la inspección inicial puede leer nombres y texto para identificar la carpeta. La detección de secretos tiene límites.'),
  p('Compartir con un proveedor es una acción aparte. Revisa los extractos y sus condiciones antes de pegarlos. PDF escaneados, audio, video, imágenes y documentos complejos pueden necesitar una herramienta adicional.'),
  p('Las herramientas de ingeniería y el mapa de código tienen planes de descarga y comprobaciones propias. Preparar archivos no equivale a instalar modelos ni a verificar que un agente externo haya leído tu proyecto.'),
]));
$('cancel').addEventListener('click',async()=>{try{await call('cancel');$('activity-text').textContent='Deteniendo al terminar el paso seguro actual…';}catch(e){error(e);}});
document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();$('content').focus();});
api?.onProgress(value=>{$('activity').hidden=value.stage==='idle';if(value.stage!=='idle')$('activity-text').textContent=value.label+(Number.isInteger(value.completed)&&Number.isInteger(value.total)?` · ${value.completed} de ${value.total}`:'…');});
if(api)void run(home);else error({message:'No se pudo conectar con la aplicación.',action:'Cierra esta ventana y abre Project Engineering OS desde su acceso directo.'});
