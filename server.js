import { createServer } from "http";
import { readFileSync, existsSync, statSync, appendFileSync, mkdirSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { gzipSync } from "zlib";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { validateRoute, normalizePaymentIntent, normalizeRaffle } from "./validation.server.mjs";
import { deriveRetainedExpertKeys } from "./lib/intake-schema.mjs";
import { verifyTurnstile, turnstileStartupState } from "./turnstile.server.mjs";
import * as rawSubs from "./lib/raw-submissions.server.mjs";
import { isRush, dispatchRushAlerts } from "./lib/rush-alert.server.mjs";
import { dispatchEstimatorEmail } from "./lib/estimator-email.server.mjs";
import { checkSpam } from "./lib/spam-heuristics.server.mjs";
import { dispatchGrowLead, hasEntered, readRaffleEntries, recordRaffleEntry } from "./lib/raffle.server.mjs";
import { raffleLeadsReport } from "./lib/raffle-metrics.mjs";
import { createLegacyGeoResolver } from "./lib/legacy-flat-geo.server.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DIST = join(__dirname, "dist");

// Ensure data directory exists for form submissions
mkdirSync(join(__dirname, "data"), { recursive: true });

// Parse JSON request body (capped so a malicious client can't exhaust memory).
// Rejections carry a `status` so handlers can answer 413/400 instead of 500;
// Node's built-in requestTimeout reaps clients that keep streaming after that.
const MAX_BODY_BYTES = 1024 * 1024;

export function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;
    req.on("data", (chunk) => {
      if (tooLarge) return;
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        tooLarge = true;
        chunks.length = 0;
        reject(Object.assign(new Error("Request body too large"), { status: 413 }));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (tooLarge) return;
      let parsed;
      try {
        // Concatenate the raw Buffers and decode utf8 ONCE, so a multibyte
        // character split across chunk boundaries is not corrupted (a per-chunk
        // toString would decode each half separately into replacement chars).
        parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch {
        reject(Object.assign(new Error("Invalid JSON"), { status: 400 }));
        return;
      }
      // Every /api route expects a JSON object body. Reject null / arrays /
      // primitives with 400 up front, instead of letting a later property
      // access throw and surface as a 500 with an internal message.
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        reject(Object.assign(new Error("Invalid request body"), { status: 400 }));
        return;
      }
      resolve(parsed);
    });
  });
}

// Naive fixed-window rate limit for the form APIs - enough to blunt scripted
// spam without external dependencies. Railway fronts the app with a proxy, so
// the client IP arrives in x-forwarded-for.
// 10/min/IP by default, GLOBAL to every form API - so it is the wrong dial for a
// conference. A booth puts every attendee behind ONE NAT address and the 11th
// raffle scan in a minute would 429 a real entrant, but raising RATE_LIMIT_MAX
// to fix that would loosen /api/contact, /api/consultation and the rest for
// every IP on the internet. Raise RAFFLE_RATE_LIMIT_MAX instead: it applies
// ONLY to /api/raffle (via the route table's rateLimitMax) and falls back to the
// global when unset. The per-IP counter stays shared, so a booth's raffle
// traffic still counts against that IP's ordinary 10/min on every other route.
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 10;
// 0 is a MEANINGFUL setting here (hard-block the raffle route during abuse), so
// this must not use `||`, which would silently turn 0 back into the global cap.
const rawRaffleMax = Number(process.env.RAFFLE_RATE_LIMIT_MAX);
const RAFFLE_RATE_LIMIT_MAX = Number.isFinite(rawRaffleMax) && rawRaffleMax >= 0 ? rawRaffleMax : RATE_LIMIT_MAX;
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateBuckets = new Map();

// Railway fronts the app with a proxy that APPENDS the real client IP to the
// RIGHT of x-forwarded-for. The leftmost entries are client-controllable - a
// spammer could forge a different first hop per request to mint unlimited
// rate-limit buckets - so we trust the rightmost entry (the one the proxy added),
// not the first. Shared by the rate-limiter and the Turnstile remoteip.
export function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    const parts = forwarded.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return req.socket?.remoteAddress || "unknown";
}

function rateLimited(req, max = RATE_LIMIT_MAX) {
  const ip = clientIp(req);
  const now = Date.now();
  if (rateBuckets.size > 10_000) {
    for (const [key, bucket] of rateBuckets) {
      if (now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) rateBuckets.delete(key);
    }
  }
  const bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(ip, { count: 1, windowStart: now });
    // max=0 is a HARD block (the raffle route's abuse dial): even the first
    // request of a fresh window is limited, not trickled through one-per-window.
    return max < 1;
  }
  bucket.count += 1;
  return bucket.count > max;
}

// Save a form submission to JSON Lines file. This is ONLY a belt-and-suspenders
// breadcrumb - the durable path is persistRawSubmission (Supabase) + the
// workflow forward. A write failure here (e.g. a root-owned Railway volume
// mounted at /app/data while the container runs as the non-root `node` user)
// must NEVER abort the submission, so it is caught and logged, not thrown.
function saveSubmission(type, data) {
  const entry = { type, timestamp: new Date().toISOString(), ...data };
  try {
    appendFileSync(
      join(__dirname, "data", "submissions.jsonl"),
      JSON.stringify(entry) + "\n"
    );
  } catch (err) {
    console.error(`saveSubmission breadcrumb write failed (non-fatal): ${err.message}`);
  }
}

// Durable lead capture: write the submission to Supabase raw_submissions BEFORE
// responding 200, independent of forwarding. Wrapped so a Supabase outage is
// logged loudly but never throws - the visitor still gets {success:true} and the
// jsonl breadcrumb remains the last-ditch local record. deps are injectable for
// unit testing.
export async function persistRawSubmission(id, type, data, deps = {}) {
  const _rawSubs = deps.rawSubs || rawSubs;
  // deps.forwarded marks the row forwarded AT INSERT TIME for routes that never
  // reach the workflow (forward:false). Without it the row would sit
  // forwarded=false and the replay sweep would forward it later - minting a case
  // out of a raffle entry. Same atomic-insert posture as persistQuarantined.
  // The key is OMITTED (not sent as false) when unset, mirroring
  // insertRawSubmission's own conditional body.
  const body =
    deps.forwarded === true
      ? { id, type, payload: data, forwarded: true }
      : { id, type, payload: data };
  try {
    await _rawSubs.insertRawSubmission(body);
    return true;
  } catch (err) {
    console.error(
      `DURABLE PERSIST FAILED (${type}) id=${id} email=${data.email || "no-email"}: ${err.message} ` +
        `- jsonl breadcrumb retained; lead NOT in raw_submissions`,
    );
    return false;
  }
}

// Durable QUARANTINE write for a spam-flagged submission. A single atomic
// insert with forwarded:true (insertRawSubmission's quarantine flag) so the row
// can never exist in the replayable forwarded=false state - replayUnforwarded
// never re-sends it, and listUnforwarded additionally excludes any row with
// payload._spam as defense-in-depth. Stays queryable by `payload->_spam is not
// null`. A Supabase outage is swallowed (logged) so the bot still gets the
// normal 200 and the jsonl breadcrumb remains. deps injectable for unit testing.
export async function persistQuarantined(id, type, data, deps = {}) {
  const _rawSubs = deps.rawSubs || rawSubs;
  try {
    await _rawSubs.insertRawSubmission({ id, type, payload: data, forwarded: true });
    return true;
  } catch (err) {
    console.error(`quarantine persist failed (${type}) id=${id}: ${err.message} - jsonl breadcrumb retained`);
    return false;
  }
}

// Optional workflow-service forwarding: when WORKFLOW_URL and
// WORKFLOW_FORWARD_TOKEN are set, each submission is also posted to the
// intake pipeline (Supabase case record, DocuSign PSA, Drive folder, Asana
// task - see workflow/README.md). Fire-and-forget: a workflow outage must
// never fail the visitor's form submission.
const WORKFLOW_URL = (process.env.WORKFLOW_URL || "").replace(/\/$/, "");
const WORKFLOW_FORWARD_TOKEN = process.env.WORKFLOW_FORWARD_TOKEN || "";

