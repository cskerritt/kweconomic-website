// Geographic prose templates - the ONE source of truth for the state/city
// narratives and geo FAQ blocks. Written as plain ESM so that both the React
// runtime (src/data/narratives.ts, src/data/geographicFaqs.ts) and the
// prerenderer (scripts/prerender.mjs, which cannot import TypeScript) render
// byte-identical copy. Inputs are plain data; the callers do the data joins.
//
// Content rules (economics framing): local wage levels, the cost of living,
// and the local industry mix are context for how an analysis is built, never
// a claim about a party, and they enter a pillar's prose only where that
// pillar's work uses them: the personal-loss pillars measure earnings and
// household services against local wage data, the commercial pillars read
// the local market only through normalization, comparables, and the but-for
// projection, fraud and tracing uses none of it, and the matrimonial pillar
// measures actual income (see SERVICE_GEO and its `category` field). The
// place-level paragraphs the templates share across every pillar (the state
// and city narratives) are written so they hold for all of them. No invented
// statistics: the prose never prints unemployment rates, wage figures, or
// dollar amounts. Population and MSA name are allowed; employer names are
// allowed as context only. Citation-free: no statutes, rule numbers, damage
// caps, or case law. Hyphens only (no em/en dashes).
//
// Service.shortName is a heading label ("Fraud & Tracing"); the service x
// state / city templates render it through the shared prose helpers
// (workPhrase: "fraud and tracing analysis") so that neither the hero
// sentence nor the geo FAQ ever prints a loss subject as the thing supplied.
// The same short name keys SERVICE_GEO, the per-pillar angle those templates
// render after the hero's first sentence and in their FAQ blocks.

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

  const forum = trialCourtName ?? "general-jurisdiction trial court";
  // "the District of Columbia" already carries its article.
  const placeThe = place.startsWith("the ") ? place : `the ${place}`;
  const appeals = supremeCourt ? `Final appeals in ${placeThe} court system run to the ${supremeCourt}.` : "";
  const federal =
    federalDistrictCount > 0
      ? `${capFirst(place)} is served by ${federalDistrictCount} federal district court${federalDistrictCount === 1 ? "" : "s"}, where the same analyses are offered under the federal expert-disclosure framework.`
      : "";
  // The shared legal context (state hub, personal-loss and rebuttal pillars):
  // the tort forum and the workers' compensation forum.
  const legalContext = [
    `${forumPhrase(stateName, forum)} is the primary trial-level forum for the personal injury, wrongful death, employment, and commercial damages claims these analyses support.`,
    compensationForum
      ? `Workers' compensation claims, where the dispute is over wage-loss benefits rather than tort damages, are administered by the ${compensationForum}.`
      : "",
    appeals,
    federal,
  ]
    .filter(Boolean)
    .join(" ");
  // The commercial pillars (valuation, lost profits, fraud and tracing) name
  // the claims they support and never the compensation forum, which hears no
  // claim of theirs; the family-financial pillar names the matrimonial part
  // and stops at the appellate sentence (no federal forum hears a divorce).
  // serviceStateLegalContext() picks by pillar category (audit F09).
  const legalContextCommercial = [
    `${forumPhrase(stateName, forum)} is the primary trial-level forum for the shareholder, partnership, contract, and fraud claims these analyses support.`,
    appeals,
    federal,
  ]
    .filter(Boolean)
    .join(" ");
  const legalContextFamily = [
    `Matrimonial matters in ${place} are heard in the family or domestic relations part of the trial courts, where income available for support, the value of a business interest, and the character of an asset as separate or marital are decided.`,
    appeals,
  ]
    .filter(Boolean)
    .join(" ");

  return { directAnswer, economicContext, legalContext, legalContextCommercial, legalContextFamily };
}

/**
 * The legal-context paragraph a service x state page prints under its hero
 * (ServiceState.tsx + prerender): the shared tort-and-compensation paragraph
 * on the personal-loss and rebuttal pillars, the commercial variant on the
 * valuation, lost profits, and fraud pillars, and the matrimonial variant on
 * the family-financial pillar. Takes the raw Service.shortName.
 * @param {string | undefined} serviceShortName
 * @param {{ legalContext: string, legalContextCommercial: string, legalContextFamily: string }} stateNarrative
 * @returns {string}
 */
