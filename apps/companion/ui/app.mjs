import { GLOSSARY, byId, makeTerm } from './glossary.mjs';
const api=window.companion;
const $=id=>document.getElementById(id);
const profiles={research:['Investigación','Artículos, PDF, documentos y evidencia.'],software:['Software o página web','Código, especificaciones y pruebas.'],unity:['Videojuego con Unity','Escenas, scripts y un proceso de desarrollo.'],media:['Contenido creativo','Imágenes, música, video y sus workflows.'],general:['Otro proyecto','Materiales de trabajo, ideas y tareas cotidianas.']};
const agents={codex:'Codex','claude-code':'Claude',cursor:'Cursor','github-copilot':'GitHub Copilot',opencode:'OpenCode',antigravity:'Antigravity',web:'ChatGPT u otro chat web'};
const roles={researcher:'Investigador/a',student:'Estudiante',developer:'Desarrollador/a o área de TI',freelancer:'Freelancer',creator:'Creador/a de contenido',general:'Usuario/a general'};
// The state of a listed project comes from its records, so its label may not sound verified. "Preparado"
// is the strongest word used here; "Verificado" belongs to a check that actually read the folder again.
const projectStates={'not-prepared':['Sin preparar','Todavía no se ha escrito nada en esta carpeta.'],
  interrupted:['Quedó algo a medias','Una operación se interrumpió. Ábrelo para continuarla o deshacerla.'],
  prepared:['Carpeta preparada','Falta leer los archivos para poder buscar y citar.'],
  context:['Carpeta preparada y archivos leídos','Puedes buscar con citas y seguir en tu IA.'],
  unreadable:['No se pudo leer su registro','Puede que la carpeta cambiara de lugar. Tus archivos siguen donde están.']};
