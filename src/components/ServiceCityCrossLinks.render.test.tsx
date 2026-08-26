import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import ServiceCityCrossLinks from "./ServiceCityCrossLinks";
import { getServiceBySlug } from "@/data/services";
import { getStateBySlug } from "@/data/states";
import { newJerseyCities } from "@/data/cities/new-jersey";

const service = getServiceBySlug("vocational-expert")!;
const state = getStateBySlug("new-jersey")!;

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

  it("links the six sibling service pages in the same city", () => {
    for (const slug of [
      "life-care-planning",
      "forensic-economics",
      "loss-of-household-services",
      "matrimonial",
      "standard-of-care",
      "expert-witness-testimony",
    ]) {
      expect(html).toContain(`href="/services/${slug}/new-jersey/hackensack"`);
    }
    // Not itself, and not expert disclosure (no city tier exists for it).
    expect(html).not.toContain('href="/services/vocational-expert/new-jersey/hackensack"');
    expect(html).not.toContain("/services/expert-disclosure/new-jersey/hackensack");
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
      expect(html).toContain(`href="/services/vocational-expert/new-jersey/${slug}"`);
    }
  });

  it("does not link cities outside the service-city window", () => {
    expect(html).not.toContain("/services/vocational-expert/new-jersey/toms-river");
  });
});

describe("ServiceCityCrossLinks outside the service-city window", () => {
  it("renders nothing (sibling pages do not exist)", () => {
    expect(render("toms-river")).toBe("");
  });
});

describe("ServiceCityCrossLinks for a service with no city tier", () => {
  // /services/expert-disclosure/:state/:city is never prerendered or linked,
  // but the generic route still mounts ServiceStateCity for a hand-typed URL.
  // The nearby-cities block must not fabricate expert-disclosure city links.
  const service = getServiceBySlug("expert-disclosure")!;
  const city = newJerseyCities.find((c) => c.slug === "hackensack")!;
  const html = renderToStaticMarkup(
    createElement(
      MemoryRouter,
      null,
      createElement(ServiceCityCrossLinks, { service, state, city, cities: newJerseyCities }),
    ),
  );

  it("emits no links to nonexistent expert-disclosure city pages", () => {
    expect(html).not.toContain("/services/expert-disclosure/new-jersey/");
  });

  it("still links the sibling services that do have city pages", () => {
    expect(html).toContain('href="/services/vocational-expert/new-jersey/hackensack"');
  });
});
