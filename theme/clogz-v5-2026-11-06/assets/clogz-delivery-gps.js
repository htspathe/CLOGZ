/* CLOGZ: optional one-time GPS location saved as Shopify cart attributes.
   No tracking and no external GPS API. Coordinates are sent to Shopify only on user request. */
(()=>{
'use strict';
const widgets=Array.from(document.querySelectorAll('[data-clogz-delivery-gps]'));
if(!widgets.length)return;
const rawRoot=window.Shopify?.routes?.root||window.CLOGZ?.routes?.root||'/';
const root=rawRoot.endsWith('/')?rawRoot:rawRoot+'/';
const endpoint=root+'cart/update.js';
const coordKeys=['GPS latitude','GPS longitude','GPS précision (m)','Lien Google Maps'];
let attrs={};
let saveQueue=Promise.resolve();
let locating=false;
let checkoutBusy=false;
const approvedClick=new WeakSet();
const fields=['Quartier de livraison'];
const legacyKeys=['Point de repère','Position livraison - Google Maps','Latitude livraison','Longitude livraison','Precision position livraison (m)','Position livraison relevee le'];
function setStatus(message,state){
  widgets.forEach(w=>{
    const line=w.querySelector('[data-clogz-geo-status]');
    if(line){line.textContent=message;line.dataset.state=state||'';}
  });
}
function textValues(widget){
  const result={};
  fields.forEach(key=>result[key]=(widget.querySelector('[data-clogz-geo-field="'+key+'"]')?.value||'').trim());
  return result;
}
function syncText(values){
  widgets.forEach(w=>fields.forEach(key=>{
    const input=w.querySelector('[data-clogz-geo-field="'+key+'"]');
    if(input&&document.activeElement!==input&&values[key]!=null)input.value=values[key];
  }));
}
function drawPosition(){
  const lat=Number(attrs['GPS latitude']),lng=Number(attrs['GPS longitude']);
  const exists=String(attrs['GPS latitude']||'')!==''&&String(attrs['GPS longitude']||'')!==''&&Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180;
  widgets.forEach(w=>{
    const box=w.querySelector('[data-clogz-geo-result]');
    const link=w.querySelector('[data-clogz-geo-map]');
    if(box)box.hidden=!exists;
    if(link){if(exists){link.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(lat.toFixed(6)+','+lng.toFixed(6));}else link.removeAttribute('href');}
  });
  return exists;
}
function save(values){
  const work=saveQueue.catch(()=>{}).then(async()=>{
    const r=await fetch(endpoint,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({attributes:{...Object.fromEntries(legacyKeys.filter(key=>attrs[key]).map(key=>[key,''])),...values}})});
    if(!r.ok)throw new Error('Enregistrement impossible ('+r.status+')');
    const cart=await r.json();
    attrs=cart.attributes||Object.assign({},attrs,values);
    drawPosition();
    return cart;
  });
  saveQueue=work.catch(()=>{});
  return work;
}
function whatsappState(){
  const selected=attrs['Mode de localisation']==='WhatsApp après commande';
  widgets.forEach(w=>{
    const help=w.querySelector('[data-clogz-geo-whatsapp-help]');
    const button=w.querySelector('[data-clogz-geo-whatsapp]');
    if(help)help.hidden=!selected;
    if(button)button.setAttribute('aria-expanded',String(selected));
  });
}
function cleanMessages(){
  whatsappState();
  if(drawPosition()){
    const radius=Number(attrs['GPS précision (m)']);
    if(Number.isFinite(radius)&&radius>100)setStatus('✓ Position enregistrée, mais précision estimée à '+Math.round(radius)+' m : vérifie bien ton adresse au paiement.','warning');
    else setStatus('✓ Position enregistrée'+(Number.isFinite(radius)&&radius>0?' · précision estimée : '+Math.round(radius)+' m':'')+'.','success');
  }else if(attrs['Mode de localisation']==='WhatsApp après commande'){
    setStatus('✓ WhatsApp choisi : envoie la position du lieu de livraison après ta commande.','success');
  }else{
    setStatus('Le partage de position est facultatif. Tu peux aussi renseigner ton adresse de livraison.','');
  }
}
widgets.forEach(w=>{
  const share=w.querySelector('[data-clogz-geo-share]');
  const remove=w.querySelector('[data-clogz-geo-remove]');
  const whatsapp=w.querySelector('[data-clogz-geo-whatsapp]');
  whatsapp?.addEventListener('click',async()=>{
    if(locating)return;
    whatsapp.disabled=true;
    try{
      await save({...textValues(w),'Mode de localisation':'WhatsApp après commande','GPS latitude':'','GPS longitude':'','GPS précision (m)':'','Lien Google Maps':''});
      syncText(attrs);cleanMessages();
    }catch(e){setStatus('Impossible d’enregistrer ce choix, réessaie.','error');}
    finally{whatsapp.disabled=false;}
  });
  w.querySelectorAll('[data-clogz-geo-field]').forEach(input=>{
    input.addEventListener('input',()=>{
      const others={};others[input.dataset.clogzGeoField]=input.value;
      syncText(others);
    });
    input.addEventListener('change',async()=>{
      try {await save(textValues(w));}
      catch(e){setStatus('Le quartier n’a pas pu être enregistré. Réessaie avant de commander.','error');}
    });
  });
  share?.addEventListener('click',()=>{
    if(locating)return;
    if(!window.isSecureContext||!navigator.geolocation){setStatus('Localisation indisponible ici. Indique ton quartier et utilise WhatsApp après commande.','error');return;}
    locating=true;
    widgets.forEach(x=>{const b=x.querySelector('[data-clogz-geo-share]');if(b){b.disabled=true;b.setAttribute('aria-busy','true');}});
    setStatus('Demande de position… autorise la localisation dans ton navigateur.','');
    navigator.geolocation.getCurrentPosition(async position=>{
      try{
        const p=position.coords;
        if(!Number.isFinite(p.latitude)||!Number.isFinite(p.longitude))throw new Error('Position non valide');
        const lat=p.latitude.toFixed(6),lng=p.longitude.toFixed(6);
        const map='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(lat+','+lng);
        await save({...textValues(w),'Mode de localisation':'GPS du navigateur','GPS latitude':lat,'GPS longitude':lng,'GPS précision (m)':String(Math.round(p.accuracy||0)),'Lien Google Maps':map});
        syncText(attrs);
        cleanMessages();
      }catch(e){setStatus('Impossible d’enregistrer la position. Réessaie ou envoie ta localisation sur WhatsApp après commande.','error');}
      finally{locating=false;widgets.forEach(x=>{const b=x.querySelector('[data-clogz-geo-share]');if(b){b.disabled=false;b.removeAttribute('aria-busy');}});}
    },error=>{
      locating=false;
      widgets.forEach(x=>{const b=x.querySelector('[data-clogz-geo-share]');if(b){b.disabled=false;b.removeAttribute('aria-busy');}});
      const msg=error.code===1?'Localisation refusée.':'Position introuvable ou demande expirée.';
      setStatus(msg+' Tu peux continuer sans GPS et envoyer ta position par WhatsApp après commande.','error');
    },{enableHighAccuracy:true,timeout:15000,maximumAge:0});
  });
  remove?.addEventListener('click',async()=>{
    if(locating)return;
    remove.disabled=true;
    try{
      await save({'Mode de localisation':'','GPS latitude':'','GPS longitude':'','GPS précision (m)':'','Lien Google Maps':''});
      cleanMessages();
    }catch(e){setStatus('Impossible de supprimer la position pour le moment. Réessaie.','error');}
    finally{remove.disabled=false;}
  });
});
fetch(root+'cart.js',{credentials:'same-origin',headers:{Accept:'application/json'}}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(cart=>{
  attrs=cart.attributes||{};
  syncText(attrs);
  cleanMessages();
}).catch(()=>{});
// Checkout is coordinated by clogz-checkout-unified.js; never replay synthetic clicks.

})();