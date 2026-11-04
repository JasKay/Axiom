'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const source=fs.readFileSync(path.join(__dirname,'../web/ask-axiom.js'),'utf8');
const homepage=fs.readFileSync(path.join(__dirname,'../web/index.html'),'utf8');
function widget(){
 const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://www.useaxiom.org/',runScripts:'outside-only'});
 dom.window.open=()=>{};
 dom.window.eval(source);
 return dom.window;
}
test('marketing pages load the help widget without modifying application routes',()=>{
 assert.match(homepage,/href="ask-axiom\.css"/);
 assert.match(homepage,/src="ask-axiom\.js"/);
 const {execFileSync}=require('child_process');
 execFileSync(process.execPath,['build.cjs'],{cwd:path.join(__dirname,'..'),stdio:'ignore'});
 const generated=fs.readFileSync(path.join(__dirname,'../dist/features.html'),'utf8');
 assert.match(generated,/src="\/ask-axiom\.js"/);
});
test('Ask Axiom opens quietly and provides FAQ responses',()=>{
 const w=widget(),d=w.document;
 const toggle=d.querySelector('.axiom-help-toggle'),panel=d.querySelector('#axiom-help-panel');
 assert.ok(panel.hidden);
 assert.equal(toggle.getAttribute('aria-expanded'),'false');
 toggle.click();assert.equal(panel.hidden,false);
 assert.equal(toggle.getAttribute('aria-expanded'),'true');
 d.querySelector('#axiom-help-question').value='How can I download Axiom on Windows?';
 d.querySelector('.axiom-help-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 assert.match(d.querySelector('.axiom-help-body').textContent,/desktop app for Windows or macOS/i);
 assert.ok(d.querySelector('.axiom-help-links a[href="/#download"]'));
 w.close();
});
test('Unknown questions never get fabricated answers; visitor can request human help',()=>{
 const w=widget(),d=w.document;d.querySelector('.axiom-help-toggle').click();
 d.querySelector('#axiom-help-question').value='Can you guarantee a feature that does not exist?';
 d.querySelector('.axiom-help-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 assert.match(d.querySelector('.axiom-help-body').textContent,/don't have a reliable answer/i);
 assert.ok(d.querySelector('.axiom-help-contact'));
 d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
 assert.equal(d.querySelector('#axiom-help-panel').hidden,true);
 w.close();
});
test('No external API, no visitor question persistence, and confirmed support email',()=>{
 assert.doesNotMatch(source,/fetch\(|XMLHttpRequest|localStorage|sessionStorage/);
 assert.ok(source.includes("const SUPPORT_EMAIL='iamjasanyakay@gmail.com';"));
});
