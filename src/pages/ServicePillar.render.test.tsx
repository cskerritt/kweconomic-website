import { describe, it, expect, vi } from "vitest";
import ServicePillar from "./ServicePillar";
import { usePageMeta } from "@/hooks/use-page-meta";
import { pillarServices } from "@/data/services";
import { getCaseType } from "@/data/caseTypes";
import { credentials } from "@/data/credentials";
import { states } from "@/data/states";
import { retainableExperts } from "@/data/team";
import { ORG_NAME, VOC_SERVICE_URL, LCP_SERVICE_URL } from "@/lib/brand";
import { pillarTitle } from "@/lib/page-titles.mjs";
import { capFirst, workPhrase } from "@/lib/service-prose.mjs";
import { ORG_URL } from "@/lib/schema";
import {
  renderRoute,
  visibleText,
  jsonLdBlocks,
  faqText,
  faqLdStrings,
  excerpt,
  DOUBLED_WORD,
  MIS_ARTICLE,
} from "@/test-utils/markup";
import { expectServiceIdentity, serviceNodes } from "@/test-utils/jsonld";

// Server renders of every pillar page. usePageMeta writes the <head> from an
// effect that never runs under renderToStaticMarkup, so it is replaced with a
// spy and the title/description each page would publish is read back from
// the call; the body and JSON-LD are the synchronous render.
//
// The hero lead, the credential sidebar, and the "by Case Type" intro are
// templated from Service.shortName, which is a heading label rather than a
// prose phrase ("Fraud & Tracing", "Employment Damages", "Wrongful Death").
// Those sentences go through the prose helpers in src/lib/service-prose.mjs;
// the FAQ is hand-authored per pillar in services.ts and is never templated.
// The markup helpers live in src/test-utils/markup.ts.
vi.mock("@/hooks/use-page-meta", () => ({ usePageMeta: vi.fn() }));

function render(slug: string): { html: string; title: string; description: string } {
  vi.mocked(usePageMeta).mockClear();
  const html = renderRoute(`/services/${slug}`, "/services/:serviceSlug", ServicePillar);
  const meta = vi.mocked(usePageMeta).mock.calls.at(-1)?.[0];
  return { html, title: meta?.title ?? "", description: meta?.description ?? "" };
}

// Any phrasing that attributes a credential to the firm's economists (same
// guard as credential-claims.render.test.tsx).
const FIRM_LEVEL_CLAIM = /economists holding|holding (NAFE|AAEFE)|planners holding|(our|KW Economics) (economists|experts) (are|hold|belong)/i;
// A bare credential token rendered as its own text node.
const BARE_TOKEN = />(NAFE|AAEFE|PhD|MBA|Ph\.D\.)</;

const normalize = (s: string) => s.replace(/[^a-z0-9]/gi, "").toLowerCase();

