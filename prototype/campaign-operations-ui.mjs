import {replyOverviewText} from './reply-overview-language.mjs';
import {displayDate,displayDateTime} from './date-format.mjs';
import { socialIcon } from './social-icons.mjs';
import {renderThursdayFinances} from './finance-batches-ui.mjs';
import {operationsIcon as icon} from './operations-icons.mjs';
import {renderAssignmentPublications} from './finance-batches.mjs';
import {documentHtml,documentText,validateAttachments} from './email-content.mjs';
import {campaignCategoryLabel,campaignCategory,campaignTimezone,campaignTemplates,campaignFiles,TEMPLATE_KINDS} from "./campaign-editor-fields.mjs";
import { safeSocialLink, postThumbnail, renderCreatorCardContent, creatorDisplayLabel } from "./creator-library.mjs";
import { renderCampaignEvidence } from "./campaign-evidence-ui.mjs";
import {renderAssignmentEditableFields,renderAssignmentContactSource} from './assignment-details-fields.mjs';
import {safeProfilePhoto} from './creator-photo.mjs';
import {creatorProgressSummary} from './campaign-progress-summary.mjs';
import {gmailThreadId} from './campaign-conversation-ui.mjs';
import {renderShipmentImportPanel} from './shipment-import-ui.mjs';
import {campaignWorkspaceMembers, workspaceTypeLabel, workspaceRootMember} from './campaign-workspaces.mjs';

// Pure presentation: authorization, requests, state, and focus belong to app.mjs.
export const MANAGER_PHASES = Object.freeze([
  "Intake and Qualification",
  "Negotiation & Contract Signing",
  "Shipping & Sampling",
  "Content Production & Revision",
  "Payment Processing & Closeout"
].map((label, index) => Object.freeze({ id: index + 1, label })));

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const list = value => Array.isArray(value) ? value : [];
const recorded = value => value !== null && value !== undefined && String(value).trim() !== "";
const text = (value, missing = "Not recorded") => esc(recorded(value) ? value : missing);
const code = value => String(value || "").trim().toLowerCase().replaceAll(" ", "_");
const phaseNumber = value => Number.isInteger(value) && value >= 1 && value <= 5 ? value : null;
const phaseName = value => MANAGER_PHASES.find(p => p.id === phaseNumber(value))?.label || "Phase not assigned";
const number = value => recorded(value) && Number.isFinite(Number(value)) ? Number(value).toLocaleString("en-US") : "Not recorded";
const money = (value, currency) => !recorded(value) || !Number.isFinite(Number(value)) ? "Not recorded" : `${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dateText = value => recorded(value) ? esc(displayDate(value)) : "Not recorded";
const option = (value, label, current) => `<option${value === "" ? ' data-i18n' : ''} value="${esc(value)}"${String(value) === String(current ?? "") ? " selected" : ""}>${esc(label)}</option>`;
const options = (items, current) => items.map(([value, label]) => option(value, label, current)).join("");
const scope = (campaignId, assignmentId) => ` data-campaign-id="${esc(campaignId)}"${assignmentId ? ` data-assignment-id="${esc(assignmentId)}"` : ""}`;
const tag = (label, tone = "") => `<span data-i18n class="ops-tag${tone ? ` ops-tag--${tone}` : ""}">${esc(label)}</span>`;
const actionIcon = action => ({"create-campaign":"add", "edit-campaign":"pencil", "delete-campaign":"delete", "manage-creators":"creators", "open-outreach":"mail", "reload-directory":"refresh", "reload-campaign":"refresh", "open-creator":"creators"})[action];
const button = (label, action, { campaignId = "", assignmentId = "", value, kind, creatorId, primary = false, disabled = false } = {}) => `<button type="button" class="button button--${primary ? "primary" : "secondary"} button--small" data-ops-action="${esc(action)}"${scope(campaignId, assignmentId)}${value !== undefined ? ` data-ops-value="${esc(value)}"` : ""}${kind ? ` data-ops-kind="${esc(kind)}"` : ""}${creatorId ? ` data-creator-id="${esc(creatorId)}"` : ""}${disabled ? " disabled" : ""}>${actionIcon(action) ? icon(actionIcon(action)) : ""}${esc(label)}</button>`;
const allowed = (permissions, record, key) => permissions?.[key] === true && record?.[key] === true;
const bound = (campaign, assignment) => Boolean(campaign?.id && assignment?.id && assignment?.creatorId && assignment.campaignId === campaign.id);
const header = (title, description, actions = "", eyebrow = "Campaign operations", contentNames = false) => `<header class="ops-heading"><div><p class="eyebrow" data-i18n-context="campaign-type">${esc(eyebrow)}</p><h1${contentNames ? ' data-no-translate' : ''}>${esc(title)}</h1>${description ? `<p${contentNames ? ' data-no-translate' : ''}>${esc(description)}</p>` : ""}</div>${actions ? `<div class="ops-actions">${actions}</div>` : ""}</header>`;
const empty = (title, description, action = "") => `<div class="ops-empty"><strong data-i18n>${esc(title)}</strong>${description ? `<p data-i18n>${esc(description)}</p>` : ""}${action}</div>`;
const errorNotice = error => error ? `<p class="ops-notice ops-error" role="alert">${esc(error)}</p>` : "";
const demoNotice = demo => demo ? '<p class="ops-notice" data-i18n>Sample workspace · Changes stay in this preview. No messages, shipments, or payments are sent.</p>' : "";
const search = (label, field, value, placeholder = label) => `<label class="ops-filter ops-search"><span>${esc(label)}</span><input type="search" data-ops-field="${esc(field)}" value="${esc(value || "")}" placeholder="${esc(placeholder)}" maxlength="200" /></label>`;
const select = (label, field, values, current) => `<label class="ops-filter"><span>${esc(label)}</span><select data-ops-field="${esc(field)}">${options(values, current)}</select></label>`;
const platformName = value => ({ instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", facebook: "Facebook" }[code(value)] || text(value, "Social profile"));
const platformMark = socialIcon;
const creatorName = assignment => creatorDisplayLabel(assignment);

export function safeOperationsLink(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function operationsNet30Date(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  date.setUTCDate(date.getUTCDate() + 30);
  return date.toISOString().slice(0, 10);
}

export function campaignActivity(campaign = {}) {
  if (campaign.isActive === true) return "active";
  if (campaign.isActive === false) return "inactive";
  const status = code(campaign.status);
  if (status === "active") return "active";
  return ["planning", "paused", "closeout", "completed", "cancelled", "canceled", "archived", "inactive"].includes(status) ? "inactive" : "unknown";
}

function activity(campaign) {
  const state = campaignActivity(campaign);
  return `<span class="ops-status ops-status--${state}"><i class="ops-dot" aria-hidden="true"></i>${state === "active" ? "Active" : state === "inactive" ? "Inactive" : "Activity unknown"}</span>`;
}

function workspaceTypeLinks(campaign) {
  const members = campaignWorkspaceMembers(campaign);
  return `<div class="ops-workspace-members">${members.map(member => `<button type="button" class="ops-workspace-type-link" data-ops-action="open-workspace-type"${scope(member.id)}><span data-i18n data-i18n-context="campaign-type">${esc(workspaceTypeLabel(member.type, member.name))}</span>${members.filter(other => code(other.type) === code(member.type)).length > 1 ? `<small data-no-translate>${text(member.name, 'Campaign name not recorded')}</small>` : ''}</button>`).join('')}</div>`;
}

function workspaceNavigation(campaign, ui, permissions) {
  if (campaign.workspaceAvailable !== true) return '';
  const members = campaignWorkspaceMembers(campaign);
  const root = workspaceRootMember(campaign);
  return `<div class="ops-workspace-typebar"><nav class="tabs ops-workspace-tabs" aria-label="Campaign types"><button type="button" class="${ui.workspaceOverview ? 'is-active' : ''}" data-ops-action="workspace-overview"${scope(campaign.id)} aria-pressed="${ui.workspaceOverview === true}"><span data-i18n>Overview</span></button>${members.map(member => `<button type="button" class="${!ui.workspaceOverview && member.id === campaign.id ? 'is-active' : ''}" data-ops-action="open-workspace-type"${scope(member.id)} aria-pressed="${!ui.workspaceOverview && member.id === campaign.id}"><span data-i18n data-i18n-context="campaign-type">${esc(workspaceTypeLabel(member.type, member.name))}</span>${members.filter(other => code(other.type) === code(member.type)).length > 1 ? `<span data-no-translate> · ${text(member.name, 'Campaign name not recorded')}</span>` : ''}</button>`).join('')}</nav>${campaign.workspaceLinkLocked !== true && root?.canEdit === true && permissions.canEdit === true ? button('Add type', 'add-campaign-type', {campaignId: campaign.id}) : ''}</div>`;
}

function workspaceOverview(campaign) {
  const members = campaignWorkspaceMembers(campaign);
  return `<section class="ops-workspace-overview" aria-label="Campaign overview"><h2 data-i18n>Campaign types</h2><div class="ops-table-wrap"><table class="ops-table"><caption class="sr-only">Campaign types and their saved details</caption><thead><tr><th scope="col">Type / campaign</th><th scope="col">Status</th><th scope="col">Dates</th><th scope="col">Budget</th><th scope="col">Manager</th></tr></thead><tbody>${members.map(member => {
    const status = ({planning: 'Planning', active: 'Active', paused: 'Paused', closeout: 'Closeout', completed: 'Completed', cancelled: 'Cancelled', archived: 'Archived', inactive: 'Inactive'})[code(member.status)] || member.status;
    return `<tr${scope(member.id)}><th scope="row"><span data-i18n data-i18n-context="campaign-type">${esc(workspaceTypeLabel(member.type, member.name))}</span><button type="button" class="ops-name-link" data-ops-action="open-workspace-type"${scope(member.id)} data-no-translate>${text(member.name, 'Campaign name not recorded')}</button></th><td><span data-i18n>${text(status, 'Status not recorded')}</span></td><td><span data-i18n>${dateText(member.startDate)}</span><small><span data-i18n>to</span> <span data-i18n>${dateText(member.endDate)}</span></small></td><td><span data-i18n>${money(member.budget, member.currency)}</span></td><td>${recorded(member.ownerName) ? `<span data-no-translate>${text(member.ownerName)}</span>` : '<span data-i18n>Not assigned</span>'}</td></tr>`;
  }).join('')}</tbody></table></div></section>`;
}

export function renderOperationsDirectory({ campaigns = [], ui = {}, loading = false, error = null, hasMore = false, demo = false, canCreate = false } = {}) {
  const query = String(ui.search || "").trim().toLowerCase();
  const type = ui.type || "all";
  const visible = list(campaigns).filter(c => {
    const sharedMatch = !query || [c.workspaceName, c.name, c.brand, c.productName].some(v => String(v || '').toLowerCase().includes(query));
    return campaignWorkspaceMembers(c).some(member => (sharedMatch || [member.name, member.type].some(v => String(v || '').toLowerCase().includes(query)))
      && (type === 'all' || (type === 'other' ? !['paid', 'seeding'].includes(code(member.type)) : code(member.type) === type))
      && (!ui.activity || ui.activity === 'all' || campaignActivity(member) === ui.activity));
  });
  return `<div class="ops-workspace" data-ops-view="directory">${header("Campaigns", "Campaign details, creator progress, and the work that comes next.", canCreate ? button("Create campaign", "create-campaign", { primary: true }) : "")}${demoNotice(demo)}
    <div class="ops-toolbar">${search("Search campaigns", "directory-search", ui.search, "Name, brand, or product")}${select("Campaign type", "directory-type", [["all", "All types"], ["paid", "Paid"], ["seeding", "Seeding"], ["other", "Other"]], type)}${select("Activity", "directory-activity", [["all", "All campaigns"], ["active", "Active"], ["inactive", "Inactive"]], ui.activity || "all")}</div>
    ${errorNotice(error)}${loading ? '<p role="status">Loading campaigns…</p>' : ""}
    ${visible.length ? `<div class="ops-table-wrap"><table class="ops-table"><caption class="sr-only">Campaign directory</caption><thead><tr><th scope="col">Campaign</th><th scope="col">Brand / product</th><th scope="col">Types</th><th scope="col">Activity</th><th scope="col">Dates</th><th scope="col">Budget</th><th scope="col">Manager</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead><tbody>${visible.map(c => {
      const members = campaignWorkspaceMembers(c), grouped = members.length > 1;
      const states = new Set(members.map(campaignActivity));
      return `<tr data-ops-row${scope(c.id)}><th scope="row"><button type="button" class="ops-name-link" data-ops-action="open-campaign"${scope(c.id)} data-no-translate>${text(c.workspaceName || c.name, 'Campaign name not recorded')}</button><small ${!recorded(c.category)||['Skin Care','Hair Care','Makeup','Body Care','Fragrance','Wellness','Lifestyle'].includes(campaignCategoryLabel(c.category))?'data-i18n':'data-no-translate'}>${text(campaignCategoryLabel(c.category), 'Category not recorded')}</small></th><td>${text(c.brand)}<small>${text(c.productName)}</small></td><td>${workspaceTypeLinks(c)}</td><td>${grouped && states.size > 1 ? '<span data-i18n>By type</span>' : activity(members[0] || c)}</td><td data-i18n>${grouped ? 'By type' : `${dateText(c.startDate)}<small><span data-i18n>to</span> ${dateText(c.endDate)}</small>`}</td><td data-i18n>${grouped ? 'By type' : money(c.budget, c.currency)}</td><td>${grouped ? '<span data-i18n>By type</span>' : recorded(c.ownerName) ? `<span data-no-translate>${text(c.ownerName)}</span>` : '<span data-i18n>Not assigned</span>'}</td><td class="ops-directory-actions">${c.canEdit === true ? `<div class="ops-actions">${button('Edit', 'edit-campaign', {campaignId: c.id})}${button('Delete', 'delete-campaign', {campaignId: c.id})}</div>` : '<span class="ops-muted">View only</span>'}</td></tr>`;
    }).join('')}</tbody></table></div>` : !loading ? empty(error ? 'Campaigns unavailable' : 'No campaigns match this view', error ? 'Try loading the campaign directory again.' : 'Clear a filter or create a campaign to begin.', error ? button('Retry', 'reload-directory') : canCreate ? button('Create campaign', 'create-campaign', {primary: true}) : '') : ''}
    ${hasMore ? `<button type="button" class="button button--secondary ops-load-more" data-ops-action="load-more-campaigns"${loading ? " disabled" : ""}>${loading ? "Loading…" : "Load more campaigns"}</button>` : ""}</div>`;
}

export function renderManagerPhasePie(value) {
  const current = phaseNumber(value);
  const point = (radius, angle) => [100 + radius * Math.cos(angle * Math.PI / 180), 100 + radius * Math.sin(angle * Math.PI / 180)].map(v => v.toFixed(3)).join(" ");
  const angles = id => [-90 + (id - 1) * 72 + 1, -90 + id * 72 - 1];
  const segment = id => {
    const [start, end] = angles(id);
    return `M ${point(82, start)} A 82 82 0 0 1 ${point(82, end)} L ${point(43, end)} A 43 43 0 0 0 ${point(43, start)} Z`;
  };
  const label = current ? `Manager phase ${current}: ${phaseName(current)}` : "Manager phase not assigned";
  const segments = MANAGER_PHASES.map(p => {
    const state = !current ? "unassigned" : p.id < current ? "completed" : p.id === current ? "current" : "upcoming";
    const [x, y] = point(63, -90 + (p.id - .5) * 72).split(" ");
    const mark = state === "completed"
      ? `<path class="ops-pie-check" d="m -5 0 3.5 3.5 7-7" transform="translate(${x} ${y})" />`
      : `<text class="ops-pie-step-number" x="${x}" y="${y}" dy=".35em" text-anchor="middle">${p.id}</text>`;
    return `<g aria-hidden="true"><path class="ops-pie-segment${p.id === current ? " is-current" : ""}" data-ops-pie-phase="${p.id}" data-phase-state="${state}" d="${segment(p.id)}" /><g class="ops-pie-mark${p.id === current ? " is-current" : ""}">${mark}</g></g>`;
  }).join("");
  const [start, end] = current ? angles(current) : [];
  const selection = current ? `<path class="ops-pie-selection" d="M ${point(88, start)} A 88 88 0 0 1 ${point(88, end)}" aria-hidden="true" />` : "";
  const description = current ? `Phase ${current} is current. Checkmarks indicate earlier phases; numbered pale segments indicate upcoming phases. This is a manager-assigned phase, not a score or percentage.` : "No manager phase has been assigned. No phases are marked complete.";
  return `<figure class="ops-phase-figure" data-i18n><svg class="ops-phase-pie" viewBox="0 0 200 200" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title><desc>${description}</desc>${segments}${selection}<g aria-hidden="true" text-anchor="middle"><text class="ops-pie-label" x="100" y="88">Phase</text><text class="ops-pie-number" x="100" y="122">${current || "—"}</text></g></svg><figcaption>${esc(label)}</figcaption>${current ? '<div class="ops-phase-legend" aria-hidden="true"><span><span class="ops-legend-check">✓</span> Completed</span><span><span class="ops-legend-current"></span> Current</span><span><span class="ops-legend-upcoming">#</span> Upcoming</span></div>' : ""}</figure>`;
}

function phaseBadge(value) {
  const phase = phaseNumber(value);
  return `<span class="ops-phase-label">${phase ? `Phase ${phase}` : "Unassigned"}</span>`;
}

function paymentBadge(assignment) {
  if (assignment.finance?.status === "paid") return tag("Paid", "paid");
  if (["pending", "ready"].includes(assignment.finance?.status)) return tag("Unpaid", "unpaid");
  return tag("Payment not recorded");
}

function socialLink(assignment) {
  const url = safeSocialLink(assignment.creatorProfileUrl) || list(assignment.accounts).map(a => safeSocialLink(a.url)).find(Boolean);
  return url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${text(assignment.creatorHandle, "Open social profile")} ↗</a>` : `<span>${text(assignment.creatorHandle, "Profile link not recorded")}</span>`;
}

