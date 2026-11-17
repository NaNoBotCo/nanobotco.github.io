/* Sian Studio visual editor: on-preview edit controls, single-click navigation. */
(function(){
'use strict';
const frame=document.getElementById('preview'),bar=document.querySelector('.preview-head'),sidebar=document.querySelector('.editor');
if(!frame||!bar||!sidebar)return;
let enabled=true;
const guide=document.createElement('div');
guide.className='sian-canvas-guide';
guide.innerHTML='<strong>✎ Edit directly in the preview</strong><span>Click an EDIT label on the heading, artwork, buttons, or any section. Its fields will open on the left.</span>';
bar.after(guide);
const toggleWrap=document.createElement('label');toggleWrap.className='sian-edit-toggle';
toggleWrap.innerHTML='<input type="checkbox" checked aria-label="Show edit labels in preview"> <span>✎ Editing ON</span>';
bar.append(toggleWrap);
const outerCss=document.createElement('style');
outerCss.textContent=[
'.sian-canvas-guide{display:flex;align-items:center;gap:12px;padding:10px 13px;background:#e6f2e8;border:1px solid #c4d8c8;border-radius:9px;margin:0 0 11px;color:#294c3e;font-size:12px;flex-wrap:wrap}',
'.sian-canvas-guide strong{font-size:13px}.sian-edit-toggle{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;background:#fff;border:1px solid #c3d1c4;border-radius:9px;padding:8px 10px}',
'.sian-edit-toggle input{accent-color:#346a4c;width:17px;height:17px}#pane-sections .sian-control-wrap{margin-top:10px!important}',
'#pane-sections .sian-section-list-heading{margin-top:25px!important}.preview-head{position:relative}',
'.sian-live-guide{padding:11px 13px;border-left:3px solid #648a6c;background:#edf5ee;border-radius:7px;margin:10px 0 15px;font-size:12px;color:#335241}',
'.sian-live-guide strong{font-size:13px}.sian-live-guide p{margin:3px 0}',
'@media(max-width:540px){.sian-canvas-guide{font-size:11px}.sian-edit-toggle{font-size:11px}}'
].join('');
document.head.append(outerCss);
function editSection(id,target){
 if(id==='identity'){window.showStep('shop');sidebar.scrollTo({top:0,behavior:'smooth'});setTimeout(()=>document.getElementById('brand')?.focus({preventScroll:true}),200);return}
 if(id==='products'){window.showStep('products');sidebar.scrollTo({top:100,behavior:'smooth'});setTimeout(()=>document.getElementById('addProduct')?.focus({preventScroll:true}),180);return}
 if(window.SianStudio?.selectSection){window.SianStudio.selectSection(id,target);guide.innerHTML='<strong>✎ Editing '+id+'</strong><span>Change the matching field on the left; the preview refreshes automatically.</span>'}
}
function sync(){
 try{frame.contentDocument?.documentElement?.classList.toggle('sian-builder-edit-off',!enabled)}catch{}
}
toggleWrap.querySelector('input').onchange=function(){
 enabled=this.checked;toggleWrap.querySelector('span').textContent=enabled?'✎ Editing ON':'◉ View only';guide.hidden=!enabled;sync();
};
function install(){
 let doc;try{doc=frame.contentDocument;if(!doc?.body)return}catch{return}
 if(doc.getElementById('sian-inline-edit-ui'))return;
 const style=doc.createElement('style');style.id='sian-inline-edit-ui';
 style.textContent=[
'.sian-edit-zone{position:relative!important;outline:2px solid transparent;outline-offset:-2px}',
'.sian-edit-zone:hover{outline:2px dashed #d2a45a!important}',
'.sian-edit-spot{position:absolute;top:8px;right:8px;z-index:9000;display:inline-flex;align-items:center;gap:4px;background:#1b4836!important;color:#f7f6ee!important;border:2px solid #f1dfbd!important;border-radius:999px;padding:6px 11px;box-shadow:0 4px 13px #0004;cursor:pointer;font:700 12px/1.2 system-ui,sans-serif!important;letter-spacing:0!important;text-shadow:none!important;opacity:.97;max-width:220px;white-space:nowrap}',
'.sian-edit-spot:hover{background:#c7a06b!important;color:#181b16!important}',
'.sian-edit-spot:focus-visible{outline:3px solid #eebd77;outline-offset:3px}',
'.sian-edit-zone.sian-edit-image>.sian-edit-spot{top:18px;left:16px;right:auto}',
'.sian-edit-zone.sian-edit-copy>.sian-edit-spot{top:7px;right:0}',
'.sian-edit-zone.sian-edit-actions>.sian-edit-spot{top:-32px;right:0}',
'.sian-builder-edit-off .sian-edit-spot{display:none!important}',
'.sian-builder-edit-off .sian-edit-zone:hover{outline:none!important}',
'@media(max-width:600px){.sian-edit-spot{font-size:11px!important;padding:5px 8px}}'
].join('');
 doc.head.append(style);
 const make=(element,label,id,target,cls='')=>{
  if(!element)return;
  element.classList.add('sian-edit-zone');if(cls)element.classList.add(cls);
  const button=doc.createElement('button');button.className='sian-edit-spot';button.type='button';button.textContent='✎ '+label;
  button.setAttribute('aria-label',label+' — open editor');
  button.addEventListener('click',e=>{e.stopImmediatePropagation();e.stopPropagation();e.preventDefault();editSection(id,target)},true);
  element.append(button);
 };
 const lang=(doc.documentElement.dataset.lang||doc.documentElement.lang)==='en'?'En':'Th';
 make(doc.querySelector('.header'),'Shop identity','identity','');
 make(doc.querySelector('.hero-copy'),'Hero headline','hero','first'+lang,'sian-edit-copy');
 make(doc.querySelector('.hero-lead'),'Description','hero','lead'+lang);
 make(doc.querySelector('.hero-actions'),'Buttons and links','hero','primary'+lang,'sian-edit-actions');
 make(doc.querySelector('.hero-image'),'Change artwork','hero','imageUpload','sian-edit-image');
 make(doc.querySelector('#collection .section-head'),'Catalogue','collection','headline'+lang);
 make(doc.querySelector('#story .story-copy'),'About / story','story','headline'+lang);
 make(doc.querySelector('#fidget .sian-spin-layout'),'Spinner lab','fidget','headline'+lang);
 make(doc.querySelector('#toy .kinetic-copy'),'Math toy','toy','headline'+lang);
 make(doc.querySelector('#oracle .oracle-hub-top'),'Divination','oracle','headline'+lang);
 make(doc.querySelector('#newsletter .newsletter-layout'),'Newsletter','newsletter','headline'+lang);
 doc.querySelectorAll('section.sian-extra[id^="section-"]').forEach(el=>make(el,'Edit section',el.id.slice('section-'.length),'title'));
 const firstProduct=doc.querySelector('.product-card');if(firstProduct)make(firstProduct,'Edit products','products','');
 sync();
}
frame.addEventListener('load',()=>setTimeout(install,90));
if(frame.contentDocument?.readyState==='complete')install();
const pane=document.getElementById('pane-sections');
if(pane){
 const helper=document.createElement('div');helper.className='sian-live-guide';
 helper.innerHTML='<strong>How to edit this page</strong><p>1. Click a green ✎ label on the live preview at right.</p><p>2. The exact editing fields open on the left.</p><p>3. Edit the text, artwork, links or styling and the preview updates.</p><p>4. Use the section list below the fields to move, hide or add blocks.</p>';
 pane.insertBefore(helper,pane.querySelector('.sian-control-wrap')||pane.firstChild);
}
})();