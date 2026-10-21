import {displayDate,displayDateTime} from './date-format.mjs';
import {countryColors} from './country-flags.mjs';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=value=>Array.isArray(value)?value:[];
const finite=value=>(typeof value==='number'||typeof value==='string'&&value.trim()!=='')&&Number.isFinite(Number(value))&&Number(value)>=0?Number(value):null;
const percent=value=>{const n=finite(typeof value==='string'?value.replace(/%$/,''):value);return n!==null&&n<=100?n:null;};
const number=value=>value===null?'Not available':Math.round(value).toLocaleString('en-US');
const date=value=>Number.isFinite(Date.parse(value))?displayDate(value):'Date unavailable';

export function normalizeAudience(data={}){
 const countries=list(data.audienceLocations).flatMap(row=>{
  const percentage=percent(row?.percentage),count=finite(row?.count);
  return percentage===null||typeof row?.country!=='string'?[]:[{label:row.country,code:row.countryCode,percentage,count:Number.isSafeInteger(count)?count:null}];
 }).sort((a,b)=>b.percentage-a.percentage);
 const ageOrder=['18-24','25-34','35-44','45-54','55+'];
 const ages=list(data.audienceAges).flatMap(row=>{
  const percentage=percent(row?.percentage);return percentage===null||!ageOrder.includes(row?.key)?[]:[{label:row.key.replace('-','–'),key:row.key,percentage}];
 }).sort((a,b)=>ageOrder.indexOf(a.key)-ageOrder.indexOf(b.key));
 let genders=list(data.audienceGenders).flatMap(row=>{
  const percentage=percent(row?.percentage);return percentage===null||!['female','male','unknown','unspecified'].includes(row?.key)?[]:[{label:({female:'Female',male:'Male',unknown:'Unspecified',unspecified:'Unspecified'})[row.key],percentage}];
 });
 const total=genders.reduce((s,r)=>s+r.percentage,0);
 if(total>100.1)genders=[];
 else if(genders.length&&total<99.99){const unknown=genders.find(r=>r.label==='Unspecified');if(unknown)unknown.percentage=Math.round((unknown.percentage+100-total)*100)/100;else genders.push({label:'Unspecified',percentage:Math.round((100-total)*100)/100});}
 return {countries,ages,genders,sampleSize:countries.length&&countries.every(r=>r.count!==null)?countries.reduce((s,r)=>s+r.count,0):null};
}