export function serviceStateLegalContext(serviceShortName, stateNarrative) {
  const category = serviceGeoCategory(serviceShortName);
  if (category === "commercial") return stateNarrative.legalContextCommercial;
  if (category === "family-financial") return stateNarrative.legalContextFamily;
  return stateNarrative.legalContext;
}

/**
 * City narrative. The city page renders the whole of it (`directAnswer`,
 * whose first sentence names the economic damages analyses the hub covers,
 * then `blurb`). The service x city template (every pillar, both render
 * paths) renders serviceCityPlaceParagraph() as its place paragraph under the
 * pillar's own hero, which is the `anchor` sentence alone with the sides
 * sentence: the hero already names the pillar's work, so the shared "prepares
 * economic damages analyses" opener never prints under a valuation, tracing,
 * or matrimonial hero (audit F09). The anchor is written to hold for every
 * pillar: it says which area's data an analysis uses where it uses local data
 * at all, never that earnings or household services are being measured. The
 * hero also takes `venue` or `familyVenue`.
 * @param {{ orgName: string, stateName: string, cityName: string, county?: string,
 *   msaName?: string, employers?: string[], hasMetroData?: boolean,
 *   trialCourtName?: string }} input
 * @returns {{ directAnswer: string, anchor: string, blurb: string, venue: string, familyVenue: string }}
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
    anchor = `Employers such as ${listNames(named)} shape the ${cityA} labor market, and where an analysis turns on local economic conditions it measures them against ${cityA}-area data and the records of the person or business at issue rather than against a citywide average.`;
  } else if (msaName) {
    anchor = `${cityName} sits in the ${msaName} metropolitan area, and where an analysis calls for local economic data, the figures for that area, rather than a statewide average, are the ones used.`;
  } else {
    anchor = `For ${cityName}, local economic data, where an analysis calls for it, comes from the metropolitan or nonmetropolitan area that covers ${county ?? cityName} rather than from a statewide average, so each local figure reflects the market at issue rather than the state as a whole.`;
  }
  const directAnswer = [
    `${orgName} prepares economic damages analyses for cases venued in ${cityName}, ${placeName(stateName)}.`,
    anchor,
    "Plaintiff and defense.",
  ].join(" ");

  const blurbParts = [];
  // The venue sentence is also returned on its own (`venue`, "" when the city
  // carries no county) so serviceCityDirectAnswer() can place it after the
  // pillar's own angle instead of re-parsing the blurb. `familyVenue` is the
  // matrimonial form the family-financial pillar takes instead: the courts
  // data names the general-jurisdiction court, and several states hear
  // divorce in a separate family court, so that sentence names the family or
  // domestic relations part of the county's trial courts rather than the
  // civil court by name.
  let venue = "";
  let familyVenue = "";
  if (county) {
    // When the court's own name already names the county ("Superior Court of
    // the District of Columbia"), the "sitting in" clause would only repeat it.
    let court;
    let familyCourt;
    if (!trialCourtName) {
      court = `the trial court sitting in ${county}`;
      familyCourt = `the family or domestic relations part of the trial courts sitting in ${county}`;
    } else if (trialCourtName.includes(county)) {
      court = `the ${trialCourtName}`;
      familyCourt = `the family or domestic relations part of the ${trialCourtName}`;
    } else {
      court = `the ${trialCourtName} sitting in ${county}`;
      familyCourt = `the family or domestic relations part of the trial courts sitting in ${county}`;
    }
    venue = `Civil claims arising in ${cityName} are typically heard in ${court}.`;
    familyVenue = `Matrimonial matters in ${cityName} are typically heard in ${familyCourt}.`;
    blurbParts.push(venue);
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

  return { directAnswer, anchor, blurb, venue, familyVenue };
}

/**
 * The place paragraph a service x city page prints under its hero
 * (ServiceStateCity.tsx + prerender): the city narrative's anchor sentence
 * (which area's data an analysis uses, where it uses local data at all) and
 * the sides sentence. The hero above it already names the pillar's work, so
 * this paragraph never opens with the hub's "prepares economic damages
 * analyses" sentence (audit F09: that sentence printed under every valuation,
 * tracing, and matrimonial hero). The family-financial pillar closes with the
 * matrimonial sides sentence its FAQ uses; every other pillar keeps
 * "Plaintiff and defense." Takes the raw Service.shortName.
 * @param {string | undefined} serviceShortName
 * @param {{ anchor: string }} cityNarrative
 * @returns {string}
 */
