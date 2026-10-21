const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function creatorMissingInfo(item,creator={}){
  const data=item.data||{},enriched=item.enrichment||{},accounts=data.accounts||[],observations=enriched.accounts||[];
  const resolvedName=creator.displayName&&creator.displayName!==creator.code&&!accounts.some(a=>a.handle.toLowerCase()===creator.displayName.toLowerCase());
  const gaps=[];const need=(key,label,prompt)=>gaps.push({key,label,prompt});
  if(!accounts.length)need('profile','Social profile','Paste the Instagram or TikTok profile URL, or specify the platform and @handle.');
  if(!data.displayName&&!resolvedName&&!observations.some(a=>a.displayName))need('name','Creator name','Enter their name, or paste an email introduction.');
  if(!item.contactAvailable&&!data.email&&!observations.some(a=>a.publicEmail))need('contact','Contact email','Paste the relevant email thread or enter Email: followed by their contact address.');
  if(!data.location)need('location','Location','Add their city, or paste the part of an email that states their location.');
  if(!data.categories?.length)need('category','Content category','Add Category: followed by their content niche.');
  if(!creator.photoDataUrl&&!observations.some(a=>a.hasPhoto||a.photoDataUrl))need('photo','Profile photo','Run Socialcrawl after adding the correct profile, or upload a photo on the creator profile.');
  if(accounts.some(a=>!observations.some(o=>o.platform===a.platform&&o.handle===a.handle&&o.followers!==null&&o.followers!==undefined)&&!(creator.accounts||[]).some(o=>o.platform===a.platform&&String(o.handle).replace(/^@/,'')===a.handle&&o.followers!==null&&o.followers!==undefined)))need('followers','Follower count','Run Socialcrawl to retrieve the missing account statistics.');
  if(!(enriched.thumbnailCount>0)&&!(creator.portfolioPosts||[]).some(p=>p.thumbnailDataUrl)&&!(creator.posts||[]).some(p=>p.thumbnailDataUrl))need('thumbnails','Post thumbnails','Run Socialcrawl to load recent public posts. Private or empty accounts may need a different profile.');
  return gaps;
}
export function renderCreatorIntakeBadge(creator,canEdit){
  if(!creator.intake)return '';
  const gaps=creatorMissingInfo(creator.intake,creator);
  const label=['pending','processing'].includes(creator.intake.state)?'Populating data…':gaps.length?`Needs info · ${gaps.length} fields`:'Profile populated';
  return canEdit?`<button type="button" class="ci-card-status" data-intake-action="edit" data-intake-id="${esc(creator.intake.id)}">${esc(label)}</button>`:`<p class="ci-card-status">${esc(label)}</p>`;
}
export function renderCreatorIntake(s){
  if(!s.canImportAgencyRoster&&!s.demo)return '';
  if(!s.intake?.open)return '';
  const q=s.intake||{},items=q.items||[],disabled=q.busy||s.demo||s.snapshot;
  const needs=items.filter(item=>creatorMissingInfo(item).length||item.state==='attention'||item.state==='waiting');
  return `<dialog class="ci-dialog" data-i18n aria-labelledby="ci-title"><div class="ci-dialog-heading"><h2 id="ci-title">Add creators</h2><button type="button" class="icon-button" data-intake-action="close" aria-label="Close Add creators">×</button></div><section class="ci-panel"><header><div><p>Upload your creator list, then review any missing information.</p></div><span class="ci-counter">${q.total||0} imported</span></header>
    <label class="ci-drop" data-intake-drop><strong>${q.busy?'Reading and saving creators…':'Drop an XLSX or TXT file here'}</strong><span>or choose a file · up to 500 creators / 5 MB</span><span class="ci-file-choice"><span class="button button--secondary" data-i18n>Choose file</span><span ${q.filename?'data-no-translate':'data-i18n'}>${esc(q.filename||'No file chosen')}</span></span><input class="ci-file-input" type="file" data-intake-file accept=".xlsx,.txt" ${disabled?'disabled':''} aria-label="Upload creators XLSX or TXT" /></label>
    <p class="ci-hint">Use names, profile links, emails, locations and categories. TXT supports one creator per line; use <code data-no-translate>Instagram: @handle</code> or <code data-no-translate>TikTok: @handle</code>. Missing fields stay on the checklist below.</p>
    ${q.notice?`<p role="status">${esc(q.notice)}</p>`:''}${q.error?`<p role="alert" class="ci-error">${esc(q.error)}</p>`:''}
    ${q.enrichmentAvailable===false?'<p class="ci-error">Creators are saved, but Socialcrawl is not connected to this server. Connect it to populate photos, follower counts and thumbnails.</p>':''}
    <div class="ci-queue-heading"><h3>Needs info <span>${needs.length} on this page</span></h3><button type="button" class="button button--secondary button--small" data-intake-action="refresh" ${q.busy?'disabled':''}>Refresh status</button></div>
    <p>Keep these profiles moving: add the missing details or paste a relevant email thread. Saving a file does not mark a profile complete.</p>
    ${q.processing?'<p role="status" class="ci-progress">Socialcrawl is populating creator cards. Saved progress survives a page refresh.</p>':''}
    <div class="ci-queue">${items.map(item=>{
      const gaps=creatorMissingInfo(item),editing=q.editingId===item.id;
      const name=item.data?.displayName||item.data?.accounts?.[0]?.handle||'Creator needs identification';
      const observed=item.enrichment?.accounts||[];
      return `<article class="ci-row"><div class="ci-row-title"><strong data-no-translate>${esc(name)}</strong><span>${esc(({pending:'Queued for Socialcrawl',processing:'Fetching profile and posts',waiting:'Needs identity information',attention:'Enrichment needs attention',ready:gaps.length?'Needs info':'Profile populated'})[item.state]||'Needs info')}</span></div>
        <div class="ci-values">${item.data?.email?`<span data-no-translate>${esc(item.data.email)}</span>`:''}${(item.data?.accounts||[]).map(a=>`<span data-no-translate>${esc(a.platform)} @${esc(a.handle)}</span>`).join('')}${observed.filter(a=>a.followers!==null&&a.followers!==undefined).map(a=>`<span>${esc(a.platform)} · ${Number(a.followers).toLocaleString()} followers</span>`).join('')}</div>
        ${gaps.length?`<ul class="ci-gaps">${gaps.map(g=>`<li title="${esc(g.prompt)}">${esc(g.label)}</li>`).join('')}</ul>`:''}
        ${item.failure?`<p class="ci-error">${esc(item.failure)}</p>`:''}${(item.enrichment?.errors||[]).map(error=>`<p class="ci-error">${esc(error)}</p>`).join('')}
        ${item.data?.notes?`<p data-no-translate>${esc(item.data.notes)}</p>`:""}<div class="ci-actions">${item.state==="waiting"&&item.creatorId?`<button type="button" class="button button--secondary button--small" data-action="library-managed">Correct existing account in staff records</button>`:""}<button type="button" class="button button--primary button--small" data-intake-action="edit" data-intake-id="${esc(item.id)}" ${item.state==='processing'?'disabled':''}>Add missing info / email thread</button>${item.creatorId?`<button type="button" class="button button--secondary button--small" data-action="library-open" data-id="${esc(item.creatorId)}">View creator card</button>`:''}${['ready','attention'].includes(item.state)?`<button type="button" class="button button--secondary button--small" data-intake-action="retry" data-intake-id="${esc(item.id)}" ${q.processing?'disabled':''}>Retry Socialcrawl</button>`:''}</div>
        ${editing?`<form data-intake-evidence="${esc(item.id)}"><label>Paste a relevant email thread or enter the missing details<textarea name="evidence" data-intake-text maxlength="12000" rows="7" required placeholder="Name: Anna Smith&#10;Email: anna@example.com&#10;Instagram: @anna&#10;Location: Los Angeles&#10;Category: Beauty">${esc(q.draft||'')}</textarea></label><label class="ci-evidence-file">Or attach the relevant email excerpt (.txt)<span class="ci-file-choice"><span class="button button--secondary" data-i18n>Choose file</span><span ${q.evidenceFilename?'data-no-translate':'data-i18n'}>${esc(q.evidenceFilename||'No file chosen')}</span></span><input class="ci-file-input" type="file" data-intake-evidence-file accept=".txt" /></label>${gaps.filter(g=>['profile','name','contact','location','category'].includes(g.key)).map(g=>'<p data-i18n>'+esc(g.prompt)+'</p>').join('')}<p>Only explicit details are filled. If the thread mentions several contacts or creators, specify which one belongs here.</p><div class="ci-actions"><button class="button button--primary" type="submit" ${q.busy?'disabled':''}>${q.busy?'Saving…':'Save evidence and populate'}</button><button class="button button--secondary" type="button" data-intake-action="cancel">Close</button></div></form>`:''}</article>`;
    }).join('')||'<p class="ci-empty">Your imported creators and their missing information will appear here.</p>'}</div>
    ${(q.total||0)>100?`<nav class="ci-actions" aria-label="Imported creator pages"><button type="button" class="button button--secondary" data-intake-action="previous" ${!q.offset?'disabled':''}>Previous imports</button><span>${(q.offset||0)+1}–${Math.min((q.offset||0)+100,q.total)} of ${q.total}</span><button type="button" class="button button--secondary" data-intake-action="next" ${(q.offset||0)+100>=q.total?'disabled':''}>More imports</button></nav>`:''}
  </section></dialog>`;
}

