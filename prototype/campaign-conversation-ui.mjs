import {displayDate,displayDateTime} from './date-format.mjs';
import {operationsIcon as icon} from './operations-icons.mjs';
import {renderEmailComposer} from './email-composer.mjs';
import {documentHtml,emailBodySegmentsHtml,plainDocument,safeRemoteEmailImageUrl} from './email-content.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function gmailThreadId(value){
 try{const u=new URL(value);if(u.protocol!=='https:'||u.hostname!=='mail.google.com'||u.username||u.password||!/^\/mail\/u\/(?:\d+\/)?$/.test(u.pathname))return null;
  if(u.search&&(u.searchParams.size!==1||!u.searchParams.has('authuser')||! /^(?:\d+|[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})$/.test(u.searchParams.get('authuser'))))return null;
  return /^#(?:all|inbox|sent)\/([A-Za-z0-9_-]{8,256})(?:\/[A-Za-z0-9_-]{8,256})?$/.exec(u.hash)?.[1]||null;
 }catch{return null;}
}
const providerId=/^[A-Za-z0-9_-]{8,256}$/;
const campaignIdPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function campaignConversationImageUrl({campaignId,assignmentId,providerThreadId,messageId,partPath}={}){
 if(!campaignIdPattern.test(campaignId||'')||!campaignIdPattern.test(assignmentId||'')||![providerThreadId,messageId].every(id=>providerId.test(id||''))||!/^0(?:\.\d{1,3}){0,9}$/.test(partPath||''))return null;
 const query=new URLSearchParams({thread:providerThreadId,message:messageId,part:partPath});
 return `/api/campaign-ops/${encodeURIComponent(campaignId)}/assignments/${encodeURIComponent(assignmentId)}/conversation?${query}`;
}
export function gmailConversationUrl({providerThreadId,mailboxEmail}={}){
 if(!providerId.test(providerThreadId||'')||! /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(mailboxEmail||''))return null;
 const base=`https://mail.google.com/mail/u/?authuser=${encodeURIComponent(mailboxEmail)}`;
 // Let Gmail show its saved reply inside the conversation. A compose parameter
 // opens a separate editor even when the saved draft is correctly threaded.
 return `${base}#all/${encodeURIComponent(providerThreadId)}`;
}
const readableText=value=>String(value||'').replace(/\r\n?/g,'\n').replace(/[\u200b\ufeff]/g,'').replace(/\u00a0/g,' ').replace(/[ \t]+$/gm,'').replace(/\n[ \t]*\n(?:[ \t]*\n)+/g,'\n\n').trim();
// Keep every quoted word available, but separate repeated history from this reply.
export function conversationText(value){
 const text=readableText(value),boundary=/^(?:[ \t]*On [^\n]*(?:\n[^\n]+){0,3}?wrote:[ \t]*$|[ \t]*[-_]{3,}[ \t]*(?:Original|Forwarded) message[ \t]*[-_]*[ \t]*$|[ \t]*Begin forwarded message:[ \t]*$|[ \t]*>)/im.exec(text);
 if(boundary){
  const tail=text.slice(boundary.index),lines=(boundary[0].trim()==='>'?tail:tail.slice(boundary[0].length)).split('\n').filter(line=>line.trim());
  // Inline answers among quoted lines are new content; leave them visible.
  if(lines.some(line=>/^\s*>/.test(line))&&lines.some(line=>!/^\s*>/.test(line)))return {body:text,quote:''};
 }
 return boundary?{body:text.slice(0,boundary.index).trim(),quote:text.slice(boundary.index).trim()}:{body:text,quote:''};
}
const date=value=>displayDateTime(value);
export function receiveReplySuggestion(draft,data){
 if(draft.sourceHistoryId&&!draft.saved&&(draft.sourceHistoryId!==data.historyId||draft.sourceContextHash!==data.contextHash))draft.stale=true;
 const suggestion=data.suggestedReply;
 if(!suggestion||draft.touched||draft.body||draft.saved||draft.uncertain||draft.stale)return;
 if(suggestion.incomingMessageId!==data.replyTarget?.messageId||typeof suggestion.body!=='string'||!suggestion.body.trim())return;
 Object.assign(draft,{body:suggestion.body,document:plainDocument(suggestion.body),attachments:[],suggestionId:suggestion.id,language:suggestion.language,reviewed:false,sourceHistoryId:data.historyId,sourceContextHash:data.contextHash});
 const saved=data.savedDraft;
 if(saved?.requestId===suggestion.id&&saved.status==='saved'&&providerId.test(saved.providerMessageId||''))Object.assign(draft,{saved:true,savedHistoryId:providerId.test(saved.historyId||'')?saved.historyId:data.historyId,providerMessageId:saved.providerMessageId,attempt:{requestId:saved.requestId}});
 else if(saved?.requestId===suggestion.id&&saved.status==='uncertain')draft.uncertain=true;
}
export function renderCampaignConversation({scope={},reviewKey=null,data=null,loading=false,saving=false,error=null,body='',document:replyDocument=null,attachments= [],saved=false,uncertain=false,demo=false,providerMessageId=null,suggestionId=null,reviewed=false,stale=false,confirmSend=false,sent=false,feedbackStatus=null,readOnly=false}={}){
 const draftHref=saved&&providerId.test(providerMessageId||'')?gmailConversationUrl({...scope,mailboxEmail:data?.mailboxEmail,providerMessageId}):null;
 const keepDraft=reviewKey&&saved&&!sent?'<button type="button" class="button button--secondary" data-ops-action="finish-review-draft"'+(saving||loading||uncertain?' disabled':'')+'>Keep draft & next</button>':'';
 const blocked=!data?.canSaveDraft||loading||saving||uncertain||stale||sent||suggestionId&&!reviewed;
 const messages=Array.isArray(data?.messages)?data.messages:[];
 const target=messages.find(m=>m.id===data?.replyTarget?.messageId);
 const current=target||messages.findLast(m=>m.direction==='inbound')||messages.at(-1);
 const currentIndex=current?messages.indexOf(current):0,earlier=messages.slice(0,currentIndex);
 const contentParts=m=>{
  const markers=[];let source='';
  if(Array.isArray(m.bodySegments))for(const segment of m.bodySegments){
   if(segment?.type==='text'&&typeof segment.text==='string'){source+=segment.text;continue;}
   const local=segment?.type==='image'&&/^0(?:\.\d{1,3}){0,9}$/.test(segment.partPath||'')&&['image/png','image/jpeg'].includes(segment.mimeType);
   const remote=segment?.type==='image'&&segment.external===true&&segment.mimeType==='image/remote'&&safeRemoteEmailImageUrl(segment.src);
   if(!local&&!remote)continue;
   let marker=`\uE000BYOUIQ_IMAGE_${markers.length}\uE001`;while(source.includes(marker)||markers.some(item=>item.marker===marker))marker+='\uE002';
   markers.push({marker,part:segment});source+=marker;
  }
  const text=conversationText(Array.isArray(m.bodySegments)?source:m.body);
  const split=value=>{
   const parts=[];let cursor=0;
   while(cursor<value.length){
    let found=null,index=value.length;
    for(const item of markers){const at=value.indexOf(item.marker,cursor);if(at>=0&&at<index){found=item;index=at;}}
    if(!found){parts.push({type:'text',text:value.slice(cursor)});break;}
    if(index>cursor)parts.push({type:'text',text:value.slice(cursor,index)});
    parts.push({type:'image',...found.part});cursor=index+found.marker.length;
   }
   return parts;
  };
  const bodyParts=split(text.body),quoteParts=split(text.quote),shown=new Set([...bodyParts,...quoteParts].filter(p=>p.type==='image').map(p=>p.partPath));
  for(const image of m.inlineImages||[])if(!shown.has(image.partPath)&&/^0(?:\.\d{1,3}){0,9}$/.test(image.partPath||'')&&['image/png','image/jpeg'].includes(image.mimeType))bodyParts.push({type:'image',...image});
  if(demo&&m.id==='sample-msg-2'&&m.demoImage===true)bodyParts.push({type:'image',mimeType:'image/svg+xml',demoAsset:true,alt:'Sample email product image'});
  return {bodyParts,quoteParts,text};
 };
 const renderBodyParts=(m,parts)=>emailBodySegmentsHtml(parts,image=>image.demoAsset===true&&demo&&m.id==='sample-msg-2'?'/assets/demo-email-image.svg':image.external===true?image.src:campaignConversationImageUrl({...scope,messageId:m.id,partPath:image.partPath}));
 const messageCard=m=>{
  const content=contentParts(m),selected=!readOnly&&m===target,outbound=m.direction==='outbound';
  const bodyHtml=renderBodyParts(m,content.bodyParts)||`<span data-no-translate>${esc(content.text.body||(content.text.quote?'This email contains quoted history only.':'Message text unavailable.'))}</span>`;
  const quoteHtml=renderBodyParts(m,content.quoteParts);
  return `<article class="ops-conversation-message${outbound?' ops-conversation-message--outbound':''}${selected?' ops-conversation-message--selected':''}"${selected?' data-conversation-reply-target tabindex="-1"':''}>
   <header><div class="ops-conversation-sender"><span class="ops-conversation-avatar" aria-hidden="true">${outbound?'B':esc((m.author||data?.creatorName||'?').slice(0,1).toUpperCase())}</span><div><strong data-no-translate>${esc(m.author||'Sender unavailable')}</strong><span class="ops-conversation-direction" data-i18n>${outbound?'BYOU team':m.senderRole==='authorized_representative'?'Approved representative':m.senderRole==='creator'?'Creator':m.senderRole==='unverified_sender'?'Sender needs review':m.direction==='inbound'?'Received message':'Email'}</span></div></div><time datetime="${esc(m.at)}" data-i18n>${esc(date(m.at))}</time></header>
   ${selected?'<span class="ops-conversation-marker">Replying to this message</span>':''}
   <div class="ops-conversation-body">${bodyHtml}</div>
   ${content.quoteParts.length?`<details class="ops-conversation-quote"><summary data-i18n>Show quoted history</summary><div class="ops-conversation-body">${quoteHtml}</div></details>`:''}
   ${m.bodyComplete!==true?'<p class="ops-note">Some message content could not be displayed. Open Gmail to read it.</p>':''}
   ${m.attachmentCount?`<p class="ops-note">${esc(m.attachmentCount)} attachment${m.attachmentCount===1?'':'s'} · View in Gmail</p>`:''}</article>`;
 };
 return `${readOnly?'':'<div class="drawer-backdrop" data-ops-action="close-editor"></div>'}<aside class="drawer ops-conversation" ${readOnly?'aria-label="Email thread"':'role="dialog" aria-modal="true" aria-labelledby="conversation-title"'}>
 <div class="ops-conversation-top"><header class="drawer-header"><div><span class="ops-conversation-eyebrow" data-i18n>Conversation</span><h2 id="conversation-title">${esc(data?.creatorName||'Conversation')}</h2><p data-no-translate>${esc(data?.subject||'Linked Gmail conversation')}</p></div><button type="button" class="icon-button" data-ops-action="close-editor" aria-label="Close conversation"${saving?' disabled':''}>${icon('close')}</button></header>
 ${!readOnly&&data?.candidateRepresentative?`<section class="ops-notice"><strong>Representative needs approval</strong><p>${esc(data.candidateRepresentative.displayName)} · ${esc(data.candidateRepresentative.email)}<br>The creator is copied in this conversation. Approve this person only if they may reply for the creator.</p><button type="button" class="button button--secondary" data-ops-action="authorize-representative"${saving?' disabled':''}>Authorize for this conversation</button><small>Applies only to this campaign conversation. Keeps the creator copied. No email is sent.</small></section>`:''}
 ${error?`<p class="ops-notice ops-error" role="alert">${esc(error)}</p>`:''}
 </div><section class="ops-conversation-history" aria-label="Email conversation"${loading?' aria-busy="true"':''}>
 ${loading?'<p role="status">Loading conversation…</p>':`${earlier.length?`<details class="ops-conversation-earlier"><summary data-i18n>${earlier.length} earlier message${earlier.length===1?'':'s'} <span>View conversation history</span></summary><div class="ops-conversation-earlier-list">${earlier.map(messageCard).join('')}</div></details>`:''}<div class="ops-conversation-position">${messages.length?`${messages.length} message${messages.length===1?'':'s'} · Oldest to newest`:''}</div>${messages.slice(currentIndex).map(messageCard).join('')||'<p>No messages loaded.</p>'}`}
 </section>
 ${readOnly?'':`<form data-ops-form="conversation" class="ops-conversation-draft">
 ${data?.complete===false?'<p class="ops-note">Some content is unavailable here. Gmail has the original conversation.</p>':''}
 ${data?.replyTarget?.cc?.length?`<p class="ops-note">CC: ${esc(data.replyTarget.cc.join(', '))}</p>`:''}
 ${target?`<button type="button" class="ops-conversation-reply-context" data-ops-action="show-reply-target"><span class="ops-conversation-arrow" aria-hidden="true">↳</span><span>Replying to <strong>${esc(target.author||data.creatorName)}</strong><small>${esc(date(target.at))}</small></span><span aria-hidden="true">↑</span></button>`:''}
 ${stale?'<p class="ops-notice" role="status">The conversation or campaign changed. Reload the page before preparing a reply.</p>':''}
 ${renderEmailComposer({name:'replyBody',body,document:replyDocument,attachments,label:'Your reply',recipient:data?.replyTarget?.to||'',sender:data?.mailboxEmail||'sample-team@example.invalid',showSender:false,allowAttachments:true,disabled:saving||saved||confirmSend||sent})}
 ${!loading&&suggestionId?`<label class="ops-reply-review"><input type="checkbox" data-ops-field="reply-reviewed"${reviewed?' checked':''}${saving?' disabled':''}> I reviewed this reply</label>`:''}
 ${confirmSend?`<section class="ops-conversation-send-confirm" role="region" aria-label="Confirm email"><h3>Review before sending</h3><p>From: <strong>${esc(data?.mailboxEmail)}</strong><br>To: <strong>${esc(data?.replyTarget?.to)}</strong>${data?.replyTarget?.cc?.length?`<br>CC: <strong>${esc(data.replyTarget.cc.join(', '))}</strong>`:''}<br>Subject: ${esc(data?.replyTarget?.subject)}</p><div class="ops-conversation-body ops-conversation-final-message">${documentHtml(replyDocument||plainDocument(body),{attachments,preview:true})}</div><div class="ops-actions"><button type="button" class="button button--primary" data-ops-action="confirm-send-reply"${blocked?' disabled':''}>${saving?'Sending…':'Approve & send'}</button><button type="button" class="button button--secondary" data-ops-action="cancel-send-reply"${saving?' disabled':''}>Keep editing</button></div></section>`:`<div class="ops-actions ops-conversation-primary-actions">${keepDraft}${sent?'':saved&&draftHref?`<a class="button button--secondary" href="${esc(draftHref)}" target="_blank" rel="noopener noreferrer">Open draft in Gmail ↗</a>`:`<button type="submit" class="button button--secondary"${blocked||saved?' disabled':''}>${saving?'Saving…':'Open draft in Gmail ↗'}</button>`}${!sent?`<button type="button" class="button button--primary" data-ops-action="review-send-reply"${blocked||!data?.replyTarget?.to?' disabled':''}>Send email</button>`:''}</div>`}
 ${sent?'<p class="ops-notice" role="status">Email sent from sample-team@example.invalid.</p>':''}
 ${saved&&feedbackStatus==='captured'?'<p class="ops-note">Draft feedback retained for review.</p>':saved&&feedbackStatus==='unavailable'?'<p class="ops-note">Draft saved; feedback capture is unavailable.</p>':''}
 ${saved?'':uncertain?'<p class="ops-note" role="status">Check Gmail before saving another copy.</p>':data&&!data.canSaveDraft&&!loading?`<p class="ops-note" role="status">${data.replyTarget?'Reconnect the marketing Gmail account to enable saving.':'Open Gmail to reply; the recipient could not be verified.'}</p>`:''}
 </form>`}</aside>`;
}
