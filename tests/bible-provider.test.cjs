const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const handler=require('../api/bible');
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},json(data){this.data=data;return this}};}
test('unconfigured licensed versions fail clearly without calling a provider or exposing keys',async()=>{
 const old=process.env.API_BIBLE_KEY;delete process.env.API_BIBLE_KEY;
 try{const r=response();await handler({method:'GET',url:'/api/bible?version=NIV&query=John+3%3A16',headers:{}},r);assert.equal(r.code,503);assert.equal(r.data.status,'needs_configuration');assert.match(r.data.error,/licensed/);}finally{if(old)process.env.API_BIBLE_KEY=old;}
});
test('provider adapter preserves attribution and FUMS metadata but does not authorize offline redistribution',async()=>{
 const prior={key:process.env.API_BIBLE_KEY,id:process.env.API_BIBLE_NIV_ID,fetch:global.fetch};process.env.API_BIBLE_KEY='test-secret';process.env.API_BIBLE_NIV_ID='licensed-edition';const requests=[];
 global.fetch=async(url,options)=>{requests.push({url,options});return {ok:true,json:async()=>String(url).includes('/search?')?{data:{verses:[{reference:'John 3:16',text:'Example fixture text'}]},meta:{fumsToken:'view-token'}}:{data:{copyright:'Publisher attribution'}}}};
 try{const r=response();await handler({method:'GET',url:'/api/bible?version=NIV&query=John+3%3A16',headers:{}},r);assert.equal(r.code,200);assert.equal(r.data.translation,'NIV');assert.equal(r.data.canPresent,false);assert.equal(r.data.fumsToken,'view-token');assert.match(r.data.copyright,/Publisher attribution/);assert.equal(requests[0].options.headers['api-key'],'test-secret');assert.ok(!JSON.stringify(r.data).includes('test-secret'));}finally{global.fetch=prior.fetch;for(const [name,value]of [['API_BIBLE_KEY',prior.key],['API_BIBLE_NIV_ID',prior.id]]){if(value===undefined)delete process.env[name];else process.env[name]=value;}}
});
const editions=require('../web/bible-editions.js'),zlib=require('node:zlib');
function bibleClient({connected=false,fetcher}={}){
 const requests=[],w={AxiomBibleQuery:require('../web/bible-query.js'),AxiomBibleEditions:editions,AxiomProContext:{church:connected?'test-church':null,mode:connected?'connected':'standalone'}};
 const ctx=vm.createContext({window:w,Model:require('../web/model.js'),AbortSignal,Blob,Response,DecompressionStream,crypto:require('node:crypto').webcrypto,fetch:async url=>{requests.push(url);if(fetcher)return fetcher(url);if(!url.startsWith('bibles/'))throw Error('External network disabled');return new Response(fs.readFileSync(require.resolve('../web/'+url)));}});
 vm.runInContext(fs.readFileSync(require.resolve('../web/bibles.js'),'utf8'),ctx);return {api:w.AxiomBibles,w,requests};
}
test('all eight offline editions preserve their own complete 66-book text, source verse numbers and checksums',async()=>{
 const {api,requests}=bibleClient({connected:true});
 for(const e of editions.filter(e=>e.offline)){
  const bytes=fs.readFileSync(require.resolve('../web/bibles/'+e.file));assert.equal(require('node:crypto').createHash('sha256').update(bytes).digest('hex'),e.sha256);
  const data=JSON.parse(zlib.gunzipSync(bytes));assert.equal(data.translation,e.id);assert.equal(data.books.length,66);assert.equal(data.books.reduce((n,b)=>n+b.chapters.length,0),1189);
  const verseCount=data.books.reduce((n,b)=>n+b.chapters.reduce((n,c)=>n+c.filter(v=>typeof v==='string'&&!!v.trim()).length,0),0);assert.equal(verseCount,e.verses);
  const result=await api.search(e.id,'jn3:16-17');assert.equal(result.translation,e.id);assert.equal(result.offline,true);assert.equal(result.verses.length,2);assert.equal(result.verses[0].verse,16);assert.equal(result.verses[0].text,data.books[42].chapters[2][15]);assert.ok(result.copyright.includes(e.name));
  assert.equal((await api.search(e.id,'Psalms 23')).verses.length,6);assert.equal((await api.search(e.id,'Genesis 1:1')).verses.length,1);assert.equal((await api.search(e.id,'Revelation 22:21')).verses.length,1);assert.equal((await api.search(e.id,'John 999:1')).verses.length,0);
 }
 assert.equal(requests.length,8);assert.ok(requests.every(url=>url.startsWith('bibles/')));
});
test('Standalone includes offline WEB, supports keyword lookup and blocks additional editions before loading them',async()=>{
 const {api,requests}=bibleClient();await assert.rejects(api.search('ASV','John 3:16'),/church workspace/);assert.equal(requests.length,0);
 const result=await api.search('WEB','God so loved the world');assert.ok(result.verses.some(v=>v.book==='John'&&v.chapter===3&&v.verse===16));assert.equal(result.translation,'WEB');await api.search('WEB','John 3:16');assert.equal(requests.length,1);
});
test('switching from church workspace to Standalone does not expose cached additional editions',async()=>{
 const {api,w,requests}=bibleClient({connected:true});await api.search('ASV','John 3:16');w.AxiomProContext.mode='standalone';await assert.rejects(api.search('ASV','John 3:16'),/church workspace/);assert.equal(requests.length,1);assert.equal((await api.search('WEB','John 3:16')).translation,'WEB');
});
test('corrupt bundled texts fail visibly and never fall back to another edition or internet service',async()=>{
 const {api,requests}=bibleClient({fetcher:async()=>new Response('damaged fixture')});await assert.rejects(api.search('WEB','John 3:16'),/damaged/);await assert.rejects(api.search('WEB','John 3:16'),/damaged/);assert.deepEqual(requests,['bibles/web.json.gz','bibles/web.json.gz']);
});
test('KJV continues to request KJV explicitly; unconfirmed bundled KJV is not distributed',async()=>{
 let requested;const {api}=bibleClient({fetcher:async url=>{requested=url;return new Response(JSON.stringify({translation_id:'kjv',verses:[{book:'John',chapter:3,verse:16,text:'KJV fixture'}]}));}});
 const result=await api.search('KJV','John 3:16');assert.match(requested,/translation=kjv/);assert.equal(result.translation,'KJV');assert.equal(result.verses[0].text,'KJV fixture');assert.equal(fs.existsSync(require('node:path').join(__dirname,'../web/bibles/kjv.json')),false);await assert.rejects(api.search('KJV','faith'),/online KJV/);
});
test('wrong online edition is rejected and never labelled KJV',async()=>{
 const {api}=bibleClient({fetcher:async()=>new Response(JSON.stringify({translation_id:'web',verses:[{book:'John',chapter:3,verse:16,text:'Wrong edition'}]}))});await assert.rejects(api.search('KJV','John 3:16'),/different translation/);
});

test('audience output permits embedded video data but not scripts from external sites',()=>{
 const html=fs.readFileSync(require.resolve('../web/output.html'),'utf8');assert.match(html,/media-src[^;]*data:/);assert.match(html,/script-src 'self'/);
});
