import { useEffect, useState } from "react";
import type { City } from "@/types";
import { loadStateCities } from "@/data/cities";

/**
 * Lazily loads a single state's cities (per-state code-split chunk) so a geo page
 * never bundles all 56 states. Returns { cities, loading }; `loading` is true
 * until the requested state's chunk resolves. On an SPA navigation it re-loads
 * for the new state slug. The build-time prerender already embeds page content
 * for crawlers, so this only affects the in-browser render.
 *
 * `loading` is derived by comparing the requested slug to the most recently
 * loaded slug, so state is only ever set from the async callback (never
 * synchronously inside the effect).
 */
export function useStateCities(stateSlug: string | undefined): {
  cities: City[];
  loading: boolean;
} {
  const [loaded, setLoaded] = useState<{ slug: string; cities: City[] }>();

  useEffect(() => {
    if (!stateSlug) return;
    let active = true;
    loadStateCities(stateSlug).then((cities) => {
      if (active) setLoaded({ slug: stateSlug, cities });
    });
    return () => {
      active = false;
    };
  }, [stateSlug]);

  const isLoaded = !!stateSlug && loaded?.slug === stateSlug;
  return {
    cities: isLoaded ? loaded.cities : [],
    loading: !!stateSlug && !isLoaded,
  };
}
