import {renderTemplateFields} from './template-fields.mjs';
import {renderEmailComposer} from './email-composer.mjs';
export const TEMPLATE_KINDS=[['paid','Paid'],['seeding','Seeding'],['challenge_complete','Challenge completed'],['korean','체험단'],['other','Other']];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function campaignCategoryLabel(value=''){
 const labels={'haircare':'Hair Care','skincare':'Skin Care','makeup':'Makeup','bodycare':'Body Care','fragrance':'Fragrance','wellness':'Wellness','lifestyle':'Lifestyle'};
 return labels[String(value).toLowerCase().replace(/[\s_-]+/g,'')] || value;
}
export function campaignCategory(value=''){
 const categories=['Hair Care','Skin Care','Makeup','Body Care','Fragrance','Wellness','Lifestyle'];
 const standard=categories.find(c=>c.toLowerCase().replaceAll(' ','')===value.toLowerCase().replaceAll(' ',''));
 const custom=!!value&&!standard;
 return `<label><span>Category · Optional</span><select name="categoryChoice"><option value="">Choose a category</option>${categories.map(c=>`<option value="${c}"${c===standard?' selected':''}>${c}</option>`).join('')}<option value="custom"${custom?' selected':''}>Other category…</option></select></label><label data-custom-category${custom?'':' hidden'}><span>Custom category</span><input name="category" maxlength="120" value="${esc(custom?value:'')}" placeholder="Enter your category"></label>`;
}
export function campaignTimezone(value='America/Los_Angeles'){
 const choices=[['America/Los_Angeles','Los Angeles (Pacific Time)'],['America/Denver','Denver (Mountain Time)'],['America/Chicago','Chicago (Central Time)'],['America/New_York','New York (Eastern Time)'],['Asia/Seoul','Seoul (Korea Time)'],['UTC','UTC']];
 if(!choices.some(([id])=>id===value))choices.push([value,value.replaceAll('_',' ')]);
 return `<label><span>Timezone <small class="ops-field-cue">Required</small></span><select name="timezone" required>${choices.map(([id,label])=>`<option value="${esc(id)}"${id===value?' selected':''}>${esc(label)}</option>`).join('')}</select></label>`;
}
export function campaignTemplates(value){
 const selected=TEMPLATE_KINDS.some(([id])=>id===value.activeTemplate)?value.activeTemplate:['paid','seeding'].includes(value.type)?value.type:'paid';
 const templates=value.templates||{},template=templates[selected]||{};
 return `<fieldset class="ops-templates"><legend>Templates · Optional at setup</legend><input type="hidden" data-current-template value="${selected}"><input type="hidden" name="templatesJSON" value="${esc(JSON.stringify(templates))}">
 <div class="ops-fields"><label><span>Template</span><select name="activeTemplate">${TEMPLATE_KINDS.map(([id,label])=>`<option value="${id}"${selected===id?' selected':''}>${label}${templates[id]?.body?' · Saved':''}</option>`).join('')}</select></label>
 <label class="ops-template-import"><span>Use a saved message</span><input type="file" data-template-import accept=".txt,.html,.htm"><small class="ops-note">Import TXT or HTML, or paste from your document.</small></label>
 </div>${renderTemplateFields((template.subject||'')+'\n'+(template.body||''))}<div class="ops-fields"><label class="ops-wide"><span>Email subject</span><input name="templateSubject" maxlength="240" data-no-translate value="${esc(template.subject)}"></label></div>
 ${renderEmailComposer({name:'templateBody',body:template.body||'',document:template.document,attachments:template.attachments||[],label:'Email message',showSender:false,allowFileReferences:true})}</fieldset>`;
}
export function campaignFiles(value){
 const resources=value.resources||[];
 return `<details class="ops-optional" data-ops-disclosure="resources"${resources.length?' open':''}><summary>Files &amp; references · Optional</summary><fieldset><p class="ops-template-note">Keep brand decks, product photos and campaign references with this campaign.</p>
 <label class="ops-file-upload"><span>Upload a campaign file</span><input type="file" data-ops-upload="resource" accept=".pdf,.png,.jpg,.jpeg,.txt,.docx"><small class="ops-note">PDF, images, TXT or DOCX · up to 5 MB per file</small></label>
 ${resources.map((r,i)=>`<div class="ops-resource-row"><input type="hidden" name="resourceId" value="${esc(r.id)}"><input type="hidden" name="resourceFileId" value="${esc(r.fileId)}"><div class="ops-fields"><label><span>File name</span><input name="resourceName" maxlength="200" value="${esc(r.name)}"></label><label><span>File type</span><select name="resourceKind">${[['brand_kit','Brand kit'],['product_deck','Product deck'],['other','Other reference']].map(([k,label])=>`<option value="${k}"${r.kind===k?' selected':''}>${label}</option>`).join('')}</select></label>${r.fileId?`<input type="hidden" name="resourceUrl" value=""><a class="ops-wide" href="/api/campaign-files/${esc(r.fileId)}" target="_blank" rel="noopener noreferrer">Download saved file</a>`:`<label class="ops-wide"><span>Reference link</span><input name="resourceUrl" type="url" maxlength="2000" value="${esc(r.url)}" placeholder="https://"></label>`}</div><div class="ops-actions"><button type="button" class="button button--secondary" data-ops-action="remove-resource" data-ops-value="${i}">Remove from campaign</button></div></div>`).join('')}
 <button type="button" class="button button--secondary" data-ops-action="add-resource">Add a reference link</button></fieldset></details>`;
}
