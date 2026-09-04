// Every page <title> the site publishes fits the 60-character SERP window,
// brand suffix included, and no two routes share one.
//
// Source-level walk (no build needed): every route scripts/prerender.mjs
// emits is rebuilt here from the same data modules and the same shared
// builders (src/lib/page-titles.mjs, credentialStateHeadings, profileTitle,
// journeyTitle, and the editorial metaTitle fallbacks), so a data string or a
// builder that would push a title past the window fails before dist/ exists.
// The fixed-route literals (home, hubs, legal pages) are read from
// prerender.mjs itself, the way scripts/prerender-meta.test.mjs pins them to
// the React pages. The build-output check over the written shells lives in
// scripts/prerender-meta.test.mjs.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { City } from "@/types";
import { caseTypes } from "@/data/caseTypes";
import { credentials, credentialStateHeadings } from "@/data/credentials";
import { states } from "@/data/states";
import { pillarServices } from "@/data/services";
import { team } from "@/data/team";
import { guides } from "@/data/guides";
import { comparisons } from "@/data/comparisons";
import { methods } from "@/data/methods";
import { knowledgeGuides } from "@/data/knowledge";
import { insightPosts } from "@/data/insights";
import { whitePapers } from "@/data/whitePapers";
import { profileTitle } from "@/data/team-meta.mjs";
import { placeName } from "@/data/geo-prose.mjs";
import { ATTORNEY_STAGES, journeyTitle, stageIndexTitle } from "@/lib/attorney-stages";
import { ORG_NAME, ORG_SHORT, SITE_URL } from "@/lib/brand";
import {
  TITLE_MAX,
  fitTitle,
  placeTitle,
  cityTitle,
  stateHubTitle,
  cityHubTitle,
  caseTypeStateTitle,
  serviceStateTitle,
  serviceCityTitle,
  pillarTitle,
  variantTitle,
  pairTitle,
  serviceTitleLabels,
  serviceTitleNames,
} from "./page-titles.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const prerenderSrc = readFileSync(join(ROOT, "scripts", "prerender.mjs"), "utf8");

// Every state's city file, keyed by state slug (the prerender loads the same
// files eagerly; the app code-splits them per state).
const cityModules = import.meta.glob<Record<string, City[]>>(
  ["../data/cities/*.ts", "!../data/cities/index.ts", "!../data/cities/*.test.ts"],
  { eager: true },
);
const citiesByState: Record<string, City[]> = Object.fromEntries(
  Object.entries(cityModules).map(([path, mod]) => [path.replace(/^.*\/([a-z-]+)\.ts$/, "$1"), Object.values(mod)[0] ?? []]),
);

const VARIANT_LABELS = { cost: "Cost", process: "Process", timeline: "Timeline" } as const;
const SUFFIX = ` | ${ORG_NAME}`;

