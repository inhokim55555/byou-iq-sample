const labels={in_flight:'Managed run in progress',waiting_for_approval:'Waiting for human approval',draft_requires_human_review:'Draft needs human review',unavailable:'Managed result unavailable',unknown:'Outcome needs reconciliation',stale:'Source changed — result stale'};
export function managedWorkflowReviewItems(journey){
 if(journey.managedResultsUnavailable)return [{id:'managed-results-unavailable',title:'Managed Fleet results',status:labels.unavailable,
  nextAction:'Saved agent results could not be loaded. Reload saved records; do not start another run.'}];
 return (Array.isArray(journey.managedResults)?journey.managedResults:[]).filter(row=>row?.binding?.assignmentId===journey.assignmentId
  &&row.binding.creatorId===journey.creatorId&&row.binding.campaignId===journey.campaignId
  &&row.binding.simulation===true&&row.executed===false&&row.sent===false&&row.requiresHumanReview===true&&labels[row.status]).map(row=>({
   id:row.id,title:`Simulation: ${row.binding.workflowType} workflow result`,status:labels[row.status],
   evidenceExcerpt:row.status==='draft_requires_human_review'?row.draft?.body:null,sourceDate:row.createdAt,
   sourceRecordId:row.id,confidence:null,reviewDetails:{unresolved:row.draft?.unresolved||[],evidenceIds:row.draft?.evidenceIds||[],humanizerAudit:row.draft?.humanizerAudit||null,
    runReferences:row.roles.map(r=>({role:r.role,runId:r.runId}))},nextAction:row.status==='draft_requires_human_review'
    ?'Review facts, unresolved questions and tone. This simulated draft does not authorize sending.'
    :row.status==='waiting_for_approval'?'Review the paused Fleet run. Refreshing saved results does not approve or resume it.'
    :'Inspect the saved result and current evidence. Do not retry an unresolved run.'
  }));
}
