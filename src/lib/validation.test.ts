import { describe, expect, it } from "vitest";
import { isEmail, isPhone, isZip, isNonEmpty, validateFields } from "./validation";

describe("validators", () => {
  it("isEmail", () => {
    expect(isEmail("a@b.com")).toBe(true);
    expect(isEmail("nope")).toBe(false);
    expect(isEmail("a@b")).toBe(false);
  });
  it("isPhone requires >= 10 digits", () => {
    expect(isPhone("(203) 605-2814")).toBe(true);
    expect(isPhone("12345")).toBe(false);
  });
  it("isZip accepts 5 or 5+4", () => {
    expect(isZip("02860")).toBe(true);
    expect(isZip("02860-1234")).toBe(true);
    expect(isZip("123")).toBe(false);
  });
  it("isNonEmpty trims", () => {
    expect(isNonEmpty("  x ")).toBe(true);
    expect(isNonEmpty("   ")).toBe(false);
  });
  it("validateFields returns messages only for failures", () => {
    const errs = validateFields(
      { email: "bad", name: "Jane" },
      { email: { test: isEmail, message: "Enter a valid email" }, name: { test: isNonEmpty, message: "Required" } },
    );
    expect(errs).toEqual({ email: "Enter a valid email" });
  });
});
