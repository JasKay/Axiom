'use strict';
const tabs = [...document.querySelectorAll('[data-product]')];
const captions = {
  lead: 'AxiomLeader · Plan one service, message Tech and publish member updates with clear destinations.',
  pro: 'Axiom Pro · Standalone and Shared workspaces, service-linked messages, private Preview and controlled Program.',
  u: 'AxiomU · Revisit published messages, scripture and church updates.'
};
function selectProduct(name, focus = false) {
  tabs.forEach(tab => {
    const selected = tab.dataset.product === name;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
    if (selected && focus) tab.focus();
  });
  document.getElementById('product-caption').textContent = captions[name];
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectProduct(tab.dataset.product));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectProduct(tabs[next].dataset.product, true);
  });
});
document.querySelectorAll('[data-open-product]').forEach(link => {
  link.addEventListener('click', () => selectProduct(link.dataset.openProduct));
});
const menu = document.querySelector('.menu-toggle');
const nav = document.getElementById('main-nav');
function closeMenu() { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
menu.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(expanded));
  nav.classList.toggle('is-open', expanded);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); }
});
document.getElementById('year').textContent = new Date().getFullYear();

// Desktop downloads are public and never pass through account onboarding.
(async()=>{const host=document.getElementById('desktop-downloads'),status=document.getElementById('desktop-download-status');if(!host)return;try{const response=await fetch('downloads.json',{cache:'no-store'});if(!response.ok)throw Error();const release=await response.json();for(const file of release.files){const url=new URL(file.url);if(url.protocol!=='https:'||url.hostname!=='github.com'||!url.pathname.startsWith('/JasKay/Axiom/releases/download/'))continue;const link=document.createElement('a');link.className='desktop-download-card';link.href=url.href;const title=document.createElement('strong');title.textContent=file.label;const detail=document.createElement('span');detail.textContent=file.detail;const action=document.createElement('span');action.className='desktop-download-action';action.textContent='Download ↓';link.append(title,detail,action);host.append(link);}status.textContent=host.children.length?'Desktop version '+release.version+' · No sign-up required':'Use All desktop releases below to download Axiom Pro.';}catch{status.textContent='Download Axiom Pro using All desktop releases below.';}})();
