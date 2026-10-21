const asArray = (value) => (Array.isArray(value) ? value : value && typeof value === "object" ? [value] : []);

const firstRecord = (value) => asArray(value)[0] || {};

const text = (value, fallback = "") =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const numberOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const revisionOrNull = (value) => {
  const revision = numberOrNull(value);
  return Number.isSafeInteger(revision) && revision >= 1 ? revision : null;
};

const boolean = (value) => value === true;

const dateOnly = (value) => {
  const candidate = text(value);
  return /^\d{4}-\d{2}-\d{2}/.test(candidate) ? candidate.slice(0, 10) : null;
};

/** Derives transparent BYOU relationship history from campaign assignments. */
export function buildCreatorRelationshipSummary(creatorId, campaigns, { today = new Date().toISOString().slice(0, 10) } = {}) {
  const history = asArray(campaigns).flatMap((campaign) =>
    asArray(campaign?.assignments)
      .filter((assignment) => text(assignment?.creatorId || assignment?.creator_id) === text(creatorId))
      .map((assignment) => ({
        id: text(campaign?.id),
        name: text(campaign?.name, "Campaign name missing"),
        brand: text(campaign?.brand || campaign?.brand_name, "Brand not recorded"),
        type: titleCase(
          assignment?.engagementType ||
          assignment?.engagement_type ||
          campaign?.type ||
          campaign?.campaign_type,
          "Other"
        ),
        status: titleCase(campaign?.status, "Status not recorded"),
        startDate: dateOnly(campaign?.startDate || campaign?.start_date),
        endDate: dateOnly(campaign?.endDate || campaign?.end_date),
        paymentStatus: titleCase(assignment?.paymentStatus || assignment?.payment_status, "Not recorded"),
        paidAmount: numberOrNull(assignment?.rate ?? assignment?.payment?.amount ?? assignment?.payment_amount)
      }))
  ).sort((left, right) => String(right.endDate || right.startDate || "").localeCompare(String(left.endDate || left.startDate || "")));
  const paidCampaignCount = history.filter((item) => item.type.toLowerCase() === "paid").length;
  const seedingCampaignCount = history.filter((item) => item.type.toLowerCase() === "seeding").length;
  const lastCollaborationDate = history.map((item) => item.endDate || item.startDate).filter(Boolean).sort().at(-1) || null;
  const todayDate = dateOnly(today);
  const daysSinceLastCollaboration = lastCollaborationDate && todayDate
    ? Math.max(0, Math.floor((Date.parse(`${todayDate}T00:00:00Z`) - Date.parse(`${lastCollaborationDate}T00:00:00Z`)) / 86_400_000))
    : null;
  const primaryCollaborationType = paidCampaignCount && seedingCampaignCount
    ? "Mixed paid and seeding"
    : paidCampaignCount
      ? "Mostly paid"
      : seedingCampaignCount
        ? "Mostly seeding"
        : "No history";
  return {
    campaignCount: history.length,
    paidCampaignCount,
    seedingCampaignCount,
    primaryCollaborationType,
    lastCollaborationDate,
    daysSinceLastCollaboration,
    brands: [...new Set(history.map((item) => item.brand).filter(Boolean))].sort(),
    campaignHistory: history
  };
}

const SOCIAL_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
  "tiktok.com",
  "www.tiktok.com",
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "threads.net",
  "www.threads.net",
  "facebook.com",
  "www.facebook.com",
  "fb.watch",
  "x.com",
  "www.x.com",
  "twitter.com",
  "www.twitter.com",
  "linkedin.com",
  "www.linkedin.com",
  "pinterest.com",
  "www.pinterest.com"
]);

