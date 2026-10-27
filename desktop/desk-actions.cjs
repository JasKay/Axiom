'use strict';
module.exports=async function deskAction(page,category,label){await page.locator('#desk-add-'+category).click();if(category==='bible'){await page.locator('#bible-dialog[open]').waitFor();return;}await page.locator('#desk-action-popover').getByRole('button',{name:label,exact:true}).click();};