/** Every route the prerender writes, with the title the same builders give it. */
function allTitles(): Map<string, string> {
  const titles = new Map<string, string>();
  const add = (route: string, title: string) => {
    if (titles.has(route)) throw new Error(`route enumerated twice: ${route}`);
    titles.set(route, title);
  };

  // Fixed routes: the prerender's own literals, resolved the way the shells
  // resolve them (brand tokens only; data-driven literals are rebuilt below).
  const TOKENS: Record<string, string> = { ORG_NAME, ORG_SHORT, SITE_URL, DOMAIN: new URL(SITE_URL).host };
  for (const m of prerenderSrc.matchAll(/path: (`[^`]*`|"[^"]*"),(?:\s*\/\/[^\n]*)*\s*title: (`[^`]*`|"[^"]*")/g)) {
    const path = m[1].slice(1, -1);
    const literal = m[2].slice(1, -1);
    if (/\$\{/.test(path)) continue; // templated families are rebuilt from data below
    const tokens = [...literal.matchAll(/\$\{([^}]*)\}/g)].map((t) => t[1]);
    if (!tokens.every((t) => t in TOKENS)) continue;
    add(path, literal.replace(/\$\{(\w+)\}/g, (_, k: string) => TOKENS[k]));
  }
  expect(titles.has("/"), "home page literal read from prerender.mjs").toBe(true);
  expect(titles.size, "fixed-route literals read from prerender.mjs").toBeGreaterThanOrEqual(20);

  const pillars = pillarServices();
  for (const s of pillars) {
    add(`/services/${s.slug}`, pillarTitle(s, ORG_NAME));
    for (const [variant, label] of Object.entries(VARIANT_LABELS)) {
      add(`/services/${s.slug}/${variant}`, variantTitle(s, label, ORG_NAME));
    }
    for (const c of caseTypes) add(`/services/${s.slug}/case/${c.slug}`, pairTitle(s, c, ORG_NAME));
    for (const st of states) {
      add(`/services/${s.slug}/${st.slug}`, serviceStateTitle(s, st, ORG_NAME));
      // The prerender emits the first SERVICE_CITY_TOP cities per state; the
      // app renders any city, so every city is checked.
      for (const city of citiesByState[st.slug] ?? []) {
        add(`/services/${s.slug}/${st.slug}/${city.slug}`, serviceCityTitle(s, city, st, ORG_NAME));
      }
    }
  }
  for (const st of states) {
    add(`/locations/${st.slug}`, stateHubTitle(st, ORG_NAME));
    for (const city of citiesByState[st.slug] ?? []) add(`/locations/${st.slug}/${city.slug}`, cityHubTitle(city, st, ORG_NAME));
    for (const c of caseTypes) add(`/case-types/${c.slug}/${st.slug}`, caseTypeStateTitle(c, st, ORG_NAME));
    for (const cred of credentials) add(`/credentials/${cred.slug}/${st.slug}`, credentialStateHeadings(cred, st.name).title);
  }
  for (const c of caseTypes) add(`/case-types/${c.slug}`, `${c.titleBase}${SUFFIX}`);
  for (const cred of credentials) add(`/credentials/${cred.slug}`, cred.metaTitle);
  for (const m of team) {
    add(`/team/${m.slug}`, profileTitle({ name: m.name, jobTitle: m.title, memoriam: m.memoriam, orgName: ORG_NAME }));
  }
  for (const stage of ATTORNEY_STAGES) {
    add(`/attorneys/${stage.slug}`, stageIndexTitle(stage.slug));
    for (const c of caseTypes) add(`/attorneys/${stage.slug}/${c.slug}`, journeyTitle(stage.slug, c));
  }
  // Editorial families: the metaTitle fallbacks the templates apply
  // (src/pages/editorial.render.test.tsx pins the expressions to the source).
  for (const g of guides) add(`/guides/${g.slug}`, `${g.metaTitle ?? g.title}${SUFFIX}`);
  for (const c of comparisons) add(`/compare/${c.slug}`, `${c.metaTitle ?? c.title}${SUFFIX}`);
  for (const m of methods) add(`/methods/${m.slug}`, `${m.name.endsWith("Methodology") ? m.name : `${m.name} Method`}${SUFFIX}`);
  for (const k of knowledgeGuides) add(`/knowledge/${k.slug}`, `${k.metaTitle ?? k.title}${SUFFIX}`);
  for (const p of insightPosts) add(`/insights/${p.slug}`, `${p.metaTitle ?? p.title}${SUFFIX}`);
  for (const w of whitePapers) add(`/white-papers/${w.slug}`, `${w.metaTitle ?? w.title} | White Paper${SUFFIX}`);
  return titles;
}

describe("every page title fits the 60-character SERP window", () => {
  const titles = allTitles();

  it("walks the whole route set (thousands of pages, city tiers included)", () => {
    expect(states.length).toBe(56);
    expect(Object.keys(citiesByState).length).toBe(states.length);
    expect(titles.size).toBeGreaterThan(8000);
  });

  it(`no title, brand suffix included, runs past ${TITLE_MAX} characters`, () => {
    const over = [...titles].filter(([, title]) => title.length > TITLE_MAX).map(([route, title]) => `${route}: "${title}" (${title.length})`);
    expect(over).toEqual([]);
  });

  it("every title names the brand, and never carries an ampersand, an em or en dash, or a section sign", () => {
    for (const [route, title] of titles) {
      // The brand suffix everywhere but the About page, which leads with it.
      expect(title.includes(ORG_NAME), `${route}: "${title}"`).toBe(true);
      if (route !== "/about") expect(title.endsWith(SUFFIX), `${route}: "${title}"`).toBe(true);
      // "&" escapes to "&amp;" in the shell and reads as five characters to a crawler that measures the raw tag.
      expect(title, route).not.toMatch(/&|[–—§]/);
    }
  });

  it("no two routes advertise the same title", () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const [route, title] of titles) {
      const first = seen.get(title);
      if (first) dupes.push(`"${title}": ${first} and ${route}`);
      else seen.set(title, route);
    }
    expect(dupes).toEqual([]);
  });
});

