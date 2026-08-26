import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer } from "node:http";
import { once } from "node:events";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Integration coverage for the server.js anti-spam quarantine branch (layer 2,
// behind Turnstile). We drive the REAL exported requestHandler over an ephemeral
// listener (server.js skips self-listen under VITEST). The durable-store,
// workflow-forward, and mail side effects are the module singletons server.js
// imports, so we mock those modules and stub global fetch. With TURNSTILE_SECRET_KEY
// unset the handler's only network call is the workflow forward, so counting
// fetch("/api/case") tells us exactly whether a lead was forwarded.
//
// What this proves end-to-end over HTTP:
//   - a filled honeypot or >=2 gibberish signals -> 200 {success:true} (a bot
//     cannot tell quarantine from acceptance), the row is stored with a _spam
//     marker and forwarded:true set atomically in the insert, and NO
//     forward / rush / estimator side effect fires
//   - a single gibberish signal and a clean lead pass through untouched: stored
//     WITHOUT _spam and forwarded to the workflow (estimator lead also emailed)

process.env.WORKFLOW_URL = "http://workflow.test";
process.env.WORKFLOW_FORWARD_TOKEN = "test-token";
delete process.env.TURNSTILE_SECRET_KEY; // turnstile fails open: no siteverify fetch
delete process.env.TURNSTILE_REQUIRE_TOKEN;

vi.mock("./lib/raw-submissions.server.mjs", () => ({
  enabled: true,
  insertRawSubmission: vi.fn(async () => ({ id: "row" })),
  markForwarded: vi.fn(async () => null),
  recordForwardFailure: vi.fn(async () => null),
  listUnforwarded: vi.fn(async () => []),
}));
vi.mock("./lib/rush-alert.server.mjs", async (importOriginal) => ({
  ...(await importOriginal()),
  dispatchRushAlerts: vi.fn(async () => ({ ok: true })),
}));
vi.mock("./lib/estimator-email.server.mjs", () => ({
  dispatchEstimatorEmail: vi.fn(async () => ({ ok: true })),
}));

// server.js reads dist/index.html at import time (the SPA shell it gzips once).
// The suite runs without a build, so provision a minimal stub when none exists.
// dist/ is gitignored and a real build is left untouched.
const distIndex = join(dirname(fileURLToPath(import.meta.url)), "dist", "index.html");
if (!existsSync(distIndex)) {
  mkdirSync(dirname(distIndex), { recursive: true });
  writeFileSync(distIndex, "<!doctype html><title>test shell</title>");
}

const { requestHandler } = await import("./server.js");
const rawSubs = await import("./lib/raw-submissions.server.mjs");
const { dispatchRushAlerts } = await import("./lib/rush-alert.server.mjs");
const { dispatchEstimatorEmail } = await import("./lib/estimator-email.server.mjs");

let server;
let baseOrigin;
let ipCounter = 0; // monotonic across the whole file: a unique client IP per
// request so the 10/min rate limiter never buckets two requests together.

// Give the fire-and-forget forward/mail (queued after the 200) a tick to run.
const settle = () => new Promise((r) => setTimeout(r, 40));

beforeEach(async () => {
  vi.clearAllMocks();
  globalThis.__realFetch = globalThis.fetch.bind(globalThis);
  globalThis.__forwardCalls = [];
  // The only outbound fetch under test is the workflow forward; record + ack it.
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => {
      globalThis.__forwardCalls.push(String(url));
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

async function post(path, body) {
  ipCounter += 1;
  const res = await globalThis.__realFetch(`${baseOrigin}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": `198.51.100.${ipCounter}` },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

const CONTACT_PHONE = "555-123-4567";

describe("server anti-spam quarantine branch", () => {
  it("quarantines a filled-honeypot contact: 200, stored with _spam, no side effects", async () => {
    const { status, body } = await post("/api/contact", {
      name: "Real Looking Name",
      email: "lead@firm.com",
      phone: CONTACT_PHONE,
      message: "I would like to discuss an earning capacity evaluation.",
      company_website: "http://spam.example",
    });
    await settle();

    expect(status).toBe(200);
    expect(body).toEqual({ success: true }); // byte-for-byte the real success body

    expect(rawSubs.insertRawSubmission).toHaveBeenCalledTimes(1);
    const inserted = rawSubs.insertRawSubmission.mock.calls[0][0];
    expect(inserted.type).toBe("contact");
    expect(inserted.payload._spam.reasons).toEqual(["honeypot"]);
    expect(typeof inserted.payload._spam.at).toBe("string");
    // forwarded set ATOMICALLY in the insert (single write - a partial failure
    // can never leave a quarantined row in the replayable forwarded=false state)
    expect(inserted.forwarded).toBe(true);
    expect(rawSubs.markForwarded).not.toHaveBeenCalled();

    expect(globalThis.__forwardCalls).toHaveLength(0);
    expect(dispatchRushAlerts).not.toHaveBeenCalled();
    expect(dispatchEstimatorEmail).not.toHaveBeenCalled();
  });

  it("quarantines a >=2-signal gibberish contact (the real 2026-07-21 payload)", async () => {
    const { status, body } = await post("/api/contact", {
      name: "EpDenjfTzfrRkhbCKSE eRStXqxIkBoHGNiktYx",
      email: "ra.dt.e.c.hm.om.o@gmail.com",
      phone: CONTACT_PHONE,
      message: "pPkwRavJMtaDEkeROkKcxBg",
    });
    await settle();

    expect(status).toBe(200);
    expect(body).toEqual({ success: true });

    const inserted = rawSubs.insertRawSubmission.mock.calls[0][0];
    expect(inserted.payload._spam.reasons.length).toBeGreaterThanOrEqual(2);
    expect(inserted.payload._spam.reasons).toContain("name-consonant-run");
    expect(inserted.forwarded).toBe(true);
    expect(globalThis.__forwardCalls).toHaveLength(0);
    expect(dispatchRushAlerts).not.toHaveBeenCalled();
  });

  it("passes through a single-signal contact untouched: stored without _spam and forwarded", async () => {
    const { status } = await post("/api/contact", {
      name: "John Smith",
      email: "j.o.h.n.smith@gmail.com", // 1 signal (email-dot-salad); below threshold
      phone: CONTACT_PHONE,
      message: "Requesting a vocational evaluation for an upcoming matter.",
    });
    await settle();

    expect(status).toBe(200);
    const inserted = rawSubs.insertRawSubmission.mock.calls[0][0];
    expect(inserted.payload._spam).toBeUndefined();
    expect(globalThis.__forwardCalls).toContain("http://workflow.test/api/case");
  });

  it("forwards AND emails a clean estimator lead (normal path unaffected)", async () => {
    const { status } = await post("/api/estimator", {
      name: "Jane Adjuster",
      email: "jane@firm.com",
      firm: "Adjuster & Co LLP",
      annualIncome: 75000,
    });
    await settle();

    expect(status).toBe(200);
    const inserted = rawSubs.insertRawSubmission.mock.calls[0][0];
    expect(inserted.type).toBe("estimator");
    expect(inserted.payload._spam).toBeUndefined();
    expect(globalThis.__forwardCalls).toContain("http://workflow.test/api/case");
    expect(dispatchEstimatorEmail).toHaveBeenCalledTimes(1);
  });

  it("quarantines a filled-honeypot estimator lead: no forward, no breakdown email", async () => {
    const { status } = await post("/api/estimator", {
      name: "Jane Adjuster",
      email: "jane@firm.com",
      firm: "Adjuster & Co LLP",
      annualIncome: 75000,
      company_website: "x",
    });
    await settle();

    expect(status).toBe(200);
    const inserted = rawSubs.insertRawSubmission.mock.calls[0][0];
    expect(inserted.payload._spam.reasons).toEqual(["honeypot"]);
    expect(globalThis.__forwardCalls).toHaveLength(0);
    expect(dispatchEstimatorEmail).not.toHaveBeenCalled();
  });
});
