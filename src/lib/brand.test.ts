import { describe, expect, it } from "vitest";
import { ORG_NAME, ORG_SHORT, SITE_URL, OFFICES, SAME_AS, KNOWS_ABOUT } from "./brand";
import { ORG_URL, ORG_LOGO, organizationSchema } from "./schema";

describe("brand constants", () => {
  it("names the LCP brand and domain", () => {
    expect(ORG_NAME).toBe("KW Life Care Planning");
    expect(ORG_SHORT).toBe("KW LCP");
    expect(SITE_URL).toBe("https://kwlcp.com");
    expect(ORG_URL).toBe(SITE_URL);
    expect(ORG_LOGO).toBe("https://kwlcp.com/images/logo.png");
  });
  it("keeps both offices and the family sameAs links", () => {
    expect(OFFICES.map((o) => o.addressRegion)).toEqual(["NJ", "VA"]);
    expect(SAME_AS).toEqual(["https://kwvrs.com", "https://kweconomics.com"]);
  });
  it("feeds the organization schema", () => {
    const org = organizationSchema() as Record<string, unknown>;
    expect(org.name).toBe(ORG_NAME);
    expect(org.knowsAbout).toEqual(KNOWS_ABOUT);
    expect(org.sameAs).toEqual(SAME_AS);
  });
});
