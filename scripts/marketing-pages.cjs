'use strict';
const fs=require('node:fs'),path=require('node:path'),{pages,origin,metadata}=require('./seo-pages.cjs');
const relatedGroups=[
 {href:'/features',title:'Explore features',description:'Discover what Axiom can do today'},
 {href:'/demo',title:'Try the live demo',description:'Open a real sample presentation'},
 {href:'/pricing',title:'Pricing & options',description:'Start free on desktop'},
 {href:'/church-presentation-software',title:'For churches',description:'Present worship and Scripture'},
 {href:'/church-service-planning',title:'Service planning',description:'Bring church teams together'},
 {href:'/church-member-notes',title:'Church member notes',description:'Keep shared messages accessible'}
];
function relatedPages(current){
 const currentHref='/'+current;
 const cards=relatedGroups.filter(p=>p.href!==currentHref).slice(0,4).map(p=>'<a href="'+p.href+'" class="related-card"><strong>'+p.title+'</strong><span>'+p.description+'</span><b aria-hidden="true">↗</b></a>').join('');
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
