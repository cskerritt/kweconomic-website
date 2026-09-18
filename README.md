# KW Economics (kweconomics.com)

Marketing and lead-capture site for **KW Economics**, the forensic economics, forensic accounting, and business valuation practice of the Kincaid Wolstein family of expert practices (legal line: Kincaid Wolstein Economics). Economics only: 11 pillar services (lost earnings and earning capacity, wrongful death economic loss, personal injury economic damages, household services, life care plan cost projection, employment and wage-loss damages, business valuation, lost profits, fraud and asset tracing, divorce and marital financial analysis, expert rebuttal), 14 case types, and 4 credential pages across 56 states and territories and 802 metros, pre-rendered to static head-only HTML shells and served by a dependency-free Node server with a contact/lead API. Copy is written from the economist's standpoint (what the loss claim consists of, which records drive it, how the number is built), citation-free, hyphens only, with sources routed through `src/data/references.ts`.

Sister practices are linked, never duplicated: vocational work hands off to kwvrs.com and life care plan authorship to kwlcp.com. `src/lib/brand.ts` is the only place those URLs are spelled (`scripts/lib/site.mjs` and `lib/brand.server.mjs` mirror the brand constants for the build scripts and the runtime image), and `src/components/CrossSell.tsx` is the one component allowed to describe that work. The two `pillar: false` entries in `services.ts` resolve as short noindex cards that link out and are excluded from every enumeration, sitemap, and prerender.

## Local development

```bash
export PATH=~/.local/node/node-v22.22.0-darwin-arm64/bin:$PATH   # Node 22 (Node 25 npm is broken on this machine)
npm ci
npm run dev        # Vite dev server with HMR
npm run build      # sitemaps -> llms.txt -> extra sitemaps -> tsc -> vite build -> prerender (writes dist/)
npm test           # vitest (unit + guard tests; the sitemap-to-dist coverage check needs dist/ from a prior build)
npm run lint       # eslint .
npm run preview    # serve the vite build without the prerendered shells
```

Full gate before pushing: `npx tsc -b && npx eslint . && npx vitest run && npm run build`, then the Docker smoke below.

Other scripts: `generate:sitemaps`, `generate:llms`, `images:webp` (needs `cwebp`), `indexnow` (submits sitemap URLs; set `INDEXNOW_KEY`, optional `INDEXNOW_HOST`).

## Production

`node server.js` serves `dist/` (prerendered shells + assets), the three API routes (`/api/contact`, `/api/consultation`, `/api/whitepaper`), and `/healthz`. No framework; `http` module only. Lead delivery is `lib/lead-mailer.server.mjs` (Resend): the team notice is `[KW Economics] New <type> inquiry - <name>`, and consultation requests also get a visitor acknowledgement signed KW Economics.

