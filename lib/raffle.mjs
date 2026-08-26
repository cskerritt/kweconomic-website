// Shared, dependency-free logic for the conference QR raffle (/raffle +
// POST /api/raffle). Imported by BOTH the React page (src/pages/Raffle.tsx) and
// the server (server.js, lib/raffle.server.mjs), so it MUST stay in lib/: the
// Dockerfile copies lib/ into the runtime image and never copies src/ (the same
// rule that pins lib/intake-schema.mjs). Pure - no I/O, no env, no fetch.
// Spec: docs/superpowers/specs/2026-07-28-qr-clio-grow-raffle-design.md
import { isEmail, isPhone } from "./intake-schema.mjs";
import {
  BAR_ASSOCIATION_OTHER,
  BAR_ASSOCIATION_OTHER_MAX_LENGTH,
  barAssociationDisplay,
  normalizeBarAssociation,
  sanitizeBarAssociationOther,
} from "./bar-associations.mjs";

// The event slug rides the printed QR URL (/raffle?event=<slug>) into the stored
// entry and into Clio Grow's from_source, so one page serves every conference.
// Capped at 24 characters because the QR generator encodes at error-correction
// level H and stops at version 6 (58 bytes); the fixed prefix
// "https://kwvrs.com/raffle?event=" is 31 of those bytes.
export const RAFFLE_EVENT_MAX_LENGTH = 24;
export const DEFAULT_RAFFLE_EVENT = "default";

// TODO(chris): confirm the prize amount before the first poster is printed.
// One constant, referenced by the page copy and nothing else.
export const RAFFLE_PRIZE = "$100 Amazon gift card";

// TODO(counsel): sweepstakes rules are state-regulated. This blurb ships as the
// on-page official rules and MUST be signed off by counsel before the first
// event (gate recorded in docs/ENGINEERING_GUIDE.md 6.3). Do not remove this
// marker without that sign-off - lib/raffle.test.mjs asserts it is still here.
export const RAFFLE_RULES = [
  "No purchase or engagement is necessary to enter or win.",
  "One entry per person per event. Duplicate entries are not counted.",
  "Open to event attendees age 18 or older. Void where prohibited.",
  "The winner is drawn at the close of the event and notified by email.",
  "Sponsor: Kincaid Wolstein Vocational and Rehabilitation Services, Hackensack, New Jersey.",
];

// Marketing attribution prefix for Clio Grow's from_source ("QR Raffle - <event>").
export const RAFFLE_SOURCE_PREFIX = "QR Raffle";

const str = (v) => String(v ?? "").trim();

/**
 * The association pair exactly as it is stored. The free text survives ONLY
 * under the Other option: that input is the one place an entrant types, and
 * letting it ride alongside a real association would put unvetted text into the
 * metrics dimension under a name that vouches for it. An off-roster value
 * becomes "", which validateRaffleFields then rejects.
 */
function barAssociationPair(data = {}) {
  const barAssociation = normalizeBarAssociation(data.barAssociation);
  return {
    barAssociation,
    barAssociationOther:
      barAssociation === BAR_ASSOCIATION_OTHER ? sanitizeBarAssociationOther(data.barAssociationOther) : "",
  };
}

/** URL-safe, length-capped event slug. Anything unusable becomes the default event. */
export function normalizeEventSlug(raw) {
  const slug = str(raw)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, RAFFLE_EVENT_MAX_LENGTH)
    .replace(/-+$/g, "");
  return slug || DEFAULT_RAFFLE_EVENT;
}

/**
 * The exact URL the QR code encodes and the page canonicalizes to. The default
 * event gets the bare /raffle (shorter code, and the page defaults to it), a
 * named event gets ?event=<slug>.
 */
export function raffleUrl(baseUrl, event) {
  const base = String(baseUrl ?? "").replace(/\/+$/, "");
  const slug = normalizeEventSlug(event);
  return slug === DEFAULT_RAFFLE_EVENT ? `${base}/raffle` : `${base}/raffle?event=${slug}`;
}

/** Duplicate-guard key: one entry per email per event. */
export function raffleEntryKey(event, email) {
  return `${normalizeEventSlug(event)}|${str(email).toLowerCase()}`;
}

/**
 * Field-level errors for the inline UI; only failing fields appear. Firm is
 * always optional and never validated. Phone is optional but must look like a
 * real number WHEN PRESENT, because it becomes the Grow lead's from_phone.
 */
export function validateRaffleFields(fields = {}) {
  const errors = {};
  if (!str(fields.firstName)) errors.firstName = "Enter your first name.";
  if (!str(fields.lastName)) errors.lastName = "Enter your last name.";
  if (!isEmail(fields.email)) errors.email = "Enter a valid email address.";
  // Required, because a lead-source metric with a hole in it is not a metric.
  // The two escape options ("Other association / not listed" and "No association
  // membership") mean this can never actually block an entrant at a booth. The
  // rule lives here so the page and the server run the SAME check.
  const barAssociation = normalizeBarAssociation(fields.barAssociation);
  if (!barAssociation) {
    errors.barAssociation = "Select your bar association, or pick one of the last two options.";
  } else if (
    barAssociation === BAR_ASSOCIATION_OTHER &&
    str(fields.barAssociationOther).length > BAR_ASSOCIATION_OTHER_MAX_LENGTH
  ) {
    errors.barAssociationOther = `Keep this to ${BAR_ASSOCIATION_OTHER_MAX_LENGTH} characters or fewer.`;
  }
  const phone = str(fields.phone);
  if (phone && !isPhone(phone)) errors.phone = "Enter a 10-digit phone number, or leave this blank.";
  return errors;
}

