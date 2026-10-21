// Shared, deterministic domain model. This module performs no storage, model,
// provider or authorization operations. Only the server may establish authority.
export const CONTINUATION_VERSION = 'campaign-continuation-v2';
export const CONTINUATION_VERSIONS = Object.freeze(['campaign-continuation-v1', CONTINUATION_VERSION]);
export const CONTINUATION_PHASE_VERSION = 'campaign-continuation-phases-v2';
export const CONTINUATION_CATEGORIES = Object.freeze(['payment', 'rights', 'delivery', 'content', 'review']);
export const CONTINUATION_FACT_FIELDS = Object.freeze({
  selected: ['selected'], outreach: ['messageId'],
  terms: ['engagementType', 'agreement', 'feeAmount', 'currency'],
  acceptance: ['engagementType', 'accepted'],
  contract_sent: ['reference'], contract_signed: ['reference', 'verified'],
  form_received: ['reference'], form_validated: ['reference'], warehouse_handoff: ['reference'],
  shipment: ['carrier', 'tracking', 'reference'], carrier_delivery: ['reference'], receipt: ['confirmed'],
  draft: ['deliverableId', 'revision', 'url'], approval: ['deliverableId', 'revision'],
  post: ['deliverableId', 'url'], content_verified: ['deliverableId', 'url'],
  document: ['item', 'reference'], payment: ['status', 'reference'], rights: ['status', 'reference'],
  deadline: ['target', 'date', 'timezone'], hold: ['category', 'open', 'reason'], staff_closed: ['closed']
});
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ID = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,119}$/;
const HASH = /^[a-f0-9]{64}$/;
const own = (value, field) => Object.hasOwn(value, field);
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const fail = code => { throw new Error(code); };
const requireThat = (condition, code) => { if (!condition) fail(code); };
const text = (value, max = 400) => typeof value === 'string' && value.length > 0 && value.length <= max && value === value.trim() && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value);
const id = value => typeof value === 'string' && ID.test(value);
const uuid = value => typeof value === 'string' && UUID.test(value);
const revision = value => Number.isSafeInteger(value) && value >= 0;
const instant = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,9})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)
  && date(value.slice(0, 10)) && Number.isFinite(Date.parse(value));
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const dayCache = new Map();
export function continuationTimezone(value) {
  try { return typeof value === 'string' && (value === 'UTC' || /^[A-Za-z_]+(?:\/[A-Za-z_+-]+)+$/.test(value))
    && Boolean(new Intl.DateTimeFormat('en', { timeZone: value }).resolvedOptions().timeZone); } catch { return false; }
}
function zonedParts(at, zone) {
  return Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(at).filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
}
const localDate = (at, zone) => { const p = zonedParts(at, zone); return `${p.year}-${p.month}-${p.day}`; };
// Comparison bounds only. They are never event timestamps and must not be saved
// as receipt, delivery, source, or worker scheduling instants.
export function continuationDayBounds(on, zone) {
  requireThat(date(on) && on >= '1900-01-01' && on < '9999-01-01' && continuationTimezone(zone), 'CONTINUATION_DAY_INVALID');
  const key = on + '/' + zone;
  if (dayCache.has(key)) return { ...dayCache.get(key) };
  const nominal = Date.parse(on), next = new Date(nominal + 86400000).toISOString().slice(0, 10);
  const boundary = target => {
    let lo = nominal - 2 * 86400000, hi = nominal + 3 * 86400000;
    while (lo < hi) { const mid = Math.floor((lo + hi) / 2); if (localDate(mid, zone) < target) lo = mid + 1; else hi = mid; }
    return lo;
  };
  const start = boundary(on), end = boundary(next);
  requireThat(localDate(start, zone) === on && end > start && end - start <= 2 * 86400000, 'CONTINUATION_DAY_INVALID');
  const bounds = { start, end, precision: 'day' };
  if (dayCache.size >= 256) dayCache.clear();
  dayCache.set(key, bounds); return { ...bounds };
}
export function continuationDateFields(record, kind = 'occurred') {
  const at = kind === 'source' ? 'sourceDate' : 'occurredAt';
  return Object.fromEntries([at, kind + 'On', kind + 'Timezone', kind + 'Precision'].filter(key => own(record, key)).map(key => [key, record[key]]));
}
export function continuationDateBounds(record, kind = 'occurred') {
  const at = kind === 'source' ? 'sourceDate' : 'occurredAt', fields = [kind + 'On', kind + 'Timezone', kind + 'Precision'];
  if (fields.some(key => own(record, key))) {
    requireThat(record[at] === null && fields.every(key => own(record, key)) && record[kind + 'Precision'] === 'day', 'CONTINUATION_DATE_PRECISION_INVALID');
    return continuationDayBounds(record[kind + 'On'], record[kind + 'Timezone']);
  }
  if (record[at] === null) return null;
  requireThat(instant(record[at]), 'CONTINUATION_DATE_INVALID');
  const time = Date.parse(record[at]); return { start: time, end: time, precision: 'instant' };
}
export function continuationDateKnown(record, kind = 'occurred', cutoff = null) {
  const bounds = continuationDateBounds(record, kind);
  // A known day may be today's local day. Its unknown time remains unknown.
  return bounds !== null && (cutoff === null || bounds.start <= Date.parse(cutoff));
}
export function continuationDateAfter(record, prior, kind = 'occurred') {
  const a = continuationDateBounds(record, kind), b = continuationDateBounds(prior, kind);
  return Boolean(a && b && a.start >= b.end);
}
// Resolve only unambiguous local exact times; DST gaps and repeated wall times
// require a supplied actual offset instead of silently choosing an instant.
export function continuationLocalInstant(value, zone) {
  requireThat(continuationTimezone(zone) && /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?$/.test(value)
    && date(value.slice(0, 10)), 'CONTINUATION_LOCAL_TIME_INVALID');
  const nominal = Date.parse(value + 'Z'), target = value.slice(0, 16), seconds = value.slice(17, 19) || '00';
  const candidates = new Set();
  for (let h = -36; h <= 36; h += 6) {
    const probe = nominal + h * 3600000, p = zonedParts(probe, zone);
    const wall = Date.parse(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`);
    const at = nominal - (wall - Math.floor(probe / 1000) * 1000), actual = zonedParts(at, zone);
    if (`${actual.year}-${actual.month}-${actual.day}T${actual.hour}:${actual.minute}` === target && actual.second === seconds) candidates.add(at);
  }
  requireThat(candidates.size === 1, 'CONTINUATION_LOCAL_TIME_AMBIGUOUS_OR_MISSING');
  return new Date([...candidates][0]).toISOString();
}
const nullableText = (value, max = 200) => value === null || text(value, max);
const list = (value, max, code, min = 0) => requireThat(Array.isArray(value) && value.length >= min && value.length <= max, code);
function keys(value, allowed, code, required = allowed) {
  requireThat(plain(value) && Object.keys(value).every(key => allowed.includes(key))
    && required.every(key => own(value, key)), code);
}
function unique(values, code) { requireThat(new Set(values).size === values.length, code); }
export function canonicalContinuationJSON(value) {
  if (Array.isArray(value)) return '[' + value.map(canonicalContinuationJSON).join(',') + ']';
  if (plain(value)) return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonicalContinuationJSON(value[key])).join(',') + '}';
  return JSON.stringify(value);
}
export function sameContinuationBinding(left, right) { return canonicalContinuationJSON(left) === canonicalContinuationJSON(right); }
export function validateContinuationBinding(binding) {
  keys(binding, ['agencyId', 'creatorId', 'campaignId', 'assignmentId', 'roundId', 'workflowType'], 'CONTINUATION_BINDING_REQUIRED');
  requireThat(['agencyId', 'creatorId', 'campaignId', 'assignmentId'].every(key => uuid(binding[key]))
    && id(binding.roundId) && ['Paid', 'Seeding'].includes(binding.workflowType), 'CONTINUATION_BINDING_REQUIRED');
  return binding;
}
export function validateContinuationRevisions(value, workflowType) {
  keys(value, ['workflowRevision', 'sourceRevision', 'creatorStateRevision'], 'CONTINUATION_REVISIONS_REQUIRED');
  requireThat(revision(value.workflowRevision) && revision(value.sourceRevision)
    && (workflowType === 'Seeding' ? revision(value.creatorStateRevision) : value.creatorStateRevision === null), 'CONTINUATION_REVISIONS_REQUIRED');
  return value;
}
export function safeContinuationUrl(value, kind = null) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || value.length > 1000) return null;
    let scope = kind;
    if (kind === null || kind === 'staff_record') {
      if (url.hostname === 'mail.google.com') scope = 'gmail';
      else if (url.hostname === 'docs.google.com' && url.pathname.startsWith('/spreadsheets/')) scope = 'sheet';
      else if (url.hostname === 'forms.gle' || url.hostname === 'docs.google.com' && url.pathname.startsWith('/forms/')) scope = 'form';
      else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(url.hostname)) scope = null;
    }
    let decoded = value;
    for (let pass = 0; pass < 4 && /%[0-9a-f]{2}/i.test(decoded); pass++) decoded = decodeURIComponent(decoded);
    if (/%[0-9a-f]{2}/i.test(decoded) || /[\u0000-\u001f\u007f]/.test(decoded)
      || /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(decoded)) return null;
    const allowed = scope === 'gmail' ? ['ui', 'view', 'th', 'permmsgid', 'authuser']
      : scope === 'sheet' ? ['gid', 'range', 'usp', 'authuser']
        : scope === 'form' ? ['usp', 'authuser', 'embedded']
          : scope === 'staff_record' ? ['id', 'recordId', 'assignmentId', 'creatorId', 'campaignId'] : ['v', 't'];
    if ([...url.searchParams.keys()].some(key => !allowed.includes(key) || url.searchParams.getAll(key).length !== 1)) return null;
    for (const [key, query] of url.searchParams) {
      if (key === 'authuser' && !/^\d{1,3}$/.test(query) || key === 'gid' && !/^\d{1,20}$/.test(query)
        || key === 'range' && !/^[A-Za-z0-9_.'! :$-]{1,180}$/.test(query)
        || key === 'usp' && !['sharing', 'drive_link', 'sf_link', 'send_form'].includes(query)
        || key === 'embedded' && !['true', 'false'].includes(query)
        || !['range', 'usp', 'authuser', 'gid', 'embedded'].includes(key) && !/^[A-Za-z0-9_.:-]{1,150}$/.test(query)) return null;
    }
    if (scope === 'gmail' && (url.hostname !== 'mail.google.com' || !url.pathname.startsWith('/mail/'))) return null;
    if (scope === 'sheet' && (url.hostname !== 'docs.google.com' || !/^\/spreadsheets\/d\/[^/]+\//.test(url.pathname))) return null;
    if (scope === 'form' && !((url.hostname === 'docs.google.com' && /^\/forms\//.test(url.pathname)) || url.hostname === 'forms.gle')) return null;
    return value;
  } catch { return null; }
}
function validateAuthority(record, validUntil, canonicalAsOf) {
  requireThat(['proposed', 'staff_reviewed', 'canonical'].includes(record.authority)
    && Number.isFinite(record.confidence) && record.confidence >= 0 && record.confidence <= 1, 'CONTINUATION_AUTHORITY_INVALID');
  if (record.authority === 'proposed') requireThat(record.review === null, 'PROPOSAL_IS_NOT_STAFF_REVIEW');
  else {
    keys(record.review, ['actorId', 'at'], 'STAFF_REVIEW_ATTRIBUTION_REQUIRED');
    const cutoff = record.authority === 'canonical' && canonicalAsOf ? canonicalAsOf : validUntil;
    requireThat(uuid(record.review.actorId) && instant(record.review.at) && Date.parse(record.review.at) <= Date.parse(cutoff), 'STAFF_REVIEW_ATTRIBUTION_REQUIRED');
  }
}
function factKey(fact) {
  return fact.kind + ':' + (fact.subjectId || (fact.kind === 'deadline' ? fact.value.target : fact.kind === 'hold' ? fact.value.category : fact.kind === 'document' ? fact.value.item : ''));
}
function validateSupersessions(records, keyFor, dateFor) {
  for (const record of records) {
    const refs = record.supersedes || [];
    list(refs, 12, 'CONTINUATION_SUPERSESSION_INVALID'); unique(refs, 'CONTINUATION_SUPERSESSION_INVALID');
    for (const ref of refs) {
      const prior = records.find(candidate => candidate.id === ref), at = dateFor(record), priorAt = prior && dateFor(prior);
      const proposalOnly = record.authority === 'proposed' && prior?.authority === 'proposed';
      requireThat(id(ref) && ref !== record.id && prior && keyFor(prior) === keyFor(record)
        && (record.authority !== 'proposed' || proposalOnly)
        && (record.authority === 'canonical' || prior.authority !== 'canonical')
        && (proposalOnly ? (!at || !priorAt || at.end >= priorAt.start)
          : at && priorAt && at.start >= priorAt.end), 'CONTINUATION_SUPERSESSION_INVALID');
    }
  }
  const visiting = new Set(), visited = new Set();
  function visit(record) {
    requireThat(!visiting.has(record.id), 'CONTINUATION_SUPERSESSION_CYCLE');
    if (visited.has(record.id)) return;
    visiting.add(record.id);
    (record.supersedes || []).forEach(ref => visit(records.find(item => item.id === ref)));
    visiting.delete(record.id); visited.add(record.id);
  }
  records.forEach(visit);
}
function validateFactValue(fact) {
  const value = fact.value;
  const allowed = CONTINUATION_FACT_FIELDS[fact.kind];
  requireThat(Boolean(allowed), 'CONTINUATION_FACT_KIND_NOT_ALLOWED');
  keys(value, allowed, 'CONTINUATION_FACT_VALUE_INVALID', fact.kind === 'terms' ? ['engagementType', 'agreement'] : allowed);
  const reference = () => text(value.reference, 200) && !/\s|@/.test(value.reference);
  let valid = false;
  switch (fact.kind) {
    case 'selected': valid = value.selected === true; break;
    case 'outreach': valid = id(value.messageId); break;
    case 'terms': valid = ['Paid', 'Seeding'].includes(value.engagementType) && ['proposed', 'accepted'].includes(value.agreement)
      && (!own(value, 'feeAmount') || value.feeAmount === null || Number.isFinite(value.feeAmount) && value.feeAmount >= 0 && value.feeAmount <= 100000000)
      && (!own(value, 'currency') || value.currency === null || /^[A-Z]{3}$/.test(value.currency))
      && (value.feeAmount == null || typeof value.currency === 'string'); break;
    case 'acceptance': valid = ['Paid', 'Seeding'].includes(value.engagementType) && typeof value.accepted === 'boolean'; break;
    case 'contract_signed': valid = reference() && typeof value.verified === 'boolean'; break;
    case 'contract_sent': case 'form_received': case 'form_validated': case 'warehouse_handoff': case 'carrier_delivery': valid = reference(); break;
    case 'shipment': valid = nullableText(value.carrier, 60) && nullableText(value.tracking, 120) && nullableText(value.reference)
      && Boolean(value.tracking || value.reference); break;
    case 'receipt': valid = value.confirmed === true; break;
    case 'draft': valid = id(value.deliverableId) && id(value.revision) && Boolean(safeContinuationUrl(value.url)); break;
    case 'approval': valid = id(value.deliverableId) && id(value.revision); break;
    case 'post': case 'content_verified': valid = id(value.deliverableId) && Boolean(safeContinuationUrl(value.url)); break;
    case 'document': valid = ['invoice', 'w9', 'ad_code'].includes(value.item) && reference(); break;
    case 'payment': valid = ['open', 'paid', 'unknown'].includes(value.status) && nullableText(value.reference); break;
    case 'rights': valid = ['open', 'fulfilled', 'unknown'].includes(value.status) && nullableText(value.reference); break;
    case 'deadline':
      valid = ['content', 'posting', 'payment', 'rights'].includes(value.target) && date(value.date) && text(value.timezone, 120);
      try { new Intl.DateTimeFormat('en', { timeZone: value.timezone }); } catch { valid = false; }
      break;
    case 'hold': valid = CONTINUATION_CATEGORIES.includes(value.category) && typeof value.open === 'boolean' && text(value.reason, 400); break;
    case 'staff_closed': valid = value.closed === true; break;
  }
  requireThat(valid, 'CONTINUATION_FACT_VALUE_INVALID');
  if (own(value, 'deliverableId')) requireThat(fact.subjectId === value.deliverableId, 'CONTINUATION_DELIVERABLE_BINDING_REQUIRED');
}
export function validateContinuationPacket(raw) {
  const fields = ['version', 'id', 'binding', 'revisions', 'asOf', 'validUntil', 'sources', 'evidence', 'facts', 'obligations'];
  keys(raw, [...fields, 'canonicalAsOf'], 'CONTINUATION_PACKET_INVALID', fields);
  requireThat(CONTINUATION_VERSIONS.includes(raw.version) && uuid(raw.id), 'CONTINUATION_PACKET_INVALID');
  const precisionFields = kind => raw.version === CONTINUATION_VERSION ? [kind + 'On', kind + 'Timezone', kind + 'Precision'] : [];
  validateContinuationBinding(raw.binding); validateContinuationRevisions(raw.revisions, raw.binding.workflowType);
  requireThat(instant(raw.asOf) && instant(raw.validUntil) && Date.parse(raw.validUntil) > Date.parse(raw.asOf)
    && Date.parse(raw.validUntil) <= Date.parse(raw.asOf) + 15 * 60000, 'CONTINUATION_FRESHNESS_REQUIRED');
  requireThat(!own(raw, 'canonicalAsOf') || instant(raw.canonicalAsOf) && Date.parse(raw.canonicalAsOf) >= Date.parse(raw.asOf), 'CONTINUATION_CANONICAL_CUTOFF_INVALID');
  validateContinuationSources(raw.sources, { asOf: raw.asOf, canonicalAsOf: raw.canonicalAsOf, version: raw.version });
  list(raw.evidence, raw.canonicalAsOf ? 208 : 48, 'CONTINUATION_EVIDENCE_BOUNDED');
  list(raw.facts, 80, 'CONTINUATION_FACTS_BOUNDED');
  list(raw.obligations, 80, 'CONTINUATION_OBLIGATIONS_BOUNDED');
  for (const evidence of raw.evidence) {
    const fields = ['id', 'binding', 'sourceId', 'sourceVersion', 'sourceHash', 'sourceDate', 'sourceUrl', 'excerpt', 'extractionMethod', 'extractionVersion', 'exact', 'privacyScreened'];
    keys(evidence, [...fields, ...precisionFields('source')], 'CONTINUATION_EVIDENCE_INVALID', fields);
    const source = raw.sources.find(candidate => candidate.id === evidence.sourceId);
    validateContinuationBinding(evidence.binding);
    requireThat(id(evidence.id) && sameContinuationBinding(evidence.binding, raw.binding), 'CONTINUATION_EVIDENCE_BINDING_MISMATCH');
    requireThat(source && source.coverage !== 'unavailable' && evidence.sourceVersion === source.version && evidence.sourceHash === source.hash
      && evidence.sourceUrl === source.url && canonicalContinuationJSON(continuationDateFields(evidence, 'source')) === canonicalContinuationJSON(continuationDateFields(source, 'source')), 'CONTINUATION_SOURCE_BINDING_MISMATCH');
    requireThat(text(evidence.excerpt, 1800) && ['direct_body', 'quoted_history', 'sheet_cell', 'form_response', 'staff_record', 'review_excerpt'].includes(evidence.extractionMethod)
      && id(evidence.extractionVersion) && evidence.exact === true && evidence.privacyScreened === true, 'CONTINUATION_EVIDENCE_INVALID');
    requireThat(source.kind !== 'gmail' || ['direct_body', 'quoted_history', 'review_excerpt'].includes(evidence.extractionMethod), 'CONTINUATION_EXTRACTION_MISMATCH');
  }
  unique(raw.evidence.map(evidence => evidence.id), 'CONTINUATION_DUPLICATE_EVIDENCE');
  requireThat(raw.evidence.filter(evidence => raw.sources.find(source => source.id === evidence.sourceId).kind !== 'staff_record').length <= 48,
    'CONTINUATION_EVIDENCE_BOUNDED');
  const validateReferences = record => {
    list(record.evidenceIds, 12, 'CONTINUATION_EVIDENCE_REFERENCES_REQUIRED', 1);
    unique(record.evidenceIds, 'CONTINUATION_DUPLICATE_EVIDENCE_REFERENCE');
    requireThat(record.evidenceIds.every(ref => raw.evidence.some(evidence => evidence.id === ref)), 'CONTINUATION_EVIDENCE_REFERENCE_UNKNOWN');
    requireThat(id(record.id) && (record.subjectId === null || id(record.subjectId)), 'CONTINUATION_RECORD_ID_INVALID');
    validateAuthority(record, raw.validUntil, raw.canonicalAsOf);
    if (record.evidenceIds.some(ref => {
      const evidence = raw.evidence.find(item => item.id === ref);
      const source = raw.sources.find(item => item.id === evidence.sourceId);
      return Date.parse(source.capturedAt) > Date.parse(raw.asOf);
    })) requireThat(record.authority === 'canonical', 'CONTINUATION_CANONICAL_EVIDENCE_ONLY');
  };
  for (const fact of raw.facts) {
    const fields = ['id', 'kind', 'subjectId', 'value', 'occurredAt', 'evidenceIds', 'authority', 'confidence', 'review', 'supersedes'];
    keys(fact, [...fields, ...precisionFields('occurred')], 'CONTINUATION_FACT_INVALID', fields);
    validateReferences(fact); validateFactValue(fact);
    const cutoff = fact.authority === 'canonical' && raw.canonicalAsOf ? raw.canonicalAsOf : raw.asOf;
    const bounds = continuationDateBounds(fact);
    requireThat(bounds === null || bounds.start <= Date.parse(cutoff), 'CONTINUATION_FACT_DATE_INVALID');
    if (bounds && bounds.start > Date.parse(raw.asOf)) requireThat(fact.evidenceIds.every(ref => {
      const evidence = raw.evidence.find(item => item.id === ref);
      return raw.sources.find(item => item.id === evidence.sourceId).kind === 'staff_record';
    }), 'CONTINUATION_LATER_STAFF_EVIDENCE_REQUIRED');
    list(fact.supersedes, 12, 'CONTINUATION_SUPERSESSION_INVALID');
  }
  unique(raw.facts.map(fact => fact.id), 'CONTINUATION_DUPLICATE_FACT');
  validateSupersessions(raw.facts, factKey, fact => continuationDateBounds(fact));
  for (const obligation of raw.obligations) {
    const fields = ['id', 'category', 'requirement', 'status', 'subjectId', 'evidenceIds', 'authority', 'confidence', 'review'];
    keys(obligation, [...fields, 'supersedes'], 'CONTINUATION_OBLIGATION_INVALID', fields);
    if (own(obligation, 'supersedes')) list(obligation.supersedes, 12, 'CONTINUATION_SUPERSESSION_INVALID');
    validateReferences(obligation);
    requireThat(CONTINUATION_CATEGORIES.includes(obligation.category)
      && ['required', 'optional', 'not_applicable', 'unknown'].includes(obligation.requirement)
      && ['open', 'fulfilled', 'unknown'].includes(obligation.status), 'CONTINUATION_OBLIGATION_INVALID');
  }
  unique(raw.obligations.map(obligation => obligation.id), 'CONTINUATION_DUPLICATE_OBLIGATION');
  validateSupersessions(raw.obligations, obligation => obligation.category + ':' + (obligation.subjectId || ''), obligation => obligation.review ? { start: Date.parse(obligation.review.at), end: Date.parse(obligation.review.at) } : null);
  requireThat(JSON.stringify(raw).length <= (raw.canonicalAsOf ? 750000 : 180000), 'CONTINUATION_PACKET_TOO_LARGE');
  return structuredClone(raw);
}

// A new source observation has its own real capture time. Validating it does
// not rewrite a packet's original dates or establish any milestone authority.
export function validateContinuationSources(sources, { asOf, canonicalAsOf = null, version = CONTINUATION_VERSION } = {}) {
  requireThat(instant(asOf) && (canonicalAsOf === null || instant(canonicalAsOf)), 'CONTINUATION_SOURCE_CUTOFF_REQUIRED');
  list(sources, canonicalAsOf ? 184 : 24, 'CONTINUATION_SOURCES_BOUNDED', 1);
  requireThat(sources.filter(source => source?.kind !== 'staff_record').length <= 24, 'CONTINUATION_SOURCES_BOUNDED');
  for (const source of sources) {
    const fields = ['id', 'kind', 'providerId', 'version', 'hash', 'sourceDate', 'capturedAt', 'url', 'coverage'];
    keys(source, [...fields, ...(version === CONTINUATION_VERSION ? ['sourceOn', 'sourceTimezone', 'sourcePrecision'] : [])], 'CONTINUATION_SOURCE_INVALID', fields);
    const cutoff = source.kind === 'staff_record' && canonicalAsOf ? canonicalAsOf : asOf;
    requireThat(id(source.id) && ['gmail', 'sheet', 'form', 'staff_record'].includes(source.kind)
      && typeof source.providerId === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:/#=-]{0,199}$/.test(source.providerId)
      && typeof source.version === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:+-]{0,119}$/.test(source.version) && HASH.test(source.hash)
      && ['complete', 'partial', 'unavailable'].includes(source.coverage)
      && Boolean(safeContinuationUrl(source.url, source.kind)) && instant(source.capturedAt)
      && Date.parse(source.capturedAt) <= Date.parse(cutoff)
      && (continuationDateBounds(source, 'source') === null || continuationDateKnown(source, 'source', source.capturedAt)), 'CONTINUATION_SOURCE_INVALID');
  }
  unique(sources.map(source => source.id), 'CONTINUATION_DUPLICATE_SOURCE');
  return structuredClone(sources);
}

const rank = record => ({ canonical: 3, staff_reviewed: 2, proposed: 1 }[record.authority]);
const compare = (a, b) => rank(b) - rank(a) || Date.parse(b.occurredAt || b.review?.at || 0) - Date.parse(a.occurredAt || a.review?.at || 0) || a.id.localeCompare(b.id);
function chooseRecords(records, keyFor, valueFor) {
  const superseded = new Set(records.flatMap(record => record.supersedes || []));
  const chosen = new Map(), conflicts = [];
  for (const record of records.filter(record => !superseded.has(record.id)).sort(compare)) {
    const key = keyFor(record), prior = chosen.get(key);
    if (!prior) chosen.set(key, record);
    else if (canonicalContinuationJSON(valueFor(prior)) !== canonicalContinuationJSON(valueFor(record))) conflicts.push({ key, kept: prior.id, conflicting: record.id });
  }
  return { records: [...chosen.values()], conflicts };
}
const obligationKey = obligation => obligation.category + ':' + (obligation.subjectId || '');
const obligationValue = obligation => ({ requirement: obligation.requirement, status: obligation.status });
const factValue = fact => fact.value;
function hasKnownEvidence(record, packet, now) {
  return (record.occurredAt === undefined || continuationDateKnown(record, 'occurred', now))
    && record.evidenceIds.every(ref => {
      const evidence = packet.evidence.find(item => item.id === ref);
      return continuationDateKnown(evidence, 'source', now);
    })
    && (!record.review || Date.parse(record.review.at) <= Date.parse(now));
}
function effectiveObligations(obligations, facts) {
  const find = (kind, subjectId) => facts.find(fact => fact.kind === kind && (subjectId === null || fact.subjectId === subjectId));
  return obligations.map(obligation => {
    let fact;
    if (obligation.category === 'payment') fact = find('payment', obligation.subjectId);
    else if (obligation.category === 'rights') fact = find('rights', obligation.subjectId);
    else if (obligation.category === 'delivery') fact = find('receipt', obligation.subjectId);
    else if (obligation.category === 'content') fact = find('content_verified', obligation.subjectId);
    if (!fact || rank(fact) < rank(obligation) || !['required', 'optional'].includes(obligation.requirement)) return { ...obligation };
    const status = ['payment', 'rights'].includes(obligation.category)
      ? ['paid', 'fulfilled'].includes(fact.value.status) ? 'fulfilled' : fact.value.status : 'fulfilled';
    return { ...obligation, status, resolvedByFactId: fact.id };
  });
}
function categoryStatus(category, obligations, facts) {
  const items = obligations.filter(obligation => obligation.category === category);
  if (facts.some(fact => fact.kind === 'hold' && fact.value.category === category && fact.value.open)) return 'open';
  if (!items.length || items.some(item => item.requirement === 'unknown')) return 'unknown';
  const required = items.filter(item => item.requirement === 'required');
  if (required.some(item => item.status === 'open')) return 'open';
  if (required.some(item => item.status === 'unknown')) return 'unknown';
  if (required.length) return 'resolved';
  return items.some(item => item.requirement === 'optional') ? 'optional' : 'not_applicable';
}
const clearStatus = status => ['resolved', 'optional', 'not_applicable'].includes(status);
function phaseFor(type, facts, obligations) {
  const has = (kind, matches = () => true) => facts.some(fact => fact.kind === kind && matches(fact));
  const contentClear = clearStatus(categoryStatus('content', obligations, facts));
  const deliveryClear = clearStatus(categoryStatus('delivery', obligations, facts));
  const reviewClear = clearStatus(categoryStatus('review', obligations, facts));
  const agreed = type === 'Paid' ? has('terms', fact => fact.value.agreement === 'accepted' && fact.value.engagementType === 'Paid')
    : has('acceptance', fact => fact.value.accepted && fact.value.engagementType === 'Seeding');
  if (agreed && contentClear && deliveryClear && reviewClear) return 'complete';
  if (type === 'Seeding') {
    if (has('content_verified')) return contentClear ? 'review' : 'content';
    if (has('post')) return 'video';
    if (has('receipt')) return contentClear ? 'review' : 'content';
    if (has('carrier_delivery')) return 'receipt';
    if (has('shipment') || has('warehouse_handoff')) return 'delivery';
    if (has('form_validated')) return 'warehouse';
    if (has('acceptance', fact => fact.value.accepted)) return 'form';
    if (has('outreach') || has('selected')) return 'outreach';
    return 'unknown';
  }
  if (has('post')) return contentClear ? 'documents' : 'review';
  if (has('approval') && contentClear) return 'publication';
  if (has('draft')) return 'review';
  if (has('receipt')) return 'draft';
  if (has('shipment') || has('carrier_delivery')) return 'delivery';
  if (has('contract_signed', fact => fact.value.verified)) return 'address';
  if (has('contract_sent')) return 'signature';
  if (agreed) return 'contract';
  if (has('outreach') || has('terms')) return 'terms';
  if (has('selected')) return 'outreach';
  return 'unknown';
}
export function mapContinuationAgentPhase(workflowType, phase) {
  const phases = workflowType === 'Paid'
    ? { selected: 'outreach', outreach: 'outreach', terms: 'negotiation', contract: 'onboarding', signature: 'onboarding', address: 'shipping', delivery: 'shipping', draft: 'content_creation', review: 'content_review', publication: 'closure', documents: 'closure', complete: 'closure' }
    : { selected: 'outreach', outreach: 'outreach', form: 'onboarding', warehouse: 'shipping', delivery: 'shipping', receipt: 'shipping', content: 'content_creation', video: 'content_review', review: 'content_review', complete: 'closure' };
  return phases[phase] || 'unknown';
}
const nextActions = {
  unknown: ['Our team', 'Review source coverage, identity and unresolved evidence.'],
  selected: ['Our team', 'Confirm this creator and campaign assignment.'],
  outreach: ['Our team', 'Review the invitation and recorded participation decision.'],
  terms: ['Our team', 'Confirm the current accepted compensation and obligations.'],
  contract: ['Our team', 'Review the agreed contract requirement and existing document.'],
  signature: ['Our team', 'Verify the returned contract against its protected record.'],
  address: ['Our team', 'Verify the protected shipping details.'],
  form: ['Our team', 'Review the existing form and campaign agreements.'],
  warehouse: ['Our team', 'Review the existing warehouse handoff.'],
  delivery: ['Our team', 'Check recorded shipment and delivery evidence.'],
  receipt: ['Creator / our team', 'Verify possession or resolve a delivery problem.'],
  content: ['Our team', 'Review only the content obligations that were agreed.'],
  draft: ['Our team', 'Check the agreed draft and its recorded deadline.'],
  review: ['Our team', 'Review the exact submitted content and remaining obligations.'],
  video: ['Our team', 'Verify the observed publication against the agreed deliverables.'],
  publication: ['Our team', 'Check the agreed publication and its deadline.'],
  documents: ['Our team', 'Review the remaining agreed document and closure requirements.'],
  complete: ['Our team', 'Check remaining payment, rights and other attention items.']
};
export function projectContinuationContext(raw, { now = new Date().toISOString() } = {}) {
  const packet = validateContinuationPacket(raw);
  requireThat(instant(now), 'CONTINUATION_NOW_REQUIRED');
  const fresh = Date.parse(packet.asOf) <= Date.parse(now) && Date.parse(now) < Date.parse(packet.validUntil);
  const coverage = packet.sources.every(source => source.coverage === 'complete') ? 'complete'
    : packet.sources.every(source => source.coverage === 'unavailable') ? 'unavailable' : 'partial';
  const undated = [...packet.facts, ...packet.obligations].filter(record => !hasKnownEvidence(record, packet, now));
  const eligibleFacts = packet.facts.filter(fact => hasKnownEvidence(fact, packet, now));
  const eligibleObligations = packet.obligations.filter(obligation => hasKnownEvidence(obligation, packet, now));
  const authoritative = chooseRecords(eligibleFacts.filter(fact => fact.authority !== 'proposed'), factKey, factValue);
  const authoritativeObligations = chooseRecords(eligibleObligations.filter(obligation => obligation.authority !== 'proposed'), obligationKey, obligationValue);
  const withProposals = chooseRecords(eligibleFacts, factKey, factValue);
  const obligationsWithProposals = chooseRecords(eligibleObligations, obligationKey, obligationValue);
  const conflicts = [...authoritative.conflicts, ...authoritativeObligations.conflicts, ...withProposals.conflicts, ...obligationsWithProposals.conflicts]
    .filter((entry, index, all) => all.findIndex(other => canonicalContinuationJSON(other) === canonicalContinuationJSON(entry)) === index);
  const typeConflicts = authoritative.records.filter(fact => ['terms', 'acceptance'].includes(fact.kind) && fact.value.engagementType !== packet.binding.workflowType);
  for (const fact of typeConflicts) conflicts.push({ key: 'workflowType', kept: packet.binding.workflowType, conflicting: fact.id });
  const facts = authoritative.records;
  const obligations = effectiveObligations(authoritativeObligations.records, facts);
  const attention = CONTINUATION_CATEGORIES.map(category => ({ category, status: categoryStatus(category, obligations, facts),
    obligationIds: obligations.filter(obligation => obligation.category === category).map(obligation => obligation.id) }));
  const review = attention.find(item => item.category === 'review');
  const hasProposals = [...packet.facts, ...packet.obligations].some(record => record.authority === 'proposed');
  const reviewReasons = [!fresh && 'stale_context', coverage !== 'complete' && 'incomplete_source_coverage',
    conflicts.length > 0 && 'conflicting_evidence', undated.length > 0 && 'unknown_source_or_event_date', hasProposals && 'unreviewed_proposals'].filter(Boolean);
  if (reviewReasons.length) review.status = 'open';
  const lastSupportedPhase = phaseFor(packet.binding.workflowType, facts, obligations);
  const phase = fresh && coverage === 'complete' && !conflicts.length ? lastSupportedPhase : 'unknown';
  const hypothetical = phaseFor(packet.binding.workflowType, withProposals.records,
    effectiveObligations(obligationsWithProposals.records, withProposals.records));
  const proposedPhase = hasProposals ? hypothetical : null;
  const next = nextActions[reviewReasons.length ? 'unknown' : phase];
  return {
    version: packet.version, phaseVersion: CONTINUATION_PHASE_VERSION,
    binding: packet.binding, revisions: packet.revisions, asOf: packet.asOf, validUntil: packet.validUntil,
    canonicalAsOf: packet.canonicalAsOf || packet.asOf,
    freshness: fresh ? 'current' : 'stale', coverage, manualMode: true,
    sourceCoverage: packet.sources.map(source => ({ id: source.id, version: source.version, hash: source.hash, coverage: source.coverage, ...continuationDateFields(source, 'source') })),
    phase, lastSupportedPhase, proposedPhase, agentPhase: mapContinuationAgentPhase(packet.binding.workflowType, phase),
    workflowComplete: phase === 'complete', activeManagement: attention.some(item => ['open', 'unknown'].includes(item.status)),
    attention, reviewReasons, conflicts, unknownRecordIds: undated.map(record => record.id),
    confirmedFacts: facts, proposedFacts: packet.facts.filter(fact => fact.authority === 'proposed'), obligations,
    proposedObligations: packet.obligations.filter(obligation => obligation.authority === 'proposed'),
    evidenceReferences: packet.evidence.map(evidence => ({ id: evidence.id, sourceId: evidence.sourceId, sourceUrl: evidence.sourceUrl, ...continuationDateFields(evidence, 'source') })),
    nextParty: next[0], nextAction: next[1], canExecute: false, requiresHumanReview: reviewReasons.length > 0 || attention.some(item => item.status === 'unknown')
  };
}
export function validateContinuationHandoff(handoff, current, { now = new Date().toISOString() } = {}) {
  keys(handoff, ['binding', 'revisions', 'asOf', 'validUntil', 'phaseVersion', 'contextFingerprint'], 'CONTINUATION_HANDOFF_INVALID');
  requireThat(instant(now) && current.freshness === 'current' && Date.parse(now) < Date.parse(current.validUntil)
    && HASH.test(current.contextFingerprint || '') && handoff.contextFingerprint === current.contextFingerprint
    && handoff.phaseVersion === current.phaseVersion && handoff.asOf === current.asOf && handoff.validUntil === current.validUntil
    && sameContinuationBinding(handoff.binding, current.binding)
    && canonicalContinuationJSON(handoff.revisions) === canonicalContinuationJSON(current.revisions), 'CONTINUATION_HANDOFF_STALE');
  return structuredClone(handoff);
}
