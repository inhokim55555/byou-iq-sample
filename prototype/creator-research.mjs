import {displayDate,displayDateTime} from './date-format.mjs';
const TOPIC_LABELS = Object.freeze({
  costco: "Costco", parenting: "Parenting / mom-related content", haircare: "Haircare",
  skincare: "Skincare", beauty: "Beauty", wellness: "Wellness"
});

export const CREATOR_RESEARCH_EXAMPLE = "Find me 30 Costco creators we have worked with who filmed mom related content";

export const createCreatorResearchState = () => ({
  query: "", submittedQuery: "", samePost: false, submittedSamePost: false, costcoOnly:false, submittedCostcoOnly:false, loading: false, result: null, error: null,
  evidenceOpen: false, evidenceLoading: false, evidenceSaving: false,
  evidenceVideos: [], evidenceVideoQuery: "", evidenceError: null, evidenceMessage: null,
  evidenceDraft: { postId: "", topic: "parenting", reviewStatus: "verified", evidenceUrl: "", evidenceDate: "", observation: "" }
});

export const escapeResearchHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const esc = escapeResearchHtml;
const list = (value) => Array.isArray(value) ? value : [];

export const safeResearchUrl = (value) => {
  if (typeof value !== "string" || !value.trim() || /[\u0000-\u0020\u007f]/.test(value)) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password ? parsed.href : null;
  } catch { return null; }
};

const externalLink = (url, label) => {
  const safe = safeResearchUrl(url);
  return safe ? `<a href="${esc(safe)}" target="_blank" rel="noopener noreferrer">${esc(label)} <span aria-hidden="true">↗</span></a>` : `<span class="research-unavailable">${esc(label)} unavailable</span>`;
};
const count = (value) => Number.isInteger(value) && value >= 0 ? value.toLocaleString("en-US") : "Unavailable";
const humanize = (value) => String(value || "Not recorded").replaceAll("_", " ");
const date = (value) => {
  if (!value) return "Date not recorded";
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? "Date unavailable" : displayDate(value,'UTC','Date unavailable');
};

export const formatResearchMoney = (value, currency) => {
  if (value == null || value === "" || typeof value === "boolean" || !Number.isFinite(Number(value))) return "Not recorded";
  const amount = Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return /^[A-Z]{3}$/.test(String(currency || "")) ? `${currency} ${amount}` : `${amount} (currency not recorded)`;
};

export const canRecordTopicEvidence = ({ authenticated, roles = [] }) => authenticated === true &&
  roles.some((role) => ["admin", "reviewer"].includes(String(role).toLowerCase()));

const renderHistory = (history) => list(history).length ? list(history).map((item) => `
  <section class="research-history-item">
    <div class="research-history-heading"><h4>${esc(item.campaignName || "Campaign name not recorded")}</h4><span>${esc(humanize(item.status))}</span></div>
    <dl class="research-money-grid">
      <div><dt>Agreed fee</dt><dd>${esc(formatResearchMoney(item.agreedFee, item.currency))}</dd></div>
      <div><dt>Recorded payment amount</dt><dd>${esc(formatResearchMoney(item.recordedPaymentAmount, item.recordedPaymentCurrency))}</dd></div>
      <div><dt>Recorded payment status</dt><dd>${esc(humanize(item.recordedPaymentStatus))}</dd></div>
      <div><dt>Actual amount paid</dt><dd>Unavailable</dd></div>
    </dl>
    <p class="research-caption">Recorded fees and payment statuses do not verify a bank transfer.</p>
    <h5>Verified delivered posts</h5>
    ${list(item.deliveredPosts).length ? `<ul class="research-post-list">${list(item.deliveredPosts).map((post) => `<li><span>${esc(humanize(post.deliverableType))} · ${esc(humanize(post.platform))} · ${esc(date(post.publishedAt))}</span>${externalLink(post.url, "Open delivered post")}</li>`).join("")}</ul>` : '<p class="research-caption">No verified delivered post is recorded for this assignment.</p>'}
    ${item.deliveredPostsTruncated ? `<p class="research-caption">Showing ${list(item.deliveredPosts).length} of ${count(item.deliveredPostsTotal)} delivered posts. This history is partial.</p>` : ""}
  </section>`).join("") : '<p class="research-caption">Campaign history is unavailable.</p>';