const state={page:'start',tab:'overview',busy:false,projects:[],project:null,plan:null,status:null,query:'',selection:{name:'',goal:'',role:'researcher',profile:'research',experience:'guided',agents:['web']}};
function el(tag,props={},...children){const node=document.createElement(tag);for(const [k,v] of Object.entries(props)){if(k==='class')node.className=v;else if(k==='text')node.textContent=v;else if(k.startsWith('on'))node.addEventListener(k.slice(2).toLowerCase(),v);else if(v!==false&&v!==undefined&&v!==null)node.setAttribute(k,v===true?'':v);}for(const c of children.flat(Infinity)){if(c!==null&&c!==undefined)node.append(c instanceof Node?c:document.createTextNode(String(c)));}return node;}
const p=(text,cls='')=>el('p',{class:cls,text});
const btn=(text,action,cls='secondary')=>el('button',{type:'button',class:cls,onClick:()=>run(action)},text);
// Same action, same name, wherever it is offered. The identifier is what a check can read, so the interface
// cannot drift back into two labels for one thing without the check saying so.
const doBtn=(id,text,action,cls='secondary')=>el('button',{type:'button',class:cls,'data-action':id,onClick:()=>run(action)},text);
const heading=(title,description)=>[el('h1',{tabindex:'-1',text:title}),p(description,'intro')];
const actions=(...buttons)=>el('div',{class:'actions'},buttons);
const panel=(...content)=>el('section',{class:'panel'},content);
const term=makeTerm(el,id=>showTerm(id));
function field(label,id,node,hint){return el('div',{class:'field'},el('label',{for:id,text:label}),node,hint?el('small',{text:hint}):null);}
function input(id,value,max,change){const n=el('input',{type:'text',id,maxlength:max,required:true,value,onInput:e=>change(e.target.value)});return n;}
function select(id,options,value,change){const n=el('select',{id,onChange:e=>change(e.target.value)},Object.entries(options).map(([v,label])=>el('option',{value:v,text:label})));n.value=value;return n;}
function steps(current){return el('ol',{class:'steps','aria-label':'Preparación'},['Tu proyecto','Carpeta','Preparación','Archivos'].map((s,i)=>el('li',{'aria-current':i===current?'step':null},el('span',{text:String(i+1).padStart(2,'0')}),s)));}
function notice(message){$('notice').textContent=message;}
function error(value){if($('dialog').open)closeDialog();$('feedback').replaceChildren(el('strong',{text:value.message??'No se pudo completar la acción.'}),p(value.action??'Vuelve a intentarlo.'),el('small',{text:value.code??''}));$('feedback').hidden=false;$('feedback').scrollIntoView({block:'nearest'});}
function setBusy(value){state.busy=value;document.querySelectorAll('button,input,textarea,select').forEach(n=>{if(!['cancel','close-dialog'].includes(n.id))n.disabled=value;});$('content').setAttribute('aria-busy',String(value));}
async function call(name,input={}){const r=await api[name](input);if(!r.ok)throw r.error;return r.value;}
let actionOrigin=null;
async function run(fn){if(state.busy)return;actionOrigin=document.activeElement;$('feedback').hidden=true;notice('');setBusy(true);try{await fn();}catch(e){error(e);}finally{setBusy(false);}}
function render(content,breadcrumb){$('view').replaceChildren(el('div',{class:'enter'},content));$('breadcrumb').textContent=breadcrumb;$('feedback').hidden=true;setBusy(state.busy);const h=$('view').querySelector('h1');h?.focus({preventScroll:true});window.scrollTo(0,0);}
// Inicio: what the application does, how it works, what it downloads and why, what stays here, and the one
// action that starts. Not a project list — that has its own destination and its own name.
function showStart(){state.page='start';render([
  el('p',{class:'eyebrow',text:'TODO OCURRE EN ESTE EQUIPO'}),
  el('h1',{class:'hero-title',tabindex:'-1'},'Dale a tu IA',el('br'),el('em',{},'un buen punto de partida.')),
  p('Esta aplicación lee la carpeta de tu proyecto, ordena lo que hay dentro y se lo deja listo a la IA que ya usas, para que entienda tu trabajo desde la primera pregunta.','intro'),
  actions(doBtn('prepare-project','Preparar proyecto',()=>startSetup(),'primary')),
  // The four steps are h3, so they need their own h2 above them: a page that goes from h1 straight to h3
  // reads, to anyone navigating by headings, as a level that was skipped. The previous home had the same
  // jump; the contrast and heading probe found it.
  el('h2',{class:'section-title',text:'Cómo trabaja'}),
  el('div',{class:'feature-row'},[
    ['01','Eliges tu carpeta','Los archivos que ya tienes, donde ya están. No se copian ni se mueven a otro lugar.'],
    ['02','Ves qué se va a escribir','Antes de tocar nada aparece la lista completa de archivos que se añaden a la carpeta.'],
    ['03','Se lee lo que hay dentro','Queda un resumen consultable con la ubicación exacta de cada frase, para que puedas comprobarla.'],
    ['04','Sigues en tu IA','Abres tu IA de escritorio con esta carpeta, o preparas un texto para pegar en un chat.'],
  ].map(([num,title,body])=>el('div',{},el('b',{text:num}),el('h3',{text:title}),p(body)))),
  panel(el('h2',{text:'Qué se descarga, y por qué'}),
    p('Para investigación, contenido creativo o trabajo general: nada. Todo lo necesario viene dentro de la aplicación.'),
    el('p',{},'Para software o un videojuego: Node, Git y npm, las herramientas con las que se programa, y ',
      term('openspec'),' si lo pides. Se descargan revisadas, con su huella comprobada, a una carpeta propia de la aplicación; no se instala nada en el resto de tu sistema.'),
    p('Nunca un modelo de IA ni el motor que lo ejecuta. Un modelo pesa entre 4 y 8 GB, necesita una tarjeta gráfica que quizá no tengas, y no hace falta para preparar tu proyecto: la IA la pones tú.')),
  panel(el('h2',{text:'Qué se queda en este equipo'}),
    p('Tus documentos se leen aquí y no se envían a ninguna IA durante la preparación. No hay cuenta, suscripción ni telemetría.'),
    p('Compartir es una acción tuya y aparte: primero ves el texto, y después decides si lo copias.'),
    actions(doBtn('privacy-scope','Privacidad y alcance',async()=>showPrivacy(),'quiet'))),
],'INICIO');}
// Tus proyectos: the list, and nothing else. No greeting, no explanation, no numbered steps — that was the
// finding. Each entry carries its own state, and the state says it is the recorded one.
async function showProjects(){state.page='projects';state.projects=await call('listProjects');render([
  el('h1',{tabindex:'-1',text:'Tus proyectos'}),
  state.projects.length?el('div',{class:'project-list'},state.projects.map(project=>{
    const [label,detail]=projectStates[project.state]??['Estado desconocido','Ábrelo para comprobarlo.'];
    return el('article',{class:'project'},
      el('div',{},el('h2',{text:project.name}),p(project.root,'path'),
        el('p',{class:`project-state state-${project.state}`},el('b',{text:label}),' ',detail,
          el('small',{text:project.state==='unreadable'?'':' Estado guardado la última vez; se comprueba al abrirlo.'})),
        project.profile?el('span',{class:'tag',text:profiles[project.profile]?.[0]??project.profile}):null),
      el('div',{class:'project-actions'},btn('Abrir →',()=>openProject(project.id),'quiet'),btn('Quitar de la lista',()=>forget(project),'quiet')));
  })):el('div',{class:'empty-state'},p('Aún no hay proyectos en esta lista.','empty'),actions(doBtn('prepare-project','Preparar proyecto',()=>startSetup(),'primary'))),
],'TUS PROYECTOS');}
function showHelp(){state.page='help';render([
  el('h1',{tabindex:'-1',text:'Ayuda'}),
  p('Cómo trabaja esta aplicación, qué quiere decir que algo esté listo, y qué significa cada palabra que aparece en pantalla.','intro'),
  panel(el('h2',{text:'Cómo trabaja, en orden'}),
    el('ol',{class:'method'},[
      ['Dices qué quieres lograr','Un objetivo en una frase y el tipo de trabajo. Eso ajusta la explicación y la ayuda, no lo que te deja hacer.'],
      ['Eliges la carpeta','La eliges tú en el diálogo de Windows. La aplicación no puede elegirla por ti, y eso es a propósito.'],
      ['Revisas y apruebas','Cada paso muestra primero la lista de archivos que se van a añadir, actualizar o conservar. Nada se escribe antes de que lo apruebes.'],
      ['Se leen tus archivos','Queda un resumen consultable con la ubicación de cada frase. Tus originales no se modifican.'],
      ['Sigues en tu IA','Abrir tu IA de escritorio con esta carpeta, o preparar un texto para pegar en un chat web.'],
    ].map(([title,body])=>el('li',{},el('strong',{text:title}),' ',body)))),
  panel(el('h2',{text:'Qué quiere decir «listo»'}),
    p('Son tres cosas distintas, y se comprueban por separado. La aplicación nunca junta las tres en una sola palabra.'),
    el('ul',{},[
      'La carpeta está preparada: existen los archivos de la preparación y coinciden con su registro.',
      'Los archivos están leídos: hay un resumen consultable y cada respuesta puede citar de dónde salió.',
      'Las herramientas externas están comprobadas: responden de verdad, no solo están copiadas.',
    ].map(text=>el('li',{text}))),
    p('Copiar un archivo de configuración solo demuestra que ese archivo existe. Abrir tu IA con una carpeta no demuestra que la haya leído.','subtle')),
  panel(el('h2',{text:'Si algo no sale'}),
    p('Cualquier paso se puede detener con «Detener»: termina el paso seguro en curso y no deja nada a medias sin registrarlo.'),
    el('p',{},'Si una operación se interrumpe, el proyecto lo dice y ofrece continuarla o deshacerla. Eso es la ',
      term('recuperacion'),': antes de tocar nada se comprueban los archivos, y si los editaste después se detiene para no perder tu edición.')),
  el('section',{class:'panel',id:'glosario'},el('h2',{text:'Glosario'}),
    p('Cada una de estas palabras aparece en alguna pantalla, y desde ahí se puede abrir esta misma definición.'),
    el('dl',{class:'glossary'},GLOSSARY.flatMap(entry=>[el('dt',{id:`termino-${entry.id}`,text:entry.term}),
      el('dd',{},el('b',{text:entry.short}),entry.detail?el('span',{text:' '+entry.detail}):null)]))),
],'AYUDA');}
function showTerm(id){const entry=byId.get(id);openDialog(entry.term,[p(entry.short),entry.detail?p(entry.detail,'subtle'):null]);}
function showPrivacy(){openDialog('Tu carpeta, bajo tu control',[
  p('La aplicación lee y consulta tus archivos en este equipo. No tiene cuenta, telemetría ni envío automático de documentos. La lista local guarda la ruta, el nombre y lo que elegiste en cada proyecto.'),
  p('El resumen consultable contiene fragmentos de tus archivos, y los registros de recuperación pueden conservar versiones anteriores de los archivos que la aplicación administra. Protégelos igual que tus documentos originales.'),
  el('p',{},'Puedes quitar proyectos de la lista sin borrar nada. Una ',term('exclusion'),' reduce lo que entra al resumen; la primera mirada a la carpeta sí lee nombres y texto para reconocerla. La detección de datos sensibles tiene límites.'),
  p('Compartir con un proveedor de IA es una acción aparte y tuya. Revisa el texto y las condiciones de ese servicio antes de pegarlo. Los PDF escaneados, el audio, el video, las imágenes y los documentos complejos pueden necesitar otra herramienta.'),
  el('p',{},'Las herramientas de desarrollo y el ',term('mapa-de-codigo'),' se descargan aparte y se comprueban aparte. Preparar archivos no instala modelos ni demuestra que una IA externa haya leído tu proyecto.'),
]);}
function startSetup(){state.project=null;state.selection={name:'',goal:'',role:'researcher',profile:'research',experience:'guided',agents:['web']};showSetup();}
function showSetup(){state.page='setup';const s=state.selection;
  const types=el('fieldset',{},el('legend',{text:'¿Qué vas a hacer?'}),el('div',{class:'choices'},Object.entries(profiles).map(([id,[label,hint]])=>{
    const radio=el('input',{type:'radio',name:'profile',value:id,checked:s.profile===id,onChange:()=>{s.profile=id;}});
    return el('label',{class:'choice'},radio,el('span',{},el('strong',{text:label}),el('small',{text:hint})));})));
  const ai=el('fieldset',{},el('legend',{text:'¿Con qué IA quieres trabajar?'}),el('div',{class:'choices'},Object.entries(agents).map(([id,label])=>el('label',{class:'choice'},el('input',{type:'checkbox',name:'agent',value:id,checked:s.agents.includes(id),onChange:e=>{s.agents=e.target.checked?[...s.agents,id]:s.agents.filter(a=>a!==id);}}),el('span',{},el('strong',{text:label}))))),el('small',{text:'Puedes elegir varias. No necesitas conectar cuentas ni entregar contraseñas.'}));
  const form=el('form',{onSubmit:e=>{e.preventDefault();void run(async()=>{if(!s.agents.length)throw{message:'Elige al menos una IA.',action:'Marca la que usas habitualmente.'};showFolder();});}},
    el('div',{class:'fields'},field('Nombre de tu proyecto','name',input('name',s.name,100,v=>s.name=v),'Por ejemplo: Evidencia para mi tesis'),field('¿Con qué perfil te identificas?','role',select('role',roles,s.role,v=>s.role=v))),
    field('¿Qué quieres lograr?','goal',input('goal',s.goal,500,v=>s.goal=v),'Un objetivo concreto ayuda a tu IA a empezar con dirección.'),types,ai,
    field('¿Cuánta guía prefieres?','experience',select('experience',{guided:'Paso a paso, con explicaciones',familiar:'Conozco las herramientas de IA'},s.experience,v=>s.experience=v)),
    actions(btn('Volver',async()=>showStart()),el('button',{type:'submit',class:'primary',text:'Elegir carpeta  →'})));
  render([steps(0),...heading('Empecemos por lo que quieres lograr.','La preparación se adapta a tu trabajo. Puedes usar una IA instalada en tu equipo o pegar el contexto en un chat web.'),form],'PREPARAR PROYECTO / TU OBJETIVO');
}
function showFolder(){state.page='folder';const chosen=state.project;
  render([steps(1),...heading('Tu trabajo empieza en una carpeta.','Elige solo los materiales de este proyecto. Si empiezas de cero, crea una carpeta nueva desde el mismo diálogo.'),
    el('div',{class:'folder-card'},el('h2',{text:chosen?chosen.name:'¿Dónde está tu proyecto?'}),p(chosen?chosen.root:'Puede tener código, documentos, PDF o tus materiales de trabajo.','path'),actions(btn(chosen?'Cambiar carpeta':'Buscar carpeta en este equipo',async()=>{const result=await call('chooseFolder');if(result){state.project=result;showFolder();}},'primary'))),
    chosen?panel(el('h2',{text:'Una primera mirada'}),p(`${chosen.inspection?.files.length??0} archivos dentro de lo que se va a leer.`),p(`Tipo detectado: ${profiles[chosen.inspection?.recommendation]?.[0]??'por confirmar'}. Se usará tu elección: ${profiles[state.selection.profile][0]}.`,'subtle'),btn('Revisar estado o recuperar',()=>showWorkspace(),'quiet')):null,
    p('Tus documentos se leen en este equipo y no se envían a ninguna IA durante la preparación. Podrás dejar materiales fuera al revisar qué se lee.','subtle'),
    actions(btn('Volver',()=>showSetup()),chosen?btn('Revisar preparación  →',async()=>{state.plan=await call('previewBase',{id:chosen.id,selection:state.selection});showBaseReview();},'primary'):null),
  ],'PREPARAR PROYECTO / CARPETA');}
