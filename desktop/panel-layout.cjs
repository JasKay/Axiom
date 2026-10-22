'use strict';
const assert=require('node:assert/strict');

module.exports=async function verifyPanelLayout(app,page){
  await page.locator('[data-view=service]').click();
  await page.locator('#presentation-layout').selectOption('thumbnails');
  const bounds=()=>page.evaluate(()=>{
    const box=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
    return {monitor:box('.inspector'),preview:box('#preview'),live:box('#live-preview'),slide:box('.slide-card'),order:box('.running-order'),overflow:document.documentElement.scrollWidth>innerWidth};
  });
  for(const size of [{width:1440,height:900},{width:1024,height:768},{width:900,height:650}]){
    await app.evaluate(({BrowserWindow},value)=>BrowserWindow.getAllWindows()[0].setContentSize(value.width,value.height),size);
    if(await page.locator('body').evaluate(el=>el.classList.contains('sidebar-collapsed')))await page.locator('.sidebar-toggle-pro').click();
    await page.waitForTimeout(150);
    const expanded=await bounds();
    await page.locator('.sidebar-toggle-pro').click();
    await page.locator('#editor').evaluate(el=>el.open=true);
    const editing=await bounds();
    assert.deepEqual(editing.preview,expanded.preview,'Opening the editor moved preview at '+size.width);
    assert.deepEqual(editing.live,expanded.live,'Opening the editor moved live output at '+size.width);
    await page.locator('#close-slide-editor').click();
    await page.waitForTimeout(150);
    const collapsed=await bounds();
    assert.deepEqual(collapsed.monitor,expanded.monitor,'Sidebar collapse moved or resized the monitor panel at '+size.width);
    assert.equal(collapsed.slide.width,expanded.slide.width,'Sidebar collapse resized slide thumbnails at '+size.width);
    assert.equal(collapsed.slide.height,expanded.slide.height,'Sidebar collapse changed slide proportions at '+size.width);
    assert.equal(collapsed.order.width,expanded.order.width,'Sidebar collapse resized the running order at '+size.width);
    assert.equal(expanded.overflow||collapsed.overflow,false,'Workspace exceeds the window width at '+size.width);
    await page.locator('.sidebar-toggle-pro').click();
  }
  console.log('Native panel layout passed: stable monitors, running order and thumbnails across sidebar collapse at three window sizes.');
};
