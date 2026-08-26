import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  BAR_ASSOCIATION_GROUPS,
  BAR_ASSOCIATION_NONE,
  BAR_ASSOCIATION_OTHER,
  BAR_ASSOCIATION_OTHER_MAX_LENGTH,
  BAR_ASSOCIATION_UNRECORDED,
  BAR_ASSOCIATION_VALUES,
  barAssociationDisplay,
  barAssociationMeta,
  barAssociationValue,
  isBarAssociation,
  normalizeBarAssociation,
  sanitizeBarAssociationOther,
  summarizeBarAssociations,
} from "./bar-associations.mjs";

const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "bar-associations.mjs"), "utf8");
const allOptions = BAR_ASSOCIATION_GROUPS.flatMap((g) => g.options);
const groupLabels = BAR_ASSOCIATION_GROUPS.map((g) => g.label);
const stateGroups = BAR_ASSOCIATION_GROUPS.filter((g) => g.scope === "state");

describe("group shape (display: National, then one group per state, then Other - Chris 2026-07-31)", () => {
  it("opens with National, closes with Other, and orders the state groups alphabetically", () => {
    expect(groupLabels[0]).toBe("National");
    expect(groupLabels[groupLabels.length - 1]).toBe("Other");
    const stateLabels = stateGroups.map((g) => g.label);
    expect(groupLabels).toEqual(["National", ...stateLabels, "Other"]);
    expect(stateLabels).toEqual([...stateLabels].sort((a, b) => a.localeCompare(b)));
    // Full jurisdiction names, never postal codes, on the optgroup labels.
    expect(stateLabels).toContain("Colorado");
    expect(stateLabels).toContain("District of Columbia");
    expect(stateLabels.some((l) => /^[A-Z]{2}$/.test(l))).toBe(false);
  });

  it("carries all 9 national organizations in the National group", () => {
    const national = BAR_ASSOCIATION_GROUPS.find((g) => g.label === "National");
    expect(national.options).toHaveLength(9);
    expect(national.options[0].value).toBe("American Association for Justice (AAJ)");
  });

  it("puts a state's plaintiff AND defense organizations in that state's one group", () => {
    const co = BAR_ASSOCIATION_GROUPS.find((g) => g.label === "Colorado");
    expect(co.state).toBe("CO");
    expect(co.options.map((o) => o.value)).toEqual([
      "Colorado Trial Lawyers Association",
      "Colorado Defense Lawyers Association",
    ]);
  });

  it("gives every option a non-empty value and a bare-name label inside state groups", () => {
    for (const option of allOptions) {
      expect(option.value.trim(), JSON.stringify(option)).toBe(option.value);
      expect(option.value.length).toBeGreaterThan(0);
      expect(option.label.length).toBeGreaterThan(0);
    }
    for (const group of stateGroups) {
      for (const option of group.options) {
        expect(option.label, `${group.label}: ${option.label}`).toBe(option.value);
      }
    }
  });

  it("has no duplicate value inside any one group, and the deduped flat list is BAR_ASSOCIATION_VALUES", () => {
    for (const group of BAR_ASSOCIATION_GROUPS) {
      const values = group.options.map((o) => o.value);
      expect(new Set(values).size, group.label).toBe(values.length);
    }
    // A multi-state organization appears under EACH of its states, so the
    // display list may repeat a value across groups - the canonical allow-list
    // must still be the deduped set.
    const deduped = new Set(allOptions.map((o) => o.value));
    expect(deduped.size).toBe(BAR_ASSOCIATION_VALUES.length);
    expect([...deduped].sort()).toEqual([...BAR_ASSOCIATION_VALUES].sort());
  });

  it("carries 108 organizations plus the two escape options", () => {
    // A number here is a drift guard, not a statistic: a dropped or duplicated
    // line in a 108-entry hand-typed roster is otherwise invisible.
    expect(BAR_ASSOCIATION_VALUES).toHaveLength(110);
    // 9 national + 2 escape + 101 state slots (51 plaintiff + 48 defense rows,
    // with the Tri-State bar occupying one slot in each of ME/NH/VT = 50 rows
    // displayed as 50... the defense roster's 50 rows collapse to 48 values).
    expect(BAR_ASSOCIATION_GROUPS[0].options).toHaveLength(9);
    const stateSlots = stateGroups.reduce((n, g) => n + g.options.length, 0);
    expect(stateSlots).toBe(101); // 51 plaintiff rows + 50 defense rows
  });
});

