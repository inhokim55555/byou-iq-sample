import { renderWorkflowSources } from "./workflow-source-ui.mjs";
import { overlayOutreachReceipts } from './outreach-receipts.mjs';
import {renderFleetFindings} from './fleet-findings-ui.mjs';
import { renderContinuationPanel, installContinuationUI, clearContinuationCache, loadContinuationAssignment, invalidateContinuationSelection } from './campaign-continuation-ui.mjs';
import { validateWorkflowEvent } from "./campaign-workflow.mjs";
import { SEEDING_PHASES, isSeedingCampaign } from "./seeding-assignment-workflow.mjs";
import { ASSIGNMENT_PHASES, assignmentWorkflowModel } from "./assignment-workflow.mjs";
import { escapeWorkflow as escape, renderAssignmentWorkflow, renderOutreachReceipts, phaseRecordKinds } from "./assignment-workflow-ui.mjs";
const label = kind => ({ selected: "Creator selected", outreach: "Initial outreach sent", terms: "Negotiated agreement", contract_sent: "Contract sent", contract_signed: "Signed contract received", shipping_info: "Shipping details received", shipment: "Shipment dispatched", carrier_delivery: "Carrier reports delivery", receipt: "Creator confirms receipt", delivery_issue: "Delivery problem", delivery_resolved: "Delivery problem resolved", draft: "Draft submitted", feedback: "Revision notes entered", feedback_sent: "Revision feedback sent", approval: "Human approval of final draft", live_link: "Live link received", document: "Required item received", deadline: "Deadline confirmed / changed", delay: "Creator reports delay", reply: "Reply needs review", reply_resolved: "Reply reviewed", email: "External email recorded", correction: "Displayed stage corrected", automation: "Automation control changed", config: "Automation configuration changed", reminder: "Reminder activity" }[kind] || kind);
const input = (name, text, type = "text", value = "", required = true) => `<label>${text}<input name="${name}" type="${type}" value="${escape(value)}" ${required ? "required" : ""} ${type === "text" ? 'maxlength="200"' : ""}></label>`;
const options = (items, selected) => items.map(([value, text]) => `<option value="${escape(value)}" ${selected === value ? "selected" : ""}>${escape(text)}</option>`).join("");
function recordForm(j, p, state, preview, kinds) {
  const kind = kinds.includes(state.forms[j.assignmentId]) ? state.forms[j.assignmentId] : kinds[0];
  let fields = "";
  if (kind === "terms") fields = input("creativeIds", "Required draft IDs (comma separated)", "text", p.terms?.creativeIds.join(", ") || "") + input("postIds", "Required post IDs (comma separated)", "text", p.terms?.postIds.join(", ") || "") + input("usageDays", "Agreed usage duration in days", "number", p.terms?.usageDays ?? 0) + `<label>Applicable 30-day ad code required?<select name="adCodeRequired">${options([["false", "No"], ["true", "Yes — agreement explicitly requires it"]], String(p.terms?.adCodeRequired ?? false))}</select></label>`;
  if (kind === "contract_sent") fields = input("reference", "Existing secure record reference") + "<p>Reference the existing contract record. Do not paste document contents here.</p>";
  if (kind === "shipment") fields = input("carrier", "Carrier") + input("tracking", "Tracking number");
  if (["draft", "feedback", "feedback_sent", "approval", "live_link"].includes(kind)) fields = `<label>Deliverable<select name="deliverableId">${options((kind === "live_link" ? p.terms?.postIds || [] : p.terms?.creativeIds || []).map(id => [id, id]))}</select></label>`;
  if (["draft", "feedback", "feedback_sent", "approval"].includes(kind)) fields += input("revision", "Exact draft version", "text", p.drafts.filter(Boolean).at(-1)?.data.revision || "");
  if (["draft", "live_link"].includes(kind)) fields += input("url", "HTTPS link", "url");
  if (kind === "feedback") fields += '<label>Revision notes<textarea name="notes" required maxlength="1000"></textarea></label>';
  if (kind === "document") fields = `<label>Received item<select name="item">${options([["w9", "W-9"], ["invoice", "Invoice"], ["ad_code", "Ad code"]])}</select></label><p>Record receipt only. Keep files in the existing protected document system.</p>`;
  const teamOnly = ["terms", "approval", "feedback", "feedback_sent", "deadline", "correction", "reply_resolved"].includes(kind);
  return `<details class="wf-tool"><summary>Record phase evidence</summary><form data-wf-form="record" class="wf-form"><label>Action<select name="kind" data-wf-kind>${options(kinds.map(k => [k, label(k)]), kind)}</select></label>${fields}
    <label>Event source<select name="source">${options(teamOnly ? [["team", "Our team — human action"]] : [["team", "Our team"], ["creator", "Creator"], ["integration", "Integration"]])}</select></label>
    ${input("at", "When it happened (your browser’s local time)", "datetime-local", new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16))}
    <label>Evidence status<select name="certainty">${options([["confirmed", "Confirmed"], ["inferred", "Inferred — needs review; does not advance workflow"]])}</select></label>
    <label>Note / reason (required)<textarea name="note" required maxlength="1000" placeholder="What happened, or why this record is changing"></textarea></label>
    ${kind === "approval" ? '<label class="wf-check"><input type="checkbox" name="humanApproval" required>I personally reviewed and approve this exact draft version.</label>' : ""}
    <button class="button button--primary">${preview ? "Record in sample workflow" : "Save staff record"}</button>
  </form></details>`;
}

