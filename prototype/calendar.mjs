import {displayDate,displayDateTime} from './date-format.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const localDate=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const utc=v=>new Date(`${v}T12:00:00Z`);
const iso=d=>d.toISOString().slice(0,10);
const label=v=>displayDate(v,'UTC');
export function monthDates(month){
 const first=utc(`${month}-01`);first.setUTCDate(first.getUTCDate()-first.getUTCDay());
 return Array.from({length:42},(_,i)=>{const d=new Date(first);d.setUTCDate(d.getUTCDate()+i);return iso(d);});
}
export function shiftMonth(month,offset){const d=utc(`${month}-01`);d.setUTCMonth(d.getUTCMonth()+offset);return iso(d).slice(0,7);}
export const createCalendarState=()=>({month:localDate().slice(0,7),day:localDate(),mode:typeof window!=='undefined'&&window.matchMedia?.('(max-width: 620px)').matches?'agenda':'month',filter:'all',events:[],unscheduledItems:[],unscheduledTotal:0,unscheduledOffset:0,loading:false,loaded:false,error:null,editor:null,pending:null,busy:false,canCreate:false,deleted:false});
export function eventCategory(e,today=localDate()){
 if(e.kind==='custom')return 'custom';
 if(e.kind!=='campaign')return ['posted','completed','cancelled'].includes(e.status)?'past':'due';
 if(['completed','cancelled','archived','closed'].includes(e.status)||(e.end&&e.end<today))return 'past';
 if(e.start&&e.start>today)return 'upcoming';
 if(e.start&&e.end&&e.start<=today&&e.end>=today)return 'running';
 return 'scheduled';
}
const categoryNames={running:'Running',upcoming:'Upcoming',past:'Past / completed',due:'Creator deadline',custom:'Event',scheduled:'Partial dates'};
const eventKey=e=>`${e.kind}:${e.id}`;
export const eventsOnDay=(events,date)=>events.filter(e=>(e.start||e.end)<=date&&(e.end||e.start)>=date);
const campaignName=e=>`${e.type?`${e.type} · `:''}${e.title}`;
const campaignGradient=(index,total)=>{
 const position=total===1?.5:index/(total-1);
 const channel=(light,dark)=>Math.round(light+(dark-light)*position).toString(16).padStart(2,'0');
 return `#${channel(168,20)}${channel(211,70)}${channel(158,48)}`;
};
const campaignColorsFor=events=>{
 const campaigns=[...new Map(events.filter(e=>e.kind==='campaign').map(e=>[String(e.id),e])).values()]
  .sort((a,b)=>campaignName(a).localeCompare(campaignName(b))||String(a.id).localeCompare(String(b.id)));
 return new Map(campaigns.map((e,index)=>[String(e.id),campaignGradient(index,campaigns.length)]));
};
const eventButton=(e,compact=false,colors=new Map())=>`<button type="button" class="cal-event cal-${eventCategory(e)}" ${e.kind==='campaign'?`style="--event-color:${colors.get(String(e.id))}"`:''} data-cal="open" data-key="${esc(eventKey(e))}" title="${esc(`${e.title} | ${e.type||e.campaignName||categoryNames[eventCategory(e)]}`)}"><span>${e.kind==='campaign'&&e.type?`<b class="cal-type">${esc(e.type)}</b> · `:''}${esc(e.title)}</span>${!compact&&e.kind!=='campaign'?`<small>${esc(e.campaignName||categoryNames[eventCategory(e)])}</small>`:''}</button>`;
const campaignMarkers=(campaigns,colors)=>campaigns.length?`<span class="cal-campaign-markers" aria-hidden="true" title="${esc(campaigns.map(campaignName).join(' • '))}">${campaigns.map(e=>`<i style="--event-color:${colors.get(String(e.id))}"></i>`).join('')}</span>`:'';
export function renderCalendar(s){
 const dates=monthDates(s.month),today=localDate();
 const matchesFilter=e=>s.filter==='all'||(s.filter==='campaign'&&e.kind==='campaign')||(s.filter==='due'&&['assignment','historical'].includes(e.kind))||(s.filter==='custom'&&e.kind==='custom');
 const events=s.events.filter(e=>Boolean(e.deleted)===s.deleted&&matchesFilter(e));
 const agenda=s.mode==='agenda'?events:eventsOnDay(events,s.day);
 const campaigns=[...new Map(events.filter(e=>e.kind==='campaign'&&(e.start||e.end)<=dates.at(-1)&&(e.end||e.start)>=dates[0]).map(e=>[e.id,e])).values()].sort((a,b)=>campaignName(a).localeCompare(campaignName(b))||String(a.id).localeCompare(String(b.id)));
 const campaignColors=campaignColorsFor(events);
 return `<section class="crm-calendar" aria-label="Campaign calendar">
 <header class="cal-header"><h1>Calendar</h1><button class="button button--primary" data-cal="new" ${!s.canCreate||s.pending?'disabled':''}>+ Add event</button></header>
 <div class="cal-toolbar">${s.mode==='unscheduled'?'':`<div class="cal-period"><button class="icon-button" data-cal="previous" aria-label="Previous month" title="Previous month">&#8249;</button><input type="month" aria-label="Calendar month" value="${esc(s.month)}" min="1900-02" max="2200-11"><button class="icon-button" data-cal="next" aria-label="Next month" title="Next month">&#8250;</button><button class="button button--secondary" data-cal="today">Today</button></div>`}
 <div class="cal-options">${s.mode==='unscheduled'?'':`<select aria-label="Calendar event filter"><option value="all" ${s.filter==='all'?'selected':''}>All events</option><option value="campaign" ${s.filter==='campaign'?'selected':''}>Campaigns</option><option value="due" ${s.filter==='due'?'selected':''}>Creator deadlines</option><option value="custom" ${s.filter==='custom'?'selected':''}>Other events</option></select>`}<div class="cal-modes" aria-label="Calendar view"><button data-cal="month" aria-pressed="${s.mode==='month'}">Month</button><button data-cal="agenda" aria-pressed="${s.mode==='agenda'}">Agenda</button><button data-cal="unscheduled" aria-pressed="${s.mode==='unscheduled'}">Unscheduled${s.unscheduledTotal?` (${s.unscheduledTotal})`:''}</button></div><button class="icon-button" data-cal="reload" aria-label="Refresh calendar" title="Refresh calendar">&#8635;</button></div></div>
 ${s.mode==='unscheduled'?'':`<div class="cal-legend">${['past','due','custom'].map(key=>`<span><i class="cal-${key}"></i>${categoryNames[key]}</span>`).join('')}${s.canCreate?`<label><input type="checkbox" aria-label="Show deleted events" ${s.deleted?'checked':''}>Deleted events</label>`:''}</div>${s.mode==='month'&&campaigns.length?`<div class="cal-campaign-legend" aria-label="Campaign colors"><strong>Campaign colors</strong><div>${campaigns.map(e=>`<span class="cal-campaign-key" style="--event-color:${campaignColors.get(String(e.id))}"><i aria-hidden="true"></i>${esc(campaignName(e))}</span>`).join('')}</div></div>`:''}`}
 ${s.error?`<p role="alert" class="cal-error">${esc(s.error)}</p>`:''}${s.notice?`<p role="status">${esc(s.notice)}</p>`:''}
 ${s.truncated?'<p role="alert">More than 5,000 events fall in this period. This calendar is incomplete.</p>':''}
 ${s.loading?'<p role="status">Loading calendar...</p>':s.loaded?`${s.mode==='unscheduled'?`<section class="cal-unscheduled" aria-label="Unscheduled work"><h2>Dates to set</h2><p>${s.unscheduledTotal} missing milestone${s.unscheduledTotal===1?'':'s'} across accessible campaigns</p>${s.unscheduledItems.length?s.unscheduledItems.map(item=>`<article class="cal-unscheduled-row"><div><strong>${esc(item.title)}</strong><small>${esc(item.campaignName)} · ${esc(item.type||'Type not recorded')}</small></div><div><span>${esc(item.milestone)}</span><small>Owner: ${esc(item.owner||'Unassigned')}</small></div><button type="button" class="button button--secondary" data-action="open-campaign" data-id="${esc(item.campaignId)}">Open campaign to set date</button></article>`).join(''):'<p class="cal-muted">No unscheduled work is recorded.</p>'}<nav aria-label="Unscheduled pages"><button type="button" data-cal="unscheduled-prev" ${s.unscheduledOffset===0?'disabled':''}>Previous</button><span>${s.unscheduledTotal?`${s.unscheduledOffset+1}–${Math.min(s.unscheduledOffset+s.unscheduledItems.length,s.unscheduledTotal)} of ${s.unscheduledTotal}`:'0 items'}</span><button type="button" data-cal="unscheduled-next" ${s.unscheduledOffset+50>=s.unscheduledTotal?'disabled':''}>Next</button></nav></section>`:''}${s.mode==='month'?`<div class="cal-grid" role="group" aria-label="Month calendar">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<div class="cal-weekday">${d}</div>`).join('')}${dates.map(date=>{const dayEvents=eventsOnDay(events,date),dayCampaigns=dayEvents.filter(e=>e.kind==='campaign').sort((a,b)=>campaignName(a).localeCompare(campaignName(b))||String(a.id).localeCompare(String(b.id))),otherEvents=dayEvents.filter(e=>e.kind!=='campaign');return `<div class="cal-day ${date.slice(0,7)!==s.month?'cal-other':''} ${date===s.day?'cal-selected':''}"><div class="cal-day-heading"><button class="cal-date ${date===today?'cal-today':''}" data-cal="day" data-date="${date}" aria-label="${label(date)}, ${dayCampaigns.length} campaign${dayCampaigns.length===1?'':'s'}, ${otherEvents.length} other event${otherEvents.length===1?'':'s'}" aria-pressed="${date===s.day}">${Number(date.slice(-2))}</button>${campaignMarkers(dayCampaigns,campaignColors)}</div>${otherEvents.slice(0,3).map(e=>eventButton(e,true,campaignColors)).join('')}${otherEvents.length>3?`<button class="cal-more" data-cal="day" data-date="${date}">+${otherEvents.length-3} more</button>`:''}</div>`;}).join('')}</div>`:''}
 ${s.mode==='unscheduled'?'':`<section class="cal-agenda" aria-label="${s.mode==='agenda'?'Period agenda':'Selected day events'}"><h2>${s.mode==='agenda'?'Schedule':label(s.day)}</h2>${agenda.length?agenda.sort((a,b)=>(a.start||a.end).localeCompare(b.start||b.end)||a.title.localeCompare(b.title)).map(e=>`<div class="cal-agenda-row"><time>${esc(e.start?label(e.start):'Start not set')}${e.end!==e.start?` - ${e.end?label(e.end):'End not set'}`:''}</time>${eventButton(e,false,campaignColors)}<span>${esc(e.brand||'')}<small>${esc(e.deleted?'Deleted':categoryNames[eventCategory(e)])}</small></span></div>`).join(''):'<p class="cal-muted">No events scheduled for this period.</p>'}</section>`}
 ${s.unscheduledCampaigns?`<p class="cal-muted">${s.unscheduledCampaigns} campaigns have no recorded dates.</p>`:''}`:''}
 ${s.editor?renderCalendarEditor(s):''}</section>`;
}
export function renderCalendarEditor(s){
 const e=s.editor,custom=e.kind==='custom',locked=s.busy||Boolean(s.pending),editable=e.editable;
 return `<div class="cal-backdrop"></div><section class="cal-dialog" role="dialog" aria-modal="true" aria-labelledby="cal-dialog-title"><header><h2 id="cal-dialog-title">${e.version===0?'New event':esc(e.title)}</h2><button class="icon-button" data-cal="close" aria-label="Close event" ${locked?'disabled':''}>&#215;</button></header>
 <form id="calendar-event-form"><fieldset ${locked||!editable?'disabled':''}>
 ${custom?`<label>Event name<input name="title" maxlength="160" required value="${esc(e.title)}"></label>`:`<p>${esc(e.campaignName||'Campaign dates')}${e.type?` · ${esc(e.type)}`:''}</p>`}
 <label>${custom||e.kind==='campaign'?'Start date':'Due date'}<input type="date" name="start" min="1900-01-01" max="2200-12-31" required value="${esc(e.start||'')}"></label>
 ${custom||e.kind==='campaign'?`<label>End date<input type="date" name="end" min="1900-01-01" max="2200-12-31" required value="${esc(e.end||'')}"></label>`:''}
 </fieldset>${!editable?'<p class="cal-muted">Historical record or view-only access. Dates cannot be changed here.</p>':!custom?'<p class="cal-muted">Changes also update the campaign record. Removing this event clears its dates only.</p>':''}
 ${s.editError?`<p role="alert" class="cal-error">${esc(s.editError)}</p>`:''}
 <footer>${s.pending?`<button type="button" class="button button--primary" data-cal="retry" ${s.busy?'disabled':''}>${s.busy?'Saving...':'Check / retry save'}</button>`:editable?`${e.version>0?`<button type="button" class="button button--secondary" data-cal="${e.deleted?'restore':'remove'}">${e.deleted?'Restore event':custom?'Delete event':'Remove dates'}</button>`:''}${!e.deleted?'<button class="button button--primary" type="submit">Save</button>':''}`:''}</footer></form></section>`;
}

