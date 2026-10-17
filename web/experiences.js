'use strict';
let experienceTimer;
function setAccess(allowed){$('access-gate').hidden=allowed;document.querySelector('.workspace-header').hidden=!allowed;document.querySelector('.workspace-layout').hidden=!allowed;}
document.addEventListener('DOMContentLoaded',()=>{$('gate-sign-in').onclick=()=>run(()=>AxiomCloud.signIn(false));$('gate-sign-up').onclick=()=>run(()=>AxiomCloud.signIn(true));});
function experienceHeading(kicker,title,copy){const h=el('div',undefined,'workspace-heading'),info=el('div');info.append(el('span',kicker,'eyebrow'),el('h1',title),el('p',copy));h.append(info);return h;}
function socialLinks(links){const box=el('div',undefined,'social-links');for(const link of links||[]){try{if(new URL(link.url).protocol!=='https:')continue;}catch{continue;}const a=el('a',link.label+' ↗','button light small');a.href=link.url;a.target='_blank';a.rel='noopener noreferrer';box.append(a);}return box;}
function updateWorkspaceIdentity(){
 const workspace=AxiomWorkspaces.get(audience),name=churches.find(item=>item.id===church)?.name||'Your church';
 document.title=name+' · '+workspace.name+' · Axiom';
 document.querySelector('.workspace-label').textContent=name;
 $('experience-badge').textContent=workspace.name;
 $('church-select').setAttribute('aria-label','Church for your '+workspace.name);
 const serviceId=audience==='lead'&&project?project.activeServiceId:new URLSearchParams(location.search).get('service');const canonical=workspace.path+'?church='+encodeURIComponent(church)+(serviceId?'&service='+encodeURIComponent(serviceId):'');
 if(church&&location.protocol!=='file:')history.replaceState(null,'',canonical);
}
function renderChurchLinks(){
 const section=$('church-invitation-links');if(!section)return;
 section.hidden=!church||!canApprove();section.replaceChildren();if(section.hidden)return;
 const heading=el('div',undefined,'plan-card-heading');heading.append(el('h2','Invitation links'));section.append(heading);
 const grid=el('div',undefined,'church-links-grid');
 for(const workspace of AxiomWorkspaces.all){
  const card=el('article',undefined,'church-link-card');card.dataset.invitationAudience=workspace.audience;
  card.append(el('h3',workspace.name));
  const invitation=codes.find(code=>code.audience===workspace.audience&&code.url),actions=el('div',undefined,'church-link-actions');
  if(invitation){
   const input=el('input');input.id='invite-link-'+workspace.audience;input.value=invitation.url;input.readOnly=true;input.setAttribute('aria-label',workspace.name+' invitation link');card.append(input);
   const copy=el('button','Copy link','button dark small');copy.type='button';copy.onclick=async()=>{try{await navigator.clipboard.writeText(invitation.url);copy.textContent='Copied';}catch{input.focus();input.select();copy.textContent='Copy selected link';}};
   const manage=el('details',undefined,'link-management');manage.append(el('summary','Manage'));
   const fresh=el('button','New link','subtle-button');fresh.type='button';fresh.onclick=()=>createChurchCode(workspace.audience);
   const revoke=el('button','Revoke link','subtle-button');revoke.type='button';revoke.onclick=()=>run(async()=>{if(!confirm('Revoke this invitation link? Existing members keep their access.'))return;await AxiomCloud.request('revoke-code',{church,method:'POST',body:{id:invitation.id}});await refreshConversation();});
   manage.append(el('small',`${invitation.uses} / ${invitation.max_uses} joined · expires ${new Date(invitation.expires_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}`),fresh,revoke);actions.append(copy,manage);
  }else{const create=el('button','Create link','button dark small');create.type='button';create.onclick=()=>createChurchCode(workspace.audience);actions.append(create);}
  card.append(actions,el('small',workspace.team,'invitation-team')); grid.append(card);
 }
 section.append(grid);
}
function renderExperience(data){if(!data)return;if(data.audience==='pro'){location.replace('tech-media.html?church='+encodeURIComponent(church));return;}clearTimeout(experienceTimer);document.body.dataset.audience=audience;const name=audience==='pro'?'Axiom Pro':'AxiomU';$('experience-badge').textContent=name;document.title=name+' · Axiom';document.querySelector('.workspace-label').textContent=audience==='pro'?'TECH & MEDIA TEAM':'YOUR CHURCH COMMUNITY';$('sync-status').textContent='Connected · '+name;$('church-select').replaceChildren(...churches.map(c=>new Option(c.name,c.id)));$('church-select').value=church;$('create-church').hidden=true;document.querySelector('.workspace-sidebar nav').hidden=true;document.querySelector('.sidebar-services').hidden=true;for(const id of ['services','team','history'])$(id+'-panel').hidden=true;$('pro-panel').hidden=audience!=='pro';$('member-panel').hidden=audience!=='u';renderMember(data);updateWorkspaceIdentity();scheduleExperienceRefresh();}
function scheduleExperienceRefresh(){clearTimeout(experienceTimer);experienceTimer=setTimeout(async()=>{try{if(document.querySelector('dialog[open]')||['TEXTAREA','INPUT','SELECT'].includes(document.activeElement?.tagName))return;const current=church,next=await AxiomCloud.request('workspace',{church});if(church!==current)return;if(next.audience!==audience){await loadShared(church);return;}if(audience==='u')await refreshMemberServices();if(JSON.stringify(next)!==JSON.stringify(audienceData)){audienceData=next;renderExperience(next);}}catch(e){$('sync-status').textContent='Reconnecting…';}finally{scheduleExperienceRefresh();}},10000);}