describe("the fallbacks shorten only what cannot fit", () => {
  it("fitTitle returns the first candidate that fits and the last when none does", () => {
    expect(fitTitle(ORG_NAME, "Short", "Shorter")).toBe(`Short | ${ORG_NAME}`);
    const long = "x".repeat(50);
    expect(fitTitle(ORG_NAME, long, "Fallback")).toBe(`Fallback | ${ORG_NAME}`);
    expect(fitTitle(ORG_NAME, long, `${long}y`)).toBe(`${long}y | ${ORG_NAME}`);
  });

  it("placeTitle keeps the full state name wherever it fits and abbreviates only where it cannot", () => {
    for (const st of states) {
      for (const base of ["Forensic Economists", ...caseTypes.map((c) => c.titleBase), ...pillarServices().flatMap(serviceTitleLabels)]) {
        const full = `${base} in ${placeName(st.name)} | ${ORG_NAME}`;
        const title = placeTitle(base, st, ORG_NAME);
        if (full.length <= TITLE_MAX) expect(title, `${base} / ${st.slug}`).toBe(full);
        else expect(title, `${base} / ${st.slug}`).toBe(`${base} in ${st.abbreviation} | ${ORG_NAME}`);
      }
    }
    // The District keeps its article wherever the full name fits.
    const dc = states.find((s) => s.slug === "district-of-columbia")!;
    expect(placeTitle("Lost Earnings", dc, ORG_NAME)).toBe(`Lost Earnings in the District of Columbia | ${ORG_NAME}`);
  });

  it("cityTitle keeps the state abbreviation wherever it fits", () => {
    for (const st of states) {
      for (const city of citiesByState[st.slug] ?? []) {
        const full = `Forensic Economists in ${city.name}, ${st.abbreviation} | ${ORG_NAME}`;
        const title = cityTitle("Forensic Economists", city, st, ORG_NAME);
        if (full.length <= TITLE_MAX) expect(title, `${st.slug}/${city.slug}`).toBe(full);
        else expect(title, `${st.slug}/${city.slug}`).toBe(`Forensic Economists in ${city.name} | ${ORG_NAME}`);
      }
    }
  });

  it("every full state name fits the state hub, service x state, and credential x state titles except the two 24-character places", () => {
    const abbreviated = new Set<string>();
    for (const st of states) {
      if (stateHubTitle(st, ORG_NAME).includes(` in ${st.abbreviation} |`)) abbreviated.add(st.slug);
    }
    expect([...abbreviated].sort()).toEqual(["district-of-columbia", "northern-mariana-islands"]);
  });

  it("placeTitle with several label forms never abbreviates the state while any label fits beside the full place name, and keeps the fuller label at each place form", () => {
    const nc = { name: "North Carolina", abbreviation: "NC" };
    const full = "x".repeat(30); // 30 + " in North Carolina" = 48 > 45
    const short = "y".repeat(20); // 20 + " in North Carolina" = 38
    expect(placeTitle([full, short], nc, ORG_NAME)).toBe(`${short} in North Carolina | ${ORG_NAME}`);
    // The full label wins wherever it fits itself.
    expect(placeTitle(["z".repeat(20), short], nc, ORG_NAME)).toBe(`${"z".repeat(20)} in North Carolina | ${ORG_NAME}`);
    // Neither label fits beside the full place: the full label with the abbreviation comes first.
    const wide = "w".repeat(28); // 28 + " in North Carolina" = 46 > 45; 28 + " in NC" = 34
    expect(placeTitle([full, wide], nc, ORG_NAME)).toBe(`${full} in NC | ${ORG_NAME}`);
    // A single label behaves as before.
    expect(placeTitle(full, nc, ORG_NAME)).toBe(`${full} in NC | ${ORG_NAME}`);
    expect(placeTitle(short, nc, ORG_NAME)).toBe(`${short} in North Carolina | ${ORG_NAME}`);
  });

  it("cityTitle with several label forms keeps the state abbreviation while any label fits beside it, so same-named cities never share a title", () => {
    const ca = { name: "California", abbreviation: "CA" };
    const bay = { name: "San Francisco Bay Area" }; // 22, the longest city name
    const full = "a".repeat(19); // 19 + " in " + 22 = 45; with ", CA" 49
    const short = "b".repeat(10); // 10 + " in " + 22 + ", CA" = 40
    expect(cityTitle([full, short], bay, ca, ORG_NAME)).toBe(`${short} in San Francisco Bay Area, CA | ${ORG_NAME}`);
    // No label fits beside the abbreviation: the fullest label that fits without it.
    const wide = "c".repeat(18); // 18 + " in " + 22 + ", CA" = 48; without ", CA" 44
    expect(cityTitle([full, wide], bay, ca, ORG_NAME)).toBe(`${full} in San Francisco Bay Area | ${ORG_NAME}`);
    expect(cityTitle(["d".repeat(21), wide], bay, ca, ORG_NAME)).toBe(`${wide} in San Francisco Bay Area | ${ORG_NAME}`);
    expect(cityTitle(full, bay, ca, ORG_NAME)).toBe(`${full} in San Francisco Bay Area | ${ORG_NAME}`);
    expect(cityTitle([full, short], { name: "Fresno" }, ca, ORG_NAME)).toBe(`${full} in Fresno, CA | ${ORG_NAME}`);
  });

  it("the service state, city, and pair titles keep the heading label wherever it fits and take the titleShortName only where neither form of it can", () => {
    const pillars = pillarServices();
    const divorce = pillars.find((s) => s.slug === "divorce-and-marital-financial-analysis")!;
    const lcp = pillars.find((s) => s.slug === "life-care-plan-cost-projection")!;
    const fraud = pillars.find((s) => s.slug === "fraud-and-asset-tracing")!;
    const by = (slug: string) => states.find((s) => s.slug === slug)!;
    const caseType = (slug: string) => caseTypes.find((c) => c.slug === slug)!;
    expect(serviceTitleLabels(divorce)).toEqual(["Divorce Financial Analysis", "Divorce Analysis"]);
    expect(serviceTitleLabels(lcp)).toEqual(["Life Care Plan Costing", "Life Care Plan Cost"]);
    expect(serviceTitleLabels(fraud)).toEqual(["Fraud and Tracing"]);
    // State tier: the heading label on 53 of 56 places; the three long places
    // take the short label with the full place name, never the abbreviation.
    expect(serviceStateTitle(divorce, by("texas"), ORG_NAME)).toBe(`Divorce Financial Analysis in Texas | ${ORG_NAME}`);
    expect(serviceStateTitle(divorce, by("north-carolina"), ORG_NAME)).toBe(`Divorce Financial Analysis in North Carolina | ${ORG_NAME}`);
    expect(serviceStateTitle(divorce, by("district-of-columbia"), ORG_NAME)).toBe(`Divorce Analysis in the District of Columbia | ${ORG_NAME}`);
    const shortened = states.filter((st) => !serviceStateTitle(divorce, st, ORG_NAME).startsWith("Divorce Financial Analysis in ")).map((st) => st.slug);
    expect(shortened.sort()).toEqual(["district-of-columbia", "northern-mariana-islands", "us-virgin-islands"]);
    // Where no label fits beside the full place, the heading label takes the abbreviation.
    expect(serviceStateTitle(lcp, by("district-of-columbia"), ORG_NAME)).toBe(`Life Care Plan Costing in DC | ${ORG_NAME}`);
    expect(serviceStateTitle(lcp, by("texas"), ORG_NAME)).toBe(`Life Care Plan Costing in Texas | ${ORG_NAME}`);
    // City tier: the heading label with the city and its abbreviation, then
    // the short label beside both, and the abbreviation dropped only where
    // no label fits beside it.
    const ca = by("california");
    expect(serviceCityTitle(divorce, { name: "Los Angeles" }, ca, ORG_NAME)).toBe(`Divorce Financial Analysis in Los Angeles, CA | ${ORG_NAME}`);
    expect(serviceCityTitle(divorce, { name: "San Francisco" }, ca, ORG_NAME)).toBe(`Divorce Analysis in San Francisco, CA | ${ORG_NAME}`);
    expect(serviceCityTitle(divorce, { name: "San Francisco Bay Area" }, ca, ORG_NAME)).toBe(`Divorce Analysis in San Francisco Bay Area | ${ORG_NAME}`);
    // A pillar with one label drops the abbreviation only where the label cannot fit beside it.
    expect(serviceCityTitle(fraud, { name: "San Francisco" }, ca, ORG_NAME)).toBe(`Fraud and Tracing in San Francisco, CA | ${ORG_NAME}`);
    expect(serviceCityTitle(fraud, { name: "San Francisco Bay Area" }, ca, ORG_NAME)).toBe(`Fraud and Tracing in San Francisco Bay Area | ${ORG_NAME}`);
    expect(cityHubTitle({ name: "San Francisco Bay Area" }, ca, ORG_NAME)).toBe(`Forensic Economists in San Francisco Bay Area | ${ORG_NAME}`);
    // Pair tier: "Expert" on the heading label, the heading label alone, then the short forms.
    expect(pairTitle(divorce, caseType("divorce-and-marital-dissolution"), ORG_NAME)).toBe(`Divorce Financial Analysis Expert for Divorce | ${ORG_NAME}`);
    expect(pairTitle(divorce, caseType("wrongful-death"), ORG_NAME)).toBe(`Divorce Financial Analysis for Wrongful Death | ${ORG_NAME}`);
    expect(pairTitle(divorce, caseType("partnership-and-shareholder-dispute"), ORG_NAME)).toBe(`Divorce Analysis for Shareholder Dispute | ${ORG_NAME}`);
    expect(pairTitle(fraud, caseType("fraud-and-embezzlement"), ORG_NAME)).toBe(`Fraud and Tracing Expert for Fraud | ${ORG_NAME}`);
    // Pillar hub and variant tags: the full service name first, the titleName only where the full name cannot fit.
    expect(pillarTitle(divorce, ORG_NAME)).toBe(`Divorce and Marital Financial Analysis Expert | ${ORG_NAME}`);
    expect(pillarTitle(fraud, ORG_NAME)).toBe(`Fraud Investigation and Asset Tracing Expert | ${ORG_NAME}`);
    expect(pillarTitle(lcp, ORG_NAME)).toBe(`Life Care Plan Cost Projection Expert | ${ORG_NAME}`);
    expect(variantTitle(divorce, "Cost", ORG_NAME)).toBe(`Divorce and Marital Financial Analysis Cost | ${ORG_NAME}`);
    expect(variantTitle(fraud, "Process", ORG_NAME)).toBe(`Fraud Investigation and Asset Tracing Process | ${ORG_NAME}`);
    expect(variantTitle(divorce, "Timeline", ORG_NAME)).toBe(`Divorce Financial Analysis Timeline | ${ORG_NAME}`);
  });

  it("the service labels, case-type stems, and short names are budgeted so every title fits inside the ladders", () => {
    for (const s of pillarServices()) {
      const labels = serviceTitleLabels(s);
      // The heading label first (any ampersand spelled out), then the
      // titleShortName only where the data sets one.
      expect(labels[0], s.slug).toBe(s.shortName.replace(/\s*&\s*/g, " and "));
      expect(labels.length, s.slug).toBe(s.titleShortName ? 2 : 1);
      for (const label of labels) expect(label, s.slug).not.toContain("&");
      // The shortest label + " in " + the longest city name (22) fills the 45-character body.
      expect(labels[labels.length - 1].length, s.slug).toBeLessThanOrEqual(19);
      // A titleShortName is shorter than the heading label and keeps its leading keyword.
      if (s.titleShortName) {
        expect(s.titleShortName.length, s.slug).toBeLessThan(labels[0].length);
        expect(s.titleShortName.startsWith(labels[0].split(" ")[0]), s.slug).toBe(true);
      }
      // The hub "Expert" title and the longest variant label ("Timeline").
      const names = serviceTitleNames(s);
      expect(names[0], s.slug).toBe(s.name);
      expect(names.length, s.slug).toBe(s.titleName ? 2 : 1);
      if (s.titleName) expect(s.titleName.length, s.slug).toBeLessThan(s.name.length);
      expect(`${names[names.length - 1]} Timeline`.length, s.slug).toBeLessThanOrEqual(TITLE_MAX - SUFFIX.length);
    }
    for (const c of caseTypes) {
      expect(c.shortName.length, c.slug).toBeLessThanOrEqual(20);
      expect(c.titleBase, c.slug).toBe(`${c.name} Economist`);
      // Every short stem fits beside the abbreviation of any place.
      expect(`${c.shortName} Economist in MP`.length, c.slug).toBeLessThanOrEqual(TITLE_MAX - SUFFIX.length);
    }
  });
});
