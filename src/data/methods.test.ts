import { describe, expect, it } from "vitest";
import { methods, getMethod } from "./methods";

// The present value method and the lost profits method must agree on the
// discount rate: personal-loss streams (earnings, household services, care
// costs, lost support) are discounted at low-risk yields, while a commercial
// lost-profits stream is discounted at a rate that reflects the risk of the
// projected profits. The site audit (2026-09-05) found the present value page
// prescribing the low-risk convention for every stream, including lost
// profits, while the lost profits service and method said the opposite.
describe("present value method: stream-specific discount rate", () => {
  const pv = getMethod("present-value-and-discounting")!;
  const lostProfits = getMethod("lost-profits-but-for-analysis")!;
  const pvText = [pv.summary, pv.whenUsed, ...pv.steps, ...pv.dataSources, pv.limitations, ...pv.faqs.map((f) => f.answer)].join(" ");

  it("states the low-risk-yield convention for personal-loss streams only", () => {
    const personal = pv.steps.find((s) => /personal-loss stream/.test(s));
    expect(personal).toBeDefined();
    expect(personal).toMatch(/low-risk instruments/);
    expect(personal).toMatch(/earnings/);
    expect(personal).toMatch(/household services/);
    expect(personal).toMatch(/care costs/);
    // No step prescribes the low-risk yield without naming the stream it applies to.
    for (const s of pv.steps.filter((x) => /low-risk/.test(x))) expect(s).toMatch(/personal-loss|base rate/);
  });

  it("discounts a commercial lost-profits stream at a rate that reflects its risk, with build-up or cost-of-capital reasoning", () => {
    const commercial = pv.steps.find((s) => /lost-profits stream/.test(s));
    expect(commercial).toBeDefined();
    expect(commercial).toMatch(/risk of the projected profits/);
    expect(commercial).toMatch(/weighted average cost of capital/);
    expect(commercial).toMatch(/premia/);
    expect(pv.dataSources.some((d) => /cost-of-capital/.test(d))).toBe(true);
  });

  it("keeps the nominal/real consistency step and the sensitivity guidance", () => {
    expect(pv.steps.some((s) => /both nominal or both real/.test(s))).toBe(true);
    expect(pv.steps.some((s) => /sensitivity table/.test(s))).toBe(true);
  });

  it("no longer says the rate never changes with the type of loss, and names the lost-profits exception", () => {
    expect(pvText).not.toMatch(/does not change with the type of loss/);
    const faq = pv.faqs.find((f) => /lost earnings and for future medical costs/.test(f.question))!;
    expect(faq).toBeDefined();
    expect(faq.answer).toMatch(/personal-loss claim/);
    expect(faq.answer).toMatch(/lost-profits stream is the exception/);
    expect(pv.limitations).toMatch(/rate convention also has to match the stream/);
  });

  it("agrees with the lost profits method on the commercial convention", () => {
    expect(lostProfits.steps.some((s) => /risk of the projected profits/.test(s))).toBe(true);
    expect(pv.relevantServices).toContain("lost-profits-and-commercial-damages");
    expect(pv.whenUsed).toMatch(/lost profits/);
  });

  it("carries a revision date at or after the reconciliation and a SERP-length meta description", () => {
    expect(pv.dateModified >= "2026-09-05").toBe(true);
    expect(pv.metaDescription.length).toBeGreaterThanOrEqual(110);
    expect(pv.metaDescription.length).toBeLessThanOrEqual(160);
    expect(pv.metaDescription).toMatch(/low-risk/);
    expect(pv.metaDescription).toMatch(/risk/);
  });

  it("stays in the house style: hyphens only, no link markers in FAQ answers", () => {
    for (const m of methods) {
      const text = JSON.stringify(m);
      expect(text, m.slug).not.toMatch(/[–—§]/);
      for (const f of m.faqs) expect(f.answer, `${m.slug} faq`).not.toMatch(/\[\[/);
    }
  });
});
