// Breakdown email for the /tools economic-damages estimator lead funnel.
// Pure builder + best-effort dispatcher (mirrors rush-alert.server.mjs). The
// server RECOMPUTES the estimate from the submitted inputs via the shared lib
// engine - client-supplied result numbers are never trusted for the emailed
// document. No PHI: numeric case assumptions + the attorney's contact only.
import * as mailer from "./mailer.server.mjs";
import { calculateEconomicDamages } from "./damages-estimate.mjs";

const DEFAULT_FROM = "KWVRS <intake@info.kwvrs.com>";
const DEFAULT_REPLY_TO = "info@kwvrs.com";

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const isEmailish = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? "").trim());
const usd = (n) =>
  Number(n).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const pct = (n) => `${(Number(n) * 100).toFixed(1)}%`;

/** Numeric scenario inputs accepted from the form (whitelist). */
export const SCENARIO_FIELDS = [
  "annualIncome", "annualFringeRate", "currentAge", "retirementAge",
  "worklifeLossYears", "lossBeforeFileInjuryYears", "pastWageMultiplier",
  "growthRate", "discountRate", "inflationRateFuture",
  "medicalsPast", "medicalsFuture", "attendantCarePast", "attendantCareFuture",
  "otherPast", "otherFuture",
];

/** Extracts only the whitelisted numeric inputs from a submission. */
export function scenarioFromSubmission(data = {}) {
  const s = {};
  for (const f of SCENARIO_FIELDS) {
    const n = Number(data[f]);
    if (Number.isFinite(n)) s[f] = n;
  }
  return s;
}

/**
 * Builds the attorney-facing breakdown email. Recomputes the estimate from the
 * submitted inputs; returns null when the recipient email is invalid or the
 * inputs are rejected by the engine (bad rates), so callers can just skip.
 */
export function buildEstimatorEmail(data = {}, env = process.env) {
  const email = String(data.email ?? "").trim();
  if (!isEmailish(email)) return null;
  let report;
  try {
    report = calculateEconomicDamages(scenarioFromSubmission(data));
  } catch {
    return null;
  }
  const t = report.lineItems.totals;
  const a = report.assumptions;
  const name = String(data.name ?? "").trim();

  const row = (label, value) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#5a6478;">${esc(label)}</td>` +
    `<td style="padding:6px 0;text-align:right;font-family:Consolas,Menlo,monospace;color:#1a2744;">${esc(value)}</td></tr>`;

  const html = [
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#1a2744;max-width:620px;margin:0 auto;padding:24px;">`,
    `<h2 style="font-family:Georgia,serif;color:#0d7377;margin:0 0 4px;">Preliminary Economic Loss Estimate</h2>`,
    `<p style="margin:0 0 16px;color:#5a6478;font-size:13px;">Planning-level estimate generated on kwvrs.com - not an expert opinion.</p>`,
    name ? `<p style="margin:0 0 14px;">Dear ${esc(name)},</p>` : "",
    `<p style="margin:0 0 16px;">Here is the full breakdown of the estimate you ran, with the assumptions you entered.</p>`,
    `<h3 style="margin:0 0 6px;font-size:15px;">Estimate</h3>`,
    `<table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 18px;">`,
    row("Past lost earnings", usd(report.lineItems.past.pastEconomicLoss)),
    row("Past medical + other (from bills - shown for reference, not added into the total)", usd(report.lineItems.past.pastMedicalAndOther)),
    row("Future lost earnings (present value)", usd(report.lineItems.future.presentValueFutureEarnedIncome)),
    row("Future medical (present value)", usd(report.lineItems.future.presentValueFutureMedicals)),
    row("Future attendant care (present value)", usd(report.lineItems.future.presentValueFutureAttendantCare)),
    row("Future other (present value)", usd(report.lineItems.future.presentValueFutureOther)),
    `<tr><td colspan="2" style="border-top:2px solid #1a2744;padding-top:8px;"></td></tr>`,
    row("Total economic damages (midpoint)", usd(t.totalEconomicDamages)),
    row("Planning range (low - high)", `${usd(t.uncertaintyBand.low)} - ${usd(t.uncertaintyBand.high)}`),
    `</table>`,
    `<h3 style="margin:0 0 6px;font-size:15px;">Assumptions you entered</h3>`,
    `<table style="width:100%;border-collapse:collapse;font-size:13px;margin:0 0 18px;">`,
    row("Annual income", usd(a.annualIncome)),
    row("Fringe benefits rate", pct(a.annualFringeRate)),
    row("Worklife loss (years)", String(a.worklifeLossYears)),
    row("Wage growth / discount / inflation", `${pct(a.growthRate)} / ${pct(a.discountRate)} / ${pct(a.inflationRateFuture)}`),
    `</table>`,
    `<p style="margin:0 0 16px;">If this matter warrants a defensible, court-ready analysis, our vocational, life care planning, and forensic economics experts can help - for plaintiff or defense counsel.</p>`,
    `<p style="margin:0 0 18px;"><a href="https://kwvrs.com/contact" style="display:inline-block;background:#0d7377;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:bold;">Discuss this case with an expert</a></p>`,
    `<p style="margin:0;color:#5a6478;font-size:12px;line-height:1.6;">This preliminary estimate is a planning tool only. It is not an expert opinion, report, or testimony, and it has not been reviewed by a KWVRS expert. Methods, rates, and offsets vary by case facts and jurisdiction; a retained analysis may differ materially. You can reply to this email or call (201) 343-0700.</p>`,
    `</div>`,
  ].join("");

  return {
    to: email,
    from: env.RESEND_FROM || DEFAULT_FROM,
    replyTo: env.RESEND_REPLY_TO || DEFAULT_REPLY_TO,
    subject: `Your preliminary economic loss estimate (${usd(t.uncertaintyBand.low)} - ${usd(t.uncertaintyBand.high)})`,
    html,
  };
}

/**
 * Best-effort dispatcher: never throws; logs and returns { sent, reason }.
 * The lead is already durably stored + forwarded before this runs, so a mail
 * failure loses nothing.
 */
export async function dispatchEstimatorEmail(data, deps = {}) {
  const _send = deps.sendEmail || mailer.sendEmail;
  const msg = buildEstimatorEmail(data, deps.env || process.env);
  if (!msg) return { sent: false, reason: "invalid-input" };
  try {
    const res = await _send(msg);
    if (!res.ok) console.error(`estimator email failed: ${res.error}`);
    return { sent: !!res.ok, reason: res.ok ? null : res.error };
  } catch (err) {
    console.error(`estimator email errored: ${err.message}`);
    return { sent: false, reason: err.message };
  }
}
