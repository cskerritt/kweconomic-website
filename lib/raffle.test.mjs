import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  DEFAULT_RAFFLE_EVENT,
  RAFFLE_EVENT_MAX_LENGTH,
  RAFFLE_PRIZE,
  RAFFLE_RULES,
  RAFFLE_SOURCE_PREFIX,
  buildRaffleEntry,
  buildRafflePayload,
  drawRaffleWinners,
  eligibleEntries,
  foldRaffleEntries,
  growLeadBody,
  normalizeEventSlug,
  raffleEntryKey,
  raffleUrl,
  validateRaffleFields,
} from "./raffle.mjs";

describe("normalizeEventSlug", () => {
  it("lowercases, hyphenates, and strips edge hyphens", () => {
    expect(normalizeEventSlug("  NJAJ Boardwalk 2026 ")).toBe("njaj-boardwalk-2026");
    expect(normalizeEventSlug("--Spring__Seminar!!--")).toBe("spring-seminar");
  });

  it("falls back to the default event when nothing usable survives normalization", () => {
    for (const raw of ["", "   ", "!!!", "---", null, undefined]) {
      expect(normalizeEventSlug(raw)).toBe(DEFAULT_RAFFLE_EVENT);
    }
    // A digits-only slug IS usable (a booth number, a year), so it survives.
    expect(normalizeEventSlug(2026)).toBe("2026");
  });

  it("caps the slug at RAFFLE_EVENT_MAX_LENGTH with no trailing hyphen", () => {
    const slug = normalizeEventSlug("american association for justice annual convention");
    expect(slug.length).toBeLessThanOrEqual(RAFFLE_EVENT_MAX_LENGTH);
    expect(slug.endsWith("-")).toBe(false);
    // The cap exists so the encoded URL stays inside the QR generator's
    // 58-byte version-6 level-H ceiling (scripts/lib/qr-encode.mjs).
    expect(raffleUrl("https://kwvrs.com", slug).length).toBeLessThanOrEqual(58);
  });
});

describe("raffleUrl", () => {
  it("omits the query string for the default event and trims a trailing slash", () => {
    expect(raffleUrl("https://kwvrs.com/", "default")).toBe("https://kwvrs.com/raffle");
    expect(raffleUrl("https://kwvrs.com", "")).toBe("https://kwvrs.com/raffle");
  });

  it("carries a named event as ?event=<slug>", () => {
    expect(raffleUrl("https://kwvrs.com", "NJAJ 2026")).toBe("https://kwvrs.com/raffle?event=njaj-2026");
  });
});

describe("raffleEntryKey", () => {
  it("keys on the normalized event plus the lowercased email", () => {
    expect(raffleEntryKey("NJAJ 2026", "  Dana@ReyesLaw.com ")).toBe("njaj-2026|dana@reyeslaw.com");
  });

  it("treats a missing event as the default event", () => {
    expect(raffleEntryKey(undefined, "a@b.com")).toBe("default|a@b.com");
  });
});

describe("validateRaffleFields", () => {
  it("passes a complete entry with no errors", () => {
    expect(
      validateRaffleFields({
        firstName: "Dana",
        lastName: "Reyes",
        email: "dana@reyeslaw.com",
        barAssociation: "New Jersey Association for Justice",
        phone: "201-555-0100",
      }),
    ).toEqual({});
  });

  it("requires first name, last name, a valid email, and a bar association", () => {
    const errors = validateRaffleFields({ firstName: " ", lastName: "", email: "nope" });
    expect(Object.keys(errors).sort()).toEqual(["barAssociation", "email", "firstName", "lastName"]);
  });

  it("accepts a blank phone but rejects a present-but-short one", () => {
    const base = { firstName: "A", lastName: "B", email: "a@b.com", barAssociation: "No association membership" };
    expect(validateRaffleFields({ ...base, phone: "" })).toEqual({});
    expect(validateRaffleFields({ ...base, phone: "555" }).phone).toBeTruthy();
  });
});

