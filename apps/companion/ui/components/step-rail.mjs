import {el} from '../lib/dom.mjs';
import {routeFor, WIZARD_STEPS} from '../lib/router.mjs';

export function steps(page,tab){
  const current=routeFor(page,{tab}).step;
  if(current===null)throw Error(`La ruta ${page} no tiene pasos`);
  return el('ol',{class:'steps','aria-label':'Preparación'},WIZARD_STEPS.map((label,index)=>
    el('li',{'aria-current':index===current?'step':null},el('span',{text:String(index+1).padStart(2,'0')}),label)));
}
