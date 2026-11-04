/* Ask Axiom: small, private, no-account FAQ helper for public marketing pages.
   Rule-based answers; no visitor question is sent to a server. */
(()=>{'use strict';
if(document.querySelector('[data-axiom-help]'))return;
const SUPPORT_EMAIL='iamjasanyakay@gmail.com'; // Owner-confirmed support contact.
const SUPPORT_ISSUES='https://github.com/JasKay/Axiom/issues/new';
const data=[
  {id:'what',title:'What is Axiom?',keywords:['what is axiom','what does axiom do','what is it','presentation software','what can it do','overview'],answer:'Axiom is desktop presentation software for creating, organising and presenting slides, text, images, video and other content. It has separate Preview and live Program views so you can prepare before showing a slide.',links:[['Explore features','/features'],['Try the demo','/demo']]},
  {id:'download',title:'How do I download Axiom?',keywords:['download','install','installation','get started','get axiom','windows','mac','macos','apple silicon','intel','computer'],answer:'You can download the desktop app for Windows or macOS. Pick the installer for your computer from the Downloads section. The standalone presentation app is free to get started.',links:[['Download desktop','/#download'],['Latest releases','https://github.com/JasKay/Axiom/releases/latest']]},
  {id:'pricing',title:'Is Axiom free?',keywords:['free','cost','price','pricing','subscription','payment','pay','charged','trial','plan'],answer:'Axiom has a free standalone desktop presentation workflow. Optional connected church workspace features have separate pricing. Check the pricing page for the current options.',links:[['See pricing','/pricing']]},
  {id:'offline',title:'Does Axiom work offline?',keywords:['offline','without internet','no internet','connection','wifi','wi-fi'],answer:'The standalone desktop presentation workflow is designed for local use, including local media. Connected workspace features require internet access.',links:[['Explore features','/features']]},
  {id:'present',title:'How do I present?',keywords:['present','projector','output','display','screen','go live','preview','program','stage display','live slides','second monitor'],answer:'Arrange your pages, select a slide to Preview, then send it to Program when you are ready. Connect your projector or external display and verify the output in your actual setup before a live event.',links:[['See the demo','/demo'],['Presentation features','/features']]},
  {id:'media',title:'Can I import files?',keywords:['powerpoint','ppt','pptx','pdf','import','images','media','video','videos','audio','upload','file'],answer:'Axiom supports slides and local media, including images, videos, PDFs and PowerPoint pages. Some imports may depend on your file type and computer, so test important presentations before going live.',links:[['See features','/features']]},
  {id:'church',title:'Can churches use Axiom?',keywords:['church','worship','scripture','bible','lyrics','service','sunday','leader','team'],answer:'Yes. Axiom supports worship presentations including song lyrics and Scripture. It also offers specialised connected church service-planning tools.',links:[['For churches','/church-presentation-software'],['Service planning','/church-service-planning']]},
  {id:'record',title:'Can I record or stream?',keywords:['record','recording','stream','streaming','rtmp','youtube live','facebook live','broadcast','camera','microphone'],answer:'Axiom Pro includes local recording and RTMP/RTMPS streaming capabilities. Streaming uses a separately installed FFmpeg encoder, and access to some capabilities may depend on your workspace plan. Test camera, audio and connection before a live event.',links:[['Desktop releases','https://github.com/JasKay/Axiom/releases/latest']]},
  {id:'help',title:'I need personal support',keywords:['support','help','issue','bug','error','problem','broken','crash','contact','email','person','human','question','feedback'],answer:'I can answer common Axiom questions here. For something specific, choose Contact support to prepare a message for the team.',links:[]}
];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=s=>String(s).toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
const choice=q=>{
 const text=normalize(q);
 if(!text)return null;
 let best=null,score=0;
 for(const item of data){let points=0;
  for(const key of item.keywords){const k=normalize(key);if(text===k)points=Math.max(points,10+k.length/12);else if(text.includes(k))points=Math.max(points,5+k.length/15);else if(k.split(' ').length===1&&text.split(' ').includes(k))points=Math.max(points,3);}
  if(points>score){best=item;score=points;}
 }
 return score>=3?best:null;
};
const root=document.createElement('section');root.className='axiom-help';root.dataset.axiomHelp='';root.innerHTML='<button class="axiom-help-toggle" type="button" aria-label="Ask Axiom a question" aria-expanded="false" aria-controls="axiom-help-panel"><span class="axiom-help-mark" aria-hidden="true">✦</span><span>Ask Axiom</span></button><div class="axiom-help-panel" id="axiom-help-panel" role="dialog" aria-label="Ask Axiom help" hidden><header class="axiom-help-head"><div><strong>Ask Axiom</strong><small>Quick answers and personal support</small></div><button class="axiom-help-close" type="button" aria-label="Close help">×</button></header><div class="axiom-help-body" role="log" aria-label="Conversation" aria-live="polite"></div><div class="axiom-help-starters" aria-label="Common questions"></div><form class="axiom-help-form"><label for="axiom-help-question">Your question</label><div class="axiom-help-entry"><input id="axiom-help-question" type="text" maxlength="500" placeholder="Ask about Axiom…" autocomplete="off" required><button type="submit" aria-label="Send question">↗</button></div></form><p class="axiom-help-disclaimer">Answers are from Axiom’s help topics, not a live agent.</p></div>';
document.body.append(root);
const toggle=root.querySelector('.axiom-help-toggle'),panel=root.querySelector('.axiom-help-panel'),close=root.querySelector('.axiom-help-close'),body=root.querySelector('.axiom-help-body'),starters=root.querySelector('.axiom-help-starters'),form=root.querySelector('.axiom-help-form'),input=root.querySelector('#axiom-help-question');
let lastQuestion='',opened=false;
const add=(who,content,links=[])=>{
 const msg=document.createElement('div');msg.className='axiom-help-msg '+(who==='you'?'is-you':'is-bot');
 const p=document.createElement('p');p.textContent=content;msg.append(p);
 if(links.length){const nav=document.createElement('div');nav.className='axiom-help-links';for(const [name,url] of links){const a=document.createElement('a');a.href=url;a.textContent=name;if(url.startsWith('https://')){a.target='_blank';a.rel='noopener noreferrer';}nav.append(a);}msg.append(nav);}
 body.append(msg);body.scrollTop=body.scrollHeight;
};
const contact=()=>{
 const button=document.createElement('button');button.type='button';button.className='axiom-help-contact';button.textContent=SUPPORT_EMAIL?'✉ Email Axiom support':'Contact Axiom support ↗';
 button.addEventListener('click',()=>{
  const question=(lastQuestion||'I need help with Axiom').slice(0,500);
  if(SUPPORT_EMAIL){const subject='Axiom support question';const message='Hello Axiom team,\n\n'+question+'\n\nMy device / operating system:\n\nMore details:\n';location.href='mailto:'+SUPPORT_EMAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(message);}
  else{const url=SUPPORT_ISSUES+'?title='+encodeURIComponent('Axiom support question')+'&body='+encodeURIComponent('Question: '+question+'\n\nDevice / OS:\n\nDetails:');window.open(url,'_blank','noopener,noreferrer');}
 });body.append(button);body.scrollTop=body.scrollHeight;
};
const ask=q=>{
 const question=String(q||'').trim().slice(0,500);if(!question)return;
 lastQuestion=question;add('you',question);
 const matched=choice(question);
 if(matched){add('bot',matched.answer,matched.links);}
 else add('bot',"I don't have a reliable answer to that yet. Send your question to the Axiom team and we'll help you directly.");
 contact();input.value='';
};
const open=()=>{panel.hidden=false;toggle.setAttribute('aria-expanded','true');opened=true;if(!body.children.length)add('bot','Hi! I can help with downloads, pricing, presenting, and more. What would you like to know?');input.focus();};
const shut=()=>{panel.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus();};
toggle.addEventListener('click',()=>panel.hidden?open():shut());close.addEventListener('click',shut);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)shut();});
for(const key of ['download','pricing','present','church']){const item=data.find(i=>i.id===key),button=document.createElement('button');button.type='button';button.textContent=item.title;button.addEventListener('click',()=>ask(item.title));starters.append(button);}
form.addEventListener('submit',e=>{e.preventDefault();ask(input.value);});
})();