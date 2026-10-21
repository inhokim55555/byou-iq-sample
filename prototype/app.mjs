import {portfolioRequest} from './portfolio-sample.mjs';
import {displayDate,displayDateTime} from './date-format.mjs';
import {installPageLoading} from './page-loading.mjs';
import { readDemoProfile, profileInitials, renderProfileSettings } from './profile-settings.mjs';
import { installInterfaceLanguage } from './ui-language.mjs';
import { installMaterialInputs } from './material-inputs.mjs';
const demoProfile = readDemoProfile(window.localStorage);
let interfaceLocale = demoProfile.locale;
let settingsTab = new URLSearchParams(window.location.search).get('settingsTab') === 'automations' || new URLSearchParams(window.location.search).get('view') === 'automations' ? 'automations' : 'profile';
let profileSaving = false, profileError = '', profileNotice = '';
const settingsStylesheet=document.createElement('link');settingsStylesheet.rel='stylesheet';settingsStylesheet.href='/settings.css';document.head.append(settingsStylesheet);
import {createSeedingCampaignTabs,renderSeedingNextStep} from './seeding-campaign-tabs.mjs';
import { createSeedingOutreachUI } from "./seeding-outreach-ui.mjs";
import { renderTrackifyLibrary } from "./trackify-library.mjs";
import { materialIcon } from "./material-icons.mjs";
import { captureFocusSnapshot, createModalFocusManager, restoreFocusSnapshot } from "./material-interactions.mjs";
// Email templates put the one-time hash in a fragment so it is never sent in a GET.
const passwordLinkParams = new URLSearchParams(window.location.hash.slice(1));
let pendingPasswordLink = ["invite", "recovery"].includes(passwordLinkParams.get("type"))
  && passwordLinkParams.has("token_hash")
  ? { tokenHash: passwordLinkParams.get("token_hash"), type: passwordLinkParams.get("type") } : null;
if (pendingPasswordLink) window.history.replaceState(null, "", window.location.pathname + window.location.search);
let passwordRecoveryMode = false;
let signupMode = false;
let pendingEmailConfirmation = passwordLinkParams.get("type") === "signup" && passwordLinkParams.has("token_hash")
  ? { tokenHash: passwordLinkParams.get("token_hash") } : null;
if (pendingEmailConfirmation) window.history.replaceState(null, "", window.location.pathname + window.location.search);

import {
  adaptWorkspaceRecords,
  buildExactPostRefreshCommands,
  canPerformWorkspaceAction,
  createAssistedImportEntityEvidenceLoader,
  createCampaignOperationsLoader,
  mergeCampaignOperationsView
} from "./workspace-adapter.mjs";
import { calculateCreatorWorkflowStatus, canApproveDeliverable } from "./workflow.mjs";
import { createHttpCrmGateway, createMemoryCrmGateway } from "./crm-operating-model.mjs";
import {
  CREATOR_RESEARCH_EXAMPLE,
  canRecordTopicEvidence,
  createCreatorResearchState,
  renderCreatorResearch,
  researchEvidenceDraftForVideo
} from "./creator-research.mjs";
import { renderPaidJourneys, installPaidJourneyUI, loadVisiblePaidJourneys, clearPaidJourneyCache, paidJourneyState, updateCampaignWorkflowPolicy } from "./campaign-workflow-ui.mjs";
import { createCreatorIntakeController } from './creator-intake.mjs';
import { renderCampaignEvidence } from "./campaign-evidence-ui.mjs";
import { createCreatorLibraryState, renderCreatorLibrary, creatorDisplayLabel } from "./creator-library.mjs";
import { toggleCreatorSelection, selectCreatorPage } from "./creator-selection.mjs";
import { prepareProfilePhoto } from "./creator-photo.mjs";
import { createCalendarState, renderCalendar, bindCalendar } from "./calendar.mjs";
import { createContractEditorPanel } from "./contract-editor.mjs";
const contractEditorPanel = createContractEditorPanel({beginLoading:()=>pageLoading.begin(),onAttach:(scope,file)=>campaignOps.attachContract(scope,file),notify:message=>showToast(message)});
import { createNegotiationState, renderNegotiation, bindNegotiation } from "./negotiation.mjs";
import { readCampaignViews, saveCampaignView, deleteCampaignView, readCreatorColumns, saveCreatorColumns, readCreatorViews, saveCreatorView, deleteCreatorView } from "./saved-filter-views.mjs";

const calendarStylesheet = document.createElement("link");
calendarStylesheet.rel = "stylesheet";
calendarStylesheet.href = "/calendar.css";
document.head.append(calendarStylesheet);
const negotiationStylesheet = document.createElement("link");
negotiationStylesheet.rel = "stylesheet";
negotiationStylesheet.href = "/negotiation.css";
document.head.append(negotiationStylesheet);
import { createCampaignEmailSettingsUI } from "./campaign-email-settings-ui.mjs";
import {createCampaignOperationsController} from './campaign-operations-controller.mjs';

const libraryStylesheet = document.createElement("link");
libraryStylesheet.rel = "stylesheet";
libraryStylesheet.href = "/creator-library.css";
document.head.append(libraryStylesheet);

const researchStylesheet = document.createElement("link");
researchStylesheet.rel = "stylesheet";
researchStylesheet.href = "/creator-research.css";
document.head.append(researchStylesheet);

const adminSummaryFixture = {};
const campaignFixtures = [];
const creatorFixtures = [];
const currentUserFixture = { id:"sample-editor",email:"alex.rivera@example.invalid",name: "Alex Rivera", role: "Administrator", initials: "AR", roles: ["admin","relationship_manager","campaign_manager","finance_admin"] };
const importRunFixtures = [];
const sourceFixtures = [];
const clientFixtures = [];
const contactFixtures = [];
const campaignContactRoleFixtures = [];
const clientCommercialTermFixtures = [];
const operationalAttentionFixtures = [];
const crmReportVersionFixtures = [];
const proposalFixtures = [];

const app = document.querySelector("#app");
const overlayRoot = document.querySelector("#overlay-root");
const toastRoot = document.querySelector("#toast-root");
const overlayFocusManager = createModalFocusManager({ root: overlayRoot, background: [app] });
const query = new URLSearchParams(window.location.search);
const libraryTabs=new Set(['overview','rates','content','activity','details']);
const libraryQuery=()=>new URLSearchParams(window.location.search);
const defaultView = "campaigns";
const validViews = new Set([
  "creators", "creator", "campaigns", "campaign", "finances", "shipments", "automations", "settings"
]);
const requestedView = query.get("view") === "home" ? defaultView : query.get("view") === "creator-research" ? "creators" : query.get("view");

const PRIVATE_WORKSPACE_KEYS = new Set([
  "address",
  "body",
  "email",
  "participants",
  "participant",
  "participantcount",
  "participantids",
  "phone",
  "snippet",
  "subject",
  "summary",
  "trackingnumber"
]);
const sanitizePrototypeWorkspace = (value) => {
  if (Array.isArray(value)) return value.map(sanitizePrototypeWorkspace);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !PRIVATE_WORKSPACE_KEYS.has(key.replace(/[^a-z0-9]/gi, "").toLowerCase()))
      .map(([key, entry]) => [key, sanitizePrototypeWorkspace(entry)])
  );
};

const approvedSubjectMetadata = (value) => {
  const normalized = String(value || "").trim();
  if (!normalized) return { valid: true, value: null };
  const containsContactDetail =
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(normalized) ||
    /(?:^|\D)(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}(?:\D|$)/.test(normalized);
  const valid = normalized.length <= 240 &&
    !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(normalized) &&
    !containsContactDetail;
  return { valid, value: valid ? normalized : null };
};

const state = {
  runtime: {
    phase: "checking",
    mode: "demo",
    message: "Checking the private workspace connection…"
  },
  csrfToken: null,
  currentUser: structuredClone(currentUserFixture),
  adminSummary: structuredClone(adminSummaryFixture),
  creators: structuredClone(creatorFixtures),
  view: validViews.has(requestedView) ? requestedView : defaultView,
  campaigns: sanitizePrototypeWorkspace(campaignFixtures),
  talentAgencies: [],
  talentManagers: [],
  sources: structuredClone(sourceFixtures),
  importRuns: structuredClone(importRunFixtures),
  selectedCreatorId: query.get("creator") || null,
  selectedSourceId: null,
  selectedCampaignId: query.get("campaign") || null,
  selectedTalentAgencyId: query.get("agency") || null,
  selectedTalentManagerId: query.get("manager") || null,
  selectedClientId: query.get("client") || null,
  selectedProposalId: query.get("proposal") || null,
  selectedReportId: query.get("report") || null,
  selectedReportVersionId: query.get("version") || null,
  creatorSearch: "",
  creatorResearch: createCreatorResearchState(),
  creatorLibrary: createCreatorLibraryState(),
  calendar: createCalendarState(),
  negotiation: createNegotiationState(),
  creatorCategory: "All categories",
  creatorPlatform: "All platforms",
  creatorWarehouse: "All Costco warehouses",
  creatorDistance: "Any distance",
  creatorSort: "recent",
  creatorPage: {
    loaded: false,
    loading: false,
    error: null,
    nextCursor: null,
    hasMore: false
  },
  creatorPickerLoading: false,
  creatorPickerLoaded: false,
  creatorPickerError: null,
  creatorDetailLoadingId: null,
  creatorDetailError: null,
  campaignPage: {
    loaded: false,
    loading: false,
    error: null,
    nextCursor: null,
    hasMore: false,
    total: null
  },
  campaignDetailLoadingId: null,
  campaignDetailError: null,
  costcoOverview: { items: [], loading: false, error: null, loaded: false },
  campaignSectionsExpanded: { Upcoming: true, Active: true },
  talentAgencySearch: "",
  talentAgencyPage: {
    loaded: false,
    loading: false,
    error: null,
    nextCursor: null,
    hasMore: false
  },
  talentManagerSearch: "",
  talentManagerPage: {
    loaded: false,
    loading: false,
    error: null,
    nextCursor: null,
    hasMore: false
  },
  representationDetailLoading: false,
  representationDetailError: null,
  campaignSearch: (query.get('campaignQ')||'').slice(0,100),
  videoLibrary: "trackify",
  videoOffset: 0,
  videoSearch: "",
  videoPlatform: "all",
  videoCampaignId: "all",
  videoTracking: {
    loaded: false,
    loading: false,
    error: null,
    summary: {},
    facets: { platforms: [], campaigns: [] },
    campaignOptions: [],
    items: [],
    refreshingPostIds: new Set(),
    reviewingPostIds: new Set(),
    confirmingPostId: null,
    actionMessageByPostId: new Map(),
    activationSha: "",
    connection: {
      loadingOptions: false,
      options: [],
      truncated: false,
      error: null,
      stage: "entry",
      selectedPlacementId: "",
      draftUrls: "",
      reviewUrls: [],
      idempotencyKey: null,
      saving: false,
      result: null
    },
    activation: { loading: false, result: null, error: null }
  },
  clientSearch: "",
  proposalSearch: "",
  campaignFilter: "All Campaigns",
  campaignTypeFilter: ["paid","seeding","affiliate","other"].includes(query.get('campaignType'))?query.get('campaignType'):"",
  campaignStatusFilter: ["planning","active","paused","closeout","completed","cancelled","archived"].includes(query.get('campaignStatus'))?query.get('campaignStatus'):"",
  rosterFilter: "All creators",
  rosterColumnSet: "operations",
  searchQuery: "",
  profileTab: query.get("profileTab") || "overview",
  campaignTab: query.get("campaignTab") || "summary",
  clientTab: "overview",
  activityUpdates: [],
  editingCreatorId: null,
  editingCampaignId: null,
  editingAssignmentId: null,
  editingPaymentApprovalRole: null,
  editingGmailThreadId: null,
  linkingGmailCreatorId: null,
  editingDeliverableId: null,
  editingSourceId: null,
  editingClientId: null,
  selectedTemplate: "Blank",
  reportVersions: [],
  activeImportId: "IMP-2607-PAID",
  drawer: null,
  editingClientContactId: null,
  editingClientRoleContactId: null,
  editingClientRoleCampaignId: null,
  editingCommercialCampaignId: null,
  editingAttentionId: null,
  editingProposalId: null,
  crm: {
    loading: false,
    error: null,
    revision: null,
    clients: [],
    contacts: [],
    campaignContacts: [],
    communications: [],
    attention: [],
    activity: [],
    reportDrafts: [],
    reportVersions: [],
    proposals: [],
    capabilities: {
      publicIntake: false,
      personalTasks: false,
      paymentExecution: false,
      mediaKitPublishing: false,
      proposalPublishing: false
    },
    clientViews: {},
    clientDetailLoadingId: null,
    clientDetailErrors: {},
    clientRequestVersions: {},
    campaignViews: {},
    campaignDetailErrors: {},
    proposalViews: {},
    reportPreviews: {},
    artifactReads: {},
    assistant: {
      loading: false,
      error: null,
      answer: null,
      questionId: "campaign.next-actions",
      campaignId: query.get("campaign") || null
    }
  },
  privateCreatorRecord: null,
  privateCreatorLoading: false,
  privateCreatorError: null,
  assistedImport: {
    loading: false,
    error: null,
    data: null,
    reviewPaging: {
      runId: null,
      limit: 25,
      facts: {
        decision: "pending_review",
        cursors: [null],
        pageIndex: 0,
        nextCursor: null
      },
      relationships: {
        decision: "pending_review",
        cursors: [null],
        pageIndex: 0,
        nextCursor: null
      },
      provisional: {
        cursors: [null],
        pageIndex: 0,
        nextCursor: null
      }
    },
    provisionalDetail: {
      targetType: null,
      targetId: null,
      displayLabel: null,
      loading: false,
      error: null,
      status: "not_loaded",
      facts: []
    },
    materialization: {
      factId: null,
      loading: false,
      error: null,
      options: null,
      query: "",
      requestId: 0
    },
    materializationHistory: {
      loading: false,
      error: null,
      items: [],
      loaded: false,
      query: ""
    },
    correction: {
      mapId: null,
      loading: false,
      error: null,
      options: null,
      query: "",
      requestId: 0,
      idempotencyKey: null
    },
    bulkResolution: {
      running: false,
      mode: null,
      processedFacts: 0,
      processedGroups: 0,
      createdProfiles: 0,
      acceptedFacts: 0,
      remaining: null,
      error: null
    }
  },
  createdReviewLinks: {},
  finder: {
    campaignId: query.get("campaign") || null,
    category: "All categories",
    platform: "All platforms",
    maxDistance: 25,
    maxFee: 7000,
    results: [],
    loading: false,
    error: null,
    hasMore: false
  }
};

const isLiveMode = () => false; // Public sample never enters a connected workspace.
const isLoopbackHost = () => ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
const REPORT_VERSION_STORAGE_KEY = "byouiq-demo-report-versions-v2";
const loadStoredReportVersions = () => {
  if (!isLoopbackHost()) return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(REPORT_VERSION_STORAGE_KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter((version) =>
      version &&
      typeof version.id === "string" &&
      typeof version.campaignId === "string" &&
      typeof version.html === "string" &&
      version.html.length <= 500_000
    );
  } catch {
    return [];
  }
};
const persistReportVersions = () => {
  if (!isLoopbackHost() || isLiveMode()) return;
  try {
    window.localStorage.setItem(REPORT_VERSION_STORAGE_KEY, JSON.stringify(state.reportVersions));
  } catch {
    showToast("This browser could not preserve the report version. Download the snapshot before leaving the page.");
  }
};
state.reportVersions = loadStoredReportVersions();
const LIVE_PERMISSION_KEYS = Object.freeze({
  update_campaign: "updateCampaign",
  update_deliverable: "updateDeliverable",
  update_payment: "updatePayment",
  update_reporting: "addReportingUpdate",
  verify_post: "verifyPost",
  link_gmail: "linkGmail",
  add_campaign_update: "addCampaignUpdate"
});
const canUseAction = (action, scopedRecord = null) => {
  if (!isLiveMode()) return canPerformWorkspaceAction(state.currentUser.roles, action);
  const permissionKey = LIVE_PERMISSION_KEYS[action];
  if (permissionKey && scopedRecord?.permissions && permissionKey in scopedRecord.permissions) {
    return scopedRecord.permissions[permissionKey] === true;
  }
  return canPerformWorkspaceAction(state.currentUser.roles, action);
};
const campaignUpdateTypeOptions = (campaign) => [
  ["deliverable", "Deliverable", canUseAction("update_deliverable", campaign)],
  ["payment", "Payment", canUseAction("update_payment", campaign)],
  ["creator_relationship", "Creator relationship", canUseAction("update_campaign", campaign)],
  ["reporting", "Reporting", canUseAction("update_reporting", campaign)],
  ["general", "General", canUseAction("update_campaign", campaign)]
].filter(([, , allowed]) => allowed);
const canLinkAnyGmail = () => state.campaigns.some((campaign) => canUseAction("link_gmail", campaign));
const canEditPrivateCreators = () => (state.currentUser.roles || []).some((role) =>
  ["admin", "relationship_manager", "campaign_manager", "Admin", "Relationship Manager", "Campaign Manager"].includes(role)
);
const normalizedCurrentRoles = () => {
  const roles = Array.isArray(state.currentUser.roles) && state.currentUser.roles.length
    ? state.currentUser.roles
    : [state.currentUser.role];
  return roles
    .filter(Boolean)
    .map((role) => String(role).toLowerCase().replaceAll(/[^a-z0-9]+/g, "_"));
};
const hasAuthenticatedManualCrmAccess = () => !isLiveMode() || Boolean(state.currentUser.id);
const canCreateManualCreator = () => hasAuthenticatedManualCrmAccess();
const canCreateManualCampaign = () => hasAuthenticatedManualCrmAccess();
const canEditManualCreator = (creator) => creator?.canEdit === true;
const canEditManualCampaign = (campaign) => campaign?.canEdit === true;
const canContinueCampaign = campaign => campaign?.canContinue === true;
const canManageContinuationCampaign = campaign => campaign?.canManageContinuation === true && String(campaign.status).toLowerCase() !== 'archived';
const canLinkCreatorGmail = creator => canEditManualCreator(creator) || creator?.canLinkGmail === true;
const canEditCreatorPrivateProfile = creator => canEditPrivateCreators() && (!isLiveMode() || creator?.canEditProfile === true || creator?.canEdit === true);
const canManageManualCampaignRoster = (campaign) => canEditManualCampaign(campaign) && campaign.canManageRoster === true && String(campaign.status).toLowerCase() !== "archived";
const canEditCampaignWorkflow = (campaign) => String(campaign?.status).toLowerCase() !== "archived" &&
  (canManageManualCampaignRoster(campaign) || campaign?.workflowActive === true);
const canEditManualAssignment = (campaign, assignment) =>
  canManageManualCampaignRoster(campaign) && assignment?.canEdit === true;
const canRecordPaymentApproval = (approvalRole) => normalizedCurrentRoles().includes(
  approvalRole === "ceo" ? "executive" : "finance_admin"
);
const renderPaymentApprovalActions = (assignment) => [["ceo", "CEO", assignment.payment?.ceoApproval], ["cfo", "CFO", assignment.payment?.cfoApproval]]
  .filter(([role, , status]) => canRecordPaymentApproval(role) && ["unknown", "pending"].includes(String(status || "Unknown").toLowerCase()))
  .map(([role, label]) => `<button class="text-button" data-action="open-payment-approval" data-id="${escapeHtml(assignment.id)}" data-role="${role}">Record ${label} decision</button>`)
  .join("");
const readOnlyAction = (label) => `<span class="role-readonly">${escapeHtml(label)}: read only for your role</span>`;

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatDate = value => displayDate(value,'UTC','Missing');

const formatCurrency = (value) =>
  Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
      }).format(value)
    : "Not recorded";

const formatCompact = (value) =>
  Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)
    : "Missing";

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

class StaleSessionError extends Error {
  constructor() {
    super("This response belongs to a previous staff session.");
    this.name = "StaleSessionError";
  }
}

let sessionEpoch = 0;

const assertCurrentSessionEpoch = (requestEpoch) => {
  if (requestEpoch !== sessionEpoch) throw new StaleSessionError();
};

const pageLoading = installPageLoading(document);
const requestJson = async (url, { method = "GET", body, csrf = false, background = false } = {}) => {
  const sample=await portfolioRequest(url,{method,body});if(sample!==undefined)return sample;
  const finishLoading = background || state.runtime.phase === "checking" ? () => {} : pageLoading.begin();
  try {
  const requestEpoch = sessionEpoch;
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (csrf && state.csrfToken) headers["X-CSRF-Token"] = state.csrfToken;
  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      credentials: "same-origin",
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw new ApiError(0, "The private workspace could not be reached.");
  }
  assertCurrentSessionEpoch(requestEpoch);
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    if (response.status !== 204) throw new ApiError(response.status, "The server returned an unreadable response.");
  }
  assertCurrentSessionEpoch(requestEpoch);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.error?.message || payload?.message || "The request could not be completed."
    );
  }
  return payload;
  } finally { finishLoading(); }
};

let crmGateway = null;
const artifactExpiryTimers = new Map();

const discardArtifactRead = (key) => {
  delete state.crm.artifactReads[key];
  const timer = artifactExpiryTimers.get(key);
  if (timer) window.clearTimeout(timer);
  artifactExpiryTimers.delete(key);
};

const discardAllArtifactReads = () => {
  for (const key of Object.keys(state.crm.artifactReads)) discardArtifactRead(key);
  for (const timer of artifactExpiryTimers.values()) window.clearTimeout(timer);
  artifactExpiryTimers.clear();
};

const clearCrmSensitiveState = () => {
  campaignOps.reset();
  sessionEpoch += 1;
  state.creatorResearch = createCreatorResearchState();
  importedCampaignActivation = { items: null, loading: false, error: '', busy: '' };
  state.creatorLibrary = createCreatorLibraryState();
  creatorRouteHydrated=false;
  state.calendar = createCalendarState();
  state.negotiation = createNegotiationState();
  state.campaignOutreachSelection=null;
  clearPaidJourneyCache();
  creatorLibraryRequestVersion += 1;
  discardAllArtifactReads();
  crmGateway = null;
  creatorCollectionRequestVersion += 1;
  creatorDetailRequestVersion += 1;
  campaignCollectionRequestVersion += 1;
  campaignDetailRequestVersion += 1;
  representationCollectionRequestVersion.talentAgencies += 1;
  representationCollectionRequestVersion.talentManagers += 1;
  representationDetailRequestVersion += 1;
  campaignOperationsRequestVersion.clear();
  campaignEmailSettings.clear();
  seedingOutreach.clear();seedingCampaignTabs.clear();
  campaignEntityEvidenceRequestVersion.clear();
  state.currentUser = { id: null, name: "", email: "", role: null, roles: [], initials: "" };
  state.adminSummary = null;
  state.creators = [];
  state.campaigns = [];
  state.talentAgencies = [];
  state.talentManagers = [];
  state.sources = [];
  state.importRuns = [];
  state.activityUpdates = [];
  state.reportVersions = [];
  state.privateCreatorRecord = null;
  state.privateCreatorLoading = false;
  state.privateCreatorError = null;
  state.creatorPage = { loaded: false, loading: false, error: null, nextCursor: null, hasMore: false };
  state.creatorPickerLoading = false;
  state.creatorPickerLoaded = false;
  state.creatorPickerError = null;
  state.creatorDetailLoadingId = null;
  state.creatorDetailError = null;
  state.campaignPage = { loaded: false, loading: false, error: null, nextCursor: null, hasMore: false, total: null };
  state.campaignDetailLoadingId = null;
  state.campaignDetailError = null;
  videoTrackingRequestVersion += 1;
  state.videoTracking = {
    loaded: false,
    loading: false,
    error: null,
    summary: {},
    facets: { platforms: [], campaigns: [] },
    campaignOptions: [],
    items: [],
    refreshingPostIds: new Set(),
    reviewingPostIds: new Set(),
    confirmingPostId: null,
    actionMessageByPostId: new Map(),
    activationSha: "",
    connection: {
      loadingOptions: false,
      options: [],
      truncated: false,
      error: null,
      stage: "entry",
      selectedPlacementId: "",
      draftUrls: "",
      reviewUrls: [],
      idempotencyKey: null,
      saving: false,
      result: null
    },
    activation: { loading: false, result: null, error: null }
  };
  state.talentAgencyPage = { loaded: false, loading: false, error: null, nextCursor: null, hasMore: false };
  state.talentManagerPage = { loaded: false, loading: false, error: null, nextCursor: null, hasMore: false };
  state.representationDetailLoading = false;
  state.representationDetailError = null;
  state.createdReviewLinks = {};
  const nextMaterializationRequestId = Number(state.assistedImport.materialization?.requestId || 0) + 1;
  const nextCorrectionRequestId = Number(state.assistedImport.correction?.requestId || 0) + 1;
  Object.assign(state.assistedImport, {
    loading: false,
    error: null,
    data: null,
    reviewPaging: {
      runId: null,
      limit: 25,
      facts: { decision: "pending_review", cursors: [null], pageIndex: 0, nextCursor: null },
      relationships: { decision: "pending_review", cursors: [null], pageIndex: 0, nextCursor: null },
      provisional: { cursors: [null], pageIndex: 0, nextCursor: null }
    },
    provisionalDetail: {
      targetType: null,
      targetId: null,
      displayLabel: null,
      loading: false,
      error: null,
      status: "not_loaded",
      facts: []
    },
    materialization: {
      factId: null,
      loading: false,
      error: null,
      options: null,
      query: "",
      requestId: nextMaterializationRequestId
    },
    materializationHistory: { loading: false, error: null, items: [], loaded: false, query: "" },
    correction: {
      mapId: null,
      loading: false,
      error: null,
      options: null,
      query: "",
      requestId: nextCorrectionRequestId,
      idempotencyKey: null
    },
    bulkResolution: {
      running: false,
      mode: null,
      processedFacts: 0,
      processedGroups: 0,
      createdProfiles: 0,
      acceptedFacts: 0,
      remaining: null,
      error: null
    }
  });
  Object.assign(state.crm, {
    loading: false,
    error: null,
    revision: null,
    clients: [],
    contacts: [],
    campaignContacts: [],
    attention: [],
    activity: [],
    reportDrafts: [],
    reportVersions: [],
    proposals: [],
    capabilities: {
      publicIntake: false,
      personalTasks: false,
      paymentExecution: false,
      mediaKitPublishing: false,
      proposalPublishing: false
    },
    clientViews: {},
    clientDetailLoadingId: null,
    clientDetailErrors: {},
    clientRequestVersions: {},
    campaignViews: {},
    campaignDetailErrors: {},
    proposalViews: {},
    reportPreviews: {},
    artifactReads: {},
    assistant: { loading: false, error: null, answer: null }
  });
};

const crmContext = () => ({
  actorId: state.currentUser.id || state.currentUser.name || "byou-staff",
  roles: Array.isArray(state.currentUser.roles) && state.currentUser.roles.length
    ? state.currentUser.roles
    : [state.currentUser.role || "relationship_manager"]
});

const slug = (value) => String(value || "record")
  .toLowerCase()
  .replaceAll(/[^a-z0-9]+/g, "-")
  .replaceAll(/(^-|-$)/g, "");

const demoCrmSeed = () => {
  const clients = structuredClone(clientFixtures.length ? clientFixtures : unique(
    state.campaigns.map((campaign) => campaign.client)
  ).map((name) => ({
    id: `client-${slug(name)}`,
    name,
    lifecycleStatus: "Active client",
    relationshipOwner: state.currentUser.name,
    brands: unique(state.campaigns.filter((campaign) => campaign.client === name).map((campaign) => campaign.brand))
      .map((brand) => ({ id: `brand-${slug(brand)}`, name: brand })),
    campaignIds: state.campaigns.filter((campaign) => campaign.client === name).map((campaign) => campaign.id),
    internalSummary: "Internal client record connected to BYOU campaign operations.",
    visibility: "Internal only"
  })));
  const clientForCampaign = (campaign) => clients.find((client) =>
    client.id === campaign.clientId ||
    (Array.isArray(client.campaignIds) && client.campaignIds.includes(campaign.id)) ||
    String(client.name).toLowerCase() === String(campaign.client).toLowerCase()
  );
  const latestTerms = (campaignId) => clientCommercialTermFixtures
    .filter((item) => item.campaignId === campaignId)
    .sort((left, right) => Number(right.version || 0) - Number(left.version || 0))[0];
  const campaigns = structuredClone(state.campaigns).map((campaign) => {
    const client = clientForCampaign(campaign);
    const brand = client?.brands?.find((item) => item.name === campaign.brand);
    const terms = latestTerms(campaign.id);
    return {
      ...campaign,
      clientId: campaign.clientId || client?.id || `client-${slug(campaign.client)}`,
      brandId: campaign.brandId || brand?.id || `brand-${slug(campaign.brand)}`,
      clientCommercialTerms: terms ? {
        id: terms.id,
        state: String(terms.status || "proposed").toLowerCase(),
        amount: Number(terms.contractValue?.amount),
        currency: terms.contractValue?.currency || "USD",
        effectiveOn: terms.effectiveOn || null,
        externalAccountingReference: terms.externalAccountingReference || null,
        evidence: terms.evidence ? [{
          recordId: terms.id,
          label: terms.evidence.type || "Verified client commercial terms",
          sourceDate: terms.evidence.verifiedAt?.slice?.(0, 10) || terms.effectiveOn || null
        }] : []
      } : campaign.clientCommercialTerms
    };
  });
  const contacts = structuredClone(contactFixtures).map((contact) => ({
    ...contact,
    displayName: contact.displayName || contact.name,
    note: contact.note || contact.internalNote || null,
    restrictedMethods: contact.restrictedMethods || {
      availability: contact.restrictedContactMethods?.length ? "available_in_restricted_record" : "not_recorded"
    }
  }));
  const campaignContacts = structuredClone(campaignContactRoleFixtures).map((role) => ({
    ...role,
    roles: (role.roles || []).map((value) => ({
      "Primary client contact": "client_contact",
      "Commercial terms contact": "billing_contact",
      "Creative approver": "approver",
      "Reporting approver": "approver",
      "Proposal recipient": "client_contact"
    })[value] || String(value).toLowerCase().replaceAll(/[^a-z0-9]+/g, "_") )
  }));
  const attention = structuredClone(operationalAttentionFixtures.length
    ? operationalAttentionFixtures
    : state.activityUpdates.map((item) => ({
        id: `attention-${item.id}`,
        campaignId: item.campaignId,
        reason: `${item.type}: ${item.status}`,
        nextAction: item.nextAction,
        owner: item.nextOwner || item.owner,
        dueAt: item.dueDate ? `${item.dueDate}T17:00:00Z` : null,
        severity: "normal",
        status: "open"
      }))).map((item) => ({
        ...item,
        reason: item.reason || `${item.type || "Operational"} attention`,
        owner: item.owner || item.nextOwner || "Unassigned",
        dueAt: item.dueAt || (item.dueDate ? `${item.dueDate}T17:00:00Z` : null),
        status: String(item.status || "open").toLowerCase() === "resolved" ? "resolved" : "open",
        severity: String(item.severity || "normal").toLowerCase()
      }));
  const activity = state.activityUpdates.map((item) => {
    const campaign = campaigns.find((candidate) => candidate.id === item.campaignId);
    return {
      id: item.id,
      clientId: campaign?.clientId || null,
      campaignId: item.campaignId,
      actorId: item.owner || state.currentUser.name,
      type: String(item.type || "campaign.update").toLowerCase().replaceAll(" ", "."),
      summary: item.note || item.status,
      occurredAt: item.createdAt ? `${item.createdAt}T12:00:00Z` : new Date().toISOString()
    };
  });
  const reportVersions = structuredClone(crmReportVersionFixtures)
    .filter((version) => version.immutable !== false && version.mode !== "Live internal preview")
    .map((version) => ({
      ...version,
      artifact: "report",
      expiresAt: version.expiresAt || version.shareAccess?.expiresAt || null,
      revokedAt: version.revokedAt || version.shareAccess?.revokedAt || null,
      branding: version.branding || "BYOU + client",
      modules: version.modules || version.visibleSections || [],
      metrics: version.metrics || [],
      contentFingerprint: version.contentFingerprint || version.fingerprint,
      snapshot: version.snapshot || {
        campaign: { id: version.campaignId },
        evidenceCoverage: version.evidenceCoverage,
        generatedFromRevision: version.snapshotAsOf
      }
    }));
  const proposals = structuredClone(proposalFixtures).map((proposal) => {
    const draftTerms = proposal.currentDraft?.proposedCommercialTerms;
    const latestPublishedTerms = proposal.publishedVersions?.at(-1)?.proposedCommercialTerms;
    return {
      ...proposal,
      status: /draft/i.test(proposal.status || "") ? "Draft" : proposal.status,
      assignmentIds: proposal.assignmentIds || proposal.selectedAssignmentIds || [],
      proposedClientValue: proposal.proposedClientValue ?? draftTerms?.amount ?? latestPublishedTerms?.amount ?? null,
      currency: proposal.currency || draftTerms?.currency || latestPublishedTerms?.currency || "USD",
      updatedAt: proposal.updatedAt || proposal.currentDraft?.updatedAt || proposal.publishedVersions?.at(-1)?.publishedAt || null,
      versions: (proposal.versions || proposal.publishedVersions || []).map((version) => ({
        ...version,
        artifact: "proposal",
        proposalId: proposal.id,
        campaignId: proposal.campaignId,
        expiresAt: version.expiresAt || version.shareAccess?.expiresAt || null,
        revokedAt: version.revokedAt || version.shareAccess?.revokedAt || null,
        contentFingerprint: version.contentFingerprint || version.fingerprint,
        snapshot: version.snapshot || {
          title: proposal.title,
          campaign: { id: proposal.campaignId, name: state.campaigns.find((item) => item.id === proposal.campaignId)?.name },
          creators: (version.selectedCreatorIds || proposal.selectedCreatorIds || []).map((creatorId) => {
            const creator = state.creators.find((item) => item.id === creatorId);
            return { creatorId, displayName: creatorDisplayName(creator), handle: creator?.handle || null };
          }),
          proposedClientValue: version.proposedCommercialTerms?.amount ?? draftTerms?.amount ?? null,
          currency: version.proposedCommercialTerms?.currency || draftTerms?.currency || "USD"
        }
      }))
    };
  });
  return {
    revision: 1,
    clients,
    contacts,
    campaignContacts,
    campaigns,
    creators: structuredClone(state.creators),
    attention,
    activity,
    reportVersions,
    proposals
  };
};

const normalizedCrmOutcome = (outcome) => {
  if (outcome?.ok === true || outcome?.ok === false) return outcome;
  if (outcome && Object.prototype.hasOwnProperty.call(outcome, "data")) {
    return { ok: true, data: outcome.data };
  }
  return { ok: true, data: outcome };
};

const crmView = async (request) => {
  if (!crmGateway) throw new Error("The internal CRM gateway is not ready.");
  const outcome = normalizedCrmOutcome(await crmGateway.view(request, crmContext()));
  if (!outcome.ok) throw new Error(outcome.error?.message || "The internal CRM view is unavailable.");
  return outcome.data;
};

const crmAct = async (command) => {
  if (!crmGateway) throw new Error("The internal CRM gateway is not ready.");
  const outcome = normalizedCrmOutcome(await crmGateway.act(command, crmContext()));
  if (!outcome.ok) throw new Error(outcome.error?.message || "The internal CRM action was rejected.");
  return outcome.data;
};

const upsertById = (items, value) => {
  if (!value?.id) return items;
  const index = items.findIndex((item) => item.id === value.id);
  if (index >= 0) items[index] = value;
  else items.unshift(value);
  return items;
};

const normalizeCrmContact = (contact, { clientId = null, campaignId = null } = {}) => ({
  ...contact,
  clientId: contact?.clientId || clientId,
  campaignRoles: Array.isArray(contact?.campaignRoles)
    ? contact.campaignRoles
    : Array.isArray(contact?.roles)
      ? contact.roles.map((role) => ({ campaignId, role }))
      : []
});

const normalizeCrmClient = (client) => ({
  ...client,
  relationshipOwner: client?.relationshipOwner || client?.owner || null,
  campaignIds: Array.isArray(client?.campaignIds)
    ? client.campaignIds
    : Array.isArray(client?.campaigns)
      ? client.campaigns.map((campaign) => campaign.id).filter(Boolean)
      : [],
  contacts: Array.isArray(client?.contacts)
    ? client.contacts.map((contact) => normalizeCrmContact(contact, { clientId: client.id }))
    : client?.contacts,
  communications: Array.isArray(client?.communications) ? client.communications : []
});

const normalizeCrmCampaignView = (campaign) => ({
  ...campaign,
  communications: Array.isArray(campaign?.communications) ? campaign.communications : [],
  contacts: Array.isArray(campaign?.contacts)
    ? campaign.contacts.map((contact) => normalizeCrmContact(contact, {
        clientId: campaign.clientId,
        campaignId: campaign.id
      }))
    : []
});

const applyCrmBootstrap = (data = {}) => {
  state.crm.revision = data.revision ?? state.crm.revision;
  state.crm.clients = Array.isArray(data.clients) ? data.clients.map(normalizeCrmClient) : state.crm.clients;
  state.crm.contacts = Array.isArray(data.contacts) ? data.contacts.map((contact) => normalizeCrmContact(contact)) : state.crm.contacts;
  state.crm.campaignContacts = Array.isArray(data.campaignContacts) ? data.campaignContacts : state.crm.campaignContacts;
  state.crm.communications = Array.isArray(data.communications) ? data.communications : state.crm.communications;
  state.crm.attention = Array.isArray(data.attention) ? data.attention : state.crm.attention;
  state.crm.activity = Array.isArray(data.activity) ? data.activity : state.crm.activity;
  state.crm.reportDrafts = Array.isArray(data.reportDrafts) ? data.reportDrafts : state.crm.reportDrafts;
  state.crm.reportVersions = Array.isArray(data.reportVersions) ? data.reportVersions : state.crm.reportVersions;
  state.crm.proposals = Array.isArray(data.proposals) ? data.proposals : state.crm.proposals;
  state.crm.capabilities = { ...state.crm.capabilities, ...(data.capabilities || {}) };
  state.crm.clientViews = Object.fromEntries(state.crm.clients.map((client) => [client.id, client]));
  state.crm.clientDetailLoadingId = null;
  state.crm.clientDetailErrors = {};
  state.crm.clientRequestVersions = {};
  state.crm.proposalViews = Object.fromEntries(state.crm.proposals.map((proposal) => [proposal.id, proposal]));
  state.crm.campaignViews = {};
  state.crm.reportPreviews = {};
  const listedArtifactVersions = new Map([
    ...state.crm.reportVersions.map((version) => [`report:${version.id}`, version]),
    ...state.crm.proposals.flatMap((proposal) => (proposal.versions || []).map((version) => [`proposal:${version.id}`, version]))
  ]);
  for (const key of Object.keys(state.crm.artifactReads)) {
    const metadata = listedArtifactVersions.get(key);
    if (artifactVersionUnavailable(metadata)) discardArtifactRead(key);
  }
  if (!state.selectedClientId) state.selectedClientId = state.crm.clients[0]?.id || null;
  if (!state.selectedProposalId) state.selectedProposalId = state.crm.proposals[0]?.id || null;
};

const applyCrmViewUpdates = (receipt = {}) => {
  state.crm.revision = receipt.revision ?? state.crm.revision;
  for (const update of Array.isArray(receipt.viewUpdates) ? receipt.viewUpdates : []) {
    if (!update?.key) continue;
    if (update.key === "attention") {
      state.crm.attention = Array.isArray(update.value)
        ? update.value
        : Array.isArray(update.value?.items)
          ? update.value.items
          : state.crm.attention;
    }
    else if (update.key === "activity") {
      state.crm.activity = Array.isArray(update.value)
        ? update.value
        : Array.isArray(update.value?.items)
          ? update.value.items
          : state.crm.activity;
    }
    else if (update.key.startsWith("client:")) {
      const client = normalizeCrmClient(update.value);
      state.crm.clientViews[update.key.slice(7)] = client;
      upsertById(state.crm.clients, client);
      if (Array.isArray(client?.contacts)) {
        state.crm.contacts = state.crm.contacts.filter((contact) => contact.clientId !== client.id);
        state.crm.contacts.push(...client.contacts);
      }
    } else if (update.key.startsWith("campaign:")) {
      state.crm.campaignViews[update.key.slice(9)] = normalizeCrmCampaignView(update.value);
    } else if (update.key.startsWith("commercial:")) {
      const campaignId = update.key.slice(11);
      state.crm.campaignViews[campaignId] = {
        ...(state.crm.campaignViews[campaignId] || {}),
        commercial: update.value
      };
    } else if (update.key.startsWith("report-preview:")) {
      state.crm.reportPreviews[update.key.slice(15)] = update.value;
      const draft = update.value?.draftConfiguration;
      if (draft?.campaignId) upsertById(state.crm.reportDrafts, { id: draft.campaignId, ...draft });
    } else if (update.key.startsWith("report-draft:")) {
      const draft = update.value;
      if (draft?.campaignId) upsertById(state.crm.reportDrafts, { id: draft.campaignId, ...draft });
    } else if (update.key.startsWith("proposal-version:")) {
      const proposal = state.crm.proposals.find((item) => item.id === update.value?.proposalId);
      if (proposal) {
        proposal.versions ||= [];
        upsertById(proposal.versions, update.value);
      }
      if (update.value?.revokedAt) discardArtifactRead(`proposal:${update.value.id}`);
    } else if (update.key.startsWith("proposal:")) {
      state.crm.proposalViews[update.key.slice(9)] = update.value;
      upsertById(state.crm.proposals, update.value);
    } else if (update.key.startsWith("report-version:")) {
      upsertById(state.crm.reportVersions, update.value);
      if (update.value?.revokedAt) discardArtifactRead(`report:${update.value.id}`);
    }
  }
};

const initializeCrm = async () => {
  state.crm.loading = true;
  state.crm.error = null;
  try {
    crmGateway = isLiveMode()
      ? createHttpCrmGateway({ requestJson })
      : createMemoryCrmGateway(demoCrmSeed(), { proposalPublishing: true });
    applyCrmBootstrap(await crmView({ view: "bootstrap" }));
  } catch (error) {
    state.crm.error = error instanceof Error ? error.message : "The internal CRM workspace is unavailable.";
  } finally {
    state.crm.loading = false;
  }
};

const loadCrmClient = async (clientId) => {
  if (!clientId || !crmGateway) return null;
  const requestVersion = (state.crm.clientRequestVersions[clientId] || 0) + 1;
  state.crm.clientRequestVersions[clientId] = requestVersion;
  state.crm.clientDetailLoadingId = clientId;
  delete state.crm.clientDetailErrors[clientId];
  if (state.view === "client" && state.selectedClientId === clientId) render();
  try {
    const client = normalizeCrmClient(await crmView({ view: "client", clientId }));
    if (state.crm.clientRequestVersions[clientId] !== requestVersion) return null;
    state.crm.error = null;
    state.crm.clientViews[clientId] = client;
    upsertById(state.crm.clients, client);
    if (Array.isArray(client.contacts)) {
      state.crm.contacts = state.crm.contacts.filter((contact) => contact.clientId !== clientId);
      state.crm.contacts.push(...client.contacts);
    }
    delete state.crm.clientDetailErrors[clientId];
    return client;
  } catch (error) {
    if (state.crm.clientRequestVersions[clientId] !== requestVersion) return null;
    delete state.crm.clientViews[clientId];
    state.crm.clientDetailErrors[clientId] = error instanceof Error
      ? error.message
      : "The client record could not be loaded.";
    return null;
  } finally {
    if (state.crm.clientRequestVersions[clientId] === requestVersion) {
      if (state.crm.clientDetailLoadingId === clientId) state.crm.clientDetailLoadingId = null;
      if (state.view === "client" && state.selectedClientId === clientId) render();
    }
  }
};

const loadCrmCampaign = async (campaignId) => {
  if (!campaignId || isCostcoOverviewCampaignId(campaignId) || !crmGateway) return null;
  try {
    const campaign = normalizeCrmCampaignView(await crmView({ view: "campaign", campaignId }));
    state.crm.campaignViews[campaignId] = campaign;
    delete state.crm.campaignDetailErrors[campaignId];
    render();
    return campaign;
  } catch (error) {
    delete state.crm.campaignViews[campaignId];
    state.crm.campaignDetailErrors[campaignId] = error instanceof Error
      ? error.message
      : "The campaign relationship record could not be loaded.";
    if (state.view === "campaign" && state.selectedCampaignId === campaignId) render();
    return null;
  }
};

const loadCrmProposal = async (proposalId) => {
  if (!proposalId || !crmGateway) return null;
  try {
    const proposal = await crmView({ view: "proposal", proposalId });
    state.crm.error = null;
    state.crm.proposalViews[proposalId] = proposal;
    upsertById(state.crm.proposals, proposal);
    render();
    return proposal;
  } catch (error) {
    delete state.crm.proposalViews[proposalId];
    state.crm.proposals = state.crm.proposals.filter((proposal) => proposal.id !== proposalId);
    state.crm.error = error instanceof Error ? error.message : "The proposal could not be loaded.";
    render();
    return null;
  }
};

const applySavedReportDraft = (preview) => {
  const draft = preview?.draftConfiguration;
  if (!draft || !Array.isArray(draft.modules) || !Array.isArray(draft.metrics)) return;
  const savedModules = draft.modules.filter((module) => reportBuilderModules.includes(module));
  state.reportModuleOrder = [
    ...savedModules,
    ...reportBuilderModules.filter((module) => !savedModules.includes(module))
  ];
  state.reportModuleVisibility = Object.fromEntries(
    reportBuilderModules.map((module) => [module, savedModules.includes(module)])
  );
  state.reportMetricVisibility = Object.fromEntries(
    reportBuilderMetrics.map((metric) => [metric, draft.metrics.includes(metric)])
  );
  if (["BYOU + client", "BYOU only", "Client only"].includes(draft.branding)) {
    state.reportBuilderBranding = draft.branding;
  }
};

const loadCrmReportPreview = async (campaignId) => {
  if (!campaignId || !crmGateway) return null;
  try {
    const preview = await crmView({ view: "artifact-preview", artifact: "report", campaignId });
    state.crm.reportPreviews[campaignId] = preview;
    applySavedReportDraft(preview);
    render();
    return preview;
  } catch {
    return null;
  }
};

const artifactReadKey = (artifact, versionId) => `${artifact}:${versionId}`;

const artifactVersionMetadata = (artifact, versionId) => {
  if (artifact === "report") return state.crm.reportVersions.find((version) => version.id === versionId) || null;
  if (artifact === "proposal") {
    return state.crm.proposals
      .flatMap((proposal) => proposal.versions || [])
      .find((version) => version.id === versionId) || null;
  }
  return null;
};

const artifactExpiryTimestamp = (expiresAt) => Date.parse(
  String(expiresAt || "").length === 10 ? `${expiresAt}T23:59:59Z` : expiresAt
);

const artifactVersionUnavailable = (metadata) => Boolean(
  !metadata
  || metadata.revokedAt
  || (metadata.expiresAt && artifactExpiryTimestamp(metadata.expiresAt) <= Date.now())
);

const scheduleArtifactExpiry = (artifact, metadata) => {
  if (!metadata?.id || !metadata.expiresAt) return;
  const key = artifactReadKey(artifact, metadata.id);
  const existing = artifactExpiryTimers.get(key);
  if (existing) window.clearTimeout(existing);
  const expire = () => {
    const remaining = artifactExpiryTimestamp(metadata.expiresAt) - Date.now();
    if (remaining > 0) {
      artifactExpiryTimers.set(key, window.setTimeout(expire, Math.min(remaining, 2_147_000_000)));
      return;
    }
    discardArtifactRead(key);
    render();
  };
  expire();
};

const loadCrmArtifactVersion = async (artifact, versionId) => {
  if (!versionId || !crmGateway) return null;
  const metadata = artifactVersionMetadata(artifact, versionId);
  const key = artifactReadKey(artifact, versionId);
  if (artifactVersionUnavailable(metadata)) {
    discardArtifactRead(key);
    render();
    return null;
  }
  state.crm.artifactReads[key] = { status: "loading", data: null, error: null };
  render();
  try {
    const data = await crmView({ view: "artifact-version", artifact, versionId });
    state.crm.artifactReads[key] = { status: "ready", data, error: null };
    scheduleArtifactExpiry(artifact, metadata);
    render();
    return data;
  } catch (error) {
    state.crm.artifactReads[key] = {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : "This version could not be opened."
    };
    render();
    return null;
  }
};

let artifactRevalidationPromise = null;
const revalidateOpenedArtifactAccess = async () => {
  if (
    artifactRevalidationPromise
    || !isLiveMode()
    || state.runtime.phase !== "ready"
    || !crmGateway
    || Object.keys(state.crm.artifactReads).length === 0
  ) return artifactRevalidationPromise;
  artifactRevalidationPromise = (async () => {
    try {
      applyCrmBootstrap(await crmView({ view: "bootstrap" }));
      if (state.view === "report" && state.selectedReportVersionId) {
        await loadCrmArtifactVersion("report", state.selectedReportVersionId);
      } else {
        render();
      }
    } catch {
      discardAllArtifactReads();
      render();
    } finally {
      artifactRevalidationPromise = null;
    }
  })();
  return artifactRevalidationPromise;
};

const crmExpectedRevisionForCommand = (command) => {
  const knownRevision = (...values) => {
    const value = values.find((candidate) => Number.isInteger(Number(candidate)));
    return value === undefined ? null : Number(value);
  };
  const clientRevision = (clientId) => knownRevision(
    state.crm.clientViews[clientId]?.revision,
    state.crm.clients.find((client) => client.id === clientId)?.revision
  );
  const contactRevision = (contactId) => knownRevision(
    state.crm.contacts.find((contact) => contact.id === contactId)?.revision,
    ...Object.values(state.crm.clientViews).map((client) =>
      client?.contacts?.find((contact) => contact.id === contactId)?.revision
    )
  );
  const campaignRevision = (campaignId) => knownRevision(
    state.crm.campaignViews[campaignId]?.revision,
    ...Object.values(state.crm.clientViews).map((client) =>
      client?.campaigns?.find((campaign) => campaign.id === campaignId)?.revision
    ),
    state.campaigns.find((campaign) => campaign.id === campaignId)?.revision
  );
  const attentionRevision = (attentionId) => knownRevision(
    state.crm.attention.find((item) => item.id === attentionId)?.revision
  );
  const proposalRevision = (proposalId) => knownRevision(
    state.crm.proposalViews[proposalId]?.revision,
    state.crm.proposals.find((proposal) => proposal.id === proposalId)?.revision
  );
  const reportVersion = (versionId) => state.crm.reportVersions.find((version) => version.id === versionId)
    || state.reportVersions.find((version) => version.id === versionId);
  const proposalForVersion = (versionId) => state.crm.proposals.find((proposal) =>
    (proposal.versions || []).some((version) => version.id === versionId)
  );

  let revision = null;
  let requiresExistingRevision = true;
  if (command.command === "client.save") {
    requiresExistingRevision = Boolean(command.client?.id);
    revision = requiresExistingRevision ? clientRevision(command.client.id) : null;
  } else if (command.command === "contact.save") {
    requiresExistingRevision = Boolean(command.contact?.id);
    revision = requiresExistingRevision ? contactRevision(command.contact.id) : null;
  } else if (["campaign-contact-role.set", "client-commercial-terms.record"].includes(command.command)) {
    revision = campaignRevision(command.campaignId);
  } else if (["attention.set-next-action", "attention.resolve"].includes(command.command)) {
    revision = attentionRevision(command.attentionId);
  } else if (["artifact.save-draft", "artifact.publish"].includes(command.command)) {
    revision = campaignRevision(command.campaignId);
  } else if (command.command === "proposal.save-draft") {
    revision = command.proposalId
      ? proposalRevision(command.proposalId)
      : campaignRevision(command.campaignId);
  } else if (["proposal.publish", "proposal.record-outcome"].includes(command.command)) {
    revision = proposalRevision(command.proposalId);
  } else if (command.command === "artifact.revoke") {
    if (command.artifact === "report") {
      revision = campaignRevision(reportVersion(command.versionId)?.campaignId);
    } else if (command.artifact === "proposal") {
      revision = proposalRevision(proposalForVersion(command.versionId)?.id);
    }
  } else {
    throw new Error("This CRM action does not have a revision policy.");
  }

  if (requiresExistingRevision && revision === null) {
    throw new Error("Refresh this record before changing it so BYOU IQ can verify its latest version.");
  }
  return revision;
};

const runCrmAction = async (command, successMessage, { closeDrawer = true } = {}) => {
  try {
    const expectedRevision = Object.prototype.hasOwnProperty.call(command, "expectedRevision")
      ? command.expectedRevision
      : isLiveMode() ? crmExpectedRevisionForCommand(command) : state.crm.revision;
    const receipt = await crmAct({
      ...command,
      commandId: command.commandId || crypto.randomUUID(),
      expectedRevision
    });
    applyCrmViewUpdates(receipt);
    if (closeDrawer) state.drawer = null;
    render();
    showToast(successMessage);
    return receipt;
  } catch (error) {
    showToast(`Nothing was changed. ${error instanceof Error ? error.message : "The internal CRM action was rejected."}`);
    return null;
  }
};

const revokeCrmArtifact = async (control) => {
  const receipt = await runCrmAction({
    command: "artifact.revoke",
    artifact: control.dataset.artifact,
    versionId: control.dataset.version,
    reason: "Revoked by authorized BYOU staff from the internal workspace."
  }, "Version revoked.");
  if (receipt) {
    try {
      applyCrmBootstrap(await crmView({ view: "bootstrap" }));
      render();
    } catch {
      showToast("The version was revoked, but the refreshed list is temporarily unavailable.");
    }
  }
  return receipt;
};

const loadCurrentCrmRoute = () => {
  if (state.view === "client" && state.selectedClientId) void loadCrmClient(state.selectedClientId);
  if (state.view === "campaign" && state.selectedCampaignId) void loadCrmCampaign(state.selectedCampaignId);
  if (state.view === "proposal" && state.selectedProposalId) void loadCrmProposal(state.selectedProposalId);
  if (state.view === "report") {
    if (state.selectedReportVersionId) void loadCrmArtifactVersion("report", state.selectedReportVersionId);
    else {
      const campaign = reportCampaign(state.selectedReportId);
      if (campaign) void loadCrmReportPreview(campaign.id);
    }
  }
};

const assistedImportIsBusy = () => Boolean(
  state.assistedImport.loading
  || state.assistedImport.bulkResolution.running
  || state.assistedImport.provisionalDetail.loading
);

const waitForAssistedImportRetry = (attempt) => new Promise((resolve) => {
  window.setTimeout(resolve, Math.min(8_000, 750 * (2 ** attempt)));
});

const requestAssistedImportBulkBatch = async (body) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await requestJson("/api/import-sync", {
        method: "POST",
        body,
        csrf: true
      });
    } catch (error) {
      const retryable = error instanceof ApiError
        && [0, 429, 502, 503, 504].includes(error.status);
      if (!retryable || attempt === 4) throw error;
      await waitForAssistedImportRetry(attempt);
    }
  }
  throw new ApiError(0, "The import batch could not be completed.");
};

const resetAssistedImportReviewPaging = (runId = null) => {
  state.assistedImport.reviewPaging = {
    runId,
    limit: 25,
    facts: {
      decision: "pending_review",
      cursors: [null],
      pageIndex: 0,
      nextCursor: null
    },
    relationships: {
      decision: "pending_review",
      cursors: [null],
      pageIndex: 0,
      nextCursor: null
    },
    provisional: {
      cursors: [null],
      pageIndex: 0,
      nextCursor: null
    }
  };
  state.assistedImport.provisionalDetail = {
    targetType: null,
    targetId: null,
    displayLabel: null,
    loading: false,
    error: null,
    status: "not_loaded",
    facts: []
  };
};

const assistedImportReviewPath = ({ provisionalDetail = null } = {}) => {
  const paging = state.assistedImport.reviewPaging;
  if (!paging.runId) return "/api/import-sync";
  const params = new URLSearchParams({
    runId: paging.runId,
    factDecision: paging.facts.decision,
    relationshipDecision: paging.relationships.decision,
    limit: String(paging.limit)
  });
  const factCursor = paging.facts.cursors[paging.facts.pageIndex];
  const relationshipCursor = paging.relationships.cursors[paging.relationships.pageIndex];
  const provisionalCursor = paging.provisional.cursors[paging.provisional.pageIndex];
  if (factCursor) params.set("factCursor", factCursor);
  if (relationshipCursor) params.set("relationshipCursor", relationshipCursor);
  if (provisionalCursor) params.set("provisionalCursor", provisionalCursor);
  if (provisionalDetail?.targetType && provisionalDetail?.targetId) {
    params.set("provisionalDetailType", provisionalDetail.targetType);
    params.set("provisionalDetailId", provisionalDetail.targetId);
  }
  return `/api/import-sync?${params}`;
};

const captureAssistedImportReviewPage = (data) => {
  if (!data || typeof data !== "object") return;
  const paging = state.assistedImport.reviewPaging;
  if (data.reviewPage && typeof data.reviewPage === "object") {
    paging.facts.nextCursor = data.reviewPage.nextCursor || null;
  }
  if (data.relationshipReview && typeof data.relationshipReview === "object") {
    paging.relationships.nextCursor = data.relationshipReview.nextCursor || null;
  }
  if (data.provisionalEntities && typeof data.provisionalEntities === "object") {
    paging.provisional.nextCursor = data.provisionalEntities.nextCursor || null;
  }
};

const requestAssistedImportStatus = async ({ refreshRun = false } = {}) => {
  let payload;
  if (refreshRun || !state.assistedImport.reviewPaging.runId) {
    payload = await requestJson("/api/import-sync");
    const runId = payload?.data?.currentRun?.runId || null;
    if (refreshRun || runId !== state.assistedImport.reviewPaging.runId) {
      resetAssistedImportReviewPaging(runId);
    }
    if (runId) {
      try {
        payload = await requestJson(assistedImportReviewPath());
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 502) throw error;
      }
    }
  } else {
    try {
      payload = await requestJson(assistedImportReviewPath());
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 502) throw error;
      payload = await requestJson("/api/import-sync");
    }
  }
  captureAssistedImportReviewPage(payload?.data);
  return payload;
};

const loadAssistedImportStatus = async ({ refreshRun = true } = {}) => {
  if (!isLiveMode() || state.assistedImport.bulkResolution.running) return;
  state.assistedImport.loading = true;
  state.assistedImport.error = null;
  renderOverlay();
  try {
    const payload = await requestAssistedImportStatus({ refreshRun });
    state.assistedImport.data = payload?.data ?? null;
  } catch (error) {
    state.assistedImport.data = null;
    state.assistedImport.error = error instanceof Error
      ? error.message
      : "Import & Sync status could not be loaded.";
  } finally {
    state.assistedImport.loading = false;
    renderOverlay();
  }
};

const setAssistedImportReviewFilter = (queueName, decision) => {
  if (assistedImportIsBusy()) return;
  if (!["facts", "relationships"].includes(queueName)) return;
  const allowed = queueName === "facts"
    ? new Set(["pending_review", "eligible_for_apply"])
    : new Set(["pending_review", "eligible_for_apply", "accepted_unmaterialized"]);
  const page = state.assistedImport.reviewPaging[queueName];
  if (!page || !allowed.has(decision) || page.decision === decision) return;
  page.decision = decision;
  page.cursors = [null];
  page.pageIndex = 0;
  page.nextCursor = null;
  void loadAssistedImportStatus({ refreshRun: false });
};

const moveAssistedImportReviewPage = (queueName, direction) => {
  if (assistedImportIsBusy()) return;
  if (!["facts", "relationships"].includes(queueName)) return;
  const page = state.assistedImport.reviewPaging[queueName];
  if (!page || !["next", "previous"].includes(direction)) return;
  if (direction === "next") {
    if (!page.nextCursor) return;
    page.cursors = page.cursors.slice(0, page.pageIndex + 1);
    page.cursors.push(page.nextCursor);
    page.pageIndex += 1;
  } else {
    if (page.pageIndex < 1) return;
    page.pageIndex -= 1;
  }
  page.nextCursor = null;
  void loadAssistedImportStatus({ refreshRun: false });
};

const clearAssistedImportProvisionalDetail = () => {
  state.assistedImport.provisionalDetail = {
    targetType: null,
    targetId: null,
    displayLabel: null,
    loading: false,
    error: null,
    status: "not_loaded",
    facts: []
  };
};

const moveAssistedImportProvisionalPage = (direction) => {
  if (assistedImportIsBusy() || !["next", "previous"].includes(direction)) return;
  const page = state.assistedImport.reviewPaging.provisional;
  if (direction === "next") {
    if (!page.nextCursor) return;
    page.cursors = page.cursors.slice(0, page.pageIndex + 1);
    page.cursors.push(page.nextCursor);
    page.pageIndex += 1;
  } else {
    if (page.pageIndex < 1) return;
    page.pageIndex -= 1;
  }
  page.nextCursor = null;
  clearAssistedImportProvisionalDetail();
  void loadAssistedImportStatus({ refreshRun: false });
};

const loadAssistedImportProvisionalDetail = async (targetType, targetId) => {
  if (!isLiveMode() || assistedImportIsBusy()) return;
  const allowedTypes = new Set(["campaign", "brand", "product", "agency", "manager"]);
  const record = state.assistedImport.data?.provisionalEntities?.items?.find((entry) => (
    entry?.provisionalEntityId === targetId && entry?.targetType === targetType
  ));
  if (!record || !allowedTypes.has(targetType)) return;
  state.assistedImport.provisionalDetail = {
    targetType,
    targetId,
    displayLabel: record.displayLabel,
    loading: true,
    error: null,
    status: "loading",
    facts: []
  };
  renderOverlay();
  try {
    const payload = await requestJson(assistedImportReviewPath({
      provisionalDetail: { targetType, targetId }
    }));
    const detail = payload?.data?.provisionalEntityDetail;
    if (
      !detail
      || detail.targetType !== targetType
      || detail.targetId !== targetId
      || !["ready", "unavailable"].includes(detail.status)
      || !Array.isArray(detail.facts)
    ) {
      throw new ApiError(502, "The provisional evidence response was invalid.");
    }
    state.assistedImport.provisionalDetail = {
      targetType,
      targetId,
      displayLabel: record.displayLabel,
      loading: false,
      error: detail.status === "unavailable"
        ? "Imported evidence is temporarily unavailable."
        : null,
      status: detail.status,
      facts: detail.facts
    };
  } catch (error) {
    state.assistedImport.provisionalDetail = {
      targetType,
      targetId,
      displayLabel: record.displayLabel,
      loading: false,
      error: error instanceof Error
        ? error.message
        : "Imported evidence is temporarily unavailable.",
      status: "unavailable",
      facts: []
    };
  }
  renderOverlay();
};

const requestAssistedImport = async (mode) => {
  if (!isLiveMode() || assistedImportIsBusy()) return;
  state.assistedImport.loading = true;
  state.assistedImport.error = null;
  renderOverlay();
  try {
    await requestJson("/api/import-sync", {
      method: "POST",
      body: { mode },
      csrf: true
    });
    showToast(mode === "pilot"
      ? "The 25-creator pilot was requested. Railway will stage the next redacted source batch."
      : "The administrator-approved historical import was requested.");
    const payload = await requestAssistedImportStatus({ refreshRun: true });
    state.assistedImport.data = payload?.data ?? null;
  } catch (error) {
    state.assistedImport.error = error instanceof Error
      ? error.message
      : "The import request was not accepted.";
    showToast(`Nothing was started. ${state.assistedImport.error}`);
  } finally {
    state.assistedImport.loading = false;
    renderOverlay();
  }
};

const applyAssistedImportBulkResolution = async (resolution) => {
  const runId = state.assistedImport.data?.currentRun?.runId;
  if (
    !isLiveMode()
    || !runId
    || !["exact_existing", "provisional_creators"].includes(resolution)
    || state.assistedImport.bulkResolution.running
  ) return;

  const progress = state.assistedImport.bulkResolution;
  Object.assign(progress, {
    running: true,
    mode: resolution,
    processedFacts: 0,
    processedGroups: 0,
    createdProfiles: 0,
    acceptedFacts: 0,
    remaining: null,
    error: null
  });
  renderOverlay();

  try {
    for (let batch = 0; batch < 10_000; batch += 1) {
      const requestBody = {
        action: "apply_bulk_resolution",
        runId,
        resolution,
        idempotencyKey: crypto.randomUUID()
      };
      const payload = await requestAssistedImportBulkBatch(requestBody);
      const result = payload?.data || {};
      const processed = resolution === "exact_existing"
        ? Number(result.processedFacts || 0)
        : Number(result.processedGroups || 0);
      const remaining = resolution === "exact_existing"
        ? Number(result.remainingFacts || 0)
        : Number(result.remainingGroups || 0);

      if (resolution === "exact_existing") {
        progress.processedFacts += processed;
        if (state.assistedImport.data?.bulkResolutionPreview) {
          state.assistedImport.data.bulkResolutionPreview.exactExistingCreatorFacts = remaining;
          if (remaining === 0) {
            state.assistedImport.data.bulkResolutionPreview.exactIdentityPhaseComplete = true;
          }
        }
      } else {
        progress.processedGroups += processed;
        progress.createdProfiles += Number(result.createdProfiles || 0);
        progress.acceptedFacts += Number(result.acceptedFacts || 0);
        if (state.assistedImport.data?.bulkResolutionPreview) {
          state.assistedImport.data.bulkResolutionPreview.provisionalCreatorGroups = remaining;
        }
      }
      progress.remaining = remaining;
      renderOverlay();

      if (remaining === 0) break;
      if (processed === 0 || batch === 9_999) {
        throw new Error("The integration queue did not make progress. Refresh and resume after checking the review queue.");
      }
    }

    const refreshed = await requestAssistedImportStatus({ refreshRun: false });
    state.assistedImport.data = refreshed?.data ?? state.assistedImport.data;
    showToast(resolution === "exact_existing"
      ? `${progress.processedFacts.toLocaleString()} directly supported facts were accepted and exact creator identities were reconciled without changing staff CRM fields.`
      : `${progress.createdProfiles.toLocaleString()} separate provisional creator profiles were created for staff review.`);
  } catch (error) {
    progress.error = error instanceof Error
      ? error.message
      : "The integration batch stopped before completion.";
    showToast(`Progress was saved. ${progress.error}`);
  } finally {
    progress.running = false;
    renderOverlay();
  }
};

const reviewAssistedImportFact = async (factId, decision) => {
  if (!isLiveMode() || assistedImportIsBusy() || !factId || !["accepted", "rejected"].includes(decision)) return;
  state.assistedImport.loading = true;
  state.assistedImport.error = null;
  renderOverlay();
  try {
    await requestJson("/api/import-sync", {
      method: "POST",
      body: {
        action: "review_fact",
        factId,
        decision
      },
      csrf: true
    });
    const payload = await requestAssistedImportStatus();
    state.assistedImport.data = payload?.data ?? null;
    showToast(decision === "accepted"
      ? "Imported fact accepted with its evidence."
      : "Imported fact rejected. The CRM was not changed.");
  } catch (error) {
    state.assistedImport.error = error instanceof Error
      ? error.message
      : "The review decision was not saved.";
    showToast(`Nothing was changed. ${state.assistedImport.error}`);
  } finally {
    state.assistedImport.loading = false;
    renderOverlay();
  }
};

const reviewAssistedImportRelationship = async (relationshipId, decision) => {
  if (!isLiveMode() || assistedImportIsBusy() || !relationshipId || !["accepted", "rejected"].includes(decision)) return;
  state.assistedImport.loading = true;
  state.assistedImport.error = null;
  renderOverlay();
  try {
    await requestJson("/api/import-sync", {
      method: "POST",
      body: {
        action: "review_relationship",
        relationshipId,
        decision
      },
      csrf: true
    });
    const payload = await requestAssistedImportStatus();
    state.assistedImport.data = payload?.data ?? null;
    showToast(decision === "accepted"
      ? "Creator-campaign relationship accepted. Add it to the CRM when you are ready."
      : "Creator-campaign relationship rejected. The CRM was not changed.");
  } catch (error) {
    state.assistedImport.error = error instanceof Error
      ? error.message
      : "The relationship decision was not saved.";
    showToast(`Nothing was changed. ${state.assistedImport.error}`);
  } finally {
    state.assistedImport.loading = false;
    renderOverlay();
  }
};

const materializeAssistedImportRelationship = async (relationshipId) => {
  if (!isLiveMode() || assistedImportIsBusy() || !relationshipId) return;
  state.assistedImport.loading = true;
  state.assistedImport.error = null;
  renderOverlay();
  let result;
  try {
    result = await requestJson("/api/import-sync", {
      method: "POST",
      body: {
        action: "materialize_relationship",
        relationshipId
      },
      csrf: true
    });
  } catch (error) {
    state.assistedImport.error = error instanceof Error
      ? error.message
      : "The relationship could not be added to the CRM.";
    showToast(`Nothing was changed. ${state.assistedImport.error}`);
    state.assistedImport.loading = false;
    renderOverlay();
    return;
  }

  try {
    const payload = await requestAssistedImportStatus();
    state.assistedImport.data = payload?.data ?? null;
    showToast(result?.data?.createdAssignment
      ? "Creator added to the campaign as an imported relationship for staff review."
      : "Relationship evidence added. Existing staff-managed campaign terms were left unchanged.");
  } catch {
    showToast("Saved successfully, but the Import & Sync page could not refresh. Click Refresh before reviewing more relationships.");
  } finally {
    state.assistedImport.loading = false;
    renderOverlay();
  }
};

const closeAssistedImportMaterializer = () => {
  const requestId = Number(state.assistedImport.materialization.requestId || 0) + 1;
  state.assistedImport.materialization = {
    factId: null,
    loading: false,
    error: null,
    options: null,
    query: "",
    requestId
  };
};

const loadAssistedImportMaterializationOptions = async (factId, query = "") => {
  if (!isLiveMode() || assistedImportIsBusy() || !factId) return;
  const requestId = Number(state.assistedImport.materialization.requestId || 0) + 1;
  state.assistedImport.materialization = {
    factId,
    loading: true,
    error: null,
    query: String(query || "").slice(0, 100),
    requestId,
    options: state.assistedImport.materialization.factId === factId
      ? state.assistedImport.materialization.options
      : null
  };
  renderOverlay();
  try {
    const payload = await requestJson("/api/import-sync", {
      method: "POST",
      body: {
        action: "materialization_options",
        factId,
        query: String(query || "").slice(0, 100)
      },
      csrf: true
    });
    if (
      state.assistedImport.materialization.factId !== factId
      || state.assistedImport.materialization.requestId !== requestId
    ) return;
    state.assistedImport.materialization.options = payload?.data ?? null;
  } catch (error) {
    if (
      state.assistedImport.materialization.factId !== factId
      || state.assistedImport.materialization.requestId !== requestId
    ) return;
    state.assistedImport.materialization.error = error instanceof Error
      ? error.message
      : "The matching CRM records could not be loaded.";
  } finally {
    if (
      state.assistedImport.materialization.factId === factId
      && state.assistedImport.materialization.requestId === requestId
    ) {
      state.assistedImport.materialization.loading = false;
      renderOverlay();
    }
  }
};

const materializeAssistedImportFact = async (request) => {
  if (!isLiveMode() || assistedImportIsBusy() || !request?.factId) return;
  state.assistedImport.loading = true;
  state.assistedImport.materialization.error = null;
  renderOverlay();
  let result;
  try {
    result = await requestJson("/api/import-sync", {
      method: "POST",
      body: {
        action: "materialize_entity",
        factIds: [request.factId],
        resolution: request.resolution,
        existingTargetId: request.existingTargetId || null,
        staffConfirmedName: request.staffConfirmedName || null,
        clientId: request.clientId || null,
        brandId: request.brandId || null,
        campaignType: request.campaignType || null
      },
      csrf: true
    });
  } catch (error) {
    state.assistedImport.materialization.error = error instanceof Error
      ? error.message
      : "The provisional record was not resolved.";
    showToast(`Nothing was changed. ${state.assistedImport.materialization.error}`);
    state.assistedImport.loading = false;
    renderOverlay();
    return;
  }

  closeAssistedImportMaterializer();
  try {
    const payload = await requestAssistedImportStatus();
    state.assistedImport.data = payload?.data ?? null;
    showToast(result?.data?.createdEntity
      ? "A provisional CRM record was created and this evidence was accepted."
      : "This evidence was linked to the selected CRM record and accepted.");
  } catch {
    showToast("Saved successfully, but the Import & Sync page could not refresh. Click Refresh before reviewing more evidence.");
  } finally {
    state.assistedImport.loading = false;
    renderOverlay();
  }
};

const loadAssistedImportMaterializationHistory = async (query = "") => {
  if (!isLiveMode() || assistedImportIsBusy()) return;
  const history = state.assistedImport.materializationHistory;
  history.loading = true;
  history.error = null;
  history.query = String(query || "").slice(0, 100);
  renderOverlay();
  try {
    const payload = await requestJson("/api/import-sync", {
      method: "POST",
      body: {
        action: "materialization_history",
        query: history.query
      },
      csrf: true
    });
    history.items = Array.isArray(payload?.data?.items) ? payload.data.items : [];
    history.loaded = true;
  } catch (error) {
    history.error = error instanceof Error
      ? error.message
      : "Materialization history could not be loaded.";
  } finally {
    history.loading = false;
    renderOverlay();
  }
};

const closeAssistedImportCorrection = () => {
  const requestId = Number(state.assistedImport.correction.requestId || 0) + 1;
  state.assistedImport.correction = {
    mapId: null,
    loading: false,
    error: null,
    options: null,
    query: "",
    requestId,
    idempotencyKey: null
  };
};

const loadAssistedImportCorrectionOptions = async (mapId, query = "") => {
  if (!isLiveMode() || assistedImportIsBusy() || !mapId) return;
  const requestId = Number(state.assistedImport.correction.requestId || 0) + 1;
  const sameMap = state.assistedImport.correction.mapId === mapId;
  state.assistedImport.correction = {
    mapId,
    loading: true,
    error: null,
    options: sameMap
      ? state.assistedImport.correction.options
      : null,
    query: String(query || "").slice(0, 100),
    requestId,
    idempotencyKey: sameMap && state.assistedImport.correction.idempotencyKey
      ? state.assistedImport.correction.idempotencyKey
      : crypto.randomUUID()
  };
  renderOverlay();
  try {
    const payload = await requestJson("/api/import-sync", {
      method: "POST",
      body: {
        action: "correction_options",
        mapId,
        query: state.assistedImport.correction.query
      },
      csrf: true
    });
    if (
      state.assistedImport.correction.mapId !== mapId
      || state.assistedImport.correction.requestId !== requestId
    ) return;
    state.assistedImport.correction.options = payload?.data ?? null;
  } catch (error) {
    if (
      state.assistedImport.correction.mapId !== mapId
      || state.assistedImport.correction.requestId !== requestId
    ) return;
    state.assistedImport.correction.error = error instanceof Error
      ? error.message
      : "Correction choices could not be loaded.";
  } finally {
    if (
      state.assistedImport.correction.mapId === mapId
      && state.assistedImport.correction.requestId === requestId
    ) {
      state.assistedImport.correction.loading = false;
      renderOverlay();
    }
  }
};

const correctAssistedImportMaterialization = async (request) => {
  if (!isLiveMode() || assistedImportIsBusy() || !request?.mapId || !request?.confirmed) return;
  state.assistedImport.loading = true;
  state.assistedImport.correction.error = null;
  renderOverlay();
  try {
    await requestJson("/api/import-sync", {
      method: "POST",
      body: {
        action: "correct_materialization",
        mapId: request.mapId,
        replacementTargetId: request.replacementTargetId,
        reason: request.reason,
        confirmed: true,
        idempotencyKey: request.idempotencyKey
      },
      csrf: true
    });
  } catch (error) {
    state.assistedImport.correction.error = error instanceof Error
      ? error.message
      : "The evidence link was not corrected.";
    showToast(`Nothing was changed. ${state.assistedImport.correction.error}`);
    state.assistedImport.loading = false;
    renderOverlay();
    return;
  }

  closeAssistedImportCorrection();
  const refreshResults = await Promise.allSettled([
    loadAssistedImportMaterializationHistory(state.assistedImport.materializationHistory.query),
    requestAssistedImportStatus()
  ]);
  if (refreshResults[1].status === "fulfilled") {
    state.assistedImport.data = refreshResults[1].value?.data ?? null;
  }
  const historyRefreshed = !state.assistedImport.materializationHistory.error;
  const statusRefreshed = refreshResults[1].status === "fulfilled";
  state.assistedImport.loading = false;
  renderOverlay();
  showToast(historyRefreshed && statusRefreshed
    ? "The evidence link was corrected. Core CRM records were not changed or merged."
    : "Correction saved successfully, but part of the page could not refresh. Click Refresh before making another correction.");
};

const recordAssistedImportPilotReview = async (review) => {
  if (!isLiveMode() || assistedImportIsBusy() || !review?.runId) return;
  state.assistedImport.loading = true;
  state.assistedImport.error = null;
  renderOverlay();
  try {
    const result = await requestJson("/api/import-sync", {
      method: "POST",
      body: {
        action: "record_pilot_review",
        ...review
      },
      csrf: true
    });
    const payload = await requestAssistedImportStatus({ refreshRun: true });
    state.assistedImport.data = payload?.data ?? null;
    showToast(result?.data?.passed
      ? "Pilot gate passed. The full historical import is now unlocked."
      : "Pilot gate recorded as blocked. Fix the failed checks, then start a fresh pilot.");
  } catch (error) {
    state.assistedImport.error = error instanceof Error
      ? error.message
      : "The pilot gate decision was not saved.";
    showToast(`Nothing was changed. ${state.assistedImport.error}`);
  } finally {
    state.assistedImport.loading = false;
    renderOverlay();
  }
};

const loadPrivateCreatorRecord = async (creator) => {
  if (!creator || !isLiveMode()) return;
  state.privateCreatorLoading = true;
  state.privateCreatorError = null;
  renderOverlay();
  try {
    const payload = await requestJson(`/api/creators/${encodeURIComponent(creator.sourceRecordId || creator.id)}/private-profile`);
    state.privateCreatorRecord = payload?.data || null;
  } catch (error) {
    state.privateCreatorRecord = null;
    state.privateCreatorError = error instanceof Error ? error.message : "The private creator record could not be opened.";
  } finally {
    state.privateCreatorLoading = false;
    renderOverlay();
  }
};

const sendCampaignCommand = async (operation, args) => {
  const payload = await requestJson("/api/campaign-operations", {
    method: "POST",
    csrf: true,
    body: {
      version: 1,
      operation,
      idempotencyKey: crypto.randomUUID(),
      args
    }
  });
  return payload?.data ?? payload;
};

const campaignOperationsLoader = createCampaignOperationsLoader({
  fetchOperations: async (campaignId) => {
    const payload = await requestJson(`/api/campaign-operations/${encodeURIComponent(campaignId)}`);
    return payload?.data ?? payload;
  }
});

const assistedImportEntityEvidenceLoader = createAssistedImportEntityEvidenceLoader({
  fetchEvidence: async (targetType, targetId) => {
    const resource = targetType === "brand" ? "brands" : "products";
    return requestJson(
      `/api/${resource}/${encodeURIComponent(targetId)}/assisted-import-facts`
    );
  }
});

const selectValidLiveRoutes = () => {
  if (state.creators.length && !creatorById(state.selectedCreatorId)) state.selectedCreatorId = state.creators[0]?.id || null;
  if (!sourceById(state.selectedSourceId)) state.selectedSourceId = state.sources[0]?.id || null;
  if (state.view !== "campaign" && !campaignById(state.selectedCampaignId)) {
    state.selectedCampaignId = state.campaigns[0]?.id || null;
  }
  if (!reportCampaign(state.selectedReportId)) {
    state.selectedReportId = state.campaigns.find((campaign) => campaign.reportId)?.reportId || null;
  }
  if (!campaignById(state.finder.campaignId)) {
    const campaign = state.campaigns.find((item) => ["Planning", "Active"].includes(item.status));
    state.finder.campaignId = campaign?.id || state.campaigns[0]?.id || null;
    if (campaign) {
      state.finder.category = campaign.category || "All categories";
      state.finder.maxFee = campaign.budget ? Math.min(10_000, Math.round(campaign.budget / 4)) : 7_000;
    }
  }
};

const collectionPayload = (payload) => payload?.data ?? payload ?? { items: [], page: {} };

const videoTrackingQueryParameters = () => {
  const parameters = new URLSearchParams({ limit: state.videoLibrary === "trackify" ? "50" : "100" });
  if (state.videoLibrary === "trackify") { parameters.set("library", "trackify"); parameters.set("offset", String(state.videoOffset)); }
  if (state.videoSearch.trim()) parameters.set("q", state.videoSearch.trim());
  if (state.videoPlatform !== "all") parameters.set("platform", state.videoPlatform);
  if (state.videoLibrary !== "trackify" && state.videoCampaignId !== "all") parameters.set("campaignId", state.videoCampaignId);
  return parameters;
};

let videoTrackingRequestVersion = 0;
const loadVideoTracking = async () => {
  if (!isLiveMode()) return;
  const version = ++videoTrackingRequestVersion;
  state.videoTracking = { ...state.videoTracking, loading: true, error: null };
  render();
  try {
    const payload = collectionPayload(await requestJson(
      `/api/video-tracking?${videoTrackingQueryParameters()}`
    ));
    if (videoTrackingRequestVersion !== version) return;
    const campaigns = Array.isArray(payload.facets?.campaigns)
      ? payload.facets.campaigns
      : [];
    const campaignOptions = new Map(
      state.videoTracking.campaignOptions.map((campaign) => [campaign.campaignId, campaign])
    );
    for (const campaign of campaigns) campaignOptions.set(campaign.campaignId, campaign);
    state.videoTracking = {
      ...state.videoTracking,
      loaded: true,
      loading: false,
      error: null,
      page: payload.page || {},
      summary: payload.summary || {},
      facets: payload.facets || { platforms: [], campaigns: [] },
      campaignOptions: [...campaignOptions.values()].sort((a, b) =>
        String(a.campaignName || "").localeCompare(String(b.campaignName || ""))
      ),
      items: Array.isArray(payload.items) ? payload.items : []
    };
  } catch (error) {
    if (videoTrackingRequestVersion !== version) return;
    state.videoTracking = {
      ...state.videoTracking,
      loaded: true,
      loading: false,
      error: error instanceof Error ? error.message : "Video Tracking could not be loaded."
    };
  }
  render();
};

const creatorQueryParameters = ({ cursor } = {}) => {
  const parameters = new URLSearchParams({ limit: "50" });
  if (cursor) parameters.set("cursor", cursor);
  const optional = [
    ["q", state.creatorSearch],
    ["category", state.creatorCategory === "All categories" ? null : state.creatorCategory],
    ["platform", state.creatorPlatform === "All platforms" ? null : state.creatorPlatform],
    ["warehouse", state.creatorWarehouse === "All Costco warehouses" ? null : state.creatorWarehouse],
    ["maxDistance", state.creatorDistance === "Any distance" ? null : state.creatorDistance]
  ];
  for (const [name, value] of optional) {
    if (String(value || "").trim()) parameters.set(name, String(value).trim());
  }
  parameters.set("sort", ["recent", "distance", "campaigns"].includes(state.creatorSort) ? state.creatorSort : "recent");
  return parameters;
};

let creatorCollectionRequestVersion = 0;
let creatorLibraryRequestVersion = 0;
let creatorRouteHydrated=false;
let creatorDirectoryScroll=0;
const readLibraryRoute=()=>{
  const q=libraryQuery(),s=state.creatorLibrary;
  s.query=q.get('clq')||'';s.nameQuery=s.query;
  s.platform=['instagram','tiktok','youtube','facebook'].includes(q.get('clplatform'))?q.get('clplatform'):'';
  s.collaboration=['seeding','paid','both'].includes(q.get('clcollaboration'))?q.get('clcollaboration'):'';
  s.agency=['bsm','day_one','other'].includes(q.get('clagency'))?q.get('clagency'):'';
  s.emailAvailability=['has_email','no_email'].includes(q.get('clemail'))?q.get('clemail'):'';
  s.sort=['complete','followers_desc','followers_asc','campaigns_desc','campaigns_asc','rate_desc','rate_asc'].includes(q.get('clsort'))?q.get('clsort'):'complete';
  s.campaign=q.get('clcampaign')||'';s.stage=q.get('clstage')||'';s.brands=(q.get('clbrands')||'').split(',').filter(Boolean);s.costcoOnly=q.get('clcostco')==='true';
  s.profileTab=libraryTabs.has(q.get('libraryTab'))?q.get('libraryTab'):'overview';
  s.selectedDealId=(q.get('deal')||'').slice(0,200)||null;
  s.viewMode='gallery';
  s.limit=8;
  const offset=Number(q.get('cloffset'));s.offset=Number.isSafeInteger(offset)&&offset>=0&&offset<=50000?offset:0;
  const id=q.get('libraryCreator');return id&&/^[a-z0-9-]{1,100}$/i.test(id)?id:null;
};
const libraryRouteUrl=(id=null)=>{
  const s=state.creatorLibrary,q=new URLSearchParams({view:'creators'});
  for(const [key,value] of [['clq',s.query],['clplatform',s.platform],['clcollaboration',s.collaboration],['clagency',s.agency],['clemail',s.emailAvailability],['clsort',s.sort],['clcampaign',s.campaign],['clstage',s.stage],['clbrands',s.brands.join(',')],['clcostco',s.costcoOnly?'true':''],['cloffset',String(s.offset||0)],['clview',s.viewMode==='table'?'table':''],['cllimit',s.viewMode==='table'?String(s.limit):'']])if(value)q.set(key,value);
  if(id){q.set('libraryCreator',id);q.set('libraryTab',s.profileTab||'overview');if(s.selectedDealId)q.set('deal',s.selectedDealId);}
  return `${window.location.pathname}?${q}`;
};
const writeLibraryRoute=(id=null,push=false)=>window.history[push?'pushState':'replaceState']({libraryDirectoryScroll:creatorDirectoryScroll},'',libraryRouteUrl(id));
const loadCreatorLibrary = async ({offset=0,creatorId=null,interpret=false,background=false}={}) => {
  if (!isLiveMode() && !state.runtime.creatorProfilePreview) {
    const s=state.creatorLibrary;
    const items=campaignOps.demoCreators.filter(c=>(!s.emailAvailability||c.hasEmail===(s.emailAvailability==='has_email'))&&(!s.query||[c.displayName,...c.accounts.map(a=>a.handle)].join(' ').toLowerCase().includes(s.query.toLowerCase()))&&(!s.platform||c.accounts.some(a=>a.platform===s.platform)));
    s.total=items.length;s.offset=offset;s.items=items.slice(offset,offset+s.limit);
    s.selected=creatorId?campaignOps.demoCreators.find(c=>c.id===creatorId)||null:null;s.sample=true;s.demo=true;
    render();return;
  }
  if (!isLiveMode() && !state.runtime.creatorProfilePreview) return;
  if(background&&!creatorId&&state.creatorLibrary.loading&&!state.creatorLibrary.lastRequest?.creatorId&&state.creatorLibrary.lastRequest?.offset===offset)return;
  const version=++creatorLibraryRequestVersion;
  const s=state.creatorLibrary;
  s.demo=false;s.canImportAgencyRoster=(state.currentUser?.roles||[]).some(role=>['admin','relationship_manager'].includes(role));
  s.lastRequest={offset,creatorId,interpret};
  s.photoDraft=undefined;s.photoError=null;s.photoNotice=null;s.photoPreparing=false;s.photoSequence=(s.photoSequence||0)+1;
  try {
    if(interpret&&!s.query.trim()){s.aiPlan=null;s.interpretation=null;s.nameQuery='';}
    const filters={q:isLiveMode()?s.nameQuery:s.query,platform:s.platform,costcoOnly:String(s.costcoOnly),collaboration:s.collaboration||'',agency:s.agency||'',emailAvailability:s.emailAvailability||'',brands:s.brands.join(','),campaign:s.campaign,stage:s.stage,sort:s.sort||'complete'};
    const parameters=new URLSearchParams({...filters,offset:String(offset),limit:String(s.limit)});
    if(creatorId)parameters.set('creatorId',creatorId);
    const useAi=isLiveMode()&&!creatorId&&(s.aiPlan||(interpret&&s.query.trim()));
    const directoryRequestKey=parameters.toString();
    s.refreshing=background&&!creatorId&&!useAi&&!s.selected&&!s.error&&s.total!==null&&s.directoryRequestKey===directoryRequestKey;
    s.loading=true;s.error=null;render();
    const payload=useAi?await requestJson('/api/creator-library/search',{method:'POST',csrf:true,body:{...(interpret?{query:s.query.trim(),filters:{collaboration:s.collaboration||'',agency:s.agency||'',emailAvailability:s.emailAvailability||''}}:{plan:s.aiPlan,filters}),offset,limit:s.limit}}):await requestJson(`/api/creator-library?${parameters}`,{background:s.refreshing});
    if(version!==creatorLibraryRequestVersion||state.creatorLibrary!==s)return;
    if(creatorId){
      s.activePlayerId=null;
      s.selected=payload.data.items[0]||null;
      if(!s.selected)throw new Error('This creator profile is not available.');
      s.overlapReviews=[];s.overlapReviewError=null;
      s.canReviewOverlap=isLiveMode()&&(state.currentUser.roles||[]).some(role=>['admin','finance_admin','reviewer','campaign_manager'].includes(role));
      if(isLiveMode()){
        try{
          const reviews=await requestJson(`/api/creator-library/fee-reviews?creatorId=${encodeURIComponent(creatorId)}`);
          if(version!==creatorLibraryRequestVersion)return;
          s.overlapReviews=Array.isArray(reviews.data)?reviews.data:[];
        }catch(error){s.overlapReviewError=error.message||'Fee review history could not be loaded.';}
      }
    } else {
      s.items=payload.data.items;s.total=payload.data.total;s.offset=offset;s.selected=null;
      s.directoryRequestKey=useAi?null:directoryRequestKey;
      if(payload.plan){s.aiPlan=payload.plan;s.interpretation=payload.interpretation;s.nameQuery=payload.filters.q;s.platform=payload.filters.platform;s.brands=payload.filters.brands?payload.filters.brands.split(','):[];s.campaign=payload.filters.campaign;s.stage=payload.filters.stage;s.costcoOnly=payload.filters.costcoOnly==='true';s.sort=payload.filters.sort;s.agency=payload.filters.agency||'';s.emailAvailability=payload.filters.emailAvailability||'';}
    }
    s.filters=payload.data.filters||{brands:[],campaigns:[]};
    s.demo=payload.data.source==='local_demo';
    s.capturedAt=payload.data.capturedAt;s.snapshot=payload.data.source==='read_only_production_snapshot';
  }catch(error){if(version!==creatorLibraryRequestVersion||state.creatorLibrary!==s)return;s.directoryRequestKey=null;s.error=error.message||'Creator profiles could not be loaded.';}
  if(version!==creatorLibraryRequestVersion||state.creatorLibrary!==s)return;
  s.loading=false;s.refreshing=false;render();
  if(state.view==='creators'&&s.canImportAgencyRoster&&isLiveMode()&&!s.intake?.loading&&!s.intake?.processing)void creatorIntakeController.load();
};
const creatorIntakeController=createCreatorIntakeController({root:app,getState:()=>state.creatorLibrary,request:requestJson,render,
  reload:()=>loadCreatorLibrary({offset:state.creatorLibrary.offset,creatorId:state.creatorLibrary.selected?.id||null}),
  enabled:()=>state.creatorLibrary.canImportAgencyRoster===true});
const exportCreatorLibrary = async () => {
  const s=state.creatorLibrary;
  if(!isLiveMode()||s.exportBusy||s.loading||s.error||s.total===null||s.demo||s.snapshot)return;
  const requestEpoch=sessionEpoch;
  const filters={q:s.nameQuery||'',platform:s.platform||'',costcoOnly:String(s.costcoOnly),collaboration:s.collaboration||'',agency:s.agency||'',emailAvailability:s.emailAvailability||'',brands:s.brands.join(','),campaign:s.campaign||'',stage:s.stage||'',sort:s.sort||'complete'};
  s.exportBusy=true;render();
  try{
    const response=await fetch('/api/creator-library/export',{method:'POST',credentials:'same-origin',headers:{Accept:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Type':'application/json','X-CSRF-Token':state.csrfToken||''},body:JSON.stringify({filters,...(s.aiPlan?{plan:s.aiPlan}:{})})});
    assertCurrentSessionEpoch(requestEpoch);
    if(!response.ok){let payload=null;try{payload=await response.json();}catch{}throw new ApiError(response.status,payload?.error?.message||'Creator export could not be completed.');}
    const blob=await response.blob();
    assertCurrentSessionEpoch(requestEpoch);
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=`creators-${new Date().toISOString().slice(0,10)}.xlsx`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),0);
    showToast('Creator list downloaded.');
  }catch(error){if(!(error instanceof StaleSessionError))showToast(error.message||'Creator export could not be completed.');}
  finally{if(state.creatorLibrary===s){s.exportBusy=false;render();}}
};
const loadCreatorPage = async ({ append = false, background = false } = {}) => {
  if(!creatorRouteHydrated&&state.view==='creators'){
    creatorRouteHydrated=true;
    const id=readLibraryRoute();
    if(id&&!state.creatorLibrary.showManaged)return loadCreatorLibrary({creatorId:id});
  }
  if (!state.creatorLibrary.showManaged) return loadCreatorLibrary({offset:state.creatorLibrary.offset,background});
  if (!isLiveMode()) return;
  if (append && (!state.creatorPage.hasMore || state.creatorPage.loading)) return;
  const version = ++creatorCollectionRequestVersion;
  const cursor = append ? state.creatorPage.nextCursor : null;
  state.creatorPage = { ...state.creatorPage, loading: true, error: null };
  render();
  try {
    const payload = collectionPayload(await requestJson(`/api/creators?${creatorQueryParameters({ cursor })}`));
    if (creatorCollectionRequestVersion !== version) return;
    const records = adaptWorkspaceRecords("creators", payload.items);
    if (append) {
      const byId = new Map(state.creators.map((creator) => [creator.id, creator]));
      for (const creator of records) byId.set(creator.id, creator);
      state.creators = [...byId.values()];
    } else {
      state.creators = records;
    }
    state.creatorPage = {
      loaded: true,
      loading: false,
      error: null,
      nextCursor: payload.page?.nextCursor || null,
      hasMore: payload.page?.hasMore === true
    };
    if (!state.selectedCreatorId && state.creators.length) state.selectedCreatorId = state.creators[0].id;
  } catch (error) {
    if (creatorCollectionRequestVersion !== version) return;
    state.creatorPage = {
      ...state.creatorPage,
      loaded: true,
      loading: false,
      error: error instanceof Error ? error.message : "Creators could not be loaded."
    };
  }
  render();
};

let finderRequestVersion = 0;
const loadCampaignFinderResults = async () => {
  if (!isLiveMode()) return;
  const version = ++finderRequestVersion;
  state.finder = { ...state.finder, loading: true, error: null };
  renderOverlay();
  try {
    const parameters = new URLSearchParams({ limit: "50", pool: "reactivation" });
    parameters.set("sort", "finder");
    if (state.finder.category && state.finder.category !== "All categories") {
      parameters.set("category", state.finder.category);
    }
    if (state.finder.platform && state.finder.platform !== "All platforms") {
      parameters.set("platform", state.finder.platform);
    }
    if (Number.isFinite(state.finder.maxDistance) && state.finder.maxDistance > 0) {
      parameters.set("maxDistance", String(state.finder.maxDistance));
    }
    if (Number.isFinite(state.finder.maxFee) && state.finder.maxFee >= 0) {
      parameters.set("maxRate", String(state.finder.maxFee));
    }
    const payload = collectionPayload(await requestJson(`/api/creators?${parameters}`));
    if (finderRequestVersion !== version) return;
    state.finder = {
      ...state.finder,
      results: adaptWorkspaceRecords("creators", payload.items),
      loading: false,
      error: null,
      hasMore: payload.page?.hasMore === true
    };
  } catch (error) {
    if (finderRequestVersion !== version) return;
    state.finder = {
      ...state.finder,
      results: [],
      loading: false,
      error: error instanceof Error ? error.message : "Campaign matches could not be loaded.",
      hasMore: false
    };
  }
  renderOverlay();
};

const attachAssignmentsToCampaigns = (assignments) => {
  for (const assignment of assignments) {
    const campaign = campaignById(assignment.campaignId);
    if (!campaign) continue;
    const index = campaign.assignments.findIndex((candidate) => candidate.id === assignment.id);
    if (index >= 0) campaign.assignments[index] = assignment;
    else campaign.assignments.push(assignment);
  }
};

const mergeCreatorRecords = (records) => {
  const byId = new Map(state.creators.map((creator) => [creator.id, creator]));
  for (const creator of records) byId.set(creator.id, creator);
  state.creators = [...byId.values()];
};

const loadCreatorPicker = async ({ force = false } = {}) => {
  if (!isLiveMode() || state.creatorPickerLoading || (state.creatorPickerLoaded && !force)) return;
  state.creatorPickerLoading = true;
  state.creatorPickerError = null;
  renderOverlay();
  try {
    const items = [];
    let cursor = null;
    let complete = false;
    for (let pageNumber = 0; pageNumber < 50; pageNumber += 1) {
      const parameters = new URLSearchParams({ limit: "100" });
      if (cursor) parameters.set("cursor", cursor);
      const page = collectionPayload(await requestJson(`/api/creators?${parameters}`));
      items.push(...(page.items || []));
      if (!page.page?.hasMore || !page.page?.nextCursor) {
        complete = true;
        break;
      }
      cursor = page.page.nextCursor;
    }
    if (!complete) throw new Error("The creator picker exceeded its safe 5,000-record limit.");
    mergeCreatorRecords(adaptWorkspaceRecords("creators", items));
    state.creatorPickerLoaded = true;
  } catch (error) {
    state.creatorPickerLoaded = false;
    state.creatorPickerError = error instanceof Error
      ? error.message
      : "Creators could not be loaded for this campaign.";
    throw error;
  } finally {
    state.creatorPickerLoading = false;
    if (state.drawer === "manual-assignments") renderOverlay();
  }
};

const loadMissingAssignmentCampaigns = async (assignments) => {
  const missingIds = unique(assignments.map((assignment) => assignment.campaignId))
    .filter((campaignId) => !campaignById(campaignId));
  if (!missingIds.length) return;

  const loaded = [];
  let nextIndex = 0;
  const workerCount = Math.min(6, missingIds.length);
  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (nextIndex < missingIds.length) {
      const campaignId = missingIds[nextIndex];
      nextIndex += 1;
      const payload = await requestJson(`/api/campaigns/${encodeURIComponent(campaignId)}`);
      const [campaign] = adaptWorkspaceRecords("campaigns", [payload?.data ?? payload]);
      if (!campaign) throw new Error(`Campaign ${campaignId} could not be loaded.`);
      loaded.push(campaign);
    }
  }));

  for (const campaign of loaded) {
    const index = state.campaigns.findIndex((candidate) => candidate.id === campaign.id);
    if (index >= 0) {
      state.campaigns[index] = {
        ...campaign,
        assignments: state.campaigns[index].assignments || []
      };
    } else {
      state.campaigns.push(campaign);
    }
  }
};

const loadCreatorAssignments = async (creatorId) => {
  const items = [];
  let cursor = null;
  for (let pageNumber = 0; pageNumber < 50; pageNumber += 1) {
    const parameters = new URLSearchParams({ creatorId, limit: "100" });
    if (cursor) parameters.set("cursor", cursor);
    const page = collectionPayload(await requestJson(`/api/assignments?${parameters}`));
    items.push(...(page.items || []));
    if (!page.page?.hasMore || !page.page?.nextCursor) return items;
    cursor = page.page.nextCursor;
  }
  throw new Error("Creator assignment history exceeded its safe 5,000-record limit.");
};

const loadCampaignAssignments = async (campaignId) => {
  const items = [];
  let cursor = null;
  for (let pageNumber = 0; pageNumber < 50; pageNumber += 1) {
    const parameters = new URLSearchParams({ campaignId, limit: "100" });
    if (cursor) parameters.set("cursor", cursor);
    const page = collectionPayload(await requestJson(`/api/assignments?${parameters}`));
    items.push(...(page.items || []));
    if (!page.page?.hasMore || !page.page?.nextCursor) return items;
    cursor = page.page.nextCursor;
  }
  throw new Error("Campaign roster exceeded its safe 5,000-record limit.");
};

const campaignAssignmentRequestVersion = new Map();
const refreshCampaignAssignments = async (campaignId) => {
  if (!isLiveMode() || !campaignId) return [];
  const version = (campaignAssignmentRequestVersion.get(campaignId) || 0) + 1;
  campaignAssignmentRequestVersion.set(campaignId, version);
  const records = adaptWorkspaceRecords("assignments", await loadCampaignAssignments(campaignId));
  if (campaignAssignmentRequestVersion.get(campaignId) !== version) return [];
  const campaign = campaignById(campaignId);
  if (!campaign) return records;
  replaceCampaign(campaignId, { ...campaign, assignments: records });
  if (campaignOperationsAreVisible(campaignId)) render();
  if (state.drawer === "manual-assignments" && state.selectedCampaignId === campaignId) renderOverlay();
  return records;
};

let campaignDetailRequestVersion = 0;
const loadCampaignDetail = async (campaignId) => {
  if (!isLiveMode() || !campaignId) return;
  const version = ++campaignDetailRequestVersion;
  state.campaignDetailLoadingId = campaignId;
  state.campaignDetailError = null;
  render();
  try {
    if (isCostcoOverviewCampaignId(campaignId)) {
      if (!state.costcoOverview.loaded) await loadCostcoOverview();
      if (campaignDetailRequestVersion !== version) return;
      if (!state.costcoOverview.items.some((item) => item.id === campaignId)) {
        throw new Error(state.costcoOverview.error || "This source campaign is unavailable. Return to Campaigns and choose an available record.");
      }
      return;
    }
    const payload = await requestJson(`/api/campaigns/${encodeURIComponent(campaignId)}`);
    if (campaignDetailRequestVersion !== version) return;
    const [campaign] = adaptWorkspaceRecords("campaigns", [payload?.data ?? payload]);
    if (!campaign) throw new Error("The campaign record was unavailable.");
    const index = state.campaigns.findIndex((candidate) => candidate.id === campaign.id);
    if (index >= 0) {
      state.campaigns[index] = {
        ...campaign,
        assignments: state.campaigns[index].assignments || []
      };
    } else {
      state.campaigns.push(campaign);
    }
    render();
    await loadCampaignWorkspace(campaignId);
  } catch (error) {
    if (campaignDetailRequestVersion !== version) return;
    state.campaignDetailError = error instanceof Error ? error.message : "The campaign could not be loaded.";
  } finally {
    if (campaignDetailRequestVersion === version) {
      state.campaignDetailLoadingId = null;
      render();
    }
  }
};

let creatorDetailRequestVersion = 0;
const loadCreatorDetail = async (creatorId) => {
  if (!isLiveMode() || !creatorId) return;
  const version = ++creatorDetailRequestVersion;
  state.creatorDetailLoadingId = creatorId;
  state.creatorDetailError = null;
  render();
  try {
    const detailPayload = await requestJson(`/api/creators/${encodeURIComponent(creatorId)}`);
    if (creatorDetailRequestVersion !== version) return;
    const [creator] = adaptWorkspaceRecords("creators", [detailPayload?.data ?? detailPayload]);
    if (creator) {
      const index = state.creators.findIndex((candidate) => candidate.id === creator.id);
      if (index >= 0) state.creators[index] = creator;
      else state.creators.push(creator);
    }
    render();
    try {
      const assignmentPayload = await loadCreatorAssignments(creatorId);
      if (creatorDetailRequestVersion !== version) return;
      const assignments = adaptWorkspaceRecords("assignments", assignmentPayload);
      await loadMissingAssignmentCampaigns(assignments);
      if (creatorDetailRequestVersion !== version) return;
      attachAssignmentsToCampaigns(assignments);
    } catch {
      state.creatorDetailError = "The creator profile opened, but campaign-assignment history is temporarily unavailable.";
    }
  } catch (error) {
    if (creatorDetailRequestVersion !== version) return;
    state.creatorDetailError = error instanceof Error ? error.message : "The creator profile could not be loaded.";
  } finally {
    if (creatorDetailRequestVersion === version) {
      state.creatorDetailLoadingId = null;
      render();
    }
  }
};

let campaignCollectionRequestVersion = 0;
const loadCostcoOverview = async () => {
  if (!isLiveMode() || state.costcoOverview.loading) return;
  state.costcoOverview.loading = true;
  state.costcoOverview.error = null;
  render();
  try {
    const payload = await requestJson("/api/costco-campaign-overview");
    state.costcoOverview.items = Array.isArray(payload.data) ? payload.data : [];
    state.costcoOverview.loaded = true;
  } catch (error) {
    state.costcoOverview.error = error instanceof Error ? error.message : "Costco Campaign Overview could not be loaded.";
  } finally {
    state.costcoOverview.loading = false;
    render();
  }
};
const loadCampaignPage = async ({ append = false } = {}) => {
  if (!isLiveMode()) return;
  if (append && (!state.campaignPage.hasMore || state.campaignPage.loading)) return;
  const version = ++campaignCollectionRequestVersion;
  const parameters = new URLSearchParams({ limit: "200" });
  if (append && state.campaignPage.nextCursor) parameters.set("cursor", state.campaignPage.nextCursor);
  if (state.campaignSearch.trim()) parameters.set("q", state.campaignSearch.trim());
  if(state.campaignTypeFilter)parameters.set("type",state.campaignTypeFilter);
  if(state.campaignStatusFilter)parameters.set("status",state.campaignStatusFilter);
  state.campaignPage = { ...state.campaignPage, loading: true, error: null };
  render();
  try {
    const payload = collectionPayload(await requestJson(`/api/campaigns?${parameters}`));
    if (campaignCollectionRequestVersion !== version) return;
    const records = adaptWorkspaceRecords("campaigns", payload.items);
    if (append) {
      const byId = new Map(state.campaigns.map((campaign) => [campaign.id, campaign]));
      for (const campaign of records) byId.set(campaign.id, campaign);
      state.campaigns = [...byId.values()];
    } else {
      state.campaigns = records;
    }
    state.campaignPage = {
      loaded: true,
      loading: false,
      error: null,
      nextCursor: payload.page?.nextCursor || null,
      hasMore: payload.page?.hasMore === true,
      total: Number.isInteger(payload.page?.total) ? payload.page.total : null
    };
    selectValidLiveRoutes();
  } catch (error) {
    if (campaignCollectionRequestVersion !== version) return;
    state.campaignPage = {
      ...state.campaignPage,
      loaded: true,
      loading: false,
      error: error instanceof Error ? error.message : "Campaigns could not be loaded."
    };
  }
  render();
};

const representationCollectionRequestVersion = {
  talentAgencies: 0,
  talentManagers: 0
};
const loadRepresentationPage = async (resource, { append = false } = {}) => {
  if (!isLiveMode()) return;
  const isAgency = resource === "talentAgencies";
  const pageKey = isAgency ? "talentAgencyPage" : "talentManagerPage";
  const recordsKey = isAgency ? "talentAgencies" : "talentManagers";
  const search = isAgency ? state.talentAgencySearch : state.talentManagerSearch;
  const endpoint = isAgency ? "/api/talent-agencies" : "/api/talent-managers";
  const pageState = state[pageKey];
  if (append && (!pageState.hasMore || pageState.loading)) return;
  const version = ++representationCollectionRequestVersion[resource];
  const parameters = new URLSearchParams({ limit: "50" });
  if (append && pageState.nextCursor) parameters.set("cursor", pageState.nextCursor);
  if (search.trim()) parameters.set("q", search.trim());
  state[pageKey] = { ...pageState, loading: true, error: null };
  render();
  try {
    const payload = collectionPayload(await requestJson(`${endpoint}?${parameters}`));
    if (representationCollectionRequestVersion[resource] !== version) return;
    const records = adaptWorkspaceRecords(resource, payload.items);
    if (append) {
      const byId = new Map(state[recordsKey].map((record) => [record.id, record]));
      for (const record of records) byId.set(record.id, record);
      state[recordsKey] = [...byId.values()];
    } else {
      state[recordsKey] = records;
    }
    state[pageKey] = {
      loaded: true,
      loading: false,
      error: null,
      nextCursor: payload.page?.nextCursor || null,
      hasMore: payload.page?.hasMore === true
    };
  } catch (error) {
    if (representationCollectionRequestVersion[resource] !== version) return;
    state[pageKey] = {
      ...state[pageKey],
      loaded: true,
      loading: false,
      error: error instanceof Error ? error.message : "The representation directory could not be loaded."
    };
  }
  render();
};

let representationDetailRequestVersion = 0;
const loadRepresentationDetail = async (resource, id) => {
  if (!isLiveMode() || !id) return;
  const isAgency = resource === "talentAgencies";
  const recordsKey = isAgency ? "talentAgencies" : "talentManagers";
  const endpoint = isAgency ? "/api/talent-agencies" : "/api/talent-managers";
  const version = ++representationDetailRequestVersion;
  state.representationDetailLoading = true;
  state.representationDetailError = null;
  render();
  try {
    const payload = await requestJson(`${endpoint}/${encodeURIComponent(id)}`);
    if (representationDetailRequestVersion !== version) return;
    const [record] = adaptWorkspaceRecords(resource, [payload?.data ?? payload]);
    if (!record) throw new Error("The representation record was unavailable.");
    const index = state[recordsKey].findIndex((candidate) => candidate.id === record.id);
    if (index >= 0) state[recordsKey][index] = record;
    else state[recordsKey].push(record);
  } catch (error) {
    if (representationDetailRequestVersion !== version) return;
    state.representationDetailError = error instanceof Error
      ? error.message
      : "The representation record could not be loaded.";
  } finally {
    if (representationDetailRequestVersion === version) {
      state.representationDetailLoading = false;
      render();
    }
  }
};

const loadLiveWorkspace = async (sessionUser = null) => {
  const role = String(sessionUser?.role || state.currentUser.roles?.[0] || "staff").trim().toLowerCase();
  const roles = sessionUser
    ? (Array.isArray(sessionUser.roles) ? sessionUser.roles : role ? [role] : [])
    : state.currentUser.roles || (role ? [role] : []);
  state.currentUser = {
    id: sessionUser?.id || state.currentUser.id || null,
    name: sessionUser ? sessionUser.displayName || "" : state.currentUser.name || "",
    role: role.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
    initials: profileInitials(sessionUser ? sessionUser.displayName : state.currentUser.name),
    roles: [...roles]
  };
  interfaceLocale = sessionUser?.locale === "ko" ? "ko" : sessionUser ? "en" : interfaceLocale;
  state.creatorLibrary.savedViews=readCreatorViews(window.localStorage,state.currentUser.id);
  state.creatorLibrary.tableColumns=readCreatorColumns(window.localStorage,state.currentUser.id);
  state.creators = [];
  state.campaigns = [];
  state.talentAgencies = [];
  state.talentManagers = [];
  state.sources = [];
  state.importRuns = [];
  state.activityUpdates = [];
  state.creatorPage = { loaded: false, loading: false, error: null, nextCursor: null, hasMore: false };
  state.creatorPickerLoading = false;
  state.creatorPickerLoaded = false;
  state.creatorPickerError = null;
  state.campaignPage = {
    loaded: true,
    loading: false,
    error: null,
    nextCursor: null,
    hasMore: false,
    total: null
  };
  state.campaignDetailLoadingId = null;
  state.campaignDetailError = null;
  state.videoTracking = {
    loaded: false,
    loading: false,
    error: null,
    summary: {},
    facets: { platforms: [], campaigns: [] },
    campaignOptions: [],
    items: [],
    refreshingPostIds: new Set(),
    reviewingPostIds: new Set(),
    confirmingPostId: null,
    actionMessageByPostId: new Map(),
    activationSha: "",
    connection: {
      loadingOptions: false,
      options: [],
      truncated: false,
      error: null,
      stage: "entry",
      selectedPlacementId: "",
      draftUrls: "",
      reviewUrls: [],
      idempotencyKey: null,
      saving: false,
      result: null
    },
    activation: { loading: false, result: null, error: null }
  };
  state.talentAgencyPage = { loaded: false, loading: false, error: null, nextCursor: null, hasMore: false };
  state.talentManagerPage = { loaded: false, loading: false, error: null, nextCursor: null, hasMore: false };
  state.createdReviewLinks = {};
  state.adminSummary = {};
  selectValidLiveRoutes();
  if (state.view === "creators") await loadCreatorPage();
  if (state.view === "creator" && state.selectedCreatorId) await loadCreatorDetail(state.selectedCreatorId);
  if (state.view === "video-tracking") await loadVideoTracking();
  if (state.view === "calendar") await calendarController.load();
};

const establishLiveSession = async () => {
  try {
    const session = await requestJson("/api/auth/session");
    state.csrfToken = session?.csrfToken || null;
    clearCrmSensitiveState();
    await loadLiveWorkspace(session?.user);
    state.runtime.phase = "ready";
    state.runtime.message = null;
    campaignOps.configure('live');
  } catch (error) {
    if (error instanceof ApiError && [401, 403].includes(error.status)) {
      state.csrfToken = null;
      clearCrmSensitiveState();
      state.runtime.phase = "signed-out";
      state.runtime.message = error.status === 403 ? error.message : null;
      return;
    }
    throw error;
  }
};

const liveMutation = async (rpc, args, { campaignId = null } = {}) => {
  if (!isLiveMode()) throw new Error("Live persistence is not active");
  const payload = await requestJson(`/api/mutations/${encodeURIComponent(rpc)}`, {
    method: "POST",
    body: { args },
    csrf: true
  });
  try {
    await loadLiveWorkspace();
    if (campaignId) {
      const operations = await ensureCampaignOperations(campaignId, { force: true, notify: false });
      return { data: payload?.data, refreshed: operations.status === "ready" };
    }
    return { data: payload?.data, refreshed: true };
  } catch {
    return { data: payload?.data, refreshed: false };
  }
};

const saveLiveMutation = async ({ rpc, args, successMessage, onSuccess, campaignId = null }) => {
  try {
    const selectedAssignmentCampaignId = args?.p_assignment_id
      ? assignmentById(args.p_assignment_id)?.campaign?.id
      : null;
    const operationCampaignId = campaignId || args?.p_campaign_id || selectedAssignmentCampaignId || null;
    const outcome = await liveMutation(rpc, args, { campaignId: operationCampaignId });
    onSuccess?.();
    state.drawer = null;
    render();
    showToast(outcome.refreshed
      ? successMessage
      : "Saved successfully, but the authoritative campaign projection could not be reloaded. Refresh this page before editing again.");
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "The server rejected this change.";
    showToast(`Nothing was saved. ${message}`);
    return false;
  }
};

const bootstrap = async () => {
  state.runtime.phase = "checking";
  render();
  try {
    const runtime = await requestJson("/api/runtime");
    const live =
      runtime?.mode === "live" ||
      runtime?.mode === "production" ||
      runtime?.dataSource === "supabase" ||
      runtime?.supabaseConfigured === true;
    if (!live) {
      if (!isLoopbackHost()) {
        throw new Error("The deployed app is not connected to the private workspace.");
      }
      state.runtime = { phase: "ready", mode: "demo", message: null, creatorProfilePreview: runtime.creatorProfilePreview === true, creatorResearchPreview: runtime.creatorResearchPreview === true };
      campaignOps.configure('demo');
      if(!state.runtime.creatorProfilePreview) await loadCreatorLibrary(state.view==='creators'?{creatorId:readLibraryRoute(),offset:state.creatorLibrary.offset}:{});
      render();
      if(state.runtime.creatorProfilePreview && state.view === 'creators') await loadCreatorPage();
      return;
    }
    state.runtime = { phase: "checking", mode: "live", message: "Opening the private workspace…" };
    state.reportVersions = [];
    if (pendingPasswordLink || pendingEmailConfirmation) {
      state.runtime.phase = "signed-out";
      state.runtime.message = null;
      render();
      return;
    }
    await establishLiveSession();
    render();
  } catch (error) {
    if (isLoopbackHost() && error instanceof ApiError && error.status === 404) {
      state.runtime = { phase: "ready", mode: "demo", message: null };
      campaignOps.configure('demo');
      await loadCreatorLibrary();
      render();
      return;
    }
    state.runtime = {
      phase: "error",
      mode: state.runtime.mode,
      message: error instanceof Error ? error.message : "The private workspace could not be opened."
    };
    render();
  }
};

const unique = (values) => [...new Set(values.filter(Boolean))];
const average = (values) =>
  values.length ? Math.round(values.reduce((total, value) => total + value, 0) / values.length) : null;

const creatorById = (id) => state.creators.find((creator) => creator.id === id);
const campaignById = (id) => state.campaigns.find((campaign) => campaign.id === id);
const isCostcoOverviewCampaignId = (id) => /^costco-overview-\d+$/.test(String(id || ""));
const reportCampaign = (reportId) => state.campaigns.find((campaign) => campaign.reportId === reportId);
const sourceById = (id) => state.sources.find((source) => source.id === id);
const assignmentById = (id) =>
  state.campaigns
    .flatMap((campaign) => campaign.assignments.map((assignment) => ({ campaign, assignment })))
    .find(({ assignment }) => assignment.id === id);

const campaignOperationsRequestVersion = new Map();
const campaignEntityEvidenceRequestVersion = new Map();
const replaceCampaign = (campaignId, campaign) => {
  const index = state.campaigns.findIndex((candidate) => candidate.id === campaignId);
  if (index >= 0) state.campaigns[index] = campaign;
};
const campaignOperationsAreVisible = (campaignId) =>
  state.runtime.phase === "ready" && state.view === "campaign" && state.selectedCampaignId === campaignId;

const ensureCampaignEntityEvidence = async (campaignId, { force = false } = {}) => {
  if (!isLiveMode()) return;
  const campaign = campaignById(campaignId);
  if (!campaign) return;
  const version = (campaignEntityEvidenceRequestVersion.get(campaignId) || 0) + 1;
  campaignEntityEvidenceRequestVersion.set(campaignId, version);
  const productTargets = [...new Map(
    uniqueOperationRecords(campaign.costcoActivations)
      .filter((activation) => activation?.productId)
      .map((activation) => [activation.productId, {
        productId: activation.productId,
        productName: activation.productName || activation.product || "Campaign product"
      }])
  ).values()];
  replaceCampaign(campaignId, {
    ...campaign,
    brandAssistedImportEvidence: campaign.brandId
      ? { status: "loading", targetId: campaign.brandId, facts: [] }
      : { status: "unavailable", targetId: null, facts: [] },
    productAssistedImportEvidence: productTargets.map((target) => ({
      ...target,
      status: "loading",
      facts: []
    }))
  });
  if (campaignOperationsAreVisible(campaignId)) render();

  const [brandResult, productResults] = await Promise.all([
    campaign.brandId
      ? assistedImportEntityEvidenceLoader.load("brand", campaign.brandId, { force })
      : Promise.resolve({ status: "unavailable", targetId: null, facts: [] }),
    Promise.all(productTargets.map(async (target) => ({
      ...target,
      ...await assistedImportEntityEvidenceLoader.load("product", target.productId, { force })
    })))
  ]);
  if (campaignEntityEvidenceRequestVersion.get(campaignId) !== version) return;
  const latest = campaignById(campaignId) || campaign;
  replaceCampaign(campaignId, {
    ...latest,
    brandAssistedImportEvidence: brandResult,
    productAssistedImportEvidence: productResults
  });
  if (campaignOperationsAreVisible(campaignId)) render();
};

const ensureCampaignOperations = async (campaignId, { force = false, notify = true } = {}) => {
  if (!isLiveMode()) return { status: "demo", campaign: campaignById(campaignId) || null };
  const campaign = campaignById(campaignId);
  if (!campaign) return { status: "unavailable", error: new Error("Campaign not found"), campaign: null };
  const version = (campaignOperationsRequestVersion.get(campaignId) || 0) + 1;
  campaignOperationsRequestVersion.set(campaignId, version);
  replaceCampaign(campaignId, {
    ...campaign,
    operationsLoadState: {
      status: force ? "refreshing" : "loading",
      requestedAt: new Date().toISOString()
    }
  });
  if (campaignOperationsAreVisible(campaignId)) render();

  const result = await campaignOperationsLoader.load(campaign, { force });
  if (campaignOperationsRequestVersion.get(campaignId) !== version) return { ...result, stale: true };
  const latestCampaign = campaignById(campaignId) || campaign;
  if (result.status === "ready") {
    try {
      const merged = mergeCampaignOperationsView(latestCampaign, result.rawOperations);
      const relationshipAssumptions = Array.isArray(
        result.rawOperations?.assistedImportRelationshipAssumptions
      ) ? result.rawOperations.assistedImportRelationshipAssumptions.slice(0, 100) : [];
      replaceCampaign(campaignId, {
        ...merged,
        assistedImportRelationshipAssumptions: relationshipAssumptions,
        assistedImportRelationshipState:
          result.rawOperations?.assistedImportRelationshipState || { status: "unavailable" },
        operationsLoadState: {
          status: "ready",
          loadedAt: new Date().toISOString(),
          fromCache: result.fromCache === true
        }
      });
      await ensureCampaignEntityEvidence(campaignId, { force });
    } catch (error) {
      const unavailable = {
        status: "unavailable",
        fromCache: false,
        campaign: latestCampaign,
        error: error instanceof Error ? error : new Error("Campaign operations are unavailable")
      };
      replaceCampaign(campaignId, {
        ...latestCampaign,
        operationsLoadState: { status: "unavailable", failedAt: new Date().toISOString() }
      });
      if (campaignOperationsAreVisible(campaignId)) render();
      if (notify) showToast("Operations unavailable. Try again in a moment.");
      return unavailable;
    }
  } else {
    replaceCampaign(campaignId, {
      ...latestCampaign,
      operationsLoadState: { status: "unavailable", failedAt: new Date().toISOString() }
    });
    if (notify) showToast("Operations unavailable. Try again in a moment.");
  }
  if (campaignOperationsAreVisible(campaignId)) render();
  return result;
};

const loadCampaignWorkspace = async (campaignId, { force = false, notify = true } = {}) => {
  if (isCostcoOverviewCampaignId(campaignId)) return;
  void force;
  const [assignmentsResult, creatorsResult] = await Promise.allSettled([
    refreshCampaignAssignments(campaignId),
    loadCreatorPicker()
  ]);
  if (campaignOperationsAreVisible(campaignId)) render();
  if (assignmentsResult.status === "rejected" && notify) {
    showToast("Campaign details opened, but the creator roster could not be loaded.");
  } else if (creatorsResult.status === "rejected" && notify) {
    showToast("Campaign details opened, but creator names could not be loaded.");
  }
  return {
    assignmentsStatus: assignmentsResult.status === "fulfilled" ? "ready" : "unavailable",
    assignmentsError: assignmentsResult.status === "rejected" ? assignmentsResult.reason : null,
    creatorsStatus: creatorsResult.status === "fulfilled" ? "ready" : "unavailable",
    creatorsError: creatorsResult.status === "rejected" ? creatorsResult.reason : null
  };
};

const postRefreshCommands = async (commands, concurrency = 6) => {
  let cursor = 0;
  let queued = 0;
  let failures = 0;
  const workers = Array.from({ length: Math.min(concurrency, commands.length) }, async () => {
    while (cursor < commands.length) {
      const command = commands[cursor];
      cursor += 1;
      try {
        await requestJson("/api/campaign-operations", {
          method: "POST",
          body: command,
          csrf: true
        });
        queued += 1;
      } catch {
        failures += 1;
      }
    }
  });
  await Promise.all(workers);
  return { queued, failures };
};

const queueExactPostRefresh = async (campaign) => {
  if (!canUseAction("verify_post", campaign)) {
    showToast("Your role can view SocialCrawl status but cannot queue refresh work.");
    return;
  }
  const plan = buildExactPostRefreshCommands(campaign);
  const skipped = plan.skippedIneligible + plan.skippedLimit;
  replaceCampaign(campaign.id, {
    ...campaign,
    operationsLoadState: { status: "refreshing", requestedAt: new Date().toISOString() }
  });
  if (campaignOperationsAreVisible(campaign.id)) render();
  const outcome = plan.commands.length
    ? await postRefreshCommands(plan.commands)
    : { queued: 0, failures: 0 };
  const reload = await ensureCampaignOperations(campaign.id, { force: true, notify: false });
  const reloadMessage = reload.status === "ready"
    ? " Live status reloaded."
    : " Status unavailable.";
  showToast(
    `${outcome.queued} exact-post refresh${outcome.queued === 1 ? "" : "es"} queued; ` +
    `${skipped} skipped; ${outcome.failures} failed to queue.${reloadMessage}`
  );
};

const sourceUsage = (source) => {
  let history = [];
  if (source.category === "Acquisition") {
    history = state.campaigns.flatMap((campaign) =>
      campaign.assignments
        .filter((assignment) => assignment.acquisitionSource === source.name)
        .map((assignment) => ({ campaign, assignment }))
    );
  } else if (source.id === "SRC-SHEETS-PAID" || (source.type === "Google Sheets" && /paid/i.test(source.name))) {
    history = state.campaigns
      .filter((campaign) => campaign.type === "Paid")
      .flatMap((campaign) => campaign.assignments.map((assignment) => ({ campaign, assignment })));
  } else if (source.id === "SRC-SHEETS-SEEDING" || (source.type === "Google Sheets" && /seed/i.test(source.name))) {
    history = state.campaigns
      .filter((campaign) => campaign.type === "Seeding")
      .flatMap((campaign) => campaign.assignments.map((assignment) => ({ campaign, assignment })));
  } else if (source.id === "SRC-GMAIL" || source.type === "Gmail") {
    history = state.campaigns.flatMap((campaign) => {
      const postHistory = campaign.assignments
        .filter((assignment) => assignment.post?.source === "Gmail thread")
        .map((assignment) => ({ campaign, assignment }));
      const threadHistory = (campaign.gmailThreads || []).map((thread) => ({
        campaign,
        assignment:
          campaign.assignments.find((assignment) => assignment.creatorId === thread.creatorId) ||
          { creatorId: thread.creatorId }
      }));
      return [...postHistory, ...threadHistory];
    });
  }
  return {
    history,
    creators: unique(history.map(({ assignment }) => assignment.creatorId)),
    campaigns: unique(history.map(({ campaign }) => campaign.id)),
    imports: state.importRuns.filter((run) => run.sourceId === source.id)
  };
};

const campaignActivities = (campaignId) =>
  state.activityUpdates
    .filter((update) => update.campaignId === campaignId)
    .sort((a, b) => `${b.createdAt}-${b.id}`.localeCompare(`${a.createdAt}-${a.id}`));

const creatorHistory = (creatorId) =>
  state.campaigns.flatMap((campaign) =>
    campaign.assignments
      .filter((assignment) => assignment.creatorId === creatorId)
      .map((assignment) => ({ campaign, assignment }))
  );

const collaborationMixLabel = (paidCount, seedingCount, fallback = "No history") => {
  if (paidCount > seedingCount) return "Mostly paid";
  if (seedingCount > paidCount) return "Mostly seeding";
  if (paidCount && seedingCount) return "Even paid / seeding";
  if (paidCount) return "Paid only";
  if (seedingCount) return "Seeding only";
  return fallback || "No history";
};

const daysAgoLabel = (days) => {
  if (!Number.isFinite(days)) return "No dated history";
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
};

const creatorStats = (creatorId) => {
  const creator = creatorById(creatorId);
  const relationshipSummary = creator?.relationshipSummary || {};
  const stageSummary = relationshipSummary.stageSummary || {};
  const history = creatorHistory(creatorId);
  const finished = history.filter(({ campaign }) => ["Completed", "Closeout"].includes(campaign.status));
  const verified = history.filter(
    ({ assignment }) =>
      assignment.post?.verified && assignment.performance?.verified && Number.isFinite(assignment.performance.views)
  );
  const paidRates = history.map(({ assignment }) => assignment.rate).filter((value) => Number.isFinite(value));
  const today = new Date().toISOString().slice(0, 10);
  const completedDates = history
    .map(({ campaign, assignment }) =>
      ["Completed", "Closeout"].includes(campaign.status)
        ? assignment.post?.postedDate || campaign.endDate
        : null
    )
    .filter(Boolean)
    .filter((value) => String(value).slice(0, 10) <= today)
    .sort();
  const onTimeCount = finished.filter(({ assignment }) => assignment.onTime).length;
  const lastWorkedCandidates = [...completedDates, stageSummary.lastCompleted]
    .filter(Boolean)
    .filter((value) => String(value).slice(0, 10) <= today)
    .sort();
  const lastWorked = lastWorkedCandidates.at(-1) || null;
  const lastContacted = !lastWorked ? stageSummary.lastContacted || null : null;
  const derivedPaidCount = history.filter(({ campaign, assignment }) =>
    ["paid", "hybrid"].includes(
      String(assignment.engagementType || campaign.type).toLowerCase()
    )
  ).length;
  const derivedSeedingCount = history.filter(({ campaign, assignment }) =>
    ["seeding", "hybrid"].includes(
      String(assignment.engagementType || campaign.type).toLowerCase()
    )
  ).length;
  const hasSummaryCounts = Number(relationshipSummary.campaignCount) > 0;
  const paidCampaignCount = hasSummaryCounts
    ? Number(relationshipSummary.paidCampaignCount) || 0
    : derivedPaidCount;
  const seedingCampaignCount = hasSummaryCounts
    ? Number(relationshipSummary.seedingCampaignCount) || 0
    : derivedSeedingCount;
  const summaryHistory = Array.isArray(relationshipSummary.campaignHistory)
    ? relationshipSummary.campaignHistory
    : [];
  const brands = unique([
    ...(Array.isArray(relationshipSummary.brands) ? relationshipSummary.brands : []),
    ...summaryHistory.map((item) => item?.brand),
    ...history.map(({ campaign }) => campaign.brand)
  ].filter(Boolean));
  const daysSinceLastWorked = lastWorked
    ? Math.max(0, Math.floor((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${String(lastWorked).slice(0, 10)}T00:00:00Z`)) / 86_400_000))
    : null;
  const daysSinceLastContacted = lastContacted
    ? Math.max(0, Math.floor((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${String(lastContacted).slice(0, 10)}T00:00:00Z`)) / 86_400_000))
    : null;
  return {
    history,
    campaignCount: hasSummaryCounts ? Number(relationshipSummary.campaignCount) : history.length,
    completedCount: finished.length,
    avgViews: average(verified.map(({ assignment }) => assignment.performance.views)),
    avgEngagement: verified.length
      ? verified.reduce((total, { assignment }) => total + assignment.performance.engagementRate, 0) /
        verified.length
      : null,
    typicalFee: average(paidRates),
    minFee: paidRates.length ? Math.min(...paidRates) : null,
    maxFee: paidRates.length ? Math.max(...paidRates) : null,
    reliability: finished.length ? Math.round((onTimeCount / finished.length) * 100) : null,
    lastWorked,
    daysSinceLastWorked,
    lastContacted,
    daysSinceLastContacted,
    paidCampaignCount,
    seedingCampaignCount,
    collaborationMix: collaborationMixLabel(
      paidCampaignCount,
      seedingCampaignCount,
      relationshipSummary.primaryCollaborationType
    ),
    brands,
    campaignHistory: summaryHistory.length
      ? summaryHistory
      : history.map(({ campaign, assignment }) => ({
          id: campaign.id,
          name: campaign.name,
          brand: campaign.brand,
          type: campaign.type,
          status: campaign.status,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          paymentStatus: assignment.paymentStatus,
          paidAmount: assignment.rate
        })),
    sources: unique(history.map(({ assignment }) => assignment.acquisitionSource)),
    clients: unique(history.map(({ campaign }) => campaign.client))
  };
};

const campaignGaps = (campaign) => {
  const assignments = campaign.assignments;
  return {
    missingPosts: assignments.filter((assignment) => !assignment.post).length,
    unverifiedPosts: assignments.filter((assignment) => assignment.post && !assignment.post.verified).length,
    missingMetrics: assignments.filter(
      (assignment) => assignment.post?.verified && !assignment.performance?.verified
    ).length,
    paymentExceptions: assignments.filter((assignment) =>
      /pending|overdue/i.test(assignment.paymentStatus)
    ).length
  };
};

const verifiedPostCount = (campaign) =>
  campaign.assignments.filter((assignment) => assignment.post?.verified).length;

const recommendCreators = ({ category, platform, maxFee, maxDistance }) =>
  state.creators
    .filter((creator) => creatorPoolMembership(creator) === "reactivation")
    .map((creator) => {
      const stats = creatorStats(creator.id);
      const activation = creator.activation || {};
      const comparable = stats.history.filter(
        ({ campaign, assignment }) =>
          campaign.category === category &&
          ["Completed", "Closeout"].includes(campaign.status) &&
          assignment.post?.verified
      );
      const comparableViews = comparable
        .map(({ assignment }) => assignment.performance?.views)
        .filter(Number.isFinite);
      const distanceMiles = activation.closestWarehouse?.distanceMiles;
      const currentRate = activation.currentQuotedRate ?? stats.typicalFee;
      const withinDistance = Number.isFinite(distanceMiles) && distanceMiles <= Number(maxDistance);
      const categoryPoints = comparable.length ? Math.min(30, 20 + comparable.length * 5) : 0;
      const distancePoints = !Number.isFinite(distanceMiles) ? 0 : distanceMiles <= 10 ? 30 : distanceMiles <= 25 ? 25 : distanceMiles <= 50 ? 15 : 0;
      const reliabilityPoints = Math.round(((stats.reliability ?? 0) / 100) * 20);
      const platformPoints = platform === "All platforms" || creator.platforms.includes(platform) ? 10 : 0;
      const feePoints = !currentRate || currentRate <= Number(maxFee) ? 10 : 0;
      return {
        creator,
        stats,
        comparable,
        comparableAvgViews: average(comparableViews),
        currentRate,
        distanceMiles,
        withinDistance,
        score: categoryPoints + distancePoints + reliabilityPoints + platformPoints + feePoints
      };
    })
    .filter((result) => result.comparable.length > 0 && result.withinDistance)
    .sort((a, b) => b.score - a.score || a.distanceMiles - b.distanceMiles || (b.comparableAvgViews ?? 0) - (a.comparableAvgViews ?? 0));

const toneFor = (status) => {
  if (/published|completed|verified|paid|active/i.test(status)) return "good";
  if (/missing|overdue|needs|unverified|revision|pending/i.test(status)) return "warn";
  if (/planning|shortlisted|received|not due|not started/i.test(status)) return "neutral";
  return "muted";
};

const badge = (label, tone = toneFor(label)) =>
  `<span class="badge badge--${tone}">${escapeHtml(label)}</span>`;

const avatar = (creator, size = "medium") =>
  `<span class="avatar avatar--${size}" aria-hidden="true">${escapeHtml(creator.initials)}</span>`;

const creatorDisplayName = (creator) =>
  creatorDisplayLabel(creator || {});

const creatorSocialHandle = (creator) =>
  String(creator?.handle || "Social handle not recorded");

const creatorPoolMembership = (creator) => {
  const pool = String(creator?.operationalReadiness?.pool || "").toLowerCase();
  if (["reactivation", "needs_enrichment", "unqualified", "archived"].includes(pool)) return pool;
  if (!isLiveMode()) return creator?.status === "Archived" ? "archived" : "reactivation";
  return "unqualified";
};

const creatorIdentityMeta = (creator, { includeTier = true } = {}) => {
  const values = [];
  if (creator?.displayName && creator?.handle && creator.displayName !== creator.handle) values.push(creator.handle);
  values.push(...(creator?.platforms || []));
  if (includeTier && creator?.tier) values.push(creator.tier);
  return unique(values).join(" · ") || "Social identity not recorded";
};

const asOperationArray = (value) => Array.isArray(value) ? value.filter(Boolean) : value ? [value] : [];
const uniqueOperationRecords = (...collections) => {
  const seen = new Set();
  return collections.flatMap(asOperationArray).filter((record, index) => {
    const key = record?.id || `${record?.assignmentId || "record"}-${record?.postId || record?.deliverableId || index}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
const dayDistanceFromToday = (value) => {
  if (!value) return null;
  const candidate = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(candidate.getTime())) return null;
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((candidate.getTime() - today) / 86_400_000);
};
const recordsForAssignment = (campaign, assignment, key) => {
  const postIds = new Set(uniqueOperationRecords(assignment.posts, assignment.post).map((post) => post.id).filter(Boolean));
  return uniqueOperationRecords(
    assignment[key],
    asOperationArray(campaign[key]).filter((record) =>
      record.assignmentId === assignment.id || (key === "connectorJobs" && record.postId && postIds.has(record.postId))
    )
  );
};
const operationCreator = (assignment) => creatorDisplayName(creatorById(assignment.creatorId));
const isOpenCommunicationAction = (value) => Boolean(value) && !/^(?:none|no open|not required)/i.test(value);

const campaignOperations = (campaign) => {
  const replies = campaign.assignments.flatMap((assignment) => {
    const communications = recordsForAssignment(campaign, assignment, "communications");
    const campaignThreads = asOperationArray(campaign.gmailThreads).filter((record) => record.assignmentId === assignment.id);
    const latest = uniqueOperationRecords(communications, campaignThreads)
      .sort((a, b) => String(b.latestMessageAt || b.date || "").localeCompare(String(a.latestMessageAt || a.date || "")))[0];
    const attention = recordsForAssignment(campaign, assignment, "attentionItems")
      .find((item) => /reply|communication|follow up/i.test(item.type || ""));
    const nextAction = attention?.nextAction || latest?.nextAction || assignment.nextAction;
    const replyNeeded = latest?.replyNeeded === true || /reply/i.test(attention?.type || "");
    if (!replyNeeded && !isOpenCommunicationAction(nextAction)) return [];
    return [{
      label: operationCreator(assignment),
      status: replyNeeded ? "Reply needed" : "Next action",
      tone: replyNeeded ? "warn" : "neutral",
      detail: nextAction || "Review approved Gmail thread metadata",
      date: latest?.latestMessageAt || latest?.date || attention?.dueDate
    }];
  });

  const driveVersions = campaign.assignments.flatMap((assignment) => {
    const deliverableVersions = asOperationArray(assignment.deliverables?.length ? assignment.deliverables : assignment.deliverable)
      .flatMap((deliverable) => asOperationArray(deliverable?.versions));
    const versions = uniqueOperationRecords(
      recordsForAssignment(campaign, assignment, "contentVersions"),
      deliverableVersions
    ).sort((a, b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")));
    const latest = versions[0];
    const driveAsset = recordsForAssignment(campaign, assignment, "driveAssets")
      .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))[0];
    if (!latest && !driveAsset) return [];
    return [{
      label: operationCreator(assignment),
      status: latest?.status || driveAsset?.status || "Linked",
      tone: /approved|active|published/i.test(latest?.status || driveAsset?.status || "") ? "good" : "neutral",
      detail: `${latest?.label || driveAsset?.assetType || "Drive content asset"} · ${latest?.source || "Google Drive"}`,
      date: latest?.updatedAt || latest?.createdAt || driveAsset?.updatedAt
    }];
  });

  const shipmentExceptions = campaign.assignments.flatMap((assignment) =>
    recordsForAssignment(campaign, assignment, "shipments").flatMap((shipment) => {
      const overdueToStart = (dayDistanceFromToday(shipment.shipBy) ?? 1) < 0 &&
        /not started|pending|ready/i.test(shipment.status || "");
      const hasException = shipment.hasException === true || /delay|exception|failed|returned|lost/i.test(shipment.status || "");
      if (!overdueToStart && !hasException) return [];
      return [{
        label: operationCreator(assignment),
        status: shipment.exception || (overdueToStart ? "Shipment overdue" : shipment.status),
        tone: "warn",
        detail: `${shipment.product || "Campaign product"} · ${shipment.owner || "Owner unassigned"}`,
        date: shipment.shipBy
      }];
    })
  );

  const rightsExpiries = campaign.assignments.flatMap((assignment) => {
    const terms = uniqueOperationRecords(recordsForAssignment(campaign, assignment, "rightsTerms"), assignment.rights);
    return terms.flatMap((rights) => {
      const rows = [];
      if (rights.expiresAt) {
        const remaining = dayDistanceFromToday(rights.expiresAt);
        rows.push({
          label: `${operationCreator(assignment)} · usage rights`,
          status: remaining !== null && remaining < 0 ? "Expired" : remaining !== null && remaining <= 45 ? "Due soon" : "Recorded",
          tone: remaining !== null && remaining <= 45 ? "warn" : "good",
          detail: rights.usageType || "Usage terms recorded",
          date: rights.expiresAt
        });
      } else {
        rows.push({
          label: `${operationCreator(assignment)} · usage rights`,
          status: "Expiry missing",
          tone: "warn",
          detail: "Record the approved rights expiration",
          date: null
        });
      }
      if (rights.adCodeExpiresAt) {
        const remaining = dayDistanceFromToday(rights.adCodeExpiresAt);
        rows.push({
          label: `${operationCreator(assignment)} · ad code`,
          status: remaining !== null && remaining < 0 ? "Expired" : remaining !== null && remaining <= 45 ? "Due soon" : "Recorded",
          tone: remaining !== null && remaining <= 45 ? "warn" : "good",
          detail: "Paid-media access expiration",
          date: rights.adCodeExpiresAt
        });
      } else if (rights.whitelisting || /paid/i.test(rights.usageType || "")) {
        rows.push({
          label: `${operationCreator(assignment)} · ad code`,
          status: "Expiry missing",
          tone: "warn",
          detail: "Paid-media access exists, but no ad-code expiration is recorded",
          date: null
        });
      }
      return rows;
    });
  }).sort((a, b) => String(a.date || "9999-12-31").localeCompare(String(b.date || "9999-12-31")));

  const socialCrawlFreshness = campaign.assignments.flatMap((assignment) => {
    const posts = uniqueOperationRecords(assignment.posts, assignment.post);
    return posts.map((post) => {
      if (!post.verified) {
        return {
          label: `${operationCreator(assignment)} · ${post.platform || "Social post"}`,
          status: "Verification required",
          tone: "warn",
          detail: "SocialCrawl is blocked until this exact post is verified",
          date: post.postedDate
        };
      }
      const job = recordsForAssignment(campaign, assignment, "connectorJobs")
        .find((candidate) => /social\s*crawl/i.test(candidate.connector || "") && (!candidate.postId || candidate.postId === post.id));
      const liveStatus = recordsForAssignment(campaign, assignment, "socialcrawlStatus")
        .find((candidate) =>
          (!candidate.postId || candidate.postId === post.id) &&
          (!candidate.attributionId || candidate.attributionId === post.attributionId)
        );
      const primaryPost = assignment.post?.id === post.id || (!assignment.post?.id && assignment.post?.url === post.url);
      const refresh = liveStatus?.lastSuccessAt || liveStatus?.lastObservedAt || job?.lastSuccessAt ||
        (primaryPost ? assignment.performance?.socialCrawl?.lastSuccessfulRefresh : null) ||
        (primaryPost ? assignment.performance?.collectedAt : null);
      const age = refresh ? -(dayDistanceFromToday(refresh) ?? 0) : null;
      const recordedState = liveStatus?.trackingState || "";
      const failed = Boolean(liveStatus?.lastErrorCode) || /failed|error/i.test(
        recordedState || job?.status || assignment.performance?.socialCrawl?.status || ""
      );
      const queued = liveStatus?.refreshActive === true || /queued|pending|running|refreshing/i.test(recordedState || job?.status || "");
      const status = failed
        ? "Refresh failed"
        : recordedState && !/not tracked|unknown/i.test(recordedState)
          ? recordedState
        : refresh
          ? age <= 8 ? "Fresh" : age <= 14 ? "Due soon" : "Stale"
          : queued ? "Queued" : liveStatus ? "Not tracked" : "No refresh record";
      return {
        label: `${operationCreator(assignment)} · ${post.platform || "Social post"}`,
        status,
        tone: /fresh/i.test(status) ? "good" : /queued|no refresh record/i.test(status) ? "neutral" : "warn",
        detail: refresh ? `Last exact-post snapshot ${formatDate(refresh)}` : "No exact-post snapshot yet",
        date: liveStatus?.nextRefreshAt || job?.nextRunAt || refresh
      };
    });
  });

  return { replies, driveVersions, shipmentExceptions, rightsExpiries, socialCrawlFreshness };
};

const renderOperationItems = (items, emptyText) => {
  if (!items.length) return `<div class="operation-empty">${escapeHtml(emptyText)}</div>`;
  const visible = items.slice(0, 4);
  return `<div class="operation-list">${visible.map((item) => `
    <div class="operation-item">
      <div><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.detail)}</small></div>
      <div>${badge(item.status, item.tone)}${item.date ? `<time datetime="${escapeHtml(item.date)}">${formatDate(item.date)}</time>` : ""}</div>
    </div>`).join("")}${items.length > visible.length ? `<small class="operation-more">${items.length - visible.length} more item${items.length - visible.length === 1 ? "" : "s"}</small>` : ""}</div>`;
};

const renderOperationCard = ({ title, items, emptyText, action = "" }) => `
  <article class="operation-card">
    <header><h3>${escapeHtml(title)}</h3><span class="operation-count">${items.length}</span></header>
    ${renderOperationItems(items, emptyText)}
    ${action ? `<footer>${action}</footer>` : ""}
  </article>`;
const renderCampaignOperations = (campaign) => {
  const operations = campaignOperations(campaign);
  const operationsState = campaign.operationsLoadState?.status;
  const operationsStatus = !isLiveMode()
    ? "Demo data"
    : operationsState === "loading"
      ? "Loading live operations…"
      : operationsState === "refreshing"
        ? "Refreshing live operations…"
        : operationsState === "unavailable"
          ? "Operations unavailable"
          : operationsState === "ready"
            ? "Live operations loaded"
            : "Live operations load when this campaign is opened";
  const costco = campaign.costcoContext || asOperationArray(campaign.costcoActivations)[0] || null;
  const activationWindow = costco?.activationStart || costco?.activationEnd
    ? `${costco?.activationStart ? formatDate(costco.activationStart) : "Start not recorded"} - ${costco?.activationEnd ? formatDate(costco.activationEnd) : "End not recorded"}`
    : "Not recorded";
  const operationsAction = isLiveMode() && operationsState === "unavailable"
    ? `<button class="button button--secondary button--small" data-action="retry-operations">Retry live operations</button>`
    : isLiveMode() && operationsState === "ready"
      ? `<button class="text-button" data-action="retry-operations">Reload</button>`
      : "";
  return `
    <section class="panel campaign-operations-panel">
      <div class="panel-heading operations-heading"><div><p class="eyebrow">Daily control room</p><h2>What needs attention</h2><p>Review campaign tasks and update the fields your team owns.</p></div><div class="operation-load-state"><span class="helper-text">${escapeHtml(operationsStatus)}</span>${operationsAction}</div></div>
      <div class="operations-grid">
        ${renderOperationCard({ title: "Replies & next actions", items: operations.replies, emptyText: "No replies or next actions need attention.", action: canUseAction("update_communication_action", campaign) ? `<button class="text-button" data-action="edit-communication-action">Manage</button>` : "" })}
        ${renderOperationCard({ title: "Drive content versions", items: operations.driveVersions, emptyText: "No Drive content version is linked." })}
        ${renderOperationCard({ title: "Shipment exceptions", items: operations.shipmentExceptions, emptyText: "No open shipment exception is recorded." })}
        ${renderOperationCard({ title: "Rights & ad-code expiry", items: operations.rightsExpiries, emptyText: "No rights or paid-media term is recorded.", action: canUseAction("update_rights", campaign) ? `<button class="text-button" data-action="edit-rights">Update</button>` : "" })}
        ${renderOperationCard({ title: "SocialCrawl freshness", items: operations.socialCrawlFreshness, emptyText: "No post is linked for tracking." })}
      </div>
      <div class="costco-context">
        <div><p class="eyebrow">Retail activation</p><h3>Costco context</h3></div>
        <dl>
          <div><dt>Retailer</dt><dd>${escapeHtml(costco?.retailer || "Not recorded")}</dd></div>
          <div><dt>Item reference</dt><dd>${escapeHtml(costco?.itemReference || "Not recorded")}</dd></div>
          <div><dt>Product</dt><dd>${escapeHtml(costco?.product || campaign.brand || "Not recorded")}</dd></div>
          <div><dt>Activation window</dt><dd>${escapeHtml(activationWindow)}</dd></div>
          <div><dt>Warehouse scope</dt><dd>${escapeHtml(costco ? `${costco.warehouseScope || "Not recorded"}${Number.isFinite(costco.warehouseCount) ? ` · ${costco.warehouseCount} warehouses` : ""}` : "Not recorded")}</dd></div>
          <div><dt>Channel / status</dt><dd>${escapeHtml(costco ? `${costco.channel || "Not recorded"} / ${costco.status || "Not recorded"}` : "Not recorded")}</dd></div>
        </dl>
      </div>
    </section>`;
};

const renderCampaignCorrespondence = (campaign) => {
  const items = uniqueOperationRecords(
    campaign.communicationStatus,
    campaign.gmailThreads,
    campaign.assignments.flatMap((assignment) => assignment.communications || []),
    state.crm.campaignViews[campaign.id]?.communications
  ).map((item) => {
    const assignment = item.assignmentId
      ? campaign.assignments.find((candidate) => candidate.id === item.assignmentId)
      : campaign.assignments.find((candidate) => candidate.creatorId === item.creatorId);
    return { ...item, creator: creatorById(item.creatorId || assignment?.creatorId) };
  }).sort((a, b) => String(b.latestMessageAt || b.date || "").localeCompare(String(a.latestMessageAt || a.date || "")));
  const visible = items.slice(0, 6);
  const latestOutgoing = items.map((item) => item.latestOutboundAt).filter(Boolean).sort().at(-1);
  const latestReply = items.map((item) => item.latestInboundAt).filter(Boolean).sort().at(-1);
  const next = items.find((item) => isOpenCommunicationAction(item.nextAction));
  return `
    <section class="panel campaign-correspondence">
      <div class="panel-heading"><div><p class="eyebrow">Communication</p><h2>Recent creator correspondence</h2></div><div class="page-actions">${canUseAction("link_gmail", campaign) ? `<button class="button button--secondary" data-action="link-thread">Link Gmail thread</button>` : ""}<button class="button button--primary" data-action="open-campaign-section" data-id="${escapeHtml(campaign.id)}" data-tab="communication">View all correspondence</button></div></div>
      <div class="communication-summary" aria-label="Communication summary"><div><span>Last outgoing contact</span><strong>${latestOutgoing ? formatDate(latestOutgoing) : "Not recorded"}</strong></div><div><span>Last reply</span><strong>${latestReply ? formatDate(latestReply) : "Not recorded"}</strong></div><div><span>Next action</span><strong>${escapeHtml(next?.nextAction || "None recorded")}</strong><small>${next ? `${escapeHtml(next.replyNeeded ? "Reply needed" : "Recorded follow-up")} · Owner: ${escapeHtml(next.owner || "Unassigned")}` : "No scheduled action is linked"}</small></div></div>
      <div class="correspondence-list">${visible.length ? visible.map((item) => `
        <article class="correspondence-row">
          <div class="correspondence-row__main"><div><strong>${escapeHtml(creatorDisplayName(item.creator))}</strong>${badge(item.replyNeeded ? "Reply needed" : "Up to date", item.replyNeeded ? "warn" : "good")}</div><p>${escapeHtml(item.approvedSubject || "Gmail conversation")}</p><small>${formatDate(item.latestMessageAt || item.date)}${Number.isFinite(item.messageCount) ? ` &middot; ${item.messageCount} message${item.messageCount === 1 ? "" : "s"}` : ""}</small></div>
          ${isOpenCommunicationAction(item.nextAction) ? `<div class="correspondence-row__action"><span>Next action</span><strong>${escapeHtml(item.nextAction)}</strong><small>${escapeHtml(item.replyNeeded ? "Reply needed" : "Recorded follow-up")} · Owner: ${escapeHtml(item.owner || "Unassigned")}</small></div>` : ""}
          <div class="correspondence-row__links">${canUseAction("update_communication_action", campaign) ? `<button class="text-button" data-action="edit-communication-action" data-thread="${escapeHtml(item.gmailThreadId || item.id || "")}">Set next action</button>` : ""}${item.href ? `<a class="external-link" href="${escapeHtml(item.href)}" target="_blank" rel="noreferrer">Open in Gmail &#8599;</a>` : `<span class="helper-text">Gmail link unavailable</span>`}</div>
        </article>`).join("") : `<div class="empty-state"><strong>No Gmail conversations are linked yet.</strong><span>Link a thread to keep campaign correspondence in one place.</span></div>`}</div>
    </section>`;
};
const renderCampaignBusinessContext = (campaign) => {
  const brandEvidence = campaign.brandAssistedImportEvidence || { status: "not_loaded", facts: [] };
  const productEvidence = Array.isArray(campaign.productAssistedImportEvidence)
    ? campaign.productAssistedImportEvidence
    : [];
  const statusText = (record) => {
    if (record?.status === "loading") return "Checking linked sources...";
    if (record?.status === "ready") return "Linked source details available";
    if (record?.status === "unavailable") return "Source details temporarily unavailable";
    return "Source details load with this campaign";
  };
  const sourceLink = (record) => {
    const source = (record?.facts || []).find((fact) => fact?.sourceUrl)?.sourceUrl;
    return source ? `<a class="external-link" href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">Open reference &#8599;</a>` : "";
  };
  const products = productEvidence.length
    ? productEvidence
    : [{
        productName: campaign.costcoContext?.productName || campaign.costcoContext?.product || "Not recorded",
        status: campaign.operationsLoadState?.status === "ready" ? "unavailable" : "not_loaded",
        facts: []
      }];
  return `
    <section class="panel campaign-business-context">
      <div class="panel-heading"><div><p class="eyebrow">Campaign context</p><h2>Brand and product context</h2></div></div>
      <div class="campaign-context-grid">
        <article><span>Brand</span><strong>${escapeHtml(campaign.brand || "Not recorded")}</strong><small>${escapeHtml(statusText(brandEvidence))}</small>${sourceLink(brandEvidence)}</article>
        ${products.map((product) => `<article><span>Product</span><strong>${escapeHtml(product.productName || "Not recorded")}</strong><small>${escapeHtml(statusText(product))}</small>${sourceLink(product)}</article>`).join("")}
      </div>
    </section>`;
};
const setRoute = (view, details = {}, { history = true } = {}) => {
  if (history) ++routeRestoreVersion;
  clearPaidJourneyCache();
  const nextView = view === "home" ? defaultView : view;
  if (crmGateway) state.crm.error = null;
  state.view = validViews.has(nextView) ? nextView : defaultView;
  Object.assign(state, details);
  if (state.view !== "report") state.selectedReportVersionId = null;
  const next = new URLSearchParams();
  if (!isLiveMode() && new URLSearchParams(window.location.search).get("theme") === "botanical") next.set("theme", "botanical");
  next.set("view", state.view);
  if (state.view === "settings") next.set("settingsTab", settingsTab);
  if (state.view === "creator") next.set("creator", state.selectedCreatorId);
  if (state.view === "campaign") {
    next.set("campaign", state.selectedCampaignId);
    if (state.campaignTab !== 'summary') next.set('campaignTab', state.campaignTab);
  }
  if (state.view === 'creator' && state.profileTab !== 'overview') next.set('profileTab', state.profileTab);
  if(state.view==='campaigns'){
    if(state.campaignTypeFilter)next.set('campaignType',state.campaignTypeFilter);
    if(state.campaignStatusFilter)next.set('campaignStatus',state.campaignStatusFilter);
    if(state.campaignSearch)next.set('campaignQ',state.campaignSearch);
  }
  const url = `${window.location.pathname}?${next.toString()}`;
  if (history && url !== `${window.location.pathname}${window.location.search}`) window.history.pushState({}, "", url);
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
  if (state.view === "calendar") void calendarController.load();
  // Refresh the first bounded page whenever staff return to the directory so
  // another staff member's newly created manual record becomes visible.
  if ((isLiveMode() || state.runtime.creatorProfilePreview) && state.view === "creators" && !state.creatorPage.loading) {
    void loadCreatorPage({background:true});
  }
  if (isLiveMode() && state.view === "video-tracking" && !state.videoTracking.loading) {
    void loadVideoTracking();
  }
  if (isLiveMode() && state.view === "creator" && state.selectedCreatorId) {
    void loadCreatorDetail(state.selectedCreatorId);
  }
};
const syncCampaignUrl=()=>{
  if(state.view!=='campaigns')return;
  const url=new URL(window.location.href);
  for(const [key,value] of [['campaignType',state.campaignTypeFilter],['campaignStatus',state.campaignStatusFilter],['campaignQ',state.campaignSearch]]){
    if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);
  }
  window.history.replaceState(window.history.state,'',`${url.pathname}${url.search}`);
};

const icon = materialIcon;

const assignmentWorkflowStatus = (assignment) => {
  const override = assignment.workflowStatus?.override;
  const manual = assignment.workflowStatus?.manual;
  if (override) return override;
  if (manual && manual !== "Confirmed") return manual;
  return assignment.workflowStatus?.calculated || assignment.status || manual || "Potential";
};

const matchesRosterView = (assignment, view) => {
  const status = assignmentWorkflowStatus(assignment).toLowerCase();
  if (view === "All creators") return true;
  if (view === "Prospects") return ["potential", "shortlisted"].includes(status);
  if (view === "Contacted") return status === "contacted";
  if (view === "Negotiating") return status === "negotiating";
  if (view === "Confirmed") return status === "confirmed";
  if (view === "Creating / Revising") return /creating|revising|revision/.test(status);
  if (view === "Approved") return status === "approved";
  if (view === "Posted") return /partially posted|published|posted/.test(status);
  if (view === "Complete") return /complete|completed/.test(status);
  if (view === "Declined / Unresponsive") return ["declined", "unresponsive"].includes(status);
  return true;
};

const reportBuilderModules = Object.freeze([
  "Campaign summary and objectives",
  "Verified platform performance"
]);
const reportBuilderMetrics = Object.freeze([
  "Views",
  "Likes",
  "Comments",
  "Saves",
  "Shares"
]);

state.reportModuleOrder = [...reportBuilderModules];
state.reportModuleVisibility = Object.fromEntries(reportBuilderModules.map((module) => [module, true]));
state.reportMetricVisibility = Object.fromEntries(reportBuilderMetrics.map((metric) => [metric, metric === "Views"]));
state.reportBuilderBranding = "BYOU + client";
state.reportBuilderExpiration = "2026-10-31";

const navItem = (view, label, glyph, activeViews = [view]) => `
  <button type="button" class="nav-item ${activeViews.includes(state.view) ? "is-active" : ""}" data-action="${view === "search" ? "open-search" : "navigate"}" data-view="${view}" aria-label="${label}"${activeViews.includes(state.view) ? ' aria-current="page"' : ""}>
    <span class="nav-glyph" aria-hidden="true">${icon(glyph)}</span>
    <span>${label}</span>
  </button>`;

const pageHeader = ({ eyebrow = "BYOU workspace", title, description, actions = "" }) => `
  <header class="page-header">
    <div>
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h1>${escapeHtml(title)}</h1>
      ${description ? `<p class="page-description">${escapeHtml(description)}</p>` : ""}
    </div>
    ${actions ? `<div class="page-actions">${actions}</div>` : ""}
  </header>`;

const renderHome = () => {
  const active = state.campaigns.filter((campaign) => ["Active", "Closeout", "Planning"].includes(campaign.status));
  const paymentExceptions = state.campaigns.flatMap((campaign) => campaign.assignments).filter((assignment) =>
    /pending|overdue/i.test(assignment.paymentStatus)
  ).length;
  const reportsNeedingWork = state.campaigns.filter((campaign) =>
    ["Needs data", "Not ready"].includes(campaign.reportStatus)
  ).length;
  const topCreators = state.creators
    .map((creator) => ({ creator, stats: creatorStats(creator.id) }))
    .filter(({ stats }) => stats.avgViews)
    .sort((a, b) => b.stats.reliability - a.stats.reliability || b.stats.avgViews - a.stats.avgViews)
    .slice(0, 4);
  const attention = active
    .map((campaign) => {
      const latest = campaignActivities(campaign.id)[0];
      const gaps = campaignGaps(campaign);
      const gapCount = gaps.missingPosts + gaps.unverifiedPosts + gaps.missingMetrics + gaps.paymentExceptions;
      return {
        campaign,
        label: latest?.status || campaign.status,
        detail:
          latest?.nextAction ||
          (gapCount ? `${gapCount} visible workflow gap${gapCount === 1 ? "" : "s"}` : "Review campaign progress")
      };
    })
    .slice(0, 5);
  const todayLabel = displayDate(new Date());
  const firstName = state.currentUser.name.split(/\s+/)[0] || "there";

  return `
    ${pageHeader({
      eyebrow: todayLabel,
      title: `Welcome, ${firstName}`,
      description: "Start with the work that needs an owner today.",
      actions: `
        <button class="button button--secondary" data-action="new-campaign">New campaign</button>
        ${isLiveMode()
          ? `<button class="button button--primary" data-action="navigate" data-view="creators">Open creator directory</button>`
          : `<button class="button button--primary" data-action="open-finder">Find creators</button>`}`
    })}

    <section class="summary-strip" aria-label="Workspace summary">
      <div><strong>${active.length}</strong><span>Open campaigns</span></div>
      <div><strong>${reportsNeedingWork}</strong><span>Reports need data</span></div>
      <div><strong>${paymentExceptions}</strong><span>Payment approvals</span></div>
      <div><strong>${state.creators.length}</strong><span>Creators worked with</span></div>
    </section>

    <div class="home-grid">
      <section class="panel panel--large">
        <div class="panel-heading">
          <div><p class="eyebrow">My work</p><h2>What needs attention</h2></div>
          <button class="text-button" data-action="navigate" data-view="campaigns">View all campaigns</button>
        </div>
        <div class="action-list">${attention.length ? attention.map(({ campaign, label, detail }, index) => `
          <button class="action-row" data-action="open-campaign" data-id="${campaign.id}">
            <span class="action-marker action-marker--${["coral", "gold", "green"][index % 3]}"></span>
            <span><strong>${escapeHtml(campaign.name)}</strong><small>${escapeHtml(detail)}</small></span>
            ${badge(label)}
            <span class="row-arrow" aria-hidden="true">&#8594;</span>
          </button>`).join("") : `<div class="empty-state"><strong>No open campaigns need attention.</strong><span>Completed history remains available in Campaigns and Reports.</span></div>`}</div>
      </section>

      <section class="panel">
        <div class="panel-heading">
          <div><p class="eyebrow">Creator intelligence</p><h2>Reliable repeat partners</h2></div>
        </div>
        <div class="mini-creator-list">
          ${topCreators.length ? topCreators
            .map(
              ({ creator, stats }) => `
                <button data-action="open-creator" data-id="${creator.id}" class="mini-creator">
                  ${avatar(creator, "small")}
                  <span><strong>${escapeHtml(creatorDisplayName(creator))}</strong><small>${escapeHtml(creatorIdentityMeta(creator, { includeTier: false }))} · ${stats.campaignCount} campaign${stats.campaignCount === 1 ? "" : "s"} · ${stats.reliability}% on time</small></span>
                  <span class="metric-value">${formatCompact(stats.avgViews)}</span>
                </button>`
            )
            .join("") : `<div class="empty-state"><strong>No verified performance history yet.</strong><span>Creators will rank here after exact posts and metrics are verified.</span></div>`}
        </div>
        <button class="button button--soft button--full" data-action="navigate" data-view="creators">Open creator directory</button>
      </section>
    </div>`;
};

const renderCreators = () => {
  if(!state.creatorLibrary.showManaged)return '<div class="ops-creator-layout"><main>'+renderCreatorLibrary({...state.creatorLibrary,selectionBusy:campaignOps.selectionBusy})+'</main>'+campaignOps.selectionToolbar()+'</div>';
  const canCreate = canCreateManualCreator();
  const allCategories = unique(state.creators.flatMap((creator) => creator.categories || [])).sort();
  const allPlatforms = unique(state.creators.flatMap((creator) => creator.platforms || [])).sort();
  const allWarehouses = unique(
    state.creators.map((creator) => creator.activation?.closestWarehouse?.name)
  ).sort();
  const queryText = state.creatorSearch.trim().toLowerCase();
  const filtered = state.creators
    .filter((creator) => {
      const warehouse = creator.activation?.closestWarehouse || {};
      const matchesSearch = !queryText || [
        creatorDisplayName(creator),
        creatorSocialHandle(creator),
        creator.byouCode,
        creator.id
      ].some((value) => String(value || "").toLowerCase().includes(queryText));
      const matchesCategory = state.creatorCategory === "All categories"
        || (creator.categories || []).includes(state.creatorCategory);
      const matchesPlatform = state.creatorPlatform === "All platforms"
        || (creator.platforms || []).includes(state.creatorPlatform);
      const matchesWarehouse = state.creatorWarehouse === "All Costco warehouses"
        || warehouse.name === state.creatorWarehouse;
      const matchesDistance = state.creatorDistance === "Any distance"
        || (Number.isFinite(warehouse.distanceMiles)
          && warehouse.distanceMiles <= Number(state.creatorDistance));
      return matchesSearch && matchesCategory && matchesPlatform && matchesWarehouse && matchesDistance;
    })
    .sort((a, b) => {
      if (state.creatorSort === "distance") {
        return (a.activation?.closestWarehouse?.distanceMiles ?? Number.POSITIVE_INFINITY)
          - (b.activation?.closestWarehouse?.distanceMiles ?? Number.POSITIVE_INFINITY);
      }
      if (state.creatorSort === "campaigns") {
        return (b.relationshipSummary?.campaignCount || 0) - (a.relationshipSummary?.campaignCount || 0);
      }
      const aContact = a.relationshipSummary?.stageSummary?.lastContacted || "";
      const bContact = b.relationshipSummary?.stageSummary?.lastContacted || "";
      return String(bContact).localeCompare(String(aContact));
    });

  return `
    ${pageHeader({
      eyebrow: "Creator records",
      title: "Creators",
      description: "Maintain creator profiles and open their read-only campaign history.",
      actions: `<button class="button button--secondary" data-action="library-network">Creator cards</button>${canCreate ? `<button class="button button--primary" data-action="new-creator">Create creator</button>` : ""}`
    })}
    <section class="panel creator-directory">
      <div class="directory-toolbar">
        <label class="search-box">
          <span aria-hidden="true">&#8981;</span>
          <input type="search" data-field="creator-search" value="${escapeHtml(state.creatorSearch)}" placeholder="Search name, handle, or BYOU ID" aria-label="Search creators" />
        </label>
        <label><span class="sr-only">Category</span><select data-field="creator-category">
          ${["All categories", ...allCategories].map((value) => `<option ${state.creatorCategory === value ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}
        </select></label>
        <label><span class="sr-only">Platform</span><select data-field="creator-platform">
          ${["All platforms", ...allPlatforms].map((value) => `<option ${state.creatorPlatform === value ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}
        </select></label>
      </div>
      <div class="activation-filter-grid" aria-label="Creator location filters">
        <label><span>Closest Costco</span><select data-field="creator-warehouse">
          ${["All Costco warehouses", ...allWarehouses].map((value) => `<option ${state.creatorWarehouse === value ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}
        </select></label>
        <label><span>Maximum distance</span><select data-field="creator-distance">
          ${[["Any distance", "Any distance"], ["10", "Within 10 miles"], ["25", "Within 25 miles"], ["50", "Within 50 miles"]].map(([value, label]) => `<option value="${value}" ${state.creatorDistance === value ? "selected" : ""}>${label}</option>`).join("")}
        </select></label>
        <label><span>Sort</span><select data-field="creator-sort">
          <option value="recent" ${state.creatorSort === "recent" ? "selected" : ""}>Last contacted</option>
          <option value="distance" ${state.creatorSort === "distance" ? "selected" : ""}>Closest Costco first</option>
          <option value="campaigns" ${state.creatorSort === "campaigns" ? "selected" : ""}>Most campaigns</option>
        </select></label>
      </div>
      ${state.creatorPage.error ? `<div class="system-message system-message--error">${escapeHtml(state.creatorPage.error)}</div>` : ""}
      <div class="data-table creator-table activation-table" role="table" aria-label="Creators">
        <div class="table-row table-head" role="row">
          <span>Creator</span><span>Platform</span><span>Categories</span><span>Closest Costco</span><span>Last Contacted</span><span>Profile rates</span>
        </div>
        ${filtered.length ? filtered.map((creator) => {
          const warehouse = creator.activation?.closestWarehouse || {};
          const lastContacted = creator.relationshipSummary?.stageSummary?.lastContacted;
          const socialProfiles = Array.isArray(creator.socialProfiles) ? creator.socialProfiles : [];
          const profileCount = socialProfiles.length || (creator.platforms || []).length || 1;
          const recordedRateCount = socialProfiles.length
            ? socialProfiles.filter((profile) => Number.isFinite(profile.recentRate)).length
            : Number.isFinite(creator.activation?.currentQuotedRate) ? 1 : 0;
          return `<button class="table-row table-button" role="row" data-action="open-creator" data-id="${escapeHtml(creator.id)}">
            <span class="creator-cell">${avatar(creator, "small")}<span><strong>${escapeHtml(creatorDisplayName(creator))}</strong><small>${escapeHtml(creatorSocialHandle(creator))}</small></span></span>
            <span><strong>${escapeHtml((creator.platforms || []).join(", ") || "Not recorded")}</strong><small>${escapeHtml(creator.lifecycleStatus || creator.status || "Not recorded")}</small></span>
            <span><strong>${escapeHtml((creator.categories || []).join(", ") || "Not recorded")}</strong></span>
            <span><strong>${escapeHtml(warehouse.name || "Not recorded")}</strong><small>${Number.isFinite(warehouse.distanceMiles) ? `${warehouse.distanceMiles.toFixed(1)} miles` : "Distance not recorded"}</small></span>
            <span><strong>${formatDate(lastContacted)}</strong></span>
            <span><strong>${recordedRateCount} recorded</strong><small>${profileCount} profile${profileCount === 1 ? "" : "s"}</small></span>
          </button>`;
        }).join("") : `<div class="empty-state"><strong>${state.creatorPage.loading ? "Loading creators..." : "No creators match this view."}</strong>${state.creatorPage.loading ? "" : `<span>${canCreate ? "Create a creator or clear a filter." : "Clear a filter or ask an authorized relationship manager to create a record."}</span>${canCreate ? `<button class="button button--primary button--small" data-action="new-creator">Create creator</button>` : ""}`}</div>`}
      </div>
      ${state.creatorPage.hasMore ? `<button class="button button--secondary button--full" data-action="load-more-creators" ${state.creatorPage.loading ? "disabled" : ""}>${state.creatorPage.loading ? "Loading..." : "Load more creators"}</button>` : ""}
    </section>`;
};

const renderCreator = () => {
  const creator = creatorById(state.selectedCreatorId) || null;
  if (!creator) {
    const loading = state.creatorDetailLoadingId === state.selectedCreatorId;
    return `${pageHeader({ eyebrow: "Creator", title: "Creator profile", description: "" })}<section class="panel"><div class="empty-state"><strong>${loading ? "Opening creator profile" : "Creator unavailable"}</strong><span>${escapeHtml(state.creatorDetailError || "Return to Creators and choose an available record.")}</span><button class="button button--secondary" data-action="navigate" data-view="creators">All creators</button></div></section>`;
  }
  const stats = creatorStats(creator.id);
  const activation = creator.activation || {};
  const stageSummary = creator.relationshipSummary?.stageSummary || {};
  const socialProfiles = Array.isArray(creator.socialProfiles) && creator.socialProfiles.length
    ? creator.socialProfiles
    : creator.profileUrl ? [{
      platform: creator.platforms?.[0] || "other",
      handle: creator.handle,
      profileUrl: creator.profileUrl,
      recentRate: activation.currentQuotedRate,
      rateCurrency: activation.rateCurrency || "USD",
      rateEffectiveOn: activation.currentRateEffectiveOn,
      isPrimary: true
    }] : [];
  const communications = Array.isArray(creator.communications) ? creator.communications : [];
  const communicationLoadState = creator.communicationLoadState || "not_loaded";
  const tabs = [["overview", "Overview"], ["activation", "Activation fit"], ["campaigns", "Campaign history"], ["conversations", "Gmail conversations"]];
  let content = "";

  if (state.profileTab === "overview") {
    content = `
      <section class="relationship-summary-grid" aria-label="Creator summary">
        <article><span>Social profile rates</span><strong>${socialProfiles.filter((profile) => Number.isFinite(profile.recentRate)).length} recorded</strong><small>${socialProfiles.length} social profile${socialProfiles.length === 1 ? "" : "s"}</small></article>
        <article><span>Last Contacted</span><strong>${formatDate(stageSummary.lastContacted)}</strong><small>Staff-recorded relationship milestone</small></article>
        <article><span>Campaign history</span><strong>${stats.campaignCount}</strong><small>Derived from linked assignments</small></article>
        <article><span>Last worked together</span><strong>${formatDate(stats.lastWorked)}</strong><small>Derived history · read only</small></article>
      </section>
      <div class="detail-grid">
        <section class="panel">
          <div class="panel-heading"><div><p class="eyebrow">Public profile</p><h2>Creator details</h2></div>${canEditManualCreator(creator) ? `<button class="button button--secondary button--small" data-action="edit-creator" data-creator="${escapeHtml(creator.id)}">Edit Profile</button>` : ""}</div>
          <dl class="definition-list">
            <div><dt>Display name</dt><dd>${escapeHtml(creatorDisplayName(creator))}</dd></div>
            <div><dt>Social profiles</dt><dd>${socialProfiles.length ? `<div class="creator-social-profile-list">${socialProfiles.map((profile) => `<a class="external-link" href="${escapeHtml(profile.profileUrl)}" target="_blank" rel="noreferrer"><span>${escapeHtml(profile.platform || "Profile")}${profile.isPrimary ? " &middot; Primary" : ""}</span><strong>${escapeHtml(profile.handle ? `@${String(profile.handle).replace(/^@+/, "")}` : "Open profile")} &#8599;</strong><small>Recent rate: ${Number.isFinite(profile.recentRate) ? `${formatCurrency(profile.recentRate)} ${escapeHtml(profile.rateCurrency || "USD")}${profile.rateEffectiveOn ? ` · ${formatDate(profile.rateEffectiveOn)}` : ""}` : "Not recorded"}</small></a>`).join("")}</div>` : "Not recorded"}</dd></div>
            <div><dt>Lifecycle status</dt><dd>${escapeHtml(creator.lifecycleStatus || creator.status || "Not recorded")}</dd></div>
            <div><dt>Categories</dt><dd>${escapeHtml((creator.categories || []).join(", ") || "Not recorded")}</dd></div>
            <div><dt>Preferred formats</dt><dd>${escapeHtml((creator.preferredFormats || []).join(", ") || "Not recorded")}</dd></div>
          </dl>
        </section>
        <section class="panel">
          <div class="panel-heading"><div><p class="eyebrow">Internal context</p><h2>Internal note</h2></div></div>
          <p class="large-note">${escapeHtml(creator.note || "No internal note has been recorded.")}</p>
          <p class="helper-text">Public-profile fields can be updated with Edit Profile. Sensitive contact, address, tax, banking, and identity records remain in the separate private editor.</p>
        </section>
      </div>`;
  }

  if (state.profileTab === "activation") {
    const warehouse = activation.closestWarehouse || {};
    content = `
      <section class="activation-fit-grid" aria-label="Creator activation fit">
        <article class="panel activation-anchor">
          <div class="panel-heading"><div><p class="eyebrow">Activation Fit</p><h2>Closest Costco warehouse</h2></div>${canEditManualCreator(creator) ? `<button class="button button--secondary button--small" data-action="edit-creator" data-creator="${escapeHtml(creator.id)}">Edit Profile</button>` : ""}</div>
          <strong class="activation-anchor-name">${escapeHtml(warehouse.name || "Not recorded")}</strong>
          <p>${escapeHtml([warehouse.city, warehouse.state].filter(Boolean).join(", ") || "Location not recorded")}</p>
          <dl class="definition-list">
            <div><dt>Distance</dt><dd>${Number.isFinite(warehouse.distanceMiles) ? `${warehouse.distanceMiles.toFixed(1)} miles` : "Not recorded"}</dd></div>
            <div><dt>Estimated drive</dt><dd>${Number.isFinite(warehouse.estimatedMinutes) ? `${warehouse.estimatedMinutes} minutes` : "Not recorded"}</dd></div>
          </dl>
        </article>
      </section>`;
  }

  if (state.profileTab === "campaigns") {
    content = `<section class="panel">
      <div class="panel-heading"><div><p class="eyebrow">Read-only derived history</p><h2>${stats.history.length} campaign assignment${stats.history.length === 1 ? "" : "s"}</h2></div></div>
      <div class="data-table history-table">
        <div class="table-row table-head"><span>Campaign</span><span>Engagement</span><span>Assignment status</span><span>Fee</span><span>Due date</span><span></span></div>
        ${stats.history.length ? [...stats.history].sort((a, b) => String(b.campaign.endDate || "").localeCompare(String(a.campaign.endDate || ""))).map(({ campaign, assignment }) => { const display=assignmentRosterValues(assignment); return `<button class="table-row table-button" data-action="open-campaign" data-id="${escapeHtml(campaign.id)}" data-assignment="${escapeHtml(assignment.id)}">
          <span><strong>${escapeHtml(campaign.name)}</strong><small>${escapeHtml(campaign.brand || "Brand not recorded")}</small></span>
          <span><strong>${escapeHtml(assignment.engagementType || campaign.type || "Not recorded")}</strong></span>
          <span>${badge(display.status)}${display.statusSource ? "<small>Spreadsheet status</small>" : ""}${sourcePaymentLabel(assignment) ? `<small>${escapeHtml(sourcePaymentLabel(assignment))}</small>` : ""}</span>
          <span><strong>${campaignMoney(display.feeAmount,display.feeCurrency)}</strong>${display.feeSource ? "<small>Spreadsheet fee</small>" : display.feeNote ? `<small>${escapeHtml(display.feeNote)}</small>` : ""}</span>
          <span><strong>${display.dueDate ? formatDate(display.dueDate) : escapeHtml(display.dueRule || "Not recorded")}</strong>${display.dueSource ? "<small>Spreadsheet deadline</small>" : ""}</span>
          <span class="row-arrow" aria-hidden="true">&#8594;</span>
        </button>`; }).join("") : `<div class="empty-state"><strong>No linked campaign history.</strong><span>Campaign assignments appear here after they are saved from Manage Campaign Creators.</span></div>`}
      </div>
    </section>`;
  }

  if (state.profileTab === "conversations") {
    const visible = [...communications].sort((left, right) =>
      String(right.latestMessageAt || right.date || "").localeCompare(String(left.latestMessageAt || left.date || ""))
    );
    content = `<section class="panel creator-correspondence">
      <div class="panel-heading"><div><p class="eyebrow">Communication history</p><h2>${visible.length} linked Gmail conversation${visible.length === 1 ? "" : "s"}</h2></div>${canLinkCreatorGmail(creator) ? `<button class="button button--secondary button--small" data-action="link-creator-gmail" data-creator="${escapeHtml(creator.id)}">Link Gmail conversations</button>` : ""}</div>
      <p class="helper-text">Conversation bodies remain in Gmail. This shared creator record keeps approved thread context, activity, and follow-up status.</p>
      ${communicationLoadState === "unavailable" ? `<div class="system-message system-message--error">Conversation history is temporarily unavailable. The rest of the creator profile remains available.</div>` : ""}
      <div class="correspondence-list">${communicationLoadState === "unavailable" ? "" : communicationLoadState === "not_loaded" || state.creatorDetailLoadingId === creator.id ? `<div class="empty-state"><strong>Loading Gmail conversation history...</strong></div>` : visible.length ? visible.map((item) => {
        const campaign = campaignById(item.campaignId);
        const campaignName = item.campaignId
          ? item.campaignName || campaign?.name || "Campaign not recorded"
          : "General creator relationship";
        const brandName = item.campaignId
          ? item.brandName || campaign?.brand || "Brand not recorded"
          : "No campaign";
        return `<article class="correspondence-row">
          <div class="correspondence-row__main"><div><strong>${escapeHtml(item.approvedSubject || "Gmail conversation")}</strong>${badge(item.replyNeeded ? "Reply needed" : "Up to date", item.replyNeeded ? "warn" : "good")}</div><p>${escapeHtml(campaignName)} &middot; ${escapeHtml(brandName)}</p><small>${formatDate(item.latestMessageAt || item.date)}${Number.isFinite(item.messageCount) ? ` &middot; ${item.messageCount} message${item.messageCount === 1 ? "" : "s"}` : ""}</small></div>
          ${isOpenCommunicationAction(item.nextAction) ? `<div class="correspondence-row__action"><span>Next action</span><strong>${escapeHtml(item.nextAction)}</strong></div>` : ""}
          <div class="correspondence-row__links">${item.campaignId ? `<button class="text-button" data-action="open-campaign" data-id="${escapeHtml(item.campaignId)}">Open campaign</button>` : ""}${item.href ? `<a class="external-link" href="${escapeHtml(item.href)}" target="_blank" rel="noreferrer">Open in Gmail &#8599;</a>` : `<span class="helper-text">Gmail link unavailable</span>`}</div>
        </article>`;
      }).join("") : `<div class="empty-state"><strong>No Gmail conversations are linked to this creator.</strong><span>Use Link Gmail conversations to add a general relationship thread or a thread from one of this creator's campaigns.</span></div>`}</div>
    </section>`;
  }

  return `
    <button class="back-link" data-action="navigate" data-view="creators">&#8592; All creators</button>
    <section class="profile-hero">
      <div class="profile-identity">${avatar(creator, "large")}<div><p class="eyebrow">Creator profile</p><h1>${escapeHtml(creatorDisplayName(creator))}</h1><p>${escapeHtml(creatorIdentityMeta(creator))}</p></div></div>
      <div class="page-actions">${canEditManualCreator(creator) ? `<button class="button button--primary" data-action="edit-creator" data-creator="${escapeHtml(creator.id)}">Edit Profile</button>` : ""}${canLinkCreatorGmail(creator) ? `<button class="button button--secondary" data-action="link-creator-gmail" data-creator="${escapeHtml(creator.id)}">Link Gmail conversations</button>` : ""}${canEditCreatorPrivateProfile(creator) ? `<button class="button button--secondary" data-action="open-private-creator" data-creator="${escapeHtml(creator.id)}">Edit private profile</button>` : ""}</div>
    </section>
    ${state.creatorDetailError ? `<div class="system-message system-message--error">${escapeHtml(state.creatorDetailError)}</div>` : ""}
    <nav class="tabs" aria-label="Creator profile sections">${tabs.map(([id, label]) => `<button class="${state.profileTab === id ? "is-active" : ""}" data-action="profile-tab" data-tab="${id}">${label}</button>`).join("")}</nav>
    ${content}`;
};

let importedCampaignActivation = { items: null, loading: false, error: '', busy: '' };
const renderImportedCampaignActivation = () => {
  const s = importedCampaignActivation;
  if (s.items === null && !s.loading && !s.error) return '';
  return `<section class="panel" aria-label="Imported campaign activation"><h2>Activate an existing imported campaign</h2><p>Review the campaign, then activate its existing creator workflows. Historical records stay intact. Activation does not send email, confirm contracts, or approve content.</p>${s.loading ? '<p>Loading imported campaigns…</p>' : ''}${s.error ? `<p role="alert">${escapeHtml(s.error)}</p>` : ''}${(s.items || []).map(c => `<div class="campaign-view-toolbar"><strong>${escapeHtml(c.name)}</strong><span>${escapeHtml(c.type)} · ${c.creatorCount} existing creators</span><button class="button button--secondary" data-action="activate-imported-campaign" data-campaign="${escapeHtml(c.id)}" ${s.busy ? 'disabled' : ''}>${s.busy === c.id ? 'Activating…' : 'Approve & activate'}</button></div>`).join('')}${s.items?.length === 0 ? '<p>No imported campaigns are awaiting activation.</p>' : ''}</section>`;
};
const campaignListRecords = () => {
  const matchedIds = new Set();
  const sourcedCampaigns = state.costcoOverview.items.flatMap((item) => {
    const linkedCampaigns = linkedOverviewCampaigns(item);
    const linkedRows = linkedCampaigns.map((campaign) => {
      matchedIds.add(campaign.id);
      return { ...campaign, productName: campaign.sourceDetails?.staff_cleared_fields?.includes("product_name") ? campaign.productName : campaign.productName || item.product, launchDate: campaign.launchDate || item.launchDate,
        marketingStartDate: campaign.marketingStartDate || item.marketingStartDate,
        sourceUrl: item.sourceUrl, overviewId: item.id, sourceOnly: false };
    });
    if (linkedRows.length === 1) return linkedRows;
    return [{ ...item, productName: item.product, startDate: null, type: linkedRows.length ? "Overview" : "Not specified",
      status: "Not recorded", sourceOnly: true, linkedCampaigns, budget: null, creatorCount: null }, ...linkedRows];
  });
  return [...sourcedCampaigns, ...state.campaigns.filter((campaign) => !matchedIds.has(campaign.id))];
};

const linkedOverviewCampaigns = (item) => state.campaigns.filter((campaign) =>
  Number(campaign.sourceDetails?.overview_row) === Number(item.overviewRow || String(item.id).replace("costco-overview-", ""))
);
const campaignMoney = (amount, currency) => Number.isFinite(amount)
  ? `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(amount)} ${escapeHtml(currency || "Currency not recorded")}`
  : "Not recorded";
const campaignOwnerPayload = (campaign, value) => campaign && value !== "__source_manager__" ? { ownerId: value || null } : {};
const overviewSchedule = (item) => {
  if (!item.launchDate) return "Launch not scheduled";
  const today = new Intl.DateTimeFormat("en-CA", {timeZone:"America/Los_Angeles",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  return item.launchDate > today ? "Launch scheduled" : "Launch date reached";
};
const sourcePaymentLabel = (assignment) => ({reported_paid:"Source reports paid",reported_unpaid:"Source reports unpaid",invoice_received:"Source reports invoice received"})[assignment.sourceReportedPaymentStatus] || "";
const sourceStatusLabel = (assignment) => assignment.sourceStatus === "published_unverified" ? "Published (source link, unverified)"
  : assignment.sourceStatus && assignment.sourceStatus !== "not_recorded" ? assignment.sourceStatus.replaceAll("_", " ") : "";
const assignmentRosterValues = (assignment) => {
  const missing = value => !value || ["not recorded","unknown","imported review","pending review","campaign deliverable","missing"].includes(String(value).toLowerCase().replaceAll("_", " "));
  const sourceStatus=sourceStatusLabel(assignment), sourcePayment=sourcePaymentLabel(assignment), deliverable=assignment.deliverable || {};
  const statusSource=missing(assignment.status) && Boolean(sourceStatus);
  const importedFee=assignment.sourceDetails?.recorded_fee_authority === "imported_unverified";
  const feeSource=(!Number.isFinite(assignment.rate) || importedFee) && Number.isFinite(assignment.sourceFeeAmount) && assignment.sourceFeeScope === "single_creator";
  const feeNote=!feeSource && importedFee ? assignment.sourceFeeScope === "multi_creator" ? "Shared package; individual allocation not recorded" : assignment.sourceFeeScope === "unresolved" ? "Fee allocation unresolved" : "Imported fee unverified; see source details" : "";
  const deliverableSource=missing(deliverable.name) && Boolean(assignment.sourceDeliverableSummary);
  const recordedDue=deliverable.dueDate || deliverable.nextDueDate;
  const dueSource=!recordedDue && Boolean(assignment.sourceDueDate || assignment.sourceDetails?.source_deadline_rule);
  const paymentSource=missing(assignment.paymentStatus) && Boolean(sourcePayment);
  return {status:statusSource ? sourceStatus : assignment.status || "Not recorded",statusSource,
    feeAmount:feeSource ? assignment.sourceFeeAmount : importedFee ? null : assignment.rate,feeCurrency:feeSource ? assignment.sourceFeeCurrency : assignment.currency,feeSource,feeNote,
    deliverable:deliverableSource ? assignment.sourceDeliverableSummary : deliverable.name || "Not recorded",deliverableSource,
    dueDate:recordedDue || assignment.sourceDueDate,dueRule:!recordedDue && !assignment.sourceDueDate ? assignment.sourceDetails?.source_deadline_rule : null,dueSource,
    payment:paymentSource ? sourcePayment : assignment.paymentStatus || "Not recorded",paymentSource};
};
const renderAssignmentSourceSummary = (assignment) => {
  if (!assignment.sourceDetails) return "";
  const detail=assignment.sourceDetails;
  const field=(label,value)=>value ? `<small><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</small>` : "";
  const payment=sourcePaymentLabel(assignment);
  const status=sourceStatusLabel(assignment);
  return `<details class="assignment-source-details"><summary>Spreadsheet details</summary>
    ${field("Source status",status)}${field("Source payment",payment)}
    ${assignment.sourceReportedPaymentDate ? field("Source payment date",formatDate(assignment.sourceReportedPaymentDate)) : ""}
    ${Number.isFinite(assignment.sourceFeeAmount) ? `<small><strong>${assignment.sourceFeeScope === "multi_creator" ? "Shared package" : "Source fee"}:</strong> ${campaignMoney(assignment.sourceFeeAmount,assignment.sourceFeeCurrency)}${assignment.sourceFeeScope === "multi_creator" ? " (covers multiple creators)" : ""}</small>` : assignment.sourceFeeScope === "multi_creator" ? field("Source fee","Shared package; individual allocation not recorded") : ""}
    ${detail.recorded_fee_authority === "imported_unverified" && detail.recorded_fee_amount != null ? `<small><strong>Imported fee record (unverified):</strong> ${campaignMoney(Number(detail.recorded_fee_amount),detail.recorded_fee_currency)}</small>` : ""}
    ${field("Source deliverables",assignment.sourceDeliverableSummary)}
    ${assignment.sourceDueDate ? field("Source content due",formatDate(assignment.sourceDueDate)) : ""}
    ${assignment.sourcePaymentDueDate ? field("Source payment due",formatDate(assignment.sourcePaymentDueDate)) : ""}
    ${field("Source deadline rule",detail.source_deadline_rule)}${field("Source platform",detail.source_platform)}${field("Source manager",detail.source_owner_label)}
    ${["shipped","delivered","received","story","agreement"].map(key=>field(`Source ${key}`,detail[`source_${key}_status`]?.replaceAll("_"," "))).join("")}
    ${(assignment.sourcePostUrls || []).map(url=>`<a class="external-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Source post (unverified) &#8599;</a>`).join(" ")}
    ${assignment.sourceUrl ? `<a class="external-link" href="${escapeHtml(assignment.sourceUrl)}" target="_blank" rel="noopener noreferrer">View spreadsheet row &#8599;</a>` : ""}
    ${field("Source updated",detail.source_updated_at)}
  </details>`;
};

const renderCampaigns = () => {
  const canCreate = canCreateManualCampaign();
  const savedViews = readCampaignViews(window.localStorage, state.currentUser.id);
  const search = state.campaignSearch.trim().toLowerCase();
  const today = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date()).map((part) => [part.type, part.value]));
  const todayDate = `${today.year}-${today.month}-${today.day}`;
  const allCampaigns = campaignListRecords();
  const visibleCampaigns = allCampaigns.filter((campaign) => {
    const matchesSearch = !search || [campaign.name, campaign.productName, campaign.brand]
      .some((value) => String(value || "").toLowerCase().includes(search));
    return matchesSearch && (!state.campaignTypeFilter||String(campaign.type).toLowerCase()===state.campaignTypeFilter)
      && (!state.campaignStatusFilter||String(campaign.status).toLowerCase()===state.campaignStatusFilter);
  });
  const isUpcoming = (campaign) => campaign.sourceOnly
    ? campaign.launchDate > todayDate
    : String(campaign.status).toLowerCase() === "planning";
  const lifecycle = (campaign) => String(campaign.status || "").toLowerCase();
  const campaignGroups = [
    ["Upcoming", visibleCampaigns.filter(isUpcoming)],
    ["Active", visibleCampaigns.filter((campaign) => !isUpcoming(campaign) && lifecycle(campaign) === "active")],
    ["Completed", visibleCampaigns.filter((campaign) => !isUpcoming(campaign) && ["completed", "cancelled", "archived"].includes(lifecycle(campaign)))],
    ["Other records", visibleCampaigns.filter((campaign) => !isUpcoming(campaign) && !["active", "completed", "cancelled", "archived"].includes(lifecycle(campaign)))]
  ].map(([label, campaigns]) => [label, campaigns.sort((a, b) =>
    String(b.startDate || b.launchDate || "").localeCompare(String(a.startDate || a.launchDate || "")) || a.name.localeCompare(b.name)
  )]);
  const renderCampaignRows = (campaigns, label) => `<div class="data-table campaign-table campaign-directory-table" role="table" aria-label="${escapeHtml(label)} campaigns">
    <div class="table-row table-head" role="row"><span>Campaign</span><span>Brand / product</span><span>Type</span><span>Status</span><span>Person in charge</span><span>Start / launch date</span><span>Creators</span><span>Budget</span></div>
    ${campaigns.map((campaign) => `<button class="table-row table-button" role="row" data-action="open-campaign" data-id="${escapeHtml(campaign.id)}">
      <span><strong>${escapeHtml(campaign.name)}</strong><small>${campaign.sourceUrl ? "Costco Campaign Overview" : escapeHtml(campaign.campaignCode || "Code not recorded")}</small></span>
      <span><strong>${escapeHtml(campaign.brand || "Brand not recorded")}</strong><small>${escapeHtml(campaign.productName || "Product not recorded")}</small></span>
      <span>${badge(campaign.type || "Not specified", "neutral")}</span><span>${badge(campaign.status || "Not recorded")}${campaign.sourceOnly ? `<small>${overviewSchedule(campaign)}</small>` : campaign.sourceStatus ? `<small>Source: ${escapeHtml(campaign.sourceStatus)}</small>` : ""}</span>
      <span><strong>${escapeHtml(campaign.owner || "Unassigned")}</strong></span>
      <span class="campaign-date"><strong>${campaign.launchDate ? formatDate(campaign.launchDate) : campaign.startDate ? formatDate(campaign.startDate) : "Not recorded"}</strong>${campaign.launchDate ? "<small>Launch date</small>" : ""}</span>
      <span><strong>${campaign.sourceOnly ? campaign.linkedCampaigns?.length ? "See linked rosters" : "No roster linked" : campaign.creatorCount ?? (campaign.operationsLoadState?.status === "ready" ? (campaign.assignments || []).length : "Count unavailable")}</strong></span>
      <span><strong>${campaignMoney(campaign.sourceOnly ? campaign.totalBudget : campaign.budget, campaign.currency)}</strong><small>${campaign.sourceOnly ? "Overview total budget" : "Campaign allocation"}</small></span>
    </button>`).join("")}
  </div>`;
  return `
    ${pageHeader({
      eyebrow: "Campaign records",
      title: "Campaigns",
      description: "Create campaigns, maintain their core fields, and manage creator assignments.",
      actions: canCreate ? `<button class="button button--primary" data-action="new-campaign">Create campaign</button>${isLiveMode() ? '<button class="button button--secondary" data-action="load-imported-campaigns">Activate imported campaign</button>' : ''}` : ""
    })}
    ${renderImportedCampaignActivation()}
    <section class="panel campaign-list-panel">
      <div class="campaign-toolbar">
        <div class="campaign-independent-filters" aria-label="Campaign filters"><label>Type<select data-field="campaign-type-filter"><option value="">All types</option>${["paid","seeding","affiliate","other"].map(value=>`<option value="${value}" ${state.campaignTypeFilter===value?'selected':''}>${value[0].toUpperCase()+value.slice(1)}</option>`).join('')}</select></label><label>Status<select data-field="campaign-status-filter"><option value="">All statuses</option>${["planning","active","paused","closeout","completed","cancelled","archived"].map(value=>`<option value="${value}" ${state.campaignStatusFilter===value?'selected':''}>${value[0].toUpperCase()+value.slice(1)}</option>`).join('')}</select></label><button class="button button--secondary button--small" data-action="campaign-clear-filters" ${!state.campaignTypeFilter&&!state.campaignStatusFilter&&!state.campaignSearch?'disabled':''}>Clear filters</button></div>
        <label class="table-search"><span class="sr-only">Search campaigns</span>${icon("search")}<input data-field="campaign-search" value="${escapeHtml(state.campaignSearch)}" placeholder="Search campaigns" /></label>
      </div>
      <div class="campaign-view-toolbar"><label>Save current filters <input type="text" data-campaign-view-name maxlength="40" placeholder="View name" /></label><button type="button" class="button button--secondary button--small" data-action="campaign-save-view">Save view</button>${savedViews.length?`<div class="saved-views" aria-label="Saved campaign views">${savedViews.map(view=>`<span class="saved-view-item"><button type="button" data-action="campaign-load-view" data-name="${escapeHtml(view.name)}">${escapeHtml(view.name)}</button><button type="button" data-action="campaign-delete-view" data-name="${escapeHtml(view.name)}" aria-label="Delete saved view ${escapeHtml(view.name)}">×</button></span>`).join('')}</div>`:''}</div>
      <p class="table-meta" role="status">${state.campaignPage.loading || state.costcoOverview.loading ? "Loading campaigns…" : `${visibleCampaigns.length} campaign${visibleCampaigns.length === 1 ? "" : "s"} shown`}${state.campaignPage.hasMore?' · More CRM pages available':''} · <a href="https://example.invalid/sample-sheet" target="_blank" rel="noopener noreferrer">Costco Campaign Overview</a></p>
      ${state.costcoOverview.items.length ? `<p class="table-meta">Overview totals cover the whole launch. Linked paid and seeding records retain their own allocations and creator rosters. Scheduling dates do not establish workflow status.</p>` : ""}
      ${state.costcoOverview.error ? `<div class="system-message system-message--error">${escapeHtml(state.costcoOverview.error)} Showing available BYOU IQ records.</div>` : ""}
      ${state.campaignTypeFilter||state.campaignStatusFilter||state.campaignSearch?`<div class="campaign-filter-chips" aria-label="Applied campaign filters">${state.campaignTypeFilter?`<span class="campaign-filter-chip">Type: ${escapeHtml(state.campaignTypeFilter)}</span>`:''}${state.campaignStatusFilter?`<span class="campaign-filter-chip">Status: ${escapeHtml(state.campaignStatusFilter)}</span>`:''}${state.campaignSearch?`<span class="campaign-filter-chip">Search: ${escapeHtml(state.campaignSearch)}</span>`:''}</div>`:''}
      ${state.campaignPage.error ? `<div class="system-message system-message--error">${escapeHtml(state.campaignPage.error)}</div>` : ""}
      ${visibleCampaigns.length ? campaignGroups.map(([label, campaigns]) => `<details class="campaign-section" data-campaign-section="${label}" ${state.campaignSectionsExpanded[label] !== false ? "open" : ""}><summary>${escapeHtml(label)} <small>${campaigns.length} campaign${campaigns.length === 1 ? "" : "s"}</small></summary>${campaigns.length ? renderCampaignRows(campaigns, label) : `<p class="campaign-section-empty">No ${label.toLowerCase()} campaigns match this view.</p>`}</details>`).join("") : `<div class="empty-state"><strong>${state.campaignPage.loading ? "Loading campaigns..." : "No campaigns match this view."}</strong>${state.campaignPage.loading ? "" : `<span>${canCreate ? "Create a campaign or clear a filter." : "Clear a filter or ask an authorized campaign manager to create a record."}</span>${canCreate ? `<button class="button button--primary button--small" data-action="new-campaign">Create campaign</button>` : ""}`}</div>`}
      ${state.campaignPage.hasMore ? `<button class="button button--secondary button--full" data-action="load-more-campaigns" ${state.campaignPage.loading ? "disabled" : ""}>${state.campaignPage.loading ? "Loading..." : "Load more campaigns"}</button>` : ""}
    </section>`;
};

const renderCampaign = () => {
  if (isCostcoOverviewCampaignId(state.selectedCampaignId)) {
    const sourceCampaign = state.costcoOverview.items.find((item) => item.id === state.selectedCampaignId);
    const loading = state.campaignDetailLoadingId === state.selectedCampaignId || state.costcoOverview.loading;
    if (!sourceCampaign) {
      return `${pageHeader({ eyebrow: "Campaign", title: "Campaign", description: "" })}<section class="panel"><div class="empty-state"><strong>${loading ? "Opening campaign" : "Campaign unavailable"}</strong><span>${escapeHtml(state.campaignDetailError || state.costcoOverview.error || "Return to Campaigns and choose an available record.")}</span><button class="button button--secondary" data-action="navigate" data-view="campaigns">All campaigns</button></div></section>`;
    }
    const linkedCampaigns = linkedOverviewCampaigns(sourceCampaign);
    return `
      <button class="back-link" data-action="navigate" data-view="campaigns">&#8592; All campaigns</button>
      <section class="campaign-hero"><div><p class="eyebrow">Campaign overview</p><h1>${escapeHtml(sourceCampaign.name)}</h1><p>${escapeHtml(sourceCampaign.brand)} · ${escapeHtml(sourceCampaign.product || "Product not recorded")}</p></div></section>
      <section class="panel"><div class="panel-heading"><div><h2>Campaign details</h2><p>${linkedCampaigns.length ? "This overview covers the linked campaign records below. Each record keeps its own allocation and creator roster." : "This campaign is listed in Costco Campaign Overview. A linked BYOU IQ campaign record has not been confirmed, so creator assignments and workflow details are unavailable."}</p></div></div>
        <dl class="definition-list">
          <div><dt>Product</dt><dd>${escapeHtml(sourceCampaign.product || "Not recorded")}</dd></div>
          <div><dt>Brand</dt><dd>${escapeHtml(sourceCampaign.brand)}</dd></div>
          <div><dt>Person in charge</dt><dd>${escapeHtml(sourceCampaign.owner || "Not recorded")}</dd></div>
          <div><dt>Launch date</dt><dd>${sourceCampaign.launchDate ? formatDate(sourceCampaign.launchDate) : "Not recorded"}</dd></div>
          <div><dt>Marketing start</dt><dd>${sourceCampaign.marketingStartDate ? formatDate(sourceCampaign.marketingStartDate) : "Not recorded"}</dd></div>
          <div><dt>Campaign type</dt><dd>${linkedCampaigns.length ? "See linked campaigns" : "Not specified"}</dd></div>
          <div><dt>Status</dt><dd>Not recorded</dd></div>
          <div><dt>Schedule</dt><dd>${overviewSchedule(sourceCampaign)} (from launch date)</dd></div>
          <div><dt>Overview total budget</dt><dd>${campaignMoney(sourceCampaign.totalBudget, sourceCampaign.currency)}</dd></div>
          <div><dt>Paid allocation in overview</dt><dd>${campaignMoney(sourceCampaign.paidBudget, sourceCampaign.currency)}</dd></div>
          <div><dt>Seeding allocation in overview</dt><dd>${campaignMoney(sourceCampaign.seedingBudget, sourceCampaign.currency)}</dd></div>
          <div><dt>All allocations in overview</dt><dd>${campaignMoney(sourceCampaign.allocatedBudget, sourceCampaign.currency)}</dd></div>
          <div><dt>Budget excluding Costco on-site</dt><dd>${campaignMoney(sourceCampaign.onSiteExcludedBudget, sourceCampaign.currency)}</dd></div>
        </dl>
        ${linkedCampaigns.length ? `<h3>Linked campaigns</h3><div class="campaign-linked-records">${linkedCampaigns.map(campaign => `<button class="button button--secondary" data-action="open-campaign" data-id="${escapeHtml(campaign.id)}">${escapeHtml(campaign.name)} · ${escapeHtml(campaign.type || "Not specified")} · ${campaign.creatorCount ?? "Unknown"} creators · ${campaignMoney(campaign.budget, campaign.currency)}</button>`).join("")}</div>` : ""}
        <a class="external-link" href="${escapeHtml(sourceCampaign.sourceUrl)}" target="_blank" rel="noopener noreferrer">View source spreadsheet &#8599;</a>
      </section>`;
  }
  const campaign = campaignById(state.selectedCampaignId) || null;
  if (!campaign) {
    const loading = state.campaignDetailLoadingId === state.selectedCampaignId;
    return `${pageHeader({ eyebrow: "Campaign", title: "Campaign", description: "" })}<section class="panel"><div class="empty-state"><strong>${loading ? "Opening campaign" : "Campaign unavailable"}</strong><span>${escapeHtml(state.campaignDetailError || "Return to Campaigns and choose an available record.")}</span><button class="button button--secondary" data-action="navigate" data-view="campaigns">All campaigns</button></div></section>`;
  }
  const assignments = campaign.assignments || [];
  const canEdit = canEditManualCampaign(campaign);
  const canManageRoster = canManageManualCampaignRoster(campaign) && String(campaign.status).toLowerCase() !== "archived";
  const workflowOptions = {
    creatorName: id => { const c = creatorById(id); return c ? creatorDisplayName(c) : assignments.find(a => a.creatorId === id)?.creatorDisplayName || "Creator unavailable"; },
    getCreator: creatorById,
    getHistory: id => state.campaigns.flatMap(record => (record.assignments || [])
      .filter(assignment => assignment.creatorId === id).map(assignment => ({ campaign: record, assignment }))),
    canEdit: canEditCampaignWorkflow(campaign),
    canContinue: canContinueCampaign(campaign),
    canManageContinuation: canManageContinuationCampaign(campaign)
  };
  const isSeeding=String(campaign.type).toLowerCase()==="seeding";
  const isPaid=String(campaign.type).toLowerCase()==="paid";
  const hero = `
    <button class="back-link" data-action="navigate" data-view="campaigns">&#8592; All campaigns</button>
    <section class="campaign-hero">
      <div><div class="hero-badges">${badge(campaign.status || "Planning")}${badge(campaign.type || "Other", "neutral")}</div><h1>${escapeHtml(campaign.name)}</h1><p>${escapeHtml(campaign.brand || "Brand not recorded")} · ${escapeHtml(campaign.productName || "Product not recorded")}</p></div>
      <div class="page-actions">${canEdit ? `<button class="button button--secondary" data-action="edit-campaign" data-campaign="${escapeHtml(campaign.id)}">Edit Campaign</button>` : ""}${canManageRoster ? `<button class="button button--primary" data-action="manage-campaign-creators" data-campaign="${escapeHtml(campaign.id)}">Manage Campaign Creators</button>` : ""}</div>
    </section>
    `;
  const workflow = ["paid", "seeding"].includes(String(campaign.type).toLowerCase()) ? renderPaidJourneys(campaign, workflowOptions) : "";
  const overview = `
    <div class="detail-grid">
      <section class="panel">
        <div class="panel-heading"><div><p class="eyebrow">Campaign record</p><h2>Campaign details</h2></div>${canEdit ? `<button class="button button--secondary button--small" data-action="edit-campaign" data-campaign="${escapeHtml(campaign.id)}">Edit Campaign</button>` : ""}</div>
        <dl class="definition-list">
          <div><dt>Product</dt><dd>${escapeHtml(campaign.productName || "Not recorded")}</dd></div>
          <div><dt>Brand</dt><dd>${escapeHtml(campaign.brand || "Not recorded")}</dd></div>
          <div><dt>Campaign type</dt><dd>${escapeHtml(campaign.type || "Not recorded")}</dd></div>
          <div><dt>Status</dt><dd>${escapeHtml(campaign.status || "Not recorded")}</dd></div>
          <div><dt>Person in charge</dt><dd>${escapeHtml(campaign.owner || "Not recorded")}${campaign.sourceDetails?.owner_label && !campaign.ownerId ? " (source manager)" : ""}</dd></div>
          <div><dt>Dates</dt><dd>${formatDate(campaign.startDate)} to ${formatDate(campaign.endDate)}</dd></div>
          ${campaign.launchDate ? `<div><dt>Launch date</dt><dd>${formatDate(campaign.launchDate)}</dd></div>` : ""}
          ${campaign.marketingStartDate ? `<div><dt>Marketing start</dt><dd>${formatDate(campaign.marketingStartDate)}</dd></div>` : ""}
          <div><dt>Timezone</dt><dd>${escapeHtml(campaign.timezone || "America/Los_Angeles")}</dd></div>
          <div><dt>Campaign allocation</dt><dd>${campaignMoney(campaign.budget, campaign.currency)}</dd></div>
          ${Number.isFinite(campaign.overviewTotalBudget) ? `<div><dt>Overview total budget</dt><dd>${campaignMoney(campaign.overviewTotalBudget, campaign.sourceDetails?.currency)} (shared launch total)</dd></div>` : ""}
          ${campaign.sourceStatus ? `<div><dt>Source workflow status</dt><dd>${escapeHtml(campaign.sourceStatus)}</dd></div>` : ""}
        </dl>
        ${campaign.sourceUrl ? `<a class="external-link" href="${escapeHtml(campaign.sourceUrl)}" target="_blank" rel="noopener noreferrer">View campaign source &#8599;</a>${campaign.sourceDetails?.source_updated_at ? `<p class="helper-text">Source updated: ${escapeHtml(campaign.sourceDetails.source_updated_at)}</p>` : ""}` : ""}
      </section>
    </div>
    `;
  const creators = `
    <section class="panel">
      <div class="panel-heading"><div><p class="eyebrow">Campaign roster</p><h2>${assignments.length} campaign creator${assignments.length === 1 ? "" : "s"}</h2></div>${canManageRoster ? `<button class="button button--primary button--small" data-action="manage-campaign-creators" data-campaign="${escapeHtml(campaign.id)}">Manage Campaign Creators</button>` : ""}</div>
      <div class="data-table manual-assignment-table">
        <div class="table-row table-head"><span>Creator</span><span>Engagement / status</span><span>Fee</span><span>Deliverable</span><span>Due date</span><span>Payment</span><span></span></div>
        ${assignments.length ? assignments.map((assignment) => {
          const creator = creatorById(assignment.creatorId);
          const creatorName = creator ? creatorDisplayName(creator) : assignment.creatorDisplayName || "Creator unavailable";
          const creatorHandle = creator ? creatorSocialHandle(creator) : assignment.creatorHandle || assignment.creatorId;
          const deliverable = assignment.deliverable || {};
          const display = assignmentRosterValues(assignment);
          const engagementLabel = String(assignment.engagementType || campaign.type || "Not recorded");
          const engagementTone = engagementLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "unknown";
          return `<div class="table-row campaign-creator-row">
            <span class="campaign-creator-type campaign-creator-type--${escapeHtml(engagementTone)}">${escapeHtml(engagementLabel)}</span>
            <span class="creator-cell">${creator ? avatar(creator, "small") : ""}<span><strong>${escapeHtml(creatorName)}</strong><small>${escapeHtml(creatorHandle)}</small></span></span>
            <span><strong>${escapeHtml(display.status)}</strong><small>${display.statusSource ? "Spreadsheet · " : ""}${escapeHtml(assignment.engagementType || "Unknown")}</small>${display.statusSource ? `<small>CRM: ${escapeHtml(assignment.status || "Not recorded")}</small>` : ""}</span>
            <span><strong>${campaignMoney(display.feeAmount,display.feeCurrency)}</strong>${display.feeSource ? "<small>Spreadsheet fee</small>" : display.feeNote ? `<small>${escapeHtml(display.feeNote)}</small>` : ""}</span>
            <span><strong>${escapeHtml(display.deliverable)}</strong><small>${display.deliverableSource ? "Spreadsheet" : `${escapeHtml(deliverable.platform || "Platform not recorded")} · ${escapeHtml(deliverable.status || "Status not recorded")}`}</small></span>
            <span><strong>${display.dueDate ? formatDate(display.dueDate) : escapeHtml(display.dueRule || "Not recorded")}</strong>${display.dueSource ? "<small>Spreadsheet deadline</small>" : ""}</span>
            <span><strong>${escapeHtml(display.payment)}</strong>${display.paymentSource ? "<small>Spreadsheet report</small>" : sourcePaymentLabel(assignment) && sourcePaymentLabel(assignment) !== display.payment ? `<small>${escapeHtml(sourcePaymentLabel(assignment))}</small>` : ""}</span>
            <span class="row-actions"><button class="text-button" data-action="open-campaign" data-id="${escapeHtml(campaign.id)}" data-assignment="${escapeHtml(assignment.id)}">Open campaign</button>${canEditManualAssignment(campaign, assignment) ? `<button class="button button--secondary button--small" data-action="edit-campaign-assignment" data-id="${escapeHtml(assignment.id)}">Edit</button><button class="button button--secondary button--small" data-neg="open" data-assignment="${escapeHtml(assignment.id)}" data-campaign="${escapeHtml(campaign.id)}">Negotiate</button>` : ""}</span>
          </div>${assignment.sourceDetails ? `<div class="assignment-source-row">${renderAssignmentSourceSummary(assignment)}</div>` : ""}`;
        }).join("") : `<div class="empty-state"><strong>No creators assigned.</strong><span>${canManageRoster ? "Add the first creator from Manage Campaign Creators." : "An authorized campaign manager can add the first creator."}</span>${canManageRoster ? `<button class="button button--primary button--small" data-action="manage-campaign-creators" data-campaign="${escapeHtml(campaign.id)}">Add creator</button>` : ""}</div>`}
      </div>
    </section>`;
  if(isSeeding)return hero+seedingCampaignTabs.render(campaign,{overview:renderSeedingNextStep({creatorCount:assignments.length,outreachStarted:seedingOutreach.hasSent(campaign)})+overview,creators:`<section class="panel"><h2>Build your campaign audience</h2><p>Search Creators or Your Creator Network, select a group, then drag or add them to this campaign. Adding creators does not send emails.</p><button class="button button--primary" data-action="seeding-browse-creators" data-campaign="${escapeHtml(campaign.id)}">Browse creator network</button><button class="button button--secondary" data-seeding-next="outreach">Prepare campaign outreach</button></section>`+creators,outreach:seedingOutreach.render(campaign),workflow});
  if(isPaid){
    const chosen=state.campaignOutreachSelection?.campaignId===campaign.id?new Set(state.campaignOutreachSelection.creatorIds):null;
    const audience=assignments.filter(a=>!chosen||chosen.has(a.creatorId));
    const correspondence=paidJourneyState(campaign.id);
    const outreach=`<section class="panel" data-wf-campaign="${escapeHtml(campaign.id)}"><h2>Individual outreach</h2><p>${audience.length} selected campaign creators. Prepare and approve each paid conversation individually.</p><button class="button button--secondary" data-wf="load" ${correspondence?.loading?'disabled':''}>Refresh correspondence</button>${correspondence?.error?'<p role="alert">Saved correspondence could not be loaded.</p>':!correspondence?.journeys?'<p role="status">Loading saved correspondence...</p>':''}${audience.map(a=>{const evidence=correspondence?.journeys?.find(j=>j.assignmentId===a.id&&j.creatorId===a.creatorId&&j.campaignId===campaign.id)?.recordedEvidence;return `<div><p><strong>${escapeHtml(workflowOptions.creatorName(a.creatorId))}</strong> <button class="button button--secondary" data-neg="open" data-assignment="${escapeHtml(a.id)}" data-campaign="${escapeHtml(campaign.id)}">Open individual outreach</button></p>${evidence?`<details><summary>Campaign correspondence and source records</summary>${renderCampaignEvidence(evidence)}</details>`:''}</div>`;}).join('')||'<p>Add creators from the main Creators directory.</p>'}</section>`+renderNegotiation(state.negotiation,campaign.id);
    return hero+seedingCampaignTabs.render(campaign,{overview,creators:`<section class="panel"><button class="button button--primary" data-action="seeding-browse-creators" data-campaign="${escapeHtml(campaign.id)}">Add creators from directory</button></section>`+creators,outreach,workflow});
  }
  return hero+workflow+renderNegotiation(state.negotiation,campaign.id)+overview+creators;
};

const renderSources = () => {
  const selected = sourceById(state.selectedSourceId) || state.sources[0];
  if (!selected) {
    return `${pageHeader({ eyebrow: "Sources", title: "Sources", description: "" })}<section class="panel"><div class="empty-state"><strong>No sources to show.</strong><span>Ask an administrator to add a source.</span></div></section>`;
  }
  const usage = sourceUsage(selected);
  const acquisitionSources = state.sources.filter((source) => source.category === "Acquisition");
  const systemSources = state.sources.filter((source) => source.category === "System");
  const readyImports = state.importRuns.filter((run) => run.status === "Ready for review").length;
  const connectedCreators = usage.creators.map(creatorById).filter(Boolean).slice(0, 8);
  const connectedCampaigns = usage.campaigns.map(campaignById).filter(Boolean).slice(0, 6);
  const relationsAreComplete = !isLiveMode();

  const sourceRow = (source) => {
    const stats = sourceUsage(source);
    return `
      <button class="source-row ${selected.id === source.id ? "is-selected" : ""}" data-action="select-source" data-id="${source.id}">
        <span class="source-mark">${escapeHtml(source.type.slice(0, 1))}</span>
        <span><strong>${escapeHtml(source.name)}</strong><small>${escapeHtml(source.type)} · ${escapeHtml(source.owner)}</small></span>
        <span><strong>${relationsAreComplete ? stats.creators.length : "On demand"}</strong><small>${relationsAreComplete ? "creators" : "linked history"}</small></span>
        <span>${badge(source.status)}</span>
      </button>`;
  };

  return `
    ${pageHeader({
      eyebrow: "Sources",
      title: "Sources",
      description: "Manage where creators and campaign records came from, who owns the source, and how data enters BYOU IQ.",
      actions: `<button class="button button--secondary" data-action="new-source">New source</button><button class="button button--primary" data-action="start-import">Start import</button>`
    })}
    <section class="summary-strip source-summary" aria-label="Source summary">
      <div><strong>${acquisitionSources.length}</strong><span>Acquisition sources</span></div>
      <div><strong>${systemSources.length}</strong><span>System sources</span></div>
      <div><strong>${relationsAreComplete ? state.creators.length : "On demand"}</strong><span>Creators with history</span></div>
      <div><strong>${readyImports}</strong><span>Import ready for review</span></div>
    </section>
    <div class="source-workspace">
      <section class="panel source-registry">
        <div class="panel-heading"><div><p class="eyebrow">Source registry</p><h2>Acquisition sources</h2></div><span class="helper-text">Creator origin</span></div>
        <div class="source-list">${acquisitionSources.map(sourceRow).join("")}</div>
        <div class="source-group-heading"><p class="eyebrow">Connected systems</p><h2>Import and communication sources</h2></div>
        <div class="source-list">${systemSources.map(sourceRow).join("")}</div>
      </section>
      <aside class="panel source-detail">
        <div class="source-detail-heading"><span class="source-mark source-mark--large">${escapeHtml(selected.type.slice(0, 1))}</span><div><p class="eyebrow">${escapeHtml(selected.id)}</p><h2>${escapeHtml(selected.name)}</h2><p>${escapeHtml(selected.description)}</p></div></div>
        <div class="source-detail-badges">${badge(selected.category, "neutral")}${badge(selected.status)}<span>${escapeHtml(selected.connection)}</span></div>
        <dl class="definition-list source-definition">
          <div><dt>Source owner</dt><dd>${escapeHtml(selected.owner)}</dd></div>
          <div><dt>Source type</dt><dd>${escapeHtml(selected.type)}</dd></div>
          <div><dt>Record path</dt><dd>${escapeHtml(selected.workflow)}</dd></div>
          <div><dt>Connected history</dt><dd>${relationsAreComplete ? `${usage.creators.length} creators &middot; ${usage.campaigns.length} campaigns` : "Open a related record to view"}</dd></div>
        </dl>
        <div class="source-actions">
          ${selected.type === "Google Sheets" ? `<button class="button button--primary button--full" data-action="start-import" data-source="${selected.id}">Preview approved range</button>` : ""}
          ${selected.type === "Gmail" ? canLinkAnyGmail() ? `<button class="button button--primary button--full" data-action="link-thread">Link approved Gmail thread</button>` : readOnlyAction("Gmail thread links") : ""}
          <button class="button button--secondary button--full" data-action="edit-source" data-id="${selected.id}">Edit source details</button>
        </div>
        <div class="linked-records"><h3>Records this source can create</h3>${selected.linkedRecords.map((record) => `<span>${escapeHtml(record)}</span>`).join("")}</div>
      </aside>
    </div>
    <section class="panel source-connections">
      <div class="panel-heading"><div><p class="eyebrow">Connected records</p><h2>${escapeHtml(selected.name)} history</h2></div></div>
      <div class="source-connection-grid">
        <div><h3>Creators</h3>${connectedCreators.length ? `<div class="source-chip-list">${connectedCreators.map((creator) => `<button data-action="open-creator" data-id="${creator.id}">${avatar(creator, "small")}<span><strong>${escapeHtml(creatorDisplayName(creator))}</strong><small>${escapeHtml(creatorIdentityMeta(creator, { includeTier: false }))}</small></span></button>`).join("")}</div>` : `<p class="empty-copy">${relationsAreComplete ? "No creator records are connected yet." : "Creator links load with the relevant creator record."}</p>`}</div>
        <div><h3>Campaigns</h3>${connectedCampaigns.length ? `<div class="source-campaign-list">${connectedCampaigns.map((campaign) => `<button data-action="open-campaign" data-id="${campaign.id}"><span><strong>${escapeHtml(campaign.name)}</strong><small>${escapeHtml(campaign.brand)} · ${escapeHtml(campaign.type)}</small></span><span class="row-arrow">&#8594;</span></button>`).join("")}</div>` : `<p class="empty-copy">${relationsAreComplete ? "No campaign records are connected yet." : "Campaign links load with the relevant campaign record."}</p>`}</div>
        <div><h3>Import history</h3>${usage.imports.length ? usage.imports.map((run) => `<button class="import-run-card" data-action="open-import" data-id="${run.id}"><span><strong>${escapeHtml(run.id)}</strong><small>${escapeHtml(run.tab)} · ${escapeHtml(run.range)}</small></span>${badge(run.status)}</button>`).join("") : `<p class="empty-copy">This source does not create spreadsheet import batches.</p>`}</div>
      </div>
    </section>
    <section class="panel import-architecture">
      <div class="panel-heading"><div><p class="eyebrow">Import workflow</p><h2>From source to record</h2></div></div>
      <div class="import-flow" aria-label="Import workflow">
        <div><span>1</span><strong>Choose source</strong><small>File, tab, range, or Gmail thread</small></div>
        <i>&#8594;</i>
        <div><span>2</span><strong>Review data</strong><small>Confirm what should be imported</small></div>
        <i>&#8594;</i>
        <div><span>3</span><strong>Match identities</strong><small>Confirm creators and campaigns</small></div>
        <i>&#8594;</i>
        <div><span>4</span><strong>Confirm changes</strong><small>Review new and matched records</small></div>
        <i>&#8594;</i>
        <div><span>5</span><strong>Finish import</strong><small>Open the imported records</small></div>
      </div>
    </section>`;
};

const renderLegacyCreator = () => {
  const creator = creatorById(state.selectedCreatorId) || (isLiveMode() ? null : state.creators[0]);
  if (!creator) {
    const loading = state.creatorDetailLoadingId === state.selectedCreatorId;
    const message = state.creatorDetailError || (loading ? "Loading this creator's full record..." : "This creator record is not available to your account.");
    return `${pageHeader({ eyebrow: "Creator", title: "Creator profile", description: "" })}<section class="panel"><div class="empty-state"><strong>${loading ? "Opening creator profile" : "Creator unavailable"}</strong><span>${escapeHtml(message)}</span></div></section>`;
  }
  const stats = creatorStats(creator.id);
  const activation = creator.activation || {};
  const stageSummary = creator.relationshipSummary?.stageSummary || {};
  const tabs = [
    ["overview", "Overview"],
    ["activation", "Activation fit"],
    ["campaigns", "Campaign history"],
    ["posts", "Posts & performance"],
    ["commercial", "Commercial & representation"],
    ["relationships", "Relationships"]
  ];
  let content = "";

  if (state.profileTab === "overview") {
    const lastCampaigns = [...stats.history].sort((a, b) => String(b.campaign.endDate).localeCompare(String(a.campaign.endDate))).slice(0, 3);
    content = `
      <section class="activation-decision-strip" aria-label="Creator decision summary">
        <article><span>Closest Costco</span><strong>${escapeHtml(activation.closestWarehouse?.name || "Not recorded")}</strong><small>${Number.isFinite(activation.closestWarehouse?.distanceMiles) ? `${activation.closestWarehouse.distanceMiles.toFixed(1)} miles · about ${activation.closestWarehouse.estimatedMinutes ?? "?"} minutes` : "Distance not recorded"}</small></article>
        <article><span>Recent Rate</span><strong>${formatCurrency(activation.currentQuotedRate)}</strong><small>${activation.currentRateEffectiveOn ? `Effective ${formatDate(activation.currentRateEffectiveOn)}` : "Date not recorded"}</small></article>
      </section>
      <section class="relationship-summary-grid" aria-label="BYOU relationship summary">
        <article><span>Last worked together</span><strong>${formatDate(stats.lastWorked)}</strong><small>${escapeHtml(daysAgoLabel(stats.daysSinceLastWorked))}</small></article>
        <article><span>Paid vs. seeding</span><strong>${escapeHtml(stats.collaborationMix)}</strong><small>Paid ${stats.paidCampaignCount} / Seeding ${stats.seedingCampaignCount}</small></article>
        <article><span>Brand and campaign history</span><strong>${stats.campaignCount} campaign${stats.campaignCount === 1 ? "" : "s"}</strong><small>${escapeHtml(stats.brands.join(", ") || "No brand recorded")}</small></article>
        <article><span>Last Contacted</span><strong>${formatDate(stageSummary.lastContacted)}</strong><small>Staff-recorded relationship milestone</small></article>
      </section>
      <section class="metric-grid four-up">
        <div class="metric-card"><span>Campaigns</span><strong>${stats.campaignCount}</strong><small>Across ${stats.clients.length} client${stats.clients.length === 1 ? "" : "s"}</small></div>
        <div class="metric-card"><span>Verified avg. views</span><strong>${formatCompact(stats.avgViews)}</strong><small>${stats.avgEngagement ? `${stats.avgEngagement.toFixed(1)}% avg. engagement` : "No verified metrics"}</small></div>
        <div class="metric-card"><span>On-time completion</span><strong>${stats.reliability ?? "Missing"}${stats.reliability !== null ? "%" : ""}</strong><small>${stats.completedCount} completed assignments</small></div>
        <div class="metric-card"><span>Typical paid fee</span><strong>${formatCurrency(stats.typicalFee)}</strong><small>${stats.minFee ? `${formatCurrency(stats.minFee)} to ${formatCurrency(stats.maxFee)}` : "No paid history"}</small></div>
      </section>
      <div class="detail-grid">
        <section class="panel">
          <div class="panel-heading"><div><p class="eyebrow">Relationship note</p><h2>What we know</h2></div></div>
          <p class="large-note">${escapeHtml(creator.note)}</p>
          <dl class="definition-list">
            <div><dt>Best categories</dt><dd>${escapeHtml(creator.categories.join(", "))}</dd></div>
            <div><dt>Preferred formats</dt><dd>${escapeHtml(creator.preferredFormats.join(", ") || "Not recorded")}</dd></div>
            <div><dt>Relationship owner</dt><dd>${escapeHtml(creator.relationshipOwner)}</dd></div>
            <div><dt>Acquisition history</dt><dd>${escapeHtml(stats.sources.join(", "))}</dd></div>
          </dl>
        </section>
        <section class="panel">
          <div class="panel-heading"><div><p class="eyebrow">Recent history</p><h2>Latest campaigns</h2></div></div>
          <div class="stack-list">
            ${lastCampaigns.map(({ campaign, assignment }) => `
              <button class="stack-row" data-action="open-campaign" data-id="${campaign.id}">
                <span><strong>${escapeHtml(campaign.name)}</strong><small>${escapeHtml(campaign.category)} · ${formatDate(campaign.endDate)}</small></span>
                <span>${badge(assignment.status)}</span>
              </button>`).join("")}
          </div>
        </section>
      </div>`;
  }

  if (state.profileTab === "activation") {
    const warehouse = activation.closestWarehouse || {};
    content = `
      <section class="activation-fit-grid" aria-label="Creator activation fit">
        <article class="panel activation-anchor">
          <div class="panel-heading"><div><p class="eyebrow">Local execution</p><h2>Closest Costco warehouse</h2></div></div>
          <strong class="activation-anchor-name">${escapeHtml(warehouse.name || "Not recorded")}</strong>
          <p>${escapeHtml([warehouse.city, warehouse.state].filter(Boolean).join(", ") || "Location label missing")}</p>
          <dl class="definition-list">
            <div><dt>Derived distance</dt><dd>${Number.isFinite(warehouse.distanceMiles) ? `${warehouse.distanceMiles.toFixed(1)} miles` : "Not recorded"}</dd></div>
            <div><dt>Estimated drive</dt><dd>${Number.isFinite(warehouse.estimatedMinutes) ? `About ${warehouse.estimatedMinutes} minutes` : "Not recorded"}</dd></div>
            <div><dt>Distance basis</dt><dd>${escapeHtml(warehouse.basis || "Not recorded")}</dd></div>
          </dl>
        </article>
      </section>`;
  }

  if (state.profileTab === "campaigns") {
    content = `
      <section class="panel">
        <div class="panel-heading"><div><p class="eyebrow">Complete history</p><h2>${stats.history.length} campaign assignments</h2></div></div>
        <div class="data-table history-table">
          <div class="table-row table-head"><span>Campaign</span><span>Role & source</span><span>Deliverable</span><span>Performance</span><span>Commercial</span><span></span></div>
          ${[...stats.history].sort((a, b) => String(b.campaign.endDate).localeCompare(String(a.campaign.endDate))).map(({ campaign, assignment }) => `
            <button class="table-row table-button" data-action="open-campaign" data-id="${campaign.id}">
              <span><strong>${escapeHtml(campaign.name)}</strong><small>${escapeHtml(campaign.brand)} · ${formatDate(campaign.endDate)}</small></span>
              <span><strong>${escapeHtml(assignment.engagementType === "Unknown" ? campaign.type : assignment.engagementType || campaign.type)}</strong><small>${escapeHtml(assignment.acquisitionSource)}</small></span>
              <span><strong>${escapeHtml(assignment.deliverable.status)}</strong><small>${assignment.deliverable.revisionCount} revision${assignment.deliverable.revisionCount === 1 ? "" : "s"}</small></span>
              <span><strong>${formatCompact(assignment.performance?.views)}</strong><small>${assignment.performance?.engagementRate ? `${assignment.performance.engagementRate}% engagement` : "Metrics missing"}</small></span>
              <span><strong>${formatCurrency(assignment.rate)}</strong><small>${escapeHtml(assignment.paymentStatus)}</small></span>
              <span class="row-arrow" aria-hidden="true">&#8594;</span>
            </button>`).join("")}
        </div>
      </section>`;
  }

  if (state.profileTab === "posts") {
    const posts = stats.history.filter(({ assignment }) => assignment.post);
    content = `
      <section class="panel">
        <div class="panel-heading"><div><p class="eyebrow">Exact published work</p><h2>Posts and sourced performance</h2></div></div>
        <div class="data-table posts-table">
          <div class="table-row table-head"><span>Post</span><span>Campaign</span><span>Verification</span><span>Views</span><span>Metric source</span></div>
          ${posts.map(({ campaign, assignment }) => `
            <div class="table-row">
              <span><a class="external-link" href="${escapeHtml(assignment.post.url)}" target="_blank" rel="noreferrer">Open exact ${escapeHtml(assignment.post.platform)} post &#8599;</a><small>${formatDate(assignment.post.postedDate)}</small></span>
              <span><button class="inline-link" data-action="open-campaign" data-id="${campaign.id}">${escapeHtml(campaign.name)}</button><small>${escapeHtml(campaign.category)}</small></span>
              <span>${badge(assignment.post.verified ? "Verified" : "Unverified")}<small>${assignment.post.verified ? `by ${escapeHtml(assignment.post.verifiedBy)}` : "Excluded from official report"}</small></span>
              <span><strong>${formatCompact(assignment.performance?.views)}</strong><small>${assignment.performance?.engagementRate ? `${assignment.performance.engagementRate}% engagement` : "Missing"}</small></span>
              <span><strong>${escapeHtml(assignment.performance?.source || "Missing")}</strong><small>${assignment.performance?.sourceRecordId ? `${escapeHtml(assignment.performance.sourceRecordId)} · ${formatDate(assignment.performance.collectedAt)}` : "No source record"}</small></span>
            </div>`).join("")}
        </div>
      </section>`;
  }

  if (state.profileTab === "commercial") {
    const rates = activation.rateHistory || [];
    const representation = activation.representation || [];
    const sourcingRelationships = activation.sourcingRelationships || [];
    const restricted = activation.restrictedRecordStatus || {};
    const availability = (present) => present ? "Restricted record linked" : "Not linked";
    const sourcingHistory = sourcingRelationships.map((item) => {
      const sourceName = item.acquisitionSourceName || "Unspecified source";
      const linkedAgency = item.talentAgencyName
        ? `Linked sourcing agency: ${item.talentAgencyName}`
        : item.sourceCategory || "Source category not recorded";
      const assignments = Number(item.assignmentCount) || 0;
      const dateRange = item.firstSourcedOn && item.lastSourcedOn && item.firstSourcedOn !== item.lastSourcedOn
        ? `${formatDate(item.firstSourcedOn)} to ${formatDate(item.lastSourcedOn)}`
        : item.lastSourcedOn || item.firstSourcedOn
          ? formatDate(item.lastSourcedOn || item.firstSourcedOn)
          : "Dates not recorded";
      return `
        <article>
          <span><strong>${escapeHtml(sourceName)}</strong><small>${escapeHtml(linkedAgency)}</small></span>
          <span><strong>${assignments} assignment${assignments === 1 ? "" : "s"}</strong><small>${escapeHtml(dateRange)} &middot; ${escapeHtml(item.relationshipStatus || "Unconfirmed")}${item.sourceUrl ? ` &middot; <a class="external-link" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">Open source</a>` : ""}</small></span>
        </article>`;
    }).join("");
    content = `
      <section class="metric-grid four-up">
        <div class="metric-card"><span>Current rate</span><strong>${formatCurrency(activation.currentQuotedRate)}</strong><small>Short-form video · ${escapeHtml(activation.rateCurrency || "USD")}</small></div>
        <div class="metric-card"><span>Previous rate</span><strong>${formatCurrency(activation.previousQuotedRate)}</strong><small>Historical quote retained</small></div>
        <div class="metric-card"><span>Paid assignments</span><strong>${stats.paidCampaignCount}</strong><small>${stats.collaborationMix}</small></div>
        <div class="metric-card"><span>Representation</span><strong>${representation.length ? escapeHtml(representation[0].agencyName) : "Independent / unknown"}</strong><small>${representation.length ? escapeHtml(representation[0].managerDisplayName || "Manager not listed") : "No active agency record"}</small></div>
      </section>
      <div class="detail-grid">
        <section class="panel">
          <div class="panel-heading"><div><p class="eyebrow">Pricing</p><h2>Rate history</h2></div></div>
          <div class="rate-history-list">
            ${rates.length ? rates.map((rate) => `
              <article><span><strong>${formatCurrency(rate.amount)}</strong><small>${escapeHtml(rate.deliverableType || "Deliverable not recorded")}</small></span><span><strong>${escapeHtml(rate.status || "Unconfirmed")}</strong><small>${formatDate(rate.effectiveOn)}</small></span></article>`).join("") : `<div class="empty-state"><strong>No rate history.</strong><span>Add a dated, source-backed quote before using a price in planning.</span></div>`}
          </div>
        </section>
        <section class="panel">
          <div class="panel-heading"><div><p class="eyebrow">Business relationship</p><h2>Representation</h2></div></div>
          <div class="representation-list">
            ${representation.length ? representation.map((item) => `
              <article><span><strong>${escapeHtml(item.agencyName)}</strong><small>${escapeHtml(item.managerDisplayName || "No manager display name")}</small></span>${badge(item.status || "Unconfirmed")}</article>`).join("") : `<p class="empty-copy">No representation record has been added.</p>`}
          </div>
        </section>
      </div>
      <section class="panel">
        <div class="panel-heading"><div><p class="eyebrow">Creator acquisition</p><h2>Sourcing history</h2></div></div>
        <div class="representation-list">
          ${sourcingHistory || `<p class="empty-copy">No sourcing relationship has been linked yet.</p>`}
        </div>
      </section>
      <section class="panel restricted-record-panel">
        <div class="panel-heading"><div><p class="eyebrow">Private operations</p><h2>Restricted records</h2></div></div>
        <div class="restricted-record-grid">
          <article><span>Contact</span><strong>${availability(restricted.contact)}</strong></article>
          <article><span>Address</span><strong>${availability(restricted.address)}</strong></article>
          <article><span>Tax document</span><strong>${availability(restricted.taxDocument)}</strong></article>
          <article><span>Invoice folder</span><strong>${availability(restricted.invoiceFolder)}</strong></article>
          <article><span>Banking document</span><strong>${availability(restricted.bankingDocument)}</strong></article>
          <article><span>Identity document</span><strong>${availability(restricted.identityDocument)}</strong></article>
        </div>
      </section>`;
  }

  if (state.profileTab === "relationships") {
    const relationships = unique(stats.history.map(({ campaign }) => `${campaign.client}|${campaign.brand}`)).map((pair) => {
      const [client, brand] = pair.split("|");
      const count = stats.history.filter(({ campaign }) => campaign.client === client && campaign.brand === brand).length;
      return { client, brand, count };
    });
    content = `
      <div class="detail-grid">
        <section class="panel">
          <div class="panel-heading"><div><p class="eyebrow">Agency identity</p><h2>Shared creator record</h2></div></div>
          <dl class="definition-list">
            <div><dt>Display name</dt><dd>${escapeHtml(creatorDisplayName(creator))}</dd></div>
            <div><dt>Social profile / handle</dt><dd>${creator.profileUrl ? `<a class="external-link" href="${escapeHtml(creator.profileUrl)}" target="_blank" rel="noreferrer">${escapeHtml(creatorSocialHandle(creator))} &#8599;</a>` : escapeHtml(creatorSocialHandle(creator))}</dd></div>
            <div><dt>Platforms</dt><dd>${escapeHtml(creator.platforms.join(", "))}</dd></div>
          </dl>
        </section>
        <section class="panel">
          <div class="panel-heading"><div><p class="eyebrow">Client-specific records</p><h2>Brand and campaign history</h2></div></div>
          <div class="relationship-list">
            ${relationships.map((relationship) => `
              <div class="relationship-row"><span><strong>${escapeHtml(relationship.brand)}</strong><small>${escapeHtml(relationship.client)}</small></span><span><strong>${relationship.count} campaign${relationship.count === 1 ? "" : "s"}</strong><small>Owned by ${escapeHtml(creator.relationshipOwner)}</small></span></div>`).join("")}
          </div>
        </section>
      </div>
      <div class="detail-grid relationship-evidence-grid">
        <section class="panel">
          <div class="panel-heading"><div><p class="eyebrow">Working context</p><h2>Relationship note</h2></div></div>
          <p class="large-note">${escapeHtml(creator.note)}</p>
        </section>
        <section class="panel">
          <div class="panel-heading"><div><p class="eyebrow">Contact attempts</p><h2>Outreach outcomes</h2></div></div>
          <div class="outreach-list">
            ${(activation.outreachSummary || []).length ? activation.outreachSummary.map((item) => `
              <article><span><strong>${escapeHtml(item.outcome)}</strong><small>${escapeHtml(item.channel)} · ${item.occurredAt ? formatDate(String(item.occurredAt).slice(0, 10)) : "Date missing"}</small></span><span><strong>${Number.isFinite(item.responseTimeHours) ? `${item.responseTimeHours}h response` : "No response time"}</strong><small>${escapeHtml(item.note || "No outcome note")}</small></span></article>`).join("") : `<div class="empty-state"><strong>No outreach outcome recorded.</strong></div>`}
          </div>
        </section>
      </div>`;
  }

  return `
    <button class="back-link" data-action="navigate" data-view="creators">&#8592; All creators</button>
    <section class="profile-hero">
      <div class="profile-identity">${avatar(creator, "large")}<div><p class="eyebrow">Creator profile</p><h1>${escapeHtml(creatorDisplayName(creator))}</h1><p>${escapeHtml(creatorIdentityMeta(creator))} · Owned by ${escapeHtml(creator.relationshipOwner)}</p></div></div>
      <div class="page-actions">${canEditCreatorPrivateProfile(creator) ? `<button class="button button--secondary" data-action="open-private-creator" data-creator="${creator.id}">Edit private profile</button>` : ""}${isLiveMode() ? `<button class="button button--secondary" data-action="navigate" data-view="creators">Open creator directory</button>` : `<button class="button button--secondary" data-action="open-finder" data-creator="${creator.id}">Use in a campaign</button>`}</div>
    </section>
    ${state.creatorDetailError ? `<div class="system-message system-message--error">${escapeHtml(state.creatorDetailError)}</div>` : state.creatorDetailLoadingId === creator.id ? `<div class="table-meta">Loading complete campaign-assignment history...</div>` : ""}
    <nav class="tabs" aria-label="Creator profile sections">
      ${tabs.map(([id, label]) => `<button class="${state.profileTab === id ? "is-active" : ""}" data-action="profile-tab" data-tab="${id}">${label}</button>`).join("")}
    </nav>
    ${content}`;
};

const renderLegacyCampaigns = () => {
  const savedViews = ["All Campaigns", "My Campaigns", "Paid", "Seeding", "Active", "Reporting"];
  const matchesSavedView = (campaign) => {
    const gaps = campaignGaps(campaign);
    const riskCount = gaps.missingPosts + gaps.unverifiedPosts + gaps.missingMetrics + gaps.paymentExceptions;
    if (state.campaignFilter === "My Campaigns") return campaign.owner === state.currentUser.name;
    if (state.campaignFilter === "Paid" || state.campaignFilter === "Seeding") return campaign.type === state.campaignFilter;
    if (state.campaignFilter === "Active") return ["Planning", "Active"].includes(campaign.status);
    if (state.campaignFilter === "Reporting") return campaign.status === "Closeout" || campaign.reportStatus === "Needs data";
    if (state.campaignFilter === "At Risk") return riskCount > 0 && campaign.status !== "Completed";
    return true;
  };
  const search = state.campaignSearch.trim().toLowerCase();
  const visibleCampaigns = state.campaigns.filter((campaign) =>
    matchesSavedView(campaign) &&
    (!search || [campaign.name, campaign.client, campaign.brand, campaign.type, campaign.status, campaign.owner]
      .some((value) => String(value).toLowerCase().includes(search)))
  );
  const attention = state.campaigns
    .filter((campaign) => campaign.operationsLoadState?.status === "ready")
    .map((campaign) => {
      const gaps = campaignGaps(campaign);
      const items = [
        gaps.missingPosts ? `${gaps.missingPosts} missing post${gaps.missingPosts === 1 ? "" : "s"}` : null,
        gaps.unverifiedPosts ? `${gaps.unverifiedPosts} unverified post${gaps.unverifiedPosts === 1 ? "" : "s"}` : null,
        gaps.missingMetrics ? `${gaps.missingMetrics} failed or missing metric refresh${gaps.missingMetrics === 1 ? "" : "es"}` : null,
        gaps.paymentExceptions ? `${gaps.paymentExceptions} payment approval${gaps.paymentExceptions === 1 ? "" : "s"}` : null
      ].filter(Boolean);
      return { campaign, items, count: items.length };
    })
    .filter((item) => item.count && item.campaign.status !== "Completed")
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
  return `
    ${pageHeader({
      eyebrow: "Campaign management",
      title: "Campaigns",
      description: "Manage paid and seeding campaigns from roster through reporting.",
      actions: `<button class="button button--primary" data-action="new-campaign">Create campaign</button>`
    })}
    <section class="attention-panel" aria-labelledby="attention-title">
      <div class="section-heading-row"><div><p class="eyebrow">Operational exceptions</p><h2 id="attention-title">Attention Required</h2></div><span>${attention.length} campaign${attention.length === 1 ? "" : "s"}</span></div>
      <div class="attention-list">
        ${attention.length ? attention.map(({ campaign, items }) => `
          <button class="attention-row" data-action="open-campaign" data-id="${campaign.id}">
            <span class="risk-indicator" aria-hidden="true"></span>
            <span><strong>${escapeHtml(campaign.name)}</strong><small>${escapeHtml(items.join(" · "))}</small></span>
            <span><strong>${escapeHtml(campaign.owner)}</strong><small>Responsible owner</small></span>
            <span class="row-arrow">&#8594;</span>
          </button>`).join("") : `<div class="empty-state"><strong>${isLiveMode() ? "Campaign risks load on demand." : "No unresolved campaign risks."}</strong><span>${isLiveMode() ? "Open a campaign to load its roster, deliverables, posts, payments, and exceptions." : "Exceptions will appear here with the responsible owner."}</span></div>`}
      </div>
    </section>
    <section class="panel campaign-list-panel">
      <div class="campaign-toolbar">
        <div class="saved-views" aria-label="Saved campaign views">${savedViews.map((view) => `<button class="${state.campaignFilter === view ? "is-active" : ""}" data-action="campaign-filter" data-filter="${view}">${view}</button>`).join("")}</div>
        <label class="table-search"><span class="sr-only">Search campaigns</span>${icon("search")}<input data-field="campaign-search" value="${escapeHtml(state.campaignSearch)}" placeholder="Search campaigns" /></label>
      </div>
      <div class="data-table campaign-table" role="table" aria-label="Campaigns">
        <div class="table-row table-head" role="row"><span>Campaign</span><span>Brand</span><span>Phase</span><span>Owner</span><span>Dates</span><span>Creators</span><span>Verified Posts</span><span>Budget</span><span>Risk</span></div>
        ${visibleCampaigns.map((campaign) => {
          const operationsLoaded = campaign.operationsLoadState?.status === "ready";
          const gaps = campaignGaps(campaign);
          const riskCount = operationsLoaded
            ? gaps.missingPosts + gaps.unverifiedPosts + gaps.missingMetrics + gaps.paymentExceptions
            : null;
          const verifiedPosts = operationsLoaded ? verifiedPostCount(campaign) : null;
          return `<button class="table-row table-button" role="row" data-action="open-campaign" data-id="${campaign.id}">
            <span><strong>${escapeHtml(campaign.name)}</strong><small>${escapeHtml(campaign.category)}</small></span>
            <span><strong>${escapeHtml(campaign.brand)}</strong></span>
            <span>${badge(campaign.status)}</span>
            <span><strong>${escapeHtml(campaign.owner)}</strong><small>Campaign owner</small></span>
            <span><strong>${formatDate(campaign.startDate)}</strong><small>to ${formatDate(campaign.endDate)}</small></span>
            <span><strong>${operationsLoaded ? campaign.assignments.length : "On demand"}</strong><small>${operationsLoaded ? `creator${campaign.assignments.length === 1 ? "" : "s"}` : "Open campaign to load roster"}</small></span>
            <span><strong>${operationsLoaded ? verifiedPosts : "On demand"}</strong><small>${operationsLoaded ? `verified exact post${verifiedPosts === 1 ? "" : "s"}` : "Not loaded in directory"}</small></span>
            <span><strong>${formatCurrency(campaign.budget)}</strong><small>${escapeHtml(campaign.reportStatus)}</small></span>
            <span>${riskCount == null ? `<strong>On demand</strong><small>Open campaign to evaluate</small>` : riskCount ? `<span class="risk-count">${riskCount}</span><small>open exception${riskCount === 1 ? "" : "s"}</small>` : `<strong>—</strong><small>No open risk</small>`}</span>
          </button>`;
        }).join("") || `<div class="empty-state"><strong>No campaigns match this view.</strong><span>Clear the search or choose another saved view.</span></div>`}
      </div>
      ${state.campaignPage.error ? `<div class="system-message system-message--error">${escapeHtml(state.campaignPage.error)}</div>` : ""}
      <footer class="table-footer"><span>${visibleCampaigns.length} of ${state.campaigns.length} loaded campaigns${state.campaignPage.loading ? " &middot; updating..." : ""}</span><span>${state.campaignPage.hasMore ? `<button class="text-button" data-action="load-more-campaigns" ${state.campaignPage.loading ? "disabled" : ""}>Load more campaigns</button>` : ""}<button class="text-button" data-action="campaign-filter" data-filter="All Campaigns">Clear filters</button></span></footer>
    </section>`;
};

const renderLegacyCampaign = () => {
  const campaign = campaignById(state.selectedCampaignId) || state.campaigns[0];
  if (!campaign) {
    return `${pageHeader({ eyebrow: "Campaign workspace", title: "Campaigns", description: "No campaign records are available to your account yet." })}<section class="panel"><div class="empty-state"><strong>No campaigns to show.</strong><span>Campaigns will appear after an approved import or authorized creation.</span></div></section>`;
  }
  const campaignClient = crmClientForCampaign(campaign);
  const gaps = campaignGaps(campaign);
  const activities = campaignActivities(campaign.id);
  const tabs = [
    ["summary", "Overview"],
    ["creators", "Creators"],
    ["deliverables", "Deliverables / Content"],
    ["communication", "Communication"],
    ["commercial", "Commercial Status"],
    ["reporting", "Reporting"],
    ["calendar", "Calendar"]
  ];
  let content = "";

  if (state.campaignTab === "summary") {
    content = `
      <section class="metric-grid four-up">
        <div class="metric-card"><span>Creators</span><strong>${campaign.assignments.length}</strong><small>${campaign.assignments.filter((assignment) => assignment.post?.verified).length} exact post${campaign.assignments.filter((assignment) => assignment.post?.verified).length === 1 ? "" : "s"} verified</small></div>
        <div class="metric-card"><span>Campaign budget</span><strong>${formatCurrency(campaign.budget)}</strong><small>${campaign.type} campaign</small></div>
        <div class="metric-card"><span>Report status</span><strong class="metric-text">${escapeHtml(campaign.reportStatus)}</strong><small>${campaign.reportId || "Created after closeout"}</small></div>
        <div class="metric-card"><span>Data gaps</span><strong>${gaps.missingPosts + gaps.unverifiedPosts + gaps.missingMetrics}</strong><small>${gaps.paymentExceptions} payment exception${gaps.paymentExceptions === 1 ? "" : "s"}</small></div>
      </section>
      <div class="detail-grid">
        <section class="panel">
          <div class="panel-heading"><div><p class="eyebrow">Campaign brief</p><h2>Objective and ownership</h2></div></div>
          <p class="large-note">${escapeHtml(campaign.objective)}</p>
          <dl class="definition-list">
            <div><dt>Dates</dt><dd>${formatDate(campaign.startDate)} - ${formatDate(campaign.endDate)}</dd></div>
            <div><dt>Campaign owner</dt><dd>${escapeHtml(campaign.owner)}</dd></div>
            <div><dt>Report owner</dt><dd>${escapeHtml(campaign.reportOwner)}</dd></div>
            <div><dt>Client / brand</dt><dd>${escapeHtml(campaign.client)} / ${escapeHtml(campaign.brand)}</dd></div>
          </dl>
        </section>
        <section class="panel">
          <div class="panel-heading"><div><p class="eyebrow">Next action</p><h2>${campaign.assignments.length ? "Open workflow items" : "Build the creator roster"}</h2></div></div>
          ${campaign.assignments.length
            ? `<div class="exception-list">
                <div><span>${gaps.missingPosts}</span><p><strong>Posts missing</strong><small>Campaign manager owns the next action</small></p></div>
                <div><span>${gaps.unverifiedPosts}</span><p><strong>Posts unverified</strong><small>Designated reviewer owns the next action</small></p></div>
                <div><span>${gaps.missingMetrics}</span><p><strong>Metrics missing</strong><small>Analyst owns the next action</small></p></div>
                <div><span>${gaps.paymentExceptions}</span><p><strong>Payment approvals</strong><small>Finance approver owns the next action</small></p></div>
              </div>`
            : `<div class="empty-callout"><strong>No creators have been added.</strong><p>Use BYOU's past campaign history to build a transparent shortlist.</p>${isLiveMode() ? `<button class="button button--primary" data-action="navigate" data-view="creators">Open creator directory</button>` : `<button class="button button--primary" data-action="open-finder" data-campaign="${campaign.id}">Find past creators</button>`}</div>`}
        </section>
      </div>
      ${renderCampaignClientContext(campaign)}
      ${renderCampaignWorkflow(campaign)}
      ${renderCampaignOperations(campaign)}
      ${renderCampaignCorrespondence(campaign)}
      ${renderCampaignBusinessContext(campaign)}
      <section class="panel campaign-activity-panel">
        <div class="panel-heading"><div><p class="eyebrow">Recorded updates</p><h2>Campaign activity</h2></div><button class="button button--secondary button--small" data-action="add-campaign-update">Add status update</button></div>
        ${activities.length ? `<div class="activity-list">${activities.map((update) => `
          <article class="activity-row">
            <span class="activity-type">${escapeHtml(update.type.slice(0, 1))}</span>
            <div><div class="activity-title"><strong>${escapeHtml(update.status)}</strong>${badge(update.type, "neutral")}</div><p>${escapeHtml(update.note)}</p><small>${formatDate(update.createdAt)} · Recorded by ${escapeHtml(update.owner)}</small></div>
            <div class="activity-next"><span>Next owner</span><strong>${escapeHtml(update.nextOwner)}</strong><small>${escapeHtml(update.nextAction)}${update.dueDate ? ` · Due ${formatDate(update.dueDate)}` : ""}</small></div>
          </article>`).join("")}</div>` : `<div class="empty-state"><strong>No status updates recorded.</strong><span>Add an update with an owner, next action, and due date.</span></div>`}
      </section>`;
  }

  if (state.campaignTab === "creators") {
    const rosterViews = ["All creators", "Prospects", "Contacted", "Negotiating", "Confirmed", "Creating / Revising", "Approved", "Posted", "Complete", "Declined / Unresponsive"];
    const visibleAssignments = campaign.assignments.filter((assignment) => matchesRosterView(assignment, state.rosterFilter));
    content = `<section class="panel">
      <div class="panel-heading"><div><p class="eyebrow">One roster, multiple views</p><h2>${campaign.assignments.length} campaign creators</h2></div><div class="page-actions"><button class="button button--secondary" data-action="bulk-import">Import CSV / Sheet</button>${isLiveMode() ? `<button class="button button--primary" data-action="navigate" data-view="creators">Open creator directory</button>` : `<button class="button button--primary" data-action="open-finder" data-campaign="${campaign.id}">Add creators</button>`}</div></div>
      <div class="roster-toolbar"><div class="saved-views" aria-label="Saved roster views">${rosterViews.map((view) => `<button class="${state.rosterFilter === view ? "is-active" : ""}" data-action="roster-view" data-view="${escapeHtml(view)}">${escapeHtml(view)}</button>`).join("")}</div><div class="table-tools"><span class="toolbar-count">${visibleAssignments.length} shown</span><div role="group" aria-label="Roster columns"><button class="button button--secondary button--small" data-action="roster-column-set" data-set="operations" aria-pressed="${state.rosterColumnSet==='operations'}">Operations</button><button class="button button--secondary button--small" data-action="roster-column-set" data-set="finance" aria-pressed="${state.rosterColumnSet==='finance'}">Finance</button></div><button class="button button--secondary button--small" data-action="bulk-action">Bulk actions</button></div></div>
      ${campaign.assignments.length ? `<div class="data-table roster-table roster-table--${state.rosterColumnSet}">
        <div class="table-row table-head">${(state.rosterColumnSet==='finance'?['Creator','Fee','Payment','Invoice','Finance owner','Payment due','']:['Creator','Phase / stage','Next action','Owner','Due','Fee','Blocker','']).map(label=>`<span>${label}</span>`).join('')}</div>
        ${visibleAssignments.map((assignment) => {
          const creator = creatorById(assignment.creatorId);
          const due=assignment.deliverable?.dueDate||assignment.payment?.dueDate;
          const blocker=assignment.attentionItems?.find(item=>item.status!=='resolved');
          return `<button class="table-row table-button" ${creator?`data-action="open-creator" data-id="${escapeHtml(creator.id)}"`:'disabled title="Creator link needs review"'}>
            <span class="creator-cell">${creator?avatar(creator, "small"):''}<span><strong>${escapeHtml(creator?creatorDisplayName(creator):assignment.creatorDisplayName||assignment.creatorHandle||'Creator link unresolved')}</strong><small>${creator?escapeHtml(creatorIdentityMeta(creator, { includeTier: false })):'Link issue · last recorded name retained'}</small></span></span>
            ${state.rosterColumnSet==='finance'?`<span><strong>${assignment.rate===null?'Not recorded':`${escapeHtml(assignment.currency||'USD')} ${formatCurrency(assignment.rate)}`}</strong></span><span>${escapeHtml(assignment.paymentStatus)}</span><span>${escapeHtml(assignment.payment?.invoiceStatus||'Not recorded')}</span><span>${escapeHtml(assignment.payment?.owner||'Unassigned')}</span><span>${assignment.payment?.dueDate?formatDate(assignment.payment.dueDate):'Not recorded'}</span>`:`<span>${badge(assignmentWorkflowStatus(assignment))}</span>
            <span><strong>${escapeHtml(assignment.nextAction||'Not recorded')}</strong></span>
            <span><strong>${escapeHtml(assignment.owner||'Unassigned')}</strong></span>
            <span>${due?formatDate(due):'Not recorded'}</span>
            <span><strong>${assignment.rate===null?'Not recorded':`${escapeHtml(assignment.currency||'USD')} ${formatCurrency(assignment.rate)}`}</strong><small>${escapeHtml(assignment.paymentStatus)}</small></span>
            <span>${escapeHtml(blocker?.title||blocker?.summary||'None recorded')}</span>`}
            <span class="row-arrow">&#8594;</span>
          </button>`;
        }).join("")}
      </div>${visibleAssignments.length ? "" : `<div class="empty-state"><strong>No creators match this view.</strong><span>Choose another saved view without duplicating creator records.</span></div>`}` : `<div class="empty-state"><strong>No creators yet.</strong><span>Find creators from similar past campaigns to build this roster.</span></div>`}
    </section>`;
  }

  if (state.campaignTab === "deliverables") {
    const deliverableRows = campaign.assignments.flatMap((assignment) =>
      (assignment.deliverables?.length ? assignment.deliverables : [assignment.deliverable]).map((deliverable) => ({ assignment, deliverable }))
    );
    content = `<section class="panel">
      <div class="panel-heading"><div><p class="eyebrow">Content workflow</p><h2>Deliverables, versions, and approvals</h2></div><div class="page-actions"><button class="button button--secondary" data-action="add-deliverable">Add requirements</button><button class="button button--primary" data-action="bulk-action">Bulk update</button></div></div>
      <div class="data-table deliverables-table">
        <div class="table-row table-head"><span>Creator</span><span>Deliverable</span><span>Workflow status</span><span>Latest version</span><span>Exact post</span><span>Due / owner</span><span></span></div>
        ${deliverableRows.map(({ assignment, deliverable }) => {
          const creator = creatorById(assignment.creatorId);
          const versions = deliverable.versions || [];
          const latest = versions.at(-1);
          const timestampComment = versions.flatMap((version) => version.comments || [])[0];
          return `<div class="table-row">
            <span class="creator-cell">${avatar(creator, "small")}<span><strong>${escapeHtml(creatorDisplayName(creator))}</strong><small>${escapeHtml(assignment.status)}</small></span></span>
            <span><strong>${escapeHtml(deliverable.name || `${assignment.deliverable.platform || "Social"} content`)}</strong><small>${escapeHtml(deliverable.requirements || deliverable.sourceRecordId || assignment.deliverable.sourceRecordId)}</small></span>
            <span>${badge(deliverable.status)}<small>${deliverable.revisionCount || 0} revision${deliverable.revisionCount === 1 ? "" : "s"}${deliverable.approvedVersion ? ` · ${escapeHtml(deliverable.approvedVersion)} approved` : ""}</small></span>
            <span><strong>${latest ? escapeHtml(latest.label) : "Awaiting upload"}</strong><small>${latest ? `${escapeHtml(latest.source)} · ${formatDate(latest.createdAt)}` : "Upload file or attach Drive link"}${timestampComment ? ` · ${escapeHtml(timestampComment.at)} comment` : ""}</small></span>
            <span>${assignment.post ? `<a class="external-link" href="${escapeHtml(assignment.post.url)}" target="_blank" rel="noreferrer">Open exact post &#8599;</a><small>${assignment.post.verified ? "Verified for reporting" : "Not verified — excluded"}</small>` : `<strong class="missing-text">Not posted</strong>`}</span>
            <span><strong>${deliverable.dueDate ? formatDate(deliverable.dueDate) : "No deadline"}</strong><small>${escapeHtml(deliverable.owner || assignment.owner)}</small></span>
            <span class="row-actions"><button class="button button--secondary button--small" data-action="content-review" data-assignment="${assignment.id}" data-deliverable="${escapeHtml(deliverable.id || assignment.deliverable.sourceRecordId)}">Review</button>${canUseAction("update_deliverable", assignment) ? `<button class="button button--secondary button--small" data-action="update-deliverable" data-id="${assignment.id}">Update</button>` : readOnlyAction("Deliverables")}</span>
          </div>`;
        }).join("") || `<div class="empty-state"><strong>No deliverables yet.</strong><span>Add creators before creating assignments.</span></div>`}
      </div>
    </section>`;
  }

  if (state.campaignTab === "communication") {
    const communicationItems = campaign.assignments.flatMap((assignment) => {
      const creator = creatorById(assignment.creatorId);
      const linkedThreads = asOperationArray(campaign.gmailThreads).filter((item) =>
        item.assignmentId === assignment.id || (!item.assignmentId && item.creatorId === assignment.creatorId)
      );
      return uniqueOperationRecords(assignment.communications, linkedThreads)
        .map((item) => ({ ...item, creator, assignment }));
    }).sort((a, b) => String(b.latestMessageAt || b.date || "").localeCompare(String(a.latestMessageAt || a.date || "")));
    content = `<div class="workspace-columns communication-layout">
      <section class="panel">
        <div class="panel-heading"><div><p class="eyebrow">Campaign communication</p><h2>Creator correspondence</h2></div><div class="page-actions"><a class="button button--secondary" href="https://mail.google.com/" target="_blank" rel="noreferrer">Open Gmail</a><button class="button button--primary" data-action="link-thread">Link Gmail thread</button></div></div>
        <div class="communication-timeline">${communicationItems.length ? communicationItems.map((item) => `
          <article class="communication-item"><span class="timeline-marker" aria-hidden="true"></span><div><div class="activity-title"><strong>${escapeHtml(item.approvedSubject || item.milestone || "Campaign communication")}</strong>${badge(item.replyNeeded ? "Reply needed" : item.status || item.type, item.replyNeeded ? "warn" : "neutral")}</div>${item.replyNeeded ? "<p>A reply is required in Gmail.</p>" : ""}<small>${escapeHtml(creatorDisplayName(item.creator))} · Latest message ${formatDate(item.latestMessageAt || item.date)} · ${Number.isFinite(item.messageCount) ? `${item.messageCount} message${item.messageCount === 1 ? "" : "s"}` : "Message count not recorded"} · ${escapeHtml(item.owner || "Unassigned")}</small>${isOpenCommunicationAction(item.nextAction) ? `<div class="next-action"><span>Next action</span><strong>${escapeHtml(item.nextAction)}</strong></div>` : ""}</div><div class="communication-item__actions">${canUseAction("update_communication_action", campaign) ? `<button class="text-button" data-action="edit-communication-action" data-thread="${escapeHtml(item.gmailThreadId || item.id || "")}">Set next action</button>` : ""}${item.href ? `<a class="external-link" href="${escapeHtml(item.href)}" target="_blank" rel="noreferrer">Open in Gmail &#8599;</a>` : `<span class="helper-text">Gmail link unavailable</span>`}</div></article>`).join("") : `<div class="empty-state"><strong>No linked communication yet.</strong><span>Link a Gmail thread to get started.</span></div>`}</div>
      </section>
      <aside class="panel communication-side">
        <div class="panel-heading"><div><p class="eyebrow">Campaign notes</p><h2>Notes and decisions</h2></div></div>
        ${activities.slice(0, 5).map((update) => `<div class="note-row"><strong>${escapeHtml(update.status)}</strong><p>${escapeHtml(update.note)}</p><small>${escapeHtml(update.owner)} · ${formatDate(update.createdAt)}</small></div>`).join("") || `<p class="empty-copy">No internal decisions recorded.</p>`}
        <button class="button button--secondary button--full" data-action="add-campaign-update">Add internal note</button>
      </aside>
    </div>`;
  }

  if (state.campaignTab === "reporting") {
    content = `<section class="panel">
      <div class="panel-heading"><div><p class="eyebrow">Reporting</p><h2>Reporting and SocialCrawl status</h2></div><div class="page-actions">${canUseAction("verify_post", campaign) ? `<button class="button button--secondary" data-action="refresh-social" ${campaign.operationsLoadState?.status === "refreshing" ? "disabled" : ""}>Refresh now</button>` : `<button class="button button--secondary" disabled title="Your role can view status but cannot queue SocialCrawl work">Refresh: read only</button>`}<button class="button button--secondary" data-action="report-builder">Configure report</button>${campaign.reportId ? `<button class="button button--primary" data-action="open-report" data-id="${campaign.reportId}">Open report</button>` : ""}</div></div>
      <div class="report-module-strip"><span><strong>Campaign summary</strong><small>Included</small></span><span><strong>Creator completion</strong><small>Included</small></span><span><strong>Content gallery</strong><small>Included</small></span><span><strong>Performance</strong><small>Metrics</small></span><span><strong>Budget efficiency</strong><small>Budget</small></span></div>
      <div class="data-table performance-table">
        <div class="table-row table-head"><span>Creator / format</span><span>Views</span><span>Engagement</span><span>Metric history</span><span>SocialCrawl refresh</span></div>
        ${campaign.assignments.map((assignment) => {
          const creator = creatorById(assignment.creatorId);
          const eligible = assignment.post?.verified && assignment.performance?.verified;
          const liveStatus = asOperationArray(assignment.socialcrawlStatus).find((candidate) =>
            (!candidate.postId || candidate.postId === assignment.post?.id) &&
            (!candidate.attributionId || candidate.attributionId === assignment.post?.attributionId)
          );
          const socialCrawlStatus = liveStatus?.lastErrorCode
            ? "Refresh failed"
            : liveStatus?.refreshActive
              ? "Queued"
              : liveStatus?.trackingState || assignment.performance?.socialCrawl?.status || "No refresh record";
          const lastSocialCrawlSuccess = liveStatus?.lastSuccessAt || assignment.performance?.socialCrawl?.lastSuccessfulRefresh;
          return `<div class="table-row ${eligible ? "" : "row-muted"}">
            <span class="creator-cell">${avatar(creator, "small")}<span><strong>${escapeHtml(creatorDisplayName(creator))}</strong><small>${escapeHtml(assignment.post?.platform || assignment.deliverable?.platform || "Platform pending")} · ${eligible ? "Report eligible" : "Excluded until verified"}</small></span></span>
            <span><strong>${formatCompact(eligible ? assignment.performance?.views : null)}</strong><small>${eligible ? "Social metric" : "Missing or unverified"}</small></span>
            <span><strong>${eligible && Number.isFinite(assignment.performance?.engagementRate) ? `${assignment.performance.engagementRate}%` : "Missing"}</strong><small>Social metric</small></span>
            <span><strong>${assignment.performance?.snapshots?.length || 0} snapshot${assignment.performance?.snapshots?.length === 1 ? "" : "s"}</strong><small>${eligible ? `${escapeHtml(assignment.performance.sourceRecordId)} · ${escapeHtml(assignment.performance.source)}` : "No reportable snapshot"}</small></span>
            <span><strong>${escapeHtml(socialCrawlStatus)}</strong><small>${lastSocialCrawlSuccess ? `Last success ${formatDate(lastSocialCrawlSuccess)}` : escapeHtml(liveStatus?.lastErrorCode || assignment.performance?.socialCrawl?.error || "No successful refresh")}</small></span>
          </div>`;
        }).join("") || `<div class="empty-state"><strong>No performance records yet.</strong><span>Metrics appear after exact posts are verified.</span></div>`}
      </div>
    </section>`;
  }

  if (state.campaignTab === "commercial") {
    content = `${renderCampaignCommercialSummary(campaign)}<section class="panel">
      <div class="panel-heading"><div><p class="eyebrow">Commercial status</p><h2>Fees, approvals, and payment obligations</h2></div></div>
      <div class="data-table payments-table">
        <div class="table-row table-head"><span>Creator</span><span>Agreed fee</span><span>Due date</span><span>Approvals</span><span>Payment status</span><span>Owner / source</span><span></span></div>
        ${campaign.assignments.map((assignment) => {
          const creator = creatorById(assignment.creatorId);
          return `<div class="table-row">
            <span class="creator-cell">${avatar(creator, "small")}<span><strong>${escapeHtml(creatorDisplayName(creator))}</strong><small>${escapeHtml(campaign.type)}</small></span></span>
            <span><strong>${formatCurrency(assignment.rate)}</strong><small>${assignment.rate ? "Negotiated terms retained" : "Product only"}</small></span>
            <span><strong>${assignment.payment?.dueDate ? formatDate(assignment.payment.dueDate) : "Not recorded"}</strong><small>${assignment.payment?.invoiceStatus || "Invoice status missing"}</small></span>
            <span><strong>CEO: ${escapeHtml(assignment.payment?.ceoApproval || "Unknown")}</strong><small>CFO: ${escapeHtml(assignment.payment?.cfoApproval || "Unknown")}</small>${renderPaymentApprovalActions(assignment)}</span>
            <span>${badge(assignment.payment?.status || assignment.paymentStatus)}<small>${/pending|overdue/i.test(assignment.payment?.status || assignment.paymentStatus) ? "Open obligation retained" : "No open exception"}</small></span>
            <span><strong>${escapeHtml(assignment.payment?.owner || "Unassigned")}</strong><small>${escapeHtml(assignment.payment?.sourceRecordId || "Commercial source missing")}</small></span>
            <span>${canUseAction("update_payment", assignment) ? `<button class="button button--secondary button--small" data-action="update-payment" data-id="${assignment.id}">Update</button>` : readOnlyAction("Payments")}</span>
          </div>`;
        }).join("") || `<div class="empty-state"><strong>No commercial obligations yet.</strong><span>They appear when campaign assignments are confirmed.</span></div>`}
      </div>
    </section>
    <div class="workspace-columns">
      <section class="panel">
        <div class="panel-heading"><div><p class="eyebrow">Usage and contracts</p><h2>Rights status</h2></div></div>
        <div class="simple-table rights-table"><div class="simple-head"><span>Creator</span><span>Contract</span><span>Usage / paid media</span><span>Expiration</span></div>${campaign.assignments.map((assignment) => {
          const creator = creatorById(assignment.creatorId);
          return `<div><span><strong>${escapeHtml(creatorDisplayName(creator))}</strong><small>${escapeHtml(assignment.rights?.platforms?.join(", ") || "Platform pending")}</small></span><span>${escapeHtml(assignment.rights?.contractStatus || "Not recorded")}<small>${escapeHtml(assignment.rights?.contractSource || "No file or Drive link")}</small></span><span>${escapeHtml(assignment.rights?.usageType || "Not recorded")}<small>${assignment.rights?.whitelisting ? "Whitelisting approved" : "No whitelisting permission"}</small></span><span>${assignment.rights?.expiresAt ? formatDate(assignment.rights.expiresAt) : "Not recorded"}<small>${escapeHtml(assignment.rights?.reminder || "No reminder")}</small></span></div>`;
        }).join("")}</div>
      </section>
      <section class="panel">
        <div class="panel-heading"><div><p class="eyebrow">Product fulfillment</p><h2>Shipping</h2></div></div>
        <div class="shipping-list">${campaign.assignments.map((assignment) => {
          const creator = creatorById(assignment.creatorId);
          const shipment = assignment.shipments?.[0];
          return `<div class="shipping-row"><span><strong>${escapeHtml(creatorDisplayName(creator))}</strong><small>${escapeHtml(shipment?.product || "No shipment recorded")} · Qty ${shipment?.quantity || "—"}</small></span><span>${badge(shipment?.status || "Not started")}<small>${shipment?.carrier ? `Carrier ${escapeHtml(shipment.carrier)}` : "Carrier not recorded"}</small></span><span><strong>${shipment?.shipBy ? formatDate(shipment.shipBy) : "No deadline"}</strong><small>${escapeHtml(shipment?.owner || "Unassigned")}</small></span><button class="button button--secondary button--small" data-action="shipping-details" data-id="${assignment.id}">Details</button></div>`;
        }).join("")}</div>
      </section>
    </div>`;
  }

  if (state.campaignTab === "calendar") {
    const calendarEvents = [
      ...campaign.assignments.flatMap((assignment) => {
        const creator = creatorById(assignment.creatorId);
        const deliverables = assignment.deliverables?.length ? assignment.deliverables : [assignment.deliverable];
        return [
          ...deliverables.filter((item) => item?.dueDate).map((item) => ({ date: item.dueDate, type: "Draft due", title: item.name || "Creator deliverable", owner: item.owner || assignment.owner, creator })),
          assignment.shipments?.[0]?.shipBy ? { date: assignment.shipments[0].shipBy, type: "Shipping", title: `${assignment.shipments[0].product} shipment`, owner: assignment.shipments[0].owner, creator } : null,
          assignment.post?.postedDate ? { date: assignment.post.postedDate, type: "Published", title: "Published post", owner: assignment.owner, creator } : null,
          assignment.performance?.socialCrawl?.nextRefresh ? { date: assignment.performance.socialCrawl.nextRefresh, type: "Metric refresh", title: "SocialCrawl weekly refresh", owner: assignment.performance.owner, creator } : null,
          assignment.payment?.dueDate ? { date: assignment.payment.dueDate, type: "Payment due", title: "Creator payment obligation", owner: assignment.payment.owner, creator } : null,
          assignment.rights?.expiresAt ? { date: assignment.rights.expiresAt, type: "Rights expiration", title: assignment.rights.usageType, owner: assignment.owner, creator } : null
        ].filter(Boolean);
      }),
      { date: campaign.endDate, type: "Reporting", title: "Campaign reporting deadline", owner: campaign.reportOwner, creator: null }
    ].sort((a, b) => String(a.date).localeCompare(String(b.date)));
    content = `<section class="panel calendar-panel">
      <div class="panel-heading"><div><p class="eyebrow">Campaign schedule</p><h2>Calendar</h2></div><div class="calendar-filters"><button class="button button--secondary button--small" data-action="calendar-filter">Creator</button><button class="button button--secondary button--small" data-action="calendar-filter">Owner</button><button class="button button--secondary button--small" data-action="calendar-filter">Deliverable type</button><button class="button button--secondary button--small" data-action="calendar-filter">Status</button></div></div>
      <div class="calendar-list"><div class="calendar-head"><span>Date</span><span>Milestone</span><span>Creator</span><span>Owner</span><span>Status</span></div>${calendarEvents.map((item) => `<div class="calendar-row"><time datetime="${escapeHtml(item.date)}"><strong>${formatDate(item.date)}</strong><small>${new Date(`${item.date}T00:00:00Z`) < new Date() ? "Past" : "Upcoming"}</small></time><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.type)}</small></span><span>${item.creator ? escapeHtml(creatorDisplayName(item.creator)) : "Campaign-wide"}</span><span>${escapeHtml(item.owner || "Unassigned")}</span><span>${badge(new Date(`${item.date}T00:00:00Z`) < new Date() ? "Recorded" : "Scheduled", "neutral")}</span></div>`).join("")}</div>
    </section>`;
  }

  return `
    <button class="back-link" data-action="navigate" data-view="campaigns">&#8592; All campaigns</button>
    <section class="campaign-hero">
      <div><div class="hero-badges">${badge(campaign.status)}${badge(campaign.type, "neutral")}<span>${escapeHtml(campaign.category)}</span></div><h1>${escapeHtml(campaign.name)}</h1><p>${escapeHtml(campaign.brand)} · ${formatDate(campaign.startDate)} - ${formatDate(campaign.endDate)}</p></div>
      <div class="page-actions">${campaignClient ? `<button class="button button--secondary" data-action="open-client" data-id="${escapeHtml(campaignClient.id)}">Open client</button>` : ""}${canUseAction("add_campaign_update", campaign) ? `<button class="button button--secondary" data-action="add-campaign-update">Add update</button>` : `<button class="button button--secondary" disabled title="Your role has read-only campaign access">Updates: read only</button>`}${isLiveMode() ? `<button class="button button--secondary" data-action="navigate" data-view="creators">Open creator directory</button>` : `<button class="button button--secondary" data-action="open-finder" data-campaign="${campaign.id}">Add creators</button>`}${campaign.reportId ? `<button class="button button--primary" data-action="open-report" data-id="${campaign.reportId}">Open report</button>` : ""}</div>
    </section>
    <nav class="tabs" aria-label="Campaign sections">${tabs.map(([id, label]) => `<button class="${state.campaignTab === id ? "is-active" : ""}" data-action="campaign-tab" data-tab="${id}">${label}</button>`).join("")}</nav>
    ${content}`;
};

const renderReports = () => {
  const reportable = state.campaigns.filter((campaign) => campaign.reportId
    || state.crm.reportVersions.some((version) => version.campaignId === campaign.id)
    || campaign.status !== "Planning");
  return `
    ${pageHeader({
      eyebrow: "Campaign reporting",
      title: "Reports",
      description: "Open or download reports generated from the current campaign records.",
      actions: `<button class="button button--primary" data-action="navigate" data-view="campaigns">Open campaigns</button>`
    })}
    <section class="panel">
      <div class="report-list">
        ${reportable.map((campaign) => {
          const gaps = campaignGaps(campaign);
          const gapCount = gaps.missingPosts + gaps.unverifiedPosts + gaps.missingMetrics;
          return `<article class="report-row">
            <div class="report-icon" aria-hidden="true">R</div>
            <div class="report-main"><div class="report-title-line"><h2>${escapeHtml(campaign.name)}</h2>${badge(campaign.reportStatus)}</div><p>${escapeHtml(campaign.brand)} · ${escapeHtml(campaign.category)} · ${formatDate(campaign.endDate)}</p><small>${campaign.reportId ? escapeHtml(campaign.reportId) : "Report not created"} · Owned by ${escapeHtml(campaign.reportOwner)}</small></div>
            <div class="report-coverage"><strong>${campaign.assignments.filter((assignment) => assignment.post?.verified).length}/${campaign.assignments.length}</strong><span>verified posts</span></div>
            <div class="report-coverage"><strong>${gapCount}</strong><span>visible gaps</span></div>
            <div class="report-actions">${campaign.reportId ? `<button class="button button--secondary button--small" data-action="download-report" data-id="${campaign.reportId}">Download file</button><button class="button button--primary button--small" data-action="open-report" data-id="${campaign.reportId}">Open report</button>` : `<button class="button button--secondary button--small" data-action="open-campaign" data-id="${campaign.id}">Open campaign</button>`}</div>
          </article>`;
        }).join("") || `<div class="empty-state"><strong>No report records are ready yet.</strong><span>Open a campaign to complete its report.</span><button class="button button--primary" data-action="navigate" data-view="campaigns">Open campaigns</button></div>`}
      </div>
    </section>`;
};

const deliverablesForAssignment = (assignment) =>
  assignment.deliverables?.length ? assignment.deliverables : [assignment.deliverable].filter(Boolean);

const hasApprovedContentVersion = (assignment) => {
  return deliverablesForAssignment(assignment).some((deliverable) => {
    const versions = Array.isArray(deliverable.versions) ? deliverable.versions : [];
    const approvedVersionExists = versions.some((version) => version.id === deliverable.approvedVersion);
    return approvedVersionExists && /approved|published|posted|complete/i.test(deliverable.status || "");
  });
};

const clientReportEligibility = (assignment) => {
  const approvedContent = hasApprovedContentVersion(assignment);
  const postDeliverable = deliverablesForAssignment(assignment).find((deliverable) =>
    deliverable.id && deliverable.id === assignment.post?.deliverableId
  );
  const postDeliverableVersions = Array.isArray(postDeliverable?.versions) ? postDeliverable.versions : [];
  const exactDeliverableApproved = Boolean(
    postDeliverable &&
    postDeliverableVersions.some((version) => version.id === postDeliverable.approvedVersion) &&
    /approved|published|posted|complete/i.test(postDeliverable.status || "") &&
    (!assignment.post?.platform || !postDeliverable.platform || assignment.post.platform === postDeliverable.platform)
  );
  const exactPost = exactDeliverableApproved && assignment.post?.verified === true;
  const metrics = exactPost && assignment.performance?.verified === true;
  return { approvedContent, exactPost, metrics };
};

const reportMetricTotals = (campaign) => {
  const eligible = campaign.assignments.filter((assignment) => clientReportEligibility(assignment).metrics);
  const sum = (field) => {
    const values = eligible.map((assignment) => assignment.performance[field]).filter(Number.isFinite);
    return values.length ? values.reduce((total, value) => total + value, 0) : null;
  };
  const engagementValues = eligible.map((assignment) => assignment.performance.engagementRate).filter(Number.isFinite);
  return {
    eligible,
    views: sum("views"),
    engagement: engagementValues.length ? engagementValues.reduce((total, value) => total + value, 0) / engagementValues.length : null
  };
};

const reportVersionsForCampaign = (campaignId) => state.crm.reportVersions
  .filter((version) => version.campaignId === campaignId)
  .sort((left, right) => String(left.publishedAt || "").localeCompare(String(right.publishedAt || "")));

const renderPublishedReportVersion = (campaign, metadata) => {
  const unavailableTitle = "Campaign report";
  if (!metadata) {
    return `
      <section class="panel"><div class="empty-state"><strong>This report version is not available.</strong><span>It may be expired, revoked, or not found.</span></div></section>`;
  }
  const expiration = metadata.expiresAt || metadata.expiration || null;
  const expired = Boolean(expiration) && new Date(expiration.length === 10 ? `${expiration}T23:59:59Z` : expiration) < new Date();
  if (expired) {
    return `
      <section class="report-hero"><div><p class="eyebrow">${escapeHtml(metadata.id)} · published version</p><h1>${escapeHtml(unavailableTitle)}</h1><p>Published ${formatDate(String(metadata.publishedAt).slice(0, 10))} · expired ${formatDate(String(expiration).slice(0, 10))}</p></div></section>
      <div class="report-notice report-notice--warn"><strong>Access expired</strong><span>Publish a new version to continue.</span></div>`;
  }
  if (metadata.revokedAt) {
    return `<section class="report-hero"><div><p class="eyebrow">${escapeHtml(metadata.id)} · revoked version</p><h1>${escapeHtml(unavailableTitle)}</h1></div></section><div class="report-notice report-notice--warn"><strong>Access revoked</strong></div>`;
  }
  const artifactRead = state.crm.artifactReads[artifactReadKey("report", metadata.id)];
  if (artifactRead?.status !== "ready") {
    const failed = artifactRead?.status === "error";
    return `
      <section class="report-hero"><div><p class="eyebrow">${escapeHtml(metadata.id)} · published version</p><h1>${escapeHtml(unavailableTitle)}</h1><p>Published ${formatDate(String(metadata.publishedAt).slice(0, 10))}</p></div></section>
      <section class="panel"><div class="empty-state"><strong>${failed ? "This version could not be opened." : "Opening version…"}</strong>${failed ? `<span>${escapeHtml(artifactRead.error || "Try again.")}</span>` : ""}</div></section>`;
  }
  const version = { ...metadata, ...artifactRead.data };
  const snapshot = version.snapshot || null;
  const publishedModules = Array.isArray(snapshot?.configuration?.modules)
    ? snapshot.configuration.modules.filter((module) => reportBuilderModules.includes(module))
    : Array.isArray(version.modules)
      ? version.modules.filter((module) => reportBuilderModules.includes(module))
      : [];
  const summaryIncluded = publishedModules.includes("Campaign summary and objectives");
  const performanceIncluded = publishedModules.includes("Verified platform performance");
  const publishedTitle = summaryIncluded && snapshot?.campaign?.name
    ? snapshot.campaign.name
    : unavailableTitle;
  const performance = performanceIncluded && Array.isArray(snapshot?.verifiedPerformance)
    ? snapshot.verifiedPerformance
    : [];
  const publishedMetricLabels = Array.isArray(snapshot?.configuration?.metrics)
    ? snapshot.configuration.metrics.filter((metric) => reportBuilderMetrics.includes(metric))
    : ["Views"];
  const publishedMetricEntry = (row, label) => row.metrics?.[label.toLowerCase()] ?? null;
  const publishedMetricHeaders = publishedMetricLabels.map((label) => `<span>${escapeHtml(label)}</span>`).join("");
  const publishedMetricCells = (row) => publishedMetricLabels.map((label) => {
    const entry = publishedMetricEntry(row, label);
    const value = entry && typeof entry === "object" ? entry.value : entry;
    const sourceRecordId = entry && typeof entry === "object"
      ? entry.sourceRecordId
      : row.metrics?.sourceRecordId;
    return `<span><strong>${Number.isFinite(value) ? formatCompact(value) : "Missing"}</strong><small>${escapeHtml(sourceRecordId || "No metric source")}</small></span>`;
  }).join("");
  const selectedSnapshotSections = [
    summaryIncluded ? `<header><h2>${escapeHtml(snapshot?.campaign?.name || unavailableTitle)}</h2><p>${escapeHtml(snapshot?.campaign?.objective || "No objective was included in this version.")}</p></header>` : "",
    performanceIncluded ? `<section><h3>Performance</h3><div class="simple-table"><div class="simple-head"><span>Creator</span><span>Platform</span>${publishedMetricHeaders}</div>${performance.map((row) => `<div><span><strong>${escapeHtml(row.creatorId || "Creator record")}</strong><small>${escapeHtml(row.assignmentId || "Assignment")}</small></span><span><strong>${escapeHtml(row.post?.platform || "Not available")}</strong></span>${publishedMetricCells(row)}</div>`).join("") || `<div class="empty-state"><strong>No performance rows were included.</strong></div>`}</div></section>` : ""
  ].filter(Boolean).join("");
  const snapshotBody = version.html
    ? `<iframe class="published-report-frame" title="${escapeHtml(version.id)} report snapshot" sandbox="allow-popups allow-popups-to-escape-sandbox" srcdoc="${escapeHtml(version.html)}"></iframe>`
    : `<article class="report-document">${selectedSnapshotSections || `<div class="empty-state"><strong>No report sections were included.</strong></div>`}</article>`;
  return `
    <section class="report-hero">
      <div><p class="eyebrow">${escapeHtml(version.id)} · published version</p><h1>${escapeHtml(publishedTitle)}</h1><p>Published ${formatDate(String(version.publishedAt).slice(0, 10))} · ${escapeHtml(version.branding || "BYOU + client")} · expires ${expiration ? formatDate(String(expiration).slice(0, 10)) : "not set"}</p></div>
      <div class="page-actions"><button class="button button--secondary" data-action="copy-report-link" data-id="${escapeHtml(campaign.reportId)}" data-version="${escapeHtml(version.id)}">Copy link</button>${version.html ? `<button class="button button--primary" data-action="download-report-version" data-id="${escapeHtml(version.id)}">Download this version</button>` : ""}</div>
    </section>
    ${snapshotBody}`;
};

const renderReport = () => {
  const campaign = reportCampaign(state.selectedReportId) || state.campaigns.find((item) => item.reportId);
  if (!campaign) {
    return `${pageHeader({ eyebrow: "Campaign reporting", title: "Reports", description: "" })}<section class="panel"><div class="empty-state"><strong>No report is available.</strong><span>Complete the campaign first.</span></div></section>`;
  }
  const publishedVersions = reportVersionsForCampaign(campaign.id);
  if (state.selectedReportVersionId) {
    const selectedVersion = publishedVersions.find((version) => version.id === state.selectedReportVersionId);
    return renderPublishedReportVersion(campaign, selectedVersion);
  }
  if (isLiveMode() && campaign.operationsLoadState?.status !== "ready") {
    const unavailable = campaign.operationsLoadState?.status === "unavailable";
    return `
      <button class="back-link" data-action="navigate" data-view="reports">&#8592; All reports</button>
      ${pageHeader({ eyebrow: "Campaign reporting", title: campaign.name, description: "" })}
      <section class="panel"><div class="empty-state"><strong>${unavailable ? "Report is temporarily unavailable." : "Loading report..."}</strong><span>${unavailable ? "Try opening this report again." : "Loading campaign data."}</span></div></section>`;
  }
  const gaps = campaignGaps(campaign);
  const totals = reportMetricTotals(campaign);
  const latestPublishedVersion = publishedVersions.slice().reverse().find((version) => !artifactVersionUnavailable(version));
  const unapprovedContent = campaign.assignments.filter((assignment) => !clientReportEligibility(assignment).approvedContent).length;
  return `
    <button class="back-link" data-action="navigate" data-view="reports">&#8592; All reports</button>
    <section class="report-hero">
      <div><p class="eyebrow">${escapeHtml(campaign.reportId)} · campaign report</p><h1>${escapeHtml(campaign.name)}</h1><p>${formatDate(campaign.startDate)} - ${formatDate(campaign.endDate)} · ${publishedVersions.length} published version${publishedVersions.length === 1 ? "" : "s"}</p></div>
      <div class="page-actions">${latestPublishedVersion ? `<button class="button button--secondary" data-action="open-report-version" data-id="${escapeHtml(campaign.reportId)}" data-version="${escapeHtml(latestPublishedVersion.id)}">Open latest version</button><button class="button button--secondary" data-action="copy-report-link" data-id="${escapeHtml(campaign.reportId)}" data-version="${escapeHtml(latestPublishedVersion.id)}">Copy link</button>` : `<button class="button button--secondary" disabled title="Publish a version from the campaign Reporting tab first">Publish a version first</button>`}<button class="button button--primary" data-action="download-report" data-id="${campaign.reportId}">Download draft</button></div>
    </section>
    <section class="panel">
      <div class="panel-heading"><div><p class="eyebrow">Report preview</p><h2>Live internal preview</h2><p>Updates as campaign data changes.</p></div>${badge(state.crm.reportPreviews[campaign.id]?.evidenceCoverage || campaign.reportStatus, state.crm.reportPreviews[campaign.id]?.evidenceCoverage === "complete" ? "good" : "warn")}</div>
      <div class="published-version-list"><h3>Published versions</h3>${publishedVersions.length ? publishedVersions.slice().reverse().map((version) => `<div><span><strong>${escapeHtml(version.id)}</strong><small>Published ${formatDate(String(version.publishedAt).slice(0, 10))} · expires ${version.expiresAt || version.expiration ? formatDate(String(version.expiresAt || version.expiration).slice(0, 10)) : "not set"}</small></span>${version.revokedAt ? badge("Revoked", "warn") : artifactVersionUnavailable(version) ? badge("Expired", "warn") : `<button class="text-button" data-action="open-report-version" data-id="${escapeHtml(campaign.reportId)}" data-version="${escapeHtml(version.id)}">Open</button>`}</div>`).join("") : `<p class="empty-copy">No report version has been published.</p>`}</div>
    </section>
    <article class="report-document">
      <section><div class="section-number">01</div><div class="report-section-body"><h2>Campaign objective and dates</h2><p class="report-lead">${escapeHtml(campaign.objective)}</p><dl class="report-facts"><div><dt>Client / brand</dt><dd>${escapeHtml(campaign.client)} / ${escapeHtml(campaign.brand)}</dd></div><div><dt>Campaign type</dt><dd>${escapeHtml(campaign.type)}</dd></div><div><dt>Dates</dt><dd>${formatDate(campaign.startDate)} - ${formatDate(campaign.endDate)}</dd></div><div><dt>Owner</dt><dd>${escapeHtml(campaign.owner)}</dd></div></dl></div></section>
      <section><div class="section-number">02</div><div class="report-section-body"><h2>Creator and deliverable completion</h2><div class="simple-table"><div class="simple-head"><span>Creator</span><span>Deliverables</span><span>Client visibility</span></div>${campaign.assignments.map((assignment) => { const creator = creatorById(assignment.creatorId); const deliverables = deliverablesForAssignment(assignment); const approved = deliverables.filter((deliverable) => /approved|published|posted|complete/i.test(deliverable.status || "") && deliverable.approvedVersion).length; return `<div><span>${escapeHtml(creatorDisplayName(creator))}</span><span>${approved}/${deliverables.length} approved</span><span>${approved ? badge("Approved content") : badge("Excluded", "warn")}</span></div>`; }).join("")}</div></div></section>
      <section><div class="section-number">03</div><div class="report-section-body"><h2>Approved content and exact posts</h2><div class="simple-table post-report-table"><div class="simple-head"><span>Creator</span><span>Deliverable</span><span>Exact post</span><span>Eligibility</span></div>${campaign.assignments.map((assignment) => { const creator = creatorById(assignment.creatorId); const eligibility = clientReportEligibility(assignment); return `<div class="${eligibility.exactPost ? "" : "row-muted"}"><span>${escapeHtml(creatorDisplayName(creator))}</span><span>${escapeHtml(assignment.deliverable.status)}</span><span>${eligibility.exactPost ? `<a href="${escapeHtml(assignment.post.url)}" target="_blank" rel="noreferrer">Open approved post &#8599;</a>` : `<em>Excluded</em>`}</span><span>${eligibility.exactPost ? badge("Verified") : badge("Excluded", "warn")}</span></div>`; }).join("")}</div></div></section>
      <section><div class="section-number">04</div><div class="report-section-body"><h2>Performance</h2><div class="report-kpis"><div><span>Views</span><strong>${Number.isFinite(totals.views) ? formatCompact(totals.views) : "Missing"}</strong></div><div><span>Avg. engagement</span><strong>${Number.isFinite(totals.engagement) ? `${totals.engagement.toFixed(1)}%` : "Missing"}</strong></div><div><span>Costco retail context</span><strong>Reported separately</strong></div></div><div class="simple-table performance-report-table"><div class="simple-head"><span>Creator</span><span>Views</span><span>Source record</span><span>Collected</span></div>${campaign.assignments.map((assignment) => { const creator = creatorById(assignment.creatorId); const eligible = clientReportEligibility(assignment).metrics; return `<div class="${eligible ? "" : "row-muted"}"><span>${escapeHtml(creatorDisplayName(creator))}</span><span>${formatCompact(eligible ? assignment.performance.views : null)}</span><span>${escapeHtml(eligible ? assignment.performance.sourceRecordId : "Missing")}</span><span>${eligible ? formatDate(assignment.performance.collectedAt) : "Not reportable"}</span></div>`; }).join("")}</div></div></section>
      <section><div class="section-number">05</div><div class="report-section-body"><h2>Missing data</h2><div class="report-kpis"><div><span>Content excluded</span><strong>${unapprovedContent}</strong></div><div><span>Posts missing or unverified</span><strong>${gaps.missingPosts + gaps.unverifiedPosts}</strong></div><div><span>Metric records missing</span><strong>${gaps.missingMetrics}</strong></div></div></div></section>
    </article>`;
};

const renderTemplates = () => {
  const templates = [
    { name: "Paid creator campaign", type: "Paid", description: "Negotiation, rates, contracts, content revisions, shipping, approvals, reporting, and payment obligations.", roles: "Campaign manager, content reviewer, finance approver, analyst", deliverables: "TikTok, Reels, Stories, Shorts", schedule: "Draft due 14 days before posting" },
    { name: "Product seeding campaign", type: "Seeding", description: "Sourcing, participation, product fulfillment, receipt confirmation, organic-post tracking, rights, and reporting.", roles: "Campaign manager, shipping owner, analyst", deliverables: "Organic posts and optional content", schedule: "Shipment due 21 days before target post" },
    { name: "Blank campaign", type: "Blank", description: "Start with the shared campaign sections and configure workflow, roles, deliverables, approvals, and reminders.", roles: "Choose during setup", deliverables: "None prefilled", schedule: "No default deadlines" }
  ];
  return `
    ${pageHeader({ eyebrow: "Reusable setup", title: "Templates", description: "Create a campaign from a standard workflow, duplicate an existing campaign, or start blank.", actions: `<button class="button button--primary" data-action="new-campaign">Create blank campaign</button>` })}
    <section class="panel template-panel">
      <div class="data-table template-table"><div class="table-row table-head"><span>Template</span><span>Workflow</span><span>Default team roles</span><span>Typical deliverables</span><span>Standard timing</span><span></span></div>${templates.map((template) => `<div class="table-row"><span><strong>${escapeHtml(template.name)}</strong><small>${escapeHtml(template.description)}</small></span><span>${badge(template.type, "neutral")}<small>Overview through reporting</small></span><span>${escapeHtml(template.roles)}</span><span>${escapeHtml(template.deliverables)}</span><span>${escapeHtml(template.schedule)}</span><span></span></div>`).join("")}</div>
    </section>
    <section class="panel duplicate-panel"><div class="panel-heading"><div><p class="eyebrow">Use prior setup</p><h2>Duplicate a campaign</h2></div></div><div class="duplicate-list">${state.campaigns.slice(-4).reverse().map((campaign) => `<div><span><strong>${escapeHtml(campaign.name)}</strong><small>${escapeHtml(campaign.type)} · ${escapeHtml(campaign.client)}</small></span><button class="button button--secondary button--small" data-action="duplicate-campaign" data-id="${campaign.id}">Duplicate</button></div>`).join("")}</div></section>`;
};

const representationCountLabel = (record) => {
  const current = Number(record.currentCreatorCount || 0);
  const former = Number(record.formerCreatorCount || 0);
  const unconfirmed = Number(record.unconfirmedCreatorCount || 0);
  return `${current} current · ${former} former${unconfirmed ? ` · ${unconfirmed} unconfirmed` : ""}`;
};

const renderRepresentationDirectory = (resource) => {
  const isAgency = resource === "talentAgencies";
  const records = state[resource];
  const page = state[isAgency ? "talentAgencyPage" : "talentManagerPage"];
  const search = state[isAgency ? "talentAgencySearch" : "talentManagerSearch"];
  const noun = isAgency ? "talent agency" : "manager";
  const title = isAgency ? "Talent Agencies" : "Managers";
  const action = isAgency ? "open-talent-agency" : "open-talent-manager";
  const loadAction = isAgency ? "load-more-talent-agencies" : "load-more-talent-managers";
  const field = isAgency ? "talent-agency-search" : "talent-manager-search";
  return `
    ${pageHeader({
      eyebrow: "Representation directory",
      title,
      description: isAgency
        ? "Agencies connected to your creators and campaigns."
        : "Managers connected to your creators and campaigns."
    })}
    <section class="panel">
      <div class="panel-heading">
        <label class="table-search"><span class="sr-only">Search ${escapeHtml(title)}</span>${icon("search")}<input data-field="${field}" value="${escapeHtml(search)}" placeholder="Search ${escapeHtml(title.toLowerCase())}" /></label>
      </div>
      ${page.error ? `<div class="system-message system-message--error">${escapeHtml(page.error)}</div>` : ""}
      <div class="action-list">${records.map((record) => `
        <button class="action-row" data-action="${action}" data-id="${escapeHtml(record.id)}">
          <span class="action-marker action-marker--green"></span>
          <span><strong>${escapeHtml(record.displayName)}</strong><small>${isAgency ? `${record.managerCount} manager${record.managerCount === 1 ? "" : "s"}` : escapeHtml(record.talentAgencyName || record.roleTitle || "Independent / agency not recorded")}</small></span>
          <span><strong>${escapeHtml(representationCountLabel(record))}</strong><small>${escapeHtml(record.status)}</small></span>
          <span class="row-arrow" aria-hidden="true">&#8594;</span>
        </button>`).join("")}</div>
      ${!records.length && !page.loading ? `<div class="empty-state"><strong>No ${escapeHtml(noun)} records are available.</strong><span>${search ? "Clear the search to see other records." : "Records will appear after they are linked to a creator."}</span></div>` : ""}
      ${page.loading ? `<div class="empty-state"><strong>Loading ${escapeHtml(title.toLowerCase())}…</strong></div>` : ""}
      <footer class="table-footer"><span>${records.length} loaded</span><span>${page.hasMore ? `<button class="text-button" data-action="${loadAction}" ${page.loading ? "disabled" : ""}>Load 50 more</button>` : ""}</span></footer>
    </section>`;
};

const renderRepresentationHistory = (history) => history.length
  ? `<div class="action-list">${history.map((item) => `
      <button class="action-row" data-action="open-creator" data-id="${escapeHtml(item.creatorId)}">
        <span class="action-marker action-marker--${item.status === "Active" ? "green" : "gold"}"></span>
        <span><strong>${escapeHtml(item.creatorName)}</strong><small>${escapeHtml(item.creatorHandle || "Social handle not recorded")}</small></span>
        <span><strong>${escapeHtml(item.status)}</strong><small>${item.startsOn ? formatDate(item.startsOn) : "Start not recorded"}${item.endsOn ? ` – ${formatDate(item.endsOn)}` : ""}</small></span>
        <span class="row-arrow" aria-hidden="true">&#8594;</span>
      </button>`).join("")}</div>`
  : `<div class="empty-state"><strong>No representation history is available.</strong></div>`;

const renderTalentAgency = () => {
  const record = state.talentAgencies.find((candidate) => candidate.id === state.selectedTalentAgencyId);
  if (!record) {
    return `${pageHeader({ eyebrow: "Representation directory", title: "Talent agency", description: "This record is loading or is not available in your assigned scope." })}<section class="panel"><div class="empty-state"><strong>${state.representationDetailLoading ? "Loading agency…" : "Agency unavailable."}</strong><span>${escapeHtml(state.representationDetailError || "Return to the directory to choose an available agency.")}</span></div></section>`;
  }
  return `
    <button class="back-link" data-action="navigate" data-view="talent-agencies">&#8592; All talent agencies</button>
    ${pageHeader({ eyebrow: "Talent agency", title: record.displayName, description: "" })}
    <section class="summary-strip" aria-label="Agency summary">
      <div><strong>${record.currentCreatorCount}</strong><span>Current creators</span></div>
      <div><strong>${record.formerCreatorCount}</strong><span>Former creators</span></div>
      <div><strong>${record.unconfirmedCreatorCount}</strong><span>Unconfirmed</span></div>
      <div><strong>${record.managerCount}</strong><span>Managers</span></div>
    </section>
    ${state.representationDetailError ? `<div class="system-message system-message--error">${escapeHtml(state.representationDetailError)}</div>` : ""}
    <section class="panel"><div class="panel-heading"><div><p class="eyebrow">Representation history</p><h2>Creators</h2></div>${badge(record.status, "neutral")}</div>${renderRepresentationHistory(record.creatorHistory)}</section>
    <section class="panel"><div class="panel-heading"><div><p class="eyebrow">Agency team</p><h2>Managers</h2></div></div>
      ${record.managerRoster.length ? `<div class="action-list">${record.managerRoster.map((manager) => `<button class="action-row" data-action="open-talent-manager" data-id="${escapeHtml(manager.id)}"><span class="action-marker action-marker--green"></span><span><strong>${escapeHtml(manager.displayName)}</strong><small>${escapeHtml(manager.roleTitle || "Role not recorded")}</small></span><span><strong>${escapeHtml(representationCountLabel(manager))}</strong><small>${escapeHtml(manager.status)}</small></span><span class="row-arrow">&#8594;</span></button>`).join("")}</div>` : `<div class="empty-state"><strong>No manager records are linked.</strong><span>The agency may still represent creators directly.</span></div>`}
    </section>`;
};

const renderTalentManager = () => {
  const record = state.talentManagers.find((candidate) => candidate.id === state.selectedTalentManagerId);
  if (!record) {
    return `${pageHeader({ eyebrow: "Representation directory", title: "Manager", description: "This record is loading or is not available in your assigned scope." })}<section class="panel"><div class="empty-state"><strong>${state.representationDetailLoading ? "Loading manager…" : "Manager unavailable."}</strong><span>${escapeHtml(state.representationDetailError || "Return to the directory to choose an available manager.")}</span></div></section>`;
  }
  return `
    <button class="back-link" data-action="navigate" data-view="talent-managers">&#8592; All managers</button>
    ${pageHeader({ eyebrow: "Creator manager", title: record.displayName, description: `${record.roleTitle || "Role not recorded"}${record.talentAgencyName ? ` · ${record.talentAgencyName}` : ""}` })}
    <section class="summary-strip" aria-label="Manager summary">
      <div><strong>${record.currentCreatorCount}</strong><span>Current creators</span></div>
      <div><strong>${record.formerCreatorCount}</strong><span>Former creators</span></div>
      <div><strong>${record.unconfirmedCreatorCount}</strong><span>Unconfirmed</span></div>
      <div><strong>${escapeHtml(record.status)}</strong><span>Record status</span></div>
    </section>
    <section class="panel"><div class="panel-heading"><div><p class="eyebrow">Representation history</p><h2>Creators</h2></div></div>${renderRepresentationHistory(record.creatorHistory)}</section>`;
};

const crmClientById = (clientId) => state.crm.clientViews[clientId]
  || state.crm.clients.find((client) => client.id === clientId);

const crmCampaignView = (campaignId) => state.crm.campaignViews[campaignId] || null;

const crmProposalById = (proposalId) => state.crm.proposalViews[proposalId]
  || state.crm.proposals.find((proposal) => proposal.id === proposalId);

const knownCrmValue = (value) => value?.availability === "known" && Number.isFinite(Number(value.value));

const formatCrmCurrency = (value, currency = "USD") => knownCrmValue(value)
  ? new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0
    }).format(Number(value.value))
  : "Not available";

const crmCampaignsForClient = (client) => {
  if (Array.isArray(client?.campaigns)) return client.campaigns.map((campaign) => ({
    ...campaign,
    clientId: campaign.clientId || client.id,
    ...(campaignById(campaign.id) || {}),
    commercial: crmCampaignView(campaign.id)?.commercial || campaign.commercial
  }));
  const ids = new Set(client?.campaignIds || []);
  return state.campaigns
    .filter((campaign) => campaign.clientId === client?.id
      || ids.has(campaign.id)
      || (!campaign.clientId && String(campaign.client || "").toLowerCase() === String(client?.name || "").toLowerCase()))
    .map((campaign) => ({
      ...campaign,
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      clientId: campaign.clientId || client?.id,
      commercial: crmCampaignView(campaign.id)?.commercial || campaign.commercial
    }));
};

const renderCrmLoadingBoundary = () => state.crm.loading
  ? `<div class="system-message">Loading the focused client CRM...</div>`
  : state.crm.error
    ? `<div class="system-message system-message--error">${escapeHtml(state.crm.error)}</div>`
    : "";

const renderClients = () => {
  const search = state.clientSearch.trim().toLowerCase();
  const clients = state.crm.clients.filter((client) => !search || [
    client.name,
    client.lifecycleStatus,
    client.relationshipOwner,
    ...(client.brands || []).map((brand) => brand.name)
  ].some((value) => String(value || "").toLowerCase().includes(search)));
  return `
    ${pageHeader({
      eyebrow: "Client relationships",
      title: "Clients",
      description: "",
      actions: `<button class="button button--secondary" data-action="open-crm-assistant">Ask BYOU IQ</button><button class="button button--primary" data-action="new-client">New client</button>`
    })}
    ${renderCrmLoadingBoundary()}
    <section class="summary-strip" aria-label="Client CRM summary">
      <div><strong>${state.crm.clients.length}</strong><span>Internal clients</span></div>
      <div><strong>${state.crm.contacts.length}</strong><span>Client contacts</span></div>
      <div><strong>${state.crm.attention.filter((item) => item.status === "open").length}</strong><span>Operational attention</span></div>
      <div><strong>${state.crm.proposals.length}</strong><span>Proposal records</span></div>
    </section>
    <section class="panel campaign-list-panel">
      <div class="campaign-toolbar">
        <div><p class="eyebrow">Client & contacts</p><h2>Relationship directory</h2></div>
        <label class="table-search"><span class="sr-only">Search clients</span>${icon("search")}<input data-field="client-search" value="${escapeHtml(state.clientSearch)}" placeholder="Search clients or brands" /></label>
      </div>
      <div class="data-table client-table" role="table" aria-label="Clients">
        <div class="table-row table-head" role="row"><span>Client</span><span>Brands</span><span>Lifecycle</span><span>Owner</span><span>Campaigns</span><span>Contacts</span><span>Next action</span><span></span></div>
        ${clients.map((client) => {
          const campaigns = crmCampaignsForClient(client);
          const contacts = client.contacts || state.crm.contacts.filter((contact) => contact.clientId === client.id);
          const attention = state.crm.attention.find((item) => campaigns.some((campaign) => campaign.id === item.campaignId) && item.status === "open");
          return `<button class="table-row table-button" role="row" data-action="open-client" data-id="${escapeHtml(client.id)}">
            <span><strong>${escapeHtml(client.name)}</strong><small>${escapeHtml(client.internalSummary || "Internal relationship record")}</small></span>
            <span><strong>${escapeHtml((client.brands || []).map((brand) => brand.name).join(", ") || "Not recorded")}</strong></span>
            <span>${badge(client.lifecycleStatus || "Active client")}</span>
            <span><strong>${escapeHtml(client.relationshipOwner || "Unassigned")}</strong></span>
            <span><strong>${campaigns.length}</strong><small>connected campaign${campaigns.length === 1 ? "" : "s"}</small></span>
            <span><strong>${contacts.length}</strong></span>
            <span><strong>${escapeHtml(attention?.nextAction || "No open client action")}</strong>${attention?.dueAt ? `<small>${formatDate(String(attention.dueAt).slice(0, 10))}</small>` : ""}</span>
            <span class="row-arrow">&#8594;</span>
          </button>`;
        }).join("") || `<div class="empty-state"><strong>No clients match this search.</strong><span>Clear the search or connect a campaign to its internal client record.</span></div>`}
      </div>
    </section>`;
};

const workflowState = (complete) => ({
  className: complete ? "is-complete" : "is-pending"
});

const renderWorkflowRail = (steps, { title = "Operational continuity guide", description = "Track each stage from client setup through reporting." } = {}) => `
  <section class="panel workflow-panel">
    <div class="panel-heading"><div><p class="eyebrow">Operational continuity</p><h2>${escapeHtml(title)}</h2><p>${escapeHtml(description)}</p></div></div>
    <div class="workflow-rail" aria-label="${escapeHtml(title)}">
      ${steps.map((step, index) => `<div class="workflow-step ${step.state.className}">
        <span class="workflow-step__index">${index + 1}</span>
        <div><strong>${escapeHtml(step.label)}</strong><small>${escapeHtml(step.detail)}</small></div>
        ${step.action || ""}
      </div>`).join("")}
    </div>
  </section>`;

const clientWorkflowFacts = (client, campaigns, contacts) => {
  const campaignIds = new Set(campaigns.map((campaign) => campaign.id));
  const assignments = campaigns.flatMap((campaign) => campaignById(campaign.id)?.assignments || campaign.assignments || []);
  const deliverableCount = assignments.reduce((total, assignment) => total + (
    assignment.deliverables?.length || (assignment.deliverable ? 1 : 0)
  ), 0);
  const roleCount = contacts.reduce((total, contact) => total + (contact.campaignRoles || [])
    .filter((role) => campaignIds.has(role.campaignId)).length, 0);
  const commercialCount = campaigns.filter((campaign) => knownCrmValue(
    (crmCampaignView(campaign.id)?.commercial || campaign.commercial)?.clientContractValue
  )).length;
  const attentionCount = state.crm.attention.filter((item) => campaignIds.has(item.campaignId) && item.status === "open").length;
  const reportCount = state.crm.reportVersions.filter((version) => campaignIds.has(version.campaignId) && !version.revokedAt).length;
  const proposalCount = state.crm.proposals.filter((proposal) => campaignIds.has(proposal.campaignId)).length;
  return { assignments, deliverableCount, roleCount, commercialCount, attentionCount, reportCount, proposalCount };
};

const renderClientWorkflow = (client, campaigns, contacts) => {
  const facts = clientWorkflowFacts(client, campaigns, contacts);
  const campaign = campaigns[0] || null;
  const contact = contacts[0] || null;
  const campaignAction = (tab, label) => campaign
    ? `<button class="text-button" data-action="open-campaign-step" data-id="${escapeHtml(campaign.id)}" data-tab="${escapeHtml(tab)}">${escapeHtml(label)}</button>`
    : "";
  return renderWorkflowRail([
    { label: "Client", detail: client.name, state: workflowState(true), action: `<button class="text-button" data-action="edit-client" data-id="${escapeHtml(client.id)}">Edit</button>` },
    { label: "Contact", detail: contacts.length ? `${contacts.length} relationship contact${contacts.length === 1 ? "" : "s"}` : "Add the first client contact", state: workflowState(contacts.length > 0), action: `<button class="text-button" data-action="new-client-contact" data-client="${escapeHtml(client.id)}">${contacts.length ? "Add another" : "Add contact"}</button>` },
    { label: "Campaign role", detail: facts.roleCount ? `${facts.roleCount} explicit role${facts.roleCount === 1 ? "" : "s"}` : "Assign a contact to a campaign", state: workflowState(facts.roleCount > 0), action: contact && campaign ? `<button class="text-button" data-action="assign-contact-role" data-client="${escapeHtml(client.id)}" data-contact="${escapeHtml(contact.id)}" data-campaign="${escapeHtml(campaign.id)}">Assign role</button>` : "" },
    { label: "Assignment", detail: facts.assignments.length ? `${facts.assignments.length} campaign assignment${facts.assignments.length === 1 ? "" : "s"}` : "Build the creator roster", state: workflowState(facts.assignments.length > 0), action: campaignAction("creators", "Open roster") },
    { label: "Deliverable", detail: facts.deliverableCount ? `${facts.deliverableCount} deliverable${facts.deliverableCount === 1 ? "" : "s"}` : "Define content requirements", state: workflowState(facts.deliverableCount > 0), action: campaignAction("deliverables", "Open deliverables") },
    { label: "Commercial", detail: facts.commercialCount ? `${facts.commercialCount} client value record${facts.commercialCount === 1 ? "" : "s"}` : "Record client terms", state: workflowState(facts.commercialCount > 0), action: campaign ? `<button class="text-button" data-action="edit-client-commercial" data-client="${escapeHtml(client.id)}" data-campaign="${escapeHtml(campaign.id)}">Record terms</button>` : "" },
    { label: "Attention", detail: facts.attentionCount ? `${facts.attentionCount} open next action${facts.attentionCount === 1 ? "" : "s"}` : "No open operational attention", state: workflowState(facts.attentionCount === 0), action: campaignAction("summary", "Review next actions") },
    { label: "Report", detail: facts.reportCount ? `${facts.reportCount} published version${facts.reportCount === 1 ? "" : "s"}` : "Prepare the live preview", state: workflowState(facts.reportCount > 0), action: campaignAction("reporting", "Open reporting") },
    { label: "Proposal", detail: facts.proposalCount ? `${facts.proposalCount} proposal record${facts.proposalCount === 1 ? "" : "s"}` : "Create from existing assignments", state: workflowState(facts.proposalCount > 0), action: campaign ? `<button class="text-button" data-action="new-proposal" data-campaign="${escapeHtml(campaign.id)}">Create proposal</button>` : "" }
  ]);
};

const renderClientOverview = (client, campaigns, contacts) => `
  <section class="summary-strip" aria-label="Client relationship summary">
    <div><strong>${campaigns.length}</strong><span>Connected campaigns</span></div>
    <div><strong>${contacts.length}</strong><span>Client contacts</span></div>
    <div><strong>${(client.brands || []).length}</strong><span>Brands</span></div>
    <div><strong>${state.crm.attention.filter((item) => campaigns.some((campaign) => campaign.id === item.campaignId) && item.status === "open").length}</strong><span>Open attention</span></div>
  </section>
  <div class="detail-grid">
    <section class="panel">
      <div class="panel-heading"><div><p class="eyebrow">Client & contacts</p><h2>Relationship overview</h2></div></div>
      <p class="large-note">${escapeHtml(client.internalSummary || client.description || "No internal relationship summary has been recorded.")}</p>
      <dl class="definition-list">
        <div><dt>Lifecycle</dt><dd>${escapeHtml(client.lifecycleStatus || "Not recorded")}</dd></div>
        <div><dt>Relationship owner</dt><dd>${escapeHtml(client.relationshipOwner || "Unassigned")}</dd></div>
        <div><dt>Brands</dt><dd>${escapeHtml((client.brands || []).map((brand) => brand.name).join(", ") || "Not recorded")}</dd></div>
      </dl>
    </section>
    <section class="panel">
      <div class="panel-heading"><div><p class="eyebrow">Operational continuity</p><h2>Primary working context</h2></div></div>
      <div class="action-list">
        ${campaigns.slice(0, 4).map((campaign) => `<button class="action-row" data-action="open-campaign" data-id="${escapeHtml(campaign.id)}"><span class="action-marker"></span><span><strong>${escapeHtml(campaign.name)}</strong><small>${escapeHtml(campaign.status || "Status unavailable")}</small></span><span><strong>${formatCrmCurrency(campaign.commercial?.clientContractValue, campaign.commercial?.currency)}</strong><small>Client contract value</small></span><span class="row-arrow">&#8594;</span></button>`).join("") || `<div class="empty-state"><strong>No campaign is connected.</strong><span>Connect the client at campaign setup before recording operational work.</span></div>`}
      </div>
    </section>
  </div>
  <section class="panel">
    <div class="panel-heading"><div><p class="eyebrow">Attention</p><h2>Next actions</h2></div></div>
    <div class="action-list">
      ${state.crm.attention.filter((item) => campaigns.some((campaign) => campaign.id === item.campaignId) && item.status === "open").map((item) => `<div class="action-row"><span class="action-marker"></span><span><strong>${escapeHtml(item.nextAction || "Next action is not set")}</strong><small>${escapeHtml(item.reason || "Operational attention")} · ${escapeHtml(item.owner || "Unassigned")}</small></span><span><strong>${item.dueAt ? formatDate(String(item.dueAt).slice(0, 10)) : "No due date"}</strong><small>${escapeHtml(item.severity || "normal")}</small></span><span class="page-actions"><button class="text-button" data-action="edit-attention" data-id="${escapeHtml(item.id)}">Update</button><button class="text-button" data-action="resolve-attention" data-id="${escapeHtml(item.id)}">Resolve</button></span></div>`).join("") || `<div class="empty-state"><strong>No open attention.</strong></div>`}
    </div>
  </section>`;

const renderClientContacts = (client, contacts, campaigns) => `
  <section class="panel">
    <div class="panel-heading"><div><p class="eyebrow">Client contacts</p><h2>Contacts</h2></div><button class="button button--primary" data-action="new-client-contact" data-client="${escapeHtml(client.id)}">Add contact</button></div>
    <div class="simple-table">
      <div class="simple-head"><span>Contact</span><span>Campaign roles</span><span>Preferred channel</span><span>Status</span></div>
      ${contacts.map((contact) => `<div><span><strong>${escapeHtml(contact.displayName || contact.name)}</strong><small>${escapeHtml(contact.title || "Title not recorded")}</small></span><span><strong>${escapeHtml((contact.campaignRoles || []).map((role) => `${campaigns.find((campaign) => campaign.id === role.campaignId)?.name || "Campaign"}: ${String(role.role).replaceAll("_", " ")}`).join("; ") || "No campaign role")}</strong></span><span><strong>${escapeHtml(contact.preferredChannel || "Not recorded")}</strong></span><span>${badge(contact.status || "Active")}<button class="text-button" data-action="assign-contact-role" data-contact="${escapeHtml(contact.id)}" data-client="${escapeHtml(client.id)}">Assign campaign role</button></span></div>`).join("") || `<div class="empty-state"><strong>No client contacts are recorded.</strong><span>Add a contact to get started.</span></div>`}
    </div>
  </section>`;

const renderClientCampaigns = (campaigns) => `
  <section class="panel">
    <div class="panel-heading"><div><p class="eyebrow">Client campaigns</p><h2>Campaigns</h2></div></div>
    <div class="action-list">${campaigns.map((campaign) => `<button class="action-row" data-action="open-campaign" data-id="${escapeHtml(campaign.id)}"><span class="action-marker"></span><span><strong>${escapeHtml(campaign.name)}</strong><small>${escapeHtml(campaign.status || "Status unavailable")}</small></span><span><strong>${formatCrmCurrency(campaign.commercial?.clientContractValue, campaign.commercial?.currency)}</strong><small>Client value</small></span><span class="row-arrow">&#8594;</span></button>`).join("") || `<div class="empty-state"><strong>No connected campaigns.</strong></div>`}</div>
  </section>`;

const renderClientCommercial = (client, campaigns) => `
  <section class="panel">
    <div class="panel-heading"><div><p class="eyebrow">Commercial</p><h2>Client commercial terms</h2></div></div>
    <div class="simple-table">
      <div class="simple-head"><span>Campaign</span><span>Client contract value</span><span>Creator obligations</span><span>Projected margin</span></div>
      ${campaigns.map((campaign) => `<div><span><strong>${escapeHtml(campaign.name)}</strong><small>${escapeHtml(campaign.status || "Status unavailable")}</small></span><span><strong>${formatCrmCurrency(campaign.commercial?.clientContractValue, campaign.commercial?.currency)}</strong></span><span><strong>${formatCrmCurrency(campaign.commercial?.creatorObligations, campaign.commercial?.currency)}</strong></span><span><strong>${formatCrmCurrency(campaign.commercial?.projectedMargin, campaign.commercial?.currency)}</strong><small>${campaign.commercial?.projectedMargin?.percent == null ? "Not available" : `${campaign.commercial.projectedMargin.percent}%`}</small><button class="text-button" data-action="edit-client-commercial" data-campaign="${escapeHtml(campaign.id)}" data-client="${escapeHtml(client.id)}">Record terms</button></span></div>`).join("") || `<div class="empty-state"><strong>No campaign commercial record exists.</strong></div>`}
    </div>
  </section>`;

const renderClientActivity = (client, campaigns) => {
  const campaignIds = new Set(campaigns.map((campaign) => campaign.id));
  const activity = (client.activity || state.crm.activity.filter((item) => item.clientId === client.id || campaignIds.has(item.campaignId)))
    .slice()
    .sort((left, right) => String(right.occurredAt || "").localeCompare(String(left.occurredAt || "")));
  return `<section class="panel"><div class="panel-heading"><div><p class="eyebrow">History</p><h2>Activity</h2></div></div><div class="activity-list">${activity.map((item) => `<article class="communication-item"><span class="timeline-marker" aria-hidden="true"></span><div><strong>${escapeHtml(item["summary"] || item.type)}</strong><p>${escapeHtml(String(item.type || "Activity").replaceAll(".", " "))}</p><small>${escapeHtml(item.actorId || "BYOU staff")} · ${item.occurredAt ? formatDate(String(item.occurredAt).slice(0, 10)) : "Date unavailable"}</small></div></article>`).join("") || `<div class="empty-state"><strong>No activity has been recorded.</strong></div>`}</div></section>`;
};

const renderClient = () => {
  const client = crmClientById(state.selectedClientId);
  if (!client) return `${pageHeader({ eyebrow: "Client relationships", title: "Client record unavailable", description: "" })}<section class="panel"><div class="empty-state"><strong>The selected client record could not be opened.</strong><span>Return to the client directory and choose an available record.</span><button class="button button--primary" data-action="navigate" data-view="clients">All clients</button></div></section>`;
  const campaigns = crmCampaignsForClient(client);
  const contacts = client.contacts || state.crm.contacts.filter((contact) => contact.clientId === client.id);
  const detailLoading = state.crm.clientDetailLoadingId === client.id;
  const detailError = state.crm.clientDetailErrors[client.id];
  const tabs = [
    ["overview", "Overview"],
    ["contacts", "Contacts"],
    ["campaigns", "Campaigns"],
    ["commercial", "Commercial"],
    ["activity", "Activity"]
  ];
  const content = state.clientTab === "contacts" ? renderClientContacts(client, contacts, campaigns)
    : state.clientTab === "campaigns" ? renderClientCampaigns(campaigns)
      : state.clientTab === "commercial" ? renderClientCommercial(client, campaigns)
        : state.clientTab === "activity" ? renderClientActivity(client, campaigns)
          : renderClientOverview(client, campaigns, contacts);
  return `
    <button class="back-link" data-action="navigate" data-view="clients">&#8592; All clients</button>
    <section class="campaign-hero"><div><div class="hero-badges">${badge(client.lifecycleStatus || "Active client")}</div><h1>${escapeHtml(client.name)}</h1><p>${escapeHtml((client.brands || []).map((brand) => brand.name).join(", ") || "No brands recorded")} · Owned by ${escapeHtml(client.relationshipOwner || "Unassigned")}</p></div><div class="page-actions"><button class="button button--secondary" data-action="new-client-contact" data-client="${escapeHtml(client.id)}">Add contact</button><button class="button button--primary" data-action="open-crm-assistant" data-client="${escapeHtml(client.id)}">Ask BYOU IQ</button></div></section>
    ${detailLoading ? `<div class="system-message">Loading relationship details for ${escapeHtml(client.name)}...</div>` : ""}
    ${detailError ? `<div class="system-message system-message--error"><strong>The selected client record could not be opened in full.</strong> ${escapeHtml(detailError)} <button class="text-button" data-action="retry-client-detail" data-id="${escapeHtml(client.id)}">Retry</button></div>` : ""}
    <div class="page-actions"><button class="text-button" data-action="edit-client" data-id="${escapeHtml(client.id)}">Edit client</button></div>
    ${renderClientWorkflow(client, campaigns, contacts)}
    <nav class="tabs" aria-label="Client workspace sections">${tabs.map(([id, label]) => `<button class="${state.clientTab === id ? "is-active" : ""}" data-action="client-tab" data-tab="${id}">${label}</button>`).join("")}</nav>
    ${content}`;
};

const renderProposals = () => {
  const search = state.proposalSearch.trim().toLowerCase();
  const proposals = state.crm.proposals.filter((proposal) => {
    const campaign = campaignById(proposal.campaignId);
    return !search || [proposal.title, proposal.status, campaign?.name, campaign?.client]
      .some((value) => String(value || "").toLowerCase().includes(search));
  });
  return `
    ${pageHeader({ eyebrow: "Client proposals", title: "Proposals", description: "Build talent and pricing scenarios from existing campaign assignments.", actions: `<button class="button button--primary" data-action="open-proposal-campaign" data-campaign="${escapeHtml(state.selectedCampaignId || state.campaigns[0]?.id || "")}">Open a campaign to continue</button>` })}
    ${renderCrmLoadingBoundary()}
    <section class="panel campaign-list-panel">
      <div class="campaign-toolbar"><div><p class="eyebrow">Proposals</p><h2>Proposal records</h2></div><label class="table-search"><span class="sr-only">Search proposals</span>${icon("search")}<input data-field="proposal-search" value="${escapeHtml(state.proposalSearch)}" placeholder="Search proposals" /></label></div>
      <div class="data-table campaign-table" role="table" aria-label="Proposals"><div class="table-row table-head" role="row"><span>Proposal</span><span>Campaign</span><span>Status</span><span>Creators</span><span>Proposed value</span><span>Versions</span><span>Updated</span><span></span><span></span></div>${proposals.map((proposal) => { const campaign = campaignById(proposal.campaignId); return `<button class="table-row table-button" role="row" data-action="open-proposal" data-id="${escapeHtml(proposal.id)}"><span><strong>${escapeHtml(proposal.title || "Untitled proposal")}</strong><small>${escapeHtml(proposal.id)}</small></span><span><strong>${escapeHtml(campaign?.name || "Campaign unavailable")}</strong><small>${escapeHtml(campaign?.client || "Client unavailable")}</small></span><span>${badge(proposal.status || "Draft")}</span><span><strong>${proposal.assignmentIds?.length || 0}</strong><small>selected assignments</small></span><span><strong>${Number.isFinite(Number(proposal.proposedClientValue)) ? formatCurrency(Number(proposal.proposedClientValue)) : "Not available"}</strong></span><span><strong>${proposal.versions?.length || 0}</strong><small>published version${proposal.versions?.length === 1 ? "" : "s"}</small></span><span><strong>${proposal.updatedAt ? formatDate(String(proposal.updatedAt).slice(0, 10)) : "Not recorded"}</strong></span><span></span><span class="row-arrow">&#8594;</span></button>`; }).join("") || `<div class="empty-state"><strong>No proposal records match this search.</strong><span>Open a campaign to create one.</span><button class="button button--primary" data-action="open-proposal-campaign" data-campaign="${escapeHtml(state.selectedCampaignId || state.campaigns[0]?.id || "")}">Open a campaign to continue</button></div>`}</div>
    </section>`;
};

const renderProposal = () => {
  const proposal = crmProposalById(state.selectedProposalId) || state.crm.proposals[0];
  if (!proposal) return `${pageHeader({ eyebrow: "Client proposals", title: "Proposal", description: "" })}<section class="panel"><div class="empty-state"><strong>No proposal selected.</strong><span>Create a proposal from an existing campaign and selected assignments.</span></div></section>`;
  const campaign = campaignById(proposal.campaignId);
  const selected = (proposal.assignmentIds || []).map((id) => campaign?.assignments?.find((assignment) => assignment.id === id)).filter(Boolean);
  const versions = proposal.versions || [];
  const activeVersion = versions.slice().reverse().find((version) =>
    !version.revokedAt && (!version.expiresAt || Date.parse(version.expiresAt) > Date.now())
  );
  const outcomeAlreadyRecorded = Boolean(
    activeVersion && (proposal.outcomeVersionId || proposal.outcome_version_id) === activeVersion.id
  );
  const outcomeDisabled = !activeVersion || outcomeAlreadyRecorded || ["accepted", "declined"].includes(String(proposal.outcome || "").toLowerCase());
  const outcomeDisabledReason = !activeVersion
    ? "Publish a version before recording a client outcome"
    : outcomeAlreadyRecorded
      ? "This version already has a recorded outcome"
      : "This proposal already has a terminal outcome";
  const outcomeAttributes = `data-version="${escapeHtml(activeVersion?.id || "")}" ${outcomeDisabled ? `disabled title="${outcomeDisabledReason}"` : ""}`;
  const proposalPublishingEnabled = state.crm.capabilities.proposalPublishing === true;
  const proposalStatus = String(proposal.status || "").toLowerCase();
  const proposalEditable = ["draft", "needs_changes"].includes(proposalStatus)
    || (proposalStatus === "published" && !proposal.outcome && !activeVersion);
  const proposalPublishable = proposalPublishingEnabled && proposalStatus === "draft" && !proposal.outcome;
  const proposalPublishReason = !proposalPublishingEnabled
    ? "Proposal publishing is not available yet"
    : "Record needs changes on the active version, then revise the draft before republishing";
  return `
    <button class="back-link" data-action="navigate" data-view="proposals">&#8592; All proposals</button>
    <section class="campaign-hero"><div><div class="hero-badges">${badge(proposal.status || "Draft")}<span>Internal working record</span></div><h1>${escapeHtml(proposal.title || "Untitled proposal")}</h1><p>${escapeHtml(campaign?.name || "Campaign unavailable")} · ${versions.length} published version${versions.length === 1 ? "" : "s"}</p></div><div class="page-actions"><button class="button button--secondary" data-action="edit-proposal" data-id="${escapeHtml(proposal.id)}" ${proposalEditable ? "" : "disabled title=\"Record needs changes on the active version before revising this draft\""}>Edit draft</button><button class="button button--primary" data-action="publish-proposal" data-id="${escapeHtml(proposal.id)}" ${proposalPublishable ? "" : `disabled title="${proposalPublishReason}"`}>Publish version</button></div></section>
    <div class="detail-grid">
      <section class="panel"><div class="panel-heading"><div><p class="eyebrow">Selected campaign assignments</p><h2>Talent scenario</h2></div></div><div class="action-list">${selected.map((assignment) => { const creator = creatorById(assignment.creatorId); return `<button class="action-row" data-action="open-creator" data-id="${escapeHtml(assignment.creatorId)}"><span class="action-marker"></span><span><strong>${escapeHtml(creatorDisplayName(creator))}</strong><small>${escapeHtml(assignment.status || "Assignment")}</small></span><span><strong>${formatCurrency(assignment.rate)}</strong><small>Assignment rate</small></span><span class="row-arrow">&#8594;</span></button>`; }).join("") || `<div class="empty-state"><strong>No assignments selected.</strong><span>Edit the draft before publishing.</span></div>`}</div></section>
      <section class="panel"><div class="panel-heading"><div><p class="eyebrow">Proposed value</p><h2>${Number.isFinite(Number(proposal.proposedClientValue)) ? formatCurrency(Number(proposal.proposedClientValue)) : "Not available"}</h2></div></div><div class="page-actions"><button class="button button--secondary button--small" data-action="proposal-outcome" data-id="${escapeHtml(proposal.id)}" data-outcome="needs_changes" ${outcomeAttributes}>Needs changes</button><button class="button button--secondary button--small" data-action="proposal-outcome" data-id="${escapeHtml(proposal.id)}" data-outcome="declined" ${outcomeAttributes}>Declined</button><button class="button button--primary button--small" data-action="proposal-outcome" data-id="${escapeHtml(proposal.id)}" data-outcome="accepted" ${outcomeAttributes}>Record accepted</button></div></section>
    </div>
    <section class="panel"><div class="panel-heading"><div><p class="eyebrow">Published versions</p><h2>Proposal history</h2></div></div><div class="published-version-list">${versions.slice().reverse().map((version) => `<div><span><strong>${escapeHtml(version.id)}</strong><small>Published ${version.publishedAt ? formatDate(String(version.publishedAt).slice(0, 10)) : "date unavailable"} · expires ${version.expiresAt ? formatDate(String(version.expiresAt).slice(0, 10)) : "not set"}</small></span>${version.revokedAt ? badge("Revoked", "warn") : `<button class="text-button" data-action="revoke-crm-artifact" data-artifact="proposal" data-version="${escapeHtml(version.id)}">Revoke</button>`}</div>`).join("") || `<p class="empty-copy">No proposal version has been published.</p>`}</div></section>`;
};

const crmClientForCampaign = (campaign, view = crmCampaignView(campaign.id)) => {
  const clientId = view?.clientId || campaign.clientId;
  if (clientId) return crmClientById(clientId);
  const campaignClientName = String(campaign.client || "").trim().toLowerCase();
  if (!campaignClientName) return null;
  return state.crm.clients.find((item) => String(item.name || "").trim().toLowerCase() === campaignClientName) || null;
};

const campaignWorkflowFacts = (campaign) => {
  const view = crmCampaignView(campaign.id);
  const client = crmClientForCampaign(campaign, view);
  const contacts = view?.contacts?.length
    ? view.contacts
    : state.crm.contacts.filter((contact) => contact.clientId === client?.id
      && (contact.campaignRoles || []).some((role) => role.campaignId === campaign.id));
  const assignments = campaign.assignments || [];
  const deliverableCount = assignments.reduce((total, assignment) => total + (
    assignment.deliverables?.length || (assignment.deliverable ? 1 : 0)
  ), 0);
  const commercial = view?.commercial || campaign.commercial;
  const attention = view?.attention || state.crm.attention.filter((item) => item.campaignId === campaign.id);
  const reportVersions = view?.reportVersions || state.crm.reportVersions.filter((version) => version.campaignId === campaign.id);
  const proposals = view?.proposals || state.crm.proposals.filter((proposal) => proposal.campaignId === campaign.id);
  return { view, client, contacts, assignments, deliverableCount, commercial, attention, reportVersions, proposals };
};

const renderCampaignWorkflow = (campaign) => {
  const facts = campaignWorkflowFacts(campaign);
  const clientAction = facts.client
    ? `<button class="text-button" data-action="open-client" data-id="${escapeHtml(facts.client.id)}">Open client</button>`
    : "";
  const roleCount = facts.contacts.reduce((total, contact) => total + (contact.campaignRoles || [])
    .filter((role) => role.campaignId === campaign.id).length, 0);
  const activeReports = facts.reportVersions.filter((version) => !version.revokedAt).length;
  return renderWorkflowRail([
    { label: "Client", detail: facts.client?.name || "Connect a client", state: workflowState(Boolean(facts.client)), action: clientAction },
    { label: "Contact", detail: facts.contacts.length ? `${facts.contacts.length} campaign contact${facts.contacts.length === 1 ? "" : "s"}` : "Add a relationship contact", state: workflowState(facts.contacts.length > 0), action: facts.client ? `<button class="text-button" data-action="new-client-contact" data-client="${escapeHtml(facts.client.id)}">Add contact</button>` : "" },
    { label: "Campaign role", detail: roleCount ? `${roleCount} explicit role${roleCount === 1 ? "" : "s"}` : "Assign approver or operating role", state: workflowState(roleCount > 0), action: facts.client ? `<button class="text-button" data-action="assign-contact-role" data-client="${escapeHtml(facts.client.id)}" data-contact="${escapeHtml(facts.contacts[0]?.id || "")}" data-campaign="${escapeHtml(campaign.id)}">Assign role</button>` : "" },
    { label: "Assignment", detail: facts.assignments.length ? `${facts.assignments.length} creator assignment${facts.assignments.length === 1 ? "" : "s"}` : "Build the creator roster", state: workflowState(facts.assignments.length > 0), action: `<button class="text-button" data-action="campaign-tab" data-tab="creators">Open roster</button>` },
    { label: "Deliverable", detail: facts.deliverableCount ? `${facts.deliverableCount} tracked deliverable${facts.deliverableCount === 1 ? "" : "s"}` : "Define content requirements", state: workflowState(facts.deliverableCount > 0), action: `<button class="text-button" data-action="campaign-tab" data-tab="deliverables">Open deliverables</button>` },
    { label: "Commercial", detail: knownCrmValue(facts.commercial?.clientContractValue) ? "Client value recorded" : "Client value not recorded", state: workflowState(knownCrmValue(facts.commercial?.clientContractValue)), action: facts.client ? `<button class="text-button" data-action="edit-client-commercial" data-client="${escapeHtml(facts.client.id)}" data-campaign="${escapeHtml(campaign.id)}">Record terms</button>` : "" },
    { label: "Attention", detail: facts.attention.filter((item) => item.status === "open").length ? `${facts.attention.filter((item) => item.status === "open").length} open next action${facts.attention.filter((item) => item.status === "open").length === 1 ? "" : "s"}` : "No open operational attention", state: workflowState(!facts.attention.some((item) => item.status === "open")), action: `<button class="text-button" data-action="open-crm-assistant" data-campaign="${escapeHtml(campaign.id)}">Review actions</button>` },
    { label: "Report", detail: activeReports ? `${activeReports} published version${activeReports === 1 ? "" : "s"}` : "Open the live preview", state: workflowState(activeReports > 0), action: `<button class="text-button" data-action="campaign-tab" data-tab="reporting">Open reporting</button>` },
    { label: "Proposal", detail: facts.proposals.length ? `${facts.proposals.length} proposal record${facts.proposals.length === 1 ? "" : "s"}` : "Create from existing assignments", state: workflowState(facts.proposals.length > 0), action: `<button class="text-button" data-action="new-proposal" data-campaign="${escapeHtml(campaign.id)}">Create proposal</button>` }
  ], { title: "Campaign operational guide", description: "Track this campaign from client setup through reporting." });
};

const renderCampaignCommercialSummary = (campaign) => {
  const facts = campaignWorkflowFacts(campaign);
  const commercial = facts.commercial || {};
  const clientValue = commercial.clientContractValue;
  const creatorObligations = commercial.creatorObligations;
  const projectedMargin = commercial.projectedMargin;
  const clientId = facts.client?.id || facts.view?.clientId || campaign.clientId || "";
  return `<section class="panel">
    <div class="panel-heading"><div><p class="eyebrow">Commercial</p><h2>Client value and campaign margin</h2></div>${clientId ? `<button class="button button--secondary button--small" data-action="edit-client-commercial" data-client="${escapeHtml(clientId)}" data-campaign="${escapeHtml(campaign.id)}">Record terms</button>` : ""}</div>
    <section class="summary-strip" aria-label="Campaign commercial summary">
      <div><strong>${formatCrmCurrency(clientValue, commercial.currency)}</strong><span>Client contract value</span></div>
      <div><strong>${formatCrmCurrency(creatorObligations, commercial.currency)}</strong><span>Creator obligations</span></div>
      <div><strong>${formatCrmCurrency(projectedMargin, commercial.currency)}</strong><span>Projected margin${projectedMargin?.percent == null ? "" : ` · ${projectedMargin.percent}%`}</span></div>
      <div><strong>${escapeHtml(commercial.externalAccountingReference || "Not recorded")}</strong><span>Accounting reference</span></div>
    </section>
  </section>`;
};

const renderCampaignClientContext = (campaign) => {
  const view = crmCampaignView(campaign.id);
  const client = crmClientForCampaign(campaign, view);
  const contacts = view?.contacts?.length
    ? view.contacts
    : state.crm.contacts.filter((contact) => contact.clientId === client?.id
      && (contact.campaignRoles || []).some((role) => role.campaignId === campaign.id));
  const detailError = state.crm.campaignDetailErrors[campaign.id];
  if (!client && !view) return `<section class="panel"><div class="panel-heading"><div><p class="eyebrow">Client & contacts</p><h2>Relationship context</h2></div></div><div class="empty-state"><strong>${state.crm.loading ? "Loading client context..." : "Client context is not available."}</strong>${detailError ? `<span>${escapeHtml(detailError)}</span>` : ""}</div></section>`;
  return `<section class="panel"><div class="panel-heading"><div><p class="eyebrow">Client & contacts</p><h2>Relationship context</h2></div>${client ? `<button class="button button--secondary button--small" data-action="open-client" data-id="${escapeHtml(client.id)}">Open client</button>` : ""}</div>${detailError ? `<div class="system-message system-message--error">Relationship details are temporarily unavailable. Try again.</div>` : ""}<div class="simple-table"><div class="simple-head"><span>Client</span><span>Contact</span><span>Campaign role</span><span>Next action</span></div>${contacts.length ? contacts.map((contact) => `<div><span><strong>${escapeHtml(client?.name || campaign.client)}</strong><small>${escapeHtml(campaign.brand)}</small></span><span><strong>${escapeHtml(contact.displayName || contact.name)}</strong><small>${escapeHtml(contact.title || "Title not recorded")}</small></span><span><strong>${escapeHtml((contact.campaignRoles || []).filter((role) => role.campaignId === campaign.id).map((role) => String(role.role).replaceAll("_", " ")).join(", ") || "Client contact")}</strong></span><span><strong>${escapeHtml(view?.attention?.find((item) => item.status === "open")?.nextAction || "No open relationship action")}</strong></span></div>`).join("") : `<div><span><strong>${escapeHtml(client?.name || campaign.client)}</strong><small>${escapeHtml(campaign.brand)}</small></span><span>Not assigned</span><span>Not assigned</span><span><button class="text-button" data-action="assign-contact-role" data-client="${escapeHtml(client?.id || "")}" data-campaign="${escapeHtml(campaign.id)}">Link contact</button></span></div>`}</div></section>`;
};

const formatObservedMetric = (value) => value == null ? "Unavailable" : formatCompact(Number(value));
const formatVideoTrackingDate = value => displayDate(value,undefined,'Not captured');
const formatViewChange = (value) => {
  if (value == null || !Number.isFinite(Number(value))) return "Needs history";
  const number = Number(value);
  if (number === 0) return "No change";
  return `${number > 0 ? "+" : ""}${formatCompact(number)}`;
};
const formatVideoTrackingLabel = (value) => {
  const text = String(value || "").replaceAll("_", " ").trim();
  const known = {
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    socialcrawl: "SocialCrawl",
    "trackify csv": "Trackify CSV"
  };
  return known[text.toLowerCase()] || (text ? `${text[0].toUpperCase()}${text.slice(1)}` : "Unavailable");
};
const videoTrackingState = (video) => {
  const trackingState = String(video.trackingState || "not_tracked").toLowerCase();
  if (trackingState === "error") return { label: "Refresh error", tone: "error" };
  if (trackingState === "stale") return { label: "Stale", tone: "warn" };
  if (trackingState === "pending") return { label: "Waiting for refresh", tone: "pending" };
  if (trackingState === "paused") return { label: "Tracking paused", tone: "neutral" };
  if (trackingState === "fresh") return { label: "Current", tone: "good" };
  if (trackingState === "history") return { label: "Saved history", tone: "neutral" };
  return { label: "Not tracking", tone: "neutral" };
};
const videoMetricCell = (label, value) => `
  <span><small>${escapeHtml(label)}</small><strong>${escapeHtml(formatObservedMetric(value))}</strong></span>`;

const renderVideoTracking = () => {
  if (state.videoLibrary === "trackify") return renderTrackifyLibrary({ workspace: state.videoTracking, query: state.videoSearch, platform: state.videoPlatform });
  const workspace = state.videoTracking;
  const summary = workspace.summary || {};
  const campaigns = workspace.campaignOptions || [];
  const platformOptions = ["all", "instagram", "tiktok", "youtube", "facebook", "x", "snapchat"];
  const platformLabel = (platform) => platform === "all"
    ? "All platforms"
    : platform === "x" ? "X" : formatVideoTrackingLabel(platform);
  const connectionAllowed = isLiveMode() && (state.currentUser.roles || []).some((role) =>
    ["admin", "reviewer"].includes(String(role).toLowerCase())
  );
  const actions = isLiveMode()
    ? `${connectionAllowed ? `<button class="button button--primary" data-action="open-video-connector">Connect videos</button>` : ""}<button class="button button--secondary" data-action="reload-video-tracking" ${workspace.loading ? "disabled" : ""}>${workspace.loading ? "Loading..." : "Refresh view"}</button>`
    : "";
  const activation = workspace.activation || { loading: false, result: null, error: null };
  const activationAllowed = isLiveMode() && (state.currentUser.roles || []).some((role) =>
    ["admin", "reviewer"].includes(String(role).toLowerCase())
  );
  const activationResult = activation.result
    ? activation.result.completed
      ? `${Number(activation.result.eligiblePosts || 0).toLocaleString()} exact posts eligible; ${Number(activation.result.queuedPosts || 0).toLocaleString()} queued.`
      : activation.result.phase === "initializing"
        ? `${Number(activation.result.remainingImportRows || 0).toLocaleString()} Trackify source rows remain to be checked for exact creator evidence.`
        : `${Number(activation.result.queuedPosts || 0).toLocaleString()} exact posts queued; ${Number(activation.result.remainingPosts || 0).toLocaleString()} remaining.`
    : activation.error || "Enter the 64-character fingerprint from a finalized Trackify import. Only exact active-creator matches will be verified and queued once.";
  const activationPanel = activationAllowed ? `
    <section class="system-message" aria-label="Trackify import activation">
      <strong>Activate a finalized Trackify import</strong>
      <span>${escapeHtml(activationResult)}</span>
      <label><span class="sr-only">Trackify file fingerprint</span><input data-field="trackify-activation-sha" value="${escapeHtml(workspace.activationSha || "")}" maxlength="64" autocomplete="off" spellcheck="false" placeholder="64-character import fingerprint" /></label>
      <button class="button button--primary button--small" data-action="activate-trackify-import" ${activation.loading ? "disabled" : ""}>${activation.loading ? "Activating exact matches..." : "Verify exact matches & queue refreshes"}</button>
    </section>` : "";

  const content = !isLiveMode()
    ? `<div class="empty-state"><strong>Video metrics are available in the signed-in workspace.</strong><span>This local baseline contains no copied creator or campaign records.</span></div>`
    : workspace.loading && !workspace.loaded
      ? `<div class="empty-state"><strong>Loading Video Tracking...</strong><span>Reading exact posts and the latest observed metric for each field.</span></div>`
      : workspace.error
        ? `<div class="system-message system-message--error"><strong>Video Tracking could not load.</strong><span>${escapeHtml(workspace.error)}</span><button class="button button--secondary button--small" data-action="retry-video-tracking">Try again</button></div>`
        : workspace.items.length
          ? `<div class="video-tracking-grid">${workspace.items.map((video) => {
              const metrics = video.metrics || {};
              const status = videoTrackingState(video);
              const refreshQueued = video.refreshActive || workspace.refreshingPostIds.has(video.postId);
              const refreshDisabled = !video.canRefresh || refreshQueued;
              const reviewing = workspace.reviewingPostIds.has(video.postId);
              const confirming = workspace.confirmingPostId === video.postId;
              const actionMessage = workspace.actionMessageByPostId.get(video.postId) || "";
              const verified = String(video.verificationStatus || "").toLowerCase() === "verified";
              const canReviewExactPost = Boolean(video.attributionId) && !verified;
              const creatorHandle = video.creatorHandle
                ? `@${String(video.creatorHandle).replace(/^@/, "")}`
                : "Handle unavailable";
              const source = String(video.sourceProvider || "saved_history").replaceAll("_", " ");
              const engagementCopy = video.engagementRate == null
                ? "Unavailable"
                : `${Number(video.engagementRate).toFixed(2)}%${video.engagementRateIsPartial ? " · partial fields" : ""}`;
              const refreshTitle = video.canRefresh
                ? "Queue a SocialCrawl refresh for this exact post"
                : "Reviewer verification and an eligible exact-post link are required";
              const videoActions = verified
                ? `<button class="button button--secondary button--small" data-action="queue-video-refresh" data-post="${escapeHtml(video.postId)}" data-attribution="${escapeHtml(video.attributionId || "")}" ${refreshDisabled ? "disabled" : ""} title="${escapeHtml(refreshTitle)}">${refreshQueued ? "Refresh queued" : "Queue refresh"}</button>`
                : `<button class="button button--primary button--small" data-action="verify-and-queue-video" data-post="${escapeHtml(video.postId)}" data-attribution="${escapeHtml(video.attributionId || "")}" ${!canReviewExactPost || reviewing ? "disabled" : ""} title="${confirming ? "Confirm the exact creator, platform, and campaign attribution" : "Open the video, confirm the exact creator post, then queue its first live refresh"}">${reviewing ? "Saving review..." : confirming ? "Confirm & queue" : "Verify & queue"}</button>`;
              return `<article class="video-tracking-card">
                <div class="video-card-top">
                  <div><span class="video-platform">${escapeHtml(platformLabel(video.platform))}</span><h2>${escapeHtml(video.creatorName || creatorHandle)}</h2><p>${escapeHtml(creatorHandle)} · ${escapeHtml(video.brandName || "Brand not linked")}</p></div>
                  <span class="video-state video-state--${escapeHtml(status.tone)}">${escapeHtml(status.label)}</span>
                </div>
                <div class="video-meta">
                  <span><small>Campaign</small><strong>${escapeHtml(video.campaignName || "Not linked")}</strong></span>
                  <span><small>Published</small><strong>${escapeHtml(formatVideoTrackingDate(video.publishedAt))}</strong></span>
                  <a href="${escapeHtml(video.canonicalUrl)}" target="_blank" rel="noreferrer">Open video &#8599;</a>
                </div>
                <div class="video-metric-strip" aria-label="Latest observed metrics">
                  ${videoMetricCell("Views", metrics.views)}
                  ${videoMetricCell("Likes", metrics.likes)}
                  ${videoMetricCell("Comments", metrics.comments)}
                  ${videoMetricCell("Shares", metrics.shares)}
                  ${videoMetricCell("Saves", metrics.saves)}
                </div>
                <div class="video-performance-row">
                  <span><small>Engagement rate</small><strong>${escapeHtml(engagementCopy)}</strong></span>
                  <span><small>1-day views</small><strong>${escapeHtml(formatViewChange(video.oneDayViewsChange))}</strong></span>
                  <span><small>7-day views</small><strong>${escapeHtml(formatViewChange(video.sevenDayViewsChange))}</strong></span>
                </div>
                <div class="video-status-row">
                  <span><small>Latest observation</small><strong>${escapeHtml(formatVideoTrackingDate(video.latestObservedAt))}</strong></span>
                  <span><small>Source</small><strong>${escapeHtml(formatVideoTrackingLabel(source))}</strong></span>
                  <span><small>Exact post</small><strong>${escapeHtml(formatVideoTrackingLabel(video.verificationStatus || "unverified"))}</strong></span>
                  <div class="video-card-actions">${videoActions}</div>
                </div>
                ${actionMessage ? `<p class="system-message" role="status">${escapeHtml(actionMessage)}</p>` : ""}
              </article>`;
            }).join("")}</div>`
          : `<div class="empty-state"><strong>No videos match these filters.</strong><span>Verified exact posts and imported Trackify history will appear here when they exist in BYOUIQ.</span></div>`;

  return `
    ${pageHeader({
      eyebrow: "Creator video intelligence",
      title: "Video Tracking",
      description: "View each creator video with its latest observed metrics, source, and refresh status.",
      actions
    })}
    <section class="video-summary-grid" aria-label="Video Tracking summary">
      <article><span>Videos in view</span><strong>${Number(summary.trackedVideos || 0).toLocaleString()}</strong><small>${Number(summary.creators || 0).toLocaleString()} creators</small></article>
      <article><span>Observed views</span><strong>${escapeHtml(formatObservedMetric(summary.totalViews))}</strong><small>Latest observed value per video</small></article>
      <article><span>Observed engagement</span><strong>${escapeHtml(formatObservedMetric(summary.totalEngagement))}</strong><small>Available likes, comments, shares, and saves</small></article>
      <article><span>Needs attention</span><strong>${Number(summary.needsAttention || 0).toLocaleString()}</strong><small>Stale, missing, errored, or unverified</small></article>
    </section>
    ${activationPanel}
    <section class="panel video-tracking-panel">
      <div class="video-tracking-toolbar"><label>Library<select data-field="video-library"><option value="trackify">Imported Trackify library</option><option value="crm" selected>CRM connected posts</option></select></label>
        <label class="table-search"><span class="sr-only">Search videos</span>${icon("search")}<input data-field="video-search" value="${escapeHtml(state.videoSearch)}" placeholder="Search creator, campaign, or video URL" /></label>
        <label><span>Platform</span><select data-field="video-platform">${platformOptions.map((platform) => `<option value="${platform}" ${state.videoPlatform === platform ? "selected" : ""}>${escapeHtml(platformLabel(platform))}</option>`).join("")}</select></label>
        <label><span>Campaign</span><select data-field="video-campaign"><option value="all">All campaigns</option>${campaigns.map((campaign) => `<option value="${escapeHtml(campaign.campaignId)}" ${state.videoCampaignId === campaign.campaignId ? "selected" : ""}>${escapeHtml(campaign.campaignName || "Unnamed campaign")}</option>`).join("")}</select></label>
      </div>
      <p class="video-baseline-note">First snapshot is a baseline. A change appears only when an earlier observed snapshot exists; unavailable provider fields stay unavailable rather than becoming zero.</p>
      ${content}
    </section>`;
};

const renderMain = () => {
  if (state.view === "settings" || state.view === "automations") return renderProfileSettings({
    name: state.currentUser.name, locale: interfaceLocale, tab: state.view === "automations" ? "automations" : settingsTab,
    automation: (state.view === "automations" || settingsTab === "automations") ? campaignOps.render("automations") : "",
    busy: profileSaving, error: profileError, notice: profileNotice, live: isLiveMode()
  });
  if (state.view === "creators") return renderCreators();
  if (state.view === "creator") return renderCreator();
  if (["campaigns", "finances", "shipments", "automations"].includes(state.view)) return campaignOps.render(state.view);
  if (state.view === "campaign") {
    if(isCostcoOverviewCampaignId(state.selectedCampaignId))return renderCampaign();
    return campaignOps.render('campaign',state.selectedCampaignId);
  }
  return campaignOps.render('campaigns');
};

const renderSystemScreen = () => {
  const signedOut = state.runtime.phase === "signed-out";
  const errored = state.runtime.phase === "error";
  return `
    <main class="system-screen">
      <section class="system-card" aria-live="polite">
        ${signedOut ? `
          <div><p class="eyebrow">BYOU IQ</p><h1>${pendingEmailConfirmation ? "Verify your company email" : pendingPasswordLink ? "Create your password" : signupMode ? "Create your account" : passwordRecoveryMode ? "Reset your password" : "Sign in"}</h1><p class="system-copy">${signupMode ? "Use your @example.invalid email and choose a password with at least 12 characters. Verify your email once; future sign-ins use your password." : pendingPasswordLink ? "Choose a password with at least 12 characters." : "Use your approved @example.invalid staff account."}</p></div>
          ${state.runtime.message ? `<div class="system-message system-message--${state.runtime.messageKind === "success" ? "success" : "error"}">${escapeHtml(state.runtime.message)}</div>` : ""}
          ${pendingEmailConfirmation ? `<form id="email-confirmation-form" class="form-stack">
            <button class="button button--primary button--full" type="submit">Verify email</button>
          </form><button class="button" data-action="auth-back">Back to sign in</button>` : signupMode ? `<form id="signup-form" class="form-stack">
            <label><span>Full name</span><input name="displayName" type="text" autocomplete="name" maxlength="80" pattern="[^@]+" required /><small>Use the name your teammates know you by.</small></label>
            <label><span>Company email</span><input name="email" type="email" autocomplete="username" required /></label>
            <label><span>Create your password</span><input name="password" type="password" autocomplete="new-password" minlength="12" maxlength="128" required /></label>
            <label><span>Confirm password</span><input name="confirmation" type="password" autocomplete="new-password" minlength="12" maxlength="128" required /></label>
            <button class="button button--primary button--full" type="submit">Create account</button>
          </form><p class="system-copy">Verify your company email once, then sign in to edit creators and campaigns.</p><button class="button" data-action="auth-back">Back to sign in</button>` : pendingPasswordLink ? `<form id="password-setup-form" class="form-stack">
            <label><span>Create your password</span><input name="password" type="password" autocomplete="new-password" minlength="12" maxlength="128" required /></label>
            <label><span>Confirm password</span><input name="confirmation" type="password" autocomplete="new-password" minlength="12" maxlength="128" required /></label>
            <button class="button button--primary button--full" type="submit">Save password</button>
          </form><button class="button" data-action="auth-recovery">Request a fresh link</button>` : passwordRecoveryMode ? `<form id="password-recovery-form" class="form-stack">
            <label><span>Staff email</span><input name="email" type="email" autocomplete="username" required /></label>
            <button class="button button--primary button--full" type="submit">Request password link</button>
          </form><button class="button" data-action="auth-back">Back to sign in</button>` : `<form id="login-form" class="form-stack">
            <label><span>Staff email</span><input name="email" type="email" autocomplete="username" required /></label>
            <label><span>Password</span><input name="password" type="password" autocomplete="current-password" required /></label>
            <button class="button button--primary button--full" type="submit">Sign in</button>
          </form><button class="button" data-action="auth-signup">Create an account</button><button class="button" data-action="auth-recovery">Forgot password?</button>`}
          <p class="system-footnote">Your sign-in details are sent only to the private authentication endpoint. Creator contact and location fields are not shown in this workspace.</p>` : errored ? `
          <div><p class="eyebrow">Connection problem</p><h1>The private workspace is unavailable</h1><p class="system-copy">${escapeHtml(state.runtime.message || "The server could not open the workspace.")}</p></div>
          <button class="button button--primary button--full" data-action="retry-bootstrap">Try again</button>
          ` : `
          <div class="system-loader" aria-hidden="true"></div>
          <div><p class="eyebrow">Secure connection</p><h1>Opening BYOU IQ</h1><p class="system-copy">${escapeHtml(state.runtime.message || "Checking your workspace access…")}</p></div>`}
      </section>
    </main>`;
};

const renderSharedReportShell = () => `
  <div class="shared-report-shell">
    <header class="shared-report-header"><span>Internal published campaign report</span></header>
    <main>${renderReport()}</main>
  </div>`;

const renderShell = () => `
  <div class="app-shell">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <aside class="sidebar">
      <nav class="primary-nav" aria-label="Main navigation">
        ${navItem("campaigns", "Campaigns", "campaigns", ["campaigns", "campaign"])}
        ${navItem("creators", "Creators", "creators", ["creators", "creator"])}
        ${navItem("finances", "Finances", "finances")}
        ${navItem("shipments", "Shipments", "shipments")}

      </nav>
      <div class="sidebar-bottom">
        <button type="button" class="user-card" data-action="open-settings" aria-label="Profile and settings" title="Profile and settings"><span class="user-avatar" aria-hidden="true">${escapeHtml(state.currentUser.initials)}</span><strong data-no-translate>${escapeHtml(state.currentUser.name || (interfaceLocale === "ko" ? "프로필" : "Profile"))}</strong></button>
      </div>
    </aside>
    ${isLiveMode() ? `<header class="mobile-header"><div class="mobile-actions"><button class="admin-link" data-action="sign-out">Sign out</button></div></header>` : ""}
    <main class="main-content" id="main-content" tabindex="-1">${renderMain()}</main>
    <nav class="mobile-nav" aria-label="Mobile navigation">
      ${navItem("campaigns", "Campaigns", "campaigns", ["campaigns", "campaign"])}
      ${navItem("creators", "Creators", "creators", ["creators", "creator"])}
      ${navItem("finances", "Finances", "finances")}
      ${navItem("shipments", "Shipments", "shipments")}
      ${navItem("settings", "Settings", "settings", ["settings", "automations"])}
    </nav>
  </div>`;

const renderFinderDrawer = () => {
  const targetCampaign = campaignById(state.finder.campaignId);
  const results = isLiveMode()
    ? state.finder.results.map((creator) => {
        const summary = creator.relationshipSummary || {};
        const paidCampaignCount = Number(summary.paidCampaignCount) || 0;
        const seedingCampaignCount = Number(summary.seedingCampaignCount) || 0;
        return {
          creator,
          currentRate: creator.activation?.currentQuotedRate,
          distanceMiles: creator.activation?.closestWarehouse?.distanceMiles,
          comparable: [],
          score: null,
          stats: {
            campaignCount: Number(summary.campaignCount) || 0,
            paidCampaignCount,
            seedingCampaignCount,
            collaborationMix: collaborationMixLabel(
              paidCampaignCount,
              seedingCampaignCount,
              summary.primaryCollaborationType
            )
          }
        };
      })
    : recommendCreators(state.finder).slice(0, 6);
  const categories = unique([
    ...state.campaigns.map((campaign) => campaign.category),
    ...state.creators.flatMap((creator) => creator.categories)
  ].filter(Boolean)).sort();
  const platforms = unique([
    "Instagram",
    "TikTok",
    "YouTube",
    "Facebook",
    ...state.creators.flatMap((creator) => creator.platforms)
  ]).sort();
  const creatorLoadMessage = state.finder.loading
    ? `<div class="system-message">Searching the full activation pool...</div>`
    : state.finder.error
      ? `<div class="system-message system-message--error">${escapeHtml(state.finder.error)}</div>`
      : "";
  return `
    <div class="drawer-backdrop" data-action="close-drawer"></div>
    <aside class="drawer drawer--wide" role="dialog" aria-modal="true" aria-labelledby="finder-title">
      <header class="drawer-header"><div><p class="eyebrow">Creator search</p><h2 id="finder-title">Find creators for a campaign</h2></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
      <div class="drawer-body">
        ${creatorLoadMessage}
        <div class="finder-controls">
          <label><span>Campaign context</span><select data-finder="campaignId">${state.campaigns.map((campaign) => `<option value="${campaign.id}" ${state.finder.campaignId === campaign.id ? "selected" : ""}>${escapeHtml(campaign.name)}</option>`).join("")}</select></label>
          <label><span>Category</span><select data-finder="category">${["All categories", ...categories].map((value) => `<option ${state.finder.category === value ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}</select></label>
          <label><span>Platform</span><select data-finder="platform">${["All platforms", ...platforms].map((value) => `<option ${state.finder.platform === value ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}</select></label>
          <label><span>Maximum Costco distance</span><input type="number" min="1" max="250" step="5" data-finder="maxDistance" value="${state.finder.maxDistance}" /></label>
          <label><span>Maximum recorded fee</span><input type="number" min="0" step="500" data-finder="maxFee" value="${state.finder.maxFee}" /></label>
        </div>
        <div class="finder-summary"><strong>${state.finder.loading ? "Loading creator matches..." : `${results.length} matches`}</strong><span>Filtered by category, platform, Costco distance, and recorded rate.</span></div>
        ${state.finder.hasMore ? `<div class="system-message">Showing the first 50 strongest database matches. Narrow the filters for a more specific shortlist.</div>` : ""}
        <div class="recommendation-list">
          ${state.finder.loading
            ? `<div class="empty-state"><strong>Searching creators...</strong><span>The database is evaluating the full eligible cohort.</span></div>`
            : results.map((result, index) => {
            const alreadyAdded = targetCampaign?.assignments.some((assignment) => assignment.creatorId === result.creator.id);
            const distanceLabel = Number.isFinite(result.distanceMiles)
              ? `${result.distanceMiles.toFixed(1)} mi to ${escapeHtml(result.creator.activation?.closestWarehouse?.name || "closest Costco")}`
              : "Costco distance not recorded";
            const historyLabel = `${result.stats.campaignCount} campaign${result.stats.campaignCount === 1 ? "" : "s"} · ${escapeHtml(result.stats.collaborationMix)}`;
            return `<article class="recommendation-card">
              <div class="recommendation-rank">${index + 1}</div>
              ${avatar(result.creator, "medium")}
              <div class="recommendation-main"><div class="recommendation-title"><button class="inline-link inline-link--large" data-action="open-creator" data-id="${result.creator.id}">${escapeHtml(creatorDisplayName(result.creator))}</button>${isLiveMode() ? badge("Database match", "neutral") : badge(`${result.score}/100 match`, result.score >= 75 ? "good" : "neutral")}</div><p>${distanceLabel} · ${historyLabel} · ${formatCurrency(result.currentRate)} current rate</p><div class="evidence-links">Based on: ${isLiveMode() ? `<span>${escapeHtml(state.finder.category || "Recorded category")} · ${escapeHtml(state.finder.platform)}</span>` : result.comparable.map(({ campaign }) => `<button data-action="open-campaign" data-id="${campaign.id}">${escapeHtml(campaign.name)}</button>`).join("")}</div></div>
              ${isLiveMode()
                ? `<button class="button button--primary button--small" data-action="open-creator" data-id="${result.creator.id}">Open profile</button>`
                : `<button class="button ${alreadyAdded ? "button--soft" : "button--primary"} button--small" data-action="add-recommended" data-creator="${result.creator.id}" ${alreadyAdded ? "disabled" : ""}>${alreadyAdded ? "Added" : "Add to shortlist"}</button>`}
            </article>`;
          }).join("") || `<div class="empty-state"><strong>No matching creators.</strong><span>Increase the Costco distance or try another category or platform.</span></div>`}
        </div>
      </div>
    </aside>`;
};

const campaignTemplateDefaults = (template) => {
  if (template === "Paid") {
    return {
      type: "Paid",
      budget: 25000,
      roles: "Campaign manager, content reviewer, finance approver, analyst",
      deliverables: "TikTok video, Instagram Reel, and Stories",
      timing: "Draft review 14 days before posting; payment reminder 7 days before due"
    };
  }
  if (template === "Seeding") {
    return {
      type: "Seeding",
      budget: 7500,
      roles: "Campaign manager, shipping owner, analyst",
      deliverables: "Organic post with optional Stories",
      timing: "Shipment 21 days before target post; receipt reminder after delivery"
    };
  }
  return {
    type: "Paid",
    budget: 0,
    roles: "Choose during setup",
    deliverables: "None prefilled",
    timing: "No standard deadlines"
  };
};

const renderLegacyNewCampaignDrawer = () => {
  const defaults = campaignTemplateDefaults(state.selectedTemplate);
  return `
  <div class="drawer-backdrop" data-action="close-drawer"></div>
  <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="new-campaign-title">
    <header class="drawer-header"><div><p class="eyebrow">${escapeHtml(state.selectedTemplate)} setup</p><h2 id="new-campaign-title">Create campaign</h2></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
    <form class="drawer-body form-stack" id="new-campaign-form">
      ${isLiveMode() ? `<div class="permission-callout"><strong>Legacy setup</strong><span>This retired setup is not shown in the current campaign workspace.</span></div>` : ""}
      <div class="permission-callout"><strong>${escapeHtml(state.selectedTemplate)} defaults</strong><span>${escapeHtml(defaults.roles)}. ${escapeHtml(defaults.deliverables)}. ${escapeHtml(defaults.timing)}.</span></div>
      <label><span>Campaign name</span><input name="name" required placeholder="e.g. Morrow Holiday Glow" /></label>
      <div class="form-row"><label><span>Client</span><input name="client" required placeholder="Client name" /></label><label><span>Brand</span><input name="brand" required placeholder="Brand name" /></label></div>
      <div class="form-row"><label><span>Category</span><select name="category"><option>Hair care</option><option>Skincare</option><option>Makeup</option><option>Wellness</option></select></label><label><span>Campaign type</span><select name="type"><option ${defaults.type === "Paid" ? "selected" : ""}>Paid</option><option ${defaults.type === "Seeding" ? "selected" : ""}>Seeding</option></select></label></div>
      <div class="form-row"><label><span>Start date</span><input name="startDate" type="date" required value="2026-08-17" /></label><label><span>End date</span><input name="endDate" type="date" required value="2026-09-25" /></label></div>
      <label><span>Working budget</span><input name="budget" type="number" min="0" step="500" value="${defaults.budget}" /></label>
      <label><span>Objective</span><textarea name="objective" rows="4" required placeholder="What should this campaign achieve?"></textarea></label>
      <div class="drawer-footer"><button type="button" class="button button--secondary" data-action="close-drawer">Cancel</button><button type="submit" class="button button--primary">Create campaign</button></div>
    </form>
  </aside>`;
};

const renderImportDrawer = () => {
  const run = state.importRuns.find((item) => item.id === state.activeImportId) || state.importRuns[0];
  if (!run) {
    return `<div class="drawer-backdrop" data-action="close-drawer"></div><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="import-title"><header class="drawer-header"><div><p class="eyebrow">Import</p><h2 id="import-title">Google Sheets import</h2></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header><div class="drawer-body"><div class="empty-state"><strong>No import preview is available.</strong><span>Ask an administrator to prepare the import.</span></div></div></aside>`;
  }
  const source = sourceById(run.sourceId);
  const previewRows = [];
  return `
    <div class="drawer-backdrop" data-action="close-drawer"></div>
    <aside class="drawer drawer--wide" role="dialog" aria-modal="true" aria-labelledby="import-title">
      <header class="drawer-header"><div><p class="eyebrow">Import preview</p><h2 id="import-title">Preview Google Sheets import</h2></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
      <div class="drawer-body">
        <div class="finder-controls import-controls">
          <label><span>Approved source</span><select data-import="sourceId">${state.importRuns.map((item) => { const itemSource = sourceById(item.sourceId); return `<option value="${item.sourceId}" ${item.sourceId === run.sourceId ? "selected" : ""}>${escapeHtml(itemSource.name)}</option>`; }).join("")}</select></label>
          <label><span>Named tab</span><input value="${escapeHtml(run.tab)}" readonly /></label>
          <label><span>Approved range</span><input value="${escapeHtml(run.range)}" readonly /></label>
          <label><span>Import owner</span><input value="${escapeHtml(run.requestedBy)}" readonly /></label>
        </div>
        <div class="import-field-grid">
          <div><h3>Allowed workflow fields</h3><div class="field-chip-list field-chip-list--good">${run.approvedFields.map((field) => `<span>${escapeHtml(field)}</span>`).join("")}</div></div>
          <div><h3>Blocked before storage</h3><div class="field-chip-list field-chip-list--blocked">${run.blockedFields.map((field) => `<span>${escapeHtml(field)}</span>`).join("")}</div></div>
        </div>
        <section class="import-preview">
          <div class="panel-heading"><div><p class="eyebrow">Import summary</p><h2>${isLiveMode() ? "Import run" : "Rows requiring review"}</h2></div>${badge(run.status)}</div>
          ${previewRows.length ? `<div class="simple-table import-preview-table"><div class="simple-head"><span>Profile</span><span>Platform / source</span><span>Rate / shipment</span><span>Status / post</span><span>Identity result</span></div>${previewRows.map((row) => `<div>${row.map((cell) => `<span>${escapeHtml(cell)}</span>`).join("")}</div>`).join("")}</div>` : `<div class="empty-state"><strong>Row-level values stay out of this admin summary.</strong><span>Review counts and approved fields here; use the controlled import workflow for conflict resolution.</span></div>`}
        </section>
        <div class="import-review-summary">
          <div><strong>${run.newCreators}</strong><span>new creator records</span></div>
          <div><strong>${run.matchedCreators}</strong><span>matched identities</span></div>
          <div><strong>${run.blockedRows}</strong><span>blocked rows</span></div>
          <div><strong>0</strong><span>personal fields stored</span></div>
        </div>
        <div class="drawer-footer"><button class="button button--secondary" data-action="close-drawer">Close</button><button class="button button--primary" data-action="approve-import" data-id="${run.id}" ${run.status === "Imported" || isLiveMode() ? "disabled" : ""}>${isLiveMode() ? "Server-controlled approval" : run.status === "Imported" ? "Imported" : "Approve workflow records"}</button></div>
      </div>
    </aside>`;
};

const renderSourceFormDrawer = () => {
  const source = state.editingSourceId ? sourceById(state.editingSourceId) : null;
  return `
    <div class="drawer-backdrop" data-action="close-drawer"></div>
    <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="source-form-title">
      <header class="drawer-header"><div><p class="eyebrow">Sources</p><h2 id="source-form-title">${source ? "Edit source" : "Create source"}</h2></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
      <form class="drawer-body form-stack" id="source-form">
        ${isLiveMode() ? `<div class="permission-callout permission-callout--warn"><strong>Source editing is unavailable</strong><span>Ask an administrator to update this source.</span></div>` : ""}
        <input type="hidden" name="id" value="${escapeHtml(source?.id || "")}" />
        <label><span>Source name</span><input name="name" required value="${escapeHtml(source?.name || "")}" placeholder="Agency, network, platform, or outreach source" /></label>
        <div class="form-row"><label><span>Source type</span><select name="type">${["Agency / network", "Discovery platform", "Direct outreach", "Approved prospect list", "Google Sheets", "Gmail"].map((value) => `<option ${source?.type === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label><span>Category</span><select name="category"><option ${source?.category === "Acquisition" ? "selected" : ""}>Acquisition</option><option ${source?.category === "System" ? "selected" : ""}>System</option></select></label></div>
        <div class="form-row"><label><span>Source owner</span><input name="owner" required value="${escapeHtml(source?.owner || state.currentUser.name)}" /></label><label><span>Status</span><select name="status">${["Active", "Review required", "Inactive", "Approved ranges only", "Manual links"].map((value) => `<option ${source?.status === value ? "selected" : ""}>${value}</option>`).join("")}</select></label></div>
        <label><span>Connection method</span><input name="connection" required value="${escapeHtml(source?.connection || "Manual source attribution")}" /></label>
        <label><span>Description</span><textarea name="description" rows="4" required>${escapeHtml(source?.description || "")}</textarea></label>
        <label><span>Record path</span><input name="workflow" required value="${escapeHtml(source?.workflow || "Source -> relationship record -> campaign assignment")}" /></label>
        <div class="drawer-footer"><button type="button" class="button button--secondary" data-action="close-drawer">Cancel</button><button type="submit" class="button button--primary" ${isLiveMode() ? "disabled" : ""}>Save source</button></div>
      </form>
    </aside>`;
};

const renderDeliverableDrawer = () => {
  const record = assignmentById(state.editingAssignmentId);
  if (!record) return "";
  const { campaign, assignment } = record;
  const creator = creatorById(assignment.creatorId);
  return `
    <div class="drawer-backdrop" data-action="close-drawer"></div>
    <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="deliverable-title">
      <header class="drawer-header"><div><p class="eyebrow">Campaign manager update</p><h2 id="deliverable-title">Update deliverable</h2><p>${escapeHtml(creatorDisplayName(creator))} · ${escapeHtml(campaign.name)}</p></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
      <form class="drawer-body form-stack" id="deliverable-form">
        <input type="hidden" name="assignmentId" value="${assignment.id}" />
        <input type="hidden" name="deliverableId" value="${escapeHtml(assignment.deliverable.id || deliverablesForAssignment(assignment)[0]?.id || "")}" />
        <label><span>Deliverable status</span><select name="status">${["Not started", "Brief acknowledged", "In production", "Draft received", "Revision requested", "Approved", "Published"].map((value) => `<option ${assignment.deliverable.status === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
        <div class="form-row"><label><span>Revision count</span><input name="revisionCount" type="number" min="0" value="${assignment.deliverable.revisionCount}" /></label><label><span>Next due date</span><input name="nextDueDate" type="date" value="${escapeHtml(assignment.deliverable.nextDueDate || "")}" /></label></div>
        <label><span>Exact published post URL</span><input name="postUrl" type="url" value="${escapeHtml(assignment.post?.url || "")}" placeholder="https://platform.example/post-id" /></label>
        <label><span>Post source</span><select name="postSource">${["Influencer", "Agency/network report", "Gmail thread", "Trackify", "Staff review"].map((value) => `<option ${assignment.post?.source === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
        <label><span>Internal update note</span><textarea name="note" rows="4" placeholder="What changed, and what happens next?">${escapeHtml(assignment.notes || "")}</textarea></label>
        <div class="drawer-footer"><button type="button" class="button button--secondary" data-action="close-drawer">Cancel</button><button type="submit" class="button button--primary">Save deliverable update</button></div>
      </form>
    </aside>`;
};

const renderPaymentDrawer = () => {
  const record = assignmentById(state.editingAssignmentId);
  if (!record) return "";
  const { campaign, assignment } = record;
  const creator = creatorById(assignment.creatorId);
  const payment = assignment.payment || {};
  return `
    <div class="drawer-backdrop" data-action="close-drawer"></div>
    <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="payment-title">
      <header class="drawer-header"><div><p class="eyebrow">Operations / finance update</p><h2 id="payment-title">Update payment obligation</h2><p>${escapeHtml(creatorDisplayName(creator))} · ${escapeHtml(campaign.name)}</p></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
      <form class="drawer-body form-stack" id="payment-form">
        <input type="hidden" name="assignmentId" value="${assignment.id}" />
        <div class="form-row"><label><span>Agreed fee</span><input name="amount" type="number" min="0" step="50" value="${payment.amount ?? assignment.rate ?? 0}" /></label><label><span>Payment due date</span><input name="dueDate" type="date" value="${escapeHtml(payment.dueDate || "")}" /></label></div>
        <label><span>Invoice status</span><select name="invoiceStatus">${["Not requested", "Requested", "Invoice received", "Invoice exception", "Not required"].map((value) => `<option ${payment.invoiceStatus === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
        <input type="hidden" name="ceoApproval" value="${escapeHtml(payment.ceoApproval || "Unknown")}" /><input type="hidden" name="cfoApproval" value="${escapeHtml(payment.cfoApproval || "Unknown")}" />
        <label><span>Payment status</span><select name="status">${["Not due", "Approval pending", "CFO approval pending", "Scheduled", "Paid", "Overdue"].map((value) => `<option ${payment.status === value || assignment.paymentStatus === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
        <label><span>Finance-system reference</span><input name="externalReference" value="${escapeHtml(payment.externalReference || "")}" placeholder="Required only when status is Paid" /></label>
        <label><span>Update note</span><textarea name="note" rows="4" maxlength="1000" placeholder="Record the exception, approval, or expected next action."></textarea></label>
        <div class="drawer-footer"><button type="button" class="button button--secondary" data-action="close-drawer">Cancel</button><button type="submit" class="button button--primary">Save payment update</button></div>
      </form>
    </aside>`;
};

const renderPaymentApprovalDrawer = () => {
  const record = assignmentById(state.editingAssignmentId);
  const approvalRole = state.editingPaymentApprovalRole;
  if (!record || !["ceo", "cfo"].includes(approvalRole)) return "";
  const roleLabel = approvalRole === "ceo" ? "CEO / executive" : "CFO / finance administrator";
  return `
    <div class="drawer-backdrop" data-action="close-drawer"></div>
    <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="payment-approval-title">
      <header class="drawer-header"><div><p class="eyebrow">Independent commercial approval</p><h2 id="payment-approval-title">Record ${escapeHtml(roleLabel)} decision</h2><p>${escapeHtml(record.campaign.name)}</p></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
      <form class="drawer-body form-stack" id="payment-approval-form">
        <input type="hidden" name="assignmentId" value="${escapeHtml(record.assignment.id)}" />
        <input type="hidden" name="approvalRole" value="${approvalRole}" />
        <label><span>Decision</span><select name="decision" required><option value="approved">Approved</option><option value="rejected">Rejected</option></select></label>
        <label><span>Decision note</span><textarea name="note" required maxlength="500" rows="5" placeholder="State what you verified for this exact obligation."></textarea></label>
        <div class="drawer-footer"><button type="button" class="button button--secondary" data-action="close-drawer">Cancel</button><button type="submit" class="button button--primary">Record decision</button></div>
      </form>
    </aside>`;
};

const renderPostVerificationDrawer = () => {
  const record = assignmentById(state.editingAssignmentId);
  if (!record?.assignment.post?.attributionId) return "";
  const { campaign, assignment } = record;
  const creator = creatorById(assignment.creatorId);
  return `
    <div class="drawer-backdrop" data-action="close-drawer"></div>
    <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="post-verification-title">
      <header class="drawer-header"><div><p class="eyebrow">Designated reviewer</p><h2 id="post-verification-title">Verify exact post</h2><p>${escapeHtml(creatorDisplayName(creator))} · ${escapeHtml(campaign.name)}</p></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
      <form class="drawer-body form-stack" id="post-verification-form">
        <input type="hidden" name="assignmentId" value="${assignment.id}" />
        <input type="hidden" name="attributionId" value="${escapeHtml(assignment.post.attributionId)}" />
        <a class="external-link" href="${escapeHtml(assignment.post.url)}" target="_blank" rel="noreferrer">Open exact published post &#8599;</a>
        <label><span>Decision</span><select name="decision"><option value="verified">Verified</option><option value="rejected">Rejected</option></select></label>
        <label><span>Verification method</span><select name="method"><option value="exact_url_opened">Opened exact URL and matched creator</option><option value="platform_post_id_compared">Compared platform post ID</option><option value="source_record_and_creator_matched">Matched source record and creator</option></select></label>
        <label><span>Rejection reason</span><textarea name="rejectionReason" rows="3" placeholder="Required only when rejected"></textarea></label>
        <div class="drawer-footer"><button type="button" class="button button--secondary" data-action="close-drawer">Cancel</button><button type="submit" class="button button--primary">Record review</button></div>
      </form>
    </aside>`;
};

const renderCampaignUpdateDrawer = () => {
  const campaign = campaignById(state.selectedCampaignId);
  const updateTypes = campaignUpdateTypeOptions(campaign);
  return `
    <div class="drawer-backdrop" data-action="close-drawer"></div>
    <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="campaign-update-title">
      <header class="drawer-header"><div><p class="eyebrow">Owned status update</p><h2 id="campaign-update-title">Add campaign update</h2><p>${escapeHtml(campaign.name)}</p></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
      <form class="drawer-body form-stack" id="campaign-update-form">
        <label><span>Update type</span><select name="type">${updateTypes.map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`).join("")}</select></label>
        <label><span>Current status</span><input name="status" required placeholder="e.g. Revision requested" /></label>
        <label><span>What changed?</span><textarea name="note" rows="4" required></textarea></label>
        <div class="form-row"><label><span>Next owner</span><input name="nextOwner" required placeholder="Person or role" /></label><label><span>Due date</span><input name="dueDate" type="date" /></label></div>
        <label><span>Next action</span><input name="nextAction" required placeholder="What must the next owner do?" /></label>
        <div class="drawer-footer"><button type="button" class="button button--secondary" data-action="close-drawer">Cancel</button><button type="submit" class="button button--primary">Record update</button></div>
      </form>
    </aside>`;
};

const manualEnumValue = (value, fallback) => {
  const normalized = String(value || "").trim().toLowerCase().replaceAll(/[\s/-]+/g, "_");
  return normalized || fallback;
};

const manualOptions = (options, selectedValue) => options.map(([value, label]) =>
  `<option value="${escapeHtml(value)}" ${value === selectedValue ? "selected" : ""}>${escapeHtml(label)}</option>`
).join("");

const MANUAL_CREATOR_CATEGORY_OPTIONS = Object.freeze([
  "Costco", "Beauty", "Skincare", "Hair care", "K-Beauty", "Makeup", "Wellness",
  "Lifestyle", "Food & beverage", "Home", "Family & parenting", "Fashion", "Other"
]);
const MANUAL_CREATOR_FORMAT_OPTIONS = Object.freeze([
  "Short-form video", "Instagram Reel", "TikTok video", "YouTube video", "Story set",
  "Static post", "Tutorial", "Livestream", "Other"
]);
const MANUAL_RATE_CURRENCIES = Object.freeze([
  "USD", "CAD", "KRW", "JPY", "EUR", "GBP", "AUD", "MXN"
]);
const MANUAL_REGION_CODES = Object.freeze([
  "AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "HI", "IA",
  "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS",
  "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA",
  "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY", "AB",
  "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"
]);

const manualChoiceValues = (options, selectedValues = []) => {
  const seen = new Set();
  return [...options, ...selectedValues]
    .map((value) => String(value || "").trim())
    .filter((value) => {
      const key = value.toLocaleLowerCase("en-US");
      if (!value || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const manualChoiceSummary = (values, emptyLabel) => {
  if (!values.length) return emptyLabel;
  if (values.length <= 2) return values.join(", ");
  return `${values.length} selected`;
};

const renderManualChoiceDropdown = ({ label, name, options, selectedValues = [] }) => {
  const selectedKeys = new Set(selectedValues.map((value) => String(value).toLocaleLowerCase("en-US")));
  const emptyLabel = `Choose ${label.toLocaleLowerCase("en-US")}`;
  const values = manualChoiceValues(options, selectedValues);
  const selected = values.filter((value) => selectedKeys.has(value.toLocaleLowerCase("en-US")));
  return `
    <fieldset class="manual-choice-field">
      <legend>${escapeHtml(label)}</legend>
      <details class="manual-choice-dropdown" data-manual-choice-dropdown data-empty-label="${escapeHtml(emptyLabel)}">
        <summary><span data-manual-choice-summary>${escapeHtml(manualChoiceSummary(selected, emptyLabel))}</span><span aria-hidden="true">&#9662;</span></summary>
        <div class="manual-choice-options" role="group" aria-label="${escapeHtml(label)}">
          ${values.map((value) => `<label class="manual-choice-option"><input type="checkbox" name="${escapeHtml(name)}" value="${escapeHtml(value)}" ${selectedKeys.has(value.toLocaleLowerCase("en-US")) ? "checked" : ""} /><span>${escapeHtml(value)}</span></label>`).join("")}
        </div>
      </details>
      <small class="helper-text">Choose one or more.</small>
    </fieldset>`;
};

const renderManualSocialProfileRow = (profile = {}, index = 0) => {
  const platform = manualEnumValue(profile.platform, "instagram");
  const rateCurrency = String(profile.rateCurrency || "USD").trim().toUpperCase();
  const rateCurrencyOptions = manualChoiceValues(MANUAL_RATE_CURRENCIES, [rateCurrency])
    .map((value) => [value, value]);
  return `
    <article class="manual-social-profile-row" data-social-profile-row>
      <input type="hidden" name="socialProfileId" value="${escapeHtml(profile.id || "")}" />
      <div class="manual-social-profile-heading">
        <span><strong data-social-profile-label>Profile ${index + 1}</strong><small data-social-profile-primary>${index === 0 ? "First profile is primary" : "Additional profile"}</small></span>
        <button type="button" class="button button--secondary button--small" data-action="remove-social-profile-row">Remove</button>
      </div>
      <div class="form-row">
        <label><span>Platform</span><select name="socialPlatform">${manualOptions([["instagram", "Instagram"], ["tiktok", "TikTok"], ["youtube", "YouTube"], ["other", "Other"]], platform)}</select></label>
        <label><span>Handle</span><input name="socialHandle" maxlength="200" required value="${escapeHtml(profile.handle || "")}" placeholder="@creator" /></label>
      </div>
      <label><span>Profile URL</span><input name="socialProfileUrl" type="url" maxlength="1000" required value="${escapeHtml(profile.profileUrl || "")}" placeholder="https://..." /><small class="helper-text">Use the selected platform and the same handle entered above.</small></label>
      <div class="form-row">
        <label><span>Recent rate</span><input name="socialRecentRate" type="number" min="0" step="0.01" value="${Number.isFinite(profile.recentRate) ? profile.recentRate : ""}" /></label>
        <label><span>Rate currency</span><select name="socialRateCurrency" required>${manualOptions(rateCurrencyOptions, rateCurrency)}</select></label>
      </div>
      <small class="helper-text">Rate applies only to this social profile.</small>
    </article>`;
};

const refreshManualSocialProfileRows = (list) => {
  const rows = [...list.querySelectorAll("[data-social-profile-row]")];
  rows.forEach((row, index) => {
    const label = row.querySelector("[data-social-profile-label]");
    const primary = row.querySelector("[data-social-profile-primary]");
    if (label) label.textContent = `Profile ${index + 1}`;
    if (primary) primary.textContent = index === 0 ? "First profile is primary" : "Additional profile";
  });
};

const renderManualPermissionDeniedDrawer = (title) => `
  <div class="drawer-backdrop" data-action="close-drawer"></div>
  <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="manual-permission-title">
    <header class="drawer-header"><div><p class="eyebrow">Read-only access</p><h2 id="manual-permission-title">${escapeHtml(title)}</h2></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
    <div class="drawer-body"><div class="empty-state"><strong>Your role cannot change this record.</strong><span>Nothing has been changed.</span><button class="button button--secondary" data-action="close-drawer">Close</button></div></div>
  </aside>`;

const renderManualCreatorDrawer = () => {
  const creator = state.editingCreatorId ? creatorById(state.editingCreatorId) : null;
  if ((state.editingCreatorId && !creator) || (creator ? !canEditManualCreator(creator) : !canCreateManualCreator())) {
    return renderManualPermissionDeniedDrawer("Creator editing unavailable");
  }
  const activation = creator?.activation || {};
  const warehouse = activation.closestWarehouse || {};
  const stageSummary = creator?.relationshipSummary?.stageSummary || {};
  const socialProfiles = (creator?.socialProfiles?.length ? creator.socialProfiles : [{
    id: null,
    platform: creator?.platforms?.[0] || "instagram",
    handle: creator?.handle || "",
    profileUrl: creator?.profileUrl || "",
    recentRate: activation.currentQuotedRate,
    rateCurrency: activation.rateCurrency || "USD"
  }]).map((profile, index) => ({
    ...profile,
    recentRate: Number.isFinite(profile.recentRate)
      ? profile.recentRate
      : index === 0 ? activation.currentQuotedRate : null,
    rateCurrency: profile.rateCurrency || (index === 0 ? activation.rateCurrency : null) || "USD"
  }));
  const lifecycleStatus = manualEnumValue(creator?.lifecycleStatus || creator?.status, "active");
  const warehouseState = String(warehouse.state || "").trim().toUpperCase();
  const regionOptions = manualChoiceValues(MANUAL_REGION_CODES, [warehouseState])
    .map((value) => [value, value]);
  return `
    <div class="drawer-backdrop" data-action="close-drawer"></div>
    <aside class="drawer drawer--wide" role="dialog" aria-modal="true" aria-labelledby="manual-creator-title">
      <header class="drawer-header"><div><p class="eyebrow">Public creator record</p><h2 id="manual-creator-title">${creator ? "Edit Profile" : "Create Creator"}</h2><p>Sensitive contact, address, tax, banking, and identity fields stay in the separate private editor.</p></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
      <form class="drawer-body form-stack" id="manual-creator-form">
        <input type="hidden" name="creatorId" value="${escapeHtml(creator?.id || "")}" />
        <div class="form-row"><label><span>Display name</span><input name="displayName" maxlength="200" required value="${escapeHtml(creator?.displayName || "")}" /></label><label><span>Lifecycle status</span><select name="lifecycleStatus">${manualOptions([["active", "Active"], ["inactive", "Inactive"], ["review", "Needs review"], ["archived", "Archived"]], lifecycleStatus)}</select></label></div>
        <fieldset class="manual-fieldset"><legend>Social profiles</legend>
          <div class="manual-social-profile-heading"><p class="helper-text">Add every profile this creator owns. The first profile is the primary profile shown in compact views.</p><button type="button" class="button button--secondary button--small" data-action="add-social-profile-row">Add profile</button></div>
          <div class="manual-social-profile-list" data-social-profile-list>${socialProfiles.map(renderManualSocialProfileRow).join("")}</div>
        </fieldset>
        <div class="form-row">${renderManualChoiceDropdown({ label: "Categories", name: "categories", options: MANUAL_CREATOR_CATEGORY_OPTIONS, selectedValues: creator?.categories || [] })}${renderManualChoiceDropdown({ label: "Preferred formats", name: "preferredFormats", options: MANUAL_CREATOR_FORMAT_OPTIONS, selectedValues: creator?.preferredFormats || [] })}</div>
        <label><span>Last contacted</span><input name="lastContactedOn" type="date" value="${escapeHtml(stageSummary.lastContacted || "")}" /></label>
        <fieldset class="manual-fieldset"><legend>Closest Costco warehouse</legend>
          <div class="form-row"><label><span>Name</span><input name="closestCostcoName" maxlength="200" value="${escapeHtml(warehouse.name || "")}" /></label><label><span>City</span><input name="closestCostcoCity" maxlength="120" value="${escapeHtml(warehouse.city || "")}" /></label><label><span>State / province</span><select name="closestCostcoState"><option value="">Not recorded</option>${manualOptions(regionOptions, warehouseState)}</select></label></div>
          <div class="form-row"><label><span>Distance (miles)</span><input name="closestCostcoDistanceMiles" type="number" min="0" step="0.1" value="${Number.isFinite(warehouse.distanceMiles) ? warehouse.distanceMiles : ""}" /></label><label><span>Estimated drive (minutes)</span><input name="closestCostcoEstimatedMinutes" type="number" min="0" step="1" value="${Number.isFinite(warehouse.estimatedMinutes) ? warehouse.estimatedMinutes : ""}" /></label></div>
        </fieldset>
        <label><span>Internal note</span><textarea name="internalNote" maxlength="2000" rows="4">${escapeHtml(creator?.note || "")}</textarea></label>
        <div class="drawer-footer"><button type="button" class="button button--secondary" data-action="close-drawer">Cancel</button><button type="submit" class="button button--primary">${creator ? "Save Profile" : "Create Creator"}</button></div>
      </form>
    </aside>`;
};

const renderManualCampaignDrawer = () => {
  const campaign = state.editingCampaignId ? campaignById(state.editingCampaignId) : null;
  if ((state.editingCampaignId && !campaign) || (campaign ? !canEditManualCampaign(campaign) : !canCreateManualCampaign())) {
    return renderManualPermissionDeniedDrawer("Campaign editing unavailable");
  }
  const campaignType = manualEnumValue(campaign?.type, state.creatorLibrary.campaignCreation?.type || "paid");
  const status = manualEnumValue(campaign?.status, "planning");
  return `
    <div class="drawer-backdrop" data-action="close-drawer"></div>
    <aside class="drawer drawer--wide" role="dialog" aria-modal="true" aria-labelledby="manual-campaign-title">
      <header class="drawer-header"><div><p class="eyebrow">Campaign record</p><h2 id="manual-campaign-title">${campaign ? "Edit Campaign" : "Create Campaign"}</h2></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
      <div class="drawer-body">
      <form class="form-stack" id="manual-campaign-form" data-campaign-editor>
        <input type="hidden" name="campaignId" value="${escapeHtml(campaign?.id || "")}" />
        ${!campaign&&state.creatorLibrary.campaignCreation?`<p>${state.creatorLibrary.campaignCreation.creatorIds.length} selected creators will be added. Outreach opens after creation.</p>`:""}
        <div class="form-row"><label><span>Campaign name</span><input name="name" maxlength="200" required value="${escapeHtml(campaign?.name || "")}" /></label><label><span>Product name</span><input name="productName" maxlength="200" ${campaign ? "" : "required"} value="${escapeHtml(campaign?.productName || "")}" /></label></div>
        <div class="form-row"><label><span>Brand name</span><input name="brandName" maxlength="200" required value="${escapeHtml(campaign?.brand || "")}" /></label><label><span>Campaign type</span><select name="campaignType">${manualOptions([["paid", "Paid"], ["seeding", "Seeding"], ["affiliate", "Affiliate"], ["other", "Other"]], campaignType)}</select></label><label><span>Status</span><select name="status">${manualOptions([["planning", "Planning"], ["active", "Active"], ["paused", "Paused"], ["closeout", "Closeout"], ["completed", "Completed"], ["cancelled", "Cancelled"]], status)}</select></label></div>
        ${campaign ? `<label><span>Owner</span><select name="ownerId">${!campaign.ownerId && campaign.sourceDetails?.owner_label === campaign.owner ? `<option value="__source_manager__" selected>${escapeHtml(campaign.owner)} (Spreadsheet)</option>` : ""}<option value="">Unassigned</option>${(campaign?.ownerOptions || []).map(owner => `<option value="${escapeHtml(owner.id)}" ${owner.id === campaign.ownerId ? "selected" : ""}>${escapeHtml(owner.name)}</option>`).join("")}</select></label>` : ""}
        <div class="form-row"><label><span>Start date</span><input name="startDate" type="date" value="${escapeHtml(campaign?.startDate || "")}" /></label><label><span>End date</span><input name="endDate" type="date" value="${escapeHtml(campaign?.endDate || "")}" /></label></div>
        <div class="form-row"><label><span>Timezone</span><input name="timezone" maxlength="120" required value="${escapeHtml(campaign?.timezone || "America/Los_Angeles")}" /></label><label><span>Currency</span><input name="currency" maxlength="3" pattern="[A-Za-z]{3}" required value="${escapeHtml(campaign?.currency || "USD")}" /></label><label><span>Budget</span><input name="budget" type="number" min="0" step="0.01" value="${Number.isFinite(campaign?.budget) ? campaign.budget : ""}" /></label></div>
        <div class="drawer-footer"><button type="button" class="button button--secondary" data-action="close-drawer">Cancel</button><button type="submit" class="button button--primary">${campaign ? "Save Campaign" : "Create Campaign"}</button></div>
      </form>
      ${campaign ? (campaign.canManageRoster ? campaignEmailSettings.render(campaign) : "") : '<p class="ces-help">Create the campaign first, then open Edit Campaign to configure its email guidance and reminder schedules.</p>'}
      </div>
    </aside>`;
};

const renderManualAssignmentsDrawer = () => {
  const campaign = campaignById(state.selectedCampaignId);
  const assignment = campaign?.assignments?.find((item) => item.id === state.editingAssignmentId) || null;
  if (!campaign) return `<div class="drawer-backdrop" data-action="close-drawer"></div><aside class="drawer" role="dialog" aria-modal="true"><header class="drawer-header"><div><p class="eyebrow">Campaign roster</p><h2>Campaign unavailable</h2></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header><div class="drawer-body"><button class="button button--secondary" data-action="close-drawer">Close</button></div></aside>`;
  if (!canManageManualCampaignRoster(campaign) || (state.editingAssignmentId && (!assignment || !canEditManualAssignment(campaign, assignment)))) {
    return renderManualPermissionDeniedDrawer("Campaign roster editing unavailable");
  }
  const assignments = campaign.assignments || [];
  const deliverable = assignment?.deliverable || {};
  const status = manualEnumValue(assignment?.status, "potential");
  const engagementType = manualEnumValue(assignment?.engagementType, "unknown");
  const recordedType = deliverable.type || manualEnumValue(deliverable.name, "");
  const deliverableTypeOptions = [["youtube_video", "YouTube Video"], ["instagram_story", "Instagram Story"], ["facebook_post", "Facebook Post"], ["instagram_reel", "Instagram Reel"], ["tiktok_video", "TikTok Short"]];
  const deliverableType = [...deliverableTypeOptions.map(([value]) => value), "other", "short_form_video", "story_set", "static_post", "cross_posting"].includes(recordedType) ? recordedType : "";
  if (deliverableType && !deliverableTypeOptions.some(([value]) => value === deliverableType)) {
    deliverableTypeOptions.unshift([deliverableType, `Keep current: ${deliverableType === "cross_posting" ? "Cross-posting on both platforms" : deliverableType.replaceAll("_", " ")}`]);
  }
  const recordedPlatform = manualEnumValue(deliverable.platform || creatorById(assignment?.creatorId)?.platforms?.[0], "instagram");
  const platformOptions = [["instagram", "Instagram"], ["tiktok", "TikTok"], ["youtube", "YouTube"], ["facebook", "Facebook"]];
  const platform = [...platformOptions.map(([value]) => value), "other", "both"].includes(recordedPlatform) ? recordedPlatform : "";
  if (platform && !platformOptions.some(([value]) => value === platform)) {
    platformOptions.unshift([platform, `Keep current: ${platform === "both" ? "Both" : "Other"}`]);
  }
  const deliverableStatus = manualEnumValue(deliverable.status, "not_started");
  const paymentState = manualEnumValue(assignment?.paymentStatus || assignment?.payment?.status, "not_required");
  const creatorPickerUnavailable = !assignment && (
    state.creatorPickerLoading || Boolean(state.creatorPickerError) || !state.creators.length
  );
  const creatorPickerMessage = state.creatorPickerLoading
    ? "Loading creators..."
    : state.creatorPickerError
      ? "Creator list unavailable. Close and reopen this roster to retry."
      : "Create a creator first";
  return `
    <div class="drawer-backdrop" data-action="close-drawer"></div>
    <aside class="drawer drawer--wide" role="dialog" aria-modal="true" aria-labelledby="manual-assignments-title">
      <header class="drawer-header"><div><p class="eyebrow">${escapeHtml(campaign.brand || "Brand not recorded")}</p><h2 id="manual-assignments-title">Manage Campaign Creators</h2><p>${escapeHtml(campaign.name)} · ${escapeHtml(campaign.productName || "Product not recorded")}</p></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
      <div class="drawer-body manual-assignment-workspace">
        <p>Use an existing imported profile without copying it or changing its history. <a href="/?view=creators">Choose existing creator</a>, select the profile, then choose this campaign.</p>
        <section>
          <div class="panel-heading"><div><p class="eyebrow">Current roster</p><h3>${assignments.length} creator${assignments.length === 1 ? "" : "s"}</h3></div><button class="button button--secondary button--small" data-action="add-campaign-assignment">Add creator</button></div>
          <div class="manual-assignment-list">${assignments.length ? assignments.map((item) => {
            const creator = creatorById(item.creatorId);
            const creatorName = creator ? creatorDisplayName(creator) : item.creatorDisplayName || "Creator unavailable";
            return `<article class="manual-assignment-row"><span><strong>${escapeHtml(creatorName)}</strong><small>${escapeHtml(item.engagementType || "Unknown")} · ${escapeHtml(item.status || "Not recorded")}</small></span><span><strong>${formatCurrency(item.rate)}</strong><small>${escapeHtml(item.paymentStatus || item.payment?.status || "Not recorded")}</small></span><span class="page-actions">${canEditManualAssignment(campaign, item) ? `<button class="button button--secondary button--small" data-action="edit-campaign-assignment" data-id="${escapeHtml(item.id)}">Edit</button><button class="button button--danger button--small" data-action="delete-campaign-assignment" data-id="${escapeHtml(item.id)}">Remove</button>` : ""}</span></article>`;
          }).join("") : `<p class="empty-copy">No creators are assigned yet.</p>`}</div>
        </section>
        <form class="form-stack manual-assignment-form" id="manual-assignment-form">
          <div class="panel-heading"><div><p class="eyebrow">${assignment ? "Edit assignment" : "Add creator"}</p><h3>${assignment ? "Assignment terms" : "New campaign creator"}</h3></div></div>
          <input type="hidden" name="assignmentId" value="${escapeHtml(assignment?.id || "")}" />
          <label><span>Creator</span><select name="creatorId" required ${assignment ? "disabled" : ""}>${assignment&&!state.creators.some(c=>c.id===assignment.creatorId)?`<option value="${escapeHtml(assignment.creatorId)}" selected>${escapeHtml(assignment.creatorDisplayName||assignment.creatorHandle||assignment.creatorId)}</option>`:state.creators.length ? state.creators.map((creator) => `<option value="${escapeHtml(creator.id)}" ${creator.id === assignment?.creatorId ? "selected" : ""}>${escapeHtml(creatorDisplayName(creator))} · ${escapeHtml(creatorSocialHandle(creator) || creator.id)}</option>`).join("") : `<option value="" selected disabled>${escapeHtml(creatorPickerMessage)}</option>`}</select>${assignment ? `<input type="hidden" name="creatorId" value="${escapeHtml(assignment.creatorId)}" />` : ""}${state.creatorPickerError ? `<small class="helper-text">${escapeHtml(state.creatorPickerError)}</small>` : ""}</label>
          <div class="form-row"><label><span>Engagement type</span><select name="engagementType">${manualOptions([["unknown", "Unknown"], ["paid", "Paid"], ["seeding", "Seeding"], ["hybrid", "Hybrid"]], engagementType)}</select></label><label><span>Assignment status</span><select name="status">${manualOptions([["potential", "Potential"], ["contacted", "Contacted"], ["negotiating", "Negotiating"], ["confirmed", "Confirmed"], ["creating", "Creating"], ["revising", "Revising"], ["approved", "Approved"], ["posted", "Posted"], ["completed", "Completed"], ["declined", "Declined"], ["unresponsive", "Unresponsive"]], status)}</select></label></div>
          <div class="form-row"><label><span>Fee amount</span><input name="feeAmount" type="number" min="0" step="0.01" value="${Number.isFinite(assignment?.rate) ? assignment.rate : ""}" /></label><label><span>Fee currency</span><input name="feeCurrency" value="USD" readonly /></label></div>
          <div class="form-stack"><label><span>Deliverable type</span><select name="deliverableType" required><option value="" disabled ${deliverableType ? "" : "selected"}>Select deliverable type</option>${manualOptions(deliverableTypeOptions, deliverableType)}</select></label><label><span>Platform</span><select name="platform" required><option value="" disabled ${platform ? "" : "selected"}>Select platform</option>${manualOptions(platformOptions, platform)}</select></label></div>
          <section class="form-stack" aria-labelledby="assignment-paid-usage-title"><h3 id="assignment-paid-usage-title">Paid usage</h3><label><span>Number of days</span><input name="paidUsageDays" type="number" min="0" max="2147483647" step="1" value="${assignment?.paidUsageDays ?? ""}" /></label></section>
          <div class="form-row"><label><span>Deliverable status</span><select name="deliverableStatus">${manualOptions([["not_started", "Not started"], ["in_progress", "In progress"], ["draft_received", "Draft received"], ["revision_requested", "Revision requested"], ["approved", "Approved"], ["posted", "Posted"], ["completed", "Completed"], ["cancelled", "Cancelled"]], deliverableStatus)}</select></label><label><span>Due date</span><input name="dueDate" type="date" value="${escapeHtml(deliverable.dueDate || deliverable.nextDueDate || "")}" /></label></div>
          <label><span>Payment state</span><select name="paymentState">${manualOptions([["not_required", "Not required"], ["not_due", "Not due"], ["approval_pending", "Approval pending"], ["cfo_approval_pending", "CFO approval pending"], ["scheduled", "Scheduled"], ["paid", "Paid"], ["overdue", "Overdue"]], paymentState)}</select></label>
          <div class="permission-callout"><strong>History remains read only</strong><span>Existing imported evidence, audit receipts, messages, posts, metrics, and prior commercial versions are not changed by this form.</span></div>
          <div class="drawer-footer"><button type="button" class="button button--secondary" data-action="close-drawer">Close</button><button type="submit" class="button button--primary" ${creatorPickerUnavailable ? "disabled" : ""}>${assignment ? "Save Assignment" : "Add Creator"}</button></div>
        </form>
      </div>
    </aside>`;
};

const campaignCommunicationItems = (campaign) => uniqueOperationRecords(
  campaign?.communicationStatus,
  campaign?.gmailThreads,
  campaign?.assignments?.flatMap((assignment) => assignment.communications || []) || [],
  campaign?.communications,
  state.crm.campaignViews[campaign?.id]?.communications
).sort((a, b) => String(b.latestMessageAt || b.date || "").localeCompare(String(a.latestMessageAt || a.date || "")));

const renderCommunicationActionDrawer = () => {
  const campaign = campaignById(state.selectedCampaignId);
  const items = campaignCommunicationItems(campaign);
  const selected = items.find((item) => (item.gmailThreadId || item.id) === state.editingGmailThreadId) || items[0];
  if (!campaign || !selected) return `<div class="drawer-backdrop" data-action="close-drawer"></div><aside class="drawer" role="dialog"><header class="drawer-header"><div><p class="eyebrow">Creator correspondence</p><h2>Set next action</h2></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header><div class="drawer-body"><div class="empty-state"><strong>No Gmail thread is linked.</strong><span>Link a thread before assigning a next action.</span></div></div></aside>`;
  return `<div class="drawer-backdrop" data-action="close-drawer"></div><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="communication-action-title"><header class="drawer-header"><div><p class="eyebrow">Creator correspondence</p><h2 id="communication-action-title">Set next action</h2></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header><form class="drawer-body form-stack" id="communication-action-form"><input type="hidden" name="campaignId" value="${escapeHtml(campaign.id)}" /><label><span>Gmail conversation</span><select name="gmailThreadId">${items.map((item) => `<option value="${escapeHtml(item.gmailThreadId || item.id)}" ${(item.gmailThreadId || item.id) === (selected.gmailThreadId || selected.id) ? "selected" : ""}>${escapeHtml(item.approvedSubject || "Gmail conversation")} &middot; ${formatDate(item.latestMessageAt || item.date)}</option>`).join("")}</select></label><label><span>Next action</span><input name="nextAction" maxlength="500" required value="${escapeHtml(isOpenCommunicationAction(selected.nextAction) ? selected.nextAction : "")}" placeholder="Example: Confirm the revised draft" /></label><label><span>Due date</span><input name="dueDate" type="date" /></label><div class="drawer-footer"><button type="button" class="button button--secondary" data-action="close-drawer">Cancel</button><button type="submit" class="button button--primary">Save next action</button></div></form></aside>`;
};

const renderRightsDrawer = () => {
  const campaign = campaignById(state.selectedCampaignId);
  const assignment = campaign?.assignments.find((item) => item.id === state.editingAssignmentId) || campaign?.assignments[0];
  const terms = assignment ? uniqueOperationRecords(recordsForAssignment(campaign, assignment, "rightsTerms"), assignment.rights) : [];
  const term = terms[0] || {};
  if (!campaign || !assignment) return `<div class="drawer-backdrop" data-action="close-drawer"></div><aside class="drawer" role="dialog"><header class="drawer-header"><div><p class="eyebrow">Campaign rights</p><h2>Update rights and ad code</h2></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header><div class="drawer-body"><div class="empty-state"><strong>No creator assignment is available.</strong><span>Add a creator to this campaign before recording usage rights.</span></div></div></aside>`;
  return `<div class="drawer-backdrop" data-action="close-drawer"></div><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="rights-title"><header class="drawer-header"><div><p class="eyebrow">Campaign rights</p><h2 id="rights-title">Update rights and ad-code expiry</h2><p>Record approved usage terms for one campaign creator. Rights and ad-code expiration are tracked separately.</p></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header><form class="drawer-body form-stack" id="rights-form"><input type="hidden" name="campaignId" value="${escapeHtml(campaign.id)}" /><label><span>Creator</span><select name="assignmentId">${campaign.assignments.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === assignment.id ? "selected" : ""}>${escapeHtml(creatorDisplayName(creatorById(item.creatorId)))}</option>`).join("")}</select></label><div class="form-row"><label><span>Rights type</span><select name="rightsType">${[["organic_repost","Organic repost"],["paid_social","Paid social"],["whitelisting","Whitelisting"],["creator_likeness","Creator likeness"],["raw_content","Raw content"],["other","Other"]].map(([value,label]) => `<option value="${value}" ${String(term.rightsType || "").toLowerCase().replaceAll(" ", "_") === value ? "selected" : ""}>${label}</option>`).join("")}</select></label><label><span>Platform</span><select name="platform">${["Instagram","TikTok","YouTube","Other"].map((value) => `<option ${String(term.platform || "").toLowerCase() === value.toLowerCase() ? "selected" : ""}>${value}</option>`).join("")}</select></label></div><label><span>Territory</span><input name="territory" maxlength="120" required value="${escapeHtml(term.territory && term.territory !== "Not recorded" ? term.territory : "United States")}" /></label><div class="form-row"><label><span>Rights start</span><input name="startsOn" type="date" value="${escapeHtml(term.startsOn || "")}" /></label><label><span>Rights expire</span><input name="expiresOn" type="date" value="${escapeHtml(term.expiresOn || term.expiresAt || "")}" /></label></div><div class="form-row"><label><span>Rights status</span><select name="status">${["draft","pending","active","expired","revoked"].map((value) => `<option value="${value}" ${String(term.status || "").toLowerCase() === value ? "selected" : ""}>${value[0].toUpperCase() + value.slice(1)}</option>`).join("")}</select></label><label><span>Ad-code status</span><select name="adCodeStatus">${["not_required","requested","received","expiring","expired","unavailable"].map((value) => `<option value="${value}" ${String(term.adCodeStatus || "").toLowerCase().replaceAll(" ", "_") === value ? "selected" : ""}>${value.replaceAll("_", " ")}</option>`).join("")}</select></label></div><label><span>Ad-code expires</span><input name="adCodeExpiresOn" type="date" value="${escapeHtml(term.adCodeExpiresAt || "")}" /></label><div class="drawer-footer"><button type="button" class="button button--secondary" data-action="close-drawer">Cancel</button><button type="submit" class="button button--primary">Save rights</button></div></form></aside>`;
};
const renderGmailDrawer = () => {
  const eligibleCampaigns = isLiveMode()
    ? state.campaigns.filter((campaign) => canUseAction("link_gmail", campaign))
    : state.campaigns;
  return `
  <div class="drawer-backdrop" data-action="close-drawer"></div>
  <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="gmail-title">
    <header class="drawer-header"><div><p class="eyebrow">Gmail</p><h2 id="gmail-title">Link Gmail thread</h2></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
    <form class="drawer-body form-stack" id="gmail-form">
      <label><span>Creator</span><select name="creatorId">${state.creators.map((creator) => `<option value="${creator.id}">${escapeHtml(creatorDisplayName(creator))}${creator.displayName && creator.handle && creator.displayName.trim().toLowerCase() !== creator.handle.trim().toLowerCase() ? ` (${escapeHtml(creator.handle)})` : ""}</option>`).join("")}</select></label>
      <label><span>Campaign</span><select name="campaignId">${eligibleCampaigns.map((campaign) => `<option value="${campaign.id}">${escapeHtml(campaign.name)}</option>`).join("")}</select></label>
      <label><span>Gmail thread URL</span><input name="url" type="url" required placeholder="https://mail.google.com/mail/u/0/#..." /></label>
      <label><span>Approved subject metadata</span><input name="approvedSubject" maxlength="240" placeholder="Optional subject line; no email addresses or contact details" /></label>
      <div class="form-row"><label><span>Gmail thread ID</span><input name="threadId" required placeholder="Thread identifier from the approved Gmail link" /></label><label><span>Latest-message date</span><input name="latestDate" type="date" required /></label></div>
      <label><span>Communication milestone</span><select name="milestone"><option>Outreach sent</option><option>Rate negotiation</option><option>Terms agreed</option><option>Brief sent</option><option>Revision requested</option><option>Post confirmed</option><option>Payment follow-up</option></select></label>
      <label><span>Next action</span><input name="nextAction" required /></label>
      <div class="drawer-footer"><button type="button" class="button button--secondary" data-action="close-drawer">Cancel</button><button type="submit" class="button button--primary">Link thread metadata</button></div>
    </form>
  </aside>`;
};

const renderCreatorGmailDrawer = () => {
  const creator = creatorById(state.linkingGmailCreatorId || state.selectedCreatorId);
  if (!creator || !canLinkCreatorGmail(creator)) {
    return `<div class="drawer-backdrop" data-action="close-drawer"></div><aside class="drawer" role="dialog" aria-modal="true"><header class="drawer-header"><div><p class="eyebrow">Creator Gmail</p><h2>Creator unavailable</h2></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header><div class="drawer-body"><div class="empty-state"><strong>This creator cannot be updated.</strong><span>Nothing has been changed.</span></div></div></aside>`;
  }
  const history = creatorHistory(creator.id);
  const eligibleHistory = history.filter(({campaign, assignment}) => canEditManualCreator(creator)
    || (assignment?.continuationAdopted && assignment?.canManageContinuation)
    || (creator.managedImportCampaignIds?.includes(campaign.id) && assignment?.canEdit === true));
  const campaignOptions = eligibleHistory.filter(({ campaign }, index, items) =>
    items.findIndex((item) => item.campaign.id === campaign.id) === index
  );
  const today = new Date().toISOString().slice(0, 10);
  return `
  <div class="drawer-backdrop" data-action="close-drawer"></div>
  <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="creator-gmail-title">
    <header class="drawer-header"><div><p class="eyebrow">Creator communication</p><h2 id="creator-gmail-title">Link Gmail conversation</h2><p>${escapeHtml(creatorDisplayName(creator))}</p></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
    <form class="drawer-body form-stack" id="creator-gmail-form">
      <p class="helper-text">Add one Gmail conversation at a time. Only the Gmail link and approved operational metadata are stored; message bodies and participants remain in Gmail.</p>
      <label><span>Campaign</span><select name="campaignId" ${canEditManualCreator(creator)?'':'required'}><option value="">${canEditManualCreator(creator)?'General creator relationship (no campaign)':'Select a campaign'}</option>${campaignOptions.map(({ campaign }) => `<option value="${escapeHtml(campaign.id)}">${escapeHtml(campaign.name)}</option>`).join("")}</select><small>Only campaigns already assigned to this creator can be selected.</small></label>
      <label><span>Gmail conversation link</span><input name="gmailPermalink" type="url" required maxlength="2048" placeholder="https://mail.google.com/mail/u/0/#inbox/..." /></label>
      <label><span>Approved subject</span><input name="approvedSubject" maxlength="240" placeholder="Optional subject; do not include contact details" /></label>
      <div class="form-row"><label><span>Latest-message date</span><input name="latestMessageOn" type="date" max="${today}" value="${today}" required /></label><label><span>Milestone</span><select name="milestoneType"><option value="general_relationship">General relationship</option><option value="outreach_sent">Outreach sent</option><option value="rate_negotiation">Rate negotiation</option><option value="terms_agreed">Terms agreed</option><option value="brief_sent">Brief sent</option><option value="revision_requested">Revision requested</option><option value="post_confirmed">Post confirmed</option><option value="payment_follow_up">Payment follow-up</option></select></label></div>
      <label><span>Next action</span><input name="nextAction" maxlength="500" placeholder="Optional follow-up action; do not include contact details" /></label>
      <div class="drawer-footer"><button type="button" class="button button--secondary" data-action="close-drawer">Cancel</button><button type="submit" class="button button--primary">Link Gmail conversation</button></div>
    </form>
  </aside>`;
};

const renderSearchDrawer = () => {
  const queryValue = state.searchQuery.trim().toLowerCase();
  const matches = (...values) => !queryValue || values.some((value) => String(value || "").toLowerCase().includes(queryValue));
  const campaignResults = state.campaigns.filter((campaign) => matches(campaign.name, campaign.client, campaign.brand, campaign.type)).slice(0, 5);
  const creatorResults = state.creators.filter((creator) => matches(
    creatorDisplayName(creator),
    creator.handle,
    (creator.aliases || []).join(" "),
    creator.byouCode,
    creator.platforms?.join(" ")
  )).slice(0, 5);
  const clientResults = unique(state.campaigns.flatMap((campaign) => [campaign.client, campaign.brand])).filter((name) => matches(name)).slice(0, 5);
  const deliverableResults = state.campaigns.flatMap((campaign) => campaign.assignments.flatMap((assignment) => {
    const creator = creatorById(assignment.creatorId);
    const deliverables = assignment.deliverables?.length ? assignment.deliverables : [assignment.deliverable];
    return deliverables.map((deliverable) => ({ campaign, assignment, creator, deliverable }));
  })).filter((item) => matches(item.deliverable?.name, item.deliverable?.status, creatorDisplayName(item.creator), item.creator?.handle, item.campaign.name)).slice(0, 5);
  const postResults = state.campaigns.flatMap((campaign) => campaign.assignments.filter((assignment) => assignment.post).map((assignment) => ({ campaign, assignment, creator: creatorById(assignment.creatorId) }))).filter((item) => matches(creatorDisplayName(item.creator), item.creator?.handle, item.campaign.name, item.assignment.post?.platform)).slice(0, 5);
  const agencyResults = state.sources.filter((source) => /agency|network|seeding/i.test(`${source.name} ${source.type} ${source.category}`) && matches(source.name, source.owner)).slice(0, 5);
  const reportResults = state.campaigns.filter((campaign) => campaign.reportId && matches(campaign.name, campaign.reportId, campaign.reportStatus)).slice(0, 5);
  const group = (title, items, renderItem) => `<section class="search-group"><h3>${title}<span>${items.length}</span></h3>${items.length ? items.map(renderItem).join("") : `<p>No matching ${title.toLowerCase()}.</p>`}</section>`;
  return `
    <div class="drawer-backdrop" data-action="close-drawer"></div>
    <aside class="drawer drawer--search" role="dialog" aria-modal="true" aria-labelledby="search-title">
      <header class="search-header"><label>${icon("search")}<input id="global-search-input" data-field="global-search" value="${escapeHtml(state.searchQuery)}" placeholder="Search BYOU IQ" autocomplete="off" /></label><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
      <div class="search-results">
        ${group("Campaigns", campaignResults, (campaign) => `<button data-action="open-campaign" data-id="${campaign.id}"><span><strong>${escapeHtml(campaign.name)}</strong><small>${escapeHtml(campaign.client)} · ${escapeHtml(campaign.type)}</small></span>${badge(campaign.status)}</button>`)}
        ${group("Creators", creatorResults, (creator) => `<button data-action="open-creator" data-id="${creator.id}"><span class="creator-cell">${avatar(creator, "small")}<span><strong>${escapeHtml(creatorDisplayName(creator))}</strong><small>${escapeHtml(creatorIdentityMeta(creator, { includeTier: false }))}</small></span></span><span class="row-arrow">&#8594;</span></button>`)}
        ${group("Clients and brands", clientResults, (name) => { const campaign = state.campaigns.find((item) => item.client === name || item.brand === name); return `<button data-action="open-campaign" data-id="${campaign.id}"><span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(campaign.client === name ? "Client" : "Brand")}</small></span><span class="row-arrow">&#8594;</span></button>`; })}
        ${group("Deliverables", deliverableResults, (item) => `<button data-action="open-campaign-section" data-id="${item.campaign.id}" data-tab="deliverables"><span><strong>${escapeHtml(item.deliverable?.name || "Campaign deliverable")}</strong><small>${escapeHtml(creatorDisplayName(item.creator))} · ${escapeHtml(item.campaign.name)}</small></span>${badge(item.deliverable?.status || "Not started")}</button>`)}
        ${group("Posts", postResults, (item) => `<button data-action="open-campaign-section" data-id="${item.campaign.id}" data-tab="reporting"><span><strong>${escapeHtml(creatorDisplayName(item.creator))}</strong><small>${escapeHtml(item.assignment.post.platform)} · ${escapeHtml(item.campaign.name)}</small></span>${badge(item.assignment.post.verified ? "Verified" : "Unverified")}</button>`)}
        ${group("Agencies", agencyResults, (source) => `<button data-action="select-source" data-id="${source.id}"><span><strong>${escapeHtml(source.name)}</strong><small>${escapeHtml(source.owner)} · ${escapeHtml(source.status)}</small></span><span class="row-arrow">&#8594;</span></button>`)}
        ${group("Reports", reportResults, (campaign) => `<button data-action="open-report" data-id="${campaign.reportId}"><span><strong>${escapeHtml(campaign.name)}</strong><small>${escapeHtml(campaign.reportId)}</small></span>${badge(campaign.reportStatus)}</button>`)}
      </div>
    </aside>`;
};

const renderContentReviewDrawer = () => {
  const record = assignmentById(state.editingAssignmentId);
  if (!record) return "";
  const { campaign, assignment } = record;
  const creator = creatorById(assignment.creatorId);
  const deliverables = assignment.deliverables?.length ? assignment.deliverables : [assignment.deliverable];
  const deliverable = deliverables.find((item) => item.id === state.editingDeliverableId) || deliverables[0];
  const versions = deliverable?.versions || [];
  const activeVersion = versions.at(-1);
  const complianceReview = asOperationArray(assignment.complianceReviews)
    .filter((item) => !item.deliverableId || item.deliverableId === deliverable?.id)
    .sort((a, b) => String(b.reviewedAt || "").localeCompare(String(a.reviewedAt || "")))[0];
  const reviewLinks = asOperationArray(assignment.reviewLinks)
    .filter((item) => !item.contentVersionId || item.contentVersionId === activeVersion?.id);
  const createdLink = activeVersion ? state.createdReviewLinks[activeVersion.id] : null;
  const materialConnection = String(complianceReview?.materialConnection || campaign.type || "Other").toLowerCase();
  const disclosureStatus = String(complianceReview?.disclosureStatus || "Pending").toLowerCase().replaceAll(" ", "_");
  const disclosureMethod = String(complianceReview?.disclosureMethod || "").toLowerCase().replaceAll(" ", "_");
  const reviewLinkExpiry = new Date(Date.now() + (7 * 86_400_000)).toISOString().slice(0, 16);
  const disclosureStatusOptions = ["pending", "verified", "missing"];
  const disclosureMethodOptions = [
    ["", "Not reviewed yet"],
    ["caption", "Caption"],
    ["visible_in_content", "Visible in content"],
    ["platform_label", "Platform label"],
    ["multiple", "Multiple methods"]
  ];
  return `
    <div class="drawer-backdrop" data-action="close-drawer"></div>
    <aside class="drawer drawer--review" role="dialog" aria-modal="true" aria-labelledby="content-review-title">
      <header class="drawer-header"><div><p class="eyebrow">Content review</p><h2 id="content-review-title">${escapeHtml(deliverable?.name || "Deliverable")}</h2><p>${escapeHtml(creatorDisplayName(creator))} · ${escapeHtml(campaign.name)}</p></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
      <div class="review-workspace">
        <section class="media-review"><div class="media-stage"><span class="play-control" aria-hidden="true">&#9654;</span><strong>${activeVersion ? escapeHtml(activeVersion.label) : "No content uploaded"}</strong><small>${activeVersion ? `${escapeHtml(activeVersion.source)} · ${formatDate(activeVersion.createdAt)}` : "Upload a file or attach an approved Google Drive link"}</small></div><div class="video-timeline"><span></span><button style="left:38%" title="Feedback at 00:18">00:18</button></div></section>
        <aside class="review-sidebar"><div class="review-status"><span>Current status</span>${badge(deliverable?.status || "Not started")}${deliverable?.approvedVersion ? `<small>${escapeHtml(deliverable.approvedVersion)} is the approved version</small>` : ""}</div><div class="version-list"><h3>Version history</h3>${versions.length ? versions.slice().reverse().map((version) => `<div class="version-row ${version.id === deliverable.approvedVersion ? "is-approved" : ""}"><span><strong>${escapeHtml(version.label)}</strong><small>${formatDate(version.createdAt)} · ${escapeHtml(version.source)}</small></span>${version.id === deliverable.approvedVersion ? badge("Approved") : badge(version.status, "neutral")}</div>${(version.comments || []).map((comment) => `<div class="timestamp-comment"><strong>${escapeHtml(comment.at)}</strong><p>${escapeHtml(comment.text)}</p><small>${escapeHtml(comment.author)}</small></div>`).join("")}`).join("") : `<p class="empty-copy">No versions uploaded yet.</p>`}</div></aside>
      </div>
      <div class="review-controls">
        <section class="review-control-card">
          <div class="review-control-heading"><div><p class="eyebrow">Required campaign check</p><h3>Disclosure review</h3></div>${badge(complianceReview?.disclosureStatus || "Pending")}</div>
          <form class="form-stack compact-form" id="compliance-review-form">
            <input type="hidden" name="campaignId" value="${escapeHtml(campaign.id)}" />
            <input type="hidden" name="assignmentId" value="${escapeHtml(assignment.id)}" />
            <input type="hidden" name="attributionId" value="${escapeHtml(assignment.post?.attributionId || "")}" />
            <label><span>Material connection</span><select name="materialConnection"><option value="paid" ${materialConnection === "paid" ? "selected" : ""}>Paid</option><option value="seeding" ${materialConnection === "seeding" ? "selected" : ""}>Seeding</option><option value="other" ${materialConnection === "other" ? "selected" : ""}>Other</option></select></label>
            <div class="form-row"><label><span>Disclosure status</span><select name="disclosureStatus">${disclosureStatusOptions.map((value) => `<option value="${value}" ${disclosureStatus === value ? "selected" : ""}>${value === "verified" ? "Verified" : value === "missing" ? "Missing" : "Pending"}</option>`).join("")}</select></label><label><span>Disclosure method</span><select name="disclosureMethod">${disclosureMethodOptions.map(([value, label]) => `<option value="${value}" ${disclosureMethod === value ? "selected" : ""}>${label}</option>`).join("")}</select></label></div>
            <label><span>Evidence note</span><textarea name="evidenceNote" rows="2" maxlength="1000" placeholder="Required when disclosure is missing">${escapeHtml(complianceReview?.evidenceNote || "")}</textarea></label>
            <button type="submit" class="button button--secondary" ${assignment.post?.attributionId && assignment.post?.verified ? "" : "disabled title=\"Link and verify an exact post first\""}>${assignment.post?.attributionId && assignment.post?.verified ? "Save disclosure review" : "Verified exact post required"}</button>
          </form>
        </section>
        <section class="review-control-card">
          <div class="review-control-heading"><div><p class="eyebrow">Outside reviewer</p><h3>Expiring content approval</h3></div>${reviewLinks.length ? badge(reviewLinks[0].status || "Active") : badge("Not shared", "neutral")}</div>
          <p>Send this content version for approval.</p>
          ${reviewLinks.length ? `<div class="review-link-history">${reviewLinks.map((link) => `<span><strong>${escapeHtml(link.status || "Active")}</strong><small>Expires ${formatDate(link.expiresAt)}${link.decision && link.decision !== "Not Decided" ? ` · ${escapeHtml(link.decision)}` : ""}</small></span>`).join("")}</div>` : ""}
          <label><span>Link expiration</span><input id="review-link-expires" type="datetime-local" value="${reviewLinkExpiry}" /></label>
          <button type="button" class="button button--primary" data-action="create-approval-link" ${activeVersion ? "" : "disabled title=\"Upload a content version first\""}>Create approval link</button>
          ${createdLink?.url ? `<div class="created-review-link"><label><span>${createdLink.demo ? "Demo link" : "Approval link"}</span><input readonly value="${escapeHtml(createdLink.url)}" /></label><button type="button" class="text-button" data-action="copy-review-link" data-version="${escapeHtml(activeVersion.id)}">Copy link</button></div>` : createdLink ? `<p class="review-link-message">Approval link unavailable. Refresh and try again.</p>` : ""}
        </section>
      </div>
      <footer class="drawer-footer review-footer"><button class="button button--secondary" data-action="upload-version">Upload version / Drive link</button><span></span><button class="button button--secondary" data-action="review-status" data-status="Revising">Move to Revising</button><button class="button button--primary" data-action="review-status" data-status="Approved" ${activeVersion ? "" : "disabled title=\"Upload a version before approval\""}>${activeVersion ? "Approve version" : "Upload version to approve"}</button></footer>
    </aside>`;
};

const renderShippingDrawer = () => {
  const record = assignmentById(state.editingAssignmentId);
  if (!record) return "";
  const { campaign, assignment } = record;
  const creator = creatorById(assignment.creatorId);
  const shipment = assignment.shipments?.[0];
  return `
    <div class="drawer-backdrop" data-action="close-drawer"></div><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="shipping-title"><header class="drawer-header"><div><p class="eyebrow">Product fulfillment</p><h2 id="shipping-title">Shipment details</h2><p>${escapeHtml(creatorDisplayName(creator))} · ${escapeHtml(campaign.name)}</p></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header><div class="drawer-body"><dl class="definition-list"><div><dt>Product / quantity</dt><dd>${escapeHtml(shipment?.product || "Not recorded")} · ${shipment?.quantity || "—"}</dd></div><div><dt>Status</dt><dd>${escapeHtml(shipment?.status || "Not started")}</dd></div><div><dt>Carrier</dt><dd>${escapeHtml(shipment?.carrier || "Not recorded")}</dd></div><div><dt>Shipment deadline</dt><dd>${shipment?.shipBy ? formatDate(shipment.shipBy) : "Not recorded"}</dd></div><div><dt>Expected delivery</dt><dd>${shipment?.expectedDeliveryDate ? formatDate(shipment.expectedDeliveryDate) : "Not recorded"}</dd></div><div><dt>Shipping owner</dt><dd>${escapeHtml(shipment?.owner || "Unassigned")}</dd></div></dl></div><footer class="drawer-footer"><button class="button button--secondary" data-action="close-drawer">Close</button><button class="button button--primary" data-action="shipping-update" ${isLiveMode() ? "disabled title=\"Shipment updates are not available\"" : ""}>${isLiveMode() ? "Update unavailable" : "Simulate shipment update"}</button></footer></aside>`;
};

const renderReportBuilderDrawer = () => {
  const campaign = campaignById(state.selectedCampaignId);
  const versions = reportVersionsForCampaign(campaign?.id);
  const reportSectionControls = state.reportModuleOrder.map((module, index) => `<label><span class="drag-handle" aria-hidden="true">${index + 1}</span><input type="checkbox" data-report-module value="${escapeHtml(module)}" ${state.reportModuleVisibility[module] ? "checked" : ""} /><span><strong>${escapeHtml(module === "Verified platform performance" ? "Platform performance" : module)}</strong><small>${state.reportModuleVisibility[module] ? "Included" : "Excluded"}</small></span><button type="button" class="text-button" data-action="move-report-module" data-index="${index}" ${index === state.reportModuleOrder.length - 1 ? "disabled" : ""}>Move down</button></label>`).join("");
  const reportMetricControls = `<div class="report-metric-controls"><h3>Metrics</h3>${reportBuilderMetrics.map((metric) => `<label><input type="checkbox" data-report-metric value="${escapeHtml(metric)}" ${state.reportMetricVisibility[metric] ? "checked" : ""} /><span>${escapeHtml(metric)}</span></label>`).join("")}</div>`;
  const versionRows = versions.length ? versions.slice().reverse().map((version) => `<div><span><strong>${escapeHtml(version.id)}</strong><small>${formatDate(String(version.publishedAt).slice(0, 10))} · ${escapeHtml(version.branding || "BYOU + client")} · expires ${version.expiresAt || version.expiration ? formatDate(String(version.expiresAt || version.expiration).slice(0, 10)) : "not set"}</small></span>${version.revokedAt ? badge("Revoked", "warn") : `<button type="button" class="text-button" data-action="revoke-crm-artifact" data-artifact="report" data-version="${escapeHtml(version.id)}">Revoke</button>`}</div>`).join("") : `<p class="empty-copy">No report version has been published.</p>`;
  // const renderPrivateCreatorDrawer marks the tested report-builder action boundary.
  return `<div class="drawer-backdrop" data-action="close-drawer"></div><aside class="drawer drawer--wide" role="dialog" aria-modal="true" aria-labelledby="report-builder-title"><header class="drawer-header"><div><p class="eyebrow">Report builder</p><h2 id="report-builder-title">Configure ${escapeHtml(campaign?.name || "report")}</h2></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header><div class="drawer-body report-builder"><div class="report-builder-list"><h3>Report sections</h3>${reportSectionControls}</div><aside><h3>Published version</h3><label><span>Branding</span><select data-report-branding>${["BYOU + client", "BYOU only", "Client only"].map((value) => `<option ${state.reportBuilderBranding === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label><span>Expiration date</span><input type="date" data-report-expiration value="${escapeHtml(state.reportBuilderExpiration)}" /></label>${reportMetricControls}<div class="published-version-list"><h3>Published versions</h3>${versionRows}</div></aside></div><footer class="drawer-footer"><button class="button button--secondary" data-action="close-drawer">Cancel</button><button class="button button--secondary" data-action="download-report" data-id="${escapeHtml(campaign?.reportId || "")}">Download live preview</button><button class="button button--primary" data-action="publish-report-version" ${state.crm.loading || state.crm.error ? "disabled" : ""}>Publish version</button></footer></aside>`;
};

const renderPrivateCreatorDrawer = () => {
  const creator = creatorById(state.selectedCreatorId) || state.creators[0];
  if (!creator) return "";
  if (state.privateCreatorLoading) return `
    <div class="drawer-backdrop" data-action="close-drawer"></div>
    <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="private-creator-title">
      <header class="drawer-header"><div><p class="eyebrow">Private creator details</p><h2 id="private-creator-title">Creator contact and shipping</h2></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
      <div class="drawer-body"><div class="empty-state"><strong>Opening creator details…</strong></div></div>
    </aside>`;
  const record = state.privateCreatorRecord || {
    profile: {
      creatorId: creator.sourceRecordId || creator.id,
      recipientName: null,
      contactEmail: null,
      phone: null,
      addressSourceText: null,
      addressLine1: null,
      addressLine2: null,
      city: null,
      region: null,
      postalCode: null,
      countryCode: "US",
      contactStatus: "unverified",
      emailOptOut: false,
      version: 0
    },
    socialAccounts: { status: "not_loaded", items: [], totalCount: 0, truncated: false }
  };
  const profile = record.profile || {};
  const socialAccounts = record.socialAccounts && typeof record.socialAccounts === "object"
    ? record.socialAccounts
    : { status: "unavailable", items: [], totalCount: null, truncated: false };
  const socialAccountItems = Array.isArray(socialAccounts.items) ? socialAccounts.items : [];
  return `
    <div class="drawer-backdrop" data-action="close-drawer"></div>
    <aside class="drawer drawer--wide" role="dialog" aria-modal="true" aria-labelledby="private-creator-title">
      <header class="drawer-header"><div><p class="eyebrow">Private creator details</p><h2 id="private-creator-title">Creator contact and shipping</h2><p>${escapeHtml(creatorDisplayName(creator))}</p></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
      <div class="drawer-body private-creator-layout">
        ${state.privateCreatorError ? `<div class="permission-callout"><strong>Private record unavailable</strong><span>${escapeHtml(state.privateCreatorError)}</span></div>` : ""}
        <section class="form-stack">
          <div class="panel-heading"><div><p class="eyebrow">Creator identity</p><h3>Social accounts</h3></div><span class="helper-text">${Number.isInteger(socialAccounts.totalCount) ? `${socialAccounts.totalCount} linked account${socialAccounts.totalCount === 1 ? "" : "s"}` : "Availability unknown"}</span></div>
          ${socialAccounts.status === "unavailable"
            ? `<div class="empty-state"><strong>Social accounts are unavailable.</strong><span>The private profile opened, but the linked account list could not be checked right now.</span></div>`
            : socialAccountItems.length
              ? `<div class="representation-list">${socialAccountItems.map((account) => `
                  <article>
                    <span><strong>${escapeHtml(account.normalizedHandle || account.platform || "Social account")}</strong><small>${escapeHtml(account.platform || "Platform not recorded")}${Number.isFinite(account.followerCount) ? ` &middot; ${formatCompact(account.followerCount)} followers` : ""}</small></span>
                    <span>${badge(account.status || "Unknown", "neutral")}<a class="external-link" href="${escapeHtml(account.canonicalProfileUrl)}" target="_blank" rel="noopener noreferrer">Open profile &#8599;</a></span>
                  </article>`).join("")}</div>`
              : `<div class="empty-state"><strong>No linked social accounts.</strong><span>Add or verify a social profile before platform-specific planning.</span></div>`}
          ${socialAccounts.truncated ? `<div class="permission-callout"><strong>Additional accounts exist</strong><span>This view reached its 200-account safety limit. An administrator should review the identity record.</span></div>` : ""}
        </section>
        <form class="form-stack" id="private-profile-form">
          <input type="hidden" name="version" value="${Number(profile.version || 0)}" />
          <div class="panel-heading"><div><p class="eyebrow">Private contact</p><h3>Contact and shipping details</h3></div></div>
          <div class="form-grid two-column">
            <label class="field-wide"><span>Recipient name</span><input name="recipientName" maxlength="200" value="${escapeHtml(profile.recipientName || "")}" autocomplete="off" /></label>
            <label><span>Contact email</span><input type="email" name="contactEmail" maxlength="320" value="${escapeHtml(profile.contactEmail || "")}" autocomplete="off" /></label>
            <label><span>Phone</span><input name="phone" maxlength="40" value="${escapeHtml(profile.phone || "")}" autocomplete="off" /></label>
            <label class="field-wide"><span>Original address text</span><textarea name="addressSourceText" maxlength="1000" rows="2" autocomplete="off">${escapeHtml(profile.addressSourceText || "")}</textarea><small>Optional copy of the address exactly as you received or entered it.</small></label>
            <label class="field-wide"><span>Address line 1</span><input name="addressLine1" maxlength="240" value="${escapeHtml(profile.addressLine1 || "")}" autocomplete="off" /></label>
            <label class="field-wide"><span>Address line 2</span><input name="addressLine2" maxlength="240" value="${escapeHtml(profile.addressLine2 || "")}" autocomplete="off" /></label>
            <label><span>City</span><input name="city" maxlength="120" value="${escapeHtml(profile.city || "")}" autocomplete="off" /></label>
            <label><span>State / region</span><input name="region" maxlength="120" value="${escapeHtml(profile.region || "")}" autocomplete="off" /></label>
            <label><span>Postal code</span><input name="postalCode" maxlength="32" value="${escapeHtml(profile.postalCode || "")}" autocomplete="off" /></label>
            <label><span>Country code</span><input name="countryCode" maxlength="2" value="${escapeHtml(profile.countryCode || "US")}" autocomplete="off" /></label>
            <label><span>Contact status</span><select name="contactStatus">${[
              ["unverified", "Unverified"], ["verified", "Verified"], ["invalid", "Invalid"], ["do_not_contact", "Do not contact"]
            ].map(([value, label]) => `<option value="${value}" ${profile.contactStatus === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>
            <label class="checkbox-row"><input type="checkbox" name="emailOptOut" ${profile.emailOptOut ? "checked" : ""} /><span>Email opt-out</span></label>
          </div>
          <div class="drawer-footer inline-footer"><span></span><button type="submit" class="button button--primary" ${isLiveMode() ? "" : "disabled title=\"Private records require the signed-in production workspace\""}>Save private profile</button></div>
        </form>
      </div>
  </aside>`;
};

const assistedImportStatusLabel = (value, lastErrorCode = null) => {
  if (
    value === "failed"
    && lastErrorCode === "google_drive_content_scope_required"
  ) {
    return "Google Drive permission update required";
  }
  return ({
  requested: "Waiting for Railway",
  staging: "Scanning and redacting",
  ready_for_enrichment: "Ready for Codex",
  enriching: "Codex pass in progress",
  ready_for_review: "Ready for staff review",
  completed: "Completed",
  blocked: "Pilot gate blocked",
  failed: "Needs administrator attention",
  cancelled: "Cancelled"
  })[value] || "Not started";
};

const assistedImportFactValue = (value) => {
  if (value == null) return "Not available";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    const serialized = JSON.stringify(value);
    return serialized.length > 600 ? `${serialized.slice(0, 597)}...` : serialized;
  } catch {
    return "Structured value";
  }
};

const assistedImportApplicationLabel = (fact) => {
  if (fact?.applicationTier === "assumed") return "Assumed";
  return fact?.sourceSupport === "inferred" ? "Accepted inferred" : "Accepted evidence";
};

const assistedImportEvidenceSummary = (records) => {
  const facts = Array.isArray(records) ? records : [];
  const assumed = facts.filter((fact) => fact?.applicationTier === "assumed").length;
  const accepted = facts.length - assumed;
  if (!assumed) return `${accepted} accepted fact${accepted === 1 ? "" : "s"}`;
  return `${accepted} accepted · ${assumed} assumed`;
};

const assistedImportCorroborationLabel = (fact) => {
  const count = Number(fact?.corroboratingSourceCount || 1);
  return count > 1 ? `${count} corroborating sources` : "1 supporting source";
};

const assistedImportRelationshipLabel = (value) => ({
  contacted: "Contacted",
  accepted: "Accepted",
  activated: "Activated",
  completed: "Completed",
  closed_incomplete: "Closed incomplete",
  unknown: "Type not established",
  paid: "Paid",
  seeding: "Seeding",
  hybrid: "Hybrid"
})[value] || "Not available";

const assistedImportRelationshipRate = (relationship) => {
  if (relationship?.rateAmount == null || !Number.isFinite(Number(relationship.rateAmount))) {
    return null;
  }
  const currency = /^[A-Z]{3}$/.test(String(relationship.rateCurrency || ""))
    ? String(relationship.rateCurrency)
    : "USD";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2
    }).format(Number(relationship.rateAmount));
  } catch {
    return `${currency} ${Number(relationship.rateAmount).toLocaleString("en-US")}`;
  }
};

const assistedImportRelationshipSourceDate = (value) => {
  const date = typeof value === "string" ? value.slice(0, 10) : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  try {
    return formatDate(date);
  } catch {
    return "";
  }
};

const assistedImportGoogleSourceUrl = (value) => (
  typeof value === "string"
  && /^https:\/\/(?:drive|docs|mail)\.google\.com\//i.test(value)
  ? value
  : null
);

const ASSISTED_IMPORT_SUMMARY_TARGET_TYPES = [
  "creator", "campaign", "brand", "product", "agency", "manager",
  "assignment", "post"
];

const assistedImportSummaryCount = (value) => {
  const count = Number(value);
  return Number.isInteger(count) && count >= 0 ? count : 0;
};

const renderAssistedImportOperationalCompleteness = (completeness) => {
  if (!completeness || typeof completeness !== "object" || completeness.status !== "available") {
    if (!isLiveMode()) return "";
    return `<div class="permission-callout permission-callout--warn assisted-import-operational-completeness-unavailable"><strong>Readiness unavailable</strong><span>Refresh Import &amp; Sync.</span></div>`;
  }
  const evidenceComplete = completeness.evidenceProcessingComplete === true;
  const sourceReconciliationComplete = completeness.sourceReconciliationComplete === true;
  const operationalGatePassed = completeness.operationalCompletenessGatePassed === true;
  const reactivationPoolCreators = assistedImportSummaryCount(
    completeness.reactivationPoolCreators
  );
  const operationallyCompleteCreators = assistedImportSummaryCount(
    completeness.operationallyCompleteCreators
  );
  const operationalCohortCreators = assistedImportSummaryCount(
    completeness.operationalCohortCreators
  ) || reactivationPoolCreators;
  const operationalCoverage = operationalCohortCreators > 0
    ? Math.min(100, (operationallyCompleteCreators / operationalCohortCreators) * 100)
    : 0;
  const operationalCoverageLabel = `${operationalCoverage.toFixed(1).replace(/\.0$/, "")}%`;
  const remainingSourceExceptions = assistedImportSummaryCount(
    completeness.pendingAuthoritativeProofs
  ) + assistedImportSummaryCount(completeness.activeRedirectedShells);
  const optionalCountCards = [
    ["identityProofInvalidCacheRows", "Invalid identity proof cache rows"],
    ["campaignHistoryUnclassified", "Campaign history not classified"],
    ["operationalCohortCreators", "Operational cohort profiles"],
    ["reactivationMissingActivationAccessOnly", "Missing activation access only"],
    ["reactivationMissingCommercialHistoryOnly", "Missing commercial history only"],
    ["reactivationMissingBoth", "Missing both activation and commercial history"],
    ["ambiguousIdentityReconciliations", "Ambiguous identity reconciliations revoked"]
  ].filter(([key]) => Object.hasOwn(completeness, key)).map(([key, label]) =>
    `<div><span>${label}</span><strong>${assistedImportSummaryCount(completeness[key]).toLocaleString()}</strong></div>`
  ).join("");
  const optionalIdentityProofCards = [
    ["identityProofCacheCurrent", "Identity proof cache current"],
    ["identityProofSourceSnapshotCurrent", "Identity source snapshot current"]
  ].filter(([key]) => Object.hasOwn(completeness, key)).map(([key, label]) =>
    `<div><span>${label}</span><strong>${completeness[key] === true ? "Yes" : "No"}</strong></div>`
  ).join("");
  const identityProofWarning = completeness.identityProofCacheCurrent === false
    || completeness.identityProofSourceSnapshotCurrent === false
    || assistedImportSummaryCount(completeness.identityProofInvalidCacheRows) > 0;
  return `
    <div class="assisted-import-review assisted-import-operational-completeness">
      <div class="admin-section-heading">
        <div><h3>CRM readiness</h3></div>
        <span class="status-chip">${operationalGatePassed ? "Default reactivation pool validated" : "Operational gaps remain"}</span>
      </div>
      ${identityProofWarning ? `<div class="permission-callout permission-callout--warn"><strong>Identity review needed</strong><span>Resolve the flagged identity records before continuing.</span></div>` : ""}
      <div class="import-status-card assisted-import-count-grid">
        <div><span>Operational coverage of campaign-backed profiles</span><strong>${operationalCoverageLabel}</strong></div>
        <div><span>Reactivation pool profiles</span><strong>${reactivationPoolCreators.toLocaleString()}</strong></div>
        <div><span>Operationally complete profiles</span><strong>${operationallyCompleteCreators.toLocaleString()}</strong></div>
        <div><span>Reactivation profiles with gaps</span><strong>${assistedImportSummaryCount(completeness.reactivationPoolIncompleteCreators).toLocaleString()}</strong></div>
        <div><span>Ready for reactivation</span><strong>${assistedImportSummaryCount(completeness.activationReadyCreators).toLocaleString()}</strong></div>
        <div><span>History retained, activation details incomplete</span><strong>${assistedImportSummaryCount(completeness.historyOnlyCreators).toLocaleString()}</strong></div>
        <div><span>Needs enrichment</span><strong>${assistedImportSummaryCount(completeness.needsEnrichmentCreators ?? completeness.historyOnlyCreators).toLocaleString()}</strong></div>
        <div><span>Unqualified / provisional</span><strong>${assistedImportSummaryCount(completeness.unqualifiedProvisionalCreators).toLocaleString()}</strong></div>
        <div><span>Total surviving creator profiles</span><strong>${assistedImportSummaryCount(completeness.totalSurvivingCreators).toLocaleString()}</strong></div>
        <div><span>Campaign history available</span><strong>${assistedImportSummaryCount(completeness.campaignHistoryAvailable).toLocaleString()}</strong></div>
        <div><span>Paid / seeding classified</span><strong>${assistedImportSummaryCount(completeness.collaborationClassificationAvailable).toLocaleString()}</strong></div>
        <div><span>Contact or Costco proximity available</span><strong>${assistedImportSummaryCount(completeness.activationAccessAvailable).toLocaleString()}</strong></div>
        <div><span>Commercial history available</span><strong>${assistedImportSummaryCount(completeness.commercialHistoryAvailable).toLocaleString()}</strong></div>
        <div><span>Sourcing available</span><strong>${assistedImportSummaryCount(completeness.sourcingAvailable).toLocaleString()}</strong></div>
        <div><span>Posts available</span><strong>${assistedImportSummaryCount(completeness.postsAvailable).toLocaleString()}</strong></div>
        <div><span>Workbook-backed profiles</span><strong>${assistedImportSummaryCount(completeness.workbookBackedCreators).toLocaleString()}</strong></div>
        <div><span>Evidence-only profiles</span><strong>${assistedImportSummaryCount(completeness.profileEvidenceOnly).toLocaleString()}</strong></div>
        <div><span>Source-application exceptions</span><strong>${remainingSourceExceptions.toLocaleString()}</strong></div>
        ${optionalIdentityProofCards}
        ${optionalCountCards}
      </div>
      <p class="muted-copy">Processing: ${evidenceComplete ? "complete" : "in progress"} &middot; Reconciliation: ${sourceReconciliationComplete ? "complete" : "needs review"}</p>
    </div>`;
};

const renderAssistedImportRunSummary = (summary) => {
  if (!summary || typeof summary !== "object") return "";
  const items = summary.items || {};
  const facts = summary.facts || {};
  const relationships = summary.relationships || {};
  const matched = summary.matchedExistingTargets || {};
  const provisional = summary.provisionalSuggestionGroups || {};
  const resolved = summary.resolvedProvisionalGroups || {};
  const resolvedTotal = ASSISTED_IMPORT_SUMMARY_TARGET_TYPES.reduce(
    (total, targetType) => total + assistedImportSummaryCount(resolved[targetType]),
    0
  );
  return `
    <div class="assisted-import-review assisted-import-run-summary">
      <div class="admin-section-heading"><div><h3>Import results</h3></div></div>
      <div class="import-status-card assisted-import-count-grid">
        <div><span>Queued segments</span><strong>${assistedImportSummaryCount(items.queued).toLocaleString()}</strong></div>
        <div><span>Processing segments</span><strong>${assistedImportSummaryCount(items.processing).toLocaleString()}</strong></div>
        <div><span>Facts: total</span><strong>${assistedImportSummaryCount(facts.total).toLocaleString()}</strong></div>
        <div><span>Facts: ambiguous</span><strong>${assistedImportSummaryCount(facts.pendingReview).toLocaleString()}</strong></div>
        <div><span>Facts: directly supported</span><strong>${assistedImportSummaryCount(facts.eligibleForApply).toLocaleString()}</strong></div>
        <div><span>Facts: accepted</span><strong>${assistedImportSummaryCount(facts.accepted).toLocaleString()}</strong></div>
        <div><span>Facts: rejected</span><strong>${assistedImportSummaryCount(facts.rejected).toLocaleString()}</strong></div>
        <div><span>Facts: superseded</span><strong>${assistedImportSummaryCount(facts.superseded).toLocaleString()}</strong></div>
        <div><span>Relationships: total</span><strong>${assistedImportSummaryCount(relationships.total).toLocaleString()}</strong></div>
        <div><span>Relationships: ambiguous</span><strong>${assistedImportSummaryCount(relationships.pendingReview).toLocaleString()}</strong></div>
        <div><span>Relationships: directly supported</span><strong>${assistedImportSummaryCount(relationships.eligibleForApply).toLocaleString()}</strong></div>
        <div><span>Relationships: accepted</span><strong>${assistedImportSummaryCount(relationships.accepted).toLocaleString()}</strong></div>
        <div><span>Relationships: rejected</span><strong>${assistedImportSummaryCount(relationships.rejected).toLocaleString()}</strong></div>
        <div><span>Relationships: added to CRM</span><strong>${assistedImportSummaryCount(relationships.materialized).toLocaleString()}</strong></div>
        <div><span>Accepted, awaiting CRM</span><strong>${assistedImportSummaryCount(relationships.acceptedUnmaterialized).toLocaleString()}</strong></div>
        <div><span>Suggestions resolved</span><strong>${resolvedTotal.toLocaleString()}</strong></div>
      </div>
      <div class="data-table assisted-import-summary-table">
        <table>
          <thead><tr><th>Record type</th><th>Matched existing</th><th>Suggestions</th><th>Resolved</th></tr></thead>
          <tbody>${ASSISTED_IMPORT_SUMMARY_TARGET_TYPES.map((targetType) => `
            <tr>
              <td>${escapeHtml(assistedImportTargetLabel(targetType))}</td>
              <td>${assistedImportSummaryCount(matched[targetType]).toLocaleString()}</td>
              <td>${assistedImportSummaryCount(provisional[targetType]).toLocaleString()}</td>
              <td>${assistedImportSummaryCount(resolved[targetType]).toLocaleString()}</td>
            </tr>`).join("")}</tbody>
        </table>
      </div>
    </div>`;
};

const renderAssistedImportProvisionalDetail = () => {
  const detail = state.assistedImport.provisionalDetail;
  if (!detail?.targetId) return "";
  const facts = Array.isArray(detail.facts) ? detail.facts : [];
  return `
    <div class="permission-callout assisted-import-provisional-detail" aria-live="polite">
      <div class="admin-section-heading">
        <div><h3>${escapeHtml(detail.displayLabel || "Provisional record")}</h3></div>
        <button type="button" class="button button--secondary button--small" data-action="close-assisted-import-provisional-detail" ${detail.loading ? "disabled" : ""}>Close</button>
      </div>
      ${detail.loading
        ? `<div class="empty-state"><strong>Loading&hellip;</strong></div>`
        : detail.error
          ? `<p class="system-message system-message--error">${escapeHtml(detail.error)}</p>`
          : facts.length
            ? `<div class="assisted-import-review-list">${facts.map((fact) => `
                <article class="assisted-import-fact">
                  <div class="assisted-import-fact__heading">
                    <div>${badge(assistedImportApplicationLabel(fact), fact.applicationTier === "assumed" ? "warn" : "good")}<span class="status-chip">${escapeHtml(fact.sourceSupport || "direct")}</span><strong>${escapeHtml(fact.field || fact.factType || "Imported fact")}</strong></div>
                    <span><strong>${Math.round(Number(fact.confidence || 0) * 100)}% confidence</strong><small>${escapeHtml(assistedImportCorroborationLabel(fact))}</small></span>
                  </div>
                  <p class="assisted-import-fact__value">${escapeHtml(assistedImportFactValue(fact.value))}</p>
                  <blockquote>${escapeHtml(fact.evidenceExcerpt)}</blockquote>
                  <div class="assisted-import-fact__source">
                    <span>${escapeHtml(fact.sourceTitle || "Google source")}${fact.sourceDate ? ` &middot; ${escapeHtml(formatDate(String(fact.sourceDate).slice(0, 10)))}` : ""}</span>
                    <a href="${escapeHtml(fact.sourceUrl)}" target="_blank" rel="noopener noreferrer">Open source</a>
                  </div>
                </article>`).join("")}</div>`
            : `<div class="empty-state"><strong>No applied evidence is available.</strong><span>Human-review exceptions remain in the review queue.</span></div>`}
    </div>`;
};

const renderAssistedImportProvisionalPageControls = (provisionalPage) => {
  const page = state.assistedImport.reviewPaging.provisional;
  if (!page || !provisionalPage) return "";
  return `
    <div class="assisted-import-page-controls" aria-label="Provisional record pagination">
      <span class="helper-text">Page ${(page.pageIndex + 1).toLocaleString()}</span>
      <div class="assisted-import-page-buttons">
        <button type="button" class="button button--secondary button--small" data-action="page-assisted-import-provisional" data-direction="previous" ${page.pageIndex < 1 || assistedImportIsBusy() ? "disabled" : ""}>Previous</button>
        <button type="button" class="button button--secondary button--small" data-action="page-assisted-import-provisional" data-direction="next" ${!provisionalPage.hasMore || !page.nextCursor || assistedImportIsBusy() ? "disabled" : ""}>Next</button>
      </div>
    </div>`;
};

const renderAssistedImportAutomaticPolicy = (policy, provisionalPage) => {
  const hasPolicy = policy && typeof policy === "object";
  const relationshipPolicy = hasPolicy && policy.relationships
    && typeof policy.relationships === "object" ? policy.relationships : null;
  const provisionalRecords = Array.isArray(provisionalPage?.items)
    ? provisionalPage.items
    : [];
  if (!hasPolicy && !provisionalRecords.length) return "";
  const policyCards = hasPolicy ? `
    <div class="import-status-card assisted-import-count-grid">
      <div><span>Total staged facts</span><strong>${assistedImportSummaryCount(policy.totalFacts).toLocaleString()}</strong></div>
      <div><span>Automatically accepted</span><strong>${assistedImportSummaryCount(policy.automaticAccepted).toLocaleString()}</strong></div>
      <div><span>Applied as assumed</span><strong>${assistedImportSummaryCount(policy.automaticAssumed).toLocaleString()}</strong></div>
      <div><span>Owner-approved assumptions</span><strong>${assistedImportSummaryCount(policy.ownerBulkApproved).toLocaleString()}</strong></div>
      <div><span>Originally flagged for review</span><strong>${assistedImportSummaryCount(policy.initialHumanReview).toLocaleString()}</strong></div>
      <div><span>Human review remaining</span><strong>${assistedImportSummaryCount(policy.humanReview).toLocaleString()}</strong></div>
      <div><span>Rejected / prohibited</span><strong>${assistedImportSummaryCount(policy.rejectedProhibited).toLocaleString()}</strong></div>
      <div><span>Missing evidence</span><strong>${assistedImportSummaryCount(policy.unresolvedMissingEvidence).toLocaleString()}</strong></div>
      <div><span>Fact outcomes recorded</span><strong>${assistedImportSummaryCount(policy.completedOutcomes).toLocaleString()}</strong></div>
      <div><span>Provisional records</span><strong>${assistedImportSummaryCount(policy.provisionalRecords).toLocaleString()}</strong></div>
      <div><span>Total relationships</span><strong>${assistedImportSummaryCount(relationshipPolicy?.totalRelationships).toLocaleString()}</strong></div>
      <div><span>Relationship outcomes recorded</span><strong>${assistedImportSummaryCount(relationshipPolicy?.completedOutcomes).toLocaleString()}</strong></div>
      <div><span>Relationships added to CRM</span><strong>${assistedImportSummaryCount(relationshipPolicy?.materializedRelationships).toLocaleString()}</strong></div>
      <div><span>Relationships in review</span><strong>${assistedImportSummaryCount(relationshipPolicy?.humanReview).toLocaleString()}</strong></div>
    </div>` : "";
  const completionLabel = policy?.complete
    ? "Evidence outcomes recorded"
    : policy?.factsStatusAvailable && policy?.relationshipsStatusAvailable
      ? "Resolution in progress"
      : "Resolution status incomplete";
  return `
    <div class="assisted-import-review assisted-import-automatic-policy">
      <div class="admin-section-heading">
        <div><h3>Import review</h3></div>
        ${hasPolicy ? `<span class="status-chip">${escapeHtml(completionLabel)}</span>` : ""}
      </div>
      ${policyCards}
      ${provisionalRecords.length ? `
        <div class="admin-section-heading">
          <div><h3>Provisional records</h3></div>
          <span class="helper-text">${provisionalRecords.length.toLocaleString()} shown${provisionalPage?.hasMore ? " · more available" : ""}</span>
        </div>
        <div class="assisted-import-review-list">${provisionalRecords.map((record) => `
          <article class="assisted-import-fact">
            <div class="assisted-import-fact__heading">
              <div>${badge(record.applicationTier === "assumed" ? "Assumed" : "Accepted inferred", record.applicationTier === "assumed" ? "warn" : "good")}<span class="status-chip">${escapeHtml(assistedImportTargetLabel(record.targetType))}</span><strong>${escapeHtml(record.displayLabel)}</strong></div>
              <strong>${Math.round(Number(record.confidence || 0) * 100)}% confidence</strong>
            </div>
            <p class="muted-copy">${assistedImportSummaryCount(record.factCount).toLocaleString()} fact${assistedImportSummaryCount(record.factCount) === 1 ? "" : "s"} · ${assistedImportSummaryCount(record.sourceCount).toLocaleString()} source${assistedImportSummaryCount(record.sourceCount) === 1 ? "" : "s"}${record.createdAt ? ` · created ${escapeHtml(formatDate(String(record.createdAt).slice(0, 10)))}` : ""}</p>
            <div class="assisted-import-fact__actions"><button type="button" class="button button--secondary button--small" data-action="open-assisted-import-provisional-detail" data-target-type="${escapeHtml(record.targetType)}" data-target-id="${escapeHtml(record.provisionalEntityId)}" ${assistedImportIsBusy() ? "disabled" : ""}>View evidence</button></div>
          </article>`).join("")}</div>` : ""}
      ${renderAssistedImportProvisionalPageControls(provisionalPage)}
      ${renderAssistedImportProvisionalDetail()}
    </div>`;
};

const renderAssistedImportPageControls = (queueName, hasMore) => {
  const page = state.assistedImport.reviewPaging[queueName];
  if (!page) return "";
  const filters = queueName === "facts"
    ? [
        ["pending_review", "Ambiguous"],
        ["eligible_for_apply", "Directly supported"]
      ]
    : [
        ["pending_review", "Ambiguous"],
        ["eligible_for_apply", "Directly supported"],
        ["accepted_unmaterialized", "Accepted, awaiting CRM"]
      ];
  return `
    <div class="assisted-import-page-controls" aria-label="Review queue pagination">
      <div class="assisted-import-page-filters">${filters.map(([decision, label]) => `
        <button type="button" class="button button--small ${page.decision === decision ? "button--primary" : "button--secondary"}" data-action="filter-assisted-import-review" data-queue="${queueName}" data-decision="${decision}" ${assistedImportIsBusy() ? "disabled" : ""}>${label}</button>`).join("")}</div>
      <div class="assisted-import-page-buttons">
        <button type="button" class="button button--secondary button--small" data-action="page-assisted-import-review" data-queue="${queueName}" data-direction="previous" ${page.pageIndex < 1 || assistedImportIsBusy() ? "disabled" : ""}>Previous</button>
        <span class="helper-text">Page ${(page.pageIndex + 1).toLocaleString()}</span>
        <button type="button" class="button button--secondary button--small" data-action="page-assisted-import-review" data-queue="${queueName}" data-direction="next" ${!hasMore || !page.nextCursor || assistedImportIsBusy() ? "disabled" : ""}>Next</button>
      </div>
    </div>`;
};

const renderAssistedImportRelationshipDeliverables = (deliverables) => {
  if (!Array.isArray(deliverables) || deliverables.length === 0) return "";
  return `<div class="assisted-import-relationship__deliverables"><strong>Deliverables found</strong><ul>${deliverables.map((deliverable) => {
    const parts = [
      `${Number(deliverable.quantity || 1).toLocaleString()} &times; ${escapeHtml(deliverable.deliverableType || "Deliverable")}`,
      deliverable.platform ? escapeHtml(deliverable.platform) : null,
      deliverable.dueDate ? `due ${escapeHtml(assistedImportRelationshipSourceDate(deliverable.dueDate) || deliverable.dueDate)}` : null
    ].filter(Boolean);
    return `<li>${parts.join(" &middot; ")}</li>`;
  }).join("")}</ul></div>`;
};

const renderAssistedImportRelationshipReview = (relationshipReview) => {
  const review = relationshipReview && typeof relationshipReview === "object"
    ? relationshipReview
    : {};
  const summary = review.summary || {};
  const queue = Array.isArray(review.queue) ? review.queue : [];
  const pending = Number(summary.pending || 0) > 0
    ? Number(summary.pending || 0)
    : Number(summary.pendingReview || 0) + Number(summary.eligibleForApply || 0);
  const ready = Number(summary.acceptedUnmaterialized || 0);
  const total = Number(summary.total || 0);
  if (!queue.length && !pending && !ready && !total) return "";
  return `
    <div class="assisted-import-review assisted-import-relationship-review">
      <div class="admin-section-heading">
        <div><h3>Creator &amp; campaign relationships</h3></div>
        <span class="helper-text">${pending.toLocaleString()} pending${ready ? ` &middot; ${ready.toLocaleString()} ready to add` : ""}</span>
      </div>
      ${queue.length ? `<div class="assisted-import-review-list">${queue.map((relationship) => {
        const decisionStatus = String(relationship.decisionStatus || "");
        const reviewable = ["pending_review", "eligible_for_apply"].includes(decisionStatus);
        const accepted = decisionStatus === "accepted";
        const materialized = relationship.isMaterialized === true;
        const rate = assistedImportRelationshipRate(relationship);
        const sourceDate = assistedImportRelationshipSourceDate(relationship.sourceDate);
        const sourceUrl = assistedImportGoogleSourceUrl(relationship.sourceUrl);
        return `
          <article class="assisted-import-fact assisted-import-relationship">
            <div class="assisted-import-fact__heading">
              <div>
                <span class="status-chip">${escapeHtml(String(relationship.sourceSupport || "review"))}</span>
                <strong>${escapeHtml(relationship.creatorLabel || "Creator awaiting review")} &rarr; ${escapeHtml(relationship.campaignLabel || "Campaign awaiting review")}</strong>
              </div>
              <strong>${Math.round(Number(relationship.confidence || 0) * 100)}% confidence</strong>
            </div>
            <div class="assisted-import-relationship__terms">
              <div><span>Relationship stage</span><strong>${escapeHtml(assistedImportRelationshipLabel(relationship.relationshipStage))}</strong></div>
              <div><span>Engagement</span><strong>${escapeHtml(assistedImportRelationshipLabel(relationship.engagementType))}</strong></div>
              ${rate ? `<div><span>Agreed rate evidence</span><strong>${escapeHtml(rate)}</strong></div>` : ""}
            </div>
            ${renderAssistedImportRelationshipDeliverables(relationship.deliverables)}
            <blockquote>${escapeHtml(relationship.evidenceExcerpt || "No evidence excerpt was provided.")}</blockquote>
            <div class="assisted-import-fact__source">
              <span>${escapeHtml(relationship.sourceTitle || "Google source")}${sourceDate ? ` &middot; ${escapeHtml(sourceDate)}` : ""}</span>
              ${sourceUrl ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">Open source</a>` : ""}
            </div>
            <div class="assisted-import-fact__actions">
              ${reviewable ? `
                <button class="button button--secondary button--small" data-action="review-assisted-import-relationship" data-relationship-id="${escapeHtml(relationship.relationshipId)}" data-decision="rejected" ${assistedImportIsBusy() ? "disabled" : ""}>Reject</button>
                <button class="button button--primary button--small" data-action="review-assisted-import-relationship" data-relationship-id="${escapeHtml(relationship.relationshipId)}" data-decision="accepted" ${assistedImportIsBusy() ? "disabled" : ""}>Accept relationship</button>` : ""}
              ${accepted && !materialized ? `<button class="button button--primary button--small" data-action="materialize-assisted-import-relationship" data-relationship-id="${escapeHtml(relationship.relationshipId)}" ${assistedImportIsBusy() ? "disabled" : ""}>Add to CRM</button>` : ""}
              ${accepted && materialized ? `<span class="status-chip">Added to CRM</span>` : ""}
            </div>
          </article>`;
      }).join("")}</div>` : `<p class="muted-copy">No relationship evidence is waiting on this page.</p>`}
      ${renderAssistedImportPageControls("relationships", review.hasMore === true)}
    </div>`;
};

const ASSISTED_IMPORT_MATERIALIZABLE_TARGETS = new Set([
  "creator", "brand", "campaign", "product"
]);

const isProvisionalAssistedImportFact = (fact) => Boolean(
  fact
  && fact.proposedEntityKey
  && !fact.targetId
  && ASSISTED_IMPORT_MATERIALIZABLE_TARGETS.has(String(fact.targetType || ""))
);

const assistedImportTargetLabel = (targetType) => ({
  creator: "creator",
  brand: "brand",
  campaign: "campaign",
  product: "product",
  agency: "representation agency",
  manager: "representation contact",
  assignment: "campaign assignment",
  post: "exact post"
})[targetType] || "record";

const renderAssistedImportMaterialization = (fact) => {
  const materialization = state.assistedImport.materialization;
  if (materialization.factId !== fact.factId) return "";
  const options = materialization.options || {};
  const targetType = String(options.targetType || fact.targetType || "");
  const targetLabel = assistedImportTargetLabel(targetType);
  const existingTargets = Array.isArray(options.existingTargets) ? options.existingTargets : [];
  const clients = Array.isArray(options.clients) ? options.clients : [];
  const brands = Array.isArray(options.brands) ? options.brands : [];
  const parentOptions = targetType === "brand" ? clients : brands;
  const parentRequired = ["brand", "campaign", "product"].includes(targetType);
  const createDisabled = assistedImportIsBusy()
    || materialization.loading
    || (parentRequired && parentOptions.length === 0);
  const parentField = targetType === "brand"
    ? `<label><span>Client</span><select name="clientId" required>${clients.map((client) => `<option value="${escapeHtml(client.clientId)}">${escapeHtml(client.label)}</option>`).join("")}</select></label>`
    : ["campaign", "product"].includes(targetType)
      ? `<label><span>Brand and client</span><select name="brandId" required>${brands.map((brand) => `<option value="${escapeHtml(brand.brandId)}" data-client-id="${escapeHtml(brand.clientId)}">${escapeHtml(brand.label)}</option>`).join("")}</select></label>`
      : "";
  const campaignTypeField = targetType === "campaign"
    ? `<label><span>Campaign type</span><select name="campaignType" required><option value="paid">Paid</option><option value="seeding">Seeding</option><option value="other">Other</option></select></label>`
    : "";
  return `
    <div class="permission-callout assisted-import-materializer" aria-live="polite">
      <div class="admin-section-heading">
        <div><strong>Resolve provisional ${escapeHtml(targetLabel)}</strong></div>
        <button type="button" class="button button--secondary button--small" data-action="close-assisted-import-materializer">Close</button>
      </div>
      <form data-assisted-import-form="search" class="form-row">
        <input type="hidden" name="factId" value="${escapeHtml(fact.factId)}" />
        <label><span>Find an existing ${escapeHtml(targetLabel)}</span><input name="query" maxlength="100" autocomplete="off" value="${escapeHtml(materialization.query || "")}" placeholder="Search by handle, name, or BYOU code" /></label>
        <button type="submit" class="button button--secondary button--small" ${materialization.loading || assistedImportIsBusy() ? "disabled" : ""}>Search CRM</button>
      </form>
      ${materialization.loading && !materialization.options ? `<p class="muted-copy">Loading same-workspace records&hellip;</p>` : ""}
      ${materialization.error ? `<p class="system-message system-message--error">${escapeHtml(materialization.error)}</p>` : ""}
      ${materialization.options ? `
        ${existingTargets.length ? `
          <form data-assisted-import-form="materialize" class="form-grid">
            <input type="hidden" name="factId" value="${escapeHtml(fact.factId)}" />
            <input type="hidden" name="resolution" value="link_existing" />
            <label class="field-wide"><span>Existing ${escapeHtml(targetLabel)}</span><select name="existingTargetId" required>${existingTargets.map((target) => `<option value="${escapeHtml(target.targetId)}">${escapeHtml(target.label)}</option>`).join("")}</select></label>
            <button type="submit" class="button button--primary button--small" ${assistedImportIsBusy() ? "disabled" : ""}>Link and accept evidence</button>
          </form>` : `<p class="muted-copy">No matching ${escapeHtml(targetLabel)} records are shown. Try a narrower search, or create a provisional record below.</p>`}
        <form data-assisted-import-form="materialize" class="form-grid">
          <input type="hidden" name="factId" value="${escapeHtml(fact.factId)}" />
          <input type="hidden" name="resolution" value="create_provisional" />
          <input type="hidden" name="targetType" value="${escapeHtml(targetType)}" />
          <label><span>Confirmed ${escapeHtml(targetLabel)} name</span><input name="staffConfirmedName" maxlength="200" required autocomplete="off" placeholder="Enter a non-sensitive display name" /></label>
          ${parentField}
          ${campaignTypeField}
          <button type="submit" class="button button--primary button--small" ${createDisabled ? "disabled" : ""}>Create provisional ${escapeHtml(targetLabel)} and accept</button>
        </form>
        ${parentRequired && parentOptions.length === 0 ? `<p class="muted-copy">A same-workspace ${targetType === "brand" ? "client" : "brand"} is required before this ${escapeHtml(targetLabel)} can be created.</p>` : ""}
      ` : ""}
    </div>`;
};

const renderAssistedImportCorrection = (entry) => {
  const correction = state.assistedImport.correction;
  if (correction.mapId !== entry.mapId) return "";
  const options = correction.options || {};
  const existingTargets = Array.isArray(options.existingTargets) ? options.existingTargets : [];
  return `
    <div class="permission-callout assisted-import-materializer" aria-live="polite">
      <div class="admin-section-heading">
        <div><strong>Correct imported link</strong></div>
        <button type="button" class="button button--secondary button--small" data-action="close-assisted-import-correction">Close</button>
      </div>
      <form data-assisted-import-form="correction-search" class="form-row">
        <input type="hidden" name="mapId" value="${escapeHtml(entry.mapId)}" />
        <label><span>Find the correct existing ${escapeHtml(assistedImportTargetLabel(entry.targetType))}</span><input name="query" maxlength="100" autocomplete="off" value="${escapeHtml(correction.query || "")}" placeholder="Search by handle, name, or BYOU code" /></label>
          <button type="submit" class="button button--secondary button--small" ${correction.loading || assistedImportIsBusy() ? "disabled" : ""}>Search CRM</button>
      </form>
      ${correction.loading && !correction.options ? `<p class="muted-copy">Loading same-workspace records&hellip;</p>` : ""}
      ${correction.error ? `<p class="system-message system-message--error">${escapeHtml(correction.error)}</p>` : ""}
      ${correction.options ? existingTargets.length ? `
        <form data-assisted-import-form="correct-materialization" class="form-grid">
          <input type="hidden" name="mapId" value="${escapeHtml(entry.mapId)}" />
          <label class="field-wide"><span>Correct existing record</span><select name="replacementTargetId" required>${existingTargets.map((target) => `<option value="${escapeHtml(target.targetId)}">${escapeHtml(target.label)}</option>`).join("")}</select></label>
          <label class="field-wide"><span>Correction reason</span><textarea name="reason" minlength="10" maxlength="500" required rows="2" placeholder="Explain why the original link was incorrect. Do not include private contact or financial information."></textarea></label>
          <label class="field-wide"><input type="checkbox" name="confirmed" required /><span>I confirm this correction.</span></label>
          <button type="submit" class="button button--primary button--small" ${assistedImportIsBusy() ? "disabled" : ""}>Save correction</button>
        </form>` : `<p class="muted-copy">No other matching records are shown. Search again with a handle, campaign, brand, product, or BYOU code.</p>` : ""}
    </div>`;
};

const renderAssistedImportMaterializationHistory = () => {
  const history = state.assistedImport.materializationHistory;
  return `
    <div class="assisted-import-review">
      <div class="admin-section-heading">
        <div><h3>Record history</h3></div>
        ${history.loaded ? "" : `<button type="button" class="button button--secondary button--small" data-action="load-assisted-import-history" ${history.loading || assistedImportIsBusy() ? "disabled" : ""}>Load history</button>`}
      </div>
      ${history.loaded ? `
        <form data-assisted-import-form="history-search" class="form-row">
          <label><span>Find materialized records</span><input name="query" maxlength="100" autocomplete="off" value="${escapeHtml(history.query || "")}" placeholder="Search by safe CRM label or record type" /></label>
          <button type="submit" class="button button--secondary button--small" ${history.loading || assistedImportIsBusy() ? "disabled" : ""}>Search history</button>
        </form>` : ""}
      ${history.loading ? `<p class="muted-copy">Loading history&hellip;</p>` : ""}
      ${history.error ? `<p class="system-message system-message--error">${escapeHtml(history.error)}</p>` : ""}
      ${history.loaded && !history.loading ? history.items.length ? `
        <div class="assisted-import-review-list">
          ${history.items.map((entry) => `
            <article class="assisted-import-fact">
              <div class="assisted-import-fact__heading">
                <div><span class="status-chip">${escapeHtml(assistedImportTargetLabel(entry.targetType))}</span><strong>${escapeHtml(entry.currentTargetLabel || "Unavailable record")}</strong><small>${entry.resolutionType === "created_provisional" ? "Created as review-only" : "Linked to existing record"}</small></div>
                <strong>${entry.createdAt ? escapeHtml(formatDate(String(entry.createdAt).slice(0, 10))) : "Date unavailable"}</strong>
              </div>
              <div class="assisted-import-fact__source"><span>${escapeHtml(entry.sourceTitle || "Google source")}</span><a href="${escapeHtml(entry.sourceUrl || "#")}" target="_blank" rel="noopener noreferrer">Open source</a></div>
              ${Array.isArray(entry.corrections) && entry.corrections.length ? `<div>${entry.corrections.map((item) => `<div class="timeline-entry"><strong>${escapeHtml(item.previousTargetLabel)} &rarr; ${escapeHtml(item.replacementTargetLabel)}</strong><p>${escapeHtml(item.reason)}</p><time>${item.correctedAt ? escapeHtml(formatDate(String(item.correctedAt).slice(0, 10))) : "Date unavailable"}</time></div>`).join("")}</div>` : ""}
              <div class="assisted-import-fact__actions"><button type="button" class="button button--secondary button--small" data-action="open-assisted-import-correction" data-map-id="${escapeHtml(entry.mapId)}" ${assistedImportIsBusy() ? "disabled" : ""}>Correct link</button></div>
              ${renderAssistedImportCorrection(entry)}
            </article>`).join("")}
        </div>` : `<p class="muted-copy">No materialized records match this search.</p>` : ""}
  </div>`;
};

const renderAssistedImportBulkResolution = (run, preview) => {
  if (run?.mode !== "full" || run?.status !== "ready_for_review" || !preview) return "";
  const progress = state.assistedImport.bulkResolution;
  const exactFacts = Number(preview.exactExistingCreatorFacts || 0);
  const exactIdentityPhaseComplete = preview.exactIdentityPhaseComplete === true;
  const provisionalGroups = Number(preview.provisionalCreatorGroups || 0);
  const provisionalFacts = Number(preview.provisionalCreatorDirectFacts || 0);
  const exactRunning = progress.running && progress.mode === "exact_existing";
  const provisionalRunning = progress.running && progress.mode === "provisional_creators";
  return `
    <div class="assisted-import-review assisted-import-resolution">
      <div class="admin-section-heading">
        <div><h3>Build creator profiles</h3></div>
      </div>
      <div class="import-status-card import-status-card--resolution">
        <div><span>Already-matched facts ready</span><strong>${exactFacts.toLocaleString()}</strong></div>
        <div><span>Provisional profiles ready</span><strong>${provisionalGroups.toLocaleString()}</strong></div>
        <div><span>Direct facts on those profiles</span><strong>${provisionalFacts.toLocaleString()}</strong></div>
      </div>
      ${progress.running ? `<div class="assisted-import-resolution__progress" aria-live="polite"><strong>${exactRunning ? "Resolving exact creator evidence" : "Creating provisional creator profiles"}&hellip;</strong><span>${exactRunning ? `${progress.processedFacts.toLocaleString()} facts processed` : `${progress.createdProfiles.toLocaleString()} profiles created &middot; ${progress.acceptedFacts.toLocaleString()} facts accepted`}${progress.remaining == null ? "" : ` &middot; ${progress.remaining.toLocaleString()} remaining`}</span></div>` : ""}
      ${progress.error ? `<p class="system-message system-message--error">${escapeHtml(progress.error)} Progress already committed is preserved; use the same action to resume.</p>` : ""}
      <div class="admin-import-actions">
        <button class="button button--primary" data-action="apply-assisted-import-resolution" data-resolution="exact_existing" ${assistedImportIsBusy() || exactIdentityPhaseComplete ? "disabled" : ""}>${exactRunning ? "Resolving exact identities&hellip;" : exactIdentityPhaseComplete ? "Exact identity phase complete" : "Resolve exact creator evidence"}</button>
        <button class="button button--secondary" data-action="apply-assisted-import-resolution" data-resolution="provisional_creators" ${assistedImportIsBusy() || !exactIdentityPhaseComplete || provisionalGroups === 0 ? "disabled" : ""}>${provisionalRunning ? "Building profiles&hellip;" : provisionalGroups === 0 ? "Provisional profiles complete" : !exactIdentityPhaseComplete ? "Complete exact identity phase first" : "Build provisional creator profiles"}</button>
      </div>
    </div>`;
};

const renderAssistedImportAdmin = () => {
  if (!isLiveMode()) {
    return `<section><h3>Import & Sync</h3><p>Production-only. The local demo cannot scan Gmail or Drive.</p></section>`;
  }
  if (state.assistedImport.loading && !state.assistedImport.data) {
    return `<section><h3>Import & Sync</h3><p>Loading value-free import status&hellip;</p></section>`;
  }
  if (state.assistedImport.error) {
    return `<section><h3>Import & Sync</h3><p class="system-message system-message--error">${escapeHtml(state.assistedImport.error)}</p><button class="button button--secondary button--small" data-action="refresh-assisted-import">Retry</button></section>`;
  }
  const status = state.assistedImport.data || {};
  const run = status.currentRun || null;
  const counts = run?.counts || {};
  const runSummary = status.runSummary || null;
  const reviewSummary = status.reviewSummary || {};
  const reviewQueue = Array.isArray(status.reviewQueue) ? status.reviewQueue : [];
  const reviewPending = Number(reviewSummary.pending || 0);
  const reviewEligible = Number(reviewSummary.eligibleForApply || 0);
  const reviewedFacts = Number(reviewSummary.accepted || 0) + Number(reviewSummary.rejected || 0);
  const reviewedAccuracy = reviewedFacts > 0
    ? ((Number(reviewSummary.accepted || 0) / reviewedFacts) * 100).toFixed(2)
    : "";
  const active = run && [
    "requested",
    "staging",
    "ready_for_enrichment",
    "enriching",
    "ready_for_review"
  ].includes(run.status);
  const codexReady = run && ["ready_for_enrichment", "enriching"].includes(run.status);
  const driveScopeBlocked = run?.status === "failed"
    && run?.lastErrorCode === "google_drive_content_scope_required";
  return `
    <section class="assisted-import-admin">
      <div class="admin-section-heading"><div><h3>Import & Sync</h3></div><button class="button button--secondary button--small" data-action="refresh-assisted-import" ${assistedImportIsBusy() ? "disabled" : ""}>Refresh</button></div>
      <div class="import-status-card">
        <div><span>Current state</span><strong>${escapeHtml(assistedImportStatusLabel(run?.status, run?.lastErrorCode))}</strong></div>
        <div><span>Pilot creators</span><strong>${Number(run?.pilotCreatorCount || 0).toLocaleString()}${run?.mode === "pilot" ? " / 25" : ""}</strong></div>
        <div><span>Sources scanned</span><strong>${Number(counts.scanned || 0).toLocaleString()}</strong></div>
        <div><span>AI-ready segments</span><strong>${Number(counts.queued || 0).toLocaleString()}</strong></div>
        <div><span>Excluded / protected</span><strong>${Number((counts.excluded || 0) + (counts.restricted || 0)).toLocaleString()}</strong></div>
      </div>
      ${renderAssistedImportOperationalCompleteness(status.operationalCompleteness)}
      ${renderAssistedImportRunSummary(runSummary)}
      ${renderAssistedImportAutomaticPolicy(status.automaticPolicy, status.provisionalEntities)}
      ${renderAssistedImportBulkResolution(run, status.bulkResolutionPreview)}
      ${codexReady ? `<div class="permission-callout"><strong>Ready for Codex</strong><span>Open Codex and say: <b>Run the BYOUIQ assisted import.</b></span></div>` : ""}
      ${driveScopeBlocked ? `<div class="permission-callout permission-callout--warn"><strong>Drive file access must be reauthorized</strong><span>The connected Google token can list Drive files but cannot read their contents. Replace only <b>GOOGLE_REFRESH_TOKEN</b> on the private Railway worker after authorizing <b>drive.readonly</b>, redeploy, then tell Codex: <b>Drive token updated.</b> Never paste the token into BYOUIQ or chat.</span></div>` : ""}
      ${run?.mode === "pilot" && Number(run?.pilotCreatorCount || 0) < 25 ? `<div class="permission-callout permission-callout--warn"><strong>Pilot cohort is incomplete</strong><span>BYOUIQ found ${Number(run?.pilotCreatorCount || 0).toLocaleString()} eligible creator profiles. The full import cannot unlock until the required 25-profile cohort is available and reviewed.</span></div>` : ""}
      ${run?.mode === "pilot" && run?.status === "ready_for_review" ? `<div class="permission-callout permission-callout--warn"><strong>Pilot review required</strong><span>Complete the review to unlock the full import.</span></div>` : ""}
      ${reviewQueue.length || reviewPending || reviewEligible ? `
        <div class="assisted-import-review">
          <div class="admin-section-heading">
            <div><h3>Review queue</h3></div>
            <span class="helper-text">${(reviewPending + reviewEligible).toLocaleString()} awaiting review${reviewEligible ? ` &middot; ${reviewEligible.toLocaleString()} directly supported` : ""}</span>
          </div>
          ${reviewQueue.length ? `<div class="assisted-import-review-list">
            ${reviewQueue.map((fact) => `
              <article class="assisted-import-fact">
                <div class="assisted-import-fact__heading">
                  <div>
                    <span class="status-chip">${escapeHtml(String(fact.sourceSupport || "review"))}</span>
                    <strong>${escapeHtml(String(fact.field || fact.factType || "Imported fact"))}</strong>
                    <small>${escapeHtml(String(fact.targetType || "record"))}${fact.proposedEntityKey ? " · provisional record" : ""}</small>
                  </div>
                  <strong>${Math.round(Number(fact.confidence || 0) * 100)}% confidence</strong>
                </div>
                <p class="assisted-import-fact__value">${escapeHtml(assistedImportFactValue(fact.value))}</p>
                <blockquote>${escapeHtml(fact.evidenceExcerpt || "No evidence excerpt was provided.")}</blockquote>
                <div class="assisted-import-fact__source">
                  <span>${escapeHtml(fact.sourceTitle || "Google source")}${fact.sourceDate ? ` · ${escapeHtml(formatDate(String(fact.sourceDate).slice(0, 10)))}` : ""}</span>
                  <a href="${escapeHtml(fact.sourceUrl || "#")}" target="_blank" rel="noopener noreferrer">Open source</a>
                </div>
                <div class="assisted-import-fact__actions">
                  <button class="button button--secondary button--small" data-action="review-assisted-import-fact" data-fact-id="${escapeHtml(fact.factId)}" data-decision="rejected" ${assistedImportIsBusy() ? "disabled" : ""}>Reject</button>
                  ${isProvisionalAssistedImportFact(fact)
                    ? `<button class="button button--primary button--small" data-action="open-assisted-import-materializer" data-fact-id="${escapeHtml(fact.factId)}" ${assistedImportIsBusy() ? "disabled" : ""}>Create or link record</button>`
                    : `<button class="button button--primary button--small" data-action="review-assisted-import-fact" data-fact-id="${escapeHtml(fact.factId)}" data-decision="accepted" ${assistedImportIsBusy() ? "disabled" : ""}>Accept fact</button>`}
                </div>
                ${isProvisionalAssistedImportFact(fact) ? renderAssistedImportMaterialization(fact) : ""}
              </article>`).join("")}
          </div>` : `<p class="muted-copy">No facts are waiting in the selected view.</p>`}
          ${renderAssistedImportPageControls("facts", status.hasMoreReviewItems === true)}
        </div>` : ""}
      ${renderAssistedImportRelationshipReview(status.relationshipReview)}
      ${renderAssistedImportMaterializationHistory()}
      ${run?.mode === "pilot" && run?.status === "ready_for_review" ? `
        <form id="assisted-import-pilot-review-form" class="assisted-import-review">
          <input type="hidden" name="runId" value="${escapeHtml(run.runId)}" />
          <div class="admin-section-heading">
            <div><h3>Pilot results</h3></div>
          </div>
          <div class="form-grid">
            <label><span>Facts reviewed</span><input type="number" name="sampledFactCount" min="1" max="100000" required value="${reviewedFacts || 1}" /></label>
            <label><span>Accuracy percent</span><input type="number" name="accuracyPercent" min="0" max="100" step="0.01" required value="${reviewedAccuracy}" /></label>
            <label><span>Incorrect automatic merges</span><input type="number" name="incorrectAutomaticMerges" min="0" max="100000" required value="0" /></label>
            <label><span>Sensitive exposures</span><input type="number" name="sensitiveExposures" min="0" max="100000" required value="0" /></label>
            <label><span>Staff-verified overwrites</span><input type="number" name="staffVerifiedOverwriteCount" min="0" max="100000" required value="0" /></label>
          </div>
          <div class="checkbox-stack">
            <label><input type="checkbox" name="evidenceLinksComplete" /><span>Every sampled fact has working evidence and a source link.</span></label>
            <label><input type="checkbox" name="ambiguousFactsSafelyHandled" /><span>Ambiguous facts were reviewed or omitted instead of guessed.</span></label>
            <label><input type="checkbox" name="rerunIdempotent" /><span>The replay test created no duplicate records or activities.</span></label>
            <label><input type="checkbox" name="sensitivePermissionsPassed" /><span>Sensitive-document permissions and redaction checks passed.</span></label>
          </div>
          <div class="drawer-footer inline-footer"><span class="helper-text">Passing requires at least 95% accuracy and every safety condition.</span><button type="submit" class="button button--primary" ${assistedImportIsBusy() ? "disabled" : ""}>Record pilot gate</button></div>
        </form>` : ""}
      <div class="admin-import-actions">
        <button class="button button--primary" data-action="sync-assisted-import" data-mode="pilot" ${active || driveScopeBlocked || assistedImportIsBusy() ? "disabled" : ""}>${active && run?.mode === "pilot" ? "Pilot in progress" : driveScopeBlocked ? "Google permission required" : "Start 25-creator pilot"}</button>
        <button class="button button--secondary" data-action="sync-assisted-import" data-mode="full" ${!status.fullImportUnlocked || active || assistedImportIsBusy() ? "disabled" : ""}>Start full historical import</button>
      </div>
    </section>`;
};

const renderAdminDrawer = () => `
  <div class="drawer-backdrop" data-action="close-drawer"></div>
  <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="admin-title">
    <header class="drawer-header"><div><p class="eyebrow">Admin</p><h2 id="admin-title">Admin tools</h2></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
    <div class="drawer-body admin-stack">
      ${renderAssistedImportAdmin()}
      <section><h3>Approved spreadsheet imports</h3>${state.adminSummary.approvedImports.map((item) => `<p class="admin-rule"><span>&#10003;</span>${escapeHtml(item)}</p>`).join("")}</section>
    </div>
  </aside>`;

const drawerFrame = ({ eyebrow, title, body, formId, formClass = "", submitLabel = "Save" }) => `
  <div class="drawer-backdrop" data-action="close-drawer"></div>
  <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="crm-drawer-title">
    <form id="${escapeHtml(formId)}"${formClass ? ` class="${escapeHtml(formClass)}"` : ""}>
      <header class="drawer-header"><div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h2 id="crm-drawer-title">${escapeHtml(title)}</h2></div><button type="button" class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header>
      <div class="drawer-body form-stack">${body}</div>
      <footer class="drawer-footer"><button type="button" class="button button--secondary" data-action="close-drawer">Cancel</button><button type="submit" class="button button--primary" data-action="submit-crm-form">${escapeHtml(submitLabel)}</button></footer>
    </form>
  </aside>`;

const videoConnectionPreview = (rawUrl) => {
  try {
    const url = new URL(String(rawUrl || "").trim());
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let platform = null;
    if (host === "instagram.com" && /^\/(?:p|reel|tv)\/[^/]+/.test(url.pathname)) platform = "instagram";
    else if (host === "tiktok.com" && /^\/@[^/]+\/video\/\d+/.test(url.pathname)) platform = "tiktok";
    else if ((host === "youtube.com" && (/^\/shorts\/[A-Za-z0-9_-]{6,}/.test(url.pathname) || (url.pathname === "/watch" && url.searchParams.get("v")))) || (host === "youtu.be" && /^\/[A-Za-z0-9_-]{6,}/.test(url.pathname))) platform = "youtube";
    else if (["x.com", "twitter.com"].includes(host) && /^\/[^/]+\/status\/\d+/.test(url.pathname)) platform = "x";
    else if ((host === "facebook.com" && (/^\/(?:reel|watch)\//.test(url.pathname) || url.pathname.includes("/posts/") || url.searchParams.get("v"))) || (host === "fb.watch" && url.pathname.length > 1)) platform = "facebook";
    if (!platform) return null;
    url.hash = "";
    return { href: url.toString(), platform };
  } catch {
    return null;
  }
};

const parseVideoConnectionDraft = (value) => unique(
  String(value || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
);

const videoConnectionPlacementLabel = (placement) => {
  const handle = placement.accountHandle
    ? `@${String(placement.accountHandle).replace(/^@/, "")}`
    : "account handle unavailable";
  const deliverable = placement.deliverableId
    ? formatVideoTrackingLabel(placement.deliverableType || "campaign deliverable")
    : "new short-form video placement";
  return `${creatorDisplayLabel({displayName:placement.creatorName,handle})} - ${handle} - ${placement.campaignName || "Campaign"} - ${deliverable}`;
};

const renderVideoConnectionDrawer = () => {
  const connection = state.videoTracking.connection || freshVideoConnectionState();
  const selected = connection.options.find((item) => item.placementId === connection.selectedPlacementId);
  if (connection.stage === "review" && selected) {
    return drawerFrame({
      eyebrow: "Exact video review",
      title: `Confirm ${connection.reviewUrls.length} video${connection.reviewUrls.length === 1 ? "" : "s"}`,
      formId: "video-connection-review-form",
      submitLabel: connection.saving ? "Connecting..." : "Connect & queue metrics",
      body: `
        <div class="permission-callout"><strong>${escapeHtml(videoConnectionPlacementLabel(selected))}</strong><span>Every selected video must be opened and confirmed before BYOUIQ will connect or queue it.</span></div>
        <div class="video-connection-review-list">${connection.reviewUrls.map((url, index) => `
          <label class="video-connection-review-item">
            <span><strong>Video ${index + 1}</strong><a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">Open exact video &#8599;</a><small>${escapeHtml(url)}</small></span>
            <span class="video-connection-check"><input type="checkbox" name="confirmedUrl" value="${escapeHtml(url)}" required /><span>I confirmed this video belongs to this exact account.</span></span>
          </label>`).join("")}</div>
        ${connection.error ? `<p class="system-message system-message--error">${escapeHtml(connection.error)}</p>` : ""}
        <button type="button" class="button button--secondary button--small" data-action="video-connection-back" ${connection.saving ? "disabled" : ""}>Back to URLs</button>`
    });
  }

  const options = connection.options.map((placement) => `
    <option value="${escapeHtml(placement.placementId)}" ${placement.placementId === connection.selectedPlacementId ? "selected" : ""}>${escapeHtml(videoConnectionPlacementLabel(placement))}</option>`).join("");
  const availability = connection.loadingOptions
    ? `<p class="system-message">Loading eligible creator and campaign placements...</p>`
    : connection.error
      ? `<div class="system-message system-message--error"><strong>Creator placements could not be loaded.</strong><span>${escapeHtml(connection.error)}</span><button type="button" class="button button--secondary button--small" data-action="retry-video-connection-options">Try again</button></div>`
      : connection.options.length
        ? `<label><span>Creator, social account, and campaign</span><select name="placementId" required>${options}</select><small>Only active social accounts belonging to creators already assigned to a campaign appear here.</small></label>`
        : `<div class="empty-state"><strong>No eligible creator placements are available.</strong><span>Add the creator to a campaign and confirm their social profile first.</span></div>`;
  return drawerFrame({
    eyebrow: "Video Tracking",
    title: "Connect creator videos",
    formId: "video-connection-entry-form",
    submitLabel: "Review videos",
    body: `
      <div class="video-connection-search"><label><span>Find a placement</span><input name="placementSearch" value="${escapeHtml(connection.query || "")}" maxlength="100" placeholder="Search creator, handle, or campaign" /></label><button type="button" class="button button--secondary button--small" data-action="search-video-connection-options" ${connection.loadingOptions ? "disabled" : ""}>Search</button></div>
      ${availability}
      ${connection.truncated ? `<p class="system-message">The list is showing the first 250 placements. Search by creator, handle, or campaign to narrow it.</p>` : ""}
      <label><span>Video URLs</span><textarea name="videoUrls" rows="8" required maxlength="52000" placeholder="Paste one Instagram, TikTok, YouTube, Facebook, or X video URL per line">${escapeHtml(connection.draftUrls || "")}</textarea><small>Paste up to 25 URLs from the same social account. Nothing is saved during this review step.</small></label>
      <div class="permission-callout"><strong>Exact account confirmation required</strong><span>A handle found in a URL is never treated as proof. You will open and confirm every video on the next screen.</span></div>`
  });
};

const renderCrmClientDrawer = () => {
  const client = state.editingClientId ? crmClientById(state.editingClientId) : null;
  return drawerFrame({
    eyebrow: "Client",
    title: client ? "Edit client" : "New client",
    description: "",
    formId: "crm-client-form",
    submitLabel: client ? "Save client" : "Create client",
    body: `<input type="hidden" name="id" value="${escapeHtml(client?.id || "")}" /><label><span>Client name</span><input name="name" required maxlength="200" value="${escapeHtml(client?.name || "")}" /></label><div class="form-grid"><label><span>Lifecycle</span><select name="lifecycleStatus">${["Lead", "Prospect", "Active client", "Past client", "Other"].map((value) => `<option ${String(client?.lifecycleStatus || "").toLowerCase().replaceAll("_", " ") === value.toLowerCase() ? "selected" : ""}>${value}</option>`).join("")}</select></label><label><span>Industry</span><input name="industry" maxlength="120" value="${escapeHtml(client?.industry || "")}" /></label></div><label><span>Website</span><input name="website" type="url" maxlength="500" value="${escapeHtml(client?.website || "")}" /></label><label><span>Internal description</span><textarea name="description" maxlength="2000">${escapeHtml(client?.description || client?.internalSummary || "")}</textarea></label><label><span>Internal note</span><textarea name="note" maxlength="2000">${escapeHtml(client?.note || "")}</textarea></label>`
  });
};

const renderCrmContactDrawer = () => {
  const client = crmClientById(state.selectedClientId);
  const contact = state.editingClientContactId ? state.crm.contacts.find((item) => item.id === state.editingClientContactId) : null;
  const methods = contact?.restrictedMethods || {};
  return drawerFrame({
    eyebrow: "Client contact",
    title: contact ? "Edit contact" : "Add contact",
    description: "",
    formId: "crm-contact-form",
    submitLabel: "Save contact",
    body: `<input type="hidden" name="clientId" value="${escapeHtml(client?.id || "")}" /><input type="hidden" name="id" value="${escapeHtml(contact?.id || "")}" /><label><span>Contact name</span><input name="displayName" required maxlength="160" value="${escapeHtml(contact?.displayName || "")}" /></label><div class="form-grid"><label><span>Title</span><input name="title" maxlength="160" value="${escapeHtml(contact?.title || "")}" /></label><label><span>Preferred channel</span><select name="preferredChannel">${["", "Email", "Phone", "Mobile", "WhatsApp"].map((value) => `<option value="${escapeHtml(value)}" ${contact?.preferredChannel === value ? "selected" : ""}>${escapeHtml(value || "Not recorded")}</option>`).join("")}</select></label><label><span>Status</span><select name="status">${["Active", "Inactive"].map((value) => `<option ${String(contact?.status || "active").toLowerCase() === value.toLowerCase() ? "selected" : ""}>${value}</option>`).join("")}</select></label></div><label><span>Internal note</span><textarea name="note">${escapeHtml(contact?.note || "")}</textarea></label><div class="form-grid"><label><span>Restricted email</span><input name="email" type="email" value="${escapeHtml(methods.email || "")}" /></label><label><span>Restricted phone</span><input name="phone" value="${escapeHtml(methods.phone || "")}" /></label><label><span>Restricted mobile</span><input name="mobile" value="${escapeHtml(methods.mobile || "")}" /></label><label><span>Restricted WhatsApp</span><input name="whatsapp" value="${escapeHtml(methods.whatsapp || "")}" /></label></div>`
  });
};

const renderCrmContactRoleDrawer = () => {
  const client = crmClientById(state.selectedClientId);
  const contacts = state.crm.contacts.filter((item) => item.clientId === client?.id);
  const campaigns = crmCampaignsForClient(client);
  const contactId = state.editingClientRoleContactId || contacts[0]?.id || "";
  const campaignId = state.editingClientRoleCampaignId || campaigns[0]?.id || "";
  const assigned = contacts.find((item) => item.id === contactId)?.campaignRoles
    ?.filter((item) => item.campaignId === campaignId)
    .map((item) => item.role)
    || state.crm.campaignContacts.find((item) => item.contactId === contactId && item.campaignId === campaignId)?.roles
    || [];
  return drawerFrame({
    eyebrow: "Campaign contact",
    title: "Assign contact role",
    description: "",
    formId: "crm-contact-role-form",
    submitLabel: "Save campaign role",
    body: `<label><span>Contact</span><select name="contactId" required>${contacts.map((contact) => `<option value="${escapeHtml(contact.id)}" ${contact.id === contactId ? "selected" : ""}>${escapeHtml(contact.displayName)}</option>`).join("")}</select></label><label><span>Campaign</span><select name="campaignId" required>${campaigns.map((campaign) => `<option value="${escapeHtml(campaign.id)}" ${campaign.id === campaignId ? "selected" : ""}>${escapeHtml(campaign.name)}</option>`).join("")}</select></label><div class="checkbox-stack">${[["client_contact", "Client contact"], ["billing_contact", "Commercial terms contact"], ["approver", "Approver"], ["executive_sponsor", "Executive sponsor"], ["other", "Other operational role"]].map(([value, label]) => `<label><input type="checkbox" name="roles" value="${value}" ${assigned.includes(value) ? "checked" : ""} /><span>${label}</span></label>`).join("")}</div>`
  });
};

const renderCrmCommercialDrawer = () => {
  const campaign = campaignById(state.editingCommercialCampaignId);
  const commercial = crmCampaignView(campaign?.id)?.commercial;
  const currentValue = commercial?.clientContractValue?.value;
  const evidenceReferenceId = commercial?.clientContractValue?.citations
    ?.find((citation) => citation?.recordId)?.recordId || "";
  const hasVerifiedEvidence = Boolean(evidenceReferenceId);
  const stateOptions = [
    ["proposed", "Proposed"],
    ["negotiating", "Negotiating"],
    ["agreed", "Agreed"]
  ].map(([value, label]) => `<option value="${value}" ${value === (hasVerifiedEvidence ? "agreed" : "proposed") ? "selected" : ""} ${value === "agreed" && !hasVerifiedEvidence ? "disabled" : ""}>${label}</option>`).join("");
  return drawerFrame({
    eyebrow: "Commercial terms",
    title: `Record terms for ${campaign?.name || "campaign"}`,
    description: "",
    formId: "crm-commercial-form",
    formClass: "crm-commercial-form-layout",
    submitLabel: "Record commercial terms",
    body: `<input type="hidden" name="campaignId" value="${escapeHtml(campaign?.id || "")}" />
        ${!campaign&&state.creatorLibrary.campaignCreation?`<p>${state.creatorLibrary.campaignCreation.creatorIds.length} selected creators will be added. Outreach opens after creation.</p>`:""}<input type="hidden" name="evidenceReferenceId" value="${escapeHtml(evidenceReferenceId)}" /><div class="commercial-field-stack"><label><span>Client contract value</span><input name="amount" type="number" min="0" step="0.01" required value="${Number.isFinite(Number(currentValue)) ? Number(currentValue) : ""}" /></label><label><span>Currency</span><select name="currency"><option>USD</option></select></label><label><span>State</span><select name="state">${stateOptions}</select></label><label><span>Effective date</span><input name="effectiveOn" type="date" /></label><label><span>External accounting reference</span><input name="externalAccountingReference" maxlength="200" placeholder="Invoice or accounting reference only" /></label></div>`
  });
};

const renderCrmAttentionDrawer = () => {
  const item = state.crm.attention.find((candidate) => candidate.id === state.editingAttentionId);
  return drawerFrame({
    eyebrow: "Attention",
    title: "Update next action",
    description: "",
    formId: "crm-attention-form",
    submitLabel: "Save next action",
    body: `<input type="hidden" name="attentionId" value="${escapeHtml(item?.id || "")}" /><label><span>Reason</span><input value="${escapeHtml(item?.reason || "")}" disabled /></label><label><span>Owner</span><input name="owner" required maxlength="160" value="${escapeHtml(item?.owner || state.currentUser.name || "")}" /></label><label><span>Next action</span><textarea name="nextAction" required maxlength="500">${escapeHtml(item?.nextAction || "")}</textarea></label><label><span>Due at</span><input name="dueAt" type="datetime-local" required value="${escapeHtml(item?.dueAt ? String(item.dueAt).slice(0, 16) : "")}" /></label>`
  });
};

const renderCrmProposalDrawer = () => {
  const proposal = state.editingProposalId ? crmProposalById(state.editingProposalId) : null;
  const campaign = campaignById(proposal?.campaignId || state.selectedCampaignId) || state.campaigns[0];
  const selectedIds = new Set(proposal?.assignmentIds || []);
  return drawerFrame({
    eyebrow: "Proposal",
    title: proposal ? "Edit proposal draft" : "Create proposal",
    description: "",
    formId: "crm-proposal-form",
    submitLabel: "Save draft",
    body: `<input type="hidden" name="proposalId" value="${escapeHtml(proposal?.id || "")}" /><input type="hidden" name="campaignId" value="${escapeHtml(campaign?.id || "")}" />
        ${!campaign&&state.creatorLibrary.campaignCreation?`<p>${state.creatorLibrary.campaignCreation.creatorIds.length} selected creators will be added. Outreach opens after creation.</p>`:""}<label><span>Campaign</span><input value="${escapeHtml(campaign?.name || "Campaign unavailable")}" disabled /></label><label><span>Proposal title</span><input name="title" required maxlength="200" value="${escapeHtml(proposal?.title || `${campaign?.name || "Campaign"} proposal`)}" /></label><div class="form-grid"><label><span>Proposed client value</span><input name="proposedClientValue" type="number" min="0" step="0.01" value="${Number.isFinite(Number(proposal?.proposedClientValue)) ? Number(proposal.proposedClientValue) : ""}" /></label><label><span>Currency</span><select name="currency"><option>USD</option></select></label></div><div><span class="field-label">Campaign assignments</span><div class="checkbox-stack">${(campaign?.assignments || []).map((assignment) => { const creator = creatorById(assignment.creatorId); return `<label><input type="checkbox" name="assignmentIds" value="${escapeHtml(assignment.id)}" ${selectedIds.has(assignment.id) ? "checked" : ""} /><span>${escapeHtml(creatorDisplayName(creator))} · ${escapeHtml(assignment.status || "Assignment")}</span></label>`; }).join("") || `<p class="empty-copy">This campaign has no assignments to propose.</p>`}</div></div>`
  });
};

const renderCrmAssistantAnswer = (answer) => {
  if (!answer) return `<p class="empty-copy">Choose a question to begin.</p>`;
  if (answer.kind === "not_available") return `<div class="permission-callout"><strong>Not available</strong><span>${escapeHtml((answer.missingRequirements || []).join("; ") || "Required information is missing.")}</span></div>`;
  if (answer.kind === "recommendation") return `<section class="panel"><p class="eyebrow">Recommendation</p><h3>${escapeHtml(answer.recommendation)}</h3>${(answer.reasons || []).map((reason) => `<div class="permission-callout"><strong>${escapeHtml(reason.reason)}</strong><span>${(reason.citations || []).map((citation) => `${escapeHtml(citation.label || "Supporting record")} (${escapeHtml(citation.recordId)})`).join("; ")}</span></div>`).join("")}</section>`;
  return `<section class="panel"><p class="eyebrow">Operational answer</p>${(answer.facts || []).map((fact) => `<div class="permission-callout"><strong>${escapeHtml(fact.statement)}</strong><span>${(fact.citations || []).map((citation) => `${escapeHtml(citation.label || "Supporting record")} (${escapeHtml(citation.recordId)})`).join("; ")}</span></div>`).join("")}</section>`;
};

const renderCrmAssistantDrawer = () => `
  <div class="drawer-backdrop" data-action="close-drawer"></div><aside class="drawer drawer--wide" role="dialog" aria-modal="true" aria-labelledby="crm-assistant-title"><header class="drawer-header"><div><p class="eyebrow">Assistant</p><h2 id="crm-assistant-title">Ask BYOU IQ</h2></div><button class="icon-button" data-action="close-drawer" aria-label="Close">&#10005;</button></header><div class="drawer-body"><form id="crm-assistant-form" class="form-stack"><label><span>Question</span><select name="questionId">${[["campaign.next-actions", "What are the next actions?"], ["campaign.commercial-status", "What is the commercial status?"], ["campaign.report-readiness", "Is the report ready to publish?"], ["campaigns.overdue-deliverables", "What operational work is overdue?"], ["campaign.priority-recommendation", "Which campaign should we prioritize?"]].map(([value, label]) => `<option value="${value}" ${state.crm.assistant.questionId === value ? "selected" : ""}>${label}</option>`).join("")}</select></label><label><span>Campaign</span><select name="campaignId">${state.campaigns.map((campaign) => `<option value="${escapeHtml(campaign.id)}" ${state.crm.assistant.campaignId === campaign.id ? "selected" : ""}>${escapeHtml(campaign.name)}</option>`).join("")}</select></label><button class="button button--primary" type="submit">Answer</button></form>${state.crm.assistant.loading ? `<p class="system-message">Checking records...</p>` : state.crm.assistant.error ? `<p class="system-message system-message--error">${escapeHtml(state.crm.assistant.error)}</p>` : renderCrmAssistantAnswer(state.crm.assistant.answer)}</div></aside>`;

const renderOverlay = () => {
  overlayFocusManager.beforeRender(state.drawer);
  if (state.drawer === "search") overlayRoot.innerHTML = renderSearchDrawer();
  else if (state.drawer === "finder") overlayRoot.innerHTML = renderFinderDrawer();
  else if (state.drawer === "manual-campaign") overlayRoot.innerHTML = renderManualCampaignDrawer();
  else if (state.drawer === "manual-creator") overlayRoot.innerHTML = renderManualCreatorDrawer();
  else if (state.drawer === "manual-assignments") overlayRoot.innerHTML = renderManualAssignmentsDrawer();
  else if (state.drawer === "import") overlayRoot.innerHTML = renderImportDrawer();
  else if (state.drawer === "source-form") overlayRoot.innerHTML = renderSourceFormDrawer();
  else if (state.drawer === "deliverable") overlayRoot.innerHTML = renderDeliverableDrawer();
  else if (state.drawer === "payment") overlayRoot.innerHTML = renderPaymentDrawer();
  else if (state.drawer === "payment-approval") overlayRoot.innerHTML = renderPaymentApprovalDrawer();
  else if (state.drawer === "post-verification") overlayRoot.innerHTML = renderPostVerificationDrawer();
  else if (state.drawer === "campaign-update") overlayRoot.innerHTML = renderCampaignUpdateDrawer();
  else if (state.drawer === "gmail") overlayRoot.innerHTML = renderGmailDrawer();
  else if (state.drawer === "creator-gmail") overlayRoot.innerHTML = renderCreatorGmailDrawer();
  else if (state.drawer === "communication-action") overlayRoot.innerHTML = renderCommunicationActionDrawer();
  else if (state.drawer === "rights") overlayRoot.innerHTML = renderRightsDrawer();
  else if (state.drawer === "content-review") overlayRoot.innerHTML = renderContentReviewDrawer();
  else if (state.drawer === "shipping") overlayRoot.innerHTML = renderShippingDrawer();
  else if (state.drawer === "report-builder") {
    overlayRoot.innerHTML = renderReportBuilderDrawer();
    const publishButton = overlayRoot.querySelector('[data-action="publish-report-version"]');
    if (publishButton) {
      const disabled = state.crm.loading || state.crm.error
        ? ' disabled title="The internal CRM must be available before saving"'
        : "";
      publishButton.insertAdjacentHTML(
        "beforebegin",
        `<button class="button button--secondary" data-action="save-report-draft"${disabled}>Save draft</button>`
      );
    }
  }
  else if (state.drawer === "crm-client") overlayRoot.innerHTML = renderCrmClientDrawer();
  else if (state.drawer === "crm-contact") overlayRoot.innerHTML = renderCrmContactDrawer();
  else if (state.drawer === "crm-contact-role") overlayRoot.innerHTML = renderCrmContactRoleDrawer();
  else if (state.drawer === "crm-commercial") overlayRoot.innerHTML = renderCrmCommercialDrawer();
  else if (state.drawer === "crm-attention") overlayRoot.innerHTML = renderCrmAttentionDrawer();
  else if (state.drawer === "crm-proposal") overlayRoot.innerHTML = renderCrmProposalDrawer();
  else if (state.drawer === "crm-assistant") overlayRoot.innerHTML = renderCrmAssistantDrawer();
  else if (state.drawer === "video-connection") overlayRoot.innerHTML = renderVideoConnectionDrawer();
  else if (state.drawer === "private-creator") overlayRoot.innerHTML = renderPrivateCreatorDrawer();
  else if (state.drawer === "admin") overlayRoot.innerHTML = renderAdminDrawer();
  else overlayRoot.innerHTML = "";
  for (const closeButton of overlayRoot.querySelectorAll('.icon-button[aria-label="Close"]')) {
    if (closeButton.textContent.trim() === "\u2715") closeButton.innerHTML = icon("close");
  }
  document.body.classList.toggle("drawer-open", Boolean(state.drawer));
  overlayFocusManager.afterRender(state.drawer);
};

let materialControlsImport;
let lastMaterialView = null;

const upgradeRosterSelectionControls = () => {
  if (!globalThis.customElements?.get("md-checkbox")) return;
  const focusSnapshot = captureFocusSnapshot(app);
  for (const nativeCheckbox of app.querySelectorAll('input[type="checkbox"][data-ops-field="roster-selection"]')) {
    const checkbox = document.createElement("md-checkbox");
    checkbox.setAttribute("touch-target", "wrapper");
    for (const attribute of nativeCheckbox.attributes) {
      if (attribute.name === "type") continue;
      checkbox.setAttribute(attribute.name, attribute.value);
    }
    checkbox.checked = nativeCheckbox.checked;
    checkbox.disabled = nativeCheckbox.disabled;
    checkbox.indeterminate = nativeCheckbox.indeterminate;
    nativeCheckbox.replaceWith(checkbox);
  }
  restoreFocusSnapshot(app, focusSnapshot);
};

function render() {
  document.documentElement.dataset.theme = "botanical";
  if (state.runtime.phase !== "ready") {
      contractEditorPanel.update({enabled:false,visible:false});
    overlayRoot.innerHTML = "";
    overlayFocusManager.afterRender(null);
    app.innerHTML = renderSystemScreen();
    document.body.classList.remove("drawer-open");
    return;
  }
  overlayFocusManager.beforeRender(state.drawer);
  app.innerHTML = renderShell();
  const mainContent = app.querySelector("#main-content");
  if (lastMaterialView !== null && lastMaterialView !== state.view) mainContent?.setAttribute("data-m3-view-enter", "");
  lastMaterialView = state.view;

  if (app.querySelector('input[data-ops-field="roster-selection"]') && !globalThis.customElements?.get("md-checkbox")) {
    materialControlsImport ??= import("./material-controls.mjs").then(() => upgradeRosterSelectionControls()).catch((error) => {
      materialControlsImport = null;
      console.error("Material 3 checkbox could not load; native checkboxes remain available.", error);
    });
  }
  creatorIntakeController.afterRender();
  contractEditorPanel.update({enabled:isLiveMode()});
  renderOverlay();
  if (isLiveMode()) loadVisiblePaidJourneys({ root: app, getCampaign: campaignById, requestJson, rerender: render });
}

const showToast = (message) => {
  toastRoot.innerHTML = `<div class="toast">${escapeHtml(message)}</div>`;
  window.setTimeout(() => {
    toastRoot.innerHTML = "";
  }, 2600);
};

const removeManualCampaignAssignment = async (assignmentId) => {
  const record = assignmentById(assignmentId);
  if (!record || !canEditManualAssignment(record.campaign, record.assignment)) {
    showToast("Your role cannot remove this campaign creator assignment. Nothing was changed.");
    return;
  }
  if (!window.confirm("Remove this creator assignment from the campaign?")) return;
  try {
    await requestJson(`/api/campaigns/${encodeURIComponent(record.campaign.id)}/assignments/${encodeURIComponent(record.assignment.id)}`, {
      method: "DELETE",
      csrf: true,
      body: {
        action: "delete_manual_assignment",
        idempotencyKey: crypto.randomUUID(),
        expectedRevision: record.assignment.revision ?? null
      }
    });
    record.campaign.assignments = record.campaign.assignments.filter((item) => item.id !== record.assignment.id);
    state.editingAssignmentId = null;
    if (isLiveMode()) {
      try {
        await refreshCampaignAssignments(record.campaign.id);
      } catch {
        showToast("Creator removed, but the refreshed roster could not be loaded.");
        render();
        return;
      }
    }
    render();
    showToast("Creator removed from the campaign.");
  } catch (error) {
    showToast(`Nothing was removed. ${error instanceof Error ? error.message : "The assignment could not be removed."}`);
  }
};

const reportFileHtml = (campaign, options = {}) => {
  const totals = reportMetricTotals(campaign);
  const records = campaign.assignments.map((assignment) => {
    const creator = creatorById(assignment.creatorId);
    const eligibility = clientReportEligibility(assignment);
    const deliverables = deliverablesForAssignment(assignment);
    const approvedCount = deliverables.filter((deliverable) => deliverable.approvedVersion && /approved|published|posted|complete/i.test(deliverable.status || "")).length;
    return { assignment, creator, eligibility, deliverables, approvedCount };
  });
  const branding = options.branding || "BYOU + client";
  const expiration = options.expiration || "Not set";
  const selectedModules = new Set(Array.isArray(options.modules) ? options.modules : reportBuilderModules.filter((_, index) => index !== 6));
  const selectedMetrics = new Set(Array.isArray(options.metrics) ? options.metrics : ["Views"]);
  const metricField = (metric) => ({
    Views: "views",
    Likes: "likes",
    Comments: "comments",
    Saves: "saves",
    Shares: "shares"
  })[metric];
  const metricValue = (record, metric) => record.eligibility.metrics ? record.assignment.performance?.[metricField(metric)] : null;
  const formatReportMetric = (metric, value) => {
    if (!Number.isFinite(value)) return "Missing";
    return formatCompact(value);
  };
  const totalForMetric = (metric) => {
    const values = records.map((record) => metricValue(record, metric)).filter(Number.isFinite);
    if (!values.length) return null;
    return values.reduce((sum, value) => sum + value, 0);
  };
  const selectedMetricLabels = reportBuilderMetrics.filter((metric) => selectedMetrics.has(metric));
  const metricHeaders = selectedMetricLabels.map((metric) => `<th>${escapeHtml(metric)}</th>`).join("");
  const metricCells = (record) => selectedMetricLabels.map((metric) => `<td>${formatReportMetric(metric, metricValue(record, metric))}</td>`).join("");
  const summaryBlock = selectedModules.has("Campaign summary and objectives")
    ? `<p>${escapeHtml(campaign.objective)}</p><p class="meta">${escapeHtml(campaign.client)} / ${escapeHtml(campaign.brand)} - ${formatDate(campaign.startDate)} to ${formatDate(campaign.endDate)} - Expires: ${escapeHtml(expiration)}</p>`
    : "";
  const completionBlock = selectedModules.has("Creator and deliverable completion")
    ? `<h2>Creator and deliverable completion</h2><table><thead><tr><th>Creator</th><th>Approved deliverables</th><th>Completion</th></tr></thead><tbody>${records.map(({ creator, deliverables, approvedCount }) => `<tr><td>${escapeHtml(creatorDisplayName(creator))}</td><td>${approvedCount}/${deliverables.length} approved</td><td>${approvedCount === deliverables.length && deliverables.length ? "Complete" : "In progress"}</td></tr>`).join("")}</tbody></table>`
    : "";
  const contentBlock = selectedModules.has("Content gallery")
    ? `<h2>Content gallery</h2><table><thead><tr><th>Creator</th><th>Deliverable</th><th>Post</th></tr></thead><tbody>${records.map(({ assignment, creator, eligibility, deliverables }) => `<tr><td>${escapeHtml(creatorDisplayName(creator))}</td><td>${escapeHtml(deliverables[0]?.name || "Campaign deliverable")}</td><td>${eligibility.exactPost ? `<a href="${escapeHtml(assignment.post.url)}">Open post</a>` : "Not available"}</td></tr>`).join("")}</tbody></table>`
    : "";
  const performanceBlock = selectedModules.has("Verified platform performance")
    ? `<h2>Performance</h2>${selectedMetricLabels.length ? `<div class="totals">${selectedMetricLabels.map((metric) => `<div><span>${escapeHtml(metric)}</span><strong>${formatReportMetric(metric, totalForMetric(metric))}</strong></div>`).join("")}</div><table><thead><tr><th>Creator</th>${metricHeaders}<th>Source</th></tr></thead><tbody>${records.map((record) => `<tr><td>${escapeHtml(creatorDisplayName(record.creator))}</td>${metricCells(record)}<td>${record.eligibility.metrics ? `${escapeHtml(record.assignment.performance.sourceRecordId)} - ${escapeHtml(record.assignment.performance.source)}` : "Missing"}</td></tr>`).join("")}</tbody></table>` : `<p class="note">No performance metrics selected.</p>`}`
    : "";
  const comparisonBlock = selectedModules.has("Creator and platform comparisons")
    ? `<h2>Creator and platform comparison</h2><table><thead><tr><th>Creator</th><th>Platform</th>${metricHeaders}</tr></thead><tbody>${records.map((record) => `<tr><td>${escapeHtml(creatorDisplayName(record.creator))}</td><td>${escapeHtml(record.assignment.post?.platform || "Not available")}</td>${metricCells(record)}</tr>`).join("")}</tbody></table>`
    : "";
  const rankingMetric = selectedMetricLabels.find((metric) => records.some((record) => Number.isFinite(metricValue(record, metric))));
  const rankedRecords = rankingMetric
    ? records.filter((record) => Number.isFinite(metricValue(record, rankingMetric))).sort((a, b) => metricValue(b, rankingMetric) - metricValue(a, rankingMetric))
    : [];
  const topContentBlock = selectedModules.has("Top-performing content")
    ? `<h2>Top-performing content</h2>${rankingMetric ? `<table><thead><tr><th>Rank</th><th>Creator</th><th>Platform</th><th>${escapeHtml(rankingMetric)}</th><th>Post</th></tr></thead><tbody>${rankedRecords.map((record, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(creatorDisplayName(record.creator))}</td><td>${escapeHtml(record.assignment.post.platform)}</td><td>${formatReportMetric(rankingMetric, metricValue(record, rankingMetric))}</td><td><a href="${escapeHtml(record.assignment.post.url)}">Open post</a></td></tr>`).join("")}</tbody></table>` : `<p class="note">No ranked content yet.</p>`}`
    : "";
  const costPerView = Number.isFinite(totals.views) && totals.views > 0 && Number.isFinite(campaign.budget) ? campaign.budget / totals.views : null;
  const budgetBlock = selectedModules.has("Budget and cost-per-result")
    ? `<h2>Budget and cost per result</h2><div class="totals"><div><span>Campaign budget</span><strong>${formatCurrency(campaign.budget)}</strong></div><div><span>Cost per view</span><strong>${Number.isFinite(costPerView) ? costPerView.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "Missing"}</strong></div></div>`
    : "";
  const missingBlock = selectedModules.has("Missing or unverified data")
    ? `<h2>Missing data</h2><p class="note">No additional data available.</p>`
    : "";
  return `<!doctype html><html><head><meta charset="utf-8"><title>INTERNAL DRAFT - ${escapeHtml(campaign.name)} closeout</title><style>@font-face{font-family:"Brannan Neue Haas Display";src:url("/fonts/NeueHaasDisplayLight.ttf") format("truetype");font-weight:300;font-display:swap}@font-face{font-family:"Brannan Neue Haas Display";src:url("/fonts/NeueHaasDisplayRoman.ttf") format("truetype");font-weight:400;font-display:swap}@font-face{font-family:"Brannan Neue Haas Display";src:url("/fonts/NeueHaasDisplayMediu.ttf") format("truetype");font-weight:500;font-display:swap}*{box-sizing:border-box}body{font:400 14px/1.5 "Brannan Neue Haas Display","Helvetica Neue",Helvetica,Arial,sans-serif;color:#050505;max-width:1100px;margin:0 auto;padding:48px 28px;background:#fff;font-variant-numeric:tabular-nums}h1{font-size:36px;font-weight:300;line-height:1.05;letter-spacing:-.035em;margin:10px 0 22px}h2{font-size:20px;font-weight:400;letter-spacing:-.018em;margin:38px 0 10px;padding-top:18px;border-top:1px solid #d8d8d2}p{line-height:1.6}.meta{color:#6f6f68;font-size:10px;font-weight:500;letter-spacing:.08em;text-transform:uppercase}.draft-warning{border:2px solid #9b1c1c;background:#fff3f3;color:#7a1515;padding:14px 16px;font-weight:500;letter-spacing:.04em;text-transform:uppercase}table{border-collapse:collapse;width:100%;margin-top:12px;border:1px solid #d8d8d2}th,td{text-align:left;padding:11px 12px;border-bottom:1px solid #d8d8d2;vertical-align:top}th{background:#f7f5ef;color:#6f6f68;font-size:10px;font-weight:500;letter-spacing:.08em;text-transform:uppercase}td{font-weight:400}a{color:#14253b;text-underline-offset:3px}.totals{display:flex;margin:16px 0 24px;flex-wrap:wrap;border:1px solid #d8d8d2}.totals div{padding:16px;border-right:1px solid #d8d8d2;min-width:180px}.totals div:last-child{border-right:0}.totals span{display:block;color:#6f6f68;font-size:10px;font-weight:500;letter-spacing:.08em;text-transform:uppercase}.totals strong{display:block;margin-top:4px;font-size:24px;font-weight:400;letter-spacing:-.025em}.note{border-left:3px solid #14253b;background:#f7f5ef;padding:16px}</style></head><body><p class="draft-warning">INTERNAL DRAFT — NOT PUBLISHED</p><p class="meta">${escapeHtml(campaign.reportId)} - ${escapeHtml(branding)} branding</p><h1>${escapeHtml(campaign.name)}</h1>${summaryBlock}${completionBlock}${contentBlock}${performanceBlock}${comparisonBlock}${topContentBlock}${budgetBlock}${missingBlock}</body></html>`;
};

const downloadHtmlFile = (html, fileName) => {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

const currentReportOptions = () => ({
  branding: state.reportBuilderBranding,
  expiration: state.reportBuilderExpiration,
  modules: state.reportModuleOrder.filter((module) => state.reportModuleVisibility[module]),
  metrics: reportBuilderMetrics.filter((metric) => state.reportMetricVisibility[metric])
});

const downloadReport = (reportId) => {
  const campaign = reportCampaign(reportId);
  if (!campaign) return;
  const options = currentReportOptions();
  if (!options.modules.length) {
    showToast("Select at least one report section before downloading.");
    return;
  }
  downloadHtmlFile(
    reportFileHtml(campaign, options),
    `${campaign.reportId}-${campaign.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}.html`
  );
  showToast("Draft downloaded.");
};

const downloadReportVersion = async (versionId) => {
  const metadata = artifactVersionMetadata("report", versionId);
  if (artifactVersionUnavailable(metadata)) {
    showToast("This version is expired, revoked, or unavailable.");
    return;
  }
  const version = await loadCrmArtifactVersion("report", versionId);
  if (!version) return;
  if (!version.html) {
    showToast("This version can be viewed but not downloaded.");
    return;
  }
  downloadHtmlFile(version.html, `${version.id.toLowerCase()}.html`);
  showToast(`${version.id} downloaded.`);
};

const queueVideoRefresh = async (control) => {
  if (!isLiveMode()) return;
  const postId = control.dataset.post;
  const attributionId = control.dataset.attribution;
  const video = state.videoTracking.items.find((item) => item.postId === postId);
  if (!video?.canRefresh || !attributionId) {
    showToast("This exact post is not eligible for a manual refresh.");
    return;
  }
  state.videoTracking.refreshingPostIds.add(postId);
  render();
  try {
    await requestJson("/api/video-tracking/refresh", {
      method: "POST",
      csrf: true,
      body: { action: "queue_refresh", attributionId }
    });
    state.videoTracking.refreshingPostIds.delete(postId);
    showToast("Refresh queued. Metrics will update after the worker finishes.");
    await loadVideoTracking();
  } catch (error) {
    state.videoTracking.refreshingPostIds.delete(postId);
    render();
    showToast(error instanceof Error ? error.message : "The refresh could not be queued.");
  }
};

const verifyAndQueueVideo = async (control) => {
  if (!isLiveMode()) return;
  const postId = control.dataset.post;
  const attributionId = control.dataset.attribution;
  const video = state.videoTracking.items.find((item) => item.postId === postId);
  if (!video || !attributionId) {
    showToast("This post does not have an exact attribution to review.");
    return;
  }
  if (state.videoTracking.confirmingPostId !== postId) {
    state.videoTracking.confirmingPostId = postId;
    state.videoTracking.actionMessageByPostId.set(
      postId,
      "Confirm you opened this exact video and verified the creator, platform, and campaign."
    );
    render();
    showToast("Confirm you opened this exact video and verified the creator, platform, and campaign. Then click Confirm & queue.");
    return;
  }

  state.videoTracking.confirmingPostId = null;
  state.videoTracking.actionMessageByPostId.delete(postId);
  state.videoTracking.reviewingPostIds.add(postId);
  render();
  let verified = false;
  try {
    await requestJson("/api/video-tracking/verify", {
      method: "POST",
      csrf: true,
      body: {
        action: "verify_exact_post",
        attributionId,
        verificationMethod: "manual_url_review"
      }
    });
    verified = true;
    await requestJson("/api/video-tracking/refresh", {
      method: "POST",
      csrf: true,
      body: { action: "queue_refresh", attributionId }
    });
    const message = "Post verified and refresh queued. Metrics will update after the worker finishes.";
    state.videoTracking.actionMessageByPostId.set(postId, message);
    showToast(message);
  } catch (error) {
    const fallback = verified
      ? "The post was verified, but its refresh could not be queued."
      : "The exact post could not be verified.";
    const message = verified ? fallback : error instanceof Error ? error.message : fallback;
    state.videoTracking.actionMessageByPostId.set(postId, message);
    showToast(message);
  } finally {
    state.videoTracking.reviewingPostIds.delete(postId);
    await loadVideoTracking();
  }
};

const activateTrackifyImport = async () => {
  if (!isLiveMode()) return;
  const fileSha256 = String(state.videoTracking.activationSha || "").trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(fileSha256)) {
    showToast("Enter the exact 64-character Trackify import fingerprint.");
    return;
  }
  state.videoTracking.activation = { loading: true, result: null, error: null };
  render();
  try {
    let result = null;
    let previousRemaining = Number.POSITIVE_INFINITY;
    let previousInitializationRemaining = Number.POSITIVE_INFINITY;
    for (let batch = 0; batch < 200; batch += 1) {
      const payload = await requestJson("/api/video-tracking/activate-import", {
        method: "POST",
        csrf: true,
        body: { action: "activate_exact_trackify_import", fileSha256, batchSize: 50 }
      });
      result = payload?.data ?? payload;
      state.videoTracking.activation = { loading: true, result, error: null };
      render();
      if (result.completed) break;
      if (result.phase === "initializing") {
        const remainingImportRows = Number(result.remainingImportRows);
        if (
          !Number.isFinite(remainingImportRows) ||
          remainingImportRows >= previousInitializationRemaining ||
          Number(result.initializedThisCall) < 1
        ) throw new Error("Trackify activation stopped making progress and can be safely resumed.");
        previousInitializationRemaining = remainingImportRows;
      } else {
        const remaining = Number(result.remainingPosts);
        if (!Number.isFinite(remaining) || remaining >= previousRemaining || Number(result.processedThisCall) < 1) {
          throw new Error("Trackify activation stopped making progress and can be safely resumed.");
        }
        previousRemaining = remaining;
      }
    }
    if (!result?.completed) {
      throw new Error("Trackify activation reached its safety limit and can be safely resumed.");
    }
    state.videoTracking.activation = { loading: false, result, error: null };
    showToast(`${Number(result.queuedPosts || 0).toLocaleString()} exact creator videos queued for SocialCrawl.`);
    await loadVideoTracking();
  } catch (error) {
    const message = error instanceof Error ? error.message : "The Trackify import could not be activated.";
    state.videoTracking.activation = { loading: false, result: null, error: message };
    render();
    showToast(message);
  }
};

const freshVideoConnectionState = (overrides = {}) => ({
  loadingOptions: false,
  options: [],
  query: "",
  truncated: false,
  error: null,
  stage: "entry",
  selectedPlacementId: "",
  draftUrls: "",
  reviewUrls: [],
  idempotencyKey: null,
  saving: false,
  result: null,
  ...overrides
});

const loadVideoConnectionOptions = async (query = "") => {
  const previous = state.videoTracking.connection || freshVideoConnectionState();
  const normalizedQuery = String(query || "").trim();
  state.videoTracking.connection = {
    ...previous,
    query: normalizedQuery,
    loadingOptions: true,
    error: null
  };
  renderOverlay();
  try {
    const payload = collectionPayload(await requestJson(
      `/api/video-tracking/connect-options?${new URLSearchParams({
        limit: "250",
        ...(normalizedQuery ? { q: normalizedQuery } : {})
      })}`
    ));
    const options = Array.isArray(payload.items) ? payload.items : [];
    state.videoTracking.connection = {
      ...previous,
      loadingOptions: false,
      error: null,
      query: normalizedQuery,
      options,
      truncated: Boolean(payload.truncated),
      selectedPlacementId: options[0]?.placementId || ""
    };
  } catch (error) {
    state.videoTracking.connection = {
      ...previous,
      loadingOptions: false,
      query: normalizedQuery,
      error: error instanceof Error ? error.message : "Creator placements could not be loaded."
    };
  }
  renderOverlay();
};

const researchAuthenticated = () => isLiveMode() && state.runtime.phase === "ready";
const researchReviewer = () => canRecordTopicEvidence({
  authenticated: researchAuthenticated(), roles: state.currentUser.roles || []
});

const runCreatorResearch = async (queryText, samePost = state.creatorResearch.samePost) => {
  if (!researchAuthenticated() && !state.runtime.creatorResearchPreview) return;
  const research = state.creatorResearch;
  if (research.loading) return;
  const queryTextTrimmed = String(queryText || "").trim();
  research.submittedQuery = queryTextTrimmed;
  research.submittedSamePost = samePost === true;
  research.submittedCostcoOnly = research.costcoOnly === true;
  research.loading = true;
  research.result = null;
  research.error = null;
  render();
  try {
    const payload = await requestJson("/api/creator-research/search", {
      method: "POST", csrf: true, body: { query: queryTextTrimmed, samePost: research.submittedSamePost, costcoOnly: research.submittedCostcoOnly }
    });
    if (state.creatorResearch !== research) return;
    if (!payload?.interpretation || !Array.isArray(payload?.data?.matches)) {
      throw new Error("The search response was incomplete. No results can be shown.");
    }
    research.result = payload;
  } catch (error) {
    if (state.creatorResearch !== research || error instanceof StaleSessionError) return;
    research.error = error instanceof Error ? error.message : "The creator search could not be completed.";
  }
  if (state.creatorResearch !== research) return;
  research.loading = false;
  render();
};

const loadResearchEvidenceVideos = async (queryText) => {
  if (!researchReviewer()) return;
  const research = state.creatorResearch;
  if (research.evidenceLoading) return;
  research.evidenceVideoQuery = String(queryText || "").trim();
  research.evidenceLoading = true;
  research.evidenceError = null;
  render();
  try {
    const parameters = new URLSearchParams({ limit: "100" });
    if (research.evidenceVideoQuery) parameters.set("q", research.evidenceVideoQuery);
    const payload = collectionPayload(await requestJson(`/api/video-tracking?${parameters}`));
    if (state.creatorResearch !== research) return;
    research.evidenceVideos = Array.isArray(payload.items) ? payload.items : [];
  } catch (error) {
    if (state.creatorResearch !== research || error instanceof StaleSessionError) return;
    research.evidenceError = error instanceof Error ? error.message : "Verified videos could not be loaded.";
  }
  if (state.creatorResearch !== research) return;
  research.evidenceLoading = false;
  render();
};

const saveResearchEvidence = async (form) => {
  if (!researchReviewer()) return;
  const research = state.creatorResearch;
  if (research.evidenceSaving) return;
  const body = Object.fromEntries(["postId", "topic", "reviewStatus", "evidenceUrl", "evidenceDate", "observation"]
    .map((key) => [key, String(form.get(key) || "").trim()]));
  research.evidenceDraft = body;
  research.evidenceSaving = true;
  research.evidenceError = null;
  research.evidenceMessage = null;
  render();
  try {
    await requestJson("/api/creator-research/evidence", { method: "POST", csrf: true, body });
    if (state.creatorResearch !== research) return;
    research.evidenceMessage = "Topic review recorded.";
    research.evidenceDraft = createCreatorResearchState().evidenceDraft;
    research.evidenceSaving = false;
    if (research.submittedQuery && !research.loading) await runCreatorResearch(research.submittedQuery, research.submittedSamePost);
  } catch (error) {
    if (state.creatorResearch !== research || error instanceof StaleSessionError) return;
    research.evidenceError = error instanceof Error ? error.message : "The topic review could not be recorded.";
  }
  if (state.creatorResearch !== research) return;
  research.evidenceSaving = false;
  render();
};

const selectLibraryCreator = (id,checked) => {
  const s=state.creatorLibrary;if(campaignOps.selectionBusy)return;
  const creator=s.items.find(c=>c.id===id)||s.selectedCreators.find(c=>c.id===id);if(!creator)return;
  try{s.selectedCreators=toggleCreatorSelection(s.selectedCreators,creator,checked);}catch(error){showToast(error.message);return;}
  render();
};
const openLibraryCreator = async id => {
  ++routeRestoreVersion;
  state.drawer=null;state.creatorLibrary.showManaged=false;
  if(state.view==='creators')creatorDirectoryScroll=window.scrollY;
  state.view='creators';state.creatorLibrary.profileTab='overview';state.creatorLibrary.selectedDealId=null;
  writeLibraryRoute(id,true);await loadCreatorLibrary({creatorId:id});
  window.scrollTo({top:0,behavior:'instant'});
};
app.addEventListener('toggle', (event) => {
  const section = event.target?.dataset?.campaignSection;
  if (['Upcoming','Active','Completed','Other records'].includes(section)) state.campaignSectionsExpanded[section] = event.target.open;
}, true);
app.addEventListener('change',event=>{if(event.target.matches('[data-library-select]'))selectLibraryCreator(event.target.dataset.librarySelect,event.target.checked);});
app.addEventListener("click", async (event) => {
  const control = event.target.closest("[data-action]");
  if (!control) {const card=event.target.closest('[data-creator-card]');if(card&&!event.target.closest('a,button,input,label,select'))selectLibraryCreator(card.dataset.creatorCard);return;}
  const action = control.dataset.action;
  if (action === 'open-settings') { settingsTab='profile';profileError='';profileNotice='';setRoute('settings');return; }
  if (action === 'settings-tab') { settingsTab=control.dataset.tab==='automations'?'automations':'profile';setRoute('settings');return; }
  if(action==='library-export'){await exportCreatorLibrary();return;}
  if(action==='library-select-page'){const s=state.creatorLibrary;if(s.loading||campaignOps.selectionBusy)return;try{s.selectedCreators=selectCreatorPage(s.selectedCreators,s.items);render();}catch(e){showToast(e.message);}return;}
  if(action==='library-clear-selection'){if(!campaignOps.selectionBusy){state.creatorLibrary.selectedCreators=[];render();}return;}
  if(action==='library-unselect'){selectLibraryCreator(control.dataset.id,false);return;}
  if(action==='library-open'){await openLibraryCreator(control.dataset.id);return;}
  if(action==='library-open-managed'){
    if(!isLiveMode())return;
    try{
      const payload=await requestJson(`/api/creators/${encodeURIComponent(control.dataset.id)}`);
      const [creator]=adaptWorkspaceRecords('creators',[payload?.data??payload]);
      if(!creator)throw new Error('No linked staff record is available for this creator.');
      mergeCreatorRecords([creator]);state.selectedCreatorId=creator.id;state.profileTab='overview';setRoute('creator');
    }catch{showToast('No linked staff record is available for this creator.');}
    return;
  }
  if(action==='library-profile-tab'){if(libraryTabs.has(control.dataset.tab)){state.creatorLibrary.profileTab=control.dataset.tab;writeLibraryRoute(state.creatorLibrary.selected?.id,true);render();}return;}
  if(action==='library-view-mode'){const s=state.creatorLibrary;s.viewMode='gallery';s.limit=8;s.offset=0;writeLibraryRoute();await loadCreatorLibrary();return;}
  if(action==='library-play'){state.creatorLibrary.activePlayerId=control.dataset.id;render();return;}
  if(action==='library-commercial-view'){state.creatorLibrary.commercialView=control.dataset.view==='quotes'?'quotes':'deals';render();return;}
  if(action==='library-deal-open'){state.creatorLibrary.selectedDealId=control.dataset.id;state.creatorLibrary.profileTab='rates';state.creatorLibrary.commercialView='deals';writeLibraryRoute(state.creatorLibrary.selected?.id,true);render();return;}
  if(action==='library-deal-close'){state.creatorLibrary.selectedDealId=null;writeLibraryRoute(state.creatorLibrary.selected?.id,true);render();return;}
  if(action==='library-edit-deal'){
    if(!isLiveMode())return;
    const campaignId=control.dataset.campaign,assignmentId=control.dataset.assignment;
    state.selectedCampaignId=campaignId;setRoute('campaign');
    await loadCampaignDetail(campaignId);
    const record=assignmentById(assignmentId);
    if(record&&canEditManualAssignment(record.campaign,record.assignment)){
      state.editingAssignmentId=assignmentId;state.drawer='manual-assignments';renderOverlay();
    }else showToast('The canonical campaign is open. Your role cannot edit this assignment, or its link needs review.');
    return;
  }
  if(action==='library-back'){state.creatorLibrary.selected=null;writeLibraryRoute(null,true);if(state.creatorLibrary.total===null)await loadCreatorLibrary({offset:state.creatorLibrary.offset});else render();window.scrollTo({top:creatorDirectoryScroll,behavior:'instant'});return;}
  if(action==='library-page'){await loadCreatorLibrary({offset:Number(control.dataset.offset)});writeLibraryRoute();window.scrollTo({top:0,behavior:'instant'});return;}
  if(action==='library-retry'){await loadCreatorLibrary(state.creatorLibrary.lastRequest||{offset:state.creatorLibrary.offset});return;}
  if(action==='library-remove-photo'){
    const s=state.creatorLibrary;if(!s.selected?.canEditPhoto||s.photoBusy||s.photoPreparing)return;
    s.photoDraft={creatorId:s.selected.id,value:null};s.photoError=null;s.photoNotice=null;render();return;
  }
  if(action==='library-cancel-photo'){if(!state.creatorLibrary.photoBusy&&!state.creatorLibrary.photoPreparing){state.creatorLibrary.photoDraft=undefined;state.creatorLibrary.photoError=null;render();}return;}
  if(action==='library-clear-search'){Object.assign(state.creatorLibrary,{query:'',nameQuery:'',aiPlan:null,interpretation:null,brands:[],campaign:'',stage:'',platform:'',collaboration:'',agency:'',emailAvailability:'',costcoOnly:false,sort:'complete'});await loadCreatorLibrary();writeLibraryRoute();return;}
  if(action==='library-clear-filters'){Object.assign(state.creatorLibrary,{brands:[],campaign:'',stage:''});await loadCreatorLibrary();writeLibraryRoute();return;}
  if(action==='library-save-view'){
    const s=state.creatorLibrary;
    try {s.savedViews=saveCreatorView(window.localStorage,state.currentUser.id,document.querySelector('[data-creator-view-name]')?.value,s);render();showToast('Creator view saved on this browser.');}
    catch(error){showToast(error.message||'Creator view could not be saved.');}
    return;
  }
  if(action==='library-load-view'){
    const view=readCreatorViews(window.localStorage,state.currentUser.id).find(item=>item.name===control.dataset.name);
    if(!view)return;
    Object.assign(state.creatorLibrary,{query:view.q,nameQuery:view.q,aiPlan:null,interpretation:null,platform:view.platform,collaboration:view.collaboration,agency:view.agency||'',emailAvailability:view.emailAvailability||'',brands:view.brands,campaign:view.campaign,stage:view.stage,sort:view.sort,costcoOnly:view.costcoOnly,offset:0});
    writeLibraryRoute();await loadCreatorLibrary();return;
  }
  if(action==='library-delete-view'){state.creatorLibrary.savedViews=deleteCreatorView(window.localStorage,state.currentUser.id,control.dataset.name);render();return;}
  if(action==='library-toggle-filters'){state.creatorLibrary.filtersExpanded=!state.creatorLibrary.filtersExpanded;render();return;}
  if(action==='library-network'){state.creatorLibrary.showManaged=false;render();void loadCreatorLibrary();return;}
  if (action === "research-use-example") {
    state.creatorResearch.query = CREATOR_RESEARCH_EXAMPLE;
    render();
    document.querySelector("#creator-research-query")?.focus();
    return;
  }
  if (action === "toggle-research-evidence") {
    if (!researchReviewer()) return;
    state.creatorResearch.evidenceOpen = !state.creatorResearch.evidenceOpen;
    render();
    return;
  }
  if (action === "retry-bootstrap") {
    bootstrap();
    return;
  }
  if (action === "retry-creators") {
    void loadCreatorPage();
    return;
  }
  if (action === "retry-video-tracking") {
    void loadVideoTracking();
    return;
  }
  if (["trackify-previous", "trackify-next"].includes(action)) {
    state.videoOffset = Math.max(0, state.videoOffset + (action === "trackify-next" ? 50 : -50));
    await loadVideoTracking(); return;
  }
  if (action === "reload-video-tracking") {
    void loadVideoTracking();
    return;
  }
  if (action === "open-video-connector") {
    const allowed = isLiveMode() && (state.currentUser.roles || []).some((role) =>
      ["admin", "reviewer"].includes(String(role).toLowerCase())
    );
    if (!allowed) {
      showToast("Your role cannot verify and connect creator videos.");
      return;
    }
    state.drawer = "video-connection";
    renderOverlay();
    void loadVideoConnectionOptions();
    return;
  }
  if (action === "queue-video-refresh") {
    await queueVideoRefresh(control);
    return;
  }
  if (action === "verify-and-queue-video") {
    await verifyAndQueueVideo(control);
    return;
  }
  if (action === "activate-trackify-import") {
    await activateTrackifyImport();
    return;
  }
  if (action === "load-more-creators") {
    void loadCreatorPage({ append: true });
    return;
  }
  if (action === "load-more-campaigns") {
    void loadCampaignPage({ append: true });
    return;
  }
  if (action === "load-more-talent-agencies") {
    void loadRepresentationPage("talentAgencies", { append: true });
    return;
  }
  if (action === "load-more-talent-managers") {
    void loadRepresentationPage("talentManagers", { append: true });
    return;
  }
  if (action === "sign-out") {
    try {
      await requestJson("/api/auth/logout", { method: "POST", body: {}, csrf: true });
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Sign-out could not be completed.");
      return;
    }
    state.csrfToken = null;
    state.createdReviewLinks = {};
    clearCrmSensitiveState();
    state.runtime.phase = "signed-out";
    state.runtime.message = null;
    render();
    return;
  }
  if (action === "navigate") setRoute(control.dataset.view);
  if (action === "open-client") {
    state.selectedClientId = control.dataset.id;
    state.clientTab = "overview";
    setRoute("client");
  }
  if (action === "retry-client-detail") {
    await loadCrmClient(control.dataset.id || state.selectedClientId);
  }
  if (action === "client-tab") {
    state.clientTab = control.dataset.tab || "overview";
    render();
  }
  if (action === "new-client") {
    state.editingClientId = null;
    state.drawer = "crm-client";
    renderOverlay();
  }
  if (action === "edit-client") {
    state.editingClientId = control.dataset.id || state.selectedClientId;
    state.drawer = "crm-client";
    renderOverlay();
  }
  if (action === "new-client-contact") {
    state.selectedClientId = control.dataset.client || state.selectedClientId;
    state.editingClientContactId = null;
    state.drawer = "crm-contact";
    renderOverlay();
  }
  if (action === "assign-contact-role") {
    state.selectedClientId = control.dataset.client || state.selectedClientId;
    state.editingClientRoleContactId = control.dataset.contact || null;
    state.editingClientRoleCampaignId = control.dataset.campaign || null;
    state.drawer = "crm-contact-role";
    renderOverlay();
  }
  if (action === "edit-client-commercial") {
    state.selectedClientId = control.dataset.client || state.selectedClientId;
    state.editingCommercialCampaignId = control.dataset.campaign || state.selectedCampaignId;
    state.drawer = "crm-commercial";
    renderOverlay();
  }
  if (action === "edit-attention") {
    state.editingAttentionId = control.dataset.id;
    state.drawer = "crm-attention";
    renderOverlay();
  }
  if (action === "resolve-attention") {
    await runCrmAction({
      command: "attention.resolve",
      attentionId: control.dataset.id,
      resolutionNote: "Resolved by BYOU staff from the operational Attention workspace."
    }, "Operational attention resolved.");
  }
  if (action === "open-proposal") {
    state.selectedProposalId = control.dataset.id;
    setRoute("proposal");
  }
  if (action === "open-campaign-step") {
    state.selectedCampaignId = control.dataset.id;
    state.campaignTab = control.dataset.tab || "summary";
    setRoute("campaign");
    void ensureCampaignOperations(state.selectedCampaignId);
  }
  if (action === "open-proposal-campaign") {
    const campaignId = control.dataset.campaign || state.selectedCampaignId || state.campaigns[0]?.id;
    if (!campaignId) {
      setRoute("campaigns");
      return;
    }
    state.selectedCampaignId = campaignId;
    state.campaignTab = "creators";
    setRoute("campaign");
    void ensureCampaignOperations(campaignId);
  }
  if (action === "new-proposal") {
    const campaignId = control.dataset.campaign || state.selectedCampaignId || state.campaigns[0]?.id;
    if (!campaignId) {
      showToast("Open a campaign with creator assignments before creating a proposal.");
      return;
    }
    state.selectedCampaignId = campaignId;
    if (isLiveMode()) await ensureCampaignOperations(campaignId, { notify: true });
    if (!(campaignById(campaignId)?.assignments || []).length) {
      state.campaignTab = "creators";
      setRoute("campaign");
      showToast("Add at least one campaign assignment before creating a proposal.");
      return;
    }
    state.editingProposalId = null;
    state.drawer = "crm-proposal";
    renderOverlay();
  }
  if (action === "edit-proposal") {
    state.editingProposalId = control.dataset.id || state.selectedProposalId;
    state.drawer = "crm-proposal";
    renderOverlay();
  }
  if (action === "publish-proposal") {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await runCrmAction({
      command: "proposal.publish",
      proposalId: control.dataset.id,
      expiresAt
    }, "Proposal version published.");
  }
  if (action === "proposal-outcome") {
    await runCrmAction({
      command: "proposal.record-outcome",
      proposalId: control.dataset.id,
      proposalVersionId: control.dataset.version,
      outcome: control.dataset.outcome
    }, `Proposal outcome recorded as ${String(control.dataset.outcome || "").replaceAll("_", " ")}.`);
  }
  if (action === "revoke-crm-artifact") {
    await revokeCrmArtifact(control);
  }
  if (action === "open-crm-assistant") {
    const client = crmClientById(control.dataset.client || state.selectedClientId);
    state.crm.assistant.campaignId = control.dataset.campaign || crmCampaignsForClient(client)[0]?.id || state.selectedCampaignId;
    state.crm.assistant.answer = null;
    state.crm.assistant.error = null;
    state.drawer = "crm-assistant";
    renderOverlay();
  }
  if (action === "open-search") {
    state.drawer = "search";
    renderOverlay();
    requestAnimationFrame(() => document.querySelector("#global-search-input")?.focus());
  }
  if (action === "open-templates") setRoute("templates");
  if (action === "campaign-filter") {
    state.campaignFilter = control.dataset.filter || "All Campaigns";
    render();
    if (isLiveMode()) void loadCampaignPage();
  }
  if(action==='campaign-clear-filters'){state.campaignTypeFilter='';state.campaignStatusFilter='';state.campaignSearch='';syncCampaignUrl();render();if(isLiveMode())void loadCampaignPage();return;}
  if(action==='campaign-save-view'){
    try {
      saveCampaignView(window.localStorage,state.currentUser.id,document.querySelector('[data-campaign-view-name]')?.value,{
        q:state.campaignSearch,type:state.campaignTypeFilter,status:state.campaignStatusFilter
      });
      render();showToast('Campaign view saved on this browser.');
    } catch(error){showToast(error.message||'Campaign view could not be saved.');}
    return;
  }
  if(action==='campaign-load-view'){
    const view=readCampaignViews(window.localStorage,state.currentUser.id).find(item=>item.name===control.dataset.name);
    if(!view)return;
    state.campaignSearch=view.q;state.campaignTypeFilter=view.type;state.campaignStatusFilter=view.status;
    syncCampaignUrl();render();if(isLiveMode())void loadCampaignPage();return;
  }
  if(action==='campaign-delete-view'){
    deleteCampaignView(window.localStorage,state.currentUser.id,control.dataset.name);
    render();return;
  }
  if (action === "roster-view") {
    state.rosterFilter = control.dataset.view || "All creators";
    render();
  }
  if(action==='roster-column-set'){state.rosterColumnSet=control.dataset.set==='finance'?'finance':'operations';render();return;}
  if (action === "open-creator") {
    state.drawer = null;
    state.selectedCreatorId = control.dataset.id;
    state.profileTab = "overview";
    setRoute("creator");
  }
  if (action === "open-talent-agency") {
    state.selectedTalentAgencyId = control.dataset.id;
    setRoute("talent-agency");
  }
  if (action === "open-talent-manager") {
    state.selectedTalentManagerId = control.dataset.id;
    setRoute("talent-manager");
  }
  if (action === "open-campaign") {
    state.drawer = null;
    state.selectedCampaignId = control.dataset.id;
    state.campaignTab = "summary";
    setRoute("campaign");
    void loadCampaignWorkspace(state.selectedCampaignId);
  }
  if (action === "open-report") {
    state.selectedReportId = control.dataset.id;
    state.selectedReportVersionId = null;
    setRoute("report");
    const campaign = reportCampaign(state.selectedReportId);
    if (campaign) void ensureCampaignOperations(campaign.id);
  }
  if (action === "open-report-version") {
    state.selectedReportId = control.dataset.id;
    state.selectedReportVersionId = control.dataset.version || null;
    setRoute("report");
    if (state.selectedReportVersionId) await loadCrmArtifactVersion("report", state.selectedReportVersionId);
  }
  if (action === "select-source") {
    state.selectedSourceId = control.dataset.id;
    setRoute("sources");
  }
  if (action === "profile-tab") {
    state.profileTab = control.dataset.tab;
    setRoute(state.view);
  }
  if (action === "campaign-tab") {
    state.campaignTab = control.dataset.tab;
    setRoute(state.view);
    void ensureCampaignOperations(state.selectedCampaignId);
  }
  if (action === "content-review") {
    state.editingAssignmentId = control.dataset.assignment;
    state.editingDeliverableId = control.dataset.deliverable;
    state.drawer = "content-review";
    renderOverlay();
  }
  if (action === "shipping-details") {
    state.editingAssignmentId = control.dataset.id;
    state.drawer = "shipping";
    renderOverlay();
  }
  if (action === "report-builder") {
    state.drawer = "report-builder";
    renderOverlay();
    const campaign = campaignById(state.selectedCampaignId);
    if (campaign) await loadCrmReportPreview(campaign.id);
  }
  if (action === "retry-operations") {
    const campaign = campaignById(state.selectedCampaignId);
    if (campaign && isLiveMode()) await ensureCampaignOperations(campaign.id, { force: true });
  }
  if (action === "refresh-social") {
    if (isLiveMode()) {
      const campaign = campaignById(state.selectedCampaignId);
      if (campaign) await queueExactPostRefresh(campaign);
      return;
    }
    const campaign = campaignById(state.selectedCampaignId);
    let refreshed = 0;
    let failed = 0;
    campaign?.assignments.forEach((assignment) => {
      const performance = assignment.performance;
      if (!performance?.socialCrawl) return;
      if (!Number.isFinite(performance.views)) {
        performance.socialCrawl.status = "Refresh failed";
        performance.socialCrawl.error = "The simulated API returned no reportable snapshot; prior values were preserved.";
        failed += 1;
        return;
      }
      performance.snapshots ||= [];
      if (!performance.snapshots.some((snapshot) => snapshot.collectedAt === "2026-07-15")) {
        performance.snapshots.push({ collectedAt: "2026-07-15", views: performance.views, engagementRate: performance.engagementRate });
      }
      performance.socialCrawl.status = "Connected (simulated)";
      performance.socialCrawl.lastSuccessfulRefresh = "2026-07-15";
      performance.socialCrawl.nextRefresh = "2026-07-22";
      performance.socialCrawl.error = null;
      refreshed += 1;
    });
    render();
    showToast(`${refreshed} post${refreshed === 1 ? "" : "s"} refreshed; ${failed} failed.`);
  }
  if (["bulk-action", "customize-columns", "save-view", "calendar-filter", "add-deliverable"].includes(action)) {
    showToast("This control is not available yet.");
  }
  if (action === "bulk-import") {
    const run = state.importRuns[0];
    if (!run) return showToast("No approved import preview is available.");
    state.activeImportId = run.id;
    state.drawer = "import";
    renderOverlay();
  }
  if (action === "use-template") {
    state.selectedTemplate = control.dataset.template || "Blank";
    state.drawer = "new-campaign";
    renderOverlay();
    showToast(`${control.dataset.template} defaults selected for the new campaign.`);
  }
  if (action === "duplicate-campaign") {
    if (isLiveMode()) return showToast("Campaign duplication is unavailable.");
    const source = campaignById(control.dataset.id);
    if (!source) return;
    const copy = structuredClone(source);
    copy.id = `${source.id}-copy-${Date.now()}`;
    copy.name = `${source.name} — Copy`;
    copy.status = "Planning";
    copy.reportId = null;
    copy.reportStatus = "Not started";
    copy.assignments = [];
    state.campaigns.push(copy);
    state.selectedCampaignId = copy.id;
    state.campaignTab = "summary";
    setRoute("campaign");
    showToast("Campaign setup duplicated without creator records or report history.");
  }
  if (action === "new-campaign") {
    state.creatorLibrary.campaignCreation=null;
    if (!canCreateManualCampaign()) return showToast("Your role cannot create campaigns. Nothing was changed.");
    state.editingCampaignId = null;
    state.drawer = "manual-campaign";
    renderOverlay();
    return;
  }
  if (action === 'load-imported-campaigns') {
    if (!isLiveMode() || !canCreateManualCampaign() || importedCampaignActivation.loading) return;
    const epoch = sessionEpoch;
    importedCampaignActivation.loading = true; importedCampaignActivation.error = ''; render();
    try { const payload = await requestJson('/api/imported-campaigns');
      if (epoch !== sessionEpoch) return;
      if (!Array.isArray(payload.data)) throw new Error('Imported campaigns could not be loaded.');
      importedCampaignActivation.items = payload.data;
    } catch (error) { if (epoch === sessionEpoch) importedCampaignActivation.error = error.message; }
    finally { if (epoch === sessionEpoch) { importedCampaignActivation.loading = false; render(); } }
    return;
  }
  if (action === 'activate-imported-campaign') {
    const candidate = importedCampaignActivation.items?.find(c => c.id === control.dataset.campaign);
    if (!candidate || importedCampaignActivation.busy) return;
    const epoch = sessionEpoch;
    importedCampaignActivation.busy = candidate.id; importedCampaignActivation.error = ''; render();
    try {
      await requestJson(`/api/campaigns/${encodeURIComponent(candidate.id)}/activate-import`, { method: 'POST', csrf: true,
        body: { approved: true, expectedRevision: candidate.revision, idempotencyKey: crypto.randomUUID() } });
      if (epoch !== sessionEpoch) return;
      importedCampaignActivation.items = importedCampaignActivation.items.filter(c => c.id !== candidate.id);
      state.selectedCampaignId = candidate.id; setRoute('campaign'); await loadCampaignDetail(candidate.id);
      showToast('Existing campaign activated. History preserved; nothing sent.');
    } catch (error) { if (epoch === sessionEpoch) { importedCampaignActivation.error = error.message; showToast(error.message); } }
    finally { if (epoch === sessionEpoch) { importedCampaignActivation.busy = ''; render(); } }
    return;
  }
  if (action === "new-creator") {
    if (!canCreateManualCreator()) return showToast("Your role cannot create creators. Nothing was changed.");
    state.editingCreatorId = null;
    state.drawer = "manual-creator";
    renderOverlay();
    return;
  }
  if (action === "edit-creator") {
    let creator = creatorById(control.dataset.creator || state.selectedCreatorId);
    if (!canEditManualCreator(creator)) return showToast("Your role cannot edit this creator. Nothing was changed.");
    if (isLiveMode() && creator.socialProfileLoadState !== "ready") {
      await loadCreatorDetail(creator.id);
      creator = creatorById(creator.id);
      if (!creator || creator.socialProfileLoadState !== "ready") {
        return showToast("The creator's social profiles could not be loaded, so nothing was changed.");
      }
    }
    state.editingCreatorId = creator.id;
    state.drawer = "manual-creator";
    renderOverlay();
    return;
  }
  if (action === "link-creator-gmail") {
    const creator = creatorById(control.dataset.creator || state.selectedCreatorId);
    if (!canLinkCreatorGmail(creator)) {
      showToast("Your role cannot update this creator. Nothing was changed.");
      return;
    }
    state.linkingGmailCreatorId = creator.id;
    state.drawer = "creator-gmail";
    renderOverlay();
    return;
  }
  if (action === "edit-campaign") {
    const campaign = campaignById(control.dataset.campaign || state.selectedCampaignId);
    if (!canEditManualCampaign(campaign)) return showToast("Your role cannot edit this campaign. Nothing was changed.");
    state.editingCampaignId = campaign.id;
    state.drawer = "manual-campaign";
    renderOverlay();
    void campaignEmailSettings.load(campaign);
    return;
  }
  if(action==='seeding-browse-creators'){
    const campaign=campaignById(control.dataset.campaign);if(!campaign)return;
    state.creatorLibrary.outreachTarget={id:campaign.id,name:campaign.name};
    state.creatorLibrary.showManaged=false;setRoute('creators');return;
  }
  if(action==='seeding-return-campaign'){
    setRoute('campaign',{selectedCampaignId:control.dataset.id});seedingCampaignTabs.select(control.dataset.id,'outreach');render();
    const campaign=campaignById(control.dataset.id);if(campaign)void seedingOutreach.load(campaign);return;
  }
  if (action === "manage-campaign-creators") {
    const campaign = campaignById(control.dataset.campaign || state.selectedCampaignId);
    if (!canManageManualCampaignRoster(campaign)) return showToast("Your role cannot manage this campaign roster. Nothing was changed.");
    state.selectedCampaignId = campaign.id;
    state.editingAssignmentId = null;
    state.drawer = "manual-assignments";
    renderOverlay();
    if (isLiveMode()) {
      void loadCreatorPicker().catch(() => showToast("The creator picker could not be loaded."));
      void refreshCampaignAssignments(state.selectedCampaignId);
    }
    return;
  }
  if (action === "add-campaign-assignment") {
    const campaign = campaignById(state.selectedCampaignId);
    if (!canManageManualCampaignRoster(campaign)) return showToast("Your role cannot add campaign creators. Nothing was changed.");
    state.editingAssignmentId = null;
    state.drawer = "manual-assignments";
    renderOverlay();
    return;
  }
  if (action === "edit-campaign-assignment") {
    const record = assignmentById(control.dataset.id);
    if (!record || !canEditManualAssignment(record.campaign, record.assignment)) return showToast("Your role cannot edit this campaign creator assignment. Nothing was changed.");
    state.editingAssignmentId = record.assignment.id;
    state.drawer = "manual-assignments";
    renderOverlay();
    if (isLiveMode()) void loadCreatorPicker().catch(() => showToast("The creator picker could not be loaded."));
    return;
  }
  if (action === "delete-campaign-assignment") {
    await removeManualCampaignAssignment(control.dataset.id);
    return;
  }
  if (action === "edit-communication-action") {
    const campaign = campaignById(state.selectedCampaignId);
    if (!campaign || !canUseAction("update_communication_action", campaign)) return showToast("Your role cannot update creator follow-up actions.");
    state.editingGmailThreadId = control.dataset.thread || campaignCommunicationItems(campaign)[0]?.gmailThreadId || null;
    state.drawer = "communication-action";
    renderOverlay();
  }
  if (action === "edit-rights") {
    const campaign = campaignById(state.selectedCampaignId);
    if (!campaign || !canUseAction("update_rights", campaign)) return showToast("Your role cannot update campaign rights.");
    state.editingAssignmentId = campaign.assignments[0]?.id || null;
    state.drawer = "rights";
    renderOverlay();
  }
  if (action === "open-private-creator") {
    if (!canEditCreatorPrivateProfile(creatorById(control.dataset.creator || state.selectedCreatorId))) {
      showToast("Your role cannot edit private creator records. Nothing was changed.");
      return;
    }
    state.selectedCreatorId = control.dataset.creator || state.selectedCreatorId;
    state.privateCreatorRecord = null;
    state.privateCreatorError = null;
    state.drawer = "private-creator";
    renderOverlay();
    void loadPrivateCreatorRecord(creatorById(state.selectedCreatorId));
  }
  if (action === "new-source") {
    state.editingSourceId = null;
    state.drawer = "source-form";
    renderOverlay();
  }
  if (action === "edit-source") {
    state.editingSourceId = control.dataset.id;
    state.drawer = "source-form";
    renderOverlay();
  }
  if (action === "start-import" || action === "open-import") {
    const requestedSource = control.dataset.source;
    const requestedRun = control.dataset.id;
    const run = requestedRun
      ? state.importRuns.find((item) => item.id === requestedRun)
      : state.importRuns.find((item) => item.sourceId === requestedSource) || state.importRuns[0];
    if (!run) {
      showToast("No approved import run is available yet.");
      return;
    }
    state.activeImportId = run.id;
    state.drawer = "import";
    renderOverlay();
  }
  if (action === "link-thread") {
    if (!canLinkAnyGmail()) {
      showToast("Your role has read-only access to Gmail thread links. Nothing was changed.");
      return;
    }
    state.drawer = "gmail";
    renderOverlay();
  }
  if (action === "update-deliverable") {
    const record = assignmentById(control.dataset.id);
    if (!record || !canUseAction("update_deliverable", record.assignment)) {
      showToast("Your role has read-only access to deliverables. Nothing was changed.");
      return;
    }
    state.editingAssignmentId = control.dataset.id;
    state.drawer = "deliverable";
    renderOverlay();
  }
  if (action === "update-payment") {
    const record = assignmentById(control.dataset.id);
    if (!record || !canUseAction("update_payment", record.assignment)) {
      showToast("Your role has read-only access to payment obligations. Nothing was changed.");
      return;
    }
    state.editingAssignmentId = control.dataset.id;
    state.drawer = "payment";
    renderOverlay();
  }
  if (action === "open-payment-approval") {
    const approvalRole = control.dataset.role;
    const record = assignmentById(control.dataset.id);
    if (!record || !["ceo", "cfo"].includes(approvalRole) || !canRecordPaymentApproval(approvalRole)) {
      showToast("Only the designated executive or finance administrator can record this decision.");
      return;
    }
    state.editingAssignmentId = control.dataset.id;
    state.editingPaymentApprovalRole = approvalRole;
    state.drawer = "payment-approval";
    renderOverlay();
  }
  if (action === "verify-post") {
    const record = assignmentById(control.dataset.id);
    if (!record?.assignment.post?.attributionId || !canUseAction("verify_post", record.assignment)) {
      showToast("Your role cannot verify this post. Nothing was changed.");
      return;
    }
    state.editingAssignmentId = control.dataset.id;
    state.drawer = "post-verification";
    renderOverlay();
  }
  if (action === "add-campaign-update") {
    const campaign = campaignById(state.selectedCampaignId);
    if (!campaign || !canUseAction("add_campaign_update", campaign)) {
      showToast("Your role has read-only access to campaign updates. Nothing was changed.");
      return;
    }
    state.drawer = "campaign-update";
    renderOverlay();
  }
  if (action === "open-admin") {
    state.drawer = "admin";
    renderOverlay();
    if (isLiveMode()) void loadAssistedImportStatus();
  }
  if (action === "refresh-assisted-import") {
    void loadAssistedImportStatus();
  }
  if (action === "sync-assisted-import") {
    void requestAssistedImport(control.dataset.mode);
  }
  if (action === "close-drawer") {
    if(state.drawer==='manual-campaign')state.creatorLibrary.campaignCreation=null;
    state.drawer = null;
    state.linkingGmailCreatorId = null;
    closeAssistedImportMaterializer();
    closeAssistedImportCorrection();
    state.privateCreatorRecord = null;
    state.privateCreatorError = null;
    state.privateCreatorLoading = false;
    renderOverlay();
  }
  if (action === "add-recommended") {
    if (isLiveMode()) {
      showToast("Shortlist saving is not connected yet. Nothing was changed.");
      return;
    }
    const campaign = campaignById(state.finder.campaignId);
    const creator = creatorById(control.dataset.creator);
    if (!campaign || !creator || campaign.assignments.some((assignment) => assignment.creatorId === creator.id)) return;
    const stats = creatorStats(creator.id);
    campaign.assignments.push({
      id: `shortlist-${campaign.id}-${creator.id}`,
      creatorId: creator.id,
      owner: state.currentUser.name,
      acquisitionSource: "BYOU history shortlist",
      rate: stats.typicalFee,
      currency: "USD",
      status: "Shortlisted",
      deliverable: { status: "Not started", revisionCount: 0, owner: state.currentUser.name, sourceRecordId: `DEL-SHORTLIST-${creator.id}` },
      onTime: null,
      paymentStatus: "Not started",
      post: null,
      performance: null,
      notes: `Recommended from ${state.finder.category} campaign history.`
    });
    render();
    showToast(`${creatorDisplayName(creator)} added to ${campaign.name}.`);
  }
  if (action === "download-report") downloadReport(control.dataset.id);
  if (action === "download-report-version") await downloadReportVersion(control.dataset.id);
  if (action === "copy-report-link") {
    const versionId = control.dataset.version;
    if (!versionId) {
      showToast("Publish a version before copying a link.");
      return;
    }
    if (artifactVersionUnavailable(artifactVersionMetadata("report", versionId))) {
      showToast("This version is expired, revoked, or unavailable.");
      return;
    }
    const url = new URL(window.location.href);
    url.search = `?view=report&report=${encodeURIComponent(control.dataset.id)}&version=${encodeURIComponent(versionId)}`;
    try {
      await navigator.clipboard.writeText(url.toString());
      showToast(`${versionId} link copied.`);
    } catch {
      showToast("Copy was blocked by the browser. The current URL is the report link.");
    }
  }
});

app.addEventListener('error', event => { if(event.target.matches?.('[data-library-thumbnail],[data-library-photo]'))event.target.remove(); }, true);
app.addEventListener("input", (event) => {
  if(event.target.form?.id==='creator-library-search'&&event.target.name==='query')state.creatorLibrary.query=event.target.value;
  if (event.target.id === "creator-research-query") { state.creatorResearch.query = event.target.value; state.creatorResearch.result = null; }
  if (event.target.form?.id === "research-evidence-form" &&
      Object.hasOwn(state.creatorResearch.evidenceDraft, event.target.name)) {
    state.creatorResearch.evidenceDraft[event.target.name] = event.target.value;
  }
  if (event.target.form?.id === "research-evidence-video-search") {
    state.creatorResearch.evidenceVideoQuery = event.target.value;
  }
});

app.addEventListener("change", (event) => {
  if(event.target.matches('[data-library-deal-select]')){
    state.creatorLibrary.selectedDealId=event.target.value||null;
    writeLibraryRoute(state.creatorLibrary.selected?.id,true);render();return;
  }
  if(event.target.matches('[data-library-column]')){
    const s=state.creatorLibrary;
    const selected=event.target.checked?[...s.tableColumns,event.target.dataset.libraryColumn]:s.tableColumns.filter(value=>value!==event.target.dataset.libraryColumn);
    try{s.tableColumns=saveCreatorColumns(window.localStorage,state.currentUser.id,selected);render();}
    catch(error){event.target.checked=true;showToast(error.message||'Columns could not be saved.');}
    return;
  }
  if(event.target.name==='libraryLimit'&&event.target.closest('.cl-library')){const n=Number(event.target.value);if(![25,50,100].includes(n))return;state.creatorLibrary.limit=n;state.creatorLibrary.offset=0;writeLibraryRoute();void loadCreatorLibrary();return;}
  if(event.target.dataset.field==='campaign-type-filter'||event.target.dataset.field==='campaign-status-filter'){
    state[event.target.dataset.field==='campaign-type-filter'?'campaignTypeFilter':'campaignStatusFilter']=event.target.value;
    syncCampaignUrl();render();if(isLiveMode())void loadCampaignPage();return;
  }
  if(event.target.matches('[data-commercial-filter]')){state.creatorLibrary[event.target.name]=event.target.value;render();return;}
  if(event.target.form?.id==='creator-photo-form'&&event.target.name==='photo'){
    const s=state.creatorLibrary,creatorId=s.selected?.id,file=event.target.files?.[0];
    if(!file||!s.selected?.canEditPhoto||s.photoBusy||s.photoPreparing)return;
    const sequence=s.photoSequence=(s.photoSequence||0)+1;
    s.photoError=null;s.photoNotice=null;s.photoPreparing=true;render();
    void prepareProfilePhoto(file).then(value=>{
      if(s.selected?.id===creatorId&&s.photoSequence===sequence)s.photoDraft={creatorId,value};
    }).catch(error=>{if(s.selected?.id===creatorId&&s.photoSequence===sequence)s.photoError=error.message;})
      .finally(()=>{if(s.photoSequence===sequence){s.photoPreparing=false;render();}});
    return;
  }
  if(event.target.form?.id==='creator-library-search'&&['brand','campaign','stage','sort','collaboration','agency','emailAvailability'].includes(event.target.name)){
    const s=state.creatorLibrary;
    if(event.target.name==='brand'){
      s.brands=event.target.checked?[...new Set([...s.brands,event.target.value])]:s.brands.filter(b=>b!==event.target.value);
      if(s.campaign&&s.brands.length&&!s.filters.campaigns.some(c=>c.id===s.campaign&&s.brands.includes(c.brandKey)))s.campaign='';
    }else s[event.target.name]=event.target.value;
    s.offset=0;writeLibraryRoute();void loadCreatorLibrary();
    return;
  }
  if(event.target.form?.id==='creator-library-search'&&event.target.name==='costcoOnly') {
    state.creatorLibrary.costcoOnly=event.target.checked;
    writeLibraryRoute();void loadCreatorLibrary();
    return;
  }
  if(event.target.form?.id === "creator-research-form" && event.target.name === "costcoOnly") {
    state.creatorResearch.costcoOnly = event.target.checked;
    state.creatorResearch.result = null;
    void runCreatorResearch(state.creatorResearch.query);
    return;
  }
  if(event.target.form?.id==='creator-library-search'&&event.target.name==='platform'){state.creatorLibrary.platform=event.target.value;writeLibraryRoute();void loadCreatorLibrary();return;}
  if (event.target.form?.id === "creator-research-form" && event.target.name === "samePost") {
    state.creatorResearch.samePost = event.target.checked;
    return;
  }
  if (event.target.form?.id !== "research-evidence-form") return;
  const research = state.creatorResearch;
  if (event.target.name === "postId") {
    research.evidenceDraft = researchEvidenceDraftForVideo(research, event.target.value);
    research.evidenceMessage = null;
    research.evidenceError = null;
    render();
    return;
  }
  if (Object.hasOwn(research.evidenceDraft, event.target.name)) {
    research.evidenceDraft[event.target.name] = event.target.value;
  }

});

app.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (["auth-recovery", "auth-back", "auth-signup"].includes(action)) {
    pendingPasswordLink = null;
    pendingEmailConfirmation = null;
    signupMode = action === "auth-signup";
    passwordRecoveryMode = action === "auth-recovery";
    state.runtime.message = null;
    state.runtime.messageKind = null;
    render();
  }
});

const interfaceLanguage = installInterfaceLanguage(document.body, () => interfaceLocale);
installMaterialInputs(document);
app.addEventListener('submit', async event => {
  if (event.target.id !== 'profile-settings-form') return;
  event.preventDefault(); if (profileSaving) return;
  const form=new FormData(event.target), profile={displayName:String(form.get('displayName')||'').trim(),locale:form.get('locale')==='ko'?'ko':'en'};
  if (profile.displayName.length>80 || /[\u0000-\u001f\u007f]/.test(profile.displayName)) return;
  profileSaving=true;profileError='';profileNotice='';
  const button=event.target.querySelector('[type="submit"]');button.disabled=true;
  try {
    if (isLiveMode()) await requestJson('/api/auth/profile',{method:'PATCH',csrf:true,body:profile});
    else window.localStorage.setItem('byouiq.demo.profile',JSON.stringify(profile));
    state.currentUser.name=profile.displayName;state.currentUser.initials=profileInitials(profile.displayName);interfaceLocale=profile.locale;
    profileNotice=interfaceLocale==='ko'?'프로필을 저장했습니다.':'Profile saved.';
  } catch (error) { profileError=interfaceLocale==='ko'?'프로필을 저장하지 못했습니다. 다시 시도해 주세요.':error.message||'Could not save your profile. Try again.'; }
  finally { profileSaving=false;render();if(profileError){const retry=app.querySelector('#profile-settings-form');if(retry){retry.elements.displayName.value=profile.displayName;retry.elements.locale.value=profile.locale;}}interfaceLanguage.apply(); }
});

app.addEventListener("submit", async (event) => {
  if (!["signup-form", "email-confirmation-form"].includes(event.target.id)) return;
  event.preventDefault();
  const signup = event.target.id === "signup-form";
  const form = new FormData(event.target);
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  if (signup && (!/^[^\s@]+@example\.invalid$/i.test(email) || password !== String(form.get("confirmation") || ""))) {
    state.runtime.message = !/^[^\s@]+@example\.invalid$/i.test(email) ? "Use your @example.invalid company email." : "The passwords must match.";
    state.runtime.messageKind = "error";
    render();
    return;
  }
  event.target.querySelector("button[type=submit]").disabled = true;
  try {
    const result = await requestJson(signup ? "/api/auth/signup" : "/api/auth/email/confirm", {
      method: "POST", body: signup ? { email, password, displayName: String(form.get("displayName") || "").trim() } : pendingEmailConfirmation
    });
    signupMode = false;
    pendingEmailConfirmation = null;
    state.runtime.message = result.message;
    state.runtime.messageKind = "success";
  } catch (error) {
    state.runtime.message = error instanceof Error ? error.message : "Account setup could not be completed.";
    state.runtime.messageKind = "error";
  }
  render();
});

app.addEventListener("submit", async (event) => {
  if (!["password-setup-form", "password-recovery-form"].includes(event.target.id)) return;
  event.preventDefault();
  const setup = event.target.id === "password-setup-form";
  const form = new FormData(event.target);
  const password = String(form.get("password") || "");
  if (setup && password !== String(form.get("confirmation") || "")) {
    state.runtime.message = "The passwords must match.";
    render();
    return;
  }
  const button = event.target.querySelector("button[type=submit]");
  button.disabled = true;
  try {
    const result = await requestJson(setup ? "/api/auth/password/complete" : "/api/auth/password/recovery", {
      method: "POST",
      body: setup ? { ...pendingPasswordLink, password } : { email: String(form.get("email") || "").trim() }
    });
    if (setup) pendingPasswordLink = null;
    passwordRecoveryMode = false;
    state.runtime.message = result.message;
  } catch (error) {
    state.runtime.message = error instanceof Error ? error.message : "The password request could not be completed.";
  }
  render();
});

app.addEventListener("submit", async (event) => {
  if(event.target.matches('[data-overlap-review]')){
    event.preventDefault();
    const s=state.creatorLibrary,form=event.target,creatorId=s.selected?.id;
    if(!isLiveMode()||!s.canReviewOverlap||!creatorId||s.overlapReviewSaving)return;
    const formData=new FormData(form);s.overlapReviewSaving=true;s.overlapReviewError=null;
    const explanation=String(formData.get('explanation')||'');
    try{
      const dealIds=JSON.parse(form.dataset.dealIds||'[]');
      await requestJson('/api/creator-library/fee-reviews',{method:'POST',csrf:true,body:{creatorId,postIdentity:form.dataset.postIdentity,dealIds,outcome:String(formData.get('outcome')||''),explanation}});
      const reviews=await requestJson(`/api/creator-library/fee-reviews?creatorId=${encodeURIComponent(creatorId)}`);
      if(s.selected?.id===creatorId){s.overlapReviews=reviews.data;s.overlapReviewError=null;render();showToast('Fee review outcome recorded. Source claims remain available.');}
    }catch(error){if(s.selected?.id===creatorId){s.overlapReviewError=error.message||'Review outcome could not be saved.';form.querySelector('[data-review-save-error]')?.remove();const alert=document.createElement('p');alert.dataset.reviewSaveError='';alert.setAttribute('role','alert');alert.textContent=s.overlapReviewError;form.append(alert);form.querySelector('textarea')?.focus();}}
    finally{s.overlapReviewSaving=false;}
    return;
  }
  if(event.target.id==='creator-photo-form'){
    event.preventDefault();const s=state.creatorLibrary,c=s.selected,draft=s.photoDraft;
    if(!c?.canEditPhoto||!draft||draft.creatorId!==c.id||s.photoBusy||s.photoPreparing)return;
    s.photoBusy=true;s.photoError=null;s.photoNotice=null;render();
    try{
      const payload=await requestJson('/api/creator-photo',{method:'POST',csrf:!s.demo,body:{creatorId:c.id,photoDataUrl:draft.value,expectedRevision:c.photoRevision||0}});
      const update={photoDataUrl:payload.data.photoDataUrl,photoRevision:payload.data.photoRevision};
      s.items=s.items.map(item=>item.id===c.id?{...item,...update}:item);
      if(s.selected?.id===c.id){Object.assign(s.selected,update);s.photoDraft=undefined;s.photoNotice=s.demo?'Photo saved in this local demo only.':'Profile photo saved.';}
    }catch(error){if(s.selected?.id===c.id)s.photoError=error.message||'Photo save could not be confirmed. Reload the profile.';}
    finally{s.photoBusy=false;render();}
    return;
  }
  if(event.target.id==='creator-library-search'){event.preventDefault();await loadCreatorLibrary({interpret:true});writeLibraryRoute();return;}
  if (event.target.id === "creator-research-form") {
    event.preventDefault();
    const form = new FormData(event.target);
    await runCreatorResearch(form.get("query"));
    return;
  }
  if (event.target.id === "research-evidence-video-search") {
    event.preventDefault();
    await loadResearchEvidenceVideos(new FormData(event.target).get("videoQuery"));
    return;
  }
  if (event.target.id === "research-evidence-form") {
    event.preventDefault();
    await saveResearchEvidence(new FormData(event.target));
    return;
  }
  if (event.target.id !== "login-form") return;
  event.preventDefault();
  const form = new FormData(event.target);
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  state.runtime.phase = "checking";
  state.runtime.message = "Confirming your staff access…";
  render();
  try {
    const session = await requestJson("/api/auth/login", {
      method: "POST",
      body: { email, password }
    });
    state.csrfToken = session?.csrfToken || null;
    clearCrmSensitiveState();
    await loadLiveWorkspace(session?.user);
    state.runtime.phase = "ready";
    state.runtime.message = null;
    campaignOps.configure('live');
  } catch (error) {
    state.csrfToken = null;
    clearCrmSensitiveState();
    state.runtime.phase = "signed-out";
    state.runtime.message =
      error instanceof ApiError && error.status === 401
        ? "That staff email or password was not accepted."
        : error instanceof Error
          ? error.message
          : "Sign-in could not be completed.";
  }
  render();
});

let creatorSearchTimer = null;
let campaignSearchTimer = null;
let videoSearchTimer = null;
let representationSearchTimer = null;
const SERVER_CREATOR_FILTER_FIELDS = new Set([
  "creator-category",
  "creator-platform",
  "creator-warehouse",
  "creator-distance",
  "creator-sort"
]);

app.addEventListener("input", (event) => {
  const field = event.target.dataset.field;
  if (field === "trackify-activation-sha") {
    state.videoTracking.activationSha = event.target.value;
    return;
  }
  if (!["creator-search", "campaign-search", "video-search", "talent-agency-search", "talent-manager-search", "client-search", "proposal-search"].includes(field)) return;
  if (field === "creator-search") state.creatorSearch = event.target.value;
  if (field === "campaign-search") {state.campaignSearch = event.target.value.slice(0,100);syncCampaignUrl();}
  if (field === "video-search") { state.videoSearch = event.target.value; state.videoOffset = 0; }
  if (field === "talent-agency-search") state.talentAgencySearch = event.target.value;
  if (field === "talent-manager-search") state.talentManagerSearch = event.target.value;
  if (field === "client-search") state.clientSearch = event.target.value;
  if (field === "proposal-search") state.proposalSearch = event.target.value;
  const position = event.target.selectionStart;
  render();
  const search = document.querySelector(`[data-field="${field}"]`);
  search?.focus();
  search?.setSelectionRange(position, position);
  if (field === "creator-search" && isLiveMode()) {
    clearTimeout(creatorSearchTimer);
    creatorSearchTimer = setTimeout(() => void loadCreatorPage(), 300);
  }
  if (field === "campaign-search" && isLiveMode()) {
    clearTimeout(campaignSearchTimer);
    campaignSearchTimer = setTimeout(() => void loadCampaignPage(), 300);
  }
  if (field === "video-search" && isLiveMode()) {
    clearTimeout(videoSearchTimer);
    videoSearchTimer = setTimeout(() => void loadVideoTracking(), 300);
  }
  if (["talent-agency-search", "talent-manager-search"].includes(field) && isLiveMode()) {
    clearTimeout(representationSearchTimer);
    representationSearchTimer = setTimeout(() => void loadRepresentationPage(
      field === "talent-agency-search" ? "talentAgencies" : "talentManagers"
    ), 300);
  }
});

app.addEventListener("change", (event) => {
  const field = event.target.dataset.field;
  if (field === "creator-category") state.creatorCategory = event.target.value;
  if (field === "creator-platform") state.creatorPlatform = event.target.value;
  if (!isLiveMode() && field === "creator-source") state.creatorSource = event.target.value;
  if (field === "creator-warehouse") state.creatorWarehouse = event.target.value;
  if (field === "creator-distance") state.creatorDistance = event.target.value;
  if (field === "creator-sort") {
    state.creatorSort = isLiveMode() && ["performance", "reliability"].includes(event.target.value)
      ? "recent"
      : event.target.value;
  }
  if (field === "video-library") { state.videoLibrary = event.target.value === "crm" ? "crm" : "trackify"; state.videoOffset = 0; state.videoTracking.items = []; }
  if (["video-platform", "video-campaign"].includes(field)) state.videoOffset = 0;
  if (field === "video-platform") state.videoPlatform = event.target.value;
  if (field === "video-campaign") state.videoCampaignId = event.target.value;
  if (field) render();
  if (isLiveMode() && SERVER_CREATOR_FILTER_FIELDS.has(field)) void loadCreatorPage();
  if (isLiveMode() && ["video-platform", "video-campaign", "video-library"].includes(field)) {
    void loadVideoTracking();
  }
});

overlayRoot.addEventListener("input", (event) => {
  if (event.target.dataset.field !== "global-search") return;
  state.searchQuery = event.target.value;
  const position = event.target.selectionStart;
  renderOverlay();
  const search = document.querySelector("#global-search-input");
  search?.focus();
  search?.setSelectionRange(position, position);
});

overlayRoot.addEventListener("change", (event) => {
  const choiceDropdown = event.target.closest?.("[data-manual-choice-dropdown]");
  if (choiceDropdown && event.target.matches("input[type='checkbox']")) {
    const selected = [...choiceDropdown.querySelectorAll("input[type='checkbox']:checked")]
      .map((input) => input.value);
    const summary = choiceDropdown.querySelector("[data-manual-choice-summary]");
    if (summary) {
      summary.textContent = manualChoiceSummary(
        selected,
        choiceDropdown.dataset.emptyLabel || "Choose options"
      );
    }
    return;
  }
  if (event.target.hasAttribute("data-report-module")) {
    state.reportModuleVisibility[event.target.value] = event.target.checked;
    const visibilityCopy = event.target.closest("label")?.querySelector("small");
    if (visibilityCopy) visibilityCopy.textContent = event.target.checked ? "Included" : "Excluded";
    return;
  }
  if (event.target.hasAttribute("data-report-metric")) {
    state.reportMetricVisibility[event.target.value] = event.target.checked;
    return;
  }
  if (event.target.hasAttribute("data-report-branding")) {
    state.reportBuilderBranding = event.target.value;
    return;
  }
  if (event.target.hasAttribute("data-report-expiration")) {
    state.reportBuilderExpiration = event.target.value;
    return;
  }
  const importKey = event.target.dataset.import;
  if (importKey === "sourceId") {
    const run = state.importRuns.find((item) => item.sourceId === event.target.value);
    if (run) state.activeImportId = run.id;
    renderOverlay();
    return;
  }
  const key = event.target.dataset.finder;
  if (!key) return;
  state.finder[key] = ["maxFee", "maxDistance"].includes(key) ? Number(event.target.value) : event.target.value;
  if (key === "campaignId") {
    const campaign = campaignById(state.finder.campaignId);
    if (campaign) {
      state.finder.category = campaign.category || "All categories";
      state.finder.maxFee = campaign.budget ? Math.min(10000, Math.round(campaign.budget / 4)) : state.finder.maxFee;
    }
  }
  renderOverlay();
  if (isLiveMode()) void loadCampaignFinderResults();
});

overlayRoot.addEventListener("click", async (event) => {
  const control = event.target.closest("[data-action]");
  if (!control) return;
  const action = control.dataset.action;
  if (action === "retry-video-connection-options") {
    void loadVideoConnectionOptions(state.videoTracking.connection?.query || "");
    return;
  }
  if (action === "search-video-connection-options") {
    const search = control.closest("form")?.querySelector('[name="placementSearch"]')?.value || "";
    void loadVideoConnectionOptions(search);
    return;
  }
  if (action === "video-connection-back") {
    state.videoTracking.connection = {
      ...state.videoTracking.connection,
      stage: "entry",
      reviewUrls: [],
      saving: false,
      error: null
    };
    renderOverlay();
    return;
  }
  if (action === "add-social-profile-row") {
    const list = control.closest("form")?.querySelector("[data-social-profile-list]");
    if (!list) return;
    if (list.children.length >= 50) return showToast("A creator can have up to 50 social profiles.");
    list.insertAdjacentHTML("beforeend", renderManualSocialProfileRow({}, list.children.length));
    refreshManualSocialProfileRows(list);
    list.lastElementChild?.querySelector("[name='socialHandle']")?.focus();
    return;
  }
  if (action === "remove-social-profile-row") {
    const list = control.closest("[data-social-profile-list]");
    if (!list) return;
    if (list.children.length <= 1) return showToast("Every creator needs at least one social profile.");
    control.closest("[data-social-profile-row]")?.remove();
    refreshManualSocialProfileRows(list);
    return;
  }
  if (action === "add-campaign-assignment") {
    const campaign = campaignById(state.selectedCampaignId);
    if (!canManageManualCampaignRoster(campaign)) return showToast("Your role cannot add campaign creators. Nothing was changed.");
    state.editingAssignmentId = null;
    renderOverlay();
    return;
  }
  if (action === "edit-campaign-assignment") {
    const record = assignmentById(control.dataset.id);
    if (!record || !canEditManualAssignment(record.campaign, record.assignment)) return showToast("Your role cannot edit this campaign creator assignment. Nothing was changed.");
    state.editingAssignmentId = record.assignment.id;
    renderOverlay();
    return;
  }
  if (action === "delete-campaign-assignment") {
    await removeManualCampaignAssignment(control.dataset.id);
    return;
  }
  if (action === "submit-crm-form") {
    event.preventDefault();
    const form = control.closest("form");
    if (!form) {
      showToast("Nothing was changed. The CRM form is unavailable.");
      return;
    }
    if (!form.reportValidity()) return;
    try {
      await handleOverlaySubmit({ preventDefault: () => {}, target: form });
    } catch (error) {
      showToast(`Nothing was changed. ${error instanceof Error ? error.message : "The CRM form could not be submitted."}`);
    }
    return;
  }
  if (action === "refresh-assisted-import") {
    void loadAssistedImportStatus();
    return;
  }
  if (action === "sync-assisted-import") {
    void requestAssistedImport(control.dataset.mode);
    return;
  }
  if (action === "apply-assisted-import-resolution") {
    void applyAssistedImportBulkResolution(control.dataset.resolution);
    return;
  }
  if (action === "review-assisted-import-fact") {
    void reviewAssistedImportFact(control.dataset.factId, control.dataset.decision);
    return;
  }
  if (action === "review-assisted-import-relationship") {
    void reviewAssistedImportRelationship(
      control.dataset.relationshipId,
      control.dataset.decision
    );
    return;
  }
  if (action === "filter-assisted-import-review") {
    setAssistedImportReviewFilter(control.dataset.queue, control.dataset.decision);
    return;
  }
  if (action === "page-assisted-import-review") {
    moveAssistedImportReviewPage(control.dataset.queue, control.dataset.direction);
    return;
  }
  if (action === "page-assisted-import-provisional") {
    moveAssistedImportProvisionalPage(control.dataset.direction);
    return;
  }
  if (action === "open-assisted-import-provisional-detail") {
    void loadAssistedImportProvisionalDetail(
      control.dataset.targetType,
      control.dataset.targetId
    );
    return;
  }
  if (action === "close-assisted-import-provisional-detail") {
    clearAssistedImportProvisionalDetail();
    renderOverlay();
    return;
  }
  if (action === "materialize-assisted-import-relationship") {
    void materializeAssistedImportRelationship(control.dataset.relationshipId);
    return;
  }
  if (action === "open-assisted-import-materializer") {
    void loadAssistedImportMaterializationOptions(control.dataset.factId);
    return;
  }
  if (action === "close-assisted-import-materializer") {
    closeAssistedImportMaterializer();
    renderOverlay();
    return;
  }
  if (action === "load-assisted-import-history") {
    void loadAssistedImportMaterializationHistory();
    return;
  }
  if (action === "open-assisted-import-correction") {
    void loadAssistedImportCorrectionOptions(control.dataset.mapId);
    return;
  }
  if (action === "close-assisted-import-correction") {
    closeAssistedImportCorrection();
    renderOverlay();
    return;
  }
  if (action === "close-drawer") {
    if(state.drawer==='manual-campaign')state.creatorLibrary.campaignCreation=null;
    state.drawer = null;
    state.linkingGmailCreatorId = null;
    closeAssistedImportMaterializer();
    closeAssistedImportCorrection();
    state.privateCreatorRecord = null;
    state.privateCreatorError = null;
    state.privateCreatorLoading = false;
    renderOverlay();
  }
  if (action === "open-creator") {
    state.drawer = null;
    state.selectedCreatorId = control.dataset.id;
    state.profileTab = "overview";
    setRoute("creator");
  }
  if (action === "open-campaign") {
    state.drawer = null;
    state.selectedCampaignId = control.dataset.id;
    state.campaignTab = "summary";
    setRoute("campaign");
    void loadCampaignDetail(state.selectedCampaignId);
  }
  if (action === "open-campaign-section") {
    state.drawer = null;
    state.selectedCampaignId = control.dataset.id;
    state.campaignTab = control.dataset.tab || "summary";
    setRoute("campaign");
    void loadCampaignWorkspace(state.selectedCampaignId);
  }
  if (action === "open-report") {
    state.drawer = null;
    state.selectedReportId = control.dataset.id;
    setRoute("report");
  }
  if (action === "select-source") {
    state.drawer = null;
    state.selectedSourceId = control.dataset.id;
    setRoute("sources");
  }
  if (action === "create-approval-link") {
    const record = assignmentById(state.editingAssignmentId);
    if (!record) return;
    const deliverables = record.assignment.deliverables?.length
      ? record.assignment.deliverables
      : [record.assignment.deliverable];
    const deliverable = deliverables.find((item) => item.id === state.editingDeliverableId) || deliverables[0];
    const activeVersion = deliverable?.versions?.at(-1);
    const expiresValue = document.querySelector("#review-link-expires")?.value;
    const expiresAt = expiresValue ? new Date(expiresValue) : null;
    if (!activeVersion) {
      showToast("Upload a content version before creating an approval link.");
      return;
    }
    if (!expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      showToast("Choose a future expiration date before creating the approval link.");
      return;
    }
    if (isLiveMode()) {
      try {
        const result = await sendCampaignCommand("content.review_link.create", {
          campaignId: record.campaign.id,
          contentVersionId: activeVersion.id,
          expiresAt: expiresAt.toISOString()
        });
        const value = Array.isArray(result) ? result[0] : result;
        const returnedUrl = value?.reviewUrl || value?.review_url || value?.url || null;
        const reviewToken = value?.reviewToken || value?.review_token || value?.token || null;
        const url = returnedUrl || (
          typeof reviewToken === "string" && /^[a-f0-9]{64}$/.test(reviewToken)
            ? `${window.location.origin}/review/${reviewToken}`
            : null
        );
        state.createdReviewLinks[activeVersion.id] = {
          url,
          expiresAt: expiresAt.toISOString(),
          demo: false
        };
        const reload = await ensureCampaignOperations(record.campaign.id, { force: true, notify: false });
        renderOverlay();
        showToast(url
          ? reload.status === "ready"
            ? "Expiring approval link created."
            : "Approval link created. Refresh to update campaign data."
          : "Approval link created without a shareable URL.");
      } catch (error) {
        showToast(`Nothing was created. ${error instanceof Error ? error.message : "The server rejected the approval link."}`);
      }
      return;
    }
    state.createdReviewLinks[activeVersion.id] = {
      url: `${window.location.origin}${window.location.pathname}#demo-approval-${encodeURIComponent(activeVersion.id)}`,
      expiresAt: expiresAt.toISOString(),
      demo: true
    };
    renderOverlay();
    showToast("Demo approval link created.");
  }
  if (action === "copy-review-link") {
    const link = state.createdReviewLinks[control.dataset.version]?.url;
    if (!link) return showToast("No shareable approval link is available.");
    try {
      await navigator.clipboard.writeText(link);
      showToast(state.createdReviewLinks[control.dataset.version]?.demo
        ? "Demo link copied."
        : "Approval link copied.");
    } catch {
      showToast("Copy was blocked by the browser. Select the link text and copy it manually.");
    }
  }
  if (action === "review-status") {
    const record = assignmentById(state.editingAssignmentId);
    if (!record || isLiveMode()) {
      showToast("Content review updates are unavailable.");
      return;
    }
    const deliverables = record.assignment.deliverables?.length ? record.assignment.deliverables : [record.assignment.deliverable];
    const deliverable = deliverables.find((item) => item.id === state.editingDeliverableId) || deliverables[0];
    const requestedStatus = control.dataset.status;
    const activeVersion = deliverable.versions?.at(-1);
    if (requestedStatus === "Approved" && !canApproveDeliverable(deliverable)) {
      showToast("Upload a file or attach an approved Google Drive link before approval.");
      return;
    }
    deliverable.status = requestedStatus;
    if (requestedStatus === "Approved") {
      deliverable.approvedVersion = activeVersion.id;
      activeVersion.status = "Approved";
    }
    record.assignment.deliverable.status = deliverables[0]?.status || requestedStatus;
    record.assignment.workflowStatus ||= {};
    record.assignment.workflowStatus.calculated = calculateCreatorWorkflowStatus(deliverables);
    record.assignment.status = record.assignment.workflowStatus.calculated;
    render();
    showToast(`${deliverable.name || "Deliverable"} moved to ${requestedStatus}. Creator status was recalculated across all deliverables.`);
  }
  if (action === "upload-version") {
    showToast("Version upload is not available yet.");
  }
  if (action === "shipping-update") {
    showToast("Shipping updates are unavailable.");
  }
  if (action === "move-report-module") {
    const index = Number(control.dataset.index);
    if (!Number.isInteger(index) || index < 0 || index >= state.reportModuleOrder.length - 1) return;
    const nextOrder = [...state.reportModuleOrder];
    [nextOrder[index], nextOrder[index + 1]] = [nextOrder[index + 1], nextOrder[index]];
    state.reportModuleOrder = nextOrder;
    renderOverlay();
  }
  if (action === "revoke-crm-artifact") {
    await revokeCrmArtifact(control);
    return;
  }
  if (action === "save-report-draft") {
    const campaign = campaignById(state.selectedCampaignId);
    if (!campaign) return;
    const options = currentReportOptions();
    if (!options.modules.length) {
      showToast("Select at least one report section before saving.");
      return;
    }
    if (!options.metrics.length) {
      showToast("Select at least one report metric before saving.");
      return;
    }
    const receipt = await runCrmAction({
      command: "artifact.save-draft",
      artifact: "report",
      campaignId: campaign.id,
      modules: options.modules,
      metrics: options.metrics,
      branding: options.branding
    }, "Draft saved.", { closeDrawer: false });
    if (receipt) await loadCrmReportPreview(campaign.id);
  }
  if (action === "publish-report-version") {
    const campaign = campaignById(state.selectedCampaignId);
    if (!campaign) return;
    const options = currentReportOptions();
    if (!options.modules.length) {
      showToast("Select at least one report section before publishing.");
      return;
    }
    if (!options.metrics.length) {
      showToast("Select at least one verified report metric before publishing.");
      return;
    }
    const expiresAt = new Date(`${options.expiration}T23:59:59Z`);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      showToast("Choose a future expiration date. Nothing was published.");
      return;
    }
    const receipt = await runCrmAction({
      command: "artifact.publish",
      artifact: "report",
      campaignId: campaign.id,
      expiresAt: expiresAt.toISOString(),
      modules: options.modules,
      metrics: options.metrics,
      branding: options.branding
    }, "Report version published.");
    if (receipt) await loadCrmReportPreview(campaign.id);
  }
  if (action === "download-report") downloadReport(control.dataset.id);
  if (action === "approve-import") {
    if (isLiveMode()) {
      showToast("Import approval runs on the private server. Nothing was changed here.");
      return;
    }
    const run = state.importRuns.find((item) => item.id === control.dataset.id);
    if (!run) return;
    run.status = "Imported";
    run.importedAt = "2026-07-14";
    run.approvedBy = "BYOU administrator";
    render();
    showToast(`${run.id} imported with blocked fields excluded.`);
  }
  if (action === "add-recommended") {
    if (isLiveMode()) {
      showToast("Shortlist saving is not connected yet. Nothing was changed.");
      return;
    }
    const campaign = campaignById(state.finder.campaignId);
    const creator = creatorById(control.dataset.creator);
    if (!campaign || !creator || campaign.assignments.some((assignment) => assignment.creatorId === creator.id)) return;
    const stats = creatorStats(creator.id);
    campaign.assignments.push({
      id: `shortlist-${campaign.id}-${creator.id}`,
      creatorId: creator.id,
      owner: state.currentUser.name,
      acquisitionSource: "BYOU history shortlist",
      rate: stats.typicalFee,
      currency: "USD",
      status: "Shortlisted",
      deliverable: { status: "Not started", revisionCount: 0, owner: state.currentUser.name, sourceRecordId: `DEL-SHORTLIST-${creator.id}` },
      onTime: null,
      paymentStatus: "Not started",
      post: null,
      performance: null,
      notes: `Recommended from ${state.finder.category} campaign history.`
    });
    render();
    showToast(`${creatorDisplayName(creator)} added to ${campaign.name}.`);
  }
});

const crmFormIds = new Set([
  "crm-client-form",
  "crm-contact-form",
  "crm-contact-role-form",
  "crm-commercial-form",
  "crm-attention-form",
  "crm-proposal-form",
  "crm-assistant-form"
]);

const readCrmFormValues = (formElement) => {
  const controls = [...formElement.querySelectorAll("[name]")].filter((control) => !control.disabled);
  const valuesFor = (name) => controls
    .filter((control) => control.name === name)
    .filter((control) => !["checkbox", "radio"].includes(control.type) || control.checked)
    .flatMap((control) => control instanceof HTMLSelectElement && control.multiple
      ? [...control.selectedOptions].map((option) => option.value)
      : [control.value]);
  return {
    get: (name) => valuesFor(name)[0] ?? null,
    getAll: (name) => valuesFor(name)
  };
};

const handleOverlaySubmit = async (event) => {
  event.preventDefault();
  const formId = event.target.getAttribute("id") || "";
  const form = crmFormIds.has(formId)
    ? readCrmFormValues(event.target)
    : new FormData(event.target);

  const optionalText = (name) => String(form.get(name) || "").trim() || null;
  const optionalNumber = (name) => {
    const value = String(form.get(name) || "").trim();
    return value === "" ? null : Number(value);
  };
  const selectedList = (name) => unique(
    form.getAll(name).map((value) => String(value).trim()).filter(Boolean)
  );

  if (formId === "video-connection-entry-form") {
    const placementId = String(form.get("placementId") || "");
    const placement = state.videoTracking.connection.options.find(
      (item) => item.placementId === placementId
    );
    const draftUrls = String(form.get("videoUrls") || "");
    const videoUrls = parseVideoConnectionDraft(draftUrls);
    if (!placement) {
      showToast("Choose an exact creator, social account, and campaign placement.");
      return;
    }
    if (videoUrls.length < 1 || videoUrls.length > 25) {
      showToast("Paste between 1 and 25 video URLs, one per line.");
      return;
    }
    const previews = videoUrls.map(videoConnectionPreview);
    if (previews.some((item) => !item)) {
      showToast("One or more URLs are not supported exact video links.");
      return;
    }
    if (previews.some((item) => item.platform !== String(placement.platform).toLowerCase())) {
      showToast("Every URL must use the selected social account platform.");
      return;
    }
    state.videoTracking.connection = {
      ...state.videoTracking.connection,
      selectedPlacementId: placementId,
      draftUrls,
      reviewUrls: previews.map((item) => item.href),
      idempotencyKey: crypto.randomUUID(),
      stage: "review",
      error: null
    };
    renderOverlay();
    return;
  }

  if (formId === "video-connection-review-form") {
    const connection = state.videoTracking.connection;
    if (connection.saving) return;
    const placement = connection.options.find(
      (item) => item.placementId === connection.selectedPlacementId
    );
    const confirmedUrls = selectedList("confirmedUrl");
    const expectedUrls = connection.reviewUrls || [];
    if (
      !placement ||
      confirmedUrls.length !== expectedUrls.length ||
      expectedUrls.some((url) => !confirmedUrls.includes(url))
    ) {
      showToast("Every selected video must be opened and confirmed before it can be connected.");
      return;
    }
    state.videoTracking.connection = { ...connection, saving: true, error: null };
    renderOverlay();
    try {
      const payload = await requestJson("/api/video-tracking/connect", {
        method: "POST",
        csrf: true,
        body: {
          action: "connect_exact_creator_videos",
          assignmentId: placement.assignmentId,
          socialAccountId: placement.socialAccountId,
          deliverableId: placement.deliverableId || null,
          videoUrls: expectedUrls,
          verificationMethod: "manual_url_review",
          idempotencyKey: connection.idempotencyKey
        }
      });
      const result = payload?.data || payload || {};
      state.drawer = null;
      state.videoTracking.connection = freshVideoConnectionState({ result });
      renderOverlay();
      showToast(`${Number(result.connectedVideos || 0).toLocaleString()} creator video${Number(result.connectedVideos || 0) === 1 ? "" : "s"} connected and queued for metrics.`);
      await loadVideoTracking();
    } catch (error) {
      state.videoTracking.connection = {
        ...state.videoTracking.connection,
        saving: false,
        error: error instanceof Error ? error.message : "The videos could not be connected."
      };
      renderOverlay();
      showToast("Nothing was connected. Review the exact creator placement and try again.");
    }
    return;
  }

  if (formId === "manual-creator-form") {
    const creatorId = optionalText("creatorId");
    const creator = creatorId ? creatorById(creatorId) : null;
    if ((creatorId && !creator) || (creator ? !canEditManualCreator(creator) : !canCreateManualCreator())) {
      showToast("Your role cannot save this creator. Nothing was changed.");
      return;
    }
    const socialProfileIds = form.getAll("socialProfileId");
    const socialPlatforms = form.getAll("socialPlatform");
    const socialHandles = form.getAll("socialHandle");
    const socialProfileUrls = form.getAll("socialProfileUrl");
    const socialRecentRates = form.getAll("socialRecentRate");
    const socialRateCurrencies = form.getAll("socialRateCurrency");
    const socialProfiles = socialPlatforms.map((platform, index) => ({
      id: String(socialProfileIds[index] || "").trim() || null,
      platform: String(platform || "other"),
      handle: String(socialHandles[index] || "").trim(),
      profileUrl: String(socialProfileUrls[index] || "").trim(),
      recentRate: String(socialRecentRates[index] || "").trim() === ""
        ? null
        : Number(socialRecentRates[index]),
      rateCurrency: String(socialRateCurrencies[index] || "USD").trim().toUpperCase()
    }));
    const body = {
      action: "save_manual_creator",
      idempotencyKey: crypto.randomUUID(),
      expectedRevision: creator?.revision ?? null,
      displayName: String(form.get("displayName") || "").trim(),
      socialProfiles,
      lifecycleStatus: String(form.get("lifecycleStatus") || "active"),
      categories: selectedList("categories"),
      preferredFormats: selectedList("preferredFormats"),
      lastContactedOn: optionalText("lastContactedOn"),
      closestCostcoName: optionalText("closestCostcoName"),
      closestCostcoCity: optionalText("closestCostcoCity"),
      closestCostcoState: optionalText("closestCostcoState"),
      closestCostcoDistanceMiles: optionalNumber("closestCostcoDistanceMiles"),
      closestCostcoEstimatedMinutes: optionalNumber("closestCostcoEstimatedMinutes"),
      internalNote: optionalText("internalNote")
    };
    const endpoint = creator
      ? `/api/creators/${encodeURIComponent(creator.id)}`
      : "/api/creators";
    try {
      const payload = await requestJson(endpoint, { method: "POST", csrf: true, body });
      const result = payload?.data || {};
      const returned = result.creator || (result.id ? result : null);
      const [adapted] = returned ? adaptWorkspaceRecords("creators", [returned]) : [];
      if (adapted) {
        const index = state.creators.findIndex((item) => item.id === adapted.id);
        if (index >= 0) state.creators[index] = adapted;
        else state.creators.unshift(adapted);
      }
      const savedId = adapted?.id || result.creatorId || creator?.id;
      state.drawer = null;
      state.editingCreatorId = null;
      if (savedId) {
        state.selectedCreatorId = savedId;
        state.profileTab = "overview";
        setRoute("creator");
      } else {
        setRoute("creators");
      }
      showToast(creator ? "Creator profile saved." : "Creator created.");
    } catch (error) {
      showToast(`Nothing was saved. ${error instanceof Error ? error.message : "The creator record was rejected."}`);
    }
    return;
  }

  if (formId === "manual-campaign-form") {
    const campaignId = optionalText("campaignId");
    const campaign = campaignId ? campaignById(campaignId) : null;
    if ((campaignId && !campaign) || (campaign ? !canEditManualCampaign(campaign) : !canCreateManualCampaign())) {
      showToast("Your role cannot save this campaign. Nothing was changed.");
      return;
    }
    const body = {
      action: "save_manual_campaign",
      idempotencyKey: crypto.randomUUID(),
      expectedRevision: campaign?.revision ?? null,
      name: String(form.get("name") || "").trim(),
      productName: String(form.get("productName") || "").trim(),
      brandName: String(form.get("brandName") || "").trim(),
      campaignType: String(form.get("campaignType") || "other"),
      status: String(form.get("status") || "planning"),
      startDate: optionalText("startDate"),
      endDate: optionalText("endDate"),
      timezone: String(form.get("timezone") || "America/Los_Angeles").trim(),
      currency: String(form.get("currency") || "USD").trim().toUpperCase(),
      budget: optionalNumber("budget"),
      ...campaignOwnerPayload(campaign, optionalText("ownerId"))
    };
    const endpoint = campaign
      ? `/api/campaigns/${encodeURIComponent(campaign.id)}`
      : "/api/campaigns";
    if(event.target.dataset.saving)return;
    event.target.dataset.saving='true';
    let savedCampaignId=null;
    try {
      const payload = await requestJson(endpoint, { method: "POST", csrf: true, body });
      const result = payload?.data || {};
      const returned = result.campaign || (result.id ? result : null);
      const [adapted] = returned ? adaptWorkspaceRecords("campaigns", [returned]) : [];
      if (adapted) {
        const index = state.campaigns.findIndex((item) => item.id === adapted.id);
        if (index >= 0) {
          state.campaigns[index] = {
            ...adapted,
            assignments: state.campaigns[index].assignments || []
          };
        }
        else state.campaigns.unshift(adapted);
      }
      const savedId = adapted?.id || result.campaignId || campaign?.id;
      savedCampaignId=savedId;
      state.creatorLibrary.campaignCreation=null;
      state.drawer = null;
      state.editingCampaignId = null;
      if (savedId) {
        state.selectedCampaignId = savedId;
        setRoute("campaign");
      } else {
        setRoute("campaigns");
      }
      if (savedId) await refreshCampaignAssignments(savedId);
      showToast(campaign ? "Campaign saved." : "Campaign created.");
    } catch (error) {
      showToast(`${savedCampaignId?"Campaign saved, but the next step could not finish. Reopen it from Campaigns.":"Campaign save could not be confirmed. Check Campaigns before trying again."} ${error instanceof Error ? error.message : ""}`);
    } finally { delete event.target.dataset.saving; }
    return;
  }

  if (formId === "manual-assignment-form") {
    const campaign = campaignById(state.selectedCampaignId);
    const assignmentId = optionalText("assignmentId");
    const assignment = campaign?.assignments?.find((item) => item.id === assignmentId) || null;
    if (!campaign) {
      showToast("Nothing was saved. The campaign is no longer available.");
      return;
    }
    if ((assignmentId && !assignment) || !canManageManualCampaignRoster(campaign) || (assignment && !canEditManualAssignment(campaign, assignment))) {
      showToast("Your role cannot save this campaign creator assignment. Nothing was changed.");
      return;
    }
    const body = {
      action: "save_manual_assignment",
      idempotencyKey: crypto.randomUUID(),
      expectedRevision: assignment?.revision ?? null,
      assignmentId: assignment?.id || null,
      creatorId: String(form.get("creatorId") || ""),
      engagementType: String(form.get("engagementType") || "unknown"),
      status: String(form.get("status") || "potential"),
      feeAmount: optionalNumber("feeAmount"),
      feeCurrency: "USD",
      paidUsageDays: optionalNumber("paidUsageDays"),
      deliverableType: String(form.get("deliverableType") || "other"),
      platform: String(form.get("platform") || "other"),
      deliverableStatus: String(form.get("deliverableStatus") || "not_started"),
      dueDate: optionalText("dueDate"),
      paymentState: String(form.get("paymentState") || "not_required")
    };
    try {
      const payload = await requestJson(`/api/campaigns/${encodeURIComponent(campaign.id)}/assignments`, {
        method: "POST",
        csrf: true,
        body
      });
      const result = payload?.data || {};
      const returned = result.assignment || (result.id ? result : null);
      const [adapted] = returned ? adaptWorkspaceRecords("assignments", [returned]) : [];
      if (adapted) attachAssignmentsToCampaigns([adapted]);
      state.editingAssignmentId = null;
      if (isLiveMode()) await loadCampaignWorkspace(campaign.id, { force: true, notify: false });
      render();
      state.drawer = "manual-assignments";
      renderOverlay();
      showToast(assignment ? "Campaign creator assignment saved." : "Creator added to the campaign.");
    } catch (error) {
      showToast(`Nothing was saved. ${error instanceof Error ? error.message : "The assignment was rejected."}`);
    }
    return;
  }

  if (formId === "crm-client-form") {
    const existingId = String(form.get("id") || "").trim();
    const receipt = await runCrmAction({
      command: "client.save",
      client: {
        id: existingId || null,
        name: String(form.get("name") || "").trim(),
        lifecycleStatus: String(form.get("lifecycleStatus") || "Prospect"),
        industry: String(form.get("industry") || "").trim() || null,
        website: String(form.get("website") || "").trim() || null,
        description: String(form.get("description") || "").trim() || null,
        note: String(form.get("note") || "").trim() || null
      }
    }, existingId ? "Client profile updated." : "Client profile created.");
    const clientId = existingId || receipt?.changedEntities?.find((item) => item.kind === "client")?.id;
    if (receipt && clientId) {
      state.selectedClientId = clientId;
      state.clientTab = "overview";
      setRoute("client");
    }
    return;
  }

  if (formId === "crm-contact-form") {
    const contactId = String(form.get("id") || "").trim();
    await runCrmAction({
      command: "contact.save",
      clientId: String(form.get("clientId") || state.selectedClientId),
      contact: {
        id: contactId || null,
        displayName: String(form.get("displayName") || "").trim(),
        title: String(form.get("title") || "").trim() || null,
        preferredChannel: String(form.get("preferredChannel") || "").trim() || null,
        status: String(form.get("status") || "active").toLowerCase(),
        note: String(form.get("note") || "").trim() || null,
        email: String(form.get("email") || "").trim() || null,
        phone: String(form.get("phone") || "").trim() || null,
        mobile: String(form.get("mobile") || "").trim() || null,
        whatsapp: String(form.get("whatsapp") || "").trim() || null
      }
    }, "Client contact saved.");
    return;
  }

  if (formId === "crm-contact-role-form") {
    const roles = form.getAll("roles").map(String);
    if (!roles.length) return showToast("Choose at least one campaign role. Nothing was changed.");
    await runCrmAction({
      command: "campaign-contact-role.set",
      campaignId: String(form.get("campaignId") || ""),
      contactId: String(form.get("contactId") || ""),
      roles
    }, "Campaign contact role saved.");
    return;
  }

  if (formId === "crm-commercial-form") {
    const commercialState = String(form.get("state") || "proposed");
    const amountValue = String(form.get("amount") ?? "").trim();
    if (amountValue === "" || !Number.isFinite(Number(amountValue)) || Number(amountValue) < 0) {
      showToast("Enter a valid client contract value.");
      return;
    }
    const evidenceReferenceId = String(form.get("evidenceReferenceId") || "").trim();
    if (commercialState === "agreed" && !evidenceReferenceId) {
      showToast("Connect an approved campaign record before selecting Agreed.");
      return;
    }
    await runCrmAction({
      command: "client-commercial-terms.record",
      campaignId: String(form.get("campaignId") || ""),
      contractValue: {
        amount: Number(amountValue),
        currency: String(form.get("currency") || "USD")
      },
      state: commercialState,
      effectiveOn: String(form.get("effectiveOn") || "").trim() || null,
      evidenceReferenceId: evidenceReferenceId || null,
      externalAccountingReference: String(form.get("externalAccountingReference") || "").trim() || null
    }, "Client commercial terms recorded.");
    return;
  }

  if (formId === "crm-attention-form") {
    const dueValue = String(form.get("dueAt") || "");
    await runCrmAction({
      command: "attention.set-next-action",
      attentionId: String(form.get("attentionId") || ""),
      ownerId: null,
      ownerLabel: String(form.get("owner") || "").trim(),
      nextAction: String(form.get("nextAction") || "").trim(),
      dueAt: new Date(dueValue).toISOString()
    }, "Operational next action updated.");
    return;
  }

  if (formId === "crm-proposal-form") {
    const proposalId = String(form.get("proposalId") || "").trim();
    const assignmentIds = form.getAll("assignmentIds").map(String);
    if (!assignmentIds.length) return showToast("Select at least one campaign assignment. Nothing was changed.");
    const proposedClientValue = String(form.get("proposedClientValue") || "").trim();
    if (proposedClientValue === "") return showToast("Enter a proposed client value. Nothing was changed.");
    const receipt = await runCrmAction({
      command: "proposal.save-draft",
      proposalId: proposalId || null,
      campaignId: String(form.get("campaignId") || ""),
      title: String(form.get("title") || "").trim(),
      assignmentIds,
      proposedClientValue: Number(proposedClientValue),
      currency: String(form.get("currency") || "USD")
    }, proposalId ? "Proposal draft updated." : "Proposal draft created.");
    const savedProposalId = proposalId || receipt?.changedEntities?.find((item) => item.kind === "proposal")?.id;
    if (receipt && savedProposalId) {
      state.selectedProposalId = savedProposalId;
      setRoute("proposal");
    }
    return;
  }

  if (formId === "crm-assistant-form") {
    state.crm.assistant.loading = true;
    state.crm.assistant.error = null;
    state.crm.assistant.answer = null;
    state.crm.assistant.questionId = String(form.get("questionId") || "campaign.next-actions");
    state.crm.assistant.campaignId = String(form.get("campaignId") || state.selectedCampaignId);
    const campaignQuestionIds = new Set([
      "campaign.commercial-status",
      "campaign.next-actions",
      "campaign.report-readiness"
    ]);
    const parameters = campaignQuestionIds.has(state.crm.assistant.questionId)
      ? { campaignId: state.crm.assistant.campaignId }
      : state.crm.assistant.questionId === "campaigns.overdue-deliverables"
        ? { asOf: new Date().toISOString() }
        : {};
    renderOverlay();
    try {
      state.crm.assistant.answer = await crmView({ view: "assistant", question: {
        id: state.crm.assistant.questionId,
        parameters
      } });
    } catch (error) {
      state.crm.assistant.error = error instanceof Error ? error.message : "The operational answer is unavailable.";
    } finally {
      state.crm.assistant.loading = false;
      renderOverlay();
    }
    return;
  }

  if (event.target.dataset.assistedImportForm === "search") {
    await loadAssistedImportMaterializationOptions(
      String(form.get("factId") || ""),
      String(form.get("query") || "")
    );
    return;
  }

  if (event.target.dataset.assistedImportForm === "history-search") {
    await loadAssistedImportMaterializationHistory(String(form.get("query") || ""));
    return;
  }

  if (event.target.dataset.assistedImportForm === "correction-search") {
    await loadAssistedImportCorrectionOptions(
      String(form.get("mapId") || ""),
      String(form.get("query") || "")
    );
    return;
  }

  if (event.target.dataset.assistedImportForm === "correct-materialization") {
    const confirmed = form.get("confirmed") === "on";
    if (!confirmed) {
      showToast("Confirm that the correction changes evidence links only.");
      return;
    }
    await correctAssistedImportMaterialization({
      mapId: String(form.get("mapId") || ""),
      replacementTargetId: String(form.get("replacementTargetId") || ""),
      reason: String(form.get("reason") || ""),
      confirmed,
      idempotencyKey: state.assistedImport.correction.idempotencyKey
    });
    return;
  }

  if (event.target.dataset.assistedImportForm === "materialize") {
    const resolution = String(form.get("resolution") || "");
    const targetType = String(form.get("targetType") || "");
    const selectedBrand = event.target.elements?.brandId?.selectedOptions?.[0] || null;
    await materializeAssistedImportFact({
      factId: String(form.get("factId") || ""),
      resolution,
      existingTargetId: resolution === "link_existing"
        ? String(form.get("existingTargetId") || "")
        : null,
      staffConfirmedName: resolution === "create_provisional"
        ? String(form.get("staffConfirmedName") || "")
        : null,
      clientId: targetType === "brand"
        ? String(form.get("clientId") || "")
        : ["campaign", "product"].includes(targetType)
          ? String(selectedBrand?.dataset?.clientId || "")
          : null,
      brandId: ["campaign", "product"].includes(targetType)
        ? String(form.get("brandId") || "")
        : null,
      campaignType: targetType === "campaign"
        ? String(form.get("campaignType") || "")
        : null
    });
    return;
  }

  if (formId === "assisted-import-pilot-review-form") {
    await recordAssistedImportPilotReview({
      runId: String(form.get("runId") || ""),
      sampledFactCount: Number(form.get("sampledFactCount")),
      accuracyPercent: Number(form.get("accuracyPercent")),
      incorrectAutomaticMerges: Number(form.get("incorrectAutomaticMerges")),
      sensitiveExposures: Number(form.get("sensitiveExposures")),
      evidenceLinksComplete: form.get("evidenceLinksComplete") === "on",
      staffVerifiedOverwriteCount: Number(form.get("staffVerifiedOverwriteCount")),
      ambiguousFactsSafelyHandled: form.get("ambiguousFactsSafelyHandled") === "on",
      rerunIdempotent: form.get("rerunIdempotent") === "on",
      sensitivePermissionsPassed: form.get("sensitivePermissionsPassed") === "on"
    });
    return;
  }

  if (event.target.id === "communication-action-form") {
    const campaignId = String(form.get("campaignId"));
    try {
      await sendCampaignCommand("communication.action.update", { campaignId, gmailThreadId: String(form.get("gmailThreadId")), nextAction: String(form.get("nextAction") || "").trim(), dueDate: String(form.get("dueDate") || "") || null });
      state.drawer = null;
      await ensureCampaignOperations(campaignId, { force: true, notify: false });
      showToast("Next action saved. Gmail reply status will continue updating automatically.");
    } catch (error) {
      showToast(`Nothing was saved. ${error instanceof Error ? error.message : "The next action was rejected."}`);
    }
    return;
  }

  if (event.target.id === "rights-form") {
    const campaignId = String(form.get("campaignId"));
    try {
      await sendCampaignCommand("rights.upsert", { campaignId, assignmentId: String(form.get("assignmentId")), deliverableId: null, rightsType: String(form.get("rightsType")), platform: String(form.get("platform")), territory: String(form.get("territory")), startsOn: String(form.get("startsOn") || "") || null, expiresOn: String(form.get("expiresOn") || "") || null, status: String(form.get("status")), adCodeStatus: String(form.get("adCodeStatus")), adCodeExpiresOn: String(form.get("adCodeExpiresOn") || "") || null });
      state.drawer = null;
      await ensureCampaignOperations(campaignId, { force: true, notify: false });
      showToast("Rights and ad-code dates saved.");
    } catch (error) {
      showToast(`Nothing was saved. ${error instanceof Error ? error.message : "The rights update was rejected."}`);
    }
    return;
  }
  if (formId === "creator-gmail-form") {
    const creator = creatorById(state.linkingGmailCreatorId || state.selectedCreatorId);
    if (!creator || !canLinkCreatorGmail(creator) || !isLiveMode()) {
      showToast("Nothing was saved. Gmail links require staff access to this creator's campaign.");
      return;
    }
    const approvedSubject = approvedSubjectMetadata(form.get("approvedSubject"));
    if (!approvedSubject.valid) {
      showToast("The approved subject cannot include an email address, phone number, control character, or more than 240 characters.");
      return;
    }
    try {
      await requestJson(`/api/creators/${encodeURIComponent(creator.sourceRecordId || creator.id)}/gmail-conversations`, {
        method: "POST",
        csrf: true,
        body: {
          action: "link_creator_gmail_conversation",
          campaignId: optionalText("campaignId"),
          gmailPermalink: String(form.get("gmailPermalink") || "").trim(),
          latestMessageOn: String(form.get("latestMessageOn") || ""),
          approvedSubject: approvedSubject.value,
          milestoneType: String(form.get("milestoneType") || "general_relationship"),
          nextAction: optionalText("nextAction")
        }
      });
      state.drawer = null;
      state.linkingGmailCreatorId = null;
      state.profileTab = "conversations";
      await loadCreatorDetail(creator.id);
      render();
      showToast("Gmail conversation linked.");
    } catch (error) {
      showToast(`Nothing was saved. ${error instanceof Error ? error.message : "The Gmail conversation was rejected."}`);
    }
    return;
  }
  if (formId === "private-profile-form") {
    const creator = creatorById(state.selectedCreatorId);
    if (!creator || !isLiveMode()) {
      showToast("Nothing was saved. Private records require the signed-in production workspace.");
      return;
    }
    try {
      const payload = await requestJson(`/api/creators/${encodeURIComponent(creator.sourceRecordId || creator.id)}/private-profile`, {
        method: "POST",
        csrf: true,
        body: {
          action: "save_profile",
          expectedVersion: Number(form.get("version") || 0),
          idempotencyKey: crypto.randomUUID(),
          profile: {
            recipientName: String(form.get("recipientName") || "").trim() || null,
            contactEmail: String(form.get("contactEmail") || "").trim() || null,
            phone: String(form.get("phone") || "").trim() || null,
            addressSourceText: String(form.get("addressSourceText") || "").trim() || null,
            addressLine1: String(form.get("addressLine1") || "").trim() || null,
            addressLine2: String(form.get("addressLine2") || "").trim() || null,
            city: String(form.get("city") || "").trim() || null,
            region: String(form.get("region") || "").trim() || null,
            postalCode: String(form.get("postalCode") || "").trim() || null,
            countryCode: String(form.get("countryCode") || "").trim().toUpperCase() || null,
            contactStatus: String(form.get("contactStatus") || "unverified"),
            emailOptOut: form.get("emailOptOut") === "on"
          }
        }
      });
      state.privateCreatorRecord = {
        ...(state.privateCreatorRecord || {}),
        profile: payload?.data || state.privateCreatorRecord?.profile
      };
      renderOverlay();
      showToast("Private creator profile saved.");
    } catch (error) {
      showToast(`Nothing was saved. ${error instanceof Error ? error.message : "The private profile was rejected."}`);
    }
    return;
  }

  if (formId === "compliance-review-form") {
    const record = assignmentById(form.get("assignmentId"));
    if (!record?.assignment.post?.attributionId || !record.assignment.post.verified) {
      showToast("Link and verify an exact post before recording disclosure review.");
      return;
    }
    const disclosureStatus = String(form.get("disclosureStatus") || "pending");
    const disclosureMethod = String(form.get("disclosureMethod") || "") || null;
    const evidenceNote = String(form.get("evidenceNote") || "").trim() || null;
    if (disclosureStatus === "verified" && !disclosureMethod) {
      showToast("Choose how the disclosure was shown before marking it verified.");
      return;
    }
    if (disclosureStatus === "missing" && !evidenceNote) {
      showToast("Add an evidence note explaining the missing disclosure.");
      return;
    }
    const review = {
      materialConnection: String(form.get("materialConnection") || "other"),
      disclosureStatus,
      disclosureMethod,
      evidenceNote
    };
    if (isLiveMode()) {
      try {
        await sendCampaignCommand("compliance.review", {
          campaignId: record.campaign.id,
          attributionId: record.assignment.post.attributionId,
          ...review
        });
        const reload = await ensureCampaignOperations(record.campaign.id, { force: true, notify: false });
        renderOverlay();
        showToast(reload.status === "ready"
          ? "Disclosure review saved and campaign attention refreshed."
          : "Disclosure review saved, but live attention could not be reloaded. Refresh before making another change.");
      } catch (error) {
        showToast(`Nothing was saved. ${error instanceof Error ? error.message : "The server rejected the disclosure review."}`);
      }
      return;
    }
    record.assignment.complianceReviews ||= [];
    record.assignment.complianceReviews.push({
      id: `DEMO-COMPLIANCE-${Date.now()}`,
      campaignId: record.campaign.id,
      assignmentId: record.assignment.id,
      deliverableId: state.editingDeliverableId,
      attributionId: record.assignment.post.attributionId,
      ...review,
      reviewedAt: new Date().toISOString().slice(0, 10),
      reviewer: state.currentUser.name
    });
    renderOverlay();
    showToast("Disclosure review simulated in demo mode; no production record was changed.");
    return;
  }

  if (formId === "new-campaign-form") {
    if (isLiveMode()) {
      showToast("Campaign creation is not connected yet. Nothing was saved.");
      return;
    }
    const id = `cmp-${String(form.get("name")).toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/(^-|-$)/g, "")}-${Date.now().toString().slice(-4)}`;
    const templateDefaults = campaignTemplateDefaults(state.selectedTemplate);
    const campaign = {
      id,
      name: form.get("name"),
      client: form.get("client"),
      brand: form.get("brand"),
      category: form.get("category"),
      type: form.get("type"),
      status: "Planning",
      startDate: form.get("startDate"),
      endDate: form.get("endDate"),
      objective: form.get("objective"),
      owner: state.currentUser.name,
      reportOwner: "Riley Patel",
      budget: Number(form.get("budget")),
      reportStatus: "Not started",
      reportId: null,
      template: state.selectedTemplate,
      templateDefaults: structuredClone(templateDefaults),
      assignments: [],
      gmailThreads: []
    };
    state.campaigns.unshift(campaign);
    state.selectedCampaignId = id;
    state.campaignTab = "summary";
    state.drawer = null;
    state.selectedTemplate = "Blank";
    setRoute("campaign");
    showToast("Campaign created. Add creators from BYOU history next.");
    return;
  }

  if (formId === "source-form") {
    if (isLiveMode()) {
      showToast("Source editing is not connected yet. Nothing was saved.");
      return;
    }
    const existingId = form.get("id");
    const source = existingId ? sourceById(existingId) : null;
    if (source) {
      Object.assign(source, {
        name: form.get("name"),
        type: form.get("type"),
        category: form.get("category"),
        owner: form.get("owner"),
        status: form.get("status"),
        connection: form.get("connection"),
        description: form.get("description"),
        workflow: form.get("workflow")
      });
      state.selectedSourceId = source.id;
    } else {
      const id = `SRC-${String(form.get("name")).toUpperCase().replaceAll(/[^A-Z0-9]+/g, "-").replaceAll(/(^-|-$)/g, "")}-${Date.now().toString().slice(-3)}`;
      state.sources.push({
        id,
        name: form.get("name"),
        type: form.get("type"),
        category: form.get("category"),
        owner: form.get("owner"),
        status: form.get("status"),
        connection: form.get("connection"),
        description: form.get("description"),
        workflow: form.get("workflow"),
        linkedRecords: ["Creator relationships", "Campaign assignments", "Source notes"]
      });
      state.selectedSourceId = id;
    }
    state.drawer = null;
    setRoute("sources");
    showToast("Source record saved.");
    return;
  }

  if (formId === "deliverable-form") {
    const record = assignmentById(form.get("assignmentId"));
    if (!record) return;
    const { campaign, assignment } = record;
    const creator = creatorById(assignment.creatorId);
    if (isLiveMode()) {
      if (!canUseAction("update_deliverable", assignment)) {
        showToast("Nothing was saved. Your role has read-only access to deliverables.");
        return;
      }
      await saveLiveMutation({
        rpc: "update_deliverable",
        args: {
          p_assignment_id: String(form.get("assignmentId")),
          p_deliverable_id: String(form.get("deliverableId") || "") || null,
          p_status: String(form.get("status")),
          p_revision_count: Number(form.get("revisionCount")),
          p_due_date: String(form.get("nextDueDate") || "") || null,
          p_post_url: String(form.get("postUrl") || "").trim(),
          p_post_source: String(form.get("postSource") || ""),
          p_note: String(form.get("note") || "")
        },
        successMessage: `${creatorDisplayName(creator)} deliverable saved.`,
        onSuccess: () => {
          state.selectedCampaignId = campaign.id;
          state.campaignTab = "deliverables";
        }
      });
      return;
    }
    assignment.deliverable.status = form.get("status");
    assignment.deliverable.revisionCount = Number(form.get("revisionCount"));
    assignment.deliverable.nextDueDate = form.get("nextDueDate") || null;
    assignment.deliverable.owner = state.currentUser.name;
    assignment.status = form.get("status");
    assignment.notes = form.get("note");
    const postUrl = String(form.get("postUrl") || "").trim();
    if (postUrl) {
      const changedUrl = assignment.post?.url !== postUrl;
      assignment.post = {
        ...(assignment.post || {}),
        deliverableId: String(form.get("deliverableId") || "") || assignment.deliverable.id || deliverablesForAssignment(assignment)[0]?.id || null,
        url: postUrl,
        platform: assignment.post?.platform || creator.platforms[0],
        platformPostId: postUrl.split("/").filter(Boolean).at(-1),
        postedDate: assignment.post?.postedDate || null,
        source: form.get("postSource"),
        sourceRecordId: assignment.post?.sourceRecordId || `POST-${assignment.id.toUpperCase()}`,
        verified: changedUrl ? false : Boolean(assignment.post?.verified),
        verifiedBy: changedUrl ? null : assignment.post?.verifiedBy,
        addedBy: state.currentUser.name
      };
    }
    state.activityUpdates.unshift({
      id: `UPD-${Date.now()}`,
      campaignId: campaign.id,
      type: "Deliverable",
      status: form.get("status"),
      note: form.get("note") || `${creatorDisplayName(creator)} deliverable status updated.`,
      owner: state.currentUser.name,
      nextOwner: postUrl ? "Jordan Lee" : state.currentUser.name,
      nextAction: postUrl ? "Verify the exact post against the assignment" : "Complete the next deliverable milestone",
      dueDate: form.get("nextDueDate") || null,
      createdAt: "2026-07-14"
    });
    state.drawer = null;
    state.campaignTab = "deliverables";
    render();
    showToast(`${creatorDisplayName(creator)} deliverable updated.`);
    return;
  }

  if (formId === "post-verification-form") {
    const record = assignmentById(form.get("assignmentId"));
    if (!record?.assignment.post?.attributionId) return;
    const { campaign, assignment } = record;
    const creator = creatorById(assignment.creatorId);
    const decision = String(form.get("decision"));
    const rejectionReason = String(form.get("rejectionReason") || "").trim();
    if (decision === "rejected" && !rejectionReason) {
      showToast("Nothing was saved. A rejection reason is required.");
      return;
    }
    if (isLiveMode()) {
      if (!canUseAction("verify_post", assignment)) {
        showToast("Nothing was saved. Your role cannot verify this post.");
        return;
      }
      await saveLiveMutation({
        rpc: "verify_post_attribution",
        args: {
          p_attribution_id: String(form.get("attributionId")),
          p_decision: decision,
          p_verification_method: String(form.get("method")),
          p_rejection_reason: decision === "rejected" ? rejectionReason : null
        },
        successMessage: `${creatorDisplayName(creator)} post review saved.`,
        onSuccess: () => {
          state.selectedCampaignId = campaign.id;
          state.campaignTab = "deliverables";
        }
      });
      return;
    }
    assignment.post.verified = decision === "verified";
    assignment.post.verifiedBy = state.currentUser.name;
    assignment.post.verificationMethod = String(form.get("method"));
    state.drawer = null;
    state.campaignTab = "deliverables";
    render();
    showToast(`${creatorDisplayName(creator)} post review recorded.`);
    return;
  }

  if (formId === "payment-approval-form") {
    const record = assignmentById(form.get("assignmentId"));
    const approvalRole = String(form.get("approvalRole") || "");
    const decision = String(form.get("decision") || "");
    const note = String(form.get("note") || "").trim();
    if (!record || !["ceo", "cfo"].includes(approvalRole) || !canRecordPaymentApproval(approvalRole)) {
      showToast("Nothing was saved. Your signed-in role cannot record this approval.");
      return;
    }
    if (!note || note.length > 500 || !["approved", "rejected"].includes(decision)) {
      showToast("Choose a final decision and enter a note of 500 characters or fewer.");
      return;
    }
    if (isLiveMode()) {
      await saveLiveMutation({
        rpc: "record_payment_obligation_approval",
        args: {
          p_assignment_id: String(form.get("assignmentId")),
          p_approval_role: approvalRole,
          p_decision: decision,
          p_note: note
        },
        successMessage: `${approvalRole.toUpperCase()} decision recorded against the current obligation.`,
        onSuccess: () => {
          state.selectedCampaignId = record.campaign.id;
          state.campaignTab = "commercial";
        }
      });
      return;
    }
    const payment = record.assignment.payment || {};
    const actorId = state.currentUser.id || state.currentUser.name;
    const otherActorId = approvalRole === "ceo" ? payment.cfoApprovalActorId : payment.ceoApprovalActorId;
    if (decision === "approved" && otherActorId && otherActorId === actorId) {
      showToast("Nothing was saved. CEO and CFO approvals must come from different staff accounts.");
      return;
    }
    payment[approvalRole === "ceo" ? "ceoApproval" : "cfoApproval"] = decision === "approved" ? "Approved" : "Rejected";
    payment[approvalRole === "ceo" ? "ceoApprovalActorId" : "cfoApprovalActorId"] = actorId;
    record.assignment.payment = payment;
    state.drawer = null;
    state.campaignTab = "commercial";
    render();
    showToast(`${approvalRole.toUpperCase()} decision recorded in demo mode.`);
    return;
  }

  if (formId === "payment-form") {
    const record = assignmentById(form.get("assignmentId"));
    if (!record) return;
    const { campaign, assignment } = record;
    const creator = creatorById(assignment.creatorId);
    const externalReference = String(form.get("externalReference") || "").trim();
    if (String(form.get("status")) === "Paid" && !externalReference) {
      showToast("Nothing was saved. A finance-system reference is required when status is Paid.");
      return;
    }
    if (isLiveMode()) {
      if (!canUseAction("update_payment", assignment)) {
        showToast("Nothing was saved. Your role has read-only access to payment obligations.");
        return;
      }
      await saveLiveMutation({
        rpc: "update_payment_obligation",
        args: {
          p_assignment_id: String(form.get("assignmentId")),
          p_amount: Number(form.get("amount")),
          p_due_date: String(form.get("dueDate") || "") || null,
          p_invoice_status: String(form.get("invoiceStatus")),
          p_ceo_approval_status: String(form.get("ceoApproval")),
          p_cfo_approval_status: String(form.get("cfoApproval")),
          p_workflow_status: String(form.get("status")),
          p_external_finance_reference: externalReference,
          p_note: String(form.get("note") || "")
        },
        successMessage: `${creatorDisplayName(creator)} payment obligation saved.`,
        onSuccess: () => {
          state.selectedCampaignId = campaign.id;
          state.campaignTab = "commercial";
        }
      });
      return;
    }
    const nextAmount = Number(form.get("amount"));
    const nextDueDate = form.get("dueDate") || null;
    const nextInvoiceStatus = form.get("invoiceStatus");
    const materialObligationChanged = Number(assignment.payment?.amount) !== nextAmount
      || (assignment.payment?.dueDate || null) !== nextDueDate
      || assignment.payment?.invoiceStatus !== nextInvoiceStatus
      || (assignment.payment?.externalReference || "") !== externalReference;
    assignment.rate = nextAmount;
    assignment.payment = {
      ...(assignment.payment || {}),
      amount: nextAmount,
      dueDate: nextDueDate,
      invoiceStatus: nextInvoiceStatus,
      ceoApproval: materialObligationChanged ? "Unknown" : form.get("ceoApproval"),
      cfoApproval: materialObligationChanged ? "Unknown" : form.get("cfoApproval"),
      ceoApprovalActorId: materialObligationChanged ? null : assignment.payment?.ceoApprovalActorId || null,
      cfoApprovalActorId: materialObligationChanged ? null : assignment.payment?.cfoApprovalActorId || null,
      status: form.get("status"),
      externalReference,
      owner: "Noah Garcia",
      sourceRecordId: assignment.payment?.sourceRecordId || `PAY-${assignment.id.toUpperCase()}`,
      updatedAt: "2026-07-14"
    };
    assignment.paymentStatus = form.get("status");
    const nextOwner = assignment.payment.ceoApproval !== "Approved" ? "CEO approver" : assignment.payment.cfoApproval !== "Approved" ? "CFO approver" : "Noah Garcia";
    state.activityUpdates.unshift({
      id: `UPD-${Date.now()}`,
      campaignId: campaign.id,
      type: "Payment",
      status: form.get("status"),
      note: form.get("note") || `${creatorDisplayName(creator)} payment obligation updated.`,
      owner: "Noah Garcia",
      nextOwner,
      nextAction: form.get("status") === "Paid" ? "Reconcile the completed obligation" : "Review the retained payment obligation",
      dueDate: form.get("dueDate") || null,
      createdAt: "2026-07-14"
    });
    state.drawer = null;
    state.campaignTab = "commercial";
    render();
    showToast(`${creatorDisplayName(creator)} payment obligation updated.`);
    return;
  }

  if (formId === "campaign-update-form") {
    const campaign = campaignById(state.selectedCampaignId);
    if (!campaign) return;
    const updateType = String(form.get("type") || "");
    if (!campaignUpdateTypeOptions(campaign).some(([value]) => value === updateType)) {
      showToast("Nothing was saved. That update type is not owned by your role.");
      return;
    }
    if (isLiveMode()) {
      if (!canUseAction("add_campaign_update", campaign)) {
        showToast("Nothing was saved. Your role has read-only access to campaign updates.");
        return;
      }
      await saveLiveMutation({
        rpc: "add_campaign_update",
        args: {
          p_campaign_id: state.selectedCampaignId,
          p_assignment_id: null,
          p_update_type: updateType,
          p_status: String(form.get("status")),
          p_note: String(form.get("note") || ""),
          p_next_action: String(form.get("nextAction") || ""),
          p_next_owner_label: String(form.get("nextOwner") || ""),
          p_due_date: String(form.get("dueDate") || "") || null
        },
        successMessage: "Campaign update saved.",
        onSuccess: () => {
          state.campaignTab = "summary";
        }
      });
      return;
    }
    state.activityUpdates.unshift({
      id: `UPD-${Date.now()}`,
      campaignId: state.selectedCampaignId,
      type: campaignUpdateTypeOptions(campaign).find(([value]) => value === updateType)?.[1] || updateType,
      status: form.get("status"),
      note: form.get("note"),
      owner: state.currentUser.name,
      nextOwner: form.get("nextOwner"),
      nextAction: form.get("nextAction"),
      dueDate: form.get("dueDate") || null,
      createdAt: "2026-07-14"
    });
    state.drawer = null;
    state.campaignTab = "summary";
    render();
    showToast("Campaign status update recorded.");
    return;
  }

  if (formId === "gmail-form") {
    const campaign = campaignById(form.get("campaignId"));
    if (!campaign) return;
    const creatorId = String(form.get("creatorId"));
    const assignmentId = campaign.assignments.find((assignment) => assignment.creatorId === creatorId)?.id || null;
    const approvedSubject = approvedSubjectMetadata(form.get("approvedSubject"));
    if (!approvedSubject.valid) {
      showToast("The approved subject cannot include an email address, phone number, control character, or more than 240 characters.");
      return;
    }
    if (isLiveMode()) {
      if (!canUseAction("link_gmail", campaign)) {
        showToast("Nothing was saved. Your role has read-only access to Gmail thread links.");
        return;
      }
      const latestDate = String(form.get("latestDate"));
      await saveLiveMutation({
        rpc: "link_gmail_thread_v2",
        args: {
          p_campaign_id: campaign.id,
          p_creator_id: creatorId,
          p_assignment_id: assignmentId,
          p_provider_thread_id: String(form.get("threadId") || "").trim(),
          p_gmail_permalink: String(form.get("url") || "").trim(),
          p_latest_message_at: latestDate ? `${latestDate}T12:00:00Z` : null,
          p_approved_subject: approvedSubject.value,
          p_milestone_type: String(form.get("milestone")),
          p_milestone_date: latestDate || null,
          p_next_action: String(form.get("nextAction") || "")
        },
        successMessage: "Gmail thread metadata linked.",
        onSuccess: () => {
          state.selectedSourceId = state.sources.find((source) => source.type === "Gmail")?.id || state.selectedSourceId;
          state.view = "sources";
        }
      });
      return;
    }
    campaign.gmailThreads ||= [];
    campaign.gmailThreads.push({
      id: `GMAIL-${Date.now()}`,
      creatorId: form.get("creatorId"),
      assignmentId,
      href: form.get("url"),
      providerThreadId: form.get("threadId"),
      latestMessageAt: form.get("latestDate"),
      approvedSubject: approvedSubject.value,
      milestone: form.get("milestone"),
      owner: state.currentUser.name,
      nextAction: form.get("nextAction")
    });
    state.activityUpdates.unshift({
      id: `UPD-${Date.now()}`,
      campaignId: campaign.id,
      type: "Creator relationship",
      status: form.get("milestone"),
      note: "Approved Gmail thread metadata linked.",
      owner: state.currentUser.name,
      nextOwner: state.currentUser.name,
      nextAction: form.get("nextAction"),
      dueDate: null,
      createdAt: "2026-07-14"
    });
    state.drawer = null;
    state.selectedSourceId = "SRC-GMAIL";
    setRoute("sources");
    showToast("Gmail thread linked.");
  }
};

overlayRoot.addEventListener("submit", handleOverlaySubmit);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.drawer) {
    state.drawer = null;
    renderOverlay();
  }
});

window.addEventListener("focus", () => {
  void revalidateOpenedArtifactAccess();
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") void revalidateOpenedArtifactAccess();
});

const calendarController = bindCalendar({
  root: app, getState: () => state.calendar, render, request: requestJson, isLive: isLiveMode,
  onSaved: () => {
    state.creatorLibrary.dropCampaignsLoaded = false;
    state.campaignPage.loaded = false;
  }
});
bindNegotiation({root:app,getState:()=>state.negotiation,render,request:requestJson,isLive:isLiveMode});
const seedingCampaignTabs=createSeedingCampaignTabs();
const seedingOutreach = createSeedingOutreachUI({ requestJson, canEdit:canManageManualCampaignRoster });
seedingOutreach.install({root:app,getCampaign:campaignById});
seedingCampaignTabs.install({root:app,onChange:(id,tab)=>{const c=campaignById(id);if(c&&tab==='outreach')seedingOutreach.ensureLoaded(c);}});
const campaignEmailSettings = createCampaignEmailSettingsUI({ requestJson, canEdit: canEditManualCampaign, onSaved: (campaign, policy) => updateCampaignWorkflowPolicy(campaign.id, policy) });
const campaignOps = createCampaignOperationsController({getLocale:()=>interfaceLocale,root:app,requestJson,rerender:render,notify:showToast,
  getCurrentUserId:()=>state.currentUser?.id||null,
  navigate:(view,id)=>{if(view==='campaign')clearPaidJourneyCache();setRoute(view,id?{selectedCampaignId:id}:{});},
  getCreators:()=>state.creatorLibrary.items,
  getSelectedCreators:()=>state.creatorLibrary.selectedCreators,
  setSelectedCreators:rows=>{state.creatorLibrary.selectedCreators=rows;},
  openCreator:openLibraryCreator,
  openContractEditor:context=>contractEditorPanel.launch(context)
});
campaignEmailSettings.install({ root: overlayRoot, getCampaign: campaignById });
installPaidJourneyUI({ root: app, getCampaign: campaignById, canEdit: canEditCampaignWorkflow, canContinue: canContinueCampaign, canManageContinuation: canManageContinuationCampaign, requestJson, rerender: render });
let routeRestoreVersion = 0;
const restoreBrowserRoute = async (event = {}) => {
  const version = ++routeRestoreVersion;
  campaignOps.dismissEditor();
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  settingsTab = params.get('settingsTab') === 'automations' || view === 'automations' ? 'automations' : 'profile';
  state.view = validViews.has(view) ? view : defaultView;
  state.drawer = null;
  state.selectedCreatorId = params.get('creator');
  state.selectedCampaignId = params.get('campaign');
  // Retired creator-workflow links resolve to the campaign without a detail page.
  if (params.has('assignment')) {
    params.delete('assignment');
    window.history.replaceState(window.history.state, '', `${window.location.pathname}?${params.toString()}`);
  }
  state.campaignTab = params.get('campaignTab') || 'summary';
  state.profileTab = params.get('profileTab') || 'overview';
  state.campaignSearch = (params.get('campaignQ') || '').slice(0,100);
  state.campaignTypeFilter = params.get('campaignType') || '';
  state.campaignStatusFilter = params.get('campaignStatus') || '';
  clearPaidJourneyCache();
  if (state.view === 'creators') {
    state.creatorLibrary.showManaged=false;creatorRouteHydrated=true;
    const id=readLibraryRoute();
    await loadCreatorLibrary(id ? {creatorId:id} : {offset:state.creatorLibrary.offset});
    if(version!==routeRestoreVersion)return;
    window.scrollTo({top:id?0:Number(event.state?.libraryDirectoryScroll)||0,behavior:'instant'});
    return;
  }
  render();
  window.scrollTo({top:0,behavior:'instant'});
  if (state.view === 'creator' && state.selectedCreatorId && isLiveMode()) await loadCreatorDetail(state.selectedCreatorId);
};
window.addEventListener('popstate',event=>{void restoreBrowserRoute(event);});
bootstrap().then(()=>{if(state.runtime.phase==='ready' && new URLSearchParams(window.location.search).has('assignment'))void restoreBrowserRoute();});
