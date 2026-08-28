import type { Source } from "./types";
import { refsToSources } from "./references";

export interface WhitePaperSection {
  heading: string;
  /** HTML body. Keep to <p>, <ul>/<li>, <strong>, <em>, inline <a>. No em dashes. */
  bodyHtml: string;
}

export interface WhitePaper {
  slug: string;
  title: string;
  subtitle: string;
  /** One of the core practice areas, used for the icon + cross-link. */
  discipline: "Vocational" | "Economic" | "Life Care";
  /** Lucide icon name for the hero motif. */
  icon: string;
  /** Service slug this paper cross-links to. */
  serviceSlug: string;
  /** Abstract shown above the gate (always visible for SEO). */
  summary: string;
  keyTakeaways: string[];
  readingTime: string;
  datePublished: string;
  dateModified: string;
  authorSlug?: string;
  /** First section is shown as a teaser; later sections sit behind the gate. */
  sections: WhitePaperSection[];
  /** Registry-backed references, rendered by SourcesBlock (see refsToSources). */
  sources?: Source[];
}

// White papers render inline through WhitePaperGate (abstract, takeaways, and
// the first section open; later sections behind the email gate). There is no
// downloadable asset; the page is the paper. Section bodies are HTML in
// double-quoted strings with escaped attribute quotes so the internal anchors
// are visible to src/citations.routes.test.mjs. Prose is citation-free.
export const whitePapers: WhitePaper[] = [
  {
    slug: "daubert-ready-economic-damages-report",
    title: "Building a Daubert-Ready Economic Damages Report",
    subtitle:
      "Foundation, inputs, discounting, and documentation for a damages opinion that withstands admissibility review on the merits.",
    discipline: "Economic",
    icon: "Scale",
    serviceSlug: "lost-earnings-and-earning-capacity",
    summary:
      "Admissibility frameworks ask whether an expert opinion rests on sufficient facts or data, applies reliable methods, and applies them reliably to the case. For economic damages testimony the discipline's methods are well established, so challenges target the inputs: an earnings base that departs from the records, a growth rate inconsistent with the discount rate, a horizon no table supports, offsets ignored, or a projection with no foundation. This paper sets out how a damages report is built so that each input is visible, sourced, and testable, and how the report, the work file, and the sensitivity analysis together answer the questions a gatekeeping court asks.",
    keyTakeaways: [
      "The frameworks rarely exclude the discipline; they exclude inputs the record does not support.",
      "Every input in a defensible report is stated, sourced to the records or a published series, and reproducible.",
      "Growth and discount assumptions must be drawn on a consistent basis and from comparable periods.",
      "A sensitivity analysis and an organized work file convert an admissibility fight into a dispute over weight.",
    ],
    readingTime: "12 min read",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    authorSlug: "christopher-skerritt",
    sections: [
      {
        heading: "What the frameworks ask of an economic opinion",
        bodyHtml:
          "<p>Federal courts and most state courts apply a reliability-based gatekeeping framework under which the trial judge decides whether an expert's method is reliable and reliably applied to the facts, considering factors such as testing, peer review and publication, error rate, controlling standards, and general acceptance. A minority of states apply a general-acceptance framework that asks only whether the method is accepted in the relevant community. The <a href=\"/guides/federal-vs-state-court-daubert\">federal versus state court</a> guide compares them.</p><p>For economic damages testimony the distinction matters less than it might seem. Projection from documented earnings with published wage growth, worklife expectancy from published tables, replacement cost valuation of household services, personal consumption deductions from expenditure data, and discounting at low-risk yields are established methods taught in the field's literature and applied by economists on both sides of the bar. Courts excluding economic opinions almost always cite the application: a conclusion connected to the data only by the expert's assertion, an input with no source, or an assumption the record contradicts. A Daubert-ready report is therefore a report in which every input can be traced.</p>",
      },
      {
        heading: "Foundation: the records and the assumptions adopted",
        bodyHtml:
          "<p>The report opens with what the economist considered and what the economist assumed. The records are listed: tax returns by year, W-2 and 1099 forms, pay and benefit records, employer statements, medical and vocational opinions, and, where relevant, the life care plan. The assumptions adopted from other witnesses are identified with their source: the physician's opinion on the horizon, the vocational opinion on post-event capacity, the plan's items and life expectancy. An economist who adopts another expert's finding says so; an economist who substitutes a personal judgment on a medical or vocational question has stepped outside the field, and the opinion is exposed at that point.</p><p>Gaps in the record are disclosed rather than papered over. A missing tax year, a capacity opinion not yet issued, or a plan under revision is noted, the assumption used in its place is stated, and the report commits to a supplemental schedule when the record is complete.</p>",
      },
      {
        heading: "The earnings base and the projection",
        bodyHtml:
          "<p>The earnings base is the person's documented compensation over several years, with the components carried forward identified and any unusual year addressed. A self-employed claimant's labor income is separated from the return on the business. The base is projected with a growth rate from a named published series, or an age-earnings profile where the person was early in a career, over a <a href=\"/methods/worklife-expectancy\">worklife expectancy</a> from a named table and edition for the person's age, sex, education, and labor force status. The <a href=\"/methods/wage-growth-and-earnings-projection\">earnings projection</a> page describes the choices.</p><p>A projection that assumes a promotion, a career change, or a business trajectory the record does not document is the most common foundation problem in affirmative reports. Where the record supports a contested element, the report shows the result with and without it, so that the trier of fact rather than the gatekeeper decides.</p>",
      },
      {
        heading: "Horizons: worklife and life expectancy",
        bodyHtml:
          "<p>Earnings run over worklife expectancy; household services and care costs run over life expectancy from the current published life tables; support to a child runs over the child's dependency. Each horizon is stated with its source, and any departure from the published figure rests on evidence in the record, such as a medical opinion on reduced life expectancy or a mandatory retirement age in the occupation, and is explained. A fixed retirement age substituted for a worklife table without a basis, or a life expectancy the medical evidence contradicts, is an input a gatekeeper can see.</p>",
      },
      {
        heading: "Benefits, offsets, and consumption",
        bodyHtml:
          "<p><a href=\"/methods/fringe-benefits-valuation\">Fringe benefits</a> are valued from plan documents where they exist and from published employer cost data where they do not, with the source stated and double counting avoided. Post-event earnings are projected on the same basis as but-for earnings from pay records or from the capacity evidence, and mitigation is addressed. In a death claim the personal consumption deduction is applied from household expenditure data for the household's size and income with the percentage stated. Collateral payments are cataloged on their own schedule so counsel can apply the venue's rule. The <a href=\"/methods/mitigation-and-offsets\">mitigation and offsets</a> page describes each deduction; an offset omitted without explanation is a recurring ground for challenge.</p>",
      },
      {
        heading: "Discounting and consistency",
        bodyHtml:
          "<p>Future losses are reduced to present value at a rate tied to yields on low-risk instruments with maturities matched to the horizon, with the instruments, the period, and the source stated. The growth and discount rates are drawn on a consistent basis, both nominal or both real, and from comparable periods, because the spread between them drives the result over a long horizon and an inconsistent pair is the most common discounting challenge. Where the venue directs a convention, such as a total offset approach or a rate fixed by the court, the report follows it and says so. The <a href=\"/methods/present-value-and-discounting\">present value method</a> page and the <a href=\"/compare/net-vs-gross-discount-rate\">net versus gross</a> comparison describe the mechanics and the presentations.</p>",
      },
      {
        heading: "Sensitivity, reproducibility, and the work file",
        bodyHtml:
          "<p>A defensible report shows how the result changes under the alternatives most likely to be contested: the growth rate, the discount rate, the horizon, the post-event earnings, and the consumption percentage. Presenting the sensitivity does not weaken the opinion; it demonstrates that the conclusion was tested and shows where it is stable and where it is not, which moves the dispute from admissibility to weight. Given the same records and the same published data, another economist should be able to reproduce every schedule, and the work file is organized so that the records considered, the series and tables used, and the calculations can be produced under the <a href=\"/guides/expert-witness-disclosure-rules\">disclosure rules</a>. Reproducibility, not the size of the number, is the measure of a sound calculation, and it is what allows the opinion to be examined on the merits. The <a href=\"/knowledge/expert-witness-testimony-guide\">expert witness testimony guide</a> describes how the report then carries through deposition and trial.</p>",
      },
    ],
    sources: refsToSources(["DAUBERT", "KUMHO_TIRE", "GE_JOINER", "FRE_702", "FRCP_26", "SKOOG_CIECKA_KRUEGER_2011", "TREASURY_YIELD", "NAFE_ETHICS"]),
  },
  {
    slug: "business-valuation-standards-in-litigation",
    title: "Business Valuation Standards in Litigation",
    subtitle:
      "How the professional valuation standards structure a contested valuation, from the engagement definition to the report, and how they answer cross-examination.",
    discipline: "Economic",
    icon: "Building2",
    serviceSlug: "business-valuation",
    summary:
      "A business valuation prepared for litigation is tested against two things: the governing legal framework, which sets the standard of value, the valuation date, and the treatment of discounts, and the professional valuation standards, which prescribe how the engagement is defined, how the approaches are applied, and what the report must contain. This paper describes how those standards structure a contested valuation of a closely held interest, where opposing valuators most often diverge, and how a report built to the standards answers the questions asked on cross-examination.",
    keyTakeaways: [
      "The standard of value is a legal decision and the first decision of the engagement; applying the wrong one is the most common reason a valuation is rejected.",
      "Normalization adjustments and the discount rate are where opposing valuators diverge, and each must be documented to its source.",
      "The income, market, and asset approaches are applied as the company warrants, and the report explains why any was not used.",
      "Discounts for lack of control and marketability must be tied to the interest actually valued and the standard that governs it.",
    ],
    readingTime: "11 min read",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    authorSlug: "christopher-skerritt",
    sections: [
      {
        heading: "Why standards matter in a contested valuation",
        bodyHtml:
          "<p>Two valuators can reach different conclusions from the same financial statements, and in litigation they usually do. The professional standards published by the accounting and valuation bodies exist to make those differences visible and testable: they require the valuator to define the engagement, to consider each recognized approach, to document the information relied on and the adjustments made, and to report the assumptions and limiting conditions. A <a href=\"/services/business-valuation\">valuation</a> that follows the standards can be examined on its choices; one that does not leaves the court to guess at what was done, which is the situation a gatekeeping framework is designed to prevent.</p><p>The standards are not the law. The governing framework decides the standard of value, the valuation date, and whether discounts apply, and the valuator applies those decisions. The standards govern how the valuation is then performed and reported.</p>",
      },
      {
        heading: "Defining the engagement",
        bodyHtml:
          "<p>The engagement definition states the interest being valued, the valuation date, the standard of value, and the premise of value. The interest matters because a controlling stake and a minority stake in the same company are not worth proportionate amounts. The date matters because value is measured with what was known or knowable then. The standard matters because fair market value, fair value as a statute defines it, and investment value can diverge materially for the same interest, as the <a href=\"/compare/fair-market-value-vs-fair-value\">fair market value versus fair value</a> comparison explains. The premise, going concern or liquidation, matters because it determines whether the company's earning power or its assets drive the conclusion. Each is stated at the outset, and where the framework leaves one unsettled the report presents the result under each alternative.</p>",
      },
      {
        heading: "Normalizing the financial statements",
        bodyHtml:
          "<p>The standards require the valuator to analyze the company's historical financial information and to adjust it to reflect sustainable earning power. Non-recurring gains and losses are removed. Owner compensation is restated to what an outside manager would be paid. Personal expenses run through the business are added back. Related-party rents, loans, and sales are adjusted to market terms. Non-operating assets are identified and valued separately. Each adjustment is listed with its basis in the general ledger, the tax returns, or market data, because the normalized earnings feed the income approach and the adjustments are where opposing valuators most often differ. The <a href=\"/guides/income-determination-in-divorce\">income determination guide</a> covers the owner compensation question in the divorce setting, where it also drives support.</p>",
      },
      {
        heading: "The three approaches and reconciliation",
        bodyHtml:
          "<p>The standards require consideration of the income, market, and asset approaches and an explanation of which were applied. The income approach converts expected cash flows into value by discounting a projection or capitalizing normalized earnings, with a rate built from the company's risk profile and disclosed component by component. The market approach draws on prices paid for guideline companies or transactions, adjusted for size, growth, profitability, and risk, with the comparables identified. The asset approach values the assets net of liabilities and serves as a floor or as the primary approach for asset-heavy and liquidating companies. The indications are reconciled with stated weights and stated reasons. The <a href=\"/methods/business-valuation-approaches\">business valuation approaches</a> page describes each in more detail.</p>",
      },
      {
        heading: "Discounts and premiums",
        bodyHtml:
          "<p>Whether a discount for lack of control or lack of marketability applies depends first on the standard of value and the interest, and only then on the evidence of magnitude. Under fair market value a minority interest in a closely held company is ordinarily discounted; under many statutory fair value frameworks it is not. Where a discount applies, its size is tied to the specific company: the rights the interest carries, the transfer restrictions in the governing documents, the dividend history, and the likelihood and timing of a sale, with published studies used as context rather than as a formula. A discount applied by rote is the most frequent cross-examination target in a valuation, and the report explains both the decision to apply it and the magnitude.</p>",
      },
      {
        heading: "Report content the standards require",
        bodyHtml:
          "<p>The standards prescribe the content of a valuation report: the engagement definition, the sources of information, the analysis of the company and its industry and economic environment, the normalization adjustments, the approaches considered and applied with the reasons, the reconciliation, the discounts and premiums considered, the conclusion, and the assumptions and limiting conditions. In litigation the report also serves as the expert disclosure, so it must contain every opinion the valuator will offer and the basis for each, as the <a href=\"/guides/expert-witness-disclosure-rules\">disclosure guide</a> describes. A report organized to the standards is a report organized to the questions the other side will ask.</p>",
      },
      {
        heading: "Cross-examination themes and how the standards answer them",
        bodyHtml:
          "<p>The recurring themes are predictable. Did you apply the standard of value the framework requires? The engagement definition answers. Why did you add back that expense, or restate that salary? The normalization schedule and its sources answer. Why did you not use the market approach? The approaches section answers. Where did each component of your discount rate come from? The rate build-up answers. Why did you apply a discount, and why that size? The discounts section answers. What did you assume, and what did you not verify? The assumptions and limiting conditions answer. A valuation built to the standards has an answer in the report for each question, which is what allows it to be tested on the merits rather than excluded at the threshold. The <a href=\"/guides/business-valuation-in-litigation\">business valuation in litigation</a> guide walks through the same decisions from counsel's side, and the <a href=\"/guides/lost-profits-vs-lost-business-value\">lost profits versus lost business value</a> guide addresses when a valuation is the right measure at all.</p>",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "FRE_702", "DAUBERT", "TREASURY_YIELD"]),
  },
];

export function getWhitePaperBySlug(slug: string): WhitePaper | undefined {
  return whitePapers.find((w) => w.slug === slug);
}

export function getAllWhitePaperSlugs(): string[] {
  return whitePapers.map((w) => w.slug);
}
