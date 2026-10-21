import {displayDate,displayDateTime} from './date-format.mjs';
import {materialIcon} from './material-icons.mjs';
import {renderCreatorInsights} from './creator-insights.mjs';
import { socialIcon } from './social-icons.mjs';
import {renderCreatorIntake,renderCreatorIntakeBadge} from './creator-intake.mjs';
import {safeProfilePhoto} from './creator-photo.mjs';
import {creatorCollaborationType} from './creator-collaboration.mjs';
import {creatorDeals,creatorSourceObservations,creatorQuotes,filterCreatorDeals,comparableDealRange,overlapDealGroups} from './creator-deals.mjs';
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function creatorDisplayLabel(c={}){
 const values=[c.displayName,c.creatorDisplayName,c.creatorHandle,c.handle,...(c.accounts||[]).map(a=>a.handle)];
 return values.find(v=>typeof v==='string'&&v.trim()&&!/^IMP[-_]/i.test(v.trim()))||'Creator name not recorded';
}
function avatar(c){
  const photo=safeProfilePhoto(c.photoDataUrl),initials=c.displayName?.replace(/^[^a-z0-9]+/i,'').slice(0,2).toUpperCase()||'CR';
  return `<span class="cl-avatar"><span aria-hidden="true">${esc(initials)}</span>${photo?`<img src="${photo}" alt="${esc(c.displayName)} profile photo" data-library-photo />`:''}</span>`;
}
const platformName = p => ({instagram:'Instagram',tiktok:'TikTok',youtube:'YouTube',facebook:'Facebook'}[p] || 'Other');
const platformMark = socialIcon;
const number = v => v === null || v === undefined || !Number.isFinite(Number(v)) ? 'Not recorded' : Number(v).toLocaleString();
const money = (v,currency,currencyBasis=null) => {
  if(v===null||v===undefined)return 'Not recorded';
  if(currencyBasis==='dollar_symbol_only')return `$${number(v)}`;
  if(['import_default_usd','source_workbook_usd_default'].includes(currencyBasis))return `${number(v)} · currency assumed by import`;
  return currency?number(v):`${number(v)} · currency not recorded`;
};
const creatorCategoryLabels=new Map([["skincare","Skin Care"],["haircare","Hair Care"],["makeup","Makeup"],["bodycare","Body Care"],["fragrance","Fragrance"],["wellness","Wellness"],["lifestyle","Lifestyle"]]);
const creatorCategoryMarkup=(values=[],limit=values.length)=> (Array.isArray(values)?values:[]).slice(0,limit).map(value=>{const raw=String(value??"").trim(),key=raw.toLowerCase().replace(/[\s_-]+/g,""),known=creatorCategoryLabels.get(key);return raw?`<span ${known?'data-i18n':'data-no-translate'}>${esc(known||raw)}</span>`:"";}).filter(Boolean).join(" · ");
const campaignType = value => ['paid','seeding'].includes(String(value||'').toLowerCase()) ? String(value).toLowerCase() : 'unknown';
const campaignTypeBadge = value => {const type=campaignType(value);return `<span data-i18n data-i18n-context="campaign-type" class="cl-campaign-type cl-campaign-type--${type}">${{paid:'Paid',seeding:'Seeding',unknown:'Type not recorded'}[type]}</span>`;};
const campaignLegend = () => `<div class="cl-campaign-legend" aria-label="Campaign types"><strong data-i18n>Campaign types</strong>${campaignTypeBadge('paid')}${campaignTypeBadge('seeding')}${campaignTypeBadge(null)}</div>`;
function workedCampaigns(creator){
  const campaigns=new Map();
  for(const relationship of creator.relationships||[]){
    if(!['participated','delivered'].includes(relationship.stage))continue;
    const name=relationship.campaignName||'Campaign name not recorded';
    const matching=(creator.history||[]).find(item=>item.campaign_name===name);
    const key=relationship.campaignId||name;
    campaigns.set(key,{name,type:relationship.campaignType||relationship.campaign_type||matching?.campaign_type,stage:relationship.stage});
  }
  for(const assignment of creator.history||[]){
    if(!(creator.posts||[]).some(post=>post.assignment_id===assignment.id))continue;
    if([...campaigns.values()].some(item=>item.name===assignment.campaign_name))continue;
    campaigns.set(assignment.id||assignment.campaign_name,{name:assignment.campaign_name||'Campaign name not recorded',type:assignment.campaign_type,stage:'participated'});
  }
  return [...campaigns.values()];
}
function workedCampaignList(creator){
  const campaigns=workedCampaigns(creator);
  return `<section class="cl-commercial-campaigns"><h3 data-i18n>Campaigns worked with BYOU</h3><div class="cl-worked-campaigns">${campaigns.map(item=>`<div class="cl-worked-campaign cl-worked-campaign--${campaignType(item.type)}"><strong data-no-translate>${esc(item.name)}</strong>${campaignTypeBadge(item.type)}<small data-i18n>${esc(stageNames[item.stage]||'Participation recorded')}</small></div>`).join('')||'<p class="cl-empty-inline" data-i18n>No campaign participation recorded.</p>'}</div></section>`;
}
const dealCampaignType = (deal,creator) => (creator.history||[]).find(item=>item.id===deal.assignmentId||item.campaign_name===deal.campaign)?.campaign_type || (creator.relationships||[]).find(item=>item.campaignName===deal.campaign)?.campaignType || null;
const paymentLabel = status => ({paid:'Paid',partially_paid:'Partially paid',payment_scheduled:'Payment scheduled',invoice_received:'Invoice received',invoice_requested:'Invoice requested',requested:'Invoice requested',not_requested:'Not recorded',unknown:'Not recorded',not_recorded:'Not recorded',not_verified:'Not recorded',needs_review:'Needs review'}[status] || 'Needs review');
const feeRecordLabel = deal => deal.kind==='source'?(deal.feeKind==='verified_import_cell'?'Verified sheet fee cell':'Spreadsheet package fee'):'Staff-recorded campaign agreement';
const realPaymentEvidence = deal => (deal.paymentEvidence||[]).filter(item=>!item.importedPlaceholder);
const dealPaymentLabel = deal => realPaymentEvidence(deal).length?paymentLabel(deal.paymentStatus):deal.kind==='source'?(deal.sourceStatusRaw||paymentLabel(deal.paymentStatus)):paymentLabel(deal.paymentStatus);
const sheetStatus = deal => deal.kind==='source'?deal.sourceStatusRaw||null:null;
const zeroQuoteNote = quote => quote.kind==='rate_card'&&quote.sourceKind==='staff_record'&&quote.amount!==null&&quote.amount!==undefined&&Number(quote.amount)===0?'<small>Staff-entered $0 · intent unconfirmed</small>':'';
const date = v => displayDate(v,'UTC','Date not recorded');
export const createCreatorLibraryState = () => ({items:[],total:null,offset:0,limit:8,viewMode:'gallery',tableColumns:['collaboration','accounts','history','deal'],savedViews:[],overlapReviews:[],overlapReviewError:null,overlapReviewSaving:false,selectedCreators:[],dropCampaigns:[],dropCampaignsLoaded:false,dropBusy:false,dropPending:null,query:'',nameQuery:'',aiPlan:null,interpretation:null,platform:'',collaboration:'',agency:'',emailAvailability:'',brands:[],campaign:'',stage:'',sort:'complete',filtersExpanded:false,filters:{brands:[],campaigns:[]},costcoOnly:false,loading:false,error:null,exportBusy:false,selected:null,selectedDealId:null,activePlayerId:null,showManaged:false,capturedAt:null,snapshot:false,profileTab:'overview',commercialView:'deals',commercialPlatform:'',commercialFormat:'',commercialCampaign:'',commercialFrom:'',commercialTo:''});
const stageNames={contacted:'Contacted',participated:'Participated',delivered:'Delivered',unconfirmed:'History unconfirmed'};
const stageHelp={contacted:'Contact recorded; participation not confirmed',participated:'Participation recorded; content delivery not verified',delivered:'Verified creator content linked to this campaign',unconfirmed:'Campaign record exists; contact or participation is not confirmed'};
function brandBadges(c){
  const brands=new Map();
  for(const r of c.relationships||[]){
    const key=r.brandKey||'unknown';
    if(!brands.has(key))brands.set(key,{name:r.brandName||'Brand unrecorded',stages:new Set()});
    brands.get(key).stages.add(Object.hasOwn(stageNames,r.stage)?r.stage:'unconfirmed');
  }
  return `<div class="cl-brand-badges" aria-label="Brand history">${[...brands.values()].map(b=>`<div class="cl-brand-badge"><strong>${esc(b.name)}</strong>${[...b.stages].map(stage=>`<span class="cl-stage cl-stage--${stage}" title="${esc(stageHelp[stage])}">${stageNames[stage]}</span>`).join('')}</div>`).join('')||'<span class="cl-muted">No campaign history recorded</span>'}</div>`;
}
function brandFilters(s){
  const chosen=s.brands||[],facets=s.filters||{brands:[],campaigns:[]};
  const campaigns=(facets.campaigns||[]).filter(c=>!chosen.length||chosen.includes(c.brandKey));
  return `<section class="cl-brand-filters" aria-label="Brand and campaign filters"><button type="button" class="cl-filter-toggle" data-action="library-toggle-filters" aria-expanded="${s.filtersExpanded?'true':'false'}" aria-controls="creator-brand-options"><span aria-hidden="true">${s.filtersExpanded?'▾':'▸'}</span> Brands <small>${chosen.length?`${chosen.length} selected · Match ${s.aiPlan?.brandMatch==='any'?'any':'every'} selected brand`:'All brands'}</small></button><div id="creator-brand-options" ${s.filtersExpanded?'':'hidden'}><fieldset><legend class="sr-only">Brands</legend><div class="cl-brand-options">${(facets.brands||[]).map(b=>`<label><input type="checkbox" form="creator-library-search" name="brand" value="${esc(b.key)}" ${chosen.includes(b.key)?'checked':''} /><span>${esc(b.name)}</span></label>`).join('')||'<span class="cl-muted">Brand options will appear when the directory loads.</span>'}</div></fieldset></div><div class="cl-history-filters"><label>Campaign<select form="creator-library-search" name="campaign"><option value="">All campaigns</option>${campaigns.map(c=>`<option value="${esc(c.id)}" ${s.campaign===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label><label>Campaign relationship<select form="creator-library-search" name="stage"><option value="">Any recorded relationship</option>${Object.entries(stageNames).map(([key,label])=>`<option value="${key}" ${s.stage===key?'selected':''}>${label}${key==='contacted'?' only':key==='participated'?' (delivery unverified)':''}</option>`).join('')}</select></label><button type="button" class="button button--secondary" data-action="library-clear-filters" ${!chosen.length&&!s.campaign&&!s.stage?'disabled':''}>Clear brand and campaign filters</button></div></section>`;
}
export function safeSocialLink(value) {
  try { const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&['instagram.com','www.instagram.com','tiktok.com','www.tiktok.com','youtube.com','www.youtube.com','youtu.be','facebook.com','www.facebook.com'].includes(u.hostname)?u.href:null; } catch{return null;}
}
export function postThumbnail(post) {
  const saved=safeProfilePhoto(post.thumbnailDataUrl);if(saved)return saved;
  const url=safeSocialLink(post.url);if(!url)return null;
  const u=new URL(url);
  if(!['youtube.com','www.youtube.com','youtu.be'].includes(u.hostname))return null;
  const id=u.hostname==='youtu.be'?u.pathname.split('/')[1]:u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1];
  return /^[A-Za-z0-9_-]{11}$/.test(id||'')?`https://i.ytimg.com/vi/${id}/mqdefault.jpg`:null;
}
const sourceLink = url => {
  try{const u=new URL(url);if(u.protocol==='https:'&&u.hostname==='docs.google.com'&&!u.username&&!u.password)return `<a href="${esc(u.href)}" target="_blank" rel="noopener noreferrer">Source row ↗</a>`;}catch{}
  return '';
};
const feeSourceLink = url => sourceLink(url).replace('Source row ↗','Fee cell ↗');
const statusSourceLink = url => sourceLink(url).replace('Source row ↗','Status cell ↗');
function feeLocation(deal){
  const direct=feeSourceLink(deal.sourceUrl)||rateSourceLink(deal.sourceUrl);
  const verified='';
  const captured=deal.capturedSourceUrl&&deal.capturedSourceUrl!==deal.sourceUrl?feeSourceLink(deal.capturedSourceUrl).replace('Fee cell ↗','Captured fee cell ↗'):'';
  if(direct)return `${direct}${verified}${captured}`;
  if(!deal.sourceTab&&!deal.sourceRow)return '';
  const tab=deal.sourceTab||'Tab not recorded',row=deal.sourceRow?` · row ${deal.sourceRow}`:'';
  const tabLink=sourceLink(deal.sourceTabUrl).replace('Source row ↗','Source tab ↗');
  return `<p>${esc(tab+row)} · Exact fee cell not verified ${tabLink}</p>`;
}
const badges = accounts => [...new Set((accounts||[]).map(a=>a.platform))].map(p=>`<span class="cl-platform cl-platform--${['instagram','tiktok','youtube','facebook'].includes(p)?p:'other'}">${platformMark(p)}<span>${platformName(p)}</span></span>`).join('');
export function displayAccounts(accounts=[]){
  const groups=new Map();
  for(const [index,account] of accounts.entries()){
    const identity=String(account.handle||'').trim().replace(/^@/,'').toLowerCase()||safeSocialLink(account.url)?.replace(/\/$/,'').toLowerCase()||`unknown-${index}`;
    const key=`${String(account.platform||'').toLowerCase()}:${identity}`;
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(account);
  }
  return [...groups.values()].map(group=>{
    const ranked=[...group].sort((a,b)=>{
      const knownA=a.followers!==null&&a.followers!==undefined,knownB=b.followers!==null&&b.followers!==undefined;
      if(knownA!==knownB)return knownA?-1:1;
      const dateA=String(a.followersAsOf||a.observedAt||''),dateB=String(b.followersAsOf||b.observedAt||'');
      if(dateA!==dateB)return dateB.localeCompare(dateA);
      const priority=source=>({crm:3,socialcrawl:2,paid_spreadsheet:1}[source]||0);
      return priority(b.followersSource)-priority(a.followersSource);
    });
    const selectedDate=String(ranked[0]?.followersAsOf||ranked[0]?.observedAt||'');
    const sameObservation=ranked.filter(a=>String(a.followersAsOf||a.observedAt||'')===selectedDate);
    const counts=new Set(sameObservation.map(a=>a.followers).filter(v=>v!==null&&v!==undefined));
    const urls=new Set(group.map(a=>safeSocialLink(a.url)?.toLowerCase().replace(/\/$/,'')).filter(Boolean));
    return {...ranked[0],followersConflict:counts.size>1,identityReview:urls.size>1,observations:ranked};
  });
}
const followerBadges = accounts => displayAccounts(accounts).map(a=>`<span class="cl-follower"><span class="social-platform-label">${socialIcon(a.platform)}<span data-i18n data-i18n-context="platform">${platformName(a.platform)}</span></span>${a.handle?`<small data-no-translate>${esc(a.handle.startsWith('@')?a.handle:'@'+a.handle)}</small>`:''}<strong data-no-translate>${number(a.followers)}</strong><small>${a.identityReview?'Account identity needs review':a.followersConflict?'Conflicting same-date figures':a.followersSource==='paid_spreadsheet'?'followers · sheet figure':a.followersSource==='socialcrawl'?`followers · SocialCrawl${a.followersApproximate?' (approx.)':''} · ${date(a.followersAsOf)}`:'recorded followers'}</small></span>`).join('');
const rateSourceLink = url => {
  try{const u=new URL(url);if(u.protocol==='https:'&&['docs.google.com','drive.google.com','mail.google.com'].includes(u.hostname)&&!u.username&&!u.password&&!u.port)return `<a href="${esc(u.href)}" target="_blank" rel="noopener noreferrer">Source record ↗</a>`;}catch{}
  return '';
};
const cardRate = c => {const rate=c.recordedRate;return rate?`<div class="cl-rate-summary"><small>Recorded rate</small><strong>${esc(money(rate.amount,rate.currency))}</strong><span>${esc(rate.basis)}${rate.postCount?` · ${number(rate.postCount)} posts`:''}</span><small>${rate.recordedOn?esc(date(rate.recordedOn))+' · ':''}Payment not verified</small></div>`:c.recordedRateAvailable?'<div class="cl-rate-summary"><strong>Rates available</strong><span>View spreadsheet rate quotes in the full profile</span></div>':'';};
function sourceRateQuotes(c){
  if(!(c.sourceRateQuotes||[]).length)return '';
  const quoted=value=>String(value||'Not recorded').split(/\r?\n/).map(esc).join('<br>');
  return `<section class="cl-section"><h2>Spreadsheet rate quotes</h2><p class="cl-muted">Original rate options from the spreadsheet. Package descriptions are preserved as written; these are not payment confirmations.</p><div class="cl-fees">${c.sourceRateQuotes.map(quote=>`<article><h3>Standard rates</h3><p>${quoted(quote.standardRates)}</p><h3>Negotiated rates</h3><p>${quoted(quote.negotiatedRates)}</p><p>Last negotiated: ${esc(quote.lastNegotiatedOn||'Not recorded')}</p>${rateSourceLink(quote.sourceUrl)}<small>Read ${esc(date(quote.capturedAt))}</small></article>`).join('')}</div></section>`;
}
function rateCards(c){
  return `<section class="cl-section"><h2>Recorded rate cards</h2><p class="cl-muted">Quotes and historical rates are separate from agreed deliverable fees and payment confirmation.</p>${(c.rateCards||[]).length?`<div class="cl-fees">${c.rateCards.map(rate=>`<article><h3>${esc(rate.deliverableType||'Recorded quote')}</h3><strong>${esc(money(rate.quotedRate,rate.currency))}</strong><p>${rate.platform?platformName(rate.platform)+' · ':''}${esc(rate.status||'Status not recorded')}</p><p>Effective ${esc(date(rate.effectiveOn))}${rate.expiresOn?' · expires '+esc(date(rate.expiresOn)):''}</p><small>${rate.sourceKind==='staff_record'?'Staff record':rate.sourceKind==='assignment_terms'?'Recorded assignment terms':'Imported source record'}${rate.sourceDate?' · source dated '+esc(date(rate.sourceDate)):''}</small>${rateSourceLink(rate.sourceUrl)}<small>Quote only · Payment not verified</small></article>`).join('')}</div>`:'<p class="cl-empty-inline">No rate card is recorded for this creator.</p>'}</section>`;
}
const historyTiming=(h,c)=>{
  const days=[...new Set((c.posts||[]).filter(p=>p.assignment_id===h.id&&p.published_at).map(p=>date(p.published_at)))].sort();
  return days.length?`Posted ${days[0]}${days.length>1?' — '+days.at(-1):''}`:h.start_date||h.end_date?`Campaign ${date(h.start_date)} — ${date(h.end_date)}`:'Date not recorded';
};
export function embedUrl(post) {
  const url=safeSocialLink(post.url);if(!url)return null;
  const u=new URL(url),host=u.hostname.replace(/^www\./,'');
  if(['youtube.com','youtu.be'].includes(host)){
    const id=host==='youtu.be'?u.pathname.split('/')[1]:u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1];
    return /^[A-Za-z0-9_-]{11}$/.test(id||'')?`https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0&autoplay=1`:null;
  }
  if(host==='tiktok.com'){
    const id=u.pathname.match(/^\/@[^/]+\/video\/(\d{10,25})\/?$/)?.[1];
    return id?`https://www.tiktok.com/player/v1/${id}?autoplay=1&controls=1&description=1`:null;
  }
  if(host==='instagram.com'){
    const id=u.pathname.match(/^\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)\/?$/)?.[1];
    return null; // Instagram may reject embedded navigation; use the original-post link.
  }
  if(host==='facebook.com'&&/^\/(?:reel\/\d+|[^/]+\/videos\/\d+)\/?$/.test(u.pathname))return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
  return null;
}
export function postIdentity(raw) {
  const value=safeSocialLink(raw);if(!value)return null;
  const u=new URL(value),host=u.hostname.replace(/^www\./,'');
  if(['youtube.com','youtu.be'].includes(host)){
    const id=host==='youtu.be'?u.pathname.split('/')[1]:u.searchParams.get('v')||u.pathname.match(/^\/shorts\/([^/]+)/)?.[1];
    if(id)return `youtube:${id}`;
  }
  if(host==='instagram.com'){const id=u.pathname.match(/^\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)\/?$/)?.[1];if(id)return `instagram:${id}`;}
  if(host==='facebook.com'&&u.pathname.replace(/\/$/,'')==='/watch'){
    const id=u.searchParams.get('v');return /^\d{5,30}$/.test(id||'')?`facebook:${id}`:null;
  }
  return `${host}${u.pathname.replace(/\/$/,'')}`;
}
export function profileDeliverables(c){
  const byUrl=new Map();
  for(const p of c.posts||[])byUrl.set(postIdentity(p.url)||p.id,{...p,verified:true,sheetRows:[]});
  for(const r of c.sourceRows||[]){
    const key=postIdentity(r.url);if(!key)continue;
    if(!byUrl.has(key))byUrl.set(key,{id:`source:${r.sourceUrl}`,url:r.url,platform:r.platform,campaign_name:r.sheet,published_at:null,verified:false,metrics:[],sheetRows:[]});
    byUrl.get(key).sheetRows.push(r);
  }
  return [...byUrl.values()].map(p=>({...p,packages:(c.sourcePackages||[]).filter(pkg=>pkg.sourceCellScope==='single_creator'&&(pkg.postUrls||[]).some(url=>postIdentity(url)===postIdentity(p.url))),agreement:(c.history||[]).find(h=>h.id===p.assignment_id)})).sort((a,b)=>String(b.published_at||'').localeCompare(String(a.published_at||''))||String(a.id).localeCompare(String(b.id)));
}
export function displayMetric(post,code){
  const observed=(post.metrics||[]).filter(m=>m.code===code&&m.value!==null&&m.value!==undefined).sort((a,b)=>String(b.observedAt||'').localeCompare(String(a.observedAt||'')))[0];
  if(observed)return {value:observed.value,label:`Observed ${date(observed.observedAt)}`};
  const row=(post.sheetRows||[]).filter(r=>r.metrics?.[code]!==null&&r.metrics?.[code]!==undefined).sort((a,b)=>String(b.capturedAt||'').localeCompare(String(a.capturedAt||'')))[0];
  return row?{value:row.metrics[code],label:`Sheet figure · read ${date(row.capturedAt)}`}:{value:null,label:'No recorded figure'};
}
function deliverable(post,activePlayerId){
  const embed=embedUrl(post),url=safeSocialLink(post.url),loaded=embed&&activePlayerId===post.id;
  const published=post.published_at?date(post.published_at):post.sheetRows.find(r=>r.sourceDate)?.sourceDate||'Date not recorded';
  const packageFees=post.packages.map(p=>money(p.amount,p.currency,p.currencyBasis));
  return `<article class="cl-deliverable"><div class="cl-player-column"><div class="cl-player-shell ${post.platform==='youtube'?'cl-player-shell--wide':''}">${loaded?`<iframe src="${esc(embed)}" title="${esc(post.campaign_name)} ${platformName(post.platform)} deliverable player" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"></iframe>`:`${tile(post)}${embed?`<button class="cl-play-button" data-action="library-play" data-id="${esc(post.id)}"><span aria-hidden="true">▶</span> Play deliverable</button>`:'<span class="cl-player-note">Open the original link to play this post</span>'}`}</div>${url?`<a class="cl-original" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Open original post ↗</a>`:''}${loaded?'<small class="cl-playback-note">If the platform blocks playback here, use the original post link.</small>':''}</div><div class="cl-deliverable-info"><span class="cl-evidence-label">${post.verified?'Verified BYOU post':'Spreadsheet-listed deliverable'}</span><h3>${esc(post.campaign_name||'BYOU collaboration')}</h3><p class="cl-deliverable-date">${platformName(post.platform)} · Posted ${esc(published)}</p>${packageFees.length?`<div class="cl-deliverable-rate">${packageFees.map(r=>`<strong>${esc(r)}</strong>`).join('')}</div>`:''}<div class="cl-performance">${['views','likes','comments'].map(code=>{const m=displayMetric(post,code);return `<div><span>${code[0].toUpperCase()+code.slice(1)}</span><strong>${number(m.value)}</strong><small>${esc(m.label)}</small></div>`;}).join('')}</div><div class="cl-extra-metrics">${['saves','shares'].map(code=>{const m=displayMetric(post,code);return `<span>${number(m.value)} ${code}</span>`;}).join('')}</div><div class="cl-deliverable-sources">${post.sheetRows.map(r=>sourceLink(r.sourceUrl)).join(' ')}</div></div></article>`;
}
function tile(post,{detail=false,cardPreview=false,activePlayerId=null}={}){
  const url=safeSocialLink(post.url),thumbnail=postThumbnail(post);
  const embed=cardPreview&&typeof post.id==='string'&&post.id?embedUrl(post):null;
  const loaded=embed&&activePlayerId===post.id;
  const content=`<span class="cl-preview-fallback"><b aria-hidden="true">${platformMark(post.platform)}</b><span>Open ${platformName(post.platform)} post</span><small>${embed?'Preview not loaded':'Preview unavailable'}</small></span>${thumbnail?`<img src="${esc(thumbnail)}" alt="${esc(post.campaign_name||'BYOU')} post preview" loading="lazy" referrerpolicy="no-referrer" data-library-thumbnail />`:''}<span class="cl-post-platform" aria-label="${platformName(post.platform)}">${platformMark(post.platform)}</span>`;
  const preview=url?`<a class="cl-post-preview" href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(post.campaign_name||'BYOU')} ${platformName(post.platform)} post">${content}</a>`:`<div class="cl-post-preview">${content}</div>`;
  if(cardPreview&&embed)return `<div class="cl-card-video cl-card-video--active"><div class="cl-card-video-player${post.platform==='youtube'?' cl-card-video-player--wide':''}"><iframe src="${esc(embed.replace('autoplay=1','autoplay=0'))}" title="${esc(post.campaign_name||'BYOU')} ${platformName(post.platform)} video preview" allow="encrypted-media; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"></iframe></div><a class="cl-card-video-original" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Open original post ↗</a></div>`;
  if(!detail)return preview;
  return `<article class="cl-post-detail">${preview}<h3>${esc(post.campaign_name||'BYOU collaboration')}</h3><p>${esc(post.deliverable_type||'Post')} · ${esc(date(post.published_at))}</p><div class="cl-metrics">${(post.metrics||[]).map(m=>`<span><strong>${number(m.value)}</strong>${esc(m.code)}<small>Observed ${esc(date(m.observedAt))}</small></span>`).join('')||'<span>Performance not recorded</span>'}</div></article>`;
}
function cardFollowers(c){
  return displayAccounts(c.accounts).map(a=>{
    const source=a.followersSource==='socialcrawl'?'SocialCrawl':a.followersSource==='paid_spreadsheet'?'Source spreadsheet':'CRM record';
    const handle=a.handle?('@'+a.handle.replace(/^@/,'')):'';
    return `<span title="${esc([source,handle,a.followersAsOf?date(a.followersAsOf):'',a.followersConflict?'Conflicting saved figures':''].filter(Boolean).join(' · '))}">${socialIcon(a.platform)} ${platformName(a.platform)} · <strong>${number(a.followers)}</strong> followers${a.followersApproximate?' (approx.)':''}</span>`;
  }).join('')||'<span>Followers not recorded</span>';
}
function portfolioTile(post){
  if(!post)return '<div class="cl-portfolio-blank" aria-label="No BYOU post recorded"></div>';
  const url=safeSocialLink(post.url),thumbnail=postThumbnail(post);
  const title=post.source==='socialcrawl_portfolio'?'Public portfolio':post.campaign_name||'BYOU campaign';
  const body=`<span class="cl-portfolio-empty"><span aria-hidden="true">▷</span><small>Preview unavailable</small></span>${thumbnail?`<img src="${esc(thumbnail)}" alt="${esc(post.campaign_name||'BYOU')} video thumbnail" loading="eager" referrerpolicy="no-referrer" data-library-thumbnail />`:''}<span class="cl-portfolio-caption"><strong>${esc(title)}</strong><small>${platformName(post.platform)}${post.published_at?' · '+date(post.published_at):''}</small></span>`;
  return url?`<a class="cl-portfolio-tile" href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(post.campaign_name||'BYOU')} ${platformName(post.platform)} post">${body}</a>`:`<div class="cl-portfolio-tile">${body}</div>`;
}
// The library and campaign roster share the same profile presentation. Callers
// supply already-rendered controls so selection stays with its own workflow.
function emailStatus(creator){
  const status=creator.hasEmail===true?'available':creator.hasEmail===false?'missing':'unknown';
  const label={available:'Email available',missing:'No email saved',unknown:'Email availability unknown'}[status];
  return `<span class="cl-email-status cl-email-status--${status}" role="img" aria-label="${label}" title="${label}">${materialIcon('mail')}<span class="cl-email-status-mark" aria-hidden="true">${status==='unknown'?'?':materialIcon(status==='available'?'check':'close')}</span></span>`;
}
export function renderCreatorCardContent(c,s={},controls={}){
  const selected=(s.selectedCreators||[]).some(item=>item.id===c.id);
  const latest=c.latestCollaboration,posts=[...(c.posts||[]),...(c.portfolioPosts||[])].slice(0,2);
  const type=creatorCollaborationType(c),typeLabel={paid:'Paid creator',seeding:'Seeding creator',both:'Paid + seeding',none:'No recorded collaboration'}[type];
  const agency=c.agencyCode==='bsm'?'bsm':c.agencyCode==='day_one'?'day_one':null;
  const agencyTag=agency?`<span class="cl-agency-tag cl-agency-tag--${agency}" title="Source-confirmed creator agency">${agency==='bsm'?'BSM':'Day One'}</span>`:'';
  const fee=c.latestFeeRecord||((latest?.amount!==null&&latest?.amount!==undefined)?latest:null);
  const hasLatestFee=fee?.amount!==null&&fee?.amount!==undefined;
  const feeDisplay=hasLatestFee?money(fee.amount,fee.currency,fee.currencyBasis):type==='seeding'?'Seeding':'Not recorded';
  const selection=controls.selection??`<label class="cl-select-card" title="Select creator"><input type="checkbox" data-library-select="${esc(c.id)}" aria-label="Select ${esc(c.displayName)}" ${selected?'checked':''} ${s.selectionBusy?'disabled':''} /></label>`;
  const heading=controls.heading??`<button class="cl-name" data-no-translate data-action="library-open" data-id="${esc(c.id)}"><strong>${esc(c.displayName)}</strong></button>`;
  const identityHeading=`<div class="cl-card-name-row">${heading}${emailStatus(c)}</div>`;
  const footer=controls.footer??`<button class="cl-open" data-i18n data-action="library-open" data-id="${esc(c.id)}">View full profile <span aria-hidden="true">↗</span></button>`;
  if(controls.compact){
    const accounts=displayAccounts(c.accounts).map(a=>`<span>${socialIcon(a.platform)} ${platformName(a.platform)}${a.followers!==null&&a.followers!==undefined?' · '+number(a.followers)+' followers':''}</span>`).join('');
    return `${renderCreatorIntakeBadge(c,s.canImportAgencyRoster)}<div class="ops-card-identity">${avatar(c)}<div class="cl-card-identity">${identityHeading}</div>${selection}</div>${accounts?'<div class="ops-card-platforms" data-i18n>'+accounts+'</div>':''}${controls.hideVideos?"":`<div class="cl-portfolio-videos ${posts.length?'':'cl-portfolio-videos--empty'}">${posts.length?posts.map(portfolioTile).join(''):'<span>No posts yet</span>'}</div>`}${footer}`;
  }
  return `${renderCreatorIntakeBadge(c,s.canImportAgencyRoster)}<div class="cl-card-tags">${agencyTag}<span data-i18n data-i18n-context="collaboration-type" class="cl-collaboration-tag cl-collaboration-tag--${type}">${typeLabel}</span></div>${selection}<div class="cl-card-heading">${avatar(c)}<div class="cl-card-identity">${identityHeading}<div class="cl-compact-followers">${cardFollowers(c)}</div></div></div>${(c.categories||[]).length?`<p class="cl-portfolio-categories">${creatorCategoryMarkup(c.categories,2)}</p>`:''}<div class="cl-portfolio-facts"><div><small data-i18n>Latest fee record</small><strong>${esc(feeDisplay)}</strong></div><div><small data-i18n>Last BYOU campaign</small><strong ${latest?.campaignName?'data-no-translate':'data-i18n'}>${esc(latest?.campaignName||'No verified work')}</strong><small>${latest?.postedAt?esc(date(latest.postedAt)):latest?'Date not recorded':''}</small></div></div><div class="cl-portfolio-videos ${posts.length?"":"cl-portfolio-videos--empty"}">${posts.length?portfolioTile(posts[0])+portfolioTile(posts[1]):"No posts recorded"}</div>${footer}`;
}
function card(c,s){
  const selected=(s.selectedCreators||[]).some(item=>item.id===c.id);
  return `<article class="cl-card cl-portfolio-card ${selected?'is-selected':''}" data-creator-card="${esc(c.id)}" draggable="${!s.selectionBusy}">${renderCreatorCardContent(c,s)}</article>`;
}
function dealDetail(deal,quotes,creator){
  const linked=quotes.filter(quote=>deal.quoteIds?.includes(quote.id));
  return `<section class="cl-deal-detail" aria-label="Deal details"><div class="cl-section-heading"><div><p class="eyebrow">Deal details</p><h3>${esc(deal.campaign)}</h3>${campaignTypeBadge(dealCampaignType(deal,creator))}</div><button type="button" class="button button--secondary button--small" data-action="library-deal-close">Close details</button></div>
    <dl><div><dt>Fee source</dt><dd>${esc(feeRecordLabel(deal))}</dd></div><div><dt>Recorded amount</dt><dd>${esc(money(deal.amount,deal.currency,deal.currencyBasis))}</dd></div><div><dt>Recorded date</dt><dd>${esc(deal.dates.length?`${deal.dateLabel} ${deal.dates.map(date).join(' – ')}`:'Not recorded')}</dd></div><div><dt>Scope</dt><dd>${esc(deal.platforms.map(platformName).join(', ')||'Platform not recorded')} · ${deal.postCount?`${deal.postCount} linked post${deal.postCount===1?'':'s'}`:'Post count not recorded'} · ${esc(deal.formats.join(', ')||'Format not recorded')}</dd></div><div><dt>Usage rights</dt><dd>${esc(deal.rights||'Not recorded')}</dd></div><div><dt>Payment status</dt><dd>${esc(dealPaymentLabel(deal))}</dd></div></dl>
    <h4>Linked quote revisions</h4>${linked.length?linked.map(quote=>`<p>${esc(quote.title)} · ${esc(money(quote.amount,quote.currency))} · ${esc(quote.status)} · ${esc(date(quote.date))} ${rateSourceLink(quote.sourceUrl)}</p>`).join(''):'<p>No documented quote-to-deal link. Candidate rates remain separate.</p>'}
    <h4>Post links listed for this fee</h4>${deal.postUrls.length?deal.postUrls.map(url=>safeSocialLink(url)?`<p><a href="${esc(safeSocialLink(url))}" target="_blank" rel="noopener noreferrer">Open listed post ↗</a></p>`:'').join(''):'<p>No post-specific fee allocation recorded.</p>'}
    <h4>Fee and post sources</h4>${feeLocation(deal)}${deal.sourcePostUrl&&safeSocialLink(deal.sourcePostUrl)?`<p>Post URL in imported fee row: <a href="${esc(safeSocialLink(deal.sourcePostUrl))}" target="_blank" rel="noopener noreferrer">Open source-row post ↗</a></p>`:''}${sheetStatus(deal)?`<p>${esc(sheetStatus(deal))} ${statusSourceLink(deal.sourceStatusUrl)}</p>`:''}${deal.paymentProvenance?`<p>${esc(deal.paymentProvenance)}</p>`:''}${deal.sourceRows.map(row=>`<p>${row.rawStatus?`${esc(row.rawStatus)} · `:''}${esc(row.sourceDate||'Post date not recorded')} ${sourceLink(row.sourceUrl)}</p>`).join('')}
    ${deal.overlap?'<p class="cl-overlap">This post link is listed under more than one fee package. Check the post attribution in each source row. Each amount is a package fee, not a charge for each post.</p>':''}
    ${deal.kind==='assignment'&&deal.campaignId?`<button type="button" class="button button--secondary" data-action="library-edit-deal" data-campaign="${esc(deal.campaignId)}" data-assignment="${esc(deal.assignmentId)}">Open canonical campaign assignment</button>`:'<p class="cl-muted">Source claims are read only. Review the linked source evidence before changing a CRM agreement.</p>'}
  </section>`;
}
function dealEvidence(deal,scope){
  const payments=realPaymentEvidence(deal);
  const paid=deal.paymentSummary?.status==='partially_paid'&&payments.length?`<p>${esc(deal.paymentSummary.currency)} ${esc(deal.paymentSummary.paid)} recorded paid · ${esc(deal.paymentSummary.currency)} ${esc(deal.paymentSummary.remaining)} remaining across recorded payment items.</p>`:'';
  const paymentRows=payments.map(item=>`<p>Payment item ${esc(item.sequence)}: ${esc(item.currency)} ${esc(item.amount)} · ${esc(paymentLabel(item.workflowStatus==='paid'?'paid':item.workflowStatus==='scheduled'?'payment_scheduled':item.invoiceStatus))} · Due ${esc(date(item.dueDate))}${item.externalRecordPresent?' · External finance record noted':''}</p>`).join('');
  return `<div class="cl-deal-evidence"><p>${esc(scope(deal))}</p>${sheetStatus(deal)?`<p>${esc(sheetStatus(deal))} ${statusSourceLink(deal.sourceStatusUrl)}</p>`:''}${deal.paymentProvenance?`<p>${esc(deal.paymentProvenance)}</p>`:''}${paid}${paymentRows}${deal.overlap?'<p>This post link appears in more than one source package. Check the post attribution in each sheet row.</p>':''}<p>${deal.postUrls.length?`${deal.postUrls.length} post link${deal.postUrls.length===1?'':'s'} listed for this fee`:'No post links recorded'}</p>${deal.sourcePostUrl&&safeSocialLink(deal.sourcePostUrl)?`<p><a href="${esc(safeSocialLink(deal.sourcePostUrl))}" target="_blank" rel="noopener noreferrer">Open post ↗</a></p>`:''}${deal.sourceRows.map(row=>`<p>${row.rawStatus?`${esc(row.rawStatus)} · `:''}${esc(row.sourceDate||'Post date not recorded')} ${sourceLink(row.sourceUrl)}</p>`).join('')}${feeLocation(deal)}</div>`;
}
function dealTableRow(deal,creator,scope,dates){
  return `<tr><th scope="row"><strong>${esc(deal.campaign)}</strong>${campaignTypeBadge(dealCampaignType(deal,creator))}${deal.overlap?'<small class="cl-overlap">Post link listed under multiple fee packages · Review attribution</small>':''}</th><td>${esc(dates(deal))}</td><td>${esc(scope(deal))}</td><td class="cl-money">${esc(money(deal.amount,deal.currency,deal.currencyBasis))}</td><td>${esc(dealPaymentLabel(deal))}</td><td><details><summary>View details</summary>${dealEvidence(deal,scope)}</details></td></tr>`;
}
function sourceObservationTable(c){
  const observations=creatorSourceObservations(c);
  const observedValue=item=>item.amount===null||item.amount===undefined?'Not recorded':item.currencyBasis==='dollar_symbol_only'?`$${number(item.amount)}`:number(item.amount);
  const observationRow=item=>{
    const sourcePosts=[...new Set((item.sourcePostUrls?.length?item.sourcePostUrls:[item.sourcePostUrl]).map(safeSocialLink).filter(Boolean))];
    const sourcePlace=[item.sourceTab||'Source tab not recorded',item.sourceRow?`row ${item.sourceRow}`:null].filter(Boolean).join(' · ');
    const sourceState=item.sourceUnavailable?`${esc(sourcePlace)}<small>Exact source row temporarily unavailable</small>`
      :`${item.sourceUrl?`${esc(sourcePlace)} ${feeLocation(item)}`:feeLocation(item)||esc(sourcePlace)}${(item.sourceRows||[]).map(row=>sourceLink(row.sourceUrl)).filter(Boolean).join(' ')}`;
    const scopeNote=item.sourceCellScope==='multi_creator'
      ?'<small class="cl-overlap">Merged source cell may cover multiple creators; not an individual fee.</small>'
      :item.kind==='unresolved_package_observation'
        ?'<small class="cl-overlap">Package creator attribution unresolved; not counted as a deal.</small>'
      :item.sourceCellScope==='single_creator'
        ?''
        :'<small>Cell ownership unresolved; individual fee not confirmed.</small>';
    const unallocatedPayments=!item.matchedPackageId&&item.paymentEvidence?.length?`<details><summary>${item.paymentEvidence.length} payment record${item.paymentEvidence.length===1?'':'s'} linked to this import row · not allocated to a deal</summary>${item.paymentEvidence.map(payment=>`<p>${esc(paymentLabel(payment.workflowStatus==='paid'?'paid':payment.workflowStatus==='scheduled'?'payment_scheduled':payment.invoiceStatus))} · ${esc(money(payment.amount,payment.currency))} · Due ${esc(date(payment.dueDate))}</p>`).join('')}</details>`:'';
    return `<tr><th scope="row"><strong>${esc(item.campaign)}</strong>${campaignTypeBadge(dealCampaignType(item,c))}</th><td>${esc(item.sourceDates?.length?item.sourceDates.map(date).join(' – '):date(item.sourceDate))}</td><td class="cl-money">${esc(observedValue(item))}${scopeNote}${unallocatedPayments}</td><td>${sourcePosts.length?sourcePosts.map(post=>`<a href="${esc(post)}" target="_blank" rel="noopener noreferrer">Open post ↗</a>`).join('<br>'):'Post link not recorded'}</td><td>${sourceState}</td></tr>`;
  };
  return `<section class="cl-source-observations" aria-label="Imported source observations"><h3>Imported source observations</h3>
    ${c.assignmentTermsState==='unavailable'?'<p role="alert" class="cl-muted">Imported source rows are temporarily unavailable. Any copied assignment numbers below lack an exact source-row link. Confirmed package and staff deal records remain available.</p>':''}${c.assignmentTermsState==='partial'?'<p role="status" class="cl-muted">Imported source observations cover the first 500 assignments only.</p>':''}
    ${observations.length?`<div class="cl-commercial-table-wrap" role="region" aria-label="Imported fee source observations" tabindex="0"><table class="cl-commercial-table"><thead><tr><th scope="col">Campaign in source</th><th scope="col">Source date</th><th scope="col">Sheet value observed</th><th scope="col">Post listed in row</th><th scope="col">Original source</th></tr></thead><tbody>${observations.map(observationRow).join('')}</tbody></table></div>`:'<p class="cl-empty-inline">No imported numeric source rows are available for this creator.</p>'}</section>`;
}
function commercialEvidence(c,s){
  const deals=creatorDeals(c),quotes=creatorQuotes(c),shown=filterCreatorDeals(deals,{platform:s.commercialPlatform,format:s.commercialFormat,campaign:s.commercialCampaign,from:s.commercialFrom,to:s.commercialTo});
  const campaigns=[...new Set(deals.map(d=>d.campaign))].sort();
  const formats=[...new Set(deals.flatMap(d=>d.formats||[]))].sort();
  const overlaps=deals.filter(d=>d.overlap),overlapGroups=overlapDealGroups(deals),comparable=comparableDealRange(deals);
  const scope=d=>`${d.platforms.map(platformName).join(', ')||'Platform not recorded'} · ${d.postCount?`${d.postCount} linked post${d.postCount===1?'':'s'}`:'Scope not recorded'}`;
  const dates=d=>d.dates.length?`${d.dateLabel} ${d.dates.map(date).join(' – ')}`:'Date not recorded';
  const quoteText=value=>String(value||'Not recorded').split(/\r?\n/).map(esc).join('<br>');
  const selectedDeal=deals.find(deal=>deal.id===s.selectedDealId);
  return `<section class="cl-section cl-commercial" aria-label="Rates and deals"><div class="cl-section-heading"><h2>Rates &amp; deals</h2></div>
    ${campaignLegend()}${workedCampaignList(c)}${selectedDeal?dealDetail(selectedDeal,quotes,c):''}
    ${comparable?`<p class="cl-commercial-comparable">Comparable package range: <strong>${esc(money(comparable.low,comparable.currency))}–${esc(money(comparable.high,comparable.currency))}</strong> · ${comparable.sampleSize} recorded deals · ${esc(platformName(comparable.platform))} ${esc(comparable.format)} · ${comparable.postCount} deliverable${comparable.postCount===1?'':'s'} · rights: ${esc(comparable.rights)} · last 2 years. Overlapping claims excluded.</p>`:''}
    <div class="cl-commercial-tabs" role="group" aria-label="Commercial history view"><button type="button" data-action="library-commercial-view" data-view="deals" aria-pressed="${s.commercialView!=='quotes'}">Deals (${deals.length})</button><button type="button" data-action="library-commercial-view" data-view="quotes" aria-pressed="${s.commercialView==='quotes'}">Quotes (${quotes.length})</button></div>
    ${s.commercialView==='quotes'?quotes.length?`<div class="cl-fees">${quotes.map(q=>`<article><h3>${esc(q.title)}</h3>${q.kind==='rate_card'?`<strong>${esc(money(q.amount,q.currency))}</strong>${zeroQuoteNote(q)}<p>${q.platform?esc(platformName(q.platform))+' · ':''}${esc(q.status)}</p>`:`<p>Proposed: ${quoteText(q.standardRates)}</p><p>Final source claim: ${quoteText(q.negotiatedRates)}</p>`}<small>${q.date?`Source date ${esc(/^\d{4}-\d{2}-\d{2}/.test(q.date)?date(q.date):q.date)}`:'Source date not recorded'}</small>${rateSourceLink(q.sourceUrl)}<small>Quote only · Agreement and payment not established</small>${q.dealId?`<button type="button" class="button button--secondary button--small" data-action="library-deal-open" data-id="${esc(q.dealId)}">Open linked deal</button>`:'<small>No documented deal link</small>'}</article>`).join('')}</div>`:'<p class="cl-empty-inline">No quotes recorded.</p>':`
      ${overlaps.length?`<details class="cl-overlap-review"><summary>${overlapGroups.length} shared post link${overlapGroups.length===1?'':'s'} · Compare source rows</summary><p>A post link is listed under more than one fee package. Each amount is a package fee, not a charge for each post. The fees may be separate campaign terms while a post link is repeated or misfiled. Check the source rows before assigning that post to both packages.</p><div class="cl-commercial-table-wrap"><table class="cl-commercial-table"><thead><tr><th scope="col">Campaign</th><th scope="col">Package fee in source sheet</th><th scope="col">Shared post reference</th><th scope="col">Fee cell</th></tr></thead><tbody>${overlaps.map(d=>`<tr><th scope="row">${esc(d.campaign)}</th><td class="cl-money">${esc(money(d.amount,d.currency,d.currencyBasis))}</td><td>${d.identities.map(esc).join('<br>')||'Not recorded'}</td><td>${feeSourceLink(d.sourceUrl)||'Fee cell link not recorded'}</td></tr>`).join('')}</tbody></table></div></details>`:''}
      ${s.overlapReviewError?`<p role="alert" class="system-message system-message--error">${esc(s.overlapReviewError)}</p>`:''}
      ${overlapGroups.map(group=>{
        const current=(s.overlapReviews||[]).find(review=>review.postIdentity===group.postIdentity&&Array.isArray(review.dealIds)&&JSON.stringify([...review.dealIds].sort())===JSON.stringify(group.dealIds));
        const label={separate_valid_deals:'Separate valid deals',bundle_or_allocation:'Bundle or allocation',duplicate_evidence:'Duplicate evidence',incorrect_association:'Incorrect association',unresolved:'Unresolved'};
        return `<section class="cl-overlap-outcome"><h3>Shared post link: ${esc(group.postIdentity)}</h3><p>${group.deals.length} source fee packages list this post · ${current?`Latest review: <strong>${label[current.outcome]||'Review recorded'}</strong> · ${esc(current.reviewer||'Staff reviewer')} · ${esc(date(current.reviewedAt))}`:'Post attribution not reviewed'}</p>${current?`<p>${esc(current.explanation)}</p>`:''}${s.canReviewOverlap?`<form data-overlap-review data-post-identity="${esc(group.postIdentity)}" data-deal-ids="${esc(JSON.stringify(group.dealIds))}"><label>Review outcome<select name="outcome" required>${Object.entries(label).map(([value,title])=>`<option value="${value}">${title}</option>`).join('')}</select></label><label>Explanation<textarea name="explanation" minlength="10" maxlength="2000" required placeholder="Explain how this post link relates to both source packages."></textarea></label><button class="button button--secondary button--small" type="submit" ${s.overlapReviewSaving?'disabled':''}>Record review outcome</button></form>`:''}</section>`;
      }).join('')}
      <div class="cl-commercial-filters"><label>Platform<select name="commercialPlatform" data-commercial-filter><option value="">All platforms</option>${['instagram','tiktok','youtube','facebook'].map(p=>`<option value="${p}" ${s.commercialPlatform===p?'selected':''}>${platformName(p)}</option>`).join('')}</select></label><label>Format<select name="commercialFormat" data-commercial-filter><option value="">All formats</option>${formats.map(value=>`<option value="${esc(value)}" ${s.commercialFormat===value?'selected':''}>${esc(value)}</option>`).join('')}</select></label><label>Campaign<select name="commercialCampaign" data-commercial-filter><option value="">All campaigns</option>${campaigns.map(name=>`<option value="${esc(name)}" ${s.commercialCampaign===name?'selected':''}>${esc(name)}</option>`).join('')}</select></label><label>From<input type="date" name="commercialFrom" data-commercial-filter value="${esc(s.commercialFrom)}"></label><label>To<input type="date" name="commercialTo" data-commercial-filter value="${esc(s.commercialTo)}"></label></div>
      <p class="cl-muted">${shown.length} of ${deals.length} deals · ${new Set(shown.flatMap(d=>d.identities)).size} linked posts${overlapGroups.length?' · Shared post links need attribution review':''}</p>
      <label class="cl-deal-picker">Open a deal detail <select data-library-deal-select><option value="">Choose a deal</option>${shown.map(deal=>`<option value="${esc(deal.id)}" ${s.selectedDealId===deal.id?'selected':''}>${esc(deal.campaign)} · ${esc(money(deal.amount,deal.currency,deal.currencyBasis))}</option>`).join('')}</select></label>
      ${c.paymentHistoryState==='unavailable'?'<p role="status" class="cl-muted">Payment details are temporarily unavailable. The fee records remain available.</p>':''}${c.paymentHistoryState==='partial'?'<p role="status" class="cl-muted">Payment details cover the first 500 campaign assignments only.</p>':''}
      <div class="cl-commercial-table-wrap" role="region" aria-label="Creator deal comparison" tabindex="0"><table class="cl-commercial-table"><thead><tr><th scope="col">Campaign / fee record</th><th scope="col">Date</th><th scope="col">Post links / scope</th><th scope="col">Recorded amount</th><th scope="col">Payment status</th><th scope="col">Details</th></tr></thead><tbody>${shown.map(d=>dealTableRow(d,c,scope,dates)).join('')}</tbody></table></div>${shown.length?'':'<p class="cl-empty-inline">No deals match these filters.</p>'}`}
    ${sourceObservationTable(c)}
  </section>`;
}

