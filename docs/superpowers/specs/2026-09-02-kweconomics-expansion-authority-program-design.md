# KW Economics Expansion and Authority Program - Design Spec

**Date:** 2026-09-02
**Repo:** `cskerritt/kweconomic-website` (live on kweconomics.com since the 2026-08 cutover)
**Status:** approved in chat 2026-09-02 (Chris): replace the hero pull-quote, build the old-URL 301 map, weekly auto-merged PRs, prioritize editorial depth, service x case type x state, and federal district pages.

## 1. Goal

Grow kweconomics.com's indexable footprint and domain authority on a fixed weekly cadence without loosening the site's editorial rules. Each week a cloud routine opens one PR that adds a bounded, tested, sitemap-gated wave of pages, runs the full gate, merges it, and confirms the Railway deploy. Chris reviews outcomes, not diffs.

Two things are already true and shape the program:

- The old site's 22,418 sitemap URLs (22 old service slugs x 56 states x ~18 cities, plus `/<state>` and `/<state>/<city>`) now return 404 on the new site. Inbound links and indexed equity are draining every day until a 301 map ships.
- `www.kweconomics.com` does not resolve. Any link that used the www form is dead.

## 2. Program shape

| Item | Decision |
|---|---|
| Cadence | Weekly. One PR per wave, Monday 06:00 America/New_York (10:00 UTC). |
| Executor | A scheduled cloud routine (claude.ai/code/routines) running against `cskerritt/kweconomic-website`, prompt in section 8. |
| Merge policy | Auto-merge (`gh pr merge --squash --delete-branch`) once the routine's own gate is green. `main` is unprotected and `allow_auto_merge` is off on the repo, so the routine merges directly after its checks; no GitHub Actions exist and none are added. |
| Gate | `npx tsc -b && npx eslint . && npx vitest run && npm run build`, then the routine curls the shell count from the build log and a sample of the new URLs from `dist/`. Docker smoke is skipped in the cloud (no daemon); the routine instead polls `https://kweconomics.com/healthz` and 3 new URLs after merge until Railway reports the new build (up to 15 minutes), and reopens the PR as a revert if the deploy fails. |
| Work list | `docs/superpowers/plans/2026-09-02-kweconomics-expansion-authority-program.md` holds the ordered wave list with a checkbox per wave. The routine takes the first unchecked wave whose `not-before` date has passed, and ticks it in the same PR. |
| Model | Fable (`claude-fable-5-1`) per Chris's standing directive; fall back to Opus 5 if the routine API rejects it. |

## 3. Wave 0 - authority repair (ships from this session, not the routine)

### 3.1 Old-URL 301 map (`server.js`)

Pattern redirects, evaluated before the static file lookup, GET/HEAD only, 301 with `Cache-Control: no-cache`, query dropped (the old site had no meaningful query routes). Table lives in `lib/legacy-redirects.server.mjs` so the runtime image carries it without `scripts/` or `src/`.

| Old pattern | New target |
|---|---|
| `/services/<old-service>/<state>/<city>` | `/services/<pillar>/<state>/<city>` when the city exists in the new city data, else `/services/<pillar>/<state>` |
| `/services/<old-service>` | `/services/<pillar>` |
| `/<state>/<city>` (56 state slugs, old city slugs) | `/locations/<state>/<city>` when the city exists, else `/locations/<state>` |
| `/<state>` | `/locations/<state>` |
| `/experience`, `/team` | `/team` (`/team` already exists; `/experience` 301s) |
| `/advisory`, `/calculators`, `/calculators/*`, `/tools/*` | `/services` |
| `/emergency-consultation` | `/contact` |
| `/search` | `/` |
| `/blog/*`, `/knowledge/*` (unknown slugs) | `/insights`, `/knowledge` |
| `/case-types/<old-slug>` | `/case-types/<new-slug>` via a slug alias table, else `/case-types` |
| The 14 old legacy prefixes (`/forensic-economist/*`, `/economic-damages/*`, `/lost-earnings/*`, `/present-value/*`, `/business-damages/*`, `/commercial-damages/*`, `/wrongful-death-damages/*`, `/business-valuation/*`, `/expert-witness/*`, `/practice-areas/*`, `/vendor/*`) | Their pillar page (`/services/<pillar>`) or `/services` |
| `/vocational-expert/*`, `/disability-evaluation/*`, `/services/vocational-evaluation/*` | `https://kwvrs.com/` (external, sister practice) |
| `/life-care-planner/*`, `/services/life-care-planning/*` | `https://kwlcp.com/` (external) |

