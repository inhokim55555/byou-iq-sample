// The same small document format is used by the editor, review and mail sender.
// Raw HTML is never accepted from a client.
export const ATTACHMENT_LIMIT = 5 * 1024 * 1024;
export const ATTACHMENT_TYPES = Object.freeze({pdf:'application/pdf',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',txt:'text/plain',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
export const escapeEmail = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const keys=(v,allowed)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).every(k=>allowed.includes(k));
export function safeEmailLink(value){
 if(typeof value!=='string'||value.length>1000||/[\s<>"'\u0000-\u001f]/.test(value))return false;
 try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password||u.protocol==='mailto:'&&/^[^?@]+@[^?@]+$/.test(u.pathname)&&!u.search;}catch{return false;}
}
// External email images are untrusted content: only HTTPS hostnames are accepted,
// and local/private literal hosts are excluded. The browser loads approved images inside
// a sandboxed image-only viewer; the app server never fetches these URLs.
export function safeRemoteEmailImageUrl(value){
 if(typeof value!=='string'||value.length>2048||/[\s<>"'\u0000-\u001f]/.test(value))return null;
 try{
  const url=new URL(value),host=url.hostname.toLowerCase().replace(/\.$/,'');
  if(url.protocol!=='https:'||url.username||url.password||url.port||url.hash||!host||!host.includes('.')||host.includes(':')||/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host)||/^(?:localhost|.*\.(?:localhost|local|internal|lan|home|test|invalid))$/.test(host))return null;
  return url.href;
 }catch{return null;}
}
export function plainDocument(body=''){return {version:1,blocks:String(body).split('\n').map(text=>({type:'paragraph',runs:[{text}]}))};}
export function validateEmailDocument(doc){
 if(!keys(doc,['version','blocks'])||doc.version!==1||!Array.isArray(doc.blocks)||!doc.blocks.length||doc.blocks.length>250||JSON.stringify(doc).length>100000)throw new Error('The formatted message is too large or unsupported.');
 let length=0,count=0;
 for(const b of doc.blocks){
  if(b?.type==='image'){
   if(!keys(b,['type','imageId','alt'])||! /^[0-9a-f-]{36}$/i.test(b.imageId||'')||typeof b.alt!=='string'||b.alt.length>200)throw new Error('Choose a supported product image.');
   continue;
  }
  if(!keys(b,['type','align','runs'])||!['paragraph','bullet','number'].includes(b.type)||b.align&&!['left','center','right'].includes(b.align)||!Array.isArray(b.runs)||!b.runs.length)throw new Error('Unsupported paragraph formatting.');
  for(const r of b.runs){
   if(!keys(r,['text','bold','italic','underline','size','href','font'])||typeof r.text!=='string'||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(r.text)||['bold','italic','underline'].some(k=>r[k]!==undefined&&typeof r[k]!=='boolean')||r.size&&!['small','normal','large','huge'].includes(r.size)||r.font&&!['sans','serif','mono'].includes(r.font)||r.href&&!safeEmailLink(r.href))throw new Error('Unsupported text formatting or link.');
   length+=r.text.length;if(++count>1000)throw new Error('Too many formatting changes in this message.');
  }
 }
 if(length>8000)throw new Error('Keep the message under 8,000 characters.');return doc;
}
export function documentText(doc){validateEmailDocument(doc);return doc.blocks.map(b=>b.type==='image'?`[${b.alt||'Product image'}]`:b.runs.map(r=>r.text).join('')).join('\n');}
export function documentHtml(doc,{attachments=[],preview=false}={}){
 validateEmailDocument(doc);let html='',list=null;
 for(const b of doc.blocks){const next=b.type==='bullet'?'ul':b.type==='number'?'ol':null;if(next!==list){if(list)html+=`</${list}>`;if(next)html+=`<${next}>`;list=next;}
  if(b.type==='image'){
   const file=attachments.find(f=>f.contentId===b.imageId);
   const src=preview&&file?.data&&['image/png','image/jpeg'].includes(file.type)?`data:${file.type};base64,${file.data}`:preview&&/^[0-9a-f-]{36}$/i.test(file?.fileId||'')?`/api/campaign-files/${file.fileId}/image`:`cid:${b.imageId}`;
   html+=`<div><img data-email-image="${escapeEmail(b.imageId)}" src="${escapeEmail(src)}" alt="${escapeEmail(b.alt)}" style="max-width:100%;height:auto;display:block;margin:16px 0"></div>`;continue;
  }
  const tag=list?'li':'div';html+=`<${tag} style="text-align:${b.align||'left'};min-height:1.4em">`+b.runs.map(r=>{let t=escapeEmail(r.text).replaceAll('\n','<br>');if(r.bold)t=`<b>${t}</b>`;if(r.italic)t=`<i>${t}</i>`;if(r.underline)t=`<u>${t}</u>`;if(r.size)t=`<span style="font-size:${{small:'12px',normal:'14px',large:'18px',huge:'24px'}[r.size]}">${t}</span>`;if(r.font)t=`<span style="font-family:${{sans:'Arial,sans-serif',serif:'Georgia,serif',mono:'monospace'}[r.font]}">${t}</span>`;if(r.href)t=`<a href="${escapeEmail(r.href)}" target="_blank" rel="noopener noreferrer">${t}</a>`;return t;}).join('')+`</${tag}>`;
 }if(list)html+=`</${list}>`;return html;
}
// Render escaped text, verified image parts, and validated remote image viewers.
// Raw message HTML is never inserted into the conversation.
export function emailBodySegmentsHtml(segments,resolveImage){
 if(!Array.isArray(segments))return '';
 return segments.map(segment=>{
  if(segment?.type==='text'&&typeof segment.text==='string')return `<span data-no-translate>${escapeEmail(segment.text)}</span>`;
  if(segment?.type!=='image'||typeof resolveImage!=='function'||!(['image/png','image/jpeg'].includes(segment.mimeType)||segment.demoAsset===true&&segment.mimeType==='image/svg+xml'||segment.external===true&&segment.mimeType==='image/remote'&&safeRemoteEmailImageUrl(segment.src)))return '';
  const src=resolveImage(segment);
  if(segment.external===true){
   if(src!==safeRemoteEmailImageUrl(segment.src))return '';
   const alt=typeof segment.alt==='string'?segment.alt.slice(0,200):'External image from email';
   return `<figure class="ops-conversation-inline-image"><iframe title="${escapeEmail(alt||'Email image')}" src="/email-image-preview?src=${encodeURIComponent(src)}" sandbox="" loading="lazy" referrerpolicy="no-referrer" style="width:100%;height:320px;border:0;background:transparent"></iframe><figcaption><a href="${escapeEmail(src)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" data-i18n>Open original image ↗</a></figcaption></figure>`;
  }
  if(segment.demoAsset===true){if(src!=='/assets/demo-email-image.svg')return '';}
  else if(typeof src!=='string'||!src.startsWith('/api/campaign-ops/')||src.startsWith('//')||/[\u0000-\u0020]/.test(src))return '';
  const alt=typeof segment.alt==='string'?segment.alt.slice(0,200):'Inline image from email';
  return `<figure class="ops-conversation-inline-image"><img src="${escapeEmail(src)}" alt="${escapeEmail(alt)}" loading="lazy" decoding="async"><figcaption data-i18n>${segment.attachment===true?'Image attachment':'Image included in email'}</figcaption></figure>`;
 }).join('');
}
export function validateAttachments(files=[],{metadataOnly=false,allowReferences=false}={}){
 if(!Array.isArray(files)||files.length>5)throw new Error('Attach up to 5 files, totaling 5 MB.');let total=0;
 for(const f of files){const extension=String(f?.name||'').split('.').pop().toLowerCase();
  if(!keys(f,['name','type','size','data','contentId',...(allowReferences?['fileId']:[])])||typeof f.name!=='string'||f.name.length>120||/[\x00-\x1f\x7f/\\]/.test(f.name)||!ATTACHMENT_TYPES[extension]||f.type!==ATTACHMENT_TYPES[extension]||!Number.isSafeInteger(f.size)||f.size<1||(total+=f.size)>ATTACHMENT_LIMIT)throw new Error('Use PDF, PNG, JPG, TXT or DOCX files, totaling no more than 5 MB.');
  if(f.contentId&&(!/^[0-9a-f-]{36}$/i.test(f.contentId)||!['image/png','image/jpeg'].includes(f.type)))throw new Error('Only PNG or JPG files can be used as product images.');
  if(f.fileId&&(!allowReferences||!/^[0-9a-f-]{36}$/i.test(f.fileId)))throw new Error('Saved attachment reference is invalid.');
  if(!metadataOnly&&!(allowReferences&&f.fileId)&&(typeof f.data!=='string'||f.data.length!==4*Math.ceil(f.size/3)||! /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(f.data)||f.data.length/4*3-(f.data.endsWith('==')?2:f.data.endsWith('=')?1:0)!==f.size))throw new Error('Attachment content is incomplete. Remove it and attach it again.');
 }return files;
}
export function richEmailHtml(input,fullBody,{preview=false}={}){
 const doc=input.document||plainDocument(input.body);if(documentText(doc).trim()!==input.body.trim()||!fullBody.startsWith(input.body.trim()))throw new Error('The formatted message differs from the approved text.');
 if(doc.blocks.some(b=>b.type==='image'&&!input.attachments?.some(f=>f.contentId===b.imageId)))throw new Error('Inline image content is incomplete');
 return `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#111">${documentHtml(doc,{attachments:input.attachments||[],preview})}<div style="white-space:pre-wrap;margin-top:24px;font-size:12px;color:#555">${escapeEmail(fullBody.slice(input.body.trim().length))}</div></div>`;
}
