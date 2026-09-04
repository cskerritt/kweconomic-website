import { describe, it, expect, vi } from "vitest";
import type { City } from "@/types";
import ServiceState from "./ServiceState";
import ServiceStateCity from "./ServiceStateCity";
import StateHub from "./StateHub";
import { usePageMeta } from "@/hooks/use-page-meta";
import { pillarServices } from "@/data/services";
import { getStateBySlug } from "@/data/states";
import { getRegulationsByState } from "@/data/regulations/state-regs";
import { newJerseyCities } from "@/data/cities/new-jersey";
import { texasCities } from "@/data/cities/texas";
import { newYorkCities } from "@/data/cities/new-york";
import { REFERENCES } from "@/data/references";
import {
  getStateNarrative,
  serviceCityContextParagraph,
  serviceStateDirectAnswer,
  serviceStateVenueParagraph,
} from "@/data/narratives";
import { cityAttr, placeAttr, placeName } from "@/data/geo-prose.mjs";
import { ORG_NAME } from "@/lib/brand";
import { serviceStateTitle, serviceCityTitle, stateHubTitle } from "@/lib/page-titles.mjs";
import { truncateAtWord } from "@/lib/text";
import { proseName, workPhrase } from "@/lib/service-prose.mjs";
import {
  renderRoute,
  visibleText,
  faqText,
  faqLdStrings,
  jsonLdBlocks,
  excerpt,
  DOUBLED_WORD,
  MIS_ARTICLE,
} from "@/test-utils/markup";

// Server renders of the service x state, service x city, and state hub pages.
//
// Both service pages carry an "Expert Credentials" sidebar that prints the
// service's relevantCredentials chips (Forensic Economist, NAFE, AAEFE, MBA,
// PhD) under a templated sentence built from Service.shortName. Two things
// that sentence must never do:
// - assert that the firm's experts hold the chips as certifications. The
//   roster (src/data/team.ts) lists no PhD, and NAFE/AAEFE membership is a
//   facts-to-confirm item that the credentials hub itself calls an
//   affiliation, not a certification (spec 4.3). The chips are qualifications
//   that bear on the work, so the sentence says exactly that.
// - carry the short name's ampersand into running prose ("fraud & tracing
//   testimony"). Headings keep "Fraud & Tracing"; sentences go through
//   proseName().
//
// The hero sentence, the Service JSON-LD description, the meta description,
// and the first geo FAQ all name the work the pillar performs (workPhrase:
// "wrongful death analysis"), never the short or full name as the thing
// supplied ("Wrongful Death from KW Economics", "provides Wrongful Death
// Economic Loss"). And every slot after in/across/throughout reads the
// District of Columbia with its article, as the H1 already does.
//
// Each pillar carries its own angle after the hero's first sentence (the
// records that drive it and how its number is built), its own venue or
// damages-framework paragraph, its own city context paragraph, its own
// References block, and, on the commercial pillars and rebuttal, its own
// second city FAQ; the meta description is the hero cut at a word, as in the
// static shells. The credential chips link the credential x state pages.
//
// The Bronx is the one prerendered city whose name carries its own article,
// so the attributive slots ("wage data for the Bronx area", "for Bronx
// cases") go through cityAttr() while the headings keep "The Bronx"; the
// doubled-word guard runs over the whole visible page for every sampled city
// so "the The Bronx" cannot come back in any paragraph.
//
// ServiceStateCity resolves its city from useStateCities, an effect-driven
// per-state chunk load that never settles under renderToStaticMarkup (the
// page would render <Loading /> forever). The hook is replaced with a
// synchronous lookup over three real state files so the full body renders.
// usePageMeta writes the <head> from an effect that never runs either, so it
// is replaced with a spy and the meta each page would publish is read back.
vi.mock("@/hooks/use-state-cities", async () => {
  const { newJerseyCities } = await import("@/data/cities/new-jersey");
  const { texasCities } = await import("@/data/cities/texas");
  const { districtOfColumbiaCities } = await import("@/data/cities/district-of-columbia");
  const { newYorkCities } = await import("@/data/cities/new-york");
  const BY_STATE: Record<string, City[]> = {
    "new-jersey": newJerseyCities,
    texas: texasCities,
    "district-of-columbia": districtOfColumbiaCities,
    "new-york": newYorkCities,
  };
  return {
    useStateCities: (stateSlug?: string) => ({
      cities: (stateSlug && BY_STATE[stateSlug]) || [],
      loading: false,
    }),
  };
});
vi.mock("@/hooks/use-page-meta", () => ({ usePageMeta: vi.fn() }));

