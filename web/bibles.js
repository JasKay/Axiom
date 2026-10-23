/* KJV lookup is online; user-imported translations stay local. Never substitute editions. */
window.AxiomBibles={
 normalizeQuery(query){
  const aliases={gen:'Genesis',ex:'Exodus',ps:'Psalm',psa:'Psalm',prov:'Proverbs',isa:'Isaiah',mt:'Matthew',matt:'Matthew',mk:'Mark',lk:'Luke',jn:'John',jhn:'John',rom:'Romans',cor:'Corinthians',phil:'Philippians',rev:'Revelation'};
  return query.trim().replace(/^(?:(\d)\s*)?([a-z]+)\.?\s*(?=\d)/i,(all,n,book)=>(n?n+' ':'')+(aliases[book.toLowerCase()]||book)+' ');
 },
 async search(version,query){
  query=this.normalizeQuery(query);
  if(version==='KJV'&&!/\d/.test(query)&&window.SermonEngine){const match=window.SermonEngine.match(query)[0];if(match)query=match.reference;}
  if(query.length>160)throw Error('Use a short reference or search.');
  if(version==='KJV'){
   if(!/\d/.test(query))throw Error('For online KJV, enter a passage such as John 3:16. Import KJV JSON for offline keyword search.');
   const response=await fetch('https://bible-api.com/'+encodeURIComponent(query)+'?translation=kjv&single_chapter_book_matching=indifferent',{signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw Error(response.status===429?'Bible lookup is busy. Try again shortly.':'Passage not found. Try a full book name and reference.');
   const data=await response.json();if(!Array.isArray(data.verses))throw Error('No passage returned.');
   return {verses:data.verses.map(v=>({...v,text:v.text.trim()})),translation:'KJV',canPresent:true,copyright:'King James Version · Passage source: bible-api.com'};
  }
  const origin=window.desktopShell?'https://axiom-theta-one.vercel.app':'';
  const response=await fetch(origin+'/api/bible?version='+encodeURIComponent(version)+'&query='+encodeURIComponent(query),{signal:AbortSignal.timeout(15000)});
  const data=await response.json().catch(()=>({error:'This translation needs a licensed connection.'}));if(!response.ok)throw Error(data.error||'This translation needs a licensed source.');return data;
 },
 track(token){
  let device=localStorage.getItem('axiom.bibleDevice');if(!device){device=crypto.randomUUID();localStorage.setItem('axiom.bibleDevice',device);}
  const session=sessionStorage.getItem('axiom.bibleSession')||crypto.randomUUID();sessionStorage.setItem('axiom.bibleSession',session);
  fetch('https://fums.api.bible/f3?'+new URLSearchParams({t:token,dId:device,sId:session}),{mode:'no-cors',credentials:'omit'}).catch(()=>{});
 }
};
