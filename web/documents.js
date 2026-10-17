export async function importDocument(file,progress=()=>{}){
const lower=file.name.toLowerCase(),slides=[];
function slide(src,index){return {id:crypto.randomUUID(),kind:'image',src,text:'',footer:'',title:'Page '+(index+1),bg:'#000000',fg:'#ffffff',font:44,align:'center',fit:'contain'};}
if(lower.endsWith('.pdf')){
 const pdfjs=await import('./vendor/pdf/pdf.mjs');pdfjs.GlobalWorkerOptions.workerSrc='./vendor/pdf/pdf.worker.mjs';
 const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),cMapUrl:'./vendor/pdf/cmaps/',cMapPacked:true,standardFontDataUrl:'./vendor/pdf/standard_fonts/',wasmUrl:'./vendor/pdf/wasm/',isEvalSupported:false});let doc;
 try{doc=await task.promise;if(doc.numPages>200)throw Error('Use documents with 200 pages or fewer');for(let i=1;i<=doc.numPages;i++){progress(Math.round((i-1)/doc.numPages*100),'Rendering PDF page '+i+' of '+doc.numPages);const page=await doc.getPage(i),base=page.getViewport({scale:1}),viewport=page.getViewport({scale:Math.min(2,1600/base.width)}),canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);await page.render({canvasContext:canvas.getContext('2d'),canvas,viewport}).promise;slides.push(slide(canvas.toDataURL('image/png'),i-1));page.cleanup();canvas.width=0;canvas.height=0;}}finally{await task.destroy();}
}else if(lower.endsWith('.pptx')){
 const {PptxRenderer}=await import('./vendor/pptx/src/index.js');const renderer=new PptxRenderer();try{await renderer.load(file,(p,message)=>progress(Math.round(p*20),message));if(renderer.slideCount>200)throw Error('Use decks with 200 slides or fewer');if(!renderer.slideCount)throw Error('No slides found in this PowerPoint');for(let i=0;i<renderer.slideCount;i++){progress(20+Math.round(i/renderer.slideCount*80),'Rendering PowerPoint slide '+(i+1)+' of '+renderer.slideCount);const canvas=document.createElement('canvas');await renderer.renderSlide(i,canvas,1600);slides.push(slide(canvas.toDataURL('image/png'),i));canvas.width=0;canvas.height=0;}}finally{renderer.destroy();}
}else throw Error('Choose a PDF or .pptx file. Export legacy .ppt files as PDF or .pptx first.');
if(!slides.length)throw Error('No pages were found in this document');progress(100,'Import complete');return slides;
}
