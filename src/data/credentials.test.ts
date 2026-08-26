import { describe, expect, it } from "vitest";
import { credentials } from "./credentials";
describe("LCP credentials", () => {
  it("has exactly the 8 LCP-relevant credentials", () => {
    expect(credentials.map((c) => c.slug).sort()).toEqual(["cdms","clcp","cnlcp","crc","md","mscc","phd","rn"]);
  });
  it("each has scope, >=3 requirements, >=2 faqs", () => {
    for (const c of credentials) {
      expect(c.scope.length, c.slug).toBeGreaterThan(100);
      expect(c.requirements.length, c.slug).toBeGreaterThanOrEqual(3);
      expect(c.faqs.length, c.slug).toBeGreaterThanOrEqual(2);
    }
  });
});
