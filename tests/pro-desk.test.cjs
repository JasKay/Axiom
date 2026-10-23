'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom'),{IDBFactory,IDBKeyRange}=require('fake-indexeddb');
test('operator desk saves reusable playlists, inserts service content, and reviews detected Bible references privately',async()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=await JSDOM.fromFile(path.resolve(__dirname,'../web/studio.html'),{runScripts:'dangerously',resources:'usable',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.structuredClone=structuredClone;w.indexedDB=new IDBFactory();w.IDBKeyRange=IDBKeyRange;w.BroadcastChannel=class{postMessage(){}};w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.play=async()=>{};w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};w.confirm=()=>true;w.prompt=()=> 'Sunday favourites';}});
 try{const w=dom.window,d=w.document;await new Promise(r=>w.addEventListener('load',r));for(let i=0;i<100&&!d.querySelector('.desk-playlists');i++)await new Promise(r=>setTimeout(r,20));
 assert.ok(d.body.classList.contains('operator-desk'));assert.equal(d.querySelector('.studio-rail,.sidebar-toggle-pro'),null);assert.equal(d.body.classList.contains('sidebar-collapsed'),false);assert.ok(d.querySelector('.sidebar #team-view'));assert.ok(d.querySelector('.inspector .desk-playlists'));assert.ok(d.querySelector('main>#library-view'));assert.equal(d.querySelectorAll('.desk-gear').length,1);
 d.querySelector('.desk-playlists .navigator-heading button').click();d.getElementById('desk-name-input').value='Sunday favourites';d.getElementById('desk-name-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await new Promise(r=>setTimeout(r,0));d.querySelector('.desk-playlist-list>button').click();[...d.querySelectorAll('.desk-playlist-list button')].find(b=>b.textContent==='+ Save content').click();assert.equal(w.eval('project.playlists[0].itemIds.length'),1);
 const before=w.eval('service().entries.length');d.querySelector('.desk-playlist-item button').click();assert.equal(w.eval('service().entries.length'),before+1);assert.equal(d.querySelectorAll('.desk-group').length,before+1);
 assert.equal(w.eval('State.validate(structuredClone(project)).playlists.length'),1);
 d.getElementById('go-live').click();const publicText=d.getElementById('live-preview').textContent;let searched='';w.AxiomBibles.search=async(version,q)=>{searched=q;return {translation:'KJV',canPresent:true,verses:[{book:'John',chapter:3,verse:16,text:'For God so loved the world'}]}};
 w.dispatchEvent(new w.CustomEvent('axiom-verse-detected',{detail:{reference:'John 3:16'}}));await new Promise(r=>setTimeout(r,20));assert.equal(d.getElementById('bible-dialog').open,true);assert.equal(searched,'John 3:16');assert.equal(d.getElementById('live-preview').textContent,publicText);
 assert.equal(w.AxiomBibles.normalizeQuery('jn3:16'),'John 3:16');d.querySelector('.desk-gear').click();assert.equal(d.getElementById('desk-settings').open,true);d.getElementById('desk-theme').value='light';d.getElementById('desk-theme').dispatchEvent(new w.Event('change'));assert.equal(d.body.dataset.deskTheme,'light');
 assert.deepEqual(errors,[]);
 }finally{dom.window.close()}
});
