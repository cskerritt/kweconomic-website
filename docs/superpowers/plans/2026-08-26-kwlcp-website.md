# KW LCP Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up kwlcp.com — a life-care-planning-only marketing + lead-capture site — by cloning the kwvrs-site codebase, stripping everything non-LCP, rebuilding the data layer around 11 LCP services, and slimming the server to static + Resend lead delivery.

**Architecture:** Vite + React 19 SPA with head-only prerendered shells for ~9k routes (services × states × cities, case types, credentials, editorial), a sitemap index, and a dependency-free Node `http` server. All content lives in typed `src/data/*.ts` files; build scripts regex those files to enumerate URLs. Brand strings are centralized in `src/lib/brand.ts` and enforced by a test.

**Tech Stack:** Node 22, Vite 8, React 19, TypeScript 6, Tailwind 4, react-router 7, Vitest 4, lucide-react, Docker (node:22-alpine), Railway, Cloudflare Turnstile, Resend.

**Spec:** `docs/superpowers/specs/2026-08-26-kwlcp-website-design.md`

## Global Constraints

- Use Node 22: `export PATH=~/.local/node/node-v22.22.0-darwin-arm64/bin:$PATH` before any `npm` command (system Node 25 is broken).
- Source tree to copy from: `/Users/chrisskerritt/Documents/New project/kwvrs-site` at commit `83c0167`. Do NOT copy `.git`, `node_modules`, `dist`, `workflow/`, `report/`, `docs/` (except nothing — this repo has its own `docs/`), `data/`.
- Harvest-only source: `/Users/chrisskerritt/Documents/New project/KW-LIFECARE-SITE` (`src/data/services.ts`, `src/data/team.ts`, `src/pages/Home.tsx` hero copy). Never copy its scripts, server, or other data files.
- Brand: `ORG_NAME = "KW Life Care Planning"`, `ORG_SHORT = "KW LCP"`, `SITE_URL = "https://kwlcp.com"`. No file under `src/` other than `src/lib/brand.ts` and `src/components/CrossSell.tsx` may contain `KWVRS`, `kwvrs.com`, or `Kincaid Wolstein`.
- Services: exactly 11 entries; 10 with `pillar: true`; `forensic-economics` is `pillar: false` with `externalUrl: "https://kwvrs.com/services/forensic-economics"`. Every entry has `cost`, `process`, `timeline`.
- Case types: exactly 11 (drop `long-term-disability`, `wrongful-termination`, `matrimonial`; add `birth-injury`, `cerebral-palsy`).
- Credentials: exactly 8 (`clcp`, `cnlcp`, `mscc`, `cdms`, `crc`, `md`, `rn`, `phd`).
- Copy is citation-free in prose (no statute/rule cites); sources go through `src/data/references.ts`.
- Prerender/sitemap constants unchanged: `SERVICE_CITY_PRERENDER_TOP = 10`, `SERVICE_CITY_SITEMAP_TOP = 5`.
- Commit after every task. Never push until Task 13's Docker check passes.
- Do not modify anything under `/Users/chrisskerritt/Documents/New project/kwvrs-site`.

---

### Task 1: Import the kwvrs-site baseline

**Files:**
- Create: entire tree of `kwlcp-website/` from kwvrs-site (see exclusions)
- Modify: `.gitignore` (ensure `data/`, `dist/`, `node_modules/` ignored)

**Interfaces:**
- Produces: a building, test-passing copy of kwvrs-site that every later task strips down.

- [ ] **Step 1: Copy the tree**

```bash
cd "/Users/chrisskerritt/Documents/New project"
rsync -a --exclude .git --exclude node_modules --exclude dist --exclude workflow --exclude report --exclude docs --exclude /data --exclude .env \
  kwvrs-site/ kwlcp-website/
cd kwlcp-website && ls
```
Expected: `src scripts lib public server.js package.json Dockerfile railway.json ...` present; `docs/` still contains only our spec + plan.

- [ ] **Step 2: Remove internal-only public dirs and repo-root artifacts**

```bash
cd "/Users/chrisskerritt/Documents/New project/kwlcp-website"
rm -rf public/engineering-guide public/profitabilitycalc public/client-forms public/samples public/cv public/documents \
       public/google*.html public/BingSiteAuth.xml .github/workflows/gsc-audit.yml
rm -f CLAUDE.md
grep -qx '/data/' .gitignore || printf '/data/\n' >> .gitignore
```

- [ ] **Step 3: Install and verify baseline builds and tests pass**

```bash
export PATH=~/.local/node/node-v22.22.0-darwin-arm64/bin:$PATH
npm ci --no-audit --no-fund
npm test 2>&1 | tail -5
```
Expected: all tests pass except any that referenced the deleted `public/` dirs (`scripts/client-forms.test.mjs`, `scripts/guide-assets.test.mjs`, `test/gsc-audit.test.mjs`). Delete those three test files and rerun until green.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: import kwvrs-site baseline (83c0167) minus workflow/internal assets"
```

---

### Task 2: Brand module and schema constants

**Files:**
- Create: `src/lib/brand.ts`, `src/lib/brand.test.ts`, `scripts/lib/site.mjs`
- Modify: `src/lib/schema.ts:1-49` (constants), `index.html` (title/og/twitter), `src/hooks/use-page-meta.ts` (`DEFAULT_OG_IMAGE`)

**Interfaces:**
- Produces: `ORG_NAME`, `ORG_SHORT`, `ORG_LEGAL`, `SITE_URL`, `ORG_EMAIL`, `ORG_PHONE`, `ORG_PHONE_VA`, `OFFICES`, `SAME_AS`, `KNOWS_ABOUT` from `@/lib/brand`; `SITE_URL` from `scripts/lib/site.mjs`.

- [ ] **Step 1: Write the failing test**

`src/lib/brand.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { ORG_NAME, ORG_SHORT, SITE_URL, OFFICES, SAME_AS, KNOWS_ABOUT } from "./brand";
import { ORG_URL, ORG_LOGO, organizationSchema } from "./schema";

