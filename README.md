# KW Economics (kweconomics.com)

Marketing and lead-capture site for **KW Economics**, the forensic economics, forensic accounting, and business valuation practice of the Kincaid Wolstein family of expert practices (legal line: Kincaid Wolstein Economics). Economics only: 13 pillar services (lost earnings and earning capacity, wrongful death economic loss, personal injury economic damages, household services, life care plan cost projection, employment and wage-loss damages, business valuation, lost profits, fraud and asset tracing, transfer pricing expert witness, intellectual property damages, divorce and marital financial analysis, expert rebuttal), 16 case types, and 4 credential pages across 56 states and territories and 802 metros, pre-rendered to static head-only HTML shells and served by a dependency-free Node server with a contact/lead API. Copy is written from the economist's standpoint (what the loss claim consists of, which records drive it, how the number is built), citation-free, hyphens only, with sources routed through `src/data/references.ts`.

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
| `SUBMISSION_PURGE_MODE` | optional (runtime) | Retention purge of the raw submission copies. Only the exact string `delete` deletes; unset or anything else = report-only (logs what it would delete, writes nothing). See "Submission retention" |
| `RATE_LIMIT_MAX` | optional | Contact-API requests per minute per IP, default `10` |

Build args `VITE_TURNSTILE_SITE_KEY` and `VITE_GA_MEASUREMENT_ID` default to empty; no keys are carried over from either sister site.

### Submission retention

`lib/submission-retention.server.mjs` purges the website's raw safety-net copies of form submissions, and nothing else: `data/submissions.jsonl` (time field `timestamp`, spam flag `_spam`) and, only when `PUBLIC_SUPABASE_*` are set, the Supabase `raw_submissions` table (time column `received_at`, spam flag `payload->_spam`). Spam-flagged records go once older than `SPAM_RETENTION_DAYS = 90`, everything else once older than `RAW_RETENTION_DAYS = 730`; a record exactly that old is kept. A jsonl line that is not valid JSON, or whose `timestamp` cannot be parsed, is never deleted and is counted as "undated". The pass runs ~60 s after server start and every 24 h after, on `unref()`'d timers, and is fail-soft.

Report-only by default: the deploy log prints `[retention] report: would delete <n> spam (>90d) and <m> raw (>730d); undated <u>; mode=report` and nothing is written or deleted. Setting `SUBMISSION_PURGE_MODE=delete` on the Railway service turns deletion on (`[retention] delete: deleted ...; mode=delete`). The jsonl rewrite goes to a temp file in `data/`, is fsynced, then renamed over the original; any error leaves the original untouched. It is synchronous on purpose, like `saveSubmission()`'s `appendFileSync`, so an append can never land between the read and the rename. The `/privacy` Retention section states the two periods and is only true while delete mode is on.

`node scripts/retention-report.mjs [--file <copy of submissions.jsonl>]` prints the report line once from a checkout. It does not read `SUBMISSION_PURGE_MODE` and cannot delete. (`scripts/` is not copied into the runtime image, so on Railway the report is the line in the deploy log.)

### Legacy redirects