export function bindCalendar({root,getState,render,request,isLive,onSaved}){
 let loadSequence=0;
 const load=async()=>{
  const s=getState(),sequence=++loadSequence,dates=monthDates(s.month);s.loading=true;s.error=null;render();
  try{
   if(!isLive()){s.canCreate=false;s.events=[];s.unscheduledItems=[];s.unscheduledTotal=0;s.notice='Local preview. Live calendar data is not connected.';}
   else if(s.mode==='unscheduled'){const data=(await request(`/api/calendar?view=unscheduled&offset=${s.unscheduledOffset}`)).data;if(getState()!==s||sequence!==loadSequence)return;s.unscheduledItems=data.items;s.unscheduledTotal=data.total;}
   else {const data=(await request(`/api/calendar?from=${dates[0]}&to=${dates.at(-1)}`)).data;if(getState()!==s||sequence!==loadSequence)return;Object.assign(s,data);s.unscheduledTotal=Math.max(s.unscheduledTotal,data.unscheduledCampaigns||0);}
   s.loaded=true;
  }catch(error){if(getState()!==s||sequence!==loadSequence)return;s.error=error.message;s.events=[];s.loaded=false;}
  if(getState()!==s||sequence!==loadSequence)return;s.loading=false;render();
 };
 const save=async()=>{
  const s=getState();if(s.busy||!s.pending)return;s.busy=true;s.editError=null;render();
  try{await request('/api/calendar',{method:'POST',csrf:true,body:s.pending});if(getState()!==s)return;s.pending=null;s.editor=null;s.notice='Calendar saved.';onSaved?.();}
  catch(error){if(getState()!==s)return;s.editError=error.message;if([400,401,403,409].includes(error.status))s.pending=null;}
  if(getState()!==s)return;s.busy=false;if(!s.editor)await load();else render();
 };
 root.addEventListener('click',event=>{
  const button=event.target.closest('[data-cal]');if(!button||button.disabled)return;
  const s=getState(),action=button.dataset.cal;
  if(action==='retry'){void save();return;}
  if(s.pending||s.busy)return;
  if(['previous','next','today'].includes(action)){const month=action==='today'?localDate().slice(0,7):shiftMonth(s.month,action==='previous'?-1:1);if(month<'1900-02'||month>'2200-11')return;s.month=month;s.day=action==='today'?localDate():`${s.month}-01`;void load();return;}
  if(action==='reload'){void load();return;}
  if(action==='month'||action==='agenda'||action==='unscheduled'){s.mode=action;void load();return;}
  if(action==='unscheduled-prev'||action==='unscheduled-next'){s.unscheduledOffset=Math.max(0,s.unscheduledOffset+(action==='unscheduled-next'?50:-50));void load();return;}
  if(action==='day')s.day=button.dataset.date;
  if(action==='close'){s.editor=null;s.editError=null;}
  if(action==='open'){const e=s.events.find(e=>eventKey(e)===button.dataset.key);if(e)s.editor={...e};s.editError=null;}
  if(action==='new'){s.editor={id:crypto.randomUUID(),kind:'custom',version:0,title:'',start:s.day,end:s.day,editable:true};s.editError=null;}
  if(action==='remove'||action==='restore'){
   const e=s.editor;if(!e?.editable)return;
   if(action==='remove'&&!window.confirm(e.kind==='custom'?'Delete this event? You can restore it under Deleted events.':'Clear these dates from the campaign record? The campaign and creator will not be deleted.'))return;
   s.pending={id:e.id,key:crypto.randomUUID(),kind:e.kind,version:e.version,operation:action,start:null,end:null,title:e.title};void save();return;
  }
  render();if(s.editor)root.querySelector('.cal-dialog input:not(:disabled),.cal-dialog button:not(:disabled)')?.focus();
 });
 root.addEventListener('change',event=>{
  const s=getState();if(s.pending)return;
  if(event.target.matches('[aria-label="Calendar month"]')){if(!/^\d{4}-\d{2}$/.test(event.target.value)||event.target.value<'1900-02'||event.target.value>'2200-11')return;s.month=event.target.value;s.day=`${s.month}-01`;void load();}
  if(event.target.matches('[aria-label="Calendar event filter"]')){s.filter=event.target.value;render();}
  if(event.target.matches('[aria-label="Show deleted events"]')){s.deleted=event.target.checked;render();}
 });
 root.addEventListener('submit',event=>{
  if(event.target.id!=='calendar-event-form')return;event.preventDefault();const s=getState(),e=s.editor;if(!e?.editable||s.pending)return;
  const form=new FormData(event.target),start=String(form.get('start')||''),end=String(form.get('end')||start);
  if(end<start){s.editError='End date must be on or after start date.';e.start=start;e.end=end;e.title=String(form.get('title')??e.title);render();return;}
  s.pending={id:e.id,key:crypto.randomUUID(),kind:e.kind,operation:'save',version:e.version,title:String(form.get('title')??e.title),start,end};void save();
 });
 root.addEventListener('keydown',event=>{
  const s=getState();if(!s.editor)return;
  if(event.key==='Escape'&&!s.pending){s.editor=null;render();}
  if(event.key==='Tab'){const focusable=[...root.querySelectorAll('.cal-dialog button:not(:disabled),.cal-dialog input:not(:disabled)')].filter(e=>!e.closest('fieldset[disabled]'));const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}
 });
 return {load};
}
