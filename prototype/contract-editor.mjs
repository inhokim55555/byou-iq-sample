import {chooseContractThread,contractScopeQuery} from './campaign-contract.mjs';
import {ATTACHMENT_LIMIT} from './email-content.mjs';
import {renderCampaignConversation} from './campaign-conversation-ui.mjs';

// A campaign-owned dialog preserves the editor while its PDF returns to the CRM.
export function createContractEditorPanel({beginLoading=()=>()=>{},onAttach=async()=>{},notify=()=>{}}={}){
 let dialog=null,frame=null,scope=null,dirty=false,busy=false,opener=null,generation=0,layout=null,threadPane=null,threadOpen=false,threadRequest=0,threadController=null;
 const sameScope=(a,b)=>a&&b&&['campaignId','assignmentId','providerThreadId'].every(key=>a[key]===b[key]);
 function close(){dialog?.close();if(opener?.isConnected)opener.focus();}
 function reset(){generation++;threadController?.abort();threadRequest++;dialog?.remove();dialog=null;frame=null;scope=null;dirty=false;busy=false;layout=null;threadPane=null;threadOpen=false;}
 function renderThread(options={}){
  threadPane.innerHTML=renderCampaignConversation({scope,readOnly:true,...options});
  threadPane.querySelector('[data-ops-action="close-editor"]')?.addEventListener('click',()=>setThreadOpen(false,true));
  if(options.error){const retry=document.createElement('button');retry.type='button';retry.className='button button--secondary';retry.textContent='Try again';retry.onclick=()=>loadThread();threadPane.querySelector('.ops-conversation-history').append(retry);}
 }
 async function loadThread(){
  threadController?.abort();threadController=new AbortController();const request=++threadRequest,version=generation,selected={...scope};renderThread({loading:true});
  try{
   const response=await fetch(`/api/campaign-ops/${encodeURIComponent(selected.campaignId)}/assignments/${encodeURIComponent(selected.assignmentId)}/conversation?thread=${encodeURIComponent(selected.providerThreadId)}`,{credentials:'same-origin',signal:AbortSignal.any([threadController.signal,AbortSignal.timeout(30000)])});
   if(!response.ok)throw Error(response.status===401?'Sign in to BYOU IQ again to load this conversation.':'The email thread could not be loaded. Try again.');
   const result=await response.json(),data=result.data;
   if(!sameScope(data,selected)||!Array.isArray(data.messages))throw Error('This conversation does not match the selected contract. Reopen it from the creator card.');
   if(request===threadRequest&&version===generation&&threadOpen)renderThread({data});
  }catch(error){if(request===threadRequest&&version===generation&&threadOpen)renderThread({error:error.message});}
 }
 function setThreadOpen(open,focus=false){
  threadOpen=open;layout.classList.toggle('is-split',open);threadPane.inert=!open;threadPane.setAttribute('aria-hidden',String(!open));
  frame.contentWindow?.postMessage({type:'byou-contract-thread-state',open,focus},location.origin);
  if(open)void loadThread();else{threadController?.abort();threadRequest++;}
 }
 async function launch({campaignId,assignmentId,threads}){
  if(busy)throw Error('Wait for the contract attachment to finish.');
  const thread=await chooseContractThread(threads);if(!thread)return;
  const next={campaignId,assignmentId,providerThreadId:thread.providerThreadId};
  if(sameScope(scope,next)&&dialog){opener=document.activeElement;dialog.showModal();return;}
  if(dirty&&!confirm('Discard unsaved contract changes and open another contract?'))return;
  reset();scope=next;opener=document.activeElement;
  dialog=document.createElement('dialog');dialog.className='campaign-contract-dialog';dialog.setAttribute('aria-label','Campaign contract editor');
  layout=document.createElement('div');layout.className='campaign-contract-layout';
  frame=document.createElement('iframe');frame.title='Campaign contract editor';frame.src='/contract-editor/?'+contractScopeQuery(scope);
  threadPane=document.createElement('section');threadPane.className='campaign-contract-thread';threadPane.setAttribute('aria-label','Selected email thread');threadPane.setAttribute('aria-hidden','true');threadPane.inert=true;
  layout.append(frame,threadPane);dialog.append(layout);document.body.append(dialog);
  dialog.addEventListener('cancel',event=>{event.preventDefault();if(threadOpen){setThreadOpen(false,true);return;}if(busy)return;if(!dirty){close();return;}frame.contentWindow?.postMessage({type:'byou-contract-request-close'},location.origin);});
  const finish=beginLoading();const timer=setTimeout(finish,30000);frame.addEventListener('load',()=>{clearTimeout(timer);finish();},{once:true});frame.addEventListener('error',()=>{clearTimeout(timer);finish();notify('The contract editor could not load. Close it and try again.');},{once:true});dialog.showModal();
 }
 window.addEventListener('message',async event=>{
  if(event.origin!==location.origin||event.source!==frame?.contentWindow)return;
  const data=event.data;
  if(data?.type==='byou-contract-dirty'){dirty=data.dirty===true;return;}
  if(data?.type==='byou-contract-close'){if(!busy&&!dirty)close();return;}
  if(data?.type==='byou-contract-toggle-thread'&&sameScope(data.scope,scope)){setThreadOpen(!threadOpen);return;}
  if(data?.type!=='byou-contract-attach'||busy||!sameScope(data.scope,scope)||!/^[0-9a-f-]{36}$/i.test(data.artifactId||'')||!/^[0-9a-f-]{36}$/i.test(data.requestId||''))return;
  busy=true;const version=generation,source=event.source;const finish=beginLoading();
  try{
   const response=await fetch('/contract-editor/api/exports/'+data.artifactId+'/pdf?'+contractScopeQuery(scope),{credentials:'same-origin',signal:AbortSignal.timeout(30000)});
   if(!response.ok)throw Error('The PDF could not be loaded. Reopen the contract and try again.');
   if(!response.headers.get('content-type')?.startsWith('application/pdf'))throw Error('The contract download is not a PDF.');
   const blob=await response.blob();if(blob.size>ATTACHMENT_LIMIT)throw Error('The PDF exceeds the email attachment limit of 5 MB. Download it to share separately.');
   const bytes=new Uint8Array(await blob.arrayBuffer());if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('The contract PDF could not be verified.');
   let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
   let name='Contract.pdf';const disposition=response.headers.get('content-disposition')||'';const encoded=/filename\*=UTF-8''([^;]+)/i.exec(disposition);const plain=/filename="([^"]+)"/.exec(disposition);
   try{name=encoded?decodeURIComponent(encoded[1]):plain?.[1]||name;}catch{}
   name=name.replace(/[\x00-\x1f\x7f/\\]/g,'_').replace(/\.pdf$/i,'').trim().slice(0,116).replace(/[\uD800-\uDBFF]$/,'');
   name=(name||'Contract')+'.pdf';
   if(version!==generation)return;
   close();await onAttach({...scope},{name,type:'application/pdf',size:blob.size,data:btoa(binary)});
   if(version!==generation)return;
   source.postMessage({type:'byou-contract-attached',requestId:data.requestId,ok:true},location.origin);notify('Contract PDF attached to the conversation draft.');
  }catch(error){if(version===generation){source.postMessage({type:'byou-contract-attached',requestId:data.requestId,ok:false,error:error.message},location.origin);if(!dialog.open)dialog.showModal();}}
  finally{if(version===generation)busy=false;finish();}
 });
 return {launch,update({enabled}){if(!enabled)reset();}};
}
