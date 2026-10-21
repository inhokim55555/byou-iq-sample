import { projectWorkflow, safeWorkflowUrl } from "./campaign-workflow.mjs";
import {managedWorkflowReviewItems} from './managed-workflow-results.mjs';
import {liveJevReviewItems} from './live-jev-results.mjs';
import { isSeedingCampaign, seedingAssignmentState } from "./seeding-assignment-workflow.mjs";

// Presentation only: the event ledger and its completion/automation rules stay authoritative.
export const ASSIGNMENT_PHASES = [
  ["selected", "Creator selected"], ["outreach", "Initial outreach"],
  ["terms", "Pricing negotiated"], ["contract", "Contract prepared and sent"],
  ["delivery", "Shipping and delivery"], ["draft", "Awaiting first draft"],
  ["review", "Manual review and revisions"], ["publication", "Approved / awaiting publication"],
  ["video", "Video Posting"], ["documents", "Required documents"], ["complete", "Complete"]
].map(([id, label]) => ({ id, label }));
const list = value => Array.isArray(value) ? value : [];
const numeric = value => typeof value === "number" && Number.isFinite(value) && value >= 0;
const date = value => typeof value === "string" && Number.isFinite(Date.parse(value)) ? value : null;
const code = value => String(value || "").toLowerCase().replaceAll(/[\s-]+/g, "_");
const dedupe = rows => [...new Map(rows.map((r, i) => [r.id || r.factId || r.url || "row-" + i, r])).values()];

export function visibleWorkflowPhase(p) {
  if (p.evidenceStage === "signature") return "contract";
  if (p.evidenceStage === "address") return "delivery";
  if (["publication", "overdue_post"].includes(p.evidenceStage) && p.posts.some(Boolean)) return "video";
  return p.evidenceStage === "overdue_post" ? "publication" : p.evidenceStage;
}

// Nested records inherit only an already matched assignment. Explicit conflicting IDs always fail closed.
export function scopeAssignmentRecords(journey, assignment, campaign, key, campaignKey = key) {
  const matches = (r, nested) => r && typeof r === "object"
    && (!r.assignmentId || r.assignmentId === journey.assignmentId)
    && (!r.campaignId || r.campaignId === journey.campaignId)
    && (!r.creatorId || r.creatorId === journey.creatorId)
    && (nested || r.assignmentId === journey.assignmentId);
  return dedupe([
    ...list(assignment?.[key]).filter(r => matches(r, true)),
    ...list(campaign?.[campaignKey]).filter(r => matches(r, false))
  ]);
}

export function workflowTracking(p, shipments = []) {
  const latest = [...shipments].sort((a, b) => String(a.updatedAt || "").localeCompare(String(b.updatedAt || ""))).at(-1);
  const status = code(latest?.status);
  const dispatch = p.last("shipment");
  const delivered = p.last("carrier_delivery");
  const receipt = p.last("receipt");
  // Do not treat a label or a staff dispatch record as a carrier transit scan.
  const labelCreated = ["label_created", "pre_transit", "pre_shipment"].includes(status);
  const transit = ["in_transit", "out_for_delivery"].includes(status);
  const carrierDelivered = !!delivered || status === "delivered" || !!date(latest?.deliveredAt);
  return {
    status: receipt ? "Creator-confirmed receipt" : carrierDelivered ? "Carrier-delivered"
      : transit ? "Carrier in transit" : labelCreated ? "Label created"
      : dispatch ? "Dispatch recorded; carrier status unavailable" : latest?.status || "Shipment not recorded",
    carrier: latest?.carrier || dispatch?.data.carrier || null,
    tracking: latest?.trackingNumber || dispatch?.data.tracking || null,
    trackingUrl: safeWorkflowUrl(latest?.trackingUrl),
    updatedAt: [date(latest?.updatedAt), delivered?.at, dispatch?.at, receipt?.at].filter(Boolean)
      .sort((a, b) => Date.parse(a) - Date.parse(b)).at(-1) || null,
    expectedDelivery: date(latest?.expectedDeliveryDate),
    source: latest?.sourceRecordId || (dispatch ? dispatch.source + " workflow record" : null),
    steps: [
      { label: "Label created", recorded: labelCreated || !!date(latest?.labelCreatedAt), at: date(latest?.labelCreatedAt) },
      { label: "Carrier in transit", recorded: transit, at: transit ? date(latest?.updatedAt) : null },
      { label: "Carrier-delivered", recorded: carrierDelivered, at: delivered?.at || date(latest?.deliveredAt) },
      { label: "Creator-confirmed receipt", recorded: !!receipt, at: receipt?.at }
    ]
  };
}

