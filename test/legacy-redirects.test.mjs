import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createServer, request as httpRequest } from "node:http";
import { once } from "node:events";

// Coverage for the Search Console 404 remediation (2026-07-27) in server.js:
//
//   1. getRedirectTarget - the expanded legacy 301 map: old WordPress posts,
//      .htm pages, category archives, the client-portal regex family, the flat
//      geo pages (/services/forensic-economics-hawaii-...), the old
//      /services/<case-type>/ trees, and legacy uploaded PDFs.
//   2. isLegacyGone - dead media/assets answered 410 from the not-found
//      fallthrough (never shadowing real files under the same prefixes).
//   3. Over a real ephemeral listener: 301 statuses + Location headers, the
//      trailing-slash canonicalization, 410 for dead assets, current /images
//      files still served 200, and the plain-404 catch-all untouched.

import { getRedirectTarget, isLegacyGone, requestHandler } from "../server.js";

describe("getRedirectTarget (legacy 301 map)", () => {
  it("maps old core pages and .htm pages", () => {
    expect(getRedirectTarget("/about-us")).toBe("/about");
    expect(getRedirectTarget("/about-us/")).toBe("/about");
    expect(getRedirectTarget("/contact_us.htm")).toBe("/contact");
    expect(getRedirectTarget("/faqs/")).toBe("/resources/faq");
    expect(getRedirectTarget("/privacy-policy/")).toBe("/privacy");
    expect(getRedirectTarget("/expertise/")).toBe("/services");
    expect(getRedirectTarget("/expertise/occupational-therapy/expert-witness/")).toBe("/services");
    expect(getRedirectTarget("/types-of-cases/")).toBe("/case-types");
    expect(getRedirectTarget("/pay-bills/")).toBe("/payment");
    expect(getRedirectTarget("/payments/index.htm")).toBe("/payment");
  });

  it("sends the two old posts that still rank to their topical guides, not the service pillars", () => {
    expect(getRedirectTarget("/rapel-model-explained/")).toBe("/guides/rapel-method-explained");
    expect(getRedirectTarget("/lifecare-planning-after-injuries/")).toBe("/guides/what-is-life-care-plan");
  });

  it("maps the URLs the Search Analytics traffic audit found broken (2026-08-23)", () => {
    // Old WP post; the slash canonicalizer sent it to a no-slash 404.
    expect(getRedirectTarget("/wrongful-termination-and-mitigation/")).toBe("/case-types/wrongful-termination");
    expect(getRedirectTarget("/wrongful-termination-and-mitigation")).toBe("/case-types/wrongful-termination");
    // Legacy sample PDF still earning clicks; siblings already land on /samples.
    expect(getRedirectTarget("/content/uploads/2026/02/Sample-Loss-of-Household-Services-Report.pdf")).toBe("/samples");
    expect(getRedirectTarget("/wp-content/uploads/2026/02/Sample-Loss-of-Household-Services-Report.pdf")).toBe("/samples");
  });

  it("maps a retired team profile to the team index (GSC 2026-08-22 validation miss)", () => {
    expect(getRedirectTarget("/team/courtney-tremonte")).toBe("/team");
    expect(getRedirectTarget("/team/courtney-tremonte/")).toBe("/team");
    expect(getRedirectTarget("/team/christopher-skerritt")).toBe(null);
  });

  it("maps old blog posts to topical equivalents (GSC examples included)", () => {
    expect(getRedirectTarget("/matrimonial-matters/")).toBe("/services/matrimonial");
    expect(getRedirectTarget("/vocational-evaluation-family-law-and-alimony/")).toBe("/services/matrimonial");
    expect(getRedirectTarget("/vocational-evaluations-process-and-methods/")).toBe("/services/vocational-expert");
    expect(getRedirectTarget("/how-to-read-and-parse-a-vocational-report/")).toBe("/services/vocational-expert");
    expect(getRedirectTarget("/documentation-hierarchy/")).toBe("/guides/what-records-does-vocational-expert-need");
    expect(getRedirectTarget("/daubert-rule-702-readiness-checklist/")).toBe("/guides/daubert-standard-vocational-experts");
    expect(getRedirectTarget("/labor-market-survey-101/")).toBe("/methods/labor-market-survey");
    expect(getRedirectTarget("/transferable-skills-analysis/")).toBe("/methods/transferable-skills-analysis");
    expect(getRedirectTarget("/vocational-expert-nj/")).toBe("/services/vocational-expert/new-jersey");
  });

  it("resolves old FLAT geo pages onto the deepest existing nested page", () => {
    // Upgraded 2026-08-18 (GSC wave 2): a flat geo page with a parseable
    // state[-city] tail now lands on the real nested page instead of only the
    // pillar (full coverage in test/legacy-flat-geo.test.mjs).
    expect(getRedirectTarget("/services/forensic-economics-hawaii-east-honolulu")).toBe("/services/forensic-economics/hawaii/east-honolulu");
    // An unparseable geo tail keeps the pre-existing pillar collapse:
    expect(getRedirectTarget("/services/vocational-expert-newark-nj")).toBe("/services/vocational-expert");
    // ...but never the live nested routes:
    expect(getRedirectTarget("/services/forensic-economics")).toBeNull();
    expect(getRedirectTarget("/services/forensic-economics/hawaii")).toBeNull();
    expect(getRedirectTarget("/services/vocational-expert/new-jersey")).toBeNull();
  });

  it("maps the old /services/<case-type>/ trees, children and state suffixes included", () => {
    expect(getRedirectTarget("/services/wrongful-death/")).toBe("/case-types/wrongful-death");
    expect(getRedirectTarget("/services/wrongful-death/forensic-economist/")).toBe("/case-types/wrongful-death");
    // Upgraded 2026-08-18: a valid state suffix now reaches the state-specific
    // case-type page (the bare tree and non-state children keep the hub target).
    expect(getRedirectTarget("/services/motor-vehicle-accident/florida")).toBe("/case-types/motor-vehicle-accident/florida");
    expect(getRedirectTarget("/services/divorce-law/vocational-experts/")).toBe("/services/matrimonial");
    expect(getRedirectTarget("/services/birth-injury/life-care-planner/")).toBe("/case-types");
    expect(getRedirectTarget("/services/social-security-disability/")).toBe("/guides/ssa-disability-and-vocational-evidence");
  });

  it("maps category archives, specific first, bare /category as fallback", () => {
    expect(getRedirectTarget("/category/lifecare-planning/")).toBe("/services/life-care-planning");
    expect(getRedirectTarget("/category/cross-examination/")).toBe("/services/expert-witness-testimony");
    expect(getRedirectTarget("/category/forensic-economics/feed/")).toBe("/services/forensic-economics");
    expect(getRedirectTarget("/category/some-unknown-archive/")).toBe("/insights");
  });

  it("maps the client-portal family to /forms without touching /client-forms", () => {
    expect(getRedirectTarget("/client-portal/")).toBe("/forms");
    expect(getRedirectTarget("/client-portal-login-2/")).toBe("/forms");
    expect(getRedirectTarget("/client/client-portal-9pjm/")).toBe("/forms");
    expect(getRedirectTarget("/clients/")).toBe("/forms");
    expect(getRedirectTarget("/client-forms")).toBeNull();
    expect(getRedirectTarget("/client-forms/packet.pdf")).toBeNull();
  });

  it("maps legacy uploaded PDFs to their current /documents replacements", () => {
    expect(getRedirectTarget("/content/uploads/2025/05/PHQ-english-fillable-1.pdf")).toBe("/documents/KWVRS-PHQ-English.pdf");
    expect(getRedirectTarget("/wp-content/uploads/2025/08/HIPPA-Spanish-fillable.pdf")).toBe("/documents/KWVRS-HIPAA-Spanish.pdf");
    expect(getRedirectTarget("/content/uploads/2026/02/Sample-Vocational-Evaluation-1.pdf")).toBe("/samples");
  });

  it("returns null for live routes", () => {
    expect(getRedirectTarget("/")).toBeNull();
    expect(getRedirectTarget("/about")).toBeNull();
    expect(getRedirectTarget("/services")).toBeNull();
    expect(getRedirectTarget("/case-types/wrongful-death")).toBeNull();
    expect(getRedirectTarget("/documents/KWVRS-PHQ-English.pdf")).toBeNull();
    expect(getRedirectTarget("/documents")).toBeNull();
  });
});

