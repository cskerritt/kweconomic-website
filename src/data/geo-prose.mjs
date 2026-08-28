// Geographic prose templates - the ONE source of truth for the state/city
// narratives and geo FAQ blocks. Written as plain ESM so that both the React
// runtime (src/data/narratives.ts, src/data/geographicFaqs.ts) and the
// prerenderer (scripts/prerender.mjs, which cannot import TypeScript) render
// byte-identical copy. Inputs are plain data; the callers do the data joins.
//
// Content rules (economics framing): local wage levels, the cost of living,
// and the local industry mix are context for how an earnings or
// household-services analysis is built, never a claim about a party. No
// invented statistics: the prose never prints unemployment rates, wage
// figures, or dollar amounts. Population and MSA name are allowed; employer
// names are allowed as context only. Citation-free: no statutes, rule
// numbers, damage caps, or case law. Hyphens only (no em/en dashes).
//
// Service.shortName is a heading label ("Fraud & Tracing"); the service x
// state / city templates render it through the shared prose helpers
// (workPhrase: "fraud and tracing analysis") so that neither the hero
// sentence nor the geo FAQ ever prints a loss subject as the thing supplied.

import { capFirst, workPhrase } from "../lib/service-prose.mjs";

/** The first five employer names for a metro, in data order. Context for the
 * local earnings picture on a metro page; never a statement about a party. */
export function majorEmployers(topEmployers) {
  return (topEmployers ?? []).slice(0, 5);
}

const fmtPopulation = (n) => {
  if (typeof n !== "number" || !(n > 0)) return "";
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m >= 10 ? Math.round(m) : m.toFixed(1)} million`;
  }
  // Below a million, round to the nearest thousand so "about" is honest.
  return (Math.round(n / 1000) * 1000).toLocaleString("en-US");
};

/** "New Jersey's Superior Court" but "the Superior Court of Guam" (no doubled possessive). */
const forumPhrase = (stateName, court) =>
  court.includes(stateName) ? `The ${court}` : `${stateName}'s ${court}`;

const listNames = (names) => {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
};

/** Island territories whose wage markets are compact and whose benchmarks
 * sometimes have to be borrowed from the mainland. The District of Columbia
 * carries region "territory" in states.ts but is not an island; it takes the
 * northeast sentence and its own metropolitan framing. */
export const ISLAND_SLUGS = new Set([
  "puerto-rico",
  "us-virgin-islands",
  "guam",
  "american-samoa",
  "northern-mariana-islands",
]);

/** "the District of Columbia" reads as a place name; every state name does as-is. */
export const placeName = (stateName) =>
  stateName === "District of Columbia" ? "the District of Columbia" : stateName;

/** Attributive form for slots where the name modifies a noun ("District of
 * Columbia wage levels", "the District of Columbia market", "a question of
 * District of Columbia law"): never carries the article placeName() adds, so
 * "a the" and "the the" cannot be rendered. Accepts a raw state name or a
 * placeName() result. */
export const placeAttr = (name) => name.replace(/^the /, "");

/** Attributive form of a city name: "The Bronx" becomes "Bronx" so that "the
 * Bronx area" and "Bronx wage levels" read naturally. Non-attributive slots
 * ("cases venued in The Bronx") keep the full name. */
export const cityAttr = (cityName) => cityName.replace(/^The /, "");

/** "a"/"an" by first letter. Used only for the pillar service names, where the
 * letter rule is exact ("an Employment and Wage Loss Damages engagement"); the
 * place and city slots are worded so that no indefinite article precedes a
 * proper name ("a Alabama case" is never rendered). */
const indefiniteArticle = (phrase) => (/^[aeiou]/i.test(phrase) ? "an" : "a");

/** Regional wage and cost-of-living framing. General, defensible, no figures:
 * each sentence says how the local market enters the analysis, not what the
 * market pays. */
