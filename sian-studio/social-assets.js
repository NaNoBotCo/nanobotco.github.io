/* Sian Studio social toolkit v1.3 — dealer-ready platform formats, dual-side photos and captions */
(function(){
'use strict';
const $=s=>document.querySelector(s);
const holder=$('#sianSocialFields');if(!holder)return;
holder.innerHTML='<div class="sian-form-grid"><label class="field"><span>Creative format</span><select id="socialFormat"><option value="1080x1350">Instagram / FB portrait · 1080 × 1350</option><option value="1080x1080">Square · 1080 × 1080</option><option value="1080x1920">Story / Reel cover · 1080 × 1920</option></select></label><label class="field"><span>Photo layout</span><select id="socialLayout"><option value="front">Front / ด้านหน้า</option><option value="both">Front + back / หน้า–หลัง</option><option value="back">Back / ด้านหลัง</option></select></label><label class="switch-row">Show price on image <input type="checkbox" id="socialPrice" checked></label><label class="switch-row">Show shop signature <input type="checkbox" id="socialBrand" checked></label></div><div class="row-buttons"><button class="btn" id="socialCopyEn">Copy English post</button><button class="btn" id="socialLine">Share to LINE ↗</button><button class="btn" id="socialFacebook">Share to Facebook ↗</button></div><div class="hint">Native image cards are saved to your phone or computer. TikTok/Instagram video posts use the actual seller video URL or footage; no fake platform publishing is performed.</div>';
const controls={format:$('#socialFormat'),layout:$('#socialLayout'),price:$('#socialPrice'),brand:$('#socialBrand')};
const text=(v,max=500)=>String(v??'').slice(0,max);
const copy=v=>{if(navigator.clipboard?.writeText)navigator.clipboard.writeText(v).then(()=>notice('✓ Copied post')).catch(()=>prompt('Copy',v));else prompt('Copy',v)};
const url=()=>window.SianStudio?.productUrl()||'';
const product=()=>state.products[selected]||null;
function captionEn(p){
 if(!p)return '';
 return p.captionEn||[p.english||p.title,p.edition,p.temple,p.material,p.condition,p.description,'Price: THB '+Number(p.price||0).toLocaleString('en-US'),'Ask via LINE: '+(state.config.lineId||''),p.hashtags,url()||'(URL available after publication)'].filter(Boolean).join('\n');
}
$('#socialCopyEn').onclick=()=>copy(captionEn(product()));
const share=(platform)=>{const link=url();if(!link){notice('First configure the actual shop HTTPS URL on the Publish step.');showStep('publish');return}
 const target=platform==='line'?'https://social-plugins.line.me/lineit/share?url='+encodeURIComponent(link):'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(link);
 window.open(target,'_blank','noopener')};
$('#socialLine').onclick=()=>share('line');$('#socialFacebook').onclick=()=>share('facebook');
const socialBtn=$('#sianDownloadShare');
const fitText=(ctx,str,maxWidth,size,x,y,maxLines=2)=>{
 const words=Array.from(text(str,150));let line='',count=0;
 ctx.font='700 '+size+'px sans-serif';ctx.fillStyle='#1d2d27';
 for(const word of words){if(ctx.measureText(line+word).width>maxWidth&&line){ctx.fillText(line,x,y+count*size*1.32);count++;line='';if(count===maxLines-1)break}else line+=word}
 if(line)ctx.fillText(line,x,y+count*size*1.32);
};
async function imageFrom(src){
 if(!src)return null;
 const img=new Image();if(src.startsWith('https:'))img.crossOrigin='anonymous';
 img.src=src;try{await img.decode();return img}catch{return null}
}
function drawPhoto(ctx,img,x,y,w,h){
 ctx.fillStyle='#e8e2d6';ctx.fillRect(x,y,w,h);
 if(img){const r=Math.min(w/img.naturalWidth,h/img.naturalHeight);const dw=img.naturalWidth*r,dh=img.naturalHeight*r;ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh)}
 else{ctx.fillStyle='#a5a192';ctx.font='24px sans-serif';ctx.fillText('AMULET PHOTO',x+Math.max(10,w/2-105),y+h/2)}
}
async function download(){
 const p=product();if(!p)return;
 const [w,h]=controls.format.value.split('x').map(Number),both=controls.layout.value==='both';
 const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');
 const d=state.design||{},bg=d.background||'#f5f0e7',nav=d.nav||'#1b2926',accent=d.accent||'#c6a16d';
 ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);ctx.fillStyle=nav;ctx.fillRect(0,0,w,150);
 if(controls.brand.checked){ctx.fillStyle='#f4d6a3';ctx.font='bold 34px sans-serif';ctx.fillText(text(state.config.brand||'SIAN STUDIO',42),42,92,w-85)}
 const reserved=h>1500?450:320,top=180,photoH=h-reserved-100;
 const front=await imageFrom(p.imagePath||(!p.demo?p.referenceImage:'')),back=await imageFrom(p.backImagePath);
 if(both){drawPhoto(ctx,front,38,top,(w-94)/2,photoH);drawPhoto(ctx,back,w/2+9,top,(w-94)/2,photoH)}
 else drawPhoto(ctx,controls.layout.value==='back'?back:front,38,top,w-76,photoH);
 const labelY=top+photoH+73;
 fitText(ctx,p.title||p.english||'Amulet',w-90,h>1500?46:42,45,labelY,2);
 ctx.font='26px sans-serif';ctx.fillStyle='#5d645b';ctx.fillText(text(p.temple||p.edition,65),45,labelY+105,w-95);
 if(controls.price.checked){ctx.font='bold 47px sans-serif';ctx.fillStyle=accent;ctx.fillText('฿'+Number(p.price||0).toLocaleString('th-TH'),45,h-92)}
 ctx.font='22px sans-serif';ctx.fillStyle='#71776e';ctx.fillText('ID '+p.id,45,h-35);
 try{const blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob)throw Error('export unavailable');const href=URL.createObjectURL(blob),a=document.createElement('a');a.href=href;a.download=(window.SianStudio?.productSlug(p)||p.id)+'-'+controls.format.value+'-'+controls.layout.value+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(href),3000);notice('✓ Social creative saved')}
 catch(e){notice('Image export unavailable. Use your own uploaded front/back photos, not a cross-origin reference photo.')}
}
if(socialBtn){socialBtn.onclick=download;socialBtn.textContent='↓ Download selected creative'}
})();