import { describe, expect, it } from "vitest";
import { services, getServiceBySlug } from "./services";

describe("services taxonomy", () => {
  it("includes expert-disclosure", () => {
    const s = getServiceBySlug("expert-disclosure");
    expect(s).toBeDefined();
    expect(s?.shortName).toMatch(/Expert Disclosure/i);
  });

  it("does not include pre-litigation", () => {
    expect(getServiceBySlug("pre-litigation")).toBeUndefined();
  });

  it("does not include affidavit-report (product retired)", () => {
    expect(getServiceBySlug("affidavit-report")).toBeUndefined();
  });

  it("has 8 service entries including expert-disclosure", () => {
    expect(services.length).toBe(8);
    expect(getServiceBySlug("expert-disclosure")).toBeDefined();
  });
});
