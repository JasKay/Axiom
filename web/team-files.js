/* File bytes are fetched on demand, never as part of the conversation refresh. */
window.AxiomTeamFiles=(()=>{
 const lists=new Map(),downloads=new Map(),pending=new Map();let account=null,bytes=0;
 const MAX_FILE=8*1024*1024,MAX_CACHE=32*1024*1024;
 async function session(){const auth=await AxiomCloud.load(),token=await auth.session?.getToken();if(!token)throw Error('Sign in to share files.');const id=auth.user?.id||token;if(account!==id){lists.clear();downloads.clear();pending.clear();bytes=0;account=id;}return {id,token};}
 function remember(key,blob){if(blob.size>MAX_FILE)return;while(bytes+blob.size>MAX_CACHE&&downloads.size){const oldest=downloads.keys().next().value;bytes-=downloads.get(oldest).size;downloads.delete(oldest);}downloads.set(key,blob);bytes+=blob.size;}
 return {
 async list(church){const {token}=await session(),previous=lists.get(church),r=await fetch('/api/files?'+new URLSearchParams({church}),{headers:{Authorization:'Bearer '+token,...(previous?{'If-None-Match':previous.etag}:{})},cache:'no-store',signal:AbortSignal.timeout(15000)});if(r.status===304&&previous)return structuredClone(previous.files);const data=await r.json();if(!r.ok)throw Error(data.error||'Files unavailable.');const etag=r.headers.get('ETag');if(etag){lists.set(church,{etag,files:structuredClone(data.files)});while(lists.size>4)lists.delete(lists.keys().next().value);}return data.files;},
 async download(church,file){
  const {id,token}=await session(),key=JSON.stringify([id,church,file.id,file.size,file.created_at]);let blob=downloads.get(key);
  if(blob){downloads.delete(key);downloads.set(key,blob);}else{
   let request=pending.get(key);if(!request){request=(async()=>{const r=await fetch('/api/files?'+new URLSearchParams({church,id:file.id}),{headers:{Authorization:'Bearer '+token},cache:'no-store',signal:AbortSignal.timeout(120000)});if(!r.ok)throw Error('File unavailable. Try again.');const result=await r.blob();if(account===id)remember(key,result);return result;})();pending.set(key,request);}
   try{blob=await request;}finally{if(pending.get(key)===request)pending.delete(key);}
  }
  if(account!==id)throw Error('Your account changed. Download the file again.');
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 },
 async upload(church,serviceId,file){if(!file||file.size>100*1024*1024)throw Error('Choose a file below 100 MB.');await window.AxiomStorageUsage?.checkFile(file);if(!window.AxiomUpload)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='vendor/platform.js';script.onload=resolve;script.onerror=()=>reject(Error('Unable to load file sharing. Please retry.'));document.body.append(script);});const auth=await AxiomCloud.load(),token=await auth.session.getToken(),id=crypto.randomUUID(),name=file.name.replace(/[^a-z0-9._-]/gi,'_').slice(0,180),ext=file.name.split('.').pop().toLowerCase();await AxiomUpload(`${church}/${id}/${name}`,file,{access:'private',handleUploadUrl:'/api/files',headers:{Authorization:'Bearer '+token},clientPayload:JSON.stringify({church,id,serviceId,name:file.name,size:file.size}),contentType:file.type||({pdf:'application/pdf',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',txt:'text/plain',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',mp4:'video/mp4',webm:'video/webm'})[ext]||'application/octet-stream'});const r=await fetch('/api/files',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({action:'finalize',church,id})});if(!r.ok){const data=await r.json();throw Error(data.error||'Could not attach the upload. Please retry.');}window.dispatchEvent(new Event('axiom-storage-change'));}
 };
})();
