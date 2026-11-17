/* Sian Studio v1.7 contrast repair: runs after site-enhancements in preview and exports. */
(function(){
'use strict';
const config=document.getElementById('sianBuilderSiteConfig');
if(!config)return;
let sections=[];
try{sections=JSON.parse(config.textContent||'{}').sections||[]}catch{return}
const valid=v=>/^#[0-9a-f]{6}$/i.test(String(v||''));
function luminance(hex){
 const rgb=hex.substring(1).match(/../g).map(v=>parseInt(v,16)/255);
 const a=rgb.map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));
 return .2126*a[0]+.7152*a[1]+.0722*a[2];
}
const ratio=(a,b)=>{const v=luminance(a),w=luminance(b);return (Math.max(v,w)+.05)/(Math.min(v,w)+.05)};
const readable=(bg,wish)=>{
 if(valid(wish)&&ratio(bg,wish)>=4.5)return wish;
 return ratio(bg,'#14221E')>=ratio(bg,'#FFFFFF')?'#14221E':'#FFFFFF';
};
const selector={
 hero:'.hero-copy h1,.hero-copy h1 em,.hero-copy .eyebrow,.hero-copy .hero-lead,.hero-under,.hero-under strong',
 collection:'.section-head h2,.section-head .muted,.collection-count,.collection-count b,.collection-count small,.catalogue-tail,.catalogue-tail a',
 story:'.story-copy h2,.story-copy h2 em,.story-copy p,.story-copy .text-link',
 toy:'.kinetic-copy h2,.kinetic-copy h2 em,.kinetic-copy .overline,.kinetic-copy .muted,.kinetic-copy p,.toy-metadata span,.toy-metadata b,.toy-equation,.toy-stage figcaption',
 fidget:'.sian-spin-layout h2,.sian-spin-layout h2 em,.sian-spin-layout p,.sian-spin-controls label,.sian-spin-readout',
 oracle:'.oracle-hub-top h2,.oracle-hub-top .muted,.oracle-hub-top p',
 newsletter:'.newsletter-layout h2,.newsletter-layout h2 em,.newsletter-layout>div:first-child p,.newsletter-section .overline'
};
const roots={hero:'.hero',collection:'#collection',story:'#story',toy:'#toy',fidget:'#fidget',oracle:'#oracle',newsletter:'#newsletter'};
function repair(section){
 if(section.enabled===false)return;
 const rootSelector=roots[section.type],root=rootSelector&&document.querySelector(rootSelector);
 if(!root)return;
 const st=section.style||{},solid=Boolean(st._colorBg&&valid(st.bg));
 // Background-image assignment from the old ornament implementation is removed.
 // When the owner chose a section color it must actually become the visible background.
 root.style.removeProperty('background-image');
 root.style.removeProperty('background-size');
 if(solid)root.style.setProperty('background',st.bg,'important');
 const underlying=solid?'none':getComputedStyle(root).backgroundImage;
 if(st.decoration==='dots'||st.decoration==='lines'){
  const darkInk=solid?ratio(st.bg,'#14221E')>=ratio(st.bg,'#FFFFFF'):false;
  const rgb=darkInk?'0,0,0':'255,255,255';
  const pattern=st.decoration==='dots'?
   'radial-gradient(circle,rgba('+rgb+',.035) .7px,transparent 1.5px)':
   'repeating-linear-gradient(135deg,transparent 0 27px,rgba('+rgb+',.035) 28px 29px)';
  root.style.setProperty('background-image',pattern+(underlying&&underlying!=='none'?','+underlying:''),'important');
  if(st.decoration==='dots'&&(!underlying||underlying==='none'))root.style.setProperty('background-size','24px 24px','important');
 }
 if(!solid)return;
 const foreground=readable(st.bg,st.text||'#292c27');
 const heading=readable(st.bg,st.headingColor||foreground);
 root.style.setProperty('color',foreground,'important');
 const targets=root.querySelectorAll(selector[section.type]||'');
 targets.forEach(el=>el.style.setProperty('color',foreground,'important'));
 const h=section.type==='hero'?'.hero-copy h1':section.type==='toy'?'.kinetic-copy h2':section.type==='fidget'?'.sian-spin-layout h2':section.type==='story'?'.story-copy h2':section.type==='oracle'?'.oracle-hub-top h2':section.type==='newsletter'?'.newsletter-layout h2':'.section-head h2';
 const headingEl=root.querySelector(h);
 if(headingEl){
  headingEl.style.setProperty('color',heading,'important');
  headingEl.querySelectorAll('em').forEach(el=>el.style.setProperty('color',heading,'important'));
 }
 // Interactive containers on a newly light section should not keep pale-on-light labels.
 if(section.type==='toy'){
  root.querySelectorAll('.toy-metadata span,.toy-metadata b,.toy-equation,.toy-stage figcaption,.toy-metadata').forEach(el=>el.style.setProperty('color',foreground,'important'));
  root.querySelectorAll('.toy-metadata span').forEach(el=>el.style.setProperty('border-color',foreground,'important'));
 }
 if(section.type==='fidget'){
  root.querySelectorAll('.sian-spin-controls label,.sian-spin-readout').forEach(el=>el.style.setProperty('color',foreground,'important'));
 }
 // Allow the owner to pick a theme but never silently publish their requested low-contrast color.
 root.dataset.sianContrastRepaired=(foreground!==st.text||heading!==st.headingColor)?'true':'false';
}
sections.forEach(repair);
})();