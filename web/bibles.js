/* Editions are never substituted. Only cleared public-domain texts are bundled. */
(()=>{
 const editions=window.AxiomBibleEditions,loaded=new Map(),pending=new Map();
 async function loadEdition(edition){
  if(loaded.has(edition.id)){const value=loaded.get(edition.id);loaded.delete(edition.id);loaded.set(edition.id,value);return value;}
  if(!pending.has(edition.id))pending.set(edition.id,(async()=>{
   const response=await fetch('bibles/'+edition.file);
   if(!response.ok)throw Error('The offline '+edition.id+' file could not be opened. Update or repair Axiom and try again.');
   const bytes=await response.arrayBuffer();
   const digest=await crypto.subtle.digest('SHA-256',bytes),hash=[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
   if(hash!==edition.sha256)throw Error('The offline '+edition.id+' file is damaged. Update or repair Axiom.');
   const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
   const data=await new Response(stream).json();
   if(data.translation!==edition.id||data.books?.length!==edition.books)throw Error('The offline Bible edition is incomplete.');
   const verses=data.books.flatMap(book=>book.chapters.flatMap((chapter,c)=>(chapter||[]).flatMap((text,v)=>typeof text==='string'&&text.trim()?[{book:book.name,chapter:c+1,verse:v+1,text}]:[])));
   if(verses.length!==edition.verses)throw Error('The offline Bible edition is incomplete.');
   const bible={translation:edition.id,verses};loaded.set(edition.id,bible);
   while(loaded.size>2)loaded.delete(loaded.keys().next().value);
   return bible;
  })().finally(()=>pending.delete(edition.id)));
  return pending.get(edition.id);
 }
 window.AxiomBibles={
  editions,
  connected(){return !!window.AxiomProContext?.church&&(window.AxiomProMode?.mode||window.AxiomProContext?.mode)!=='standalone';},
  available(version){const edition=editions.find(e=>e.id===version);return !!edition&&(!edition.shared||this.connected());},
  normalizeQuery(query){
   const aliases={gen:'Genesis',ex:'Exodus',exo:'Exodus',lev:'Leviticus',num:'Numbers',deut:'Deuteronomy',ps:'Psalm',psa:'Psalm',prov:'Proverbs',isa:'Isaiah',jer:'Jeremiah',ezek:'Ezekiel',dan:'Daniel',mt:'Matthew',matt:'Matthew',mk:'Mark',lk:'Luke',jn:'John',jhn:'John',rom:'Romans',cor:'Corinthians',gal:'Galatians',eph:'Ephesians',phil:'Philippians',col:'Colossians',thess:'Thessalonians',tim:'Timothy',pet:'Peter',rev:'Revelation'};
   return query.trim().replace(/^Psalms(?=\s|\d)/i,'Psalm').replace(/^(?:(\d)\s*)?([a-z]+)\.?\s*(?=\d)/i,(all,n,book)=>(n?n+' ':'')+(aliases[book.toLowerCase()]||book)+' ');
  },
  async search(version,query){
   query=this.normalizeQuery(query);
   if(query.length>160)throw Error('Use a short reference or search.');
   const edition=editions.find(e=>e.id===version);
   if(!edition)throw Error('Choose an included edition or import an authorized Bible JSON file.');
   if(!this.available(version))throw Error('Connect your church workspace to use '+edition.name+'. KJV and WEB are included in Standalone.');
   if(!query)return {translation:version,verses:[],canPresent:true};
   if(edition.offline){
    const bible=await loadEdition(edition);
    if(!this.available(version))throw Error('Your workspace changed. Choose an available Bible edition.');
    return {translation:version,verses:Model.searchBible(bible,query),canPresent:true,offline:true,copyright:edition.attribution};
   }
   // Full bundled KJV distribution remains pending UK permission. Never relabel WEB as KJV.
   if(!/\d/.test(query)&&window.SermonEngine){const match=window.SermonEngine.match(query)[0];if(match)query=match.reference;}
   if(!/\d/.test(query))throw Error('For online KJV, enter a passage such as John 3:16. Choose WEB for offline keyword search, or import an authorized KJV file.');
   let response;
   try{response=await fetch('https://bible-api.com/'+encodeURIComponent(query)+'?translation=kjv&single_chapter_book_matching=indifferent',{signal:AbortSignal.timeout(15000)});}catch{throw Error('KJV lookup needs internet unless you import an authorized KJV file. WEB is included offline.');}
   if(!response.ok)throw Error(response.status===429?'Bible lookup is busy. Try again shortly.':'Passage not found. Try a full book name and reference.');
   const data=await response.json();
   if(data.translation_id&&data.translation_id.toLowerCase()!=='kjv')throw Error('The provider returned a different translation. Please try again.');
   if(!Array.isArray(data.verses)||!data.verses.length||data.verses.length>500||data.verses.some(v=>typeof v.text!=='string'||!v.text.trim()))throw Error('No valid passage returned.');
   return {verses:data.verses.map(v=>({...v,text:v.text.trim()})),translation:'KJV',canPresent:true,copyright:'King James Version · Passage source: bible-api.com'};
  }
 };
})();