const iconButton=(name,label,action,args,disabled=false)=>`<button type="button" class="ops-icon-button" aria-label="${esc(label)}" title="${esc(label)}" data-ops-action="${action}"${scope(args.campaignId,args.assignmentId)}${disabled?' disabled':''}>${icon(name)}</button>`;
function creatorMenu(kind,label,items,campaign,assignment,disabled=false){
  const id=`ops-${kind}-${campaign.id}-${assignment.id}`;
  return `<span class="ops-creator-menu"><button type="button" class="ops-icon-button" data-ops-menu-target="${esc(id)}" popovertarget="${esc(id)}" aria-label="${esc(label)}" title="${esc(label)}"${disabled?' disabled':''}>${icon(kind==='requests'?'plane':'more')}</button><div id="${esc(id)}" class="ops-creator-popover" popover="auto" role="group" aria-label="${esc(label)}">${items}</div></span>`;
}
function assignmentActions(campaign, assignment, permissions,ui={}) {
  if (!bound(campaign, assignment)) return '<p class="ops-note" data-i18n>Campaign assignment unavailable. Reload before editing.</p>';
  const args = { campaignId: campaign.id, assignmentId: assignment.id };
  const busy=ui.phaseSaves?.[assignment.id]?.saving===true,name=creatorName(assignment);
  const financeAction=assignment.finance?.referred===true
    ? (allowed(permissions,assignment,'canEdit')||allowed(permissions,assignment,'canFinance')?button(`In finances · ${assignment.finance?.status==='paid'?'View':'Edit'} payment`,'edit-finance',args):'')
    : (allowed(permissions,assignment,'canEdit')?button('Send to finances','refer-finance',args):'');
  const requests=financeAction+(allowed(permissions,assignment,'canShip')&&assignment.shipment?.requested!==true?button('Send to shipment','request-shipment',args):'');
  const more=button('Progress overview','select-assignment',args)+button('Creator profile','open-creator',{...args,creatorId:assignment.creatorProfileId||assignment.creatorId})+(allowed(permissions,assignment,'canEdit')?button('Send to contract editor','send-to-contract-editor',args)+button('Remove from campaign','remove-creator',args):'');
  if(ui.compactCard){
    const items=(allowed(permissions,assignment,'canEdit')?button('Edit assignment','edit-assignment',args):'')+requests+more;
    return creatorMenu('more',`Actions for ${name}`,items,campaign,assignment,busy).replace('class="ops-icon-button"','class="ops-icon-button ops-card-actions-button"').replace(icon('more'),`<span>Actions</span>${icon('more')}`);
  }
  return `<span class="ops-row-icons">${allowed(permissions,assignment,'canEdit')?iconButton('pencil',`Edit assignment for ${name}`,'edit-assignment',args,busy):''}${requests?creatorMenu('requests',`Requests for ${name}`,requests,campaign,assignment,busy):''}${creatorMenu('more',`More options for ${name}`,more,campaign,assignment,busy)}</span>`;
}

function phaseSaveNotice(campaign,assignment,ui){
  const state=ui.phaseSaves?.[assignment.id];
  if(state?.saving)return '<small role="status">Saving phase…</small>';
  return state?.error?`<small class="ops-phase-error" role="alert">${esc(state.error)}</small>${button(state.canRetry?'Retry phase':'Reload creator',state.canRetry?'retry-inline-phase':'reload-inline-phase',{campaignId:campaign.id,assignmentId:assignment.id})}`:'';
}
function phaseControl(campaign,assignment,permissions,ui,compact=false){
  const state=ui.phaseSaves?.[assignment.id];
  if(!bound(campaign,assignment)||!allowed(permissions,assignment,'canEdit'))return phaseBadge(assignment.phase);
  return `<select class="ops-inline-phase ops-phase-step--${phaseNumber(assignment.phase)||1}" data-ops-field="inline-phase"${scope(campaign.id,assignment.id)} aria-label="Manager phase for ${esc(creatorName(assignment))}"${state?.saving||state?.error?' disabled':''}>${assignment.phase?'':'<option value="" selected disabled>Choose phase</option>'}${MANAGER_PHASES.map(p=>option(p.id,compact?`${p.id} · ${["Intake","Negotiation","Shipping","Content","Payment"][p.id-1]}`:`Phase ${p.id} · ${p.label}`,assignment.phase)).join('')}</select>${phaseSaveNotice(campaign,assignment,ui)}`;
}
function paymentText(assignment){
  const status=assignment.finance?.status,label=status==='paid'?'Paid':['pending','ready'].includes(status)?'Unpaid':'Payment not recorded';
  return `<span class="ops-payment-text" data-i18n data-i18n-context="payment-status">${label}</span>`;
}
function rosterSavedStatus(campaign, assignment) {
  const engagement = ({paid: 'Paid', seeding: 'Seeding', hybrid: 'Paid and product', unknown: 'Not yet agreed'})[code(assignment.engagementType)] || 'Engagement not recorded';
  // Document review and shipment records do not establish signing or creator receipt.
  const contract = ({missing: 'Contract document missing', pending: 'Contract document pending review', approved: 'Contract document approved', rejected: 'Contract document rejected'})[assignment.finance?.contractStatus];
  const shipment = assignment.shipment?.requested === true ? 'Shipment requested' : null;
  const detail = code(campaign.type) === 'seeding' ? shipment : contract;
  return `<span data-i18n data-i18n-context="campaign-type">${esc(engagement)}</span>${detail ? `<small data-i18n>${esc(detail)}</small>` : ''}`;
}

function renderRosterList(campaign, assignments, permissions, ui, filter, monitor) {
  const statusLabel = code(campaign.type) === 'seeding' ? 'Seeding status' : code(campaign.type) === 'paid' ? 'Agreement' : 'Collaboration status';
  return `<div class="ops-table-wrap ops-workspace-list"><table class="ops-table ops-roster-table"><caption class="sr-only">Campaign creator roster</caption><thead><tr><th scope="col" class="ops-sticky">Creator</th><th scope="col">${statusLabel}</th><th scope="col">Next step</th></tr></thead><tbody>${assignments.map(a => {
    const progress = creatorProgressSummary(a, monitor,Date.now(),ui.locale);
    return `<tr class="${filter && a.phase === filter ? 'is-highlighted' : ''}"${scope(campaign.id, a.id)} data-ops-context="creator"><th scope="row" class="ops-sticky ops-roster-identity">${rosterSelectionControl({campaign, assignment: a, permissions, selected: list(ui.selectedCreatorIds).includes(a.creatorId), creatorName: creatorName(a)})}<div class="ops-creator-line"><button type="button" class="ops-name-link" data-ops-action="select-assignment"${scope(campaign.id, a.id)} title="Show progress for ${esc(creatorName(a))}">${esc(creatorName(a))}</button>${assignmentActions(campaign, a, permissions, ui)}</div><small>${socialLink(a)}</small></th><td class="ops-roster-status">${rosterSavedStatus(campaign, a)}<div class="ops-list-fee"><small><span data-i18n>Recorded fee</span> ${money(a.feeAmount, a.feeCurrency)}</small>${paymentText(a)}${a.recordedFeeAuthority === 'imported_unverified' ? '<small data-i18n>Imported fee needs review</small>' : ''}</div><div class="ops-list-controls">${phaseControl(campaign, a, permissions, ui, true)}</div></td><td class="ops-roster-next"><p data-i18n>${esc(progress.nextStep)}</p>${progress.managerNote ? `<small data-no-translate>${esc(progress.text)}</small>` : ''}${progress.pending ? '<small class="ops-review-cue" data-i18n>A creator reply is awaiting manager review.</small>' : ''}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}
