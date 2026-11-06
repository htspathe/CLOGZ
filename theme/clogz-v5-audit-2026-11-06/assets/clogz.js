/* CLOGZ Shopify OS 2.0. No demo/cart mock data: uses Shopify cart Ajax endpoints. */
(()=>{'use strict';
const cfg=window.CLOGZ||{};const root=(cfg.routes?.root||'/').replace(/\/?$/,'/');
const $=(s,scope=document)=>scope.querySelector(s);const $$=(s,scope=document)=>Array.from(scope.querySelectorAll(s));
let toastTimer;
function toast(msg){const t=$('#ClogzToast');if(!t)return;t.textContent=msg;t.classList.add('is-visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('is-visible'),3000)}
function money(cents){const amount=Number(cents)/100;if(!Number.isFinite(amount))return '—';const cur=cfg.currency||'XOF';if(cur==='XOF')return new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(amount).replace(/[  ]/g,' ')+' FCFA';if(window.Shopify?.formatMoney){try{return Shopify.formatMoney(cents,cfg.moneyFormat)}catch(e){}}try{return new Intl.NumberFormat('fr-FR',{style:'currency',currency:cur}).format(amount)}catch(e){return amount.toLocaleString('fr-FR')+' '+cur}}
function cartUrl(path){return root+'cart'+path}
const drawer=$('#ClogzDrawer');const overlay=$('#ClogzOverlay');const items=$('#ClogzCartItems');
function showDrawer(){if(!drawer)return;drawer.hidden=false;overlay.hidden=false;drawer.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('#ClogzCloseCart')?.focus()}
function hideDrawer(){if(!drawer)return;drawer.hidden=true;overlay.hidden=true;drawer.setAttribute('aria-hidden','true');document.body.style.overflow=''}
document.querySelectorAll('[data-open-cart]').forEach(b=>b.addEventListener('click',async(e)=>{e.preventDefault();showDrawer();await updateCart()}));
document.querySelectorAll('[data-continue-shopping]').forEach(b=>b.addEventListener('click',()=>{hideDrawer()}));
$('#ClogzCloseCart')?.addEventListener('click',hideDrawer);overlay?.addEventListener('click',hideDrawer);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!drawer?.hidden)hideDrawer()});
function node(type,className,text){const n=document.createElement(type);if(className)n.className=className;if(text!=null)n.textContent=String(text);return n}
async function getCart(){const r=await fetch(cartUrl('.js'),{headers:{Accept:'application/json'}});if(!r.ok)throw new Error('Impossible de récupérer le panier');return r.json()}
function renderCart(cart){$$('[data-cart-count]').forEach(el=>{el.textContent=cart.item_count;el.setAttribute('aria-label',cart.item_count+' article(s)')});if(!items)return;items.replaceChildren();drawer?.classList.toggle('is-empty',cart.item_count===0);drawer?.classList.remove('is-error');if(!cart.items.length){const empty=node('div','clogz-cart-empty');empty.append(node('strong','','Ton panier est vide.'));empty.append(node('p','','Choisis ton coloris et ta pointure pour commencer.'));const discover=node('a','clogz-pill clogz-pill--green','Explorer les sabots');discover.href='/collections/clogz-tous-les-sabots';empty.append(discover);items.append(empty)}
// Shop cart cookies are shared across themes. Do not show or check out other brands.
const hasOtherBrand=cart.items.some(item=>item.vendor && item.vendor.toUpperCase()!=='CLOGZ');
const checkoutLink=$('#ClogzCheckoutLink');if(checkoutLink){checkoutLink.hidden=hasOtherBrand||cart.item_count===0;checkoutLink.setAttribute('aria-disabled',String(hasOtherBrand||cart.item_count===0));checkoutLink.tabIndex=(hasOtherBrand||cart.item_count===0)?-1:0}
const outsideNotice=$('#ClogzCartBrandNotice');if(outsideNotice)outsideNotice.hidden=!hasOtherBrand;
const firstPack=cart.items.find(item=>[15430136037436,15430136135740].includes(Number(item.product_id)));
const editPackLink=$('#ClogzEditPackLink');if(editPackLink){editPackLink.hidden=!firstPack;if(firstPack)editPackLink.href='/pages/packs?edit_key='+encodeURIComponent(firstPack.key);}

cart.items.forEach(item=>{
  if(item.vendor && item.vendor.toUpperCase()!=='CLOGZ'){
    const wrap=node('article','clogz-drawer__item');
    const body=node('div');
    body.append(node('strong','','Article hors CLOGZ'));
    body.append(node('p','clogz-muted','À retirer pour passer commande'));
    const remove=node('button','clogz-pill clogz-pill--line','Retirer');
    remove.type='button';remove.addEventListener('click',()=>changeQty(item.key,0));
    wrap.append(body);remove.className='clogz-cart__remove';remove.setAttribute('aria-label','Retirer cet article');wrap.append(remove);items.append(wrap);return;
  }
  const wrap=node('article','clogz-drawer__item');
  if(item.image){const image=node('img');image.src=item.handle==='sabots-clogz-gris'?'https://cdn.shopify.com/s/files/1/0783/6398/3932/files/clogz-v5-gris-ardoise-fonce-transparent-20261106.webp?v=1793934849':item.handle==='sabots-clogz-bleu-ciel'?'https://cdn.shopify.com/s/files/1/0783/6398/3932/files/clogz-v5-bleu-cadrage-harmonise-20261106.png?v=1793929804':item.image;image.alt=item.product_title||'';image.loading='lazy';wrap.append(image)}
  else {wrap.append(node('span','clogz-card__photo',''))}
  const body=node('div');const name=node('h3','',item.product_title);body.append(name);
  if(item.variant_title&&item.variant_title!=='Default Title')body.append(node('p','',item.variant_title));
  const isPack=[15430136037436,15430136135740].includes(Number(item.product_id));
  if(isPack){Object.entries(item.properties||{}).forEach(([key,val])=>{if(/^Paire [1-3]$/.test(key)&&val)body.append(node('p','clogz-pack__choice',key+' : '+val));});}
  body.append(node('strong','',money(item.final_line_price)));
  if(isPack){const editLink=node('a','clogz-pack__edit','Modifier ce pack');editLink.href='/pages/packs?edit_key='+encodeURIComponent(item.key);body.append(editLink);}

  const actions=node('div','clogz-inline-form');
  const dec=node('button','clogz-iconbutton','−');dec.type='button';dec.setAttribute('aria-label','Réduire la quantité');
  dec.addEventListener('click',()=>changeQty(item.key,Math.max(0,item.quantity-1)));
  const count=node('span','',item.quantity);
  const inc=node('button','clogz-iconbutton','+');inc.type='button';inc.setAttribute('aria-label','Augmenter la quantité');inc.addEventListener('click',()=>changeQty(item.key,item.quantity+1));
  actions.append(dec,count,inc);body.append(actions);wrap.append(body);
  const removeBtn=node('button','clogz-cart__remove','Retirer');
  removeBtn.type='button';removeBtn.setAttribute('aria-label','Retirer '+item.product_title+' du panier');
  removeBtn.addEventListener('click',()=>changeQty(item.key,0));
  wrap.append(removeBtn);items.append(wrap);
});
const total=$('#ClogzCartTotal');if(total)total.textContent=money(cart.total_price);
const bar=$('#ClogzShippingProgress');const copy=$('#ClogzShippingMessage');if(bar&&copy){const threshold=Number(bar.dataset.threshold||0);if(threshold>0){bar.parentElement.hidden=false;bar.style.width=Math.min(100,cart.total_price/threshold*100)+'%';copy.textContent=cart.total_price>=threshold?'Seuil de livraison offerte atteint (sous réserve des zones éligibles).':'Encore '+money(threshold-cart.total_price)+' pour atteindre le seuil de livraison offerte.'}else{bar.parentElement.hidden=true;copy.textContent=''}}}
async function updateCart(){try{renderCart(await getCart())}catch(err){if(items){items.replaceChildren();const warning=node('div','clogz-cart-empty clogz-cart-empty--error');warning.append(node('strong','','Panier momentanément indisponible.'));warning.append(node('p','','Réessaie ou ouvre la page panier.'));const back=node('a','clogz-pill clogz-pill--line','Voir mon panier');back.href=cartUrl('');warning.append(back);items.append(warning)}drawer?.classList.add('is-empty','is-error');const checkout=$('#ClogzCheckoutLink');if(checkout){checkout.hidden=true;checkout.setAttribute('aria-disabled','true')}toast(err.message||'Le panier est indisponible')}}
async function changeQty(key,quantity){try{const r=await fetch(cartUrl('/change.js'),{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({id:key,quantity})});const cart=await r.json();if(!r.ok)throw new Error(cart.description||cart.message||'Modification impossible');renderCart(cart);document.dispatchEvent(new CustomEvent('cart:refresh',{detail:cart}))}catch(err){toast(err.message)}}
async function addItem(variantId,qty=1){const res=await fetch(cartUrl('/add.js'),{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({items:[{id:Number(variantId),quantity:Number(qty)}]})});if(!res.ok){const error=await res.json().catch(()=>({description:'Article indisponible'}));throw new Error(error.description||'Impossible d’ajouter cet article')}return res.json()}
$$('[data-quick-add]').forEach(btn=>btn.addEventListener('click',async()=>{btn.disabled=true;try{await addItem(btn.dataset.quickAdd);await updateCart();showDrawer();toast('Article ajouté au panier')}catch(err){toast(err.message)}finally{btn.disabled=false}}));
$$('[data-card-variant-form]').forEach(form=>form.addEventListener('submit',async(e)=>{e.preventDefault();const btn=$('[type=submit]',form),select=$('select[name=id]',form);if(!select?.value)return;btn.disabled=true;try{await addItem(select.value,1);await updateCart();showDrawer();toast('Article ajouté au panier')}catch(err){toast(err.message)}finally{btn.disabled=false}}));
document.querySelectorAll('[data-card-size-form]').forEach(form=>{
  const submit=$('button[type=submit]',form);
  const radios=Array.from(form.querySelectorAll('input[type=radio][name=id]'));
  function refresh(){const chosen=radios.find(r=>r.checked&&!r.disabled);submit.disabled=!chosen;submit.textContent=chosen?'Ajouter au panier':(radios.some(r=>!r.disabled)?'Choisir une pointure':'Indisponible');}
  radios.forEach(r=>r.addEventListener('change',refresh));refresh();
  form.addEventListener('submit',async e=>{
    e.preventDefault();const chosen=radios.find(r=>r.checked&&!r.disabled);if(!chosen){toast('Choisis une pointure entre 36 et 46');return;}
    submit.disabled=true;
    try{await addItem(chosen.value,1);await updateCart();showDrawer();toast('Pointure '+chosen.closest('label').innerText.trim()+' ajoutée au panier')}
    catch(err){toast(err.message)}finally{refresh()}
  });
});
document.querySelectorAll('[data-product-form]').forEach(form=>{try{const variantsNode=$('[data-product-variants]',form.parentElement);if(!variantsNode)return;let variants=[];try{variants=JSON.parse(variantsNode.textContent)}catch(err){return}const idField=$('[name="id"]',form);const priceEl=$('[data-product-price]',form.parentElement);const compareEl=$('[data-product-compare-price]',form.parentElement);const addBtn=$('[type="submit"]',form);const stock=$('[data-variant-stock]',form.parentElement);const stockThreshold=Number(form.dataset.stockThreshold||3);
function selected(){const fields=$$('[data-option-position]',form);return fields.sort((a,b)=>Number(a.dataset.optionPosition)-Number(b.dataset.optionPosition)).map(a=>{const checked=$$('input:checked',a)[0];return checked?.value})}
function choose(showFeedback=false){let variant;const vals=selected();if(vals.length){variant=variants.find(v=>v.options.every((x,i)=>x===vals[i]))}else variant=variants.find(v=>String(v.id)===idField.value)||variants[0];if(!variant){idField.value='';const missing=vals.some(x=>!x);addBtn.disabled=!missing;addBtn.textContent=missing?'Je la veux':'Combinaison indisponible';if(stock)stock.textContent=showFeedback?(missing?'Sélectionne une pointure entre 36 et 46.':'Combinaison indisponible.'):'';return}
idField.value=variant.id;priceEl&&(priceEl.textContent=money(variant.price));if(compareEl){const was=Number(variant.compare_at_price||0);compareEl.hidden=!(was>Number(variant.price));compareEl.textContent=was>Number(variant.price)?money(was):'';}addBtn.disabled=!variant.available;addBtn.textContent=variant.available?'Je la veux — '+money(variant.price):'Épuisé';if(stock&&showFeedback){const tracked=!!variant.inventory_management;stock.textContent=!variant.available?'Cette pointure est indisponible':tracked&&variant.inventory_quantity<=0&&variant.inventory_policy==='continue'?'Disponibilité à confirmer par CLOGZ avant la livraison':tracked&&variant.inventory_quantity>0&&variant.inventory_quantity<=stockThreshold?'Plus que '+variant.inventory_quantity+' en stock':tracked&&variant.inventory_quantity>0?'Cette pointure est disponible':'Pointure sélectionnée — confirmation à la commande'}
if(stock&&showFeedback&&variant.title&&variant.title!=='Default Title'){stock.textContent='Pointure '+variant.title+' sélectionnée — '+stock.textContent}
if(variant.featured_media){const mediaId=String(variant.featured_media.id);const thumb=$(`[data-media-thumb="${mediaId}"]`,form.closest('.clogz-container'));if(thumb)thumb.click()}
const url=new URL(location.href);url.searchParams.set('variant',variant.id);history.replaceState({},'',url.pathname+url.search+url.hash)}
$$('[data-option-position] input',form).forEach(el=>el.addEventListener('change',()=>choose(true)));choose(false);
form.addEventListener('submit',async(e)=>{e.preventDefault();if(!idField.value){choose(true);const sizeArea=$('[data-option-position]',form);if(sizeArea){sizeArea.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'})}toast('Sélectionne ta pointure');return}const qty=Number($('[name="quantity"]',form)?.value||1);addBtn.disabled=true;try{await addItem(idField.value,qty);await updateCart();showDrawer();toast('Article ajouté au panier')}catch(err){toast(err.message)}finally{choose()}});
}catch(err){console.error('CLOGZ product form',err)}});
document.querySelectorAll('[data-cz4-size-guide]').forEach(link=>link.addEventListener('click',event=>{
 const guide=document.querySelector('#guide-pointures');if(!guide)return;
 event.preventDefault();guide.open=true;guide.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 guide.querySelector('summary')?.focus({preventScroll:true});
}));
document.querySelectorAll('[data-product-gallery]').forEach(gallery=>{
 const slides=Array.from(gallery.querySelectorAll('[data-media-id]'));
 if(slides.length<2)return;
 let startX=0,startY=0;
 gallery.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;startX=e.touches[0].clientX;startY=e.touches[0].clientY},{passive:true});
 gallery.addEventListener('touchend',e=>{
  if(!e.changedTouches.length||!startX)return;
  const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;startX=0;
  if(Math.abs(dx)<55||Math.abs(dx)<Math.abs(dy)*1.4)return;
  const live=slides.filter(s=>s.isConnected);if(live.length<2)return;
  const current=live.findIndex(s=>!s.hidden),next=(current+(dx<0?1:-1)+live.length)%live.length;
  const thumb=gallery.querySelector('[data-media-thumb="'+live[next].dataset.mediaId+'"]');
  if(thumb)thumb.click();
 },{passive:true});
});
$$('[data-media-thumb]').forEach(button=>button.addEventListener('click',()=>{const gallery=button.closest('[data-product-gallery]');if(!gallery)return;const target=$(`[data-media-id="${button.dataset.mediaThumb}"]`,gallery);if(!target)return;$$('[data-media-id]',gallery).forEach(x=>x.hidden=x!==target);$$('[data-media-thumb]',gallery).forEach(b=>b.setAttribute('aria-pressed',b===button?'true':'false'))}));
document.querySelectorAll('[data-clogz-menu]').forEach(btn=>btn.addEventListener('click',()=>{const menu=$('#ClogzMobileMenu');if(!menu)return;menu.hidden=!menu.hidden;btn.setAttribute('aria-expanded',String(!menu.hidden));btn.setAttribute('aria-label',menu.hidden?'Ouvrir le menu complet':'Fermer le menu complet')}));
const mobileMenu=$('#ClogzMobileMenu');const mobileToggle=$('[data-clogz-menu]');
function closeClogzMobileMenu(){if(!mobileMenu||mobileMenu.hidden)return;mobileMenu.hidden=true;mobileToggle?.setAttribute('aria-expanded','false');mobileToggle?.setAttribute('aria-label','Ouvrir le menu complet')}
mobileMenu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeClogzMobileMenu));
document.addEventListener('pointerdown',e=>{if(!mobileMenu||mobileMenu.hidden)return;if(mobileMenu.contains(e.target)||mobileToggle?.contains(e.target))return;closeClogzMobileMenu()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mobileMenu&&!mobileMenu.hidden){closeClogzMobileMenu();mobileToggle?.focus()}});
const menuMedia=window.matchMedia('(min-width: 851px)');if(menuMedia.addEventListener)menuMedia.addEventListener('change',e=>{if(e.matches)closeClogzMobileMenu()});
const shoe=$('[data-hero-shoe]');$$('[data-hero-color]').forEach(b=>b.addEventListener('click',()=>{if(shoe)shoe.style.color=b.dataset.heroColor;$$('[data-hero-color]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))}));
if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&matchMedia('(pointer: fine)').matches){const stage=$('[data-hero-stage]');let raf=0;stage?.addEventListener('pointermove',e=>{if(raf)return;raf=requestAnimationFrame(()=>{const rect=stage.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width-.5;const y=(e.clientY-rect.top)/rect.height-.5;if(shoe)shoe.style.transform=`rotateY(${x*18}deg) rotateX(${-y*10}deg) rotateZ(${x*3}deg)`;raf=0})});stage?.addEventListener('pointerleave',()=>{if(shoe)shoe.style.transform=''})}

/* Instant cart quantities (desktop + mobile). Shopify is the pricing authority. */
const pageCart=$('[data-clogz-page-cart]');
if(pageCart){
  let busy=false, timer=null;
  let pending=null;
  const status=()=>pageCart.querySelector('[data-clogz-live-cart-status]');
  function statusMessage(text,error=false){const el=status();if(el){el.textContent=text;el.dataset.error=String(error)}}
  function validQty(value){const n=Number(value);return Number.isInteger(n)&&n>=0&&n<=999?n:null;}
  async function saveQuantity(line,quantity,restore){
    if(busy){pending={line,quantity,restore};return}
    busy=true;
    const fields=$$('input.clogz-cart-qty',pageCart);
    fields.forEach(el=>el.disabled=true);
    const buttons=$$('[data-clogz-qty-step]',pageCart);
    buttons.forEach(el=>el.disabled=true);
    statusMessage('Mise à jour du panier…');
    try{
      const res=await fetch(cartUrl('/change.js'),{
        method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},
        body:JSON.stringify({line:Number(line),quantity:Number(quantity)})
      });
      const cart=await res.json();
      if(!res.ok)throw new Error(cart.description||cart.message||'Quantité indisponible');
      const page=await fetch(window.location.pathname+'?_clogz_cart_refresh='+Date.now(),{cache:'no-store'});
      if(!page.ok)throw new Error('Le panier est modifié, mais les prix n’ont pas pu être rechargés');
      const html=await page.text();
      const doc=new DOMParser().parseFromString(html,'text/html');
      const next=doc.querySelector('[data-clogz-page-cart]');
      if(!next)throw new Error('La mise à jour du panier n’a pas pu être affichée');
      const existingBody=pageCart.querySelector('.clogz-cart-table tbody');
      const nextBody=next.querySelector('.clogz-cart-table tbody');
      if(cart.item_count===0){
        const form=pageCart.querySelector('[data-clogz-cart-form]');
        if(form){
          const empty=document.createElement('div');
          empty.className='clogz-cart-empty-dynamic';
          const p=document.createElement('p');p.textContent='Ton panier est vide.';
          const a=document.createElement('a');a.className='clogz-pill';a.href='/collections/clogz-tous-les-sabots';a.textContent='Découvrir les sabots';
          empty.append(p,a);form.replaceWith(empty);
        }
      }else{
        if(!existingBody||!nextBody)throw new Error('Le tableau du panier n’est pas disponible');
        existingBody.replaceWith(document.importNode(nextBody,true));
        const currentTotal=pageCart.querySelector('.clogz-cart-total strong');
        const updatedTotal=next.querySelector('.clogz-cart-total strong');
        if(currentTotal&&updatedTotal)currentTotal.textContent=updatedTotal.textContent;
        const checkout=$('#ClogzNativeCheckoutButton');
        if(checkout)checkout.disabled=false;
      }
      $$('[data-cart-count]').forEach(el=>{
        el.textContent=cart.item_count;
        el.setAttribute('aria-label',cart.item_count+' article(s)');
      });
      statusMessage('Panier mis à jour automatiquement.');
      document.dispatchEvent(new CustomEvent('cart:refresh',{detail:cart}));
      const focus=pageCart.querySelector('.clogz-cart-qty-controls[data-cart-line="'+line+'"] button[data-clogz-qty-step="'+(restore||1)+'"]');
      if(focus)focus.focus({preventScroll:true});
    }catch(error){
      statusMessage(error.message||'Erreur de mise à jour du panier.',true);
      const refresh=pageCart.querySelector('input.clogz-cart-qty[data-cart-line="'+line+'"]');
      if(refresh)refresh.value=refresh.defaultValue;
    }finally{
      busy=false;
      $$('input.clogz-cart-qty,[data-clogz-qty-step]',pageCart).forEach(el=>el.disabled=false);
      if(pending){const next=pending;pending=null;saveQuantity(next.line,next.quantity,next.restore);}
    }
  }
  function quantityChanged(input,restore){
    const line=Number(input.dataset.cartLine);
    const qty=validQty(input.value);
    if(!line||qty===null){statusMessage('Entre une quantité valide (0 ou plus).',true);return}
    if(qty===Number(input.defaultValue))return;
    clearTimeout(timer);
    timer=setTimeout(()=>saveQuantity(line,qty,restore),250);
  }
  pageCart.addEventListener('click',e=>{
    const remove=e.target.closest('[data-clogz-remove-line]');
    if(!remove||!pageCart.contains(remove))return;
    e.preventDefault();
    const line=Number(remove.dataset.clogzRemoveLine);
    if(!Number.isInteger(line)||line<1)return;
    remove.disabled=true;
    saveQuantity(line,0);
  });
  pageCart.addEventListener('click',e=>{
    const btn=e.target.closest('[data-clogz-qty-step]');
    if(!btn||!pageCart.contains(btn))return;
    e.preventDefault();
    const input=btn.closest('.clogz-cart-qty-controls')?.querySelector('input.clogz-cart-qty');
    if(!input||input.disabled)return;
    const step=Number(btn.dataset.clogzQtyStep);
    input.value=Math.max(0,(validQty(input.value)??Number(input.defaultValue))+step);
    quantityChanged(input,step);
  });
  pageCart.addEventListener('input',e=>{
    const input=e.target.closest('input.clogz-cart-qty');
    if(input){clearTimeout(timer);timer=setTimeout(()=>quantityChanged(input),450)}
  });
  pageCart.addEventListener('change',e=>{
    const input=e.target.closest('input.clogz-cart-qty');
    if(input)quantityChanged(input);
  });
  pageCart.addEventListener('submit',e=>{
    if(!e.target.matches('[data-clogz-cart-form]'))return;
    e.preventDefault();
    const changed=$$('input.clogz-cart-qty',pageCart).find(x=>validQty(x.value)!==Number(x.defaultValue));
    if(changed)quantityChanged(changed);
  });
}

document.addEventListener('cart:refresh',event=>{if(event.detail&&Array.isArray(event.detail.items))renderCart(event.detail)});
updateCart();
})();
