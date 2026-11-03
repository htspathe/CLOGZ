import {createHmac, createHash, timingSafeEqual, randomInt} from 'node:crypto';
export const SHOP = 'clogz-sn.myshopify.com';
export const METAOBJECT_TYPE = 'clogz_private_tracking';
export const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 symbols, 25-bit code
export const CODE_PATTERN = /^CZ-[A-HJ-NP-Z2-9]{5}$/;

export function newCode() {
  return 'CZ-' + Array.from({length:5},()=>ALPHABET[randomInt(32)]).join('');
}
export function safeEquals(a,b) {
  const aa=Buffer.from(String(a||''),'utf8'), bb=Buffer.from(String(b||''),'utf8');
  return aa.length===bb.length && timingSafeEqual(aa,bb);
}
export function macSha256(key,data) {return createHmac('sha256',key).update(data).digest();}
export function hashPart(data) {return createHash('sha256').update(data).digest('hex').slice(0,26);}
export function isConfigured() {
  return process.env.TRACKING_ENABLED==='1' && Boolean(process.env.SHOPIFY_ADMIN_TOKEN && process.env.SHOPIFY_APP_CLIENT_SECRET && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}
export function send(res,status,body) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  return res.status(status).json(body);
}
export function cors(req,res) {
  const origin=String(req.headers.origin||'');
  if(['https://clogz.sn','https://www.clogz.sn'].includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin',origin);
    res.setHeader('Vary','Origin');
    res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
  }
  if(req.method==='OPTIONS') {res.status(204).end();return true;}
  return false;
}
export function allowOrigin(req) {
  return !req.headers.origin || ['https://clogz.sn','https://www.clogz.sn'].includes(req.headers.origin);
}
export function incomingIp(req) {
  // On Vercel this header is set by the platform (not a visitor-provided token).
  const v=req.headers['x-vercel-forwarded-for'];
  if(typeof v==='string'&&v.length&&v.length<250)return v.split(',')[0].trim();
  return req.socket?.remoteAddress||'unknown';
}
export async function limit(req, bucket='track') {
  // Fail-closed: all public lookups need a durable, global rate limiter.
  const url=process.env.UPSTASH_REDIS_REST_URL;
  const token=process.env.UPSTASH_REDIS_REST_TOKEN;
  if(!url||!token)throw new Error('RATE_LIMIT_UNCONFIGURED');
  const day=new Date().toISOString().slice(0,10);
  const ip=hashPart(incomingIp(req));
  const g=`clogz:${bucket}:all:${day}`, i=`clogz:${bucket}:ip:${ip}:${day}`;
  const commands=[['INCR',i],['EXPIRE',i,86400],['INCR',g],['EXPIRE',g,86400]];
  const response=await fetch(`${url.replace(/\/$/,'')}/pipeline`,{
    method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
    body:JSON.stringify(commands),signal:AbortSignal.timeout(4500)
  });
  if(!response.ok)throw new Error('RATE_LIMIT_FAILURE');
  const results=await response.json();
  if(!Array.isArray(results)||results.length<4||results[0].error||results[2].error)throw new Error('RATE_LIMIT_FAILURE');
  const maxIp=bucket==='track'?12:20;
  const maxGlobal=bucket==='track'?500:500;
  return Number(results[0].result)<=maxIp && Number(results[2].result)<=maxGlobal;
}
export function parseJson(req) {
  const raw=req.body;
  if(typeof raw==='object'&&raw&&!Buffer.isBuffer(raw))return raw;
  if(typeof raw==='string' && raw.length<=4096)return JSON.parse(raw);
  if(Buffer.isBuffer(raw)&&raw.length<=4096)return JSON.parse(raw.toString('utf8'));
  return {};
}

export function getStage(order) {
  const tags=new Set((order.tags||[]).map(t=>String(t).toUpperCase()));
  const financial=order.displayFinancialStatus||'UNKNOWN';
  const fulfillment=order.displayFulfillmentStatus||'UNKNOWN';
  if(order.cancelledAt)return {step:0,label:'Commande annulée',steps:[false,false,false,false]};
  if(financial==='VOIDED')return {step:1,label:'Paiement annulé — confirmation nécessaire',steps:[true,false,false,false]};
  if(tags.has('CZ_LIVREE'))return {step:4,label:'Livrée',steps:[true,true,true,true]};
  if(tags.has('CZ_EN_LIVRAISON'))return {step:3,label:'En cours de livraison',steps:[true,true,true,false]};
  if(tags.has('CZ_CONFIRMEE'))return {step:2,label:'Commande confirmée',steps:[true,true,false,false]};
  // Shopify IN_PROGRESS means fulfillment preparation, not stock confirmed or out for delivery.
  return {step:1,label:fulfillment==='IN_PROGRESS'?'Préparation en cours':'Commande reçue',steps:[true,false,false,false]};
}
export function getPayment(financial) {
  if(financial==='PAID')return 'Payé';
  if(financial==='REFUNDED'||financial==='PARTIALLY_REFUNDED')return 'Remboursé / partiellement remboursé';
  if(financial==='VOIDED')return 'Annulé';
  if(financial==='PENDING'||financial==='AUTHORIZED'||financial==='PARTIALLY_PAID')return 'Paiement en attente';
  return 'Statut de paiement à confirmer';
}
