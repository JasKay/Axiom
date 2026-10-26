'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom'),State=require('../web/state.js');
function fixture(){
 const dom=new JSDOM('<div class="service-navigator"></div><span id="pro-church"></span><div id="pro-account"></div>',{url:'https://axiom.test/tech-media.html',runScripts:'outside-only'}),w=dom.window;
 w.structuredClone=structuredClone;w.State=State;w.project=State.create();const local=w.project.services[0];w.project.services.push({id:'shared-one',name:'Church service',entries:[],cloud:{churchId:'church',serviceId:'source'}});w.project.activeServiceId='shared-one';
 w.service=()=>w.project.services.find(s=>s.id===w.project.activeServiceId);w.live={slide:{text:'On air'},black:false};w.AxiomProContext={church:'church',user:{id:'tech'},role:'editor'};let saves=0;
 w.AxiomSaveForUpdate=async()=>{saves++;};w.draw=()=>w.dispatchEvent(new w.Event('axiom-project-change'));w.switchPresentation=id=>{w.project.activeServiceId=id;w.draw();};w.mutate=fn=>{fn();w.draw();};w.run=fn=>fn();
 const rows=[{id:'church',name:'My church',audience:'pro',role:'editor'}];w.AxiomCloud={load:async()=>({user:{id:'tech'},mountUserButton(){}}),request:async()=>({churches:rows})};
 w.eval(fs.readFileSync(require.resolve('../web/pro-mode.js'),'utf8'));return {dom,w,local,rows,get saves(){return saves;}};
}
test('Standalone and Shared preserve services, remembered selections and Program across repeated switches',async()=>{
 const f=fixture(),{w}=f;try{const ids=w.project.services.map(s=>s.id),live=JSON.stringify(w.live);assert.equal(w.document.getElementById('pro-mode-select').value,'connected');
  await w.AxiomProMode.setMode('standalone');assert.equal(w.service().id,f.local.id);assert.equal(w.AxiomProMode.visible(w.project.services[1]),false);
  w.project.services.push({id:'local-created',name:'Local draft',entries:[]});w.switchPresentation('local-created');await w.AxiomProMode.setMode('connected');assert.equal(w.service().id,'shared-one');
  await w.AxiomProMode.setMode('standalone');assert.equal(w.service().id,'local-created');await w.AxiomProMode.setMode('connected');assert.equal(w.project.services.length,3);assert.deepEqual(w.project.services.slice(0,2).map(s=>s.id),ids);assert.equal(JSON.stringify(w.live),live);assert.ok(f.saves>=4);
 }finally{w.close();}
});
test('offline cached shared services remain accessible; losing access cannot replace a local workspace',async()=>{
 const f=fixture(),{w}=f;try{
  await w.AxiomProMode.setMode('standalone');Object.defineProperty(w.navigator,'onLine',{configurable:true,value:false});await w.AxiomProMode.setMode('connected');assert.equal(w.service().id,'shared-one');assert.equal(w.AxiomProContext.offline,true);
  await w.AxiomProMode.setMode('standalone');Object.defineProperty(w.navigator,'onLine',{configurable:true,value:true});f.rows.length=0;const data=JSON.stringify(w.project);await assert.rejects(()=>w.AxiomProMode.setMode('connected'),/Tech team/);assert.equal(w.AxiomProMode.mode,'standalone');assert.equal(JSON.stringify(w.project),data);assert.equal(w.document.getElementById('pro-mode-select').disabled,false);
 }finally{w.close();}
});
test('switching churches retains stored data while showing only local and authorized current-church services',async()=>{
 const f=fixture(),{w}=f;try{
  f.rows.push({id:'another',name:'Another church',audience:'pro',role:'viewer'});w.project.services.push({id:'shared-two',name:'Another service',entries:[],cloud:{churchId:'another',serviceId:'source-two'}});
  await w.AxiomProMode.connect('another');assert.equal(w.service().id,'shared-two');assert.equal(w.AxiomProMode.visible(w.project.services.find(s=>s.id==='shared-one')),false);assert.equal(w.AxiomProMode.visible(f.local),true);assert.equal(w.project.services.length,3);
 }finally{w.close();}
});
