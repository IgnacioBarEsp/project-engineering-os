import { app, BrowserWindow, protocol, session, ipcMain, dialog, clipboard, shell, Menu } from 'electron';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as core from 'create-project-engineering-os';
import { createDesktopService, publicError } from './service.mjs';
import { createRuntimeManager } from '../runtime/manager.mjs';
import { createEnvironmentEngine } from '../runtime/environment.mjs';
import { createLocalAppLauncher } from './local-apps.mjs';

const APP_URL = 'peos://app/index.html';
// An exact allowlist, extended one path at a time on purpose: a prefix or a glob here would serve whatever
// happens to sit in the interface directory.
const assets=new Map([['/index.html','text/html; charset=utf-8'],['/app.css','text/css; charset=utf-8'],['/app.mjs','text/javascript; charset=utf-8'],['/glossary.mjs','text/javascript; charset=utf-8']]);
const staticRoot=fileURLToPath(new URL('../ui/',import.meta.url));
const CSP="default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
protocol.registerSchemesAsPrivileged([{scheme:'peos',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
app.setName('Project Engineering OS');
if (!app.requestSingleInstanceLock()) app.quit();
else void app.whenReady().then(async () => {
  let window;
  app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.show();window.focus();}});
  const ses=session.fromPartition('companion-local');
  ses.setPermissionRequestHandler((_contents,_permission,callback)=>callback(false));
  ses.setPermissionCheckHandler(()=>false);
  ses.webRequest.onBeforeRequest((details,callback)=>{
    let valid=false;try{const u=new URL(details.url);valid=u.protocol==='peos:'&&u.host==='app'&&assets.has(u.pathname)&&!u.search&&!u.hash;}catch{}
    callback({cancel:!valid});
  });
  await ses.protocol.handle('peos',async request=>{
    const u=new URL(request.url),type=assets.get(u.pathname);
    if(request.method!=='GET'||u.host!=='app'||!type||u.search||u.hash)return new Response('Not found',{status:404});
    return new Response(await readFile(path.join(staticRoot,u.pathname.slice(1))),{headers:{'Content-Type':type,'Content-Security-Policy':CSP,'X-Content-Type-Options':'nosniff'}});
  });
  window=new BrowserWindow({width:1180,height:820,minWidth:480,minHeight:540,show:false,backgroundColor:'#f8f8f3',title:'Project Engineering OS',
    webPreferences:{preload:fileURLToPath(new URL('./preload.cjs',import.meta.url)),partition:'companion-local',sandbox:true,contextIsolation:true,nodeIntegration:false,webSecurity:true,webviewTag:false,spellcheck:false}});
  Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'Ver',submenu:[{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{type:'separator'},{role:'togglefullscreen'}]}]));
  window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  window.webContents.on('will-navigate',event=>event.preventDefault());
  window.webContents.on('will-frame-navigate',event=>event.preventDefault());
  window.webContents.on('will-attach-webview',event=>event.preventDefault());
  // Managed runtimes are Windows x64 only, and their location can be unusable on any system.
  // Neither case may break startup or the in-process preparation that already works without them:
  // the app degrades to no environment capability and says so in the interface.
  let environment=null;
  if(process.platform==='win32'&&process.arch==='x64'){
    try{
      environment=createEnvironmentEngine(await createRuntimeManager({root:path.join(process.env.LOCALAPPDATA??app.getPath('userData'),'Project Engineering OS','runtimes')}));
    }catch(error){console.error('Runtime location unavailable:',error.code??error.name);}
  }
  const service=await createDesktopService({dataRoot:path.join(app.getPath('userData'),'projects'),core,environment,localApps:createLocalAppLauncher(),
    chooseFolder:async()=>{const result=await dialog.showOpenDialog(window,{title:'Elige la carpeta de tu proyecto',buttonLabel:'Usar esta carpeta',properties:['openDirectory','createDirectory','dontAddToRecent']});return result.canceled?null:result.filePaths[0];},
    copyText:value=>clipboard.writeText(value),openExternal:url=>shell.openExternal(url),
    onProgress:value=>{if(!window.isDestroyed())window.webContents.send('companion:progress',value);}});
  for(const [name,handler] of Object.entries(service))ipcMain.handle(`companion:${name}`,async(event,input)=>{
    try{
      if(event.sender!==window.webContents||event.senderFrame!==window.webContents.mainFrame||event.senderFrame.url!==APP_URL)throw Error('Untrusted sender');
      if(Buffer.byteLength(JSON.stringify(input??{}))>64000)throw Error('Oversized request');
      return {ok:true,value:await handler(input??{})};
    }catch(error){return {ok:false,error:publicError(error)};}
  });
  window.once('ready-to-show',()=>window.show());
  window.on('close',event=>{if(window.__closing)return;event.preventDefault();void (async()=>{
    const job=await service.job();if(job){await dialog.showMessageBox(window,{type:'info',message:'Hay una preparación en curso.',detail:'Usa Detener en la app y espera a que termine antes de cerrar.',buttons:['Volver al proyecto']});return;}
    window.__closing=true;window.close();})();});
  await window.loadURL(APP_URL);
  app.on('window-all-closed',()=>app.quit());
}).catch(error=>{
  console.error('Companion startup failed:', error);
  dialog.showErrorBox('No se pudo iniciar Project Engineering OS','La aplicación no pudo abrir su espacio local. Tus proyectos se conservan. Comprueba los permisos de la carpeta de datos y vuelve a abrir la app.');
  app.quit();
});
