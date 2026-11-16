import { createContext } from "react";
import type { City } from "@/types";

/**
 * The symmetric city data path. The build's server render
 * (src/entry-server.tsx) provides one state's cities here; the prerender
 * writes the same array into the page as
 * <script type="application/json" id="kw-cities-{state}">; the browser reads
 * that script in useStateCities' initial state. Server HTML and first client
 * render therefore agree, and hydrateRoot never sees a Loading placeholder.
 */
export interface PreloadedCities {
  stateSlug: string;
  cities: City[];
}

export const PreloadedCitiesContext = createContext<PreloadedCities | null>(null);

/** The id of the inline script scripts/lib/page-head.mjs writes for a state. */
export function inlineCitiesId(stateSlug: string): string {
  return `kw-cities-${stateSlug}`;
}

/** The inline city list for `stateSlug`, if the page carries one (browser only). */
export function readInlineCities(stateSlug: string): City[] | undefined {
  if (typeof document === "undefined") return undefined;
  const el = document.getElementById(inlineCitiesId(stateSlug));
  if (!el?.textContent) return undefined;
  try {
    const parsed: unknown = JSON.parse(el.textContent);
    return Array.isArray(parsed) ? (parsed as City[]) : undefined;
  } catch {
    return undefined;
  }
}
