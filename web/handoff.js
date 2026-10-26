/* Receiving a new service never changes the current presentation or live output. */
window.AxiomHandoff=(()=>{
 function merge(local,source,church,revision,activate){
  State.validate(source);
  const service=source.services.find(s=>s.id===source.activeServiceId)||source.services[0],id='cloud:'+church+':'+service.id;
  const existing=local.services.find(s=>s.id===id),prefix=existing?.cloud?.prefix||id+':';
  for(const original of source.library){const item=structuredClone(original);item.id=prefix+item.id;item.slides=item.slides.map(s=>({...s,id:prefix+s.id}));const index=local.library.findIndex(i=>i.id===item.id);if(index>=0)local.library[index]=item;else local.library.push(item);}
  const next={...structuredClone(service),id,entries:service.entries.map(e=>({...structuredClone(e),id:prefix+e.id,itemId:prefix+e.itemId})),cloud:{churchId:church,serviceId:service.id,prefix,revision}};
  if(existing){next.operatorNotes=existing.operatorNotes||'';next.archived=!!existing.archived;if(existing.decks?.length){const main=existing.decks[0];next.decks=structuredClone(existing.decks);next.activeDeckId=main.id;next.entries.forEach(e=>e.deckId=main.id);next.entries.push(...structuredClone(existing.entries.filter(e=>e.deckId&&e.deckId!==main.id)));}}
  const index=local.services.findIndex(s=>s.id===id);if(index>=0)local.services[index]=next;else local.services.push(next);
  if(activate)local.activeServiceId=id;
  State.validate(local);return next;
 }
 return {
  receive(local,plans,church){
   let next=null,added=0,updated=0;
   for(const plan of plans){
    State.validate(plan.snapshot);
    const shared=plan.snapshot.services.find(s=>s.id===plan.service_id);
    if(!shared)throw Error('The shared service identity does not match its plan.');
    const existing=local.services.find(s=>s.cloud?.churchId===church&&s.cloud.serviceId===plan.service_id);
    if(!existing){next||=structuredClone(local);merge(next,plan.snapshot,church,plan.revision,false);added++;continue;}
    const details={name:shared.name,date:shared.date||'',startTime:shared.startTime||'10:00',notes:shared.notes||'',scriptureReferences:shared.scriptureReferences||''};
    if(Object.entries(details).some(([key,value])=>(existing[key]||'')!==value)){
     next||=structuredClone(local);const target=next.services.find(s=>s.id===existing.id);
     Object.assign(target,details);target.cloud.detailsRevision=plan.revision;updated++;
    }
   }
   if(next)State.validate(next);
   return {project:next||local,added,updated};
  },
  async install(source,church,revision){
   State.validate(source);const local=State.migrate(await WebStore.load()),sourceService=source.services.find(s=>s.id===source.activeServiceId)||source.services[0];
   if(local.services.some(s=>s.cloud?.churchId===church&&s.cloud.serviceId===sourceService.id)&&!confirm('Update the Main presentation from AxiomLead? Your other presentation decks and Tech notes will be kept.'))throw Error('Your local service was kept.');
   const next=merge(local,source,church,revision,true);await WebStore.save(local);return next;
  }
 };
})();
