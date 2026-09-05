import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import EconomicContextWidget from "./EconomicContextWidget";
import { economicContextCaption } from "@/data/geo-prose.mjs";
import { visibleText } from "@/test-utils/markup";

// The sidebar panel of the geo pages. On a service x state page it is
// captioned for the pillar's own work and, on the commercial and
// family-financial pillars, drops the workers' compensation forum (audit F09:
// the business valuation state pages captioned the panel "Earnings and
// household-services figures are measured against <state>-area wage data and
// the plaintiff's own records"). The hub pages pass no service and keep the
// shared personal-loss framing, forum included.

const FORUM = "Alabama Department of Labor, Workers' Compensation Division";
const EARNINGS_CAPTION =
  "Earnings and household-services figures are measured against Alabama-area wage data and the plaintiff's own records; the source behind each figure is documented in the report.";

function render(props: Parameters<typeof EconomicContextWidget>[0]): string {
  return visibleText(renderToStaticMarkup(<EconomicContextWidget {...props} />));
}

describe("EconomicContextWidget", () => {
  it("keeps the shared earnings caption and the compensation forum on the hub pages (no service)", () => {
    const text = render({ areaName: "Alabama", population: 5024279, compensationForum: FORUM });
    expect(text).toContain("Alabama Economic Context");
    expect(text).toContain("Population");
    expect(text).toContain("5,024,279");
    expect(text).toContain("Workers' compensation forum");
    expect(text).toContain(FORUM);
    expect(text).toContain(EARNINGS_CAPTION);
  });

  it("keeps the earnings caption and the forum on a personal-loss pillar's state page", () => {
    const text = render({ areaName: "Alabama", population: 5024279, compensationForum: FORUM, serviceShortName: "Lost Earnings" });
    expect(text).toContain(FORUM);
    expect(text).toContain(EARNINGS_CAPTION);
  });

  for (const shortName of ["Business Valuation", "Lost Profits", "Fraud & Tracing", "Divorce Financial Analysis"]) {
    it(`captions the panel for the pillar's own work and drops the wage-loss forum on ${shortName}`, () => {
      const text = render({ areaName: "Alabama", population: 5024279, compensationForum: FORUM, serviceShortName: shortName });
      expect(text).toContain("Alabama Economic Context");
      expect(text).toContain("5,024,279");
      expect(text).not.toContain("Workers' compensation forum");
      expect(text).not.toContain(FORUM);
      expect(text).not.toMatch(/earnings and household|household-services|plaintiff's own/i);
      expect(text).toContain(economicContextCaption(shortName, "Alabama"));
    });
  }

  it("names the valuation inputs on the business valuation state page (the audit's example)", () => {
    const text = render({ areaName: "Alabama", population: 5024279, compensationForum: FORUM, serviceShortName: "Business Valuation" });
    expect(text).toContain(
      "Valuation inputs come from the company's own records and its governing agreements. Alabama-area market data enters only through the normalization of the company's results and the market-approach comparables where local data exists; the source behind each input is documented in the report.",
    );
  });

  it("keeps the forum on the rebuttal pillar, whose review can reach a wage-loss report", () => {
    const text = render({ areaName: "Alabama", population: 5024279, compensationForum: FORUM, serviceShortName: "Rebuttal" });
    expect(text).toContain(FORUM);
    expect(text).toContain("The review checks the opposing report's inputs, whatever the loss stream, against the record and against the published data for Alabama,");
    expect(text).not.toContain(EARNINGS_CAPTION);
  });

  it("renders nothing when the forum is the only fact and the pillar does not show it", () => {
    expect(renderToStaticMarkup(<EconomicContextWidget areaName="Alabama" compensationForum={FORUM} serviceShortName="Business Valuation" />)).toBe("");
    // The same props on a hub page still render the panel.
    expect(render({ areaName: "Alabama", compensationForum: FORUM })).toContain(FORUM);
  });

  it("reads a city name attributively in the caption and keeps the employer note as context", () => {
    const text = render({
      areaName: "The Bronx",
      population: 1472654,
      msaName: "New York-Newark-Jersey City, NY-NJ-PA",
      employers: ["Montefiore Medical Center", "NYC Health + Hospitals"],
    });
    expect(text).toContain("Major employers");
    expect(text).toContain("Montefiore Medical Center");
    expect(text).toContain("Context for the earnings histories common to The Bronx; not a statement about any party.");
    expect(text).toContain("measured against Bronx-area wage data");
    expect(text).not.toContain("The Bronx-area");
  });
});
