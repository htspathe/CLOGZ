/* CLOGZ: change a plain clog's variant in the shopping cart, never edits placed orders. */
(()=>{'use strict';
const cartPage=document.querySelector('[data-clogz-page-cart]');
if(!cartPage)return;
const root=(window.Shopify?.routes?.root||window.CLOGZ?.routes?.root||'/').replace(/\/?$/,'/');
const endpoint=path=>root+'cart'+path;
const status=cartPage.querySelector('[data-clogz-live-cart-status]');
let running=false;
function report(editor,message,bad=true){
 const p=editor.querySelector('[data-cz-choice-feedback]');
 if(p){p.hidden=false;p.textContent=message;p.style.color=bad?'#903329':'#276644';}
 if(status){status.textContent=message;}
}
async function jsonResponse(response){
 const data=await response.json().catch(()=>null);
 if(!response.ok)throw new Error(data?.description||data?.message||'La modification a échoué. Réessaie.');
 return data;
}
cartPage.addEventListener('click',async event=>{
 const button=event.target.closest('[data-cz-apply-choice]');
 if(!button||running)return;
 event.preventDefault();
 const editor=button.closest('[data-cz-cart-choice]');
 if(!editor)return;
 const key=editor.dataset.czOriginalKey;
 const handle=editor.querySelector('[data-cz-color]')?.value||'';
 const size=editor.querySelector('[data-cz-size]')?.value||'';
 if(!key||!/^[a-z0-9][a-z0-9-]*$/.test(handle)||!/^(3[6-9]|4[0-6])$/.test(size)){report(editor,'Choisis une couleur et une pointure valides.');return;}
 const dirty=[...cartPage.querySelectorAll('input.clogz-cart-qty')].some(input=>input.value!==input.defaultValue);
 if(dirty){report(editor,"Enregistre d'abord les quantités modifiées avant de changer de pointure.");return}
 running=true;button.disabled=true;button.setAttribute('aria-busy','true');report(editor,'Vérification du nouveau choix…',false);
 try{
  const cart=await jsonResponse(await fetch(endpoint('.js'),{credentials:'same-origin',headers:{Accept:'application/json'},cache:'no-store'}));
  const current=cart.items?.find(i=>i.key===key);
  if(!current)throw new Error('Le panier a changé. Actualise la page et réessaie.');
  if(current.vendor!=='CLOGZ'||current.product_type!=='Sabots')throw new Error('Cette modification ne concerne que les sabots simples CLOGZ.');
  if(Object.keys(current.properties||{}).length)throw new Error('Cette paire comporte des options particulières. Contacte CLOGZ pour la modifier.');
  const product=await jsonResponse(await fetch(root+'products/'+encodeURIComponent(handle)+'.js',{credentials:'same-origin',headers:{Accept:'application/json'},cache:'no-store'}));
  if(product.vendor!=='CLOGZ'||product.type!=='Sabots')throw new Error('Choisis un modèle de sabot CLOGZ valide.');
  const variant=(product.variants||[]).find(v=>String(v.option1||v.title)===size);
  if(!variant)throw new Error("Cette pointure n'existe pas pour le modèle choisi.");
  if(!variant.available)throw new Error('Cette pointure est indisponible en ligne. Contacte CLOGZ pour vérifier le stock.');
  if(Number(variant.id)===Number(current.variant_id)){report(editor,'Tu as déjà cette couleur et cette pointure dans le panier.',false);return;}
  if(Number(variant.price)!==Number(current.price)){
    if(!window.confirm('Le prix de ce modèle est différent. Veux-tu continuer en vérifiant ensuite le total de ton panier ?'))return;
  }
  const matches=cart.items.filter(i=>Number(i.variant_id)===Number(variant.id)&&i.key!==current.key);
  if(matches.length>1||matches.some(i=>Object.keys(i.properties||{}).length))throw new Error("Impossible de regrouper automatiquement ces articles. Retire la paire à remplacer puis ajoute la nouvelle.");
  const target=matches[0];
  const updates={};
  updates[current.key]=0;
  updates[target?target.key:String(variant.id)]=Number(current.quantity)+Number(target?.quantity||0);
  const updated=await jsonResponse(await fetch(endpoint('/update.js'),{
    method:'POST',credentials:'same-origin',
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify({updates})
  }));
  if(!updated.items?.some(i=>Number(i.variant_id)===Number(variant.id))||updated.items?.some(i=>i.key===current.key)){
    throw new Error('Modification à vérifier. Recharge ton panier pour contrôler les articles avant de commander.');
  }
  report(editor,'Choix enregistré ! Actualisation du panier…',false);
  window.location.reload();
 }catch(error){report(editor,error.message||'Impossible de modifier ton panier pour le moment.');}
 finally{running=false;button.disabled=false;button.removeAttribute('aria-busy');}
});
})();