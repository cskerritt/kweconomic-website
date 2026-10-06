import { describe, expect, it } from "vitest";
import {
  buildCityNarrative,
  economicContextCaption,
  serviceCityDirectAnswer,
  serviceCityGeographicFaqs,
  serviceCityPlaceParagraph,
  serviceGeoCategory,
  serviceStateDirectAnswer,
  serviceStateGeographicFaqs,
  serviceStateLegalContext,
  SERVICE_GEO,
} from "./geo-prose.mjs";
import { getCityNarrative, getStateNarrative } from "./narratives";
import { getServiceBySlug, pillarServices } from "./services";
import { getStateBySlug, states } from "./states";
import { alabamaCities } from "./cities/alabama";
import { alaskaCities } from "./cities/alaska";
import { districtOfColumbiaCities } from "./cities/district-of-columbia";
import { illinoisCities } from "./cities/illinois";
import { newJerseyCities } from "./cities/new-jersey";
import { texasCities } from "./cities/texas";
import { americanSamoaCities } from "./cities/american-samoa";
import { guamCities } from "./cities/guam";
import { delawareCities } from "./cities/delaware";
import { northCarolinaCities } from "./cities/north-carolina";
import { usVirginIslandsCities } from "./cities/us-virgin-islands";
import { northernMarianaIslandsCities } from "./cities/northern-mariana-islands";
import { truncateAtWord } from "@/lib/text";
import { LEGACY_BRAND_PATTERN, ORG_NAME } from "@/lib/brand";
import type { City } from "../types";

// Audit F09: the service x state and service x city pages of the commercial
// and family-financial pillars (business valuation, lost profits, fraud and
// tracing, divorce financial analysis) carried the personal-injury template's
// local context - "wage data for that area ... anchors the earnings and
// household-services components of the analysis", "measured against
// <area>-area wage data and the plaintiff's own records". Every sentence those
// pages render from this module is now written for the pillar's own work, and
// the place paragraph the templates share across every pillar (the city
// narrative's direct answer) is written so it holds for all of them. The
// personal-loss pillars keep their wage-data framing word for word.

/** The personal-loss template's tells; none may reach a commercial or family-financial page. */
const PERSONAL_LOSS_LEAK =
  /earnings and household|household-services|household services|plaintiff's own|earning capacity|Bureau of Labor Statistics|fringe benefit|worklife/i;
/** The shared state and city paragraphs' tells (the tort forum, the compensation
 * forum, the hub's "economic damages analyses" opener); none may reach a
 * commercial or family-financial service page either (audit F09 residuals). */
const SHARED_DAMAGES_LEAK = /workers' compensation|wage-loss|personal injury, wrongful death|economic damages analyses/i;

// House rules every geo sentence obeys (mirrors narratives.test.ts).
const TYPOGRAPHY = /[–—§]/;
const FIGURES = /unemployment rate|median hourly wage|\d+(\.\d+)?\s?%|\$\d/i;
const CARE_COST = /attendant care|home health|skilled nursing|life care planner|labor market survey|vocational expert|CLCP/i;
const DOUBLED_ARTICLE = /\b(a|an|the) (a|an|the)\b/i;
const MISARTICLED = /\ba [AEIO]\w|\ban [B-DF-HJ-NP-TV-Z]\w/;
const DOUBLED_WORD = /\b([a-z]{3,}) \1\b/i;

// The transfer pricing pillar ("tax", 2026-10-05) and the intellectual
// property pillar ("intellectual-property", 2026-10-06) are held to the same
// standard: their pages build from the parties' own records, comparables, and
// licenses, never from the personal-loss template's wage framing.
const COMMERCIAL_AND_FAMILY = [
  "business-valuation",
  "lost-profits-and-commercial-damages",
  "fraud-and-asset-tracing",
  "transfer-pricing-expert-witness",
  "intellectual-property-damages",
  "divorce-and-marital-financial-analysis",
] as const;

const PERSONAL_LOSS = [
  "lost-earnings-and-earning-capacity",
  "wrongful-death-economic-loss",
  "personal-injury-economic-damages",
  "household-services-valuation",
  "life-care-plan-cost-projection",
  "employment-and-wage-loss-damages",
] as const;

// The audit's example (Dothan), a metro city with employer data (Houston), a
// nonmetropolitan city (Bethel), the other quoted example (Waukegan), the
// firm's home market, and the District, whose court name carries its county.
const SAMPLES: { stateSlug: string; cities: City[]; citySlug: string }[] = [
  { stateSlug: "alabama", cities: alabamaCities, citySlug: "dothan" },
  { stateSlug: "illinois", cities: illinoisCities, citySlug: "waukegan" },
  { stateSlug: "texas", cities: texasCities, citySlug: "houston" },
  { stateSlug: "alaska", cities: alaskaCities, citySlug: "bethel" },
  { stateSlug: "new-jersey", cities: newJerseyCities, citySlug: "hackensack" },
  { stateSlug: "district-of-columbia", cities: districtOfColumbiaCities, citySlug: "washington" },
];

function sample(stateSlug: string, cities: City[], citySlug: string) {
  const state = getStateBySlug(stateSlug)!;
  const city = cities.find((c) => c.slug === citySlug)!;
  expect(city, `${stateSlug}/${citySlug}`).toBeDefined();
  const stateNarrative = getStateNarrative(state);
  const cityNarrative = getCityNarrative(state, city.name, city.slug, city.county, { msaName: city.msaName });
  return { state, city, stateNarrative, cityNarrative };
}

/** Everything a service x state page and a service x city page render from this module. */
function renderedProse(serviceSlug: string, stateSlug: string, cities: City[], citySlug: string) {
  const service = getServiceBySlug(serviceSlug)!;
  const { state, city, stateNarrative, cityNarrative } = sample(stateSlug, cities, citySlug);
  const stateHero = serviceStateDirectAnswer(ORG_NAME, service.shortName, state.name, stateNarrative);
  const stateLegal = serviceStateLegalContext(service.shortName, stateNarrative);
  const stateFaqs = serviceStateGeographicFaqs(ORG_NAME, service, state.name);
  const cityHero = serviceCityDirectAnswer(ORG_NAME, service.shortName, state.name, city.name, cityNarrative);
  const cityPlace = serviceCityPlaceParagraph(service.shortName, cityNarrative);
  const cityFaqs = serviceCityGeographicFaqs(ORG_NAME, service, state.name, city.name);
  return {
    service,
    state,
    city,
    stateNarrative,
    cityNarrative,
    stateHero,
    stateLegal,
    stateFaqs,
    cityHero,
    cityPlace,
    cityFaqs,
    // The state page's hero, the legal-context paragraph under it, and its FAQ block.
    stateText: [stateHero, stateLegal, JSON.stringify(stateFaqs)].join(" "),
    // The city page's hero, the place paragraph under it, and its FAQ block.
    cityText: [cityHero, cityPlace, JSON.stringify(cityFaqs)].join(" "),
  };
}

