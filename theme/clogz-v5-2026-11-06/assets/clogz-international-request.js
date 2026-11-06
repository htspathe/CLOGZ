/* CLOGZ — demandes depuis l'étranger :
   remise gratuite au destinataire/GP à Dakar OU demande d'expédition hors Sénégal.
   Le transport du GP au-delà de Dakar n'est pas pris en charge par CLOGZ.
   Aucun paiement / commande n'est créé par ce formulaire de contact. */
(()=>{
'use strict';
if(!location.pathname.includes('/pages/contact-clogz'))return;
const search=new URLSearchParams(location.search);
const requested=search.get('commande')==='internationale';
const mode=document.getElementById('ClogzIntlDeliveryMode');
const subject=document.getElementById('ClogzContactSubject');
const country=document.getElementById('ClogzIntlCountry');
const city=document.getElementById('ClogzIntlCity');
const quartier=document.getElementById('ClogzContactZone');
const recipient=document.getElementById('ClogzIntlRecipient');
const recipientPhone=document.getElementById('ClogzIntlRecipientPhone');
const body=document.getElementById('ClogzContactBody');
const submit=document.getElementById('ClogzContactSubmit');
const core=['[data-clogz-intl-delivery-mode]','[data-clogz-intl-header]'];
const foreign=['[data-clogz-intl-country]','[data-clogz-intl-city]'];
const local=['[data-clogz-intl-recipient]','[data-clogz-intl-recipient-phone]'];
function visibility(sels,shown){
 sels.forEach(s=>document.querySelectorAll(s).forEach(el=>{el.hidden=!shown}));
}
function render(){
 const abroad=mode?.value==='Hors Sénégal — expédition internationale';
 visibility(core,requested);
 visibility(foreign,requested&&abroad);
 visibility(local,requested&&!abroad);
 if(country)country.required=requested&&abroad;
 if(city)city.required=requested&&abroad;
 if(recipient)recipient.required=requested&&!abroad;
 if(recipientPhone)recipientPhone.required=requested&&!abroad;
 if(quartier)quartier.required=requested&&!abroad;
}
if(!requested){render();return;}
if(mode)mode.value=search.get('livraison')==='etranger'?'Hors Sénégal — expédition internationale':'Dakar — GP / transporteur';
if(subject)subject.value='Commande internationale — devis';
if(submit)submit.textContent='Envoyer ma demande';
render();
mode?.addEventListener('change',render);
if(!body||body.value.trim())return;
const intro='Bonjour CLOGZ, je souhaite commander depuis l’étranger. Pourriez-vous me confirmer la disponibilité des modèles, les conditions de remise ou d’expédition et les modalités de paiement ? Merci d’avance.\n\n';
body.value=intro+'Articles souhaités :\n';
const initial=body.value;
const root=(window.Shopify?.routes?.root||window.CLOGZ?.routes?.root||'/').replace(/\/?$/,'/');
fetch(root+'cart.js',{credentials:'same-origin',headers:{Accept:'application/json'}})
.then(r=>{if(!r.ok)throw Error('Panier inaccessible');return r.json()})
.then(cart=>{
 if(body.value!==initial)return;
 const items=(cart.items||[]).filter(i=>i.vendor?.toUpperCase()==='CLOGZ').map(i=>{
 const variant=i.variant_title&&i.variant_title!=='Default Title'?' — '+i.variant_title:'';
 return '- '+(i.product_title||i.title||'Sabot CLOGZ')+variant+' × '+i.quantity;
 });
 body.value=intro+(items.length?items.join('\n'):'Précise les modèles, couleurs, pointures et quantités souhaités.')+'\n\nPrécisions : ';
})
.catch(()=>{if(body.value===initial)body.value=intro+'Précise les modèles, couleurs, pointures et quantités souhaités.\n\nPrécisions : ';});
})();