'use strict';
const tabs = [...document.querySelectorAll('[data-product]')];
const captions = {
  lead: 'AxiomLead · Build the running order and give your media team a clear handoff.',
  pro: 'Axiom Pro · Prepare privately and choose exactly what goes live.',
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