// Retry transient failures so a brief workflow/Supabase blip doesn't drop a
// lead. 4xx (auth/validation) won't fix themselves, so those are not retried.
// Backoff delays precede attempts 2..4.
const FORWARD_BACKOFF_MS = [1000, 4000, 10000];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function forwardToWorkflow(type, submission) {
  if (!WORKFLOW_URL || !WORKFLOW_FORWARD_TOKEN) {
    console.error(
      `workflow forward skipped (${type}): ` +
        `${WORKFLOW_URL ? "" : "WORKFLOW_URL unset; "}${WORKFLOW_FORWARD_TOKEN ? "" : "WORKFLOW_FORWARD_TOKEN unset"}`,
    );
    return { ok: false, caseId: null, error: "forward not configured", attempts: 0 };
  }
  const submissionId = submission.__submissionId || "";
  const maxAttempts = FORWARD_BACKOFF_MS.length + 1;
  let lastError = "unknown";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const headers = {
        "Content-Type": "application/json",
        "x-workflow-token": WORKFLOW_FORWARD_TOKEN,
      };
      if (submissionId) headers["x-submission-id"] = submissionId;
      const res = await fetch(`${WORKFLOW_URL}/api/case`, {
        method: "POST",
        headers,
        body: JSON.stringify({ type, submission }),
      });
      if (res.ok) {
        console.log(`workflow forward ok (${type}): ${res.status}`);
        const text = await res.text().catch(() => "");
        let caseId = null;
        try {
          caseId = text ? JSON.parse(text).id ?? null : null;
        } catch {
          caseId = null;
        }
        return { ok: true, caseId, error: null, attempts: attempt };
      }
      const text = await res.text().catch(() => "");
      lastError = `${res.status} ${text.slice(0, 200)}`;
      // 4xx other than 429 (rate limit) are permanent - don't waste retries.
      if (res.status < 500 && res.status !== 429) {
        console.error(`workflow forward rejected, no retry (${type}): ${lastError}`);
        return { ok: false, caseId: null, error: lastError, attempts: attempt };
      }
      console.error(`workflow forward attempt ${attempt}/${maxAttempts} failed (${type}): ${res.status} ${text.slice(0, 120)}`);
    } catch (err) {
      lastError = err.message;
      console.error(`workflow forward attempt ${attempt}/${maxAttempts} errored (${type}): ${err.message}`);
    }
    if (attempt < maxAttempts) await sleep(FORWARD_BACKOFF_MS[attempt - 1]);
  }
  // The submission is durable in raw_submissions; log loudly for visibility.
  console.error(
    `workflow forward GAVE UP after ${maxAttempts} attempts (${type}): ` +
      `${submission.email || "no-email"}`,
  );
  return { ok: false, caseId: null, error: lastError, attempts: maxAttempts };
}

// Fire-and-forget forward AFTER the durable write. Embeds the stable submission
// id so the workflow dedupes on it, then flips raw_submissions.forwarded on
// success or records the failure (so the replay sweep can retry it later).
// deps are injectable for unit testing.
export async function queueForward(submissionId, type, data, deps = {}) {
  const _forward = deps.forward || forwardToWorkflow;
  const _rawSubs = deps.rawSubs || rawSubs;
  // Whether the durable raw_submissions write succeeded (passed in from the call
  // site). Default true so callers that don't track it keep prior behavior.
  const persisted = deps.persisted !== false;
  const result = await _forward(type, { ...data, __submissionId: submissionId });
  try {
    if (result.ok) {
      await _rawSubs.markForwarded(submissionId, { caseId: result.caseId });
    } else {
      // Initial forward: no row in hand, so the DB row's stored attempts is 0.
      // Pass 0 (NOT result.attempts, the per-call HTTP retry count) so the first
      // failure writes attempts=1 and the per-row counter accumulates monotonically.
      await _rawSubs.recordForwardFailure(submissionId, { error: result.error, attempts: 0 });
    }
  } catch (err) {
    console.error(`raw_submissions status update failed for ${submissionId}: ${err.message}`);
  }
  // Double-failure: the durable persist failed AND the forward gave up, so this
  // lead exists ONLY in the ephemeral jsonl breadcrumb (lost on the next Railway
  // deploy, and the replay sweep can't recover it - there is no raw_submissions
  // row). Flag it loudly so it can be rescued from the logs before a redeploy.
  const atRisk = !persisted && !result.ok;
  if (atRisk) {
    console.error(
      `LEAD AT RISK id=${submissionId} type=${type} email=${data.email || "no-email"}: ` +
        `durable persist FAILED and forward gave up - lead is only in the ephemeral jsonl breadcrumb`,
    );
  }
  return { ...result, atRisk };
}

// Fire-and-forget rush alerts (team alert + attorney ack) AFTER the durable write
// + 200. Non-rush submissions are a no-op. Never rejects: a mailer outage only
// logs, so it can't affect the visitor's request or the workflow forward. deps
// injectable for unit testing.
export function queueRushAlerts(data, deps = {}) {
  const _isRush = deps.isRush || isRush;
  const _dispatch = deps.dispatch || dispatchRushAlerts;
  if (!_isRush(data)) return null;
  return Promise.resolve()
    .then(() => _dispatch(data))
    .catch((err) => {
      console.error(`rush alert dispatch failed: ${err.message}`);
      return { error: err.message };
    });
}

// Estimator breakdown email: fire-and-forget AFTER the durable write, so a
// mail failure can never affect the visitor's request or lose the lead. Only
// runs for the estimator lead type. deps injectable for unit testing.
export function queueEstimatorEmail(type, data, deps = {}) {
  if (type !== "estimator") return null;
  const _dispatch = deps.dispatch || dispatchEstimatorEmail;
  return Promise.resolve()
    .then(() => _dispatch(data))
    .catch((err) => {
      console.error(`estimator email dispatch failed: ${err.message}`);
      return { error: err.message };
    });
}

// Raffle ledger write: SYNCHRONOUS, before the 200. The drawing must never
// depend on Clio being up, and a conference scan has no second chance. Returns
// the stored row (null for every other route type). deps injectable for testing.
export function recordRaffle(type, submissionId, data, deps = {}) {
  if (type !== "raffle") return null;
  const _record = deps.record || recordRaffleEntry;
  return _record(submissionId, data);
}

// Clio Grow push: fire-and-forget AFTER the durable write + 200, so a vendor
// outage never reaches the entrant at the booth. dispatchGrowLead appends the
// outcome row to the ledger itself. No-op when there is no entry.
export function queueRaffleLead(entry, deps = {}) {
  if (!entry) return null;
  const _dispatch = deps.dispatch || dispatchGrowLead;
  return Promise.resolve()
    .then(() => _dispatch(entry))
    .catch((err) => {
      console.error(`raffle Grow dispatch failed: ${err.message}`);
      return { error: err.message };
    });
}

// Reconciliation replay: re-forward un-forwarded raw_submissions rows (left
// behind by a workflow/Supabase outage). Runs once shortly after boot and on a
// periodic tick. Serialized by a guard so a slow run never overlaps the next.
const REPLAY_INTERVAL_MS = Number(process.env.REPLAY_INTERVAL_MS) || 5 * 60 * 1000;
const REPLAY_MAX_ATTEMPTS = Number(process.env.REPLAY_MAX_ATTEMPTS) || 10;

export async function replayUnforwarded({ limit = 50 } = {}, deps = {}) {
  const _rawSubs = deps.rawSubs || rawSubs;
  const _forward = deps.forward || forwardToWorkflow;
  if (!_rawSubs.enabled) {
    console.log("replay skipped: raw_submissions client disabled");
    return { checked: 0, replayed: 0, deadLettered: 0 };
  }
  const rows = await _rawSubs.listUnforwarded(limit);
  let replayed = 0;
  let deadLettered = 0;
  for (const row of rows) {
    // Defense in depth: these types are inserted forwarded:true and can never
    // legitimately appear here, but a row that somehow landed forwarded=false
    // must still never be replayed into the workflow (case + Asana + notice).
    if (NON_FORWARDING_TYPES.has(row.type)) {
      console.warn(`replay skipped non-forwarding type ${row.type} id=${row.id}`);
      continue;
    }
    if ((row.attempts || 0) >= REPLAY_MAX_ATTEMPTS) {
      // Poison-pill lead: it has failed to forward REPLAY_MAX_ATTEMPTS times and
      // is now abandoned. Surface it LOUDLY (error, not warn) so log-based alerting
      // fires every sweep until an operator handles it - the row stays
      // forwarded=false and is queryable via `attempts >= REPLAY_MAX_ATTEMPTS`.
      deadLettered += 1;
      console.error(
        `ABANDONED LEAD (dead-letter) id=${row.id} type=${row.type} ` +
          `email=${row.payload?.email || "no-email"}: forwarding failed ${REPLAY_MAX_ATTEMPTS} times; ` +
          `last_error=${row.last_error || ""} - needs manual follow-up`,
      );
      continue;
    }
    const result = await _forward(row.type, { ...row.payload, __submissionId: row.id });
    try {
      if (result.ok) {
        await _rawSubs.markForwarded(row.id, { caseId: result.caseId });
        replayed += 1;
      } else {
        // Pass the row's CURRENT stored attempts (NOT result.attempts, the
        // per-call HTTP retry count) so the client writes stored+1 and the
        // per-row counter climbs by 1 each sweep toward REPLAY_MAX_ATTEMPTS.
        await _rawSubs.recordForwardFailure(row.id, { error: result.error, attempts: row.attempts || 0 });
      }
    } catch (err) {
      console.error(`replay status update failed for ${row.id}: ${err.message}`);
    }
  }
  console.log(`replay sweep: checked ${rows.length}, replayed ${replayed}, dead-lettered ${deadLettered}`);
  return { checked: rows.length, replayed, deadLettered };
}

