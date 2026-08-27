import { describe, expect, it } from "vitest";
import { ORG_NAME, ORG_SHORT, ORG_LEGAL, SITE_URL, OFFICES, SAME_AS, KNOWS_ABOUT, LEGACY_BRAND_PATTERN, VOC_SITE_URL, LCP_SITE_URL } from "./brand";
import { ORG_URL, ORG_LOGO, organizationSchema } from "./schema";

describe("brand constants", () => {
  it("names the economics brand and domain", () => {
    expect(ORG_NAME).toBe("KW Economics");
    expect(ORG_SHORT).toBe("KW Economics");
    expect(ORG_LEGAL).toBe("Kincaid Wolstein Economics");
    expect(SITE_URL).toBe("https://kweconomics.com");
    expect(ORG_URL).toBe(SITE_URL);
    expect(ORG_LOGO).toBe("https://kweconomics.com/images/logo.png");
  });
  it("keeps both offices and links both sister practices", () => {
    expect(OFFICES.map((o) => o.addressRegion)).toEqual(["NJ", "VA"]);
    expect(VOC_SITE_URL).toBe("https://kwvrs.com");
    expect(LCP_SITE_URL).toBe("https://kwlcp.com");
    expect(SAME_AS).toEqual([VOC_SITE_URL, LCP_SITE_URL]);
  });
  it("legacy pattern catches every sister brand form", () => {
    for (const s of ["KWVRS", "KW LCP", "kwlcp.com", "Kincaid Wolstein Vocational", "KW Life Care Planning"]) expect(s).toMatch(LEGACY_BRAND_PATTERN);
    expect("KW Economics").not.toMatch(LEGACY_BRAND_PATTERN);
    expect("Kincaid Wolstein Economics").not.toMatch(LEGACY_BRAND_PATTERN);
  });
  it("feeds the organization schema without a medical type", () => {
    const org = organizationSchema() as Record<string, unknown>;
    expect(org.name).toBe(ORG_NAME);
    expect(org.knowsAbout).toEqual(KNOWS_ABOUT);
    expect(org.sameAs).toEqual(SAME_AS);
    expect(JSON.stringify(org)).not.toContain("MedicalBusiness");
    expect(KNOWS_ABOUT).toContain("Forensic Economics");
    expect(KNOWS_ABOUT).toContain("Business Valuation");
  });
});