describe("buildRafflePayload", () => {
  it("trims every field and normalizes the event", () => {
    expect(
      buildRafflePayload(
        {
          firstName: " Dana ",
          lastName: " Reyes ",
          email: " dana@reyeslaw.com ",
          firm: " Reyes & Associates ",
          barAssociation: " New Jersey Association for Justice ",
          phone: " 201-555-0100 ",
        },
        "NJAJ 2026",
      ),
    ).toEqual({
      firstName: "Dana",
      lastName: "Reyes",
      email: "dana@reyeslaw.com",
      firm: "Reyes & Associates",
      barAssociation: "New Jersey Association for Justice",
      barAssociationOther: "",
      phone: "201-555-0100",
      event: "njaj-2026",
    });
  });
});

describe("buildRaffleEntry", () => {
  it("stamps the ledger row with the entry id, event, timestamp, and an undelivered Grow state", () => {
    const entry = buildRaffleEntry(
      { firstName: "Dana", lastName: "Reyes", email: "dana@reyeslaw.com", firm: "Reyes", phone: "", event: "NJAJ 2026" },
      { entryId: "e-1", timestamp: "2026-07-28T12:00:00.000Z" },
    );
    expect(entry).toEqual({
      kind: "raffle-entry",
      entryId: "e-1",
      event: "njaj-2026",
      firstName: "Dana",
      lastName: "Reyes",
      email: "dana@reyeslaw.com",
      firm: "Reyes",
      barAssociation: "",
      barAssociationOther: "",
      phone: "",
      timestamp: "2026-07-28T12:00:00.000Z",
      growDelivered: false,
      growAttemptedAt: null,
      growLeadId: null,
      growError: null,
    });
  });
});

describe("growLeadBody", () => {
  const entry = buildRaffleEntry(
    { firstName: "Dana", lastName: "Reyes", email: "dana@reyeslaw.com", firm: "Reyes & Associates", phone: "201-555-0100", event: "njaj-2026" },
    { entryId: "e-1", timestamp: "2026-07-28T12:00:00.000Z" },
  );

  it("maps the entry onto the Lead Inbox inbox_lead shape with the event in from_source", () => {
    expect(growLeadBody(entry, { referringUrl: "https://kwvrs.com/raffle?event=njaj-2026" })).toEqual({
      from_first: "Dana",
      from_last: "Reyes",
      from_email: "dana@reyeslaw.com",
      from_phone: "201-555-0100",
      from_message: "Gift card raffle entry from the njaj-2026 event QR code. Firm: Reyes & Associates.",
      referring_url: "https://kwvrs.com/raffle?event=njaj-2026",
      from_source: `${RAFFLE_SOURCE_PREFIX} - njaj-2026`,
    });
  });

  it("omits the firm clause when there is no firm and never emits an em dash", () => {
    const noFirm = { ...entry, firm: "" };
    const body = growLeadBody(noFirm, { referringUrl: "https://kwvrs.com/raffle" });
    expect(body.from_message).toBe("Gift card raffle entry from the njaj-2026 event QR code.");
    expect(`${body.from_message}${body.from_source}`).not.toContain("—");
  });

  it("falls back to placeholders so Grow's non-empty from_first/from_last rule cannot 422", () => {
    const body = growLeadBody({ ...entry, firstName: "", lastName: "" }, { referringUrl: "" });
    expect(body.from_first).toBe("Unknown");
    expect(body.from_last).toBe("Attendee");
  });
});