function changes(files){return el('details',{},el('summary',{text:`Ver archivos previstos (${files.length})`}),el('ul',{class:'file-list'},files.map(f=>el('li',{text:`${{create:'Añadir',update:'Actualizar',remove:'Retirar',unchanged:'Conservar',adopt:'Conservar original',preserve:'Conservar',noop:'Sin cambios'}[f.action]??f.action} · ${f.path}`}))));}
function showBaseReview(){state.page='base-review';const s=state.selection;
  render([steps(2),...heading('Esto es lo que se va a escribir.','Primero se guardan tus elecciones y la lista de lo que hay en la carpeta. Después revisas qué archivos se leen y qué instrucciones recibe tu IA.'),
    panel(el('dl',{class:'review-grid'},[['Proyecto',s.name],['Tipo de trabajo',profiles[s.profile][0]],['Tu objetivo',s.goal],['Tu IA',s.agents.map(a=>agents[a]).join(', ')]].flatMap(([k,v])=>[el('div',{},el('dt',{text:k}),el('dd',{text:v}))])),p(state.project.root,'path'),changes(state.plan.files)),
    p('Tus archivos originales no se modifican. Se guarda un registro para poder comprobar cambios y deshacer una operación que quede a medias.','subtle'),
    actions(btn('Volver',()=>showFolder()),btn('Guardar esta preparación  →',async()=>{const r=await call('applyBase',{plan:state.plan.id});state.status=r.status;state.project={...state.project,...r.status.project};
      if(['software','unity'].includes(s.profile))await reviewEngineering();else await prepareContext();},'primary')),
  ],'PREPARAR PROYECTO / REVISIÓN');}