Old service slug to pillar mapping (the 22 old slugs):

| Old slug | New pillar |
|---|---|
| economic-loss-assessment, expert-testimony, labor-economics-consulting, labor-market-employment-studies, econometrics-data-science, finance-investment-economics | lost-earnings-and-earning-capacity |
| business-valuation | business-valuation |
| business-consulting, cost-benefit-roi-analysis, pricing-strategy, market-analysis-forecasting, economic-impact-studies | lost-profits-and-commercial-damages |
| health-economics | life-care-plan-cost-projection |
| public-policy-analysis, program-evaluation, regulatory-impact-assessments, education-economics, international-development-economics | `/services` (no pillar equivalent) |
| vocational-evaluation, disability-evaluation | kwvrs.com |
| life-care-planning | kwlcp.com |

Tests: `lib/legacy-redirects.server.test.mjs` pins every row above with at least one old URL taken verbatim from the old sitemap (`~/Documents/New project/KWEconomics/public/sitemap.xml` is copied into `test/fixtures/legacy-sitemap-sample.txt`, 300 sampled URLs, every one must resolve to a 301 whose target is a prerendered shell or one of the two sister domains). A guard asserts no new-site route is shadowed by a redirect rule (every URL in `sitemap.xml` still serves 200 through the redirect layer).

### 3.2 www and canonical host

- Chris adds `www.kweconomics.com` as a Railway custom domain on the `kweconomic-website` service and a CNAME at the registrar. `CANONICAL_HOST=kweconomics.com` is already the mechanism that 301s it to apex. This is a manual step; the routine cannot do it.
- The routine's first run verifies `curl -sI https://www.kweconomics.com` returns 301 to apex and logs a warning in the PR body if it does not.

### 3.3 Discovery

- `npm run indexnow` after each merge (routine sets `INDEXNOW_KEY` from the repo secret; the key file already ships in `public/`).
- GSC: Chris creates a URL-prefix property for `https://kweconomics.com/` and submits `sitemap.xml`. Manual.

## 4. Content families

All families follow the site's standing rules: objective tone for plaintiff and defense, hyphens only (no em dashes), no statistic or case-count claims, no membership claims for NAFE or AAEFE, citation-free prose with sources routed through `src/data/references.ts`, no vocational or life-care-planning vocabulary outside the carve-outs, `LEGACY_BRAND_PATTERN` clean. Every new page carries: title 50-60 chars, description 140-160 chars, one H1, a definition or direct-answer block in the first 300 words, a FAQ block with `FAQPage` JSON-LD where the page answers questions, `Article` JSON-LD with `author` (Christopher Skerritt) and `dateModified` on editorial pages, breadcrumbs, and at least 3 contextual internal links out and 1 in from an existing hub.

### 4.1 Editorial depth (weekly, every wave)

Each wave adds 2 guides, 1 method explainer, 1 comparison, and 1 insight post from the backlog in the plan file (40 seeded topics, section 6). Word floors as pinned by `editorial.test.ts` (guides and knowledge 400+, methods and comparisons 250+; new pieces target 900-1,400 words). Each piece must add at least one new `references.ts` entry or reuse two existing ones, and must link to the pillar it serves and to one geo page.

### 4.2 Service x case type x state (4 waves)

New route `/services/:serviceSlug/case/:typeSlug/:stateSlug` rendered by a `ServiceCaseTypeState` template that composes the existing `ServiceCaseType` body with the state's damages rules (`regulations/state-regs.ts`), court system (`courts/state-courts.ts`), and state labor context. Pairs are restricted to `service.caseTypes` (the existing 154 all-pairs grid is left alone as the hub tier, but the new state tier only exists for the declared pairs). Count: 56 declared pairs x 56 = 3,136 pages, rolled out in 4 state batches of 14 (largest metros first). Prerendered in full; sitemap includes them all (new `sitemap-service-case-types.xml`, ceiling test pinned at 3,300 for that file). Internal links: from `ServiceCaseType`, from `CaseTypeState`, and from `ServiceState`.

