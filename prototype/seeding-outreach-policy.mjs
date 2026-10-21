import { documentText, validateAttachments } from './email-content.mjs';
export const OUTREACH_SENDER = "sample-team@example.invalid";
export const CONTACT_SOURCES = Object.freeze({ opt_in: "Opt-in", previous_outreach: "Previous outreach", public_profile: "Public business profile" });
export const OUTREACH_BATCH_LIMIT = 25;
export const CAMPAIGN_OUTREACH_HTTP_LIMIT = 7200000;
export const CAMPAIGN_OUTREACH_INPUT_LIMIT = 14000;
const text = (value, max) => typeof value === "string" && value.trim().length > 0 && value.length <= max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
export function validateOutreachDraft(input) {
  if (!input || Object.keys(input).some(k => !["country", "source", "sourceEvidence", "sourceDate", "countryEvidence", "reviewed", "subject", "body", "document", "attachments"].includes(k))) throw new Error("Check the outreach fields. The sender and recipient cannot be overridden.");
  // Legacy evidence remains validatable, but the composer no longer collects it.
  if (["country","countryEvidence","source","sourceDate","sourceEvidence","reviewed"].some(k=>Object.hasOwn(input,k))) {
  if (input.country !== "US" || !text(input.countryEvidence, 500)) throw new Error("Verify US location and record its evidence.");
  if (!Object.hasOwn(CONTACT_SOURCES,input.source) || !text(input.sourceEvidence, 1000) || !/^\d{4}-\d{2}-\d{2}$/.test(input.sourceDate || "") || !Number.isFinite(Date.parse(input.sourceDate)) || new Date(input.sourceDate).toISOString().slice(0,10) !== input.sourceDate || input.sourceDate > new Date().toISOString().slice(0,10)) throw new Error("Record a valid contact source, date, and evidence.");
  if (input.reviewed !== true) throw new Error("Review permission, identity, prior contact, and the source before saving.");
  }
  if (!text(input.subject, 200) || /[\r\n]/.test(input.subject) || !text(input.body, 5000) || /\{\{|\}\}/.test(input.subject + input.body)) throw new Error("Complete the individual subject and message; unresolved template fields cannot be sent.");
  if(input.document && documentText(input.document).trim() !== input.body.trim()) throw new Error("Formatting differs from the message. Review it again.");
  validateAttachments(input.attachments);
  return Object.fromEntries(Object.entries(input).map(([k,v]) => [k,typeof v === "string" ? v.trim() : v]));
}
export function outreachStartingText(template, creatorName) {
  return String(template || "").replaceAll("{{creatorName}}", creatorName || "[Creator name needs review]");
}
