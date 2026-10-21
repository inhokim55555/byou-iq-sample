const states=new Map();
const rerenders=new Set();
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const words=value=>String(value||'unknown').replaceAll('_',' ');
const names={paid_specialist:'Paid Campaign Specialist',seeding_specialist:'Seeding Campaign Specialist',writer:'Correspondence Writer'};
const phaseLabel=value=>value==='complete'?'Content workflow complete':words(value);
const key=context=>context.binding.campaignId+':'+context.binding.assignmentId;
const current=context=>context?.freshness==='current'&&Number.isFinite(Date.parse(context.validUntil))&&Date.now()<Date.parse(context.validUntil);
function stateFor(context){
 const k=key(context);let state=states.get(k);
 if(!state||state.contextFingerprint!==context.contextFingerprint){clearTimeout(state?.expiryTimer);state={contextFingerprint:context.contextFingerprint,data:null,busy:false,error:null,pending:new Map(),requestToken:null};states.set(k,state);}
 return state;
}
export function clearManagedContinuationCache(){for(const state of states.values())clearTimeout(state.expiryTimer);states.clear();}
function scheduleExpiry(state,context){
 clearTimeout(state.expiryTimer);
 const now=Date.now(),future=[context.validUntil,...(state.data?.tasks||[]).map(e=>e.task.validUntil)].map(Date.parse).filter(value=>Number.isFinite(value)&&value>now);
 if(future.length){state.expiryTimer=setTimeout(()=>{for(const render of rerenders)render();},Math.min(Math.min(...future)-now+1,2147483647));state.expiryTimer.unref?.();}
}
export const managedContinuationUIState=context=>states.get(key(context));
const endpoint=context=>'/api/campaigns/'+encodeURIComponent(context.binding.campaignId)+'/continuation-agents';
function executions(entry,{currentMatch=false,canEdit=false,busy=false}={}){
 return (entry.executions||[]).map(execution=>{
  const result=execution.result;
  const guidance=currentMatch&&execution.status==='internal_guidance_requires_review'?(result?.guidance||[]).filter(g=>g.semanticSupportVerified===false):[];
  return '<section class="wf-tool"><h4>'+esc(words(execution.status))+'</h4>'
   +(guidance.length?'<p>Internal guidance for staff review. Check every interpretation against its linked evidence.</p>'+guidance.map(g=>'<h5>'+esc(names[g.role]||words(g.role))+'</h5>'
    +(g.findings||[]).map(f=>'<p>'+esc(f.text)+'</p><p>Evidence: '+esc((f.evidenceIds||[]).join(', '))+'</p>').join('')
    +(g.unresolved||[]).map(t=>'<p>Needs review: '+esc(t)+'</p>').join('')).join(''):'')
   +(canEdit?'<button type="button" class="button button--secondary" data-continuation-agent="reconcile" data-task="'+esc(entry.task.id)+'" data-execution="'+esc(execution.executionId)+'" '+(busy?'disabled':'')+'>Check existing run</button>':'')
   +(canEdit&&['unknown','stale'].includes(execution.status)?'<button type="button" class="button button--secondary" data-continuation-agent="recover" data-task="'+esc(entry.task.id)+'" data-execution="'+esc(execution.executionId)+'" '+(busy?'disabled':'')+'>Recover saved run receipt</button>':'')
   +'<p>Checking or recovering an existing run does not start another task.</p></section>';
 }).join('');
}
export function renderContinuationAgents(context,{canEdit=false}={}){
 if(!context?.binding)return '';
 const state=stateFor(context),disabled=state.busy?'disabled':'',data=state.data;
 scheduleExpiry(state,context);
 return '<section class="wf-tool" aria-label="Campaign agent guidance" data-continuation-agent-panel data-campaign="'+esc(context.binding.campaignId)+'" data-assignment="'+esc(context.binding.assignmentId)+'">'
  +'<h3>Campaign agent guidance</h3><p>The specialist and writer can review the current campaign phase and remaining work. Results are internal guidance for your review.</p>'
  +'<button type="button" class="button button--secondary" data-continuation-agent="load" '+disabled+'>Load reviewed tasks</button>'
  +(state.error?'<p role="alert">'+esc(state.error)+'</p>':'')
  +(data?'<p>Budget status: '+esc(words(data.budget?.accountingStatus||'unavailable'))+'. Recorded spend: '+(Number.isFinite(data.budget?.spentUsd)?'$'+esc(data.budget.spentUsd.toFixed(2)):'unavailable')+'.</p>'
   +'<p>The approved target is $25. A task already admitted may finish above that target.</p>'
   +(!data.executionAvailable?'<p>Hosted execution is unavailable until its approved connection is enabled.</p>':'')
   +(canEdit&&current(context)?'<button type="button" class="button button--secondary" data-continuation-agent="prepare" '+disabled+'>Prepare current campaign tasks for review</button>':'')
   +(data.tasks||[]).map(entry=>{
    const task=entry.task,matched=task.handoff?.contextFingerprint===context.contextFingerprint,ready=current(context)&&entry.current!==false&&matched&&Date.now()<Date.parse(task.validUntil);
    const canStart=!entry.executions?.length||entry.executions.some(e=>e.status==='in_flight'&&e.result?.reason==='NEXT_ROLE_REQUIRES_EXPLICIT_START');
    return '<section class="wf-tool" data-reviewed-task="'+esc(task.id)+'"><h4>'+esc(phaseLabel(task.handoff?.briefing?.phase))+' · '+esc(task.handoff?.binding?.workflowType)+'</h4>'
     +'<p>'+(ready?'Matches the current reviewed campaign.':'This task is historical. Prepare a new task from current evidence.')+'</p>'
     +(task.tasks||[]).map(t=>'<details><summary>Review '+esc(names[t.role]||words(t.role))+' instructions</summary><pre>'+esc(t.task)+'</pre></details>').join('')
     +(canEdit&&ready&&!entry.approval?'<label class="wf-check"><input type="checkbox" data-continuation-agent-review>I reviewed the campaign evidence and both tasks.</label><button type="button" class="button button--secondary" data-continuation-agent="approve" data-task="'+esc(task.id)+'" '+disabled+'>Approve these tasks</button>':'')
     +(canEdit&&ready&&canStart&&entry.approval&&data.executionAvailable?'<p>Exact tasks approved. Starting them uses the approved Fleet budget.</p><button type="button" class="button button--primary" data-continuation-agent="start" data-task="'+esc(task.id)+'" '+disabled+'>'+(entry.executions?.length?'Run remaining approved task':'Run approved tasks')+'</button>':'')
     +executions(entry,{currentMatch:ready,canEdit,busy:state.busy})+'</section>';
   }).join(''):'')
  +'</section>';
}
export function createManagedContinuationUICommand(action,context,entry,{idempotencyKey,executionId}={}){
 if(!['reconcile','recover'].includes(action)&&!current(context))throw new Error('Reload current evidence before using agent tasks.');
 if(action==='prepare')return {assignmentId:context.binding.assignmentId,idempotencyKey};
 if(!entry||entry.task.handoff?.binding?.assignmentId!==context.binding.assignmentId||entry.task.handoff.binding.campaignId!==context.binding.campaignId)
  throw new Error('Reload the task for this collaboration.');
 const task=entry.task;
 if(action==='reconcile'||action==='recover'){
  if(!entry.executions?.some(e=>e.executionId===executionId))throw new Error('Select a saved run for this task.');
  return {taskId:task.id,executionId};
 }
 if(task.handoff.contextFingerprint!==context.contextFingerprint||Date.now()>=Date.parse(task.validUntil))throw new Error('The evidence changed. Prepare and review a new task.');
 if(action==='approve')return {taskId:task.id,fingerprint:task.fingerprint,idempotencyKey};
 if(action==='start'&&entry.approval?.taskId===task.id&&entry.approval.fingerprint===task.fingerprint)
  return {taskId:task.id,approvalReceiptId:entry.approval.id,fingerprint:task.fingerprint,idempotencyKey};
 throw new Error('Review and approve the exact tasks first.');
}
export function installContinuationAgentsUI({root,requestJson,getContext,canEdit,rerender}){
 rerenders.add(rerender);
 root.addEventListener('click',async event=>{
  const button=event.target.closest?.('[data-continuation-agent]'),panel=button?.closest('[data-continuation-agent-panel]');if(!panel)return;
  const {campaign:campaignId,assignment:assignmentId}=panel.dataset,context=getContext(campaignId,assignmentId);
  if(!context?.binding)return;
  const state=stateFor(context),action=button.dataset.continuationAgent;if(state.busy)return;
  const mutable=['prepare','approve','start','reconcile','recover'].includes(action);
  if(mutable&&!canEdit(campaignId))return;
  const entry=state.data?.tasks?.find(e=>e.task.id===button.dataset.task);
  if(action==='approve'&&!button.closest('[data-reviewed-task]')?.querySelector('[data-continuation-agent-review]')?.checked){
   state.error='Check the evidence and confirm that you reviewed both tasks.';rerender();return;
  }
  const token=Symbol();state.requestToken=token;state.busy=true;state.error=null;rerender();
  let pendingKey;
  try{
   if(action!=='load'){
    pendingKey=[action,entry?.task?.id||assignmentId,entry?.task?.fingerprint||context.contextFingerprint,button.dataset.execution||''].join(':');
    let command=state.pending.get(pendingKey);
    if(!command){command=createManagedContinuationUICommand(action,context,entry,{idempotencyKey:crypto.randomUUID(),executionId:button.dataset.execution});state.pending.set(pendingKey,command);}
    await requestJson(endpoint(context)+'/'+action,{method:'POST',body:command,csrf:true});
   }
   const result=await requestJson(endpoint(context)+'?assignmentId='+encodeURIComponent(assignmentId));
   const still=getContext(campaignId,assignmentId);
   if(states.get(key(context))!==state||state.requestToken!==token||still?.contextFingerprint!==context.contextFingerprint)return;
   const data=result?.data??result;
   if(!data||!Array.isArray(data.tasks)||data.tasks.some(e=>e.task?.handoff?.binding?.campaignId!==campaignId||e.task.handoff.binding.assignmentId!==assignmentId))
    throw new Error('The task list did not match this collaboration.');
   state.data=data;
   if(pendingKey)state.pending.delete(pendingKey);
  }catch(error){
   if(states.get(key(context))===state&&state.requestToken===token)state.error=error.status===409?'The campaign changed. Reload its evidence before preparing new tasks.':
    'The result could not be confirmed. Load the saved tasks before retrying.';
  }finally{if(states.get(key(context))===state&&state.requestToken===token){state.busy=false;rerender();}}
 });
}
