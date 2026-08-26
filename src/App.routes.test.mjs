// src/App.routes.test.mjs
// Source-read guard tests (no jsdom/RTL in this repo - vitest.config.ts's
// environment is "node"). Pins the KW LCP route set (spec §5): the LCP-only
// site keeps the content/SEO routes and drops every intake, PSA, payment,
// raffle, document-library, and economic-tool surface from the vocational site.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const appSource = readFileSync(join(here, "App.tsx"), "utf8");
const homeSrc = readFileSync(join(here, "pages/Home.tsx"), "utf8");
const contactSrc = readFileSync(join(here, "pages/Contact.tsx"), "utf8");
const serverSrc = readFileSync(join(here, "../server.js"), "utf8");

const registeredPaths = [...appSource.matchAll(/path="([^"]+)"/g)].map((m) => m[1]);

describe("KW LCP route set (spec §5)", () => {
  it("registers every kept static route", () => {
    for (const p of [
      "/", "/about", "/team", "/contact", "/schedule-consultation", "/services", "/locations",
      "/case-types", "/credentials", "/guides", "/compare", "/methods", "/attorneys", "/jurisdictions",
      "/knowledge", "/insights", "/white-papers", "/case-studies", "/resources/faq",
      "/tools", "/tools/life-expectancy", "/privacy", "/terms", "*",
    ]) {
      expect(registeredPaths, `missing route ${p}`).toContain(p);
    }
  });

  it("registers every kept param route", () => {
    for (const p of [
      "/team/:slug", "/services/:serviceSlug", "/services/:serviceSlug/:stateSlug",
      "/services/:serviceSlug/:stateSlug/:citySlug", "/services/:serviceSlug/case/:typeSlug",
      "/services/:serviceSlug/cost", "/services/:serviceSlug/process", "/services/:serviceSlug/timeline",
      "/locations/:stateSlug", "/locations/:stateSlug/:citySlug", "/case-types/:slug",
      "/case-types/:typeSlug/:stateSlug", "/credentials/:slug", "/credentials/:credSlug/:stateSlug",
      "/guides/:slug", "/compare/:slug", "/methods/:slug", "/attorneys/:stage",
      "/attorneys/:stage/:caseTypeSlug", "/knowledge/:slug", "/insights/:slug", "/white-papers/:slug",
    ]) {
      expect(registeredPaths, `missing route ${p}`).toContain(p);
    }
  });

  it("does not register retired non-LCP routes", () => {
    for (const p of [
      "/payment", "/raffle", "/contact/intake", "/contact/nonmetro-intake", "/contact/consulting-intake",
      "/nm", "/intake", "/agreements/", "/services/expert-disclosure", "/tools/household-services",
      "/tools/economic-damages-estimator", "/samples", "/cv", "/forms", "/phq-form-", "/hipaa-", "/review",
    ]) {
      expect(appSource, `retired route ${p} still registered`).not.toContain(`path="${p}`);
    }
  });

  it("does not lazy-import any deleted page", () => {
    for (const page of [
      "RetainerIntake", "Intake", "Agreement", "Payment", "Raffle", "SampleReports", "ExpertCVs", "Forms",
      "PatientFormPage", "ExpertDisclosurePillar", "ExpertDisclosureState", "DamagesEstimator",
      "HouseholdServicesValuator", "HouseholdServicesMethodology", "Review",
    ]) {
      expect(appSource, `still imports @/pages/${page}`).not.toContain(`import("@/pages/${page}")`);
    }
  });

  it("registers /attorneys/:stage ahead of the stage/caseType route", () => {
    expect(appSource.indexOf('path="/attorneys/:stage"')).toBeLessThan(
      appSource.indexOf('path="/attorneys/:stage/:caseTypeSlug"'),
    );
  });
});

describe("retired-surface CTAs point at /schedule-consultation or /contact", () => {
  it("Home.tsx no longer links the retainer intake or renders WhichExpert", () => {
    expect(homeSrc).not.toContain("/contact/intake");
    expect(homeSrc).not.toContain("WhichExpert");
  });

  it("Contact.tsx no longer renders IntakeChooser, the forms library, or imports lib/intake-schema", () => {
    expect(contactSrc).not.toContain("IntakeChooser");
    expect(contactSrc).not.toContain("@/data/forms");
    expect(contactSrc).not.toContain("intake-schema");
    expect(contactSrc).toContain("/schedule-consultation");
  });

  it("server.js has no client-only intake/payment/raffle surfaces", () => {
    expect(serverSrc).not.toContain('"/payment"');
    expect(serverSrc).not.toContain('"/raffle"');
    expect(serverSrc).not.toContain("/contact/intake");
  });
});

describe("orphan-page guards carried over from the 2026-07-22 link audit", () => {
  const pillarSrc = readFileSync(join(here, "pages/ServicePillar.tsx"), "utf8");
  const footerSrc = readFileSync(join(here, "components/layout/Footer.tsx"), "utf8");
  const stageIndexSrc = readFileSync(join(here, "pages/templates/JourneyStageIndex.tsx"), "utf8");

  it("ServicePillar links its case-type deep dives and cost/process/timeline variants", () => {
    expect(pillarSrc).toContain("/services/${service.slug}/case/${slug}");
    expect(pillarSrc).toContain("/services/${service.slug}/${variant}");
  });

  it("Footer links /case-studies (no /intake, /forms, Staff Login, or Training)", () => {
    expect(footerSrc).toContain('href: "/case-studies"');
    expect(footerSrc).not.toContain('href: "/intake"');
    expect(footerSrc).not.toContain('href: "/forms"');
    expect(footerSrc).not.toContain("Staff Login");
    expect(footerSrc).not.toContain('href="/training"');
  });

  it("JourneyStageIndex 404s unknown stages and links every case type", () => {
    expect(stageIndexSrc).toContain("return <NotFound />");
    expect(stageIndexSrc).toContain("caseTypes.map");
  });
});
