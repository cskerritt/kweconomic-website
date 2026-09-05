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
  /** The tort forum and the workers' compensation forum (state hub, personal-loss and rebuttal pillars). */
  legalContext: string;
  /** The commercial pillars' variant: the claims they support, appeals, and the federal forum; no compensation forum. */
  legalContextCommercial: string;
  /** The family-financial pillar's variant: the matrimonial part and the appellate court. */
  legalContextFamily: string;
}
export function buildStateNarrative(input: StateNarrativeInput): StateNarrativeOutput;
/** The legal-context paragraph a service x state page prints for the pillar (by serviceGeoCategory). Takes the raw Service.shortName. */
export function serviceStateLegalContext(serviceShortName: string | undefined, n: StateNarrativeOutput): string;

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
  /** The place sentence alone (which area's data an analysis uses where it uses local data at all); the service x city place paragraph is built from it. */
  anchor: string;
  blurb: string;
  /** "Civil claims arising in <city> are typically heard in ..." ("" when the city carries no county). */
  venue: string;
  /** The matrimonial form of `venue`, taken by the family-financial pillar ("" when the city carries no county). */
  familyVenue: string;
}
export function buildCityNarrative(input: CityNarrativeInput): CityNarrativeOutput;
/** The place paragraph a service x city page prints under its hero: the anchor sentence and the pillar's sides sentence. Takes the raw Service.shortName. */
export function serviceCityPlaceParagraph(serviceShortName: string | undefined, n: Pick<CityNarrativeOutput, "anchor">): string;

/** The kind of analysis a pillar performs; decides how local data enters its geo prose and sidebar panel. */
export type GeoServiceCategory = "personal-loss" | "commercial" | "family-financial" | "rebuttal";
/** One pillar's geo angles (see the SERVICE_GEO comment in geo-prose.mjs for each slot). */
export interface ServiceGeoAngle {
  category: GeoServiceCategory;
  state: (place: string, attr: string) => string;
  city: (cityName: string, cityA: string, place: string) => string;
  records: string;
  engagement?: (records: string) => string;
  coverage?: (attr: string) => string;
  deliverables?: (orgName: string) => string;
  cityFaq?: (cityName: string, cityA: string, place: string) => Faq;
  context?: (place: string, attr: string) => string;
}
/** Per-pillar angles keyed by Service.shortName exactly as written in services.ts. */
export const SERVICE_GEO: Record<string, ServiceGeoAngle>;
/** Category of a Service.shortName; no service, or one without an entry, reads as personal-loss. */
export function serviceGeoCategory(serviceShortName?: string): GeoServiceCategory;
/** Caption of the geo sidebar's economic-context panel for the pillar (the shared earnings caption when no service is given). */
export function economicContextCaption(serviceShortName: string | undefined, areaName: string): string;

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
