import { StrictMode } from "react";
import { StaticRouter } from "react-router-dom";
import { prerender } from "react-dom/static";
import App from "@/App";
import { loadStateCities } from "@/data/cities";
import { PageMetaContext, type PageMetaCollector } from "@/lib/page-meta-context";
import { resolvePageHead, type ResolvedHead } from "@/lib/page-head";
import { PreloadedCitiesContext } from "@/lib/preloaded-cities";
import type { City, PageMeta } from "@/types";

/**
 * Build-time server render of the real App for ONE url. scripts/prerender.mjs
 * loads this module through vite's ssrLoadModule and calls renderRoute for
 * every route in scripts/lib/routes.mjs. The same tree src/main.tsx hydrates
 * - StrictMode, the router, App - is rendered under two build-only providers:
 *   - PageMetaContext collects the PageMeta the page's usePageMeta call
 *     publishes during render (in the browser it runs in an effect);
 *   - PreloadedCitiesContext hands the geo templates the state's cities so
 *     useStateCities resolves synchronously instead of returning <Loading />.
 * react-dom/static's prerender waits for every Suspense boundary (the lazy
 * route chunks), and progressiveChunkSize 1 << 30 keeps the page in one
 * chunk. The returned head comes from resolvePageHead, the resolver the
 * browser effect uses, so the static head and the hydrated head agree.
 */
export interface RenderedRoute {
  path: string;
  html: string;
  head: ResolvedHead | null;
  stateSlug?: string;
  cities?: City[];
  errors: string[];
}

/**
 * One usePageMeta call per render is the invariant: the first meta published
 * is the page's head. A second, different meta in the same render (a page
 * that renders <NotFound /> without passing null first) would give the static
 * head a different value from the hydrated one, so it is reported as a render
 * error; an identical repeat (StrictMode's dev double render) is ignored.
 */
export function metaCollector(path: string, errors: string[]): { collect: PageMetaCollector; meta: () => PageMeta | null } {
  let first: PageMeta | null = null;
  let firstJson = "";
  return {
    collect(meta) {
      const json = JSON.stringify(meta);
      if (!first) {
        first = meta;
        firstJson = json;
        return;
      }
      if (json !== firstJson) {
        errors.push(
          `usePageMeta ran twice with different meta for ${path}: "${first.title}" then "${meta.title}" (one usePageMeta per render; a page that renders NotFound must pass null first)`,
        );
      }
    },
    meta: () => first,
  };
}

export async function renderRoute(path: string, options: { stateSlug?: string } = {}): Promise<RenderedRoute> {
  const cities = options.stateSlug ? await loadStateCities(options.stateSlug) : [];
  const preloaded = options.stateSlug && cities.length > 0 ? { stateSlug: options.stateSlug, cities } : null;
  const errors: string[] = [];
  const collector = metaCollector(path, errors);

  const { prelude } = await prerender(
    <StrictMode>
      <PageMetaContext.Provider value={collector.collect}>
        <PreloadedCitiesContext.Provider value={preloaded}>
          <StaticRouter location={path}>
            <App />
          </StaticRouter>
        </PreloadedCitiesContext.Provider>
      </PageMetaContext.Provider>
    </StrictMode>,
    {
      progressiveChunkSize: 1 << 30,
      onError(error: unknown) {
        errors.push(error instanceof Error ? error.message : String(error));
      },
    },
  );
  const html = await new Response(prelude).text();
  const meta = collector.meta();

  return {
    path,
    html,
    head: meta ? resolvePageHead(meta) : null,
    ...(preloaded ? { stateSlug: preloaded.stateSlug, cities: preloaded.cities } : {}),
    errors,
  };
}
