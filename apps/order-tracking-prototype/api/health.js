import {send} from '../lib/shared.js';
export default function handler(req,res){
  if(req.method!=='GET')return send(res,405,{error:'method_not_allowed'});
  return send(res,200,{service:'clogz-suivi',version:1,ready:process.env.TRACKING_ENABLED==='1'});
}