const STATE_ROUTE = "/services/:serviceSlug/:stateSlug";
const CITY_ROUTE = "/services/:serviceSlug/:stateSlug/:citySlug";
const HUB_ROUTE = "/locations/:stateSlug";

interface Rendered { html: string; title: string; description: string }

/** Render the page and read back the meta it would publish. */
function render(path: string, routePath: string, Page: Parameters<typeof renderRoute>[2]): Rendered {
  vi.mocked(usePageMeta).mockClear();
  const html = renderRoute(path, routePath, Page);
  const meta = vi.mocked(usePageMeta).mock.calls.at(-1)?.[0];
  return { html, title: meta?.title ?? "", description: meta?.description ?? "" };
}

// Any sentence that has someone holding a certification, and any phrasing
// that attributes a credential or membership to the firm's experts as a
// group. "|" is the element delimiter visibleText() inserts, so a verb and a
// noun in different elements can never chain into a match.
const CERTIFICATION_CLAIM = /\b(hold|holds|holding|held)\b[^.|]{0,60}\bcertif/i;
const FIRM_LEVEL_CLAIM = /\b(our|KW Economics) [a-z& ]{0,40}(experts|economists) (hold|holds|belong|are certified|are members)/i;

// "in District of Columbia" as a place (followed by punctuation or the end of
// its element); attributive uses ("in District of Columbia courts") are fine.
const RAW_DC = /\b(in|throughout|across|on) District of Columbia(?=[.?!:,;]| \||$)/;

