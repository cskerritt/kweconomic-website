import { describe, it, expect } from "vitest";
import { isValidMeasurementId } from "./analytics";

describe("isValidMeasurementId", () => {
  it("accepts a well-formed GA4 measurement id", () => {
    expect(isValidMeasurementId("G-ABC123XYZ")).toBe(true);
    expect(isValidMeasurementId("G-1A2B3C")).toBe(true);
  });

  it("rejects empty or undefined", () => {
    expect(isValidMeasurementId("")).toBe(false);
    expect(isValidMeasurementId(undefined)).toBe(false);
  });

  it("rejects the all-X placeholder so a dormant deploy never sends data", () => {
    expect(isValidMeasurementId("G-XXXXXXXXXX")).toBe(false);
  });

  it("rejects malformed / legacy ids", () => {
    expect(isValidMeasurementId("UA-12345-1")).toBe(false);
    expect(isValidMeasurementId("ABC")).toBe(false);
    expect(isValidMeasurementId("G-")).toBe(false);
  });
});
