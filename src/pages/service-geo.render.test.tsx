import { describe, it, expect, vi } from "vitest";
import type { City } from "@/types";
import ServiceState from "./ServiceState";
import ServiceStateCity from "./ServiceStateCity";
import StateHub from "./StateHub";
import { pillarServices } from "@/data/services";
import { getStateBySlug } from "@/data/states";
import { placeName } from "@/data/geo-prose.mjs";
import { proseName } from "@/lib/service-prose";
import {
  renderRoute,
  visibleText,
  faqText,
  faqLdStrings,
  excerpt,
  DOUBLED_WORD,
  MIS_ARTICLE,
} from "@/test-utils/markup";

// Server renders of the service x state and service x city pages.
//
// Both pages carry an "Expert Credentials" sidebar that prints the service's
// relevantCredentials chips (Forensic Economist, NAFE, AAEFE, MBA, PhD) under
// a templated sentence built from Service.shortName. Two things that sentence
// must never do:
// - assert that the firm's experts hold the chips as certifications. The
//   roster (src/data/team.ts) lists no PhD, and NAFE/AAEFE membership is a
//   facts-to-confirm item that the credentials hub itself calls an
//   affiliation, not a certification (spec 4.3). The chips are qualifications
//   that bear on the work, so the sentence says exactly that.
// - carry the short name's ampersand into running prose ("fraud & tracing
//   testimony"). Headings keep "Fraud & Tracing"; sentences go through
//   proseName().
//
// ServiceStateCity resolves its city from useStateCities, an effect-driven
// per-state chunk load that never settles under renderToStaticMarkup (the
// page would render <Loading /> forever). The hook is replaced with a
// synchronous lookup over two real state files so the full body renders.
vi.mock("@/hooks/use-state-cities", async () => {
  const { newJerseyCities } = await import("@/data/cities/new-jersey");
  const { texasCities } = await import("@/data/cities/texas");
  const BY_STATE: Record<string, City[]> = { "new-jersey": newJerseyCities, texas: texasCities };
  return {
    useStateCities: (stateSlug?: string) => ({
      cities: (stateSlug && BY_STATE[stateSlug]) || [],
      loading: false,
    }),
  };
});

const STATE_ROUTE = "/services/:serviceSlug/:stateSlug";
const CITY_ROUTE = "/services/:serviceSlug/:stateSlug/:citySlug";

// Any sentence that has someone holding a certification, and any phrasing
// that attributes a credential or membership to the firm's experts as a
// group. "|" is the element delimiter visibleText() inserts, so a verb and a
// noun in different elements can never chain into a match.
const CERTIFICATION_CLAIM = /\b(hold|holds|holding|held)\b[^.|]{0,60}\bcertif/i;
const FIRM_LEVEL_CLAIM = /\b(our|KW Economics) [a-z& ]{0,40}(experts|economists) (hold|holds|belong|are certified|are members)/i;

// The sentence that introduces the credential chips, read as the visitor
// reads it.
function credentialsIntro(html: string): string {
  const m = html.match(/Expert Credentials<\/h3><p[^>]*>([\s\S]*?)<\/p>/);
  return m ? visibleText(m[1]).trim() : "";
}

const STATES = ["new-jersey", "texas"] as const;
const CITIES = [
  { stateSlug: "new-jersey", citySlug: "hackensack", cityName: "Hackensack" },
  { stateSlug: "texas", citySlug: "houston", cityName: "Houston" },
] as const;

describe("ServiceState credentials sidebar and FAQ prose", () => {
  for (const service of pillarServices()) {
    for (const stateSlug of STATES) {
      const state = getStateBySlug(stateSlug)!;
      describe(`/services/${service.slug}/${stateSlug}`, () => {
        const html = renderRoute(`/services/${service.slug}/${stateSlug}`, STATE_ROUTE, ServiceState);
        const intro = credentialsIntro(html);

        it("renders the page body with its credential chips", () => {
          expect(html).toContain("Expert Credentials");
          for (const cred of service.relevantCredentials) expect(html).toContain(`>${cred}<`);
        });

        it("introduces the chips as qualifications that bear on the testimony, not as held certifications", () => {
          expect(intro).toBe(
            `Qualifications and standards that bear on ${proseName(service.shortName)} testimony in ${placeName(state.name)}:`,
          );
          expect(visibleText(html)).not.toMatch(CERTIFICATION_CLAIM);
          expect(visibleText(html)).not.toMatch(FIRM_LEVEL_CLAIM);
        });

        it("spells out ampersands in the sidebar sentence and the FAQ prose (headings may keep them)", () => {
          expect(intro).not.toContain("&");
          expect(faqText(html)).not.toContain("&");
          for (const s of faqLdStrings(html)) expect(s).not.toContain("&");
        });

        it("never doubles a word or misplaces an article in the templated sentences", () => {
          for (const text of [intro, faqText(html)]) {
            expect(excerpt(text, DOUBLED_WORD)).toBeUndefined();
            expect(excerpt(text, MIS_ARTICLE)).toBeUndefined();
          }
        });
      });
    }
  }
});

