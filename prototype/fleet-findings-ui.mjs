const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const roleName={paid_specialist:'Paid specialist',seeding_specialist:'Seeding specialist',writer:'Correspondence writer'};
export function renderFleetFindings(campaign,state,creatorName=id=>id){
  if(state.fleetFindingsUnavailable)return '<section class="wf-tool" aria-label="Fleet findings"><h3>Fleet findings</h3><p>Saved findings could not be loaded. Reload saved evidence to try again.</p></section>';
  if(!state.fleetFindings)return '';
  const page=state.fleetFindings;
  const items=(page.items||[]).filter(row=>row.campaignId===campaign.id&&(!state.activeAssignment||row.assignmentId===state.activeAssignment)
    &&(campaign.assignments||[]).some(a=>a.id===row.assignmentId&&a.creatorId===row.creatorId)&&row.effect==='agent_suggestion'&&row.sent===false);
  return `<section class="wf-tool" aria-label="Fleet findings"><h3>Fleet findings</h3><p>Live agent suggestions and unsent replies. Staff records remain authoritative.</p>
    ${items.map(row=>{const r=row.record||{};const thread=/^[a-f0-9]{10,32}$/.test(r.threadId||'')?r.threadId:null;
      return `<article class="aw-review-item"><header><h4>${esc(creatorName(row.creatorId))} · ${esc(roleName[r.agentRole]||'Fleet')}</h4><span class="wf-badge">${row.stale?'Workflow changed since this finding':'Agent suggestion'}</span></header>
      <p>${esc(r.summary)}</p><p><strong>Next action:</strong> ${esc(r.nextAction)}</p>
      <p>${r.sourceDate?'Message dated '+esc(r.sourceDate):'Message date unknown'} · Saved ${esc(row.createdAt)}</p>
      ${thread?`<a target="_blank" rel="noopener noreferrer" href="https://mail.google.com/mail/?authuser=sample-team%40example.invalid#all/${thread}">Open Gmail conversation</a><p>${row.threadMatchVerified?'Existing verified CRM thread link':'Conversation match supplied by the agent; not staff verified.'}</p>`:''}
      ${(r.unresolved||[]).length?`<details><summary>Unresolved questions</summary><p>${r.unresolved.map(esc).join('<br>')}</p></details>`:''}
      ${r.draftBody?`<details><summary>Suggested reply — not sent</summary><textarea readonly aria-label="Suggested reply — not sent" rows="7">${esc(r.draftBody)}</textarea></details>`:''}
      </article>`;}).join('')||'<p>No saved Fleet findings for this selection yet.</p>'}
    ${page.hasMore?'<button type="button" class="button button--secondary" data-wf="fleet-more">Load older findings</button>':''}</section>`;
}
