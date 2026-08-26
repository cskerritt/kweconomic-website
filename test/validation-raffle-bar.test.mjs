import { describe, expect, it } from "vitest";
import { BAR_ASSOCIATION_NONE, BAR_ASSOCIATION_OTHER, BAR_ASSOCIATION_OTHER_MAX_LENGTH } from "../lib/bar-associations.mjs";
import { normalizeRaffle, validateRoute } from "../validation.server.mjs";

// The server-side gate on the metrics dimension. normalizeRaffle runs as the
// route's `normalize` hook (server.js API_ROUTES) BEFORE validateRoute, so these
// two are exercised in that order, exactly as the handler runs them.

const body = (over = {}) => ({
  firstName: "Dana",
  lastName: "Reyes",
  email: "dana@reyeslaw.com",
  firm: "Reyes & Associates",
  phone: "201-555-0100",
  event: "NJAJ 2026",
  ...over,
});

function normalized(over) {
  const data = body(over);
  normalizeRaffle(data);
  return data;
}

describe("normalizeRaffle: the association is canonicalized in place", () => {
  it("keeps a roster value and trims it", () => {
    expect(normalized({ barAssociation: "  New Jersey Association for Justice " }).barAssociation).toBe(
      "New Jersey Association for Justice",
    );
  });

  it("blanks anything off the roster, so validateRoute can reject it", () => {
    expect(normalized({ barAssociation: "New Jersey Bar" }).barAssociation).toBe("");
    expect(normalized({}).barAssociation).toBe("");
  });

  it("keeps the free text ONLY under the Other option", () => {
    expect(
      normalized({ barAssociation: BAR_ASSOCIATION_OTHER, barAssociationOther: "  Bergen County   Bar " }).barAssociationOther,
    ).toBe("Bergen County Bar");
    // Stapling free text to a real association would put unvetted text into the
    // breakdown under a name that vouches for it.
    expect(
      normalized({ barAssociation: "New Jersey Defense Association", barAssociationOther: "anything" }).barAssociationOther,
    ).toBe("");
  });

  it("caps the free text at the shared maximum", () => {
    const data = normalized({ barAssociation: BAR_ASSOCIATION_OTHER, barAssociationOther: "x".repeat(500) });
    expect(data.barAssociationOther).toHaveLength(BAR_ASSOCIATION_OTHER_MAX_LENGTH);
  });
});

describe("validateRoute('raffle')", () => {
  it("passes a roster value and both escape options", () => {
    for (const value of ["Michigan Defense Trial Counsel", BAR_ASSOCIATION_OTHER, BAR_ASSOCIATION_NONE]) {
      expect(validateRoute("raffle", normalized({ barAssociation: value })), value).toBeNull();
    }
  });

  it("rejects a missing association and an off-roster one", () => {
    expect(validateRoute("raffle", normalized({}))).toMatch(/bar association/i);
    expect(validateRoute("raffle", normalized({ barAssociation: "Totally Made Up Bar" }))).toMatch(/bar association/i);
  });
});