describe("the roster itself", () => {
  it("keeps ABOTA on the mixed side, never plaintiff (display regroup must not change rollups)", () => {
    // ABOTA membership is split between plaintiff counsel, defense counsel and
    // judges. Filing it under plaintiff would silently skew the rollup.
    const meta = barAssociationMeta("American Board of Trial Advocates (ABOTA)");
    expect(meta.side).toBe("both");
    expect(meta.scope).toBe("national");
    const national = BAR_ASSOCIATION_GROUPS.find((g) => g.label === "National");
    expect(national.options.some((o) => o.value === "American Board of Trial Advocates (ABOTA)")).toBe(true);
  });

  it("names the national organizations in their current form", () => {
    for (const value of [
      "American Association for Justice (AAJ)",
      "The National Trial Lawyers (NTL)",
      "Public Justice",
      "DRI (Association of Lawyers Defending Business)",
      "International Association of Defense Counsel (IADC)",
      "Federation of Defense & Corporate Counsel (FDCC)",
      "Association of Defense Trial Attorneys (ADTA)",
      "Product Liability Advisory Council (PLAC)",
    ]) {
      expect(isBarAssociation(value), value).toBe(true);
    }
    // Retired DRI tagline: it must not come back on a later edit. The guard is
    // on the roster rather than the source text, because the module header has
    // to name the tagline in order to record that it is retired.
    const tagline = "Voice of the Defense Bar";
    expect(allOptions.some((o) => o.value.includes(tagline) || o.label.includes(tagline))).toBe(false);
  });

  it("covers all 50 states and DC on the plaintiff side", () => {
    // META keeps the sided/scoped view (and the code-prefixed report labels)
    // even though the page now groups by state.
    const plaintiffLabels = BAR_ASSOCIATION_VALUES
      .map((v) => barAssociationMeta(v))
      .filter((m) => m.scope === "state" && m.side === "plaintiff")
      .map((m) => m.label);
    const codes = plaintiffLabels.map((l) => l.split(" - ")[0]);
    expect(new Set(codes).size).toBe(51);
    expect(codes).toContain("DC");
    expect(codes).toContain("AK");
    expect(codes).toContain("HI");
    // And every one of the 51 jurisdictions has its own display group.
    expect(stateGroups.length).toBe(51);
  });

  it("keeps the names that did NOT convert to 'Association for Justice'", () => {
    for (const value of [
      "Kansas Trial Lawyers Association",
      "Tennessee Trial Lawyers Association",
      "South Dakota Trial Lawyers Association",
      "New York State Trial Lawyers Association",
      "Massachusetts Academy of Trial Attorneys",
      "Consumer Attorneys of California",
      "Trial Lawyers Association of Metropolitan Washington, D.C.",
    ]) {
      expect(isBarAssociation(value), value).toBe(true);
    }
  });

  it("omits Alaska and Hawaii from the defense side, because neither has a civil defense bar", () => {
    const defenseCodes = BAR_ASSOCIATION_VALUES
      .map((v) => barAssociationMeta(v))
      .filter((m) => m.scope === "state" && m.side === "defense")
      .flatMap((m) => m.label.split(" - ")[0].split(" / "));
    expect(defenseCodes).not.toContain("AK");
    expect(defenseCodes).not.toContain("HI");
    // The single-org states' display groups carry exactly one option.
    expect(BAR_ASSOCIATION_GROUPS.find((g) => g.label === "Alaska").options).toHaveLength(1);
    expect(BAR_ASSOCIATION_GROUPS.find((g) => g.label === "Hawaii").options).toHaveLength(1);
    // The reason has to survive in the file, or a later editor "fixes" the gap.
    expect(src).toContain("Alaska and Hawaii have no statewide civil defense bar");
  });

  it("keeps the shared Tri-State defense bar as ONE value, shown under each of its three states", () => {
    // One stored value (the metrics label still names all three jurisdictions),
    // displayed under Maine, New Hampshire AND Vermont so an entrant finds it
    // wherever they look.
    expect(barAssociationMeta("Tri-State Defense Lawyers Association").label)
      .toBe("ME / NH / VT - Tri-State Defense Lawyers Association");
    const homes = stateGroups
      .filter((g) => g.options.some((o) => o.value === "Tri-State Defense Lawyers Association"))
      .map((g) => g.label);
    expect(homes).toEqual(["Maine", "New Hampshire", "Vermont"]);
    expect(BAR_ASSOCIATION_VALUES.filter((v) => v === "Tri-State Defense Lawyers Association")).toHaveLength(1);
  });

  it("carries both California defense organizations and Nevada's real one", () => {
    expect(isBarAssociation("Association of Defense Counsel of Northern California and Nevada")).toBe(true);
    expect(isBarAssociation("Association of Southern California Defense Counsel")).toBe(true);
    // County-scoped, and named as it names itself - not invented into a
    // statewide "Nevada Defense Lawyers Association" that does not exist.
    expect(isBarAssociation("Las Vegas Defense Lawyers")).toBe(true);
    expect(isBarAssociation("Nevada Defense Lawyers Association")).toBe(false);
  });

  it("cites how the roster was verified", () => {
    expect(src).toContain("2026-07-29");
    expect(src).toContain("AAJ");
    expect(src).toContain("DRI");
    expect(src).toContain("SLDO");
  });

  it("uses hyphens, never em dashes (CLAUDE.md content rule)", () => {
    expect(src).not.toMatch(/[–—]/);
  });
});

