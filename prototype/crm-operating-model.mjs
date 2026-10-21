const clone = (value) => structuredClone(value);

const asArray = (value) => Array.isArray(value) ? value : [];

const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .filter((key) => value[key] !== undefined)
        .map((key) => [key, canonicalize(value[key])])
    );
  }
  return value;
};

const canonicalJson = (value) => JSON.stringify(canonicalize(value));

// Synchronous and browser-compatible so the demo gateway and server-backed
// gateway can derive the same immutable-content fingerprint without relying
// on Node-only crypto APIs or asynchronous Web Crypto.
const contentFingerprint = (value) => {
  const input = canonicalJson(value);
  const source = new TextEncoder().encode(input);
  const byteLength = Math.ceil((source.length + 9) / 64) * 64;
  const bytes = new Uint8Array(byteLength);
  bytes.set(source);
  bytes[source.length] = 0x80;
  const view = new DataView(bytes.buffer);
  const bitLength = source.length * 8;
  view.setUint32(byteLength - 8, Math.floor(bitLength / 0x1_0000_0000));
  view.setUint32(byteLength - 4, bitLength >>> 0);

  const constants = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  const words = new Uint32Array(64);
  const state = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ]);
  const rotateRight = (word, bits) => (word >>> bits) | (word << (32 - bits));

  for (let offset = 0; offset < bytes.length; offset += 64) {
    for (let index = 0; index < 16; index += 1) words[index] = view.getUint32(offset + index * 4);
    for (let index = 16; index < 64; index += 1) {
      const left = words[index - 15];
      const right = words[index - 2];
      const sigma0 = rotateRight(left, 7) ^ rotateRight(left, 18) ^ (left >>> 3);
      const sigma1 = rotateRight(right, 17) ^ rotateRight(right, 19) ^ (right >>> 10);
      words[index] = (words[index - 16] + sigma0 + words[index - 7] + sigma1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = state;
    for (let index = 0; index < 64; index += 1) {
      const sum1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const choice = (e & f) ^ (~e & g);
      const temporary1 = (h + sum1 + choice + constants[index] + words[index]) >>> 0;
      const sum0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temporary2 = (sum0 + majority) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temporary1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temporary1 + temporary2) >>> 0;
    }
    state[0] = (state[0] + a) >>> 0;
    state[1] = (state[1] + b) >>> 0;
    state[2] = (state[2] + c) >>> 0;
    state[3] = (state[3] + d) >>> 0;
    state[4] = (state[4] + e) >>> 0;
    state[5] = (state[5] + f) >>> 0;
    state[6] = (state[6] + g) >>> 0;
    state[7] = (state[7] + h) >>> 0;
  }
  return `sha256:${Array.from(state, (word) => word.toString(16).padStart(8, "0")).join("")}`;
};

const commandBinding = (command, context) => canonicalJson({
  actorId: context?.actorId || null,
  command: command.command,
  payload: Object.fromEntries(
    Object.entries(command).filter(([key]) => key !== "commandId" && key !== "command")
  )
});

const finite = (value) => {
  const number = Number(value);
  return value !== null && value !== "" && Number.isFinite(number) ? number : null;
};

const round = (value, precision = 2) => {
  const scale = 10 ** precision;
  return Math.round((value + Number.EPSILON) * scale) / scale;
};

const known = (value, citations = [], extra = {}) => ({
  availability: "known",
  value,
  citations: clone(citations),
  ...extra
});

const unavailable = (reason = "missing") => ({
  availability: "not_available",
  reason
});

const normalizedRoles = (context) => new Set(
  asArray(context?.roles).map((role) => String(role).toLowerCase().replaceAll(/[^a-z0-9]+/g, "_"))
);

const hasRole = (context, allowed) => {
  const roles = normalizedRoles(context);
  return allowed.some((role) => roles.has(role));
};

const internalViewRoles = Object.freeze([
  "admin",
  "relationship_manager",
  "campaign_manager",
  "analyst",
  "finance_admin",
  "reviewer",
  "executive"
]);

const outcomeError = (code, message, retryable = false, extra = {}) => ({
  ok: false,
  error: { code, message, retryable, ...extra }
});

const assertText = (value, label, { max = 500, nullable = false } = {}) => {
  if (nullable && (value === null || value === undefined || value === "")) return null;
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    throw new TypeError(`${label} is required and must be ${max} characters or fewer`);
  }
  return value.trim();
};

const assertDateTime = (value, label, { nullable = true } = {}) => {
  if (nullable && (value === null || value === undefined || value === "")) return null;
  const parsed = new Date(value);
  if (typeof value !== "string" || Number.isNaN(parsed.valueOf())) throw new TypeError(`${label} is invalid`);
  return parsed.toISOString();
};

const assertWebUrl = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const normalized = assertText(value, "Website", { max: 500 });
  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new TypeError("Website must be a valid HTTP or HTTPS URL");
  }
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new TypeError("Website must be a valid HTTP or HTTPS URL without embedded credentials");
  }
  return normalized;
};

const assertPublicProfileText = (value, label, { max = 2_000, nullable = true } = {}) => {
  if (value === null || value === undefined || value === "") {
    if (nullable) return null;
    throw new TypeError(`${label} is required`);
  }
  const normalized = assertText(value, label, { max });
  if (
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(normalized) ||
    /(?:\+\d[\d\s().-]{6,}\d)|(?:\(\d{2,4}\)[\d\s.-]{4,}\d)|(?:\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b)|(?:\b\d{10,15}\b)/.test(normalized) ||
    /(?:\b\d{1,6}\s+[a-z0-9.' -]{2,40}\s+(?:street|st\.?|road|rd\.?|avenue|ave\.?|boulevard|blvd\.?|lane|ln\.?|drive|dr\.?|court|ct\.?|way)\b)|(?:\bp\.?\s*o\.?\s+box\s+\d{1,10}\b)|(?:\b[a-z][a-z.' -]{2,40},\s*(?:al|ak|az|ar|ca|co|ct|de|fl|ga|hi|id|il|in|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy|dc)\s+\d{5}(?:-\d{4})?\b)/i.test(normalized)
  ) {
    throw new TypeError("Contact methods belong in restricted fields, not the ordinary note");
  }
  return normalized;
};

const normalizedContactStatus = (value) => {
  const normalized = assertText(value, "Contact status", { max: 40 }).toLowerCase();
  if (!["active", "inactive"].includes(normalized)) throw new TypeError("Contact status is invalid");
  return normalized;
};

const normalizedPreferredChannel = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const normalized = assertText(value, "Preferred channel", { max: 40 }).toLowerCase();
  if (!["email", "phone", "mobile", "whatsapp"].includes(normalized)) {
    throw new TypeError("Preferred channel is invalid");
  }
  return normalized;
};

const normalizedCurrency = (value) => {
  const normalized = assertText(value, "Currency", { max: 3 }).toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) throw new TypeError("Currency must use a three-letter code");
  return normalized;
};

const normalizedClientLifecycleStatus = (value) => {
  const normalized = assertText(value, "Client lifecycle status", { max: 40 })
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "_");
  if (!["lead", "prospect", "active_client", "past_client", "other"].includes(normalized)) {
    throw new TypeError("Client lifecycle status is invalid");
  }
  return normalized;
};

const safeCitation = ({ recordId, label, sourceDate = null, href = null, field = null }) => ({
  recordId: String(recordId),
  label: String(label),
  sourceDate,
  href,
  field
});

