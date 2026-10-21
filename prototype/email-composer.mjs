import {installTemplateFields} from './template-fields.mjs';
import {escapeEmail as esc,plainDocument,documentHtml,documentText,validateEmailDocument,validateAttachments,ATTACHMENT_TYPES,safeEmailLink} from './email-content.mjs';

export function renderEmailComposer({name='body',body='',document:doc,attachments=[],allowAttachments=true,allowFileReferences=false,disabled=false,label='Message',recipient='',showSender=true,sender='sample-team@example.invalid'}={}){
 const model=doc||plainDocument(body);
 const icon=kind=>{const lines=kind==='left'?[[3,4,21,4],[3,9,15,9],[3,14,21,14],[3,19,15,19]]:kind==='right'?[[3,4,21,4],[9,9,21,9],[3,14,21,14],[9,19,21,19]]:[[3,4,21,4],[6,9,18,9],[3,14,21,14],[6,19,18,19]];return `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6">${lines.map(l=>`<path d="M${l[0]} ${l[1]}H${l[2]}"/>`).join('')}</svg>`;};
 const button=(cmd,text,title)=>`<button type="button" data-compose-command="${cmd}" title="${title}" aria-label="${title}" ${disabled?'disabled':''}>${text}</button>`;
 return `<section class="email-composer" data-composer="${esc(name)}" data-file-references="${allowFileReferences}" data-files="${esc(JSON.stringify(attachments))}">
 <div class="composer-heading"><strong data-i18n>${esc(label)}</strong><span data-i18n>Draft</span></div>
 ${recipient?`<div class="composer-address"><span data-i18n>To</span><strong data-no-translate>${esc(recipient)}</strong></div>`:''}${showSender?`<div class="composer-address"><span data-i18n>From</span><span data-no-translate>${esc(sender)}</span></div>`:''}
 <input type="hidden" name="${esc(name)}" value="${esc(body)}"><input type="hidden" data-compose-document value="${esc(JSON.stringify(model))}">
 <div class="composer-body" data-compose-body data-no-translate contenteditable="${!disabled}" role="textbox" aria-label="${esc(label)}" aria-multiline="true" spellcheck="true" tabindex="0">${documentHtml(model,{attachments,preview:true})}</div>
 <div class="composer-toolbar" role="toolbar" aria-label="Email formatting" data-i18n>
 ${button('undo','↶','Undo')}${button('redo','↷','Redo')}<span class="composer-divider"></span>
 <select data-compose-font aria-label="Font" ${disabled?'disabled':''}><option value="Arial">Sans serif</option><option value="Georgia">Serif</option><option value="monospace">Monospace</option></select><select data-compose-size aria-label="Font size" ${disabled?'disabled':''}><option value="3">Normal</option><option value="2">Small</option><option value="5">Large</option><option value="6">Huge</option></select>
 ${button('bold','<b>B</b>','Bold (Ctrl+B)').replace('type="button"','type="button" aria-pressed="false"')}${button('italic','<i>I</i>','Italic (Ctrl+I)').replace('type="button"','type="button" aria-pressed="false"')}${button('underline','<u>U</u>','Underline (Ctrl+U)').replace('type="button"','type="button" aria-pressed="false"')}<span class="composer-divider"></span>
 ${button('justifyLeft',icon('left'),'Align left')}${button('justifyCenter',icon('center'),'Align center')}${button('justifyRight',icon('right'),'Align right')}
 ${button('insertUnorderedList','• ≡','Bulleted list')}${button('insertOrderedList','1. ≡','Numbered list')}<span class="composer-divider"></span>${button('link','Link','Insert link')}${allowAttachments?'<button type="button" data-compose-image aria-label="Insert image" '+(disabled?'disabled':'')+'>Image</button>':''}${attachmentMenu(allowAttachments,disabled)}
 </div><div class="composer-link" data-compose-link hidden><label data-i18n>Link address<input type="url" data-compose-url placeholder="https://"></label><button type="button" data-compose-command="applyLink">Apply link</button><button type="button" data-compose-command="cancelLink">Cancel</button></div>
 <div class="composer-attachments" data-compose-attachments>${attachmentChips(attachments,disabled)}</div>
 <input type="file" data-compose-image-file accept=".png,.jpg,.jpeg" hidden ${disabled?'disabled':''}><input type="file" data-compose-files accept=".pdf,.png,.jpg,.jpeg,.txt,.docx" multiple hidden ${disabled?'disabled':''}>
 <p class="composer-status" data-compose-status data-i18n role="status" aria-live="polite"></p></section>`;
}
function attachmentChips(files,disabled=false){return files.map((f,i)=>`<div class="composer-file"><span data-no-translate>▤ ${esc(f.name)} <small>${Math.ceil(f.size/1024)} KB</small></span><button type="button" data-compose-remove="${i}" aria-label="Remove attachment" ${disabled?'disabled':''}>×</button></div>`).join('');}
export function readEmailComposer(el){
 if(el.dataset.uploading)throw new Error('Wait for the attachments to finish loading.');
 const doc=readDocument(el.querySelector('[data-compose-body]')),attachments=JSON.parse(el.dataset.files||'[]');
 validateEmailDocument(doc);validateAttachments(attachments,{allowReferences:el.dataset.fileReferences==='true'});return {body:documentText(doc),document:doc,attachments};
}
export function setEmailComposer(el,{body='',document:doc,attachments=[]}){const model=doc||plainDocument(body);el.querySelector('[data-compose-body]').innerHTML=documentHtml(model,{attachments,preview:true});el.dataset.files=JSON.stringify(attachments);el.querySelector('[data-compose-attachments]').innerHTML=attachmentChips(attachments);sync(el);}
// Read only supported marks from the editable DOM; pasted HTML never crosses the boundary.
export function readDocument(body){
 const blocks=[];let runs=[];
 const flush=(type='paragraph',align='left',force=false)=>{if(runs.length||force){blocks.push({type,align,runs:runs.length?runs:[{text:''}]});runs=[];}};
 function walk(node,marks={},type='paragraph',align='left'){
  if(node.nodeType===3){if(node.textContent)runs.push({...marks,text:node.textContent});return;}
  if(node.nodeType!==1)return;const tag=node.tagName;
  if(tag==='IMG'){const imageId=node.getAttribute('data-email-image');if(/^[0-9a-f-]{36}$/i.test(imageId||'')){flush();blocks.push({type:'image',imageId,alt:(node.getAttribute('alt')||'Product image').slice(0,200)});}return;}
  if(['SCRIPT','STYLE','IFRAME','OBJECT'].includes(tag))return;
  const block=['DIV','P','LI'].includes(tag);if(block)flush(type,align);const start=blocks.length;
  const m={...marks};const family=(node.getAttribute('face')||node.style.fontFamily||'').toLowerCase();if(family)m.font=family.includes('georgia')||family.includes('times')?'serif':family.includes('mono')||family.includes('courier')?'mono':'sans';if(['B','STRONG'].includes(tag)||Number(node.style.fontWeight)>=600)m.bold=true;
  if(['I','EM'].includes(tag)||node.style.fontStyle==='italic')m.italic=true;if(tag==='U'||node.style.textDecoration.includes('underline'))m.underline=true;
  const size=node.getAttribute('size')||node.style.fontSize;if(size)m.size=({'1':'small','2':'small','3':'normal','4':'large','5':'large','6':'huge','7':'huge','12px':'small','14px':'normal','18px':'large','24px':'huge'})[size]||'normal';
  if(tag==='A'&&safeEmailLink(node.getAttribute('href')))m.href=node.getAttribute('href');
  const t=tag==='LI'?(node.parentElement.tagName==='OL'?'number':'bullet'):type,a=['left','center','right'].includes(node.style.textAlign)?node.style.textAlign:align;
  if(tag==='BR'){runs.push({...m,text:'\n'});return;}
  for(const child of node.childNodes)walk(child,m,t,a);
  if(block){if(runs.length===1&&runs[0].text==='\n')runs[0].text='';flush(t,a,blocks.length===start);}
 }
 for(const child of body.childNodes)walk(child);flush();return {version:1,blocks:blocks.length?blocks:[{type:'paragraph',runs:[{text:''}]}]};
}
export function importEmailHtml(html,ownerDocument=document){
 const template=ownerDocument.createElement('template');template.innerHTML=html;
 const doc=readDocument(template.content);validateEmailDocument(doc);return doc;
}
function sync(el){delete el.dataset.invalid;const doc=readDocument(el.querySelector('[data-compose-body]'));validateEmailDocument(doc);el.querySelector('[data-compose-document]').value=JSON.stringify(doc);el.querySelector(`input[name]`).value=documentText(doc);el.dispatchEvent(new CustomEvent('composerchange',{bubbles:true}));}
const installed=new WeakSet();
export function installEmailComposers(root){
 if(installed.has(root))return;installed.add(root);installTemplateFields(root);const selections=new WeakMap();
 // Composer menu dismissal
 root.addEventListener('keydown',e=>{const el=e.target.closest('[data-composer]'),menu=el?.querySelector('[data-compose-menu]');if(e.key==='Escape'&&menu&&!menu.hidden){e.preventDefault();e.stopPropagation();menu.hidden=true;const toggle=el.querySelector('[data-compose-menu-toggle]');toggle.setAttribute('aria-expanded','false');toggle.focus();}});
 root.addEventListener('click',e=>{for(const menu of root.querySelectorAll('[data-compose-menu]:not([hidden])'))if(!menu.parentElement.contains(e.target)){menu.hidden=true;menu.parentElement.querySelector('[data-compose-menu-toggle]').setAttribute('aria-expanded','false');}});
 root.addEventListener('beforeinput',e=>{const el=e.target.closest('[data-composer]');if(el&&locked(el))e.preventDefault();});
 const locked=el=>el.dataset.uploading==='true'||!!el.closest('fieldset[disabled]')||el.querySelector('[data-compose-body]').contentEditable==='false';
 const status=(el,text)=>{const node=el.querySelector('[data-compose-status]');node.textContent=text;node.classList.toggle('composer-status--notice',!/^(Unsaved |Pasted image added|\d+ attachments? ready)/.test(text));};
 const remember=el=>{const selection=el.ownerDocument.getSelection();if(selection.rangeCount&&el.querySelector('[data-compose-body]').contains(selection.anchorNode)){selections.set(el,selection.getRangeAt(0).cloneRange());for(const command of ['bold','italic','underline'])el.querySelector(`[data-compose-command="${command}"]`).setAttribute('aria-pressed',String(el.ownerDocument.queryCommandState(command)));const node=selection.anchorNode.nodeType===1?selection.anchorNode:selection.anchorNode.parentElement;const px=parseFloat(el.ownerDocument.defaultView.getComputedStyle(node).fontSize);const legacy=node.closest('font[size]')?.getAttribute('size');el.querySelector('[data-compose-size]').value=legacy?(['1','2'].includes(legacy)?'2':['4','5'].includes(legacy)?'5':['6','7'].includes(legacy)?'6':'3'):px<=12?'2':px>=24?'6':px>=18?'5':'3';}};
 const restore=el=>{el.querySelector('[data-compose-body]').focus();const range=selections.get(el);if(range){const selection=el.ownerDocument.getSelection();selection.removeAllRanges();selection.addRange(range);}};
 root.addEventListener('input',e=>{const el=e.target.closest('[data-composer]');if(!el||!e.target.closest('[data-compose-body]')||locked(el))return;try{sync(el);status(el,'Unsaved message');}catch(error){status(el,error.message);el.dataset.invalid='true';}});
 root.addEventListener('keyup',e=>{const el=e.target.closest('[data-composer]');if(el)remember(el);});
 root.addEventListener('mouseup',e=>{const el=e.target.closest('[data-composer]');if(el)remember(el);});
 root.addEventListener('mousedown',e=>{const el=e.target.closest('[data-composer]');if(!el)return;if(e.target.closest('[data-compose-command],[data-compose-size],[data-compose-font],[data-compose-menu-toggle],[data-compose-image],[data-compose-attach]')){remember(el);if(e.target.closest('button'))e.preventDefault();}});
 root.addEventListener('paste',async e=>{const el=e.target.closest('[data-composer]');if(!el||!e.target.closest('[data-compose-body]'))return;if(locked(el))return;
  const imageItem=[...(e.clipboardData?.items||[])].find(item=>item.kind==='file'&&['image/png','image/jpeg'].includes(item.type));
  if(imageItem){e.preventDefault();const file=imageItem.getAsFile();if(!file){status(el,'The copied image could not be read.');return;}
   const extension=file.type==='image/png'?'png':'jpg',existing=JSON.parse(el.dataset.files||'[]'),contentId=crypto.randomUUID();
   const descriptor={name:`Pasted image.${extension}`,type:file.type,size:file.size,contentId};
   try{validateAttachments([...existing,descriptor],{metadataOnly:true,allowReferences:el.dataset.fileReferences==='true'});el.dataset.uploading='true';status(el,'Reading pasted image…');
    const added=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('The copied image could not be read.'));reader.onload=()=>resolve({...descriptor,data:String(reader.result).split(',')[1]});reader.readAsDataURL(file);});
    if(!el.isConnected)return;const files=[...existing,added];validateAttachments(files,{allowReferences:el.dataset.fileReferences==='true'});el.dataset.files=JSON.stringify(files);el.querySelector('[data-compose-attachments]').innerHTML=attachmentChips(files);restore(el);el.ownerDocument.execCommand('insertHTML',false,`<div><img data-email-image="${added.contentId}" src="data:${added.type};base64,${added.data}" alt="${esc(added.name)}" style="max-width:100%;height:auto"></div><div><br></div>`);sync(el);status(el,'Pasted image added.');
   }catch(error){status(el,error.message);}finally{delete el.dataset.uploading;}return;
  }
  e.preventDefault();const html=e.clipboardData.getData('text/html');try{if(html){const doc=importEmailHtml(html,el.ownerDocument);el.ownerDocument.execCommand('insertHTML',false,documentHtml(doc));}else el.ownerDocument.execCommand('insertText',false,e.clipboardData.getData('text/plain'));sync(el);}catch(error){status(el,error.message);}});
 root.addEventListener('drop',e=>{if(e.target.closest('[data-compose-body]'))e.preventDefault();});
 root.addEventListener('click',e=>{const el=e.target.closest('[data-composer]');if(!el||locked(el))return;
  const menu=el.querySelector('[data-compose-menu]'),toggle=el.querySelector('[data-compose-menu-toggle]');
  if(e.target.closest('[data-compose-menu-toggle]')){menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden));return;}
  if(menu){menu.hidden=true;toggle.setAttribute('aria-expanded','false');}
  if(e.target.closest('[data-compose-image]')){remember(el);el.querySelector('[data-compose-image-file]').click();return;}
  if(e.target.closest('[data-compose-attach]')){el.querySelector('[data-compose-files]').click();return;}
  const remove=e.target.closest('[data-compose-remove]');if(remove){const files=JSON.parse(el.dataset.files),[removed]=files.splice(Number(remove.dataset.composeRemove),1);if(removed?.contentId)for(const img of el.querySelectorAll('[data-email-image]'))if(img.dataset.emailImage===removed.contentId)img.remove();el.dataset.files=JSON.stringify(files);el.querySelector('[data-compose-attachments]').innerHTML=attachmentChips(files);sync(el);return;}
  const button=e.target.closest('[data-compose-command]');if(!button)return;const cmd=button.dataset.composeCommand;if(cmd==='removeFormat')return;
  if(cmd==='link'){el.querySelector('[data-compose-link]').hidden=false;el.querySelector('[data-compose-url]').focus();return;}
  if(cmd==='cancelLink'){el.querySelector('[data-compose-link]').hidden=true;restore(el);return;}
  restore(el);let value=null,command=cmd;
  if(cmd==='applyLink'){value=el.querySelector('[data-compose-url]').value.trim();if(!safeEmailLink(value)){status(el,'Enter a valid web or email link.');return;}command='createLink';el.querySelector('[data-compose-link]').hidden=true;}
  if(command==='createLink'&&el.ownerDocument.getSelection().isCollapsed){command='insertHTML';value=`<a href="${esc(value)}">${esc(value)}</a>`;}
  el.ownerDocument.execCommand(command,false,value);try{sync(el);remember(el);status(el,'Unsaved formatting');}catch(error){status(el,error.message);}
 });
 root.addEventListener('change',async e=>{const el=e.target.closest('[data-composer]');if(!el||locked(el))return;
  if(e.target.matches('[data-compose-font]')){restore(el);el.ownerDocument.execCommand('fontName',false,e.target.value);sync(el);remember(el);return;}
  if(e.target.matches('[data-compose-size]')){restore(el);el.ownerDocument.execCommand('fontSize',false,e.target.value);sync(el);remember(el);return;}
  const inline=e.target.matches('[data-compose-image-file]');if(!inline&&!e.target.matches('[data-compose-files]'))return;
  const existing=JSON.parse(el.dataset.files),picked=[...e.target.files];e.target.value='';
  try{const descriptors=picked.map(f=>({name:f.name,type:ATTACHMENT_TYPES[f.name.split('.').pop().toLowerCase()],size:f.size,...(inline?{contentId:crypto.randomUUID()}:{} )}));validateAttachments([...existing,...descriptors],{metadataOnly:true,allowReferences:el.dataset.fileReferences==='true'});
   el.dataset.uploading='true';status(el,'Reading attachments…');
   const added=await Promise.all(picked.map((f,i)=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('Could not read the attachment.'));reader.onload=()=>resolve({...descriptors[i],data:String(reader.result).split(',')[1]});reader.readAsDataURL(f);})));if(!el.isConnected)return;
   const files=[...existing,...added];validateAttachments(files,{allowReferences:el.dataset.fileReferences==='true'});el.dataset.files=JSON.stringify(files);el.querySelector('[data-compose-attachments]').innerHTML=attachmentChips(files);delete el.dataset.uploading;if(inline){restore(el);for(const file of added)el.ownerDocument.execCommand('insertHTML',false,`<div><img data-email-image="${file.contentId}" src="data:${file.type};base64,${file.data}" alt="${esc(file.name)}" style="max-width:100%;height:auto"></div><div><br></div>`);}sync(el);status(el,`${files.length} attachment${files.length===1?'':'s'} ready for review.`);
  }catch(error){status(el,error.message);}finally{delete el.dataset.uploading;}
 });
}

function attachmentMenu(files,disabled){return '<div class="composer-fab"><button type="button" class="composer-fab-toggle" data-compose-menu-toggle aria-label="Add files, images or links" aria-expanded="false" '+(disabled?'disabled':'')+'><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m8 13 7-7a3 3 0 0 1 4 4L9 20a5 5 0 0 1-7-7L13 2a2 2 0 0 1 3 3L6 15a1 1 0 0 0 2 2l9-9"/></svg></button><div class="composer-fab-actions" data-compose-menu hidden role="group" aria-label="Insert into email">'+(files?'<button type="button" data-compose-attach>Attach files</button><button type="button" data-compose-image>Insert image</button>':'')+'<button type="button" data-compose-command="link">Insert link</button></div></div>';}
