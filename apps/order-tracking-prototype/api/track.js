import {CODE_PATTERN,cors,allowOrigin,send,limit,isConfigured,parseJson,getStage,getPayment} from '../lib/shared.js';
import {findByCode} from '../lib/shopify.js';

export default async function handler(req,res){
  if(cors(req,res))return;
  if(req.method!=='POST')return send(res,405,{error:'method_not_allowed'});
  if(!allowOrigin(req))return send(res,403,{error:'forbidden'});
  if(!isConfigured())return send(res,503,{error:'service_not_configured'});
  let body;
  try{body=parseJson(req);}catch{return send(res,400,{error:'invalid_request'});}
  const code=String(body.code||'').trim().toUpperCase();
  if(!CODE_PATTERN.test(code))return send(res,400,{error:'invalid_code_format'});
  try{
    if(!await limit(req,'track'))return send(res,429,{error:'too_many_requests'});
    const order=await findByCode(code);
    if(!order)return send(res,404,{error:'code_not_found'});
    const stage=getStage(order);
    // No names, addresses, phone numbers, emails, items or Shopify private URLs.
    return send(res,200,{code,orderNumber:order.name,status:stage.label,step:stage.step,steps:stage.steps,payment:getPayment(order.displayFinancialStatus),fulfillment:order.displayFulfillmentStatus});
  }catch(e){return send(res,503,{error:'service_unavailable'});}
}
