/**
 * Citation-free FAQ generators for geographic page templates. Each generator
 * returns 3-4 Q&A pairs templated with state/city tokens so that every
 * geographic page (state hub, service-state, city, service-city) has its own
 * FAQ block + faqPageSchema for AEO/SERP-features eligibility. Economics
 * framing: local wage levels, the damages venue, testimony, present value.
 *
 * Templates live in ./geo-prose.mjs (shared with scripts/prerender.mjs) so the
 * prerendered shells match the hydrated page byte for byte.
 */

import { ORG_NAME } from "@/lib/brand";
import * as prose from "./geo-prose.mjs";
import type { Faq } from "./types";

export function stateGeographicFaqs(stateName: string): Faq[] {
  return prose.stateGeographicFaqs(ORG_NAME, stateName);
}

export function cityGeographicFaqs(stateName: string, cityName: string): Faq[] {
  return prose.cityGeographicFaqs(ORG_NAME, stateName, cityName);
}

export function serviceStateGeographicFaqs(serviceName: string, stateName: string): Faq[] {
  return prose.serviceStateGeographicFaqs(ORG_NAME, serviceName, stateName);
}

export function serviceCityGeographicFaqs(serviceName: string, stateName: string, cityName: string): Faq[] {
  return prose.serviceCityGeographicFaqs(ORG_NAME, serviceName, stateName, cityName);
}
