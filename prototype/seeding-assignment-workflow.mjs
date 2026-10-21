import { safeWorkflowUrl } from './campaign-workflow.mjs';
// Read-only projection of the existing Seeding worker. Viewing never enrolls or queues actions.
export const SEEDING_PHASES = [
  ["selected", "Creator and campaign"], ["outreach", "Invitation and acceptance"],
  ["form", "Shipping form and agreements"], ["warehouse", "Warehouse handoff"],
  ["delivery", "Shipment and delivery"], ["receipt", "Creator receipt confirmation"],
  ["content", "Content and follow-up"], ["video", "Published content"],
  ["review", "Staff review"], ["complete", "Completion and thank-you"]
].map(([id, label]) => ({ id, label }));
export const isSeedingCampaign = campaign => String(campaign?.type || "").toLowerCase() === "seeding";

export function seedingAssignmentState(journey, rows, { error = null } = {}) {
  const matches = (rows || []).filter(row => row.creatorId === journey.creatorId)
    .flatMap(row => Object.values(row.participations || {}).filter(p => p.id === journey.assignmentId
      && p.campaignId === journey.campaignId && (!p.creatorId || p.creatorId === journey.creatorId))
      .map(p => ({ row, p })));
  const match = matches.length === 1 ? matches[0] : null;
  const p = match?.p;
  const row = match?.row;
  const invitations=(journey.outreachReceipts||[]).filter(r=>r.campaignId===journey.campaignId&&r.assignmentId===journey.assignmentId&&r.creatorId===journey.creatorId&&r.invitationEvent?.kind==='outreach'&&r.invitationEvent?.certainty==='confirmed'&&r.invitationEvent?.source==='integration'&&/^[A-Za-z0-9_-]{8,256}$/.test(r.providerMessageId||'')&&/^[A-Za-z0-9_-]{8,256}$/.test(r.providerThreadId||''));
  const invitation=invitations.at(-1)||null;
  const sendTimeNeedsReview=(journey.outreachReceipts||[]).some(r=>r.confirmed===true&&r.timestampNeedsReview===true&&r.campaignId===journey.campaignId&&r.assignmentId===journey.assignmentId&&r.creatorId===journey.creatorId);
  const actions = (row?.actions || []).filter(a => a.participationId === journey.assignmentId
    && (!a.campaignId || a.campaignId === journey.campaignId));
  const flags = (row?.flags || []).filter(f => !f.resolved && (!f.participationId || f.participationId === journey.assignmentId));
  const judgments = Object.values(row?.replyJudgments || {}).filter(j => j.participationId === journey.assignmentId && j.status === "pending_review");
  const required = Array.isArray(p?.requiredDeliverables) ? p.requiredDeliverables : [];
  const content = required.map(id => ({ id, ...(p?.deliverables?.[id] || {}) }));
  const allVerified = required.length > 0 && content.every(d => d.verifiedBy && d.evidenceId && safeWorkflowUrl(d.url));
  const held = !!(p?.deliveryPaused || p?.replyReview || row?.optedOut || flags.length || judgments.length);
  const complete = p?.stage === "completed" && allVerified && !held;
  let current = ({ invited: "outreach", awaiting_form: "form", ready_for_warehouse: "warehouse",
    in_transit: "delivery", awaiting_content: p?.receiptConfirmedAt ? "content" : "receipt",
    completed: complete ? "complete" : "review", declined: "review" })[p?.stage] || "review";
  if(!p&&invitation&&matches.length===0&&!error)current='outreach';
  if (held) current = "review";
  const reason = error || (matches.length > 1 ? "Conflicting Seeding records need staff review."
    : !p ? invitation ? "Invitation sent. Creator acceptance and Seeding enrollment still need confirmation." : sendTimeNeedsReview ? "Gmail confirmed an invitation, but its send time is unavailable. Review before assigning a phase." : journey.outreachReceiptsUnavailable ? "Invitation send evidence is unavailable. Reload before assigning a phase." : "No Seeding worker record is linked to this assignment. Review imported evidence before assigning a phase."
    : held ? "Resolve the recorded hold before continuing."
    : p.stage === "declined" ? "Creator declined. No follow-up is proposed."
    : !["invited", "awaiting_form", "ready_for_warehouse", "in_transit", "awaiting_content", "completed"].includes(p.stage)
      ? "The recorded Seeding stage needs review." : null);
  const done = { selected: !!p||!!invitation, outreach: !!p && (["awaiting_form", "ready_for_warehouse"].includes(p.stage) || !!p.formResponseId),
    form: !!p?.formResponseId, warehouse: actions.some(a => a.kind === "warehouse_request" && a.status === "succeeded"),
    delivery: !!p?.deliveredAt, receipt: !!p?.receiptConfirmedAt, content: allVerified, video: allVerified,
    review: complete, complete };
  const next = { outreach: ["Creator / representative", "Review the invitation and confirm product-only terms."],
    form: ["Creator", "Complete the shipping form and campaign agreements."],
    warehouse: ["Our team", "Check the validated form and warehouse handoff."],
    delivery: ["Warehouse / carrier", "Record tracking and verify delivery."],
    receipt: ["Creator", "Confirm possession or report a missing or damaged package."],
    content: ["Creator / our team", "Collect the agreed content and review any scheduled follow-up."],
    review: ["Our team", reason || "Verify evidence for every agreed deliverable."],
    complete: ["Our team", "Check CRM completion and the recorded thank-you outcome."] }[current];
  return { participation: p || null, invitation, invitations, current, complete, reason, actions, flags, judgments, content, required,
    dueDate: p?.dueDate || null, updatedAt: row?.updatedAt || null, nextParty: next[0], nextAction: next[1],
    phases: SEEDING_PHASES.map(phase => ({ ...phase, current: phase.id === current, done: done[phase.id] === true })) };
}
