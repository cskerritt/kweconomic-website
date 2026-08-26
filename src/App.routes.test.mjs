// src/App.routes.test.mjs
// Source-read guard tests (no jsdom/RTL in this repo - vitest.config.ts's
// environment is "node" - mirrors intakeForms.parity.test.mjs's own pattern).
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const appSrc = readFileSync(join(here, "App.tsx"), "utf8");
const chooserSrc = readFileSync(join(here, "components/IntakeChooser.tsx"), "utf8");
const homeSrc = readFileSync(join(here, "pages/Home.tsx"), "utf8");
const serverSrc = readFileSync(join(here, "../server.js"), "utf8");
const validationSrc = readFileSync(join(here, "../validation.server.mjs"), "utf8");

describe("unified intake routing (spec 2026-07-16 §3)", () => {
  it("App.tsx registers /contact/intake and no longer registers the two retired routes", () => {
    expect(appSrc).toContain('<Route path="/contact/intake" element={<RetainerIntake slug="unified" />} />');
    expect(appSrc).not.toContain('path="/contact/marital-intake"');
    expect(appSrc).not.toContain('path="/contact/personal-injury-intake"');
  });

  it("server.js 301s both retired routes to /contact/intake", () => {
    expect(serverSrc).toMatch(/\["\/contact\/personal-injury-intake",\s*"\/contact\/intake"\]/);
    expect(serverSrc).toMatch(/\["\/contact\/marital-intake",\s*"\/contact\/intake"\]/);
  });

  it("IntakeChooser no longer links to the retired routes", () => {
    expect(chooserSrc).not.toContain("/contact/personal-injury-intake");
    expect(chooserSrc).not.toContain("/contact/marital-intake");
    expect(chooserSrc).toContain("/contact/intake");
  });

  it("Home.tsx's case-type quick links no longer link to the retired routes", () => {
    expect(homeSrc).not.toContain("/contact/personal-injury-intake");
    expect(homeSrc).not.toContain("/contact/marital-intake");
    expect(homeSrc).toContain("/contact/intake");
  });

  it("validation.server.mjs treats unified-intake as a granular (strict-validated) intake", () => {
    expect(validationSrc).toMatch(/"unified-intake"/);
  });
});

describe("/payment Zelle page (link-only, noindex)", () => {
  const paymentSrc = readFileSync(join(here, "pages/Payment.tsx"), "utf8");

  it("App.tsx registers /payment", () => {
    expect(appSrc).toContain('<Route path="/payment" element={<Payment />} />');
  });

  it("server.js serves /payment as a client-only route (200 + X-Robots-Tag noindex)", () => {
    expect(serverSrc).toMatch(/pathname === "\/payment"/);
  });

  it("Payment.tsx sets noindex meta and links the same Zelle URL the QR encodes", () => {
    expect(paymentSrc).toContain("noindex: true");
    expect(paymentSrc).toContain(
      "https://enroll.zellepay.com/qr-codes/?data=eyJuYW1lIjoiS0lOQ0FJRCBXT0xTVEVJTiBWT0NBVElPTkFMICYiLCJ0b2tlbiI6Imt3dnJzMjAyNiIsImFjdGlvbiI6InBheW1lbnQifQ=="
    );
  });

  it("stays out of the sitemap", async () => {
    // sitemap.xml is a sitemap INDEX; scan the page URLs across its children.
    const { collectSitemapPageUrls } = await import("../scripts/lib/sitemap-urls.mjs");
    const urls = collectSitemapPageUrls(join(here, "../public/sitemap.xml"));
    expect(urls.filter((u) => u.includes("kwvrs.com/payment"))).toEqual([]);
  });
});

describe("/attorneys/:stage index pages (journey breadcrumb targets)", () => {
  const stageIndexSrc = readFileSync(join(here, "pages/templates/JourneyStageIndex.tsx"), "utf8");
  const prerenderSrc = readFileSync(join(here, "../scripts/prerender.mjs"), "utf8");
  const sitemapGenSrc = readFileSync(join(here, "../scripts/generate-sitemap.mjs"), "utf8");

  it("App.tsx registers /attorneys/:stage ahead of the stage/caseType route", () => {
    expect(appSrc).toContain('<Route path="/attorneys/:stage" element={<JourneyStageIndex />} />');
    expect(appSrc.indexOf('path="/attorneys/:stage"')).toBeLessThan(
      appSrc.indexOf('path="/attorneys/:stage/:caseTypeSlug"')
    );
  });

  it("JourneyStageIndex 404s unknown stages and links every case type", () => {
    expect(stageIndexSrc).toContain("return <NotFound />");
    expect(stageIndexSrc).toContain("caseTypes.map");
  });

  it("prerender.mjs writes the 4 stage index pages", () => {
    expect(prerenderSrc).toMatch(/writePage\(`\/attorneys\/\$\{stage\}`/);
  });

  it("generate-sitemap.mjs includes the stage index URLs", () => {
    expect(sitemapGenSrc).toMatch(/urls\.add\(`\/attorneys\/\$\{stage\}`\)/);
  });
});

describe("orphan-page fixes (2026-07-22 link audit)", () => {
  const pillarSrc = readFileSync(join(here, "pages/ServicePillar.tsx"), "utf8");
  const footerSrc = readFileSync(join(here, "components/layout/Footer.tsx"), "utf8");
  const prerenderSrc = readFileSync(join(here, "../scripts/prerender.mjs"), "utf8");
  const sitemapGenSrc = readFileSync(join(here, "../scripts/generate-sitemap.mjs"), "utf8");

  it("ServicePillar links its case-type deep dives and cost/process/timeline variants", () => {
    expect(pillarSrc).toContain("/services/${service.slug}/case/${slug}");
    expect(pillarSrc).toContain("/services/${service.slug}/${variant}");
  });

  it("Footer links /case-studies and /intake so they are no longer orphans", () => {
    expect(footerSrc).toContain('href: "/case-studies"');
    expect(footerSrc).toContain('href: "/intake"');
  });

  it("prerender.mjs no longer emits the retired intake routes (they 301)", () => {
    expect(prerenderSrc).not.toContain('"/contact/marital-intake"');
    expect(prerenderSrc).not.toContain('"/contact/personal-injury-intake"');
    expect(prerenderSrc).not.toContain('href="/contact/personal-injury-intake"');
  });

  it("generate-sitemap.mjs no longer lists the retired intake routes", () => {
    expect(sitemapGenSrc).not.toContain('"/contact/marital-intake"');
    expect(sitemapGenSrc).not.toContain('"/contact/personal-injury-intake"');
  });
});