function postKey(post){
 try{
  const u=new URL(post.url),host=u.hostname.replace(/^(?:www\.|m\.)/,'');
  const youtubeId=host==='youtu.be'?u.pathname.split('/')[1]:host==='youtube.com'?(u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1]):null;
  if(youtubeId)return 'youtube.com:'+youtubeId;
  const id=host==='tiktok.com'?u.pathname.match(/\/video\/(\d+)/)?.[1]:host==='instagram.com'?u.pathname.match(/\/(?:p|reel|tv)\/([^/]+)/)?.[1]:null;
  if(id)return host+':'+id;
  u.hash='';
  for(const key of [...u.searchParams.keys()])if(/^utm_/i.test(key)||['fbclid','igshid','igsh','si'].includes(key))u.searchParams.delete(key);
  u.searchParams.sort();
  return host+u.pathname.replace(/\/$/,'')+u.search;
 }catch{return post.id||null;}
}
export function byouPerformance(posts=[],observations=[]){
 const unique=new Map();
 for(const post of list(posts)){const key=postKey(post);if(!key)continue;const previous=unique.get(key);unique.set(key,{...post,metrics:[...list(previous?.metrics),...list(post.metrics)]});}
 const result={total:unique.size};
 for(const code of ['views','likes']){
  const values=[];
  for(const post of unique.values()){
   const matching=list(observations).filter(row=>row.status==='succeeded'&&postKey({url:row.target})===postKey(post));
   const entries=[...list(post.metrics).filter(m=>m.code===code),...matching.map(observation=>({code,value:observation.data?.metrics?.[code],observedAt:observation.observedAt}))];
   const valid=entries.filter(m=>finite(m.value)!==null).sort((a,b)=>(Date.parse(b.observedAt)||0)-(Date.parse(a.observedAt)||0));
   if(valid[0])values.push({value:Number(valid[0].value),at:valid[0].observedAt});
  }
  const dates=values.map(v=>v.at).filter(v=>Number.isFinite(Date.parse(v))).sort((a,b)=>Date.parse(a)-Date.parse(b));
  result[code]={average:values.length?values.reduce((s,v)=>s+v.value,0)/values.length:null,count:values.length,oldestAt:dates[0]||null,newestAt:dates.at(-1)||null};
 }
 return result;
}
const ageColors=['#B9D7BD','#91BD9B','#65A17C','#40815F','#245C43'];
const countryCode=r=>typeof r.code==='string'&&Object.hasOwn(countryColors,r.code.toLowerCase())?r.code.toLowerCase():null;
const flag=r=>countryCode(r)?'<img class="ci-flag" src="/assets/flags/'+countryCode(r)+'.svg" alt="" width="24" height="18" loading="lazy">':'';
const bars=(rows,kind='country')=>'<ol class="ci-bars">'+rows.map(r=>{
 const color=kind==='age'?ageColors[['18-24','25-34','35-44','45-54','55+'].indexOf(r.key)]:countryColors[countryCode(r)]||'var(--md-sys-color-primary)';
 return '<li><div class="ci-bar-label"><span class="ci-country-name">'+(kind==='country'?flag(r):'')+esc(r.label)+'</span><strong>'+r.percentage.toFixed(2).replace(/\.00$/,'')+'%</strong></div><div class="ci-bar-track" aria-hidden="true"><span style="width:'+r.percentage+'%;background:'+color+'"></span></div></li>';
}).join('')+'</ol>';
const head='M40 4a14 14 0 1 1 0 28a14 14 0 1 1 0-28Z';
const bodies={Male:head+'M25 40Q15 40 13 52L5 96Q4 104 11 106Q18 108 20 100L27 65V183Q27 196 35 196Q40 196 40 184V118H42V184Q42 196 49 196Q57 196 57 183V65L64 100Q66 108 73 106Q80 104 78 96L70 52Q68 40 58 40Z',Female:head+'M28 40Q20 40 17 51L3 94Q0 103 7 106Q14 108 17 100L29 64L14 133H28V184Q28 196 35 196Q42 196 42 184V133H45V184Q45 196 52 196Q59 196 59 184V133H73L56 64L68 100Q71 108 78 105Q85 102 81 94L67 51Q64 40 56 40Z'};
function genderFigures(rows,accountIndex){
 const people=['Male','Female'].map(label=>{
  const row=rows.find(r=>r.label===label),p=row?.percentage,id='ci-person-'+accountIndex+'-'+label.toLowerCase(),path=bodies[label];
  return '<div class="ci-person ci-person-'+label.toLowerCase()+'"><svg viewBox="0 0 88 202" aria-hidden="true" focusable="false"><defs><clipPath id="'+id+'"><path d="'+path+'"/></clipPath></defs>'+(p===undefined?'':'<rect x="0" y="'+(196-192*p/100)+'" width="88" height="'+(192*p/100)+'" fill="currentColor" clip-path="url(#'+id+')"/>')+'<path d="'+path+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg><strong>'+(p===undefined?'Not available':p.toFixed(2).replace(/\.00$/,'')+'%')+'</strong><span>'+label+'</span></div>';
 }).join('');const unknown=rows.find(r=>r.label==='Unspecified');
 return '<div class="ci-gender-figures">'+people+'</div>'+(unknown?'<p class="ci-gender-unspecified">Unspecified <strong>'+unknown.percentage.toFixed(2).replace(/\.00$/,'')+'%</strong></p>':'');
}
export function renderCreatorInsights(creator={}){
 if(creator.hasEmail!==true||!list(creator.accounts).some(a=>String(a.platform).toLowerCase()==='tiktok'))return '';
 const performance=byouPerformance(creator.posts,creator.postInsights);
 const metrics=performance.total?`<section class="cl-section ci-performance" aria-label="Past BYOU performance"><h2 data-i18n>Past BYOU performance</h2><div class="ci-stat-grid">${['views','likes'].map(code=>{const m=performance[code];return `<article class="ci-stat"><span data-i18n>Average ${code} per post</span><strong>${number(m.average)}</strong><small>Based on ${m.count} of ${performance.total} verified BYOU posts</small><small>${m.count?`${date(m.oldestAt)===date(m.newestAt)?'Updated':'Observations from'} ${date(m.oldestAt)}${date(m.oldestAt)!==date(m.newestAt)?' – '+date(m.newestAt):''}`:'Metrics not available yet'}</small></article>`;}).join('')}</div><p class="ci-caption">Only verified BYOU campaign content. Posts with missing metrics are excluded from that average.</p></section>`:'';
 const audiences=list(creator.audienceInsights);
 const content=audiences.length?audiences.map((row,accountIndex)=>{
  if(row.status!=='succeeded')return `<div class="ci-audience-account"><h3>@${esc(row.handle)}</h3><p class="ci-caption">${['queued','processing'].includes(row.status)?'Audience data is being collected.':'Audience data is currently unavailable.'}</p></div>`;
  const data=normalizeAudience(row.data),top=data.countries[0];
  return `<div class="ci-audience-account"><div class="ci-heading"><h3>TikTok · @${esc(row.handle)}</h3><span class="ci-caption">Updated ${date(row.observedAt)}</span></div>${top?`<p class="ci-highlight"><strong>${top.percentage.toFixed(2)}%</strong> ${flag(top)}${esc(top.label)}</p><h4 data-i18n>Audience by country</h4>${bars(data.countries.slice(0,5))}${data.countries.length>5?`<details class="ci-more"><summary>Show all ${data.countries.length} countries</summary>${bars(data.countries.slice(5))}</details>`:''}`:'<p class="ci-caption">Country data is not available for this account.</p>'}<div class="ci-demographic-grid"><section><h4 data-i18n>Age distribution</h4>${data.ages.length?bars(data.ages,'age'):'<p class="ci-caption">Age data not available.</p>'}</section><section><h4 data-i18n>Gender distribution</h4>${data.genders.length?genderFigures(data.genders,accountIndex):'<p class="ci-caption">Gender data not available.</p>'}</section></div></div>`;
 }).join(''):`<p class="ci-caption">${creator.insightsState==='unavailable'?'Audience data could not be loaded. Try again later.':'Not collected yet. Audience data will appear here when available.'}</p>`;
 return metrics+`<section class="cl-section ci-audience" aria-label="Audience demographics"><h2 data-i18n>Audience demographics</h2>${content}</section>`;
}
