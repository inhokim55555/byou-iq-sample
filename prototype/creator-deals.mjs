import {postIdentity} from './creator-library.mjs';

const known=value=>value!==null&&value!==undefined&&Number.isFinite(Number(value));
const unique=values=>[...new Set(values.filter(Boolean))];
const cents=value=>{
  const raw=String(value??'');
  if(!/^\d{1,12}(?:\.\d{1,2})?$/.test(raw))return null;
  const [whole,fraction='']=raw.split('.');
  return BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0'));
};
const decimal=value=>`${value/100n}.${String(value%100n).padStart(2,'0')}`;

export function summarizePaymentObligations(obligations=[]){
  obligations=obligations.filter(item=>!item?.importedPlaceholder);
  if(!obligations.length)return {status:'not_recorded',invoiceCount:0,paymentCount:0};
  const distinct=new Map();
  for(const item of obligations){
    if(!item?.id)continue;
    if(distinct.has(item.id)&&JSON.stringify(distinct.get(item.id))!==JSON.stringify(item))return {status:'needs_review',invoiceCount:0,paymentCount:0};
    distinct.set(item.id,item);
  }
  const rows=[...distinct.values()],currencies=new Set(rows.map(item=>item.currency).filter(Boolean));
  const amounts=rows.map(item=>cents(item.amount));
  if(!rows.length||currencies.size!==1||amounts.some(value=>value===null))return {status:'needs_review',invoiceCount:rows.length,paymentCount:0};
  const total=amounts.reduce((sum,value)=>sum+value,0n);
  const paid=rows.reduce((sum,item,index)=>sum+(item.workflowStatus==='paid'?amounts[index]:0n),0n);
  const paymentCount=rows.filter(item=>item.workflowStatus==='paid').length;
  const status=paymentCount===rows.length?'paid':paymentCount?'partially_paid'
    :rows.some(item=>item.workflowStatus==='scheduled')?'payment_scheduled'
    :rows.some(item=>item.invoiceStatus==='invoice_received')?'invoice_received'
    :rows.some(item=>item.invoiceStatus==='requested')?'invoice_requested':'not_recorded';
  return {status,currency:[...currencies][0],invoiceCount:rows.length,paymentCount,
    total:decimal(total),paid:decimal(paid),remaining:decimal(total-paid)};
}

