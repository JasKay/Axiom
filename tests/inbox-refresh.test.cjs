'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom'),State=require('../web/state.js');
const script=name=>fs.readFileSync(require.resolve('../web/'+name),'utf8');
const fixture=()=>{const snapshot=State.create();return {audience:'pro',role:'editor',handoffs:[{service_id:snapshot.services[0].id,snapshot,sent_at:'2026-10-20T10:00:00Z'}],comments:[{service_id:snapshot.services[0].id,author_id:'pastor',author_name:'Pastor',body:'The updated reading is ready',created_at:'2026-10-20T10:00:00Z'}]};};
test('late replies from the previous church cannot replace the current conversation',async()=>{
 const dom=new JSDOM(fs.readFileSync(require.resolve('../web/studio.html'),'utf8'),{url:'https://axiom.test/tech-media.html',runScripts:'outside-only'}),w=dom.window,old=fixture(),current=fixture();
 try{
  let resolveOld,oldSignal;current.handoffs[0].snapshot.services[0].name='Current church service';current.comments[0].body='Current church direction';
  w.$=id=>w.document.getElementById(id);w.view='service';w.project=State.create();w.service=()=>w.project.services[0];w.AxiomProContext={church:'old',user:{id:'tech'},role:'editor',mode:'connected'};
  w.AxiomScriptures={references:()=>[]};w.AxiomCloud={request:async(action,options)=>action==='workspace'?(options.church==='old'?new Promise(resolve=>{resolveOld=resolve;}):current):{services:[]},watch(church,callback,signal){if(church==='old')oldSignal=signal;}};
  w.AxiomTeamFiles={list:async()=>[]};w.AxiomServicePicker={render(){}};w.run=fn=>fn();w.openAsset=()=>{};
  for(const name of ['icons.js','messages.js','pro-inbox.js'])w.eval(script(name));
  w.AxiomProContext.church='current';w.dispatchEvent(new w.Event('axiom-pro-mode-change'));await new Promise(resolve=>setTimeout(resolve,25));
  assert.equal(oldSignal.aborted,true);assert.match(w.$('pro-messages').textContent,/Current church direction/);
  resolveOld(old);await new Promise(resolve=>setTimeout(resolve,25));assert.match(w.$('pro-messages').textContent,/Current church direction/);assert.doesNotMatch(w.$('pro-messages').textContent,/updated reading is ready/);
  w.AxiomProContext.mode='standalone';w.dispatchEvent(new w.Event('axiom-pro-mode-change'));assert.equal(w.$('pro-message-text').disabled,true);assert.match(w.$('pro-message-status').textContent,/paused/);
 }finally{w.close();}
});
test('the first shared service opens its message contents when Pro was already waiting',async()=>{
 const dom=new JSDOM(fs.readFileSync(require.resolve('../web/studio.html'),'utf8'),{url:'https://axiom.test/tech-media.html',runScripts:'outside-only'}),w=dom.window,shared=fixture(),data={audience:'pro',role:'editor',handoffs:[],comments:[]};
 try{
  let update;w.$=id=>w.document.getElementById(id);w.view='service';w.project=State.create();w.service=()=>w.project.services[0];
  w.AxiomProContext={church:'church',user:{id:'tech'},role:'editor'};w.AxiomScriptures={references:()=>[]};w.AxiomCloud={request:async action=>action==='workspace'?data:{services:[]},watch(church,callback){update=callback;}};
  w.AxiomTeamFiles={list:async()=>[]};w.AxiomServicePicker={render(){}};w.run=fn=>fn();w.openAsset=()=>{};
  for(const name of ['icons.js','messages.js','pro-inbox.js'])w.eval(script(name));
  await new Promise(resolve=>setTimeout(resolve,25));assert.equal(w.$('pro-service-picker').value,'');
  Object.assign(data,shared);update({revision:1});await new Promise(resolve=>setTimeout(resolve,25));
  assert.equal(w.$('pro-service-picker').value,shared.handoffs[0].service_id);assert.match(w.$('pro-messages').textContent,/updated reading is ready/);assert.equal(w.$('pro-message-text').disabled,false);
 }finally{w.close();}
});
test('local presentation changes retain the church conversation and unread notifications open its contents',async()=>{
 const dom=new JSDOM(fs.readFileSync(require.resolve('../web/studio.html'),'utf8'),{url:'https://axiom.test/tech-media.html?service=outdated-link',runScripts:'outside-only'}),w=dom.window,data=fixture();
 try{
  w.document.body.classList.add('operator-desk');w.document.getElementById('team-view').hidden=false;w.$=id=>w.document.getElementById(id);w.view='service';w.project=State.create();w.service=()=>w.project.services.find(s=>s.id===w.project.activeServiceId);
  const localId=w.project.activeServiceId,sharedId=data.handoffs[0].service_id;
  w.project.services.push({id:'shared-local',name:'Connected service',entries:[],cloud:{churchId:'church',serviceId:sharedId}});
  w.project.activeServiceId='shared-local';w.live={slide:{text:'Keep this live'}};const live=JSON.stringify(w.live);
  w.AxiomProContext={church:'church',user:{id:'tech'},role:'editor'};w.AxiomScriptures={references:()=>[]};w.AxiomCloud={request:async action=>action==='workspace'?data:{services:[]},watch(){}};
  w.AxiomTeamFiles={list:async()=>[]};w.AxiomServicePicker={render(){}};w.run=fn=>fn();w.openAsset=()=>{};
  for(const name of ['icons.js','messages.js','pro-inbox.js'])w.eval(script(name));
  await new Promise(resolve=>setTimeout(resolve,30));
  const picker=w.$('pro-service-picker'),thread=w.$('pro-messages'),input=w.$('pro-message-text');
  assert.equal(picker.value,sharedId,'An outdated URL must not hide the available conversation');
  input.value='Unsent Tech reply';w.project.activeServiceId=localId;w.dispatchEvent(new w.Event('axiom-project-change'));
  assert.equal(picker.value,sharedId);assert.match(thread.textContent,/updated reading is ready/);assert.equal(input.value,'Unsent Tech reply');
  picker.value='';picker.dispatchEvent(new w.Event('change'));assert.doesNotMatch(thread.textContent,/updated reading is ready/);
  assert.equal(w.$('pro-unread').hidden,false);w.$('pro-unread').click();
  assert.equal(picker.value,sharedId);assert.match(thread.textContent,/updated reading is ready/);assert.equal(input.value,'Unsent Tech reply');
  assert.equal(w.project.activeServiceId,localId);assert.equal(JSON.stringify(w.live),live);assert.equal(w.document.activeElement,thread);
 }finally{w.close();}
});
test('desktop messages arrive while the file-list request is still pending',async()=>{const dom=new JSDOM(fs.readFileSync(require.resolve('../web/studio.html'),'utf8'),{url:'https://axiom.test/tech-media.html',runScripts:'outside-only'}),w=dom.window,data=fixture();try{w.$=id=>w.document.getElementById(id);w.view='team';w.project=State.create();w.service=()=>w.project.services[0];w.AxiomProContext={church:'church',user:{id:'tech'},role:'editor'};w.AxiomScriptures={references:()=>[]};w.AxiomCloud={request:async action=>action==='workspace'?data:{services:[]},watch(){}};w.AxiomTeamFiles={list:()=>new Promise(()=>{})};w.AxiomServicePicker={render(){}};w.run=fn=>fn();w.openAsset=()=>{};w.eval(script('icons.js'));w.eval(script('messages.js'));w.eval(script('pro-inbox.js'));await new Promise(resolve=>setTimeout(resolve,50));assert.match(w.document.getElementById('pro-messages').textContent,/updated reading is ready/);assert.equal(w.document.getElementById('pro-message-text').disabled,false);}finally{w.close();}});
test('mobile messages and composer work without waiting for the file list',async()=>{const dom=new JSDOM(fs.readFileSync(require.resolve('../web/pro-mobile.html'),'utf8'),{url:'https://axiom.test/pro-mobile.html',runScripts:'outside-only'}),w=dom.window,data=fixture();try{w.AxiomCloud={load:async()=>({user:{id:'tech'},mountUserButton(){}}),request:async action=>action==='overview'?{churches:[{id:'church',name:'Church',audience:'pro'}]}:data,watch(){}};w.AxiomTeamFiles={list:()=>new Promise(()=>{})};for(const name of ['workspaces.js','icons.js','messages.js','service-picker.js','pro-mobile.js'])w.eval(script(name));await new Promise(resolve=>setTimeout(resolve,50));assert.match(w.document.getElementById('mobile-thread').textContent,/updated reading is ready/);assert.equal(w.document.getElementById('mobile-pro-app').hidden,false);assert.equal(w.document.getElementById('mobile-message-text').disabled,false);}finally{w.close();}});
