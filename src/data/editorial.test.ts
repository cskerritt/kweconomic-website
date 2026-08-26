import { describe, expect, it } from "vitest";
import { guides } from "./guides";
import { comparisons } from "./comparisons";
import { methods } from "./methods";
import { whitePapers } from "./whitePapers";

const slugs = (xs: { slug: string }[]) => xs.map((x) => x.slug).sort();
describe("LCP editorial set", () => {
  it("guides", () => expect(slugs(guides)).toEqual(["attendant-care-in-life-care-plans","collateral-source-rule-explained","expert-witness-disclosure-rules","federal-vs-state-court-daubert","future-medical-costs-in-personal-injury","home-modification-and-equipment-costing","how-a-life-care-plan-is-priced","how-to-rebut-a-life-care-plan","life-care-plan-vs-medicare-set-aside","pediatric-life-care-plans-and-transition-to-adulthood","standard-of-care-analysis","what-is-life-care-plan","when-do-you-need-expert-witness"]));
  it("comparisons", () => expect(slugs(comparisons)).toEqual(["clcp-vs-case-manager","clcp-vs-cnlcp","fce-vs-ime","in-person-evaluation-vs-file-review","life-care-plan-vs-future-cost-projection","life-care-plan-vs-medical-chronology","life-care-plan-vs-msa","plaintiff-expert-vs-defense-expert"]));
  it("methods", () => expect(slugs(methods)).toEqual(["cost-research-methodology","functional-capacity-evaluation","life-care-plan-development","life-expectancy-in-life-care-planning","msa-allocation-methodology","present-value-analysis"]));
  it("white papers are LCP only", () => expect(whitePapers.every((w) => w.discipline === "Life Care")).toBe(true));
  it("no vocational vocabulary survives in editorial copy", () => {
    const text = JSON.stringify([guides, comparisons, methods]);
    expect(text).not.toMatch(/transferable skills analysis|labor market survey|earning capacity|RAPEL|O\*NET|Dictionary of Occupational Titles/i);
  });
});