export function renderConfirmedCampaignPosts(campaign, assignment, profile) {
  if (!bound(campaign, assignment) || ![4, 5].includes(phaseNumber(assignment.phase))) return "";
  // profile.posts comes from the staff-verified post-attribution query.
  // Portfolio/source-only links are deliberately excluded.
  const seen = new Set();
  const posts = list(profile?.posts).filter(post => {
    const url = safeSocialLink(post.url);
    if (post.assignment_id !== assignment.id || post.verified === false || !url || !post.published_at || !Number.isFinite(Date.parse(post.published_at)) || Date.parse(post.published_at) > Date.now() || seen.has(url)) return false;
    seen.add(url);
    return true;
  });
  if (!posts.length) return "";
  return `<section class="ops-confirmed-posts" aria-label="Confirmed campaign posts"><h3>Confirmed campaign posts</h3><div class="ops-confirmed-post-grid">${posts.map(post => `<article>${postTile(post)}<p>${platformName(post.platform)} · ${dateText(post.published_at)}</p></article>`).join("")}</div></section>`;
}

export function renderExecutiveOverview(campaign,assignment,creators,operations,locale='en'){
  const profile=list(creators).find(c=>c.id===(assignment.creatorProfileId||assignment.creatorId));
  const name=creatorDisplayLabel(profile||assignment),handle=assignment.creatorHandle||profile?.accounts?.find(a=>a.handle)?.handle;
  const photo=assignment.creatorProfileState==='unavailable'?null:safeProfilePhoto(profile?.photoDataUrl);
  const initials=(name.match(/[A-Za-z0-9]/g)||[]).slice(0,2).join('').toUpperCase()||'CR';
  const progress=creatorProgressSummary(assignment,operations.monitor,Date.now(),locale);
  const conversationLinks=list(assignment.progressContext?.communications).filter(c=>c.status==='verified'&&c.campaignId===campaign.id&&c.assignmentId===assignment.id&&c.creatorId===assignment.creatorId);
  const recordedNextStep=assignment.progressContext?.state==='ready'&&!progress.pending&&conversationLinks.some(t=>t.nextAction===progress.nextStep);
  const conversationButtons=conversationLinks.map(c=>conversationButton(campaign,assignment.id,c.href,assignment.canEdit)).join('');
  return `<div class="drawer-backdrop" data-ops-action="close-editor"></div><aside class="drawer ops-editor ops-progress-drawer" role="dialog" aria-modal="true" aria-labelledby="progress-overview-title"><header class="drawer-header"><div><small data-i18n>Progress overview</small><h2 id="progress-overview-title" data-no-translate>${esc(name)}</h2>${handle?'<span class="ops-selected-handle">'+esc(handle)+'</span>':''}</div><button type="button" class="icon-button" data-ops-action="close-editor" aria-label="Close progress overview">${icon('close')}</button></header><div class="drawer-body"><div class="ops-progress-chart">${renderManagerPhasePie(assignment.phase)}</div><div class="ops-progress-summary"><h3 data-i18n>Summary</h3><p ${progress.managerNote?'data-no-translate':'data-i18n'}>${esc(progress.text)}</p>${progress.pending&&progress.managerNote?'<p class="ops-review-cue">A creator reply is awaiting manager review.</p>':''}<h3 data-i18n>Next step</h3><p ${recordedNextStep?'data-no-translate':'data-i18n'}>${esc(progress.nextStep)}</p>${progress.originalText?'<details><summary data-i18n>Original manager note</summary><p data-no-translate>'+esc(progress.originalText)+'</p></details>':''}${progress.originalNextStep?'<details><summary data-i18n>Original next action</summary><p data-no-translate>'+esc(progress.originalNextStep)+'</p></details>':''}${conversationButtons?'<div class="ops-actions">'+conversationButtons+'</div>':''}${renderConfirmedCampaignPosts(campaign,assignment,profile)}</div></div></aside>`;
}

function conversationButton(campaign,assignmentId,source,canEdit){
  const thread=gmailThreadId(source);
  return thread&&assignmentId&&(campaign.canEdit===true||canEdit===true)?`<button type="button" class="button button--secondary" data-ops-action="view-conversation"${scope(campaign.id,assignmentId)} data-thread-id="${esc(thread)}">View conversation</button>`:'';
}

function postTile(post) {
  const url = safeSocialLink(post.url);
  if (!url) return "";
  const thumbnail = postThumbnail(post);
  return `<a class="cl-post-preview" href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(post.campaign_name || post.campaignName || "creator")} ${platformName(post.platform)} post"><span class="cl-preview-fallback"><b aria-hidden="true">${platformMark(post.platform)}</b><span>Open ${platformName(post.platform)} post</span><small>Preview unavailable</small></span>${thumbnail ? `<img src="${esc(thumbnail)}" alt="" loading="lazy" referrerpolicy="no-referrer" />` : ""}<span class="cl-post-platform" aria-hidden="true">${platformMark(post.platform)}</span></a>`;
}

function rosterSelectionControl({ campaign, assignment, permissions, selected, creatorName }) {
  const disabled = !bound(campaign, assignment) || !allowed(permissions, assignment, "canEdit");
  const attributes = `data-ops-field="roster-selection" value="${esc(assignment.creatorId)}"${scope(campaign.id, assignment.id)}${selected ? " checked" : ""}${disabled ? " disabled" : ""}`;
  const label = `Select ${creatorName} for outreach`;
  const control = globalThis.customElements?.get("md-checkbox")
    ? `<md-checkbox touch-target="wrapper" aria-label="${esc(label)}" ${attributes}></md-checkbox>`
    : `<input type="checkbox" aria-label="${esc(label)}" ${attributes} />`;
  return `<label class="ops-select-creator">${control}<span>Select for outreach</span></label>`;
}

function creatorCard(campaign, assignment, creator, ui, permissions) {
  const current = phaseNumber(assignment.phase);
  const selectedFilter = phaseNumber(Number(ui.phase));
  const dim = Boolean(selectedFilter && current !== selectedFilter);
  const name = creatorDisplayLabel(creator||assignment);
  const args = { campaignId: campaign.id, assignmentId: assignment.id };
  const canChangePhase = bound(campaign, assignment) && allowed(permissions, assignment, "canEdit") && !ui.phaseSaves?.[assignment.id]?.saving && !ui.phaseSaves?.[assignment.id]?.error;
  const profile = { ...assignment, ...creator, id: assignment.creatorId, displayName: name,
    accounts: list(creator?.accounts?.length ? creator.accounts : assignment.accounts),
    posts: list(creator?.posts?.length ? creator.posts : assignment.posts),
    portfolioPosts: list(creator?.portfolioPosts?.length ? creator.portfolioPosts : assignment.portfolioPosts) };
  const selection = rosterSelectionControl({ campaign, assignment, permissions, selected: list(ui.selectedCreatorIds).includes(assignment.creatorId), creatorName: name });
  const heading = `<div class="ops-card-name-line"><button type="button" class="cl-name" data-ops-action="select-assignment"${scope(campaign.id, assignment.id)} title="Show executive overview for ${esc(name)}"><strong>${esc(name)}</strong><small>${text(assignment.creatorHandle || creator?.accounts?.[0]?.handle, "Handle not recorded")}</small></button>${assignmentActions(campaign,assignment,permissions,ui)}</div>`;
  const footer = `<div class="ops-card-workflow"><div class="ops-card-phase-control">${phaseControl(campaign,assignment,permissions,ui,true)}</div>${assignmentActions(campaign,assignment,permissions,{...ui,compactCard:true})}</div><div class="ops-card-summary"><span>${text(({paid:"Paid",seeding:"Seeding",hybrid:"Paid and product",other:"Other"})[assignment.engagementType || campaign.type])}${recorded(assignment.feeAmount)?' · '+money(assignment.feeAmount,assignment.feeCurrency):''}</span>${['paid','pending','ready'].includes(assignment.finance?.status)?paymentText(assignment):''}</div>${assignment.recordedFeeAuthority==='imported_unverified'?'<small>Imported fee needs review</small>':''}${assignmentSourceContext(assignment)}`;
  const cleanHeading = `<button type="button" class="cl-name" data-ops-action="select-assignment"${scope(campaign.id,assignment.id)} title="Show progress for ${esc(name)}"><strong>${esc(name)}</strong>${assignment.creatorHandle||creator?.accounts?.[0]?.handle?'<small>'+esc(assignment.creatorHandle||creator.accounts[0].handle)+'</small>':''}</button>`;
  return `<article class="cl-card ops-card ops-card--clean${selectedFilter && current===selectedFilter?' is-highlighted':dim?' is-dimmed':''} cl-portfolio-card"${scope(campaign.id,assignment.id)} data-ops-context="creator" data-ops-phase="${current||'unknown'}">${assignment.creatorProfileState==='unavailable'?`<div class="ops-card-identity">${cleanHeading}${selection}</div><p class="ops-note" role="status">Creator profile unavailable. Reload the campaign to retry.</p>${footer}`:renderCreatorCardContent(profile,{}, {selection,heading:cleanHeading,footer,compact:true,hideVideos:true})}</article>`;

}

