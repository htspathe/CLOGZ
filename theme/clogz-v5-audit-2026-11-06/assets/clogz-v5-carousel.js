
(function(){
 'use strict';
 function initV5Carousel(){
  var hero=document.querySelector('.czine-v5-hero');
  if(!hero||hero.dataset.v5CarouselReady)return;
  var stage=hero.querySelector('[data-zine-v5-stage]');
  var shoes=Array.from(hero.querySelectorAll('[data-zine-v5-shoe]'));
  if(!stage||!shoes.length)return;
  hero.dataset.v5CarouselReady='true';
  var blackIndex=shoes.findIndex(function(shoe){return shoe.dataset.zineV5Color==='sabots-clogz-noir'});
  var active=blackIndex>=0?blackIndex:0;
  var hoverTimeout=null,gesture=null,suppressClickUntil=0,slideLockUntil=0;
  var name=hero.querySelector('[data-zine-v5-current-name]');
  var price=hero.querySelector('[data-zine-v5-current-price]');
  var link=hero.querySelector('[data-zine-v5-current-link]');
  var index=hero.querySelector('[data-zine-v5-index]');
  var hoverCapable=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  function render(){
    var n=shoes.length;
    shoes.forEach(function(shoe,i){
      var delta=i-active;
      if(delta>n/2)delta-=n;
      if(delta< -n/2)delta+=n;
      var visible=Math.abs(delta)<=1;
      if(visible){
        var img=shoe.querySelector('img');
        if(img){
          if(img.dataset.src && !img.getAttribute('src'))img.src=img.dataset.src;
          if(img.loading==='lazy')img.loading='eager';
        }
      }
      shoe.dataset.zineV5Position=String(delta);
      shoe.tabIndex=delta===0?0:-1;
      if(delta===0)shoe.setAttribute('aria-current','true');
      else shoe.removeAttribute('aria-current');
      if(visible)shoe.removeAttribute('aria-hidden');
      else shoe.setAttribute('aria-hidden','true');
      var title=shoe.dataset.zineV5Name||shoe.querySelector('img')?.alt||'CLOGZ';
      shoe.setAttribute('aria-label',delta===0?'Choisir une pointure pour '+title:'Afficher '+title+' au centre');
    });
    var current=shoes[active];
    if(name)name.textContent=current.dataset.zineV5Name||'CLOGZ';
    if(price)price.textContent=current.dataset.zineV5Price||'';
    if(link)link.href=current.getAttribute('href');
    if(index)index.textContent=String(active+1).padStart(2,'0');
  }
  function activate(next){
    var target=(next+shoes.length)%shoes.length;
    if(active===target)return;
    active=target;
    slideLockUntil=Date.now()+420;
    render();
  }
  hero.querySelector('[data-zine-v5-prev]')?.addEventListener('click',function(){activate(active-1)});
  hero.querySelector('[data-zine-v5-next]')?.addEventListener('click',function(){activate(active+1)});
  shoes.forEach(function(shoe,i){
    shoe.addEventListener('pointerenter',function(e){
      if(!hoverCapable||!['mouse','pen'].includes(e.pointerType))return;
      if(hoverTimeout)clearTimeout(hoverTimeout);
      if(i===active||Math.abs(Number(shoe.dataset.zineV5Position))!==1)return;
      // If a slide is still moving, wait until its transition ends before activating on hover.
      var delay=Math.max(160,slideLockUntil-Date.now()+25);
      hoverTimeout=setTimeout(function(){
        hoverTimeout=null;
        if(shoe.matches(':hover')&&i!==active)activate(i);
      },delay);
    });
    shoe.addEventListener('pointerleave',function(){
      if(hoverTimeout){clearTimeout(hoverTimeout);hoverTimeout=null}
    });
    shoe.addEventListener('click',function(e){
      if(Date.now()<suppressClickUntil){e.preventDefault();return}
      if(i!==active){e.preventDefault();activate(i)}
    });
  });
  stage.addEventListener('pointerdown',function(e){
    if(e.pointerType==='mouse'&&e.button!==0)return;
    gesture={x:e.clientX,y:e.clientY};
  });
  stage.addEventListener('pointerup',function(e){
    if(!gesture)return;
    var dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
    gesture=null;
    if(Math.abs(dx)>38&&Math.abs(dx)>Math.abs(dy)*1.15){
      suppressClickUntil=Date.now()+450;
      activate(active+(dx<0?1:-1));
    }
  });
  stage.addEventListener('pointercancel',function(){gesture=null});
  stage.addEventListener('click',function(e){
    if(Date.now()<suppressClickUntil){e.preventDefault();e.stopPropagation()}
  },true);
  stage.addEventListener('keydown',function(e){
    if(e.target!==stage)return;
    if(e.key==='ArrowLeft'){e.preventDefault();activate(active-1)}
    else if(e.key==='ArrowRight'){e.preventDefault();activate(active+1)}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();shoes[active].focus()}
  });
  render();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initV5Carousel);
 else initV5Carousel();
 document.addEventListener('shopify:section:load',initV5Carousel);
})();
