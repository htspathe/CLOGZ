/* CLOGZ: save Dakar delivery zone in Shopify cart attributes before checkout. */
(()=>{
'use strict';
const link=document.getElementById('ClogzCheckoutLink');
const drawerSelect=document.getElementById('ClogzZone-drawer');
const form=document.querySelector('[data-clogz-cart-form]');
const cartSelect=document.getElementById('ClogzZone-cart');
function validateZone(select) {
  if(!select)return true;
  const valid=Boolean(select.value);
  const error=select.closest('[data-clogz-zone-wrapper]')?.querySelector('[data-clogz-zone-error]');
  if(error){error.hidden=valid;error.textContent=valid?'':'Sélectionne d’abord ton quartier.';}
  if(!valid){select.focus();select.reportValidity();}
  return valid;
}
form?.addEventListener('submit',event=>{
  if(event.submitter?.name==='checkout'&&!validateZone(cartSelect))event.preventDefault();
});
link?.addEventListener('click',async event=>{
  event.preventDefault();
  if(link.hidden||link.getAttribute('aria-disabled')==='true')return;
  if(!validateZone(drawerSelect))return;
  const selectedZone=drawerSelect.value;
  const root=window.Shopify?.routes?.root || window.CLOGZ?.routes?.root || '/';
  const endpoint=(root.endsWith('/')?root:root+'/')+'cart/update.js';
  link.setAttribute('aria-busy','true');link.style.pointerEvents='none';
  try {
    const response=await fetch(endpoint,{
      method:'POST',credentials:'same-origin',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify({attributes:{'Zone de livraison':selectedZone}})
    });
    if(!response.ok)throw new Error('Enregistrement impossible');
    window.location.assign(link.href);
  }catch(error){
    const note=drawerSelect.closest('[data-clogz-zone-wrapper]')?.querySelector('[data-clogz-zone-error]');
    if(note){note.textContent='La zone n’a pas pu être enregistrée. Réessaie ou passe par la page panier.';note.hidden=false;}
  }finally{
    link.removeAttribute('aria-busy');link.style.pointerEvents='';
  }
});
[cartSelect,drawerSelect].forEach(select=>{
  select?.addEventListener('change',()=>{
    const error=select.closest('[data-clogz-zone-wrapper]')?.querySelector('[data-clogz-zone-error]');
    if(error)error.hidden=true;
  });
});
})();