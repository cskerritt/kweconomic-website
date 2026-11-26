import { describe, expect, it } from "vitest";
import { states } from "@/data/states";
import { findCitySlug, normalizePlace, parseLocationQuery, resolveLocation, stateForZip } from "./location-search";

describe("stateForZip", () => {
  it.each([
    ["07601", "NJ"],
    ["02917", "RI"],
    ["23219", "VA"],
    ["10001", "NY"],
    ["11201", "NY"],
    ["00501", "NY"],
    ["00901", "PR"],
    ["00802", "VI"],
    ["01844", "MA"],
    ["05501", "MA"],
    ["05401", "VT"],
    ["20001", "DC"],
    ["20147", "VA"],
    ["20850", "MD"],
    ["33101", "FL"],
    ["39501", "MS"],
    ["39901", "GA"],
    ["73301", "TX"],
    ["73101", "OK"],
    ["79901", "TX"],
    ["88510", "TX"],
    ["87501", "NM"],
    ["89501", "NV"],
    ["90210", "CA"],
    ["96813", "HI"],
    ["96799", "AS"],
    ["96910", "GU"],
    ["96950", "MP"],
    ["97201", "OR"],
    ["98101", "WA"],
    ["99501", "AK"],
    ["07601-1234", "NJ"],
    ["076011234", "NJ"],
  ])("%s is in %s", (zip, abbreviation) => {
    expect(stateForZip(zip)).toBe(abbreviation);
  });

  it.each(["09001", "34001", "96201", "96939", "96940", "1234", "abcde", "00000"])("%s has no state page", (zip) => {
    expect(stateForZip(zip)).toBeUndefined();
  });

  it("only ever names a state the site has a page for", () => {
    const known = new Set(states.map((s) => s.abbreviation));
    for (let z = 0; z < 100000; z += 7) {
      const abbreviation = stateForZip(String(z).padStart(5, "0"));
      if (abbreviation) expect(known.has(abbreviation), abbreviation).toBe(true);
    }
  });
});

describe("parseLocationQuery", () => {
  it("sends a ZIP code to its state page", () => {
    expect(parseLocationQuery(" 07601 ")).toEqual({ kind: "state", stateSlug: "new-jersey" });
    expect(parseLocationQuery("09001")).toEqual({ kind: "unknown-zip", zip: "09001" });
  });

  it("reads a state alone by name or abbreviation, DC included", () => {
    expect(parseLocationQuery("New Jersey")).toEqual({ kind: "state", stateSlug: "new-jersey" });
    expect(parseLocationQuery("ri")).toEqual({ kind: "state", stateSlug: "rhode-island" });
    expect(parseLocationQuery("Washington, D.C.")).toEqual({ kind: "state", stateSlug: "district-of-columbia" });
    expect(parseLocationQuery("Puerto Rico")).toEqual({ kind: "state", stateSlug: "puerto-rico" });
  });

  it("reads a city with its state, with or without a comma", () => {
    expect(parseLocationQuery("Hackensack, NJ")).toEqual({ kind: "city", stateSlug: "new-jersey", cityName: "hackensack" });
    expect(parseLocationQuery("Hackensack NJ")).toEqual({ kind: "city", stateSlug: "new-jersey", cityName: "hackensack" });
    expect(parseLocationQuery("Charleston West Virginia")).toEqual({ kind: "city", stateSlug: "west-virginia", cityName: "charleston" });
    expect(parseLocationQuery("Richmond, Virginia")).toEqual({ kind: "city", stateSlug: "virginia", cityName: "richmond" });
    expect(parseLocationQuery("St. Louis, MO")).toEqual({ kind: "city", stateSlug: "missouri", cityName: "saint louis" });
    expect(parseLocationQuery("Mt Pleasant SC")).toEqual({ kind: "city", stateSlug: "south-carolina", cityName: "mount pleasant" });
  });

  it("ignores a ZIP code typed after the city and state", () => {
    expect(parseLocationQuery("Hackensack, NJ 07601")).toEqual({ kind: "city", stateSlug: "new-jersey", cityName: "hackensack" });
    expect(parseLocationQuery("Washington, DC 20001")).toEqual({ kind: "state", stateSlug: "district-of-columbia" });
  });

  it("asks for the state when only a city is given, and ignores an empty query", () => {
    expect(parseLocationQuery("Brooklyn")).toEqual({ kind: "needs-state", text: "Brooklyn" });
    expect(parseLocationQuery("   ")).toEqual({ kind: "none" });
    expect(parseLocationQuery("123")).toEqual({ kind: "none" });
  });
});

describe("findCitySlug", () => {
  const cities = [
    { slug: "hackensack", name: "Hackensack" },
    { slug: "st-louis", name: "St. Louis" },
    { slug: "coeur-d-alene", name: "Coeur d'Alene" },
    { slug: "new-york-city", name: "New York City" },
    { slug: "bayamon", name: "Bayamón" },
  ];
  it("matches the city name however it was typed", () => {
    expect(findCitySlug(cities, "hackensack")).toBe("hackensack");
    expect(findCitySlug(cities, normalizePlace("Saint Louis"))).toBe("st-louis");
    expect(findCitySlug(cities, "coeur dalene")).toBe("coeur-d-alene");
    expect(findCitySlug(cities, "Newark")).toBeUndefined();
    expect(findCitySlug(cities, "Bayamon")).toBe("bayamon");
    expect(findCitySlug(cities, "Bayamón")).toBe("bayamon");
  });

  it("reads New York and NYC as New York City", () => {
    expect(findCitySlug(cities, "new york")).toBe("new-york-city");
    expect(findCitySlug(cities, "NYC")).toBe("new-york-city");
  });
});

describe("resolveLocation (what the search box does)", () => {
  const nj = [{ slug: "hackensack", name: "Hackensack" }];
  const load = async (stateSlug: string) => (stateSlug === "new-jersey" ? nj : []);
  const fails = async () => {
    throw new Error("chunk failed");
  };

  it("opens the city page when the site has one, else the state page", async () => {
    expect(await resolveLocation("Hackensack, NJ", load)).toEqual({ path: "/locations/new-jersey/hackensack" });
    expect(await resolveLocation("Teaneck, NJ", load)).toEqual({ path: "/locations/new-jersey" });
  });

  it("opens the state page for a ZIP code or a state, without loading cities", async () => {
    expect(await resolveLocation("02917", fails)).toEqual({ path: "/locations/rhode-island" });
    expect(await resolveLocation("Rhode Island", fails)).toEqual({ path: "/locations/rhode-island" });
  });

  it("opens the state page when the city list cannot load", async () => {
    expect(await resolveLocation("Hackensack, NJ", fails)).toEqual({ path: "/locations/new-jersey" });
  });

  it("explains, and opens nothing, when it cannot place the query", async () => {
    expect(await resolveLocation("", load)).toEqual({ message: expect.stringContaining("Enter a ZIP code") });
    expect(await resolveLocation("09001", load)).toEqual({ message: expect.stringContaining("could not place ZIP code 09001") });
    expect(await resolveLocation("Brooklyn", load)).toEqual({ message: expect.stringContaining('Add the state after "Brooklyn"') });
  });
});
