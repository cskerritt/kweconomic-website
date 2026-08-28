import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import CityServiceLinks from "./CityServiceLinks";
import { getStateBySlug } from "@/data/states";
import { newJerseyCities } from "@/data/cities/new-jersey";

// Real server render with real data. Hackensack sits inside the service-city
// window (first 10 in file order); Toms River sits outside it.
const state = getStateBySlug("new-jersey")!;

const PILLARS = [
  "lost-earnings-and-earning-capacity",
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
      createElement(CityServiceLinks, { state, city, cities: newJerseyCities }),
    ),
  );
}

describe("CityServiceLinks for a city with service-city pages", () => {
  const html = render("hackensack");

  it("links all eleven co-located pillar service x city pages", () => {
    for (const slug of PILLARS) {
      expect(html).toContain(`href="/services/${slug}/new-jersey/hackensack"`);
    }
  });

  it("never links a non-pillar sister-practice cross-sell", () => {
    for (const slug of NON_PILLARS) expect(html).not.toContain(`/services/${slug}`);
  });
});

describe("CityServiceLinks for a city outside the service-city window", () => {
  const html = render("toms-river");

  it("keeps the core state-level damages links (rebuttal is not a card)", () => {
    for (const slug of PILLARS.filter((s) => s !== "expert-rebuttal-and-report-review")) {
      expect(html).toContain(`href="/services/${slug}/new-jersey"`);
    }
    expect(html).not.toContain('href="/services/expert-rebuttal-and-report-review/new-jersey"');
    for (const slug of NON_PILLARS) expect(html).not.toContain(`/services/${slug}`);
  });

  it("links no city-level service pages (they do not exist for this city)", () => {
    expect(html).not.toContain("/new-jersey/toms-river");
  });
});