const assignmentAmount = (assignment) => {
  const payment = assignment?.payment;
  const amount = finite(payment?.amount);
  const sourceRecordId = String(payment?.sourceRecordId || "").trim();
  const sourceIsAuthoritative = payment?.sourceAuthority === "authoritative" && Boolean(sourceRecordId);
  const approvalsComplete = /^approved$/i.test(String(payment?.ceoApproval || ""))
    && /^approved$/i.test(String(payment?.cfoApproval || ""));
  return amount !== null && amount >= 0 && sourceIsAuthoritative && approvalsComplete
    ? { known: true, amount, sourceRecordId }
    : { known: false, amount: null, sourceRecordId: null };
};

/**
 * Canonical campaign commercial calculation used by every CRM projection.
 * A missing client value or creator obligation stays unavailable; it never
 * silently becomes zero.
 */
export function canonicalCampaignCommercials(campaign) {
  const terms = campaign?.clientCommercialTerms;
  const recordedClientAmount = finite(terms?.amount);
  const clientCitations = asArray(terms?.evidence).map((item) => safeCitation({
    recordId: item.recordId || terms.id || campaign?.id,
    label: item.label || "Verified client commercial terms",
    sourceDate: item.sourceDate || terms.effectiveOn || null,
    field: "contract_value"
  }));
  const clientAmount = terms?.state === "agreed" && clientCitations.length > 0 && recordedClientAmount !== null
    ? recordedClientAmount
    : null;

  const assignments = asArray(campaign?.assignments);
  const assignmentAmounts = assignments.map(assignmentAmount);
  const allCreatorAmountsKnown = assignments.length > 0 && assignmentAmounts.every((item) => item.known);
  const creatorTotal = allCreatorAmountsKnown
    ? assignmentAmounts.reduce((sum, item) => sum + item.amount, 0)
    : null;
  const creatorCitations = assignments
    .map((assignment, index) => assignmentAmounts[index].known ? safeCitation({
      recordId: assignmentAmounts[index].sourceRecordId,
      label: `Creator obligation ${assignment?.id || index + 1}`,
      sourceDate: assignment?.payment?.updatedAt || null,
      field: "creator_obligation"
    }) : null)
    .filter(Boolean);

  const projectedMargin = clientAmount !== null && creatorTotal !== null
    ? known(clientAmount - creatorTotal, [...clientCitations, ...creatorCitations], {
        percent: clientAmount === 0 ? null : round(((clientAmount - creatorTotal) / clientAmount) * 100)
      })
    : unavailable("missing");

  return Object.freeze({
    currency: terms?.currency || campaign?.currency || "USD",
    clientContractValue: clientAmount === null
      ? unavailable(terms?.state && terms.state !== "agreed" ? "unverified" : "missing")
      : known(clientAmount, clientCitations),
    creatorObligations: creatorTotal === null
      ? unavailable(assignments.length ? "missing" : "no_assignments")
      : known(creatorTotal, creatorCitations, {
          coverage: { known: assignmentAmounts.filter((item) => item.known).length, total: assignments.length }
        }),
    projectedMargin,
    externalAccountingReference: terms?.externalAccountingReference || null,
    accountingAuthority: "external"
  });
}

const canonicalReportMetricFields = Object.freeze({
  Views: "views",
  Likes: "likes",
  Comments: "comments",
  Saves: "saves",
  Shares: "shares"
});

const reportEvidence = (campaign, selectedMetrics = ["Views"]) => {
  const missingEvidence = [];
  const rows = [];
  const metricSelections = asArray(selectedMetrics).map((label) => ({
    label,
    field: canonicalReportMetricFields[label]
  }));
  if (!metricSelections.length || metricSelections.some((item) => !item.field)) {
    missingEvidence.push("At least one supported verified metric is required");
  }
  if (!asArray(campaign?.assignments).length) missingEvidence.push("At least one campaign assignment is required");
  for (const assignment of asArray(campaign?.assignments)) {
    const deliverables = asArray(assignment.deliverables).length
      ? assignment.deliverables
      : assignment.deliverable
        ? [assignment.deliverable]
        : [];
    const post = assignment.post;
    const performance = assignment.performance;
    const exactDeliverable = deliverables.some((item) => item?.id && item.id === post?.deliverableId);
    if (!post?.verified || !post?.url || !post?.sourceRecordId || !exactDeliverable) {
      missingEvidence.push(`Assignment ${assignment.id || "unknown"} needs an exact verified post`);
      continue;
    }
    const compliance = asArray(assignment.complianceReviews).at(-1);
    const disclosureStatus = String(compliance?.disclosureStatus || "").toLowerCase().replaceAll(" ", "_");
    if (
      !["verified", "not_required"].includes(disclosureStatus) ||
      !compliance?.reviewedAt ||
      !compliance?.reviewer ||
      compliance?.deliverableId !== post.deliverableId ||
      (post.attributionId && compliance?.attributionId !== post.attributionId)
    ) {
      missingEvidence.push(`Assignment ${assignment.id || "unknown"} needs an approved disclosure review tied to the exact post`);
      continue;
    }
    if (
      !performance?.verified ||
      !performance?.sourceRecordId ||
      !performance?.collectedAt ||
      !performance?.owner
    ) {
      missingEvidence.push(`Assignment ${assignment.id || "unknown"} needs approved metric provenance`);
      continue;
    }
    const selectedValues = {};
    const missingSelectedMetrics = metricSelections.filter(({ field }) => {
      const value = finite(performance[field]);
      if (value === null) return true;
      selectedValues[field] = value;
      return false;
    });
    if (missingSelectedMetrics.length) {
      missingEvidence.push(
        `Assignment ${assignment.id || "unknown"} is missing verified ${missingSelectedMetrics.map((item) => item.label).join(", ")}`
      );
      continue;
    }
    rows.push({
      assignmentId: assignment.id,
      creatorId: assignment.creatorId,
      post: {
        id: post.id,
        url: post.url,
        platform: post.platform || null,
        sourceRecordId: post.sourceRecordId
      },
      metrics: {
        ...selectedValues,
        sourceRecordId: performance.sourceRecordId,
        collectedAt: performance.collectedAt,
        owner: performance.owner
      },
      compliance: {
        reviewId: compliance.id || null,
        disclosureStatus,
        reviewedAt: compliance.reviewedAt,
        reviewer: compliance.reviewer
      }
    });
  }
  return {
    evidenceCoverage: missingEvidence.length ? (rows.length ? "partial" : "missing") : "complete",
    missingEvidence,
    rows
  };
};

const reportModuleCatalog = new Set([
  "Campaign summary and objectives",
  "Verified platform performance"
]);
const reportMetricCatalog = new Set(["Views", "Likes", "Comments", "Saves", "Shares"]);
const reportBrandingCatalog = new Set(["BYOU + client", "BYOU only", "Client only"]);
const reportPerformanceModules = new Set([
  "Verified platform performance"
]);

const reportPreview = (store, campaignId) => {
  const campaign = store.campaigns.find((item) => item.id === campaignId);
  if (!campaign) return null;
  const draft = store.reportDrafts.find((item) => item.campaignId === campaignId) || null;
  const modules = draft?.modules || ["Campaign summary and objectives", "Verified platform performance"];
  const includePerformance = modules.some((module) => reportPerformanceModules.has(module));
  const evidence = includePerformance
    ? reportEvidence(campaign, draft?.metrics || ["Views"])
    : { evidenceCoverage: "complete", missingEvidence: [], rows: [] };
  const snapshot = { generatedFromRevision: store.revision };
  if (modules.includes("Campaign summary and objectives")) {
    snapshot.campaign = {
      id: campaign.id,
      name: campaign.name,
      clientId: campaign.clientId,
      brandId: campaign.brandId,
      objective: campaign.objective || null,
      startDate: campaign.startDate || null,
      endDate: campaign.endDate || null
    };
  }
  if (includePerformance) snapshot.verifiedPerformance = evidence.rows;
  return {
    artifact: "report",
    campaignId,
    revision: store.revision,
    draftConfiguration: draft ? clone(draft) : null,
    evidenceCoverage: evidence.evidenceCoverage,
    missingEvidence: evidence.missingEvidence,
    snapshot
  };
};

