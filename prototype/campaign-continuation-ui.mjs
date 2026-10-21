import {displayDate,displayDateTime} from './date-format.mjs';
import { CONTINUATION_FACT_FIELDS, safeContinuationUrl, continuationDateKnown, continuationLocalInstant } from './campaign-continuation.mjs';
import { renderContinuationAgents, installContinuationAgentsUI, clearManagedContinuationCache } from './managed-continuation-ui.mjs';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const words=value=>String(value||'unknown').replaceAll('_',' ');
const dateLabel=(record,kind='occurred')=>record?.[kind+'Precision']==='day'?`${displayDate(record[kind+'On'],'UTC')} (${record[kind+'Timezone']}; day only)`
  :displayDateTime(record?.[kind==='source'?'sourceDate':'occurredAt'],record?.[kind+'Timezone']||'America/Los_Angeles');
const states=new Map();
const rerenders=new Set();
const stateFor=id=>{if(!states.has(id))states.set(id,{items:null,detail:null,context:null,busy:false,error:null,notice:null});return states.get(id);};
export const clearContinuationCache=()=>{for(const state of states.values())clearTimeout(state.expiryTimer);states.clear();clearManagedContinuationCache();};
export const continuationUIState=id=>states.get(id);
export function invalidateContinuationSelection(campaignId){
  const state=states.get(campaignId);if(!state)return;
  state.selectionVersion=(state.selectionVersion||0)+1;state.assignmentRequest=Symbol();
  state.context=null;state.detail=null;state.agentBriefing=null;state.staffDraft={};clearTimeout(state.expiryTimer);
}
const path=id=>'/api/campaigns/'+encodeURIComponent(id)+'/continuation';
const unwrap=result=>result?.data??result;
export function currentCachedContinuation(context,now=Date.now()){
  if(!context||context.freshness!=='current'||now<Date.parse(context.validUntil))return context;
  return {...context,phase:'unknown',agentPhase:'unknown',freshness:'stale',workflowComplete:false,activeManagement:true,requiresHumanReview:true,
    reviewReasons:[...new Set([...(context.reviewReasons||[]),'stale_context'])],
    attention:(context.attention||[]).map(item=>item.category==='review'?{...item,status:'open'}:item),
    nextParty:'Our team',nextAction:'Refresh the linked sources and review the changed evidence.'};
}
function saveContext(state,context){
  clearTimeout(state.expiryTimer);state.agentBriefing=null;state.context=currentCachedContinuation(context);
  const wait=Date.parse(context.validUntil)-Date.now();
  if(state.context?.freshness==='current'&&wait>0){state.expiryTimer=setTimeout(()=>{state.context=currentCachedContinuation(state.context);for(const render of rerenders)render();},Math.min(wait+1,2147483647));state.expiryTimer.unref?.();}
}
export async function loadContinuationAssignment(campaign,assignmentId,requestJson){
  const state=stateFor(campaign.id);state.context=null;state.agentBriefing=null;clearTimeout(state.expiryTimer);const requestToken=Symbol();state.assignmentRequest=requestToken;
  const context=unwrap(await requestJson(path(campaign.id)+'?assignmentId='+encodeURIComponent(assignmentId)));
  if(states.get(campaign.id)!==state||state.assignmentRequest!==requestToken)return;
  if(context?.binding?.campaignId!==campaign.id||context.binding.assignmentId!==assignmentId)throw new Error('The saved collaboration match could not be verified.');
  saveContext(state,context);
}
export async function loadContinuationAgentBriefing(campaign,requestJson){
  const state=stateFor(campaign.id),context=currentCachedContinuation(state.context),selection=state.selectionVersion;
  if(!context||context.freshness!=='current')throw new Error('Reload current evidence before preparing an agent briefing.');
  const result=unwrap(await requestJson(path(campaign.id)+'?assignmentId='+encodeURIComponent(context.binding.assignmentId)+'&view=agent_context'));
  if(states.get(campaign.id)!==state||state.selectionVersion!==selection||state.context?.contextFingerprint!==context.contextFingerprint)return;
  if(result?.binding?.campaignId!==campaign.id||result.binding.assignmentId!==context.binding.assignmentId
    ||result.contextFingerprint!==context.contextFingerprint)throw Object.assign(new Error('The campaign evidence changed. Reload it before preparing the briefing.'),{status:409});
  if(result.dispatchAvailable!==false||!Array.isArray(result.tasks))throw new Error('The reviewed agent briefing is unavailable.');
  state.agentBriefing=result;
}
function renderAgentBriefing(state){
  const context=currentCachedContinuation(state.context),briefing=state.agentBriefing;
  if(!context||context.freshness!=='current')return '';
  const names={paid_specialist:'Paid Campaign Specialist',seeding_specialist:'Seeding Campaign Specialist',writer:'Correspondence Writer'};
  return `<section class="wf-tool" aria-label="Agent briefing"><h3>Prepare an agent briefing</h3><p>Review the campaign information and instructions for the specialist and writer. This does not start a Fleet task.</p>
    <button type="button" class="button button--secondary" data-continuation="agent-context" ${state.busy?'disabled':''}>Prepare briefing for review</button>
    ${briefing&&briefing.contextFingerprint===context.contextFingerprint&&Date.parse(briefing.validUntil)>Date.now()?`<p role="status">${briefing.status==='unavailable'?'Current evidence is insufficient for an agent briefing. Refresh the sources and review missing facts.':'Briefing prepared for review. Sending it to the hosted agents requires a separately approved connection.'}</p>
    ${briefing.tasks.map(task=>`<details><summary>${esc(names[task.role]||words(task.role))}</summary><p>${esc(task.task)}</p></details>`).join('')}
    <details><summary>Exact briefing record</summary><pre>${esc(JSON.stringify(briefing,null,2))}</pre></details>`:''}</section>`;
}
const phaseLabels={unknown:'Needs review',outreach:'Outreach',terms:'Negotiation',contract:'Contract preparation',signature:'Contract signature',address:'Shipping details',
  delivery:'Shipment and delivery',draft:'Awaiting draft',review:'Content review',publication:'Awaiting publication',documents:'Closure requirements',complete:'Content workflow complete',
  form:'Form review',warehouse:'Warehouse handoff',receipt:'Creator receipt',content:'Content creation',video:'Publication review'};
