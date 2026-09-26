import {btn,call,notice} from '../lib/core.mjs';
export function copyButton(label,done,announce,text){
  let revert=null;
  const node=btn(label,async()=>{
    clearTimeout(revert);node.textContent=label;
    await call('copyText',{text});notice(announce);node.textContent=done;
    revert=setTimeout(()=>{node.textContent=label;},2000);
  });return node;
}
