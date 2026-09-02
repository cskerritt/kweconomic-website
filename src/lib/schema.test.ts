import { describe, expect, it } from "vitest";
import {
  ORG_ID,
  ORG_URL,
  WEBSITE_ID,
  ORG_LOGO,
  organizationSchema,
  websiteSchema,
  officeSchemas,
  personSchema,
  graphSchema,
  serviceSchema,
  credentialSchema,
  articleSchema,
  blogPostingSchema,
  howToSchema,
  faqPageSchema,
  collectionPageSchema,
  breadcrumbSchema,
  authorNode,
  publisherNode,
  stripLinkMarkers,
} from "./schema";
import { DEFAULT_OG_IMAGE } from "@/lib/brand";
import { team } from "@/data/team";

type Node = Record<string, unknown>;
const graphOf = (g: Node) => g["@graph"] as Node[];
const MARKER_TEXT = "Read the [[/methods/present-value-and-discounting|present value method]] page.";
const PLAIN_TEXT = "Read the present value method page.";

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

  it("carries the site @id and points its publisher at the Organization @id", () => {
    const w = websiteSchema();
    expect(w["@id"]).toBe(WEBSITE_ID);
    expect(w.publisher).toEqual({ "@id": ORG_ID });
    expect(w.url).toBe(ORG_URL);
  });
});

describe("graphSchema resolves the organization reference on the page itself", () => {
  const article = articleSchema({ title: "T", description: "D", url: `${ORG_URL}/guides/x` });

  it("prepends the Organization node when a node references ORG_ID and none carries it", () => {
    const g = graphOf(graphSchema([article, breadcrumbSchema([{ name: "Home", url: `${ORG_URL}/` }])]));
    expect(g[0]["@id"]).toBe(ORG_ID);
    expect(g[0]["@type"]).toBe("ProfessionalService");
    expect(g).toHaveLength(3);
  });

  it("does not duplicate the Organization node when the page already carries it", () => {
    const g = graphOf(graphSchema([organizationSchema(), article]));
    expect(g.filter((n) => n["@id"] === ORG_ID)).toHaveLength(1);
    expect(g).toHaveLength(2);
  });

  it("adds nothing when no node references the organization", () => {
    const g = graphOf(graphSchema([breadcrumbSchema([{ name: "Home", url: `${ORG_URL}/` }])]));
    expect(g).toHaveLength(1);
    expect(g[0]["@type"]).toBe("BreadcrumbList");
  });

  it("resolves a Service provider reference the same way (state and case-type tiers)", () => {
    const g = graphOf(graphSchema([serviceSchema({ slug: "x", name: "X", description: "y" })]));
    expect(g[0]["@id"]).toBe(ORG_ID);
    expect(g[1]["@type"]).toBe("Service");
  });
});

describe("articleSchema author and publisher are inline entities", () => {
  const author = team[0];
  const a = articleSchema({
    title: "How Lost Earnings Are Calculated",
    description: "D",
    url: `${ORG_URL}/guides/how-lost-earnings-are-calculated`,
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    authorSlug: author.slug,
  });

  it("names the author Person with the profile @id, name, job title, and URL, and no credential list", () => {
    const person = a.author as Node;
    expect(person["@type"]).toBe("Person");
    expect(person["@id"]).toBe(`${ORG_URL}/team/${author.slug}#person`);
    expect(person.name).toBe(author.name);
    expect(person.jobTitle).toBe(author.title);
    expect(person.url).toBe(`${ORG_URL}/team/${author.slug}`);
    expect(person.hasCredential).toBeUndefined();
    expect(JSON.stringify(person)).not.toMatch(/CLCP|CNLCP|\bCRC\b|MSCC/);
  });

  it("names the publisher Organization with the org @id, name, and a logo ImageObject", () => {
    const publisher = a.publisher as Node;
    expect(publisher["@id"]).toBe(ORG_ID);
    expect(publisher.name).toBeTruthy();
    expect(publisher.logo).toEqual({ "@type": "ImageObject", url: ORG_LOGO });
    expect(publisherNode()).toEqual(publisher);
  });

  it("falls back to the organization by @id for an unknown or absent author", () => {
    expect(authorNode(undefined)).toEqual({ "@id": ORG_ID });
    expect(authorNode("nobody-here")).toEqual({ "@id": ORG_ID });
    expect(articleSchema({ title: "T", description: "D", url: `${ORG_URL}/x` }).author).toEqual({ "@id": ORG_ID });
  });

  it("uses the 1200x630 share image, never the wordmark, as the Article image by default", () => {
    expect(a.image).toBe(DEFAULT_OG_IMAGE);
    expect(a.image).not.toBe(ORG_LOGO);
    expect(DEFAULT_OG_IMAGE).toMatch(/\/images\/og-default\.jpg$/);
    const custom = articleSchema({ title: "T", description: "D", url: `${ORG_URL}/x`, image: `${ORG_URL}/images/custom.jpg` });
    expect(custom.image).toBe(`${ORG_URL}/images/custom.jpg`);
  });

  it("carries the dates, the headline, and a mainEntityOfPage", () => {
    expect(a.headline).toBe("How Lost Earnings Are Calculated");
    expect(a.datePublished).toBe("2026-08-27");
    expect(a.dateModified).toBe("2026-09-02");
    expect(a.mainEntityOfPage).toBe(`${ORG_URL}/guides/how-lost-earnings-are-calculated`);
    expect(a["@id"]).toBe(`${ORG_URL}/guides/how-lost-earnings-are-calculated#article`);
  });

  it("blogPostingSchema is the same node typed BlogPosting", () => {
    const b = blogPostingSchema({ title: "T", description: "D", url: `${ORG_URL}/insights/x`, authorSlug: author.slug });
    expect(b["@type"]).toBe("BlogPosting");
    expect((b.author as Node)["@type"]).toBe("Person");
  });
});

