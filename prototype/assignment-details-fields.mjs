import {displayDate,displayDateTime} from './date-format.mjs';
export const ASSIGNMENT_EDITABLE_KEYS=['assignmentStatus','deliverableType','platform','deliverableStatus','draftDueDate','publicationDate','internalNote','deliverables','paidUsageDays'];
export const DELIVERABLE_PUBLICATION_KEYS=['postUrl','tiktokAdCode','instagramAdCode'];
export const DELIVERABLE_KEYS=['id','deliverableType','platform','deliverableStatus','draftDueDate','publicationDate',...DELIVERABLE_PUBLICATION_KEYS];
export const MAX_ASSIGNMENT_DELIVERABLES=30;
const choices={
 assignmentStatus:['selected','contacted','negotiating','confirmed','creating','revising','approved','posted','completed','declined','unresponsive'],
 deliverableType:['other','short_form_video','instagram_reel','tiktok_video','youtube_video','story_set','static_post','cross_posting','instagram_story','facebook_post'],
 platform:['other','instagram','tiktok','youtube','both','facebook'],
 deliverableStatus:['not_started','in_progress','draft_received','revision_requested','approved','posted','completed','cancelled']
};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const title=v=>v.replaceAll('_',' ').replace(/^./,c=>c.toUpperCase());
const editorChoices={deliverableType:['youtube_video','instagram_story','facebook_post','instagram_reel','tiktok_video'],platform:['instagram','tiktok','youtube','facebook']};
const choiceLabel=value=>({youtube_video:'YouTube Video',instagram_story:'Instagram Story',facebook_post:'Facebook Post',instagram_reel:'Instagram Reel',tiktok_video:'TikTok Short',cross_posting:'Cross-posting on both platforms',facebook:'Facebook',tiktok:'TikTok',youtube:'YouTube'}[value]||title(value));
function validatePaidUsageDays(value){
 if(value!==null&&(!Number.isInteger(value)||value<0||value>2147483647))throw new Error('Enter paid usage as a whole number of days from 0 to 2147483647, or leave it blank.');
 return value;
}
export function readAssignmentEditableFields(form){
 const result=Object.fromEntries(ASSIGNMENT_EDITABLE_KEYS.filter(k=>k!=='deliverables'&&form.has(k)).map(k=>[k,String(form.get(k)||'').trim()||null]));
 if(form.has('paidUsageDays')){
  const raw=String(form.get('paidUsageDays')??'').trim();
  if(raw!==''&&!/^\d+$/.test(raw))throw new Error('Enter paid usage as a whole number of days, or leave it blank.');
  result.paidUsageDays=validatePaidUsageDays(raw===''?null:Number(raw));
 }
 if(form.has('deliverablesPresent')){
  const columns=Object.fromEntries(DELIVERABLE_KEYS.map(k=>[k,form.getAll(k==='id'?'deliverableId':k)]));
  const present=DELIVERABLE_KEYS.filter(k=>!DELIVERABLE_PUBLICATION_KEYS.includes(k)||columns[k].length);
  if(present.some(k=>columns[k].length!==columns.id.length))throw new Error('Reload the deliverable fields before saving.');
  result.deliverables=columns.id.map((_,i)=>Object.fromEntries(present.map(k=>[k,String(columns[k][i]??'').trim()||null])));
  for(const key of DELIVERABLE_KEYS.filter(k=>k!=='id'))delete result[key];
 }
 return result;
}
export function assignmentDeliverables(assignment,value={}){
 const v={...assignment.assignmentDetails,...value};
 if(Array.isArray(v.deliverables))return v.deliverables.map(row=>({...row}));
 // Migrate the existing staff planning fields only; source evidence stays read only.
 return [{id:'legacy-deliverable',...Object.fromEntries(DELIVERABLE_KEYS.filter(k=>k!=='id'&&(!DELIVERABLE_PUBLICATION_KEYS.includes(k)||Object.hasOwn(v,k))).map(k=>[k,v[k]??null]))}];
}
export function validateAssignmentDeliverables(rows){
 if(!Array.isArray(rows)||rows.length>MAX_ASSIGNMENT_DELIVERABLES)throw new Error('Use at most 30 deliverables.');
 const ids=new Set();
 return rows.map(row=>{
  if(!row||typeof row!=='object'||Array.isArray(row)||Object.keys(row).some(k=>!DELIVERABLE_KEYS.includes(k))||DELIVERABLE_KEYS.some(k=>!DELIVERABLE_PUBLICATION_KEYS.includes(k)&&!Object.hasOwn(row,k)))throw new Error('Check the deliverable fields.');
  if(typeof row.id!=='string'||! /^[a-zA-Z0-9-]{1,80}$/.test(row.id)||ids.has(row.id))throw new Error('Each deliverable needs a distinct ID.');
  ids.add(row.id);
  const publication={};
  for(const key of DELIVERABLE_PUBLICATION_KEYS){
   if(!Object.hasOwn(row,key))continue;
   const value=row[key];
   if(value!==null&&(typeof value!=='string'||value.length>(key==='postUrl'?2000:1000)||/[\u0000-\u001f\u007f]/.test(value)))throw new Error('Enter a valid post URL or ad code.');
   if(key==='postUrl'&&value!==null){
    try{const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||!url.hostname)throw new Error();}catch{throw new Error('Use an HTTPS post URL without account credentials.');}
   }
   publication[key]=value;
  }
  return {id:row.id,...validateAssignmentEditableFields(Object.fromEntries(DELIVERABLE_KEYS.filter(k=>k!=='id'&&!DELIVERABLE_PUBLICATION_KEYS.includes(k)).map(k=>[k,row[k]]))),...publication};
 });
}
export function validateAssignmentEditableFields(data){
 const result={};
 for(const key of ASSIGNMENT_EDITABLE_KEYS){
  if(!Object.hasOwn(data,key))continue;
  const value=data[key];
  if(key==='deliverables'){result[key]=validateAssignmentDeliverables(value);continue;}
  if(key==='paidUsageDays'){result[key]=validatePaidUsageDays(value);continue;}
  if(choices[key]&&value!==null&&!choices[key].includes(value))throw new Error('Choose a valid '+title(key)+'.');
  if(['draftDueDate','publicationDate'].includes(key)&&value!==null){
   if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T12:00:00Z'))||new Date(value+'T12:00:00Z').toISOString().slice(0,10)!==value)throw new Error('Enter a valid schedule date.');
  }
  if(key==='internalNote'&&value!==null&&(typeof value!=='string'||value.length>2000))throw new Error('Keep the note under 2,000 characters.');
  result[key]=value;
 }
 return result;
}
export function renderAssignmentEditableFields(assignment,value={}){
 const v={assignmentStatus:assignment.assignmentStatus,paidUsageDays:assignment.paidUsageDays,...assignment.assignmentDetails,...value};
 if(!Object.hasOwn(value,'internalNote'))v.internalNote=String(v.internalNote??'').replace(/^Email review [^\r\n]*supporting excerpts are in Email evidence\.\r?\n?/,'');
 const select=(label,key,fields=v)=>{
  const current=choices[key].includes(fields[key])?fields[key]:null;
  const available=editorChoices[key]||choices[key];
  const legacy=current&&!available.includes(current)?'<option value="'+esc(current)+'" selected>Keep current: '+esc(choiceLabel(current))+'</option>':'';
  const unset=key==='assignmentStatus'&&fields[key]&&!current?'Keep current: '+title(String(fields[key])):'Not recorded';
  return '<label><span>'+label+'</span><select name="'+key+'"><option value=""'+(!current?' selected':'')+'>'+esc(unset)+'</option>'+legacy+available.map(code=>'<option value="'+code+'"'+(code===current?' selected':'')+'>'+choiceLabel(code)+'</option>').join('')+'</select></label>';
 };
 const paidUsage='<section class="ops-paid-usage" aria-label="Paid usage"><h3>Paid usage</h3><label><span>Number of days</span><input name="paidUsageDays" type="number" min="0" max="2147483647" step="1" value="'+esc(v.paidUsageDays)+'"></label></section>';
 const rows=assignmentDeliverables(assignment,value);
 const deliverables=rows.map((row,index)=>'<fieldset class="ops-deliverable" data-deliverable-id="'+esc(row.id)+'"><legend>Deliverable '+(index+1)+'</legend><input type="hidden" name="deliverableId" value="'+esc(row.id)+'"><div class="ops-fields">'+select('Platform','platform',row)+select('Deliverable type','deliverableType',row)+select('Deliverable status','deliverableStatus',row)+'<label><span>Draft due date</span><input name="draftDueDate" type="date" value="'+esc(row.draftDueDate)+'"></label><label><span>Scheduled publication date</span><input name="publicationDate" type="date" value="'+esc(row.publicationDate)+'"></label><label class="ops-wide"><span>Post URL</span><input name="postUrl" type="url" maxlength="2000" placeholder="https://…" value="'+esc(row.postUrl)+'"></label><label><span>TikTok ad code</span><input name="tiktokAdCode" type="text" maxlength="1000" value="'+esc(row.tiktokAdCode)+'"></label><label><span>Instagram ad code</span><input name="instagramAdCode" type="text" maxlength="1000" value="'+esc(row.instagramAdCode)+'"></label></div><button type="button" class="button button--secondary" data-ops-action="remove-assignment-deliverable" data-ops-value="'+esc(row.id)+'" aria-label="Remove deliverable '+(index+1)+'">Remove deliverable</button></fieldset>').join('');
 return '<input type="hidden" name="internalNote" value="'+esc(v.internalNote||'')+'"><div class="ops-fields">'+select('Assignment status','assignmentStatus')+'</div>'+paidUsage+'<section class="ops-assignment-deliverables" aria-label="Assignment deliverables"><h3>Deliverables</h3><input type="hidden" name="deliverablesPresent" value="true">'+deliverables+(rows.length?'':'<p class="ops-note">No deliverables recorded.</p>')+'<button type="button" class="button button--secondary" data-ops-action="add-assignment-deliverable"'+(rows.length>=MAX_ASSIGNMENT_DELIVERABLES?' disabled':'')+'>Add deliverable</button></section>';
}
export function renderAssignmentContactSource(assignment){
 const evidence=(Array.isArray(assignment.sourceDetails?.evidence)?assignment.sourceDetails.evidence:[]).filter(e=>e.assignmentId===assignment.id&&e.creatorId===assignment.creatorId&&e.campaignId===assignment.campaignId&&/^[a-f0-9]{12,32}$/.test(e.providerThreadId||''));
 if(!evidence.length)return '';
 const dates=[...new Set(evidence.map(e=>e.firstContactDate).filter(d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)))];
 const links=evidence.map(e=>{
  try{const u=new URL(e.sourceUrl);if(u.protocol!=='https:'||u.hostname!=='mail.google.com'||u.username||u.password||!u.hash.endsWith('/'+e.providerThreadId))return '';return '<a href="'+esc(u.href)+'" target="_blank" rel="noopener noreferrer">Open original Gmail thread</a>';}catch{return '';}
 }).filter(Boolean);
 return '<section aria-label="Original contact record"><h3>Original contact record</h3><dl><dt>Creator contacted</dt><dd>'+(dates.length?esc(displayDate(dates.sort()[0],'UTC'))+' · America/Los_Angeles':'Original contact date unavailable')+'</dd><dt>Associated Gmail thread'+(links.length===1?'':'s')+'</dt><dd>'+links.join('<br>')+'</dd></dl><p class="ops-note">These original Gmail references are read only.</p></section>';
}

