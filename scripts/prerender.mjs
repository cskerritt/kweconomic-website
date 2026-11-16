/**
 * KW Economics prerender.
 *
 * Renders the REAL React app for every route through src/entry-server.tsx
 * (vite createServer + ssrLoadModule + react-dom/static prerender) and writes
 * dist/<route>/index.html with the head the page resolved
 * (src/lib/page-head.ts, the resolver src/hooks/use-page-meta.ts also uses in
 * the browser), the server-rendered body and, on the geographic tiers, the
 * state's cities as an inline JSON script (id kw-cities-<state>) that
 * src/hooks/use-state-cities.ts reads on hydration. src/main.tsx hydrates the
 * page in place when its data-prerender-path matches the URL. JSON-LD comes
 * from the pages' own SchemaOrg components, so each URL carries one graph.
 *
 * The build FAILS (exit 1) when any page breaks scripts/lib/render-gate.mjs:
 * not exactly one <h1>, a "Loading..." placeholder in <main>, no collected
 * page meta, a render error, a NotFound body under a real route, a title over
 * 60 characters, or fewer than 40 words in <main>.
 *
 * Also written: dist/404.html (the rendered NotFound page server.js serves with
 * status 404).
 *
 * Env: PRERENDER_DIST=<dir> reads <dir>/index.html as the template and writes
 * under <dir>; PRERENDER_SAMPLE=<n> renders about n evenly spaced routes.
 *
 * Run: node scripts/prerender.mjs   (after `vite build`; part of `npm run build`)
 */
process.env.NODE_ENV = "production";

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { collectRoutes, loadRouteData } from "./lib/routes.mjs";
import { composePage, ROOT_PLACEHOLDER } from "./lib/page-head.mjs";
import { gateViolations, inspectRendered } from "./lib/render-gate.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = process.env.PRERENDER_DIST ? resolve(process.env.PRERENDER_DIST) : join(ROOT, "dist");
const NOT_FOUND_PATH = "/404";
const BUDGET_MS = 10 * 60 * 1000;

/**
 * The pristine vite output. dist/index.html is it right after `vite build`;
 * a later run (the home page has overwritten index.html) reads the copy saved
 * under node_modules/.cache, kept out of dist/ so server.js never serves it.
 */
const TEMPLATE_CACHE = join(ROOT, "node_modules", ".cache", "kweconomics-prerender", `template-${createHash("sha1").update(DIST).digest("hex").slice(0, 10)}.html`);
function readTemplate() {
  const html = readFileSync(join(DIST, "index.html"), "utf8");
  if (html.includes(ROOT_PLACEHOLDER)) {
    mkdirSync(dirname(TEMPLATE_CACHE), { recursive: true });
    writeFileSync(TEMPLATE_CACHE, html);
    return html;
  }
  // dist/index.html is already the home page from an earlier run: fall back to
  // the copy cached for THIS output directory, never another build's.
  if (existsSync(TEMPLATE_CACHE)) return readFileSync(TEMPLATE_CACHE, "utf8");
  throw new Error("prerender: dist/index.html is already a prerendered page and no template is cached for this output directory; run vite build first");
}

function writePage(path, html) {
  const file = path === "/" ? join(DIST, "index.html") : join(DIST, path, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const template = readTemplate();

const server = await createServer({
  root: ROOT,
  mode: "production",
  configFile: false,
  logLevel: "error",
  plugins: [react()],
  resolve: { alias: { "@": join(ROOT, "src") } },
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: "custom",
});

try {
  const data = await loadRouteData(server);
  const allRoutes = collectRoutes(data);
  const sample = Number(process.env.PRERENDER_SAMPLE ?? 0);
  const step = sample > 0 ? Math.max(1, Math.ceil(allRoutes.length / sample)) : 1;
  const routes = step > 1 ? allRoutes.filter((_, i) => i % step === 0) : allRoutes;
  const { renderRoute } = await server.ssrLoadModule("/src/entry-server.tsx");

  const violations = [];
  const renderOne = async (route) => {
    const rendered = await renderRoute(route.path, { stateSlug: route.stateSlug });
    const inspection = inspectRendered({ path: route.path, template: route.template, appHtml: rendered.html, head: rendered.head, errors: rendered.errors });
    const bad = gateViolations(inspection);
    if (bad.length) violations.push(`${route.path}: ${bad.join("; ")}`);
    return { rendered, ok: bad.length === 0 };
  };

  const t0 = performance.now();
  for (const route of routes) {
    const { rendered, ok } = await renderOne(route);
    if (ok) {
      writePage(
        route.path,
        composePage({ template, path: route.path, head: rendered.head, appHtml: rendered.html, stateSlug: rendered.stateSlug, cities: rendered.cities }),
      );
    }
    // Fail fast on a systemic break, but leave enough lines to see the pattern.
    if (violations.length >= 50) break;
  }
  // The NotFound page, rendered once and written OUTSIDE the route tree (a
  // dist/404/index.html would make GET /404 a 200). server.js serves it 404.
  const notFound = await renderOne({ path: NOT_FOUND_PATH, template: "not-found" });
  if (notFound.ok) {
    writeFileSync(join(DIST, "404.html"), composePage({ template, path: NOT_FOUND_PATH, head: notFound.rendered.head, appHtml: notFound.rendered.html }));
  }
  const totalMs = performance.now() - t0;

  const counts = {};
  for (const r of routes) counts[r.template] = (counts[r.template] ?? 0) + 1;
  console.log(`Pre-rendered ${routes.length} pages (plus 404.html) in ${(totalMs / 1000).toFixed(1)} s (${(totalMs / (routes.length + 1)).toFixed(2)} ms/page) into ${DIST}`);
  console.table(counts);
  if (violations.length) {
    console.error(`prerender: ${violations.length} page(s) failed the render gate${violations.length >= 50 ? " (stopped after 50)" : ""}:\n  ${violations.join("\n  ")}`);
    process.exit(1);
  }
  if (step === 1 && totalMs > BUDGET_MS) {
    console.warn(`WARN prerender took ${(totalMs / 1000).toFixed(0)} s, over the ${BUDGET_MS / 1000} s budget`);
  }
} finally {
  await server.close().catch(() => {});
}
