import { describe, expect, it, vi } from "vitest";
import CaseTypeHub from "./CaseTypeHub";
import CaseTypeState from "./CaseTypeState";
import { usePageMeta } from "@/hooks/use-page-meta";
import { getCaseType } from "@/data/caseTypes";
import { getStateBySlug } from "@/data/states";
import { placeName } from "@/data/geo-prose.mjs";
import { ORG_NAME } from "@/lib/brand";
import { ORG_URL } from "@/lib/schema";
import { renderRoute, visibleText, faqLdStrings, jsonLdBlocks } from "@/test-utils/markup";

// Site audit 2026-09-05, F08 (57 pages): the divorce hub and its 56 state
// pages carried the shared economic-damages framing ("Divorce and Marital
// Dissolution Economic Damages Analysis", "Where the damages concentrate",
// "Economic damages analysis for divorce and marital dissolution matters in
// Alabama") beside a summary saying the matter is not a damages claim. The
// entry's `framing` block now reaches the title, H1, description, lead,
// section headings, framework block, local FAQ, and Service node on both
// render paths (scripts/prerender-shells.test.mjs pins the shells to these
// renders). Wrongful death stands in for the thirteen entries that keep the
// damages framing.
vi.mock("@/hooks/use-page-meta", () => ({ usePageMeta: vi.fn() }));

const HUB_ROUTE = "/case-types/:slug";
const STATE_ROUTE = "/case-types/:typeSlug/:stateSlug";
const H1 = /<h1[^>]*>([\s\S]*?)<\/h1>/;
const h1Of = (html: string) => visibleText(html.match(H1)?.[1] ?? "").trim();
const h2sOf = (html: string) => [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => visibleText(m[1]).trim());
const h3sOf = (html: string) => [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => visibleText(m[1]).trim());
const DAMAGES_FRAMING = /Economic Damages Analysis|Economic Damages Expert|economic damages in|damages framework|Where the damages concentrate|What the economic claim consists of|Economic damages analysis for/;

function render(path: string, routePath: string, Page: Parameters<typeof renderRoute>[2]) {
  vi.mocked(usePageMeta).mockClear();
  const html = renderRoute(path, routePath, Page);
  const meta = vi.mocked(usePageMeta).mock.calls.at(-1)?.[0];
  return { html, title: meta?.title ?? "", description: meta?.description ?? "", text: visibleText(html) };
}

const divorce = getCaseType("divorce-and-marital-dissolution")!;
const framing = divorce.framing!;