describe("service categories", () => {
  it("groups the pillars by the kind of analysis they perform", () => {
    for (const slug of PERSONAL_LOSS) expect(serviceGeoCategory(getServiceBySlug(slug)!.shortName), slug).toBe("personal-loss");
    expect(serviceGeoCategory("Business Valuation")).toBe("commercial");
    expect(serviceGeoCategory("Lost Profits")).toBe("commercial");
    expect(serviceGeoCategory("Fraud & Tracing")).toBe("commercial");
    expect(serviceGeoCategory("Divorce Financial Analysis")).toBe("family-financial");
    expect(serviceGeoCategory("Transfer Pricing")).toBe("tax");
    expect(serviceGeoCategory("IP Damages")).toBe("intellectual-property");
    expect(serviceGeoCategory("Rebuttal")).toBe("rebuttal");
    // No service (the hub pages) and an unknown short name read as the shared framing.
    expect(serviceGeoCategory(undefined)).toBe("personal-loss");
    expect(serviceGeoCategory("Widget Review")).toBe("personal-loss");
  });

  it("gives every pillar a category and every commercial or family-financial pillar its own engagement, deliverables, and caption", () => {
    for (const s of pillarServices()) {
      const angle = SERVICE_GEO[s.shortName];
      expect(angle?.category, s.slug).toMatch(/^(personal-loss|commercial|family-financial|tax|intellectual-property|rebuttal)$/);
    }
    for (const slug of COMMERCIAL_AND_FAMILY) {
      const angle = SERVICE_GEO[getServiceBySlug(slug)!.shortName];
      expect(typeof angle.engagement, slug).toBe("function");
      expect(typeof angle.deliverables, slug).toBe("function");
      expect(typeof angle.context, slug).toBe("function");
      expect(typeof angle.cityFaq, slug).toBe("function");
    }
  });
});

describe("commercial and family-financial pillars carry no personal-loss template prose in any place", () => {
  for (const serviceSlug of COMMERCIAL_AND_FAMILY) {
    for (const { stateSlug, cities, citySlug } of SAMPLES) {
      it(`/services/${serviceSlug}/${stateSlug} and /${citySlug}`, () => {
        const { stateText, cityText, cityHero, cityFaqs, stateFaqs } = renderedProse(serviceSlug, stateSlug, cities, citySlug);
        for (const text of [stateText, cityText]) {
          expect(text).not.toMatch(PERSONAL_LOSS_LEAK);
          expect(text).not.toMatch(SHARED_DAMAGES_LEAK);
          expect(text).not.toMatch(TYPOGRAPHY);
          expect(text).not.toMatch(FIGURES);
          expect(text).not.toMatch(CARE_COST);
          expect(text).not.toMatch(LEGACY_BRAND_PATTERN);
          expect(text).not.toMatch(DOUBLED_ARTICLE);
          expect(text).not.toMatch(MISARTICLED);
          expect(text).not.toMatch(DOUBLED_WORD);
          expect(text).not.toContain("&");
        }
        // The second city FAQ asks about the pillar's own records, never wage
        // levels, and the deliverables answer names the pillar's work product.
        expect(JSON.stringify(cityFaqs[1])).not.toMatch(/wage levels|household services/);
        expect(cityFaqs[2].question).toMatch(/^What deliverables are available for a case venued in /);
        expect(cityFaqs[2].answer).not.toContain("full economic damages reports");
        expect(stateFaqs[1].answer).not.toContain("presents each loss component and its present value");
        // The hero still closes with the testimony sentence every pillar shares.
        expect(cityHero).toMatch(/Deposition and trial testimony are available for [^.]+ matters, in person or by remote appearance where the forum allows\.$/);
      });
    }
  }

  it("the fraud and tracing pages name no wage data at all", () => {
    for (const { stateSlug, cities, citySlug } of SAMPLES) {
      const { stateText, cityText } = renderedProse("fraud-and-asset-tracing", stateSlug, cities, citySlug);
      expect(stateText, stateSlug).not.toMatch(/wage/i);
      expect(cityText, `${stateSlug}/${citySlug}`).not.toMatch(/wage/i);
    }
  });
});

describe("business valuation pages", () => {
  it("name the counsel-defined valuation inputs, the local market's limited role, the venue, and the methods that apply everywhere (Dothan, the audit's example)", () => {
    const { stateHero, stateLegal, cityHero, cityPlace, cityNarrative, cityFaqs, stateFaqs } = renderedProse("business-valuation", "alabama", alabamaCities, "dothan");
    expect(cityHero).toBe(
      "KW Economics provides business valuation for cases venued in Dothan, Alabama. For a business based in Dothan, the valuation date and the standard of value are inputs that counsel defines for the matter, the company's own financial statements, tax returns, and governing agreements drive the income, market, and asset approaches, and Dothan-area market conditions inform the normalization of its results and the market-approach comparables where local data exists. The same valuation methods apply in every venue, and every input is documented so the value can be tested at deposition. Civil claims arising in Dothan are typically heard in the Circuit Court sitting in Houston County. Deposition and trial testimony are available for Dothan matters, in person or by remote appearance where the forum allows.",
    );
    // The place paragraph under the hero (the audit's Dothan FACT quoted the
    // old one: "KW Economics prepares economic damages analyses for cases
    // venued in Dothan, Alabama. ... anchors the earnings and
    // household-services components of the analysis") now carries the anchor
    // sentence alone; the hub's opener stays on the city hub page.
    expect(cityPlace).toBe(
      "Dothan sits in the Dothan, AL metropolitan area, and where an analysis calls for local economic data, the figures for that area, rather than a statewide average, are the ones used. Plaintiff and defense.",
    );
    expect(cityNarrative.directAnswer).toBe(`KW Economics prepares economic damages analyses for cases venued in Dothan, Alabama. ${cityPlace}`);
    // The legal context under the state hero names the claims a valuation
    // supports, never the workers' compensation forum.
    expect(stateLegal).toBe(
      "Alabama's Circuit Court is the primary trial-level forum for the shareholder, partnership, contract, and fraud claims these analyses support. Final appeals in the Alabama court system run to the Supreme Court of Alabama. Alabama is served by 3 federal district courts, where the same analyses are offered under the federal expert-disclosure framework.",
    );
    expect(stateHero).toContain("with the standard of value, the valuation date, and any discounts for lack of control or marketability set by the matter and by Alabama law as counsel confirms it.");
    expect(stateHero).toContain("Regional market data enters only where the normalization of the company's results or the market-approach comparables call for it, the same valuation methods apply in every Alabama venue,");
    expect(stateHero).not.toContain("no wage or household data");
    expect(stateFaqs[1].answer).toContain("(financial statements, tax returns, the general ledger, and the governing agreements)");
    expect(stateFaqs[1].answer).toContain("confirmation with counsel of the valuation date, the standard of value, and the purpose of the valuation");
    expect(cityFaqs[1].question).toBe("What data does a valuation of a business based in Dothan rest on?");
    expect(cityFaqs[2].answer).toContain("full valuation reports");
    expect(cityFaqs[2].answer).toContain("opposing valuation reports");
  });
});