const renderMatch = (creator, index) => {
  const evidence = list(creator.topicEvidence).filter((item) => item.reviewStatus === "verified");
  return `<article class="research-match">
    <header class="research-match-heading"><div class="research-match-title"><span class="research-rank">${index + 1}</span><div><h3>${esc(creator.displayName || creator.handle || "Creator name unavailable")}</h3><p>${esc(creator.handle ? `@${String(creator.handle).replace(/^@/, "")}` : "Handle not recorded")}</p></div></div><span class="research-origin">${creator.recordOrigin === "staff_managed" ? "Staff-managed" : creator.recordOrigin === "historical_reference" ? "Historical reference" : "Record origin unavailable"}</span></header>
    <div class="research-match-links">${externalLink(creator.profileUrl, "Creator profile")}<span>${count(creator.verifiedPostCount)} verified posts</span>${creator.costcoCreator===true?'<span class="research-origin">Costco creator</span>':''}</div>
    ${creator.rosterOnly ? '<p class="research-caption">Matched to the Costco roster. Campaign history and post counts are not included in this local snapshot.</p>' : ""}
    <section class="research-evidence"><h4>Why this creator matches</h4>
      ${creator.costcoCreator === true ? '<p class="research-caption">Confirmed Costco creator designation. Video topics are assessed separately.</p>' : ""}
      ${evidence.length ? `<ul>${evidence.map((item) => `<li><strong>${esc(TOPIC_LABELS[item.topic] || item.topic)}</strong><span>${esc(date(item.evidenceDate))} · ${esc(humanize(item.method))}</span><div>${externalLink(item.url, "Open video")}${externalLink(item.evidenceUrl, "Open evidence")}</div>${item.observation ? `<p>${esc(item.observation)}</p>` : ""}</li>`).join("")}</ul>` : '<p class="research-caption">Verified topic evidence is unavailable.</p>'}
      ${creator.topicEvidenceTruncated ? `<p class="research-caption">Showing ${evidence.length} of ${count(creator.topicEvidenceTotal)} evidence records, including a source for every requested topic.</p>` : ""}
    </section>
    ${creator.rosterOnly ? '<p class="research-caption">Campaign history unavailable in this preview.</p>' : `<details class="research-history"><summary>Campaigns, fees & delivered content <span>${list(creator.history).length} assignments</span></summary>${creator.historyTruncated ? `<p class="research-caption">Showing ${list(creator.history).length} of ${count(creator.historyTotal)} assignments. This history is partial.</p>` : ""}${renderHistory(creator.history)}</details>`}
  </article>`;
};

export const renderCreatorResearchResults = (payload) => {
  if (!payload) return "";
  const interpretation = payload.interpretation || {};
  const data = payload.data || {};
  const coverage = data.coverage || {};
  const matches = list(data.matches);
  const fewer = Number.isInteger(data.totalMatches) && Number.isInteger(interpretation.requestedCount) && data.totalMatches < interpretation.requestedCount;
  return `<section class="research-response" aria-label="Search results">
    <div class="research-response-heading"><p class="eyebrow">BYOU IQ · Search response</p><h2>${count(data.returnedCount)} creators found${fewer ? ` of ${count(interpretation.requestedCount)} requested` : ""}</h2>
      <p>${fewer ? "The recorded evidence supports fewer matches than requested. More creators may qualify once missing history or topic evidence is verified." : `${count(data.totalMatches)} creators match the recorded evidence. Showing up to ${count(interpretation.requestedCount)}.`}</p></div>
    <div class="research-interpretation"><strong>Interpreted filters</strong><ul><li>Requested: ${count(interpretation.requestedCount)} creators</li><li>${interpretation.costcoOnly === true ? "Costco creators only" : "All creators · Costco filter off"}</li><li>${interpretation.requireWorked === true ? "Previously worked with BYOU" : "Browse authorized creator records"}</li>${list(interpretation.topics).map((topic) => `<li>${esc(TOPIC_LABELS[topic] || topic)}</li>`).join("")}<li>${interpretation.samePost === true ? "All topics in the same video" : "Topics may be in separate videos by the same creator"}</li></ul><p>Each search stands alone. Include every criterion in your message.</p></div>
    ${data.rosterCoverage ? `<p class="research-notice">Local roster preview: ${count(data.rosterCoverage.matchedRows)} of ${count(data.rosterCoverage.sourceRows)} source rows matched. ${count(data.rosterCoverage.unresolvedRows)} rows need identity review and are not marked Costco.</p>` : ""}
    <dl class="research-coverage" aria-label="Search coverage"><div><dt>Creators with campaign records</dt><dd>${count(coverage.eligibleCreators)}</dd></div><div><dt>With verified posts</dt><dd>${count(coverage.withVerifiedPosts)}</dd></div><div><dt>With topic evidence</dt><dd>${count(coverage.withTopicEvidence)}</dd></div></dl>
    ${coverage.ambiguousCreatorsExcluded > 0 ? `<p class="research-caption">${count(coverage.ambiguousCreatorsExcluded)} records with conflicting creator identities were excluded pending review.</p>` : ""}
    <p class="research-caption">Topic searches use verified BYOU campaign posts; unrelated organic videos are not included. A blank search browses creator records without requiring video evidence. Coverage reflects recorded evidence. Missing evidence does not establish that a creator never made this content. Content topics describe videos, not personal traits.</p>
    ${matches.length ? `<div class="research-matches">${matches.map(renderMatch).join("")}</div>` : '<div class="research-empty"><h3>No verified matches yet</h3><p>Review existing videos and add topic evidence, or search for a broader supported topic.</p></div>'}
    <p class="research-caption">Result generated: ${esc(date(data.generatedAt))}</p>
  </section>`;
};

