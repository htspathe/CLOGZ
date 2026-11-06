/* CLOGZ: securely updates actual Shopify cart quantities, then launches Shopify native checkout.
   Checkout creates the real order server-side. COD must be enabled in Shopify admin.
   No Admin token or browser-side order creation. */
(()=>{
'use strict';
const action=document.getElementById('ClogzNativeCheckoutButton');
const form=document.querySelector('[data-clogz-cart-form]');
if(!action || !form)return;
action.addEventListener('click',async()=>{
 const inputs=Array.from(form.querySelectorAll('input[name="updates[]"]'));
 const quantities=inputs.map(el=>Number(el.value));
 if(quantities.some(n=>!Number.isInteger(n)||n<0||n>999)){window.alert('Vérifie les quantités du panier.');return}
 action.disabled=true;action.setAttribute('aria-busy','true');
 const endpointRoot=window.Shopify?.routes?.root||window.CLOGZ?.routes?.root||'/';
 const root=endpointRoot.endsWith('/')?endpointRoot:endpointRoot+'/';
 try{
   const cartResponse=await fetch(root+'cart.js',{credentials:'same-origin',headers:{'Accept':'application/json'}});
   if(!cartResponse.ok)throw new Error('Impossible de vérifier le panier');
   const cart=await cartResponse.json();
   if(cart.items.some(item=>item.vendor !== 'CLOGZ'))throw new Error('Retire les articles hors CLOGZ avant de continuer');
   if(quantities.length!==cart.items.length)throw new Error('Le panier a changé. Actualise la page.');
   const updateResponse=await fetch(root+'cart/update.js',{
     method:'POST',credentials:'same-origin',
     headers:{'Content-Type':'application/json','Accept':'application/json'},
     body:JSON.stringify({updates:quantities})
   });
   if(!updateResponse.ok)throw new Error('Impossible de mettre à jour le panier');
   const updated=await updateResponse.json();
   if(!updated.item_count)throw new Error('Le panier est vide. Ajoute au moins un article.');
   window.location.assign(root+'checkout');
 }catch(error){
   window.alert(error.message||'Une erreur est survenue.');
   action.disabled=false;action.removeAttribute('aria-busy');
 }
});
})();