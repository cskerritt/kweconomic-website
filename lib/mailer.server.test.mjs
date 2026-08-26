import { describe, expect, it, vi } from "vitest";
import { sendEmail } from "./mailer.server.mjs";

const okFetch = (captured) => vi.fn(async (url, opts) => {
  captured.url = url; captured.opts = opts;
  return { ok: true, status: 200, json: async () => ({ id: "email_123" }), text: async () => "" };
});

describe("sendEmail (Resend REST)", () => {
  it("returns {ok:false} when no API key is configured", async () => {
    const res = await sendEmail({ to: "a@b.co", from: "x@y.co", subject: "s", html: "<p>h</p>" }, { apiKey: "", fetch: vi.fn() });
    expect(res.ok).toBe(false);
  });
  it("POSTs to the Resend endpoint with auth + array recipients and returns the id", async () => {
    const cap = {};
    const res = await sendEmail(
      { to: "a@b.co", from: "x@y.co", replyTo: "r@y.co", subject: "s", html: "<p>h</p>" },
      { apiKey: "re_test", fetch: okFetch(cap) },
    );
    expect(res).toEqual({ ok: true, id: "email_123" });
    expect(cap.url).toBe("https://api.resend.com/emails");
    expect(cap.opts.headers.Authorization).toBe("Bearer re_test");
    const body = JSON.parse(cap.opts.body);
    expect(body.to).toEqual(["a@b.co"]);       // string coerced to array
    expect(body.reply_to).toBe("r@y.co");
  });
  it("returns {ok:false} on a non-2xx response", async () => {
    const res = await sendEmail({ to: "a@b.co", from: "x@y.co", subject: "s", html: "h" },
      { apiKey: "re_test", fetch: vi.fn(async () => ({ ok: false, status: 422, text: async () => "bad" })) });
    expect(res.ok).toBe(false);
    expect(res.error).toContain("422");
  });
  it("returns {ok:false} when fetch throws (never propagates)", async () => {
    const res = await sendEmail({ to: "a@b.co", from: "x@y.co", subject: "s", html: "h" },
      { apiKey: "re_test", fetch: vi.fn(async () => { throw new Error("network down"); }) });
    expect(res.ok).toBe(false);
    expect(res.error).toContain("network down");
  });
});
