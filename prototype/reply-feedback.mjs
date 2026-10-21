const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function replyFeedbackCommand({baselineSuggestionId,requestId,savedBody},receipt){
 if(receipt?.status!=='saved'||receipt.sent!==false||!receipt.providerMessageId||!uuid.test(baselineSuggestionId||'')||!uuid.test(requestId||'')||typeof savedBody!=='string')return null;
 return {requestId,baselineSuggestionId,editedBody:savedBody};
}