describe("lost profits pages", () => {
  it("name the but-for revenue path, avoided costs, mitigation, the period of loss, and the local market and industry mix (Waukegan)", () => {
    const { stateHero, cityHero, cityFaqs, stateFaqs } = renderedProse("lost-profits-and-commercial-damages", "illinois", illinoisCities, "waukegan");
    for (const text of [stateHero, cityHero]) {
      expect(text).toMatch(/but-for revenue path/);
      expect(text).toMatch(/costs (the company )?avoided/);
      expect(text).toMatch(/mitigation is credited/);
      expect(text).toMatch(/period of loss is reasoned through rather than assumed/);
    }
    expect(stateHero).toContain("the Illinois market and industry mix it sells into");
    expect(cityHero).toContain("the Waukegan-area market conditions and industry mix it sells into");
    expect(cityHero).toMatch(/Civil claims arising in Waukegan are typically heard in the Circuit Court sitting in Lake County\./);
    expect(cityFaqs[1].question).toBe("How is the but-for revenue path built for a business in Waukegan?");
    expect(cityFaqs[1].answer).toContain("The costs avoided by not earning the lost revenue are deducted");
    expect(stateFaqs[1].answer).toContain("the but-for revenue path, the avoided costs, the mitigation offset, and the period of loss");
    expect(cityFaqs[2].answer).toContain("full lost profits and commercial damages reports");
  });
});

describe("fraud and tracing pages", () => {
  it("say the reconciliation and tracing are venue-independent, that the forum shapes discovery and presentation, and that the report does not opine on intent (Houston)", () => {
    const { stateHero, cityHero, cityFaqs, stateFaqs } = renderedProse("fraud-and-asset-tracing", "texas", texasCities, "houston");
    expect(cityHero).toContain("the records reconciliation and the funds-flow tracing are venue-independent");
    expect(cityHero).toContain("The local forum governs discovery and how the schedules are presented, and the report establishes what happened to the money without opining on intent.");
    expect(cityHero).toMatch(/Civil claims arising in Houston are typically heard in the District Court sitting in Harris County\./);
    expect(stateHero).toContain("The reconciliation and tracing are built the same way in every venue from the entity's own records; the Texas forum shapes discovery and the presentation of the schedules, and the report establishes what happened to the money without opining on intent.");
    expect(stateHero).not.toContain("No wage or market data");
    expect(stateFaqs[0].answer).toBe(
      "Yes. KW Economics provides fraud and tracing analysis for attorneys handling matters venued in Texas, for plaintiff and defense counsel, with the analysis sized to the engagement scope and built from the entity's own bank, ledger, and payment records and the accounts the funds moved into.",
    );
    expect(stateFaqs[1].answer).toContain("(bank statements, the general ledger, payment records, and the account records the funds moved into)");
    expect(cityFaqs[1].answer).toContain("Whether the conduct was fraudulent is a question for the fact finder, and the report does not reach it.");
    expect(cityFaqs[2].answer).toContain("tracing schedules with the supporting documents indexed to each transaction");
  });
});

