import {state,el,p,btn,actions,panel,term,field,input,notice,call,run,openDialog,closeDialog} from '../lib/core.mjs';
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

export function filesView(s){return [searchView(),s.code?.status==='verified'?codeSearchView():null];}
