const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('launchcat',{
  analyzeRepo:input=>ipcRenderer.invoke('launchcat:analyze-repo',input),
  chooseImage:()=>ipcRenderer.invoke('launchcat:choose-image'),
  savePng:p=>ipcRenderer.invoke('launchcat:save-png',p),
  revealFile:p=>ipcRenderer.invoke('launchcat:reveal-file',p),
  openExternal:url=>ipcRenderer.invoke('launchcat:open-external',url)
});
