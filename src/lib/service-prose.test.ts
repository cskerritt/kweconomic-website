import { describe, expect, it } from "vitest";
import { capFirst, proseName, workPhrase, withArticle } from "./service-prose.mjs";
import { pillarServices } from "@/data/services";

describe("proseName", () => {
  it("lowercases the short name", () => {
    expect(proseName("Lost Earnings")).toBe("lost earnings");
  });

  it("spells out an ampersand with single spaces around it", () => {
    expect(proseName("Fraud & Tracing")).toBe("fraud and tracing");
    expect(proseName("Fraud&Tracing")).toBe("fraud and tracing");
    expect(proseName("Fraud  &  Tracing")).toBe("fraud and tracing");
  });
});

describe("workPhrase", () => {
  it("appends ' analysis' to a loss subject", () => {
    expect(workPhrase("Wrongful Death")).toBe("wrongful death analysis");
    expect(workPhrase("Fraud & Tracing")).toBe("fraud and tracing analysis");
    expect(workPhrase("Rebuttal")).toBe("rebuttal analysis");
  });

  it("keeps a short name that already ends in a work noun", () => {
    expect(workPhrase("Divorce Financial Analysis")).toBe("divorce financial analysis");
    expect(workPhrase("Business Valuation")).toBe("business valuation");
    expect(workPhrase("Life Care Plan Costing")).toBe("life care plan costing");
  });
});

describe("withArticle", () => {
  it("chooses a/an by the first letter", () => {
    expect(withArticle("lost earnings")).toBe("a lost earnings");
    expect(withArticle("employment damages")).toBe("an employment damages");
    expect(withArticle("Employment Damages")).toBe("an Employment Damages");
  });
});

describe("capFirst", () => {
  it("capitalizes only the first character", () => {
    expect(capFirst("wrongful death analysis")).toBe("Wrongful death analysis");
    expect(capFirst("")).toBe("");
  });
});

describe("every pillar short name", () => {
  for (const s of pillarServices()) {
    it(`${s.slug}: reads as prose with no ampersand, capital, doubled word, or misplaced article`, () => {
      const name = proseName(s.shortName);
      expect(name).not.toContain("&");
      expect(name).toBe(name.toLowerCase());
      expect(workPhrase(s.shortName)).not.toMatch(/\b([a-z]+) \1\b/);
      expect(`${withArticle(name)} engagement`).not.toMatch(/\ba [aeiou]/);
    });
  }
});
