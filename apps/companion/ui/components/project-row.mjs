import {el,own,rowBtn} from '../lib/core.mjs';
import {projectVerdict} from './project-verdict.mjs';
export function projectRow(project){
return el('article',{class:'project'},
      // The card is the control that opens the project. There is no second control for opening, so there is
      // no second name for it either.
      el('h2',{},rowBtn('open-project',project,'card-open',own(project.name,'span',{class:'card-name'}))),
      own(project.root,'p',{class:'path'}),
      projectVerdict(project),
      project.profile?el('span',{class:'tag',text:[project.profileLabel,project.focusLabel].filter(Boolean).join(' · ')}):null,
      // Secondary and destructive only. Opening stays outside, which is what the check reads off the page.
      el('details',{class:'more'},
        el('summary',{},el('span',{'aria-hidden':true,text:'⋯'}),el('span',{class:'sr-only',text:'Más acciones'}),
          el('span',{class:'sr-only','data-content':'person',text:` — ${project.name}`})),
        el('div',{class:'more-actions'},rowBtn('duplicate-project',project),rowBtn('forget-project',project))));
}