describe("ServiceStateCity credentials sidebar and FAQ prose", () => {
  for (const service of pillarServices()) {
    for (const { stateSlug, citySlug, cityName } of CITIES) {
      describe(`/services/${service.slug}/${stateSlug}/${citySlug}`, () => {
        const html = renderRoute(`/services/${service.slug}/${stateSlug}/${citySlug}`, CITY_ROUTE, ServiceStateCity);
        const intro = credentialsIntro(html);

        it("renders the page body (not the loading placeholder) with its credential chips", () => {
          expect(html).not.toContain("Loading...");
          // The H1 keeps the short name as written; static markup escapes its "&".
          expect(html).toContain(`${service.shortName.replace("&", "&amp;")}</span> in ${cityName},`);
          expect(html).toContain("Expert Credentials");
          for (const cred of service.relevantCredentials) expect(html).toContain(`>${cred}<`);
        });

        it("introduces the chips as qualifications that bear on the testimony, not as held certifications", () => {
          expect(intro).toBe(
            `Qualifications and standards that bear on ${proseName(service.shortName)} testimony in ${cityName}:`,
          );
          expect(visibleText(html)).not.toMatch(CERTIFICATION_CLAIM);
          expect(visibleText(html)).not.toMatch(FIRM_LEVEL_CLAIM);
        });

        it("spells out ampersands in the sidebar sentence and the FAQ prose (headings may keep them)", () => {
          expect(intro).not.toContain("&");
          expect(faqText(html)).not.toContain("&");
          for (const s of faqLdStrings(html)) expect(s).not.toContain("&");
        });

        it("never doubles a word or misplaces an article in the templated sentences", () => {
          for (const text of [intro, faqText(html)]) {
            expect(excerpt(text, DOUBLED_WORD)).toBeUndefined();
            expect(excerpt(text, MIS_ARTICLE)).toBeUndefined();
          }
        });
      });
    }
  }

  // Exact sentences for the pillar whose short name carries an ampersand, so
  // a regression names the page and the words.
  it("prints the fraud pillar's sidebar sentence as prose in both tiers", () => {
    expect(credentialsIntro(renderRoute("/services/fraud-and-asset-tracing/texas", STATE_ROUTE, ServiceState))).toBe(
      "Qualifications and standards that bear on fraud and tracing testimony in Texas:",
    );
    expect(
      credentialsIntro(renderRoute("/services/fraud-and-asset-tracing/new-jersey/hackensack", CITY_ROUTE, ServiceStateCity)),
    ).toBe("Qualifications and standards that bear on fraud and tracing testimony in Hackensack:");
  });
});

// The state hub's "Expert Credentials in {state}" section links the same
// credential pages. Its intro is subject to the same rule: no implied
// firm-level holding of a credential.
describe("StateHub credentials section", () => {
  for (const stateSlug of STATES) {
    it(`/locations/${stateSlug} introduces the credential pages without a firm-level claim`, () => {
      const html = renderRoute(`/locations/${stateSlug}`, "/locations/:stateSlug", StateHub);
      const state = getStateBySlug(stateSlug)!;
      expect(html).toContain(`Expert Credentials in ${state.name}`);
      expect(visibleText(html)).toContain(
        `How each credential is recognized in ${state.name} courts and how it bears on economic damages testimony there.`,
      );
      expect(visibleText(html)).not.toMatch(CERTIFICATION_CLAIM);
      expect(visibleText(html)).not.toMatch(FIRM_LEVEL_CLAIM);
    });
  }
});