describe("divorce financial analysis pages", () => {
  it("measure actual income, business cash flow, and separate versus marital funds, name the matrimonial forum, and leave earning capacity to the vocational specialist (Hackensack)", () => {
    const { stateHero, stateLegal, cityHero, cityPlace, cityFaqs, stateFaqs, cityNarrative } = renderedProse(
      "divorce-and-marital-financial-analysis",
      "new-jersey",
      newJerseyCities,
      "hackensack",
    );
    // The paragraphs under the two heroes take the matrimonial forms: the
    // family or domestic relations part (no tort forum, no compensation
    // forum, no federal forum) and the "one spouse, both, or the court" sides
    // sentence in place of "Plaintiff and defense."
    expect(stateLegal).toBe(
      "Matrimonial matters in New Jersey are heard in the family or domestic relations part of the trial courts, where income available for support, the value of a business interest, and the character of an asset as separate or marital are decided. Final appeals in the New Jersey court system run to the Supreme Court of New Jersey.",
    );
    // Hackensack carries employer data, so its anchor takes the employers form.
    expect(cityPlace).toMatch(/^Employers such as .* shape the Hackensack labor market, /);
    expect(cityPlace).toMatch(/ The report can be prepared for one spouse, for both, or for the court\.$/);
    expect(cityPlace).not.toContain("Plaintiff and defense");
    expect(cityHero).toBe(
      "KW Economics provides divorce financial analysis for cases venued in Hackensack, New Jersey. For a matrimonial matter in Hackensack, the income analysis measures what a spouse actually receives in pay, business cash flow, and perquisites paid through a business, a marital business is valued from its own records and the Hackensack-area market it serves, and separate and marital funds are traced through accounts and assets to their source. What a spouse could earn in other work is a question for a vocational specialist rather than for the income analysis. Matrimonial matters in Hackensack are typically heard in the family or domestic relations part of the trial courts sitting in Bergen County. Deposition and trial testimony are available for Hackensack matters, in person or by remote appearance where the forum allows.",
    );
    // The matrimonial venue replaces the civil one on this pillar only; the
    // civil sentence stays on the city narrative for the other pillars.
    expect(cityHero).not.toContain("Civil claims arising in Hackensack");
    expect(cityNarrative.venue).toBe("Civil claims arising in Hackensack are typically heard in the Superior Court, Law Division sitting in Bergen County.");
    expect(stateHero).toContain("including business cash flow and perquisites that never reach a pay stub");
    expect(stateHero).toContain("what a spouse could earn in other work is a question for a vocational specialist rather than for the income analysis");
    expect(stateHero).not.toMatch(/wage data/);
    expect(stateFaqs[1].answer).toContain("(tax returns, business financial statements, account statements, and the household's spending records)");
    expect(stateFaqs[1].answer).toContain("The report can be prepared for one spouse, for both, or for the court.");
    expect(cityFaqs[1].question).toBe("How are income and business value determined in a matrimonial matter venued in Hackensack?");
    expect(cityFaqs[2].answer).toContain("income determinations for support, business valuations, lifestyle analyses, and tracing schedules");
    // Neutral family-law language: no side is favored, no advocacy verb, and
    // no sister site is named (the hand-off is a role, never a brand or URL).
    for (const text of [stateHero, cityHero, JSON.stringify(stateFaqs), JSON.stringify(cityFaqs)]) {
      expect(text).not.toMatch(LEGACY_BRAND_PATTERN);
      expect(text).not.toMatch(/https?:\/\//);
      expect(text).not.toMatch(/maximi[sz]e|minimi[sz]e|fight|protect your|win your|the other spouse's/i);
      expect(text).not.toMatch(/wage data|earning capacity/);
    }
    for (const text of [stateHero, JSON.stringify(stateFaqs), JSON.stringify(cityFaqs)]) {
      expect(text).toMatch(/either party's position|one spouse, for both, or for the court|plaintiff and defense/);
    }
  });

  it("names the matrimonial forum through the court's own name where that name carries the county (Washington)", () => {
    const { cityHero } = renderedProse("divorce-and-marital-financial-analysis", "district-of-columbia", districtOfColumbiaCities, "washington");
    expect(cityHero).toContain(
      "Matrimonial matters in Washington are typically heard in the family or domestic relations part of the Superior Court of the District of Columbia.",
    );
    expect(cityHero).not.toMatch(/sitting in District of Columbia/);
  });
});

describe("transfer pricing pages", () => {
  it("test intercompany prices against the arm's length standard from the group's own records, and name the federal tax forums before the state's (Houston)", () => {
    const { stateHero, stateLegal, cityHero, cityPlace, cityFaqs, stateFaqs } = renderedProse("transfer-pricing-expert-witness", "texas", texasCities, "houston");
    expect(serviceGeoCategory("Transfer Pricing")).toBe("tax");
    expect(stateHero.startsWith("KW Economics provides transfer pricing analysis for matters venued in Texas. The analysis tests the prices charged between related companies")).toBe(true);
    expect(stateHero).toContain("against the arm's length standard");
    // One statute and one set of regulations, but the business's location
    // decides which circuit's appellate decisions govern (the review fix of
    // 2026-10-05 retired "the same federal rules wherever the business is
    // based").
    expect(stateHero).toContain(
      "A federal transfer pricing dispute applies the same statute and regulations wherever the business is based, though where it is based decides which federal court of appeals' decisions govern; in Texas, the analysis also meets the jurisdiction's own tax on related-party income",
    );
    // The federal tax forums lead the legal context; the state's trial court
    // hears the civil claims, and the compensation forum never appears.
    expect(stateLegal).toBe(
      "Federal transfer pricing disputes are heard in the United States Tax Court or, on a refund claim, in a federal district court or the Court of Federal Claims; the same statute and regulations apply wherever the business is based, but where it is based decides which federal court of appeals' decisions govern. Texas's District Court is the primary trial-level forum for the commercial, shareholder, and matrimonial claims that turn on an intercompany price, and a dispute over Texas's own tax follows its administrative and appeal process. Final appeals in the Texas court system run to the Supreme Court of Texas. Texas is served by 4 federal district courts, where the same analyses are offered under the federal expert-disclosure framework.",
    );
    for (const text of [stateHero, stateLegal]) expect(text).not.toMatch(/same federal rules|same federal arm's length rules/);
    // The city place paragraph says where a tax dispute for a business based
    // in the city is heard, not which employers shape its labor market.
    expect(cityPlace).toBe(
      "A federal tax dispute for a business based in Houston is heard in the United States Tax Court, which holds trials in cities across the country, or, on a refund claim, in a federal district court or the Court of Federal Claims; a dispute over Texas's own tax follows its administrative and appeal process. Either side.",
    );
    expect(cityPlace).not.toMatch(/Employers such as|labor market/);
    // The disclosure FAQ names the Tax Court's report exchange.
    expect(stateFaqs[2].answer).toContain("no later than thirty days before the call of the trial calendar");
    expect(stateFaqs[0].answer).toBe(
      "Yes. KW Economics provides transfer pricing analysis for attorneys handling matters venued in Texas, for plaintiff and defense counsel, with the analysis sized to the engagement scope and built from the group's own intercompany agreements and financial records and from comparable transactions and companies selected for the transactions at issue rather than from data for the venue.",
    );
    expect(stateFaqs[1].answer).toContain(
      "(the intercompany agreements, the transfer pricing documentation, legal-entity financial statements, and the general ledger detail of the intercompany accounts)",
    );
    expect(stateFaqs[1].answer).toContain("the selection of the method under the best method rule with the rejected alternatives explained");
    expect(cityHero).toContain("selected for the transactions at issue rather than for the city, so Houston-area market conditions enter only where a comparability adjustment calls for them.");
    expect(cityHero).toMatch(/Civil claims arising in Houston are typically heard in the District Court sitting in Harris County\./);
    expect(cityFaqs[1].question).toBe("What records drive a transfer pricing analysis for a business based in Houston?");
    expect(cityFaqs[2].answer).toContain("transfer pricing expert reports for tax and civil forums");
    expect(economicContextCaption("Transfer Pricing", "Texas")).toBe(
      "The arm's length result rests on the group's own agreements and financial records and on comparables selected for the transactions at issue; Texas enters as the forum for a state or local tax dispute or a civil claim and, where a comparability adjustment calls for it, through Texas-area market conditions.",
    );
    for (const text of [stateHero, stateLegal, cityHero, cityPlace, JSON.stringify(stateFaqs), JSON.stringify(cityFaqs)]) {
      expect(text).not.toMatch(/wage|worklife|household|Bureau of Labor Statistics/i);
      expect(text).not.toMatch(/\bSection \d|\bRule \d|U\.S\.C\.|C\.F\.R\.|[–—§]/);
      expect(text).not.toMatch(/maximi[sz]e|minimi[sz]e|avoid tax|tax shelter|win your/i);
    }
  });

  it("read the District with its article in the legal context and the hero (Washington)", () => {
    const { stateHero, stateLegal } = renderedProse("transfer-pricing-expert-witness", "district-of-columbia", districtOfColumbiaCities, "washington");
    expect(stateLegal).toContain("The Superior Court of the District of Columbia is the primary trial-level forum for the commercial, shareholder, and matrimonial claims");
    expect(stateLegal).toContain("a dispute over the District of Columbia's own tax follows its administrative and appeal process");
    expect(stateHero).toContain("in the District of Columbia, the analysis also meets the jurisdiction's own tax on related-party income");
    for (const text of [stateHero, stateLegal]) expect(text).not.toMatch(/\b(a|an|the) (a|an|the)\b|in District of Columbia/i);
  });
});

describe("intellectual property pages", () => {
  it("measure each statute's remedy from the parties' own records and name the federal courts first (Houston)", () => {
    const { stateHero, stateLegal, cityHero, cityPlace, cityFaqs, stateFaqs, cityNarrative } = renderedProse("intellectual-property-damages", "texas", texasCities, "houston");
    expect(serviceGeoCategory("IP Damages")).toBe("intellectual-property");
    // The hero opens on the four rights, so the meta description cut from it names them.
    expect(stateHero.startsWith("KW Economics provides intellectual property damages analysis for matters venued in Texas. Patent, trademark, copyright, and trade secret damages, measured claim by claim, take the form each statute provides:")).toBe(true);
    expect(stateHero).toContain("each apportioned to the protected right and built from the parties' own sales, cost, and license records");
    // The statutory measures do not change with the state, but the regional
    // circuit's decisions govern how the copyright and trademark measures apply.
    expect(stateHero).toContain(
      "The federal patent, trademark, and copyright measures do not change with the state, though the regional circuit's decisions govern how the copyright and trademark measures are applied; Texas's own law can govern the contract and license claims, whether they are brought with an infringement claim or on their own",
    );
    expect(stateHero).not.toMatch(/in every district|as it would be anywhere/);
    // The federal courts lead the legal context, with the Federal Circuit;
    // the state's court hears the claims under its own law brought on their
    // own, and a claim joined with a patent or copyright claim goes with it
    // to federal court; no compensation forum.
    expect(stateLegal).toBe(
      "Patent and copyright claims are heard only in the federal courts, which for a case filed in Texas means the federal district courts serving Texas, though a case involving a business there may be filed in another district where venue lies; appeals in patent cases go to the United States Court of Appeals for the Federal Circuit, and trademark and trade secret claims can be filed in federal court or in Texas's own courts. Texas's District Court is the primary trial-level forum for the trade secret, unfair competition, contract, and license claims under Texas law brought on their own; joined with a patent or copyright claim, they are usually heard with it in federal court. Final appeals in the Texas court system run to the Supreme Court of Texas.",
    );
    // The city hero names federal court for the patent and copyright claims
    // and the related claims joined with them, and the county's court for a
    // license or royalty dispute brought on its own, never "Civil claims
    // arising in Houston" as the forum.
    expect(cityHero).toContain(
      "Patent and copyright claims involving a business in Houston are heard only in federal court, usually together with the related claims under Texas law; a license or royalty dispute brought on its own is typically heard in the District Court sitting in Harris County.",
    );
    expect(cityHero).toContain("KW Economics provides intellectual property damages analysis for cases venued in Houston, Texas. Patent, trademark, copyright, and trade secret damages, measured claim by claim, rest on the parties' own sales, cost, and license records");
    expect(`${stateLegal} ${cityHero}`).not.toMatch(/travel with/);
    expect(cityHero).not.toContain("Civil claims arising in Houston");
    expect(cityNarrative.venue).toBe("Civil claims arising in Houston are typically heard in the District Court sitting in Harris County.");
    // The place paragraph says where the appeals that govern a patent case go, not who employs whom.
    expect(cityPlace).toBe(
      "An appeal in a patent case goes to the United States Court of Appeals for the Federal Circuit from every federal district court, so its damages decisions govern a patent case involving a business in Houston wherever the case is filed; appeals in copyright, trademark, and trade secret cases go to the regional court of appeals for the district that heard them. Plaintiff and defense.",
    );
    expect(cityPlace).not.toMatch(/Employers such as|labor market/);
    expect(stateFaqs[0].answer).toContain("built from the parties' own sales, cost, and license records and from comparable licenses and market data selected for the technology at issue");
    expect(stateFaqs[1].answer).toContain("a reasonable royalty built from the comparable licenses, the profit the protected feature made possible, and the user's alternatives");
    expect(stateFaqs[2].answer).toContain("in a patent case the damages reports usually follow the court's construction of the claims");
    expect(stateFaqs[2].answer).toContain("In the federal district courts, which hear patent and copyright infringement claims between private parties,");
    expect(stateFaqs[2].answer).not.toContain("every patent and copyright claim");
    expect(cityFaqs[1].question).toBe("What records drive an intellectual property damages analysis for a business based in Houston?");
    expect(cityFaqs[2].answer).toContain("expert reports on the damages in patent, trademark, copyright, and trade secret claims");
    expect(economicContextCaption("IP Damages", "Texas")).toBe(
      "The damages rest on the parties' own sales, cost, and license records and on comparable licenses selected for the technology at issue; Texas enters as the forum for the claims under its own law and, where the market for the accused product is local, through Texas-area market conditions.",
    );
    for (const text of [stateHero, stateLegal, cityHero, cityPlace, JSON.stringify(stateFaqs), JSON.stringify(cityFaqs)]) {
      expect(text).not.toMatch(/wage|worklife|household|Bureau of Labor Statistics|present value/i);
      expect(text).not.toMatch(/\bSection \d|\bRule \d|U\.S\.C\.|C\.F\.R\.|[–—§]/);
      expect(text).not.toMatch(/maximi[sz]e|minimi[sz]e|win your|\bverdict|\bmillion/i);
    }
  });

  it("read the District with its article and its single federal district court (Washington)", () => {
    const { stateHero, stateLegal, cityHero } = renderedProse("intellectual-property-damages", "district-of-columbia", districtOfColumbiaCities, "washington");
    expect(stateLegal).toContain("which for a case filed in the District of Columbia means the federal district court serving the District of Columbia");
    expect(stateLegal).toContain("The Superior Court of the District of Columbia is the primary trial-level forum for the trade secret, unfair competition, contract, and license claims under District of Columbia law brought on their own");
    expect(stateLegal).toContain("in the District of Columbia's own courts");
    expect(cityHero).toContain("a license or royalty dispute brought on its own is typically heard in the Superior Court of the District of Columbia.");
    for (const text of [stateHero, stateLegal, cityHero]) expect(text).not.toMatch(/\b(a|an|the) (a|an|the)\b|in District of Columbia|sitting in District of Columbia/i);
  });

  it("say where a claim is filed for a place with no federal district court, and make no claim about local trade secret law, in American Samoa and Guam", () => {
    const as = renderedProse("intellectual-property-damages", "american-samoa", americanSamoaCities, americanSamoaCities[0].slug);
    expect(as.stateLegal).toContain("American Samoa has no federal district court of its own, so such a claim involving a business there is filed in a federal district court where venue lies");
    expect(as.stateLegal).toContain("is the primary trial-level forum for the contract and license claims under American Samoa law brought on their own");
    expect(as.stateLegal).not.toMatch(/trade secret, unfair competition|serving American Samoa|can be filed in federal court or in/);
    expect(as.cityPlace).toContain("wherever the case is filed");
    const gu = renderedProse("intellectual-property-damages", "guam", guamCities, guamCities[0].slug);
    expect(gu.stateLegal).toContain("which for a case filed in Guam means the federal district court serving Guam");
    expect(gu.stateLegal).toContain("is the primary trial-level forum for the contract and license claims under Guam law brought on their own");
    expect(gu.stateLegal).not.toMatch(/trade secret, unfair competition, contract/);
    for (const text of [as.stateText, as.cityText, gu.stateText, gu.cityText]) {
      expect(text).not.toMatch(/trade secret act|Uniform Trade Secrets|own trade secret law/i);
      expect(text).not.toMatch(DOUBLED_ARTICLE);
    }
  });

  it("the state legal context names the federal courts first in every state, the District, and every territory", () => {
    for (const st of states) {
      const legal = serviceStateLegalContext("IP Damages", getStateNarrative(st));
      expect(legal.startsWith("Patent and copyright claims are heard only in the federal courts"), st.slug).toBe(true);
      expect(legal, st.slug).toContain("United States Court of Appeals for the Federal Circuit");
      expect(legal, st.slug).not.toMatch(/workers' compensation|wage-loss|personal injury, wrongful death/i);
      expect(legal.indexOf("Federal Circuit"), st.slug).toBeLessThan(legal.indexOf("primary trial-level forum"));
      // State-law claims joined with a patent or copyright claim are heard with it in federal court.
      expect(legal, st.slug).toContain("brought on their own; joined with a patent or copyright claim, they are usually heard with it in federal court.");
      expect(legal, st.slug).not.toMatch(/travel with|Islands's|(for|serving|in) (U\.S\. Virgin|Northern Mariana) Islands\b/);
      // The meta description cut from the hero names the rights.
      const meta = truncateAtWord(serviceStateDirectAnswer(ORG_NAME, "IP Damages", st.name, getStateNarrative(st)));
      expect(meta, st.slug).toMatch(/Patent, trademark, copyright, and trade/);
      expect(meta.length, `${st.slug}: ${meta}`).toBeGreaterThanOrEqual(140);
      expect(meta.length, `${st.slug}: ${meta}`).toBeLessThanOrEqual(160);
    }
  });

  it("names the courts the case-type pages list, two deep, for the claims under the place's own law (Delaware, North Carolina)", () => {
    const de = renderedProse("intellectual-property-damages", "delaware", delawareCities, "wilmington");
    expect(de.stateLegal).toContain("Delaware's Court of Chancery and Superior Court are the primary trial-level forums for the trade secret, unfair competition, contract, and license claims under Delaware law brought on their own");
    expect(de.cityHero).toContain("a license or royalty dispute brought on its own is typically heard in the Court of Chancery or the Superior Court sitting in New Castle County.");
    const nc = renderedProse("intellectual-property-damages", "north-carolina", northCarolinaCities, "charlotte");
    expect(nc.stateLegal).toContain("The North Carolina Business Court and North Carolina's Superior Court are the primary trial-level forums");
    expect(nc.cityHero).toContain("is typically heard in the North Carolina Business Court or the Superior Court sitting in Mecklenburg County.");
    // The single-court states keep the general-jurisdiction court.
    const tx = renderedProse("intellectual-property-damages", "texas", texasCities, "houston");
    expect(tx.stateLegal).toContain("Texas's District Court is the primary trial-level forum");
  });

  it("reads the plural island names with the article and the bare possessive (the U.S. Virgin Islands, the Northern Mariana Islands)", () => {
    const vi = renderedProse("intellectual-property-damages", "us-virgin-islands", usVirginIslandsCities, usVirginIslandsCities[0].slug);
    expect(vi.stateLegal).toContain("which for a case filed in the U.S. Virgin Islands means the federal district court serving the U.S. Virgin Islands");
    expect(vi.stateLegal).toContain("in the U.S. Virgin Islands' own courts");
    // The court that names the place takes the article, not a doubled place.
    expect(vi.stateLegal).toContain("The Superior Court of the Virgin Islands is the primary trial-level forum");
    expect(vi.stateHero).toContain("the U.S. Virgin Islands' own law can govern the contract and license claims");
    const mp = renderedProse("intellectual-property-damages", "northern-mariana-islands", northernMarianaIslandsCities, northernMarianaIslandsCities[0].slug);
    expect(mp.stateLegal).toContain("which for a case filed in the Northern Mariana Islands means the federal district court serving the Northern Mariana Islands");
    expect(mp.stateHero).toContain("the Northern Mariana Islands' own law can govern");
    const tp = renderedProse("transfer-pricing-expert-witness", "us-virgin-islands", usVirginIslandsCities, usVirginIslandsCities[0].slug);
    expect(tp.stateLegal).toContain("a dispute over the U.S. Virgin Islands' own tax follows its administrative and appeal process");
    expect(tp.stateLegal).toContain("The Superior Court of the Virgin Islands is the primary trial-level forum");
    for (const text of [vi.stateText, vi.cityText, mp.stateText, mp.cityText, tp.stateText, tp.cityText]) {
      expect(text).not.toMatch(/Islands's|U\.S\. Virgin Islands's Superior Court/);
    }
  });
});

describe("the shared city narrative holds for every pillar", () => {
  const base = { orgName: ORG_NAME, stateName: "Alabama", cityName: "Dothan", county: "Houston County", trialCourtName: "Circuit Court" };

  it("names the area's data without anchoring earnings or household services, in each of its three forms", () => {
    const metro = buildCityNarrative({ ...base, msaName: "Dothan, AL" });
    const nonMetro = buildCityNarrative({ ...base, cityName: "Bethel", county: "Bethel Census Area", stateName: "Alaska" });
    const employers = buildCityNarrative({
      ...base,
      cityName: "Houston",
      county: "Harris County",
      stateName: "Texas",
      msaName: "Houston-The Woodlands-Sugar Land, TX",
      employers: ["Memorial Hermann Health System", "H-E-B", "Houston Methodist", "Walmart", "United Airlines"],
      hasMetroData: true,
    });
    for (const n of [metro, nonMetro, employers]) {
      // The city hub keeps the hub opener; the service x city place paragraph
      // is the anchor sentence alone with the pillar's sides sentence.
      expect(n.directAnswer).toMatch(/^KW Economics prepares economic damages analyses for cases venued in /);
      expect(n.directAnswer).toMatch(/ Plaintiff and defense\.$/);
      expect(n.directAnswer).toContain(n.anchor);
      expect(n.anchor).not.toMatch(/economic damages|KW Economics/);
      for (const shortName of ["Business Valuation", "Fraud & Tracing", "Lost Earnings", "Rebuttal"]) {
        expect(serviceCityPlaceParagraph(shortName, n), shortName).toBe(`${n.anchor} Plaintiff and defense.`);
      }
      expect(serviceCityPlaceParagraph("Divorce Financial Analysis", n)).toBe(
        `${n.anchor} The report can be prepared for one spouse, for both, or for the court.`,
      );
      expect(n.directAnswer).not.toMatch(PERSONAL_LOSS_LEAK);
      expect(n.directAnswer).not.toMatch(/wage data/);
      expect(n.directAnswer).not.toMatch(DOUBLED_ARTICLE);
      expect(n.directAnswer).not.toMatch(DOUBLED_WORD);
    }
    expect(metro.directAnswer).toContain("Dothan sits in the Dothan, AL metropolitan area, and where an analysis calls for local economic data,");
    expect(nonMetro.directAnswer).toContain(
      "For Bethel, local economic data, where an analysis calls for it, comes from the metropolitan or nonmetropolitan area that covers Bethel Census Area rather than from a statewide average,",
    );
    // Employers stay as context (first three, in data order), never a claim about a party.
    expect(employers.directAnswer).toContain("Employers such as Memorial Hermann Health System, H-E-B, and Houston Methodist shape the Houston labor market,");
    expect(employers.directAnswer).toContain("the records of the person or business at issue rather than against a citywide average");
    expect(employers.directAnswer).not.toContain("Walmart");
  });

  it("returns both venue sentences, empty where the city carries no county", () => {
    const n = buildCityNarrative({ ...base, msaName: "Dothan, AL" });
    expect(n.venue).toBe("Civil claims arising in Dothan are typically heard in the Circuit Court sitting in Houston County.");
    expect(n.familyVenue).toBe("Matrimonial matters in Dothan are typically heard in the family or domestic relations part of the trial courts sitting in Houston County.");
    expect(n.blurb.startsWith(n.venue)).toBe(true);
    expect(n.blurb).not.toContain("Matrimonial");
    const noCourt = buildCityNarrative({ ...base, trialCourtName: undefined });
    expect(noCourt.venue).toBe("Civil claims arising in Dothan are typically heard in the trial court sitting in Houston County.");
    expect(noCourt.familyVenue).toBe("Matrimonial matters in Dothan are typically heard in the family or domestic relations part of the trial courts sitting in Houston County.");
    const noCounty = buildCityNarrative({ ...base, county: undefined });
    expect(noCounty.venue).toBe("");
    expect(noCounty.familyVenue).toBe("");
    // With no venue sentence of either kind the divorce hero still reads.
    expect(serviceCityDirectAnswer(ORG_NAME, "Divorce Financial Analysis", "Alabama", "Dothan", noCounty)).toContain(
      "rather than for the income analysis. Deposition and trial testimony are available for Dothan matters,",
    );
  });
});

describe("the state legal context by pillar category", () => {
  const al = getStateNarrative(getStateBySlug("alabama")!);
  const dc = getStateNarrative(getStateBySlug("district-of-columbia")!);

  it("keeps the tort and compensation forums on the personal-loss and rebuttal pillars and the hubs", () => {
    for (const shortName of [undefined, "Lost Earnings", "Wrongful Death", "Household Services", "Employment Damages", "Rebuttal", "Widget Review"]) {
      expect(serviceStateLegalContext(shortName, al), shortName).toBe(al.legalContext);
    }
    expect(al.legalContext).toContain("primary trial-level forum for the personal injury, wrongful death, employment, and commercial damages claims");
    expect(al.legalContext).toContain("Workers' compensation claims, where the dispute is over wage-loss benefits rather than tort damages, are administered by the Alabama Department of Labor, Workers' Compensation Division.");
  });

  it("gives the commercial pillars the claims they support and no compensation forum", () => {
    for (const shortName of ["Business Valuation", "Lost Profits", "Fraud & Tracing"]) {
      const text = serviceStateLegalContext(shortName, al);
      expect(text, shortName).toBe(al.legalContextCommercial);
      expect(text, shortName).toMatch(/^Alabama's Circuit Court is the primary trial-level forum for the shareholder, partnership, contract, and fraud claims these analyses support\./);
      expect(text, shortName).toContain("Final appeals in the Alabama court system run to the Supreme Court of Alabama.");
      expect(text, shortName).toContain("federal district court");
      expect(text, shortName).not.toMatch(SHARED_DAMAGES_LEAK);
    }
    // The District already carries its article and its court names its place.
    expect(serviceStateLegalContext("Business Valuation", dc)).toMatch(/^The Superior Court of the District of Columbia is the primary trial-level forum/);
    expect(serviceStateLegalContext("Business Valuation", dc)).not.toMatch(DOUBLED_ARTICLE);
  });

  it("gives the family-financial pillar the matrimonial part and the appellate court only", () => {
    const text = serviceStateLegalContext("Divorce Financial Analysis", al);
    expect(text).toBe(al.legalContextFamily);
    expect(text).toBe(
      "Matrimonial matters in Alabama are heard in the family or domestic relations part of the trial courts, where income available for support, the value of a business interest, and the character of an asset as separate or marital are decided. Final appeals in the Alabama court system run to the Supreme Court of Alabama.",
    );
    expect(text).not.toMatch(SHARED_DAMAGES_LEAK);
    expect(text).not.toMatch(/federal/);
    expect(serviceStateLegalContext("Divorce Financial Analysis", dc)).toMatch(/^Matrimonial matters in the District of Columbia are heard in /);
  });

  it("every state's three variants obey the house rules", () => {
    for (const s of states) {
      const n = getStateNarrative(s);
      for (const text of [n.legalContext, n.legalContextCommercial, n.legalContextFamily]) {
        expect(text, s.slug).not.toMatch(TYPOGRAPHY);
        expect(text, s.slug).not.toMatch(FIGURES);
        expect(text, s.slug).not.toMatch(DOUBLED_ARTICLE);
        expect(text, s.slug).not.toMatch(DOUBLED_WORD);
        expect(text, s.slug).not.toMatch(LEGACY_BRAND_PATTERN);
      }
      expect(n.legalContextCommercial, s.slug).not.toMatch(SHARED_DAMAGES_LEAK);
      expect(n.legalContextFamily, s.slug).not.toMatch(SHARED_DAMAGES_LEAK);
    }
  });
});

describe("personal-loss pillars keep their wage-data framing", () => {
  const tx = getStateBySlug("texas")!;
  const n = getStateNarrative(tx);
  const houston = texasCities.find((c) => c.slug === "houston")!;
  const c = getCityNarrative(tx, houston.name, houston.slug, houston.county, { msaName: houston.msaName });

  it("in the hero angles, word for word", () => {
    expect(serviceStateDirectAnswer(ORG_NAME, "Lost Earnings", tx.name, n)).toBe(
      "KW Economics provides lost earnings analysis for matters venued in Texas. The projection starts from the plaintiff's own earnings history, tests it against occupational wage data from the Bureau of Labor Statistics for the metropolitan or nonmetropolitan area of Texas where the plaintiff worked, carries it over a documented worklife expectancy with wage growth, and discounts it to present value. Fringe benefits are valued from the employer's plan documents or from published employer-cost data, and any post-injury earning capacity is offset against the but-for path rather than assumed away. Plaintiff and defense.",
    );
    expect(serviceCityDirectAnswer(ORG_NAME, "Wrongful Death", tx.name, "Houston", c)).toContain(
      "For a death case arising in Houston, the decedent's earnings are measured against Houston-area wage data and the decedent's own records, household services are priced at Houston-area replacement rates,",
    );
    expect(serviceCityDirectAnswer(ORG_NAME, "Household Services", tx.name, "Houston", c)).toContain(
      "For a household in Houston, each category of lost services is priced at the Houston-area replacement wage for that task rather than at a statewide figure,",
    );
    expect(serviceCityDirectAnswer(ORG_NAME, "Employment Damages", tx.name, "Houston", c)).toContain(
      "the mitigation analysis rests on wage data for the employee's occupation in the Houston area",
    );
    // The civil venue sentence stays on every pillar but the family-financial one.
    for (const slug of [...PERSONAL_LOSS, "business-valuation", "lost-profits-and-commercial-damages", "fraud-and-asset-tracing", "expert-rebuttal-and-report-review"]) {
      const s = getServiceBySlug(slug)!;
      expect(serviceCityDirectAnswer(ORG_NAME, s.shortName, tx.name, "Houston", c), slug).toContain(c.venue);
    }
  });

  it("in the wage-levels city FAQ and the shared engagement and deliverables answers", () => {
    for (const slug of PERSONAL_LOSS) {
      const s = getServiceBySlug(slug)!;
      const cityFaqs = serviceCityGeographicFaqs(ORG_NAME, s, tx.name, "Houston");
      expect(cityFaqs[1].question, slug).toBe("How are Houston wage levels and cost of living handled in the analysis?");
      expect(cityFaqs[2].answer, slug).toBe(
        "KW Economics provides full economic damages reports, preliminary damages estimates for settlement evaluation, reviews and rebuttals of opposing economic reports, and deposition and trial testimony, sized to both trial-track and settlement matters. The appropriate deliverable depends on case posture.",
      );
      const stateFaqs = serviceStateGeographicFaqs(ORG_NAME, s, tx.name);
      expect(stateFaqs[0].answer, slug).toContain("built from the records that drive the claim and from data for the Texas market rather than from national averages.");
      expect(stateFaqs[1].answer, slug).toContain("a report that presents each loss component and its present value");
    }
  });
});

describe("economic-context panel captions", () => {
  it("keep the earnings caption for the hub pages and the personal-loss pillars", () => {
    const shared =
      "Earnings and household-services figures are measured against Alabama-area wage data and the plaintiff's own records; the source behind each figure is documented in the report.";
    expect(economicContextCaption(undefined, "Alabama")).toBe(shared);
    for (const slug of PERSONAL_LOSS) expect(economicContextCaption(getServiceBySlug(slug)!.shortName, "Alabama"), slug).toBe(shared);
    expect(economicContextCaption("Widget Review", "Alabama")).toBe(shared);
    // Attributive slots drop the article the place or city carries.
    expect(economicContextCaption(undefined, "District of Columbia")).toContain("against District of Columbia-area wage data");
    expect(economicContextCaption(undefined, "The Bronx")).toContain("against Bronx-area wage data");
  });

  it("caption the commercial, family-financial, and rebuttal pillars for their own work", () => {
    const bv = economicContextCaption("Business Valuation", "Alabama");
    expect(bv).toBe(
      "Valuation inputs come from the company's own records and its governing agreements. Alabama-area market data enters only through the normalization of the company's results and the market-approach comparables where local data exists; the source behind each input is documented in the report.",
    );
    const lp = economicContextCaption("Lost Profits", "Illinois");
    expect(lp).toContain("The but-for projection rests on the company's own financial history. Illinois-area market conditions and industry mix enter it");
    const fraud = economicContextCaption("Fraud & Tracing", "Texas");
    expect(fraud).toBe(
      "The tracing figure rests entirely on the entity's own bank, ledger, and payment records and is built the same way in every venue; Texas enters as the forum for discovery and presentation, not as a data source.",
    );
    expect(economicContextCaption("Fraud & Tracing", "District of Columbia")).toContain("the District of Columbia enters as the forum");
    const divorce = economicContextCaption("Divorce Financial Analysis", "New Jersey");
    expect(divorce).toContain("Income available for support is measured from the spouse's own tax, business, and account records, a marital business from its own statements and the New Jersey-area market it serves,");
    const rebuttal = economicContextCaption("Rebuttal", "District of Columbia");
    expect(rebuttal).toContain("against the published data for the District of Columbia,");
    for (const text of [bv, lp, fraud, divorce, rebuttal]) {
      expect(text).not.toMatch(PERSONAL_LOSS_LEAK);
      expect(text).not.toMatch(TYPOGRAPHY);
      expect(text).not.toMatch(DOUBLED_ARTICLE);
      expect(text).not.toMatch(DOUBLED_WORD);
    }
    expect(fraud).not.toMatch(/wage/i);
  });
});
