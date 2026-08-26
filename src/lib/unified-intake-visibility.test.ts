import { describe, expect, it } from "vitest";
import { unifiedFieldVisibility } from "./unified-intake-visibility";

describe("unifiedFieldVisibility", () => {
  it("standard route: shows side, work products, and e-sign/payment; no WPEC notice", () => {
    const v = unifiedFieldVisibility("Personal Injury");
    expect(v).toEqual({ showSide: true, showWorkProducts: true, showEsignAndPayment: true, showWpecNotice: false });
  });
  it("matrimonial route: hides side only", () => {
    const v = unifiedFieldVisibility("Matrimonial/Divorce");
    expect(v).toEqual({ showSide: false, showWorkProducts: true, showEsignAndPayment: true, showWpecNotice: false });
  });
  it("wpec route WITH routing enabled: hides side, work products, and e-sign/payment; shows the WPEC notice", () => {
    const v = unifiedFieldVisibility("Wrongful Termination", true);
    expect(v).toEqual({ showSide: false, showWorkProducts: false, showEsignAndPayment: false, showWpecNotice: true });
  });
  it("wpec route with routing DISABLED (prod default): no false WPEC notice, and the standard fields are shown", () => {
    // The server only routes to WPEC when WPEC_ROUTING_ENABLED is on; with it
    // off, an employment case runs the standard pipeline, so the form must not
    // promise a WPEC referral and must collect the standard fields.
    const v = unifiedFieldVisibility("Wrongful Termination", false);
    expect(v).toEqual({ showSide: true, showWorkProducts: true, showEsignAndPayment: true, showWpecNotice: false });
  });
  it("defaults to routing DISABLED when the flag is omitted (mirrors the off-by-default server flag)", () => {
    const v = unifiedFieldVisibility("Wrongful Termination");
    expect(v.showWpecNotice).toBe(false);
    expect(v.showWorkProducts).toBe(true);
    expect(v.showEsignAndPayment).toBe(true);
    expect(v.showSide).toBe(true);
  });
  it("blank/unknown case type defaults to the standard (full) field set", () => {
    expect(unifiedFieldVisibility("").showSide).toBe(true);
    expect(unifiedFieldVisibility("Nonsense").showEsignAndPayment).toBe(true);
  });
});
