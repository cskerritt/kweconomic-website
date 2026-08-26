/**
 * KWVRS Pre-render Script
 *
 * Generates static HTML files for every route after vite build completes.
 * Each file contains correct meta tags, title, description, canonical URL,
 * schema.org JSON-LD, and a basic HTML content skeleton so that search
 * engines can index the content before JavaScript loads and React hydrates.
 *
 * Run: node scripts/prerender.mjs
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const SRC_DATA = join(ROOT, "src", "data");
const BASE_URL = "https://kwvrs.com";
const COMPANY = "Kincaid Wolstein Vocational and Rehabilitation Services";
// Raster logo for structured-data logo/image fields - Google's rich-results
// guidelines prefer PNG/JPG over SVG. Mirrors ORG_LOGO in src/lib/schema.ts so
// non-JS crawlers see the same logo the React-injected Organization schema emits.
const LOGO_URL = `${BASE_URL}/images/logo.png`;
const ORG_LOGO_IMAGE = { "@type": "ImageObject", url: LOGO_URL };

// ---------------------------------------------------------------------------
// 1. Read the built dist/index.html as the template
// ---------------------------------------------------------------------------
const template = readFileSync(join(DIST, "index.html"), "utf-8");

// ---------------------------------------------------------------------------
// 2. Extract data from TypeScript source files using regex
// ---------------------------------------------------------------------------

function extractPairs(content, slugPattern, namePattern) {
  const slugs = [...content.matchAll(slugPattern)].map((m) => m[1]);
  const names = [...content.matchAll(namePattern)].map((m) => m[1]);
  // These two passes are zipped positionally (the i-th slug pairs with the i-th
  // name). That holds only while every object has exactly one of each in the same
  // order; a stray or missing field shifts the alignment and would silently ship
  // mis-paired pages (the `|| slug` fallback hides it). Fail the build loudly on a
  // count mismatch instead so the data file / pattern gets fixed.
  if (slugs.length !== names.length) {
    throw new Error(
      `extractPairs count mismatch: ${slugs.length} slug(s) vs ${names.length} ` +
        `${namePattern.source} match(es) (first slug: "${slugs[0] ?? "?"}"). ` +
        `Fix the data file or the namePattern - positional zipping requires equal counts.`,
    );
  }
  return slugs.map((slug, i) => ({ slug, name: names[i] || slug }));
}

// States
const statesContent = readFileSync(join(SRC_DATA, "states.ts"), "utf-8");
const stateData = extractPairs(
  statesContent,
  /slug:\s*"([^"]+)"/g,
  /\bname:\s*"([^"]+)"/g
);

// Services
const servicesContent = readFileSync(join(SRC_DATA, "services.ts"), "utf-8");
const serviceData = extractPairs(
  servicesContent,
  /slug:\s*"([^"]+)"/g,
  /\bname:\s*"([^"]+)"/g
);

// Knowledge guides
const knowledgeContent = readFileSync(join(SRC_DATA, "knowledge.ts"), "utf-8");
const guideData = extractPairs(
  knowledgeContent,
  /slug:\s*"([^"]+)"/g,
  /title:\s*"([^"]+)"/g
);

// Insight posts
const insightsContent = readFileSync(join(SRC_DATA, "insights.ts"), "utf-8");
const postData = extractPairs(
  insightsContent,
  /slug:\s*"([^"]+)"/g,
  /title:\s*"([^"]+)"/g
);

/**
 * Extract top-level entries (slug + title) from a data file where each entry
 * is indented at 2 spaces and `slug:` and `title:` appear on consecutive lines
 * at 4-space indent. Avoids matching nested `title:` fields in related/sources.
 */
function extractTopLevelPairs(content) {
  const re = /^ {2}\{\s*\n {4}slug:\s*"([^"]+)",\s*\n {4}title:\s*"([^"]+)"/gm;
  const pairs = [];
  let m;
  while ((m = re.exec(content)) !== null) {
    pairs.push({ slug: m[1], name: m[2] });
  }
  return pairs;
}

// Guides (`/guides/:slug`)
const guidesContent = readFileSync(join(SRC_DATA, "guides.ts"), "utf-8");
const guideSlugData = extractTopLevelPairs(guidesContent);

// Comparisons (`/compare/:slug`)
const comparisonsContent = readFileSync(join(SRC_DATA, "comparisons.ts"), "utf-8");
const comparisonData = extractTopLevelPairs(comparisonsContent);

/**
 * Extract authorSlug + dateModified per entry. Both fields are optional.
 * Returns map slug -> { authorSlug, dateModified }.
 */
function extractAuthorMap(content) {
  const map = {};
  const blocks = content.split(/(?=\n\s*\{\s*\n\s*slug:\s*")/);
  for (const block of blocks) {
    const slug = block.match(/slug:\s*"([^"]+)"/)?.[1];
    if (!slug) continue;
    const authorSlug = block.match(/authorSlug:\s*"([^"]+)"/)?.[1];
    const dateModified = block.match(/dateModified:\s*"([^"]+)"/)?.[1];
    const publishedDate = block.match(/publishedDate:\s*"([^"]+)"/)?.[1];
    map[slug] = {
      authorSlug,
      dateModified: dateModified ?? publishedDate,
      publishedDate,
    };
  }
  return map;
}
const insightAuthorMap = extractAuthorMap(insightsContent);
const guideAuthorMap = extractAuthorMap(knowledgeContent);

// Build a simple team map (slug -> { name, credentials[] }) for AuthorByline
// inline rendering. credentials are extracted as the array entries between
// `credentials: [` and the first closing `]`.
const teamContent = readFileSync(join(SRC_DATA, "team.ts"), "utf-8");
const teamMap = (() => {
  const m = {};
  const blocks = teamContent.split(/(?=\n\s*\{\s*\n\s*slug:\s*")/);
  for (const block of blocks) {
    const slug = block.match(/slug:\s*"([^"]+)"/)?.[1];
    if (!slug) continue;
    const name = block.match(/name:\s*"([^"]+)"/)?.[1];
    const credsBlock = block.match(/credentials:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
    const credentials = [...credsBlock.matchAll(/"([^"]+)"/g)].map((x) => x[1]);
    m[slug] = { name, credentials };
  }
  return m;
})();

// Cities - one file per state
const cityFiles = readdirSync(join(SRC_DATA, "cities")).filter(
  (f) => f.endsWith(".ts") && f !== "index.ts"
);

const cityDataByState = {};
for (const file of cityFiles) {
  const content = readFileSync(join(SRC_DATA, "cities", file), "utf-8");
  const stateSlug = file.replace(".ts", "");
  const citySlugs = [...content.matchAll(/slug:\s*"([^"]+)"/g)].map(
    (m) => m[1]
  );
  const cityNames = [...content.matchAll(/\bname:\s*"([^"]+)"/g)].map(
    (m) => m[1]
  );
  const cityCounties = [...content.matchAll(/county:\s*"([^"]+)"/g)].map(
    (m) => m[1]
  );
  cityDataByState[stateSlug] = citySlugs.map((slug, i) => ({
    slug,
    name: cityNames[i] || slug,
    county: cityCounties[i],
  }));
}

// Build a lookup for state slug -> state name
const stateNameMap = {};
for (const s of stateData) {
  stateNameMap[s.slug] = s.name;
}

// Disclosure rules: each entry has stateSlug, stateName, plainSummary, and
// dateModified. Citation fields were removed by the citation-free policy
// refactor; primary-source legal citations are intentionally not maintained
// on the public site.
function extractDisclosureRules(content) {
  const stateSlugs = [...content.matchAll(/^\s+stateSlug:\s*"([^"]+)"/gm)].map(
    (m) => m[1],
  );
  const stateNames = [...content.matchAll(/^\s+stateName:\s*"([^"]+)"/gm)].map(
    (m) => m[1],
  );
  const dateModifieds = [
    ...content.matchAll(/^\s+dateModified:\s*"([^"]+)"/gm),
  ].map((m) => m[1]);
  // plainSummary may span multiple lines (template-literal-like split). The
  // values in disclosureRules.ts use double-quoted string concatenation; the
  // first quoted chunk is sufficient for a meta-description fallback.
  const plainSummaries = [
    ...content.matchAll(/^\s+plainSummary:\s*\n?\s*"([^"]+)"/gm),
  ].map((m) => m[1]);
  return stateSlugs.map((stateSlug, i) => ({
    stateSlug,
    stateName: stateNames[i],
    plainSummary: plainSummaries[i] || "",
    dateModified: dateModifieds[i],
  }));
}

// kwlcp.com has no expert-disclosure data (Task 4 removed it); Task 12 strips
// the disclosure branches from this script entirely. Until then, no file = no rules.
const disclosureRulesFile = join(SRC_DATA, "disclosureRules.ts");
const disclosureRules = existsSync(disclosureRulesFile)
  ? extractDisclosureRules(readFileSync(disclosureRulesFile, "utf-8"))
  : [];

// ---------------------------------------------------------------------------
// 2b. Extract per-state and per-metro narrative inputs.
//
// These mirror the React-side helpers in src/data/narratives.ts so the
// static prerender HTML carries the same direct-answer + market-context
// content. Without this, non-JS crawlers see only the bare H1 + 1 P stub.
// ---------------------------------------------------------------------------

/**
 * Parse a TS data file structured as `[{stateSlug: "...", ...}, ...]`.
 * Returns a map keyed by stateSlug with extracted scalar fields and the
 * first topIndustries[0].name when present.
 */
