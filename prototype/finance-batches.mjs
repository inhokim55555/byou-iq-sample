// Pure finance calculations. Amounts stay in their original currency.
export function thursdayOnOrAfter(value) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Enter a valid payment date.');
  const day = new Date(`${value}T12:00:00Z`);
  if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0,10) !== value) throw new Error('Enter a valid payment date.');
  day.setUTCDate(day.getUTCDate() + (4 - day.getUTCDay() + 7) % 7);
  return day.toISOString().slice(0,10);
}
export function financeWeekThursday(today = new Intl.DateTimeFormat('en-CA', {timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())) {
  thursdayOnOrAfter(today);
  const day = new Date(`${today}T12:00:00Z`);
  // Monday–Sunday calendar week: Friday must not pull next Thursday into this week.
  day.setUTCDate(day.getUTCDate() + 3 - (day.getUTCDay() + 6) % 7);
  return day.toISOString().slice(0,10);
}
export function financeThursday(finance = {}) {
  const due = financeDueDate(finance);
  if (!due) return null;
  const first = thursdayOnOrAfter(due), scheduled = finance.paymentThursday;
  return scheduled && thursdayOnOrAfter(scheduled) === scheduled && scheduled >= first ? scheduled : first;
}
export function financeDueDate(finance = {}) {
  if(Object.hasOwn(finance,'dueDate')) {
    if(!finance.dueDate)return null;
    thursdayOnOrAfter(finance.dueDate);
    return finance.dueDate;
  }
  return finance.liveDate ? (() => {
    thursdayOnOrAfter(finance.liveDate);
    const day = new Date(`${finance.liveDate}T12:00:00Z`); day.setUTCDate(day.getUTCDate()+30);
    return day.toISOString().slice(0,10);
  })() : null;
}
export function nextPaymentWeek(finance, today) {
  const current = financeWeekThursday(today);
  const scheduled=financeThursday(finance);
  if (scheduled && scheduled > current) throw new Error('Only payments in this week’s unpaid section can be delayed.');
  const day = new Date(`${current}T12:00:00Z`); day.setUTCDate(day.getUTCDate()+7);
  return day.toISOString().slice(0,10);
}
export function financeShares(amount, fundingMode) {
  if (amount === null || amount === undefined || amount === '' || !Number.isFinite(Number(amount)) || Number(amount)<0) return {invoice:null,byou:null,brand:null};
  const cents = Math.round(Number(amount)*100);
  if (fundingMode === 'byou_full') return {invoice:cents/100,byou:cents/100,brand:0};
  if (fundingMode === 'brand_half') {
    const byou = Math.ceil(cents/2); // BYOU takes an indivisible cent; both shares sum to the invoice.
    return {invoice:cents/100,byou:byou/100,brand:(cents-byou)/100};
  }
  return {invoice:cents/100,byou:null,brand:null};
}
export function financeTotals(records = []) {
  const groups = new Map();
  for (const row of records) {
    const f=row.finance||{}, currency=f.currency||'Unconfirmed currency';
    if (!groups.has(currency)) groups.set(currency,{currency,invoice:0,planned:0,paid:0,brand:0,unknown:0,count:0});
    const total=groups.get(currency), shares=financeShares(f.amount,row.fundingMode);
    total.count++;
    if(shares.invoice!==null) total.invoice+=Math.round(shares.invoice*100);
    if(shares.byou===null) {total.unknown++;continue;}
    total.brand+=Math.round(shares.brand*100);
    total[f.status==='paid'?'paid':'planned']+=Math.round(shares.byou*100);
  }
  return [...groups.values()].map(t=>({...t,...Object.fromEntries(['invoice','planned','paid','brand'].map(k=>[k,t[k]/100]))}));
}
export function deliverableLinks(row) {
  // Only assignment-bound deliverables. Public portfolio posts are excluded.
  const links=[...(row.posts||[]).map(p=>({url:p.url,label:p.platform?`${p.platform} video`:'Delivered video'})),...(row.finance?.deliverables||[]),...assignmentPublications(row).filter(p=>p.postUrl).map(p=>({url:p.postUrl,label:`Deliverable ${p.number} · ${p.platform||'Post'}`}))];
  return [...new Map(links.flatMap(p=>{
    try {const url=new URL(p.url);if(url.protocol!=='https:'||url.username||url.password)return [];return [[url.href,{url:url.href,label:p.label||'Delivered video'}]];}catch{return [];}
  })).values()];
}
export function assignmentPublications(row) {
  return (Array.isArray(row.assignmentDetails?.deliverables)?row.assignmentDetails.deliverables:[]).flatMap((p,index)=>{
    if(!p||typeof p!=='object')return [];
    let postUrl=null;
    try{const url=new URL(p.postUrl);if(url.protocol==='https:'&&!url.username&&!url.password)postUrl=url.href;}catch{}
    const code=key=>typeof p[key]==='string'&&p[key].trim()&&!/[\u0000-\u001f\u007f]/.test(p[key])&&p[key].length<=1000?p[key]:null;
    const tiktokAdCode=code('tiktokAdCode'),instagramAdCode=code('instagramAdCode');
    return postUrl||tiktokAdCode||instagramAdCode?[{id:p.id,number:index+1,platform:({instagram:'Instagram',tiktok:'TikTok',youtube:'YouTube',other:'Other'})[p.platform]||null,postUrl,tiktokAdCode,instagramAdCode}]:[];
  });
}
const publicationEscape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderAssignmentPublications(row) {
  const publications=assignmentPublications(row);
  return publications.length?publications.map(p=>`<section class="ops-deliverable"><h4>Deliverable ${p.number}${p.platform?' · '+p.platform:''}</h4><p>${p.postUrl?`<a href="${publicationEscape(p.postUrl)}" target="_blank" rel="noopener noreferrer">Open post ↗</a>`:'Post URL not recorded'}</p><div class="ops-fields">${[['tiktokAdCode','TikTok ad code'],['instagramAdCode','Instagram ad code']].map(([key,label])=>`<label><span>${label}</span><input type="text" readonly value="${publicationEscape(p[key])}" placeholder="Not recorded"></label>`).join('')}</div></section>`).join(''):'<p class="ops-note">No saved post URLs or ad codes yet. Add these in Campaigns → Edit creator assignment.</p>';
}
export function filterFinances(records, query={}) {
  const term=String(query.search||query.q||'').toLowerCase();
  return records.filter(a=>a.finance?.referred===true)
    .filter(a=>!term||[a.creatorDisplayName,a.creatorHandle,a.campaignName,a.brand].join(' ').toLowerCase().includes(term))
    .filter(a=>!query.brand||a.brand===query.brand)
    .filter(a=>!query.campaignId||a.campaignId===query.campaignId)
    .filter(a=>!query.status||query.status==='all'||(query.status==='unpaid'?a.finance.status!=='paid':a.finance.status===query.status))
    .filter(a=>!query.thursday||query.thursday==='all'||(query.thursday==='unscheduled'?!financeThursday(a.finance):financeThursday(a.finance)===query.thursday));
}
