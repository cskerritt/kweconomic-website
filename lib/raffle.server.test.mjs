import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  appendRaffleRow,
  dispatchGrowLead,
  hasEntered,
  raffleFilePath,
  readRaffleEntries,
  recordRaffleEntry,
  resetRaffleIndex,
  submitGrowLead,
} from "./raffle.server.mjs";

// Every test writes into its own tmp dir: the duplicate index is cached per file
// path, so distinct paths cannot leak state between tests, and nothing here ever
// touches the repo's real data/ directory or the network.
const dirs = [];
function tmpDir() {
  const dir = mkdtempSync(join(tmpdir(), "kwvrs-raffle-"));
  dirs.push(dir);
  return dir;
}
function tmpFile() {
  return join(tmpDir(), "raffle-entries.jsonl");
}

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

const ENTRY_DATA = {
  firstName: "Dana",
  lastName: "Reyes",
  email: "Dana@ReyesLaw.com",
  firm: "Reyes & Associates",
  phone: "201-555-0100",
  event: "NJAJ 2026",
};

describe("raffleFilePath", () => {
  it("defaults to data/raffle-entries.jsonl and honours RAFFLE_ENTRIES_FILE", () => {
    expect(raffleFilePath({})).toMatch(/data\/raffle-entries\.jsonl$/);
    expect(raffleFilePath({ RAFFLE_ENTRIES_FILE: "/mnt/vol/r.jsonl" })).toBe("/mnt/vol/r.jsonl");
  });
});

describe("readRaffleEntries", () => {
  it("returns an empty list when the file does not exist yet", () => {
    expect(readRaffleEntries(tmpFile())).toEqual([]);
  });

  it("folds the append-only ledger so the delivery row wins, skipping malformed lines", () => {
    const file = tmpFile();
    writeFileSync(
      file,
      [
        JSON.stringify({ kind: "raffle-entry", entryId: "e-1", email: "a@b.com", growDelivered: false }),
        "{ not json",
        "",
        JSON.stringify({ kind: "raffle-entry", entryId: "e-1", email: "a@b.com", growDelivered: true, growLeadId: "77" }),
      ].join("\n") + "\n",
    );
    const entries = readRaffleEntries(file);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ entryId: "e-1", growDelivered: true, growLeadId: "77" });
  });
});

describe("appendRaffleRow", () => {
  it("appends one JSON line per call and creates the parent directory", () => {
    const file = join(tmpDir(), "nested", "r.jsonl");
    expect(appendRaffleRow({ kind: "raffle-entry", entryId: "e-1" }, file)).toBe(true);
    expect(appendRaffleRow({ kind: "raffle-entry", entryId: "e-2" }, file)).toBe(true);
    expect(readFileSync(file, "utf8").trim().split("\n")).toHaveLength(2);
  });

  it("swallows a write failure so an entry can never 500 the request", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    // A directory path is not a writable file - the append throws internally.
    expect(appendRaffleRow({ kind: "raffle-entry", entryId: "e-1" }, tmpDir())).toBe(false);
    expect(spy).toHaveBeenCalled();
  });
});

// A container killed mid-append leaves a partial line with no trailing newline.
// Without a guard the NEXT append glues itself onto that fragment, so the torn
// row takes a real entrant down with it - the one row nobody may lose.
describe("appendRaffleRow (torn-line guard)", () => {
  const torn = (file) => {
    writeFileSync(
      file,
      JSON.stringify({ kind: "raffle-entry", entryId: "e-0", event: "njaj-2026", email: "early@firm.com" }) +
        '\n{"kind":"raffle-entry","entryId":"e-1","ema',
    );
  };

  it("starts a new line when the file does not end in a newline, so the next entrant survives", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const file = tmpFile();
    torn(file);
    resetRaffleIndex(file);
    const entry = recordRaffleEntry("e-2", ENTRY_DATA, { filePath: file, timestamp: "2026-07-28T12:00:00.000Z" });

    const lines = readFileSync(file, "utf8").split("\n");
    expect(lines[lines.length - 2]).toBe(JSON.stringify(entry)); // its OWN line, not glued to the fragment
    expect(readRaffleEntries(file).map((e) => e.entryId)).toContain("e-2");
    expect(spy).toHaveBeenCalled(); // only the torn fragment is skipped

    // The guard must also survive a restart: the index re-seeds from the file.
    resetRaffleIndex(file);
    expect(hasEntered("njaj-2026", "dana@reyeslaw.com", { filePath: file })).toBe(true);
  });

  it("adds no blank line when the file already ends in a newline", () => {
    const file = tmpFile();
    appendRaffleRow({ kind: "raffle-entry", entryId: "e-1" }, file);
    appendRaffleRow({ kind: "raffle-entry", entryId: "e-2" }, file);
    expect(readFileSync(file, "utf8")).not.toContain("\n\n");
    expect(readFileSync(file, "utf8").trim().split("\n")).toHaveLength(2);
  });
});

