/* Sian Studio builder v1.3: configurable design, page sections, product media and social selling */
(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const TYPES={hero:'🏠 Hero',collection:'🪷 Catalogue',story:'📖 About',toy:'✺ Math toy',fidget:'◉ Spinner lab',oracle:'✦ Divination',newsletter:'✉ Newsletter',text:'¶ Text / Story',image:'▣ Image block',video:'▶ Video link',quote:'❞ Testimonial',faq:'? FAQ',cta:'↗ Offer / CTA'};
const HERO_DEFAULTS={
 eyebrowTh:'ของแท้จากศรัทธา ไม่ใช่จากคำโฆษณา',
 eyebrowEn:'Objects chosen for trust, not hype',
 firstTh:'ของมีค่า',secondTh:'มีเรื่องเล่า',
 firstEn:'Meaningful objects',secondEn:'with stories',
 leadTh:'พระเครื่องและเครื่องรางที่เลือกด้วยความเข้าใจ ดูภาพชัด สอบถามได้โดยตรง และเก็บเรื่องราวของทุกชิ้นไว้ครบถ้วน',
 leadEn:'A curated amulet and talisman shop with clear images, direct contact, and story-rich listings.',
 primaryTh:'ชมพระเครื่อง',primaryEn:'Browse the collection',
 primaryHref:'#collection',secondaryTh:'ลองเสี่ยงทาย',secondaryEn:'Try a reading',secondaryHref:'#oracle',
 image:'',imageAlt:'Amulet illustration / shop hero photograph',imageFit:'cover',imagePosition:'center center'
};
const SECTION_COPY_DEFAULTS={
 collection:{headlineTh:'คัดมาให้ชม อย่างตั้งใจ',headlineEn:'Browse a selection with care',subtextTh:'แต่ละชิ้นมีรายละเอียดให้ดู และติดต่อผู้ขายโดยตรงได้ทันที',subtextEn:'Each piece includes details and a direct path to the seller.'},
 story:{headlineTh:'ซื้อพระ ซื้อด้วยความรู้',headlineEn:'Choose amulets with understanding',subtextTh:'คัดสรรด้วยสายตาของคนรักพระเครื่อง จากความรู้ที่สืบทอดและความไว้วางใจของชุมชน',subtextEn:'Every amulet has a story. We document what we know.'},
 fidget:{headlineTh:'หมุนเล่น แบบเซียน',headlineEn:'Fidget like a sian',subtextTh:'ปั่นวงล้อจริงด้วยนิ้ว เปลี่ยนรูปแบบและแรงเสียดทานได้',subtextEn:'Drag, flick and adjust the friction of an original spinner.'},
 toy:{headlineTh:'ของเล่นคณิต หมุนได้จริง',headlineEn:'A mathematical toy that really moves',subtextTh:'ของเล่นคณิตศาสตร์สำหรับคนรักวงโคจร',subtextEn:'Play with moving geometry and mathematical orbits.'},
 oracle:{headlineTh:'เลือกวิธีอ่าน ที่เข้ากับคุณ',headlineEn:'Choose a reading that fits you',subtextTh:'ลองไพ่ทาโรต์ อี้จิง และเซียมซี',subtextEn:'Try Tarot, I Ching, or fortune sticks.'},
 newsletter:{headlineTh:'ข่าวคราวดี ๆ ส่งตรงถึงคุณ',headlineEn:'Fresh stories, delivered',subtextTh:'รายการใหม่ เรื่องเล่าจากวงการ และเครื่องมือความรู้',subtextEn:'New arrivals, stories, and useful knowledge.'}
};
const DEFAULT_SECTIONS=['hero','collection','story','fidget','toy','oracle','newsletter'].map((type,i)=>({id:'default-'+type,type,enabled:true,title:TYPES[type],text:'',style:{}}));
const DEFAULT_STYLE={accent:'#c6a16d',background:'#f4f0e9',ink:'#282921',surface:'#fffdf9',nav:'#14130f',bodyFont:'system',headingFont:'serif',contentWidth:1200,cardRadius:14,sectionSpacing:72,baseSize:16,cardShadow:20,heroAlign:'left',productColumns:3,heroSpinner:true,heroSpinnerOpacity:24};
const init=()=>{if(!Array.isArray(state.sections))state.sections=structuredClone(DEFAULT_SECTIONS);if(!state.design||typeof state.design!=='object')state.design={...DEFAULT_STYLE};if(!state.sales)state.sales={setupFee:6500,monthlyFee:0,checkoutUrl:'',email:'',status:'draft'}};
const safe=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const sectionStyle=(v={})=>Object.assign({bg:'#f7f3e8',card:'#ffffff',text:'#292c27',align:'left',padding:68,width:1080,radius:12},v);
const hex=(v,f)=>/^#[a-f0-9]{6}$/i.test(String(v))?v:f;
function themeCss(){
 const d={...DEFAULT_STYLE,...state.design};
 const fonts={system:'system-ui,-apple-system,"Noto Sans Thai",sans-serif',serif:'Georgia,"Noto Serif Thai",serif',sans:'Arial,"Noto Sans Thai",sans-serif',mono:'ui-monospace,monospace'};
 const clamp=(v,lo,hi,f)=>Number.isFinite(+v)?Math.max(lo,Math.min(hi,+v)):f;
 return ':root{--gold:'+hex(d.accent,'#c6a16d')+'!important;--ink:'+hex(d.ink,'#282921')+'!important;--paper:'+hex(d.background,'#f4f0e9')+'!important;--cream:'+hex(d.surface,'#fffdf9')+'!important}'+
 'html,body{font-family:'+fonts[d.bodyFont]+'!important;font-size:'+clamp(d.baseSize,13,23,16)+'px!important;background:'+hex(d.background,'#f4f0e9')+'!important}'+
 'h1,h2,h3,.story-copy h2,.hero h1{font-family:'+fonts[d.headingFont]+'!important}'+
 '.header{background:'+hex(d.nav,'#14130f')+'!important}'+
 '.outer{max-width:'+clamp(d.contentWidth,760,1600,1200)+'px!important}'+
 '.product-card,.product-art,.detail-art{border-radius:'+clamp(d.cardRadius,0,35,14)+'px!important}'+
 '.product-card{box-shadow:0 8px '+clamp(d.cardShadow,0,45,20)+'px #0001!important}'+
 '.hero-copy{text-align:'+(['center','right'].includes(d.heroAlign)?d.heroAlign:'left')+'!important}'+
 '.section,.story-section,.tarot-section,.kinetic-section{padding-top:'+clamp(d.sectionSpacing,30,130,72)+'px!important;padding-bottom:'+clamp(d.sectionSpacing,30,130,72)+'px!important}'+
 '@media(min-width:920px){.product-grid{grid-template-columns:repeat('+clamp(d.productColumns,2,5,3)+',minmax(0,1fr))!important}}';
}
const originalReplace=replaceStorefront;
replaceStorefront=function(){
 init();let page=originalReplace();
 page=page.replace('</style>',themeCss()+'</style>');
 const payload=JSON.stringify({sections:state.sections,visual:{heroSpinner:state.design.heroSpinner!==false,heroSpinnerOpacity:Number(state.design.heroSpinnerOpacity||24)/100}}).replace(/</g,'\\u003c');
 page=page.replace('</body>','<script type="application/json" id="sianBuilderSiteConfig">'+payload+'<\/script></body>');
 return page;
};
const originalPreview=previewNow;
previewNow=function(){init();originalPreview()};
function tab(name,label,after){
 const b=document.createElement('button');b.className='step';b.dataset.step=name;b.textContent=label;
 $('.steps').append(b);b.onclick=()=>showStep(name);
 const pane=document.createElement('section');pane.className='pane';pane.id='pane-'+name;$('.editor').insertBefore(pane,document.querySelector('.editor .foot-note'));pane.innerHTML=after;
 return pane;
}
function renderLookControls(){
 const pane=$('#pane-look');
 const wrap=document.createElement('div');wrap.className='sian-control-wrap';
 wrap.innerHTML='<h3>ละเอียด / Fine style controls</h3><p class="help">Each choice updates the live storefront. Choose colors, fonts, density and layout without editing CSS.</p><div id="sianDesignControls" class="sian-form-grid"></div>';
 pane.append(wrap);
 const controls=[
 ['accent','Accent / Gold','color'],['background','Page background','color'],['ink','Body text','color'],['surface','Cards / surface','color'],['nav','Header background','color'],
 ['bodyFont','Body font','select',['system','sans','serif','mono']],['headingFont','Heading font','select',['serif','sans','system','mono']],
 ['baseSize','Base font size (px)','range',13,23,1],['contentWidth','Max content width (px)','range',760,1600,20],
 ['cardRadius','Card radius','range',0,35,1],['sectionSpacing','Section spacing','range',30,130,2],['cardShadow','Card shadow','range',0,45,1],
 ['productColumns','Desktop product columns','range',2,5,1],['heroAlign','Hero alignment','select',['left','center','right']],['heroSpinnerOpacity','Hero spinner backdrop opacity (%)','range',12,60,2]
 ];
 for(const [key,label,type,a,b,step] of controls){
  const f=document.createElement('label');f.className='field';const title=document.createElement('span');title.textContent=label;f.append(title);
  const input=document.createElement(type==='select'?'select':'input');input.dataset.design=key;
  if(type==='select'){for(const option of a){const o=document.createElement('option');o.value=o.textContent=option;input.append(o)}}
  else{input.type=type;if(type==='range'){input.min=a;input.max=b;input.step=step}}
  input.value=(state.design||DEFAULT_STYLE)[key];f.append(input);
  if(type==='range'){const val=document.createElement('small');val.textContent=input.value;f.append(val);input.addEventListener('input',()=>val.textContent=input.value)}
  input.addEventListener('input',()=>{init();state.design[key]=type==='range'?Number(input.value):input.value;change()});
  $('#sianDesignControls').append(f);
 }
 const f=document.createElement('label');f.className='switch-row';f.textContent='Interactive fidget spinner in hero background';const c=document.createElement('input');c.type='checkbox';c.checked=state.design.heroSpinner!==false;c.onchange=()=>{state.design.heroSpinner=c.checked;change()};f.append(c);wrap.append(f);
 const reset=document.createElement('button');reset.className='btn';reset.textContent='Reset ALL appearance settings / คืนค่า';reset.onclick=()=>{if(!confirm('Reset this shop’s complete appearance, including the selected art direction? Your products and text will remain.'))return;state.design={...DEFAULT_STYLE};$('[data-design]').forEach(input=>{input.value=state.design[input.dataset.design];const small=input.parentElement.querySelector('small');if(small)small.textContent=input.value});window.SianStyle?.refresh?.();window.SianArt?.refresh?.();change()};wrap.append(reset);
}
function getSection(id){return state.sections.find(x=>x.id===id)}
let currentSection=null;
function renderSectionList(){
 init();const list=$('#sianSectionList');list.replaceChildren();
 state.sections.forEach((sec,i)=>{
  const row=document.createElement('div');row.className='sian-section-row';row.draggable=true;row.dataset.id=sec.id;
  const label=document.createElement('button');label.className='sian-section-select'+(sec.id===currentSection?' active':'');label.textContent=(sec.enabled===false?'◌ ':'● ')+(TYPES[sec.type]||sec.type)+(sec.title&&sec.title!==TYPES[sec.type]?' · '+sec.title.slice(0,32):'');
  label.setAttribute('aria-label','Edit '+(sec.title||TYPES[sec.type]||sec.type));label.onclick=()=>{currentSection=sec.id;renderSectionList();renderSectionEditor()};
  const actions=document.createElement('div');actions.className='sian-section-actions';
  for(const [txt,fn,disabled] of [
   ['↑',()=>moveSection(i,-1),i===0],['↓',()=>moveSection(i,1),i===state.sections.length-1],
   [sec.enabled===false?'◉':'◌',()=>{sec.enabled=sec.enabled===false;renderSectionList();change()},false],
   ['×',()=>{if(!confirm('Remove section "'+(sec.title||TYPES[sec.type]||sec.type)+'"? The contents and settings of this section will be lost.'))return;state.sections.splice(i,1);if(currentSection===sec.id)currentSection=state.sections[Math.max(0,i-1)]?.id||null;renderSectionList();renderSectionEditor();change();notice('Section removed. Export a project backup regularly.')},false]]){
    const b=document.createElement('button');b.type='button';b.textContent=txt;b.disabled=disabled;const actionName=txt==='×'?'Remove section':txt==='↑'?'Move section up':txt==='↓'?'Move section down':sec.enabled===false?'Show section':'Hide section';b.title=actionName+' · '+(sec.title||sec.type);b.setAttribute('aria-label',b.title);b.onclick=fn;actions.append(b)
  }
  row.append(label,actions);
  row.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',sec.id);e.dataTransfer.effectAllowed='move'});
  row.addEventListener('dragover',e=>e.preventDefault());
  row.addEventListener('drop',e=>{e.preventDefault();const id=e.dataTransfer.getData('text/plain');const from=state.sections.findIndex(x=>x.id===id),to=state.sections.findIndex(x=>x.id===sec.id);if(from>=0&&to>=0&&from!==to){state.sections.splice(to,0,state.sections.splice(from,1)[0]);renderSectionList();change()}});
  list.append(row);
 });
}
function moveSection(i,d){const j=i+d;if(j<0||j>=state.sections.length)return;state.sections.splice(j,0,state.sections.splice(i,1)[0]);renderSectionList();change()}
function addInput(parent,label,key,value,kind,onChange){
 const f=document.createElement('label');f.className='field';const title=document.createElement('span');title.textContent=label;f.append(title);
 const input=document.createElement(kind==='textarea'?'textarea':'input');
 if(kind==='textarea'){input.rows=3;}else if(kind==='color')input.type='color';else if(kind==='number')input.type='number';else if(kind==='url')input.type='url';else if(kind==='checkbox')input.type='checkbox';else input.type='text';
 if(kind==='checkbox')input.checked=Boolean(value);else input.value=value??'';
 input.dataset.sectionKey=key;
 input.addEventListener(kind==='checkbox'?'change':'input',()=>{onChange(kind==='checkbox'?input.checked:kind==='number'?Number(input.value):input.value);change()});
 f.append(input);parent.append(f);return input;
}
function heroInput(container,s,label,key,{kind='text',hint='',max=200}={}){
 const v=s.hero[key]??'';
 const input=addInput(container,label,key,v,kind,value=>{s.hero[key]=String(value).slice(0,max)});
 input.maxLength=max;
 if(hint){const p=document.createElement('p');p.className='hint';p.textContent=hint;container.append(p)}
 return input;
}
function heroEditor(box,s){
 if(!s.hero)s.hero={...HERO_DEFAULTS,...(s.headline?{firstEn:s.headline,firstTh:s.headline}:{}),...(s.subtext?{leadEn:s.subtext,leadTh:s.subtext}:{})};
 const intro=document.createElement('div');intro.className='sian-edit-context';
 intro.innerHTML='<strong>✎ Editing the large storefront hero</strong><p>These fields correspond to the big heading, description, two buttons and artwork visible in the preview. You can edit them separately in Thai and English.</p>';
 box.append(intro);
 const group=(name)=>{const h=document.createElement('h4');h.className='sian-edit-group';h.textContent=name;box.append(h)};
 group('01 · Main headline / พาดหัว');
 heroInput(box,s,'Small text above headline · ไทย','eyebrowTh');
 heroInput(box,s,'Eyebrow · English','eyebrowEn');
 heroInput(box,s,'Large heading · line 1 (ไทย)','firstTh');
 heroInput(box,s,'Highlighted heading · line 2 (ไทย)','secondTh');
 heroInput(box,s,'Large heading · line 1 (English)','firstEn');
 heroInput(box,s,'Highlighted heading · line 2 (English)','secondEn');
 group('02 · Description / คำอธิบาย');
 heroInput(box,s,'Under-heading paragraph · ไทย','leadTh',{kind:'textarea',max:1600});
 heroInput(box,s,'Under-heading paragraph · English','leadEn',{kind:'textarea',max:1600});
 group('03 · Buttons / ปุ่ม');
 heroInput(box,s,'Primary button · ไทย','primaryTh');
 heroInput(box,s,'Primary button · English','primaryEn');
 heroInput(box,s,'Primary button destination','primaryHref',{hint:'Use #collection, #oracle, #fidget, or an HTTPS link.'});
 heroInput(box,s,'Secondary button · ไทย','secondaryTh');
 heroInput(box,s,'Secondary button · English','secondaryEn');
 heroInput(box,s,'Secondary button destination','secondaryHref',{hint:'Use a section anchor or an HTTPS URL.'});
 group('04 · Illustration / Hero artwork');
 const imageField=heroInput(box,s,'Custom artwork URL (https://), or upload an image','image',{max:2500000,hint:'Leave empty to use the original illustrated amulet. The uploaded image is stored in this browser draft and included in site export.'});
 imageField.type='text';
 const uploadLabel=document.createElement('label');uploadLabel.className='field';uploadLabel.innerHTML='<span>Upload your own image / เปลี่ยนภาพ</span>';
 const input=document.createElement('input');input.type='file';input.accept='image/*';input.dataset.sectionKey='imageUpload';
 input.onchange=async event=>{try{const file=event.target.files[0];if(!file)return;const photo=await handlePhoto(file);if(!photo)return;s.hero.image=photo;renderSectionEditor();change();notice('✓ Hero artwork updated')}catch(e){notice('Unable to use that image: '+e.message)}};
 uploadLabel.append(input);box.append(uploadLabel);
 const current=document.createElement('p');current.className='hint';current.textContent=s.hero.image?'✓ Custom artwork selected':'Currently using the illustrated amulet image';box.append(current);
 const remove=document.createElement('button');remove.type='button';remove.className='btn';remove.textContent='Restore original illustrated amulet';remove.onclick=()=>{s.hero.image='';renderSectionEditor();change()};box.append(remove);
 const fit=document.createElement('label');fit.className='field';fit.innerHTML='<span>Photo fit / ภาพเต็มหรือภาพพอดี</span>';const select=document.createElement('select');select.dataset.sectionKey='imageFit';
 for(const option of ['cover','contain']){const o=document.createElement('option');o.value=o.textContent=option;select.append(o)}select.value=s.hero.imageFit||'cover';select.onchange=()=>{s.hero.imageFit=select.value;change()};fit.append(select);box.append(fit);
 heroInput(box,s,'Image description for accessibility / SEO','imageAlt',{max:300});
}
function sectionCopyInputs(box,s){
 const defaults=SECTION_COPY_DEFAULTS[s.type]||{};
 if(!s.copy)s.copy={...defaults,...(s.headline?{headlineTh:s.headline,headlineEn:s.headline}:{}),...(s.subtext?{subtextTh:s.subtext,subtextEn:s.subtext}:{})};
 const div=document.createElement('div');div.className='sian-edit-context';div.innerHTML='<strong>✎ Edit this section’s visible text</strong><p>These are the heading and descriptive copy shown on the live website. Switch the website preview between Thai and English to check both.</p>';box.append(div);
 for(const [key,label,kind] of [
 ['headlineTh','Headline · ไทย','text'],['headlineEn','Headline · English','text'],
 ['subtextTh','Description · ไทย','textarea'],['subtextEn','Description · English','textarea']]){
 const input=addInput(box,label,key,s.copy[key]||'',kind,v=>s.copy[key]=v);input.maxLength=kind==='textarea'?1600:220;
 }
}
function renderSectionEditor(){
 const box=$('#sianSectionEditor');box.replaceChildren();const s=getSection(currentSection);if(!s){box.textContent='Select a section above or click an Edit control in the live preview.';return}
 const title=document.createElement('h3');title.textContent='✎ '+(TYPES[s.type]||s.type)+' · content & style';box.append(title);
 if(s.type==='hero')heroEditor(box,s);
 else if(['collection','story','toy','fidget','oracle','newsletter'].includes(s.type))sectionCopyInputs(box,s);
 else {
 const label=addInput(box,'Section name (only in editor)','title',s.title,'text',v=>{s.title=v;renderSectionList()});label.maxLength=120;
 }
 if(['text','image','quote','faq','cta','video'].includes(s.type)){
  addInput(box,s.type==='faq'?'FAQ lines: Question | Answer':'Body text / Caption','text',s.text,'textarea',v=>s.text=v);
  if(s.type==='image'){addInput(box,'Image URL (https) or upload below','image',s.image||'','url',v=>s.image=v);addInput(box,'Image alt text','imageAlt',s.imageAlt,'text',v=>s.imageAlt=v);const uploader=document.createElement('input');uploader.type='file';uploader.accept='image/*';uploader.onchange=async e=>{const data=await handlePhoto(e.target.files[0]);if(data){s.image=data;renderSectionEditor();change()}};box.append(uploader)}
  if(s.type==='video')addInput(box,'Video URL (YouTube / social link)','videoUrl',s.videoUrl,'url',v=>s.videoUrl=v);
  if(['cta','image','text'].includes(s.type)){addInput(box,'Button URL','url',s.url,'url',v=>s.url=v);addInput(box,'Button text','linkText',s.linkText,'text',v=>s.linkText=v)}
 }
 const divider=document.createElement('h3');divider.textContent='Section-specific style / เฉพาะส่วน';box.append(divider);
 s.style=sectionStyle(s.style);
 for(const [key,label,kind] of [['bg','Section background (changes underlying gradient)','color'],['card','Card surface','color'],['text','Text','color'],['padding','Vertical space (px)','number'],['width','Card width (px)','number'],['radius','Corners (px)','number']])addInput(box,label,key,s.style[key],kind,v=>{s.style[key]=v;if(key==='bg')s.style._colorBg=true;if(key==='text')s.style._colorText=true;if(key==='card')s.style._customCard=true;if(key==='padding')s.style._customPadding=true;if(key==='width')s.style._customWidth=true;if(key==='radius')s.style._customRadius=true});
 const align=document.createElement('label');align.className='field';align.textContent='Text alignment';const select=document.createElement('select');for(const v of ['left','center','right']){const opt=document.createElement('option');opt.value=opt.textContent=v;select.append(opt)}select.value=s.style.align;select.onchange=()=>{s.style.align=select.value;s.style._customAlign=true;change()};align.append(select);box.append(align);
 const n=document.createElement('p');n.className='hint';n.textContent='Built-in sections retain their preset appearance until you change an individual control. Custom blocks support width and surfaces; the catalogue supports product-card color.';box.append(n);
 window.SianStyle?.decorateSectionEditor?.(box,s);
}
function buildSectionUI(){
 const pane=tab('sections','4 · ส่วน','<h2>04 · ส่วนของเว็บไซต์ / Page sections</h2><p class="help">Drag or use ↑ ↓ to reorder. Hide or remove any section. Add text, galleries, video, testimonials, FAQ or offers.</p><div class="sian-add-row"><select id="sianAddType"></select><button class="btn btn-dark" id="sianAddSection">＋ เพิ่มส่วน / Add</button></div><div id="sianSectionEditor" class="sian-control-wrap"></div><h3 class="sian-section-list-heading">↕ Move, add, or hide other sections</h3><div id="sianSectionList"></div>');
 const select=$('#sianAddType');for(const [key,label] of Object.entries(TYPES)){const o=document.createElement('option');o.value=key;o.textContent=label;select.append(o)}
 $('#sianAddSection').onclick=()=>{
  const type=select.value,id='section-'+Date.now().toString(36);
  if(['hero','collection','story','toy','fidget','oracle','newsletter'].includes(type)&&state.sections.some(x=>x.type===type)){notice('Built-in section already exists. Select it to move or enable.');return}
  const sec={id,type,enabled:true,title:TYPES[type].replace(/^[^\s]+\s/,'')||type,text:type==='faq'?'พระแท้ไหม? | ดูภาพหน้าหลังและสอบถามกับร้านโดยตรง':type==='quote'?'เรื่องเล่าจากนักสะสม':'',style:sectionStyle()};
  state.sections.push(sec);currentSection=id;renderSectionList();renderSectionEditor();change();
 };
 if(!currentSection)currentSection=state.sections.find(x=>x.type==='hero')?.id||null;
 renderSectionList();renderSectionEditor();
 const next=$('[data-next="publish"]');if(next){next.dataset.next='sections';next.textContent='ถัดไป · จัดส่วน →'}
 const button=document.createElement('button');button.className='btn btn-dark';button.textContent='ถัดไป · เผยแพร่ →';button.onclick=()=>showStep('sale');pane.append(button);
 // Move publish tab to follow sections
 const p=$('.step[data-step="publish"]');if(p)p.parentElement.append(p);
}
function buildProductExtras(){
 const editor=$('#itemEditor'),anchor=$('#pDescription').closest('.field');
 const div=document.createElement('div');div.className='sian-product-extra';
 div.innerHTML='<h3>🔎 Google Lens / Image SEO</h3><p class="hint">Unique photos, exact descriptions and indexable product pages improve discovery; there is no guarantee of rankings.</p><div id="sianSeoFields" class="sian-form-grid"></div><h3>🎥 Live and recorded video</h3><div id="sianVideoFields"></div><h3>↗ Social selling / แชร์สินค้า</h3><div id="sianSocialFields"></div><div class="row-buttons"><button class="btn" id="sianCopyCaption">Copy Thai post</button><button class="btn" id="sianCopyItemLink">Copy product URL</button><button class="btn" id="sianDownloadShare">↓ Social card PNG</button></div><div id="sianItemLinkInfo" class="hint"></div>';
 anchor.after(div);
 const specs=[
 ['teacher','Ajarn / monk / maker'],['year','Year / Buddhist Era'],['province','Province'],['condition','Condition'],['dimensions','Dimensions / size'],['sku','Stock keeping ID / certificate'],
 ['frontAlt','Front photo description (Thai)'],['backAlt','Back photo description (Thai)'],['keywords','Search terms: temple, edition, material'],['hashtags','Social hashtags']
 ];
 const vids=[['videoUrl','Recorded walkthrough URL (YouTube / Facebook / TikTok)'],['liveUrl','Live stream or replay URL'],['captionTh','Manual Thai post caption'],['captionEn','Manual English post caption']];
 const bind=(arr,target)=>arr.forEach(([key,title])=>{
  const f=document.createElement('label');f.className='field';const span=document.createElement('span');span.textContent=title;const input=document.createElement(key.startsWith('caption')?'textarea':'input');
  input.dataset.productExtra=key;if(key.endsWith('Url'))input.type='url';f.append(span,input);target.append(f);
  input.addEventListener('input',()=>{const product=state.products[selected];if(product){product[key]=input.value;change()}});
 });
 bind(specs,$('#sianSeoFields'));bind(vids,$('#sianVideoFields'));
 const oldLoad=loadSelected;loadSelected=function(){oldLoad();const p=state.products[selected];$$('[data-product-extra]').forEach(input=>input.value=p?.[input.dataset.productExtra]||'');updateProductShare()};
 const oldChange=change;change=function(){oldChange();updateProductShare()};
 $('#sianCopyCaption').onclick=()=>copyText(getCaption(),'Caption copied');
 $('#sianCopyItemLink').onclick=()=>{const u=productUrl();if(!u){notice('Set the shop HTTPS URL in the Publish tab first');showStep('publish')}else copyText(u,'Item URL copied')};
 $('#sianDownloadShare').onclick=downloadSocialCard;
}
function copyText(v,message){if(navigator.clipboard?.writeText)navigator.clipboard.writeText(v).then(()=>notice('✓ '+message)).catch(()=>window.prompt('Copy',v));else window.prompt('Copy',v)}
function productSlug(p){return String(p.id||'item').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,70)}
function productUrl(){const p=state.products[selected];if(!p)return '';const root=String(state.config.siteUrl||'').trim();if(!/^https:\/\//.test(root))return '';return root.replace(/\/+$/,'')+'/items/'+productSlug(p)+'.html'}
function getCaption(){const p=state.products[selected];if(!p)return '';return (p.captionTh||[p.title,p.edition,p.temple,p.material,p.description,'ราคา '+Number(p.price||0).toLocaleString('th-TH')+' บาท','สอบถาม '+(state.config.lineId||'LINE'),p.hashtags,productUrl()||'(link available after publishing)'].filter(Boolean).join('\n'))}
function updateProductShare(){const el=$('#sianItemLinkInfo');if(!el)return;const url=productUrl();el.textContent=url?'Individual landing-page URL: '+url:'For permanent individual URLs, enter the published HTTPS website address on the Publish tab.'}
async function downloadSocialCard(){
 const p=state.products[selected];if(!p)return;
 const c=document.createElement('canvas');c.width=1080;c.height=1350;const g=c.getContext('2d');
 g.fillStyle=state.design?.background||'#f4f0e9';g.fillRect(0,0,1080,1350);g.fillStyle=state.design?.nav||'#14130f';g.fillRect(0,0,1080,135);
 g.fillStyle='#e7c997';g.font='bold 35px sans-serif';g.fillText(String(state.config.brand||'SIAN STUDIO').slice(0,35),45,83);
 g.fillStyle='#e5ded0';g.fillRect(60,176,960,842);
 if(p.imagePath){const img=new Image();img.src=p.imagePath;await img.decode().catch(()=>{});if(img.naturalWidth){const sc=Math.min(910/img.naturalWidth,800/img.naturalHeight),w=img.naturalWidth*sc,h=img.naturalHeight*sc;g.drawImage(img,540-w/2,590-h/2,w,h)}}
 g.fillStyle='#263c33';g.font='bold 43px sans-serif';g.fillText(String(p.title||'Amulet').slice(0,38),55,1110,970);
 g.font='29px sans-serif';g.fillText(String(p.temple||p.edition||'').slice(0,55),55,1170);
 g.fillStyle='#8e6540';g.font='bold 42px sans-serif';g.fillText('฿'+Number(p.price||0).toLocaleString('th-TH'),55,1240);
 c.toBlob(blob=>{if(!blob)return;const a=document.createElement('a'),u=URL.createObjectURL(blob);a.href=u;a.download=productSlug(p)+'-social-1080x1350.png';a.click();setTimeout(()=>URL.revokeObjectURL(u),1500)},'image/png');
}
function publishSiteUrl(){
 const input=document.createElement('label');input.className='field';input.innerHTML='<span>Published HTTPS domain (for SEO and share links)</span><input id="sianSiteUrl" type="url" placeholder="https://your-shop.example/"/>';
 const ref=$('#pane-publish').querySelector('.publish-card');ref.before(input);
 const site=$('#sianSiteUrl');site.value=state.config.siteUrl||'';
 site.addEventListener('change',()=>{state.config.siteUrl=site.value.trim();change()});
 const tip=document.createElement('div');tip.className='note';tip.innerHTML='<b>Lens / Image Search requirements</b><p>Site bundle should contain HTML product pages, descriptive front/back JPG files, an XML image sitemap, and Product JSON-LD. For Google Lens product-shopping surfaces, Google also recommends a Merchant Center product feed.</p>';input.after(tip);
}
function addSaleStep(){
 const pane=tab('sale','6 · ขาย','<h2>06 · ปิดการขาย / Client handoff</h2><p class="help">Illustrative pricing only; edit before sending. Quote → checkout link → verify payment → publish to hosting → hand over URLs. A receipt or admin approval is required: this demo cannot confirm bank payments.</p><label class="field"><span>Setup fee (THB)</span><input type="number" id="sianSetupFee" min="0"></label><label class="field"><span>Monthly hosting / support (THB, enter your quote)</span><input type="number" id="sianMonthlyFee" min="0"></label><label class="field"><span>Hosted checkout / payment link (HTTPS)</span><input id="sianCheckoutUrl" type="url" placeholder="https://your-payment-provider/checkout/..."></label><label class="field"><span>Support or billing email</span><input id="sianBillingEmail" type="email"></label><div class="sian-sales-steps"><p><b>1.</b> Demonstrate the personalized shop and its individual product links.</p><p><b>2.</b> Agree to the quoted setup and monthly hosting terms.</p><p><b>3.</b> Customer pays via the configured external checkout link; verify the provider receipt separately.</p><p><b>4.</b> Export the optimized site bundle and publish to the assigned domain with DNS/HTTPS.</p><p><b>5.</b> Test product pages, QR share links, Google Search Console and LINE enquiries.</p></div><div class="row-buttons"><button class="btn btn-dark" id="sianCopyQuote">Copy LINE quote</button><button class="btn" id="sianOpenCheckout">Open checkout ↗</button><button class="btn" id="sianCopyHandoff">Copy handoff checklist</button></div><div class="note">No payment is processed in Sian Studio and no site is auto-deployed yet. Backend billing verification, domain provisioning and hosted publishing remain integration work.</div>');
 const tabPublish=$('.step[data-step="publish"]');if(tabPublish){tabPublish.textContent='7 · เผยแพร่';tabPublish.parentElement.append(tabPublish)}
 const feature=$('.step[data-step="features"]');if(feature)feature.textContent='4 · ฟีเจอร์';const sections=$('.step[data-step="sections"]');if(sections)sections.textContent='5 · ส่วน';
 const more=document.createElement('button');more.className='btn btn-dark';more.textContent='ถัดไป · เผยแพร่ / Publish →';more.onclick=()=>showStep('publish');pane.append(more);
 pane.querySelectorAll('#sianSetupFee,#sianMonthlyFee,#sianCheckoutUrl,#sianBillingEmail').forEach(input=>{
  const key={sianSetupFee:'setupFee',sianMonthlyFee:'monthlyFee',sianCheckoutUrl:'checkoutUrl',sianBillingEmail:'email'}[input.id];
  input.value=state.sales[key]??'';
  input.oninput=()=>{state.sales[key]=key==='setupFee'||key==='monthlyFee'?Math.max(0,Number(input.value)||0):input.value;change()};
 });
 const description=()=>{const p=state.products.filter(p=>!p.demo);return [state.config.brand,'Website setup: ฿'+Number(state.sales.setupFee).toLocaleString('th-TH'),'Monthly hosting/support: '+(state.sales.monthlyFee>0?'฿'+Number(state.sales.monthlyFee).toLocaleString('th-TH'):'To be quoted'),'Product listings: '+p.length,'Includes editable content, individual product pages, image search metadata, LINE sharing and interactive widgets.','Checkout: '+(state.sales.checkoutUrl||'Request payment link'),'Publishing begins after payment is independently confirmed.'].join('\n')};
 $('#sianCopyQuote').onclick=()=>copyText(description(),'LINE quote copied');
 $('#sianOpenCheckout').onclick=()=>{try{const u=new URL(state.sales.checkoutUrl);if(u.protocol!=='https:')throw Error();window.open(u.href,'_blank','noopener')}catch{notice('Add a verified HTTPS payment link first.')}};
 $('#sianCopyHandoff').onclick=()=>copyText('Sian Studio publication checklist\n☐ Confirm customer and product data\n☐ Verify payment receipt directly with provider\n☐ Export and check site bundle\n☐ Upload bundle to verified hosting\n☐ Configure domain/DNS/HTTPS\n☐ Check product URLs, media, LINE, sitemap and Search Console\n☐ Handover live URL and owner access','Handoff checklist copied');
}
function css(){
 const style=document.createElement('style');style.textContent=
 '.sian-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 12px}'+
 '.sian-control-wrap{border:1px solid #b5cbbc;border-radius:10px;padding:15px;margin:12px 0 22px;background:#fbfcfa}.sian-control-wrap h3,.sian-product-extra h3{margin:9px 0;font-size:16px}.sian-edit-context{padding:12px;background:#e9f2e9;border-radius:9px;margin:10px 0 17px}.sian-edit-context strong{font-size:13px}.sian-edit-context p{font-size:12px;margin:4px 0 0;color:#566957}.sian-edit-group{padding:9px 0 4px;margin:15px 0 10px;font-size:13px;border-bottom:1px solid #d1dbd1;color:#365e4b}.sian-input-target{outline:3px solid #ce9d55!important}.sian-section-list-heading{font-size:13px;color:#506257}'+
 '.sian-add-row{display:flex;gap:7px;margin:12px 0}.sian-add-row select{min-width:0;flex:1;padding:10px;border:1px solid #cbd6cf;border-radius:8px}'+
 '.sian-section-row{display:flex;align-items:center;justify-content:space-between;gap:4px;border-bottom:1px solid #e4e7e0;padding:6px 0}'+
 '.sian-section-select{text-align:left;border:1px solid transparent;background:none;border-radius:6px;min-width:0;flex:1;color:#46574c;padding:7px 5px;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
 '.sian-section-select.active{border-color:#83aa8a;background:#e8f4e8;font-weight:bold}'+
 '.sian-section-actions{display:flex;gap:2px}.sian-section-actions button{border:1px solid #ced8cf;background:#f3f6f2;border-radius:5px;min-width:26px;height:30px;font-size:13px}'+
 '.sian-product-extra{border-top:2px solid #bfd4bf;margin:22px 0;padding:13px 0}.sian-product-extra .hint{line-height:1.6}.sian-sales-steps{border-left:3px solid #c3a36b;padding:7px 13px;margin:16px 0;background:#f8f6ed;font-size:13px}'+
 '@media(max-width:500px){.sian-form-grid{grid-template-columns:1fr}.sian-add-row{flex-wrap:wrap}}';document.head.append(style);
}
function selectSection(ref,focusKey='',options={}){
 init();const sec=state.sections.find(s=>s.id===ref||s.type===ref);
 if(!sec){notice('Could not find section: '+ref);return}
 currentSection=sec.id;showStep('sections');renderSectionList();renderSectionEditor();
 const editor=$('#sianSectionEditor');
 const sidebar=$('.editor');
 if(sidebar&&!options.skipScroll){if(window.matchMedia('(max-width:980px)').matches)editor.scrollIntoView({block:'start',behavior:'smooth'});else{const top=editor.getBoundingClientRect().top-sidebar.getBoundingClientRect().top+sidebar.scrollTop-16;sidebar.scrollTo({top,behavior:'smooth'})}}
 const field=focusKey?editor.querySelector('[data-section-key="'+focusKey+'"]'):editor.querySelector('input:not([type="file"]),textarea');
 if(field&&!options.skipFocus)setTimeout(()=>{field.focus({preventScroll:true});field.classList.add('sian-input-target');setTimeout(()=>field.classList.remove('sian-input-target'),1400)},180);
}

function sectionOf(ref){init();return state.sections.find(x=>x.type===ref||x.id===ref)}
function updateText(ref,key,value,{redraw=true}={}){
 const next=String(value??'').replace(/\r/g,'').slice(0,2400);
 if(ref==='identity'){
  if(!['brand','english','story','lineId'].includes(key))return false;
  state.config[key]=next;const input=document.getElementById(key);if(input)input.value=next;
 }else if(String(ref).startsWith('product:')){
  const id=String(ref).slice(8),p=state.products.find(p=>String(p.id)===id);
  if(!p||!['title','english','description','price'].includes(key))return false;
  if(key==='price'){const amount=Number(next.replace(/[฿,\s]/g,''));if(!Number.isFinite(amount)||amount<0)return false;p.price=amount}
  else p[key]=next;
  redrawProducts();
 }else{
  const sec=sectionOf(ref);if(!sec)return false;
  if(sec.type==='hero'&&['eyebrowTh','eyebrowEn','firstTh','secondTh','firstEn','secondEn','leadTh','leadEn','primaryTh','primaryEn','secondaryTh','secondaryEn'].includes(key)){
   if(!sec.hero)sec.hero={...HERO_DEFAULTS};sec.hero[key]=next;
  }else if(['headlineTh','headlineEn','subtextTh','subtextEn'].includes(key)){
   if(!sec.copy)sec.copy={...(SECTION_COPY_DEFAULTS[sec.type]||{})};sec.copy[key]=next;
  }else if(['title','text'].includes(key))sec[key]=next;
  else return false;
  if(sec.id===currentSection)renderSectionEditor();
 }
 if(redraw)change();else {persist();review()}
 return true;
}
function updateSectionDesign(ref,key,value){
 const sec=sectionOf(ref);if(!sec)return false;
 const allowed=['bg','card','text','headingColor','headingSize','padding','radius','width','align','decoration','buttonRadius'];
 if(!allowed.includes(key))return false;
 sec.style=sectionStyle(sec.style);
 if(['bg','card','text','headingColor'].includes(key)){
  if(!/^#[a-f0-9]{6}$/i.test(value))return false;
  sec.style[key]=value;if(key==='bg')sec.style._colorBg=true;if(key==='text')sec.style._colorText=true;if(key==='card')sec.style._customCard=true;
 }else if(key==='align'){
  if(!['left','center','right'].includes(value))return false;sec.style.align=value;sec.style._customAlign=true;
 }else if(key==='decoration'){
  if(!['none','lines','dots'].includes(value))return false;sec.style.decoration=value;
 }else{
  const ranges={headingSize:[22,84],padding:[16,160],radius:[0,50],width:[540,1600],buttonRadius:[0,40]};
  const n=Number(value),r=ranges[key];if(!Number.isFinite(n)||n<r[0]||n>r[1])return false;sec.style[key]=n;const flags={padding:'_customPadding',width:'_customWidth',radius:'_customRadius',buttonRadius:'_customButtonRadius'};if(flags[key])sec.style[flags[key]]=true;
 }
 if(sec.id===currentSection)renderSectionEditor();
 change();return true;
}
function refresh(){
 init();$$('[data-design]').forEach(input=>{const key=input.dataset.design;input.value=state.design[key]??DEFAULT_STYLE[key];const small=input.parentElement.querySelector('small');if(small)small.textContent=input.value});
 for(const [id,key] of [['#sianSetupFee','setupFee'],['#sianMonthlyFee','monthlyFee'],['#sianCheckoutUrl','checkoutUrl'],['#sianBillingEmail','email']]){const input=$(id);if(input)input.value=state.sales[key]??''}
 const domain=$('#sianSiteUrl');if(domain)domain.value=state.config.siteUrl||'';
 renderSectionList();renderSectionEditor();updateProductShare();
}
init();css();renderLookControls();buildProductExtras();publishSiteUrl();buildSectionUI();addSaleStep();refresh();
window.SianStudio={init,refresh,selectSection,updateText,updateSectionDesign,sectionOf,productSlug,productUrl,getCaption,copyText,DEFAULT_SECTIONS,DEFAULT_STYLE,themeCss};
})();