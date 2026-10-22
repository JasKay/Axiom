/* Presentation desk UI. Project data and output continue to use the studio engine. */
(()=>{
  if(!document.body.classList.contains('pro-studio'))return;
  const byId=id=>document.getElementById(id);
  const folderIcon='<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M2.5 5.5h6l1.5 2h7.5v9h-15z M2.5 5.5v-2h6l1.5 2h7.5v2"/></svg>';
  function serviceTree(){
    const host=byId('service-tree'),current=service();
    const signature=JSON.stringify([current.id,current.activeDeckId,project.services.map(s=>[s.id,s.name,s.archived,s.decks])]);
    if(host.dataset.signature===signature)return;
    const opened=new Map([...host.querySelectorAll('details[data-service-id]')].map(el=>[el.dataset.serviceId,el.open]));
    const changed=host.dataset.active!==current.id;
    host.dataset.signature=signature;host.dataset.active=current.id;host.replaceChildren();
    for(const archived of [false,true]){
      const services=project.services.filter(s=>!!s.archived===archived);
      if(!services.length)continue;
      const group=archived?document.createElement('details'):host;
      if(archived){group.className='archived-services';const label=document.createElement('summary');label.textContent='Archived';group.append(label);group.open=!!current.archived;}
      for(const s of services){
        const folder=document.createElement('details');folder.className='studio-service'+(s.id===current.id?' current':'');folder.dataset.serviceId=s.id;
        folder.open=s.id===current.id&&changed?true:(opened.get(s.id)??s.id===current.id);
        const summary=document.createElement('summary');summary.innerHTML=folderIcon;
        const title=document.createElement('span');title.textContent=s.name;title.title=s.name;summary.append(title);
        if(s.cloud){const cloud=document.createElement('span');cloud.className='tree-cloud';cloud.textContent='Lead';summary.append(cloud);}
        summary.addEventListener('click',event=>{if(s.id!==service().id){event.preventDefault();switchPresentation(s.id);}});
        folder.append(summary);
        const decks=document.createElement('div');decks.className='studio-decks';
        for(const deck of s.decks||[]){
          const button=document.createElement('button');button.type='button';button.className='studio-deck';button.textContent=deck.name;button.title=deck.name;
          button.dataset.serviceId=s.id;button.dataset.deckId=deck.id;button.setAttribute('aria-current',s.id===current.id&&deck.id===current.activeDeckId?'page':'false');
          button.onclick=()=>switchPresentation(s.id,deck.id);decks.append(button);
        }
        const add=document.createElement('button');add.type='button';add.className='tree-add-presentation';add.textContent='+ Presentation';add.setAttribute('aria-label','New presentation in '+s.name);add.onclick=()=>createQuickDeck(s);decks.append(add);
        folder.append(decks);group.append(folder);
      }
      if(archived)host.append(group);
    }
  }
  function sync(){
    if(typeof project==='undefined'||!project)return;
    serviceTree();
    const selected=item(),onAir=!!live.slide&&!live.black;
    document.body.dataset.outputState=onAir?'live':'blackout';
    byId('output-state').textContent=onAir?'On air':'Blackout';
    byId('preview-label').textContent=slide()?.title||'No slide selected';
    byId('preview-position').textContent=selected?(page+1)+' / '+selected.slides.length:'';
    byId('studio-selection-status').textContent=selected?selected.title+' · '+selected.slides.length+(selected.slides.length===1?' slide':' slides'):'';
    document.querySelectorAll('#slides .slide-card').forEach((card,index)=>{
      const s=selected?.slides[index];card.dataset.slideId=s?.id||'';
      card.classList.toggle('is-live',onAir&&liveCursor?.serviceId===service().id&&liveCursor?.entryId===selectedEntry&&liveCursor?.slideId===s?.id);
    });
    document.querySelectorAll('.studio-deck').forEach(button=>button.classList.toggle('deck-live',onAir&&button.dataset.serviceId===liveCursor?.serviceId&&button.dataset.deckId===liveCursor?.deckId));
    const entries=AxiomPresentations.entries(service());
    document.querySelectorAll('.playlist-entry').forEach((row,index)=>{
      const entry=entries[index],content=project.library.find(i=>i.id===entry?.itemId),button=row.querySelector(':scope>button');
      row.classList.toggle('entry-live',onAir&&liveCursor?.serviceId===service().id&&liveCursor?.entryId===entry?.id);
      if(!button||button.querySelector('.entry-copy'))return;
      const number=document.createElement('span');number.className='entry-index';number.textContent=String(index+1).padStart(2,'0');
      const copy=document.createElement('span');copy.className='entry-copy';
      const title=document.createElement('span');title.className='entry-title';title.textContent=content?.title||'Untitled';
      const count=content?.slides.length||0,meta=document.createElement('small');meta.textContent=count+(count===1?' slide':' slides');
      copy.append(title,meta);button.replaceChildren(number,copy);button.title=content?.title||'Untitled';
    });
    document.querySelectorAll('.pro-primary-nav [data-view]').forEach(button=>button.setAttribute('aria-current',button.classList.contains('active')?'page':'false'));
  }
  window.addEventListener('axiom-project-change',sync);
  window.addEventListener('axiom-output-change',sync);
  byId('slides').addEventListener('click',sync);
  byId('slides').addEventListener('dblclick',event=>{if(event.target.closest('.slide-card'))byId('editor').open=true;});
  byId('close-slide-editor').onclick=()=>{byId('editor').open=false;byId('editor').querySelector('summary').focus();};
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&byId('editor').open){byId('editor').open=false;byId('editor').querySelector('summary').focus();}});
  document.addEventListener('click',event=>{for(const menu of document.querySelectorAll('.studio-import-menu[open],.deck-options[open]'))if(!menu.contains(event.target)||event.target.closest('button'))menu.open=false;});
  const saveStatus=byId('save-status'),saveState=()=>{saveStatus.dataset.state=/^Saved/.test(saveStatus.textContent)?'saved':/fail|recovery/i.test(saveStatus.textContent)?'error':'pending';};
  new MutationObserver(saveState).observe(saveStatus,{childList:true,characterData:true,subtree:true});saveState();
  sync();
})();
