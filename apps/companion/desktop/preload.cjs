const { contextBridge, ipcRenderer } = require('electron');
const methods = ['listProjects','chooseFolder','openProject','forgetProject','previewBase','applyBase','previewEnvironment','applyEnvironment','previewRepair','applyRepair','previewEngineering','applyEngineering','previewActivation','applyActivation','rollbackEngineering','previewContext','applyContext','previewCode','applyCode','searchCode','previewSync','status','recover','search','workspace','exportPreview','copyExport','handoffPreview','handoff','cancel','job'];
const api = Object.fromEntries(methods.map(name=>[name, input=>ipcRenderer.invoke(`companion:${name}`,input??{})]));
api.onProgress = callback => {
  if (typeof callback !== 'function') return () => {};
  const listener = (_event, value) => callback(value);
  ipcRenderer.on('companion:progress',listener);
  return () => ipcRenderer.removeListener('companion:progress',listener);
};
contextBridge.exposeInMainWorld('companion',Object.freeze(api));
