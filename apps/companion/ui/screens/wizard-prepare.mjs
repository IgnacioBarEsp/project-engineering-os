import {api,state,el,p,btn,doBtn,heading,own,actions,wizardBar,panel,steps,term,call,render} from '../lib/core.mjs';
import {createPreparationFlow,planFiles} from '../lib/preparation-flow.mjs';

let active=null,unsubscribe=null;
export const preparationIsRunning=()=>active?.snapshot().busy??false;
export function cancelPreparation(){active?.markCancelled();}
const stateWords={pending:'Pendiente',running:'En curso',review:'Por revisar',done:'Hecha',failed:'No se completó',skipped:'Omitida'};
const size=bytes=>`${Number.isFinite(bytes)?bytes.toLocaleString('es'):'sin medir'} bytes`;
const actionWord={create:'Añadir',update:'Actualizar',remove:'Retirar',unchanged:'Conservar',noop:'Sin cambios',adopt:'Conservar original',preserve:'Conservar'};
function downloads(plan){return [
  ...(plan.tools??[]).map(tool=>({name:`${tool.name} ${tool.version}`,license:tool.license,bytes:tool.downloadBytes,destination:tool.destination})),
  ...(plan.engineering?[{name:`Project Engineering OS ${plan.engineering.core} / OpenSpec ${plan.engineering.openspec}`,
    license:plan.engineering.license,bytes:plan.engineering.downloadBytes,destination:plan.files?.[0]?.path}]:[]),
  ...(plan.items??[]).map(item=>({name:item.name,license:item.licenses?.join(', '),bytes:item.downloadBytes,destination:item.destination})),
];}
export function preparationPlan(plan){
  const files=planFiles(plan);
  return el('details',{class:'wizard-file-plan'},el('summary',{text:`Qué se va a escribir (${files.length} archivos o destinos)`}),
    el('ul',{class:'file-list'},files.map(file=>el('li',{},`${actionWord[file.action]??'Revisar'} · `,own(file.path,'span')))),
    ...downloads(plan).map(item=>el('article',{},p(`${item.name} · ${item.license} · ${size(item.bytes)} de descarga`),own(item.destination,'p',{class:'path'}))),
    plan.engineering?el('p',{},term('openspec'),' ordena el método de trabajo que se va a preparar.'):null,
    plan.git?p(plan.git==='initialize-local'?'Se crea el historial Git local.':'Se conserva el historial Git existente.'):null,
    plan.preservedOriginals?.length?p(`Se conservan sin modificar: ${plan.preservedOriginals.join(', ')}.`):null);
}

export async function startPreparation(initialPlan,selection,{onFinished}) {
  unsubscribe?.();let delivered=false,lastView=null;
  const action=method=>async(...args)=>{await active[method](...args);const snapshot=active.snapshot();
    if(snapshot.result&&!delivered){delivered=true;unsubscribe?.();unsubscribe=null;await onFinished(snapshot.result);}};
  const changed=snapshot=>{
    if(snapshot.result)return;
    // Progress updates only the stage row: do not reset keyboard focus or scroll for every file.
    const signature=JSON.stringify([snapshot.index,snapshot.busy,snapshot.stages.map(item=>[item.state,item.error,item.plan?.id])]);
    if(signature===lastView){updateProgress(snapshot);return;}lastView=signature;show(snapshot);
  };
  active=createPreparationFlow({call,id:state.project.id,selection,initialPlan,onChange:changed});
  unsubscribe=api.onProgress(value=>active?.progress(value));
  function updateProgress(snapshot){
    const item=snapshot.stages[snapshot.index],node=document.getElementById('preparation-progress');if(!node||!item)return;
    const value=item.progress,determinate=Number.isFinite(value?.completed)&&Number.isFinite(value?.total)&&value.total>0;
    node.replaceChildren(p(determinate?`${value.completed} de ${value.total}`:value?.label??'Comprobando la etapa…'));
  }
  function show(snapshot){
    state.page='install';const item=snapshot.stages[snapshot.index];
    if(snapshot.status){state.status=snapshot.status;state.project={...state.project,...snapshot.status.project};}
    const union=new Map();for(const entry of snapshot.stages)if(entry.plan)for(const file of planFiles(entry.plan))union.set(file.path,file);
    const recoverable=['RECOVERY_REQUIRED','CONTEXT_INTERRUPTED','ACTIVATION_INTERRUPTED'].includes(item?.error?.code);
    const list=el('ol',{class:'preparation-stages'},snapshot.stages.map(entry=>el('li',{'data-stage':entry.id,'data-state':entry.state},
      el('span',{text:entry.label}),el('span',{class:'subtle',text:stateWords[entry.state]}))));
    render([steps(),...heading('Preparar tu proyecto','Se aplica un plan a la vez. Las etapas posteriores se revisan cuando sus requisitos ya existen.'),list,
      snapshot.busy?el('div',{id:'preparation-progress',role:'status','aria-live':'polite'}):null,
      item?.state==='review'?panel(el('h2',{text:item.label}),preparationPlan(item.plan),
        item.plan.coverage?p(`${item.plan.coverage.sources.length} archivos revisados; ${item.plan.coverage.chunks} fragmentos. ${item.plan.coverage.complete?'Lectura completa dentro del alcance.':'Hay partes pendientes de lectura.'}`):null,
        item.plan.exclude?el('p',{class:'subtle'},term('exclusion'),' de lectura: ',
          item.plan.exclude.length?own(item.plan.exclude.join(', '),'span'):'solo los archivos que se omiten por seguridad','.'):null):null,
      item?.error?panel(el('h2',{text:item.error.message}),p(item.error.action??'Revisa el proyecto antes de seguir.'),
        recoverable?actions(btn('Continuar operación interrumpida',()=>action('recover')('resume')),btn('Deshacer operación interrumpida',()=>action('recover')('rollback'))):null):null,
      el('details',{},el('summary',{text:`Archivos de planes revisados hasta ahora (${union.size})`}),
        p('Los planes futuros todavía no están calculados. No se escriben sin mostrarlos antes.','subtle'),
        el('ul',{class:'file-list'},[...union.values()].map(file=>el('li',{},own(file.path,'span'))))),
      p('Tus originales se conservan. No se envía contenido a una IA ni se instala fuera del catálogo revisado.','subtle')],null,
      wizardBar(doBtn('open-project-list'),
        item?.state==='review'?btn('Aplicar este plan y continuar  →',action('apply'),'primary'):null,
        item?.state==='failed'?btn('Revisar y reintentar',action('retry'),'primary'):null,
        item&&item.id!=='base'&&!snapshot.busy?btn('Continuar sin esta etapa',action('skip'),'quiet'):null,
        snapshot.status?.base?.base==='prepared'&&!snapshot.busy?btn('Ver el resultado con pendientes',action('finish'),'quiet'):null));
    updateProgress(snapshot);
  }
  await action('apply')();
}
