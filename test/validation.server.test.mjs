import { describe, expect, it } from "vitest";
import { isEmail, isPhone, validateRoute } from "../validation.server.mjs";

const TYPES = ["contact", "consultation", "whitepaper"];

describe("isEmail / isPhone", () => {
  it("requires a 2+ character TLD (truncated-TLD regression)", () => {
    expect(isEmail("ann@firm.com")).toBe(true);
    expect(isEmail("ann@firm.c")).toBe(false);
    expect(isEmail("ann@firm")).toBe(false);
    expect(isEmail("not an email")).toBe(false);
    expect(isEmail(undefined)).toBe(false);
  });
  it("counts digits only, needing at least 10", () => {
    expect(isPhone("201-555-1212")).toBe(true);
    expect(isPhone("(201) 555 1212")).toBe(true);
    expect(isPhone("555-1212")).toBe(false);
    expect(isPhone(2015551212)).toBe(false);
  });
});

describe("validateRoute", () => {
  it("rejects a bad email on every type", () => {
    for (const type of TYPES) {
      expect(validateRoute(type, { email: "nope", phone: "201-555-1212", slug: "x" }), type).toMatch(/valid email/);
    }
  });
  it("contact requires a phone", () => {
    expect(validateRoute("contact", { email: "a@b.co" })).toMatch(/valid phone/);
    expect(validateRoute("contact", { email: "a@b.co", phone: "123" })).toMatch(/valid phone/);
    expect(validateRoute("contact", { email: "a@b.co", phone: "201-555-1212" })).toBeNull();
  });
  it("consultation accepts a missing phone but rejects a bad one", () => {
    expect(validateRoute("consultation", { email: "a@b.co" })).toBeNull();
    expect(validateRoute("consultation", { email: "a@b.co", phone: "" })).toBeNull();
    expect(validateRoute("consultation", { email: "a@b.co", phone: "123" })).toMatch(/valid phone/);
    expect(validateRoute("consultation", { email: "a@b.co", phone: "201-555-1212" })).toBeNull();
  });
  it("whitepaper requires a slug", () => {
    expect(validateRoute("whitepaper", { email: "a@b.co" })).toMatch(/slug/);
    expect(validateRoute("whitepaper", { email: "a@b.co", slug: 5 })).toMatch(/slug/);
    expect(validateRoute("whitepaper", { email: "a@b.co", slug: "tbi-guide" })).toBeNull();
  });
});
