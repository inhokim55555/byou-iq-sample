import {displayDate} from './date-format.mjs';
import {saveTemplateFallbacks} from './template-personalization.mjs';
import {liftCreatorCard} from './creator-card-drag.mjs';
import {replyFeedbackCommand} from './reply-feedback.mjs';
import {positionCampaignMenu} from './campaign-menu-position.mjs';
import {campaignWorkspaceMembers,workspaceMemberLabel} from './campaign-workspaces.mjs';
import {operationsIcon as icon} from './operations-icons.mjs';
import {renderExecutiveOverview,replyReviewKey,renderOperationsDirectory,renderOperationsCampaign,renderOperationsFinance,renderOperationsShipments,renderOperationsEditor,renderOperationsOutreach,renderOperationsAutomations,addressText} from './campaign-operations-ui.mjs';
import {createOperationsDemoStore,readCampaignOperationForm,net30Date,financePaymentBlockReason,validFinanceDate,planShipmentImport,buildShipmentImportCommand} from './campaign-operations-model.mjs';
import {installEmailComposers,readEmailComposer,setEmailComposer,importEmailHtml} from './email-composer.mjs';
import {ATTACHMENT_TYPES,documentHtml,documentText} from './email-content.mjs';
import {renderFinancePaymentDialog,renderFinanceExpenseDialog,renderFinanceUndoDialog} from './finance-batches-ui.mjs';
import {financeShares,assignmentPublications} from './finance-batches.mjs';
import {assignmentDeliverables,MAX_ASSIGNMENT_DELIVERABLES} from './assignment-details-fields.mjs';
import {renderCampaignConversation,gmailConversationUrl,receiveReplySuggestion} from './campaign-conversation-ui.mjs';
import {readShipmentWorkbook,mapShipmentWorkbookRows} from './shipment-xlsx-import.mjs';
import {campaignContractThreads,mergeContractAttachment} from './campaign-contract.mjs';
import {renderFinanceIntake} from './finance-intake-ui.mjs';

const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const unpack = value => value?.data ?? value;
const today = () => new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function campaignTypeChoices(campaigns) {
  return campaigns.flatMap(c=>{
    const members=campaignWorkspaceMembers(c);
    return members.map(m=>({...c,...m,name:members.length>1?`${c.workspaceName||c.name} · ${workspaceMemberLabel(m,members)}`:m.name||c.name}));
  });
}
function preserveFocus(surface) {
  const active=document.activeElement;
  if(!surface.contains(active))return ()=>{};
  const attributes=['name','data-ops-action','data-ops-field','data-ops-value','data-ops-select-creator','data-creator-id','data-draft-id','data-finance-disclosure','aria-label'];
  const values=attributes.map(name=>active.getAttribute(name));
  const campaign=active.closest('[data-campaign-id]')?.dataset.campaignId;
  const assignment=active.closest('[data-assignment-id]')?.dataset.assignmentId;
  const value=active.matches('input[type=checkbox],md-checkbox')?active.value:null;
  const candidates=[...surface.querySelectorAll('button,input,select,textarea,a,summary,md-checkbox')];
  const same=el=>el.tagName===active.tagName&&attributes.every((name,i)=>el.getAttribute(name)===values[i])&&el.closest('[data-campaign-id]')?.dataset.campaignId===campaign&&el.closest('[data-assignment-id]')?.dataset.assignmentId===assignment&&(!value||el.value===value);
  const index=candidates.filter(same).indexOf(active),start=active.selectionStart,end=active.selectionEnd;
  return ()=>{
    const replacement=active.isConnected?active:[...surface.querySelectorAll('button,input,select,textarea,a,summary,md-checkbox')].filter(same)[index];
    replacement?.focus({preventScroll:true});
    if(start!=null&&replacement?.setSelectionRange)try{replacement.setSelectionRange(start,end);}catch{}
  };
}

