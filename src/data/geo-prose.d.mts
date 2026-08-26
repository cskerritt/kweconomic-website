// Type surface for src/data/geo-prose.mjs (shared with scripts/prerender.mjs).
import type { Faq } from "./types";

export const HEALTH_SYSTEM_RE: RegExp;
export const ISLAND_SLUGS: Set<string>;
export function placeName(stateName: string): string;
export function careMedicalCenters(topEmployers: readonly string[] | undefined): string[];

export interface StateNarrativeInput {
  orgName: string;
  stateName: string;
  stateSlug?: string;
  region?: string;
  population?: number;
  trialCourtName?: string;
  supremeCourt?: string;
  federalDistrictCount?: number;
  careOversightAgency?: string;
}
export interface StateNarrativeOutput {
  directAnswer: string;
  careContext: string;
  legalContext: string;
}
export function buildStateNarrative(input: StateNarrativeInput): StateNarrativeOutput;

export interface CityNarrativeInput {
  orgName: string;
  stateName: string;
  cityName: string;
  county?: string;
  msaName?: string;
  medicalCenters?: string[];
  hasMetroData?: boolean;
  trialCourtName?: string;
}
export interface CityNarrativeOutput {
  directAnswer: string;
  blurb: string;
}
export function buildCityNarrative(input: CityNarrativeInput): CityNarrativeOutput;

export function serviceStateDirectAnswer(orgName: string, serviceShortName: string, stateName: string, n: StateNarrativeOutput): string;
export function serviceCityDirectAnswer(orgName: string, serviceShortName: string, stateName: string, cityName: string, n: CityNarrativeOutput): string;
export function stateGeographicFaqs(orgName: string, stateName: string): Faq[];
export function cityGeographicFaqs(orgName: string, stateName: string, cityName: string): Faq[];
export function serviceStateGeographicFaqs(orgName: string, serviceName: string, stateName: string): Faq[];
export function serviceCityGeographicFaqs(orgName: string, serviceName: string, stateName: string, cityName: string): Faq[];
