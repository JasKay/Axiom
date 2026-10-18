(function(){
'use strict';
let config,cached,modal,signup=false,invitation=null,invitationRequest=0;
async function configuration(){if(config)return config;try{const r=await fetch('/api/workspace?action=config',{cache:'no-store',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Cloud service unavailable');config=await r.json();}catch{config={cloud:false,ai:'local',files:false};}return config;}
async function accountRequest(path,body){const r=await fetch('/api/account?action='+encodeURIComponent(path),{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(20000)});let data;try{data=await r.json();}catch{throw Object.assign(Error('Account service is temporarily unavailable. Please try again.'),{status:r.status});}if(!r.ok)throw Object.assign(Error(data.message||data.error||'Account action failed'),{status:r.status});return data;}
async function load(refresh=false){if(cached&&!refresh)return cached;const data=await accountRequest('get-session');cached={user:data?.user||null,session:data?.session?{getToken:async()=>data.session.token}:null,mountUserButton(target){target.replaceChildren();const button=document.createElement('button');button.textContent=data.user.name+' ▾';button.className='button light small';button.onclick=()=>accountMenu(data.user);target.append(button);}};return cached;}
function dialog(){
 if(modal)return modal;
 modal=document.createElement('dialog');modal.id='account-dialog';modal.setAttribute('aria-labelledby','account-title');
 modal.innerHTML=`<div class="tour-header"><span class="eyebrow">YOUR CHURCH WORKSPACE</span><button type="button" class="icon-btn" id="account-close" aria-label="Close account dialog">×</button></div><h2 id="account-title"></h2><p id="account-description"></p><form id="account-form"><label id="account-mode-label">Get started<select id="account-signup-mode"><option value="create">Register my church · Pastor / Program team</option><option value="join">Join my church with a code</option></select></label><label id="account-church-label">Church name<input id="account-church" autocomplete="organization" maxlength="120"></label><label id="account-code-label" hidden>Church invitation code<input id="account-code" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="100"><small>Your church assigns your experience through this code.</small></label><label id="account-name-label">Your name<input id="account-name" autocomplete="name" maxlength="100"></label><label>Username<input id="account-username" autocomplete="username" autocapitalize="none" spellcheck="false" minlength="3" maxlength="30" pattern="[a-zA-Z0-9_.-]{3,30}" required></label><label>Password<input id="account-password" type="password" autocomplete="current-password" minlength="12" maxlength="128" required></label><p id="account-password-help">Use at least 12 characters. Save your password in a password manager: email recovery is not available.</p><button id="account-submit" class="button dark" type="submit">Continue</button><p id="account-error" role="status"></p></form><button id="account-toggle" class="subtle-button"></button>`;
 document.body.append(modal);
 const params=new URLSearchParams(location.search),code=params.get('join')||params.get('invite');
 modal.querySelector('#account-signup-mode').value=code||params.get('mode')==='join'||!!window.desktopShell||['pro','u'].includes(params.get('experience'))||['pro','u'].includes(AxiomWorkspaces.fromPath(location.pathname)?.audience)?'join':'create';
 if(code){modal.querySelector('#account-code').value=code;modal.querySelector('#account-code').readOnly=true;}
 modal.querySelector('#account-close').onclick=()=>modal.close();
 modal.querySelector('#account-toggle').onclick=()=>{signup=!signup;drawAccount();};
 modal.querySelector('#account-signup-mode').onchange=()=>{invitationRequest++;invitation=null;drawAccount();};
 modal.querySelector('#account-code').onchange=()=>resolveInvitation();
 modal.querySelector('#account-form').onsubmit=async e=>{
  e.preventDefault();const submit=modal.querySelector('#account-submit'),error=modal.querySelector('#account-error');if(submit.disabled)return;
  submit.disabled=true;error.textContent='';
  try{
   const username=modal.querySelector('#account-username').value.trim().toLowerCase(),password=modal.querySelector('#account-password').value;
   let result;const expectedAudience=window.desktopShell?'pro':AxiomWorkspaces.fromPath(location.pathname)?.audience;const joinCode=modal.querySelector('#account-signup-mode').value==='join'?modal.querySelector('#account-code').value.trim():undefined;
   if(signup){if(modal.querySelector('#account-signup-mode').value==='join'&&/^[a-f0-9-]{32,35}$/i.test(modal.querySelector('#account-code').value.trim())&&!await resolveInvitation())return;result=await accountRequest('sign-up/email',{username,password,name:modal.querySelector('#account-name').value.trim(),expectedAudience,signupMode:modal.querySelector('#account-signup-mode').value,churchName:modal.querySelector('#account-church').value.trim(),joinCode:modal.querySelector('#account-signup-mode').value==='join'?modal.querySelector('#account-code').value.trim():undefined});}
   else{
    await accountRequest('sign-in/username',{username,password,expectedAudience,joinCode});cached=null;
    const code=modal.querySelector('#account-signup-mode').value==='join'?modal.querySelector('#account-code').value.trim():'';
    if(code)result=await request('accept-code',{method:'POST',body:{code,expectedAudience}});
   }
   if(result?.churchId&&!window.desktopShell)history.replaceState(null,'',AxiomWorkspaces.get(result.audience).path+'?church='+encodeURIComponent(result.churchId));
   location.reload();
  }catch(e){error.textContent=e.message;}finally{submit.disabled=false;}
 };
 return modal;
}
function drawAccount(){
 const d=dialog(),joining=d.querySelector('#account-signup-mode').value==='join',workspace=invitation?AxiomWorkspaces.get(invitation.audience):AxiomWorkspaces.fromPath(location.pathname),locked=new URLSearchParams(location.search).has('join')||!!window.desktopShell||!!AxiomWorkspaces.fromPath(location.pathname);
 d.querySelector('#account-title').textContent=signup?(joining?(invitation?'Join '+invitation.churchName:workspace?'Join the '+workspace.name:'Join your church.'):'Register your church.'):(workspace?'Sign in to the '+workspace.name:'Welcome back.');
 d.querySelector('#account-description').textContent=signup?(joining?'Create your account with the code from your church team. Your church and experience are assigned automatically.':'For Pastors and Program teams. Create your church workspace and your leadership account together, then invite your team.'):'Sign in to your church workspace.';
 d.querySelector('#account-name-label').hidden=!signup;d.querySelector('#account-mode-label').hidden=!signup||locked;
 if(invitation)d.querySelector('#account-description').textContent=invitation.workspaceName+' · '+invitation.churchName+'. '+invitation.description;
 d.querySelector('#account-church-label').hidden=!signup||joining;d.querySelector('#account-church').required=signup&&!joining;
 d.querySelector('#account-code-label').hidden=!signup||!joining;d.querySelector('#account-code').required=signup&&joining;
 d.querySelector('#account-name').required=signup;
 d.querySelector('#account-password').autocomplete=signup?'new-password':'current-password';
 d.querySelector('#account-submit').textContent=signup?(joining?'Create account & join church →':'Create church & account →'):'Sign in →';
 d.querySelector('#account-toggle').textContent=signup?'Already have an account? Sign in':'New to Axiom? Register or join your church';
 d.querySelector('#account-error').textContent='';
}
async function resolveInvitation(){
 const code=dialog().querySelector('#account-code').value.trim(),normalized=code.replace(/-/g,'').toLowerCase();
 if(!/^[a-f0-9]{32}$/.test(normalized))return null;
 if(invitation?.code===normalized)return invitation;
 const current=++invitationRequest;
 try{const data=await accountRequest('invitation',{code});if(current!==invitationRequest)return null;const expected=AxiomWorkspaces.fromPath(location.pathname)?.audience;if(expected&&data.audience!==expected)throw Error('This code belongs to '+data.workspaceName+'. Open the original invitation link.');invitation={...data,code:normalized};drawAccount();return invitation;}
 catch(error){if(current===invitationRequest){invitation=null;drawAccount();dialog().querySelector('#account-error').textContent=error.message;}return null;}
}
async function signIn(create=false){signup=create;drawAccount();dialog().showModal();if(dialog().querySelector('#account-code').value)await resolveInvitation();}
function accountMenu(user){const d=document.createElement('dialog');d.setAttribute('aria-labelledby','profile-title');d.innerHTML='<div class="tour-header"><h2 id="profile-title">Your account</h2><button class="icon-btn" aria-label="Close profile">×</button></div><p id="profile-name"></p><form id="change-password-form"><label>Current password<input type="password" id="old-password" autocomplete="current-password" required></label><label>New password<input type="password" id="new-password" minlength="12" maxlength="128" autocomplete="new-password" required></label><button class="button dark small" type="submit">Change password</button><p id="password-result" role="status"></p></form><hr><button id="sign-out" class="button light small">Sign out</button>';document.body.append(d);d.querySelector('#profile-name').textContent=user.name+' · @'+user.username;d.querySelector('.icon-btn').onclick=()=>{d.close();d.remove();};d.querySelector('#sign-out').onclick=async()=>{await accountRequest('sign-out',{});if(window.desktopShell){localStorage.removeItem('axiom-desktop-team');location.href='index.html';}else location.href='workspace.html';};d.querySelector('#change-password-form').onsubmit=async e=>{e.preventDefault();const button=e.submitter;button.disabled=true;try{await accountRequest('change-password',{currentPassword:d.querySelector('#old-password').value,newPassword:d.querySelector('#new-password').value,revokeOtherSessions:true});d.querySelector('#change-password-form').reset();d.querySelector('#password-result').textContent='Password changed. Other sessions have been signed out.';}catch(e){d.querySelector('#password-result').textContent=e.message;}finally{button.disabled=false;}};d.showModal();}
async function request(action,{church,method='GET',body,signal}={}){const auth=await load(),token=await auth.session?.getToken();if(!token)throw Error('Sign in to continue');const params=new URLSearchParams({action});if(church)params.set('church',church);const r=await fetch('/api/workspace?'+params,{method,headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:signal||AbortSignal.timeout(30000),cache:'no-store'});const data=await r.json();if(!r.ok){if(r.status===401)cached=null;throw Object.assign(Error(data.error||'Request failed'),{status:r.status});}return data;}
async function watch(church,onChange,signal){while(!signal.aborted){try{const auth=await load(),token=await auth.session?.getToken();if(!token)return;const r=await fetch('/api/workspace?'+new URLSearchParams({action:'events',church}),{headers:{Authorization:'Bearer '+token},signal,cache:'no-store'});if(!r.ok)throw Error('Live connection interrupted');const reader=r.body.getReader(),decoder=new TextDecoder();let buffer='';while(!signal.aborted){const {value,done}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});let index;while((index=buffer.indexOf('\n\n'))>=0){const event=buffer.slice(0,index);buffer=buffer.slice(index+2);if(event.startsWith('data: '))onChange(JSON.parse(event.slice(6)));}}}catch(e){if(signal.aborted)return;}await new Promise(resolve=>setTimeout(resolve,3000));}}
window.AxiomCloud={configuration,load,request,signIn,watch};
})();