function extractStateLaborMap() {
  const content = readFileSync(join(SRC_DATA, "labor", "state-labor.ts"), "utf-8");
  const map = {};
  // Split into one block per entry. The blocks start at each `stateSlug:` line
  // and end at the next one (or end-of-array).
  const blocks = content.split(/(?=\n\s*\{\s*\n\s*stateSlug:\s*")/);
  for (const block of blocks) {
    const slug = block.match(/stateSlug:\s*"([^"]+)"/)?.[1];
    if (!slug) continue;
    const wage = block.match(/medianHourlyWage:\s*([\d.]+)/)?.[1];
    const income = block.match(/medianHouseholdIncome:\s*(\d+)/)?.[1];
    const unemployment = block.match(/unemploymentRate:\s*([\d.]+)/)?.[1];
    // Match the first topIndustries entry's name within this block only.
    const topIndustryMatch = block.match(
      /topIndustries:\s*\[\s*\{\s*name:\s*"([^"]+)"/,
    );
    map[slug] = {
      medianHourlyWage: wage ? parseFloat(wage) : undefined,
      medianHouseholdIncome: income ? parseInt(income, 10) : undefined,
      unemploymentRate: unemployment ? parseFloat(unemployment) : undefined,
      topIndustry: topIndustryMatch?.[1],
    };
  }
  return map;
}

function extractStateCourtsMap() {
  const content = readFileSync(join(SRC_DATA, "courts", "state-courts.ts"), "utf-8");
  const map = {};
  const blocks = content.split(/(?=\n\s*\{\s*\n\s*stateSlug:\s*")/);
  for (const block of blocks) {
    const slug = block.match(/stateSlug:\s*"([^"]+)"/)?.[1];
    if (!slug) continue;
    const supremeCourt = block.match(/supremeCourt:\s*"([^"]+)"/)?.[1];
    // First trialCourts[].name within block
    const trialMatch = block.match(
      /trialCourts:\s*\[\s*\{\s*name:\s*"([^"]+)"/,
    );
    // Count of federalDistricts entries
    const federalDistricts = (block.match(
      /federalDistricts:\s*\[([\s\S]*?)\]/,
    )?.[1] ?? "").match(/\bname:\s*"/g)?.length ?? 0;
    map[slug] = {
      supremeCourt,
      trialCourtName: trialMatch?.[1],
      federalDistrictCount: federalDistricts,
    };
  }
  return map;
}

function extractStateRegsMap() {
  const content = readFileSync(join(SRC_DATA, "regulations", "state-regs.ts"), "utf-8");
  const map = {};
  const blocks = content.split(/(?=\n\s*\{\s*\n\s*stateSlug:\s*")/);
  for (const block of blocks) {
    const slug = block.match(/stateSlug:\s*"([^"]+)"/)?.[1];
    if (!slug) continue;
    const agency = block.match(/vocationalRehabAgency:\s*"([^"]+)"/)?.[1];
    map[slug] = { vocationalRehabAgency: agency };
  }
  return map;
}

function extractMetroLaborMap() {
  const content = readFileSync(join(SRC_DATA, "labor", "metro-labor.ts"), "utf-8");
  const map = {};
  const blocks = content.split(/(?=\n\s*\{\s*\n\s*citySlug:\s*")/);
  for (const block of blocks) {
    const citySlug = block.match(/citySlug:\s*"([^"]+)"/)?.[1];
    const stateSlug = block.match(/stateSlug:\s*"([^"]+)"/)?.[1];
    if (!citySlug || !stateSlug) continue;
    const wage = block.match(/medianHourlyWage:\s*([\d.]+)/)?.[1];
    const unemployment = block.match(/unemploymentRate:\s*([\d.]+)/)?.[1];
    // First topIndustries entry (legacy field used elsewhere).
    const topIndustryMatch = block.match(
      /topIndustries:\s*\[\s*\{\s*name:\s*"([^"]+)"/,
    );
    // Full topIndustries list (used by buildCityNarrative).
    const industriesBlock = block.match(/topIndustries:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
    const topIndustries = [...industriesBlock.matchAll(/name:\s*"([^"]+)"/g)].map((m) => ({
      name: m[1],
    }));
    // topEmployers string list.
    const employersBlock = block.match(/topEmployers:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
    const topEmployers = [...employersBlock.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    map[`${stateSlug}/${citySlug}`] = {
      medianHourlyWage: wage ? parseFloat(wage) : undefined,
      unemploymentRate: unemployment ? parseFloat(unemployment) : undefined,
      topIndustry: topIndustryMatch?.[1],
      topIndustries,
      topEmployers,
    };
  }
  return map;
}

const stateLaborMap = extractStateLaborMap();
const stateCourtsMap = extractStateCourtsMap();
const stateRegsMap = extractStateRegsMap();
const metroLaborMap = extractMetroLaborMap();

const fmtMoney = (n) => (typeof n === "number" ? `$${n.toLocaleString("en-US")}` : "");
const fmtRate = (n) => (typeof n === "number" ? `${n.toFixed(1)}%` : "");

/**
 * State narrative - mirrors getStateNarrative() in src/data/narratives.ts.
 * Returns { directAnswer, marketContext, legalContext } as plain strings.
 */
function buildStateNarrative(state) {
  const labor = stateLaborMap[state.slug];
  const courts = stateCourtsMap[state.slug];
  const regs = stateRegsMap[state.slug];

  const topIndustry = labor?.topIndustry;
  const medianHourly = fmtMoney(labor?.medianHourlyWage);
  const medianHousehold = fmtMoney(labor?.medianHouseholdIncome);
  const unemployment = fmtRate(labor?.unemploymentRate);

  const trialCourtName = courts?.trialCourtName ?? "general-jurisdiction trial court";
  const supremeCourt = courts?.supremeCourt;
  const federalDistrictCount = courts?.federalDistrictCount ?? 0;
  const agency = regs?.vocationalRehabAgency;

  const directAnswer = [
    `KWVRS provides vocational, economic, and life care expert services for matters venued in ${state.name}.`,
    topIndustry
      ? `${state.name}'s labor market is anchored by ${topIndustry.toLowerCase()}${
          medianHourly ? ` with a ${medianHourly}/hr median wage` : ""
        }.`
      : `${state.name} matters span personal injury, motor vehicle, workers' compensation, wrongful-death, and matrimonial work.`,
    "Plaintiff and defense.",
  ].join(" ");

  const marketParts = [];
  if (medianHousehold) {
    marketParts.push(
      `${state.name} reports a ${medianHousehold} median household income${medianHourly ? ` and a ${medianHourly}/hr median wage` : ""}.`,
    );
  }
  if (unemployment) marketParts.push(`Statewide unemployment runs near ${unemployment}.`);
  if (topIndustry) marketParts.push(`Top sector: ${topIndustry}.`);
  const marketContext =
    marketParts.length > 0
      ? marketParts.join(" ")
      : `Earning capacity and economic-loss analyses in ${state.name} draw on state-level wage benchmarks and regional industry mix.`;

  const legalParts = [];
  if (trialCourtName) legalParts.push(`${state.name}'s ${trialCourtName} is the primary trial-level forum for civil matters.`);
  if (supremeCourt) legalParts.push(`Final state-court appeals run to the ${supremeCourt}.`);
  if (federalDistrictCount > 0) {
    legalParts.push(
      `${state.name} is served by ${federalDistrictCount} federal district court${federalDistrictCount === 1 ? "" : "s"}.`,
    );
  }
  if (agency) legalParts.push(`The ${agency} administers vocational rehabilitation in the state.`);
  const legalContext =
    legalParts.length > 0
      ? legalParts.join(" ")
      : `${state.name} matters proceed under the state's civil procedure framework with case-specific scheduling.`;

  return { directAnswer, marketContext, legalContext };
}

/**
 * City narrative - mirrors getCityNarrative() in src/data/narratives.ts.
 */
function buildCityNarrative(state, city) {
  const metro = metroLaborMap[`${state.slug}/${city.slug}`];
  const stateLabor = stateLaborMap[state.slug];
  const wage = fmtMoney(metro?.medianHourlyWage);
  const topIndustry = metro?.topIndustry;
  const top3 = metro?.topIndustries?.slice(0, 3).map((i) => i.name).join(", ");
  const topEmployer = metro?.topEmployers?.[0];
  const unemployment = metro?.unemploymentRate;
  const stateTopIndustry = stateLabor?.topIndustry;

  // directAnswer carries the wage. blurb must NOT repeat it.
  const directAnswer = [
    `KWVRS provides vocational, economic, and life care expert services for cases venued in ${city.name}, ${state.name}.`,
    topIndustry
      ? `${city.name}'s economy is anchored by ${topIndustry.toLowerCase()}${wage ? ` with a ${wage}/hr median wage` : ""}.`
      : stateTopIndustry
        ? `${city.name} sits in a labor market shaped by ${state.name}'s ${stateTopIndustry.toLowerCase()} sector.`
        : `${city.name} matters draw on regional labor market data tailored to ${state.name}.`,
    "Plaintiff and defense.",
  ].join(" ");

  // Build a unique-per-city blurb. Avoid repeating the wage.
  const blurbParts = [];
  if (metro) {
    if (top3) blurbParts.push(`Top sectors include ${top3}.`);
    if (topEmployer) blurbParts.push(`Major employers such as ${topEmployer} anchor the local labor market.`);
    if (typeof unemployment === "number") {
      blurbParts.push(`Local unemployment runs at ${unemployment.toFixed(1)}%.`);
    }
  }
  if (city.county) {
    blurbParts.push(`${city.name} matters typically venue in ${city.county} court.`);
  }
  blurbParts.push(
    metro
      ? `Earning capacity and economic-loss analyses for ${city.name} cases incorporate metro-level wage and industry data.`
      : `Analyses for ${city.name} cases incorporate ${state.name} state-level wage data with metro-level adjustments where applicable.`,
  );
  const blurb = blurbParts.join(" ");

  return { directAnswer, blurb };
}

// FAQ generators - mirror src/data/geographicFaqs.ts.
function stateGeographicFaqs(stateName) {
  return [
    {
      question: `Does KWVRS provide expert services for ${stateName} cases?`,
      answer: `Yes. KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in ${stateName}. We support plaintiff and defense counsel across personal injury, motor vehicle, workers' compensation, wrongful-death, matrimonial, and other case types. Attorneys are responsible for confirming the governing rule and timing for their specific case.`,
    },
    {
      question: `What deliverables are available for ${stateName} matters?`,
      answer: `KWVRS provides full retained-expert reports across the Vocational, Economic, and Life Care disciplines, sized to both trial-track and settlement matters. The appropriate deliverable depends on the case posture and the disclosure framework that applies to the specific matter.`,
    },
    {
      question: `How is ${stateName}'s labor market handled in earning capacity analyses?`,
      answer: `KWVRS incorporates state-level and metro-level labor market data for ${stateName}, including wage benchmarks, top industries, and regional adjustments where the case warrants. The methodology references accepted vocational and forensic economic protocols and supports both pre-trial settlement and trial-track use depending on the engagement scope.`,
    },
    {
      question: `When is expert disclosure due in ${stateName}?`,
      answer: `Disclosure timing is typically set by the case's scheduling order or case management order. Attorneys are responsible for confirming the specific deadlines for their case against primary sources. KWVRS calibrates engagement scope and turnaround to the disclosure window.`,
    },
  ];
}

function cityGeographicFaqs(stateName, cityName) {
  return [
    {
      question: `Does KWVRS provide expert services for ${cityName}, ${stateName} cases?`,
      answer: `Yes. KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in ${cityName}, ${stateName}. We support plaintiff and defense counsel across the full civil case mix common to ${cityName} matters.`,
    },
    {
      question: `What does a vocational expert engagement cost for a ${cityName} case?`,
      answer: `Full retained-expert engagements are billed hourly across review, evaluation, report, and testimony phases. Specific cost depends on case complexity and engagement scope.`,
    },
    {
      question: `Does KWVRS work both plaintiff and defense in ${cityName}?`,
      answer: `Yes. KWVRS provides independent, objective analysis for plaintiff and defense counsel in ${cityName}, ${stateName} matters. The methodology is the same regardless of which side commissions the work; KWVRS provides neutral analysis grounded in accepted vocational, economic, and life care planning protocols.`,
    },
  ];
}

function serviceStateGeographicFaqs(serviceName, stateName) {
  return [
    {
      question: `Does KWVRS provide ${serviceName.toLowerCase()} in ${stateName}?`,
      answer: `Yes. KWVRS provides ${serviceName.toLowerCase()} for attorneys handling matters venued in ${stateName}. We support plaintiff and defense counsel with case-specific deliverables sized to the engagement scope.`,
    },
    {
      question: `What does a ${serviceName.toLowerCase()} engagement look like for a ${stateName} case?`,
      answer: `A complete engagement typically includes review of medical and vocational records, optional interview and testing where appropriate, written expert report, deposition preparation and testimony, and trial testimony when required. Scope and turnaround are calibrated to the case posture and the governing disclosure framework.`,
    },
    {
      question: `When is expert disclosure due in ${stateName}?`,
      answer: `Disclosure timing is typically set by the scheduling order in the case. Attorneys are responsible for confirming the specific deadlines for their case against primary sources. KWVRS calibrates engagement scope and turnaround to the disclosure window.`,
    },
  ];
}

function serviceCityGeographicFaqs(serviceName, stateName, cityName) {
  return [
    {
      question: `Does KWVRS provide ${serviceName.toLowerCase()} in ${cityName}, ${stateName}?`,
      answer: `Yes. KWVRS provides ${serviceName.toLowerCase()} for attorneys handling matters venued in ${cityName}, ${stateName}. We support plaintiff and defense counsel across the full case mix common to ${cityName} matters.`,
    },
    {
      question: `How is the ${cityName} labor market handled in the analysis?`,
      answer: `KWVRS incorporates metro-level labor market data for ${cityName}, including wage benchmarks and top-industry mix, alongside ${stateName} state-level data where appropriate. Earning capacity and economic-loss analyses use accepted vocational and forensic economic protocols.`,
    },
    {
      question: `What deliverables are available for a ${cityName} case?`,
      answer: `KWVRS provides full retained-expert reports across the Vocational, Economic, and Life Care disciplines, sized to both trial-track and settlement matters. The appropriate deliverable depends on case posture.`,
    },
  ];
}

/** Render a list of FAQs as static HTML <details> blocks for the prerender body. */
function renderFaqHtml(faqs, headingText) {
  const items = faqs
    .map(
      (f) =>
        `<details><summary>${escapeHtml(f.question)}</summary><p>${escapeHtml(f.answer)}</p></details>`,
    )
    .join("");
  return `<section><h2>${escapeHtml(headingText)}</h2>${items}</section>`;
}

/** Build a FAQPage JSON-LD blob from a list of FAQs. Returns the JSON string ready for inlining. */
function buildFaqJsonLd(faqs, pageUrl) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  });
}

// ---------------------------------------------------------------------------
// 3. Helper: generate a modified index.html for a given route
// ---------------------------------------------------------------------------

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPage({ path, title, description, innerHtml, schemaType, extraJsonLd, authorSlug, authorName, datePublished, dateModified }) {
  // Homepage canonical keeps its trailing slash to match use-page-meta (which
  // normalizes every other path to no trailing slash but leaves the root as "/").
  const url = path === "/" ? `${BASE_URL}/` : `${BASE_URL}${path}`;
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);

  // Schema.org JSON-LD
  let jsonLd;
  if (schemaType === "WebSite") {
    jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: COMPANY,
      url: BASE_URL,
      description: description,
    });
  } else if (schemaType === "LocalBusiness") {
    jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: COMPANY,
      url: url,
      description: description,
      logo: LOGO_URL,
      image: LOGO_URL,
      areaServed: { "@type": "Country", name: "United States" },
    });
  } else if (schemaType === "Service") {
    jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      name: title.replace(" | KWVRS", ""),
      provider: { "@type": "Organization", name: COMPANY, url: BASE_URL, logo: ORG_LOGO_IMAGE },
      url: url,
      description: description,
    });
  } else if (schemaType === "Article") {
    const articleAuthor = authorSlug
      ? { "@type": "Person", "@id": `${BASE_URL}/team/${authorSlug}#person`, name: authorName ?? "KWVRS Editorial Team" }
      : { "@type": "Organization", name: COMPANY };
    jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title.replace(" | KWVRS", ""),
      image: LOGO_URL,
      publisher: { "@type": "Organization", name: COMPANY, url: BASE_URL, logo: ORG_LOGO_IMAGE },
      author: articleAuthor,
      url: url,
      description: description,
      ...(datePublished ? { datePublished } : {}),
      ...(dateModified ? { dateModified } : {}),
    });
  } else {
    jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      url: url,
      description: description,
      publisher: { "@type": "Organization", name: COMPANY, url: BASE_URL, logo: ORG_LOGO_IMAGE },
    });
  }

  const metaTags = `
    <meta name="description" content="${safeDesc}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:url" content="${url}" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <script type="application/ld+json">${jsonLd}</script>${extraJsonLd ? `\n    <script type="application/ld+json">${extraJsonLd}</script>` : ""}`;

  let html = template;

  // Strip the template's generic multi-line <meta name="description"> so the
  // page-specific one injected below is the ONLY description tag. Without this,
  // every prerendered page shipped two competing description tags.
  html = html.replace(/\s*<meta\s+name="description"[\s\S]*?\/>/i, "");

  // Replace title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${safeTitle}</title>`
  );

  // Insert meta tags after the <title> tag
  html = html.replace(
    /(<title>[^<]*<\/title>)/,
    (match) => `${match}${metaTags}`
  );

  // Replace <div id="root"></div> with content
  html = html.replace(
    /<div id="root"><\/div>/,
    `<div id="root">${innerHtml}</div>`
  );

  return html;
}

