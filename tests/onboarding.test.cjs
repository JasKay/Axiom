'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {readFileSync}=require('node:fs'),path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
function page(query='?signup=1'){
 const dom=new JSDOM('<div id="access-gate"><h1>Welcome</h1><p>Welcome to Axiom</p><button id="gate-sign-in"></button><button id="gate-sign-up"></button><p id="gate-message"></p></div>',{url:'https://axiom.test/workspace.html'+query,runScripts:'outside-only',virtualConsole:new VirtualConsole()});
 const w=dom.window;w.$=id=>w.document.getElementById(id);w.el=(tag,text,className)=>{const e=w.document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;};w.run=fn=>fn();w.AbortSignal.timeout=()=>undefined;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 w.eval(readFileSync(path.resolve(__dirname,'../web/workspaces.js'),'utf8'));
 w.eval(readFileSync(path.resolve(__dirname,'../web/cloud-client.js'),'utf8'));
 w.eval(readFileSync(path.resolve(__dirname,'../web/experiences.js'),'utf8')+'\nwindow.renderOnboarding=renderOnboarding;');
 return dom;
}
function fillAccount(w){w.$('account-name').value='Test leader';w.$('account-username').value='test_leader';w.$('account-password').value='A long test password';}
test('public signup registers the church and leadership account in one submission',async()=>{
 const dom=page(),w=dom.window;try{
  const calls=[];w.fetch=async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return{ok:true,json:async()=>({user:{id:'founder'},churchId:'church',audience:'lead'})};};
  await w.AxiomCloud.signIn(true);fillAccount(w);w.$('account-church').value='Grace Church';
  assert.equal(w.$('account-signup-mode').value,'create');assert.equal(w.$('account-church').required,true);assert.equal(w.document.querySelectorAll('#account-experience').length,0);
  await w.$('account-form').onsubmit({preventDefault(){}});
  assert.equal(calls.length,1);assert.equal(calls[0].body.churchName,'Grace Church');assert.equal(calls[0].body.signupMode,'create');assert.equal(calls[0].body.audience,undefined);assert.equal(w.location.search,'?church=church');
 }finally{dom.window.close();}
});
test('invited signup sends the code without offering a role or separate church',async()=>{
 const code='ABCD1234-ABCD1234-ABCD1234-ABCD1234',dom=page('?signup=1&join='+code),w=dom.window;
 try{
  let sent;w.fetch=async(url,options)=>{if(url.includes('action=invitation'))return{ok:true,json:async()=>({churchName:'Grace Church',audience:'pro',workspaceName:'Axiom Pro Workspace',description:'Media tools for your church.'})};sent=JSON.parse(options.body);return{ok:true,json:async()=>({user:{id:'invitee'},churchId:'same-church',audience:'pro'})};};
  await w.AxiomCloud.signIn(true);fillAccount(w);
  assert.match(w.$('account-title').textContent,/Grace Church/);assert.match(w.$('account-description').textContent,/Axiom Pro Workspace/);assert.equal(w.$('account-mode-label').hidden,true);assert.equal(w.$('account-signup-mode').value,'join');assert.equal(w.$('account-code').value,code);assert.equal(w.$('account-code').required,true);assert.equal(w.$('account-church-label').hidden,true);assert.equal(w.$('account-church').required,false);
  await w.$('account-form').onsubmit({preventDefault(){}});
  assert.equal(sent.joinCode,code);assert.equal(sent.audience,undefined);assert.equal(w.location.search,'?church=same-church');
 }finally{dom.window.close();}
});
test('invalid church codes keep the form open and show the server error',async()=>{
 const dom=page('?signup=1&mode=join'),w=dom.window;try{
  w.fetch=async()=>({ok:false,status:410,json:async()=>({error:'This church code has expired.'})});
  await w.AxiomCloud.signIn(true);w.$('account-signup-mode').value='join';w.$('account-signup-mode').onchange();fillAccount(w);w.$('account-code').value='invalid';
  await w.$('account-form').onsubmit({preventDefault(){}});
  assert.match(w.$('account-error').textContent,/expired/);assert.equal(w.$('account-dialog').open,true);assert.equal(w.$('account-submit').disabled,false);
 }finally{dom.window.close();}
});
test('signin offers no church creation or role selection',async()=>{
 const dom=page(),w=dom.window;try{await w.AxiomCloud.signIn(false);for(const id of ['account-mode-label','account-name-label','account-church-label','account-code-label'])assert.equal(w.$(id).hidden,true);}finally{dom.window.close();}
});
test('legacy account setup retries opening a church without registering it twice',async()=>{
 const dom=page(),w=dom.window;
 try{
  w.user={id:'legacy-user'};let creates=0,opens=0;
  w.AxiomCloud.request=async(action,options)=>{assert.equal(action,'create-church');assert.equal(options.body.audience,'lead');creates++;return{id:'created-church'};};w.overview=async()=>{opens++;if(opens===1)throw Error('Connection interrupted');};
  w.renderOnboarding();w.$('onboarding-mode').value='create';w.$('onboarding-mode').onchange();w.$('onboarding-workspace-name').value='Grace Church';const form=w.$('experience-onboarding');
  await form.onsubmit({preventDefault(){}});assert.match(w.$('onboarding-error').textContent,/Connection interrupted/);assert.equal(form.querySelector('button').disabled,false);
  await form.onsubmit({preventDefault(){}});assert.equal(creates,1);assert.equal(opens,2);
 }finally{dom.window.close();}
});

test('a workspace-specific link rejects an invitation for another team',async()=>{
 const dom=page(),w=dom.window;dom.reconfigure({url:'https://axiom.test/axiomlead.html?signup=1&join='+('a'.repeat(32))});try{w.fetch=async()=>({ok:true,json:async()=>({audience:'pro',churchName:'Grace Church',workspaceName:'Axiom Pro Workspace'})});await w.AxiomCloud.signIn(true);assert.match(w.$('account-error').textContent,/original invitation link/);assert.equal(w.$('account-mode-label').hidden,true);}finally{dom.window.close();}
});
