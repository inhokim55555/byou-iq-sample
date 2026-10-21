import {displayDate,displayDateTime} from './date-format.mjs';
const escape = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number = n => n == null ? 'Unavailable' : Number(n).toLocaleString('en-US');
const date = s => s && Number.isFinite(Date.parse(s)) ? displayDateTime(s,'UTC')+' UTC' : 'Not captured';
export const safeLibraryUrl = (value, image = false) => {
 try { const u = new URL(value); if(u.protocol !== 'https:' || u.username || u.password) return '';
  if(image && !['i.ytimg.com','img.youtube.com'].includes(u.hostname) && !['.cdninstagram.com','.fbcdn.net','.tiktokcdn.com','.tiktokcdn-us.com','.tiktokcdn-eu.com'].some(s=>u.hostname.endsWith(s)))return '';
  if(!image && !['instagram.com','www.instagram.com','tiktok.com','www.tiktok.com','vm.tiktok.com','vt.tiktok.com','youtube.com','www.youtube.com','youtu.be','facebook.com','www.facebook.com','fb.watch'].includes(u.hostname))return '';
  return u.href;
 } catch {return '';}
};
export function renderTrackifyLibrary({workspace,query,platform}) {
 const page=workspace.page||{},items=workspace.items||[];
 const cards=items.map(v=>{
  const url=safeLibraryUrl(v.canonicalUrl),thumb=safeLibraryUrl(v.thumbnailUrl,true);
  return `<article class="video-tracking-card">
   <div class="video-card-top"><div><span class="video-platform">${escape(v.platform)}</span><h2>${escape(v.creatorName||v.creatorHandle||'Creator not identified')}</h2><p>${escape(v.creatorHandle||'')}</p></div><span class="video-state video-state--neutral">Imported history</span></div>
   ${thumb?`<a href="${escape(url)}" target="_blank" rel="noreferrer"><img src="${escape(thumb)}" alt="Video thumbnail" loading="lazy" referrerpolicy="no-referrer" style="width:100%;height:210px;object-fit:contain;background:#f5f5f5" /></a>`:''}
   <p>${escape(v.caption||'Caption unavailable')}</p>
   <p>${escape((v.collections||[]).join(' · ')||'No Trackify collection')}</p>
   <div class="video-meta"><span>Published: ${escape(date(v.publishedAt))}</span><a href="${escape(url)}" target="_blank" rel="noreferrer">Open video ↗</a></div>
   <div class="video-metric-strip">${['views','likes','comments','shares','saves'].map(k=>`<span><small>${escape(k)}</small><strong>${escape(number(v.metrics?.[k]))}</strong></span>`).join('')}</div>
   <p>Last saved observation: ${escape(date(v.latestObservedAt))}</p>
   <p>${v.matchState==='existing_post'?'Existing CRM post found; campaign verification unchanged.':'Creator / campaign link needs review. Video and history are saved.'} ${Number(v.sourceAliases)>1?`${number(v.sourceAliases)} Trackify records combined.`:''}</p>
   ${v.metricConflict?'<p class="system-message">Conflicting measurements retained. Affected totals are unavailable until reviewed.</p>':''}
   <details><summary>View saved history (${number(v.historyCount)} dates)</summary><div style="overflow:auto;max-height:360px"><table><thead><tr><th>Observed (UTC)</th>${['Views','Likes','Comments','Shares','Saves'].map(k=>`<th>${k}</th>`).join('')}</tr></thead><tbody>${(v.history||[]).map(h=>`<tr><td>${escape(date(h.at))}${h.conflict?' · conflict':''}</td>${['views','likes','comments','shares','saves'].map(k=>`<td>${escape(number(h.metrics?.[k]))}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>
  </article>`;
 }).join('');
 return `<section class="panel"><h1>Video Tracking</h1><p>Trackify videos, captions, collections, and saved metric history.</p>
  <div class="video-tracking-toolbar"><label>Library<select data-field="video-library"><option value="trackify" selected>Imported Trackify library</option><option value="crm">CRM connected posts</option></select></label><label>Search videos<input data-field="video-search" value="${escape(query)}" placeholder="Creator, caption, collection, or URL" /></label><label>Platform<select data-field="video-platform">${['all','instagram','tiktok','youtube','facebook'].map(p=>`<option value="${p}" ${platform===p?'selected':''}>${p==='all'?'All platforms':p}</option>`).join('')}</select></label><button class="button button--secondary" data-action="reload-video-tracking">Refresh view</button></div>
  <p><strong>${number(page.total)} videos</strong> · Duplicate source records share a video entry. Campaign links remain subject to review.</p>
  <p>These are saved Trackify measurements, not a fresh provider check. Source zeros may mean unavailable; YouTube shares and saves remain unavailable. Thumbnail links may expire.</p>
  ${workspace.error?`<p class="system-message">${escape(workspace.error)}</p>`:workspace.loading?'<p>Loading videos…</p>':`<div class="video-tracking-grid">${cards||'<p>No videos match these filters.</p>'}</div>`}
  <div class="page-actions"><button class="button button--secondary" data-action="trackify-previous" ${!page.offset||workspace.loading?'disabled':''}>Previous</button><span>Page ${Math.floor((page.offset||0)/(page.limit||50))+1}</span><button class="button button--secondary" data-action="trackify-next" ${!page.hasMore||workspace.loading?'disabled':''}>Next</button></div>
 </section>`;
}
