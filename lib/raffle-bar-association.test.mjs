import { describe, expect, it } from "vitest";
import {
  BAR_ASSOCIATION_NONE,
  BAR_ASSOCIATION_OTHER,
  BAR_ASSOCIATION_OTHER_MAX_LENGTH,
} from "./bar-associations.mjs";
import { buildRaffleEntry, buildRafflePayload, growLeadBody, validateRaffleFields } from "./raffle.mjs";

// The bar-association dimension as it flows through the shared raffle logic:
// validation (client AND server run this exact function), the POST payload, the
// stored ledger row, and the Clio Grow lead message. The roster module itself is
// covered by lib/bar-associations.test.mjs.

const FIELDS = {
  firstName: "Dana",
  lastName: "Reyes",
  email: "dana@reyeslaw.com",
  firm: "Reyes & Associates",
  phone: "201-555-0100",
};

describe("validateRaffleFields: the association is required but never blocking", () => {
  it("rejects a missing association", () => {
    expect(validateRaffleFields(FIELDS).barAssociation).toBeTruthy();
  });

  it("rejects a value that is not on the roster", () => {
    expect(validateRaffleFields({ ...FIELDS, barAssociation: "New Jersey Bar" }).barAssociation).toBeTruthy();
  });

  it("accepts a roster value and both escape options", () => {
    for (const value of ["New Jersey Association for Justice", BAR_ASSOCIATION_OTHER, BAR_ASSOCIATION_NONE]) {
      expect(validateRaffleFields({ ...FIELDS, barAssociation: value }), value).toEqual({});
    }
  });

  it("accepts the Other option with no free text, and caps the free text it does accept", () => {
    expect(validateRaffleFields({ ...FIELDS, barAssociation: BAR_ASSOCIATION_OTHER })).toEqual({});
    expect(
      validateRaffleFields({ ...FIELDS, barAssociation: BAR_ASSOCIATION_OTHER, barAssociationOther: "Bergen County Bar" }),
    ).toEqual({});
    const long = validateRaffleFields({
      ...FIELDS,
      barAssociation: BAR_ASSOCIATION_OTHER,
      barAssociationOther: "x".repeat(BAR_ASSOCIATION_OTHER_MAX_LENGTH + 1),
    });
    expect(long.barAssociationOther).toBeTruthy();
  });
});

describe("buildRafflePayload", () => {
  it("carries the association and drops free text that does not belong to the Other option", () => {
    const payload = buildRafflePayload(
      { ...FIELDS, barAssociation: " New Jersey Association for Justice ", barAssociationOther: "ignored" },
      "NJAJ 2026",
    );
    expect(payload.barAssociation).toBe("New Jersey Association for Justice");
    expect(payload.barAssociationOther).toBe("");
  });

  it("keeps the free text under the Other option, sanitized", () => {
    const payload = buildRafflePayload(
      { ...FIELDS, barAssociation: BAR_ASSOCIATION_OTHER, barAssociationOther: "  Bergen County   Bar  " },
      "njaj-2026",
    );
    expect(payload).toMatchObject({ barAssociation: BAR_ASSOCIATION_OTHER, barAssociationOther: "Bergen County Bar" });
  });

  it("blanks an off-roster value rather than passing it through", () => {
    expect(buildRafflePayload({ ...FIELDS, barAssociation: "<script>" }, "e").barAssociation).toBe("");
  });
});

describe("buildRaffleEntry", () => {
  it("stores both keys on the ledger row", () => {
    const entry = buildRaffleEntry(
      { ...FIELDS, event: "njaj-2026", barAssociation: BAR_ASSOCIATION_OTHER, barAssociationOther: "Bergen County Bar" },
      { entryId: "e-1", timestamp: "2026-07-29T12:00:00.000Z" },
    );
    expect(entry).toMatchObject({ barAssociation: BAR_ASSOCIATION_OTHER, barAssociationOther: "Bergen County Bar" });
  });

  it("records an empty pair for a row built without the field (the pre-2026-07-29 shape)", () => {
    const entry = buildRaffleEntry({ ...FIELDS, event: "njaj-2026" }, { entryId: "e-2" });
    expect(entry.barAssociation).toBe("");
    expect(entry.barAssociationOther).toBe("");
  });
});

describe("growLeadBody: the association reads in the Clio Grow inbox", () => {
  const base = { event: "njaj-2026", firstName: "Dana", lastName: "Reyes", email: "dana@reyeslaw.com", firm: "Reyes & Associates", phone: "" };

  it("appends the association after the firm clause", () => {
    const body = growLeadBody({ ...base, barAssociation: "New Jersey Association for Justice" }, { referringUrl: "" });
    expect(body.from_message).toBe(
      "Gift card raffle entry from the njaj-2026 event QR code. Firm: Reyes & Associates. Bar association: New Jersey Association for Justice.",
    );
  });

  it("carries the typed text for the Other option", () => {
    const body = growLeadBody(
      { ...base, firm: "", barAssociation: BAR_ASSOCIATION_OTHER, barAssociationOther: "Bergen County Bar" },
      { referringUrl: "" },
    );
    expect(body.from_message).toBe(
      "Gift card raffle entry from the njaj-2026 event QR code. Bar association: Other - Bergen County Bar.",
    );
  });

  it("omits the clause entirely for an entry that never recorded one", () => {
    const body = growLeadBody({ ...base, firm: "" }, { referringUrl: "" });
    expect(body.from_message).toBe("Gift card raffle entry from the njaj-2026 event QR code.");
  });

  it("never emits an em dash (CLAUDE.md content rule)", () => {
    const body = growLeadBody({ ...base, barAssociation: BAR_ASSOCIATION_NONE }, { referringUrl: "" });
    expect(body.from_message).not.toMatch(/[–—]/);
  });
});
