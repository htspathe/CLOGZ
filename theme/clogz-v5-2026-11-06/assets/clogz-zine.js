
(function(){
'use strict';
function init(){
  if(!document.body.classList.contains('clogz-zine'))return;
  const opener=document.querySelector('[data-zine-menu-open]');
  const closer=document.querySelector('[data-zine-menu-close]');
  const overlay=document.getElementById('CzineMobileMenu');
  const hint=document.querySelector('[data-zine-menu-hint]');
  let previousFocus=null;
  let previousOverflow='';
  function openMenu(){
    if(!overlay||!overlay.hidden)return;
    previousFocus=document.activeElement;
    previousOverflow=document.body.style.overflow;
    overlay.hidden=false;
    opener?.setAttribute('aria-expanded','true');
    document.body.style.overflow='hidden';
    if(hint)hint.hidden=true;
    closer?.focus();
  }
  function closeMenu(){
    if(!overlay||overlay.hidden)return;
    overlay.hidden=true;
    opener?.setAttribute('aria-expanded','false');
    document.body.style.overflow=previousOverflow;
    (previousFocus||opener)?.focus();
  }
  opener?.addEventListener('click',openMenu);
  closer?.addEventListener('click',closeMenu);
  overlay?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',function(e){
    if(!overlay||overlay.hidden)return;
    if(e.key==='Escape'){e.preventDefault();closeMenu();return}
    if(e.key!=='Tab')return;
    const items=[...overlay.querySelectorAll('a[href],button:not([disabled])')].filter(el=>el.getClientRects().length);
    if(!items.length)return;
    const first=items[0],last=items[items.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });
  document.querySelectorAll('[data-zine-filter]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const value=btn.dataset.zineFilter;
      document.querySelectorAll('[data-zine-filter]').forEach(b=>{
        const active=b===btn;b.classList.toggle('is-selected',active);b.setAttribute('aria-pressed',String(active));
      });
      document.querySelectorAll('[data-zine-card]').forEach(card=>{
        card.hidden=value!=='all'&&card.dataset.zineCategory!==value;
      });
    });
  });

  if('IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}
    }),{rootMargin:'0px 0px -4% 0px',threshold:.07});
    document.querySelectorAll('.czine-section-title,.czine-drop-head,.czine-pins-copy,.czine-tldr,.czine-outro-card').forEach(el=>{
      el.classList.add('czine-reveal');io.observe(el);
    });
  }
  const loader=document.getElementById('ClogzPageLoader');
  if(loader){
    function skip(){loader.hidden=true;loader.style.display='none';loader.setAttribute('aria-hidden','true')}
    const btn=document.createElement('button');
    btn.type='button';btn.textContent='SKIP INTRO →';btn.className='czine-intro-skip';
    btn.style.cssText='position:absolute;bottom:20px;left:50%;transform:translateX(-50%);min-height:44px;padding:10px 19px;border:2px solid currentColor;border-radius:99px;background:transparent;color:inherit;font-weight:900;z-index:3';
    btn.addEventListener('click',skip);
    loader.appendChild(btn);
    setTimeout(skip,1800);
  }
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init)}else init();
document.addEventListener('shopify:section:load',()=>{if(document.body.classList.contains('clogz-zine')){const title=document.querySelector('.czine-hero');if(title)title.classList.remove('czine-reveal')}});
})();