function assignmentSourceContext(assignment) {
  if (assignment.sourceDetails?.evidence?.some(e => e.type === 'operational_email_fact' || e.providerThreadId)) return '';
  const evidence = assignment.recordedEvidence;
  if (evidence?.assignmentId === assignment.id && evidence.campaignId === assignment.campaignId && evidence.creatorId === assignment.creatorId) return renderCampaignEvidence(evidence);
  const source = assignment.sourceDetails;
  if (!source || typeof source !== 'object') return '';
  const labels = { source_status:'Source status', source_reported_payment_status:'Source payment report', source_deliverable_summary:'Source deliverables', source_due_date:'Source content due', source_payment_due_date:'Source payment due', source_deadline_rule:'Source deadline rule', source_owner_label:'Source manager' };
  const fields = Object.entries(labels).filter(([key]) => recorded(source[key]));
  const fee = Number.isFinite(Number(source.source_fee_amount)) && recorded(source.source_fee_amount) ? `<p>${source.source_fee_scope === 'multi_creator' ? 'Shared source package' : 'Source fee'}: ${money(source.source_fee_amount,source.source_fee_currency)}${source.source_fee_scope === 'multi_creator' ? ' · individual allocation not recorded' : ''}</p>` : '';
  const url = safeOperationsLink(source.source_url);
  return `<details class="assignment-source-details"><summary>Spreadsheet details</summary>${fields.map(([key,label])=>`<p><strong>${esc(label)}:</strong> ${esc(String(source[key]).replaceAll('_',' '))}</p>`).join('')}${fee}${url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">View spreadsheet row ↗</a>`:''}<p class="ops-note" data-i18n>Imported source values do not confirm payment, receipt, approval, or completion.</p></details>`;
}

const AUTOMATION_STATUSES = Object.freeze({paused:'Paused',running:'Running',needs_configuration:'Needs configuration',awaiting_approval:'Awaiting approval',partial:'Partial',failed:'Failed'});
const automationCount = value => Number.isSafeInteger(value) && value >= 0 ? String(value) : 'Unavailable';
function automationStatus(value) { return AUTOMATION_STATUSES[value] || 'Status unavailable'; }
function automationTime(value,timeZone) {
  if(typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(Date.parse(value)))return 'Not confirmed';
  try{return displayDateTime(value,timeZone||'UTC',undefined,true);}
  catch{return 'Not confirmed';}
}
function automationEditable(campaign,automation,permissions) {
  return !!campaign.id && allowed(permissions,campaign,'canEdit') && automation?.canEdit === true && Number.isSafeInteger(automation.revision) && automation.revision >= 0;
}
function verifiedMailbox(mailbox) { return mailbox?.verified === true && typeof mailbox.email === 'string' && mailbox.email.trim() && mailbox.bindingId; }
export function renderOperationsAutomation({campaign={},automation=null,permissions={},demo=false}={}) {
  const a=automation||{},status=a.status,canEdit=automationEditable(campaign,a,permissions);
  const pending=Number.isSafeInteger(a.pendingReviewCount)&&a.pendingReviewCount>0;
  const channels=[['email','Email reply checks'],['shipments','Shipment checks']];
  return `<section class="ops-automation" aria-label="Campaign automation"${scope(campaign.id)}><div class="ops-section-heading"><div><h2 data-i18n>Automation</h2></div><div class="ops-actions"><span data-i18n class="ops-automation-status ops-automation-status--${AUTOMATION_STATUSES[status]?status:'unknown'}">${esc(automationStatus(status))}</span>${canEdit?button('Configure automation','edit-automation',{campaignId:campaign.id}):'<span class="ops-muted">View only</span>'}</div></div>
    ${a.pilotPaused===true?'<p class="ops-notice" data-i18n>Paused until activation is approved.</p>':''}
    <dl class="ops-automation-summary"><div><dt data-i18n>Linked mailbox</dt><dd>${verifiedMailbox(a.mailbox)?esc(a.mailbox.email):'<span data-i18n>No verified mailbox linked</span>'}${verifiedMailbox(a.mailbox)&&recorded(a.mailbox.managerName)?`<small>Manager: ${esc(a.mailbox.managerName)}</small>`:''}</dd></div><div><dt data-i18n>Enrolled creators</dt><dd>${automationCount(a.enrolledCreatorCount)}</dd></div><div><dt data-i18n>Pending review</dt><dd>${automationCount(a.pendingReviewCount)}${pending?` ${button('Review items','automation-review',{campaignId:campaign.id})}`:''}</dd></div></dl>
    <div class="ops-automation-channels">${channels.map(([key,label])=>{
      const channel=a[key]||{},channelStatus=channel.status;
      const next=channel.enabled===false||['paused','needs_configuration'].includes(channelStatus)?'Not scheduled':channel.enabled===true?automationTime(channel.nextCheckAt,channel.timeZone):'Not confirmed';
      const reason=channelStatus==='paused'?(a.pilotPaused===true?'Activation pending.':channel.enabled===false?'Checks are off.':'Review settings to resume checks.'):channelStatus==='needs_configuration'?'Finish setup to start checks.':channelStatus==='awaiting_approval'?'Review pending items to continue.':channelStatus==='failed'?'The latest check failed. Review the issue below.':channelStatus==='partial'?'Some sources could not be checked. Review the issue below.':'';
      return `<section class="ops-automation-channel"><div class="ops-section-heading"><h3 data-i18n>${label}</h3><div class="ops-automation-current"><span data-i18n>Current state</span><span data-i18n class="ops-automation-status ops-automation-status--${AUTOMATION_STATUSES[channelStatus]?channelStatus:'unknown'}">${esc(automationStatus(channelStatus))}</span></div></div>${reason?`<p class="ops-automation-reason" data-i18n>${esc(reason)}</p>`:''}<dl class="ops-facts"><div><dt data-i18n>Saved setting</dt><dd data-i18n>${channel.enabled===true?'On':channel.enabled===false?'Off':'Unavailable'}${a.pilotPaused===true&&channel.enabled===true?'<small>Requested after pilot activation</small>':''}</dd></div><div><dt data-i18n>Schedule</dt><dd data-i18n>${text(channel.scheduleLabel,'Schedule unavailable')}${recorded(channel.timeZone)?`<small>${text(channel.timeZone==='America/Los_Angeles'?'Pacific time':channel.timeZone)}</small>`:''}</dd></div><div><dt data-i18n>Last successful check</dt><dd data-i18n>${esc(automationTime(channel.lastSuccessAt,channel.timeZone))}</dd></div><div><dt data-i18n>Next check</dt><dd data-i18n>${esc(next)}</dd></div></dl></section>`;
    }).join('')}</div>
    ${list(a.configurationIssues).length?`<ul class="ops-automation-issues">${a.configurationIssues.filter(issue=>typeof issue==='string').map(issue=>`<li data-i18n>${esc(issue)}</li>`).join('')}</ul>`:''}
    <p class="ops-note" data-i18n>Review and approve each email before sending.</p></section>`;
}

function knowledgeSidebar(campaign, permissions = {}) {
  const resources = list(campaign.resources);
  return `<aside class="ops-sidebar" aria-label="Campaign knowledge"><section class="ops-sidebar-section"><div class="ops-section-heading"><h2 data-i18n>Campaign details</h2>${allowed(permissions, campaign, "canEdit") ? button("Edit", "edit-campaign", { campaignId: campaign.id }) : ""}</div><dl class="ops-facts">${[["Brand", campaign.brand], ["Manager", campaign.ownerName], ["Product", campaign.productName], ["Category", campaignCategoryLabel(campaign.category)], ["Type", ({paid:"Paid",seeding:"Seeding",affiliate:"Affiliate",other:"Other"})[campaign.type]], ["Dates", `${dateText(campaign.startDate)} — ${dateText(campaign.endDate)}`], ["Timezone", campaign.timezone?.replaceAll("_"," ")], ["Budget", money(campaign.budget, campaign.currency)]].map(([label, value]) => `<div><dt data-i18n>${esc(label)}</dt><dd${label==='Type'||(label==='Category'&&['Skin Care','Hair Care','Makeup','Body Care','Fragrance','Wellness','Lifestyle'].includes(value))||!recorded(value)?' data-i18n':''}>${["Dates", "Budget"].includes(label) ? value : text(value)}</dd></div>`).join("")}</dl></section>
    <section class="ops-sidebar-section"><h2 data-i18n>Files &amp; references</h2>${resources.length ? `<ul class="ops-resources">${resources.map(r => { const url = r.fileId&&/^[0-9a-f-]{36}$/i.test(r.fileId)?'/api/campaign-files/'+r.fileId:safeOperationsLink(r.url); return `<li>${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${text(r.name, "Campaign reference")} ↗</a>` : `<span>${text(r.name, "Campaign reference")}</span>`}<small data-i18n>${esc({ brand_kit: "Brand kit", product_deck: "Product deck", other: "Reference" }[r.kind] || "Reference")}${url ? "" : " · Link unavailable"}</small></li>`; }).join("")}</ul>` : '<p class="ops-note" data-i18n>No campaign files linked yet.</p>'}<h3 data-i18n>Email templates</h3><p class="ops-note" data-i18n>Paid: ${campaign.templates?.paid?.subject && campaign.templates?.paid?.body ? "Saved" : "Not added"}<br />Seeding: ${campaign.templates?.seeding?.subject && campaign.templates?.seeding?.body ? "Saved" : "Not added"}</p>${allowed(permissions, campaign, "canEdit") ? button("Edit files & templates", "edit-campaign", { campaignId: campaign.id }) : ""}</section>
    </aside>`;
}

export function replyDate(value,campaign,now=Date.now()){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)||!Number.isFinite(Date.parse(value))||Date.parse(value)>now)return 'Last correspondence date unavailable';
  const days=Math.floor((now-Date.parse(value))/86400000);
  if(days<0)return 'Last correspondence date unavailable';
  const label=days===0?'Today':days===1?'1 day ago':`${days} days ago`;
  return `Last correspondence: <time datetime="${esc(value)}" title="${esc(value)}">${label}</time>`;
}
function replySummary(value){
  const original=String(value||''),match=original.match(/^.*? — (Email interpretation \(\d+% confidence\)|Needs evidence review|Source mismatch|Uncertain interpretation); not staff-confirmed\.\s*/);
  if(!match)return original;
  const cue={'Needs evidence review':'We still need to check the linked conversation. ','Source mismatch':'This conversation may belong to another campaign. ','Uncertain interpretation':'This update still needs checking. '}[match[1]]||'';
  return cue+original.slice(match[0].length);
}
// Summary edits and regenerated action IDs do not represent a new creator reply.
export const replyReviewKey=a=>JSON.stringify([a.assignmentId,gmailThreadId(a.sourceUrl)||a.id,Number.isFinite(Date.parse(a.lastCreatorCorrespondenceAt))?new Date(a.lastCreatorCorrespondenceAt).toISOString():null]);
function attentionList(campaign,actions,assignments=[],{loading=false,error=null,hasMore=false,replyIndex=0,handledReplies=[],locale='en'}={}){
 const candidates=list(actions).filter(a=>(!a.campaignId||a.campaignId===campaign.id)&&a.kind!=='shipment'&&!['resolved','reviewed','dismissed','complete'].includes(a.status)&&!handledReplies.includes(replyReviewKey(a)));
 const revisions=new Map();
 for(const item of candidates){
  const scoped=['review','email_reply'].includes(item.kind)&&gmailThreadId(item.sourceUrl)&&Number.isFinite(Date.parse(item.lastCreatorCorrespondenceAt));
  const key=scoped?replyReviewKey(item):item;
  const prior=revisions.get(key);
  if(!prior||Date.parse(item.createdAt)>Date.parse(prior.createdAt))revisions.set(key,item);
 }
 const open=[...revisions.values()];
 const index=open.length?Math.min(Math.max(0,replyIndex),open.length-1):0,a=open[index];let content='';
 if(a){
 const assignment=list(assignments).find(row=>row.id===a.assignmentId&&row.creatorId===a.creatorId&&row.campaignId===campaign.id);
 const name=[a.creatorDisplayName,assignment?.creatorDisplayName,a.creatorHandle,assignment?.creatorHandle].find(value=>recorded(value)&&! /^(?:IMP[-_]|GS-[A-F0-9]{10,}$)/i.test(value.trim()));
 const localized=replyOverviewText(a,locale),source=safeOperationsLink(a.sourceUrl),summary=replySummary(localized.summary);
 const original=locale==='ko'&&!localized.available?'<details class="ops-review-original" data-no-translate><summary>원문 보기</summary><p lang="en">'+esc(replySummary(a.summary)||'')+'</p><p lang="en">'+text(a.nextStep,'')+'</p></details>':'';
 content=`<div class="ops-review-stage"><article class="ops-review-card" data-review-key="${esc(replyReviewKey(a))}" data-review-assignment="${esc(a.assignmentId)}" tabindex="-1" aria-label="Conversation from ${esc(name||'creator')}"><header><span class="ops-review-avatar" aria-hidden="true">${esc((name||'?').slice(0,1))}</span><div><h3 data-no-translate>${text(name,locale==='ko'?'크리에이터 이름 확인 불가':'Creator name unavailable')}</h3><small>${replyDate(a.lastCreatorCorrespondenceAt,campaign)}</small></div><button type="button" class="ops-review-previous" data-ops-action="previous-review"${scope(campaign.id)} aria-label="Previous reply" title="Previous reply"${index===0?' disabled':''}>${icon('arrow_back')}</button></header><div class="ops-review-summary"><span class="ops-review-label">Summary</span><p data-no-translate>${summary?esc(summary):'Their latest reply needs review.'}</p></div><div class="ops-review-next"><span class="ops-review-label">Next step</span><p data-no-translate>${text(localized.nextStep,'Review the latest conversation before deciding what to do next.')}</p></div>${original}<footer>${button('Review later','next-review',{campaignId:campaign.id})}${conversationButton(campaign,a.assignmentId,source,a.canEdit)||'<small>Conversation unavailable</small>'}</footer></article></div>`;
 }
 return `<section class="ops-attention ops-review-deck" aria-label="Unreviewed replies"${scope(campaign.id)}><header class="ops-section-heading"><h2 data-i18n>Unreviewed replies</h2>${!loading&&!error?'<span class="ops-count">'+open.length+(hasMore?' shown':' to review')+'</span>':''}</header>${loading?'<p role="status">Loading replies…</p>':error?'<p role="alert">Replies are unavailable. Reload the campaign to try again.</p>':content||(hasMore?'<p role="status">No unreviewed replies shown on this page. Load more replies to continue.</p>':'<p role="status">No unreviewed replies.</p>')}${!loading&&!error?`<div class="ops-review-queue-tools">${handledReplies.length?button('Revisit handled cards','reset-reviews',{campaignId:campaign.id}):''}${hasMore?button('Load more replies','load-more-replies',{campaignId:campaign.id}):''}</div>`:''}</section>`;
}

export function renderOperationsAutomations({campaigns=[],directoryLoading=false,directoryError=null,hasMore=false,campaignId='',operations=null,loading=false,error=null,demo=false,replyUI={}}={}) {
  const campaign=operations?.campaign?.id===campaignId?operations.campaign:null;
  const choices=[...new Map(list(campaigns).filter(c=>c?.id).map(c=>[c.id,c])).values()];
  if(campaignId&&!choices.some(c=>c.id===campaignId))choices.push(campaign||{id:campaignId,name:'Selected campaign · details not loaded'});
  const directoryStatus=directoryError?`${errorNotice(directoryError)}${button('Retry campaign list','reload-automation-campaigns',{disabled:directoryLoading})}`:directoryLoading?'<p role="status">Loading campaigns…</p>':'';
  const selector=`<div class="ops-toolbar ops-automations-toolbar">${select('Campaign','automation-campaign',[['','Choose a campaign'],...choices.map(c=>[c.id,c.name||'Campaign name not recorded'])],campaignId)}${hasMore?button(directoryLoading?'Loading campaigns…':'Load more campaigns','load-more-automation-campaigns',{disabled:directoryLoading}):''}</div>`;
  let content='';
  if(campaignId){
    if(error)content=`${errorNotice(error)}${empty('Automation unavailable','The saved settings could not be loaded. Retry this campaign.',button('Retry automation','reload-automation',{campaignId,disabled:loading}))}`;
    else if(loading)content='<p role="status">Loading campaign automation…</p>';
    else if(!campaign)content=empty('Campaign unavailable','Choose a campaign or retry loading its saved automation settings.',button('Retry automation','reload-automation',{campaignId}));
    else {
      const actions=list(operations.actions).filter(action=>!action.campaignId||action.campaignId===campaignId);
      content=`<section class="ops-automations-selected" aria-label="Selected campaign automation"${scope(campaignId)}><div class="ops-section-heading"><h2 data-no-translate>${text(campaign.name,'Campaign name not recorded')}</h2>${button('Open campaign','open-campaign',{campaignId})}</div>${renderOperationsAutomation({campaign,automation:operations.automation,permissions:{canEdit:campaign.canEdit===true},demo})}${attentionList(campaign,actions,operations.assignments,{hasMore:operations.page?.hasMore===true||operations.hasMore===true,...replyUI})}${operations.page?.hasMore||operations.hasMore?'<p class="ops-note" data-i18n>More creators or replies may be available. Open the campaign to view the remaining items.</p>':''}</section>`;
    }
  }else if(!directoryLoading&&!directoryError)content=choices.length?empty('Choose a campaign','Select a campaign to manage its checks.'):empty('No campaigns yet','Create a campaign in Campaigns, then return here to configure its automation.',button('Go to campaigns','all-campaigns'));
  return `<div class="ops-workspace ops-automations-page" data-ops-view="automations">${header('Automations','')}${demoNotice(demo)}${selector}${directoryStatus}${content}</div>`;
}