function renderMember(data){setTimeout(()=>refreshMemberServices(),0);const panel=$('member-panel');panel.replaceChildren(experienceHeading(churches.find(item=>item.id===church)?.name||'YOUR CHURCH','AxiomU Workspace','Messages, scriptures and updates shared by your church, with space for your personal notes.'));const services=data.services||[];if(!services.length){const empty=el('section',undefined,'detail-card experience-empty');empty.append(el('span','♡','feature-icon'),el('h2','Welcome to your AxiomU Workspace'),el('p','Service summaries, highlights, and church notes will appear here once your leadership team publishes them.'));panel.append(empty);return;}for(const record of services){const s=record.snapshot,card=el('article',undefined,'member-service');card.id='member-service-'+record.service_id;card.append(el('span',s.date?new Date(s.date+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'}):'FROM YOUR CHURCH','eyebrow'),el('h2',s.name));if(record.live){const live=el('div',undefined,'member-live');live.append(el('span','ON SCREEN NOW','eyebrow'),el('p',record.live.text),el('small',record.live.reference));card.append(live);}const summary=el('section',undefined,'member-section');summary.append(el('h3','Message summary'),el('p',s.summary||'Your church hasn’t added a summary yet.','preserve-lines'));card.append(summary);if(s.highlights?.length){const section=el('section',undefined,'member-section'),list=el('ul');section.append(el('h3','Take it into the week.'));for(const point of s.highlights)list.append(el('li',point));section.append(list);card.append(section);}if(s.items?.length){const section=el('section',undefined,'member-section');section.append(el('h3','Scriptures & shared moments'));for(const item of s.items){const d=el('details'),title=el('summary',item.title);d.append(title,el('p',item.text,'preserve-lines'),el('small',item.reference));section.append(d);}card.append(section);}if(s.churchNote||s.announcements){const section=el('section',undefined,'member-section church-note');section.append(el('span','CHURCH NOTE','eyebrow'),el('h3','Life together.'),el('p',[s.churchNote,s.announcements].filter(Boolean).join('\n\n'),'preserve-lines'));card.append(section);}const notes=el('section',undefined,'member-section'),label=el('label','My notes'),input=el('textarea'),status=el('small','Private · saved on this device'),key='axiom-u-notes:'+user.id+':'+church+':'+record.service_id;input.rows=5;input.maxLength=50000;input.placeholder='A thought, a prayer, a verse to remember…';input.setAttribute('aria-label','My private notes for '+s.name);try{input.value=localStorage.getItem(key)||'';}catch{}input.oninput=()=>{try{localStorage.setItem(key,input.value);status.textContent='Saved privately on this device';}catch{status.textContent='Storage unavailable. Copy your notes to keep them.';}};label.append(input);notes.append(label,status);card.append(notes,socialLinks(s.socialLinks));panel.append(card);}}


function renderOnboarding(){
 document.getElementById('experience-onboarding')?.remove();
 $('access-gate').querySelector('h1').textContent='Connect to your church';
 $('access-gate').querySelector('p').textContent='Pastors and Program teams can register a church. Everyone else joins with a code from their church team.';
 $('gate-message').textContent='Already registered? Ask your church team for an invitation code.';
 const form=el('form',undefined,'workspace-setup');form.id='experience-onboarding';
 const modeLabel=el('label','Get started'),mode=el('select');mode.id='onboarding-mode';mode.append(new Option('Join with a church code','join'),new Option('Register my church · Pastor / Program team','create'));modeLabel.append(mode);
 const label=el('label','Church invitation code'),input=el('input');input.id='onboarding-workspace-name';input.required=true;input.maxLength=100;label.append(input);
 const submit=el('button','Join church','button dark');submit.type='submit';const error=el('p');error.id='onboarding-error';error.setAttribute('role','alert');form.append(modeLabel,label,submit,error);
 mode.onchange=()=>{const joining=mode.value==='join';label.firstChild.textContent=joining?'Church invitation code':'Church name';input.value='';input.maxLength=joining?100:120;submit.textContent=joining?'Join church':'Register church';};
 let created;
 form.onsubmit=async event=>{
  event.preventDefault();if(submit.disabled)return;submit.disabled=true;input.disabled=true;mode.disabled=true;error.textContent='';
  try{
   if(!created){const result=mode.value==='join'?await AxiomCloud.request('accept-code',{method:'POST',body:{code:input.value.trim()}}):await AxiomCloud.request('create-church',{method:'POST',body:{name:input.value.trim(),audience:'lead'}});created=result.churchId||result.id;}
   await overview(created);
  }catch(e){error.textContent=e.message||'Your church could not be opened. Please try again.';}
  finally{submit.disabled=false;input.disabled=!!created;mode.disabled=!!created;if(created)submit.textContent='Open church';}
 };
 $('gate-message').after(form);
}
function createChurchCode(selectedAudience){
 const dialog=el('dialog');dialog.id='church-code-dialog';dialog.setAttribute('aria-labelledby','church-code-title');
 dialog.innerHTML='<div class="tour-header"><h2 id="church-code-title">Invite people to your church</h2><button type="button" class="icon-btn" aria-label="Close church code dialog">×</button></div><p>Generate a code for one team. Everyone using it joins this church with the access you assign. Codes expire after 7 days.</p><form id="church-code-form"><label>Team<select id="church-code-audience"><option value="lead">Pastor / Program team · AxiomLead</option><option value="pro">Tech / Media team · Axiom Pro</option><option value="u">Members · AxiomU</option></select></label><label>Maximum accounts<input id="church-code-uses" type="number" min="1" max="500" value="25" required></label><button class="button dark" type="submit">Generate code</button><p id="church-code-error" role="alert"></p></form><section id="church-code-result" hidden><label>Church invitation code<input id="church-code-value" readonly></label><label>Invitation link<input id="church-code-link" readonly></label><button id="church-code-copy" class="button dark" type="button">Copy code</button><p>Share this code with the intended team. The code itself grants access, so share it privately.</p></section>';
 if(AxiomWorkspaces.all.some(workspace=>workspace.audience===selectedAudience)){dialog.querySelector('#church-code-audience').value=selectedAudience;dialog.querySelector('#church-code-audience').disabled=true;}
 dialog.querySelector('.icon-btn').onclick=()=>{dialog.close();dialog.remove();};
 dialog.querySelector('#church-code-form').onsubmit=async event=>{
  event.preventDefault();const button=event.submitter;if(button.disabled)return;button.disabled=true;
  try{const result=await AxiomCloud.request('create-code',{church,method:'POST',body:{audience:dialog.querySelector('#church-code-audience').value,maxUses:Number(dialog.querySelector('#church-code-uses').value)}});dialog.querySelector('#church-code-title').textContent='Invite '+({lead:'Pastor / Program team',pro:'Tech / Media team',u:'Congregation'})[result.audience];dialog.querySelector('#church-code-value').value=result.code;dialog.querySelector('#church-code-link').value=result.url;dialog.querySelector('#church-code-form').hidden=true;dialog.querySelector('#church-code-result').hidden=false;await refreshConversation();}
  catch(e){dialog.querySelector('#church-code-error').textContent=e.message;}
  finally{button.disabled=false;}
 };
 dialog.querySelector('#church-code-copy').onclick=async()=>{try{await navigator.clipboard.writeText(dialog.querySelector('#church-code-value').value);dialog.querySelector('#church-code-copy').textContent='Copied';}catch{dialog.querySelector('#church-code-value').select();dialog.querySelector('#church-code-copy').textContent='Select and copy the code above';}};
 document.body.append(dialog);dialog.showModal();
}

async function refreshMemberServices(){if(!church||audience!=='u')return;try{const current=church,data=await AxiomCloud.request('service-directory',{church});if(current!==church)return;AxiomServicePicker.render($('shared-service-picker'),data.services,null,id=>{history.replaceState(null,'',AxiomWorkspaces.get('u').path+'?'+new URLSearchParams({church,service:id}));document.getElementById('member-service-'+id)?.scrollIntoView({behavior:'smooth',block:'start'});});const requested=new URLSearchParams(location.search).get('service');if(requested)document.getElementById('member-service-'+requested)?.scrollIntoView({block:'start'});}catch{}}
