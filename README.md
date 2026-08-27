# KW Life Care Planning (kwlcp.com)

Marketing site for **KW Life Care Planning** ("KW LCP"), the life care planning practice of Kincaid Wolstein Vocational and Rehabilitation Services. Life-care-planning only: 10 pillar services (life care planning, pediatric, catastrophic injury, medical cost projection, plan review/rebuttal, MSA allocation, etc.) across 56 states/territories and ~800 metros, pre-rendered to static HTML and served by a dependency-free Node server with a contact/lead API.

Sister practices are linked, never duplicated: vocational work hands off to kwvrs.com and economics to kweconomics.com (`src/lib/brand.ts` is the only place those URLs are spelled; `src/components/CrossSell.tsx` is the one page component allowed to describe that work).

## Local development

```bash
export PATH=~/.local/node/node-v22.22.0-darwin-arm64/bin:$PATH   # Node 22 (Node 25 npm is broken on this machine)
npm ci
npm run dev        # Vite dev server with HMR
npm run build      # sitemaps -> llms.txt -> extra sitemaps -> tsc -> vite build -> prerender (writes dist/)
npm test           # vitest (unit + guard tests; some sitemap checks need dist/ from a prior build)
npm run lint       # eslint .
npm run preview    # serve the vite build without the prerendered shells
```

Full gate before pushing: `npx tsc -b && npx eslint . && npx vitest run && npm run build`.

Other scripts: `generate:sitemaps`, `generate:llms`, `images:webp` (needs `cwebp`), `indexnow` (submits sitemap URLs; set `INDEXNOW_KEY`, optional `INDEXNOW_HOST`).

## Production

`node server.js` serves `dist/` (prerendered shells + assets), the API routes (`/api/contact`, `/api/consultation`, `/api/whitepaper`), and `/healthz`. No framework; `http` module only.

