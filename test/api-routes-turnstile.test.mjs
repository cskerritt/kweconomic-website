import { describe, expect, it, beforeEach, vi } from "vitest";

beforeEach(() => vi.resetModules());

describe("API_ROUTES Turnstile gating", () => {
  it("every public lead-capture route is Turnstile-gated, and there are exactly four", async () => {
    const { API_ROUTES } = await import("../server.js");
    // Every lead form writes a durable lead + emails the team, so each must
    // verify Turnstile server-side (a bot can POST any of them directly).
    const expected = ["/api/contact", "/api/consultation", "/api/whitepaper", "/api/life-expectancy"];
    for (const path of expected) {
      expect(API_ROUTES[path]?.turnstile, `${path} must set turnstile:true`).toBe(true);
    }
    expect(Object.keys(API_ROUTES).sort()).toEqual([...expected].sort());
  });
});
