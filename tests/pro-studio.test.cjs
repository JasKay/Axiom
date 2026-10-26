'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom'),{IDBFactory,IDBKeyRange}=require('fake-indexeddb');

test('service tree navigation and live indicators stay separate from the preparation selection',async()=>{
  const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
  const dom=await JSDOM.fromFile(path.resolve(__dirname,'../web/studio.html'),{
    runScripts:'dangerously',resources:'usable',pretendToBeVisual:true,virtualConsole:vc,
    beforeParse(w){w.structuredClone=structuredClone;w.indexedDB=new IDBFactory();w.IDBKeyRange=IDBKeyRange;w.BroadcastChannel=class{postMessage(){}};w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.play=async()=>{};w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};}
  });
  try{
    const w=dom.window,d=w.document,el=id=>d.getElementById(id);
    await new Promise(resolve=>w.addEventListener('load',resolve));
    for(let i=0;i<50&&!d.querySelector('.studio-deck');i++)await new Promise(resolve=>setTimeout(resolve,20));
    assert.equal(d.querySelectorAll('.studio-service').length,1);
    const originalDeck=el('active-deck').value;
    el('new-deck').click();el('deck-inline-name').value='Evening worship';el('deck-inline-name').dispatchEvent(new w.Event('blur'));
    assert.equal(d.querySelectorAll('.studio-deck').length,2);
    assert.equal(d.querySelector('.studio-deck[aria-current=page]').textContent,'Evening worship');
    d.querySelector('.studio-deck[data-deck-id="'+originalDeck+'"]').click();
    assert.equal(el('active-deck').value,originalDeck);
    el('add-slide').click();d.querySelectorAll('.slide-card')[0].click();el('go-live').click();
    const livePage=d.querySelector('.slide-card.is-live').dataset.slideId;
    d.querySelectorAll('.slide-card')[1].click();
    assert.equal(d.querySelector('.slide-card.is-live').dataset.slideId,livePage);
    assert.notEqual(d.querySelector('.slide-card.selected').dataset.slideId,livePage);
    assert.equal(el('preview-position').textContent,'2 / 2');
    el('blackout').click();assert.equal(d.querySelectorAll('.slide-card.is-live').length,0);assert.equal(d.body.dataset.outputState,'blackout');
    el('blackout').click();assert.equal(d.querySelector('.slide-card.is-live').dataset.slideId,livePage);
    el('next').click();assert.ok(d.querySelector('.slide-card.selected.is-live'));
    const outputText=el('live-preview').textContent;el('edit-text').value='Revised slide, ready for review';el('save-page').click();
    assert.equal(d.querySelectorAll('.slide-card.is-live').length,0,'A revised draft must not be marked as the snapshot currently live');
    assert.equal(el('live-preview').textContent,outputText,'Saving a draft must preserve live output');
    const other=[...d.querySelectorAll('.studio-deck')].find(button=>button.textContent==='Evening worship');other.click();
    assert.equal(d.querySelectorAll('.slide-card').length,0);
    assert.equal(d.querySelector('.studio-deck.deck-live').dataset.deckId,originalDeck);
    el('quick-new-service').click();assert.equal(d.querySelectorAll('.studio-service').length,2);
    assert.ok(d.querySelector('.studio-service.current[open]'));
    el('editor').open=true;el('close-slide-editor').click();assert.equal(el('editor').open,false);
    assert.equal(d.querySelector('.studio-import-menu'),null);assert.equal(el('presentation-layout').closest('.deck-toolbar')!==null,true);assert.equal(d.querySelector('.deck-toolbar .deck-options'),null);
    assert.deepEqual(errors,[]);
  }finally{dom.window.close();}
});