| Var | Required | Purpose |
|---|---|---|
| `PORT` | Railway | Listen port, default `3000` |
| `CANONICAL_HOST` | yes | `kwlcp.com`; other hosts 301 to it |
| `LEAD_RECIPIENTS` | yes | Comma list for lead notifications; default `info@kwvrs.com` until a kwlcp.com mailbox exists |
| `LEAD_FROM` | yes | Resend sender, `Name <addr>` form; default `KW Life Care Planning <info@kwvrs.com>` (`lib/lead-mailer.server.mjs`). kwlcp.com must be a verified Resend domain before this moves |
| `RESEND_API_KEY` | prod | Lead email delivery; unset = emails are logged, not sent |
| `VITE_TURNSTILE_SITE_KEY` | prod (build arg) | Cloudflare Turnstile widget; baked in at `vite build` |
| `TURNSTILE_SECRET_KEY` | prod | Server-side Turnstile verification |
| `TURNSTILE_REQUIRE_TOKEN` | optional | `"true"` rejects submissions with no token (default: soft-fail, quarantined) |
| `VITE_GA_MEASUREMENT_ID` | optional (build arg) | GA4 property for the new domain; empty = no analytics tag |
| `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | optional | Durable raw-submission capture (`lib/raw-submissions.server.mjs`); unset = JSONL only |
| `RATE_LIMIT_MAX` | optional | Contact-API requests per minute per IP, default `10` |

Build args `VITE_TURNSTILE_SITE_KEY` and `VITE_GA_MEASUREMENT_ID` default to empty; the kwvrs keys are not carried over.

## Deployment

Railway, Dockerfile builder (`railway.json`): multi-stage `node:22-alpine` image runs the full `npm run build` then copies `dist/` (which already contains `public/`), `server.js`, `validation.server.mjs`, `turnstile.server.mjs`, and `lib/` into the runtime stage. Healthcheck `GET /healthz` returns JSON with the mail/turnstile/durable-capture readiness flags. Standing rule: `docker build && docker run` locally before pushing to `main`.

## Page inventory

From `npm run build` at this commit (8,036 prerendered `index.html` shells):

| Family | Pages |
|---|---|
| Core pages | 59 |
| Service pillar pages | 10 |
| Knowledge guides | 2 |
| Insight posts | 2 |
| Guide pages | 13 |
| Comparison pages | 8 |
| State pages | 56 |
| City pages | 802 |
| Service x State | 560 |
| Service x State x City | 5,270 |
| Case-type x State | 616 |
| Credential x State | 448 |
| Service variant (cost/process/timeline) | 30 |
| Service x Case-type | 110 |
| Attorney journey | 48 |
| White paper | 2 |
| **Total** | **8,036** |

Sitemap index `public/sitemap.xml` (5 children + image + news), `<loc>` counts:

| File | URLs |
|---|---|
| `sitemap-core.xml` | 111 |
| `sitemap-services.xml` | 3,461 (crawl-budget ceiling 3,600; city combos gated by `src/data/contentReadiness.ts`) |
| `sitemap-locations.xml` | 859 |
| `sitemap-case-types.xml` | 628 |
| `sitemap-credentials.xml` | 457 |
| `image-sitemap.xml` | 18 |
| `news-sitemap.xml` | 2 |

Service x State x City pages are prerendered for the top slice of each state's cities (5,270) but only the content-ready subset is advertised in the sitemap; `scripts/sitemap-index.test.mjs` pins the sitemap to the prerender list so no advertised URL is a 404.

## Content model (`src/data`)

| File | Holds |
|---|---|
| `services.ts` | 11 service entries; 10 `pillar: true` get routes and sitemap entries; `forensic-economics` is `pillar: false` and renders only as a cross-sell card pointing at the sister site |
| `caseTypes.ts` | 11 case types with relevant services, FAQs, sources |
| `credentials.ts` | 8 credentials (CLCP, CNLCP, CRC, ...) with featured `expertSlugs` |
| `states.ts` | 56 states/territories: slug, courts, regs pointers |
| `cities/*.ts` | One file per state (56) listing that state's metros; `cities/index.ts` aggregates |
| `contentReadiness.ts` | Prerender vs. sitemap gating constants for service x state x city |
| `local-content.ts` | Hand-written local essays for first-hand markets (Hackensack, Richmond, ...) |
| `geo-prose.mjs` | Templated state/city prose shared by React pages and `scripts/prerender.mjs` |
| `geographicFaqs.ts` | Per-geography FAQ variants |
| `narratives.ts` | Service x case-type narrative blocks |
| `methods.ts` | Methodology descriptions cited from service pages |
| `references.ts` | Citation registry (standards of practice, journals, statutes) |
| `regulations/state-regs.ts`, `courts/state-courts.ts` | Per-state expert-testimony rules and court systems |
| `labor/*.ts` | State/metro labor data retained for care-rate context |
| `insights.ts`, `knowledge.ts`, `guides.ts`, `comparisons.ts`, `whitePapers.ts`, `journeys.ts` | Editorial content and attorney journey stages |
| `faqs.ts`, `home-faqs.mjs` | Site FAQ and homepage FAQ (shared with prerender) |
| `team.ts` | KW LCP roster, titles, specialties (see facts to confirm) |
| `testimonials.ts` | Testimonials sourced from the parent firm's site |
| `types.ts` | Shared TS types |

Brand identity lives in `src/lib/brand.ts`; `scripts/lib/site.mjs` is its Node mirror for build scripts and `scripts/site-brand-parity.test.mjs` pins the two. `src/brand-strings.test.mjs` and `src/pages/off-brand-copy.test.mjs` fail the build if vocational-brand names or vocational-expert phrasing leak into rendered copy; the latter also walks `src/data/*.ts` (allowances: `team.ts` bios, `credentials.ts`, one workers' compensation hand-off line in `services.ts`, and at most one "sister practice" hand-off per journey stage in `journeys.ts`). `src/data/sources-urls.test.ts` keeps every source URL well-formed `https://`, and `src/components/layout/nav.pillars.test.mjs` pins the header/footer service links to `pillarServices()` order.

## Facts to confirm

Site-level (spec section 11):

- [ ] kwlcp.com mailbox: `ORG_EMAIL` and `LEAD_FROM` / `LEAD_RECIPIENTS` default to `info@kwvrs.com` until one exists.
- [ ] Resend-verified sender for kwlcp.com (required before `LEAD_FROM` moves off the kwvrs address).
- [ ] Whether KW LCP actually markets Medicare Set-Aside allocation and elder-care planning under this brand.
- [ ] Final wordmark artwork: `public/images/logo.svg` is live text with a font fallback, not final art.
- [ ] Twitter/LinkedIn handles for the new brand (`sameAs` currently lists only the sister sites).
- [ ] GA4 measurement ID and Turnstile site/secret keys for the new domain.
- [ ] `favicon.ico` not regenerated; still the kwvrs amber bar.

Editorial and credentialing:

- [x] CNLCP certifying body: verified 2026-08-26 as the CNLCP Certification Board (cnlcp.org; HEAD returns 405, GET 200). `credentials.ts` names the Board as issuer; AANLCP is cited only for the nurse life care planning scope and standards of practice.
- [ ] Physician review of every plan: the site now says "physician-informed" (plans are developed by certified life care planners with a board-certified physician life care planner on the team). If every plan is in fact developed or reviewed by Dr. Jesse Wolstein, restore the stronger "Physician-Led" wording in `Home.tsx`, `About.tsx`, `home-faqs.mjs`, and `scripts/prerender.mjs` (keep `prerender-meta.test.mjs` green).
- [ ] Jesse Wolstein "10 years of clinical experience" (`team.ts`) is a number that will go stale; confirm it or change to "over a decade".
- [ ] IALCP Standards of Practice: no verifiable current-edition URL found; the site cites Reavis (2002), *Journal of Life Care Planning*. Replace with the current edition if the team has it.
- [ ] American Samoa and CNMI oversight agency is rendered as a generic "Department of Health"; confirm the actual agency names.
- [ ] `practiceContext` medical-malpractice wording deserves a counsel skim before launch.
- [ ] Footer credential line reads "CLCP · CRC"; confirm that is the credential set the firm wants foregrounded.

Team (from the Task 8 roster build):

- [ ] Brief-mandated titles: Paul Bourgeois "Chief of Life Care Planning"; Matthew Putts "Senior Life Care Planner" (was Chief of Vocational Services); Christopher Skerritt "Chief of Economic Services & Medicare Set-Aside Consultant".
- [ ] Jesse Wolstein specialties were mapped from the harvest ("Medical Foundation Review", "Life Expectancy Analysis") to service keys "Catastrophic Injury", "Medical Cost Projection", "Life Care Plan Review" so practice areas render; confirm he practices each.
- [ ] Paul Bourgeois specialties "Life Care Plan Review" and "Expert Testimony" are not stated in either source (bio no longer claims them).
- [ ] Christopher Skerritt `statesServed` is the kwvrs-era 7-state list (NJ, NY, MA, VA, RI, CT, PA); confirm for the MSA practice footprint. Dan Wolstein's is the same list.
- [ ] `Team.tsx` hero: "qualified to provide testimony in state and federal courts nationwide" is a kwvrs-era claim carried forward.
- [ ] `src/data/credentials.ts` `expertSlugs` is a featured list, not exhaustive: `crc` omits Christopher (who holds CRC); `phd` omits Dan and Matt (both Ph.D.). Decide whether to complete them or keep as curated.

## Related repos

- **kwvrs-site** (`~/Documents/New project/kwvrs-site`) is the structural upstream: routing, prerender pipeline, sitemap partitioning, server, and the data-file shapes were cloned from it and then stripped to life care planning. Fixes to shared mechanics (prerender, sitemap gating, server hardening) should be considered for both.
- **kweconomics** hosts the forensic-economics practice the `/services/forensic-economics` card links to.

## Stack

Vite + React 19 + TypeScript + Tailwind CSS 4. Dependency-free Node `http` server. Deployed on Railway via Docker.
