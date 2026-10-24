'use strict';
// Native playback audit. Supply a real MP4 fixture; no network or real workspace writes.
const {_electron}=require('playwright-core'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const fixture=process.argv[2];
if(!fixture||!fs.existsSync(fixture))throw Error('Usage: node desktop/video-playback.cjs <MP4 fixture>');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'axiom-video-')),env={...process.env,AXIOM_SMOKE_USER_DATA:profile};delete env.ELECTRON_RUN_AS_NODE;
(async()=>{let app;try{
 app=await _electron.launch({executablePath:process.env.AXIOM_DESKTOP_EXECUTABLE||path.join(__dirname,'release/win-unpacked/Axiom.exe'),env,timeout:60000});
 const p=await app.firstWindow();p.setDefaultTimeout(15000);await p.waitForFunction(()=>window.AxiomPremium&&typeof project!=='undefined'&&project);
 const chooser=p.waitForEvent('filechooser');await require('./desk-actions.cjs')(p,'media','Videos');await(await chooser).setFiles(path.resolve(fixture));await require('./desk-destination.cjs')(p);
 await p.waitForFunction(()=>slide()?.kind==='video');await p.waitForFunction(()=>document.querySelector('#preview video')?.readyState>=2);
 await p.locator('#preview video').evaluate(async v=>{await v.play();});await p.waitForFunction(()=>document.querySelector('#preview video')?.currentTime>.3);console.log('PASS Preview MP4 playback');
 await p.locator('#go-live').click();await p.waitForFunction(()=>document.querySelector('#live-preview video')?.currentTime>.3);
 const popup=app.waitForEvent('window');await p.locator('#open-output').click();const out=await popup;await out.waitForFunction(()=>document.querySelector('#screen video')?.currentTime>.3);console.log('PASS Program and audience MP4 playback');
 await p.evaluate(()=>playback('pause'));for(const [page,selector]of [[p,'#live-preview video'],[out,'#screen video']]){await page.waitForFunction(s=>document.querySelector(s)?.paused,selector);const time=await page.locator(selector).evaluate(v=>v.currentTime);await page.waitForTimeout(250);assert.ok(Math.abs(await page.locator(selector).evaluate(v=>v.currentTime)-time)<.05);}
 await p.evaluate(()=>playback('play'));for(const [page,selector]of [[p,'#live-preview video'],[out,'#screen video']])await page.waitForFunction(s=>!document.querySelector(s)?.paused,selector);console.log('PASS Pause and resume');
 await p.evaluate(()=>{live.clearText=true;send();});await p.waitForTimeout(250);assert.equal(await p.locator('#live-preview video').evaluate(v=>v.paused),false);assert.equal(await out.locator('#screen video').evaluate(v=>v.paused),false);console.log('PASS Layer changes preserve playback');
 await p.evaluate(()=>playback('restart'));await Promise.all([[p,'#live-preview video'],[out,'#screen video']].map(async([page,selector])=>{await page.waitForFunction(s=>document.querySelector(s)?.currentTime<.5,selector);await page.waitForFunction(s=>document.querySelector(s)?.currentTime>.6,selector);}));
 await out.locator('#screen video').evaluate(async v=>{v.currentTime=2;await v.play();});await out.waitForFunction(()=>document.querySelector('#screen video')?.currentTime>2.2);console.log('PASS Restart and seek');
 await p.evaluate(()=>{live.black=true;send();});await out.waitForFunction(()=>!document.querySelector('#screen video'));
 await p.evaluate(()=>{live.black=false;send();});await Promise.all([[p,'#live-preview video'],[out,'#screen video']].map(([page,selector])=>page.waitForFunction(s=>document.querySelector(s)?.currentTime>.3,selector)));console.log('PASS Blackout and restore resume video');
 }finally{if(app)await app.close();fs.rmSync(profile,{recursive:true,force:true,maxRetries:5});}})().catch(e=>{console.error(e);process.exitCode=1;});