describe("ServicePillar", () => {
  for (const service of pillarServices()) {
    describe(service.slug, () => {
      const { html, title, description } = render(service.slug);
      const text = visibleText(html);

      it("publishes the pillar title and the hand-authored meta description", () => {
        // The shared builder: "<name> Expert" on the full name where it fits
        // the 60-character tag, else on the pillar's titleName.
        expect(title).toBe(pillarTitle(service, ORG_NAME));
        const full = `${service.name} Expert | ${ORG_NAME}`;
        expect(title).toBe(full.length <= 60 ? full : `${service.titleName ?? service.name} Expert | ${ORG_NAME}`);
        expect(description).toBe(service.metaDescription);
        expect(description.length).toBeGreaterThanOrEqual(140);
        expect(description.length).toBeLessThanOrEqual(160);
        expect(description).toMatch(/plaintiff and defense|either spouse/);
        expect(description).toContain("nationwide");
      });

      it("renders the pillar page with its FAQPage JSON-LD, the Organization node, and dateModified", () => {
        const ld = jsonLdBlocks(html);
        expect(ld).toMatch(/"@type":\s*"FAQPage"/);
        expect(faqLdStrings(html).length).toBe(service.faqs.length * 2);
        expect(ld).toContain('"@id":"https://kweconomics.com/#org"');
        expect(ld).toContain(`"dateModified":"${service.dateModified}"`);
      });

      it("carries the byline with the last-updated date and a references block", () => {
        // AuthorByline's wording is that component's business; the pillar's
        // contract is the editorial-team link and the machine-readable date.
        expect(html).toContain('href="/team"');
        expect(html).toContain(`<time dateTime="${service.dateModified}">`);
        expect(html).toContain('id="sources-heading"');
        for (const s of service.sources) expect(html).toContain(`href="${s.url}"`);
      });

      it("carries 'nationwide' and 'plaintiff and defense' in the hero lead, not the title", () => {
        expect(text).toContain("for plaintiff and defense counsel nationwide");
        expect(title).not.toContain("Nationwide");
      });

      it("never doubles a word in the visible text", () => {
        expect(excerpt(text, DOUBLED_WORD)).toBeUndefined();
      });

      it("never doubles a word in the JSON-LD", () => {
        expect(excerpt(jsonLdBlocks(html), DOUBLED_WORD)).toBeUndefined();
      });

      it("never puts 'a' before a vowel in the visible text", () => {
        expect(excerpt(text, MIS_ARTICLE)).toBeUndefined();
      });

      it("never puts 'a' before a vowel in the JSON-LD", () => {
        expect(excerpt(jsonLdBlocks(html), MIS_ARTICLE)).toBeUndefined();
      });

      it("uses hyphens only (no en or em dashes) in the visible text", () => {
        expect(text).not.toMatch(/[–—]/);
      });

      it("spells out ampersands in the FAQ prose (headings may keep them)", () => {
        expect(faqText(html)).not.toContain("&");
        for (const s of faqLdStrings(html)) expect(s).not.toContain("&");
      });

      it("feeds the FAQPage JSON-LD from the same sentences the visitor reads", () => {
        const visible = faqText(html);
        for (const s of faqLdStrings(html)) expect(visible).toContain(s);
      });

      it("renders the pillar's own FAQ, not a templated firm-process FAQ", () => {
        const visible = faqText(html);
        for (const f of service.faqs) {
          expect(visible).toContain(f.question);
          expect(visible).toContain(f.answer);
        }
        expect(visible).not.toContain("linked below");
        expect(visible).not.toContain("Does KW Economics work for both plaintiff and defense?");
      });

      it("links only the declared service x case-type pairs, labelled with the service", () => {
        const pairLinks = [...html.matchAll(/href="\/services\/[a-z-]+\/case\/([a-z-]+)"/g)].map((m) => m[1]);
        expect(pairLinks.sort()).toEqual([...service.caseTypes].sort());
        for (const ct of service.caseTypes) {
          const type = getCaseType(ct)!;
          expect(html).toContain(`href="/services/${service.slug}/case/${ct}"`);
          expect(html).toContain(`href="/case-types/${ct}"`);
          expect(text).toContain(`${service.shortName} for ${type.name}`);
        }
      });

      it("links every state, the District of Columbia, and the territories", () => {
        for (const state of states) {
          expect(html).toContain(`href="/services/${service.slug}/${state.slug}"`);
        }
        expect(states.length).toBe(56);
        expect(text).toContain("Territories and DC");
      });

      it("links the three engagement-detail variants and the pillar's guides, methods, and comparisons", () => {
        for (const v of ["cost", "process", "timeline"]) {
          expect(html).toContain(`href="/services/${service.slug}/${v}"`);
        }
        expect(service.related.length).toBeGreaterThanOrEqual(3);
        for (const r of service.related) expect(html).toContain(`href="${r.href}"`);
        expect(html).not.toContain("Related Terms");
        for (const kw of service.keywords) expect(html).not.toContain(`>${kw}<`);
      });

      it("renders the credential sidebar as linked full names, never as bare tokens or a firm-level claim", () => {
        expect(text).toContain("How an expert on this work is qualified");
        expect(html).not.toContain("Relevant Credentials");
        expect(html).not.toMatch(BARE_TOKEN);
        expect(html).not.toMatch(FIRM_LEVEL_CLAIM);
        // No person is attached to the credential list; the hero names the
        // responsible economist separately (below), never beside a credential.
        const sidebar = html.slice(html.indexOf("<aside"));
        expect(sidebar).not.toMatch(/Skerritt|Sperling/);
        const linked = credentials.filter((c) =>
          service.relevantCredentials.some(
            (label) => label === c.slug || c.abbreviation.split("/").some((part) => normalize(part) === normalize(label)),
          ),
        );
        expect(linked.length).toBeGreaterThan(0);
        for (const c of linked) {
          expect(html).toContain(`href="/credentials/${c.slug}"`);
          expect(text).toContain(c.name);
        }
        // Each credential page is linked once even when two labels resolve to it (MBA + PhD).
        const credentialLinks = html.match(/href="\/credentials\/[a-z-]+"/g) ?? [];
        expect(credentialLinks.length).toBe(linked.length);
      });

      it("has a consultation CTA with the phone number", () => {
        expect(html).toContain('href="/contact"');
        expect(html).toMatch(/href="tel:\+1\d+"/);
      });

      // Audit C02: the pillar pages named no responsible professional and
      // stamped a review date on an editorial byline. The hero now names the
      // economist who directs the work, linked to the profile with the CV, and
      // the editorial byline labels its date "Updated".
      it("names the responsible economist once in the hero, linked to the profile, and labels the editorial date Updated", () => {
        const expert = retainableExperts()[0];
        expect(html).toContain(`href="/team/${expert.slug}"`);
        expect(text).toContain(`${capFirst(workPhrase(service.shortName))} at ${ORG_NAME} is directed by`);
        expect(text).toContain(`${expert.title}, who is available to testify to it.`);
        expect(html.match(new RegExp(`href="/team/${expert.slug}"`, "g"))?.length).toBe(1);
        expect(html).toContain("<span> · Updated </span>");
        expect(html).not.toContain("· Reviewed");
      });

      // Audit F08 / G01: an explained hand-off where the work depends on or
      // borders a sister practice's discipline, linking its verified service page.
      it("prints the explained hand-off exactly where the data carries one", () => {
        if (service.handoff) {
          expect(text).toContain(service.handoff.text);
          expect(html).toContain(`href="${service.handoff.href}" rel="noopener"`);
          expect(text).toContain(service.handoff.linkLabel);
        } else {
          expect(html).not.toContain(VOC_SERVICE_URL);
          expect(html).not.toContain(LCP_SERVICE_URL);
        }
        expect(html).not.toContain("/services/vocational-evaluation");
      });

      // Audit F08: the 56-entry state directory came before the FAQ and the
      // guides; the practical explanations now come first.
      it("puts the FAQ and the guides before the state directory", () => {
        const faqAt = html.indexOf(`Frequently asked: ${service.shortName.replace("&", "&amp;")}`);
        const guidesAt = html.indexOf("Guides and methods for");
        const directoryAt = html.indexOf(`${service.shortName.replace("&", "&amp;")} by State`);
        expect(faqAt).toBeGreaterThan(0);
        expect(guidesAt).toBeGreaterThan(faqAt);
        expect(directoryAt).toBeGreaterThan(guidesAt);
      });

      it("nests no second main landmark: the layout's main is the page's one main (T07)", () => {
        expect(html).not.toContain("<main");
      });

      it("identifies its one Service entity by the pillar's own /services address (T03)", () => {
        expect(serviceNodes(html)).toHaveLength(1);
        expectServiceIdentity(html, `${ORG_URL}/services/${service.slug}`);
      });
    });
  }

  // Exact sentences pinned in both the visible FAQ and the FAQPage JSON-LD.
  const FAQ_PINS: Record<string, string[]> = {
    "lost-earnings-and-earning-capacity": [
      "What records does a lost earnings analysis need?",
      "How is worklife expectancy chosen?",
    ],
    "wrongful-death-economic-loss": [
      "How is the personal consumption deduction chosen?",
    ],
    "personal-injury-economic-damages": [
      "What does an integrated economic damages report include?",
    ],
    "household-services-valuation": [
      "How are the lost hours of household work determined?",
    ],
    "life-care-plan-cost-projection": [
      "Which growth rate is applied to future medical costs?",
    ],
    "employment-and-wage-loss-damages": [
      "What is the difference between back pay and front pay?",
    ],
    "business-valuation": [
      "Which standard of value applies?",
    ],
    "lost-profits-and-commercial-damages": [
      "How is the period of loss determined?",
    ],
    "fraud-and-asset-tracing": [
      "How is an embezzlement loss quantified?",
      "What records does a fraud and tracing engagement need?",
    ],
    "divorce-and-marital-financial-analysis": [
      "What is a lifestyle analysis?",
    ],
    "expert-rebuttal-and-report-review": [
      "What does a rebuttal review test in an opposing report?",
    ],
  };
  for (const [slug, phrases] of Object.entries(FAQ_PINS)) {
    it(`${slug}: FAQ questions appear in the visible FAQ and the JSON-LD`, () => {
      const { html } = render(slug);
      const visible = faqText(html);
      const ld = faqLdStrings(html).join("\n");
      for (const phrase of phrases) {
        expect(visible).toContain(phrase);
        expect(ld).toContain(phrase);
      }
    });
  }

  // The "by Case Type" intro is visible copy only (no JSON-LD counterpart)
  // and names the work performed, not the loss subject.
  const CASE_TYPE_INTRO_PINS: Record<string, string> = {
    "wrongful-death-economic-loss": "How wrongful death analysis applies to the specific demands of each case type",
    "personal-injury-economic-damages": "How personal injury economic damages analysis applies to the specific demands of each case type",
    "fraud-and-asset-tracing": "How fraud and tracing analysis applies to the specific demands of each case type",
    "business-valuation": "How business valuation applies to the specific demands of each case type",
    "life-care-plan-cost-projection": "How life care plan costing applies to the specific demands of each case type",
    "expert-rebuttal-and-report-review": "How rebuttal analysis applies to the specific demands of each case type",
  };
  for (const [slug, phrase] of Object.entries(CASE_TYPE_INTRO_PINS)) {
    it(`${slug}: the by-Case-Type intro names the work performed`, () => {
      expect(visibleText(render(slug).html)).toContain(phrase);
    });
  }

  it("the fraud pillar's hero lead and sidebar spell out the ampersand", () => {
    const text = visibleText(render("fraud-and-asset-tracing").html);
    expect(text).toContain("prepares fraud and tracing analysis for plaintiff and defense counsel nationwide");
    expect(text).toContain("Qualification to testify on fraud and tracing analysis is decided case by case");
    expect(text).toContain("Fraud & Tracing for Fraud and Embezzlement");
  });

  it("every pillar title fits the 60-character tag and keeps the pillar's keyword", () => {
    for (const service of pillarServices()) {
      const { title } = render(service.slug);
      expect(title.length, service.slug).toBeLessThanOrEqual(60);
      expect(title, service.slug).toContain(service.shortName.split(" ")[0]);
    }
    // The two pillars whose full name cannot fit carry a written titleName.
    expect(render("lost-earnings-and-earning-capacity").title).toBe(`Lost Earnings and Earning Capacity Expert | ${ORG_NAME}`);
    expect(render("life-care-plan-cost-projection").title).toBe(`Life Care Plan Cost Projection Expert | ${ORG_NAME}`);
    expect(render("business-valuation").title).toBe(`Business Valuation Expert | ${ORG_NAME}`);
  });

  it("a non-pillar cross-sell renders the hand-off card, not the pillar body", () => {
    const { html } = render("vocational-evaluation");
    expect(html).toContain("Offered through a sister practice");
    expect(html).not.toContain("by Case Type");
    expect(html).not.toContain("How an expert on this work is qualified");
    expect(html).not.toContain("<main");
  });
});
