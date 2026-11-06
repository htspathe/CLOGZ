/* CLOGZ V3 TEST — save ordering country and optional separate WhatsApp number as cart attributes.
   Shipping phone and delivery country are required/collected at native Shopify checkout.
   This script never creates orders and does not alter earlier orders. */
(()=>{
  'use strict';
  const panels=[...document.querySelectorAll('[data-clogz-order-details]')];
  if(!panels.length)return;
  const root=(window.Shopify?.routes?.root||window.CLOGZ?.routes?.root||'/').replace(/\/?$/,'/');
  const allowed=new WeakSet();
  let saving=false;
  function get(panel){
    return {
      country:(panel.querySelector('[data-clogz-order-country]')?.value||'').trim(),
      different:!!panel.querySelector('[data-clogz-order-whatsapp-different]')?.checked,
      whatsapp:(panel.querySelector('[data-clogz-order-whatsapp]')?.value||'').trim()
    };
  }
  function toggle(panel){
    const different=panel.querySelector('[data-clogz-order-whatsapp-different]')?.checked;
    const group=panel.querySelector('[data-clogz-order-whatsapp-group]');
    const phone=panel.querySelector('[data-clogz-order-whatsapp]');
    if(group)group.hidden=!different;
    if(phone)phone.required=!!different;
  }
  function sync(source){
    const info=get(source);
    panels.forEach(panel=>{
      if(panel===source)return;
      const country=panel.querySelector('[data-clogz-order-country]');
      const check=panel.querySelector('[data-clogz-order-whatsapp-different]');
      const whatsapp=panel.querySelector('[data-clogz-order-whatsapp]');
      if(country)country.value=info.country;
      if(check)check.checked=info.different;
      if(whatsapp)whatsapp.value=info.whatsapp;
      toggle(panel);
    });
  }
  function error(panel,message,focus){
    const line=panel.querySelector('[data-clogz-order-error]');
    if(line){line.hidden=!message;line.textContent=message||''}
    if(message&&focus){focus.focus();focus.setAttribute('aria-invalid','true');}
  }
  function check(panel){
    const country=panel.querySelector('[data-clogz-order-country]');
    const phone=panel.querySelector('[data-clogz-order-whatsapp]');
    const data=get(panel);
    if(country)country.removeAttribute('aria-invalid');
    if(phone)phone.removeAttribute('aria-invalid');
    if(!data.country){error(panel,'Indique le pays depuis lequel tu commandes.',country);return null;}
    if(data.different&&data.whatsapp.replace(/\D/g,'').length<7){
      error(panel,'Saisis ton numéro WhatsApp complet, avec l’indicatif du pays.',phone);return null;
    }
    error(panel,'');
    return data;
  }
  panels.forEach(panel=>{
    toggle(panel);
    panel.addEventListener('input',e=>{
      if(e.target.matches?.('[data-clogz-order-country],[data-clogz-order-whatsapp]')){error(panel,'');sync(panel);}
    });
    panel.addEventListener('change',e=>{
      if(e.target.matches?.('[data-clogz-order-whatsapp-different]')){toggle(panel);error(panel,'');sync(panel);}
    });
  });
  // Capturing after CLOGZ GPS handler ensures the existing delivery/GPS data is saved first.
  // Checkout is coordinated by clogz-checkout-unified.js; never replay synthetic clicks.

})();