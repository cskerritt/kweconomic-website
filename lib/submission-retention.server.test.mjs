import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { chmodSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  INITIAL_DELAY_MS,
  INTERVAL_MS,
  RAW_RETENTION_DAYS,
  SPAM_RETENTION_DAYS,
  SUBMISSIONS_FILE,
  classifyLine,
  formatRetentionLine,
  purgeJsonl,
  purgeSupabase,
  reportRetention,
  resolveMode,
  runRetention,
  scheduleRetention,
} from "./submission-retention.server.mjs";

// THIS MODULE DELETES DATA. Every test here runs against a temp directory and
// a mocked fetch; nothing reads or writes data/submissions.jsonl or a network.

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.parse("2026-09-18T12:00:00.000Z");
const iso = (ms) => new Date(ms).toISOString();
const daysAgo = (d, extraMs = 0) => iso(NOW - d * DAY - extraMs);

const entry = (timestamp, extra = {}) =>
  JSON.stringify({ type: "contact", timestamp, name: "A", email: "a@example.com", ...extra });
const spamEntry = (timestamp) => entry(timestamp, { _spam: { reasons: ["honeypot"], at: timestamp } });

let dir;
let file;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "retention-test-"));
  file = join(dir, "submissions.jsonl");
});
afterEach(() => {
  try {
    chmodSync(dir, 0o755);
  } catch {
    /* gone */
  }
  rmSync(dir, { recursive: true, force: true });
});

describe("constants and mode", () => {
  it("pins the owner-set retention periods", () => {
    expect(SPAM_RETENTION_DAYS).toBe(90);
    expect(RAW_RETENTION_DAYS).toBe(730);
    expect(INITIAL_DELAY_MS).toBe(60_000);
    expect(INTERVAL_MS).toBe(86_400_000);
  });

  it("match the periods the privacy policy states", () => {
    const policy = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "legal-policies.ts"), "utf8");
    expect(RAW_RETENTION_DAYS).toBe(2 * 365);
    expect(policy).toContain("We delete those copies after two years");
    expect(policy).toContain(`we delete submissions flagged as spam after ${SPAM_RETENTION_DAYS} days`);
  });

  it("targets data/submissions.jsonl at the repo root by default", () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), "..");
    expect(SUBMISSIONS_FILE).toBe(join(root, "data", "submissions.jsonl"));
  });

  it("is report mode unless SUBMISSION_PURGE_MODE is exactly 'delete'", () => {
    expect(resolveMode({})).toBe("report");
    for (const v of ["", "report", "Delete", "DELETE", " delete", "delete ", "true", "1", "yes"]) {
      expect(resolveMode({ SUBMISSION_PURGE_MODE: v })).toBe("report");
    }
    expect(resolveMode({ SUBMISSION_PURGE_MODE: "delete" })).toBe("delete");
  });
});

describe("classifyLine boundaries", () => {
  it("keeps spam exactly 90 days old and deletes it one millisecond later", () => {
    expect(classifyLine(spamEntry(daysAgo(90)), NOW)).toBe("keep");
    expect(classifyLine(spamEntry(daysAgo(90, 1)), NOW)).toBe("spam");
    expect(classifyLine(spamEntry(daysAgo(89)), NOW)).toBe("keep");
  });

  it("keeps a raw copy exactly 730 days old and deletes it one millisecond later", () => {
    expect(classifyLine(entry(daysAgo(730)), NOW)).toBe("keep");
    expect(classifyLine(entry(daysAgo(730, 1)), NOW)).toBe("raw");
  });

  it("does not apply the 90-day rule to a non-spam record", () => {
    expect(classifyLine(entry(daysAgo(91)), NOW)).toBe("keep");
    expect(classifyLine(entry(daysAgo(729)), NOW)).toBe("keep");
    expect(classifyLine(entry(daysAgo(400), { _spam: null }), NOW)).toBe("keep");
  });

  it("counts spam older than 730 days under the spam rule, once", () => {
    expect(classifyLine(spamEntry(daysAgo(800)), NOW)).toBe("spam");
  });

  it("keeps future-dated records", () => {
    expect(classifyLine(entry(iso(NOW + 5 * DAY)), NOW)).toBe("keep");
  });

  it("treats malformed JSON, non-objects, and unparseable or missing times as undated", () => {
    for (const text of [
      "{not json",
      "123",
      "null",
      '"a string"',
      "[1,2]",
      JSON.stringify({ type: "contact", name: "no time" }),
      entry("not a date"),
      entry(""),
      JSON.stringify({ type: "contact", timestamp: 1600000000000 }),
      JSON.stringify({ type: "contact", timestamp: null, _spam: { reasons: [] } }),
    ]) {
      expect(classifyLine(text, NOW)).toBe("undated");
    }
  });
});

