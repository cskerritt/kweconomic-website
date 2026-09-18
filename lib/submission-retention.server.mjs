// Retention purge for the website's RAW safety-net copies of form submissions.
//
// Scope, and nothing else:
//   1. data/submissions.jsonl - the append-only breadcrumb server.js writes in
//      saveSubmission(). Time field: `timestamp` (ISO string, set by the server).
//      Spam flag: the `_spam` object the quarantine branch adds.
//   2. The Supabase `raw_submissions` table written by
//      lib/raw-submissions.server.mjs. Time column: `received_at`. Spam flag:
//      the same marker inside the jsonb payload (`payload->_spam`).
// It never touches any other file, table, or system.
//
// Rules: spam-flagged records are deleted once OLDER than SPAM_RETENTION_DAYS,
// everything else once OLDER than RAW_RETENTION_DAYS (strictly older: a record
// exactly 90 / 730 days old is kept). A record whose time cannot be parsed, or
// a jsonl line that is not valid JSON, is NEVER deleted - it is kept verbatim
// and counted as "undated".
//
// Mode: SUBMISSION_PURGE_MODE must be the exact string "delete" to delete.
// Unset or anything else = REPORT mode: zero writes, zero DELETE requests, one
// log line saying what a delete run would remove.
//
// Dependency-free (Node built-ins + global fetch), like the rest of lib/.

import {
  closeSync,
  existsSync,
  fsyncSync,
  openSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const SPAM_RETENTION_DAYS = 90;
export const RAW_RETENTION_DAYS = 730;

const DAY_MS = 24 * 60 * 60 * 1000;
const TABLE = "raw_submissions"; // the ONLY table this module may address
const TIME_COLUMN = "received_at";
const SPAM_PATH = "payload->_spam";

/** The breadcrumb file server.js appends to. */
export const SUBMISSIONS_FILE = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "submissions.jsonl");

export const INITIAL_DELAY_MS = 60 * 1000;
export const INTERVAL_MS = 24 * 60 * 60 * 1000;

/** "delete" only for the exact string; everything else is report mode. */
export function resolveMode(env = process.env) {
  return env.SUBMISSION_PURGE_MODE === "delete" ? "delete" : "report";
}

/**
 * Classifies one jsonl line: "blank" | "undated" | "spam" | "raw" | "keep".
 * "spam" / "raw" mean past retention under that rule.
 */
export function classifyLine(text, nowMs) {
  if (text.trim() === "") return "blank";
  let entry;
  try {
    entry = JSON.parse(text);
  } catch {
    return "undated";
  }
  if (entry === null || typeof entry !== "object" || Array.isArray(entry)) return "undated";
  if (typeof entry.timestamp !== "string") return "undated";
  const t = Date.parse(entry.timestamp);
  if (!Number.isFinite(t)) return "undated";
  const age = nowMs - t;
  const isSpam = entry._spam !== undefined && entry._spam !== null;
  if (isSpam) return age > SPAM_RETENTION_DAYS * DAY_MS ? "spam" : "keep";
  return age > RAW_RETENTION_DAYS * DAY_MS ? "raw" : "keep";
}

// Splits a buffer into line buffers, each INCLUDING its trailing "\n" (the
// last one may have none), so kept lines are written back byte-for-byte.
function splitLines(buf) {
  const lines = [];
  let start = 0;
  while (start < buf.length) {
    const nl = buf.indexOf(0x0a, start);
    const end = nl === -1 ? buf.length : nl + 1;
    lines.push(buf.subarray(start, end));
    start = end;
  }
  return lines;
}

/**
 * Purges (or, in report mode, only counts) the jsonl breadcrumb file.
 *
 * DELIBERATELY SYNCHRONOUS. server.js appends with appendFileSync, so there is
 * no write queue to join; a read-filter-write-rename that never yields to the
 * event loop cannot interleave with an append in this single-threaded process,
 * which is a stronger guarantee than a mutex. Do not make this async without
 * moving saveSubmission() and this function behind one shared lock.
 *
 * Delete mode writes the kept lines to a temp file in the same directory,
 * fsyncs it, then renames it over the original. Any throw leaves the original
 * untouched (the temp file is removed best-effort) and propagates.
 */
