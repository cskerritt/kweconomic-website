// Page <title> builders shared by the React templates (src/pages/**) and the
// static shells (scripts/prerender.mjs), so both sides advertise one title per
// URL and every title fits the 60-character SERP window (TITLE_MAX), brand
// suffix included. Plain ESM (with page-titles.d.mts for the type surface),
// like src/data/geo-prose.mjs and src/data/team-meta.mjs, because
// prerender.mjs runs under node and cannot import TypeScript.
//
// Every builder keeps the primary keyword and the place or case-type
// qualifier, and shortens only what cannot fit, one rung at a time:
//
// - State tiers (placeTitle): the fullest label beside the full place name
//   first ("Employment Discrimination Economist in Texas"), then the shorter
//   label beside the full place name ("Discrimination Economist in North
//   Carolina"), and the state abbreviation only where no label fits beside
//   the full place name, fullest label first ("Employment Discrimination
//   Economist in DC").
// - City tiers (cityTitle): the fullest label with the city and its state
//   abbreviation, then the shorter label with both, and the abbreviation
//   dropped only where no label fits beside it ("Forensic Economists in San
//   Francisco Bay Area"), fullest label first. The abbreviation is what keeps
//   Fayetteville, AR apart from Fayetteville, NC, so it outranks the label.
// - Service x case-type pairs (pairTitle): the heading label with "Expert",
//   then without it, and only then the shorter label the same two ways.
//
// The shorter forms come from the data: a case type's shortName (the stem
// becomes "<shortName> Economist") and a service's titleShortName.
// src/lib/page-titles.test.ts walks every route the prerender emits through
// these builders and the data they read.

import { placeName } from "../data/geo-prose.mjs";

/** Longest <title> any page on the site may carry, brand suffix included. */
export const TITLE_MAX = 60;

const brand = (body, orgName) => `${body} | ${orgName}`;

/** One label or several, longest form first, as a de-duplicated list. */
const forms = (labels) => [...new Set([labels].flat())];

/**
 * The first candidate body whose branded title fits TITLE_MAX; the last
 * candidate when none does (the test suite is what keeps that from shipping).
 * @param {string} orgName
 * @param {...string} bodies candidate title bodies, longest form first
 * @returns {string}
 */
export function fitTitle(orgName, ...bodies) {
  const titles = bodies.map((body) => brand(body, orgName));
  return titles.find((t) => t.length <= TITLE_MAX) ?? titles[titles.length - 1];
}

/**
 * "<label> in <place>" ("in the District of Columbia"). With several labels
 * (longest first) every label is tried beside the full place name before any
 * takes the state abbreviation, so the abbreviation stands in only where no
 * label can fit beside the full place name.
 * @param {string | readonly string[]} label
 * @param {{ name: string; abbreviation: string }} state
 * @param {string} orgName
 * @returns {string}
 */
export function placeTitle(label, state, orgName) {
  const labels = forms(label);
  const places = [placeName(state.name), state.abbreviation];
  return fitTitle(orgName, ...places.flatMap((place) => labels.map((l) => `${l} in ${place}`)));
}

/**
 * "<label> in <city>, <ST>". With several labels (longest first) every label
 * is tried beside the city and its state abbreviation before any drops the
 * abbreviation, so a same-named city in another state never shares a title.
 * @param {string | readonly string[]} label
 * @param {{ name: string }} city
 * @param {{ abbreviation: string }} state
 * @param {string} orgName
 * @returns {string}
 */
export function cityTitle(label, city, state, orgName) {
  const labels = forms(label);
  const places = [`${city.name}, ${state.abbreviation}`, city.name];
  return fitTitle(orgName, ...places.flatMap((place) => labels.map((l) => `${l} in ${place}`)));
}

/**
 * The service labels the length-budgeted tags (state, city, and pair pages)
 * may carry, longest first: the heading label with any ampersand spelled out
 * ("Fraud & Tracing" -> "Fraud and Tracing"), then the shorter titleShortName
 * where the data sets one, which the builders take only where neither form
 * of the heading label fits.
 * @param {{ shortName: string; titleShortName?: string }} service
 * @returns {string[]}
 */
export function serviceTitleLabels(service) {
  const label = service.shortName.replace(/\s*&\s*/g, " and ");
  return service.titleShortName ? [label, service.titleShortName] : [label];
}

/**
 * The service names the pillar hub and the cost/process/timeline tags may
 * carry, longest first: the full name, then the shorter titleName where the
 * data sets one, which the builders take only where the full name cannot fit.
 * @param {{ name: string; titleName?: string }} service
 * @returns {string[]}
 */
export function serviceTitleNames(service) {
  return service.titleName ? [service.name, service.titleName] : [service.name];
}

/**
 * The case-type stems the state tier may carry, longest first: the titleBase
 * ("Employment Discrimination Economist", the hub's own title) and, where
 * the data sets a shorter name, "<shortName> Economist".
 * @param {{ name: string; titleBase: string; shortName?: string }} caseType
 * @returns {string[]}
 */
export function caseTypeTitleStems(caseType) {
  const short = caseType.shortName ?? caseType.name;
  return forms([caseType.titleBase, `${short} Economist`]);
}

/** /locations/<state> */
export const stateHubTitle = (state, orgName) => placeTitle("Forensic Economists", state, orgName);

/** /locations/<state>/<city> */
export const cityHubTitle = (city, state, orgName) => cityTitle("Forensic Economists", city, state, orgName);

/** /case-types/<case>/<state>: the case type's stems plus the place. */
export const caseTypeStateTitle = (caseType, state, orgName) => placeTitle(caseTypeTitleStems(caseType), state, orgName);

/** /services/<pillar>/<state> */
export const serviceStateTitle = (service, state, orgName) => placeTitle(serviceTitleLabels(service), state, orgName);

/** /services/<pillar>/<state>/<city> */
export const serviceCityTitle = (service, city, state, orgName) =>
  cityTitle(serviceTitleLabels(service), city, state, orgName);

/** /services/<pillar>: "<name> Expert". */
export const pillarTitle = (service, orgName) =>
  fitTitle(orgName, ...serviceTitleNames(service).map((name) => `${name} Expert`));

/** /services/<pillar>/<cost|process|timeline>: "<name> Cost", "<name> Process", "<name> Timeline". */
export const variantTitle = (service, variantLabel, orgName) =>
  fitTitle(orgName, ...serviceTitleNames(service).map((name) => `${name} ${variantLabel}`));

/**
 * /services/<pillar>/case/<case>: "<label> Expert for <case short name>",
 * without "Expert" where it cannot fit, and on the shorter titleShortName
 * only where neither form of the heading label fits.
 * @param {{ shortName: string; titleShortName?: string }} service
 * @param {{ name: string; shortName?: string }} caseType
 * @param {string} orgName
 * @returns {string}
 */
export function pairTitle(service, caseType, orgName) {
  const subject = caseType.shortName ?? caseType.name;
  return fitTitle(
    orgName,
    ...serviceTitleLabels(service).flatMap((label) => [`${label} Expert for ${subject}`, `${label} for ${subject}`]),
  );
}