| Var | Required | Purpose |
|---|---|---|
| `PORT` | Railway | Listen port, default `3000` |
| `CANONICAL_HOST` | yes, at DNS cutover | `kweconomics.com`; every other hostname (www, the `*.up.railway.app` domain) 301s to it. Read from the environment on purpose: unset or empty means no redirect, so a staging deploy is reachable on its Railway URL before DNS points at it. The startup log prints whether the redirect is on |
| `LEAD_RECIPIENTS` | yes | Comma list for lead notifications; default `info@kwvrs.com` until a kweconomics.com mailbox exists |
| `LEAD_FROM` | yes | Resend sender, `Name <addr>` form; default `KW Economics <info@kwvrs.com>` (`lib/lead-mailer.server.mjs`). kweconomics.com must be a verified Resend domain before this moves |
| `RESEND_API_KEY` | prod | Lead email delivery; unset = leads are logged and stored, not emailed |
| `VITE_TURNSTILE_SITE_KEY` | prod (build arg) | Cloudflare Turnstile widget; baked in at `vite build` |
| `TURNSTILE_SECRET_KEY` | prod | Server-side Turnstile verification |
| `TURNSTILE_REQUIRE_TOKEN` | optional | `"true"` rejects submissions with no token (default: soft-fail, quarantined) |
| `VITE_GA_MEASUREMENT_ID` | optional (build arg) | GA4 property for the new domain; empty = no analytics tag. When set, analytics is still never loaded for GPC / Do Not Track browsers or after the `/privacy` opt-out (`src/lib/analytics.ts`), and `/privacy` describes the GA cookies |
| `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | optional | Durable raw-submission capture (`lib/raw-submissions.server.mjs`); unset = JSONL only |
| `RATE_LIMIT_MAX` | optional | Contact-API requests per minute per IP, default `10` |

Build args `VITE_TURNSTILE_SITE_KEY` and `VITE_GA_MEASUREMENT_ID` default to empty; no keys are carried over from either sister site.

### Legacy redirects

`lib/legacy-redirects.server.mjs` is the 301 map from the retired kweconomics.com routes (the previous site's 22,418 sitemap URLs: 21 old service slugs by state and city, bare `/<state>` and `/<state>/<city>` pages, `/experience`, `/calculators`, `/tools`, `/blog`, and the keyword prefixes such as `/lost-earnings/*`). Old service and geo routes resolve to the closest pillar, state, or city page that actually has a prerendered shell in `dist/` (checked at request time, so a redirect never lands on a 404); vocational and life-care-planning routes go to the sister sites. The map runs after host and trailing-slash canonicalization, GET/HEAD only. `lib/legacy-redirects.server.test.mjs` pins every rule and replays `test/fixtures/legacy-sitemap-sample.txt` (307 URLs sampled from the old sitemap).

## Deployment

Railway, Dockerfile builder (`railway.json`): multi-stage `node:22-alpine` image runs the full `npm run build` then copies `dist/` (which already contains `public/`), `server.js`, `validation.server.mjs`, `turnstile.server.mjs`, and `lib/` into the runtime stage (never `scripts/` or `src/`, which is why the runtime brand literals live in `lib/brand.server.mjs`). Healthcheck `GET /healthz` returns JSON with the mail/turnstile/durable-capture readiness flags. Standing rule: `docker build && docker run` locally before pushing to `main`:

```bash
docker build -t kweconomics .
docker run --rm -d -p 3200:3000 -e CANONICAL_HOST= -e LEAD_RECIPIENTS=test@example.com --name kweconomics kweconomics
curl -s localhost:3200/healthz
curl -s -o /dev/null -w "%{http_code}\n" localhost:3200/services/lost-earnings-and-earning-capacity/new-jersey/hackensack
docker stop kweconomics
```

Railway service creation and the DNS cutover are separate follow-ups on Chris's word (spec sections 10 and 11). There is no redirect map from the old kweconomics.com routes by design.

## Page inventory

From `npm run build` at this commit (9,463 prerendered `index.html` shells):

| Family | Pages |
|---|---|
| Core pages (fixed routes, hubs, case-type and credential hubs, methods, team profiles) | 50 |
| Service pillar pages | 11 |
| Knowledge guides | 2 |
| Insight posts | 4 |
| Guide pages | 17 |
| Comparison pages | 10 |
| State pages | 56 |
| City pages | 802 |
| Service x State | 616 |
| Service x State x City | 5,797 |
| Case-type x State | 784 |
| Credential x State | 224 |
| Federal district court pages (`/jurisdictions/federal/<district>`) | 94 |
| Service variant (cost/process/timeline) | 33 |
| Service x Case-type (declared pairs only) | 60 |
| Service x Case-type x State (`/services/<pillar>/case/<case-type>/<state>`, declared pairs x released state batches) | 840 |
| Attorney journey (4 stage indexes + 4 x 14) | 60 |
| White paper (hub + 2) | 3 |
| **Total** | **9,463** |

Sitemap index `public/sitemap.xml` (6 children + image sitemap; `news-sitemap.xml` is generated, listed in the index, and declared in robots.txt only while an insight post is inside the two-day Google News window), `<loc>` counts:

| File | URLs |
|---|---|
| `sitemap-core.xml` | 123 |
| `sitemap-services.xml` | 3,746 (hub 1 + 11 pillars + 33 variants + 60 declared service x case pairs + 616 service x state + 3,025 gated city combos; the test ceiling is 4,000, see build notes) |
| `sitemap-service-case-types.xml` | 840 (60 declared service x case-type pairs x the 14 released states of batch A; `src/data/serviceCaseTypeStates.ts`; the test ceiling is 3,400 for the full 60 x 56 rollout) |
| `sitemap-locations.xml` | 954 (the `/locations` subtree plus the `/jurisdictions` hub and the 94 federal district pages) |
| `sitemap-case-types.xml` | 799 |
| `sitemap-credentials.xml` | 229 |
| `image-sitemap.xml` | 7 |
| `news-sitemap.xml` | written only for posts published in the last two days (1 at the 2026-09-14 build; the next build after the window removes it) |

Service x State x City pages are prerendered for the top slice of each state's cities (`SERVICE_CITY_PRERENDER_TOP = 10`, 5,797 pages) but only the content-ready subset is advertised in the sitemap (`SERVICE_CITY_SITEMAP_TOP = 5` plus prerendered cities with metro labor data, `src/data/contentReadiness.ts`; 3,025 combos). T08 decision (2026-09-05): the gate stays, on all three KW sites. The 2,772 gated combos the audit listed are prerendered, linked from the Service x State "Cities" grid, self-canonical, and indexable; they are simply not advertised until Search Console evidence supports widening (see "Facts to confirm"). `scripts/sitemap-index.test.mjs` pins the sitemap to the prerender list so no advertised URL is a 404, pins the gate constants, and, after a build, checks that the only shells the sitemap leaves out are the gated combos. Service x case-type pages exist only for the pairs a pillar declares in `services.ts` (`serviceCaseTypePairs()`); an undeclared pair's address 301s to the pillar (`lib/service-case-redirects.server.mjs`). `public/llms.txt` and `public/llms-full.txt` are regenerated from the data files on every build.

## Content model (`src/data`)

| File | Holds |
|---|---|
| `services.ts` | 13 service entries; 11 `pillar: true` get routes, sitemap entries, and shells; `vocational-evaluation` and `life-care-planning` are `pillar: false` cross-sells with an `externalUrl` to the sister practice's verified service page (`VOC_SERVICE_URL`, `LCP_SERVICE_URL` in `brand.ts`). Every entry carries `cost`, `process` (4+ steps), `timeline` (3+ phases), `keywords`; the lost earnings, household services, life care plan costing, and divorce pillars carry a `handoff` (the explained referral to the sister practice, rendered under the pillar hero) |
| `caseTypes.ts` | 14 case types with `lossComponents`, `damagesExposure`, `economicImpact`, related pillars, FAQs, sources; the divorce entry carries a `framing` block (title stems, H1s, descriptions, lead, section headings, framework paragraph) that the hub and state templates and the shells read through the `caseType*` helpers in place of the shared economic-damages strings |
| `intake.ts` | Where an inquiry goes (the shared intake inbox) and the /about sister-practices section; one module for the contact form, the consultation form, /about, the privacy policy, and their shells |
| `credentials.ts` | 4 credentials (`forensic-economist`, `nafe-member`, `aaefe-member`, `graduate-economics-degree`); membership pages carry `expertSlugs: []` and describe the association, never the roster |
| `team.ts` | 2 members: Christopher Skerritt (leadership, senior expert tier) and Zachary Sperling (support); background credentials listed as background; `analysisResponsibility()` builds the "directed by" line the pillar, service x geo, and place pages print (`ResponsibilityLine.tsx` + the shells) |
| `states.ts` | 56 states, DC, and territories: slug, region, courts and regulation pointers |
| `cities/*.ts` | One file per state (56) listing that state's metros (802 total); `cities/index.ts` aggregates |
| `contentReadiness.ts` | Prerender vs. sitemap gating constants for service x state x city (`SERVICE_CITY_PRERENDER_TOP = 10`; `SERVICE_CITY_SITEMAP_TOP = 5` plus metro-labor cities); the gate is current policy by the T08 decision of 2026-09-05, see "Facts to confirm" |
| `local-content.ts` | 10 hand-written local essays for first-hand markets: the New York, Virginia, and Massachusetts state pages plus New York City, Brooklyn, Newark, Hackensack, Jersey City, Los Angeles, and Houston |
| `geo-prose.mjs` | Templated state/city prose (wage levels, cost of living, local labor markets, venue) shared by the React pages and `scripts/prerender.mjs`; `geo-prose.d.mts` types it |
| `geographicFaqs.ts`, `narratives.ts` | Thin React wrappers over `geo-prose.mjs`; `narratives.parity.test.mjs` pins the two sides |
| `methods.ts` | 10 methodology explainers (present value, worklife expectancy, wage growth, fringe benefits, household services, valuation approaches, lost profits but-for analysis, mitigation and offsets, personal consumption deduction, earnings growth rate selection) |
| `guides.ts` | 17 attorney guides |
| `comparisons.ts` | 10 side-by-side comparisons (including economist vs. forensic accountant, vs. vocational expert, vs. life care planner, back pay vs. front pay, lost earnings vs. earning capacity in workers' compensation) |
| `knowledge.ts`, `insights.ts`, `whitePapers.ts` | 2 knowledge guides, 4 insight posts (Legal, Economics, Records), 2 email-gated white papers |
| `journeys.ts` | 56 attorney journey stages (considering, retaining, preparing-deposition, trial x 14 case types) |
| `faqs.ts`, `home-faqs.mjs` | 15-question site FAQ and the 6-question homepage FAQ (shared with the prerender and the FAQPage JSON-LD) |
| `references.ts` | 30-entry citation registry (NAFE ethics statement, Journal of Forensic Economics, BLS series, worklife tables, Treasury yields, AICPA SSVS No. 1, NACVA, federal rules); the only path for sources |
| `regulations/state-regs.ts`, `courts/state-courts.ts` | Per-state expert-testimony rules and court systems |
| `serviceCaseTypeStates.ts` | The release plan for the service x case type x state family (`STATE_BATCHES`, four batches of 14 states in crawl-priority order, `released` flipped one batch per wave; `releasedStates()`, `declaredPairs()`, `isReleased()`, `serviceCaseStatePath()`); `ServiceCaseTypeState.tsx` renders `/services/<pillar>/case/<case-type>/<state>` for any declared pair in any state, and the prerender, the sitemap child `sitemap-service-case-types.xml`, and the "by state" grids on the pair and case-type x state pages follow the released set. Title from `serviceCaseStateTitle` (`page-titles.mjs`), description from `serviceCaseStateDescription` (`service-prose.mjs`) |
| `courts/federal-districts.ts` | The 94 federal district courts derived from `state-courts.ts` (slug, reporter abbreviation, state, circuit); `FederalDistrict.tsx` renders one page each under `/jurisdictions/federal/`, the jurisdictions hub groups them by circuit, and the prerender and sitemap load the same module |
| `labor/*.ts` | State and metro labor context (never rendered as rates or wage figures in prose) |
| `types.ts` | Shared TS types |

Brand identity lives in `src/lib/brand.ts`; `scripts/lib/site.mjs` (build scripts) and `lib/brand.server.mjs` (runtime image) mirror it and `scripts/site-brand-parity.test.mjs` pins all three. Guards: `src/brand-strings.test.mjs` fails on any sister-brand form (`LEGACY_BRAND_PATTERN`) outside `brand.ts` / `CrossSell.tsx` and on either sister domain in scripts, server, or public text; `src/pages/off-brand-copy.test.mjs` fails on vocational or life-care-planning vocabulary in page, component, or data copy outside the carve-outs (`team.ts`, the `life-care-plan-cost-projection` service, the two sister-discipline comparisons); `src/pages/credential-claims.render.test.tsx` fails on any firm-level or named-person membership claim; `scripts/prerender-meta.test.mjs` pins every static shell's title/description to the React page and fails on sister-practice phrasing in the shell text; `src/data/sources-urls.test.ts` keeps every source URL well-formed `https://`; `src/components/layout/nav.pillars.test.mjs` pins the header/footer service links to `pillarServices()` order.

## Facts to confirm

Spec section 12, tracked here until Chris confirms each:

- [ ] kweconomics.com mailbox and Resend-verified sender: `ORG_EMAIL`, `LEAD_FROM`, and `LEAD_RECIPIENTS` all default to `info@kwvrs.com`; move them once the mailbox exists and the domain is verified in Resend.
- [ ] NAFE/AAEFE membership status for Chris and Zach: the membership pages (`credentials.ts`, `expertSlugs: []`) describe the associations and name no member; `llms.txt` says the same. Add slugs to `expertSlugs` only once membership is confirmed.
- [ ] Zach's title and states served: `team.ts` carries "Economics Associate / Expert Liaison" and NJ, NY from the kwvrs.com roster.
- [ ] Whether the firm markets business valuation and forensic accounting (fraud/tracing, divorce) under this brand and who signs those reports (valuation credentials): `business-valuation`, `lost-profits-and-commercial-damages`, `fraud-and-asset-tracing`, and `divorce-and-marital-financial-analysis` are live pillars. Since the 2026-09-05 audit (C02) every pillar, service x geo, and place page prints "<work> is directed by Christopher Skerritt, M.Ed., MBA, Chief of Economic Services, who is available to testify to it" (`team.ts analysisResponsibility()`), the fact /about and the associate's profile already state; confirm it holds for the valuation and tracing pillars and whether a valuation or accounting designation should be named or its absence stated.
- [ ] Counsel review of the inquiry-routing wording (audit F06): the contact form, the consultation form, /about, and the privacy policy's "Information Sharing" section all say inquiries reach an intake inbox shared with the affiliated vocational and life care planning practices (`src/data/intake.ts`). Since the 2026-09-18 privacy pass the form note no longer says inquiries "are not shared outside that family" (the hosting and email vendors carry every inquiry); it says they are not sold or shared for marketing and points to the policy's "Service Providers and Information Sharing" section; the previous form note ("We do not share inquiries with third parties") described routing that did not match `ORG_EMAIL`. Confirm the wording and whether the privacy policy's effective date should move.
- [ ] The jurisdictions list on `/team/christopher-skerritt`: the biography now says the states are those in which he has served retaining counsel (experience, not licensure); confirm, and reconcile the credential subset shown here with the kwvrs.com and kwlcp.com profiles (all three resolve; not compared line by line).
- [ ] T08 (audit, P1), decision 2026-09-05: the crawl-budget gate stays (`SERVICE_CITY_SITEMAP_TOP = 5`, `SERVICE_CITY_PRERENDER_TOP = 10`, the same on all three KW sites). The 2,772 service x city combos the audit listed stay prerendered, internally linked, self-canonical, and indexable; they are not advertised in the sitemap. Widening = set `SERVICE_CITY_SITEMAP_TOP` to 10 in `src/data/contentReadiness.ts` and raise the services child ceiling in `scripts/sitemap-index.test.mjs` to 7,000 in the same change. Evidence needed first: Search Console page-indexing coverage and impressions for gated vs advertised combos over 4-6 weeks after deploy.
- [ ] Office NAP unchanged: `OFFICES` in `brand.ts` carries the Hackensack, NJ and Richmond, VA records from kwlcp.
- [ ] Counsel review of the privacy policy (rewritten 2026-09-18 as a draft, `src/data/legal-policies.ts`): the 45-day response commitment, the retention wording (no fixed period is set and nothing is deleted automatically), the health-information paragraph (nothing is asserted about HIPAA status), and the marketing follow-up sentence. The Google Analytics and Cloudflare Turnstile statements render from the build flags, so setting either build arg changes `/privacy` with it; the optional Supabase submission store is not named and must be added to the provider list before it is enabled.
- [ ] GA4 + Turnstile keys: `VITE_GA_MEASUREMENT_ID`, `VITE_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` are empty; new keys, none carried from a sister site.
- [ ] Final wordmark: `public/images/logo.svg` / `logo.png` is a text lockup, not final art; favicons are navy and gold.
- [ ] Social handles: `sameAs` lists only the sister sites.

## Build notes and decisions (Task 11)

- `CANONICAL_HOST` stays environment-driven (`process.env.CANONICAL_HOST || ""`), the same as both sister sites, with `kweconomics.com` documented as the production value and echoed in the startup log. A hard-coded default would 301 the Railway staging URL to a domain that does not point at it yet, and would break the local Docker smoke (which passes `-e CANONICAL_HOST=`) and the server tests.
- The `sitemap-services.xml` crawl-budget ceiling in `scripts/sitemap-index.test.mjs` is 4,000 (kwlcp pinned 3,600 for 10 pillars). With 11 pillars, the 60 declared pairs, and the gate kept (`SERVICE_CITY_SITEMAP_TOP = 5` plus metro-labor cities; the T08 decision of 2026-09-05, see "Facts to confirm") the child holds 3,746 URLs, so the ceiling is pinned just above the real count, as the twin sites do. Widening the gate to the whole prerender window would add the 2,772 gated combos (6,518 in the child) and must raise the ceiling to 7,000 in the same change. Every child also stays under the sitemaps.org limits (50,000 URLs / 50 MB).
- 2026-09-05 audit repairs, both render paths: the divorce case type's `framing` block reaches the title, H1, description, lead, section headings, framework block, local FAQ, and Service node (F08, 57 pages); the commercial and family-financial service x state shells print a category-specific legal context (no tort or workers' compensation forum) and their city shells a place paragraph without the hub's "economic damages analyses" opener (F09); the editorial byline labels its date "Updated" and a named byline alone says "Reviewed", and the pillar, service x geo, and place pages name the directing economist with a profile link (C02); the cost/process/timeline pages and the attorney stage indexes carry a References block, the stage indexes the shared reviewer byline (C04); the sister hand-off links point at the verified `kwvrs.com/services/vocational-expert` (the `/services/vocational-evaluation` alias answers 404); `server.js` answers 410 for a sitemap address with no file on disk (the retired news sitemap).
- The four editorial shells with a named reviewer (`/knowledge/*`, `/insights/*`) print the byline "Christopher Skerritt, M.Ed., MBA, CRC, CLCP, MSCC", exactly as the React `AuthorByline` does (top three `team.ts` credentials not already in the name). The prerender mirrors the hydrated page on purpose; if the economics site should not surface CRC/CLCP/MSCC in bylines, the fix is to trim or reorder `credentials` in `team.ts`, not the shell.
- `package.json` `name` is still `kwlcp-website` (lockfile-coupled metadata; no runtime effect).

## Expansion program (weekly waves)

`docs/superpowers/specs/2026-09-02-kweconomics-expansion-authority-program-design.md` and the plan beside it drive one auto-merged wave per week (a cloud routine, Mondays 10:00 UTC). Wave 1 (2026-09-07) added the federal district court family and the first editorial batch. Wave 2 (2026-09-14) added the service x case type x state scaffold with state batch A (840 pages) and the second editorial batch. Every editorial piece cites the registry only; a new `references.ts` entry is added only when its URL can be live-verified from the build environment (the cloud egress policy blocks irs.gov, eeoc.gov, law.cornell.edu, and uscourts.gov, so wave 1 reused existing entries instead).

## Related repos

- **kwlcp-website** (`~/Documents/New project/kwlcp-website`, kwlcp.com) is the structural upstream: this repo started as a byte-identical import of its commit `b1e643c` (2026-08-26) and swapped the data layer, brand constants, copy, and tests. Fixes to shared mechanics (prerender, sitemap gating, server hardening, lead mailer) should be considered for all three sites.
- **kwvrs-site** (`~/Documents/New project/kwvrs-site`, kwvrs.com) is kwlcp's upstream and the source of the team roster copy.
- The old `cskerritt/kweconomics` site and the legacy tagonline build are not a source for anything here: no code, copy, routes, or redirects are carried from them.

## Stack

Vite + React 19 + TypeScript + Tailwind CSS 4. Dependency-free Node `http` server. Deployed on Railway via Docker.
