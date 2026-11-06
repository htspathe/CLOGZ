/* CLOGZ tracking: real status only via configured HTTPS backend. No Shopify Admin token here. */
(()=>{'use strict';
function ready(){
 const root=document.querySelector('[data-clogz-track]');if(!root)return;
 const form=root.querySelector('[data-clogz-tracking-form]');
 const input=root.querySelector('#ClogzTrackingCode');
 const error=root.querySelector('[data-clogz-tracking-error]');
 const result=root.querySelector('[data-clogz-tracking-result]');
 const demoBtn=root.querySelector('[data-clogz-tracking-demo]');
 const timeline=root.querySelector('[data-clogz-demo-timeline]');
 const label=root.querySelector('[data-clogz-result-label]');
 const number=root.querySelector('[data-clogz-result-code]');
 const title=root.querySelector('[data-clogz-result-title]');
 const copy=root.querySelector('[data-clogz-result-copy]');
 const note=root.querySelector('[data-clogz-result-note]');
 const whatsapp=root.querySelector('[data-clogz-tracking-whatsapp]');
 const modifier=root.querySelector('[data-cz-modify-link]');
 const demo='CZ-TEST9';
 const api=(root.getAttribute('data-clogz-api-url')||'').trim().replace(/\/$/,'');
 const apiConfigured=/^https:\/\/[a-z0-9.-]+(?::443)?$/i.test(api);
 const steps=['Commande reçue','Commande confirmée','En livraison','Livrée'];
 if(apiConfigured&&demoBtn?.parentElement)demoBtn.parentElement.hidden=true;
 function fail(message){error.textContent=message;error.hidden=false;result.hidden=true}
 function focusResult(){result.hidden=false;result.focus({preventScroll:true});result.scrollIntoView({behavior:'smooth',block:'start'})}
 function wa(code){let m=code?'Bonjour CLOGZ, je souhaite le suivi du code '+code+'.':'Bonjour CLOGZ, je souhaite suivre ma commande.';whatsapp.href='https://wa.me/221788770615?text='+encodeURIComponent(m)}
 function drawTimeline(done,demoMode){
   const rows=[...timeline.querySelectorAll('li')];rows.forEach((r,i)=>{
     r.classList.toggle('is-done',Boolean(done[i]));
     r.querySelector('.cz-track__node').textContent=done[i]?'✓':String(i+1);
     r.querySelector('strong').textContent=steps[i];
     r.querySelector('small').textContent=demoMode?(['Exemple : commande reçue','Exemple : disponibilité confirmée','Non commencée dans cette démonstration','Non commencée dans cette démonstration'][i]):
       (done[i]?['Commande enregistrée','Disponibilité validée par CLOGZ','Livreur en route','Livraison confirmée'][i]:'En attente de confirmation');
   });timeline.hidden=false;
 }
 async function submit(){
   const code=input.value.trim().toUpperCase().replace(/\s+/g,'');
   input.value=code;error.hidden=true;error.textContent='';result.hidden=true;
   if(!code){fail('Entre ton code de suivi CLOGZ.');return}
   if(!/^CZ-[A-HJ-NP-Z2-9]{5}$/.test(code)){fail('Le code doit être au format CZ-XXXXX : 5 lettres majuscules ou chiffres, sans I, O, 0 ni 1.');return}
   wa(code);number.textContent=code;if(modifier)modifier.href='/pages/modifier-commande#'+encodeURIComponent(code);
   if(code===demo&&!apiConfigured){
     label.textContent='DÉMONSTRATION · DONNÉES FICTIVES';title.textContent='Voici comment le suivi apparaîtra';
     copy.textContent='Exemple d’une commande confirmée, sans lien avec une vraie commande Shopify.';
     drawTimeline([true,true,false,false],true);
     note.textContent='Mode démo : aucun paiement, stock ou expédition modifié.';focusResult();return;
   }
   if(!apiConfigured){
     label.textContent='SERVICE EN COURS DE CONFIGURATION';title.textContent='Le suivi automatique est en préparation';
     copy.textContent='Le suivi automatique n’est pas encore disponible sur le site. Pour vérifier l’état réel d’une commande, contacte CLOGZ avec son numéro Shopify.';
     timeline.hidden=true;note.textContent='Aucune information privée n’est affichée. Pour connaître le statut, contacte CLOGZ sur WhatsApp.';
     focusResult();return;
   }
   const button=form.querySelector('button[type="submit"]');if(button){button.disabled=true;button.setAttribute('aria-busy','true')}
   try{
     const response=await fetch(api+'/api/track',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})});
     if(!response.ok){
       if(response.status===404)throw new Error('Code de suivi introuvable. Vérifie ton code ou contacte CLOGZ.');
       if(response.status===429)throw new Error('Trop de tentatives de recherche. Réessaie plus tard ou contacte CLOGZ.');
       throw new Error('Le suivi est temporairement indisponible. Contacte CLOGZ sur WhatsApp.');
     }
     const data=await response.json();
     if(!data||!Array.isArray(data.steps)||data.steps.length!==4)throw new Error('Réponse de suivi invalide.');
     label.textContent='STATUT RÉEL DE LA COMMANDE';
     title.textContent='Commande '+String(data.orderNumber||'')+' · '+String(data.status||'Statut à confirmer');
     copy.textContent='Paiement : '+String(data.payment||'À confirmer')+'.';
     drawTimeline(data.steps,false);
     note.textContent='Données provenant de Shopify. Le départ du livreur et la livraison sont confirmés manuellement par CLOGZ.';
     focusResult();
   }catch(e){fail(e.message||'Impossible de consulter le suivi pour le moment.')}
   finally{if(button){button.disabled=false;button.removeAttribute('aria-busy')}}
 }
 form.addEventListener('submit',e=>{e.preventDefault();submit()});
 input.addEventListener('input',()=>{error.hidden=true;result.hidden=true;wa('')});
 demoBtn.addEventListener('click',()=>{input.value=demo;submit()});
 const rawHash=decodeURIComponent((window.location.hash||'').replace(/^#/,'')).trim().toUpperCase();
 if(/^CZ-[A-HJ-NP-Z2-9]{5}$/.test(rawHash)){
   input.value=rawHash;submit();
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();