describe("foldRaffleEntries", () => {
  it("keeps the LAST row per entryId (the append-only delivery update wins)", () => {
    const rows = [
      { kind: "raffle-entry", entryId: "e-1", email: "a@b.com", growDelivered: false },
      { kind: "raffle-entry", entryId: "e-2", email: "c@d.com", growDelivered: false },
      { kind: "raffle-entry", entryId: "e-1", email: "a@b.com", growDelivered: true },
    ];
    expect(foldRaffleEntries(rows)).toEqual([
      { kind: "raffle-entry", entryId: "e-1", email: "a@b.com", growDelivered: true },
      { kind: "raffle-entry", entryId: "e-2", email: "c@d.com", growDelivered: false },
    ]);
  });

  it("ignores rows that are not raffle entries or carry no entryId", () => {
    expect(foldRaffleEntries([null, { kind: "other", entryId: "x" }, { kind: "raffle-entry" }])).toEqual([]);
  });
});

describe("eligibleEntries", () => {
  const row = (entryId, email, event, timestamp) => ({ kind: "raffle-entry", entryId, email, event, timestamp });

  it("filters to the event, dedupes by email keeping the earliest, and drops kwvrs.com staff", () => {
    const pool = eligibleEntries(
      [
        row("3", "dana@reyeslaw.com", "njaj-2026", "2026-07-28T12:30:00.000Z"),
        row("1", "Dana@ReyesLaw.com", "njaj-2026", "2026-07-28T12:00:00.000Z"),
        row("2", "sh@kwvrs.com", "njaj-2026", "2026-07-28T12:10:00.000Z"),
        row("4", "pat@otherfirm.com", "spring-seminar", "2026-07-28T12:20:00.000Z"),
        row("5", "pat@otherfirm.com", "njaj-2026", "2026-07-28T12:40:00.000Z"),
      ],
      "njaj-2026",
    );
    expect(pool.map((e) => e.entryId)).toEqual(["1", "5"]);
  });

  it("returns an empty pool for an event with no entries", () => {
    expect(eligibleEntries([row("1", "a@b.com", "njaj-2026", "2026-07-28T12:00:00.000Z")], "other")).toEqual([]);
  });
});

describe("drawRaffleWinners", () => {
  it("draws a winner and a distinct runner-up using the injected uniform generator", () => {
    const pool = ["a", "b", "c"].map((id) => ({ entryId: id }));
    // Stub: always take the first remaining entry, then the first of what is left.
    const { winner, runnerUp, entered } = drawRaffleWinners(pool, () => 0);
    expect(winner.entryId).toBe("a");
    expect(runnerUp.entryId).toBe("b");
    expect(entered).toBe(3);
  });

  it("returns nulls rather than throwing on a short or empty pool", () => {
    expect(drawRaffleWinners([], () => 0)).toEqual({ winner: null, runnerUp: null, entered: 0 });
    const one = drawRaffleWinners([{ entryId: "a" }], () => 0);
    expect(one.winner.entryId).toBe("a");
    expect(one.runnerUp).toBeNull();
  });

  it("asks the generator for an index inside the shrinking remaining pool", () => {
    const bounds = [];
    drawRaffleWinners([{ entryId: "a" }, { entryId: "b" }, { entryId: "c" }], (max) => {
      bounds.push(max);
      return max - 1;
    });
    expect(bounds).toEqual([3, 2]);
  });
});

describe("copy constants stay flagged for their owners", () => {
  const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "raffle.mjs"), "utf8");

  it("keeps the prize amount as a single constant with a TODO(chris) marker", () => {
    expect(RAFFLE_PRIZE).toContain("Amazon gift card");
    expect(src).toContain("TODO(chris)");
  });

  it("keeps the official rules behind a TODO(counsel) marker and states the required disclosures", () => {
    expect(src).toContain("TODO(counsel)");
    const rules = RAFFLE_RULES.join(" ");
    expect(rules).toMatch(/no purchase/i);
    expect(rules).toMatch(/one entry per person/i);
    expect(rules).toMatch(/void where prohibited/i);
    expect(rules).toMatch(/notified by email/i);
  });

  it("uses hyphens, never em dashes (CLAUDE.md content rule)", () => {
    expect(src).not.toContain("—");
  });
});