export function serviceCityPlaceParagraph(serviceShortName, cityNarrative) {
  const sides =
    serviceGeoCategory(serviceShortName) === "family-financial"
      ? "The report can be prepared for one spouse, for both, or for the court."
      : "Plaintiff and defense.";
  return `${cityNarrative.anchor} ${sides}`;
}

// ---------------------------------------------------------------------------
// Pillar angles for the service x state and service x city templates.
//
// These templates once appended the shared state or city narrative (BLS wage
// data, fringe benefits, household services) to every pillar, so a business
// valuation page answered a lost earnings question and sibling service pages
// in the same place shared most of their body copy. Each pillar now carries
// its own angle: what the claim consists of, which records drive it, and how
// the number is built in the place. Keyed by Service.shortName exactly as
// written in services.ts, because the short name is the only service field
// the declared hero and FAQ signatures carry on both render paths (the
// prerender reads it by regex, the pages from the TS module). A short name
// without an entry falls back to the sentence it rendered before, so a renamed
// pillar degrades rather than breaks; narratives.parity.test.mjs pins every
// pillar to an entry.
//
// Slot rules: `place` follows in/across/throughout ("the District of
// Columbia"); `attr` and `cityA` are attributive ("District of Columbia law",
// "Bronx-area wage data") and never take an article of their own; no slot is
// preceded by a/an, so "a Alabama" and "a Elizabeth" cannot render. The
// life-care pillar may say "life care plan" but never names the plan's author
// by discipline. Hyphens only; no figures, statutes, or rates.
//
// category: the kind of analysis, which decides how, if at all, local wage,
//   price, and market data enter the pillar's prose and its sidebar panel:
//   "personal-loss" (earnings and household services measured against local
//   wage data), "commercial" (valuation, lost profits, fraud and tracing: the
//   local market enters only through normalization, comparables, and the
//   but-for projection, and not at all in a tracing), "family-financial"
//   (actual income, business cash flow, tracing; the matrimonial forum), and
//   "rebuttal". serviceGeoCategory() reads it; the EconomicContextWidget
//   drops the workers' compensation forum outside personal-loss and rebuttal.
// state(place, attr): one or two sentences after the hero's first sentence.
// city(cityName, cityA, place): one or two sentences after the city hero's
//   first. The hero then takes the city narrative's venue sentence: the
//   civil one on every pillar but the family-financial one, which takes the
//   matrimonial sentence.
// records: the records list in the engagement FAQ.
// engagement(records): replaces the shared engagement answer on the pillars
//   whose engagement is not a damages report.
// coverage(attr): replaces the shared tail of the coverage answer ("built
//   from the records that drive the claim and from data for the <attr>
//   market") where market data is not what the pillar builds from.
// deliverables(orgName): replaces the shared deliverables answer of the city
//   FAQ where "economic damages reports" would misname the work product.
// cityFaq(cityName, cityA, place): replaces the city FAQ's wage-levels
//   question on the pillars where wage levels are not the subject.
// context(place, attr): the sidebar panel's caption on the service x state
//   page (EconomicContextWidget), saying how local data enters this pillar's
//   number; the personal-loss pillars share the default earnings caption.
// ---------------------------------------------------------------------------