/** Trimmed JSON body POSTed to /api/raffle. */
export function buildRafflePayload(fields = {}, event) {
  return {
    firstName: str(fields.firstName),
    lastName: str(fields.lastName),
    email: str(fields.email),
    firm: str(fields.firm),
    ...barAssociationPair(fields),
    phone: str(fields.phone),
    event: normalizeEventSlug(event),
  };
}

/**
 * One ledger row. growDelivered starts false; once the Grow push resolves a
 * SECOND row with the SAME entryId is appended carrying the outcome. The file is
 * append-only (a booth laptop must never rewrite a line mid-event), so
 * foldRaffleEntries - last row per entryId wins - is what "the entry's current
 * state" means. growAttemptedAt stays null when the push never ran at all (no
 * token configured), which is exactly the queue a later resweep reads.
 */
export function buildRaffleEntry(data = {}, { entryId, timestamp } = {}) {
  return {
    kind: "raffle-entry",
    entryId: String(entryId ?? ""),
    event: normalizeEventSlug(data.event),
    firstName: str(data.firstName),
    lastName: str(data.lastName),
    email: str(data.email),
    firm: str(data.firm),
    ...barAssociationPair(data),
    phone: str(data.phone),
    timestamp: timestamp || new Date().toISOString(),
    growDelivered: false,
    growAttemptedAt: null,
    growLeadId: null,
    growError: null,
  };
}

/**
 * Pure mapping from a ledger row to a Clio Grow `inbox_lead` body. Mirrors
 * workflow/lib/clio-grow.js's growLeadBody, including its placeholder rule:
 * Grow 422s on an empty from_first/from_last. No evaluee data and no clinical
 * narrative exists on this path at all - a raffle entry is business contact
 * info only.
 */
export function growLeadBody(entry = {}, { referringUrl = "" } = {}) {
  const event = normalizeEventSlug(entry.event);
  const firm = str(entry.firm);
  // Clio Grow's Lead Inbox API takes free text only, so the association READS in
  // the lead's message but is NOT filterable inside Grow - /admin/raffle-leads is
  // where that dimension is actually queryable. Omitted entirely when nothing was
  // recorded (a ledger row written before this field existed), so the message
  // never carries an empty clause.
  const association = barAssociationDisplay(entry);
  const message = [
    `Gift card raffle entry from the ${event} event QR code.`,
    firm ? `Firm: ${firm}.` : "",
    association ? `Bar association: ${association}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return {
    from_first: str(entry.firstName) || "Unknown",
    from_last: str(entry.lastName) || "Attendee",
    from_email: str(entry.email),
    from_phone: str(entry.phone),
    from_message: message,
    referring_url: referringUrl,
    from_source: `${RAFFLE_SOURCE_PREFIX} - ${event}`,
  };
}

/** Collapses the append-only ledger to one current row per entryId (last wins). */
export function foldRaffleEntries(rows = []) {
  const byId = new Map();
  for (const row of rows) {
    if (!row || row.kind !== "raffle-entry" || !row.entryId) continue;
    byId.set(row.entryId, row);
  }
  return [...byId.values()];
}

/**
 * The drawing pool for one event: one entry per email (earliest wins), KWVRS
 * staff excluded. Order is stable so a draw is reproducible from the file plus
 * the drawn indexes.
 */
export function eligibleEntries(entries = [], event) {
  const slug = normalizeEventSlug(event);
  const seen = new Set();
  const pool = [];
  const ordered = [...entries].sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
  for (const entry of ordered) {
    if (normalizeEventSlug(entry.event) !== slug) continue;
    const email = str(entry.email).toLowerCase();
    if (!email || email.endsWith("@kwvrs.com")) continue;
    if (seen.has(email)) continue;
    seen.add(email);
    pool.push(entry);
  }
  return pool;
}

/**
 * Uniform draw without replacement. `randomInt(max)` MUST be a uniform generator
 * over [0, max) - scripts/draw-raffle-winner.mjs passes node:crypto's randomInt
 * (rejection-sampled, no modulo bias) and the tests pass a deterministic stub.
 */
export function drawRaffleWinners(pool = [], randomInt) {
  const remaining = [...pool];
  const entered = remaining.length;
  const take = () => {
    if (!remaining.length) return null;
    const [picked] = remaining.splice(randomInt(remaining.length), 1);
    return picked || null;
  };
  const winner = take();
  const runnerUp = take();
  return { winner, runnerUp, entered };
}
