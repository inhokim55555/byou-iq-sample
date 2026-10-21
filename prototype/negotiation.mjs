import {displayDateTime} from './date-format.mjs';
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fee = (amount,currency) => amount==null?'Not recorded':`${currency || 'Currency unknown'} ${Number(amount).toLocaleString('en-US',{maximumFractionDigits:2})}`;
const currencies = ['USD','CAD','GBP','EUR','AUD','KRW','JPY'];
export const createNegotiationState = () => ({assignmentId:null,campaignId:null,context:null,loading:false,busy:false,error:null,notice:null,amount:'',currency:'USD',scope:'',threadId:null,draft:null,dirty:false,sendUncertain:false});

export function renderNegotiation(s,campaignId) {
  if (!s.assignmentId || s.campaignId!==campaignId) return '';
  const c=s.context,d=s.draft;
  const blocked=!c || c.blockedReason || c.threadError || !c.mailbox || !c.aiConfigured || (c.threads.length>1&&!s.threadId);
  const active=(c?.drafts || []).some(x=>['sending','uncertain'].includes(x.status));
  const locked=s.busy||s.loading||active||s.sendUncertain;
  return `<section class="negotiation" aria-label="Creator negotiation" aria-busy="${s.loading||s.busy}">
    <header class="neg-header"><div><h2>Negotiation${c?` · ${esc(c.creatorName)}`:''}</h2>${c?`<span>${c.returning?'Returning creator':'No previous collaboration recorded'}</span>`:''}</div><div class="neg-actions"><button type="button" class="button button--secondary button--small" data-neg="refresh" ${s.busy?'disabled':''}>Refresh conversation</button><button type="button" class="icon-button" data-neg="close" aria-label="Close negotiation" title="Close negotiation" ${s.busy?'disabled':''}>&#215;</button></div></header>
    ${s.error?`<p class="neg-error" role="alert">${esc(s.error)}</p>`:''}${s.notice?`<p class="neg-notice" role="status">${esc(s.notice)}</p>`:''}
    ${s.loading?'<p role="status">Loading negotiation...</p>':!c?'':`
    <div class="neg-address"><span>From <strong>${esc(c.mailbox||'Mailbox not connected')}</strong></span><span>To <strong>${esc(c.email||'Verified email required')}</strong></span>${c.mailbox?`<a href="https://mail.google.com/mail/?authuser=${encodeURIComponent(c.mailbox)}#sent" target="_blank" rel="noreferrer">Open Gmail Sent</a>`:''}</div>
    ${c.blockedReason?`<p class="neg-error" role="alert">${esc(c.blockedReason)}</p>`:''}${c.threadError?`<p class="neg-error" role="alert">${esc(c.threadError)}</p>`:''}
    ${!c.aiConfigured?'<p role="status">AI drafting is not connected.</p>':''}${!c.sendEnabled?'<p role="status">Sending is disabled. Draft approval cannot send until the mailbox is enabled.</p>':''}
    <div class="neg-layout"><div class="neg-context">
      <label class="neg-label">Conversation<select name="neg-thread" ${locked?'disabled':''}>${c.threads.length?`${c.threads.length>1?'<option value="">Choose a conversation</option>':''}${c.threads.map(t=>`<option value="${esc(t.id)}" ${s.threadId===t.id?'selected':''}>${esc(t.subject)}</option>`).join('')}`:'<option value="">New invitation</option>'}</select></label>
      <dl class="neg-rates"><div><dt>Previous agreed fee</dt><dd>${c.previousRate?fee(c.previousRate.amount,c.previousRate.currency):'Not recorded'}</dd>${c.previousRate?`<small>${esc(c.previousRate.campaignName)}${c.previousRate.date?` · ${esc(c.previousRate.date)}`:''}</small><small>${esc(c.previousRate.scope||'Previous deliverables not recorded')}</small><button type="button" class="neg-link" data-neg="previous" ${locked||Number(c.previousRate.amount)<=0||!currencies.includes(c.previousRate.currency)?'disabled':''}>Use previous fee</button>`:''}</div>
      <div><dt>Creator's asking fee</dt><dd>${c.thread?.latestReply?.askingPrice?esc(c.thread.latestReply.askingPrice.quote):'Needs review'}</dd><small>${c.thread?.latestReply?.askingPrice?(c.thread.latestReply.askingPrice.currency?'Extracted from the reply; confirm below.':'Currency unconfirmed; check with the creator.'):'Read the reply for the amount and currency.'}</small></div></dl>
      <h3>Latest creator reply</h3>${c.thread?.latestReply?`<time>${esc(displayDateTime(c.thread.latestReply.at))}</time><blockquote>${esc(c.thread.latestReply.text)}</blockquote>`:'<p class="neg-muted">No creator reply recorded in this conversation.</p>'}
    </div><div class="neg-compose"><form id="negotiation-offer-form">
      <fieldset ${locked||blocked?'disabled':''}><div class="neg-offer-row"><label class="neg-label">Your total offer<input name="amount" type="number" inputmode="decimal" min="0.01" max="9999999" step="${['KRW','JPY'].includes(s.currency)?'1':'0.01'}" value="${esc(s.amount)}" required></label><label class="neg-label">Currency<select name="currency">${currencies.map(x=>`<option ${s.currency===x?'selected':''}>${x}</option>`).join('')}</select></label></div>
      <label class="neg-label">Deliverables covered<textarea name="scope" rows="2" maxlength="600" required>${esc(s.scope)}</textarea></label>
      <button class="button button--secondary" type="submit">${s.busy?'Preparing...':'Generate email draft'}</button></fieldset>
    </form>
    ${d?.payload?.body?`<section class="neg-preview" aria-label="Email preview"><h3>${d.status==='sent'?'Sent email':'Email preview'}</h3><dl><div><dt>To</dt><dd>${esc(d.payload.to)}</dd></div><div><dt>Subject</dt><dd>${esc(d.payload.subject)}</dd></div></dl><pre>${esc(d.payload.body)}</pre>
      ${d.status==='draft'?`<div class="neg-actions"><button class="button button--secondary" data-neg="discard" ${locked?'disabled':''}>Discard draft</button><button class="button button--primary" data-neg="approve" ${locked||blocked||s.dirty||!c.sendEnabled?'disabled':''}>${s.busy?'Sending...':'Approve &amp; send'}</button></div>`:`<p role="status">${d.status==='sent'?'Sent in Gmail. This offer has not been marked as an agreed rate.':d.status==='sending'||d.status==='uncertain'?'Send outcome needs review in Gmail. Another send is blocked.':esc(d.status)}</p>`}
    </section>`:'<div class="neg-preview neg-empty"><h3>Email preview</h3><p>No draft generated.</p></div>'}
    ${active||s.sendUncertain?'<p class="neg-error" role="alert">Check the send outcome in Gmail before continuing. This screen will not retry a send automatically.</p>':''}
    </div></div>
    ${c.drafts.length?`<details class="neg-history"><summary>Offer history (${c.drafts.length}${c.drafts.length===30?'+':''})</summary><div>${c.drafts.map(x=>`<div class="neg-history-row"><span>${esc(x.payload?.input?fee(x.payload.input.amount,x.payload.input.currency):'Draft preparation')}</span><span>${esc(x.status)}</span><time>${esc(displayDateTime(x.created_at))}</time></div>`).join('')}</div></details>`:''}`}
  </section>`;
}