describe("isLegacyGone (dead-asset 410 class)", () => {
  it("flags old media, Dreamweaver assets, feeds, WP sitemaps, and builder junk", () => {
    expect(isLegacyGone("/content/uploads/2025/01/Dan-Wolstein-800x1208-1.webp")).toBe(true);
    expect(isLegacyGone("/content/plugins/elementor-pro/whatever.json")).toBe(true);
    expect(isLegacyGone("/images/chris-skerritt-220.jpg")).toBe(true);
    expect(isLegacyGone("/p7dmm/img/toggle-icon.png")).toBe(true);
    expect(isLegacyGone("/feed")).toBe(true);
    expect(isLegacyGone("/category-sitemap.xml")).toBe(true);
    expect(isLegacyGone("/author-sitemap.xml")).toBe(true);
    expect(isLegacyGone("/sample-page")).toBe(true);
    expect(isLegacyGone("/visual-composer-16")).toBe(true);
  });

  it("does not 410 the retired team profile (it 301s to /team instead)", () => {
    expect(isLegacyGone("/team/courtney-tremonte")).toBe(false);
  });

  it("does not flag live paths", () => {
    expect(isLegacyGone("/")).toBe(false);
    expect(isLegacyGone("/about")).toBe(false);
    expect(isLegacyGone("/forms")).toBe(false);
    expect(isLegacyGone("/images")).toBe(false);
    expect(isLegacyGone("/contact")).toBe(false);
  });
});

