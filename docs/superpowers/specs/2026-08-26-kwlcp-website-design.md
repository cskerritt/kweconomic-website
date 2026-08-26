# KW LCP Website (kwlcp.com) — Design Spec

**Date:** 2026-08-26
**Status:** Approved by Chris Skerritt (chat, 2026-08-26)
**Repo:** `cskerritt/kwlcp-website`
**Source of structure:** `cskerritt/kwvrs-site` (kwvrs.com) as of commit `83c0167` (2026-08-25)
**Content harvest:** `cskerritt/KW-LIFECARE-SITE` (May 2026 LCP fork) — `services.ts`, LCP team bios, home hero copy, schema `knowsAbout`

---

## 1. Goal

Build a marketing + lead-capture site for **KW Life Care Planning** ("KW LCP"), the life care planning division of the Kincaid Wolstein group, at **https://kwlcp.com**. It reuses the proven kwvrs.com architecture (Vite + React 19 + TypeScript + Tailwind 4, head-only prerender, sitemap index, geographic SEO across all states/territories, attorney-journey content) but is topically restricted to life care planning so the domain ranks for LCP queries without diluting into vocational/economics.

Success criteria:

1. `npm run build` produces a prerendered `dist/` with all route families below; `npm test` green; local Docker image serves the site and accepts a contact form submission end-to-end (Resend email received).
2. Zero occurrences of `KWVRS`, `kwvrs.com`, or `Kincaid Wolstein Vocational` outside `src/lib/brand.ts` and the explicit cross-sell section (guard test).
3. No dangling internal links (`citations.routes` test) and no vocational/economics service pages.
4. Deployable to Railway from the Dockerfile with only the env vars in §7.

## 2. Approach

**Clone-and-strip.** Copy the kwvrs-site working tree (not its git history — commit messages reference client matters) into this repo, delete everything not needed, rewrite the data layer for LCP, centralize brand strings, and retune tests. A shared-core monorepo was considered and rejected as a refactor of a live production site outside this ask.

## 3. Brand

`src/lib/brand.ts` is the single source of brand truth; `src/lib/schema.ts` imports from it.

| Constant | Value |
|---|---|
| `ORG_NAME` | `KW Life Care Planning` |
| `ORG_SHORT` | `KW LCP` |
| `ORG_LEGAL` | `Kincaid Wolstein Vocational and Rehabilitation Services` (used only in `/privacy`, `/terms`, footer legal line) |
| `SITE_URL` | `https://kwlcp.com` |
| `ORG_EMAIL` | `info@kwvrs.com` (until a kwlcp.com mailbox exists — flagged in README facts-to-confirm) |
| `ORG_PHONE` | `+1-201-343-0700`; VA office `+1-804-282-4199` |
| `OFFICES` | Hackensack NJ (1 University Plaza, Suite 302, 07601) and Richmond VA — copied from kwvrs `schema.ts` |
| `SAME_AS` | `https://kwvrs.com`, `https://kweconomics.com` |
| `KNOWS_ABOUT` | Life Care Planning, Pediatric Life Care Planning, Catastrophic Injury Cost Projection, Medical Cost Projection, Future Medical Care, Medicare Set-Aside Allocation, Life Care Plan Rebuttal, Expert Witness Testimony |

Rules:
- No page, template, or component inlines the brand name; they import from `brand.ts`. A vitest guard (`src/brand-strings.test.mjs`) fails on any `KWVRS|kwvrs\.com|Kincaid Wolstein` match under `src/` except `brand.ts` and `src/components/CrossSell.tsx`.
- Build scripts (`generate-sitemap`, `generate-extra-sitemaps`, `generate-llms`, `prerender`, `indexnow-submit`, `gsc-audit`) read `SITE_URL` from a tiny `scripts/lib/site.mjs` (they cannot import TS).
- Twitter handle, GA4 ID, GSC verification: placeholders removed; set via env (`VITE_GA_MEASUREMENT_ID`) and README facts-to-confirm.