let replaying = false;
async function replayTick() {
  if (replaying) return;
  replaying = true;
  try {
    await replayUnforwarded({ limit: 50 });
  } catch (err) {
    console.error("replay tick failed:", String(err));
  } finally {
    replaying = false;
  }
}

// Re-derive the requested-expert keys IN PLACE from the shared roster, so what
// is stored and forwarded is what lib/intake-schema.mjs says rather than what
// was posted. The client already derives these (src/lib/intake-payloads.ts and
// src/lib/agreementPayload.ts), but the composite /agreements form posts
// retainedExpert/retainedExpertName/retainedExpertTier as ordinary body keys -
// so a tampered or replayed submission could otherwise render a fabricated
// person, or a fabricated Senior tier, on the admin dashboard and in the
// internal team email. An unknown/off-roster/blank slug DELETES all three keys
// (deriveRetainedExpertKeys returns {}) rather than leaving a half-payload for
// the workflow's own fallback to print. Runs on the consultation route only -
// the surface both retainer forms post to.
export function normalizeRetainedExpert(data) {
  if (!data || typeof data !== "object") return;
  const derived = deriveRetainedExpertKeys(data);
  for (const key of ["retainedExpert", "retainedExpertName", "retainedExpertTier"]) {
    if (derived[key]) data[key] = derived[key];
    else delete data[key];
  }
}

// Form submission routes: type tag written to submissions.jsonl plus the
// fields a request must include. The PSA retainer intake forms post attorney
// fields instead of plain name/email, so the consultation route normalizes
// those before validation.
export const API_ROUTES = {
  "/api/contact": {
    type: "contact",
    required: ["name", "email", "phone", "message"],
    requiredMessage: "name, email, phone, and message are required",
    turnstile: true,
  },
  "/api/consultation": {
    type: "consultation",
    required: ["name", "email"],
    requiredMessage: "name and email are required",
    turnstile: true,
    normalize(data) {
      if (!data.name && data.retainingAttorneyName) data.name = data.retainingAttorneyName;
      if (!data.email && data.retainingAttorneyEmail) data.email = data.retainingAttorneyEmail;
      if (!data.phone && data.retainingAttorneyPhone) data.phone = data.retainingAttorneyPhone;
      normalizeRetainedExpert(data);
    },
  },
  "/api/whitepaper": {
    type: "whitepaper",
    required: ["name", "email", "slug"],
    requiredMessage: "name, email, and slug are required",
    turnstile: true,
  },
  // Lead funnel: /tools economic-damages estimator. The generic handler gives
  // the durable raw_submissions row + workflow forward (dashboard lead + team
  // notice); queueEstimatorEmail then sends the attorney their full breakdown.
  "/api/estimator": {
    type: "estimator",
    required: ["name", "email", "firm"],
    requiredMessage: "name, email, and firm are required",
    turnstile: true,
  },
  // Lead funnel: /tools life-expectancy calculator. Soft CTA - no result email
  // is sent (queueEstimatorEmail no-ops for any non-estimator type); the generic
  // handler still writes the durable raw_submissions row and forwards the lead
  // to the workflow (dashboard lead + team notice).
  "/api/life-expectancy": {
    type: "life-expectancy",
    required: ["name", "email", "firm"],
    requiredMessage: "name, email, and firm are required",
    turnstile: true,
  },
  // Unlisted /payment page: the "tell us what this payment is for" gate in front
  // of the Zelle QR, so every payment is trackable to an invoice. This is NOT a
  // lead - the workflow stores it in payment_intents and creates NO case, Asana
  // task, Drive folder, or notification email for this type. It rides the SAME
  // generic pipeline as every other route (Turnstile + spam quarantine + durable
  // raw_submissions write + retried forward) with no special-casing beyond the
  // normalize/validate hooks below: normalize trims/canonicalizes the fields, and
  // validateRoute("payment-intent") enforces the amount + invoice-number rules.
  "/api/payment-intent": {
    type: "payment-intent",
    required: ["name", "email", "invoiceNumber", "amount"],
    requiredMessage: "name, email, invoice number, and amount are required",
    turnstile: true,
    normalize: normalizePaymentIntent,
  },
  // Unlisted /raffle page: the conference QR gift-card entry form. This is a
  // MARKETING lead, not a matter - `forward: false` keeps it out of the workflow
  // entirely (workflow/server.js routes every forwarded type except
  // payment-intent into caseFromForward: a case, an Asana task, a Drive folder,
  // and a team email per badge scan). It still rides the whole generic pipeline
  // (rate limit + Turnstile + honeypot/gibberish quarantine + durable
  // raw_submissions row); the raffle-specific work is the ledger write before the
  // 200 and the best-effort Clio Grow push after it.
  "/api/raffle": {
    type: "raffle",
    required: ["firstName", "lastName", "email"],
    requiredMessage: "first name, last name, and email are required",
    turnstile: true,
    forward: false,
    // Per-route rate limit (RAFFLE_RATE_LIMIT_MAX), so a booth on one NAT
    // address can be widened without widening every other form API.
    rateLimitMax: RAFFLE_RATE_LIMIT_MAX,
    normalize: normalizeRaffle,
    // One entry per email per event. A repeat scan gets the SAME 200 a first
    // entry gets (plus duplicate:true so the page can say "you are already
    // entered") - never an error at a booth - and is neither re-stored nor
    // re-posted to Grow.
    duplicate: (data) => hasEntered(data.event, data.email),
  },
};

// Route types that must NEVER become a workflow case. Derived from API_ROUTES so
// the route table stays the single source of truth. Used twice: the handler
// skips queueForward, and replayUnforwarded skips any row that somehow landed
// forwarded=false anyway.
export const NON_FORWARDING_TYPES = new Set(
  Object.values(API_ROUTES)
    .filter((route) => route.forward === false)
    .map((route) => route.type),
);

/**
 * Gate for GET /api/raffle-entries, the read-only feed the workflow dashboard's
 * /admin/raffle-leads page fetches server-side. It reuses the shared secret the
 * site->workflow forward already carries (x-workflow-token holding
 * WORKFLOW_FORWARD_TOKEN, see forwardToWorkflow), just in the other direction:
 * both services already have the value, so this adds no new secret to rotate.
 * Constant-time, and false whenever the token is unset - an unconfigured service
 * must fail closed, not open. Exported for tests.
 */
export function raffleEntriesAuthorized(req) {
  const supplied = req.headers["x-workflow-token"];
  if (!WORKFLOW_FORWARD_TOKEN || typeof supplied !== "string" || !supplied) return false;
  const a = Buffer.from(supplied);
  const b = Buffer.from(WORKFLOW_FORWARD_TOKEN);
  return a.length === b.length && timingSafeEqual(a, b);
}

// CORS headers for API responses
const API_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain",
  // The engineering guide ships a companion mermaid source
  // (public/engineering-guide/document-receipt-workflow.md) and links it. Without
  // an entry here it falls through to application/octet-stream.
  ".md": "text/markdown",
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const COMPRESSIBLE = new Set([
  "text/html",
  "application/javascript",
  "text/css",
  "application/json",
  "image/svg+xml",
  "application/xml",
  "text/plain",
  "text/markdown",
]);

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Railway serves the site over HTTPS only; browsers ignore HSTS on plain
  // HTTP (local Docker testing), so this is a no-op outside production.
  "Strict-Transport-Security": "max-age=31536000",
  // Defense-in-depth CSP. The site is a prerendered SPA: the only external origins
  // are Google Fonts (stylesheet + font files) and Cloudflare Turnstile (script +
  // challenge iframe), and the only inline JS is the tiny `js`-class bootstrap +
  // per-page JSON-LD - so script/style allow 'unsafe-inline' (a nonce-per-page
  // scheme isn't workable for the static prerender). object-src/base-uri/
  // form-action/frame-ancestors are locked down to blunt injection + clickjacking.
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com",
    "frame-src https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
};

// Client-side-only routes: real React routes that are intentionally NOT
// prerendered - the link-only PSA agreement pages. Serve the SPA shell with 200
// (an emailed agreement link must not look like a 404 to link scanners) but
// noindex so they stay out of search. (The internal /review dashboard is dev-only
// in App.tsx and is NOT listed here, so in production it correctly 404s.)
const CLIENT_ONLY_ROUTES = (pathname) =>
  pathname.startsWith("/agreements/") ||
  pathname === "/samples" ||
  pathname === "/cv" ||
  // Unlisted Zelle payment page (QR + payment link). Link-only + noindex.
  pathname === "/payment" ||
  // Unlisted conference raffle page reached from a printed QR code
  // (/raffle?event=<slug>). Link-only + noindex, never in the sitemap.
  pathname === "/raffle" ||
  // The unified public intake form (case-type-driven; the old PI + Matrimonial
  // routes 301 here). Client-rendered SPA route, so the server must serve it
  // (it is not prerendered) - without this it 404s and every redirect dead-ends.
  pathname === "/contact/intake" ||
  // Unlisted direct-link retainer intake forms (noindex, not in the sitemap):
  // the Non-Metro form is also reachable at the short /nm link.
  pathname.toLowerCase() === "/nm" ||
  pathname === "/contact/nonmetro-intake" ||
  pathname === "/contact/consulting-intake";

