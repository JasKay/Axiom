'use strict';
module.exports=async function chooseDestination(page){await page.locator('#premium-destination').waitFor();await page.locator('#premium-destination .premium-segments').getByRole('button',{name:'Service',exact:true}).click();await page.locator('#premium-destination button[type=submit]').click();await page.locator('#premium-destination').waitFor({state:'hidden'});};
