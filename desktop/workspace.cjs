'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),{randomUUID}=require('node:crypto');
const LIMIT=200*1024*1024;
function serialize(data){const text=JSON.stringify(data);if(!text||Buffer.byteLength(text)>LIMIT)throw Error('Workspace exceeds the 200 MB limit.');return text;}
function createWorkspaceStore(directory){const file=path.join(directory,'workspace.json');let queue=Promise.resolve();
 async function read(){try{return {exists:true,data:JSON.parse(await fs.readFile(file,'utf8'))};}catch(e){if(e.code==='ENOENT')return {exists:false,data:null};throw Error('The saved workspace could not be read. Your original file has been kept.');}}
 function enqueue(fn){const result=queue.catch(()=>{}).then(fn);queue=result;return result;}
 return {load:()=>enqueue(read),save:(data,revision)=>enqueue(async()=>{if(!data||data.version!==2||!Array.isArray(data.services)||!Array.isArray(data.library))throw Error('Invalid workspace.');const current=await read();if((current.data?._revision||null)!==(revision||null))throw Error('This workspace changed in another window. Reload before editing.');const next={...data,_revision:randomUUID()},text=serialize(next);await fs.mkdir(directory,{recursive:true});const temporary=file+'.'+randomUUID()+'.tmp';try{await fs.writeFile(temporary,text,{flag:'wx',mode:0o600});if(current.exists)await fs.copyFile(file,file+'.previous');await fs.rename(temporary,file);}finally{await fs.rm(temporary,{force:true});}return next._revision;}),recover:()=>enqueue(async()=>{await fs.mkdir(directory,{recursive:true});try{await fs.rename(file,path.join(directory,'workspace-recovery-'+Date.now()+'-'+randomUUID()+'.json'));}catch(e){if(e.code!=='ENOENT')throw e;}return true;})};
}
module.exports={createWorkspaceStore,serialize};
