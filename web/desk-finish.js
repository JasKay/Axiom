/* The visual study, connected to the presentation engine. */
(()=>{'use strict';
const el=id=>document.getElementById(id),make=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text)n.textContent=text;return n;};
const chromeIcon=path=>'<svg class="desk-chrome-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+path+'"/></svg>';
for(const [id,path]of [['desk-add-text','M4 5h16M12 5v14M8 19h8'],['desk-add-media','M3 3h18v18H3zM3 17l6-6 5 5 3-3 4 4M15 7h2'],['desk-add-bible','M12 5C8 2 4 3 2 4v16c3-2 7-1 10 1 3-2 7-3 10-1V4c-3-2-7-1-10 1v16']]){const button=el(id),label=make('span','',button.textContent);button.replaceChildren();button.insertAdjacentHTML('afterbegin',chromeIcon(path));button.append(label);}
const editSummary=el('editor').querySelector('summary');editSummary.innerHTML=chromeIcon('M4 20l4-1L20 7l-3-3L5 16zM14 7l3 3')+'<span>Edit slide</span>';
const headerTools=document.querySelector('.header-tools'),themeButton=make('button','desk-theme-toggle');themeButton.type='button';themeButton.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="7"/><path d="M12 5v14"/><path d="M12 5a7 7 0 0 0 0 14z" fill="currentColor"/></svg>';
function syncTheme(){const light=document.body.dataset.deskTheme==='light';themeButton.title=themeButton.ariaLabel=light?'Switch to dark appearance':'Switch to light appearance';themeButton.setAttribute('aria-pressed',String(light));}
themeButton.onclick=()=>{el('desk-theme').value=document.body.dataset.deskTheme==='light'?'dark':'light';el('desk-theme').dispatchEvent(new Event('change'));};headerTools.prepend(themeButton);el('desk-theme').addEventListener('change',syncTheme);syncTheme();
const modeButton=make('button','desk-workspace-mode'),modeDialog=make('dialog','asset-dialog desk-mode-dialog');modeButton.type='button';modeDialog.id='desk-mode-dialog';modeDialog.setAttribute('aria-labelledby','desk-mode-title');
const modeHead=make('div','asset-dialog-header'),modeTitle=make('h2','','Your workspace'),modeClose=make('button','','×');modeTitle.id='desk-mode-title';modeClose.type='button';modeClose.ariaLabel='Close workspace options';modeClose.onclick=()=>modeDialog.close();modeHead.append(modeTitle,modeClose);
const localCard=make('section','desk-mode-card'),churchCard=make('section','desk-mode-card');localCard.append(make('h3','','Standalone Pro'),make('p','','Present with local media, saved services and playlists. Files on this computer stay available offline.'));churchCard.append(make('h3','','Church bundle'),make('p','','Connect your church for shared agendas, service notes, messages and team files.'));
const connect=make('button','primary','Connect your church');connect.type='button';connect.onclick=()=>{modeDialog.close();el('desk-settings').showModal();el('connect-church')?.focus();};churchCard.append(connect,make('small','','Cloud file limits still apply. Bundle pricing and storage allowances are not configured in this preview.'));modeDialog.append(modeHead,localCard,churchCard);document.body.append(modeDialog);
function syncMode(){const connected=!!window.AxiomProContext?.church;modeButton.textContent=connected?'Church workspace':'Standalone Pro';modeButton.title='Standalone Pro and Church bundle';modeButton.ariaLabel='Workspace mode: '+modeButton.textContent;localCard.dataset.current=String(!connected);churchCard.dataset.current=String(connected);connect.textContent=connected?'Church & profile settings':'Connect your church';}
modeButton.onclick=()=>{syncMode();modeDialog.showModal();};headerTools.prepend(modeButton);syncMode();
const program=document.querySelector('.output-monitor'),timer=document.querySelector('.desk-countdown');
program.after(timer);
for(const [id,label,glyph]of [['previous','Previous slide','←'],['next','Next slide','→']]){el(id).textContent=glyph;el(id).setAttribute('aria-label',label);el(id).title=label;}
const frame=make('div','program-frame'),rail=make('div','program-layers');
rail.setAttribute('role','group');rail.setAttribute('aria-label','Clear Program layers');
el('live-preview').before(frame);frame.append(el('live-preview'),rail);
const paths={Text:'M5 5h14M12 5v14M8 19h8',Video:'M3 5h12v14H3zM15 10l6-4v12l-6-4',Image:'M3 3h18v18H3zM3 17l6-6 5 5 3-3 4 4M15 7h2',Audio:'M4 10h4l5-5v14l-5-5H4zM17 8a6 6 0 0 1 0 8',All:'M5 5l14 14M19 5L5 19'};
const buttons={};
for(const name of Object.keys(paths)){const b=make('button','program-layer');b.type='button';b.title=b.ariaLabel=name==='All'?'Clear all layers':name==='Audio'?'Stop audio':'Clear '+name.toLowerCase();b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+paths[name]+'"/></svg>';b.onclick=()=>{if(name==='All')live.clearAll=true;if(name==='Text'||name==='All')live.clearText=true;if(name==='Video'||name==='All')live.clearVideo=true;if(name==='Image'||name==='All')live.clearImage=true;if(name==='Audio'||name==='All')live.clearAudio=true;send();};rail.append(b);buttons[name]=b;}
function layerState(){const s=live.slide,shown=!!s&&!live.black,active={Text:shown&&!live.clearText&&!!(s.text||s.footer),Video:shown&&!live.clearVideo&&s.kind==='video',Image:shown&&!live.clearImage&&(s.kind==='image'||!!s.bgImage),Audio:shown&&!live.clearAudio&&!live.clearVideo&&!muted&&s.kind==='video'};active.All=Object.values(active).some(Boolean);for(const name in buttons){buttons[name].disabled=!active[name];buttons[name].classList.toggle('active',!!active[name]);}}
window.addEventListener('axiom-output-change',layerState);layerState();

