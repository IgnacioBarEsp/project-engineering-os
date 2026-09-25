// Keep the peos:// renderer surface exact. This is also the test-server allowlist.
export const ASSETS = Object.freeze(new Map([
  ['/index.html', 'text/html; charset=utf-8'],
  ['/app.css', 'text/css; charset=utf-8'],
  ['/tokens.css', 'text/css; charset=utf-8'],
  ['/layout.css', 'text/css; charset=utf-8'],
  ['/components.css', 'text/css; charset=utf-8'],
  ['/pages.css', 'text/css; charset=utf-8'],
  ['/icons.svg', 'image/svg+xml'],
  ['/favicon.svg', 'image/svg+xml'],
  ['/app.mjs', 'text/javascript; charset=utf-8'],
  ['/glossary.mjs', 'text/javascript; charset=utf-8'],
  ['/lib/bridge.mjs', 'text/javascript; charset=utf-8'],
  ['/lib/core.mjs', 'text/javascript; charset=utf-8'],
  ['/lib/dom.mjs', 'text/javascript; charset=utf-8'],
  ['/lib/router.mjs', 'text/javascript; charset=utf-8'],
  ['/lib/state.mjs', 'text/javascript; charset=utf-8'],
  ['/components/actions-bar.mjs', 'text/javascript; charset=utf-8'],
  ['/components/step-rail.mjs', 'text/javascript; charset=utf-8'],
  ['/screens/home.mjs', 'text/javascript; charset=utf-8'],
  ['/screens/setup.mjs', 'text/javascript; charset=utf-8'],
  ['/screens/flow.mjs', 'text/javascript; charset=utf-8'],
  ['/screens/reviews.mjs', 'text/javascript; charset=utf-8'],
  ['/screens/workspace.mjs', 'text/javascript; charset=utf-8'],
]));

export const CSP = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

export const ICON_FRAGMENTS=Object.freeze(['#icon-terminal','#icon-folder','#icon-folder-open','#icon-info']);
export function localAsset(url,method='GET'){
  try{
    const parsed=new URL(url);
    if(method!=='GET'||parsed.protocol!=='peos:'||parsed.host!=='app'||parsed.username||parsed.password||parsed.port||parsed.search)return null;
    const type=ASSETS.get(parsed.pathname);
    if(!type)return null;
    if(parsed.hash&&(parsed.pathname!=='/icons.svg'||!ICON_FRAGMENTS.includes(parsed.hash)))return null;
    return {pathname:parsed.pathname,type};
  }catch{return null;}
}
