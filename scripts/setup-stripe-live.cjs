'use strict';
// Explicit live catalog setup only. Does not create customers or take payments.
const fs=require('node:fs'),Stripe=require('stripe'),S=require('../server/stripe.cjs');
(async()=>{
 if(!process.argv.includes('--live')||!/^[sr]k_live_/.test(process.env.STRIPE_SECRET_KEY||''))throw Error('Explicit --live and a connected live key are required');
 const api=new Stripe(process.env.STRIPE_SECRET_KEY,{apiVersion:'2026-09-30.endive',timeout:15000,maxNetworkRetries:1}),account=await api.accounts.retrieve();
 console.log(JSON.stringify({account:account.id,chargesEnabled:account.charges_enabled,detailsSubmitted:account.details_submitted}));
 if(account.id!=='acct_1SKHxbANwPTzy00v')throw Error('Connected account does not match the approved Bracket account');
 if(!account.charges_enabled)throw Error('Stripe account must be activated before live checkout');
 let product;try{product=await api.products.retrieve('axiom_church_workspace');}catch(e){if(e.code!=='resource_missing')throw e;product=await api.products.create({id:'axiom_church_workspace',name:'Axiom Church Workspace',description:'One church subscription for AxiomLeader, connected Axiom Pro and AxiomU.'},{idempotencyKey:'axiom-church-product-v1'});}
 let price=(await api.prices.list({lookup_keys:['axiom_church_usd_monthly_v1'],limit:1})).data[0];if(!price)price=await api.prices.create({product:product.id,currency:'usd',unit_amount:999,recurring:{interval:'month'},lookup_key:'axiom_church_usd_monthly_v1'},{idempotencyKey:'axiom-church-usd-monthly-v1'});
 if(!require('../server/billing.cjs').priceValid(price))throw Error('Price differs from the approved US$9.99 monthly plan');
 let portal=(await api.billingPortal.configurations.list({limit:100})).data.find(p=>p.metadata?.axiom==='church-v1');if(!portal)portal=await api.billingPortal.configurations.create({business_profile:{headline:'Manage your Axiom church subscription'},features:{customer_update:{enabled:true,allowed_updates:['email','name','address']},invoice_history:{enabled:true},payment_method_update:{enabled:true},subscription_cancel:{enabled:true,mode:'at_period_end'}},metadata:{axiom:'church-v1'}},{idempotencyKey:'axiom-church-portal-v1'});
 const filename='.vercel/billing-live.json',existing=fs.existsSync(filename)?JSON.parse(fs.readFileSync(filename,'utf8')):null,url='https://axiomworship.vercel.app/api/stripe-webhook';
 let endpoint=existing?.endpoint?await api.webhookEndpoints.retrieve(existing.endpoint):null,secret=existing?.env?.STRIPE_WEBHOOK_SECRET;
 if(!endpoint){endpoint=await api.webhookEndpoints.create({url,api_version:'2026-09-30.endive',enabled_events:S.events,description:'Axiom church subscription lifecycle and risk events'},{idempotencyKey:'axiom-live-webhook-v1'});secret=endpoint.secret;}
 if(!secret||endpoint.url!==url||endpoint.status!=='enabled')throw Error('Webhook configuration needs review');
 const env={STRIPE_CHURCH_PRICE_ID:price.id,STRIPE_PORTAL_CONFIGURATION_ID:portal.id,STRIPE_WEBHOOK_SECRET:secret,AXIOM_BILLING_ORIGIN:'https://axiomworship.vercel.app',AXIOM_BILLING_ENABLED:'true',AXIOM_BILLING_ENFORCE:'true',AXIOM_BILLING_ENFORCE_SINCE:existing?.env?.AXIOM_BILLING_ENFORCE_SINCE||new Date().toISOString()};
 fs.writeFileSync(filename,JSON.stringify({account:account.id,endpoint:endpoint.id,env},null,2));
 console.log(JSON.stringify({product:product.id,price:price.id,portal:portal.id,endpoint:endpoint.id,amount:price.unit_amount,currency:price.currency,interval:price.recurring.interval,secretsWrittenToIgnoredFile:true}));
})().catch(e=>{console.error('Live setup failed:',e.code||e.type||e.name,e.message?.startsWith('Connected account')||e.message?.startsWith('Stripe account')?e.message:'Check Stripe permissions or setup configuration');process.exit(1);});
