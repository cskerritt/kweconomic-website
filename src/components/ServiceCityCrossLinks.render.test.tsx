import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import ServiceCityCrossLinks from "./ServiceCityCrossLinks";
import { getServiceBySlug, pillarServices } from "@/data/services";
import { workPhrase } from "@/lib/service-prose.mjs";
import { getStateBySlug } from "@/data/states";
import { newJerseyCities } from "@/data/cities/new-jersey";

const service = getServiceBySlug("lost-earnings-and-earning-capacity")!;
const state = getStateBySlug("new-jersey")!;

const SIBLINGS = [
  "wrongful-death-economic-loss",
  "personal-injury-economic-damages",
  "household-services-valuation",
  "life-care-plan-cost-projection",
  "employment-and-wage-loss-damages",
  "business-valuation",
  "lost-profits-and-commercial-damages",
  "fraud-and-asset-tracing",
  "divorce-and-marital-financial-analysis",
  "expert-rebuttal-and-report-review",
];
const NON_PILLARS = ["vocational-evaluation", "life-care-planning"];

function render(citySlug: string): string {
  const city = newJerseyCities.find((c) => c.slug === citySlug)!;
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      null,
      createElement(ServiceCityCrossLinks, { service, state, city, cities: newJerseyCities }),
    ),
  );
}

describe("ServiceCityCrossLinks on a service-city page", () => {
  const html = render("hackensack");

  it("links the ten sibling pillar service pages in the same city", () => {
    for (const slug of SIBLINGS) {
      expect(html).toContain(`href="/services/${slug}/new-jersey/hackensack"`);
    }
    // Not itself, and not a non-pillar cross-sell (no city tier exists for them).
    expect(html).not.toContain('href="/services/lost-earnings-and-earning-capacity/new-jersey/hackensack"');
    for (const slug of NON_PILLARS) expect(html).not.toContain(`/services/${slug}/`);
  });

  it("links the same service in every other service-city page of the state", () => {
    for (const slug of [
      "newark",
      "jersey-city",
      "paterson",
      "elizabeth",
      "trenton",
      "camden",
      "new-brunswick",
      "morristown",
      "atlantic-city",
    ]) {
      expect(html).toContain(`href="/services/lost-earnings-and-earning-capacity/new-jersey/${slug}"`);
    }
  });

  it("does not link cities outside the service-city window", () => {
    expect(html).not.toContain("/services/lost-earnings-and-earning-capacity/new-jersey/toms-river");
  });

  it("names the work the pillar performs in the nearby-cities sentence, not the service name", () => {
    expect(html).toContain("We also provide lost earnings analysis in these New Jersey communities.");
    expect(html).not.toContain("lost earnings and earning capacity analysis in these");
  });
});

describe("ServiceCityCrossLinks sentence prose for every pillar", () => {
  const city = newJerseyCities.find((c) => c.slug === "hackensack")!;
  for (const pillar of pillarServices()) {
    it(`${pillar.slug}: spells the work out as prose (headings keep the short name)`, () => {
      const html = renderToStaticMarkup(
        createElement(
          MemoryRouter,
          null,
          createElement(ServiceCityCrossLinks, { service: pillar, state, city, cities: newJerseyCities }),
        ),
      );
      expect(html).toContain(`We also provide ${workPhrase(pillar.shortName)} in these New Jersey communities.`);
      expect(html).not.toMatch(/We also provide [^.]*&amp;/);
      // The lowercased full name is a seam only where it differs from the
      // work phrase (for Business Valuation the two coincide).
      if (pillar.name.toLowerCase() !== workPhrase(pillar.shortName)) {
        expect(html).not.toContain(`We also provide ${pillar.name.toLowerCase()}`);
      }
    });
  }
  it("prints the fraud pillar's sentence word for word", () => {
    const fraud = getServiceBySlug("fraud-and-asset-tracing")!;
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(ServiceCityCrossLinks, { service: fraud, state, city, cities: newJerseyCities }),
      ),
    );
    expect(html).toContain("Fraud &amp; Tracing in Nearby New Jersey Cities");
    expect(html).toContain("We also provide fraud and tracing analysis in these New Jersey communities.");
  });
});

describe("ServiceCityCrossLinks outside the service-city window", () => {
  it("renders nothing (sibling pages do not exist)", () => {
    expect(render("toms-river")).toBe("");
  });
});

describe("ServiceCityCrossLinks for a service with no city tier", () => {
  // /services/life-care-planning/:state/:city is never prerendered or linked
  // (ServiceStateCity redirects non-pillars to the card), but the component
  // must not fabricate cross-sell city links if it is ever mounted for one.
  const crossSell = getServiceBySlug("life-care-planning")!;
  const city = newJerseyCities.find((c) => c.slug === "hackensack")!;
  const html = renderToStaticMarkup(
    createElement(
      MemoryRouter,
      null,
      createElement(ServiceCityCrossLinks, { service: crossSell, state, city, cities: newJerseyCities }),
    ),
  );

  it("emits no links to nonexistent cross-sell city pages", () => {
    expect(crossSell.pillar).toBe(false);
    expect(html).not.toContain("/services/life-care-planning/new-jersey/");
  });

  it("still links the sibling pillar services that do have city pages", () => {
    expect(html).toContain('href="/services/lost-earnings-and-earning-capacity/new-jersey/hackensack"');
  });
});
