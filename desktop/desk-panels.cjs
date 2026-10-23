'use strict';
const assert=require('node:assert/strict');
module.exports=async function(app,p){
 await p.waitForSelector('body.operator-desk');
 const boxes=()=>p.evaluate(()=>['preview','live-preview'].map(id=>document.getElementById(id).getBoundingClientRect().toJSON()));
 for(const size of [{width:1440,height:900},{width:1024,height:768},{width:900,height:650}]){
  await app.evaluate(({BrowserWindow},v)=>BrowserWindow.getAllWindows()[0].setContentSize(v.width,v.height),size);await p.waitForTimeout(150);const before=await boxes();await p.locator('#editor').evaluate(e=>e.open=true);assert.deepEqual(await boxes(),before,'Editing moves monitors');await p.locator('#close-slide-editor').click();
  await p.locator('.desk-resize.left').focus();await p.keyboard.press('ArrowRight');await p.locator('.desk-gear').click();await p.locator('#desk-theme').selectOption('light');assert.equal(await p.locator('body').getAttribute('data-desk-theme'),'light');await p.locator('#desk-theme').selectOption('dark');await p.locator('#desk-reset').click();await p.locator('#desk-settings .asset-dialog-header button').click();assert.deepEqual(await boxes(),before,'Reset did not restore layout');
 }
 console.log('PASS native editor stability, resizable panes, reset and both themes at three sizes');
};