describe("recordRaffleEntry + hasEntered (one entry per email per event)", () => {
  it("writes the row, then reports the same email+event as already entered", () => {
    const file = tmpFile();
    expect(hasEntered("NJAJ 2026", "dana@reyeslaw.com", { filePath: file })).toBe(false);
    const entry = recordRaffleEntry("e-1", ENTRY_DATA, { filePath: file, timestamp: "2026-07-28T12:00:00.000Z" });
    expect(entry).toMatchObject({ entryId: "e-1", event: "njaj-2026", email: "Dana@ReyesLaw.com", growDelivered: false });
    // Case-insensitive on the email, normalized on the event slug.
    expect(hasEntered("njaj-2026", "DANA@reyeslaw.com", { filePath: file })).toBe(true);
  });

  it("scopes the guard to the event: the same attendee may enter a different event", () => {
    const file = tmpFile();
    recordRaffleEntry("e-1", ENTRY_DATA, { filePath: file });
    expect(hasEntered("spring-seminar", "dana@reyeslaw.com", { filePath: file })).toBe(false);
  });

  it("seeds the index from an existing file so a restart does not re-open the door", () => {
    const file = tmpFile();
    writeFileSync(
      file,
      JSON.stringify({ kind: "raffle-entry", entryId: "e-0", event: "njaj-2026", email: "dana@reyeslaw.com" }) + "\n",
    );
    resetRaffleIndex(file); // simulate a fresh process
    expect(hasEntered("njaj-2026", "dana@reyeslaw.com", { filePath: file })).toBe(true);
  });
});

describe("submitGrowLead", () => {
  const entry = { kind: "raffle-entry", entryId: "e-1", event: "njaj-2026", firstName: "Dana", lastName: "Reyes", email: "dana@reyeslaw.com", firm: "Reyes", phone: "" };

  it("no-ops without touching the network when CLIO_GROW_INBOX_TOKEN is unset", async () => {
    const fetchImpl = vi.fn();
    const out = await submitGrowLead(entry, { env: {}, fetchImpl });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(out).toEqual({ delivered: false, leadId: null, skipped: "no-token", error: null });
  });

  it("POSTs the documented Lead Inbox body and returns the created lead id on 201", async () => {
    let captured;
    const fetchImpl = vi.fn(async (url, init) => {
      captured = { url, init };
      return { status: 201, json: async () => ({ id: 4242 }), text: async () => "" };
    });
    const out = await submitGrowLead(entry, {
      env: { CLIO_GROW_INBOX_TOKEN: "tok", SITE_BASE_URL: "https://kwvrs.com" },
      fetchImpl,
    });
    expect(captured.url).toBe("https://grow.clio.com/inbox_leads");
    expect(captured.init.method).toBe("POST");
    const body = JSON.parse(captured.init.body);
    expect(body.inbox_lead_token).toBe("tok");
    expect(body.inbox_lead).toMatchObject({
      from_first: "Dana",
      from_last: "Reyes",
      from_email: "dana@reyeslaw.com",
      from_source: "QR Raffle - njaj-2026",
      referring_url: "https://kwvrs.com/raffle?event=njaj-2026",
    });
    expect(out).toEqual({ delivered: true, leadId: "4242", skipped: null, error: null });
  });

  it("treats Grow's own already-exists 422 as delivered (the attendee IS in the inbox)", async () => {
    const fetchImpl = vi.fn(async () => ({ status: 422, json: async () => ({}), text: async () => "email already exists" }));
    const out = await submitGrowLead(entry, { env: { CLIO_GROW_INBOX_TOKEN: "tok" }, fetchImpl });
    expect(out.delivered).toBe(true);
    expect(out.leadId).toBeNull();
  });

  it("reports a hard failure without throwing", async () => {
    const fetchImpl = vi.fn(async () => ({ status: 500, json: async () => ({}), text: async () => "boom" }));
    const out = await submitGrowLead(entry, { env: { CLIO_GROW_INBOX_TOKEN: "tok" }, fetchImpl });
    expect(out.delivered).toBe(false);
    expect(out.error).toContain("500");
  });

  it("reports a network error without throwing", async () => {
    const fetchImpl = vi.fn(async () => { throw new Error("ECONNRESET"); });
    const out = await submitGrowLead(entry, { env: { CLIO_GROW_INBOX_TOKEN: "tok" }, fetchImpl });
    expect(out).toMatchObject({ delivered: false, error: "ECONNRESET" });
  });

  // House convention (server.js's workflow forward): a vendor body is untrusted
  // and unbounded - an HTML error page is megabytes - so only its first 200
  // characters may reach a log line or a stored field.
  it("keeps at most 200 characters of a huge vendor body in the returned error", async () => {
    const fetchImpl = vi.fn(async () => ({ status: 500, json: async () => ({}), text: async () => "x".repeat(5000) }));
    const out = await submitGrowLead(entry, { env: { CLIO_GROW_INBOX_TOKEN: "tok" }, fetchImpl });
    expect(out.error).toBe(`Clio Grow inbox_leads returned 500: ${"x".repeat(200)}`);
    expect(out.error).not.toContain("x".repeat(201));
  });

  it("matches the already-exists 422 on the FULL body, not the truncated copy", async () => {
    const fetchImpl = vi.fn(async () => ({ status: 422, json: async () => ({}), text: async () => `${"z".repeat(400)} email already exists` }));
    const out = await submitGrowLead(entry, { env: { CLIO_GROW_INBOX_TOKEN: "tok" }, fetchImpl });
    expect(out.delivered).toBe(true);
  });
});

