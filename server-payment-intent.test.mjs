import { describe, expect, it } from "vitest";
// Route-table coverage for the /api/payment-intent entry in server.js's
// API_ROUTES map (the /payment Zelle gate). server.js skips self-listen under
// VITEST and reads dist/index.html at import time, so importing it here is safe.
import { API_ROUTES } from "./server.js";

const route = API_ROUTES["/api/payment-intent"];

describe("server API_ROUTES wiring for /api/payment-intent", () => {
  it("registers the route with the payment-intent type and required fields", () => {
    expect(route).toBeTruthy();
    expect(route.type).toBe("payment-intent");
    expect(route.required).toEqual(
      expect.arrayContaining(["name", "email", "invoiceNumber", "amount"]),
    );
  });

  it("verifies Turnstile like the other public forms", () => {
    expect(route.turnstile).toBe(true);
  });

  it("carries a normalize hook that trims text and canonicalizes amount", () => {
    expect(typeof route.normalize).toBe("function");
    const data = {
      name: "  Acme Law LLP ",
      email: " billing@acme.com ",
      firm: "  Acme  ",
      invoiceNumber: "  INV-1 ",
      caseName: "  Doe v. Roe ",
      amount: "$1,250.00",
    };
    route.normalize(data);
    expect(data).toMatchObject({
      name: "Acme Law LLP",
      email: "billing@acme.com",
      firm: "Acme",
      invoiceNumber: "INV-1",
      caseName: "Doe v. Roe",
      amount: "1250.00",
    });
  });

  it("does not reuse the estimator/whitepaper/contact required sets", () => {
    // A minimal sanity check that the new route is distinct and self-contained -
    // it must not accidentally require a lead field like phone or slug.
    expect(route.required).not.toContain("phone");
    expect(route.required).not.toContain("slug");
    expect(route.required).not.toContain("firm");
  });
});
