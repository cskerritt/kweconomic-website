import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";

beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllGlobals());

async function load() {
  return import("../server.js");
}

describe("replayUnforwarded", () => {
  it("re-forwards each row with its stored __submissionId and marks it forwarded", async () => {
    const rows = [
      { id: "s1", type: "contact", payload: { email: "a@b.com" }, attempts: 0 },
      { id: "s2", type: "consultation", payload: { email: "c@d.com" }, attempts: 1 },
    ];
    const rawSubs = {
      enabled: true,
      listUnforwarded: vi.fn(async () => rows),
      markForwarded: vi.fn(async () => null),
      recordForwardFailure: vi.fn(async () => null),
    };
    const forward = vi.fn(async (type, sub) => ({ ok: true, caseId: `case-${sub.__submissionId}`, error: null, attempts: 1 }));
    const { replayUnforwarded } = await load();
    const out = await replayUnforwarded({ limit: 50 }, { rawSubs, forward });
    expect(out).toEqual({ checked: 2, replayed: 2, deadLettered: 0 });
    expect(forward).toHaveBeenNthCalledWith(1, "contact", { email: "a@b.com", __submissionId: "s1" });
    expect(forward).toHaveBeenNthCalledWith(2, "consultation", { email: "c@d.com", __submissionId: "s2" });
    expect(rawSubs.markForwarded).toHaveBeenCalledWith("s1", { caseId: "case-s1" });
    expect(rawSubs.markForwarded).toHaveBeenCalledWith("s2", { caseId: "case-s2" });
    expect(rawSubs.recordForwardFailure).not.toHaveBeenCalled();
  });

  it("a row at REPLAY_MAX_ATTEMPTS is dead-lettered (not forwarded, counted for visibility)", async () => {
    const rows = [
      { id: "ok", type: "contact", payload: { email: "a@b.com" }, attempts: 2 },
      { id: "poison", type: "contact", payload: { email: "x@y.com" }, attempts: 10, last_error: "400 bad" },
    ];
    const rawSubs = {
      enabled: true,
      listUnforwarded: vi.fn(async () => rows),
      markForwarded: vi.fn(async () => null),
      recordForwardFailure: vi.fn(async () => null),
    };
    const forward = vi.fn(async () => ({ ok: true, caseId: "c1", error: null, attempts: 1 }));
    const { replayUnforwarded } = await load();
    const out = await replayUnforwarded({ limit: 50 }, { rawSubs, forward });
    expect(forward).toHaveBeenCalledTimes(1);
    expect(forward).toHaveBeenCalledWith("contact", { email: "a@b.com", __submissionId: "ok" });
    // The poisoned row is surfaced as an abandoned lead, not silently skipped.
    expect(out).toEqual({ checked: 2, replayed: 1, deadLettered: 1 });
  });

  it("records failure passing the row's STORED attempts (not the per-call retry count)", async () => {
    const rows = [{ id: "s1", type: "contact", payload: { email: "a@b.com" }, attempts: 3 }];
    const rawSubs = {
      enabled: true,
      listUnforwarded: vi.fn(async () => rows),
      markForwarded: vi.fn(async () => null),
      recordForwardFailure: vi.fn(async () => null),
    };
    // forward returns attempts:4 (per-call HTTP retries) but the replay must pass
    // the row's stored attempts (3) so the client writes 4 and the count climbs.
    const forward = vi.fn(async () => ({ ok: false, caseId: null, error: "500 down", attempts: 4 }));
    const { replayUnforwarded } = await load();
    const out = await replayUnforwarded({ limit: 50 }, { rawSubs, forward });
    expect(rawSubs.recordForwardFailure).toHaveBeenCalledWith("s1", { error: "500 down", attempts: 3 });
    expect(rawSubs.markForwarded).not.toHaveBeenCalled();
    expect(out).toEqual({ checked: 1, replayed: 0, deadLettered: 0 });
  });

  it("attempts climbs by exactly 1 each sweep and a row hitting REPLAY_MAX_ATTEMPTS is then skipped", async () => {
    // A single permanently-4xx row, persisted in a fake store that applies the
    // SAME increment semantics as the real client (stored = passed + 1). This
    // proves the cap is reachable through real accumulation, not a hand-set
    // attempts:10 fixture.
    const MAX = Number(process.env.REPLAY_MAX_ATTEMPTS) || 10;
    const store = { id: "poison", type: "contact", payload: { email: "x@y.com" }, attempts: 0, forwarded: false };
    const rawSubs = {
      enabled: true,
      listUnforwarded: vi.fn(async () => (store.forwarded ? [] : [{ ...store }])),
      markForwarded: vi.fn(async () => { store.forwarded = true; return null; }),
      // Mirror lib/raw-submissions.server.mjs increment contract: write stored+1.
      recordForwardFailure: vi.fn(async (id, { attempts = 0 } = {}) => {
        if (id === store.id) store.attempts = attempts + 1;
        return null;
      }),
    };
    // Always a permanent 4xx give-up (per-call attempts:1).
    const forward = vi.fn(async () => ({ ok: false, caseId: null, error: "400 bad", attempts: 1 }));
    const { replayUnforwarded } = await load();

    // Sweep until the cap, asserting strict +1 growth each sweep.
    for (let expected = 1; expected <= MAX; expected++) {
      await replayUnforwarded({ limit: 50 }, { rawSubs, forward });
      expect(store.attempts).toBe(expected);
    }
    expect(store.attempts).toBe(MAX);
    expect(forward).toHaveBeenCalledTimes(MAX);

    // Next sweep: row is now at the cap and must be SKIPPED (no further forward).
    const out = await replayUnforwarded({ limit: 50 }, { rawSubs, forward });
    expect(forward).toHaveBeenCalledTimes(MAX); // unchanged - no new forward
    expect(store.attempts).toBe(MAX); // no further increment
    expect(out).toEqual({ checked: 1, replayed: 0, deadLettered: 1 });
  });

  it("is a no-op when the Supabase client is disabled", async () => {
    const rawSubs = { enabled: false, listUnforwarded: vi.fn() };
    const forward = vi.fn();
    const { replayUnforwarded } = await load();
    const out = await replayUnforwarded({ limit: 50 }, { rawSubs, forward });
    expect(out).toEqual({ checked: 0, replayed: 0, deadLettered: 0 });
    expect(rawSubs.listUnforwarded).not.toHaveBeenCalled();
    expect(forward).not.toHaveBeenCalled();
  });
});
