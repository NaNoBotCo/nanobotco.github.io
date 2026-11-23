import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import worker from '../src/worker.js';

const source=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
function app(){
 const els=new Map(),handlers={};
 const el=id=>{if(!els.has(id))els.set(id,{innerHTML:'',textContent:'',value:'',style:{},classList:{add(){},remove(){},toggle(){}},reportValidity:()=>true,showModal(){},close(){}});return els.get(id)};
 const ctx=vm.createContext({console,structuredClone,crypto:{randomUUID:()=>'id-'+Math.random().toString(36).slice(2)},setTimeout:()=>1,clearTimeout(){},window:{addEventListener(){},print(){ctx.printed=true}},document:{addEventListener:(k,f)=>handlers[k]=f,getElementById:el,querySelector:()=>null,querySelectorAll:()=>[]},confirm:()=>true,alert(m){throw Error('alert: '+m)},URL});
 const script=source.match(/<script>([\s\S]*?)<\/script>/)[1].replace('connectCloud();','globalThis.api={initial,ensureDefaults,totals,shippingQuote,applyShipping,nextNumber,newDoc,timeline,customerMatches,renderCustomers,renderCustomerPage,renderReceipts,renderSettings,renderEditor,renderDashboard,renderProducts,renderPricing,printReceipt,teamList,personName,state,setData(v){data=v},getData(){return data},setMe(m,t){me=m;team=t}};');
 vm.runInContext(script,ctx);return {a:ctx.api,el,ctx};
}
const line=(qty,unitPrice)=>({id:'l'+qty,productId:'',sku:'X',description:'Item',qty,unit:'vial',unitPrice,discount:0});

test('a desk without the supplier import shows no supplier-list copy',()=>{
 const {a}=app();const data=a.initial();a.setData(data);
 assert.doesNotMatch(a.renderDashboard(),/ChatGPT|supplier catalog/);assert.match(a.renderDashboard(),/Add products/);
 data.products.push({id:'p',sku:'BURGER',name:'Burger tray',spec:'',packCount:1,costTHBPack:0,costUSDPack:0});
 assert.doesNotMatch(a.renderProducts(),/Lemon Bottle|supplier cost list/);assert.doesNotMatch(a.renderPricing(),/Source PDF|29 Sep/);
 data.products.push({id:'s',sku:'TR5',name:'Supplier row',spec:'',packCount:10,costTHBPack:600,costUSDPack:20,sourceRow:5});
 assert.match(a.renderProducts(),/Lemon Bottle/);assert.match(a.renderPricing(),/Source PDF/);
});

test('shipping adds to the total and VAT is figured on items plus shipping',()=>{
 const {a}=app();const d={items:[line(10,100)],payments:[{amount:500}],shippingAmount:150,vatEnabled:true,vatRate:7};
 const t=a.totals(d);assert.equal(t.subtotal,1000);assert.equal(t.shipping,150);assert.equal(t.vat,80.5);assert.equal(t.total,1230.5);assert.equal(t.due,730.5);
 assert.equal(a.totals({items:[line(1,50)],payments:[]}).total,50,'documents without shipping are unchanged');
});

test('starter shipping options, currency pricing and free-over threshold',()=>{
 const {a}=app();const data=a.initial();a.setData(data);
 assert.equal(data.settings.shippingOptions.length,5);
 const old=a.initial();delete old.settings.shippingOptions;delete old.settings.receiptPrefix;old.settings.sellerName='Seller A';a.setData(old);a.ensureDefaults();
 assert.equal(old.settings.sellerName,'Seller A');assert.equal(old.settings.receiptPrefix,'RC');assert.equal(old.settings.shippingOptions[1].id,'ship-th-standard');
 const opt={priceTHB:100,priceUSD:3,freeOverTHB:2000,freeOverUSD:''};
 assert.equal(a.shippingQuote(opt,{currency:'THB',items:[line(1,500)]}),100);
 assert.equal(a.shippingQuote(opt,{currency:'THB',items:[line(4,500)]}),0);
 assert.equal(a.shippingQuote(opt,{currency:'USD',items:[line(400,500)]}),3);
 const d={...a.newDoc('invoice'),currency:'USD',items:[line(1,10)],shippingOptionId:'ship-intl-express'};a.applyShipping(d);
 assert.equal(d.shippingAmount,90);assert.equal(d.shippingMethod,'International express');assert.equal(d.shippingZone,'international');
 d.shippingManual=true;d.shippingAmount=70;a.applyShipping(d);assert.equal(d.shippingAmount,70,'a hand-set charge is not overwritten');
});

