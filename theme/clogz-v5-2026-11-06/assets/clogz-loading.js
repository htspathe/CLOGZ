/* CLOGZ — indicateur de chargement, sans bloquer les actions Ajax */
(function(){
  'use strict';
  var root=document.documentElement;
  var hide=function(){root.classList.remove('clogz-is-loading')};
  var show=function(){root.classList.add('clogz-is-loading')};
  var ready=function(){requestAnimationFrame(function(){requestAnimationFrame(hide)})};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
  window.addEventListener('pageshow',hide);
  window.addEventListener('pagehide',hide);
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target&&e.target.closest&&e.target.closest('a[href]');
    if(!a||a.hasAttribute('download')||a.getAttribute('target')==='_blank')return;
    try{
      var next=new URL(a.href,location.href);
      if(next.origin!==location.origin||!/^https?:$/.test(next.protocol))return;
      if(next.pathname===location.pathname&&next.search===location.search)return;
      show();
    }catch(ignore){}
  });
  document.addEventListener('submit',function(e){
    if(e.defaultPrevented)return;
    var form=e.target;
    if(!form||!form.matches||form.matches('[data-product-form],[data-card-variant-form],[data-card-size-form],[data-cv2-form],[data-clogz-cart-form]'))return;
    show();
  });
  window.addEventListener('beforeunload',show);
})();