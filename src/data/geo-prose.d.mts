// Type surface for src/data/geo-prose.mjs (shared with scripts/prerender.mjs).
import type { Faq } from "./types";

export const ISLAND_SLUGS: Set<string>;
/** The territories whose own trade secret law the intellectual property prose makes no claim about (Guam, the Northern Mariana Islands, American Samoa). */
export const LOCAL_TRADE_SECRET_LAW_UNSTATED: Set<string>;
export function placeName(stateName: string): string;
/** Bare name for attributive slots ("District of Columbia wage levels"); accepts a raw state name or a placeName() result. */
export function placeAttr(name: string): string;
/** Running-prose place name: placeName() plus the article the plural island names take ("the U.S. Virgin Islands"); accepts a raw state name or a placeName() result. */
export function prosePlace(name: string): string;
/** Possessive of the running-prose name ("Texas's", "the District of Columbia's", "the U.S. Virgin Islands'"); accepts a raw state name or a placeName() result. */
export function placePossessive(name: string): string;
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
  /** The courts the intellectual property case-type pages list for the claims under the place's own law (the business selection, two deep); the IP legal context names them. */
  ipTrialCourtNames?: string[];
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
  /** The transfer pricing pillar's variant: the federal tax forums, the state's forum for the civil claims and its tax appeal process, appeals, and the federal district courts. */
  legalContextTax: string;
  /** The intellectual property pillar's variant: the federal district courts serving the place for a patent or copyright case filed there (or, for a place without one, where such a claim is filed) with the Federal Circuit, the place's courts for the claims under its own law brought on their own, and appeals. */
  legalContextIp: string;
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
  /** The courts the intellectual property case-type pages list (see StateNarrativeInput); `ipVenue` names them. */
  ipTrialCourtNames?: string[];
}
export interface CityNarrativeOutput {
  directAnswer: string;
  /** The place sentence alone (which area's data an analysis uses where it uses local data at all); the service x city place paragraph is built from it. */
  anchor: string;
  /** The transfer pricing pillar's place sentence: where a federal or state tax dispute for a business based in the city is heard. */
  taxAnchor: string;
  /** The intellectual property pillar's place sentence: where the appeals that govern a patent case involving a business in the city go. */
  ipAnchor: string;
  blurb: string;
  /** "Civil claims arising in <city> are typically heard in ..." ("" when the city carries no county). */
  venue: string;
  /** The matrimonial form of `venue`, taken by the family-financial pillar ("" when the city carries no county). */
  familyVenue: string;
  /** The intellectual property form of `venue`: patent and copyright claims in federal court, usually with the related claims under the place's own law, and a license or royalty dispute brought on its own in the county's courts ("" when the city carries no county). */
  ipVenue: string;
}
export function buildCityNarrative(input: CityNarrativeInput): CityNarrativeOutput;
/** The place paragraph a service x city page prints under its hero: the anchor sentence (the tax anchor on the transfer pricing pillar, the IP anchor on the intellectual property pillar) and the pillar's sides sentence. Takes the raw Service.shortName. */
export function serviceCityPlaceParagraph(serviceShortName: string | undefined, n: Pick<CityNarrativeOutput, "anchor"> & Partial<Pick<CityNarrativeOutput, "taxAnchor" | "ipAnchor">>): string;

/** The kind of analysis a pillar performs; decides how local data enters its geo prose and sidebar panel. */
export type GeoServiceCategory = "personal-loss" | "commercial" | "family-financial" | "tax" | "intellectual-property" | "rebuttal";
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
  disclosure?: (orgName: string, place: string, attr: string) => string;
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