const feeCellKey=value=>{
  try{
    const url=new URL(value);
    const spreadsheetId=url.pathname.match(/^\/spreadsheets\/d\/([^/]+)\/edit\/?$/)?.[1];
    const location=new URLSearchParams(url.hash.replace(/^#/,''));
    const gid=location.get('gid'),range=location.get('range')?.toUpperCase();
    return url.protocol==='https:'&&url.hostname==='docs.google.com'&&spreadsheetId&&/^\d+$/.test(gid||'')&&/^[A-Z]{1,3}\d+$/.test(range||'')
      ?`${spreadsheetId}:${gid}:${range}`:null;
  }catch{return null;}
};
const sameAmount=(left,right)=>cents(left)!==null&&cents(left)===cents(right);
const compatibleCurrency=(pkg,term)=>!pkg.currency||!term.currency||pkg.currency===term.currency;
function packageForImportedTerm(packages,term){
  if(term.sourceCellScope!=='single_creator'||!term.sourceLocationVerifiedOn||!sameAmount(term.amount,term.sourceRecordedFee??term.amount))return null;
  const termCell=feeCellKey(term.sourceUrl);
  if(!termCell)return null;
  const candidates=packages.filter(pkg=>pkg.sourceCellScope==='single_creator'&&pkg.sourceLocationVerifiedOn&&feeCellKey(pkg.currentSourceUrl||pkg.sourceUrl)===termCell
    &&sameAmount(pkg.amount,term.amount)&&compatibleCurrency(pkg,term));
  return candidates.length===1?candidates[0]:null;
}

// A source package stays one commercial row even when several posts point to it.
export function creatorDeals(creator){
  const rows=creator.sourceRows||[];
  const sourcePackages=(creator.sourcePackages||[]).filter(pkg=>pkg.sourceCellScope==='single_creator');
  const packages=sourcePackages.map(pkg=>{
    const linked=rows.filter(row=>row.packageId===pkg.id);
    const identities=unique((pkg.postUrls||[]).map(postIdentity));
    const postPlatforms=(pkg.postUrls||[]).map(url=>{
      try{const host=new URL(url).hostname.replace(/^www\./,'');
        return host==='instagram.com'?'instagram':host==='tiktok.com'?'tiktok':host==='facebook.com'?'facebook':host==='youtube.com'||host==='youtu.be'?'youtube':null;
      }catch{return null;}
    });
    return {id:`source:${pkg.id}`,kind:'source',campaign:pkg.campaign||'Campaign not recorded',campaignId:null,dateLabel:'Posted',
      dates:unique([...linked.map(row=>row.sourceDate),...(pkg.sourceDates||[])]).sort(),platforms:unique([...linked.map(row=>row.platform||((row.url||'').includes('instagram.com')?'instagram':(row.url||'').includes('tiktok.com')?'tiktok':'')),...postPlatforms]),formats:unique(linked.map(row=>row.format||row.deliverableType)),postCount:identities.length,
      amount:pkg.amount,currency:pkg.currency||null,currencyBasis:pkg.currencyBasis||null,rights:pkg.usageRights||null,status:'Spreadsheet package fee',paymentStatus:pkg.paymentStatus||'not_recorded',
      feeKind:pkg.feeKind||null,sourceMergeRange:pkg.sourceMergeRange||null,
      paymentProvenance:pkg.paymentProvenance||null,sourceUrl:pkg.currentSourceUrl||pkg.sourceUrl,
      capturedSourceUrl:pkg.capturedSourceUrl||pkg.sourceUrl,sourceLocationVerifiedOn:pkg.sourceLocationVerifiedOn||null,
      sourceStatusRaw:pkg.sourceStatusRaw||null,sourceStatusUrl:pkg.sourceStatusUrl||null,
      sourceRows:linked,postUrls:pkg.postUrls||[],identities,
      importedTermIds:[],paymentEvidence:[],paymentSummary:{status:'not_recorded',invoiceCount:0,paymentCount:0}};
  });
  const allTerms=creator.assignmentTerms||[];
  for(const term of allTerms){
    const match=packageForImportedTerm(sourcePackages,term);
    if(!match)continue;
    const deal=packages.find(pkg=>pkg.id===`source:${match.id}`);
    if(deal)deal.importedTermIds.push(term.id);
  }
  const obligations=creator.paymentObligations||[];
  for(const deal of packages){
    const related=obligations.filter(item=>deal.importedTermIds.includes(item.termsVersionId));
    deal.importedPaymentPlaceholderCount=related.filter(item=>item.importedPlaceholder).length;
    deal.paymentEvidence=related.filter(item=>!item.importedPlaceholder);
    deal.paymentSummary=summarizePaymentObligations(deal.paymentEvidence);
    if(deal.paymentSummary.status!=='not_recorded')deal.paymentStatus=deal.paymentSummary.status;
  }
  const manual=(creator.history||[]).filter(item=>item.staffManaged&&known(item.agreed_fee)).map(item=>{
    const paymentEvidence=obligations.filter(obligation=>obligation.assignmentId===item.id&&!obligation.importedPlaceholder);
    const payment=summarizePaymentObligations(paymentEvidence);
    return {id:`assignment:${item.id}`,kind:'assignment',assignmentId:item.id,campaignId:item.campaignId||null,quoteIds:(creator.rateCards||[]).filter(rate=>rate.assignmentId===item.id).map(rate=>rate.id),campaign:item.campaign_name||'Campaign not recorded',dateLabel:'Campaign dates',
      dates:unique([item.start_date,item.end_date]),
      platforms:unique((item.deliverables||[]).map(d=>d.platform)),formats:unique((item.deliverables||[]).map(d=>d.format||d.deliverableType)),postCount:(item.deliverables||[]).length,
      amount:item.agreed_fee,currency:item.currency||null,currencyBasis:'staff_recorded',rights:item.usageRights||null,status:'Agreed',staffManaged:true,
      paymentStatus:payment.status,paymentSummary:payment,paymentEvidence,sourceUrl:null,sourceRows:[],postUrls:[],identities:[],deliverables:item.deliverables||[]};
  });
  const all=[...packages,...manual];
  for(const deal of all){
    deal.overlap=all.some(other=>other!==deal&&deal.identities.some(id=>other.identities.includes(id)));
  }
  return all.sort((a,b)=>String(b.dates.at(-1)||'').localeCompare(String(a.dates.at(-1)||''))||a.campaign.localeCompare(b.campaign)||a.id.localeCompare(b.id));
}

// Imported numeric cells are observations of the source workbook. They are not
// independent creator deals, even when the import attached them to assignments.
export function creatorSourceObservations(creator){
  const historyById=new Map((creator.history||[]).map(item=>[item.id,item]));
  const obligations=creator.paymentObligations||[];
  const sourcePackages=(creator.sourcePackages||[]).filter(pkg=>pkg.sourceCellScope==='single_creator');
  const observations=(creator.assignmentTerms||[]).map(term=>{
    const item=historyById.get(term.assignmentId)||{};
    const paymentEvidence=obligations.filter(obligation=>obligation.termsVersionId===term.id&&!obligation.importedPlaceholder);
    const payment=summarizePaymentObligations(paymentEvidence);
    const match=packageForImportedTerm(sourcePackages,term);
    return {id:term.id,kind:'source_observation',assignmentId:term.assignmentId,campaignId:item.campaignId||null,
      campaign:item.campaign_name||term.sourceTab||'Campaign not recorded',sourceDate:term.sourceDate||null,
      amount:term.amount,currency:term.currency||null,currencyBasis:term.currencyBasis||null,rights:item.usageRights||null,
      sourceCellScope:term.sourceCellScope||'unresolved',matchedPackageId:match?.id||null,
      sourceTab:term.sourceTab||null,sourceRow:term.sourceRow||null,
      sourcePostUrl:term.sourcePostUrl||null,sourceUrl:term.sourceUrl||null,
      sourceTabUrl:term.sourceTabUrl||null,sourceLocationVerifiedOn:term.sourceLocationVerifiedOn||null,
      paymentStatus:payment.status,paymentSummary:payment,paymentEvidence,
      importedPaymentPlaceholderCount:obligations.filter(obligation=>obligation.termsVersionId===term.id&&obligation.importedPlaceholder).length,
      sourceUnavailable:false};
  });
  // Older previews and unavailable RPCs expose only the copied assignment
  // number. Keep it visible as an unverified observation, never a deal.
  const fallbackTerms=creator.assignmentTermsState==='ready'||creator.assignmentTermsState==='partial'||observations.length?[]:(creator.history||[]).filter(item=>!item.staffManaged&&known(item.agreed_fee)).map(item=>{
    const paymentEvidence=obligations.filter(obligation=>obligation.assignmentId===item.id&&!obligation.importedPlaceholder);
    const payment=summarizePaymentObligations(paymentEvidence);
    return {id:`assignment:${item.id}`,kind:'source_observation',assignmentId:item.id,campaignId:item.campaignId||null,
      campaign:item.campaign_name||'Campaign not recorded',sourceDate:null,
      amount:item.agreed_fee,currency:item.currency||null,currencyBasis:'import_default_usd',rights:item.usageRights||null,
      sourceCellScope:'unresolved',matchedPackageId:null,sourceTab:null,sourceRow:null,sourcePostUrl:null,
      sourceUrl:null,sourceTabUrl:null,sourceLocationVerifiedOn:null,
      paymentStatus:payment.status,paymentSummary:payment,paymentEvidence,sourceUnavailable:true};
  });
  const unresolvedPackages=(creator.sourcePackages||[]).filter(pkg=>pkg.sourceCellScope!=='single_creator').map(pkg=>{
    const linked=(creator.sourceRows||[]).filter(row=>row.packageId===pkg.id);
    return {id:`source:${pkg.id}`,kind:'unresolved_package_observation',campaign:pkg.campaign||'Campaign not recorded',
      amount:pkg.amount,currency:pkg.currency||null,currencyBasis:pkg.currencyBasis||null,
      sourceCellScope:pkg.sourceCellScope||'unresolved',sourceDate:pkg.sourceDate||null,
      sourceDates:unique(linked.map(row=>row.sourceDate||null)),
      sourceTab:pkg.campaign||null,sourceRow:null,sourceUrl:pkg.currentSourceUrl||pkg.sourceUrl||null,
      sourceTabUrl:null,sourceLocationVerifiedOn:pkg.sourceLocationVerifiedOn||null,
      sourcePostUrl:(pkg.postUrls||[])[0]||null,sourcePostUrls:pkg.postUrls||[],sourceRows:linked,
      matchedPackageId:null,paymentEvidence:[],paymentSummary:{status:'not_recorded',invoiceCount:0,paymentCount:0},sourceUnavailable:false};
  });
  return [...observations,...fallbackTerms,...unresolvedPackages];
}

export function comparableDealRange(deals,asOf=new Date().toISOString().slice(0,10)){
  const cutoff=`${Number(asOf.slice(0,4))-2}${asOf.slice(4)}`;
  const eligible=deals.filter(d=>!d.overlap&&known(d.amount)&&d.currency&&d.platforms.length===1&&d.formats?.length===1&&d.postCount>0&&d.rights&&d.dates.some(date=>/^\d{4}-\d{2}-\d{2}/.test(date)&&date>=cutoff&&date<=asOf));
  const groups=new Map();
  for(const deal of eligible){const key=JSON.stringify([deal.currency,deal.platforms[0],deal.formats[0],deal.postCount,deal.rights]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(deal);}
  const selected=[...groups.entries()].sort((a,b)=>b[1].length-a[1].length)[0];
  if(!selected||selected[1].length<3)return null;
  const [currency,platform,format,postCount,rights]=JSON.parse(selected[0]);
  const amounts=selected[1].map(d=>Number(d.amount)).sort((a,b)=>a-b);
  return {currency,platform,format,postCount,rights,low:amounts[0],high:amounts.at(-1),sampleSize:amounts.length,from:cutoff,to:asOf};
}

export function overlapDealGroups(deals){
  const groups=new Map();
  for(const deal of deals){
    for(const identity of deal.identities||[]){
      if(!groups.has(identity))groups.set(identity,[]);
      groups.get(identity).push(deal);
    }
  }
  return [...groups].filter(([,items])=>items.length>1)
    .map(([postIdentity,items])=>({postIdentity,dealIds:items.map(item=>item.id).sort(),deals:items}));
}

export function creatorQuotes(creator){
  return [
    ...(creator.rateCards||[]).filter(rate=>rate.sourceKind!=='assignment_terms').map(rate=>({id:rate.id,kind:'rate_card',sourceKind:rate.sourceKind||null,title:rate.deliverableType||'Recorded quote',amount:rate.quotedRate,currency:rate.currency,
      platform:rate.platform||'',status:rate.status||'Status not recorded',date:rate.effectiveOn||rate.sourceDate||null,sourceUrl:rate.sourceUrl,
      dealId:rate.assignmentId?`assignment:${rate.assignmentId}`:null})),
    ...(creator.sourceRateQuotes||[]).map(quote=>({kind:'source_quote',title:quote.status==='candidate_quote_unconfirmed'?'Candidate proposed / final claims':'Spreadsheet rate options',standardRates:quote.standardRates,
      negotiatedRates:quote.negotiatedRates,status:quote.status==='candidate_quote_unconfirmed'?'Candidate quote · agreement unconfirmed':'Quoted',date:quote.lastNegotiatedOn||null,sourceUrl:quote.sourceUrl}))
  ];
}

export function filterCreatorDeals(deals,{platform='',format='',campaign='',status='',query='',from='',to=''}={}){
  const term=query.trim().toLowerCase();
  return deals.filter(deal=>(!platform||deal.platforms.includes(platform))&&(!campaign||deal.campaign===campaign)
    &&(!format||deal.formats?.includes(format))&&(!status||deal.status===status)
    &&(!(from||to)||deal.dates.some(date=>/^\d{4}-\d{2}-\d{2}/.test(date)&&(!from||date.slice(0,10)>=from)&&(!to||date.slice(0,10)<=to)))
    &&(!term||deal.campaign.toLowerCase().includes(term)));
}