const factLabels={phase:'Campaign phase',assignmentStatus:'Assignment status',deliverableStatus:'Deliverable status',feeAmount:'Agreed creator fee',feeRate:'Agreed unit rate',feeQuote:'Creator quote',feeProposal:'BYOU proposal',feeOptions:'Quoted rate options',feePackage:'Shared package fee',historicalAgreedFee:'Earlier agreement',deliverables:'Deliverables and usage',publicationDate:'Publication target',schedule:'Schedule context',draftDeadline:'Draft timing',contract:'Contract context',productReceipt:'Creator receipt report',collaboration:'Collaboration context',paymentTerms:'Payment terms'};
// Immutable email observations retain the phase labels used when they were imported.
// The current manager phases are defined in campaign-operations-ui.mjs.
const phaseLabels=['','Intake and Qualification','Negotiation & Contract Signing','Content Production & Revision','Submission, Publication Collection','Payment Processing & Closeout'];
function gmailEvidenceLink(e){
 try{const u=new URL(e.sourceUrl);return /^[a-f0-9]{12,32}$/.test(e.providerThreadId||'')&&u.protocol==='https:'&&u.hostname==='mail.google.com'&&!u.username&&!u.password&&u.hash==='#all/'+e.providerThreadId?u.href:null;}catch{return null;}
}
function emailFacts(assignment){
 const entries=Array.isArray(assignment.sourceDetails?.evidence)?assignment.sourceDetails.evidence:[];
 const scoped=e=>e.assignmentId===assignment.id&&e.creatorId===assignment.creatorId&&e.campaignId===assignment.campaignId;
 const threads=new Set(entries.filter(e=>scoped(e)&&gmailEvidenceLink(e)).map(e=>e.providerThreadId));
 return entries.filter(e=>scoped(e)&&e.type==='operational_email_fact'&&Object.hasOwn(factLabels,e.field)&&Number.isFinite(e.confidence)&&e.confidence>=0&&e.confidence<=1&&typeof e.extractionMethod==='string').map(e=>({...e,evidence:(Array.isArray(e.evidence)?e.evidence:[]).filter(s=>threads.has(s.providerThreadId)&&gmailEvidenceLink(s)&&typeof s.excerpt==='string'&&s.excerpt.trim()&&s.excerpt.length<=3000&&typeof s.sourceDate==='string'&&Number.isFinite(Date.parse(s.sourceDate)))})).filter(e=>e.evidence.length);
}
function factValue(fact){
 if(fact.field==='phase'&&Number.isInteger(fact.value)&&phaseLabels[fact.value])return fact.value+'. '+phaseLabels[fact.value];
 const v=fact.value;
 if(v&&typeof v==='object'&&!Array.isArray(v)&&Number.isFinite(v.amount))return (v.currency||'Currency unconfirmed')+' '+v.amount.toLocaleString('en-US')+' · '+String(v.basis||'Scope unconfirmed').replaceAll('_',' ')+(v.renkAllocation===null?' · campaign allocation unconfirmed':'');
 return typeof v==='string'?v:(v===null||v===undefined?'Not confirmed':JSON.stringify(v));
}
export function renderAssignmentEmailEvidence(assignment){
 const facts=emailFacts(assignment);if(!facts.length)return '';
 return '<details class="assignment-source-details assignment-email-evidence" aria-label="Email evidence"><summary>Email evidence · '+facts.length+' facts</summary><p class="ops-note">These are dated email observations. The operational fields remain editable. A signature report does not verify the document, and a fee does not confirm payment.</p>'+facts.map(f=>'<section><h4>'+esc(factLabels[f.field])+'</h4><p>'+esc(factValue(f))+'</p><p class="ops-note">'+esc(title(String(f.status||'needs_review')))+' · '+Math.round(f.confidence*100)+'% confidence · '+esc(f.extractionMethod==='codex_subscription_email_inference_v1'?'Codex email review':f.extractionMethod)+'</p>'+f.evidence.map(e=>'<blockquote>'+esc(e.excerpt).replaceAll('\n','<br>')+'</blockquote><p class="ops-note">'+esc(displayDate(e.sourceDate,'UTC'))+' · '+esc(e.senderRole||'Source email')+' · <a href="'+esc(gmailEvidenceLink(e))+'" target="_blank" rel="noopener noreferrer">Open supporting Gmail thread</a></p>').join('')+'</section>').join('')+'</details>';
}
