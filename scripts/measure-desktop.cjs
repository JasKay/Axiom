'use strict';
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),desktop=path.join(root,'desktop'),{files}=require('./desktop-assets.cjs');
process.chdir(root);
const baseline='badbc29f81dfda72afc1425cf46b17db9c90824e';
const run=(script,args=[])=>execFileSync(process.execPath,[script,...args],{cwd:root,stdio:'inherit',env:{...process.env,CSC_IDENTITY_AUTO_DISCOVERY:'false'}});
const packageFile=require.resolve('electron-builder/package.json',{paths:[desktop]}),builder=JSON.parse(fs.readFileSync(packageFile));
const cli=path.resolve(path.dirname(packageFile),typeof builder.bin==='string'?builder.bin:builder.bin['electron-builder']);
const target=process.platform==='win32'?['--win','--x64']:['--mac','--arm64','--x64'];
function measure(output){
  const directory=path.join(desktop,output),assets=files(path.join(desktop,'app'));
  const archives=fs.readdirSync(directory).filter(name=>/\.(exe|zip|dmg)$/.test(name)).map(name=>({name,bytes:fs.statSync(path.join(directory,name)).size}));
  const installed=fs.readdirSync(directory,{withFileTypes:true}).filter(e=>e.isDirectory()&&/^(win-unpacked|mac|mac-arm64)$/.test(e.name)).map(e=>({name:e.name,bytes:files(path.join(directory,e.name)).reduce((sum,f)=>sum+f.bytes,0)}));
  return {appBytes:assets.reduce((sum,f)=>sum+f.bytes,0),archives,installed,largestAssets:assets.sort((a,b)=>b.bytes-a.bytes).slice(0,15)};
}
const temporary=path.join(root,'.desktop-size-baseline.cjs');
let before;
try{
  fs.writeFileSync(temporary,execFileSync('git',['show',baseline+':build.cjs'],{encoding:'utf8'}));
  run(temporary);run(path.join(desktop,'bundle-updater.cjs'));
  run(cli,['--projectDir',desktop,'--publish','never','--config.directories.output=baseline-release',...target]);
  before=measure('baseline-release');
}finally{if(fs.existsSync(temporary))fs.unlinkSync(temporary);}
run(path.join(root,'build.cjs'));run(path.join(desktop,'bundle-updater.cjs'));
run(cli,['--projectDir',desktop,'--publish','never','--config.directories.output=release',...target]);
const after=measure('release');
const compare=(before,after)=>after.map(file=>{const old=before.find(entry=>entry.name===file.name);if(!old)throw Error('Missing baseline '+file.name);return {name:file.name,beforeBytes:old.bytes,afterBytes:file.bytes,savedBytes:old.bytes-file.bytes,reductionPercent:Number(((old.bytes-file.bytes)/old.bytes*100).toFixed(2))};});
const report={platform:process.platform,commit:process.env.GITHUB_SHA,baselineCommit:baseline,before,after,archives:compare(before.archives,after.archives),installed:compare(before.installed,after.installed)};
fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/desktop-size-'+process.platform+'.json',JSON.stringify(report,null,2));
console.log('DESKTOP_SIZE_REPORT '+JSON.stringify({platform:report.platform,appBytesBefore:before.appBytes,appBytesAfter:after.appBytes,archives:report.archives,installed:report.installed}));
if(after.appBytes>=before.appBytes)throw Error('Desktop assets did not shrink');
for(const archive of report.archives)if(archive.savedBytes<=0)throw Error('Archive did not shrink: '+archive.name);
if(process.env.GITHUB_STEP_SUMMARY){const mib=bytes=>(bytes/1048576).toFixed(1)+' MiB';fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,'\n## Desktop package size\n\n| Package | Before | After | Reduction |\n|---|---:|---:|---:|\n'+report.archives.map(f=>'| '+f.name+' | '+mib(f.beforeBytes)+' | '+mib(f.afterBytes)+' | '+f.reductionPercent+'% |').join('\n')+'\n\nApp assets: '+mib(before.appBytes)+' → '+mib(after.appBytes)+'.\n');}