export const SERVICE_GEO = {
  "Lost Earnings": {
    category: "personal-loss",
    state: (place) =>
      `The projection starts from the plaintiff's own earnings history, tests it against occupational wage data from the Bureau of Labor Statistics for the metropolitan or nonmetropolitan area of ${place} where the plaintiff worked, carries it over a documented worklife expectancy with wage growth, and discounts it to present value. Fringe benefits are valued from the employer's plan documents or from published employer-cost data, and any post-injury earning capacity is offset against the but-for path rather than assumed away.`,
    city: (cityName, cityA) =>
      `In ${cityName} the earnings base is tested against occupational wage data for the ${cityA} area, and the fringe benefits, worklife expectancy, wage growth, and discount rate behind the projection are each documented with their source so the loss can be traced and tested at deposition.`,
    records:
      "tax returns, wage statements, personnel and benefit plan records, and the medical or work-capacity opinions that define the post-injury earnings path",
  },
  "Wrongful Death": {
    category: "personal-loss",
    state: (place, attr) =>
      `The decedent's earnings and fringe benefits are projected over a documented worklife expectancy, reduced by the decedent's own personal consumption where the ${attr} measure of damages calls for it, and combined with the replacement cost of the household services the decedent would have provided. Each stream is discounted to present value, and the report keeps the components separate so counsel can include or remove any of them as ${attr} law requires.`,
    city: (cityName, cityA) =>
      `For a death case arising in ${cityName}, the decedent's earnings are measured against ${cityA}-area wage data and the decedent's own records, household services are priced at ${cityA}-area replacement rates, and each component is presented on its own so it can be included or removed under the governing measure of damages.`,
    records: "the decedent's tax returns, pay and benefit records, and the household's composition and routine",
  },
  "Personal Injury": {
    category: "personal-loss",
    state: (place) =>
      `One report carries every economic component of the injury claim: lost earnings and fringe benefits measured against the plaintiff's own records and wage data for the area of ${place} where the plaintiff worked, lost household services priced at local replacement rates, and the present value of future medical and care costs supplied by the treating providers or a life care plan, all reduced with consistent growth, discount, and life expectancy assumptions.`,
    city: (cityName, cityA) =>
      `For an injury claim arising in ${cityName}, lost earnings are measured against ${cityA}-area wage data and the plaintiff's own records, household services are priced at ${cityA}-area replacement rates, and any future care costs supplied by the treating providers or a life care plan are carried forward and discounted with the same assumptions.`,
    records: "tax returns, pay and benefit records, and the treating providers' or life care plan's statement of future care",
  },
  "Household Services": {
    category: "personal-loss",
    state: (place) =>
      `The hours the injured or deceased person devoted to meal preparation, cleaning, home and vehicle maintenance, shopping, and the care of others are drawn from national time-use data adjusted to the household's own composition and routine, priced at the wage a replacement worker earns for each task in the area of ${place} where the household lives, carried over the relevant life or worklife expectancy, and discounted to present value.`,
    city: (cityName, cityA) =>
      `For a household in ${cityName}, each category of lost services is priced at the ${cityA}-area replacement wage for that task rather than at a statewide figure, and the hours rest on the household's own composition and pre-injury routine.`,
    records: "the household's composition, the person's pre-injury routine, and any records of paid help",
  },
  "Life Care Plan Costing": {
    category: "personal-loss",
    state: (place) =>
      `The plan's items, frequencies, durations, and unit costs are carried forward with medical cost growth appropriate to each category, discounted over the applicable life expectancy, and presented item by item so counsel and the trier of fact in ${place} can follow each line from the plan to its present value. Authorship of the plan stays with its author; the economist's role is the translation of the plan into a damages figure.`,
    city: (cityName, cityA) =>
      `For a plan prepared for a claimant in ${cityName}, each item is priced as the plan states it, grown at the medical cost index appropriate to its category, and discounted over the applicable life expectancy, with any ${cityA}-area adjustment to a unit cost stated and sourced.`,
    records: "the life care plan itself, its unit-cost sources, and the life expectancy opinion it rests on",
  },
  "Employment Damages": {
    category: "personal-loss",
    state: (place) =>
      `Back pay is reconstructed from the employee's own pay and benefit records, including the raises, bonuses, and benefit accruals the position carried, and front pay is projected over a documented period and discounted to present value. Interim earnings and mitigation are measured against wage data for the employee's occupation in the area of ${place} where the employee worked, and the report presents each element so it can be adjusted to the remedies available under the governing law.`,
    city: (cityName, cityA) =>
      `For an employment claim arising in ${cityName}, the but-for pay path comes from the employee's own records and the mitigation analysis rests on wage data for the employee's occupation in the ${cityA} area, with each element presented separately for the remedy that applies.`,
    records: "pay stubs, W-2s, the personnel file, benefit plan documents, and the record of interim earnings",
  },
  "Business Valuation": {
    category: "commercial",
    state: (place, attr) =>
      `The business is valued from its own financial statements, tax returns, and governing agreements under the income, market, and asset approaches, with the standard of value, the valuation date, and any discounts for lack of control or marketability set by the matter and by ${attr} law as counsel confirms it. Regional market data enters only where the normalization of the company's results or the market-approach comparables call for it, the same valuation methods apply in every ${attr} venue, and every input is documented so the conclusion can be tested at deposition.`,
    city: (cityName, cityA) =>
      `For a business based in ${cityName}, the valuation date and the standard of value are inputs that counsel defines for the matter, the company's own financial statements, tax returns, and governing agreements drive the income, market, and asset approaches, and ${cityA}-area market conditions inform the normalization of its results and the market-approach comparables where local data exists. The same valuation methods apply in every venue, and every input is documented so the value can be tested at deposition.`,
    records: "financial statements, tax returns, the general ledger, and the governing agreements",
    engagement: (records) =>
      `A complete engagement typically includes a records request tailored to the interest being valued (${records}), confirmation with counsel of the valuation date, the standard of value, and the purpose of the valuation, normalization of the financial statements, application of the income, market, and asset approaches as the facts support, a report that documents each input and reconciles the indications of value, review and rebuttal of any opposing valuation report, and deposition and trial testimony when required. Scope and turnaround are calibrated to the case posture and the governing disclosure framework.`,
    deliverables: (orgName) =>
      `${orgName} provides full valuation reports, preliminary estimates of value for settlement evaluation, reviews and rebuttals of opposing valuation reports, and deposition and trial testimony, sized to both trial-track and settlement matters. The appropriate deliverable depends on case posture.`,
    cityFaq: (cityName, cityA) => ({
      question: `What data does a valuation of a business based in ${cityName} rest on?`,
      answer: `The company's own financial statements, tax returns, general ledger, and governing agreements come first. The ${cityA}-area market for its goods and services, comparable transactions, and the cost of capital for a business of its size and risk enter the income and market approaches, and every input is documented so the value can be traced and tested at deposition.`,
    }),
    context: (place, attr) =>
      `Valuation inputs come from the company's own records and its governing agreements. ${attr}-area market data enters only through the normalization of the company's results and the market-approach comparables where local data exists; the source behind each input is documented in the report.`,
  },
  "Lost Profits": {
    category: "commercial",
    state: (place, attr) =>
      `The but-for revenue path is built from the company's own financial history, the ${attr} market and industry mix it sells into, and the terms of the disputed relationship; the costs the company avoided by not earning that revenue are deducted, each claimed loss is linked to the conduct at issue, mitigation is credited, and the period of loss is reasoned through rather than assumed. Historical figures are restated for price level where the record spans several years, and future losses are discounted to present value at a documented rate built up from the risk-free yield curve and the risk of the profit stream, with the components kept separate so counsel can apply the damages rules that govern the ${attr} matter.`,
    city: (cityName, cityA) =>
      `For a business operating in ${cityName}, the but-for revenue path is built from the company's own financial history and from the ${cityA}-area market conditions and industry mix it sells into. The costs avoided by not earning that revenue are deducted, mitigation is credited, the period of loss is reasoned through rather than assumed, and each claimed loss is tied to the conduct at issue.`,
    records: "financial statements, budgets and forecasts, the disputed contract, and the company's customer and cost records",
    engagement: (records) =>
      `A complete engagement typically includes a records request tailored to the claim (${records}), a review of the record and the pleadings, a written statement of assumptions, a report that presents the but-for revenue path, the avoided costs, the mitigation offset, and the period of loss with the present value of any future loss, review and rebuttal of any opposing damages model, and deposition and trial testimony when required. Scope and turnaround are calibrated to the case posture and the governing disclosure framework.`,
    deliverables: (orgName) =>
      `${orgName} provides full lost profits and commercial damages reports, preliminary damages estimates for settlement evaluation, reviews and rebuttals of opposing damages models, and deposition and trial testimony, sized to both trial-track and settlement matters. The appropriate deliverable depends on case posture.`,
    cityFaq: (cityName, cityA) => ({
      question: `How is the but-for revenue path built for a business in ${cityName}?`,
      answer: `From the company's own financial history, the ${cityA}-area market conditions and industry mix it sells into, and the terms of the disputed relationship. The costs avoided by not earning the lost revenue are deducted, each claimed loss is linked to the conduct at issue, mitigation is credited, and the period of loss is reasoned through rather than assumed, with the source behind every figure documented so the damages figure can be traced and tested.`,
    }),
    context: (place, attr) =>
      `The but-for projection rests on the company's own financial history. ${attr}-area market conditions and industry mix enter it where the company sells into that market, and the avoided costs, the mitigation offset, and the period of loss are documented alongside it with their sources.`,
  },
  "Fraud & Tracing": {
    category: "commercial",
    state: (place, attr) =>
      `The work reconstructs the flow of funds through bank, ledger, and payment records, traces diverted assets to where they came to rest, and quantifies the loss for each scheme identified, with the evidence trail documented so it can support a civil claim in ${place}, an insurance recovery, or a referral to authorities. The reconciliation and tracing are built the same way in every venue from the entity's own records; the ${attr} forum shapes discovery and the presentation of the schedules, and the report establishes what happened to the money without opining on intent.`,
    city: (cityName) =>
      `For an entity based in ${cityName}, the records reconciliation and the funds-flow tracing are venue-independent: they run through the entity's own bank, ledger, and payment records and the accounts the funds moved into, and each transfer is documented to its source so the loss for each scheme can be tested at deposition. The local forum governs discovery and how the schedules are presented, and the report establishes what happened to the money without opining on intent.`,
    records: "bank statements, the general ledger, payment records, and the account records the funds moved into",
    engagement: (records) =>
      `A fraud and tracing engagement typically includes a records request (${records}), reconstruction of the funds flow and identification of the transactions that fall outside authorized activity, tracing of the diverted funds to where they came to rest, tracing schedules with the supporting documents indexed to each transaction and the loss quantified by scheme and period, and deposition and trial testimony when required. Scope and turnaround are calibrated to the transaction volume, the case posture, and the governing disclosure framework.`,
    coverage: () =>
      "with the analysis sized to the engagement scope and built from the entity's own bank, ledger, and payment records and the accounts the funds moved into.",
    deliverables: (orgName) =>
      `${orgName} provides tracing schedules with the supporting documents indexed to each transaction, loss quantifications by scheme and period, reports written to support a civil claim, an insurance recovery, or a referral, reviews and rebuttals of opposing accounting analyses, and deposition and trial testimony. The appropriate deliverable depends on case posture.`,
    cityFaq: (cityName) => ({
      question: `What records drive a fraud and tracing engagement for an entity based in ${cityName}?`,
      answer: `Bank statements, the general ledger, payment records, and the account records the diverted funds moved into. The tracing follows each transfer from its source to where the funds came to rest, quantifies the loss for each scheme identified, and documents the evidence trail so it can support a civil claim, an insurance recovery, or a referral. Whether the conduct was fraudulent is a question for the fact finder, and the report does not reach it.`,
    }),
    context: (place) =>
      `The tracing figure rests entirely on the entity's own bank, ledger, and payment records and is built the same way in every venue; ${place} enters as the forum for discovery and presentation, not as a data source.`,
  },
  "Divorce Financial Analysis": {
    category: "family-financial",
    state: (place, attr) =>
      `Income available for support is determined from the spouse's own tax, business, and pay records, including business cash flow and perquisites that never reach a pay stub, business interests in the marital estate are valued under the standard of value and the valuation date that ${attr} matrimonial practice applies, and separate and marital funds are traced through accounts and assets. The analysis measures the income the records show; what a spouse could earn in other work is a question for a vocational specialist rather than for the income analysis. Each finding is presented so it can be applied under either party's position.`,
    city: (cityName, cityA) =>
      `For a matrimonial matter in ${cityName}, the income analysis measures what a spouse actually receives in pay, business cash flow, and perquisites paid through a business, a marital business is valued from its own records and the ${cityA}-area market it serves, and separate and marital funds are traced through accounts and assets to their source. What a spouse could earn in other work is a question for a vocational specialist rather than for the income analysis.`,
    records: "tax returns, business financial statements, account statements, and the household's spending records",
    engagement: (records) =>
      `A matrimonial engagement typically includes a records request tailored to the questions at issue (${records}), reconstruction of income available for support from the business's books, bank records, and tax returns together, valuation of any business interest under the applicable standard of value, a lifestyle analysis where counsel asks for one, tracing of separate and marital funds through the account history, a report organized by question with schedules that tie to source documents, and deposition, settlement conference, and trial testimony when required. The report can be prepared for one spouse, for both, or for the court.`,
    deliverables: (orgName) =>
      `${orgName} provides income determinations for support, business valuations, lifestyle analyses, and tracing schedules as separate report sections that can be used on their own, reviews and rebuttals of opposing financial analyses, settlement conference support, and deposition and trial testimony, prepared for one spouse, for both, or for the court. The appropriate deliverable depends on the questions at issue and the case posture.`,
    cityFaq: (cityName) => ({
      question: `How are income and business value determined in a matrimonial matter venued in ${cityName}?`,
      answer: `Income available for support is determined from the spouse's own tax, business, and pay records, including business cash flow that never reaches a pay stub, a business interest in the marital estate is valued from its own financial statements and the local market it serves, and separate and marital funds are traced through accounts and assets. Each finding is presented so it can be applied under either party's position.`,
    }),
    context: (place, attr) =>
      `Income available for support is measured from the spouse's own tax, business, and account records, a marital business from its own statements and the ${attr}-area market it serves, and separate and marital funds by tracing; the source behind each figure is documented in the report.`,
  },
  Rebuttal: {
    category: "rebuttal",
    state: (place, attr) =>
      `The review tests the opposing report's assumptions, data sources, discount rate, worklife and life expectancy inputs, growth rates, mitigation treatment, and arithmetic against the record and the published data, identifies the errors that matter, and quantifies how the conclusion changes when they are corrected. The critique is written to the reliability standard the ${attr} forum applies to expert opinion and to its disclosure practice.`,
    city: (cityName, cityA) =>
      `For a report offered in a case venued in ${cityName}, each input is checked against the records that drive the claim and against the published data for the ${cityA} area, and the review states where the two analyses part ways and by how much.`,
    records: "the opposing report, its workpapers and data sources, and the underlying records it relied on",
    engagement: () =>
      `A rebuttal engagement typically includes a records request for the opposing report, its workpapers, and the data it relied on, a line-by-line review of the assumptions, inputs, and arithmetic, a written critique that quantifies how the conclusion changes when each error is corrected, an affirmative alternative calculation where counsel wants one, and deposition and trial testimony when required. Scope and turnaround are calibrated to the case posture and the governing disclosure framework.`,
    cityFaq: (cityName) => ({
      question: `What does a rebuttal of an opposing economic report cover for a case venued in ${cityName}?`,
      answer: `The assumptions, data sources, discount rate, worklife and life expectancy inputs, growth rates, mitigation treatment, and arithmetic behind the opposing number, each checked against the record and the published data. The critique identifies the errors that matter and quantifies how the conclusion changes when they are corrected.`,
    }),
    context: (place) =>
      `The review checks the opposing report's inputs, whatever the loss stream, against the record and against the published data for ${place}, and states where the two analyses part ways and by how much.`,
  },
};

