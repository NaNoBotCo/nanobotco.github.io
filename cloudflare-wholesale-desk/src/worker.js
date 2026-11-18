// Wholesale Desk — Cloudflare Worker / D1 / Access. No supplier costs in source.
// A signed Access JWT and an exact email allowlist are REQUIRED for every route.
const MAX=4000000;let cache={domain:"",expires:0,keys:[]};
const out=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
const reject=(msg,status=400)=>out({error:msg},status);
const bytes=s=>Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/").padEnd(Math.ceil(s.length/4)*4,"=")),c=>c.charCodeAt(0));
const part=s=>JSON.parse(new TextDecoder().decode(bytes(s)));
async function certs(domain,refresh=false){
 if(!refresh&&cache.domain===domain&&cache.expires>Date.now())return cache.keys;
 const r=await fetch("https://"+domain+"/cdn-cgi/access/certs");
 if(!r.ok)throw {status:503,message:"Access verification unavailable"};
 const body=await r.json(),keys=body.keys||body.jwks?.keys;
 if(!Array.isArray(keys)||!keys.length)throw {status:503,message:"Missing Access signing keys"};
 cache={domain,keys,expires:Date.now()+1200000};return keys;
}
async function authorize(req,env){
 const domain=String(env.ACCESS_TEAM_DOMAIN||"").trim().toLowerCase().replace(/^https?:\/\//,"").replace(/\/$/,"");
 const aud=String(env.ACCESS_AUD||"").trim();
 const allowed=String(env.AUTHORIZED_EMAILS||"").split(",").map(s=>s.trim().toLowerCase()).filter(Boolean);
 if(!domain.endsWith(".cloudflareaccess.com")||domain.includes("change_me")||!aud||aud.includes("CHANGE_ME")||!allowed.length||allowed.some(e=>!e.includes("@")||e.includes("change_me")))throw {status:503,message:"Access configuration incomplete; application locked"};
 const cookie=req.headers.get("cookie")||"";
 const token=req.headers.get("cf-access-jwt-assertion")||decodeURIComponent((cookie.match(/(?:^|;\s*)CF_Authorization=([^;]+)/i)||[])[1]||"");
 if(!token)throw {status:401,message:"Cloudflare Access sign-in required"};
 const parts=token.split(".");if(parts.length!==3)throw {status:401,message:"Malformed access token"};
 let header,claims;try{header=part(parts[0]);claims=part(parts[1])}catch{throw {status:401,message:"Invalid access token"}}
 const now=Math.floor(Date.now()/1000);
 if(header.alg!=="RS256"||!header.kid||String(claims.iss||"").replace(/\/$/,"")!=="https://"+domain||
    !(Array.isArray(claims.aud)?claims.aud:[claims.aud]).includes(aud)||
    typeof claims.exp!=="number"||claims.exp<=now||(claims.nbf&&claims.nbf>now+30)||(claims.iat&&claims.iat>now+30))throw {status:401,message:"Invalid or expired Access claims"};
 let keys=await certs(domain),jwk=keys.find(k=>k.kty==="RSA"&&k.kid===header.kid);
 if(!jwk){keys=await certs(domain,true);jwk=keys.find(k=>k.kty==="RSA"&&k.kid===header.kid)}
 if(!jwk)throw {status:401,message:"Signing key not found"};
 const key=await crypto.subtle.importKey("jwk",jwk,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["verify"]);
 if(!await crypto.subtle.verify("RSASSA-PKCS1-v1_5",key,bytes(parts[2]),new TextEncoder().encode(parts[0]+"."+parts[1])))throw {status:401,message:"Bad Access signature"};
 const email=String(claims.email||"").trim().toLowerCase();
 if(!allowed.includes(email))throw {status:403,message:"This email is not allowed in Wholesale Desk"};
 return email;
}
const obj=x=>x&&typeof x==="object"&&!Array.isArray(x),money=n=>Math.round(Number(n||0)*100)/100;
// TEAM_NAMES (Worker secret): "email=Name,email=Name". Names shown in the app; emails stay out of source.
function teamOf(env){const names=new Map(String(env.TEAM_NAMES||"").split(",").map(s=>s.split("=").map(x=>x.trim())).filter(x=>x.length===2&&x[0]&&x[1]).map(([e,n])=>[e.toLowerCase(),n.slice(0,40)]));return String(env.AUTHORIZED_EMAILS||"").split(",").map(s=>s.trim().toLowerCase()).filter(Boolean).map(email=>({email,name:names.get(email)||email.split("@")[0]}))}
function unique(xs,k,name){const a=xs.map(x=>String(x[k]||"").trim()).filter(Boolean);if(new Set(a).size!==a.length)throw {status:422,message:"Duplicate "+name}}
function validate(next,prev){
 if(!obj(next)||next.version!==1||!obj(next.settings)||!obj(next.pricing)||!Array.isArray(next.products)||!Array.isArray(next.customers)||!Array.isArray(next.documents))throw {status:422,message:"Invalid workspace data"};
 if(next.products.length>5000||next.customers.length>5000||next.documents.length>10000)throw {status:413,message:"Workspace too large"};
 if(next.settings.shippingOptions!==undefined&&(!Array.isArray(next.settings.shippingOptions)||next.settings.shippingOptions.length>200||next.settings.shippingOptions.some(o=>!obj(o)||!Number.isFinite(Number(o.priceTHB||0))||Number(o.priceTHB||0)<0||!Number.isFinite(Number(o.priceUSD||0))||Number(o.priceUSD||0)<0)))throw {status:422,message:"Invalid shipping options"};
 if(next.customers.some(c=>c.activities!==undefined&&(!Array.isArray(c.activities)||c.activities.length>5000||c.activities.some(a=>!obj(a)))))throw {status:422,message:"Invalid customer timeline"};
 for(const [label,rows] of [["products",next.products],["customers",next.customers],["documents",next.documents]]){
  if(rows.some(x=>!obj(x)||typeof x.id!=="string"||!x.id))throw {status:422,message:"Invalid "+label+" id"};unique(rows,"id",label+" identifier");
 }
 unique(next.products,"sku","SKU");unique(next.documents.filter(x=>x.number),"number","document number");
 const old=new Map((prev?.documents||[]).map(d=>[d.id,d]));
 for(const d of next.documents){
  if(!obj(d)||!["draft","issued","void"].includes(d.status)||!["invoice","quote","proforma"].includes(d.type)||!Array.isArray(d.items)||!Array.isArray(d.payments)||d.items.length>150||d.payments.length>100)throw {status:422,message:"Invalid document"};
  const prior=old.get(d.id);
  if(prior&&prior.status!=="draft"){
   if(d.status!==prior.status&&!(prior.status==="issued"&&d.status==="void"))throw {status:409,message:"Issued document status cannot be changed"};
   const canonical=x=>{let o={...x};delete o.payments;delete o.updatedAt;delete o.history;delete o.status;delete o.delivery;return JSON.stringify(o)};
   if(canonical(prior)!==canonical(d))throw {status:409,message:"Issued document immutable"};
   if(prior.payments.some(p=>!d.payments.find(q=>JSON.stringify(p)===JSON.stringify(q))))throw {status:409,message:"Payments cannot be edited"};
  }
  if(d.status!=="draft"&&!d.number)throw {status:422,message:"Issued documents require a number"};
  if(d.items.some(i=>!obj(i)||!Number.isFinite(Number(i.qty))||Number(i.qty)<=0||!Number.isFinite(Number(i.unitPrice))||Number(i.unitPrice)<0||Number(i.discount||0)<0||Number(i.discount||0)>100))throw {status:422,message:"Invalid invoice line"};
  if(d.shippingAmount!==undefined&&d.shippingAmount!==""&&(!Number.isFinite(Number(d.shippingAmount))||Number(d.shippingAmount)<0))throw {status:422,message:"Invalid shipping charge"};
  if(d.delivery!==undefined&&d.delivery!==null&&!obj(d.delivery))throw {status:422,message:"Invalid delivery record"};
  unique(d.payments,"id","payment ID");
  if(d.payments.some(p=>!Number.isFinite(Number(p.amount))||Number(p.amount)<=0))throw {status:422,message:"Invalid payment"};
  const subtotal=money(d.items.reduce((sum,i)=>sum+money(Number(i.qty)*Number(i.unitPrice)*(1-Number(i.discount||0)/100)),0));
  const shipping=money(Math.max(0,Number(d.shippingAmount||0)));
  const total=money(subtotal+shipping+(d.vatEnabled?money((subtotal+shipping)*Number(d.vatRate||0)/100):0));
  if(money(d.payments.reduce((sum,p)=>sum+Number(p.amount),0))>total+.009)throw {status:422,message:"Payments exceed invoice total"};
  if(d.status==="issued"&&d.salesChannel==="wholesale")for(const line of d.items){
   const product=next.products.find(p=>p.id===line.productId);if(!product)continue;
   const moq=Math.max(1,Math.floor(Number(product.moqOverride!==""&&product.moqOverride!=null?product.moqOverride:next.pricing.wholesaleMOQ)||1));
   if(Number(line.qty)<moq)throw {status:422,message:"Wholesale MOQ for "+product.sku+" is "+moq};
  }
 }
 for(const d of prev?.documents||[])if(d.status!=="draft"&&!next.documents.some(x=>x.id===d.id))throw {status:409,message:"Issued documents may not be deleted"};
 const receipts=next.documents.flatMap(d=>d.payments.map(p=>String(p.receiptNumber||"").trim()).filter(Boolean));
 if(new Set(receipts).size!==receipts.length)throw {status:422,message:"Duplicate receipt number"};
}
const sec={"cache-control":"no-store","x-content-type-options":"nosniff","referrer-policy":"no-referrer","permissions-policy":"camera=(), microphone=(), geolocation=()","content-security-policy":"default-src 'self';script-src 'self' 'unsafe-inline';style-src 'self' 'unsafe-inline';img-src 'self' data:;connect-src 'self';form-action 'self';base-uri 'none';frame-ancestors 'none'"};
export default {async fetch(request,env,ctx){
 const url=new URL(request.url);
 try{
  if(!env.DB||!env.ASSETS)return reject("Database/assets binding missing",503);
  if(request.method==="OPTIONS")return reject("Cross-origin requests are not supported",405);
  const email=await authorize(request,env); // fail closed, even for static assets
  if(url.pathname.startsWith("/api/")){
   if(url.pathname==="/api/session"&&request.method==="GET"){const team=teamOf(env);return out({ok:true,email,name:(team.find(t=>t.email===email)||{name:email.split("@")[0]}).name,team,role:"admin",storage:"Cloudflare D1"});}
   if(url.pathname==="/api/workspace"&&request.method==="GET"){
    const row=await env.DB.prepare("SELECT revision, state_json, updated_at, updated_by FROM workspace WHERE id=1").first();
    if(!row)return reject("Run D1 migration first",503);
    return out({revision:row.revision,state:JSON.parse(row.state_json),updatedAt:row.updated_at,updatedBy:row.updated_by});
   }
   if(url.pathname==="/api/workspace"&&request.method==="PUT"){
    if(request.headers.get("origin")!==url.origin)return reject("Cross-origin write denied",403);
    if(!(request.headers.get("content-type")||"").includes("application/json"))return reject("JSON required",415);
    if(Number(request.headers.get("content-length")||0)>MAX)return reject("Payload too large",413);
    const raw=await request.text();if(raw.length>MAX)return reject("Payload too large",413);
    let body;try{body=JSON.parse(raw)}catch{return reject("Invalid JSON")}
    if(!Number.isSafeInteger(body?.revision)||body.revision<0)return reject("Revision required");
    const row=await env.DB.prepare("SELECT revision,state_json FROM workspace WHERE id=1").first();
    if(!row)return reject("Run D1 migration first",503);
    if(row.revision!==body.revision)return out({error:"Concurrent edit detected. Export your unsaved backup and reload.",currentRevision:row.revision},409);
    validate(body.state,JSON.parse(row.state_json));
    const text=JSON.stringify(body.state);if(text.length>MAX)return reject("Payload too large",413);
    const now=new Date().toISOString();
    const updated=await env.DB.prepare("UPDATE workspace SET state_json=?, revision=revision+1, updated_at=?, updated_by=? WHERE id=1 AND revision=?").bind(text,now,email,body.revision).run();
    // D1 counts audit-trigger writes too; a successful update may change multiple rows.
    if(!(updated.meta?.changes>=1))return reject("Concurrent edit detected; no data overwritten",409);
    return out({saved:true,revision:body.revision+1,updatedAt:now});
   }
   if(url.pathname==="/api/audit"&&request.method==="GET"){
    const rows=await env.DB.prepare("SELECT revision,actor,changed_at FROM audit_log ORDER BY revision DESC LIMIT 100").all();return out({entries:rows.results});
   }
   return reject("Unknown API endpoint",404);
  }
  if(request.method!=="GET"&&request.method!=="HEAD")return reject("Method not allowed",405);
  const res=await env.ASSETS.fetch(request),headers=new Headers(res.headers);for(const [k,v] of Object.entries(sec))headers.set(k,v);
  return new Response(res.body,{status:res.status,statusText:res.statusText,headers});
 }catch(e){if(!e?.status)console.error(String(e));return reject(e?.status?e.message:"Server error; no data saved",e?.status||500)}
}};