export const researchEvidenceVideoOptions = (research) => {
  const options = new Map();
  for (const video of list(research.evidenceVideos)) {
    if (video.verificationStatus !== "verified" || !video.postId) continue;
    options.set(video.postId, { postId: video.postId, label: `${video.creatorName || video.creatorHandle || "Creator"} · ${video.campaignName || video.platform || "Video"} · ${video.canonicalUrl || "URL unavailable"}`, url: video.canonicalUrl });
  }
  for (const creator of list(research.result?.data?.matches)) {
    for (const history of list(creator.history)) {
      for (const post of list(history.deliveredPosts)) {
        if (post.postId) options.set(post.postId, { postId: post.postId, label: `${creator.displayName || creator.handle || "Creator"} · ${history.campaignName || "Campaign"} · ${post.url || "URL unavailable"}`, url: post.url });
      }
    }
  }
  return [...options.values()];
};

export const researchEvidenceDraftForVideo = (research, postId) => {
  const video = researchEvidenceVideoOptions(research).find((entry) => entry.postId === postId);
  return {
    ...createCreatorResearchState().evidenceDraft,
    topic: research.evidenceDraft.topic,
    postId: video?.postId || "",
    evidenceUrl: safeResearchUrl(video?.url) || ""
  };
};

const renderEvidenceEditor = (research) => {
  const videos = researchEvidenceVideoOptions(research);
  const draft = research.evidenceDraft;
  const chosen = videos.find((video) => video.postId === draft.postId);
  return `<section class="research-editor"><button class="text-button" data-action="toggle-research-evidence" aria-expanded="${research.evidenceOpen}">${research.evidenceOpen ? "Close topic review" : "Review a video's topics"}</button>
    ${research.evidenceOpen ? `<div class="research-editor-content"><h2>Record observed content</h2><p>Open the exact video, then confirm or remove a content topic. Your review is recorded with its source and date.</p>
      <form id="research-evidence-video-search" class="research-video-search"><label><span>Find a verified video</span><input name="videoQuery" value="${esc(research.evidenceVideoQuery)}" placeholder="Creator, campaign, or video URL" maxlength="100" /></label><button type="submit" class="button button--secondary" ${research.evidenceLoading ? "disabled" : ""}>${research.evidenceLoading ? "Loading…" : "Find videos"}</button></form>
      <p class="research-caption">Shows verified videos from up to 100 loaded records. Narrow the search if a video is missing. Unverified posts must first be reviewed in Video Tracking.</p>
      <form id="research-evidence-form" class="research-evidence-form">
        <label class="research-wide"><span>Verified video</span><select name="postId" required><option value="">Select a video you reviewed</option>${videos.map((video) => `<option value="${esc(video.postId)}" ${draft.postId === video.postId ? "selected" : ""}>${esc(video.label)}</option>`).join("")}</select></label>
        ${chosen ? `<div class="research-wide">${externalLink(chosen.url, "Open selected video")}</div>` : ""}
        <label><span>Content topic</span><select name="topic">${Object.entries(TOPIC_LABELS).map(([value, label]) => `<option value="${value}" ${draft.topic === value ? "selected" : ""}>${esc(label)}</option>`).join("")}</select></label>
        <label><span>Review decision</span><select name="reviewStatus"><option value="verified" ${draft.reviewStatus === "verified" ? "selected" : ""}>Confirm topic</option><option value="retracted" ${draft.reviewStatus === "retracted" ? "selected" : ""}>Remove topic match</option></select></label>
        <label><span>Evidence link</span><input name="evidenceUrl" type="url" value="${esc(draft.evidenceUrl)}" placeholder="https://…" required maxlength="2000" /></label>
        <label><span>Evidence date</span><input name="evidenceDate" type="date" value="${esc(draft.evidenceDate)}" max="${new Date().toISOString().slice(0, 10)}" required /></label>
        <label class="research-wide"><span>What you observed</span><textarea name="observation" rows="3" maxlength="500" placeholder="Describe the content that supports your decision." required>${esc(draft.observation)}</textarea></label>
        <div class="research-wide"><button type="submit" class="button button--primary" ${research.evidenceSaving || !videos.length ? "disabled" : ""}>${research.evidenceSaving ? "Recording…" : "Record review"}</button></div>
      </form>
      ${research.evidenceError ? `<p class="research-error" role="alert">${esc(research.evidenceError)}</p>` : ""}
      ${research.evidenceMessage ? `<p class="research-notice" role="status">${esc(research.evidenceMessage)}</p>` : ""}
    </div>` : ""}</section>`;
};

