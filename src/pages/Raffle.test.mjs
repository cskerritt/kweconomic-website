// Source-read guards (precedent: Payment.test.mjs). vitest runs in a node env
// (no DOM), so the /raffle contract is pinned at source level; the companion
// Raffle.render.test.tsx additionally asserts the initial rendered form.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "Raffle.tsx"), "utf8");
const appSrc = readFileSync(join(here, "../App.tsx"), "utf8");
const serverSrc = readFileSync(join(here, "../../server.js"), "utf8");

describe("Raffle page: reuses the site's anti-spam form primitives", () => {
  it("renders the shared Turnstile widget and hidden honeypot", () => {
    expect(src).toContain('import Turnstile from "@/components/Turnstile"');
    expect(src).toContain('import HoneypotField from "@/components/HoneypotField"');
    expect(src).toContain("<Turnstile onToken={setTurnstileToken} />");
    expect(src).toContain("<HoneypotField onChange={setCompanyWebsite} />");
  });

  it("posts to /api/raffle with the token + honeypot in the body", () => {
    expect(src).toContain('const ENDPOINT = "/api/raffle"');
    expect(src).toContain("fetch(ENDPOINT");
    expect(src).toMatch(/turnstileToken, company_website: companyWebsite/);
  });

  it("uses the shared pure logic instead of re-implementing validation or the payload", () => {
    expect(src).toContain('from "../../lib/raffle.mjs"');
    expect(src).toContain("validateRaffleFields(fields)");
    expect(src).toContain("buildRafflePayload(");
  });
});

describe("Raffle page: event parameterization", () => {
  it("reads ?event= from the URL and normalizes it before posting", () => {
    expect(src).toContain("useSearchParams");
    expect(src).toContain('searchParams.get("event")');
    expect(src).toContain("normalizeEventSlug(");
  });

  it("canonicalizes to the bare /raffle URL and stays noindex", () => {
    expect(src).toContain("noindex: true");
    expect(src).toContain("`${ORG_URL}/raffle`");
  });
});

describe("Raffle page: required + optional fields", () => {
  it("requires first name, last name, and email; firm and phone are optional", () => {
    for (const id of ["rf-firstName", "rf-lastName", "rf-email", "rf-firm", "rf-phone"]) {
      expect(src).toContain(`id="${id}"`);
    }
    expect(src).toMatch(/Law firm[\s\S]{0,200}\(optional\)/);
    expect(src).toMatch(/Mobile phone[\s\S]{0,200}\(optional\)/);
  });
});

describe("Raffle page: entry states", () => {
  it("confirms a new entry and separately confirms an already-entered scan", () => {
    expect(src).toContain('setStatus("entered")');
    expect(src).toContain('setStatus("already")');
    expect(src).toContain("body.duplicate");
    expect(src).toMatch(/already entered/i);
  });

  it("carries the low-key services line with a link to the site, in objective tone", () => {
    expect(src).toContain("independent vocational and life care planning analysis nationwide");
    expect(src).toContain('href="/services"');
    for (const banned of ["maximize", "fight for", "win your case"]) {
      expect(src.toLowerCase()).not.toContain(banned);
    }
  });

  it("never dead-ends an entrant: verification and busy failures both keep the form usable", () => {
    expect(src).toContain('setNotice({ kind: "verify" })');
    expect(src).toContain('setNotice({ kind: "busy" })');
    expect(src).toContain('setTurnstileToken("")');
  });
});

describe("Raffle page: disclosures", () => {
  it("renders the shared official-rules constant rather than inline copy", () => {
    expect(src).toContain("RAFFLE_RULES.map");
    expect(src).toContain("RAFFLE_PRIZE");
    expect(src).toMatch(/Official rules/i);
  });

  it("uses hyphens, never em dashes (CLAUDE.md content rule)", () => {
    expect(src).not.toContain("—");
  });
});

describe("/raffle routing (link-only, noindex, unlisted)", () => {
  it("App.tsx registers /raffle", () => {
    expect(appSrc).toContain('<Route path="/raffle" element={<Raffle />} />');
  });

  it("server.js serves /raffle as a client-only route (200 + X-Robots-Tag noindex)", () => {
    expect(serverSrc).toMatch(/pathname === "\/raffle"/);
  });

  // Named for what it actually reads: the COMMITTED sitemap, the generator that
  // rewrites it, and the prerender route list - all sources. `npm run build`
  // regenerates public/sitemap.xml and then prerenders, so the absence of
  // /raffle from the shipped dist/ is guaranteed by that build (the build gate),
  // not by this test.
  it("stays out of the sitemap sources and the prerender route list (dist/ is the build gate's job)", async () => {
    // sitemap.xml is a sitemap INDEX; scan the page URLs across its children.
    const { collectSitemapPageUrls } = await import("../../scripts/lib/sitemap-urls.mjs");
    const sitemapUrls = collectSitemapPageUrls(join(here, "../../public/sitemap.xml"));
    expect(sitemapUrls.filter((u) => u.includes("kwvrs.com/raffle"))).toEqual([]);
    // The committed file is an artifact; the generator is the source of truth.
    const generator = readFileSync(join(here, "../../scripts/generate-sitemap.mjs"), "utf8");
    // Match only QUOTED occurrences: a future comment mentioning /raffle in
    // prose must not fail this, but a route string literal must.
    expect(generator).not.toMatch(/["'`]\/raffle["'`]/);
    const prerender = readFileSync(join(here, "../../scripts/prerender.mjs"), "utf8");
    // Both quote styles - the route list is hand-edited and either is idiomatic.
    expect(prerender).not.toContain('"/raffle"');
    expect(prerender).not.toContain("'/raffle'");
  });
});
