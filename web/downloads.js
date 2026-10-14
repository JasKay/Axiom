document.getElementById('download').onclick=async()=>{
 const dialog=document.getElementById('download-dialog'),host=document.getElementById('download-options'),status=document.getElementById('download-status');
 dialog.showModal();status.textContent='Loading downloads…';host.replaceChildren();
 try{
  const response=await fetch('downloads.json',{cache:'no-store'});if(!response.ok)throw Error();const release=await response.json();
  for(const item of release.files){const a=document.createElement('a');a.className='download-card';a.href=item.url;a.textContent=item.label;const small=document.createElement('small');small.textContent=item.detail;a.append(small);host.append(a);}
  status.textContent=release.files.length?'Version '+release.version:'Desktop packages are being prepared.';
 }catch{status.textContent='Downloads are temporarily unavailable. Please try again.';}
};
