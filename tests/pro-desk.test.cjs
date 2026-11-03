'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom'),{IDBFactory,IDBKeyRange}=require('fake-indexeddb');
test('operator desk saves reusable playlists, inserts service content, and reviews detected Bible references privately',async()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=await JSDOM.fromFile(path.resolve(__dirname,'../web/studio.html'),{runScripts:'dangerously',resources:'usable',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.structuredClone=structuredClone;w.indexedDB=new IDBFactory();w.IDBKeyRange=IDBKeyRange;w.BroadcastChannel=class{postMessage(){}};w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.play=async()=>{};w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};w.confirm=()=>true;w.prompt=()=> 'Sunday favourites';}});
 try{const w=dom.window,d=w.document;await new Promise(r=>w.addEventListener('load',r));for(let i=0;i<100&&!w.AxiomPremium;i++)await new Promise(r=>setTimeout(r,20));
 assert.ok(d.body.classList.contains('operator-desk'));assert.equal(d.querySelector('.studio-rail,.sidebar-toggle-pro'),null);assert.equal(d.body.classList.contains('sidebar-collapsed'),false);assert.ok(d.querySelector('.sidebar #team-view'));assert.ok(d.querySelector('.inspector .desk-playlists'));assert.ok(d.querySelector('main>#library-view'));assert.equal(d.querySelectorAll('.desk-gear').length,1);
 d.querySelector('.desk-playlists .navigator-heading>button').click();const fields=d.querySelectorAll('#premium-playlist-content input,#premium-playlist-content textarea');fields[0].value='Sunday song';fields[1].value='Sunday lyrics';d.querySelector('#premium-playlist-content form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(w.eval('project.playlists[0].itemIds.length'),1);const before=w.eval('service().entries.length');d.querySelector('.premium-playlist-item').dispatchEvent(new w.MouseEvent('contextmenu',{bubbles:true,clientX:100,clientY:100}));[...d.querySelectorAll('.premium-context button')].find(b=>b.textContent==='Add to slides').click();assert.equal(w.eval('service().entries.length'),before+1);assert.equal(d.querySelectorAll('.desk-group').length,before+1);
 assert.equal(w.eval('State.validate(structuredClone(project)).playlists.length'),1);
 d.getElementById('go-live').click();const publicText=d.getElementById('live-preview').textContent;let searched='';w.AxiomBibles.search=async(version,q)=>{searched=q;return {translation:'KJV',canPresent:true,verses:[{book:'John',chapter:3,verse:16,text:'For God so loved the world'}]}};
 w.dispatchEvent(new w.CustomEvent('axiom-verse-detected',{detail:{reference:'John 3:16'}}));await new Promise(r=>setTimeout(r,20));assert.equal(d.getElementById('bible-dialog').open,true);assert.equal(searched,'John 3:16');assert.equal(d.getElementById('live-preview').textContent,publicText);
 assert.equal(w.AxiomBibles.normalizeQuery('jn3:16'),'John 3:16');d.querySelector('.desk-gear').click();assert.equal(d.getElementById('desk-settings').open,true);d.getElementById('desk-theme').value='light';d.getElementById('desk-theme').dispatchEvent(new w.Event('change'));assert.equal(d.body.dataset.deskTheme,'light');
 d.querySelector('.desk-resize.right').dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight'}));assert.equal(d.querySelector('.app-layout').style.getPropertyValue('--desk-right'),'19%');d.getElementById('desk-reset').click();assert.equal(d.querySelector('.app-layout').style.getPropertyValue('--desk-right'),'18%');assert.equal(d.querySelector('.app-layout').style.getPropertyValue('--desk-left'),'16%');
 // Multiple selection, grouped formatting and presentation-header affordances.
 assert.equal(d.getElementById('edit-size').tagName,'SELECT','Text size uses numeric choices');
 assert.ok([...d.getElementById('edit-size').options].some(o=>o.value==='60'));
 w.eval("mutate(()=>{item().slides.push(State.newSlide('Second page'));item().slides.push(State.newSlide('Third page'));});");
 const slides=[...d.querySelectorAll('#slides .slide-card')];
 assert.ok(slides.length>=3);
 slides[0].dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
 slides[2].dispatchEvent(new w.MouseEvent('click',{bubbles:true,shiftKey:true}));
 assert.equal(d.getElementById('multi-page-toolbar').hidden,false);
 assert.match(d.getElementById('multi-page-count').textContent,/3 pages selected/);
 d.getElementById('multi-page-edit').click();
 d.getElementById('bulk-font-check').checked=true;
 d.getElementById('bulk-font').value='60';
 d.getElementById('bulk-apply').click();
 assert.ok(w.eval("item().slides.slice(0,3).every(s=>s.font===60)"),'All selected pages receive the same font size');
 d.getElementById('desk-headers').click();
 assert.ok(d.querySelectorAll('.desk-heading-order .desk-header-draggable').length>0);
 assert.equal(d.querySelectorAll('.desk-heading-order .desk-header-order-move').length,0);
 assert.deepEqual(errors,[]);
 }finally{dom.window.close()}
});
