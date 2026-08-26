// Lead delivery for the public site: every accepted form POST becomes one
// plain-text email to the KW LCP team (Resend, via lib/mailer.server.mjs),
// plus an acknowledgement to the visitor for consultation requests. Never
// throws - sendEmail resolves { ok:false, error } on any failure, and the
// caller (server.js queueLeadEmail) only logs. deps are injectable for tests.
import { sendEmail } from "./mailer.server.mjs";

// Keys that must never reach the email body: server-stamped metadata
// (__submissionId, __clientIp, __userAgent), the spam marker (_spam), the
// Turnstile token, and the honeypot field.
const INTERNAL = (k) => k.startsWith("__") || k.startsWith("_") || k === "turnstileToken" || k === "company_website";
const LABELS = { contact: "contact", consultation: "consultation", whitepaper: "white paper download", "life-expectancy": "life expectancy lookup" };

export function buildLeadEmail(type, data) {
  const label = LABELS[type] || type;
  const who = data.name || data.email || "unknown";
  const lines = Object.entries(data)
    .filter(([k, v]) => !INTERNAL(k) && v !== undefined && v !== null && String(v).trim() !== "")
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`);
  return { subject: `[KW LCP] New ${label} lead: ${who}`, text: lines.join("\n") + "\n" };
}

export function buildAckEmail(type, data) {
  if (type !== "consultation") return null;
  return {
    subject: "KW Life Care Planning received your consultation request",
    text: `Hello ${data.name || ""},\n\nThank you for contacting KW Life Care Planning. A member of our life care planning team will follow up within one business day.\n\nIf your matter is time-sensitive, call +1-201-343-0700.\n\nKW Life Care Planning\nhttps://kwlcp.com\n`,
  };
}

const escapeHtml = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

export async function sendLeadEmail(type, data, deps = {}) {
  const apiKey = deps.apiKey ?? process.env.RESEND_API_KEY ?? "";
  const recipients = deps.recipients ?? (process.env.LEAD_RECIPIENTS || "info@kwvrs.com").split(",").map((s) => s.trim()).filter(Boolean);
  const from = deps.from ?? process.env.LEAD_FROM ?? "KW Life Care Planning <info@kwvrs.com>";
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
