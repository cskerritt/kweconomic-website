// scripts/lib/page-source-meta.mjs
//
// The fixed routes (home, hubs, legal pages) and the React page that owns each
// one's title and description literals. Tests read the literal pair out of the
// page source (vitest runs in node, no DOM) and compare it with what the build
// wrote to dist/ or with the builders' output. Not used by the build itself.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ORG_NAME, ORG_SHORT, SITE_URL } from "./site.mjs";

export const FIXED_ROUTES = {
  "/": "Home.tsx",
  "/about": "About.tsx",
  "/team": "Team.tsx",
  "/contact": "Contact.tsx",
  "/services": "ServicesHub.tsx",
  "/locations": "LocationsHub.tsx",
  "/resources/faq": "FAQ.tsx",
  "/knowledge": "KnowledgeHub.tsx",
  "/insights": "InsightsHub.tsx",
  "/case-studies": "CaseStudies.tsx",
  "/schedule-consultation": "ScheduleConsultation.tsx",
  "/privacy": "Privacy.tsx",
  "/terms": "Terms.tsx",
  "/white-papers": "WhitePapersHub.tsx",
  "/case-types": "hubs/CaseTypesHubPage.tsx",
  "/credentials": "hubs/CredentialsHubPage.tsx",
  "/guides": "hubs/GuidesHubPage.tsx",
  "/compare": "hubs/ComparisonsHubPage.tsx",
  "/methods": "hubs/MethodsHubPage.tsx",
  "/jurisdictions": "hubs/JurisdictionsHubPage.tsx",
  "/attorneys": "hubs/AttorneysHubPage.tsx",
};

const TOKENS = { ORG_NAME, ORG_SHORT, SITE_URL, DOMAIN: new URL(SITE_URL).host };
const STR = "(`[^`]*`|\"[^\"]*\")";
const resolveLiteral = (literal) =>
  literal.slice(1, -1).replace(/\$\{(\w+)\}/g, (_, k) => {
    if (!(k in TOKENS)) throw new Error(`unresolvable token \${${k}} in ${literal}`);
    return TOKENS[k];
  });

/**
 * The first usePageMeta({ title, description }) literal pair of a page source;
 * `description` is null when the page builds it (the credentials hub).
 */
export function pageMetaFromSource(root, file) {
  const src = readFileSync(join(root, "src", "pages", file), "utf8");
  const both = src.match(new RegExp(`usePageMeta\\(\\{\\s*title: ${STR},(?:\\s*//[^\\n]*)*\\s*description:\\s*${STR}`));
  if (both) return { title: resolveLiteral(both[1]), description: resolveLiteral(both[2]) };
  const titleOnly = src.match(new RegExp(`usePageMeta\\(\\{\\s*title: ${STR},`));
  if (!titleOnly) throw new Error(`${file} has no literal usePageMeta title`);
  return { title: resolveLiteral(titleOnly[1]), description: null };
}
