'use strict';
const Billing=require('../server/billing.cjs'),{settings}=require('../server/stripe.cjs'),{identity,member,requestBody,limit,fail,handleError}=require('../server/security.cjs');
function createHandler(authenticate=identity,{getMember=member,rateLimit=limit,billing=Billing,configuration=settings}={}){return async(req,res)=>{res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');try{const url=new URL(req.url,'https://axiom.local'),action=url.searchParams.get('action')||'status';
 if(action==='config'&&req.method==='GET'){const cfg=configuration();return res.status(200).json({available:cfg.enabled,mode:cfg.livemode?'live':'test',amount:999,currency:'usd',interval:'month'});}
 const user=await authenticate(req);await rateLimit('billing-user:'+user.id,40,60);const body=req.method==='POST'?requestBody(req):{},church=url.searchParams.get('church')||body.church;const membership=await getMember(church,user.id),canManage=['owner','admin'].includes(membership.role)&&(membership.audience||'lead')==='lead';
 if(req.method==='GET'&&action==='status')return res.status(200).json(await billing.status(church,canManage));
 if(req.method!=='POST')fail(405,'Use GET or POST');if(!canManage)fail(403,'Only church owners and administrators can manage the subscription');await rateLimit('billing-action:'+church,12,60);
 if(action==='checkout')return res.status(200).json(await billing.checkout(church));if(action==='portal')return res.status(200).json(await billing.portal(church));if(action==='refresh'){await billing.refresh(church);return res.status(200).json(await billing.status(church,true));}fail(404,'Billing action not found');
 }catch(e){return handleError(res,e);}};}
module.exports=createHandler();module.exports.createHandler=createHandler;