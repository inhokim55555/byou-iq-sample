export const TEMPLATE_FALLBACKS = Object.freeze({creatorName:'there',campaignName:'this campaign',brand:'our brand',productName:'this product'});
const tokenPattern = /\{\{\s*(\w+)\s*(?:\|([^{}|]*))?\}\}/g;
export function validTemplateFallback(value) {
  return typeof value==='string' && value.trim().length>0 && value.length<=80 && !/[{}|\u0000-\u001f\u007f]/.test(value);
}
export function expandTemplateText(text,values={}) {
  if(typeof text!=='string')throw new Error('Save the campaign email template first.');
  const result=text.replace(tokenPattern,(_,key,fallback)=>{
    if(!Object.hasOwn(TEMPLATE_FALLBACKS,key)||fallback!==undefined&&!validTemplateFallback(fallback))throw new Error('Review the missing or unsupported email field.');
    return String(values[key]??'').trim() || (fallback===undefined?TEMPLATE_FALLBACKS[key]:fallback.trim());
  });
  if(/\{\{|\}\}|\u0000/.test(result)||!result.trim())throw new Error('Review the template fields before preparing outreach.');
  return result;
}
export function readTemplateFallbacks(text='') {
  const result={...TEMPLATE_FALLBACKS};
  for(const match of text.matchAll(tokenPattern))if(Object.hasOwn(result,match[1])&&validTemplateFallback(match[2]))result[match[1]]=match[2].trim();
  return result;
}
export function saveTemplateFallbacks(text,fallbacks) {
  return text.replace(tokenPattern,(original,key)=>{
    if(!Object.hasOwn(TEMPLATE_FALLBACKS,key))return original;
    const fallback=fallbacks[key];
    if(!validTemplateFallback(fallback))throw new Error('Enter fallback wording of 1–80 characters without braces or a vertical bar.');
    return `{{${key}|${fallback.trim()}}}`;
  });
}