const REGION_WAGES = {
  northeast: (s) =>
    `Earnings in ${s} are shaped by regional wage markets that do not stop at the state line, so an earnings projection is anchored to the plaintiff's own work history and to wage data for the area where the plaintiff actually worked, whichever side of the line that is, rather than to a statewide or national average.`,
  southeast: (s) =>
    `Wage levels and the cost of living in ${s} differ between its metropolitan counties and its rural ones, so an earnings projection is anchored to the plaintiff's own work history and to wage data for the area where the plaintiff actually worked rather than to a statewide average.`,
  midwest: (s) =>
    `Earnings histories in ${s} often reflect manufacturing, agriculture, health care, and logistics employment with distinct wage paths and benefit packages, so the projection is built from the plaintiff's own records and from wage data for the plaintiff's own occupation and area rather than from a statewide average.`,
  west: (s) =>
    `Wage levels and the cost of living in ${s} vary between its metropolitan areas and its rural counties, so an earnings projection is anchored to the plaintiff's own work history and to wage data for the area where the plaintiff actually worked rather than to a statewide average.`,
  territory: (s) =>
    `Wage levels and the cost of living in ${s} differ from the mainland, and earnings histories often include mainland employment or federal pay scales, so the projection is built from the plaintiff's own records and from local wage data rather than from mainland averages.`,
};

/**
 * State narrative.
 * @param {{ orgName: string, stateName: string, stateSlug?: string, region?: string, population?: number,
 *   trialCourtName?: string, supremeCourt?: string, federalDistrictCount?: number,
 *   compensationForum?: string }} input
 * @returns {{ directAnswer: string, economicContext: string, legalContext: string }}
 */
export function buildStateNarrative(input) {
  const {
    orgName,
    stateName,
    stateSlug,
    region,
    population,
    trialCourtName,
    supremeCourt,
    federalDistrictCount = 0,
    compensationForum,
  } = input;

  const place = placeName(stateName);
  const isIsland = ISLAND_SLUGS.has(stateSlug ?? "");
  const isDistrict = stateSlug === "district-of-columbia";
  const regionKey = region === "territory" && !isIsland ? "northeast" : region;
  const regionWages = REGION_WAGES[regionKey] ?? REGION_WAGES.southeast;
  const directAnswer = [
    `${orgName} prepares economic damages analyses - lost earnings, wrongful death economic loss, household services, employment damages, and business damages - for matters venued in ${place}.`,
    regionWages(place),
    "Plaintiff and defense.",
  ].join(" ");

  const pop = fmtPopulation(population);
  let scope;
  if (isIsland) {
    scope = pop
      ? `With about ${pop} residents, ${place} is a compact wage market, and the analysis uses local wage and household data where it exists and names every mainland benchmark it borrows.`
      : `${capFirst(place)} is a compact wage market, and the analysis uses local wage and household data where it exists and names every mainland benchmark it borrows.`;
  } else if (isDistrict) {
    scope = pop
      ? `With about ${pop} residents inside a much larger metropolitan wage market, ${place} is analyzed with occupational wage data from the Bureau of Labor Statistics for the Washington metropolitan area and with household and cost-of-living data from the American Community Survey.`
      : `${capFirst(place)} sits inside a much larger metropolitan wage market and is analyzed with occupational wage data from the Bureau of Labor Statistics for the Washington metropolitan area and with household and cost-of-living data from the American Community Survey.`;
  } else {
    scope = pop
      ? `With about ${pop} residents, ${place} contains more than one distinct wage market, and the analysis uses the one the plaintiff actually worked in: occupational wage data from the Bureau of Labor Statistics for that metropolitan or nonmetropolitan area, and household and cost-of-living data from the American Community Survey.`
      : `${capFirst(place)} contains more than one distinct wage market, and the analysis uses the one the plaintiff actually worked in: occupational wage data from the Bureau of Labor Statistics for that metropolitan or nonmetropolitan area, and household and cost-of-living data from the American Community Survey.`;
  }
  const economicContext = [
    scope,
    `Fringe benefits, worklife expectancy, wage growth, and the discount rate are each documented with their source so every figure in the projection can be traced and tested at deposition.`,
  ].join(" ");

  const legalParts = [];
  const forum = trialCourtName ?? "general-jurisdiction trial court";
  legalParts.push(
    `${forumPhrase(stateName, forum)} is the primary trial-level forum for the personal injury, wrongful death, employment, and commercial damages claims these analyses support.`,
  );
  if (compensationForum) {
    legalParts.push(
      `Workers' compensation claims, where the dispute is over wage-loss benefits rather than tort damages, are administered by the ${compensationForum}.`,
    );
  }
  // "the District of Columbia" already carries its article.
  const placeThe = place.startsWith("the ") ? place : `the ${place}`;
  if (supremeCourt) legalParts.push(`Final appeals in ${placeThe} court system run to the ${supremeCourt}.`);
  if (federalDistrictCount > 0) {
    legalParts.push(
      `${capFirst(place)} is served by ${federalDistrictCount} federal district court${federalDistrictCount === 1 ? "" : "s"}, where the same analyses are offered under the federal expert-disclosure framework.`,
    );
  }
  const legalContext = legalParts.join(" ");

  return { directAnswer, economicContext, legalContext };
}

