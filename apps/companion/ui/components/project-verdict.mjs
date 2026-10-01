import {el,projectStates,stageList,onDate,isEngineeringProfile,term} from '../lib/core.mjs';
export function projectVerdict(project){
    const [label,detail]=projectStates[project.state]??['Estado desconocido','Ábrelo para comprobarlo.'];
    const stages=project.state==='changed'?project.changed:project.state==='incomplete'?project.missing:[];
    const when=onDate(project.checkedAt);
  return el('p',{class:`project-state state-${project.state}`},
        el('b',{},el('span',{class:'state-mark','aria-hidden':true,text:project.state==='verified'?'✓':project.state==='unreadable'?'!':'○'}),' ',label),' ',
        project.state==='unreadable'?(project.error?.message??detail):detail,
        stages.length?[' ',...stageList(stages),'.']:null,
        // Said at the same size as the state, because what a check did not cover is part of what it found.
        el('span',{class:'recorded'},project.state==='verified'&&when
          // What the mark does not cover, named where the mark is. The managed tools are here because they
          // live outside this folder: nothing the list can read would notice if they were removed, so a
          // check from two weeks ago is all this row knows about them.
          ?[`Comprobado el ${when} contra esta carpeta. No vuelve a leer tus archivos, ni comprueba el `,term('mapa-de-codigo'),
            ...(isEngineeringProfile(project.profile)?[', las herramientas de desarrollo']:[]),' ni tu IA: ábrelo para eso.']
          :project.state==='changed'&&when?[`Se había comprobado el ${when}. Ábrelo para comprobarlo otra vez.`]
          :project.state==='incomplete'&&when?[`Comprobado el ${when}. Ábrelo para continuar donde quedó.`]
          :['Este estado sale de los registros de la carpeta, no de una comprobación. Ábrelo para comprobarlo.']));
}
export function currentVerdict(status){
  const verdict=status.verdict, stages=verdict?.stages??[],required=verdict?.required??[];
  const measured=!!verdict?.at&&required.includes('base')&&required.includes('context')&&required.every(id=>stages.some(stage=>stage.id===id));
  const pending=stages.filter(stage=>stage.state!=='ready');
  const ready=measured&&!verdict.witnessTruncated&&pending.length===0;
  return el('p',{class:'project-state current-verdict'},el('b',{text:ready?'✓ Etapas comprobadas':measured?'Hay etapas pendientes':'No se pudo comprobar el estado completo'}),
    el('span',{class:'recorded',text:measured?`Comprobado el ${onDate(verdict.at)}. No comprueba que tu IA haya leído el proyecto ni la calidad de sus respuestas. Si modificas archivos, comprueba de nuevo.`:'No hay una comprobación completa que respalde este estado. No demuestra que tu IA haya leído el proyecto.'}));
}
