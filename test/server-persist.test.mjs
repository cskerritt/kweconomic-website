import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";

beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllGlobals());

async function load() {
  return import("../server.js");
}

describe("persistRawSubmission", () => {
  it("a valid submission is persisted with id/type/normalized payload", async () => {
    const insert = vi.fn(async () => ({ id: "sub-1" }));
    const rawSubs = { insertRawSubmission: insert };
    const { persistRawSubmission } = await load();
    const ok = await persistRawSubmission("sub-1", "contact", { email: "a@b.com" }, { rawSubs });
    expect(ok).toBe(true);
    expect(insert).toHaveBeenCalledWith({ id: "sub-1", type: "contact", payload: { email: "a@b.com" } });
  });

  it("a Supabase outage during persist still resolves false (never throws)", async () => {
    const insert = vi.fn(async () => {
      throw new Error("supabase down");
    });
    const rawSubs = { insertRawSubmission: insert };
    const { persistRawSubmission } = await load();
    let threw = false;
    let ok;
    try {
      ok = await persistRawSubmission("sub-2", "contact", { email: "a@b.com" }, { rawSubs });
    } catch {
      threw = true;
    }
    expect(threw).toBe(false);
    expect(ok).toBe(false);
  });
});
