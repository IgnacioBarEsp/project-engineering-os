import {el} from '../lib/dom.mjs';
export function createToasts(host,{schedule=(fn,ms)=>setTimeout(fn,ms),cancel=id=>clearTimeout(id)}={}){
  const pending=new Map();
  const remove=node=>{cancel(pending.get(node));pending.delete(node);node.remove();};
  return message=>{
    if(!message){for(const node of pending.keys())remove(node);return;}
    if(pending.size===2)remove(pending.keys().next().value);
    const node=el('div',{class:'toast',text:message});
    host.append(node);pending.set(node,schedule(()=>remove(node),4000));
  };
}
