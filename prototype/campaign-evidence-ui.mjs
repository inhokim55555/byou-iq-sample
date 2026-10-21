import {displayDate,displayDateTime} from './date-format.mjs';
import { safeWorkflowUrl } from './campaign-workflow.mjs';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels = { shipped:'Shipment recorded in spreadsheet', received:'Received field in spreadsheet', delivered:'Delivered field in spreadsheet', finalPostUrl:'Recorded content link', draftUrl:'Recorded draft link', postUrl:'Recorded post link', status:'Source status', dueDate:'Source deadline', date:'Source date', platform:'Platform', handle:'Handle', profileUrl:'Profile', fee:'Source fee', currency:'Currency' };
export function renderCampaignEvidence(evidence) {
  if (!evidence) return '';
  const source = evidence.source;
  const values = Object.entries(source?.values || {}).filter(([key,value]) => labels[key] && value !== null && value !== '');
  const threads = (evidence.communications || []).filter(thread => thread.assignmentId === evidence.assignmentId && thread.creatorId === evidence.creatorId && thread.campaignId === evidence.campaignId);
  const link = (url,label) => safeWorkflowUrl(url) ? `<a href="${esc(safeWorkflowUrl(url))}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>` : esc(label);
  return `<section class="aw-recorded-evidence" aria-label="Recorded campaign context"><h3>Recorded campaign context</h3>
    <p>Assignment status: ${esc(evidence.assignmentStatus || 'Not recorded')}</p>
    ${source ? `<p>Spreadsheet: ${esc(source.tab || 'Tab not recorded')} · row ${esc(source.row || 'not recorded')} · captured ${esc(displayDateTime(source.capturedAt,undefined,'date unavailable'))}</p><dl class="pj-fields">${values.map(([key,value]) => `<div><dt>${esc(labels[key])}</dt><dd>${/Url$/.test(key) ? link(value,value) : esc(['date','dueDate'].includes(key)?displayDate(value,'UTC'):value)}</dd></div>`).join('')}</dl><p>These are imported source values. Receipt, approval, and completion still require supporting evidence.</p>` : '<p>No spreadsheet row is attached to this assignment.</p>'}
    <h4>Campaign correspondence (${threads.length})</h4>${threads.map(thread => `<article><strong>${link(thread.href,thread.approvedSubject || 'Open campaign conversation')}</strong><p>${thread.status==='verified'?'Verified link':'Pending staff verification'} · ${esc(displayDateTime(thread.latestMessageAt || thread.recordedDate,undefined,'Message date unavailable'))}${thread.nextAction ? ' · '+esc(thread.nextAction) : ''}</p></article>`).join('') || '<p>No verified email thread is linked to this assignment yet. Email coverage is incomplete.</p>'}
  </section>`;
}
