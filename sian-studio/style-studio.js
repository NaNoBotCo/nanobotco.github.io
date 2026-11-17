/* Sian Studio v1.5 visual Style Lab. */
(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const defaults={headingScale:100,buttonRadius:6,heroSplit:50,heroGap:26,cardGap:20,cardBorder:0,productImageMode:'contain',letterSpacing:0,bodyLineHeight:1.65,ornament:'none',buttonStyle:'solid'};
const PRESETS=[
 {id:'museum',name:'Museum Ivory',th:'พิพิธภัณฑ์',description:'Quiet, collectible, editorial',colors:['#bb9064','#f7f3eb','#252925','#fffdfa','#202a25'],headingFont:'serif',bodyFont:'sans',cardRadius:8,headingScale:112,sectionSpacing:84,buttonRadius:3},
 {id:'teak',name:'Northern Teak',th:'ไม้สักล้านนา',description:'Rich timber and old gold',colors:['#bf8954','#ede4d5','#302b23','#f9f2e8','#302e25'],headingFont:'serif',bodyFont:'system',cardRadius:12,headingScale:109,sectionSpacing:78,buttonRadius:7},
 {id:'indigo',name:'Indigo Archive',th:'คราม',description:'Cool, scholarly, precise',colors:['#9cacce','#edf1f5','#203040','#ffffff','#192d48'],headingFont:'serif',bodyFont:'sans',cardRadius:10,headingScale:105,sectionSpacing:74,buttonRadius:5},
 {id:'jade',name:'Jade & Brass',th:'หยกและทอง',description:'Forest green with antique brass',colors:['#d1a66b','#edf0e8','#233f38','#ffffff','#163b34'],headingFont:'serif',bodyFont:'system',cardRadius:16,headingScale:106,sectionSpacing:80,buttonRadius:9},
 {id:'copper',name:'Copper Coin',th:'เหรียญทองแดง',description:'Warm copper, parchment, texture',colors:['#bc754b','#f1e7dd','#422d25','#fffaf4','#3c2c28'],headingFont:'serif',bodyFont:'sans',cardRadius:4,headingScale:111,sectionSpacing:74,buttonRadius:3},
 {id:'ink',name:'Black Lacquer',th:'รักดำ',description:'Modern premium, minimalist',colors:['#d3b68b','#e9e6e0','#1e2022','#ffffff','#171919'],headingFont:'sans',bodyFont:'sans',cardRadius:2,headingScale:112,sectionSpacing:95,buttonRadius:2},
 {id:'rose',name:'Rose Gold',th:'กุหลาบ',description:'Soft, warm, generous',colors:['#ba887d','#f9f2ee','#493b3d','#fffefd','#443434'],headingFont:'serif',bodyFont:'sans',cardRadius:24,headingScale:100,sectionSpacing:83,buttonRadius:24},
 {id:'blue',name:'Collector Blue',th:'น้ำเงินขาว',description:'Clear, compact, highly legible',colors:['#4b7ca3','#f6f9fb','#263746','#ffffff','#163149'],headingFont:'sans',bodyFont:'system',cardRadius:9,headingScale:99,sectionSpacing:54,buttonRadius:7}
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
 state.design={...state.design,accent,background,ink,surface,nav,headingFont:p.headingFont,bodyFont:p.bodyFont,cardRadius:p.cardRadius,headingScale:p.headingScale,sectionSpacing:p.sectionSpacing,buttonRadius:p.buttonRadius,preset:id};
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
 lab.innerHTML='<h3>Choose a look · เลือกสไตล์</h3><p class="hint">Tap a ready-made design, then fine-tune. All changes appear on the live website.</p><div class="sian-preset-grid" id="sianPresetGrid"></div><h3>Typography & spacing · ตัวอักษรและระยะห่าง</h3><div class="sian-font-choices" id="sianFontChoices"></div><div class="sian-layout-choices" id="sianDensityChoices"></div><details class="sian-style-detail"><summary>🎛 More style choices · ปรับละเอียด</summary><div id="sianStyleAdvanced"></div></details>';
 const oldGrid=pane.querySelector('.theme-grid');
 if(oldGrid){oldGrid.hidden=true;oldGrid.before(lab)}else pane.insertBefore(lab,pane.querySelector('.row-buttons'));
 for(const p of PRESETS){
  const b=document.createElement('button');b.type='button';b.className='sian-preset';b.dataset.preset=p.id;b.setAttribute('aria-pressed','false');b.title=p.description;
  b.innerHTML='<span class="sian-preset-preview" style="background:'+p.colors[1]+'"><span style="background:'+p.colors[4]+';color:'+p.colors[0]+'">✺</span><i style="color:'+p.colors[2]+';font-family:'+(p.headingFont==='serif'?'Georgia,serif':'system-ui')+'">Aa</i></span><span class="sian-swatch-row">'+p.colors.map(c=>'<span style="background:'+c+'"></span>').join('')+'</span><b>'+p.name+'</b><small>'+p.th+'</small>';
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
 sec.style={...sec.style,bg:p.bg,card:p.card,text:p.text,headingColor:p.headingColor};
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
 if(divider)divider.before(quick);else box.append(quick);
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