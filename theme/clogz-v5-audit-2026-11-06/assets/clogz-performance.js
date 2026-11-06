/* CLOGZ progressive performance: suspend continuous animations offscreen. */
(()=>{'use strict';
 const targets=['.cv2-sky','.cv2-ticker','.cv2-story','.cv2-personalize','.clogz-street-marquee','.clogz-marquee'];
 const watched=new WeakSet();let observer=null;
 function init(){
   if(!('IntersectionObserver' in window))return;
   observer??=new IntersectionObserver(entries=>{for(const e of entries)e.target.classList.toggle('clogz-perf-paused',!e.isIntersecting)}, {rootMargin:'180px 0px 180px 0px',threshold:0});
   for(const selector of targets)document.querySelectorAll(selector).forEach(el=>{if(!watched.has(el)){watched.add(el);observer.observe(el)}});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 document.addEventListener('shopify:section:load',init);
})();
