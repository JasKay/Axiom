(function(root){
'use strict';
const definitions={
 lead:Object.freeze({audience:'lead',name:'AxiomLead Workspace',product:'AxiomLead',team:'For Pastors and Program team members',path:'axiomlead.html',description:'Plan services, prepare notes and share updates with Tech and members.'}),
 pro:Object.freeze({audience:'pro',name:'Axiom Pro Workspace',product:'Axiom Pro',team:'For Tech and Media team members',path:'tech-media.html',description:'Receive service plans, prepare media and operate the presentation studio.'}),
 u:Object.freeze({audience:'u',name:'AxiomU Workspace',product:'AxiomU',team:'For congregation members',path:'members.html',description:'Read published messages, revisit scriptures and keep your personal notes.'})
};
const api=Object.freeze({get:audience=>definitions[audience]||definitions.lead,all:Object.freeze(Object.values(definitions)),fromPath:pathname=>Object.values(definitions).find(item=>pathname.endsWith('/'+item.path))});
if(typeof module==='object'&&module.exports)module.exports=api;else root.AxiomWorkspaces=api;
})(typeof window==='undefined'?globalThis:window);
