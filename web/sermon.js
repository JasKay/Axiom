/* Free browser beta. Audio is handled by the browser speech provider; transcripts are memory-only. */
(()=>{
 const el=id=>document.getElementById(id),Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
 const start=el('sermon-start'),status=el('sermon-status'),transcript=el('sermon-transcript'),results=el('sermon-results');
 let recognition=null,active=false,deadline,tick,restart,epoch=0,heard='',failures=0;
 const seen=new Set(),cache=new Map();
 const say=text=>{status.textContent=text;};
 function stop(message='Listening stopped.'){active=false;epoch++;clearTimeout(deadline);clearTimeout(restart);clearInterval(tick);recognition?.abort();recognition=null;start.textContent='Start listening';start.setAttribute('aria-pressed','false');el('sermon-session').textContent='';say(message);}
 function suggest(text){
  const matches=SermonEngine.match(text);if(!matches.length){if(!results.children.length)el('sermon-empty').textContent='No close match yet. Try a longer phrase or a verse reference.';return;}
  for(const candidate of matches){if(seen.has(candidate.reference))continue;seen.add(candidate.reference);
   const card=document.createElement('article');card.className='sermon-card';
   const tag=document.createElement('span');tag.className='eyebrow';tag.textContent=candidate.reason;
   const title=document.createElement('h2');title.textContent=candidate.reference;
   const quote=document.createElement('p');quote.className='sermon-trigger';quote.textContent='Heard: “'+text.slice(-250)+'”';
   const passage=document.createElement('p');passage.className='sermon-passage';passage.hidden=true;
   const actions=document.createElement('div');actions.className='button-row';
   const review=document.createElement('button');review.className='primary';review.textContent='Review verse';
   const dismiss=document.createElement('button');dismiss.textContent='Dismiss';dismiss.className='quiet';dismiss.onclick=()=>{card.remove();el('sermon-empty').hidden=!!results.children.length;};
   review.onclick=async()=>{
    if(review.dataset.ready){window.dispatchEvent(new CustomEvent('axiom-sermon-present',{detail:cache.get(candidate.reference)}));say(candidate.reference+' is live.');return;}
    review.disabled=true;review.textContent='Loading…';
    try{let data=cache.get(candidate.reference);if(!data){const lookup=await AxiomBibles.search('KJV',candidate.reference);if(!lookup.canPresent||!lookup.verses?.length)throw Error('Passage unavailable.');data={reference:candidate.reference,verses:lookup.verses,translation:'KJV'};cache.set(candidate.reference,data);}if(!card.isConnected)return;
     passage.textContent=data.verses.map(v=>v.text).join('\n\n');passage.hidden=false;review.dataset.ready='true';review.textContent='Go Live →';
    }catch(error){passage.hidden=false;passage.textContent=error.message||'Could not load this verse. Try again.';review.textContent='Retry lookup';}finally{review.disabled=false;}
   };
   actions.append(review,dismiss);card.append(tag,title,quote,passage,actions);results.prepend(card);while(results.children.length>6)results.lastElementChild.remove();
  }
  el('sermon-empty').hidden=!!results.children.length;
 }
 function begin(){
  if(active){stop();return;}if(!Speech){say('Live listening is unavailable in this browser. Type or paste a phrase below.');return;}
  active=true;heard='';failures=0;const stamp=++epoch;let remaining=15*60;
  start.textContent='Stop listening';start.setAttribute('aria-pressed','true');say('Connecting to microphone…');
  deadline=setTimeout(()=>stop('15-minute beta session complete. Start again when ready.'),remaining*1000);
  const showTime=()=>el('sermon-session').textContent=Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0')+' left';showTime();tick=setInterval(()=>{remaining--;showTime();},1000);
  function listen(){if(!active||stamp!==epoch)return;const rec=new Speech();recognition=rec;rec.lang='en-GB';rec.continuous=true;rec.interimResults=true;
   rec.onstart=()=>{if(active&&stamp===epoch)say('Listening · English');};
   rec.onresult=event=>{if(!active||stamp!==epoch)return;failures=0;let interim='';for(let i=event.resultIndex;i<event.results.length;i++){const part=event.results[i][0].transcript;if(event.results[i].isFinal){heard=(heard+' '+part).trim().slice(-1400);suggest(heard.slice(-600));}else interim+=part;}transcript.textContent=(heard+' '+interim).trim()||'Waiting for speech…';};
   rec.onerror=event=>{if(!active||stamp!==epoch)return;if(event.error==='no-speech'){say('Listening · waiting for speech');return;}const messages={'not-allowed':'Microphone access was denied. Allow it in browser settings, or type a phrase below.','audio-capture':'No microphone is available. Connect one, or type a phrase below.','network':'Speech service unavailable. Check your connection, or type a phrase below.','service-not-allowed':'This browser cannot use the speech service. Try Chrome, or type a phrase below.'};stop(messages[event.error]||'Listening interrupted. Try again, or type a phrase below.');};
   rec.onend=()=>{if(!active||stamp!==epoch)return;if(++failures>3){stop('Speech service stopped. Start again when ready.');return;}restart=setTimeout(listen,600);};
   try{rec.start();}catch{stop('Could not start listening. Try again, or type a phrase below.');}
  }listen();
 }
 start.onclick=begin;
 el('sermon-find').onclick=()=>{const text=el('sermon-input').value.trim();if(!text){el('sermon-input').focus();return;}suggest(text);};
 el('sermon-example').onclick=()=>{el('sermon-input').value='God has not given us a spirit of fear, but power, love and a sound mind.';el('sermon-find').click();};
 el('sermon-clear').onclick=()=>{stop('Session cleared.');heard='';seen.clear();cache.clear();results.replaceChildren();transcript.textContent='Your live words will appear here.';el('sermon-input').value='';el('sermon-empty').textContent='Verse suggestions will appear here. You choose what goes live.';el('sermon-empty').hidden=false;};
 window.addEventListener('pagehide',()=>stop());
 window.addEventListener('axiom-view-change',event=>{if(active&&event.detail!=='sermon')stop('Listening stopped. Start again when ready.');});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)stop('Listening paused while Axiom is in the background.');});
 if(!Speech){start.disabled=true;say('Type a phrase below. Live listening is unavailable in this browser.');}
})();
