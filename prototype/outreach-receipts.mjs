import { validateWorkflowEvent } from './campaign-workflow.mjs';
const providerId=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{8,256}$/.test(v);
export function overlayOutreachReceipts(journey,rows) {
  const receipts=(rows||[]).filter(r=>r.campaignId===journey.campaignId&&r.assignmentId===journey.assignmentId&&r.creatorId===journey.creatorId&&providerId(r.providerMessageId)&&providerId(r.providerThreadId)).map(r=>{
    if(r.invitationEvent?.kind!=='outreach'||r.invitationEvent?.source!=='integration'||r.invitationEvent?.certainty!=='confirmed')return null;
    let event=null;
    try {
      event=validateWorkflowEvent(r.invitationEvent);
    } catch{if(r.sentAt||r.invitationEvent.at)return null;}
    return {id:r.id,campaignId:r.campaignId,assignmentId:r.assignmentId,creatorId:r.creatorId,providerMessageId:r.providerMessageId,providerThreadId:r.providerThreadId,sentAt:r.sentAt||event?.at||null,gmailPermalink:`https://mail.google.com/mail/u/0/#all/${r.providerThreadId}`,invitationEvent:event,confirmed:true,timestampNeedsReview:!event};
  }).filter(Boolean);
  const events=[...(journey.workflowEvents||[])],seen=new Set(events.map(e=>e.id));
  for(const r of receipts)if(r.invitationEvent&&!seen.has(r.invitationEvent.id)){events.push(r.invitationEvent);seen.add(r.invitationEvent.id);}
  return {...journey,workflowEvents:events,outreachReceipts:receipts};
}
