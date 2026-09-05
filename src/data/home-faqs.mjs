// Homepage FAQ copy shared by the React page (src/pages/Home.tsx) and the
// static shell (scripts/prerender.mjs) so the FAQPage JSON-LD and the visible
// <details> block carry exactly the copy the hydrated page renders. Plain ESM
// (like geo-prose.mjs) because prerender.mjs runs under node, not vite.

/** @returns {{ question: string; answer: string }[]} */
export function homepageFaqs(orgName, orgShort) {
  return [
    {
      question: "What does a forensic economist do?",
      answer:
        "A forensic economist measures economic losses for litigation: lost earnings and fringe benefits, lost household services, the support a decedent would have provided to survivors, the present value of future care costs, lost profits, and the value of a business interest. The analysis is built from the records in the case and published government data, and every assumption is stated so the calculation can be examined and reproduced by the other side.",
    },
    {
      question: `Does ${orgShort} work for plaintiff and defense?`,
      answer: `Yes. ${orgName} accepts retentions from plaintiff and defense counsel. The method does not change with the retaining party: the same data sources, the same discounting conventions, and the same documentation of every assumption, so either side can recompute the figure from the report. Whether an opinion is admitted is a matter-specific question the court decides under the standard that governs the forum; a fully stated method is what lets that question be examined on the record rather than argued in the abstract.`,
    },
    {
      question: "What records does the economist need?",
      answer:
        "Tax returns and W-2 or 1099 forms for several years before the event, pay and benefit records, the medical and functional evidence bearing on the ability to work, and, for a business claim, financial statements, tax returns, and the contracts at issue. We provide a records checklist at retention so counsel can collect what the analysis needs in one pass.",
    },
    {
      question: "How long does an economic damages report take?",
      answer:
        "Most reports are delivered within several weeks after the records are complete, depending on the number of loss components, whether a business must be valued, and whether the analysis must be run under alternative scenarios. Rebuttal reviews of an opposing report are usually faster. Expedited timelines are considered case by case.",
    },
    {
      question: "How much does an economic damages analysis cost?",
      answer:
        "Engagements are billed hourly for records review, analysis, report preparation, and testimony, against a retainer established at the outset. The fee depends on the number of loss components, the condition of the records, and whether deposition or trial testimony is required. We confirm scope and fee in writing before any work begins.",
    },
    {
      question: `Where does ${orgShort} provide services?`,
      answer: `${orgName} accepts engagements in all 50 states, the District of Columbia, and U.S. territories, with wage, cost of living, and labor market data specific to each state and metropolitan area. Offices are in Hackensack, New Jersey, and Richmond, Virginia.`,
    },
  ];
}
