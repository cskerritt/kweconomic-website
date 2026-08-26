import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";

// Loaded dynamically per-test so each can set PUBLIC_SUPABASE_* before import.
async function loadClient(env) {
  vi.resetModules();
  process.env.PUBLIC_SUPABASE_URL = env.url ?? "";
  process.env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY = env.key ?? "";
  return import("../lib/raw-submissions.server.mjs");
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.PUBLIC_SUPABASE_URL;
  delete process.env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
});

describe("raw-submissions client", () => {
  it("insertRawSubmission posts id/type/payload and returns the row", async () => {
    const row = { id: "abc", type: "contact", payload: { email: "a@b.com" } };
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 201,
      text: async () => JSON.stringify([row]),
    }));
    vi.stubGlobal("fetch", fetchMock);
    const mod = await loadClient({ url: "https://x.supabase.co", key: "svc-key" });
    expect(mod.enabled).toBe(true);
    const out = await mod.insertRawSubmission({ id: "abc", type: "contact", payload: { email: "a@b.com" } });
    expect(out).toEqual(row);
    const [calledUrl, opts] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe("https://x.supabase.co/rest/v1/raw_submissions");
    expect(opts.method).toBe("POST");
    expect(opts.headers.apikey).toBe("svc-key");
    expect(opts.headers.Authorization).toBe("Bearer svc-key");
    expect(opts.headers.Prefer).toBe("return=representation");
    expect(JSON.parse(opts.body)).toEqual({ id: "abc", type: "contact", payload: { email: "a@b.com" } });
  });

  it("no-ops when PUBLIC_SUPABASE_* is unset", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const mod = await loadClient({ url: "", key: "" });
    expect(mod.enabled).toBe(false);
    expect(await mod.insertRawSubmission({ id: "1", type: "contact", payload: {} })).toBeNull();
    expect(await mod.markForwarded("1", { caseId: "c1" })).toBeNull();
    expect(await mod.recordForwardFailure("1", { error: "boom", attempts: 2 })).toBeNull();
    expect(await mod.listUnforwarded(50)).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("markForwarded / recordForwardFailure write correct PATCHes", async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, status: 204, text: async () => "" }));
    vi.stubGlobal("fetch", fetchMock);
    const mod = await loadClient({ url: "https://x.supabase.co", key: "svc-key" });

    await mod.markForwarded("abc", { caseId: "c1" });
    let [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe("https://x.supabase.co/rest/v1/raw_submissions?id=eq.abc");
    expect(opts.method).toBe("PATCH");
    const fwd = JSON.parse(opts.body);
    expect(fwd.forwarded).toBe(true);
    expect(fwd.case_id).toBe("c1");
    expect(typeof fwd.forwarded_at).toBe("string");

    await mod.recordForwardFailure("abc", { error: "x".repeat(3000), attempts: 4 });
    [url, opts] = fetchMock.mock.calls[1];
    expect(url).toBe("https://x.supabase.co/rest/v1/raw_submissions?id=eq.abc");
    const fail = JSON.parse(opts.body);
    expect(fail.attempts).toBe(5);
    expect(fail.last_error.length).toBeLessThanOrEqual(1000);
  });

  it("recordForwardFailure writes the passed (stored) attempts incremented by exactly 1", async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, status: 204, text: async () => "" }));
    vi.stubGlobal("fetch", fetchMock);
    const mod = await loadClient({ url: "https://x.supabase.co", key: "svc-key" });

    // Stored attempts 0 -> writes 1 (first failure)
    await mod.recordForwardFailure("r1", { error: "boom", attempts: 0 });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).attempts).toBe(1);

    // Stored attempts 7 -> writes 8 (monotonic increment, NOT the per-call count)
    await mod.recordForwardFailure("r1", { error: "boom", attempts: 7 });
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).attempts).toBe(8);

    // Default (omitted) treats stored as 0 -> writes 1
    await mod.recordForwardFailure("r1", { error: "boom" });
    expect(JSON.parse(fetchMock.mock.calls[2][1].body).attempts).toBe(1);
  });

  it("listUnforwarded selects attempts and queries forwarded=false ordered by received_at", async () => {
    const rows = [{ id: "1" }, { id: "2" }];
    const fetchMock = vi.fn(async () => ({ ok: true, status: 200, text: async () => JSON.stringify(rows) }));
    vi.stubGlobal("fetch", fetchMock);
    const mod = await loadClient({ url: "https://x.supabase.co", key: "svc-key" });
    const out = await mod.listUnforwarded(50);
    expect(out).toEqual(rows);
    const [url] = fetchMock.mock.calls[0];
    // attempts must be in the select list so the replay cap can accumulate.
    expect(url).toContain("select=");
    expect(url).toMatch(/select=[^&]*\battempts\b/);
    expect(url).toContain("forwarded=eq.false");
    expect(url).toContain("order=received_at.asc");
    expect(url).toContain("limit=50");
  });
});