export const renderCreatorResearch = (research, { authenticated = false, roles = [] } = {}) => `
  <div class="creator-research">
    <header class="page-header"><div><p class="eyebrow">Your creator relationships</p><h1>Creator discovery</h1><p>Find people through the work you have already done together.</p></div><span class="research-release">Supported natural-language search</span></header>
    <section class="research-composer"><div class="research-composer-title"><h2>Who are you looking for?</h2><p>Search past collaborators through verified BYOU campaign posts. Content topics: Costco, parenting, haircare, skincare, beauty, and wellness. This release supports those searches; general AI chat is not available.</p></div>
      ${!authenticated ? '<p class="research-notice" role="status"><strong>Local preview</strong> · Connect a signed-in database to search. No creator results are loaded in this preview.</p>' : ""}
      <form id="creator-research-form"><label for="creator-research-query" class="sr-only">Describe the creators you want to find</label><textarea id="creator-research-query" name="query" rows="3" maxlength="700" placeholder="${esc(CREATOR_RESEARCH_EXAMPLE)}" ${!authenticated ? "disabled" : ""}>${esc(research.query)}</textarea>
        <label class="research-costco-toggle"><input type="checkbox" role="switch" name="costcoOnly" ${research.costcoOnly ? "checked" : ""} ${!authenticated || research.loading ? "disabled" : ""} /><span>Costco creators</span></label><p class="research-caption">On: confirmed Costco creators only. Off: all creators. Leave the search blank to browse. Video topics are separate filters.</p><div class="research-composer-footer"><div><span class="research-caption">Separate videos by the same creator can support each topic.</span><label class="research-same-post"><input type="checkbox" name="samePost" ${research.samePost ? "checked" : ""} ${!authenticated || research.loading ? "disabled" : ""} /><span>Require every topic in the same video</span></label></div><button class="button button--primary" type="submit" ${!authenticated || research.loading ? "disabled" : ""}>${research.loading ? "Searching records…" : "Find creators"}<span aria-hidden="true"> →</span></button></div>
      </form><button class="research-example" data-action="research-use-example" ${!authenticated ? "disabled" : ""}>Try: ${esc(CREATOR_RESEARCH_EXAMPLE)}</button>
    </section>
    ${research.submittedQuery ? `<section class="research-request" aria-label="Your search"><p class="eyebrow">You asked</p><p>${esc(research.submittedQuery)}</p></section>` : ""}
    <div aria-live="polite" aria-busy="${research.loading}">${research.loading ? '<p class="research-notice" role="status">Checking recorded work history and verified topic evidence…</p>' : research.error ? `<p class="research-error" role="alert">${esc(research.error)}</p>` : renderCreatorResearchResults(research.result)}</div>
    ${canRecordTopicEvidence({ authenticated, roles }) ? renderEvidenceEditor(research) : ""}
  </div>`;