export function purgeJsonl({ file = SUBMISSIONS_FILE, mode = "report", nowMs = Date.now() } = {}) {
  const counts = { spam: 0, raw: 0, undated: 0 };
  if (!Number.isFinite(nowMs)) throw new Error("retention: invalid clock");
  if (!existsSync(file)) return counts;
  const original = readFileSync(file);
  const kept = [];
  for (const line of splitLines(original)) {
    const verdict = classifyLine(line.toString("utf8"), nowMs);
    if (verdict === "spam") counts.spam += 1;
    else if (verdict === "raw") counts.raw += 1;
    else {
      if (verdict === "undated") counts.undated += 1;
      kept.push(line);
    }
  }
  if (mode !== "delete" || counts.spam + counts.raw === 0) return counts;

  const tmp = join(dirname(file), `.submissions.jsonl.purge-${process.pid}.tmp`);
  let fd = null;
  try {
    fd = openSync(tmp, "w", statSync(file).mode & 0o777);
    const out = Buffer.concat(kept);
    let written = 0;
    while (written < out.length) written += writeSync(fd, out, written, out.length - written);
    fsyncSync(fd);
    closeSync(fd);
    fd = null;
    renameSync(tmp, file);
  } catch (err) {
    if (fd !== null) {
      try {
        closeSync(fd);
      } catch {
        /* already closed */
      }
    }
    try {
      unlinkSync(tmp);
    } catch {
      /* never created, or already renamed */
    }
    throw err;
  }
  return counts;
}

function ruleFilters(nowMs) {
  const spamCutoff = new Date(nowMs - SPAM_RETENTION_DAYS * DAY_MS).toISOString();
  const rawCutoff = new Date(nowMs - RAW_RETENTION_DAYS * DAY_MS).toISOString();
  // The two rules are disjoint (spam / not spam), so report counts and delete
  // counts agree and no row is counted twice.
  return {
    spam: `${SPAM_PATH}=not.is.null&${TIME_COLUMN}=lt.${spamCutoff}`,
    raw: `${SPAM_PATH}=is.null&${TIME_COLUMN}=lt.${rawCutoff}`,
  };
}

// PostgREST answers count=exact in Content-Range: "0-24/57" or "*/57".
function countFrom(res) {
  const range = res.headers?.get?.("content-range") || "";
  const n = Number(range.split("/")[1]);
  if (!Number.isInteger(n) || n < 0) {
    console.warn(`[retention] ${TABLE}: no exact count in response (content-range "${range}"), counted as 0`);
    return 0;
  }
  return n;
}

/**
 * Purges (or counts) the Supabase raw_submissions table. Reads the SAME env
 * names as lib/raw-submissions.server.mjs; when either is unset it returns
 * { skipped: true } without any network call (production today).
 *
 * Report mode: one GET per rule with `Prefer: count=exact` and `limit=0`.
 * Delete mode: one DELETE per rule with `Prefer: return=minimal, count=exact`.
 * Rows with a NULL received_at never match an `lt.` filter, so they are never
 * deleted; they are not counted here (undated is a jsonl-only number).
 */
