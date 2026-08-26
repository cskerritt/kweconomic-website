import { describe, expect, it, beforeEach, vi } from "vitest";

beforeEach(() => vi.resetModules());

describe("API_ROUTES Turnstile gating", () => {
  it("every public lead-capture route is Turnstile-gated", async () => {
    const { API_ROUTES } = await import("../server.js");
    // Every lead form writes a durable lead + forwards to the workflow, so each
    // must verify Turnstile server-side (a bot can POST any of them directly).
    for (const path of [
      "/api/contact",
      "/api/consultation",
      "/api/whitepaper",
      "/api/estimator",
      "/api/life-expectancy",
    ]) {
      expect(API_ROUTES[path]?.turnstile, `${path} must set turnstile:true`).toBe(true);
    }
  });
});
