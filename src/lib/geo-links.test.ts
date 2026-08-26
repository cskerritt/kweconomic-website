import { describe, it, expect } from "vitest";
import {
  SERVICE_CITY_TOP,
  serviceCityServices,
  serviceCityCities,
  hasServiceCityPages,
  nearestCities,
} from "./geo-links";
import { services } from "@/data/services";
import { newJerseyCities } from "@/data/cities/new-jersey";
import type { City } from "@/types";

function makeCity(slug: string, latitude: number, longitude: number): City {
  return {
    slug,
    name: slug,
    stateSlug: "test-state",
    stateAbbreviation: "TS",
    county: "Test",
    population: 0,
    latitude,
    longitude,
    isStateCapital: false,
  };
}

// SERVICE_CITY_TOP parity with scripts/prerender.mjs and
// src/data/contentReadiness.ts lives in geo-links.parity.test.mjs (node fs
// access; .mjs tests stay out of the app typecheck like the other route
// guards).

describe("serviceCityServices", () => {
  it("returns exactly the services that have city pages (all except expert-disclosure)", () => {
    const slugs = serviceCityServices(services).map((s) => s.slug);
    expect(slugs).toEqual([
      "vocational-expert",
      "life-care-planning",
      "forensic-economics",
      "loss-of-household-services",
      "matrimonial",
      "standard-of-care",
      "expert-witness-testimony",
    ]);
  });
});

describe("serviceCityCities / hasServiceCityPages", () => {
  it("takes the first SERVICE_CITY_TOP cities in file order", () => {
    const window = serviceCityCities(newJerseyCities);
    expect(window).toHaveLength(SERVICE_CITY_TOP);
    expect(window.map((c) => c.slug)).toContain("hackensack");
    expect(window.map((c) => c.slug)).not.toContain("toms-river");
  });

  it("reports whether a city has service pages", () => {
    expect(hasServiceCityPages(newJerseyCities, "hackensack")).toBe(true);
    expect(hasServiceCityPages(newJerseyCities, "toms-river")).toBe(false);
    expect(hasServiceCityPages(newJerseyCities, "not-a-city")).toBe(false);
  });

  it("handles states with fewer cities than the window", () => {
    const few = newJerseyCities.slice(0, 3);
    expect(serviceCityCities(few)).toHaveLength(3);
  });
});

describe("nearestCities", () => {
  // Points on a line of longitude: distance is proportional to latitude delta.
  const cities = [
    makeCity("origin", 40, -74),
    makeCity("far", 44, -74),
    makeCity("near", 41, -74),
    makeCity("mid", 42.5, -74),
  ];

  it("orders by great-circle distance and excludes the origin", () => {
    expect(nearestCities(cities, "origin", 3).map((c) => c.slug)).toEqual([
      "near",
      "mid",
      "far",
    ]);
  });

  it("caps at n", () => {
    expect(nearestCities(cities, "origin", 2).map((c) => c.slug)).toEqual(["near", "mid"]);
  });

  it("falls back to file order when the origin is unknown", () => {
    expect(nearestCities(cities, "missing", 2).map((c) => c.slug)).toEqual(["origin", "far"]);
  });

  it("returns everything else when n exceeds the list", () => {
    expect(nearestCities(cities, "origin", 99)).toHaveLength(3);
  });
});
