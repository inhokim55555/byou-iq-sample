import {displayDate,displayDateTime} from './date-format.mjs';
import {interfaceText} from './ui-language.mjs';
const dateValue=(value,now)=>{
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value))return null;
  const at=Date.parse(value);return Number.isFinite(at)&&at<=now?at:null;
};
const dateLabel=at=>displayDateTime(at,'America/Los_Angeles',undefined,true);
export function progressSourceUrl(value){
  try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='mail.google.com'&&!url.username&&!url.password&&!url.search&&url.hash?url.href:null;}catch{return null;}
}
const note=value=>typeof value==='string'&&value.trim()&&value.length<=2000?value.trim():null;
export function creatorProgressSummary(assignment={},monitor={},now=Date.now(),locale='en'){
  const context=assignment.progressContext;
  const scoped=context?.state==='ready';
  const threads=scoped&&Array.isArray(context.communications)?context.communications.filter(t=>t.campaignId===assignment.campaignId&&t.assignmentId===assignment.id&&t.creatorId===assignment.creatorId&&t.status==='verified'&&progressSourceUrl(t.href)&&dateValue(t.latestMessageAt,now)!==null).sort((a,b)=>Date.parse(b.latestMessageAt)-Date.parse(a.latestMessageAt)):[];
  const latest=threads[0],at=latest?dateValue(latest.latestMessageAt,now):null;
  const raw=note(assignment.phaseReason),managerNote=raw&&!/^Email inference\b|^Phase [1-5] selected by a campaign manager from the campaign roster\.$/.test(raw)?raw:null;
  const pending=scoped&&Number.isSafeInteger(context.pendingReplyCount)&&context.pendingReplyCount>0;
  let nextStep=!scoped?'Reload the campaign to check saved correspondence.':pending?'Review the latest creator reply before updating progress.':note(latest?.nextAction)||(latest?'Open the linked conversation to confirm the next step.':'Review the campaign assignment to record the next step.');
  let text=managerNote||(!scoped?'Progress context is unavailable.':pending?'A creator reply is awaiting manager review.':note(latest?.nextAction)?`Recorded next step: ${note(latest.nextAction)}`:latest?'A verified campaign conversation is linked. No specific progress update has been recorded yet.':'No verified progress update is recorded yet.');
  const originalText=locale==='ko'&&managerNote?managerNote:null,originalNextStep=locale==='ko'&&scoped&&!pending&&note(latest?.nextAction)?latest.nextAction:null;
  const localText=(source,translation,missing)=>translation?.source===source&&typeof translation.ko==='string'&&translation.ko.trim()?translation.ko:!/[A-Za-z]/.test(source)?source:missing;
  if(locale==='ko'){
    if(managerNote)text=localText(assignment.phaseReason,context?.phaseReasonTranslation,'한국어 진행 요약이 아직 준비되지 않았습니다.');
    else if(originalNextStep)text='기록된 다음 조치: '+localText(latest.nextAction,latest.nextActionTranslation,'한국어 번역이 아직 준비되지 않았습니다.');
    if(originalNextStep)nextStep=localText(latest.nextAction,latest.nextActionTranslation,'한국어 다음 조치가 아직 준비되지 않았습니다.');
    text=interfaceText(text,locale);nextStep=interfaceText(nextStep,locale);
  }
  const checked=dateValue(monitor.emailLastCheckedAt,now);
  let coverage=!scoped?'Email context is unavailable. The saved manager note is shown when present.':monitor.emailEnabled===false?'Live email checks are off. This overview uses saved correspondence.':monitor.emailEnabled===true&&checked!==null?`Email checks last completed ${dateLabel(checked)}.`:'Recent email coverage is unconfirmed.';
  if(at!==null&&now-at>7*24*60*60*1000)coverage+=' The linked conversation has not been updated in over 7 days.';
  return {text,managerNote,nextStep,originalText,originalNextStep,sourceUrl:latest?progressSourceUrl(latest.href):null,sourceLabel:at!==null?`Recorded email update · ${dateLabel(at)}`:null,coverage,pending};
}
