import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import ServiceCityCrossLinks from "./ServiceCityCrossLinks";
import { getServiceBySlug, pillarServices } from "@/data/services";
import { workPhrase } from "@/lib/service-prose.mjs";
import { getStateBySlug } from "@/data/states";
import { newJerseyCities } from "@/data/cities/new-jersey";
import { newYorkCities } from "@/data/cities/new-york";

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
      // The lowercased full name is a seam only where it is not the work
      // phrase itself (for Business Valuation the two coincide) or its opening
      // words ("personal injury economic damages analysis").
      const lowered = pillar.name.toLowerCase();
      const work = workPhrase(pillar.shortName);
      if (!work.startsWith(lowered)) {
        expect(html).not.toContain(`We also provide ${lowered}`);
      } else if (lowered !== work) {
        expect(html).not.toContain(`We also provide ${lowered} in these`);
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

describe("ServiceCityCrossLinks in The Bronx", () => {
  // The one prerendered city whose name carries its own article: the
  // attributive slot drops it, the heading and the link labels keep it.
  const newYork = getStateBySlug("new-york")!;
  const bronx = newYorkCities.find((c) => c.slug === "the-bronx")!;
  const html = renderToStaticMarkup(
    createElement(
      MemoryRouter,
      null,
      createElement(ServiceCityCrossLinks, { service, state: newYork, city: bronx, cities: newYorkCities }),
    ),
  );

  it("renders the sibling-services block (The Bronx is inside the service-city window)", () => {
    expect(html).toContain('href="/services/wrongful-death-economic-loss/new-york/the-bronx"');
  });

  it("drops the borough's article in the attributive slot and keeps it in the heading and labels", () => {
    expect(html).toContain("Other Services in The Bronx");
    expect(html).toContain("KW Economics offers complementary economic damages services for Bronx cases.");
    expect(html).toContain("Wrongful Death in The Bronx");
    expect(html).not.toContain("for The Bronx cases");
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
