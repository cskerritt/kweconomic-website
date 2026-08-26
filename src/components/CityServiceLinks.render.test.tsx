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

  it("links all seven co-located service x city pages", () => {
    for (const slug of [
      "vocational-expert",
      "life-care-planning",
      "forensic-economics",
      "loss-of-household-services",
      "matrimonial",
      "standard-of-care",
      "expert-witness-testimony",
    ]) {
      expect(html).toContain(`href="/services/${slug}/new-jersey/hackensack"`);
    }
  });

  it("links expert disclosure at the state level (it has no city tier)", () => {
    expect(html).toContain('href="/services/expert-disclosure/new-jersey"');
    expect(html).not.toContain('href="/services/expert-disclosure/new-jersey/hackensack"');
  });
});

describe("CityServiceLinks for a city outside the service-city window", () => {
  const html = render("toms-river");

  it("keeps the core state-level service links", () => {
    for (const slug of [
      "vocational-expert",
      "life-care-planning",
      "forensic-economics",
      "loss-of-household-services",
      "matrimonial",
      "expert-disclosure",
    ]) {
      expect(html).toContain(`href="/services/${slug}/new-jersey"`);
    }
  });

  it("links no city-level service pages (they do not exist for this city)", () => {
    expect(html).not.toContain("/new-jersey/toms-river");
  });
});