### 4.3 Federal district court pages (1 wave)

New route `/jurisdictions/federal/:districtSlug` from `stateCourts[].federalDistricts` (94 districts, slug from the district name). Content per page: the district's seat and divisions, how expert disclosure and Rule 26 reports are handled in federal practice generally (citation-free; the rule text is a `references.ts` entry), which pillar services are most often retained in federal matters, links to the state hub, the state's case-type pages, and the parent circuit. `JurisdictionsHubPage` gains a federal districts section grouped by circuit. Prerendered and added to `sitemap-locations.xml`.

### 4.4 Off-page (not selected for the routine; listed for completeness)

Sister-site links from kwvrs.com and kwlcp.com footers, directory listings, association listings. These live in other repos and in Chris's accounts; out of the routine's scope.

## 5. Calendar

| Week (Mon) | Wave | Adds |
|---|---|---|
| 2026-09-02 | 0 | 301 map, www check, IndexNow (this session) |
| 2026-09-07 | 1 | Editorial batch 1 + federal district pages (94) |
| 2026-09-14 | 2 | Editorial batch 2 + service x case type x state batch A (14 states) |
| 2026-09-21 | 3 | Editorial batch 3 + batch B |
| 2026-09-28 | 4 | Editorial batch 4 + batch C |
| 2026-10-05 | 5 | Editorial batch 5 + batch D |
| 2026-10-12 onward | 6+ | Editorial batches until the backlog is empty, then the routine opens an issue asking for topics and stops merging |

## 6. Editorial backlog (seed, 40 topics)

Guides: how worklife expectancy is chosen; fringe benefits in a lost earnings claim; personal consumption in wrongful death; valuing a homemaker's services; mitigation in employment cases; front pay versus reinstatement; lost profits for a new business; goodwill in a divorce valuation; discounts for lack of marketability; tracing commingled funds; reading an opposing economist's report; what an economic damages report costs and why; when to retain an economist in a medical malpractice case; economic damages for a minor plaintiff; damages for an undocumented worker; damages for a self-employed plaintiff; life expectancy adjustments after injury; hedonic damages and why they are not an economic calculation; prejudgment interest in damages; taxes in lost earnings claims.

Methods: personal consumption tables; earnings growth rate selection; the total offset method; the below-market discount rate; the age-earnings profile; capitalization of earnings; the discounted cash flow method for valuation; the yardstick and before-and-after methods for lost profits; net discount rate sensitivity; life expectancy tables.

Comparisons: back pay versus front pay; lost earnings versus lost earning capacity in workers' compensation; lost profits versus diminished business value; fair value versus fair market value in shareholder disputes; economist versus forensic accountant on lost profits; gross versus net earnings; present value versus total offset; nominal versus real discount rates; wrongful death versus survival damages; income approach versus market approach.

Insights: 10 short pieces on what a specific record adds to a claim (W-2s, tax returns, pay stubs, union contracts, benefit summaries, business tax returns, general ledgers, bank statements, QuickBooks exports, personnel files).

## 7. Testing

- Existing suite stays green; the routine never edits a guard test to make it pass, only adds tests.
- New per-family tests: route registration in `App.routes.test.mjs`, prerender count pins, sitemap ceilings, render tests for each new template (H1, definition block, FAQ schema, breadcrumbs, internal links), `off-brand-copy` and `LEGACY_BRAND_PATTERN` on the new copy, and `prerender-meta.test.mjs` parity for the new shells.
- Editorial pieces: word floor, at least one registry source, no em dashes, no numerals-as-claims regex (`/\d+\+ (cases|years|firms)/i`).

## 8. Routine prompt (summary; the full prompt is in the routine itself)

Clone the repo, read this spec and the plan file, pick the first unchecked wave whose date has passed, create branch `wave/<n>-<slug>`, implement it following the family recipe, run the gate, open the PR with the build's page count table in the body, merge on green, poll production, tick the wave, run IndexNow. If the gate fails after two fix attempts, leave the PR open and unmerged with the failure output in the body and stop.

## 9. Out of scope

Calculators, DNS changes, GSC property creation, sister-site edits, paid link building, any page that names a client or a case, any membership claim.
