import { describe, it, expect, vi } from "vitest";
import type { City } from "@/types";
import ServiceState from "./ServiceState";
import ServiceStateCity from "./ServiceStateCity";
import StateHub from "./StateHub";
import { usePageMeta } from "@/hooks/use-page-meta";
import { pillarServices } from "@/data/services";
import { getStateBySlug } from "@/data/states";
import { cityAttr, placeAttr, placeName } from "@/data/geo-prose.mjs";
import { ORG_NAME } from "@/lib/brand";
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
          expect(title).toBe(`${service.shortName} in ${place} | ${ORG_NAME}`);
          expect(description).toBe(
            `${ORG_NAME} provides ${work} for matters venued in ${place}. Forensic economists measuring lost earnings, household services, and business damages against ${placeAttr(state.name)} wage data and the jurisdiction's damages rules, for plaintiff and defense counsel across ${place}.`,
          );
          for (const seam of rawServiceSeams(service)) {
            expect(text).not.toMatch(seam);
            expect(description).not.toMatch(seam);
            expect(jsonLdBlocks(html)).not.toMatch(seam);
          }
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
          expect(title).toBe(`${service.shortName} in ${cityName}, ${state.abbreviation} | ${ORG_NAME}`);
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
          expect(text).toContain(`against wage data for the ${attr} area and the plaintiff's own records`);
          expect(text).toContain(`Other Services in ${cityName}`);
          expect(text).toContain(`offers complementary economic damages services for ${attr} cases.`);
          expect(faqText(html)).toContain(`common to ${attr} matters.`);
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
    expect(text).toContain("against wage data for the Bronx area and the plaintiff's own records");
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
      expect(title).toBe(`${service.shortName} in the District of Columbia | ${ORG_NAME}`);
      expect(description).toContain(`for matters venued in the District of Columbia.`);
      expect(description).toContain("across the District of Columbia.");
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
    expect(title).toBe(`Forensic Economists in the District of Columbia | ${ORG_NAME}`);
    expect(description).toContain("expert testimony throughout the District of Columbia.");
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
