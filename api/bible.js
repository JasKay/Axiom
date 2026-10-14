/* Server-only licensed provider adapter. No API keys are included in browser bundles. */
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.headers.origin==='presenter://app')res.setHeader('Access-Control-Allow-Origin','presenter://app');
 if(req.method!=='GET')return res.status(405).json({error:'Use GET.'});
 const url=new URL(req.url,'https://axiom.local');const version=url.searchParams.get('version'),query=url.searchParams.get('query')||'';
 if(!['NIV','NLT','TPT','MSG'].includes(version)||!query.trim()||query.length>160)return res.status(400).json({error:'Choose a translation and a short passage or search.'});
 const key=process.env.API_BIBLE_KEY,id=process.env['API_BIBLE_'+version+'_ID'];
 if(!key||!id)return res.status(503).json({error:version+' needs a licensed connection. You can import an authorized Bible JSON file to use it now.',status:'needs_configuration'});
 try{
  const base='https://rest.api.bible/v1/bibles/'+encodeURIComponent(id);
  const response=await fetch(base+'/search?'+new URLSearchParams({query,limit:'20','fums-version':'3','content-type':'text'}),{headers:{'api-key':key},signal:AbortSignal.timeout(10000)});
  if(!response.ok)return res.status(502).json({error:'This translation is unavailable on the connected Bible account.'});
  const body=await response.json(),data=body.data||{};
  // Provider content stays in a search preview until presentation/offline rights are implemented.
  const verses=(data.verses||[]).map(v=>({reference:v.reference,text:plain(v.text)}));
  for(const passage of data.passages||[])verses.push({reference:passage.reference,text:plain(passage.content)});
  const metadata=await fetch(base,{headers:{'api-key':key},signal:AbortSignal.timeout(10000)});
  if(!metadata.ok)throw Error('Missing attribution');
  const bible=await metadata.json();
  return res.status(200).json({verses,translation:version,canPresent:false,copyright:plain(bible.data?.copyright||data.passages?.[0]?.copyright||'')+' · Scripture provided by API.Bible',fumsToken:body.meta?.fumsToken});
 }catch{return res.status(502).json({error:'Bible lookup is temporarily unavailable. Your service is unchanged.'});}
};
function plain(value){return String(value||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').trim();}
