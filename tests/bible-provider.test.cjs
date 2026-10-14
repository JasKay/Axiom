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
test('online KJV lookup explicitly requests KJV and never silently substitutes another edition',async()=>{
 let requested;const ctx=vm.createContext({window:{},AbortSignal,fetch:async url=>{requested=url;return {ok:true,json:async()=>({verses:[{book:'John',chapter:3,verse:16,text:'Fixture text\n'}]})}}});vm.runInContext(fs.readFileSync(require.resolve('../web/bibles.js'),'utf8'),ctx);
 const result=await ctx.window.AxiomBibles.search('KJV','John 3:16');assert.match(requested,/translation=kjv/);assert.equal(result.translation,'KJV');assert.equal(result.verses[0].text,'Fixture text');await assert.rejects(ctx.window.AxiomBibles.search('KJV','faith'),/passage/);
});
test('audience output permits embedded video data but not scripts from external sites',()=>{
 const html=fs.readFileSync(require.resolve('../web/output.html'),'utf8');assert.match(html,/media-src[^;]*data:/);assert.match(html,/script-src 'self'/);
});
