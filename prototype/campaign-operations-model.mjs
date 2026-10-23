// Calendar and sample-state helpers shared by the operations controller and tests.
// The sample store is memory-only and is never used in a connected workspace.
import {readAssignmentEditableFields,DELIVERABLE_PUBLICATION_KEYS} from './assignment-details-fields.mjs';
import {enrichOperations} from './sample-details.mjs';
import {financeThursday,nextPaymentWeek,financeTotals,filterFinances,assignmentPublications,financeShares} from './finance-batches.mjs';
export function net30Date(value) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Enter a valid publication date.');
  const day = new Date(value + 'T12:00:00Z');
  if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== value) throw new Error('Enter a valid publication date.');
  day.setUTCDate(day.getUTCDate() + 30);
  return day.toISOString().slice(0, 10);
}

export function readCampaignOperationForm(form) {
  const text = key => String(form.get(key) ?? '').trim();
  const optional = key => text(key) || null;
  const number = key => {
    const value=text(key);
    if(value==='')return null;
    if(!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(value))throw new Error('Enter an amount such as 300,000 or 300,000.50.');
    return Number(value.replaceAll(',',''));
  };
  const kind = text('kind');
  let data;
  if (kind === 'campaign') {
    const ids = form.getAll('resourceId'), names = form.getAll('resourceName');
    const kinds = form.getAll('resourceKind'), urls = form.getAll('resourceUrl'), files=form.getAll('resourceFileId');
    data = {
      name: text('name'), type: text('type') || text('campaignType'), status: text('status'),
      brand: text('brand') || text('brandName'), productName: text('productName'), category: text('categoryChoice')==='custom'?text('category'):text('categoryChoice')||text('category'),
      startDate: optional('startDate'), endDate: optional('endDate'), timezone: text('timezone') || 'America/Los_Angeles',
      currency: text('currency') || 'USD', budget: number('budget'),
      ...(form.has('ownerId') && text('ownerId') !== '__keep_manager__' ? {ownerId:text('ownerId') || null} : {}),
      ...(form.has('workspaceParentId') ? {workspaceParentId:optional('workspaceParentId')} : {}),
      fundingMode: text('fundingMode') || 'unconfirmed',
      resources: names.map((name, index) => ({id: String(ids[index] || ''), name: String(name).trim(), kind: String(kinds[index] || 'other'), url: String(urls[index] || '').trim(),...(files[index]?{fileId:String(files[index])}:{})}))
        .filter(resource => resource.name || resource.url),
      templates: form.has('templatesJSON') ? JSON.parse(text('templatesJSON')) : {
        paid: {subject: text('paidSubject'), body: text('paidBody')},
        seeding: {subject: text('seedingSubject'), body: text('seedingBody')}
      }
    };
  } else if (kind === 'delete_campaign') {
    data={confirmName:String(form.get('confirmName')??''),approved:form.has('approved')};
    if(!data.confirmName.trim())throw new Error('Type the exact campaign name to confirm deletion.');
    if(!data.approved)throw new Error('Confirm permanent deletion before continuing.');
  } else if (kind === 'remove_creator') {
    if(!optional('assignmentId'))throw new Error('Choose the exact campaign creator to remove.');
    data={approved:form.has('approved')};
    if(!data.approved)throw new Error('Confirm removing this creator from the campaign.');
  } else if (kind === 'phase') {
    data = {phase: number('phase'), phaseReason: text('phaseReason') || text('reason'), approved: form.has('approved') || form.has('managerApproved')};
  } else if (kind === 'assignment') {
    data={engagementType:text('engagementType'),feeAmount:number('feeAmount'),feeCurrency:form.has('feeCurrency')?optional('feeCurrency'):'USD',...readAssignmentEditableFields(form)};
  } else if (kind === 'finance') {
    data = {amount: number('amount'), currency: text('currency') || 'USD',
      w9DocumentId: optional('w9DocumentId'), invoiceDocumentId: optional('invoiceDocumentId'),
      w9Status: text('w9Status') || 'missing', invoiceStatus: text('invoiceStatus') || 'missing',
      method: optional('method'), liveDate: optional('liveDate'), status: text('status') || 'pending',
      urgency: text('urgency') || 'normal', paidOn: optional('paidOn'), paymentReference: optional('paymentReference')};
    if(form.has('contractDocumentId'))data.contractDocumentId=optional('contractDocumentId');
    if(form.has('dueDate'))data.dueDate=optional('dueDate');
    if(form.has('contractStatus'))data.contractStatus=text('contractStatus')||'missing';
    if(form.has('deliverableUrls'))data.deliverables=text('deliverableUrls').split(/\r?\n/).map(url=>url.trim()).filter(Boolean).map(url=>({url,label:'Delivered video'}));
    if(form.has('reviewNote'))data.reviewNote=text('reviewNote');
  } else if (kind === 'automation') {
    const enrolledAssignmentIds=[...new Set(form.getAll('enrolledAssignmentIds').map(id=>String(id).trim()).filter(Boolean))];
    if(enrolledAssignmentIds.length>100)throw new Error('Choose at most 100 enrolled creators.');
    data={emailEnabled:form.has('emailEnabled'),shipmentsEnabled:form.has('shipmentsEnabled'),mailboxBindingId:optional('mailboxBindingId'),enrolledAssignmentIds,approved:form.has('approved')};
  } else if (kind === 'shipment') {
    data = {requested: true, fullName: text('fullName'), address: text('address'), productName: text('productName'),
      brand: text('brand'), boxSize: text('boxSize'), shippingCost: number('shippingCost'), trackingOriginal: text('trackingOriginal'), trackingNumber: text('trackingNumber'), packingDate: optional('packingDate'), notes: text('notes'), shipmentType: text('shipmentType'), pic: text('pic')};
  } else throw new Error('This editor could not be identified. Close it and try again.');
  return {action: kind, assignmentId: kind==='delete_campaign'?null:optional('assignmentId'), expectedRevision: Number(text('expectedRevision') || 0), data};
}