async function reviewEngineering(){
  if(state.status?.capabilities?.environment&&state.status.environment?.status!=='prepared'){
    state.plan=await call('previewEnvironment',{id:state.project.id});showEnvironmentReview();
  }else{state.plan=await call('previewEngineering',{id:state.project.id});showEngineeringReview();}
}
const downloadSize=bytes=>`${(bytes/(1024*1024)).toLocaleString('es',{maximumFractionDigits:1})} MiB`;
async function reviewRepair(){state.plan=await call('previewRepair',{id:state.project.id});const plan=state.plan;
  render([...heading('Recuperemos tus herramientas.','Se comprueban otra vez la ubicación y el registro de cada herramienta antes de reemplazar su copia.'),
    panel(p(plan.message),...(plan.items??[]).map(item=>el('article',{},el('h2',{text:item.name}),p(`${downloadSize(item.downloadBytes)} de descarga · ${downloadSize(item.replacedBytes)} por reemplazar`),p(item.destination,'path')))),
    ...(plan.blocked??[]).map(item=>panel(el('h2',{text:item.tool}),p(item.message),p(item.action))),
    p('Tus proyectos y los índices que ya usabas se conservan. Una carpeta sin registro válido se deja como está para que la revises; no se borra sola.','subtle'),
    actions(btn('Volver al estado',()=>showWorkspace()),plan.id?btn('Reparar herramientas revisadas',async()=>{state.status=(await call('applyRepair',{plan:plan.id})).status;await showWorkspace(false);},'primary'):null)],'TU PROYECTO / REPARACIÓN');}
function showEnvironmentReview(){state.page='environment-review';const plan=state.plan,allowed=plan.status==='planned';
  render([steps(2),...heading('Tus herramientas, listas en este equipo.','Se descargan las herramientas con las que se programa y se conservan las dependencias que tu proyecto ya tenía. Revisa esta instalación antes de continuar.'),
    allowed?panel(el('span',{class:'tag',text:plan.downloadBytes?`Descarga prevista: ${downloadSize(plan.downloadBytes)}`:'Ya están en este equipo y comprobadas'}),
      ...(plan.tools??[]).map(tool=>el('article',{class:'recipe'},el('h2',{text:tool.name}),p(tool.purpose),p(tool.status==='verified'?'Lista para reutilizar':tool.downloadBytes?`${downloadSize(tool.downloadBytes)} de descarga`:'Incluida en la aplicación','subtle'),
        el('details',{},el('summary',{text:'Versión, licencia y ubicación'}),p(`${tool.version} · ${tool.license}`),p(tool.source,'path'),p(tool.destination,'path')))),
      el('p',{},term('openspec',`OpenSpec ${plan.engineering.openspec}`),` y Project Engineering OS ${plan.engineering.core}: ${downloadSize(plan.engineering.downloadBytes)} de descarga.`),
      p(plan.git==='initialize-local'?'Se creará un historial de versiones local para este proyecto.':'Se conservará el historial de versiones que este proyecto ya tiene.'),changes(plan.files)):
      panel(el('h2',{text:plan.message??'Las herramientas necesitan atención'}),p(plan.action??'Revísalas antes de volver a intentarlo.')),
    p('Estas herramientas sirven para varios proyectos y se quedan en este equipo. Cerrar la aplicación no las elimina.','subtle'),
    actions(btn('Ver estado',()=>showWorkspace()),btn('Solo leer mis archivos',()=>prepareContext()),allowed?btn('Preparar herramientas y continuar  →',async()=>{
      state.status=(await call('applyEnvironment',{plan:plan.id})).status;
      state.plan=await call('previewEngineering',{id:state.project.id});showEngineeringReview();
    },'primary'):btn('Revisar reparación de herramientas',()=>reviewRepair())),
  ],'PREPARAR PROYECTO / HERRAMIENTAS');}