describe("normalizeBarAssociation / isBarAssociation", () => {
  it("accepts an exact roster value and tolerates surrounding or doubled whitespace", () => {
    expect(normalizeBarAssociation("  New Jersey Association for Justice ")).toBe("New Jersey Association for Justice");
    expect(normalizeBarAssociation("New Jersey  Association for Justice")).toBe("New Jersey Association for Justice");
  });

  it("returns an empty string for anything off the roster, so junk cannot enter the metric", () => {
    for (const raw of ["", "   ", "New Jersey Bar", "<script>", null, undefined, 7, {}]) {
      expect(normalizeBarAssociation(raw)).toBe("");
      expect(isBarAssociation(raw)).toBe(false);
    }
  });

  it("treats both escape options as roster values", () => {
    expect(normalizeBarAssociation(BAR_ASSOCIATION_OTHER)).toBe(BAR_ASSOCIATION_OTHER);
    expect(normalizeBarAssociation(BAR_ASSOCIATION_NONE)).toBe(BAR_ASSOCIATION_NONE);
  });
});

describe("sanitizeBarAssociationOther", () => {
  it("collapses whitespace, strips control characters, and caps the length", () => {
    expect(sanitizeBarAssociationOther("  Bergen County   Bar\tAssociation ")).toBe("Bergen County Bar Association");
    expect(sanitizeBarAssociationOther("line\nbreak")).toBe("line break");
    expect(sanitizeBarAssociationOther("x".repeat(400))).toHaveLength(BAR_ASSOCIATION_OTHER_MAX_LENGTH);
    expect(BAR_ASSOCIATION_OTHER_MAX_LENGTH).toBe(120);
  });

  it("returns an empty string for nothing usable", () => {
    for (const raw of ["", "   ", null, undefined]) expect(sanitizeBarAssociationOther(raw)).toBe("");
  });
});

