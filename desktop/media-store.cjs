'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),{randomUUID}=require('node:crypto');
const types={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',bmp:'image/bmp',avif:'image/avif',mp4:'video/mp4',m4v:'video/mp4',webm:'video/webm',ogv:'video/ogg',mov:'video/quicktime'};
const valid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|gif|bmp|avif|mp4|m4v|webm|ogv|mov)$/;
function createMediaStore(directory){const root=path.join(directory,'media');return {
 async importFile(source){if(typeof source!=='string'||!path.isAbsolute(source))throw Error('Choose a local media file.');const extension=path.extname(source).slice(1).toLowerCase(),type=types[extension];if(!type)throw Error('Choose a supported image or video file.');const info=await fs.stat(source);if(!info.isFile())throw Error('Choose a media file.');await fs.mkdir(root,{recursive:true});const name=randomUUID()+'.'+extension,destination=path.join(root,name);try{await fs.copyFile(source,destination,require('node:fs').constants.COPYFILE_EXCL);}catch(e){await fs.rm(destination,{force:true});throw Error(e.code==='ENOSPC'?'There is not enough disk space to import this file.':'Could not copy this media file.');}return {src:'presenter://app/local-media/'+name,type,size:info.size};},
 resolve(name){if(!valid.test(name))throw Error('Invalid media reference');return path.join(root,name);}
};}
module.exports={createMediaStore};