// Keep the existing engine fields and save/undo behavior inside a real modal.
const editor=el('editor'),saveButton=el('save-page'),slot=document.querySelector('.desk-editor-slot'),dialog=make('dialog','desk-type-dialog');dialog.id='desk-type-dialog';dialog.setAttribute('aria-labelledby','desk-type-title');
const head=make('header','desk-type-head'),title=make('h2','','Edit slide');title.id='desk-type-title';const privateTag=make('span','desk-private-tag','PREVIEW');head.append(title,privateTag,el('close-slide-editor'));
const body=make('div','desk-type-body'),workspace=make('div','desk-type-workspace'),inspector=make('div','desk-type-inspector'),stage=make('div','stage');stage.id='desk-type-stage';
workspace.append(make('div','desk-type-caption','Slide preview'),stage);
const summary=editor.querySelector('summary');
const textLabel=el('edit-text').closest('label');textLabel.firstChild.textContent='Text / lyrics';workspace.append(el('edit-item-title').closest('label'),el('edit-title').closest('label'),textLabel,el('edit-footer').closest('label'));
inspector.append(make('h3','','Typography'));
function selectField(id,label,choices){const field=make('label','',label),input=make('select');input.id=id;for(const [value,name]of choices)input.append(new Option(name,value));field.append(input);inspector.append(field);return input;}
selectField('edit-font-family','Font',[['DM Sans','DM Sans'],['Georgia','Georgia'],['Segoe UI','Segoe UI'],['Arial','Arial']]);
selectField('edit-font-weight','Weight',[['400','Regular'],['500','Medium'],['600','Semibold'],['700','Bold']]);
selectField('edit-font-style','Style',[['normal','Normal'],['italic','Italic']]);
for(const [id,label,min,max,step]of [['edit-line-height','Line spacing',1,2.5,.1],['edit-letter-spacing','Letter spacing',-2,10,.5]]){const field=make('label','',label),input=make('input');Object.assign(input,{id,type:'number',min,max,step});field.append(input);inspector.append(field);}
for(const n of [...editor.children])if(n!==summary&&n!==el('close-slide-editor'))inspector.append(n);
const footer=make('footer','desk-type-footer'),cancel=make('button','','Cancel');cancel.type='button';cancel.onclick=()=>{editor.open=false;};footer.append(make('span','','Program stays live'),cancel,saveButton);
body.append(workspace,inspector);dialog.append(head,body,footer);document.body.append(dialog);editor.append(summary);slot.append(editor);
function refreshStage(){if(project)renderSlide(stage,editorValue());}
const fields=['edit-font-family','edit-font-weight','edit-font-style','edit-line-height','edit-letter-spacing'];
function loadFonts(){if(!project)return;const s=slide();el('edit-font-family').value=s?.fontFamily||'DM Sans';el('edit-font-weight').value=String(s?.fontWeight||400);el('edit-font-style').value=s?.fontStyle||'normal';el('edit-line-height').value=s?.lineHeight||1.4;el('edit-letter-spacing').value=s?.letterSpacing||0;}
window.addEventListener('axiom-project-change',()=>{loadFonts();if(dialog.open)refreshStage();});
window.addEventListener('axiom-editor-change',loadFonts);
for(const id of [...fields,'edit-text','edit-footer','edit-bg','edit-fg','edit-size','edit-align','edit-fit'])el(id).addEventListener('input',()=>{renderSlide(el('preview'),editorValue());refreshStage();});
editor.addEventListener('toggle',()=>{if(editor.open){loadFonts();if(!dialog.open)dialog.showModal();refreshStage();}else if(dialog.open){dialog.close();drawEditor();}});
dialog.addEventListener('cancel',()=>{editor.open=false;});dialog.addEventListener('close',()=>{if(!editor.open)drawEditor();});
el('close-slide-editor').addEventListener('click',()=>{editor.open=false;});el('save-page').addEventListener('click',()=>{editor.open=false;});
// New content is routed through the destination chooser before editing.
loadFonts();
// Rename section headers directly without opening the slide editor.
function editableHeaders(){if(!project)return;for(const group of document.querySelectorAll('.desk-group')){const head=group.querySelector('.desk-group-heading'),title=head?.querySelector(':scope>button');if(!title||head.querySelector('.desk-rename-header'))continue;const entry=service().entries.find(e=>e.id===group.dataset.entryId),content=project.library.find(i=>i.id===entry?.itemId);if(!content)continue;
 const edit=make('button','desk-rename-header');edit.type='button';edit.title=edit.ariaLabel='Rename '+content.title;edit.innerHTML=chromeIcon('M4 20l4-1L20 7l-3-3L5 16zM14 7l3 3');title.after(edit);
 function rename(){if(head.querySelector('input'))return;const input=make('input','desk-header-input');input.value=content.title;input.maxLength=200;input.ariaLabel='Section header';title.hidden=true;edit.hidden=true;title.before(input);let finished=false;
 function finish(cancel){if(finished)return;finished=true;const value=input.value.trim();input.remove();title.hidden=false;edit.hidden=false;if(!cancel&&value&&value!==content.title){mutate(()=>{content.title=value;});}else title.focus();}
 input.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();finish(false);}if(e.key==='Escape'){e.preventDefault();finish(true);}};input.onblur=()=>finish(false);input.focus();input.select();}
 edit.onclick=rename;title.addEventListener('keydown',e=>{if(e.key==='F2'){e.preventDefault();rename();}});title.title=content.title+' · F2 to rename';
 }}window.AxiomEditableHeaders=editableHeaders;window.addEventListener('axiom-project-change',editableHeaders);window.addEventListener('axiom-output-change',editableHeaders);editableHeaders();

