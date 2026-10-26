/* Workspace choice does not replace the local project or restart the output. */
(()=>{
 const context=window.AxiomProContext||{},storage={get(key){try{return localStorage.getItem(key);}catch{return null;}},set(key,value){try{localStorage.setItem(key,value);}catch{}}};
 let mode=context.church&&storage.get('axiom-pro-mode')!=='standalone'?'connected':'standalone',busy=false;
 const lastKey=value=>'axiom-pro-last:'+ (value==='standalone'?'standalone':context.church+':'+context.user?.id);
 const linked=s=>s.cloud?.churchId===context.church;
 function visible(s){return !s.cloud||(mode==='connected'&&linked(s));}
 function remember(){if(typeof project==='undefined'||!project)return;const s=service();if(!s.cloud)storage.set(lastKey('standalone'),s.id);else if(linked(s))storage.set(lastKey('connected'),s.id);}
 function notify(){context.mode=mode;document.body.dataset.proMode=mode;document.body.dataset.inboxMode=mode==='connected'?'connected':'standalone';storage.set('axiom-pro-mode',mode);const select=document.getElementById('pro-mode-select');if(select)select.value=mode;window.dispatchEvent(new CustomEvent('axiom-pro-mode-change',{detail:{mode,church:context.church,user:context.user?.id}}));if(typeof project!=='undefined'&&project)draw();}
 function selectSaved(value){if(typeof project==='undefined'||!project)return;const candidates=project.services.filter(s=>value==='standalone'?!s.cloud:linked(s));let target=candidates.find(s=>s.id===storage.get(lastKey(value)))||candidates.find(s=>!s.archived)||candidates[0];if(!target&&value==='standalone'){const local=State.create();mutate(()=>{project.library.push(...local.library);project.services.push(...local.services);});target=local.services[0];}if(target&&target.id!==project.activeServiceId)switchPresentation(target.id);}
 async function connect(churchId){
  if(!navigator.onLine)throw Error('Connect to the internet to connect a church. Your local services are safe.');
  const auth=await AxiomCloud.load(true);if(!auth.user){await AxiomCloud.signIn(false);return false;}
  const overview=await AxiomCloud.request('overview'),membership=overview.churches.find(c=>c.audience==='pro'&&c.id===(churchId||context.church))||(!churchId?overview.churches.find(c=>c.audience==='pro'):null);
  if(!membership)throw Error('Join your church’s Tech team to use shared services.');
  await window.AxiomSaveForUpdate?.();remember();Object.assign(context,{church:membership.id,user:auth.user,role:membership.role,offline:false});
  storage.set('axiom-desktop-team','yes');storage.set('axiom-pro-access',JSON.stringify({church:membership.id,user:auth.user.id}));
  document.getElementById('pro-church').textContent=membership.name;window.AxiomWorkspaceUI?.churches(overview.churches,membership.id);auth.mountUserButton(document.getElementById('pro-account'));
  mode='connected';notify();selectSaved(mode);return true;
 }
 async function setMode(value){
  if(busy)return;busy=true;const select=document.getElementById('pro-mode-select');if(select)select.disabled=true;
  try{await window.AxiomSaveForUpdate?.();remember();if(value==='connected'){if(context.church&&!navigator.onLine){context.offline=true;mode=value;notify();selectSaved(value);}else await connect();}else{mode='standalone';notify();selectSaved(mode);}}
  finally{busy=false;if(select){select.disabled=false;select.value=mode;}}
 }
 window.AxiomProMode={get mode(){return mode;},visible,setMode,connect};window.AxiomOnAuthenticated=async result=>{await connect(result?.churchId);return true;};
 const host=document.querySelector('.service-navigator');if(host){const label=document.createElement('label');label.className='pro-mode-control';const text=document.createElement('span');text.textContent='Workspace';const select=document.createElement('select');select.id='pro-mode-select';select.setAttribute('aria-label','Presentation workspace');select.append(new Option('Standalone · on this device','standalone'),new Option('Shared · church workspace','connected'));select.value=mode;select.onchange=()=>run(()=>setMode(select.value));label.append(text,select);host.prepend(label);}
 window.addEventListener('axiom-project-change',remember);context.mode=mode;document.body.dataset.proMode=mode;document.body.dataset.inboxMode=mode==='connected'?'connected':'standalone';
 window.addEventListener('offline',()=>{if(mode==='connected'){context.offline=true;notify();}});
 window.addEventListener('online',()=>{if(mode==='connected'&&context.church&&context.offline)run(()=>connect(context.church));});
 if(typeof project!=='undefined'&&project&&mode==='standalone'&&service().cloud)selectSaved('standalone');
 window.addEventListener('axiom-project-change',()=>{if(typeof project!=='undefined'&&project&&mode==='standalone'&&service().cloud)selectSaved('standalone');},{once:true});
})();