const uuid = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const clone = value => structuredClone(value);
export function financePaymentBlockReason(assignment) {
  const f=assignment?.finance||{};
  if(!assignment?.campaignId||!assignment.id||assignment.canFinance!==true||!Number.isSafeInteger(assignment.revision)||assignment.revision<0)return 'Reload this creator with finance access.';
  if(f.status==='paid')return 'This payment is already recorded as paid.';
  if(!Number.isFinite(Number(f.amount))||Number(f.amount)<=0)return 'Add a positive invoice amount before confirming payment.';
  if(!/^[A-Z]{3}$/.test(f.currency||''))return 'Confirm the invoice currency before recording payment.';
  if(!['wire','check'].includes(f.method))return 'Choose wire or check in Edit payment.';
  if(!['byou_full','brand_half'].includes(assignment.fundingMode))return 'Confirm the campaign funding split before recording payment.';
  return null;
}
export function validFinanceDate(value) {
  return typeof value==='string'&&value>='1900-01-01'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(new Date(`${value}T12:00:00Z`).getTime())&&new Date(`${value}T12:00:00Z`).toISOString().slice(0,10)===value;
}
const SHIPMENT_IMPORT_KEYS=Object.freeze({
  fullName:'Recipient Name',address:'Address',productName:'Product',brand:'Brand',boxSize:'Box Size',shippingCost:'Shipping Cost',
  trackingOriginal:'Tracking Original',trackingNumber:'Tracking Number',packingDate:'Packing Date',notes:'Notes',shipmentType:'Seeding / Paid',pic:'PIC'
});
const SHIPMENT_IMPORT_WARNING_CODES=new Set(['formula-cached-value','numeric-tracking']);
const shipmentImportText=value=>String(value??'').trim();
const shipmentImportAddress=value=>typeof value==='string'?value.trim():value&&typeof value==='object'?
  [value.line1||value.addressLine1,value.line2||value.addressLine2,[value.city,value.region||value.state,value.postalCode].filter(Boolean).join(', '),value.country].filter(Boolean).join('\n'):'';