const link=(url,label)=>safeContinuationUrl(url)?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`:'Source link unavailable';
export function renderContinuationContext(context) {
  context=currentCachedContinuation(context);
  if(!context)return '';
  return `<section class="wf-tool" aria-label="Current imported collaboration"><h3>${esc(phaseLabels[context.phase]||words(context.phase))}</h3>
    <p>${context.freshness==='current'?'Evidence checked':'Sources need refreshing'} · ${esc(words(context.coverage))} coverage · Staff-managed continuation</p>
    ${context.contactStopState==='stopped'?'<p role="alert">This creator asked us to stop contacting them. Do not initiate outreach.</p>':''}
    ${context.phase==='unknown'&&context.lastSupportedPhase!=='unknown'?`<p>Last supported phase: ${esc(phaseLabels[context.lastSupportedPhase]||words(context.lastSupportedPhase))}. This is historical evidence.</p>`:''}
    <dl class="continuation-attention">${(context.attention||[]).map(a=>`<div><dt>${esc(words(a.category))}</dt><dd>${esc(words(a.status))}</dd></div>`).join('')}</dl>
    <p><strong>Next:</strong> ${esc(context.nextAction)}</p><p>Responsible: ${esc(context.nextParty)}</p>
    ${(context.reviewReasons||[]).length?`<details><summary>Review needed</summary><p>${context.reviewReasons.map(words).map(esc).join(' · ')}</p></details>`:''}
    <details><summary>Source records and dates</summary>${(context.evidenceReferences||[]).map(e=>`<p>${link(e.sourceUrl,'Open evidence')} · ${esc(dateLabel(e,'source'))}</p>`).join('')}</details></section>`;
}
function evidenceRecord(record,packet,field,editable) {
  const evidence=record.evidenceIds.map(id=>packet.evidence.find(e=>e.id===id)).filter(Boolean);
  const label=record.kind?words(record.kind):`${words(record.category)} · ${words(record.requirement)} · ${words(record.status)}`;
  return `<div class="wf-tool"><label class="wf-check">${editable?`<input type="checkbox" name="${field}" value="${esc(record.id)}">`:''}<strong>${esc(label)}</strong></label>
    ${record.value?`<p>${Object.entries(record.value).map(([key,value])=>esc(words(key))+': '+esc(value??'unknown')).join(' · ')}</p>`:''}
    <p>${esc(words(record.authority))} · ${esc(record.kind?dateLabel(record):'See source date')}</p>
    <details><summary>Supporting source evidence</summary>${evidence.map(e=>`<blockquote>${esc(e.excerpt)}</blockquote><p>${link(e.sourceUrl,'Check original source')} · ${esc(dateLabel(e,'source'))}</p>`).join('')}</details></div>`;
}
function staffRecordForm(state){
  const kind=state.staffKind||'receipt',draft=state.staffDraft||{};
  const isFact=Object.hasOwn(CONTINUATION_FACT_FIELDS,kind),hasDeliverable=['draft','approval','post','content_verified'].includes(kind);
  const select=(name,label,values)=>`<label>${label}<select name="${name}" required><option value="">Choose an option</option>${values.map(v=>{const [value,title]=Array.isArray(v)?v:[v,words(v)];return `<option value="${esc(value)}" ${String(draft[name])===value?'selected':''}>${esc(title)}</option>`;}).join('')}</select></label>`;
  const input=(name,label,type='text',{required=true,maxlength=400,attributes=''}={})=>`<label>${label}<input name="${name}" type="${type}" value="${esc(draft[name]??'')}" maxlength="${maxlength}" ${required?'required':''} ${attributes}></label>`;
  const reference=(required=true)=>input('reference','Protected record reference'+(required?'':' (optional)'),'text',{required,maxlength:200});
  let fields='';
  if(kind==='outreach')fields=input('messageId','ID of the message already sent','text',{maxlength:120});
  if(['terms','acceptance'].includes(kind))fields=`<p>Collaboration type: ${esc(state.context.binding.workflowType)}. This record applies to the selected campaign.</p>`;
  if(kind==='terms')fields+=select('agreement','Terms status',['proposed','accepted'])
    +(state.context.binding.workflowType==='Paid'?input('feeAmount','Recorded fee amount (optional)','number',{required:false,attributes:'min="0" max="100000000" step="any"'})
      +input('currency','Currency code, for example USD (required with an amount)','text',{required:false,maxlength:3}):'');
  if(kind==='acceptance')fields+=select('accepted','Creator accepted this collaboration',[['true','Yes'],['false','No']]);
  if(['contract_sent','contract_signed','form_received','form_validated','warehouse_handoff','carrier_delivery','document'].includes(kind))fields+=reference();
  if(kind==='contract_signed')fields+=select('verified','Signature verified in the protected contract',[['true','Yes, verified'],['false','Not yet verified']]);
  if(kind==='shipment')fields=input('carrier','Carrier (optional)','text',{required:false,maxlength:60})
    +input('tracking','Protected tracking record ID (optional)','text',{required:false,maxlength:120})+reference(false)
    +'<p>Provide a tracking record ID or a protected shipment reference. Do not enter a shipping address.</p>';
  if(hasDeliverable)fields=input('deliverableId','Agreed deliverable ID','text',{maxlength:120});
  if(['draft','approval'].includes(kind))fields+=input('revision','Exact draft version');
  if(['draft','post','content_verified'].includes(kind))fields+=input('url','Content link','url');
  if(kind==='document')fields+=select('item','Document or code recorded',[['invoice','Invoice'],['w9','W-9'],['ad_code','Advertising code']])
    +'<p>Keep document contents and private tax or payment information in the protected record. Enter only its reference here.</p>';
  if(kind==='payment')fields=select('status','Recorded payment status',['unknown','open','paid'])+reference(false)
    +'<p>Saving payment evidence requires finance permission. This does not make a payment.</p>';
  if(kind==='rights')fields=select('status','Usage rights status',['unknown','open','fulfilled'])+reference(false);
  if(kind==='deadline')fields=select('target','Agreed deadline applies to',['content','posting','payment','rights'])
    +input('date','Agreed deadline date','date')+input('timezone','Agreed time zone, for example America/Los_Angeles','text',{maxlength:120})
    +'<p>Use an explicitly agreed deadline. Do not calculate it from a shipment, receipt or email date.</p>';
  if(kind==='hold')fields=select('category','Work on hold',['payment','rights','delivery','content','review'])
    +select('open','Hold status',[['true','Open'],['false','Resolved']])
    +`<label>Business reason for the hold or its resolution<textarea name="reason" maxlength="400" required>${esc(draft.reason||'')}</textarea></label>`;
  if(kind==='staff_closed')fields='<p>This records a staff closure decision. Missing milestones and open obligations still remain visible.</p>';
  if(kind==='carrier_delivery')fields+='<p>Carrier delivery records delivery by the carrier. Record creator receipt separately when the creator confirms it.</p>';
  if(isFact&&!hasDeliverable)fields+=input('subjectId','Specific obligation or item ID (optional)','text',{required:false,maxlength:120});
  if(kind==='obligation')fields=select('category','Work to track',['payment','rights','delivery','content','review'])
    +select('requirement','Agreement',['unknown','required','optional','not_applicable'])+select('status','Status',['unknown','open','fulfilled'])
    +`<label>Specific obligation or deliverable ID (when applicable)<input name="subjectId" value="${esc(draft.subjectId||'')}" maxlength="120"></label>`;
  const previous=kind==='obligation'?(state.context.obligations||[]):(state.context.confirmedFacts||[]).filter(f=>f.kind===kind);
  if(previous.length)fields+=`<label>Earlier record being updated<select name="supersedes" data-continuation-existing><option value="">New record; no earlier record replaced</option>${previous.map(r=>`<option value="${esc(r.id)}" ${draft.supersedes===r.id?'selected':''}>${esc(kind==='obligation'?[r.category,r.requirement,r.status,r.subjectId].filter(Boolean).map(words).join(' · '):[words(r.kind),r.subjectId,r.value?.target,r.value?.category,r.value?.item,r.occurredAt].filter(Boolean).join(' · '))}</option>`).join('')}</select></label><p>Select an earlier record only when this evidence updates that same milestone or obligation. Its history stays saved.</p>`;
  const kinds=[...Object.keys(CONTINUATION_FACT_FIELDS),'obligation','contact_stop'];
  const labels={selected:'Creator selected',outreach:'Message already sent (record only)',terms:'Proposed or agreed terms',acceptance:'Creator acceptance or refusal',contract_sent:'Contract sent',contract_signed:'Contract signature',form_received:'Shipping form received',form_validated:'Shipping form validated',warehouse_handoff:'Warehouse handoff',shipment:'Shipment recorded',carrier_delivery:'Carrier delivery',receipt:'Creator confirmed receipt',draft:'Draft received',approval:'Exact draft approved',post:'Post published',content_verified:'Content verified',document:'Protected document or advertising code',payment:'Payment status',rights:'Usage rights status',deadline:'Agreed deadline',hold:'Hold opened or resolved',staff_closed:'Staff closure decision',obligation:'Campaign obligation',contact_stop:'Creator asked us to stop contacting them'};
  const dateEntry=(prefix,label)=>{
    const day=draft[prefix+'Precision']==='day',at=prefix==='source'?'sourceDate':'occurredAt';
    return `<label>${label}: precision<select name="${prefix}Precision" data-continuation-precision><option value="instant" ${day?'':'selected'}>Exact date and time</option><option value="day" ${day?'selected':''}>Verified calendar day</option></select></label>`
      +input(day?prefix+'On':at,day?'Verified date':'Verified date and time',day?'date':'datetime-local')
      +input(prefix+'Timezone','Verified time zone, for example America/Los_Angeles','text',{maxlength:120});
  };
  const occurrence=isFact?`${dateEntry('occurred','When the milestone happened')}
    <p>A verified day keeps the time unknown. Verify the source date separately; a shipment date does not date its spreadsheet record. Leave undated milestones for evidence review.</p>`:'';
  return `<details class="wf-tool"><summary>Record the next milestone</summary><form data-continuation-form="record" class="wf-form">
    <label>What happened?<select name="kind" data-continuation-kind>${kinds.map(v=>`<option value="${v}" ${kind===v?'selected':''}>${esc(labels[v]||words(v))}</option>`).join('')}</select></label>
    ${fields}${occurrence}${input('sourceUrl','Source evidence link','url')}${dateEntry('source','Source record date')}
    <label>Exact relevant source excerpt<textarea name="excerpt" maxlength="1800" required>${esc(draft.excerpt||'')}</textarea></label>
    <p>Use only the relevant business statement. Keep contact details and private documents in their protected records.</p>
    <label class="wf-check"><input type="checkbox" name="confirmed" required>I checked the original source and verified this record for this creator and campaign.</label>
    <button class="button button--primary" ${state.busy?'disabled':''}>Save staff milestone</button></form></details>`;
}
export function createStaffMilestoneCommand(context,f,{idempotencyKey=crypto.randomUUID(),now=Date.now()}={}){
  const kind=f.kind,isFact=Object.hasOwn(CONTINUATION_FACT_FIELDS,kind);
  if(!isFact&&!['obligation','contact_stop'].includes(kind))throw new Error('Choose a supported milestone.');
  if(f.confirmed!=='on')throw new Error('Check the original source and confirm this record before saving.');
  const clean=name=>typeof f[name]==='string'?f[name].trim():'';
  const nullable=name=>clean(name)||null;
  const timestamp=(name,label)=>{const value=clean(name);if(!/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value)
    ||!Number.isFinite(Date.parse(value))||new Date(value.slice(0,10)).toISOString().slice(0,10)!==value.slice(0,10))throw new Error(`Enter ${label}.`);
    const zone=clean(name==='sourceDate'?'sourceTimezone':'occurredTimezone')||Intl.DateTimeFormat().resolvedOptions().timeZone;
    const result=/(Z|[+-]\d\d:\d\d)$/.test(value)?new Date(value).toISOString():continuationLocalInstant(value,zone);
    if(Date.parse(result)>now)throw new Error('Milestone and source dates must not be in the future.');return result;};
  const boolean=name=>{if(!['true','false'].includes(f[name]))throw new Error('Choose whether this milestone was confirmed.');return f[name]==='true';};
  const dateInput=prefix=>{
    const field=prefix==='source'?'sourceDate':'occurredAt';
    if(f[prefix+'Precision']===undefined||f[prefix+'Precision']==='instant')return {[field]:timestamp(field,prefix==='source'?'the source date and time':'when the milestone happened; leave undated milestones for evidence review')};
    if(f[prefix+'Precision']!=='day')throw new Error('Choose exact time or verified calendar day.');
    const value={[field]:null,[prefix+'On']:clean(prefix+'On'),[prefix+'Timezone']:clean(prefix+'Timezone'),[prefix+'Precision']:'day'};
    if(!continuationDateKnown(value,prefix,new Date(now).toISOString()))throw new Error('Milestone and source dates must not be in the future.');
    return value;
  };
  const occurrence=isFact?dateInput('occurred'):{},source=dateInput('source');
  let value;
  switch(kind){
    case 'selected':value={selected:true};break;
    case 'outreach':value={messageId:clean('messageId')};break;
    case 'terms':{
      const amount=clean('feeAmount'),feeAmount=amount===''?null:Number(amount),currency=nullable('currency')?.toUpperCase()??null;
      if(feeAmount!==null&&(!Number.isFinite(feeAmount)||feeAmount<0||feeAmount>100000000||!currency))throw new Error('Enter a valid fee amount and its currency.');
      value={engagementType:context.binding.workflowType,agreement:clean('agreement'),feeAmount,currency};break;
    }
    case 'acceptance':value={engagementType:context.binding.workflowType,accepted:boolean('accepted')};break;
    case 'contract_signed':value={reference:clean('reference'),verified:boolean('verified')};break;
    case 'contract_sent':case 'form_received':case 'form_validated':case 'warehouse_handoff':case 'carrier_delivery':value={reference:clean('reference')};break;
    case 'shipment':
      value={carrier:nullable('carrier'),tracking:nullable('tracking'),reference:nullable('reference')};
      if(!value.tracking&&!value.reference)throw new Error('Provide a tracking record ID or protected shipment reference.');break;
    case 'receipt':value={confirmed:true};break;
    case 'draft':value={deliverableId:clean('deliverableId'),revision:clean('revision'),url:clean('url')};break;
    case 'approval':value={deliverableId:clean('deliverableId'),revision:clean('revision')};break;
    case 'post':case 'content_verified':value={deliverableId:clean('deliverableId'),url:clean('url')};break;
    case 'document':value={item:clean('item'),reference:clean('reference')};break;
    case 'payment':case 'rights':value={status:clean('status'),reference:nullable('reference')};break;
    case 'deadline':value={target:clean('target'),date:clean('date'),timezone:clean('timezone')};break;
    case 'hold':value={category:clean('category'),open:boolean('open'),reason:clean('reason')};break;
    case 'staff_closed':value={closed:true};break;
  }
  const supersedes=f.supersedes?[f.supersedes]:[];
  const record={recordType:kind==='contact_stop'?'contact_stop':kind==='obligation'?'obligation':'fact',
    record:kind==='contact_stop'?{}:kind==='obligation'?{category:f.category,requirement:f.requirement,status:f.status,subjectId:nullable('subjectId'),supersedes}
    :{kind,subjectId:value.deliverableId||nullable('subjectId'),value,...occurrence,supersedes},evidence:{url:f.sourceUrl,excerpt:f.excerpt,...source}};
  return {assignmentId:context.binding.assignmentId,expectedRevision:context.revision??context.revisions.workflowRevision,
    expectedCreatorRevision:kind==='contact_stop'?context.creatorSafetyRevision:context.binding.workflowType==='Seeding'?context.revisions.creatorStateRevision:null,idempotencyKey,record};
}
export function renderContinuationPanel(campaign,{creatorName=id=>id,canEdit=false,preview=false}={}) {
  const state=stateFor(campaign.id),detail=state.detail,packet=detail?.proposal?.packet;
  const reviewable=canEdit&&packet&&['pending_review','proposed','pending','staged'].includes(detail.status)&&!state.busy;
  const ready=canEdit&&detail?.status==='ready'&&detail?.preparation?.status==='ready'&&!state.busy;
  return `<section class="wf-tool continuation-panel" data-continuation-campaign="${esc(campaign.id)}" aria-label="Continue existing campaign work">
    <h2>Continue existing work</h2><p>Review spreadsheet and email evidence, then bring accepted work into this campaign.</p>
    ${preview?'<p class="wf-connection">Sample only. Changes reset on refresh.</p>':''}
    <button type="button" class="button button--secondary" data-continuation="load" ${state.busy?'disabled':''}>${state.busy?'Loading…':'Review existing work'}</button>
    ${state.error?`<p role="alert">${esc(state.error)}</p>`:''}${state.notice?`<p role="status">${esc(state.notice)}</p>`:''}
    ${state.pendingCommand?'<p role="status">The last save has an uncertain outcome. Retrying will submit the exact previous selection or milestone. Reload its result before entering different information.</p>':''}
    ${state.items?`<div class="wf-list">${state.items.map(item=>`<button type="button" class="wf-creator" data-continuation="open" data-proposal="${esc(item.proposalId)}" ${state.busy?'disabled':''}>
      <strong>${esc(creatorName(item.creatorId))}</strong><span>${esc(item.workflowType)} · ${esc(words(item.status))}</span></button>`).join('')||'<p>No staged reviews on this page.</p>'}</div>
      ${state.nextCursor?'<button type="button" class="button button--secondary" data-continuation="more">Next review page</button>':''}`:''}
    ${packet?`<section aria-label="Selected evidence"><h3>${esc(creatorName(packet.binding.creatorId))} · ${esc(packet.binding.workflowType)}</h3>
      <p>Proposed phase: ${esc(phaseLabels[detail.proposalContext?.proposedPhase]||'Needs review')} · ${esc(words(detail.proposalContext?.coverage))} source coverage</p>
      <details ${detail.status==='adopted'?'':'open'}><summary>Review facts and obligations</summary><form data-continuation-form="review">${packet.facts.map(f=>evidenceRecord(f,packet,'factIds',reviewable)).join('')}
      ${packet.obligations.map(o=>evidenceRecord(o,packet,'obligationIds',reviewable)).join('')}
      ${reviewable?'<label class="wf-check"><input type="checkbox" name="checkedSources" required>I checked the selected facts against their original sources and this creator’s campaign.</label><button class="button button--primary">Review selected evidence</button>':''}</form></details>
      ${detail.reviewRequest?.status==='pending_preparation'?'<p role="status">Your selection is saved. Source and assignment checks are pending. Reload this review when the check is ready.</p>':''}
      ${detail.status==='refresh_required'?'<p role="status">The source check expired or changed. Refresh and stage current evidence before adopting this work.</p>':''}
      ${ready?'<p>Source and assignment checks passed for this selection.</p><button type="button" class="button button--primary" data-continuation="adopt">Adopt reviewed work</button>':''}
      ${canEdit&&detail.status!=='adopted'&&!state.busy?'<button type="button" class="button button--secondary" data-continuation="reject">Dismiss this proposal</button>':''}
      <button type="button" class="button button--secondary" data-continuation="refresh">Reload this review</button></section>`:''}
    ${renderContinuationContext(state.context)}${!preview?renderAgentBriefing(state):''}${!preview?renderContinuationAgents(currentCachedContinuation(state.context),{canEdit}):''}${canEdit&&state.context?staffRecordForm(state):''}</section>`;
}
export function installContinuationUI({root,getCampaign,canEdit,requestJson,rerender}) {
  rerenders.add(rerender);
  installContinuationAgentsUI({root,requestJson,rerender,getContext:(campaignId,assignmentId)=>{
    const context=currentCachedContinuation(states.get(campaignId)?.context);return context?.binding?.assignmentId===assignmentId?context:null;
  },canEdit:campaignId=>{const campaign=getCampaign(campaignId);return Boolean(campaign&&canEdit(campaign));}});
  const resolve=target=>{const section=target.closest('[data-continuation-campaign]');const campaign=section&&getCampaign(section.dataset.continuationCampaign);
    return campaign?{campaign,state:stateFor(campaign.id)}:{};};
  async function detail(campaign,state,proposalId){
    const selectionVersion=state.selectionVersion;
    const result=unwrap(await requestJson(path(campaign.id)+'?proposalId='+encodeURIComponent(proposalId)));
    if(states.get(campaign.id)!==state||state.selectionVersion!==selectionVersion)return;
    if(result?.proposal?.packet?.binding?.campaignId!==campaign.id)throw new Error('The campaign match could not be verified.');
    state.detail=result;state.context=null;clearTimeout(state.expiryTimer);
    if(state.items)state.items=state.items.map(item=>item.proposalId===proposalId?{...item,status:result.status}:item);
    const pending=state.pendingCommand;
    if(pending?.command.proposalId===proposalId&&((pending.action==='adopt'&&result.status==='adopted')||(pending.action==='reject'&&result.status==='rejected')
      ||(pending.action==='review'&&result.reviewRequest?.id===pending.command.idempotencyKey)))state.pendingCommand=null;
    if(result.status==='adopted') await loadContinuationAssignment(campaign,result.proposal.packet.binding.assignmentId,requestJson);
  }
  root.addEventListener('change',event=>{
    if(event.target.matches('[data-continuation-precision]')){
      const {state}=resolve(event.target);if(!state||state.busy)return;
      state.staffDraft=Object.fromEntries(new FormData(event.target.closest('form')));rerender();
      const form=root.querySelector('[data-continuation-form="record"]');if(form)form.closest('details').open=true;return;
    }
    if(event.target.matches('[data-continuation-existing]')){
      const {state}=resolve(event.target);if(!state||state.busy)return;
      state.staffDraft=Object.fromEntries(new FormData(event.target.closest('form')));
      const kind=state.staffKind||'receipt',prior=(kind==='obligation'?state.context.obligations:state.context.confirmedFacts.filter(f=>f.kind===kind)).find(r=>r.id===event.target.value);
      if(prior){
        state.staffDraft.subjectId=prior.subjectId||'';
        if(kind==='obligation')Object.assign(state.staffDraft,{category:prior.category,requirement:prior.requirement,status:prior.status});
        else for(const key of ['deliverableId','target','category','item'])if(Object.hasOwn(prior.value,key))state.staffDraft[key]=prior.value[key];
      }
      rerender();const form=root.querySelector('[data-continuation-form="record"]');if(form)form.closest('details').open=true;return;
    }
    if(!event.target.matches('[data-continuation-kind]'))return;
    const {state}=resolve(event.target);if(!state||state.busy)return;
    state.staffKind=event.target.value;state.staffDraft={};rerender();
    const form=root.querySelector('[data-continuation-form="record"]');if(form){form.closest('details').open=true;form.querySelector('[data-continuation-kind]').focus();}
  });
  async function act(campaign,state,work){
    if(state.busy)return;state.busy=true;state.error=null;state.notice=null;rerender();
    try{await work();}catch(error){
      if([400,401,403,404,409].includes(error.status))state.pendingCommand=null;
      if(error.status===409){state.context=null;state.agentBriefing=null;if(state.detail)state.detail={...state.detail,status:'refresh_required',preparation:null};}
      state.error=error.message||'Review unavailable. Reload the evidence.';
    }
    finally{state.busy=false;if(states.get(campaign.id)===state)rerender();}
  }
  root.addEventListener('click',async event=>{
    const button=event.target.closest('[data-continuation]');if(!button)return;
    const {campaign,state}=resolve(button);if(!state)return;
    const action=button.dataset.continuation;
    await act(campaign,state,async()=>{
      if(['load','more'].includes(action)){
        const result=unwrap(await requestJson(path(campaign.id)+(action==='more'&&state.nextCursor?'?cursor='+encodeURIComponent(state.nextCursor):'')));
        if(states.get(campaign.id)!==state)return;
        if(!Array.isArray(result.items))throw new Error('The review list is unavailable.');
        state.items=result.items;state.nextCursor=result.nextCursor;state.detail=null;state.context=null;
      } else if(action==='agent-context')await loadContinuationAgentBriefing(campaign,requestJson);
      else if(['open','refresh'].includes(action)) await detail(campaign,state,button.dataset.proposal||state.detail.proposal.packet.id);
      else if(['adopt','reject'].includes(action)){
        const selectionVersion=state.selectionVersion;
        if(!canEdit(campaign))throw new Error('Staff editing permission is required.');
        const d=state.detail;if(!d)throw new Error('Reload this review.');
        const command={proposalId:d.proposal.packet.id,fingerprint:action==='adopt'?d.preparation?.fingerprint:d.proposal.fingerprint,idempotencyKey:crypto.randomUUID(),
          ...(action==='adopt'?{preparationId:d.preparation?.id}:{})};
        // Keep an uncertain request key until its outcome is read back.
        state.pendingCommand??={action,command};
        if(state.pendingCommand.action!==action||state.pendingCommand.command.proposalId!==command.proposalId)throw new Error('Reload and resolve the previous request first.');
        await requestJson(path(campaign.id)+'/'+action,{method:'POST',csrf:true,body:state.pendingCommand.command});
        state.pendingCommand=null;if(state.selectionVersion!==selectionVersion)return;await detail(campaign,state,command.proposalId);
        state.notice=action==='adopt'?'Reviewed work is saved in this campaign.':'Proposal dismissed. Existing campaign records are unchanged.';
      }
    });
  });
  root.addEventListener('submit',async event=>{
    if(event.target.matches('[data-continuation-form="record"]')){
      event.preventDefault();const {campaign,state}=resolve(event.target);if(!state)return;
      const f=Object.fromEntries(new FormData(event.target));state.staffDraft=f;
      await act(campaign,state,async()=>{
        const selectionVersion=state.selectionVersion;
        if(!canEdit(campaign)||f.confirmed!=='on'||!state.context)throw new Error('Verified staff evidence is required.');
        const command=createStaffMilestoneCommand(state.context,f);
        state.pendingCommand??={action:'record',command};
        if(state.pendingCommand.action!=='record'||state.pendingCommand.command.assignmentId!==command.assignmentId)throw new Error('Resolve the previous request before saving another milestone.');
        await requestJson(path(campaign.id)+'/record',{method:'POST',csrf:true,body:state.pendingCommand.command});
        state.pendingCommand=null;if(state.selectionVersion!==selectionVersion)return;await loadContinuationAssignment(campaign,command.assignmentId,requestJson);state.staffDraft={};state.notice='Staff milestone saved. The collaboration has been rechecked.';
      });return;
    }
    if(!event.target.matches('[data-continuation-form="review"]'))return;event.preventDefault();
    const {campaign,state}=resolve(event.target);if(!state)return;
    const form=new FormData(event.target);
    await act(campaign,state,async()=>{
      const selectionVersion=state.selectionVersion;
      if(!canEdit(campaign)||form.get('checkedSources')!=='on')throw new Error('Check the original sources before reviewing the selection.');
      const d=state.detail;if(!d)throw new Error('Reload this review.');
      const command={proposalId:d.proposal.packet.id,fingerprint:d.proposal.fingerprint,factIds:form.getAll('factIds'),obligationIds:form.getAll('obligationIds'),idempotencyKey:crypto.randomUUID()};
      if(!command.factIds.length&&!command.obligationIds.length)throw new Error('Select at least one supported fact or obligation.');
      state.pendingCommand??={action:'review',command};
      if(state.pendingCommand.action!=='review'||state.pendingCommand.command.proposalId!==command.proposalId)throw new Error('Reload and resolve the previous request first.');
      await requestJson(path(campaign.id)+'/review',{method:'POST',csrf:true,body:state.pendingCommand.command});
      state.pendingCommand=null;if(state.selectionVersion!==selectionVersion)return;await detail(campaign,state,command.proposalId);state.notice='Review selection saved for source and assignment checks.';
    });
  });
}