export function renderOperationsCampaign({ campaign, creators = [], operations = {}, ui = {}, permissions = {}, loading = false, error = null, demo = false, hasMore = false } = {}) {
  if (!campaign?.id) return `<div class="ops-workspace">${empty("Campaign unavailable", "Return to the campaign directory and choose an available campaign.", button("All campaigns", "all-campaigns"))}</div>`;
  const assignments = list(operations.assignments).filter(a => !a.campaignId || a.campaignId === campaign.id);
  const query = String(ui.search || "").trim().toLowerCase();
  const visible = assignments.filter(a => !query || [creatorName(a), a.creatorHandle, a.creatorCode].some(v => String(v || "").toLowerCase().includes(query)));
  const selected = assignments.find(a => a.id === ui.selectedAssignmentId);
  const filter = phaseNumber(Number(ui.phase));
  const initial=ui.phase!=='all'&&!filter;
  const matching = visible.filter(a => !filter || phaseNumber(a.phase) === filter).length;
  const canEdit = allowed(permissions, campaign, "canEdit");
  const cards = ui.rosterMode !== "list";
  const overview = campaign.workspaceAvailable === true && ui.workspaceOverview === true;
  const campaignHeader = `${button('← All campaigns', 'all-campaigns')}${header(campaign.workspaceName || campaign.name || 'Campaign', '', canEdit && !overview ? button('Edit campaign', 'edit-campaign', {campaignId: campaign.id}) + button('Manage creators', 'manage-creators', {campaignId: campaign.id}) + button('Prepare outreach', 'open-outreach', {campaignId: campaign.id, primary: true}) : '', overview ? 'Campaign workspace' : campaign.type || 'Campaign', true)}${demoNotice(demo)}${errorNotice(error)}${workspaceNavigation(campaign, ui, permissions)}`;
  if (overview) return `<div class="ops-workspace" data-ops-view="campaign"${scope(campaign.id)}>${campaignHeader}${workspaceOverview(campaign)}</div>`;
  return `<div class="ops-workspace" data-ops-view="campaign"${scope(campaign.id)}>${campaignHeader}
    <div class="ops-layout"><div class="ops-main">${loading ? '<p role="status">Loading campaign operations…</p>' : ""}${attentionList(campaign,operations.actions,assignments,{loading,error,hasMore:hasMore||operations.page?.hasMore===true||operations.hasMore===true,...ui})}

      <section aria-label="Campaign creators"><div class="ops-section-heading"><h2><span data-i18n>Campaign creators</span> <span class="ops-count">${assignments.length}</span></h2><div class="ops-segmented" role="group" aria-label="Roster display"><button type="button" data-ops-action="roster-mode" data-ops-value="cards" aria-pressed="${cards}">Cards</button><button type="button" data-ops-action="roster-mode" data-ops-value="list" aria-pressed="${!cards}">List</button></div></div>
      <div class="ops-phase-filter" role="group" aria-label="Filter by manager phase">${MANAGER_PHASES.map(p => `<button type="button" class="ops-phase-step ops-phase-step--${p.id}" data-ops-action="filter-phase" data-ops-value="${p.id}"${scope(campaign.id)} aria-pressed="${filter === p.id}"><strong>${p.id}</strong><span data-i18n>${esc(p.label)}</span></button>`).join("")}</div>
      <div class="ops-toolbar ops-roster-toolbar"><button type="button" class="button button--secondary button--small" data-ops-action="filter-phase" data-ops-value="all"${scope(campaign.id)} aria-pressed="${ui.phase === 'all'}">All phases</button>${search("Search creators", "roster-search", ui.search, "Name or social handle")}</div><p class="ops-note ops-roster-summary" role="status" data-i18n>${filter ? `${matching} in phase ${filter}` : `${visible.length} creator${visible.length === 1 ? "" : "s"} shown`}</p>
      ${visible.length ? cards ? `<div class="ops-cards">${visible.map(a => creatorCard(campaign, a, list(creators).find(c => c.id === (a.creatorProfileId || a.creatorId)), ui, permissions)).join("")}</div>` : renderRosterList(campaign,visible,permissions,ui,filter,operations.monitor) : !loading ? empty(assignments.length ? "No creators match this search" : "Add your first creator", assignments.length ? "Try another name or social handle." : "Choose creators from your existing network to build this campaign.", canEdit && !assignments.length ? button("Manage creators", "manage-creators", { campaignId: campaign.id, primary: true }) : "") : ""}</section>
      ${hasMore || operations.hasMore === true ? `<button type="button" class="button button--secondary ops-load-more" data-ops-action="load-more-assignments"${scope(campaign.id)}${loading ? " disabled" : ""}>${loading ? "Loading…" : "Load more creators and replies"}</button>` : ""}
    </div>${knowledgeSidebar(campaign, permissions)}</div></div>`;
}

function filteredRecords(records, query) {
  const term = String(query || "").trim().toLowerCase();
  return list(records).filter(a => !term || [creatorName(a), a.creatorHandle, a.campaignName, a.brand, a.productName].some(v => String(v || "").toLowerCase().includes(term)));
}

function financeDue(finance = {}) { return operationsNet30Date(finance.liveDate); }
function reviewStatus(value) { return ({ missing: "Missing", pending: "Pending review", approved: "Approved", rejected: "Rejected" }[value] || "Not recorded"); }
export function addressText(address) {
  if (typeof address === "string") return address.trim();
  if (!address || typeof address !== "object") return "";
  return [address.line1 || address.addressLine1, address.line2 || address.addressLine2, [address.city, address.region || address.state, address.postalCode].filter(Boolean).join(", "), address.country].filter(Boolean).join("\n");
}

export function renderOperationsFinance(props = {}) { return renderThursdayFinances(props); }

function shipmentCopy(assignment, field, label) {
  if (!recorded(assignment.shipment[field])) return '';
  return `<button type="button" class="ops-icon-button" aria-label="Copy ${esc(label)}" title="Copy ${esc(label)}" data-ops-action="copy-shipment-tracking"${scope(assignment.campaignId, assignment.id)} data-tracking-field="${field}">${icon('copy')}</button>`;
}

function renderOperationsShipmentsBase({ records = [], ui = {}, permissions = {}, loading = false, error = null, demo = false } = {}) {
  const rows = filteredRecords(records, ui.search).filter(a => a.shipment?.requested === true);
  const sort=ui.sort || 'newest';
  rows.sort((a,b)=>{
    const left=Date.parse(a.shipment.requestedAt),right=Date.parse(b.shipment.requestedAt);
    if(!Number.isFinite(left))return Number.isFinite(right)?1:0;
    if(!Number.isFinite(right))return -1;
    return (sort==='oldest'?left-right:right-left)||String(a.id).localeCompare(String(b.id));
  });
  return `<div class="ops-workspace" data-ops-view="shipments">${header("Shipments", "")}${demoNotice(demo)}
    <div class="ops-toolbar">${search("Search shipments", "shipment-search", ui.search, "Creator, campaign, product, or brand")}${select("Sort by date", "shipment-sort", [["newest", "Newest to oldest"], ["oldest", "Oldest to newest"]], sort)}</div>${errorNotice(error)}${loading ? '<p role="status">Loading shipments…</p>' : ""}
    ${rows.length ? `<div class="ops-table-wrap"><table class="ops-table ops-shipment-table"><caption class="sr-only">Creator shipment queue</caption><colgroup><col class="ops-shipment-col-date" /><col class="ops-shipment-col-campaign" /><col class="ops-shipment-col-type" /><col class="ops-shipment-col-pic" /><col class="ops-shipment-col-recipient" /><col class="ops-shipment-col-product" /><col class="ops-shipment-col-box" /><col class="ops-shipment-col-cost" /><col class="ops-shipment-col-tracking" /><col class="ops-shipment-col-tracking-number" /><col class="ops-shipment-col-packing-date" /><col class="ops-shipment-col-notes" /></colgroup><thead><tr><th scope="col" class="ops-sticky">Date / creator</th><th scope="col">Campaign</th><th scope="col">Seeding / paid</th><th scope="col">PIC</th><th scope="col">Recipient / address</th><th scope="col">Product / brand</th><th scope="col">Box size</th><th scope="col">Shipping cost</th><th scope="col">Tracking Original</th><th scope="col">Tracking #</th><th scope="col">Packing date</th><th scope="col">Notes</th></tr></thead><tbody>${rows.map(a => {
      const s=a.shipment,edit=allowed(permissions,a,"canShip");
      const date=Number.isFinite(Date.parse(s.requestedAt))?displayDate(s.requestedAt):'';
      const cost=recorded(s.shippingCost)&&Number.isFinite(Number(s.shippingCost))?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(s.shippingCost)):'';
      const field=(name,value,options={})=>{
        const display=options.display??(options.type==='date'&&recorded(value)?displayDate(value):value);
        if(!edit)return esc(display??'');
        const editorType=options.type||'text',shown=String(display??'').trim()||'—';
        const optionData=editorType==='select'?' data-shipment-options="'+(options.options||[]).map(esc).join('|')+'"':'';
        const attrs=(options.max?' data-shipment-max="'+Number(options.max)+'"':'')+(options.rows?' data-shipment-rows="'+Number(options.rows)+'"':'')+(options.step?' data-shipment-step="'+esc(options.step)+'"':'')+(options.min!==undefined?' data-shipment-min="'+esc(options.min)+'"':'');
        return '<button type="button" class="ops-shipment-cell-trigger" data-ops-action="edit-shipment-cell" data-shipment-key="'+esc(name)+'" data-shipment-editor="'+esc(editorType)+'" data-shipment-label="'+esc(options.label||name)+'" data-shipment-value="'+esc(value??'')+'"'+optionData+attrs+' aria-label="Edit '+esc(options.label||name)+'">'+esc(shown)+'</button>';
      };
      const selectField=(name,value,values,label)=>field(name,value,{type:'select',options:values,label});
      const notes=field('notes',s.notes||'',{label:'Shipment notes',type:'textarea',max:2000,rows:2});
      return `<tr${scope(a.campaignId,a.id)}><td class="ops-sticky ops-shipment-date">${date?`<time datetime="${esc(s.requestedAt)}">${esc(date)}</time>`:'' }<small class="ops-shipment-creator-link">${socialLink(a)}</small></td><th scope="row">${text(a.campaignName,"Campaign name not recorded")}</th><td>${selectField('shipmentType',s.shipmentType||(['paid','seeding'].includes(a.engagementType)?a.engagementType:''),['seeding','paid'],'Seeding or paid')}</td><td>${selectField('pic',s.pic,['Alex Sample','Blair Sample','Casey Sample','Drew Sample','Ellis Sample'],'PIC')}</td><td class="ops-address-cell">${edit?`${field('fullName',s.fullName,{label:'Recipient name'})}${field('address',addressText(s.address),{label:'Shipping address',type:'textarea',max:1200,rows:3})}`:`${recorded(s.fullName) ? `<span data-no-translate>${text(s.fullName)}</span>` : '<span data-i18n>Recipient name missing</span>'}<small>${addressText(s.address)?esc(addressText(s.address)):"<span data-i18n>Address missing</span>"}</small>`}</td><td>${field('productName',s.productName||a.productName,{label:'Product'})}${field('brand',s.brand||a.brand,{label:'Brand'})}</td><td class="ops-shipment-package">${field('boxSize',s.boxSize,{label:'Box size',max:80})}</td><td class="ops-shipment-cost">${field('shippingCost',s.shippingCost??'',{label:'Shipping cost',type:'number',step:'0.01',min:'0',display:cost})}</td><td>${field('trackingOriginal',s.trackingOriginal,{label:'Tracking Original',max:120})}${shipmentCopy(a,'trackingOriginal','Tracking Original')}</td><td>${field('trackingNumber',s.trackingNumber,{label:'Tracking number',max:120})}${shipmentCopy(a,'trackingNumber','Tracking #')}</td><td class="ops-shipment-date">${field('packingDate',s.packingDate,{label:'Packing date',type:'date'})}</td><td>${notes}</td></tr>`;
    }).join('')}</tbody></table></div>` : !loading ? empty(error?"Shipments unavailable":"No shipments in this view","",error?button("Retry","reload-shipments"):""):""}</div>`;
}


