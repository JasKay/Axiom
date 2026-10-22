'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {copyDesktopAssets,includeDesktopAsset}=require('../scripts/desktop-assets.cjs');
test('desktop asset selection keeps offline presentation and imports while excluding web-only generation files',()=>{
  for(const file of ['studio.html','tech-media.html','output.html','sermon-engine.js','sermon.js','pro-studio.js','fonts/dm-sans-variable.ttf','vendor/pdf/pdf.mjs','vendor/pdf/cmaps/UniJIS.bcmap','vendor/pdf/wasm/openjpeg.wasm','vendor/pptx/src/index.js','vendor/platform.js'])assert.ok(includeDesktopAsset(file),file);
  for(const file of ['vendor/onnx/ort-wasm-simd-threaded.wasm','vendor/local-assistant.js','local-assistant-client.js','workspace.html','axiomlead.html','members.html','index.html'])assert.equal(includeDesktopAsset(file),false,file);
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'axiom-assets-'));
  try{
    const source=path.join(root,'source'),destination=path.join(root,'desktop');fs.mkdirSync(source);
    const fixture={'studio.html':'<script src="sermon-engine.js"></script>','sermon-engine.js':'scripture matching','vendor/pdf/wasm/decoder.wasm':'pdf decoder','vendor/onnx/generation.wasm':'unused generation runtime','vendor/local-assistant.js':'generation worker','axiomlead.html':'Lead workspace','sw.js':"const CACHE='test';const SHELL=['axiomlead.html','vendor/onnx/generation.wasm'];"};
    for(const [file,content]of Object.entries(fixture)){const dest=path.join(source,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,content);}
    const report=copyDesktopAssets(source,destination);
    assert.equal(fs.readFileSync(path.join(destination,'vendor/pdf/wasm/decoder.wasm'),'utf8'),'pdf decoder');
    assert.equal(fs.existsSync(path.join(destination,'vendor/onnx')),false);
    assert.equal(fs.existsSync(path.join(destination,'vendor/local-assistant.js')),false);
    assert.ok(fs.existsSync(path.join(source,'vendor/onnx/generation.wasm')),'Web assets must remain intact');
    assert.ok(report.removedBytes>0);assert.equal(report.removed.length,3);
    const worker=fs.readFileSync(path.join(destination,'sw.js'),'utf8');assert.ok(!worker.includes('generation.wasm'));assert.ok(worker.includes('index.html'));
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});