/**
 * City narrative.
 * @param {{ orgName: string, stateName: string, cityName: string, county?: string,
 *   msaName?: string, employers?: string[], hasMetroData?: boolean,
 *   trialCourtName?: string }} input
 * @returns {{ directAnswer: string, blurb: string }}
 */
export function buildCityNarrative(input) {
  const {
    orgName,
    stateName,
    cityName,
    county,
    msaName,
    employers = [],
    hasMetroData = false,
    trialCourtName,
  } = input;

  const named = employers.slice(0, 3);
  const cityA = cityAttr(cityName);
  let anchor;
  if (named.length > 0) {
    anchor = `Earnings histories in ${cityName} are shaped by employers such as ${listNames(named)}, and the analysis measures each loss against the wage and benefit structure of the plaintiff's own occupation and employer rather than against a citywide average.`;
  } else if (msaName) {
    anchor = `${cityName} sits in the ${msaName} metropolitan area, and wage data for that area, rather than a statewide average, anchors the earnings and household-services components of the analysis.`;
  } else {
    anchor = `For ${cityName}, the analysis uses wage data for the metropolitan or nonmetropolitan area that covers ${county ?? cityName} rather than a statewide average, so the earnings and household-services components reflect the plaintiff's own market.`;
  }
  const directAnswer = [
    `${orgName} prepares economic damages analyses for cases venued in ${cityName}, ${stateName}.`,
    anchor,
    "Plaintiff and defense.",
  ].join(" ");

  const blurbParts = [];
  if (county) {
    // When the court's own name already names the county ("Superior Court of
    // the District of Columbia"), the "sitting in" clause would only repeat it.
    let venue;
    if (!trialCourtName) venue = `the trial court sitting in ${county}`;
    else if (trialCourtName.includes(county)) venue = `the ${trialCourtName}`;
    else venue = `the ${trialCourtName} sitting in ${county}`;
    blurbParts.push(`Civil claims arising in ${cityName} are typically heard in ${venue}.`);
  }
  blurbParts.push(
    hasMetroData || named.length > 0 || msaName
      ? `The report documents the source behind every wage, benefit, and growth figure so counsel can trace each component of the loss to ${cityA}-area data or to the plaintiff's own records.`
      : `Where no ${cityA}-area figure exists, the report states which broader benchmark it uses and why, so no component of the loss rests on an undocumented assumption.`,
  );
  blurbParts.push(
    `Deposition and trial testimony are available for ${cityA} matters, in person or by remote appearance where the forum allows.`,
  );
  const blurb = blurbParts.join(" ");

  return { directAnswer, blurb };
}

