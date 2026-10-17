(function(root){
const extensions={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',bmp:'image/bmp',avif:'image/avif',svg:'image/svg+xml',mp4:'video/mp4',m4v:'video/mp4',webm:'video/webm',ogv:'video/ogg',mov:'video/quicktime'};
function type(file){const declared=typeof file?.type==='string'?file.type.toLowerCase():'';return extensions[String(file?.name||'').split('.').pop().toLowerCase()]||(/^(image|video)\//.test(declared)?declared:'');}
const api={type};if(typeof module!=='undefined')module.exports=api;else root.MediaFiles=api;
})(globalThis);
