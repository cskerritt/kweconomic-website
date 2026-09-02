import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Home from "./Home";
import About from "./About";
import Team from "./Team";
import Contact from "./Contact";
import FAQ from "./FAQ";
import CaseStudies from "./CaseStudies";
import ScheduleConsultation from "./ScheduleConsultation";
import Privacy from "./Privacy";
import Terms from "./Terms";
import NotFound from "./NotFound";
import ExpertProfile from "./templates/ExpertProfile";
import { renderRoute, faqLdStrings } from "@/test-utils/markup";
import { faqs, FAQ_DATE_MODIFIED } from "@/data/faqs";
import { homepageFaqs } from "@/data/home-faqs.mjs";
import {
  ORG_NAME,
  ORG_SHORT,
  ORG_LEGAL,
  SITE_URL,
  ORG_PHONE,
  ORG_PHONE_VA,
  ORG_PHONE_DISPLAY,
  ORG_PHONE_VA_DISPLAY,
  telHref,
} from "@/lib/brand";

// Server renders of the core pages (home, about, team, contact, FAQ, case
// studies, schedule, legal, 404). usePageMeta does not run under
// renderToStaticMarkup, so the body and JSON-LD are rendered and the
// title/description literals are read from source, the way
// scripts/prerender-meta.test.mjs reads them for the shell parity pin.

type LdNode = Record<string, unknown> & { "@type"?: string; "@graph"?: LdNode[] };

