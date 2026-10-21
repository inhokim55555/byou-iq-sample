import { documentText } from './email-content.mjs';
import { TEMPLATE_DEFAULTS, LEGACY_PHASE_TEMPLATE_KEYS, WRITING_GUIDANCE_DEFAULTS, validateWritingGuidance, buildCampaignDraftRequest, sharedReminderText } from "./campaign-message-guidance.mjs";
export { TEMPLATE_DEFAULTS } from "./campaign-message-guidance.mjs";
// Campaign-assignment scoped, deterministic workflow. No network or provider calls.
export const WORKFLOW_STAGES = [
  ["selected", "Creator selected", 1], ["outreach", "Initial outreach", 1],
  ["terms", "Pricing negotiated", 1], ["contract", "Contract prepared and sent", 1],
  ["signature", "Awaiting BoldSign completion", 1], ["address", "Awaiting shipping information", 2],
  ["delivery", "Shipping and delivery", 2], ["draft", "Awaiting first draft", 2],
  ["review", "Manual review and revisions", 2], ["publication", "Approved / awaiting publication", 2],
  ["overdue_post", "Posting overdue / awaiting live link", 2], ["documents", "Live link / required documents", 2],
  ["complete", "Complete", 2]
].map(([id, label, phase]) => ({ id, label, phase }));
export const EVENT_FIELDS = {
  selected: [], outreach: [], terms: ["creativeIds", "postIds", "usageDays", "adCodeRequired"],
  contract_sent: ["reference"], contract_signed: ["reference"],
  shipping_info: ["reference"], shipment: ["carrier", "tracking"],
  carrier_delivery: [], receipt: [], delivery_issue: [], delivery_resolved: [],
  draft: ["deliverableId", "revision", "url"], feedback_sent: ["deliverableId", "revision"], feedback: ["deliverableId", "revision", "notes"],
  approval: ["deliverableId", "revision"], live_link: ["deliverableId", "url"],
  document: ["item"], deadline: ["target", "date"], delay: ["target", "proposedDate"],
  reply: ["ambiguous"], reply_resolved: [], email: ["direction", "subject", "messageId"],
  correction: ["stage"], automation: ["paused"], config: ["policy"],
  reminder: ["key", "status", "messageId"]
};
export const DEFAULT_POLICY = Object.freeze({
  timezone: "America/Los_Angeles", sendTime: "", endOfDayTime: "",
  contractInterval: null, addressInterval: null, documentInterval: null,
  secondDraftReminderConfirmed: true, reviewed: false, templates: {}, templateDocuments: {}, writingGuidance: WRITING_GUIDANCE_DEFAULTS
});
export const validDate = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
export const plusDays = (date, days) => new Date(Date.parse(date) + days * 86400000).toISOString().slice(0, 10);
const bounded = (v, n = 500) => typeof v === "string" && v.trim().length > 0 && v.length <= n;
const ids = v => Array.isArray(v) && v.length > 0 && v.length <= 30 && v.every(x => bounded(x, 80)) && new Set(v).size === v.length;
export function safeWorkflowUrl(value) {
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password && !url.port ? url.href : null; } catch { return null; }
}
export function validatePolicy(policy) {
  if (!policy || typeof policy !== "object" || Array.isArray(policy) || Object.keys(policy).some(k => !Object.hasOwn(DEFAULT_POLICY, k))) throw new Error("Unsupported automation setting");
  const p = { ...DEFAULT_POLICY, ...policy };
  try { if (!bounded(p.timezone, 120)) throw new Error(); new Intl.DateTimeFormat("en", { timeZone: p.timezone }).format(); } catch { throw new Error("Choose a valid timezone"); }
  for (const field of ["sendTime", "endOfDayTime"]) if (typeof p[field] !== "string" || p[field] !== "" && !/^([01]\d|2[0-3]):[0-5]\d$/.test(p[field])) throw new Error("Choose a valid sending time");
  for (const field of ["contractInterval", "addressInterval", "documentInterval"]) if (p[field] !== null && (!Number.isInteger(p[field]) || p[field] < 1 || p[field] > 90)) throw new Error("Cadence must be blank or 1–90 calendar days");
  if (typeof p.reviewed !== "boolean" || typeof p.secondDraftReminderConfirmed !== "boolean") throw new Error("Invalid policy decision");
  if (!p.templates || typeof p.templates !== "object" || Array.isArray(p.templates)) throw new Error("Invalid templates");
  for (const [key, value] of Object.entries(p.templates)) if ((!Object.hasOwn(TEMPLATE_DEFAULTS, key) && !LEGACY_PHASE_TEMPLATE_KEYS.includes(key)) || !(key === "outreach" && value === "") && !bounded(value, 2000)) throw new Error("Invalid email template");
  if(!p.templateDocuments||typeof p.templateDocuments!=='object'||Array.isArray(p.templateDocuments))throw new Error('Invalid formatted templates');
  for(const [key,doc] of Object.entries(p.templateDocuments))if(!Object.hasOwn(TEMPLATE_DEFAULTS,key)||documentText(doc).trim()!==(p.templates[key]||'').trim())throw new Error('Template formatting differs from its text');
  p.writingGuidance = validateWritingGuidance(p.writingGuidance);
  return structuredClone(p);
}
export function validateWorkflowEvent(event) {
  if (!event || !bounded(event.id, 100) || !Object.hasOwn(EVENT_FIELDS, event.kind) || !event.data || typeof event.data !== "object" || Array.isArray(event.data)) throw new Error("Invalid workflow event");
  if (!bounded(event.at, 40) || !/^\d{4}-\d{2}-\d{2}T/.test(event.at) || !Number.isFinite(Date.parse(event.at))) throw new Error("An event timestamp is required");
  if (!["team", "creator", "integration"].includes(event.source) || !["confirmed", "inferred"].includes(event.certainty) || !bounded(event.note, 1000)) throw new Error("Source, certainty, and a note are required");
  if (Object.keys(event).some(k => !["id", "kind", "at", "source", "certainty", "note", "data", "recordedAt", "recordedBy"].includes(k)) || Object.keys(event.data).some(k => !EVENT_FIELDS[event.kind].includes(k))) throw new Error("Unsupported workflow field");
  const d = event.data;
  if (["terms", "approval", "feedback", "feedback_sent", "deadline", "correction", "automation", "config", "reply_resolved"].includes(event.kind) && event.source !== "team") throw new Error("This action requires explicit human staff input");
  if (event.kind === "terms" && (!ids(d.creativeIds) || !ids(d.postIds) || typeof d.adCodeRequired !== "boolean" || !Number.isInteger(d.usageDays) || d.usageDays < 0 || d.usageDays > 3650 || d.adCodeRequired && d.usageDays !== 30)) throw new Error("Record deliverables and confirm whether applicable 30-day ad rights require an ad code");
  if (["contract_sent", "contract_signed", "shipping_info"].includes(event.kind) && (!bounded(d.reference, 200) || /\s/.test(d.reference))) throw new Error("Record the existing secure record ID or link, without document contents");
  if (event.kind === "shipment" && (!bounded(d.carrier, 60) || !bounded(d.tracking, 120))) throw new Error("Carrier and tracking number are required");
  if (["draft", "feedback", "feedback_sent", "approval", "live_link"].includes(event.kind) && !bounded(d.deliverableId, 80)) throw new Error("Choose a deliverable");
  if (["draft", "feedback", "feedback_sent", "approval"].includes(event.kind) && !bounded(d.revision, 80)) throw new Error("Record the exact draft version");
  if (["draft", "live_link"].includes(event.kind) && !safeWorkflowUrl(d.url)) throw new Error("Use an HTTPS link");
  if (event.kind === "feedback" && !bounded(d.notes, 1000)) throw new Error("Enter the human review notes");
  if (event.kind === "document" && !["w9", "invoice", "ad_code"].includes(d.item)) throw new Error("Choose the received item");
  if (["deadline", "delay"].includes(event.kind) && !["draft", "posting"].includes(d.target)) throw new Error("Choose a deadline");
  if (event.kind === "deadline" && !validDate(d.date) || event.kind === "delay" && d.proposedDate && !validDate(d.proposedDate)) throw new Error("Use a valid calendar date");
  if (event.kind === "reply" && typeof d.ambiguous !== "boolean") throw new Error("Classify the reply for review");
  if (event.kind === "email" && (!["inbound", "outbound"].includes(d.direction) || !bounded(d.subject, 200) || !bounded(d.messageId, 200))) throw new Error("Record email direction, subject, and message reference");
  if (event.kind === "correction" && !WORKFLOW_STAGES.some(s => s.id === d.stage)) throw new Error("Choose a workflow stage");
  if (event.kind === "automation" && typeof d.paused !== "boolean") throw new Error("Choose paused or resumed");
  if (event.kind === "config") validatePolicy(d.policy);
  if (event.kind === "reminder" && (!bounded(d.key, 300) || !["planned", "sending", "sent", "uncertain", "failed", "cancelled"].includes(d.status) || d.status === "sent" && !bounded(d.messageId, 200))) throw new Error("Invalid reminder outcome");
  return structuredClone(event);
}
export function localClock(now, timezone) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(now)).map(p => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}
export function projectWorkflow(journey, { now = new Date().toISOString(), liveReady = false } = {}) {
  const valid = [], invalid = [];
  const seen = new Set();
  for (const raw of journey.workflowEvents || []) { try { const e = validateWorkflowEvent(raw); if (!seen.has(e.id)) valid.push(e); seen.add(e.id); } catch { invalid.push(raw.id); } }
  valid.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const facts = valid.filter(e => e.certainty === "confirmed" && Date.parse(e.at) <= Date.parse(now));
  const last = (kind, match = () => true) => facts.filter(e => e.kind === kind && match(e)).at(-1);
  const assignmentPolicy = last("config")?.data.policy;
  const policy = validatePolicy(assignmentPolicy && journey.campaignPolicy ? {
    ...journey.campaignPolicy, ...assignmentPolicy,
    templates: { ...journey.campaignPolicy.templates, ...assignmentPolicy.templates },
    templateDocuments: {...journey.campaignPolicy.templateDocuments,...assignmentPolicy.templateDocuments},
    writingGuidance: journey.campaignPolicy.writingGuidance || assignmentPolicy.writingGuidance,
    reviewed: journey.campaignPolicy.reviewed === true && assignmentPolicy.reviewed === true
  } : assignmentPolicy || journey.campaignPolicy || DEFAULT_POLICY);
  const clock = localClock(now, policy.timezone);
  const terms = last("terms")?.data;
  const drafts = (terms?.creativeIds || []).map(id => last("draft", e => e.data.deliverableId === id));
  const reviews = drafts.map(d => d && facts.filter(e => ["approval", "feedback"].includes(e.kind) && e.data.deliverableId === d.data.deliverableId && e.data.revision === d.data.revision && Date.parse(e.at) >= Date.parse(d.at)).at(-1));
  const allDrafts = drafts.length > 0 && drafts.every(Boolean);
  const allApproved = allDrafts && reviews.every(e => e?.kind === "approval");
  const feedbackPending = reviews.some(e => e?.kind === "feedback" && !facts.some(sent => sent.kind === "feedback_sent" && sent.data.deliverableId === e.data.deliverableId && sent.data.revision === e.data.revision && Date.parse(sent.at) >= Date.parse(e.at)));
  const needsRevision = !feedbackPending && reviews.some(e => e?.kind === "feedback");
  const posts = (terms?.postIds || []).map(id => last("live_link", e => e.data.deliverableId === id));
  const allLinks = posts.length > 0 && posts.every(Boolean);
  const documents = Object.fromEntries(["w9", "invoice", "ad_code"].map(item => [item, item === "ad_code" && terms?.adCodeRequired === false ? "Not required" : last("document", e => e.data.item === item) ? "Received" : "Missing"]));
  if (!terms) documents.ad_code = "Agreement needs review";
  const missingItems = Object.entries(documents).filter(([, state]) => state !== "Received" && state !== "Not required").map(([item]) => item);
  const deadlines = Object.fromEntries(["draft", "posting"].map(target => [target, last("deadline", e => e.data.target === target)?.data.date || null]));
  const pendingDelay = ["draft", "posting"].map(target => last("delay", e => e.data.target === target)).filter(e => e && facts.indexOf(e) > facts.indexOf(last("deadline", d => d.data.target === e.data.target))).at(-1);
  const ambiguous = last("reply", e => e.data.ambiguous);
  const unresolvedReply = ambiguous && facts.indexOf(ambiguous) > facts.indexOf(last("reply_resolved"));
  const deliveryIssue = last("delivery_issue");
  const deliveryProblem = deliveryIssue && facts.indexOf(deliveryIssue) > facts.indexOf(last("delivery_resolved"));
  const reviewPending = allDrafts && !allApproved && !needsRevision;
  const complete = !!terms && !!last("contract_signed") && allApproved && allLinks && missingItems.length === 0 && !deliveryProblem && !unresolvedReply && !pendingDelay;
  let stage = !last("selected") ? "selected" : !last("outreach") ? "outreach" : !terms ? "terms" : !last("contract_sent") ? "contract" : !last("contract_signed") ? "signature" : !last("shipping_info") ? "address" : !last("receipt") ? "delivery" : !allDrafts ? "draft" : !allApproved ? "review" : !allLinks ? deadlines.posting && clock.date > deadlines.posting ? "overdue_post" : "publication" : "documents";
  // Independent later milestones can be recorded without inventing missing earlier facts.
  if (allLinks) stage = allApproved ? "documents" : "review";
  else if (allDrafts) stage = allApproved ? deadlines.posting && clock.date > deadlines.posting ? "overdue_post" : "publication" : "review";
  if (complete) stage = "complete";
  const evidenceStage = stage;
  const correction = last("correction");
  if (correction) stage = correction.data.stage;
  const overdueDraft = !allDrafts && !!deadlines.draft && clock.date > deadlines.draft;
  const overduePost = !allLinks && !!deadlines.posting && clock.date > deadlines.posting;
  const teamStages = ["selected", "outreach", "terms", "contract", "delivery", "review"];
  let nextParty = teamStages.includes(evidenceStage) ? "Our team" : "Creator";
  let nextAction = {
    selected: "Record campaign selection", outreach: "Send initial outreach manually", terms: "Record agreed pricing and deliverables",
    contract: "Prepare and send the contract manually", signature: "Return the signed contract", address: "Provide shipping details",
    delivery: last("shipment") ? "Confirm receipt or report a delivery problem" : "Ship the product and record tracking",
    draft: "Submit the first draft", review: !allDrafts ? "Obtain missing drafts before human review" : feedbackPending ? "Send the reviewed revision notes to the creator manually" : needsRevision ? "Submit the revised draft" : "Review the latest draft and enter feedback or approval",
    publication: "Publish by the agreed posting deadline", overdue_post: "Publish and provide the live link",
    documents: "Provide the missing required items", complete: "No action required"
  }[evidenceStage];
  if (evidenceStage === "delivery" && last("shipment") || evidenceStage === "review" && needsRevision) nextParty = "Creator";
  if (journey.reviewItems?.length || unresolvedReply || deliveryProblem || pendingDelay) { nextParty = "Our team"; nextAction = journey.reviewItems?.length ? "Review pending source evidence" : unresolvedReply ? "Review the ambiguous reply" : deliveryProblem ? "Resolve the reported delivery problem" : "Confirm a revised deadline with the creator"; }
  const summaries = {
    selected: "Selection not recorded — waiting for our team to confirm participation.",
    outreach: "Creator selected — waiting for our team to send initial outreach.",
    terms: "Outreach recorded — waiting for our team to record negotiated terms.",
    contract: "Terms recorded — waiting for our team to prepare and send the contract.",
    signature: "Contract sent — waiting for the signed return.",
    address: "Contract signed — waiting for the creator’s shipping details.",
    delivery: last("carrier_delivery") ? "Carrier reports delivery — waiting for the creator to confirm receipt." : last("shipment") ? "Product shipped — waiting for delivery and receipt confirmation." : "Shipping details received — waiting for our team to ship the product.",
    draft: `Product received — waiting for the first draft${deadlines.draft ? ", due " + deadlines.draft : "; deadline not recorded"}.`,
    review: !allDrafts ? "Live link recorded — missing drafts and human approvals still need review." : feedbackPending ? "Revision notes entered — waiting for our team to send the feedback." : needsRevision ? "Revision feedback sent — waiting for the creator’s revised draft." : "Draft received — waiting for our team to review and approve the latest version.",
    publication: "Final draft approved — waiting for the creator to publish.",
    overdue_post: "Posting deadline passed — waiting for the creator’s live link.",
    documents: `Video live — waiting for ${missingItems.length ? missingItems.map(item => ({ w9: "W-9", invoice: "invoice", ad_code: "ad code" }[item])).join(", ") : "remaining human checks"}.`,
    complete: "Required deliverables, documents, and human approvals are recorded — workflow complete."
  };
  const summary = deliveryProblem ? "Delivery problem reported — waiting for our team to resolve it." : unresolvedReply ? "Reply needs interpretation — waiting for our team to review." : pendingDelay ? "Creator reported a delay — waiting for a confirmed revised deadline." : summaries[evidenceStage];
  const done = { selected: !!last("selected"), outreach: !!last("outreach"), terms: !!terms, contract: !!last("contract_sent"), signature: !!last("contract_signed"), address: !!last("shipping_info"), delivery: !!last("receipt"), draft: allDrafts, review: allApproved, publication: allLinks, overdue_post: allLinks, documents: missingItems.length === 0 && allLinks, complete };
  const stageIndex = WORKFLOW_STAGES.findIndex(s => s.id === stage);
  const steps = WORKFLOW_STAGES.map((s, i) => ({ ...s, status: s.id === stage ? "current" : s.id === "overdue_post" && allLinks && !facts.some(e => e.kind === "reminder" && e.data.key.includes("posting_overdue")) ? "skipped" : done[s.id] ? "completed" : i < stageIndex ? "missing record" : "upcoming" }));
  const paused = last("automation")?.data.paused ?? false;
  const reviewResolved = last("reply_resolved");
  const requiresEvidenceReview = valid.some(e => e.certainty === "inferred" && (!reviewResolved || Date.parse(e.at) >= Date.parse(reviewResolved.at))) || invalid.length > 0;
  const hasAttempt = kind => facts.some(e => e.kind === "reminder" && e.data.key.includes(":" + kind + ":") && e.data.status !== "cancelled");
  const configurationMissing = !policy.reviewed || !policy.sendTime || !policy.endOfDayTime || evidenceStage === "signature" && !policy.contractInterval || evidenceStage === "address" && hasAttempt("address") && !policy.addressInterval || evidenceStage === "documents" && hasAttempt("documents") && !policy.documentInterval;
  const missingDeadline = evidenceStage === "draft" && !deadlines.draft || ["publication", "overdue_post"].includes(evidenceStage) && !deadlines.posting;
  const humanInput = !!journey.reviewItems?.length || nextParty === "Our team" && !complete || requiresEvidenceReview || !terms || missingDeadline;
  const needsInput = humanInput || !complete && configurationMissing;
  const automation = paused ? "Paused" : complete ? "Complete" : journey.phase2Verified === false ? "Waiting for verified BoldSign completion" : journey.reviewItems?.length ? "Waiting for source review" : humanInput ? "Waiting for human input" : configurationMissing ? "Waiting for configuration" : liveReady ? "Active" : "Active in preview only";
  return { key: `${journey.campaignId}:${journey.assignmentId}`, stage, evidenceStage, steps, summary, nextAction, nextParty, owner: nextParty === "Creator" ? journey.displayName || "Creator" : journey.ownerName || "Assigned campaign owner not recorded", due: ["publication", "overdue_post", "documents"].includes(evidenceStage) ? allLinks ? null : deadlines.posting : allDrafts ? null : deadlines.draft, deadlines, overdue: overdueDraft || overduePost, needsInput, requiresEvidenceReview, automation, paused, complete, policy, clock, terms, drafts, reviews, posts, documents, missingItems, allDrafts, allApproved, allLinks, reviewPending, needsRevision, pendingDelay, unresolvedReply, deliveryProblem, last, events: valid, invalid, correction, liveReady };
}
export function planWorkflowEmails(journey, options = {}) {
  const p = projectWorkflow(journey, options), candidates = [];
  const add = (kind, trigger, anchor, cadence, time = p.policy.sendTime, date = p.clock.date, followup = false) => {
    const key = `${p.key}:${kind}:${anchor}:${date}`;
    const previous = p.events.filter(e => e.kind === "reminder" && e.certainty === "confirmed" && e.data.key === key).at(-1);
    const simple = followup || ["contract", "draft_due", "draft_second", "posting_overdue"].includes(kind);
    const draftRequest = simple ? null : buildCampaignDraftRequest(journey, p, { kind });
    const reminder = simple ? sharedReminderText(kind, p, journey) : null;
    const body = reminder?.body || null;
    const outcomes = new Map(p.events.filter(e => e.kind === "reminder" && e.certainty === "confirmed").map(e => [e.data.key, e.data.status]));
    const unresolvedSend = [...outcomes.values()].some(s => ["sending", "uncertain", "failed"].includes(s));
    const blocked = journey.phase2Verified === false || options.liveReady && journey.phase2Verified !== true ? "Verify BoldSign completion" : journey.reviewItems?.length ? "Review pending source evidence" : p.paused ? "Automation paused" : p.complete ? "Workflow complete" : p.unresolvedReply ? "Review the latest reply" : p.deliveryProblem ? "Resolve delivery problem" : p.pendingDelay && kind !== "delay" ? "Confirm revised deadline" : p.requiresEvidenceReview ? "Review uncertain evidence" : unresolvedSend ? "Reconcile previous send outcome" : previous && ["sending", "sent", "uncertain", "failed"].includes(previous.data.status) ? "Already attempted; do not resend" : !p.policy.reviewed ? "Review templates and schedules" : !time ? "Set sending time" : date > p.clock.date || time > p.clock.time ? "Scheduled for later" : null;
    const messageBlocked = blocked || (!simple ? "Personalized draft and human review required" : reminder.unresolved ? "Reminder details unavailable" : null);
    candidates.push({ key, kind, trigger, cadence, date, time: time || "Not configured", timezone: p.policy.timezone, body, ...(reminder?.document?{document:reminder.document}:{}), subject: `Campaign update · ${kind.replaceAll("_", " ")}`, messageMode: simple ? "reminder" : "personalized", draftRequest, blocked: messageBlocked, eligible: !messageBlocked });
  };
  const periodic = (kind, event, interval) => {
    if (!event) return;
    if (!interval) { add(kind, "Required item remains missing", event.id, "Cadence not configured", p.policy.sendTime, p.clock.date, true); candidates.at(-1).blocked = "Set reminder cadence"; candidates.at(-1).eligible = false; return; }
    const start = localClock(event.at, p.policy.timezone).date;
    const days = Math.floor((Date.parse(p.clock.date) - Date.parse(start)) / 86400000);
    const lastSend = p.events.filter(e => e.kind === "reminder" && e.data.key.includes(":" + kind + ":") && ["sending", "sent", "uncertain", "failed"].includes(e.data.status)).at(-1);
    const sinceSend = lastSend ? (Date.parse(p.clock.date) - Date.parse(localClock(lastSend.at, p.policy.timezone).date)) / 86400000 : Infinity;
    add(kind, "Required item remains missing", event.id, `Every ${interval} calendar days`, p.policy.sendTime, p.clock.date, true);
    if (days < interval || sinceSend < interval) { candidates.at(-1).blocked = "Next cadence interval not reached"; candidates.at(-1).eligible = false; }
  };
  // Signature collection stays in BoldSign; Phase 2 does not send unsigned-contract follow-ups.
  if (p.last("contract_signed") && !p.last("shipping_info") && !p.last("shipment") && !p.last("receipt")) {
    const anchor = p.last("contract_signed"), date = localClock(anchor.at, p.policy.timezone).date;
    const initialKey = `${p.key}:address:${anchor.id}:${date}`;
    if (!p.events.some(e => e.kind === "reminder" && e.data.key === initialKey && e.data.status !== "cancelled")) add("address", "Signed contract received; request shipping details", anchor.id, "Once, then configured follow-ups", p.policy.sendTime, date);
    else periodic("address", anchor, p.policy.addressInterval);
  }
  for (const [kind, milestone] of [["shipment", "shipment"], ["delivery", "carrier_delivery"], ["publication", "approval"]]) {
    const event = p.last(milestone);
    const applicable = kind === "shipment" ? !p.last("carrier_delivery") && !p.last("receipt") : kind === "delivery" ? !p.last("receipt") : p.allApproved && !p.allLinks && !p.overdue;
    if (event && applicable) {
      add(kind, `After ${milestone.replaceAll("_", " ")}`, event.id, "Once", p.policy.sendTime, localClock(event.at, p.policy.timezone).date);
      if (kind === "publication" && !p.deadlines.posting) { candidates.at(-1).blocked = "Posting deadline missing"; candidates.at(-1).eligible = false; }
    }
  }
  if (p.deadlines.draft && !p.allDrafts && p.last("receipt")) {
    if (p.clock.date === p.deadlines.draft) add("draft_due", "Draft missing at end of due date", p.last("deadline", e => e.data.target === "draft").id, "Once on due date", p.policy.endOfDayTime);
    if (p.clock.date === plusDays(p.deadlines.draft, 1)) {
      add("draft_second", "Same draft still missing the next day", p.last("deadline", e => e.data.target === "draft").id, "Once the following day");
      if (!p.policy.secondDraftReminderConfirmed) { candidates.at(-1).blocked = "Confirm second reminder means same video"; candidates.at(-1).eligible = false; }
    }
  }
  if (p.pendingDelay) add("delay", "Creator reports a delay", p.pendingDelay.id, "Once", p.policy.sendTime, localClock(p.pendingDelay.at, p.policy.timezone).date);
  if (p.allApproved && !p.allLinks && p.deadlines.posting && p.clock.date > p.deadlines.posting) add("posting_overdue", "Posting deadline passed; live link missing", p.last("deadline", e => e.data.target === "posting").id, "Daily from day after due date");
  if (p.allLinks && p.missingItems.length) {
    const anchor = p.posts.filter(Boolean).at(-1);
    const initialKey = `${p.key}:documents:${anchor.id}:${localClock(anchor.at, p.policy.timezone).date}`;
    if (!p.events.some(e => e.kind === "reminder" && e.data.key === initialKey && e.data.status !== "cancelled")) add("documents", "Live link received; request only missing items", anchor.id, "Once, then configured follow-ups", p.policy.sendTime, localClock(anchor.at, p.policy.timezone).date);
    else periodic("documents", anchor, p.policy.documentInterval);
  }
  // At most one outbound email per assignment per run; combine or review conflicts.
  const due = candidates.filter(c => c.eligible);
  if (due.length > 1) for (const candidate of due) { candidate.blocked = "Multiple reminders due — our team must choose or combine"; candidate.eligible = false; }
  return { projection: p, candidates, phaseDraft: buildCampaignDraftRequest(journey, p, { kind: p.pendingDelay ? "delay" : p.evidenceStage }) };
}
