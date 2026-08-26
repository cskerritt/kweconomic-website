import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer } from "node:http";
import { once } from "node:events";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// GET /api/raffle-entries: the read-only feed the workflow dashboard's
// /admin/raffle-leads page fetches server-side. Same harness as
// server-raffle.test.mjs (the REAL exported requestHandler over an ephemeral
// listener; server.js skips self-listen under VITEST), with the durable store
// mocked and the ledger redirected to a tmp file.
//
// What this proves:
//   - the shared forward token is REQUIRED, compared by length and by content
//   - a valid read returns the event list, the scoped summary, the bar-association
//     breakdown, and the entrant rows
//   - ?event= scopes it; no event reports across every event
//   - the response is never cached, never indexed, and carries NO wildcard CORS
//     header (an authenticated feed of entrant contact details must not be
//     readable by any page that ever learned the token)

const LEDGER_DIR = mkdtempSync(join(tmpdir(), "kwvrs-raffle-feed-"));
const LEDGER = join(LEDGER_DIR, "raffle-entries.jsonl");
process.env.RAFFLE_ENTRIES_FILE = LEDGER;
process.env.WORKFLOW_FORWARD_TOKEN = "shared-forward-token";
delete process.env.TURNSTILE_SECRET_KEY;

vi.mock("./lib/raw-submissions.server.mjs", () => ({
  enabled: false,
  insertRawSubmission: vi.fn(async () => ({ id: "row" })),
  markForwarded: vi.fn(async () => null),
  recordForwardFailure: vi.fn(async () => null),
  listUnforwarded: vi.fn(async () => []),
}));

const distIndex = join(dirname(fileURLToPath(import.meta.url)), "dist", "index.html");
if (!existsSync(distIndex)) {
  mkdirSync(dirname(distIndex), { recursive: true });
  writeFileSync(distIndex, "<!doctype html><title>test shell</title>");
}

const { raffleEntriesAuthorized, requestHandler } = await import("./server.js");

const row = (over = {}) =>
  JSON.stringify({
    kind: "raffle-entry",
    entryId: "e-1",
    event: "njaj-2026",
    firstName: "Dana",
    lastName: "Reyes",
    email: "dana@reyeslaw.com",
    firm: "Reyes & Associates",
    barAssociation: "New Jersey Association for Justice",
    barAssociationOther: "",
    phone: "201-555-0100",
    timestamp: "2026-07-29T12:00:00.000Z",
    growDelivered: true,
    growAttemptedAt: "2026-07-29T12:00:01.000Z",
    growLeadId: "1",
    growError: null,
    ...over,
  });

let server;
let baseOrigin;

beforeAll(async () => {
  writeFileSync(
    LEDGER,
    [
      row(),
      row({ entryId: "e-2", email: "sam@firm.com", firstName: "Sam", lastName: "Cole", barAssociation: "New Jersey Defense Association" }),
      // Pre-2026-07-29 shape: the two keys simply are not there.
      JSON.stringify({ kind: "raffle-entry", entryId: "e-3", event: "spring-seminar", firstName: "Lee", lastName: "Fox", email: "lee@firm.com", firm: "", phone: "", timestamp: "2026-07-29T10:00:00.000Z", growDelivered: false, growAttemptedAt: null, growLeadId: null, growError: null }),
    ].join("\n") + "\n",
  );
  server = createServer(requestHandler);
  server.listen(0);
  await once(server, "listening");
  baseOrigin = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  if (server && server.listening) await new Promise((r) => server.close(r));
  rmSync(LEDGER_DIR, { recursive: true, force: true });
});

beforeEach(() => {
  vi.clearAllMocks();
});

async function get(path, headers = {}) {
  const res = await fetch(`${baseOrigin}${path}`, { headers });
  const text = await res.text();
  return { status: res.status, headers: res.headers, body: text ? JSON.parse(text) : null };
}

const AUTH = { "x-workflow-token": "shared-forward-token" };

describe("raffleEntriesAuthorized", () => {
  it("accepts only the exact shared token", () => {
    expect(raffleEntriesAuthorized({ headers: AUTH })).toBe(true);
    expect(raffleEntriesAuthorized({ headers: {} })).toBe(false);
    expect(raffleEntriesAuthorized({ headers: { "x-workflow-token": "" } })).toBe(false);
    // Same length, different content: the comparison is constant time, not a
    // length check that short-circuits into a truthy result.
    expect(raffleEntriesAuthorized({ headers: { "x-workflow-token": "shared-forward-tokeX" } })).toBe(false);
    expect(raffleEntriesAuthorized({ headers: { "x-workflow-token": "short" } })).toBe(false);
  });
});

describe("GET /api/raffle-entries", () => {
  it("401s without the shared token and leaks nothing", async () => {
    const res = await get("/api/raffle-entries");
    expect(res.status).toBe(401);
    // toEqual is the whole leak assertion: the body is EXACTLY the error
    // object, so no entrant data can ride along. (A not.toContain on this
    // same body would be tautological.)
    expect(res.body).toEqual({ error: "unauthorized" });
  });

  it("401s on a wrong token", async () => {
    expect((await get("/api/raffle-entries", { "x-workflow-token": "nope" })).status).toBe(401);
  });

  it("returns the full report across every event when none is given", async () => {
    const { status, body } = await get("/api/raffle-entries", AUTH);
    expect(status).toBe(200);
    expect(body.event).toBe("");
    expect(body.events).toEqual([
      { event: "njaj-2026", count: 2 },
      { event: "spring-seminar", count: 1 },
    ]);
    expect(body.summary).toMatchObject({ entries: 3, attorneys: 3, growDelivered: 2, growQueued: 1 });
    expect(body.rows).toHaveLength(3);
  });

  it("scopes to one event and folds an old row as (not recorded)", async () => {
    const njaj = await get("/api/raffle-entries?event=NJAJ%202026", AUTH);
    expect(njaj.body.event).toBe("njaj-2026");
    expect(njaj.body.summary.entries).toBe(2);
    expect(njaj.body.breakdown.rollups).toMatchObject({ plaintiff: 1, defense: 1, unrecorded: 0 });

    const spring = await get("/api/raffle-entries?event=spring-seminar", AUTH);
    expect(spring.body.rows[0].association).toBe("(not recorded)");
    expect(spring.body.breakdown.rollups.unrecorded).toBe(1);
  });

  it("is never cached, never indexed, and never CORS-readable", async () => {
    const { headers } = await get("/api/raffle-entries", AUTH);
    expect(headers.get("cache-control")).toBe("no-store");
    expect(headers.get("x-robots-tag")).toBe("noindex");
    expect(headers.get("access-control-allow-origin")).toBeNull();
  });

  it("405s a POST to the read-only path rather than falling through to the SPA shell", async () => {
    const res = await fetch(`${baseOrigin}/api/raffle-entries`, { method: "POST", headers: AUTH, body: "{}" });
    expect(res.status).toBe(405);
  });
});
