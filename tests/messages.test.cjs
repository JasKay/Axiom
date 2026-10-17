'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
const source=fs.readFileSync(require.resolve('../web/messages.js'),'utf8');
test('team messages are scoped to a service, ordered by time and rendered safely',()=>{
 const dom=new JSDOM('<div id="thread"></div>',{runScripts:'outside-only'}),w=dom.window;w.eval(source);const thread=w.document.getElementById('thread');
 w.AxiomMessages.render(thread,[{service_id:'other',body:'Private other service'},{service_id:'s',author_id:'tech',author_name:'Tech',body:'<img src=x onerror=alert(1)>',created_at:'2026-10-17T11:00:00Z'},{service_id:'s',author_id:'lead',author_name:'Pastor',body:'Please prepare Psalm 46',created_at:'2026-10-17T10:00:00Z'}],'s','lead');
 assert.equal(thread.querySelectorAll('article').length,2);assert.equal(thread.querySelector('article strong').textContent,'You');assert.equal(thread.querySelectorAll('.is-own').length,1);assert.equal(thread.querySelector('img'),null);assert.ok(thread.textContent.includes('<img src=x'));assert.equal(thread.querySelectorAll('time').length,2);assert.equal(thread.getAttribute('role'),'log');dom.window.close();
});
test('unchanged message refresh keeps existing nodes and avoids repeated announcements',()=>{
 const dom=new JSDOM('<div id="thread"></div>',{runScripts:'outside-only'}),w=dom.window;w.eval(source);const thread=w.document.getElementById('thread'),comments=[{service_id:'s',author_name:'Tech',body:'Ready',created_at:'2026-10-17T11:00:00Z'}];
 w.AxiomMessages.render(thread,comments,'s','lead');const node=thread.firstChild;w.AxiomMessages.render(thread,comments,'s','lead');assert.equal(thread.firstChild,node);dom.window.close();
});
