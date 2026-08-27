# KW Economics Website (kweconomics.com) — Design Spec

**Date:** 2026-08-27
**Status:** Approved by Chris Skerritt (chat, 2026-08-27)
**Repo:** `cskerritt/kweconomic-website` (local `~/Documents/New project/kweconomic-website`)
**Source of structure:** `cskerritt/kwlcp-website` (kwlcp.com) at commit `b1e643c` (2026-08-26), itself a stripped clone of `cskerritt/kwvrs-site` (kwvrs.com). This repo starts as a byte-identical import of that commit (history included, since kwlcp's history has no client references).
**Not a source:** the existing `cskerritt/kweconomics` site and the legacy tagonline build. No code, copy, routes, or redirects are carried from them.

---

## 1. Goal

Build a marketing + lead-capture site for **KW Economics**, the forensic economics, forensic damages, forensic accounting, and business valuation practice of the Kincaid Wolstein group, at **https://kweconomics.com**. Same style, layout, and architecture as kwvrs.com and kwlcp.com (Vite + React 19 + TypeScript + Tailwind 4, head-only prerender, sitemap index, nationwide geographic SEO, attorney-journey content), topically restricted to economic and financial damages so the domain ranks for those queries without diluting into vocational or life-care-planning content.

Success criteria:

1. `npm run build` produces a prerendered `dist/` with every route family in §5; `npm test` green; local Docker image serves the site and accepts a contact submission end-to-end.
2. Zero occurrences of `KWVRS`, `kwvrs.com`, `KW LCP`, `kwlcp.com`, `Life Care Planning` (as a brand) outside `src/lib/brand.ts` and `src/components/CrossSell.tsx` (guard test).
3. No vocational or life-care-planning service pages; those topics appear only as cross-sell cards linking to kwvrs.com and kwlcp.com.
4. No dangling internal links; deployable to Railway from the Dockerfile with only the env vars in §7.

## 2. Approach

**Clone-and-re-slant.** kwlcp already has the multi-practice material stripped, brand strings centralized, the `pillar: false` cross-sell pattern, and guard tests. This project swaps the data layer (services, case types, credentials, team, editorial, geo prose, references, FAQs) and brand constants, retunes tests, and leaves components, server, build scripts, and Docker unchanged wherever possible. A shared template package across the three sites was considered and deferred — correct long-term, larger than this ask.

## 3. Brand

`src/lib/brand.ts` and `scripts/lib/site.mjs` are the only places the brand and sister-site URLs are spelled.

| Constant | Value |
|---|---|
| `ORG_NAME` | `KW Economics` |
| `ORG_SHORT` | `KW Economics` |
| `ORG_LEGAL` | `Kincaid Wolstein Economics` (footer legal line, `/privacy`, `/terms`) |
| `SITE_URL` | `https://kweconomics.com` |
| `ORG_EMAIL` | `info@kwvrs.com` (facts-to-confirm: kweconomics.com mailbox) |
| `ORG_PHONE` / `ORG_PHONE_VA` / `OFFICES` | unchanged from kwlcp (Hackensack NJ, Richmond VA) |
| `VOC_SITE_URL` | `https://kwvrs.com` |
| `LCP_SITE_URL` | `https://kwlcp.com` (replaces `ECON_SITE_URL`) |
| `SAME_AS` | `[VOC_SITE_URL, LCP_SITE_URL]` |
| `LEGACY_BRAND_PATTERN` | `/KWVRS|KW LCP|kwlcp|Kincaid Wolstein Vocational|Life Care Planning/` — guard tests import this |
| `KNOWS_ABOUT` | Forensic Economics, Economic Damages, Lost Earnings Analysis, Earning Capacity, Wrongful Death Economic Loss, Household Services Valuation, Present Value Analysis, Business Valuation, Lost Profits, Forensic Accounting, Expert Witness Testimony |

Visual identity: kwlcp's design system unchanged (Inter / Source Serif 4 / JetBrains Mono, motion, components). Accent returns to the kwvrs **navy + gold** (`#14223d` ink/hero, gold `#b8731f` primary action) rather than kwlcp's teal — the kwvrs.com look Chris asked for. Logo: text-based wordmark "KW Economics" in the same lockup as the sister sites (`public/images/logo.svg` / `logo.png`); final artwork is a facts-to-confirm item. Favicons regenerated in navy.

Structured data: `ProfessionalService` organization (drop the `MedicalBusiness` additional type), `Service`, `BreadcrumbList`, `FAQPage`, `Person`, via the existing `schema.ts` builders.

## 4. Content model

### 4.1 Services (13 entries; 11 pillars)

Every entry carries `cost`, `process`, and `timeline` (required by the `/services/:slug/{cost,process,timeline}` templates) and the same `Service` shape as kwlcp.

| slug | name | pillar? |
|---|---|---|
| `lost-earnings-and-earning-capacity` | Lost Earnings & Earning Capacity Analysis | yes (flagship) |
| `wrongful-death-economic-loss` | Wrongful Death Economic Loss | yes |
| `personal-injury-economic-damages` | Personal Injury Economic Damages | yes |
| `household-services-valuation` | Household Services Valuation | yes |
| `life-care-plan-cost-projection` | Life Care Plan Cost Projection & Present Value | yes — the one place "life care plan" vocabulary is allowed as a subject (costing someone else's plan); hands plan authorship to kwlcp.com |
| `employment-and-wage-loss-damages` | Employment & Wage-Loss Damages | yes (discrimination, wrongful termination, FLSA) |
| `business-valuation` | Business Valuation | yes |
| `lost-profits-and-commercial-damages` | Lost Profits & Commercial Damages | yes |
| `fraud-and-asset-tracing` | Fraud Investigation & Asset Tracing | yes |
| `divorce-and-marital-financial-analysis` | Divorce & Marital Financial Analysis | yes (income determination, business interests, lifestyle analysis) |
| `expert-rebuttal-and-report-review` | Expert Rebuttal & Report Review | yes |
| `vocational-evaluation` | Vocational Evaluation | **no** — `externalUrl: ${VOC_SITE_URL}/services/vocational-evaluation` |
| `life-care-planning` | Life Care Planning | **no** — `externalUrl: ${LCP_SITE_URL}/services/life-care-planning` |

`pillarServices()` remains the only enumerator used by routes, sitemaps, prerender, hubs, nav, and cross-links. The two non-pillars render only in `CrossSell.tsx` and as short noindex `/services/:slug` cards that link out.

### 4.2 Case types (14)

`personal-injury`, `wrongful-death`, `medical-malpractice`, `motor-vehicle-accident`, `traumatic-brain-injury`, `spinal-cord-injury`, `workers-compensation`, `employment-discrimination`, `wrongful-termination`, `commercial-contract-dispute`, `partnership-and-shareholder-dispute`, `divorce-and-marital-dissolution`, `fraud-and-embezzlement`, `product-liability`.

Each authored to the existing `CaseType` shape (per-state template hooks, journey-stage copy, related pillars). Injury/death case types are written from the economist's standpoint — what the economic loss claim consists of and what records drive it — not from the medical or vocational standpoint. Dropped from kwlcp: `amputation`, `burn-injury`, `birth-injury`, `cerebral-palsy` (those are LCP-led matters; catastrophic injury is covered under PI/TBI/SCI economically).

### 4.3 Credentials (4)

One family, membership/education-based rather than certification-based, each × state:

| slug | name |
|---|---|
| `forensic-economist` | Forensic Economist (hub for the family) |
| `nafe-member` | National Association of Forensic Economics (NAFE) member |
| `aaefe-member` | American Academy of Economic and Financial Experts (AAEFE) member |
| `graduate-economics-degree` | Graduate Economics / MBA Credentials |

All eight kwlcp credentials (`clcp`, `cnlcp`, `mscc`, `cdms`, `crc`, `md`, `rn`, `phd`) are dropped. Whether Chris/Zach currently hold NAFE/AAEFE membership is a facts-to-confirm item; copy is written as "our economists follow NAFE's Statement of Ethical Principles" style, never as a claimed membership, until confirmed.

### 4.4 Editorial content

| File | Content |
|---|---|
| `methods.ts` | `present-value-and-discounting`, `worklife-expectancy`, `wage-growth-and-earnings-projection`, `fringe-benefits-valuation`, `household-services-methodology`, `business-valuation-approaches` (income/market/asset), `lost-profits-but-for-analysis`, `mitigation-and-offsets` |
| `guides.ts` | `what-is-a-forensic-economist`, `how-lost-earnings-are-calculated`, `wrongful-death-damages-explained`, `household-services-in-personal-injury`, `present-value-explained-for-attorneys`, `expert-witness-disclosure-rules`, `federal-vs-state-court-daubert`, `when-do-you-need-an-economic-expert`, `collateral-source-rule-explained`, `business-valuation-in-litigation`, `lost-profits-vs-lost-business-value`, `income-determination-in-divorce`, `how-to-rebut-an-economic-damages-report` |
| `comparisons.ts` | `forensic-economist-vs-forensic-accountant`, `forensic-economist-vs-vocational-expert`, `lost-earnings-vs-lost-earning-capacity`, `lost-profits-vs-business-valuation`, `plaintiff-economist-vs-defense-economist`, `fair-market-value-vs-fair-value`, `net-vs-gross-discount-rate`, `economist-vs-life-care-planner` |
| `knowledge.ts` | `guide-to-economic-damages`, `expert-witness-testimony-guide` |
| `insights.ts` | `components-of-an-economic-damages-report`, Daubert/Frye post re-slanted to economic testimony |
| `whitePapers.ts` | `daubert-ready-economic-damages-report`, `business-valuation-standards-in-litigation` |
| `faqs.ts`, `home-faqs.mjs` | rewritten to economics |
| `testimonials.ts` | economics-referencing quotes only; others dropped |
| `journeys.ts` | all 4 attorney stages re-keyed to the 14 case types, written from the economist's standpoint (what to send, when to retain, what the report answers, deposition/trial support) |
| `geo-prose.mjs`, `local-content.ts`, `narratives.ts`, `geographicFaqs.ts` | geo infra kept; prose re-slanted to wage levels, cost of living, local labor markets, state damages rules (survival vs wrongful-death statutes, collateral source, prejudgment interest, caps), venue |
| `references.ts` | anti-fabrication registry; LCP refs pruned; adds NAFE ethics statement, Journal of Forensic Economics, BLS (CPS/OES/ECEC), Skoog-Ciecka-Krueger worklife tables, Treasury yield data, AICPA SSVS No. 1, NACVA standards, Federal Rules 26/702 |

All copy follows the citation-free policy (no statute cites in prose; sources via `references.ts`); every `sources` URL passes `sources-urls.test.ts`.

### 4.5 Team (2)

From the kwvrs.com roster (`kwvrs-site/src/data/team.ts`), not the old kweconomics site:

- **Christopher Skerritt, M.Ed., MBA** — Chief of Economic Services; leadership; states served NJ NY MA VA RI CT PA; credentials list trimmed to those relevant here (M.Ed., MBA, CRC, CLCP, MSCC listed as background; economics framing in bio).
- **Zachary Sperling** — Economics Associate / Expert Liaison; support; NJ NY.

Expert-picker and tier tests retuned for a 2-person roster (leadership tier = Chris; no fellow/senior tiers needed — `team.tiers.test.ts` simplified rather than deleted).

## 5. Routes

Kept from kwlcp with economics data: `/`, `/about`, `/team`, `/team/:slug`, `/contact`, `/schedule-consultation`, `/services`, `/services/:serviceSlug`, `/services/:serviceSlug/:stateSlug`, `/services/:serviceSlug/:stateSlug/:citySlug`, `/services/:serviceSlug/case/:typeSlug`, `/services/:serviceSlug/{cost,process,timeline}`, `/locations`, `/locations/:stateSlug`, `/locations/:stateSlug/:citySlug`, `/case-types(/:slug(/:stateSlug))`, `/credentials(/:slug(/:stateSlug))`, `/guides(/:slug)`, `/compare(/:slug)`, `/methods(/:slug)`, `/attorneys(/:stage(/:caseTypeSlug))`, `/jurisdictions`, `/knowledge(/:slug)`, `/insights(/:slug)`, `/white-papers(/:slug)`, `/case-studies`, `/resources/faq`, `/privacy`, `/terms`, `*`.

Dropped: `/tools`, `/tools/life-expectancy`, `/api/life-expectancy`, and `tools-indexing.routes.test.mjs` (no tools in v1). The Resources nav loses its tool entry; the cross-sell block links to kwvrs.com/tools.

Header nav: Services (11 pillars) · Case Types · Resources (guides, compare, methods, knowledge, insights, white papers, FAQ) · Locations · Team · About · Contact + "Schedule a consultation" CTA. Footer mirrors, plus a "Kincaid Wolstein family" column linking kwvrs.com and kwlcp.com.

## 6. Server

`server.js` unchanged except: `API_ROUTES` drops `/api/life-expectancy`; `CANONICAL_HOST` default `kweconomics.com`; lead-mailer subject/sender defaults read `ORG_NAME`. No redirect map for the old site's URLs (explicit decision).

## 7. Environment & deploy

Dockerfile and `railway.json` unchanged. Same env table as kwlcp with `CANONICAL_HOST=kweconomics.com`, `LEAD_FROM` default `KW Economics <info@kwvrs.com>` (kweconomics.com must be verified in Resend before this moves), `LEAD_RECIPIENTS` default `info@kwvrs.com`. Build args `VITE_TURNSTILE_SITE_KEY` / `VITE_GA_MEASUREMENT_ID` default empty (new keys; none carried from any sister site).

Node 22 for local work. Local `docker build && docker run` smoke before every push to `main`.

## 8. SEO & scale

- Prerender/sitemap gating unchanged (`SERVICE_CITY_PRERENDER_TOP = 10`, `SERVICE_CITY_SITEMAP_TOP = 5` + metro cities, crawl-budget ceiling 3,600 in `sitemap-services.xml`).
- Expected volume: 11 × 56 = 616 service-state; ~5,800 service-city prerendered; 802 city; 56 state; 14 × 56 = 784 case-type-state; 4 × 56 = 224 credential-state; ~130 editorial/hub/core. ≈8.5k prerendered.
- `llms.txt` regenerated from economics data — `generate-llms.mjs` prose rewritten, no inherited physician/CLCP claims.
- `gsc-audit` workflow stays removed until a kweconomics.com GSC property exists.

## 9. Testing

- Carry over the full vitest suite; delete `tools-indexing.routes.test.mjs` and the life-expectancy API test with their features.
- Retune counts/keys: `services.test.ts` (13 entries, 11 pillars, 2 non-pillars with external URLs), `services.pillar.test.ts`, `caseTypes.test.ts` (14), `credentials.test.ts` (4), `team.test.ts` / `team.tiers.test.ts` (2), `App.routes.test.mjs`, `sitemap` tests, `references.test.ts`, `editorial.test.ts`, `narratives.parity`.
- Guards: `brand-strings.test.mjs` uses the new `LEGACY_BRAND_PATTERN`; add a vocabulary guard that fails on `vocational evaluation|transferable skills|labor market survey|life care planner|CLCP|CNLCP` in page/data copy outside `CrossSell.tsx`, `brand.ts`, and the `life-care-plan-cost-projection` service entry.
- Keep as safety net: `citations.routes.test.mjs`, `internal-links.render.test.tsx`, `contentReadiness.test.ts`, `geo-links.parity`, `sources-urls.test.ts`, `lead-mailer.test.mjs`, `server-contact.test.mjs`.

## 10. Delivery

Spec → implementation plan → subagent-driven task build. Push to `origin main` after each green milestone (tsc + eslint + vitest + build + Docker smoke). Railway service creation and DNS cutover are separate follow-ups on Chris's word.

## 11. Out of scope (v1)

Calculators/tools, redirects from the old kweconomics.com routes, DNS cutover, Railway service, GA4/GSC properties, Resend domain verification, final logo artwork, photography, intake/PSA/e-sign, payments.

## 12. Facts to confirm (tracked in README)

kweconomics.com mailbox and Resend-verified sender; NAFE/AAEFE membership status for Chris and Zach; Zach's title and states served; whether the firm markets business valuation and forensic accounting (fraud/tracing, divorce) under this brand and who signs those reports (valuation credentials); office NAP unchanged; GA4 + Turnstile keys; final wordmark; social handles.