function commercialWorkspace(c,s){
  const deals=creatorDeals(c);
  const dates=deal=>deal.dates.length?`${deal.dateLabel} ${deal.dates.map(date).join(' – ')}`:'Date not recorded';
  return `<section class="cl-section cl-commercial" aria-label="Campaigns and fees"><div class="cl-section-heading"><h2 data-i18n>Campaigns &amp; fees</h2></div>
    ${campaignLegend()}${workedCampaignList(c)}
    ${c.paymentHistoryState==='unavailable'?'<p role="status" class="cl-muted">Payment details are temporarily unavailable. Recorded fee entries remain available.</p>':''}${c.paymentHistoryState==='partial'?'<p role="status" class="cl-muted">Payment details cover the first 500 campaign assignments only.</p>':''}
    <section class="cl-commercial-fees" aria-labelledby="cl-recorded-fees"><h3 id="cl-recorded-fees" data-i18n>Recorded campaign fees</h3><div class="cl-commercial-table-wrap" role="region" aria-label="Recorded campaign fees; scroll horizontally for more details" tabindex="0"><table class="cl-commercial-table"><thead><tr><th scope="col" data-i18n>Campaign</th><th scope="col" data-i18n>Fee record</th><th scope="col" data-i18n>Recorded amount</th><th scope="col" data-i18n>Date</th><th scope="col" data-i18n>Payment status</th></tr></thead><tbody>${deals.map(deal=>`<tr><th scope="row"><strong data-no-translate>${esc(deal.campaign)}</strong>${campaignTypeBadge(dealCampaignType(deal,c))}${deal.overlap?'<small class="cl-overlap">Post reference appears on multiple fee records · Review attribution</small>':''}</th><td>${esc(feeRecordLabel(deal))}${feeLocation(deal)?`<div class="cl-fee-source">${feeLocation(deal)}</div>`:''}</td><td class="cl-money">${esc(money(deal.amount,deal.currency,deal.currencyBasis))}</td><td>${esc(dates(deal))}</td><td>${esc(dealPaymentLabel(deal))}</td></tr>`).join('')}</tbody></table></div>${deals.length?'':'<p class="cl-empty-inline" data-i18n>No campaign fee entries recorded.</p>'}</section>
    <details class="cl-commercial-evidence"><summary>Fee sources and quote history</summary>${commercialEvidence(c,s)}</details>
  </section>`;
}
function profile(c,activePlayerId,s){
  const tab=['overview','rates','content','details'].includes(s.profileTab)?s.profileTab:'overview';
  const tabs=[['overview','Overview'],['rates','Campaigns & fees'],['content','Content'],['details','Details']];
  const accounts=`<section class="cl-section"><h2 data-i18n>Social accounts</h2><div class="cl-accounts">${displayAccounts(c.accounts).map(a=>`<article><strong class="social-platform-label">${socialIcon(a.platform)}<span data-i18n data-i18n-context="platform">${platformName(a.platform)}</span></strong><span ${a.handle?'data-no-translate':'data-i18n'}>${esc(a.handle||'Handle not recorded')}</span><small>${number(a.followers)} followers · ${a.followersSource==='paid_spreadsheet'?'sheet figure':a.followersSource==='socialcrawl'?`SocialCrawl${a.followersApproximate?' (approx.)':''} · ${date(a.followersAsOf)}`:'stored observation'}</small>${a.followersConflict?'<small data-i18n>Conflicting figures for the same observation date</small>':''}${a.identityReview?'<small data-i18n>Account identity needs review</small>':''}${safeSocialLink(a.url)?`<a href="${esc(safeSocialLink(a.url))}" target="_blank" rel="noopener noreferrer" data-i18n>Open profile ↗</a>`:''}</article>`).join('')}</div></section>`;
  const content=`<section class="cl-section"><div class="cl-section-heading"><h2 data-i18n>Posts made with BYOU</h2><span>${number(c.posts?.length)} verified posts</span></div><div class="cl-deliverable-feed">${profileDeliverables(c).map(p=>deliverable(p,activePlayerId)).join('')||'<p class="cl-empty-inline" data-i18n>No verified posts recorded.</p>'}</div></section>`;
  const history=`<section class="cl-section"><h2 data-i18n>Campaign history</h2><div class="cl-history">${(c.history||[]).map(h=>`<details><summary><strong data-no-translate>${esc(h.campaign_name)}</strong><span>${h.staffManaged?esc(money(h.agreed_fee,h.currency,h.currencyBasis)):''}</span><span>${esc(historyTiming(h,c))}</span></summary><p>${esc(date(h.start_date))} — ${esc(date(h.end_date))}</p></details>`).join('')||'<p class="cl-empty-inline" data-i18n>No campaign history recorded.</p>'}</div></section>`;
  const details=`${accounts}${history}`;
  const overview=`<div class="cl-summary"><div><span data-i18n>Campaign records</span><strong>${number(c.history?.length??0)}</strong></div><div><span data-i18n>Verified posts</span><strong>${number(c.posts?.length??0)}</strong></div><div><span data-i18n>Supported fee packages</span><strong>${number((c.sourcePackages||[]).filter(pkg=>pkg.sourceCellScope==='single_creator').length)}</strong></div><div><span data-i18n>Recorded payment items</span><strong>${number((c.paymentObligations||[]).filter(item=>!item.importedPlaceholder).length)}</strong></div></div><div class="cl-photo-preview">${avatar(c)}</div>${brandBadges(c)}${renderCreatorInsights(c)}${accounts}${c.intake?`<section class="cl-section"><h2 data-i18n>Imported profile details</h2>${renderCreatorIntakeBadge(c,s.canImportAgencyRoster)}<p data-no-translate>${esc(c.intake.data?.bio||"")}</p><p ${c.intake.data?.location?'data-no-translate':'data-i18n'}>${esc(c.intake.data?.location||"Location not recorded")}</p><p>${creatorCategoryMarkup(c.intake.data?.categories||[])}</p></section>`:""}${(c.portfolioPosts||[]).length?`<section class="cl-section"><h2 data-i18n>Public portfolio</h2><p data-i18n>Socialcrawl profile examples. Campaign history is recorded separately.</p><div class="cl-posts-detail">${c.portfolioPosts.map(p=>portfolioTile(p)).join("")}</div></section>`:""}<section class="cl-section"><h2 data-i18n>Recent work</h2>${(c.posts||[]).length?`<div class="cl-posts-detail">${(c.posts||[]).slice(0,3).map(p=>portfolioTile(p)).join('')}</div>`:'<p class="cl-empty-inline" data-i18n>No verified posts recorded.</p>'}</section>`;
  return `<button class="button button--secondary" data-action="library-back">← All creators</button><header class="cl-profile-heading"><div class="cl-profile-identity">${avatar(c)}<div><p class="eyebrow" data-i18n>Creator profile</p><h1 data-no-translate>${esc(c.displayName)}</h1><div class="cl-platforms">${badges(c.accounts)}</div></div></div><div class="cl-profile-actions"><span class="cl-evidence-label">${number(c.posts?.length)} verified BYOU posts</span>${!s.demo&&!s.snapshot?`<button type="button" class="button button--secondary button--small" data-action="library-open-managed" data-id="${esc(c.id)}">Open staff record</button>`:''}</div></header><nav class="cl-profile-tabs" aria-label="Creator profile sections" data-i18n>${tabs.map(([id,label])=>`<button type="button" data-action="library-profile-tab" data-tab="${id}" data-i18n aria-current="${tab===id?'page':'false'}">${label}</button>`).join('')}</nav>${{overview,rates:commercialWorkspace(c,s),content,details}[tab]}`;
}
export function renderCreatorLibrary(s){
  s={...s,viewMode:'gallery',limit:8,items:(s.items||[]).map(c=>({...c,displayName:creatorDisplayLabel(c)})),selected:s.selected?{...s.selected,displayName:creatorDisplayLabel(s.selected)}:s.selected};
  const sort='<label class="cl-sort"><span data-i18n>Sort by</span> <select form="creator-library-search" name="sort" aria-label="Sort creators">' + Object.entries({complete:'Most complete',followers_desc:'Followers: high to low',followers_asc:'Followers: low to high',campaigns_desc:'Campaigns worked: most first',campaigns_asc:'Campaigns worked: fewest first',rate_desc:'Recorded campaign agreement: high to low',rate_asc:'Recorded campaign agreement: low to high'}).map(([key,label]) => '<option value="'+key+'" '+((s.sort||'complete')===key?'selected':'')+'>'+label+'</option>').join('') + '</select></label>';
  return `<div class="cl-library">${s.demo?'<div class="cl-snapshot" data-i18n>Local design preview · Fabricated sample creators, not the live roster.</div>':''}${s.snapshot?`<div class="cl-snapshot">Private local preview · Saved CRM snapshot${s.capturedAt?' from '+esc(date(s.capturedAt)):''}. Preview changes stay local.</div>`:''}${s.selected&&s.loading?'<p role="status">Loading creator profile…</p>':''}${s.selected&&s.error?`<p role="alert" class="system-message system-message--error">${esc(s.error)}</p><button class="button" data-action="library-retry">Retry</button>`:''}${s.selected?profile(s.selected,s.activePlayerId,s):`
  <header class="cl-header" data-i18n><div><p class="eyebrow" data-i18n>Your creator network</p><h1><span data-i18n>Creators</span> <span data-no-translate>${s.total===null?'':'('+number(s.total)+')'}</span></h1><p>Browse creator profiles, platforms and recorded collaboration history.</p></div><div class="cl-header-actions">${s.canImportAgencyRoster||s.demo?`<button type="button" class="button button--primary" data-intake-action="open">Add creators</button>`:''}<button class="button button--secondary" data-action="library-export" ${s.loading||s.exportBusy||s.error||s.total===null||s.demo||s.snapshot?'disabled':''}>${s.exportBusy?'Preparing XLSX…':'Export matching creators (.xlsx)'}</button></div></header>
  ${renderCreatorIntake(s)}
  <form id="creator-library-search" class="cl-toolbar" data-i18n><label class="cl-search-field"><span class="sr-only">Search creators</span><input type="search" name="query" value="${esc(s.query)}" placeholder="Search by creator name or handle…" maxlength="700" /></label>${s.query||s.aiPlan||s.brands.length||s.campaign||s.stage||s.platform||s.collaboration||s.agency||s.emailAvailability||s.costcoOnly?'<button type="button" class="cl-icon-button cl-clear-search" data-action="library-clear-search" aria-label="Clear search and return to all creators" title="Clear search and return to all creators">&times;</button>':''}<label class="cl-platform-filter"><span>Platform</span><select name="platform" aria-label="Filter by platform">${['','instagram','tiktok','youtube','facebook'].map(p=>`<option value="${p}" ${s.platform===p?'selected':''}>${p?platformName(p):'All platforms'}</option>`).join('')}</select></label><label class="cl-collaboration-filter"><span data-i18n>Collaboration</span><select name="collaboration" aria-label="Filter creators by collaboration history">${[['','All creators'],['seeding','Seeding'],['paid','Paid'],['both','Both']].map(([value,label])=>`<option value="${value}" ${s.collaboration===value?'selected':''}>${label}</option>`).join('')}</select></label><label class="cl-agency-filter"><span data-i18n>Agency</span><select name="agency" aria-label="Filter creators by agency">${[['','All agencies'],['bsm','BSM'],['day_one','Day One'],['other','Other']].map(([value,label])=>`<option value="${value}" ${s.agency===value?'selected':''}>${label}</option>`).join('')}</select></label><label class="cl-email-filter"><span data-i18n>Email Availability</span><select name="emailAvailability" aria-label="Filter creators by email availability">${[['','All creators'],['has_email','Has email'],['no_email','No email']].map(([value,label])=>`<option value="${value}" ${s.emailAvailability===value?'selected':''}>${label}</option>`).join('')}</select></label><label class="cl-costco-toggle"><input type="checkbox" role="switch" name="costcoOnly" ${s.costcoOnly?'checked':''} ${s.loading?'disabled':''} /><span data-i18n>Costco creators</span></label><button class="button button--primary" data-i18n type="submit">Search</button></form>
  ${brandFilters(s)}
  <div class="cl-result-bar"><button type="button" class="button button--secondary" data-action="library-select-page" ${s.loading||s.selectionBusy||!s.items.length?'disabled':''}><span data-i18n>Select this page</span></button>${sort}</div>
  <div class="cl-saved-toolbar"><label><span data-i18n>Save current filters</span> <input type="text" data-creator-view-name maxlength="40" placeholder="View name" /></label><button type="button" class="button button--secondary button--small" data-action="library-save-view">Save view</button>${(s.savedViews||[]).length?`<div class="saved-views" aria-label="Saved creator views">${s.savedViews.map(view=>`<span class="saved-view-item"><button type="button" data-action="library-load-view" data-name="${esc(view.name)}" data-no-translate>${esc(view.name)}</button><button type="button" data-action="library-delete-view" data-name="${esc(view.name)}" aria-label="Delete saved view ${esc(view.name)}">×</button></span>`).join('')}</div>`:''}</div>
  ${s.interpretation&&!s.loading&&!s.error?`<div class="cl-search-interpretation"><p role="status">${esc(s.interpretation.summary)}</p></div>`:''}
  ${s.error?`<p role="alert" class="system-message system-message--error">${esc(s.error)}</p><button class="button" data-action="library-retry">Retry</button>`:''}${s.loading?`<p role="status">${s.refreshing?'Updating creator profiles…':'Loading creator profiles…'}</p>`:''}
  <div class="cl-cards" aria-busy="${s.loading}">${((s.loading&&!s.refreshing)||s.error?[]:s.items).map(c=>card(c,s)).join('')}</div>${!s.loading&&s.total===0?'<p class="cl-empty-inline" data-i18n>No creators match these filters.</p>':''}
  ${!s.loading&&!s.error&&s.total>0?`<nav class="cl-pagination" aria-label="Creator pages" data-i18n><button class="button button--secondary" data-action="library-page" data-offset="${Math.max(0,s.offset-s.limit)}" ${s.offset===0||s.loading?'disabled':''} data-i18n>Previous</button><span>${s.offset+1}–${Math.min(s.offset+s.items.length,s.total)} of ${number(s.total)}</span><button class="button button--secondary" data-action="library-page" data-offset="${s.offset+s.limit}" ${s.offset+s.limit>=s.total||s.loading?'disabled':''} data-i18n>Next</button></nav>`:''}`}</div>`;
}
