'use strict';
const {createHash}=require('node:crypto');
// Call only after authentication and membership checks. No browser/shared cache.
function snapshot(req,res,data){
 const text=JSON.stringify(data),etag='"'+createHash('sha256').update(text).digest('hex')+'"';
 res.setHeader('Cache-Control','no-store');res.setHeader('ETag',etag);
 if(req.headers['if-none-match']===etag){res.status(304);return res.end();}
 return res.status(200).json(data);
}
module.exports={snapshot};
