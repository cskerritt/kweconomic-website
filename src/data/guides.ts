import type { Faq, Source } from "./types";
import type { RelatedItem } from "@/components/RelatedContent";
import { refsToSources } from "./references";

export interface GuideSection {
  id: string;
  heading: string;
  bodyHtml: string;
}

export interface Guide {
  slug: string;
  title: string;
  /** Shorter <title> form (target: under 60 chars with the brand suffix). The H1, cards, and nav keep `title`. */
  metaTitle?: string;
  /** Written meta description (110-160 chars, a complete sentence); never an auto-cut of `tldr`. */
  metaDescription: string;
  tldr: string;
  authorSlug: string;
  datePublished: string;
  dateModified: string;
  image?: string;
  sections?: GuideSection[];
  faqs?: Faq[];
  sources?: Source[];
  related?: RelatedItem[];
}

// Attorney guides written from the economist's standpoint. Each entry keeps
// `slug` then `title` on consecutive lines (scripts/prerender.mjs extracts the
// pair positionally); the meta fields, the byline, and the dates follow.
// Section bodies are HTML in double-quoted strings with escaped attribute
// quotes, so the internal anchors are visible to src/citations.routes.test.mjs.
// Prose is citation-free (case names such as Daubert and Frye are proper
// nouns, not citations); sources render through the registry. FAQ answers
// render as plain text and must not restate a sibling method FAQ
// (src/data/editorial.test.ts caps the token overlap).
export const guides: Guide[] = [
  {
    slug: "what-is-a-forensic-economist",
    title: "What Is a Forensic Economist?",
    metaDescription: "A forensic economist measures litigation losses in dollars: lost earnings, household services, survivor support, future care, lost profits, and business value.",
    tldr:
      "A forensic economist measures economic losses for litigation: lost earnings and benefits, household services, support to survivors, the present value of future care, lost profits, and business value. The work is built from the records in the case and published government data, follows the methods published in the field's literature, and is presented so that every input can be traced and tested by the other side.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    sections: [
      {
        id: "what-the-discipline-covers",
        heading: "What the discipline covers",
        bodyHtml:
          "<p>Forensic economics is the application of economic analysis to questions in litigation, almost always the question of what a loss is worth. The economist is retained to quantify economic damages: the money a person, a family, or a business did not receive and will not receive because of an injury, a death, a termination, a breach, or a fraud. The losses are measured in dollars over time and reduced to a single present value that a court can award.</p><p>The engagements fall into a few families. <a href=\"/services/lost-earnings-and-earning-capacity\">Lost earnings and earning capacity</a> compare what a person would have earned with what the person can now earn. <a href=\"/services/wrongful-death-economic-loss\">Wrongful death economic loss</a> measures the support and services a decedent would have provided to survivors. <a href=\"/services/household-services-valuation\">Household services valuation</a> puts a replacement cost on unpaid work at home. Life care plan cost projection reduces a clinician's plan for future care to present value. On the commercial side, <a href=\"/services/lost-profits-and-commercial-damages\">lost profits</a> measure what a business lost from an interruption, and <a href=\"/services/business-valuation\">business valuation</a> measures what an interest was worth on a given date.</p>",
      },
      {
        id: "how-the-work-is-done",
        heading: "How the work is done",
        bodyHtml:
          "<p>Every damages calculation has the same shape. The economist projects what would have happened but for the event, projects what will happen given the event, takes the difference year by year, and reduces the future portion to present value. What differs between engagements is which streams are in the comparison and what evidence supports each input.</p><p>The inputs come from two places. The records in the case, tax returns, pay and benefit records, medical and vocational opinions, financial statements, and contracts, establish the facts specific to the person or the business. Published government data supply what the records cannot: wage growth, labor force participation, hours spent on household work, the share of income a household spends on each member, and the yields at which an award can be invested. The <a href=\"/methods/wage-growth-and-earnings-projection\">earnings projection</a> and <a href=\"/methods/present-value-and-discounting\">present value</a> method pages show how those pieces are assembled, and the <a href=\"/knowledge/guide-to-economic-damages\">guide to economic damages</a> walks through the whole calculation.</p>",
      },
      {
        id: "training-and-professional-standards",
        heading: "Training and professional standards",
        bodyHtml:
          "<p>Forensic economists typically hold graduate training in economics, finance, or a closely related field, and the discipline maintains its own literature and professional bodies. The National Association of Forensic Economics and the American Academy of Economic and Financial Experts publish peer-reviewed journals in which the methods used in damages work are developed and tested, and each publishes an ethics statement that calls for the same method regardless of the retaining party, disclosure of assumptions and their sources, and opinions limited to the economist's field. Our economists follow those statements in every engagement. The <a href=\"/credentials/forensic-economist\">forensic economist</a> credential page describes the family of qualifications, and the <a href=\"/credentials/graduate-economics-degree\">graduate economics</a> page describes the training.</p>",
      },
      {
        id: "what-the-economist-does-not-do",
        heading: "What the economist does not do",
        bodyHtml:
          "<p>The economist does not opine on liability or on medical causation, does not decide what work a person can physically do, and does not author a life care plan. Those questions belong to other witnesses, and the economist adopts their findings as inputs and says so. The report is stronger for the discipline: a damages figure that rests on a medical opinion for the horizon and a vocational opinion for post-event capacity can be defended input by input, while a figure that rests on the economist's own guess about medicine or work cannot. The comparisons with the <a href=\"/compare/forensic-economist-vs-forensic-accountant\">forensic accountant</a>, the <a href=\"/compare/forensic-economist-vs-vocational-expert\">vocational discipline</a>, and the <a href=\"/compare/economist-vs-life-care-planner\">author of a life care plan</a> explain where each line is drawn.</p>",
      },
      {
        id: "when-to-retain",
        heading: "When to retain one",
        bodyHtml:
          "<p>Retain an economist whenever a claim includes a loss that runs over time: earnings, benefits, household services, support, future care, or profits. Early retention lets the economist identify the records the calculation will need and coordinate assumptions with the other experts before their reports are final. The <a href=\"/guides/when-do-you-need-an-economic-expert\">when to retain</a> guide lists the signals, and the <a href=\"/contact\">contact page</a> describes how an engagement begins.</p>",
      },
    ],
    faqs: [
      {
        question: "Is a forensic economist the same as an accountant?",
        answer:
          "No. The economist measures losses to people and households from records and published data; the forensic accountant works inside a company's books. The two disciplines meet on self-employed earnings, business owner death claims, and commercial damages, and some practitioners work in both.",
      },
      {
        question: "Does the economist need to examine the plaintiff?",
        answer:
          "No. The economist works from records and from the opinions of the medical and vocational witnesses. An interview with the person or the household is often useful for household services and for the earnings history, but it is not an examination.",
      },
      {
        question: "Does the economist work for plaintiffs or defendants?",
        answer:
          "Both. The method does not change with the retaining party. On the defense side the assignment is usually a review of the affirmative report and an alternative calculation.",
      },
    ],
    sources: refsToSources(["NAFE_ETHICS", "NAFE_JFE", "AAEFE_JLE", "FRE_702"]),
    related: [
      { title: "Guide to Economic Damages", href: "/knowledge/guide-to-economic-damages" },
      { title: "Forensic Economist vs. Forensic Accountant", href: "/compare/forensic-economist-vs-forensic-accountant" },
      { title: "Our Economists", href: "/team" },
    ],
  },
  {
    slug: "how-lost-earnings-are-calculated",
    title: "How Lost Earnings Are Calculated",
    metaDescription: "Lost earnings are the difference between but-for and post-event earnings streams, built from tax and pay records, grown over a worklife horizon, and discounted.",
    tldr:
      "Lost earnings are the difference between two projected streams: the earnings and benefits a person would have received but for the event, and the earnings and benefits the person can now expect. Each stream starts from documented records, grows at a stated rate over a published worklife horizon, includes fringe benefits, and the future difference is reduced to present value. This guide walks through the calculation input by input.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    sections: [
      {
        id: "the-two-streams",
        heading: "The two streams",
        bodyHtml:
          "<p>A <a href=\"/services/lost-earnings-and-earning-capacity\">lost earnings analysis</a> is a comparison. The but-for stream is what the person would have earned, year by year, had the event not occurred. The post-event stream is what the person has earned since and can expect to earn going forward. The loss in any year is the difference, and the total loss is the sum of those differences, with the portion after trial discounted to present value. Past loss, from the event to the trial date, is stated in the dollars of the years it occurred. Future loss, after the trial date, is projected and discounted.</p>",
      },
      {
        id: "the-earnings-base",
        heading: "The earnings base",
        bodyHtml:
          "<p>The but-for stream starts from the earnings base: the person's actual compensation before the event, drawn from tax returns, W-2 and 1099 forms, pay stubs, and employer records over several years. The economist separates base wages from overtime, bonuses, and commissions, decides which components the record supports carrying forward, and addresses any unusual year. A self-employed person's returns mix labor income with the return on the business, and the economist separates the two before projecting. Where the history is short or the career had not started, the base is built from occupational earnings data for the work the person was trained for, as the <a href=\"/compare/lost-earnings-vs-lost-earning-capacity\">lost earnings versus earning capacity</a> comparison explains.</p>",
      },
      {
        id: "growth-and-horizon",
        heading: "Growth and horizon",
        bodyHtml:
          "<p>The base is carried forward with a growth rate. General wage growth from published series is the usual choice; an age-earnings profile applies where the person was early in a career and would have seen earnings rise with experience; an occupation-specific path applies where the record documents it. The <a href=\"/methods/wage-growth-and-earnings-projection\">wage growth method</a> page describes the choice.</p><p>The stream runs over a <a href=\"/methods/worklife-expectancy\">worklife expectancy</a> drawn from published tables for the person's age, sex, education, and labor force status. Worklife is not a retirement age; it is an expected number of years of labor force activity that already reflects the probability of time out of the labor force. The report names the table and the edition, and explains any departure the record supports.</p>",
      },
      {
        id: "fringe-benefits",
        heading: "Fringe benefits",
        bodyHtml:
          "<p>Compensation is more than wages. Employer contributions to health insurance and retirement plans, legally required payroll contributions, and paid leave are valued from the person's own plan documents or, where those are unavailable, from published employer cost data by industry and occupation, and added to both streams. The <a href=\"/methods/fringe-benefits-valuation\">fringe benefits method</a> page explains the valuation and the double-counting errors to avoid.</p>",
      },
      {
        id: "post-event-earnings-and-offsets",
        heading: "Post-event earnings and offsets",
        bodyHtml:
          "<p>The post-event stream is built on the same basis. Where the person has returned to work, pay records fix the figure and the same growth rate carries it forward. Where the person has not, the report uses the earnings the medical and vocational evidence supports, and where that is contested, presents the loss under more than one scenario with the basis for each stated. Collateral payments such as disability benefits are shown separately so counsel can apply the venue's rule, and where the venue requires after-tax figures the report shows them. The <a href=\"/methods/mitigation-and-offsets\">mitigation and offsets</a> page describes each deduction.</p>",
      },
      {
        id: "present-value",
        heading: "Present value",
        bodyHtml:
          "<p>The future differences are discounted to the trial date at a rate tied to yields on low-risk instruments whose maturities match the horizon, with the growth and discount assumptions drawn on a consistent basis. The <a href=\"/methods/present-value-and-discounting\">present value method</a> page explains the mechanics and the <a href=\"/guides/present-value-explained-for-attorneys\">present value guide</a> explains the concepts. The report shows the undiscounted total, the present value, and a sensitivity table for the contested inputs.</p>",
      },
      {
        id: "the-structure-of-the-schedules",
        heading: "The structure of the schedules",
        bodyHtml:
          "<p>A well-organized report presents the calculation as a set of schedules: the earnings history and base; the but-for projection by year with growth applied; the fringe benefit schedule; the post-event projection by year; the year-by-year difference, split between past and future; the present value of the future difference; and the sensitivity analysis. Each schedule cites its inputs and each input cites its source, so that another economist could reproduce the result from the same records. Reproducibility is the measure of a sound calculation, and it is what allows the analysis to be examined on the merits rather than excluded as speculation.</p>",
      },
    ],
    faqs: [
      {
        question: "How far back does the earnings history go?",
        answer:
          "Usually three to five years before the event, and further where earnings were irregular or a career change is at issue. The report explains which years were used and why any year was excluded or adjusted.",
      },
      {
        question: "What if the person was planning a career change or promotion?",
        answer:
          "The projection reflects a change the record documents, such as a promotion already offered, a degree in progress, or a licensing exam passed, and shows the result with and without it where the evidence is contested. An undocumented expectation is not carried forward.",
      },
      {
        question: "Are lost earnings calculated before or after tax?",
        answer:
          "It depends on the venue. Some frameworks require after-tax figures, some prohibit tax evidence, and some leave it to the court. The report presents the figures the governing framework requires and, where that is unsettled, both.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_ECI", "BLS_ECEC", "SKOOG_CIECKA_KRUEGER_2011", "TREASURY_YIELD"]),
    related: [
      { title: "Lost Earnings and Earning Capacity Analysis", href: "/services/lost-earnings-and-earning-capacity" },
      { title: "Worklife Expectancy", href: "/methods/worklife-expectancy" },
      { title: "Present Value Explained for Attorneys", href: "/guides/present-value-explained-for-attorneys" },
    ],
  },
  {
    slug: "wrongful-death-damages-explained",
    title: "Wrongful Death Damages, Explained",
    metaDescription: "Wrongful death damages measure the support, services, and benefits a decedent would have provided to survivors, net of personal consumption, at present value.",
    tldr:
      "In a wrongful death matter the economic loss belongs to the survivors, and the question is what the decedent would have contributed to the household over an expected life. The analysis projects earnings and benefits, deducts the decedent's personal consumption, adds the replacement value of household services and other support, measures each survivor's loss over that survivor's period of dependency, and reduces the future portion to present value. The components are presented separately because states differ on which are recoverable and by whom.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    sections: [
      {
        id: "whose-loss-it-is",
        heading: "Whose loss it is",
        bodyHtml:
          "<p>A <a href=\"/services/wrongful-death-economic-loss\">wrongful death economic loss</a> analysis does not ask what the decedent would have earned in isolation. It asks what the decedent would have contributed to the people who depended on the decedent: financial support, household services, and, where the governing framework allows, guidance and care. Some frameworks give the claim to the survivors, some to the estate, and some divide it, with a survival claim for the decedent's own losses before death alongside a wrongful death claim for the survivors. The report is organized to the framework counsel identifies and presents each component separately so it can be included or excluded as the law requires.</p>",
      },
      {
        id: "earnings-and-benefits",
        heading: "Earnings and benefits",
        bodyHtml:
          "<p>The analysis starts as an earnings projection: the decedent's earnings base from tax returns and pay records, carried forward with a growth rate over a <a href=\"/methods/worklife-expectancy\">worklife expectancy</a> for the decedent's age, sex, education, and labor force status, plus <a href=\"/methods/fringe-benefits-valuation\">fringe benefits</a> from plan documents or published employer cost data. Where the decedent was young or a career was interrupted early, the base is built from occupational earnings data for the path the record supports. Retirement income the decedent would have received and shared, such as a pension or Social Security benefits, is projected past worklife where the framework allows.</p>",
      },
      {
        id: "personal-consumption",
        heading: "The personal consumption deduction",
        bodyHtml:
          "<p>A decedent would have spent part of that income on personal needs rather than on the household, and the survivors' loss excludes that share. The personal consumption deduction is derived from published household expenditure data adjusted to the household's size and income: smaller households spend a larger share on each member, and the percentage typically falls as household income rises. Because the deduction scales the whole earnings figure it is the assumption most likely to be contested, and the report states the percentage, its source, and the result under the alternatives. The <a href=\"/methods/mitigation-and-offsets\">mitigation and offsets</a> page describes the deduction alongside the others.</p>",
      },
      {
        id: "household-services-and-support",
        heading: "Household services and other support",
        bodyHtml:
          "<p>To the net earnings the economist adds the replacement value of the <a href=\"/services/household-services-valuation\">household services</a> the decedent performed: cooking, cleaning, home and yard maintenance, household management, transportation, and care of children or other family members, measured from the household's account and time-use data and valued at local replacement wage rates. This component stands on its own and does not depend on the decedent having earned wages; for a homemaker or a caregiver it is often the largest component. Where the framework allows, the value of guidance, counsel, and care to minor children is presented as a separate component with its basis stated.</p>",
      },
      {
        id: "dependency-and-horizons",
        heading: "Dependency periods and horizons",
        bodyHtml:
          "<p>Each survivor's loss runs over that survivor's period of dependency. A spouse's loss of support typically runs through the decedent's expected life or worklife; a child's through majority or the completion of education, as the record and the framework support. Household services run over the decedent's life expectancy from the current published life tables, because household work does not stop at retirement. The report presents the periods separately so counsel can address each and so the trier of fact can see how the total changes with the horizon.</p>",
      },
      {
        id: "present-value-and-presentation",
        heading: "Present value and presentation",
        bodyHtml:
          "<p>The future components are reduced to present value at a rate tied to low-risk yields, with growth and discount assumptions on a consistent basis, as the <a href=\"/methods/present-value-and-discounting\">present value method</a> page describes. The summary shows past and future loss by component and by survivor, and the sensitivity analysis shows the effect of the consumption percentage, the horizon, and the discount rate. Where the estate's claim and the survivors' claims are separate, the report presents the components applicable to each so the same figures support both without double counting.</p>",
      },
    ],
    faqs: [
      {
        question: "Is the personal consumption deduction always taken?",
        answer:
          "It is taken whenever the claim measures the survivors' loss of support, which is the usual case. Some frameworks measure a different loss, such as the decedent's own lost earnings in a survival claim, where the deduction may not apply. The report follows the framework counsel identifies.",
      },
      {
        question: "What if the decedent was retired or not working?",
        answer:
          "The earnings component may be small or zero, but household services, retirement income the decedent shared, and support to dependents remain. The analysis measures what the decedent actually contributed, whatever its form.",
      },
      {
        question: "How is a decedent's future promotion or business growth handled?",
        answer:
          "Only where the record supports it: a promotion already offered, a degree in progress, or a business whose financial statements show the trajectory. The report shows the result with and without the contested element.",
      },
    ],
    sources: refsToSources(["BLS_CEX", "BLS_ATUS", "NCHS_LIFE_TABLES", "SKOOG_CIECKA_KRUEGER_2011", "TREASURY_YIELD"]),
    related: [
      { title: "Wrongful Death Economic Loss", href: "/services/wrongful-death-economic-loss" },
      { title: "Wrongful Death Case Type", href: "/case-types/wrongful-death" },
      { title: "Household Services Methodology", href: "/methods/household-services-methodology" },
    ],
  },
  {
    slug: "household-services-in-personal-injury",
    title: "Household Services in Personal Injury Claims",
    metaDescription: "Household services damages are the hours an injured person can no longer perform at home, by task, priced at local replacement wages over life expectancy.",
    tldr:
      "Household services are the unpaid work an injured person can no longer perform at home. The loss is measured as the hours no longer performed, established from the household's account and time-use data, multiplied by the cost of replacing that work with paid labor in the local market, and projected over life expectancy as the household changes. This guide describes what counts, how hours and rates are established, and which records support the claim.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    sections: [
      {
        id: "what-counts",
        heading: "What counts as household services",
        bodyHtml:
          "<p>Household services are the tasks a person performs for the household without pay: meal preparation, cleaning, laundry, shopping, home and yard maintenance, household management and bill paying, driving family members, and care of children, elderly parents, or a disabled family member. When an injury reduces a person's capacity for those tasks, the household either does without, redistributes the work to other members, or pays someone. Each is a loss with economic value, and the <a href=\"/services/household-services-valuation\">household services valuation</a> measures it as the cost of replacement.</p>",
      },
      {
        id: "measuring-hours",
        heading: "Establishing the pre-injury hours",
        bodyHtml:
          "<p>The starting point is what the person actually did. The household's own account, by task and by week, is the primary evidence, and it is corroborated by published time-use survey data, which report the hours people of the same sex, age, employment status, and household composition spend on each category of household work. Where the household's account is far from the survey averages, the report explains why: a parent of young children, a person maintaining a large property, or a caregiver for a disabled relative will differ from the average, and the record should show it. The <a href=\"/methods/household-services-methodology\">household services method</a> page describes the data.</p>",
      },
      {
        id: "post-injury-capacity",
        heading: "Determining post-injury capacity by task",
        bodyHtml:
          "<p>Capacity is assessed task by task from the medical and functional evidence, not as a single percentage. A person with a back injury may still cook and manage the household but no longer do yard work, carry laundry, or lift a child. The lost hours are the difference between pre-injury hours and post-injury capacity in each category, and the report shows the categories separately so the trier of fact can see where the loss falls. Where the medical evidence expects capacity to change over time, the projection changes with it.</p>",
      },
      {
        id: "replacement-rates",
        heading: "Selecting replacement wage rates",
        bodyHtml:
          "<p>Each task category is valued at the wage of the occupation that would perform it in the market where the household lives: cooks, housekeepers and maids, childcare workers, grounds maintenance workers, and similar occupations, from published occupational wage data by metropolitan area. Replacement cost is the mainstream measure and the report says so; where the household has actually hired help, the invoices corroborate both the hours and the rate. The rates are carried forward with wage growth on the same basis as the rest of the analysis.</p>",
      },
      {
        id: "horizon-and-household-changes",
        heading: "The horizon and changes in the household",
        bodyHtml:
          "<p>Household services run over life expectancy from the current published life tables, not over worklife, because household work continues after retirement. The projection reflects the household's composition changing over time, children reaching adulthood and leaving, for example, and the decline in hours with age that the time-use data show. The future portion is reduced to present value with the rest of the loss, as the <a href=\"/methods/present-value-and-discounting\">present value method</a> describes.</p>",
      },
      {
        id: "records-to-collect",
        heading: "Records that support the claim",
        bodyHtml:
          "<p>The claim is easier to prove with a few documents collected early: a written account from the household of who did which tasks before and after the injury, with approximate weekly hours; medical and functional evidence addressing physical capacity for household tasks, not only for work; invoices or receipts for any paid help since the injury; and information about the household's composition and any changes expected. The <a href=\"/guides/how-lost-earnings-are-calculated\">lost earnings guide</a> describes the parallel records for the earnings claim, and the <a href=\"/case-types/personal-injury\">personal injury</a> case type page describes how the components fit together.</p>",
      },
    ],
    faqs: [
      {
        question: "Can a person who worked full time claim household services?",
        answer:
          "Yes. Employed people spend fewer hours on household work than people not in the labor force, and the time-use data reflect that, but the hours are rarely zero. The projection uses the hours for the person's actual employment status.",
      },
      {
        question: "Does the household have to hire someone to recover?",
        answer:
          "No. The loss is the value of the work no longer performed, measured at what it would cost to replace, whether or not the household has paid for replacement. Where help has been hired, the invoices strengthen the claim.",
      },
      {
        question: "Is household services a separate claim from lost earnings?",
        answer:
          "It is a separate component of economic damages, valued on its own evidence and presented on its own schedule. A person can have a household services loss with no earnings loss, and the reverse.",
      },
    ],
    sources: refsToSources(["BLS_ATUS", "BLS_OES", "NCHS_LIFE_TABLES"]),
    related: [
      { title: "Household Services Valuation", href: "/services/household-services-valuation" },
      { title: "Household Services Methodology", href: "/methods/household-services-methodology" },
      { title: "Personal Injury Economic Damages", href: "/services/personal-injury-economic-damages" },
    ],
  },
  {
    slug: "present-value-explained-for-attorneys",
    title: "Present Value, Explained for Attorneys",
    metaDescription: "Present value is the sum that, invested today at a stated rate, replaces future losses as they come due. How the discount and growth rates set the number.",
    tldr:
      "Present value is the single sum that, invested today at a stated rate, would replace a stream of future losses as they come due. The result depends on the loss stream, the growth rate applied to it, and the discount rate used to bring it back to the present. This guide explains each in plain terms, what a net rate and a gross rate are, what the total offset approach is, and how to read a present value schedule.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    sections: [
      {
        id: "why-present-value",
        heading: "Why present value is required",
        bodyHtml:
          "<p>An award is paid once, in present dollars. The losses it compensates would have been received over many future years. A dollar received in ten years is worth less than a dollar received today, because a dollar today can be invested and grow. Present value is the arithmetic that makes the two comparable: it asks what sum, invested now on safe terms, would fund the projected future losses as each comes due. Without the step, future losses would be overstated by ignoring the return on the award, or understated by ignoring growth in wages and costs. The <a href=\"/methods/present-value-and-discounting\">present value method</a> page describes the mechanics.</p>",
      },
      {
        id: "the-discount-rate",
        heading: "The discount rate",
        bodyHtml:
          "<p>The discount rate is the return the award is assumed to earn when invested. The mainstream basis is the yield on low-risk instruments, such as Treasury securities, with maturities matched to the horizon of the loss, because the award is meant to be invested safely rather than speculatively. A higher rate produces a smaller present value; a lower rate produces a larger one. The rate's source and the period from which it was drawn matter more than the rate itself, and a report should state both and show the result across a reasonable range.</p>",
      },
      {
        id: "the-growth-rate",
        heading: "The growth rate",
        bodyHtml:
          "<p>Before discounting, each loss stream is projected forward at a growth rate appropriate to it. Wages grow with general wage inflation and, early in a career, with experience; household replacement costs grow with wages in the occupations that perform the work; medical costs grow at their own rate. The <a href=\"/methods/wage-growth-and-earnings-projection\">wage growth method</a> page describes the series used. The growth and discount rates must be drawn on a consistent basis, both nominal or both real, and from comparable periods; a projection that grows losses at an optimistic rate and discounts them at an unrelated rate is inconsistent whichever way it cuts.</p>",
      },
      {
        id: "net-versus-gross",
        heading: "Net rate versus gross rate",
        bodyHtml:
          "<p>Some reports combine the two rates into a single net discount rate, the difference between growth and discount, applied to a loss stated in today's dollars. Others show the two steps separately, growing the stream into future dollars and then discounting at the full rate. The presentations are arithmetically equivalent when the assumptions are consistent, and the choice is about transparency and venue convention. The <a href=\"/compare/net-vs-gross-discount-rate\">net versus gross discount rate</a> comparison sets out when each is used.</p>",
      },
      {
        id: "total-offset-and-venue-rules",
        heading: "The total offset approach and venue rules",
        bodyHtml:
          "<p>Under the total offset approach the growth rate and the discount rate are assumed to cancel, so the present value equals the sum of future losses stated in today's dollars. Some jurisdictions direct that approach by case law; elsewhere it is one assumption among several and must be justified like any other. Other venues have their own conventions, such as a rate fixed by statute or by the court, or a requirement that past losses carry interest to the trial date. The economist follows the venue's rule, states it in the report, and where the rule is unsettled presents the result under each alternative. Counsel confirms the governing rule against primary sources.</p>",
      },
      {
        id: "reading-the-schedule",
        heading: "Reading a present value schedule",
        bodyHtml:
          "<p>A present value schedule shows, for each future year, the projected loss in that year's dollars, the discount factor applied, and the resulting present value, with the column totals giving the undiscounted and discounted sums. Read it with four questions: what growth rate produced the yearly figures and from what series; what discount rate and what instruments and period; are the two consistent; and what does the sensitivity table show at the ends of a reasonable range. The <a href=\"/guides/how-to-rebut-an-economic-damages-report\">rebuttal guide</a> applies those questions to an opposing report, and the <a href=\"/knowledge/guide-to-economic-damages\">guide to economic damages</a> places the schedule within the full calculation.</p>",
      },
    ],
    faqs: [
      {
        question: "Why do opposing economists reach different present values from the same loss?",
        answer:
          "Usually because of the spread between growth and discount, not the loss itself. A one-point difference in the net rate compounds over decades. The sensitivity table in each report shows how much of the gap the rate explains.",
      },
      {
        question: "Does present value apply to past losses?",
        answer:
          "No. Past losses are stated in the dollars of the years they occurred and, where the framework allows, carried forward with interest to the trial date. Only future losses are discounted.",
      },
      {
        question: "Is a structured settlement the same as present value?",
        answer:
          "A structured settlement is a way of paying an award over time. Present value is the lump sum equivalent of a future stream. The two are related, and an annuity quote for a structure is one check on a present value calculation, but the economist's figure does not depend on how the award is ultimately paid.",
      },
    ],
    sources: refsToSources(["JONES_LAUGHLIN_PFEIFER", "KACZKOWSKI_V_BOLUBASZ", "TREASURY_YIELD", "BLS_CPI"]),
    related: [
      { title: "Present Value and Discounting", href: "/methods/present-value-and-discounting" },
      { title: "Net vs. Gross Discount Rate", href: "/compare/net-vs-gross-discount-rate" },
      { title: "How Lost Earnings Are Calculated", href: "/guides/how-lost-earnings-are-calculated" },
    ],
  },
  {
    slug: "expert-witness-disclosure-rules",
    title: "Expert Witness Disclosure: A Practitioner Overview",
    metaTitle: "Expert Witness Disclosure Rules for Attorneys",
    metaDescription: "What an expert disclosure must contain, when it is due, the duty to supplement, and the items specific to an economic damages report that draw challenges.",
    tldr:
      "Pre-trial expert disclosure typically requires a written statement of the expert's identity, opinions, the bases for those opinions, the facts or data considered, qualifications, prior testimony, and compensation. Content and timing vary by jurisdiction, and a missed requirement is a common basis for excluding an economist. This guide outlines the elements, the timing, the duty to supplement, and the points specific to economic damages reports.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    sections: [
      {
        id: "what-is-disclosure",
        heading: "What pre-trial expert disclosure is",
        bodyHtml:
          "<p>Pre-trial expert disclosure is the formal statement to the opposing party of the expert's expected testimony before trial. Depending on the jurisdiction it takes the form of a written report signed by the expert, an interrogatory-style answer, or another format the governing framework sets. The purpose is to identify the expert, describe the opinions, and provide their bases in time for the other side to test them through deposition and, where warranted, a motion. For an economist the disclosure is the damages report itself, and the <a href=\"/knowledge/expert-witness-testimony-guide\">expert witness testimony guide</a> describes how the report, the deposition, and the trial presentation fit together.</p>",
      },
      {
        id: "common-content",
        heading: "Common content elements",
        bodyHtml:
          "<p>Most frameworks call for a complete statement of all opinions and the basis and reasons for them; the facts or data considered in forming them; any exhibits that summarize or support them; the witness's qualifications, including publications for a stated number of prior years; a list of cases in which the witness testified at trial or deposition for a stated number of prior years; and a statement of compensation. Federal trial-track engagements call for the full written report; many state frameworks accept a statement of the substance of the opinions instead, sometimes through interrogatories. The inventory varies, and counsel confirms it for the case.</p>",
      },
      {
        id: "timing",
        heading: "Timing",
        bodyHtml:
          "<p>Disclosure deadlines are set by the scheduling order or by the framework's default. The party with the burden usually discloses first, with rebuttal disclosures due a set period afterward. Counsel should pull the scheduling order at the outset, calendar the disclosure deadline and the close of expert discovery, and give the economist the records early enough that the report is complete by the deadline; a report that omits an opinion because a record arrived late invites a dispute over whether the opinion may be offered at all.</p>",
      },
      {
        id: "supplementation",
        heading: "Supplementation",
        bodyHtml:
          "<p>Most frameworks impose a continuing duty to supplement when the disclosing party learns that a prior disclosure is incomplete or incorrect. For an economic report the triggers are concrete: new pay records that change the post-event stream, an updated medical or vocational opinion that changes the horizon or capacity, a revised life care plan, or a change in the trial date that shifts the valuation date and the discount period. A supplemental schedule served promptly is far better than an amended opinion offered at deposition or trial.</p>",
      },
      {
        id: "economist-specific-points",
        heading: "Points specific to economic reports",
        bodyHtml:
          "<p>Three items deserve attention in an economist's disclosure. First, the facts or data considered include everything reviewed, not only what was relied upon, so the work file should be organized for production and the report should list the records. Second, the published data series, tables, and yield data used should be identified by source and edition, so the other side can check them; the <a href=\"/methods/present-value-and-discounting\">present value</a> and <a href=\"/methods/worklife-expectancy\">worklife</a> pages show the level of specificity expected. Third, where the economist adopted another expert's opinion, for example a vocational finding on post-event capacity or a life care plan, the report says so and identifies the source, because that opinion is part of the basis of the economist's own. The <a href=\"/guides/how-to-rebut-an-economic-damages-report\">rebuttal guide</a> shows how a missing element becomes a cross-examination theme.</p>",
      },
      {
        id: "verify",
        heading: "Verify the governing framework",
        bodyHtml:
          "<p>This page is a general overview and not legal advice. Disclosure rules vary by jurisdiction and change over time. Always confirm the governing framework, the court's scheduling order, and any local rule against primary sources for the specific case.</p>",
      },
    ],
    faqs: [
      {
        question: "Does every retained economist need to produce a written report?",
        answer:
          "It depends on the jurisdiction. Federal trial-track engagements typically require a comprehensive written report; many state frameworks accept a substance-of-opinions statement, sometimes through interrogatories. In practice the economist prepares a full report in either setting because the schedules are what make the opinion defensible.",
      },
      {
        question: "What counts as facts or data considered?",
        answer:
          "All materials the expert reviewed in forming the opinion, including those the expert chose not to rely on. Most jurisdictions read the category broadly.",
      },
      {
        question: "Can the economist change an opinion after disclosure?",
        answer:
          "New records or a changed assumption can support a supplemental report, served under the duty to supplement and within the deadlines. An undisclosed change offered for the first time at trial risks exclusion.",
      },
    ],
    sources: refsToSources(["FRCP_26"]),
    related: [
      { title: "Expert Witness Testimony Guide", href: "/knowledge/expert-witness-testimony-guide" },
      { title: "Daubert vs. Frye in Federal and State Court", href: "/guides/federal-vs-state-court-daubert" },
      { title: "How to Rebut an Economic Damages Report", href: "/guides/how-to-rebut-an-economic-damages-report" },
    ],
  },
  {
    slug: "federal-vs-state-court-daubert",
    title: "Daubert vs. Frye: Admissibility in Federal and State Court",
    metaTitle: "Daubert vs. Frye in Federal and State Court",
    metaDescription: "Daubert asks whether a method is reliable and reliably applied; Frye asks whether it is generally accepted. What each means for economic damages testimony.",
    tldr:
      "Federal courts apply the Daubert framework, a reliability-based gatekeeping test that considers testability, peer review, error rate, controlling standards, and general acceptance. State courts vary: many apply Daubert or a close variant, some retain the narrower Frye general-acceptance test, and several use hybrids. For economic testimony the frameworks rarely exclude the discipline; they exclude inputs the record does not support. Attorneys confirm the governing framework against primary sources.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    sections: [
      {
        id: "federal-framework",
        heading: "The federal framework: Daubert",
        bodyHtml:
          "<p>Federal courts apply the Daubert framework, a reliability-based gatekeeping test. The trial judge decides whether the expert's method is reliable and reliably applied to the facts of the case, considering non-exclusive factors such as whether the method has been tested, whether it has been published and peer reviewed, its known or potential rate of error, the existence and maintenance of controlling standards, and its general acceptance in the relevant field. The inquiry extends to technical and other specialized knowledge, including economics, and the court may exclude an opinion connected to the data only by the expert's assertion. The <a href=\"/knowledge/expert-witness-testimony-guide\">expert witness testimony guide</a> describes the framework in more detail.</p>",
      },
      {
        id: "state-frameworks",
        heading: "State frameworks: Daubert, Frye, and hybrids",
        bodyHtml:
          "<p>Many states apply a Daubert-style reliability framework. A smaller number retain the Frye general-acceptance test, which asks only whether the method is generally accepted in the relevant professional community and does not separately weigh testability or error rates. Several states apply hybrids, some codified in evidence rules, and the frameworks continue to evolve. The <a href=\"/insights/daubert-vs-frye-expert-testimony-standards\">Daubert versus Frye post</a> compares the two families, and the <a href=\"/jurisdictions\">jurisdictions</a> hub collects the state pages.</p>",
      },
      {
        id: "what-is-challenged-in-economic-testimony",
        heading: "What is challenged in economic testimony",
        bodyHtml:
          "<p>The core methods of forensic economics, projection from documented earnings with published wage growth, <a href=\"/methods/worklife-expectancy\">worklife tables</a>, replacement cost valuation of household services, personal consumption deductions from expenditure data, and <a href=\"/methods/present-value-and-discounting\">discounting at low-risk yields</a>, are established under either framework. Challenges therefore target application: an earnings base that departs from the tax returns, a growth rate inconsistent with the discount rate, a horizon no table supports, post-event earnings that ignore a documented return to work, a death claim without a consumption deduction, or a lost profits projection for a business with no history and no comparable. Each is a gap between the data and the conclusion, and each is avoidable.</p>",
      },
      {
        id: "preparing-the-report",
        heading: "Preparing a report for the most demanding framework",
        bodyHtml:
          "<p>An economist cannot always know at the time of the report which court will hear the case, so the practical rule is to prepare for the most demanding framework that could apply: state every input and its source, use published series and tables the other side can check, show the sensitivity of the result to the contested assumptions, stay within the economist's field, and document the work file. A report built that way is positioned to be examined on the merits under any framework, and the <a href=\"/white-papers/daubert-ready-economic-damages-report\">white paper on a defensible damages report</a> sets out the elements in order.</p>",
      },
      {
        id: "verify",
        heading: "Verify the governing framework",
        bodyHtml:
          "<p>Always confirm the governing admissibility framework for the specific case against primary sources before the report is finalized. The framework can vary by case type, by court within the same state, and over time as the law evolves, and the <a href=\"/guides/expert-witness-disclosure-rules\">disclosure guide</a> covers the procedural requirements that run alongside it.</p>",
      },
    ],
    faqs: [
      {
        question: "Do all federal courts apply the framework identically?",
        answer:
          "The framework is uniform, but application varies by circuit and by trial judge. Prior decisions in the same district and circuit on economic testimony are informative for preparation.",
      },
      {
        question: "Is an economist's discount rate a methodology question or a fact question?",
        answer:
          "Usually a question of weight for the trier of fact, provided the economist explains the basis. It becomes an admissibility question when the rate has no stated source or is inconsistent with the growth assumption.",
      },
    ],
    sources: refsToSources(["DAUBERT", "KUMHO_TIRE", "GE_JOINER", "FRYE", "FRE_702"]),
    related: [
      { title: "Expert Witness Testimony Guide", href: "/knowledge/expert-witness-testimony-guide" },
      { title: "Daubert vs. Frye for Economic Damages Testimony", href: "/insights/daubert-vs-frye-expert-testimony-standards" },
      { title: "Building a Daubert-Ready Economic Damages Report", href: "/white-papers/daubert-ready-economic-damages-report" },
    ],
  },
  {
    slug: "when-do-you-need-an-economic-expert",
    title: "When Do You Need an Economic Expert?",
    metaDescription: "An economic expert is warranted when a claim includes a loss that runs over time: earnings, benefits, household services, support, future care, or profits.",
    tldr:
      "An economic expert is warranted whenever a claim includes a loss that runs over time: earnings, benefits, household services, support to survivors, future care costs, lost profits, or the value of a business. Courts admit the testimony because the projection and discounting require specialized knowledge the trier of fact does not have. Retain early so the economist can identify the records and coordinate assumptions with the other experts.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    sections: [
      {
        id: "the-governing-rule",
        heading: "The governing rule",
        bodyHtml:
          "<p>The federal admissibility framework and its state counterparts permit expert testimony where specialized knowledge will help the trier of fact, the testimony rests on sufficient facts or data, it is the product of reliable principles and methods, and the expert has reliably applied them to the case. Projecting earnings over a worklife, valuing household work, deducting personal consumption, and reducing future streams to present value are that kind of specialized knowledge, and a jury asked to do them without an economist is asked to guess. The <a href=\"/knowledge/expert-witness-testimony-guide\">expert witness testimony guide</a> describes the frameworks.</p>",
      },
      {
        id: "signals",
        heading: "Signals that an economist is warranted",
        bodyHtml:
          "<p>Consider retention when the person has lost earnings that will continue past the trial date; when the person was self-employed, a student, a homemaker, or between jobs, so that the earnings history alone does not describe the loss; when a death claim requires support, consumption, and household services to be measured for each survivor; when a life care plan must be reduced to present value; when a termination claim involves back pay, front pay, and lost benefits; when a business claims lost profits or must be valued in a shareholder dispute or a divorce; and when the other side has served an economic report that needs a <a href=\"/services/expert-rebuttal-and-report-review\">review and rebuttal</a>. The <a href=\"/case-types\">case types</a> hub describes how the loss is built in each kind of matter.</p>",
      },
      {
        id: "which-experts-work-together",
        heading: "Which experts work together",
        bodyHtml:
          "<p>In an injury case several experts address distinct questions that together establish damages. The treating or evaluating physicians supply the medical foundation for capacity and, where relevant, for a reduced horizon. A vocational witness may supply the post-injury earning capacity where it is contested. A clinician may prepare a life care plan for future care. The economist takes those findings as inputs, adds the earnings and household records and the published data, and produces the present value of the whole. The comparisons with the <a href=\"/compare/forensic-economist-vs-vocational-expert\">vocational discipline</a> and with the <a href=\"/compare/economist-vs-life-care-planner\">author of a life care plan</a> describe the hand-offs, and the <a href=\"/compare/forensic-economist-vs-forensic-accountant\">forensic accountant comparison</a> covers the commercial side.</p>",
      },
      {
        id: "when-to-retain",
        heading: "When to retain",
        bodyHtml:
          "<p>Retain as early as practical. An economist retained early can list the records the calculation will need so they are requested once, identify the assumptions that will drive the result so the other experts address them, and inform discovery on the opposing damages theory. Late retention risks a report built on an incomplete record and a schedule that leaves no time for a supplemental analysis when new records arrive. Timing also affects the <a href=\"/guides/expert-witness-disclosure-rules\">disclosure</a> deadlines.</p>",
      },
      {
        id: "what-to-send-first",
        heading: "What to send first",
        bodyHtml:
          "<p>For a personal claim: several years of tax returns and W-2 or 1099 forms, pay stubs and employer records, benefit statements, the medical and vocational evidence bearing on work capacity, and the household's account of the services the person performed. For a death claim: the same for the decedent, plus the household's composition and the survivors' ages. For a business claim: financial statements and tax returns for several years before and after the event, the contracts at issue, and any forecasts prepared before the dispute. The <a href=\"/schedule-consultation\">consultation page</a> describes the intake, and the <a href=\"/services\">services</a> pages list the records for each engagement.</p>",
      },
    ],
    faqs: [
      {
        question: "Is an economist needed if the plaintiff has returned to work?",
        answer:
          "Often, yes. A return to work at a lower wage, with fewer benefits, or with a shortened worklife still produces a loss, and the economist measures it. The analysis is simpler when post-event earnings are documented, not unnecessary.",
      },
      {
        question: "How many experts does a typical injury case need?",
        answer:
          "It varies. A serious injury case commonly involves the treating physicians, a vocational witness where capacity is contested, a clinician for a life care plan where future care is at issue, and an economist to value the whole. A smaller case may need only the medical evidence and the economist.",
      },
      {
        question: "Can the economist be retained for consultation without testifying?",
        answer:
          "Yes. A consulting engagement to evaluate a claim, review an opposing report, or support mediation is common, and the disclosure rules for consulting experts differ from those for testifying experts. Counsel decides whether and when to designate.",
      },
    ],
    sources: refsToSources(["FRE_702", "DAUBERT"]),
    related: [
      { title: "What Is a Forensic Economist?", href: "/guides/what-is-a-forensic-economist" },
      { title: "Expert Witness Disclosure Rules", href: "/guides/expert-witness-disclosure-rules" },
      { title: "Schedule a Consultation", href: "/schedule-consultation" },
    ],
  },
  {
    slug: "collateral-source-rule-explained",
    title: "The Collateral Source Rule, Explained",
    metaDescription: "The collateral source rule decides whether insurance and benefit payments reduce an award. The economist lists each payment separately for counsel to apply it.",
    tldr:
      "The collateral source rule governs whether payments the plaintiff received from insurance, public benefits, or other third parties reduce the defendant's liability for damages. Some jurisdictions preserve the traditional rule, under which the defendant gets no credit; many have modified it by statute for specific categories of payment. The economist does not decide the rule; the report presents each collateral payment on its own schedule so counsel can apply the venue's rule.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    sections: [
      {
        id: "traditional-rule",
        heading: "The traditional rule",
        bodyHtml:
          "<p>Under the traditional rule, a wrongdoer does not benefit from payments the injured person received from sources independent of the wrongdoer, such as health insurance, disability insurance, or benefits the person earned through employment. Damages are measured without offsetting those payments, on the reasoning that the plaintiff, not the defendant, paid for the coverage and that any double recovery is better left with the injured person than with the party at fault. The rule also governs what the jury may hear about such payments.</p>",
      },
      {
        id: "modifications",
        heading: "Modifications and exceptions",
        bodyHtml:
          "<p>Many jurisdictions have modified the rule by statute, permitting or requiring offsets for specific categories: some for health insurance payments, some for public benefits, some for workers' compensation, and some only in particular kinds of cases such as medical malpractice. Some frameworks distinguish payments already received from payments expected in the future, and some allow the offset only net of the premiums the plaintiff paid. The specifics vary widely by state and by category, change over time, and are a legal question for counsel to resolve against primary sources.</p>",
      },
      {
        id: "what-the-economist-does",
        heading: "What the economist does",
        bodyHtml:
          "<p>The economist measures the loss and keeps each collateral payment visible and separate. The <a href=\"/services/lost-earnings-and-earning-capacity\">lost earnings</a> schedules show the gross loss; a separate schedule catalogs the disability benefits, workers' compensation indemnity, insurance payments, and other collateral sources in the record, with amounts and periods; and the summary shows the result with and without each offset. Counsel then applies the venue's rule, and the trier of fact sees a number built to that rule rather than one in which the offsets were silently netted or silently ignored. The <a href=\"/methods/mitigation-and-offsets\">mitigation and offsets</a> page describes the schedule alongside the other deductions.</p>",
      },
      {
        id: "collateral-payments-versus-mitigation",
        heading: "Collateral payments versus mitigation",
        bodyHtml:
          "<p>Collateral payments are distinct from post-event earnings. Wages the person earns after the event are part of the loss calculation itself, netted against but-for earnings in every framework, because the loss is the difference between the two streams. Insurance and benefit payments are not earnings; they are compensation from a third party for the same loss, and whether they reduce the award is what the collateral source rule decides. The <a href=\"/guides/how-lost-earnings-are-calculated\">lost earnings guide</a> shows where each sits in the calculation.</p>",
      },
      {
        id: "liens-and-reimbursement",
        heading: "Liens and reimbursement rights",
        bodyHtml:
          "<p>Separate from the collateral source rule, some payers have reimbursement or lien rights against a recovery: health insurers under plan terms, public programs under their own statutes, and workers' compensation carriers under state law. Those rights affect how a settlement is distributed rather than how the loss is measured, and the economist's schedules of collateral payments are often the starting point for counsel's analysis of them. The <a href=\"/case-types/workers-compensation\">workers' compensation</a> case type page discusses the interaction in that setting.</p>",
      },
      {
        id: "verify",
        heading: "Verify the governing rule",
        bodyHtml:
          "<p>This page is a general overview and not legal advice. The collateral source rule, its statutory modifications, and the related reimbursement rights differ by state and by case type. Counsel confirms the governing rule against primary sources, and the economist builds the schedules to it.</p>",
      },
    ],
    faqs: [
      {
        question: "Does the collateral source rule apply to future benefits?",
        answer:
          "It depends on the jurisdiction. Some frameworks address only payments already received; others allow offsets for benefits reasonably expected in the future, sometimes only where the entitlement is certain. The report can present expected future benefits on their own schedule where counsel requests it.",
      },
      {
        question: "Should the economist deduct disability payments from lost earnings?",
        answer:
          "Not on the economist's own initiative. The report shows the gross loss and the disability payments separately, and the offset is applied or not according to the venue's rule and counsel's instruction.",
      },
      {
        question: "Are employer-paid benefits collateral sources?",
        answer:
          "Benefits the person earned through employment, such as disability insurance provided by the employer, are generally treated as collateral in jurisdictions that follow the traditional rule, on the reasoning that they are part of the person's compensation. Statutory modifications vary, and counsel confirms the treatment.",
      },
    ],
    sources: refsToSources(["RESTATEMENT_TORTS_920A"]),
    related: [
      { title: "Mitigation and Offsets", href: "/methods/mitigation-and-offsets" },
      { title: "How Lost Earnings Are Calculated", href: "/guides/how-lost-earnings-are-calculated" },
      { title: "Jurisdictions", href: "/jurisdictions" },
    ],
  },
  {
    slug: "business-valuation-in-litigation",
    title: "Business Valuation in Litigation",
    metaDescription: "A litigation valuation turns on the standard of value, the valuation date, normalized statements, the three approaches, and the discounts the interest supports.",
    tldr:
      "A litigation valuation begins with four decisions the governing framework shapes: the interest being valued, the valuation date, the standard of value, and the premise of value. The valuator then normalizes the financial statements, applies the income, market, and asset approaches as the company warrants, considers discounts and premiums appropriate to the standard and the interest, and reconciles the indications into a conclusion documented to professional standards. This guide walks through each decision and where valuations are attacked.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    sections: [
      {
        id: "standard-of-value",
        heading: "The standard of value",
        bodyHtml:
          "<p>The standard of value defines whose perspective the valuation takes and therefore what the number means. Fair market value asks what a hypothetical willing buyer would pay a willing seller. Fair value, as defined by statute or case law for dissenting and oppressed shareholder matters, often excludes the discounts a hypothetical buyer would demand. Investment value asks what the interest is worth to a particular owner. The standard is a legal question the governing framework answers, and applying the wrong one is among the most common reasons a <a href=\"/services/business-valuation\">valuation</a> is rejected. The <a href=\"/compare/fair-market-value-vs-fair-value\">fair market value versus fair value</a> comparison explains the difference in detail.</p>",
      },
      {
        id: "valuation-date",
        heading: "The valuation date",
        bodyHtml:
          "<p>Value is measured as of a specific date using what was known or reasonably knowable then. In a divorce the date may be the filing, the separation, or the trial, depending on the state; in a shareholder matter it is often the day before the transaction the shareholder dissented from; in a damages matter it is usually the date of the wrongful act. Events after the date are generally excluded unless the framework directs otherwise, so the choice of date can change the conclusion materially, and the report states the date and its basis.</p>",
      },
      {
        id: "normalization",
        heading: "Normalizing the financial statements",
        bodyHtml:
          "<p>Closely held company statements rarely show sustainable earning power without adjustment. The valuator removes non-recurring gains and losses, restates owner compensation to what an outside manager would be paid, separates personal expenses run through the business, adjusts related-party rents and loans to market terms, and identifies non-operating assets to be valued separately. Each adjustment is listed with its basis, because the normalized earnings drive the income approach and the adjustments are where opposing valuators most often differ. The <a href=\"/guides/income-determination-in-divorce\">income determination guide</a> covers the owner compensation question from the support side.</p>",
      },
      {
        id: "three-approaches",
        heading: "The three approaches and reconciliation",
        bodyHtml:
          "<p>The income approach converts expected cash flows into value, either by discounting a projection or by capitalizing a normalized level of earnings, with a rate built from the company's risk profile. The market approach draws on prices paid for comparable companies or interests, adjusted for size, growth, and risk. The asset approach values the assets net of liabilities and serves as a floor or as the primary approach for holding companies and businesses being liquidated. The valuator applies the approaches the company warrants, explains why any was not used, and reconciles the indications with stated weights. The <a href=\"/methods/business-valuation-approaches\">business valuation approaches</a> page describes each.</p>",
      },
      {
        id: "discounts-and-premiums",
        heading: "Discounts and premiums",
        bodyHtml:
          "<p>A minority interest in a closely held company may be worth less than its proportionate share of the whole because the holder cannot control the company and cannot readily sell the interest. Discounts for lack of control and lack of marketability reflect those disadvantages, and they are the most litigated inputs in valuation because they can reduce the number substantially. Whether they apply depends on the standard of value and the interest being valued, and the magnitude must be tied to the specific company rather than applied by rote from a study. The report explains both decisions.</p>",
      },
      {
        id: "the-report-and-standards",
        heading: "The report and the professional standards",
        bodyHtml:
          "<p>Professional valuation standards prescribe the engagement definition, the approaches, the analysis, and the report content, including the standard and premise of value, the valuation date, the sources of information, the approaches applied and the reasons, the discounts considered, and the assumptions and limiting conditions. A report that follows them is positioned to meet a methodology challenge; a report that does not gives the other side its cross-examination outline. The <a href=\"/white-papers/business-valuation-standards-in-litigation\">white paper on valuation standards</a> sets out the elements, and the <a href=\"/guides/lost-profits-vs-lost-business-value\">lost profits versus lost business value</a> guide addresses when a valuation rather than a lost profits analysis is the right measure.</p>",
      },
    ],
    faqs: [
      {
        question: "Who chooses the standard of value?",
        answer:
          "The governing framework does, and counsel identifies it. The valuator applies the standard counsel identifies, states it in the report, and where the standard is unsettled presents the result under each alternative.",
      },
      {
        question: "Can a valuation rely on management's projections?",
        answer:
          "Only with scrutiny. Projections prepared before the dispute for business purposes carry weight; projections prepared for the litigation are tested against the company's history and the market, and the report explains what was accepted, adjusted, or rejected.",
      },
      {
        question: "How is goodwill handled in a divorce valuation?",
        answer:
          "Many states distinguish enterprise goodwill, which belongs to the business and is divisible, from personal goodwill, which attaches to the owner and in some states is not. The distinction is a legal one that varies by state, and the valuator allocates the goodwill according to the framework counsel identifies.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "TREASURY_YIELD"]),
    related: [
      { title: "Business Valuation", href: "/services/business-valuation" },
      { title: "Business Valuation Approaches", href: "/methods/business-valuation-approaches" },
      { title: "Partnership and Shareholder Disputes", href: "/case-types/partnership-and-shareholder-dispute" },
    ],
  },
  {
    slug: "lost-profits-vs-lost-business-value",
    title: "Lost Profits vs. Lost Business Value",
    metaDescription: "Lost profits measure a surviving business over a loss period; lost business value measures a destroyed business at one date. Claiming both double counts.",
    tldr:
      "Lost profits measure what a continuing business would have earned but for the wrongful act over a defined loss period. Lost business value measures what the business or the owner's interest was worth on a valuation date when the act destroyed it. Both rest on projected cash flows, so claiming both for the same period counts the loss twice. This guide explains when each measure applies, where the boundary lies, and how the proof and the discounting differ.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    sections: [
      {
        id: "two-measures",
        heading: "Two measures of the same harm",
        bodyHtml:
          "<p>A business harmed by a breach, a tort, or a fraud can lose profits for a period and then recover, or it can be destroyed. The first harm is measured as <a href=\"/services/lost-profits-and-commercial-damages\">lost profits</a>: the difference between the profits the business would have earned and the profits it did earn, over a loss period, net of avoided costs and mitigation. The second is measured as lost business value: what the business was worth on the date it was destroyed, developed through a <a href=\"/services/business-valuation\">valuation</a> under the standard of value the framework requires. The measures answer different questions, and the choice depends on what happened to the business.</p>",
      },
      {
        id: "when-lost-profits-applies",
        heading: "When lost profits is the measure",
        bodyHtml:
          "<p>Lost profits apply when the business continued to operate through the harm. A breached supply contract, a lost customer, a period of closure, a diverted opportunity, or a defective input that disrupted production produces a loss with a beginning and an end. The <a href=\"/methods/lost-profits-but-for-analysis\">but-for analysis</a> establishes what revenue the business would have earned, deducts the costs it avoided, nets what it earned by mitigating, tests causation against the other events of the period, and discounts any future portion. The loss period ends when the business recovered or would have recovered, which may be the remaining term of a contract or the time needed to rebuild a customer base.</p>",
      },
      {
        id: "when-business-value-applies",
        heading: "When business value is the measure",
        bodyHtml:
          "<p>Business value applies when the harm ended the business or removed the owner's interest: a company forced to close, a franchise terminated, a partner frozen out, or an owner whose interest was taken. The measure is the value of the business or the interest as of the date of destruction, which already reflects the profits the business would have earned afterward, developed through the <a href=\"/methods/business-valuation-approaches\">income, market, and asset approaches</a> and adjusted for the standard of value and the interest. A lost profits projection running indefinitely is usually a business valuation in disguise and is better presented as one.</p>",
      },
      {
        id: "the-boundary",
        heading: "The boundary and double recovery",
        bodyHtml:
          "<p>Because a valuation as of the date of destruction incorporates all future profits, adding lost profits after that date counts the same cash flows twice. Where a business was harmed for a period and then destroyed, the analysis presents lost profits from the wrongful act to the date of destruction and the value of the business as of that date, with the boundary stated and the two schedules reconciled. The <a href=\"/compare/lost-profits-vs-business-valuation\">lost profits versus business valuation</a> comparison sets out the distinction side by side.</p>",
      },
      {
        id: "proof",
        heading: "Proof and reasonable certainty",
        bodyHtml:
          "<p>Most jurisdictions require the fact of a lost profits loss to be proved with reasonable certainty, with more latitude on the amount once the fact is shown. An established business proves the fact from its history; a new business faces a higher bar and proves it from signed contracts, comparable businesses, or pre-dispute performance. A valuation is proved by following the professional standards and grounding the projections in the company's history and market, as the <a href=\"/guides/business-valuation-in-litigation\">business valuation in litigation</a> guide describes. In both cases the report shows the basis for each projection so the trier of fact can weigh it.</p>",
      },
      {
        id: "discounting-differences",
        heading: "How the discounting differs",
        bodyHtml:
          "<p>Both measures discount future cash flows for time and risk, but the rate is built differently. In a valuation the rate is developed within the income approach from the company's risk profile and applied to all expected cash flows. In a lost profits analysis the rate reflects the risk of the specific projected profits, which can be lower where the profits were contractually assured and higher where they depended on winning new business. The <a href=\"/methods/present-value-and-discounting\">present value method</a> page explains the mechanics common to both.</p>",
      },
    ],
    faqs: [
      {
        question: "Can a plaintiff choose the larger of the two?",
        answer:
          "The measure follows the facts: whether the business survived or was destroyed. Where the facts are contested, the report can present both measures with the boundary stated, but they cannot be combined for the same period.",
      },
      {
        question: "What if the business was sold after the harm?",
        answer:
          "The sale price is evidence of value as of the sale date, and the analysis considers whether the harm reduced it. Lost profits may run from the harm to the sale, with the reduction in sale price as the measure of the loss after that.",
      },
      {
        question: "Does a start-up have a claim for lost business value?",
        answer:
          "Possibly, if it can be valued with reasonable certainty from evidence such as investment rounds, comparable transactions, or contracts in hand. The analysis is demanding, and the report addresses the risks the business faced directly.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "TREASURY_YIELD", "AAEFE_JLE"]),
    related: [
      { title: "Lost Profits and Commercial Damages", href: "/services/lost-profits-and-commercial-damages" },
      { title: "Lost Profits and But-For Analysis", href: "/methods/lost-profits-but-for-analysis" },
      { title: "Commercial Contract Disputes", href: "/case-types/commercial-contract-dispute" },
    ],
  },
  {
    slug: "income-determination-in-divorce",
    title: "Income Determination in Divorce",
    metaDescription: "Income for support is determined from cash flow, not taxable income: owner compensation, perquisites, retained earnings, and lifestyle, tied to the records.",
    tldr:
      "Support in a divorce depends on each spouse's income, and for a business owner or a high earner the tax return rarely tells the whole story. The economist determines income from cash flow rather than taxable income, normalizes owner compensation and perquisites, analyzes the marital lifestyle where the framework uses it, and addresses the earning capacity of a spouse who is not working. Where a business interest is marital property, the income analysis and the valuation are coordinated so the same dollars are not counted twice.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    sections: [
      {
        id: "why-income-is-contested",
        heading: "Why income is contested",
        bodyHtml:
          "<p>Support formulas and equitable distribution both turn on income, and for a wage earner with a W-2 the number is rarely disputed. For a business owner, a professional with a practice, a commissioned salesperson, or a spouse with investment income, the tax return reflects choices about timing, deductions, and compensation that may not describe the money actually available to the household. The <a href=\"/services/divorce-and-marital-financial-analysis\">divorce and marital financial analysis</a> engagement determines the income the framework should use and documents how it was derived.</p>",
      },
      {
        id: "owner-compensation-and-perquisites",
        heading: "Owner compensation and perquisites",
        bodyHtml:
          "<p>An owner controls how the business pays them: salary, distributions, retained earnings, and expenses the business pays on the owner's behalf. The analysis restates the owner's income to include distributions and personal expenses run through the business, such as vehicles, travel, meals, insurance, and family members on the payroll, and considers whether retained earnings were a genuine business need or a way to hold income inside the company. Each adjustment is listed with its source in the general ledger or the bank records, so the resulting income can be traced. The same adjustments feed the normalization step in a <a href=\"/guides/business-valuation-in-litigation\">business valuation</a>.</p>",
      },
      {
        id: "cash-flow-versus-taxable-income",
        heading: "Cash flow versus taxable income",
        bodyHtml:
          "<p>Taxable income is reduced by depreciation, carryforwards, and elective deductions that do not reduce the cash available to the household, and it can be increased by items that produce no cash. The economist builds income from cash flow: what came in, from all sources, and what was actually spent on the business, over several years to smooth timing. Where the framework defines income for support purposes, the report presents the figure under that definition and shows the reconciliation to the tax return so the court can see the difference and its causes.</p>",
      },
      {
        id: "the-business-interest",
        heading: "The business interest and double counting",
        bodyHtml:
          "<p>When a business interest is marital property, it is valued for division under the standard of value the state uses, and the owner's income from the same business is used for support. The two analyses must be coordinated. A valuation that capitalizes the owner's excess earnings and a support award based on those same earnings can count the same dollars twice; the report identifies the overlap and presents the alternatives so the court can decide how to treat it. The <a href=\"/methods/business-valuation-approaches\">business valuation approaches</a> page describes the valuation, and the <a href=\"/compare/fair-market-value-vs-fair-value\">standard of value</a> comparison explains why the state's standard matters.</p>",
      },
      {
        id: "lifestyle-analysis",
        heading: "Lifestyle analysis",
        bodyHtml:
          "<p>Some frameworks measure support against the marital standard of living. A lifestyle analysis reconstructs the household's spending from bank and credit card records over a representative period, categorizes it, separates recurring from one-time expenses, and identifies what was paid by the business rather than the household. The result is a documented picture of the marital lifestyle and, incidentally, a check on reported income: spending that exceeds reported income points to income the return does not show, which is where a <a href=\"/services/fraud-and-asset-tracing\">tracing analysis</a> may begin.</p>",
      },
      {
        id: "earning-capacity-of-a-non-working-spouse",
        heading: "The earning capacity of a spouse who is not working",
        bodyHtml:
          "<p>Where a spouse left the labor force during the marriage, support may turn on what that spouse could earn now. The economist projects earning capacity from education, prior work history, and published earnings for the occupations and the area, with an allowance for the time needed to re-enter the labor force and any retraining the record supports. The analysis parallels the <a href=\"/compare/lost-earnings-vs-lost-earning-capacity\">earning capacity</a> question in injury matters, and where capacity is contested a vocational opinion may supply the foundation.</p>",
      },
      {
        id: "records",
        heading: "Records that drive the analysis",
        bodyHtml:
          "<p>The analysis needs several years of personal and business tax returns with all schedules, business financial statements and general ledgers, bank and credit card statements for the household and the business, payroll records, loan applications and personal financial statements submitted to lenders, and any buy-sell or partnership agreements. Loan applications deserve particular attention because they state income to a lender under a different incentive than a tax return. The <a href=\"/case-types/divorce-and-marital-dissolution\">divorce and marital dissolution</a> case type page describes how the pieces fit together.</p>",
      },
    ],
    faqs: [
      {
        question: "Is the economist's income figure the same as the support formula's?",
        answer:
          "The economist determines income under the definition the framework uses and documents it. The formula or the court then applies that income. Where the framework's definition is unsettled, the report presents the figure under each reading.",
      },
      {
        question: "Can income be imputed to a spouse who is voluntarily underemployed?",
        answer:
          "Whether to impute is a legal question. The economist supplies the analysis: what the spouse could earn given education, history, and the labor market, and over what timeline. The court decides whether to use it.",
      },
      {
        question: "What if the other spouse controls all the records?",
        answer:
          "The analysis begins with what is available, identifies the specific records needed, and supports counsel's discovery requests with a list. Bank records and loan applications obtained by subpoena often fill the gaps.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "BLS_OES", "CENSUS_ACS", "ACFE"]),
    related: [
      { title: "Divorce and Marital Financial Analysis", href: "/services/divorce-and-marital-financial-analysis" },
      { title: "Business Valuation in Litigation", href: "/guides/business-valuation-in-litigation" },
      { title: "Fraud Investigation and Asset Tracing", href: "/services/fraud-and-asset-tracing" },
    ],
  },
  {
    slug: "how-to-rebut-an-economic-damages-report",
    title: "How to Rebut an Economic Damages Report",
    metaDescription: "A rebuttal tests an opposing damages report input by input against the record, then presents an alternative calculation with its own stated foundation.",
    tldr:
      "A rebuttal tests an opposing economic report input by input against the record: the records considered and the assumptions adopted, the earnings base and growth rate, the worklife and life expectancy horizons, the fringe benefits and offsets, the consumption deduction in a death claim, the discount rate and its consistency with growth, and, in a commercial report, the but-for revenue, avoided costs, and causation. The findings organize the rebuttal report, an alternative calculation, and the deposition of the opposing economist.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    sections: [
      {
        id: "what-a-rebuttal-is",
        heading: "What a rebuttal is and is not",
        bodyHtml:
          "<p>An <a href=\"/services/expert-rebuttal-and-report-review\">economic rebuttal</a> is an independent review of an opposing report by a qualified economist, applying the same methods the opposing economist was bound by. It is not a list of objections. A rebuttal that rejects a report without showing what the record does support is as vulnerable as a report that overstates the loss, and the trier of fact is left with one number and a complaint. The output is usually a written report that addresses the opposing analysis schedule by schedule and, where the record supports it, an alternative calculation that gives the trier of fact a second number with its own foundation. The <a href=\"/compare/plaintiff-economist-vs-defense-economist\">plaintiff versus defense economist</a> comparison explains why the method must hold constant.</p>",
      },
      {
        id: "records-and-assumptions",
        heading: "Records considered and assumptions adopted",
        bodyHtml:
          "<p>The review begins with what the opposing economist had and assumed. The list of records considered is compared with what has been produced: missing tax years, pay records after the event, updated medical or vocational opinions, and a revised life care plan are common omissions. The assumptions adopted from other experts are traced to their sources: a post-event capacity figure with no vocational or medical opinion behind it, or a horizon that departs from the medical evidence, is a foundation problem before it is a calculation problem.</p>",
      },
      {
        id: "earnings-base-and-growth",
        heading: "Earnings base and growth",
        bodyHtml:
          "<p>The earnings base is checked against the tax returns and pay records: which years were used, whether an unusual year was included or excluded without explanation, whether overtime and bonuses were carried forward at a level the history supports, and whether a self-employed claimant's return on capital was separated from labor income. The growth rate is checked for its series and period and for consistency with the discount rate. The <a href=\"/methods/wage-growth-and-earnings-projection\">earnings projection</a> page sets out the standard, and an undocumented promotion or career path is the most frequent finding.</p>",
      },
      {
        id: "horizons",
        heading: "Worklife and life expectancy",
        bodyHtml:
          "<p>The horizon multiplies everything. The reviewer identifies the <a href=\"/methods/worklife-expectancy\">worklife table</a> and edition, whether the labor force status used matches the record, whether a fixed retirement age was substituted for the table without a basis, and whether household services and care costs run over life expectancy from the current life tables. A projection to a retirement age the record does not support, or a life expectancy the medical evidence contradicts, is presented with its effect on the total.</p>",
      },
      {
        id: "benefits-and-offsets",
        heading: "Benefits, offsets, and consumption",
        bodyHtml:
          "<p>Fringe benefits are checked for double counting and for whether a published average was applied where plan documents were available. Post-event earnings are checked against pay records and the capacity evidence, and the reviewer asks whether mitigation was addressed at all. In a death claim the personal consumption deduction is checked for its presence, its percentage, and its source, and collateral payments are checked for whether they were netted or presented separately as the venue's rule requires. The <a href=\"/methods/mitigation-and-offsets\">mitigation and offsets</a> page describes each deduction and the <a href=\"/guides/collateral-source-rule-explained\">collateral source guide</a> the legal overlay.</p>",
      },
      {
        id: "discounting",
        heading: "Discounting",
        bodyHtml:
          "<p>The discount rate is checked for its instruments, its period, and its consistency with the growth rate. A growth rate drawn from a high-inflation decade paired with a discount rate from a low-yield year, or a net rate with no visible components, is a consistency problem that changes the total materially over a long horizon. The reviewer recalculates present value under a consistent pair of rates and reports the difference, as the <a href=\"/methods/present-value-and-discounting\">present value method</a> and the <a href=\"/compare/net-vs-gross-discount-rate\">net versus gross</a> comparison describe.</p>",
      },
      {
        id: "commercial-reports",
        heading: "Commercial reports",
        bodyHtml:
          "<p>A lost profits or valuation report is tested on its own terms: whether the but-for revenue rests on the company's history, a valid yardstick, or pre-dispute projections; whether avoided costs were deducted and fixed and variable costs classified from the company's accounting; whether causation was analyzed against the other events of the period or assumed; whether the loss period has a stated end; whether the standard of value matches the framework; and whether discounts were tied to the interest actually valued. The <a href=\"/methods/lost-profits-but-for-analysis\">lost profits</a> and <a href=\"/methods/business-valuation-approaches\">valuation</a> method pages set out the standards.</p>",
      },
      {
        id: "deposition-themes",
        heading: "Deposition themes",
        bodyHtml:
          "<p>The findings organize the deposition of the opposing economist. Productive lines follow the review: which document supports each contested input and when it was produced; whether the economist asked the other experts the question or inferred the answer; which table and edition set the horizon and why any departure was made; where each rate came from, from what period, and whether the growth and discount rates were drawn together; whether the sensitivity of the result was tested and, if so, why it was not reported; and whether the economist has applied a different assumption on the same question in another matter. The goal is a transcript in which each contested input either has a foundation or does not. Counsel confirms the <a href=\"/guides/federal-vs-state-court-daubert\">governing admissibility framework</a> before deciding whether the findings support a motion or are better used at trial.</p>",
      },
    ],
    faqs: [
      {
        question: "Should the rebuttal include an alternative calculation?",
        answer:
          "Usually. An alternative calculation grounded in the same record gives the trier of fact a supported number rather than only a critique, and it demonstrates that the reviewer applied the method rather than simply rejecting the result. Where the record does not support any loss, the rebuttal says so and explains why.",
      },
      {
        question: "How quickly can a rebuttal be prepared?",
        answer:
          "Faster than an affirmative report, because the framework and most inputs are already on the table. The timeline depends on the length of the opposing report, the state of the record, and whether an alternative calculation is required.",
      },
      {
        question: "Can the rebuttal address the medical or vocational assumptions?",
        answer:
          "The economist identifies where the opposing report's assumptions depart from the medical and vocational evidence and shows the effect of using the evidence instead. Whether the underlying opinions are correct is for the medical and vocational witnesses.",
      },
      {
        question: "What if the opposing report has no schedules?",
        answer:
          "The absence of visible inputs is itself a finding. The reviewer reconstructs the calculation as far as the report allows, identifies what could not be verified, and recalculates from documented sources.",
      },
    ],
    sources: refsToSources(["FRE_702", "DAUBERT", "FRCP_26", "SKOOG_CIECKA_KRUEGER_2011", "TREASURY_YIELD"]),
    related: [
      { title: "Expert Rebuttal and Report Review", href: "/services/expert-rebuttal-and-report-review" },
      { title: "Plaintiff Economist vs. Defense Economist", href: "/compare/plaintiff-economist-vs-defense-economist" },
      { title: "Components of an Economic Damages Report", href: "/insights/components-of-an-economic-damages-report" },
    ],
  },
  {
    slug: "how-worklife-expectancy-is-chosen",
    title: "How Worklife Expectancy Is Chosen in a Lost Earnings Claim",
    metaTitle: "How Worklife Expectancy Is Chosen",
    metaDescription: "The economist reads the worklife horizon from published tables by age, sex, education, and labor force status, then explains any departure the record supports.",
    tldr:
      "Worklife expectancy is the number of years a person is expected to remain in the labor force from a given age, and it sets the horizon of a lost earnings projection. The economist reads it from published worklife tables for the person's age, sex, education, and labor force status, decides whether to apply it as a single figure or year by year, adjusts it only where the record supports an adjustment, and states the choice so that the other side can test it. This guide explains each of those decisions and where opposing reports go wrong.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-09-07",
    dateModified: "2026-09-07",
    sections: [
      {
        id: "what-it-measures",
        heading: "What worklife expectancy measures",
        bodyHtml:
          "<p>Worklife expectancy is the expected number of additional years a person will spend in the labor force, employed or looking for work, over the rest of a lifetime. It is not an age. A person of forty with a worklife expectancy of twenty-two years is not expected to work to sixty-two and then stop; the figure is an average over many possible paths, some of which end early through illness, caregiving, or discouragement, and some of which run well past a conventional retirement age. The <a href=\"/methods/worklife-expectancy\">worklife expectancy method</a> page describes the tables in more detail.</p><p>The figure matters because it bounds the loss. In a <a href=\"/services/lost-earnings-and-earning-capacity\">lost earnings and earning capacity</a> claim, every year of projected earnings, and the fringe benefits that ride on them, runs only as far as the horizon. A horizon two years too long or two years too short moves the present value by a proportionate share of the future loss, which on a long projection is a large number, so the choice is examined closely on both sides.</p>",
      },
      {
        id: "the-tables",
        heading: "Where the figure comes from",
        bodyHtml:
          "<p>Forensic economists read worklife expectancy from published tables built from the labor force transition data the Current Population Survey collects. The tables observe how often people of each age move between working, looking for work, and being out of the labor force, and from those transition rates compute the expected years of activity remaining at each age. The most widely used tables are stratified by sex, by highest level of education completed, and by whether the person was active or inactive in the labor force at the starting age.</p><p>The report identifies the table, its edition, and the row it read, because the tables are revised as new survey years are added and because the row depends on facts the record has to establish: the person's age on the valuation date, the education completed at that date, and the labor force status immediately before the event. A report that gives a worklife figure without naming the table and the row cannot be checked, and an opposing economist will say so.</p>",
      },
      {
        id: "reading-the-row",
        heading: "Reading the right row",
        bodyHtml:
          "<p>Three facts fix the row. Age is the person's age at the valuation date, not at the event, because the projection starts at the valuation date and the past loss is tabulated separately. Education is the highest level completed, and the categories in the tables are broad, so a degree in progress at the time of the event is an argument about the record rather than a different row. Labor force status is the one most often disputed: a person who was working is read from the active table, a person who was between jobs is read from the active table if the record shows continued job search and from the inactive table if it does not, and the report says which and why.</p><p>Sex is a table variable because the underlying transition rates differ, and the report uses the row the tables provide. Where counsel prefers a projection that does not distinguish by sex, the economist can present the pooled figure alongside the sex-specific one and explain the difference, so the trier of fact sees what the choice does to the number.</p>",
      },
      {
        id: "fixed-horizon-or-year-by-year",
        heading: "A fixed horizon or a year-by-year probability",
        bodyHtml:
          "<p>The expected years can be applied in two ways. The simpler way treats the figure as a fixed horizon: earnings run at full value from the valuation date for that many years and then stop. The more complete way applies the probability of being active in each future year to that year's earnings, so the projection tapers rather than ending abruptly, and earnings in the later years are weighted by the smaller chance the person would still have been working. Both methods are published and both are used; they produce similar totals on a long horizon and can differ on a short one, and the report should say which it applied.</p><p>Whichever way the horizon is applied, it is applied to both streams. The but-for earnings and the post-event earnings run over the same horizon, and the fringe benefits that accrue with each stream stop when the stream stops, so the two sides of the comparison are measured over the same years. The <a href=\"/guides/how-lost-earnings-are-calculated\">lost earnings guide</a> shows where the horizon enters the schedules.</p>",
      },
      {
        id: "when-the-record-moves-the-horizon",
        heading: "When the record supports a different horizon",
        bodyHtml:
          "<p>The tables describe a population average, and the record can support a departure. A documented retirement plan, a mandatory retirement age in the occupation, a pension that vests at a stated age, or a medical opinion that the person will leave the labor force earlier than the population would are the usual examples. The economist can adopt the record's horizon, present the loss under both horizons, or apply the table and note the departure; what the economist does not do is move the horizon without a document behind the move.</p><p>A physically demanding occupation is the argument most often made against the table, and it cuts both ways: the tables already reflect the early exits of people in demanding jobs, and a specific finding about this person's body belongs to the medical witness, not the economist. A person's stated intention to work to seventy is evidence, and the report can present the loss under that assumption, but the report says it is the person's intention and shows the table figure beside it.</p>",
      },
      {
        id: "where-reports-go-wrong",
        heading: "Where opposing reports go wrong",
        bodyHtml:
          "<p>The recurring errors are a retirement age with no basis in the record in place of a table figure, a table applied to the wrong row because the labor force status was assumed rather than established, a horizon that runs earnings to life expectancy as if the person would never have stopped working, an edition of the tables that has been superseded, and a horizon applied to one stream but not the other. Each is visible on the face of the report, and each is a line of cross-examination. The <a href=\"/guides/how-to-rebut-an-economic-damages-report\">rebuttal guide</a> lists the questions to ask.</p><p>A horizon question is also a venue question. In a <a href=\"/case-types/wrongful-death/new-jersey\">New Jersey wrongful death claim</a>, for example, the decedent's earnings run over worklife while support and household services run over life expectancy, and a report that runs everything to one horizon has mixed the two. The report presents the horizons separately and states the source of each.</p>",
      },
      {
        id: "how-it-is-presented",
        heading: "How the choice is presented",
        bodyHtml:
          "<p>A sound report states the table, the edition, the row, the resulting expected years, the way the figure was applied, and any departure the record supported, and it shows the present value under the alternative horizon where the horizon is contested. That presentation lets the trier of fact see what the choice does to the number and lets counsel on either side test the choice against the record rather than against the economist's assertion. The <a href=\"/methods/wage-growth-and-earnings-projection\">earnings projection</a> page describes the growth rate that runs over the horizon, and the <a href=\"/methods/present-value-and-discounting\">present value</a> page describes how the horizon and the discount rate interact.</p>",
      },
    ],
    faqs: [
      {
        question: "Why does the worklife horizon end before life expectancy?",
        answer:
          "Because people leave the labor force before they die. Worklife expectancy counts only the years a person is expected to be working or looking for work; life expectancy counts every remaining year. Earnings run over the first horizon, while support to survivors and household services run over the second.",
      },
      {
        question: "Can the economist use the plaintiff's stated plan to work to seventy?",
        answer:
          "The report can present the loss under that assumption, labeled as the person's stated intention, with the table figure shown beside it. The economist does not substitute the intention for the table without a document such as a pension election or an employer agreement that supports it.",
      },
      {
        question: "Does the worklife horizon apply to fringe benefits and household services?",
        answer:
          "Fringe benefits stop when the earnings stop, so they run over the worklife horizon. Household services do not depend on employment and run over life expectancy from the current life tables, and the report keeps the two horizons separate.",
      },
    ],
    sources: refsToSources(["SKOOG_CIECKA_KRUEGER_2011", "BLS_CPS", "NCHS_LIFE_TABLES"]),
    related: [
      { title: "Worklife Expectancy", href: "/methods/worklife-expectancy" },
      { title: "Lost Earnings and Earning Capacity Analysis", href: "/services/lost-earnings-and-earning-capacity" },
      { title: "How Lost Earnings Are Calculated", href: "/guides/how-lost-earnings-are-calculated" },
    ],
  },
  {
    slug: "fringe-benefits-in-a-lost-earnings-claim",
    title: "Fringe Benefits in a Lost Earnings Claim",
    metaDescription: "Fringe benefits add employer-paid health, retirement, and leave costs to a lost earnings claim, valued from plan documents or from published employer cost data.",
    tldr:
      "Compensation is wages plus the benefits the employer pays for, and a lost earnings claim that stops at wages understates the loss. Fringe benefits are the employer's cost of health coverage, retirement contributions, legally required payroll contributions, and paid leave, valued from the person's own plan documents where they exist and from published employer cost data where they do not, added to both the but-for and the post-event streams, and carried over the worklife horizon. This guide explains what counts, where the value comes from, and the double-counting errors that show up in opposing reports.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-09-07",
    dateModified: "2026-09-07",
    sections: [
      {
        id: "what-counts",
        heading: "What counts as a fringe benefit",
        bodyHtml:
          "<p>A fringe benefit, for damages purposes, is compensation the employer pays for that does not arrive as wages. The categories are the employer's share of health, dental, and vision premiums; employer contributions to a retirement plan, whether a defined contribution match or the funding of a defined benefit pension; the employer's legally required contributions for Social Security, Medicare, unemployment insurance, and workers' compensation coverage; paid leave, where it is not already inside the wage figure; and, less often, employer-paid life and disability insurance. Bonuses, overtime, and commissions are wages and belong in the earnings base, not here. The <a href=\"/methods/fringe-benefits-valuation\">fringe benefits method</a> page sets out the valuation step by step.</p><p>The loss of a benefit is measured at the employer's cost, because that is what the person received and what a replacement would cost. A health plan is valued at the employer's premium share, not at the medical care the plan paid for, and a retirement match is valued at the contribution, not at the balance it would have grown into, since growth on the contribution is captured when the stream is discounted.</p>",
      },
      {
        id: "where-the-value-comes-from",
        heading: "Where the value comes from",
        bodyHtml:
          "<p>The person's own records come first. A benefits statement, a summary plan description, a pay stub that shows the employer's premium share, a retirement plan statement that shows the match, and a union contract that fixes the benefit package establish what this employer paid for this person, and the report values each benefit from them. Where the records are incomplete, the economist asks for them before falling back on averages, because a published average applied where plan documents were available is the most common criticism of a benefit figure.</p><p>Published employer cost data fills the gaps. The Bureau of Labor Statistics measures what employers pay per hour for each benefit category by industry, occupation group, region, and establishment size, so a person whose employer offered benefits but whose plan documents were not produced can be valued from the category that matches the job. The report says which series, which category, and which release it used, and it uses the same source on both streams so the comparison is consistent.</p>",
      },
      {
        id: "legally-required-and-discretionary",
        heading: "Legally required and discretionary benefits",
        bodyHtml:
          "<p>The employer's legally required contributions are included because they are part of what the employment was worth, but they are handled carefully. The Social Security contribution funds a retirement benefit the person may still receive in part, so the report either includes the contribution and stops the earnings stream at worklife, or projects the retirement benefit the lost earnings would have produced, and never both. The unemployment insurance and workers' compensation contributions are small and are included at the published rate. Discretionary benefits, health coverage and retirement contributions above all, are the larger part of the figure and depend on the employer, which is why the records matter more than the averages.</p>",
      },
      {
        id: "benefits-after-the-event",
        heading: "Benefits in the post-event stream",
        bodyHtml:
          "<p>The post-event stream carries benefits on the same basis. A person who has returned to work with a new employer receives that employer's benefits, valued from the new plan documents or the matching published category, and the loss is the difference year by year. A person who kept coverage under the old employer's plan for a period after the event has no health benefit loss for that period. A person who has not returned to work has no post-event benefits, and the whole benefit stream is lost over the horizon the medical and capacity evidence supports. The <a href=\"/methods/mitigation-and-offsets\">mitigation and offsets</a> page describes how the two streams are netted.</p><p>In an <a href=\"/services/employment-and-wage-loss-damages\">employment matter</a>, the benefit loss often exceeds the wage loss in the early years, because a terminated employee who finds work quickly may find it without comparable health coverage or a retirement match, and the report shows the benefit line separately so the trier of fact can see it.</p>",
      },
      {
        id: "the-double-counting-errors",
        heading: "The double-counting errors",
        bodyHtml:
          "<p>Three errors recur. The first is a percentage add-on applied to a wage figure that already included the benefit, usually paid leave that was inside the annual salary or a bonus that was inside the earnings base. The second is a published average applied where plan documents were available, or applied to a job category that does not match the work. The third is a benefit valued twice through different doors: the employer's Social Security contribution and a projected Social Security retirement benefit, or a pension contribution and the pension it would have funded. The report avoids each by listing the benefits, naming the source for each, and stating where each stream starts and stops.</p><p>The mirror-image error is omission. A report that projects wages alone, or that treats health coverage as a collateral source rather than as compensation, understates the loss by the employer's cost of the benefits, and a defense report that omits benefits from the post-event stream overstates it. The <a href=\"/guides/collateral-source-rule-explained\">collateral source guide</a> explains why an employer-paid benefit is compensation and not a collateral payment.</p>",
      },
      {
        id: "records-to-gather",
        heading: "Records to gather",
        bodyHtml:
          "<p>Counsel can shorten the analysis by producing the benefit records early: the summary plan description and the most recent benefits statement; year-end pay stubs, which show the employer's premium share and the retirement match; retirement plan statements; the union contract or employee handbook that fixes the benefit package; and, for the post-event stream, the same documents from the new employer. Where the employer will not produce them, a subpoena for the plan documents is worth the effort, because the difference between a documented benefit figure and an estimated one is the difference between a figure that is examined on the merits and one that is attacked at the threshold. The <a href=\"/guides/how-lost-earnings-are-calculated\">lost earnings guide</a> places the benefit schedule among the others, and the <a href=\"/case-types/personal-injury/texas\">Texas personal injury page</a> shows how the schedule reads in one venue.</p>",
      },
    ],
    faqs: [
      {
        question: "Is health insurance valued at the premium or at the employer's share?",
        answer:
          "At the employer's share. The employee's share was already deducted from the wages in the earnings base, so counting it again would double the benefit. Where the pay stubs do not separate the two, the summary plan description or the employer's benefits statement usually does.",
      },
      {
        question: "What happens to the benefit claim when the plaintiff keeps working for the same employer?",
        answer:
          "The benefit loss is limited to whatever changed: fewer hours that reduced the retirement match, a move to a part-time class that lost health coverage, or a lower wage that lowered a percentage-based contribution. The report values the benefits on both sides from the same plan and shows the difference year by year.",
      },
      {
        question: "Are stock options and bonuses fringe benefits?",
        answer:
          "No. Bonuses and commissions are wages and belong in the earnings base, where the record decides whether they are carried forward. Stock options and other equity compensation are valued separately, from the grant documents and the vesting schedule, and are not run through the benefit percentage.",
      },
    ],
    sources: refsToSources(["BLS_ECEC", "BLS_ECI", "BLS_CPS"]),
    related: [
      { title: "Fringe Benefits Valuation", href: "/methods/fringe-benefits-valuation" },
      { title: "Lost Earnings and Earning Capacity Analysis", href: "/services/lost-earnings-and-earning-capacity" },
      { title: "Employment and Wage Loss Damages", href: "/services/employment-and-wage-loss-damages" },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
