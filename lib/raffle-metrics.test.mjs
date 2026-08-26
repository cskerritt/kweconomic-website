import { describe, expect, it } from "vitest";
import { BAR_ASSOCIATION_OTHER, BAR_ASSOCIATION_UNRECORDED } from "./bar-associations.mjs";
import {
  ALL_EVENTS,
  growStatus,
  raffleEntryRows,
  raffleEventFilter,
  raffleEventSummary,
  raffleEvents,
  raffleLeadsReport,
} from "./raffle-metrics.mjs";

// Pure aggregation over FOLDED ledger entries (lib/raffle.server.mjs's
// readRaffleEntries has already collapsed the append-only file to one row per
// entryId). Shared by the site's GET /api/raffle-entries and by
// scripts/raffle-stats.mjs, so both surfaces can never report different numbers.

const entry = (over = {}) => ({
  kind: "raffle-entry",
  entryId: "e-1",
  event: "njaj-2026",
  firstName: "Dana",
  lastName: "Reyes",
  email: "dana@reyeslaw.com",
  firm: "Reyes & Associates",
  barAssociation: "New Jersey Association for Justice",
  barAssociationOther: "",
  phone: "",
  timestamp: "2026-07-29T12:00:00.000Z",
  growDelivered: true,
  growAttemptedAt: "2026-07-29T12:00:01.000Z",
  growLeadId: "1",
  growError: null,
  ...over,
});

const LEDGER = [
  entry(),
  entry({ entryId: "e-2", email: "sam@firm.com", firstName: "Sam", lastName: "Cole", barAssociation: "New Jersey Defense Association", timestamp: "2026-07-29T13:00:00.000Z" }),
  // Never attempted: no Grow token was configured when this one was stored.
  entry({ entryId: "e-3", email: "pat@firm.com", firstName: "Pat", lastName: "Lin", barAssociation: BAR_ASSOCIATION_OTHER, barAssociationOther: "Bergen County Bar", growDelivered: false, growAttemptedAt: null, growLeadId: null, timestamp: "2026-07-29T14:00:00.000Z" }),
  // Attempted and failed.
  entry({ entryId: "e-4", email: "kim@firm.com", firstName: "Kim", lastName: "Ono", growDelivered: false, growError: "Clio Grow inbox_leads returned 503: down", timestamp: "2026-07-29T15:00:00.000Z" }),
  // A different event, and a row written before the field existed.
  entry({ entryId: "e-5", event: "spring-seminar", email: "lee@firm.com", firstName: "Lee", lastName: "Fox", barAssociation: undefined, barAssociationOther: undefined, timestamp: "2026-07-29T16:00:00.000Z" }),
];

describe("raffleEventFilter", () => {
  it("treats a blank or missing event as ALL events, not the default event slug", () => {
    // normalizeEventSlug("") is "default", which is a REAL event, so the blank
    // case cannot go through it or the page would silently show one event.
    for (const raw of ["", "   ", null, undefined]) expect(raffleEventFilter(raw)).toBe(ALL_EVENTS);
    expect(ALL_EVENTS).toBe("");
  });

  it("normalizes a named event the same way the QR code does", () => {
    expect(raffleEventFilter(" NJAJ 2026 ")).toBe("njaj-2026");
  });
});

describe("raffleEvents", () => {
  it("lists every event with its entry count, busiest first", () => {
    expect(raffleEvents(LEDGER)).toEqual([
      { event: "njaj-2026", count: 4 },
      { event: "spring-seminar", count: 1 },
    ]);
  });
});

describe("growStatus", () => {
  it("separates delivered, failed, and never-attempted", () => {
    expect(growStatus({ growDelivered: true })).toBe("delivered");
    expect(growStatus({ growDelivered: false, growAttemptedAt: "2026-07-29T12:00:00.000Z" })).toBe("failed");
    expect(growStatus({ growDelivered: false, growAttemptedAt: null })).toBe("queued");
    expect(growStatus({})).toBe("queued");
  });
});

describe("raffleEventSummary", () => {
  it("counts entries, unique attorneys, and the three Grow states", () => {
    expect(raffleEventSummary(LEDGER)).toEqual({
      entries: 5,
      attorneys: 5,
      growDelivered: 3,
      growFailed: 1,
      growQueued: 1,
    });
  });

  it("counts one attorney once even across events, case-insensitively", () => {
    const twice = [entry({ entryId: "a" }), entry({ entryId: "b", event: "spring-seminar", email: "DANA@ReyesLaw.com" })];
    expect(raffleEventSummary(twice)).toMatchObject({ entries: 2, attorneys: 1 });
  });
});

describe("raffleEntryRows", () => {
  it("returns newest first with a display-ready association and Grow state", () => {
    const rows = raffleEntryRows(LEDGER);
    expect(rows.map((r) => r.entryId)).toEqual(["e-5", "e-4", "e-3", "e-2", "e-1"]);
    expect(rows[2]).toMatchObject({ name: "Pat Lin", association: "Other - Bergen County Bar", grow: "queued" });
    expect(rows[1]).toMatchObject({ name: "Kim Ono", grow: "failed" });
  });

  it("shows (not recorded) for a row written before the field existed", () => {
    expect(raffleEntryRows(LEDGER)[0]).toMatchObject({ entryId: "e-5", association: BAR_ASSOCIATION_UNRECORDED });
  });

  it("carries no phone: the dashboard page does not need it and it leaves the service", () => {
    expect(raffleEntryRows(LEDGER)[0]).not.toHaveProperty("phone");
  });
});

describe("raffleLeadsReport", () => {
  const now = new Date("2026-07-29T17:00:00.000Z");

  it("scopes the summary, breakdown, and rows to one event while listing them all", () => {
    const report = raffleLeadsReport(LEDGER, "NJAJ 2026", { now });
    expect(report.event).toBe("njaj-2026");
    expect(report.events).toHaveLength(2);
    expect(report.summary.entries).toBe(4);
    expect(report.rows).toHaveLength(4);
    expect(report.breakdown.total).toBe(4);
    expect(report.breakdown.rollups.unrecorded).toBe(0);
    expect(report.generatedAt).toBe("2026-07-29T17:00:00.000Z");
  });

  it("reports across every event when no event is given", () => {
    const report = raffleLeadsReport(LEDGER, "", { now });
    expect(report.event).toBe(ALL_EVENTS);
    expect(report.summary.entries).toBe(5);
    expect(report.breakdown.rollups.unrecorded).toBe(1);
  });

  it("returns an honest empty report for an event with no entries", () => {
    const report = raffleLeadsReport(LEDGER, "not-an-event", { now });
    expect(report.summary).toEqual({ entries: 0, attorneys: 0, growDelivered: 0, growFailed: 0, growQueued: 0 });
    expect(report.rows).toEqual([]);
    expect(report.breakdown.total).toBe(0);
    // The chips still offer the events that DO have entries.
    expect(report.events).toHaveLength(2);
  });

  it("survives an empty ledger", () => {
    const report = raffleLeadsReport([], "", { now });
    expect(report).toMatchObject({ event: "", events: [], rows: [] });
    expect(report.summary.entries).toBe(0);
  });
});