/** Service x State hero sentence (ServiceState.tsx + prerender). Takes the
 * raw Service.shortName and renders the work the pillar performs
 * ("KW Economics provides wrongful death analysis for matters venued in
 * Texas."), never the short name as the thing supplied. */
export function serviceStateDirectAnswer(orgName, serviceShortName, stateName, stateNarrative) {
  return `${orgName} provides ${workPhrase(serviceShortName)} for matters venued in ${placeName(stateName)}. ${stateNarrative.economicContext} Plaintiff and defense.`;
}

/** Service x City hero sentence (ServiceStateCity.tsx + prerender). Same
 * work-phrase rule as the state sentence. */
export function serviceCityDirectAnswer(orgName, serviceShortName, stateName, cityName, cityNarrative) {
  return `${orgName} provides ${workPhrase(serviceShortName)} for cases venued in ${cityName}, ${placeName(stateName)}. ${cityNarrative.blurb}`;
}

// ---------------------------------------------------------------------------
// Geo FAQ blocks. 3-4 Q&A pairs per template, economics framing, citation-free.
// ---------------------------------------------------------------------------

export function stateGeographicFaqs(orgName, stateName) {
  const place = placeName(stateName);
  const attr = placeAttr(stateName);
  return [
    {
      question: `Does ${orgName} provide forensic economics services for ${attr} cases?`,
      answer: `Yes. ${orgName} prepares lost earnings, wrongful death economic loss, household services, employment damages, lost profits, and business valuation analyses, and reviews and rebuts opposing economic reports, for attorneys handling matters venued in ${place}, for plaintiff and defense counsel alike. Every projection is anchored to the plaintiff's own records and to wage data for the area of ${place} where the plaintiff actually worked.`,
    },
    {
      question: `How does a forensic economist account for ${attr} wage levels in a lost earnings claim?`,
      answer: `The starting point is the plaintiff's own earnings history - tax returns, W-2s, pay records, and benefit statements - rather than an average. Occupational wage data from the Bureau of Labor Statistics for the plaintiff's metropolitan or nonmetropolitan area in ${place} is used to test that history, to project a career that was still developing, and to value residual earnings after the injury, and household composition and cost-of-living data come from the American Community Survey. The source behind each figure is documented in the report.`,
    },
    {
      question: `Which courts in ${place} hear the damages claims your reports support?`,
      answer: `Personal injury, wrongful death, employment, and commercial damages claims are heard in ${place}'s general-jurisdiction trial courts and, where jurisdiction allows, in the federal district courts serving ${place}. Wage-loss disputes in workers' compensation matters proceed before the compensation forum rather than the civil courts. Attorneys are responsible for confirming the venue and the governing damages rules for their specific case.`,
    },
    {
      question: `How is present value calculated for a wrongful death claim in ${place}?`,
      answer: `The decedent's earnings and fringe benefits are projected over a documented worklife expectancy, reduced by the decedent's own personal consumption where the measure of damages in ${place} calls for it, and combined with the value of the household services the decedent would have provided. Each future year is then discounted to present value at a documented rate tied to the growth assumptions, so the report shows the lump sum that replaces the lost stream today. Which components are recoverable is a question of ${attr} law that counsel confirms; the report is structured so each component can be included or removed.`,
    },
  ];
}

