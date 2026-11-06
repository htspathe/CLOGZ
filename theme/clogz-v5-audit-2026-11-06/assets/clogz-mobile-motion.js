/* CLOGZ mobile entrance effects, progressive and accessible. */
(()=>{
  'use strict';
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const phone=window.matchMedia('(max-width: 850px)');
  let observer=null;
  function start(){
    if(!phone.matches || reduce.matches || !('IntersectionObserver' in window))return;
    if(observer)observer.disconnect();
    const targets=Array.from(document.querySelectorAll(
      '.clogz-editorial__hero-copy, .clogz-editorial__hero-media, '+
      '.clogz-editorial__discover-top, .clogz-editorial__card, '+
      '.clogz-editorial__promo, .clogz-spider-feature__wrap, '+
      '.clogz-spider-card, .clogz-product__gallery, .clogz-product__info, '+
      '.clogz-grid--catalog .clogz-card, .clogz-curated-card, .clogz-contact-form-shell, .clogz-univers__reveal, '+
      '.cv2-product-card, .cv2-benefits>div, .cv2-personalize>div, .cv2-story-copy, .clogz-collections__group-top'
    ));
    if(!targets.length)return;
    observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(entry.isIntersecting){
          entry.target.classList.add('is-mobile-visible');
          observer.unobserve(entry.target);
        }
      }
    },{rootMargin:'0px 0px -18px 0px',threshold:.07});
    targets.forEach((el,i)=>{
      el.style.setProperty('--clogz-mobile-delay',Math.min(i%4*60,180)+'ms');
      el.classList.add('clogz-mobile-reveal');
      observer.observe(el);
    });
    document.documentElement.classList.add('clogz-mobile-motion-ready');
  }
  function stop(){
    observer?.disconnect();observer=null;
    document.documentElement.classList.remove('clogz-mobile-motion-ready');
  }
  start();
  document.addEventListener('shopify:section:load',()=>{stop();start()});
  if(phone.addEventListener)phone.addEventListener('change',()=>{stop();start()});
  if(reduce.addEventListener)reduce.addEventListener('change',()=>{stop();start()});
})();
