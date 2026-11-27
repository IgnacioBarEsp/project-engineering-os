// No synthetic progress: the existing IPC returns one atomic list, not per-row events.
export async function deferredList(read,onSlow,{delay=300,timeout=10000,schedule=setTimeout,cancel=clearTimeout}={}){
  let slow,limit;
  const failure={code:'LIST_TIMEOUT',message:'La lista tardó demasiado en responder.',action:'Vuelve a intentarlo. Tus archivos no se modificaron.'};
  try {
    slow=schedule(onSlow,delay);
    return await Promise.race([Promise.resolve().then(read),new Promise((_,reject)=>{limit=schedule(()=>reject(failure),timeout);})]);
  } finally {cancel(slow);cancel(limit);}
}
export function sortedProjects(rows){return [...rows].sort((a,b)=>(Date.parse(b.checkedAt)||0)-(Date.parse(a.checkedAt)||0));}