// Bounded so ~6,600 prerendered HTML pages can't accumulate unbounded memory;
// oldest entries are evicted first (Map preserves insertion order).
const GZIP_CACHE_MAX_ENTRIES = 1000;
const gzipCache = new Map();

const indexHtml = readFileSync(join(DIST, "index.html"));
const indexHtmlGz = gzipSync(indexHtml);

function getGzipped(filePath, content) {
  if (gzipCache.has(filePath)) {
    return gzipCache.get(filePath);
  }
  const gz = gzipSync(content);
  if (gzipCache.size >= GZIP_CACHE_MAX_ENTRIES) {
    gzipCache.delete(gzipCache.keys().next().value);
  }
  gzipCache.set(filePath, gz);
  return gz;
}

function acceptsGzip(req) {
  const ae = req.headers["accept-encoding"] || "";
  return ae.includes("gzip");
}

// Permanent (301) redirects: the Affidavit Report product (formerly "Short
// Form Report") has been retired. Any legacy product URL - under either the
// old or rebranded slug, including every state/city/discipline geo page - is
// sent to a sensible surviving page.
const REDIRECT_PREFIXES = [
  ["/services/affidavit-report", "/services"],
  ["/services/short-form-report", "/services"],
  ["/contact/affidavit-report", "/contact"],
  ["/contact/short-form-report", "/contact"],
  // The older "Combined" intake alias stays retired (301 to /contact). The
  // Consulting + Non-Metro intake forms are RE-ENABLED as unlisted direct-link
  // retainer forms (noindex via CLIENT_ONLY_ROUTES below), so they are no longer
  // redirected here.
  ["/contact/combined-intake", "/contact"],
  // Unified intake (spec 2026-07-16): the PI + Matrimonial forms fold into
  // one case-type-driven form at /contact/intake.
  ["/contact/personal-injury-intake", "/contact/intake"],
  ["/contact/marital-intake", "/contact/intake"],
  // Legacy Apache/WordPress-era .htm pages (Search Console 404s) -> nearest
  // surviving page.
  ["/index.htm", "/"],
  ["/index.html", "/"],
  ["/about_us.htm", "/about"],
  ["/counseling_services.htm", "/services/vocational-expert"],
  ["/litigation_support.htm", "/services/expert-witness-testimony"],
  // Legacy WordPress blog posts, category archives (+ their /feed/ children,
  // via the prefix match), and author pages -> nearest surviving page. The old
  // /services/<case-type>/forensic-economist(s) pages map to today's
  // forensic-economics case deep dives (none of those case-type segments is a
  // CURRENT service slug, so the prefix match can't shadow a live route).
  ["/rapel-and-earning-capacity", "/services/vocational-expert"],
  ["/what-counts-as-household-services", "/services/loss-of-household-services"],
  ["/litigation-services", "/services"],
  ["/category/forensic-economics", "/services/forensic-economics"],
  ["/category/vocational-experts", "/services/vocational-expert"],
  ["/category/rapel-model", "/services/vocational-expert"],
  ["/author", "/team"],
  ["/services/personal-injury", "/services/forensic-economics/case/personal-injury"],
  ["/services/medical-malpractice", "/services/forensic-economics/case/medical-malpractice"],
  ["/services/employment-litigation-law", "/services/forensic-economics/case/wrongful-termination"],
  // ---- Search Console 404 remediation (2026-07-27) ----
  // Every remaining pre-rebuild URL still in Google's index - recovered via the
  // Wayback CDX index of the old WordPress/Dreamweaver kwvrs.com plus the GSC
  // example list - 301s to its closest surviving equivalent. Trailing-slash
  // variants match via the same prefix logic; dead media/assets 410 instead
  // (see isLegacyGone). Old core pages:
  ["/about-us", "/about"],
  ["/contact-us", "/contact"],
  ["/contact_us.htm", "/contact"],
  ["/request-services", "/contact"],
  ["/privacy-policy", "/privacy"],
  ["/faqs", "/resources/faq"],
  ["/blog", "/insights"],
  ["/vocational-resource-news", "/insights"],
  ["/sitemap", "/"],
  ["/kincaid-clients.htm", "/about"],
  ["/why_hire.htm", "/about"],
  ["/services.htm", "/services"],
  ["/litigation_services.htm", "/services"],
  ["/expertise", "/services"],
  ["/consulting", "/services"],
  ["/what-is-a-forensic-expert-evaluation", "/services"],
  ["/case_types.htm", "/case-types"],
  ["/types-of-cases", "/case-types"],
  ["/payments", "/payment"],
  ["/pay-bills", "/payment"],
  // Old vocational-evaluation pages and blog posts:
  ["/vocational_evaluation.htm", "/services/vocational-expert"],
  ["/assistive_technology_evaluation.htm", "/services/vocational-expert"],
  ["/educational_evaluation.htm", "/services/vocational-expert"],
  ["/vocational-evaluation", "/services/vocational-expert"],
  ["/vocational-evaluation-expert", "/services/vocational-expert"],
  ["/vocational-evaluations-explained", "/services/vocational-expert"],
  ["/vocational-evaluations-process-and-methods", "/services/vocational-expert"],
  ["/vocational-experts-in-damages-cases", "/services/vocational-expert"],
  ["/how-to-read-and-parse-a-vocational-report", "/services/vocational-expert"],
  ["/interpreting-your-vocational-evaluation-report", "/services/vocational-expert"],
  ["/transition-evaluations", "/services/vocational-expert"],
  ["/counseling-services", "/services/vocational-expert"],
  ["/rapel-model-explained", "/guides/rapel-method-explained"],
  ["/how-to-prepare-for-your-vocational-evaluation", "/services/vocational-expert/process"],
  ["/vocational-expert-nj", "/services/vocational-expert/new-jersey"],
  ["/attorneys-vocational-forensic-evaulations", "/attorneys"],
  // Matrimonial family:
  ["/marital", "/services/matrimonial"],
  ["/matrimonial", "/services/matrimonial"],
  ["/matrimonial-matters", "/services/matrimonial"],
  ["/matrimonial_matters.htm", "/services/matrimonial"],
  ["/vocational-evaluation-family-law-and-alimony", "/services/matrimonial"],
  ["/the-critical-role-of-vocational-experts-in-family-law-and-divorce-litigation", "/services/matrimonial"],
  ["/services/divorce-law", "/services/matrimonial"],
  // Forensic economics / expert witness posts:
  ["/collaborating-with-economists", "/services/forensic-economics"],
  ["/damages-experts-explained", "/insights/how-forensic-economists-calculate-damages"],
  ["/five-key-qualities-in-a-forensic-witness", "/guides/when-do-you-need-expert-witness"],
  ["/cross-examination-strategies", "/services/expert-witness-testimony"],
  ["/deposition-prep-for-vocational-experts", "/services/expert-witness-testimony"],
  ["/litigation-support", "/services/expert-witness-testimony"],
  // Life care planning:
  ["/life_care_plans.htm", "/services/life-care-planning"],
  ["/life-care-plans", "/services/life-care-planning"],
  ["/lifecare-planning-after-injuries", "/guides/what-is-life-care-plan"],
  ["/integrating-life-care-planners-in-personal-injury-litigation-a-guide-for-legal-professionals", "/services/life-care-planning"],
  ["/common-weak-points-in-life-care-plans", "/guides/what-is-life-care-plan"],
  ["/life-care-planning-vs-forensic-evaluation", "/compare"],
  ["/life-care-plans-vs-economic-reports", "/compare"],
  // Household services:
  ["/loss-of-household-services", "/services/loss-of-household-services"],
  ["/household-services-high-income-households", "/guides/loss-of-household-services"],
  // Methods / guides topics:
  ["/labor-market-survey-101", "/methods/labor-market-survey"],
  ["/transferable-skills-analysis", "/methods/transferable-skills-analysis"],
  ["/partial-vs-total-impairment", "/methods/functional-capacity-evaluation"],
  ["/pre-vs-post-injury-contribution-analysis", "/guides/earning-capacity-vs-lost-earnings"],
  ["/assessing-earning-capacity-in-the-gig-economy", "/guides/earning-capacity-vs-lost-earnings"],
  ["/return-to-work-scenarios-and-worklife-expectancy", "/guides/worklife-expectancy-explained"],
  ["/impact-of-amendments-to-federal-rule-702", "/guides/federal-vs-state-court-daubert"],
  ["/daubert-rule-702-readiness-checklist", "/guides/daubert-standard-vocational-experts"],
  ["/documentation", "/guides/what-records-does-vocational-expert-need"],
  ["/documentation-hierarchy", "/guides/what-records-does-vocational-expert-need"],
  // Personal injury:
  ["/personal_injury.htm", "/services/forensic-economics/case/personal-injury"],
  ["/personal-injury", "/services/forensic-economics/case/personal-injury"],
  ["/personal-injury-impacts", "/services/forensic-economics/case/personal-injury"],
  // Old /services/<case-type>/... trees (incl. the /forensic-economist(s),
  // /life-care-planner, /vocational-expert children and old state suffixes like
  // /services/motor-vehicle-accident/florida, all via the prefix match). None of
  // these segments is a CURRENT service slug, so no live route is shadowed:
  ["/services/workers-compensation", "/case-types/workers-compensation"],
  ["/services/wrongful-death", "/case-types/wrongful-death"],
  ["/services/motor-vehicle-accident", "/case-types/motor-vehicle-accident"],
  ["/services/birth-injury", "/case-types"],
  ["/services/social-security-disability", "/guides/ssa-disability-and-vocational-evidence"],
  // Old category archives (specific first; the bare /category prefix is the
  // fallback for any archive not listed above, and also swallows /feed/ children):
  ["/category/damages-experts", "/services/forensic-economics"],
  ["/category/lifecare-planning", "/services/life-care-planning"],
  ["/category/loss-of-household-services", "/services/loss-of-household-services"],
  ["/category/cross-examination", "/services/expert-witness-testimony"],
  ["/category", "/insights"],
  // Legacy uploaded documents that have a direct current replacement (matched
  // BEFORE isLegacyGone 410s the rest of /content/; /wp-content twins included
  // because the old site answered on both prefixes):
  ["/content/uploads/2025/05/PHQ-english-fillable-1.pdf", "/documents/KWVRS-PHQ-English.pdf"],
  ["/content/uploads/2025/05/PHQ-spanish-espanol-fillable.pdf", "/documents/KWVRS-PHQ-Spanish.pdf"],
  ["/content/uploads/2025/08/HIPPA-English-fillable.pdf", "/documents/KWVRS-HIPAA-English.pdf"],
  ["/content/uploads/2025/08/HIPPA-Spanish-fillable.pdf", "/documents/KWVRS-HIPAA-Spanish.pdf"],
  ["/content/uploads/2025/09/2025-KWVRS-Marital-PSA-2.pdf", "/documents/KWVRS-PSA-Matrimonial.pdf"],
  ["/content/uploads/2026/01/2026-PI-PSA-1.pdf", "/documents/KWVRS-PSA-Personal-Injury.pdf"],
  ["/content/uploads/2026/02/Sample-Vocational-Evaluation-1.pdf", "/samples"],
  ["/wp-content/uploads/2025/05/PHQ-english-fillable-1.pdf", "/documents/KWVRS-PHQ-English.pdf"],
  ["/wp-content/uploads/2025/05/PHQ-spanish-espanol-fillable.pdf", "/documents/KWVRS-PHQ-Spanish.pdf"],
  ["/wp-content/uploads/2025/08/HIPPA-English-fillable.pdf", "/documents/KWVRS-HIPAA-English.pdf"],
  ["/wp-content/uploads/2025/08/HIPPA-Spanish-fillable.pdf", "/documents/KWVRS-HIPAA-Spanish.pdf"],
  ["/wp-content/uploads/2025/09/2025-KWVRS-Marital-PSA-2.pdf", "/documents/KWVRS-PSA-Matrimonial.pdf"],
  ["/wp-content/uploads/2026/01/2026-PI-PSA-1.pdf", "/documents/KWVRS-PSA-Personal-Injury.pdf"],
  ["/wp-content/uploads/2026/02/Sample-Vocational-Evaluation-1.pdf", "/samples"],
  // ---- Search Console 404 remediation, wave 2 (2026-08-18) ----
  // Flat-slug geo families are handled generically by resolveLegacyFlatGeo
  // (lib/legacy-flat-geo.server.mjs); these are the remaining one-off
  // stragglers from the same GSC batch. /faq never existed on the new site
  // (the live route is /resources/faq); the old WP post on earnings stability
  // maps to the earning-capacity guide like its sibling posts above; the
  // legacy uploaded PSA/sample PDFs get their direct current replacements
  // (/content + /wp-content twins, same convention as the 2026-07-27 block).
  ["/faq", "/resources/faq"],
  ["/when-stable-earnings-are-not-stable", "/guides/earning-capacity-vs-lost-earnings"],
  ["/content/uploads/2026/02/Sample-TBI-Life-Care-Plan.pdf", "/samples"],
  ["/content/uploads/2026/02/2026-Consulting-PSA-records-requested.pdf", "/documents/KWVRS-PSA-Consulting.pdf"],
  ["/content/uploads/2026/01/2026-KWVRS-Marital-PSA-1.pdf", "/documents/KWVRS-PSA-Matrimonial.pdf"],
  ["/content/uploads/2025/09/2025-KWVRS-PI-Records-Requested.pdf", "/documents/KWVRS-PSA-Personal-Injury.pdf"],
  ["/content/uploads/2025/04/2025-PI-PSA-1.pdf", "/documents/KWVRS-PSA-Personal-Injury.pdf"],
  ["/wp-content/uploads/2026/02/Sample-TBI-Life-Care-Plan.pdf", "/samples"],
  ["/wp-content/uploads/2026/02/2026-Consulting-PSA-records-requested.pdf", "/documents/KWVRS-PSA-Consulting.pdf"],
  ["/wp-content/uploads/2026/01/2026-KWVRS-Marital-PSA-1.pdf", "/documents/KWVRS-PSA-Matrimonial.pdf"],
  ["/wp-content/uploads/2025/09/2025-KWVRS-PI-Records-Requested.pdf", "/documents/KWVRS-PSA-Personal-Injury.pdf"],
  ["/wp-content/uploads/2025/04/2025-PI-PSA-1.pdf", "/documents/KWVRS-PSA-Personal-Injury.pdf"],
  // ---- Search Console 404 remediation, wave 3 (2026-08-23) ----
  // Retired team profile (member left). Used to answer 410 Gone, but Search
  // Console files 410s under "Not found (404)" and the 8/18 validation run
  // failed on exactly this URL (re-crawled Aug 18). A 301 to the team index is
  // the conventional, equally non-soft-404 answer and lets the report clear.
  ["/team/courtney-tremonte", "/team"],
  // Found by scripts/gsc-audit.mjs traffic (Search Analytics pages that still
  // earn impressions but don't answer 200): an old WP post the trailing-slash
  // canonicalizer was sending to a no-slash 404, and one more legacy sample PDF.
  ["/wrongful-termination-and-mitigation", "/case-types/wrongful-termination"],
  ["/content/uploads/2026/02/Sample-Loss-of-Household-Services-Report.pdf", "/samples"],
  ["/wp-content/uploads/2026/02/Sample-Loss-of-Household-Services-Report.pdf", "/samples"],
];

