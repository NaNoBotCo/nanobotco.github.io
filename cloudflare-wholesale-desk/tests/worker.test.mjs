import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import worker from '../src/worker.js';

test('Access signatures, D1 conflicts, invoice locks, and static-asset protection',async()=>{
 const db=new DatabaseSync(':memory:');
 db.exec(readFileSync(new URL('../migrations/0001_initial.sql',import.meta.url),'utf8'));
 class Stmt{
  constructor(sql){this.sql=sql;this.args=[]}
  bind(...args){this.args=args;return this}
  first(){return db.prepare(this.sql).get(...this.args)||null}
  run(){const r=db.prepare(this.sql).run(...this.args);return {meta:{changes:Number(r.changes)}}}
  all(){return {results:db.prepare(this.sql).all(...this.args)}}
 }
 const keys=await webcrypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
 const jwk=await webcrypto.subtle.exportKey('jwk',keys.publicKey);jwk.kid='unit-test';
 const oldFetch=globalThis.fetch;
 globalThis.fetch=async url=>{
  if(url==='https://ci-team.cloudflareaccess.com/cdn-cgi/access/certs')return new Response(JSON.stringify({keys:[jwk]}));
  throw Error('Unexpected external fetch '+url);
 };
 const env={DB:{prepare:sql=>new Stmt(sql)},ASSETS:{fetch:async()=>new Response('Shell',{headers:{'content-type':'text/html'}})},ACCESS_TEAM_DOMAIN:'ci-team.cloudflareaccess.com',ACCESS_AUD:'test-audience',AUTHORIZED_EMAILS:'owner@example.com'};
 const b64=v=>Buffer.from(v).toString('base64url');
 const now=Math.floor(Date.now()/1000);
 async function token(email='owner@example.com',more={}){
  const a=b64(JSON.stringify({alg:'RS256',kid:jwk.kid}));
  const b=b64(JSON.stringify({iss:'https://ci-team.cloudflareaccess.com',aud:'test-audience',iat:now-30,exp:now+300,email,...more}));
  const sig=await webcrypto.subtle.sign('RSASSA-PKCS1-v1_5',keys.privateKey,new TextEncoder().encode(a+'.'+b));
  return a+'.'+b+'.'+b64(new Uint8Array(sig));
 }
 const origin='https://desk.test';
 function req(path,options={}){const headers={};
  if(options.token)headers['cf-access-jwt-assertion']=options.token;
  if(options.body){headers.origin=options.origin||origin;headers['content-type']='application/json'}
  return new Request(origin+path,{method:options.method||'GET',headers,body:options.body?JSON.stringify(options.body):undefined});
 }
 async function call(path,options={}){const res=await worker.fetch(req(path,options),env,{});let data;try{data=await res.json()}catch{}return {status:res.status,data};}
 try{
  assert.equal((await call('/api/session')).status,401);
  assert.equal((await call('/')).status,401,'static HTML must be protected');
  assert.equal((await call('/api/session',{token:await token('stranger@example.com')})).status,403);
  assert.equal((await call('/api/session',{token:await token('owner@example.com',{aud:'wrong'})})).status,401);
  assert.equal((await call('/api/session',{token:await token('owner@example.com',{exp:now-1})})).status,401);
  const t=await token();
  assert.equal((await call('/api/session',{token:t})).status,200);
  const init=await call('/api/workspace',{token:t});
  assert.equal(init.status,200);assert.equal(init.data.revision,0);
  const state={version:1,pricing:{wholesaleMOQ:10},settings:{sellerName:'Test'},products:[],customers:[],documents:[],sequences:{}};
  let resp=await call('/api/workspace',{token:t,method:'PUT',body:{revision:0,state}});assert.equal(resp.status,200,JSON.stringify(resp));
  assert.equal((await call('/api/workspace',{token:t,method:'PUT',body:{revision:0,state}})).status,409);
  assert.equal((await call('/api/workspace',{token:t,method:'PUT',body:{revision:1,state},origin:'https://stranger.test'})).status,403);
  state.products=[{id:'p1',sku:'TR5',moqOverride:''}];
  state.documents=[{id:'doc-1',number:'INV-2026-0001',type:'invoice',status:'issued',salesChannel:'wholesale',currency:'THB',vatEnabled:false,items:[{id:'line-1',qty:10,unitPrice:450,discount:0,productId:'p1'}],payments:[]}];
  resp=await call('/api/workspace',{token:t,method:'PUT',body:{revision:1,state}});assert.equal(resp.status,200,JSON.stringify(resp));
  const modified=structuredClone(state);modified.documents[0].items[0].unitPrice=100;
  assert.equal((await call('/api/workspace',{token:t,method:'PUT',body:{revision:2,state:modified}})).status,409);
  const paid=structuredClone(state);paid.documents[0].payments.push({id:'pay-1',amount:500});
  resp=await call('/api/workspace',{token:t,method:'PUT',body:{revision:2,state:paid}});assert.equal(resp.status,200,JSON.stringify(resp));
  assert.equal((await call('/api/audit',{token:t})).data.entries.length,3);
  const protectedAsset=await worker.fetch(req('/',{token:t}),env,{});
  assert.equal(protectedAsset.status,200);
  assert.equal(protectedAsset.headers.get('cache-control'),'no-store');
  const misconfigured={...env,ACCESS_AUD:'CHANGE_ME'};
  assert.equal((await worker.fetch(req('/',{token:t}),misconfigured,{})).status,503,'misconfigured Access fails closed');
 }finally{globalThis.fetch=oldFetch;db.close()}
});
