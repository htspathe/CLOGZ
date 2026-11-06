/* CLOGZ color cards: progressively enhanced, no dependencies.
   1x IntersectionObserver stagger, mouse parallax, mobile one-tap + centered scroll focus. */
(()=>{
'use strict';
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
const coarse=window.matchMedia('(hover: none), (pointer: coarse)');
const motionCleanup=new WeakMap();
function init(section){
 if(!section || section.dataset.clogzMotionInit==='1')return;
 section.dataset.clogzMotionInit='1';
 const grid=section.querySelector('.clogz-collectiontiles');
 if(!grid)return;
 const cards=Array.from(grid.querySelectorAll('.clogz-tile'));
 if(!cards.length)return;
 const canAnimate=!reduced.matches;
 // Never hide cards until the observer is connected.
 if(canAnimate && 'IntersectionObserver' in window){
   const reveal=new IntersectionObserver(entries=>{
     for(const item of entries)if(item.isIntersecting){
       item.target.classList.add('is-visible');reveal.unobserve(item.target);
     }
   },{threshold:.08,rootMargin:'0px 0px 35px 0px'});
   cards.forEach(card=>reveal.observe(card));
   section.classList.add('clogz-motion-ready');
   motionCleanup.set(section,()=>reveal.disconnect());
 }else cards.forEach(c=>c.classList.add('is-visible'));
 const parallax=section.dataset.parallax==='true' && canAnimate;
 const resetPointers=card=>{card.style.setProperty('--clogz-pointer-x','0px');card.style.setProperty('--clogz-pointer-y','0px')};
 cards.forEach(card=>{
   let frame=0,lastX=0,lastY=0;
   card.addEventListener('pointerenter',e=>{if(!fine.matches || !canAnimate)return;grid.classList.add('is-highlighting')});
   card.addEventListener('pointermove',e=>{
     if(!fine.matches || !parallax)return;
     const box=card.getBoundingClientRect();
     lastX=Math.max(-10,Math.min(10,((e.clientX-box.left)/box.width-.5)*20));
     lastY=Math.max(-10,Math.min(10,((e.clientY-box.top)/box.height-.5)*20));
     if(frame)return;
     frame=requestAnimationFrame(()=>{
       card.style.setProperty('--clogz-pointer-x',lastX.toFixed(1)+'px');
       card.style.setProperty('--clogz-pointer-y',lastY.toFixed(1)+'px');
       frame=0;
     });
   },{passive:true});
   card.addEventListener('pointerleave',()=>{
     if(frame)cancelAnimationFrame(frame);
     frame=0;resetPointers(card);
     if(fine.matches)grid.classList.remove('is-highlighting');
   });
   // Touch: show a brief pressed effect, but always follow links on the first tap.
   card.addEventListener('pointerdown',e=>{
     if(e.pointerType!=='touch' || !canAnimate)return;
     card.classList.add('is-pressed');
   },{passive:true});
   for(const eventType of ['pointerup','pointercancel','pointerleave']){
     card.addEventListener(eventType,()=>card.classList.remove('is-pressed'),{passive:true});
   }
 });
 // Tapping outside restores the grid.
 document.addEventListener('pointerdown',e=>{
   if(grid.contains(e.target))return;
   cards.forEach(c=>c.classList.remove('is-active'));
   grid.classList.remove('is-highlighting');
 },{passive:true});
 // On touch viewports, gently enlarge shoes around the screen center.
 if(coarse.matches && canAnimate && 'IntersectionObserver' in window){
   const centered=new IntersectionObserver(entries=>{
      for(const x of entries)x.target.classList.toggle('is-centered',x.isIntersecting);
   },{rootMargin:'-33% 0px -33% 0px',threshold:0});
   cards.forEach(card=>centered.observe(card));
   const old=motionCleanup.get(section);
   motionCleanup.set(section,()=>{old?.();centered.disconnect()});
 }
}
function run(context=document){context.querySelectorAll?.('[data-clogz-colors]').forEach(init);if(context.matches?.('[data-clogz-colors]'))init(context)}
run();
document.addEventListener('shopify:section:load',e=>run(e.target));
document.addEventListener('shopify:section:unload',e=>{
 const s=e.target.querySelector?.('[data-clogz-colors]')|| (e.target.matches?.('[data-clogz-colors]')?e.target:null);
 if(s){motionCleanup.get(s)?.();motionCleanup.delete(s)}
});
})();
