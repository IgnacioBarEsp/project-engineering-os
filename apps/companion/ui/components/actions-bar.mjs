import {el} from '../lib/dom.mjs';

export const actions=(...buttons)=>el('div',{class:'actions'},buttons);
// A sticky footer stays a sibling of animated screen content; render() owns its placement.
export const wizardBar=(...buttons)=>el('div',{class:'actions wizard-footer'},buttons);
