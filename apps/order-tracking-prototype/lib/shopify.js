import {SHOP,METAOBJECT_TYPE} from './shared.js';

export async function admin(query,variables={}){
  if(!process.env.SHOPIFY_ADMIN_TOKEN)throw new Error('SHOPIFY_NOT_CONFIGURED');
  const r=await fetch(`https://${SHOP}/admin/api/2026-10/graphql.json`,{
    method:'POST',headers:{'X-Shopify-Access-Token':process.env.SHOPIFY_ADMIN_TOKEN,'Content-Type':'application/json'},
    body:JSON.stringify({query,variables}),signal:AbortSignal.timeout(7000)
  });
  if(!r.ok)throw new Error('SHOPIFY_UNAVAILABLE');
  const json=await r.json();
  if(json.errors?.length)throw new Error('SHOPIFY_GRAPHQL_ERROR');
  return json.data;
}

const readIndex=`query($handle:MetaobjectHandleInput!){metaobjectByHandle(handle:$handle){handle fields{key value}}}`;
const readOrder=`query($id:ID!){order(id:$id){id name cancelledAt tags displayFinancialStatus displayFulfillmentStatus metafield(namespace:"clogz_tracking",key:"code"){value}}}`;
export async function findByCode(code) {
  const meta=(await admin(readIndex,{handle:{type:METAOBJECT_TYPE,handle:code.toLowerCase()}})).metaobjectByHandle;
  if(!meta)return null;
  const gid=meta.fields?.find(f=>f.key==='order_gid')?.value;
  if(!/^gid:\/\/shopify\/Order\/\d+$/.test(gid||''))throw new Error('BAD_TRACKING_INDEX');
  const order=(await admin(readOrder,{id:gid})).order;
  if(!order||order.metafield?.value!==code)throw new Error('TRACKING_MISMATCH');
  return order;
}
export async function readOrderById(gid) {
  if(!/^gid:\/\/shopify\/Order\/\d+$/.test(gid))return null;
  return (await admin(readOrder,{id:gid})).order;
}
export async function readOrderConfirmation(gid) {
  const q=`query($id:ID!){order(id:$id){id name checkoutToken confirmationNumber metafield(namespace:"clogz_tracking",key:"code"){value}}}`;
  return (await admin(q,{id:gid})).order;
}
const createIndex=`mutation($input:MetaobjectCreateInput!){metaobjectCreate(metaobject:$input){metaobject{id handle}userErrors{field message code}}}`;
const writeCode=`mutation($metafields:[MetafieldsSetInput!]!){metafieldsSet(metafields:$metafields){metafields{id value}userErrors{field message code}}}`;
export async function createTrackingCode(gid,orderName,newCodeFactory){
  const existing=await readOrderById(gid);
  if(!existing)throw new Error('ORDER_NOT_FOUND');
  if(existing.metafield?.value)return existing.metafield.value; // webhook retry: idempotent
  for(let attempt=0;attempt<12;attempt++){
    const code=newCodeFactory();
    const input={type:METAOBJECT_TYPE,handle:code.toLowerCase(),fields:[{key:'order_gid',value:gid},{key:'order_number',value:orderName}]};
    const result=(await admin(createIndex,{input})).metaobjectCreate;
    const failed=result?.userErrors?.length;
    if(failed) {
      // Never overwrite an existing handle: collision must pick a fresh code.
      if(result.userErrors.some(x=>/already|taken|unique|duplicate|existe|exist/i.test(x.message||'')))continue;
      throw new Error('TRACKING_INDEX_CREATION_FAILED');
    }
    const write=(await admin(writeCode,{metafields:[{ownerId:gid,namespace:'clogz_tracking',key:'code',type:'single_line_text_field',value:code,compareDigest:null}]})).metafieldsSet;
    if(write?.userErrors?.length){
      // Concurrent webhook may have written a different code first. Keep its value.
      const now=await readOrderById(gid);
      if(now?.metafield?.value)return now.metafield.value;
      throw new Error('ORDER_CODE_WRITE_FAILED');
    }
    return code;
  }
  throw new Error('TRACKING_CODE_COLLISION_EXHAUSTED');
}
