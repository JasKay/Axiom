'use strict';
module.exports=async function deskAction(page,category,label){await page.locator('#desk-add-'+category).click();await page.locator('#desk-action-popover').getByRole('button',{name:label,exact:true}).click();};