/**
 * The kind of analysis a pillar performs (see the SERVICE_GEO `category`
 * field): "personal-loss", "commercial", "family-financial", or "rebuttal".
 * A short name without an entry, or none at all (the state hub and city
 * pages), reads as personal-loss, the framing the shared narratives carry.
 * @param {string | undefined} serviceShortName
 * @returns {"personal-loss" | "commercial" | "family-financial" | "rebuttal"}
 */
export function serviceGeoCategory(serviceShortName) {
  return (serviceShortName && SERVICE_GEO[serviceShortName]?.category) || "personal-loss";
}

/**
 * Caption of the geo sidebar's economic-context panel (EconomicContextWidget):
 * how, if at all, local data enters the number the page is about. The
 * personal-loss pillars and the hub pages (no service) share the earnings
 * caption; the commercial, family-financial, and rebuttal pillars carry their
 * own. `areaName` is a state or city name as the data spells it; it is read
 * as a place after a preposition ("the District of Columbia") and bare in the
 * attributive slot ("District of Columbia-area", "Bronx-area").
 * @param {string | undefined} serviceShortName
 * @param {string} areaName
 * @returns {string}
 */
export function economicContextCaption(serviceShortName, areaName) {
  const angle = serviceShortName ? SERVICE_GEO[serviceShortName] : undefined;
  const place = placeName(areaName);
  const attr = cityAttr(placeAttr(areaName));
  if (angle?.context) return angle.context(place, attr);
  return `Earnings and household-services figures are measured against ${attr}-area wage data and the plaintiff's own records; the source behind each figure is documented in the report.`;
}