const safeSocialUrl = (value) => {
  try {
    const url = new URL(text(value));
    return url.protocol === "https:" && !url.username && !url.password && SOCIAL_HOSTS.has(url.hostname)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
};

const titleCase = (value, fallback = "Missing") => {
  const candidate = text(value);
  if (!candidate) return fallback;
  return candidate
    .replaceAll(/[_-]+/g, " ")
    .replaceAll(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const codeFor = (value, fallback = "") => text(value, fallback)
  .toLowerCase()
  .replace(/['\u2019]/g, "")
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

const initialsFor = (value) => {
  const words = text(value, "BYOU").replace(/^@/, "").split(/[^a-z0-9]+/i).filter(Boolean);
  if (words.length > 1) return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  return words[0]?.slice(0, 2).toUpperCase() || "BI";
};

const creatorAliasText = (value) => text(
  value && typeof value === "object"
    ? value.value || value.alias || value.displayName || value.display_name
    : value
);

const looksLikeInternalCreatorCode = (value, byouCode) => {
  const candidate = text(value);
  if (!candidate) return false;
  const unprefixed = candidate.replace(/^@/, "");
  if (
    byouCode &&
    unprefixed.toLowerCase() === text(byouCode).replace(/^@/, "").toLowerCase()
  ) {
    return true;
  }
  return /^IMP2?-[0-9A-F]{12,64}$/i.test(unprefixed);
};

const normalizeCreatorIdentityLabel = (value) => text(value)
  .replace(/^@/, "")
  .toLowerCase()
  .replaceAll(/[._-]+/g, " ")
  .replaceAll(/\s+/g, " ")
  .trim();

const GENERIC_CREATOR_LABELS = new Set([
  "unknown",
  "unnamed",
  "unidentified",
  "not available",
  "n a",
  "none",
  "tbd",
  "test",
  "sample",
  "example",
  "placeholder",
  "creator profile",
  "provisional creator",
  "matched creator",
  "target creator",
  "unknown creator"
]);

const KOREAN_GENERIC_CREATOR_LABELS = new Set([
  "이름",
  "성명",
  "크리에이터 이름",
  "인플루언서 이름",
  "탤런트 이름",
  "사용자 이름",
  "아이디",
  "사용자 아이디",
  "크리에이터 아이디",
  "핸들",
  "소셜 핸들",
  "프로필",
  "프로필 링크",
  "프로필 주소",
  "인스타그램",
  "인스타",
  "틱톡",
  "유튜브",
  "페이스북",
  "트위터",
  "쓰레드",
  "제목",
  "이메일",
  "캠페인",
  "캠페인 이름",
  "브랜드",
  "제품",
  "콘텐츠",
  "납품물",
  "요구사항",
  "브리프",
  "상태",
  "메모",
  "단가",
  "비용",
  "결제",
  "인보이스",
  "배송",
  "운송장",
  "알 수 없음",
  "미정",
  "임시 크리에이터"
]);

const GENERIC_CREATOR_LABEL_PATTERNS = [
  /^(?:instagram|insta|ig|tiktok|tik tok|youtube|you tube|yt|facebook|fb|twitter|x|threads|twitch|pinterest|linkedin|social|social media)(?: account| handle| username| user name| profile| url| link)?$/,
  /^(?:(?:full|display|creator|influencer|talent|social|account|profile|user) )?(?:name|username|user name|handle|id|url|link)(?: field| value|required| optional)?$/,
  /^(?:email|email address|subject|from|to|cc|bcc|sender|recipient)(?: heading| field| value)?$/,
  /^(?:campaign|creator|influencer|talent|brand|product|content|deliverables?|requirements?|brief|status|stage|notes?|rate|fee|payment|invoice|shipping|tracking)(?: name| details| information| overview| section| roster| list| heading| field| value)?$/,
  /^(?:hi|hello|hey|dear|greetings|welcome|thanks|thank you|best|regards|sincerely)(?: all| team| everyone| there)?$/
];

const looksLikeGenericCreatorLabel = (value) => {
  const label = normalizeCreatorIdentityLabel(value);
  return !label ||
    GENERIC_CREATOR_LABELS.has(label) ||
    KOREAN_GENERIC_CREATOR_LABELS.has(label) ||
    GENERIC_CREATOR_LABEL_PATTERNS.some((pattern) => pattern.test(label));
};

const looksLikeUnsafeCreatorIdentity = (value, byouCode) => {
  const candidate = text(value);
  return !candidate ||
    looksLikeInternalCreatorCode(candidate, byouCode) ||
    looksLikeGenericCreatorLabel(candidate) ||
    /[\u0000-\u001f\u007f]/.test(candidate) ||
    /^(?:https?:\/\/|www\.)/i.test(candidate) ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate);
};

const defensibleSocialUsername = (value, byouCode) => {
  const candidate = text(value);
  const username = candidate.replace(/^@/, "");
  if (
    looksLikeUnsafeCreatorIdentity(candidate, byouCode) ||
    username.length < 2 ||
    username.length > 80 ||
    !/^[\p{L}\p{N}][\p{L}\p{N}._-]*$/u.test(username)
  ) {
    return "";
  }
  return candidate;
};

const sameCreatorIdentity = (left, right) =>
  text(left).replace(/^@/, "").toLowerCase() ===
  text(right).replace(/^@/, "").toLowerCase();

const tierFor = (followers) => {
  if (!Number.isFinite(followers)) return "Tier not recorded";
  if (followers >= 1_000_000) return "Mega";
  if (followers >= 100_000) return "Macro";
  if (followers >= 50_000) return "Mid-tier";
  if (followers >= 10_000) return "Micro";
  return "Nano";
};

const roleLabel = (roles) => {
  const first = Array.isArray(roles) ? roles[0] : roles;
  return titleCase(first, "Internal user");
};

const canonicalRoles = (roles) => [
  ...new Set(
    asArray(roles)
    .map((value) =>
      text(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
    )
    .filter(Boolean)
  )
];

export const WORKSPACE_ACTION_ROLES = Object.freeze({
  update_campaign: Object.freeze(["admin", "relationship_manager"]),
  update_deliverable: Object.freeze(["admin", "campaign_manager"]),
  update_payment: Object.freeze(["admin", "finance_admin"]),
  update_reporting: Object.freeze(["admin", "analyst"]),
  link_gmail: Object.freeze(["admin", "relationship_manager", "campaign_manager"]),
  update_communication_action: Object.freeze(["admin", "relationship_manager", "campaign_manager"]),
  update_rights: Object.freeze(["admin", "relationship_manager", "campaign_manager"]),
  add_campaign_update: Object.freeze([
    "admin",
    "relationship_manager",
    "campaign_manager",
    "analyst",
    "finance_admin"
  ]),
  verify_post: Object.freeze(["admin", "reviewer"])
});

export function canPerformWorkspaceAction(roles, action) {
  const allowed = WORKSPACE_ACTION_ROLES[action];
  if (!allowed) return false;
  return canonicalRoles(roles).some((role) => allowed.includes(role));
}

const campaignStatus = (value) => {
  const normalized = text(value).toLowerCase().replaceAll(/[\s-]+/g, "_");
  if (["active", "in_progress", "execution"].includes(normalized)) return "Active";
  if (["planning", "draft"].includes(normalized)) return "Planning";
  if (["closeout", "reporting", "closing"].includes(normalized)) return "Closeout";
  if (["completed", "complete", "closed", "published"].includes(normalized)) return "Completed";
  if (["imported_review", "review", "pending_review"].includes(normalized)) return "Imported review";
  return titleCase(value, "Not recorded");
};

const sourceType = (value, name) => {
  const normalized = `${text(value)} ${text(name)}`.toLowerCase();
  if (normalized.includes("sheet")) return "Google Sheets";
  if (normalized.includes("gmail")) return "Gmail";
  if (normalized.includes("agency") || normalized.includes("network")) return "Agency / network";
  if (normalized.includes("modash") || normalized.includes("discovery")) return "Discovery platform";
  if (normalized.includes("email") || normalized.includes("outreach")) return "Direct outreach";
  return titleCase(value, "Internal relationship");
};

const sourceConnection = (record, type) => {
  if (type === "Google Sheets") return "Read-only approved ranges";
  if (type === "Gmail") return "Approved thread metadata only";
  return titleCase(record.authorization_state || record.approved_purpose, "Manual source attribution");
};

const reportStatusFor = (campaign) => {
  if (campaign.status === "Planning") return "Not started";
  const hasMissing = campaign.assignments.length === 0 || campaign.assignments.some(
    (assignment) =>
      !assignment.post ||
      !assignment.post.verified ||
      !assignment.performance ||
      !assignment.performance.verified
  );
  if (campaign.status === "Completed" && !hasMissing) return "Published";
  return campaign.status === "Closeout" || campaign.status === "Completed" ? "Needs data" : "Not ready";
};

const makeReportId = (campaign) => {
  if (campaign.status === "Planning") return null;
  const code = text(campaign.campaignCode, text(campaign.id).slice(0, 8));
  return `RPT-${code.toUpperCase().replaceAll(/[^A-Z0-9]+/g, "-")}`;
};

const adaptCurrentUser = (raw, fallback) => {
  const record = firstRecord(raw);
  const name = text(record.display_name, fallback.name);
  const roles = canonicalRoles(record.roles);
  return {
    name,
    role: roleLabel(roles.length ? roles : fallback.role),
    roles,
    initials: text(record.initials, initialsFor(name))
  };
};

const adaptCreatorSocialProfile = (record) => {
  const profileUrl = safeSocialUrl(
    record?.canonicalProfileUrl || record?.canonical_profile_url || record?.profileUrl || record?.profile_url
  );
  const platform = codeFor(record?.platform, "other");
  const handle = text(record?.normalizedHandle || record?.normalized_handle || record?.handle)
    .replace(/^@+/, "");
  const recentRate = numberOrNull(record?.recentRate ?? record?.recent_rate);
  if (!profileUrl) return null;
  return {
    id: text(record?.id) || null,
    platform,
    handle,
    profileUrl,
    ...(recentRate === null ? {} : {
      recentRate,
      rateCurrency: text(record?.rateCurrency || record?.rate_currency, "USD"),
      rateEffectiveOn: dateOnly(record?.rateEffectiveOn || record?.rate_effective_on)
    }),
    isPrimary: (record?.isPrimary ?? record?.is_primary) === true,
    status: codeFor(record?.status, "active")
  };
};

const adaptCreator = (record) => {
  const byouCode = text(record.byou_creator_code || record.byouCode);
  const aliases = asArray(record.identity_aliases || record.identityAliases || record.aliases)
    .map(creatorAliasText)
    .filter((alias, index, collection) =>
      alias &&
      !looksLikeUnsafeCreatorIdentity(alias, byouCode) &&
      collection.findIndex((candidate) => candidate.toLowerCase() === alias.toLowerCase()) === index
    );
  const socialProfiles = asArray(
    record.social_profiles || record.socialProfiles || record.social_accounts || record.socialAccounts
  ).map(adaptCreatorSocialProfile).filter(Boolean);
  const primarySocialProfile = socialProfiles.find((profile) => profile.isPrimary) || socialProfiles[0] || null;
  const rawDisplayName = text(record.display_name || record.displayName);
  const handle =
    primarySocialProfile?.handle ||
    defensibleSocialUsername(record.handle, byouCode) ||
    defensibleSocialUsername(record.asserted_handle || record.assertedHandle, byouCode) ||
    defensibleSocialUsername(aliases.find((alias) => alias.startsWith("@")), byouCode) ||
    defensibleSocialUsername(rawDisplayName.startsWith("@") ? rawDisplayName : "", byouCode);
  const supportedDisplayName =
    !looksLikeUnsafeCreatorIdentity(rawDisplayName, byouCode) &&
    !sameCreatorIdentity(rawDisplayName, handle)
      ? rawDisplayName
      : "";
  const displayName = text(
    supportedDisplayName,
    aliases.find((alias) =>
      !alias.startsWith("@") &&
      !sameCreatorIdentity(alias, handle)
    ) || handle || "Creator profile"
  );
  const followers = numberOrNull(record.followers);
  const recordPlatforms = Array.isArray(record.platforms)
    ? record.platforms
    : [record.platform || record.platforms].filter(Boolean);
  const platforms = [...new Set([
    ...socialProfiles.map((profile) => profile.platform),
    ...recordPlatforms.map((value) => text(value)).filter(Boolean)
  ])];
  const qualificationTags = asArray(record.qualification_tags || record.qualificationTags).map((tag) => ({
    code: text(tag?.code || tag?.tag_code),
    label: text(tag?.label || tag?.tag_label, "Unlabeled qualification"),
    category: text(tag?.category || tag?.tag_category, "campaign_fit"),
    evidenceType: text(tag?.evidenceType || tag?.evidence_type, "staff_confirmed"),
    verificationStatus: text(tag?.verificationStatus || tag?.verification_status, "pending"),
    evidenceNote: text(tag?.evidenceNote || tag?.evidence_note)
  }));
  const representation = asArray(record.representation).map((item) => ({
    agencyName: text(item?.agencyName || item?.agency_name, "Independent"),
    managerDisplayName: text(item?.managerDisplayName || item?.manager_display_name),
    status: titleCase(item?.status, "Unconfirmed"),
    startsOn: dateOnly(item?.startsOn || item?.starts_on),
    endsOn: dateOnly(item?.endsOn || item?.ends_on)
  }));
  const sourcingRelationships = [
    ...asArray(record.sourcing_relationships || record.sourcingRelationships),
    ...asArray(record.sourcing_assertions || record.sourcingAssertions)
  ].map((item) => ({
    acquisitionSourceId: text(item?.acquisitionSourceId || item?.acquisition_source_id),
    acquisitionSourceName: text(
      item?.acquisitionSourceName || item?.acquisition_source_name || item?.sourceName || item?.source_name,
      "Unspecified source"
    ),
    sourceCategory: titleCase(item?.sourceCategory || item?.source_category, "Uncategorized"),
    talentAgencyId: text(item?.talentAgencyId || item?.talent_agency_id),
    talentAgencyName: text(
      item?.talentAgencyName || item?.talent_agency_name || item?.agencyName || item?.agency_name
    ),
    firstSourcedOn: dateOnly(item?.firstSourcedOn || item?.first_sourced_on),
    lastSourcedOn: dateOnly(item?.lastSourcedOn || item?.last_sourced_on),
    assignmentCount: numberOrNull(item?.assignmentCount ?? item?.assignment_count) || 0,
    relationshipStatus: titleCase(
      item?.relationshipStatus || item?.relationship_status || item?.status,
      "Unconfirmed"
    ),
    evidenceStatus: item?.evidenceStatus || item?.evidence_status
      ? titleCase(item?.evidenceStatus || item?.evidence_status)
      : "",
    confidence: numberOrNull(item?.confidence),
    sourceUrl: text(item?.sourceUrl || item?.source_url)
  }));
  const outreachSummary = asArray(record.outreach_summary || record.outreachSummary).map((item) => ({
    channel: titleCase(item?.channel, "Other"),
    outcome: titleCase(item?.outcome, "Not recorded"),
    occurredAt: text(item?.occurredAt || item?.occurred_at),
    responseTimeHours: numberOrNull(item?.responseTimeHours ?? item?.response_time_hours),
    note: text(item?.note || item?.outcome_note),
    campaignId: text(item?.campaignId || item?.campaign_id)
  }));
  const rawRelationshipStageSummary =
    record.relationship_stage_summary || record.relationshipStageSummary || {};
  const relationshipStageSummary = {
    contactedCount: numberOrNull(
      rawRelationshipStageSummary.contactedCount
        ?? rawRelationshipStageSummary.contacted_count
    ) || 0,
    acceptedCount: numberOrNull(
      rawRelationshipStageSummary.acceptedCount
        ?? rawRelationshipStageSummary.accepted_count
    ) || 0,
    activatedCount: numberOrNull(
      rawRelationshipStageSummary.activatedCount
        ?? rawRelationshipStageSummary.activated_count
    ) || 0,
    completedCount: numberOrNull(
      rawRelationshipStageSummary.completedCount
        ?? rawRelationshipStageSummary.completed_count
    ) || 0,
    incompleteCount: numberOrNull(
      rawRelationshipStageSummary.incompleteCount
        ?? rawRelationshipStageSummary.incomplete_count
    ) || 0,
    lastContacted: dateOnly(
      record.last_contacted_on
        || record.lastContactedOn
        || rawRelationshipStageSummary.lastContacted
        || rawRelationshipStageSummary.last_contacted
    ),
    lastActivated: dateOnly(
      rawRelationshipStageSummary.lastActivated
        || rawRelationshipStageSummary.last_activated
    ),
    lastCompleted: dateOnly(
      rawRelationshipStageSummary.lastCompleted
        || rawRelationshipStageSummary.last_completed
    ),
    totalEvents: numberOrNull(
      rawRelationshipStageSummary.totalEvents
        ?? rawRelationshipStageSummary.total_events
    ) || 0,
    truncated: rawRelationshipStageSummary.truncated === true,
    history: asArray(rawRelationshipStageSummary.history).map((item) => ({
      eventId: text(item?.eventId || item?.event_id),
      campaignId: text(item?.campaignId || item?.campaign_id),
      campaignName: text(item?.campaignName || item?.campaign_name),
      brandName: text(item?.brandName || item?.brand_name),
      relationshipStage: titleCase(
        item?.relationshipStage || item?.relationship_stage,
        "Unknown"
      ),
      engagementType: titleCase(
        item?.engagementType || item?.engagement_type,
        "Unknown"
      ),
      applicationTier: titleCase(
        item?.applicationTier || item?.application_tier,
        "Accepted"
      ),
      sourceSupport: titleCase(
        item?.sourceSupport || item?.source_support,
        "Direct"
      ),
      confidence: numberOrNull(item?.confidence),
      sourceUrl: text(item?.sourceUrl || item?.source_url),
      sourceDate: text(item?.sourceDate || item?.source_date),
      requiresStaffReview:
        (item?.requiresStaffReview ?? item?.requires_staff_review) === true
    }))
  };
  const restrictedRecord = record.restricted_record_status || record.restrictedRecordStatus || {};
  const rawProfileReadiness = text(
    record.profile_readiness || record.profileReadiness
  ).toLowerCase().replaceAll(/[\s-]+/g, "_");
  const readinessPool = [
    "reactivation", "needs_enrichment", "unqualified", "archived"
  ].includes(rawProfileReadiness)
    ? rawProfileReadiness
    : "unqualified";
  return {
    id: text(record.id, byouCode),
    revision: revisionOrNull(record.revision),
    canEdit: boolean(record.can_edit ?? record.canEdit),
    canContinue: boolean(record.can_continue ?? record.canContinue),
    canManageContinuation: boolean(record.can_manage_continuation ?? record.canManageContinuation),
    canEditProfile: boolean(record.can_edit_profile ?? record.canEditProfile ?? record.can_edit ?? record.canEdit),
    canLinkGmail: boolean(record.can_link_gmail ?? record.canLinkGmail),
    managedImportCampaignIds: asArray(record.managed_import_campaign_ids || record.managedImportCampaignIds)
      .filter(value => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)),
    byouCode,
    displayName,
    aliases,
    handle,
    initials: initialsFor(displayName),
    platforms: platforms.map((value) => text(value)).filter(Boolean),
    tier: tierFor(followers),
    followers,
    categories: asArray(record.categories).map((value) => text(value)).filter(Boolean),
    relationshipOwner: text(record.relationship_owner, "Unassigned"),
    lifecycleStatus: codeFor(record.lifecycle_status || record.lifecycleStatus || record.status, "active"),
    status: titleCase(record.lifecycle_status || record.lifecycleStatus || record.status, "Active"),
    preferredFormats: asArray(record.preferred_formats || record.preferredFormats)
      .map((value) => text(value))
      .filter(Boolean),
    internalNote: text(record.internal_note || record.internalNote || record.note) || null,
    note: text(record.internal_note || record.internalNote || record.note),
    profileUrl: primarySocialProfile?.profileUrl || safeSocialUrl(record.profile_url || record.profileUrl),
    socialProfiles,
    socialProfileLoadState: text(
      record.social_profile_load_state || record.socialProfileLoadState,
      socialProfiles.length ? "ready" : "not_loaded"
    ).toLowerCase(),
    operationalReadiness: {
      pool: readinessPool,
      profileReadiness: titleCase(readinessPool),
      hasCampaignHistory: boolean(record.has_campaign_history ?? record.hasCampaignHistory),
      hasCollaborationClassification: boolean(
        record.has_collaboration_classification ?? record.hasCollaborationClassification
      ),
      hasActivationAccess: boolean(record.has_activation_access ?? record.hasActivationAccess),
      hasCommercialHistory: boolean(record.has_commercial_history ?? record.hasCommercialHistory),
      operationalCompletenessScore: numberOrNull(
        record.operational_completeness_score ?? record.operationalCompletenessScore
      )
    },
    activation: {
      reactivationStatus: titleCase(record.reactivation_status || record.reactivationStatus, "Needs review"),
      costcoMembershipStatus: titleCase(record.costco_membership_status || record.costcoMembershipStatus, "Unknown"),
      bRollPreference: titleCase(record.b_roll_preference || record.bRollPreference, "Unknown"),
      responsiveness: titleCase(record.responsiveness, "Unknown"),
      operationalNote: text(record.operational_note || record.operationalNote),
      communities: asArray(record.communities).map((value) => text(value)).filter(Boolean),
      qualificationTags,
      closestWarehouse: {
        code: text(record.closest_warehouse_code || record.closestWarehouseCode),
        name: text(
          record.closest_costco_name || record.closestCostcoName ||
          record.closest_warehouse_name || record.closestWarehouseName
        ),
        city: text(
          record.closest_costco_city || record.closestCostcoCity ||
          record.closest_warehouse_city || record.closestWarehouseCity
        ),
        state: text(
          record.closest_costco_state || record.closestCostcoState ||
          record.closest_warehouse_state || record.closestWarehouseState
        ),
        distanceMiles: numberOrNull(
          record.closest_costco_distance_miles ?? record.closestCostcoDistanceMiles ??
          record.closest_warehouse_distance_miles ?? record.closestWarehouseDistanceMiles
        ),
        estimatedMinutes: numberOrNull(
          record.closest_costco_estimated_minutes ?? record.closestCostcoEstimatedMinutes ??
          record.closest_warehouse_estimated_minutes ?? record.closestWarehouseEstimatedMinutes
        ),
        basis: titleCase(record.proximity_basis || record.proximityBasis, "Not recorded")
      },
      averageCollaborationRating: numberOrNull(record.average_collaboration_rating ?? record.averageCollaborationRating),
      averageContentQualityScore: numberOrNull(record.average_content_quality_score ?? record.averageContentQualityScore),
      rehireRecommendation: titleCase(record.rehire_recommendation || record.rehireRecommendation, "Not rated"),
      lastEvaluationNote: text(record.last_evaluation_note || record.lastEvaluationNote),
      currentQuotedRate: numberOrNull(
        record.recent_rate ?? record.recentRate ?? record.current_quoted_rate ?? record.currentQuotedRate
      ),
      previousQuotedRate: numberOrNull(record.previous_quoted_rate ?? record.previousQuotedRate),
      rateCurrency: text(record.rate_currency || record.rateCurrency, "USD"),
      currentRateEffectiveOn: dateOnly(record.current_rate_effective_on || record.currentRateEffectiveOn),
      rateHistory: asArray(record.rate_history || record.rateHistory),
      campaignQuality: asArray(record.campaign_quality || record.campaignQuality),
      representation,
      sourcingRelationships,
      outreachSummary,
      restrictedRecordStatus: {
        contact: restrictedRecord.contact === true,
        address: restrictedRecord.address === true,
        taxDocument: (restrictedRecord.taxDocument ?? restrictedRecord.tax_document) === true,
        invoiceFolder: (restrictedRecord.invoiceFolder ?? restrictedRecord.invoice_folder) === true,
        bankingDocument: (restrictedRecord.bankingDocument ?? restrictedRecord.banking_document) === true,
        identityDocument: (restrictedRecord.identityDocument ?? restrictedRecord.identity_document) === true
      }
    },
    relationshipSummary: {
      lastCollaborationDate: dateOnly(record.last_collaboration_date || record.lastCollaborationDate),
      campaignCount: numberOrNull(record.campaign_count ?? record.campaignCount) || 0,
      paidCampaignCount: numberOrNull(
        record.assignment_paid_campaign_count ??
        record.assignmentPaidCampaignCount ??
        record.paid_campaign_count ??
        record.paidCampaignCount
      ) || 0,
      seedingCampaignCount: numberOrNull(
        record.assignment_seeding_campaign_count ??
        record.assignmentSeedingCampaignCount ??
        record.seeding_campaign_count ??
        record.seedingCampaignCount
      ) || 0,
      primaryCollaborationType: titleCase(
        record.assignment_primary_collaboration_type ??
        record.assignmentPrimaryCollaborationType ??
        record.primary_collaboration_type ??
        record.primaryCollaborationType,
        "No history"
      ),
      campaignHistory: asArray(
        record.assignment_campaign_history ??
        record.assignmentCampaignHistory ??
        record.campaign_history ??
        record.campaignHistory
      ),
      stageSummary: relationshipStageSummary,
      hasAssignmentProjection:
        record.assignment_paid_campaign_count !== undefined ||
        record.assignmentPaidCampaignCount !== undefined ||
        record.assignment_seeding_campaign_count !== undefined ||
        record.assignmentSeedingCampaignCount !== undefined ||
        record.assignment_primary_collaboration_type !== undefined ||
        record.assignmentPrimaryCollaborationType !== undefined ||
        record.assignment_campaign_history !== undefined ||
        record.assignmentCampaignHistory !== undefined
    },
    communicationLoadState: text(
      record.communication_load_state || record.communicationLoadState,
      "not_loaded"
    ).toLowerCase(),
    communications: asArray(
      record.communications || record.gmail_threads || record.gmailThreads
    ).map(adaptCommunicationMetadata)
  };
};

const valueFor = (record, ...keys) => {
  if (!record || typeof record !== "object") return undefined;
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
};

const idFor = (record, ...keys) => text(valueFor(record, ...keys)) || null;

const uniqueRecords = (...collections) => {
  const seenIds = new Set();
  const seenObjects = new Set();
  return collections.flatMap(asArray).filter((record) => {
    if (!record || typeof record !== "object") return false;
    const id = idFor(record, "id");
    if (id) {
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    }
    if (seenObjects.has(record)) return false;
    seenObjects.add(record);
    return true;
  });
};

const safeGoogleUrl = (value, kind) => {
  try {
    const url = new URL(text(value));
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    if (kind === "gmail") {
      return url.hostname === "mail.google.com" && /^\/mail\/u\/[^/]+\/$/.test(url.pathname) && url.hash.length > 8
        ? url.toString()
        : null;
    }
    const drivePath = url.hostname === "drive.google.com" && (
      /^\/file\/d\/[A-Za-z0-9_-]+(?:\/|$)/.test(url.pathname) ||
      /^\/drive\/folders\/[A-Za-z0-9_-]+(?:\/|$)/.test(url.pathname)
    );
    const docsPath = url.hostname === "docs.google.com" &&
      /^\/(?:document|spreadsheets|presentation|forms)\/d\/[A-Za-z0-9_-]+(?:\/|$)/.test(url.pathname);
    if (!drivePath && !docsPath) return null;
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(?:utm_.+|fbclid|gclid)$/i.test(key)) url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return null;
  }
};

const safeWorkflowText = (value, fallback = "") => {
  const candidate = text(value, fallback);
  if (!candidate) return fallback;
  return candidate
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[contact redacted]")
    .replace(
      /\b\d{1,6}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,5}\s+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|way)\b[^,\n]*/gi,
      "[location redacted]"
    );
};

const adaptContentVersion = (record) => {
  const versionNumber = numberOrNull(valueFor(record, "version_number", "versionNumber", "version_no", "versionNo"));
  const driveFileReferenceId = idFor(
    record,
    "drive_file_reference_id",
    "driveFileReferenceId",
    "drive_asset_id",
    "driveAssetId"
  );
  const versionLabel = text(
    valueFor(record, "version_label", "versionLabel", "label"),
    versionNumber ? `Version ${versionNumber}` : "Content version"
  );
  const reviewStatus = titleCase(valueFor(record, "review_status", "reviewStatus", "status"), "Not reviewed");
  const submittedAt = dateOnly(valueFor(record, "submitted_at", "submittedAt", "created_at", "createdAt", "uploaded_at", "uploadedAt"));
  return {
    id: idFor(record, "id", "content_version_id", "contentVersionId"),
    assignmentId: idFor(record, "assignment_id", "assignmentId"),
    campaignId: idFor(record, "campaign_id", "campaignId"),
    deliverableId: text(record.deliverable_id) || idFor(record, "deliverableId"),
    driveAssetId: driveFileReferenceId,
    driveFileReferenceId,
    label: versionLabel,
    versionLabel,
    versionNumber,
    versionNo: versionNumber,
    providerRevisionId: text(valueFor(record, "provider_revision_id", "providerRevisionId")) || null,
    source: safeGoogleUrl(valueFor(record, "drive_url", "driveUrl", "url", "href"), "drive")
      ? "Google Drive"
      : titleCase(valueFor(record, "source"), "Controlled content record"),
    href: safeGoogleUrl(valueFor(record, "drive_url", "driveUrl", "url", "href"), "drive"),
    createdAt: submittedAt,
    submittedAt,
    updatedAt: dateOnly(valueFor(record, "updated_at", "updatedAt")),
    status: reviewStatus,
    reviewStatus,
    sourceRecordId: text(valueFor(record, "source_record_id", "sourceRecordId")) || null,
    comments: []
  };
};

const adaptDriveAsset = (record) => {
  const canonicalUrl = safeGoogleUrl(
    valueFor(record, "canonical_url", "canonicalUrl", "drive_url", "driveUrl", "url", "href"),
    "drive"
  );
  const approvedPurpose = titleCase(valueFor(record, "approved_purpose", "approvedPurpose", "asset_type", "assetType"), "Drive content asset");
  const verificationStatus = titleCase(valueFor(record, "verification_status", "verificationStatus"), "Not verified");
  const permissionStatus = titleCase(valueFor(record, "permission_status", "permissionStatus"), "Not inspected");
  return {
    id: idFor(record, "id", "drive_asset_id", "driveAssetId"),
    assignmentId: idFor(record, "assignment_id", "assignmentId"),
    campaignId: idFor(record, "campaign_id", "campaignId"),
    deliverableId: idFor(record, "deliverable_id", "deliverableId"),
    providerFileId: text(valueFor(record, "provider_file_id", "providerFileId")) || null,
    canonicalUrl,
    displayName: safeWorkflowText(valueFor(record, "display_name", "displayName")) || null,
    mimeType: text(valueFor(record, "mime_type", "mimeType")) || null,
    providerRevisionId: text(valueFor(record, "provider_revision_id", "providerRevisionId")) || null,
    permissionStatus,
    verificationStatus,
    approvedPurpose,
    assetType: approvedPurpose,
    href: canonicalUrl,
    status: verificationStatus !== "Not Verified" ? verificationStatus : permissionStatus,
    lastInspectedAt: dateOnly(valueFor(record, "last_inspected_at", "lastInspectedAt")),
    sourceRecordId: text(valueFor(record, "source_record_id", "sourceRecordId")) || null,
    updatedAt: dateOnly(valueFor(record, "updated_at", "updatedAt", "modified_at", "modifiedAt", "last_inspected_at", "lastInspectedAt"))
  };
};

const adaptContentReview = (record) => {
  const decision = titleCase(valueFor(record, "decision", "status", "review_status", "reviewStatus"), "Pending");
  const decidedAt = dateOnly(valueFor(record, "decided_at", "decidedAt", "reviewed_at", "reviewedAt", "updated_at", "updatedAt"));
  return {
    id: idFor(record, "id", "content_review_id", "contentReviewId"),
    assignmentId: idFor(record, "assignment_id", "assignmentId"),
    campaignId: idFor(record, "campaign_id", "campaignId"),
    contentVersionId: idFor(record, "content_version_id", "contentVersionId"),
    decision,
    decisionNote: safeWorkflowText(valueFor(record, "decision_note", "decisionNote")) || null,
    decidedAt,
    sourceRecordId: text(valueFor(record, "source_record_id", "sourceRecordId")) || null,
    status: decision,
    reviewer: text(valueFor(record, "reviewer_name", "reviewerName", "owner_name", "ownerName"), "Designated reviewer"),
    reviewedAt: decidedAt
  };
};

const adaptComplianceReview = (record) => ({
  id: idFor(record, "id", "compliance_review_id", "complianceReviewId"),
  campaignId: idFor(record, "campaign_id", "campaignId"),
  assignmentId: idFor(record, "assignment_id", "assignmentId"),
  deliverableId: idFor(record, "deliverable_id", "deliverableId"),
  attributionId: idFor(record, "attribution_id", "attributionId"),
  materialConnection: titleCase(valueFor(record, "material_connection", "materialConnection"), "Not recorded"),
  disclosureStatus: titleCase(valueFor(record, "disclosure_status", "disclosureStatus"), "Pending"),
  disclosureMethod: titleCase(valueFor(record, "disclosure_method", "disclosureMethod"), "Not recorded"),
  evidenceNote: safeWorkflowText(valueFor(record, "evidence_note", "evidenceNote")) || null,
  reviewedAt: dateOnly(valueFor(record, "reviewed_at", "reviewedAt", "updated_at", "updatedAt")),
  reviewer: text(valueFor(record, "reviewer_name", "reviewerName"), "Designated reviewer")
});

const adaptReviewLinkStatus = (record) => ({
  id: idFor(record, "id", "review_link_id", "reviewLinkId"),
  campaignId: idFor(record, "campaign_id", "campaignId"),
  deliverableId: idFor(record, "deliverable_id", "deliverableId"),
  contentVersionId: idFor(record, "content_version_id", "contentVersionId"),
  status: titleCase(valueFor(record, "status"), "Unknown"),
  expiresAt: dateOnly(valueFor(record, "expires_at", "expiresAt")),
  decidedAt: dateOnly(valueFor(record, "decided_at", "decidedAt")),
  decision: titleCase(valueFor(record, "decision"), "Not decided")
});

const adaptDeliverable = (record, relatedVersions = []) => {
  const id = idFor(record, "id", "deliverable_id", "deliverableId");
  const dueDate = dateOnly(valueFor(record, "due_date", "dueDate", "deliverable_due_date", "nextDueDate"));
  const versions = uniqueRecords(
    valueFor(record, "versions", "content_versions", "contentVersions", "drive_versions", "driveVersions"),
    relatedVersions.filter((version) => !id || idFor(version, "deliverable_id", "deliverableId") === id)
  ).map(adaptContentVersion);
  const approvedVersion = idFor(record, "approved_version_id", "approvedVersionId", "approvedVersion") ||
    versions.find((version) => /approved|published/i.test(version.status))?.id ||
    null;
  return {
    id,
    type: codeFor(valueFor(record, "deliverable_type", "deliverableType"), "social_post"),
    name: titleCase(valueFor(record, "name", "deliverable_type", "deliverableType"), "Campaign deliverable"),
    platformCode: codeFor(valueFor(record, "platform", "post_platform", "postPlatform")),
    platform: titleCase(valueFor(record, "platform", "post_platform"), "Platform pending"),
    statusCode: codeFor(valueFor(record, "deliverable_status", "deliverableStatus", "status"), "not_started"),
    status: titleCase(valueFor(record, "deliverable_status", "deliverableStatus", "status"), "Not started"),
    revisionCount: numberOrNull(valueFor(record, "revision_count", "revisionCount")) ?? 0,
    dueDate,
    nextDueDate: dueDate,
    owner: text(valueFor(record, "owner_name", "ownerName", "deliverable_owner_name"), "Unassigned"),
    sourceRecordId: text(valueFor(record, "source_record_id", "sourceRecordId", "deliverable_source_record_id"), "Source record missing"),
    shippingStatus: titleCase(valueFor(record, "shipping_status", "shippingStatus"), "Not recorded"),
    receiptStatus: titleCase(valueFor(record, "receipt_status", "receiptStatus"), "Not recorded"),
    storyStatus: titleCase(valueFor(record, "story_status", "storyStatus"), "Not recorded"),
    videoQualityStatus: titleCase(valueFor(record, "video_quality_status", "videoQualityStatus"), "Not recorded"),
    approvedVersion,
    versions
  };
};

const adaptPost = (record) => {
  const url = safeSocialUrl(valueFor(record, "canonical_url", "canonicalUrl", "post_url", "postUrl", "url"));
  if (!url) return null;
  const verificationState = text(valueFor(record, "verification_status", "verificationStatus", "post_verification_status")).toLowerCase();
  return {
    id: idFor(record, "id", "post_id", "postId"),
    assignmentId: idFor(record, "assignment_id", "assignmentId"),
    deliverableId: idFor(record, "deliverable_id", "deliverableId"),
    attributionId: idFor(record, "post_attribution_id", "postAttributionId", "attribution_id", "attributionId"),
    url,
    platform: titleCase(valueFor(record, "platform", "post_platform", "postPlatform"), "Platform not recorded"),
    platformPostId: text(valueFor(record, "platform_post_id", "platformPostId")) || null,
    postedDate: dateOnly(valueFor(record, "published_at", "publishedAt", "posted_date", "postedDate")),
    source: titleCase(valueFor(record, "evidence_origin", "evidenceOrigin", "post_evidence_origin", "source"), "Imported source record"),
    verificationMethod: text(valueFor(record, "verification_method", "verificationMethod"))
      ? titleCase(valueFor(record, "verification_method", "verificationMethod"))
      : null,
    sourceRecordId: text(valueFor(record, "source_record_id", "sourceRecordId", "post_source_record_id"), "Source record missing"),
    verified: verificationState === "verified" || valueFor(record, "verified") === true,
    verifiedBy: text(valueFor(record, "verified_by", "verifiedBy", "post_verified_by")) || null,
    addedBy: text(valueFor(record, "added_by", "addedBy", "owner_name"), "Unassigned")
  };
};

const adaptMetricSnapshot = (record) => ({
  id: idFor(record, "id", "metric_snapshot_id", "metricSnapshotId"),
  postId: idFor(record, "post_id", "postId"),
  metricCode: text(valueFor(record, "metric_code", "metricCode")).toLowerCase(),
  value: numberOrNull(valueFor(record, "value_numeric", "valueNumeric", "value")),
  collectedAt: dateOnly(valueFor(record, "collected_at", "collectedAt")),
  verificationState: text(valueFor(record, "verification_state", "verificationState"), "pending").toLowerCase(),
  sourceRecordId: text(valueFor(record, "source_record_id", "sourceRecordId")) || null,
  owner: text(valueFor(record, "owner_name", "ownerName"), "Unassigned")
});

const adaptCommunicationMetadata = (record) => {
  const nextAction = safeWorkflowText(valueFor(record, "next_action", "nextAction"), "Review approved thread metadata");
  const status = titleCase(valueFor(record, "verification_status", "verificationStatus", "status"), "Recorded");
  return {
    id: idFor(record, "id", "gmail_thread_id", "gmailThreadId", "communication_link_id", "communicationLinkId"),
    gmailThreadId: idFor(record, "gmail_thread_id", "gmailThreadId", "id"),
    campaignId: idFor(record, "campaign_id", "campaignId"),
    assignmentId: idFor(record, "assignment_id", "assignmentId"),
    creatorId: idFor(record, "creator_id", "creatorId"),
    campaignName: text(valueFor(record, "campaign_name", "campaignName")) || null,
    clientName: text(valueFor(record, "client_name", "clientName")) || null,
    brandName: text(valueFor(record, "brand_name", "brandName")) || null,
    providerThreadId: text(valueFor(record, "provider_thread_id", "providerThreadId")) || null,
    providerHistoryId: text(valueFor(record, "provider_history_id", "providerHistoryId")) || null,
    type: "Gmail",
    milestone: titleCase(valueFor(record, "milestone_type", "milestoneType"), "Campaign communication"),
    milestoneType: titleCase(valueFor(record, "milestone_type", "milestoneType"), "Campaign communication"),
    milestoneDate: dateOnly(valueFor(record, "milestone_date", "milestoneDate")),
    date: dateOnly(valueFor(record, "latest_message_at", "latestMessageAt", "milestone_date", "milestoneDate", "date")),
    latestMessageAt: dateOnly(valueFor(record, "latest_message_at", "latestMessageAt")),
    latestInboundAt: dateOnly(valueFor(record, "latest_inbound_at", "latestInboundAt")),
    latestOutboundAt: dateOnly(valueFor(record, "latest_outbound_at", "latestOutboundAt")),
    messageCount: numberOrNull(valueFor(record, "message_count", "messageCount")),
    approvedSubject: text(valueFor(record, "approved_subject", "approvedSubject")) || null,
    metadataRefreshedAt: dateOnly(valueFor(record, "metadata_refreshed_at", "metadataRefreshedAt")),
    owner: text(valueFor(record, "owner_name", "ownerName", "owner"), "Unassigned"),
    status,
    verificationStatus: status,
    replyNeeded: valueFor(record, "reply_needed", "replyNeeded") === true || /reply needed/i.test(text(valueFor(record, "attention_type", "attentionType"))),
    nextAction,
    href: safeGoogleUrl(valueFor(record, "gmail_permalink", "gmailPermalink", "href"), "gmail")
  };
};

const adaptShipmentMetadata = (record) => {
  const status = titleCase(valueFor(record, "status", "shipment_status", "shipmentStatus"), "Not started");
  const exceptionCode = text(valueFor(record, "exception_code", "exceptionCode", "exception_type", "exceptionType"));
  const carrierCode = text(valueFor(record, "carrier_code", "carrierCode", "carrier")) || null;
  return {
    id: idFor(record, "id", "shipment_id", "shipmentId"),
    campaignId: idFor(record, "campaign_id", "campaignId"),
    assignmentId: idFor(record, "assignment_id", "assignmentId"),
    deliverableId: idFor(record, "deliverable_id", "deliverableId"),
    product: text(valueFor(record, "product", "product_name", "productName"), "Campaign product"),
    quantity: numberOrNull(valueFor(record, "quantity")),
    owner: text(valueFor(record, "owner_name", "ownerName", "owner"), "Unassigned"),
    carrier: carrierCode || "Not recorded",
    carrierCode,
    status,
    shipBy: dateOnly(valueFor(record, "ship_by", "shipBy", "due_date", "dueDate")),
    shippedAt: dateOnly(valueFor(record, "shipped_at", "shippedAt")),
    expectedDeliveryDate: dateOnly(valueFor(record, "expected_delivery_date", "expectedDeliveryDate")),
    deliveredAt: dateOnly(valueFor(record, "delivered_at", "deliveredAt")),
    hasException: Boolean(exceptionCode) || /delay|exception|failed|returned|lost/i.test(status),
    exception: exceptionCode ? titleCase(exceptionCode) : null,
    exceptionCode: exceptionCode || null,
    nextAction: safeWorkflowText(valueFor(record, "next_action", "nextAction")) || null,
    sourceRecordId: text(valueFor(record, "source_record_id", "sourceRecordId")) || null,
    updatedAt: dateOnly(valueFor(record, "updated_at", "updatedAt"))
  };
};

const adaptRightsTerm = (record) => {
  const rightsType = titleCase(valueFor(record, "rights_type", "rightsType", "usage_type", "usageType"), "Not recorded");
  const platform = titleCase(valueFor(record, "platform"), "Not recorded");
  const territory = text(valueFor(record, "territory"), "Not recorded");
  const expiresOn = dateOnly(valueFor(record, "expires_on", "expiresOn", "rights_expires_at", "rightsExpiresAt", "expires_at", "expiresAt"));
  return {
    id: idFor(record, "id", "rights_term_id", "rightsTermId"),
    campaignId: idFor(record, "campaign_id", "campaignId"),
    assignmentId: idFor(record, "assignment_id", "assignmentId"),
    deliverableId: idFor(record, "deliverable_id", "deliverableId"),
    status: titleCase(valueFor(record, "status"), "Not recorded"),
    contractStatus: titleCase(valueFor(record, "contract_status", "contractStatus"), "Not recorded"),
    contractSource: safeGoogleUrl(valueFor(record, "contract_url", "contractUrl", "drive_url", "driveUrl"), "drive")
      ? "Approved Google Drive record"
      : null,
    rightsType,
    usageType: rightsType,
    platform,
    territory,
    startsOn: dateOnly(valueFor(record, "starts_on", "startsOn")),
    expiresOn,
    expiresAt: expiresOn,
    adCodeExpiresAt: dateOnly(valueFor(record, "ad_code_expires_on", "adCodeExpiresOn", "ad_code_expires_at", "adCodeExpiresAt")),
    adCodeStatus: titleCase(valueFor(record, "ad_code_status", "adCodeStatus"), "Not recorded"),
    whitelisting: valueFor(record, "whitelisting") === true,
    platforms: asArray(valueFor(record, "platforms", "platform")).map((value) => titleCase(value)).filter(Boolean),
    territories: asArray(valueFor(record, "territories", "territory")).map((value) => text(value)).filter(Boolean),
    reminder: text(valueFor(record, "reminder", "reminder_rule", "reminderRule"), "No reminder recorded"),
    sourceRecordId: text(valueFor(record, "source_record_id", "sourceRecordId")) || null,
    updatedAt: dateOnly(valueFor(record, "updated_at", "updatedAt"))
  };
};

const adaptAttentionItem = (record) => ({
  id: idFor(record, "id", "attention_item_id", "attentionItemId"),
  campaignId: idFor(record, "campaign_id", "campaignId"),
  assignmentId: idFor(record, "assignment_id", "assignmentId"),
  deliverableId: idFor(record, "deliverable_id", "deliverableId"),
  type: titleCase(valueFor(record, "attention_type", "attentionType", "type"), "Workflow attention"),
  status: titleCase(valueFor(record, "status"), "Open"),
  severity: titleCase(valueFor(record, "severity", "priority"), "Normal"),
  title: safeWorkflowText(valueFor(record, "title"), "Workflow attention"),
  nextAction: safeWorkflowText(valueFor(record, "next_action", "nextAction"), "Review this workflow item"),
  dueAt: dateOnly(valueFor(record, "due_at", "dueAt", "due_date", "dueDate")),
  dueDate: dateOnly(valueFor(record, "due_at", "dueAt", "due_date", "dueDate")),
  ownerId: idFor(record, "owner_id", "ownerId"),
  owner: text(valueFor(record, "owner_name", "ownerName", "owner"), "Unassigned"),
  sourceEntityType: text(valueFor(record, "source_entity_type", "sourceEntityType")) || null,
  sourceEntityId: idFor(record, "source_entity_id", "sourceEntityId"),
  sourceRecordId: text(valueFor(record, "source_record_id", "sourceRecordId")) || null,
  createdAt: dateOnly(valueFor(record, "created_at", "createdAt")),
  updatedAt: dateOnly(valueFor(record, "updated_at", "updatedAt"))
});

const adaptConnectorJob = (record) => {
  const provider = text(valueFor(record, "provider", "connector", "connector_type", "connectorType")) || null;
  const entityType = text(valueFor(record, "entity_type", "entityType")) || null;
  const entityId = idFor(record, "entity_id", "entityId");
  const status = titleCase(valueFor(record, "status"), "Queued");
  const lastErrorCode = text(valueFor(record, "last_error_code", "lastErrorCode", "error_code", "errorCode")) || null;
  const completedAt = dateOnly(valueFor(record, "completed_at", "completedAt"));
  return {
    id: idFor(record, "id", "connector_job_id", "connectorJobId"),
    campaignId: idFor(record, "campaign_id", "campaignId"),
    assignmentId: idFor(record, "assignment_id", "assignmentId"),
    deliverableId: idFor(record, "deliverable_id", "deliverableId"),
    operationReceiptId: idFor(record, "operation_receipt_id", "operationReceiptId"),
    provider,
    entityType,
    entityId,
    postId: idFor(record, "post_id", "postId", "content_post_id", "contentPostId") ||
      (/content[_ ]?post|post|video/i.test(entityType || "") ? entityId : null),
    connector: titleCase(provider, "Connector"),
    jobType: titleCase(valueFor(record, "job_type", "jobType"), "Refresh"),
    status,
    attemptCount: numberOrNull(valueFor(record, "attempt_count", "attemptCount")) ?? 0,
    notBefore: dateOnly(valueFor(record, "not_before", "notBefore")),
    leaseExpiresAt: dateOnly(valueFor(record, "lease_expires_at", "leaseExpiresAt")),
    lastAttemptAt: dateOnly(valueFor(record, "last_attempt_at", "lastAttemptAt", "started_at", "startedAt")),
    lastSuccessAt: /succeeded|completed|success/i.test(status)
      ? dateOnly(valueFor(record, "last_success_at", "lastSuccessAt", "completed_at", "completedAt"))
      : null,
    nextRunAt: dateOnly(valueFor(record, "next_run_at", "nextRunAt", "not_before", "notBefore")),
    lastErrorCode,
    errorCode: lastErrorCode,
    safeErrorMessage: safeWorkflowText(valueFor(record, "safe_error_message", "safeErrorMessage")) || null,
    createdAt: dateOnly(valueFor(record, "created_at", "createdAt")),
    startedAt: dateOnly(valueFor(record, "started_at", "startedAt")),
    completedAt,
    updatedAt: dateOnly(valueFor(record, "updated_at", "updatedAt"))
  };
};

const adaptCostcoActivation = (record) => {
  const itemNumber = text(valueFor(record, "item_number", "itemNumber", "item_reference", "itemReference"), "Not recorded");
  const productName = text(valueFor(record, "product_name", "productName", "product"), "Not recorded");
  const launchDate = dateOnly(valueFor(record, "launch_date", "launchDate", "activation_start", "activationStart", "start_date", "startDate"));
  const endDate = dateOnly(valueFor(record, "end_date", "endDate", "activation_end", "activationEnd"));
  const availabilityStatus = titleCase(valueFor(record, "availability_status", "availabilityStatus", "status"), "Not recorded");
  return {
    id: idFor(record, "id", "costco_activation_id", "costcoActivationId"),
    campaignId: idFor(record, "campaign_id", "campaignId"),
    productId: idFor(record, "product_id", "productId"),
    productCode: text(valueFor(record, "product_code", "productCode")) || null,
    productName,
    product: productName,
    retailer: text(valueFor(record, "retailer"), "Costco"),
    itemNumber,
    itemReference: itemNumber,
    channel: text(valueFor(record, "channel"), "Not recorded"),
    launchDate,
    activationStart: launchDate,
    endDate,
    activationEnd: endDate,
    retailPrice: numberOrNull(valueFor(record, "retail_price", "retailPrice")),
    currency: text(valueFor(record, "currency"), "USD"),
    warehouseCount: numberOrNull(valueFor(record, "warehouse_count", "warehouseCount")),
    warehouseScope: text(valueFor(record, "warehouse_scope", "warehouseScope"), "Not recorded"),
    availabilityStatus,
    status: availabilityStatus,
    sourceRecordId: text(valueFor(record, "source_record_id", "sourceRecordId")) || null,
    updatedAt: dateOnly(valueFor(record, "updated_at", "updatedAt"))
  };
};

const adaptSocialCrawlStatus = (record) => ({
  postId: idFor(record, "post_id", "postId"),
  attributionId: idFor(record, "attribution_id", "attributionId"),
  assignmentId: idFor(record, "assignment_id", "assignmentId"),
  deliverableId: idFor(record, "deliverable_id", "deliverableId"),
  canonicalUrl: safeSocialUrl(valueFor(record, "canonical_url", "canonicalUrl")),
  platform: titleCase(valueFor(record, "platform"), "Platform not recorded"),
  trackingState: titleCase(valueFor(record, "tracking_state", "trackingState"), "Not tracked"),
  lastAttemptAt: dateOnly(valueFor(record, "last_attempt_at", "lastAttemptAt")),
  lastSuccessAt: dateOnly(valueFor(record, "last_success_at", "lastSuccessAt")),
  lastObservedAt: dateOnly(valueFor(record, "last_observed_at", "lastObservedAt")),
  nextRefreshAt: dateOnly(valueFor(record, "next_refresh_at", "nextRefreshAt")),
  consecutiveFailures: numberOrNull(valueFor(record, "consecutive_failures", "consecutiveFailures")) ?? 0,
  lastErrorCode: text(valueFor(record, "last_error_code", "lastErrorCode")) || null,
  refreshActive: valueFor(record, "refresh_active", "refreshActive") === true,
  exactAccountMatched: valueFor(record, "exact_account_matched", "exactAccountMatched") === true
});

const adaptAssistedImportFact = (record) => {
  const factId = text(valueFor(record, "factId", "fact_id"));
  const evidenceExcerpt = text(valueFor(record, "evidenceExcerpt", "evidence_excerpt"));
  const confidence = numberOrNull(record?.confidence);
  let sourceUrl = null;
  try {
    const rawSourceUrl = text(valueFor(record, "sourceUrl", "source_url"));
    const parsed = new URL(rawSourceUrl);
    sourceUrl = safeGoogleUrl(rawSourceUrl, parsed.hostname === "mail.google.com" ? "gmail" : "drive");
  } catch {
    sourceUrl = null;
  }
  if (
    !factId
    || !sourceUrl
    || !evidenceExcerpt
    || evidenceExcerpt.length > 400
    || confidence == null
    || confidence < 0
    || confidence > 1
  ) return null;
  return {
    factId,
    factType: text(valueFor(record, "factType", "fact_type")) || null,
    field: text(valueFor(record, "field", "field_name")) || null,
    value: valueFor(record, "value", "proposed_value") ?? null,
    sourceSupport: text(valueFor(record, "sourceSupport", "source_support")) || null,
    confidence,
    evidenceExcerpt,
    sourceUrl,
    sourceDate: text(valueFor(record, "sourceDate", "source_date")) || null,
    sourceTitle: text(valueFor(record, "sourceTitle", "source_title")) || null,
    extractionMethod: text(valueFor(record, "extractionMethod", "extraction_method")) || null
  };
};

const latestMetricValues = (snapshots) => {
  const latest = new Map();
  for (const snapshot of snapshots) {
    if (!snapshot.metricCode) continue;
    const current = latest.get(snapshot.metricCode);
    if (!current || String(snapshot.collectedAt).localeCompare(String(current.collectedAt)) > 0) {
      latest.set(snapshot.metricCode, snapshot);
    }
  }
  return latest;
};

const adaptPerformance = (record, post, metricSnapshots, connectorJobs) => {
  const postSnapshots = post?.id
    ? metricSnapshots.filter((snapshot) => !snapshot.postId || snapshot.postId === post.id)
    : metricSnapshots;
  const latest = latestMetricValues(postSnapshots);
  const metricRecordId = text(valueFor(record, "metric_source_record_id", "metricSourceRecordId")) ||
    ([...new Set([...latest.values()].map((snapshot) => snapshot.sourceRecordId).filter(Boolean))].length === 1
      ? [...latest.values()][0]?.sourceRecordId
      : null);
  const latestCollectedAt = postSnapshots.map((snapshot) => snapshot.collectedAt).filter(Boolean).sort().at(-1) || null;
  const hasFlatMetrics = Boolean(metricRecordId) || ["views", "likes", "comments", "saves", "shares", "engagement_rate"]
    .some((key) => numberOrNull(valueFor(record, key)) !== null);
  const socialCrawlJob = connectorJobs.find((job) =>
    /social\s*crawl/i.test(job.connector) && (!post?.id || !job.postId || job.postId === post.id)
  );
  if (!hasFlatMetrics && postSnapshots.length === 0 && !socialCrawlJob) return null;
  const metricValue = (flatKey, snapshotCode = flatKey) =>
    numberOrNull(valueFor(record, flatKey)) ?? latest.get(snapshotCode)?.value ?? null;
  const verificationState = text(valueFor(record, "metrics_verification_state", "metricsVerificationState")).toLowerCase();
  const latestRecords = [...latest.values()];
  const verified = verificationState
    ? verificationState === "verified"
    : latestRecords.length > 0 && latestRecords.every((snapshot) => snapshot.verificationState === "verified");
  return {
    views: metricValue("views"),
    likes: metricValue("likes"),
    comments: metricValue("comments"),
    saves: metricValue("saves"),
    shares: metricValue("shares"),
    engagementRate: metricValue("engagement_rate"),
    sales: null,
    source: metricRecordId ? "Imported metric source record" : "Exact-post metric snapshots",
    sourceRecordId: metricRecordId,
    collectedAt: dateOnly(valueFor(record, "metrics_collected_at", "metricsCollectedAt")) || latestCollectedAt,
    owner: text(valueFor(record, "metric_owner_name", "metricOwnerName"), "Unassigned"),
    verified,
    snapshots: postSnapshots,
    socialCrawl: socialCrawlJob
      ? {
          cadence: "Scheduled connector job",
          status: socialCrawlJob.status,
          lastSuccessfulRefresh: socialCrawlJob.lastSuccessAt,
          nextRefresh: socialCrawlJob.nextRunAt,
          error: socialCrawlJob.errorCode ? titleCase(socialCrawlJob.errorCode) : null
        }
      : null
  };
};

const adaptAssignment = (record, related = {}) => {
  const rawDeliverables = related.deliverables?.length
    ? related.deliverables
    : valueFor(record, "deliverables", "deliverableRecords") ||
      (valueFor(record, "deliverable_id", "deliverable_status") !== undefined ? [record] : []);
  const contentVersions = uniqueRecords(
    valueFor(record, "contentVersions", "content_versions"),
    related.contentVersions
  ).map(adaptContentVersion);
  const deliverables = uniqueRecords(rawDeliverables).map((deliverable) => adaptDeliverable(deliverable, related.contentVersions || []));
  const rawPosts = related.posts?.length
    ? related.posts
    : valueFor(record, "posts", "contentPosts", "content_posts") ||
      (valueFor(record, "post_url", "postUrl") ? [record] : []);
  const posts = uniqueRecords(rawPosts).map(adaptPost).filter(Boolean);
  const post = posts.find((candidate) => candidate.verified && candidate.deliverableId) || posts[0] || null;
  const metricSnapshots = uniqueRecords(
    valueFor(record, "metricSnapshots", "metric_snapshots"),
    related.metricSnapshots
  ).map(adaptMetricSnapshot);
  const connectorJobs = uniqueRecords(
    valueFor(record, "connectorJobs", "connector_jobs"),
    related.connectorJobs
  ).map(adaptConnectorJob);
  const communications = uniqueRecords(
    valueFor(record, "communications", "communicationStatus", "communication_status", "gmailThreads", "gmail_threads"),
    related.communications
  ).map(adaptCommunicationMetadata);
  const socialcrawlStatus = uniqueRecords(
    valueFor(record, "socialcrawlStatus", "socialcrawl_status"),
    related.socialcrawlStatus
  ).map(adaptSocialCrawlStatus);
  const shipments = uniqueRecords(valueFor(record, "shipments"), related.shipments).map(adaptShipmentMetadata);
  const rightsTerms = uniqueRecords(
    valueFor(record, "rightsTerms", "rights_terms", "rights"),
    related.rightsTerms
  ).map(adaptRightsTerm);
  const driveAssets = uniqueRecords(valueFor(record, "driveAssets", "drive_assets"), related.driveAssets).map(adaptDriveAsset);
  const contentReviews = uniqueRecords(
    valueFor(record, "contentReviews", "content_reviews"),
    related.contentReviews
  ).map(adaptContentReview);
  const complianceReviews = uniqueRecords(
    valueFor(record, "complianceReviews", "compliance_reviews"),
    related.complianceReviews
  ).map(adaptComplianceReview);
  const reviewLinks = uniqueRecords(
    valueFor(record, "reviewLinks", "review_links"),
    related.reviewLinks
  ).map(adaptReviewLinkStatus);
  const attentionItems = uniqueRecords(
    valueFor(record, "attentionItems", "attention_items"),
    related.attentionItems
  ).map(adaptAttentionItem);
  const metricRecordId = text(valueFor(record, "metric_source_record_id", "metricSourceRecordId")) || null;
  const sourceDetails = record.source_details && typeof record.source_details === "object" ? record.source_details : null;
  const feeAmount = sourceDetails?.recorded_fee_authority === "imported_unverified" ? null
    : numberOrNull(valueFor(record, "fee_amount", "feeAmount", "agreed_fee", "agreedFee"));
  const paymentState = codeFor(
    valueFor(record, "payment_state", "paymentState", "payment_status", "paymentStatus"),
    "not_recorded"
  );
  const paymentStatus = titleCase(paymentState, feeAmount !== null ? "Not recorded" : "Not required");
  const deliverableStatus = titleCase(
    valueFor(record, "deliverable_status", "deliverableStatus"),
    titleCase(record.status, "Not started")
  );
  const deliverable = deliverables.find((candidate) => candidate.id && candidate.id === post?.deliverableId) ||
    deliverables[0] ||
    adaptDeliverable(record);
  return {
    id: text(record.id),
    sourceDetails,
    sourceUrl: safeGoogleUrl(sourceDetails?.source_url, "drive"),
    sourceStatus: text(sourceDetails?.source_status),
    sourceReportedPaymentStatus: text(sourceDetails?.source_reported_payment_status),
    sourceReportedPaymentDate: dateOnly(sourceDetails?.source_reported_payment_date),
    sourceFeeAmount: numberOrNull(sourceDetails?.source_fee_amount),
    sourceFeeCurrency: text(sourceDetails?.source_fee_currency),
    sourceFeeScope: text(sourceDetails?.source_fee_scope),
    sourceDeliverableSummary: text(sourceDetails?.source_deliverable_summary),
    sourceDueDate: dateOnly(sourceDetails?.source_due_date),
    sourcePaymentDueDate: dateOnly(sourceDetails?.source_payment_due_date),
    sourcePostUrls: asArray(sourceDetails?.source_post_urls).map(safeSocialUrl).filter(Boolean),
    revision: revisionOrNull(record.revision),
    canEdit: boolean(record.can_edit ?? record.canEdit),
    canContinue: boolean(record.can_continue ?? record.canContinue),
    canManageContinuation: boolean(record.can_manage_continuation ?? record.canManageContinuation),
    continuationAdopted: boolean(record.continuation_adopted ?? record.continuationAdopted),
    campaignId: text(record.campaign_id || record.campaignId),
    creatorId: text(record.creator_id || record.creatorId),
    creatorDisplayName: text(record.creator_display_name || record.creatorDisplayName),
    creatorHandle: text(record.creator_handle || record.creatorHandle),
    owner: text(record.owner_name, "Unassigned"),
    acquisitionSource: text(record.acquisition_source, "Unknown"),
    engagementTypeCode: codeFor(record.engagement_type || record.engagementType, "unknown"),
    engagementType: titleCase(record.engagement_type || record.engagementType, "Unknown"),
    rate: feeAmount,
    currency: text(record.fee_currency || record.feeCurrency || record.currency),
    paidUsageDays: numberOrNull(valueFor(record, "paid_usage_days", "paidUsageDays")),
    lifecycleStatus: codeFor(record.status, "potential"),
    status: titleCase(record.status, deliverableStatus),
    deliverable,
    deliverables,
    permissions: {
      updateDeliverable: boolean(record.can_update_deliverable),
      updatePayment: boolean(record.can_update_payment),
      verifyPost: boolean(record.can_verify_post)
    },
    onTime: typeof record.on_time === "boolean" ? record.on_time : null,
    paymentStatus,
    paymentState,
    payment: {
      amount: numberOrNull(record.payment_amount) ?? feeAmount,
      dueDate: dateOnly(record.payment_due_date),
      invoiceStatus: titleCase(record.invoice_status, "Not recorded"),
      ceoApproval: titleCase(record.ceo_approval_status, "Unknown"),
      cfoApproval: titleCase(record.cfo_approval_status, "Unknown"),
      status: paymentStatus,
      owner: text(record.payment_owner_name, "Unassigned"),
      sourceRecordId: text(record.payment_source_record_id, "Source record missing"),
      externalReference: text(record.external_finance_reference) || null,
      updatedAt: dateOnly(record.updated_at)
    },
    post,
    posts,
    metricSnapshots,
    performance: adaptPerformance(record, post, metricSnapshots, connectorJobs),
    communications,
    socialcrawlStatus,
    shipments,
    rights: rightsTerms[0] || null,
    rightsTerms,
    driveAssets,
    contentVersions,
    contentReviews,
    complianceReviews,
    reviewLinks,
    attentionItems,
    connectorJobs,
    nextAction: safeWorkflowText(valueFor(record, "next_action", "nextAction")) || null,
    notes: text(record.deliverable_note),
    assignmentSourceRecordId: text(record.assignment_source_record_id) || null
  };
};

const adaptCampaign = (record, related = {}) => ({
  sourceDetails: record.source_details && typeof record.source_details === "object" ? record.source_details : null,
  sourceUrl: safeGoogleUrl(record.source_details?.source_url, "drive"),
  sourceStatus: text(record.source_details?.source_status),
  launchDate: dateOnly(record.source_details?.launch_date),
  marketingStartDate: dateOnly(record.source_details?.marketing_start_date),
  overviewTotalBudget: numberOrNull(record.source_details?.total_budget),
  canManageRoster: boolean(record.can_manage_roster ?? record.can_edit ?? record.canEdit),
  ownerId: text(record.owner_id) || null,
  ownerOptions: Array.isArray(record.owner_options) ? record.owner_options : [],
  id: text(record.id),
  revision: revisionOrNull(record.revision),
  canEdit: boolean(record.can_edit ?? record.canEdit),
  canContinue: boolean(record.can_continue ?? record.canContinue),
  canManageContinuation: boolean(record.can_manage_continuation ?? record.canManageContinuation),
  workflowActive: boolean(record.workflow_active ?? record.workflowActive),
  clientId: idFor(record, "client_id", "clientId"),
  brandId: idFor(record, "brand_id", "brandId"),
  campaignCode: text(record.campaign_code || record.campaignCode),
  name: text(record.name, "Untitled campaign"),
  productName: text(record.product_name || record.productName),
  client: text(record.client_name || record.clientName, "Client not recorded"),
  brand: text(record.brand_name || record.brandName, "Brand not recorded"),
  category: text(record.category),
  campaignType: codeFor(record.campaign_type || record.campaignType, "other"),
  type: titleCase(record.campaign_type || record.campaignType, "Other"),
  lifecycleStatus: codeFor(record.status, "unknown"),
  status: campaignStatus(record.status),
  startDate: dateOnly(record.start_date),
  endDate: dateOnly(record.end_date),
  objective: text(record.objective),
  owner: text(record.owner_name, "Unassigned"),
  creatorCount: numberOrNull(record.creator_count ?? record.creatorCount),
  nextRecordedDate: dateOnly(record.next_recorded_date ?? record.nextRecordedDate),
  nextRecordedKind: text(record.next_recorded_kind ?? record.nextRecordedKind),
  reportOwner: "Designated analyst",
  budget: numberOrNull(record.budget),
  timezone: text(record.timezone, "America/Los_Angeles"),
  currency: text(record.currency),
  reportStatus: "Not started",
  reportId: text(record.report_code) || null,
  reportTitle: text(record.report_title) || null,
  permissions: {
    updateCampaign: boolean(record.can_update_campaign),
    updateDeliverable: boolean(record.can_update_deliverable),
    updatePayment: boolean(record.can_update_payment),
    addReportingUpdate: boolean(record.can_add_reporting_update),
    addCampaignUpdate: boolean(record.can_add_update),
    linkGmail: boolean(record.can_link_gmail),
    verifyPost: boolean(record.can_verify_post)
  },
  operationsLoadState: { status: "not_loaded" },
  assistedImportEvidenceState: { status: "not_loaded" },
  brandAssistedImportEvidence: { status: "not_loaded", facts: [] },
  productAssistedImportEvidence: [],
  assignments: [],
  gmailThreads: uniqueRecords(
    valueFor(record, "gmailThreads", "gmail_threads", "communications", "communicationStatus", "communication_status"),
    related.communications
  ).map(adaptCommunicationMetadata),
  communicationStatus: uniqueRecords(
    valueFor(record, "communicationStatus", "communication_status", "communications"),
    related.communications
  ).map(adaptCommunicationMetadata),
  socialcrawlStatus: uniqueRecords(
    valueFor(record, "socialcrawlStatus", "socialcrawl_status"),
    related.socialcrawlStatus
  ).map(adaptSocialCrawlStatus),
  costcoActivations: uniqueRecords(
    valueFor(record, "costcoActivations", "costco_activations", "retailerContexts", "retailer_contexts", "costcoContext"),
    related.costcoActivations
  ).map(adaptCostcoActivation),
  driveAssets: uniqueRecords(valueFor(record, "driveAssets", "drive_assets"), related.driveAssets).map(adaptDriveAsset),
  contentVersions: uniqueRecords(valueFor(record, "contentVersions", "content_versions"), related.contentVersions).map(adaptContentVersion),
  contentReviews: uniqueRecords(valueFor(record, "contentReviews", "content_reviews"), related.contentReviews).map(adaptContentReview),
  complianceReviews: uniqueRecords(valueFor(record, "complianceReviews", "compliance_reviews"), related.complianceReviews).map(adaptComplianceReview),
  reviewLinks: uniqueRecords(valueFor(record, "reviewLinks", "review_links"), related.reviewLinks).map(adaptReviewLinkStatus),
  shipments: uniqueRecords(valueFor(record, "shipments"), related.shipments).map(adaptShipmentMetadata),
  rightsTerms: uniqueRecords(valueFor(record, "rightsTerms", "rights_terms", "rights"), related.rightsTerms).map(adaptRightsTerm),
  attentionItems: uniqueRecords(valueFor(record, "attentionItems", "attention_items"), related.attentionItems).map(adaptAttentionItem),
  connectorJobs: uniqueRecords(valueFor(record, "connectorJobs", "connector_jobs"), related.connectorJobs).map(adaptConnectorJob),
  assistedImportFacts: asArray(valueFor(record, "assistedImportFacts", "assisted_import_facts"))
    .map(adaptAssistedImportFact)
    .filter(Boolean)
});

const adaptSource = (record) => {
  const name = text(record.name, "Unnamed source");
  const type = sourceType(record.source_type, name);
  const category = text(record.source_category).toLowerCase() === "acquisition" ? "Acquisition" : "System";
  return {
    id: text(record.id),
    name,
    type,
    category,
    owner: text(record.owner_name, "Unassigned"),
    status: titleCase(record.status, "Review required"),
    connection: sourceConnection(record, type),
    description:
      category === "Acquisition"
        ? "Creator acquisition source retained with each campaign assignment."
        : "Approved internal data connection. Access and import scope are controlled by administrators.",
    workflow:
      type === "Google Sheets"
        ? "Approved range -> private import -> reviewed workflow records"
        : type === "Gmail"
          ? "Approved thread -> metadata link -> reviewed campaign evidence"
          : "Source -> creator relationship -> campaign assignment",
    linkedRecords:
      category === "Acquisition"
        ? ["Creator profiles", "Campaign assignments", "Acquisition history"]
        : ["Source records", "Import history", "Campaign evidence"]
  };
};

const sourceIdForImport = (record, sources) => {
  const name = text(record.source_name).toLowerCase();
  return sources.find((source) => source.name.toLowerCase() === name)?.id || null;
};

const adaptImportRun = (record, sources) => {
  const counts = record.row_counts && typeof record.row_counts === "object" ? record.row_counts : {};
  return {
    id: text(record.id),
    sourceId: sourceIdForImport(record, sources),
    tab: text(record.tab_name, "Approved tab"),
    range: text(record.approved_a1_range, "Approved columns only"),
    status: titleCase(record.status, "Awaiting preview"),
    requestedBy: "Import administrator",
    requestedAt: dateOnly(record.started_at),
    importedAt: dateOnly(record.completed_at),
    rowsRead: numberOrNull(counts.rows_read ?? counts.read) ?? 0,
    newCreators: numberOrNull(counts.new_creators) ?? 0,
    matchedCreators: numberOrNull(counts.matched_creators ?? counts.matched) ?? 0,
    blockedRows: numberOrNull(counts.blocked_rows ?? counts.rejected) ?? 0,
    approvedFields: asArray(record.allowed_fields).map((value) => text(value)).filter(Boolean),
    blockedFields: ["Personal contact, location, financial, and identity fields"],
    mappingVersion: text(record.mapping_version) || null
  };
};

const adaptActivity = (record) => ({
  id: text(record.id),
  campaignId: text(record.campaign_id),
  assignmentId: text(record.assignment_id) || null,
  type: titleCase(record.update_type, "General"),
  status: titleCase(record.status, "Recorded"),
  note: text(record.note, "Workflow update recorded."),
  owner: text(record.created_by_name, "Unassigned"),
  nextOwner: text(record.next_owner_name, text(record.next_owner_label, "Unassigned")),
  nextAction: text(record.next_action, "Review this update"),
  dueDate: dateOnly(record.due_date),
  createdAt: dateOnly(record.created_at)
});

const adaptRepresentationHistory = (records) => asArray(records).map((record) => {
  const byouCode = text(record?.byouCreatorCode || record?.byou_creator_code);
  const rawName = text(record?.creatorName || record?.creator_name);
  const creatorHandle = defensibleSocialUsername(
    record?.creatorHandle || record?.creator_handle,
    byouCode
  );
  const creatorName =
    !looksLikeUnsafeCreatorIdentity(rawName, byouCode) &&
    !sameCreatorIdentity(rawName, creatorHandle)
      ? rawName
      : creatorHandle || "Creator profile";
  return {
    creatorId: text(record?.creatorId || record?.creator_id),
    creatorName,
    creatorHandle,
    status: titleCase(record?.status, "Unconfirmed"),
    startsOn: dateOnly(record?.startsOn || record?.starts_on),
    endsOn: dateOnly(record?.endsOn || record?.ends_on),
    managerId: text(record?.managerId || record?.manager_id),
    managerName: text(record?.managerName || record?.manager_name)
  };
}).filter((record) => record.creatorId);

const adaptTalentManager = (record) => ({
  id: text(record.id),
  displayName: text(record.displayName || record.display_name, "Manager record"),
  roleTitle: text(record.roleTitle || record.role_title),
  status: titleCase(record.status, "Review"),
  talentAgencyId: text(record.talentAgencyId || record.talent_agency_id),
  talentAgencyName: text(record.talentAgencyName || record.talent_agency_name),
  currentCreatorCount: numberOrNull(record.currentCreatorCount ?? record.current_creator_count) || 0,
  formerCreatorCount: numberOrNull(record.formerCreatorCount ?? record.former_creator_count) || 0,
  unconfirmedCreatorCount: numberOrNull(
    record.unconfirmedCreatorCount ?? record.unconfirmed_creator_count
  ) || 0,
  creatorHistory: adaptRepresentationHistory(record.creatorHistory || record.creator_history),
  updatedAt: text(record.updatedAt || record.updated_at)
});

const adaptTalentAgency = (record) => ({
  id: text(record.id),
  displayName: text(record.displayName || record.display_name, "Talent agency record"),
  status: titleCase(record.status, "Review"),
  currentCreatorCount: numberOrNull(record.currentCreatorCount ?? record.current_creator_count) || 0,
  formerCreatorCount: numberOrNull(record.formerCreatorCount ?? record.former_creator_count) || 0,
  unconfirmedCreatorCount: numberOrNull(
    record.unconfirmedCreatorCount ?? record.unconfirmed_creator_count
  ) || 0,
  managerCount: numberOrNull(record.managerCount ?? record.manager_count) || 0,
  creatorHistory: adaptRepresentationHistory(record.creatorHistory || record.creator_history),
  managerRoster: asArray(record.managerRoster || record.manager_roster)
    .map(adaptTalentManager)
    .filter((manager) => manager.id),
  updatedAt: text(record.updatedAt || record.updated_at)
});

const SNAPSHOT_ARRAY_ALIASES = Object.freeze({
  deliverables: Object.freeze(["deliverables", "deliverableRecords", "deliverable_records"]),
  posts: Object.freeze(["posts", "contentPosts", "content_posts", "postRecords", "post_records"]),
  metricSnapshots: Object.freeze(["metricSnapshots", "metric_snapshots"]),
  communications: Object.freeze([
    "communications",
    "communicationStatus",
    "communication_status",
    "gmailThreads",
    "gmail_threads"
  ]),
  socialcrawlStatus: Object.freeze(["socialcrawlStatus", "socialcrawl_status"]),
  costcoActivations: Object.freeze([
    "costcoActivations",
    "costco_activations",
    "retailerContexts",
    "retailer_contexts",
    "costcoContext"
  ]),
  driveAssets: Object.freeze(["driveAssets", "drive_assets"]),
  contentVersions: Object.freeze(["contentVersions", "content_versions"]),
  contentReviews: Object.freeze(["contentReviews", "content_reviews"]),
  complianceReviews: Object.freeze(["complianceReviews", "compliance_reviews"]),
  reviewLinks: Object.freeze(["reviewLinks", "review_links"]),
  shipments: Object.freeze(["shipments", "shipmentRecords", "shipment_records"]),
  rightsTerms: Object.freeze(["rightsTerms", "rights_terms", "rights"]),
  attentionItems: Object.freeze(["attentionItems", "attention_items"]),
  connectorJobs: Object.freeze(["connectorJobs", "connector_jobs"])
});

const recordsNamed = (source, aliases) => {
  if (!source || typeof source !== "object") return [];
  return uniqueRecords(...aliases.map((alias) => source[alias]));
};

const scopeId = (record, ...aliases) => idFor(record, ...aliases);

const recordMatchesScope = (record, scope) => {
  if (!record || typeof record !== "object") return false;
  if (scope.assignmentId) {
    const assignmentId = scopeId(record, "assignment_id", "assignmentId");
    if (assignmentId) return assignmentId === scope.assignmentId;
    const postId = scopeId(record, "post_id", "postId", "content_post_id", "contentPostId");
    if (postId) return scope.postIds?.has(postId) || false;
    const entityType = text(valueFor(record, "entity_type", "entityType"));
    const entityId = scopeId(record, "entity_id", "entityId");
    if (entityId && /content[_ ]?post|post|video/i.test(entityType)) return scope.postIds?.has(entityId) || false;
    const deliverableId = scopeId(record, "deliverable_id", "deliverableId");
    if (deliverableId) return scope.deliverableIds?.has(deliverableId) || false;
    const driveAssetId = scopeId(record, "drive_asset_id", "driveAssetId");
    if (driveAssetId) return scope.driveAssetIds?.has(driveAssetId) || false;
    const contentVersionId = scopeId(record, "content_version_id", "contentVersionId");
    if (contentVersionId) return scope.contentVersionIds?.has(contentVersionId) || false;
    return false;
  }
  const campaignId = scopeId(record, "campaign_id", "campaignId");
  return Boolean(scope.campaignId && campaignId === scope.campaignId);
};

const recordsForScope = (nestedSource, allRecords, aliases, scope) => uniqueRecords(
  recordsNamed(nestedSource, aliases),
  allRecords.filter((record) => recordMatchesScope(record, scope))
);

const collectSnapshotArrays = (snapshot) => {
  const operationRows = uniqueRecords(
    snapshot.campaignOperations,
    snapshot.campaign_operations,
    snapshot.campaignOperationRecords,
    snapshot.campaign_operation_records
  );
  return Object.fromEntries(
    Object.entries(SNAPSHOT_ARRAY_ALIASES).map(([key, aliases]) => {
      const rowRecords = operationRows.flatMap((row) => {
        const campaignId = scopeId(row, "campaign_id", "campaignId");
        return recordsNamed(row, aliases).map((record) => (
          campaignId && !scopeId(record, "campaign_id", "campaignId")
            ? { ...record, campaignId }
            : record
        ));
      });
      return [key, uniqueRecords(recordsNamed(snapshot, aliases), rowRecords)];
    })
  );
};

export function adaptWorkspaceRecords(resource, records, { sources = [] } = {}) {
  const safeRecords = asArray(records);
  if (resource === "creators") return safeRecords.map(adaptCreator).filter((record) => record.id);
  if (resource === "campaigns") return safeRecords.map((record) => adaptCampaign(record)).filter((record) => record.id);
  if (resource === "talentAgencies") return safeRecords.map(adaptTalentAgency).filter((record) => record.id);
  if (resource === "talentManagers") return safeRecords.map(adaptTalentManager).filter((record) => record.id);
  if (resource === "assignments") return safeRecords.map((record) => adaptAssignment(record)).filter((record) => record.id);
  if (resource === "sources") return safeRecords.map(adaptSource).filter((record) => record.id);
  if (resource === "importRuns") {
    return safeRecords.map((record) => adaptImportRun(record, sources)).filter((record) => record.id);
  }
  if (resource === "activity") return safeRecords.map(adaptActivity).filter((record) => record.id);
  throw new TypeError("Unsupported workspace record collection");
}

/**
 * Converts the deliberately narrow API views into the existing internal workspace
 * model. Every returned field is allowlisted here; unknown database columns are
 * ignored so contact, location, tax, bank, and authentication data cannot leak
 * into the ordinary browser workspace through an accidental view expansion.
 */
export function adaptWorkspaceSnapshot(snapshot, { fallbackCurrentUser } = {}) {
  const safeSnapshot = snapshot && typeof snapshot === "object" ? snapshot : {};
  const currentUser = adaptCurrentUser(
    safeSnapshot.currentUser,
    fallbackCurrentUser || { name: "BYOU staff", role: "Internal user", initials: "BI" }
  );
  const creators = asArray(safeSnapshot.creators).map(adaptCreator).filter((creator) => creator.id);
  const rawAssignments = asArray(safeSnapshot.assignments);
  const rawCampaigns = asArray(safeSnapshot.campaigns);
  const arrays = collectSnapshotArrays(safeSnapshot);
  const assignments = rawAssignments.map((record) => {
    const assignmentId = idFor(record, "id");
    const campaignId = idFor(record, "campaign_id", "campaignId");
    const deliverables = recordsForScope(
      record,
      arrays.deliverables,
      SNAPSHOT_ARRAY_ALIASES.deliverables,
      { assignmentId, campaignId }
    );
    const deliverableIds = new Set(deliverables.map((item) => idFor(item, "id", "deliverable_id", "deliverableId")).filter(Boolean));
    const posts = recordsForScope(
      record,
      arrays.posts,
      SNAPSHOT_ARRAY_ALIASES.posts,
      { assignmentId, campaignId, deliverableIds }
    );
    const postIds = new Set(posts.map((item) => idFor(item, "id", "post_id", "postId")).filter(Boolean));
    const driveAssets = recordsForScope(
      record,
      arrays.driveAssets,
      SNAPSHOT_ARRAY_ALIASES.driveAssets,
      { assignmentId, campaignId, deliverableIds, postIds }
    );
    const driveAssetIds = new Set(driveAssets.map((item) => idFor(item, "id", "drive_asset_id", "driveAssetId")).filter(Boolean));
    const contentVersions = recordsForScope(
      record,
      arrays.contentVersions,
      SNAPSHOT_ARRAY_ALIASES.contentVersions,
      { assignmentId, campaignId, deliverableIds, postIds, driveAssetIds }
    );
    const contentVersionIds = new Set(contentVersions.map((item) => idFor(item, "id", "content_version_id", "contentVersionId")).filter(Boolean));
    const scope = { assignmentId, campaignId, deliverableIds, postIds, driveAssetIds, contentVersionIds };
    return adaptAssignment(record, {
      deliverables,
      posts,
      metricSnapshots: recordsForScope(record, arrays.metricSnapshots, SNAPSHOT_ARRAY_ALIASES.metricSnapshots, scope),
      communications: recordsForScope(record, arrays.communications, SNAPSHOT_ARRAY_ALIASES.communications, scope),
      socialcrawlStatus: recordsForScope(record, arrays.socialcrawlStatus, SNAPSHOT_ARRAY_ALIASES.socialcrawlStatus, scope),
      driveAssets,
      contentVersions,
      contentReviews: recordsForScope(record, arrays.contentReviews, SNAPSHOT_ARRAY_ALIASES.contentReviews, scope),
      complianceReviews: recordsForScope(record, arrays.complianceReviews, SNAPSHOT_ARRAY_ALIASES.complianceReviews, scope),
      reviewLinks: recordsForScope(record, arrays.reviewLinks, SNAPSHOT_ARRAY_ALIASES.reviewLinks, scope),
      shipments: recordsForScope(record, arrays.shipments, SNAPSHOT_ARRAY_ALIASES.shipments, scope),
      rightsTerms: recordsForScope(record, arrays.rightsTerms, SNAPSHOT_ARRAY_ALIASES.rightsTerms, scope),
      attentionItems: recordsForScope(record, arrays.attentionItems, SNAPSHOT_ARRAY_ALIASES.attentionItems, scope),
      connectorJobs: recordsForScope(record, arrays.connectorJobs, SNAPSHOT_ARRAY_ALIASES.connectorJobs, scope)
    });
  }).filter((assignment) => assignment.id);
  const campaigns = rawCampaigns.map((record) => {
    const campaignId = idFor(record, "id");
    const scope = { campaignId };
    return adaptCampaign(record, {
      communications: recordsForScope(record, arrays.communications, SNAPSHOT_ARRAY_ALIASES.communications, scope),
      socialcrawlStatus: recordsForScope(record, arrays.socialcrawlStatus, SNAPSHOT_ARRAY_ALIASES.socialcrawlStatus, scope),
      costcoActivations: recordsForScope(record, arrays.costcoActivations, SNAPSHOT_ARRAY_ALIASES.costcoActivations, scope),
      driveAssets: recordsForScope(record, arrays.driveAssets, SNAPSHOT_ARRAY_ALIASES.driveAssets, scope),
      contentVersions: recordsForScope(record, arrays.contentVersions, SNAPSHOT_ARRAY_ALIASES.contentVersions, scope),
      contentReviews: recordsForScope(record, arrays.contentReviews, SNAPSHOT_ARRAY_ALIASES.contentReviews, scope),
      complianceReviews: recordsForScope(record, arrays.complianceReviews, SNAPSHOT_ARRAY_ALIASES.complianceReviews, scope),
      reviewLinks: recordsForScope(record, arrays.reviewLinks, SNAPSHOT_ARRAY_ALIASES.reviewLinks, scope),
      shipments: recordsForScope(record, arrays.shipments, SNAPSHOT_ARRAY_ALIASES.shipments, scope),
      rightsTerms: recordsForScope(record, arrays.rightsTerms, SNAPSHOT_ARRAY_ALIASES.rightsTerms, scope),
      attentionItems: recordsForScope(record, arrays.attentionItems, SNAPSHOT_ARRAY_ALIASES.attentionItems, scope),
      connectorJobs: recordsForScope(record, arrays.connectorJobs, SNAPSHOT_ARRAY_ALIASES.connectorJobs, scope)
    });
  }).filter((campaign) => campaign.id);
  const campaignById = new Map(campaigns.map((campaign) => [campaign.id, campaign]));
  for (const assignment of assignments) {
    const raw = rawAssignments.find((record) => text(record.id) === assignment.id);
    campaignById.get(text(valueFor(raw, "campaign_id", "campaignId")))?.assignments.push(assignment);
  }
  for (const campaign of campaigns) {
    campaign.gmailThreads = uniqueRecords(campaign.gmailThreads, campaign.assignments.flatMap((assignment) => assignment.communications));
    campaign.communicationStatus = uniqueRecords(
      campaign.communicationStatus,
      campaign.assignments.flatMap((assignment) => assignment.communications)
    );
    campaign.socialcrawlStatus = uniqueRecords(
      campaign.socialcrawlStatus,
      campaign.assignments.flatMap((assignment) => assignment.socialcrawlStatus)
    );
    for (const key of [
      "driveAssets",
      "contentVersions",
      "contentReviews",
      "complianceReviews",
      "reviewLinks",
      "shipments",
      "rightsTerms",
      "attentionItems",
      "connectorJobs"
    ]) {
      campaign[key] = uniqueRecords(campaign[key], campaign.assignments.flatMap((assignment) => assignment[key] || []));
    }
    campaign.costcoContext = campaign.costcoActivations[0] || null;
    campaign.reportStatus = reportStatusFor(campaign);
    campaign.reportId ||= makeReportId(campaign);
  }
  for (const creator of creators) {
    const derived = buildCreatorRelationshipSummary(creator.id, campaigns);
    const existingSummary = creator.relationshipSummary;
    const hasAssignmentProjection = existingSummary.hasAssignmentProjection === true;
    creator.relationshipSummary = {
      ...derived,
      lastCollaborationDate: derived.lastCollaborationDate || existingSummary.lastCollaborationDate,
      campaignCount: derived.campaignCount || existingSummary.campaignCount,
      paidCampaignCount: hasAssignmentProjection
        ? existingSummary.paidCampaignCount
        : derived.campaignCount
          ? derived.paidCampaignCount
          : existingSummary.paidCampaignCount,
      seedingCampaignCount: hasAssignmentProjection
        ? existingSummary.seedingCampaignCount
        : derived.campaignCount
          ? derived.seedingCampaignCount
          : existingSummary.seedingCampaignCount,
      primaryCollaborationType: hasAssignmentProjection
        ? existingSummary.primaryCollaborationType
        : derived.campaignCount
          ? derived.primaryCollaborationType
          : existingSummary.primaryCollaborationType,
      campaignHistory: hasAssignmentProjection && existingSummary.campaignHistory.length
        ? existingSummary.campaignHistory
        : derived.campaignHistory.length
          ? derived.campaignHistory
          : existingSummary.campaignHistory,
      stageSummary: existingSummary.stageSummary,
      hasAssignmentProjection
    };
  }
  const sources = asArray(safeSnapshot.sources).map(adaptSource).filter((source) => source.id);
  const importRuns = asArray(safeSnapshot.importRuns)
    .map((record) => adaptImportRun(record, sources))
    .filter((run) => run.id && run.sourceId);
  const activityUpdates = asArray(safeSnapshot.activity || safeSnapshot.activityUpdates)
    .map(adaptActivity)
    .filter((update) => update.id && update.campaignId);
  return { currentUser, creators, campaigns, sources, importRuns, activityUpdates };
}

const hasOwn = (record, key) => Object.prototype.hasOwnProperty.call(record || {}, key);

const cloneWorkspaceValue = (value) => {
  if (Array.isArray(value)) return value.map(cloneWorkspaceValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneWorkspaceValue(nested)]));
};