Visual identity: keep kwvrs's design system (Inter / Source Serif 4 / JetBrains Mono, motion system, components). Accent shifts from navy-only to **teal** (`#0d7377` / light `#14a3a8` / dark `#095457`) as the primary action/accent color; navy `#14223d` remains the text/ink and hero color; amber `#b8731f` demoted to highlights and stat bars. Logo: new `public/images/logo.svg` / `logo.png` wordmark "KW Life Care Planning" in the same lockup style as kwvrs (temporary text-based wordmark; final artwork is a facts-to-confirm item). Favicons regenerated from the existing KW mark.

## 4. Content model

### 4.1 Services (11 entries; 10 "pillars")

Every entry carries `cost`, `process`, and `timeline` (required by the `/services/:slug/{cost,process,timeline}` templates), authored from kwvrs's `life-care-planning` entry as the template.

| slug | name | pillar? | notes |
|---|---|---|---|
| `life-care-planning` | Life Care Planning | yes | flagship |
| `pediatric-life-care-planning` | Pediatric Life Care Planning | yes | birth injury, CP, transitions to adulthood |
| `catastrophic-injury-planning` | Catastrophic Injury Life Care Plans | yes | TBI, SCI, burn, amputation |
| `medical-cost-projection` | Medical Cost Projections | yes | focused future-medical analysis |
| `workers-compensation-lcp` | Workers' Compensation Life Care Plans | yes | |
| `plan-update-and-review` | Life Care Plan Updates | yes | updates only (rebuttal split out) |
| `life-care-plan-rebuttal` | Life Care Plan Rebuttal & Critique | yes | NEW — defense/plaintiff review of opposing plans |
| `medicare-set-aside` | Medicare Set-Aside Allocations | yes | NEW — WCMSA / liability MSA; requires MSCC on team (Christopher Skerritt holds MSCC) |
| `elder-and-long-term-care-planning` | Elder & Long-Term Care Planning | yes | NEW — non-litigation LCP for families, guardianship, trusts |
| `expert-witness-testimony` | Expert Witness Testimony | yes | LCP-scoped testimony |
| `forensic-economics` | Forensic Economic Support | **no** | `externalUrl: https://kwvrs.com/services/forensic-economics`; rendered only in cross-sell; excluded from geo/case/cost/process/timeline enumeration via `pillar: false` |

`Service` type gains `pillar: boolean`. All enumerators (`App` route data, sitemap, prerender, hubs, cross-links, Header/Footer) use `pillarServices()`.

### 4.2 Case types (11)

Keep from kwvrs: `traumatic-brain-injury`, `spinal-cord-injury`, `amputation`, `burn-injury`, `wrongful-death`, `medical-malpractice`, `personal-injury`, `workers-compensation`, `motor-vehicle-accident`. Drop: `long-term-disability`, `wrongful-termination`, `matrimonial`. Add: `birth-injury`, `cerebral-palsy` (authored to the existing `CaseType` shape, including per-state template hooks and journey-stage copy).

### 4.3 Credentials (8)

Keep: `clcp`, `crc`, `md`, `rn`, `phd`. Add: `cnlcp`, `mscc`, `cdms`. Drop the 7 vocational credentials (`cve`, `abve-d`, `abve-f`, `lrc`, `fve`, `ipec`, `cprw`) and `ceas`.

### 4.4 Editorial content

| File | Keep | Add |
|---|---|---|
| `methods.ts` | `life-care-plan-development`, `present-value-analysis`, `functional-capacity-evaluation`, `worklife-expectancy` (renamed framing: life expectancy in LCP) | `cost-research-methodology`, `msa-allocation-methodology` |
| `guides.ts` | `what-is-life-care-plan`, `future-medical-costs-in-personal-injury`, `standard-of-care-analysis`, `expert-witness-disclosure-rules`, `federal-vs-state-court-daubert`, `when-do-you-need-expert-witness`, `collateral-source-rule-explained` | `how-a-life-care-plan-is-priced`, `life-care-plan-vs-medicare-set-aside`, `pediatric-life-care-plans-and-transition-to-adulthood`, `how-to-rebut-a-life-care-plan`, `attendant-care-in-life-care-plans`, `home-modification-and-equipment-costing` |
| `comparisons.ts` | `life-care-plan-vs-future-cost-projection`, `life-care-plan-vs-medical-chronology`, `clcp-vs-case-manager`, `in-person-evaluation-vs-file-review`, `fce-vs-ime`, `plaintiff-expert-vs-defense-expert` | `clcp-vs-cnlcp`, `life-care-plan-vs-msa` |
| `knowledge.ts` | `guide-to-life-care-planning`, `expert-witness-testimony-guide` | — |
| `insights.ts` | `life-care-plan-components-and-methodology`, Daubert/Frye post | — (insights are ongoing editorial) |
| `whitePapers.ts` | `daubert-ready-life-care-plan` | — |
| `faqs.ts` | LCP-relevant subset | rewritten to LCP |
| `testimonials.ts` | quotes that reference life care plans; others dropped | — |
| `journeys.ts` | all 4 stages, re-keyed to the 11 case types | stage copy for the 2 new case types |
| `local-content.ts`, `narratives.ts`, `geographicFaqs.ts` | geo infra kept | prose re-slanted: care-cost, provider availability, attendant-care rates, court venue — not labor market |
| `references.ts` | kept (anti-fabrication registry); vocational-only refs pruned | LCP standards refs (IALCP Standards of Practice, CMS WCMSA Reference Guide, etc.) |

