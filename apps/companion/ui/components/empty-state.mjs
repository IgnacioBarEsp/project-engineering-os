import {el} from '../lib/dom.mjs';
export const emptyState=(message,action)=>el('div',{class:'empty-state'},el('p',{class:'empty',text:message}),el('div',{class:'actions'},action));
