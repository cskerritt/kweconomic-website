import type { Faq } from "./types";
import { refsToSources } from "./references";
import { ORG_PHONE_DISPLAY } from "@/lib/brand";

const PHONE_DISPLAY = ORG_PHONE_DISPLAY;

// Date the FAQ copy was last revised. Printed in the page byline and stamped
// on the FAQPage node as dateModified; the static shell prints the same value.
export const FAQ_DATE_MODIFIED = "2026-09-02";

// Single source of truth for the site FAQ. Imported by the FAQ page
// (src/pages/FAQ.tsx) and by the llms.txt generator (scripts/generate-llms.mjs),
// so the live page and the published AI-readable summary stay in sync.
//
// Question names are phrased the way an attorney asks them ("Can a forensic
// economist ..."), not brand-led; the answers may name the practice. Answers
// may carry inline-link markers (see src/lib/richtext.tsx for the marker
// format): FAQ.tsx renders them as internal links, and both scripts/generate-llms.mjs
// and src/lib/schema.ts strip them back to anchor text so no marker syntax leaks
// into the llms.txt summary or the FAQPage JSON-LD. Registry-backed per-answer
// sources (refsToSources) are surfaced as a consolidated References block on the page.
export const faqs: Faq[] = [
  {
    question: "What does a forensic economist do?",
    sources: refsToSources(["NAFE_ETHICS", "NAFE_JFE"]),
    answer:
      "A forensic economist measures economic losses for litigation: [[/services/lost-earnings-and-earning-capacity|lost earnings and fringe benefits]], the value of [[/services/household-services-valuation|household services]], the support a decedent would have provided to survivors, the present value of future care costs, [[/services/lost-profits-and-commercial-damages|lost profits]], and the value of a [[/services/business-valuation|business interest]]. The analysis is built from the records in the case and published government data, and every assumption is stated so the calculation can be examined and reproduced. The [[/guides/what-is-a-forensic-economist|what is a forensic economist]] guide describes the discipline.",
  },
  {
    question: "What types of matters does a forensic economist handle?",
    answer:
      "Economic damages analyses are prepared for [[/case-types/personal-injury|personal injury]], [[/case-types/wrongful-death|wrongful death]], [[/case-types/medical-malpractice|medical malpractice]], [[/case-types/motor-vehicle-accident|motor vehicle]], [[/case-types/traumatic-brain-injury|traumatic brain injury]], [[/case-types/spinal-cord-injury|spinal cord injury]], [[/case-types/workers-compensation|workers' compensation]], and [[/case-types/product-liability|product liability]] matters; [[/case-types/employment-discrimination|employment discrimination]] and [[/case-types/wrongful-termination|wrongful termination]] claims; and [[/case-types/commercial-contract-dispute|commercial contract]], [[/case-types/partnership-and-shareholder-dispute|shareholder and partnership]], [[/case-types/divorce-and-marital-dissolution|divorce]], and [[/case-types/fraud-and-embezzlement|fraud and embezzlement]] matters. Engagements are accepted from plaintiff and defense counsel and from carriers.",
  },
  {
    question: "What records does the economist need?",
    answer:
      "For a personal claim: tax returns and W-2 or 1099 forms for several years before the event, pay stubs and employer records, benefit statements, the medical and functional evidence bearing on the ability to work, and the household's account of the services the person performed. A records checklist is provided at retention, and the [[/guides/when-do-you-need-an-economic-expert|when to retain]] guide lists what to send first.",
  },
  {
    question: "How are lost earnings calculated?",
    sources: refsToSources(["SKOOG_CIECKA_KRUEGER_2011", "BLS_ECI", "BLS_ECEC"]),
    answer:
      "The economist projects two streams: the earnings and benefits the person would have received but for the event, and the earnings and benefits the person can now expect. The but-for stream starts from the documented earnings base, grows at a stated rate from published wage series over a [[/methods/worklife-expectancy|worklife expectancy]] drawn from published tables, and includes [[/methods/fringe-benefits-valuation|fringe benefits]]. The post-event stream is built the same way from pay records or from the capacity evidence. The difference, year by year, is the loss, and the future portion is reduced to present value. The [[/guides/how-lost-earnings-are-calculated|lost earnings guide]] walks through each input.",
  },
  {
    question: "How is the economic loss in a wrongful death case measured?",
    sources: refsToSources(["BLS_CEX", "BLS_ATUS", "NCHS_LIFE_TABLES"]),
    answer:
      "As what the decedent would have contributed to the survivors: projected earnings and benefits over a worklife, less the share the decedent would have consumed personally, plus the replacement value of the household services the decedent performed and, where the governing framework allows, other forms of support, each measured over the relevant survivor's period of dependency and reduced to present value. The personal consumption deduction comes from published household expenditure data and is stated with its percentage. The [[/guides/wrongful-death-damages-explained|wrongful death damages guide]] explains the components, and the [[/services/wrongful-death-economic-loss|wrongful death service]] page describes the engagement.",
  },
  {
    question: "What are household services, and how are they valued?",
    sources: refsToSources(["BLS_ATUS", "BLS_OES"]),
    answer:
      "Household services are the unpaid work a person performs for the household: cooking, cleaning, shopping, home and yard maintenance, household management, transportation, and care of family members. When an injury or death removes that work, the loss is measured as the hours no longer performed, from the household's account and published time-use data, valued at the cost of replacing them with paid labor in the local market from published occupational wage data. The [[/methods/household-services-methodology|household services method]] page describes the data, and the [[/guides/household-services-in-personal-injury|household services guide]] describes the records that support the claim.",
  },
  {
    question: "What is present value, and why does the discount rate matter?",
    sources: refsToSources(["JONES_LAUGHLIN_PFEIFER", "TREASURY_YIELD"]),
    answer:
      "An award is paid once, in present dollars, while the losses it replaces would have been received over many years. Present value is the single sum that, invested today at a stated rate, would fund those future losses as they come due. The discount rate is the return the award is assumed to earn, tied to yields on low-risk instruments; a lower rate produces a larger present value and a higher rate a smaller one, and the rate's relationship to the growth rate applied to the loss stream drives the result over a long horizon. The [[/guides/present-value-explained-for-attorneys|present value guide]] explains the concepts and the [[/methods/present-value-and-discounting|present value method]] page the mechanics.",
  },
  {
    question: "Can a forensic economist value a life care plan?",
    sources: refsToSources(["BLS_CPI_MEDICAL", "CDC_LIFE_TABLES"]),
    answer:
      "Yes. A [[/services/life-care-plan-cost-projection|life care plan cost projection]] takes a plan prepared by a qualified clinician, carries each item forward with a growth rate appropriate to its care category, applies the plan's life expectancy, and discounts the stream to present value, reconciled item by item to the plan. The economist values the plan and does not author it; plan authorship stays with the clinician, and the report says so. The [[/compare/economist-vs-life-care-planner|comparison page]] describes the hand-off between the two experts.",
  },
  {
    question: "Do forensic economists handle business valuation, lost profits, and forensic accounting?",
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "ACFE"]),
    answer:
      "Yes. [[/services/business-valuation|Business valuation]] engagements value closely held interests under the standard of value the governing framework requires, following the professional valuation standards. [[/services/lost-profits-and-commercial-damages|Lost profits]] analyses measure what a business lost from a breach, an interruption, or a tort. [[/services/fraud-and-asset-tracing|Fraud investigation and asset tracing]] engagements reconstruct transactions and quantify diverted funds, and [[/services/divorce-and-marital-financial-analysis|divorce financial analyses]] determine income and value marital business interests. The [[/compare/forensic-economist-vs-forensic-accountant|forensic economist versus forensic accountant]] comparison explains where the disciplines meet.",
  },
  {
    question: "Can a forensic economist rebut an opposing economist's report?",
    sources: refsToSources(["FRE_702", "FRCP_26"]),
    answer:
      "Yes. An [[/services/expert-rebuttal-and-report-review|expert rebuttal and report review]] tests the opposing report input by input against the record: the earnings base, the growth rate, the worklife and life expectancy horizons, the fringe benefits and offsets, the consumption deduction in a death claim, the discount rate and its consistency with growth, and in a commercial report the but-for revenue, avoided costs, and causation. Where the record supports it, the review includes an alternative calculation, and the findings organize the deposition of the opposing economist. The [[/guides/how-to-rebut-an-economic-damages-report|rebuttal guide]] sets out the review in order.",
  },
  {
    question: "Is economic damages testimony admissible in state and federal court?",
    sources: refsToSources(["DAUBERT", "FRE_702", "FRYE"]),
    answer:
      "Yes, when the opinion rests on the records and published data, applies the established methods of the field, and states its assumptions so they can be tested. Reliability-based and general-acceptance frameworks alike rarely exclude the discipline; they exclude inputs the record does not support. Reports are prepared to meet the most demanding framework that could apply, and the [[/guides/federal-vs-state-court-daubert|admissibility guide]] describes the frameworks. Attorneys confirm the governing framework for the specific case.",
  },
  {
    question: "Do forensic economists work for both plaintiff and defense?",
    sources: refsToSources(["NAFE_ETHICS"]),
    answer:
      "Yes. Engagements are accepted from plaintiff counsel, defense counsel, and carriers, and the method does not change with the retaining party: the same data sources, the same discounting conventions, and the same disclosure of assumptions. The [[/compare/plaintiff-economist-vs-defense-economist|plaintiff versus defense economist]] comparison explains why that consistency is what makes an economist credible on either side.",
  },
  {
    question: "Can a forensic economist testify in any state?",
    answer:
      "Yes. Engagements are accepted for matters in [[/locations|all 50 states, the District of Columbia, and U.S. territories]], with wage, cost of living, and labor market data specific to each state and metropolitan area. The economists are familiar with the [[/guides/expert-witness-disclosure-rules|expert disclosure rules]] and admissibility frameworks applied in each jurisdiction, and the [[/jurisdictions|jurisdictions]] hub collects the state pages.",
  },
  {
    question: "How long does an economic damages report take?",
    answer:
      "Most reports are delivered within several weeks after the records are complete, depending on the number of loss components, whether a business must be valued, and whether the analysis must be run under alternative scenarios. A rebuttal review of an opposing report is usually faster because the framework and most inputs are already on the table. Shorter timelines are considered case by case; [[/contact|contact us]] to discuss a deadline. Each [[/services|service]] page states its typical timeline.",
  },
  {
    question: "How much does a forensic economist cost?",
    answer:
      "Fees are hourly, billed against a retainer set at the outset, for records review, the analysis, the report, and any deposition or trial testimony. What drives the total is the number of loss components (earnings, benefits, household services, a business interest), the state of the records, and whether testimony is required; a rebuttal review of an opposing report is usually the smaller engagement. Scope and fee are confirmed in writing before any work begins, and each [[/services|service]] page lists its fee drivers and billing structure.",
  },
  {
    question: "How do I retain a forensic economist?",
    answer:
      `Contact our office by phone at ${PHONE_DISPLAY} or through the [[/contact|contact form on this website]]. A member of our [[/schedule-consultation|intake team]] will follow up within one business day to discuss the case, the records needed, and [[/team|economist availability]]. We run a conflict check before any engagement begins and confirm scope and fee in writing.`,
  },
];