/** The sentence a short name without a SERVICE_GEO entry renders on the city
 * hero (the state hero falls back to the state narrative's economic context). */
const defaultCityAngle = (cityA) =>
  `The report documents the source behind every figure so counsel can trace each component of the loss to ${cityA}-area data or to the records that drive the claim.`;

/** Service x State hero sentence (ServiceState.tsx + prerender). Takes the
 * raw Service.shortName and renders the work the pillar performs
 * ("KW Economics provides wrongful death analysis for matters venued in
 * Texas."), never the short name as the thing supplied, followed by the
 * pillar's own angle for the place. */
export function serviceStateDirectAnswer(orgName, serviceShortName, stateName, stateNarrative) {
  const place = placeName(stateName);
  const angle = SERVICE_GEO[serviceShortName];
  const body = angle ? angle.state(place, placeAttr(stateName)) : stateNarrative.economicContext;
  return `${orgName} provides ${workPhrase(serviceShortName)} for matters venued in ${place}. ${body} Plaintiff and defense.`;
}

/** Service x City hero sentence (ServiceStateCity.tsx + prerender). Same
 * work-phrase rule as the state sentence; then the pillar's angle for the
 * city, the city narrative's venue sentence (the matrimonial one on the
 * family-financial pillar, the civil one everywhere else), and testimony
 * availability. The angle comes before the venue so the first 160 characters
 * (the shells' meta description) name the subject of the page. */
