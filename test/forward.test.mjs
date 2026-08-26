import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";

const ORIG = { url: process.env.WORKFLOW_URL, token: process.env.WORKFLOW_FORWARD_TOKEN };

beforeEach(() => {
  process.env.WORKFLOW_URL = "https://wf.example.com";
  process.env.WORKFLOW_FORWARD_TOKEN = "tok";
  vi.resetModules();
});
afterEach(() => {
  vi.unstubAllGlobals();
  process.env.WORKFLOW_URL = ORIG.url ?? "";
  process.env.WORKFLOW_FORWARD_TOKEN = ORIG.token ?? "";
});

async function load() {
  return import("../server.js");
}

describe("forwardToWorkflow", () => {
  it("sends x-submission-id on every attempt and returns {ok,caseId}", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ id: "case-1", status: "new" }),
    }));
    vi.stubGlobal("fetch", fetchMock);
    const { forwardToWorkflow } = await load();
    const out = await forwardToWorkflow("contact", { email: "a@b.com", __submissionId: "sub-1" });
    expect(out).toEqual({ ok: true, caseId: "case-1", error: null, attempts: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].headers["x-submission-id"]).toBe("sub-1");
  });

  it("4xx (non-429) is a permanent give-up without exhausting retries", async () => {
    const fetchMock = vi.fn(async () => ({ ok: false, status: 400, text: async () => "bad" }));
    vi.stubGlobal("fetch", fetchMock);
    const { forwardToWorkflow } = await load();
    const out = await forwardToWorkflow("contact", { email: "a@b.com", __submissionId: "sub-2" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(out.ok).toBe(false);
    expect(out.caseId).toBeNull();
    expect(out.error).toContain("400");
  });
});

describe("queueForward", () => {
  it("marks forwarded on success", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const { queueForward } = await load();
    const forward = vi.fn(async () => ({ ok: true, caseId: "c9", error: null, attempts: 1 }));
    const rawSubs = { markForwarded: vi.fn(async () => null), recordForwardFailure: vi.fn() };
    await queueForward("sub-9", "contact", { email: "a@b.com" }, { forward, rawSubs });
    expect(forward).toHaveBeenCalledWith("contact", { email: "a@b.com", __submissionId: "sub-9" });
    expect(rawSubs.markForwarded).toHaveBeenCalledWith("sub-9", { caseId: "c9" });
    expect(rawSubs.recordForwardFailure).not.toHaveBeenCalled();
  });

  it("records failure on give-up passing stored attempts 0 (initial forward; client writes 1)", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const { queueForward } = await load();
    // result.attempts is the per-call HTTP retry count (4); it must NOT be passed
    // through. The initial forward has no row in hand, so stored attempts is 0.
    const forward = vi.fn(async () => ({ ok: false, caseId: null, error: "500 down", attempts: 4 }));
    const rawSubs = { markForwarded: vi.fn(), recordForwardFailure: vi.fn(async () => null) };
    await queueForward("sub-x", "contact", { email: "a@b.com" }, { forward, rawSubs });
    expect(rawSubs.markForwarded).not.toHaveBeenCalled();
    expect(rawSubs.recordForwardFailure).toHaveBeenCalledWith("sub-x", { error: "500 down", attempts: 0 });
  });

  it("flags atRisk when BOTH the durable persist failed AND the forward gave up (lead only in jsonl)", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const { queueForward } = await load();
    const forward = vi.fn(async () => ({ ok: false, caseId: null, error: "500 down", attempts: 4 }));
    const rawSubs = { markForwarded: vi.fn(), recordForwardFailure: vi.fn(async () => null) };
    const out = await queueForward("sub-r", "contact", { email: "a@b.com" }, { forward, rawSubs, persisted: false });
    expect(out.atRisk).toBe(true);
  });

  it("is NOT atRisk when the durable persist succeeded, even if the forward gave up (replay can recover)", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const { queueForward } = await load();
    const forward = vi.fn(async () => ({ ok: false, caseId: null, error: "500 down", attempts: 4 }));
    const rawSubs = { markForwarded: vi.fn(), recordForwardFailure: vi.fn(async () => null) };
    const out = await queueForward("sub-s", "contact", { email: "a@b.com" }, { forward, rawSubs, persisted: true });
    expect(out.atRisk).toBe(false);
  });

  it("is NOT atRisk when the forward succeeded even if the durable persist failed (lead reached the workflow)", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const { queueForward } = await load();
    const forward = vi.fn(async () => ({ ok: true, caseId: "c1", error: null, attempts: 1 }));
    const rawSubs = { markForwarded: vi.fn(async () => null), recordForwardFailure: vi.fn() };
    const out = await queueForward("sub-t", "contact", { email: "a@b.com" }, { forward, rawSubs, persisted: false });
    expect(out.atRisk).toBe(false);
  });
});
