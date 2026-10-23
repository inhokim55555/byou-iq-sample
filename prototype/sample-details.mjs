// Entirely invented fixtures. No real addresses, carrier IDs, or connected accounts.
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
export const pastCampaigns = [
  {id:id(3),name:'Summer glow',brand:'Lumen Grove',productName:'Dew Serum',type:'paid',startDate:'2026-07-01',endDate:'2026-07-31'},
  {id:id(4),name:'Weekend essentials',brand:'Fieldnote',productName:'Travel Kit',type:'paid',startDate:'2026-08-01',endDate:'2026-08-31'}
];
export function sampleShipment(creator,index,campaign,month='10') {
  const day=String(5+index%10).padStart(2,'0');
  return {requested:true,requestedAt:`2026-${month}-${day}T16:00:00Z`,fullName:creator.displayName,
    address:`${100+index} Fictional Grove Lane\nUnit ${index+1}\nSample City, CA 00000\nUnited States`,
    productName:campaign.productName,brand:campaign.brand,shipmentType:campaign.type,pic:['Alex Rivera','Jordan Vale','Sam Linden'][index%3],
    boxSize:index%2?'10 × 8 × 4 in':'8 × 6 × 4 in',shippingCost:6.75+(index%4)*1.25,carrier:'Sample carrier',
    trackingOriginal:`DEMO-ORDER-${month}-${String(index+1).padStart(3,'0')}`,trackingNumber:`DEMO-TRACK-${month}-${String(index+1).padStart(3,'0')}`,
    packingDate:`2026-${month}-${day}`,status:month==='10'?(index%2?'in_transit':'delivered'):'delivered',
    sourceUrl:null,checkedAt:`2026-${month}-20T16:00:00Z`,notes:['Two units packed; protective sleeve included.','Gift set packed; include product guide.','Delivery completed; creator follow-up ready.'][index%3]};
}
export function sampleProfile(creator,index) {
  const platform=creator.accounts[0].platform;
  const history=pastCampaigns.map((c,j)=>({id:id(3000+index*10+j),campaignId:c.id,campaign_name:c.name,campaign_type:c.type,
    brand:c.brand,start_date:c.startDate,end_date:c.endDate,staffManaged:true,agreed_fee:350+index*25+j*100,currency:'USD',
    usageRights:'30 days organic usage; paid usage excluded',deliverables:[{platform,format:'short_video',quantity:1}]}));
  const posts=history.map((h,j)=>({id:id(5000+index*10+j),assignment_id:h.id,platform,url:`https://example.invalid/content/creator-${index+1}/campaign-${j+3}`,
    caption:j?'A weekend routine with the Fieldnote Travel Kit.':'Morning skincare routine featuring Lumen Grove Dew Serum.',
    published_at:`2026-0${7+j}-18T16:00:00Z`,metrics:[{code:'views',value:12000+index*1700+j*3200,observedAt:'2026-10-20T12:00:00Z'},{code:'likes',value:480+index*70+j*100,observedAt:'2026-10-20T12:00:00Z'}]}));
  return {...creator,canEdit:true,brands:['Lumen Grove','Fieldnote'],history,historyCount:history.length,posts,
    relationships:pastCampaigns.map(c=>({campaignId:c.id,campaignName:c.name,campaignType:c.type,brand:c.brand,brandKey:c.brand,brandName:c.brand,stage:'delivered'})),
    latestCollaboration:{campaignName:history[1].campaign_name,postedAt:posts[1].published_at,amount:history[1].agreed_fee,currency:'USD'},
    latestFeeRecord:{amount:history[1].agreed_fee,currency:'USD'},
    collaborationTypes:['paid'],coverage:{verifiedPosts:posts.length},portfolioPosts:[],sourcePackages:[],agency:null,
    bio:'Skincare and lifestyle routines with practical product demonstrations.',
    accounts:creator.accounts.map(a=>({...a,avgViews:13600+index*1700,engagementRate:3.1+index%6*.2})),
    paymentObligations:history.map((h,j)=>({id:id(6000+index*10+j),assignmentId:h.id,amount:h.agreed_fee,currency:'USD',workflowStatus:'paid',invoiceStatus:'invoice_received',paidOn:`2026-0${8+j}-20`,paymentReference:`DEMO-PAY-${index+1}-${j+1}`})),
    rateCards:[{id:id(7000+index),platform,format:'short_video',amount:500+index*25,currency:'USD',sourceKind:'staff_record',recordedOn:'2026-10-01'}]};
}
export function enrichOperations(creators,campaigns,assignments) {
  const base=assignments.slice();
  campaigns[0].budget=18000;
  campaigns[1].startDate='2026-10-05';campaigns[1].endDate='2026-11-15';campaigns[1].status='active';
  campaigns.forEach((c,i)=>{c.ownerId=id(910+i%3);c.ownerName=['Alex Rivera','Jordan Vale','Sam Linden'][i%3];});
  for (const c of pastCampaigns) campaigns.push({...c,status:'completed',timezone:'America/Los_Angeles',currency:'USD',budget:12000,revision:0,canEdit:true,resources:[],templates:structuredClone(campaigns[0].templates),ownerId:id(910),ownerName:'Alex Rivera',ownerOptions:structuredClone(campaigns[0].ownerOptions)});
  creators.forEach((creator,i)=>{
    Object.assign(creator,sampleProfile(creator,i));
    if(i>5){base[i].phase=i%5+1;base[i].phaseReason='Campaign brief shared; creator workflow in progress.';}
    if(i>=2)base[i].shipment=sampleShipment(creator,i,campaigns[0]);
    for(const [j,h] of creator.history.entries()) assignments.push({...structuredClone(base[i]),id:h.id,campaignId:h.campaignId,phase:5,phaseReason:'Content delivered and payment completed.',feeAmount:h.agreed_fee,posts:creator.posts.filter(p=>p.assignment_id===h.id),
      progressContext:{state:'ready',pendingReplyCount:0,communications:[]},shipment:sampleShipment(creator,i,pastCampaigns[j],`0${7+j}`),
      finance:{referred:true,amount:h.agreed_fee,currency:'USD',w9Status:'verified',invoiceStatus:'verified',w9DocumentId:null,invoiceDocumentId:null,method:'ACH',liveDate:`2026-0${7+j}-18`,dueDate:`2026-0${8+j}-17`,status:'paid',urgency:'normal',paidOn:`2026-0${8+j}-17`,paymentReference:`DEMO-PAY-${i+1}-${j+1}`}});
    assignments.push({...structuredClone(base[i]),id:id(4000+i),campaignId:id(2),phase:i%3+2,engagementType:'seeding',feeAmount:null,phaseReason:'Product seeding and creator follow-up.',posts:[],progressContext:{state:'ready',pendingReplyCount:0,communications:[]},
      shipment:sampleShipment(creator,i+10,campaigns[1]),finance:{referred:false,amount:null,currency:'USD',status:'pending'}});
  });
}