const operationCollection = (rawOperations, key) => {
  const aliases = SNAPSHOT_ARRAY_ALIASES[key] || [key];
  return {
    present: aliases.some((alias) => hasOwn(rawOperations, alias)),
    records: uniqueRecords(...aliases.map((alias) => rawOperations?.[alias]))
  };
};

const selectedOperationRecords = (campaign, rawOperations, key, adapter) => {
  const collection = operationCollection(rawOperations, key);
  return {
    present: collection.present,
    records: collection.present
      ? collection.records.map(adapter)
      : cloneWorkspaceValue(asArray(campaign?.[key]))
  };
};

const assignmentOperationMatch = (record, assignment, { entityIds } = {}) => {
  if (!record || !assignment) return false;
  if (record.assignmentId) return record.assignmentId === assignment.id;
  const deliverableIds = new Set(asArray(assignment.deliverables || assignment.deliverable).map((item) => item?.id).filter(Boolean));
  if (record.deliverableId) return deliverableIds.has(record.deliverableId);
  const posts = uniqueRecords(assignment.posts, assignment.post);
  const postIds = new Set(posts.map((post) => post?.id).filter(Boolean));
  if (record.postId) return postIds.has(record.postId);
  if (record.attributionId) {
    return posts.some((post) => post?.attributionId && post.attributionId === record.attributionId);
  }
  if (record.creatorId && assignment.creatorId) return record.creatorId === assignment.creatorId;
  return Boolean(record.entityId && entityIds?.has(record.entityId));
};

