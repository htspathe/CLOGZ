
(function(){
"use strict";
var paths={
orange:"https://cdn.shopify.com/s/files/1/0783/6398/3932/files/clogz-orange-medaillon-noir-identique-fond-transparent_c4519549-e751-4ead-a2a8-f91d7e999c5b.png?v=1793161010",
gris:"https://cdn.shopify.com/s/files/1/0783/6398/3932/files/clogz-gris-clair-medaillon-noir-identique-fond-transparent_a71822cc-a067-4677-8735-1732156cbc57.png?v=1793161013"
};
function replaceImage(img){
 if(img.dataset.cv2Cutout==="true")return;
 var src=img.currentSrc||img.getAttribute("src")||"";
 var orig=img.getAttribute("src")||"";
 var check=src+" "+orig;
 if(check.indexOf("clogz-v2-sabot-")!==-1){img.dataset.cv2Cutout="true";return}
 var target=null;
 if(/clogz-sabot-orange/i.test(check))target=paths.orange;
 else if(/clogz-sabot-gris/i.test(check))target=paths.gris;
 if(!target)return;
 img.removeAttribute("srcset");img.removeAttribute("sizes");
 img.src=target;img.dataset.cv2Cutout="true";
}
function imageRefresh(node){
 if(!node)return;
 if(node.matches&&node.matches("img"))replaceImage(node);
 if(node.querySelectorAll)node.querySelectorAll("img").forEach(replaceImage);
}
var io=null;
function motionInit(){
 if(!("IntersectionObserver" in window)||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 var selectors=[
 ".clogz-page-title",".clogz-collection-intro h1",".clogz-collection-intro p",
 ".clogz-product__gallery",".clogz-product__info",".clogz-card",
 ".clogz-collections__intro h1",".clogz-collections__group-top",
 ".clogz-collections__group .clogz-card",".clogz-contact-hero h1",
 ".clogz-contact-info-card",".clogz-contact-form-shell",
 ".clogz-cart-table",".clogz-order-header",
 ".clogz-richtext",".clogz-univers__hero-copy",".clogz-univers__hero-visual",
 ".clogz-univers__value",".clogz-univers__collection-card",".clogz-univers__inspo-card",
 ".clogz-univers__section-intro",".clogz-section .clogz-headrow",
 ".clogz-collections__group-link"
 ];
 io=new IntersectionObserver(function(entries){
  entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add("cv2-in-view");io.unobserve(entry.target)}});
 },{rootMargin:"0px 0px -5% 0px",threshold:.05});
 var targets=document.querySelectorAll(selectors.join(","));
 document.body.classList.add("cv2-motion-ready");
 targets.forEach(function(node){node.classList.add("cv2-reveal");io.observe(node)});
}
/* CLOGZ V3 shared engagements cleanup: only the draft theme changes what visitors see. */
function cleanSharedEngagements(){
 document.querySelectorAll('.clogz-engagements__number').forEach(function(el){
   el.textContent=el.textContent.replace(/^\s*\d{1,2}\s*\/\s*/, '');
 });
 document.querySelectorAll('.clogz-engagements__action, .clogz-engagements__secondary').forEach(function(el){
   el.querySelectorAll('span').forEach(function(span){
     if(/^[\s↗→←\uFE0F]+$/.test(span.textContent))span.remove();
   });
   el.childNodes.forEach(function(node){
     if(node.nodeType===3)node.nodeValue=node.nodeValue.replace(/[↗→←]/g,'');
   });
 });
}
function ready(){
 if(!document.body.classList.contains("clogz-v2-unified"))return;
 cleanSharedEngagements();
 imageRefresh(document);
 motionInit();
 var observer=new MutationObserver(function(records){
   records.forEach(function(record){
     record.addedNodes.forEach(imageRefresh);
   });
 });
 observer.observe(document.body,{subtree:true,childList:true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready);else ready();
})();