describe("inline-link markers never reach structured data", () => {
  it("stripLinkMarkers is exported and reduces a marker to its anchor text", () => {
    expect(stripLinkMarkers(MARKER_TEXT)).toBe(PLAIN_TEXT);
    expect(stripLinkMarkers("plain text [not a marker]")).toBe("plain text [not a marker]");
  });

  it("articleSchema and blogPostingSchema strip the headline and description", () => {
    const a = articleSchema({ title: MARKER_TEXT, description: MARKER_TEXT, url: `${ORG_URL}/x` });
    expect(a.headline).toBe(PLAIN_TEXT);
    expect(a.description).toBe(PLAIN_TEXT);
    const b = blogPostingSchema({ title: MARKER_TEXT, description: MARKER_TEXT, url: `${ORG_URL}/x` });
    expect(b.description).toBe(PLAIN_TEXT);
  });

  it("howToSchema strips the name, description, and step text", () => {
    const h = howToSchema({ name: MARKER_TEXT, description: MARKER_TEXT, steps: [MARKER_TEXT, "Step two"] });
    expect(h.name).toBe(PLAIN_TEXT);
    expect(h.description).toBe(PLAIN_TEXT);
    expect((h.step as { text: string }[]).map((s) => s.text)).toEqual([PLAIN_TEXT, "Step two"]);
  });

  it("serviceSchema, credentialSchema, collectionPageSchema, and faqPageSchema strip their copy", () => {
    const s = serviceSchema({ slug: "x", name: MARKER_TEXT, description: MARKER_TEXT });
    expect(s.name).toBe(PLAIN_TEXT);
    expect(s.description).toBe(PLAIN_TEXT);
    const c = credentialSchema({ slug: "x", name: "X", abbreviation: "X", category: "Academic Degree", scope: MARKER_TEXT });
    expect(c.description).toBe(PLAIN_TEXT);
    const col = collectionPageSchema({ url: `${ORG_URL}/guides`, name: "Guides", description: MARKER_TEXT, items: [] });
    expect(col.description).toBe(PLAIN_TEXT);
    const f = faqPageSchema([{ question: MARKER_TEXT, answer: MARKER_TEXT }], `${ORG_URL}/x`);
    const q = (f.mainEntity as { name: string; acceptedAnswer: { text: string } }[])[0];
    expect(q.name).toBe(PLAIN_TEXT);
    expect(q.acceptedAnswer.text).toBe(PLAIN_TEXT);
    expect(JSON.stringify([s, c, col, f])).not.toContain("[[");
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

describe("serviceSchema entity identity", () => {
  it("derives @id and url from the pillar slug by default (a real /services route)", () => {
    const s = serviceSchema({ slug: "business-valuation", name: "Business Valuation", description: "x" });
    expect(s.url).toBe(`${ORG_URL}/services/business-valuation`);
    expect(s["@id"]).toBe(`${ORG_URL}/services/business-valuation#service`);
    expect(s.provider).toEqual({ "@id": ORG_ID });
  });

  it("takes the page's own canonical URL when given one, so a state or city page never points at a synthetic /services path", () => {
    const url = `${ORG_URL}/locations/new-jersey`;
    const s = serviceSchema({ slug: "state-new-jersey", name: "Economic Damages Services in New Jersey", description: "x", url });
    expect(s.url).toBe(url);
    expect(s["@id"]).toBe(`${url}#service`);
    expect(JSON.stringify(s)).not.toContain("/services/state-");
  });
});

describe("officeSchemas", () => {
  const offices = officeSchemas();
  const nj = offices.find((o) => (o["@id"] as string).endsWith("#office-nj")) as Node;
  const va = offices.find((o) => (o["@id"] as string).endsWith("#office-va")) as Node;

  it("emits one node per office, each a child of the Organization", () => {
    expect(offices).toHaveLength(2);
    for (const o of offices) expect(o.parentOrganization).toEqual({ "@id": ORG_ID });
  });

  it("the New Jersey headquarters carries its street address and map", () => {
    expect((nj.address as Node).streetAddress).toBeTruthy();
    expect(nj.hasMap).toMatch(/^https:\/\//);
  });

  it("the Richmond office omits the unconfirmed street address and map rather than publishing a placeholder", () => {
    expect(nj).toBeDefined();
    expect(va).toBeDefined();
    expect(Object.keys(va)).not.toContain("hasMap");
    expect(Object.keys(va.address as Node)).not.toContain("streetAddress");
    expect((va.address as Node).addressLocality).toBe("Richmond");
    const json = JSON.stringify(offices);
    expect(json).not.toContain("undefined");
    expect(json).not.toContain("null");
    // The Richmond record never resolves to a map search for a bare city name.
    expect(JSON.stringify(va)).not.toContain("Richmond+VA");
  });
});