const operationCampaignId = (rawOperations) => idFor(rawOperations, "campaign_id", "campaignId");

/**
 * Adds the selected campaign's lazy operations projection to the already-adapted
 * campaign model. Arrays in the response remain arrays: content versions,
 * reviews, shipments, rights, and jobs are never collapsed to a single record.
 */
export function mergeCampaignOperationsView(campaign, rawOperations) {
  if (!campaign || typeof campaign !== "object" || !text(campaign.id)) {
    throw new TypeError("A campaign is required to merge campaign operations");
  }
  const raw = rawOperations && typeof rawOperations === "object" && !Array.isArray(rawOperations)
    ? rawOperations
    : {};
  const campaignId = text(campaign.id);
  const responseCampaignId = operationCampaignId(raw);
  if (responseCampaignId && responseCampaignId !== campaignId) {
    throw new TypeError("Campaign operations response is outside the requested campaign scope");
  }
  for (const [key] of Object.entries(SNAPSHOT_ARRAY_ALIASES)) {
    for (const record of operationCollection(raw, key).records) {
      const recordCampaignId = idFor(record, "campaign_id", "campaignId");
      if (recordCampaignId && recordCampaignId !== campaignId) {
        throw new TypeError("Campaign operations record is outside the requested campaign scope");
      }
    }
  }

  const merged = cloneWorkspaceValue(campaign);
  const costco = selectedOperationRecords(merged, raw, "costcoActivations", adaptCostcoActivation);
  const drive = selectedOperationRecords(merged, raw, "driveAssets", adaptDriveAsset);
  const versions = selectedOperationRecords(merged, raw, "contentVersions", adaptContentVersion);
  const reviews = selectedOperationRecords(merged, raw, "contentReviews", adaptContentReview);
  const compliance = selectedOperationRecords(merged, raw, "complianceReviews", adaptComplianceReview);
  const reviewLinks = selectedOperationRecords(merged, raw, "reviewLinks", adaptReviewLinkStatus);
  const shipments = selectedOperationRecords(merged, raw, "shipments", adaptShipmentMetadata);
  const rights = selectedOperationRecords(merged, raw, "rightsTerms", adaptRightsTerm);
  const attention = selectedOperationRecords(merged, raw, "attentionItems", adaptAttentionItem);
  const connector = selectedOperationRecords(merged, raw, "connectorJobs", adaptConnectorJob);
  const communication = selectedOperationRecords(
    { communications: merged.communicationStatus || [] },
    raw,
    "communications",
    adaptCommunicationMetadata
  );
  const socialcrawl = selectedOperationRecords(merged, raw, "socialcrawlStatus", adaptSocialCrawlStatus);
  const assistedImportFacts = asArray(valueFor(raw, "assistedImportFacts", "assisted_import_facts"))
    .slice(0, 200)
    .map(adaptAssistedImportFact)
    .filter(Boolean);
  const assistedImportEvidenceStatus = text(
    valueFor(
      valueFor(raw, "assistedImportEvidenceState", "assisted_import_evidence_state") || {},
      "status"
    )
  ).toLowerCase();

  Object.assign(merged, {
    costcoActivations: costco.records,
    driveAssets: drive.records,
    contentVersions: versions.records,
    contentReviews: reviews.records,
    complianceReviews: compliance.records,
    reviewLinks: reviewLinks.records,
    shipments: shipments.records,
    rightsTerms: rights.records,
    attentionItems: attention.records,
    connectorJobs: connector.records,
    communicationStatus: communication.records,
    socialcrawlStatus: socialcrawl.records,
    assistedImportFacts,
    assistedImportEvidenceState: {
      status: assistedImportEvidenceStatus === "ready" ? "ready" : "unavailable"
    }
  });
  merged.costcoContext = costco.records[0] || null;

  merged.assignments = asArray(merged.assignments).map((assignment) => {
    const deliverables = asArray(assignment.deliverables?.length ? assignment.deliverables : assignment.deliverable)
      .map((deliverable) => {
        const matchingVersions = versions.records.filter((version) => version.deliverableId === deliverable?.id);
        return {
          ...deliverable,
          versions: versions.present ? matchingVersions : cloneWorkspaceValue(asArray(deliverable?.versions))
        };
      });
    const normalizedAssignment = { ...assignment, deliverables };
    const assignmentVersions = versions.records.filter((record) => assignmentOperationMatch(record, normalizedAssignment));
    const versionIds = new Set(assignmentVersions.map((record) => record.id).filter(Boolean));
    const assignmentDrive = drive.records.filter((record) => assignmentOperationMatch(record, normalizedAssignment));
    const assignmentReviews = reviews.records.filter((record) =>
      assignmentOperationMatch(record, normalizedAssignment) || (record.contentVersionId && versionIds.has(record.contentVersionId))
    );
    const assignmentCompliance = compliance.records.filter((record) => assignmentOperationMatch(record, normalizedAssignment));
    const assignmentReviewLinks = reviewLinks.records.filter((record) =>
      assignmentOperationMatch(record, normalizedAssignment) || (record.contentVersionId && versionIds.has(record.contentVersionId))
    );
    const assignmentShipments = shipments.records.filter((record) => assignmentOperationMatch(record, normalizedAssignment));
    const assignmentRights = rights.records.filter((record) => assignmentOperationMatch(record, normalizedAssignment));
    const assignmentAttention = attention.records.filter((record) => assignmentOperationMatch(record, normalizedAssignment));
    const entityIds = new Set([
      assignment.id,
      ...deliverables.map((record) => record?.id),
      ...uniqueRecords(assignment.posts, assignment.post).map((record) => record?.id),
      ...assignmentDrive.map((record) => record.id),
      ...assignmentVersions.map((record) => record.id),
      ...assignmentReviews.map((record) => record.id),
      ...assignmentShipments.map((record) => record.id),
      ...assignmentRights.map((record) => record.id),
      ...assignmentAttention.map((record) => record.id)
    ].filter(Boolean));
    const assignmentConnector = connector.records.filter((record) =>
      assignmentOperationMatch(record, normalizedAssignment, { entityIds })
    );
    const communications = communication.records.filter((record) => assignmentOperationMatch(record, normalizedAssignment));
    const socialcrawlStatus = socialcrawl.records.filter((record) => assignmentOperationMatch(record, normalizedAssignment));
    const primaryDeliverableId = assignment.deliverable?.id;
    return {
      ...normalizedAssignment,
      deliverable: deliverables.find((record) => record?.id === primaryDeliverableId) || deliverables[0] || assignment.deliverable || null,
      driveAssets: drive.present ? assignmentDrive : cloneWorkspaceValue(asArray(assignment.driveAssets)),
      contentVersions: versions.present ? assignmentVersions : cloneWorkspaceValue(asArray(assignment.contentVersions)),
      contentReviews: reviews.present ? assignmentReviews : cloneWorkspaceValue(asArray(assignment.contentReviews)),
      complianceReviews: compliance.present ? assignmentCompliance : cloneWorkspaceValue(asArray(assignment.complianceReviews)),
      reviewLinks: reviewLinks.present ? assignmentReviewLinks : cloneWorkspaceValue(asArray(assignment.reviewLinks)),
      shipments: shipments.present ? assignmentShipments : cloneWorkspaceValue(asArray(assignment.shipments)),
      rightsTerms: rights.present ? assignmentRights : cloneWorkspaceValue(asArray(assignment.rightsTerms)),
      rights: rights.present ? assignmentRights[0] || null : cloneWorkspaceValue(assignment.rights),
      attentionItems: attention.present ? assignmentAttention : cloneWorkspaceValue(asArray(assignment.attentionItems)),
      connectorJobs: connector.present ? assignmentConnector : cloneWorkspaceValue(asArray(assignment.connectorJobs)),
      communications: communication.present ? communications : cloneWorkspaceValue(asArray(assignment.communications)),
      socialcrawlStatus: socialcrawl.present ? socialcrawlStatus : cloneWorkspaceValue(asArray(assignment.socialcrawlStatus))
    };
  });

  if (communication.present) {
    merged.gmailThreads = uniqueRecords(communication.records, merged.gmailThreads);
  }
  return merged;
}

