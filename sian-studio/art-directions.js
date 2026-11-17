/* Sian Studio 1.6 — semantic contrast tokens, audits and portable art-direction stylesheet.
   Inline tokens + sibling CSS ensure exact visual fidelity after exporting a site's ZIP. */
(function(){
'use strict';
const PALETTES={
 archive:{bg:'#F2EBDD',fg:'#22251F',surface:'#FFFCF4',surfaceText:'#22251F',nav:'#202820',navText:'#F7F1E6',accent:'#6E342B',accentText:'#FFFFFF',muted:'#4E5148',panel:'#E1D8C7',panelText:'#272921',line:'#776B59',image:'#C2B197',story:'#2A342B',storyText:'#F7EEE1',accentAlt:'#E1C594'},
 noir:{bg:'#15121B',fg:'#F4EDE1',surface:'#24202C',surfaceText:'#F4EDE1',nav:'#090A12',navText:'#F6E6CC',accent:'#EDB96A',accentText:'#17121C',muted:'#CEC3D1',panel:'#342A3D',panelText:'#F6EDE2',line:'#A78FA9',image:'#3B2A36',story:'#261D2E',storyText:'#F5E9D7',accentAlt:'#78515E'},
 auction:{bg:'#FFFFFF',fg:'#15171A',surface:'#F5F6F4',surfaceText:'#121519',nav:'#14213C',navText:'#FFFFFF',accent:'#B62825',accentText:'#FFFFFF',muted:'#343C45',panel:'#E8EDF3',panelText:'#182235',line:'#535A61',image:'#D8E2F1',story:'#14213C',storyText:'#FFFFFF',accentAlt:'#F1BB2B'},
 lanna:{bg:'#F1DFAF',fg:'#2B291F',surface:'#FFF5D9',surfaceText:'#29261E',nav:'#3A3426',navText:'#F9EBC9',accent:'#9A3421',accentText:'#FFFFFF',muted:'#504636',panel:'#E7C88E',panelText:'#35291F',line:'#65543B',image:'#C3A572',story:'#3A3426',storyText:'#F9EBC9',accentAlt:'#B58442'},
 lab:{bg:'#0A1821',fg:'#E1FAF1',surface:'#142B35',surfaceText:'#F0FFFB',nav:'#061019',navText:'#EDFCF8',accent:'#B9FC65',accentText:'#10200F',muted:'#BED5D9',panel:'#203D46',panelText:'#F1FFFF',line:'#769397',image:'#24444D',story:'#0C2630',storyText:'#EAFFF8',accentAlt:'#65C7D6'},
 porcelain:{bg:'#F7FAFF',fg:'#132E52',surface:'#FFFFFF',surfaceText:'#142E50',nav:'#FFFFFF',navText:'#153D6C',accent:'#174E91',accentText:'#FFFFFF',muted:'#355A7B',panel:'#E2EFF9',panelText:'#183757',line:'#7088A1',image:'#DCECF9',story:'#173F69',storyText:'#F7FAFF',accentAlt:'#8CABC9'},
 broadcast:{bg:'#F7F9FB',fg:'#161D2B',surface:'#FFFFFF',surfaceText:'#182034',nav:'#101C34',navText:'#F7FAFF',accent:'#C51038',accentText:'#FFFFFF',muted:'#394453',panel:'#E5ECF7',panelText:'#1B2E49',line:'#53677E',image:'#D9E3F1',story:'#162843',storyText:'#F7FAFF',accentAlt:'#4B87DA'},
 kinetic:{bg:'#F8FCEB',fg:'#192A20',surface:'#FFFFFF',surfaceText:'#1A2A21',nav:'#281B4B',navText:'#FFFFFF',accent:'#6737C2',accentText:'#FFFFFF',muted:'#375044',panel:'#DCEEC0',panelText:'#293321',line:'#566346',image:'#BEE4CF',story:'#281B4B',storyText:'#FFFFFF',accentAlt:'#F3C93B'}
};
function isHex(v){return /^#[a-f0-9]{6}$/i.test(String(v))}
function luminance(hex){
 const rgb=hex.replace('#','').match(/[a-f0-9]{2}/gi).map(x=>parseInt(x,16)/255);
 const l=rgb.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 return .2126*l[0]+.7152*l[1]+.0722*l[2];
}
function contrast(a,b){const A=luminance(a),B=luminance(b);return +((Math.max(A,B)+.05)/(Math.min(A,B)+.05)).toFixed(2)}
function readable(background,requested){
 if(isHex(requested)&&contrast(background,requested)>=4.5)return requested;
 const dark='#13221E',light='#FFFFFF';
 return contrast(background,dark)>=contrast(background,light)?dark:light;
}
const roles=[['Page text','fg','bg',4.5],['Product information','surfaceText','surface',4.5],['Navigation','navText','nav',4.5],['Primary button','accentText','accent',4.5],['Secondary text','muted','bg',4.5],['Info panel','panelText','panel',4.5],['Story section','storyText','story',4.5]];
function derive(id,design={}){
 const p=PALETTES[id];if(!p)return null;
 const bg=isHex(design.background)?design.background:p.bg;
 const surface=isHex(design.surface)?design.surface:p.surface;
 const nav=isHex(design.nav)?design.nav:p.nav;
 const accent=isHex(design.accent)?design.accent:p.accent;
 return {...p,bg,surface,nav,accent,
  fg:readable(bg,design.ink||p.fg),
  surfaceText:readable(surface,p.surfaceText),
  navText:readable(nav,p.navText),
  accentText:readable(accent,p.accentText),
  muted:readable(bg,p.muted)
 };
}
function audit(id,design={}){
 const p=derive(id,design);if(!p)return [];
 return roles.map(([label,ink,background,min])=>({label,ratio:contrast(p[ink],p[background]),minimum:min,passed:contrast(p[ink],p[background])>=min,text:p[ink],background:p[background]}));
}
function cssVars(id,design){
 const p=derive(id,design);if(!p)return '';
 const roleMap={bg:'bg',fg:'fg',surface:'surface',surfaceText:'surface-fg',nav:'nav',navText:'navfg',accent:'accent',accentText:'accentfg',muted:'muted',panel:'panel',panelText:'panelfg',line:'line',image:'image',story:'story',storyText:'storyfg',accentAlt:'accent2'};
 return ':root{'+Object.entries(roleMap).map(([key,name])=>'--ad-'+name+':'+p[key]).join(';')+'}';
}
const old=replaceStorefront;
replaceStorefront=function(){
 let html=old();
 const id=state.design?.direction||state.design?.preset;
 if(!PALETTES[id])return html;
 const meta='<link rel="stylesheet" href="art-directions.css">';
 html=html.replace('</head>',meta+'</head>');
 html=html.replace('</style>',cssVars(id,state.design||{})+'</style>');
 html=html.replace(/<html(\s[^>]*)?>/i,match=>match.replace(/>$/,' data-sian-art="'+id+'">'));
 return html;
};
function refresh(){
 const pane=document.getElementById('pane-look'),lab=pane?.querySelector('.sian-style-lab');
 if(!lab)return;
 let panel=document.getElementById('sianContrastPanel');
 if(!panel){panel=document.createElement('div');panel.id='sianContrastPanel';panel.className='sian-contrast-panel';lab.querySelector('.sian-style-detail')?.before(panel)}
 const id=state.design?.direction||state.design?.preset;
 const checks=audit(PALETTES[id]?id:'archive',state.design||{}),fails=checks.filter(x=>!x.passed);
 panel.replaceChildren();
 const title=document.createElement('strong');title.textContent=fails.length?'⚠ Adjust colors for readability':'✓ WCAG AA palette check';panel.append(title);
 for(const entry of checks){const row=document.createElement('div');row.className='sian-contrast-row';
  const left=document.createElement('span');left.textContent=entry.label;
  const value=document.createElement('b');value.textContent=entry.ratio.toFixed(2)+':1';value.className=entry.passed?'sian-contrast-pass':'sian-contrast-fail';
  row.append(left,value);panel.append(row);
 }
 const foot=document.createElement('p');foot.textContent='Theme text/controls: 4.5:1 or higher. Decorative graphics and uploaded photos require separate visual inspection.';panel.append(foot);
}
function mount(){
 const pane=document.getElementById('pane-look');
 if(!pane)return;
 pane.addEventListener('click',()=>setTimeout(refresh,100),true);
 pane.addEventListener('input',()=>setTimeout(refresh,100),true);
 refresh();
}
window.SianArt={PALETTES,contrast,derive,audit,cssVars,refresh};
mount();
})();