// AxiomAI is a direct listening toggle, with detected passages reviewed in Bible.
const aiButton=document.querySelector('.desk-ai'),start=el('sermon-start'),aiView=el('sermon-view');
const aiSettings=make('details','desk-ai-settings');aiSettings.append(make('summary','','AxiomAI settings'));
for(const selector of ['.sermon-manual','.sermon-transcript-details','.sermon-privacy','.sermon-about']){const section=aiView.querySelector(selector);if(section){section.open=false;aiSettings.append(section);}}
el('desk-settings').append(aiSettings);
const aiLabel=make('span','desk-ai-label','AxiomAI Beta');aiButton.append(aiLabel);
function paintAI(){const active=start.getAttribute('aria-pressed')==='true';aiLabel.textContent=active?'AxiomAI Beta (Recording)':'AxiomAI Beta';aiButton.setAttribute('aria-pressed',String(active));aiButton.title=active?'Stop AxiomAI listening':'Listen for Bible passages';aiButton.ariaLabel=active?'Stop AxiomAI listening':'Start AxiomAI listening';}
aiButton.onclick=()=>{if(start.disabled){notice('Live listening is unavailable on this device. You can still search in Bible.');return;}start.click();paintAI();};
new MutationObserver(paintAI).observe(start,{attributes:true,attributeFilter:['aria-pressed']});
new MutationObserver(()=>{if(start.getAttribute('aria-pressed')!=='true'&&el('sermon-status').textContent&&!['Ready when you are.','Listening stopped.'].includes(el('sermon-status').textContent))notice(el('sermon-status').textContent);}).observe(el('sermon-status'),{childList:true,subtree:true,characterData:true});
paintAI();
})();