/** Every JSON-LD block on the page, parsed. Throws on malformed JSON. */
function ldBlocks(html: string): LdNode[] {
  return [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map(
    (m) => JSON.parse(m[1]) as LdNode,
  );
}

/** Flattened nodes: each block's @graph members, or the block itself. */
function ldNodes(html: string): LdNode[] {
  return ldBlocks(html).flatMap((b) => b["@graph"] ?? [b]);
}

function nodeOfType(html: string, type: string): LdNode | undefined {
  return ldNodes(html).find((n) => n["@type"] === type);
}

const unescape = (s: string) =>
  s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").trim();

/** The visible breadcrumb trail, in order (links plus the aria-current page). */
function crumbNames(html: string): string[] {
  const nav = html.match(/<nav aria-label="Breadcrumb"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
  return [...nav.matchAll(/<(?:a|span aria-current="page")[^>]*>([^<]+)<\/(?:a|span)>/g)].map((m) => unescape(m[1]));
}

/** The AuthorByline container (the first element that links a team profile before the H2s). */
function byline(html: string): string {
  const m = html.match(/<div class="[^"]*">(?:(?!<\/div>)[\s\S])*?href="\/team\/[a-z-]+"[\s\S]*?<\/div>/);
  return m?.[0] ?? "";
}

/** `<time>` carrying the date, whichever attribute casing the renderer emits. */
const timeTag = (date: string) => new RegExp(`<time [^>]*datetime="${date}"`, "i");

/** Text of every heading of the given level, inner tags stripped. */
function headings(html: string, level: number): string[] {
  const re = new RegExp(`<h${level}[^>]*>([\\s\\S]*?)</h${level}>`, "g");
  return [...html.matchAll(re)].map((m) => unescape(m[1].replace(/<[^>]+>/g, "")).replace(/\s+/g, " "));
}

const PAGES = {
  "/": { Page: Home, route: "/" },
  "/about": { Page: About, route: "/about" },
  "/team": { Page: Team, route: "/team" },
  "/contact": { Page: Contact, route: "/contact" },
  "/resources/faq": { Page: FAQ, route: "/resources/faq" },
  "/case-studies": { Page: CaseStudies, route: "/case-studies" },
  "/schedule-consultation": { Page: ScheduleConsultation, route: "/schedule-consultation" },
  "/privacy": { Page: Privacy, route: "/privacy" },
  "/terms": { Page: Terms, route: "/terms" },
  "/team/christopher-skerritt": { Page: ExpertProfile, route: "/team/:slug" },
  "/nowhere": { Page: NotFound, route: "*" },
} as const;

const rendered = Object.fromEntries(
  Object.entries(PAGES).map(([path, { Page, route }]) => [path, renderRoute(path, route, Page)]),
) as Record<keyof typeof PAGES, string>;

describe("core page hygiene", () => {
  for (const [path, html] of Object.entries(rendered)) {
    it(`${path} carries no em or en dash`, () => {
      expect(html).not.toMatch(/[\u2013\u2014]/);
    });
  }
});

describe("JSON-LD on the core pages resolves its types", () => {
  const WITH_LD: (keyof typeof PAGES)[] = [
    "/",
    "/about",
    "/team",
    "/contact",
    "/resources/faq",
    "/case-studies",
    "/schedule-consultation",
    "/team/christopher-skerritt",
  ];
  for (const path of WITH_LD) {
    it(`${path}: every block is a schema.org graph with a top-level @context`, () => {
      const blocks = ldBlocks(rendered[path]);
      expect(blocks.length, path).toBeGreaterThan(0);
      for (const b of blocks) {
        expect(b["@context"], path).toBe("https://schema.org");
        expect(Array.isArray(b["@graph"]), path).toBe(true);
      }
    });
  }

  it("the entity pages tie their page node to the Organization and WebSite ids", () => {
    const org = `${SITE_URL}/#org`;
    const site = `${SITE_URL}/#website`;
    const about = nodeOfType(rendered["/about"], "AboutPage")!;
    expect(about).toBeDefined();
    expect(about["@id"]).toBe(`${SITE_URL}/about#webpage`);
    expect(about.about).toEqual({ "@id": org });
    expect(about.mainEntity).toEqual({ "@id": org });
    expect(about.isPartOf).toEqual({ "@id": site });
    expect(nodeOfType(rendered["/about"], "ProfessionalService")).toBeDefined();

    for (const [path, name] of [
      ["/contact", "Contact a Forensic Economist"],
      ["/schedule-consultation", "Schedule a Forensic Economist Consultation"],
    ] as const) {
      const page = nodeOfType(rendered[path], "ContactPage")!;
      expect(page, path).toBeDefined();
      expect(page["@id"], path).toBe(`${SITE_URL}${path}#webpage`);
      expect(page.url, path).toBe(`${SITE_URL}${path}`);
      expect(page.name, path).toBe(name);
      expect(page.isPartOf, path).toEqual({ "@id": site });
      expect(page.about, path).toEqual({ "@id": org });
    }
  });

  it("the office LocalBusiness nodes stay on /contact, the page that prints the NAP block", () => {
    const officeIds = (html: string) =>
      ldNodes(html)
        .map((n) => String(n["@id"] ?? ""))
        .filter((id) => id.includes("#office-"));
    expect(officeIds(rendered["/contact"]).sort()).toEqual([`${SITE_URL}/#office-nj`, `${SITE_URL}/#office-va`]);
    expect(officeIds(rendered["/"])).toEqual([]);
    expect(officeIds(rendered["/about"])).toEqual([]);
  });
});

describe("breadcrumbs are shown and claimed consistently", () => {
  const TRAILS: Record<string, string[]> = {
    "/about": ["Home", "About"],
    "/team": ["Home", "Team"],
    "/contact": ["Home", "Contact"],
    "/resources/faq": ["Home", "FAQ"],
    "/case-studies": ["Home", "Case Studies"],
    "/schedule-consultation": ["Home", "Contact", "Schedule a Consultation"],
  };
  const URL_OF: Record<string, string> = {
    Home: `${SITE_URL}/`,
    About: `${SITE_URL}/about`,
    Team: `${SITE_URL}/team`,
    Contact: `${SITE_URL}/contact`,
    FAQ: `${SITE_URL}/resources/faq`,
    "Case Studies": `${SITE_URL}/case-studies`,
    "Schedule a Consultation": `${SITE_URL}/schedule-consultation`,
  };

  for (const [path, trail] of Object.entries(TRAILS)) {
    it(`${path}: the visible trail and the BreadcrumbList agree (${trail.join(" > ")})`, () => {
      const html = rendered[path as keyof typeof PAGES];
      expect(html).toContain('<nav aria-label="Breadcrumb"');
      expect(crumbNames(html)).toEqual(trail);
      // The current page is text, not a self-link; every ancestor is a link.
      expect(html).toContain(`<span aria-current="page" class="text-neutral-900">${trail[trail.length - 1]}</span>`);
      const list = nodeOfType(html, "BreadcrumbList")!;
      expect(list).toBeDefined();
      const items = list.itemListElement as { position: number; name: string; item: string }[];
      expect(items.map((i) => i.name)).toEqual(trail);
      expect(items.map((i) => i.item)).toEqual(trail.map((t) => URL_OF[t]));
      expect(items.map((i) => i.position)).toEqual(trail.map((_, i) => i + 1));
    });
  }

  it("the homepage claims no breadcrumb (a one-item trail is navigation the page does not show)", () => {
    expect(rendered["/"]).not.toContain('aria-label="Breadcrumb"');
    expect(nodeOfType(rendered["/"], "BreadcrumbList")).toBeUndefined();
  });
});

describe("/ (home)", () => {
  const html = rendered["/"];

  it("renders one FAQ heading, 'Common questions', with the intro under it and no FAQBlock default title", () => {
    const h2s = headings(html, 2);
    expect(h2s.filter((h) => h === "Common questions")).toHaveLength(1);
    expect(h2s).not.toContain("Frequently Asked Questions");
    expect(html).toContain("Direct answers for attorneys evaluating an economic damages engagement.");
    const faqCount = homepageFaqs(ORG_NAME, ORG_SHORT).length;
    expect(html.match(/<details/g)?.length).toBe(faqCount);
    expect(faqLdStrings(html)).toHaveLength(faqCount * 2);
  });

  it("renders the report-contents card once, so the outline carries no duplicate H2", () => {
    expect(html.match(/What Every Report States/g)?.length).toBe(1);
    const h2s = headings(html, 2);
    expect(new Set(h2s).size, h2s.join(" | ")).toBe(h2s.length);
  });

  it("links the core entity pages from the body with descriptive anchors", () => {
    for (const href of ["/about", "/team", "/credentials", "/resources/faq", "/case-studies", "/case-types"]) {
      expect(html, href).toContain(`href="${href}"`);
    }
    expect(html).toContain("the economics team");
    expect(html).toContain("what qualifies a forensic economist to testify");
    expect(html).toContain("Browse Case Types");
    expect(html).toContain("lg:grid-cols-4");
  });
});

describe("/about", () => {
  const html = rendered["/about"];

  it("states the legal-name relationship and links the practice pages", () => {
    expect(html).toContain(`${ORG_NAME} is the trade name of ${ORG_LEGAL}`);
    for (const href of ["/team", "/services", "/case-studies", "/resources/faq", "/credentials"]) {
      expect(html, href).toContain(`href="${href}"`);
    }
  });
});

describe("/resources/faq", () => {
  const html = rendered["/resources/faq"];
  const ldNames = faqLdStrings(html).filter((_, i) => i % 2 === 0);

  it("wraps every question in an H3 under one 'Questions attorneys ask' H2, matching the FAQPage names", () => {
    expect(headings(html, 2)).toContain("Questions attorneys ask");
    // The accordion runs from its H2 to the References block; the CTA below
    // carries its own H3 and is not a question.
    const accordion = html.slice(html.indexOf('id="faq-list-heading"'), html.indexOf('id="sources-heading"'));
    const h3s = headings(accordion, 3);
    expect(h3s).toHaveLength(faqs.length);
    expect(h3s).toEqual(faqs.map((f) => f.question));
    expect(ldNames).toEqual(h3s);
    // WAI-ARIA accordion: heading > button[aria-expanded][aria-controls], and
    // the answer panels stay in the DOM when closed.
    expect(html.match(/<h3 class="m-0"><button /g)?.length).toBe(faqs.length);
    expect(html).toContain('id="faq-panel-0" role="region" aria-labelledby="faq-button-0" hidden=""');
  });

  it("phrases the questions the way attorneys ask them, not brand-led, and covers the fee question", () => {
    for (const name of ldNames) {
      expect(name).not.toMatch(new RegExp(`^(Does|Can|How do I retain) ${ORG_NAME}`));
    }
    expect(ldNames).toContain("How much does a forensic economist cost?");
    expect(ldNames).toContain("Can a forensic economist rebut an opposing economist's report?");
    expect(ldNames).toContain("Can a forensic economist testify in any state?");
    expect(ldNames).toContain("How do I retain a forensic economist?");
  });

  it("carries the reviewer byline and stamps the FAQPage node with the same dateModified", () => {
    // The byline's wording belongs to AuthorByline; the page owns the author
    // link and the date it prints.
    expect(byline(html)).toContain('href="/team/christopher-skerritt"');
    expect(byline(html)).toMatch(timeTag(FAQ_DATE_MODIFIED));
    const faqPage = nodeOfType(html, "FAQPage")!;
    expect(faqPage.dateModified).toBe(FAQ_DATE_MODIFIED);
    expect(faqPage["@id"]).toBe(`${SITE_URL}/resources/faq#faq`);
  });

  it("the hero's 'Contact us directly' is a real link", () => {
    const hero = html.match(/<h1[\s\S]*?<\/section>/)?.[0] ?? "";
    expect(hero).toMatch(/<a[^>]*href="\/contact"[^>]*>Contact us directly<\/a>/);
  });
});

describe("/case-studies", () => {
  const html = rendered["/case-studies"];

  it("carries the reviewer byline and a dated CollectionPage node", () => {
    expect(byline(html)).toContain('href="/team/christopher-skerritt"');
    const page = nodeOfType(html, "CollectionPage")!;
    expect(page).toBeDefined();
    expect(page["@id"]).toBe(`${SITE_URL}/case-studies#webpage`);
    expect(page.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(byline(html)).toMatch(timeTag(String(page.dateModified)));
  });

  it("names no client, firm, matter, or dollar figure", () => {
    expect(html).not.toMatch(/\$\d/);
    expect(html).not.toMatch(/\bv\.\s+[A-Z]/);
    expect(html).toContain("anonymized composites");
  });
});

describe("phone numbers come from brand.ts on every core page that prints one", () => {
  it("/contact and /schedule-consultation use telHref for both offices and the formatted display strings", () => {
    for (const path of ["/contact", "/schedule-consultation"] as const) {
      const html = rendered[path];
      expect(html, path).toContain(`href="${telHref(ORG_PHONE)}"`);
      expect(html, path).toContain(`href="${telHref(ORG_PHONE_VA)}"`);
      expect(html, path).toContain(ORG_PHONE_DISPLAY);
      expect(html, path).toContain(ORG_PHONE_VA_DISPLAY);
      // A tel: href never carries the E.164 hyphens.
      expect(html, path).not.toMatch(/href="tel:[^"]*-/);
    }
  });

  it("/privacy and /terms print the brand phone and a machine-readable effective date", () => {
    for (const path of ["/privacy", "/terms"] as const) {
      const html = rendered[path];
      expect(html, path).toContain(`Phone: ${ORG_PHONE_DISPLAY}`);
      expect(html, path).toMatch(/Effective Date: <time datetime="\d{4}-\d{2}-\d{2}">/i);
    }
  });

  it("no core page source hardcodes a phone display string", () => {
    const FILES = [
      "Home.tsx", "About.tsx", "Team.tsx", "Contact.tsx", "FAQ.tsx", "CaseStudies.tsx",
      "ScheduleConsultation.tsx", "Privacy.tsx", "Terms.tsx", "NotFound.tsx", "templates/ExpertProfile.tsx",
    ];
    for (const f of FILES) {
      const src = readFileSync(join(__dirname, f), "utf8");
      // Form placeholders use the reserved 555 exchange; a real number is a leak.
      expect(src, f).not.toMatch(/\(\d{3}\) (?!555)\d{3}-\d{4}/);
      expect(src, f).not.toMatch(/tel:\$\{/);
    }
  });
});

describe("the 404 page", () => {
  const html = rendered["/nowhere"];

  it("is helpful: a descriptive H1, the three entry pages, and the phone link", () => {
    expect(headings(html, 1)).toEqual(["Page not found"]);
    for (const href of ["/services", "/case-types", "/contact", "/"]) {
      expect(html, href).toContain(`href="${href}"`);
    }
    expect(html).toContain(`href="${telHref(ORG_PHONE)}"`);
    expect(html).not.toContain("FAQPage");
  });
});

// Title and description literals, read from source the way the shell parity
// pin does (scripts/prerender-meta.test.mjs), so a rewrite that overruns the
// SERP limits fails here even before the shell is mirrored.
describe("core page meta literals", () => {
  const TOKENS: Record<string, string> = {
    ORG_NAME,
    ORG_SHORT,
    ORG_LEGAL,
    SITE_URL,
    DOMAIN: new URL(SITE_URL).host,
  };
  const STR = "(`[^`]*`|\"[^\"]*\")";
  const resolve = (literal: string) =>
    literal.slice(1, -1).replace(/\$\{(\w+)\}/g, (_, k: string) => {
      if (!(k in TOKENS)) throw new Error(`unresolvable token \${${k}} in ${literal}`);
      return TOKENS[k];
    });
  function pageMeta(file: string) {
    const src = readFileSync(join(__dirname, file), "utf8");
    const m = src.match(new RegExp(`usePageMeta\\(\\{\\s*title: ${STR},\\s*description:\\s*${STR}`));
    if (!m) throw new Error(`${file} has no literal usePageMeta title/description`);
    return { title: resolve(m[1]), description: resolve(m[2]) };
  }

  const CORE_FILES = [
    "Home.tsx", "About.tsx", "Team.tsx", "Contact.tsx", "FAQ.tsx",
    "CaseStudies.tsx", "ScheduleConsultation.tsx", "Privacy.tsx", "Terms.tsx",
  ];
  for (const file of CORE_FILES) {
    it(`${file}: title <= 63 chars with the brand, description 70-160 chars, hyphens only`, () => {
      const { title, description } = pageMeta(file);
      expect(title.length, title).toBeLessThanOrEqual(63);
      expect(title, file).toContain(ORG_NAME);
      expect(description.length, description).toBeLessThanOrEqual(160);
      expect(description.length, description).toBeGreaterThanOrEqual(70);
      expect(`${title} ${description}`, file).not.toMatch(/[\u2013\u2014]/);
    });
  }

  it("the core titles carry a query term, not just a navigation label", () => {
    expect(pageMeta("Team.tsx").title).toBe(`Forensic Economics Team | ${ORG_NAME}`);
    expect(pageMeta("Contact.tsx").title).toBe(`Contact a Forensic Economist | ${ORG_NAME}`);
    expect(pageMeta("FAQ.tsx").title).toBe(`Forensic Economist FAQ for Attorneys | ${ORG_NAME}`);
    expect(pageMeta("ScheduleConsultation.tsx").title).toBe(`Schedule a Forensic Economist Consultation | ${ORG_NAME}`);
    expect(pageMeta("About.tsx").title).toBe(`About ${ORG_NAME} - Independent Forensic Economics Practice`);
  });

  it("the team description says 'can testify', never that the chief testifies to every analysis", () => {
    const { description } = pageMeta("Team.tsx");
    expect(description).toBe(
      `The ${ORG_NAME} team: a Chief of Economic Services who directs each damages analysis and can testify to it, and an associate who coordinates every engagement.`,
    );
    expect(description).not.toMatch(/directs and testifies/);
  });
});