// Regex-shaped legacy redirects that a flat prefix list can't express.
// /client-portal-login-2, /client/client-portal-9pjm, /clients/ etc. were the
// old client portal (many hash-suffixed variants) - all land on /forms. The
// boundary groups keep the live /client-forms route from matching.
const REDIRECT_REGEXES = [
  [/^\/clients?(\/|$)/, "/forms"],
  [/^\/client-portal(-|\/|$)/, "/forms"],
];

// The 8 current service slugs, for collapsing the old FLAT geo pages
// (/services/forensic-economics-hawaii-east-honolulu) onto today's service
// pillar. Only a "<slug>-..." suffix form matches - the live nested routes
// (/services/forensic-economics/hawaii) use "/" so they can never be caught.
const SERVICE_SLUGS = [
  "expert-disclosure",
  "expert-witness-testimony",
  "forensic-economics",
  "life-care-planning",
  "loss-of-household-services",
  "matrimonial",
  "standard-of-care",
  "vocational-expert",
];

// Short, noindex quick-view shortcuts straight to each PSA PDF (matched
// case-insensitively): /PSA, /mpsa, /cpsa. (/nm is NOT a PDF shortcut - it is
// the Non-Metro intake FORM, a client-only noindex route, see below.) The
// target PSA PDFs are already served noindex,nofollow, and these redirects add
// the same header.
const PSA_SHORTCUTS = {
  "/psa": "/documents/KWVRS-PSA-Personal-Injury.pdf",
  "/mpsa": "/documents/KWVRS-PSA-Matrimonial.pdf",
  "/cpsa": "/documents/KWVRS-PSA-Consulting.pdf",
  // Legacy WordPress upload path for the PI PSA (old kwvrs.com); keys are
  // matched lowercased, so this also covers the mixed-case original URL.
  // Both the /content and standard /wp-content prefixes are aliased - the
  // /wp-content one MUST stay here (PSA_SHORTCUTS runs before the WordPress
  // remnant 410) or the blanket /wp-content rule would swallow it.
  "/content/uploads/2026/01/2026-kwvrs-pi-psa-1.pdf":
    "/documents/KWVRS-PSA-Personal-Injury.pdf",
  "/wp-content/uploads/2026/01/2026-kwvrs-pi-psa-1.pdf":
    "/documents/KWVRS-PSA-Personal-Injury.pdf",
};

