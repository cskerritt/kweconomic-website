// Lead delivery for the public site: every accepted form POST becomes one
// plain-text email to the KW Economics team (Resend, via lib/mailer.server.mjs),
// plus an acknowledgement to the visitor for consultation requests. Never
// throws - sendEmail resolves { ok:false, error } on any failure, and the
// caller (server.js queueLeadEmail) only logs. deps are injectable for tests.
import { sendEmail } from "./mailer.server.mjs";
import { ORG_NAME, SITE_URL, ORG_PHONE_DISPLAY } from "./brand.server.mjs";

// Keys that must never reach the email body: server-stamped metadata
// (__submissionId, __clientIp, __userAgent), the spam marker (_spam), the
// Turnstile token, and the honeypot field.
const INTERNAL = (k) => k.startsWith("__") || k.startsWith("_") || k === "turnstileToken" || k === "company_website";
const LABELS = { contact: "contact", consultation: "consultation", whitepaper: "white paper" };

// Fallbacks when LEAD_RECIPIENTS / LEAD_FROM are unset OR empty. The shared
// info@kwvrs.com mailbox stays the sender and recipient until a kweconomics.com
// mailbox exists and the domain is verified in Resend (README, facts to
// confirm). Both use `||`, never `??`: an empty-string env var would otherwise
// send `from: ""`, which Resend rejects with a 422 and the lead is lost.
export const DEFAULT_LEAD_RECIPIENTS = "info@kwvrs.com";
export const DEFAULT_LEAD_FROM = `${ORG_NAME} <info@kwvrs.com>`;

// The visitor-supplied name is reflected into the ack email (sent to any valid
// address the visitor typed) and into the lead subject. Strip line breaks, URLs
// (so the ack cannot be used as a phishing relay), collapse whitespace, cap length.
export function sanitizeName(s) {
  return String(s ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/(https?:\/\/|www\.)\S*/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80)
    .trim();
}

export function buildLeadEmail(type, data) {
  const label = LABELS[type] || type;
  const who = sanitizeName(data.name) || data.email || "unknown";
  const lines = Object.entries(data)
    .filter(([k, v]) => !INTERNAL(k) && v !== undefined && v !== null && String(v).trim() !== "")
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`);
  return { subject: `[${ORG_NAME}] New ${label} inquiry - ${who}`, text: lines.join("\n") + "\n" };
}

export function buildAckEmail(type, data) {
  if (type !== "consultation") return null;
  return {
    subject: `${ORG_NAME} received your consultation request`,
    text: `Hello ${sanitizeName(data.name)},\n\nThank you for contacting ${ORG_NAME}. A member of our economics team will follow up within one business day.\n\nIf your matter is time-sensitive, call ${ORG_PHONE_DISPLAY}.\n\n${ORG_NAME}\n${SITE_URL}\n`,
  };
}

const escapeHtml = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

export async function sendLeadEmail(type, data, deps = {}) {
  const apiKey = deps.apiKey ?? process.env.RESEND_API_KEY ?? "";
  const recipients = deps.recipients ?? (process.env.LEAD_RECIPIENTS || DEFAULT_LEAD_RECIPIENTS).split(",").map((s) => s.trim()).filter(Boolean);
  const from = deps.from ?? (process.env.LEAD_FROM || DEFAULT_LEAD_FROM);
  const mail = buildLeadEmail(type, data);
  const r = await sendEmail(
    { to: recipients, from, replyTo: data.email, subject: mail.subject, text: mail.text, html: `<pre>${escapeHtml(mail.text)}</pre>` },
    { apiKey, fetch: deps.fetch },
  );
  if (!r.ok) return r;
  const ack = buildAckEmail(type, data);
  if (ack && data.email) {
    await sendEmail(
      { to: data.email, from, subject: ack.subject, text: ack.text, html: `<pre>${escapeHtml(ack.text)}</pre>` },
      { apiKey, fetch: deps.fetch },
    );
  }
  return r;
}