test('receipt numbers use their own prefix and sequence; receipt prints',()=>{
 const {a,el,ctx}=app();const data=a.initial();data.settings.sellerName='Seller';data.settings.sellerAddress='Addr';a.setData(data);
 assert.equal(a.nextNumber('receipt','2026-11-18'),'RC-2026-0001');assert.equal(a.nextNumber('receipt','2026-11-19'),'RC-2026-0002');assert.equal(a.nextNumber('invoice','2026-11-18'),'INV-2026-0001');
 const doc={...a.newDoc('invoice'),id:'inv',status:'issued',number:'INV-2026-0001',customerName:'Buyer',items:[line(10,100)],shippingAmount:100,shippingMethod:'Thailand standard',payments:[{id:'p1',receiptNumber:'RC-2026-0001',date:'2026-11-18',amount:600,method:'PromptPay'},{id:'p2',receiptNumber:'RC-2026-0002',date:'2026-11-19',amount:500,method:'Cash'}]};
 data.documents.push(doc);a.printReceipt(doc,'p2');const html=el('printMount').innerHTML;
 assert.match(html,/RC-2026-0002/);assert.match(html,/PAID IN FULL/);assert.match(html,/THB 600\.00/);assert.match(html,/Thailand standard/);assert(ctx.printed);
 assert.match(a.renderReceipts(),/RC-2026-0001/);
});

test('customer timeline, filters and pages',()=>{
 const {a}=app();const data=a.initial();a.setData(data);a.setMe({email:'beer@example.com',name:'Beer'},[{email:'nan@example.com',name:'NaN'},{email:'beer@example.com',name:'Beer'}]);
 const c={id:'c1',name:'North Clinic',stage:'lead',owner:'beer@example.com',nextFollowUp:'2026-01-01',activities:[{id:'a1',date:'2026-11-01',kind:'Call',text:'Asked for prices',by:'beer@example.com',at:'2026-11-01T03:00:00Z'}]};
 const other={id:'c2',name:'South Shop',activities:[]};data.customers.push(c,other);
 data.documents.push({id:'d1',type:'invoice',status:'issued',number:'INV-2026-0001',customerId:'c1',issueDate:'2026-11-05',currency:'THB',items:[line(10,100)],payments:[{id:'p',receiptNumber:'RC-2026-0001',date:'2026-11-06',amount:1000,by:'nan@example.com'}],delivery:{status:'shipped',shippedOn:'2026-11-07',tracking:'TH123'}});
 const tl=a.timeline(c);assert.deepEqual(tl.map(e=>e.kind),['Shipped','Payment','Invoice','Call']);
 a.state.custStage='lead';assert(a.customerMatches(c));assert(!a.customerMatches(other),'missing stage reads as Customer');
 a.state.custStage='all';a.state.custOwner='mine';assert(a.customerMatches(c));assert(!a.customerMatches(other));
 a.state.custOwner='none';assert(a.customerMatches(other));a.state.custOwner='all';a.state.custSearch='clinic';assert(a.customerMatches(c));assert(!a.customerMatches(other));a.state.custSearch='';
 const page=a.renderCustomerPage(c);assert.match(page,/TH123/);assert.match(page,/Asked for prices/);assert.match(page,/Beer/);
 assert.match(a.renderCustomers(),/Lead <span class="chip">1<\/span>/);
 assert.match(a.renderDashboard(),/North Clinic/,'overdue follow-up shows on the overview');
 assert.match(a.renderSettings(),/International express/);assert.match(a.renderSettings(),/Sign out on this device/);
 a.state.draft={...a.newDoc('invoice'),items:[line(1,10)]};assert.match(a.renderEditor(),/Shipping · optional/);
});

