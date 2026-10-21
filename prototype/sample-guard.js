// Runs before the application. No live credentials or remote services are used.
(() => {
 const unavailable = () => Promise.reject(new Error('External services and uploads are disabled in this sample.'));
 window.fetch = async input => {
  const url = new URL(typeof input === 'string' ? input : input.url, location.href);
  if(url.origin === location.origin && url.pathname === '/api/runtime')return Response.json({mode:'demo',persistence:'local',creatorProfilePreview:false});
  if(url.origin === location.origin && url.pathname === '/api/auth/session')return Response.json({mode:'demo',authenticated:false});
  return unavailable();
 };
 const notice = () => alert('Sample only: external services, messages and uploads are disabled.');
 const disableExternalLinks = () => {
  for(const a of document.querySelectorAll('a[href]')){
   const u=new URL(a.getAttribute('href'),location.href);
   if(u.origin!==location.origin && u.protocol!=='blob:'){
    a.removeAttribute('href');a.setAttribute('aria-disabled','true');a.title='External links are disabled in this sample';
   }
  }
  for(const input of document.querySelectorAll('input[type="file"]'))input.disabled=true;
 };
 document.addEventListener('DOMContentLoaded',()=>{
  disableExternalLinks();new MutationObserver(disableExternalLinks).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['href','type']});
 });
 document.addEventListener('drop',event=>{event.preventDefault();event.stopImmediatePropagation();notice();},true);
 document.addEventListener('change',event=>{if(event.target.matches('input[type="file"]')){event.preventDefault();event.stopImmediatePropagation();event.target.value='';notice();}},true);
 document.addEventListener('click', event => {
  const a=event.target.closest('a[href]');if(!a)return;
  const u=new URL(a.getAttribute('href'),location.href);
  if(u.origin!==location.origin && u.protocol!=='blob:'){event.preventDefault();event.stopImmediatePropagation();notice();}
 },true);
 document.addEventListener('submit',event=>{event.preventDefault();},true);
 const open=window.open.bind(window);
 window.open=(url,...args)=>{
  if(url && url!=='about:blank'){
   const u=new URL(url,location.href);if(u.origin!==location.origin&&u.protocol!=='blob:'){notice();return null;}
  }
  return open(url,...args);
 };
})();
