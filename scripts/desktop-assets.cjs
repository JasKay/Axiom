'use strict';
const fs=require('node:fs'),path=require('node:path');

// Pro's scripture matching is in sermon-engine.js. The generative model runtime
// belongs to the Lead web workspace and is not loaded by the desktop app.
const desktopPages=new Set(['studio.html','tech-media.html','output.html']);
const webOnly=new Set(['local-assistant-client.js','vendor/local-assistant.js','studio-preview.png','leader-preview.png','members-preview.png']);
function includeDesktopAsset(relative){
  const name=relative.replaceAll('\\','/');
  if(name==='vendor/onnx'||name.startsWith('vendor/onnx/'))return false;
  if(webOnly.has(name))return false;
  if(!name.includes('/')&&name.endsWith('.html'))return desktopPages.has(name);
  return true;
}
function files(directory,prefix=''){
  return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
    const relative=prefix+entry.name,absolute=path.join(directory,entry.name);
    return entry.isDirectory()?files(absolute,relative+'/'):entry.isFile()?[{path:relative,bytes:fs.statSync(absolute).size}]:[];
  });
}
function copyDesktopAssets(source,destination){
  const base=path.resolve(source),all=files(base);
  fs.cpSync(base,destination,{recursive:true,filter:filename=>includeDesktopAsset(path.relative(base,filename))});
  const removed=all.filter(file=>!includeDesktopAsset(file.path));
  const worker=path.join(destination,'sw.js');
  if(fs.existsSync(worker)){
    const shell=['./','index.html',...files(destination).filter(file=>file.path!=='sw.js').map(file=>file.path)];
    fs.writeFileSync(worker,fs.readFileSync(worker,'utf8').replace(/const SHELL=\[[^;]+;/,'const SHELL='+JSON.stringify(shell)+';'));
  }
  return {sourceBytes:all.reduce((sum,file)=>sum+file.bytes,0),removedBytes:removed.reduce((sum,file)=>sum+file.bytes,0),removed};
}
module.exports={includeDesktopAsset,copyDesktopAssets,files};
