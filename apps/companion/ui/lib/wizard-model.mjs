export const WIZARD_PAGES=Object.freeze(['setup','delimitation','vision','install']);
export const emptyAnswers=()=>({name:'',goal:'',profile:'software',focus:'website',vision:'',agents:['web'],
  stack:{decision:'too-early',requested:[]},installMode:'ai',visionMode:'free',audience:'',existing:'',outside:'',experience:'guided'});

export function visionFromAnswers(answers){
  const goal=answers.goal.trim();
  if(answers.visionMode!=='structured')return /[^#\s]/u.test(answers.vision)?answers.vision.trim():goal;
  return [['Para quién',answers.audience.trim()],
    ['Qué existe ya',answers.existing.trim()],['Qué no entra',answers.outside.trim()]]
    .filter(([,text])=>text).map(([heading,text])=>`### ${heading}\n${text}`).join('\n\n')||goal;
}

export function selectionForPreparation(answers){
  return {name:answers.name.trim(),goal:answers.goal.trim(),profile:answers.profile,focus:answers.focus,
    agents:[...answers.agents],experience:answers.experience??'guided',
    stack:{decision:answers.stack.decision,requested:[...answers.stack.requested]},
    installMode:answers.installMode,vision:visionFromAnswers(answers)};
}
export const wordCount=text=>text.trim()?text.trim().split(/\s+/u).length:0;
