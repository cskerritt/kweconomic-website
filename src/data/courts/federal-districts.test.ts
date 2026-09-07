import { describe, it, expect } from "vitest";
import { federalDistricts, getFederalDistrict, districtsByCircuit, districtSlug, federalCourtName, FEDERAL_SERVICE_SLUGS, CIRCUIT_ORDER } from "./federal-districts";
import { pillarServices } from "../services";
import { stateCourts } from "./state-courts";
import { states } from "../states";

describe("federal districts", () => {
  it("derives one entry per federalDistricts row in state-courts.ts with unique slugs and abbreviations", () => {
    const rows = stateCourts.flatMap((s) => s.federalDistricts);
    expect(rows.length).toBe(94);
    expect(federalDistricts.length).toBe(rows.length);
    expect(new Set(federalDistricts.map((d) => d.slug)).size).toBe(federalDistricts.length);
    expect(new Set(federalDistricts.map((d) => d.abbreviation)).size).toBe(federalDistricts.length);
  });
  it("slugs are lowercase hyphenated names without the word 'the'", () => {
    expect(districtSlug("Northern District of Alabama")).toBe("northern-district-of-alabama");
    expect(districtSlug("District of Alaska")).toBe("district-of-alaska");
    expect(districtSlug("District Court for the Northern Mariana Islands")).toBe("district-court-for-the-northern-mariana-islands");
    for (const d of federalDistricts) expect(d.slug).toMatch(/^[a-z0-9-]+$/);
  });
  it("assigns every district a circuit, and every state with a district a circuit of its own", () => {
    const CIRCUITS = new Set<string>(CIRCUIT_ORDER);
    expect(CIRCUITS.size).toBe(12);
    for (const d of federalDistricts) expect(CIRCUITS.has(d.circuit), d.slug).toBe(true);
    const grouped = districtsByCircuit();
    expect(Object.keys(grouped)).toEqual(CIRCUIT_ORDER);
    expect(Object.values(grouped).reduce((n, list) => n + list.length, 0)).toBe(federalDistricts.length);
    // Spot checks against the circuit map.
    expect(getFederalDistrict("district-of-puerto-rico")?.circuit).toBe("First");
    expect(getFederalDistrict("district-court-of-the-virgin-islands")?.circuit).toBe("Third");
    expect(getFederalDistrict("district-court-of-guam")?.circuit).toBe("Ninth");
    expect(getFederalDistrict("district-of-columbia")?.circuit).toBe("D.C.");
    expect(getFederalDistrict("southern-district-of-texas")?.circuit).toBe("Fifth");
  });
  it("every district points at a state in states.ts", () => {
    const slugs = new Set(states.map((s) => s.slug));
    for (const d of federalDistricts) expect(slugs.has(d.stateSlug), d.slug).toBe(true);
  });
  it("names the court the way the venue sentence does, and the federal pillars are real pillars", () => {
    expect(federalCourtName("District of New Jersey")).toBe("the United States District Court for the District of New Jersey");
    expect(federalCourtName("District Court of Guam")).toBe("the United States District Court of Guam");
    expect(federalCourtName("District Court for the Northern Mariana Islands")).toBe("the United States District Court for the Northern Mariana Islands");
    const pillars = new Set(pillarServices().map((s) => s.slug));
    expect(FEDERAL_SERVICE_SLUGS.length).toBeGreaterThanOrEqual(3);
    for (const slug of FEDERAL_SERVICE_SLUGS) expect(pillars.has(slug), slug).toBe(true);
  });
  it("looks up by slug", () => {
    expect(getFederalDistrict("district-of-new-jersey")?.stateSlug).toBe("new-jersey");
    expect(getFederalDistrict("district-of-new-jersey")?.abbreviation).toBe("D.N.J.");
    expect(getFederalDistrict("nope")).toBeUndefined();
  });
});