function renderShipmentDraftRow(draft,assignments) {
  const assignment=assignments.find(item=>item.id===draft.assignmentId),value=draft.values||{},editing=!!assignment;
  const selectCell=(name,current,values,label)=>`<select class="ops-shipment-cell-input" data-ops-field="shipment-draft-input" data-shipment-key="${name}" aria-label="${label}"${draft.saving?' disabled':''}><option value="">—</option>${values.map(item=>`<option value="${esc(item)}"${item===current?' selected':''}>${esc(item)}</option>`).join('')}</select>`;
  const inputCell=(name,current,label,{type='text',max=200,step,min}={})=>`<input class="ops-shipment-cell-input" data-ops-field="shipment-draft-input" data-shipment-key="${name}" aria-label="${label}" type="${type}" value="${esc(current??'')}" maxlength="${max}"${step?` step="${step}"`:''}${min!==undefined?` min="${min}"`:''}${type==='date'?' data-date-picker="true"':''}${draft.saving?' disabled':''} />`;
  const areaCell=(name,current,label,{max=1200,rows=3}={})=>`<textarea class="ops-shipment-cell-input${name==='notes'?' ops-shipment-notes':''}" data-ops-field="shipment-draft-input" data-shipment-key="${name}" aria-label="${label}" maxlength="${max}" rows="${rows}"${draft.saving?' disabled':''}>${esc(current??'')}</textarea>`;
  const assignmentSelect=`<select class="ops-shipment-cell-input ops-shipment-assignment-select" data-ops-field="shipment-draft-assignment" aria-label="Choose campaign and creator link"${draft.saving?' disabled':''}><option value="">Choose campaign · creator link</option>${assignments.filter(item=>item.canShip===true&&item.shipment?.requested!==true).map(item=>`<option value="${esc(item.id)}"${item.id===draft.assignmentId?' selected':''}>${esc(item.campaignName||'Campaign')} · ${esc(item.creatorProfileUrl||item.creatorHandle||'Creator link missing')}</option>`).join('')}</select>`;
  const identity=editing?text(assignment.campaignName,'Campaign name not recorded'):assignmentSelect;
  const shipment=assignment?.shipment||{};
  return `<tr class="ops-shipment-draft" data-shipment-draft><td class="ops-sticky ops-shipment-date"><small>${draft.saving?'Saving…':'New'}</small>${editing?`<small class="ops-shipment-creator-link">${socialLink(assignment)}</small>`:''}</td><th scope="row">${identity}</th><td>${editing?selectCell('shipmentType',value.shipmentType??shipment.shipmentType??(['paid','seeding'].includes(assignment.engagementType)?assignment.engagementType:''),['seeding','paid'],'Seeding or paid'):''}</td><td>${editing?selectCell('pic',value.pic??shipment.pic??'', ['Alex Sample','Blair Sample','Casey Sample','Drew Sample','Ellis Sample'],'PIC'):''}</td><td class="ops-address-cell">${editing?`${inputCell('fullName',value.fullName??shipment.fullName??'','Recipient name')}${areaCell('address',value.address??addressText(shipment.address),'Shipping address')}`:''}</td><td>${editing?`${inputCell('productName',value.productName??shipment.productName??assignment.productName??'','Product')}${inputCell('brand',value.brand??shipment.brand??assignment.brand??'','Brand')}`:''}</td><td class="ops-shipment-package">${editing?inputCell('boxSize',value.boxSize??shipment.boxSize??'','Box size',{max:80}):''}</td><td class="ops-shipment-cost">${editing?inputCell('shippingCost',value.shippingCost??shipment.shippingCost??'','Shipping cost',{type:'number',step:'0.01',min:0}):''}</td><td>${editing?inputCell('trackingOriginal',value.trackingOriginal??shipment.trackingOriginal??'','Tracking Original',{max:120}):''}</td><td>${editing?inputCell('trackingNumber',value.trackingNumber??shipment.trackingNumber??'','Tracking number',{max:120}):''}</td><td class="ops-shipment-date">${editing?inputCell('packingDate',value.packingDate??shipment.packingDate??'','Packing date',{type:'date'}):''}</td><td>${editing?areaCell('notes',value.notes??shipment.notes??'','Shipment notes',{max:2000,rows:2}):''}${draft.error?`<span class="ops-shipment-cell-error" role="alert">${esc(draft.error)}</span>`:'' }<div class="ops-shipment-draft-actions"><button type="button" class="button button--primary" data-ops-action="save-shipment-draft"${!editing||draft.saving?' disabled':''}>${draft.saving?'Saving…':'Save row'}</button><button type="button" class="button button--secondary" data-ops-action="cancel-shipment-draft"${draft.saving?' disabled':''}>Cancel</button></div></td></tr>`;
}

export function renderOperationsShipments(props={}) {
  const {ui={}}=props,assignments=ui.assignmentChoices||[],draft=ui.draft||null;
  let html=renderOperationsShipmentsBase(props);
  const actions=`<div class="ops-shipment-actions"><button type="button" class="button button--secondary" data-ops-action="add-shipment-row"${draft||ui.assignmentChoicesLoading?' disabled':''}>Add shipment</button><button type="button" class="button button--secondary" data-ops-action="open-shipment-import"${ui.assignmentChoicesLoading?' disabled':''}>Import XLSX</button></div>`;
  const panel=renderShipmentImportPanel({state:ui.import,assignments});
  html=html.replace('</header>',`</header>${actions}${panel}${ui.assignmentChoicesLoading?'<p role="status">Loading campaign assignments…</p>':''}${ui.assignmentChoicesError?`<p role="alert">${esc(ui.assignmentChoicesError)} <button type="button" class="text-button" data-ops-action="retry-shipment-assignments">Retry</button></p>`:''}`);
  if(draft){
    const tableRow=renderShipmentDraftRow(draft,assignments);
    if(html.includes('</tbody>'))html=html.replace('</tbody>',`${tableRow}</tbody>`);
    else {
      const table=`<div class="ops-table-wrap"><table class="ops-table ops-shipment-table"><caption class="sr-only">Creator shipment queue</caption><colgroup><col class="ops-shipment-col-date" /><col class="ops-shipment-col-campaign" /><col class="ops-shipment-col-type" /><col class="ops-shipment-col-pic" /><col class="ops-shipment-col-recipient" /><col class="ops-shipment-col-product" /><col class="ops-shipment-col-box" /><col class="ops-shipment-col-cost" /><col class="ops-shipment-col-tracking" /><col class="ops-shipment-col-tracking-number" /><col class="ops-shipment-col-packing-date" /><col class="ops-shipment-col-notes" /></colgroup><thead><tr><th>Date / creator</th><th>Campaign</th><th>Seeding / paid</th><th>PIC</th><th>Recipient / address</th><th>Product / brand</th><th>Box Size</th><th>Shipping Cost</th><th>Tracking Original</th><th>Tracking #</th><th>Packing Date</th><th>Notes</th></tr></thead><tbody>${tableRow}</tbody></table></div>`;
      html=html.replace(/<div class="ops-empty">[\s\S]*?<\/div>/,table);
    }
  }
  const columns=['Date / creator','Campaign','Seeding / paid','PIC','Recipient / address','Product / brand','Box size','Shipping cost','Tracking Original','Tracking #','Packing date','Notes'];
  return html.replace(/<table class="ops-table ops-shipment-table">[\s\S]*?<\/table>/g,table=>table.replace(/<tbody>[\s\S]*?<\/tbody>/g,body=>{
    let column=0;
    return body.replace(/<(td|th)\b/g,tag=>`${tag} data-shipment-column="${columns[column++%columns.length]}"`);
  }));
}

const input = (label, name, value, { type = "text", required = false, readonly = false, disabled = false, wide = false, max = 300, min, step, help = "" } = {}) => `<label${wide ? ' class="ops-wide"' : ""}><span>${esc(label)}${required?' <small class="ops-field-cue">Required</small>':''}</span><input name="${esc(name)}" type="${type}" value="${esc(value ?? "")}"${required ? " required" : ""}${readonly ? " readonly" : ""}${disabled ? " disabled" : ""}${max ? ` maxlength="${max}"` : ""}${min !== undefined ? ` min="${esc(min)}"` : ""}${step !== undefined ? ` step="${esc(step)}"` : ""} />${help ? `<small class="ops-note">${esc(help)}</small>` : ""}</label>`;
const textarea = (label, name, value, { required = false, rows = 4, max = 10000, help = "" } = {}) => `<label class="ops-wide"><span>${esc(label)}${required?' <small class="ops-field-cue">Required</small>':''}</span><textarea name="${esc(name)}" rows="${rows}" maxlength="${max}"${required ? " required" : ""}>${esc(value || "")}</textarea>${help ? `<small class="ops-note">${esc(help)}</small>` : ""}</label>`;
const formSelect = (label, name, values, value, { disabled = false, required = false } = {}) => `<label><span>${esc(label)}${required?' <small class="ops-field-cue">Required</small>':''}</span><select name="${esc(name)}"${disabled ? " disabled" : ""}${required ? " required" : ""}>${options(values, value)}</select></label>`;
const hidden = (name, value) => `<input type="hidden" name="${name}" value="${esc(value ?? "")}" />`;

function campaignManager(campaign, value) {
  const id=Object.hasOwn(value,'ownerId')?value.ownerId:campaign.ownerId;
  const choices=list(campaign.ownerOptions),available=Array.isArray(campaign.ownerOptions);
  const keep=!available||id&&!choices.some(person=>person.id===id)||!id&&recorded(campaign.ownerName)&&!Object.hasOwn(value,'ownerId');
  const selection=keep?'__keep_manager__':id||'';
  return '<label><span>Manager</span><select name="ownerId"'+(!available?' disabled':'')+'>'+(keep?'<option value="__keep_manager__" selected>'+esc(campaign.ownerName||'Current manager')+' · Keep current</option>':'')+'<option value=""'+(selection===''?' selected':'')+'>Not assigned</option>'+choices.map(person=>option(person.id,person.name||'Employee name unavailable',selection)).join('')+'</select>'+(!available?'<small class="ops-note">Employee list unavailable. Reopen the editor to try again.</small>':'')+'</label>';
}

function campaignWorkspaceEditor(campaign, value) {
  if (campaign.workspaceLinkLocked === true || (campaign.workspaceParentId && campaignWorkspaceMembers(campaign).find(m=>m.id===campaign.workspaceParentId)?.canEdit === false)) return '<p class="ops-note" data-i18n>The linked workspace is unavailable. Its connection will be kept.</p>';
  const groupedRoot = !!campaign.id && !campaign.workspaceParentId && campaignWorkspaceMembers(campaign).length > 1;
  if (groupedRoot) return `${hidden('workspaceParentId', '')}<p class="ops-note" data-i18n>This workspace contains other campaign types. Open an individual type to change its workspace.</p>`;
  const selected = Object.hasOwn(value, 'workspaceParentId') ? value.workspaceParentId : campaign.workspaceParentId;
  const available = Array.isArray(campaign.workspaceOptions);
  const choices = list(campaign.workspaceOptions).filter(choice => choice?.id && choice.id !== campaign.id);
  if (!available || selected && !choices.some(choice => choice.id === selected)) {
    return selected ? `${hidden('workspaceParentId', selected)}<p class="ops-note" data-i18n>Workspace choices are unavailable. The current link will be kept. Reopen the editor to change it.</p>` : Object.hasOwn(campaign, 'workspaceParentId') || Object.hasOwn(value, 'workspaceParentId') ? hidden('workspaceParentId', '') : '';
  }
  return `<label><span>Campaign workspace · Optional</span><select name="workspaceParentId">${option('', 'Separate campaign', selected || '')}${choices.map(choice => option(choice.id, choice.name || 'Campaign name not recorded', selected)).join('')}</select>${campaign.workspaceOptionsPartial === true ? '<small class="ops-note" data-i18n>Only loaded workspaces are listed. Existing links are kept.</small>' : ''}</label>`;
}

function campaignEditor(campaign, value) {
  const v = { ...campaign, ...value };
  const type = code(v.type || "paid");
  const resources = list(v.resources).length ? v.resources : [{ id: "", name: "", kind: "other", url: "" }];
  return `<p class="ops-note" data-i18n>Fields marked Required must be completed. Other details can be added later.</p><fieldset><legend data-i18n>Campaign details</legend><div class="ops-fields">${input("Campaign name", "name", v.name, { required: true, max: 200 })}${input("Product name", "productName", v.productName, { required: true, max: 200 })}${input("Brand", "brand", v.brand, { required: true, max: 200 })}${campaignCategory(v.category||"")}${campaignManager(campaign,value)}${formSelect("Campaign type", "type", [["paid", "Paid"], ["seeding", "Seeding"], ["affiliate", "Affiliate"], ["other", "Other"]], type)}${formSelect("Status", "status", [["planning", "Planning"], ["active", "Active"], ["paused", "Paused"], ["closeout", "Closeout"], ["completed", "Completed"], ["cancelled", "Cancelled"], ["archived", "Archived"]], code(v.status || "planning"))}${input("Start date · Optional", "startDate", v.startDate, { type: "date" })}${input("End date · Optional", "endDate", v.endDate, { type: "date" })}${campaignTimezone(v.timezone||"America/Los_Angeles")}<label><span>Budget · Optional</span><input name="budget" type="text" inputmode="decimal" value="${esc(v.budget===null||v.budget===undefined?'':v.budget.toLocaleString('en-US',{maximumFractionDigits:2}))}" maxlength="20"></label>${hidden("currency", v.currency || "USD")}${formSelect("Brand shares marketing costs 50/50?", "fundingMode", [["unconfirmed","Unconfirmed"],["byou_full","No · BYOU pays 100%"],["brand_half","Yes · 50/50 with brand"]], v.fundingMode || "unconfirmed")}</div></fieldset>
    ${campaignWorkspaceEditor(campaign, value)}
    ${campaignFiles(v)}
    ${campaignTemplates({...v,type})}`;
}

