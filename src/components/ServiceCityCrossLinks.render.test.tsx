import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import ServiceCityCrossLinks from "./ServiceCityCrossLinks";
import { getServiceBySlug } from "@/data/services";
import { getStateBySlug } from "@/data/states";
import { newJerseyCities } from "@/data/cities/new-jersey";

const service = getServiceBySlug("life-care-planning")!;
const state = getStateBySlug("new-jersey")!;

const SIBLINGS = [
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
      createElement(ServiceCityCrossLinks, { service, state, city, cities: newJerseyCities }),
    ),
  );
}

describe("ServiceCityCrossLinks on a service-city page", () => {
  const html = render("hackensack");

  it("links the nine sibling pillar service pages in the same city", () => {
    for (const slug of SIBLINGS) {
      expect(html).toContain(`href="/services/${slug}/new-jersey/hackensack"`);
    }
    // Not itself, and not the non-pillar cross-sell (no city tier exists for it).
    expect(html).not.toContain('href="/services/life-care-planning/new-jersey/hackensack"');
    expect(html).not.toContain("/services/forensic-economics/");
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
      expect(html).toContain(`href="/services/life-care-planning/new-jersey/${slug}"`);
    }
  });

  it("does not link cities outside the service-city window", () => {
    expect(html).not.toContain("/services/life-care-planning/new-jersey/toms-river");
  });
});

describe("ServiceCityCrossLinks outside the service-city window", () => {
  it("renders nothing (sibling pages do not exist)", () => {
    expect(render("toms-river")).toBe("");
  });
});

describe("ServiceCityCrossLinks for a service with no city tier", () => {
  // /services/forensic-economics/:state/:city is never prerendered or linked
  // (ServiceStateCity redirects non-pillars to the card), but the component
  // must not fabricate cross-sell city links if it is ever mounted for one.
  const service = getServiceBySlug("forensic-economics")!;
  const city = newJerseyCities.find((c) => c.slug === "hackensack")!;
  const html = renderToStaticMarkup(
    createElement(
      MemoryRouter,
      null,
      createElement(ServiceCityCrossLinks, { service, state, city, cities: newJerseyCities }),
    ),
  );

  it("emits no links to nonexistent forensic-economics city pages", () => {
    expect(html).not.toContain("/services/forensic-economics/new-jersey/");
  });

  it("still links the sibling pillar services that do have city pages", () => {
    expect(html).toContain('href="/services/life-care-planning/new-jersey/hackensack"');
  });
});
