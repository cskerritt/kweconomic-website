import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer } from "node:http";
import { once } from "node:events";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// The requested-expert keys are the one part of a retainer payload that names a
// REAL COLLEAGUE on the dashboard and in the internal team email. The composite
// /agreements form posts them as ordinary form fields, so a tampered or replayed
// body could otherwise put a fabricated expert (or a fabricated tier) in front of
// the reviewer. The /api/consultation normalize hook - the same place the phone
// alias happens - re-derives all three from the shared roster, so what is STORED
// and FORWARDED is whatever lib/intake-schema.mjs says, never what was posted.
//
// Harness mirrors server-spam-quarantine.test.mjs: the REAL exported
// requestHandler over an ephemeral listener, with the durable store and the
// workflow forward mocked so the stored row and the forwarded body can both be
// read back. No live network and no SQL.

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

// server.js reads dist/index.html at import time; provision a stub when the
// suite runs without a build (a real build is left untouched).
const distIndex = join(dirname(fileURLToPath(import.meta.url)), "dist", "index.html");
if (!existsSync(distIndex)) {
  mkdirSync(dirname(distIndex), { recursive: true });
  writeFileSync(distIndex, "<!doctype html><title>test shell</title>");
}

const { API_ROUTES, requestHandler } = await import("./server.js");
const rawSubs = await import("./lib/raw-submissions.server.mjs");

const route = API_ROUTES["/api/consultation"];

// A composite /agreements submission: label-keyed fields plus the normalized
// keys buildAgreementPayload adds, including the three expert keys.
const compositePayload = (expert) => ({
  _agreement: "Personal Injury Professional Services Agreement",
  "Retaining Attorney Name": "Alex Counsel",
  "Retaining Attorney Phone": "201-343-0700",
  formType: "personal-injury-intake",
  name: "Alex Counsel",
  email: "alex@firm.com",
  retainingAttorneyPhone: "201-343-0700",
  firm: "Counsel & Co",
  individualEvaluated: "Pat Doe",
  caseType: "personal-injury",
  // validateRoute's loose composite checks require a side and a work product.
  retainingSide: "plaintiff",
  workProducts: ["Vocational Evaluation"],
  ...expert,
});

const EXPERT_KEYS = ["retainedExpert", "retainedExpertName", "retainedExpertTier"];

describe("/api/consultation normalize re-derives the requested expert", () => {
  it("DELETES all three keys when the posted slug is off-roster", () => {
    const data = compositePayload({
      retainedExpert: "not-a-person",
      retainedExpertName: "Imaginary Expert, Ph.D.",
      retainedExpertTier: "senior",
    });
    route.normalize(data);
    for (const k of EXPERT_KEYS) expect(data, k).not.toHaveProperty(k);
  });

  it("DELETES all three when a name/tier ride along with no slug at all", () => {
    const data = compositePayload({
      retainedExpertName: "Imaginary Expert, Ph.D.",
      retainedExpertTier: "senior",
    });
    route.normalize(data);
    for (const k of EXPERT_KEYS) expect(data, k).not.toHaveProperty(k);
  });

  it("DELETES all three for a real team member who is NOT retainable", () => {
    // sharon-hirsh joined the roster 2026-07-29; zachary-sperling (support
    // staff, no expertTier) is the off-roster team member now.
    const data = compositePayload({ retainedExpert: "zachary-sperling" });
    route.normalize(data);
    for (const k of EXPERT_KEYS) expect(data, k).not.toHaveProperty(k);
  });

  it("re-derives name and tier from the roster, never from the client", () => {
    const data = compositePayload({
      retainedExpert: "john-may",
      retainedExpertName: "Somebody Else",
      retainedExpertTier: "senior",
    });
    route.normalize(data);
    expect(data.retainedExpert).toBe("john-may");
    expect(data.retainedExpertName).toBe("John May, M.A.");
    expect(data.retainedExpertTier).toBe("fellow");
  });

  it("still aliases the attorney phone (the pre-existing normalize behavior)", () => {
    const data = compositePayload({ retainedExpert: "daniel-wolstein" });
    route.normalize(data);
    expect(data.phone).toBe("201-343-0700");
    expect(data.retainedExpertName).toBe("Daniel Wolstein, Ph.D.");
    expect(data.retainedExpertTier).toBe("senior");
  });
});

describe("what the server STORES and FORWARDS for a composite submission", () => {
  let server;
  let baseOrigin;
  let ipCounter = 0;
  const settle = () => new Promise((r) => setTimeout(r, 40));

  beforeEach(async () => {
    vi.clearAllMocks();
    globalThis.__realFetch = globalThis.fetch.bind(globalThis);
    globalThis.__forwardBodies = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url, init) => {
        globalThis.__forwardBodies.push({ url: String(url), body: JSON.parse(init.body) });
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
    delete globalThis.__forwardBodies;
    if (server && server.listening) await new Promise((r) => server.close(r));
    server = undefined;
    baseOrigin = undefined;
  });

  const post = async (body) => {
    ipCounter += 1;
    const res = await globalThis.__realFetch(`${baseOrigin}/api/consultation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": `203.0.113.${ipCounter}` },
      body: JSON.stringify(body),
    });
    await res.text();
    await settle();
    return {
      stored: rawSubs.insertRawSubmission.mock.calls[0][0].payload,
      forwarded: globalThis.__forwardBodies[0].body.submission,
    };
  };

  it("carries NONE of the three keys when the slug is off-roster", async () => {
    const { stored, forwarded } = await post(
      compositePayload({
        retainedExpert: "not-a-person",
        retainedExpertName: "Imaginary Expert, Ph.D.",
        retainedExpertTier: "senior",
      }),
    );
    for (const k of EXPERT_KEYS) {
      expect(stored, `stored ${k}`).not.toHaveProperty(k);
      expect(forwarded, `forwarded ${k}`).not.toHaveProperty(k);
    }
    // The fabricated display name must not survive anywhere in either payload.
    expect(JSON.stringify(stored)).not.toContain("Imaginary Expert");
    expect(JSON.stringify(forwarded)).not.toContain("Imaginary Expert");
  });

  it("carries the ROSTER's name and tier for a valid slug", async () => {
    const { stored, forwarded } = await post(
      compositePayload({
        retainedExpert: "christina-rivera",
        retainedExpertName: "Somebody Else",
        retainedExpertTier: "senior",
      }),
    );
    for (const payload of [stored, forwarded]) {
      expect(payload.retainedExpert).toBe("christina-rivera");
      expect(payload.retainedExpertName).toBe("Christina Rivera, R.N., B.S.N.");
      expect(payload.retainedExpertTier).toBe("fellow");
    }
  });
});
