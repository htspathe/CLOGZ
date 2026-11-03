import {safeEquals,macSha256,newCode,send,SHOP} from '../../lib/shared.js';
import {createTrackingCode} from '../../lib/shopify.js';

// The raw request bytes are needed for Shopify webhook HMAC verification.
export const config={api:{bodyParser:false}};
async function rawBody(req){
  const chunks=[];let size=0;
  for await (const chunk of req){
    size+=chunk.length;
    if(size>512_000)throw new Error('PAYLOAD_TOO_BIG');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
export default async function handler(req,res){
  if(req.method!=='POST')return send(res,405,{error:'method_not_allowed'});
  if(!process.env.SHOPIFY_APP_CLIENT_SECRET||!process.env.SHOPIFY_ADMIN_TOKEN)return send(res,503,{error:'not_configured'});
  try{
    if(req.headers['x-shopify-shop-domain']!==SHOP)return send(res,401,{error:'invalid_shop'});
    const body=await rawBody(req);
    const received=String(req.headers['x-shopify-hmac-sha256']||'');
    const calculated=macSha256(process.env.SHOPIFY_APP_CLIENT_SECRET,body).toString('base64');
    if(!safeEquals(received,calculated))return send(res,401,{error:'invalid_signature'});
    const topic=String(req.headers['x-shopify-topic']||'');
    if(topic!=='orders/create')return send(res,200,{ok:true,ignored:true});
    const event=JSON.parse(body.toString('utf8'));
    const n=Number(event.id);
    if(!Number.isSafeInteger(n)||n<=0||!/^#[0-9]+$/.test(String(event.name||'')))return send(res,400,{error:'invalid_payload'});
    const code=await createTrackingCode(`gid://shopify/Order/${n}`,event.name,newCode);
    return send(res,200,{ok:true,codeCreated:Boolean(code)});
  }catch{return send(res,503,{error:'temporarily_unavailable'});}
}