export function createCampaignOperationsController({root,requestJson,rerender,navigate,notify,getCurrentUserId=()=>null,getLocale=()=>'en',getCreators=()=>[],getSelectedCreators,setSelectedCreators,openCreator,openContractEditor,createDragPreview=liftCreatorCard}) {
  const draw=rerender;rerender=()=>{captureFinanceDisclosures();const restore=preserveFocus(root);draw();restore();};
  let mode=null, generation=0, demo=null, editor=null, editorRequest=0, focusBefore=null, outreach=null, timer=null,refreshTimer=null;
  const cache=new Map(), selectedCreators=new Map();
  const selection=()=>getSelectedCreators ? getSelectedCreators() || [] : [...selectedCreators.values()];
  const updateSelection=rows=>{selectedCreators.clear();for(const row of rows)selectedCreators.set(row.id,row);setSelectedCreators?.(rows);};
  const ui={campaignTrayVisible:false,campaignTrayOpen:false,campaigns:{search:'',type:'all',activity:'all'},automations:{campaignId:''},finances:{search:'',sort:'due',status:'all',brand:'',campaignId:'',thursday:'all',batchBusy:false,disclosures:{}},shipments:{search:'',sort:'newest',assignmentChoices:null,assignmentChoicesLoading:false,assignmentChoicesError:null,draft:null,import:null},rosters:new Map()};
  const financeAttempts=new Map(),paymentAttempts=new Map(),undoAttempts=new Map(),amountChecks=new Set();
  function captureFinanceDisclosures(){for(const el of root.querySelectorAll('[data-finance-disclosure]'))ui.finances.disclosures[el.dataset.financeDisclosure]=el.open;}
  const phaseAttempts=new Map(),shipmentAttempts=new Map(),shipmentImportAttempts=new Map();
  const shipmentCells=new WeakMap();
  let activeShipmentCell=null;
  const conversationDrafts=new Map();
  const overlay=document.createElement('div');overlay.id='campaign-operations-overlay';document.body.append(overlay);
  installEmailComposers(overlay);
  let reviewOwner=null;
  const reviewStorageKey=id=>reviewOwner?`byouiq.handled-replies.v1:${encodeURIComponent(reviewOwner)}:${encodeURIComponent(id)}`:null;
  function readHandledReplies(id){
    try{const storageKey=reviewStorageKey(id);if(!storageKey)return [];
      const value=JSON.parse(localStorage.getItem(storageKey)||'[]');
      return Array.isArray(value)?value.filter(token=>{try{const parts=JSON.parse(token);return typeof token==='string'&&parts.length===3&&parts.every(part=>typeof part==='string');}catch{return false;}}):[];
    }catch{return [];}
  }
  function persistHandledReplies(id,tokens){
    try{
      const storageKey=reviewStorageKey(id);if(!storageKey)throw Error('User unavailable');
      // Store identifiers and reply timestamps only, never email text or summaries.
      const dated=tokens.filter(token=>{try{return !!JSON.parse(token)[2];}catch{return false;}});
      localStorage.setItem(storageKey,JSON.stringify(dated));
      if(dated.length!==tokens.length)notify('A reply date is unavailable, so that card can only be hidden for this session.');
      return true;
    }catch{notify('This browser could not remember handled replies. They may return after refresh.');return false;}
  }
  const rosterUI=id=>{if(!ui.rosters.has(id))ui.rosters.set(id,{phase:'all',rosterMode:'cards',selectedAssignmentId:null,search:'',selectedCreatorIds:[],phaseSaves:{},handledReplies:readHandledReplies(id)});return ui.rosters.get(id);};
  globalThis.addEventListener?.('storage',event=>{
    if(!event.key?.startsWith('byouiq.handled-replies.v1:'))return;
    for(const [id,state] of ui.rosters)if(event.key===reviewStorageKey(id)){state.handledReplies=readHandledReplies(id);state.replyIndex=0;rerender();break;}
  });

  const key=(view,id)=>view==='campaign'?`campaign:${id}`:view;
  const permissions=(campaign,assignments=[])=>({canEdit:campaign?.canEdit===true||assignments.some(a=>a.canEdit===true),canFinance:assignments.some(a=>a.canFinance===true),canShip:assignments.some(a=>a.canShip===true)});
  const allCreators=()=>[...new Map([...(demo?.creators||[]),...getCreators(),...selection()].map(c=>[c.id,c])).values()];
  function configure(nextMode) {
    const nextOwner=nextMode==='demo'?'demo':nextMode==='live'&&getCurrentUserId()?'live:'+getCurrentUserId():null;
    if(mode===nextMode&&reviewOwner===nextOwner)return;
    reviewOwner=nextOwner;
    generation++;mode=nextMode;activeShipmentCell=null;ui.campaignTrayVisible=false;cache.clear();updateSelection([]);draggedCreators=[];clearDragVisual?.();pointerDrag=null;outreach=null;ui.rosters.clear();ui.automations.campaignId='';clearTimeout(timer);timer=null;editorRequest++;
    ui.finances.batchBusy=false;ui.finances.disclosures={};financeAttempts.clear();paymentAttempts.clear();undoAttempts.clear();amountChecks.clear();phaseAttempts.clear();shipmentAttempts.clear();shipmentImportAttempts.clear();ui.shipments.assignmentChoices=null;ui.shipments.assignmentChoicesLoading=false;ui.shipments.assignmentChoicesError=null;ui.shipments.draft=null;ui.shipments.import=null;conversationDrafts.clear();
    clearInterval(refreshTimer);refreshTimer=null;
    if(mode==='live')refreshTimer=setInterval(()=>{
      const campaign=root.querySelector('[data-ops-view="campaign"],.ops-automations-selected[data-campaign-id]')?.dataset.campaignId;
      if(campaign&&!editor&&!Object.values(rosterUI(campaign).phaseSaves).some(s=>s.saving)&&document.visibilityState==='visible'&&!cache.get(key('campaign',campaign))?.loading)void load('campaign',campaign,{reload:true,background:true});
      if(root.querySelector('[data-ops-view="finance"]')&&!editor&&document.visibilityState==='visible'&&!ui.finances.batchBusy&&!cache.get('finances')?.loading)void load('finances',null,{reload:true,background:true});
    },60000);
    demo=mode==='demo'?createOperationsDemoStore():null;closeEditor(true);
  }
  function path(view,id,append=false) {
    if(view==='finances')return '/api/finances/ledger';
    const p=new URLSearchParams({limit:'100'}),filters=view==='campaign'?{}:ui[view]||{};
    if(filters.search)p.set('q',filters.search);
    for(const name of ['type','activity','sort','status','brand','campaignId','thursday'])if(filters[name]&&filters[name]!=='all')p.set(name,filters[name]);
    const cursor=append&&cache.get(key(view,id))?.data?.page?.nextCursor;if(cursor)p.set('cursor',cursor);
    return (view==='campaign'?`/api/campaign-ops/${encodeURIComponent(id)}`:['campaigns','automation-campaigns'].includes(view)?'/api/campaign-ops':`/api/${view}`)+'?'+p;
  }
  async function load(view,id,{reload=false,append=false,background=false}={}) {
    if(!mode)return null;
    const k=key(view,id),prior=cache.get(k);
    if(prior?.pending&&!reload)return prior.pending;
    if(prior?.data&&!reload&&!append)return prior;
    const token=Symbol(),session=generation;
    const entry={data:append?prior?.data:null,error:null,loading:true,token};cache.set(k,entry);
    entry.pending=(async()=>{
      try{
        let data=demo?await Promise.resolve(demo.read(view==='automation-campaigns'?'campaigns':view,id,view==='finances'?{}:ui[view])):unpack(await requestJson(path(view,id,append),{background}));
        if(generation!==session||cache.get(k)?.token!==token)return entry;
        if(view==='finances'&&!demo&&Array.isArray(data?.items)&&data.page?.hasMore===false){
          const missing=data.items.filter(a=>a.canFinance&&a.finance?.status!=='paid'&&a.finance?.amount==null&&!amountChecks.has(`${a.id}:${a.revision}`)).slice(0,30);
          if(missing.length)try{
            const result=unpack(await requestJson('/api/finances/fill-amounts',{method:'POST',csrf:true,background,body:{assignments:missing.map(a=>({campaignId:a.campaignId,assignmentId:a.id,expectedRevision:a.revision}))}}));
            if(generation!==session||cache.get(k)?.token!==token)return entry;
            if(Array.isArray(result?.filled)){
              for(const a of missing)amountChecks.add(`${a.id}:${a.revision}`);
              if(result.filled.length)data=unpack(await requestJson(path(view,id,append),{background}));
            }
          }catch{/* Keep manual editing available when document extraction is unavailable. */}
          if(generation!==session||cache.get(k)?.token!==token)return entry;
        }
        if(view==='automation-campaigns'&&Array.isArray(data?.items))data={...data,items:campaignTypeChoices(data.items)};
        const array=view==='campaign'?'assignments':'items';
        if(view==='finances'&&data?.page?.hasMore)throw new Error('The complete finance ledger could not be loaded. Reload before reviewing payments.');
        if(!data||!Array.isArray(data[array]))throw new Error('The saved records could not be verified. Reload this view.');
        if(view==='finances')for(const a of data.items)if(a.finance?.status==='paid')paymentAttempts.delete(`${a.campaignId}:${a.id}`);
        entry.data=append&&prior?.data?{...data,[array]:[...new Map([...prior.data[array],...data[array]].map(item=>[item.id,item])).values()]}:data;
        if(view==='campaign'&&append&&prior?.data){
          entry.data.actions=[...new Map([...(prior.data.actions||[]),...(data.actions||[])].map(item=>[item.id,item])).values()];
          if(Array.isArray(data.creators))entry.data.creators=[...new Map([...(prior.data.creators||[]),...data.creators].map(item=>[item.id,item])).values()];
        }
      }catch(error){if(generation===session&&cache.get(k)?.token===token)entry.error=error.message||'Records unavailable.';}
      finally{if(generation===session&&cache.get(k)?.token===token){entry.loading=false;entry.pending=null;if(view==='campaigns'&&draggedCreators.length&&root.querySelector('.ops-creator-layout'))syncDragTray(true);else rerender();}}
      return entry;
    })();
    return entry.pending;
  }
  function ensure(view,id) {
    const k=key(view,id);
    if(!cache.has(k))void load(view,id);
    return cache.get(k)||{data:null,error:null,loading:true};
  }
  function render(view,id) {
    if(view==='finances')captureFinanceDisclosures();
    if(view==='automations'){
      const directory=ensure('automation-campaigns'),campaignId=ui.automations.campaignId;
      const selected=campaignId?ensure('campaign',campaignId):null;
      return renderOperationsAutomations({campaigns:directory.data?.items||[],directoryLoading:directory.loading,directoryError:directory.error,
        hasMore:directory.data?.page?.hasMore===true,campaignId,operations:selected?.data||null,loading:selected?.loading||false,error:selected?.error||null,demo:!!demo,replyUI:campaignId?{...rosterUI(campaignId),locale:getLocale()}:{}});
    }
    const entry=ensure(view,id),data=entry.data||{},shared={loading:entry.loading,error:entry.error,demo:!!demo};
    if(view==='campaigns')return renderOperationsDirectory({...shared,campaigns:data.items||[],ui:ui.campaigns,hasMore:data.page?.hasMore,canCreate:demo?true:data.canCreate===true});
    if(view==='campaign') {
      if(!data.campaign)return `<div class="ops-workspace"><p role="${entry.error?'alert':'status'}">${esc(entry.error||'Loading campaign…')}</p><button type="button" class="button button--secondary" data-ops-action="all-campaigns">All campaigns</button></div>`;
      if(outreach?.campaignId===id)return renderOperationsOutreach({campaign:data.campaign,creators:(data.assignments||[]).map(a=>({id:a.creatorId,displayName:a.creatorDisplayName,handle:a.creatorHandle})),
        ...outreach,selectedCreatorIds:rosterUI(id).selectedCreatorIds,canPrepare:data.campaign?.canEdit===true,demo:!!demo});
      return renderOperationsCampaign({...shared,campaign:data.campaign,creators:Array.isArray(data.creators)?data.creators:allCreators(),operations:data,ui:{...rosterUI(id),locale:getLocale()},permissions:permissions(data.campaign,data.assignments),hasMore:data.page?.hasMore});
    }
    const records=data.items||[],props={...shared,records,ui:{...ui[view],today:today()},permissions:permissions(null,records),batches:data.batches,totals:data.totals,brands:data.brands,campaigns:data.campaigns,canApproveBatch:data.canApproveBatch===true,canExportBatch:data.canExportBatch===true,hasMore:data.page?.hasMore===true};
    const content=view==='finances'?renderOperationsFinance(props):renderOperationsShipments(props);
    return content+(data.page?.hasMore?`<button type="button" class="button button--secondary" data-ops-action="load-more-queue" data-ops-value="${view}"${entry.loading?' disabled':''}>Load more records</button>`:'');
  }
  function editorPermissions(campaign,assignment) {
    return {canEdit:!campaign.id?cache.get('campaigns')?.data?.canCreate===true||!!demo:campaign.canEdit===true||assignment?.canEdit===true,
      canFinance:assignment?.canFinance===true,canShip:assignment?.canShip===true};
  }
  function renderEditor({focus=false}={}) {
    if(!editor)return;
    const restore=preserveFocus(overlay);
    root.inert=true;
    if(editor.kind==='progress')overlay.innerHTML=renderExecutiveOverview(editor.campaign,editor.assignment,editor.creators,editor.operations,getLocale());
    else if(editor.kind==='finance_intake')overlay.innerHTML=renderFinanceIntake(editor);
    else if(editor.kind==='finance_undo')overlay.innerHTML=renderFinanceUndoDialog(editor);
    else if(editor.kind==='conversation')overlay.innerHTML=renderCampaignConversation({...editor,...editor.draft,demo:!!demo});
    else if(editor.kind==='finance_payment'){
      overlay.innerHTML=renderFinancePaymentDialog({...editor,today:today(),demo:!!demo});
    }else if(editor.kind==='finance_expenses'){
      overlay.innerHTML=renderFinanceExpenseDialog({...editor,demo:!!demo});
    }else if(editor.kind==='choose-campaign'){
      const rows=campaignTypeChoices(cache.get('campaigns')?.data?.items||[]);
      overlay.innerHTML=`<div class="drawer-backdrop" data-ops-action="close-editor"></div><aside class="drawer ops-editor" role="dialog" aria-modal="true" aria-labelledby="ops-choose-title"><header class="drawer-header"><h2 id="ops-choose-title">Add selected creators</h2><button type="button" class="icon-button" data-ops-action="close-editor" aria-label="Close editor">${icon('close')}</button></header><div class="drawer-body"><p>${selection().length} creator(s) selected.</p>${editor.error?`<p role="alert">${esc(editor.error)}</p>`:''}<form data-ops-form="choose-campaign"><label>Campaign<select name="campaignId" required><option value="">Choose a campaign</option>${rows.filter(c=>c.canEdit).map(c=>`<option value="${esc(c.id)}"${c.id===editor.campaignId?' selected':''}>${esc(c.name)} · ${esc(c.type)}</option>`).join('')}</select></label><button class="button button--primary"${editor.saving?' disabled':''}>${editor.saving?'Adding…':'Add to campaign'}</button></form>${cache.get('campaigns')?.data?.page?.hasMore?'<button type="button" class="button button--secondary" data-ops-action="load-more-campaigns">Load more campaigns</button>':''}</div></aside>`;
    }else overlay.innerHTML=renderOperationsEditor({...editor,permissions:editorPermissions(editor.campaign,editor.assignment),paymentBlockReason:demo?'A sample preview cannot record a real payment.':editor.assignment?.finance?.paymentBlockReason});
    if(focus){
      for(const surface of overlay.querySelectorAll('.drawer,.modal,.drawer-backdrop,.modal-backdrop'))surface.setAttribute('data-m3-enter','');
      queueMicrotask(()=>overlay.querySelector('input:not([type=hidden]),select,textarea,button')?.focus());
    }
    else restore();
  }
  function closeEditor(force=false) {
    if(editor?.saving&&!force)return;
    if(editor?.kind==='conversation')captureConversationDraft();
    const restore=focusBefore,fallback=editor?.kind==='delete_campaign'?root.querySelector(`[data-ops-action="delete-campaign"][data-campaign-id="${editor.campaign.id}"]`):editor?.kind==='remove_creator'?root.querySelector(`[data-ops-action="remove-creator"][data-campaign-id="${editor.campaign.id}"][data-assignment-id="${editor.assignment.id}"]`):null;editor=null;editorRequest++;overlay.innerHTML='';root.inert=false;focusBefore=null;
    if(restore?.isConnected)restore.focus();
    else fallback?.focus();
  }
  let reviewMoving=false;
 async function moveReview(campaignId,{handled=false,back=false,reviewKey=null}={}){
 if(reviewMoving)return;reviewMoving=true;const session=generation;
 const state=rosterUI(campaignId),card=root.querySelector('.ops-review-card');
 const actions=(cache.get(key('campaign',campaignId))?.data?.actions||[]).filter(a=>(!a.campaignId||a.campaignId===campaignId)&&a.kind!=='shipment'&&!['resolved','reviewed','dismissed','complete'].includes(a.status)&&!(state.handledReplies||[]).includes(replyReviewKey(a)));
 const index=actions.length?Math.min(state.replyIndex||0,actions.length-1):0;
 try{
 if(card&&!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)await card.animate([{transform:'translateX(0)',opacity:1},{transform:back?'translateX(70%)':'translateX(-70%)',opacity:0}],{duration:220,easing:'cubic-bezier(.3,0,.8,.15)',fill:'forwards'}).finished.catch(()=>{});
 if(session!==generation)return;
 if(handled){const token=reviewKey||card?.dataset.reviewKey;if(token){state.handledReplies=[...new Set([...readHandledReplies(campaignId),...(state.handledReplies||[]),token])];persistHandledReplies(campaignId,state.handledReplies);}state.replyIndex=Math.max(0,Math.min(index,actions.length-2));}
 else state.replyIndex=back?Math.max(0,index-1):(index+1)%Math.max(1,actions.length);
 rerender();const next=root.querySelector('.ops-review-card');next?.focus({preventScroll:true});
 if(next&&!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)next.animate([{transform:back?'translateX(-16%)':'translateX(16%)',opacity:0},{transform:'translateX(0)',opacity:1}],{duration:320,easing:'cubic-bezier(.2,0,0,1)'});
 }finally{reviewMoving=false;}
 }
 async function finishConversationReview(opened){
 if(editor!==opened||!opened.reviewKey)return;
 opened.saving=false;opened.draft.saving=false;closeEditor(true);
 await moveReview(opened.scope.campaignId,{handled:true,reviewKey:opened.reviewKey});
 }
  async function openConversation(campaignId,assignmentId,providerThreadId){
    if(!/^[A-Za-z0-9_-]{8,256}$/.test(providerThreadId||''))return;
    closeEditor();if(editor)return;
    const scope={campaignId,assignmentId,providerThreadId},k=JSON.stringify(scope);
    if(!conversationDrafts.has(k))conversationDrafts.set(k,{body:'',document:null,attachments:[],saved:false,uncertain:false,attempt:null});
    focusBefore=document.activeElement;
    editor={kind:'conversation',scope,draft:conversationDrafts.get(k),loading:true,saving:conversationDrafts.get(k).saving===true,data:null,error:null};
    editor.reviewKey=root.querySelector('.ops-review-card[data-review-assignment="'+assignmentId+'"]')?.dataset.reviewKey||null;
    renderEditor({focus:true});await reloadConversation();
  }
  async function reloadConversation(){
    const opened=editor,session=generation,request=++editorRequest;if(opened?.kind!=='conversation'||opened.saving)return;
    captureConversationDraft();
    opened.loading=true;opened.error=null;renderEditor();
    try{
      const data=demo?demo.conversation(opened.scope):unpack(await requestJson(conversationPath(opened.scope)));
      if(editor!==opened||session!==generation||request!==editorRequest)return;
      if(Object.entries(opened.scope).some(([k,v])=>data?.[k]!==v)||!Array.isArray(data.messages))throw Error('The conversation could not be verified. Open Gmail to check it.');
      opened.data=data;
      receiveReplySuggestion(opened.draft,data);
    }catch(e){if(editor===opened&&session===generation&&request===editorRequest){opened.data=null;opened.error=e.message||'Conversation unavailable.';}}
    finally{if(editor===opened&&session===generation&&request===editorRequest){opened.loading=false;renderEditor();}}
  }
  async function attachContract(scope,file){
    const session=generation;
    await openConversation(scope.campaignId,scope.assignmentId,scope.providerThreadId);
    const opened=editor;
    if(session!==generation||opened?.kind!=='conversation'||Object.entries(scope).some(([key,value])=>opened.scope[key]!==value)||opened.loading||opened.error||!opened.data?.complete)throw Error('The conversation could not be loaded. Your contract is still saved. Try attaching again.');
    if(!captureConversationDraft())throw Error(opened.draft.composeError);
    let draft=opened.draft;
    if(draft.saved&&!draft.uncertain&&!draft.sent&&!draft.stale&&!draft.saving){
      if(!confirm('This reply is already saved in Gmail. Create a new editable CRM draft with the same wording and this PDF? The Gmail draft will stay unchanged.'))throw Error('The existing draft was kept. Start a new reply to attach the PDF.');
      draft={...draft,saved:false,attempt:null,providerMessageId:null,savedHistoryId:null,suggestionId:null,sourceHistoryId:opened.data.historyId,sourceContextHash:opened.data.contextHash};
    }
    const next=mergeContractAttachment(draft,file);Object.assign(opened.draft,next);renderEditor();overlay.querySelector('[data-compose-body]')?.focus();
  }
  async function checkReturnedGmail(){
    const opened=editor;
    if(demo||opened?.kind!=='conversation'||!opened.reviewKey||!opened.draft.saved||opened.draft.sent||opened.saving||opened.loading||document.visibilityState!=='visible')return;
    await reloadConversation();if(editor!==opened||opened.error)return;
    const messages=opened.data?.messages||[],latest=messages.at(-1),incoming=[...messages].reverse().find(m=>m.direction==='inbound');
    if(opened.data?.complete===true&&latest?.direction==='outbound'&&incoming&&Date.parse(latest.at)>Date.parse(incoming.at)){
      await finishConversationReview(opened);notify('Gmail reply confirmed. Moved to the next review card.');
    }
  }
  globalThis.addEventListener?.('focus',()=>{void checkReturnedGmail();});
  document.addEventListener?.('visibilitychange',()=>{if(document.visibilityState==='visible')void checkReturnedGmail();});
  let reviewPointer=null;
  root.addEventListener('pointerdown',event=>{
    const card=event.target.closest('.ops-review-card');
    if(card&&!event.target.closest('button,a,input,select,textarea')&&event.isPrimary)reviewPointer={id:event.pointerId,x:event.clientX,y:event.clientY,campaignId:card.closest('[data-campaign-id]')?.dataset.campaignId};
  });
  root.addEventListener('pointercancel',()=>{reviewPointer=null;});
  root.addEventListener('pointerup',event=>{
    const start=reviewPointer;reviewPointer=null;if(!start||event.pointerId!==start.id)return;
    if(start.campaignId&&event.clientX-start.x < -80&&Math.abs(event.clientY-start.y)<50)void moveReview(start.campaignId);
  });
  const conversationPath=s=>`/api/campaign-ops/${encodeURIComponent(s.campaignId)}/assignments/${encodeURIComponent(s.assignmentId)}/conversation?thread=${encodeURIComponent(s.providerThreadId)}`;
  function captureConversationDraft(){
    if(editor?.kind!=='conversation')return true;
    const composer=overlay.querySelector('[data-composer="replyBody"]');if(!composer)return true;
    try{Object.assign(editor.draft,readEmailComposer(composer));delete editor.draft.composeError;return true;}
    catch(error){editor.draft.composeError=error.message;return false;}
  }
  async function loadWorkspaceOptions(opened) {
    const session=generation;
    try {
      const data=demo?demo.read('campaigns'):unpack(await requestJson('/api/campaign-ops?limit=100'));
      if(session!==generation||editor!==opened||opened.saving||data?.workspaceAvailable!==true)return;
      if(!Array.isArray(data.items))throw new Error('Campaign workspaces unavailable.');
      const choices=data.items.filter(c=>c.canEdit===true).map(c=>({id:c.workspaceId||c.id,name:c.workspaceName||c.name}));
      const currentRoot=opened.campaign.workspaceMembers?.find(m=>m.id===opened.campaign.workspaceId);
      if(currentRoot?.canEdit&&!choices.some(c=>c.id===currentRoot.id))choices.push({id:currentRoot.id,name:opened.campaign.workspaceName||currentRoot.name});
      captureEditor();
      opened.campaign={...opened.campaign,workspaceAvailable:true,workspaceOptions:choices,workspaceOptionsPartial:data.page?.hasMore===true};
      renderEditor();
    }catch{
      // Missing or unavailable options must preserve the current relationship.
      // Campaign operations remain editable while grouping is unavailable.
    }
  }
  async function openEditor(kind,campaignId,assignmentId,value={},options={}) {
    const session=generation,request=++editorRequest;
    focusBefore=document.activeElement;
    if(kind==='campaign'&&!campaignId){
      const opened={kind,campaign:{workspaceAvailable:!!demo||!!value.workspaceParentId},assignment:{},value};editor=opened;renderEditor({focus:true});
      void loadWorkspaceOptions(opened);
      try{const choices=demo?demo.managerChoices():unpack(await requestJson('/api/campaign-managers'));
        if(session!==generation||editor!==opened||opened.saving)return;
        if(!Array.isArray(choices))throw Error('Employee list unavailable.');
        captureEditor();opened.campaign.ownerOptions=choices;renderEditor();
      }catch{/* The disabled Manager field explains how to retry without changing its saved value. */}
      return;
    }
    const entry=await load('campaign',campaignId,{reload:['delete_campaign','finance','finance_intake','shipment'].includes(kind)});
    if(session!==generation||request!==editorRequest)return;
    if(entry?.error||!entry?.data){notify(entry?.error||'Record unavailable.');return;}
    const campaign=entry.data.campaign,assignment=entry.data.assignments.find(a=>a.id===assignmentId)||
      [...(cache.get('finances')?.data?.items||[]),...(cache.get('shipments')?.data?.items||[])].find(a=>a.id===assignmentId&&a.campaignId===campaignId)||{};
    if(!['campaign','automation','delete_campaign'].includes(kind)&&!assignment.id){notify('This assignment is not loaded. Load its campaign roster first.');return;}
    if(kind==='delete_campaign'&&(campaign.id!==campaignId||campaign.canEdit!==true||!Number.isSafeInteger(campaign.revision))){notify('This campaign cannot be deleted with your current access.');return;}
    if(kind==='remove_creator'&&(campaign.id!==campaignId||assignment.campaignId!==campaignId||assignment.id!==assignmentId||campaign.canEdit!==true||assignment.canEdit!==true||!Number.isSafeInteger(assignment.revision))){notify('This creator cannot be removed with your current access.');return;}
    const automation=entry.data.automation;
    if(kind==='automation'&&(campaign.canEdit!==true||automation?.canEdit!==true||!Number.isSafeInteger(automation.revision)||automation.revision<0)){notify('Automation settings are unavailable or your access does not permit editing.');return;}
    const opened={kind,campaign,assignment,value,error:null,saving:false,...options,...(kind==='automation'?{automation,assignments:entry.data.assignments,hasMore:entry.data.page?.hasMore===true}:{})};
    if(kind==='finance_intake'){opened.loading=true;opened.value={amount:assignment.finance?.amount??null,currency:assignment.finance?.currency||assignment.feeCurrency||'USD',liveDate:assignment.finance?.liveDate||'',dueDate:assignment.finance?.dueDate||''};}
    editor=opened;renderEditor({focus:true});
    if(kind==='campaign')void loadWorkspaceOptions(opened);
    if(kind==='finance_intake'){
      try{
        const review=demo?{contractState:'missing',postDateState:'missing'}:unpack(await requestJson(`/api/campaign-ops/${encodeURIComponent(campaignId)}/assignments/${encodeURIComponent(assignmentId)}/finance-intake`));
        if(session!==generation||editor!==opened||opened.saving||opened.attempt)return;
        if(!demo&&(review.campaignId!==campaignId||review.assignmentId!==assignmentId||review.revision!==assignment.revision))throw new Error('This creator changed while loading. Close and reopen the review.');
        opened.review=review;
        const f=assignment.finance||{};
        opened.value={...opened.value,amount:f.amount??review.compensation?.amount??null,currency:f.amount!=null?f.currency||'USD':review.compensation?.currency||opened.value.currency,
          liveDate:f.liveDate||review.liveDate||'',dueDate:f.dueDate||net30Date(f.liveDate||review.liveDate)||''};
      }catch(error){if(session===generation&&editor===opened&&!opened.attempt)opened.error=error.message;}
      finally{if(session===generation&&editor===opened){opened.loading=false;renderEditor();}}
      return;
    }
    if(['finance','assignment'].includes(kind)&&assignment.canFinance&&!demo){
      try{const results=await Promise.allSettled([
          requestJson(`/api/creators/${encodeURIComponent(assignment.creatorId)}/restricted-documents`),
          requestJson(`/api/campaign-files?campaignId=${encodeURIComponent(campaignId)}&assignmentId=${encodeURIComponent(assignmentId)}`)
        ]);
        if(session!==generation||editor!==opened)return;
        const documents=results.flatMap(result=>result.status==='fulfilled'&&Array.isArray(unpack(result.value))?unpack(result.value):[]);
        if(!opened.saving)captureEditor();opened.assignment={...opened.assignment,documents:[...new Map([...documents,...(opened.assignment.documents||[])].map(d=>[d.id,d])).values()],documentsError:results.some(r=>r.status==='rejected')?'Some protected documents could not be loaded. Existing references have been preserved.':null};renderEditor();
      }catch{if(session===generation&&editor===opened){if(!opened.saving)captureEditor();opened.assignment={...opened.assignment,documentsError:'Protected documents are unavailable. Existing references have been preserved.'};renderEditor();}}
    }
  }
  async function save(campaignId,command) {
    const session=generation;
    const response=demo?demo.command(campaignId,command):unpack(await requestJson(`/api/campaign-ops${campaignId?'/'+encodeURIComponent(campaignId):''}`,{method:'POST',csrf:true,body:command}));
    const id=response?.campaign?.id||response?.campaignId||campaignId;
    if(session!==generation)return null;
    if(command.action==='delete_campaign'&&(response?.deleted!==true||response?.campaignId!==campaignId))throw new Error('Campaign deletion has not been confirmed. Retry the same request.');
    if(command.action==='remove_creator'&&(response?.removed!==true||response?.campaignId!==campaignId||response?.assignmentId!==command.assignmentId))throw new Error('Creator removal has not been confirmed. Retry the same request.');
    invalidateOperations(id);
    if(command.action==='campaign')for(const k of cache.keys())if(k.startsWith('campaign:'))cache.delete(k);
    return id;
  }
  function invalidateOperations(id) {
    for(const view of ['campaigns','automation-campaigns','finances','shipments'])cache.delete(view);
    if(id)cache.delete(key('campaign',id));
    if(outreach?.campaignId===id)outreach=null;
  }
  function closeShipmentCell(control,{focus=false}={}) {
    const state=shipmentCells.get(control);if(!state)return;
    state.closed=true;
    const cell=control.closest('td');
    cell?.querySelectorAll('[data-shipment-feedback]').forEach(el=>el.remove());
    (control.closest('.m3-date-shell')||control).replaceWith(state.button);
    if(activeShipmentCell===control)activeShipmentCell=null;
    if(focus)state.button.focus({preventScroll:true});
  }
  function finishShipmentCell(control) {
    const state=shipmentCells.get(control);
    if(!state||state.closed||!control.isConnected)return Promise.resolve(true);
    if(state.pending)return state.pending;
    if(state.failed)return Promise.resolve(false);
    if(control.value===state.initialValue){closeShipmentCell(control);return Promise.resolve(true);}
    return saveInlineShipment(control);
  }
  function saveInlineShipment(control,{retry=false}={}) {
    const state=shipmentCells.get(control);if(!state)return Promise.resolve(false);
    if(state.pending)return state.pending;
    state.pending=persistInlineShipment(control,state,{retry}).finally(()=>{state.pending=null;});
    return state.pending;
  }
  async function persistInlineShipment(control,state,{retry=false}={}) {
    const session=generation;
    const row=control.closest('tr');
    const campaignId=row?.dataset.campaignId,assignmentId=row?.dataset.assignmentId;
    const assignment=cache.get('shipments')?.data?.items?.find(a=>a.id===assignmentId&&a.campaignId===campaignId);
    if(!assignment||assignment.canShip!==true){notify('Shipment could not be edited.');return false;}
    const key=campaignId+':'+assignmentId;
    let attempt=shipmentAttempts.get(key);
    try{
      let command;
      if(retry){if(!attempt)throw new Error('There is no shipment update to retry.');command=attempt.command;}
      else{
        const fields=new FormData();fields.set('kind','shipment');fields.set('assignmentId',assignmentId);fields.set('expectedRevision',String(assignment.revision));
        for(const [field,value] of Object.entries(shipmentDraftDefaults(assignment)))fields.set(field,String(value??''));
        fields.set(control.dataset.shipmentKey,control.value);
        command=readCampaignOperationForm(fields);
        const fingerprint=JSON.stringify({campaignId,command});
        if(attempt&&attempt.fingerprint!==fingerprint)throw new Error('A previous shipment save is still pending.');
        if(!attempt){attempt={fingerprint,command:{...command,idempotencyKey:crypto.randomUUID()},saving:false};shipmentAttempts.set(key,attempt);}
        command=attempt.command;
      }
      if(attempt?.saving)return false;
      state.failed=false;
      attempt.saving=true;control.disabled=true;
      control.closest('td')?.querySelectorAll('[data-shipment-feedback]').forEach(el=>el.remove());
      await save(campaignId,command);
      if(generation!==session)return false;
      shipmentAttempts.delete(key);
      if(activeShipmentCell===control)activeShipmentCell=null;
      await load('shipments',null,{reload:true});
      if(mode==='demo')notify('Shipment updated in the sample workspace.');
      return true;
    }catch(error){
      if(generation!==session)return false;
      const rejected=[400,401,403,404,409,413,422].includes(error.status);
      if(attempt){attempt.saving=false;attempt.uncertain=!rejected;}
      if(rejected)shipmentAttempts.delete(key);
      const uncertain=!!attempt&&!rejected;
      state.failed=true;state.requiresReload=rejected&&error.status!==400&&error.status!==422;
      control.disabled=uncertain;
      const cell=control?.closest('td');
      cell?.querySelectorAll('[data-shipment-feedback]').forEach(el=>el.remove());
      const feedback=document.createElement('span');feedback.dataset.shipmentFeedback='true';
      const message=document.createElement('span');message.className='ops-shipment-cell-error';message.setAttribute('role','alert');
      message.textContent=uncertain?'Save not confirmed.':error.status===409?'Record changed. Reload to continue.':error.message||'Shipment could not be saved.';feedback.append(message);
      for(const actionName of uncertain?['retry-shipment-cell','reload-shipments']:state.requiresReload?['reload-shipments']:[]){
        const action=document.createElement('button');action.type='button';action.className='text-button';action.dataset.opsAction=actionName;
        action.dataset.campaignId=campaignId;action.dataset.assignmentId=assignmentId;action.textContent=actionName==='retry-shipment-cell'?'Retry':'Reload';
        action.setAttribute('aria-label',actionName==='retry-shipment-cell'?'Retry shipment save':'Reload shipments');feedback.append(action);
      }
      cell?.append(feedback);
      return false;
    }
  }
  function shipmentImportKey(row){return String(row.sheet||'')+':'+String(row.sourceRow);}
  function refreshShipmentImportPlan({clearSelections=false}={}) {
    const state=ui.shipments.import;if(!state?.selectedSheet)return;
    const previous=new Map((state.previewRows||[]).map(row=>[shipmentImportKey(row),row]));
    const raw=state.rawRowsBySheet?.[state.selectedSheet]||[];
    const mapped=mapShipmentWorkbookRows(raw,state.headerMap||{}).map(row=>{
      const prior=previous.get(shipmentImportKey(row));
      return {...row,key:shipmentImportKey(row),...(prior&&!clearSelections?{selectedAssignmentId:prior.assignmentId||prior.selectedAssignmentId,decisions:prior.decisions,reviewedWarnings:prior.reviewedWarnings,skip:prior.skip,useDuplicate:prior.useDuplicate}:{})};
    });
    state.previewRows=planShipmentImport(mapped,ui.shipments.assignmentChoices||[]);
    const selected=state.previewRows.filter(row=>!row.skip&&row.status!=='duplicate');
    state.selectedCount=selected.length;
    state.canConfirm=selected.length>0&&selected.every(row=>row.status==='ready'&&(!row.warnings?.length||row.reviewedWarnings===true));
  }
  async function loadShipmentAssignments({reload=false}={}) {
    const state=ui.shipments,session=generation;
    if(state.assignmentChoices&&!reload)return state.assignmentChoices;
    if(state.assignmentChoicesLoading)return null;
    state.assignmentChoicesLoading=true;state.assignmentChoicesError=null;rerender();
    try{
      let assignments=[];
      if(demo){
        const directory=demo.read('campaigns',null,{});
        for(const campaign of directory.items||[]){
          const detail=demo.read('campaign',campaign.id);
          assignments.push(...(detail.assignments||[]).map(item=>({...item,campaignName:campaign.name,brand:campaign.brand,productName:campaign.productName})));
        }
      }else{
        const campaigns=[];let cursor='0',pages=0;
        do{
          const data=unpack(await requestJson('/api/campaign-ops?limit=100&cursor='+encodeURIComponent(cursor)));
          if(!data||!Array.isArray(data.items)||!data.page)throw new Error('Campaign assignments could not be loaded.');
          campaigns.push(...data.items);pages++;cursor=data.page.nextCursor||'';
          if(pages>100||campaigns.length>10000)throw new Error('The campaign directory is too large to load for shipment entry.');
          if(!data.page.hasMore)break;
          if(!cursor)throw new Error('The campaign directory returned an invalid page.');
        }while(true);
        for(const campaign of campaigns){
          let pageCursor='0',pagesForCampaign=0;
          do{
            const data=unpack(await requestJson('/api/campaign-ops/'+encodeURIComponent(campaign.id)+'?limit=100&cursor='+encodeURIComponent(pageCursor)));
            if(data?.campaign?.id!==campaign.id||!Array.isArray(data.assignments)||!data.page)throw new Error('A campaign assignment page could not be verified.');
            assignments.push(...data.assignments.map(item=>({...item,campaignName:campaign.name,brand:campaign.brand,productName:campaign.productName})));
            pagesForCampaign++;pageCursor=data.page.nextCursor||'';
            if(pagesForCampaign>10000||assignments.length>100000)throw new Error('There are too many campaign assignments to load for shipment entry.');
            if(!data.page.hasMore||data.assignments.length<100)break;
            if(!pageCursor)throw new Error('A campaign assignment page cursor is invalid.');
          }while(true);
        }
      }
      if(generation!==session)return null;
      state.assignmentChoices=assignments.filter(item=>item.canShip===true);
      state.assignmentChoicesLoading=false;
      if(state.import?.selectedSheet)refreshShipmentImportPlan();
      rerender();return state.assignmentChoices;
    }catch(error){
      if(generation===session){state.assignmentChoicesLoading=false;state.assignmentChoicesError=error.message||'Campaign assignments are unavailable.';rerender();}
      return null;
    }
  }
  async function readFreshShipmentAssignment(campaignId,assignmentId) {
    if(demo){
      const data=demo.read('campaign',campaignId),assignment=data.assignments.find(item=>item.id===assignmentId);
      return assignment?{...assignment,campaignName:data.campaign.name,brand:data.campaign.brand,productName:data.campaign.productName}:null;
    }
    let cursor='0',pages=0;
    do{
      const data=unpack(await requestJson('/api/campaign-ops/'+encodeURIComponent(campaignId)+'?limit=100&cursor='+encodeURIComponent(cursor)));
      if(data?.campaign?.id!==campaignId||!Array.isArray(data.assignments)||!data.page)throw new Error('The campaign assignment could not be refreshed.');
      const assignment=data.assignments.find(item=>item.id===assignmentId);
      if(assignment)return {...assignment,campaignName:data.campaign.name,brand:data.campaign.brand,productName:data.campaign.productName};
      pages++;if(pages>10000||!data.page.hasMore||data.assignments.length<100)break;
      cursor=data.page.nextCursor||'';if(!cursor)break;
    }while(true);
    return null;
  }
  function replaceShipmentChoice(assignment) {
    if(!assignment)return;
    const index=ui.shipments.assignmentChoices?.findIndex(item=>item.id===assignment.id)??-1;
    if(index>=0)ui.shipments.assignmentChoices[index]=assignment;
    else if(assignment.canShip===true)(ui.shipments.assignmentChoices??=[]).push(assignment);
  }
  async function handleShipmentWorkbook(file) {
    const session=generation,state=ui.shipments;
    if(state.import?.busy)return;
    state.import={open:true,busy:true,fileName:file?.name||'',progress:'Reading workbook in this browser…',error:null,previewRows:[],outcomes:[],canConfirm:false};rerender();
    try{
      const workbook=await readShipmentWorkbook(file);
      if(generation!==session||state.import?.fileName!==file.name)return;
      const selectedSheet=workbook.sheets[0];
      Object.assign(state.import,{...workbook,selectedSheet,headers:workbook.headersBySheet[selectedSheet],headerMap:{...workbook.headerMapsBySheet[selectedSheet]},busy:false,progress:'',batchId:crypto.randomUUID()});
      refreshShipmentImportPlan();rerender();
    }catch(error){
      if(generation===session){state.import={...(state.import||{}),open:true,busy:false,progress:'',error:error.message||'This workbook could not be read.'};rerender();}
    }
  }
  function shipmentDraftDefaults(assignment) {
    const shipment=assignment.shipment||{};
    return {fullName:shipment.fullName||'',address:addressText(shipment.address),productName:shipment.productName||assignment.productName||'',brand:shipment.brand||assignment.brand||'',boxSize:shipment.boxSize||'',shippingCost:shipment.shippingCost??'',trackingOriginal:shipment.trackingOriginal||'',trackingNumber:shipment.trackingNumber||'',packingDate:shipment.packingDate||'',notes:shipment.notes||'',shipmentType:shipment.shipmentType||(['paid','seeding'].includes(assignment.engagementType)?assignment.engagementType:''),pic:shipment.pic||''};
  }
  function captureShipmentDraft() {
    const row=root.querySelector('[data-shipment-draft]'),draft=ui.shipments.draft;if(!row||!draft)return;
    for(const field of row.querySelectorAll('[data-shipment-key]'))draft.values[field.dataset.shipmentKey]=field.value;
  }
  async function saveShipmentDraft() {
    const session=generation,draft=ui.shipments.draft;if(!draft||draft.saving)return;
    captureShipmentDraft();
    const assignment=ui.shipments.assignmentChoices?.find(item=>item.id===draft.assignmentId);
    if(!assignment||assignment.canShip!==true){draft.error='Choose an existing campaign and creator link that you can ship for.';rerender();return;}
    try{
      const current=await readFreshShipmentAssignment(assignment.campaignId,assignment.id);
      if(generation!==session||ui.shipments.draft!==draft)return;
      if(!current||current.canShip!==true||current.id!==assignment.id||current.campaignId!==assignment.campaignId)throw new Error('This campaign assignment is no longer available for shipping.');
      const attemptKey=current.campaignId+':'+current.id;let attempt=shipmentAttempts.get(attemptKey);
      if(!attempt&&current.revision!==assignment.revision){
        const latestValues=shipmentDraftDefaults(current),initial=draft.initialValues||{},edits={};
        for(const [field,value] of Object.entries(draft.values||{}))if(String(value??'')!==String(initial[field]??''))edits[field]=value;
        replaceShipmentChoice(current);draft.values={...latestValues,...edits};draft.initialValues=latestValues;draft.error='This assignment changed while you were editing. Review the latest CRM values before saving.';rerender();return;
      }
      const fields=new FormData();fields.set('kind','shipment');fields.set('assignmentId',current.id);fields.set('expectedRevision',String(current.revision));
      const values={...shipmentDraftDefaults(current),...draft.values};
      for(const [key,value] of Object.entries(values))fields.set(key,String(value??''));
      const command=readCampaignOperationForm(fields),fingerprint=JSON.stringify({campaignId:current.campaignId,data:command.data});
      if(attempt&&attempt.fingerprint!==fingerprint)throw new Error('The previous shipment save is not confirmed. Retry those exact values or reload the row.');
      if(attempt&&current.revision!==attempt.command.expectedRevision&&current.revision!==attempt.command.expectedRevision+1)throw new Error('This assignment changed after the previous save. Reload and review before saving again.');
      if(!attempt){attempt={fingerprint,command:{...command,idempotencyKey:crypto.randomUUID()},saving:false};shipmentAttempts.set(attemptKey,attempt);}
      if(attempt.saving)return;
      draft.saving=true;draft.error=null;rerender();
      await save(current.campaignId,attempt.command);
      if(generation!==session)return;
      shipmentAttempts.delete(attemptKey);ui.shipments.draft=null;
      await load('shipments',null,{reload:true});if(generation!==session)return;
      notify(demo?'Shipment added in the sample workspace.':'Shipment added.');
    }catch(error){
      if(generation!==session||ui.shipments.draft!==draft)return;
      draft.saving=false;draft.error=error.message||'The shipment could not be saved.';rerender();
    }
  }
  async function processShipmentImportRow(rowKey,{retry=false}={}) {
    const state=ui.shipments.import;if(!state)return {ok:false};
    const row=state.previewRows.find(item=>item.key===rowKey||shipmentImportKey(item)===rowKey);
    if(!row||row.skip||row.status!=='ready'||row.warnings?.length&&!row.reviewedWarnings)return {ok:false,error:'Review this row before importing.'};
    const snapshot=ui.shipments.assignmentChoices?.find(item=>item.id===row.assignmentId);
    if(!snapshot) return {ok:false,error:'The selected CRM assignment is unavailable.'};
    const attemptId=String(state.batchId||'')+':'+rowKey;
    let attempt=shipmentImportAttempts.get(attemptId);
    if(attempt&&!retry)return {ok:false,error:'Retry this row to reuse its original save key.',retry:true};
    const current=await readFreshShipmentAssignment(snapshot.campaignId,snapshot.id);
    if(!current||current.id!==snapshot.id||current.campaignId!==snapshot.campaignId||current.canShip!==true)return {ok:false,error:'The selected assignment is no longer available for shipping.'};
    if(attempt){
      if(current.revision<attempt.command.expectedRevision||current.revision>attempt.command.expectedRevision+1)return {ok:false,error:'The CRM record changed after the uncertain save. Reload and review before retrying.'};
    }else if(current.revision!==snapshot.revision){
      replaceShipmentChoice(current);row.decisions={};row.selectedAssignmentId=current.id;row.reviewedWarnings=false;refreshShipmentImportPlan();
      return {ok:false,needsReview:true,error:'The CRM record changed since preview. Review the latest values and confirm again.'};
    }else{
      const idempotencyKey=crypto.randomUUID(),command=buildShipmentImportCommand(current,row,idempotencyKey);
      if(!command)return {ok:true,noChange:true};
      attempt={command,createdAt:Date.now()};shipmentImportAttempts.set(attemptId,attempt);
    }
    const result=await save(current.campaignId,attempt.command);
    if(result!==current.campaignId)throw new Error('The shipment save response could not be verified. Retry this row with the same key.');
    shipmentImportAttempts.delete(attemptId);replaceShipmentChoice({...current,revision:attempt.command.expectedRevision+1,shipment:{...(current.shipment||{}),...attempt.command.data}});
    row.skip=true;
    return {ok:true};
  }
  async function confirmShipmentImport({retryKey=null}={}) {
    const state=ui.shipments.import;if(!state||state.busy)return;
    const rows=retryKey?[state.previewRows.find(item=>item.key===retryKey)]:state.previewRows.filter(item=>!item.skip&&item.status==='ready'&&(!item.warnings?.length||item.reviewedWarnings));
    const selected=rows.filter(Boolean);if(!selected.length)return;
    if(!retryKey&&!state.canConfirm)return;
    const session=generation;state.busy=true;state.progress=retryKey?'Retrying selected row…':'Importing reviewed rows…';state.outcomes=state.outcomes||[];rerender();
    try{
      let completed=0;
      for(const row of selected){
        if(generation!==session||ui.shipments.import!==state)return;
        state.progress='Importing row '+row.sourceRow+' ('+(completed+1)+' of '+selected.length+')…';rerender();
        try{
          const result=await processShipmentImportRow(row.key,{retry:!!retryKey});
          state.outcomes=state.outcomes.filter(item=>item.key!==row.key);
          state.outcomes.push({key:row.key,sourceRow:row.sourceRow,message:result.noChange?'No changes needed.':result.ok?'Imported.':result.error||'Needs review.',retry:result.retry===true,status:result.ok?'imported':result.needsReview?'review':'failed'});
          if(result.needsReview)break;
        }catch(error){
          const attempt=shipmentImportAttempts.get(String(state.batchId||'')+':'+row.key);
          if([400,401,403,404,409,413,422].includes(error.status))shipmentImportAttempts.delete(String(state.batchId||'')+':'+row.key);
          state.outcomes=state.outcomes.filter(item=>item.key!==row.key);
          state.outcomes.push({key:row.key,sourceRow:row.sourceRow,message:error.message||'Could not confirm this row.',retry:!!attempt&&![400,401,403,404,409,413,422].includes(error.status),status:'failed'});
        }
        completed++;
      }
      const completedKeys=new Set(state.outcomes.map(item=>item.key));
      for(const row of state.previewRows){
        if(completedKeys.has(row.key))continue;
        if(row.skip)state.outcomes.push({key:row.key,sourceRow:row.sourceRow,message:row.status==='duplicate'?'Duplicate row skipped.':'Skipped by user.',retry:false,status:'skipped'});
        else if(row.status!=='ready')state.outcomes.push({key:row.key,sourceRow:row.sourceRow,message:row.status==='needs-match'?'Needs a CRM assignment.':row.status==='conflict'?'Conflicting CRM values need a decision.':'Review or correct this row before importing.',retry:false,status:'review'});
      }
      refreshShipmentImportPlan();
      await load('shipments',null,{reload:true});
    }finally{
      if(generation===session&&ui.shipments.import===state){state.busy=false;state.progress='';rerender();}
    }
  }
  async function readInlinePhase(campaignId,assignmentId,creatorId,session){
    const a=demo?demo.read('campaign',campaignId).assignments.find(a=>a.id===assignmentId):null;
    const saved=demo?{...a,assignmentId:a?.id}:unpack(await requestJson(`/api/campaign-ops/${encodeURIComponent(campaignId)}/assignments/${encodeURIComponent(assignmentId)}/phase`));
    if(session!==generation)return null;
    if(saved?.campaignId!==campaignId||saved?.assignmentId!==assignmentId||saved?.creatorId!==creatorId||!Number.isSafeInteger(saved.revision)||saved.revision<0||!(saved.phase===null||Number.isInteger(saved.phase)&&saved.phase>=1&&saved.phase<=5)||typeof saved.canEdit!=='boolean'||!(saved.phaseReason==null||typeof saved.phaseReason==='string'&&saved.phaseReason.length<=2000))throw new Error('The saved phase could not be verified. Retry the same request.');
    const entry=cache.get(key('campaign',campaignId)),current=entry?.data?.assignments.find(a=>a.id===assignmentId&&a.creatorId===creatorId&&a.campaignId===campaignId);
    if(current){
      if(current.revision>saved.revision)return current;
      entry.data.assignments=entry.data.assignments.map(a=>a.id===assignmentId?{...a,phase:saved.phase,phaseReason:saved.phaseReason,revision:saved.revision,canEdit:saved.canEdit}:a);
    }
    return saved;
  }
  async function reloadInlinePhase(campaignId,assignmentId){
    const session=generation,a=cache.get(key('campaign',campaignId))?.data?.assignments.find(a=>a.id===assignmentId),attemptKey=`${campaignId}:${assignmentId}`,attempt=phaseAttempts.get(attemptKey);
    if(!a||attempt?.saving)return;
    try{
      const saved=await readInlinePhase(campaignId,assignmentId,a.creatorId,session);if(!saved)return;
      if(attempt&&saved.revision<=attempt.command.expectedRevision){notify('The previous phase save is still unconfirmed. Retry the same phase.');return;}
      phaseAttempts.delete(attemptKey);delete rosterUI(campaignId).phaseSaves[assignmentId];notify('Current saved phase reloaded.');
    }catch(error){if(session===generation)notify(error.message||'The saved phase could not be reloaded.');}
    finally{if(session===generation)rerender();}
  }
  async function setInlinePhase(campaignId,assignmentId,phase) {
    const session=generation,roster=rosterUI(campaignId),attemptKey=`${campaignId}:${assignmentId}`;
    let attempt=phaseAttempts.get(attemptKey);
    if(attempt?.saving)return;
    const current=cache.get(key('campaign',campaignId))?.data;
    const assignment=current?.assignments?.find(a=>a.id===assignmentId);
    if(!current?.campaign||current.campaign.id!==campaignId||!assignment?.creatorId||assignment.campaignId!==campaignId||assignment.canEdit!==true||!Number.isSafeInteger(assignment.revision)||assignment.revision<0||!Number.isInteger(phase)||phase<1||phase>5){notify('Reload this creator and check your edit access before changing the phase.');rerender();return;}
    if(attempt&&attempt.command.data.phase!==phase){notify('The previous phase save is unconfirmed. Retry that phase or reload before making another change.');rerender();return;}
    if(!attempt&&assignment.phase===phase)return;
    if(!attempt){
      const command={action:'phase',assignmentId,expectedRevision:assignment.revision,idempotencyKey:crypto.randomUUID(),data:{phase,approved:true,phaseReason:assignment.phaseReason||`Phase ${phase} selected by a campaign manager from the campaign roster.`}};
      attempt={command,saving:false,confirmed:false};phaseAttempts.set(attemptKey,attempt);
    }
    attempt.saving=true;roster.phaseSaves[assignmentId]={saving:true,phase,error:null};rerender();
    try{
      if(!attempt.preflight){
        const fresh=await readInlinePhase(campaignId,assignmentId,assignment.creatorId,session);if(!fresh)return;
        if(fresh.canEdit!==true)throw Object.assign(new Error('Your current role cannot change this phase.'),{status:403});
        if(fresh.revision!==attempt.command.expectedRevision)throw Object.assign(new Error('This creator changed. Reload and review the current phase before saving.'),{status:409});
        attempt.preflight=true;
      }
      if(!attempt.confirmed){
        attempt.writeStarted=true;
        const result=demo?demo.command(campaignId,attempt.command):unpack(await requestJson(`/api/campaign-ops/${encodeURIComponent(campaignId)}`,{method:'POST',csrf:true,body:attempt.command}));
        const demoAssignment=demo?result.assignments?.find(a=>a.id===assignmentId):null;
        const receipt=demo?{campaignId:result.campaign?.id,assignmentId:demoAssignment?.id,revision:demoAssignment?.revision}:result;
        if(session!==generation)return;
        if(receipt?.campaignId!==campaignId||receipt?.assignmentId!==assignmentId||receipt?.revision!==attempt.command.expectedRevision+1)throw new Error('The phase save is unconfirmed. Retry the same phase.');
        attempt.confirmed=true;
      }
      const saved=await readInlinePhase(campaignId,assignmentId,assignment.creatorId,session);
      if(session!==generation)return;
      if(!saved||saved.revision<attempt.command.expectedRevision+1||saved.phase!==phase&&saved.revision===attempt.command.expectedRevision+1)throw new Error('The saved phase could not be verified. Retry the same phase.');
      for(const view of ['campaigns','automation-campaigns','finances','shipments'])cache.delete(view);
      if(outreach?.campaignId===campaignId)outreach=null;
      phaseAttempts.delete(attemptKey);delete roster.phaseSaves[assignmentId];notify(saved.phase===phase?`Phase ${phase} saved.`:'The phase has changed since this save. Review the current saved phase.');
    }catch(error){
      if(session!==generation)return;
      if(!attempt.writeStarted||[400,401,403,404,409,413,422].includes(error.status)){phaseAttempts.delete(attemptKey);}
      roster.phaseSaves[assignmentId]={saving:false,phase,error:error.message,canRetry:phaseAttempts.has(attemptKey)};
      notify(error.message||'The phase save could not be confirmed.');
    }finally{if(session===generation){attempt.saving=false;rerender();}}
  }
  async function attachAssignmentDocument(opened,session) {
    const pending=opened.pendingDocument;
    const receipt=unpack(await requestJson(`/api/campaign-ops/${encodeURIComponent(opened.campaign.id)}`,{method:'POST',csrf:true,body:pending.command}));
    if(editor!==opened||generation!==session)return;
    if(receipt?.campaignId!==opened.campaign.id||receipt?.assignmentId!==opened.assignment.id||receipt?.revision!==pending.command.expectedRevision+1)throw new Error('Document attachment is not confirmed. Retry the same attachment.');
    opened.assignment={...opened.assignment,revision:receipt.revision,finance:{...opened.assignment.finance,...pending.command.data,referred:true},documents:[...(opened.assignment.documents||[]).filter(d=>d.id!==pending.document.id),pending.document]};
    opened.pendingDocument=null;
    invalidateOperations(opened.campaign.id);
    notify('Document saved to this assignment and Finances. Pending review.');
  }
  function fillShipmentFields(fields,opened) {
    if(opened.kind!=='shipment')return;
    const saved={...opened.assignment.shipment,...opened.value};
    const keys=opened.shipmentStep==='notes'?['fullName','address','productName','brand','boxSize','shippingCost','trackingOriginal','trackingNumber','packingDate']:['notes'];
    for(const key of keys)fields.set(key,key==='address'?addressText(saved[key]):saved[key]??'');
  }
  function captureEditor() {
    const form=overlay.querySelector('[data-ops-form]');
    if(editor?.kind==='finance_intake')return;
    if(!form||!editor||['choose-campaign','finance_payment','finance_undo','finance_expenses','conversation'].includes(editor.kind)||editor?.kind==='finance'&&editor.assignment.finance?.status==='paid')return;
    const fields=new FormData(form);fields.set('kind',form.dataset.opsForm);fillShipmentFields(fields,editor);
    captureTemplate(fields);
    const command=readCampaignOperationForm(fields);
    editor.value={...command.data,activeTemplate:fields.get('activeTemplate'),...(editor.kind==='phase'?{managerApproved:fields.has('managerApproved')}:{})};
    if(editor.kind==='campaign')editor.value.resources=fields.getAll('resourceName').map((name,i)=>({id:fields.getAll('resourceId')[i]||'',name,kind:fields.getAll('resourceKind')[i],url:fields.getAll('resourceUrl')[i],...(fields.getAll('resourceFileId')[i]?{fileId:fields.getAll('resourceFileId')[i]}:{})}));
    return {fields,command};
  }
  function captureTemplate(fields) {
    const composer=overlay.querySelector('[data-composer="templateBody"]');
    if(!composer||!fields.has('templatesJSON'))return;
    const templates=JSON.parse(fields.get('templatesJSON')||'{}');
    const fallbacks=Object.fromEntries([...overlay.querySelectorAll('[data-template-fallback]')].map(input=>[input.dataset.templateFallback,input.value]));
    const content=readEmailComposer(composer);
    for(const block of content.document.blocks)for(const run of block.runs||[])run.text=saveTemplateFallbacks(run.text,fallbacks);
    content.body=documentText(content.document);
    templates[fields.get('activeTemplate')]={subject:saveTemplateFallbacks(String(fields.get('templateSubject')||'').trim(),fallbacks),...content};
    fields.set('templatesJSON',JSON.stringify(templates));
  }
  function stableCommand(opened,campaignId,command) {
    const fingerprint=JSON.stringify({campaignId,command});
    if(opened.attempt?.uncertain&&opened.attempt.fingerprint!==fingerprint)throw new Error('The previous save is not confirmed. Retry the same values, or reload the saved records before making another change.');
    if(opened.attempt?.fingerprint!==fingerprint)opened.attempt={fingerprint,key:crypto.randomUUID(),uncertain:false};
    return {...command,idempotencyKey:opened.attempt.key};
  }
  function saveError(opened,error) {
    opened.saving=false;opened.error=error.message;
    if(opened.attempt)opened.attempt.uncertain=![400,401,403,404,409,413,422].includes(error.status);
    renderEditor();
  }
  async function onSubmit(event) {
    const form=event.target.closest('[data-ops-form]');if(!form)return;
    event.preventDefault();
    const fields=new FormData(form),kind=form.dataset.opsForm,session=generation;
    if(kind==='finance-intake'){
      const opened=editor;if(opened?.kind!=='finance_intake'||opened.saving)return;
      const alive=()=>session===generation&&editor===opened;
      const anyway=event.submitter?.name==='sendAnyway';
      const f=opened.assignment.finance||{};
      opened.value={...opened.value,...Object.fromEntries(fields),confirmed:fields.has('confirmed'),missingContractConfirmed:fields.has('missingContractConfirmed')};
      try{
        if(!opened.review?.contract&&!fields.has('missingContractConfirmed'))throw new Error('Confirm that you want to send this creator without a confirmed contract.');
        if(!anyway&&(opened.loading||!fields.has('confirmed')||!fields.get('amount')||!fields.get('liveDate')||!fields.get('dueDate')))throw new Error('Confirm the amount and enter the video posting date and payment due date, or choose Send to finances anyway.');
        fields.set('kind','finance');fields.set('assignmentId',opened.assignment.id);fields.set('expectedRevision',opened.assignment.revision);
        if(opened.loading){fields.set('amount',opened.value.amount??'');fields.set('currency',opened.value.currency||'USD');fields.set('liveDate',opened.value.liveDate||'');fields.set('dueDate',opened.value.dueDate||'');}
        const parsed=readCampaignOperationForm(fields);
        const data={...f,amount:parsed.data.amount,currency:parsed.data.currency,liveDate:parsed.data.liveDate,dueDate:parsed.data.dueDate??null};
        const commandData={amount:data.amount,currency:data.currency,method:f.method||null,liveDate:data.liveDate,dueDate:data.dueDate,urgency:f.urgency||'normal'};
        if(data.liveDate)net30Date(data.liveDate);if(data.dueDate)net30Date(data.dueDate);
        if(opened.assignment.canFinance)for(const type of ['contract','invoice']){
          const doc=opened.review?.[type];if(doc&&!f[type+'DocumentId']){commandData[type+'DocumentId']=doc.id;commandData[type+'Status']='pending';}
        }
        const command=stableCommand(opened,opened.campaign.id,{action:'finance',assignmentId:opened.assignment.id,expectedRevision:opened.assignment.revision,data:commandData});
        opened.saving=true;opened.error=null;renderEditor();
        await save(opened.campaign.id,command);if(!alive())return;
        closeEditor(true);navigate('finances');notify('Creator added to Finances. You can edit payment details there.');
      }catch(error){if(alive())saveError(opened,error);}
      return;
    }
    if(kind==='conversation'){
      const opened=editor;if(opened?.kind!=='conversation'||opened.saving||opened.draft.saving||opened.loading||opened.draft.saved||opened.draft.sent||opened.draft.confirmSend||opened.draft.uncertain)return;
      if(opened.draft.stale||opened.draft.suggestionId&&!opened.draft.reviewed){opened.error='Review the current suggested reply before saving.';renderEditor();return;}
      if(!captureConversationDraft()){opened.error=opened.draft.composeError||'Finish loading the attachments before saving.';renderEditor();return;}
      if(!opened.draft.body.trim()||!opened.data?.canSaveDraft){opened.error='Write a reply and verify Gmail draft access before saving.';renderEditor();return;}
      const payload={body:opened.draft.body,document:opened.draft.document,attachments:opened.draft.attachments||[],historyId:opened.data.historyId,contextHash:opened.data.contextHash,...(opened.data.campaignAnchor?{replyTargetMessageId:opened.data.replyTarget?.messageId}:{})},fingerprint=JSON.stringify(payload);
      if(opened.draft.attempt?.fingerprint!==fingerprint)opened.draft.attempt={fingerprint,requestId:crypto.randomUUID()};
      // Reserve a tab during the click, before the asynchronous save, to avoid popup blocking.
      let gmailTab=null;
      if(!demo)try{gmailTab=globalThis.window?.open('about:blank','_blank');if(gmailTab)gmailTab.opener=null;}catch{}
      opened.saving=true;opened.draft.saving=true;opened.error=null;renderEditor();
      try{
        const result=demo?demoSaveMessage(opened.scope,payload,false):unpack(await requestJson(conversationPath(opened.scope),{method:'POST',csrf:true,body:{operation:'save_draft',input:{...payload,requestId:opened.draft.attempt.requestId,...(opened.draft.suggestionId?{baselineSuggestionId:opened.draft.suggestionId}:{})}}}));
        if(session!==generation){gmailTab?.close();return;}
        if(result?.status!=='saved'||result.sent!==false||!demo&&!result.providerMessageId){opened.draft.uncertain=true;throw Error('Draft save was not confirmed. Check Gmail before saving another copy.');}
        opened.draft.saved=true;
        opened.draft.savedHistoryId=payload.historyId;
        opened.draft.providerMessageId=result.providerMessageId||null;
        const feedback=replyFeedbackCommand({baselineSuggestionId:opened.draft.suggestionId,requestId:opened.draft.attempt.requestId,savedBody:payload.body},result);
        if(!demo&&feedback){
          try{const memory=unpack(await requestJson(conversationPath(opened.scope),{method:'POST',csrf:true,body:{operation:'capture_reply_feedback',input:feedback}}));opened.draft.feedbackStatus=memory?.status==='captured'?'captured':'unavailable';}
          catch{opened.draft.feedbackStatus='unavailable';}
        }
        const href=gmailConversationUrl({...opened.scope,mailboxEmail:opened.data.mailboxEmail,providerMessageId:opened.draft.providerMessageId});
        if(gmailTab&&!gmailTab.closed){if(href)try{gmailTab.location.replace(href);}catch{gmailTab.close();}else gmailTab.close();}
      }catch(e){gmailTab?.close();if(session===generation){opened.error=e.message||'Draft save was not confirmed. Check Gmail.';opened.draft.uncertain=![400,401,403,404,409,413,422].includes(e.status)||/not confirmed/.test(opened.error);}}
      finally{if(session===generation){opened.draft.saving=false;if(editor===opened){opened.saving=false;renderEditor();}else if(editor?.kind==='conversation'&&editor.draft===opened.draft){editor.saving=false;void reloadConversation();}}}
      return;
    }
    if(kind==='finance_payment'){
      await confirmPayment(fields,session);return;
    }
    if(kind==='finance_undo'){
      const opened=editor;if(opened?.kind!=='finance_undo'||opened.saving)return;
      const a=opened.assignment,key=`${a.campaignId}:${a.id}`;
      try{
        if(!fields.has('confirmed'))throw new Error('Confirm the payment record to undo.');
        if(!undoAttempts.has(key))undoAttempts.set(key,{campaignId:a.campaignId,assignmentId:a.id,expectedRevision:a.revision,idempotencyKey:crypto.randomUUID(),confirmed:true});
        const command=undoAttempts.get(key);opened.saving=true;opened.error=null;renderEditor();
        const result=demo?demo.undoPayment(command):unpack(await requestJson('/api/finances/undo-payment',{method:'POST',csrf:true,body:command}));
        if(session!==generation)return;
        if(result?.undone!==true||result.campaignId!==a.campaignId||result.assignmentId!==a.id||result.revision!==command.expectedRevision+1)throw new Error('Undo was not confirmed. Retry to check its result.');
        undoAttempts.delete(key);invalidateOperations(a.campaignId);closeEditor(true);
        await load('finances',null,{reload:true});if(session===generation)notify('Payment returned to Unpaid with its saved due date.');
      }catch(error){if(session===generation&&editor===opened){if([400,401,403,404,409,422].includes(error.status))undoAttempts.delete(key);opened.error=error.message;}}
      finally{if(session===generation&&editor===opened){opened.saving=false;renderEditor();}}
      return;
    }
    if(kind==='finance_expenses'){
      if(editor?.kind!=='finance_expenses')return;
      editor.value={dateFrom:String(fields.get('dateFrom')||''),dateTo:String(fields.get('dateTo')||'')};editor.error=null;editor.downloadUrl=null;
      if(!validFinanceDate(editor.value.dateFrom)||!validFinanceDate(editor.value.dateTo))editor.error='Enter a valid start and end date.';
      else if(editor.value.dateFrom>editor.value.dateTo)editor.error='The end date must be on or after the start date.';
      else editor.downloadUrl='/api/finances/expenses.xlsx?'+new URLSearchParams(editor.value);
      renderEditor();return;
    }
    if(kind==='outreach-selection'){
      const id=fields.get('campaignId'),creatorIds=fields.getAll('creatorIds');
      if(!creatorIds.length){notify('Select at least one creator.');return;}
      const templateKey=fields.get('templateKey')||cache.get(key('campaign',id))?.data?.campaign?.type;
      rosterUI(id).selectedCreatorIds=creatorIds;outreach={campaignId:id,templateKey,loading:true,drafts:[],sendEnabled:false};rerender();
      const prepared=outreach,alive=()=>session===generation&&outreach===prepared;
      try{
        const data=cache.get(key('campaign',id)).data;
        if(demo){
          const template=data.campaign.templates[templateKey];
          prepared.drafts=creatorIds.map((creatorId,index)=>{
            const a=data.assignments.find(item=>item.creatorId===creatorId);
            if(!a||!template?.subject||!template?.body)throw new Error('The selected creator or campaign template is unavailable.');
            const replacements={creatorName:a.creatorDisplayName,campaignName:data.campaign.name,brand:data.campaign.brand,productName:data.campaign.productName};
            const fill=value=>value.replace(/\{\{\s*(\w+)\s*\}\}/g,(match,name)=>replacements[name]??match);
            const content={};
            if(template.document){content.document=structuredClone(template.document);for(const b of content.document.blocks)for(const r of b.runs||[])r.text=fill(r.text);}
            if(template.attachments?.length)content.attachments=structuredClone(template.attachments);
            return {content,id:`sample-draft-${index}`,campaignId:id,assignmentId:a.id,creatorId,creatorDisplayName:a.creatorDisplayName,from:'preview@example.invalid',to:`sample-${index+1}@example.invalid`,subject:fill(template.subject),body:fill(template.body),canSend:false,blockReason:'Sample messages cannot be sent.'};
          });
        }else{
          for(let offset=0;offset<creatorIds.length;offset+=25){
            const response=unpack(await requestJson(`/api/campaign-ops/${encodeURIComponent(id)}/outreach`,{method:'POST',csrf:true,body:{action:'prepare',creatorIds:creatorIds.slice(offset,offset+25),templateKey,expectedRevision:data.campaign.revision,idempotencyKey:crypto.randomUUID()}}));
            if(!alive())return;
            prepared.drafts.push(...(response.drafts||[]));prepared.sendEnabled=response.sendEnabled===true;
          }
        }
      }catch(error){if(alive())prepared.error=(prepared.drafts.length?`${prepared.drafts.length} messages prepared. The remaining selection needs review: `:'')+error.message;}finally{if(alive()){prepared.loading=false;rerender();}}
      return;
    }
    if(!editor||editor.saving)return;
    const opened=editor,alive=()=>session===generation&&editor===opened;
    if(kind==='choose-campaign'){
      const creatorIds=selection().map(c=>c.id),campaignId=String(fields.get('campaignId'));
      opened.saving=true;opened.campaignId=campaignId;renderEditor();
      try{const id=String(fields.get('campaignId'));const record=await load('campaign',id);
        if(!alive())return;
        if(opened.pendingCommand&&opened.pendingCampaignId!==id)throw new Error('Retry the original campaign first to confirm the previous save.');
        const command=opened.pendingCommand||stableCommand(opened,id,{action:'roster_add',expectedRevision:record.data.campaign.revision,data:{creatorIds}});opened.pendingCommand=command;
        opened.pendingCampaignId=id;
        await save(id,command);if(!alive())return;
        const addedIds=new Set(command.data.creatorIds);updateSelection(selection().filter(c=>!addedIds.has(c.id)));closeEditor(true);navigate('campaign',id);notify(demo?'Selected creators added in the sample workspace.':'Selected creators added to the campaign.');
      }catch(error){if(alive()){if([400,401,403,404,409,413,422].includes(error.status))opened.pendingCommand=null;saveError(opened,error);}}
      return;
    }
    let command;
    try{
      if(kind==='finance'&&opened.assignment.finance?.status==='paid')throw new Error('Paid payment facts are read-only.');
      if(opened.pendingDocument)throw new Error('Retry the document attachment before saving assignment changes.');
      fields.set('kind',kind);fillShipmentFields(fields,opened);captureTemplate(fields);command=readCampaignOperationForm(fields);
      if(kind==='finance')for(const field of ['w9DocumentId','invoiceDocumentId','w9Status','invoiceStatus','status','paidOn','paymentReference']){
        if(!fields.has(field))command.data[field]=editor.assignment.finance?.[field]??command.data[field];
      }
      editor.value={...command.data,activeTemplate:fields.get('activeTemplate'),...(kind==='phase'?{managerApproved:fields.has('managerApproved')}:{})};
      if(kind==='shipment'){
        if(opened.kind!=='shipment'||opened.assignment.canShip!==true||String(fields.get('campaignId'))!==opened.campaign.id||command.assignmentId!==opened.assignment.id||command.expectedRevision!==opened.assignment.revision)throw new Error('Reload this exact shipment before saving.');
        if(opened.sendingShipment&&opened.shipmentStep!=='notes'){
          opened.shipmentStep='notes';opened.error=null;renderEditor({focus:true});return;
        }
      }
      if(kind==='delete_campaign'){
        if(opened.kind!=='delete_campaign'||opened.campaign.canEdit!==true||String(fields.get('campaignId'))!==opened.campaign.id||command.expectedRevision!==opened.campaign.revision)throw new Error('Reload this campaign before deleting it.');
        if(command.data.confirmName!==opened.campaign.name||command.data.approved!==true)throw new Error('Type the exact campaign name and confirm permanent deletion.');
      }
      if(kind==='remove_creator'){
        if(opened.kind!=='remove_creator'||opened.campaign.canEdit!==true||opened.assignment.canEdit!==true||String(fields.get('campaignId'))!==opened.campaign.id||command.assignmentId!==opened.assignment.id||opened.assignment.campaignId!==opened.campaign.id||command.expectedRevision!==opened.assignment.revision)throw new Error('Reload this exact campaign creator before removing them.');
        if(command.data.approved!==true)throw new Error('Confirm removal from this campaign.');
      }
      if(kind==='automation'){
        if(opened.kind!=='automation'||opened.campaign.canEdit!==true||opened.automation?.canEdit!==true||String(fields.get('campaignId'))!==opened.campaign.id||command.expectedRevision!==opened.automation.revision)throw new Error('Reload the exact campaign automation settings before saving.');
        if((command.data.emailEnabled||command.data.shipmentsEnabled)&&!command.data.approved)throw new Error('Review and approve the requested checks before saving.');
        if((command.data.emailEnabled||command.data.shipmentsEnabled)&&!command.data.enrolledAssignmentIds.length)throw new Error('Select at least one creator to enroll before requesting checks.');
        if(command.data.emailEnabled&&!(opened.automation.mailboxOptions||[]).some(binding=>binding.id===command.data.mailboxBindingId&&binding.verified===true))throw new Error('Choose an available verified mailbox before requesting email checks.');
      }
      opened.saving=true;opened.error=null;renderEditor();
      if(kind==='campaign'&&!demo){
        for(const template of Object.values(command.data.templates||{})){
          for(let i=0;i<(template.attachments||[]).length;i++){
            const file=template.attachments[i];if(file.fileId)continue;
            const saved=await uploadFile(file,fields.get('campaignId')||null);
            if(!alive())return;template.attachments[i]={fileId:saved.fileId,name:saved.name,type:saved.type,size:saved.size,...(file.contentId?{contentId:file.contentId}:{})};
          }
        }
        opened.value.templates=command.data.templates;
      }
      command=stableCommand(opened,String(fields.get('campaignId')||'')||null,command);
      const id=await save(String(fields.get('campaignId')||'')||null,command);
      if(kind==='delete_campaign'){
        if(!alive())return;
        if(ui.automations.campaignId===id)ui.automations.campaignId='';
        ui.rosters.delete(id);closeEditor(true);navigate('campaigns');
        notify(demo?'Campaign deleted from the sample workspace.':'Campaign deleted. Creator profiles remain in Creators.');return;
      }
      if(kind==='remove_creator'){
        if(!alive())return;
        const roster=rosterUI(id);if(roster.selectedAssignmentId===command.assignmentId)roster.selectedAssignmentId=null;
        roster.selectedCreatorIds=roster.selectedCreatorIds.filter(creatorId=>creatorId!==opened.assignment.creatorId);
        closeEditor(true);await load('campaign',id,{reload:true});if(session!==generation)return;
        navigate('campaign',id);notify(demo?'Creator removed from this sample campaign.':'Creator removed from this campaign. Their profile remains in Creators.');return;
      }
      if(!alive())return;closeEditor(true);await load('campaign',id,{reload:true});if(session!==generation)return;
      if(kind==='campaign')navigate('campaign',id);else rerender();
      notify(demo?'Saved in the sample workspace.':'Changes saved.');
    }catch(error){if(alive())saveError(opened,error);}
  }
  async function batchRequest(command){
    return demo?demo.batchCommand(command):unpack(await requestJson('/api/finances/batch',{method:'POST',csrf:true,body:command}));
  }
  async function confirmPayment(fields,session){
    const opened=editor;if(opened?.kind!=='finance_payment'||opened.saving)return;
    const assignment=opened.assignment,attemptKey=`${assignment.campaignId}:${assignment.id}`;
    opened.value={paidOn:String(fields.get('paidOn')||''),paymentReference:String(fields.get('paymentReference')||'').trim(),confirmed:!!fields.get('confirmed')};
    let attempt=paymentAttempts.get(attemptKey);
    try{
      const block=financePaymentBlockReason(assignment);if(block)throw new Error(block);
      if(!opened.value.confirmed)throw new Error('Confirm that the money was actually sent.');
      if(!validFinanceDate(opened.value.paidOn))throw new Error('Enter the actual valid payment date.');
      if(opened.value.paidOn>today())throw new Error('The payment date cannot be in the future.');
      if(opened.value.paymentReference.length>500)throw new Error('Use a payment reference of at most 500 characters.');
      const values={campaignId:assignment.campaignId,assignmentId:assignment.id,expectedRevision:assignment.revision,expectedFundingMode:assignment.fundingMode,paidOn:opened.value.paidOn,paymentReference:opened.value.paymentReference||null,confirmed:true};
      const fingerprint=JSON.stringify(values);
      if(attempt&&attempt.fingerprint!==fingerprint)throw new Error('The previous payment is unconfirmed. Retry the same date and reference before changing this record.');
      if(!attempt){attempt={fingerprint,command:{...values,idempotencyKey:crypto.randomUUID()},assignment:structuredClone(assignment),saving:false};paymentAttempts.set(attemptKey,attempt);}
      if(attempt.saving)return;
      attempt.saving=true;opened.saving=true;opened.error=null;renderEditor();
      const receipt=demo?demo.confirmPayment(attempt.command):unpack(await requestJson('/api/finances/confirm-payment',{method:'POST',csrf:true,body:attempt.command}));
      if(session!==generation)return;
      const shares=financeShares(assignment.finance.amount,assignment.fundingMode);
      if(receipt?.paid!==true||receipt.campaignId!==assignment.campaignId||receipt.assignmentId!==assignment.id||receipt.revision!==attempt.command.expectedRevision+1||receipt.paidOn!==attempt.command.paidOn||receipt.invoiceAmount!==shares.invoice||receipt.paidByouAmount!==shares.byou||receipt.currency!==assignment.finance.currency)throw new Error('The payment is not confirmed. Retry the same payment details.');
      paymentAttempts.delete(attemptKey);invalidateOperations(assignment.campaignId);
      if(editor===opened)closeEditor(true);
      await load('finances',null,{reload:true});if(session!==generation)return;
      notify(demo?'Sample payment recorded in this preview.':'Payment recorded as paid.');
    }catch(error){
      if(session!==generation)return;
      if([400,401,403,404,409,422].includes(error.status))paymentAttempts.delete(attemptKey);
      if(editor===opened){opened.error=error.message;opened.saving=false;renderEditor();}
    }finally{if(attempt)attempt.saving=false;if(session===generation&&editor===opened){opened.saving=false;renderEditor();}}
  }
  async function openShipmentCellEditor(button) {
    const session=generation;
    // A blur save can replace the table before this click is handled. Re-find
    // the requested cell after that save rather than editing a detached node.
    const requestedRow=button.closest('tr'),requestedField=button.dataset.shipmentKey;
    if(activeShipmentCell?.isConnected){
      const previous=activeShipmentCell;
      if(!await finishShipmentCell(previous)){if(session===generation)previous.focus({preventScroll:true});return;}
      if(session!==generation)return;
      button=[...root.querySelectorAll('[data-ops-action="edit-shipment-cell"]')].find(el=>el.dataset.shipmentKey===requestedField&&el.closest('tr')?.dataset.assignmentId===requestedRow?.dataset.assignmentId&&el.closest('tr')?.dataset.campaignId===requestedRow?.dataset.campaignId);
      if(!button)return;
    }
    const row=button.closest('tr');
    const key=(row?.dataset.campaignId||'')+':'+(row?.dataset.assignmentId||'');
    if(shipmentAttempts.has(key)){row?.querySelector('[data-ops-action="retry-shipment-cell"],[data-ops-action="reload-shipments"]')?.focus();return;}
    const field=button.dataset.shipmentKey,kind=button.dataset.shipmentEditor||'text',label=button.dataset.shipmentLabel||field;
    let editor;
    if(kind==='select'){
      editor=document.createElement('select');
      const empty=document.createElement('option');empty.value='';empty.textContent='—';editor.append(empty);
      for(const value of (button.dataset.shipmentOptions||'').split('|').filter(Boolean)){
        const option=document.createElement('option');option.value=value;option.textContent=value;editor.append(option);
      }
    }else if(kind==='textarea'){
      editor=document.createElement('textarea');editor.rows=Number(button.dataset.shipmentRows||2);
    }else{
      editor=document.createElement('input');editor.type=['text','number','date'].includes(kind)?kind:'text';
      if(button.dataset.shipmentStep)editor.step=button.dataset.shipmentStep;
      if(button.dataset.shipmentMin!==undefined)editor.min=button.dataset.shipmentMin;
    }
    editor.className='ops-shipment-cell-input';editor.dataset.opsField='inline-shipment';editor.dataset.shipmentKey=field;
    if(button.dataset.shipmentMax)editor.maxLength=Number(button.dataset.shipmentMax);
    editor.setAttribute('aria-label',label);editor.value=button.dataset.shipmentValue||'';
    shipmentCells.set(editor,{button,initialValue:editor.value,pending:null,failed:false,requiresReload:false});activeShipmentCell=editor;
    button.replaceWith(editor);editor.focus();
    if(kind==='date'||kind==='select')editor.click();
  }

  async function onClick(event) {
    const invoker=event.target.closest('[data-ops-menu-target]');
    if(invoker){
      if(invoker.disabled)return;
      const menu=[...root.querySelectorAll('[popover]')].find(el=>el.id===invoker.dataset.opsMenuTarget);
      if(menu){
        if(invoker.closest('.ops-card--clean')){
          positionCampaignMenu(menu,invoker);
          requestAnimationFrame(()=>{if(menu.matches(':popover-open'))positionCampaignMenu(menu,invoker);});
        }else{
          const rect=invoker.getBoundingClientRect();
          menu.style.setProperty('--ops-menu-left',`${Math.max(8,Math.min(rect.left,window.innerWidth-232))}px`);
          menu.style.setProperty('--ops-menu-top',`${Math.max(8,Math.min(rect.bottom+6,window.innerHeight-190))}px`);
        }
      }
      return; // Preserve the native popover toggle, light dismissal, and Escape behavior.
    }
    const target=event.target.closest('[data-ops-action]');
    if(!target){
      if(!event.target.closest('button,a,input,select,textarea,label')){const row=event.target.closest('[data-ops-row]');if(row)navigate('campaign',row.dataset.campaignId);}
      return;
    }
    if(target.disabled||!mode)return;
    for(const menu of root.querySelectorAll('[popover]'))if(menu.matches(':popover-open'))menu.hidePopover();
    const action=target.dataset.opsAction,id=target.dataset.campaignId,assignmentId=target.dataset.assignmentId,session=generation;
    event.preventDefault();
    try{
      if(action==='edit-shipment-cell'){await openShipmentCellEditor(target);return;}
      if(action==='add-shipment-row'){
        const assignments=await loadShipmentAssignments();if(session!==generation||!assignments)return;
        if(ui.shipments.draft)return;
        ui.shipments.draft={assignmentId:'',values:{},initialValues:{},saving:false,error:null};rerender();return;
      }
      if(action==='save-shipment-draft'){await saveShipmentDraft();return;}
      if(action==='cancel-shipment-draft'){if(!ui.shipments.draft?.saving){ui.shipments.draft=null;rerender();}return;}
      if(action==='retry-shipment-assignments'){await loadShipmentAssignments({reload:true});return;}
      if(action==='open-shipment-import'){
        ui.shipments.import={...(ui.shipments.import||{}),open:true,busy:false,error:null};rerender();
        root.querySelector('[data-shipment-xlsx]')?.click();void loadShipmentAssignments();return;
      }
      if(action==='close-shipment-import'||action==='cancel-shipment-import'){
        if(ui.shipments.import?.busy)return;
        ui.shipments.import={open:false};rerender();return;
      }
      if(action==='review-shipment-import-row'){
        const row=ui.shipments.import?.previewRows?.find(item=>item.key===target.dataset.importRowKey);
        if(row){row.reviewedWarnings=true;refreshShipmentImportPlan();rerender();}return;
      }
      if(action==='confirm-shipment-import'){await confirmShipmentImport();return;}
      if(action==='retry-shipment-import-row'){await confirmShipmentImport({retryKey:target.dataset.importRowKey});return;}
      if(action==='close-editor'){closeEditor();return;}
      if(action==='retry-assignment-document'){
        if(editor?.kind!=='assignment'||editor.saving||!editor.pendingDocument)return;
        const opened=editor;captureEditor();opened.saving=true;opened.error=null;renderEditor();
        try{await attachAssignmentDocument(opened,session);}catch(error){if(editor===opened)opened.error=error.message;}
        finally{if(editor===opened&&generation===session){opened.saving=false;renderEditor();}}
        return;
      }
      if(action==='add-assignment-deliverable'||action==='remove-assignment-deliverable'){
        if(editor?.kind!=='assignment'||editor.saving)return;
        captureEditor();
        const rows=assignmentDeliverables(editor.assignment,editor.value);
        if(action==='add-assignment-deliverable'){
          if(rows.length>=MAX_ASSIGNMENT_DELIVERABLES)throw new Error('Use at most 30 deliverables.');
          rows.push({id:crypto.randomUUID(),platform:null,deliverableType:null,deliverableStatus:null,draftDueDate:null,publicationDate:null});
        }else{
          const index=rows.findIndex(row=>row.id===target.dataset.opsValue);
          if(index<0)throw new Error('Reload this deliverable before removing it.');
          rows.splice(index,1);
        }
        editor.value={...editor.value,deliverables:rows};renderEditor();
        if(action==='add-assignment-deliverable')overlay.querySelector(`[data-deliverable-id="${rows.at(-1).id}"] select`)?.focus();
        else overlay.querySelector('[data-ops-action="add-assignment-deliverable"]')?.focus();
        return;
      }
      if(action==='copy-shipment-tracking'){
        const assignment=cache.get('shipments')?.data?.items?.find(a=>a.id===assignmentId&&a.campaignId===id);
        const field=target.dataset.trackingField;
        const label=field==='trackingOriginal'?'Tracking Original':field==='trackingNumber'?'Tracking #':null;
        const value=label&&assignment?.shipment?.[field];
        if(!value)throw new Error('This tracking number is unavailable. Refresh shipments and try again.');
        try{await navigator.clipboard.writeText(value);if(session===generation)notify(`${label} copied.`);}
        catch{if(session===generation)notify('Could not copy the tracking number. Allow clipboard access in your browser and try again.');}
        return;
      }
      if(action==='copy-finance-ad-code'){
        const assignment=cache.get('finances')?.data?.items?.find(a=>a.id===assignmentId&&a.campaignId===id);
        const platform=target.dataset.adPlatform;
        const label=platform==='instagram'?'Instagram':platform==='tiktok'?'TikTok':null;
        const publication=assignment&&assignmentPublications(assignment).find(p=>String(p.number)===target.dataset.deliverableNumber);
        const code=label&&publication?.[platform+'AdCode'];
        if(!code)throw new Error('This ad code is unavailable. Refresh the finance records and try again.');
        try{
          await navigator.clipboard.writeText(code);
          if(session===generation)notify(`${label} ad code copied.`);
        }catch{
          if(session===generation)notify('Could not copy the ad code. Allow clipboard access in your browser and try again.');
        }
        return;
      }
      if(action==='confirm-payment'){
        const assignment=cache.get('finances')?.data?.items?.find(a=>a.id===assignmentId&&a.campaignId===id);
        const block=financePaymentBlockReason(assignment);if(block)throw new Error(block);
        const attempt=paymentAttempts.get(`${id}:${assignmentId}`);
        if(attempt?.saving)return;
        editorRequest++;focusBefore=document.activeElement;editor={kind:'finance_payment',assignment:attempt?.assignment||assignment,value:attempt?{paidOn:attempt.command.paidOn,paymentReference:attempt.command.paymentReference,confirmed:true}:{},saving:false};renderEditor({focus:true});return;
      }
      if(action==='undo-payment'){
        const assignment=cache.get('finances')?.data?.items?.find(a=>a.id===assignmentId&&a.campaignId===id);
        if(!assignment?.canFinance||assignment.finance?.status!=='paid')throw new Error('Choose a paid creator with finance access.');
        editorRequest++;focusBefore=document.activeElement;editor={kind:'finance_undo',assignment,saving:false};renderEditor({focus:true});return;
      }
      if(action==='finance-expense-calculator'){
        editorRequest++;focusBefore=document.activeElement;editor={kind:'finance_expenses',value:{},saving:false};renderEditor({focus:true});return;
      }
      if(action==='delay-finance'||action==='undo-finance-delay'){
        if(ui.finances.batchBusy)return;
        const a=cache.get('finances')?.data?.items?.find(a=>a.id===assignmentId&&a.campaignId===id);
        if(!a?.canFinance||a.finance?.status==='paid')throw new Error('Choose an unpaid creator with finance access.');
        if(paymentAttempts.has(`${id}:${assignmentId}`))throw new Error('Retry the unconfirmed payment before changing its schedule.');
        const undo=action==='undo-finance-delay';
        if(undo&&!(a.finance.delayWeeks>0))throw new Error('This payment has no delay to undo.');
        const command={action:undo?'undo_delay':'delay',campaignId:id,assignmentId,expectedRevision:a.revision},fingerprint=JSON.stringify(command);
        if(!financeAttempts.has(fingerprint))financeAttempts.set(fingerprint,crypto.randomUUID());
        ui.finances.batchBusy=true;rerender();
        try{
          const result=await batchRequest({...command,idempotencyKey:financeAttempts.get(fingerprint)});
          if(session!==generation)return;
          if(undo?!result.delayUndone||result.assignmentId!==assignmentId:!result.delayed||!result.thursday)throw new Error('The payment schedule change has not been confirmed. Retry the same request.');
          cache.delete(key('campaign',id));notify(undo?'Payment delay undone.':`Creator moved to Thursday ${displayDate(result.thursday,'UTC')}.`);
          financeAttempts.delete(fingerprint);await load('finances',null,{reload:true});
        }catch(error){if([400,401,403,409,422].includes(error.status))financeAttempts.delete(fingerprint);throw error;}
        finally{if(session===generation){ui.finances.batchBusy=false;rerender();}}
        return;
      }
      if(action==='toggle-campaign-tray'){ui.campaignTrayOpen=!ui.campaignTrayOpen;rerender();return;}
      if(action==='all-campaigns'){outreach=null;navigate('campaigns');return;}
      if(action==='open-campaign'){outreach=null;navigate('campaign',id);return;}
      if(action==='workspace-overview'){outreach=null;rosterUI(id).workspaceOverview=true;rerender();return;}
      if(action==='open-workspace-type'){outreach=null;rosterUI(id).workspaceOverview=false;navigate('campaign',id);rerender();return;}
      if(action==='add-campaign-type'){
        const entry=await load('campaign',id),campaign=entry?.data?.campaign;
        if(campaign?.workspaceAvailable!==true||campaign.workspaceLinkLocked===true){notify('Reload this campaign before adding a type.');return;}
        const parentId=campaign.workspaceId||id;
        const parentEntry=parentId===id?entry:await load('campaign',parentId);
        const parent=parentEntry?.data?.campaign;
        if(!parent||parent.canEdit!==true){notify('Editing access to the main campaign is required.');return;}
        const types=new Set((parent.workspaceMembers||[]).map(m=>m.type));
        const nextType=['paid','seeding','affiliate','other'].find(t=>!types.has(t))||'other';
        await openEditor('campaign',null,null,{workspaceParentId:parent.id,name:parent.workspaceName||parent.name,brand:parent.brand,productName:parent.productName,category:parent.category,type:nextType,timezone:parent.timezone,currency:parent.currency,startDate:null,endDate:null,budget:null});return;
      }
      if(action==='create-campaign'){await openEditor('campaign');return;}
      if(action==='edit-campaign'){await openEditor('campaign',id);return;}
      if(action==='next-review'||action==='previous-review'){await moveReview(id,{back:action==='previous-review'});return;}
 if(action==='reset-reviews'){persistHandledReplies(id,[]);Object.assign(rosterUI(id),{handledReplies:[],replyIndex:0});rerender();return;}
 if(action==='finish-review-draft'){
 const opened=editor;if(opened?.kind!=='conversation'||opened.loading||opened.saving||opened.draft.uncertain||!opened.draft.saved)return;
 await finishConversationReview(opened);notify('Draft kept in Gmail. Moved to the next review card.');return;
 }
 if(action==='check-gmail-reply'){
 const opened=editor;if(opened?.kind!=='conversation'||opened.loading||opened.saving)return;
 await reloadConversation();if(editor!==opened||opened.error)return;
 const messages=opened.data?.messages||[],latest=messages.at(-1),incoming=[...messages].reverse().find(m=>m.direction==='inbound');
 if(opened.data?.complete===true&&latest?.direction==='outbound'&&incoming&&Date.parse(latest.at)>Date.parse(incoming.at)){
 await finishConversationReview(opened);notify('Gmail reply confirmed. Moved to the next review card.');
 }else{opened.error='No newer sent reply was confirmed. Your review card is still here.';renderEditor();}return;
 }
      if(action==='review-conversation-later'){
        const opened=editor;if(opened?.kind!=='conversation'||opened.saving||opened.loading||!opened.reviewKey)return;
        if(opened.deferring)return;opened.deferring=true;
        if(!captureConversationDraft()){opened.deferring=false;notify(opened.draft.composeError);return;}
        const panel=overlay.querySelector('.ops-conversation');
        try{
          if(panel?.animate&&!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
            root.inert=true;panel.inert=true;
            await panel.animate([{transform:'translateX(0) rotate(0deg)',opacity:1},{transform:'translateX(-85%) rotate(-5deg)',opacity:0}],{duration:240,easing:'cubic-bezier(.3,0,.8,.15)',fill:'forwards'}).finished.catch(()=>{});
          }
          if(editor!==opened||session!==generation)return;
          closeEditor();if(!editor)await moveReview(opened.scope.campaignId);
        }finally{opened.deferring=false;if(panel?.isConnected)panel.inert=false;}
        return;
      }
      if(action==='send-to-contract-editor'){
        if(!openContractEditor)throw Error('Contract Editor is not available.');
        if(demo)throw Error('Contract preparation is available in the connected workspace.');
        const entry=ensure('campaign',id);if(entry.loading)await load('campaign',id);
        const assignment=entry.data?.assignments?.find(a=>a.id===assignmentId&&a.campaignId===id);
        if(!assignment)throw Error('Reload the campaign before preparing a contract.');
        const identity={campaignId:id,assignmentId,creatorId:assignment.creatorId};
        const session=generation;
        const inventory=unpack(await requestJson('/contract-editor/api/byou/threads?'+new URLSearchParams({campaign:id,assignment:assignmentId})));
        if(session!==generation)return;
        await openContractEditor({campaignId:id,assignmentId,threads:campaignContractThreads(inventory,identity)});return;
      }
      if(action==='view-conversation'){await openConversation(id,assignmentId,target.dataset.threadId);return;}
      if(action==='reload-conversation'){await reloadConversation();return;}
      if(action==='review-send-reply'){
        if(editor?.kind!=='conversation'||editor.saving||editor.loading||editor.draft.uncertain||editor.draft.sent||editor.draft.stale||editor.draft.suggestionId&&!editor.draft.reviewed)return;
        if(!captureConversationDraft()){editor.error=editor.draft.composeError||'Finish loading the attachments before review.';renderEditor();return;}
        if(!editor.draft.body.trim()||!editor.data?.canSaveDraft||!editor.data.replyTarget?.to){editor.error='Write and review your reply before sending.';renderEditor();return;}
        editor.draft.confirmSend=true;editor.error=null;renderEditor();return;
      }
      if(action==='cancel-send-reply'){
        if(editor?.kind==='conversation'&&!editor.saving){editor.draft.confirmSend=false;renderEditor();}return;
      }
      if(action==='confirm-send-reply'){
        const opened=editor;
        if(opened?.kind!=='conversation'||!opened.draft.confirmSend||opened.saving||opened.loading||opened.draft.uncertain||opened.draft.sent||opened.draft.stale||opened.draft.suggestionId&&!opened.draft.reviewed)return;
        const payload={body:opened.draft.body,document:opened.draft.document,attachments:opened.draft.attachments||[],historyId:opened.draft.savedHistoryId||opened.data.historyId,contextHash:opened.data.contextHash,conversationRevision:opened.data.conversationRevision,confirmedTo:opened.data.replyTarget.to,approved:true,...(opened.draft.saved?{draftRequestId:opened.draft.attempt?.requestId}:{})};
        const fingerprint=JSON.stringify(payload);
        if(opened.draft.sendAttempt?.fingerprint!==fingerprint)opened.draft.sendAttempt={fingerprint,requestId:crypto.randomUUID()};
        opened.saving=true;opened.draft.saving=true;opened.error=null;renderEditor();
        try{
          const result=demo?demoSaveMessage(opened.scope,payload,true):unpack(await requestJson(conversationPath(opened.scope),{method:'POST',csrf:true,body:{operation:'send_reply',input:{...payload,requestId:opened.draft.sendAttempt.requestId}}}));
          if(session!==generation)return;
          if(result?.status!=='sent'||result.sent!==true)throw Error('Sending was not confirmed. Check Gmail Sent before trying again.');
          opened.draft.sent=true;opened.draft.confirmSend=false;
          await finishConversationReview(opened);
        }catch(e){if(session===generation){opened.error=e.message||'Sending was not confirmed. Check Gmail Sent.';opened.draft.uncertain=true;opened.draft.confirmSend=false;}}
        finally{if(session===generation){opened.draft.saving=false;if(editor===opened){opened.saving=false;renderEditor();}}}
        return;
      }
      if(action==='new-reply-draft'){
        if(editor?.kind!=='conversation'||!(editor.draft.saved||editor.draft.stale||editor.draft.sent)||editor.draft.uncertain||editor.saving||editor.loading)return;
        Object.assign(editor.draft,{body:'',document:null,attachments:[],saved:false,sent:false,feedbackStatus:null,confirmSend:false,sendAttempt:null,attempt:null,providerMessageId:null,suggestionId:null,touched:false,reviewed:false,stale:false,sourceHistoryId:null,sourceContextHash:null});await reloadConversation();return;
      }
      if(action==='authorize-representative'){
        const opened=editor,candidate=opened?.data?.candidateRepresentative;
        if(opened?.kind!=='conversation'||!candidate||opened.saving||opened.loading||opened.representativeUncertain)return;
        if(!globalThis.confirm('Authorize '+candidate.displayName+' ('+candidate.email+') for this campaign conversation only? The creator stays copied. No email will be sent.'))return;
        captureEditor();opened.saving=true;opened.error=null;renderEditor();
        const input=opened.representativeAttempt||{requestId:crypto.randomUUID(),email:candidate.email,displayName:candidate.displayName,messageId:candidate.messageId,historyId:opened.data.historyId,reason:'Staff approved the representative shown in this linked campaign conversation.'};
        opened.representativeAttempt=input;
        try{opened.data=unpack(await requestJson(conversationPath(opened.scope),{method:'POST',csrf:true,body:{operation:'authorize_representative',input}}));}
        catch(e){opened.representativeUncertain=true;opened.error=(e.message||'Representative authorization was not confirmed.')+' Close and reopen the conversation to check its saved status before retrying.';}
        finally{opened.saving=false;if(editor===opened)renderEditor();}return;
      }
      if(action==='show-reply-target'){
        const target=overlay.querySelector('[data-conversation-reply-target]');
        target?.scrollIntoView({block:'nearest'});target?.focus({preventScroll:true});return;
      }
      if(action==='edit-automation'){await openEditor('automation',id);return;}
      if(action==='automation-load-more'){
        const opened=editor;if(opened?.kind!=='automation'||opened.saving||opened.loadingRoster)return;
        captureEditor();opened.loadingRoster=true;opened.error=null;renderEditor();
        const record=await load('campaign',opened.campaign.id,{append:true});
        if(session!==generation||editor!==opened)return;
        captureEditor();opened.loadingRoster=false;
        if(record?.error)opened.error=record.error;
        else if(record?.data){opened.assignments=record.data.assignments;opened.hasMore=record.data.page?.hasMore===true;}
        renderEditor();return;
      }
      if(action==='automation-review'){
        const panel=root.querySelector('.ops-attention');
        if(panel){panel.tabIndex=-1;panel.focus();panel.scrollIntoView({block:'start'});}else notify('No review items are loaded on this page. Load more creators and replies, or refresh the campaign.');return;
      }
      if(action==='delete-campaign'){await openEditor('delete_campaign',id,null);return;}
      if(action==='remove-creator'){await openEditor('remove_creator',id,assignmentId);return;}
      if(action==='select-all-outreach'||action==='clear-outreach'){
        const inputs=[...root.querySelectorAll('[data-ops-form="outreach-selection"] input[name="creatorIds"]:not(:disabled)')];
        const chosen=action==='select-all-outreach';for(const input of inputs)input.checked=chosen;
        rosterUI(id).selectedCreatorIds=chosen?inputs.map(input=>input.value):[];
        const count=root.querySelector('[data-outreach-count]');if(count)count.textContent=`${rosterUI(id).selectedCreatorIds.length} selected`;
        return;
      }
      if(action==='edit-phase'){await openEditor('phase',id,assignmentId,target.dataset.opsValue?{phase:Number(target.dataset.opsValue)}:{});return;}
      if(action==='set-inline-phase'){await setInlinePhase(id,assignmentId,Number(target.dataset.opsValue));return;}
      if(action==='retry-inline-phase'){const attempt=phaseAttempts.get(`${id}:${assignmentId}`);if(attempt)await setInlinePhase(id,assignmentId,attempt.command.data.phase);return;}
      if(action==='reload-inline-phase'){await reloadInlinePhase(id,assignmentId);return;}
      if(action==='edit-assignment'){await openEditor('assignment',id,assignmentId);return;}
      if(action==='edit-finance'){if(paymentAttempts.has(`${id}:${assignmentId}`))throw new Error('Retry the unconfirmed payment before editing this record.');await openEditor('finance',id,assignmentId);return;}
      if(action==='edit-shipment'||action==='request-shipment'||action==='shipment-notes'){
        await openEditor('shipment',id,assignmentId,{}, {sendingShipment:action==='request-shipment',shipmentStep:action==='shipment-notes'?'notes':'details'});
        return;
      }
      if(action==='skip-shipment-details'||action==='shipment-details-back'){
        if(editor?.kind!=='shipment'||!editor.sendingShipment||editor.saving)return;
        if(action==='shipment-details-back')captureEditor();
        editor.shipmentStep=action==='skip-shipment-details'?'notes':'details';editor.error=null;renderEditor({focus:true});
        return;
      }
      if(action==='select-assignment'){
        closeEditor();if(editor)return;
        const entry=await load('campaign',id);if(session!==generation)return;
        const data=entry?.data,assignment=data?.assignments?.find(a=>a.id===assignmentId&&a.campaignId===id);
        if(!assignment){notify('Creator progress is unavailable. Reload the campaign and try again.');return;}
        focusBefore=target;editor={kind:'progress',campaign:data.campaign,assignment,creators:data.creators||allCreators(),operations:data};renderEditor({focus:true});return;
      }
      if(action==='clear-selection'){closeEditor();return;}
      if(action==='filter-phase'){rosterUI(id).phase=target.dataset.opsValue;rerender();return;}
      if(action==='roster-mode'){const section=target.closest('[data-campaign-id]');rosterUI(id||section?.dataset.campaignId).rosterMode=target.dataset.opsValue;rerender();return;}
      if(action==='open-creator'){await openCreator?.(target.dataset.creatorId);return;}
      if(action==='refer-finance'){
        await openEditor('finance_intake',id,assignmentId);return;
      }
      if(action==='open-outreach'){
        outreach={campaignId:id,drafts:[],sendEnabled:false,loading:!demo};rerender();
        const opened=outreach,alive=()=>session===generation&&outreach===opened;
        if(!demo)try{const response=unpack(await requestJson(`/api/campaign-ops/${encodeURIComponent(id)}/outreach`));if(alive())Object.assign(opened,response);}catch(error){if(alive())opened.error=error.message;}finally{if(alive()){opened.loading=false;rerender();}}
        return;
      }
      if(action==='approve-send'){
        const opened=outreach,alive=()=>session===generation&&outreach===opened;
        const draft=outreach?.drafts.find(item=>item.id===target.dataset.draftId);
        if(demo||!outreach?.sendEnabled||!draft?.canSend||!draft.reviewed)throw new Error('Review the exact message and resolve its send checks first.');
        outreach.sending=draft.id;rerender();
        try{
          const response=unpack(await requestJson(`/api/campaign-ops/${encodeURIComponent(id)}/outreach`,{method:'POST',csrf:true,body:{action:'approve',items:[{id:draft.id,hash:draft.previewHash||draft.hash}],idempotencyKey:crypto.randomUUID()}}));
          if(!alive())return;
          draft.canSend=false;draft.reviewed=false;draft.blockReason='Approved and queued. Delivery awaits the sending worker.';outreach.notice=response.notice||'Approved message queued for sending.';
        }catch(error){if(alive()){opened.error=error.message;draft.canSend=false;draft.reviewed=false;draft.blockReason='Approval could not be confirmed. Reload the saved outbox before retrying.';}}finally{if(alive()){opened.sending=false;rerender();}}
        return;
      }
      if(['show-more-replies','show-fewer-replies','load-more-replies'].includes(action)){
        const data=cache.get(key('campaign',id))?.data;if(!data||data.campaign?.id!==id)return;
        const state=rosterUI(id);state.replyVisibleCount=action==='show-fewer-replies'?3:(state.replyVisibleCount||3)+3;
        if(action==='load-more-replies'&&data.page?.hasMore===true)await load('campaign',id,{append:true});else rerender();return;
      }
      if(action==='manage-creators'){navigate('creators');notify('Select creator cards, then choose Add to campaign.');return;}
      if(action==='add-selected-creators'){
        if(!selection().length){notify('Select at least one creator.');return;}
        ui.campaigns={search:'',type:'all',activity:'all'};
        const request=++editorRequest;await load('campaigns',null,{reload:true});if(session!==generation||request!==editorRequest)return;focusBefore=document.activeElement;editor={kind:'choose-campaign',campaignId:id};renderEditor({focus:true});return;
      }
      if(action==='clear-selected-creators'){if(!editor?.saving&&!editor?.pendingCommand){updateSelection([]);rerender();}return;}
      if(action==='add-resource'||action==='remove-resource'){
        captureEditor();const rows=editor.value.resources||[];
        if(action==='add-resource')rows.push({id:crypto.randomUUID(),name:'',kind:'other',url:''});else rows.splice(Number(target.dataset.opsValue),1);
        editor.value.resources=rows;renderEditor();return;
      }
      if(action==='load-more-campaigns'||action==='reload-directory'){await load('campaigns',null,{reload:action==='reload-directory',append:action==='load-more-campaigns'});if(editor?.kind==='choose-campaign')renderEditor();return;}
      if(action==='reload-automation-campaigns'||action==='load-more-automation-campaigns'){await load('automation-campaigns',null,{reload:action==='reload-automation-campaigns',append:action==='load-more-automation-campaigns'});return;}
      if(action==='reload-automation'){if(id===ui.automations.campaignId)await load('campaign',id,{reload:true});return;}
      if(action==='load-more-assignments'){await load('campaign',id,{append:true});return;}
      if(action==='reload-campaign'){await load('campaign',id,{reload:true});return;}
      if(action==='reload-finance'){await load('finances',null,{reload:true});return;}
      if(action==='reload-shipments'){if(target.dataset.assignmentId)shipmentAttempts.delete(String(target.dataset.campaignId)+':'+String(target.dataset.assignmentId));await load('shipments',null,{reload:true});return;}
      if(action==='load-more-queue'){await load(target.dataset.opsValue,null,{append:true});return;}
      if(action==='retry-shipment-cell'){await saveInlineShipment(target.closest('tr')?.querySelector('[data-ops-field="inline-shipment"]'),{retry:true});return;}
    }catch(error){if(session===generation)notify(error.message||'This change could not be confirmed.');}
  }
  function onChange(event) {
    if(editor?.kind==='conversation'&&event.target.dataset.opsField==='reply-reviewed'){
      editor.draft.reviewed=event.target.checked;renderEditor();return;
    }
    if(editor?.kind==='finance_expenses'&&['dateFrom','dateTo'].includes(event.target.name)){
      editor.value={...editor.value,[event.target.name]:event.target.value};editor.downloadUrl=null;editor.error=null;
      renderEditor();return;
    }
    const el=event.target;
    if(el.matches('[data-shipment-xlsx]')){const file=el.files?.[0];if(file)void handleShipmentWorkbook(file);el.value='';return;}
    if(el.dataset.opsField==='shipment-draft-assignment'){
      const draft=ui.shipments.draft,assignment=ui.shipments.assignmentChoices?.find(item=>item.id===el.value);
      if(!draft)return;draft.assignmentId=assignment?.id||'';draft.values=assignment?shipmentDraftDefaults(assignment):{};draft.initialValues={...draft.values};draft.error=null;rerender();return;
    }
    if(el.dataset.opsField==='shipment-draft-input'){captureShipmentDraft();return;}
    if(el.dataset.opsField==='shipment-import-sheet'){
      const state=ui.shipments.import;if(!state||!state.sheets?.includes(el.value))return;
      state.selectedSheet=el.value;state.headers=state.headersBySheet[el.value]||[];state.headerMap={...(state.headerMapsBySheet[el.value]||{})};refreshShipmentImportPlan({clearSelections:true});rerender();return;
    }
    if(el.dataset.opsField==='shipment-import-map'){
      const state=ui.shipments.import;if(!state)return;
      if(el.value==='')delete state.headerMap[el.dataset.importField];else state.headerMap[el.dataset.importField]=Number(el.value);
      refreshShipmentImportPlan({clearSelections:true});rerender();return;
    }
    if(el.dataset.opsField==='shipment-import-assignment'){
      const row=ui.shipments.import?.previewRows?.find(item=>item.key===el.dataset.importRowKey);if(!row)return;
      row.selectedAssignmentId=el.value||null;row.decisions={};row.reviewedWarnings=false;row.useDuplicate=false;row.skip=false;refreshShipmentImportPlan();rerender();return;
    }
    if(el.dataset.opsField==='shipment-import-conflict'){
      const row=ui.shipments.import?.previewRows?.find(item=>item.key===el.dataset.importRowKey);if(!row)return;
      row.decisions={...row.decisions,[el.dataset.shipmentKey]:el.value||null};refreshShipmentImportPlan();rerender();return;
    }
    if(el.dataset.opsField==='shipment-import-include'){
      const row=ui.shipments.import?.previewRows?.find(item=>item.key===el.dataset.importRowKey);if(!row)return;
      row.skip=!el.checked;row.useDuplicate=false;refreshShipmentImportPlan();rerender();return;
    }
    if(el.dataset.opsField==='shipment-import-duplicate'){
      const row=ui.shipments.import?.previewRows?.find(item=>item.key===el.dataset.importRowKey);if(!row)return;
      row.useDuplicate=el.checked;row.skip=!el.checked;refreshShipmentImportPlan();rerender();return;
    }
    if(el.dataset.opsField==='inline-shipment'){
      const state=shipmentCells.get(el);
      if(!state?.requiresReload){if(state)state.failed=false;void finishShipmentCell(el);}
      return;
    }
    if(el.name==='creatorIds'&&el.closest('[data-ops-form="outreach-selection"]')){
      const form=el.closest('[data-ops-form="outreach-selection"]'),ids=[...form.querySelectorAll('input[name="creatorIds"]:checked')].map(i=>i.value);
      rosterUI(form.dataset.campaignId).selectedCreatorIds=ids;const count=form.querySelector('[data-outreach-count]');if(count)count.textContent=`${ids.length} selected`;return;
    }
    if(editor?.kind==='choose-campaign'&&el.name==='campaignId'){editor.campaignId=el.value;return;}
    if(el.matches('[data-ops-select-creator]')){
      if(editor?.saving||editor?.pendingCommand)return;
      const next=new Map(selection().map(c=>[c.id,c]));
      if(el.checked){const cr=allCreators().find(c=>c.id===el.value);if(cr)next.set(cr.id,cr);}else next.delete(el.value);
      updateSelection([...next.values()]);
      rerender();return;
    }
    const field=el.dataset.opsField;
    if(field==='inline-phase')return setInlinePhase(el.dataset.campaignId,el.dataset.assignmentId,Number(el.value));
    if(field==='automation-campaign'){
      const campaignId=el.value;
      if(campaignId&&!(cache.get('automation-campaigns')?.data?.items||[]).some(c=>c.id===campaignId))return;
      ui.automations.campaignId=campaignId;rerender();return;
    }
    if(field==='automation-email'||field==='automation-shipments'){
      const channel=field==='automation-email'?'email':'shipments',requested=el.checked;
      el.checked=cache.get(key('campaign',el.dataset.campaignId))?.data?.automation?.[channel]?.enabled===true;
      return openEditor('automation',el.dataset.campaignId,null,{[channel==='email'?'emailEnabled':'shipmentsEnabled']:requested,approved:false});
    }
    if(editor?.kind==='automation'&&['emailEnabled','shipmentsEnabled','mailboxBindingId','enrolledAssignmentIds'].includes(el.name)){
      try{captureEditor();editor.value.approved=false;renderEditor();}catch(error){editor.error=error.message;renderEditor();}return;
    }
    if(field==='outreach-reviewed'){const draft=outreach?.drafts.find(d=>d.id===el.dataset.draftId);if(draft)draft.reviewed=el.checked;rerender();return;}
    if(field==='roster-selection'){const r=rosterUI(el.dataset.campaignId),set=new Set(r.selectedCreatorIds);el.checked?set.add(el.value):set.delete(el.value);r.selectedCreatorIds=[...set];return;}
    if(editor&&el.name==='liveDate'){
      const due=overlay.querySelector('[name=dueDate]');try{if(due)due.value=net30Date(el.value)||'';}catch{if(due)due.value='';}
      const helper=due?.closest('label')?.querySelector('small');if(helper)helper.textContent=due.value?'30 calendar days after the live date.':'Add a valid live date to calculate the due date.';return;
    }
    if(editor&&el.name==='categoryChoice'){const custom=overlay.querySelector('[data-custom-category]');if(custom)custom.hidden=el.value!=='custom';return;}
    if(editor&&el.name==='activeTemplate'){
      const next=el.value,previous=overlay.querySelector('[data-current-template]')?.value||editor.value.activeTemplate||editor.campaign.type||'paid';
      el.value=previous;
      try{captureEditor();editor.value.activeTemplate=next;renderEditor();}
      catch(error){notify(error.message);}
      return;
    }
    if(el.name==='templateKey'&&outreach){outreach.templateKey=el.value;return;}
    if(editor&&el.name==='type'){captureEditor();renderEditor();return;}
    if(editor&&['w9DocumentId','invoiceDocumentId','contractDocumentId'].includes(el.name)){captureEditor();editor.value[el.name.replace('DocumentId','Status')]=el.value?'pending':'missing';renderEditor();return;}
    if(!field)return;
    if(field==='roster-search'){const id=el.closest('[data-campaign-id]')?.dataset.campaignId;rosterUI(id).search=el.value;rerender();return;}
    const [prefix,name]=field.split('-'),view={directory:'campaigns',finance:'finances',shipment:'shipments'}[prefix];
    if(view){ui[view][name]=el.value;if(view==='finances'&&name==='brand')ui.finances.campaignId='';if(view!=='finances')void load(view,null,{reload:true});rerender();}
  }
  async function uploadFile(file,campaignId=null,assignmentId=null,purpose='resource'){
    return unpack(await requestJson('/api/campaign-files',{method:'POST',csrf:true,body:{uploadId:file.uploadId||crypto.randomUUID(),campaignId,assignmentId,purpose,name:file.name,data:file.data}}));
  }
  overlay.addEventListener('change',async event=>{
    const purpose=event.target.dataset.opsUpload,file=event.target.files?.[0];
    if(!purpose||!file||!editor||editor.saving)return;
    const opened=editor,session=generation;
    try{
      if(demo)throw new Error('File storage requires the connected workspace. The sample preview does not upload files.');
      const protectedDocument=['invoice','w9','contract'].includes(purpose);
      if(protectedDocument&&(!['assignment','finance'].includes(opened.kind)||opened.assignment.canFinance!==true))throw new Error('Uploading protected documents requires finance access.');
      if(opened.pendingDocument)throw new Error('Retry the document attachment before uploading another file.');
      if(protectedDocument&&opened.assignment.finance?.status==='paid')throw new Error('Document changes for a paid assignment require a finance correction.');
      if(opened.kind==='assignment'&&opened.attempt?.uncertain)throw new Error('Reload this assignment to confirm the previous save before uploading a document.');
      if(file.size>5*1024*1024||!ATTACHMENT_TYPES[file.name.split('.').pop().toLowerCase()])throw new Error('Choose a PDF, PNG, JPG, TXT or DOCX file up to 5 MB.');
      if(['invoice','w9','contract'].includes(purpose)&&!file.name.toLowerCase().endsWith('.pdf'))throw new Error('Choose a PDF document up to 5 MB.');
      captureEditor();opened.saving=true;opened.error=null;renderEditor();
      const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(Error('This file could not be read.'));reader.readAsDataURL(file);});
      if(editor!==opened||generation!==session)return;
      const saved=await uploadFile({name:file.name,data},opened.campaign.id||null,['invoice','w9','contract'].includes(purpose)?opened.assignment.id:null,purpose);
      if(editor!==opened||generation!==session)return;
      if(['invoice','w9','contract'].includes(purpose)){
        const document={id:saved.documentId,displayName:saved.name,documentType:purpose,availabilityStatus:'copied',sizeBytes:saved.size,downloadUrl:`/api/campaign-files/${saved.fileId}`};
        if(opened.kind==='assignment'){
          if(!/^[a-f0-9-]{36}$/i.test(saved.documentId||'')||saved.documentId!==saved.fileId)throw new Error('The protected upload is not confirmed. Reload the assignment before retrying.');
          const f=opened.assignment.finance||{};
          opened.pendingDocument={document,command:{action:'finance',assignmentId:opened.assignment.id,expectedRevision:opened.assignment.revision,idempotencyKey:crypto.randomUUID(),data:{amount:f.amount??null,currency:f.currency||opened.assignment.feeCurrency||'USD',method:f.method??null,liveDate:f.liveDate??null,urgency:f.urgency||'normal',status:'pending',[purpose+'DocumentId']:saved.documentId,[purpose+'Status']:'pending'}}};
          await attachAssignmentDocument(opened,session);
        }else{
          opened.assignment.documents=[...(opened.assignment.documents||[]).filter(d=>d.id!==document.id),document];
          opened.value[purpose+'DocumentId']=saved.documentId;opened.value[purpose+'Status']='pending';
          if((opened.value.status??opened.assignment.finance?.status)==='ready')opened.value.status='pending';
          notify('Document uploaded. Save changes to attach it to this payment.');
        }
      }else (opened.value.resources??=[]).push({id:crypto.randomUUID(),fileId:saved.fileId,name:saved.name,kind:'other',url:''});
      if(!protectedDocument)notify('File uploaded. Save the campaign to keep this reference.');
    }catch(error){if(editor===opened)opened.error=error.message;}
    finally{if(editor===opened&&generation===session){opened.saving=false;renderEditor();}}
  });
  let draggedCreators=[],clearDragVisual=null,pointerDrag=null,suppressDragClickUntil=0;
  const creatorDragCard=event=>{
    const card=event.target.closest('[data-creator-card][draggable="true"]');
    return card&&!event.target.closest('button,input,a,select,textarea,label')&&!editor?card:null;
  };
  function prepareCreatorDrag(card){
    const creator=allCreators().find(c=>c.id===card.dataset.creatorCard);if(!creator)return false;
    draggedCreators=selection().some(c=>c.id===creator.id)?selection():[creator];return true;
  }
  function clearDropTargets(){root.querySelectorAll('.is-drop-target').forEach(el=>el.classList.remove('is-drop-target'));}
  function finishCreatorDrop(target){
    if(!target||target.disabled||!draggedCreators.length)return;
    updateSelection(draggedCreators);draggedCreators=[];
    return onClick({target,preventDefault(){}});
  }
  root.addEventListener('pointerdown',event=>{
    if(event.button!==0||event.isPrimary===false||event.pointerType==='touch')return;
    const card=creatorDragCard(event);if(!card)return;
    pointerDrag={card,id:event.pointerId,x:event.clientX,y:event.clientY,active:false};
    card.setPointerCapture(event.pointerId);
  });
  root.addEventListener('pointermove',event=>{
    const drag=pointerDrag;if(!drag||drag.id!==event.pointerId)return;
    if(!drag.active){
      if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<6)return;
      if(!prepareCreatorDrag(drag.card)){pointerDrag=null;return;}
      drag.active=true;syncDragTray();clearDragVisual?.();
      clearDragVisual=createDragPreview(drag.card,{clientX:drag.x,clientY:drag.y},draggedCreators.length,allCreators().find(c=>c.id===drag.card.dataset.creatorCard));
    }
    event.preventDefault();clearDragVisual.move?.(event);
    clearDropTargets();
    const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-ops-drop]');
    if(target&&!target.disabled)target.classList.add('is-drop-target');
  });
  function endPointerDrag(event,cancelled=false){
    const drag=pointerDrag;if(!drag||drag.id!==event.pointerId)return;
    pointerDrag=null;
    if(!drag.active)return;
    event.preventDefault();suppressDragClickUntil=performance.now()+300;
    const target=cancelled?null:document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-ops-drop]');
    clearDragVisual?.();clearDragVisual=null;clearDropTargets();
    if(target&&!target.disabled)return finishCreatorDrop(target);
    else {draggedCreators=[];syncDragTray();}
  }
  root.addEventListener('pointerup',event=>endPointerDrag(event));
  root.addEventListener('pointercancel',event=>endPointerDrag(event,true));
  root.addEventListener('lostpointercapture',event=>endPointerDrag(event,true));
  const cancelDragWithEscape=event=>{
    if(event.key==='Escape'&&pointerDrag)endPointerDrag({pointerId:pointerDrag.id,preventDefault(){}},true);
  };
  root.addEventListener('keydown',cancelDragWithEscape);
  document.addEventListener('keydown',cancelDragWithEscape);
  root.addEventListener('click',event=>{
    if(performance.now()<suppressDragClickUntil){event.preventDefault();event.stopImmediatePropagation();}
  },true);
  root.addEventListener('dragstart',event=>{
    if(pointerDrag){event.preventDefault();return;}
    const card=event.target.closest('[data-creator-card][draggable="true"]');
    if(!card)return;
    if(event.target.closest('button,input,a,select,textarea,label')||editor){event.preventDefault();return;}
    const creator=allCreators().find(c=>c.id===card.dataset.creatorCard);if(!creator)return;
    draggedCreators=selection().some(c=>c.id===creator.id)?selection():[creator];
    syncDragTray();event.dataTransfer.effectAllowed='copy';
    event.dataTransfer.setData('application/x-byou-creators',JSON.stringify(draggedCreators.map(c=>c.id)));
    clearDragVisual?.();clearDragVisual=createDragPreview(card,event,draggedCreators.length,creator);
  });
  root.addEventListener('dragover',event=>{
    const importTarget=event.target.closest('[data-shipment-import-drop]');
    if(importTarget&&[...(event.dataTransfer?.types||[])].includes('Files')){event.preventDefault();event.dataTransfer.dropEffect='copy';importTarget.classList.add('is-drop-target');return;}
    const target=event.target.closest('[data-ops-drop]');
    if(!target||target.disabled||!draggedCreators.length)return;
    event.preventDefault();event.dataTransfer.dropEffect='copy';target.classList.add('is-drop-target');
  });
  root.addEventListener('dragleave',event=>{const importTarget=event.target.closest('[data-shipment-import-drop]');if(importTarget&&!importTarget.contains(event.relatedTarget))importTarget.classList.remove('is-drop-target');const target=event.target.closest('[data-ops-drop]');if(target&&!target.contains(event.relatedTarget))target.classList.remove('is-drop-target');});
  root.addEventListener('drop',event=>{
    const importTarget=event.target.closest('[data-shipment-import-drop]');
    if(importTarget&&event.dataTransfer?.files?.length){event.preventDefault();importTarget.classList.remove('is-drop-target');if(!ui.shipments.import?.busy)void handleShipmentWorkbook(event.dataTransfer.files[0]);return;}
    const target=event.target.closest('[data-ops-drop]');if(!target||target.disabled||!draggedCreators.length)return;
    event.preventDefault();clearDragVisual?.();target.classList.remove('is-drop-target');
    return finishCreatorDrop(target);
  });
  root.addEventListener('dragend',()=>{clearDragVisual?.();clearDragVisual=null;draggedCreators=[];syncDragTray();root.querySelectorAll('.is-drop-target').forEach(el=>el.classList.remove('is-drop-target'));});
  overlay.addEventListener('change',async event=>{
    if(!event.target.matches('[data-template-import]'))return;
    const file=event.target.files?.[0];if(!file||!editor||editor.saving)return;
    try{
      if(file.size>100000||! /\.(txt|html?)$/i.test(file.name))throw new Error('Choose a TXT or HTML message up to 100 KB.');
      const text=await file.text(),composer=overlay.querySelector('[data-composer="templateBody"]');if(!composer)return;
      const prior=readEmailComposer(composer);
      setEmailComposer(composer,{...prior,...(/\.html?$/i.test(file.name)?{document:importEmailHtml(text)}:{body:text,document:undefined})});
      captureEditor();notify('Message imported. Review the formatting before saving.');
    }catch(error){notify(error.message);}
  });
  function onInput(event) {
    if(event.target.dataset.opsField==='inline-shipment'){
      const state=shipmentCells.get(event.target);
      if(state&&!state.requiresReload&&!event.target.disabled)state.failed=false;
      return;
    }
    if(editor?.kind==='conversation'&&event.target.closest('[data-composer="replyBody"]')){
      captureConversationDraft();editor.draft.touched=true;editor.draft.reviewed=false;
      editor.draft.sourceHistoryId??=editor.data?.historyId;editor.draft.sourceContextHash??=editor.data?.contextHash;
      const review=overlay.querySelector('[data-ops-field="reply-reviewed"]');if(review)review.checked=false;
      const save=overlay.querySelector('form[data-ops-form="conversation"] button[type="submit"]');if(save&&editor.draft.suggestionId)save.disabled=true;
      return;
    }
    const field=event.target.dataset.opsField;if(field==='shipment-draft-input'){captureShipmentDraft();return;}if(!field?.endsWith('-search'))return;
    clearTimeout(timer);const el=event.target;timer=setTimeout(()=>onChange({target:el}),350);
  }
  for(const surface of [root,overlay]){
    surface.addEventListener('click',onClick);surface.addEventListener('submit',onSubmit);surface.addEventListener('change',onChange);surface.addEventListener('input',onInput);
  }
  root.addEventListener('focusout',event=>{
    const control=event.target;if(control.dataset?.opsField!=='inline-shipment')return;
    // The shared calendar/select popup temporarily owns focus while editing.
    queueMicrotask(()=>{if(control.getAttribute('aria-expanded')!=='true'&&document.activeElement!==control)void finishShipmentCell(control);});
  });
  root.addEventListener('material-input-close',event=>{
    const control=event.target;if(control.dataset?.opsField!=='inline-shipment')return;
    queueMicrotask(()=>{if(control.getAttribute('aria-expanded')!=='true')void finishShipmentCell(control);});
  });
  root.addEventListener('keydown',event=>{
    const control=event.target,state=shipmentCells.get(control);if(!state||state.pending)return;
    if(event.key==='Escape'&&!control.disabled){event.preventDefault();event.stopPropagation();closeShipmentCell(control,{focus:true});}
    if(event.key==='Enter'&&control.tagName!=='TEXTAREA'&&control.tagName!=='SELECT'&&control.type!=='date'){
      event.preventDefault();if(!state.requiresReload){state.failed=false;void finishShipmentCell(control);}
    }
  });
  root.addEventListener('toggle',event=>{const name=event.target.dataset?.financeDisclosure;if(name)ui.finances.disclosures[name]=event.target.open;},true);
  root.addEventListener('contextmenu',event=>{
    const card=event.target.closest('[data-ops-context=creator]');if(!card)return;
    const action=card.querySelector('[data-ops-action=refer-finance]');if(!action)return;
    event.preventDefault();void openEditor('finance_intake',card.dataset.campaignId,card.dataset.assignmentId);
  });
  overlay.addEventListener('toggle',event=>{
    const earlier=event.target;
    if(!earlier.open||!earlier.matches?.('.ops-conversation-earlier'))return;
    const history=earlier.closest('.ops-conversation-history');
    const previous=earlier.querySelector('.ops-conversation-earlier-list > .ops-conversation-message:last-child');
    if(history&&previous)history.scrollTop+=previous.getBoundingClientRect().top-history.getBoundingClientRect().top;
  },true);
  overlay.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();closeEditor();return;}
    if(event.key!=='Tab')return;
    const controls=[...overlay.querySelectorAll('button:not(:disabled),input:not(:disabled):not([type=hidden]),select:not(:disabled),textarea:not(:disabled),a[href]')].filter(el=>el.getClientRects().length&&!el.closest('fieldset[disabled]'));
    if(!controls.length)return;const first=controls[0],last=controls.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  function renderCampaignTray(){
      if(!mode)return '';
      const entry=ensure('campaigns'),rows=campaignTypeChoices(entry.data?.items||[]).filter(c=>c.canEdit);
      const count=selection().length||draggedCreators.length;
      if(!count){ui.campaignTrayVisible=false;return '';}
      const entering=!ui.campaignTrayVisible;ui.campaignTrayVisible=true;
      if(entering)ui.campaignTrayOpen=true;
      return `<aside class="ops-campaign-tray${ui.campaignTrayOpen?" is-open":""}" aria-label="Add creators to a campaign"${entering?' data-tray-enter="true"':''}><button type="button" class="ops-campaign-tray-toggle" data-ops-action="toggle-campaign-tray" aria-expanded="${ui.campaignTrayOpen}" aria-controls="campaign-tray-options">Add to a campaign <span>${count} selected · ${ui.campaignTrayOpen?"−":"+"}</span></button><div id="campaign-tray-options" class="ops-campaign-tray-body"><h2 data-i18n>Add to a campaign</h2><p data-i18n>Select creators or drag a card onto a campaign.</p><p role="status"><strong data-i18n>${count} selected</strong></p><div class="ops-drop-targets" role="group" aria-label="Editable campaigns">${rows.map(c=>`<button type="button" class="button button--secondary ops-drop-target" data-ops-drop data-ops-action="add-selected-creators" data-campaign-id="${esc(c.id)}"><strong data-no-translate>${esc(c.name)}</strong><small><span data-i18n data-i18n-context="campaign-type">${esc(c.type==='paid'?'Paid':c.type==='seeding'?'Seeding':'Campaign')}</span></small></button>`).join('')}${entry.loading?'<p role="status">Loading campaigns…</p>':entry.error?'<p role="alert">Campaigns unavailable.</p><button type="button" class="button button--secondary" data-ops-action="reload-directory">Retry</button>':!rows.length?'<p>No editable campaigns yet.</p>':''}</div>${entry.data?.page?.hasMore?'<button type="button" class="button button--secondary" data-ops-action="load-more-campaigns">More campaigns</button>':''}${selection().length?'<button type="button" class="button button--secondary ops-campaign-clear" data-ops-action="clear-selected-creators">Clear selection</button>':''}</div></aside>`;

  }
  function syncDragTray(refresh=false){
    const layout=root.querySelector('.ops-creator-layout');if(!layout)return;
    const tray=layout.querySelector('.ops-campaign-tray');
    if(draggedCreators.length&&!tray)layout.insertAdjacentHTML('beforeend',renderCampaignTray());
    else if(draggedCreators.length&&refresh)tray.outerHTML=renderCampaignTray();
    else if(!draggedCreators.length&&!selection().length){layout.querySelector('.ops-campaign-tray')?.remove();ui.campaignTrayVisible=false;}
  }
  return {configure,render,load,attachContract,dismissEditor:()=>closeEditor(true),reset:()=>configure(null),get demoCreators(){return demo?.creators||[];},get selectedCreatorIds(){return selection().map(c=>c.id);},get selectionBusy(){return !!(editor?.saving||editor?.pendingCommand);},
    selectionToolbar:renderCampaignTray,
    stateFor:rosterUI};
}

function demoSaveMessage(scope,payload,sent){const key='portfolio_iq_messages';const rows=JSON.parse(localStorage.getItem(key)||'[]');rows.push({scope,...payload,sent,simulation:true,at:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(rows));return {status:sent?'sent':'saved',sent};}