const shipmentImportLink=value=>{
  let text=shipmentImportText(value);if(!text)return '';
  if(!/^https?:\/\//i.test(text))text=`https://${text}`;
  try{const url=new URL(text);if(!['http:','https:'].includes(url.protocol))return '';url.hostname=url.hostname.toLowerCase().replace(/^www\./,'');url.search='';url.hash='';url.pathname=url.pathname.replace(/\/+$/,'')||'/';return url.toString().replace(/\/$/,'');}catch{return '';}
};
const shipmentImportCampaign=value=>shipmentImportText(value).toLocaleLowerCase().replace(/\s+/g,' ');
const shipmentImportCurrent=(shipment,field)=>field==='address'?shipmentImportAddress(shipment?.[field]):shipment?.[field]??'';
const shipmentImportComparable=value=>typeof value==='number'?String(value):shipmentImportText(value).toLocaleLowerCase();

function shipmentImportCandidates(row,assignments) {
  const campaign=shipmentImportCampaign(row.values?.campaignName),link=shipmentImportLink(row.values?.creatorLink);
  if(!campaign||!link)return [];
  return assignments.filter(assignment=>{
    if(shipmentImportCampaign(assignment.campaignName)!==campaign)return false;
    const links=[assignment.creatorProfileUrl,...(assignment.accounts||[]).map(account=>account?.url)].map(shipmentImportLink).filter(Boolean);
    return links.includes(link);
  });
}

function shipmentImportPlanRow(row,assignments,selectedAssignmentId=null,decisions={}) {
  const issues=Array.isArray(row.issues)?row.issues:[];
  const blockers=issues.filter(item=>!SHIPMENT_IMPORT_WARNING_CODES.has(item.code)&&!['missing-identity','invalid-link'].includes(item.code));
  const candidates=shipmentImportCandidates(row,assignments);
  const selected=selectedAssignmentId?assignments.find(item=>item.id===selectedAssignmentId&&item.canShip===true):null;
  const assignment=selected||(!selectedAssignmentId&&candidates.length===1&&candidates[0].canShip===true?candidates[0]:null);
  const status=!assignment?(blockers.length?'invalid':'needs-match'):blockers.length?'invalid':'ready';
  const shipment=assignment?.shipment||{};
  const differences=[];
  for(const [field,label] of Object.entries(SHIPMENT_IMPORT_KEYS)){
    if(!Object.hasOwn(row.values||{},field))continue;
    const incoming=row.values[field];let current=shipmentImportCurrent(shipment,field);
    if(!shipmentImportText(current)&&field==='productName')current=assignment?.productName||'';
    if(!shipmentImportText(current)&&field==='brand')current=assignment?.brand||'';
    const hasCurrent=shipmentImportText(current)!=='';
    const equal=hasCurrent&&shipmentImportComparable(current)===shipmentImportComparable(incoming);
    differences.push({field,label,current,incoming,kind:equal?'same':hasCurrent?'conflict':'new',decision:equal?'keep':decisions[field]|| (hasCurrent?null:'apply')});
  }
  const conflictPending=differences.some(item=>item.kind==='conflict'&&!['keep','apply','skip'].includes(item.decision));
  const effectiveStatus=status==='ready'&&conflictPending?'conflict':status;
  return {...row,assignmentId:assignment?.id||null,assignment, candidates:candidates.map(item=>({id:item.id,campaignId:item.campaignId,campaignName:item.campaignName,creatorProfileUrl:item.creatorProfileUrl,creatorHandle:item.creatorHandle,canShip:item.canShip})),
    differences,decisions:Object.fromEntries(differences.map(item=>[item.field,item.decision])),status:effectiveStatus,baseStatus:status,reviewedWarnings:row.reviewedWarnings===true,
    warnings:issues.filter(item=>SHIPMENT_IMPORT_WARNING_CODES.has(item.code)),blockingIssues:blockers,skip:row.skip===true};
}

export function planShipmentImport(rows,assignments=[]) {
  const usable=(Array.isArray(assignments)?assignments:[]).filter(item=>item&&typeof item.id==='string'&&item.canShip===true);
  const plans=(Array.isArray(rows)?rows:[]).map(row=>shipmentImportPlanRow(row,usable,row.selectedAssignmentId,row.decisions));
  const groups=new Map();
  for(const row of plans)if(row.assignmentId)groups.set(row.assignmentId,[...(groups.get(row.assignmentId)||[]),row]);
  for(const group of groups.values()){
    if(group.length<2)continue;
    const chosen=group.find(row=>row.useDuplicate===true)||group.find(row=>row.skip!==true)||null;
    for(const row of group){
      if(row===chosen){row.skip=false;row.duplicateOf=null;}
      else{row.status='duplicate';row.duplicateOf=chosen?.sourceRow||group[0].sourceRow;row.skip=true;}
    }
  }
  return plans;
}

export function buildShipmentImportCommand(assignment,previewRow,idempotencyKey) {
  if(!assignment||assignment.canShip!==true||!Number.isSafeInteger(assignment.revision)||assignment.revision<0||!previewRow?.assignmentId||previewRow.assignmentId!==assignment.id)throw new Error('Reload this exact shipment assignment before importing.');
  if(!/^[A-Za-z0-9_-]{8,256}$/.test(String(idempotencyKey||'')))throw new Error('A stable import request key is required.');
  if(previewRow.blockingIssues?.length)throw new Error('Resolve the invalid spreadsheet values or skip this row.');
  const differences=previewRow.differences||[];
  if(differences.some(item=>item.kind==='conflict'&&!['keep','apply','skip'].includes(previewRow.decisions?.[item.field]||item.decision)))throw new Error('Choose how to handle every conflicting value.');
  const current=assignment.shipment||{};
  const data={requested:true,fullName:shipmentImportAddress(current.fullName)||shipmentImportText(current.fullName),address:shipmentImportAddress(current.address),
    productName:shipmentImportText(current.productName),brand:shipmentImportText(current.brand),boxSize:shipmentImportText(current.boxSize),
    shippingCost:current.shippingCost===null||current.shippingCost===undefined||current.shippingCost===''?null:Number(current.shippingCost),
    trackingOriginal:shipmentImportText(current.trackingOriginal),trackingNumber:shipmentImportText(current.trackingNumber),
    packingDate:shipmentImportText(current.packingDate),notes:shipmentImportText(current.notes),shipmentType:shipmentImportText(current.shipmentType),pic:shipmentImportText(current.pic)};
  let changed=false;
  for(const item of differences){
    if(item.kind==='same')continue;
    const decision=item.kind==='conflict'?(previewRow.decisions?.[item.field]||item.decision):'apply';
    if(decision==='skip')continue;
    if(decision!=='apply')continue;
    data[item.field]=item.field==='address'?shipmentImportAddress(item.incoming):item.incoming;
    changed=true;
  }
  if(!changed&&current.requested===true)return null;
  return {action:'shipment',assignmentId:assignment.id,expectedRevision:assignment.revision,idempotencyKey,data};
}

export function createOperationsDemoStore() {
  const creatorNames = ["Maya Linden","Theo Vale","Nora Finch","Eli Rowan","Zoe Hart","Owen Reed","Owen Brook","Lena Reed","Emery Shore","Iris Maple","Finn Alder","Sage Bell","Milo Frost","Zoe Clover","Remy Lane","Eden Moss","Luca Fern","Ada Birch"];
  const creators = creatorNames.map((displayName, i) => ({id: uuid(100+i), displayName, code: `SAMPLE-${i+1}`,
    categories: ['Skincare', 'Lifestyle'], accounts: [{platform: i % 2 ? 'tiktok' : 'instagram', handle: `@sample_${i+1}`, followers: 18000+i*7400, url: null}],
    email:displayName.toLowerCase().replace(' ','.')+'@example.invalid',hasEmail:true, posts: [], history: [], historyCount: 0, coverage: {verifiedPosts: 0}}));
  const templates = {
    paid: {subject: '{{brand}} · {{productName}} collaboration', body: 'Hi {{creatorName}},\n\nWe would like to discuss a paid collaboration for {{productName}} with {{brand}}. Would you share your availability and current rate?\n\nThank you,\nBYOU team'},
    seeding: {subject: 'An invitation to try {{productName}}', body: 'Hi {{creatorName}},\n\nWe would love to send you {{productName}} from {{brand}} to try. This is a product seeding invitation. Let us know if you are interested and we will share the details.\n\nThank you,\nBYOU team'}
  };
  let sequence = 1000;
  const campaigns = [
    {id: uuid(1), name: 'Autumn skincare · sample', type: 'paid', status: 'active', brand: 'Lumen Grove', fundingMode:'brand_half', productName: 'Daily Cream', category: 'Skincare', startDate: '2026-10-01', endDate: '2026-11-30', timezone: 'America/Los_Angeles', currency: 'USD', budget: 6000, revision: 0, canEdit: true, resources: [{id: 'sample-kit',name: 'Brand kit',kind: 'brand_kit',url: 'https://example.com/sample-brand-kit'},{id: 'sample-deck',name: 'Product deck',kind: 'product_deck',url: 'https://example.com/sample-product-deck'}], templates: clone(templates)},
    {id: uuid(2), name: 'Tidewell daily rituals · sample', type: 'seeding', status: 'planning', brand: 'Tidewell', productName: 'Scalp Wash', category: 'Body care', startDate: null, endDate: null, timezone: 'America/Los_Angeles', currency: 'USD', budget: null, revision: 0, canEdit: true, resources: [], templates: clone(templates)}
  ];
  const managers=['Alex Rivera','Jordan Vale','Sam Linden','Mira Chen','Theo Brooks','Nora Finch','Eli Rowan','Zoe Hart','Owen Reed','Isla Park'].map((name,i)=>({id:uuid(910+i),name}));
  for (const c of campaigns) Object.assign(c,{ownerId:null,ownerName:null,ownerOptions:clone(managers)});
  const assignments = creators.map((creator, i) => ({id: uuid(200+i), campaignId: uuid(1), creatorId: creator.id,
    creatorDisplayName: creator.displayName, creatorHandle: creator.accounts[0].handle, creatorCode: creator.code,
    creatorProfileUrl: null, accounts: clone(creator.accounts), categories: clone(creator.categories), posts: [],
    phase: i === 5 ? null : i+1, phaseReason: i === 0 ? 'The creator is reviewing the campaign brief. The next step is confirming the contract.' : i === 5 ? null : 'Sample manager selection', revision: 0,
    progressContext:{state:'ready',pendingReplyCount:0,communications:i===0?[{campaignId:uuid(1),assignmentId:uuid(200+i),creatorId:creator.id,status:'verified',href:'https://mail.google.com/mail/u/0/#all/fabricated-preview-only',latestMessageAt:'2026-10-09T17:00:00Z',nextAction:'Confirm the contract before scheduling content.'}]:[]},
    engagementType: 'paid', feeAmount: i === 5 ? null : 500, feeCurrency: 'USD',
    canEdit: true, canFinance: true, canShip: true,
    finance: {referred: i >= 3 && i <= 4, amount: i === 5 ? null : 500, currency: 'USD', w9DocumentId: null, invoiceDocumentId: null,
      w9Status: 'missing', invoiceStatus: 'missing', method: null, liveDate: i >= 3 && i <= 4 ? (i===3?'2026-09-23':'2026-10-01') : null,
      dueDate: i >= 3 && i <= 4 ? (i===3?'2026-10-23':'2026-10-31') : null, status: 'pending', urgency: 'normal', paidOn: null, paymentReference: null},
    shipment: {requested: i === 2 || i === 3, fullName: i === 3 ? creator.displayName : '', address: i === 3 ? 'Sample address — replace before shipping' : '',
      productName: 'Daily Cream', brand: 'Lumen Grove', carrier: '', trackingNumber: '', status: 'unknown', sourceUrl: null, checkedAt: null}
  }));
  enrichOperations(creators,campaigns,assignments);
  const replies=[{id:uuid(800),campaignId:uuid(1),assignmentId:assignments[0].id,creatorId:assignments[0].creatorId,creatorDisplayName:assignments[0].creatorDisplayName,kind:'review',status:'open',lastCreatorCorrespondenceAt:'2026-10-11T16:30:00Z',replyTranslation:{ko:{summary:'Maya가 배송 정보를 보내 왔으며 샘플 발송을 기다리고 있습니다.',nextStep:'배송 요청에 주소를 입력한 뒤 배송팀에 전달하세요.'}},summary:'Maya sent the delivery details and is ready for us to send the sample.',nextStep:'Add the address to the shipment request, then pass it to the shipping team.',sourceUrl:null,canEdit:true},
    {id:uuid(801),campaignId:uuid(1),assignmentId:assignments[1].id,creatorId:assignments[1].creatorId,creatorDisplayName:assignments[1].creatorDisplayName,kind:'review',status:'open',lastCreatorCorrespondenceAt:'2026-10-10T18:00:00Z',replyTranslation:{ko:{summary:'Blair가 관심을 보였으나 콘텐츠 사용 조건은 아직 협의 중입니다.',nextStep:'제시한 금액에 30일간의 광고 사용권을 포함할 수 있는지 확인하세요.'}},summary:'Blair is interested, but the usage terms are still open.',nextStep:'Ask whether 30 days of paid usage can be included in the quoted rate.',sourceUrl:null,canEdit:true}];
  const automations=new Map();
  for(let i=2;i<6;i++)replies.push({id:uuid(800+i),campaignId:uuid(1),assignmentId:assignments[i].id,creatorId:assignments[i].creatorId,creatorDisplayName:assignments[i].creatorDisplayName,kind:'review',status:'open',lastCreatorCorrespondenceAt:'2026-10-10T18:00:00Z',replyTranslation:{ko:{summary:'가능한 일정을 보내 왔으며 캠페인 안내를 기다리고 있습니다.',nextStep:'캠페인 안내를 전달하고 초안 제출일을 확인하세요.'}},summary:'They sent their availability and are waiting for the campaign brief.',nextStep:'Share the brief and confirm the draft date.',canEdit:true});
  for(const [i,reply] of replies.entries())reply.sourceUrl=`https://mail.google.com/mail/u/0/#all/fabricated-thread-${i+1}`;
  const sampleAutomation=id=>{
    if(!automations.has(id))automations.set(id,{revision:0,canEdit:true,status:'paused',pilotPaused:true,mailbox:null,mailboxOptions:[],enrolledAssignmentIds:[],enrolledCreatorCount:0,pendingReviewCount:0,
      collectionOwner:'railway',reasoningOwner:'codex',configurationIssues:['No verified mailbox or live checks are connected in the sample workspace.'],
      email:{enabled:false,status:'paused',scheduleLabel:'Weekdays, 8:30 am–6:00 pm · Every 30 minutes',timeZone:'America/Los_Angeles',lastSuccessAt:null,nextCheckAt:null},
      shipments:{enabled:false,status:'paused',scheduleLabel:'Daily at 9:00 am',timeZone:'America/Los_Angeles',lastSuccessAt:null,nextCheckAt:null}});
    return automations.get(id);
  };
  const receipts = new Map(),unpaidSnapshots=new Map();
  const batchReviews = new Map(),delaySchedules=new Map();
  const campaign = id => campaigns.find(item => item.id === id);
  const assignment = id => assignments.find(item => item.id === id);
  function workspaceCampaign(record) {
    const root=campaign(record.workspaceParentId)||record;
    const members=campaigns.filter(c=>c.id===root.id||c.workspaceParentId===root.id).map(c=>Object.fromEntries(['id','name','type','status','startDate','endDate','budget','currency','ownerName','revision','canEdit'].map(k=>[k,c[k]??null])));
    return {...record,workspaceAvailable:true,workspaceId:root.id,workspaceName:root.name,workspaceParentId:root.id===record.id?null:root.id,workspaceMembers:members};
  }
  function read(view, id, query = {}) {
    if (view === 'campaign') {
      if (!campaign(id)) throw new Error('Campaign unavailable.');
      return clone({campaign: workspaceCampaign(campaign(id)), assignments: assignments.filter(a => a.campaignId === id), actions: replies.filter(r=>r.campaignId===id),
        automation: sampleAutomation(id), monitor: {status: 'demo', enabled: false,emailEnabled:false}, page: {hasMore: false, nextCursor: null}});
    }
    const items = view === 'campaigns' ? campaigns.filter(c=>!c.workspaceParentId).map(workspaceCampaign) : assignments.filter(a => view === 'finances' ? a.finance.referred : a.shipment.requested)
      .map(a => ({...a,campaignName:campaign(a.campaignId).name,brand:campaign(a.campaignId).brand,productName:campaign(a.campaignId).productName}));
    if(view==='finances'){
      for(const a of items){a.fundingMode=campaign(a.campaignId).fundingMode||'unconfirmed';a.finance.paymentThursday=financeThursday(a.finance);}
      const dates=[...new Set(items.map(a=>a.finance.paymentThursday).filter(Boolean))].sort();
      const batches=dates.map(thursday=>{const packet=readBatch(thursday);return {thursday,count:packet.items.length,status:packet.status,snapshot:packet.snapshot,prepared:batchReviews.has(thursday)};});
      for(const a of items)a.finance.batchStatus=batches.find(b=>b.thursday===a.finance.paymentThursday)?.status||'pending';
      const filtered=filterFinances(items,query);
      return clone({items:filtered,batches,totals:financeTotals(filtered),canApproveBatch:true,canExportBatch:true,brands:[...new Set(items.map(a=>a.brand))],campaigns:[...new Map(items.map(a=>[a.campaignId,{id:a.campaignId,name:a.campaignName,brand:a.brand}])).values()],page:{hasMore:false,nextCursor:null}});
    }
    return clone({items:items.filter(item=>(!query.q||JSON.stringify([item.name,item.creatorDisplayName,item.brand]).toLowerCase().includes(String(query.q).toLowerCase()))&&(!query.type||query.type==='all'||item.type===query.type)&&(!query.status||query.status==='all'||item.status===query.status)), workspaceAvailable:true, page: {limit: 100, hasMore: false, nextCursor: null}, canCreate: true});
  }
  function readBatch(thursday){
    const items=assignments.filter(a=>a.finance.referred&&financeThursday(a.finance)===thursday).map(a=>({...clone(a),campaignName:campaign(a.campaignId).name,brand:campaign(a.campaignId).brand,fundingMode:campaign(a.campaignId).fundingMode||'unconfirmed'}));
    const payload=JSON.stringify(items.map(a=>({id:a.id,name:a.creatorDisplayName,campaign:a.campaignName,brand:a.brand,funding:a.fundingMode,posts:a.posts,assignmentPublications:assignmentPublications(a),finance:Object.fromEntries(Object.entries(a.finance).filter(([k])=>!['status','paidOn','paymentReference','batchStatus'].includes(k)))})));
    let hash=2166136261;for(const c of payload)hash=Math.imul(hash^c.charCodeAt(0),16777619)>>>0;const snapshot=hash.toString(16).padStart(8,'0').repeat(8);
    return {thursday,items,snapshot,status:batchReviews.get(thursday)?.approvedSnapshot===snapshot?'approved':'pending'};
  }
  function batchCommand(cmd){
    const fingerprint=JSON.stringify(cmd),prior=receipts.get(cmd.idempotencyKey);
    if(prior){if(prior.fingerprint!==fingerprint)throw new Error("This save key was already used for different changes.");return clone(prior.result);}
    const result=mutateBatch(cmd);receipts.set(cmd.idempotencyKey,{fingerprint,result:clone(result)});return result;
  }
  function mutateBatch(cmd){
    if(cmd.action==='delay'||cmd.action==='undo_delay'){
      const a=assignment(cmd.assignmentId);
      if(!a||a.campaignId!==cmd.campaignId||!a.canFinance||a.revision!==cmd.expectedRevision||a.finance.status==='paid')throw new Error('Reload this unpaid creator before changing the payment schedule.');
      const history=delaySchedules.get(a.id)||[];
      if(cmd.action==='undo_delay'){
        if(!(a.finance.delayWeeks>0))throw new Error('This payment has no delay to undo.');
        const previous=history.at(-1);
        if(!previous||previous.delayedDate!==a.finance.dueDate||previous.delayedWeeks!==a.finance.delayWeeks)throw new Error('Payment schedule changed after the delay.');
        history.pop();for(const key of ['dueDate','paymentThursday','delayWeeks'])delete a.finance[key];Object.assign(a.finance,previous.schedule);a.revision++;
        return {delayUndone:true,assignmentId:a.id,thursday:financeThursday(a.finance)};
      }
      const next=nextPaymentWeek(a.finance),weeks=(a.finance.delayWeeks||0)+1;
      history.push({schedule:Object.fromEntries(Object.entries(a.finance).filter(([key])=>['dueDate','paymentThursday','delayWeeks'].includes(key))),delayedDate:next,delayedWeeks:weeks});delaySchedules.set(a.id,history);
      a.finance.paymentThursday=next;a.finance.dueDate=next;a.finance.delayWeeks=weeks;a.revision++;
      return {delayed:true,thursday:a.finance.paymentThursday};
    }
    const packet=readBatch(cmd.thursday);
    if(!packet.items.length||packet.snapshot!==cmd.snapshot)throw new Error('This Thursday batch changed. Reload and export it again.');
    if(cmd.action==='prepare')batchReviews.set(cmd.thursday,{...batchReviews.get(cmd.thursday),preparedSnapshot:packet.snapshot});
    else if(cmd.action==='approve'){
      if(!cmd.bossApproved||!cmd.approvalReference?.trim()||batchReviews.get(cmd.thursday)?.preparedSnapshot!==packet.snapshot)throw new Error('Export this batch, then confirm the boss approval and its reference.');
      batchReviews.set(cmd.thursday,{...batchReviews.get(cmd.thursday),approvedSnapshot:packet.snapshot});
    }else throw new Error('Unsupported batch action.');
    return {...packet,preparedAt:new Date().toISOString(),status:cmd.action==='approve'?'approved':packet.status};
  }
  function confirmPayment(cmd){
    const fingerprint=JSON.stringify(cmd),prior=receipts.get(cmd.idempotencyKey);
    if(prior){if(prior.fingerprint!==fingerprint)throw new Error('This payment key was already used for different details.');return clone(prior.result);}
    const a=assignment(cmd.assignmentId),c=campaign(cmd.campaignId);
    if(!a||!c||a.campaignId!==c.id||a.revision!==cmd.expectedRevision)throw new Error('Reload this exact creator payment before confirming.');
    if(!['byou_full','brand_half'].includes(cmd.expectedFundingMode))throw new Error('Review the campaign funding split before confirming.');
    if(cmd.expectedFundingMode!==c.fundingMode)throw Object.assign(new Error('The campaign funding split changed. Reload and review this payment before confirming.'),{status:409});
    const block=financePaymentBlockReason({...a,fundingMode:c.fundingMode});if(block)throw new Error(block);
    const localToday=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    if(cmd.confirmed!==true||!validFinanceDate(cmd.paidOn)||cmd.paidOn>localToday)throw new Error('Confirm the actual payment and its date.');
    if(cmd.paymentReference!==null&&(typeof cmd.paymentReference!=='string'||cmd.paymentReference.length>500))throw new Error('Payment reference must be at most 500 characters.');
    const shares=financeShares(a.finance.amount,c.fundingMode);
    unpaidSnapshots.set(a.id,clone(a.finance));
    a.finance={...a.finance,status:'paid',paidOn:cmd.paidOn,paymentReference:cmd.paymentReference,paidByouAmount:shares.byou};a.revision++;
    const result={paid:true,campaignId:c.id,assignmentId:a.id,revision:a.revision,paidOn:cmd.paidOn,invoiceAmount:shares.invoice,paidByouAmount:shares.byou,currency:a.finance.currency};
    receipts.set(cmd.idempotencyKey,{fingerprint,result:clone(result)});return result;
  }
  function undoPayment(cmd){
    const fingerprint=JSON.stringify(cmd),prior=receipts.get(cmd.idempotencyKey);
    if(prior){if(prior.fingerprint!==fingerprint)throw new Error('Undo retry conflict.');return clone(prior.result);}
    const a=assignment(cmd.assignmentId);
    if(!a?.canFinance||a.campaignId!==cmd.campaignId||a.revision!==cmd.expectedRevision||a.finance.status!=='paid'||!cmd.confirmed)throw new Error('Reload this exact paid creator before undoing.');
    a.finance={...(unpaidSnapshots.get(a.id)||a.finance),status:'pending',paidOn:null,paidByouAmount:null,paymentReference:null};a.revision++;
    const result={undone:true,campaignId:a.campaignId,assignmentId:a.id,revision:a.revision};receipts.set(cmd.idempotencyKey,{fingerprint,result:clone(result)});return result;
  }
  function command(campaignId, cmd) {
    const fingerprint = JSON.stringify({campaignId,...cmd});
    if (receipts.has(cmd.idempotencyKey)) {
      const prior = receipts.get(cmd.idempotencyKey);
      if (prior.fingerprint !== fingerprint) throw new Error('This save key was already used for different changes.');
      return clone(prior.result);
    }
    let c = campaign(campaignId), a = assignment(cmd.assignmentId);
    if (cmd.action === 'remove_creator') {
      if(!c||!a||a.campaignId!==c.id)throw new Error('This creator is not assigned to the campaign.');
      if(a.canEdit!==true)throw new Error('Removing this creator is unavailable.');
      if(a.revision!==cmd.expectedRevision)throw new Error('This creator record changed. Reload before removing.');
      if(cmd.data?.approved!==true)throw new Error('Confirm removing this creator from the campaign.');
      assignments.splice(assignments.indexOf(a),1);
      const current=sampleAutomation(c.id);
      current.enrolledAssignmentIds=current.enrolledAssignmentIds.filter(id=>id!==a.id);
      current.enrolledCreatorCount=current.enrolledAssignmentIds.length;
      if(!current.enrolledCreatorCount){current.email.enabled=false;current.shipments.enabled=false;}
      current.revision++;c.revision++;
      const result={campaignId,assignmentId:a.id,removed:true};
      receipts.set(cmd.idempotencyKey,{fingerprint,result:clone(result)});
      return result;
    } else if (cmd.action === 'delete_campaign') {
      if(!c)throw new Error('Campaign unavailable.');
      if(campaigns.some(row=>row.workspaceParentId===c.id))throw new Error('Separate linked types before deleting this campaign workspace.');
      if(c.canEdit!==true||cmd.assignmentId!=null)throw new Error('Campaign deletion is unavailable.');
      if(c.revision!==cmd.expectedRevision)throw new Error('This campaign changed. Reload it before deleting.');
      if(cmd.data?.approved!==true)throw new Error('Confirm permanent deletion before continuing.');
      if(!c.name||cmd.data?.confirmName!==c.name)throw new Error('Type the exact campaign name to confirm deletion.');
      campaigns.splice(campaigns.indexOf(c),1);
      for(let i=assignments.length-1;i>=0;i--)if(assignments[i].campaignId===campaignId)assignments.splice(i,1);
      automations.delete(campaignId);
      const result={campaignId,deleted:true};
      receipts.set(cmd.idempotencyKey,{fingerprint,result:clone(result)});
      return result;
    } else if (cmd.action === 'campaign') {
      const d = {...cmd.data};
      if(Object.hasOwn(d,'workspaceParentId')&&d.workspaceParentId){
        const parent=campaign(d.workspaceParentId);
        if(!parent||parent.id===campaignId||parent.workspaceParentId||campaigns.some(row=>row.workspaceParentId===campaignId))throw new Error('Choose a separate editable campaign workspace.');
      }
      if(Object.hasOwn(d,'ownerId')){
        if(d.ownerId&&!managers.some(person=>person.id===d.ownerId))throw Error('Choose an active employee.');
        d.ownerName=managers.find(person=>person.id===d.ownerId)?.name||null;
      }
      if (!d.name || !d.brand || !d.productName) throw new Error('Enter a campaign name, brand, and product.');
      if (c && c.revision !== cmd.expectedRevision) throw new Error('This campaign changed. Reload it before saving.');
      if (!c) { c = {id: uuid(sequence++),revision:0,canEdit:true}; campaigns.push(c); }
      Object.assign(c, clone(d), {revision:c.revision+1});
    } else if (cmd.action === 'automation') {
      if(!c)throw new Error('Choose a campaign.');
      const current=sampleAutomation(c.id),d=cmd.data;
      if(current.revision!==cmd.expectedRevision)throw new Error('Automation settings changed. Reload before saving.');
      if((d.emailEnabled||d.shipmentsEnabled)&&d.approved!==true)throw new Error('Review and approve the requested checks before saving.');
      if((d.emailEnabled||d.shipmentsEnabled)&&!d.enrolledAssignmentIds?.length)throw new Error('Select at least one creator to enroll before requesting checks.');
      if(d.emailEnabled||d.mailboxBindingId)throw new Error('No verified mailbox is connected in the sample workspace.');
      if(!Array.isArray(d.enrolledAssignmentIds)||d.enrolledAssignmentIds.length>100||d.enrolledAssignmentIds.some(id=>!assignments.some(a=>a.id===id&&a.campaignId===c.id)))throw new Error('Choose enrolled creators from this campaign, up to 100.');
      current.enrolledAssignmentIds=[...new Set(d.enrolledAssignmentIds)];current.enrolledCreatorCount=current.enrolledAssignmentIds.length;
      current.email.enabled=d.emailEnabled===true;current.shipments.enabled=d.shipmentsEnabled===true;current.revision++;
    } else if (cmd.action === 'roster_add') {
      if (!c) throw new Error('Choose a campaign.');
      for (const creatorId of cmd.data.creatorIds) {
        const cr = creators.find(item => item.id === creatorId);
        if (!cr) throw new Error('Creator unavailable.');
        if (assignments.some(item => item.campaignId === c.id && item.creatorId === creatorId)) continue;
        assignments.push({id:uuid(sequence++),campaignId:c.id,creatorId,creatorDisplayName:cr.displayName,creatorCode:cr.code,creatorHandle:cr.accounts?.[0]?.handle,
          accounts:clone(cr.accounts),categories:clone(cr.categories),posts:[],phase:null,revision:0,engagementType:c.type,feeAmount:null,feeCurrency:c.currency,
          canEdit:true,canFinance:true,canShip:true,finance:{referred:false,status:'pending',amount:null,currency:c.currency,w9Status:'missing',invoiceStatus:'missing',urgency:'normal'},
          shipment:{requested:false,status:'unknown',productName:c.productName,brand:c.brand}});
      }
    } else {
      if (!c || !a || a.campaignId !== c.id) throw new Error('This creator is not assigned to the campaign.');
      if (a.revision !== cmd.expectedRevision) throw new Error('This creator record changed. Reload before saving.');
      const d = clone(cmd.data);
      if (cmd.action === 'phase') {
        if (!Number.isInteger(d.phase) || d.phase < 1 || d.phase > 5 || !d.approved) throw new Error('Choose a phase and confirm your approval.');
        a.phase = d.phase; a.phaseReason = d.phaseReason;
      } else if (cmd.action === 'assignment') {
        if(d.feeAmount!=null&&(!Number.isFinite(d.feeAmount)||d.feeAmount<0))throw new Error('Enter a valid fee.');
        if(Array.isArray(d.deliverables))d.deliverables=d.deliverables.map(row=>{
          const previous=a.assignmentDetails?.deliverables?.find(p=>p.id===row.id)||{};
          return {...Object.fromEntries(DELIVERABLE_PUBLICATION_KEYS.filter(k=>!Object.hasOwn(row,k)&&Object.hasOwn(previous,k)).map(k=>[k,previous[k]])),...row};
        });
        Object.assign(a,d);a.assignmentDetails={...a.assignmentDetails,...d};
        if(assignmentPublications(a).length)a.finance={...a.finance,referred:true};
      } else if (cmd.action === 'finance_referral') a.finance.referred = true;
      else if (cmd.action === 'finance') {
        if(a.finance.status==='paid')throw new Error('Paid payment facts are read-only.');
        if (d.amount !== null && (!Number.isFinite(d.amount) || d.amount < 0)) throw new Error('Enter a valid amount.');
        for (const type of ['w9','invoice']) if (d[type+'Status'] === 'approved' && !d[type+'DocumentId']) throw new Error('Select the protected document before recording approval.');
        if (d.status === 'paid') throw new Error('Sample mode cannot record a real payment. Connected payment evidence and approvals are required.');
        a.finance = {...a.finance,...d,referred:true,dueDate:Object.hasOwn(d,'dueDate')?d.dueDate:net30Date(d.liveDate)};
      } else if (cmd.action === 'shipment') {
        const identityChanged = d.trackingNumber !== a.shipment.trackingNumber || d.carrier !== a.shipment.carrier;
        a.shipment = {...a.shipment,...d,requested:true,requestedAt:a.shipment.requestedAt || (a.shipment.requested ? null : new Date().toISOString()),...(identityChanged?{status:'unknown',sourceUrl:null,checkedAt:null}:{})};
      } else if(cmd.action==='action_review'){
        const reply=replies.find(r=>r.id===d.actionId&&r.assignmentId===a.id&&r.campaignId===c.id);
        if(!reply||!['reviewed','dismissed'].includes(d.status))throw new Error('This reply is unavailable.');
        reply.status=d.status;
      } else throw new Error('This action is unavailable in the sample workspace.');
      a.revision++;
    }
    const result = read('campaign', c.id);
    receipts.set(cmd.idempotencyKey,{fingerprint,result:clone(result)});
    return result;
  }
  function conversation(scope){
    const a=assignment(scope.assignmentId),reply=replies.find(r=>r.assignmentId===a?.id&&r.sourceUrl.endsWith('/'+scope.providerThreadId));
    if(!a||a.campaignId!==scope.campaignId||!reply)throw Error('Sample conversation unavailable.');
    return {...scope,creatorName:a.creatorDisplayName,subject:'Lumen Grove · Daily Cream collaboration',mailboxEmail:'preview@example.invalid',contextHash:'a'.repeat(32),historyId:'sample-history-1',canSaveDraft:true,complete:true,sent:false,
      suggestedReply:{id:'sample-suggestion-1',incomingMessageId:'sample-msg-2',language:'en',body:'Thanks for sharing your availability!\n\nWe will confirm the brief and draft deadline before you begin filming. Is there a particular day next week that works best for you?'},
      replyTarget:{to:'creator@example.invalid',messageId:'sample-msg-2'},messages:[
        {id:'sample-msg-1',at:'2026-10-09T17:00:00Z',author:'BYOU team',direction:'outbound',body:'Hi! We would love to discuss a Daily Cream collaboration. Could you share your availability?',bodyComplete:true,attachmentCount:0},
        {id:'sample-msg-2',demoImage:true,at:'2026-10-10T18:00:00Z',author:a.creatorDisplayName,direction:'inbound',body:'Thanks for the invitation! I am available next week.\n\nPlease send the brief and the draft deadline.\n\n\n\nOn Fri, Oct 9, 2026, BYOU team wrote:\n> Hi! We would love to discuss a Daily Cream collaboration. Could you share your availability?',bodyComplete:true,attachmentCount:0}
      ]};
  }
  const storage=globalThis.localStorage;
  const key='portfolio_iq_operations_v2';
  try {const saved=JSON.parse(storage?.getItem(key)||'null');if(saved){sequence=saved.sequence;for(const [target,source] of [[campaigns,saved.campaigns],[assignments,saved.assignments],[replies,saved.replies]])target.splice(0,target.length,...source);for(const [target,source] of [[automations,saved.automations],[receipts,saved.receipts],[unpaidSnapshots,saved.unpaidSnapshots],[batchReviews,saved.batchReviews],[delaySchedules,saved.delaySchedules]])for(const [k,v] of source||[])target.set(k,v);}}catch{}
  const persist=()=>storage?.setItem(key,JSON.stringify({sequence,campaigns,assignments,replies,automations:[...automations],receipts:[...receipts],unpaidSnapshots:[...unpaidSnapshots],batchReviews:[...batchReviews],delaySchedules:[...delaySchedules]}));
  const syncCreators=()=>{try{for(const creator of JSON.parse(storage?.getItem('portfolio_iq_creators_v2')||'[]'))if(!creators.some(c=>c.id===creator.id))creators.push(creator);}catch{}};
  const write=fn=>(...args)=>{syncCreators();const result=fn(...args);persist();return result;};
  persist();
  return {managerChoices:()=>clone(managers),read:(...args)=>{syncCreators();return read(...args);},command:write(command),batchCommand:write(batchCommand),conversation,confirmPayment:write(confirmPayment),undoPayment:write(undoPayment),get creators(){syncCreators();return clone(creators);}};
}
