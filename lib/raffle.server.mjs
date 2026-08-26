// Server-side I/O for the conference QR raffle: the append-only local ledger,
// the one-entry-per-email-per-event index, and the Clio Grow Lead Inbox push.
// Ships in the Docker image (the Dockerfile copies lib/). Two hard rules:
//   1. The ledger write happens BEFORE the 200 - the drawing must never depend
//      on Clio being reachable, and a booth has no second chance at a scan.
//   2. Nothing here ever throws into a request. A disk or vendor failure logs
//      and degrades; the attendee always sees the thank-you.
// Spec: docs/superpowers/specs/2026-07-28-qr-clio-grow-raffle-design.md
import { appendFileSync, closeSync, mkdirSync, openSync, readFileSync, readSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRaffleEntry, foldRaffleEntries, growLeadBody, raffleEntryKey, raffleUrl } from "./raffle.mjs";

const LIB_DIR = dirname(fileURLToPath(import.meta.url));
const GROW_ENDPOINT = "https://grow.clio.com/inbox_leads";
const GROW_TIMEOUT_MS = 10_000;
// House convention (server.js's workflow forward): a vendor body is untrusted and
// unbounded - an HTML error page is megabytes - so only its first 200 characters
// may reach a log line or a stored ledger field.
const VENDOR_TEXT_MAX = 200;

/**
 * Ledger location. Defaults to the same ephemeral data/ directory the
 * submissions breadcrumb uses; set RAFFLE_ENTRIES_FILE to a Railway volume path
 * to keep entries across deploys (the drawing needs them to survive the event).
 */
export function raffleFilePath(env = process.env) {
  return env.RAFFLE_ENTRIES_FILE || join(LIB_DIR, "..", "data", "raffle-entries.jsonl");
}

/** Current state of every entry in the ledger (last row per entryId wins). */
export function readRaffleEntries(filePath = raffleFilePath()) {
  let text;
  try {
    text = readFileSync(filePath, "utf8");
  } catch {
    return []; // no file yet is the normal pre-first-entry state
  }
  const rows = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      rows.push(JSON.parse(trimmed));
    } catch {
      // A torn last line (container killed mid-append) must not lose the rest.
      console.error("raffle ledger: skipping unparseable line");
    }
  }
  return foldRaffleEntries(rows);
}

/**
 * True when the file's last byte is a newline (an empty or missing file counts
 * as "clean" - there is nothing to continue). Reads exactly one byte.
 */
function endsWithNewline(filePath) {
  const { size } = statSync(filePath); // throws when the file does not exist yet
  if (size === 0) return true;
  const fd = openSync(filePath, "r");
  try {
    const byte = Buffer.alloc(1);
    readSync(fd, byte, 0, 1, size - 1);
    return byte[0] === 0x0a;
  } finally {
    closeSync(fd);
  }
}

/**
 * Appends one row. Returns false (logged) instead of throwing on a write failure.
 *
 * A container killed mid-append leaves a partial line with NO trailing newline.
 * readRaffleEntries already survives that torn line, but only if it stays one
 * line: without the newline prefix below, the next append glues itself onto the
 * fragment and the torn row takes a real entrant down with it. So the fragment
 * is left as the damage it is, and every later entry starts clean.
 */
export function appendRaffleRow(entry, filePath = raffleFilePath()) {
  try {
    mkdirSync(dirname(filePath), { recursive: true });
    let prefix = "";
    try {
      if (!endsWithNewline(filePath)) prefix = "\n";
    } catch {
      // No file yet (or it cannot be probed) - nothing to continue; the append
      // below is the authority on whether this write can succeed at all.
    }
    appendFileSync(filePath, prefix + JSON.stringify(entry) + "\n");
    return true;
  } catch (err) {
    console.error(`raffle ledger write failed (non-fatal): ${err.message}`);
    return false;
  }
}

// In-process duplicate index, keyed by ledger path so tests using distinct tmp
// files never share state. Seeded lazily from the file, so a restart (or a
// mounted volume) re-establishes the guard instead of re-opening the door.
const indexes = new Map();

