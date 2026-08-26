import { describe, it, expect } from "vitest";
import { loadStateCities, loadCityBySlug, getStatesWithCities } from "./index";

// vitest runs through Vite, so import.meta.glob resolves exactly as in the build.
describe("cities lazy loader", () => {
  it("lazily loads a known state's cities", async () => {
    const cities = await loadStateCities("california");
    expect(cities.length).toBeGreaterThan(0);
    expect(cities[0]).toHaveProperty("slug");
    expect(cities[0]).toHaveProperty("name");
  });

  it("returns an empty array for an unknown state slug", async () => {
    expect(await loadStateCities("atlantis")).toEqual([]);
  });

  it("resolves a single city by slug within its state", async () => {
    const cities = await loadStateCities("california");
    const target = cities[0];
    const found = await loadCityBySlug("california", target.slug);
    expect(found?.slug).toBe(target.slug);
    expect(await loadCityBySlug("california", "no-such-city")).toBeUndefined();
  });

  it("lists state slugs that have a city file, excluding the barrel and tests", () => {
    const slugs = getStatesWithCities();
    expect(slugs).toContain("california");
    expect(slugs).toContain("new-york");
    expect(slugs).not.toContain("index");
    expect(slugs.some((s) => s.includes("test"))).toBe(false);
  });
});