/** Creates a campaign-scoped lazy loader. Failed requests are deliberately not cached. */
export function createCampaignOperationsLoader({ fetchOperations } = {}) {
  if (typeof fetchOperations !== "function") {
    throw new TypeError("fetchOperations must be a function");
  }
  const cache = new Map();
  const inflight = new Map();
  const load = async (campaign, { force = false } = {}) => {
    const campaignId = text(campaign?.id);
    if (!campaignId) throw new TypeError("A campaign id is required to load campaign operations");
    if (!force && cache.has(campaignId)) {
      const rawOperations = cache.get(campaignId);
      return {
        status: "ready",
        fromCache: true,
        rawOperations,
        campaign: mergeCampaignOperationsView(campaign, rawOperations)
      };
    }
    let request;
    try {
      request = inflight.get(campaignId);
      if (!request || force) {
        request = Promise.resolve().then(() => fetchOperations(campaignId));
        inflight.set(campaignId, request);
      }
      const rawOperations = await request;
      cache.set(campaignId, rawOperations && typeof rawOperations === "object" ? rawOperations : {});
      return {
        status: "ready",
        fromCache: false,
        rawOperations: cache.get(campaignId),
        campaign: mergeCampaignOperationsView(campaign, cache.get(campaignId))
      };
    } catch (error) {
      return {
        status: "unavailable",
        fromCache: false,
        campaign: cloneWorkspaceValue(campaign),
        error: error instanceof Error ? error : new Error("Campaign operations are unavailable")
      };
    } finally {
      if (inflight.get(campaignId) === request) inflight.delete(campaignId);
    }
  };
  return {
    load,
    invalidate(campaignId) {
      cache.delete(text(campaignId));
    },
    clear() {
      cache.clear();
      inflight.clear();
    }
  };
}

