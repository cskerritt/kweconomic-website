// Type surface for src/data/geo-prose.mjs (shared with scripts/prerender.mjs).
import type { Faq } from "./types";

export const ISLAND_SLUGS: Set<string>;
export function placeName(stateName: string): string;
/** Bare name for attributive slots ("District of Columbia wage levels"); accepts a raw state name or a placeName() result. */
export function placeAttr(name: string): string;
/** "The Bronx" -> "Bronx" for attributive slots ("the Bronx area"). */
export function cityAttr(cityName: string): string;
/** The first five employer names for a metro, in data order (context only). */
export function majorEmployers(topEmployers: readonly string[] | undefined): string[];

export interface StateNarrativeInput {
  orgName: string;
  stateName: string;
  stateSlug?: string;
  region?: string;
  population?: number;
  trialCourtName?: string;
  supremeCourt?: string;
  federalDistrictCount?: number;
  compensationForum?: string;
}
export interface StateNarrativeOutput {
  directAnswer: string;
  economicContext: string;
  legalContext: string;
}
export function buildStateNarrative(input: StateNarrativeInput): StateNarrativeOutput;

export interface CityNarrativeInput {
  orgName: string;
  stateName: string;
  cityName: string;
  county?: string;
  msaName?: string;
  employers?: string[];
  hasMetroData?: boolean;
  trialCourtName?: string;
}
export interface CityNarrativeOutput {
  directAnswer: string;
  blurb: string;
}
export function buildCityNarrative(input: CityNarrativeInput): CityNarrativeOutput;

/** The two names a service x geo template needs: the full name (proper noun in
 * the engagement question) and the short name (rendered as the work phrase). */
export interface ServiceNames {
  name: string;
  shortName: string;
}

/** Takes the raw Service.shortName; renders "<org> provides <work phrase> for matters venued in <place>." */
export function serviceStateDirectAnswer(orgName: string, serviceShortName: string, stateName: string, n: StateNarrativeOutput): string;
export function serviceCityDirectAnswer(orgName: string, serviceShortName: string, stateName: string, cityName: string, n: CityNarrativeOutput): string;
export function stateGeographicFaqs(orgName: string, stateName: string): Faq[];
export function cityGeographicFaqs(orgName: string, stateName: string, cityName: string): Faq[];
export function serviceStateGeographicFaqs(orgName: string, service: ServiceNames, stateName: string): Faq[];
export function serviceCityGeographicFaqs(orgName: string, service: ServiceNames, stateName: string, cityName: string): Faq[];
