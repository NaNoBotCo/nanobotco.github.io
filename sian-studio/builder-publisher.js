/* Sian Studio publisher v1.3: offline ZIP export containing crawlable product pages, real images and sitemap */
(function(){
'use strict';
const $=s=>document.querySelector(s);
const enc=new TextEncoder();
const escaped=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const clean=s=>String(s??'').trim().slice(0,250);
const safeJSON=j=>JSON.stringify(j).replace(/</g,'\\u003c');
const domain=()=>{try{const u=new URL(state.config.siteUrl);return u.protocol==='https:'?u.href.replace(/\/+$/,''):''}catch{return ''}};
const photoAlt=(p,back=false)=>clean(back?p.backAlt||[p.title,p.edition,p.material,'ด้านหลัง พระเครื่อง'].filter(Boolean).join(' '):p.frontAlt||[p.title,p.edition,p.temple,p.material,'ด้านหน้า พระเครื่อง'].filter(Boolean).join(' '));
const publicItems=()=>state.products.filter(p=>!p.demo&&!p.deleted&&p.title?.trim());
const fileSlug=p=>window.SianStudio?.productSlug(p)||String(p.id).replace(/[^a-z0-9_-]/gi,'');
function bytesFromDataUrl(src){
 if(typeof src!=='string'||!src.startsWith('data:image/'))return null;
 const m=src.match(/^data:image\/(?:jpeg|png|webp);base64,(.+)$/s);if(!m)return null;
 const str=atob(m[1]),a=new Uint8Array(str.length);for(let i=0;i<str.length;i++)a[i]=str.charCodeAt(i);return a;
}
function mediaPrepare(items){
 const files=[],products=[];
 for(const p of items){
  const item={...p};
  for(const [key,side] of [['imagePath','front'],['backImagePath','back']]){
   const data=bytesFromDataUrl(p[key]);
   if(data){const name='media/'+fileSlug(p)+'-'+side+'.jpg';files.push({name,bytes:data});item[key]=name}
   else if(String(p[key]||'').startsWith('data:'))item[key]='';
   else item[key]=/^https:\/\//.test(String(p[key]||''))?p[key]:'';
  }
  products.push(item);
 }
 return {files,products};
}
function oneItemPage(p,base){
 const id=fileSlug(p),canonical=base+'/items/'+id+'.html',shop=clean(state.config.brand||'Amulet shop'),title=clean(p.title),description=clean(p.description||[p.temple,p.edition,p.material,p.condition].filter(Boolean).join(' · '));
 const primary=p.imagePath?(p.imagePath.startsWith('https:')?p.imagePath:base+'/'+p.imagePath):'',secondary=p.backImagePath?(p.backImagePath.startsWith('https:')?p.backImagePath:base+'/'+p.backImagePath):'';
 const asset=path=>path?(path.startsWith('https:')?path:'../'+path):'';
 const images=[primary,secondary].filter(Boolean),hasBase=base!=='';
 const offer=Number(p.price)>0?{offers:{'@type':'Offer',priceCurrency:'THB',price:Number(p.price),availability:p.status==='sold'?'https://schema.org/SoldOut':p.status==='reserved'?'https://schema.org/OutOfStock':'https://schema.org/InStock',url:canonical,seller:{'@type':'Organization',name:shop}}}:{};
 const product={'@context':'https://schema.org','@type':'Product',name:title,sku:clean(p.sku||p.id),image:images,description,material:clean(p.material),category:clean(p.category),url:canonical,...offer};
 const ld=hasBase?'<script type="application/ld+json">'+safeJSON(product)+'</'+'script>':'';
 const head=hasBase?'<link rel="canonical" href="'+escaped(canonical)+'"><meta property="og:url" content="'+escaped(canonical)+'"><meta property="og:type" content="product"><meta property="og:title" content="'+escaped(title)+'"><meta property="og:description" content="'+escaped(description)+'"><meta name="twitter:card" content="summary_large_image">':'<meta name="robots" content="noindex,nofollow">';
 const og=primary?'<meta property="og:image" content="'+escaped(primary)+'">':'';
 const front=p.imagePath?'<figure><img loading="eager" width="1000" alt="'+escaped(photoAlt(p))+'" src="'+escaped(asset(p.imagePath))+'"><figcaption>'+escaped(photoAlt(p))+'</figcaption></figure>':'';
 const back=p.backImagePath?'<figure><img loading="lazy" width="1000" alt="'+escaped(photoAlt(p,true))+'" src="'+escaped(asset(p.backImagePath))+'"><figcaption>'+escaped(photoAlt(p,true))+'</figcaption></figure>':'';
 const links=[p.videoUrl,p.liveUrl].filter(v=>{try{return new URL(v).protocol==='https:'}catch{return false}}).map(v=>'<a target="_blank" rel="noopener" href="'+escaped(v)+'">▶ '+(v===p.liveUrl?'Live stream / Replay':'Video walkthrough')+'</a>').join(' ');
 const line=String(state.config.lineId||'').trim(),lineUrl=/^@?[\w.-]{3,60}$/.test(line)?'https://line.me/R/ti/p/~'+(line.startsWith('@')?line:'@'+line):'';
 const lineButton=lineUrl?'<a class="btn" target="_blank" rel="noopener" href="'+escaped(lineUrl)+'">สอบถามผ่าน LINE ↗</a>':'';
 const price=Number(p.price||0).toLocaleString('th-TH');
 const itemCopy=[title,p.edition,p.temple,p.material,p.description,'฿'+price,canonical].filter(Boolean).join('\n');
 const css=':root{--accent:'+escaped(state.design?.accent||'#bb9868')+';--paper:'+escaped(state.design?.background||'#f5f0e7')+';--ink:'+escaped(state.design?.ink||'#292c25')+';--nav:'+escaped(state.design?.nav||'#1b2926')+'}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.65 system-ui,"Noto Sans Thai",sans-serif}header{background:var(--nav);color:#fff;padding:18px max(20px,calc((100vw - 1120px)/2))}header a{color:#f6deae;text-decoration:none;font-weight:800}main{max-width:1120px;margin:30px auto;padding:0 20px}.layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:30px}.photos{display:grid;gap:15px}figure{margin:0;padding:14px;background:#fff;box-shadow:0 7px 28px #0001;border-radius:15px}figure img{display:block;width:100%;height:auto;max-height:660px;object-fit:contain}figcaption{font-size:12px;color:#69716d;margin-top:8px}h1{font-size:clamp(27px,4vw,45px);line-height:1.25;margin:2px 0 14px}.price{color:#9a6541;font-size:32px;font-weight:800;margin:18px 0}.facts{padding:14px 0;border-top:1px solid #ddd5ca;white-space:pre-line}.links{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}.btn,.links a{border:1px solid #b5bdb1;background:#fff;padding:11px 15px;border-radius:9px;color:#2b574d;text-decoration:none;cursor:pointer}.btn{background:var(--accent);color:#1c241e}.status{font-size:13px;color:#6c796e}.summary{margin-top:16px;white-space:pre-line;overflow-wrap:anywhere}.tag{font-size:12px;letter-spacing:.1em;color:#887451}@media(max-width:750px){.layout{grid-template-columns:1fr}}';
 return '<!doctype html><html lang="th"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escaped(title)+' · '+escaped(shop)+'</title><meta name="description" content="'+escaped(description.slice(0,158))+'">'+head+og+ld+'<style>'+css+'</style></head><body><header><a href="../index.html">✺ '+escaped(shop)+' · ดูร้าน / Shop</a></header><main><div class="layout"><div class="photos">'+front+back+'</div><article><div class="tag">พระเครื่อง · ORIGINAL PRODUCT PAGE · '+escaped(p.id)+'</div><h1>'+escaped(title)+'</h1><div>'+escaped(p.english||'')+'</div><p class="price">฿'+price+'</p><div class="status">'+escaped(p.status||'available')+'</div><div class="facts">'+['Temple: '+(p.temple||''),'Ajarn: '+(p.teacher||''),'Edition: '+(p.edition||''),'Material: '+(p.material||''),'Province: '+(p.province||''),'Year: '+(p.year||''),'Condition: '+(p.condition||''),'Dimensions: '+(p.dimensions||'')].filter(x=>!x.endsWith(': ')).map(escaped).join('\n')+'</div><p class="summary">'+escaped(description)+'</p><div class="links">'+lineButton+links+'<button class="btn" id="copy">คัดลอกแคปชัน · Copy post</button><button class="btn" id="share">แชร์ · Share</button></div></article></div></main><script>const social='+safeJSON(itemCopy)+';document.getElementById("copy").onclick=()=>navigator.clipboard.writeText(social).catch(()=>prompt("Copy",social));document.getElementById("share").onclick=()=>{if(navigator.share)navigator.share({title:'+safeJSON(title)+',url:location.href,text:social}).catch(()=>{});else navigator.clipboard.writeText(location.href).catch(()=>prompt("Link",location.href))};</'+'script></body></html>';
}
function sitemapXml(items,base){
 const head='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">';
 const entries=[{url:base+'/index.html',p:null},...items.map(p=>({url:base+'/items/'+fileSlug(p)+'.html',p}))];
 return head+entries.map(({url,p})=>'<url><loc>'+escaped(url)+'</loc>'+((p?[p.imagePath,p.backImagePath].filter(Boolean):[]).map(x=>'<image:image><image:loc>'+escaped(x.startsWith('https:')?x:base+'/'+x)+'</image:loc></image:image>').join(''))+'</url>').join('')+'</urlset>';
}
function siteManifest(items,base){
 return items.map(p=>({id:p.id,title:p.title,url:base+'/items/'+fileSlug(p)+'.html',photo:p.imagePath&&((p.imagePath.startsWith('https:')?p.imagePath:base+'/'+p.imagePath)),status:p.status,price:p.price}));}

function merchantCsv(items,base){
 // Google Merchant Center feed scaffold: seller must verify account eligibility, condition, shipping/returns and payment flow.
 const columns=['id','title','description','link','image_link','additional_image_link','availability','price','brand','condition','product_type'];
 const quote=v=>'"'+String(v??'').replace(/"/g,'""').replace(/\r?\n/g,' ').slice(0,2000)+'"';
 const map={available:'in_stock',reserved:'out_of_stock',sold:'out_of_stock'};
 const rows=items.map(p=>[
  p.sku||p.id,p.title,p.description||[p.edition,p.temple,p.material].filter(Boolean).join(' · '),
  base?base+'/items/'+fileSlug(p)+'.html':'',
  p.imagePath?(p.imagePath.startsWith('https:')?p.imagePath:base+'/'+p.imagePath):'',
  p.backImagePath?(p.backImagePath.startsWith('https:')?p.backImagePath:base+'/'+p.backImagePath):'',
  map[p.status]||'out_of_stock',Number(p.price||0).toFixed(2)+' THB',state.config.brand||'',
  p.itemCondition||'',p.category||'Buddhist amulet'
 ]);
 return [columns.map(quote).join(','),...rows.map(row=>row.map(quote).join(','))].join('\r\n')+'\r\n';
}
function zipFiles(files){
 // ZIP "stored" (uncompressed). JPEG is already compressed. UTF-8 paths are supported.
 const local=[],central=[];let offset=0;
 const write16=(dv,o,v)=>dv.setUint16(o,v,true),write32=(dv,o,v)=>dv.setUint32(o,v>>>0,true);
 const crc32=bytes=>{let n=-1;for(let i=0;i<bytes.length;i++){n^=bytes[i];for(let j=0;j<8;j++)n=(n>>>1)^((n&1)?0xEDB88320:0)}return(n^-1)>>>0};
 const filesClean=files.map(f=>({name:f.name,bytes:typeof f.content==='string'?enc.encode(f.content):f.bytes}));
 for(const f of filesClean){
  const name=enc.encode(f.name),crc=crc32(f.bytes),len=f.bytes.length;
  const lh=new Uint8Array(30),l=new DataView(lh.buffer);write32(l,0,0x04034b50);write16(l,4,20);write16(l,6,0x800);write32(l,14,crc);write32(l,18,len);write32(l,22,len);write16(l,26,name.length);
  local.push(lh,name,f.bytes);
  const ch=new Uint8Array(46),c=new DataView(ch.buffer);write32(c,0,0x02014b50);write16(c,4,20);write16(c,6,20);write16(c,8,0x800);write32(c,16,crc);write32(c,20,len);write32(c,24,len);write16(c,28,name.length);write32(c,42,offset);
  central.push(ch,name);offset+=lh.length+name.length+len;
 }
 const centralLen=central.reduce((s,a)=>s+a.length,0),end=new Uint8Array(22),e=new DataView(end.buffer);
 write32(e,0,0x06054b50);write16(e,8,filesClean.length);write16(e,10,filesClean.length);write32(e,12,centralLen);write32(e,16,offset);
 return new Blob([...local,...central,end],{type:'application/zip'});
}
async function exportBundle(){
 const items=publicItems();
 if(!items.length){notice('Add a real amulet before exporting. Samples are not published.');showStep('products');return}
 const base=domain();
 if(!base){if(!confirm('HTTPS shop URL is missing. Export a NOINDEX draft bundle without canonical URLs?')){showStep('publish');return}}
 if(!/^@?[\w.-]{3,60}$/.test(String(state.config.lineId||''))){if(!confirm('LINE OA ID not configured. Export a draft with no working seller contact?')){showStep('shop');return}}
 const missing=items.filter(p=>!p.imagePath);
 if(missing.length&&!confirm(missing.length+' products have no front photo. Google Lens discovery will be much weaker. Export anyway?'))return;
 const prep=mediaPrepare(items),saved=state.products;
 let index;
 try{state.products=prep.products;index=replaceStorefront()}finally{state.products=saved}
 if(!base)index=index.replace('</head>','<meta name="robots" content="noindex,nofollow"></head>');
 else index=index.replace('</head>','<link rel="canonical" href="'+escaped(base+'/index.html')+'"></head>');
 let enhancements='';
 try{const r=await fetch('./site-enhancements.js',{cache:'no-cache'});if(!r.ok)throw Error('HTTP '+r.status);enhancements=await r.text()}catch(e){notice('Cannot include site-enhancements.js: '+e.message);return}
 let artCss='';
 if(index.includes('art-directions.css')){
  try{
   const response=await fetch('./art-directions.css',{cache:'no-cache'});
   if(!response.ok)throw Error('HTTP '+response.status);
   artCss=await response.text();
   if(!artCss.includes('data-sian-art'))throw Error('Not a recognized art direction stylesheet');
  }catch(error){notice('The selected design cannot be packaged: '+error.message);return}
 }
 const files=[{name:'index.html',content:index},{name:'site-enhancements.js',content:enhancements},...(artCss?[{name:'art-directions.css',content:artCss}]:[]),...prep.files,
 ...prep.products.map(p=>({name:'items/'+fileSlug(p)+'.html',content:oneItemPage(p,base)})),
 {name:'product-feed.json',content:JSON.stringify(siteManifest(prep.products,base),null,2)},
 {name:'merchant-center-feed.csv',content:merchantCsv(prep.products,base)},
 {name:'README-PUBLISH.txt',content:['SIAN STUDIO · hosted site handoff','This ZIP is NOT deployed. Staff must upload all files to the HTTPS host (preserve items/ and media/).','Domain: '+(base||'NOT SET, DRAFT ONLY'),'Images are seller-submitted. Verify descriptions, title, provenance, owner permissions and product availability.\nMerchant Center CSV is a starting feed, not a guarantee of listing: complete product condition, shipping, returns, verified merchant account and seller purchase path.','After deployment verify links, LINE, videos, Image Search, Google Search Console, and Merchant Center eligibility.','Source: https://nanobotco.github.io/sian-studio/'].join('\n')}];
 if(base){files.push({name:'sitemap.xml',content:sitemapXml(prep.products,base)},{name:'robots.txt',content:'User-agent: *\nAllow: /\nSitemap: '+base+'/sitemap.xml\n'})}
 else files.push({name:'robots.txt',content:'User-agent: *\nDisallow: /\n'});
 const zip=zipFiles(files),url=URL.createObjectURL(zip),a=document.createElement('a');a.href=url;a.download='sian-'+(state.config.english||'shop').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,36)+'-host-ready.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
 notice('✓ '+items.length+' standalone product pages, '+prep.files.length+' image files and SEO data exported in site ZIP. Deployment is a separate step.');showStep('publish');
}
function mount(){
 const btn=$('#downloadSite'),top=$('#downloadSiteTop');if(btn){btn.textContent='↓ Export host-ready ZIP';btn.onclick=exportBundle}if(top){top.textContent='↓ ZIP เว็บไซต์';top.onclick=exportBundle}
 const pane=$('#pane-publish');if(pane){const p=document.createElement('div');p.className='note';p.textContent='The ZIP contains actual indexable item pages, front/back image files, matching art-direction CSS, structured data, a sitemap, and a social feed. Publishing requires verified payment and uploading the ZIP contents to the configured domain.';pane.append(p)}
}
mount();
window.SianPublisher={exportBundle,oneItemPage,zipFiles,sitemapXml};
})();