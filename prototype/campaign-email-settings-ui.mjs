import {renderEmailComposer,readEmailComposer,installEmailComposers,setEmailComposer} from './email-composer.mjs';
import { DEFAULT_POLICY, TEMPLATE_DEFAULTS, validatePolicy } from "./campaign-workflow.mjs";
import { escapeWorkflow as escape } from "./assignment-workflow-ui.mjs";

const stable=v=>JSON.stringify(v&&typeof v==='object'?Array.isArray(v)?v.map(x=>JSON.parse(stable(x))):Object.fromEntries(Object.keys(v).sort().map(k=>[k,JSON.parse(stable(v[k]))])):v);
const labels = {
  outreach: ["Base outreach template", "Set the campaign's starting invitation. The agent should adapt it to each creator and your relationship, keeping the offer accurate."],
  reminder: ["Simple follow-up & reminder", "Used only for routine nudges. Available fields: {{creatorName}}, {{followupTopic}}, {{nextStep}}. Questions, delays, and negotiations need a personalized reply."]
};
const readForm = (form, existing) => {
  const values = new FormData(form);
  return {
    timezone: String(values.get("timezone") || "").trim(),
    sendTime: String(values.get("sendTime") || ""), endOfDayTime: String(values.get("endOfDayTime") || ""),
    ...Object.fromEntries(["contractInterval", "addressInterval", "documentInterval"].map(key => [key, values.get(key) === "" ? null : Number(values.get(key))])),
    reviewed: values.has("reviewed"), secondDraftReminderConfirmed: values.has("secondDraftReminderConfirmed"),
    // Retain older saved wording for history; it is never a drafting fallback.
    templates: { ...existing?.templates, ...Object.fromEntries(Object.keys(TEMPLATE_DEFAULTS).map(key => [key, String(values.get("template-" + key) || "").trim()])) },
    templateDocuments: Object.fromEntries([...form.querySelectorAll('[data-composer]')].map(el=>[el.dataset.composer.replace('template-',''),readEmailComposer(el).document])),
    writingGuidance: Object.fromEntries(["productDescription", "productReference", "voiceAndRules"].map(key => [key, String(values.get(key) || "").trim()]))
  };
};
const field = (name, title, type, value, attrs = "") => `<label>${title}<input name="${name}" type="${type}" value="${escape(value ?? "")}" ${attrs}></label>`;

