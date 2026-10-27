'use strict';
const config=structuredClone(require('./package.json').build),signed=process.env.AXIOM_MAC_SIGNED_RELEASE==='true';
config.mac={...config.mac,identity:signed?undefined:null,hardenedRuntime:signed,notarize:signed,extendInfo:{NSCameraUsageDescription:'Axiom uses your selected camera for local live presentation and optional service recording.',NSMicrophoneUsageDescription:'Axiom uses your selected microphone or mixer input for service recording and Bible assistance.'}};
if(signed){config.forceCodeSigning=true;config.mac.entitlements='build/entitlements.mac.plist';}
module.exports=config;
