/**
 * State + city narrative helpers. These synthesize 2-3 sentence factual
 * paragraphs from existing labor/courts/regulations data so each
 * geographic page (state hub, service-state, AR-state, city, etc.) has
 * unique, citable copy without hand-authoring 56 state essays + 800 city
 * blurbs.
 *
 * Citation-free by policy: helpers describe markets, courts, and agencies
 * factually but do not cite specific rules, statutes, or case law.
 */

import { getLaborByState } from "./labor/state-labor";
import { getMetroLabor } from "./labor/metro-labor";
import { getCourtsByState } from "./courts/state-courts";
import { getRegulationsByState } from "./regulations/state-regs";
import type { State } from "../types";

export interface StateNarrative {
  /** ~50-80 word direct-answer paragraph for the top of the page. */
  directAnswer: string;
  /** ~40-60 word labor/economic context. */
  marketContext: string;
  /** ~40-60 word courts + agency context. */
  legalContext: string;
}

const fmtMoney = (n?: number) =>
  typeof n === "number" ? `$${n.toLocaleString("en-US")}` : "";

const fmtRate = (n?: number) =>
  typeof n === "number" ? `${n.toFixed(1)}%` : "";

export function getStateNarrative(state: State): StateNarrative {
  const labor = getLaborByState(state.slug);
  const courts = getCourtsByState(state.slug);
  const regs = getRegulationsByState(state.slug);

  const topIndustry = labor?.topIndustries?.[0]?.name;
  const medianHourly = fmtMoney(labor?.medianHourlyWage);
  const medianHousehold = fmtMoney(labor?.medianHouseholdIncome);
  const unemployment = fmtRate(labor?.unemploymentRate);

  const trialCourtName = courts?.trialCourts?.[0]?.name ?? "general-jurisdiction trial court";
  const supremeCourt = courts?.supremeCourt;
  const federalDistrictCount = courts?.federalDistricts?.length ?? 0;
  const agency = regs?.vocationalRehabAgency;

  const directAnswer = [
    `KWVRS provides vocational, economic, and life care expert services for matters venued in ${state.name}.`,
    topIndustry
      ? `${state.name}'s labor market is anchored by ${topIndustry.toLowerCase()}${
          medianHourly ? ` with a ${medianHourly}/hr median wage` : ""
        }.`
      : `${state.name} matters span personal injury, motor vehicle, workers' compensation, wrongful-death, and matrimonial work.`,
    "Plaintiff and defense.",
  ]
    .filter(Boolean)
    .join(" ");

  const marketParts: string[] = [];
  if (labor) {
    if (medianHousehold) {
      marketParts.push(
        `${state.name} reports a ${medianHousehold} median household income${medianHourly ? ` and a ${medianHourly}/hr median wage` : ""}.`,
      );
    }
    if (unemployment) {
      marketParts.push(`Statewide unemployment runs near ${unemployment}.`);
    }
    if (topIndustry) {
      const top3 = labor.topIndustries
        ?.slice(0, 3)
        .map((i) => i.name)
        .join(", ");
      if (top3) {
        marketParts.push(`Top sectors are ${top3}.`);
      }
    }
  }
  const marketContext =
    marketParts.length > 0
      ? marketParts.join(" ")
      : `Earning capacity and economic-loss analyses in ${state.name} draw on state-level wage benchmarks and regional industry mix.`;

  const legalParts: string[] = [];
  if (trialCourtName) {
    legalParts.push(`${state.name}'s ${trialCourtName} is the primary trial-level forum for civil matters.`);
  }
  if (supremeCourt) {
    legalParts.push(`Final state-court appeals run to the ${supremeCourt}.`);
  }
  if (federalDistrictCount > 0) {
    legalParts.push(
      `${state.name} is served by ${federalDistrictCount} federal district court${federalDistrictCount === 1 ? "" : "s"}.`,
    );
  }
  if (agency) {
    legalParts.push(`The ${agency} administers vocational rehabilitation in the state.`);
  }
  const legalContext =
    legalParts.length > 0
      ? legalParts.join(" ")
      : `${state.name} matters proceed under the state's civil procedure framework with case-specific scheduling.`;

  return { directAnswer, marketContext, legalContext };
}

export interface CityNarrative {
  /** ~40-60 word direct-answer paragraph for the top of the city page. */
  directAnswer: string;
  /** ~30-50 word local-context blurb. Each city's blurb is unique when metro
   * data is available; falls back to state-level framing otherwise. */
  blurb: string;
}

export function getCityNarrative(
  state: State,
  cityName: string,
  citySlug: string,
  county?: string,
): CityNarrative {
  const metro = getMetroLabor(state.slug, citySlug);
  const stateLabor = getLaborByState(state.slug);

  const wage = fmtMoney(metro?.medianHourlyWage);
  const topIndustry = metro?.topIndustries?.[0]?.name;
  const stateTopIndustry = stateLabor?.topIndustries?.[0]?.name;
  const topEmployer = metro?.topEmployers?.[0];
  const unemployment = metro?.unemploymentRate;

  // directAnswer carries the wage. blurb must NOT repeat it.
  const directAnswer = [
    `KWVRS provides vocational, economic, and life care expert services for cases venued in ${cityName}, ${state.name}.`,
    topIndustry
      ? `${cityName}'s economy is anchored by ${topIndustry.toLowerCase()}${wage ? ` with a ${wage}/hr median wage` : ""}.`
      : stateTopIndustry
        ? `${cityName} sits in a labor market shaped by ${state.name}'s ${stateTopIndustry.toLowerCase()} sector.`
        : `${cityName} matters draw on regional labor market data tailored to ${state.name}.`,
    "Plaintiff and defense.",
  ].join(" ");

  // Build a unique-per-city blurb. Avoid repeating the wage (it's in directAnswer).
  // Pull in: top 3 sectors, top employer, unemployment trend, county venue framing.
  const blurbParts: string[] = [];
  if (metro) {
    const top3 = metro.topIndustries?.slice(0, 3).map((i) => i.name).join(", ");
    if (top3) blurbParts.push(`Top sectors include ${top3}.`);
    if (topEmployer) blurbParts.push(`Major employers such as ${topEmployer} anchor the local labor market.`);
    if (typeof unemployment === "number") {
      blurbParts.push(`Local unemployment runs at ${unemployment.toFixed(1)}%.`);
    }
  }
  if (county) {
    blurbParts.push(`${cityName} matters typically venue in ${county} court.`);
  }
  blurbParts.push(
    metro
      ? `Earning capacity and economic-loss analyses for ${cityName} cases incorporate metro-level wage and industry data.`
      : `Analyses for ${cityName} cases incorporate ${state.name} state-level wage data with metro-level adjustments where applicable.`,
  );
  const blurb = blurbParts.join(" ");

  return { directAnswer, blurb };
}
