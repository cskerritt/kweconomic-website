# KW Economics Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn this repo (a byte-identical import of kwlcp-website @b1e643c) into kweconomics.com — a forensic economics / forensic accounting / business valuation marketing + lead-capture site with the same layout and architecture as kwvrs.com and kwlcp.com.

**Architecture:** Vite + React 19 SPA with head-only prerendered shells for ~8.5k routes (services × states × cities, case types, credentials, editorial), a sitemap index, and a dependency-free Node `http` server with a Resend lead mailer. All content lives in typed `src/data/*.ts` files (plus `src/data/geo-prose.mjs`, shared by React and the prerenderer); build scripts regex those files to enumerate URLs. Brand strings are centralized in `src/lib/brand.ts` / `scripts/lib/site.mjs` and enforced by guard tests. This plan swaps the data layer and page copy; components, server pipeline, build scripts, and Docker stay as they are.

**Tech Stack:** Node 22, Vite 8, React 19, TypeScript 6, Tailwind 4, react-router 7, Vitest 4, lucide-react, Docker (node:22-alpine), Railway, Cloudflare Turnstile, Resend.

**Spec:** `docs/superpowers/specs/2026-08-27-kweconomics-website-design.md`

## Global Constraints

- Use Node 22: `export PATH=~/.local/node/node-v22.22.0-darwin-arm64/bin:$PATH` before any `npm`/`npx` command (system Node 25 is broken).
- Repo: `/Users/chrisskerritt/Documents/New project/kweconomic-website`, branch `main`, origin `git@github.com:cskerritt/kweconomic-website.git`. Run `npm ci --no-audit --no-fund` once before Task 1.
- Reference-only sources (never copy code from them, never modify them): `~/Documents/New project/kwlcp-website` (structural twin), `~/Documents/New project/kwvrs-site` (`src/data/team.ts` roster copy for Chris and Zach; its economics-flavored `src/data/services.ts` entry `forensic-economics` and `guides.ts`/`methods.ts` economics entries may be used as copy starting points). The old `~/Documents/New project/KWEconomics` repo is NOT a source for anything.
- Brand: `ORG_NAME = "KW Economics"`, `ORG_SHORT = "KW Economics"`, `ORG_LEGAL = "Kincaid Wolstein Economics"`, `SITE_URL = "https://kweconomics.com"`, `ORG_EMAIL = "info@kwvrs.com"`. Sister sites: `VOC_SITE_URL = "https://kwvrs.com"`, `LCP_SITE_URL = "https://kwlcp.com"`. No file under `src/` other than `src/lib/brand.ts` and `src/components/CrossSell.tsx` may contain `KWVRS`, `kwvrs.com`, `kwlcp`, `KW LCP`, `Kincaid Wolstein Vocational`, or `Life Care Planning` (capitalized brand form).
- Vocabulary guard (spec §9): outside `CrossSell.tsx`, `brand.ts`, `src/data/team.ts`, and the `life-care-plan-cost-projection` entry in `services.ts`, no page/component/data copy may contain `vocational evaluation|vocational expert|transferable skills|labor market survey|life care planner|CLCP|CNLCP` (case-insensitive). "Life care plan" (the document) is allowed anywhere as a subject of costing.
- Services: exactly 13 entries; 11 `pillar: true` in this order: `lost-earnings-and-earning-capacity`, `wrongful-death-economic-loss`, `personal-injury-economic-damages`, `household-services-valuation`, `life-care-plan-cost-projection`, `employment-and-wage-loss-damages`, `business-valuation`, `lost-profits-and-commercial-damages`, `fraud-and-asset-tracing`, `divorce-and-marital-financial-analysis`, `expert-rebuttal-and-report-review`; then `vocational-evaluation` (`pillar: false`, `externalUrl: \`${VOC_SITE_URL}/services/vocational-evaluation\``) and `life-care-planning` (`pillar: false`, `externalUrl: \`${LCP_SITE_URL}/services/life-care-planning\``). Every entry has `cost`, `process` (≥4 steps), `timeline` (≥3 phases), `keywords` (≥3).
- Case types: exactly 14: `personal-injury`, `wrongful-death`, `medical-malpractice`, `motor-vehicle-accident`, `traumatic-brain-injury`, `spinal-cord-injury`, `workers-compensation`, `employment-discrimination`, `wrongful-termination`, `commercial-contract-dispute`, `partnership-and-shareholder-dispute`, `divorce-and-marital-dissolution`, `fraud-and-embezzlement`, `product-liability`.
- Credentials: exactly 4: `forensic-economist`, `nafe-member`, `aaefe-member`, `graduate-economics-degree`. Membership copy is never a claim that a named person is a member (facts-to-confirm).
- Team: exactly 2: `christopher-skerritt` (leadership, `expertTier: "senior"`), `zachary-sperling` (support, no tier).
- Copy rules: citation-free prose (no statute/rule cites, no `§`, no damage-cap numbers); sources only through `src/data/references.ts`; hyphens only, no em/en dashes; no invented statistics, case counts, or client names; economist's standpoint (what the loss claim consists of, which records drive it), not medical or vocational.
- Prerender/sitemap constants unchanged: `SERVICE_CITY_PRERENDER_TOP = 10`, `SERVICE_CITY_SITEMAP_TOP = 5`, services-child ceiling `3600`.
- Commit after every task. Push (`git push origin main`) only at the marked milestones (end of Tasks 2, 6, 9, 12) and only when `npx tsc -b && npx eslint . && npx vitest run` is green; Task 12 additionally requires the Docker smoke to pass.
- Before claiming any task done, run its test command and paste the output summary in the report.

---

### Task 1: Brand module, script mirror, theme, and brand assets

**Files:**
- Modify: `src/lib/brand.ts`, `src/lib/brand.test.ts`, `scripts/lib/site.mjs`, `src/lib/schema.ts` (drop `MedicalBusiness` additional type), `index.html` (title/description/og), `src/index.css` (`@theme` block), `public/manifest.json`, `public/images/logo.svg`, `public/images/logo.png`, `public/favicon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png`, `public/robots.txt` (sitemap line)

**Interfaces:**
- Produces: from `@/lib/brand`: `ORG_NAME`, `ORG_SHORT`, `ORG_LEGAL`, `SITE_URL`, `ORG_EMAIL`, `ORG_PHONE`, `ORG_PHONE_VA`, `OFFICES`, `VOC_SITE_URL`, `LCP_SITE_URL`, `SAME_AS`, `LEGACY_BRAND_PATTERN`, `KNOWS_ABOUT`; from `scripts/lib/site.mjs`: `ORG_NAME`, `ORG_SHORT`, `SITE_URL`, `ORG_PHONE`, `VOC_SITE_URL`, `LCP_SITE_URL`. `ECON_SITE_URL` is deleted (grep and replace every import with `LCP_SITE_URL`).

- [ ] **Step 1: Write the failing test**

Replace `src/lib/brand.test.ts` with:
```ts
import { describe, expect, it } from "vitest";
import { ORG_NAME, ORG_SHORT, ORG_LEGAL, SITE_URL, OFFICES, SAME_AS, KNOWS_ABOUT, LEGACY_BRAND_PATTERN, VOC_SITE_URL, LCP_SITE_URL } from "./brand";
import { ORG_URL, ORG_LOGO, organizationSchema } from "./schema";

describe("brand constants", () => {
  it("names the economics brand and domain", () => {
    expect(ORG_NAME).toBe("KW Economics");
    expect(ORG_SHORT).toBe("KW Economics");
    expect(ORG_LEGAL).toBe("Kincaid Wolstein Economics");
    expect(SITE_URL).toBe("https://kweconomics.com");
    expect(ORG_URL).toBe(SITE_URL);
    expect(ORG_LOGO).toBe("https://kweconomics.com/images/logo.png");
  });
  it("keeps both offices and links both sister practices", () => {
    expect(OFFICES.map((o) => o.addressRegion)).toEqual(["NJ", "VA"]);
    expect(VOC_SITE_URL).toBe("https://kwvrs.com");
    expect(LCP_SITE_URL).toBe("https://kwlcp.com");
    expect(SAME_AS).toEqual([VOC_SITE_URL, LCP_SITE_URL]);
  });
  it("legacy pattern catches every sister brand form", () => {
    for (const s of ["KWVRS", "KW LCP", "kwlcp.com", "Kincaid Wolstein Vocational", "KW Life Care Planning"]) expect(s).toMatch(LEGACY_BRAND_PATTERN);
    expect("KW Economics").not.toMatch(LEGACY_BRAND_PATTERN);
    expect("Kincaid Wolstein Economics").not.toMatch(LEGACY_BRAND_PATTERN);
  });
  it("feeds the organization schema without a medical type", () => {
    const org = organizationSchema() as Record<string, unknown>;
    expect(org.name).toBe(ORG_NAME);
    expect(org.knowsAbout).toEqual(KNOWS_ABOUT);
    expect(org.sameAs).toEqual(SAME_AS);
    expect(JSON.stringify(org)).not.toContain("MedicalBusiness");
    expect(KNOWS_ABOUT).toContain("Forensic Economics");
    expect(KNOWS_ABOUT).toContain("Business Valuation");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/brand.test.ts` — Expected: FAIL (`LCP_SITE_URL` undefined, names mismatch).