export function cityGeographicFaqs(orgName, stateName, cityName) {
  const place = placeName(stateName);
  const cityA = cityAttr(cityName);
  return [
    {
      question: `Does ${orgName} provide forensic economics services for cases venued in ${cityName}, ${place}?`,
      answer: `Yes. ${orgName} prepares economic damages analyses - lost earnings, wrongful death economic loss, household services, employment damages, and business damages - for attorneys handling matters venued in ${cityName}, ${place}, for plaintiff and defense counsel alike. Each projection is anchored to wage data for the ${cityA} area rather than to statewide or national averages.`,
    },
    {
      question: `How does a forensic economist account for ${cityA} wage levels in a lost earnings claim?`,
      answer: `The plaintiff's own earnings history is the base of the projection. Occupational wage data for the ${cityA} area from the Bureau of Labor Statistics is used to test that history, to project a career that was still developing, and to value residual earnings after the injury, and the ${cityA}-area cost of living enters the replacement cost of household services. Every figure carries its source so it can be traced and tested at deposition.`,
    },
    {
      question: `Do you testify in ${cityName}, ${place}?`,
      answer: `Yes. ${orgName} economists testify at deposition, trial, and arbitration for ${cityA} matters, in person or by remote appearance where the forum allows, and the report is written to the disclosure requirements of the forum that will examine it. Consulting engagements without testimony are also available when counsel needs an early damages estimate or a review of an opposing report.`,
    },
  ];
}

/**
 * Service x State FAQ. `service` carries both names: the full name is the
 * proper noun in the engagement question ("a Wrongful Death Economic Loss
 * engagement"); the short name becomes the work phrase in the coverage
 * question ("provide wrongful death analysis"), so a loss subject is never
 * printed as the thing supplied.
 * @param {string} orgName
 * @param {{ name: string, shortName: string }} service
 * @param {string} stateName
 */
export function serviceStateGeographicFaqs(orgName, service, stateName) {
  const place = placeName(stateName);
  const attr = placeAttr(stateName);
  const svc = service.name;
  const work = workPhrase(service.shortName);
  return [
    {
      question: `Does ${orgName} provide ${work} in ${place}?`,
      answer: `Yes. ${orgName} provides ${work} for attorneys handling matters venued in ${place}, for plaintiff and defense counsel, with the analysis sized to the engagement scope and built from the records that drive the claim and from data for the ${attr} market rather than from national averages.`,
    },
    {
      question: `What does ${indefiniteArticle(svc)} ${svc} engagement look like for a case venued in ${place}?`,
      answer: `A complete engagement typically includes a records request tailored to the claim (tax returns, pay and benefit records, and business financial statements as applicable), a review of the record and the pleadings, a written statement of assumptions, a report that presents each loss component and its present value, review and rebuttal of any opposing report, and deposition and trial testimony when required. Scope and turnaround are calibrated to the case posture and the governing disclosure framework.`,
    },
    {
      question: `When is expert disclosure due in ${place}?`,
      answer: `Disclosure timing is typically set by the scheduling order in the case. Attorneys are responsible for confirming the specific deadlines for their case against primary sources. ${orgName} calibrates engagement scope and turnaround to the disclosure window.`,
    },
  ];
}

/**
 * Service x City FAQ. Same service-name rule as the state FAQ.
 * @param {string} orgName
 * @param {{ name: string, shortName: string }} service
 * @param {string} stateName
 * @param {string} cityName
 */
export function serviceCityGeographicFaqs(orgName, service, stateName, cityName) {
  const place = placeName(stateName);
  const cityA = cityAttr(cityName);
  const work = workPhrase(service.shortName);
  return [
    {
      question: `Does ${orgName} provide ${work} in ${cityName}, ${place}?`,
      answer: `Yes. ${orgName} provides ${work} for attorneys handling matters venued in ${cityName}, ${place}, for plaintiff and defense counsel across the case mix common to ${cityA} matters.`,
    },
    {
      question: `How are ${cityA} wage levels and cost of living handled in the analysis?`,
      answer: `Earnings and household services are measured against the plaintiff's own records and against wage data for the ${cityA} area, with data for ${place} as a whole used only where a local figure is unavailable and only with the substitution stated. The source behind every figure is documented so the loss can be traced and defended.`,
    },
    {
      question: `What deliverables are available for a case venued in ${cityName}?`,
      answer: `${orgName} provides full economic damages reports, preliminary damages estimates for settlement evaluation, reviews and rebuttals of opposing economic reports, and deposition and trial testimony, sized to both trial-track and settlement matters. The appropriate deliverable depends on case posture.`,
    },
  ];
}