function httpGet(port, path) {
  return new Promise((resolve, reject) => {
    const req = httpRequest({ host: "127.0.0.1", port, path, method: "GET" }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (c) => (body += c));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on("error", reject);
    req.end();
  });
}

describe("legacy redirects over HTTP (real server.js requestHandler)", () => {
  let server;
  let port;

  beforeEach(async () => {
    server = createServer(requestHandler);
    server.listen(0);
    await once(server, "listening");
    port = server.address().port;
  });

  afterEach(async () => {
    if (server?.listening) await new Promise((r) => server.close(r));
    server = undefined;
  });

  it("301s a legacy blog URL (trailing slash form) straight to its target", async () => {
    const res = await httpGet(port, "/matrimonial-matters/");
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe("/services/matrimonial");
  });

  it("301s a flat geo page to the nested service x state x city page", async () => {
    const res = await httpGet(port, "/services/forensic-economics-hawaii-east-honolulu");
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe("/services/forensic-economics/hawaii/east-honolulu");
  });

  it("preserves the query string on a legacy 301", async () => {
    const res = await httpGet(port, "/faqs/?utm_source=x");
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe("/resources/faq?utm_source=x");
  });

  it("canonicalizes trailing slashes on non-legacy routes (/about/ -> /about)", async () => {
    const res = await httpGet(port, "/about/");
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe("/about");
  });

  it("fixes the client-only trailing-slash 404s (/cv/ -> /cv)", async () => {
    const res = await httpGet(port, "/cv/");
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe("/cv");
  });

  it("410s a dead legacy asset", async () => {
    const res = await httpGet(port, "/content/uploads/2025/01/Dan-Wolstein-800x1208-1.webp");
    expect(res.status).toBe(410);
    expect(res.headers["x-robots-tag"]).toBe("noindex, nofollow");
  });

  it("410s a dead old-site /images file BUT still serves current /images files", async () => {
    const dead = await httpGet(port, "/images/chris-skerritt-220.jpg");
    expect(dead.status).toBe(410);
    const live = await httpGet(port, "/images/hero-office-meeting.jpg");
    expect(live.status).toBe(200);
    expect(live.headers["content-type"]).toBe("image/jpeg");
  });

  it("301s a legacy PDF to its current /documents replacement", async () => {
    const res = await httpGet(port, "/content/uploads/2025/05/PHQ-english-fillable-1.pdf");
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe("/documents/KWVRS-PHQ-English.pdf");
  });

  it("leaves the plain-404 catch-all untouched for genuinely unknown routes", async () => {
    const res = await httpGet(port, "/definitely-not-a-real-route-xyz");
    expect(res.status).toBe(404);
    expect(res.headers.location).toBeUndefined();
  });
});
