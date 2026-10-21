import {loadingWheel} from './page-loading.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderFinanceIntake({assignment,value={},review={},loading=false,saving=false,error}) {
  const missing=review.contractState==='missing',unchecked=!review.contract;
  const link=(doc,label)=>doc?`<a href="${esc(doc.url)}" target="_blank" rel="noopener noreferrer">${label}</a>`:'';
  return `<div class="drawer-backdrop" data-ops-action="close-editor"></div><aside class="drawer ops-editor" role="dialog" aria-modal="true" aria-labelledby="finance-intake-title">
    <header class="drawer-header"><div><p class="eyebrow">${esc(assignment.creatorDisplayName||assignment.creatorHandle)}</p><h2 id="finance-intake-title">Review before sending to finances</h2></div><button type="button" class="icon-button" data-ops-action="close-editor" aria-label="Close">×</button></header>
    <div class="drawer-body"><form data-ops-form="finance-intake">
      ${loading?`<p class="finance-intake-loading" role="status">${loadingWheel}Checking the contract and Socialcrawl posting date…</p>`:''}
      ${error?`<p class="ops-notice ops-error" role="alert">${esc(error)}</p>`:''}
      <fieldset${saving||loading?' disabled':''}><legend>Confirm compensation</legend>
        <p>Is this the correct amount to send to finances?</p>
        ${review.compensation?`<p class="ops-note">${review.amountSource==='invoice'?'Invoice amount':'Contract compensation / 보수'}: ${esc(review.compensation.currency)} ${esc(review.compensation.amount.toLocaleString('en-US'))}</p>`:!loading?'<p class="ops-note">We could not identify one clear compensation amount. Enter the agreed amount below.</p>':''}
        <div class="ops-fields"><label><span>Amount</span><input name="amount" type="number" min="0" step="0.01" required value="${esc(value.amount)}"></label><label><span>Currency</span><input name="currency" maxlength="3" pattern="[A-Za-z]{3}" required value="${esc(value.currency||'USD')}"></label></div>
        <p>${link(review.contract,'Contract PDF')}</p>
      </fieldset>
      <fieldset${saving||loading?' disabled':''}><legend>Confirm payment due date</legend>
        <p>${review.postDateState==='verified'?'Socialcrawl found the posting date. Payment is due 30 calendar days after the post was published.':loading?'Checking the linked deliverable…':'When was the video posted? Enter its posting date to calculate payment due in 30 days.'}</p>
        ${(review.posts||[]).filter(p=>p.date).map(p=>`<p class="ops-note"><a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p.label)}</a> · ${esc(p.date)}</p>`).join('')}
        ${(review.posts||[]).length>1&&review.postDateState==='verified'?'<p class="ops-note">The latest linked posting date is suggested. Confirm which date applies to this payment.</p>':''}
        <div class="ops-fields"><label><span>Date of post</span><input name="liveDate" type="date" required value="${esc(value.liveDate)}"></label><label><span>Payment due date</span><input name="dueDate" type="date" required value="${esc(value.dueDate)}"></label></div>
        <p>${link(review.invoice,'Invoice PDF')}</p>
        <label class="ops-check"><input type="checkbox" name="confirmed" required${value.confirmed?' checked':''}>I confirm the amount and payment due date.</label>
      </fieldset>
      ${unchecked?`<p class="ops-notice" role="alert">${missing?'This creator does not have a contract uploaded. Are you sure you want to send them to finances anyway?':'We could not confirm an uploaded contract. Are you sure you want to send this creator to finances anyway?'}</p><label class="ops-check"><input type="checkbox" name="missingContractConfirmed"${value.missingContractConfirmed?' checked':''}${saving?' disabled':''}>Yes, send to finances without a confirmed contract.</label>`:''}
      <p class="ops-note">You can edit these details later in Finances.</p>
      <div class="ops-actions"><button type="submit" class="button button--primary"${saving||loading?' disabled':''}>${saving?'Sending…':'Confirm and send to finances'}</button><button type="submit" name="sendAnyway" value="true" formnovalidate class="button button--secondary"${saving?' disabled':''}>Send to finances anyway</button></div>
    </form></div></aside>`;
}
