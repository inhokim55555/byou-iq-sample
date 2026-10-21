import {displayDate,displayDateTime} from './date-format.mjs';
import { safeWorkflowUrl } from "./campaign-workflow.mjs";
import { renderCampaignEvidence } from './campaign-evidence-ui.mjs';
export const escapeWorkflow = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const esc = escapeWorkflow;
const available = value => value === null || value === undefined || value === "" ? "Unavailable" : String(value);
const count = value => typeof value === "number" && Number.isFinite(value) ? value.toLocaleString("en-US") : "Unavailable";
const time = (value, timezone) => {
  if (!value || !Number.isFinite(Date.parse(value))) return "Timestamp unavailable";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return esc(displayDate(value,'UTC')) + " · time unavailable";
  return `<time datetime="${esc(value)}">${esc(displayDateTime(value,timezone))}</time>`;
};
const link = (url, text) => safeWorkflowUrl(url) ? `<a href="${esc(safeWorkflowUrl(url))}" target="_blank" rel="noopener noreferrer">${esc(text)} ↗</a>` : "";
const googleLink = (url, text, hosts = ["drive.google.com", "docs.google.com", "mail.google.com"]) => {
  try { if (hosts.includes(new URL(url).hostname)) return link(url, text); } catch {}
  return "";
};
const fields = pairs => `<dl class="pj-fields">${pairs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(available(v))}</dd></div>`).join("")}</dl>`;
const empty = (title, detail) => `<div class="empty-state"><strong>${esc(title)}</strong><span>${esc(detail)}</span></div>`;
const source = (event, timezone) => event
  ? `<small class="aw-source">${time(event.at, timezone)} · ${esc(event.source)} · ${esc(event.certainty)}</small>`
  : '<small class="aw-source">Evidence not recorded</small>';

function creatorPanel(m) {
  const c = m.creator;
  const profiles = (c?.socialProfiles || []).filter(profile => safeWorkflowUrl(profile.profileUrl));
  if (!profiles.length && c?.profileUrl) profiles.push({ platform: "Public profile", profileUrl: c.profileUrl });
  return `<section aria-label="Recorded creator information"><div class="aw-identity"><span class="aw-monogram" aria-hidden="true">${esc((c?.displayName || m.journey.displayName || "?").slice(0, 1))}</span><div><h3>${esc(c?.displayName || m.journey.displayName || "Creator name unavailable")}</h3><p>${esc(c?.handle || "Public handle unavailable")}</p></div></div>
    ${fields([["Profile name", c?.displayName], ["Email", c?.email || c?.businessEmail], ["Creator reference", c?.byouCode || m.journey.creatorId],
      ["Platforms", c?.platforms?.join(", ")], ["Followers recorded", count(c?.followers)], ["Content categories", c?.categories?.join(", ")]])}
    <div class="aw-profile-links">${profiles.map(profile => link(profile.profileUrl, profile.platform || "Public profile")).join("") || "<p>Public profile URLs unavailable.</p>"}</div>
    <p class="helper-text">Only stored profile information available to your staff account is shown.</p>
    ${source(m.p.last("selected"), m.p.policy.timezone)}</section>`;
}

function gmailPanel(m) {
  const outcomes = [...new Set(m.p.events.filter(e => e.kind === "reminder").map(e => e.data.key))]
    .map(key => m.p.last("reminder", e => e.data.key === key)).filter(Boolean);
  return renderOutreachReceipts(m.journey)+`<section class="aw-mail" aria-label="Campaign Gmail threads"><p class="helper-text">Conversations linked to this creator’s assignment in ${esc(m.campaign.name)}.</p>
    ${m.threads.map(thread => `<article class="aw-thread"><header><div><span class="eyebrow">Gmail conversation</span><h3>${esc(thread.approvedSubject || "Subject unavailable")}</h3></div>${googleLink(thread.href, "Open thread in Gmail", ["mail.google.com"]) || '<span class="helper-text">Thread link unavailable</span>'}</header>
      ${fields([["Sender", null], ["Messages recorded", count(thread.messageCount)], ["Recorded status", thread.status]])}
      <p>Latest recorded activity: ${time(thread.latestMessageAt || thread.date, m.p.policy.timezone)}</p>
      ${thread.latestInboundAt ? `<p>Latest inbound: ${time(thread.latestInboundAt, m.p.policy.timezone)}</p>` : ""}
      ${thread.latestOutboundAt ? `<p>Latest outbound: ${time(thread.latestOutboundAt, m.p.policy.timezone)}</p>` : ""}
      <div class="aw-mail-body">Message text and sender details are unavailable in this connection. Read the original messages in Gmail.</div>
    </article>`).join("") || empty("No assignment-linked Gmail thread available", "A creator’s general conversations or another campaign’s threads are not included.")}
    <p class="aw-capability">Draft editing, sending, and scheduling are unavailable in this connection. No email is sent or scheduled from this panel.</p>
    ${outcomes.filter(e => ["failed", "uncertain", "sending", "sent"].includes(e.data.status)).map(e =>
      `<p class="wf-notice">Recorded email outcome: ${esc(e.data.status)}. ${e.data.status === "sent" ? "Provider message reference: " + esc(e.data.messageId) : "Reconcile the Gmail result before any retry."} ${source(e, m.p.policy.timezone)}</p>`).join("")}</section>`;
}

export function renderOutreachReceipts(journey) {
  if(!journey)return '';
  const rows=(journey.outreachReceipts||[]).filter(r=>r.campaignId===journey.campaignId&&r.assignmentId===journey.assignmentId&&r.creatorId===journey.creatorId&&r.confirmed===true&&/^[A-Za-z0-9_-]{8,256}$/.test(r.providerMessageId||'')&&/^[A-Za-z0-9_-]{8,256}$/.test(r.providerThreadId||''));
  const unavailable=journey.outreachReceiptsUnavailable?'<p class="wf-notice">Invitation send evidence is unavailable. Reload to check it; missing evidence does not mean no email was sent.</p>':'';
  if(!rows.length)return unavailable;
  return unavailable+`<section class="aw-mail" aria-label="Confirmed campaign invitations"><h3>Invitation sent</h3>${rows.map(r=>`<article class="aw-thread"><p>Gmail confirmed this campaign invitation. ${time(r.sentAt,'America/Los_Angeles')}.</p>${r.timestampNeedsReview?'<p class="wf-notice">The send time is unavailable. Review its original Gmail evidence before assigning a phase.</p>':''}${googleLink(`https://mail.google.com/mail/u/0/#all/${r.providerThreadId}`,'Open sent invitation in Gmail',['mail.google.com'])}</article>`).join('')}<p class="helper-text">Sending an invitation does not confirm creator acceptance, an agreed fee or Seeding enrollment.</p></section>`;
}

function contractPanel(m) {
  const sent = m.p.last("contract_sent");
  return `<section aria-label="Campaign contract">
    ${fields([["Preparation", m.contracts.length ? "Contract file recorded; preparation status not independently confirmed" : "Not recorded"],
      ["Sending", sent ? "Sent event recorded" : "Not recorded"], ["Secure record reference", sent?.data.reference]])}
    ${source(sent, m.p.policy.timezone)}
    ${m.contracts.map(file => `<article class="aw-file"><div><h3>${esc(file.displayName || "Campaign contract")}</h3><p>${esc(file.verificationStatus || "Verification unavailable")} · ${esc(file.permissionStatus || "Access checked by Google Drive")}</p><small>Record updated: ${time(file.updatedAt, m.p.policy.timezone)}</small></div>${googleLink(file.href || file.canonicalUrl, "Open contract")}</article>`).join("")}
    ${sent && !m.contracts.length ? link(sent.data.reference, "Open recorded contract reference") : ""}
    ${!m.contracts.length && !sent ? empty("No contract record available", "Prepared or sent status needs a recorded contract file or event.") : ""}
    <p class="aw-capability">Signature completion is deferred while the replacement signing workflow is planned. No signature status is simulated.</p></section>`;
}

function shippingPanel(m) {
  const t = m.tracking;
  return `<section class="aw-tracking" aria-label="Shipment and receipt"><div class="aw-tracking-heading"><span class="eyebrow">Package tracking</span><h3>${esc(t.status)}</h3><p>Last recorded update: ${time(t.updatedAt, m.p.policy.timezone)}</p></div>
    <ol class="aw-tracking-steps">${t.steps.map(step => `<li class="${step.recorded ? "is-recorded" : ""}"><span class="aw-tracking-dot" aria-hidden="true"></span><div><strong>${esc(step.label)}</strong><span>${step.recorded ? "Recorded" : "No event available"}</span><small>${time(step.at, m.p.policy.timezone)}</small></div></li>`).join("")}</ol>
    ${fields([["Carrier", t.carrier], ["Tracking number", t.tracking], ["Expected delivery", t.expectedDelivery], ["Source", t.source]])}
    ${link(t.trackingUrl, "Open carrier tracking") || '<p class="helper-text">Carrier tracking link unavailable.</p>'}
    ${m.p.deliveryProblem ? '<p class="wf-notice">A delivery issue needs human review.</p>' : ""}
    <p class="helper-text">Carrier delivery and creator-confirmed receipt are separate records. Missing scans remain unavailable. Shipping information can be collected separately; it does not prove a shipment occurred.</p></section>`;
}

function reviewPanel(m) {
  return `<section aria-label="Human review queue"><p>Suggestions remain review items. Saving a review record never silently replaces a verified CRM value.</p><p class="helper-text">${m.seeding ? 'Confidence does not confirm a phase or authorize an action. Review the original evidence and campaign binding.' : 'Numeric confidence threshold: unavailable in the connected workflow policy.'}</p>
    ${m.reviewItems.map(item => `<article class="aw-review-item"><header><h3>${esc(item.title)}</h3><span class="wf-badge">${esc(item.status)}</span></header>
      ${fields([["Calculated phase", m.phases.find(s => s.current)?.label], ["Confidence", item.confidence == null ? "Unavailable" : (item.confidence * 100).toFixed(0) + "%"],
        ["Evidence status", item.certainty || "See source record"]])}
      ${item.evidence ? `<blockquote>${esc(item.evidence)}</blockquote>` : '<p>Evidence excerpt unavailable. Inspect the source before deciding.</p>'}
      <small class="aw-source">${time(item.sourceDate, m.p.policy.timezone)}</small>
      ${link(item.sourceUrl, "Review source") || (item.sourceRecordId ? `<p>Source reference: ${esc(item.sourceRecordId)}</p>` : "")}
      ${item.reviewDetails ? `<details><summary>Review details</summary><p>Unresolved questions</p><ul>${(item.reviewDetails.unresolved||[]).slice(0,12).map(text=>`<li>${esc(text)}</li>`).join('')||'<li>None reported; verify against the conversation.</li>'}</ul><p>Supporting evidence: ${esc((item.reviewDetails.evidenceIds||[]).slice(0,12).join(', ')||'Unavailable')}</p><p>Skill audit: ${esc(item.reviewDetails.humanizerAudit||'Unavailable')}</p><p>Managed run references: ${esc((item.reviewDetails.runReferences||[]).slice(0,2).map(r=>r.role+': '+r.runId).join('; ')||'Unavailable')}</p></details>` : ''}
      ${item.nextAction ? `<p>${esc(item.nextAction)}</p>` : ""}</article>`).join("") || empty("No review items in the loaded records", "This does not confirm coverage of all agent systems or mailbox activity.")}</section>`;
}

function videoPanel(m) {
  return `<section aria-label="Campaign videos">${m.videos.map(video => `<article class="video-tracking-card aw-video"><div class="video-card-top"><div><span class="video-platform">${esc(video.platform || "Platform unavailable")}</span><h3>${esc(m.creator?.displayName || m.journey.displayName || "Creator")}</h3><p>${esc(video.deliverableId || "Deliverable unavailable")} · ${esc(m.campaign.name)}</p></div><span class="wf-badge">${video.verified ? "Verified post attribution" : "Attribution needs review"}</span></div>
      <div class="video-meta">${link(video.url, "Open campaign video")}<span>Publication: ${time(video.postedDate, m.p.policy.timezone)}</span></div>
      <div class="video-metric-strip">${["views", "likes", "comments", "shares", "saves"].map(key => {
        const metric = video.metrics[key];
        return `<div class="aw-metric"><small>${esc(key)}</small><strong>${count(metric?.value)}</strong>${metric ? `<small>${esc(metric.sourceRecordId)}<br>${time(metric.collectedAt, m.p.policy.timezone)}</small>` : ""}</div>`;
      }).join("")}</div>
      <p class="helper-text">Post source: ${esc(video.source || "Unavailable")}. Link recorded: ${time(video.recordedAt, m.p.policy.timezone)}</p>
    </article>`).join("") || empty("No campaign video recorded", "A post URL must be linked to this assignment. Missing engagement is not zero.")}
    <p class="helper-text">Metrics require verified post attribution and a dated source. They describe this video only.</p></section>`;
}

function documentsPanel(m) {
  return `<section class="aw-document-viewer" aria-label="Required documents"><div class="aw-file-list">${[["w9", "W-9"], ["invoice", "Invoice"], ["ad_code", "Ad code"]].map(([key, label]) => `<article class="aw-file"><div><h3>${label}</h3><span class="wf-badge">${esc(m.p.documents[key])}</span>${source(m.p.last("document", e => e.data.item === key), m.p.policy.timezone)}</div></article>`).join("")}</div>
    <div class="aw-file-preview" role="region" aria-label="Secure file viewer"><span class="eyebrow">Protected files</span><h3>Secure file view unavailable</h3><p>The current connection has no file reference authorized for this assignment. A recorded receipt does not establish file access.</p><p>Use the existing protected document process. File contents are not loaded into the workflow.</p></div></section>`;
}

function completePanel(m) {
  const p = m.p;
  const requiredDocs = p.terms ? p.terms.adCodeRequired ? 3 : 2 : null;
  const docCount = Object.values(p.documents).filter(v => v === "Received").length;
  const totals = [["Posts recorded", p.posts.filter(Boolean).length, p.terms?.postIds.length],
    ["Latest drafts approved", p.reviews.filter(e => e?.kind === "approval").length, p.terms?.creativeIds.length],
    ["Required items received", docCount, requiredDocs]];
  const viewMetrics = m.videos.map(v => v.metrics.views).filter(Boolean);
  return `<section aria-label="Assignment overview"><p class="aw-outcome">${p.complete ? "Required deliverables, documents, and human approvals are recorded. See the timeline for earlier evidence gaps." : "This assignment is not complete. Required evidence or human checks are still missing."}</p>
    <div class="pj-metrics">${totals.map(([label, n, total]) => `<div><strong>${total == null ? "Unavailable" : count(n) + " / " + count(total)}</strong><span>${label}</span></div>`).join("")}</div>
    <p class="helper-text">Business outcome / ROI: unavailable. Workflow completion alone does not establish campaign effectiveness.</p>
    <h3>Critical milestones</h3><ol class="aw-milestones">${m.milestones.map(item => `<li><div><strong>${esc(item.label)}</strong><span class="wf-badge">${esc(item.status)}</span></div><p>Recorded: ${time(item.at, p.policy.timezone)}</p><small>${esc(item.source)}${item.expected > 1 ? " · " + item.count + " / " + item.expected : ""}</small>${link(item.sourceUrl, "Open milestone source")}</li>`).join("")}</ol>
    <h3>Observed engagement</h3>${viewMetrics.length ? `<p><strong>${count(viewMetrics.reduce((n, v) => n + v.value, 0))} observed views</strong> across ${viewMetrics.length} of ${m.videos.length} recorded videos${viewMetrics.length < m.videos.length ? " · partial coverage" : ""}.</p><ul class="aw-source-list">${viewMetrics.map(v => `<li>${esc(v.sourceRecordId)} · ${time(v.collectedAt, p.policy.timezone)}</li>`).join("")}</ul>` : "<p>Verified engagement metrics are unavailable.</p>"}
    <h3>Prior creator campaign history</h3><p class="helper-text">Other loaded assignments only; this may be a partial history.</p>
    ${m.history.length ? `<ul class="aw-history">${m.history.map(item => `<li><strong>${esc(item.campaign.name)}</strong><span>${esc(item.assignment.status || "Status unavailable")}</span><small>Campaign end: ${time(item.campaign.endDate, p.policy.timezone)}</small></li>`).join("")}</ul>` : "<p>Prior campaign history is unavailable in the loaded records.</p>"}</section>`;
}

export const phaseRecordKinds = {
  selected: ["selected"], outreach: ["outreach"], terms: ["terms"],
  contract: ["contract_sent"], delivery: ["shipment", "carrier_delivery", "receipt", "delivery_issue", "delivery_resolved"],
  draft: ["draft"], review: ["feedback", "feedback_sent", "approval", "reply_resolved"],
  publication: [], video: ["live_link"], documents: ["document"], complete: []
};

function seedingPanel(m, phase) {
  const s = m.seeding, p = s.participation;
  const recordedTime = value => value && Number.isFinite(Date.parse(value)) ? displayDateTime(value,m.p.policy.timezone) : null;
  const note = s.reason ? `<p class="wf-notice">${esc(s.reason)}</p>` : "";
  const overview = `<div class="aw-tracking-heading"><span class="eyebrow">Product seeding</span><h3>${esc(s.nextParty)}</h3><p>${esc(s.nextAction)}</p></div>${note}`
    + fields([["Existing campaign status", m.assignment.status]]) + '<p class="helper-text">The existing status is preserved as recorded; it does not confirm a workflow phase.</p>';
  const outcome = kind => s.actions.filter(a => a.kind === kind).map(a => a.status).join(", ") || "Not recorded";
  if (phase === "selected") return creatorPanel(m);
  if (phase === "outreach") return overview + gmailPanel(m);
  if (phase === "form") return overview + fields([["Validated form", p?.formResponseId ? "Recorded" : "Not recorded"], ["Form request", outcome("form_email")]])
    + '<p>Identity, campaign agreements, and shipping information are checked in the protected form. A form link alone does not confirm acceptance.</p>';
  if (phase === "warehouse") return overview + fields([["Warehouse handoff", outcome("warehouse_request")], ["Tracking recorded", p?.tracking ? "Yes" : "No"]]);
  if (["delivery", "receipt"].includes(phase)) return overview + fields([["Carrier", p?.tracking?.carrier], ["Carrier status", p?.trackingStatus],
    ["Carrier delivery", recordedTime(p?.deliveredAt)], ["Creator-confirmed receipt", recordedTime(p?.receiptConfirmedAt)], ["Delivery hold", p?.deliveryPaused ? "Paused — needs review" : p ? "No recorded hold" : null]])
    + '<p>Carrier delivery and creator possession are separate. Missing or damaged packages need staff review.</p>';
  if (["content", "video"].includes(phase)) return overview + fields([["Recorded deadline", s.dueDate], ["Agreed deliverables", s.required.length ? s.required.join(", ") : null]])
    + '<p>Only recorded campaign requirements and deadlines apply. Optional gifted posting does not create an obligation.</p>'
    + s.content.map(d => `<article class="aw-file"><div><h3>${esc(d.id)}</h3><p>${d.verifiedBy && d.evidenceId ? "Staff verification recorded" : "Verification missing"}</p></div>${link(d.url, "Open content evidence")}</article>`).join("")
    + (phase === "video" ? videoPanel(m) : `<h3>Recorded follow-up actions</h3>${s.actions.filter(a => ["content_reminder", "response_followup", "deadline_email"].includes(a.kind)).map(a => `<p>${esc(a.kind.replaceAll("_", " "))} · ${esc(a.status)} · ${time(a.dueAt, m.p.policy.timezone)}</p>`).join("") || '<p>No follow-up recorded.</p>'}`);
  if (phase === "review") return overview
    + s.flags.map(f => `<p class="wf-notice">${esc(f.code.replaceAll("_", " "))}</p>`).join("")
    + s.judgments.map(j => `<article class="aw-review-item"><h3>Agent reply proposal</h3><p>${esc(j.gate?.recommendedOutcome || "Uncertain")}</p>${fields([["Confidence", Number.isFinite(j.judgments?.intent?.confidence) && j.judgments.intent.confidence >= 0 && j.judgments.intent.confidence <= 1 ? Math.round(j.judgments.intent.confidence * 100) + '%' : null], ["Review reason", j.gate?.reasonCode], ["Message reference", j.messageId]])}<p>Needs staff review · ${time(j.at, m.p.policy.timezone)}</p></article>`).join("")
    + reviewPanel(m);
  return overview + `<p class="aw-outcome">${s.complete ? "All recorded Seeding deliverables have staff verification." : "This Seeding assignment is not complete."}</p>`
    + fields([["CRM completion action", outcome("crm_completion")], ["Thank-you action", outcome("thank_you")]])
    + '<p>A content verification, CRM update, and sent thank-you are separate outcomes. A queued action is not a completed action.</p>';
}

export function renderAssignmentWorkflow(m, { selectedPhase = m.current, form = "" } = {}) {
  const phase = m.phases.find(item => item.id === selectedPhase) || m.phases.find(item => item.current);
  const panels = { selected: creatorPanel, outreach: gmailPanel, terms: gmailPanel, contract: contractPanel,
    delivery: shippingPanel, draft: gmailPanel, review: reviewPanel, publication: gmailPanel,
    video: videoPanel, documents: documentsPanel, complete: completePanel };
  const content = (m.seeding ? seedingPanel(m, phase.id) : panels[phase.id](m)) + renderCampaignEvidence(m.recordedEvidence);
  return `<article class="aw-workflow" data-wf-assignment="${esc(m.journey.assignmentId)}">
    <header class="aw-heading"><div><p class="eyebrow">${esc(m.campaign.name)}</p><h2>${esc(m.creator?.displayName || m.journey.displayName || "Creator workflow")}</h2></div><button type="button" class="button button--secondary" data-wf="back">All creator workflows</button></header>
    <div class="aw-views"><button type="button" class="button button--secondary" data-wf="phase" data-phase="${m.current}">Return to calculated phase</button><button type="button" class="button button--secondary" data-wf="phase" data-phase="review">Human review queue (${m.reviewItems.length + (m.seeding ? m.seeding.flags.length + m.seeding.judgments.length + (m.seeding.reason && !m.seeding.flags.length && !m.seeding.judgments.length ? 1 : 0) : 0)})</button></div>
    <div class="aw-layout"><nav class="aw-phase-nav" aria-label="Campaign phases"><ol>${m.phases.map((item, index) => `<li><button type="button" class="aw-phase ${phase.id === item.id ? "is-selected" : ""}" data-wf="phase" data-phase="${item.id}" ${item.current ? 'aria-current="step"' : ""} aria-controls="aw-phase-content"><span class="aw-phase-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span><span>${esc(item.label)}${item.current ? '<small class="aw-current">Current</small>' : item.done ? '<small>Recorded</small>' : ""}</span></button></li>`).join("")}</ol></nav>
    <section class="aw-content" id="aw-phase-content" tabindex="-1" aria-labelledby="aw-phase-title"><p class="eyebrow">Phase ${String(m.phases.indexOf(phase) + 1).padStart(2, "0")}</p><h2 id="aw-phase-title">${esc(phase.label)}</h2>
      ${m.p.evidenceStage === "signature" && phase.id === "contract" ? '<p class="wf-notice">The recorded contract is awaiting further evidence. The existing completion check remains in place while signature workflow changes are deferred.</p>' : ""}
      ${m.p.evidenceStage === "overdue_post" && ["publication", "video"].includes(phase.id) ? '<p class="wf-notice">The recorded posting deadline has passed. Background follow-up coverage is not verified.</p>' : ""}
      ${phase.id === "terms" ? fields([["Agreement", m.p.terms ? "Recorded" : "Not recorded"], ["Recorded assignment fee", m.assignment.rate == null ? null : m.assignment.rate + " " + (m.assignment.currency || "")], ["Required drafts", m.p.terms?.creativeIds.join(", ")], ["Required posts", m.p.terms?.postIds.join(", ")]]) : ""}
      ${content}${m.seeding ? '<p class="helper-text">This view reads saved Seeding evidence. Agent proposals need review; opening this view does not send or schedule anything.</p><a class="button button--secondary" href="/seeding.html">Open Seeding operations review</a>' : form}<p class="aw-timezone">Recorded timestamps use ${esc(m.p.policy.timezone)}.</p></section></div></article>`;
}
