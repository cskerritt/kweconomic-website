import { describe, expect, it } from "vitest";
import {
  TURNAROUND_OPTIONS,
  DEFAULT_TURNAROUND,
  turnaroundLabel,
  type TurnaroundOption,
} from "./turnaround";

describe("turnaround constants", () => {
  it("offers Standard first so it is the default-selected option", () => {
    expect(TURNAROUND_OPTIONS[0].value).toBe("standard");
  });

  it("has exactly the two allowed values", () => {
    expect(TURNAROUND_OPTIONS.map((o) => o.value)).toEqual(["standard", "rush"]);
  });

  it("defaults to standard", () => {
    expect(DEFAULT_TURNAROUND).toBe("standard");
  });

  it("renders display labels with no day numbers", () => {
    expect(turnaroundLabel("rush")).toBe("Rush");
    expect(turnaroundLabel("standard")).toBe("Standard");
  });

  it("contains no day numbers anywhere in the module surface", () => {
    const joined = JSON.stringify(TURNAROUND_OPTIONS) + DEFAULT_TURNAROUND;
    expect(joined).not.toMatch(/\d/);
    const opt: TurnaroundOption = "rush";
    expect(opt).toBe("rush");
  });
});