function showEngineeringReview(){state.page='engineering-review';const plan=state.plan,allowed=plan.status==='planned';
  const operations=plan.plan?.operations??[];
  render([steps(2),...heading('Un proceso claro para desarrollar.','Se añaden instrucciones para tu IA, un lugar donde escribir qué va a cambiar y comprobaciones. Que funcionen se comprueba en el paso siguiente, no aquí.'),
    panel(el('span',{class:`tag ${allowed?'':'pending'}`,text:allowed?'Hay un plan listo para revisar':'Necesita atención'}),p(plan.message??(allowed?'Revisa los archivos antes de continuar.':'La carpeta tiene conflictos que hay que resolver antes.')),
      plan.action?p(plan.action,'subtle'):null,plan.incompleteTransaction?p('Hay una operación a medias. Continuar comprueba primero su registro y después completa los archivos que faltan.'):null,changes(operations.map(o=>({path:o.target,action:o.operation})))),
    plan.preservedOriginals?.length?p(`Estos archivos tuyos se conservan sin modificar: ${plan.preservedOriginals.join(', ')}.`):null,
    p('Si falta Git o hay conflictos en las instrucciones, se te dice cómo resolverlo. Mientras tanto puedes solo leer tus archivos.','subtle'),
    actions(btn('Ver estado del proyecto',()=>showWorkspace()),allowed?btn(plan.incompleteTransaction?'Continuar lo que quedó a medias  →':'Guardar estas instrucciones  →',async()=>{const r=await call('applyEngineering',{plan:plan.id});state.status=r.status;
      if(state.status.capabilities?.environment){state.plan=await call('previewActivation',{id:state.project.id});showActivationReview();}else await prepareContext();},'primary'):null,
      plan.incompleteTransaction?btn('Deshacer la operación a medias',()=>openDialog('Deshacer esta operación',[p('Se deshace la operación a medias que acabas de revisar. Antes se comprueba si editaste esos archivos después, para no perder tu edición.'),actions(btn('Conservar',async()=>closeDialog()),btn('Deshacer operación',async()=>{state.status=(await call('rollbackEngineering',{plan:plan.id})).status;closeDialog();await showWorkspace();},'danger'))]),'quiet'):btn('Solo leer mis archivos',async()=>{await prepareContext();})),
  ],'PREPARAR PROYECTO / DESARROLLO');}
function showActivationReview(){state.page='activation-review';const plan=state.plan;
  render([steps(2),...heading('Un método de trabajo para tu IA.','Se instalan los recorridos oficiales que ordenan cada cambio: primero qué se espera, después el código, al final la revisión.'),
    plan.status==='planned'?panel(el('span',{class:'tag',text:'OpenSpec 1.6.0, comprobado en una carpeta de prueba'}),el('p',{},'Se aplican esos recorridos y se conectan las herramientas. Después se comprueba que ',term('openspec'),' responde de verdad en tu proyecto.'),changes(plan.files)):
      panel(el('h2',{text:plan.message??'Hay instrucciones que necesitan revisión'}),p(plan.action),plan.conflicts?el('ul',{class:'file-list'},plan.conflicts.map(f=>el('li',{text:f}))):null),
    actions(btn('Ver estado',()=>showWorkspace()),btn('Solo leer mis archivos',()=>prepareContext()),plan.status==='planned'?btn('Activar y continuar  →',async()=>{
      state.status=(await call('applyActivation',{plan:plan.id})).status;await prepareContext();
    },'primary'):null)],'PREPARAR PROYECTO / MÉTODO');}
async function prepareContext(exclude){state.plan=await call('previewContext',{id:state.project.id,...(exclude===undefined?{}:{exclude})});showContextReview();}
function showContextReview(){state.page='context-review';const plan=state.plan,c=plan.coverage;
  const exclusion=el('textarea',{id:'exclusions',rows:3,placeholder:'carpeta-privada\nnotas-personales.txt'});
  exclusion.value=(plan.exclude??[]).join('\n');
  render([steps(3),...heading('Tus archivos, leídos y ubicables.','Al buscar, encontrarás el fragmento y el archivo, la página o el párrafo de donde salió. Revisa qué se pudo leer y qué no.'),
    panel(el('span',{class:`tag ${c.complete?'':'pending'}`,text:c.complete?'Se pudo leer todo lo previsto':'Hay archivos o partes pendientes'}),
      p(`${c.sources.length} archivos · ${c.chunks} fragmentos · ${c.textBytes.toLocaleString('es')} bytes de texto`),
      el('details',{},el('summary',{text:'Ver qué se leyó de cada archivo'}),el('ul',{class:'file-list'},c.sources.map(s=>el('li',{text:`${s.path} · ${s.status??'inspeccionado'}${s.issues?.length?' · '+s.issues.map(i=>i.reason).join(', '):''}`})))),
      p(`${c.excluded} elementos dejados fuera. ${c.limitations.length} límites o advertencias al leer.`,'subtle'),
      c.managedInstructions?.length?el('details',{},el('summary',{text:`${c.managedInstructions.length} archivos de instrucciones generados quedan fuera de esta búsqueda`}),p('Los escribió la preparación para desarrollo y tu IA ya los recibe por su propia ruta. Si aquí aparece un archivo tuyo, revisa la preparación antes de continuar.','subtle'),el('ul',{class:'file-list'},c.managedInstructions.map(path=>el('li',{text:path})))):null,changes(plan.files)),
    el('details',{},el('summary',{text:'Dejar materiales fuera'}),field('Una ruta relativa por línea','exclusions',exclusion,'No incluyas letras de unidad ni rutas de otras carpetas.'),btn('Revisar con estas exclusiones',()=>prepareContext(exclusion.value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean)))),
    p('Los PDF escaneados, las imágenes y otros formatos sin texto necesitan otra herramienta. No se presentan como documentos leídos.','subtle'),
    actions(btn('Volver al estado',()=>showWorkspace()),btn('Guardar y continuar  →',async()=>{
      const r=await call('applyContext',{plan:plan.id});state.status=r.status;
      if(plan.agentStatus==='canonical-planned-sync-required'){
        state.plan=await call('previewSync',{id:state.project.id});showSyncReview();
      }else await showWorkspace();
    },'primary')),
  ],'PREPARAR PROYECTO / ARCHIVOS');}