All new copy follows kwvrs's citation-free policy (no statute cites in prose; sources via `references.ts`).

### 4.5 Team

Roster from kwvrs `team.ts`, LCP-filtered: Jesse Wolstein (Chief Medical Director & Life Care Planner — bio from May fork), Paul Bourgeois (Chief of Life Care Planning), Christina Rivera (Life Care Planner, RN), Daniel Wolstein (CEO, CLCP), Christopher Skerritt (Chief of Economic Services, CLCP, MSCC — MSA lead), Matthew Putts (CLCP), Lizette Mendoza and Cara Creighton (Life Care Plan Administrators), Danielle Vallone, Abigail Wolstein, Rebecca Wolstein (Medical Chronologists), Charles Kincaid (memoriam). Expert picker parity rules unchanged.

## 5. Routes

Kept from kwvrs (same components, LCP data): `/`, `/about`, `/team`, `/team/:slug`, `/contact`, `/schedule-consultation`, `/services`, `/services/:serviceSlug`, `/services/:serviceSlug/:stateSlug`, `/services/:serviceSlug/:stateSlug/:citySlug`, `/services/:serviceSlug/case/:typeSlug`, `/services/:serviceSlug/{cost,process,timeline}`, `/locations`, `/locations/:stateSlug`, `/locations/:stateSlug/:citySlug`, `/case-types(/:slug(/:stateSlug))`, `/credentials(/:slug(/:stateSlug))`, `/guides(/:slug)`, `/compare(/:slug)`, `/methods(/:slug)`, `/attorneys(/:stage(/:caseTypeSlug))`, `/jurisdictions`, `/knowledge(/:slug)`, `/insights(/:slug)`, `/white-papers(/:slug)`, `/case-studies`, `/resources/faq`, `/tools`, `/tools/life-expectancy`, `/privacy`, `/terms`, `*`.

Dropped: `/contact/*intake`, `/nm`, `/intake`, `/agreements/*`, `/payment`, `/raffle`, `/samples`, `/cv`, `/forms`, PHQ/HIPAA pages, `/services/expert-disclosure(/*)`, `/tools/economic-damages-estimator`, `/tools/household-services(/*)`, `/review`, and all `/admin`, `/training`, `/learn`, `/psa*` server redirects.

`/tools` hub lists only the life-expectancy tool and links to kwvrs.com tools in the cross-sell block.

Header nav: Services (10 pillars) · Case Types · Resources (guides, compare, methods, knowledge, insights, white papers, FAQ, life-expectancy tool) · Locations · Team · About · Contact + "Schedule a consultation" CTA. Footer mirrors, plus a "Kincaid Wolstein family" column linking kwvrs.com and kweconomics.com; no Staff Login / Training links.

## 6. Server

`server.js` rewritten to the minimum, keeping kwvrs's code for each retained block:

- Canonical-host 301 (`CANONICAL_HOST`), trailing-slash 301, security headers/CSP, static + gzip LRU, `X-Robots-Tag` for noindex paths, `CLIENT_ONLY_ROUTES` (none in v1), SPA 404 fallback, `/healthz`.
- `OPTIONS /api/*` and `POST` for `API_ROUTES`: `/api/contact`, `/api/consultation`, `/api/whitepaper`, `/api/life-expectancy`. Pipeline: rate limit (`RATE_LIMIT_MAX`) → body parse → field validation (`validation.server.mjs`, trimmed to `isEmail`/`isPhone`/`validateRoute`) → Turnstile (`turnstile.server.mjs`, fail-open) → spam heuristics (`lib/spam-heuristics.server.mjs`) → optional Supabase `raw_submissions` insert (`lib/raw-submissions.server.mjs`) → **`lib/lead-mailer.server.mjs`**: Resend email to `LEAD_RECIPIENTS` with a plain-text summary, plus an acknowledgement to the submitter for `consultation`. If `RESEND_API_KEY` is unset the lead is logged and stored (Supabase if configured) and the handler still returns 200.
- No workflow forwarding, replay sweep, raffle, payments, estimator emails, rush alerts, or legacy redirect maps.

## 7. Environment & deploy

Dockerfile and `railway.json` unchanged except the runtime copy list. Build args `VITE_TURNSTILE_SITE_KEY`, `VITE_GA_MEASUREMENT_ID` default to empty (new site keys; the kwvrs defaults are not carried).

| Var | Required | Purpose |
|---|---|---|
| `PORT` | Railway | default 3000 |
| `CANONICAL_HOST` | yes | `kwlcp.com` |
| `LEAD_RECIPIENTS` | yes | comma list; default `info@kwvrs.com` |
| `LEAD_FROM` | yes | Resend-verified sender (kwlcp.com must be verified in Resend — facts-to-confirm) |
| `RESEND_API_KEY` | prod | lead delivery |
| `VITE_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | prod | bot check |
| `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | optional | durable capture |
| `RATE_LIMIT_MAX` | optional | default 10/min/IP |

Node 22 for local work (`~/.local/node/node-v22.22.0-darwin-arm64/bin`). Local `docker build && docker run` before any push to `main` (standing rule).

## 8. SEO & scale

- Prerender: `SERVICE_CITY_PRERENDER_TOP = 10`, sitemap `SERVICE_CITY_SITEMAP_TOP = 5` + metro-labor cities (unchanged gating logic).
- Expected volume: 10 pillars × 56 states = 560 service-state; ~5,270 service-city prerendered / ~2,750 in sitemap; 802 city pages; 56 state hubs; 11×56 case-type-state; 8×56 credential-state; ~120 editorial/hub/core. ≈9k prerendered, ≈5k sitemap URLs across the 5-child sitemap index + image + news sitemaps.
- `llms.txt` / `llms-full.txt` regenerated; IndexNow script retained; `.github/workflows/gsc-audit.yml` retained but disabled until a kwlcp.com GSC property exists.
- Structured data: `ProfessionalService` org with `MedicalBusiness` as additional type, `Service`, `BreadcrumbList`, `FAQPage`, `Person` — via the existing `schema.ts` builders.

## 9. Testing

- Carry over the full vitest suite; delete tests with their features (raffle, payment, agreements, intake parity, estimator, household services, rush, legacy redirects, admin/training, client-forms, QR).
- Retune count assertions: `services.test.ts` (11 entries, 10 pillars, forensic-economics non-pillar), `App.routes.test.mjs`, `sitemap-index.test.mjs` crawl-budget ceiling, `references.test.ts`, `team*.test.ts`, `tools-indexing.routes.test.mjs` (one tool).
- Keep as strip safety net: `citations.routes.test.mjs`, `internal-links.render.test.tsx`, `contentReadiness.test.ts`, `geo-links.parity`.
- New: `brand-strings.test.mjs`, `services.pillar.test.ts` (every enumerator excludes non-pillars), `lead-mailer.test.mjs` (formats + no-key fallback), `server-contact.test.mjs` (end-to-end POST through the pipeline with Turnstile/Resend stubbed).

## 10. Out of scope (v1)

Intake/PSA/e-sign, payments, workflow service, DNS cutover, GA4/GSC property creation, Resend domain verification, final logo artwork, new photography, additional white papers, city-level hand-written essays beyond the 12 inherited.

## 11. Facts to confirm (tracked in README)

kwlcp.com mailbox; Resend-verified sender; whether KW LCP actually markets MSA and elder-care planning under this brand; final wordmark; Twitter/LinkedIn handles; GA4 + Turnstile keys for the new domain.