describe("purgeJsonl", () => {
  const MALFORMED = '{"type":"contact","timestamp":"2020-01-01T00:00:00.000Z", broken éè';
  const UNDATED = '{"type":"whitepaper",  "email":"x@example.com"  }';
  const BAD_TIME = '{"type":"contact","timestamp":"yesterday-ish","_spam":{"reasons":["gibberish"]}}';

  function fixture() {
    const lines = [
      entry(daysAgo(1)), // keep
      spamEntry(daysAgo(10)), // keep (spam, young)
      spamEntry(daysAgo(91)), // DELETE spam
      entry(daysAgo(91)), // keep (not spam)
      MALFORMED, // keep verbatim, undated
      spamEntry(daysAgo(90)), // keep (boundary)
      entry(daysAgo(731)), // DELETE raw
      UNDATED, // keep verbatim, undated
      "", // blank line kept, not counted
      entry(daysAgo(730)), // keep (boundary)
      spamEntry(daysAgo(900)), // DELETE spam
      BAD_TIME, // keep verbatim, undated
    ];
    const text = lines.join("\n") + "\n";
    writeFileSync(file, text);
    const keptText =
      [lines[0], lines[1], lines[3], lines[4], lines[5], lines[7], lines[8], lines[9], lines[11]].join("\n") + "\n";
    return { text, keptText };
  }

  it("is synchronous, so it cannot interleave with server.js's appendFileSync", () => {
    fixture();
    const result = purgeJsonl({ file, mode: "report", nowMs: NOW });
    expect(typeof result.then).toBe("undefined");
  });

  it("report mode counts and performs zero writes (file and directory read-only)", () => {
    const { text } = fixture();
    const before = statSync(file);
    chmodSync(file, 0o444);
    chmodSync(dir, 0o555); // any temp file, rename or rewrite would throw
    const counts = purgeJsonl({ file, mode: "report", nowMs: NOW });
    chmodSync(dir, 0o755);
    expect(counts).toEqual({ spam: 2, raw: 1, undated: 3 });
    expect(readFileSync(file, "utf8")).toBe(text);
    expect(statSync(file).mtimeMs).toBe(before.mtimeMs);
    expect(readdirSync(dir)).toEqual(["submissions.jsonl"]);
  });

  it("any mode other than the exact string 'delete' behaves as report", () => {
    const { text } = fixture();
    for (const mode of [undefined, "", "DELETE", "purge", true]) {
      purgeJsonl({ file, mode, nowMs: NOW });
      expect(readFileSync(file, "utf8")).toBe(text);
    }
  });

  it("delete mode removes only what the report said and keeps the rest byte-for-byte", () => {
    const { keptText } = fixture();
    const report = purgeJsonl({ file, mode: "report", nowMs: NOW });
    const deleted = purgeJsonl({ file, mode: "delete", nowMs: NOW });
    expect(deleted).toEqual(report);
    expect(readFileSync(file)).toEqual(Buffer.from(keptText, "utf8"));
    expect(readFileSync(file, "utf8")).toContain(MALFORMED);
    expect(readFileSync(file, "utf8")).toContain(UNDATED);
    expect(readFileSync(file, "utf8")).toContain(BAD_TIME);
    expect(readdirSync(dir)).toEqual(["submissions.jsonl"]); // temp file renamed away
    // Idempotent: a second pass finds nothing and does not rewrite.
    const mtime = statSync(file).mtimeMs;
    expect(purgeJsonl({ file, mode: "delete", nowMs: NOW })).toEqual({ spam: 0, raw: 0, undated: 3 });
    expect(statSync(file).mtimeMs).toBe(mtime);
  });

  it("preserves CRLF endings, a missing final newline, and invalid utf-8 bytes", () => {
    const keep = Buffer.concat([
      Buffer.from(entry(daysAgo(2)) + "\r\n"),
      Buffer.from([0x7b, 0xff, 0xfe, 0x0a]), // "{" + invalid utf-8, undated
    ]);
    const tail = Buffer.from(entry(daysAgo(3))); // no trailing newline
    writeFileSync(file, Buffer.concat([keep, Buffer.from(entry(daysAgo(1000)) + "\n"), tail]));
    expect(purgeJsonl({ file, mode: "delete", nowMs: NOW })).toEqual({ spam: 0, raw: 1, undated: 1 });
    expect(readFileSync(file)).toEqual(Buffer.concat([keep, tail]));
  });

  it("keeps the file mode", () => {
    fixture();
    chmodSync(file, 0o640);
    purgeJsonl({ file, mode: "delete", nowMs: NOW });
    expect(statSync(file).mode & 0o777).toBe(0o640);
  });

  it("does not rewrite when nothing is past retention", () => {
    writeFileSync(file, entry(daysAgo(5)) + "\n" + spamEntry(daysAgo(5)) + "\n");
    chmodSync(dir, 0o555);
    expect(purgeJsonl({ file, mode: "delete", nowMs: NOW })).toEqual({ spam: 0, raw: 0, undated: 0 });
  });

  it("a failure while writing leaves the original untouched", () => {
    const { text } = fixture();
    chmodSync(dir, 0o555); // temp file cannot be created
    expect(() => purgeJsonl({ file, mode: "delete", nowMs: NOW })).toThrow();
    chmodSync(dir, 0o755);
    expect(readFileSync(file, "utf8")).toBe(text);
    expect(readdirSync(dir)).toEqual(["submissions.jsonl"]);
  });

  it("a missing file is zero counts, and nothing is created", () => {
    expect(purgeJsonl({ file, mode: "delete", nowMs: NOW })).toEqual({ spam: 0, raw: 0, undated: 0 });
    expect(readdirSync(dir)).toEqual([]);
  });

  it("refuses an invalid clock", () => {
    const { text } = fixture();
    expect(() => purgeJsonl({ file, mode: "delete", nowMs: NaN })).toThrow(/clock/);
    expect(readFileSync(file, "utf8")).toBe(text);
  });
});