function phaseEditor(assignment, value) {
  const v = { ...assignment, ...value };
  if(!Object.hasOwn(value||{},'phaseReason')&&/^Email inference\b/.test(v.phaseReason||''))v.phaseReason='';
  return `${renderManagerPhasePie(assignment.phase)}<div class="ops-fields">${formSelect("Move creator to", "phase", [["", "Choose a phase"], ...MANAGER_PHASES.map(p => [p.id, `${p.id}. ${p.label}`])], v.phase ?? "", { required: true })}${textarea("Reason (optional)", "phaseReason", v.phaseReason, { max: 2000, rows: 3 })}</div><label class="ops-check"><input type="checkbox" name="managerApproved" required${v.managerApproved === true || v.managerApproved === "on" ? " checked" : ""} />I reviewed this creator’s campaign context and approve this phase.</label>`;
}

const assignmentDocumentTypes = [['invoice','Invoice'],['contract','Contract'],['w9','W-9']];
function documentUploads(disabled=false) {
  return assignmentDocumentTypes.map(([type,label])=>`<label class="ops-file-upload"><span>Add ${label} PDF</span><input type="file" data-ops-upload="${type}" accept=".pdf"${disabled?' disabled':''}><small class="ops-note">PDF · up to 5 MB. Uploading does not approve the document.</small></label>`).join('');
}
function assignmentDocuments(assignment,permissions,pendingDocument) {
  const canUpload=allowed(permissions,assignment,'canFinance'),paid=assignment.finance?.status==='paid';
  return `<fieldset class="ops-assignment-documents"><legend data-i18n>Invoices, contracts &amp; W-9</legend><p class="ops-note" data-i18n>Uploads are saved immediately and also appear in Finances for this creator and campaign. Other assignment changes use Save changes.</p>${pendingDocument?`<p class="ops-notice" role="status">${esc(pendingDocument.document.displayName)} is uploaded, but its attachment to Finances is not confirmed. Retry before saving other changes.</p>${button('Retry document attachment','retry-assignment-document')}`:''}${canUpload?`${paid?'<p class="ops-note" data-i18n>This payment is already recorded as paid. Document changes require a finance correction.</p>':''}${documentUploads(paid||!!pendingDocument)}`:'<p class="ops-note" data-i18n>Uploading and downloading protected documents requires finance access.</p>'}${assignment.documentsError?`<p role="status">${esc(assignment.documentsError)}</p>`:''}<ul class="ops-resources">${assignmentDocumentTypes.map(([type,label])=>{
    const documentId=assignment.finance?.[type+'DocumentId'],document=list(assignment.documents).find(d=>d.id===documentId);
    const status=({pending:'Pending review',approved:'Approved',rejected:'Rejected',missing:'Missing'})[assignment.finance?.[type+'Status']]||'Missing';
    return `<li><strong>${label}</strong><small>${esc(status)}</small>${canUpload&&/^[a-f0-9-]{36}$/i.test(documentId||'')?`<a href="/api/restricted-documents/${esc(documentId)}/download" target="_blank" rel="noopener noreferrer">${esc(document?.displayName||`Download ${label}`)} ↗</a>`:''}</li>`;
  }).join('')}</ul></fieldset>`;
}
function assignmentEditor(assignment,value,permissions,pendingDocument) {
  const v={...assignment,...value};
  return `${renderAssignmentContactSource(assignment)}<div class="ops-fields">${formSelect('Engagement type','engagementType',[['unknown','Not yet agreed'],['paid','Paid'],['seeding','Seeding'],['hybrid','Paid and product']],v.engagementType||'unknown')}${input('Recorded fee','feeAmount',v.feeAmount,{type:'number',min:0,step:'0.01'})}</div>${renderAssignmentEditableFields(assignment,value)}${assignmentDocuments(assignment,permissions,pendingDocument)}${assignment.canFinance?button("Edit payment details","edit-finance",{campaignId:assignment.campaignId,assignmentId:assignment.id}):""}<p class="ops-note" data-i18n>An entered fee does not approve an agreement or confirm a payment. Keep the supporting terms with this campaign assignment.</p>`;
}

function financeDocuments(assignment, value, financeAccess) {
  const paid=assignment.finance?.status==='paid';
  const fields = paid?'': ['invoice', 'w9', 'contract'].map(type => hidden(type + 'DocumentId', value[type + 'DocumentId']) + hidden(type + 'Status', value[type + 'Status'] || 'missing')).join('');
  if (!financeAccess) return `${fields}<p class="ops-note" data-i18n>Uploading and downloading protected documents requires finance access.</p>`;
  const cards = [['invoice', 'Invoice'], ['w9', 'W-9'], ['contract', 'Contract']].map(([type, label]) => {
    const current = value[type + 'DocumentId'];
    const document = list(assignment.documents).find(d => d.id === current && d.documentType === type && d.availabilityStatus === 'copied' && /^[a-f0-9-]{36}$/i.test(d.id));
    const state = document ? 'uploaded' : current ? 'unavailable' : 'missing';
    const download = document?.downloadUrl === `/api/campaign-files/${document?.id}` ? document.downloadUrl : `/api/restricted-documents/${document?.id}/download`;
    const status = document ? 'Uploaded' : current ? 'File unavailable' : 'Upload needed';
    return `<section class="ops-file-upload ops-document-card ops-document-card--${state}" data-document-type="${type}" aria-labelledby="ops-document-${type}">
      <div class="ops-document-card-heading"><h3 id="ops-document-${type}" data-i18n>${label}</h3><span class="ops-document-status" data-i18n>${status}</span></div>
      ${document ? `<span class="ops-document-name" data-no-translate>${esc(document.displayName || `${label} PDF`)}</span><a class="ops-document-download" href="${esc(download)}" target="_blank" rel="noopener noreferrer">Download currently uploaded ${type === 'w9' ? 'W-9' : type} ↗</a>` : `<p class="ops-note" data-i18n>${current ? 'A file is saved, but it could not be loaded. Reopen this editor to try again.' : `No ${label === 'W-9' ? label : type} uploaded yet.`}</p>`}
      ${paid?'':`<label><span>${current ? 'Upload a new' : 'Upload'} ${label === 'W-9' ? label : type} PDF</span><input type="file" data-ops-upload="${type}" accept=".pdf"></label><small class="ops-note" data-i18n>PDF · up to 5 MB</small>`}
    </section>`;
  }).join('');
  return `${fields}${cards}`;
}

function financeEditor(assignment, value, permissions) {
  if(assignment.finance?.status==='paid'){
    const f=assignment.finance,financeAccess=allowed(permissions,assignment,'canFinance');
    return `<p class="ops-notice" data-i18n>This payment is recorded as paid. Saved payment facts and documents are read-only.</p><dl class="ops-facts"><div><dt data-i18n>Full invoice</dt><dd>${money(f.amount,f.currency)}</dd></div><div><dt data-i18n>BYOU share</dt><dd>${money(f.paidByouAmount,f.currency)}</dd></div><div><dt data-i18n>Actual payment date</dt><dd>${dateText(f.paidOn)}</dd></div><div><dt data-i18n>Payment method</dt><dd>${text({wire:'Wire',check:'Check'}[f.method])}</dd></div><div><dt data-i18n>Payment reference</dt><dd>${text(f.paymentReference)}</dd></div></dl><fieldset><legend data-i18n>Documents</legend>${financeDocuments(assignment,f,financeAccess)}</fieldset>`;
  }
  const v = { ...assignment.finance, ...value };
  const financeAccess = allowed(permissions, assignment, "canFinance");
  const due = Object.hasOwn(v,'dueDate') ? v.dueDate : operationsNet30Date(v.liveDate);
  return `<fieldset><legend data-i18n>Payment timing</legend><div class="ops-fields">${input("Full invoice amount", "amount", v.amount, { type: "number", min: 0, step: "0.01" })}${hidden("currency",v.currency || assignment.feeCurrency || "USD")}${input("Deliverable live date", "liveDate", v.liveDate, { type: "date" })}${input("Payment due date", "dueDate", due, { type: "date" })}${hidden("urgency",v.urgency || "normal")}${formSelect("Payment method", "method", [["", "Choose wire or check"], ["wire", "Wire"], ["check", "Check"]], v.method || "")}</div></fieldset>
    <fieldset${financeAccess ? "" : " disabled"}><legend data-i18n>Documents</legend>${financeDocuments(assignment,v,financeAccess)}${financeAccess&&assignment.documentsError?`<p class="ops-note" role="status">${esc(assignment.documentsError)}</p>`:""}</fieldset>${hidden("status",v.status||"pending")}${hidden("paidOn",v.paidOn)}${hidden("paymentReference",v.paymentReference)}`;
}

function shipmentEditor(assignment, campaign, value) {
  const v = { ...assignment.shipment, ...value };
  const address = addressText(v.address);
  return `${!address ? '<p class="ops-notice" role="status">Add this creator’s full shipping address before preparing the shipment.</p>' : ""}<div class="ops-fields">${input("Recipient full name", "fullName", v.fullName, { max: 200 })}${input("Product name", "productName", v.productName || campaign.productName, { max: 200 })}${input("Brand", "brand", v.brand || campaign.brand, { max: 200 })}${textarea("Shipping address", "address", address, { rows: 4, max: 1200, help: "Use the creator’s saved shipping address. Address details belong in the restricted shipping record." })}${input("Box size", "boxSize", v.boxSize, { max: 80 })}${input("Shipping cost", "shippingCost", v.shippingCost, { type: "number", min: 0, step: "0.01" })}${input("Original tracking", "trackingOriginal", v.trackingOriginal, { max: 120 })}${input("Tracking #", "trackingNumber", v.trackingNumber, { max: 120 })}${input("Packing date", "packingDate", v.packingDate, { type: "date" })}</div>`;
}

function automationEditor(campaign,automation,assignments,value,hasMore,loadingRoster) {
  const a=automation||{},v={emailEnabled:a.email?.enabled===true,shipmentsEnabled:a.shipments?.enabled===true,mailboxBindingId:a.mailbox?.bindingId||null,enrolledAssignmentIds:list(a.enrolledAssignmentIds),approved:false,...value};
  const rows=list(assignments).filter(row=>bound(campaign,row));
  const selected=new Set(list(v.enrolledAssignmentIds)),loaded=new Set(rows.map(row=>row.id));
  const preserved=[...selected].filter(id=>!loaded.has(id));
  const bindings=list(a.mailboxOptions).filter(binding=>binding.verified===true&&recorded(binding.id)&&recorded(binding.email));
  const savedUnavailable=v.mailboxBindingId&&!bindings.some(binding=>binding.id===v.mailboxBindingId);
  const requested=v.emailEnabled||v.shipmentsEnabled;
  return `<p class="ops-note" data-i18n>Review the mailbox, creators, and requested checks together. Saving these settings does not approve any email message.</p>
    ${a.pilotPaused===true?'<p class="ops-notice" data-i18n>Paused until activation is approved.</p>':''}
    <fieldset><legend data-i18n>Requested checks</legend><div class="ops-fields"><label class="ops-check"><input type="checkbox" role="switch" name="emailEnabled"${v.emailEnabled?' checked':''} />Email reply checks</label><label class="ops-check"><input type="checkbox" role="switch" name="shipmentsEnabled"${v.shipmentsEnabled?' checked':''} />Shipment checks</label></div><p class="ops-note" data-i18n>Saving settings does not activate paused checks.</p></fieldset>
    <fieldset><legend data-i18n>Verified mailbox</legend><label><span>Linked mailbox</span><select name="mailboxBindingId"${v.emailEnabled?' required':''}><option value="">No mailbox selected</option>${savedUnavailable?`<option value="${esc(v.mailboxBindingId)}" selected>Saved mailbox unavailable — review its connection</option>`:''}${bindings.map(binding=>option(binding.id,`${binding.email}${binding.managerName?' · '+binding.managerName:''}`,v.mailboxBindingId)).join('')}</select></label>${!bindings.length?'<p class="ops-note" data-i18n>No verified mailbox is available. Ask an administrator to verify an existing connection before requesting email checks.</p>':''}</fieldset>
    <fieldset><legend data-i18n>Enrolled creators</legend><p class="ops-note">${selected.size} selected · Maximum 100 per save. Select only the creators who should receive these checks.</p>${preserved.map(id=>hidden('enrolledAssignmentIds',id)).join('')}${preserved.length||hasMore?`<p class="ops-notice">This is a partial roster. ${preserved.length} enrolled creator${preserved.length===1?' is':'s are'} outside the loaded page; their enrollment will be preserved.</p>`:''}<div class="ops-automation-enrollment">${rows.map(row=>`<label class="ops-check"><input type="checkbox" name="enrolledAssignmentIds" value="${esc(row.id)}"${selected.has(row.id)?' checked':''} /><span>${esc(creatorName(row))}<small>${text(row.creatorHandle,'Handle not recorded')}</small></span></label>`).join('')||'<p class="ops-note" data-i18n>No creators are loaded for this campaign. Add creators to the campaign before enrolling them.</p>'}</div>${hasMore?button(loadingRoster?'Loading creators…':'Load more creators','automation-load-more',{campaignId:campaign.id,disabled:loadingRoster}):''}</fieldset>
    ${requested?`<label class="ops-check"><input type="checkbox" name="approved" required${v.approved===true?' checked':''} />I approve these checks for this campaign, the selected mailbox, and the enrolled creators.</label>`:''}`;
}