const findArtifactVersion = (store, artifact, versionId) => {
  if (artifact === "report") return store.reportVersions.find((item) => item.id === versionId);
  if (artifact === "proposal") {
    return store.proposals.flatMap((proposal) => asArray(proposal.versions)).find((item) => item.id === versionId);
  }
  return null;
};

const artifactVersionMetadata = (version) => {
  if (!version) return null;
  return {
    id: version.id,
    artifact: version.artifact,
    proposalId: version.proposalId || null,
    campaignId: version.campaignId,
    publishedAt: version.publishedAt || null,
    expiresAt: version.expiresAt || null,
    revokedAt: version.revokedAt || null,
    revocationReason: version.revocationReason || null,
    modules: clone(asArray(version.modules)),
    metrics: clone(asArray(version.metrics)),
    branding: version.branding || null,
    contentFingerprint: version.contentFingerprint || null
  };
};

const artifactVersionContentProjection = (version) => ({
  ...artifactVersionMetadata(version),
  snapshot: clone(version.snapshot)
});

const proposalProjection = (proposal, revision = null) => {
  if (!proposal) return null;
  return {
    ...(revision === null ? {} : { revision }),
    id: proposal.id,
    campaignId: proposal.campaignId,
    campaignName: proposal.campaignName || null,
    clientId: proposal.clientId || null,
    brandId: proposal.brandId || null,
    title: proposal.title,
    status: proposal.status,
    assignmentIds: clone(asArray(proposal.assignmentIds)),
    proposedClientValue: proposal.proposedClientValue,
    currency: proposal.currency,
    outcome: proposal.outcome || null,
    outcomeVersionId: proposal.outcomeVersionId || null,
    outcomeRecordedAt: proposal.outcomeRecordedAt || null,
    updatedAt: proposal.updatedAt || null,
    versions: asArray(proposal.versions).map(artifactVersionMetadata)
  };
};

const attentionProjection = (item) => ({
  id: item.id,
  clientId: item.clientId || null,
  campaignId: item.campaignId || null,
  reason: item.reason,
  status: item.status,
  ownerId: item.ownerId || null,
  owner: item.owner || item.ownerLabel || null,
  nextAction: item.nextAction,
  dueAt: item.dueAt || null,
  severity: item.severity || "normal",
  revision: item.revision ?? null
});

const activityProjection = (item) => safeActivity({
  id: item.id,
  clientId: item.clientId || null,
  campaignId: item.campaignId || null,
  actorId: item.actorId || null,
  type: item.type,
  summary: item.summary,
  occurredAt: item.occurredAt
});

const campaignContactProjection = (item) => ({
  clientId: item.clientId || null,
  campaignId: item.campaignId,
  contactId: item.contactId,
  roles: clone(asArray(item.roles)),
  revision: item.revision ?? null
});

const reportDraftProjection = (draft) => ({
  campaignId: draft.campaignId,
  modules: clone(asArray(draft.modules)),
  metrics: clone(asArray(draft.metrics)),
  branding: draft.branding,
  updatedAt: draft.updatedAt || null,
  updatedBy: draft.updatedBy || null
});

const commercialTermsProjection = (terms) => terms ? {
  id: terms.id,
  state: terms.state,
  amount: terms.amount,
  currency: terms.currency,
  effectiveOn: terms.effectiveOn || null,
  evidence: asArray(terms.evidence).map((item) => ({
    recordId: item.recordId,
    label: item.label,
    sourceDate: item.sourceDate || null
  })),
  requiresStaffReview: terms.requiresStaffReview === true,
  externalAccountingReference: terms.externalAccountingReference || null
} : null;

const contactProjection = (store, contact, context) => {
  const authorized = hasRole(context, ["admin", "relationship_manager", "campaign_manager"]);
  const roles = store.campaignContacts
    .filter((item) => item.contactId === contact.id)
    .flatMap((item) => item.roles.map((role) => ({ campaignId: item.campaignId, role })));
  return {
    id: contact.id,
    clientId: contact.clientId,
    displayName: contact.displayName,
    title: contact.title || null,
    preferredChannel: contact.preferredChannel || null,
    status: normalizedContactStatus(contact.status || "active"),
    note: contact.note || null,
    campaignRoles: roles,
    restrictedMethods: authorized
      ? Object.fromEntries(["email", "phone", "mobile", "whatsapp"]
          .filter((key) => contact.restrictedMethods?.[key])
          .map((key) => [key, contact.restrictedMethods[key]]))
      : { availability: "restricted" }
  };
};

const clientProjection = (store, clientId, context) => {
  const client = store.clients.find((item) => item.id === clientId);
  if (!client) return null;
  const campaigns = store.campaigns.filter((item) => item.clientId === clientId);
  return {
    revision: store.revision,
    id: client.id,
    name: client.name,
    lifecycleStatus: client.lifecycleStatus,
    industry: client.industry || null,
    relationshipOwner: client.relationshipOwner || client.owner || null,
    website: client.website || null,
    description: client.description || null,
    note: client.note || null,
    brandIds: clone(asArray(client.brandIds)),
    brands: asArray(client.brands).map((brand) => ({ id: brand.id, name: brand.name })),
    campaignIds: clone(asArray(client.campaignIds)),
    contacts: store.contacts
      .filter((item) => item.clientId === clientId)
      .map((item) => contactProjection(store, item, context)),
    campaigns: campaigns.map((item) => ({
      id: item.id,
      name: item.name,
      status: item.status,
      commercial: canonicalCampaignCommercials(item)
    })),
    activity: store.activity
      .filter((item) => item.clientId === clientId || campaigns.some((campaign) => campaign.id === item.campaignId))
      .map(activityProjection)
  };
};

const campaignProjection = (store, campaignId, context) => {
  const campaign = store.campaigns.find((item) => item.id === campaignId);
  if (!campaign) return null;
  const contactRoles = store.campaignContacts.filter((item) => item.campaignId === campaignId);
  const contactIds = new Set(contactRoles.map((item) => item.contactId));
  return {
    revision: store.revision,
    id: campaign.id,
    clientId: campaign.clientId,
    brandId: campaign.brandId || null,
    name: campaign.name,
    status: campaign.status,
    objective: campaign.objective || null,
    startDate: campaign.startDate || null,
    endDate: campaign.endDate || null,
    currency: campaign.currency || campaign.clientCommercialTerms?.currency || "USD",
    clientCommercialTerms: commercialTermsProjection(campaign.clientCommercialTerms),
    commercial: canonicalCampaignCommercials(campaign),
    contacts: store.contacts
      .filter((item) => contactIds.has(item.id))
      .map((item) => contactProjection(store, item, context)),
    attention: store.attention.filter((item) => item.campaignId === campaignId).map(attentionProjection),
    activity: store.activity.filter((item) => item.campaignId === campaignId).map(activityProjection)
  };
};

const assistantQuestionIds = new Set([
  "campaign.commercial-status",
  "campaign.next-actions",
  "campaigns.overdue-deliverables",
  "campaign.report-readiness",
  "campaign.priority-recommendation"
]);