describe("barAssociationValue / barAssociationDisplay", () => {
  it("buckets a missing or unknown association as (not recorded)", () => {
    expect(barAssociationValue({})).toBe(BAR_ASSOCIATION_UNRECORDED);
    expect(barAssociationValue({ barAssociation: "Made Up Bar" })).toBe(BAR_ASSOCIATION_UNRECORDED);
    expect(BAR_ASSOCIATION_UNRECORDED).toBe("(not recorded)");
  });

  it("displays nothing for a missing association, so callers pick their own fallback", () => {
    expect(barAssociationDisplay({})).toBe("");
    expect(barAssociationDisplay({ barAssociation: "Made Up Bar" })).toBe("");
  });

  it("shows the typed text for the Other option and the bare option when nothing was typed", () => {
    expect(
      barAssociationDisplay({ barAssociation: BAR_ASSOCIATION_OTHER, barAssociationOther: " Bergen County Bar " }),
    ).toBe("Other - Bergen County Bar");
    expect(barAssociationDisplay({ barAssociation: BAR_ASSOCIATION_OTHER })).toBe(BAR_ASSOCIATION_OTHER);
  });

  it("ignores free text riding alongside a real association", () => {
    const entry = { barAssociation: "Michigan Defense Trial Counsel", barAssociationOther: "ignored" };
    expect(barAssociationDisplay(entry)).toBe("Michigan Defense Trial Counsel");
  });
});

describe("summarizeBarAssociations", () => {
  const entries = [
    { barAssociation: "New Jersey Association for Justice" },
    { barAssociation: "New Jersey Association for Justice" },
    { barAssociation: "New Jersey Defense Association" },
    { barAssociation: "American Board of Trial Advocates (ABOTA)" },
    { barAssociation: "American Association for Justice (AAJ)" },
    { barAssociation: BAR_ASSOCIATION_NONE },
    { barAssociation: BAR_ASSOCIATION_OTHER, barAssociationOther: "Bergen County Bar" },
    { barAssociation: BAR_ASSOCIATION_OTHER, barAssociationOther: "Bergen County Bar" },
    {}, // a pre-2026-07-29 ledger row
  ];

  it("counts each association once and orders the rows by count", () => {
    const { total, rows } = summarizeBarAssociations(entries);
    expect(total).toBe(9);
    expect(rows[0]).toMatchObject({ value: "New Jersey Association for Justice", count: 2, side: "plaintiff", scope: "state" });
    expect(rows[0].label).toBe("NJ - New Jersey Association for Justice");
    expect(rows.find((r) => r.value === BAR_ASSOCIATION_UNRECORDED)).toMatchObject({ count: 1, scope: "other" });
  });

  it("rolls up by side and by scope without double counting", () => {
    const { rollups } = summarizeBarAssociations(entries);
    expect(rollups).toEqual({
      plaintiff: 3,
      defense: 1,
      both: 1,
      national: 2,
      state: 3,
      other: 2,
      none: 1,
      unrecorded: 1,
    });
    // The side buckets plus the three non-sided buckets account for every entry.
    expect(rollups.plaintiff + rollups.defense + rollups.both + rollups.other + rollups.none + rollups.unrecorded).toBe(9);
    // Every sided entry is either national or state.
    expect(rollups.national + rollups.state).toBe(rollups.plaintiff + rollups.defense + rollups.both);
  });

  it("collects what people typed under Other, counted and deduped", () => {
    expect(summarizeBarAssociations(entries).otherTexts).toEqual([{ text: "Bergen County Bar", count: 2 }]);
  });

  it("survives an empty list and null rows", () => {
    expect(summarizeBarAssociations([])).toEqual({ total: 0, rows: [], rollups: { plaintiff: 0, defense: 0, both: 0, national: 0, state: 0, other: 0, none: 0, unrecorded: 0 }, otherTexts: [] });
    expect(summarizeBarAssociations([null, undefined]).total).toBe(0);
  });
});
