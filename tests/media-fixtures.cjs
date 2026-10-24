'use strict';
// A deterministic one-second VP8 WebM from a canvas WebP keyframe. No live screen capture or timers.
function webmFromWebP(base64,width,height,durationMs=1000){
 const image=Buffer.from(base64,'base64');let frame;
 for(let at=12;at+8<=image.length;){const kind=image.toString('ascii',at,at+4),size=image.readUInt32LE(at+4);if(kind==='VP8 '){frame=image.subarray(at+8,at+8+size);break;}at+=8+size+(size%2);}
 if(!frame)throw Error('A lossy VP8 WebP keyframe is required');
 const uint=value=>{const bytes=[];do{bytes.unshift(value&255);value=Math.floor(value/256);}while(value);return Buffer.from(bytes);};
 const size=value=>{for(let length=1;length<=4;length++)if(value<2**(7*length)-1){const result=Buffer.alloc(length);let n=value;for(let i=length-1;i>=0;i--){result[i]=n&255;n=Math.floor(n/256);}result[0]|=1<<(8-length);return result;}throw Error('Fixture too large');};
 const tag=(id,data)=>{const bytes=Array.isArray(data)?Buffer.concat(data):Buffer.isBuffer(data)?data:typeof data==='number'?uint(data):Buffer.from(data);return Buffer.concat([Buffer.from(id,'hex'),size(bytes.length),bytes]);};
 const duration=Buffer.alloc(8);duration.writeDoubleBE(durationMs);
 const header=tag('1a45dfa3',[tag('4286',1),tag('42f7',1),tag('42f2',4),tag('42f3',8),tag('4282','webm'),tag('4287',2),tag('4285',2)]);
 const info=tag('1549a966',[tag('2ad7b1',1000000),tag('4489',duration),tag('4d80','Axiom tests'),tag('5741','Axiom tests')]);
 const tracks=tag('1654ae6b',[tag('ae',[tag('d7',1),tag('73c5',1),tag('83',1),tag('86','V_VP8'),tag('e0',[tag('b0',width),tag('ba',height)])])]);
 const blocks=[];for(let i=0;i<durationMs/100;i++){const block=Buffer.alloc(4);block[0]=0x81;block.writeInt16BE(i*100,1);block[3]=0x80;blocks.push(tag('a3',Buffer.concat([block,frame])));}
 return Buffer.concat([header,tag('18538067',[info,tracks,tag('1f43b675',[tag('e7',0),...blocks])])]);
}
module.exports={webmFromWebP};
