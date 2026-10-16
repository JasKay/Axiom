'use strict';
const {options}=require('../server/auth.cjs'),{db}=require('../server/db.cjs');
(async()=>{const {getMigrations}=await import('better-auth/db/migration');const migration=await getMigrations(await options('http://127.0.0.1:4173'));await migration.runMigrations();console.log('Applied Better Auth schema');await db().end();})().catch(e=>{console.error('Account migration failed:',e.message);process.exitCode=1;});