function showSyncReview(){state.page='sync-review';const plan=state.plan;
  render([...heading('Conectemos lo leído con las instrucciones.','Las instrucciones de tu IA se rehacen a partir de lo que acabas de aprobar. Después se actualiza el resumen para incluir esos cambios.'),
    panel(changes((plan.plan?.operations??[]).map(o=>({path:o.target,action:o.operation}))),plan.message?p(plan.message):null),
    actions(btn('Volver al estado',()=>showWorkspace()),plan.status==='planned'?btn('Actualizar las instrucciones',async()=>{
      const r=await call('applyEngineering',{plan:plan.id});state.status=r.status;
      state.plan=await call('previewContext',{id:state.project.id});showFinalContext();
    },'primary'):null)],'PREPARAR PROYECTO / INSTRUCCIONES');}
function showFinalContext(){const plan=state.plan;render([...heading('Una última pasada al resumen.','Las instrucciones ya están actualizadas. Guarda el resumen para que las búsquedas usen los archivos vigentes.'),panel(p(`${plan.coverage.sources.length} archivos · ${plan.coverage.chunks} fragmentos. ${plan.coverage.complete?'Se pudo leer todo lo previsto.':'Hay partes pendientes.'}`),p(`Se dejó fuera: ${plan.exclude?.join(', ')||'nada'}.`,'subtle'),changes(plan.files)),actions(btn('Guardar y ver mi proyecto',async()=>{state.status=(await call('applyContext',{plan:plan.id})).status;await showWorkspace();},'primary'))],'PREPARAR PROYECTO / ÚLTIMA PASADA');}
async function reviewCode(){state.plan=await call('previewCode',{id:state.project.id});showCodeReview();}
function showCodeReview(){state.page='code-review';const plan=state.plan,allowed=plan.status==='planned';
  render([...heading('Encuentra las piezas de tu código.','Un índice opcional de funciones, clases y cómo se relacionan. Sirve para localizar el archivo correcto antes de proponer un cambio.'),
    allowed?panel(el('span',{class:'tag',text:'CodeGraph 1.6.0 · MIT'}),p(`${plan.coverage.sources.length} archivos revisados · ${downloadSize(plan.bytes)} de código · ${downloadSize(plan.downloadBytes)} de descarga.`),
      p('Se analizan copias locales. Tus archivos y cualquier índice que ya uses se conservan.'),
      el('details',{},el('summary',{text:'Ver herramientas y archivos'}),...plan.tools.map(t=>el('div',{},p(`${t.name} · ${t.version} · ${t.license}`),p(t.source,'path'),p(t.destination,'path'))),
        el('ul',{class:'file-list'},plan.coverage.sources.map(f=>el('li',{text:f.path})))),changes(plan.files)):
      panel(el('h2',{text:plan.message??'El mapa necesita atención'}),p(plan.action??'La búsqueda en tus documentos sigue disponible.')),
    plan.coverage?.omitted.length?p(`${plan.coverage.omitted.length} archivos de código quedan fuera por exclusiones, formato, contenido sensible o límites.`,'subtle'):null,
    el('p',{class:'subtle'},'El ',term('mapa-de-codigo'),' se comprueba con una consulta real. Sus relaciones son aproximaciones: tu IA tiene que leer las líneas originales y verificar cada cambio. No se instalan modelos.'),
    actions(btn('Volver al proyecto',()=>showWorkspace()),allowed?btn('Crear mapa de código',async()=>{state.status=(await call('applyCode',{plan:plan.id})).status;await showWorkspace(false);},'primary'):null)
  ],'TU PROYECTO / MAPA DE CÓDIGO');}
async function openProject(id){state.status=await call('openProject',{id});state.project=state.status.project;state.selection={...state.selection,...state.project.selection};state.tab='overview';await showWorkspace(false);}
async function forget(project){openDialog('Quitar de la lista',[
  p(`Se quita ${project.name} de esta lista. Los archivos de la carpeta se quedan donde están.`),actions(btn('Conservar',async()=>closeDialog()),btn('Quitar de la lista',async()=>{await call('forgetProject',{id:project.id});closeDialog();await showProjects();},'danger'))]);}
