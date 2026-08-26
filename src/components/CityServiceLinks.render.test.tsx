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
      "life-care-planning",
      "pediatric-life-care-planning",
      "catastrophic-injury-planning",
      "medical-cost-projection",
      "workers-compensation-lcp",
      "plan-update-and-review",
      "life-care-plan-rebuttal",
      "medicare-set-aside",
      "elder-and-long-term-care-planning",
      "expert-witness-testimony",
];

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

  it("links all ten co-located pillar service x city pages", () => {
    for (const slug of PILLARS) {
      expect(html).toContain(`href="/services/${slug}/new-jersey/hackensack"`);
    }
  });

  it("never links the non-pillar forensic-economics cross-sell", () => {
    expect(html).not.toContain("/services/forensic-economics");
  });
});

describe("CityServiceLinks for a city outside the service-city window", () => {
  const html = render("toms-river");

  it("keeps the core state-level planning links (testimony is not a card)", () => {
    for (const slug of PILLARS.filter((s) => s !== "expert-witness-testimony")) {
      expect(html).toContain(`href="/services/${slug}/new-jersey"`);
    }
    expect(html).not.toContain('href="/services/expert-witness-testimony/new-jersey"');
    expect(html).not.toContain("/services/forensic-economics");
  });

  it("links no city-level service pages (they do not exist for this city)", () => {
    expect(html).not.toContain("/new-jersey/toms-river");
  });
});
