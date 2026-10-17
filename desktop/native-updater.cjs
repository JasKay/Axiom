'use strict';
const {newer}=require('./updates.cjs');
function createNativeUpdater(updater,currentVersion,schedule=fn=>setTimeout(fn,150)){
 updater.autoDownload=false;updater.autoInstallOnAppQuit=false;updater.allowDowngrade=false;updater.allowPrerelease=false;
 let state={status:'idle',currentVersion,latestVersion:currentVersion,available:false,nativeInstall:true,percent:0},checking,downloading;
 const set=patch=>{state={...state,...patch};};
 updater.on('update-available',info=>set({status:'available',latestVersion:info.version,available:newer(info.version,currentVersion),percent:0,error:null}));
 updater.on('update-not-available',()=>set({status:'current',latestVersion:currentVersion,available:false,error:null}));
 updater.on('download-progress',progress=>set({status:'downloading',percent:Math.max(0,Math.min(100,progress.percent||0))}));
 updater.on('update-downloaded',()=>set({status:'ready',percent:100}));
 updater.on('error',error=>set({status:'error',error:error.message||'Update failed. Check your connection and try again.'}));
 return {snapshot:()=>({...state}),async check(){if(downloading||state.status==='ready')return {...state};if(!checking)checking=(async()=>{set({status:'checking',error:null});try{await updater.checkForUpdates();return {...state};}catch(error){set({status:'error',error:error.message});throw error;}finally{checking=null;}})();return checking;},async download(){if(state.status==='ready')return {...state};if(downloading)return downloading;if(!state.available)throw Error('Check for an update first.');downloading=(async()=>{set({status:'downloading',percent:0,error:null});try{await updater.downloadUpdate();set({status:'ready',percent:100});return {...state};}catch(error){set({status:'error',error:error.message});throw error;}finally{downloading=null;}})();return downloading;},install(){if(state.status!=='ready')throw Error('Download and verify the update first.');set({status:'installing'});schedule(()=>{try{updater.quitAndInstall(true,true);}catch(error){set({status:'error',error:error.message});}});return true;}};
}
module.exports={createNativeUpdater};