function statusCard(title,done,detail){const label=done==='not-requested'?'No aplica':done?'Preparado':'Por revisar';return el('article',{class:'status-card'},el('span',{class:'status-icon','aria-hidden':true,text:done==='not-requested'?'—':done?'✓':'○'}),el('h2',{text:`${title} · ${label}`}),p(detail));}
async function showWorkspace(refresh=true){state.page='workspace';if(refresh)state.status=await call('status',{id:state.project.id});const s=state.status;
  const content=[el('p',{class:'eyebrow',text:profiles[s.base.selection?.profile]?.[0]??'TU PROYECTO'}),...heading(s.project.name,s.project.selection?.goal??'Comprueba cómo está y elige tu siguiente paso.'),p(s.project.root,'path'),
    el('div',{class:'tool-tabs','aria-label':'Herramientas del proyecto'},Object.entries({overview:'Estado',search:'Buscar fuentes',recipes:'Recetas',handoff:'Continuar con mi IA'}).map(([id,label])=>{
      const b=btn(label,async()=>{state.tab=id;await showWorkspace(false);},'');b.setAttribute('aria-pressed',String(state.tab===id));return b;})),
  ];
  if(state.tab==='overview')content.push(
    el('div',{class:'status-grid'},statusCard('Tus elecciones',s.base.base==='prepared',s.base.inventory==='stale'?'La carpeta cambió desde la primera mirada.':'El perfil y las IA que elegiste.'),
      statusCard('Archivos leídos',s.context.context==='current',s.context.context==='current'?`${s.context.sources} archivos. ${s.context.coverage==='partial'?'Hay materiales fuera o con lectura pendiente.':'Cada respuesta puede citar de dónde salió.'}`:'Lee o actualiza tus archivos antes de buscar.'),
      statusCard('Desarrollo',s.engineering.files==='not-requested'?'not-requested':s.engineering.workflows==='verified',s.engineering.files==='not-requested'?'Este tipo de proyecto no necesita un proceso de software.':s.engineering.workflows==='verified'?'Herramientas e instrucciones comprobadas.':s.engineering.files==='prepared'?'Instrucciones listas; falta comprobar que OpenSpec responde.':'Hay requisitos o conflictos por resolver.')),
    panel(el('h2',{text:'Tu siguiente paso'}),p(s.context.context==='current'?'Busca algo en tus archivos, mira una receta o sigue en tu IA.':'Lee tus archivos para empezar a trabajar con ellos.'),
      actions(btn(s.context.context==='current'?'Revisar fuentes de nuevo':'Preparar contexto',()=>prepareContext(),'primary'),btn('Comprobar estado',()=>showWorkspace()),['software','unity'].includes(s.base.selection?.profile)?btn('Revisar ingeniería',()=>reviewEngineering()):null)),
    s.capabilities?.codeGraph&&['software','unity'].includes(s.base.selection?.profile)?panel(el('h2',{text:`Mapa de código · ${{'not-prepared':'No preparado',empty:'Vacío',verified:'Verificado',stale:'Desactualizado',corrupt:'Corrupto','requires-repair':'Requiere reparación','requires-action':'Requiere reparación'}[s.code?.status]??'Por revisar'}`}),
      el('p',{},'Un ',term('mapa-de-codigo'),'. ',s.code?.status==='verified'?`${s.code.symbols} símbolos y ${s.code.relations} relaciones comprobados con tus archivos actuales.`:s.code?.message??'Localiza funciones y clases antes de cambiar el proyecto. Puedes añadirlo cuando tengas código.'),
      actions(btn(s.code?.status==='verified'?'Actualizar mapa de código':'Revisar mapa de código',()=>reviewCode()),s.code?.status==='verified'?btn('Buscar símbolos',async()=>{state.tab='search';await showWorkspace(false);}):null,
        btn('Revisar reparación de herramientas',()=>reviewRepair()))):null,
    p('Que un archivo de configuración exista no demuestra que la herramienta funcione. OpenSpec, el mapa de código y tu IA se comprueban cada uno por su lado.','subtle'),
    ...[s.base.error,s.context.error,s.engineering.error,s.environment?.error,s.code?.error].filter(Boolean).map(e=>panel(el('h3',{text:e.message}),p(e.action))),recovery(s),
  );
  if(state.tab==='search'){content.push(searchView());if(s.code?.status==='verified')content.push(codeSearchView());}
  if(state.tab==='recipes'){
    const w=await call('workspace',{id:state.project.id});content.push(el('p',{class:'subtle'},'Cada ',term('receta'),' es un recorrido corto para pedir un resultado concreto y comprobarlo. El ',term('presupuesto'),' se expresa en bytes.'),
      ...w.recipes.map(r=>el('article',{class:'recipe'},el('h2',{text:r.title}),p(`Necesitas: ${r.inputs.join(' · ')}`,'muted'),el('ol',{},r.steps.map(step=>el('li',{text:step}))),el('details',{},el('summary',{text:'Cómo comprobar el resultado'}),el('ul',{},r.validation.map(v=>el('li',{text:v}))),p(r.stop),p(`Presupuesto inicial: ${r.budget.contextBytes} bytes; ${r.budget.attempts} intentos antes de replantear.`,'subtle')))),
      panel(el('h3',{text:'Palabras que aparecen en estas recetas'}),el('p',{},...['sdd','openspec','deuda','revision-adversarial','cita','token'].flatMap((id,i)=>i?[', ',term(id)]:[term(id)]),'.')),
      panel(el('h3',{text:'Herramientas de relaciones entre archivos'}),p('El mapa de código de esta aplicación y los índices externos tienen estados separados. Cambiar a otra alternativa necesita revisar antes sus requisitos, su licencia y que funcione.'),...w.graphs.options.map(g=>p(`${g.id} · ${g.license} · ${g.presence==='artifact-present'?'Se encontró un índice externo sin comprobar':'Índice externo no comprobado'}.`,'subtle'))));
  }
  if(state.tab==='handoff')content.push(handoffView(s));
  render(content,'TU PROYECTO / '+({overview:'ESTADO',search:'FUENTES',recipes:'RECETAS',handoff:'TU IA'}[state.tab]));
}
function recovery(s){const stages=s.capabilities?.environment?['base','context','activation']:['base','context'];const labels={base:'tus elecciones',context:'la lectura de archivos',activation:'la activación de OpenSpec'};const interrupted=stages.filter(k=>k==='activation'?s.engineering.activationInterrupted:(k==='base'?s.base.base:s.context.context)==='interrupted');return el('details',{},el('summary',{text:'Continuar o deshacer una operación'}),el('p',{class:'subtle'},'Continúa una operación que quedó a medias o deshaz el último cambio de una etapa. Es la ',term('recuperacion'),': se comprueban los archivos antes de tocar nada, y una edición posterior puede impedirlo.'),
  ...interrupted.map(stage=>btn(`Continuar ${labels[stage]}`,async()=>{await call('recover',{id:state.project.id,stage,action:'resume'});await showWorkspace();})),
  actions(...[...stages].reverse().map(stage=>btn(`Deshacer ${labels[stage]}`,()=>{
    openDialog('Deshacer esta etapa',[p('Esto deshace la última operación registrada de esta etapa. Lo que no pertenece a ella se conserva. Si hay cambios posteriores, se detiene para protegerlos.'),actions(btn('Conservar',async()=>closeDialog()),btn('Deshacer etapa',async()=>{await call('recover',{id:state.project.id,stage,action:'rollback'});closeDialog();await showWorkspace();},'danger'))]);
  },'quiet'))));}
