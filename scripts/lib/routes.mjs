// scripts/lib/routes.mjs
//
// The prerender's route inventory: one entry per page the build writes to
// dist/ (path, template, and on the geographic tiers the state whose cities
// the server render preloads, src/entry-server.tsx). collectRoutes is pure;
// scripts/prerender.mjs feeds it modules loaded through vite (loadRouteData).
// The set is exactly the one the hand-built prerender wrote before the move to
// hydrateRoot: the same data and the same windows (every city for the city
// tier, the first SERVICE_CITY_TOP cities per state for the service x city
// tier, the released states for service x case type x state).

export const CORE_PATHS = [
  "/about", "/team", "/contact", "/services", "/locations", "/resources/faq",
  "/knowledge", "/insights", "/case-studies", "/schedule-consultation",
  "/privacy", "/terms",
];

export const HUB_PATHS = [
  "/case-types", "/credentials", "/guides", "/compare", "/methods",
  "/jurisdictions", "/attorneys", "/white-papers",
];

const SERVICE_VARIANTS = ["cost", "process", "timeline"];

/** @returns {{ path: string, template: string, stateSlug?: string }[]} */
export function collectRoutes({
  states, pillarServices, serviceCaseTypePairs, caseTypes, credentials, team, journeys, guides,
  knowledgeGuides, insightPosts, methods, comparisons, whitePapers, attorneyStages,
  federalDistricts, releasedStateSlugs, serviceCaseStatePath, citiesByState, serviceCityCities,
}) {
  const routes = [];
  const seen = new Set();
  const add = (path, template, extra = {}) => {
    if (seen.has(path)) throw new Error(`routes: ${path} enumerated twice (${template})`);
    seen.add(path);
    routes.push({ path, template, ...extra });
  };
  const caseTypeBySlug = Object.fromEntries(caseTypes.map((c) => [c.slug, c]));
  const stateBySlug = Object.fromEntries(states.map((s) => [s.slug, s]));

  add("/", "home");
  for (const p of CORE_PATHS) add(p, "core");
  for (const p of HUB_PATHS) add(p, "hub");

  for (const g of knowledgeGuides) add(`/knowledge/${g.slug}`, "knowledge");
  for (const p of insightPosts) add(`/insights/${p.slug}`, "insight");
  for (const g of guides) add(`/guides/${g.slug}`, "guide");
  for (const c of comparisons) add(`/compare/${c.slug}`, "comparison");

  for (const s of pillarServices) {
    add(`/services/${s.slug}`, "pillar");
    for (const v of SERVICE_VARIANTS) add(`/services/${s.slug}/${v}`, "service-variant");
  }
  for (const { service, caseTypeSlug } of serviceCaseTypePairs) {
    if (caseTypeBySlug[caseTypeSlug]) add(`/services/${service.slug}/case/${caseTypeSlug}`, "service-case");
  }

  for (const st of states) {
    add(`/locations/${st.slug}`, "state", { stateSlug: st.slug });
    for (const city of citiesByState[st.slug] ?? []) {
      add(`/locations/${st.slug}/${city.slug}`, "city", { stateSlug: st.slug });
    }
  }
  for (const s of pillarServices) {
    for (const st of states) {
      add(`/services/${s.slug}/${st.slug}`, "service-state", { stateSlug: st.slug });
      for (const city of serviceCityCities(citiesByState[st.slug] ?? [])) {
        add(`/services/${s.slug}/${st.slug}/${city.slug}`, "service-city", { stateSlug: st.slug });
      }
    }
  }
  for (const { service, caseTypeSlug } of serviceCaseTypePairs) {
    if (!caseTypeBySlug[caseTypeSlug]) continue;
    for (const stateSlug of releasedStateSlugs) {
      if (!stateBySlug[stateSlug]) throw new Error(`routes: released state ${stateSlug} is not in states.ts`);
      add(serviceCaseStatePath(service.slug, caseTypeSlug, stateSlug), "service-case-state");
    }
  }

  for (const c of caseTypes) {
    add(`/case-types/${c.slug}`, "case-type-hub");
    for (const st of states) add(`/case-types/${c.slug}/${st.slug}`, "case-type-state");
  }
  for (const cred of credentials) {
    add(`/credentials/${cred.slug}`, "credential-hub");
    for (const st of states) add(`/credentials/${cred.slug}/${st.slug}`, "credential-state");
  }
  for (const d of federalDistricts) add(`/jurisdictions/federal/${d.slug}`, "federal-district");
  for (const m of methods) add(`/methods/${m.slug}`, "method");
  for (const m of team) add(`/team/${m.slug}`, "team-profile");
  for (const stage of attorneyStages) add(`/attorneys/${stage.slug}`, "journey-index");
  for (const j of journeys) {
    if (caseTypeBySlug[j.caseTypeSlug]) add(`/attorneys/${j.stage}/${j.caseTypeSlug}`, "journey");
  }
  for (const w of whitePapers) add(`/white-papers/${w.slug}`, "white-paper");
  return routes;
}

/** The collectRoutes input, loaded through a vite dev server in middleware mode (scripts/prerender.mjs). */
export async function loadRouteData(server) {
  const load = (p) => server.ssrLoadModule(p);
  const [
    { states }, services, { caseTypes }, { credentials }, { team }, { journeys },
    { guides }, { knowledgeGuides }, { insightPosts }, { methods }, { comparisons },
    { whitePapers }, { ATTORNEY_STAGES }, cityIndex, geoLinks, { federalDistricts }, released,
  ] = await Promise.all([
    load("/src/data/states.ts"), load("/src/data/services.ts"), load("/src/data/caseTypes.ts"),
    load("/src/data/credentials.ts"), load("/src/data/team.ts"), load("/src/data/journeys.ts"),
    load("/src/data/guides.ts"), load("/src/data/knowledge.ts"), load("/src/data/insights.ts"),
    load("/src/data/methods.ts"), load("/src/data/comparisons.ts"), load("/src/data/whitePapers.ts"),
    load("/src/lib/attorney-stages.ts"), load("/src/data/cities/index.ts"), load("/src/lib/geo-links.ts"),
    load("/src/data/courts/federal-districts.ts"), load("/src/data/serviceCaseTypeStates.ts"),
  ]);
  const citiesByState = {};
  for (const st of states) citiesByState[st.slug] = await cityIndex.loadStateCities(st.slug);
  const data = {
    states, pillarServices: services.pillarServices(), serviceCaseTypePairs: services.serviceCaseTypePairs(),
    caseTypes, credentials, team, journeys, guides, knowledgeGuides, insightPosts, methods, comparisons,
    whitePapers, attorneyStages: ATTORNEY_STAGES, federalDistricts, releasedStateSlugs: released.releasedStates(),
    serviceCaseStatePath: released.serviceCaseStatePath, citiesByState, serviceCityCities: geoLinks.serviceCityCities,
  };
  for (const [name, value] of Object.entries(data)) {
    if (!["serviceCityCities", "citiesByState", "serviceCaseStatePath"].includes(name) && (!Array.isArray(value) || value.length === 0)) {
      throw new Error(`routes: ${name} did not load as a non-empty array`);
    }
  }
  return data;
}
