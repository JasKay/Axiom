'use strict';
const {getAuth}=require('../../server/auth.cjs');
const {origin,requestBody,limit,hash,fail,handleError}=require('../../server/security.cjs');
const {prepareSignup,provisionSignup,invitationInfo}=require('../../server/church-signup.cjs');
const {db}=require('../../server/db.cjs');
module.exports=async function(req,res){
 res.setHeader('Cache-Control','no-store');
 try{
  const url=new URL(req.url,'https://axiom.local'),route=url.pathname==='/api/account'?url.searchParams.get('action'):url.pathname.replace(/^\/api\/auth\//,'');
  const allowed={'invitation':'POST','get-session':'GET','sign-up/email':'POST','sign-in/username':'POST','sign-out':'POST','change-password':'POST'};
  if(allowed[route]!==req.method)fail(404,'Account action not found');
  const base=origin(req);let signupIntent,loginIntent;
  if(req.method==='POST'){
   if(req.headers.origin!==base)fail(403,'Use the Axiom website to manage your account');
   const body=requestBody(req),ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0];
   await limit('auth:'+route+':'+hash(ip),route==='sign-up/email'?10:30,3600);
   if(route==='invitation')req.body=body;
   if(route==='sign-in/username'){loginIntent={expectedAudience:body.expectedAudience,joinCode:body.joinCode};req.body={username:body.username,password:body.password};}
   if(route==='sign-up/email'){
    const username=String(body.username||'').trim().toLowerCase(),name=String(body.name||'').trim();
    if(!/^[a-z0-9_.-]{3,30}$/.test(username)||!name||name.length>100)fail(400,'Choose a username of 3–30 letters, numbers, dots, underscores, or hyphens, and a display name under 100 characters');
    signupIntent=await prepareSignup({...body,username});
    req.body={username,name,email:username+'@users.axiom.invalid',password:body.password};
   }
  }
  if(route==='invitation')return res.status(200).json(await invitationInfo(req.body.code));
  const headers=new Headers();
  for(const [key,value]of Object.entries(req.headers))if(value!==undefined&&key!=='content-length')headers.set(key,Array.isArray(value)?value.join(', '):value);
  const auth=await getAuth(base);
  const response=await auth.handler(new Request(base+'/api/auth/'+route,{method:req.method,headers,body:req.method==='POST'?JSON.stringify(req.body):undefined}));
  let text=await response.text();
  if(loginIntent&&response.ok){
   const data=JSON.parse(text);
   try{
    const invite=loginIntent.joinCode?await invitationInfo(loginIntent.joinCode):null;
    if(invite&&loginIntent.expectedAudience&&invite.audience!==loginIntent.expectedAudience)fail(403,'This invitation belongs to a different workspace. Use its original link.');
    const expected=loginIntent.expectedAudience||invite?.audience;
    if(expected){const memberships=(await db().query('SELECT audience,church_id FROM axiom.members WHERE user_id=$1',[data.user.id])).rows;if(memberships.length&&!memberships.some(m=>m.audience===expected))fail(403,'This account is assigned to a different workspace. Sign in with the account for this team.');if(!memberships.length&&!invite)fail(403,'Join this workspace with a church invitation first.');}
   }catch(error){if(data.token)await db().query('DELETE FROM public.axiom_auth_sessions WHERE token=$1',[data.token]);throw error;}
  }
  if(signupIntent&&response.ok){
   const data=JSON.parse(text);
   try{const membership=await provisionSignup(data.user,signupIntent);text=JSON.stringify({...data,...membership});}
   catch(error){
    // Better Auth owns its transaction; remove this newly-created account if church setup fails.
    // Do not issue its session cookie until both account creation and church assignment succeed.
    try{await db().query('DELETE FROM public.axiom_auth_users WHERE id=$1 AND username=$2',[data.user.id,req.body.username]);}
    catch{console.error('Account setup cleanup needs attention for user',data.user.id);}
    throw error;
   }
  }
  res.statusCode=response.status;
  for(const [name,value]of response.headers)if(!['set-cookie','content-length'].includes(name))res.setHeader(name,value);
  const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);
  res.end(text);
 }catch(e){return handleError(res,e);}
};