export function bindNegotiation({root,getState,render,request,isLive}) {
  let sequence=0;
  const current=(s,n)=>getState()===s&&sequence===n;
  const focus=()=>root.querySelector('.negotiation input[name="amount"]')?.focus();
  const load=async(keep=false)=>{
    const s=getState(),n=++sequence,assignmentId=s.assignmentId;
    s.loading=true;s.error=null;render();
    try {
      if(!isLive())throw new Error('Local preview only. Connect the live CRM to load real negotiations.');
      const c=(await request(`/api/assignments/${assignmentId}/negotiation${s.threadId?'?thread='+encodeURIComponent(s.threadId):''}`)).data;
      if(!current(s,n))return;
      s.context=c;s.threadId=s.threadId||(c.threads.length===1?c.threads[0].id:null);
      const saved=c.drafts.find(d=>['draft','sending','uncertain'].includes(d.status)&&d.payload?.input?.threadId===s.threadId);
      s.draft=saved||c.drafts.find(d=>d.status==='sent')||null;
      s.sendUncertain=c.drafts.some(d=>['sending','uncertain'].includes(d.status));
      if(!keep){
        const input=saved?.payload?.input;
        s.amount=input?.amount||(Number(c.previousRate?.amount)>0?String(c.previousRate.amount):'');
        s.currency=input?.currency||c.previousRate?.currency||c.currency||'USD';
        s.scope=input?.scope||c.scope||'';s.dirty=false;
      }else{s.dirty=true;s.draft=null;}
    }catch(error){if(current(s,n)){s.error=error.message;s.context=null;s.draft=null;}}
    if(current(s,n)){s.loading=false;render();focus();}
  };
  const action=async(operation,input)=>{
    const s=getState();if(s.busy||s.loading)return;
    const n=++sequence;s.busy=true;s.error=null;s.notice=null;if(operation==='draft'){s.draft=null;s.dirty=true;}render();
    const body=operation==='draft'?{operation,id:crypto.randomUUID(),input}:{operation,id:s.draft.id,...(operation==='approve'?{previewHash:s.draft.payload.previewHash}:{})};
    try{
      const d=(await request(`/api/assignments/${s.assignmentId}/negotiation`,{method:'POST',csrf:true,body})).data;
      if(!current(s,n))return;
      s.draft=operation==='cancel'?null:d;s.dirty=false;
      s.context.drafts=[d,...s.context.drafts.filter(x=>x.id!==d.id)].slice(0,30);
      s.notice=operation==='approve'?(d.status==='sent'?'Email sent.':'Send not confirmed. Refresh to check the recorded outcome.'):operation==='cancel'?'Draft discarded.':'Draft ready for approval.';
      if(operation==='approve')s.sendUncertain=d.status!=='sent';
      // A sent invitation now has a thread; reload before allowing the next offer.
      if(operation==='approve'&&d.status==='sent'){s.busy=false;await load();return;}
    }catch(error){if(current(s,n)){s.error=error.message;if(operation==='approve'){s.sendUncertain=true;s.notice='Refresh to check the saved status. Do not send again from another screen.';}}}
    if(current(s,n)){s.busy=false;render();}
  };
  root.addEventListener('click',event=>{
    const button=event.target.closest('[data-neg]');if(!button||button.disabled)return;
    const s=getState(),operation=button.dataset.neg;if(s.busy)return;
    if(operation==='open'){
      ++sequence;Object.assign(s,createNegotiationState(),{assignmentId:button.dataset.assignment,campaignId:button.dataset.campaign});
      void load().then(()=>root.querySelector('.negotiation')?.scrollIntoView({block:'start',behavior:'smooth'}));return;
    }
    if(operation==='close'){++sequence;Object.assign(s,createNegotiationState());render();return;}
    if(operation==='refresh'){void load();return;}
    if(operation==='previous'&&s.context.previousRate){s.amount=String(s.context.previousRate.amount);s.currency=s.context.previousRate.currency;s.draft=null;s.dirty=true;render();focus();return;}
    if(operation==='approve'&&s.draft?.status==='draft'&&!s.dirty&&!s.sendUncertain)void action('approve');
    if(operation==='discard'&&s.draft?.status==='draft')void action('cancel');
  });
  root.addEventListener('input',event=>{
    if(!event.target.closest('#negotiation-offer-form'))return;
    const s=getState();if(s.busy)return;
    if(['amount','currency','scope'].includes(event.target.name)){
      s[event.target.name]=event.target.value;s.dirty=true;
      const approve=root.querySelector('[data-neg="approve"]');if(approve)approve.disabled=true;
      const preview=root.querySelector('.neg-preview pre');if(preview)preview.textContent='Offer changed. Generate a new draft before approval.';
    }
  });
  root.addEventListener('change',event=>{
    if(event.target.name==='neg-thread'){const s=getState();s.threadId=event.target.value||null;s.draft=null;void load(true);}
    if(event.target.closest('#negotiation-offer-form')&&event.target.name==='currency'){
      const amount=root.querySelector('#negotiation-offer-form [name="amount"]');if(amount)amount.step=['JPY','KRW'].includes(event.target.value)?'1':'0.01';
    }
  });
  root.addEventListener('submit',event=>{
    if(event.target.id!=='negotiation-offer-form')return;event.preventDefault();
    const s=getState();if(s.busy||s.loading||s.sendUncertain)return;
    const values=new FormData(event.target);
    void action('draft',{amount:values.get('amount'),currency:values.get('currency'),scope:values.get('scope'),threadId:s.threadId});
  });
  // Enter in the amount input drafts; the approval button is never the form's implicit submit.
  root.addEventListener('keydown',event=>{
    if(event.key==='Enter'&&event.target.matches('#negotiation-offer-form input[name="amount"]')){event.preventDefault();event.target.form.requestSubmit();}
  });
  return {load};
}