export function serviceCityDirectAnswer(orgName, serviceShortName, stateName, cityName, cityNarrative) {
  const place = placeName(stateName);
  const cityA = cityAttr(cityName);
  const angle = SERVICE_GEO[serviceShortName];
  const parts = [
    `${orgName} provides ${workPhrase(serviceShortName)} for cases venued in ${cityName}, ${place}.`,
    angle ? angle.city(cityName, cityA, place) : defaultCityAngle(cityA),
  ];
  const venue =
    angle?.category === "family-financial" ? cityNarrative.familyVenue || cityNarrative.venue : cityNarrative.venue;
  if (venue) parts.push(venue);
  parts.push(
    `Deposition and trial testimony are available for ${cityA} matters, in person or by remote appearance where the forum allows.`,
  );
  return parts.join(" ");
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
  const angle = SERVICE_GEO[service.shortName];
  const records = angle?.records ?? "tax returns, pay and benefit records, and business financial statements as applicable";
  const engagement = angle?.engagement
    ? angle.engagement(records)
    : `A complete engagement typically includes a records request tailored to the claim (${records}), a review of the record and the pleadings, a written statement of assumptions, a report that presents each loss component and its present value, review and rebuttal of any opposing report, and deposition and trial testimony when required. Scope and turnaround are calibrated to the case posture and the governing disclosure framework.`;
  const coverage = angle?.coverage
    ? angle.coverage(attr)
    : `with the analysis sized to the engagement scope and built from the records that drive the claim and from data for the ${attr} market rather than from national averages.`;
  return [
    {
      question: `Does ${orgName} provide ${work} in ${place}?`,
      answer: `Yes. ${orgName} provides ${work} for attorneys handling matters venued in ${place}, for plaintiff and defense counsel, ${coverage}`,
    },
    {
      question: `What does ${indefiniteArticle(svc)} ${svc} engagement look like for a case venued in ${place}?`,
      answer: engagement,
    },
    {
      // Jurisdiction-neutral and identical on every pillar by design: the
      // date is set case by case, so the answer explains who sets it and how
      // the engagement is sized to it. "${attr} trial courts" rather than
      // "state court" so the District and the territories read correctly.
      question: `When is expert disclosure due for a case venued in ${place}?`,
      answer: `Expert disclosure in ${place} is scheduled case by case: in the ${attr} trial courts by the case management or scheduling order, and in the federal district courts serving ${place} by the federal expert-disclosure framework, under which the written report, the materials considered, and the testimony history are served together. ${orgName} confirms the disclosure date at retention and sizes the records request and turnaround to it; counsel confirms the governing deadline for the case.`,
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
  const angle = SERVICE_GEO[service.shortName];
  // Wage levels are the subject on the injury, death, household, life-care,
  // and employment pillars; the commercial pillars and rebuttal ask about the
  // records that drive their own number instead.
  const second = angle?.cityFaq
    ? angle.cityFaq(cityName, cityA, place)
    : {
        question: `How are ${cityA} wage levels and cost of living handled in the analysis?`,
        answer: `Earnings and household services are measured against the plaintiff's own records and against wage data for the ${cityA} area, with data for ${place} as a whole used only where a local figure is unavailable and only with the substitution stated. The source behind every figure is documented so the loss can be traced and defended.`,
      };
  return [
    {
      question: `Does ${orgName} provide ${work} in ${cityName}, ${place}?`,
      answer: `Yes. ${orgName} provides ${work} for attorneys handling matters venued in ${cityName}, ${place}, for plaintiff and defense counsel across the case mix common to ${cityA} matters.`,
    },
    second,
    {
      question: `What deliverables are available for a case venued in ${cityName}?`,
      answer: angle?.deliverables
        ? angle.deliverables(orgName)
        : `${orgName} provides full economic damages reports, preliminary damages estimates for settlement evaluation, reviews and rebuttals of opposing economic reports, and deposition and trial testimony, sized to both trial-track and settlement matters. The appropriate deliverable depends on case posture.`,
    },
  ];
}
