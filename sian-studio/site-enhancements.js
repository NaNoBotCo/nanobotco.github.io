/* Sian Studio shared storefront enhancements v1.3. Vanilla JS, no dependencies. */
(function(){
"use strict";
const style=document.createElement('style');
style.textContent=[
 '#collection.sian-card-overridden .product-card{background:var(--sian-card-custom)!important}',
 '#newsletter.sian-card-overridden .newsletter-form{background:var(--sian-card-custom)!important}',
 '#oracle.sian-card-overridden .oracle-welcome-card{background:var(--sian-card-custom)!important}'
].join('');
document.head.append(style);
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
   if(/^#[a-f0-9]{6}$/i.test(st.headingColor||''))title.style.color=st.headingColor;
   if(Number.isFinite(+st.headingSize)&&+st.headingSize>=22&&+st.headingSize<=84)title.style.fontSize=st.headingSize+'px';
   if(st.decoration==='lines')s.style.backgroundImage='repeating-linear-gradient(135deg,transparent 0 27px,rgba(123,98,58,.055) 28px 29px)';
   if(st.decoration==='dots'){s.style.backgroundImage='radial-gradient(circle,rgba(111,91,61,.10) 1px,transparent 1.5px)';s.style.backgroundSize='23px 23px'}
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
   if(builtins[x.type]&&!used.has(x.type)){
    const node=builtins[x.type],st=x.style||{};
    main.append(node);used.add(x.type);
    if(st._colorBg&&/^#[a-f0-9]{6}$/i.test(st.bg||''))node.style.setProperty('background-color',st.bg,'important');
    if(st._colorText&&/^#[a-f0-9]{6}$/i.test(st.text||'')){
      node.style.setProperty('color',st.text,'important');
      node.querySelectorAll('h1,h2,h3,p,small,.eyebrow,.muted').forEach(el=>el.style.setProperty('color',st.text,'important'));
    }
    if(st._customPadding&&st.padding!==undefined){const px=Math.max(24,Math.min(140,+st.padding||68));node.style.paddingTop=px+'px';node.style.paddingBottom=px+'px'}
    if(st._customAlign&&['left','center','right'].includes(st.align))node.style.textAlign=st.align;
    const head=node.querySelector(x.type==='hero'?'.hero-copy h1':x.type==='collection'?'.section-head h2':x.type==='story'?'.story-copy h2':x.type==='toy'?'.kinetic-copy h2':x.type==='fidget'?'h2':x.type==='oracle'?'.oracle-hub-top h2':'h2');
    const sub=node.querySelector(x.type==='hero'?'.hero-lead':x.type==='collection'?'.section-head .muted':x.type==='story'?'#shopStory':x.type==='toy'?'.kinetic-copy .muted':x.type==='fidget'?'p':x.type==='oracle'?'.oracle-hub-top .muted':'p');
    
    if(st._customWidth&&Number.isFinite(+st.width)&&+st.width>=540&&+st.width<=1600){
     const content=node.classList.contains('outer')?node:node.querySelector('.outer');
     if(content)content.style.setProperty('max-width',st.width+'px','important');
    }
    if(st._customCard&&/^#[a-f0-9]{6}$/i.test(st.card||'')){
     node.style.setProperty('--sian-card-custom',st.card);
     node.classList.add('sian-card-overridden');
    }
    // Component-level styling: optional and isolated to the chosen section.
    if(/^#[a-f0-9]{6}$/i.test(st.headingColor||'')&&head){
     head.style.setProperty('color',st.headingColor,'important');
     head.querySelectorAll('em').forEach(em=>em.style.setProperty('color',st.headingColor,'important'));
    }
    if(st._colorText&&/^#[a-f0-9]{6}$/i.test(st.text||'')&&sub)sub.style.setProperty('color',st.text,'important');
    if(Number.isFinite(+st.headingSize)&&+st.headingSize>=22&&+st.headingSize<=84&&head)head.style.setProperty('font-size',st.headingSize+'px','important');
    if(st._customButtonRadius&&Number.isFinite(+st.buttonRadius)&&+st.buttonRadius>=0&&+st.buttonRadius<=40){
     node.querySelectorAll('.btn,button:not(.sian-edit-spot)').forEach(b=>b.style.setProperty('border-radius',st.buttonRadius+'px','important'));
    }
    if(st._customRadius&&Number.isFinite(+st.radius)&&+st.radius>=0&&+st.radius<=50)node.querySelectorAll('.hero-image,.product-card').forEach(el=>el.style.setProperty('border-radius',st.radius+'px','important'));
    if(st.decoration==='lines')node.style.backgroundImage='repeating-linear-gradient(135deg,transparent 0 27px,rgba(123,98,58,.055) 28px 29px)';
    if(st.decoration==='dots'){node.style.backgroundImage='radial-gradient(circle,rgba(111,91,61,.10) 1px,transparent 1.5px)';node.style.backgroundSize='23px 23px'}
const applyCopy=()=>{
     const en=(document.documentElement.dataset.lang||document.documentElement.lang)==='en';
     if(x.type==='hero'&&x.hero){
      const h=x.hero,choose=(th,enKey,fallback)=>text(h[en?enKey:th]??fallback,1500);
      const eyebrow=node.querySelector('.eyebrow span:last-child');
      if(eyebrow)eyebrow.textContent=choose('eyebrowTh','eyebrowEn','');
      if(head){
       const first=choose('firstTh','firstEn','');
       const second=choose('secondTh','secondEn','');
       head.replaceChildren(document.createTextNode(first));
       if(second){const br=document.createElement('br'),em=document.createElement('em');em.textContent=second;head.append(br,em)}
      }
      if(sub)sub.textContent=choose('leadTh','leadEn','');
      const buttons=[...node.querySelectorAll('.hero-actions a')];
      const href=(value,alt)=>/^#[a-zA-Z0-9_-]{2,80}$/.test(value||'')||Boolean(safeUrl(value))?value:alt;
      for(const [i,th,enKey,urlKey,fallback] of [[0,'primaryTh','primaryEn','primaryHref','#collection'],[1,'secondaryTh','secondaryEn','secondaryHref','#oracle']]){
       const btn=buttons[i];if(!btn)continue;
       const label=choose(th,enKey,i===0?'ชมพระเครื่อง':'ลองเสี่ยงทาย');
       btn.replaceChildren(document.createTextNode(label+' '));const arrow=document.createElement('span');arrow.textContent='↗';btn.append(arrow);
       btn.href=href(h[urlKey],fallback);
      }
      const picture=node.querySelector('.hero-image');
      if(picture){
       const url=String(h.image||'');
       const usable=/^data:image\/(jpeg|png|webp);base64,/.test(url)||Boolean(safeUrl(url));
       picture.classList.toggle('sian-has-hero-art',usable);
       let im=picture.querySelector('.sian-custom-hero-art');
       if(usable){if(!im){im=document.createElement('img');im.className='sian-custom-hero-art';picture.append(im)}im.src=url;im.alt=text(h.imageAlt||'Seller supplied shop hero image',300);im.style.objectFit=h.imageFit==='contain'?'contain':'cover'}
       else if(im)im.remove();
      }
     }else{
      const copy=x.copy||{};
      const title=copy[en?'headlineEn':'headlineTh']||x.headline;
      const detail=copy[en?'subtextEn':'subtextTh']||x.subtext;
      if(title&&head)head.textContent=text(title,220);
      if(detail&&sub)sub.textContent=text(detail,1600);
     }
    };
    applyCopy();
    for(const btn of document.querySelectorAll('#langTh,#langEn'))btn.addEventListener('click',()=>setTimeout(applyCopy,30));
   }
   else if(['text','quote','faq','image','video','cta'].includes(x.type))main.append(custom(x));
  }
  for(const [key,node] of Object.entries(builtins))if(node&&!used.has(key))node.remove();
 }
}

const themeHero=document.createElement('style');
themeHero.textContent='.hero-image.sian-has-hero-art>:not(.sian-custom-hero-art):not(.sian-edit-spot){display:none!important}.hero-image .sian-custom-hero-art{display:block;width:100%;height:100%;object-position:center center;position:absolute;inset:0;z-index:4}';
document.head.append(themeHero);
const hs=document.createElement('style');hs.textContent='.sian-hero-spinner{position:absolute;right:1%;top:30%;width:clamp(160px,24vw,340px);height:clamp(160px,24vw,340px);border:0;background:none;border-radius:50%;padding:4px;cursor:grab;z-index:1;transition:transform 4s cubic-bezier(.1,.4,.13,1);pointer-events:auto}.sian-hero-spinner svg{width:100%;height:100%;filter:drop-shadow(0 2px 15px #9b743d)}.sian-hero-spinner:focus-visible{outline:3px solid #c6a16d}@media(max-width:760px){.sian-hero-spinner{right:0;top:12%;width:135px;height:135px;opacity:.14!important}}@media(prefers-reduced-motion:reduce){.sian-hero-spinner{transition:none!important}}';document.head.append(hs);
const hero=document.querySelector('main .hero');
if(hero&&cfg.visual?.heroSpinner!==false){
 const dot=document.createElement('button');dot.type='button';dot.className='sian-hero-spinner';dot.title='Tap to spin · หมุนเล่น';
 dot.setAttribute('aria-label','Spin background fidget spinner');
 dot.innerHTML='<svg viewBox="0 0 120 120" aria-hidden="true"><g stroke="#c29c64" stroke-width="5" fill="none"><circle cx="60" cy="60" r="13"/><path d="M60 47V24M71 66L93 79M49 66L27 79"/><circle cx="60" cy="19" r="17"/><circle cx="98" cy="85" r="17"/><circle cx="22" cy="85" r="17"/></g></svg>';
 const copy=hero.querySelector('.hero-copy');hero.style.position='relative';hero.append(dot);
 let rotation=0;dot.addEventListener('click',()=>{rotation+=720+Math.round(Math.random()*720);dot.style.transform='rotate('+rotation+'deg)'});
 dot.style.opacity=String(Math.max(.12,Math.min(.6,Number(cfg.visual?.heroSpinnerOpacity)||.24)));
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