/**
 * KW Economics llms.txt generator
 *
 * Regenerates public/llms.txt (concise) and public/llms-full.txt (comprehensive)
 * directly from the site's source-of-truth data files, so the AI-readable summary
 * can never drift from the live site. Runs before `vite build` so the freshly
 * generated files are copied from public/ into dist/.
 *
 * Loading strategy: a bare Vite server (configFile: false, only the "@" alias)
 * lets us ssrLoadModule the data .ts files with full fidelity. The data files use
 * type-only imports, so esbuild strips the types and returns plain data objects.
 *
 * Copy rules (spec): economist's standpoint, citation-free prose, hyphens only,
 * no invented statistics or client names, and no claim that the firm or a named
 * person holds an association membership. The sister practices are described by
 * role only - their brand names and domains are spelled solely in
 * src/lib/brand.ts and src/components/CrossSell.tsx (src/brand-strings.test.mjs
 * walks public/llms.txt for the domains).
 *
 * Run: node scripts/generate-llms.mjs
 */

import { createServer } from "vite";
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { SITE_URL, ORG_NAME, ORG_SHORT, ORG_PHONE_DISPLAY } from "./lib/site.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");

// Stable firm facts (from scripts/lib/site.mjs, the mirror of src/lib/brand.ts).
const COMPANY = ORG_NAME;
const PHONE = ORG_PHONE_DISPLAY;
const SITE = SITE_URL;
const HQ = "Hackensack, New Jersey";
const SECONDARY_OFFICE = "Richmond, Virginia";
// ORG_NAME and ORG_SHORT are the same string for this brand; only print the
// parenthetical short form when it differs.
const TITLE = ORG_SHORT && ORG_SHORT !== COMPANY ? `${COMPANY} (${ORG_SHORT})` : COMPANY;

const REGION_LABELS = {
  northeast: "Northeast",
  southeast: "Southeast",
  midwest: "Midwest",
  west: "West",
  territory: "Territories",
};

const ROLE_LABELS = {
  leadership: "Leadership",
  expert: "Economists",
};

function joinList(arr) {
  return (arr || []).filter(Boolean).join(", ");
}

// Strip the [[/route|anchor]] inline-link markers (see src/lib/richtext.tsx) down
// to their anchor text, so the published AI summary carries clean prose instead of
// raw marker syntax. FAQ answers are the only body field emitted here that can
// carry markers.
function stripLinkMarkers(text) {
  return text.replace(/\[\[\/[^|\]]*\|([^\]]+)\]\]/g, "$1");
}