/**
 * Loads accepted evidence for one canonical brand or product on demand. Failed
 * requests are never cached and return an explicit unavailable state, so an
 * outage cannot be misrepresented as "no accepted evidence."
 */
export function createAssistedImportEntityEvidenceLoader({ fetchEvidence } = {}) {
  if (typeof fetchEvidence !== "function") {
    throw new TypeError("fetchEvidence must be a function");
  }
  const cache = new Map();
  const inflight = new Map();
  const load = async (targetType, targetId, { force = false } = {}) => {
    const safeType = text(targetType).toLowerCase();
    const safeId = text(targetId).toLowerCase();
    if (!new Set(["brand", "product"]).has(safeType) || !safeId) {
      throw new TypeError("A supported evidence target is required");
    }
    const key = `${safeType}:${safeId}`;
    if (!force && cache.has(key)) {
      return { ...cache.get(key), fromCache: true };
    }
    let request;
    try {
      request = inflight.get(key);
      if (!request || force) {
        request = Promise.resolve().then(() => fetchEvidence(safeType, safeId));
        inflight.set(key, request);
      }
      const rawPayload = await request;
      const raw = valueFor(rawPayload || {}, "data") || rawPayload || {};
      if (
        text(valueFor(raw, "targetType", "target_type")).toLowerCase() !== safeType
        || text(valueFor(raw, "targetId", "target_id")).toLowerCase() !== safeId
        || text(valueFor(raw, "status")).toLowerCase() !== "ready"
      ) {
        throw new TypeError("Entity evidence response is outside the requested scope");
      }
      const result = Object.freeze({
        status: "ready",
        targetType: safeType,
        targetId: safeId,
        facts: Object.freeze(asArray(valueFor(raw, "facts")).map(adaptAssistedImportFact).filter(Boolean)),
        fromCache: false
      });
      cache.set(key, result);
      return result;
    } catch (error) {
      return Object.freeze({
        status: "unavailable",
        targetType: safeType,
        targetId: safeId,
        facts: Object.freeze([]),
        fromCache: false,
        error: error instanceof Error ? error : new Error("Imported evidence is unavailable")
      });
    } finally {
      if (inflight.get(key) === request) inflight.delete(key);
    }
  };
  return Object.freeze({
    load,
    invalidate(targetType, targetId) {
      cache.delete(`${text(targetType).toLowerCase()}:${text(targetId).toLowerCase()}`);
    },
    clear() {
      cache.clear();
      inflight.clear();
    }
  });
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const fallbackUuid = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
  const random = Math.floor(Math.random() * 16);
  return (character === "x" ? random : (random & 0x3) | 0x8).toString(16);
});

