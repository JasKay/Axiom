/* One service conversation, shared by AxiomLead and Tech. */
'use strict';
window.AxiomMessages={render(container,comments,serviceId,userId){
 const list=comments.filter(c=>c.service_id===serviceId).slice().sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
 const signature=JSON.stringify([serviceId,userId,list]);if(container.dataset.messages===signature)return;
 const atBottom=container.scrollHeight-container.scrollTop-container.clientHeight<64,first=!container.dataset.messages;
 container.dataset.messages=signature;container.classList.add('message-thread');container.setAttribute('role','log');container.setAttribute('aria-label','Team messages');container.setAttribute('aria-live','polite');container.setAttribute('aria-relevant','additions');container.replaceChildren();
 if(!list.length){const empty=document.createElement('p');empty.className='chat-empty';empty.textContent='Start the conversation. Messages are shared with AxiomLead and Tech for this service.';container.append(empty);}
 for(const c of list){const row=document.createElement('article');row.className='chat-message'+(c.author_id===userId?' is-own':'');const meta=document.createElement('div');meta.className='chat-meta';const author=document.createElement('strong');author.textContent=c.author_id===userId?'You':c.author_name||'Teammate';const time=document.createElement('time');time.dateTime=c.created_at;time.textContent=new Date(c.created_at).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});meta.append(author,time);const body=document.createElement('p');body.textContent=c.body;row.append(meta,body);container.append(row);}
 if(first||atBottom)container.scrollTop=container.scrollHeight;
}};
