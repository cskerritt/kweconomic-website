/**
 * KWVRS llms.txt generator
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
 * Run: node scripts/generate-llms.mjs
 */

import { createServer } from "vite";
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");

// Stable firm facts (kept consistent with src/lib/schema.ts).
const COMPANY = "Kincaid Wolstein Vocational and Rehabilitation Services";
const PHONE = "(201) 343-0700";
const SITE = "https://kwvrs.com";
const ECON_SITE = "https://kweconomics.com";
const HQ = "Hackensack, New Jersey";
const SECONDARY_OFFICE = "Virginia";

const REGION_LABELS = {
  northeast: "Northeast",
  southeast: "Southeast",
  midwest: "Midwest",
  west: "West",
  territory: "Territories",
};

const ROLE_LABELS = {
  leadership: "Leadership Team",
  expert: "Expert Panel",
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

  // Indexable service lines only; the forensic-economics cross-sell is a
  // pointer to the economics practice, not a KW LCP service.
  const serviceLines = pillarServices();

  // Map state abbreviation -> full name for expanding "statesServed".
  const stateNameByAbbr = {};
  for (const s of states) stateNameByAbbr[s.abbreviation] = s.name;
  const expandStates = (abbrs) =>
    (abbrs || []).map((a) => stateNameByAbbr[a] || a).join(", ");

  const territories = states
    .filter((s) => s.type === "territory")
    .map((s) => s.name);

  // -----------------------------------------------------------------------
  // llms.txt - concise, llmstxt.org-style summary
  // -----------------------------------------------------------------------
  const llms = [];
  llms.push(`# ${COMPANY} (KWVRS)`);
  llms.push("");
  llms.push("## About");
  llms.push("");
  llms.push(
    `${COMPANY} is a professional services firm providing vocational expert, life care planning, forensic economic, and rehabilitation consulting services for legal proceedings. The firm provides objective, independent analysis for both plaintiff and defense attorneys, with credentialed experts who offer court-admissible opinions and expert witness testimony nationwide.`
  );
  llms.push("");
  llms.push("## Services");
  llms.push("");
  for (const s of serviceLines) {
    llms.push(`- ${s.name}: ${s.description}`);
  }
  llms.push("");
  llms.push("## Geographic Coverage");
  llms.push("");
  llms.push("- All 50 U.S. states");
  llms.push("- District of Columbia");
  llms.push(
    `- U.S. territories including ${joinList(territories)}`
  );
  llms.push("");
  llms.push("## Credentials Held by the Team");
  llms.push("");
  for (const c of credentials) {
    llms.push(`- ${c.abbreviation} - ${c.name}`);
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
  llms.push("## Related Site");
  llms.push("");
  llms.push(`- ${ECON_SITE} - Forensic economics division`);
  llms.push("");
  llms.push("## Case Types Served");
  llms.push("");
  llms.push(joinList(caseTypes.map((c) => c.name)));
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
  p(
    `${COMPANY} (KWVRS) is a professional services firm specializing in vocational rehabilitation consulting, life care planning, forensic economics, and expert witness services for the legal community. The firm provides independent, objective analysis for both plaintiff and defense attorneys across all jurisdictions in the United States.`
  );
  p(
    `KWVRS operates from its New Jersey headquarters and a Virginia office, accepting cases in all 50 states, the District of Columbia, and U.S. territories. All evaluations are performed by credentialed specialists with advanced academic degrees and national certifications. Opinions are grounded in recognized methodology and authoritative data sources, and are prepared to meet the admissibility standards applied in state and federal courts and to withstand cross-examination.`
  );
  p(`Website: ${SITE}`);
  p(`Phone: ${PHONE}`);
  p(`Headquarters: ${HQ}`);
  p(`Forensic economics division: ${ECON_SITE}`);

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
      p(m.bio);
      if (m.specialties && m.specialties.length) {
        p(`Specialties: ${joinList(m.specialties)}`);
      }
      if (m.statesServed && m.statesServed.length) {
        p(`States served: ${expandStates(m.statesServed)}`);
      }
    }
  }

  // Additional team (everyone not leadership/expert), as a compact roster.
  const others = team.filter(
    (m) => m.role !== "leadership" && m.role !== "expert"
  );
  if (others.length) {
    h2("Additional Team and Staff");
    for (const m of others) {
      li(`${m.name} - ${m.title}`);
    }
    full.push("");
  }

  h2("Services in Detail");
  for (const s of serviceLines) {
    h3(s.name);
    p(s.description);
    if (s.caseTypes && s.caseTypes.length) {
      p(`Common case types: ${joinList(s.caseTypes)}`);
    }
    if (s.relevantCredentials && s.relevantCredentials.length) {
      p(`Relevant credentials: ${joinList(s.relevantCredentials)}`);
    }
    if (s.externalUrl) {
      p(`More information: ${s.externalUrl}`);
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
    if (c.careNeeds) p(`Care needs: ${c.careNeeds}`);
    if (c.costExposure) p(`Cost exposure: ${c.costExposure}`);
    if (c.lifeCareImpact) p(`Life care impact: ${c.lifeCareImpact}`);
  }

  h2("Professional Credentials");
  for (const c of credentials) {
    h3(`${c.abbreviation} - ${c.name}`);
    if (c.issuer) p(`Issuer: ${c.issuer}`);
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
  li(`Secondary office: ${SECONDARY_OFFICE}`);
  full.push("");

  h2("Contact Information");
  li(`Phone: ${PHONE}`);
  li(`Website: ${SITE}`);
  li(`Forensic economics: ${ECON_SITE}`);
  full.push("");

  h2("How to Engage KWVRS");
  p(
    `Attorneys, claims professionals, and insurers may contact KWVRS directly to discuss case-specific needs. Initial consultations are available to assess case suitability and expert qualifications. The firm accepts referrals from both plaintiff and defense counsel, and provides a written fee schedule and a cost estimate before any engagement begins.`
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
