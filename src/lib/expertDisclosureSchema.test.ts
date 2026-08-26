import { describe, expect, it } from "vitest";
import {
  expertDisclosurePillarSchema,
  disclosureStateSchema,
} from "./expertDisclosureSchema";

describe("expertDisclosurePillarSchema", () => {
  it("returns Service with correct @id", () => {
    const p = expertDisclosurePillarSchema({ jurisdictionCount: 56, dateModified: "2026-05-03" });
    expect(p["@type"]).toBe("Service");
    expect(p["@id"]).toBe("https://kwvrs.com/services/expert-disclosure#service");
    expect(p["dateModified"]).toBe("2026-05-03");
  });
});

describe("disclosureStateSchema", () => {
  it("returns Service with state-specific URL and no legislation entity", () => {
    const s = disclosureStateSchema({
      stateSlug: "new-york",
      stateName: "New York",
    });
    expect(s["@type"]).toBe("Service");
    expect(s["@id"]).toBe("https://kwvrs.com/services/expert-disclosure/new-york#service");
    const area = s["areaServed"] as { name: string };
    expect(area.name).toBe("New York");
    expect(s["about"]).toBeUndefined();
    const isPartOf = s["isPartOf"] as { "@id": string };
    expect(isPartOf["@id"]).toBe("https://kwvrs.com/services/expert-disclosure#service");
  });
});