export function createCreatorIntakeController({root,getState,request,render,reload,enabled}){
  let opener=null;
  const afterRender=()=>{const dialog=root.querySelector('.ci-dialog');if(dialog&&!dialog.open){dialog.showModal();dialog.addEventListener('cancel',event=>{event.preventDefault();close();});}};
  const close=()=>{current().intake.open=false;render();(opener?.isConnected?opener:root.querySelector('[data-intake-action="open"]'))?.focus();};
  const current=()=>{const s=getState();s.intake??={items:[],total:0,offset:0};return s;};
  const valid=s=>getState()===s&&enabled();
  const paint=s=>{if(valid(s)&&!s.intake.editingId)render();};
  const post=body=>request('/api/creator-intake',{method:'POST',csrf:true,body});
  async function load({resume=true}={}){
    if(!enabled())return;
    const s=current(),q=s.intake;if(q.loading)return q.loadPromise;
    q.loading=true;
    q.loadPromise=(async()=>{
      try{const response=await request(`/api/creator-intake?offset=${q.offset||0}`);if(!valid(s))return;
        q.items=response.data.items;q.total=response.data.total;q.pendingIds=response.data.pendingIds||[];q.enrichmentAvailable=response.enrichmentAvailable;q.error=null;
      }catch(error){if(valid(s))q.error=error.message;}
      finally{q.loading=false;paint(s);}
      if(valid(s)&&resume&&q.enrichmentAvailable)void drain();
    })();
    return q.loadPromise;
  }
  async function drain(retryId=null){
    const s=current(),q=s.intake;if(!enabled()||q.processing)return;
    q.processing=true;paint(s);
    const attempted=new Set();
    try{
      let pending=retryId?[retryId]:(q.pendingIds||[]);
      while(pending.length){
        for(const id of pending){
          if(!valid(s))return;
          attempted.add(id);
          const response=await post({action:'enrich',id,...(retryId===id?{retry:true}:{})});
          if(!valid(s))return;
          if(response.data)q.items=q.items.map(i=>i.id===id?response.data:i);
          q.notice=`Populated ${attempted.size} creator${attempted.size===1?'':'s'} in this run. Missing fields stay on the checklist.`;
          paint(s);
          if(response.data?.creatorId&&!q.editingId&&(s.selected?.id===response.data.creatorId||(s.items||[]).some(c=>c.id===response.data.creatorId)))await reload();
        }
        // Pending IDs are independent of the visible page. Re-read them so an
        // upload arriving during enrichment joins this run automatically.
        const fresh=await request(`/api/creator-intake?offset=${q.offset||0}`);
        if(!valid(s))return;
        q.items=fresh.data.items;q.total=fresh.data.total;q.pendingIds=fresh.data.pendingIds||[];
        pending=q.pendingIds.filter(id=>!attempted.has(id));
      }
      if(attempted.size&&valid(s)&&!q.editingId)await reload();
    }catch(error){if(valid(s))q.error=error.message;}
    finally{q.processing=false;paint(s);}
    if(valid(s)&&!q.error&&(q.pendingIds||[]).some(id=>!attempted.has(id)))void drain();
  }
  async function upload(file){
    const s=current(),q=s.intake;if(!enabled()||q.busy||!file)return;
    if(!/\.(xlsx|txt)$/i.test(file.name)||file.size>5*1024*1024){q.error='Choose an XLSX or TXT file up to 5 MB.';render();return;}
    q.filename=file.name;q.busy=true;q.error=null;q.notice=null;render();
    try{
      const bytes=new Uint8Array(await file.arrayBuffer());let binary='';
      for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
      const response=await post({action:'upload',filename:file.name,base64:btoa(binary)});
      if(!valid(s))return;
      q.notice=`${response.data.items.length} creator rows saved. Cards are ready; missing information remains on the checklist.`;
      q.offset=0;await load({resume:false});await reload();
    }catch(error){if(valid(s))q.error=error.message;}
    finally{q.busy=false;paint(s);}
    if(valid(s)&&q.enrichmentAvailable)void drain();
  }
  root.addEventListener('dragover',event=>{if(event.target.closest('[data-intake-drop]')&&[...(event.dataTransfer?.types||[])].includes('Files')){event.preventDefault();event.dataTransfer.dropEffect='copy';}});
  root.addEventListener('drop',event=>{if(!event.target.closest('[data-intake-drop]'))return;event.preventDefault();void upload(event.dataTransfer?.files?.[0]);});
  root.addEventListener('change',async event=>{
    if(event.target.matches('[data-intake-file]'))void upload(event.target.files?.[0]);
    if(event.target.matches('[data-intake-evidence-file]')){
      const s=current(),file=event.target.files?.[0];if(!file||!enabled())return;
      if(!/\.txt$/i.test(file.name)||file.size>12000){s.intake.error='Use a TXT email excerpt up to 12 KB.';render();return;}
      const value=await file.text();if(!valid(s))return;s.intake.draft=value;s.intake.evidenceFilename=file.name;render();
    }
  });
  root.addEventListener('input',event=>{if(event.target.matches('[data-intake-text]'))current().intake.draft=event.target.value;});
  root.addEventListener('click',async event=>{
    const target=event.target.closest('[data-intake-action]');if(!target)return;
    if(target.dataset.intakeAction==='close'){close();return;}
    if(target.dataset.intakeAction==='open'){opener=target;current().intake.open=true;render();return;}
    if(!enabled())return;
    const s=current(),q=s.intake,action=target.dataset.intakeAction,id=target.dataset.intakeId;
    if(action==='edit'){
      // The card may point to a record on a different import page.
      if(!(q.items||[]).some(i=>i.id===id)){
        q.offset=0;await load({resume:false});
        while(valid(s)&&!q.items.some(i=>i.id===id)&&q.offset+100<q.total){q.offset+=100;await load({resume:false});}
      }
      if(!valid(s))return;s.selected=null;q.open=true;q.editingId=id;q.draft='';q.evidenceFilename='';render();
      root.querySelector('[data-intake-text]')?.focus();
    }else if(action==='cancel'){q.editingId=null;q.draft='';q.evidenceFilename='';render();}
    else if(action==='retry'){void drain(id);}
    else{if(action==='next')q.offset+=100;if(action==='previous')q.offset=Math.max(0,q.offset-100);await load();}
  });
  root.addEventListener('submit',async event=>{
    const form=event.target.closest('[data-intake-evidence]');if(!form)return;event.preventDefault();
    const s=current(),q=s.intake;if(!enabled()||q.busy)return;
    const text=q.draft||new FormData(form).get('evidence');q.busy=true;q.error=null;render();
    try{await post({action:'evidence',id:form.dataset.intakeEvidence,text});if(!valid(s))return;
      q.editingId=null;q.draft='';q.evidenceFilename='';q.notice='Evidence saved. Supported fields are populated; unresolved fields remain listed.';
      await load({resume:false});await reload();
    }catch(error){if(valid(s))q.error=error.message;}
    finally{q.busy=false;if(valid(s))render();}
    if(valid(s)&&q.enrichmentAvailable)void drain();
  });
  return {load,afterRender};
}