- [ ] **Step 3: Rewrite `src/lib/brand.ts`**

Keep `formatPhone`, `telHref`, `OFFICES` (only `name` changes via `ORG_NAME`) and replace the constants:
```ts
export const ORG_NAME = "KW Economics";
export const ORG_SHORT = "KW Economics";
export const ORG_LEGAL = "Kincaid Wolstein Economics";
export const SITE_URL = "https://kweconomics.com";
export const ORG_EMAIL = "info@kwvrs.com"; // facts-to-confirm: kweconomics.com mailbox
export const ORG_PHONE = "+1-201-343-0700";
export const ORG_PHONE_VA = "+1-804-282-4199";
export const ORG_CITY = "Hackensack";
export const ORG_STATE = "NJ";
export const ORG_COUNTRY = "US";
export const ORG_LOGO = `${SITE_URL}/images/logo.png`;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/hero-office-meeting.jpg`;
// Sister practices. The ONLY places their domains are spelled.
export const VOC_SITE_URL = "https://kwvrs.com";
export const LCP_SITE_URL = "https://kwlcp.com";
export const SAME_AS = [VOC_SITE_URL, LCP_SITE_URL] as const;
/** Sister-brand forms that must not leak into this site's copy. */
export const LEGACY_BRAND_PATTERN = /KWVRS|kwvrs\.com|KW LCP|kwlcp|Kincaid Wolstein Vocational|Life Care Planning/;
export const KNOWS_ABOUT = [
  "Forensic Economics",
  "Economic Damages",
  "Lost Earnings Analysis",
  "Earning Capacity",
  "Wrongful Death Economic Loss",
  "Household Services Valuation",
  "Present Value Analysis",
  "Business Valuation",
  "Lost Profits",
  "Forensic Accounting",
  "Expert Witness Testimony",
] as const;
```
`scripts/lib/site.mjs`: same string literals for `ORG_NAME`, `ORG_SHORT`, `SITE_URL`, `ORG_PHONE`; export `VOC_SITE_URL`, `LCP_SITE_URL`; delete `ECON_SITE_URL`. `grep -rn ECON_SITE_URL src scripts` and switch each usage to `LCP_SITE_URL` (Footer family column, Tools — Tools is deleted in Task 2, so a temporary replacement is fine).

`src/lib/schema.ts`: in `organizationSchema()` remove `"MedicalBusiness"` from `@type`/`additionalType` so the org is `ProfessionalService` only.

- [ ] **Step 4: Theme and assets**

`src/index.css` `@theme` — navy + gold as the kwvrs.com look; keep `--color-teal*` tokens defined (components reference them) but point them at the gold so every accent renders gold:
```css
  --color-navy: #14223d;
  --color-navy-light: #2a3a5c;
  --color-navy-dark: #0c1729;
  --color-amber: #b8731f;
  --color-amber-light: #d4922e;
  --color-amber-dark: #8a5612;
  --color-teal: #b8731f;
  --color-teal-light: #d4922e;
  --color-teal-dark: #8a5612;
  --color-forest: #14223d;
```
Assets: `public/images/logo.svg` — text wordmark "KW" (navy, Source Serif 4 bold) + "Economics" (gold `#b8731f`, Inter) in the same 600×257 viewBox as the current file; export `logo.png` with `npx --yes sharp-cli -i public/images/logo.svg -o public/images/logo.png` (fallback `rsvg-convert`). `favicon.svg`: same KW mark with navy background and gold letters; regenerate `favicon.ico` (32px) and `apple-touch-icon.png` (180px) from it via sharp-cli. `public/manifest.json` `name`/`short_name` → "KW Economics"; `theme_color` `#14223d`. `index.html`: `<title>KW Economics | Forensic Economics and Economic Damages Experts</title>`, description "Forensic economists, forensic accountants, and business valuation experts for plaintiff and defense counsel nationwide.", og/twitter tags to match. `public/robots.txt` sitemap line → `https://kweconomics.com/sitemap.xml`.

- [ ] **Step 5: Run tests**

Run: `npx tsc -b && npx vitest run src/lib/brand.test.ts scripts/site-brand-parity.test.mjs` — Expected: PASS (other suites will fail until later tasks; that is expected).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(brand): KW Economics identity, navy+gold theme, sister-site constants, wordmark"
```

---

### Task 2: Remove the tools / life-expectancy feature

**Files:**
- Delete: `src/pages/Tools.tsx`, `src/pages/LifeExpectancy.tsx`, `src/tools-indexing.routes.test.mjs`, any `src/lib/life-expectancy*` / `lib/life-expectancy*` modules and their tests, `public/data/life-tables*` (if present), the life-expectancy API test in `test/`
- Modify: `src/App.tsx:10-11,122-123`, `server.js:206-215` (`/api/life-expectancy` entry in `API_ROUTES`), `scripts/generate-sitemap.mjs:107` (`CORE` list), `scripts/prerender.mjs:432-447` (two static entries), `src/components/layout/Header.tsx:33`, `src/components/layout/Footer.tsx:57`, `src/App.routes.test.mjs`, `test/api-routes-turnstile.test.mjs` (if it enumerates API routes), `src/data/methods.ts` (drop `life-expectancy-in-life-care-planning` if it links the tool — it is rewritten in Task 7 anyway)

**Interfaces:**
- Produces: no `/tools*` route, no `/api/life-expectancy`; `API_ROUTES` = `/api/contact`, `/api/consultation`, `/api/whitepaper`.

- [ ] **Step 1: Write the failing test**

Append to `src/App.routes.test.mjs`:
```js
it("has no tools routes", () => {
  const src = readFileSync("src/App.tsx", "utf8");
  expect(src).not.toMatch(/\/tools/);
  expect(src).not.toMatch(/LifeExpectancy/);
});
```
and to `test/server-contact.test.mjs`:
```js
it("does not expose a life-expectancy API", async () => {
  const res = await request("POST", "/api/life-expectancy", { age: 40 });
  expect(res.status).toBe(404);
});
```
(use the same `request` helper the file already uses for `/api/contact`).

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/App.routes.test.mjs test/server-contact.test.mjs` — Expected: FAIL on the two new cases.

- [ ] **Step 3: Delete the feature**