`lib/legacy-redirects.server.mjs` is the 301 map from the retired kweconomics.com routes (the previous site's 22,418 sitemap URLs: 21 old service slugs by state and city, bare `/<state>` and `/<state>/<city>` pages, `/experience`, `/calculators`, `/tools`, `/blog`, and the keyword prefixes such as `/lost-earnings/*`). Old service and geo routes resolve to the closest pillar, state, or city page that actually has a prerendered shell in `dist/` (checked at request time, so a redirect never lands on a 404); vocational and life-care-planning routes go to the sister sites. The map runs after host and trailing-slash canonicalization, GET/HEAD only. `lib/legacy-redirects.server.test.mjs` pins every rule and replays `test/fixtures/legacy-sitemap-sample.txt` (307 URLs sampled from the old sitemap).

## Privacy requests

Handle a privacy request (access / correct / delete). The public policy (`/privacy`, `src/data/legal-policies.ts`) promises a reply within 45 days.

1. Requests arrive at `info@kwvrs.com` (`ORG_EMAIL` in `src/lib/brand.ts`, the address the policy prints). Owner: Chris Skerritt. Log the date received; the 45 days run from it.
2. Verify identity by replying to the address on file for that person. Do not act on a request from an address that does not match the record.
3. Where to search for this site: `data/submissions.jsonl` on the Railway service (one JSON line per form submission; match on `email`, `name`, `phone`), the Supabase `raw_submissions` table if durable capture is ever enabled (`lib/raw-submissions.server.mjs`; it is off in production today, `/healthz` reports `durableCapture: false`), the Resend logs for the lead notice and the consultation acknowledgement (`lib/lead-mailer.server.mjs`), and the `LEAD_RECIPIENTS` mailbox the notices land in. Anything that became an engagement lives in the practice systems, outside this repo; the kwvrs-site engineering guide has that procedure.
4. Do NOT delete anything tied to an engagement, an active or reasonably anticipated litigation matter, conflict-check history, or billing records. A request from an evaluee about a case file is routed through the retaining attorney.
5. Reply with what we hold, what was corrected or deleted, and what was kept and why.

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

From `npm run build` at this commit (13,989 prerendered `index.html` shells):

| Family | Pages |
|---|---|
| Core pages (fixed routes, hubs, case-type and credential hubs, methods, team profiles) | 58 |
| Service pillar pages | 13 |
| Knowledge guides | 2 |
| Insight posts | 9 |
| Guide pages | 27 |
| Comparison pages | 15 |
| State pages | 56 |
| City pages | 802 |
| Service x State | 728 |
| Service x State x City | 6,851 |
| Case-type x State | 896 |
| Credential x State | 224 |
| Federal district court pages (`/jurisdictions/federal/<district>`) | 94 |
| Service variant (cost/process/timeline) | 39 |
| Service x Case-type (declared pairs only) | 72 |
| Service x Case-type x State (`/services/<pillar>/case/<case-type>/<state>`, declared pairs x released state batches) | 4,032 |
| Attorney journey (4 stage indexes + 4 x 16) | 68 |
| White paper (hub + 2) | 3 |
| **Total** | **13,989** |

Sitemap index `public/sitemap.xml` (6 children + image sitemap; `news-sitemap.xml` is generated, listed in the index, and declared in robots.txt only while an insight post is inside the two-day Google News window), `<loc>` counts:

| File | URLs |
|---|---|
| `sitemap-core.xml` | 157 |
| `sitemap-services.xml` | 4,428 (hub 1 + 13 pillars + 39 variants + 72 declared service x case pairs + 728 service x state + 3,575 gated city combos; the test ceiling is 4,450, see build notes) |
| `sitemap-service-case-types.xml` | 4,032 (72 declared service x case-type pairs x all 56 states and territories, batches A to D released; `src/data/serviceCaseTypeStates.ts`; the test ceiling is 4,072) |
| `sitemap-locations.xml` | 954 (the `/locations` subtree plus the `/jurisdictions` hub and the 94 federal district pages) |
| `sitemap-case-types.xml` | 913 |
| `sitemap-credentials.xml` | 229 |
| `image-sitemap.xml` | 8 |
| `news-sitemap.xml` | written only for posts published in the last two days (3 at the 2026-10-06 build; the next build after the window removes them) |

Service x State x City pages are prerendered for the top slice of each state's cities (`SERVICE_CITY_PRERENDER_TOP = 10`, 6,851 pages) but only the content-ready subset is advertised in the sitemap (`SERVICE_CITY_SITEMAP_TOP = 5` plus prerendered cities with metro labor data, `src/data/contentReadiness.ts`; 3,575 combos). T08 decision (2026-09-05): the gate stays, on all three KW sites. The 2,772 gated combos the audit listed (3,024 since the twelfth pillar, 3,276 since the thirteenth) are prerendered, linked from the Service x State "Cities" grid, self-canonical, and indexable; they are simply not advertised until Search Console evidence supports widening (see "Facts to confirm"). `scripts/sitemap-index.test.mjs` pins the sitemap to the prerender list so no advertised URL is a 404, pins the gate constants, and, after a build, checks that the only shells the sitemap leaves out are the gated combos. Service x case-type pages exist only for the pairs a pillar declares in `services.ts` (`serviceCaseTypePairs()`); an undeclared pair's address 301s to the pillar (`lib/service-case-redirects.server.mjs`). `public/llms.txt` and `public/llms-full.txt` are regenerated from the data files on every build.

## Content model (`src/data`)

| File | Holds |
|---|---|
| `services.ts` | 15 service entries; 13 `pillar: true` get routes, sitemap entries, and shells (the twelfth, `transfer-pricing-expert-witness`, added 2026-10-05, sits after fraud and asset tracing, declares the tax and transfer pricing dispute, commercial contract, shareholder, and divorce case types, and carries `geoTitleLabels` so its state and city titles and H1s read "Transfer Pricing Expert Witness in <place>" where the label fits; the thirteenth, `intellectual-property-damages`, added 2026-10-06, sits after transfer pricing, declares the intellectual property infringement, commercial contract (a license and its royalties), and shareholder (an owner's diversion of the company's trade secrets or other intellectual property) case types, carries the labels "Intellectual Property Damages Expert" and "IP Damages Expert", and is joined on the infringement case type by the lost profits, business valuation, and rebuttal pillars, six declared pairs in all); `vocational-evaluation` and `life-care-planning` are `pillar: false` cross-sells with an `externalUrl` to the sister practice's verified service page (`VOC_SERVICE_URL`, `LCP_SERVICE_URL` in `brand.ts`). Every entry carries `cost`, `process` (4+ steps), `timeline` (3+ phases), `keywords`; the lost earnings, household services, life care plan costing, and divorce pillars carry a `handoff` (the explained referral to the sister practice, rendered under the pillar hero) |
| `caseTypes.ts` | 16 case types with `lossComponents`, `damagesExposure`, `economicImpact`, related pillars, FAQs, sources; the divorce entry and the tax and transfer pricing dispute (category `tax`, short name "Tax Dispute", added 2026-10-05) carry a `framing` block (title stems, H1s, descriptions, leads including the service x case type x state lead, section headings, framework paragraph, the expert-standard paragraph around the state's own inquiry (`expertInquiryOf` in `state-regs.ts`; the state's text closes on a damages-report sentence), and the pair x state framework FAQ close; for the tax entry also a courts answer that names the federal tax forums and their appeals, the forums listed ahead of the state's chancery, business, and general-jurisdiction courts, and the circuit note in the framework paragraph) that the hub, state, pair, and pair x state templates and the shells read through the `caseType*` helpers in place of the shared economic-damages strings; the tax entry's `journeyShortName` ("Transfer Pricing") keeps the query term in its journey titles. The intellectual property infringement entry (category `intellectual-property`, short name "IP Infringement", added 2026-10-06) is a damages claim, so it keeps the shared damages headings, H1s, and hub title and carries a `venueFraming` block instead of `framing`: hub and state descriptions, the state and pair x state leads, the framework paragraph and its FAQ, the expert-standard paragraph around the state's own inquiry, and a courts answer and forum list that put the federal district courts serving the state first, the Federal Circuit for patent appeals, and the regional circuit for the other appeals ahead of the state's business and general-jurisdiction courts (American Samoa, which has no district court of its own, gets a no-district variant, and nothing is said about local trade secret law in Guam, the Northern Mariana Islands, or American Samoa, `LOCAL_TRADE_SECRET_LAW_UNSTATED` in `geo-prose.mjs`); the same `caseType*` helpers read it, and its `journeyTrialFocus` ("explaining the royalty") sets the trial journey description |
| `intake.ts` | Where an inquiry goes (the shared intake inbox) and the /about sister-practices section; one module for the contact form, the consultation form, /about, the privacy policy, and their shells |
| `credentials.ts` | 4 credentials (`forensic-economist`, `nafe-member`, `aaefe-member`, `graduate-economics-degree`); membership pages carry `expertSlugs: []` and describe the association, never the roster |
| `team.ts` | 3 members: Christopher Skerritt (leadership, senior expert tier), Zachary Sperling (Economic Associate / Expert Liaison, support), and Francis Kumah (Forensic Accountant, support); /team renders all three on one row; background credentials listed as background; `analysisResponsibility()` builds the "directed by" line the pillar, service x geo, and place pages print (`ResponsibilityLine.tsx` + the shells) |
| `states.ts` | 56 states, DC, and territories: slug, region, courts and regulation pointers |
| `cities/*.ts` | One file per state (56) listing that state's metros (802 total); `cities/index.ts` aggregates |
| `contentReadiness.ts` | Prerender vs. sitemap gating constants for service x state x city (`SERVICE_CITY_PRERENDER_TOP = 10`; `SERVICE_CITY_SITEMAP_TOP = 5` plus metro-labor cities); the gate is current policy by the T08 decision of 2026-09-05, see "Facts to confirm" |
| `local-content.ts` | 10 hand-written local essays for first-hand markets: the New York, Virginia, and Massachusetts state pages plus New York City, Brooklyn, Newark, Hackensack, Jersey City, Los Angeles, and Houston |
| `geo-prose.mjs` | Templated state/city prose (wage levels, cost of living, local labor markets, venue) shared by the React pages and `scripts/prerender.mjs`; `geo-prose.d.mts` types it |
| `geographicFaqs.ts`, `narratives.ts` | Thin React wrappers over `geo-prose.mjs`; `narratives.parity.test.mjs` pins the two sides |
| `methods.ts` | 15 methodology explainers (present value, worklife expectancy, wage growth, fringe benefits, household services, valuation approaches, lost profits but-for analysis, mitigation and offsets, personal consumption deduction, earnings growth rate selection, total offset discounting, below-market discount rate, age-earnings profile, transfer pricing methodology, reasonable royalty methodology) |
| `guides.ts` | 27 attorney guides (including transfer pricing disputes and intercompany royalty rates, added 2026-10-05, and patent damages and trade secret damages, added 2026-10-06) |
| `comparisons.ts` | 15 side-by-side comparisons (including economist vs. forensic accountant, vs. vocational expert, vs. life care planner, back pay vs. front pay, lost earnings vs. earning capacity in workers' compensation, lost profits vs. diminished business value, fair value vs. fair market value in shareholder disputes, economist vs. forensic accountant on lost profits, transfer pricing documentation vs. expert report, lost profits vs. reasonable royalty) |
| `knowledge.ts`, `insights.ts`, `whitePapers.ts` | 2 knowledge guides, 9 insight posts (Legal, Economics, Records; the sixth Records post covers intercompany agreements in a transfer pricing dispute, the seventh license agreements in an intellectual property damages claim), 2 email-gated white papers |
| `journeys.ts` | 64 attorney journey stages (considering, retaining, preparing-deposition, trial x 16 case types) |
| `faqs.ts`, `home-faqs.mjs` | 18-question site FAQ and the 6-question homepage FAQ (shared with the prerender and the FAQPage JSON-LD) |
| `references.ts` | 76-entry citation registry (NAFE ethics statement, Journal of Forensic Economics, BLS series, worklife tables, Treasury yields, AICPA SSVS No. 1, NACVA, federal rules, the transfer pricing primary sources: section 482 and its Treasury regulations on eCFR, Tax Court Rule 143(g), the OECD Transfer Pricing Guidelines, and the IRS examination, documentation, MAP, competent authority (Rev. Proc. 2015-40, added in the review fixes), and APMA publications, and the intellectual property damages primary sources added 2026-10-06: the patent, Lanham Act, copyright, trade secret, and jurisdiction statutes on LII, the Uniform Trade Secrets Act, two USPTO pages, and fourteen decisions, from Georgia-Pacific and Panduit to the 2025 en banc EcoFactor opinion, linked to LII, the Caselaw Access Project, and the Federal Circuit, plus, with the pillar, Big O Tires on corrective advertising, read on the Caselaw Access Project); the only path for sources |
| `regulations/state-regs.ts`, `courts/state-courts.ts` | Per-state expert-testimony rules and court systems |
| `serviceCaseTypeStates.ts` | The release plan for the service x case type x state family (`STATE_BATCHES`, four batches of 14 states in crawl-priority order, `released` flipped one batch per wave and all four released as of wave 5; `releasedStates()`, `declaredPairs()`, `isReleased()`, `serviceCaseStatePath()`); `ServiceCaseTypeState.tsx` renders `/services/<pillar>/case/<case-type>/<state>` for any declared pair in any state, and the prerender, the sitemap child `sitemap-service-case-types.xml`, and the "by state" grids on the pair and case-type x state pages follow the released set. Title from `serviceCaseStateTitle` (`page-titles.mjs`), description from `serviceCaseStateDescription` (`service-prose.mjs`) |
| `courts/federal-districts.ts` | The 94 federal district courts derived from `state-courts.ts` (slug, reporter abbreviation, state, circuit); `FederalDistrict.tsx` renders one page each under `/jurisdictions/federal/`, the jurisdictions hub groups them by circuit, and the prerender and sitemap load the same module; `FEDERAL_SERVICE_SLUGS` names the pillars every district page lists as most often retained in federal matters (intellectual property damages added 2026-10-06; transfer pricing left off) |
| `labor/*.ts` | State and metro labor context (never rendered as rates or wage figures in prose) |
| `types.ts` | Shared TS types |

Brand identity lives in `src/lib/brand.ts`; `scripts/lib/site.mjs` (build scripts) and `lib/brand.server.mjs` (runtime image) mirror it and `scripts/site-brand-parity.test.mjs` pins all three. Guards: `src/brand-strings.test.mjs` fails on any sister-brand form (`LEGACY_BRAND_PATTERN`) outside `brand.ts` / `CrossSell.tsx` and on either sister domain in scripts, server, or public text; `src/pages/off-brand-copy.test.mjs` fails on vocational or life-care-planning vocabulary in page, component, or data copy outside the carve-outs (`team.ts`, the `life-care-plan-cost-projection` service, the two sister-discipline comparisons); `src/pages/credential-claims.render.test.tsx` fails on any firm-level or named-person membership claim; `scripts/prerender-meta.test.mjs` pins every static shell's title/description to the React page and fails on sister-practice phrasing in the shell text; `src/data/sources-urls.test.ts` keeps every source URL well-formed `https://`; `src/components/layout/nav.pillars.test.mjs` pins the header/footer service links to `pillarServices()` order.

## Facts to confirm

Spec section 12, tracked here until Chris confirms each:

- [ ] kweconomics.com mailbox and Resend-verified sender: `ORG_EMAIL`, `LEAD_FROM`, and `LEAD_RECIPIENTS` all default to `info@kwvrs.com`; move them once the mailbox exists and the domain is verified in Resend.
- [ ] NAFE/AAEFE membership status for Chris and Zach: the membership pages (`credentials.ts`, `expertSlugs: []`) describe the associations and name no member; `llms.txt` says the same. Add slugs to `expertSlugs` only once membership is confirmed.
- [x] Zach's title and states served: `team.ts` carries "Economic Associate / Expert Liaison" and NJ, NY, matching the kwvrs.com roster (kwvrs-site `src/data/team.ts`), and every shell, the Person node, `llms.txt`, and `llms-full.txt` print the same title.
- [ ] Whether the firm markets business valuation and forensic accounting (fraud/tracing, divorce) under this brand and who signs those reports (valuation credentials): `business-valuation`, `lost-profits-and-commercial-damages`, `fraud-and-asset-tracing`, and `divorce-and-marital-financial-analysis` are live pillars. Since the 2026-09-05 audit (C02) every pillar, service x geo, and place page prints "<work> is directed by Christopher Skerritt, M.Ed., MBA, Chief of Economic Services, who is available to testify to it" (`team.ts analysisResponsibility()`), the fact /about and the associate's profile already state; confirm it holds for the valuation and tracing pillars and whether a valuation or accounting designation should be named or its absence stated.
- [ ] Counsel review of the inquiry-routing wording (audit F06): the contact form, the consultation form, /about, and the privacy policy's "Information Sharing" section all say inquiries reach an intake inbox shared with the affiliated vocational and life care planning practices (`src/data/intake.ts`). Since the 2026-09-18 privacy pass the form note no longer says inquiries "are not shared outside that family" (the hosting and email vendors carry every inquiry); it says they are not sold or shared for marketing and points to the policy's "Service Providers and Information Sharing" section; the previous form note ("We do not share inquiries with third parties") described routing that did not match `ORG_EMAIL`. Confirm the wording and whether the privacy policy's effective date should move.
- [ ] The jurisdictions list on `/team/christopher-skerritt`: the biography now says the states are those in which he has served retaining counsel (experience, not licensure); confirm, and reconcile the credential subset shown here with the kwvrs.com and kwlcp.com profiles (all three resolve; not compared line by line).
- [ ] T08 (audit, P1), decision 2026-09-05: the crawl-budget gate stays (`SERVICE_CITY_SITEMAP_TOP = 5`, `SERVICE_CITY_PRERENDER_TOP = 10`, the same on all three KW sites). The 2,772 service x city combos the audit listed stay prerendered, internally linked, self-canonical, and indexable; they are not advertised in the sitemap. Widening = set `SERVICE_CITY_SITEMAP_TOP` to 10 in `src/data/contentReadiness.ts` and raise the services child ceiling in `scripts/sitemap-index.test.mjs` to 7,800 (7,200 before the thirteenth pillar, 7,000 before the twelfth) in the same change. Evidence needed first: Search Console page-indexing coverage and impressions for gated vs advertised combos over 4-6 weeks after deploy.
- [ ] Transfer pricing pillar (owner request 2026-10-05): `transfer-pricing-expert-witness` and the `tax-and-transfer-pricing-dispute` case type are live pillar and case-type families. Like every pillar, their pages print "Transfer pricing analysis ... is directed by Christopher Skerritt, M.Ed., MBA, Chief of Economic Services, who is available to testify to it"; no page claims a transfer pricing credential, membership, testimony history, or prior engagement for anyone. Confirm who directs and testifies to transfer pricing work, whether "Transfer Pricing" should stay in Christopher Skerritt's specialties (added on the owner's instruction; his profile lists the pillar under "Areas of Practice"), and what role, if any, Francis Kumah has in transfer pricing work: since the review fixes his specialties and biography follow his kwvrs.com roster entry (forensic accounting, financial analysis, economic damages) and name no transfer pricing specialty, record, or schedule, and a profile without an `expertTier` never labels a practice area with the pillar's role-noun name (`practiceAreaLabel`).
- [ ] Intellectual property damages editorial (owner request 2026-10-06): the two guides, the method, the comparison, and the insight carry Christopher Skerritt's byline, as every editorial page does, and describe the statutes and decisions without claiming an intellectual property credential, membership, testimony history, or engagement for anyone. Confirm the byline for this subject before the pillar ships (the pillar stage, next item, adds the "directed by" line), and note that the batch adds the registry's first patent, trademark, copyright, and trade secret decisions, each read in full on the Caselaw Access Project, LII, or the Federal Circuit's site on 2026-10-06.
- [ ] Intellectual property damages pillar (owner request 2026-10-06): `intellectual-property-damages` and the `intellectual-property-infringement` case type are pillar and case-type families across all 56 entries in `states.ts` (the 50 states, the District of Columbia, and five territories; `test/ip-states-coverage.test.mjs` checks every state's pillar, case-type, and pair x state page against the sitemaps and, after a build, the server). Like every pillar, their pages print "Intellectual property damages analysis at KW Economics is directed by Christopher Skerritt, M.Ed., MBA, Chief of Economic Services, who is available to testify to it"; no page claims an intellectual property credential, membership, testimony history, or prior engagement for anyone. Confirm who directs and testifies to intellectual property damages work and whether "Intellectual Property Damages" should stay in Christopher Skerritt's specialties (added on the owner's instruction, his profile only; Francis Kumah's and Zachary Sperling's profiles do not list it). The courts copy is drawn from 28 U.S.C. 1338(a) and 1295(a)(1) (patent and copyright claims only in the federal courts; patent appeals to the Federal Circuit) and says nothing about local trade secret law in Guam, the Northern Mariana Islands, or American Samoa, which the Uniform Law Commission's enactment record for the act does not cover; the district pages now list the pillar among the services most often retained in federal matters.
- [ ] Office NAP unchanged: `OFFICES` in `brand.ts` carries the Hackensack, NJ and Richmond, VA records from kwlcp.
- [ ] Counsel review of the privacy policy (rewritten 2026-09-18 as a draft, `src/data/legal-policies.ts`): the 45-day response commitment, the retention wording (owner decision 2026-09-18: raw website copies are deleted after two years and spam-flagged submissions after 90 days, by `lib/submission-retention.server.mjs`, which only deletes once `SUBMISSION_PURGE_MODE=delete` is set; practice-system records have no fixed period), the health-information paragraph (nothing is asserted about HIPAA status), and the marketing follow-up sentence. The Google Analytics and Cloudflare Turnstile statements render from the build flags, so setting either build arg changes `/privacy` with it; the optional Supabase submission store is not named and must be added to the provider list before it is enabled.
- [ ] GA4 + Turnstile keys: `VITE_GA_MEASUREMENT_ID`, `VITE_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` are empty; new keys, none carried from a sister site.
- [ ] Final wordmark: `public/images/logo.svg` / `logo.png` is a text lockup, not final art; favicons are navy and gold.
- [ ] Social handles: `sameAs` lists only the sister sites.

## Build notes and decisions (Task 11)

- `CANONICAL_HOST` stays environment-driven (`process.env.CANONICAL_HOST || ""`), the same as both sister sites, with `kweconomics.com` documented as the production value and echoed in the startup log. A hard-coded default would 301 the Railway staging URL to a domain that does not point at it yet, and would break the local Docker smoke (which passes `-e CANONICAL_HOST=`) and the server tests.
- The `sitemap-services.xml` crawl-budget ceiling in `scripts/sitemap-index.test.mjs` is 4,450 (kwlcp pinned 3,600 for 10 pillars). With 13 pillars, the 72 declared pairs, and the gate kept (`SERVICE_CITY_SITEMAP_TOP = 5` plus metro-labor cities; the T08 decision of 2026-09-05, see "Facts to confirm") the child holds 4,428 URLs, so the ceiling is pinned just above the real count, as the twin sites do (it was 4,000 over 3,746 URLs with 11 pillars until the transfer pricing pillar, 2026-10-05, and 4,100 over 4,087 URLs with 12 until the intellectual property damages pillar, 2026-10-06). Widening the gate to the whole prerender window would add the 3,276 gated combos (7,704 in the child) and must raise the ceiling to 7,800 in the same change. The `sitemap-service-case-types.xml` ceiling moved from 3,400 to 3,680 in the same change (60 to 65 declared pairs x 56 states = 3,640), to 3,736 when the review fixes declared the transfer pricing x divorce pair (66 x 56 = 3,696), and to 4,072 with the intellectual property pillar's six pairs (72 x 56 = 4,032). Every child also stays under the sitemaps.org limits (50,000 URLs / 50 MB).
- 2026-09-05 audit repairs, both render paths: the divorce case type's `framing` block reaches the title, H1, description, lead, section headings, framework block, local FAQ, and Service node (F08, 57 pages); the commercial and family-financial service x state shells print a category-specific legal context (no tort or workers' compensation forum) and their city shells a place paragraph without the hub's "economic damages analyses" opener (F09); the editorial byline labels its date "Updated" and a named byline alone says "Reviewed", and the pillar, service x geo, and place pages name the directing economist with a profile link (C02); the cost/process/timeline pages and the attorney stage indexes carry a References block, the stage indexes the shared reviewer byline (C04); the sister hand-off links point at the verified `kwvrs.com/services/vocational-expert` (the `/services/vocational-evaluation` alias answers 404); `server.js` answers 410 for a sitemap address with no file on disk (the retired news sitemap).
- The four editorial shells with a named reviewer (`/knowledge/*`, `/insights/*`) print the byline "Christopher Skerritt, M.Ed., MBA, CRC, CLCP, MSCC", exactly as the React `AuthorByline` does (top three `team.ts` credentials not already in the name). The prerender mirrors the hydrated page on purpose; if the economics site should not surface CRC/CLCP/MSCC in bylines, the fix is to trim or reorder `credentials` in `team.ts`, not the shell.
- `package.json` `name` is still `kwlcp-website` (lockfile-coupled metadata; no runtime effect).

## Expansion program (weekly waves)

`docs/superpowers/specs/2026-09-02-kweconomics-expansion-authority-program-design.md` and the plan beside it drive one auto-merged wave per week (a cloud routine, Mondays 10:00 UTC). Wave 1 (2026-09-07) added the federal district court family and the first editorial batch. Wave 2 (2026-09-14) added the service x case type x state scaffold with state batch A (840 pages) and the second editorial batch. Wave 3 (2026-09-21) released state batch B (1,680 pages in the family) and the third editorial batch. Wave 4 (2026-09-28) released state batch C (2,520 pages in the family) and the fourth editorial batch. Wave 5 (2026-10-05) released state batch D, completing the family at 3,360 pages, and the fifth editorial batch. On 2026-10-05 the owner added transfer pricing outside the wave schedule: an editorial batch (two guides, a method, a comparison, an insight, and 15 live-verified primary sources), then the `transfer-pricing-expert-witness` pillar and the `tax-and-transfer-pricing-dispute` case type with every family that enumerates them (933 new shells), and the review fixes of the same day declared the transfer pricing x divorce pair (57 more; the service x case type x state family is now 3,696 pages). On 2026-10-06 the owner added intellectual property damages the same way, editorial first: two guides (patent damages and the reasonable royalty; trade secret damages), a method (reasonable royalty methodology), a comparison (lost profits vs. reasonable royalty), a Records insight (license agreements), and 29 live-verified primary sources; the same day the `intellectual-property-damages` pillar and the `intellectual-property-infringement` case type followed with every family that enumerates them, in every state, the District of Columbia, and every territory (990 new shells; the service x case type x state family is now 4,032 pages). Every editorial piece cites the registry only; a new `references.ts` entry is added only when its URL can be live-verified from the build environment (the cloud egress policy blocks irs.gov, eeoc.gov, law.cornell.edu, and uscourts.gov, so wave 1 reused existing entries instead).

## Related repos

- **kwlcp-website** (`~/Documents/New project/kwlcp-website`, kwlcp.com) is the structural upstream: this repo started as a byte-identical import of its commit `b1e643c` (2026-08-26) and swapped the data layer, brand constants, copy, and tests. Fixes to shared mechanics (prerender, sitemap gating, server hardening, lead mailer) should be considered for all three sites.
- **kwvrs-site** (`~/Documents/New project/kwvrs-site`, kwvrs.com) is kwlcp's upstream and the source of the team roster copy.
- The old `cskerritt/kweconomics` site and the legacy tagonline build are not a source for anything here: no code, copy, routes, or redirects are carried from them.

## Stack

Vite + React 19 + TypeScript + Tailwind CSS 4. Dependency-free Node `http` server. Deployed on Railway via Docker.
