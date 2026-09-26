import {el,own} from '../lib/dom.mjs';
export const skeletonRow=project=>el('div',{class:'project project-loading',role:'status','aria-label':'Leyendo el estado del proyecto'},
  project?own(project.name,'p'):null,el('span',{class:'skeleton-line','aria-hidden':'true'}),el('span',{class:'skeleton-line short','aria-hidden':'true'}));