export function assignmentVideos(p, posts, snapshots) {
  const exactPosts = new Map();
  for (const post of posts) if (!exactPosts.has(post.url) || post.verified && !exactPosts.get(post.url).verified) exactPosts.set(post.url, post);
  const videos = [...exactPosts.values()].map(post => {
    const latest = new Map();
    for (const metric of snapshots) {
      if (!post.verified || !post.id || metric.postId !== post.id || metric.verificationState !== "verified"
        || !numeric(metric.value) || !date(metric.collectedAt) || !metric.sourceRecordId) continue;
      if (!latest.has(metric.metricCode) || Date.parse(metric.collectedAt) > Date.parse(latest.get(metric.metricCode).collectedAt))
        latest.set(metric.metricCode, metric);
    }
    return { ...post, metrics: Object.fromEntries(latest) };
  });
  for (const event of p.posts.filter(Boolean)) {
    if (!videos.some(post => post.url === event.data.url)) {
      videos.push({ id: event.id, url: event.data.url, deliverableId: event.data.deliverableId,
        platform: null, postedDate: null, recordedAt: event.at, source: event.source + " workflow record",
        verified: false, metrics: {} });
    }
  }
  return videos;
}

export function workflowReviewItems(p, attentionItems = []) {
  const resolution = p.last("reply_resolved");
  const items = p.events.filter(e => e.certainty === "inferred" || e.kind === "reply" && e.data.ambiguous).map(e => ({
    id: e.id, title: e.certainty === "inferred" ? "Unconfirmed " + e.kind.replaceAll("_", " ") : "Ambiguous creator reply",
    evidence: e.note, sourceUrl: safeWorkflowUrl(e.data.url), sourceDate: e.at,
    confidence: null, certainty: e.certainty,
    status: resolution && Date.parse(resolution.at) > Date.parse(e.at) ? "Review recorded" : "Needs human review"
  }));
  for (const item of attentionItems) items.push({
    id: item.id, title: item.title || item.type || "Agent item needs review",
    evidence: item.evidenceExcerpt || null, sourceUrl: safeWorkflowUrl(item.sourceUrl), sourceDate: item.sourceDate || item.createdAt,
    confidence: numeric(item.confidence) && item.confidence <= 1 ? item.confidence : null,
    status: item.status || "Needs human review", nextAction: item.nextAction, sourceRecordId: item.sourceRecordId, reviewDetails:item.reviewDetails
  });
  for (const id of p.invalid) items.push({ id, title: "Invalid workflow evidence", evidence: null, confidence: null, status: "Needs human review" });
  if (p.evidenceStage === "review") items.push({
    id: "content-review", title: p.nextAction, evidence: p.reviews.filter(Boolean).at(-1)?.note || p.drafts.filter(Boolean).at(-1)?.note,
    sourceUrl: p.drafts.filter(Boolean).at(-1)?.data.url, sourceDate: p.drafts.filter(Boolean).at(-1)?.at,
    confidence: null, status: p.needsRevision ? "Awaiting revision" : "Needs human review"
  });
  return dedupe(items);
}

export function assignmentMilestones(p) {
  const row = (label, events, expected = 1) => {
    const available = events.filter(Boolean);
    const last = [...available].sort((a, b) => Date.parse(a.at) - Date.parse(b.at)).at(-1);
    return { label, at: last?.at || null,
      status: expected == null ? "Requirements unavailable" : available.length >= expected ? "Recorded"
        : available.length ? "Partially recorded" : "Not recorded",
      source: last ? last.source + " · " + last.certainty : "Source unavailable",
      sourceUrl: safeWorkflowUrl(last?.data.url), count: available.length, expected };
  };
  return [
    row("Outreach", [p.last("outreach")]), row("Agreement", [p.last("terms")]),
    row("Contract sent", [p.last("contract_sent")]),
    row("Draft received", p.drafts, p.terms?.creativeIds.length ?? null),
    row("Human approval", p.reviews.filter(e => e?.kind === "approval"), p.terms?.creativeIds.length ?? null),
    row("Video posted", p.posts, p.terms?.postIds.length ?? null),
    row("Required documents", ["w9", "invoice", ...(p.terms?.adCodeRequired === false ? [] : ["ad_code"])]
      .map(item => p.last("document", e => e.data.item === item)), p.terms ? p.terms.adCodeRequired ? 3 : 2 : null)
  ];
}

