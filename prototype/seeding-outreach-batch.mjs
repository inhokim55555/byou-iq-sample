import {validateOutreachDraft} from './seeding-outreach-policy.mjs';
import {documentText} from './email-content.mjs';
export function outreachAudience(rows){
 const seen=new Set(),ready=[],excluded=[];
 for(const row of rows){const email=String(row.email||'').trim().toLowerCase();let reason=row.blockedReason;
  if(!reason&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))reason='Email missing or invalid';
  if(!reason&&row.drafts?.some(j=>['sent','queued','checking','sending','review'].includes(j.status)))reason='Already contacted or outreach in progress';
  if(!reason&&seen.has(email))reason='Duplicate email';
  if(reason)excluded.push({...row,reason});else {seen.add(email);ready.push(row);}
 }return {ready,excluded};
}
export function personalizeOutreach(template,row){
 if(/\[(?:add|insert|creator name|product details)[^\]]*\]/i.test(template.subject+' '+template.body))throw new Error('Replace the placeholder instructions in the campaign message before preparing.');
 const raw=String(row.name||'').trim(),url=row.profileUrl||(/^https:\/\//.test(raw)?raw:''),name=/^https?:\/\//.test(raw)||/unavailable|unknown/i.test(raw)?'':raw;
 const replace=text=>String(text||'').replace(/\{\{(creatorName|creatorUrl)\}\}/g,(_,key)=>key==='creatorName'?(name||'there'):(url||'your profile'));
 const input={...template,subject:replace(template.subject),body:replace(template.body)};
 if(template.document){input.document={...template.document,blocks:template.document.blocks.map(b=>({...b,runs:b.runs.map(r=>({...r,text:replace(r.text)}))}))};input.body=documentText(input.document);}
 return validateOutreachDraft(input);
}
export function approvalChunks(items,size=25){return Array.from({length:Math.ceil(items.length/size)},(_,i)=>items.slice(i*size,(i+1)*size));}
