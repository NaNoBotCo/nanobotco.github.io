/* Sian Studio v1.5: click-on-text editing inside the actual live storefront.
   No editing scripts are exported into merchant websites: injected only by the builder. */
(function(){
'use strict';
const frame=document.getElementById('preview'),head=document.querySelector('.preview-head');
if(!frame||!head)return;
const stack=[],redoStack=[];
let selectedSection='hero',active=null,enabled=true;
const hint=document.querySelector('.sian-canvas-guide');
if(hint)hint.innerHTML='<strong>✎ Click any text to rewrite it</strong><span>Double-click is not required. Green ✎ labels open detailed settings. Switch to View only to use the site normally.</span>';
const controls=document.createElement('div');controls.className='sian-wys-toolbar';
controls.innerHTML='<span class="sian-wys-cue">✍ Content</span><button id="sianStyleHere" type="button" title="Style the selected section">🎨 Style this section</button><button id="sianUndo" type="button" title="Undo last inline text edit">↶ Undo</button><button id="sianRedo" type="button" title="Redo last inline text edit">↷ Redo</button><span id="sianWysStatus" role="status">Editing storefront</span>';
if(hint)hint.after(controls);else head.after(controls);
const status=controls.querySelector('#sianWysStatus');
const setStatus=message=>{status.textContent=message};
function updateButtons(){controls.querySelector('#sianUndo').disabled=!stack.length;controls.querySelector('#sianRedo').disabled=!redoStack.length}
updateButtons();
const css=document.createElement('style');
css.textContent=[
'.sian-wys-toolbar{display:flex;align-items:center;flex-wrap:wrap;gap:7px;margin:0 0 11px;padding:7px 10px;background:#fff;border:1px solid #d6dfd6;border-radius:9px;font-size:12px}',
'.sian-wys-toolbar button{background:#f6f9f5;color:#2b4a3c;border:1px solid #bfcfc0;padding:6px 10px;border-radius:7px;cursor:pointer;font:600 12px system-ui}',
'.sian-wys-toolbar button:hover{background:#e6f1e6}',
'.sian-wys-toolbar button:disabled{opacity:.36;cursor:default}',
'.sian-wys-cue{font-weight:750;color:#1e593a;margin-right:3px}',
'#sianWysStatus{margin-left:auto;color:#6b7c70}',
'@media(max-width:600px){#sianWysStatus{width:100%}.sian-wys-toolbar{gap:4px}}'
].join('');
document.head.append(css);
function api(){return window.SianStudio}
function apply(ref,key,value,record=false,before=''){
 if(!api()?.updateText)return false;
 const ok=api().updateText(ref,key,value);
 if(ok&&record){stack.push({ref,key,before,after:value});if(stack.length>25)stack.shift();redoStack.length=0;updateButtons()}
 return ok;
}
function undo(){if(active)active.blur();const entry=stack.pop();if(!entry)return;const ok=apply(entry.ref,entry.key,entry.before);if(ok){redoStack.push(entry);setStatus('↶ Previous text restored')}updateButtons()}
function redo(){if(active)active.blur();const entry=redoStack.pop();if(!entry)return;const ok=apply(entry.ref,entry.key,entry.after);if(ok){stack.push(entry);setStatus('↷ Text restored')}updateButtons()}
controls.querySelector('#sianUndo').onclick=undo;
controls.querySelector('#sianRedo').onclick=redo;
controls.querySelector('#sianStyleHere').onclick=()=>{
 if(api()?.selectSection)api().selectSection(selectedSection,'',{skipFocus:true});
 window.SianStyle?.inspect?.(selectedSection);
 setStatus('🎨 Style controls opened on the left');
};
function inEditMode(){return !!document.querySelector('.sian-edit-toggle input')?.checked&&enabled}
document.querySelector('.sian-edit-toggle input')?.addEventListener('change',e=>{
 enabled=e.target.checked;if(!enabled&&active)active.blur();
 controls.hidden=!enabled;setStatus(enabled?'Editing storefront':'View-only mode')
});
function chooseSection(ref,key,{skip=false}={}){
 selectedSection=ref;
 if(ref==='identity'){window.showStep?.('shop');return}
 if(String(ref).startsWith('product:')){window.showStep?.('products');return}
 if(!skip)api()?.selectSection?.(ref,key,{skipFocus:true,skipScroll:true});
 window.SianStyle?.inspect?.(ref,{quiet:true});
}
function install(){
 let doc;
 try{doc=frame.contentDocument;if(!doc?.body)return}catch{return}
 if(doc.querySelector('#sian-wys-css'))return;
 const style=doc.createElement('style');style.id='sian-wys-css';
 style.textContent=[
'.sian-wys-text{cursor:text!important;border-radius:4px;outline:2px solid transparent;outline-offset:4px;transition:outline .1s}',
'.sian-wys-text:hover{outline:2px dashed #48a176!important;background:rgba(220,244,219,.14)!important}',
'.sian-wys-text:focus,.sian-wys-text.sian-wys-active{outline:3px solid #45a070!important;background:rgba(255,246,208,.96)!important;color:#212d26!important;box-shadow:0 5px 20px #0002;min-width:2ch}',
'.sian-wys-smallhelp{position:fixed;z-index:99999;bottom:18px;left:18px;background:#174b38;color:#fff;padding:9px 12px;border-radius:8px;font:600 12px system-ui;box-shadow:0 8px 26px #0005;pointer-events:none}',
'.sian-builder-edit-off .sian-wys-text{cursor:inherit!important;outline:none!important;background:transparent!important}',
'.sian-builder-edit-off .sian-wys-text:hover{outline:none!important;background:transparent!important}',
'.sian-wys-active::selection{background:#ecbc76;color:#17211b}'
].join('');
 doc.head.append(style);
 const lang=(doc.documentElement.dataset.lang||doc.documentElement.lang||'th').toLowerCase()==='en'?'En':'Th';
 function edit(el,ref,key,{max=600,focusField=true}={}){
  if(!el)return;
  el.classList.add('sian-wys-text');el.dataset.sianText=key;el.tabIndex=0;
  el.setAttribute('aria-label','Click to edit · '+key);
  el.addEventListener('click',e=>{
   if(!inEditMode()||e.target.closest('.sian-edit-spot'))return;
   e.stopPropagation();e.preventDefault();
   if(active===el)return;
   if(active)active.blur();
   chooseSection(ref,key,{skip:!focusField});
   active=el;
   const before=el.textContent;
   const startedAt=Date.now();
   el.contentEditable='true';el.spellcheck=true;el.classList.add('sian-wys-active');
   const help=doc.createElement('div');help.className='sian-wys-smallhelp';help.textContent='Type here · Enter saves · Esc cancels';doc.body.append(help);
   const cleaner=()=>{el.contentEditable='false';el.classList.remove('sian-wys-active');help.remove();active=null;el.removeEventListener('keydown',keys);el.removeEventListener('paste',paste);el.removeEventListener('blur',finish)};
   const finish=()=>{
    let next=el.innerText?.replace(/\r/g,'')??el.textContent;
    next=next.trim().replace(/\n{3,}/g,'\n\n').slice(0,max);
    cleaner();
    if(next===before.trim()){setStatus('No changes');return}
    if(!next){el.textContent=before;setStatus('Empty text not saved');return}
    if(apply(ref,key,next,true,before.trim()))setStatus('✓ Saved · '+(Date.now()-startedAt<30000?'live preview updated':'text saved'));
    else{el.textContent=before;setStatus('This text field could not be saved')}
   };
   const keys=e=>{
    if(e.key==='Escape'){e.preventDefault();el.textContent=before;cleaner();setStatus('Edit cancelled');return}
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();el.blur()}
   };
   const paste=e=>{e.preventDefault();const plain=e.clipboardData?.getData('text/plain')||'';doc.execCommand('insertText',false,plain.slice(0,max))};
   el.addEventListener('keydown',keys);el.addEventListener('paste',paste);
   el.addEventListener('blur',finish,{once:true});
   el.focus();
   const sel=doc.getSelection();if(sel){const range=doc.createRange();range.selectNodeContents(el);sel.removeAllRanges();sel.addRange(range)}
  });
  el.addEventListener('keydown',e=>{if(!inEditMode()||active===el)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}});
 }
 // Preserve the storefront's highlighted second-line element.
 const h1=doc.querySelector('.hero-copy h1');
 if(h1){
  const first=[...h1.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
  if(first){const span=doc.createElement('span');span.className='sian-wys-hero-line';span.textContent=first.textContent;first.replaceWith(span);edit(span,'hero','first'+lang,{max:180})}
  edit(h1.querySelector('em'),'hero','second'+lang,{max:180});
 }
 edit(doc.querySelector('.hero .eyebrow span:last-child'),'hero','eyebrow'+lang,{max:180});
 edit(doc.querySelector('.hero-lead'),'hero','lead'+lang,{max:1400});
 for(const [i,k] of [[0,'primary'],[1,'secondary']]){
  const a=doc.querySelectorAll('.hero-actions a')[i];if(!a)continue;
  const tn=[...a.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
  if(tn){const span=doc.createElement('span');span.textContent=tn.textContent.trim();span.className='sian-wys-button-word';tn.replaceWith(span);edit(span,'hero',k+lang,{max:100})}
 }
 for(const [root,h,p] of [
 ['#collection',' .section-head h2',' .section-head .muted'],
 ['#story',' .story-copy h2',' #shopStory'],
 ['#toy',' .kinetic-copy h2',' .kinetic-copy .muted'],
 ['#fidget',' h2',' .sian-spin-layout p'],
 ['#oracle',' .oracle-hub-top h2',' .oracle-hub-top .muted'],
 ['#newsletter',' .newsletter-layout h2',' .newsletter-layout p']
 ]){
  const section=doc.querySelector(root);if(!section)continue;
  const ref=root.slice(1);
  edit(section.querySelector(h.trim()),ref,'headline'+lang,{max:220});
  edit(section.querySelector(p.trim()),ref,'subtext'+lang,{max:1500});
 }
 for(const section of doc.querySelectorAll('.sian-extra[id^="section-"]')){
  const ref=section.id.slice(8);edit(section.querySelector('.sian-extra-inner h2'),ref,'title',{max:180});
  edit(section.querySelector('.sian-extra-inner p,.sian-extra-inner blockquote'),ref,'text',{max:2400});
 }
 const headerBrand=doc.querySelector('.header [data-brand]');edit(headerBrand,'identity','brand',{max:80});
 doc.querySelectorAll('.product-card').forEach(card=>{
  const id=card.dataset.productId;if(!id)return;
  const title=card.querySelector('.product-meta h3');
  edit(title,'product:'+id,'title',{max:100,focusField:false});
  card.addEventListener('click',event=>{
   if(!inEditMode()||event.target.closest('.sian-edit-spot')||event.target.closest('.sian-wys-text')||event.target.closest('button'))return;
   event.preventDefault();event.stopImmediatePropagation();
   const index=state.products.findIndex(p=>String(p.id)===id);
   window.showStep?.('products');
   const item=document.querySelectorAll('#productList .product-item')[index];
   if(item)item.click();
   setStatus('✎ Editing this amulet on the left');
  },true);
 });
 // Images use real file chooser in parent; exported site has no editor listeners.
 const image=doc.querySelector('.hero-image');
 image?.addEventListener('click',event=>{
  if(!inEditMode()||event.target.closest('.sian-edit-spot')||event.target.closest('.sian-hero-spinner'))return;
  event.preventDefault();event.stopPropagation();chooseSection('hero','imageUpload');
  const file=document.querySelector('#sianSectionEditor input[data-section-key="imageUpload"]');
  if(file)file.click();
  setStatus('📷 Select artwork or use the editor on the left');
 },true);
 doc.documentElement.classList.toggle('sian-builder-edit-off',!inEditMode());
}
frame.addEventListener('load',()=>setTimeout(install,160));
const toggle=document.querySelector('.sian-edit-toggle input');
toggle?.addEventListener('change',()=>{try{frame.contentDocument.documentElement.classList.toggle('sian-builder-edit-off',!toggle.checked)}catch{}});
if(frame.contentDocument?.readyState==='complete')setTimeout(install,160);
window.SianWYSIWYG={undo,redo,install,getSelected:()=>selectedSection};
})();