export function validateOperationalAnswer(answer) {
  const validateCitation = (citation) => {
    if (!citation || typeof citation !== "object" || Array.isArray(citation)) {
      throw new TypeError("Every citation must identify its source record");
    }
    assertText(citation.recordId, "Citation record id", { max: 200 });
    assertText(citation.label, "Citation label", { max: 500 });
    const sourceDate = citation.sourceDate == null ? null : assertText(citation.sourceDate, "Citation source date", { max: 100 });
    const href = citation.href == null ? null : assertText(citation.href, "Citation link", { max: 1_000 });
    const field = citation.field == null ? null : assertText(citation.field, "Citation field", { max: 160 });
    if (!sourceDate && !href && !field) {
      throw new TypeError("Every citation requires a source date, link, or field");
    }
  };
  if (!answer || typeof answer !== "object") throw new TypeError("Operational answer is required");
  if (answer.kind === "operational-answer") {
    if (!asArray(answer.facts).length) throw new TypeError("Operational answers require cited facts");
    for (const fact of answer.facts) {
      if (!assertText(fact?.statement, "Fact", { max: 1_000 }) || !asArray(fact?.citations).length) {
        throw new TypeError("Every operational fact requires a citation");
      }
      fact.citations.forEach(validateCitation);
    }
    return answer;
  }
  if (answer.kind === "recommendation") {
    if (answer.label !== "Recommendation") throw new TypeError("Recommendations must be visibly labeled");
    if (!asArray(answer.reasons).length) throw new TypeError("Recommendations require cited reasons");
    for (const reason of answer.reasons) {
      if (!assertText(reason?.reason, "Recommendation reason", { max: 1_000 }) || !asArray(reason?.citations).length) {
        throw new TypeError("Every recommendation reason requires a citation");
      }
      reason.citations.forEach(validateCitation);
    }
    return answer;
  }
  if (answer.kind === "not_available") return answer;
  throw new TypeError("Unsupported operational answer");
}

const answerOperationalQuestion = (store, question, context, now) => {
  if (!assistantQuestionIds.has(question?.id)) {
    return outcomeError("question_not_allowed", "That question is outside the operational assistant catalog");
  }
  const campaignId = question?.parameters?.campaignId;
  if (question.id === "campaign.commercial-status") {
    const campaign = store.campaigns.find((item) => item.id === campaignId);
    if (!campaign) return outcomeError("not_available", "The campaign is not available");
    const commercial = canonicalCampaignCommercials(campaign);
    const citations = [
      ...asArray(commercial.clientContractValue.citations),
      ...asArray(commercial.creatorObligations.citations)
    ];
    const allCanonicalValuesKnown = [
      commercial.clientContractValue,
      commercial.creatorObligations,
      commercial.projectedMargin
    ].every((item) => item?.availability === "known" && asArray(item.citations).length > 0);
    if (!allCanonicalValuesKnown) {
      return { ok: true, data: { kind: "not_available", missingRequirements: ["Verified client and creator commercial evidence"] } };
    }
    const answer = {
      kind: "operational-answer",
      facts: [{
        statement: `Commercial status for ${campaign.name} uses the same canonical campaign calculation as the workspace.`,
        citations
      }],
      commercial
    };
    validateOperationalAnswer(answer);
    return { ok: true, data: answer };
  }
  if (question.id === "campaign.next-actions") {
    const items = store.attention.filter((item) => item.campaignId === campaignId && item.status === "open");
    if (!items.length) return { ok: true, data: { kind: "not_available", missingRequirements: ["Open campaign attention"] } };
    const answer = {
      kind: "operational-answer",
      facts: items.map((item) => ({
        statement: item.nextAction,
        citations: [safeCitation({
          recordId: item.id,
          label: item.reason,
          sourceDate: item.dueAt,
          field: "next_action"
        })]
      }))
    };
    validateOperationalAnswer(answer);
    return { ok: true, data: answer };
  }
  if (question.id === "campaigns.overdue-deliverables") {
    const asOf = Date.parse(question?.parameters?.asOf || now());
    const items = store.attention.filter((item) => item.status === "open" && item.dueAt && Date.parse(item.dueAt) < asOf);
    const answer = items.length ? {
      kind: "operational-answer",
      facts: items.map((item) => ({
        statement: item.nextAction,
        citations: [safeCitation({
          recordId: item.id,
          label: item.reason,
          sourceDate: item.dueAt,
          field: "next_action"
        })]
      }))
    } : { kind: "not_available", missingRequirements: ["No overdue operational attention was found"] };
    if (answer.kind !== "not_available") validateOperationalAnswer(answer);
    return { ok: true, data: answer };
  }
  if (question.id === "campaign.report-readiness") {
    const preview = reportPreview(store, campaignId);
    if (!preview) return outcomeError("not_available", "The campaign is not available");
    const answer = {
      kind: "operational-answer",
      facts: [{
        statement: preview.evidenceCoverage === "complete"
          ? "The campaign has complete publishable evidence."
          : `The campaign report is ${preview.evidenceCoverage}; ${preview.missingEvidence.join("; ")}.`,
        citations: [safeCitation({
          recordId: campaignId,
          label: "Campaign report preview",
          field: "report_readiness"
        })]
      }],
      readiness: {
        campaignId,
        revision: preview.revision,
        evidenceCoverage: preview.evidenceCoverage,
        missingEvidence: clone(preview.missingEvidence)
      }
    };
    validateOperationalAnswer(answer);
    return { ok: true, data: answer };
  }
  const candidates = store.attention
    .filter((item) => item.status === "open")
    .sort((left, right) => String(left.dueAt || "9999").localeCompare(String(right.dueAt || "9999")));
  if (!candidates.length) return { ok: true, data: { kind: "not_available", missingRequirements: ["Open operational attention"] } };
  const first = candidates[0];
  const campaign = store.campaigns.find((item) => item.id === first.campaignId);
  const answer = {
    kind: "recommendation",
    label: "Recommendation",
    recommendation: `Prioritize ${campaign?.name || "the linked campaign"}.`,
    reasons: [{
      reason: `${first.reason}; next action: ${first.nextAction}.`,
      citations: [safeCitation({
        recordId: first.id,
        label: first.reason,
        sourceDate: first.dueAt,
        field: "next_action"
      })]
    }]
  };
  validateOperationalAnswer(answer);
  return { ok: true, data: answer };
};

const safeActivity = ({ id, clientId = null, campaignId = null, actorId, type, summary, occurredAt }) => ({
  id,
  clientId,
  campaignId,
  actorId,
  type,
  summary,
  occurredAt
});

const ensureRevision = (store, expectedRevision) => {
  if (expectedRevision === null || expectedRevision === undefined) return null;
  if (!Number.isInteger(expectedRevision) || expectedRevision !== store.revision) {
    return outcomeError("version_conflict", "This record changed after it was opened", true, {
      currentRevision: store.revision
    });
  }
  return null;
};

const requireRole = (context, roles) => hasRole(context, roles)
  ? null
  : outcomeError("not_authorized", "Your role cannot perform this operation");

const commandDefinitions = Object.freeze({
  "client.save": ["admin", "relationship_manager"],
  "contact.save": ["admin", "relationship_manager"],
  "campaign-contact-role.set": ["admin", "relationship_manager"],
  "client-commercial-terms.record": ["admin", "relationship_manager", "finance_admin"],
  "attention.set-next-action": ["admin", "relationship_manager", "campaign_manager", "analyst", "finance_admin"],
  "attention.resolve": ["admin", "relationship_manager", "campaign_manager", "analyst", "finance_admin"],
  "artifact.save-draft": ["admin", "analyst"],
  "artifact.publish": ["admin", "analyst"],
  "artifact.revoke": ["admin", "analyst", "relationship_manager"],
  "proposal.save-draft": ["admin", "relationship_manager"],
  "proposal.publish": ["admin", "relationship_manager"],
  "proposal.record-outcome": ["admin", "relationship_manager"]
});

const commandRoles = (command) => {
  if (command?.command === "artifact.revoke") {
    if (command.artifact === "report") return ["admin", "analyst"];
    if (command.artifact === "proposal") return ["admin", "relationship_manager"];
  }
  return commandDefinitions[command?.command];
};