function raffleIndex(filePath) {
  let index = indexes.get(filePath);
  if (!index) {
    index = new Set();
    for (const entry of readRaffleEntries(filePath)) index.add(raffleEntryKey(entry.event, entry.email));
    indexes.set(filePath, index);
  }
  return index;
}

/** Test-only: drops the cached index so the next call re-seeds from disk. */
export function resetRaffleIndex(filePath = raffleFilePath()) {
  indexes.delete(filePath);
}

/** True when this email already entered THIS event. */
export function hasEntered(event, email, deps = {}) {
  const filePath = deps.filePath || raffleFilePath();
  return raffleIndex(filePath).has(raffleEntryKey(event, email));
}

/**
 * Stores the entry locally FIRST (ledger row + duplicate index) and returns the
 * row. Called synchronously from the request handler before the 200.
 */
export function recordRaffleEntry(entryId, data, deps = {}) {
  const filePath = deps.filePath || raffleFilePath();
  const entry = buildRaffleEntry(data, { entryId, timestamp: deps.timestamp });
  appendRaffleRow(entry, filePath);
  raffleIndex(filePath).add(raffleEntryKey(entry.event, entry.email));
  return entry;
}

/**
 * POSTs the attendee to Clio Grow's Lead Inbox API. Never throws. Returns
 * { delivered, leadId, skipped, error }:
 *  - no token configured -> { skipped: "no-token" }, zero network calls
 *  - 201 -> delivered with the created lead id
 *  - 422 "already exists" -> delivered (Grow's own dedupe; the attendee IS in
 *    the inbox, and treating it as an error would re-push forever)
 *  - anything else / a thrown fetch -> not delivered, with the message
 */
export async function submitGrowLead(entry, deps = {}) {
  const env = deps.env || process.env;
  const fetchImpl = deps.fetchImpl || fetch;
  const token = String(env.CLIO_GROW_INBOX_TOKEN || "").trim();
  if (!token) return { delivered: false, leadId: null, skipped: "no-token", error: null };
  const baseUrl = String(env.SITE_BASE_URL || "https://kwvrs.com").trim();
  try {
    const res = await fetchImpl(GROW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accepts: "application/json" },
      body: JSON.stringify({
        inbox_lead_token: token,
        inbox_lead: growLeadBody(entry, { referringUrl: raffleUrl(baseUrl, entry.event) }),
      }),
      signal: AbortSignal.timeout(GROW_TIMEOUT_MS),
    });
    if (res.status === 201) {
      const json = await res.json().catch(() => ({}));
      return { delivered: true, leadId: json && json.id != null ? String(json.id) : null, skipped: null, error: null };
    }
    const body = await res.text().catch(() => "");
    // The already-exists probe runs on the FULL body; only the message that gets
    // logged and stored is truncated.
    if (res.status === 422 && /already exists/i.test(body)) {
      return { delivered: true, leadId: null, skipped: "grow-duplicate", error: null };
    }
    const text = body.slice(0, VENDOR_TEXT_MAX);
    return { delivered: false, leadId: null, skipped: null, error: `Clio Grow inbox_leads returned ${res.status}: ${text}` };
  } catch (err) {
    return { delivered: false, leadId: null, skipped: null, error: err.message };
  }
}

/**
 * Fire-and-forget Grow push plus the ledger's delivery row. A no-token skip
 * writes NOTHING (growAttemptedAt stays null, which is the "never attempted"
 * resweep queue); an attempt - success or failure - appends a row with the same
 * entryId carrying the outcome.
 */
export async function dispatchGrowLead(entry, deps = {}) {
  const filePath = deps.filePath || raffleFilePath();
  const result = await submitGrowLead(entry, deps);
  if (result.skipped === "no-token") {
    console.warn(`raffle Grow push skipped (no-token) for entry ${entry.entryId}`);
    return result;
  }
  if (!result.delivered) {
    console.error(`raffle Grow push failed for entry ${entry.entryId}: ${result.error}`);
  }
  appendRaffleRow(
    {
      ...entry,
      growDelivered: result.delivered,
      growAttemptedAt: new Date().toISOString(),
      growLeadId: result.leadId,
      growError: result.error,
    },
    filePath,
  );
  return result;
}
