// The renderer sequences existing reviewed capabilities, never filesystem paths or commands.
const stage=(id,label,preview,apply,input={})=>({id,label,preview,apply,input,state:'pending',plan:null,error:null});
export function preparationStages(selection) {
  const local=selection.profile==='software'&&selection.installMode==='quick';
  return [stage('base','Elecciones y visión','previewBase','applyBase',{selection}),
    stage('context','Lectura de archivos','previewContext','applyContext',local?{prepareEngineering:true}:{}),
    ...(local?[
      stage('environment','Herramientas de desarrollo','previewEnvironment','applyEnvironment'),
      stage('engineering','Instrucciones de desarrollo','previewEngineering','applyEngineering'),
      stage('activation','Método de trabajo','previewActivation','applyActivation'),
      ...(selection.stack?.decision==='chosen'&&selection.stack.requested.length?[stage('stack','Tecnología elegida','previewStack','applyStack')]:[]),
      stage('context-final','Actualizar lectura y rutas','previewContext','applyContext'),
      stage('sync','Conectar instrucciones','previewSync','applyEngineering'),
      stage('context-refresh','Comprobar lectura final','previewContext','applyContext'),
      stage('base-refresh','Actualizar lista de archivos','previewBase','applyBase',{selection}),
    ]:[])];
}

export function planFiles(plan) {
  return plan.files??plan.plan?.operations?.map(item=>({path:item.target,action:item.operation}))
    ??plan.items?.map(item=>({path:item.destination,action:item.status==='verified'?'unchanged':'create'}))??[];
}
export function createPreparationFlow({call,id,selection,initialPlan,onChange=()=>{}}) {
  const stages=preparationStages(structuredClone(selection));
  stages[0].plan=initialPlan;stages[0].state='review';
  let index=0,busy=false,cancelled=false,result=null,lastStatus=null;
  const current=()=>stages[index]??null;
  const changed=()=>onChange({stages,index,busy,result,status:lastStatus});
  async function attempt(work){
    if(busy)throw Error('Preparation operation already running');
    busy=true;cancelled=false;changed();
    try {await work();}catch(error){if(current()){current().state='failed';current().error=error;current().plan=null;}else throw error;}
    finally {busy=false;changed();}
  }
  function guard(){if(cancelled)throw {code:'CANCELLED',message:'La preparación se detuvo.',action:'Las etapas completadas se conservan. Revisa el plan antes de continuar.'};}
  async function review(){
    guard();const item=current();if(!item){result=await call('preparationResult',{id});lastStatus=result.status;return;}
    item.state='running';item.error=null;item.progress=null;changed();
    const plan=await call(item.preview,{id,...item.input});guard();
    item.plan=plan;
    if(['conflict','requires-action'].includes(plan.status))throw {code:plan.code??'PREPARATION_REQUIRES_ACTION',
      message:plan.message??'El plan tiene conflictos.',action:plan.action??'Revisa el proyecto antes de continuar.'};
    if(!plan.id){
      if(item.id==='stack'&&plan.items?.length&&plan.items.every(value=>value.status==='verified')){
        item.state='done';index++;return review();
      }
      throw {code:'PLAN_UNAVAILABLE',message:'Esta etapa no tiene un plan aplicable.',action:'Revisa el resultado de las etapas anteriores.'};
    }
    item.state='review';changed();
  }
  return {
    snapshot:()=>({stages,index,busy,result,status:lastStatus}),
    async apply(){return attempt(async()=>{
      const item=current();if(item?.state!=='review'||!item.plan?.id)throw Error('Review a current plan before applying');
      item.state='running';item.progress=null;changed();
      const applied=await call(item.apply,{plan:item.plan.id});lastStatus=applied.status;item.state='done';item.error=null;
      // Retain real completion even if cancellation arrived at the commit boundary.
      index++;guard();await review();
    });},
    retry:()=>attempt(review),
    async skip(){return attempt(async()=>{
      const item=current();if(!item||item.id==='base')throw Error('The base cannot be skipped');
      item.state='skipped';item.plan=null;index++;await review();
    });},
    async finish(){return attempt(async()=>{result=await call('preparationResult',{id});lastStatus=result.status;});},
    async recover(action){return attempt(async()=>{
      const item=current(),type=item?.id.startsWith('context')?'context':item?.id==='activation'?'activation':item?.id==='base'?'base':null;
      if(!type||!['resume','rollback'].includes(action))throw Error('Recovery is not available for this stage');
      const recovered=await call('recover',{id,stage:type,action});lastStatus=recovered.status;
      guard();await review();
    });},
    markCancelled(){cancelled=true;},
    progress(value){const item=current();if(!busy||!item||value.stage==='idle')return;
      item.progress={label:value.label,completed:value.completed,total:value.total};changed();},
  };
}
