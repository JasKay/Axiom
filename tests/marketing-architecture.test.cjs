'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom');
const {pages}=require('../scripts/seo-pages.cjs'),config=require('../vercel.json');
const doc=p=>new JSDOM(fs.readFileSync(path.resolve('dist',p?p+'.html':'index.html'),'utf8')).window.document;
const cases={
 'business-presentations':{head:'Run the meeting',must:['The headline','Evidence','Your recommendation','Discussion'],not:'learning management system'},
 'education-presentations':{head:'Teach the lesson',must:['Retrieval question','Guided practice','Recap & reflect'],not:'speaker coordination'},
 'event-presentation-software':{head:'Every cue',must:['Doors & welcome','Host introduction','Keynote','Panel discussion','Closing & thanks'],not:'student records'}
};
test('each audience has a distinct route, metadata, runbook, and product CTA',()=>{
 const titles=new Set();
 for(const [slug,expect] of Object.entries(cases)){
  const page=pages.find(p=>p.path===slug),d=doc(slug);
  assert.ok(page&&page.template===slug,slug);
  assert.match(d.querySelector('h1')?.textContent||'',new RegExp(expect.head));
  assert.ok(d.querySelector('meta[name=description]').content.length>80);
  assert.ok(!titles.has(d.title));titles.add(d.title);
  assert.ok(d.querySelector('.solution-photo img[alt]'));
  assert.ok(d.querySelector('.solution-appshot img[src="/studio-preview.png"]'));
  assert.ok(d.querySelector('a[href="/#download"]'));
  for(const name of expect.must)assert.ok(d.querySelector('.solution-agenda').textContent.includes(name),slug+' missing '+name);
  assert.equal(d.querySelector('main').classList.contains('solution-page'),true);
  assert.ok(config.rewrites.some(x=>x.source==='/'+slug&&x.destination==='/'+slug+'.html'));
  assert.ok(config.redirects.some(x=>x.source==='/'+slug+'.html'&&x.destination==='/'+slug));
 }
});
test('home audience cards and footer lead to their own solutions instead of generic demo',()=>{
 const d=doc('');for(const slug of Object.keys(cases)){
  assert.ok(d.querySelector('.story-audience-card[href="/'+slug+'"]'),slug);
  assert.ok(d.querySelector('.footer a[href="/'+slug+'"]'),slug);
 }
 assert.ok(d.querySelector('.story-audience-card[href="/church-presentation-software"]'));
});
test('all public marketing pages have four top-level navigation choices, accessible submenus, and links to real pages',()=>{
 for(const page of pages){
  const d=doc(page.path),nav=d.querySelector('#main-nav');
  assert.ok(nav,page.path);
  assert.equal(nav.querySelectorAll(':scope>.nav-group').length,3,page.path);
  assert.equal(nav.querySelectorAll(':scope>.nav-direct').length,1);
  assert.equal(nav.querySelectorAll('.nav-trigger[aria-expanded="false"]').length,3);
  for(const trigger of nav.querySelectorAll('.nav-trigger')){const id=trigger.getAttribute('aria-controls');assert.ok(d.getElementById(id)?.hidden);}
  for(const slug of Object.keys(cases))assert.ok(nav.querySelector('a[href="/'+slug+'"]'),page.path+' missing '+slug);
  for(const a of nav.querySelectorAll('a[href]')){
   const href=a.getAttribute('href');
   if(!href.startsWith('/')||href==='/')continue;
   const route=href.split(/[?#]/)[0];
   if(route==='/'&&href.includes('#'))continue;
   assert.ok(route==='/app'||route==='/features'||route==='/demo'||route==='/pricing'||route==='/#download'||route==='/#product'||route==='/church-presentation-software'||route==='/guides/sunday-service-running-order'||Object.keys(cases).some(x=>'/'+x===route),page.path+': '+href);
  }
 }
});
test('related navigation is tailored by page and crosslinks among practical solutions',()=>{
 const event=doc('event-presentation-software'),business=doc('business-presentations'),church=doc('church-presentation-software');
 assert.ok(event.querySelector('.related-pages a[href="/business-presentations"]'));
 assert.ok(business.querySelector('.related-pages a[href="/event-presentation-software"]'));
 assert.ok(church.querySelector('.related-pages a[href="/church-service-planning"]'));
});