describe("the divorce hub takes the family-law framing", () => {
  const { html, title, description, text } = render("/case-types/divorce-and-marital-dissolution", HUB_ROUTE, CaseTypeHub);

  it("publishes the audit's proposed title, H1, and an income-valuation-tracing description", () => {
    expect(title).toBe(`Divorce Financial Analysis | ${ORG_NAME}`);
    expect(h1Of(html)).toBe("Financial Analysis for Divorce and Marital Dissolution");
    expect(description).toBe(framing.hubDescription);
    expect(description).toMatch(/^Income analysis, business valuation, and funds tracing for divorce and marital dissolution/);
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it("heads its sections for the financial assignment and keeps every damages heading off the page", () => {
    const h2s = h2sOf(html);
    expect(h2s).toContain("What the financial analysis consists of");
    expect(h2s).toContain("Which figures move the result");
    expect(h2s).toContain("How the analysis is built");
    expect(text).not.toMatch(DAMAGES_FRAMING);
    // The summary names the damages claim once, only to say the matter is not one.
    expect(text).toMatch(/rather than a damages claim/);
    expect(jsonLdBlocks(html)).toContain('"headline":"Financial Analysis for Divorce and Marital Dissolution"');
  });
});

describe("a divorce state page takes the family-law framing", () => {
  for (const stateSlug of ["alabama", "district-of-columbia"]) {
    const state = getStateBySlug(stateSlug)!;
    const place = placeName(state.name);
    const url = `${ORG_URL}/case-types/divorce-and-marital-dissolution/${stateSlug}`;
    const { html, title, description, text } = render(`/case-types/divorce-and-marital-dissolution/${stateSlug}`, STATE_ROUTE, CaseTypeState);

    it(`/${stateSlug}: title, H1, description, and lead`, () => {
      expect(title).toBe(stateSlug === "alabama" ? `Divorce Financial Expert in Alabama | ${ORG_NAME}` : `Divorce Financial Expert in DC | ${ORG_NAME}`);
      expect(h1Of(html)).toBe(`Financial Analysis for Divorce and Marital Dissolution in ${place}`);
      expect(description).toBe(framing.stateDescription.replace("{place}", place));
      expect(description.length).toBeLessThanOrEqual(160);
      expect(text).toContain(`${ORG_NAME} prepares financial analyses for divorce and marital dissolution matters venued in ${place}:`);
      expect(text).toContain("either spouse or the court can examine the figures");
      expect(text).not.toContain("Plaintiff and defense");
    });

    it(`/${stateSlug}: framework block, steps intro, local FAQ, and Service node carry no damages framing`, () => {
      expect(h3sOf(html)).toContain("Legal framework");
      expect(h3sOf(html)).not.toContain("Damages framework");
      expect(text).toContain(`Whether ${place} divides marital property equitably or as community property`);
      expect(text).toContain(`the governing framework in ${place} decides how each finding is applied`);
      expect(faqLdStrings(html)).toContain(`How does ${place}'s family-law framework shape the financial analysis?`);
      expect(text).not.toMatch(DAMAGES_FRAMING);
      // The state's expert standard closes on the family-law work, not on a
      // damages report (review fix 2026-10-05).
      expect(text).toContain("A financial analysis for a divorce meets that inquiry");
      expect(`${text} ${faqLdStrings(html).join(" ")}`).not.toMatch(/damages report|An economic damages|lost earnings, household services/);
      expect(text).not.toMatch(/contributory negligence|comparative|prejudgment interest/);
      expect(jsonLdBlocks(html)).toContain(`"description":"${framing.stateDescription.replace("{place}", place)}"`);
      expect(jsonLdBlocks(html)).toContain(`"@id":"${url}#service"`);
      expect(text).not.toMatch(/a the |the the /);
    });
  }
});

// The tax and transfer pricing dispute (2026-10-05) is the second framing
// entry: an arm's length or valuation question rather than a damages claim.
// Its hub and state pages take the framing strings on the hydrated side too,
// and its courts FAQ names the federal tax forums before the state's courts.
const tax = getCaseType("tax-and-transfer-pricing-dispute")!;
const taxFraming = tax.framing!;

describe("the tax and transfer pricing hub takes the arm's length framing", () => {
  const { html, title, description, text } = render("/case-types/tax-and-transfer-pricing-dispute", HUB_ROUTE, CaseTypeHub);

  it("publishes the full-keyword title, the framing H1, and the arm's length description", () => {
    expect(title).toBe(`Tax and Transfer Pricing Dispute Economist | ${ORG_NAME}`);
    expect(h1Of(html)).toBe("Economic Analysis for Tax and Transfer Pricing Disputes");
    expect(description).toBe(taxFraming.hubDescription);
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it("heads its sections for the arm's length assignment and keeps every damages heading off the page", () => {
    const h2s = h2sOf(html);
    expect(h2s).toContain("What the economic analysis consists of");
    expect(h2s).toContain("Which choices move the result");
    expect(h2s).toContain("How the analysis is built");
    expect(text).not.toMatch(DAMAGES_FRAMING);
    expect(jsonLdBlocks(html)).toContain('"headline":"Economic Analysis for Tax and Transfer Pricing Disputes"');
    // The pillars that declare the matter, the transfer pricing pillar among them.
    expect(html).toContain('href="/services/transfer-pricing-expert-witness/case/tax-and-transfer-pricing-dispute"');
  });
});

describe("a tax and transfer pricing state page takes the arm's length framing", () => {
  for (const stateSlug of ["texas", "district-of-columbia"]) {
    const state = getStateBySlug(stateSlug)!;
    const place = placeName(state.name);
    const { html, title, description, text } = render(`/case-types/tax-and-transfer-pricing-dispute/${stateSlug}`, STATE_ROUTE, CaseTypeState);

    it(`/${stateSlug}: title, H1, description, lead, and the courts sentence`, () => {
      expect(title).toBe(stateSlug === "texas" ? `Transfer Pricing Economist in Texas | ${ORG_NAME}` : `Transfer Pricing Economist in DC | ${ORG_NAME}`);
      expect(h1Of(html)).toBe(`Economic Analysis for Tax and Transfer Pricing Disputes in ${place}`);
      expect(description).toBe(taxFraming.stateDescription.replace("{place}", place));
      expect(text).toContain(`${ORG_NAME} prepares the economic analysis in tax and transfer pricing disputes involving businesses in ${place}:`);
      expect(faqLdStrings(html)).toContain(`Which forums hear a tax or transfer pricing dispute involving ${place}?`);
      expect(text).toContain("Federal income tax disputes over related-party prices are heard in the United States Tax Court");
      expect(text).toContain("appeals from the Court of Federal Claims to the Federal Circuit");
      expect(text).toContain(`A dispute over ${place}'s own tax follows its administrative and appeal process.`);
      // The state's appeal closes the state-court clause; no separate
      // sentence sends the federal tax appeals to the state's high court.
      expect(text).not.toContain("Final appeals run to");
      expect(html).toContain(`href="/case-types/divorce-and-marital-dissolution/${stateSlug}"`);
    });

    it(`/${stateSlug}: the forums and the federal evidence rules lead the courts section, and no damages-report sentence prints`, () => {
      expect(h2sOf(html)).toContain(`${state.name} forums and expert standards`);
      expect(h2sOf(html)).not.toContain(`${state.name} courts and expert standards`);
      for (const forum of ["United States Tax Court", "United States District Courts", "United States Court of Federal Claims", `${state.name} tax appeals`]) {
        expect(text, forum).toContain(forum);
      }
      expect(text).toContain("Federal tax forums test expert testimony under the federal rules of evidence, which the Tax Court applies by statute");
      expect(text).not.toMatch(/damages report|An economic damages|lost earnings, household services/);
      expect(faqLdStrings(html).join(" ")).not.toMatch(/damages report|An economic damages/);
    });

    it(`/${stateSlug}: framework block and local FAQ carry no damages framing`, () => {
      expect(h3sOf(html)).toContain("Tax and legal framework");
      expect(h3sOf(html)).not.toContain("Damages framework");
      expect(faqLdStrings(html)).toContain(`Which rules govern a tax or transfer pricing dispute involving ${place}?`);
      expect(text).not.toMatch(DAMAGES_FRAMING);
      expect(text).not.toMatch(/contributory negligence|comparative fault|prejudgment interest/);
      expect(text).not.toMatch(/a the |the the /);
      expect(jsonLdBlocks(html)).toContain(`"description":"${taxFraming.stateDescription.replace("{place}", place)}"`);
    });
  }
});

// Review fix (2026-10-05): the hub's "Related services" lists the first four
// declaring pillars, so the transfer pricing pair, fourth on the commercial
// and shareholder hubs, is linked from its own case-type hub.
describe("the commercial and shareholder hubs link the transfer pricing pair", () => {
  for (const slug of ["commercial-contract-dispute", "partnership-and-shareholder-dispute", "divorce-and-marital-dissolution"]) {
    it(`/case-types/${slug}`, () => {
      const { html } = render(`/case-types/${slug}`, HUB_ROUTE, CaseTypeHub);
      expect(html).toContain(`href="/services/transfer-pricing-expert-witness/case/${slug}"`);
    });
  }
  // The cap moved from four to five (2026-10-06) so the intellectual
  // property pair, fifth on the commercial and shareholder hubs, is linked.
  for (const slug of ["commercial-contract-dispute", "partnership-and-shareholder-dispute"]) {
    it(`/case-types/${slug} links the intellectual property pair`, () => {
      const { html } = render(`/case-types/${slug}`, HUB_ROUTE, CaseTypeHub);
      expect(html).toContain(`href="/services/intellectual-property-damages/case/${slug}"`);
    });
  }
});

// Intellectual property infringement (2026-10-06) is a damages claim heard
// first in the federal courts: the hub and state pages keep the shared damages
// title, H1s, and headings, and the venue framing replaces the state-court
// forum, the state damages rules, and the present value the shared strings
// would print. The courts answer names the federal district courts first, the
// Federal Circuit for patent appeals, the regional circuit otherwise, and then
// the state's courts, and carries no second federal sentence.
const ip = getCaseType("intellectual-property-infringement")!;
const ipVenue = ip.venueFraming!;

describe("the intellectual property hub keeps the damages framing and drops the present value", () => {
  const { html, title, description, text } = render("/case-types/intellectual-property-infringement", HUB_ROUTE, CaseTypeHub);

  it("publishes the full-keyword title, the damages H1, and its own description", () => {
    expect(title).toBe(`Intellectual Property Infringement Economist | ${ORG_NAME}`);
    expect(h1Of(html)).toBe("Intellectual Property Infringement Economic Damages Analysis");
    expect(description).toBe(ipVenue.hubDescription);
    expect(description.length).toBeGreaterThanOrEqual(140);
    expect(description.length).toBeLessThanOrEqual(160);
    expect(description).not.toMatch(/present value/);
  });

  it("heads its sections as a damages claim and links every declaring pillar's pair page", () => {
    const h2s = h2sOf(html);
    expect(h2s).toContain("What the economic claim consists of");
    expect(h2s).toContain("Where the damages concentrate");
    expect(text).toContain("the reasonable royalty that is the floor of every patent award");
    for (const pillar of ["intellectual-property-damages", "lost-profits-and-commercial-damages", "business-valuation", "expert-rebuttal-and-report-review"]) {
      expect(html, pillar).toContain(`href="/services/${pillar}/case/intellectual-property-infringement"`);
    }
    expect(text).not.toMatch(/Skerritt[^,]*(testified|retained)|\bverdict|\$\d/);
  });
});

describe("an intellectual property state page names the federal courts first", () => {
  for (const stateSlug of ["texas", "district-of-columbia", "guam", "american-samoa", "delaware"]) {
    const state = getStateBySlug(stateSlug)!;
    const place = placeName(state.name);
    const url = `${ORG_URL}/case-types/intellectual-property-infringement/${stateSlug}`;
    const { html, title, description, text } = render(`/case-types/intellectual-property-infringement/${stateSlug}`, STATE_ROUTE, CaseTypeState);
    const faqs = faqLdStrings(html);
    const courtsAnswer = faqs[faqs.indexOf(`Which courts hear an intellectual property infringement case involving ${place}?`) + 1] ?? "";

    it(`/${stateSlug}: title, H1, description, and lead`, () => {
      expect(title).toMatch(/^IP Infringement Economist in /);
      expect(h1Of(html)).toBe(`Intellectual Property Infringement Economic Damages Expert in ${place}`);
      expect(description).toBe(ipVenue.stateDescription.replace("{place}", place));
      expect(description.length).toBeGreaterThanOrEqual(140);
      expect(description.length).toBeLessThanOrEqual(160);
      expect(text).toContain(`${ORG_NAME} prepares economic damages analyses for intellectual property infringement cases involving ${place}:`);
      expect(text).not.toMatch(/damages rules and venues|a present value built/);
      expect(jsonLdBlocks(html)).toContain(`"@id":"${url}#service"`);
    });

    it(`/${stateSlug}: the courts answer runs federal district court, Federal Circuit, regional circuit, then the state's courts, with no second federal sentence`, () => {
      expect(courtsAnswer).toMatch(/^Patent and copyright claims arise under federal law that only the federal courts may hear/);
      expect(courtsAnswer).toContain("United States Court of Appeals for the Federal Circuit");
      expect(courtsAnswer).not.toContain("Matters within federal jurisdiction proceed in");
      expect(courtsAnswer).not.toMatch(/cases venued in .* are heard in/);
      if (stateSlug === "american-samoa") {
        expect(courtsAnswer).toContain("American Samoa has no federal district court of its own");
        expect(courtsAnswer).not.toMatch(/Ninth Circuit|District Court of American Samoa \(/);
      } else {
        const federal = courtsAnswer.indexOf("United States District Court");
        const fedCircuit = courtsAnswer.indexOf("Federal Circuit");
        const regional = courtsAnswer.search(/Court of Appeals for the (First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|District of Columbia) Circuit/);
        const stateCourts = courtsAnswer.indexOf(`Claims under ${place.replace(/^the /, "")} law`);
        expect(federal).toBeGreaterThan(-1);
        expect(federal).toBeLessThan(fedCircuit);
        expect(fedCircuit).toBeLessThan(regional);
        expect(regional).toBeLessThan(stateCourts);
      }
      // No claim about the trade secret law of Guam or American Samoa.
      if (stateSlug === "guam" || stateSlug === "american-samoa") {
        expect(courtsAnswer.slice(courtsAnswer.indexOf("Claims under"))).not.toMatch(/trade secret|unfair competition/);
      } else {
        expect(courtsAnswer).toContain("such as trade secret misappropriation, unfair competition, and disputes over royalties owed under a license");
      }
    });

    it(`/${stateSlug}: the venue list leads with the federal courts and the framework block names the federal statutes`, () => {
      const juris = html.slice(html.indexOf('id="jurisdictional-notes"'), html.indexOf('id="analysis"'));
      const listed = [...juris.matchAll(/<li><strong>([^<]+)<\/strong>/g)].map((m) => m[1]);
      if (stateSlug === "american-samoa") {
        expect(listed[0]).toBe("United States Court of Appeals for the Federal Circuit");
      } else {
        expect(listed[0]).toMatch(/^United States District Courts? (for the |of )/);
        expect(listed[1]).toBe("United States Court of Appeals for the Federal Circuit");
        expect(listed[2]).toMatch(/^United States Court of Appeals for the .* Circuit$/);
      }
      expect(listed.length).toBeLessThanOrEqual(5);
      expect(h3sOf(html)).toContain("Damages framework");
      expect(text).toContain("Patent, copyright, and trademark damages are set by federal statute, so the measures are the same in every district");
      expect(text).toContain("In the federal district courts, which hear every patent and copyright claim, damages testimony is tested under the federal rules of evidence");
      expect(faqs).toContain(`Which damages rules apply to an intellectual property claim involving ${place}?`);
      expect(text).not.toMatch(/contributory negligence|comparative fault|collateral source|An economic damages report|lost earnings, household services/);
      expect(text).not.toMatch(/a the |the the |in District of Columbia/);
    });
  }
});

describe("the other case types keep the economic-damages framing", () => {
  it("wrongful death hub and state page", () => {
    const hub = render("/case-types/wrongful-death", HUB_ROUTE, CaseTypeHub);
    expect(hub.title).toBe(`Wrongful Death Economist | ${ORG_NAME}`);
    expect(h1Of(hub.html)).toBe("Wrongful Death Economic Damages Analysis");
    expect(h2sOf(hub.html)).toContain("Where the damages concentrate");
    const nj = render("/case-types/wrongful-death/new-jersey", STATE_ROUTE, CaseTypeState);
    expect(nj.title).toBe(`Wrongful Death Economist in New Jersey | ${ORG_NAME}`);
    expect(h1Of(nj.html)).toBe("Wrongful Death Economic Damages Expert in New Jersey");
    expect(nj.description).toBe("Wrongful Death economic damages in New Jersey: loss components, state damages rules and venues, and how the number is built.");
    expect(h3sOf(nj.html)).toContain("Damages framework");
    expect(faqLdStrings(nj.html)).toContain("How does New Jersey's damages framework shape the economic analysis?");
    expect(jsonLdBlocks(nj.html)).toContain('"description":"Economic damages analysis for wrongful death matters in New Jersey."');
  });
});