function writePage(routePath, html) {
  let filePath;
  if (routePath === "/") {
    filePath = join(DIST, "index.html");
  } else {
    filePath = join(DIST, routePath, "index.html");
  }
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, html, "utf-8");
}

// ---------------------------------------------------------------------------
// 4. Generate all pages
// ---------------------------------------------------------------------------

const counts = {
  core: 0,
  servicePillar: 0,
  knowledge: 0,
  insights: 0,
  guides: 0,
  comparisons: 0,
  state: 0,
  city: 0,
  serviceState: 0,
};

// --- Core pages ---

const corePages = [
  {
    path: "/",
    title: "Vocational, Economic & Life Care Expert Witness Services | KWVRS",
    description:
      "Independent vocational evaluations, life care plans, and forensic economic analyses for plaintiff and defense attorneys nationwide. Response in 1 business day.",
    innerHtml:
      `<h1>Defensible expert opinions for plaintiff and defense counsel, nationwide.</h1>` +
      `<p>Kincaid Wolstein Vocational and Rehabilitation Services provides independent vocational evaluations, life care plans, and forensic economic analyses for plaintiff and defense counsel.</p>` +
      `<p>Engagements accepted in all 50 states, the District of Columbia, and US territories. Headquarters in Hackensack, NJ with a Richmond, VA office. <a href="tel:+12013430700">(201) 343-0700</a>.</p>` +
      // FAQ block - mirrors the React FAQ schema for non-JS crawlers and AI search.
      `<section><h2>Common questions</h2>` +
      `<details><summary>What is a vocational expert?</summary><p>A vocational expert is a qualified rehabilitation professional who evaluates an individual's ability to work, earn wages, and sustain employment given their education, training, experience, and medical restrictions. In litigation, vocational experts produce earning-capacity opinions and provide testimony on employability and labor-market access.</p></details>` +
      `<details><summary>Does KWVRS work for plaintiff and defense?</summary><p>Yes. KWVRS accepts retentions from both plaintiff and defense counsel. The methodology is identical regardless of which side commissions the work.</p></details>` +
      `<details><summary>How much does an expert engagement cost?</summary><p>Full retained-expert engagements are billed hourly across review, evaluation, report, and (if needed) testimony phases.</p></details>` +
      `<details><summary>How long does an evaluation take?</summary><p>Full retained-expert reports typically take 30 to 90 days from records receipt depending on case complexity. Rush turnarounds are accommodated case-by-case.</p></details>` +
      `<details><summary>Where does KWVRS provide services?</summary><p>KWVRS accepts engagements in all 50 states, the District of Columbia, and US territories.</p></details>` +
      `<details><summary>What credentials should I look for?</summary><p>Common credentials are CRC, CVE, CLCP, ABVE/D, and FVE. KWVRS practitioners hold combinations of these plus Ph.D., M.D., and CPA-level credentials.</p></details>` +
      `</section>` +
      `<nav><a href="/services">Services</a> <a href="/locations">Locations</a> <a href="/about">About</a> <a href="/contact">Contact</a></nav>`,
    schemaType: "WebSite",
    extraJsonLd: buildFaqJsonLd(
      [
        {
          question: "What is a vocational expert?",
          answer:
            "A vocational expert is a qualified rehabilitation professional who evaluates an individual's ability to work, earn wages, and sustain employment given their education, training, experience, and medical restrictions. In litigation, vocational experts produce earning-capacity opinions and provide testimony on employability and labor-market access.",
        },
        {
          question: "Does KWVRS work for plaintiff and defense?",
          answer:
            "Yes. KWVRS accepts retentions from both plaintiff and defense counsel. The methodology is identical regardless of which side commissions the work.",
        },
        {
          question: "How much does an expert engagement cost?",
          answer:
            "Full retained-expert engagements are billed hourly across review, evaluation, report, and (if needed) testimony phases. Specific cost depends on case complexity, the disciplines involved, and the expert's docket.",
        },
        {
          question: "How long does a vocational, economic, or life care evaluation take?",
          answer:
            "Full retained-expert reports typically take 30 to 90 days from records receipt depending on case complexity and the expert's docket. Rush turnarounds are accommodated case-by-case.",
        },
        {
          question: "Where does KWVRS provide services?",
          answer:
            "KWVRS accepts engagements in all 50 states, the District of Columbia, and US territories. State-specific framing is available on every state and city page. Headquarters is in Hackensack, New Jersey, with a Richmond, Virginia office.",
        },
        {
          question: "What credentials should I look for in a vocational expert?",
          answer:
            "Common credentials are CRC (Certified Rehabilitation Counselor), CVE (Certified Vocational Evaluator), CLCP (Certified Life Care Planner), ABVE/D (Diplomate of the American Board of Vocational Experts), and FVE (Forensic Vocational Examiner). KWVRS practitioners hold combinations of these plus Ph.D., M.D., and CPA-level credentials.",
        },
      ],
      `${BASE_URL}/`,
    ),
  },
  {
    path: "/about",
    title: "About KWVRS - Vocational & Rehabilitation Experts",
    description:
      "Learn about Kincaid Wolstein Vocational and Rehabilitation Services - our mission, approach, and commitment to objective, evidence-based vocational and rehabilitation consulting.",
    innerHtml:
      '<h1>About KWVRS</h1><p>Kincaid Wolstein Vocational and Rehabilitation Services is a nationwide consulting firm providing objective vocational evaluations, life care planning, forensic economics, and expert witness testimony.</p><nav><a href="/team">Our Team</a> <a href="/services">Services</a> <a href="/contact">Contact</a></nav>',
    schemaType: "LocalBusiness",
  },
  {
    path: "/team",
    title: "Our Team | KWVRS",
    description:
      "Meet the professionals at Kincaid Wolstein Vocational and Rehabilitation Services - credentialed vocational experts, life care planners, and forensic economists.",
    innerHtml:
      '<h1>Our Team</h1><p>The KWVRS team brings together credentialed vocational experts, life care planners, and forensic economists serving attorneys nationwide.</p><nav><a href="/about">About</a> <a href="/services">Services</a> <a href="/contact">Contact</a></nav>',
    schemaType: "WebPage",
  },
  {
    path: "/contact",
    title: "Contact Us | KWVRS",
    description:
      "Contact Kincaid Wolstein Vocational and Rehabilitation Services for vocational expert evaluations, life care plans, and forensic economic analysis.",
    innerHtml:
      '<h1>Contact KWVRS</h1><p>Reach out to Kincaid Wolstein Vocational and Rehabilitation Services to discuss your case or schedule a consultation.</p><nav><a href="/services">Services</a> <a href="/locations">Locations</a> <a href="/about">About</a></nav>',
    schemaType: "LocalBusiness",
  },
  {
    path: "/intake",
    title: "Retain KWVRS - Intake Forms | KWVRS",
    description:
      "Start a KWVRS engagement. Choose the digital intake form that matches your matter - personal injury or matrimonial - each mirroring its Professional Services Agreement.",
    innerHtml:
      '<h1>Retain KWVRS</h1><p>Choose the digital intake form that matches your matter. The unified retainer intake routes your case type to the matching Professional Services Agreement workflow.</p><nav><a href="/contact/intake">Retainer intake</a> <a href="/contact">Contact</a></nav>',
    schemaType: "WebPage",
  },
  {
    path: "/forms",
    title: "Forms | KWVRS",
    description:
      "Download intake and medical records forms for a Kincaid Wolstein Vocational and Rehabilitation Services evaluation, including the HIPAA authorization and patient health questionnaire.",
    innerHtml:
      '<h1>Forms</h1><p>Download intake and medical records forms to support a Kincaid Wolstein Vocational and Rehabilitation Services evaluation.</p><nav><a href="/contact">Contact</a> <a href="/services">Services</a></nav>',
    schemaType: "WebPage",
  },
  {
    path: "/phq-form-english",
    title: "Patient Health Questionnaire (English) | KWVRS",
    description:
      "Download the patient health questionnaire PDF for a Kincaid Wolstein Vocational and Rehabilitation Services evaluation and return it via secure upload.",
    innerHtml:
      '<h1>Patient Health Questionnaire (English)</h1><p>Download the PDF and return it via secure upload to support your evaluation.</p><nav><a href="/forms">All Forms</a> <a href="/contact">Contact</a></nav>',
    schemaType: "WebPage",
  },
  {
    path: "/phq-form-spanish",
    title: "Cuestionario de Salud del Paciente (Español) | KWVRS",
    description:
      "Descargue el PDF del cuestionario de salud del paciente para una evaluación de Kincaid Wolstein Vocational and Rehabilitation Services y devuélvalo por carga segura.",
    innerHtml:
      '<h1>Cuestionario de Salud del Paciente (Español)</h1><p>Descargue el PDF y devuélvalo por carga segura para respaldar su evaluación.</p><nav><a href="/forms">Formularios</a> <a href="/contact">Contacto</a></nav>',
    schemaType: "WebPage",
  },
  {
    path: "/hipaa-english",
    title: "HIPAA Authorization (English) | KWVRS",
    description:
      "Download the HIPAA authorization PDF to release medical records for a Kincaid Wolstein Vocational and Rehabilitation Services evaluation and return it via secure upload.",
    innerHtml:
      '<h1>HIPAA Authorization (English)</h1><p>Download the PDF and return it via secure upload to authorize the release of medical records.</p><nav><a href="/forms">All Forms</a> <a href="/contact">Contact</a></nav>',
    schemaType: "WebPage",
  },
  {
    path: "/hipaa-spanish",
    title: "Autorización HIPAA (Español) | KWVRS",
    description:
      "Descargue el PDF de la autorización HIPAA para divulgar registros médicos para una evaluación de Kincaid Wolstein Vocational and Rehabilitation Services y devuélvalo por carga segura.",
    innerHtml:
      '<h1>Autorización HIPAA (Español)</h1><p>Descargue el PDF y devuélvalo por carga segura para autorizar la divulgación de registros médicos.</p><nav><a href="/forms">Formularios</a> <a href="/contact">Contacto</a></nav>',
    schemaType: "WebPage",
  },
  {
    path: "/services",
    title: "Expert Services | KWVRS",
    description:
      "KWVRS provides vocational expert evaluations, life care planning, forensic economics, loss of household services analysis, matrimonial assessments, standard of care reviews, and expert witness testimony.",
    innerHtml:
      '<h1>Expert Services</h1><p>Kincaid Wolstein Vocational and Rehabilitation Services offers a full range of forensic vocational and rehabilitation consulting services for litigation support.</p><nav><a href="/services/vocational-expert">Vocational Expert</a> <a href="/services/life-care-planning">Life Care Planning</a> <a href="/services/forensic-economics">Forensic Economics</a> <a href="/contact">Contact</a></nav>',
    schemaType: "Service",
  },
  {
    path: "/locations",
    title: "Locations | KWVRS - Serving All 50 States",
    description:
      "KWVRS provides vocational expert services, life care planning, and forensic economics in all 50 states, Washington D.C., and U.S. territories.",
    innerHtml:
      '<h1>Locations - Serving All 50 States</h1><p>Kincaid Wolstein Vocational and Rehabilitation Services provides expert services nationwide. Select a state to learn more about our services in your area.</p><nav><a href="/services">Services</a> <a href="/contact">Contact</a> <a href="/about">About</a></nav>',
    schemaType: "WebPage",
  },
  {
    path: "/tools",
    title: "Attorney Tools | KWVRS",
    description:
      "Free planning tools for attorneys from KWVRS: run a preliminary economic loss estimate and get the full breakdown by email.",
    innerHtml:
      '<h1>Attorney Tools</h1><p>Planning-level tools for case evaluation from Kincaid Wolstein Vocational and Rehabilitation Services, serving plaintiff and defense counsel nationwide.</p><nav><a href="/tools/economic-damages-estimator">Economic damages estimator</a> <a href="/tools/household-services">Household services valuator</a> <a href="/tools/life-expectancy">Life expectancy calculator</a> <a href="/services">Services</a> <a href="/contact">Contact</a></nav>',
    schemaType: "WebPage",
  },
  {
    path: "/tools/economic-damages-estimator",
    title: "Economic Damages Estimator | KWVRS",
    description:
      "Free preliminary economic loss estimator for attorneys: past and future lost earnings, future medical and attendant care in present value, with a planning range.",
    innerHtml:
      '<h1>Economic Damages Estimator</h1><p>Enter case basics - income, ages, injury period, and future care costs - to see a preliminary, planning-level economic loss range with past and future lost earnings and future medical costs in present value. Request the full line-item breakdown by email.</p><nav><a href="/tools">All tools</a> <a href="/services/forensic-economics">Forensic economics services</a> <a href="/contact">Contact</a></nav>',
    schemaType: "WebPage",
  },
  {
    path: "/tools/household-services",
    title: "Household Services Valuator | KWVRS",
    description:
      "Estimate the annual replacement value of a person's unpaid household services from public ATUS time-use data and BLS OEWS wages, with Word, Excel, and CSV exhibits.",
    innerHtml:
      '<h1>Household Services Valuator</h1><p>Estimate the annual replacement value of a person\'s unpaid household work from public American Time Use Survey time-use data and BLS Occupational Employment and Wage Statistics wages. Download a Word exhibit, an Excel workbook, or a CSV.</p><nav><a href="/tools">All tools</a> <a href="/tools/household-services/methodology">Methodology</a> <a href="/services/loss-of-household-services">Loss of household services</a> <a href="/contact">Contact</a></nav>',
    schemaType: "WebPage",
  },
  {
    path: "/tools/household-services/methodology",
    title: "Household Services Valuator - Methodology | KWVRS",
    description:
      "How the KW Household Services Valuator estimates the replacement value of unpaid household work from public ATUS time-use data and BLS OEWS wages.",
    innerHtml:
      '<h1>Household Services Valuator - Methodology</h1><p>The replacement-cost method values unpaid household work using American Time Use Survey time-use data and BLS Occupational Employment and Wage Statistics wages.</p><nav><a href="/tools/household-services">Back to the valuator</a> <a href="/tools">All tools</a> <a href="/contact">Contact</a></nav>',
    schemaType: "WebPage",
  },
  {
    path: "/tools/life-expectancy",
    title: "Life Expectancy Calculator | KWVRS",
    description:
      "Look up remaining life expectancy by age, sex, and population group using the CDC United States Life Tables, 2023.",
    innerHtml:
      '<h1>Life Expectancy Calculator</h1><p>Estimate remaining life expectancy from the CDC/NCHS United States Life Tables, 2023, by age, sex, and population group. Results are period-life-table population averages, not a prediction for any individual.</p><nav><a href="/tools">All tools</a> <a href="/services/forensic-economics">Forensic economics</a> <a href="/services/life-care-planning">Life care planning</a> <a href="/contact">Contact</a></nav>',
    schemaType: "WebPage",
  },
  {
    path: "/resources/faq",
    title: "FAQ | KWVRS",
    description:
      "Frequently asked questions about vocational expert evaluations, life care planning, forensic economics, and expert witness testimony from KWVRS.",
    innerHtml:
      '<h1>Frequently Asked Questions</h1><p>Find answers to common questions about vocational rehabilitation evaluations, life care planning, forensic economics, and working with KWVRS.</p><nav><a href="/services">Services</a> <a href="/contact">Contact</a> <a href="/about">About</a></nav>',
    schemaType: "WebPage",
  },
];

