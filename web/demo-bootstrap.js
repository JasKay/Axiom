/* Only the generated sample editor/output loads this script. */
(()=>{
 if(!/\/demo-(studio|output)\.html$/.test(location.pathname))return;
 const session=window.sessionStorage,prefix='axiom-demo:',projectKey=prefix+'project',idKey=prefix+'session';
 let resetting=false;let id=session.getItem(idKey);if(!id){id=crypto.randomUUID();session.setItem(idKey,id);}
 const preferences={getItem:key=>session.getItem(prefix+'pref:'+key),setItem:(key,value)=>session.setItem(prefix+'pref:'+key,String(value)),removeItem:key=>session.removeItem(prefix+'pref:'+key),clear(){for(const key of Object.keys(session))if(key.startsWith(prefix+'pref:'))session.removeItem(key);},key:index=>Object.keys(session).filter(k=>k.startsWith(prefix+'pref:'))[index]?.slice((prefix+'pref:').length)||null,get length(){return Object.keys(session).filter(k=>k.startsWith(prefix+'pref:')).length;}};
 Object.defineProperty(window,'localStorage',{value:preferences,configurable:true});
 const nativeFetch=window.fetch.bind(window);window.fetch=(input,options={})=>{const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url,location.href);if(url.pathname.startsWith('/api/')||url.hostname.endsWith('blob.vercel-storage.com'))return Promise.reject(Error('Church accounts and shared files are available in the full app. This sample stays separate.'));return nativeFetch(input,{...options,credentials:'omit'});};
 async function sample(){
  const p=State.create(),welcome={...State.newSlide('Welcome.\nYou belong here.'),title:'Welcome',design:'editorial',bg:'#e6e4dc',fg:'#252e27',font:52,fontFamily:'Georgia',align:'left'};
  const scripture=await AxiomBibles.search('WEB','John 3:16');
  p.library=[{id:State.uid(),title:'Welcome',slides:[welcome]},{id:State.uid(),title:'Worship',slides:[{...State.newSlide('Together in His presence.\nWith grateful hearts, we worship.'),title:'Worship',bg:'#253d31',design:'forest',font:42}]},{id:State.uid(),title:'Bible reading',slides:scripture.verses.map(v=>State.scriptureSlide(v,'WEB'))},{id:State.uid(),title:'Closing',slides:[{...State.newSlide('Go in peace.\nCarry hope into the week.'),title:'Closing',bg:'#292b37',design:'ink',font:44}]}];
  p.services[0].name='Sunday gathering · sample';p.services[0].entries=p.library.map(i=>({id:State.uid(),itemId:i.id}));return p;
 }
 window.AxiomDemo={channel:'axiom-demo-output:'+id,store:{async load(){const saved=session.getItem(projectKey);return saved?JSON.parse(saved):sample();},async save(value){if(resetting)return;try{session.setItem(projectKey,JSON.stringify(value));}catch{throw Error('This demo’s temporary storage is full. Download Axiom Pro for larger files and permanent projects.');}}},ready(){
  document.body.classList.add('demo-workspace');document.querySelector('.workspace-product').textContent='DEMO';document.querySelector('.app-header .brand').href='/';document.querySelector('.app-header .brand').target='_top';
  const tools=document.querySelector('.header-tools'),reset=document.createElement('button');reset.textContent='Reset sample';reset.className='quiet';reset.onclick=()=>{if(confirm('Reset this sample service? Your personal workspace is unaffected.')){resetting=true;session.removeItem(projectKey);location.reload();}};tools.prepend(reset);
  const mode=document.querySelector('.desk-workspace-mode');if(mode){mode.textContent='Sample workspace';mode.disabled=true;}
  document.querySelector('.desk-ai')?.remove();document.getElementById('bible-version').value='WEB';document.getElementById('bible-version').dispatchEvent(new Event('change'));
  const ready=()=>{if(typeof project==='undefined'||!project)return;document.getElementById('save-status').textContent='Sample · temporary in this tab';window.parent.postMessage({type:'axiom-demo-ready'},location.origin);};window.addEventListener('axiom-project-change',ready);ready();
 }};
})();