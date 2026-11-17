/* Sian Studio shared storefront enhancements v1.3. Vanilla JS, no dependencies. */
(function(){
"use strict";
const data=document.getElementById('sianBuilderSiteConfig');
let cfg={};
try{cfg=data?JSON.parse(data.textContent):{}}catch(e){console.warn('Section configuration is invalid',e)}
const safeUrl=(v)=>{try{const u=new URL(v);return u.protocol==='https:'?u:null}catch{return null}};
const text=(v,max=1500)=>String(v??'').slice(0,max);
const sections=Array.isArray(cfg.sections)?cfg.sections:null;
if(sections){
 const main=document.querySelector('main');
 if(main){
  const builtins={hero:main.querySelector('.hero'),collection:main.querySelector('#collection'),story:main.querySelector('#story'),toy:main.querySelector('#toy'),fidget:main.querySelector('#fidget'),oracle:main.querySelector('#oracle'),newsletter:main.querySelector('#newsletter')};
  const used=new Set();
  function custom(x){
   const s=document.createElement('section');s.className='sian-extra';
   s.id='section-'+text(x.id,60).replace(/[^a-zA-Z0-9_-]/g,'');
   const st=x.style||{};
   for(const [prop,value] of [['--sian-block-bg',st.bg],['--sian-block-text',st.text],['--sian-block-card',st.card]]){
    if(/^#[a-f0-9]{6}$/i.test(value||''))s.style.setProperty(prop,value);
   }
   s.style.setProperty('--sian-block-padding',Math.min(140,Math.max(24,+st.padding||68))+'px');
   s.style.setProperty('--sian-block-width',Math.min(1400,Math.max(550,+st.width||1080))+'px');
   s.style.setProperty('--sian-block-radius',Math.min(40,Math.max(0,+st.radius||12))+'px');
   s.style.setProperty('--sian-block-align',['center','right'].includes(st.align)?st.align:'left');
   const wrap=document.createElement('div');wrap.className='sian-extra-inner';
   const title=document.createElement('h2');title.textContent=text(x.title,160);wrap.append(title);
   if(x.type==='quote'){const quote=document.createElement('blockquote');quote.textContent=text(x.text,1500);wrap.append(quote)}
   else if(x.type==='faq'){
    text(x.text,3000).split('\n').filter(Boolean).forEach(line=>{
     const parts=line.split('|'),details=document.createElement('details'),summary=document.createElement('summary'),p=document.createElement('p');
     summary.textContent=text(parts[0],150);p.textContent=text(parts.slice(1).join('|'),600);
     details.append(summary,p);wrap.append(details);
    });
   }else{
    if(x.type==='image'&&x.image){
     const u=safeUrl(x.image);
     if(u||String(x.image).startsWith('data:image/')){const img=document.createElement('img');img.src=u?u.href:x.image;img.alt=text(x.imageAlt||x.title,180);wrap.append(img)}
    }
    if(x.type==='video'&&safeUrl(x.videoUrl)){const a=document.createElement('a');a.href=safeUrl(x.videoUrl).href;a.target='_blank';a.rel='noopener';a.textContent='▶ '+text(x.linkText||'Watch video / ชมวิดีโอ',90);wrap.append(a)}
    if(x.text){const p=document.createElement('p');p.textContent=text(x.text,3000);wrap.append(p)}
    if(safeUrl(x.url)){const a=document.createElement('a');a.href=safeUrl(x.url).href;a.target='_blank';a.rel='noopener';a.textContent=text(x.linkText||'รายละเอียดเพิ่มเติม ↗',90);wrap.append(a)}
   }
   s.append(wrap);return s;
  }
  for(const x of sections){
   if(!x||x.enabled===false)continue;
   if(builtins[x.type]&&!used.has(x.type)){main.append(builtins[x.type]);used.add(x.type)}
   else if(['text','quote','faq','image','video','cta'].includes(x.type))main.append(custom(x));
  }
  for(const [key,node] of Object.entries(builtins))if(node&&!used.has(key))node.remove();
 }
}
const c=document.getElementById('sianSpinner'),start=document.getElementById('spinnerStart'),brake=document.getElementById('spinnerStop'),arms=document.getElementById('spinnerArms'),drag=document.getElementById('spinnerDrag'),read=document.getElementById('spinnerReadout');
if(!c||!start||!brake||!arms||!drag)return;
const ctx=c.getContext('2d');if(!ctx)return;
let angle=0,velocity=0,grab=false,lastPointerAngle=0,lastPointerTime=0,lastFrameTime=0;
const tau=Math.PI*2;
const pointAngle=e=>{const r=c.getBoundingClientRect();return Math.atan2((e.clientY-r.top)*480/r.height-240,(e.clientX-r.left)*480/r.width-240)};
function draw(){
 ctx.clearRect(0,0,480,480);ctx.save();ctx.translate(240,240);
 for(let i=0;i<72;i++){const a=i*tau/72;ctx.beginPath();ctx.arc(0,0,200,a,a+tau/72+.01);ctx.lineWidth=i%6?1:4;ctx.strokeStyle=i%6?'#a0b0a012':'#e4b57a77';ctx.stroke()}
 ctx.rotate(angle);ctx.shadowColor='#050a0c90';ctx.shadowBlur=16;ctx.shadowOffsetY=9;
 for(let k=0;k<+arms.value;k++){
  ctx.save();ctx.rotate(k*tau/+arms.value);ctx.beginPath();ctx.roundRect(-34,-142,68,174,24);
  ctx.fillStyle='#c8aa77';ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#2a403c';ctx.beginPath();ctx.arc(0,-116,25,0,tau);ctx.fill();
  ctx.strokeStyle='#efe2bb';ctx.lineWidth=5;ctx.stroke();ctx.beginPath();ctx.arc(0,-116,10,0,tau);ctx.fillStyle='#cfad72';ctx.fill();ctx.restore();
 }
 ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.beginPath();ctx.arc(0,0,44,0,tau);ctx.fillStyle='#a69a77';ctx.fill();ctx.lineWidth=10;ctx.strokeStyle='#584d39';ctx.stroke();ctx.beginPath();ctx.arc(0,0,16,0,tau);ctx.fillStyle='#172c29';ctx.fill();ctx.restore();
}
function frame(now){
 if(lastFrameTime){
  const dt=Math.min(.06,(now-lastFrameTime)/1000);
  if(!grab){angle+=velocity*dt;velocity*=Math.exp(-(.23+.07*Number(drag.value))*dt);if(Math.abs(velocity)<.03)velocity=0}
 }
 lastFrameTime=now;draw();read.textContent=(velocity*60/tau).toFixed(1)+' RPM · '+arms.value+' arms';requestAnimationFrame(frame);
}
c.addEventListener('pointerdown',e=>{grab=true;lastPointerAngle=pointAngle(e);lastPointerTime=performance.now();c.setPointerCapture(e.pointerId)});
c.addEventListener('pointermove',e=>{
 if(!grab)return;
 const now=performance.now(),a=pointAngle(e);let d=a-lastPointerAngle;
 while(d>Math.PI)d-=tau;while(d< -Math.PI)d+=tau;
 angle+=d;const dt=Math.max(.016,(now-lastPointerTime)/1000);
 velocity=Math.max(-35,Math.min(35,d/dt));lastPointerAngle=a;lastPointerTime=now;
});
c.addEventListener('pointerup',()=>{grab=false});
c.addEventListener('pointercancel',()=>{grab=false});
start.addEventListener('click',()=>{velocity=Math.min(34,Math.max(18,Math.abs(velocity)+9))});
brake.addEventListener('click',()=>{velocity=0});
c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();start.click()}});
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){draw();read.textContent='Reduced motion enabled · Press Spin for manual rotation';return}
requestAnimationFrame(frame);
})();