for (const page of corePages) {
  writePage(page.path, buildPage(page));
  counts.core++;
}

// --- Phase 2 pages ---

const phase2Pages = [
  {
    path: "/knowledge",
    title: "Knowledge Center | KWVRS",
    description:
      "In-depth guides on vocational rehabilitation, life care planning, forensic economics, and expert witness testimony from Kincaid Wolstein Vocational and Rehabilitation Services.",
    innerHtml:
      '<h1>Knowledge Center</h1><p>Explore in-depth guides on vocational rehabilitation, life care planning, forensic economics, and expert witness testimony.</p><nav><a href="/services">Services</a> <a href="/insights">Insights</a> <a href="/contact">Contact</a></nav>',
    schemaType: "WebPage",
  },
  {
    path: "/insights",
    title: "Insights | KWVRS",
    description:
      "Articles and analysis on vocational rehabilitation, forensic economics, life care planning, and litigation from the KWVRS team.",
    innerHtml:
      '<h1>Insights</h1><p>Articles and analysis on vocational rehabilitation, forensic economics, life care planning, and litigation topics.</p><nav><a href="/knowledge">Knowledge Center</a> <a href="/services">Services</a> <a href="/contact">Contact</a></nav>',
    schemaType: "WebPage",
  },
  {
    path: "/case-studies",
    title: "Case Studies | KWVRS",
    description:
      "Case studies demonstrating how KWVRS vocational experts, life care planners, and forensic economists have supported litigation outcomes.",
    innerHtml:
      '<h1>Case Studies</h1><p>Examples of how Kincaid Wolstein Vocational and Rehabilitation Services has provided expert analysis in vocational, economic, and life care planning matters.</p><nav><a href="/services">Services</a> <a href="/contact">Contact</a></nav>',
    schemaType: "WebPage",
  },
  {
    path: "/schedule-consultation",
    title: "Schedule a Consultation | KWVRS",
    description:
      "Schedule a consultation with Kincaid Wolstein Vocational and Rehabilitation Services to discuss vocational evaluations, life care plans, or forensic economic analysis for your case.",
    innerHtml:
      '<h1>Schedule a Consultation</h1><p>Contact Kincaid Wolstein Vocational and Rehabilitation Services to discuss your case requirements and schedule an expert consultation.</p><nav><a href="/services">Services</a> <a href="/contact">Contact</a></nav>',
    schemaType: "WebPage",
  },
  {
    path: "/privacy",
    title: "Privacy Policy | KWVRS",
    description:
      "Privacy policy for the Kincaid Wolstein Vocational and Rehabilitation Services website.",
    innerHtml:
      '<h1>Privacy Policy</h1><p>This privacy policy describes how Kincaid Wolstein Vocational and Rehabilitation Services collects, uses, and protects information through our website.</p>',
    schemaType: "WebPage",
  },
  {
    path: "/terms",
    title: "Terms of Service | KWVRS",
    description:
      "Terms of service for the Kincaid Wolstein Vocational and Rehabilitation Services website.",
    innerHtml:
      '<h1>Terms of Service</h1><p>Terms governing the use of the Kincaid Wolstein Vocational and Rehabilitation Services website.</p>',
    schemaType: "WebPage",
  },
];

