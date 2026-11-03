'use strict';
const assert=require('node:assert/strict');
module.exports=async function(app,p){
 await p.waitForSelector('body.operator-desk');
 const boxes=()=>p.evaluate(()=>['preview','live-preview'].map(id=>document.getElementById(id).getBoundingClientRect().toJSON()));
 for(const size of [{width:1440,height:900},{width:1024,height:768},{width:900,height:650}]){
  await app.evaluate(({BrowserWindow},v)=>BrowserWindow.getAllWindows()[0].setContentSize(v.width,v.height),size);await p.waitForTimeout(150);const proportions=await p.evaluate(()=>{const layout=document.querySelector('.app-layout');return ['.sidebar','main','.inspector'].map(s=>document.querySelector('.app-layout>'+s).getBoundingClientRect().width/layout.clientWidth*100)});const minLeft=size.width<=1100?175:195,minRight=size.width<=1100?230:260;const expectedLeft=Math.max(size.width*.16,minLeft)/size.width*100,expectedRight=Math.max(size.width*.18,minRight)/size.width*100;for(let i=0;i<3;i++)assert.ok(Math.abs(proportions[i]-[expectedLeft,100-expectedLeft-expectedRight,expectedRight][i])<.3,'Pane width is not usable at '+size.width+': '+JSON.stringify(proportions));assert.equal(await p.locator('.studio-rail,.sidebar-toggle-pro').count(),0);assert.ok(await p.locator('.service-navigator').isVisible());const before=await boxes();await p.locator('#editor').evaluate(e=>e.open=true);assert.deepEqual(await boxes(),before,'Editing moves monitors');await p.locator('#close-slide-editor').click();
  await p.locator('.desk-resize.left').focus();await p.keyboard.press('ArrowRight');await p.locator('.desk-gear').click();await p.locator('#desk-theme').selectOption('light');assert.equal(await p.locator('body').getAttribute('data-desk-theme'),'light');await p.locator('#desk-theme').selectOption('dark');await p.locator('#desk-reset').click();await p.locator('#desk-settings .asset-dialog-header button').click();assert.deepEqual(await boxes(),before,'Reset did not restore layout');
 }
 console.log('PASS native editor stability, resizable panes, reset and both themes at three sizes');
};
