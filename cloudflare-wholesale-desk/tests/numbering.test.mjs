// Document numbers: SELLER-KIND-YEAR-NUMBER, LL-INV-2026-0002. The seller code comes from Settings or from the
// Worker (SELLER_CODE); a desk with none writes KIND-YEAR-NUMBER. One run per kind and year; a number issued earlier
// stays as it was. The Worker checks the shape of a number at the save that issues it.
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import worker from '../src/worker.js';

const source=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
function app(){
 const els=new Map(),alerts=[];
 const el=id=>{if(!els.has(id))els.set(id,{innerHTML:'',textContent:'',value:'',style:{},classList:{add(){},remove(){},toggle(){}},reportValidity:()=>true,showModal(){},close(){}});return els.get(id)};
 const ctx=vm.createContext({console,structuredClone,crypto:{randomUUID:()=>'id-'+Math.random().toString(36).slice(2)},setTimeout:()=>1,clearTimeout(){},window:{addEventListener(){},print(){}},document:{addEventListener(){},getElementById:el,querySelector:()=>null,querySelectorAll:()=>[]},confirm:()=>true,alert:m=>alerts.push(m),URL});
 const script=source.match(/<script>([\s\S]*?)<\/script>/)[1].replace('connectCloud();','globalThis.api={initial,ensureDefaults,nextNumber,peekNumber,sellerCode,renderSettings,setData(v){data=v},getData(){return data},setDesk(c){deskSeller=c}};');
 vm.runInContext(script,ctx);return {a:ctx.api,alerts};
}

test('a desk with a seller code puts it at the front of every number',()=>{
 const {a}=app();const data=a.initial();a.setData(data);a.setDesk('LL');
 assert.equal(a.sellerCode(),'LL');
 assert.equal(a.nextNumber('invoice','2026-11-23'),'LL-INV-2026-0001');
 assert.equal(a.nextNumber('invoice','2026-11-24'),'LL-INV-2026-0002');
 assert.equal(a.nextNumber('quote','2026-11-23'),'LL-QT-2026-0001');
 assert.equal(a.nextNumber('proforma','2026-11-23'),'LL-PI-2026-0001');
 assert.equal(a.nextNumber('receipt','2026-11-23'),'LL-RC-2026-0001');
 assert.equal(a.nextNumber('invoice','2027-01-02'),'LL-INV-2027-0001','each year starts at 0001');
 assert.equal(a.peekNumber('invoice','2026-12-01'),'LL-INV-2026-0003');assert.equal(a.peekNumber('invoice','2026-12-01'),'LL-INV-2026-0003','looking uses up no number');
});

test('the run carries on from numbers issued before the seller code',()=>{
 const {a}=app();const data=a.initial();data.sequences={'invoice-2026':1,'receipt-2026':1};a.setData(data);a.setDesk('LL');
 assert.equal(a.nextNumber('invoice','2026-11-23'),'LL-INV-2026-0002');assert.equal(a.nextNumber('receipt','2026-11-23'),'LL-RC-2026-0002');
});

test('Settings wins over the desk; a desk with no code writes kind, year, number',()=>{
 const {a}=app();const data=a.initial();a.setData(data);
 assert.equal(a.sellerCode(),'');assert.equal(a.nextNumber('invoice','2026-11-23'),'INV-2026-0001');
 a.setDesk('LL');data.settings.sellerCode='jm';assert.equal(a.sellerCode(),'JM');assert.equal(a.nextNumber('invoice','2026-11-23'),'JM-INV-2026-0002');
 data.settings.sellerCode='not a code';assert.equal(a.sellerCode(),'','a code that is not 2 to 4 letters or digits is left off');
 data.settings.invoicePrefix='ZZZ';data.settings.sellerCode='';assert.equal(a.nextNumber('invoice','2026-11-23'),'LL-INV-2026-0003','an old free prefix is not used');
});

test('Settings shows the seller code and the next numbers, not four free prefixes',()=>{
 const {a}=app();const data=a.initial();data.sequences={'invoice-2026':1};a.setData(data);a.setDesk('LL');
 const html=a.renderSettings(),y=new Date().getFullYear();
 assert.match(html,/name="sellerCode"[^>]*value="LL"/);assert.doesNotMatch(html,/invoicePrefix|quotePrefix|proformaPrefix|name="receiptPrefix"/);
 assert.match(html,new RegExp(`LL-RC-${y}-0001`));assert.match(html,new RegExp(`LL-QT-${y}-0001`));
 if(y===2026)assert.match(html,/LL-INV-2026-0002/);
});

