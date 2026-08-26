// Rush/priority contact-inquiry alerts: detection, recipient/from resolution,
// email composition, and dispatch. Pure builders + a best-effort dispatcher that
// never throws (fire-and-forget from server.js). No PHI: contact-form fields only.
import * as mailer from "./mailer.server.mjs";

const DEFAULT_RECIPIENTS = ["dw@kwvrs.com", "jw@kwvrs.com", "mp@kwvrs.com", "sh@kwvrs.com", "pb@kwvrs.com"];
// The From ADDRESS must live on the Resend-verified info.kwvrs.com subdomain -
// the kwvrs.com root domain's Resend verification FAILED, so the previous
// info@kwvrs.com default would have been rejected at send time.
const DEFAULT_FROM = "KWVRS <intake@info.kwvrs.com>";

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const isEmailish = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? "").trim());

export function isRush(data) {
  return String(data?.priority ?? "").toLowerCase() === "rush";
}
export function rushRecipients(env = process.env) {
  const list = (env.RUSH_RECIPIENTS || "").split(",").map((s) => s.trim()).filter(Boolean);
  return list.length ? list : DEFAULT_RECIPIENTS;
}
export function rushFrom(env = process.env) {
  return env.RUSH_FROM || DEFAULT_FROM;
}
export function buildTeamRushEmail(submission, env = process.env) {
  const rows = [
    ["Name", submission.name], ["Firm", submission.firm], ["Email", submission.email],
    ["Phone", submission.phone], ["Case type", submission.caseType], ["Message", submission.message],
  ]
    .filter(([, v]) => v != null && String(v).trim() !== "")
    .map(([k, v]) => `<p><strong>${esc(k)}:</strong> ${esc(v)}</p>`)
    .join("");
  return {
    to: rushRecipients(env),
    from: rushFrom(env),
    replyTo: isEmailish(submission.email) ? String(submission.email).trim() : undefined,
    subject: `[RUSH] New priority matter - ${submission.name || "inquiry"}`.slice(0, 120),
    html: `<p>A rush / priority matter was submitted and needs immediate attention.</p>${rows}<p>Reply to this email to reach the attorney directly.</p>`,
    text: `RUSH priority matter from ${submission.name || "inquiry"} (${submission.email || "no email"} / ${submission.phone || "no phone"}). Message: ${submission.message || ""}`,
  };
}
export function buildAttorneyAckEmail(submission, env = process.env) {
  if (!isEmailish(submission.email)) return null;
  return {
    to: String(submission.email).trim(),
    from: rushFrom(env),
    subject: "We received your rush matter - KWVRS",
    html:
      `<p>Thank you${submission.name ? `, ${esc(submission.name)}` : ""} - we received your rush matter and routed it directly to our senior team.</p>` +
      `<p>Expect a prompt response. To reach us immediately, call <a href="tel:+12013430700">(201) 343-0700</a> or email <a href="mailto:info@kwvrs.com">info@kwvrs.com</a>.</p>` +
      `<p>Kincaid Wolstein Vocational and Rehabilitation Services</p>`,
    text: "We received your rush matter and routed it to our senior team. For an immediate response call (201) 343-0700 or email info@kwvrs.com.",
  };
}
export async function dispatchRushAlerts(submission, deps = {}) {
  const _send = deps.sendEmail || mailer.sendEmail;
  const env = deps.env || process.env;
  const team = await Promise.resolve(_send(buildTeamRushEmail(submission, env))).catch((e) => ({ ok: false, error: e.message }));
  const ackMsg = buildAttorneyAckEmail(submission, env);
  const ack = ackMsg
    ? await Promise.resolve(_send(ackMsg)).catch((e) => ({ ok: false, error: e.message }))
    : { ok: false, error: "no valid submitter email - ack skipped" };
  return { team, ack };
}
