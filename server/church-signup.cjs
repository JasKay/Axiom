'use strict';
const {randomUUID,createHmac}=require('node:crypto');
const {db,transaction}=require('./db.cjs');
const {fail,hash}=require('./security.cjs');
const State=require('../web/state.js');
const Workspaces=require('../web/workspaces.js');
function normalizeCode(value){return String(value||'').trim().replace(/-/g,'').toLowerCase();}
function validInvite(invite){
 if(!invite||invite.revoked_at||invite.accepted_at||new Date(invite.expires_at)<=new Date()||(invite.max_uses!==undefined&&invite.uses>=invite.max_uses))fail(410,'This church code has expired, was revoked, or has no uses left. Ask your church team for a new code.');
}
async function findInvite(client,code,username,lock=false,allowInactive=false){
 const legacy=/^[a-f0-9]{64}$/.test(code);
 if(!legacy&&!/^[a-f0-9]{32}$/.test(code))fail(400,'Enter the church invitation code your team shared with you.');
 const table=legacy?'invitations':'join_codes';
 const invite=(await client.query('SELECT * FROM axiom.'+table+' WHERE token_hash=$1'+(lock?' FOR UPDATE':''),[hash(code)])).rows[0];
 if(!invite)validInvite(invite);
 if(!allowInactive)validInvite(invite);
 if(legacy&&invite.username!==username)fail(403,'Use the username this church invitation was created for.');
 return {invite,legacy};
}
async function prepareSignup(body){
 const code=normalizeCode(body.joinCode);
 if(code){const {invite}=await findInvite(db(),code,String(body.username||'').trim().toLowerCase());if(body.expectedAudience&&invite.audience!==body.expectedAudience)fail(403,'This invitation belongs to '+Workspaces.get(invite.audience).name+'. Use its original invitation link.');return {code};}
 if(body.expectedAudience&&body.expectedAudience!=='lead')fail(403,'Use an invitation for this workspace.');
 if(body.signupMode==='join'||(body.audience&&body.audience!=='lead'))fail(400,'Join your church with an invitation code. Only a Pastor or Program team member can register a new church.');
 const name=String(body.churchName||'').trim();
 if(!name||name.length>120)fail(400,'Enter your church name (up to 120 characters).');
 return {name};
}
async function ensureUnassigned(client,user){
 await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[user.id]);
 if((await client.query('SELECT 1 FROM axiom.members WHERE user_id=$1 LIMIT 1',[user.id])).rows.length)fail(409,'Your account already belongs to a church. Open your existing workspace.');
}
async function createChurch(client,user,name){
 const id=randomUUID(),project=State.create();
 await client.query('INSERT INTO axiom.churches(id,name,created_by) VALUES($1,$2,$3)',[id,name,user.id]);
 await client.query('INSERT INTO axiom.members(church_id,user_id,name,username,role,audience) VALUES($1,$2,$3,$4,$5,$6)',[id,user.id,user.name,user.username,'owner','lead']);
 await client.query('INSERT INTO axiom.workspaces(church_id,project,updated_by) VALUES($1,$2,$3)',[id,project,user.id]);
 for(const audience of ['lead','pro','u'])await insertCode(client,id,user,audience,25);
 return {churchId:id,audience:'lead'};
}
async function joinChurch(client,user,code){
 const {invite,legacy}=await findInvite(client,code,user.username,true);
 await client.query('INSERT INTO axiom.members(church_id,user_id,name,username,role,audience) VALUES($1,$2,$3,$4,$5,$6)',[invite.church_id,user.id,user.name,user.username,invite.role,invite.audience]);
 if(legacy)await client.query('UPDATE axiom.invitations SET accepted_at=now() WHERE id=$1',[invite.id]);
 else await client.query('UPDATE axiom.join_codes SET uses=uses+1 WHERE id=$1',[invite.id]);
 return {churchId:invite.church_id,audience:invite.audience};
}
async function provisionSignup(user,intent){
 return transaction(async client=>{await ensureUnassigned(client,user);return intent.code?joinChurch(client,user,intent.code):createChurch(client,user,intent.name);});
}
async function acceptCode(user,value,expectedAudience){
 const code=normalizeCode(value);
 return transaction(async client=>{
  await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[user.id]);
  // A successful join can be retried without consuming another use.
  const {invite,legacy}=await findInvite(client,code,user.username,false,true);
  if(expectedAudience&&invite.audience!==expectedAudience)fail(403,'This invitation belongs to a different workspace. Use its original link.');
  const existing=(await client.query('SELECT church_id,audience FROM axiom.members WHERE user_id=$1',[user.id])).rows;
  if(existing.length){if(existing.length===1&&existing[0].church_id===invite.church_id){if(existing[0].audience!==invite.audience)fail(403,'Your account does not have access to '+Workspaces.get(invite.audience).name+'. Sign in with the account assigned to this team.');if(legacy)validInvite(invite);return {churchId:invite.church_id,audience:existing[0].audience};}fail(409,'Your account already belongs to a different church. Ask your church team for help.');}
  return joinChurch(client,user,code);
 });
}
function tokenFor(id){
 if(!process.env.BETTER_AUTH_SECRET)fail(503,'Church invitations are not configured.');
 return createHmac('sha256',process.env.BETTER_AUTH_SECRET).update('axiom:church-invite:v1:'+id).digest('hex').slice(0,32);
}
function formatCode(code){return code.toUpperCase().match(/.{8}/g).join('-');}
function describeCode(row,base){
 const {token_hash,...metadata}=row;
 // Older random codes remain valid, but cannot be recovered from their hashes.
 const token=tokenFor(row.id),active=!row.revoked_at&&new Date(row.expires_at)>new Date()&&row.uses<row.max_uses;
 if(hash(token)!==token_hash||!active)return metadata;
 const code=formatCode(token),workspace=Workspaces.get(row.audience);
 return {...metadata,code,url:base+'/'+workspace.path+'?signup=1&join='+encodeURIComponent(code),workspaceName:workspace.name};
}
async function insertCode(client,church,user,audience,maxUses){
 const id=randomUUID(),code=tokenFor(id);
 const result=await client.query('INSERT INTO axiom.join_codes(id,church_id,audience,role,token_hash,created_by,max_uses) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,audience,expires_at,max_uses,uses',[id,church,audience,audience==='u'?'viewer':'editor',hash(code),user.id,maxUses]);
 return {...result.rows[0],code:formatCode(code)};
}
async function generateCode(church,user,audience,maxUses=25){
 if(!['lead','pro','u'].includes(audience))fail(400,'Choose Pastor / Program, Tech / Media, or Members.');
 if(!Number.isInteger(maxUses)||maxUses<1||maxUses>500)fail(400,'Choose between 1 and 500 uses.');
 return insertCode(db(),church,user,audience,maxUses);
}
async function invitationInfo(value){
 const code=normalizeCode(value);
 // Legacy username-targeted invitations cannot disclose their destination without a username.
 if(!/^[a-f0-9]{32}$/.test(code))fail(400,'Enter a valid church invitation code.');
 const {invite}=await findInvite(db(),code,'');
 const church=(await db().query('SELECT name FROM axiom.churches WHERE id=$1',[invite.church_id])).rows[0];
 if(!church)fail(410,'This church invitation is no longer available.');
 const workspace=Workspaces.get(invite.audience);
 return {churchName:church.name,audience:invite.audience,workspaceName:workspace.name,description:workspace.description};
}
module.exports={prepareSignup,provisionSignup,acceptCode,generateCode,normalizeCode,describeCode,invitationInfo};