describe("purgeSupabase", () => {
  const env = { PUBLIC_SUPABASE_URL: "https://proj.supabase.co/", PUBLIC_SUPABASE_SERVICE_ROLE_KEY: "svc-key" };
  const spamCutoff = iso(NOW - 90 * DAY);
  const rawCutoff = iso(NOW - 730 * DAY);
  const response = (count) => ({
    ok: true,
    status: 200,
    headers: { get: (h) => (h.toLowerCase() === "content-range" ? `*/${count}` : null) },
    text: async () => "",
  });

  it("makes no network call when either env name is unset", async () => {
    const fetchImpl = vi.fn();
    for (const e of [{}, { PUBLIC_SUPABASE_URL: env.PUBLIC_SUPABASE_URL }, { PUBLIC_SUPABASE_SERVICE_ROLE_KEY: "k" }]) {
      expect(await purgeSupabase({ mode: "delete", nowMs: NOW, env: e, fetchImpl })).toEqual({
        spam: 0,
        raw: 0,
        skipped: true,
      });
    }
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("report mode sends two count-only GETs and never a DELETE", async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(response(4)).mockResolvedValueOnce(response(7));
    const counts = await purgeSupabase({ mode: "report", nowMs: NOW, env, fetchImpl });
    expect(counts).toEqual({ spam: 4, raw: 7, skipped: false });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl.mock.calls[0][0]).toBe(
      `https://proj.supabase.co/rest/v1/raw_submissions?select=id&payload->_spam=not.is.null&received_at=lt.${spamCutoff}&limit=0`,
    );
    expect(fetchImpl.mock.calls[1][0]).toBe(
      `https://proj.supabase.co/rest/v1/raw_submissions?select=id&payload->_spam=is.null&received_at=lt.${rawCutoff}&limit=0`,
    );
    for (const [, init] of fetchImpl.mock.calls) {
      expect(init.method).toBe("GET");
      expect(init.body).toBeUndefined();
      expect(init.headers.Prefer).toBe("count=exact");
      expect(init.headers.apikey).toBe("svc-key");
      expect(init.headers.Authorization).toBe("Bearer svc-key");
    }
  });

  it("delete mode sends exactly one bounded DELETE per rule, to raw_submissions only", async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(response(2)).mockResolvedValueOnce(response(1));
    const counts = await purgeSupabase({ mode: "delete", nowMs: NOW, env, fetchImpl });
    expect(counts).toEqual({ spam: 2, raw: 1, skipped: false });
    expect(fetchImpl.mock.calls.map(([u]) => u)).toEqual([
      `https://proj.supabase.co/rest/v1/raw_submissions?payload->_spam=not.is.null&received_at=lt.${spamCutoff}`,
      `https://proj.supabase.co/rest/v1/raw_submissions?payload->_spam=is.null&received_at=lt.${rawCutoff}`,
    ]);
    for (const [url, init] of fetchImpl.mock.calls) {
      expect(init.method).toBe("DELETE");
      expect(init.headers.Prefer).toBe("return=minimal, count=exact");
      expect(new URL(url).pathname).toBe("/rest/v1/raw_submissions");
      expect(url).toContain("received_at=lt.");
    }
  });

  it("anything but the exact 'delete' mode never issues a DELETE", async () => {
    for (const mode of [undefined, "", "DELETE", "report", true]) {
      const fetchImpl = vi.fn().mockResolvedValue(response(0));
      await purgeSupabase({ mode, nowMs: NOW, env, fetchImpl });
      expect(fetchImpl.mock.calls.every(([, init]) => init.method === "GET")).toBe(true);
    }
  });

  it("throws on a failed response and stops before the second rule", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 500, headers: { get: () => null }, text: async () => "boom" });
    await expect(purgeSupabase({ mode: "delete", nowMs: NOW, env, fetchImpl })).rejects.toThrow(/raw_submissions DELETE \(spam\) failed: 500 boom/);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("refuses an invalid clock before any request", async () => {
    const fetchImpl = vi.fn();
    await expect(purgeSupabase({ mode: "delete", nowMs: NaN, env, fetchImpl })).rejects.toThrow(/clock/);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("counts a missing content-range as 0", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200, headers: { get: () => null }, text: async () => "" });
    expect(await purgeSupabase({ mode: "report", nowMs: NOW, env, fetchImpl })).toEqual({ spam: 0, raw: 0, skipped: false });
    warn.mockRestore();
  });
});

