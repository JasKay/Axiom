const {test}=require('node:test'),assert=require('node:assert/strict');require('../web/sermon-engine.js');
test('recognizes numbered books, spoken numbers and bounded verse ranges',()=>{
 assert.equal(SermonEngine.match('First John chapter four verse eight')[0].reference,'1 John 4:8');
 assert.equal(SermonEngine.match('Romans eight twenty eight')[0].reference,'Romans 8:28');
 assert.equal(SermonEngine.match('Psalm one hundred and nineteen verse one hundred and five')[0].reference,'Psalms 119:105');
 assert.equal(SermonEngine.match('John 3:16-18')[0].reference,'John 3:16-18');
 assert.deepEqual(SermonEngine.references('John 3:0 and John 3:16-100'),[]);
});
test('matches supported paraphrases without treating generic sermon language as scripture',()=>{
 assert.equal(SermonEngine.match('God works everything together for good')[0].reference,'Romans 8:28');
 assert.equal(SermonEngine.match('God has not given us a spirit of fear')[0].reference,'2 Timothy 1:7');
 assert.deepEqual(SermonEngine.match('Welcome everyone, please take your seats'),[]);
 assert.deepEqual(SermonEngine.match('God loves you'),[]);
 assert.equal(SermonEngine.coverage,40);
});
const {JSDOM,VirtualConsole}=require('jsdom'),{indexedDB,IDBKeyRange}=require('fake-indexeddb'),path=require('node:path');
test('review is required before projection, session clear stops audio, and errors release listening state',async()=>{
 const messages=[],errors=[];let rec,aborts=0;const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=await JSDOM.fromFile(path.resolve(__dirname,'../web/studio.html'),{runScripts:'dangerously',resources:'usable',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
  w.structuredClone=structuredClone;w.indexedDB=indexedDB;w.IDBKeyRange=IDBKeyRange;w.BroadcastChannel=class{postMessage(d){messages.push(d)}};
  w.SpeechRecognition=class{constructor(){rec=this}start(){this.onstart?.()}abort(){aborts++;this.onend?.()}};
  w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.play=()=>Promise.resolve();
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
  w.HTMLElement.prototype.scrollIntoView=function(){};
 }});
 try{await new Promise(r=>dom.window.addEventListener('load',()=>setTimeout(r,100)));const w=dom.window,d=w.document,$=id=>d.getElementById(id);
 w.AxiomBibles.search=async()=>({canPresent:true,verses:[{book:'2 Timothy',chapter:1,verse:7,text:'Verified passage fixture.'}]});
 d.querySelector('.desk-tabs .desk-ai').click();assert.equal($('sermon-view').hidden,false);assert.equal($('sermon-view').closest('dialog').open,true);
 const initial=messages.length;$('sermon-example').click();assert.equal(d.querySelectorAll('.sermon-card').length,1);assert.equal(messages.length,initial);
 const review=d.querySelector('.sermon-card .primary');review.click();await new Promise(r=>setTimeout(r,10));assert.equal(review.textContent,'Go Live →');assert.equal(messages.length,initial);
 review.click();assert.equal(messages.at(-1).state.slide.text,'Verified passage fixture.');assert.equal($('sermon-view').hidden,false);
 $('sermon-start').click();assert.equal($('sermon-start').getAttribute('aria-pressed'),'true');
 rec.onerror({error:'not-allowed'});assert.equal($('sermon-start').getAttribute('aria-pressed'),'false');assert.match($('sermon-status').textContent,/denied/);assert.equal(aborts,1);
 $('sermon-start').click();const speech=[{transcript:'Romans chapter eight verse twenty eight'}];speech.isFinal=true;rec.onresult({resultIndex:0,results:[speech]});assert.match($('sermon-transcript').textContent,/Romans/);assert.equal(d.querySelectorAll('.sermon-card').length,2);w.eval("setView('library')");assert.equal($('sermon-start').getAttribute('aria-pressed'),'true');assert.equal(aborts,1);assert.equal($('bible-dialog').open,true);$('sermon-clear').click();assert.equal(aborts,2);assert.equal(d.querySelectorAll('.sermon-card').length,0);assert.equal($('sermon-transcript').textContent,'Your live words will appear here.');assert.deepEqual(errors,[]);
 }finally{dom.window.close();}
});
