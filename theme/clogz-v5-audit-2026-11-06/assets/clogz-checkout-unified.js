/* CLOGZ — One checkout coordinator (drawer + full cart). No synthetic clicks. */
(()=>{'use strict';
const ids='#ClogzCheckoutLink,#ClogzNativeCheckoutButton,[data-clogz-quick-checkout]';
let busy=false;
const rawRoot=window.Shopify?.routes?.root||window.CLOGZ?.routes?.root||'/';
const root=rawRoot.endsWith('/')?rawRoot:rawRoot+'/';
function note(action,message){
 let el=document.querySelector('#ClogzCheckoutFlowMessage');
 if(!el){
   el=document.createElement('p');el.id='ClogzCheckoutFlowMessage';
   el.setAttribute('role','alert');el.setAttribute('aria-live','assertive');
   el.style.cssText='background:#fff1eb;color:#8f2e20;border:1px solid #e5b7a7;border-radius:12px;padding:12px;margin:12px 0;font-size:13px;line-height:1.5;';
   action.parentElement?.insertAdjacentElement('afterend',el);
 }
 el.textContent=message;el.hidden=!message;
}
function fieldError(panel,input,message,action){
 if(panel){
   let el=panel.querySelector('[data-clogz-order-error]');
   if(el){el.textContent=message;el.hidden=false;}
 }
 note(action,message);
 if(input){input.setAttribute('aria-invalid','true');input.focus({preventScroll:false});input.scrollIntoView({block:'center',behavior:'smooth'});}
}
document.addEventListener('click',async event=>{
 const action=event.target.closest?.(ids);
 if(!action)return;
 event.preventDefault();event.stopImmediatePropagation();
 if(busy||action.hidden||action.disabled||action.getAttribute('aria-disabled')==='true')return;
 const drawer=action.closest('#ClogzDrawer');
 const area=drawer||document.querySelector('[data-clogz-page-cart]')||document;
 const details=area.querySelector('[data-clogz-order-details]');
 const country=details?.querySelector('[data-clogz-order-country]');
 const diff=details?.querySelector('[data-clogz-order-whatsapp-different]')?.checked;
 const wa=details?.querySelector('[data-clogz-order-whatsapp]');
 const currentCountry=(country?.value||'Sénégal').trim();
 if(!currentCountry){fieldError(details,country,'Indique le pays depuis lequel tu commandes pour continuer.',action);return;}
 if(diff&&(wa?.value||'').replace(/[^0-9]/g,'').length<7){fieldError(details,wa,'Indique ton numéro WhatsApp complet, avec indicatif, ou décoche la case.',action);return;}
 const geo=area.querySelector('[data-clogz-delivery-gps]');
 const position=geo?.querySelector('[data-clogz-geo-share]');
 if(position?.disabled){note(action,'La localisation est encore en cours. Réessaie après sa confirmation.');return;}
 const form=action.closest('[data-clogz-page-cart]')?document.querySelector('[data-clogz-cart-form]'):null;
 const quantities=form?[...form.querySelectorAll('input[name="updates[]"]')].map(input=>Number(input.value)):null;
 if(quantities?.some(n=>!Number.isInteger(n)||n<0||n>999)){note(action,'Vérifie les quantités du panier puis réessaie.');return;}
 busy=true;
 const old=action.textContent;action.setAttribute('aria-busy','true');action.style.pointerEvents='none';
 action.textContent='Vérification de ta commande…';note(action,'');
 try{
   const response=await fetch(root+'cart.js',{credentials:'same-origin',headers:{Accept:'application/json'}});
   if(!response.ok)throw Error('Impossible de vérifier le panier. Vérifie ta connexion.');
   const cart=await response.json();
   if(!cart.items?.length)throw Error('Ton panier est vide. Ajoute une paire pour continuer.');
   if(cart.items.some(item=>String(item.vendor||'').toUpperCase()!=='CLOGZ'))throw Error('Retire les articles hors CLOGZ avant de continuer.');
   if(quantities&&quantities.length!==cart.items.length)throw Error('Ton panier a changé. Actualise la page puis recommence.');
   const attributes={...(cart.attributes||{}),
     'Pays de commande':currentCountry,
     'WhatsApp (si différent)':diff?(wa?.value||'').trim():''
   };
   const quartier=(geo?.querySelector('[data-clogz-geo-field="Quartier de livraison"]')?.value||'').trim();
   if(quartier)attributes['Quartier de livraison']=quartier;
   const payload={attributes};
   if(quantities)payload.updates=quantities;
   const update=await fetch(root+'cart/update.js',{method:'POST',credentials:'same-origin',
     headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)});
   const updated=await update.json().catch(()=>null);
   if(!update.ok)throw Error(updated?.description||updated?.message||'Impossible d’enregistrer les informations de commande.');
   if(!updated?.item_count)throw Error('Le panier est vide après mise à jour.');
   window.location.assign(root+'checkout');
 }catch(error){note(action,error?.message||'La validation a échoué. Réessaie ou contacte CLOGZ.');
   action.textContent=old;action.style.pointerEvents='';action.removeAttribute('aria-busy');busy=false;
 }
},true);
})();