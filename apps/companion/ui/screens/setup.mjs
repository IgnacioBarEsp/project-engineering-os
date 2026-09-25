import {profiles, profileInfo, loadProfiles, agents, techDecisions, state, el, p, btn, doBtn, heading, own, actions, wizardBar, panel, term, field, input, steps, call, run, render} from '../lib/core.mjs';
import {showDelimitation, changes, showBaseReview, downloadSize} from '../lib/bridge.mjs';
async function startSetup(){await loadProfiles();state.project=null;state.selection={name:'',goal:'',profile:'software',focus:'website',experience:'guided',agents:['web'],stack:{decision:'too-early',requested:[]}};
  state.stacks=state.stacks??await call('stackCatalog');showSetup();}
function showSetup(){state.page='setup';const s=state.selection;
  const types=el('fieldset',{},el('legend',{text:'¿Qué vas a hacer?'}),el('div',{class:'choices'},Object.entries(profiles).map(([id,[label,hint]])=>{
    // Changing the kind of project changes which technologies exist for it, so it has to re-render and drop the
    // ones that no longer do. Without this the checkbox stayed on screen, still checked, and the preparation was
    // refused three screens later on the folder step — which has no technology control — with a remedy pointing
    // at the folder. An independent review walked into that dead end in the real renderer.
    const radio=el('input',{type:'radio',name:'profile',value:id,checked:s.profile===id,onChange:()=>{
      s.profile=id;s.focus=profileInfo(id).focuses[0].id;
      const offeredHere=new Set(profileInfo(id).focuses[0].stacks);
      s.stack={decision:s.stack?.decision??'too-early',requested:(s.stack?.requested??[]).filter(chosen=>offeredHere.has(chosen))};
      showSetup();}});
    return el('label',{class:'choice'},radio,el('span',{},el('strong',{text:label}),el('small',{text:hint})));})));
  // The three answers the maintainer asked for, as three answers and not as a checkbox with a default. "Es
  // pronto" is a finished state, so it is offered as plainly as the other two instead of being the fallback
  // someone lands on by not choosing.
  const techChoices=el('div',{class:'choices'},Object.entries(techDecisions).map(([id,[label,hint]])=>
    el('label',{class:'choice'},el('input',{type:'radio',name:'stack-decision',value:id,checked:(s.stack?.decision??'too-early')===id,
      onChange:()=>{s.stack={decision:id,requested:id==='chosen'?(s.stack?.requested??[]):[]};showSetup();}}),
      el('span',{},el('strong',{text:label}),el('small',{text:hint})))));
  const allowed=new Set(profileInfo(s.profile)?.focuses.find(item=>item.id===s.focus)?.stacks??[]);
  const offered=(state.stacks?.stacks??[]).filter(entry=>allowed.has(entry.id));
  const tech=el('fieldset',{},el('legend',{text:'¿Sabes con qué tecnología vas a trabajar?'}),techChoices,
    (s.stack?.decision==='chosen'&&offered.length)?el('div',{class:'choices'},offered.map(entry=>
      el('label',{class:'choice'},el('input',{type:'checkbox',name:'stack',value:entry.id,checked:(s.stack?.requested??[]).includes(entry.id),
        onChange:e=>{const chosen=new Set(s.stack?.requested??[]);if(e.target.checked)chosen.add(entry.id);else chosen.delete(entry.id);s.stack={decision:'chosen',requested:[...chosen]};}}),
        el('span',{},el('strong',{text:entry.name}),el('small',{text:`${entry.purpose} ${downloadSize(entry.downloadBytes)} de descarga, ${entry.licenses.join(', ')}.`}))))):null,
    el('small',{text:s.stack?.decision==='chosen'&&!offered.length?'Para este tipo de proyecto no hay tecnologías que esta aplicación pueda instalar. Verás por qué en el proyecto.':'Nada se instala sin que antes veas qué es, su licencia, cuánto pesa y dónde queda.'}));
  const ai=el('fieldset',{},el('legend',{text:'¿Con qué IA quieres trabajar?'}),el('div',{class:'choices'},Object.entries(agents).map(([id,label])=>el('label',{class:'choice'},el('input',{type:'checkbox',name:'agent',value:id,checked:s.agents.includes(id),onChange:e=>{s.agents=e.target.checked?[...s.agents,id]:s.agents.filter(a=>a!==id);}}),el('span',{},el('strong',{text:label}))))),el('small',{text:'Puedes elegir varias. No necesitas conectar cuentas ni entregar contraseñas.'}));
  // The submit control lives in the final bar, outside the form, and belongs to it through `form`: a click, Enter
  // in a field and the browser's own required-field check all reach this one handler, as they did inside it.
  const form=el('form',{id:'setup-form',onSubmit:e=>{e.preventDefault();void run(async()=>{if(!s.agents.length)throw{message:'Elige al menos una IA.',action:'Marca la que usas habitualmente.'};showFolder();});}},
    el('div',{class:'fields'},field('Nombre de tu proyecto','name',input('name',s.name,100,v=>s.name=v),'Por ejemplo: Evidencia para mi tesis')),
    field('¿Qué quieres lograr?','goal',input('goal',s.goal,500,v=>s.goal=v),'Un objetivo concreto ayuda a tu IA a empezar con dirección.'),types,
    el('p',{class:'subtle'},'Si vas a trabajar con ',term('fuente','fuentes'),', puedes abrir aquí su definición.'),tech,ai,
    );
  render([steps(0),...heading('Empecemos por lo que quieres lograr.','La preparación se adapta a tu trabajo. Puedes usar una IA instalada en tu equipo o pegar el texto en un chat web.'),
    el('p',{class:'subtle'},'Lo que elijas aquí queda como el ',term('perfil'),' del proyecto, y puedes cambiarlo después.'),form],'PREPARAR PROYECTO / TU OBJETIVO',
    wizardBar(doBtn('open-start'),el('button',{type:'submit',form:'setup-form',class:'primary',text:'Elegir carpeta  →'})));
}
function showFolder(){state.page='folder';const chosen=state.project;
  render([steps(1),...heading('Tu trabajo empieza en una carpeta.','Elige solo los materiales de este proyecto. Si empiezas de cero, crea una carpeta nueva desde el mismo diálogo.'),
    el('div',{class:'folder-card'},chosen?own(chosen.name,'h2'):el('h2',{text:'¿Dónde está tu proyecto?'}),
      chosen?own(chosen.root,'p',{class:'path'}):p('Puede tener código, documentos, PDF o tus materiales de trabajo.','subtle'),actions(btn(chosen?'Cambiar carpeta':'Buscar carpeta en este equipo',async()=>{const result=await call('chooseFolder');if(result){state.project=result;showFolder();}},'primary'))),
    chosen?panel(el('h2',{text:'Una primera mirada'}),p(`${chosen.inspection?.files.length??0} archivos dentro de lo que se va a leer.`),
      el('p',{class:'subtle'},`Tipo detectado: ${profiles[chosen.inspection?.recommendation]?.[0]??'por confirmar'}. Se usará el `,term('perfil'),` que elegiste: ${profiles[state.selection.profile][0]}.`),
      doBtn('open-workspace','quiet')):null,
    p('Tus documentos se leen en este equipo y no se envían a ninguna IA durante la preparación. Podrás dejar materiales fuera al revisar qué se lee.','subtle'),
  ],'PREPARAR PROYECTO / CARPETA',
  wizardBar(btn('Volver',()=>showSetup()),chosen?btn('Continuar a delimitación  →',()=>showDelimitation(),'primary'):null,chosen?btn('Revisar preparación  →',async()=>{state.plan=await call('previewBase',{id:chosen.id,selection:state.selection});showBaseReview();},'secondary'):null));}


export {startSetup, showSetup, showFolder};
