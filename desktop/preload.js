const {contextBridge,ipcRenderer}=require('electron');contextBridge.exposeInMainWorld('desktopShell',{isDesktop:true,fullscreen:mode=>ipcRenderer.send('output-fullscreen',mode)});
