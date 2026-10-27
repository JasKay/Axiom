'use strict';
const Stripe=require('stripe');
let client,key;
function settings(){
 const secret=process.env.STRIPE_SECRET_KEY||'',livemode=/^[sr]k_live_/.test(secret),price=process.env.STRIPE_CHURCH_PRICE_ID||'',webhook=process.env.STRIPE_WEBHOOK_SECRET||'',portal=process.env.STRIPE_PORTAL_CONFIGURATION_ID||'';
 const origin=new URL(process.env.AXIOM_BILLING_ORIGIN||'https://axiomworship.vercel.app');
 if(origin.username||origin.password||origin.pathname!=='/'||origin.search||origin.hash||!(origin.protocol==='https:'||!livemode&&origin.protocol==='http:'&&['localhost','127.0.0.1'].includes(origin.hostname)))throw Error('Invalid billing origin');
 const configured=!!(secret&&price&&webhook&&portal),enabled=configured&&process.env.AXIOM_BILLING_ENABLED==='true';
 const enforceSince=process.env.AXIOM_BILLING_ENFORCE_SINCE||null;
 if(enforceSince&&!Number.isFinite(Date.parse(enforceSince)))throw Error('Invalid billing rollout date');
 return {secret,livemode,price,webhook,portal,origin:origin.origin,configured,enabled,enforce:process.env.AXIOM_BILLING_ENFORCE==='true',enforceSince,amount:999,currency:'usd',interval:'month'};
}
function stripe(){const c=settings();if(!c.secret)throw Object.assign(Error('Billing is not connected yet'),{status:503});if(!client||key!==c.secret){key=c.secret;client=new Stripe(key,{apiVersion:'2026-09-30.endive',timeout:10000,maxNetworkRetries:1});}return client;}
const id=value=>typeof value==='string'?value:value?.id;
function entitlement(row,now=Date.now()){
 if(!row||['disputed','fraud_warning','refunded'].includes(row.risk_state)||!['active','past_due'].includes(row.status))return false;
 const end=new Date(row.paid_until||0).getTime();
 return !!row.paid_at&&(end>now||row.status==='past_due'&&end+3*86400000>now);
}
const events=['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','checkout.session.expired','customer.subscription.created','customer.subscription.updated','customer.subscription.deleted','customer.subscription.paused','customer.subscription.resumed','invoice.paid','invoice.payment_failed','invoice.finalization_failed','charge.refunded','charge.dispute.created','radar.early_fraud_warning.created'];
module.exports={settings,stripe,id,entitlement,events};