for (const page of phase2Pages) {
  writePage(page.path, buildPage(page));
  counts.core++;
}

/**
 * Render an inline "Reviewed by ..." byline for the static HTML.
 * Mirrors the React-side AuthorByline component.
 */
function renderBylineHtml(authorSlug, dateModified) {
  const member = authorSlug ? teamMap[authorSlug] : undefined;
  const displayName = member?.name ?? "KWVRS Editorial Team";
  // Filter credentials already in the name (e.g. team names often include
  // "Ph.D." or "M.D." inline) to avoid duplication like "Ph.D., Ph.D.".
  const filteredCreds = (member?.credentials ?? []).filter(
    (c) => !displayName.includes(c),
  );
  const credentials = filteredCreds.length
    ? `, ${filteredCreds.slice(0, 3).join(", ")}`
    : "";
  const linkTo = member ? `/team/${authorSlug}` : "/team";
  const dateChunk = dateModified
    ? ` &middot; Last updated <time datetime="${escapeHtml(dateModified)}">${escapeHtml(dateModified)}</time>`
    : "";
  return `<p class="byline">Reviewed by <a href="${linkTo}">${escapeHtml(displayName)}${escapeHtml(credentials)}</a>${dateChunk}</p>`;
}

// --- Knowledge guide pages ---

for (const guide of guideData) {
  const path = `/knowledge/${guide.slug}`;
  const author = guideAuthorMap[guide.slug] ?? {};
  const authorName = author.authorSlug ? teamMap[author.authorSlug]?.name : undefined;
  const dateMod = author.dateModified ?? "2026-05-03";
  writePage(
    path,
    buildPage({
      path,
      title: `${guide.name} | KWVRS`,
      description: `${guide.name} - an in-depth guide from Kincaid Wolstein Vocational and Rehabilitation Services covering key concepts, methodology, and practical considerations.`,
      innerHtml:
        `<h1>${escapeHtml(guide.name)}</h1>` +
        renderBylineHtml(author.authorSlug, dateMod) +
        `<p>An in-depth guide from Kincaid Wolstein Vocational and Rehabilitation Services.</p>` +
        `<nav><a href="/knowledge">Knowledge Center</a> <a href="/services">Services</a> <a href="/contact">Contact</a></nav>`,
      schemaType: "Article",
      authorSlug: author.authorSlug,
      authorName,
      datePublished: dateMod,
      dateModified: dateMod,
    }),
  );
  counts.knowledge++;
}

