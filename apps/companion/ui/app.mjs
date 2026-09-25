import {registerFunctions} from './lib/bridge.mjs';
import * as home from './screens/home.mjs';
import * as setup from './screens/setup.mjs';
import * as flow from './screens/flow.mjs';
import * as reviews from './screens/reviews.mjs';
import * as workspace from './screens/workspace.mjs';
import {api, $, state, el, p, doBtn, panel, error, call, loadProfiles, run, render, dialogReturn, closeDialog} from './lib/core.mjs';
import {NAV_IDS} from './lib/router.mjs';
import {icon} from './lib/dom.mjs';
import {showStart} from './lib/bridge.mjs';
registerFunctions({...home, ...setup, ...flow, ...reviews, ...workspace});
$('dialog').addEventListener('close',()=>{if(dialogReturn?.isConnected)dialogReturn.focus();});
$('close-dialog').addEventListener('click',closeDialog);
// The navigation and the topbar control are rendered from the same table as every other control, so the
// label of a destination exists in exactly one place.
$('nav').replaceChildren(...NAV_IDS.map(id=>doBtn(id,'nav-button')));
const privacy=doBtn('privacy-scope','quiet');
const privacyLabel=privacy.textContent;
privacy.setAttribute('aria-label',privacyLabel);
privacy.replaceChildren(el('span',{class:'privacy-label',text:privacyLabel}),icon('info','privacy-icon'));
$('topbar-actions').replaceChildren(privacy);
$('cancel').addEventListener('click',async()=>{try{await call('cancel');$('activity-text').textContent='Deteniendo al terminar el paso seguro actual…';}catch(e){error(e);}});
document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();$('content').focus();});
api?.onProgress(value=>{$('activity').hidden=value.stage==='idle';if(value.stage!=='idle')$('activity-text').textContent=value.label+(Number.isInteger(value.completed)&&Number.isInteger(value.total)?` · ${value.completed} de ${value.total}`:'…');});
// The static shell in index.html said the module never loaded. It did, so that shell is replaced either by
// the first screen or by the reason this window cannot reach the application behind it.
if(api)void run(async()=>{await loadProfiles();showStart();});
else{
  state.page='connection-error';
  render([el('h1',{tabindex:'-1',text:'No se pudo conectar con la aplicación.'}),
    p('La ventana abrió, pero no encontró el programa que prepara las carpetas. Tus proyectos y tus archivos no se tocaron.','intro'),
    panel(p('Cierra esta ventana y vuelve a abrir Project Engineering OS desde su acceso directo. Si vuelve a pasar, la instalación está incompleta y conviene instalarla de nuevo; desinstalar no borra los proyectos que ya preparaste.'))],'INICIO');
  error({message:'No se pudo conectar con la aplicación.',action:'Cierra esta ventana y abre Project Engineering OS desde su acceso directo.'});
}
