const CAMPAIGN_TYPES = new Set(['', 'paid', 'seeding', 'affiliate', 'other']);
const CAMPAIGN_STATUSES = new Set(['', 'planning', 'active', 'paused', 'closeout', 'completed', 'cancelled', 'archived']);

export function campaignViewStorageKey(userId) {
  return `byouiq:campaign-views:${String(userId || 'demo').replace(/[^a-z0-9-]/gi, '')}`;
}

export function readCampaignViews(storage, userId) {
  try {
    const parsed = JSON.parse(storage.getItem(campaignViewStorageKey(userId)) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(view => view && typeof view.name === 'string' && view.name.length <= 40
      && typeof view.q === 'string' && view.q.length <= 100
      && CAMPAIGN_TYPES.has(view.type) && CAMPAIGN_STATUSES.has(view.status)).slice(0, 12);
  } catch { return []; }
}

export function saveCampaignView(storage, userId, name, { q = '', type = '', status = '' } = {}) {
  const normalized = String(name || '').trim().replace(/\s+/g, ' ');
  if (!normalized || normalized.length > 40) throw new Error('Name this view in 40 characters or fewer.');
  if (String(q).length > 100 || !CAMPAIGN_TYPES.has(type) || !CAMPAIGN_STATUSES.has(status)) {
    throw new Error('These campaign filters cannot be saved.');
  }
  const views = readCampaignViews(storage, userId).filter(view => view.name.toLocaleLowerCase() !== normalized.toLocaleLowerCase());
  if (views.length >= 12) throw new Error('You can save up to 12 campaign views.');
  views.push({ name: normalized, q: String(q), type, status });
  storage.setItem(campaignViewStorageKey(userId), JSON.stringify(views));
  return views;
}

export function deleteCampaignView(storage, userId, name) {
  const views = readCampaignViews(storage, userId).filter(view => view.name !== name);
  storage.setItem(campaignViewStorageKey(userId), JSON.stringify(views));
  return views;
}

export const CREATOR_TABLE_COLUMNS = Object.freeze(['collaboration', 'accounts', 'history', 'deal']);
const CREATOR_SORTS = new Set(['complete', 'followers_desc', 'followers_asc', 'campaigns_desc', 'campaigns_asc', 'rate_desc', 'rate_asc']);
const CREATOR_COLLABORATIONS = new Set(['', 'paid', 'seeding', 'both']);
const CREATOR_EMAIL_AVAILABILITY = new Set(['', 'has_email', 'no_email']);
const CREATOR_AGENCIES = new Set(['', 'bsm', 'day_one', 'other']);
const creatorKey = (userId, suffix) => `${campaignViewStorageKey(userId).replace('campaign-views', 'creator-library')}:${suffix}`;

export function readCreatorColumns(storage, userId) {
  try {
    const columns = JSON.parse(storage.getItem(creatorKey(userId, 'columns')) || 'null');
    return Array.isArray(columns) && columns.length && columns.every(value => CREATOR_TABLE_COLUMNS.includes(value))
      ? [...new Set(columns)] : [...CREATOR_TABLE_COLUMNS];
  } catch { return [...CREATOR_TABLE_COLUMNS]; }
}

export function saveCreatorColumns(storage, userId, columns) {
  const selected = [...new Set(columns)].filter(value => CREATOR_TABLE_COLUMNS.includes(value));
  if (!selected.length) throw new Error('Keep at least one comparison column.');
  storage.setItem(creatorKey(userId, 'columns'), JSON.stringify(selected));
  return selected;
}

export function readCreatorViews(storage, userId) {
  try {
    const views = JSON.parse(storage.getItem(creatorKey(userId, 'views')) || '[]');
    if (!Array.isArray(views)) return [];
    return views.filter(view => view && typeof view.name === 'string' && view.name.length <= 40
      && typeof view.q === 'string' && view.q.length <= 100
      && CREATOR_COLLABORATIONS.has(view.collaboration) && CREATOR_AGENCIES.has(view.agency||'') && CREATOR_EMAIL_AVAILABILITY.has(view.emailAvailability||'') && CREATOR_SORTS.has(view.sort)
      && typeof view.platform === 'string' && typeof view.campaign === 'string'
      && typeof view.stage === 'string' && Array.isArray(view.brands)).slice(0, 12);
  } catch { return []; }
}

export function saveCreatorView(storage, userId, name, filters) {
  const normalized = String(name || '').trim().replace(/\s+/g, ' ');
  if (!normalized || normalized.length > 40) throw new Error('Name this view in 40 characters or fewer.');
  if (!CREATOR_COLLABORATIONS.has(filters.collaboration) || !CREATOR_AGENCIES.has(filters.agency||'') || !CREATOR_EMAIL_AVAILABILITY.has(filters.emailAvailability||'') || !CREATOR_SORTS.has(filters.sort)) throw new Error('These creator filters cannot be saved.');
  const views = readCreatorViews(storage, userId).filter(view => view.name.toLocaleLowerCase() !== normalized.toLocaleLowerCase());
  if (views.length >= 12) throw new Error('You can save up to 12 creator views.');
  views.push({name:normalized,q:String(filters.query||'').slice(0,100),platform:String(filters.platform||''),
    collaboration:filters.collaboration,agency:filters.agency||'',emailAvailability:filters.emailAvailability||'',brands:[...(filters.brands||[])],campaign:String(filters.campaign||''),
    stage:String(filters.stage||''),sort:filters.sort,costcoOnly:filters.costcoOnly===true});
  storage.setItem(creatorKey(userId, 'views'), JSON.stringify(views));
  return views;
}

export function deleteCreatorView(storage, userId, name) {
  const views = readCreatorViews(storage, userId).filter(view => view.name !== name);
  storage.setItem(creatorKey(userId, 'views'), JSON.stringify(views));
  return views;
}
