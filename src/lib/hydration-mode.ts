/**
 * Whether the markup in #root was prerendered for the current URL, so
 * src/main.tsx may hydrate it (scripts/prerender.mjs stamps
 * data-prerender-path on the root). Anything else - the rendered 404 page
 * served for an unknown URL, a page from an older build without the stamp -
 * is rendered fresh. Trailing slashes are ignored (server.js canonicalizes
 * them with a 301 anyway).
 */
export function shouldHydrate(prerenderedPath: string | null, pathname: string): boolean {
  if (!prerenderedPath) return false;
  const norm = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);
  return norm(prerenderedPath) === norm(pathname);
}
