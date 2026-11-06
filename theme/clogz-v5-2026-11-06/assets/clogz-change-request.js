/* CLOGZ: customer-initiated WhatsApp change request. Does NOT edit Shopify orders. */
(()=>{'use strict';function init(){
 const root=document.querySelector('[data-cz-change-request]');if(!root)return;
 const form=root.querySelector('[data-cz-change-form]');
 const reference=root.querySelector('#CzChangeReference');
 const original=root.querySelector('#CzChangeProduct');
 const type=root.querySelector('#CzChangeType');
 const color=root.querySelector('#CzChangeColor'),size=root.querySelector('#CzChangeSize');
 const colorWrap=root.querySelector('[data-cz-change-color-wrap]');
 const sizeWrap=root.querySelector('[data-cz-change-size-wrap]');
 const error=root.querySelector('[data-cz-change-error]');
 function showError(message){error.hidden=false;error.textContent=message;error.focus?.();}
 function clearError(){error.hidden=true;error.textContent='';}
 function sync(){
   const needsColor=type.value==='color'||type.value==='both';
   const needsSize=type.value==='size'||type.value==='both';
   colorWrap.hidden=!needsColor;sizeWrap.hidden=!needsSize;
   color.disabled=!needsColor;color.required=needsColor;
   size.disabled=!needsSize;size.required=needsSize;
   clearError();
 }
 type.addEventListener('change',sync);
 const hash=decodeURIComponent((window.location.hash||'').slice(1)).trim().toUpperCase();
 if(/^CZ-[A-HJ-NP-Z2-9]{5}$/.test(hash))reference.value=hash;
 sync();
 form.addEventListener('submit',event=>{
   event.preventDefault();clearError();
   const code=reference.value.trim().toUpperCase();
   if(!(/^(?:CZ-[A-HJ-NP-Z2-9]{5}|#?[0-9]{4,8})$/.test(code))||code==='CZ-TEST9'){
     showError('Entre ton code réel CZ-XXXXX ou ton numéro de commande (ex. #1004). Le code démo ne permet pas de modifier une commande.');return;
   }
   if(!form.checkValidity()){form.reportValidity();return;}
   const colorWanted=type.value==='color'||type.value==='both';
   const sizeWanted=type.value==='size'||type.value==='both';
   if((colorWanted&&!color.value)||(sizeWanted&&!size.value)){
     showError('Choisis la nouvelle couleur et/ou la nouvelle pointure.');return;
   }
   const lines=[
     'Bonjour CLOGZ 👟,',
     'Je souhaiterais modifier la pointure et/ou la couleur de ma commande, si cela reste possible avant l’expédition.',
     'Référence : '+code,
     original.value.trim()?('Paire concernée : '+original.value.trim()):null,
     'Modification : '+(type.value==='both'?'Couleur et pointure':(type.value==='color'?'Couleur':'Pointure')),
     colorWanted?'Nouvelle couleur : '+color.value:null,
     sizeWanted?'Nouvelle pointure : '+size.value:null,
     'Je comprends que cette demande sera examinée par CLOGZ selon la disponibilité et l’avancement de la commande.',
     'Merci de me confirmer si ce changement est possible.'
   ].filter(Boolean);
   window.location.assign('https://wa.me/221788770615?text='+encodeURIComponent(lines.join('\n')));
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();