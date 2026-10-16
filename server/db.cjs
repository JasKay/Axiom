'use strict';
const {Pool}=require('pg');
let pool;
function db(){if(!pool){if(!process.env.AXIOM_DATABASE_URL)throw Object.assign(Error('Cloud workspace is not configured'),{status:503});const connection=new URL(process.env.AXIOM_DATABASE_URL);connection.searchParams.set('sslmode','verify-full');pool=new Pool({connectionString:connection.toString(),max:4,idleTimeoutMillis:10000,connectionTimeoutMillis:10000,ssl:{rejectUnauthorized:true}});if(process.env.VERCEL)require('@vercel/functions').attachDatabasePool(pool);pool.on('error',()=>console.error('Database connection interrupted'));}return pool;}
async function transaction(fn){const client=await db().connect();try{await client.query('BEGIN');const result=await fn(client);await client.query('COMMIT');return result;}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}}
module.exports={db,transaction};
