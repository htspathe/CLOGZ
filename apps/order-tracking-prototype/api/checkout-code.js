import {safeEquals,macSha256,send,limit,SHOP,CODE_PATTERN} from '../lib/shared.js';
import {readOrderConfirmation} from '../lib/shopify.js';

function decodeBase64Url(s) {return Buffer.from(s.replace(/-/g,'+').replace(/_/g,'/'),'base64');}
function canonicalShop(dest) {
  return String(dest || '').replace(/^https?:\/\//i, '').replace(/\/$/, '').toLowerCase();
}
// Exported for tests; never trust unsigned headers or request body identities.
export function verifySessionToken(token) {
  try {
    if (!process.env.SHOPIFY_APP_CLIENT_SECRET || !process.env.SHOPIFY_APP_CLIENT_ID) return false;
    const parts = String(token || '').split('.');
    if (parts.length !== 3 || parts.some(p => !p || p.length > 10000)) return false;
    const [head, payload, signature] = parts;
    const h = JSON.parse(decodeBase64Url(head).toString('utf8'));
    const p = JSON.parse(decodeBase64Url(payload).toString('utf8'));
    if (h.alg !== 'HS256') return false;
    const expected = macSha256(process.env.SHOPIFY_APP_CLIENT_SECRET, `${head}.${payload}`);
    const received = decodeBase64Url(signature);
    if (expected.length !== received.length || !safeEquals(expected.toString('hex'), received.toString('hex'))) return false;
    const now = Math.floor(Date.now() / 1000);
    if (typeof p.exp !== 'number' || p.exp <= now || p.exp > now + 3600) return false;
    if (typeof p.nbf !== 'number' || p.nbf > now + 30) return false;
    if (p.aud !== process.env.SHOPIFY_APP_CLIENT_ID || canonicalShop(p.dest) !== SHOP) return false;
    return true;
  } catch {
    return false;
  }
}
export default async function handler(req,res){
  // Checkout extensions have their own Shopify-managed origin. Session JWT is
  // required on every request; no cookie authentication is accepted.
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type');
  if(req.method==='OPTIONS'){res.status(204).end();return;}
  if(req.method!=='POST')return send(res,405,{error:'method_not_allowed'});
  if(!process.env.SHOPIFY_APP_CLIENT_SECRET||!process.env.SHOPIFY_APP_CLIENT_ID||!process.env.SHOPIFY_ADMIN_TOKEN||!process.env.UPSTASH_REDIS_REST_URL)return send(res,503,{error:'not_configured'});
  try{
    const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
    if(!verifySessionToken(token))return send(res,401,{error:'unauthorized'});
    if(!await limit(req,'checkout'))return send(res,429,{error:'too_many_requests'});
    const b=typeof req.body==='object'?req.body:JSON.parse(String(req.body||'{}'));
    const gid=String(b.orderId||'');const checkoutToken=String(b.checkoutToken||'');
    if(!/^gid:\/\/shopify\/Order\/\d+$/.test(gid)||checkoutToken.length<20||checkoutToken.length>200)return send(res,400,{error:'invalid_request'});
    const order=await readOrderConfirmation(gid);
    if(!order)return send(res,202,{pending:true}); // Thank-you can precede the Admin API order.
    if(!safeEquals(String(order.checkoutToken||''),checkoutToken))return send(res,404,{error:'not_found'});
    if(!order.metafield?.value)return send(res,202,{pending:true});
    if(!CODE_PATTERN.test(order.metafield.value))return send(res,503,{error:'invalid_code'});
    return send(res,200,{code:order.metafield.value,orderNumber:order.name,trackingUrl:'https://clogz.sn/pages/suivi#'+order.metafield.value});
  }catch(e){return send(res,503,{error:'temporarily_unavailable'});}
}