describe("runRetention", () => {
  const env = { PUBLIC_SUPABASE_URL: "https://proj.supabase.co", PUBLIC_SUPABASE_SERVICE_ROLE_KEY: "svc-key" };
  const response = (count) => ({ ok: true, status: 200, headers: { get: () => `*/${count}` }, text: async () => "" });

  it("formats the exact log line in both modes", () => {
    expect(formatRetentionLine("report", { spam: 3, raw: 1, undated: 2 })).toBe(
      "[retention] report: would delete 3 spam (>90d) and 1 raw (>730d); undated 2; mode=report",
    );
    expect(formatRetentionLine("delete", { spam: 3, raw: 1, undated: 2 })).toBe(
      "[retention] delete: deleted 3 spam (>90d) and 1 raw (>730d); undated 2; mode=delete",
    );
    expect(formatRetentionLine("DELETE", { spam: 0, raw: 0, undated: 0 })).toContain("mode=report");
  });

  it("report: sums both stores, logs one line, writes nothing, deletes nothing", async () => {
    const text = [spamEntry(daysAgo(100)), entry(daysAgo(800)), "garbage", entry(daysAgo(1))].join("\n") + "\n";
    writeFileSync(file, text);
    const fetchImpl = vi.fn().mockResolvedValueOnce(response(5)).mockResolvedValueOnce(response(6));
    const log = vi.fn();
    const out = await runRetention({ mode: "report", now: () => NOW, file, env, fetchImpl, log, logError: vi.fn() });
    expect(out).toMatchObject({ mode: "report", spam: 6, raw: 7, undated: 1 });
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith("[retention] report: would delete 6 spam (>90d) and 7 raw (>730d); undated 1; mode=report");
    expect(readFileSync(file, "utf8")).toBe(text);
    expect(fetchImpl.mock.calls.every(([, init]) => init.method === "GET")).toBe(true);
  });

  it("delete: removes from both stores and logs the real counts", async () => {
    writeFileSync(file, [spamEntry(daysAgo(100)), entry(daysAgo(800)), "garbage", entry(daysAgo(1))].join("\n") + "\n");
    const fetchImpl = vi.fn().mockResolvedValueOnce(response(5)).mockResolvedValueOnce(response(6));
    const log = vi.fn();
    await runRetention({ mode: "delete", now: () => NOW, file, env, fetchImpl, log, logError: vi.fn() });
    expect(log).toHaveBeenCalledWith("[retention] delete: deleted 6 spam (>90d) and 7 raw (>730d); undated 1; mode=delete");
    expect(readFileSync(file, "utf8")).toBe("garbage\n" + entry(daysAgo(1)) + "\n");
  });

  it("defaults to the environment's mode, which is report when unset", async () => {
    const saved = process.env.SUBMISSION_PURGE_MODE;
    delete process.env.SUBMISSION_PURGE_MODE;
    const text = entry(daysAgo(800)) + "\n";
    writeFileSync(file, text);
    const out = await runRetention({ now: () => NOW, file, env: {}, fetchImpl: vi.fn(), log: vi.fn(), logError: vi.fn() });
    if (saved !== undefined) process.env.SUBMISSION_PURGE_MODE = saved;
    expect(out.mode).toBe("report");
    expect(readFileSync(file, "utf8")).toBe(text);
  });

  it("never throws: a failing store is logged and the other still runs", async () => {
    const text = entry(daysAgo(800)) + "\n";
    writeFileSync(file, text);
    chmodSync(dir, 0o555); // jsonl rewrite fails
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));
    const logError = vi.fn();
    const log = vi.fn();
    const out = await runRetention({ mode: "delete", now: () => NOW, file, env, fetchImpl, log, logError });
    chmodSync(dir, 0o755);
    expect(out).toMatchObject({ spam: 0, raw: 0, undated: 0 });
    expect(logError).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenCalledTimes(1);
    expect(readFileSync(file, "utf8")).toBe(text);
  });

  it("reportRetention cannot delete even when the environment says delete", async () => {
    const saved = process.env.SUBMISSION_PURGE_MODE;
    process.env.SUBMISSION_PURGE_MODE = "delete";
    const text = spamEntry(daysAgo(100)) + "\n";
    writeFileSync(file, text);
    const fetchImpl = vi.fn().mockResolvedValue(response(9));
    const out = await reportRetention({ now: () => NOW, file, env, fetchImpl, log: vi.fn(), logError: vi.fn() });
    if (saved === undefined) delete process.env.SUBMISSION_PURGE_MODE;
    else process.env.SUBMISSION_PURGE_MODE = saved;
    expect(out.mode).toBe("report");
    expect(readFileSync(file, "utf8")).toBe(text);
    expect(fetchImpl.mock.calls.every(([, init]) => init.method === "GET")).toBe(true);
  });
});