const requiresExpectedRevision = (command) => {
  if (command?.command === "client.save") return Boolean(command.client?.id);
  if (command?.command === "contact.save") return Boolean(command.contact?.id);
  if (command?.command === "proposal.save-draft") return true;
  return true;
};

export function createMemoryCrmGateway(seed = {}, dependencies = {}) {
  const now = dependencies.now || (() => new Date().toISOString());
  const id = dependencies.id || (() => crypto.randomUUID());
  const futureExpiry = (value) => {
    const expiresAt = assertDateTime(value, "Expiration");
    if (expiresAt !== null && Date.parse(expiresAt) <= Date.parse(now())) {
      throw new TypeError("Expiration must be in the future");
    }
    return expiresAt;
  };
  const store = {
    revision: Number.isInteger(seed.revision) ? seed.revision : 1,
    clients: clone(asArray(seed.clients)),
    contacts: clone(asArray(seed.contacts)),
    campaignContacts: clone(asArray(seed.campaignContacts)),
    campaigns: clone(asArray(seed.campaigns)),
    creators: clone(asArray(seed.creators)),
    attention: clone(asArray(seed.attention)),
    activity: clone(asArray(seed.activity)),
    reportDrafts: clone(asArray(seed.reportDrafts)),
    reportVersions: clone(asArray(seed.reportVersions)),
    proposals: clone(asArray(seed.proposals)),
    receipts: new Map(),
    commandReceipts: new Map()
  };
  const scopedSeedRecords = [
    ...store.clients,
    ...store.contacts,
    ...store.campaignContacts,
    ...store.campaigns,
    ...store.creators,
    ...store.attention,
    ...store.activity,
    ...store.reportDrafts,
    ...store.reportVersions,
    ...store.proposals
  ];
  const seedAgencyIds = new Set(scopedSeedRecords.map((item) => item?.agencyId).filter(Boolean));
  const seedTenantIds = new Set(scopedSeedRecords.map((item) => item?.tenantId).filter(Boolean));
  const viewAccessFailure = (context) => {
    if (!hasRole(context, internalViewRoles)) {
      return outcomeError("not_authorized", "An allowed internal role is required");
    }
    // The memory adapter models one internal workspace. If a supplied seed
    // declares multiple scopes, or the caller does not match its declared
    // scope, deny the whole view rather than risk cross-tenant projection.
    if (seedAgencyIds.size > 1 || seedTenantIds.size > 1) {
      return outcomeError("not_authorized", "The memory seed contains more than one internal workspace");
    }
    const [seedAgencyId] = seedAgencyIds;
    const [seedTenantId] = seedTenantIds;
    if (
      (seedAgencyId && context?.agencyId !== seedAgencyId)
      || (seedTenantId && context?.tenantId !== seedTenantId)
    ) {
      return outcomeError("not_authorized", "The requested internal workspace does not match this memory seed");
    }
    return null;
  };

  const capabilities = Object.freeze({
    publicIntake: false,
    personalTasks: false,
    paymentExecution: false,
    mediaKitPublishing: false,
    proposalPublishing: dependencies.proposalPublishing === true
  });

  const view = async (request, context = {}) => {
    const accessFailure = viewAccessFailure(context);
    if (accessFailure) return accessFailure;
    if (!request || typeof request !== "object") return outcomeError("invalid_view", "A CRM view request is required");
    if (request.view === "bootstrap") {
      return { ok: true, data: {
        revision: store.revision,
        clients: store.clients.map((client) => clientProjection(store, client.id, context)),
        contacts: store.contacts.map((contact) => contactProjection(store, contact, context)),
        campaignContacts: store.campaignContacts.map(campaignContactProjection),
        attention: store.attention.map(attentionProjection),
        activity: store.activity.map(activityProjection),
        reportDrafts: store.reportDrafts.map(reportDraftProjection),
        reportVersions: store.reportVersions.map(artifactVersionMetadata),
        proposals: store.proposals.map((proposal) => proposalProjection(proposal)),
        capabilities
      } };
    }
    if (request.view === "clients") {
      return { ok: true, data: {
        revision: store.revision,
        items: store.clients.map((client) => clientProjection(store, client.id, context))
      } };
    }
    if (request.view === "client") {
      const data = clientProjection(store, request.clientId, context);
      return data ? { ok: true, data } : outcomeError("not_found", "Client not found");
    }
    if (request.view === "campaign") {
      const data = campaignProjection(store, request.campaignId, context);
      return data ? { ok: true, data } : outcomeError("not_found", "Campaign not found");
    }
    if (request.view === "attention") {
      const scope = request.scope || {};
      const items = store.attention.filter((item) =>
        (!scope.campaignId || item.campaignId === scope.campaignId) &&
        (!scope.ownerId || item.ownerId === scope.ownerId) &&
        (!scope.status || item.status === scope.status)
      );
      return { ok: true, data: { revision: store.revision, items: items.map(attentionProjection) } };
    }
    if (request.view === "proposals") {
      return { ok: true, data: { revision: store.revision, items: store.proposals.map((proposal) => proposalProjection(proposal)) } };
    }
    if (request.view === "proposal") {
      const proposal = store.proposals.find((item) => item.id === request.proposalId);
      return proposal ? { ok: true, data: proposalProjection(proposal, store.revision) } : outcomeError("not_found", "Proposal not found");
    }
    if (request.view === "artifact-preview" && request.artifact === "report") {
      const data = reportPreview(store, request.campaignId);
      return data ? { ok: true, data } : outcomeError("not_found", "Campaign not found");
    }
    if (request.view === "artifact-preview" && request.artifact === "proposal") {
      const proposal = store.proposals.find((item) => item.id === request.proposalId);
      return proposal ? { ok: true, data: { revision: store.revision, artifact: "proposal", proposal: proposalProjection(proposal) } } : outcomeError("not_found", "Proposal not found");
    }
    if (request.view === "artifact-version") {
      const version = findArtifactVersion(store, request.artifact, request.versionId);
      if (!version || version.revokedAt || (version.expiresAt && Date.parse(version.expiresAt) <= Date.parse(now()))) {
        return outcomeError("not_available", "This immutable version is expired, revoked, or unavailable");
      }
      return { ok: true, data: artifactVersionContentProjection(version) };
    }
    if (request.view === "assistant") return answerOperationalQuestion(store, request.question, context, now);
    return outcomeError("invalid_view", "That CRM view is not available");
  };

  const receipt = (command, changedEntities, viewUpdates, extra = {}) => {
    store.revision += 1;
    const value = {
      receiptId: id(),
      status: "succeeded",
      auditEvent: {
        eventId: id(),
        actorId: extra.actorId,
        occurredAt: now()
      },
      changedEntities,
      viewUpdates,
      invalidates: [],
      revision: store.revision,
      ...extra.receipt
    };
    store.receipts.set(value.receiptId, clone(value));
    store.commandReceipts.set(command.commandId, {
      binding: commandBinding(command, { actorId: extra.actorId }),
      receipt: clone(value)
    });
    return { ok: true, data: value };
  };

  const act = async (command, context = {}) => {
    const accessFailure = viewAccessFailure(context);
    if (accessFailure) return accessFailure;
    const allowedRoles = commandRoles(command);
    if (!allowedRoles) return outcomeError("invalid_command", "That CRM command is not available");
    const roleFailure = requireRole(context, allowedRoles);
    if (roleFailure) return roleFailure;
    if (!command.commandId || typeof command.commandId !== "string") return outcomeError("invalid_command", "A command id is required");
    const applied = store.commandReceipts.get(command.commandId);
    if (applied) {
      if (applied.binding !== commandBinding(command, context)) {
        return outcomeError("idempotency_conflict", "That command id is already bound to a different actor or payload");
      }
      return { ok: true, data: { ...clone(applied.receipt), status: "unchanged", reason: "already_applied" } };
    }
    if (
      ["proposal.publish", "proposal.record-outcome"].includes(command.command)
      && !capabilities.proposalPublishing
    ) {
      return outcomeError("feature_disabled", "Proposal publishing is not enabled");
    }
    if (
      requiresExpectedRevision(command)
      && (command.expectedRevision === null || command.expectedRevision === undefined)
    ) {
      return outcomeError("invalid_command", "An existing record revision is required");
    }
    const conflict = ensureRevision(store, command.expectedRevision);
    if (conflict) return conflict;

    try {
      if (command.command === "client.save") {
        const clientId = command.client?.id || id();
        const existing = store.clients.find((item) => item.id === clientId);
        const next = {
          ...(existing || {}),
          id: clientId,
          name: assertText(command.client?.name, "Client name", { max: 200 }),
          lifecycleStatus: normalizedClientLifecycleStatus(command.client?.lifecycleStatus || "prospect"),
          industry: command.client?.industry ? assertText(command.client.industry, "Industry", { max: 120 }) : null,
          website: assertWebUrl(command.client?.website),
          description: assertPublicProfileText(command.client?.description, "Client description"),
          note: assertPublicProfileText(command.client?.note, "Client note"),
          brandIds: asArray(existing?.brandIds)
        };
        if (existing) Object.assign(existing, next);
        else store.clients.push(next);
        store.activity.unshift(safeActivity({
          id: id(), clientId, actorId: context.actorId,
          type: existing ? "client.updated" : "client.created",
          summary: `${next.name} client profile ${existing ? "updated" : "created"}.`, occurredAt: now()
        }));
        return receipt(command, [{ kind: "client", id: clientId }], [
          { key: `client:${clientId}`, value: clientProjection(store, clientId, context) },
          { key: "activity", value: store.activity.map(activityProjection) }
        ], { actorId: context.actorId });
      }

      if (command.command === "contact.save") {
        const client = store.clients.find((item) => item.id === command.clientId);
        if (!client) return outcomeError("not_found", "Client not found");
        const contactId = command.contact.id || id();
        const existing = store.contacts.find((item) => item.id === contactId);
        const next = {
          id: contactId,
          clientId: client.id,
          displayName: assertText(command.contact.displayName, "Contact name", { max: 160 }),
          title: command.contact.title ? assertText(command.contact.title, "Title", { max: 160 }) : null,
          preferredChannel: normalizedPreferredChannel(command.contact.preferredChannel),
          status: normalizedContactStatus(command.contact.status),
          note: assertPublicProfileText(command.contact.note, "Contact note"),
          restrictedMethods: {
            email: command.contact.email || null,
            phone: command.contact.phone || null,
            mobile: command.contact.mobile || null,
            whatsapp: command.contact.whatsapp || null
          }
        };
        if (existing) Object.assign(existing, next);
        else store.contacts.push(next);
        store.activity.unshift(safeActivity({
          id: id(), clientId: client.id, actorId: context.actorId,
          type: existing ? "contact.updated" : "contact.created",
          summary: `${next.displayName} contact record ${existing ? "updated" : "created"}.`, occurredAt: now()
        }));
        const clientView = clientProjection(store, client.id, context);
        return receipt(command, [{ kind: "contact", id: contactId }], [
          { key: `client:${client.id}`, value: clientView },
          { key: "activity", value: store.activity.map(activityProjection) }
        ], { actorId: context.actorId });
      }

      if (command.command === "campaign-contact-role.set") {
        const campaign = store.campaigns.find((item) => item.id === command.campaignId);
        const contact = store.contacts.find((item) => item.id === command.contactId);
        if (!campaign || !contact || contact.clientId !== campaign.clientId) {
          return outcomeError("not_found", "Campaign and contact must belong to the same client");
        }
        const allowed = new Set(["client_contact", "billing_contact", "approver", "executive_sponsor", "other"]);
        const roles = [...new Set(asArray(command.roles).map((item) => String(item)))];
        if (!roles.length || roles.some((role) => !allowed.has(role))) return outcomeError("invalid_command", "Campaign contact role is invalid");
        const existing = store.campaignContacts.find((item) => item.campaignId === campaign.id && item.contactId === contact.id);
        if (existing) existing.roles = roles;
        else store.campaignContacts.push({ campaignId: campaign.id, contactId: contact.id, roles });
        store.activity.unshift(safeActivity({
          id: id(), clientId: contact.clientId, campaignId: campaign.id, actorId: context.actorId,
          type: "campaign.contact_role_set", summary: `${contact.displayName} linked to ${campaign.name}.`, occurredAt: now()
        }));
        return receipt(command, [
          { kind: "contact", id: contact.id }, { kind: "campaign", id: campaign.id }
        ], [
          { key: `campaign:${campaign.id}`, value: campaignProjection(store, campaign.id, context) },
          { key: `client:${contact.clientId}`, value: clientProjection(store, contact.clientId, context) },
          { key: "activity", value: store.activity.map(activityProjection) }
        ], { actorId: context.actorId });
      }

      if (command.command === "client-commercial-terms.record") {
        const campaign = store.campaigns.find((item) => item.id === command.campaignId);
        if (!campaign) return outcomeError("not_found", "Campaign not found");
        const amount = finite(command.contractValue?.amount);
        if (amount === null || amount < 0) return outcomeError("invalid_command", "Contract value must be a non-negative amount");
        const state = String(command.state || "");
        if (!["proposed", "negotiating", "agreed"].includes(state)) return outcomeError("invalid_command", "Commercial state is invalid");
        const evidence = asArray(command.evidence).length
          ? clone(asArray(command.evidence))
          : command.evidenceReferenceId
            ? [{
                recordId: command.evidenceReferenceId,
                label: "Approved client commercial evidence",
                sourceDate: command.effectiveOn || null
              }]
            : [];
        if (state === "agreed" && !evidence.length) return outcomeError("evidence_required", "Agreed client terms require evidence");
        campaign.clientCommercialTerms = {
          id: campaign.clientCommercialTerms?.id || id(),
          state,
          amount,
          currency: normalizedCurrency(command.contractValue.currency),
          effectiveOn: command.effectiveOn || null,
          evidence,
          externalAccountingReference: command.externalAccountingReference || null,
          requiresStaffReview: state !== "agreed"
        };
        store.activity.unshift(safeActivity({
          id: id(), clientId: campaign.clientId, campaignId: campaign.id, actorId: context.actorId,
          type: "commercial.client_terms_recorded",
          summary: `${state === "agreed" ? "Agreed" : "Proposed"} client commercial terms recorded.`, occurredAt: now()
        }));
        const commercial = canonicalCampaignCommercials(campaign);
        return receipt(command, [{ kind: "client_commercial_terms", id: campaign.clientCommercialTerms.id }], [
          { key: `campaign:${campaign.id}`, value: campaignProjection(store, campaign.id, context) },
          { key: `commercial:${campaign.id}`, value: commercial },
          { key: "activity", value: store.activity.map(activityProjection) }
        ], { actorId: context.actorId, receipt: { canonicalCommercialSummary: commercial } });
      }

      if (command.command === "attention.set-next-action") {
        const item = store.attention.find((candidate) => candidate.id === command.attentionId);
        if (!item) return outcomeError("not_found", "Attention item not found");
        const ownerId = command.ownerId == null || command.ownerId === ""
          ? null
          : assertText(command.ownerId, "Owner id", { max: 160 });
        const ownerLabel = command.ownerLabel == null || command.ownerLabel === ""
          ? null
          : assertPublicProfileText(command.ownerLabel, "Owner label", { max: 160 });
        if ((ownerId === null) === (ownerLabel === null)) {
          return outcomeError("invalid_command", "Choose exactly one staff owner or owner label");
        }
        item.ownerId = ownerId;
        item.ownerLabel = ownerLabel;
        item.owner = ownerLabel || ownerId;
        item.nextAction = assertPublicProfileText(command.nextAction, "Next action", { max: 500, nullable: false });
        item.dueAt = assertDateTime(command.dueAt, "Due date");
        item.status = "open";
        store.activity.unshift(safeActivity({
          id: id(),
          campaignId: item.campaignId || null,
          actorId: context.actorId,
          type: "attention.next_action_set",
          summary: `Next action set: ${item.nextAction}`,
          occurredAt: now()
        }));
        return receipt(command, [{ kind: "attention", id: item.id }], [
          { key: "attention", value: store.attention.map(attentionProjection) },
          { key: "activity", value: store.activity.map(activityProjection) }
        ], { actorId: context.actorId });
      }

      if (command.command === "attention.resolve") {
        const item = store.attention.find((candidate) => candidate.id === command.attentionId);
        if (!item) return outcomeError("not_found", "Attention item not found");
        item.status = "resolved";
        item.resolvedAt = now();
        item.resolutionNote = assertPublicProfileText(command.resolutionNote, "Resolution note", { max: 1_000 });
        store.activity.unshift(safeActivity({
          id: id(),
          campaignId: item.campaignId || null,
          actorId: context.actorId,
          type: "attention.resolved",
          summary: "Operational attention resolved.",
          occurredAt: now()
        }));
        return receipt(command, [{ kind: "attention", id: item.id }], [
          { key: "attention", value: store.attention.map(attentionProjection) },
          { key: "activity", value: store.activity.map(activityProjection) }
        ], { actorId: context.actorId });
      }

      if (command.command === "artifact.save-draft") {
        if (command.artifact !== "report") return outcomeError("invalid_command", "Only internal report drafts are supported");
        const campaign = store.campaigns.find((item) => item.id === command.campaignId);
        if (!campaign) return outcomeError("not_found", "Campaign not found");
        const modules = [...new Set(asArray(command.modules).map((item) => assertText(item, "Report module", { max: 120 })))];
        const metrics = [...new Set(asArray(command.metrics).map((item) => assertText(item, "Report metric", { max: 120 })))];
        const branding = assertText(command.branding, "Report branding", { max: 80 });
        if (
          !modules.length ||
          modules.length > 20 ||
          !metrics.length ||
          metrics.length > 20 ||
          modules.some((item) => !reportModuleCatalog.has(item)) ||
          metrics.some((item) => !reportMetricCatalog.has(item)) ||
          !reportBrandingCatalog.has(branding)
        ) {
          return outcomeError("invalid_command", "Choose only approved report modules, metrics, and branding");
        }
        const draft = {
          campaignId: campaign.id,
          modules,
          metrics,
          branding,
          updatedAt: now(),
          updatedBy: context.actorId || null
        };
        const existingIndex = store.reportDrafts.findIndex((item) => item.campaignId === campaign.id);
        if (existingIndex >= 0) store.reportDrafts[existingIndex] = draft;
        else store.reportDrafts.push(draft);
        return receipt(command, [{ kind: "report_draft", id: campaign.id }], [
          { key: `report-draft:${campaign.id}`, value: clone(draft) }
        ], { actorId: context.actorId });
      }

      if (command.command === "artifact.publish") {
        if (command.artifact === "media-kit") return outcomeError("feature_disabled", "Media-kit publishing is intentionally deferred");
        if (command.artifact !== "report") return outcomeError("invalid_command", "Use the proposal publishing command for proposals");
        const preview = reportPreview(store, command.campaignId);
        if (!preview) return outcomeError("not_found", "Campaign not found");
        const draft = store.reportDrafts.find((item) => item.campaignId === command.campaignId);
        const requestedConfiguration = {
          modules: [...asArray(command.modules)],
          metrics: [...asArray(command.metrics)],
          branding: command.branding || "BYOU + client"
        };
        if (!draft || JSON.stringify({
          modules: draft.modules,
          metrics: draft.metrics,
          branding: draft.branding
        }) !== JSON.stringify(requestedConfiguration)) {
          return outcomeError("draft_required", "Save this exact internal report configuration before publishing");
        }
        if (preview.evidenceCoverage !== "complete") {
          return outcomeError("evidence_required", "Only exact verified posts with approved metric provenance can be published", false, {
            missingEvidence: preview.missingEvidence
          });
        }
        const versionId = id();
        const snapshot = Object.freeze({
          ...clone(preview.snapshot),
          configuration: clone(requestedConfiguration)
        });
        const version = Object.freeze({
          id: versionId,
          artifact: "report",
          campaignId: command.campaignId,
          publishedAt: now(),
          expiresAt: futureExpiry(command.expiresAt),
          revokedAt: null,
          modules: Object.freeze([...asArray(command.modules)]),
          metrics: Object.freeze([...asArray(command.metrics)]),
          branding: command.branding || "BYOU + client",
          contentFingerprint: contentFingerprint(snapshot),
          snapshot
        });
        store.reportVersions.push(version);
        return receipt(command, [{ kind: "report_version", id: versionId }], [
          { key: `report-version:${versionId}`, value: artifactVersionMetadata(version) }
        ], { actorId: context.actorId });
      }

      if (command.command === "artifact.revoke") {
        const version = findArtifactVersion(store, command.artifact, command.versionId);
        if (!version) return outcomeError("not_found", "Artifact version not found");
        if (version.revokedAt) return outcomeError("already_revoked", "Artifact version is already revoked");
        const replacement = { ...clone(version), revokedAt: now(), revocationReason: assertText(command.reason, "Revocation reason", { max: 500 }) };
        if (command.artifact === "report") {
          const index = store.reportVersions.findIndex((item) => item.id === version.id);
          store.reportVersions[index] = Object.freeze(replacement);
        } else {
          for (const proposal of store.proposals) {
            const index = asArray(proposal.versions).findIndex((item) => item.id === version.id);
            if (index >= 0) proposal.versions[index] = Object.freeze(replacement);
          }
        }
        return receipt(command, [{ kind: `${command.artifact}_version`, id: version.id }], [
          { key: `${command.artifact}-version:${version.id}`, value: artifactVersionMetadata(replacement) }
        ], { actorId: context.actorId });
      }

      if (command.command === "proposal.save-draft") {
        const campaign = store.campaigns.find((item) => item.id === command.campaignId);
        if (!campaign) return outcomeError("not_found", "Campaign not found");
        const requestedAssignmentIds = asArray(command.assignmentIds);
        const assignmentIds = [...new Set(requestedAssignmentIds)];
        if (
          !assignmentIds.length
          || assignmentIds.length > 100
          || assignmentIds.length !== requestedAssignmentIds.length
          || assignmentIds.some((assignmentId) => !campaign.assignments.some((item) => item.id === assignmentId))
        ) {
          return outcomeError("invalid_command", "Proposal assignments must belong to the campaign");
        }
        const proposalId = command.proposalId || id();
        const existingProposal = store.proposals.find((item) => item.id === proposalId) || null;
        if (existingProposal && existingProposal.campaignId !== campaign.id) {
          return outcomeError("invalid_state", "An existing proposal cannot move to another campaign");
        }
        const proposedClientValue = finite(command.proposedClientValue);
        if (proposedClientValue === null || proposedClientValue < 0 || proposedClientValue > 999_999_999_999.99) {
          return outcomeError("invalid_command", "Proposal client value must be within the supported range");
        }
        const proposal = existingProposal || {
          id: proposalId,
          campaignId: campaign.id,
          status: "Draft",
          versions: []
        };
        const proposalStatus = String(proposal.status || "").toLowerCase();
        const hasActiveVersion = asArray(proposal.versions).some((version) =>
          !version.revokedAt && (!version.expiresAt || Date.parse(version.expiresAt) > Date.parse(now()))
        );
        const canReopenPublishedDraft = proposalStatus === "published" && !proposal.outcome && !hasActiveVersion;
        if (
          store.proposals.some((item) => item.id === proposal.id)
          && !["draft", "needs_changes"].includes(proposalStatus)
          && !canReopenPublishedDraft
        ) {
          return outcomeError("invalid_state", "Published or terminal proposals cannot be edited");
        }
        Object.assign(proposal, {
          title: assertPublicProfileText(command.title, "Proposal title", { max: 200, nullable: false }),
          assignmentIds,
          proposedClientValue,
          currency: normalizedCurrency(command.currency),
          status: "Draft",
          outcome: null,
          outcomeVersionId: null,
          outcomeRecordedAt: null,
          updatedAt: now()
        });
        if (!store.proposals.some((item) => item.id === proposal.id)) store.proposals.push(proposal);
        return receipt(command, [{ kind: "proposal", id: proposal.id }], [
          { key: `proposal:${proposal.id}`, value: proposalProjection(proposal) }
        ], { actorId: context.actorId });
      }

      if (command.command === "proposal.publish") {
        const proposal = store.proposals.find((item) => item.id === command.proposalId);
        const campaign = store.campaigns.find((item) => item.id === proposal?.campaignId);
        if (!proposal || !campaign) return outcomeError("not_found", "Proposal not found");
        if (String(proposal.status || "").toLowerCase() !== "draft" || proposal.outcome) {
          return outcomeError("invalid_state", "Only an unresolved proposal draft can be published");
        }
        const versionId = id();
        const creators = proposal.assignmentIds.map((assignmentId) => {
          const assignment = campaign.assignments.find((item) => item.id === assignmentId);
          const creator = store.creators.find((item) => item.id === assignment?.creatorId);
          return {
            assignmentId,
            creatorId: creator?.id || assignment?.creatorId,
            displayName: creator?.displayName || creator?.handle || "Creator profile",
            handle: creator?.handle || null
          };
        });
        const snapshot = Object.freeze({
          title: proposal.title,
          campaign: { id: campaign.id, name: campaign.name },
          creators: Object.freeze(clone(creators)),
          proposedClientValue: proposal.proposedClientValue,
          currency: proposal.currency
        });
        const version = Object.freeze({
          id: versionId,
          artifact: "proposal",
          proposalId: proposal.id,
          campaignId: campaign.id,
          publishedAt: now(),
          expiresAt: futureExpiry(command.expiresAt),
          revokedAt: null,
          contentFingerprint: contentFingerprint(snapshot),
          snapshot
        });
        proposal.versions = asArray(proposal.versions).map((existingVersion) => (
          !existingVersion.revokedAt
          && (!existingVersion.expiresAt || Date.parse(existingVersion.expiresAt) > Date.parse(now()))
            ? Object.freeze({
                ...clone(existingVersion),
                revokedAt: now(),
                revocationReason: `Superseded by proposal version ${versionId}`
              })
            : existingVersion
        ));
        proposal.status = "Published";
        proposal.versions.push(version);
        return receipt(command, [{ kind: "proposal_version", id: versionId }], [
          { key: `proposal-version:${versionId}`, value: artifactVersionMetadata(version) },
          { key: `proposal:${proposal.id}`, value: proposalProjection(proposal) }
        ], { actorId: context.actorId });
      }

      if (command.command === "proposal.record-outcome") {
        const proposal = store.proposals.find((item) => item.id === command.proposalId);
        const campaign = store.campaigns.find((item) => item.id === proposal?.campaignId);
        if (!proposal || !campaign) return outcomeError("not_found", "Proposal not found");
        if (!["accepted", "declined", "needs_changes"].includes(command.outcome)) return outcomeError("invalid_command", "Proposal outcome is invalid");
        const outcomeVersion = asArray(proposal.versions).find((item) => item.id === command.proposalVersionId);
        if (
          !outcomeVersion
          || outcomeVersion.revokedAt
          || (outcomeVersion.expiresAt && Date.parse(outcomeVersion.expiresAt) <= Date.parse(now()))
        ) {
          return outcomeError("invalid_state", "The exact active proposal version is required");
        }
        if (proposal.outcomeVersionId === outcomeVersion.id || ["accepted", "declined"].includes(proposal.outcome)) {
          return outcomeError("invalid_state", "That proposal version already has a terminal outcome");
        }
        proposal.outcome = command.outcome;
        proposal.outcomeVersionId = outcomeVersion.id;
        proposal.status = command.outcome;
        proposal.outcomeRecordedAt = now();
        if (command.outcome === "accepted") {
          campaign.clientCommercialTerms = {
            id: id(),
            state: "proposed",
            amount: outcomeVersion.snapshot.proposedClientValue,
            currency: outcomeVersion.snapshot.currency,
            effectiveOn: null,
            evidence: [{ recordId: outcomeVersion.id, label: "Accepted immutable proposal version pending staff verification", sourceDate: now().slice(0, 10) }],
            requiresStaffReview: true,
            externalAccountingReference: null
          };
        }
        return receipt(command, [{ kind: "proposal", id: proposal.id }], [
          { key: `proposal:${proposal.id}`, value: proposalProjection(proposal) },
          { key: `campaign:${campaign.id}`, value: campaignProjection(store, campaign.id, context) }
        ], { actorId: context.actorId });
      }
    } catch (error) {
      return outcomeError("invalid_command", error instanceof Error ? error.message : "The CRM command is invalid");
    }
    return outcomeError("invalid_command", "That CRM command is not implemented");
  };

  const status = async (receiptId, context = {}) => {
    const accessFailure = viewAccessFailure(context);
    if (accessFailure) return accessFailure;
    const value = store.receipts.get(receiptId);
    if (!value) return outcomeError("not_found", "Operation receipt not found");
    if (!context.actorId || context.actorId !== value.auditEvent?.actorId) {
      return outcomeError("not_authorized", "Operation receipts are available only to the initiating actor");
    }
    return { ok: true, data: clone(value) };
  };

  return Object.freeze({ view, act, status, capabilities });
}

