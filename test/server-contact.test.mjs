import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createServer } from "node:http";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// End-to-end coverage of the slimmed public server: a real ephemeral listener
// driving the exported requestHandler (server.js skips self-listen under VITEST),
// with every external side effect stubbed - no Resend, no Supabase, no Turnstile.
process.env.VITEST = "1";
delete process.env.TURNSTILE_SECRET_KEY;
delete process.env.TURNSTILE_REQUIRE_TOKEN;
delete process.env.CANONICAL_HOST;

vi.mock("../lib/raw-submissions.server.mjs", () => ({
  enabled: false,
  insertRawSubmission: vi.fn(async () => ({ id: "row" })),
}));
vi.mock("../lib/lead-mailer.server.mjs", () => ({
  sendLeadEmail: vi.fn(async () => ({ ok: true, id: "m1" })),
}));

// server.js reads dist/index.html at import time; provision a stub shell when
// the suite runs without a build (dist/ is gitignored).
const distIndex = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "index.html");
if (!existsSync(distIndex)) {
  mkdirSync(dirname(distIndex), { recursive: true });
  writeFileSync(distIndex, "<!doctype html><title>test shell</title>");
}

const mod = await import("../server.js");
const { sendLeadEmail } = await import("../lib/lead-mailer.server.mjs");

let ip = 0;
const post = (base, path, body) =>
  fetch(`${base}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `198.51.100.${++ip}` },
    body: JSON.stringify(body),
  });
const settle = () => new Promise((r) => setTimeout(r, 30));

describe("POST /api/contact end-to-end (no external services)", () => {
  let server, base;
  beforeAll(async () => {
    server = mod.server ?? createServer(mod.requestHandler);
    await new Promise((r) => server.listen(0, r));
    base = `http://127.0.0.1:${server.address().port}`;
  });
  afterAll(() => server.close());

  it("accepts a valid lead, returns success, and queues the lead email", async () => {
    const res = await post(base, "/api/contact", {
      name: "Ann Attorney", email: "ann@firm.com", phone: "201-555-1212",
      message: "Need a lost earnings analysis for a Bergen County matter.",
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    await settle();
    expect(sendLeadEmail).toHaveBeenCalledTimes(1);
    const [type, data] = sendLeadEmail.mock.calls[0];
    expect(type).toBe("contact");
    expect(data.email).toBe("ann@firm.com");
    expect(typeof data.__submissionId).toBe("string");
  });

  it("rejects a missing phone with the route message", async () => {
    const res = await post(base, "/api/contact", { name: "A", email: "a@b.co", message: "x" });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/phone/);
  });

  it("rejects a malformed phone via validateRoute", async () => {
    const res = await post(base, "/api/contact", { name: "A", email: "a@b.co", phone: "123", message: "x" });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/valid phone/);
  });

  it("accepts a consultation without a phone", async () => {
    const res = await post(base, "/api/consultation", { name: "A", email: "a@b.co" });
    expect(res.status).toBe(200);
  });

  it("quarantines a honeypot hit with the same 200 body and no lead email", async () => {
    sendLeadEmail.mockClear();
    const res = await post(base, "/api/contact", {
      name: "Real Name", email: "lead@firm.com", phone: "201-555-1212",
      message: "Please call about a matter.", company_website: "http://spam.example",
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    await settle();
    expect(sendLeadEmail).not.toHaveBeenCalled();
  });

  it("answers OPTIONS preflight on /api/* with 204", async () => {
    const res = await fetch(`${base}/api/contact`, { method: "OPTIONS" });
    expect(res.status).toBe(204);
  });

  it("reports config on /healthz without secrets", async () => {
    const res = await fetch(`${base}/healthz`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true, turnstile: false, durableCapture: false, mail: false });
  });

  it("has no admin/training/raffle/payment/estimator surfaces", async () => {
    for (const p of ["/admin", "/training", "/learn", "/api/raffle-entries", "/psa", "/payment", "/raffle"]) {
      const res = await fetch(`${base}${p}`, { redirect: "manual" });
      expect(res.status, p).toBe(404);
    }
    for (const p of ["/api/estimator", "/api/payment-intent", "/api/raffle"]) {
      const res = await post(base, p, { name: "A", email: "a@b.co" });
      expect(res.status, p).toBe(404);
    }
  });

  it("does not expose a life-expectancy API", async () => {
    const res = await post(base, "/api/life-expectancy", { age: 40 });
    expect(res.status).toBe(404);
  });

  it("canonicalizes a trailing slash with a 301", async () => {
    const res = await fetch(`${base}/about/`, { redirect: "manual" });
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("/about");
  });
});