function searchView(){const results=el('div',{id:'search-results','aria-live':'polite'}),search=input('query',state.query,500,v=>state.query=v);
  const form=el('form',{onSubmit:e=>{e.preventDefault();void run(async()=>{const r=await call('search',{id:state.project.id,query:state.query});results.replaceChildren(p(r.note,'subtle'),...r.hits.map(h=>el('article',{class:'result'},p(`${h.path} · ${{line:'línea',page:'página',paragraph:'párrafo'}[h.kind]} ${h.start}`,'citation'),el('pre',{text:h.text}))));});}},
    el('div',{class:'search-line'},field('¿Qué necesitas encontrar?','query',search,'Busca palabras concretas del contenido, por ejemplo: método de evaluación.'),el('button',{type:'submit',class:'primary',text:'Buscar'})));
  return el('section',{},el('p',{class:'subtle'},'La búsqueda encuentra coincidencias en tus archivos y muestra la ',term('cita'),' de cada una. Lee el fragmento para decidir si respalda tu respuesta.'),form,actions(btn('Preparar un texto para pegar en tu chat',()=>previewExport(),'secondary')),results);
}
async function previewExport(){const e=await call('exportPreview',{id:state.project.id,query:state.query,maxBytes:12000});openDialog('Revisa antes de copiar',[
  p(`${e.bytes.toLocaleString('es')} bytes · ${e.included} fragmentos incluidos · ${e.omitted} omitidos.`,'subtle'),p('Este texto sigue en tu equipo. Si lo copias, podrás pegarlo en tu chat; revisa antes los datos personales y las condiciones de ese servicio.'),
  el('pre',{text:e.text,tabindex:'0','aria-label':'Texto que se copiará'}),actions(btn('Cerrar',async()=>closeDialog()),btn('Copiar este texto',async()=>{await call('copyExport',{export:e.id});notice('Texto copiado. Todavía no se ha enviado a ninguna IA.');closeDialog();},'primary'))]);}
function codeSearchView(){const results=el('div',{'aria-live':'polite'}),query=input('symbol-query','',500,()=>{});
  return panel(el('h2',{text:'Buscar funciones y clases'}),p('Consulta el índice de tu código. Los archivos originales se vuelven a comprobar antes de mostrar resultados.','subtle'),
    el('form',{onSubmit:e=>{e.preventDefault();void run(async()=>{const result=await call('searchCode',{id:state.project.id,query:query.value});results.replaceChildren(p(result.note,'subtle'),
      ...result.hits.map(h=>el('article',{class:'result'},el('h3',{text:h.name}),p(`${h.path} · líneas ${h.start}–${h.end}`,'citation'),p(h.kind,'subtle'))));});}},
      el('div',{class:'search-line'},field('Nombre del símbolo','symbol-query',query,'Por ejemplo: calculateBudget o PlayerController.'),el('button',{type:'submit',class:'primary',text:'Buscar en el mapa'}))),results);
}
function handoffView(s){return el('section',{},panel(el('h2',{text:'Sigue en la herramienta que ya usas.'}),el('p',{},'Si tu IA está instalada en el equipo, se abre con la carpeta de este proyecto. Si es un chat en el navegador, busca y copia solo los fragmentos que quieras compartir. La diferencia es qué es una ',term('agente','IA con acceso a archivos'),'.'),
    el('p',{class:'subtle'},'Solo se abre una aplicación cuya ',term('firma'),' se pudo comprobar. Abrir la carpeta no demuestra que la IA la haya leído.'),
    actions(...(s.base.selection?.agents??[]).map(a=>btn(`Abrir ${agents[a]} ↗`,async()=>{
      const preview=await call('handoffPreview',{id:state.project.id,agent:a});
      const local=preview.mode==='local';
      const open=async copy=>{const result=await call('handoff',{preview:preview.id,copy});closeDialog();notice(result.opened==='local'?`Se pidió abrir la carpeta en ${result.application}. No se ha comprobado que la IA la haya leído.${copy?' Instrucción copiada.':''}`:'Sitio abierto e instrucción copiada. Revisa los datos antes de pegarlos o adjuntar documentos en tu chat.');};
      openDialog(`Continuar con ${agents[a]}`,[p(local?`Se pedirá abrir esta carpeta en ${preview.destination}, cuya firma se comprobó. Abrir no envía una instrucción ni confirma que la IA haya leído el proyecto.`:`Se abrirá ${preview.destination} en tu navegador. La instrucción se copia al portapapeles; tus documentos no se envían solos.`),
        preview.unverified?p(`${preview.unverified.label} está instalado en este equipo, pero no se pudo comprobar su firma o quién lo publica, así que no se abre desde aquí. ${preview.unverified.message??''}`,'subtle'):null,
        el('pre',{text:preview.prompt,tabindex:'0','aria-label':'Instrucción inicial'}),actions(btn('Volver',async()=>closeDialog()),local?btn('Abrir aplicación con esta carpeta',()=>open(false),'primary'):null,btn('Copiar instrucción y abrir',()=>open(true),local?'secondary':'primary'))]);
    })))))
}
let dialogReturn=null;
function openDialog(title,content){dialogReturn=state.busy?actionOrigin:document.activeElement;$('dialog-title').textContent=title;$('dialog-body').replaceChildren(...content.filter(node=>node!==null&&node!==undefined));$('dialog').showModal();$('close-dialog').focus();}
function closeDialog(){$('dialog').close();}
$('dialog').addEventListener('close',()=>{if(dialogReturn?.isConnected)dialogReturn.focus();});
$('close-dialog').addEventListener('click',closeDialog);
$('start').addEventListener('click',()=>run(async()=>showStart()));
$('projects').addEventListener('click',()=>run(showProjects));
$('new').addEventListener('click',()=>run(async()=>startSetup()));
$('help').addEventListener('click',()=>run(async()=>showHelp()));
$('privacy').addEventListener('click',()=>showPrivacy());
$('cancel').addEventListener('click',async()=>{try{await call('cancel');$('activity-text').textContent='Deteniendo al terminar el paso seguro actual…';}catch(e){error(e);}});
document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();$('content').focus();});
api?.onProgress(value=>{$('activity').hidden=value.stage==='idle';if(value.stage!=='idle')$('activity-text').textContent=value.label+(Number.isInteger(value.completed)&&Number.isInteger(value.total)?` · ${value.completed} de ${value.total}`:'…');});
if(api)void run(async()=>showStart());else error({message:'No se pudo conectar con la aplicación.',action:'Cierra esta ventana y abre Project Engineering OS desde su acceso directo.'});
