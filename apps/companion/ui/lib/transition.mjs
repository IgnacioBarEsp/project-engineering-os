// Only destination changes animate. Form/progress updates commit synchronously.
export function createTransitions({document:doc,reduced=()=>false}){
  let key=null,active=null,generation=0;
  return(next,update)=>{
    const changed=key!==null&&key!==next;key=next;const current=++generation;
    active?.skipTransition();active=null;
    let committed=false;
    const commit=()=>{if(current!==generation||committed)return;committed=true;update();};
    if(!changed||reduced()||typeof doc.startViewTransition!=='function'){commit();return Promise.resolve();}
    try{
      const transition=doc.startViewTransition(commit);active=transition;
      void transition.ready.catch(()=>{});
      void transition.finished.catch(()=>{}).finally(()=>{if(active===transition)active=null;});
      // Snapshot elements are not hit-testable while transitioning. Do not announce the route
      // as interactive until the finite animation finishes (or the browser skips it).
      return Promise.all([transition.updateCallbackDone,transition.finished.catch(()=>{})]).then(()=>{});
    }catch(error){if(committed)throw error;commit();return Promise.resolve();}
  };
}
