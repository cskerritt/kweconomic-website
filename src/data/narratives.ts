/**
 * State + city narrative helpers. These synthesize short factual paragraphs
 * from the courts / regulations / metro data so each geographic page (state
 * hub, service-state, city, service-city) has unique, life-care-planning
 * copy without hand-authoring 56 state essays + 800 city blurbs.
 *
 * The sentence templates live in ./geo-prose.mjs, which scripts/prerender.mjs
 * imports too - this module only does the data joins. Citation-free by
 * policy; never prints wages, unemployment, or employer lists.
 */

import { ORG_NAME } from "@/lib/brand";
import { getMetroLabor } from "./labor/metro-labor";
import { getCourtsByState } from "./courts/state-courts";
import { getRegulationsByState } from "./regulations/state-regs";
import {
  buildCityNarrative,
  buildStateNarrative,
  careMedicalCenters,
  type CityNarrativeOutput,
  type StateNarrativeOutput,
} from "./geo-prose.mjs";
import type { State } from "../types";

export type StateNarrative = StateNarrativeOutput;
export type CityNarrative = CityNarrativeOutput;

export function getStateNarrative(state: State): StateNarrative {
  const courts = getCourtsByState(state.slug);
  const regs = getRegulationsByState(state.slug);
  return buildStateNarrative({
    orgName: ORG_NAME,
    stateName: state.name,
    region: state.region,
    population: state.population,
    trialCourtName: courts?.trialCourts?.[0]?.name,
    supremeCourt: courts?.supremeCourt,
    federalDistrictCount: courts?.federalDistricts?.length ?? 0,
    careOversightAgency: regs?.careOversightAgency,
  });
}

export interface CityNarrativeExtras {
  msaName?: string;
}

export function getCityNarrative(
  state: State,
  cityName: string,
  citySlug: string,
  county?: string,
  extras: CityNarrativeExtras = {},
): CityNarrative {
  const metro = getMetroLabor(state.slug, citySlug);
  const courts = getCourtsByState(state.slug);
  return buildCityNarrative({
    orgName: ORG_NAME,
    stateName: state.name,
    cityName,
    county,
    msaName: extras.msaName,
    medicalCenters: careMedicalCenters(metro?.topEmployers),
    hasMetroData: metro !== undefined,
    trialCourtName: courts?.trialCourts?.[0]?.name,
  });
}