// The sentence that introduces the credential chips, read as the visitor
// reads it.
function credentialsIntro(html: string): string {
  const m = html.match(/Expert Credentials<\/h3><p[^>]*>([\s\S]*?)<\/p>/);
  return m ? visibleText(m[1]).trim() : "";
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Every way a template could print a service name as the thing supplied.
 * The lowercased full name is a seam only where it is not the work phrase
 * itself (for Business Valuation the two coincide) or its opening words
 * ("provides personal injury economic damages analysis" is the work;
 * "provides personal injury economic damages for" is the seam). */
function rawServiceSeams(service: { name: string; shortName: string }): RegExp[] {
  const seams = [
    new RegExp(`provides? ${escapeRe(service.name)}`),
    new RegExp(`provides? ${escapeRe(service.shortName)}`),
    new RegExp(`${escapeRe(service.shortName)} from ${escapeRe(ORG_NAME)}`),
  ];
  const lowered = service.name.toLowerCase();
  const work = workPhrase(service.shortName);
  const rest = work.startsWith(lowered) ? work.slice(lowered.length) : undefined;
  // "(?!)" never matches, so a full name that is the work phrase adds no seam.
  seams.push(new RegExp(`provides ${escapeRe(lowered)}(?!${rest === undefined ? "" : escapeRe(rest)})`));
  return seams;
}

const STATES = ["new-jersey", "texas"] as const;
const CITIES = [
  { stateSlug: "new-jersey", citySlug: "hackensack", cityName: "Hackensack" },
  { stateSlug: "texas", citySlug: "houston", cityName: "Houston" },
  { stateSlug: "new-york", citySlug: "the-bronx", cityName: "The Bronx" },
] as const;
const CITY_ROWS: Record<string, City> = Object.fromEntries(
  [...newJerseyCities, ...texasCities, ...newYorkCities].map((c) => [`${c.stateSlug}/${c.slug}`, c]),
);

// The pillars whose state page prints the state's tort damages framework and
// workers' compensation forum; the others print a forum paragraph of their own.
const TORT_FRAMEWORK_PILLARS = new Set([
  "lost-earnings-and-earning-capacity",
  "wrongful-death-economic-loss",
  "personal-injury-economic-damages",
  "household-services-valuation",
  "life-care-plan-cost-projection",
]);
// The pillars whose second city FAQ asks about wage levels and cost of living.
const WAGE_FAQ_PILLARS = new Set([...TORT_FRAMEWORK_PILLARS, "employment-and-wage-loss-damages"]);

// The credential x state page each chip label links to (services.ts labels ->
// credentials.ts slugs). PhD and MBA both resolve to the graduate-degree page.
const CREDENTIAL_PAGE: Record<string, string> = {
  "Forensic Economist": "/credentials/forensic-economist",
  NAFE: "/credentials/nafe-member",
  AAEFE: "/credentials/aaefe-member",
  MBA: "/credentials/graduate-economics-degree",
  PhD: "/credentials/graduate-economics-degree",
};

/** Visible text of every <p> on the page, one entry per paragraph. */
function paragraphs(html: string): string[] {
  return [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => visibleText(m[1]).trim());
}

function expectCredentialLinks(html: string, labels: readonly string[], stateSlug: string): void {
  for (const cred of labels) {
    const path = CREDENTIAL_PAGE[cred];
    expect(path, `no credential page mapped for chip "${cred}"`).toBeDefined();
    expect(html).toMatch(new RegExp(`<a [^>]*href="${escapeRe(`${path}/${stateSlug}`)}"[^>]*>${escapeRe(cred)}</a>`));
  }
}

describe("ServiceState hero, meta, credentials sidebar, and FAQ prose", () => {
  for (const service of pillarServices()) {
    const work = workPhrase(service.shortName);
    for (const stateSlug of STATES) {
      const state = getStateBySlug(stateSlug)!;
      const place = placeName(state.name);
      describe(`/services/${service.slug}/${stateSlug}`, () => {
        const { html, title, description } = render(`/services/${service.slug}/${stateSlug}`, STATE_ROUTE, ServiceState);
        const intro = credentialsIntro(html);
        const text = visibleText(html);

        it("renders the page body with its credential chips", () => {
          expect(html).toContain("Expert Credentials");
          for (const cred of service.relevantCredentials) expect(html).toContain(`>${cred}<`);
        });

        it("names the work the pillar performs in the hero, the Service JSON-LD, and the meta description", () => {
          const hero = `${ORG_NAME} provides ${work} for matters venued in ${place}.`;
          expect(text).toContain(hero);
          expect(jsonLdBlocks(html)).toContain(hero);
          // The shared builder: the heading label ("Fraud and Tracing") with
          // the full place name wherever it fits the tag, the titleShortName
          // where it cannot, and the abbreviation only where no label fits.
          expect(title).toBe(serviceStateTitle(service, state, ORG_NAME));
          expect(title.length).toBeLessThanOrEqual(60);
          expect(title).not.toContain("&");
          // The description is the hero cut at a word, as on the city page and
          // in the static shells, so it names this pillar's subject and never
          // the generic "lost earnings, household services, and business
          // damages" list every pillar once carried.
          const stateHero = serviceStateDirectAnswer(ORG_NAME, service.shortName, state.name, getStateNarrative(state));
          expect(description).toBe(truncateAtWord(stateHero));
          expect(description.startsWith(hero)).toBe(true);
          expect(description).not.toContain("measuring lost earnings, household services, and business damages");
          for (const seam of rawServiceSeams(service)) {
            expect(text).not.toMatch(seam);
            expect(description).not.toMatch(seam);
            expect(jsonLdBlocks(html)).not.toMatch(seam);
          }
        });

        it("opens the body with an H2 that says what the section explains and prints this pillar's forum paragraph", () => {
          const label = service.shortName.replace("&", "&amp;");
          expect(html).toContain(`How ${label} Work Is Built for ${placeAttr(state.name)} Cases`);
          // The H1 text is not repeated as the first H2.
          expect(html).not.toContain(`mb-4">${label} in ${place}</h2>`);
          const venue = serviceStateVenueParagraph(service, state);
          const regs = getRegulationsByState(state.slug)!;
          if (TORT_FRAMEWORK_PILLARS.has(service.slug)) {
            expect(venue).toBeUndefined();
            expect(text).toContain(regs.damagesContext);
            expect(text).toContain("Outside the civil courts, wage-loss disputes in workers' compensation matters proceed before the");
            expect(text).toContain(regs.compensationForum);
          } else {
            expect(venue).toBeDefined();
            expect(text).toContain(venue!);
            expect(text).not.toContain(regs.damagesContext);
            expect(text).not.toContain("Outside the civil courts, wage-loss disputes");
          }
        });

        it("answers the disclosure FAQ instead of restating the question, in the visible block and the FAQPage JSON-LD", () => {
          const question = `When is expert disclosure due for a case venued in ${place}?`;
          expect(faqText(html)).toContain(question);
          expect(faqLdStrings(html)).toContain(question);
          expect(faqText(html)).toContain(
            `Expert disclosure in ${place} is scheduled case by case: in the ${placeAttr(state.name)} trial courts by the case management or scheduling order, and in the federal district courts serving ${place} by the federal expert-disclosure framework,`,
          );
          expect(faqText(html)).not.toContain("Disclosure timing is typically set by the scheduling order in the case.");
        });

        it("links each credential chip to its credential x state page, renders a References block, and nests no second main landmark", () => {
          expectCredentialLinks(html, service.relevantCredentials, state.slug);
          expect(html).toContain("References</h2>");
          expect(html).not.toContain("<main");
        });

        it("asks the first geo FAQ about the work, in the visible block and the FAQPage JSON-LD", () => {
          const question = `Does ${ORG_NAME} provide ${work} in ${place}?`;
          expect(faqText(html)).toContain(question);
          expect(faqLdStrings(html)).toContain(question);
          expect(faqText(html)).toContain(`Yes. ${ORG_NAME} provides ${work} for attorneys handling matters venued in ${place},`);
          for (const s of faqLdStrings(html)) for (const seam of rawServiceSeams(service)) expect(s).not.toMatch(seam);
        });

        it("introduces the chips as qualifications that bear on the testimony, not as held certifications", () => {
          expect(intro).toBe(
            `Qualifications and standards that bear on ${proseName(service.shortName)} testimony in ${place}:`,
          );
          expect(text).not.toMatch(CERTIFICATION_CLAIM);
          expect(text).not.toMatch(FIRM_LEVEL_CLAIM);
        });

        it("spells out ampersands in the sentences and the FAQ prose (headings may keep them)", () => {
          expect(intro).not.toContain("&");
          expect(description).not.toContain("&");
          expect(faqText(html)).not.toContain("&");
          for (const s of faqLdStrings(html)) expect(s).not.toContain("&");
        });

        it("never doubles a word or misplaces an article in the templated sentences", () => {
          for (const t of [intro, description, faqText(html)]) {
            expect(excerpt(t, DOUBLED_WORD)).toBeUndefined();
            expect(excerpt(t, MIS_ARTICLE)).toBeUndefined();
          }
        });
      });
    }
  }
});

describe("ServiceStateCity hero, meta, credentials sidebar, FAQ, and cross-link prose", () => {
  for (const service of pillarServices()) {
    const work = workPhrase(service.shortName);
    for (const { stateSlug, citySlug, cityName } of CITIES) {
      const state = getStateBySlug(stateSlug)!;
      const place = placeName(state.name);
      describe(`/services/${service.slug}/${stateSlug}/${citySlug}`, () => {
        const { html, title, description } = render(
          `/services/${service.slug}/${stateSlug}/${citySlug}`,
          CITY_ROUTE,
          ServiceStateCity,
        );
        const intro = credentialsIntro(html);
        const text = visibleText(html);

        it("renders the page body (not the loading placeholder) with its credential chips", () => {
          expect(html).not.toContain("Loading...");
          // The H1 keeps the short name as written; static markup escapes its "&".
          expect(html).toContain(`${service.shortName.replace("&", "&amp;")}</span> in ${cityName},`);
          expect(html).toContain("Expert Credentials");
          for (const cred of service.relevantCredentials) expect(html).toContain(`>${cred}<`);
        });

        it("names the work the pillar performs in the hero, the Service JSON-LD, and the meta description", () => {
          const hero = `${ORG_NAME} provides ${work} for cases venued in ${cityName}, ${place}.`;
          expect(text).toContain(hero);
          expect(jsonLdBlocks(html)).toContain(hero);
          // The shared builder: the title label, the city, and the state
          // abbreviation wherever it fits the tag.
          expect(title).toBe(serviceCityTitle(service, { name: cityName }, state, ORG_NAME));
          expect(title.length).toBeLessThanOrEqual(60);
          expect(description.startsWith(`${ORG_NAME} provides ${work} for cases venued in ${cityName}, `)).toBe(true);
          for (const seam of rawServiceSeams(service)) {
            expect(text).not.toMatch(seam);
            expect(description).not.toMatch(seam);
            expect(jsonLdBlocks(html)).not.toMatch(seam);
          }
        });

        it("asks the first geo FAQ about the work, in the visible block and the FAQPage JSON-LD", () => {
          const question = `Does ${ORG_NAME} provide ${work} in ${cityName}, ${place}?`;
          expect(faqText(html)).toContain(question);
          expect(faqLdStrings(html)).toContain(question);
          for (const s of faqLdStrings(html)) for (const seam of rawServiceSeams(service)) expect(s).not.toMatch(seam);
        });

        it("names the work in the nearby-cities cross-link sentence and the local-context paragraph", () => {
          expect(text).toContain(`We also provide ${work} in these ${state.name} communities.`);
          expect(text).toContain(
            `requirements that affect ${proseName(service.shortName)} engagements in ${place}.`,
          );
        });

        it("reads the city name attributively where it modifies a noun and as written elsewhere", () => {
          const attr = cityAttr(cityName);
          expect(text).toContain(`serves counsel throughout ${cityName} and the surrounding`);
          expect(text).toContain(`Other Services in ${cityName}`);
          expect(text).toContain(`offers complementary economic damages services for ${attr} cases.`);
          expect(faqText(html)).toContain(`common to ${attr} matters.`);
          expect(html).toContain(`How ${service.shortName.replace("&", "&amp;")} Work Is Built for ${attr} Cases`);
        });

        it("names what this pillar measures in the city context paragraph, under an H2 that does not repeat the H1", () => {
          const city = CITY_ROWS[`${stateSlug}/${citySlug}`];
          const paragraph = serviceCityContextParagraph(service, state, city);
          expect(paragraph.startsWith(`${ORG_NAME} serves counsel throughout ${cityName} and the surrounding ${city.county} area. Our economists `)).toBe(true);
          expect(text).toContain(paragraph);
          expect(html).not.toContain(`mb-4">${service.shortName.replace("&", "&amp;")} in ${cityName}</h2>`);
          // Only the pillars that measure earnings say so; a valuation, tracing,
          // or rebuttal page never claims to measure household services.
          if (!WAGE_FAQ_PILLARS.has(service.slug)) expect(paragraph).not.toContain("household services");
        });

        it("asks the second FAQ about wage levels on the injury, death, household, life-care, and employment pillars and about the pillar's own records elsewhere", () => {
          const wageQuestion = `How are ${cityAttr(cityName)} wage levels and cost of living handled in the analysis?`;
          if (WAGE_FAQ_PILLARS.has(service.slug)) {
            expect(faqText(html)).toContain(wageQuestion);
            expect(faqLdStrings(html)).toContain(wageQuestion);
          } else {
            expect(faqText(html)).not.toContain(wageQuestion);
            expect(faqText(html)).not.toContain("wage levels");
          }
        });

        it("links each credential chip to its credential x state page, renders a References block, and nests no second main landmark", () => {
          expectCredentialLinks(html, service.relevantCredentials, state.slug);
          expect(html).toContain("References</h2>");
          expect(html).not.toContain("<main");
        });

        it("introduces the chips as qualifications that bear on the testimony, not as held certifications", () => {
          expect(intro).toBe(
            `Qualifications and standards that bear on ${proseName(service.shortName)} testimony in ${cityName}:`,
          );
          expect(text).not.toMatch(CERTIFICATION_CLAIM);
          expect(text).not.toMatch(FIRM_LEVEL_CLAIM);
        });

        it("spells out ampersands in the sentences and the FAQ prose (headings may keep them)", () => {
          expect(intro).not.toContain("&");
          expect(description).not.toContain("&");
          expect(faqText(html)).not.toContain("&");
          for (const s of faqLdStrings(html)) expect(s).not.toContain("&");
        });

        it("never doubles a word or misplaces an article in the templated sentences", () => {
          for (const t of [intro, description, faqText(html)]) {
            expect(excerpt(t, DOUBLED_WORD)).toBeUndefined();
            expect(excerpt(t, MIS_ARTICLE)).toBeUndefined();
          }
          // The whole visible page, so a seam in any paragraph ("the The
          // Bronx area") is caught, not only the sentences pinned above.
          expect(excerpt(text, DOUBLED_WORD)).toBeUndefined();
        });
      });
    }
  }

  // Exact sentences for the pillars the seams were reported on, so a
  // regression names the page and the words.
  it("prints the fraud and wrongful death pillars' sentences as prose in both tiers", () => {
    const fraudState = render("/services/fraud-and-asset-tracing/texas", STATE_ROUTE, ServiceState);
    expect(credentialsIntro(fraudState.html)).toBe(
      "Qualifications and standards that bear on fraud and tracing testimony in Texas:",
    );
    expect(visibleText(fraudState.html)).toContain(
      "KW Economics provides fraud and tracing analysis for matters venued in Texas.",
    );
    expect(visibleText(fraudState.html)).not.toContain("Fraud & Tracing from KW Economics");
    expect(faqText(fraudState.html)).toContain("Does KW Economics provide fraud and tracing analysis in Texas?");

    const fraudCity = render("/services/fraud-and-asset-tracing/new-jersey/hackensack", CITY_ROUTE, ServiceStateCity);
    expect(credentialsIntro(fraudCity.html)).toBe(
      "Qualifications and standards that bear on fraud and tracing testimony in Hackensack:",
    );
    expect(fraudCity.description.startsWith("KW Economics provides fraud and tracing analysis for cases venued in Hackensack, New Jersey.")).toBe(true);

    const wdCity = render("/services/wrongful-death-economic-loss/texas/houston", CITY_ROUTE, ServiceStateCity);
    expect(visibleText(wdCity.html)).toContain(
      "KW Economics provides wrongful death analysis for cases venued in Houston, Texas.",
    );
    expect(faqText(wdCity.html)).toContain(
      "Yes. KW Economics provides wrongful death analysis for attorneys handling matters venued in Houston, Texas",
    );
    expect(faqText(wdCity.html)).not.toContain("Wrongful Death Economic Loss in Houston");
    expect(visibleText(wdCity.html)).toContain("We also provide wrongful death analysis in these Texas communities.");
  });

  // The business valuation page in a place answers a business valuation
  // question: its hero, forum paragraph, city context paragraph, second FAQ,
  // and References are its own, and it shares only the place-level paragraphs
  // with the lost earnings page in the same place.
  it("gives the business valuation pages their own subject in every body block", () => {
    const bvState = render("/services/business-valuation/new-jersey", STATE_ROUTE, ServiceState);
    const bvText = visibleText(bvState.html);
    expect(bvText).toContain(
      "KW Economics provides business valuation for matters venued in New Jersey. The business is valued from its own financial statements, tax returns, and governing agreements under the income, market, and asset approaches,",
    );
    expect(bvText).toContain("Valuation disputes arising in New Jersey reach the civil courts through shareholder, partnership, and buy-sell litigation,");
    expect(bvText).toContain("How Business Valuation Work Is Built for New Jersey Cases");
    expect(bvText).not.toContain(getRegulationsByState("new-jersey")!.damagesContext);
    expect(bvText).not.toContain("Fringe benefits, worklife expectancy, wage growth, and the discount rate are each documented");
    expect(bvState.description.startsWith("KW Economics provides business valuation for matters venued in New Jersey. The business is valued from its own financial statements,")).toBe(true);
    expect(faqText(bvState.html)).toContain("(financial statements, tax returns, the general ledger, and the governing agreements)");
    expect(bvState.html).toContain(`href="${REFERENCES.AICPA_SSVS1.url}"`);
    expect(bvState.html).toContain(`href="${REFERENCES.NACVA_STANDARDS.url}"`);
    expect(bvState.html).not.toContain(`href="${REFERENCES.BLS_OES.url}"`);

    const leState = render("/services/lost-earnings-and-earning-capacity/new-jersey", STATE_ROUTE, ServiceState);
    const leText = visibleText(leState.html);
    expect(leText).toContain(
      "KW Economics provides lost earnings analysis for matters venued in New Jersey. The projection starts from the plaintiff's own earnings history, tests it against occupational wage data from the Bureau of Labor Statistics for the metropolitan or nonmetropolitan area of New Jersey where the plaintiff worked,",
    );
    expect(leText).toContain(getRegulationsByState("new-jersey")!.damagesContext);
    expect(leState.html).toContain(`href="${REFERENCES.BLS_OES.url}"`);
    expect(leState.html).toContain(`href="${REFERENCES.SKOOG_CIECKA_KRUEGER_2011.url}"`);

    const bvCity = render("/services/business-valuation/new-jersey/hackensack", CITY_ROUTE, ServiceStateCity);
    const bvCityText = visibleText(bvCity.html);
    expect(bvCityText).toContain(
      "KW Economics provides business valuation for cases venued in Hackensack, New Jersey. For a business based in Hackensack, the Hackensack-area market for its goods and services, comparable transactions, and the company's own history each enter the analysis,",
    );
    expect(bvCityText).toContain("Civil claims arising in Hackensack are typically heard in the Superior Court, Law Division sitting in Bergen County.");
    expect(bvCityText).toContain("How Business Valuation Work Is Built for Hackensack Cases");
    expect(bvCityText).toContain(
      "Our economists value the business from its own financial statements, tax returns, and governing agreements and from the Hackensack-area market it serves, and are familiar with the court system and disclosure requirements that affect business valuation engagements in New Jersey.",
    );
    expect(faqText(bvCity.html)).toContain("What data does a valuation of a business based in Hackensack rest on?");
    expect(faqText(bvCity.html)).not.toContain("How are Hackensack wage levels and cost of living handled in the analysis?");
    expect(bvCity.description.startsWith("KW Economics provides business valuation for cases venued in Hackensack, New Jersey. For a business based in Hackensack,")).toBe(true);

    const leCity = render("/services/lost-earnings-and-earning-capacity/new-jersey/hackensack", CITY_ROUTE, ServiceStateCity);
    expect(visibleText(leCity.html)).toContain(
      "Our economists measure lost earnings, fringe benefits, and post-injury earning capacity against wage data for the Hackensack area and the plaintiff's own records,",
    );
    expect(faqText(leCity.html)).toContain("How are Hackensack wage levels and cost of living handled in the analysis?");

    // Sibling service pages in the same city share only the place-level
    // paragraphs (the city narrative, the sibling-services intro, the
    // deliverables FAQ, the CTA); the hero, context, and second FAQ differ.
    const shared = paragraphs(bvCity.html).filter((p) => p && paragraphs(leCity.html).includes(p));
    expect(shared.length).toBeLessThanOrEqual(4);
    for (const p of shared) {
      expect(p).not.toContain("provides business valuation");
      expect(p).not.toContain("Our economists ");
      expect(p).not.toContain("wage levels");
    }
  });

  it("drops The Bronx's article in the attributive slots and keeps it in the headings and venue slots", () => {
    const { html, description } = render(
      "/services/wrongful-death-economic-loss/new-york/the-bronx",
      CITY_ROUTE,
      ServiceStateCity,
    );
    const text = visibleText(html);
    expect(html).not.toContain("Loading...");
    expect(text).toContain("in The Bronx, NY");
    expect(text).toContain("Wrongful Death in The Bronx");
    expect(text).toContain("Other Services in The Bronx");
    expect(text).toContain("KW Economics provides wrongful death analysis for cases venued in The Bronx, New York.");
    expect(text).toContain("serves counsel throughout The Bronx and the surrounding Bronx County area.");
    expect(text).toContain("against wage data for the Bronx area and the decedent's own records");
    expect(text).toContain("For a death case arising in The Bronx, the decedent's earnings are measured against Bronx-area wage data and the decedent's own records,");
    expect(text).toContain("How Wrongful Death Work Is Built for Bronx Cases");
    expect(text).toContain("KW Economics offers complementary economic damages services for Bronx cases.");
    expect(faqText(html)).toContain("Does KW Economics provide wrongful death analysis in The Bronx, New York?");
    expect(faqText(html)).toContain("How are Bronx wage levels and cost of living handled in the analysis?");
    expect(text).not.toContain("the The Bronx");
    expect(text).not.toContain("for The Bronx cases");
    expect(excerpt(text, DOUBLED_WORD)).toBeUndefined();
    expect(excerpt(description, DOUBLED_WORD)).toBeUndefined();
  });
});

// The District of Columbia is the one place name that takes an article after
// in/across/throughout. The H1 already reads "in the District of Columbia";
// every other slot on the same page has to agree with it.
describe("District of Columbia place name on the geo templates", () => {
  it("placeName carries the article for the District alone", () => {
    expect(placeName(getStateBySlug("district-of-columbia")!.name)).toBe("the District of Columbia");
    expect(placeName("Texas")).toBe("Texas");
  });

  for (const service of pillarServices()) {
    it(`/services/${service.slug}/district-of-columbia reads the District with its article everywhere`, () => {
      const { html, title, description } = render(`/services/${service.slug}/district-of-columbia`, STATE_ROUTE, ServiceState);
      const text = visibleText(html);
      expect(text).not.toMatch(RAW_DC);
      expect(description).not.toMatch(RAW_DC);
      expect(description).not.toContain("the state's");
      // The <title> keeps the District's article wherever the full name fits
      // the 60-character tag and falls back to "DC" where it cannot (the
      // shared builder); every heading and sentence slot keeps the article.
      const dc = getStateBySlug("district-of-columbia")!;
      expect(title).toBe(serviceStateTitle(service, dc, ORG_NAME));
      expect(title).toMatch(/ in (the District of Columbia|DC) \| KW Economics$/);
      expect(description).toContain(`for matters venued in the District of Columbia.`);
      // Attributive slot: "District of Columbia Cases", never "the District of Columbia Cases".
      expect(text).toContain(`How ${service.shortName} Work Is Built for District of Columbia Cases`);
      expect(text).not.toContain("for the District of Columbia Cases");
      for (const slot of [
        `${service.shortName} in the District of Columbia`,
        `${service.shortName} Across the District of Columbia`,
        "Our experts serve clients throughout the District of Columbia,",
        "Related Services in the District of Columbia",
        `Frequently asked: ${service.shortName} in the District of Columbia`,
        `Ready to Get Started on ${service.shortName} in the District of Columbia?`,
        `Does ${ORG_NAME} provide ${workPhrase(service.shortName)} in the District of Columbia?`,
      ]) {
        expect(text).toContain(slot);
      }
      expect(jsonLdBlocks(html)).toContain(`${service.name} in the District of Columbia`);
    });
  }

  it("/services/wrongful-death-economic-loss/district-of-columbia/washington reads the District with its article", () => {
    const { html, description } = render(
      "/services/wrongful-death-economic-loss/district-of-columbia/washington",
      CITY_ROUTE,
      ServiceStateCity,
    );
    const text = visibleText(html);
    expect(html).not.toContain("Loading...");
    expect(text).not.toMatch(RAW_DC);
    expect(description).not.toMatch(RAW_DC);
    expect(text).toContain("KW Economics provides wrongful death analysis for cases venued in Washington, the District of Columbia.");
    expect(text).toContain("Wrongful Death in the District of Columbia");
    expect(text).toContain("requirements that affect wrongful death engagements in the District of Columbia.");
    expect(faqText(html)).toContain("Does KW Economics provide wrongful death analysis in Washington, the District of Columbia?");
  });

  it("/locations/district-of-columbia reads the District with its article in every heading and sentence slot", () => {
    const { html, title, description } = render("/locations/district-of-columbia", HUB_ROUTE, StateHub);
    const text = visibleText(html);
    expect(text).not.toMatch(RAW_DC);
    expect(description).not.toMatch(RAW_DC);
    // "Forensic Economists in the District of Columbia | KW Economics" runs 62
    // characters, so the <title> alone takes the abbreviation (shared builder).
    expect(title).toBe(stateHubTitle(getStateBySlug("district-of-columbia")!, ORG_NAME));
    expect(title).toBe(`Forensic Economists in DC | ${ORG_NAME}`);
    expect(description).toContain("Forensic economists for the District of Columbia:");
    for (const slot of [
      "Forensic Economists in the District of Columbia",
      "Expert Services in the District of Columbia",
      "Cities We Serve in the District of Columbia",
      "accepts cases from attorneys across the District of Columbia.",
      "familiar with the District of Columbia's civil and compensation forums",
      "Case Types We Support in the District of Columbia",
      "Expert Credentials in the District of Columbia",
      // Attributive slots keep the bare name.
      "recognized in District of Columbia courts",
      "Frequently asked: District of Columbia expert services",
    ]) {
      expect(text).toContain(slot);
    }
    expect(jsonLdBlocks(html)).toContain("Economic Damages Services in the District of Columbia");
    // A federal district, not a territory: states.ts groups it under region
    // "territory" for the directory only.
    expect(text).toContain("Federal District \u00b7 DC");
    expect(text).not.toContain("Territory");
  });
});

// The hero eyebrow names the kind of jurisdiction: a state's region, "Federal
// District" for the District of Columbia, "U.S. Territory" for the islands.
describe("StateHub hero eyebrow", () => {
  for (const [slug, label] of [
    ["new-jersey", "Northeast \u00b7 NJ"],
    ["texas", "West \u00b7 TX"],
    ["district-of-columbia", "Federal District \u00b7 DC"],
    ["puerto-rico", "U.S. Territory \u00b7 PR"],
  ] as const) {
    it(`/locations/${slug} reads "${label}"`, () => {
      const { html } = render(`/locations/${slug}`, HUB_ROUTE, StateHub);
      expect(visibleText(html)).toContain(label);
    });
  }
});

// The state hub's "Expert Credentials in {state}" section links the same
// credential pages. Its intro is subject to the same rule: no implied
// firm-level holding of a credential.
describe("StateHub credentials section", () => {
  for (const stateSlug of STATES) {
    it(`/locations/${stateSlug} introduces the credential pages without a firm-level claim`, () => {
      const { html } = render(`/locations/${stateSlug}`, HUB_ROUTE, StateHub);
      const state = getStateBySlug(stateSlug)!;
      expect(html).toContain(`Expert Credentials in ${placeName(state.name)}`);
      expect(visibleText(html)).toContain(
        `How each credential is recognized in ${state.name} courts and how it bears on economic damages testimony there.`,
      );
      expect(visibleText(html)).not.toMatch(CERTIFICATION_CLAIM);
      expect(visibleText(html)).not.toMatch(FIRM_LEVEL_CLAIM);
    });
  }
});
