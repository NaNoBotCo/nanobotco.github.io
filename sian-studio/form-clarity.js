/* Sian Studio v1.7 — inline form validation and clearer merchant onboarding. */
(function(){
'use strict';
const $=s=>document.querySelector(s);
const css=document.createElement('style');
css.textContent=[
 '.sian-field-message{display:block;font:600 11px/1.45 system-ui;color:#476554;margin:5px 0 2px}',
 '.sian-field-message.error{color:#ae302a}',
 '.sian-character-count{display:block;text-align:right;font:500 10px/1.3 system-ui;color:#5d6d60;margin-top:3px}',
 '.editor input[aria-invalid="true"],.editor textarea[aria-invalid="true"]{border-color:#b4322e!important;outline-color:#b4322e!important}',
 '.sian-required-legend{font-size:12px;background:#eaf4ec;padding:10px 12px;border-left:3px solid #396b4b;margin:9px 0 14px;color:#2c5541}',
 '.sian-field-status{padding:9px 12px;border:1px solid #cbdbcb;border-radius:7px;color:#405c49;font-size:12px;background:#f7fbf6;margin:11px 0}',
 '.sian-field-status.error{border-color:#d49a94;background:#fff4f1;color:#9b3d31}'
].join('');
document.head.append(css);
function urlOk(value){
 try{if(!value)return true;const u=new URL(value);return u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password}catch{return false}
}
function status(input,message){
 if(!input)return;
 const parent=input.closest('.field')||input.parentElement;
 let hint=parent?.querySelector('.sian-field-message[data-for="'+input.id+'"]');
 if(!hint&&parent){hint=document.createElement('small');hint.className='sian-field-message';hint.dataset.for=input.id;parent.append(hint)}
 if(hint){hint.textContent=message||'';hint.className='sian-field-message'+(message?' error':'')}
 input.setAttribute('aria-invalid',String(Boolean(message)));
}
function validate(){
 const line=$('#lineId');
 if(line){const v=line.value.trim();status(line,!v?'A valid LINE ID is needed before publishing':/^@?[a-zA-Z0-9_.-]{3,60}$/.test(v)?'':'Use 3–60 letters/numbers/dots/underscores/hyphens; @ is optional.')}
 for(const [id,message] of [
 ['sianSiteUrl','Enter a full HTTPS shop address, e.g. https://shop.example/'],
 ['sianCheckoutUrl','Enter a verified HTTPS payment-provider address.']
 ]){const inp=$('#'+id);if(inp)status(inp,inp.value.trim()&&!urlOk(inp.value.trim())?message:'')}
 const mail=$('#sianBillingEmail');if(mail)status(mail,mail.value&&!mail.validity.valid?'Enter a valid contact email or leave empty.':'');
 const price=$('#pPrice');
 if(price&&price.closest('#itemEditor')&&!price.closest('#itemEditor').hidden){
  status(price,price.value!==''&&(!Number.isFinite(Number(price.value))||Number(price.value)<0)?'Price must be zero or a positive amount in THB.':'');
 }
 for(const input of document.querySelectorAll('#sianSectionEditor input[type=url],#sianVideoFields input[type=url]')){
  status(input,input.value.trim()&&!urlOk(input.value.trim())?'Use a complete https:// URL.':'');
 }
}
function counter(input){
 if(!(input instanceof HTMLInputElement||input instanceof HTMLTextAreaElement)||input.maxLength<=0)return;
 const parent=input.closest('label')||input.parentElement;if(!parent)return;
 let el=parent.querySelector('.sian-character-count');
 if(!el){el=document.createElement('small');el.className='sian-character-count';parent.append(el)}
 el.textContent=input.value.length+' / '+input.maxLength;
}
document.addEventListener('focusin',e=>counter(e.target),true);
document.addEventListener('input',e=>{counter(e.target);validate()},true);
document.addEventListener('change',validate,true);
function addGuidance(){
 const products=$('#pane-products'),editor=$('#itemEditor');
 if(products&&!products.querySelector('.sian-required-legend')){
  const p=document.createElement('p');p.className='sian-required-legend';p.textContent='Before a real listing goes public: add an amulet name and original front photo. Review price, provenance, back photo, and descriptions before sharing.';
  products.querySelector('#productList')?.before(p);
 }
 if(editor&&!editor.querySelector('#sianItemReadiness')){
  const p=document.createElement('div');p.className='sian-field-status';p.id='sianItemReadiness';p.setAttribute('role','status');editor.querySelector('#itemHeading')?.after(p);
 }
 const features=$('#pane-features');
 if(features&&!features.querySelector('.sian-required-legend')){
  const p=document.createElement('p');p.className='sian-required-legend';p.textContent='Features enables the interactive tools. Page Sections decides whether their sections appear and where.';
  features.querySelector('h2')?.after(p);
 }
 const publish=$('#pane-publish');
 if(publish&&!publish.querySelector('.sian-required-legend')){
  const p=document.createElement('p');p.className='sian-required-legend';p.textContent='Save Project downloads a private editable JSON backup. ZIP Website downloads public hosting files. Neither publishes automatically.';
  publish.querySelector('h2')?.after(p);
 }
}
function itemReadiness(){
 const box=$('#sianItemReadiness');if(!box)return;
 const input=$('#pTitle'),img=$('#pPreview'),problem=[];
 if(!input?.value.trim())problem.push('item name');
 if(!img?.getAttribute('src')||img.getAttribute('src').length<10)problem.push('front photo');
 box.classList.toggle('error',problem.length>0);
 box.textContent=problem.length?'Draft listing · Still needed: '+problem.join(', '):'✓ Item has a name and front image. Review its remaining fields before publishing.';
}
function setup(){
 addGuidance();validate();itemReadiness();
 const panel=$('#pane-products');
 panel?.addEventListener('input',itemReadiness,true);
 panel?.addEventListener('change',itemReadiness,true);
 panel?.addEventListener('click',()=>setTimeout(itemReadiness,90),true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
window.SianFormQA={validate,urlOk,itemReadiness};
})();