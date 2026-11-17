/* Sian Studio v1.5 visual Style Lab. */
(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const defaults={headingScale:100,buttonRadius:6,heroSplit:50,heroGap:26,cardGap:20,cardBorder:0,productImageMode:'contain',letterSpacing:0,bodyLineHeight:1.65,ornament:'none',buttonStyle:'solid'};
const PRESETS=[
 {
  "id": "archive",
  "name": "Provenance",
  "th": "ทะเบียนของสะสม",
  "description": "Museum catalogue · index rules · restrained photographs",
  "signature": "CATALOGUE",
  "colors": [
   "#6E342B",
   "#F2EBDD",
   "#22251F",
   "#FFFCF4",
   "#202820"
  ],
  "headingFont": "serif",
  "bodyFont": "sans",
  "cardRadius": 0,
  "headingScale": 122,
  "sectionSpacing": 94,
  "buttonRadius": 0,
  "heroSplit": 45,
  "cardGap": 20,
  "productColumns": 3
 },
 {
  "id": "noir",
  "name": "Naga Noir",
  "th": "นาคนัวร์",
  "description": "Cinema-dark · collector spotlights · dramatic images",
  "signature": "CINEMATIC",
  "colors": [
   "#EDB96A",
   "#15121B",
   "#F4EDE1",
   "#24202C",
   "#090A12"
  ],
  "headingFont": "serif",
  "bodyFont": "sans",
  "cardRadius": 14,
  "headingScale": 136,
  "sectionSpacing": 112,
  "buttonRadius": 18,
  "heroSplit": 58,
  "cardGap": 26,
  "productColumns": 2
 },
 {
  "id": "auction",
  "name": "Auction Signal",
  "th": "ตลาดประมูล",
  "description": "Bold trading floor · tight labels · prices upfront",
  "signature": "MARKET",
  "colors": [
   "#B62825",
   "#FFFFFF",
   "#15171A",
   "#F5F6F4",
   "#14213C"
  ],
  "headingFont": "sans",
  "bodyFont": "sans",
  "cardRadius": 0,
  "headingScale": 132,
  "sectionSpacing": 48,
  "buttonRadius": 0,
  "heroSplit": 60,
  "cardGap": 0,
  "productColumns": 4
 },
 {
  "id": "lanna",
  "name": "Lanna Letterpress",
  "th": "พิมพ์ไม้ล้านนา",
  "description": "Ink-and-paper · stamps · carved borders",
  "signature": "WOODBLOCK",
  "colors": [
   "#9A3421",
   "#F1DFAF",
   "#2B291F",
   "#FFF5D9",
   "#3A3426"
  ],
  "headingFont": "serif",
  "bodyFont": "serif",
  "cardRadius": 2,
  "headingScale": 112,
  "sectionSpacing": 92,
  "buttonRadius": 3,
  "heroSplit": 46,
  "cardGap": 24,
  "productColumns": 3
 },
 {
  "id": "lab",
  "name": "Artifact Lab",
  "th": "ห้องแล็บพระเครื่อง",
  "description": "High-tech archive · specimen labels · electric focus",
  "signature": "LABORATORY",
  "colors": [
   "#B9FC65",
   "#0A1821",
   "#E1FAF1",
   "#142B35",
   "#061019"
  ],
  "headingFont": "mono",
  "bodyFont": "sans",
  "cardRadius": 5,
  "headingScale": 111,
  "sectionSpacing": 82,
  "buttonRadius": 3,
  "heroSplit": 52,
  "cardGap": 15,
  "productColumns": 3
 },
 {
  "id": "porcelain",
  "name": "Porcelain Gallery",
  "th": "ครามขาว",
  "description": "Blue-and-white gallery · gallery arches · calm whitespace",
  "signature": "GALLERY",
  "colors": [
   "#174E91",
   "#F7FAFF",
   "#132E52",
   "#FFFFFF",
   "#FFFFFF"
  ],
  "headingFont": "serif",
  "bodyFont": "sans",
  "cardRadius": 30,
  "headingScale": 120,
  "sectionSpacing": 125,
  "buttonRadius": 30,
  "heroSplit": 50,
  "cardGap": 32,
  "productColumns": 3
 },
 {
  "id": "broadcast",
  "name": "Live Counter",
  "th": "ไลฟ์ขายพระ",
  "description": "Social video first · LIVE indicators · clean product offers",
  "signature": "ON AIR",
  "colors": [
   "#C51038",
   "#F7F9FB",
   "#161D2B",
   "#FFFFFF",
   "#101C34"
  ],
  "headingFont": "sans",
  "bodyFont": "sans",
  "cardRadius": 10,
  "headingScale": 122,
  "sectionSpacing": 56,
  "buttonRadius": 9,
  "heroSplit": 43,
  "cardGap": 16,
  "productColumns": 3
 },
 {
  "id": "kinetic",
  "name": "Kinetic Pop",
  "th": "ของเล่นหมุนได้",
  "description": "Expressive geometry · playful motion · fidget-spinner personality",
  "signature": "PLAYFUL",
  "colors": [
   "#6737C2",
   "#F8FCEB",
   "#192A20",
   "#FFFFFF",
   "#281B4B"
  ],
  "headingFont": "sans",
  "bodyFont": "system",
  "cardRadius": 24,
  "headingScale": 137,
  "sectionSpacing": 92,
  "buttonRadius": 28,
  "heroSplit": 52,
  "cardGap": 24,
  "productColumns": 3
 }
];
const SECTION_PRESETS=[
 {id:'paper',name:'Paper',bg:'#f6f1e8',card:'#ffffff',text:'#2a2f29',headingColor:'#3f4339'},
 {id:'night',name:'Night',bg:'#1d2928',card:'#354740',text:'#eee6d6',headingColor:'#f1cca0'},
 {id:'gold',name:'Gold',bg:'#e9d8b8',card:'#fff9e8',text:'#403022',headingColor:'#8b5b2d'},
 {id:'jade',name:'Jade',bg:'#d8e9db',card:'#fafffa',text:'#264637',headingColor:'#255943'},
 {id:'blue',name:'Indigo',bg:'#e4eaf3',card:'#ffffff',text:'#263c52',headingColor:'#355d92'},
 {id:'clear',name:'White',bg:'#ffffff',card:'#ffffff',text:'#26302a',headingColor:'#26302a'}
];
const num=(v,lo,hi,fallback)=>Number.isFinite(Number(v))?Math.max(lo,Math.min(hi,Number(v))):fallback;
const hex=(v,fallback)=>/^#[a-f0-9]{6}$/i.test(String(v))?v:fallback;
function ensure(){state.design={...defaults,...state.design};if(!Array.isArray(state.sections))state.sections=[]}
function designCss(){
 ensure();const d=state.design,ratio=num(d.heroSplit,35,65,50),gap=num(d.heroGap,0,95,26),scale=num(d.headingScale,65,155,100);
 const hsize=Math.round(62*scale/100),radius=num(d.buttonRadius,0,45,6),cardGap=num(d.cardGap,0,70,20),border=num(d.cardBorder,0,5,0);
 const spacing=num(d.letterSpacing,-1,4,0),lineHeight=num(d.bodyLineHeight,1.2,2.1,1.65);
 const accent=hex(d.accent,'#c6a16d'),nav=hex(d.nav,'#14130f'),ink=hex(d.ink,'#282921'),surface=hex(d.surface,'#fffdf9');
 const crop=d.productImageMode==='cover'?'cover':'contain';
 const decor=d.ornament==='lines'?'repeating-linear-gradient(125deg,transparent 0 28px,rgba(143,116,71,.055) 29px 30px)':d.ornament==='dots'?'radial-gradient(circle,rgba(143,116,71,.11) 1px,transparent 1.5px)':'none';
 let css=':root{--sian-accent:'+accent+';--sian-nav:'+nav+';--sian-ink:'+ink+';--sian-surface:'+surface+'}'+
 '.hero{grid-template-columns:minmax(0,'+ratio+'fr) minmax(0,'+(100-ratio)+'fr)!important;gap:'+gap+'px!important}'+
 '.hero-copy h1{font-size:clamp(35px,'+hsize+'px,110px)!important;letter-spacing:'+spacing+'px!important}'+
 '.hero-lead,.story-copy p,.sian-extra p{line-height:'+lineHeight+'!important}'+
 '.hero-actions .btn,.product-actions button,.btn-gold,.newsletter-form button{border-radius:'+radius+'px!important}'+
 '.product-grid{gap:'+cardGap+'px!important}.product-card{border:'+border+'px solid '+accent+'!important}'+
 '.product-art img,.detail-art img{object-fit:'+crop+'!important}'+
 'body{background-image:'+decor+'!important;background-size:'+(d.ornament==='dots'?'24px 24px':'auto')+'!important}';
 if(d.buttonStyle==='outline')css+='.hero-actions .btn-gold{background:transparent!important;color:'+ink+'!important;border:2px solid '+accent+'!important}';
 else if(d.buttonStyle==='soft')css+='.hero-actions .btn-gold{background:'+surface+'!important;color:'+ink+'!important;box-shadow:0 4px 20px #0001!important}';
 else css+='.hero-actions .btn-gold{background:'+nav+'!important;color:#f9e9c8!important}';
 css+='@media(max-width:760px){.hero{grid-template-columns:1fr!important;gap:24px!important}.hero-copy h1{font-size:clamp(36px,'+Math.round(hsize*.77)+'px,67px)!important}}';
 return css;
}
const original=replaceStorefront;replaceStorefront=function(){const page=original();return page.replace('</style>',designCss()+'</style>')};
function refreshControls(){
 $$('[data-style-key]').forEach(input=>{const key=input.dataset.styleKey;input.value=state.design[key]??defaults[key];const val=input.parentElement.querySelector('small');if(val)val.textContent=String(input.value)});
 $$('[data-design]').forEach(input=>{const key=input.dataset.design,val=state.design[key];if(val!==undefined){input.value=val;const small=input.parentElement.querySelector('small');if(small)small.textContent=String(val)}});
 $$('.sian-preset').forEach(b=>{const active=b.dataset.preset===state.design.preset;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
}
function applyPreset(id){
 const p=PRESETS.find(x=>x.id===id);if(!p)return;
 const [accent,background,ink,surface,nav]=p.colors;
 state.design={...state.design,accent,background,ink,surface,nav,headingFont:p.headingFont,bodyFont:p.bodyFont,cardRadius:p.cardRadius,headingScale:p.headingScale,sectionSpacing:p.sectionSpacing,buttonRadius:p.buttonRadius,heroSplit:p.heroSplit,cardGap:p.cardGap,productColumns:p.productColumns,preset:id,direction:id,buttonStyle:'solid',ornament:'none',cardBorder:0};
 refreshControls();change();
}
function addControl(label,type,key,choices,range){
 const row=document.createElement('label');row.className='sian-style-field';
 const title=document.createElement('span');title.textContent=label;row.append(title);
 const input=document.createElement(type==='select'?'select':'input');input.dataset.styleKey=key;
 if(type==='select')for(const c of choices){const opt=document.createElement('option');opt.value=c[0];opt.textContent=c[1];input.append(opt)}
 else if(type==='range'){input.type='range';input.min=range[0];input.max=range[1];input.step=range[2]}
 else input.type='color';
 input.value=state.design[key]??defaults[key]??'';row.append(input);
 const val=document.createElement('small');if(type==='range'){val.textContent=input.value;row.append(val)}
 input.oninput=()=>{state.design[key]=type==='range'?Number(input.value):input.value;state.design.preset='custom';if(type==='range')val.textContent=input.value;refreshControls();change()};
 return row;
}
function styleLook(){
 const pane=$('#pane-look');if(!pane)return;
 const lab=document.createElement('section');lab.className='sian-style-lab';
 lab.innerHTML='<h3>Choose an art direction · เลือกบุคลิกของร้าน</h3><p class="hint">Eight genuinely different storefronts, not eight recolors. Every preset uses tested high-contrast text, buttons and menus.</p><div class="sian-preset-grid" id="sianPresetGrid"></div><h3>Typography & spacing · ตัวอักษรและระยะห่าง</h3><div class="sian-font-choices" id="sianFontChoices"></div><div class="sian-layout-choices" id="sianDensityChoices"></div><details class="sian-style-detail"><summary>🎛 More style choices · ปรับละเอียด</summary><div id="sianStyleAdvanced"></div></details>';
 const oldGrid=pane.querySelector('.theme-grid');
 if(oldGrid){oldGrid.hidden=true;oldGrid.before(lab)}else pane.insertBefore(lab,pane.querySelector('.row-buttons'));
 for(const p of PRESETS){
  const b=document.createElement('button');b.type='button';b.className='sian-preset';b.dataset.preset=p.id;b.setAttribute('aria-pressed','false');b.title=p.description;
  b.innerHTML='<span class="sian-preset-preview sian-mock-'+p.id+'" style="background:'+p.colors[1]+';color:'+p.colors[2]+'"><span class="sian-mock-top">'+p.signature+'</span><span class="sian-mock-main"><i class="sian-mock-type">Aa</i><i class="sian-mock-art">✺</i></span><span class="sian-mock-lines"><i></i><i></i><i></i></span></span><span class="sian-swatch-row">'+p.colors.map(c=>'<span style="background:'+c+'"></span>').join('')+'</span><b>'+p.name+'</b><small>'+p.th+' · '+p.description+'</small>';
  b.onclick=()=>applyPreset(p.id);lab.querySelector('#sianPresetGrid').append(b);
 }
 const fontBar=lab.querySelector('#sianFontChoices');
 for(const [name,th,headingFont,bodyFont,sample] of [
 ['Classical serif','ดั้งเดิม','serif','sans','Aa'],['Modern clear','โมเดิร์น','sans','sans','Aa'],['Thai heritage','ล้านนา','serif','system','กข']
 ]){
  const btn=document.createElement('button');btn.type='button';btn.className='sian-font-chip';
  btn.innerHTML='<strong style="font-family:'+(headingFont==='serif'?'Georgia,serif':'system-ui')+'">'+sample+'</strong><span>'+name+'<small>'+th+'</small></span>';
  btn.onclick=()=>{state.design.headingFont=headingFont;state.design.bodyFont=bodyFont;state.design.preset='custom';refreshControls();change()};fontBar.append(btn);
 }
 const density=lab.querySelector('#sianDensityChoices');
 for(const [name,th,spacing,gap] of [['Compact','กระชับ',45,12],['Balanced','สมดุล',72,20],['Spacious','โปร่ง',105,32]]){
  const b=document.createElement('button');b.type='button';b.className='sian-density-chip';b.textContent=name+' · '+th;
  b.onclick=()=>{state.design.sectionSpacing=spacing;state.design.cardGap=gap;state.design.preset='custom';refreshControls();change()};density.append(b);
 }
 const fields=[
 ['Headline size','range','headingScale',null,[65,155,5]],['Hero photo / text balance','range','heroSplit',null,[35,65,5]],
 ['Space between hero columns','range','heroGap',null,[0,95,5]],['Button corner roundness','range','buttonRadius',null,[0,45,1]],
 ['Spacing between amulets','range','cardGap',null,[0,70,2]],['Border around product cards','range','cardBorder',null,[0,5,1]],
 ['Letter spacing · headline','range','letterSpacing',null,[-1,4,.25]],['Line spacing · descriptions','range','bodyLineHeight',null,[1.2,2.1,.05]],
 ['Image crop mode','select','productImageMode',[['contain','Show whole item'],['cover','Fill the frame']]],
 ['Button appearance','select','buttonStyle',[['solid','Solid'],['outline','Outline'],['soft','Soft']]],
 ['Background ornament','select','ornament',[['none','Plain'],['lines','Fine lines'],['dots','Subtle dots']]]
 ];
 for(const row of fields)lab.querySelector('#sianStyleAdvanced').append(addControl(...row));
 const existing=pane.querySelector('.sian-control-wrap');
 if(existing){const details=document.createElement('details');details.className='sian-style-detail';const summary=document.createElement('summary');summary.textContent='⚙ Expert controls · Colors, shadows, widths';details.append(summary,existing);lab.append(details)}
 refreshControls();
}
function sectionPreset(section,presetId){
 const p=SECTION_PRESETS.find(x=>x.id===presetId);if(!p)return;
 const sec=window.SianStudio?.sectionOf?.(section.id);if(!sec)return;
 sec.style={...sec.style,bg:p.bg,card:p.card,text:p.text,headingColor:p.headingColor,_colorBg:true,_colorText:true};
 window.SianStudio?.selectSection?.(sec.id,'',{skipFocus:true});change();
}
function decorateSectionEditor(box,section){
 if(box.querySelector('.sian-quick-style'))return;
 const quick=document.createElement('section');quick.className='sian-quick-style';quick.id='sianQuickStyle';
 quick.innerHTML='<h4>🎨 Look of this section / สีเฉพาะส่วน</h4><p class="hint">Pick a section look, then fine-tune below.</p><div class="sian-section-presets"></div><div class="sian-section-quick-grid"></div>';
 const grid=quick.querySelector('.sian-section-presets');
 for(const p of SECTION_PRESETS){
  const btn=document.createElement('button');btn.type='button';btn.className='sian-mini-preset';btn.title=p.name;
  btn.innerHTML='<span style="background:'+p.bg+';color:'+p.headingColor+'">Aa</span><small>'+p.name+'</small>';
  btn.onclick=()=>sectionPreset(section,p.id);grid.append(btn);
 }
 const advanced=quick.querySelector('.sian-section-quick-grid');
 section.style={bg:'#f7f3e8',card:'#ffffff',text:'#292c27',...section.style};
 for(const [key,label,type,min,max,step] of [
 ['headingColor','Heading color','color'],['headingSize','Heading size (px)','range',22,84,2],
 ['buttonRadius','Button corners','range',0,40,2],['decoration','Ornament','select']
 ]){
  const f=document.createElement('label');f.className='field';const title=document.createElement('span');title.textContent=label;f.append(title);
  const input=document.createElement(type==='select'?'select':'input');input.dataset.sectionStyle=key;
  if(type==='select'){for(const [value,label] of [['none','None'],['lines','Lines'],['dots','Dots']]){const o=document.createElement('option');o.value=value;o.textContent=label;input.append(o)}}
  else{input.type=type;if(type==='range'){input.min=min;input.max=max;input.step=step}}
  input.value=key==='headingColor'?section.style.headingColor||'#43392a':key==='headingSize'?section.style.headingSize||46:key==='buttonRadius'?section.style.buttonRadius||6:section.style.decoration||'none';
  f.append(input);const val=document.createElement('small');if(type==='range'){val.textContent=input.value;f.append(val)}
  input.oninput=()=>{section.style[key]=type==='range'?Number(input.value):input.value;if(type==='range')val.textContent=input.value;change()};advanced.append(f);
 }
 const divider=[...box.querySelectorAll('h3')].find(x=>x.textContent.includes('Section-specific style'));
 if(divider){
  divider.before(quick);
  const details=document.createElement('details');details.className='sian-style-detail';
  const sum=document.createElement('summary');sum.textContent='⚙ Exact spacing, widths & section colors · สำหรับขั้นสูง';
  details.append(sum);
  while(divider.nextSibling)details.append(divider.nextSibling);
  details.insertBefore(divider,sum.nextSibling);
  quick.after(details);
 }else box.append(quick);
 const reset=document.createElement('button');reset.type='button';reset.className='btn';
 reset.textContent='↺ Reset this section’s look';
 reset.onclick=()=>{const sec=window.SianStudio?.sectionOf?.(section.id);if(!sec)return;sec.style={};window.SianStudio.selectSection(sec.id,'',{skipFocus:true});change()};
 quick.append(reset);
 const meter=document.createElement('div');meter.className='sian-section-contrast';quick.append(meter);
 const updateMeter=()=>{
  const engine=window.SianArt;if(!engine?.contrast)return;
  const bg=section.style.bg||'#f7f3e8',body=section.style.text||'#292c27',heading=section.style.headingColor||body;
  const r1=engine.contrast(bg,body),r2=engine.contrast(bg,heading),valid=r1>=4.5&&r2>=4.5;
  meter.replaceChildren();
  const result=document.createElement('strong');result.textContent=(valid?'✓':'⚠')+' Section readability: text '+r1.toFixed(2)+':1 · heading '+r2.toFixed(2)+':1';
  result.style.color=valid?'#27623f':'#a03a30';meter.append(result);
  if(!valid){const fix=document.createElement('button');fix.type='button';fix.className='btn';fix.textContent='Fix text contrast';
   fix.onclick=()=>{
    const dark='#13221e',light='#ffffff';
    const preferred=engine.contrast(bg,dark)>engine.contrast(bg,light)?dark:light;
    if(r1<4.5){section.style.text=preferred;section.style._colorText=true}
    if(r2<4.5)section.style.headingColor=preferred;
    window.SianStudio?.selectSection?.(section.id,'',{skipFocus:true});change();
   };meter.append(fix)}
 };
 updateMeter();
 box.addEventListener('input',()=>setTimeout(updateMeter,70),{once:false});
}
function inspect(ref,{quiet=false}={}){
 const api=window.SianStudio;if(!api?.sectionOf(ref))return;
 if(!quiet){api.selectSection(ref,'',{skipFocus:true});requestAnimationFrame(()=>{
  const editor=document.querySelector('.editor'),target=document.querySelector('#sianQuickStyle');if(!editor||!target)return;
  editor.scrollTo({top:target.getBoundingClientRect().top-editor.getBoundingClientRect().top+editor.scrollTop-10,behavior:'smooth'});
 })}
}
ensure();window.SianStyle={inspect,decorateSectionEditor,applyPreset,refresh:refreshControls,PRESETS,designCss};
styleLook();window.SianStudio?.refresh?.();
})();