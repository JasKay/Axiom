'use strict';
const fs=require('node:fs'),path=require('node:path');
module.exports=function buildMarketingPages(directory){
 const home=fs.readFileSync('web/index.html','utf8'),start=home.slice(0,home.indexOf('<main id="main">')),end=home.slice(home.lastIndexOf('</main>')+7);
 for(const [name,title,description]of [['features','Axiom features — Slides, media, Scripture and church teamwork','Explore Axiom’s presentation, media import, offline Bible and connected church features. See what is available now and what is still in development.'],['demo','Try Axiom — Live church presentation demo','Explore the real Axiom presentation editor with a sample service. No account required. Demo changes stay separate from your personal workspace.']]){
  const head=start.replace(/<title>.*?<\/title>/,'<title>'+title+'</title>').replace(/(<meta name="description" content=")[^"]*/,(_,prefix)=>prefix+description).replace(/(<meta property="og:title" content=")[^"]*/,(_,prefix)=>prefix+title).replace(/(<meta property="og:description" content=")[^"]*/,(_,prefix)=>prefix+description).replace(/(rel="canonical" href="https:\/\/axiomworship.vercel.app\/)"/,'$1'+name+'"').replace(/(property="og:url" content="https:\/\/axiomworship.vercel.app\/)"/,'$1'+name+'"');
  fs.writeFileSync(path.join(directory,name+'.html'),head+fs.readFileSync('scripts/templates/'+name+'.html','utf8')+end);
 }
 const studio=fs.readFileSync('web/studio.html','utf8').replace(/<script>if\(!window.desktopShell[\s\S]*?<\/script>/,'').replace('<head>','<head><script src="demo-bootstrap.js"></script><meta name="robots" content="noindex">').replace('</head>','<link rel="stylesheet" href="demo-workspace.css"></head>').replace('<title>Axiom Pro Workspace</title>','<title>Axiom Pro · Sample workspace</title>');
 fs.writeFileSync(path.join(directory,'demo-studio.html'),studio);
 const output=fs.readFileSync('web/output.html','utf8').replace('<head>','<head><script src="demo-bootstrap.js"></script><meta name="robots" content="noindex">');fs.writeFileSync(path.join(directory,'demo-output.html'),output);
 fs.writeFileSync(path.join(directory,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+['','features','demo'].map(p=>'<url><loc>https://axiomworship.vercel.app/'+p+'</loc></url>').join('')+'</urlset>');
};