/** Builds the bounded command envelopes for verified exact-post attributions only. */
export function buildExactPostRefreshCommands(
  campaign,
  { limit = 100, idempotencyKeyFactory = () => globalThis.crypto?.randomUUID?.() || fallbackUuid() } = {}
) {
  const boundedLimit = Math.min(100, Math.max(0, Math.floor(Number(limit) || 0)));
  const eligible = [];
  const seenAttributions = new Set();
  let skippedIneligible = 0;
  for (const assignment of asArray(campaign?.assignments)) {
    const deliverables = asArray(assignment?.deliverables?.length ? assignment.deliverables : assignment?.deliverable);
    const deliverableById = new Map(deliverables.map((deliverable) => [deliverable?.id, deliverable]).filter(([id]) => id));
    for (const post of uniqueRecords(assignment?.posts, assignment?.post)) {
      const attributionId = text(post?.attributionId);
      if (attributionId && seenAttributions.has(attributionId)) continue;
      if (attributionId) seenAttributions.add(attributionId);
      const deliverable = deliverableById.get(post?.deliverableId);
      const normalizedPlatform = (value) => text(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
      const platformMatches = !deliverable?.platform || !post?.platform ||
        normalizedPlatform(deliverable.platform) === normalizedPlatform(post.platform);
      if (post?.verified !== true || !UUID_PATTERN.test(attributionId) || !deliverable || !platformMatches) {
        skippedIneligible += 1;
        continue;
      }
      eligible.push(attributionId);
    }
  }
  const selected = eligible.slice(0, boundedLimit);
  return {
    commands: selected.map((attributionId) => ({
      version: 1,
      operation: "social.post.refresh",
      idempotencyKey: idempotencyKeyFactory(attributionId),
      args: { attributionId, reason: "manual" }
    })),
    eligibleCount: eligible.length,
    skippedIneligible,
    skippedLimit: Math.max(0, eligible.length - selected.length)
  };
}
