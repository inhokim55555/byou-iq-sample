import {displayDate,displayDateTime} from './date-format.mjs';
import {validateAttachments} from './email-content.mjs';
export function campaignContractThreads(data,scope){
 if(!data||Object.entries(scope).some(([key,value])=>data[key]!==value)||!Array.isArray(data.threads))throw Error('The linked conversations could not be verified. Reload the campaign and try again.');
 const seen=new Set();
 return data.threads.map(thread=>{
  if(!/^[A-Za-z0-9_-]{8,256}$/.test(thread?.providerThreadId||'')||seen.has(thread.providerThreadId))throw Error('The linked conversations could not be verified. Reload the campaign and try again.');
  seen.add(thread.providerThreadId);
  return {providerThreadId:thread.providerThreadId,approvedSubject:typeof thread.approvedSubject==='string'?thread.approvedSubject.slice(0,240):null,latestMessageAt:thread.latestMessageAt};
 });
}
export function contractScopeQuery(scope){return new URLSearchParams({campaign:scope.campaignId,assignment:scope.assignmentId,thread:scope.providerThreadId});}
export function mergeContractAttachment(draft,file){
 if(draft.saved||draft.uncertain||draft.saving||draft.sent||draft.stale)throw Error('Check the existing draft and start a new editable reply before attaching the contract.');
 if(file?.type!=='application/pdf')throw Error('The contract must be a PDF.');
 const attachments=[...(draft.attachments||[])];
 if(!attachments.some(f=>f.name===file.name&&f.data===file.data))attachments.push(file);
 validateAttachments(attachments);
 return {...draft,attachments,touched:true,reviewed:false,attempt:null};
}
export function chooseContractThread(threads){
 if(!threads.length)throw Error('No verified conversation is linked to this campaign creator. Link the conversation before preparing a contract.');
 if(threads.length===1)return Promise.resolve(threads[0]);
 return new Promise(resolve=>{
  const dialog=document.createElement('dialog');dialog.className='campaign-contract-picker';
  const title=document.createElement('h2');title.textContent='Choose a conversation';title.id='contract-thread-title';dialog.setAttribute('aria-labelledby',title.id);
  const form=document.createElement('form');form.method='dialog';const label=document.createElement('label');label.textContent='Email thread';
  const select=document.createElement('select');threads.forEach((thread,i)=>{const option=document.createElement('option');option.value=String(i);const date=new Date(thread.latestMessageAt);option.textContent=(thread.approvedSubject||'Conversation')+' · '+(thread.latestMessageAt&&Number.isFinite(+date)?displayDateTime(thread.latestMessageAt):'Date unavailable')+' · '+thread.providerThreadId.slice(-6);select.append(option);});label.append(select);
  const preview=document.createElement('a');preview.textContent='Open selected conversation in Gmail';preview.target='_blank';preview.rel='noopener noreferrer';const updatePreview=()=>{preview.href='https://mail.google.com/mail/u/0/#all/'+threads[Number(select.value)].providerThreadId;};select.addEventListener('change',updatePreview);updatePreview();
  const submit=document.createElement('button');submit.textContent='Open contract editor';submit.value='open';submit.className='button button--primary';
  const cancel=document.createElement('button');cancel.textContent='Cancel';cancel.value='cancel';cancel.className='button button--secondary';
  form.append(label,preview,submit,cancel);dialog.append(title,form);document.body.append(dialog);
  const previous=document.activeElement;dialog.addEventListener('close',()=>{const result=dialog.returnValue==='open'?threads[Number(select.value)]:null;dialog.remove();previous?.focus();resolve(result);},{once:true});dialog.showModal();select.focus();
 });
}
