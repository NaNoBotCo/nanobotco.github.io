import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const page=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const qrSource=readFileSync(new URL('../public/promptpay-qr.js',import.meta.url),'utf8');
function app(){
 const els=new Map();
 const el=id=>{if(!els.has(id))els.set(id,{innerHTML:'',textContent:'',value:'',style:{},classList:{add(){},remove(){},toggle(){}},reportValidity:()=>true,showModal(){},close(){}});return els.get(id)};
 const ctx=vm.createContext({console,structuredClone,TextEncoder,crypto:{randomUUID:()=>'id-'+Math.random().toString(36).slice(2)},setTimeout:()=>1,clearTimeout(){},window:{addEventListener(){},print(){ctx.printed=true}},document:{addEventListener(){},getElementById:el,querySelector:()=>null,querySelectorAll:()=>[]},confirm:()=>true,alert(m){throw Error('alert: '+m)},URL,FormData:class{constructor(f){return new Map(Object.entries(f.values))}}});
 vm.runInContext(qrSource,ctx);
 assert.match(page,/<script src="\.\/promptpay-qr\.js"><\/script>\s*<script>/,'QR script loads before the app script');
 const script=page.match(/<script>([\s\S]*?)<\/script>/)[1].replace('connectCloud();','globalThis.api={initial,ensureDefaults,totals,payQr,printDoc,renderPayments,renderSettings,saveSettings,setData(v){data=v},getData(){return data},setReady(){cloudReady=true}};');
 vm.runInContext(script,ctx);return {a:ctx.api,el,ctx,P:ctx.window.PromptPayQR};
}
const invoice=(more={})=>({id:'d1',type:'invoice',status:'issued',number:'INV-2026-0001',currency:'THB',issueDate:'2026-11-19',dueDate:'2026-12-03',items:[{id:'l',sku:'X',description:'Item',qty:10,unit:'vial',unitPrice:150,discount:0}],payments:[],history:[],terms:'',notes:'',...more});
const payloadIn=svgHost=>svgHost.match(/aria-label="PromptPay ([^"]*)"/)?.[1];

test('PromptPay payloads match the promptpay-qr package and carry a valid CRC',()=>{
 const {P}=app();
 // Expected strings produced by promptpay-qr 0.5.0 (dtinth, MIT) for the same inputs.
 assert.equal(P.payload('0812345678'),'00020101021129370016A000000677010111011300668123456785802TH530376463045D82');
 assert.equal(P.payload('081-234-5678',422),'00020101021229370016A000000677010111011300668123456785802TH530376454044.2263045D49');
 assert.equal(P.payload('0575569006139',900000),'00020101021229370016A000000677010111021305755690061395802TH530376454079000.00630401A3');
 const p=P.payload('0812345678',123455);assert.equal(P.crc16(p.slice(0,-4)),p.slice(-4));
 assert.equal(P.payee('12345'),null);assert.equal(P.payee('1812345678'),null);assert.equal(P.payee('0812345678').kind,'phone');
 assert.throws(()=>P.payload('123'));
});

test('an issued THB invoice prints a QR for the balance due',()=>{
 const {a,el,ctx}=app();const data=a.initial();data.settings.promptpayId='0812345678';data.settings.promptpayName='Test Account';data.documents.push(invoice({payments:[{id:'p',amount:500}]}));a.setData(data);
 a.printDoc(data.documents[0]);const out=el('printMount').innerHTML;
 assert.ok(ctx.printed);assert.match(out,/<svg[^>]+aria-label="PromptPay THB 1,000\.00"/);assert.match(out,/Scan to pay with PromptPay/);assert.match(out,/Test Account/);
 assert.doesNotMatch(out,/Contact seller for payment instructions/,'QR stands in for the missing bank text');
 const q=a.payQr(data.documents[0]);assert.equal(q.due,1000);
 assert.match(a.renderPayments(data.documents[0]),/<svg/,'the same QR shows on the invoice screen');
});

test('no QR on drafts, void, quotes, USD, paid invoices or without a number',()=>{
 const {a}=app();const data=a.initial();data.settings.promptpayId='0812345678';a.setData(data);
 for(const d of [invoice({status:'draft'}),invoice({status:'void'}),invoice({type:'quote'}),invoice({currency:'USD'}),invoice({payments:[{id:'p',amount:1500}]})])assert.equal(a.payQr(d),null,JSON.stringify([d.type,d.status,d.currency]));
 data.settings.promptpayId='';assert.equal(a.payQr(invoice()),null);
 const {a:b,el}=app();const d2=b.initial();b.setData(d2);b.printDoc(invoice());assert.match(el('printMount').innerHTML,/Contact seller for payment instructions/);assert.doesNotMatch(el('printMount').innerHTML,/<svg/);
});

test('an issued proforma asks for its whole total',()=>{
 const {a}=app();const data=a.initial();data.settings.promptpayId='0575569006139';a.setData(data);
 const q=a.payQr(invoice({type:'proforma',shippingAmount:100}));assert.equal(q.due,1600);assert.equal(payloadIn(q.svg),'THB 1,600.00');
});

test('Settings saves digits only, refuses a bad number, and shows a test code',()=>{
 const {a,el}=app();const data=a.initial();a.setData(data);a.setReady();
 const form=el('settingsForm');form.elements={vatRegistered:{checked:false}};
 form.values={...data.settings,shippingOptions:undefined,promptpayId:'12345',promptpayName:''};
 assert.throws(()=>a.saveSettings(),/alert: PromptPay number/);assert.equal(a.getData().settings.promptpayId,'');
 form.values={...form.values,promptpayId:'081-234-5678',promptpayName:'  Test Account '};
 try{a.saveSettings()}catch(e){if(!/querySelector|innerHTML|render/.test(e.message))throw e}
 assert.equal(a.getData().settings.promptpayId,'0812345678');assert.equal(a.getData().settings.promptpayName,'Test Account');
 assert.match(a.renderSettings(),/name="promptpayId"[^>]*value="0812345678"/);assert.match(a.renderSettings(),/Test code · no amount/);
});
