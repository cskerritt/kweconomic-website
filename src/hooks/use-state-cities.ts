import { useContext, useEffect, useState } from "react";
import type { City } from "@/types";
import { loadStateCities } from "@/data/cities";
import { PreloadedCitiesContext, readInlineCities } from "@/lib/preloaded-cities";

interface Loaded {
  slug: string;
  cities: City[];
}

/**
 * One state's cities for the geo templates. Three sources, in order:
 *   1. PreloadedCitiesContext - the build's server render (src/entry-server.tsx)
 *      provides the state being rendered, so the page renders in one pass;
 *   2. the inline <script id="kw-cities-{state}"> the prerender wrote - the
 *      browser's first render, which must equal the server HTML for
 *      hydrateRoot (src/main.tsx);
 *   3. the per-state code-split chunk (src/data/cities/index.ts) - SPA
 *      navigation to another state, when `loading` is true until it resolves.
 * `loading` is derived by comparing the requested slug to the loaded slug.
 */
export function useStateCities(stateSlug: string | undefined): {
  cities: City[];
  loading: boolean;
} {
  const preloaded = useContext(PreloadedCitiesContext);
  const [loaded, setLoaded] = useState<Loaded | undefined>(() => {
    if (!stateSlug) return undefined;
    if (preloaded && preloaded.stateSlug === stateSlug) return { slug: stateSlug, cities: preloaded.cities };
    const inline = readInlineCities(stateSlug);
    return inline ? { slug: stateSlug, cities: inline } : undefined;
  });
  const loadedSlug = loaded?.slug;

  useEffect(() => {
    if (!stateSlug || loadedSlug === stateSlug) return;
    let active = true;
    loadStateCities(stateSlug).then((cities) => {
      if (active) setLoaded({ slug: stateSlug, cities });
    });
    return () => {
      active = false;
    };
  }, [stateSlug, loadedSlug]);

  const isLoaded = !!stateSlug && loaded?.slug === stateSlug;
  return {
    cities: isLoaded && loaded ? loaded.cities : [],
    loading: !!stateSlug && !isLoaded,
  };
}
