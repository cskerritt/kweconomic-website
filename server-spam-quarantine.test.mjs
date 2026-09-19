import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer } from "node:http";
import { once } from "node:events";
import { mkdirSync, existsSync, writeFileSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Integration coverage for the server.js anti-spam quarantine branch (layer 2,
// behind Turnstile). We drive the REAL exported requestHandler over an ephemeral
// listener (server.js skips self-listen under VITEST). The durable-store and
// lead-mail side effects are the module singletons server.js imports, so we
// mock those modules. With TURNSTILE_SECRET_KEY unset the handler makes no
// network call at all.
//
// What this proves end-to-end over HTTP:
//   - a filled honeypot or >=2 gibberish signals -> 200 {success:true} (a bot
//     cannot tell quarantine from acceptance), the row is stored with a _spam
//     marker and forwarded:true set atomically in the insert, and NO lead
//     email fires
//   - a single gibberish signal and a clean lead pass through untouched: stored
//     WITHOUT _spam (forwarded:true - the email is the delivery) and emailed

delete process.env.TURNSTILE_SECRET_KEY; // turnstile fails open: no siteverify fetch
delete process.env.TURNSTILE_REQUIRE_TOKEN;
delete process.env.CANONICAL_HOST;

vi.mock("./lib/raw-submissions.server.mjs", () => ({
  enabled: true,
  insertRawSubmission: vi.fn(async () => ({ id: "row" })),
}));
vi.mock("./lib/lead-mailer.server.mjs", () => ({
  sendLeadEmail: vi.fn(async () => ({ ok: true, id: "m1" })),
}));

// server.js reads dist/index.html at import time (the SPA shell it gzips once).
// The suite runs without a build, so provision a minimal stub when none exists.
// dist/ is gitignored and a real build is left untouched.
const distIndex = join(dirname(fileURLToPath(import.meta.url)), "dist", "index.html");
if (!existsSync(distIndex)) {
  mkdirSync(dirname(distIndex), { recursive: true });
  writeFileSync(distIndex, "<!doctype html><title>test shell</title>");
}

const { requestHandler, saveSubmission } = await import("./server.js");
const rawSubs = await import("./lib/raw-submissions.server.mjs");
const { sendLeadEmail } = await import("./lib/lead-mailer.server.mjs");

let server;
let baseOrigin;
let ipCounter = 0; // monotonic across the whole file: a unique client IP per
// request so the 10/min rate limiter never buckets two requests together.

// Give the fire-and-forget mail (queued after the 200) a tick to run.
const settle = () => new Promise((r) => setTimeout(r, 40));

beforeEach(async () => {
  vi.clearAllMocks();
  server = createServer(requestHandler);
  server.listen(0);
  await once(server, "listening");
  baseOrigin = `http://127.0.0.1:${server.address().port}`;
});

afterEach(async () => {
  if (server && server.listening) await new Promise((r) => server.close(r));
  server = undefined;
  baseOrigin = undefined;
});

async function post(path, body) {
  ipCounter += 1;
  const res = await fetch(`${baseOrigin}${path}`, {
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
      message: "I would like to discuss an economic damages analysis.",
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
    // can never leave a quarantined row in a replayable forwarded=false state)
    expect(inserted.forwarded).toBe(true);

    expect(sendLeadEmail).not.toHaveBeenCalled();
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
    expect(sendLeadEmail).not.toHaveBeenCalled();
  });

  it("passes through a single-signal contact untouched: stored without _spam and emailed", async () => {
    const { status } = await post("/api/contact", {
      name: "John Smith",
      email: "j.o.h.n.smith@gmail.com", // 1 signal (email-dot-salad); below threshold
      phone: CONTACT_PHONE,
      message: "Requesting a lost earnings analysis for an upcoming matter.",
    });
    await settle();

    expect(status).toBe(200);
    const inserted = rawSubs.insertRawSubmission.mock.calls[0][0];
    expect(inserted.payload._spam).toBeUndefined();
    expect(inserted.forwarded).toBe(true); // the email is the delivery; nothing replays
    expect(sendLeadEmail).toHaveBeenCalledTimes(1);
    expect(sendLeadEmail.mock.calls[0][0]).toBe("contact");
  });

  it("emails a clean consultation lead (normal path unaffected)", async () => {
    const { status } = await post("/api/consultation", {
      name: "Jane Attorney",
      email: "jane@firm.com",
    });
    await settle();

    expect(status).toBe(200);
    const inserted = rawSubs.insertRawSubmission.mock.calls[0][0];
    expect(inserted.type).toBe("consultation");
    expect(inserted.payload._spam).toBeUndefined();
    expect(sendLeadEmail).toHaveBeenCalledTimes(1);
    expect(sendLeadEmail.mock.calls[0][0]).toBe("consultation");
  });

  it("quarantines a filled-honeypot whitepaper lead: no email", async () => {
    const { status } = await post("/api/whitepaper", {
      name: "Jane Attorney",
      email: "jane@firm.com",
      slug: "tbi-guide",
      company_website: "x",
    });
    await settle();

    expect(status).toBe(200);
    const inserted = rawSubs.insertRawSubmission.mock.calls[0][0];
    expect(inserted.payload._spam.reasons).toEqual(["honeypot"]);
    expect(sendLeadEmail).not.toHaveBeenCalled();
  });
});

// The retention purge (lib/submission-retention.server.mjs) keys on the
// breadcrumb's `timestamp` and `_spam` fields, so the server-set values must
// win over anything a request body carries.
describe("saveSubmission breadcrumb", () => {
  it("writes one JSON line whose type and timestamp are server-set", () => {
    const dir = mkdtempSync(join(tmpdir(), "save-submission-"));
    const file = join(dir, "submissions.jsonl");
    try {
      const before = Date.now();
      saveSubmission("contact", { name: "A", type: "forged", timestamp: "1990-01-01T00:00:00.000Z" }, file);
      saveSubmission("whitepaper", { email: "b@example.com", _spam: { reasons: ["honeypot"], at: "x" } }, file);
      const lines = readFileSync(file, "utf8").split("\n");
      expect(lines).toHaveLength(3);
      expect(lines[2]).toBe("");
      const first = JSON.parse(lines[0]);
      expect(first.type).toBe("contact");
      expect(Date.parse(first.timestamp)).toBeGreaterThanOrEqual(before);
      const second = JSON.parse(lines[1]);
      expect(second._spam.reasons).toEqual(["honeypot"]);
      expect(second.type).toBe("whitepaper");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
