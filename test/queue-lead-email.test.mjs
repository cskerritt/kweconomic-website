import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

beforeEach(() => vi.resetModules());
afterEach(() => vi.restoreAllMocks());

describe("queueLeadEmail", () => {
  it("resolves the send result and stays silent on success", async () => {
    const { queueLeadEmail } = await import("../server.js");
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const send = vi.fn(async () => ({ ok: true, id: "m1" }));
    const r = await queueLeadEmail("contact", { email: "a@b.co", __submissionId: "s1" }, { send });
    expect(send).toHaveBeenCalledWith("contact", { email: "a@b.co", __submissionId: "s1" });
    expect(r.ok).toBe(true);
    expect(err).not.toHaveBeenCalled();
  });

  it("logs (does not throw) when Resend rejects", async () => {
    const { queueLeadEmail } = await import("../server.js");
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const send = vi.fn(async () => ({ ok: false, error: "resend 422 bad from" }));
    const r = await queueLeadEmail("consultation", { __submissionId: "s2" }, { send });
    expect(r.ok).toBe(false);
    expect(err).toHaveBeenCalledWith(expect.stringContaining("lead email failed for consultation s2: resend 422 bad from"));
  });

  it("logs (never rejects) when the mailer throws", async () => {
    const { queueLeadEmail } = await import("../server.js");
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const send = vi.fn(async () => { throw new Error("boom"); });
    const r = await queueLeadEmail("whitepaper", {}, { send });
    expect(r).toEqual({ ok: false, error: "boom" });
    expect(err).toHaveBeenCalledWith(expect.stringContaining("lead email threw for whitepaper: boom"));
  });
});