// --- Insight post pages ---

for (const post of postData) {
  const path = `/insights/${post.slug}`;
  const author = insightAuthorMap[post.slug] ?? {};
  const authorName = author.authorSlug ? teamMap[author.authorSlug]?.name : undefined;
  const dateMod = author.dateModified ?? author.publishedDate;
  writePage(
    path,
    buildPage({
      path,
      title: `${post.name} | KWVRS`,
      description: `${post.name} - analysis and insights from Kincaid Wolstein Vocational and Rehabilitation Services.`,
      innerHtml:
        `<h1>${escapeHtml(post.name)}</h1>` +
        renderBylineHtml(author.authorSlug, dateMod) +
        `<p>Analysis and insights from Kincaid Wolstein Vocational and Rehabilitation Services.</p>` +
        `<nav><a href="/insights">All Insights</a> <a href="/services">Services</a> <a href="/contact">Contact</a></nav>`,
      schemaType: "Article",
      authorSlug: author.authorSlug,
      authorName,
      datePublished: author.publishedDate,
      dateModified: dateMod,
    }),
  );
  counts.insights++;
}

// --- Guide pages (`/guides/:slug`) ---
// Static HTML so crawlers see real content (the SPA route hydrates the same
// content client-side). Required by sitemap.xml which lists all guide slugs.

for (const guide of guideSlugData) {
  const path = `/guides/${guide.slug}`;
  writePage(
    path,
    buildPage({
      path,
      title: `${guide.name} | KWVRS`,
      description: `${guide.name} - an in-depth guide from Kincaid Wolstein Vocational and Rehabilitation Services covering key concepts, methodology, and practical considerations.`,
      innerHtml:
        `<h1>${escapeHtml(guide.name)}</h1>` +
        `<p>An in-depth guide from Kincaid Wolstein Vocational and Rehabilitation Services.</p>` +
        `<nav><a href="/guides">All Guides</a> <a href="/services">Services</a> <a href="/contact">Contact</a></nav>`,
      schemaType: "Article",
    }),
  );
  counts.guides++;
}

// --- Comparison pages (`/compare/:slug`) ---

for (const cmp of comparisonData) {
  const path = `/compare/${cmp.slug}`;
  writePage(
    path,
    buildPage({
      path,
      title: `${cmp.name} | KWVRS`,
      description: `${cmp.name} - side-by-side comparison from Kincaid Wolstein Vocational and Rehabilitation Services. Scope, methodology, credentials, and when to retain.`,
      innerHtml:
        `<h1>${escapeHtml(cmp.name)}</h1>` +
        `<p>Side-by-side comparison from Kincaid Wolstein Vocational and Rehabilitation Services.</p>` +
        `<nav><a href="/compare">All Comparisons</a> <a href="/services">Services</a> <a href="/contact">Contact</a></nav>`,
      schemaType: "Article",
    }),
  );
  counts.comparisons++;
}

// --- Service pillar pages ---

for (const svc of serviceData) {
  const path = `/services/${svc.slug}`;
  writePage(
    path,
    buildPage({
      path,
      title: `${svc.name} - Nationwide Expert Witness | KWVRS`,
      description: `${svc.name} from Kincaid Wolstein Vocational and Rehabilitation Services. Independent, evidence-based analysis for plaintiff and defense attorneys nationwide.`,
      innerHtml: `<h1>${escapeHtml(svc.name)}</h1><p>Kincaid Wolstein Vocational and Rehabilitation Services provides ${escapeHtml(svc.name.toLowerCase())} for litigation support nationwide.</p><nav><a href="/services">All Services</a> <a href="/locations">Locations</a> <a href="/contact">Contact</a></nav>`,
      schemaType: "Service",
    })
  );
  counts.servicePillar++;
}

// --- State pages ---

for (const state of stateData) {
  const path = `/locations/${state.slug}`;
  const narrative = buildStateNarrative(state);
  const faqs = stateGeographicFaqs(state.name);
  const url = `${BASE_URL}${path}`;
  const innerHtml =
    `<h1>Vocational and Rehabilitation Experts in ${escapeHtml(state.name)}</h1>` +
    `<p>${escapeHtml(narrative.directAnswer)}</p>` +
    `<p>${escapeHtml(narrative.marketContext)}</p>` +
    `<p>${escapeHtml(narrative.legalContext)}</p>` +
    renderFaqHtml(faqs, `Frequently asked: ${state.name} expert services`) +
    `<nav><a href="/services">Services</a> <a href="/locations">All Locations</a> <a href="/contact">Contact</a></nav>`;
  writePage(
    path,
    buildPage({
      path,
      title: `Vocational & Rehabilitation Experts in ${state.name} | KWVRS`,
      description: narrative.directAnswer.slice(0, 160),
      innerHtml,
      schemaType: "Service",
      extraJsonLd: buildFaqJsonLd(faqs, url),
    }),
  );
  counts.state++;
}

// --- City pages ---

for (const state of stateData) {
  const cities = cityDataByState[state.slug];
  if (!cities) continue;
  for (const city of cities) {
    const path = `/locations/${state.slug}/${city.slug}`;
    const narrative = buildCityNarrative(state, city);
    const faqs = cityGeographicFaqs(state.name, city.name);
    const url = `${BASE_URL}${path}`;
    const innerHtml =
      `<h1>Vocational and Rehabilitation Experts in ${escapeHtml(city.name)}, ${escapeHtml(state.name)}</h1>` +
      `<p>${escapeHtml(narrative.directAnswer)}</p>` +
      `<p>${escapeHtml(narrative.blurb)}</p>` +
      renderFaqHtml(faqs, `Frequently asked: ${city.name} expert services`) +
      `<nav><a href="/locations/${state.slug}">Back to ${escapeHtml(state.name)}</a> <a href="/services">Services</a> <a href="/contact">Contact</a></nav>`;
    writePage(
      path,
      buildPage({
        path,
        title: `Vocational & Rehabilitation Experts in ${city.name}, ${state.name} | KWVRS`,
        description: narrative.directAnswer.slice(0, 160),
        innerHtml,
        schemaType: "Service",
        extraJsonLd: buildFaqJsonLd(faqs, url),
      }),
    );
    counts.city++;
  }
}

// --- Service x State pages ---

// Top cities per state to emit a Service x State x City page for (matches the
// city links surfaced on the React Service x State page).
const SERVICE_CITY_TOP = 10;
let serviceStateCityPages = 0;
for (const svc of serviceData) {
  // expert-disclosure has its own pillar + per-state generation below; skip the
  // generic Service x State cross-product so the rendered state pages keep the
  // disclosure-specific content (rule citation, summary).
  if (svc.slug === "expert-disclosure") continue;
  for (const state of stateData) {
    const path = `/services/${svc.slug}/${state.slug}`;
    const narrative = buildStateNarrative(state);
    const faqs = serviceStateGeographicFaqs(svc.name, state.name);
    const url = `${BASE_URL}${path}`;
    const directAnswer = `KWVRS provides ${svc.name.toLowerCase()} for matters venued in ${state.name}. ${narrative.marketContext} Plaintiff and defense.`;
    const innerHtml =
      `<h1>${escapeHtml(svc.name)} in ${escapeHtml(state.name)}</h1>` +
      `<p>${escapeHtml(directAnswer)}</p>` +
      `<p>${escapeHtml(narrative.legalContext)}</p>` +
      renderFaqHtml(faqs, `Frequently asked: ${svc.name} in ${state.name}`) +
      `<nav><a href="/services/${svc.slug}">About ${escapeHtml(svc.name)}</a> <a href="/locations/${state.slug}">${escapeHtml(state.name)}</a> <a href="/contact">Contact</a></nav>`;
    writePage(
      path,
      buildPage({
        path,
        title: `${svc.name} in ${state.name} | KWVRS`,
        description: directAnswer.slice(0, 160),
        innerHtml,
        schemaType: "Service",
        extraJsonLd: buildFaqJsonLd(faqs, url),
      }),
    );
    counts.serviceState++;

    // Service x State x City - mirrors the React ServiceStateCity page so the
    // top-metro service pages are statically captured for SEO.
    const cities = (cityDataByState[state.slug] || []).slice(0, SERVICE_CITY_TOP);
    for (const city of cities) {
      const cityPath = `/services/${svc.slug}/${state.slug}/${city.slug}`;
      const cityUrl = `${BASE_URL}${cityPath}`;
      const cityNarrative = buildCityNarrative(state, city);
      const cityFaqs = serviceCityGeographicFaqs(svc.name, state.name, city.name);
      const cityDirect = `${svc.name} from KWVRS for cases venued in ${city.name}, ${state.name}. ${cityNarrative.blurb}`;
      const cityInner =
        `<h1>${escapeHtml(svc.name)} in ${escapeHtml(city.name)}, ${escapeHtml(state.name)}</h1>` +
        `<p>${escapeHtml(cityDirect)}</p>` +
        `<p>${escapeHtml(cityNarrative.directAnswer)}</p>` +
        renderFaqHtml(cityFaqs, `Frequently asked: ${svc.name} in ${city.name}`) +
        `<nav><a href="/services/${svc.slug}/${state.slug}">${escapeHtml(svc.name)} in ${escapeHtml(state.name)}</a> <a href="/locations/${state.slug}/${city.slug}">${escapeHtml(city.name)}</a> <a href="/contact">Contact</a></nav>`;
      writePage(
        cityPath,
        buildPage({
          path: cityPath,
          title: `${svc.name} in ${city.name}, ${state.name} | KWVRS`,
          description: cityDirect.slice(0, 160),
          innerHtml: cityInner,
          schemaType: "Service",
          extraJsonLd: buildFaqJsonLd(cityFaqs, cityUrl),
        }),
      );
      serviceStateCityPages++;
    }
  }
}