function managedSimulationControls(journey, editable, saving) {
  if (!editable || !Array.isArray(journey.managedPlans)) return '';
  return journey.managedPlans.filter(plan => plan.assignmentId === journey.assignmentId && plan.campaignId === journey.campaignId
    && plan.creatorId === journey.creatorId && ['Paid','Seeding'].includes(plan.workflowType) && Date.parse(plan.expiresAt)>Date.now()).map(plan => {
    const result = journey.managedResults?.find(row => row.binding.scenarioId === plan.scenarioId);
    const reconcile = result?.status === 'in_flight';
    return `<p class="wf-notice">Reviewed ${escape(plan.workflowType)} simulation · invented conversation · draft only. ${result ? escape(result.status.replaceAll('_',' ')) : 'Ready for managed Fleet.'}
      ${!result || reconcile ? `<button type="button" class="button button--secondary" data-wf="managed-${reconcile?'reconcile':'start'}" data-managed-scenario="${escape(plan.scenarioId)}" ${saving?'disabled':''}>${reconcile?'Check':'Run'} ${escape(plan.workflowType)} simulation</button>` : ''}</p>`;
  }).join('');
}

const cache = new Map();
const stateFor = campaign => {
  if (!cache.has(campaign.id)) cache.set(campaign.id, { journeys: null, forms: {}, phase: null, activeAssignment: null, filter: "", loading: false });
  return cache.get(campaign.id);
};
const seedingJourney = (campaign, assignment, state) => overlayOutreachReceipts({
  assignmentId: assignment.id, campaignId: campaign.id, creatorId: assignment.creatorId, workflowEvents: [], revision: 0,
  recordedEvidence: state.recordedEvidence?.assignments?.find(row => row.assignmentId === assignment.id && row.creatorId === assignment.creatorId && row.campaignId === campaign.id),
  ...(Array.isArray(state.managedResults) ? { managedResults: state.managedResults.filter(row => row.binding?.assignmentId === assignment.id && row.binding?.creatorId === assignment.creatorId && row.binding?.campaignId === campaign.id) } : {}),
  ...(state.managedResultsUnavailable ? { managedResultsUnavailable: true } : {}),
  ...(state.outreachReceiptsUnavailable ? { outreachReceiptsUnavailable:true } : {})
},state.outreachReceipts);
export const clearPaidJourneyCache = () => { cache.clear(); clearContinuationCache(); };
export const paidJourneyState = id => cache.get(id);
export function updateCampaignWorkflowPolicy(id, policy) {
  const state = cache.get(id);
  if (!state) return;
  // Replacing the cache entry also invalidates any older read still in flight.
  cache.set(id, { ...state, pending: null, loading: false, journeys: state.journeys?.map(j => ({ ...j, campaignPolicy: structuredClone(policy) })) || null });
}
export const setPaidJourneyPreview = (id, journeys, seedingRows = []) => cache.set(id, {
  journeys: structuredClone(journeys), seedingRows: structuredClone(seedingRows), preview: true, forms: {}, phase: null, activeAssignment: null, filter: "", loading: false
});
export async function loadPaidJourneys(campaign, request) {
  const legacyOptions = typeof request === "object";
  const requestJson = legacyOptions ? request.requestJson : request;
  const state = stateFor(campaign);
  if (state.pending && state.pendingAssignment === state.activeAssignment) return legacyOptions ? undefined : state.pending;
  const requestToken = Symbol(); state.requestToken = requestToken; state.pendingAssignment = state.activeAssignment;
  state.attempted = true;
  state.loading = true;
  state.error = null;
  state.pending = (async () => {
    const findingSelection=state.activeAssignment;
    const needsReceipts=isSeedingCampaign(campaign)||(campaign.assignments||[]).some(a=>a.id===state.activeAssignment&&a.continuationAdopted===true);
    const receiptsRead=needsReceipts?requestJson('/api/campaigns/'+encodeURIComponent(campaign.id)+'/outreach-batches?operation=receipts').then(result=>{
      if(cache.get(campaign.id)!==state||state.requestToken!==requestToken)return;
      if(result.data?.campaignId!==campaign.id||!Array.isArray(result.data.items))throw Error('OUTREACH_RECEIPTS_UNAVAILABLE');
      state.outreachReceipts=result.data.items;state.outreachReceiptsUnavailable=false;
    }).catch(()=>{if(cache.get(campaign.id)===state&&state.requestToken===requestToken){state.outreachReceipts=null;state.outreachReceiptsUnavailable=true;}}):Promise.resolve();
    const findingsRead=requestJson('/api/campaigns/'+encodeURIComponent(campaign.id)+'/agent-findings'+(findingSelection?'?assignmentId='+encodeURIComponent(findingSelection):'')).then(result=>{
      if(cache.get(campaign.id)!==state||state.requestToken!==requestToken)return;
      const data=result.data||result;if(!Array.isArray(data.items))throw Error('FINDINGS_UNAVAILABLE');
      state.fleetFindings=data;state.fleetFindingsUnavailable=false;
    }).catch(()=>{if(cache.get(campaign.id)===state&&state.requestToken===requestToken){state.fleetFindings=null;state.fleetFindingsUnavailable=true;}});
    try {
      const adoptedAssignment = (campaign.assignments || []).find(a => a.id === state.activeAssignment);
      state.continuationOnly = adoptedAssignment?.continuationAdopted === true;
      if (state.continuationOnly) {
        await Promise.all([receiptsRead, loadContinuationAssignment(campaign, state.activeAssignment, requestJson)]);
        if (cache.get(campaign.id) !== state || state.requestToken !== requestToken) return;
        state.journeys = (campaign.assignments || []).map(a => overlayOutreachReceipts({ assignmentId: a.id, creatorId: a.creatorId, campaignId: campaign.id },state.outreachReceipts));
        return;
      }
      if (isSeedingCampaign(campaign)) {
        const result = await requestJson("/api/seeding?campaign=" + encodeURIComponent(campaign.id));
        if (cache.get(campaign.id) !== state || state.requestToken !== requestToken) return;
        const rows = result.data || result;
        if (!Array.isArray(rows)) throw new Error("Seeding evidence is unavailable.");
        state.seedingRows = rows;
        state.recordedEvidence = result.recordedEvidence?.campaignId === campaign.id ? result.recordedEvidence : null;
        state.managedResults = Array.isArray(result.managedResults) ? result.managedResults : null;
        state.managedResultsUnavailable = result.managedResultsUnavailable === true;
        await receiptsRead;
        if (cache.get(campaign.id) !== state || state.requestToken !== requestToken) return;
        state.journeys = (campaign.assignments || []).map(a => seedingJourney(campaign, a, state));
        return;
      }
      const result = await requestJson("/api/campaigns/" + encodeURIComponent(campaign.id) + "/workflow");
      if (cache.get(campaign.id) !== state || state.requestToken !== requestToken) return;
      const journeys = (result.data || result).journeys;
      if (!Array.isArray(journeys) || journeys.some(j => j.campaignId !== campaign.id)) throw new Error("Assignment-scoped workflow records are unavailable.");
      state.journeys = journeys;
    } catch (error) {
      if (cache.get(campaign.id) === state && state.requestToken === requestToken) {
        state.journeys = null;
        state.seedingRows = null;
        state.managedResults = null;
        state.managedResultsUnavailable = false;
        state.error = error.message || "Workflow records unavailable.";
      }
    } finally {
      await Promise.allSettled([findingsRead,receiptsRead]);
      if (state.requestToken === requestToken) { state.loading = false; state.pending = null; }
    }
  })();
  await state.pending;
}
export function loadVisiblePaidJourneys({ root, getCampaign, requestJson, rerender }) {
  for (const section of root.querySelectorAll("[data-wf-campaign]")) {
    const campaign = getCampaign(section.dataset.wfCampaign);
    if (campaign && !stateFor(campaign).attempted && !stateFor(campaign).preview)
      void loadPaidJourneys(campaign, requestJson).then(rerender);
  }
}
export async function openCreatorWorkflow(campaign, assignmentId, requestJson) {
  const state = stateFor(campaign);
  if (!state.pending || state.pendingAssignment !== assignmentId) invalidateContinuationSelection(campaign.id);
  state.activeAssignment = assignmentId;
  state.phase = null;
  state.notice = null;
  if (!state.preview) await loadPaidJourneys(campaign, requestJson);
}
export function renderPaidJourneys(campaign, { creatorName = id => id, getCreator = () => null, getHistory = () => [], canEdit = false, canContinue = false, canManageContinuation = false, preview = false } = {}) {
  const state = stateFor(campaign);
  const sample = preview && state.preview;
  const continuationPanel = !sample && canContinue ? renderContinuationPanel(campaign, { creatorName,
    canEdit: canManageContinuation && String(campaign.status).toLowerCase() !== 'archived' }) : '';
  // Campaign rosters arrive after the first evidence request. Reflect their current IDs
  // without refetching worker state or leaving a successfully loaded empty roster cached.
  if (!sample && isSeedingCampaign(campaign) && state.journeys && !state.continuationOnly) {
    state.journeys = (campaign.assignments || []).map(a => seedingJourney(campaign, a, state));
  }
  if (!sample && !state.journeys) return `<section class="pj-workspace wf-workspace" data-wf-campaign="${escape(campaign.id)}" aria-label="${escape(campaign.name)} creator workflows">${continuationPanel}<header class="pj-heading"><h2>Creator workflows</h2><button class="button button--secondary" data-wf="load" ${state.loading ? 'disabled' : ''}>${state.error ? 'Retry' : 'Refresh'}</button></header>${state.error ? `<p role="alert">Saved workflows could not be loaded. ${escape(state.error)}</p>` : '<p role="status">Loading workflows…</p>'}</section>`;
  const scopedCampaign = sample ? { ...campaign, assignments: campaign.assignments || state.journeys.map(j => ({ id: j.assignmentId, creatorId: j.creatorId, campaignId: j.campaignId })) } : campaign;
  const journeys = state.journeys || (campaign.assignments || []).map(a => ({ assignmentId: a.id, creatorId: a.creatorId, campaignId: campaign.id }));
  const models = state.journeys && !state.continuationOnly ? journeys.filter(j => !(campaign.assignments || []).some(a => a.id === j.assignmentId && a.continuationAdopted === true)).map(j => assignmentWorkflowModel(scopedCampaign,
    { ...j, displayName: j.displayName || creatorName(j.creatorId) },
    { creator: getCreator(j.creatorId), history: getHistory(j.creatorId), seedingRows: state.seedingRows, seedingError: state.error })).filter(Boolean) : [];
  const selected = models.find(m => m.journey.assignmentId === state.activeAssignment);
  const phase = selected && (state.phase || selected.current);
  const kinds = phaseRecordKinds[phase] || [];
  const editable = canEdit && !!selected && !state.loading && !isSeedingCampaign(campaign) && String(campaign.status).toLowerCase() !== "archived";
  const form = (editable && kinds.length ? recordForm(selected.journey, selected.p, state, sample, kinds) : "") + (selected ? renderWorkflowSources(selected.journey, editable && !sample) : "")
    + (selected && !sample ? managedSimulationControls(selected.journey, canEdit && !state.loading && String(campaign.status).toLowerCase()!=='archived', state.managedSaving) : '')
    + (selected && !sample && canEdit && Array.isArray(selected.journey.jevResults) ? '<button type="button" class="button button--secondary" data-wf="jev-stop">Stop Jev reply classification</button>' : '');
  const board = '<div class="aw-board"><label>Filter by calculated phase<select data-wf-filter="stage">'
    + options([["", "All phases"], ...(isSeedingCampaign(campaign) ? SEEDING_PHASES : ASSIGNMENT_PHASES).map(s => [s.id, s.label])], state.filter)
    + '</select></label><div class="wf-list">'
    + journeys.filter(j => !state.filter || models.find(m => m.journey.assignmentId === j.assignmentId)?.current === state.filter).map(j => {
      const m = models.find(item => item.journey.assignmentId === j.assignmentId);
      return '<button type="button" class="wf-creator aw-board-row" data-wf="open" data-wf-assignment="' + escape(j.assignmentId) + '">'
        + '<strong>' + escape(j.displayName || creatorName(j.creatorId)) + '</strong><span>'
        + escape(m ? m.phases.find(p => p.current).label : "Calculated phase unavailable until loaded")
        + '</span><span>Open workflow →</span></button>';
    }).join("")
    + (journeys.length ? "" : '<p class="wf-empty">No creator assignments available.</p>') + "</div></div>";
  return '<section class="pj-workspace wf-workspace" data-wf-campaign="' + escape(campaign.id) + '" aria-label="' + escape(campaign.name) + ' creator workflows">'
    + (sample ? '<p class="wf-connection">Sample data · changes reset on refresh · no emails, shipments, or payments are sent.</p>' : "")
    + (state.error ? '<p class="pj-error" role="alert">' + escape(state.error) + "</p>" : "")
    + (state.notice ? '<p class="wf-notice" role="status">' + escape(state.notice) + "</p>" : "")
    + continuationPanel
    + (!sample ? renderFleetFindings(campaign,state,creatorName) : '')
    + (!sample ? '<div class="aw-load"><button type="button" class="button button--secondary" data-wf="load"' + (state.loading ? " disabled" : "") + '>' + (state.loading ? "Loading saved evidence…" : "Reload saved evidence") + "</button></div>" : "")
    + (state.activeAssignment && state.continuationOnly ? '<button type="button" class="button button--secondary" data-wf="back">All creator workflows</button>'+renderOutreachReceipts(journeys.find(j=>j.assignmentId===state.activeAssignment)) : state.activeAssignment ? selected ? renderAssignmentWorkflow(selected, { selectedPhase: phase, form })
      : '<div class="wf-empty" role="status"><h2>' + (state.loading ? "Loading this creator’s campaign…" : "Assignment workflow unavailable") + '</h2><p>No phase is inferred without the saved assignment evidence.</p><button type="button" class="button button--secondary" data-wf="back">All creator workflows</button></div>'
      : '<header class="pj-heading"><div><h2>Creator workflows</h2><p>Open a creator’s campaign at its calculated phase.</p></div></header>' + board)
    + "</section>";
}
export function installPaidJourneyUI({ root, getCampaign, canEdit, canContinue = () => false, canManageContinuation = () => false, requestJson, rerender, preview = false, onNavigate = () => {} }) {
  if (!preview) installContinuationUI({ root, getCampaign: id => { const campaign = getCampaign(id); return campaign && canContinue(campaign) ? campaign : null; },
    canEdit: campaign => canManageContinuation(campaign) && String(campaign.status).toLowerCase() !== 'archived', requestJson, rerender });
  const context = target => {
    const section = target.closest("[data-wf-campaign]");
    if (!section) return {};
    const campaign = getCampaign(section.dataset.wfCampaign);
    if (!campaign) return {};
    const state = stateFor(campaign);
    const assignmentId = target.closest("[data-wf-assignment]")?.dataset.wfAssignment || state.activeAssignment;
    return { campaign, state, assignmentId, journey: state.journeys?.find(j => j.assignmentId === assignmentId && j.campaignId === campaign.id) };
  };
  const focusPanel = () => root.querySelector("#aw-phase-content")?.focus();
  root.addEventListener("change", e => {
    const { state, assignmentId } = context(e.target);
    if (!state) return;
    if (e.target.matches("[data-wf-filter]")) {
      state.filter = e.target.value;
      rerender(); root.querySelector("[data-wf-filter]")?.focus();
    } else if (e.target.matches("[data-wf-kind]")) {
      state.forms[assignmentId] = e.target.value;
      rerender();
      const form = root.querySelector('[data-wf-form="record"]');
      if (form) { form.closest("details").open = true; form.querySelector("[data-wf-kind]").focus(); }
    }
  });
  root.addEventListener("click", async e => {
    const button = e.target.closest("[data-wf]");
    if (!button) return;
    const { campaign, state, assignmentId, journey } = context(button);
    if (!state) return;
    state.notice = null;
    if(button.dataset.wf==='fleet-more'){
      if((preview || state.preview)||state.fleetLoading||!state.fleetFindings?.hasMore)return;
      const selected=state.activeAssignment,token=state.requestToken,page=state.fleetFindings;
      state.fleetLoading=true;
      try{
        const result=await requestJson('/api/campaigns/'+encodeURIComponent(campaign.id)+'/agent-findings?offset='+page.nextOffset+(selected?'&assignmentId='+encodeURIComponent(selected):''));
        if(cache.get(campaign.id)===state&&state.requestToken===token&&state.activeAssignment===selected){
          const data=result.data||result;if(!Array.isArray(data.items))throw Error('Saved findings could not be loaded.');
          state.fleetFindings={...data,items:[...page.items,...data.items].filter((row,index,rows)=>rows.findIndex(other=>other.id===row.id)===index)};
        }
      }catch{state.notice='Older Fleet findings could not be loaded. Try again.';}
      finally{state.fleetLoading=false;rerender();}
      return;
    }
    if(button.dataset.wf==='jev-stop'){
      if((preview || state.preview)||state.jevStopping||!canEdit(campaign)||String(campaign.status).toLowerCase()==='archived')return;
      state.jevStopping=true;rerender();
      try{await requestJson(`/api/campaigns/${encodeURIComponent(campaign.id)}/workflow`,{method:'POST',csrf:true,body:{operation:'stop_jev'}});
        state.notice='Jev reply classification stopped for your agency. Existing email approval controls remain active.';
      }catch(error){state.notice=error.message||'Stop could not be confirmed. Reload and check the service.';}
      finally{state.jevStopping=false;await loadPaidJourneys(campaign,requestJson);rerender();}
      return;
    }
    if (['managed-start','managed-reconcile'].includes(button.dataset.wf)) {
      if ((preview || state.preview) || state.managedSaving || !canEdit(campaign) || String(campaign.status).toLowerCase()==='archived' || !journey) return;
      const plan = journey.managedPlans?.find(p => p.scenarioId===button.dataset.managedScenario && p.assignmentId===assignmentId
        && p.campaignId===campaign.id && p.creatorId===journey.creatorId && Date.parse(p.expiresAt)>Date.now());
      if (!plan) return;
      state.managedSaving=true;state.error=null;rerender();
      try {
        await requestJson(`/api/campaigns/${encodeURIComponent(campaign.id)}/managed-results${button.dataset.wf==='managed-reconcile'?'/reconcile':''}`,
          {method:'POST',csrf:true,body:{assignmentId:plan.assignmentId,expectedRevision:plan.expectedRevision,scenarioId:plan.scenarioId,workflowType:plan.workflowType}});
        state.notice='Managed simulation updated. Review the saved result; nothing was sent.';
      } catch(error) { state.notice=error.message||'Managed simulation unavailable. Reload saved results before another action.'; }
      finally { state.managedSaving=false;await loadPaidJourneys(campaign,requestJson);if(cache.get(campaign.id)===state){rerender();focusPanel();} }
      return;
    }
    if (button.dataset.wf === "phase") {
      if (!(isSeedingCampaign(campaign) ? SEEDING_PHASES : ASSIGNMENT_PHASES).some(s => s.id === button.dataset.phase)) return;
      state.phase = button.dataset.phase;
      rerender(); focusPanel(); return;
    }
    if (button.dataset.wf === "back") {
      invalidateContinuationSelection(campaign.id); state.requestToken = Symbol(); state.pending = null; state.loading = false;
      state.activeAssignment = null; state.phase = null; onNavigate(null);
      if(!(preview || state.preview))await loadPaidJourneys(campaign,requestJson);
      rerender(); root.querySelector('[data-wf="open"]')?.focus(); return;
    }
    if (button.dataset.wf === "open") {
      if (!state.pending || state.pendingAssignment !== assignmentId) invalidateContinuationSelection(campaign.id);
      state.activeAssignment = assignmentId; state.phase = null; onNavigate(assignmentId);
      const loading = !(preview || state.preview) ? loadPaidJourneys(campaign, requestJson) : Promise.resolve();
      rerender(); await loading;
    } else if (button.dataset.wf === "load") {
      const loading = !(preview || state.preview) ? loadPaidJourneys(campaign, requestJson) : Promise.resolve(); rerender(); await loading;
    }
    if (cache.get(campaign.id) !== state) return;
    rerender(); focusPanel();
  });
  root.addEventListener("submit", async e => {
    if (!e.target.matches('[data-wf-form="record"], [data-wf-form="bind"], [data-wf-form="resolve"]')) return;
    const form=e.target;
    e.preventDefault();
    const { campaign, state, journey } = context(e.target);
    if (!state || state.saving) return;
    const f = Object.fromEntries(new FormData(e.target));
    state.error = null; state.notice = null; state.saving = true;
    try {
      if (['bind','resolve'].includes(form.dataset.wfForm)) {
        if ((preview || state.preview) || !canEdit(campaign) || !journey) throw new Error('Load the saved staff workflow first');
        let body;
        if (form.dataset.wfForm === 'resolve') body = { operation: 'resolve', assignmentId: journey.assignmentId, reviewId: f.reviewId, resolution: f.resolution };
        else {
          const config = Object.fromEntries(Object.entries(f).filter(([k]) => !['source','engagement'].includes(k)));
          if (f.source === 'boldsign') config.signerIds = config.signerIds.split(',').map(x => x.trim()).filter(Boolean);
          if (f.source === 'warehouse') { config.row = Number(config.row); config.sheetName = 'Sample New 2026'; }
          if (f.source === 'responses') { config.row = Number(config.row); config.requiredColumns = config.requiredColumns.split(',').map(x => x.trim().toUpperCase()).filter(Boolean); }
          if (f.source === 'gmail') {
            for(const name of ['creatorEmail','managerEmail','managerName','mailboxEmail','reviewedMessageId'])if(!config[name]?.trim())delete config[name];
            if(config.contactsVerified==='on')config.contactsVerified=true;
            if(config.reviewExistingReply==='on')config.reviewExistingReply=true;
          }
          body = { operation: 'bind', assignmentId: journey.assignmentId, idempotencyKey: crypto.randomUUID(), source: f.source, category: f.engagement, config };
        }
        await requestJson(`/api/campaigns/${encodeURIComponent(campaign.id)}/workflow`, { method: 'POST', csrf: true, body });
        const result = await requestJson(`/api/campaigns/${encodeURIComponent(campaign.id)}/workflow`);
        if (cache.get(campaign.id) !== state) return;
        state.journeys = (result.data || result).journeys;
        state.notice = 'Source review saved. No email sent.';
        rerender(); return;
      }
      if (isSeedingCampaign(campaign)) throw new Error("Use the Seeding operations review to record a decision.");
      if (!canEdit(campaign) || !journey) throw new Error("Saved assignment records and staff editing permission are required.");
      const current = assignmentWorkflowModel(
        (preview || state.preview) ? { ...campaign, assignments: campaign.assignments || [{ id: journey.assignmentId, creatorId: journey.creatorId }] } : campaign, journey);
      if (!current) throw new Error("Assignment scope is unavailable. Reload before saving.");
      const phase = state.phase || current.current;
      if (!phaseRecordKinds[phase]?.includes(f.kind)) throw new Error("Choose an action for this phase.");
      const data = {};
      if (f.kind === "terms") Object.assign(data, { creativeIds: f.creativeIds.split(",").map(x => x.trim()).filter(Boolean), postIds: f.postIds.split(",").map(x => x.trim()).filter(Boolean), usageDays: Number(f.usageDays), adCodeRequired: f.adCodeRequired === "true" });
      for (const field of ["reference", "carrier", "tracking", "deliverableId", "revision", "url", "notes", "item"]) if (f[field] !== undefined) data[field] = f[field];
      if (f.kind === "approval" && f.humanApproval !== "on") throw new Error("Explicit human approval of this draft version is required.");
      const event = validateWorkflowEvent({ id: crypto.randomUUID(), kind: f.kind, data, note: f.note, at: new Date(f.at).toISOString(), source: f.source, certainty: f.certainty });
      if ((preview || state.preview)) { journey.workflowEvents.push(event); journey.revision++; }
      else {
        await requestJson("/api/campaigns/" + encodeURIComponent(campaign.id) + "/workflow", { method: "POST", csrf: true, body: { assignmentId: journey.assignmentId, expectedRevision: journey.revision, idempotencyKey: event.id, event } });
        await loadPaidJourneys(campaign, requestJson);
        if (state.error) throw new Error("The save was accepted, but refreshed evidence is unavailable. Reload before another change.");
      }
      state.notice = (preview || state.preview) ? "Sample evidence saved. No email sent." : "Staff evidence saved. No email sent.";
    } catch (error) { state.error = error.message; }
    finally { state.saving = false; }
    if (cache.get(campaign.id) !== state) return;
    rerender();
    const notice = root.querySelector('[role="alert"], [role="status"]');
    if (notice) { notice.setAttribute("tabindex", "-1"); notice.focus(); }
  });
}