```bash
git rm -q src/pages/Tools.tsx src/pages/LifeExpectancy.tsx src/tools-indexing.routes.test.mjs
grep -rln "life-expectancy\|lifeExpectancy\|LifeExpectancy\|/tools" src lib test scripts server.js public/data 2>/dev/null
```
For every hit: remove the route/lazy import (`App.tsx`), the `API_ROUTES` entry (`server.js`), the two `CORE` strings (`generate-sitemap.mjs`), the two static prerender entries (`prerender.mjs`), the nav items (`Header.tsx`, `Footer.tsx` — Footer's family column keeps kwvrs.com/kwlcp.com links via `VOC_SITE_URL`/`LCP_SITE_URL`), and delete any `lib/life-expectancy*.mjs` + tests and `public/data/life-tables*`. In `src/brand-strings.test.mjs` remove `"src/pages/Tools.tsx"` from `ALLOW`.

- [ ] **Step 4: Run tests**

Run: `npx tsc -b && npx eslint . && npx vitest run src/App.routes.test.mjs test/ scripts/prerender-meta.test.mjs` — Expected: PASS.

- [ ] **Step 5: Commit and push (milestone)**

```bash
git add -A
git commit -m "chore: remove tools/life-expectancy feature (no calculators in v1)"
git push origin main
```

---

### Task 3: Services data — 13 entries, 11 pillars

**Files:**
- Modify: `src/data/services.ts` (full rewrite of the array; keep the exported helpers `services`, `pillarServices`, `getServiceBySlug`, `getAllServiceSlugs`), `src/data/services.test.ts`, `src/lib/icons.ts` (add any icon keys used), `src/lib/practice-areas.ts` (`SPECIALTY_TO_SERVICE` map)

**Interfaces:**
- Consumes: `VOC_SITE_URL`, `LCP_SITE_URL`, `LEGACY_BRAND_PATTERN` from `@/lib/brand`.
- Produces: `services: Service[]` (13), `pillarServices()` (11, file order), `getAllServiceSlugs()` (11 pillar slugs), `getServiceBySlug(slug)`. `Service.relevantCredentials` values are drawn from `["Forensic Economist","NAFE","AAEFE","MBA","M.Ed.","PhD"]`. `Service.caseTypes` values are the 14 case-type slugs from Global Constraints.

- [ ] **Step 1: Write the failing test**

Replace `src/data/services.test.ts` with:
```ts
import { describe, expect, it } from "vitest";
import { services, pillarServices, getServiceBySlug, getAllServiceSlugs } from "./services";
import { ICONS } from "@/lib/icons";
import { VOC_SITE_URL, LCP_SITE_URL, LEGACY_BRAND_PATTERN } from "@/lib/brand";

const PILLARS = ["lost-earnings-and-earning-capacity","wrongful-death-economic-loss","personal-injury-economic-damages","household-services-valuation","life-care-plan-cost-projection","employment-and-wage-loss-damages","business-valuation","lost-profits-and-commercial-damages","fraud-and-asset-tracing","divorce-and-marital-financial-analysis","expert-rebuttal-and-report-review"];
const CASE_TYPES = new Set(["personal-injury","wrongful-death","medical-malpractice","motor-vehicle-accident","traumatic-brain-injury","spinal-cord-injury","workers-compensation","employment-discrimination","wrongful-termination","commercial-contract-dispute","partnership-and-shareholder-dispute","divorce-and-marital-dissolution","fraud-and-embezzlement","product-liability"]);

describe("economics services taxonomy", () => {
  it("has 13 entries, 11 pillars in canonical order", () => {
    expect(services.length).toBe(13);
    expect(pillarServices().map((s) => s.slug)).toEqual(PILLARS);
    expect(getAllServiceSlugs()).toEqual(PILLARS);
  });
  it("vocational and life care planning are external cross-sells, not pillars", () => {
    const v = getServiceBySlug("vocational-evaluation");
    expect(v?.pillar).toBe(false);
    expect(v?.externalUrl).toBe(`${VOC_SITE_URL}/services/vocational-evaluation`);
    const l = getServiceBySlug("life-care-planning");
    expect(l?.pillar).toBe(false);
    expect(l?.externalUrl).toBe(`${LCP_SITE_URL}/services/life-care-planning`);
  });
  it("has no LCP pillars", () => {
    for (const s of ["pediatric-life-care-planning","medical-cost-projection","medicare-set-aside","life-care-plan-rebuttal","forensic-economics"]) expect(getServiceBySlug(s)).toBeUndefined();
  });
  it("every entry carries cost, process (>=4 steps), timeline (>=3 phases), keywords, known case types", () => {
    for (const s of services) {
      expect(s.cost?.drivers.length, s.slug).toBeGreaterThanOrEqual(4);
      expect(s.cost?.range.length, s.slug).toBeGreaterThan(80);
      expect(s.cost?.billingStructure.length, s.slug).toBeGreaterThan(80);
      expect(s.process?.length, s.slug).toBeGreaterThanOrEqual(4);
      expect(s.timeline?.length, s.slug).toBeGreaterThanOrEqual(3);
      expect(s.keywords.length, s.slug).toBeGreaterThanOrEqual(3);
      for (const c of s.caseTypes) expect(CASE_TYPES.has(c), `${s.slug} -> ${c}`).toBe(true);
    }
  });
  it("no service text names a sister brand or cites statutes/regulations", () => {
    const cite = /\b(C\.F\.R\.|CFR|U\.S\.C\.|USC|§|Fed\. R\.|Rule \d+)\b/;
    for (const s of services) {
      const text = [s.name, s.shortName, s.description, ...s.keywords, s.cost?.range ?? "", s.cost?.billingStructure ?? "", ...(s.cost?.drivers ?? []), ...(s.process ?? []).flatMap((p) => [p.step, p.description]), ...(s.timeline ?? []).flatMap((t) => [t.phase, t.duration])].join("\n");
      expect(text, s.slug).not.toMatch(LEGACY_BRAND_PATTERN);
      expect(text, s.slug).not.toMatch(cite);
      expect(text, s.slug).not.toMatch(/[–—]/);
    }
  });
  it("uses only the economics credential set and icons that resolve", () => {
    const creds = new Set(["Forensic Economist","NAFE","AAEFE","MBA","M.Ed.","PhD"]);
    for (const s of services) {
      for (const c of s.relevantCredentials) expect(creds.has(c), `${s.slug} -> ${c}`).toBe(true);
      expect(ICONS[s.icon], `${s.slug} -> ${s.icon} not in src/lib/icons.ts`).toBeDefined();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/services.test.ts` — Expected: FAIL (LCP slugs).

- [ ] **Step 3: Rewrite the services array**

Author all 13 entries to the `Service` shape. Copy guidance per pillar (each `description` 2-3 sentences, economist's standpoint):

| slug | shortName | icon | what the entry says |
|---|---|---|---|
| `lost-earnings-and-earning-capacity` | Lost Earnings | `TrendingUp` | past and future lost earnings and fringe benefits; earning-capacity framing when the injured person can work in a reduced capacity; inputs are earnings history, worklife expectancy, growth, discounting |
| `wrongful-death-economic-loss` | Wrongful Death | `Scale` | decedent's lost earnings and benefits net of personal consumption, lost household services, and support to survivors; survival vs wrongful-death frameworks vary by state (say "vary by state", no cites) |
| `personal-injury-economic-damages` | Personal Injury | `Activity` | integrated damages report: earnings loss, fringe benefits, household services, and present value of future medical costs supplied by treating providers or a life care plan |
| `household-services-valuation` | Household Services | `Home` | replacement-cost valuation of lost household production using national time-use data and local wage rates |
| `life-care-plan-cost-projection` | LCP Cost Projection | `Calculator` | reduces a life care plan's line items to present value with medical cost growth and discount assumptions; plan authorship stays with the life care planner (the one allowed "life care planner" mention) |
| `employment-and-wage-loss-damages` | Employment Damages | `Briefcase` | back pay, front pay, lost benefits, and mitigation analysis in discrimination, retaliation, wrongful termination, and wage-and-hour matters |
| `business-valuation` | Business Valuation | `Building2` | income, market, and asset approaches; standards of value; used in shareholder disputes, divorce, estate and buy-sell matters |
| `lost-profits-and-commercial-damages` | Lost Profits | `LineChart` | but-for projection, causation-linked revenue and cost analysis, mitigation, and period-of-loss reasoning for contract and business-tort matters |
| `fraud-and-asset-tracing` | Fraud & Tracing | `Search` | forensic accounting for embezzlement, misappropriation, and financial statement irregularities; transaction tracing and loss quantification |
| `divorce-and-marital-financial-analysis` | Divorce Financial | `Users` | income determination for support, valuation of business interests, lifestyle analysis, and tracing of separate vs marital funds |
| `expert-rebuttal-and-report-review` | Rebuttal | `FileSearch` | critique of opposing economic and valuation reports: assumptions, data sources, discount rates, worklife, mitigation |

`cost.range` describes typical engagement scope drivers in words (no dollar figures). `process` steps: Retention & conflict check → Records & data request → Analysis & modeling → Draft report & counsel review → Final report / testimony support. `timeline`: Intake (1 week) → Analysis (2-4 weeks) → Report (1-2 weeks) → Deposition/trial support (as scheduled). Non-pillar entries: `pillar: false`, `externalUrl` per Interfaces, short description, `keywords: []`, `caseTypes: []`, `relevantCredentials: []`, no cost/process/timeline. Add any missing icon keys to `src/lib/icons.ts` (import from `lucide-react`).

`src/lib/practice-areas.ts` `SPECIALTY_TO_SERVICE`:
```ts
const SPECIALTY_TO_SERVICE: Record<string, string> = {
  "Forensic Economics": "lost-earnings-and-earning-capacity",
  "Economic Damages": "personal-injury-economic-damages",
  "Earning Capacity Analysis": "lost-earnings-and-earning-capacity",
  "Wrongful Death Analysis": "wrongful-death-economic-loss",
  "Household Services": "household-services-valuation",
  "Present Value Analysis": "life-care-plan-cost-projection",
  "Employment Damages": "employment-and-wage-loss-damages",
  "Business Valuation": "business-valuation",
  "Lost Profits": "lost-profits-and-commercial-damages",
  "Forensic Accounting": "fraud-and-asset-tracing",
  "Divorce Financial Analysis": "divorce-and-marital-financial-analysis",
  "Expert Testimony": "expert-rebuttal-and-report-review",
  "Economic Analysis": "lost-earnings-and-earning-capacity",
  "Expert Liaison": "",
};
```
(empty string maps to nothing — keep the `if (slug)` guard.)

- [ ] **Step 4: Run tests**

Run: `npx tsc -b && npx vitest run src/data/services.test.ts src/data/services.pillar.test.ts` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(data): 11 forensic economics/accounting/valuation pillars + 2 sister cross-sells"
```

---

### Task 4: Case types — 14 economics matters

**Files:**
- Modify: `src/data/caseTypes.ts` (type + array rewrite), `src/data/caseTypes.test.ts`, `src/pages/templates/CaseTypeHub.tsx`, `src/pages/templates/CaseTypeState.tsx`, `scripts/prerender.mjs` (case-type shell text), any other consumer `grep -rn "careNeeds\|costExposure\|lifeCareImpact\|icdCodes" src scripts` reports

**Interfaces:**
- Produces: `CaseType` with renamed fields: `careNeeds` → `lossComponents` (what the economic claim is made of), `costExposure` → `damagesExposure` (which components usually dominate and why), `lifeCareImpact?` → `economicImpact` (required, ≥200 chars, how the economist builds the number); `icdCodes` removed. `CaseTypeCategory` = `"personal-injury" | "workers-comp" | "med-mal" | "wrongful-death" | "employment" | "commercial" | "family"`. `caseTypes: CaseType[]` (14), `getCaseType(slug)`.

- [ ] **Step 1: Write the failing test**

Replace `src/data/caseTypes.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { caseTypes, getCaseType } from "./caseTypes";
import { getAllServiceSlugs } from "./services";
import { LEGACY_BRAND_PATTERN } from "@/lib/brand";

const SLUGS = ["commercial-contract-dispute","divorce-and-marital-dissolution","employment-discrimination","fraud-and-embezzlement","medical-malpractice","motor-vehicle-accident","partnership-and-shareholder-dispute","personal-injury","product-liability","spinal-cord-injury","traumatic-brain-injury","workers-compensation","wrongful-death","wrongful-termination"];

describe("economics case types", () => {
  it("has the 14 case types", () => {
    expect(caseTypes.map((c) => c.slug).sort()).toEqual(SLUGS);
    expect(getCaseType("business-valuation")).toBeUndefined();
  });
  it("references only pillar services and carries economic-loss copy", () => {
    const pillars = new Set(getAllServiceSlugs());
    for (const c of caseTypes) {
      expect(c.relevantServices.length, c.slug).toBeGreaterThanOrEqual(2);
      for (const s of c.relevantServices) expect(pillars.has(s), `${c.slug} -> ${s}`).toBe(true);
      expect(c.lossComponents.length, c.slug).toBeGreaterThan(150);
      expect(c.damagesExposure.length, c.slug).toBeGreaterThan(150);
      expect(c.economicImpact.length, c.slug).toBeGreaterThan(200);
      expect(c.faqs.length, c.slug).toBeGreaterThanOrEqual(3);
      expect(c.sources.length, c.slug).toBeGreaterThanOrEqual(1);
      const text = `${c.summary} ${c.lossComponents} ${c.damagesExposure} ${c.economicImpact} ${c.faqs.map((f) => f.question + f.answer).join(" ")}`;
      expect(text, c.slug).not.toMatch(LEGACY_BRAND_PATTERN);
      expect(text, c.slug).not.toMatch(/life care planner|vocational expert|CLCP/i);
      expect(text, c.slug).not.toMatch(/[–—§]/);
    }
  });
  it("commercial and family matters point at valuation/accounting pillars", () => {
    expect(getCaseType("partnership-and-shareholder-dispute")!.relevantServices).toContain("business-valuation");
    expect(getCaseType("fraud-and-embezzlement")!.relevantServices).toContain("fraud-and-asset-tracing");
    expect(getCaseType("divorce-and-marital-dissolution")!.relevantServices).toContain("divorce-and-marital-financial-analysis");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/caseTypes.test.ts` — Expected: FAIL.

- [ ] **Step 3: Rewrite the type and the 14 entries; update consumers**

Type block:
```ts
export type CaseTypeCategory = "personal-injury" | "workers-comp" | "med-mal" | "wrongful-death" | "employment" | "commercial" | "family";

export interface CaseType {
  slug: string;
  name: string;
  category: CaseTypeCategory;
  summary: string;
  lossComponents: string;
  damagesExposure: string;
  economicImpact: string;
  relevantServices: string[];
  relevantCredentials: string[];
  faqs: Faq[];
  sources: Source[];
}
```
Category map: personal-injury → `personal-injury`, `motor-vehicle-accident`, `traumatic-brain-injury`, `spinal-cord-injury`, `product-liability`; `workers-comp` → `workers-compensation`; `med-mal` → `medical-malpractice`; `wrongful-death`; `employment` → `employment-discrimination`, `wrongful-termination`; `commercial` → `commercial-contract-dispute`, `partnership-and-shareholder-dispute`, `fraud-and-embezzlement`; `family` → `divorce-and-marital-dissolution`. `relevantCredentials` values from `["Forensic Economist","NAFE","AAEFE","MBA","PhD"]`. `sources` from the registry (`refsToSources([...])` if that helper exists in `references.ts`; otherwise inline `{ title, url, type }` for BLS/NAFE/AICPA anchors added in Task 7 — coordinate keys with Task 7's list).

Consumers: in `CaseTypeHub.tsx` / `CaseTypeState.tsx` / `prerender.mjs` rename the three field reads and their headings: "Care Needs" → "What the economic claim consists of", "Cost Exposure" → "Where the damages concentrate", "Life Care Impact" → "How the analysis is built"; delete any ICD-code rendering.

- [ ] **Step 4: Run tests**

Run: `npx tsc -b && npx vitest run src/data/caseTypes.test.ts scripts/prerender-meta.test.mjs` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(data): 14 economics case types with loss-component framing"
```

---

### Task 5: Credentials — one forensic-economist family

**Files:**
- Modify: `src/data/credentials.ts`, `src/data/credentials.test.ts`, `src/pages/hubs/CredentialsHubPage.tsx`, `src/pages/templates/CredentialState.tsx` (copy only), `scripts/prerender.mjs` (credential shell text)

**Interfaces:**
- Produces: `credentials: Credential[]` (4), `getCredential(slug)`. `expertSlugs` values ⊆ `["christopher-skerritt"]`. `stateReciprocity` for all 56 state slugs = `"na"` (these are not licenses; the template already renders "na" as "Not a state-licensed credential" — verify and adjust the label text in `CredentialState.tsx` to "Recognized nationally; no state licensure applies").

- [ ] **Step 1: Write the failing test**

Replace `src/data/credentials.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { credentials } from "./credentials";
import { states } from "./states";

describe("economics credentials", () => {
  it("has exactly the 4 forensic-economics credential pages", () => {
    expect(credentials.map((c) => c.slug).sort()).toEqual(["aaefe-member","forensic-economist","graduate-economics-degree","nafe-member"]);
  });
  it("each has scope, >=3 requirements, >=2 faqs, and full state coverage", () => {
    for (const c of credentials) {
      expect(c.scope.length, c.slug).toBeGreaterThan(100);
      expect(c.requirements.length, c.slug).toBeGreaterThanOrEqual(3);
      expect(c.faqs.length, c.slug).toBeGreaterThanOrEqual(2);
      for (const st of states) expect(c.stateReciprocity[st.slug], `${c.slug}/${st.slug}`).toBe("na");
      expect(c.expertSlugs.every((s) => s === "christopher-skerritt"), c.slug).toBe(true);
    }
  });
  it("membership pages never assert that a named person is a member", () => {
    for (const c of credentials.filter((c) => c.slug.endsWith("-member"))) {
      expect(`${c.scope} ${c.admissibilityHistory}`).not.toMatch(/Skerritt|Sperling/);
      expect(c.expertSlugs).toEqual([]);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/credentials.test.ts` — Expected: FAIL.

- [ ] **Step 3: Rewrite the four entries**

| slug | abbreviation | issuer / issuerUrl | scope |
|---|---|---|---|
| `forensic-economist` | Forensic Economist | — | what a forensic economist does in litigation; graduate training in economics or finance, applied damages methodology, published peer-reviewed standards, testimony experience; `expertSlugs: ["christopher-skerritt"]` |
| `nafe-member` | NAFE | National Association of Forensic Economics, `https://www.nafe.net/` | the association, its Journal of Forensic Economics, and its Statement of Ethical Principles and Principles of Professional Practice; what membership signals and what it does not; `expertSlugs: []` |
| `aaefe-member` | AAEFE | American Academy of Economic and Financial Experts, `https://www.aaefe.org/` | the academy and its Journal of Legal Economics; `expertSlugs: []` |
| `graduate-economics-degree` | MBA / M.A. / Ph.D. | — | graduate degrees in economics, finance, and business as the educational foundation for damages work; how courts weigh education vs experience; `expertSlugs: ["christopher-skerritt"]` |

Generate `stateReciprocity` with `Object.fromEntries(states.map((s) => [s.slug, "na"]))` (import `states`). `admissibilityHistory`: 2-3 sentences on how economic testimony is evaluated under reliability standards, citation-free. `requirements` ≥3 bullets; `faqs` ≥2; `sources` ≥1 registry anchor (NAFE ethics page, AAEFE site, BLS).

Hub copy (`CredentialsHubPage.tsx`, prerender shell): H1 "Credentials of a Forensic Economist"; intro explains that damages testimony rests on graduate training, professional standards, and testimony history rather than a state license.

- [ ] **Step 4: Run tests**

Run: `npx tsc -b && npx vitest run src/data/credentials.test.ts` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(data): forensic-economist credential family (4 pages x state)"
```

---

### Task 6: Team roster — Chris and Zach

**Files:**
- Modify: `src/data/team.ts`, `src/data/team.test.ts`, `src/data/team.tiers.test.ts`, `src/pages/Team.tsx` (section headings, memoriam block removed if roster has none), `src/pages/templates/ExpertProfile.tsx` (copy only), `public/team/` (keep `christopher-skerritt.jpg`, add `zachary-sperling.jpg` copied from `~/Documents/New project/kwvrs-site/public/team/zachary-sperling.jpg`; delete the other portraits)

**Interfaces:**
- Consumes: `practiceAreasFor` from `@/lib/practice-areas` (Task 3 map).
- Produces: `team` (2), `activeTeam` (2), `retainableExperts()` → `["christopher-skerritt"]`, `getMemoriam()` → `[]`, `EXPERT_TIER_LABELS` unchanged.

- [ ] **Step 1: Write the failing tests**

Replace `src/data/team.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { team, activeTeam, retainableExperts, getMemoriam } from "./team";
import { LEGACY_BRAND_PATTERN } from "@/lib/brand";
import { practiceAreasFor } from "@/lib/practice-areas";

describe("KW Economics team", () => {
  it("has the two-person roster", () => {
    expect(team.map((m) => m.slug)).toEqual(["christopher-skerritt", "zachary-sperling"]);
    expect(getMemoriam()).toEqual([]);
    expect(activeTeam.length).toBe(2);
  });
  it("Christopher Skerritt leads as Chief of Economic Services", () => {
    const c = team.find((m) => m.slug === "christopher-skerritt")!;
    expect(c.title).toBe("Chief of Economic Services");
    expect(c.role).toBe("leadership");
    expect(c.expertTier).toBe("senior");
    expect(c.credentials).toEqual(expect.arrayContaining(["M.Ed.", "MBA"]));
    expect(c.statesServed).toEqual(["NJ", "NY", "MA", "VA", "RI", "CT", "PA"]);
    expect(practiceAreasFor(c).map((s) => s.slug)).toContain("lost-earnings-and-earning-capacity");
  });
  it("Zachary Sperling is support and not retainable", () => {
    const z = team.find((m) => m.slug === "zachary-sperling")!;
    expect(z.title).toBe("Economics Associate / Expert Liaison");
    expect(z.role).toBe("support");
    expect(z.expertTier).toBeUndefined();
    expect(retainableExperts().map((m) => m.slug)).toEqual(["christopher-skerritt"]);
  });
  it("no bio mentions a sister brand or claims a membership", () => {
    for (const m of team) {
      expect(`${m.bio} ${m.fullBio ?? ""}`, m.slug).not.toMatch(LEGACY_BRAND_PATTERN);
      expect(`${m.bio} ${m.fullBio ?? ""}`, m.slug).not.toMatch(/member of (NAFE|AAEFE)/i);
    }
  });
});
```
Replace `src/data/team.tiers.test.ts` with the same rules trimmed to this roster: retainable order `["christopher-skerritt"]`; senior tier `["christopher-skerritt"]`; no support member has a tier; every retainable member has `imageUrl` matching `/^\/team\/.+\.jpg$/`, non-empty `specialties`/`bio`, a label in `EXPERT_TIER_LABELS`, ≥1 practice area; `retainableExperts()` does not mutate `activeTeam`; `EXPERT_TIER_LABELS` equals `{ senior: "Senior Expert", fellow: "Fellow Expert" }`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/data/team.test.ts src/data/team.tiers.test.ts` — Expected: FAIL.

- [ ] **Step 3: Rewrite `team.ts`**

Keep the helper functions. Array:
```ts
export const team: TeamMember[] = [
  {
    slug: "christopher-skerritt",
    name: "Christopher Skerritt, M.Ed., MBA",
    title: "Chief of Economic Services",
    credentials: ["M.Ed.", "MBA", "CRC", "CLCP", "MSCC"],
    role: "leadership",
    expertTier: "senior",
    bio: "Christopher Skerritt leads the economics practice, directing lost earnings, wrongful death, household services, employment, and commercial damages analyses for plaintiff and defense counsel. His graduate training in business and rehabilitation gives his damages work a grounded view of how injury, loss of employment, and disability translate into measurable economic loss.",
    fullBio: "<3-4 paragraphs: practice leadership; methodology (worklife, growth, discounting, mitigation); report and testimony approach; education. Facts only from the kwvrs-site entry; no case counts or membership claims.>",
    specialties: ["Forensic Economics", "Economic Damages", "Earning Capacity Analysis", "Wrongful Death Analysis", "Household Services", "Employment Damages", "Business Valuation", "Expert Testimony"],
    statesServed: ["NJ", "NY", "MA", "VA", "RI", "CT", "PA"],
    imageUrl: "/team/christopher-skerritt.jpg",
    education: [
      { degree: "Master of Business Administration - Healthcare Leadership", institution: "Bryant University", year: 2024 },
      { degree: "Master of Education in Rehabilitation Counseling", institution: "Springfield College", year: 2016 },
    ],
  },
  {
    slug: "zachary-sperling",
    name: "Zachary Sperling",
    title: "Economics Associate / Expert Liaison",
    credentials: [],
    role: "support",
    bio: "Zachary Sperling serves as Economics Associate and Expert Liaison, supporting forensic economic analyses and coordinating between the economics team and retaining counsel.",
    specialties: ["Forensic Economics", "Expert Liaison", "Economic Analysis"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/zachary-sperling.jpg",
  },
];
```
Replace the `<...>` placeholder text in `fullBio` with real prose before committing (the test requires non-empty bios; the vocabulary guard in Task 10 will reject "vocational evaluation" phrasing — describe rehabilitation counseling background as "rehabilitation counseling").

`Team.tsx`: headings "Leadership" and "Economics Team"; remove the In Memoriam section when `getMemoriam()` is empty (guard with `if (memoriam.length > 0)`).

- [ ] **Step 4: Run tests**

Run: `npx tsc -b && npx vitest run src/data/team.test.ts src/data/team.tiers.test.ts src/pages` — Expected: PASS for team; page render tests may still fail on copy until Task 10 — record which.

- [ ] **Step 5: Commit and push (milestone, only if `npx tsc -b && npx eslint .` is clean; otherwise commit only)**

```bash
git add -A
git commit -m "feat(team): two-person economics roster (Skerritt, Sperling)"
git push origin main
```

---

### Task 7: Editorial content — methods, guides, comparisons, knowledge, insights, white papers, FAQs, testimonials, references

**Files:**
- Modify: `src/data/references.ts`, `src/data/references.test.ts`, `src/data/methods.ts`, `src/data/guides.ts`, `src/data/comparisons.ts`, `src/data/knowledge.ts`, `src/data/insights.ts`, `src/data/whitePapers.ts`, `src/data/faqs.ts`, `src/data/home-faqs.mjs`, `src/data/testimonials.ts`, `src/data/editorial.test.ts`, `src/data/sources-urls.test.ts` (only if it pins URLs), `public/white-papers/*` (rename PDFs/HTML to the new white-paper slugs or generate placeholder HTML pages the same way kwlcp did — check `src/pages/WhitePaperPage.tsx` for what it expects)

**Interfaces:**
- Produces: `references.ts` registry keys used by Tasks 4, 8, 9: `nafe-ethics`, `nafe-jfe`, `aaefe-jle`, `bls-cps`, `bls-oes`, `bls-ecec`, `bls-atus`, `skoog-ciecka-krueger-worklife`, `treasury-yield`, `aicpa-ssvs1`, `nacva-standards`, `frcp-26`, `fre-702`, `daubert`, `frye`, `census-acs`; helper `refsToSources(keys: string[]): Source[]` (keep the existing helper name if it differs — check the file and reuse). Slug lists per spec §4.4 exported from each data file.

- [ ] **Step 1: Write the failing tests**

Replace the slug assertions in `src/data/editorial.test.ts` with:
```ts
import { describe, expect, it } from "vitest";
import { methods } from "./methods";
import { guides } from "./guides";
import { comparisons } from "./comparisons";
import { knowledge } from "./knowledge";
import { insights } from "./insights";
import { whitePapers } from "./whitePapers";
import { faqs } from "./faqs";
import { testimonials } from "./testimonials";
import { LEGACY_BRAND_PATTERN } from "@/lib/brand";

const slugs = (xs: { slug: string }[]) => xs.map((x) => x.slug).sort();
const VOCAB = /life care planner|vocational expert|vocational evaluation|transferable skills|labor market survey|CLCP|CNLCP/i;

describe("economics editorial data", () => {
  it("methods", () => expect(slugs(methods)).toEqual(["business-valuation-approaches","fringe-benefits-valuation","household-services-methodology","lost-profits-but-for-analysis","mitigation-and-offsets","present-value-and-discounting","wage-growth-and-earnings-projection","worklife-expectancy"]));
  it("guides", () => expect(slugs(guides)).toEqual(["business-valuation-in-litigation","collateral-source-rule-explained","expert-witness-disclosure-rules","federal-vs-state-court-daubert","household-services-in-personal-injury","how-lost-earnings-are-calculated","how-to-rebut-an-economic-damages-report","income-determination-in-divorce","lost-profits-vs-lost-business-value","present-value-explained-for-attorneys","what-is-a-forensic-economist","when-do-you-need-an-economic-expert","wrongful-death-damages-explained"]));
  it("comparisons", () => expect(slugs(comparisons)).toEqual(["economist-vs-life-care-planner","fair-market-value-vs-fair-value","forensic-economist-vs-forensic-accountant","forensic-economist-vs-vocational-expert","lost-earnings-vs-lost-earning-capacity","lost-profits-vs-business-valuation","net-vs-gross-discount-rate","plaintiff-economist-vs-defense-economist"]));
  it("knowledge, insights, white papers", () => {
    expect(slugs(knowledge)).toEqual(["expert-witness-testimony-guide","guide-to-economic-damages"]);
    expect(insights.length).toBeGreaterThanOrEqual(2);
    expect(slugs(whitePapers)).toEqual(["business-valuation-standards-in-litigation","daubert-ready-economic-damages-report"]);
  });
  it("faqs and testimonials are economics-framed", () => {
    expect(faqs.length).toBeGreaterThanOrEqual(8);
    expect(testimonials.length).toBeGreaterThanOrEqual(2);
    const text = JSON.stringify([methods, guides, comparisons, knowledge, insights, whitePapers, faqs, testimonials]);
    expect(text).not.toMatch(LEGACY_BRAND_PATTERN);
    expect(text).not.toMatch(/[–—§]/);
    const vocabHits = text.match(VOCAB) ?? [];
    // the two comparison pages that name the sister disciplines are the only allowed mentions
    expect(vocabHits.length).toBeLessThanOrEqual(12);
  });
  it("every editorial entry has at least one registry source", () => {
    for (const x of [...methods, ...guides, ...comparisons, ...knowledge, ...insights]) expect((x as { sources?: unknown[] }).sources?.length, x.slug).toBeGreaterThanOrEqual(1);
  });
});
```
Update `src/data/references.test.ts` so the "every key is referenced" and "tier present" assertions hold for the new key list above.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/data/editorial.test.ts src/data/references.test.ts` — Expected: FAIL.

- [ ] **Step 3: Rewrite the registry and editorial files**

`references.ts`: prune every LCP-only entry; add the keys in Interfaces with `tier: "anchor"` for institutional pages (NAFE `https://www.nafe.net/`, NAFE ethics statement page, JFE at `https://www.nafe.net/journal`, AAEFE `https://www.aaefe.org/`, BLS CPS `https://www.bls.gov/cps/`, OES `https://www.bls.gov/oes/`, ECEC `https://www.bls.gov/ecec/`, ATUS `https://www.bls.gov/tus/`, Treasury yield `https://home.treasury.gov/resource-center/data-chart-center/interest-rates`, AICPA SSVS `https://www.aicpa-cima.com/resources/download/statement-on-standards-for-valuation-services-vs-section-100`, NACVA standards `https://www.nacva.com/standards`, Census ACS `https://www.census.gov/programs-surveys/acs`, Cornell LII for FRCP 26 and FRE 702, Daubert 509 U.S. 579 (1993) and Frye 293 F. 1013 (D.C. Cir. 1923) as case-law anchors) and `tier: "live-verified"` for Skoog, Ciecka & Krueger, "The Markov Process Model of Labor Force Activity: Extended Tables of Central Tendency, Shape, Percentile Points, and Bootstrap Standard Errors," Journal of Forensic Economics 22(2), 2011, 165-229 (verify the DOI `10.5085/jfe.22.2.165` with a live fetch before adding; skip the DOI field if it cannot be confirmed). Every URL must respond 200 (`sources-urls.test.ts` checks format; do a `curl -sI` spot check).

`methods.ts` (8), `guides.ts` (13), `comparisons.ts` (8), `knowledge.ts` (2), `insights.ts` (2 re-slanted), `whitePapers.ts` (2), `faqs.ts` (≥8), `home-faqs.mjs`, `testimonials.ts` (≥2 generic, attorney-role attributed, no names invented — reuse only quotes that exist in kwvrs-site `testimonials.ts` and mention economics; otherwise write two clearly-labeled "representative feedback" entries with `attribution: "Retaining attorney, personal injury"`). Each entry keeps the existing TypeScript shape of its file (read the interface at the top of each file first); ≥400 words for guides/knowledge, ≥250 for methods/comparisons; sources via `refsToSources`. White-paper download assets: replace `public/white-papers/*` with HTML/PDF stubs named for the new slugs, generated the same way the existing ones were (check `git log -- public/white-papers` and `scripts/` for a generator; if none, create a printable HTML page per paper with the abstract and section outline).

- [ ] **Step 4: Run tests**

Run: `npx tsc -b && npx vitest run src/data` — Expected: PASS for editorial/references; journeys/narratives tests may still fail until Tasks 8-9.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(content): economics methods, guides, comparisons, knowledge, insights, white papers, FAQs, references"
```

---

### Task 8: Attorney journeys — 4 stages × 14 case types

**Files:**
- Modify: `src/data/journeys.ts` (rewrite array, keep type), `src/data/journeys.test.ts` (create if absent), `src/pages/templates/JourneyStageIndex.tsx` and `src/pages/hubs/AttorneysHubPage.tsx` (stage intros), `scripts/prerender.mjs` (journey shell text)

**Interfaces:**
- Consumes: `refsToSources` keys from Task 7; case-type slugs from Task 4.
- Produces: `journeys: JourneyStage[]` with 56 entries (4 stages × 14), `getJourney(stage, caseTypeSlug)` unchanged.

- [ ] **Step 1: Write the failing test**

`src/data/journeys.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { journeys } from "./journeys";
import { caseTypes } from "./caseTypes";
import { LEGACY_BRAND_PATTERN } from "@/lib/brand";

const STAGES = ["considering", "retaining", "preparing-deposition", "trial"] as const;

describe("attorney journeys", () => {
  it("covers every stage for every case type exactly once", () => {
    const keys = journeys.map((j) => `${j.stage}/${j.caseTypeSlug}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const c of caseTypes) for (const s of STAGES) expect(keys, `${s}/${c.slug}`).toContain(`${s}/${c.slug}`);
    expect(journeys.length).toBe(STAGES.length * caseTypes.length);
  });
  it("each stage entry is complete and economics-framed", () => {
    for (const j of journeys) {
      const id = `${j.stage}/${j.caseTypeSlug}`;
      expect(j.intro.length, id).toBeGreaterThan(200);
      expect(j.checklist.length, id).toBeGreaterThanOrEqual(3);
      expect(j.questionsToAsk.length, id).toBeGreaterThanOrEqual(3);
      expect(j.requiredDocuments.length, id).toBeGreaterThanOrEqual(3);
      expect(j.pitfalls.length, id).toBeGreaterThanOrEqual(2);
      expect(j.faqs.length, id).toBeGreaterThanOrEqual(1);
      expect(j.sources.length, id).toBeGreaterThanOrEqual(1);
      expect(j.dateModified, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const text = JSON.stringify(j);
      expect(text, id).not.toMatch(LEGACY_BRAND_PATTERN);
      expect(text, id).not.toMatch(/[–—§]/);
      expect(text, id).not.toMatch(/life care planner|vocational expert|CLCP/i);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/journeys.test.ts` — Expected: FAIL.

- [ ] **Step 3: Rewrite the 56 entries**

Keep the stage banner comments (`// ── Considering stage ──…`) — `off-brand-copy.test.mjs` splits on them. Standpoint per stage: *considering* — is an economist needed, what threshold of loss justifies one, what to gather first (tax returns, W-2s, pay stubs, benefits statements; for commercial: financials, contracts, tax returns; for divorce: business records, personal financials); *retaining* — engagement scope, conflict check, data request list, interplay with treating providers / life care plan (as a document) / vocational findings received from other experts (say "vocational findings supplied by other experts", never "vocational expert"); *preparing-deposition* — how the report is structured, assumptions to defend (growth, discount, worklife, mitigation, consumption), common attacks; *trial* — demonstratives, present-value explanation for jurors, rebuttal of opposing economist. `dateModified: "2026-08-27"`. `sources` via `refsToSources` (BLS/NAFE/Treasury keys; AICPA/NACVA for commercial and divorce). Hand-off lines to sister practices: at most one per stage chunk, phrased "coordinated with a vocational specialist" (the existing `HANDOFF_LINE` regex) — keep the count rule in `off-brand-copy.test.mjs`.

- [ ] **Step 4: Run tests**

Run: `npx tsc -b && npx vitest run src/data/journeys.test.ts src/pages/off-brand-copy.test.mjs` — Expected: journeys PASS; off-brand may still flag pages (Task 10).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(content): 56 attorney journey stages for economics matters"
```

---

### Task 9: Geo content re-slant

**Files:**
- Modify: `src/data/geo-prose.mjs` (+ `geo-prose.d.mts` if signatures change), `src/data/narratives.ts`, `src/data/narratives.test.ts`, `src/data/narratives.parity.test.mjs`, `src/data/geographicFaqs.ts`, `src/data/local-content.ts`, `src/data/regulations/state-regs.ts` (rewrite `practiceContext` per state to damages-rule context), `src/components/CareContextWidget.tsx` → rename to `src/components/EconomicContextWidget.tsx`, `src/pages/ServiceState.tsx`, `src/pages/ServiceStateCity.tsx`, `src/pages/CityPage.tsx`, `src/pages/StateHub.tsx`, `src/pages/LocationsHub.tsx`, `src/pages/hubs/JurisdictionsHubPage.tsx`, `scripts/prerender.mjs` (uses geo-prose — verify no duplicated prose)

**Interfaces:**
- Produces: same function signatures as today from `geo-prose.mjs` (`stateNarrative`, `cityNarrative`, `geoFaqs` or whatever the file exports — read it first and keep names), economics prose. `EconomicContextWidget` props: `{ population?: number; msaName?: string; medianHouseholdIncome?: number }` rendering population + MSA + (if the metro data has it) median household income; never unemployment rates or employer lists as facts about the case.

- [ ] **Step 1: Write the failing test**

Replace `src/data/narratives.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { getStateNarrative, getCityNarrative } from "./narratives";
import { serviceCityGeographicFaqs } from "./geographicFaqs";
import { getServiceBySlug } from "./services";
import { states } from "./states";

describe("economics geo narratives", () => {
  it("state narrative talks about wages, cost of living and damages venue, not care costs", () => {
    const text = getStateNarrative("new-jersey", "lost-earnings-and-earning-capacity");
    expect(text).toMatch(/wage|earnings|cost of living|damages/i);
    expect(text).not.toMatch(/attendant care|home health|life care planner|labor market survey/i);
    expect(text).not.toMatch(/[–—§]/);
  });
  it("city narrative and FAQs are economics-framed for every state's largest city", () => {
    for (const st of states) {
      const city = st.largestCity.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const text = getCityNarrative(st.slug, city, "wrongful-death-economic-loss");
      if (!text) continue;
      expect(text, `${st.slug}/${city}`).not.toMatch(/attendant care|home health|life care planner|vocational expert/i);
    }
    const faqs = serviceCityGeographicFaqs(getServiceBySlug("lost-earnings-and-earning-capacity")!, states[0], { slug: "x", name: "Sample City", stateSlug: states[0].slug } as never);
    expect(faqs.length).toBeGreaterThanOrEqual(3);
    expect(JSON.stringify(faqs)).toMatch(/earnings|wage|present value|economist/i);
    expect(JSON.stringify(faqs)).not.toMatch(/life care planner|vocational expert|CLCP/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/narratives.test.ts` — Expected: FAIL.

- [ ] **Step 3: Rewrite the prose templates**

`geo-prose.mjs`: update the header comment rules to "economics framing: wages, cost of living, local industry mix as context; no invented statistics; population and MSA allowed; citation-free". Rewrite every sentence template around: how local wage levels and cost of living enter an earnings or household-services analysis; the state's trial-court venues where damages claims are heard (keep `forumPhrase`); the industries that shape earnings histories in the metro (use `topEmployers` names as *context*, not as claims about a client); how the economist sources local wage data (BLS OES metro tables, ACS). Rename `careMedicalCenters`/`HEALTH_SYSTEM_RE` to `majorEmployers(topEmployers)` returning the first five names. `geographicFaqs.ts`: question templates such as "How does a forensic economist account for {city} wage levels in a lost earnings claim?", "Which courts in {state} hear the damages claims your reports support?", "Do you testify in {city}, {state}?", "How is present value calculated for a {state} wrongful death claim?" `state-regs.ts`: rename LCP-era fields to `damagesContext` (one or two citation-free sentences per state on survival vs wrongful-death frameworks, collateral-source treatment, and prejudgment interest *existing* without stating rates or caps) — update the `StateRegulation` type in `src/types/index.ts` and all readers. `local-content.ts`: keep the 12 essays' structure, rewrite economics-relevant sentences, drop care-cost sentences. `EconomicContextWidget.tsx`: rename file/component, update imports in the four page files. `narratives.parity.test.mjs`: keep — it compares runtime vs prerender output; it must still pass.

- [ ] **Step 4: Run tests**

Run: `npx tsc -b && npx vitest run src/data/narratives.test.ts src/data/narratives.parity.test.mjs src/data/contentReadiness.test.ts src/lib/geo-links.test.ts` — Expected: PASS.

- [ ] **Step 5: Commit and push (milestone if `npx eslint .` and `npx vitest run src/data` are clean)**

```bash
git add -A
git commit -m "feat(geo): economics-framed state/city narratives, FAQs, regulations, context widget"
git push origin main
```

---

### Task 10: Pages, components, nav, cross-sell, and vocabulary guards

**Files:**
- Modify: every file listed by `grep -rliE "life care|life-care|CLCP|kwlcp|KW LCP|physician|pediatric|catastrophic injury" src/pages src/components src/App.tsx index.html` — notably `Home.tsx`, `About.tsx`, `Contact.tsx`, `ScheduleConsultation.tsx`, `FAQ.tsx`, `CaseStudies.tsx`, `Terms.tsx`, `Privacy.tsx`, `ServicesHub.tsx`, `ServicePillar.tsx`, `ServiceState.tsx`, `Team.tsx`, all `src/pages/hubs/*.tsx`, `InsightsHub.tsx`, `InsightPost.tsx`, `KnowledgeHub.tsx`, `WhitePapersHub.tsx`, `src/components/CrossSell.tsx`, `ContactCTA.tsx`, `NextSteps.tsx`, `TestimonialSection.tsx`, `ServiceCityCrossLinks.tsx`, `layout/Header.tsx`, `layout/Footer.tsx`, `src/components/*.render.test.tsx`, `src/pages/internal-links.render.test.tsx`, `src/lib/richtext.test.ts`, `src/brand-strings.test.mjs`, `src/pages/off-brand-copy.test.mjs`, `src/types/index.ts` (comments)

**Interfaces:**
- Consumes: brand constants; `pillarServices()`; `caseTypes`.
- Produces: `<CrossSell />` linking `${VOC_SITE_URL}/services/vocational-evaluation` and `${LCP_SITE_URL}/services/life-care-planning`; guard tests updated to the new patterns.

- [ ] **Step 1: Write the failing guards and CrossSell test**

`src/brand-strings.test.mjs`: `ALLOW = new Set(["src/lib/brand.ts", "src/components/CrossSell.tsx", "src/brand-strings.test.mjs"])`; `PATTERN = /KWVRS|kwvrs\.com|kwlcp|KW LCP|Kincaid Wolstein Vocational|Life Care Planning/`; second test checks `scripts`, `server.js`, `index.html`, `public/llms.txt`, `public/robots.txt`, `public/manifest.json` for `/kwvrs\.com|kwlcp\.com/` excluding `scripts/lib/site.mjs`.

`src/pages/off-brand-copy.test.mjs`: `PATTERN = /vocational evaluation|vocational expert|transferable skills|labor market survey|life care planner|CLCP|CNLCP/i`; `ALLOW = new Set(["src/components/CrossSell.tsx"])`; `DATA_ALLOW_FILES = new Set(["src/data/team.ts"])`; add a line-level allowance for `src/data/services.ts` lines inside the `life-care-plan-cost-projection` entry and for the two comparison entries `forensic-economist-vs-vocational-expert` and `economist-vs-life-care-planner` in `src/data/comparisons.ts` (implement by skipping lines between the `slug: "<x>"` line and the next `slug:` line for those slugs). Keep the journeys hand-off rule.

`src/components/CrossSell.render.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import CrossSell from "./CrossSell";

describe("CrossSell", () => {
  it("links both sister practices with rel=noopener and no nofollow", () => {
    const html = renderToStaticMarkup(<MemoryRouter><CrossSell /></MemoryRouter>);
    expect(html).toContain('href="https://kwvrs.com/services/vocational-evaluation"');
    expect(html).toContain('href="https://kwlcp.com/services/life-care-planning"');
    expect(html).toContain('rel="noopener"');
    expect(html).not.toContain("nofollow");
  });
});
```

- [ ] **Step 2: Run guards to get the offender list**

Run: `npx vitest run src/brand-strings.test.mjs src/pages/off-brand-copy.test.mjs src/components/CrossSell.render.test.tsx` — Expected: FAIL with the file list (~50 files).

- [ ] **Step 3: Rewrite CrossSell and sweep page copy**

`CrossSell.tsx`:
```tsx
import { Briefcase, HeartPulse } from "lucide-react";
import { VOC_SITE_URL, LCP_SITE_URL } from "@/lib/brand";

// The only component allowed to name the sister practices and their domains.
const SISTER = [
  { name: "Vocational Evaluation", href: `${VOC_SITE_URL}/services/vocational-evaluation`, blurb: "Employability, earning capacity foundations, and vocational rehabilitation opinions from Kincaid Wolstein Vocational and Rehabilitation Services (KWVRS).", Icon: Briefcase },
  { name: "Life Care Planning", href: `${LCP_SITE_URL}/services/life-care-planning`, blurb: "Physician-informed life care plans and medical cost projections from KW Life Care Planning, priced to present value by our economists.", Icon: HeartPulse },
];
```
(same JSX body as the current file; swap `text-teal`/`hover:border-teal` for `text-amber`/`hover:border-amber`.)

Page copy: `Home.tsx` eyebrow "Forensic Economists and Damages Experts", H1 "Economic Damages Analysis That Holds Up in Court", subhead "KW Economics delivers independent lost earnings, wrongful death, household services, employment, business valuation, and forensic accounting analyses for plaintiff and defense counsel in all 50 states, the District of Columbia, and U.S. territories.", "How We Work" 4-up: Objective Analysis / Transparent Assumptions / Court-Tested Methods / Nationwide Practice; service grid = `pillarServices().filter((s) => s.slug !== "expert-rebuttal-and-report-review")`; `<CrossSell />`. `About.tsx`: history names the parent group once via `ORG_LEGAL`; mission = independent, transparent economic damages work. `Contact.tsx` / `ScheduleConsultation.tsx`: case-type select from `caseTypes`; copy about "economic damages consultation". `Privacy.tsx` / `Terms.tsx`: entity `ORG_LEGAL` d/b/a `ORG_NAME`. Hubs: rewrite intros ("Case Types We Analyze", "Methods", "Guides for Attorneys", "Comparisons", "Jurisdictions"). `Header.tsx` Resources dropdown: Guides, Compare, Methods, Knowledge, Insights, White Papers, FAQ. `Footer.tsx` family column: "Kincaid Wolstein family" → kwvrs.com (Vocational) and kwlcp.com (Life Care Planning) via the constants. `CaseStudies.tsx`: three anonymized representative engagement narratives (lost earnings in a TBI matter, lost profits in a contract dispute, business valuation in a shareholder dispute) with no dollar amounts or party names. Update render tests' expected strings.

- [ ] **Step 4: Run the full suite and lint**

Run: `npx tsc -b && npx eslint . && npx vitest run` — Expected: PASS (all suites; sitemap tests that need `dist/` may skip — note them).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(ui): economics page copy, nav, cross-sell to both sister practices, brand + vocabulary guards"
```

---

### Task 11: Server, lead mailer, llms.txt, sitemaps, README, full build

**Files:**
- Modify: `server.js` (`CANONICAL_HOST` default), `lib/lead-mailer.server.mjs` + `lib/lead-mailer.server.test.mjs` (`LEAD_FROM` default `KW Economics <info@kwvrs.com>`, subject prefix, ack greeting), `lib/spam-heuristics.server.test.mjs` (fixture copy), `scripts/generate-llms.mjs` (site summary + pillar list), `scripts/generate-sitemap.mjs`, `scripts/generate-extra-sitemaps.mjs`, `scripts/sitemap-index.test.mjs`, `scripts/prerender.mjs` (remaining LCP shell text), `public/llms.txt`, `public/llms-full.txt` (regenerated), `README.md`, `Dockerfile` (only if the runtime copy list changed — it should not)

**Interfaces:**
- Produces: `npm run build` → `dist/` with sitemap index (5 children + image + news), regenerated `llms.txt`, prerendered shells; README page inventory.

- [ ] **Step 1: Write the failing tests**

In `lib/lead-mailer.server.test.mjs` update expectations: default from-name `KW Economics`, subject starts with `[KW Economics]`. In `scripts/sitemap-index.test.mjs`: `PILLARS` = the 11 slugs; ceiling stays `3600`; add:
```js
it("emits every pillar service x state and no cross-sell service URLs", () => {
  const urls = servicesChildUrls();
  for (const s of PILLARS) for (const st of stateSlugs) expect(urls).toContain(`${BASE}/services/${s}/${st}`);
  expect(urls.some((u) => /\/services\/(vocational-evaluation|life-care-planning)\//.test(u))).toBe(false);
});
```
Add to `scripts/prerender-meta.test.mjs` a check that no prerendered shell text in `scripts/prerender.mjs` matches `/life care planner|CLCP|physician/i`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib scripts` — Expected: FAIL on the new assertions.

- [ ] **Step 3: Update server, mailer, generators**

`server.js`: `CANONICAL_HOST` default `"kweconomics.com"`; confirm `API_ROUTES` has three entries. `lead-mailer.server.mjs`: read `ORG_NAME` from `scripts/lib/site.mjs` (or duplicate the literal with a comment pointing at `site-brand-parity`), default `LEAD_FROM`, subject `[KW Economics] New ${type} inquiry - ${name}`, ack greeting "Thank you for contacting KW Economics." `generate-llms.mjs`: rewrite the summary prose (who we are, the 11 pillars, the 14 case types, nationwide, contact) with no physician/CLCP claims; run `npm run generate:llms`. `generate-sitemap.mjs` / `generate-extra-sitemaps.mjs`: remove any LCP special cases; pillar enumeration comes from `services.ts` regex (verify it picks up `pillar: true` only). `prerender.mjs`: sweep remaining LCP shell strings (hubs, case types, credentials, attorneys, 404).

- [ ] **Step 4: Full build and count check**

```bash
export PATH=~/.local/node/node-v22.22.0-darwin-arm64/bin:$PATH
npm run build 2>&1 | tail -30
find dist -name index.html | wc -l
grep -c "<loc>" public/sitemap-services.xml public/sitemap-locations.xml public/sitemap-case-types.xml public/sitemap-credentials.xml public/sitemap-core.xml
grep -rlE "life care planner|CLCP|kwlcp\.com|KWVRS" dist --include=index.html | grep -v "/services/vocational-evaluation\|/services/life-care-planning\|/services/life-care-plan-cost-projection" | head
```
Expected: build succeeds; ≈8,500 `index.html`; services child ≤ 3,600 and ≥ 616 + gated cities; locations 858-859; case-types 784 + 14 hubs; credentials 224 + 4; core ≈ 120; the final grep prints nothing (sister brand names appear only on the cross-sell cards, which render client-side).

- [ ] **Step 5: Run the full suite and lint**

Run: `npx tsc -b && npx eslint . && npx vitest run` — Expected: PASS.

- [ ] **Step 6: Rewrite `README.md`**

Sections: Project (KW Economics, kweconomics.com, parent group, sister sites linked never duplicated), Local development (Node 22 path, `npm ci`, `dev`, `build`, `test`, `lint`, `preview`, full gate), Production (`node server.js`, env table from spec §7 with `CANONICAL_HOST=kweconomics.com`), Deployment (Railway Dockerfile, `/healthz`, standing Docker rule), Page inventory (numbers from Step 4), Content model (one line per `src/data` file with counts), **Facts to confirm** (spec §12 verbatim as a checklist), Related repos (kwlcp-website as structural upstream @b1e643c; kwvrs-site as its upstream).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "build: economics llms/sitemap/prerender pipeline, lead mailer defaults, README with page inventory and facts-to-confirm"
```

---

### Task 12: Docker verification and push

**Files:**
- None new (verification only), unless fixes are needed.

- [ ] **Step 1: Build and run the image locally**

```bash
cd "/Users/chrisskerritt/Documents/New project/kweconomic-website"
docker build -t kweconomics . 2>&1 | tail -5
docker run --rm -d -p 3200:3000 -e CANONICAL_HOST= -e LEAD_RECIPIENTS=test@example.com --name kweconomics kweconomics
sleep 3
curl -s localhost:3200/healthz
curl -s -o /dev/null -w "%{http_code}\n" localhost:3200/services/lost-earnings-and-earning-capacity/new-jersey/hackensack
curl -s localhost:3200/services/lost-earnings-and-earning-capacity/new-jersey/hackensack | grep -o "<title>[^<]*"
curl -s -o /dev/null -w "%{http_code}\n" localhost:3200/services/business-valuation/new-jersey
curl -s -o /dev/null -w "%{http_code}\n" localhost:3200/case-types/fraud-and-embezzlement/new-york
curl -s -o /dev/null -w "%{http_code}\n" localhost:3200/credentials/nafe-member/virginia
curl -s -o /dev/null -w "%{http_code}\n" localhost:3200/services/life-care-planning/new-jersey
curl -s -o /dev/null -w "%{http_code}\n" localhost:3200/tools
curl -s -X POST localhost:3200/api/contact -H 'content-type: application/json' -d '{"name":"Test Attorney","email":"test@example.com","phone":"2015551212","message":"Docker smoke test"}'
docker logs kweconomics 2>&1 | tail -5
docker stop kweconomics
```
Expected: `{"ok":true,...}`; `200`; a title containing "Lost Earnings" and "Hackensack"; `200`; `200`; `200`; `404` for the cross-sell geo page; `404` for `/tools`; `{"success":true}`; a log line showing the lead reached the mailer with `RESEND_API_KEY` unset.

- [ ] **Step 2: Fix anything that failed, re-run Step 1 until clean, then run the suite once more**

Run: `npx tsc -b && npx eslint . && npx vitest run` — Expected: PASS.

- [ ] **Step 3: Push (milestone)**

```bash
git push origin main
```

- [ ] **Step 4: Report**

Post the page inventory, the Docker smoke results, the sitemap counts, and the facts-to-confirm checklist from README. Do not create the Railway service or DNS — those are Chris's calls (spec §10-11).
