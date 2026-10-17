/* Updates install only after an explicit operator action. */
(async()=>{
 const bridge=window.desktopShell,button=document.getElementById('desktop-updates');if(!bridge?.getAppInfo||!button)return;
 const info=await bridge.getAppInfo(),native=info.platform==='win32'&&!!bridge.installUpdate;let latest,busy=false,poll;
 button.hidden=false;button.textContent='Axiom '+info.version+' · Check for updates';
 const dialog=document.createElement('dialog');dialog.id='desktop-update-dialog';dialog.className='asset-dialog';dialog.setAttribute('aria-labelledby','desktop-update-title');
 dialog.innerHTML='<div class="asset-dialog-header"><h2 id="desktop-update-title">App updates</h2><button class="quiet" id="close-update" aria-label="Close updates">✕</button></div><p id="update-description" role="status"></p><p class="update-instructions"></p><progress id="update-progress" max="100" value="0" hidden aria-label="Update download progress"></progress><button id="get-update" class="primary" hidden></button>';
 document.body.append(dialog);const close=dialog.querySelector('#close-update'),description=dialog.querySelector('#update-description'),download=dialog.querySelector('#get-update'),progress=dialog.querySelector('#update-progress');
 dialog.querySelector('.update-instructions').textContent=native?'Downloads, saves your services, installs and restarts Axiom. Choose a time when you are ready to stop presenting.':'Download the installer, close Axiom and run it to update. Your saved services stay on this computer.';
 close.onclick=()=>dialog.close();dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});
 const setBusy=value=>{busy=value;button.disabled=value;close.disabled=value;download.disabled=value;};
 function available(){button.textContent='Axiom '+info.version+' · Update available';description.textContent='Axiom '+latest.latestVersion+' is available. You have '+info.version+'.';download.hidden=false;download.textContent=native?'Update and restart':'Download '+latest.latestVersion;if(!document.getElementById('desktop-update-notice')){const notice=document.createElement('button');notice.id='desktop-update-notice';notice.className='desktop-update-notice';notice.textContent='Axiom '+latest.latestVersion+' is available · View update';notice.onclick=()=>{if(!dialog.open)dialog.showModal();};button.before(notice);}}
 async function check(show){if(busy)return;if(show&&!dialog.open)dialog.showModal();setBusy(true);if(show){description.textContent='Checking for updates…';download.hidden=true;}try{latest=await bridge.checkForUpdates();if(latest.available)available();else if(show)description.textContent='You’re up to date · Axiom '+info.version;}catch(e){if(show)description.textContent=e.message||'Unable to check. Try again when online.';}finally{setBusy(false);}}
 download.onclick=async()=>{if(busy)return;if(!native){try{await bridge.downloadUpdate();}catch(e){description.textContent=e.message;}return;}setBusy(true);progress.hidden=false;progress.value=0;description.textContent='Downloading update…';let restarting=false;
  const refresh=async()=>{try{const state=await bridge.getUpdateState();if(state?.status==='downloading'){progress.value=state.percent;description.textContent='Downloading update · '+Math.round(state.percent)+'%';}if(state?.status==='error'){description.textContent=state.error;clearInterval(poll);setBusy(false);}}catch{}};
  poll=setInterval(refresh,300);
  try{await bridge.downloadUpdate();progress.value=100;description.textContent='Saving your workspace…';await window.AxiomSaveForUpdate();description.textContent='Installing update and restarting…';restarting=await bridge.installUpdate();if(!restarting){description.textContent='Update downloaded. Install when you are ready.';download.textContent='Install and restart';}}
  catch(e){description.textContent=e.message||'Update failed. Try again.';download.textContent='Retry update';}finally{if(!restarting){clearInterval(poll);setBusy(false);}}
 };
 button.onclick=()=>check(true);setTimeout(()=>check(false),5000);window.addEventListener('pagehide',()=>clearInterval(poll));
})();