describe("dispatchGrowLead (ledger update after the push)", () => {
  const entry = { kind: "raffle-entry", entryId: "e-1", event: "njaj-2026", firstName: "Dana", lastName: "Reyes", email: "dana@reyeslaw.com", firm: "", phone: "", timestamp: "2026-07-28T12:00:00.000Z", growDelivered: false, growAttemptedAt: null, growLeadId: null, growError: null };

  it("appends a delivered row after a successful push", async () => {
    const file = tmpFile();
    appendRaffleRow(entry, file);
    await dispatchGrowLead(entry, {
      filePath: file,
      env: { CLIO_GROW_INBOX_TOKEN: "tok" },
      fetchImpl: async () => ({ status: 201, json: async () => ({ id: 9 }), text: async () => "" }),
    });
    const [current] = readRaffleEntries(file);
    expect(current).toMatchObject({ entryId: "e-1", growDelivered: true, growLeadId: "9", growError: null });
    expect(typeof current.growAttemptedAt).toBe("string");
  });

  it("appends a failed row (growDelivered false, attempt stamped) so a resweep can find it", async () => {
    const file = tmpFile();
    appendRaffleRow(entry, file);
    await dispatchGrowLead(entry, {
      filePath: file,
      env: { CLIO_GROW_INBOX_TOKEN: "tok" },
      fetchImpl: async () => ({ status: 503, json: async () => ({}), text: async () => "down" }),
    });
    const [current] = readRaffleEntries(file);
    expect(current.growDelivered).toBe(false);
    expect(current.growError).toContain("503");
    expect(current.growAttemptedAt).not.toBeNull();
  });

  it("bounds the vendor text in BOTH the ledger's growError and the console line", async () => {
    const file = tmpFile();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    appendRaffleRow(entry, file);
    await dispatchGrowLead(entry, {
      filePath: file,
      env: { CLIO_GROW_INBOX_TOKEN: "tok" },
      fetchImpl: async () => ({ status: 503, json: async () => ({}), text: async () => "y".repeat(5000) }),
    });
    const [current] = readRaffleEntries(file);
    expect(current.growError).toBe(`Clio Grow inbox_leads returned 503: ${"y".repeat(200)}`);
    expect(String(spy.mock.calls[0][0])).not.toContain("y".repeat(201));
  });

  it("writes NO second row when the token is unset (the entry stays queued, unattempted)", async () => {
    const file = tmpFile();
    appendRaffleRow(entry, file);
    const out = await dispatchGrowLead(entry, { filePath: file, env: {}, fetchImpl: async () => { throw new Error("must not fetch"); } });
    expect(out.skipped).toBe("no-token");
    expect(readFileSync(file, "utf8").trim().split("\n")).toHaveLength(1);
    expect(readRaffleEntries(file)[0].growAttemptedAt).toBeNull();
  });
});