/** Browser adapter for the authenticated internal CRM gateway. */
export function createHttpCrmGateway({ requestJson } = {}) {
  if (typeof requestJson !== "function") throw new TypeError("A JSON request adapter is required");
  const call = async (url, options, defaultCode, { notFoundCode = null } = {}) => {
    try {
      const response = await requestJson(url, options);
      const payload = response && typeof response === "object" && "data" in response
        ? response.data
        : response;
      if (payload && typeof payload === "object" && typeof payload.ok === "boolean") return payload;
      return { ok: true, data: payload };
    } catch (error) {
      const status = Number(error?.status || 0);
      return outcomeError(
        error?.code || (
          status === 401 || status === 403
            ? "not_authorized"
            : status === 409
              ? "version_conflict"
              : status === 404 && notFoundCode
                ? notFoundCode
                : defaultCode
        ),
        error instanceof Error ? error.message : "The internal CRM request could not be completed",
        error?.retryable === true || status === 0 || status === 409 || status === 429 || status >= 500
      );
    }
  };
  return Object.freeze({
    capabilities: Object.freeze({
      publicIntake: false,
      personalTasks: false,
      paymentExecution: false,
      mediaKitPublishing: false,
      proposalPublishing: false
    }),
    async view(request) {
      return call("/api/internal-crm/view", { method: "POST", body: { request } }, "invalid_view");
    },
    async act(command) {
      return call("/api/internal-crm/act", { method: "POST", csrf: true, body: { command } }, "invalid_command");
    },
    async status(receiptId) {
      return call(
        `/api/internal-crm/status/${encodeURIComponent(receiptId)}`,
        undefined,
        "temporarily_unavailable",
        { notFoundCode: "not_found" }
      );
    }
  });
}
