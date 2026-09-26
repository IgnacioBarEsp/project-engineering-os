import {profiles, isEngineeringProfile, agents, projectStates, stageList, onDate, state, el, p, btn, doBtn, rowBtn, heading, own, actions, panel, term, steps, notice, error, call, render, openDialog, GLOSSARY, byId} from '../lib/core.mjs';
import {chooseFromHome, resumeDraft, startFromDuplicate, forget} from '../lib/bridge.mjs';
function showStart(){state.page='start';render([
  el('p',{class:'eyebrow',text:'Preparación local · Tú conservas el control'}),
  el('h1',{class:'hero-title',tabindex:'-1'},'Dale a tu IA',el('br'),el('span',{class:'hero-gradient',text:'un buen punto de partida.'})),
  p('Esta aplicación lee la carpeta de tu proyecto, ordena lo que hay dentro y deja un resumen que puedes darle a la IA que ya usas, con la ubicación exacta de cada frase para que puedas comprobarla.','intro'),
  el('div',{class:'home-actions'},doBtn('prepare-project','primary'),
    btn('Abrir una carpeta existente',()=>chooseFromHome(),'secondary')),
  state.resumeDraft?panel(el('h2',{text:'Tienes una preparación sin terminar'}),
    p('Tus respuestas se conservaron en esta aplicación; la carpeta del proyecto no cambió por guardar el borrador.'),
    actions(btn('Continuar borrador',()=>resumeDraft(),'primary'))):null,
  state.draftError?panel(el('h2',{text:'El borrador necesita atención'}),p(state.draftError.message),
    p('Puedes conservar una copia del borrador dañado en los datos de esta aplicación y empezar otra vez; la carpeta del proyecto no cambia.','subtle'),
    actions(btn('Conservar copia y empezar nuevo',async()=>{
      const result=await call('draftClear',{preserveInvalid:true});state.draftError=null;
      notice(result.preservedAs?'Se conservó una copia del borrador en los datos de la aplicación.':'No había borrador que conservar.');
      showStart();},'secondary'))):null,
  // The four steps are h3, so they need their own h2 above them: a page that goes from h1 straight to h3
  // reads, to anyone navigating by headings, as a level that was skipped. The previous home had the same
  // jump; the contrast and heading probe found it.
  el('h2',{class:'section-title',text:'Cómo trabaja'}),
  el('div',{class:'feature-row'},[
    ['01','Eliges tu carpeta','Los archivos que ya tienes, donde ya están. No se copian ni se mueven a otro lugar.'],
    ['02','Ves qué se va a escribir','Antes de tocar nada aparece la lista completa de archivos que se añaden a la carpeta.'],
    ['03','Se lee lo que hay dentro','Queda un resumen consultable, y cada respuesta puede decir de qué archivo y de qué línea salió.'],
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
    actions(doBtn('privacy-scope','quiet'))),
],'INICIO');}
// Duplicating reuses the answers and nothing else. The folder is chosen now, the answers arrive already
// filled in and editable, and nothing is written until the plan is approved like any other preparation:
// there is no call here that copies a prepared folder.
async function duplicate(project){await startFromDuplicate(project);}
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
      el('li',{},'La carpeta está preparada: existen los archivos de la preparación y coinciden con su registro.'),
      el('li',{},'Los archivos están leídos: hay un resumen consultable y cada respuesta puede traer su ',term('cita'),'.'),
      el('li',{},'Las herramientas externas están comprobadas: responden de verdad, no solo están copiadas.'),
    ]),
    p('Copiar un archivo de configuración solo demuestra que ese archivo existe. Abrir tu IA con una carpeta no demuestra que la haya leído.','subtle')),
  panel(el('h2',{text:'Si algo no sale'}),
    p('Cualquier paso se puede detener con «Detener»: termina el paso seguro en curso y no deja nada a medias sin registrarlo.'),
    el('p',{},'Si una operación se interrumpe, el proyecto lo dice y ofrece continuarla o deshacerla. Eso es la ',
      term('recuperacion'),': antes de tocar nada se comprueban los archivos, y si los editaste después se detiene para no perder tu edición.')),
  el('section',{class:'panel',id:'glosario'},el('h2',{text:'Glosario'}),
    // Careful with this sentence: an earlier version said every one of these words appears on some screen and
    // can be opened from there. A review enumerated the call sites and found five that appeared nowhere or
    // appeared only as prose. The claim now describes the rule, which a check enforces, instead of asserting
    // a coverage figure about the whole application.
    p('Cuando una de estas palabras aparece en una pantalla, se puede abrir su definición desde ahí mismo. Aquí están todas juntas.'),
    el('dl',{class:'glossary'},GLOSSARY.flatMap(entry=>[el('dt',{id:`termino-${entry.id}`,text:entry.term}),
      el('dd',{},el('b',{text:entry.short}),entry.detail?el('span',{text:' '+entry.detail}):null)]))),
],'AYUDA');}
function showTerm(id){const entry=byId.get(id);openDialog(entry.term,[p(entry.short),entry.detail?p(entry.detail,'subtle'):null]);}
function showPrivacy(){openDialog('Tu carpeta, bajo tu control',[
  el('p',{},'La aplicación lee y consulta tus archivos en este equipo. No tiene cuenta, telemetría ni envío automático de documentos. La lista local guarda la ruta, el nombre y lo que elegiste en cada proyecto, incluido su ',term('perfil'),'.'),
  el('p',{},'El resumen consultable contiene fragmentos de tus archivos, y los registros de ',term('recuperacion'),' pueden conservar versiones anteriores de los archivos que la aplicación administra. Protégelos igual que tus documentos originales.'),
  el('p',{},'Puedes quitar proyectos de la lista sin borrar nada. Una ',term('exclusion'),' reduce lo que entra al resumen; la primera mirada a la carpeta sí lee nombres y texto para reconocerla. La detección de datos sensibles tiene límites.'),
  p('Compartir con un proveedor de IA es una acción aparte y tuya. Revisa el texto y las condiciones de ese servicio antes de pegarlo. Los PDF escaneados, el audio, el video, las imágenes y los documentos complejos pueden necesitar otra herramienta.'),
  el('p',{},'Las herramientas de desarrollo y el ',term('mapa-de-codigo'),' se descargan aparte y se comprueban aparte. Preparar archivos no instala modelos ni demuestra que una IA externa haya leído tu proyecto.'),
]);}

export {showStart, duplicate, showHelp, showTerm, showPrivacy};