function removeCreatorEditor(campaign,assignment,creator,value) {
  return `<p>Remove <strong>${esc(creator ? creatorDisplayLabel(creator) : creatorName(assignment))}</strong> from <strong>${esc(campaign.name)}</strong>?</p><p>This removes them from the campaign roster and stops their campaign automation. Their campaign history and files are retained. Their shared creator profile, audit history, and assignments in other campaigns remain. You can add them to the campaign again later.</p><label class="ops-check"><input type="checkbox" name="approved" required${value.approved===true?' checked':''} />I confirm removing this creator from this campaign.</label>`;
}

function deleteCampaignEditor(campaign,value) {
  return `<p>Deleting <strong>${esc(campaign.name)}</strong> permanently removes this campaign, its setup, and its creator assignments. This cannot be restored from the app.</p><p>The shared Creators library, other campaigns, and audit records remain.</p><p class="ops-note">Type the exact campaign name to confirm: <strong>${esc(campaign.name)}</strong></p>${input("Campaign name", "confirmName", value.confirmName, {required:true,max:200})}<label class="ops-check"><input type="checkbox" name="approved" required${value.approved===true?' checked':''} />I confirm permanent deletion of this campaign.</label>`;
}

export function renderOperationsEditor({ kind, campaign = {}, assignment = {}, creator = null, value = {}, error = null, saving = false, permissions = {}, approvalSummary = null, paymentBlockReason = null, automation = null, assignments = [], hasMore = false, loadingRoster = false, pendingDocument = null, shipmentStep = "details", sendingShipment = false } = {}) {
  const valid = ["campaign", "phase", "assignment", "finance", "shipment", "automation", "delete_campaign", "remove_creator"].includes(kind);
  const campaignScope = ["campaign","automation","delete_campaign"].includes(kind);
  const scopeAvailable = kind === "campaign" || ["automation","delete_campaign"].includes(kind) && !!campaign.id || bound(campaign, assignment);
  const permitted = kind === "remove_creator" ? allowed(permissions,assignment,"canEdit") && Number.isInteger(assignment.revision) && assignment.revision>=0 : kind === "delete_campaign" ? !!campaign.id && allowed(permissions,campaign,"canEdit") && Number.isInteger(campaign.revision) && campaign.revision>=0 : kind === "automation" ? automationEditable(campaign,automation,permissions) : kind === "campaign" ? permissions.canEdit === true && (!campaign.id || campaign.canEdit === true)
    : kind === "phase" || kind === "assignment" ? allowed(permissions, assignment, "canEdit")
      : kind === "finance" ? allowed(permissions, assignment, "canEdit") || allowed(permissions, assignment, "canFinance")
        : kind === "shipment" && allowed(permissions, assignment, "canShip");
  const title = { campaign: campaign.id ? "Edit campaign" : "Create campaign", phase: "Update creator phase", assignment:'Edit creator assignment', finance: assignment.finance?.status==='paid'?"View creator payment":"Edit creator payment", shipment: shipmentStep === "notes" ? "Shipment notes" : "Edit shipment", automation: "Configure automation", delete_campaign: "Delete campaign", remove_creator: "Remove from campaign" }[kind] || "Record unavailable";
  const content = !valid || !scopeAvailable || !permitted ? empty("Editing unavailable", !scopeAvailable ? "The exact campaign assignment could not be verified. Reload before editing." : "Your current access does not allow this change.")
    : `<form data-ops-form="${kind}"${scope(campaign.id, campaignScope ? null : assignment.id)}>${hidden("campaignId", campaign.id)}${!campaignScope ? hidden("assignmentId", assignment.id) : ""}${hidden("expectedRevision", kind === "automation" ? automation.revision : campaignScope ? campaign.revision : assignment.revision)}${errorNotice(error)}<fieldset${saving ? " disabled" : ""}>${kind === "remove_creator" ? removeCreatorEditor(campaign,assignment,creator,value) : kind === "delete_campaign" ? deleteCampaignEditor(campaign,value) : kind === "automation" ? automationEditor(campaign,automation,assignments,value,hasMore,loadingRoster) : kind === "campaign" ? campaignEditor(campaign, value) : kind === "phase" ? phaseEditor(assignment, value) : kind === "assignment" ? assignmentEditor(assignment,value,permissions,pendingDocument) : kind === "finance" ? financeEditor(assignment, value, permissions) : shipmentStep === "notes" ? `<p class="ops-note" data-i18n>Notes are optional. Leave this blank to continue without a note.</p><div class="ops-fields">${textarea("Shipment notes", "notes", value.notes ?? assignment.shipment?.notes, { rows: 6, max: 2000 })}</div>` : `${sendingShipment?'<p class="ops-note" data-i18n>Shipment details are optional. You can add them now or edit them later.</p>':''}${shipmentEditor(assignment, campaign, value)}`}</fieldset><footer class="ops-editor-footer"><div class="ops-actions">${button("Cancel", "close-editor", { disabled: saving })}${kind==='shipment'&&sendingShipment?button(shipmentStep==='notes'?'Back to details':'Skip details',shipmentStep==='notes'?'shipment-details-back':'skip-shipment-details',{disabled:saving}):''}${kind==='finance'&&assignment.finance?.status==='paid'?'':`<button type="submit" class="button button--primary"${saving || pendingDocument ? " disabled" : ""}>${saving ? kind === "remove_creator" ? "Removing…" : kind === "delete_campaign" ? "Deleting…" : "Saving…" : kind === "remove_creator" ? "Remove from campaign" : kind === "delete_campaign" ? "Delete campaign" : kind === "campaign" && !campaign.id ? "Create campaign" : kind === "phase" ? "Approve phase change" : kind === "shipment" && sendingShipment ? shipmentStep === "notes" ? "Send to shipment anyway" : "Continue to notes" : "Save changes"}</button>`}</div></footer></form>`;
  return `<div class="drawer-backdrop" data-ops-action="close-editor"></div><aside class="drawer drawer--wide ops-editor" role="dialog" aria-modal="true" aria-labelledby="ops-editor-title"><header class="drawer-header"><div><p class="eyebrow">${kind === "campaign" ? "Campaign record" : text(campaign.name, "Campaign")}</p><h2 id="ops-editor-title" data-i18n>${esc(title)}</h2>${!campaignScope ? `<p>${esc(creator ? creatorDisplayLabel(creator) : creatorName(assignment))}</p>` : ""}</div><button type="button" class="icon-button" data-ops-action="close-editor" aria-label="Close editor"${saving ? " disabled" : ""}>${icon('close')}</button></header><div class="drawer-body">${content}</div></aside>`;
}

export function renderOperationsOutreach({ campaign, creators = [], drafts = [], selectedCreatorIds = [], loading = false, error = null, notice = null, canPrepare = false, templateKey = null, sendEnabled = false, sending = false, demo = false } = {}) {
  if (!campaign?.id) return `<div class="ops-workspace">${empty("Campaign unavailable", "Choose a campaign before preparing outreach.")}</div>`;
  const selected = new Set(list(selectedCreatorIds));
  const rows = list(drafts);
  const chosenTemplate=templateKey||code(campaign.type);
  const templateChoice=formSelect('Template','templateKey',TEMPLATE_KINDS,chosenTemplate,{disabled:loading||!canPrepare});
  const messagePreview=d=>{try{
    const files=validateAttachments(d.content?.attachments||[],{metadataOnly:true,allowReferences:true});
    if(d.content?.document&&(documentText(d.content.document).trim()!==String(d.body||'').trim()||d.content.document.blocks.some(b=>b.type==='image'&&!files.some(f=>f.contentId===b.imageId))))throw new Error('Message changed');
    return {valid:true,html:(d.content?.document?documentHtml(d.content.document,{attachments:files,preview:true}):esc(d.body||'Message unavailable'))+
      (files.length?'<p class="ops-note">Attachments: '+files.map(f=>f.fileId?`<a href="/api/campaign-files/${esc(f.fileId)}" target="_blank" rel="noopener noreferrer">${esc(f.name)}</a>`:esc(f.name)).join(', ')+'</p>':'')};
  }catch{return {valid:false,html:'<p role="alert">This message could not be displayed. Prepare it again before approval.</p>'};}};
  return `<div class="ops-workspace" data-ops-view="outreach"${scope(campaign.id)}>${button("← Back to campaign", "open-campaign", { campaignId: campaign.id })}${header("Campaign outreach", campaign.name, "", code(campaign.type) === "seeding" ? "Seeding invitation" : "Paid invitation")}${demoNotice(demo)}${errorNotice(error)}${notice ? `<p class="ops-notice" role="status">${esc(notice)}</p>` : ""}
    <section aria-label="Select outreach recipients"><h2 data-i18n>Choose creators</h2><p class="ops-note" data-i18n>Select recipients from your creator records. You will review each exact message before sending.</p><form data-ops-form="outreach-selection"${scope(campaign.id)}>${hidden("campaignId", campaign.id)}${templateChoice}<div class="ops-selection-actions"><button type="button" class="button button--secondary" data-ops-action="select-all-outreach"${scope(campaign.id)}${loading||!canPrepare?" disabled":""}>Select all shown (${creators.length})</button><button type="button" class="button button--secondary" data-ops-action="clear-outreach"${scope(campaign.id)}${loading||!canPrepare?" disabled":""}>Clear selection</button><span class="ops-note" data-outreach-count>${selected.size} selected</span></div><div class="ops-outreach-selection">${list(creators).map(c => `<label><input type="checkbox" name="creatorIds" value="${esc(c.id)}"${selected.has(c.id) ? " checked" : ""}${loading || !canPrepare ? " disabled" : ""} /><span><strong data-no-translate>${esc(creatorDisplayLabel(c))}</strong><small>${text(c.handle || c.creatorHandle, "Handle not recorded")}</small><small>${text(c.contactEmail || c.email, "Verified recipient will be checked before preparation")}</small></span></label>`).join("") || '<p class="ops-note" data-i18n>No creator records are available for this campaign.</p>'}</div><button type="submit" class="button button--primary"${loading || !canPrepare || !creators.length ? " disabled" : ""}>${loading ? "Preparing…" : "Prepare selected messages"}</button></form></section>
    <section aria-label="Review exact outreach messages" style="margin-top:28px"><h2 data-i18n>Review messages</h2>${rows.length ? rows.map((d, index) => {
      const preview=messagePreview(d);
      const exact = preview.valid && d.campaignId === campaign.id && d.id && d.creatorId && recorded(d.from) && recorded(d.to) && recorded(d.subject) && recorded(d.body);
      const enabled = sendEnabled === true && d.canSend === true && exact && d.reviewed === true && !sending;
      return `<article class="ops-draft" data-draft-id="${esc(d.id)}"${scope(campaign.id, d.assignmentId)}><h3 data-no-translate>${esc(creatorDisplayLabel(d))}</h3><dl><dt data-i18n>From</dt><dd>${text(d.from, "Sender not confirmed")}</dd><dt data-i18n>To</dt><dd>${text(d.to, "Recipient not confirmed")}</dd><dt data-i18n>Subject</dt><dd>${text(d.subject, "Subject missing")}</dd></dl><div class="ops-message" data-no-translate>${preview.html}</div><footer><label class="ops-check"><input type="checkbox" data-ops-field="outreach-reviewed" data-draft-id="${esc(d.id)}"${scope(campaign.id)}${d.reviewed === true ? " checked" : ""}${!exact || sending ? " disabled" : ""} />I reviewed this exact recipient and message.</label><button type="button" class="button button--primary" data-ops-action="approve-send" data-draft-id="${esc(d.id)}"${scope(campaign.id, d.assignmentId)}${enabled ? "" : " disabled"}>${sending === d.id ? "Approving…" : "Approve &amp; send"}</button></footer>${d.blockReason || !sendEnabled || !d.canSend ? `<p class="ops-note">${esc(d.blockReason || "Sending is unavailable until the campaign’s send checks are satisfied.")}</p>` : ""}</article>`;
    }).join("") : empty("No messages prepared yet", "Choose creators above to prepare messages using this campaign’s saved template.")}</section></div>`;
}