// Per-campaign state; detached requests cannot repopulate it after sign-out.
export function createCampaignEmailSettingsUI({ requestJson, canEdit, onSaved = () => {}, preview = false } = {}) {
  const cache = new Map();
  let root, getCampaign;
  const stateFor = campaign => {
    if (!cache.has(campaign.id)) cache.set(campaign.id, { revision: null, policy: null, error: "", notice: "", loading: false, saving: false });
    return cache.get(campaign.id);
  };
  const defaultFor = campaign => validatePolicy({ ...DEFAULT_POLICY, timezone: campaign.timezone || DEFAULT_POLICY.timezone });
  const readResult = (campaign, result) => {
    const data = result.data || result;
    if (data.campaignId !== campaign.id || !Number.isSafeInteger(data.revision) || data.revision < 0 || data.liveSending !== false || data.revision > 0 && !data.policy) throw new Error("Campaign settings could not be verified.");
    return { revision: data.revision, policy: validatePolicy(data.policy || defaultFor(campaign)) };
  };
  function render(campaign) {
    if (!canEdit?.(campaign)) return "";
    const state = stateFor(campaign), p = state.draft || state.policy;
    let content;
    if (!p || state.loading) {
      content = state.error ? `<p role="alert">${escape(state.error)}</p><button type="button" class="button button--secondary" data-email-action="reload">Try loading again</button>` : '<p role="status">Loading saved campaign settings…</p>';
    } else {
      content = `<form data-campaign-email-form="${escape(campaign.id)}" class="wf-form ces-form">
        <fieldset ${state.saving ? "disabled" : ""}>
          <div class="ces-writing-approach"><strong>Personalized by default</strong><p>Each phase message should respond to the creator's latest conversation, your shared history, and the product guidance below. Use natural wording suited to the situation; only initial outreach and simple reminders have reusable starting text.</p></div>
          <details class="ces-group" open data-email-group="guidance"><summary>Product &amp; writing guidance</summary>
            <p class="ces-help">Give the agent facts and direction, rather than a script for each phase.</p>
            <label>Approved product description &amp; talking points<textarea name="productDescription" rows="4" maxlength="4000" placeholder="What the product is, how to describe it, supported benefits, and claims to avoid.">${escape(p.writingGuidance?.productDescription || "")}</textarea></label>
            ${field("productReference", "Product reference link (optional)", "url", p.writingGuidance?.productReference, 'maxlength="500" placeholder="https://"')}
            <label>Brand voice &amp; wording boundaries<textarea name="voiceAndRules" rows="3" maxlength="2000" placeholder="How we should sound, what to emphasize, and what we should never promise.">${escape(p.writingGuidance?.voiceAndRules || "")}</textarea></label>
          </details>
          <details class="ces-group" open data-email-group="templates"><summary>Two reusable starting points</summary><p class="ces-help">Format reusable wording here. Attach files to each individual email when reviewing its recipient.</p>
            ${Object.entries(TEMPLATE_DEFAULTS).map(([key, value]) => `<div class="ces-template">${renderEmailComposer({name:'template-'+key,label:labels[key][0],body:p.templates[key]??value,document:p.templateDocuments?.[key],allowAttachments:false,disabled:state.saving})}<p class="ces-help">${escape(labels[key][1])}</p>${key === "reminder" ? '<button type="button" class="button button--secondary" data-email-action="reset" data-template="reminder">Use standard reminder wording</button>' : ""}</div>`).join("")}
          </details>
          <details class="ces-group" data-email-group="schedules"><summary>Configure reminder schedules</summary>
            <p class="ces-help">Blank times and intervals stay unconfigured. These settings use calendar days in the timezone below.</p>
            <div class="ces-grid">
              ${field("timezone", "Schedule timezone", "text", p.timezone, 'required maxlength="120"')}
              ${field("sendTime", "Preferred sending time", "time", p.sendTime)}
              ${field("endOfDayTime", "End-of-day reminder time", "time", p.endOfDayTime)}
              ${field("contractInterval", "Contract follow-up (days)", "number", p.contractInterval, 'min="1" max="90" step="1"')}
              ${field("addressInterval", "Shipping details follow-up (days)", "number", p.addressInterval, 'min="1" max="90" step="1"')}
              ${field("documentInterval", "Missing documents follow-up (days)", "number", p.documentInterval, 'min="1" max="90" step="1"')}
            </div>
            <label class="wf-check"><input type="checkbox" name="secondDraftReminderConfirmed" ${p.secondDraftReminderConfirmed ? "checked" : ""}>The second draft reminder follows up on the same video.</label>
          </details>
          <label class="wf-check ces-review"><input type="checkbox" name="reviewed" ${p.reviewed ? "checked" : ""}>I reviewed this campaign's product guidance, starting text, and reminder schedules.</label>
          <div class="ces-actions"><button type="submit" class="button button--primary">${preview ? "Save sample email settings" : "Save email settings"}</button><button type="button" class="button button--secondary" data-email-action="reload">Reload saved settings</button></div>
        </fieldset>
        <p class="ces-status" data-email-status role="${state.error ? "alert" : "status"}" aria-live="polite">${escape(state.error || state.notice || (state.dirty ? "Unsaved email settings." : state.revision ? "Saved campaign guidance loaded." : "Add product guidance and a base outreach template when ready."))}</p>
      </form>`;
    }
    return `<section class="ces-section" data-campaign-email-settings="${escape(campaign.id)}"><details class="wf-tool" open data-email-group="section"><summary>Email guidance &amp; schedules</summary><div class="ces-heading"><strong>${escape(campaign.name)}</strong><span class="ces-badge">Planning only</span></div><p class="ces-help">Save this section separately from campaign details. Personalized drafting needs reviewed conversation and creator history; connected draft generation is not active here. Saving does not send email or activate a schedule.</p>${content}</details></section>`;
  }
  function refresh(campaign) {
    for (const slot of root?.querySelectorAll("[data-campaign-email-settings]") || []) {
      if (slot.dataset.campaignEmailSettings !== campaign.id) continue;
      const expanded = new Map([...slot.querySelectorAll("[data-email-group]")].map(el => [el.dataset.emailGroup, el.open]));
      const holder = slot.ownerDocument.createElement("div");
      holder.innerHTML = render(campaign);
      for (const el of holder.querySelectorAll("[data-email-group]")) if (expanded.has(el.dataset.emailGroup)) el.open = expanded.get(el.dataset.emailGroup);
      slot.replaceWith(...holder.childNodes);
    }
  }
  async function load(campaign, { force = false } = {}) {
    if (!canEdit?.(campaign)) return;
    const state = stateFor(campaign);
    if (state.loading || state.saving || !force && state.policy) return;
    state.loading = true; state.error = ""; state.notice = ""; state.draft = null; state.dirty = false; state.attempt = null;
    refresh(campaign);
    try {
      const result = preview ? { campaignId: campaign.id, revision: state.revision || 0, policy: state.policy, liveSending: false } : await requestJson("/api/campaigns/" + encodeURIComponent(campaign.id) + "/email-settings");
      if (cache.get(campaign.id) !== state) return;
      Object.assign(state, readResult(campaign, result));
    } catch (error) {
      if (cache.get(campaign.id) === state) { state.policy = null; state.revision = null; state.error = error.message || "Campaign email settings are unavailable."; }
    } finally {
      if (cache.get(campaign.id) === state) { state.loading = false; refresh(campaign); }
    }
  }
  async function save(campaign, policy) {
    const state = stateFor(campaign);
    if (!canEdit?.(campaign) || state.revision === null || state.loading || state.saving) throw new Error("Load authorized campaign settings before saving.");
    const validated = validatePolicy(policy);
    const payload = JSON.stringify(validated);
    if (!state.attempt || state.attempt.payload !== payload) state.attempt = { payload, idempotencyKey: crypto.randomUUID(), expectedRevision: state.revision };
    state.saving = true; state.draft = validated; state.error = "";
    try {
      const result = preview ? { campaignId: campaign.id, revision: state.revision + 1, policy: validated, liveSending: false } : await requestJson("/api/campaigns/" + encodeURIComponent(campaign.id) + "/email-settings", { method: "POST", csrf: true, body: { policy: validated, idempotencyKey: state.attempt.idempotencyKey, expectedRevision: state.attempt.expectedRevision } });
      if (cache.get(campaign.id) !== state) return;
      const saved = readResult(campaign, result);
      if (saved.revision < state.attempt.expectedRevision + 1 || JSON.stringify(saved.policy) !== payload) {
        // PostgreSQL JSONB changes key order; compare fields instead of serialized order.
        if (saved.revision < state.attempt.expectedRevision + 1 || stable(validated)!==stable(saved.policy)) throw new Error("Saved campaign settings could not be verified.");
      }
      Object.assign(state, saved, { draft: null, dirty: false, attempt: null, notice: `${preview ? "Sample settings" : "Email settings"} saved for ${campaign.name}${validated.reviewed ? "." : " as unreviewed."} No email was sent.` });
      onSaved(campaign, saved.policy);
      return saved;
    } catch (error) {
      if (cache.get(campaign.id) === state) state.error = error.message || "Saving could not be confirmed. Your edits are still here.";
      throw error;
    } finally { if (cache.get(campaign.id) === state) state.saving = false; }
  }
  function install(options) {
    root = options.root; getCampaign = options.getCampaign;installEmailComposers(root);
    const capture = event => {
      const form = event.target.closest("[data-campaign-email-form]");
      const campaign = form && getCampaign(form.dataset.campaignEmailForm);
      if (!campaign || !canEdit(campaign)) return;
      if (event.target.name !== "reviewed") form.elements.namedItem("reviewed").checked = false;
      try{Object.assign(stateFor(campaign), { draft: readForm(form, stateFor(campaign).policy), dirty: true, notice: "", error: "" });}catch(error){form.querySelector("[data-email-status]").textContent=error.message;return;}
      form.querySelector("[data-email-status]").textContent = "Unsaved email settings.";
    };
    root.addEventListener("input",capture);root.addEventListener("composerchange",capture);
    root.addEventListener("click", event => {
      const button = event.target.closest("[data-email-action]"), slot = button?.closest("[data-campaign-email-settings]");
      const campaign = slot && getCampaign(slot.dataset.campaignEmailSettings);
      if (!campaign || !canEdit(campaign) || stateFor(campaign).saving) return;
      if (button.dataset.emailAction === "reload") void load(campaign, { force: true });
      if (button.dataset.emailAction === "reset" && Object.hasOwn(TEMPLATE_DEFAULTS, button.dataset.template)) {
        const field = slot.querySelector(`[name="template-${button.dataset.template}"]`);
        setEmailComposer(field.closest('[data-composer]'),{body:TEMPLATE_DEFAULTS[button.dataset.template]});
        field.dispatchEvent(new Event("input", { bubbles: true })); field.focus();
      }
    });
    root.addEventListener("submit", async event => {
      const form = event.target.closest("[data-campaign-email-form]");
      if (!form) return;
      event.preventDefault();
      const campaign = getCampaign(form.dataset.campaignEmailForm);
      if (!campaign || !canEdit(campaign) || stateFor(campaign).saving) return;
      const editState = stateFor(campaign);
      let policy;try{policy=readForm(form, editState.policy);}catch(error){form.querySelector("[data-email-status]").textContent=error.message;return;}const fieldset = form.querySelector("fieldset");
      fieldset.disabled = true;
      form.querySelector("[data-email-status]").textContent = "Saving email settings…";
      try { await save(campaign, policy); }
      catch (error) { if (cache.get(campaign.id) === editState) Object.assign(editState, { draft: policy, error: error.message }); }
      if (cache.get(campaign.id) === editState) { refresh(campaign); root.querySelector("[data-email-status]")?.setAttribute("tabindex", "-1"); root.querySelector("[data-email-status]")?.focus(); }
    });
  }
  return { render, load, save, install, clear: () => cache.clear() };
}