// Legacy FLAT-SLUG geo URLs (GSC 404 remediation 2026-08-18): the pre-2026
// site's hyphen-joined /services/<service|state-|city-|cred->-<geo> pages and
// the old /services/<case-type>/<state> pages, resolved by longest-known-slug
// matching against the prerendered dist/ tree (see lib/legacy-flat-geo.server.mjs).
// Runs FIRST inside getRedirectTarget so /services/wrongful-death/north-dakota
// reaches its state-specific /case-types page instead of the coarser
// REDIRECT_PREFIXES entry, and so the flat geo pages land on the deepest
// existing nested page (city -> state -> pillar) instead of only the pillar.
const resolveLegacyFlatGeo = createLegacyGeoResolver({ distDir: DIST });

export function getRedirectTarget(pathname) {
  const flatGeo = resolveLegacyFlatGeo(pathname);
  if (flatGeo) return flatGeo;
  for (const [from, to] of REDIRECT_PREFIXES) {
    if (pathname === from || pathname.startsWith(from + "/")) {
      return to;
    }
  }
  for (const [re, to] of REDIRECT_REGEXES) {
    if (re.test(pathname)) return to;
  }
  // Old flat geo pages: /services/<service-slug>-<geo>[/...] -> the service pillar.
  const flat = pathname.match(/^\/services\/([a-z0-9-]+)/);
  if (flat) {
    for (const slug of SERVICE_SLUGS) {
      if (flat[1].startsWith(slug + "-")) return "/services/" + slug;
    }
  }
  return null;
}

// WordPress remnants of the pre-2026 kwvrs.com: admin/login/API endpoints and
// any path under /wp/ or /wp-admin/ etc. Matched case-insensitively. Exported
// for unit tests.
export function isWordPressRemnant(pathname) {
  const p = pathname.toLowerCase();
  return (
    p === "/xmlrpc.php" ||
    p === "/wp-login.php" ||
    p === "/wp-cron.php" ||
    p === "/wp" ||
    p.startsWith("/wp/") ||
    p.startsWith("/wp-admin") ||
    p.startsWith("/wp-json") ||
    p.startsWith("/wp-includes") ||
    p.startsWith("/wp-content")
  );
}

// Dead assets of the pre-2026 sites (Search Console 404 remediation): old
// upload/theme media under /content/, the Dreamweaver-era /images/ + Project
// Seven widget assets, WordPress feeds, retired WP sitemaps, and builder junk
// pages. Answered 410 Gone (same rationale as isWordPressRemnant) - but ONLY
// from the not-found fallthrough, AFTER static resolution, because the CURRENT
// site also serves real files under /images/ (public/images) and real
// *-sitemap.xml files; anything that still exists on disk always wins.
// Exported for unit tests.
export function isLegacyGone(pathname) {
  const p = pathname.toLowerCase();
  return (
    p === "/content" ||
    p.startsWith("/content/") ||
    p.startsWith("/images/") ||
    p.startsWith("/p7dmm/") ||
    p.startsWith("/p7ir2/") ||
    p.startsWith("/p7tm3/") ||
    p === "/feed" ||
    p.endsWith("/feed") ||
    p.endsWith("/feed/") ||
    /sitemap[a-z0-9-]*\.xml$/.test(p) ||
    p === "/sample-page" ||
    p.startsWith("/visual-composer")
  );
}

// kwvrs.com/admin is a convenience entry point to the internal workflow admin
// dashboard, which runs as a SEPARATE Railway service with its own OAuth login
// (per-user sessions). The bare /admin (the footer "Staff Login" link) lands on
// that login page; a deeper bookmark like /admin/ops-metrics keeps its
// /admin/<subpath> on the workflow origin so it routes straight through. Always
// answered with a 302 + X-Robots-Tag noindex; deliberately NOT in the sitemap or
// prerender list. The target host is overridable via ADMIN_DASHBOARD_URL (the
// default is the workflow dashboard login URL).
const ADMIN_DASHBOARD_URL = (
  process.env.ADMIN_DASHBOARD_URL ||
  "https://workflow-kwvrs-site.up.railway.app/admin/login"
).trim();

// Origin of the workflow admin, derived from ADMIN_DASHBOARD_URL, used to build
// deep-link (/admin/<subpath>) targets. If the configured URL can't be parsed we
// leave it empty so deep links fall back to the bare dashboard URL instead of
// throwing on a bad override.
let ADMIN_DASHBOARD_ORIGIN = "";
try {
  ADMIN_DASHBOARD_ORIGIN = new URL(ADMIN_DASHBOARD_URL).origin;
} catch {
  ADMIN_DASHBOARD_ORIGIN = "";
}

// Map a site /admin[/...] request to its workflow-dashboard redirect target, or
// null when the path is not under /admin (so normal static/SPA handling runs).
// Exported for unit tests. `search` is the raw query string (leading "?").
export function adminRedirectTarget(pathname, search = "") {
  // Bare entry point -> the configured dashboard (login) URL.
  if (pathname === "/admin" || pathname === "/admin/") return ADMIN_DASHBOARD_URL;
  // Deep link -> preserve the /admin/<subpath> + query on the workflow origin
  // (the workflow admin is mounted at /admin, so the path maps 1:1). Requiring the
  // exact "/admin/" prefix keeps /administrator and friends from matching.
  if (pathname.startsWith("/admin/")) {
    return ADMIN_DASHBOARD_ORIGIN
      ? `${ADMIN_DASHBOARD_ORIGIN}${pathname}${search}`
      : ADMIN_DASHBOARD_URL;
  }
  return null;
}

// kwvrs.com/training is the team's entry point to the Clio Training Hub, a
// SEPARATE password-gated Railway service (HTTP Basic auth prompts right after
// the hop). Same posture as /admin: 302 + noindex, NOT in the sitemap or
// prerender list. Target host overridable via TRAINING_HUB_URL.
const TRAINING_HUB_URL = (
  process.env.TRAINING_HUB_URL ||
  "https://kwvrs-clio-training-production.up.railway.app"
).trim();

// Origin of the training hub, used to build deep-link targets. Parsed
// defensively like ADMIN_DASHBOARD_ORIGIN: a bad override leaves deep links
// falling back to the bare hub URL instead of throwing.
let TRAINING_HUB_ORIGIN = "";
try {
  TRAINING_HUB_ORIGIN = new URL(TRAINING_HUB_URL).origin;
} catch {
  TRAINING_HUB_ORIGIN = "";
}

// Map a site /training[/...] request to its hub redirect target, or null when
// the path is not under /training. Deep links keep their subpath + query so a
// shared bookmark into the manuals survives the hop. Exported for unit tests.
export function trainingRedirectTarget(pathname, search = "") {
  if (pathname === "/training" || pathname === "/training/") return TRAINING_HUB_URL;
  // Requiring the exact "/training/" prefix keeps /trainingfoo from matching.
  if (pathname.startsWith("/training/")) {
    return TRAINING_HUB_ORIGIN
      ? `${TRAINING_HUB_ORIGIN}${pathname.slice("/training".length)}${search}`
      : TRAINING_HUB_URL;
  }
  return null;
}

// kwvrs.com/learn sends learners to the education portal sign-in on the
// workflow admin (its /admin/learning page - the portal's own login gate takes
// over from there). Bare path only: deep bookmarks already work through the
// /admin/<subpath> passthrough above. Exported for unit tests.
export function learnRedirectTarget(pathname) {
  if (pathname === "/learn" || pathname === "/learn/") {
    return ADMIN_DASHBOARD_ORIGIN
      ? `${ADMIN_DASHBOARD_ORIGIN}/admin/learning`
      : ADMIN_DASHBOARD_URL;
  }
  return null;
}

// When CANONICAL_HOST is set (e.g. "kwvrs.com"), 301 every other hostname -
// www.kwvrs.com, the *.up.railway.app default domain - to it, preserving the
// path. Unset (local dev, Docker tests) this is a no-op.
const CANONICAL_HOST = process.env.CANONICAL_HOST || "";