test('worker: team names, shipping totals, delivery after issue, receipt numbers',async()=>{
 const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../migrations/0001_initial.sql',import.meta.url),'utf8'));
 class Stmt{constructor(sql){this.sql=sql;this.args=[]}bind(...a){this.args=a;return this}first(){return db.prepare(this.sql).get(...this.args)||null}run(){const b=Number(db.prepare('SELECT total_changes() AS n').get().n);db.prepare(this.sql).run(...this.args);return {meta:{changes:Number(db.prepare('SELECT total_changes() AS n').get().n)-b}}}all(){return {results:db.prepare(this.sql).all(...this.args)}}}
 const keys=await webcrypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
 const jwk=await webcrypto.subtle.exportKey('jwk',keys.publicKey);jwk.kid='k';
 const oldFetch=globalThis.fetch;globalThis.fetch=async url=>{if(url==='https://t.cloudflareaccess.com/cdn-cgi/access/certs')return new Response(JSON.stringify({keys:[jwk]}));throw Error('fetch '+url)};
 const env={DB:{prepare:sql=>new Stmt(sql)},ASSETS:{fetch:async()=>new Response('x')},ACCESS_TEAM_DOMAIN:'t.cloudflareaccess.com',ACCESS_AUD:'aud',AUTHORIZED_EMAILS:'one@example.com,Two@example.com',TEAM_NAMES:'one@example.com=NaN'};
 const b64=v=>Buffer.from(v).toString('base64url'),now=Math.floor(Date.now()/1000);
 const h=b64(JSON.stringify({alg:'RS256',kid:'k'})),c=b64(JSON.stringify({iss:'https://t.cloudflareaccess.com',aud:'aud',exp:now+300,email:'one@example.com'}));
 const tok=h+'.'+c+'.'+b64(new Uint8Array(await webcrypto.subtle.sign('RSASSA-PKCS1-v1_5',keys.privateKey,new TextEncoder().encode(h+'.'+c))));
 const call=async(path,body)=>{const headers={'cf-access-jwt-assertion':tok};if(body){headers.origin='https://d.test';headers['content-type']='application/json'}const r=await worker.fetch(new Request('https://d.test'+path,{method:body?'PUT':'GET',headers,body:body?JSON.stringify(body):undefined}),env,{});return {status:r.status,data:await r.json()}};
 try{
  const s=await call('/api/session');assert.equal(s.data.name,'NaN');assert.deepEqual(s.data.team,[{email:'one@example.com',name:'NaN'},{email:'two@example.com',name:'two'}]);
  let rev=0;const put=async state=>{const r=await call('/api/workspace',{revision:rev,state});if(r.status===200)rev=r.data.revision;return r};
  const inv={id:'i',number:'INV-2026-0001',type:'invoice',status:'issued',salesChannel:'retail',currency:'THB',vatEnabled:true,vatRate:7,shippingAmount:100,shippingMethod:'Thailand standard',items:[{id:'l',qty:1,unitPrice:1000,discount:0}],payments:[]};
  const state={version:1,pricing:{wholesaleMOQ:10},settings:{shippingOptions:[{id:'s',priceTHB:100,priceUSD:3}]},products:[],customers:[{id:'c',name:'B',activities:[{id:'a',text:'hi'}]}],documents:[inv],sequences:{}};
  assert.equal((await put(state)).status,200);
  const paid=structuredClone(state);paid.documents[0].payments.push({id:'p1',receiptNumber:'RC-2026-0001',amount:1177});
  assert.equal((await put(paid)).status,200,'payment up to items + shipping + VAT (1,177) accepted');
  const over=structuredClone(paid);over.documents[0].payments.push({id:'p2',receiptNumber:'RC-2026-0002',amount:1});
  assert.equal((await put(over)).status,422,'payment beyond the total rejected');
  const shipped=structuredClone(paid);shipped.documents[0].delivery={status:'shipped',tracking:'TH1'};
  assert.equal((await put(shipped)).status,200,'delivery can be recorded after issue');
  const moved=structuredClone(shipped);moved.documents[0].shippingAmount=0;
  assert.equal((await put(moved)).status,409,'shipping charge is locked after issue');
  const dup=structuredClone(shipped);dup.documents.push({id:'j',number:'INV-2026-0002',type:'invoice',status:'issued',salesChannel:'retail',currency:'THB',items:[{id:'l',qty:1,unitPrice:10}],payments:[{id:'q',receiptNumber:'RC-2026-0001',amount:5}]});
  assert.equal((await put(dup)).status,422,'duplicate receipt number rejected');
  const neg=structuredClone(shipped);neg.documents.push({id:'k',type:'invoice',status:'draft',number:'',items:[],payments:[],shippingAmount:-5});
  assert.equal((await put(neg)).status,422,'negative shipping rejected');
  const badOpt=structuredClone(shipped);badOpt.settings.shippingOptions=[{id:'x',priceTHB:-1}];
  assert.equal((await put(badOpt)).status,422,'negative shipping option rejected');
 }finally{globalThis.fetch=oldFetch;db.close()}
});
