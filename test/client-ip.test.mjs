import { describe, expect, it } from "vitest";
import { clientIp } from "../server.js";

describe("clientIp (rate-limit / Turnstile remoteip)", () => {
  it("uses the RIGHTMOST x-forwarded-for entry, not the spoofable leftmost", () => {
    // A spammer can forge the leftmost values; Railway's proxy appends the real
    // client IP on the right. Using the leftmost let an attacker mint unlimited
    // rate-limit buckets by varying a fake first hop.
    const req = { headers: { "x-forwarded-for": "1.1.1.1, 2.2.2.2, 9.9.9.9" }, socket: {} };
    expect(clientIp(req)).toBe("9.9.9.9");
  });

  it("handles a single forwarded entry", () => {
    expect(clientIp({ headers: { "x-forwarded-for": "8.8.8.8" }, socket: {} })).toBe("8.8.8.8");
  });

  it("trims whitespace and ignores empty segments", () => {
    expect(clientIp({ headers: { "x-forwarded-for": "1.1.1.1 ,  9.9.9.9 , " }, socket: {} })).toBe("9.9.9.9");
  });

  it("falls back to the socket address when there is no forwarded header", () => {
    expect(clientIp({ headers: {}, socket: { remoteAddress: "127.0.0.1" } })).toBe("127.0.0.1");
  });
});
