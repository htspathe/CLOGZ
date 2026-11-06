
(function(){
  'use strict';
  function setup(root){
    if(!root||root.dataset.cv2Ready==='true')return;
    root.dataset.cv2Ready='true';
    var script=root.querySelector('script[id^="cv2-catalog-"]');
    if(!script)return;
    var products=[];try{products=JSON.parse(script.textContent)}catch(e){return}
    if(!products.length)return;
    var q=function(s){return root.querySelector(s)};
    var qa=function(s){return Array.prototype.slice.call(root.querySelectorAll(s))};
    var active=0, selected=null, selectedProduct=0, lock=false, priorFocus=null, cartReturnFocus=null;
    var money=function(c){return new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format((Number(c)||0)/100).replace(/[\u00a0\u202f]/g,' ')+' FCFA'};
    var swatch=function(name){var dict={'noir':'#202020','rouge':'#df4234','blanc':'#f9f6f1','beige':'#cab3a0','vert':'#446752','rose':'#f2a4bc','bleu':'#9ccbe7','lilas':'#bea1dc','orange':'#ed8139','gris':'#999da3'};var key=Object.keys(dict).find(function(k){return name.toLowerCase().includes(k)});return dict[key]||'#e3bca8'};
    var cards=qa('[data-cv2-shoe]');
    function render(){
      cards.forEach(function(el,i){
        var d=i-active,n=products.length;
        if(d>n/2)d-=n;if(d<(-n/2))d+=n;
        el.hidden=Math.abs(d)>2;
        el.dataset.slot=String(d);
        el.setAttribute('aria-hidden',String(Math.abs(d)>2));
        el.tabIndex=Math.abs(d)>2?-1:0;
        if(Math.abs(d)<=1){var im=el.querySelector('img');if(im){im.loading='eager';im.decoding='async'}}
      });
      q('[data-cv2-current-color]').textContent=products[active].color;
      q('[data-cv2-price]').textContent=money(products[active].price);
      
    }
    function go(d){active=(active+d+products.length)%products.length;render()}
    q('[data-cv2-prev]').addEventListener('click',function(){go(-1)});
    q('[data-cv2-next]').addEventListener('click',function(){go(1)});
    q('[data-cv2-open]').addEventListener('click',function(){window.location.assign('/pages/idees-de-personnalisation');});
    /* Gestes mobiles : différencier glissement horizontal et sélection d'une paire. */
    var stage=q('.cv2-stage'),pointerStart=null,swiped=false;
    stage.addEventListener('pointerdown',function(e){
      pointerStart={id:e.pointerId,x:e.clientX,y:e.clientY};
      swiped=false;
    },{passive:true});
    stage.addEventListener('pointercancel',function(){pointerStart=null},{passive:true});
    stage.addEventListener('pointerup',function(e){
      if(!pointerStart||pointerStart.id!==e.pointerId)return;
      var dx=e.clientX-pointerStart.x,dy=e.clientY-pointerStart.y;
      pointerStart=null;
      if(Math.abs(dx)>46&&Math.abs(dx)>Math.abs(dy)*1.3){
        swiped=true;
        go(dx<0?1:-1);
      }
    },{passive:true});
    stage.addEventListener('click',function(e){
      if(swiped&&e.detail!==0){e.preventDefault();e.stopPropagation();swiped=false}
    },true);
    cards.forEach(function(el,i){el.addEventListener('click',function(){open(i)})});
    stage.addEventListener('keydown',function(e){if(e.target!==stage)return;if(e.key==='ArrowLeft'){e.preventDefault();go(-1)}if(e.key==='ArrowRight'){e.preventDefault();go(1)}if(e.key==='Enter'){e.preventDefault();open(active)}});
    qa('[data-cv2-card]').forEach(function(el){el.addEventListener('click',function(){open(Number(el.dataset.cv2Card))})});
    qa('[data-cv2-filter]').forEach(function(b){b.addEventListener('click',function(){
      var category=b.dataset.cv2Filter;
      qa('[data-cv2-filter]').forEach(function(x){var a=x===b;x.classList.toggle('is-active',a);x.setAttribute('aria-pressed',String(a))});
      qa('[data-cv2-category]').forEach(function(c){c.hidden=category!=='tous'&&c.dataset.cv2Category!==category});
    })});
    var detail=q('[data-cv2-detail]'),backdrop=q('[data-cv2-backdrop]'),drawer=q('[data-cv2-cart]'),cartBack=q('[data-cv2-cart-backdrop]');
    function bodyLock(){document.body.style.overflow=(!detail.hidden||!drawer.hidden)?'hidden':''}
    function open(i){
      selectedProduct=i;active=i;render();selected=null;priorFocus=document.activeElement;
      detail.hidden=false;backdrop.hidden=false;bodyLock();paintDetail();
      q('[data-cv2-close]').focus();
    }
    function close(){detail.hidden=true;backdrop.hidden=true;bodyLock();if(priorFocus&&priorFocus.focus)priorFocus.focus()}
    q('[data-cv2-close]').addEventListener('click',close);backdrop.addEventListener('click',close);
    function paintDetail(){
      var p=products[selectedProduct];selected=null;
      var img=q('[data-cv2-detail-img]');img.src=p.image;img.alt=p.title;
      q('[data-cv2-detail-name]').textContent=p.color;
      q('[data-cv2-detail-price]').textContent=money(p.price);
      q('[data-cv2-full-link]').href=p.url;
      var sw=q('[data-cv2-swatches]');sw.replaceChildren();
      products.forEach(function(other,i){var b=document.createElement('button');b.type='button';b.style.background=swatch(other.color);b.setAttribute('aria-label',other.color);b.setAttribute('aria-pressed',String(i===selectedProduct));b.title=other.color;b.addEventListener('click',function(){selectedProduct=i;active=i;render();paintDetail()});sw.appendChild(b)});
      var sizes=q('[data-cv2-sizes]');sizes.replaceChildren();
      p.variants.forEach(function(v){var b=document.createElement('button');b.type='button';b.textContent=v.title;b.setAttribute('aria-disabled',String(!v.available));b.setAttribute('aria-pressed','false');b.title=v.available?'Choisir la pointure '+v.title:'Pointure non disponible';b.addEventListener('click',function(){selected=v;sizes.querySelectorAll('button').forEach(function(s){s.setAttribute('aria-pressed',String(s===b))});syncAdd()});sizes.appendChild(b)});
      syncAdd();
    }
    function syncAdd(){
      var b=q('[data-cv2-add]'),status=q('[data-cv2-status]'),p=products[selectedProduct];
      q('[data-cv2-variant]').value=selected?selected.id:'';
      b.disabled=!selected||!selected.available;
      b.textContent=selected&&selected.available?'AJOUTER AU PANIER':selected?'POINTURE ACTUELLEMENT INDISPONIBLE':'CHOISIR UNE POINTURE';
      status.classList.toggle('cv2-status--available',!!selected&&!!selected.available);
      status.classList.toggle('cv2-status--unavailable',!!selected&&!selected.available);
      status.textContent=selected?(selected.available?'Pointure '+selected.title+' sélectionnée — clique sur Ajouter au panier pour commander.':'Pointure '+selected.title+' sélectionnée — actuellement indisponible. Aucune commande ne peut être passée pour cette pointure.'):(p.available?'Choisis une pointure pour vérifier sa disponibilité.':'Ce modèle est actuellement indisponible sur Shopify. Tu peux consulter les pointures sans commander.');
    }
    function displayCart(cart){
      var box=q('[data-cv2-cart-items]');box.replaceChildren();
      if(!cart.items||!cart.items.length){box.textContent='Ton panier est vide.'}
      // Pricing display is pack-aware only if Shopify's actual total matches it.
      var items=cart.items||[];
      var packItem=items.find(function(x){return [15430136037436,15430136135740].includes(Number(x.product_id))});
      var editPack=q('[data-cv2-edit-pack]');
      if(editPack){editPack.hidden=!packItem;if(packItem)editPack.href='/pages/packs?edit_key='+encodeURIComponent(packItem.key);}

      var duo=items.filter(function(x){return x.properties&&x.properties['Pack CLOGZ']==='DUO'});
      var trio=items.filter(function(x){return x.properties&&x.properties['Pack CLOGZ']==='TRIO'});
      var duoCount=duo.reduce(function(n,x){return n+x.quantity},0);
      var trioCount=trio.reduce(function(n,x){return n+x.quantity},0);
      var quantitiesOK=(duoCount===0||duoCount===2)&&(trioCount===0||trioCount===3);
      var expected=items.reduce(function(n,x){
        var kind=x.properties&&x.properties['Pack CLOGZ'];
        var value=kind==='DUO'?1050000:kind==='TRIO'?1000000:1200000;
        return n+(value*x.quantity);
      },0);
      // Shopify AJAX money is stored in minor units, generally cents for XOF.
      // Use the real catalog line price to determine the unit multiplier safely.
      var sample=items.find(function(x){return x.original_price>0});
      var multiplier=sample&&sample.original_price>=100000?100:1;
      expected=expected/100*multiplier;
      var transparentPricing=quantitiesOK&&Number(cart.total_price)===expected;
      items.forEach(function(item){
        var row=document.createElement('div');row.className='cv2-cart-row';
        var im=document.createElement('img');if(item.image){im.src=item.image;im.alt=item.product_title||'Produit CLOGZ'}row.appendChild(im);
        var side=document.createElement('div');var title=document.createElement('strong');title.textContent=item.product_title||item.title;side.appendChild(title);
        var meta=document.createElement('small');
        var kind=item.properties&&item.properties['Pack CLOGZ'];
        var unit=(kind==='DUO'?10500:kind==='TRIO'?10000:12000);
        var show=transparentPricing?unit*multiplier*item.quantity:item.final_line_price;
        meta.textContent=(item.variant_title||'')+' · '+money(show);
        side.appendChild(meta);
        if([15430136037436,15430136135740].includes(Number(item.product_id))){
          Object.keys(item.properties||{}).forEach(function(k){if(/^Paire [1-3]$/.test(k)){var p=document.createElement('small');p.textContent=k+' : '+item.properties[k];side.appendChild(p)}});
          var edit=document.createElement('a');edit.className='cv2-cart-edit-pack';edit.textContent='Modifier ce pack';edit.href='/pages/packs?edit_key='+encodeURIComponent(item.key);side.appendChild(edit);
        }
        if(kind){var badge=document.createElement('small');badge.textContent=kind==='DUO'?'Pack DUO · 10 500 F / paire':'Pack TRIO · 10 000 F / paire';badge.style.cssText='display:block;color:#d74838;font-weight:700;margin-top:4px';side.appendChild(badge);}
        if(!transparentPricing&&kind){var warning=document.createElement('small');warning.textContent='Vérifie le prix final Shopify';warning.style.cssText='display:block;color:#806d61';side.appendChild(warning);}
        var quantity=document.createElement('div');quantity.className='cv2-cart-qty';
        var minus=document.createElement('button');minus.type='button';minus.textContent='−';minus.setAttribute('aria-label','Retirer une unité');
        var num=document.createElement('span');num.textContent=item.quantity;
        var plus=document.createElement('button');plus.type='button';plus.textContent='+';plus.setAttribute('aria-label','Ajouter une unité');
        var remove=document.createElement('button');remove.type='button';remove.className='cv2-remove';remove.textContent='Retirer';remove.setAttribute('aria-label','Retirer '+(item.product_title||item.title)+' du panier');
        function change(qty){
          fetch(window.Shopify&&Shopify.routes?Shopify.routes.root+'cart/change.js':'/cart/change.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:item.key,quantity:qty})}).then(function(r){if(!r.ok)throw new Error();return r.json()}).then(function(cart){displayCart(cart);document.dispatchEvent(new CustomEvent('cart:refresh',{detail:cart}))}).catch(function(){window.location.href='/cart'});
        }
        minus.addEventListener('click',function(){change(item.quantity-1)});plus.addEventListener('click',function(){change(item.quantity+1)});remove.addEventListener('click',function(){change(0)});
        quantity.append(minus,num,plus);side.appendChild(quantity);row.appendChild(side);row.appendChild(remove);box.appendChild(row);
      });
      q('[data-cv2-cart-total]').textContent=money(cart.total_price||0);
    }
    function showCart(cart){cartReturnFocus=document.activeElement;drawer.hidden=false;cartBack.hidden=false;bodyLock();displayCart(cart);q('[data-cv2-cart-close]').focus()}
    function closeCart(){drawer.hidden=true;cartBack.hidden=true;bodyLock();if(cartReturnFocus&&typeof cartReturnFocus.focus==='function')cartReturnFocus.focus()}
    q('[data-cv2-cart-close]').addEventListener('click',closeCart);cartBack.addEventListener('click',closeCart);
    q('[data-cv2-continue]').addEventListener('click',closeCart);
    q('[data-cv2-form]').addEventListener('submit',function(e){
      if(!selected||!selected.available){e.preventDefault();return}
      e.preventDefault();if(lock)return;lock=true;var btn=q('[data-cv2-add]');btn.disabled=true;btn.textContent='AJOUT EN COURS…';
      var rootPath=(window.Shopify&&Shopify.routes&&Shopify.routes.root)||'/';
      fetch(rootPath+'cart/add.js',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({items:[{id:selected.id,quantity:1}]})}).then(function(r){if(!r.ok)throw new Error('Produit indisponible');return r.json()}).then(function(){return fetch(rootPath+'cart.js')}).then(function(r){return r.json()}).then(function(cart){close();showCart(cart);document.dispatchEvent(new CustomEvent('cart:refresh',{detail:cart}))}).catch(function(){q('[data-cv2-status]').textContent='Ajout impossible. Vérifie la disponibilité sur la fiche produit.'}).finally(function(){lock=false;syncAdd()});
    });
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'){
        if(!drawer.hidden){e.preventDefault();closeCart()}
        else if(!detail.hidden){e.preventDefault();close()}
      }
      if(e.key!=='Tab')return;
      var modal=!drawer.hidden?drawer:(!detail.hidden?detail:null);
      if(!modal)return;
      var focusables=Array.prototype.slice.call(modal.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')).filter(function(el){
        return !el.hidden&&el.getClientRects().length>0;
      });
      if(!focusables.length)return;
      var first=focusables[0],last=focusables[focusables.length-1],current=document.activeElement;
      if(e.shiftKey&&(current===first||!modal.contains(current))){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&(current===last||!modal.contains(current))){e.preventDefault();first.focus()}
    });
    render();
  }
  function init(){document.querySelectorAll('[data-cv2]').forEach(setup)}
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init)}else init();
  document.addEventListener('shopify:section:load',init);
})();
