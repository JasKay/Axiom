'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom'),State=require('../web/state.js');
const script=name=>fs.readFileSync(require.resolve('../web/'+name),'utf8');
test('shared service details stay linked through renames without replacing Tech preparation',()=>{
 const dom=new JSDOM('',{runScripts:'outside-only'}),w=dom.window;try{
  w.State=State;w.structuredClone=structuredClone;w.eval(script('handoff.js'));
  const source=State.create(),shared=source.services[0],local=State.create();shared.name='Sunday service';shared.date='2026-11-01';shared.startTime='10:00';
  let result=w.AxiomHandoff.receive(local,[{service_id:shared.id,snapshot:source,revision:1}],'church');
  const imported=result.project.services.find(s=>s.cloud),id=imported.id,entryIds=imported.entries.map(e=>e.id),activeId=result.project.activeServiceId;
  imported.operatorNotes='Tech private notes';imported.entries[0].notes='Prepared cue';result.project.library.find(i=>i.id===imported.entries[0].itemId).slides[0].text='Prepared slide';
  shared.name='Sunday gathering';shared.date='2026-11-08';shared.startTime='11:30';shared.notes='Updated shared directions';shared.scriptureReferences='John 3:16';source.library[0].slides[0].text='New Leader draft';
  result=w.AxiomHandoff.receive(result.project,[{service_id:shared.id,snapshot:source,revision:2}],'church');
  const updated=result.project.services.find(s=>s.id===id);
  assert.equal(result.added,0);assert.equal(result.updated,1);assert.equal(result.project.services.filter(s=>s.cloud).length,1);
  assert.equal(updated.name,shared.name);assert.equal(updated.date,shared.date);assert.equal(updated.startTime,shared.startTime);assert.equal(updated.notes,shared.notes);assert.equal(updated.scriptureReferences,shared.scriptureReferences);
  assert.equal(updated.cloud.churchId,'church');assert.equal(updated.cloud.serviceId,shared.id);assert.equal(updated.cloud.revision,1);assert.equal(updated.cloud.detailsRevision,2);
  assert.deepEqual(updated.entries.map(e=>e.id),entryIds);assert.equal(updated.entries[0].notes,'Prepared cue');assert.equal(updated.operatorNotes,'Tech private notes');assert.equal(result.project.activeServiceId,activeId);assert.equal(result.project.library.find(i=>i.id===updated.entries[0].itemId).slides[0].text,'Prepared slide');
  assert.equal(w.AxiomHandoff.receive(result.project,[{service_id:shared.id,snapshot:source,revision:2}],'church').updated,0);
 }finally{w.close();}
});
test('new shared services populate locally without changing selection, Tech work or later revisions',()=>{
 const dom=new JSDOM('',{runScripts:'outside-only'}),w=dom.window;try{
  w.State=State;w.structuredClone=structuredClone;w.eval(script('handoff.js'));
  const local=State.create(),active=local.activeServiceId,before=JSON.stringify(local),source=State.create(),id=source.services[0].id;
  const first=w.AxiomHandoff.receive(local,[{service_id:id,snapshot:source,revision:1}],'church');
  assert.equal(first.added,1);assert.equal(first.project.activeServiceId,active);assert.equal(JSON.stringify(local),before);
  const imported=first.project.services.find(s=>s.cloud);assert.equal(imported.entries.length,source.services[0].entries.length);
  first.project.library.find(i=>i.id===imported.entries[0].itemId).slides[0].text='Tech prepared this';
  source.library[0].slides[0].text='Leader revision';
  const again=w.AxiomHandoff.receive(first.project,[{service_id:id,snapshot:source,revision:2}],'church');
  assert.equal(again.added,0);assert.equal(again.project.library.find(i=>i.id===imported.entries[0].itemId).slides[0].text,'Tech prepared this');
  assert.equal(imported.cloud.revision,1);assert.doesNotThrow(()=>State.validate(again.project));
  const second=structuredClone(source);second.services[0].id=State.uid();second.activeServiceId=second.services[0].id;
  const third=w.AxiomHandoff.receive(first.project,[{service_id:second.activeServiceId,snapshot:second,revision:2}],'church');
  assert.equal(third.added,1);assert.equal(third.project.library.find(i=>i.id===imported.entries[0].itemId).slides[0].text,'Tech prepared this');
  assert.equal(third.project.services.filter(s=>s.cloud).length,2);
 }finally{w.close();}
});
test('unchanged authenticated snapshots send no body; file, message and permission changes invalidate them',()=>{
 const {snapshot}=require('../server/conditional.cjs');
 function call(data,etag){const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(d){this.body=d;return this;},end(){return this;}};snapshot({headers:{'if-none-match':etag}},res,data);return res;}
 const data={role:'editor',comments:[],files:[]},first=call(data);assert.equal(first.code,200);
 const unchanged=call(data,first.headers.ETag);assert.equal(unchanged.code,304);assert.equal(unchanged.body,undefined);assert.equal(unchanged.headers['Cache-Control'],'no-store');
 for(const changed of [{...data,role:'viewer'},{...data,comments:[{body:'New cue'}]},{...data,files:[{id:'image'}]}])assert.equal(call(changed,first.headers.ETag).code,200);
});
test('file downloads reuse bytes within a session and isolate accounts, churches and failed requests',async()=>{
 const dom=new JSDOM('',{runScripts:'outside-only'}),w=dom.window;try{
  let user='tech',calls=0,fail=false;w.structuredClone=structuredClone;w.AxiomCloud={load:async()=>({user:{id:user},session:{getToken:async()=>user+'-token'}})};
  w.URL.createObjectURL=()=> 'blob:demo';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=()=>{};
  w.fetch=async()=>{calls++;return {ok:!fail,blob:async()=>new Blob(['actual image bytes'])};};w.eval(script('team-files.js'));
  const file={id:'image',name:'image.png',size:18,created_at:'2026-10-26'};
  await Promise.all([w.AxiomTeamFiles.download('church',file),w.AxiomTeamFiles.download('church',file)]);assert.equal(calls,1);
  await w.AxiomTeamFiles.download('church',file);assert.equal(calls,1);
  await w.AxiomTeamFiles.download('another-church',file);assert.equal(calls,2);
  user='another-user';await w.AxiomTeamFiles.download('church',file);assert.equal(calls,3);
  fail=true;await assert.rejects(()=>w.AxiomTeamFiles.download('church',{...file,id:'failed'}),/unavailable/);
  fail=false;await w.AxiomTeamFiles.download('church',{...file,id:'failed'});assert.equal(calls,5);
 }finally{w.close();}
});
test('file-list revalidation reuses metadata and returns independent values',async()=>{
 const dom=new JSDOM('',{runScripts:'outside-only'}),w=dom.window;try{
  w.structuredClone=structuredClone;w.AxiomCloud={load:async()=>({user:{id:'tech'},session:{getToken:async()=> 'token'}})};let calls=0;
  w.fetch=async(url,options)=>{calls++;if(calls===2){assert.equal(options.headers['If-None-Match'],'"files"');return {status:304};}return {ok:true,status:200,headers:{get:()=> '"files"'},json:async()=>({files:[{id:'one',name:'Original'}]})};};w.eval(script('team-files.js'));
  const first=await w.AxiomTeamFiles.list('church');first[0].name='UI mutation';assert.equal((await w.AxiomTeamFiles.list('church'))[0].name,'Original');
 }finally{w.close();}
});
test('workspace revalidation avoids full payloads without allowing UI edits to corrupt cached snapshots',async()=>{
 const dom=new JSDOM('',{url:'https://axiom.test/axiomlead.html',runScripts:'outside-only'}),w=dom.window;try{
  w.structuredClone=structuredClone;let requests=0;
  w.fetch=async(url,options)=>{if(url.startsWith('/api/account'))return {ok:true,json:async()=>({user:{id:'lead',name:'Leader'},session:{token:'token'}})};
   requests++;if(requests===2){assert.equal(options.headers['If-None-Match'],'"workspace"');return {status:304};}
   return {ok:true,status:200,headers:{get:()=> '"workspace"'},json:async()=>({revision:1,project:{name:'Original'}})};};
  w.eval(script('cloud-client.js'));const first=await w.AxiomCloud.request('workspace',{church:'church'});first.project.name='Unsaved edit';
  assert.equal((await w.AxiomCloud.request('workspace',{church:'church'})).project.name,'Original');
 }finally{w.close();}
});
