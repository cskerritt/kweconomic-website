import { describe, expect, it } from "vitest";
import { turnstileStartupState, verifyTurnstile } from "./turnstile.server.mjs";

const fetchReturning = (success) => async () => ({ json: async () => ({ success }) });

describe("verifyTurnstile (fail-open Cloudflare Turnstile)", () => {
  it("passes a token Cloudflare reports valid", async () => {
    const res = await verifyTurnstile("good-token", { secret: "s3cret", fetchImpl: fetchReturning(true) });
    expect(res.ok).toBe(true);
  });

  it("rejects a token Cloudflare reports invalid", async () => {
    const res = await verifyTurnstile("bad-token", { secret: "s3cret", fetchImpl: fetchReturning(false) });
    expect(res.ok).toBe(false);
  });

  it("fails open (accepts) when no secret is configured", async () => {
    const res = await verifyTurnstile("any-token", { secret: "" });
    expect(res).toMatchObject({ ok: true, skipped: "no-secret" });
  });

  it("fails open (accepts) when the request carries no token", async () => {
    const res = await verifyTurnstile("", { secret: "s3cret" });
    expect(res).toMatchObject({ ok: true, skipped: "no-token" });
  });

  it("fails open (accepts) when Cloudflare is unreachable", async () => {
    const throwingFetch = async () => {
      throw new Error("network down");
    };
    const res = await verifyTurnstile("good-token", { secret: "s3cret", fetchImpl: throwingFetch });
    expect(res).toMatchObject({ ok: true, skipped: "error" });
  });

  it("sends the secret and token to Cloudflare's siteverify endpoint", async () => {
    let captured = null;
    const spyFetch = async (url, opts) => {
      captured = { url, body: opts.body };
      return { json: async () => ({ success: true }) };
    };
    await verifyTurnstile("tok-123", { secret: "sk-abc", fetchImpl: spyFetch });
    expect(captured.url).toContain("challenges.cloudflare.com/turnstile/v0/siteverify");
    const params = new URLSearchParams(captured.body);
    expect(params.get("secret")).toBe("sk-abc");
    expect(params.get("response")).toBe("tok-123");
  });
});

describe("turnstileStartupState (redacted startup observability)", () => {
  it("reports site_key=baked and secret=set when both are present", () => {
    const line = turnstileStartupState({ siteKey: "0x4AAA-public-site-key", secret: "sk-supersecret" });
    expect(line).toContain("turnstile:");
    expect(line).toContain("site_key=baked");
    expect(line).toContain("secret=set");
  });

  it("reports secret=UNSET (fail-open) when the secret is empty", () => {
    const line = turnstileStartupState({ siteKey: "0x4AAA-public-site-key", secret: "" });
    expect(line).toContain("secret=UNSET (fail-open)");
  });

  it("reports site_key=MISSING when the site key is empty", () => {
    const line = turnstileStartupState({ siteKey: "", secret: "sk-x" });
    expect(line).toContain("site_key=MISSING");
  });

  it("never echoes raw key material", () => {
    const line = turnstileStartupState({ siteKey: "0x4AAAsiteKEY12345", secret: "sk-supersecret" });
    expect(line).not.toContain("sk-supersecret");
    expect(line).not.toContain("supersec");
    expect(line).not.toContain("0x4AAAsiteKEY12345");
    expect(line).not.toContain("siteKEY");
  });

  it("treats whitespace-only values as unset", () => {
    const line = turnstileStartupState({ siteKey: "   ", secret: "   " });
    expect(line).toContain("site_key=MISSING");
    expect(line).toContain("secret=UNSET (fail-open)");
  });
});

describe("verifyTurnstile fail-closed contract (#23 - the only block path)", () => {
  it("rejects ONLY a configured-and-present token Cloudflare reports invalid", async () => {
    const res = await verifyTurnstile("present-token", {
      secret: "configured-secret",
      fetchImpl: async () => ({ json: async () => ({ success: false }) }),
    });
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("verification-failed");
  });

  it("accepts on no-secret, no-token, and network error (never dead-ends a lead)", async () => {
    const noSecret = await verifyTurnstile("t", { secret: "" });
    const noToken = await verifyTurnstile("", { secret: "s" });
    const netErr = await verifyTurnstile("t", {
      secret: "s",
      fetchImpl: async () => {
        throw new Error("down");
      },
    });
    expect(noSecret.ok).toBe(true);
    expect(noToken.ok).toBe(true);
    expect(netErr.ok).toBe(true);
  });
});

describe("verifyTurnstile requireToken strict mode (TURNSTILE_REQUIRE_TOKEN)", () => {
  it("rejects a tokenless POST when requireToken is set and a secret is configured", async () => {
    const res = await verifyTurnstile("", { secret: "s", requireToken: true });
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("missing-token");
  });

  it("still fails open on no-secret and on network error even with requireToken", async () => {
    const noSecret = await verifyTurnstile("", { secret: "", requireToken: true });
    const netErr = await verifyTurnstile("t", {
      secret: "s",
      requireToken: true,
      fetchImpl: async () => {
        throw new Error("down");
      },
    });
    expect(noSecret.ok).toBe(true);
    expect(netErr.ok).toBe(true);
  });
});