// The HTTP request handler, exported so tests can drive it over a real ephemeral
// listener. server.js only self-listens outside vitest (bottom of the file), so
// importing this under test has no port side effect.
export async function requestHandler(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const filePath = join(DIST, url.pathname);

  // Lightweight healthcheck. Placed BEFORE the canonical-host redirect so
  // Railway's internal *.up.railway.app probe receives 200, not a 301. Reports
  // config state (booleans only, no secret values) so a misconfigured cutover -
  // silent lead loss when forwarding/durable-capture are unset - is visible.
  if (url.pathname === "/health" || url.pathname === "/healthz") {
    res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    res.end(
      JSON.stringify({
        status: "ok",
        forwarding: Boolean(WORKFLOW_URL && WORKFLOW_FORWARD_TOKEN),
        durableCapture: rawSubs.enabled,
        turnstile: Boolean(process.env.TURNSTILE_SECRET_KEY),
      }),
    );
    return;
  }

  // The internal engineering guide leaks infrastructure detail (Railway
  // hostnames, the env-var inventory, the admin route map). It must never be
  // reachable on the public site - 404 it unless an internal deploy opts in via
  // SERVE_ENGINEERING_GUIDE=true. (noindex alone is not access control.)
  if (
    url.pathname.toLowerCase().startsWith("/engineering-guide") &&
    process.env.SERVE_ENGINEERING_GUIDE !== "true"
  ) {
    res.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
      ...SECURITY_HEADERS,
    });
    res.end("Not found");
    return;
  }

  const host = (req.headers.host || "").split(":")[0];
  if (CANONICAL_HOST && host && host !== CANONICAL_HOST) {
    res.writeHead(301, {
      Location: `https://${CANONICAL_HOST}${url.pathname}${url.search}`,
      "Cache-Control": "no-cache",
      ...SECURITY_HEADERS,
    });
    res.end();
    return;
  }

  // Short noindex shortcuts that open a PSA PDF directly (internal quick-view).
  const psaShortcut = PSA_SHORTCUTS[url.pathname.toLowerCase().replace(/\/+$/, "")];
  if (psaShortcut) {
    res.writeHead(302, {
      Location: psaShortcut,
      "Cache-Control": "no-cache",
      "X-Robots-Tag": "noindex, nofollow",
      ...SECURITY_HEADERS,
    });
    res.end();
    return;
  }

  // kwvrs.com/admin -> internal workflow admin dashboard (separate Railway
  // service, its own OAuth login). 302 (never cached as permanent) + noindex so
  // the redirect stays out of search. adminRedirectTarget returns null for any
  // non-/admin path, so this runs BEFORE static/SPA resolution and can never
  // collide with a prerendered page (no /admin page exists in dist/).
  const adminTarget = adminRedirectTarget(url.pathname, url.search);
  if (adminTarget) {
    res.writeHead(302, {
      Location: adminTarget,
      "Cache-Control": "no-cache",
      "X-Robots-Tag": "noindex, nofollow",
      ...SECURITY_HEADERS,
    });
    res.end();
    return;
  }

  // kwvrs.com/training -> Clio Training Hub, kwvrs.com/learn -> education
  // portal. Same 302 + noindex posture as /admin; both return null for every
  // other path so static/SPA resolution is untouched.
  const trainingTarget =
    trainingRedirectTarget(url.pathname, url.search) ?? learnRedirectTarget(url.pathname);
  if (trainingTarget) {
    res.writeHead(302, {
      Location: trainingTarget,
      "Cache-Control": "no-cache",
      "X-Robots-Tag": "noindex, nofollow",
      ...SECURITY_HEADERS,
    });
    res.end();
    return;
  }

  // 301 redirect legacy Affidavit Report / Short Form Report URLs to a surviving page.
  const redirectTo = getRedirectTarget(url.pathname);
  if (redirectTo) {
    res.writeHead(301, {
      Location: redirectTo + url.search,
      "Cache-Control": "no-cache",
      ...SECURITY_HEADERS,
    });
    res.end();
    return;
  }

  // WordPress remnants from the pre-2026 site (wp-admin, wp-login, xmlrpc,
  // wp-json, any /wp/ path). These are bot probes + stale Search Console
  // crawls; answer 410 Gone (not 404) so Google drops them permanently and
  // crawlers stop retrying. NOTE: the /content/uploads PI PSA alias above is
  // matched FIRST via PSA_SHORTCUTS, so real legacy document links still work.
  if (isWordPressRemnant(url.pathname)) {
    res.writeHead(410, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
      "X-Robots-Tag": "noindex, nofollow",
      ...SECURITY_HEADERS,
    });
    res.end("Gone");
    return;
  }

  // Canonicalize trailing slashes: /about/ -> /about (301, query preserved).
  // Prerendered pages used to answer 200 on BOTH forms (duplicate content), and
  // the client-only routes (/cv/, /samples/, /nm/) 404'd on the slash form -
  // every old WordPress URL carried a trailing slash. GET/HEAD only (redirecting
  // a POST would drop its body); the legacy redirect map above already caught
  // its own trailing-slash variants via the prefix match, so this is the
  // catch-all for everything else.
  if (
    (req.method === "GET" || req.method === "HEAD") &&
    url.pathname.length > 1 &&
    url.pathname.endsWith("/")
  ) {
    res.writeHead(301, {
      Location: url.pathname.replace(/\/+$/, "") + url.search,
      "Cache-Control": "no-cache",
      ...SECURITY_HEADERS,
    });
    res.end();
    return;
  }

  // Handle CORS preflight for API routes
  if (req.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
    res.writeHead(204, API_CORS_HEADERS);
    res.end();
    return;
  }

  // Read-only raffle metrics feed for the workflow dashboard's /admin/raffle-leads
  // page. The ledger is a file on THIS service's volume, so the workflow cannot
  // read it directly; it fetches this endpoint server-side at render time.
  // Deliberately NOT given API_CORS_HEADERS: that map carries
  // Access-Control-Allow-Origin "*", and a wildcard on an authenticated feed of
  // entrant contact details would let any page that ever learned the token read
  // it. no-store + noindex for the same reason. Reading the whole ledger per
  // request is fine at booth scale (it is the same read the draw tool does) and
  // keeps the endpoint stateless.
  if (url.pathname === "/api/raffle-entries") {
    const headers = { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
    if (req.method !== "GET") {
      res.writeHead(405, { ...headers, Allow: "GET" });
      res.end(JSON.stringify({ error: "method not allowed" }));
      return;
    }
    if (!raffleEntriesAuthorized(req)) {
      res.writeHead(401, headers);
      res.end(JSON.stringify({ error: "unauthorized" }));
      return;
    }
    res.writeHead(200, headers);
    res.end(JSON.stringify(raffleLeadsReport(readRaffleEntries(), url.searchParams.get("event"))));
    return;
  }

  // Form submission APIs - shared handler; each route saves a typed entry
  // to data/submissions.jsonl after checking its required fields.
  const apiRoute = API_ROUTES[url.pathname];
  if (req.method === "POST" && apiRoute) {
    if (rateLimited(req, apiRoute.rateLimitMax !== undefined ? apiRoute.rateLimitMax : RATE_LIMIT_MAX)) {
      res.writeHead(429, API_CORS_HEADERS);
      res.end(JSON.stringify({ error: "Too many requests, please try again shortly" }));
      return;
    }
    try {
      const data = await parseBody(req);
      if (apiRoute.normalize) apiRoute.normalize(data);
      // Anti-spam: verify the Cloudflare Turnstile token on every human-facing
      // lead form (contact, consultation, whitepaper - all `turnstile: true`).
      // Fail-open - only a configured-and-present token that Cloudflare rejects
      // is blocked; the IP rate-limit above is the backstop. Set
      // TURNSTILE_REQUIRE_TOKEN=true to also reject tokenless POSTs (safe once
      // every live form renders the widget - direct-to-API bots have no token).
      if (apiRoute.turnstile) {
        const ts = await verifyTurnstile(data.turnstileToken, {
          secret: process.env.TURNSTILE_SECRET_KEY,
          remoteip: clientIp(req),
          requireToken: process.env.TURNSTILE_REQUIRE_TOKEN === "true",
        });
        if (ts.skipped) {
          console.warn(`turnstile skipped (${ts.skipped}) for ${apiRoute.type}`);
        }
        if (!ts.ok) {
          res.writeHead(400, API_CORS_HEADERS);
          res.end(JSON.stringify({ error: "Verification failed, please try again" }));
          return;
        }
      }
      if (apiRoute.required.some((field) => !data[field])) {
        res.writeHead(400, API_CORS_HEADERS);
        res.end(JSON.stringify({ error: apiRoute.requiredMessage }));
        return;
      }
      const validationError = validateRoute(apiRoute.type, data);
      if (validationError) {
        res.writeHead(400, API_CORS_HEADERS);
        res.end(JSON.stringify({ error: validationError }));
        return;
      }
      // Route-level duplicate guard (only the raffle sets one). A repeat entry
      // gets the SAME success body a first one does, plus duplicate:true, and
      // skips the entire store/persist/side-effect pipeline.
      if (apiRoute.duplicate && apiRoute.duplicate(data)) {
        res.writeHead(200, API_CORS_HEADERS);
        res.end(JSON.stringify({ success: true, duplicate: true }));
        return;
      }
      const submissionId = randomUUID();
      data.__submissionId = submissionId;
      data.__clientIp = clientIp(req);
      data.__userAgent = req.headers["user-agent"] || null;
      // Anti-spam layer 2 (behind Turnstile): a filled honeypot or >=2 gibberish
      // signals. QUARANTINE, never delete - store the submission durably (jsonl
      // breadcrumb + raw_submissions) with a _spam marker and forwarded pre-set
      // true so the replay sweep never forwards it, then return the SAME success
      // body a real lead receives so a bot cannot tell quarantine from acceptance.
      // No workflow forward, no rush alert, no estimator/ack email, and no raffle
      // ledger row or Grow push.
      const spamVerdict = checkSpam(data);
      if (spamVerdict.spam) {
        console.warn(`spam quarantined (${spamVerdict.reasons.join(",")}) for ${apiRoute.type}`);
        data._spam = { reasons: spamVerdict.reasons, at: new Date().toISOString() };
        saveSubmission(apiRoute.type, data); // breadcrumb carries the _spam marker
        await persistQuarantined(submissionId, apiRoute.type, data); // durable, forwarded:true
        res.writeHead(200, API_CORS_HEADERS);
        res.end(JSON.stringify({ success: true }));
        return;
      }
      saveSubmission(apiRoute.type, data); // local breadcrumb (belt-and-suspenders)
      const raffleEntry = recordRaffle(apiRoute.type, submissionId, data); // ledger row BEFORE the 200
      const persisted = await persistRawSubmission(submissionId, apiRoute.type, data, {
        forwarded: apiRoute.forward === false,
      }); // durable, awaited
      res.writeHead(200, API_CORS_HEADERS);
      res.end(JSON.stringify({ success: true }));
      // Pass `persisted` so queueForward can flag a double-failure (no durable row
      // AND forward gave up) where the lead survives only in the ephemeral jsonl.
      if (apiRoute.forward !== false) {
        queueForward(submissionId, apiRoute.type, data, { persisted }); // fire-and-forget AFTER durable write
      }
      queueRushAlerts(data); // fire-and-forget rush team alert + attorney ack (no-op unless priority:"rush")
      queueEstimatorEmail(apiRoute.type, data); // fire-and-forget breakdown email (estimator leads only)
      queueRaffleLead(raffleEntry); // fire-and-forget Clio Grow push (raffle entries only)
      return;
    } catch (err) {
      res.writeHead(err.status || 500, API_CORS_HEADERS);
      res.end(JSON.stringify({ error: err.message || "Server error" }));
    }
    return;
  }

  // Resolve a static file to serve. Order:
  //   1. Exact file at filePath (e.g., /favicon.svg, /assets/foo.js)
  //   2. Prerendered HTML at filePath/index.html (e.g., /about -> dist/about/index.html)
  //   3. SPA fallback to dist/index.html with HTTP 200 (handles client-only routes)
  //   4. NOT FOUND - HTTP 404 with the SPA shell so React's NotFound renders
  // The prerendered-HTML lookup is critical: without it, every directory-style
  // route (/about, /services/short-form-report/new-york, etc.) falls through
  // to SPA fallback and loses its per-page metadata, schema, and content.
  let resolvedPath = null;
  let resolvedExt = null;
  if (existsSync(filePath) && statSync(filePath).isFile()) {
    resolvedPath = filePath;
    resolvedExt = extname(filePath);
  } else {
    // Look up dist/<route>/index.html for prerendered routes.
    const indexCandidate = join(filePath, "index.html");
    if (existsSync(indexCandidate) && statSync(indexCandidate).isFile()) {
      resolvedPath = indexCandidate;
      resolvedExt = ".html";
    }
  }

  if (resolvedPath) {
    const mime = MIME_TYPES[resolvedExt] || "application/octet-stream";
    const content = readFileSync(resolvedPath);

    // Cache control
    let cacheControl;
    if (url.pathname.startsWith("/assets/")) {
      cacheControl = "public, max-age=31536000, immutable";
    } else if (resolvedExt === ".html") {
      // no-cache (revalidate before use) rather than no-store, so prerendered
      // pages remain bfcache-eligible (instant back/forward) while still
      // re-checking freshness on each load.
      cacheControl = "no-cache";
    } else {
      cacheControl = "public, max-age=86400";
    }

    const headers = {
      "Content-Type": mime,
      "Cache-Control": cacheControl,
      ...SECURITY_HEADERS,
    };

    // Internal docs (e.g. /engineering-guide) are served like any static page
    // but must never be indexed - belt-and-suspenders with the noindex meta
    // tags baked into the HTML itself.
    if (
      url.pathname.startsWith("/engineering-guide") ||
      // Internal matter-profitability simulator: link-only from the admin
      // dashboard, never in the sitemap or search results.
      url.pathname.startsWith("/profitabilitycalc") ||
      url.pathname.startsWith("/client-forms") ||
      url.pathname.startsWith("/samples/") ||
      url.pathname.startsWith("/cv/") ||
      // PSA retainer PDFs are downloadable on /forms but carry fee schedules, so
      // keep them out of search results (the PHQ/HIPAA patient forms stay indexable).
      url.pathname.startsWith("/documents/KWVRS-PSA-")
    ) {
      headers["X-Robots-Tag"] = "noindex, nofollow";
    }

    // Gzip compressible text-based responses. Vary is set even on identity
    // responses so shared caches key on Accept-Encoding either way.
    if (COMPRESSIBLE.has(mime)) {
      headers["Vary"] = "Accept-Encoding";
      if (acceptsGzip(req)) {
        const gz = getGzipped(resolvedPath, content);
        headers["Content-Encoding"] = "gzip";
        res.writeHead(200, headers);
        res.end(gz);
        return;
      }
    }

    res.writeHead(200, headers);
    res.end(content);
    return;
  }

  // Dead legacy assets (old /content/ uploads, Dreamweaver /images/ + /p7*/
  // files, WP feeds/sitemaps, builder junk) reach here only when no real file
  // resolved above - answer 410 Gone so crawlers drop them for good instead of
  // retrying a 404 forever. Current files under the same prefixes were already
  // served by the static branch and never get this far.
  if (isLegacyGone(url.pathname)) {
    res.writeHead(410, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
      "X-Robots-Tag": "noindex, nofollow",
      ...SECURITY_HEADERS,
    });
    res.end("Gone");
    return;
  }

  // SPA fallback - serve index.html with HTTP 404 for unknown routes so the
  // React NotFound page renders with a proper status code (rather than the
  // soft-404 a 200 would create). The bare SPA shell on a known prerendered
  // route is no longer hit because of the dist/<route>/index.html lookup
  // above, so reaching this branch means "route not found" - except for the
  // deliberately unprerendered client-only routes, which get 200 + noindex.
  const clientOnly = CLIENT_ONLY_ROUTES(url.pathname);
  const status = clientOnly ? 200 : 404;
  const headers = {
    "Content-Type": "text/html",
    "Cache-Control": "no-cache",
    "Vary": "Accept-Encoding",
    ...SECURITY_HEADERS,
  };
  if (clientOnly) {
    headers["X-Robots-Tag"] = "noindex";
  }

  if (acceptsGzip(req)) {
    headers["Content-Encoding"] = "gzip";
    res.writeHead(status, headers);
    res.end(indexHtmlGz);
    return;
  }

  res.writeHead(status, headers);
  res.end(indexHtml);
}

