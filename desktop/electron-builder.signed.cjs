'use strict';
// Opt-in production Mac build. Never silently fall back to an unsigned release.
for(const name of ['CSC_LINK','CSC_KEY_PASSWORD','APPLE_ID','APPLE_APP_SPECIFIC_PASSWORD','APPLE_TEAM_ID'])if(!process.env[name])throw Error('Signed Mac build requires '+name+' through secure build credentials.');
const config=structuredClone(require('./package.json').build);
delete config.mac.identity;
config.mac.hardenedRuntime=true;
config.mac.notarize=true;
config.forceCodeSigning=true;
module.exports=config;