export async function purgeSupabase({
  mode = "report",
  nowMs = Date.now(),
  env = process.env,
  fetchImpl = globalThis.fetch,
} = {}) {
  const base = (env.PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const key = env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY || "";
  if (!base || !key) return { spam: 0, raw: 0, skipped: true };
  if (!Number.isFinite(nowMs)) throw new Error("retention: invalid clock");

  const filters = ruleFilters(nowMs);
  const counts = { spam: 0, raw: 0, skipped: false };
  for (const rule of ["spam", "raw"]) {
    const filter = filters[rule];
    // Belt and braces: never send a request without the time bound.
    if (!filter.includes(`${TIME_COLUMN}=lt.`)) throw new Error("retention: refusing an unbounded request");
    const del = mode === "delete";
    const url = del
      ? `${base}/rest/v1/${TABLE}?${filter}`
      : `${base}/rest/v1/${TABLE}?select=id&${filter}&limit=0`;
    const res = await fetchImpl(url, {
      method: del ? "DELETE" : "GET",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: del ? "return=minimal, count=exact" : "count=exact",
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`${TABLE} ${del ? "DELETE" : "GET"} (${rule}) failed: ${res.status} ${text}`.trim());
    }
    counts[rule] = countFrom(res);
  }
  return counts;
}

/** The one log line. Same shape in both modes. */
export function formatRetentionLine(mode, { spam, raw, undated }) {
  const del = mode === "delete";
  return (
    `[retention] ${del ? "delete" : "report"}: ${del ? "deleted" : "would delete"} ${spam} spam (>${SPAM_RETENTION_DAYS}d) ` +
    `and ${raw} raw (>${RAW_RETENTION_DAYS}d); undated ${undated}; mode=${del ? "delete" : "report"}`
  );
}

/**
 * One retention pass over both stores. Never throws: a failing store is logged
 * and contributes zero to the line. Returns the totals and the line.
 */
export async function runRetention({
  mode = resolveMode(),
  now = () => Date.now(),
  file = SUBMISSIONS_FILE,
  env = process.env,
  fetchImpl = globalThis.fetch,
  log = console.log,
  logError = console.error,
} = {}) {
  const effectiveMode = mode === "delete" ? "delete" : "report";
  const totals = { spam: 0, raw: 0, undated: 0 };
  let nowMs;
  try {
    nowMs = now();
  } catch (err) {
    logError(`[retention] clock failed: ${err.message}`);
    nowMs = NaN;
  }
  try {
    const c = purgeJsonl({ file, mode: effectiveMode, nowMs });
    totals.spam += c.spam;
    totals.raw += c.raw;
    totals.undated += c.undated;
  } catch (err) {
    logError(`[retention] submissions.jsonl pass failed (file left untouched): ${err.message}`);
  }
  try {
    const c = await purgeSupabase({ mode: effectiveMode, nowMs, env, fetchImpl });
    totals.spam += c.spam;
    totals.raw += c.raw;
  } catch (err) {
    logError(`[retention] ${TABLE} pass failed: ${err.message}`);
  }
  const line = formatRetentionLine(effectiveMode, totals);
  log(line);
  return { mode: effectiveMode, ...totals, line };
}

/**
 * Report-only entry point for scripts/retention-report.mjs. Takes no mode and
 * does not read SUBMISSION_PURGE_MODE, so it cannot delete.
 */
export function reportRetention({ now, file, env, fetchImpl, log, logError } = {}) {
  return runRetention({ mode: "report", now, file, env, fetchImpl, log, logError });
}

/**
 * Runs a pass ~60 s after start and then every 24 h. Timers are unref()'d and
 * every pass is fully fail-soft: nothing here can crash the server, keep the
 * process alive, or sit in the path of a form POST. Returns { stop }.
 */
export function scheduleRetention({
  run = () => runRetention(),
  initialDelayMs = INITIAL_DELAY_MS,
  intervalMs = INTERVAL_MS,
  setTimeoutFn = setTimeout,
  setIntervalFn = setInterval,
  clearTimeoutFn = clearTimeout,
  clearIntervalFn = clearInterval,
  logError = console.error,
} = {}) {
  const safeRun = () => {
    try {
      Promise.resolve(run()).catch((err) => logError(`[retention] run failed: ${err?.message || err}`));
    } catch (err) {
      logError(`[retention] run failed: ${err?.message || err}`);
    }
  };
  const first = setTimeoutFn(safeRun, initialDelayMs);
  first?.unref?.();
  const every = setIntervalFn(safeRun, intervalMs);
  every?.unref?.();
  return {
    stop() {
      clearTimeoutFn(first);
      clearIntervalFn(every);
    },
  };
}