describe("scheduleRetention", () => {
  it("runs once after 60 s, then every 24 h, on unref'd timers", () => {
    const timers = [];
    const mk = (kind) => (fn, ms) => {
      const t = { kind, fn, ms, unref: vi.fn() };
      timers.push(t);
      return t;
    };
    const run = vi.fn(async () => {});
    scheduleRetention({ run, setTimeoutFn: mk("timeout"), setIntervalFn: mk("interval") });
    expect(timers.map((t) => [t.kind, t.ms])).toEqual([
      ["timeout", 60_000],
      ["interval", 86_400_000],
    ]);
    for (const t of timers) expect(t.unref).toHaveBeenCalledTimes(1);
    expect(run).not.toHaveBeenCalled();
    timers[0].fn();
    timers[1].fn();
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("swallows a throwing or rejecting run", async () => {
    const timers = [];
    const mk = () => (fn) => {
      timers.push(fn);
      return { unref() {} };
    };
    const logError = vi.fn();
    scheduleRetention({
      run: vi
        .fn()
        .mockImplementationOnce(() => {
          throw new Error("sync boom");
        })
        .mockImplementationOnce(async () => {
          throw new Error("async boom");
        }),
      setTimeoutFn: mk(),
      setIntervalFn: mk(),
      logError,
    });
    expect(() => timers[0]()).not.toThrow();
    expect(() => timers[1]()).not.toThrow();
    await new Promise((r) => setImmediate(r));
    expect(logError).toHaveBeenCalledTimes(2);
  });

  it("stop() clears both timers", () => {
    vi.useFakeTimers();
    const run = vi.fn();
    const { stop } = scheduleRetention({ run });
    stop();
    vi.advanceTimersByTime(3 * 86_400_000);
    vi.useRealTimers();
    expect(run).not.toHaveBeenCalled();
  });
});

describe("scripts/retention-report.mjs", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const script = join(root, "scripts", "retention-report.mjs");

  it("never reads SUBMISSION_PURGE_MODE and only calls the report entry point", () => {
    const src = readFileSync(script, "utf8");
    expect(src).not.toContain("SUBMISSION_PURGE_MODE");
    expect(src).not.toMatch(/runRetention|purgeJsonl|purgeSupabase/);
    expect(src).toContain("reportRetention");
  });

  it("prints the report line and leaves the file alone with SUBMISSION_PURGE_MODE=delete set", () => {
    const old = new Date(Date.now() - 1000 * DAY).toISOString();
    const text = spamEntry(old) + "\n" + entry(old) + "\n" + "garbage\n";
    writeFileSync(file, text);
    const childEnv = { ...process.env, SUBMISSION_PURGE_MODE: "delete" };
    delete childEnv.PUBLIC_SUPABASE_URL;
    delete childEnv.PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
    const out = execFileSync(process.execPath, [script, "--file", file], { env: childEnv, encoding: "utf8" });
    expect(out.trim()).toBe("[retention] report: would delete 1 spam (>90d) and 1 raw (>730d); undated 1; mode=report");
    expect(readFileSync(file, "utf8")).toBe(text);
  });
});