const server = createServer(requestHandler);

// Under vitest the module is imported to unit-test its exported functions
// (forwardToWorkflow, queueForward, etc.); skip binding the port so the import
// has no side effects. Production (`node server.js`) is unaffected.
if (!process.env.VITEST) {
  server.listen(PORT, () => {
    console.log(`KWVRS server running on port ${PORT}`);
    console.log(
      turnstileStartupState({
        siteKey: process.env.VITE_TURNSTILE_SITE_KEY,
        secret: process.env.TURNSTILE_SECRET_KEY,
      }),
    );
    console.log(
      WORKFLOW_URL && WORKFLOW_FORWARD_TOKEN
        ? "lead forwarding: configured"
        : `lead forwarding DISABLED (${WORKFLOW_URL ? "" : "WORKFLOW_URL unset "}${WORKFLOW_FORWARD_TOKEN ? "" : "WORKFLOW_FORWARD_TOKEN unset"})`,
    );
    if (rawSubs.enabled) {
      // One-shot ~10s after boot to drain anything stranded by a prior outage,
      // then a serialized periodic sweep.
      setTimeout(() => { replayTick(); }, 10_000).unref?.();
      setInterval(() => { replayTick(); }, REPLAY_INTERVAL_MS).unref?.();
      console.log(`replay sweep armed (interval ${REPLAY_INTERVAL_MS}ms, max ${REPLAY_MAX_ATTEMPTS} attempts)`);
    } else {
      console.log("replay sweep disabled: PUBLIC_SUPABASE_* unset");
    }
  });

  // Graceful shutdown: Railway sends SIGTERM on every redeploy. Stop accepting
  // new connections and let in-flight requests finish before exiting.
  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down gracefully`);
    server.close(() => process.exit(0));
    // Failsafe if connections don't drain promptly.
    setTimeout(() => process.exit(0), 10_000).unref?.();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
