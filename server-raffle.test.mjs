import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer } from "node:http";
import { once } from "node:events";
import { mkdirSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Integration + route-table coverage for POST /api/raffle. Same harness as
// server-spam-quarantine.test.mjs: the REAL exported requestHandler over an
// ephemeral listener (server.js skips self-listen under VITEST), with the
// durable-store module mocked and global fetch stubbed. The raffle ledger is
// redirected to a tmp file via RAFFLE_ENTRIES_FILE, which lib/raffle.server.mjs
// reads per call - so nothing here touches the repo's data/ directory.
//
// What this proves:
//   - a valid entry: 200 {success:true}, ledger row written BEFORE the response,
//     durable row inserted ALREADY forwarded, and NO workflow forward (a badge
//     scan must never mint a case)
//   - a repeat entry for the same email+event: 200 {success:true,duplicate:true},
//     no second ledger row, no second durable row, no Grow push
//   - the same email at a DIFFERENT event is a fresh entry
//   - a missing/invalid email is a 400 and never reaches the ledger
//   - a gibberish entry cannot buy its way past the heuristics by ALSO posting a
//     benign `name`
//   - RAFFLE_RATE_LIMIT_MAX widens the raffle route ONLY

const LEDGER_DIR = mkdtempSync(join(tmpdir(), "kwvrs-raffle-route-"));
const LEDGER = join(LEDGER_DIR, "raffle-entries.jsonl");
process.env.RAFFLE_ENTRIES_FILE = LEDGER;
process.env.WORKFLOW_URL = "http://workflow.test";
process.env.WORKFLOW_FORWARD_TOKEN = "test-token";
process.env.CLIO_GROW_INBOX_TOKEN = "grow-token";
// Per-route override under test; the global RATE_LIMIT_MAX stays at its 10 default.
process.env.RAFFLE_RATE_LIMIT_MAX = "25";
delete process.env.RATE_LIMIT_MAX;
delete process.env.TURNSTILE_SECRET_KEY; // turnstile fails open: no siteverify fetch
delete process.env.TURNSTILE_REQUIRE_TOKEN;

vi.mock("./lib/raw-submissions.server.mjs", () => ({
  enabled: true,
  insertRawSubmission: vi.fn(async () => ({ id: "row" })),
  markForwarded: vi.fn(async () => null),
  recordForwardFailure: vi.fn(async () => null),
  listUnforwarded: vi.fn(async () => []),
}));

// Ordering probe for "the ledger row is written BEFORE the 200": the REAL
// recordRaffleEntry runs (so the duplicate index and the file stay honest), with
// a timeline marker around it. Reading the file after the fact could not tell a
// pre-response write from a post-response one.
const timeline = vi.hoisted(() => ({ events: [] }));
vi.mock("./lib/raffle.server.mjs", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    recordRaffleEntry: (...args) => {
      timeline.events.push("ledger");
      return actual.recordRaffleEntry(...args);
    },
  };
});

const distIndex = join(dirname(fileURLToPath(import.meta.url)), "dist", "index.html");
if (!existsSync(distIndex)) {
  mkdirSync(dirname(distIndex), { recursive: true });
  writeFileSync(distIndex, "<!doctype html><title>test shell</title>");
}

const { API_ROUTES, NON_FORWARDING_TYPES, requestHandler } = await import("./server.js");
const rawSubs = await import("./lib/raw-submissions.server.mjs");
const { readRaffleEntries, resetRaffleIndex } = await import("./lib/raffle.server.mjs");

let server;
let baseOrigin;
let ipCounter = 0;
let growCalls = [];

const settle = () => new Promise((r) => setTimeout(r, 40));

beforeEach(async () => {
  vi.clearAllMocks();
  growCalls = [];
  timeline.events.length = 0;
  rmSync(LEDGER, { force: true });
  resetRaffleIndex(LEDGER);
  globalThis.__realFetch = globalThis.fetch.bind(globalThis);
  globalThis.__forwardCalls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, init) => {
      const href = String(url);
      if (href.includes("grow.clio.com")) {
        growCalls.push(JSON.parse(init.body));
        return { status: 201, json: async () => ({ id: 4242 }), text: async () => "" };
      }
      globalThis.__forwardCalls.push(href);
      return { ok: true, status: 200, text: async () => JSON.stringify({ id: "case-1" }) };
    }),
  );
  server = createServer(requestHandler);
  server.listen(0);
  await once(server, "listening");
  baseOrigin = `http://127.0.0.1:${server.address().port}`;
});