export function assignmentWorkflowModel(campaign, journey, { creator = null, history = [], now, seedingRows = [], seedingError = null } = {}) {
  if (!campaign?.id || journey?.campaignId !== campaign.id || !journey.assignmentId || !journey.creatorId) return null;
  const assignment = list(campaign.assignments).find(a => a.id === journey.assignmentId && a.creatorId === journey.creatorId
    && (!a.campaignId || a.campaignId === campaign.id));
  if (!assignment) return null;
  const seedingCampaign = isSeedingCampaign(campaign);
  const p = projectWorkflow(seedingCampaign ? { ...journey, workflowEvents: [], campaignPolicy: undefined } : journey, { now });
  const typeConflict = seedingCampaign && ['paid', 'hybrid'].includes(String(assignment.engagementType || '').toLowerCase());
  const seeding = seedingCampaign ? seedingAssignmentState(journey, typeConflict ? [] : seedingRows,
    { error: typeConflict ? 'Assignment terms conflict with this Seeding campaign. Staff must confirm the arrangement.' : seedingError }) : null;
  if (seeding?.participation?.timezone) {
    try { new Intl.DateTimeFormat('en', { timeZone: seeding.participation.timezone }); p.policy.timezone = seeding.participation.timezone; } catch { /* Keep the validated default. */ }
  }
  const records = (key, otherKey) => scopeAssignmentRecords(journey, assignment, campaign, key, otherKey);
  const posts = records("posts").filter(post => safeWorkflowUrl(post.url));
  const snapshots = records("metricSnapshots");
  const videos = assignmentVideos(p, posts, snapshots);
  const current = visibleWorkflowPhase(p);
  const phaseDone = Object.fromEntries(p.steps.map(step => [step.id, step.status === "completed"]));
  // Completion markers also use evidence, never a staff display correction.
  Object.assign(phaseDone, { contract: !!p.last("contract_sent"), delivery: !!p.last("receipt"),
    review: p.allApproved, publication: p.allApproved, video: p.allLinks, documents: p.missingItems.length === 0 && p.allLinks,
    complete: p.complete });
  const evidence = journey.recordedEvidence?.assignmentId === journey.assignmentId && journey.recordedEvidence?.campaignId === campaign.id && journey.recordedEvidence?.creatorId === journey.creatorId ? journey.recordedEvidence : null;
  const sourceCreator = evidence?.creator?.id === journey.creatorId ? evidence.creator : creator?.id === journey.creatorId ? creator : null;
  return {
    campaign, journey, assignment, p, seeding, current: seeding?.current || current,
    phases: seeding?.phases || ASSIGNMENT_PHASES.map(phase => ({ ...phase, current: phase.id === current, done: phaseDone[phase.id] === true })),
    creator: sourceCreator,
    threads: dedupe([...records("communications", "gmailThreads"), ...list(evidence?.communications).filter(r => r.assignmentId === journey.assignmentId && r.creatorId === journey.creatorId && r.campaignId === campaign.id)]),
    recordedEvidence: evidence,
    contracts: records("driveAssets").filter(a => code(a.approvedPurpose) === "contract"),
    tracking: workflowTracking(p, records("shipments")),
    videos, reviewItems: workflowReviewItems(p, [...records("attentionItems"),...managedWorkflowReviewItems(journey),...liveJevReviewItems(journey)]),
    milestones: assignmentMilestones(p),
    history: history.filter(item => item.assignment?.creatorId === journey.creatorId
      && item.campaign?.id !== campaign.id && (!item.assignment.campaignId || item.assignment.campaignId === item.campaign.id)),
    // The running app has metadata-only Gmail links and no assignment-bound protected-document endpoint.
    capabilities: { gmailMessages: false, gmailDrafts: false, gmailSend: false, gmailSchedule: false, documentViewer: false }
  };
}
