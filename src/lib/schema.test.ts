import { describe, expect, it } from "vitest";
import {
  ORG_ID,
  ORG_URL,
  organizationSchema,
  personSchema,
  graphSchema,
  websiteSchema,
  serviceSchema,
  credentialSchema,
} from "./schema";

describe("schema builders", () => {
  it("organizationSchema has stable @id", () => {
    const org = organizationSchema();
    expect(org["@id"]).toBe(ORG_ID);
    expect(org["@type"]).toBe("ProfessionalService");
  });

  it("personSchema references the Organization via @id", () => {
    const p = personSchema({
      slug: "daniel-wolstein",
      name: "Daniel Wolstein",
      jobTitle: "CEO",
      credentials: ["Ph.D.", "CRC"],
      specialties: ["Vocational Evaluation"],
      imageUrl: "/team/daniel-wolstein.jpg",
      bio: "test bio",
    });
    expect(p["@id"]).toBe(`${ORG_URL}/team/daniel-wolstein#person`);
    expect((p.worksFor as { "@id": string })["@id"]).toBe(ORG_ID);
    expect((p.hasCredential as unknown[]).length).toBe(2);
  });

  it("credentialSchema stamps the category it is given and never a certification default", () => {
    const c = credentialSchema({
      slug: "nafe-member",
      name: "National Association of Forensic Economics Member",
      abbreviation: "NAFE",
      category: "Professional Membership",
      issuer: "National Association of Forensic Economics",
      issuerUrl: "https://nafe.net/",
      scope: "test scope",
    });
    expect(c["@id"]).toBe(`${ORG_URL}/credentials/nafe-member#credential`);
    expect(c.credentialCategory).toBe("Professional Membership");
    expect((c.recognizedBy as { name: string; url: string }).url).toBe("https://nafe.net/");
    expect(JSON.stringify(c)).not.toContain("Professional Certification");
  });

  it("graphSchema wraps entities in @graph", () => {
    const g = graphSchema([organizationSchema()]);
    expect(g["@context"]).toBe("https://schema.org");
    expect(Array.isArray(g["@graph"])).toBe(true);
  });
});

describe("websiteSchema", () => {
  it("does NOT advertise a SearchAction (the site has no /?q= search endpoint)", () => {
    const w = websiteSchema();
    expect(w["@type"]).toBe("WebSite");
    expect(w["potentialAction"]).toBeUndefined();
    expect(JSON.stringify(w)).not.toContain("search_term_string");
  });
});

describe("serviceSchema with offers and dateModified", () => {
  it("includes offers when provided", () => {
    const s = serviceSchema({
      slug: "pre-litigation",
      name: "Pre-Litigation Services",
      description: "Lower-cost productized expert services.",
      offers: {
        "@type": "Offer",
        priceSpecification: {
          "@type": "PriceSpecification",
          minPrice: 750,
          maxPrice: 4500,
          priceCurrency: "USD",
        },
      },
    });
    expect(s["offers"]).toBeDefined();
  });

  it("includes dateModified when provided", () => {
    const s = serviceSchema({
      slug: "pre-litigation",
      name: "Pre-Litigation Services",
      description: "x",
      dateModified: "2026-05-02",
    });
    expect(s["dateModified"]).toBe("2026-05-02");
  });

  it("omits offers when not provided (no regression)", () => {
    const s = serviceSchema({ slug: "x", name: "X", description: "y" });
    expect(s["offers"]).toBeUndefined();
  });
});