// ---------------------------------------------------------------------------
// 4b. New landing page types
// ---------------------------------------------------------------------------

const caseTypeData = extractPairs(readFileSync(join(SRC_DATA, "caseTypes.ts"), "utf-8"), /slug:\s*"([^"]+)"/g, /\bname:\s*"([^"]+)"/g);
const credentialsContent = readFileSync(join(SRC_DATA, "credentials.ts"), "utf-8");
const credentialData = extractPairs(credentialsContent, /slug:\s*"([^"]+)"/g, /\bname:\s*"([^"]+)"/g);
// The credential templates (CredentialHub / CredentialState) title + H1 on the
// ABBREVIATION, not the full name. Extract it so the prerendered title/H1 match
// the hydrated React render (no indexed primary-signal drift across ~672 pages).
const credAbbrBySlug = Object.fromEntries(
  extractPairs(credentialsContent, /slug:\s*"([^"]+)"/g, /abbreviation:\s*"([^"]+)"/g).map((x) => [x.slug, x.name]),
);
const methodData = extractPairs(readFileSync(join(SRC_DATA, "methods.ts"), "utf-8"), /slug:\s*"([^"]+)"/g, /\bname:\s*"([^"]+)"/g);
const teamData = extractPairs(readFileSync(join(SRC_DATA, "team.ts"), "utf-8"), /slug:\s*"([^"]+)"/g, /\bname:\s*"([^"]+)"/g);
// Slugs flagged memoriam in team.ts (same block-splitting as teamMap above):
// their prerendered head must read as a tribute, not a hireable-expert profile.
const memoriamSlugs = new Set(
  readFileSync(join(SRC_DATA, "team.ts"), "utf-8")
    .split(/(?=\n\s*\{\s*\n\s*slug:\s*")/)
    .filter((block) => /memoriam:\s*true/.test(block))
    .map((block) => block.match(/slug:\s*"([^"]+)"/)?.[1])
    .filter(Boolean),
);

const newHubPages = [
  { path: "/case-types", title: "Case Types | KWVRS", description: "Case types KWVRS experts support across litigation.", innerHtml: "<h1>Case Types</h1>", schemaType: "WebPage" },
  { path: "/credentials", title: "Credentials | KWVRS", description: "Professional credentials held by KWVRS experts.", innerHtml: "<h1>Credentials</h1>", schemaType: "WebPage" },
  { path: "/guides", title: "Guides | KWVRS", description: "In-depth guides on vocational, economic, and life care planning topics.", innerHtml: "<h1>Guides</h1>", schemaType: "WebPage" },
  { path: "/compare", title: "Comparisons | KWVRS", description: "Side-by-side comparisons of expert disciplines, credentials, and methods.", innerHtml: "<h1>Comparisons</h1>", schemaType: "WebPage" },
  { path: "/methods", title: "Methods | KWVRS", description: "Methodologies KWVRS experts use in forensic analysis.", innerHtml: "<h1>Methods</h1>", schemaType: "WebPage" },
  { path: "/jurisdictions", title: "Jurisdictions | KWVRS", description: "State and federal jurisdictions where KWVRS experts practice.", innerHtml: "<h1>Jurisdictions</h1>", schemaType: "WebPage" },
  { path: "/attorneys", title: "Attorneys | KWVRS", description: "Stage-by-stage guidance for attorneys retaining expert witnesses.", innerHtml: "<h1>Attorneys</h1>", schemaType: "WebPage" },
];
for (const p of newHubPages) { writePage(p.path, buildPage(p)); counts.core++; }

// Case type hubs + case type × state
let caseTypeStatePages = 0;
for (const c of caseTypeData) {
  writePage(`/case-types/${c.slug}`, buildPage({
    path: `/case-types/${c.slug}`,
    // Match CaseTypeHub.tsx (title + H1).
    title: `${c.name} Expert Witness Services | KWVRS`,
    description: `Vocational, life care planning, and forensic economic services for ${c.name.toLowerCase()} cases.`,
    innerHtml: `<h1>${escapeHtml(c.name)}</h1>`,
    schemaType: "Service",
  }));
  counts.core++;
  for (const s of stateData) {
    writePage(`/case-types/${c.slug}/${s.slug}`, buildPage({
      path: `/case-types/${c.slug}/${s.slug}`,
      // Match CaseTypeState.tsx (title + H1) so the prerendered + hydrated signals agree.
      title: `${c.name} Expert Witness Services in ${s.name} | KWVRS`,
      description: `Vocational, economic, and life-care expert services for ${c.name.toLowerCase()} cases venued in ${s.name}. Plaintiff and defense.`,
      innerHtml: `<h1>${escapeHtml(c.name)} Expert Services in ${escapeHtml(s.name)}</h1>`,
      schemaType: "LocalBusiness",
    }));
    caseTypeStatePages++;
  }
}

// Credential hubs + credential × state
let credentialStatePages = 0;
for (const c of credentialData) {
  const abbr = credAbbrBySlug[c.slug] || c.name;
  writePage(`/credentials/${c.slug}`, buildPage({
    path: `/credentials/${c.slug}`,
    // Match CredentialHub.tsx (title `${abbr} Credential | ${name} | KWVRS`, H1 `${name} (${abbr})`).
    title: `${abbr} Credential | ${c.name} | KWVRS`,
    description: `${c.name} - scope, requirements, and KWVRS experts holding this credential.`,
    innerHtml: `<h1>${escapeHtml(c.name)} (${escapeHtml(abbr)})</h1>`,
    schemaType: "Article",
  }));
  counts.core++;
  for (const s of stateData) {
    writePage(`/credentials/${c.slug}/${s.slug}`, buildPage({
      path: `/credentials/${c.slug}/${s.slug}`,
      // Match CredentialState.tsx (abbreviation-based title + H1).
      title: `${abbr} Experts in ${s.name} | KWVRS`,
      description: `${c.name} (${abbr}) credential scope, recognition, and experts available for ${s.name} matters. Vocational expert services for plaintiff and defense.`,
      innerHtml: `<h1>${escapeHtml(abbr)} in ${escapeHtml(s.name)}</h1>`,
      schemaType: "LocalBusiness",
    }));
    credentialStatePages++;
  }
}

// Methods
for (const m of methodData) {
  writePage(`/methods/${m.slug}`, buildPage({
    path: `/methods/${m.slug}`,
    title: `${m.name} | KWVRS`,
    description: `${m.name} methodology explained.`,
    innerHtml: `<h1>${escapeHtml(m.name)}</h1>`,
    schemaType: "Article",
  }));
  counts.core++;
}

// Team profiles
for (const t of teamData) {
  const memoriam = memoriamSlugs.has(t.slug);
  writePage(`/team/${t.slug}`, buildPage({
    path: `/team/${t.slug}`,
    title: memoriam ? `${t.name} | In Memoriam | KWVRS` : `${t.name} | KWVRS`,
    description: memoriam
      ? `${t.name} - remembered by the KWVRS team.`
      : `${t.name} - KWVRS expert profile.`,
    innerHtml: `<h1>${escapeHtml(t.name)}</h1>`,
    schemaType: "WebPage",
  }));
  counts.core++;
}

// Service transactional + service × case type
let serviceVariantPages = 0;
let serviceCaseTypePages = 0;
for (const s of serviceData) {
  // expert-disclosure pillar is a state-driven directory; cost/process/timeline
  // and per-case-type variants do not exist for it.
  if (s.slug === "expert-disclosure") continue;
  for (const variant of ["cost", "process", "timeline"]) {
    writePage(`/services/${s.slug}/${variant}`, buildPage({
      path: `/services/${s.slug}/${variant}`,
      title: `${s.name} ${variant.charAt(0).toUpperCase() + variant.slice(1)} | KWVRS`,
      description: `${s.name} ${variant} details.`,
      innerHtml: `<h1>${escapeHtml(s.name)} ${variant}</h1>`,
      schemaType: "Service",
    }));
    serviceVariantPages++;
  }
  for (const c of caseTypeData) {
    writePage(`/services/${s.slug}/case/${c.slug}`, buildPage({
      path: `/services/${s.slug}/case/${c.slug}`,
      title: `${s.name} for ${c.name} | KWVRS`,
      description: `${s.name} applied to ${c.name.toLowerCase()} cases.`,
      innerHtml: `<h1>${escapeHtml(s.name)} for ${escapeHtml(c.name)}</h1>`,
      schemaType: "Service",
    }));
    serviceCaseTypePages++;
  }
}

// Attorney journey stages × case types (plus a per-stage index page - the
// journey pages' breadcrumbs link to /attorneys/<stage>).
const STAGE_LABELS = {
  considering: "Considering an Expert",
  retaining: "Retaining an Expert",
  "preparing-deposition": "Preparing for Deposition",
  trial: "Trial Testimony",
};
let journeyPages = 0;
for (const stage of ["considering", "retaining", "preparing-deposition", "trial"]) {
  writePage(`/attorneys/${stage}`, buildPage({
    path: `/attorneys/${stage}`,
    title: `${STAGE_LABELS[stage]}: Attorney Guides by Case Type | KWVRS`,
    description: `${STAGE_LABELS[stage]} guides for attorneys, by case type: step-by-step actions, required documents, common pitfalls, and FAQs.`,
    innerHtml: `<h1>${escapeHtml(STAGE_LABELS[stage])}</h1>`,
    schemaType: "WebPage",
  }));
  journeyPages++;
  for (const c of caseTypeData) {
    writePage(`/attorneys/${stage}/${c.slug}`, buildPage({
      path: `/attorneys/${stage}/${c.slug}`,
      title: `${stage.replace("-", " ")} - ${c.name} | KWVRS`,
      description: `Attorney guidance for ${stage.replace("-", " ")} in ${c.name.toLowerCase()} cases.`,
      innerHtml: `<h1>${escapeHtml(c.name)}: ${stage}</h1>`,
      schemaType: "Article",
    }));
    journeyPages++;
  }
}

// ---------------------------------------------------------------------------
// 4c. Expert Disclosure pillar + per-state pages.
// Mirrors the React-rendered <ExpertDisclosurePillar> and <ExpertDisclosureState>
// pages so crawlers see the rule citations, plain summaries, and breadcrumbs
// before hydration. URL prefix is /services/expert-disclosure.
// ---------------------------------------------------------------------------

const EXPERT_DISCLOSURE_PILLAR = "/services/expert-disclosure";
let disclosurePillarPages = 0;
{
  const ruleListItems = disclosureRules
    .slice()
    .sort((a, b) => a.stateName.localeCompare(b.stateName))
    .map(
      (r) =>
        `<li><a href="${EXPERT_DISCLOSURE_PILLAR}/${r.stateSlug}">${escapeHtml(r.stateName)}</a></li>`,
    )
    .join("");
  const innerHtml =
    `<h1>Expert Disclosure</h1>` +
    `<p>Pre-trial expert disclosure services for attorneys nationwide. KWVRS prepares vocational, economic, and life care expert disclosures sized to the governing framework across ${disclosureRules.length} US jurisdictions. Attorneys are responsible for confirming the governing rule against primary sources for their specific case.</p>` +
    `<h2>Select your jurisdiction (${disclosureRules.length})</h2>` +
    `<ul>${ruleListItems}</ul>`;
  writePage(EXPERT_DISCLOSURE_PILLAR, buildPage({
    path: EXPERT_DISCLOSURE_PILLAR,
    title: "Expert Disclosure Services | All 50 States | KWVRS",
    description:
      "Pre-trial expert disclosure services for attorneys nationwide. State-by-state pages with practice notes for vocational, economic, and life care expert disclosures. Plaintiff and defense.",
    innerHtml,
    schemaType: "Service",
  }));
  disclosurePillarPages++;
}

let disclosureStatePages = 0;
for (const rule of disclosureRules) {
  const path = `${EXPERT_DISCLOSURE_PILLAR}/${rule.stateSlug}`;
  const summaryFragment = rule.plainSummary
    ? rule.plainSummary.slice(0, 140)
    : `Pre-trial expert disclosure services for attorneys in ${rule.stateName}.`;
  const description = `${rule.stateName} pre-trial expert disclosure services. ${summaryFragment}`;
  const innerHtml =
    `<h1>${escapeHtml(rule.stateName)} Pre-Trial Expert Disclosure</h1>` +
    `<p>${escapeHtml(rule.plainSummary || `Pre-trial expert disclosure services for ${rule.stateName}.`)}</p>`;
  writePage(path, buildPage({
    path,
    title: `${rule.stateName} Pre-Trial Expert Disclosure Services | KWVRS`,
    description,
    innerHtml,
    schemaType: "Service",
  }));
  disclosureStatePages++;
}

// PSA retainer intake forms. The unified case-type-driven form at
// /contact/intake replaced the separate Personal Injury + Matrimonial forms
// (spec 2026-07-16); those two legacy routes 301 to /contact/intake in
// server.js, so prerendering them only produced unreachable dist files. The
// unified form itself is deliberately NOT prerendered - it is a client-only
// noindex route (CLIENT_ONLY_ROUTES); prerendering it would drop the noindex.
const RETAINER_INTAKE_PAGES = [];
let retainerIntakePages = 0;
for (const r of RETAINER_INTAKE_PAGES) {
  writePage(
    r.path,
    buildPage({
      path: r.path,
      title: r.title,
      description: r.description,
      innerHtml: `<h1>${escapeHtml(r.h1)}</h1><p>${escapeHtml(r.blurb)}</p><nav><a href="/contact">Back to Contact</a> <a href="/services">All Services</a></nav>`,
      schemaType: "WebPage",
    }),
  );
  retainerIntakePages++;
}

// ---------------------------------------------------------------------------
// 4e. White papers hub + detail pages. Parsed from the data file so the static
// HTML carries the abstract, key takeaways, and outline for non-JS crawlers.
// (The full gated body is delivered client-side and is present in the rendered
// DOM for JS-capable crawlers.)
// ---------------------------------------------------------------------------
const wpContent = readFileSync(join(SRC_DATA, "whitePapers.ts"), "utf-8");
const wpParts = wpContent.split(/\n    slug: "/).slice(1);
let whitePaperPages = 0;
const wpList = [];
for (const part of wpParts) {
  const slug = part.slice(0, part.indexOf('"'));
  const pick = (re) => {
    const m = part.match(re);
    return m ? m[1] : "";
  };
  const title = pick(/title:\s*"([^"]+)"/);
  const subtitle = pick(/subtitle:\s*"([^"]+)"/);
  const summary = pick(/summary:\s*"([^"]+)"/);
  const discipline = pick(/discipline:\s*"([^"]+)"/);
  const reading = pick(/readingTime:\s*"([^"]+)"/);
  const headings = [...part.matchAll(/heading:\s*"([^"]+)"/g)].map((m) => m[1]);
  const takeBlock = (part.match(/keyTakeaways:\s*\[([\s\S]*?)\]/) || [, ""])[1];
  const takeaways = [...takeBlock.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  wpList.push({ slug, title, subtitle, discipline });

  const path = `/white-papers/${slug}`;
  const innerHtml =
    `<h1>${escapeHtml(title)}</h1>` +
    `<p><em>${escapeHtml(subtitle)}</em></p>` +
    `<p>${escapeHtml(discipline)} &middot; ${escapeHtml(reading)}</p>` +
    `<h2>Abstract</h2><p>${escapeHtml(summary)}</p>` +
    (takeaways.length
      ? `<h2>Key takeaways</h2><ul>${takeaways.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`
      : "") +
    (headings.length
      ? `<h2>What is inside</h2><ol>${headings.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}</ol>`
      : "") +
    `<nav><a href="/white-papers">All white papers</a> <a href="/contact">Request a consultation</a></nav>`;
  writePage(
    path,
    buildPage({
      path,
      title: `${title} | White Paper | KWVRS`,
      description: summary.slice(0, 160),
      innerHtml,
      schemaType: "Article",
    }),
  );
  whitePaperPages++;
}
writePage(
  "/white-papers",
  buildPage({
    path: "/white-papers",
    title: "White Papers | Forensic Methodology | KWVRS",
    description:
      "In-depth white papers on the methodology behind defensible vocational, economic, and life care expert opinions from KWVRS.",
    innerHtml:
      `<h1>White papers on defensible expert methodology</h1>` +
      `<p>Detailed, objective treatments of how KWVRS builds vocational, economic, and life care opinions that can be examined and tested.</p>` +
      `<ul>${wpList
        .map((w) => `<li><a href="/white-papers/${w.slug}">${escapeHtml(w.title)}</a> - ${escapeHtml(w.subtitle)}</li>`)
        .join("")}</ul>` +
      `<nav><a href="/services">Services</a> <a href="/knowledge">Knowledge Center</a> <a href="/contact">Contact</a></nav>`,
    schemaType: "WebPage",
  }),
);
const whitePaperHubPages = 1;

// ---------------------------------------------------------------------------
// 5. Report
// ---------------------------------------------------------------------------

const total =
  counts.core +
  counts.servicePillar +
  counts.knowledge +
  counts.insights +
  counts.guides +
  counts.comparisons +
  counts.state +
  counts.city +
  counts.serviceState +
  serviceStateCityPages +
  caseTypeStatePages +
  credentialStatePages +
  serviceVariantPages +
  serviceCaseTypePages +
  journeyPages +
  disclosurePillarPages +
  disclosureStatePages +
  retainerIntakePages +
  whitePaperPages +
  whitePaperHubPages;

console.log("Pre-rendering KWVRS pages...");
console.log(`  Core pages: ${counts.core}`);
console.log(`  Service pillar pages: ${counts.servicePillar}`);
console.log(`  Knowledge guides: ${counts.knowledge}`);
console.log(`  Insight posts: ${counts.insights}`);
console.log(`  Guide pages: ${counts.guides}`);
console.log(`  Comparison pages: ${counts.comparisons}`);
console.log(`  State pages: ${counts.state}`);
console.log(`  City pages: ${counts.city}`);
console.log(`  Service x State pages: ${counts.serviceState}`);
console.log(`  Service x State x City pages: ${serviceStateCityPages}`);
console.log(`  Case-type x State pages: ${caseTypeStatePages}`);
console.log(`  Credential x State pages: ${credentialStatePages}`);
console.log(`  Service variant pages: ${serviceVariantPages}`);
console.log(`  Service x Case-type pages: ${serviceCaseTypePages}`);
console.log(`  Attorney journey pages: ${journeyPages}`);
console.log(`  Expert Disclosure pillar pages: ${disclosurePillarPages}`);
console.log(`  Disclosure x State pages: ${disclosureStatePages}`);
console.log(`  PSA retainer intake pages: ${retainerIntakePages}`);
console.log(`  White paper pages: ${whitePaperPages + whitePaperHubPages}`);
console.log(`  Total: ${total} pages pre-rendered`);
