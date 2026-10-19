/* Presentation folders extend existing service entries without changing saved slide IDs. */
(function(root){'use strict';
function ensure(service){if(!Array.isArray(service.decks)||!service.decks.length)service.decks=[{id:service.id+':main',name:'Main presentation'}];if(!service.decks.some(d=>d.id===service.activeDeckId))service.activeDeckId=service.decks[0].id;for(const e of service.entries)if(!service.decks.some(d=>d.id===e.deckId))e.deckId=service.decks[0].id;return service;}
function entries(service,id){ensure(service);return service.entries.filter(e=>e.deckId===(id||service.activeDeckId));}
function create(service,name,uid){ensure(service);const title=String(name||'').trim();if(!title||title.length>100)throw Error('Enter a presentation name under 100 characters');if(service.decks.length>=50)throw Error('Keep up to 50 presentations per service');const deck={id:uid(),name:title};service.decks.push(deck);service.activeDeckId=deck.id;return deck;}
function attach(service,itemId,uid,deckId){ensure(service);if(service.entries.length>=3000)throw Error('This service is full');const id=deckId||service.activeDeckId;if(!service.decks.some(d=>d.id===id))throw Error('Presentation not found');const entry={id:uid(),itemId,deckId:id};service.entries.push(entry);return entry;}
function move(service,id,target){const from=service.entries.findIndex(e=>e.id===id),to=service.entries.findIndex(e=>e.id===target);if(from<0||to<0||service.entries[from].deckId!==service.entries[to].deckId)return false;service.entries.splice(to,0,service.entries.splice(from,1)[0]);return true;}
const api={ensure,entries,create,attach,move};if(typeof module==='object'&&module.exports)module.exports=api;else root.AxiomPresentations=api;
})(typeof window==='undefined'?globalThis:window);