async function main() {
  const server = await createServer({
    root: ROOT,
    configFile: false,
    logLevel: "error",
    resolve: { alias: { "@": join(ROOT, "src") } },
    // Pure-data modules need no dependency pre-bundling. Disabling discovery
    // skips Vite's background dep scanner, which otherwise throws a noisy
    // (harmless) "server is being restarted or closed" error on close().
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
  });

  const load = (p) => server.ssrLoadModule(p);

  const [
    { pillarServices },
    { team },
    { caseTypes },
    { credentials },
    { methods },
    { guides },
    { comparisons },
    { states },
    { faqs },
  ] = await Promise.all([
    load("/src/data/services.ts"),
    load("/src/data/team.ts"),
    load("/src/data/caseTypes.ts"),
    load("/src/data/credentials.ts"),
    load("/src/data/methods.ts"),
    load("/src/data/guides.ts"),
    load("/src/data/comparisons.ts"),
    load("/src/data/states.ts"),
    load("/src/data/faqs.ts"),
  ]);

  await server.close();

  // Indexable service lines only (the eleven pillars). The two `pillar: false`
  // entries are hand-offs to the sister practices, not services of this site.
  const serviceLines = pillarServices();

  // Map state abbreviation -> full name for expanding "statesServed", and case
  // type slug -> name for the per-service "common case types" line.
  const stateNameByAbbr = {};
  for (const s of states) stateNameByAbbr[s.abbreviation] = s.name;
  const expandStates = (abbrs) =>
    (abbrs || []).map((a) => stateNameByAbbr[a] || a).join(", ");
  const caseTypeNameBySlug = {};
  for (const c of caseTypes) caseTypeNameBySlug[c.slug] = c.name;
  const expandCaseTypes = (slugs) =>
    (slugs || []).map((s) => caseTypeNameBySlug[s] || s).join(", ");

  const territories = states
    .filter((s) => s.type === "territory")
    .map((s) => s.name);

  // Shared prose. Written once so llms.txt and llms-full.txt never disagree
  // about what the practice is.
  const ABOUT =
    `${COMPANY} is a forensic economics, forensic accounting, and business valuation practice serving plaintiff and defense attorneys in all 50 states, the District of Columbia, and U.S. territories. Its economists measure economic damages for litigation - lost earnings and earning capacity, wrongful death economic loss, household services, the present value of a life care plan, employment and wage-loss damages, lost profits and commercial damages, and the value of business interests - and prepare fraud and asset-tracing, marital financial, and rebuttal analyses. Every report states the question asked, the records relied on, and the assumption behind each figure, and the economists are available for deposition and trial testimony on their own work.`;
  const CREDENTIALS_NOTE =
    "Reference pages on how a forensic economist is qualified to testify on damages: graduate training in economics, finance, and business, the professional standards of the national forensic economics associations, and a record of reports and testimony. No state licenses forensic economists. These pages describe the qualification and how courts weigh it; they do not list the roster.";
  const SISTER_NOTE =
    `${COMPANY} is part of the Kincaid Wolstein family of expert practices. Vocational evaluation (employability and post-injury work capacity) and life care plan authorship are performed by sister practices in the same group; this site links to them from its services pages and does not offer those services itself. When a matter needs both, the economist builds the loss on the sister practice's opinion so the reports reconcile.`;

  // -----------------------------------------------------------------------
  // llms.txt - concise, llmstxt.org-style summary
  // -----------------------------------------------------------------------
  const llms = [];
  llms.push(`# ${TITLE}`);
  llms.push("");
  llms.push("## About");
  llms.push("");
  llms.push(ABOUT);
  llms.push("");
  llms.push("## Services");
  llms.push("");
  for (const s of serviceLines) {
    llms.push(`- ${s.name}: ${s.description}`);
  }
  llms.push("");
  llms.push("## Case Types");
  llms.push("");
  llms.push(joinList(caseTypes.map((c) => c.name)));
  llms.push("");
  llms.push("## Geographic Coverage");
  llms.push("");
  llms.push("- All 50 U.S. states");
  llms.push("- District of Columbia");
  llms.push(`- U.S. territories including ${joinList(territories)}`);
  llms.push("");
  llms.push("## Credentials and Standards");
  llms.push("");
  llms.push(CREDENTIALS_NOTE);
  llms.push("");
  for (const c of credentials) {
    llms.push(`- ${c.abbreviation} - ${c.name}`);
  }
  llms.push("");
  llms.push("## Team");
  llms.push("");
  for (const m of team.filter((t) => !t.memoriam)) {
    llms.push(`- ${m.name} - ${m.title}`);
  }
  llms.push("");
  llms.push("## Office Locations");
  llms.push("");
  llms.push(`- Headquarters: ${HQ}`);
  llms.push(`- Office: ${SECONDARY_OFFICE}`);
  llms.push("");
  llms.push("## Contact");
  llms.push("");
  llms.push(`- Phone: ${PHONE}`);
  llms.push(`- Website: ${SITE}`);
  llms.push("");
  llms.push("## Key Pages");
  llms.push("");
  llms.push(`- Services: ${SITE}/services`);
  llms.push(`- Case types: ${SITE}/case-types`);
  llms.push(`- Guides for attorneys: ${SITE}/guides`);
  llms.push(`- Methods: ${SITE}/methods`);
  llms.push(`- Comparisons: ${SITE}/compare`);
  llms.push(`- Frequently asked questions: ${SITE}/resources/faq`);
  llms.push(`- White papers: ${SITE}/white-papers`);
  llms.push(`- Locations: ${SITE}/locations`);
  llms.push(`- Full reference: ${SITE}/llms-full.txt`);
  llms.push("");
  llms.push("## Related Practices");
  llms.push("");
  llms.push(SISTER_NOTE);
  llms.push("");

  // -----------------------------------------------------------------------
  // llms-full.txt - comprehensive reference
  // -----------------------------------------------------------------------
  const full = [];
  const h1 = (t) => full.push(`# ${t}`, "");
  const h2 = (t) => full.push("", `## ${t}`, "");
  const h3 = (t) => full.push(`### ${t}`);
  const p = (t) => full.push(t, "");
  const li = (t) => full.push(`- ${t}`);

  h1(`${COMPANY} - Full Reference`);

  h2("Organization Overview");
  p(ABOUT);
  p(
    `${COMPANY} operates from its New Jersey headquarters and a Virginia office and accepts engagements in all 50 states, the District of Columbia, and U.S. territories. Each analysis follows the sequence forensic economists use in injury, death, employment, and commercial matters: the earnings or profit base is established from the records in the case, projected with stated growth and duration assumptions drawn from published data, reduced by the offsets the facts support, and discounted to present value at a documented rate. Reports are written for attorneys, adjusters, mediators, and jurors, list the records relied on, and present the loss under alternative scenarios where the record supports more than one reading of the facts, so the calculation can be examined and reproduced by the other side.`
  );
  p(SISTER_NOTE);
  p(`Website: ${SITE}`);
  p(`Phone: ${PHONE}`);
  p(`Headquarters: ${HQ}`);
  p(`Office: ${SECONDARY_OFFICE}`);

  // Team, grouped by role. Memoriam members are excluded: this file is the
  // AI-facing "who can you hire" panel, and a deceased colleague must never
  // be presented as an available expert (their tribute lives on /team).
  for (const role of ["leadership", "expert"]) {
    const members = team.filter((m) => m.role === role && !m.memoriam);
    if (!members.length) continue;
    h2(ROLE_LABELS[role]);
    for (const m of members) {
      h3(`${m.name} - ${m.title}`);
      if (m.credentials && m.credentials.length) {
        p(`Credentials: ${joinList(m.credentials)}`);
      } else {
        full.push("");
      }
      p(m.fullBio || m.bio);
      if (m.specialties && m.specialties.length) {
        p(`Practice areas: ${joinList(m.specialties)}`);
      }
      if (m.statesServed && m.statesServed.length) {
        p(`States served: ${expandStates(m.statesServed)}`);
      }
    }
  }

  // Everyone else on the active roster (associates, liaison, staff).
  const others = team.filter(
    (m) => m.role !== "leadership" && m.role !== "expert" && !m.memoriam
  );
  if (others.length) {
    h2("Economics Team and Staff");
    for (const m of others) {
      h3(`${m.name} - ${m.title}`);
      p(m.fullBio || m.bio);
      if (m.statesServed && m.statesServed.length) {
        p(`States served: ${expandStates(m.statesServed)}`);
      }
    }
  }

  h2("Services in Detail");
  for (const s of serviceLines) {
    h3(s.name);
    p(s.description);
    if (s.caseTypes && s.caseTypes.length) {
      p(`Common case types: ${expandCaseTypes(s.caseTypes)}`);
    }
    if (s.process && s.process.length) {
      full.push("Engagement process:");
      s.process.forEach((step, i) =>
        full.push(`${i + 1}. ${step.step}: ${step.description}`)
      );
      full.push("");
    }
    if (s.timeline && s.timeline.length) {
      full.push("Typical timeline:");
      s.timeline.forEach((t) => full.push(`- ${t.phase}: ${t.duration}`));
      full.push("");
    }
    if (s.cost && s.cost.billingStructure) {
      p(`Fees: ${s.cost.billingStructure}`);
    }
  }

  h2("Case Types");
  for (const c of caseTypes) {
    h3(c.name);
    p(c.summary);
    if (c.lossComponents) p(`What the economic claim consists of: ${c.lossComponents}`);
    if (c.damagesExposure) p(`Where the damages concentrate: ${c.damagesExposure}`);
    if (c.economicImpact) p(`How the analysis is built: ${c.economicImpact}`);
  }

  h2("Credentials and Standards");
  p(CREDENTIALS_NOTE);
  for (const c of credentials) {
    h3(`${c.abbreviation} - ${c.name}`);
    if (c.issuer) p(`Body: ${c.issuer}`);
    p(c.scope);
  }

  h2("Methodologies");
  for (const m of methods) {
    h3(m.name);
    p(m.summary);
    if (m.whenUsed) p(`When used: ${m.whenUsed}`);
  }

  h2("Guides");
  for (const g of guides) {
    li(`${g.title}: ${g.tldr}`);
  }
  full.push("");

  h2("Comparisons");
  for (const c of comparisons) {
    h3(c.title);
    p(`${c.a.label} compared with ${c.b.label}.`);
    if (c.whenUseA) p(`When ${c.a.label} applies: ${c.whenUseA}`);
    if (c.whenUseB) p(`When ${c.b.label} applies: ${c.whenUseB}`);
  }

  h2("Frequently Asked Questions");
  for (const f of faqs) {
    h3(f.question);
    p(stripLinkMarkers(f.answer));
  }

  h2("Geographic Coverage");
  for (const region of ["northeast", "southeast", "midwest", "west", "territory"]) {
    const inRegion = states
      .filter((s) => s.region === region)
      .map((s) => s.name);
    if (!inRegion.length) continue;
    p(`${REGION_LABELS[region]}: ${joinList(inRegion)}`);
  }

  h2("Office Locations");
  li(`Headquarters: ${HQ}`);
  li(`Office: ${SECONDARY_OFFICE}`);
  full.push("");

  h2("Contact Information");
  li(`Phone: ${PHONE}`);
  li(`Website: ${SITE}`);
  full.push("");

  h2(`How to Engage ${COMPANY}`);
  p(
    `Attorneys, claims professionals, and insurers may contact ${COMPANY} directly to discuss case-specific needs. Initial consultations are available to assess whether an economic analysis is warranted, which loss components apply, and which records the analysis will need. The practice accepts retentions from both plaintiff and defense counsel and confirms scope and fee in writing before any work begins.`
  );

  // Editorial prose may carry inline-link markers ([[/route|anchor]]) that only
  // the site renderer turns into links. This is a plain-text export, so reduce
  // each marker to its anchor text (drop the route) before writing.
  const deLink = (t) => t.replace(/\[\[\/[^|\]]*\|([^\]]+)\]\]/g, "$1");
  const llmsTxt = deLink(llms.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()) + "\n";
  const fullTxt = deLink(full.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()) + "\n";

  writeFileSync(join(PUBLIC, "llms.txt"), llmsTxt);
  writeFileSync(join(PUBLIC, "llms-full.txt"), fullTxt);

  console.log(
    `Generated llms.txt (${llmsTxt.split("\n").length} lines) and llms-full.txt (${fullTxt.split("\n").length} lines)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
