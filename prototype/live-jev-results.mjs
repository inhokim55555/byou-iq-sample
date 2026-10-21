export function liveJevReviewItems(journey){
 if(!Array.isArray(journey?.jevResults))return [];
 return journey.jevResults.filter(r=>r.assignmentId===journey.assignmentId&&r.creatorId===journey.creatorId&&r.campaignId===journey.campaignId).map(r=>({
  id:'jev-'+r.id,title:r.status==='proposal'?'Jev workflow proposal':'Jev reply needs review',status:r.status.replaceAll('_',' '),
  sourceUrl:r.sourceUrl,sourceDate:r.sourceDate,evidenceExcerpt:r.proposal?.evidence?.map(e=>e.excerpt).join('\n')||null,
  nextAction:r.proposal?.nextStep||r.reason||'Waiting for classification',confidence:null,
  reviewDetails:{provider:'Jev',model:r.proposal?.model||null,handbookVersion:r.handbookVersion,policyVersion:r.actionPolicyVersion,
   staffRecordedType:r.staffRecordedType,proposedType:r.proposal?.proposedAgreedType??null,missingFacts:r.proposal?.reviewItems||[],
   supportedEvidence:r.proposal?.evidence||[],allowedActions:[],executed:false}
 }));
}
