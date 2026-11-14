import {state,agents,el,p,btn,doBtn,heading,own,actions,panel,steps,notice,call,render,openDialog,closeDialog} from '../lib/core.mjs';
import {copyButton} from '../components/copy-button.mjs';
const labels={base:'Elecciones y lista de archivos',context:'Lectura de archivos',environment:'Herramientas de desarrollo',engineering:'Instrucciones de desarrollo',activation:'Método de trabajo',stack:'Tecnología elegida',code:'Mapa de código'};

async function openAgent(agent){
  const preview=await call('handoffPreview',{id:state.project.id,agent,purpose:'activation'});
  const manual=preview.mode==='manual';
  openDialog(`Continuar con ${agents[agent]}`,[p(manual?preview.causeMessage
    :preview.mode==='local'?'Se pedirá abrir esta carpeta en la aplicación comprobada. Esto no demuestra que la IA la haya leído.'
      :'Se abrirá el chat web. Tus documentos no se adjuntan ni se envían automáticamente.'),
    preview.unverified?.message?p(preview.unverified.message):null,
    el('pre',{class:'prompt',text:preview.prompt,tabindex:'0','aria-label':'Instrucción inicial'}),
    actions(btn('Volver',async()=>closeDialog()),btn(manual?'Copiar instrucción':'Copiar instrucción y abrir',async()=>{
      const result=await call('handoff',{preview:preview.id,copy:true});closeDialog();
      notice(result.opened==='nothing'?'Instrucción copiada. Abre tu IA y pégala tú. No se abrió ningún sitio web.'
        :'Instrucción copiada y apertura solicitada. No se comprobó que la IA haya leído el proyecto.');
    },'primary'))]);
}
export function showFinished(result=state.preparationResult){
  if(!result)throw Error('A checked preparation result is required');
  state.preparationResult=result;state.status=result.status;state.project={...state.project,...result.status.project};state.page='finished';
  const root=state.project.root,prompt=result.prompt,rows=result.report.stages;
  const ready=rows.filter(item=>item.state==='ready'),pending=rows.filter(item=>item.state!=='ready');
  const context=result.status.context;
  const title=heading('Resultado de la preparación',pending.length?'Hay partes pendientes; aquí puedes ver cuáles.':'Las etapas requeridas se comprobaron. Tu IA todavía no ha leído el proyecto.');title[0].classList.add('hero-gradient');
  render([steps(),...title,
    panel(el('h2',{text:'Qué quedó comprobado'}),ready.length?el('ul',{},ready.map(item=>el('li',{text:labels[item.id]}))):p('Ninguna etapa quedó comprobada como lista.'),
      context.context==='current'?p(`${context.sources} archivos revisados. ${context.coverage==='complete'?'Cobertura completa dentro del alcance.':'Hay partes pendientes de lectura.'}`):null,
      pending.length?[el('h2',{text:'Qué queda pendiente'}),el('ul',{},pending.map(item=>el('li',{text:labels[item.id]}))),
        p('Puedes continuar con tu IA usando la instrucción revisable o abrir el proyecto para recuperar las etapas pendientes.','subtle')]:null,
      p('Crear instrucciones no prueba que una IA las haya leído. Abrirla tampoco.','subtle')),
    panel(el('h2',{text:'Tu carpeta'}),own(root,'p',{class:'path'}),actions(copyButton('Copiar ruta','Copiado','Ruta copiada. Todavía no se envió a ninguna aplicación.',root))),
    panel(el('h2',{text:'Instrucción inicial para tu IA'}),el('pre',{class:'prompt',text:prompt,tabindex:'0','aria-label':'Instrucción inicial para tu IA'}),
      actions(copyButton('Copiar instrucción','Copiado','Instrucción copiada; decide tú dónde pegarla.',prompt))),
    actions(...(result.status.base.selection?.agents??[]).map(agent=>btn(`Abrir en ${agents[agent]}`,()=>openAgent(agent))),
      doBtn('open-workspace','primary'),doBtn('open-project-list'))],null);
}
