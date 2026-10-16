'use strict';
const fs=require('node:fs'),{randomBytes}=require('node:crypto'),{spawnSync}=require('node:child_process');
if(process.env.BETTER_AUTH_SECRET){console.log('Authentication secret already configured');process.exit(0);}const secret=randomBytes(48).toString('base64url');
const result=spawnSync(process.env.ComSpec||'cmd.exe',['/d','/s','/c','npx.cmd --yes vercel@latest env add BETTER_AUTH_SECRET production,preview,development --type secret --yes'],{input:secret+'\n',encoding:'utf8',env:process.env});if(result.status!==0){process.stderr.write(result.stderr||'Unable to configure the authentication secret');process.exit(1);}fs.appendFileSync('.env.local','\nBETTER_AUTH_SECRET="'+secret+'"\n');console.log('Authentication secret configured on Vercel and locally.');