describe("brand constants", () => {
  it("names the LCP brand and domain", () => {
    expect(ORG_NAME).toBe("KW Life Care Planning");
    expect(ORG_SHORT).toBe("KW LCP");
    expect(SITE_URL).toBe("https://kwlcp.com");
    expect(ORG_URL).toBe(SITE_URL);
    expect(ORG_LOGO).toBe("https://kwlcp.com/images/logo.png");
  });
  it("keeps both offices and the family sameAs links", () => {
    expect(OFFICES.map((o) => o.addressRegion)).toEqual(["NJ", "VA"]);
    expect(SAME_AS).toEqual(["https://kwvrs.com", "https://kweconomics.com"]);
  });
  it("feeds the organization schema", () => {
    const org = organizationSchema() as Record<string, unknown>;
    expect(org.name).toBe(ORG_NAME);
    expect(org.knowsAbout).toEqual(KNOWS_ABOUT);
    expect(org.sameAs).toEqual(SAME_AS);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/brand.test.ts`
Expected: FAIL — cannot resolve `./brand`.

- [ ] **Step 3: Create `src/lib/brand.ts`**

```ts
export const ORG_NAME = "KW Life Care Planning";
export const ORG_SHORT = "KW LCP";
export const ORG_LEGAL = "Kincaid Wolstein Vocational and Rehabilitation Services";
export const SITE_URL = "https://kwlcp.com";
export const ORG_EMAIL = "info@kwvrs.com"; // facts-to-confirm: kwlcp.com mailbox
export const ORG_PHONE = "+1-201-343-0700";
export const ORG_PHONE_VA = "+1-804-282-4199";
export const ORG_CITY = "Hackensack";
export const ORG_STATE = "NJ";
export const ORG_COUNTRY = "US";
export const ORG_LOGO = `${SITE_URL}/images/logo.png`;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/hero-office-meeting.jpg`;
export const SAME_AS = ["https://kwvrs.com", "https://kweconomics.com"] as const;
export const KNOWS_ABOUT = [
  "Life Care Planning",
  "Pediatric Life Care Planning",
  "Catastrophic Injury Cost Projection",
  "Medical Cost Projection",
  "Future Medical Care",
  "Medicare Set-Aside Allocation",
  "Life Care Plan Rebuttal",
  "Expert Witness Testimony",
] as const;

export const OFFICES = [
  {
    id: `${SITE_URL}/#office-nj`,
    name: `${ORG_NAME} - New Jersey`,
    streetAddress: "1 University Plaza, Suite 302",
    addressLocality: "Hackensack",
    addressRegion: "NJ",
    postalCode: "07601",
    addressCountry: "US",
    telephone: ORG_PHONE,
    latitude: 40.8859,
    longitude: -74.0435,
    hasMap: "https://www.google.com/maps/search/?api=1&query=1+University+Plaza+Hackensack+NJ+07601",
  },
  {
    id: `${SITE_URL}/#office-va`,
    name: `${ORG_NAME} - Virginia`,
    streetAddress: "Richmond, Virginia",
    addressLocality: "Richmond",
    addressRegion: "VA",
    postalCode: "23219",
    addressCountry: "US",
    telephone: ORG_PHONE_VA,
    latitude: 37.5407,
    longitude: -77.436,
    hasMap: "https://www.google.com/maps/search/?api=1&query=Richmond+VA+23219",
  },
] as const;
```

- [ ] **Step 4: Rewire `src/lib/schema.ts`**

Replace lines 1–49 (the `ORG_*` constants and `OFFICES` array) with:
```ts
import {
  ORG_NAME, SITE_URL, ORG_PHONE, ORG_CITY, ORG_STATE, ORG_COUNTRY, ORG_LOGO, OFFICES, SAME_AS, KNOWS_ABOUT,
} from "./brand";
export { ORG_NAME, ORG_PHONE, ORG_CITY, ORG_STATE, ORG_COUNTRY, ORG_LOGO, OFFICES };
export const ORG_URL = SITE_URL;
export const ORG_ID = `${ORG_URL}/#org`;
export const WEBSITE_ID = `${ORG_URL}/#website`;
```
In `organizationSchema()`, set `additionalType: "https://schema.org/MedicalBusiness"`, `sameAs: [...SAME_AS]`, `knowsAbout: [...KNOWS_ABOUT]` (replace any existing `sameAs`/`knowsAbout` values). Keep everything else.

- [ ] **Step 5: Create `scripts/lib/site.mjs` and `index.html` / og defaults**

`scripts/lib/site.mjs`:
```js
export const SITE_URL = "https://kwlcp.com";
export const ORG_NAME = "KW Life Care Planning";
```
`index.html`: set `<title>KW Life Care Planning | Certified Life Care Planners Nationwide</title>`, `og:site_name` → `KW Life Care Planning`, `og:url`/`og:image`/canonical → `https://kwlcp.com/...`, remove `twitter:site`. `src/hooks/use-page-meta.ts`: `import { DEFAULT_OG_IMAGE } from "@/lib/brand"` and delete the local constant.

- [ ] **Step 6: Run tests**

Run: `npx vitest run src/lib`
Expected: `brand.test.ts` PASS; `schema.test.ts` PASS (it is structural). If `schema.test.ts` asserts the old org name, update the expectation to `ORG_NAME`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/brand.ts src/lib/brand.test.ts src/lib/schema.ts scripts/lib/site.mjs index.html src/hooks/use-page-meta.ts
git commit -m "feat(brand): centralize KW LCP brand constants and wire schema/meta"
```

---

### Task 3: Slim server with Resend lead delivery

**Files:**
- Create: `lib/lead-mailer.server.mjs`, `lib/lead-mailer.server.test.mjs`, `test/server-contact.test.mjs`
- Rewrite: `server.js`, `validation.server.mjs`, `.env.example`
- Delete: `lib/raffle*.mjs`, `lib/bar-associations.mjs`, `lib/raffle-metrics.mjs`, `lib/rush-alert.server.mjs`, `lib/estimator-email.server.mjs`, `lib/intake-schema.mjs`, `lib/case-types.mjs`, `lib/damages-estimate.mjs`, `lib/household-services/`, `lib/legacy-flat-geo.server.mjs`, `lib/clio-*.mjs`, and every test for them (`lib/*raffle*`, `lib/bar-associations.test.mjs`, `lib/rush-alert.server.test.mjs`, `lib/estimator-email.server.test.mjs`, `lib/intake-schema*.test.mjs`, `lib/clio-enrichment-intake-parity.test.mjs`, `lib/case-types.test.mjs`, `lib/damages-estimate.test.mjs`, `test/admin-redirect.test.mjs`, `test/training-redirect.test.mjs`, `test/legacy-*.test.mjs`, `test/economic-calculator.test.mjs`, `test/forward.test.mjs`, `test/replay.test.mjs`, `test/rush-queue.test.mjs`, `test/validation-raffle-bar.test.mjs`, `server-raffle*.test.mjs`, `server-payment-intent.test.mjs`, `server-retained-expert.test.mjs`, `scripts/draw-raffle-winner*`, `scripts/raffle-stats*`, `scripts/generate-raffle-qr.mjs`, `scripts/economic-damages-*`, `scripts/gsc-audit.mjs`, `scripts/build-guide-html.py`, `scripts/build-intake-geo.mjs`)
- Keep: `turnstile.server.mjs` (+test), `lib/mailer.server.mjs` (+test), `lib/spam-heuristics.server.mjs` (+test), `lib/raw-submissions.server.mjs` (+`test/raw-submissions-client.test.mjs`), `lib/life-expectancy.mjs`, `lib/life-tables-2023.mjs` (+test), `test/parse-body.test.mjs`, `test/client-ip.test.mjs`, `test/api-routes-turnstile.test.mjs`, `test/server-persist.test.mjs`, `test/validation.server.test.mjs`, `server-spam-quarantine.test.mjs`, `server-turnstile-integration.test.mjs`

**Interfaces:**
- Produces: `buildLeadEmail(type, data) -> { subject, text }`, `sendLeadEmail(type, data, deps?) -> Promise<{ok, error?}>` from `lib/lead-mailer.server.mjs`; `API_ROUTES` with keys `/api/contact`, `/api/consultation`, `/api/whitepaper`, `/api/life-expectancy`; `validateRoute(type, data)` and `isEmail`, `isPhone` from `validation.server.mjs`.

- [ ] **Step 1: Write the failing lead-mailer test**

`lib/lead-mailer.server.test.mjs`:
```js
import { describe, expect, it } from "vitest";
import { buildLeadEmail, sendLeadEmail } from "./lead-mailer.server.mjs";

const lead = { name: "Ann Attorney", email: "ann@firm.com", phone: "2015551212", firm: "Firm LLP", message: "TBI plan needed", __submissionId: "abc" };

describe("buildLeadEmail", () => {
  it("formats a contact lead with every non-internal field", () => {
    const { subject, text } = buildLeadEmail("contact", lead);
    expect(subject).toBe("[KW LCP] New contact lead: Ann Attorney");
    expect(text).toContain("name: Ann Attorney");
    expect(text).toContain("message: TBI plan needed");
    expect(text).not.toContain("__submissionId");
    expect(text).not.toContain("turnstileToken");
  });
});

describe("sendLeadEmail", () => {
  it("skips cleanly without an API key", async () => {
    const r = await sendLeadEmail("contact", lead, { apiKey: "", recipients: ["a@b.com"] });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/RESEND_API_KEY/);
  });
  it("posts to Resend with recipients, reply-to, and an ack for consultations", async () => {
    const calls = [];
    const fetchImpl = async (url, init) => { calls.push(JSON.parse(init.body)); return { ok: true, json: async () => ({ id: "m1" }) }; };
    const r = await sendLeadEmail("consultation", lead, { apiKey: "k", recipients: ["team@kwlcp.com"], from: "leads@kwlcp.com", fetch: fetchImpl });
    expect(r.ok).toBe(true);
    expect(calls[0].to).toEqual(["team@kwlcp.com"]);
    expect(calls[0].reply_to).toBe("ann@firm.com");
    expect(calls[1].to).toEqual(["ann@firm.com"]);
    expect(calls[1].subject).toMatch(/received your consultation request/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/lead-mailer.server.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/lead-mailer.server.mjs`**

```js
import { sendEmail } from "./mailer.server.mjs";

const INTERNAL = (k) => k.startsWith("__") || k.startsWith("_") || k === "turnstileToken" || k === "company_website";
const LABELS = { contact: "contact", consultation: "consultation", whitepaper: "white paper download", "life-expectancy": "life expectancy lookup" };

export function buildLeadEmail(type, data) {
  const label = LABELS[type] || type;
  const who = data.name || data.email || "unknown";
  const lines = Object.entries(data)
    .filter(([k, v]) => !INTERNAL(k) && v !== undefined && v !== null && String(v).trim() !== "")
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`);
  return { subject: `[KW LCP] New ${label} lead: ${who}`, text: lines.join("\n") + "\n" };
}

export function buildAckEmail(type, data) {
  if (type !== "consultation") return null;
  return {
    subject: "KW Life Care Planning received your consultation request",
    text: `Hello ${data.name || ""},\n\nThank you for contacting KW Life Care Planning. A member of our life care planning team will follow up within one business day.\n\nIf your matter is time-sensitive, call +1-201-343-0700.\n\nKW Life Care Planning\nhttps://kwlcp.com\n`,
  };
}

export async function sendLeadEmail(type, data, deps = {}) {
  const apiKey = deps.apiKey ?? process.env.RESEND_API_KEY ?? "";
  const recipients = deps.recipients ?? (process.env.LEAD_RECIPIENTS || "info@kwvrs.com").split(",").map((s) => s.trim()).filter(Boolean);
  const from = deps.from ?? process.env.LEAD_FROM ?? "KW Life Care Planning <info@kwvrs.com>";
  const mail = buildLeadEmail(type, data);
  const r = await sendEmail({ to: recipients, from, replyTo: data.email, subject: mail.subject, text: mail.text, html: `<pre>${mail.text}</pre>` }, { apiKey, fetch: deps.fetch });
  if (!r.ok) return r;
  const ack = buildAckEmail(type, data);
  if (ack && data.email) await sendEmail({ to: data.email, from, subject: ack.subject, text: ack.text, html: `<pre>${ack.text}</pre>` }, { apiKey, fetch: deps.fetch });
  return r;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/lead-mailer.server.test.mjs` — Expected: PASS.

- [ ] **Step 5: Rewrite `validation.server.mjs`**

```js
// Server-side lead validation. Returns an error string or null.
export const isEmail = (v) => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/.test(v.trim());
export const isPhone = (v) => typeof v === "string" && v.replace(/\D/g, "").length >= 10;

export function validateRoute(type, data) {
  if (!isEmail(data.email)) return "a valid email is required";
  if (type === "contact" && !isPhone(data.phone)) return "a valid phone number is required";
  if (type === "consultation" && data.phone && !isPhone(data.phone)) return "a valid phone number is required";
  if (type === "whitepaper" && typeof data.slug !== "string") return "slug is required";
  return null;
}
```
Rewrite `test/validation.server.test.mjs` to cover: contact requires phone; consultation accepts missing phone, rejects bad phone; whitepaper requires slug; bad email rejected on every type.

- [ ] **Step 6: Rewrite `server.js`**

Start from the existing file and keep only these blocks verbatim: imports of `http`, `fs`, `path`, `crypto`; `parseBody`; `clientIp`; `rateLimited` + `RATE_LIMIT_MAX`; `MIME_TYPES`; gzip LRU cache; `SECURITY_HEADERS`; `API_CORS_HEADERS`; `saveSubmission` (jsonl breadcrumb); `persistRawSubmission` / `persistQuarantined`; canonical-host redirect; trailing-slash redirect; `OPTIONS /api/*`; the static-resolution + prerendered-index lookup; `CLIENT_ONLY_ROUTES` (return `false` for everything in v1); SPA 404 fallback; `/healthz`; the `if (!process.env.VITEST) server.listen(...)` tail.

Delete: `PSA_SHORTCUTS`, `adminRedirectTarget`, `trainingRedirectTarget`, `learnRedirectTarget`, `getRedirectTarget`/`REDIRECT_*`, `isWordPressRemnant`, `isLegacyGone`, `GET /api/raffle-entries`, `forwardToWorkflow`, `queueForward`, `replayTick`, `queueRushAlerts`, `queueEstimatorEmail`, `queueRaffleLead`, `recordRaffle`, `normalizeRetainedExpert`, `/engineering-guide` gating, the `X-Robots-Tag` branch for internal paths (keep a single `noindex` header for `/samples/` and `/cv/` removed — delete the branch entirely).

Replace `API_ROUTES` with:
```js
export const API_ROUTES = {
  "/api/contact": { type: "contact", required: ["name", "email", "phone", "message"], requiredMessage: "name, email, phone, and message are required", turnstile: true },
  "/api/consultation": { type: "consultation", required: ["name", "email"], requiredMessage: "name and email are required", turnstile: true },
  "/api/whitepaper": { type: "whitepaper", required: ["name", "email", "slug"], requiredMessage: "name, email, and slug are required", turnstile: true },
  "/api/life-expectancy": { type: "life-expectancy", required: ["name", "email", "firm"], requiredMessage: "name, email, and firm are required", turnstile: true },
};
```
Replace the tail of the POST handler (from `saveSubmission(apiRoute.type, data); // local breadcrumb` to the `return;` before `catch`) with:
```js
      saveSubmission(apiRoute.type, data);
      await persistRawSubmission(submissionId, apiRoute.type, data, { forwarded: true });
      res.writeHead(200, API_CORS_HEADERS);
      res.end(JSON.stringify({ success: true }));
      queueLeadEmail(apiRoute.type, data);
      return;
```
Add near the other helpers:
```js
import { sendLeadEmail } from "./lib/lead-mailer.server.mjs";
export function queueLeadEmail(type, data, deps = {}) {
  const send = deps.send || sendLeadEmail;
  send(type, data).then((r) => {
    if (!r.ok) console.error(`lead email failed for ${type} ${data.__submissionId}: ${r.error}`);
  }).catch((err) => console.error(`lead email threw for ${type}: ${err.message}`));
}
```
`/healthz` body: `{ ok: true, turnstile: <bool>, durableCapture: rawSubs.enabled, mail: Boolean(process.env.RESEND_API_KEY) }`.

- [ ] **Step 7: Write `test/server-contact.test.mjs`**

```js
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
process.env.VITEST = "1";
process.env.TURNSTILE_SECRET_KEY = "";
const mod = await import("../server.js");

describe("POST /api/contact end-to-end (no external services)", () => {
  let server, base;
  beforeAll(async () => { server = mod.server ?? mod.createServer(); await new Promise((r) => server.listen(0, r)); base = `http://127.0.0.1:${server.address().port}`; });
  afterAll(() => server.close());

  it("accepts a valid lead and returns success", async () => {
    const res = await fetch(`${base}/api/contact`, { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Ann Attorney", email: "ann@firm.com", phone: "201-555-1212", message: "Need a TBI life care plan for a Bergen County matter." }) });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });
  it("rejects a missing phone with the route message", async () => {
    const res = await fetch(`${base}/api/contact`, { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "A", email: "a@b.co", message: "x" }) });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/phone/);
  });
  it("has no admin/training/raffle/payment surfaces", async () => {
    for (const p of ["/admin", "/training", "/api/raffle-entries", "/psa"]) {
      const res = await fetch(`${base}${p}`, { redirect: "manual" });
      expect([404]).toContain(res.status);
    }
  });
});
```
If `server.js` does not export the server, export `createServer()` returning the `http.createServer(handler)` instance (the listen tail then calls it). Check how `server-spam-quarantine.test.mjs` imports the server today and follow that pattern.

- [ ] **Step 8: Delete the listed files, update `.env.example` and Dockerfile**

`.env.example`:
```
CANONICAL_HOST=kwlcp.com
LEAD_RECIPIENTS=info@kwvrs.com
LEAD_FROM="KW Life Care Planning <info@kwvrs.com>"
RESEND_API_KEY=
VITE_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
TURNSTILE_REQUIRE_TOKEN=
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_SERVICE_ROLE_KEY=
RATE_LIMIT_MAX=
# PORT=3000
```
Dockerfile: change both `ARG` defaults to `""`; runtime copy line stays `COPY server.js validation.server.mjs turnstile.server.mjs ./` + `COPY lib ./lib`.

- [ ] **Step 9: Run the server test suite**

Run: `npx vitest run lib test server-spam-quarantine.test.mjs server-turnstile-integration.test.mjs turnstile.server.test.mjs`
Expected: PASS. Fix any surviving test that imported a deleted helper (e.g. `test/api-routes-turnstile.test.mjs` may reference `/api/estimator` — trim its route list to the four routes).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat(server): slim to static + Resend lead delivery; drop workflow/raffle/payment/PSA surfaces"
```

---

### Task 4: Strip routes and pages

**Files:**
- Modify: `src/App.tsx`, `src/App.routes.test.mjs`, `src/tools-indexing.routes.test.mjs`, `src/components/layout/Header.tsx`, `src/components/layout/MobileNav.tsx`, `src/components/layout/Footer.tsx`, `src/pages/Tools.tsx`
- Delete pages: `RetainerIntake.tsx`, `Intake.tsx`, `Agreement*.tsx|mjs`, `Payment*.tsx|mjs`, `Raffle*.tsx|mjs`, `SampleReports.tsx`, `ExpertCVs.tsx`, `Forms.tsx`, `PatientFormPage.tsx`, `ExpertDisclosurePillar.tsx`, `ExpertDisclosureState.tsx`, `DamagesEstimator.tsx`, `HouseholdServicesValuator.tsx`, `HouseholdServicesMethodology.tsx`, `Review.tsx`
- Delete components: `RetainerIntakeForm*.tsx|mjs`, `IntakeChooser.tsx`, `ExpertPicker*.tsx`, `WhichExpert.tsx`
- Delete data: `agreements.ts`, `intakeForms*.ts|mjs`, `forms.ts`, `sampleReports.ts`, `expertCVs.ts`, `disclosureRules*.ts`

**Interfaces:**
- Produces: the route set in spec §5; `Header` `serviceLinks` derived from `pillarServices()` (defined in Task 5 — until then keep a static list of the 10 pillar slugs).

- [ ] **Step 1: Update the route test to the target route set**

Edit `src/App.routes.test.mjs`: remove every expectation for `/contact/intake`, `/payment`, `/raffle`, `/agreements`, `/samples`, `/cv`, `/forms`, `/services/expert-disclosure`, `/tools/economic-damages-estimator`, `/tools/household-services`. Add:
```js
it("does not register retired non-LCP routes", () => {
  for (const p of ["/payment", "/raffle", "/contact/intake", "/agreements/", "/services/expert-disclosure", "/tools/household-services", "/tools/economic-damages-estimator", "/samples", "/cv", "/forms"]) {
    expect(appSource).not.toContain(`path="${p}`);
  }
});
```
Edit `src/tools-indexing.routes.test.mjs` so `TOOL_ROUTES = ["/tools/life-expectancy"]`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/App.routes.test.mjs src/tools-indexing.routes.test.mjs` — Expected: FAIL (routes still present).

- [ ] **Step 3: Edit `src/App.tsx`**

Delete the lazy imports and `<Route>` lines for every dropped page listed above. Resulting route list must equal spec §5. Delete the files listed under Files. Run `npx tsc -b` and fix every dangling import (search: `grep -rn "intakeForms\|agreements\|ExpertPicker\|WhichExpert\|IntakeChooser\|disclosureRules\|sampleReports\|expertCVs\|data/forms" src`). Where a page (e.g. `Contact.tsx`, `Home.tsx`, `ServicePillar.tsx`) rendered `<IntakeChooser>` / `<WhichExpert>` / retainer links, replace with a `<Link to="/schedule-consultation">` CTA.

- [ ] **Step 4: Rewrite nav arrays**

`Header.tsx` (and `MobileNav.tsx` which mirrors it):
```ts
const serviceLinks = [
  { name: "All Services", href: "/services" },
  { name: "Life Care Planning", href: "/services/life-care-planning" },
  { name: "Pediatric Life Care Planning", href: "/services/pediatric-life-care-planning" },
  { name: "Catastrophic Injury Plans", href: "/services/catastrophic-injury-planning" },
  { name: "Medical Cost Projections", href: "/services/medical-cost-projection" },
  { name: "Workers' Comp Life Care Plans", href: "/services/workers-compensation-lcp" },
  { name: "Plan Updates", href: "/services/plan-update-and-review" },
  { name: "Plan Rebuttal & Critique", href: "/services/life-care-plan-rebuttal" },
  { name: "Medicare Set-Asides", href: "/services/medicare-set-aside" },
  { name: "Elder & Long-Term Care Planning", href: "/services/elder-and-long-term-care-planning" },
  { name: "Expert Testimony", href: "/services/expert-witness-testimony" },
];
const resourceLinks = [
  { name: "Knowledge Center", href: "/knowledge" }, { name: "Guides", href: "/guides" }, { name: "White Papers", href: "/white-papers" },
  { name: "Insights", href: "/insights" }, { name: "Case Types", href: "/case-types" }, { name: "Credentials", href: "/credentials" },
  { name: "Methods", href: "/methods" }, { name: "Comparisons", href: "/compare" }, { name: "Attorney Resources", href: "/attorneys" },
  { name: "Life Expectancy Tool", href: "/tools/life-expectancy" }, { name: "Jurisdictions", href: "/jurisdictions" }, { name: "FAQ", href: "/resources/faq" },
];
```
Remove the rush (`Zap`) button. `Footer.tsx`: same service list; `companyLinks` = About, Team, Contact, Schedule Consultation, Privacy, Terms; add a "Kincaid Wolstein Family" column: `kwvrs.com` (Vocational & Economic Experts), `kweconomics.com`; delete Staff Login / Training links; phone/email from `@/lib/brand`.

`src/pages/Tools.tsx`: list only Life Expectancy; add a paragraph linking to `https://kwvrs.com/tools` for economic damages and household services calculators.

- [ ] **Step 5: Run type-check and tests**

Run: `npx tsc -b && npx vitest run src/App.routes.test.mjs src/tools-indexing.routes.test.mjs` — Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(routes): strip intake/PSA/payments/raffle/econ tools; LCP nav"
```

---

### Task 5: Services data — 11 LCP entries with `pillar` flag

**Files:**
- Modify: `src/types/index.ts:44-57` (`Service`), `src/data/services.ts` (full rewrite), `src/data/services.test.ts` (rewrite), `src/lib/practice-areas.ts`
- Create: `src/data/services.pillar.test.ts`
- Modify (enumerators → `pillarServices()`): `src/components/RelatedServices.tsx`, `src/components/CityServiceLinks.tsx`, `src/components/ServiceCityCrossLinks.tsx`, `src/pages/Home.tsx`, `src/pages/ServicesHub.tsx`, `src/pages/ServiceState.tsx`, `src/pages/StateHub.tsx`, `src/pages/ServiceStateCity.tsx`, `src/pages/templates/ServiceCaseType.tsx`, `src/pages/templates/CaseTypeHub.tsx`, `src/pages/templates/CredentialState.tsx`, `src/pages/templates/ServiceTransactional.tsx`, `src/pages/templates/CaseTypeState.tsx`, `src/pages/ServicePillar.tsx` (redirect non-pillar to `externalUrl`), `scripts/generate-sitemap.mjs`, `scripts/prerender.mjs`

**Interfaces:**
- Produces: `Service.pillar: boolean`; `services`, `pillarServices()`, `getServiceBySlug(slug)`, `getAllServiceSlugs()` (pillars only) from `@/data/services`. Build scripts detect non-pillars by matching `pillar: false` in the same object literal as `slug: "..."`.

- [ ] **Step 1: Write the failing tests**

`src/data/services.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { services, pillarServices, getServiceBySlug, getAllServiceSlugs } from "./services";

const PILLARS = ["life-care-planning","pediatric-life-care-planning","catastrophic-injury-planning","medical-cost-projection","workers-compensation-lcp","plan-update-and-review","life-care-plan-rebuttal","medicare-set-aside","elder-and-long-term-care-planning","expert-witness-testimony"];

describe("LCP services taxonomy", () => {
  it("has 11 entries, 10 pillars", () => {
    expect(services.length).toBe(11);
    expect(pillarServices().map((s) => s.slug)).toEqual(PILLARS);
    expect(getAllServiceSlugs()).toEqual(PILLARS);
  });
  it("forensic economics is an external cross-sell, not a pillar", () => {
    const fe = getServiceBySlug("forensic-economics");
    expect(fe?.pillar).toBe(false);
    expect(fe?.externalUrl).toBe("https://kwvrs.com/services/forensic-economics");
  });
  it("has no vocational/economic pillars", () => {
    for (const s of ["vocational-expert","loss-of-household-services","matrimonial","standard-of-care","expert-disclosure"]) expect(getServiceBySlug(s)).toBeUndefined();
  });
  it("every entry carries cost, process (>=4 steps) and timeline (>=3 phases)", () => {
    for (const s of services) {
      expect(s.cost?.drivers.length, s.slug).toBeGreaterThanOrEqual(4);
      expect(s.cost?.range.length, s.slug).toBeGreaterThan(80);
      expect(s.cost?.billingStructure.length, s.slug).toBeGreaterThan(80);
      expect(s.process?.length, s.slug).toBeGreaterThanOrEqual(4);
      expect(s.timeline?.length, s.slug).toBeGreaterThanOrEqual(3);
      expect(s.keywords.length, s.slug).toBeGreaterThanOrEqual(3);
      expect(s.description).not.toMatch(/KWVRS|Kincaid Wolstein/);
    }
  });
});
```
`src/data/services.pillar.test.ts` (source-level guard that enumerators never iterate raw `services`):
```ts
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function walk(dir: string, out: string[] = []) {
  for (const f of readdirSync(dir)) { const p = join(dir, f); statSync(p).isDirectory() ? walk(p, out) : /\.(tsx?|mjs)$/.test(f) && !/\.test\./.test(f) && out.push(p); }
  return out;
}
describe("service enumerators use pillarServices()", () => {
  it("no page/component/script iterates the raw services array", () => {
    const offenders = [...walk("src/pages"), ...walk("src/components"), ...walk("scripts")]
      .filter((p) => /\bservices\.(map|forEach|filter|flatMap)\(/.test(readFileSync(p, "utf8")));
    expect(offenders).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/data/services.test.ts src/data/services.pillar.test.ts` — Expected: FAIL.

- [ ] **Step 3: Extend the type and rewrite `services.ts`**

`src/types/index.ts` — add to `Service`: `pillar: boolean; // false = cross-sell only, excluded from geo/case/cost enumeration`.

`src/data/services.ts` — write all 11 entries. Field rules for each: `slug`/`name`/`shortName` per spec §4.1 table; `icon` (lucide name): `HeartPulse`, `Baby`, `Activity`, `Calculator`, `HardHat`, `RefreshCcw`, `Scale`, `ShieldCheck`, `Home`, `Gavel`, `TrendingUp`; `keywords` ≥3 search phrases; `caseTypes` use human names matching Task 6 case types; `relevantCredentials` from `["CLCP","CNLCP","MSCC","CDMS","CRC","MD","RN","PhD"]`; `cost.range` and `cost.billingStructure` ≥80 chars each, `cost.drivers` ≥4; `process` ≥4 steps; `timeline` ≥3 phases. Take the harvest descriptions/keywords from `KW-LIFECARE-SITE/src/data/services.ts` for the 8 inherited slugs and use this full exemplar for the flagship (adapt for the others):

```ts
import type { Service } from "@/types";

export const services: Service[] = [
  {
    slug: "life-care-planning",
    name: "Life Care Planning",
    shortName: "Life Care Plan",
    pillar: true,
    description: "Individualized, evidence-based life care plans projecting the future medical, rehabilitation, and non-medical needs of individuals living with catastrophic injuries or chronic conditions. Each plan documents the items of care recommended across the patient's remaining life expectancy, with cost research grounded in geographic-specific provider data.",
    icon: "HeartPulse",
    keywords: ["life care plan", "certified life care planner", "future medical costs", "catastrophic injury", "long term care assessment", "life care planner"],
    caseTypes: ["Personal Injury", "Medical Malpractice", "Traumatic Brain Injury", "Spinal Cord Injury", "Workers' Compensation"],
    relevantCredentials: ["CLCP", "CNLCP", "CRC", "RN"],
    cost: {
      range: "Life care plan fees reflect the complexity of the injury, the breadth of future care needs, and the number of treating providers and records involved. KW Life Care Planning provides a written fee schedule and a cost estimate before work begins.",
      drivers: [
        "Severity and complexity of the injury or chronic condition",
        "Number of treating physicians and the volume of medical records",
        "Whether a clinical interview, home assessment, or physician collaboration is required",
        "Scope of future care projected, including medical, surgical, therapy, equipment, home modification, and attendant care",
        "Cost research required to price each item by geographic region",
        "Deposition and trial testimony, including preparation and travel time",
      ],
      billingStructure: "Life care planning is billed at an hourly rate for records review, clinical interview, provider collaboration, cost research, plan preparation, and testimony. A retainer is established at the outset and applied against time incurred. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Engagement and records collection", description: "We confirm scope and conflicts, establish the retainer, and gather medical records, imaging, and provider information." },
      { step: "Medical records review and chronology", description: "We review the medical record in detail and build a chronology of diagnoses, treatment, and current clinical status." },
      { step: "Clinical interview and assessment", description: "When appropriate, we interview the evaluee and family and coordinate with treating providers to document functional status and ongoing needs." },
      { step: "Future care planning", description: "We project future medical, rehabilitative, equipment, medication, and support needs across the remaining life expectancy, consistent with published life care planning standards." },
      { step: "Cost research and plan preparation", description: "We price each item using geographically specific cost data and document the basis for every recommendation in a written plan." },
      { step: "Testimony", description: "We provide deposition and trial testimony and update the plan as the clinical picture or records change." },
    ],
    timeline: [
      { phase: "Engagement and records collection", duration: "1 to 3 weeks" },
      { phase: "Records review and chronology", duration: "2 to 4 weeks, depending on record volume" },
      { phase: "Clinical interview and provider collaboration", duration: "Scheduled within the review period" },
      { phase: "Cost research and draft plan", duration: "3 to 6 weeks after the assessment" },
      { phase: "Deposition and trial testimony", duration: "As scheduled by counsel and the court" },
    ],
  },
  // ...9 more pillars, then:
  {
    slug: "forensic-economics",
    name: "Forensic Economic Support",
    shortName: "Forensic Economics",
    pillar: false,
    description: "Present-value economic analysis of life care plan costs, performed by the Kincaid Wolstein group's forensic economists. Plans translate directly into damages calculations using accepted growth, discount, and life-expectancy assumptions.",
    icon: "TrendingUp",
    keywords: ["lcp present value", "future medical present value", "life care plan economist"],
    caseTypes: ["Personal Injury", "Wrongful Death", "Medical Malpractice"],
    relevantCredentials: ["PhD"],
    externalUrl: "https://kwvrs.com/services/forensic-economics",
    cost: { range: "Economic analysis is engaged through the firm's economics practice; a written estimate is provided once the life care plan scope is known and the matter's damages framework is confirmed.", drivers: ["Number of plan scenarios to value", "Jurisdiction-specific discounting conventions", "Whether testimony is required", "Coordination with the life care planner on updates"], billingStructure: "Economic work is billed hourly under the economics practice's engagement agreement, separately from the life care plan retainer, with the two experts coordinating on assumptions so the plan and the valuation reconcile." },
    process: [
      { step: "Plan hand-off", description: "The completed life care plan and its item-level cost tables are transmitted to the economist." },
      { step: "Assumption alignment", description: "Growth rates, discount rates, and life expectancy are confirmed against the plan's basis." },
      { step: "Present-value analysis", description: "Each care category is valued to present value under the jurisdiction's accepted method." },
      { step: "Report and testimony", description: "A written economic report is issued and testimony coordinated with the life care planner." },
    ],
    timeline: [
      { phase: "Plan hand-off", duration: "On plan completion" },
      { phase: "Present-value analysis", duration: "1 to 2 weeks" },
      { phase: "Testimony", duration: "As scheduled by counsel" },
    ],
  },
];

export function pillarServices(): Service[] { return services.filter((s) => s.pillar); }
export function getServiceBySlug(slug: string): Service | undefined { return services.find((s) => s.slug === slug); }
export function getAllServiceSlugs(): string[] { return pillarServices().map((s) => s.slug); }
```
Content notes for the three new pillars: **life-care-plan-rebuttal** — review of opposing plans for foundation, duplication, frequency/duration support, pricing methodology, and life expectancy basis; deliverable is a written critique + optional alternative plan. **medicare-set-aside** — WCMSA and liability MSA allocation reports prepared by an MSCC; process includes Medicare entitlement review, rated-age when applicable, allocation by CMS methodology, and optional submission support; note "in coordination with counsel regarding CMS review thresholds" without citing regulations. **elder-and-long-term-care-planning** — non-litigation plans for families, guardians, trustees, and special-needs trusts; process includes in-home assessment, care-level determination, provider and facility cost research, and annual update options.

- [ ] **Step 4: Switch every enumerator to `pillarServices()`**

In each file under Files → "enumerators", replace `services.map(`/`services.filter(`/`services.forEach(` with `pillarServices().map(` etc. and import `pillarServices`. `practice-areas.ts`: replace `SPECIALTY_TO_SERVICE` with:
```ts
const SPECIALTY_TO_SERVICE: Record<string, string> = {
  "Life Care Planning": "life-care-planning",
  "Pediatric Life Care Planning": "pediatric-life-care-planning",
  "Catastrophic Injury": "catastrophic-injury-planning",
  "Medical Cost Projection": "medical-cost-projection",
  "Medicare Set-Aside": "medicare-set-aside",
  "Life Care Plan Review": "life-care-plan-rebuttal",
  "Elder Care Planning": "elder-and-long-term-care-planning",
  "Expert Testimony": "expert-witness-testimony",
  "Medical-Legal Consulting": "expert-witness-testimony",
  "Functional Capacity Evaluation": "life-care-planning",
};
```
`ServicePillar.tsx`: if `service.pillar === false`, render a short card with an external `<a href={service.externalUrl}>` and `noindex` meta instead of the full pillar. `scripts/generate-sitemap.mjs` and `scripts/prerender.mjs`: where service slugs are regex-extracted from `services.ts`, split the file on `{\n    slug:` object boundaries and skip any block containing `pillar: false`. Add a unit test in `scripts/sitemap-index.test.mjs`: `it("never emits forensic-economics service URLs", ...)` asserting no sitemap URL contains `/services/forensic-economics`.

- [ ] **Step 5: Run type-check and tests**

Run: `npx tsc -b && npx vitest run src/data/services.test.ts src/data/services.pillar.test.ts src/lib` — Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(services): 11 LCP services with pillar flag; enumerators use pillarServices()"
```

---

### Task 6: Case types and credentials

**Files:**
- Modify: `src/data/caseTypes.ts`, `src/data/credentials.ts`, `src/data/journeys.ts` (stage copy for the 2 new case types), `src/pages/internal-links.render.test.tsx` (count expectations)
- Create: `src/data/caseTypes.test.ts`, `src/data/credentials.test.ts`

**Interfaces:**
- Produces: `caseTypes` (11) with `relevantServices` restricted to the 10 pillar slugs; `credentials` (8) with `kwvrsExpertsSlugs` renamed to `expertSlugs` (update every consumer: `grep -rn kwvrsExpertsSlugs src`).

- [ ] **Step 1: Write the failing tests**

`src/data/caseTypes.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { caseTypes } from "./caseTypes";
import { getAllServiceSlugs } from "./services";

describe("LCP case types", () => {
  it("has the 11 LCP case types", () => {
    expect(caseTypes.map((c) => c.slug).sort()).toEqual(["amputation","birth-injury","burn-injury","cerebral-palsy","medical-malpractice","motor-vehicle-accident","personal-injury","spinal-cord-injury","traumatic-brain-injury","workers-compensation","wrongful-death"]);
  });
  it("references only pillar services and has LCP impact copy", () => {
    const pillars = new Set(getAllServiceSlugs());
    for (const c of caseTypes) {
      for (const s of c.relevantServices) expect(pillars.has(s), `${c.slug} -> ${s}`).toBe(true);
      expect(c.lifeCareImpact?.length, c.slug).toBeGreaterThan(200);
      expect(c.faqs.length, c.slug).toBeGreaterThanOrEqual(3);
    }
  });
});
```
`src/data/credentials.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { credentials } from "./credentials";
describe("LCP credentials", () => {
  it("has exactly the 8 LCP-relevant credentials", () => {
    expect(credentials.map((c) => c.slug).sort()).toEqual(["cdms","clcp","cnlcp","crc","md","mscc","phd","rn"]);
  });
  it("each has scope, >=3 requirements, >=2 faqs", () => {
    for (const c of credentials) {
      expect(c.scope.length, c.slug).toBeGreaterThan(100);
      expect(c.requirements.length, c.slug).toBeGreaterThanOrEqual(3);
      expect(c.faqs.length, c.slug).toBeGreaterThanOrEqual(2);
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/data/caseTypes.test.ts src/data/credentials.test.ts` — Expected: FAIL.

- [ ] **Step 3: Edit `caseTypes.ts`**

Delete `long-term-disability`, `wrongful-termination`, `matrimonial`. Change `CaseTypeCategory` to `"personal-injury" | "workers-comp" | "med-mal" | "wrongful-death" | "birth-injury"`. Rename fields `vocationalImpact` → `careNeeds` and `economicExposure` → `costExposure` across the type, every entry, and every consumer (`grep -rn "vocationalImpact\|economicExposure" src scripts`); rewrite each surviving entry's `summary`, `careNeeds`, `costExposure`, and FAQs to frame the case type from the life care planner's perspective (care categories, typical frequency/duration questions, life expectancy considerations, who is retained and when). `relevantServices` for each: pick from the 10 pillar slugs (e.g. TBI → `life-care-planning`, `catastrophic-injury-planning`, `medical-cost-projection`, `expert-witness-testimony`). `relevantCredentials` from the 8 slugs.

Add two entries in the same shape:
```ts
  {
    slug: "birth-injury",
    name: "Birth Injury",
    category: "birth-injury",
    summary: "Birth injury matters involve harm to an infant during labor and delivery, including hypoxic-ischemic encephalopathy, brachial plexus injury, and intracranial hemorrhage. Because the injured child has a full life ahead, the life care plan is usually the single largest component of damages and must address needs from infancy through adulthood.",
    careNeeds: "Pediatric plans address neurology and developmental pediatrics follow-up, physical, occupational, and speech therapy, durable medical equipment sized and replaced as the child grows, seizure management, feeding support, educational and behavioral services, respite and attendant care, and the transition to adult providers and residential options after age 21.",
    costExposure: "Costs are driven by attendant-care hours, equipment replacement cycles, therapy frequency by developmental stage, and the child's projected life expectancy. Plans commonly present alternative scenarios for home-based versus facility-based care so counsel and the economist can value each.",
    lifeCareImpact: "The plan is built with the treating neurologist and developmental pediatrician and updated at developmental milestones. Life expectancy is analyzed from the child's functional profile rather than population tables alone, and the plan documents the basis for each frequency and duration recommendation.",
    relevantServices: ["pediatric-life-care-planning", "life-care-planning", "medical-cost-projection", "expert-witness-testimony"],
    relevantCredentials: ["clcp", "cnlcp", "md", "rn"],
    icdCodes: ["P10", "P11", "P14", "P91.6"],
    faqs: [
      { question: "When should a life care planner be retained in a birth injury case?", answer: "Early enough to attend or review the initial neurodevelopmental evaluations, typically once liability review confirms the case will proceed. Early retention lets the planner document baseline function before growth changes the picture." },
      { question: "How is a child's life expectancy handled in the plan?", answer: "The planner documents the child's functional status, feeding method, mobility, and seizure control, and presents the life expectancy analysis with its sources so counsel can decide how to present it. Where the medical literature supports a range, the plan shows the cost impact of each end of that range." },
      { question: "Does the plan cover care after the child turns 21?", answer: "Yes. Pediatric plans project the transition to adult providers, vocational or day-program services, and long-term residential or in-home care through the projected life expectancy." },
    ],
    sources: [],
  },
  {
    slug: "cerebral-palsy",
    name: "Cerebral Palsy",
    category: "birth-injury",
    summary: "Cerebral palsy matters, whether arising from birth injury or pediatric medical negligence, require a plan that scales with the child's Gross Motor Function Classification level and evolves through developmental stages into adulthood.",
    careNeeds: "Plans address orthopedic and neurology follow-up, spasticity management including botulinum toxin and baclofen pump care, orthotics and seating replaced with growth, therapies, communication devices, home accessibility, transportation, attendant care, and adult residential or supported-living options.",
    costExposure: "Attendant care and equipment dominate the cost profile. Frequency and replacement schedules are tied to the child's functional level and growth, and plans typically present home-based and facility-based scenarios.",
    lifeCareImpact: "The life care planner works with the physiatrist, orthopedist, and therapy team to document current needs, then projects changes at each developmental transition. The plan explains the basis for every frequency and replacement cycle so it can withstand cross-examination.",
    relevantServices: ["pediatric-life-care-planning", "catastrophic-injury-planning", "life-care-planning", "expert-witness-testimony"],
    relevantCredentials: ["clcp", "cnlcp", "md", "rn"],
    icdCodes: ["G80", "G80.0", "G80.1", "G80.9"],
    faqs: [
      { question: "How does functional classification affect the plan?", answer: "Higher classification levels generally mean more attendant care, more complex equipment, and more frequent medical follow-up. The plan states the child's current level and the clinical basis for projecting future needs." },
      { question: "Are educational services included in a cerebral palsy life care plan?", answer: "The plan documents educational supports the child needs and distinguishes services provided by public programs from those the family must fund privately, so counsel can address collateral-source questions in the jurisdiction." },
      { question: "How often should a pediatric plan be updated?", answer: "At major developmental transitions or at least every few years while the child is growing, and again before the transition to adult services." },
    ],
    sources: [],
  },
```
`journeys.ts`: for each of the 4 stages, add stage copy entries keyed `birth-injury` and `cerebral-palsy` in the existing shape (copy the `traumatic-brain-injury` entry for each stage and rewrite the text for the pediatric context); delete entries for the 3 removed case types.

- [ ] **Step 4: Edit `credentials.ts`**

Delete `cve`, `abve-d`, `abve-f`, `lrc`, `fve`, `ipec`, `cprw`, `ceas`. Rename `kwvrsExpertsSlugs` → `expertSlugs` (type + entries + consumers). Rewrite `crc`, `md`, `rn`, `phd` scope/admissibility copy from an LCP standpoint (no transferable-skills/labor-market phrasing). Add three entries in the existing shape:
- `cnlcp` — Certified Nurse Life Care Planner, issuer "American Association of Nurse Life Care Planners" (`https://www.aanlcp.org/`), scope: nurse-led life care planning grounded in the nursing process; requirements: active RN license, LCP education hours, examination, renewal CE; admissibility: routinely accepted where the nurse planner documents methodology and clinical foundation.
- `mscc` — Medicare Set-Aside Certified Consultant, issuer "International Commission on Health Care Certification" (`https://www.ichcc.org/`), scope: preparation of WCMSA and liability MSA allocations; requirements: qualifying professional credential, MSA training program, examination, renewal; admissibility: MSA reports are primarily settlement and compliance documents; testimony arises when allocation methodology is disputed.
- `cdms` — Certified Disability Management Specialist, issuer "Commission on Rehabilitation Counselor Certification" (`https://www.crccertification.com/`), scope: disability management and return-to-work planning relevant to workers' compensation life care plans; requirements: qualifying degree/experience, examination, renewal CE.
Set `expertSlugs`: `clcp` → all CLCP holders (`jesse-wolstein`, `paul-bourgeois`, `daniel-wolstein`, `christopher-skerritt`, `matthew-putts`), `mscc` → `["christopher-skerritt"]`, `md` → `["jesse-wolstein"]`, `rn` → `["christina-rivera"]`, `phd` → `["paul-bourgeois"]`, `crc` → `["paul-bourgeois","daniel-wolstein","matthew-putts"]`, `cnlcp`/`cdms` → `[]`.

- [ ] **Step 5: Retune `internal-links.render.test.tsx`**

Update any hard-coded counts to 11 case types × 56 states and 8 credentials × 56 states; run it and the citations test:
Run: `npx tsc -b && npx vitest run src/data/caseTypes.test.ts src/data/credentials.test.ts src/pages/internal-links.render.test.tsx src/citations.routes.test.mjs`
Expected: PASS for the first three; `citations.routes` may still report dangling links into guides/comparisons removed later — record them, they are fixed in Task 7.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(content): LCP case types (11) and credentials (8) incl. birth injury, CP, CNLCP, MSCC, CDMS"
```

---

### Task 7: Editorial content prune and additions

**Files:**
- Modify: `src/data/methods.ts`, `src/data/guides.ts`, `src/data/comparisons.ts`, `src/data/knowledge.ts`, `src/data/insights.ts`, `src/data/whitePapers.ts`, `src/data/faqs.ts`, `src/data/testimonials.ts`, `src/data/references.ts`, `src/data/references.test.ts`, `src/pages/CaseStudies.tsx`
- Create: `src/data/editorial.test.ts`

**Interfaces:**
- Produces: slugs exactly as listed in spec §4.4 (keep + add columns). Every `[[ref-id]]` marker and `related[].href` resolves (enforced by `src/citations.routes.test.mjs`).

- [ ] **Step 1: Write the failing test**

`src/data/editorial.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { guides } from "./guides";
import { comparisons } from "./comparisons";
import { methods } from "./methods";
import { whitePapers } from "./whitePapers";

const slugs = (xs: { slug: string }[]) => xs.map((x) => x.slug).sort();
describe("LCP editorial set", () => {
  it("guides", () => expect(slugs(guides)).toEqual(["attendant-care-in-life-care-plans","collateral-source-rule-explained","expert-witness-disclosure-rules","federal-vs-state-court-daubert","future-medical-costs-in-personal-injury","home-modification-and-equipment-costing","how-a-life-care-plan-is-priced","how-to-rebut-a-life-care-plan","life-care-plan-vs-medicare-set-aside","pediatric-life-care-plans-and-transition-to-adulthood","standard-of-care-analysis","what-is-life-care-plan","when-do-you-need-expert-witness"]));
  it("comparisons", () => expect(slugs(comparisons)).toEqual(["clcp-vs-case-manager","clcp-vs-cnlcp","fce-vs-ime","in-person-evaluation-vs-file-review","life-care-plan-vs-future-cost-projection","life-care-plan-vs-medical-chronology","life-care-plan-vs-msa","plaintiff-expert-vs-defense-expert"]));
  it("methods", () => expect(slugs(methods)).toEqual(["cost-research-methodology","functional-capacity-evaluation","life-care-plan-development","life-expectancy-in-life-care-planning","msa-allocation-methodology","present-value-analysis"]));
  it("white papers are LCP only", () => expect(whitePapers.every((w) => w.discipline === "Life Care")).toBe(true));
  it("no vocational vocabulary survives in editorial copy", () => {
    const text = JSON.stringify([guides, comparisons, methods]);
    expect(text).not.toMatch(/transferable skills analysis|labor market survey|earning capacity|RAPEL|O\*NET|Dictionary of Occupational Titles/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/editorial.test.ts` — Expected: FAIL.

- [ ] **Step 3: Prune and author**

For each file, delete the entries not in the spec's keep list, rename `worklife-expectancy` → `life-expectancy-in-life-care-planning` (rewrite body: life expectancy sources, rated age, functional adjustments, how the planner presents ranges), and author the new entries in the existing object shape (open the file and copy a surviving entry as the template — every field present in that entry must be present in the new one). Minimum body length per new guide: 900 words, with H2 sections, an FAQ block of ≥3 questions, and `related` links only to routes that exist (services, case types, other guides). Topics:
- `how-a-life-care-plan-is-priced` — hourly structure, retainer, drivers, what inflates cost, how to scope a medical cost projection instead.
- `life-care-plan-vs-medicare-set-aside` — purpose, audience, methodology, what each includes/excludes, when both are needed.
- `pediatric-life-care-plans-and-transition-to-adulthood` — developmental staging, equipment growth cycles, education, age-21 transition, residential options.
- `how-to-rebut-a-life-care-plan` — foundation review, duplication, frequency/duration support, pricing source audit, life expectancy basis, deposition themes.
- `attendant-care-in-life-care-plans` — levels of care, hours methodology, agency vs. private-hire rates, family-provided care, respite.
- `home-modification-and-equipment-costing` — accessibility assessment, one-time vs. recurring items, replacement schedules, vendor quotes vs. databases.
- comparisons `clcp-vs-cnlcp`, `life-care-plan-vs-msa`; methods `cost-research-methodology` (geographic pricing, databases, provider surveys, documentation), `msa-allocation-methodology` (entitlement review, allocation categories, rated age, professional administration).
`references.ts`: prune vocational-only entries; add entries for the IALCP Standards of Practice, AANLCP scope of practice, CMS WCMSA Reference Guide, and CDC life tables (tier `verified` only if you open the URL and confirm it resolves — otherwise tier `unverified`). Retune `references.test.ts` counts to the new registry. `faqs.ts`/`testimonials.ts`: keep only LCP-relevant items, rewrite brand references. `CaseStudies.tsx`: keep only LCP case studies; if fewer than 3 remain, write anonymized LCP case narratives (TBI adult, birth injury, SCI workers' comp) with no client-identifying details.

- [ ] **Step 4: Run editorial + link tests**

Run: `npx tsc -b && npx vitest run src/data src/citations.routes.test.mjs src/pages/internal-links.render.test.tsx`
Expected: PASS, zero dangling links.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(content): LCP editorial set — guides, comparisons, methods, references"
```

---

### Task 8: Team roster

**Files:**
- Modify: `src/data/team.ts`, `src/data/team.test.ts`, `src/data/team.expert-picker.parity.test.ts` (rename to `team.tiers.test.ts`), `src/pages/Team.tsx` (section headings)

**Interfaces:**
- Produces: `team`, `activeTeam`, `retainableExperts()`, `getTeamBySlug`, `getMemoriam` unchanged in signature; roster = the 12 members in spec §4.5.

- [ ] **Step 1: Write the failing test**

Replace `src/data/team.test.ts` with:
```ts
import { describe, expect, it } from "vitest";
import { team, activeTeam, retainableExperts, getMemoriam } from "./team";

describe("KW LCP team", () => {
  it("has the LCP roster", () => {
    expect(team.map((m) => m.slug).sort()).toEqual(["abigail-wolstein","cara-creighton","charles-kincaid","christina-rivera","christopher-skerritt","daniel-wolstein","danielle-vallone","jesse-wolstein","lizette-mendoza","matthew-putts","paul-bourgeois","rebecca-wolstein"]);
  });
  it("Jesse Wolstein leads as Chief Medical Director & Life Care Planner", () => {
    const j = team.find((m) => m.slug === "jesse-wolstein")!;
    expect(j.title).toBe("Chief Medical Director & Life Care Planner");
    expect(j.credentials).toContain("CLCP");
    expect(j.bio).toMatch(/board-certified emergency medicine physician/);
  });
  it("Christopher Skerritt carries MSCC for the MSA practice", () => {
    expect(team.find((m) => m.slug === "christopher-skerritt")!.credentials).toContain("MSCC");
  });
  it("memoriam is excluded from active and retainable lists", () => {
    expect(getMemoriam().map((m) => m.slug)).toEqual(["charles-kincaid"]);
    expect(activeTeam.some((m) => m.memoriam)).toBe(false);
    expect(retainableExperts().some((m) => m.memoriam)).toBe(false);
  });
  it("no bio mentions the vocational brand", () => {
    for (const m of team) expect(`${m.bio} ${m.fullBio ?? ""}`, m.slug).not.toMatch(/KWVRS|Kincaid Wolstein Vocational/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/team.test.ts` — Expected: FAIL.

- [ ] **Step 3: Edit `team.ts`**

Delete every member not in the roster. For `jesse-wolstein`, `cara-creighton`, `lizette-mendoza` take title/bio/specialties from `KW-LIFECARE-SITE/src/data/team.ts`. For the rest, keep kwvrs facts (education, publications, `sameAs`, `imageUrl`) but rewrite `bio`/`fullBio` to lead with the LCP role: Paul Bourgeois "Chief of Life Care Planning"; Daniel Wolstein "Chief Executive Officer" (CLCP); Christopher Skerritt "Chief of Economic Services & Medicare Set-Aside Consultant" with `credentials` including `"MSCC"` and specialties including `"Medicare Set-Aside"`; Matthew Putts "Senior Life Care Planner" (CLCP) — specialties `["Life Care Planning","Expert Testimony"]`; Christina Rivera "Life Care Planner"; chronologists and administrators as support (no `expertTier`). Map specialties to the Task 5 `SPECIALTY_TO_SERVICE` keys so practice areas render. `expertTier`: `senior` = Jesse, Paul, Dan; `fellow` = Christopher, Matthew, Christina. Keep `charles-kincaid` with `memoriam: true`.

- [ ] **Step 4: Retune tier test and Team page**

Rename `team.expert-picker.parity.test.ts` → `team.tiers.test.ts`, keep only the tier/memoriam invariants (drop anything importing `intakeForms`). `Team.tsx`: section headings "Life Care Planning Leadership", "Life Care Planners", "Plan Administration & Medical Chronology", "In Memoriam".

Run: `npx tsc -b && npx vitest run src/data/team.test.ts src/data/team.tiers.test.ts src/lib/practice-areas*.test.*` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(team): LCP roster with MSA lead and LCP-first bios"
```

---

### Task 9: Geo content re-slant

**Files:**
- Modify: `src/data/narratives.ts`, `src/data/geographicFaqs.ts`, `src/data/local-content.ts`, `src/data/regulations/state-regs.ts`, `src/types/index.ts` (`StateRegulation`), `scripts/prerender.mjs` (mirrors of narratives/geoFaqs), `src/pages/ServiceState.tsx`, `src/pages/ServiceStateCity.tsx`, `src/pages/CityPage.tsx`, `src/pages/StateHub.tsx`, `src/components/LaborDataWidget.tsx`
- Create: `src/data/narratives.test.ts`

**Interfaces:**
- Produces: `getStateNarrative(stateSlug, serviceSlug?)`, `getCityNarrative(stateSlug, citySlug, serviceSlug?)`, `serviceCityGeographicFaqs(service, state, city)` — same signatures as today, LCP prose. `StateRegulation.vocationalRehabAgency` → `careOversightAgency` (state health/insurance/WC agency name), `licensingRequirements` → `practiceContext`.

- [ ] **Step 1: Write the failing test**

`src/data/narratives.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { getStateNarrative, getCityNarrative } from "./narratives";
import { serviceCityGeographicFaqs } from "./geographicFaqs";
import { getServiceBySlug } from "./services";
import { states } from "./states";

describe("LCP geo narratives", () => {
  it("state narrative talks about care costs, not labor markets", () => {
    const text = getStateNarrative("new-jersey", "life-care-planning");
    expect(text).toMatch(/attendant care|home health|provider|cost of care/i);
    expect(text).not.toMatch(/labor market|unemployment rate|median hourly wage|employers/i);
  });
  it("city narrative and FAQs are LCP-framed for every state's largest city", () => {
    for (const st of states) {
      const city = st.largestCity.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const text = getCityNarrative(st.slug, city, "life-care-planning");
      if (!text) continue; // cities without a data row are allowed to fall back
      expect(text, `${st.slug}/${city}`).not.toMatch(/labor market|unemployment/i);
    }
    const faqs = serviceCityGeographicFaqs(getServiceBySlug("life-care-planning")!, states[0], { slug: "x", name: "Sample City", stateSlug: states[0].slug } as never);
    expect(faqs.length).toBeGreaterThanOrEqual(3);
    expect(JSON.stringify(faqs)).not.toMatch(/vocational expert|earning capacity/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/narratives.test.ts` — Expected: FAIL.

- [ ] **Step 3: Rewrite the generators**

`narratives.ts`: keep the data joins (courts, regs, metro/state labor for population and MSA name only) but rewrite every sentence template around: cost-of-care variation by region, availability of specialist providers and rehabilitation facilities, home health and attendant-care rate context, the state's trial-court venues where these cases are heard, and how the planner prices items for that locality. Do not print unemployment rates, wages, or employer lists. `geographicFaqs.ts`: rewrite question templates to the LCP context (e.g. "How does a life care planner price attendant care in {city}?", "Do you conduct in-home assessments in {city}, {state}?", "Which courts in {state} hear the cases your plans support?"). `state-regs.ts`: rename fields per Interfaces and rewrite each of the 57 entries' `practiceContext` in one or two citation-free sentences on the state's workers' compensation and medical malpractice venue context relevant to life care plans. `LaborDataWidget.tsx`: delete the component and its usages, or repurpose to a `CareContextWidget` showing population, MSA, and major medical centers if that data exists in `metro-labor.ts` (`topEmployers` often contains health systems — filter to entries matching `/health|hospital|medical/i`). `local-content.ts`: keep the 12 essays, replace brand strings, re-slant any vocational sentences. `scripts/prerender.mjs`: update its mirrored narrative/FAQ generator copies so prerendered shells match the runtime text (there is a parity test — `src/lib/geo-links.parity.test.mjs` — extend it to compare one state narrative between the two implementations).

- [ ] **Step 4: Run tests**

Run: `npx tsc -b && npx vitest run src/data/narratives.test.ts src/lib/geo-links.parity.test.mjs src/data/contentReadiness.test.ts` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(geo): re-slant state/city narratives, FAQs, and regulations for life care planning"
```

---

### Task 10: Home, About, Contact, cross-sell, theme, brand assets

**Files:**
- Modify: `src/pages/Home.tsx`, `src/pages/About.tsx`, `src/pages/Contact.tsx`, `src/pages/ScheduleConsultation.tsx`, `src/pages/FAQ.tsx`, `src/pages/Privacy.tsx`, `src/pages/Terms.tsx`, `src/pages/ServicesHub.tsx`, `src/index.css:3-32`, `public/images/logo.svg`, `public/images/logo.png`, `public/manifest.json`, `public/favicon.svg`
- Create: `src/components/CrossSell.tsx`, `src/components/CrossSell.render.test.tsx`

**Interfaces:**
- Produces: `<CrossSell />` — the only component allowed to name kwvrs.com; rendered on Home, ServicesHub, and Tools.

- [ ] **Step 1: Write the failing test**

`src/components/CrossSell.render.test.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import CrossSell from "./CrossSell";

describe("CrossSell", () => {
  it("links the sister practices with rel=noopener and no nofollow", () => {
    const html = renderToStaticMarkup(<MemoryRouter><CrossSell /></MemoryRouter>);
    expect(html).toContain('href="https://kwvrs.com/services/vocational-expert"');
    expect(html).toContain('href="https://kwvrs.com/services/forensic-economics"');
    expect(html).toContain('rel="noopener"');
    expect(html).not.toContain("nofollow");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/CrossSell.render.test.tsx` — Expected: FAIL.

- [ ] **Step 3: Create `CrossSell.tsx`**

```tsx
import { Briefcase, TrendingUp } from "lucide-react";

const SISTER = [
  { name: "Vocational Expert Services", href: "https://kwvrs.com/services/vocational-expert", blurb: "Earning capacity, employability, and vocational rehabilitation opinions from Kincaid Wolstein Vocational and Rehabilitation Services.", Icon: Briefcase },
  { name: "Forensic Economics", href: "https://kwvrs.com/services/forensic-economics", blurb: "Present-value analysis of life care plan costs and lost earnings by the group's forensic economists.", Icon: TrendingUp },
];

export default function CrossSell() {
  return (
    <section aria-labelledby="cross-sell-heading" className="bg-neutral-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 id="cross-sell-heading" className="font-serif text-2xl text-navy">Part of the Kincaid Wolstein family of expert practices</h2>
        <p className="mt-2 max-w-2xl text-neutral-600">Life care plans rarely stand alone. When a matter also needs vocational or economic opinions, our sister practices coordinate directly with the life care planner.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {SISTER.map(({ name, href, blurb, Icon }) => (
            <a key={href} href={href} rel="noopener" className="group rounded-lg border border-neutral-200 bg-white p-6 transition hover:border-teal">
              <Icon className="h-6 w-6 text-teal" aria-hidden="true" />
              <h3 className="mt-3 font-semibold text-navy group-hover:text-teal">{name}</h3>
              <p className="mt-1 text-sm text-neutral-600">{blurb}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Page copy and theme**

`Home.tsx`: eyebrow "Certified Life Care Planners", H1 "Life Care Plans That Document the Future of Care", subhead from KW-LIFECARE-SITE (`KW Life Care Planning produces independent, evidence-based life care plans and medical cost projections for plaintiff and defense counsel in all 50 states, the District of Columbia, and U.S. territories.`), "How We Work" 4-up (Objective Analysis / Physician-Led Planning / Clinical Foundation / Nationwide Practice — copy from that file), service grid = `pillarServices().filter(s => s.slug !== "expert-witness-testimony")`, then `<CrossSell />`. `About.tsx`: history paragraph names the parent firm via `ORG_LEGAL` once; mission = independent, physician-led life care planning. `Contact.tsx`/`ScheduleConsultation.tsx`: remove rush toggle and retainer/intake references; fields name, email, phone, firm, case type (select from case types), message. `Privacy.tsx`/`Terms.tsx`: entity = `ORG_LEGAL` d/b/a `ORG_NAME`. `ServicesHub.tsx`: `<CrossSell />` at the bottom.

`src/index.css` `@theme`:
```css
  --color-navy: #14223d;
  --color-navy-light: #2a3a5c;
  --color-navy-dark: #0c1729;
  --color-teal: #0d7377;
  --color-teal-light: #14a3a8;
  --color-teal-dark: #095457;
  --color-amber: #b8731f;
  --color-amber-light: #d4922e;
  --color-amber-dark: #8a5612;
  --color-forest: #0d7377;
```
Then audit primary CTAs: `grep -rn "bg-amber\b\|bg-amber " src/components/ui src/components/layout src/pages/Home.tsx` and switch the primary button/CTA classes from amber to `bg-teal hover:bg-teal-dark text-white`; amber stays on `StatBar` and highlight underlines.

Assets: `public/images/logo.svg` — text wordmark "KW" (navy, Source Serif 4 bold) + "Life Care Planning" (teal, Inter) in a 600×257 viewBox; export `logo.png` at 600×257 with `npx --yes sharp-cli -i public/images/logo.svg -o public/images/logo.png` (or `rsvg-convert`); regenerate `favicon.svg` using the teal on the existing KW mark; `manifest.json` name/short_name → brand.

- [ ] **Step 5: Run tests**

Run: `npx tsc -b && npx vitest run src/components/CrossSell.render.test.tsx src/components src/pages` — Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(ui): LCP home/about/contact copy, teal accent, cross-sell to sister practices, logo"
```

---

### Task 11: Brand string sweep and guard

**Files:**
- Create: `src/brand-strings.test.mjs`
- Modify: every file `grep -rlE "KWVRS|kwvrs\.com|Kincaid Wolstein" src` reports, except `src/lib/brand.ts` and `src/components/CrossSell.tsx`

**Interfaces:**
- Consumes: `ORG_NAME`, `ORG_SHORT`, `ORG_LEGAL`, `SITE_URL`, `ORG_EMAIL`, `ORG_PHONE` from `@/lib/brand`.

- [ ] **Step 1: Write the failing guard**

`src/brand-strings.test.mjs`:
```js
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ALLOW = new Set(["src/lib/brand.ts", "src/components/CrossSell.tsx", "src/brand-strings.test.mjs"]);
const PATTERN = /KWVRS|kwvrs\.com|Kincaid Wolstein/;
function walk(dir, out = []) { for (const f of readdirSync(dir)) { const p = join(dir, f); statSync(p).isDirectory() ? walk(p, out) : out.push(p); } return out; }

describe("brand strings are centralized", () => {
  it("no src file outside the allow-list names the vocational brand", () => {
    const offenders = walk("src").filter((p) => !ALLOW.has(p) && PATTERN.test(readFileSync(p, "utf8")));
    expect(offenders).toEqual([]);
  });
  it("no file references the old domain in scripts, server, or public text", () => {
    const files = [...walk("scripts"), "server.js", "index.html", "public/llms.txt", "public/robots.txt", "public/manifest.json"].filter((p) => !/\.test\./.test(p) && !p.endsWith(".png") && !p.endsWith(".jpg") && !p.endsWith(".webp"));
    const offenders = files.filter((p) => { try { return /kwvrs\.com/.test(readFileSync(p, "utf8")); } catch { return false; } });
    expect(offenders).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to see the offender list**

Run: `npx vitest run src/brand-strings.test.mjs` — Expected: FAIL with the file list (expect ~80 files).

- [ ] **Step 3: Sweep**

For each offender: import from `@/lib/brand` and interpolate (`{ORG_NAME}` in JSX, `${ORG_NAME}` in template strings, `ORG_NAME + "..."` in data), replacing "KWVRS" with `ORG_SHORT` where used as a short name and "Kincaid Wolstein Vocational and Rehabilitation Services" with `ORG_NAME` (or `ORG_LEGAL` only in Privacy/Terms/About history). Replace `https://kwvrs.com` with `SITE_URL`; `info@kwvrs.com` with `ORG_EMAIL`. In `src/data/*.ts` prose, prefer rewriting the sentence so it doesn't need the brand at all. Scripts: replace `const BASE = "https://kwvrs.com"` with `import { SITE_URL as BASE } from "./lib/site.mjs"` in `generate-sitemap.mjs`, `generate-extra-sitemaps.mjs`, `generate-llms.mjs`, `prerender.mjs`, `indexnow-submit.mjs`, and in `scripts/sitemap-index.test.mjs`. `public/robots.txt` sitemap line → `https://kwlcp.com/sitemap.xml`.

- [ ] **Step 4: Run the full suite**

Run: `npx tsc -b && npx vitest run` — Expected: PASS, including `brand-strings`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(brand): sweep hardcoded vocational brand strings; add guard test"
```

---

### Task 12: Build pipeline, sitemap tuning, full build

**Files:**
- Modify: `scripts/generate-sitemap.mjs`, `scripts/sitemap-index.test.mjs`, `scripts/generate-llms.mjs`, `scripts/prerender.mjs`, `package.json` (scripts), `README.md`

**Interfaces:**
- Produces: `npm run build` → `dist/` with sitemap index (5 children + image + news), `llms.txt`, prerendered shells; console page counts per family.

- [ ] **Step 1: Retune the sitemap test**

In `scripts/sitemap-index.test.mjs`: keep the structural assertions; set the services-child crawl-budget ceiling to `3600` (10 pillars × 56 states = 560 + gated cities ≈ 2,750 + case/cost/process/timeline ≈ 110); update any assertion naming a removed service or `expert-disclosure`; add:
```js
it("emits every pillar service × state and no forensic-economics URLs", () => {
  const urls = servicesChildUrls();
  for (const s of PILLARS) for (const st of stateSlugs) expect(urls).toContain(`${BASE}/services/${s}/${st}`);
  expect(urls.some((u) => u.includes("/services/forensic-economics"))).toBe(false);
});
```
(`PILLARS` = the 10 slugs; `stateSlugs` regex-extracted from `src/data/states.ts` the same way the script does it.)

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run scripts/sitemap-index.test.mjs` — Expected: FAIL until the generator drops expert-disclosure handling.

- [ ] **Step 3: Update generators and package scripts**

`generate-sitemap.mjs`: remove the `expert-disclosure` special-case; remove `/samples`, `/cv`, `/forms`, `/payment`, `/intake`, `/tools/economic-damages-estimator`, `/tools/household-services*` from `CORE`; keep `/tools/life-expectancy`. `prerender.mjs`: remove prerender branches for deleted routes (search for each deleted path). `generate-llms.mjs`: rewrite the site summary paragraph for KW LCP and list the 10 pillar services. `package.json`: delete `damages:calc*` scripts; keep `build`, `dev`, `test`, `lint`, `preview`, `generate:sitemaps`, `generate:llms`, `images:webp`, `indexnow`.

- [ ] **Step 4: Full build and count check**

```bash
export PATH=~/.local/node/node-v22.22.0-darwin-arm64/bin:$PATH
npm run build 2>&1 | tail -30
find dist -name index.html | wc -l
grep -c "<loc>" public/sitemap-services.xml public/sitemap-locations.xml public/sitemap-case-types.xml public/sitemap-credentials.xml public/sitemap-core.xml
```
Expected: build succeeds; ~9,000 `index.html`; services child ≈ 3,400; locations 858; case-types 616; credentials 448; core ≈ 120. Record the actual numbers in `README.md` under "Page inventory".

- [ ] **Step 5: Run the full suite and lint**

Run: `npx vitest run && npx eslint .` — Expected: PASS / no errors.

- [ ] **Step 6: Write `README.md`**

Sections: Project (KW LCP, kwlcp.com, parent firm), Local development (Node 22 path, `npm ci`, `dev`, `build`, `test`), Production (`node server.js`, env table from spec §7), Deployment (Railway Dockerfile, healthcheck `/healthz`), Page inventory (numbers from Step 4), Content model (one line per `src/data` file), **Facts to confirm** (spec §11 list verbatim as a checklist), Related repos (kwvrs-site as structural upstream).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "build: LCP sitemap/prerender/llms pipeline; README with page inventory and facts-to-confirm"
```

---

### Task 13: Docker verification and push

**Files:**
- None new (verification only), unless fixes are needed.

- [ ] **Step 1: Build and run the image locally**

```bash
cd "/Users/chrisskerritt/Documents/New project/kwlcp-website"
docker build -t kwlcp . 2>&1 | tail -5
docker run --rm -d -p 3100:3000 -e CANONICAL_HOST= -e LEAD_RECIPIENTS=test@example.com --name kwlcp kwlcp
sleep 3
curl -s localhost:3100/healthz
curl -s -o /dev/null -w "%{http_code}\n" localhost:3100/services/life-care-planning/new-jersey/hackensack
curl -s localhost:3100/services/life-care-planning/new-jersey/hackensack | grep -o "<title>[^<]*"
curl -s -o /dev/null -w "%{http_code}\n" localhost:3100/services/forensic-economics/new-jersey
curl -s -X POST localhost:3100/api/contact -H 'content-type: application/json' -d '{"name":"Test Attorney","email":"test@example.com","phone":"2015551212","message":"Docker smoke test"}'
docker logs kwlcp 2>&1 | tail -5
docker stop kwlcp
```
Expected: `{"ok":true,...}`; `200`; a title containing "Life Care Planning" and "Hackensack"; `404` for the forensic-economics geo page; `{"success":true}`; a log line `lead email failed ... RESEND_API_KEY unset` (expected without a key — proves the pipeline reached the mailer).

- [ ] **Step 2: Fix anything that failed, re-run Step 1 until clean, then run the suite once more**

Run: `npx vitest run` — Expected: PASS.

- [ ] **Step 3: Push**

```bash
git push -u origin main
```

- [ ] **Step 4: Report**

Post the page inventory, the Docker smoke results, and the facts-to-confirm checklist from README. Do not create the Railway service or DNS — those are Chris's calls (spec §10).
