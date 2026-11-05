'use strict';
const fs=require('node:fs'),path=require('node:path'),{pages,origin,metadata}=require('./seo-pages.cjs');
const relatedGroups=[
 {href:'/getting-started',title:'Getting started',description:'From installation to your first presentation'},
 {href:'/features',title:'Features',description:'See what Axiom does in the desktop app'},
 {href:'/demo',title:'Interactive demo',description:'Explore the real sample editor'},
 {href:'/pricing',title:'Pricing',description:'Start free and compare workspace options'},
 {href:'/business-presentations',title:'For business',description:'Pitch decks, reviews, and meetings'},
 {href:'/education-presentations',title:'For education',description:'Classrooms, teaching, and training'},
 {href:'/event-presentation-software',title:'For events',description:'Stage cues, presenters, and run of show'},
 {href:'/church-presentation-software',title:'For churches',description:'Lyrics, Scripture, and worship'},
 {href:'/church-service-planning',title:'Service planning',description:'Prepare a service running order'},
 {href:'/church-member-notes',title:'Church member notes',description:'Published notes and service updates'},
 {href:'/guides/sunday-service-running-order',title:'Service guide',description:'A practical church planning example'}
];
const relatedByPage={
 'getting-started':['/features','/demo','/business-presentations','/event-presentation-software'],
 'features':['/business-presentations','/education-presentations','/event-presentation-software','/demo'],
 'demo':['/features','/business-presentations','/event-presentation-software','/pricing'],
 'pricing':['/features','/demo','/church-presentation-software','/event-presentation-software'],
 'business-presentations':['/features','/demo','/pricing','/event-presentation-software'],
 'education-presentations':['/features','/demo','/pricing','/business-presentations'],
 'event-presentation-software':['/features','/demo','/business-presentations','/pricing'],
 'church-presentation-software':['/church-service-planning','/church-member-notes','/guides/sunday-service-running-order','/demo'],
 'church-service-planning':['/church-presentation-software','/church-member-notes','/guides/sunday-service-running-order','/pricing'],
 'church-member-notes':['/church-presentation-software','/church-service-planning','/pricing','/demo'],
 'guides/sunday-service-running-order':['/church-service-planning','/church-presentation-software','/demo','/pricing']
};
function relatedPages(current){
 const currentHref='/'+current;
 const links=relatedByPage[current]||relatedGroups.filter(p=>p.href!==currentHref).slice(0,4).map(p=>p.href);const cards=links.map(href=>relatedGroups.find(p=>p.href===href)).filter(Boolean).map(p=>'<a href="'+p.href+'" class="related-card"><strong>'+p.title+'</strong><span>'+p.description+'</span><b aria-hidden="true">↗</b></a>').join('');
 return '<section class="shell related-pages" aria-label="Continue exploring Axiom"><div class="related-heading"><span class="eyebrow">KEEP EXPLORING</span><h2>Discover more with Axiom.</h2></div><div class="related-grid">'+cards+'</div></section>';
}
module.exports=function buildMarketingPages(directory){
 const home=fs.readFileSync('web/index.html','utf8'),start=home.slice(0,home.indexOf('<main id="main">')),end=home.slice(home.lastIndexOf('</main>')+7);
 for(const page of pages){const file=page.path?page.path+'.html':'index.html',template=page.path?fs.readFileSync('scripts/templates/'+page.template+'.html','utf8'):null,related=page.path?relatedPages(page.path):'',html=page.path?start+template.replace('</main>',related+'</main>')+end:home;fs.mkdirSync(path.dirname(path.join(directory,file)),{recursive:true});fs.writeFileSync(path.join(directory,file),metadata(html,page));}
 const studio=fs.readFileSync('web/studio.html','utf8').replace(/<script>if\(!window.desktopShell[\s\S]*?<\/script>/,'').replace('<head>','<head><script src="demo-bootstrap.js"></script>').replace('</head>','<link rel="stylesheet" href="demo-workspace.css"></head>').replace('<title>Axiom Pro Workspace</title>','<title>Axiom Pro - Sample workspace</title>');fs.writeFileSync(path.join(directory,'demo-studio.html'),studio);
 fs.writeFileSync(path.join(directory,'demo-output.html'),fs.readFileSync('web/output.html','utf8').replace('<head>','<head><script src="demo-bootstrap.js"></script>'));
 const publicFiles=new Set(pages.map(p=>p.path?p.path+'.html':'index.html'));for(const file of fs.readdirSync(directory).filter(f=>f.endsWith('.html')&&!publicFiles.has(f))){let html=fs.readFileSync(path.join(directory,file),'utf8');const tag='<meta name="robots" content="noindex, nofollow">';html=/<meta[^>]*name="robots"[^>]*>/i.test(html)?html.replace(/<meta[^>]*name="robots"[^>]*>/gi,tag):html.replace(/<head>/i,'<head>'+tag);fs.writeFileSync(path.join(directory,file),html);}
 fs.writeFileSync(path.join(directory,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(p=>'<url><loc>'+origin+(p.path?'/'+p.path:'/')+'</loc></url>').join('')+'</urlset>');
};