test('the Worker hands out the desk code and checks a number when it is issued',async()=>{
 const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../migrations/0001_initial.sql',import.meta.url),'utf8'));
 class Stmt{constructor(sql){this.sql=sql;this.args=[]}bind(...a){this.args=a;return this}first(){return db.prepare(this.sql).get(...this.args)||null}run(){const b=Number(db.prepare('SELECT total_changes() AS n').get().n);db.prepare(this.sql).run(...this.args);return {meta:{changes:Number(db.prepare('SELECT total_changes() AS n').get().n)-b}}}all(){return {results:db.prepare(this.sql).all(...this.args)}}}
 const keys=await webcrypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
 const jwk=await webcrypto.subtle.exportKey('jwk',keys.publicKey);jwk.kid='k';
 const oldFetch=globalThis.fetch;globalThis.fetch=async url=>{if(url==='https://t.cloudflareaccess.com/cdn-cgi/access/certs')return new Response(JSON.stringify({keys:[jwk]}));throw Error('fetch '+url)};
 const env={DB:{prepare:sql=>new Stmt(sql)},ASSETS:{fetch:async()=>new Response('x')},ACCESS_TEAM_DOMAIN:'t.cloudflareaccess.com',ACCESS_AUD:'aud',AUTHORIZED_EMAILS:'one@example.com',SELLER_CODE:'LL'};
 const b64=v=>Buffer.from(v).toString('base64url'),now=Math.floor(Date.now()/1000);
 const h=b64(JSON.stringify({alg:'RS256',kid:'k'})),c=b64(JSON.stringify({iss:'https://t.cloudflareaccess.com',aud:'aud',exp:now+300,email:'one@example.com'}));
 const tok=h+'.'+c+'.'+b64(new Uint8Array(await webcrypto.subtle.sign('RSASSA-PKCS1-v1_5',keys.privateKey,new TextEncoder().encode(h+'.'+c))));
 const call=async(path,body,e=env)=>{const headers={'cf-access-jwt-assertion':tok};if(body){headers.origin='https://d.test';headers['content-type']='application/json'}const r=await worker.fetch(new Request('https://d.test'+path,{method:body?'PUT':'GET',headers,body:body?JSON.stringify(body):undefined}),e,{});return {status:r.status,data:await r.json()}};
 try{
  assert.equal((await call('/api/session')).data.sellerCode,'LL');
  assert.equal((await call('/api/session',null,{...env,SELLER_CODE:'lotus labs'})).data.sellerCode,'','a code that is not the shape is not handed out');
  assert.equal((await call('/api/session',null,{...env,SELLER_CODE:undefined})).data.sellerCode,'');
  let rev=0;const put=async state=>{const r=await call('/api/workspace',{revision:rev,state});if(r.status===200)rev=r.data.revision;return r};
  const doc=(id,type,number,more={})=>({id,number,type,status:'issued',salesChannel:'retail',currency:'THB',items:[{id:'l',qty:1,unitPrice:1000,discount:0}],payments:[],...more});
  const state={version:1,pricing:{wholesaleMOQ:10},settings:{sellerCode:'LL'},products:[],customers:[],documents:[doc('a','invoice','INV-2026-0001')],sequences:{}};
  assert.equal((await put(state)).status,200,'a number with no seller code is still the shape');
  const add=(d,s=state)=>{const n=structuredClone(s);n.documents.push(d);return n};
  assert.equal((await put(add(doc('b','invoice','LL-INV-2026-0002')))).status,200);state.documents.push(doc('b','invoice','LL-INV-2026-0002'));
  for(const [type,number,why] of [['invoice','INVOICE-7','a free number'],['invoice','LL-QT-2026-0001','a quotation number on an invoice'],['quote','LL-INV-2026-0009','an invoice number on a quotation'],['proforma','ll-pi-2026-0001','small letters'],['invoice','LL-INV-26-0003','a two-digit year'],['invoice','TOOLONG-INV-2026-0003','a seller code over four letters']])
   assert.equal((await put(add(doc('x',type,number)))).status,422,why+' is refused at issue');
  assert.equal((await put(add(doc('q','quote','LL-QT-2026-0001')))).status,200);state.documents.push(doc('q','quote','LL-QT-2026-0001'));
  assert.equal((await put(add(doc('p','proforma','LL-PI-2026-0001')))).status,200);state.documents.push(doc('p','proforma','LL-PI-2026-0001'));
  // a draft has no number; it gets one at the save that issues it
  const withDraft=add({...doc('d','invoice',''),status:'draft'});assert.equal((await put(withDraft)).status,200);
  const badIssue=structuredClone(withDraft);Object.assign(badIssue.documents.at(-1),{status:'issued',number:'MY-OWN-1'});assert.equal((await put(badIssue)).status,422,'a draft issued with a free number is refused');
  const goodIssue=structuredClone(withDraft);Object.assign(goodIssue.documents.at(-1),{status:'issued',number:'LL-INV-2026-0003'});assert.equal((await put(goodIssue)).status,200);
  // receipts
  const pay=(n,id,number)=>{const s=structuredClone(n);s.documents[0].payments.push({id,receiptNumber:number,amount:100});return s};
  assert.equal((await put(pay(goodIssue,'p1','RECEIPT-1'))).status,422,'a free receipt number is refused');
  assert.equal((await put(pay(goodIssue,'p1','LL-INV-2026-0044'))).status,422,'an invoice number on a receipt is refused');
  const paid=pay(goodIssue,'p1','LL-RC-2026-0001');assert.equal((await put(paid)).status,200);
  const paidAgain=pay(paid,'p2','RC-2026-0002');assert.equal((await put(paidAgain)).status,200,'an earlier payment keeps its number while a new one is added');
  // an issued number does not change afterwards
  const renum=structuredClone(paidAgain);renum.documents[0].number='LL-INV-2026-0001';assert.equal((await put(renum)).status,409,'an issued number cannot be changed');
  // the seller code in Settings
  const badCode=structuredClone(paidAgain);badCode.settings.sellerCode='lotus';assert.equal((await put(badCode)).status,422);
  const noCode=structuredClone(paidAgain);noCode.settings.sellerCode='';assert.equal((await put(noCode)).status,200);
 }finally{globalThis.fetch=oldFetch}
});