afterEach(async () => {
  vi.unstubAllGlobals();
  delete globalThis.__realFetch;
  delete globalThis.__forwardCalls;
  if (server && server.listening) await new Promise((r) => server.close(r));
  server = undefined;
  baseOrigin = undefined;
});

async function postAs(ip, path, body) {
  const res = await globalThis.__realFetch(`${baseOrigin}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

async function postRaffle(body) {
  ipCounter += 1;
  return postAs(`198.51.100.${ipCounter}`, "/api/raffle", body);
}

const ENTRY = {
  firstName: "Dana",
  lastName: "Reyes",
  email: "dana@reyeslaw.com",
  firm: "Reyes & Associates",
  // Required since 2026-07-29 (the lead-source metric). Every post in this file
  // rides this fixture, so a valid roster value keeps each test exercising the
  // rule it is actually about.
  barAssociation: "New Jersey Association for Justice",
  phone: "201-555-0100",
  event: "NJAJ 2026",
};

describe("API_ROUTES wiring for /api/raffle", () => {
  const route = API_ROUTES["/api/raffle"];

  it("registers the raffle type, required fields, and Turnstile", () => {
    expect(route).toBeTruthy();
    expect(route.type).toBe("raffle");
    expect(route.required).toEqual(["firstName", "lastName", "email"]);
    expect(route.turnstile).toBe(true);
  });

  it("is flagged forward:false so a badge scan never becomes a workflow case", () => {
    expect(route.forward).toBe(false);
    expect(NON_FORWARDING_TYPES.has("raffle")).toBe(true);
  });

  it("normalizes the event slug, trims the fields, and fills `name` for the spam heuristics", () => {
    const data = { firstName: " Dana ", lastName: " Reyes ", email: " dana@reyeslaw.com ", firm: " Reyes ", phone: " 201-555-0100 ", event: " NJAJ 2026 " };
    route.normalize(data);
    expect(data).toMatchObject({
      firstName: "Dana",
      lastName: "Reyes",
      email: "dana@reyeslaw.com",
      firm: "Reyes",
      phone: "201-555-0100",
      event: "njaj-2026",
      name: "Dana Reyes",
    });
  });

  it("defaults a missing event to the default slug", () => {
    const data = { firstName: "A", lastName: "B", email: "a@b.com" };
    route.normalize(data);
    expect(data.event).toBe("default");
  });

  // The raffle form never posts `name` - only the first/last pair - so anything
  // arriving under that key came from a direct API caller trying to feed the
  // gibberish heuristics a clean string while the real name stays junk.
  it("OVERWRITES any posted `name`, so the heuristics always read the real first/last pair", () => {
    const data = { firstName: "Xkjhgtrq", lastName: "zQwRtY", email: "a@b.com", name: "John Smith" };
    route.normalize(data);
    expect(data.name).toBe("Xkjhgtrq zQwRtY");
  });
});

describe("POST /api/raffle", () => {
  it("stores the entry, answers 200, pushes to Grow, and does NOT forward to the workflow", async () => {
    // Ordering, not aftermath: the ledger marker must already be on the timeline
    // when the response promise resolves.
    const pending = postRaffle(ENTRY).then((res) => {
      timeline.events.push("response");
      return res;
    });
    const { status, body } = await pending;
    expect(timeline.events).toEqual(["ledger", "response"]);
    expect(status).toBe(200);
    expect(body).toEqual({ success: true });

    const entries = readRaffleEntries(LEDGER);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ event: "njaj-2026", email: "dana@reyeslaw.com", firm: "Reyes & Associates" });

    // Durable row inserted ALREADY forwarded, so the replay sweep cannot mint a case.
    expect(rawSubs.insertRawSubmission).toHaveBeenCalledTimes(1);
    const inserted = rawSubs.insertRawSubmission.mock.calls[0][0];
    expect(inserted.type).toBe("raffle");
    expect(inserted.forwarded).toBe(true);

    await settle();
    expect(globalThis.__forwardCalls).toHaveLength(0);
    expect(growCalls).toHaveLength(1);
    expect(growCalls[0].inbox_lead.from_source).toBe("QR Raffle - njaj-2026");
    // The Grow outcome lands as a second ledger row for the SAME entry.
    const folded = readRaffleEntries(LEDGER);
    expect(folded).toHaveLength(1);
    expect(folded[0]).toMatchObject({ growDelivered: true, growLeadId: "4242" });
  });

  it("answers a repeat entry with duplicate:true and repeats no side effect", async () => {
    await postRaffle(ENTRY);
    await settle();
    vi.clearAllMocks();
    growCalls = [];

    const { status, body } = await postRaffle({ ...ENTRY, email: "DANA@ReyesLaw.com" });
    await settle();
    expect(status).toBe(200);
    expect(body).toEqual({ success: true, duplicate: true });
    expect(readRaffleEntries(LEDGER)).toHaveLength(1);
    expect(rawSubs.insertRawSubmission).not.toHaveBeenCalled();
    expect(growCalls).toHaveLength(0);
  });

  it("lets the same attendee enter a different event", async () => {
    await postRaffle(ENTRY);
    const { status, body } = await postRaffle({ ...ENTRY, event: "spring-seminar" });
    await settle();
    expect(status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(readRaffleEntries(LEDGER)).toHaveLength(2);
  });

  it("400s a missing name field and an invalid email, storing nothing", async () => {
    const missing = await postRaffle({ firstName: "Dana", email: "dana@reyeslaw.com" });
    expect(missing.status).toBe(400);
    expect(missing.body.error).toBe("first name, last name, and email are required");

    const bad = await postRaffle({ ...ENTRY, email: "not-an-email" });
    expect(bad.status).toBe(400);

    await settle();
    expect(readRaffleEntries(LEDGER)).toEqual([]);
    expect(growCalls).toHaveLength(0);
  });

  it("400s a present-but-invalid phone (it becomes the Grow lead's from_phone)", async () => {
    const { status, body } = await postRaffle({ ...ENTRY, phone: "555" });
    expect(status).toBe(400);
    expect(body.error).toMatch(/phone/i);
  });

  it("quarantines a filled honeypot: same 200 body, no ledger row, no Grow push", async () => {
    const { status, body } = await postRaffle({ ...ENTRY, company_website: "http://spam.example" });
    await settle();
    expect(status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(readRaffleEntries(LEDGER)).toEqual([]);
    expect(growCalls).toHaveLength(0);
  });

  // The bypass: gibberish first/last plus a hand-posted benign `name`. The
  // heuristics key on `name`, so leaving a caller-supplied one in place would
  // walk the junk straight into the LIVE Clio Grow inbox.
  it("quarantines gibberish names even when the body also posts a clean `name`", async () => {
    const { status, body } = await postRaffle({
      ...ENTRY,
      firstName: "Xkjhgtrq",
      lastName: "zQwRtY",
      email: "xkjhgtrq@mailinator.com",
      name: "John Smith",
    });
    await settle();
    expect(status).toBe(200); // a bot must not learn it was caught
    expect(body).toEqual({ success: true });
    expect(readRaffleEntries(LEDGER)).toEqual([]);
    expect(growCalls).toHaveLength(0);
  });

  it("still lets a clean entry through untouched", async () => {
    const { status, body } = await postRaffle({ ...ENTRY, email: "clean@reyeslaw.com" });
    await settle();
    expect(status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(readRaffleEntries(LEDGER)).toHaveLength(1);
    expect(growCalls).toHaveLength(1);
  });
});

describe("rate limit is tunable for a booth WITHOUT widening every other form", () => {
  const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "server.js"), "utf8");

  it("reads RATE_LIMIT_MAX from the environment with the 10/min default intact", () => {
    expect(src).toContain("const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 10;");
  });

  it("carries the per-route cap on the raffle route only, defaulting to the global", () => {
    expect(API_ROUTES["/api/raffle"].rateLimitMax).toBe(25);
    expect(API_ROUTES["/api/contact"].rateLimitMax).toBeUndefined();
  });

  it("lets the raffle route past the global cap while /api/contact still stops at it", async () => {
    // One IP per burst: a conference booth is exactly this - every attendee
    // behind a single NAT address.
    const boothIp = "203.0.113.10";
    const raffleStatuses = [];
    for (let n = 1; n <= 12; n += 1) {
      const { status } = await postAs(boothIp, "/api/raffle", { ...ENTRY, email: `attendee${n}@firm.com` });
      raffleStatuses.push(status);
    }
    expect(raffleStatuses).toEqual(Array(12).fill(200));

    const deskIp = "203.0.113.11";
    const contactStatuses = [];
    for (let n = 1; n <= 12; n += 1) {
      const { status } = await postAs(deskIp, "/api/contact", {
        name: "Dana Reyes",
        email: `dana${n}@reyeslaw.com`,
        phone: "201-555-0100",
        message: "Question about a vocational evaluation.",
      });
      contactStatuses.push(status);
    }
    expect(contactStatuses).toEqual([...Array(10).fill(200), 429, 429]);
    await settle();
  });
});
