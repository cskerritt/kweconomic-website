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
  {
    slug: "personal-consumption-in-wrongful-death",
    title: "Personal Consumption in a Wrongful Death Claim",
    metaTitle: "Personal Consumption in Wrongful Death",
    metaDescription: "In a wrongful death claim the economist deducts the share of income the decedent would have spent personally, read from expenditure tables by household size.",
    tldr:
      "A wrongful death claim compensates the survivors for the support they lost, not for everything the decedent would have earned, and part of every earner's income goes to the earner's own needs. The personal consumption deduction is the share of income the decedent would have spent on food, clothing, transportation, and the other costs of one person, removed from the projected earnings so that what remains is the support the household actually lost. This guide explains where the percentage comes from, what it is applied to, how it changes over the projection, and where opposing reports go wrong with it.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-09-14",
    dateModified: "2026-09-14",
    sections: [
      {
        id: "why-the-deduction-exists",
        heading: "Why the deduction exists",
        bodyHtml:
          "<p>A living earner spends part of every paycheck on himself or herself: the food eaten alone, the clothing worn, the share of the car and the phone and the insurance that served one person, the meals out and the hobbies. When that person dies, the survivors lose the income the decedent would have brought home, but they also stop bearing the cost of the decedent's own consumption, and a claim that ignored the second fact would compensate the household for money it never would have kept. The <a href=\"/services/wrongful-death-economic-loss\">wrongful death economic loss</a> analysis therefore measures support: the projected earnings less the share the decedent would have consumed personally.</p><p>The deduction is a feature of the survivors' claim, not of every death case. Where the governing framework measures the decedent's own lost earnings, as a survival action does for the period between injury and death, or measures the loss to the estate rather than to dependents, the deduction may not apply or may apply differently, and the <a href=\"/guides/wrongful-death-damages-explained\">wrongful death guide</a> describes how the two frameworks divide the components. Counsel confirms which measure governs; the economist builds the figure to that measure.</p>",
      },
      {
        id: "where-the-percentage-comes-from",
        heading: "Where the percentage comes from",
        bodyHtml:
          "<p>The percentage is not a guess and not a flat rule of thumb. Forensic economists read it from published personal consumption tables built on the household expenditure data the Bureau of Labor Statistics collects, which record how households of different sizes and income levels divide their spending among members. The tables report, for a household of a given size and income, the share of income a member would have consumed personally, and they distinguish the decedent's role, since an adult earner and a dependent child consume differently. The <a href=\"/methods/personal-consumption-tables\">personal consumption method</a> page describes the tables and the steps in detail.</p><p>Two patterns in the data explain most of what the tables say. The share falls as the household grows, because the same income supports more people and each member's personal slice is smaller. The share also falls as income rises, because a larger part of a high income is saved, spent on the home, or spent on the family as a whole rather than on one member's needs. A single earner with no dependents sits at the high end of the range; an earner in a large household with a modest income sits at the low end. The report names the table, the edition, and the row it read so the percentage can be checked.</p>",
      },
      {
        id: "what-it-is-applied-to",
        heading: "What the percentage is applied to",
        bodyHtml:
          "<p>The tables express consumption as a share of a defined income, and the report has to apply the percentage to the same definition. Some tables state consumption as a share of the decedent's own earnings; others state it as a share of the household's combined income, which matters when a surviving spouse also earned. Applying a household-basis percentage to the decedent's earnings alone, or the reverse, is the single most common error in the deduction, and it can move the figure by a wide margin in either direction. The report says which basis the table uses and shows the conversion where one is needed.</p><p>The deduction runs against earnings and the benefits that arrive as cash or as cash-equivalent, and it stops there. Household services are valued at the cost of replacing the work the decedent did for others, so the decedent's own share is already excluded by the way the hours are counted, and reducing that component again would deduct the same thing twice. Employer contributions to a retirement plan are a closer question: where the plan would have funded a pension the surviving spouse would have shared, the report treats the contribution as support, and where it would have funded the decedent's own retirement consumption, the deduction reaches it. The report states the treatment rather than leaving it implicit.</p>",
      },
      {
        id: "how-it-changes-over-time",
        heading: "How the percentage changes over the projection",
        bodyHtml:
          "<p>The household on the date of death is not the household of twenty years later. Children reach majority and leave, which makes the household smaller and the decedent's personal share larger; a spouse retires, which changes the income basis; and the decedent's own earnings grow, which moves the household along the income dimension of the table. A careful report applies the percentage year by year, changing it at the points where the household's composition would have changed, rather than fixing one figure on the date of death and carrying it across the whole horizon.</p><p>The horizon itself has two parts. Earnings, and the consumption deducted from them, run over the decedent's worklife expectancy, the years the decedent would have been working. Support to a surviving spouse from retirement income runs over the joint life expectancy of the two, and the consumption deduction applied to it reflects a two-person retired household. The <a href=\"/guides/how-worklife-expectancy-is-chosen\">worklife guide</a> explains the first horizon, and the current life tables supply the second.</p>",
      },
      {
        id: "what-the-record-supplies",
        heading: "What the record supplies",
        bodyHtml:
          "<p>The tables need three facts from the record: the household's size on the date of death, the ages of the dependents so the changes in size can be dated, and the household's income from all earners, which the tax returns establish. The family's own account of who lived in the household and who depended on the decedent fills in what the returns do not show. Where the household's spending was unusual in a way the record documents, for example a decedent who paid the costs of a dependent parent living elsewhere, or one whose employer covered the costs a table would count as personal, the report presents the table figure and explains the departure rather than substituting an undocumented percentage.</p><p>The state's framework also enters here. In a <a href=\"/case-types/wrongful-death/new-jersey\">New Jersey wrongful death claim</a>, for instance, the survivors' pecuniary loss is read to include the value of lost household services, advice, and guidance alongside support, and the report keeps the consumption deduction on the support component and away from the others. Counsel confirms which components the venue recognizes; the economist builds each on its own footing so the trier of fact can award them separately.</p>",
      },
      {
        id: "where-reports-go-wrong",
        heading: "Where opposing reports go wrong",
        bodyHtml:
          "<p>The recurring errors are a flat percentage with no table behind it; a percentage read from the right table but the wrong household size, usually because dependents were counted on one date and never updated; a basis mismatch between the table and the income the percentage was applied to; a deduction taken against household services or against a survivor's own earnings; and a projection with no deduction at all, which overstates the survivors' loss by the decedent's own share and is a reliable ground for challenge. Each is visible on the face of the report, and the <a href=\"/guides/how-to-rebut-an-economic-damages-report\">rebuttal guide</a> lists the questions that expose them.</p><p>Because the percentage scales the entire earnings figure, a difference of a few points moves the total materially, so a sound report shows the present value under the percentage it adopted and under the alternative the other side is likely to argue. That presentation lets the trier of fact see what the choice does to the number, and it lets counsel on either side test the choice against the record rather than against the economist's assertion. The <a href=\"/methods/present-value-and-discounting\">present value</a> page describes the schedule on which the alternatives are shown.</p>",
      },
    ],
    faqs: [
      {
        question: "Does the personal consumption deduction apply to a decedent's retirement income?",
        answer:
          "Where the claim includes support from retirement income to a surviving spouse, the deduction applies to that stream as well, read for a two-person retired household rather than for the household on the date of death. The report changes the percentage at the retirement date and carries the support over the joint life expectancy.",
      },
      {
        question: "What records fix the consumption percentage?",
        answer:
          "The tax returns, for the household's income and the number of earners; the family's account of who lived in the household and depended on the decedent, with the ages of the children; and the published table the percentage is read from. Receipts and bank statements are rarely needed unless the household's spending departed from the pattern the table assumes in a way the report has to explain.",
      },
      {
        question: "Can the percentage change during the projection?",
        answer:
          "It should. The household gets smaller as children reach majority and the income basis changes at retirement, and each change moves the row the table is read from. A report that fixes one percentage on the date of death and carries it across the whole horizon has ignored the changes the record already dates.",
      },
    ],
    sources: refsToSources(["BLS_CEX", "NCHS_LIFE_TABLES", "BLS_CPS"]),
    related: [
      { title: "Personal Consumption Deduction", href: "/methods/personal-consumption-tables" },
      { title: "Wrongful Death Economic Loss", href: "/services/wrongful-death-economic-loss" },
      { title: "Wrongful Death Damages Explained", href: "/guides/wrongful-death-damages-explained" },
    ],
  },
  {
    slug: "valuing-a-homemakers-services",
    title: "Valuing a Homemaker's Services in an Economic Damages Claim",
    metaTitle: "Valuing a Homemaker's Services",
    metaDescription: "A homemaker's lost services are valued at the cost of replacing the hours of household work, from time-use data and local wages, over the years it would run.",
    tldr:
      "A person whose work was the household rather than the labor market has an economic loss when an injury or a death ends that work, and the loss is measured the same way an employer's payroll is: by the hours of work removed and what it costs to replace them. The economist establishes the hours a homemaker spent on each category of household work from the family's account and published time-use data, prices each category at the local wage for the occupation that does that work, and carries the value over the years the work would have continued, adjusting as the household changes. This guide explains each step and the arguments that recur on both sides.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-09-14",
    dateModified: "2026-09-14",
    sections: [
      {
        id: "the-loss-is-real",
        heading: "Why a homemaker's loss is an economic loss",
        bodyHtml:
          "<p>A household runs on work. Meals are cooked, children are cared for and driven, the house is cleaned and repaired, the yard is kept, the bills are paid, the shopping is done, and the family's affairs are managed. When one member does most of that work full time, the household receives a stream of services that has a market value, because every one of those tasks is also sold by someone for a wage. An injury that ends the homemaker's ability to do the work, or a death that removes the homemaker from the household, imposes a cost the household did not bear before: the work is done by others who could have been doing something else, is bought from outside, or goes undone. The <a href=\"/services/household-services-valuation\">household services valuation</a> measures that cost.</p><p>The loss does not depend on a paycheck. A homemaker with no earnings history has no lost earnings claim, but the services claim stands on its own and is often the largest component of the household's economic loss. The <a href=\"/guides/household-services-in-personal-injury\">household services guide</a> describes the component in an injury case generally; this guide concerns the person for whom the household was the whole of the work.</p>",
      },
      {
        id: "counting-the-hours",
        heading: "Counting the hours",
        bodyHtml:
          "<p>The first input is the hours the homemaker spent on household work before the event, by category: meal preparation and cleanup, housekeeping and laundry, care of children or of an adult who needs it, shopping and errands, home and vehicle maintenance, yard work, household management, and travel connected to any of them. The family's own account supplies the household's pattern, and published time-use data supply the hours a person of the homemaker's sex, age, employment status, and household composition typically spends on each category. The two are read together: the survey figures keep the account within the range the data support, and the account explains where this household differed from the average and why.</p><p>A full-time homemaker's hours are high, and the time-use data confirm it, because a person who is not employed spends many more hours on the household than one who is. The report uses the row for a person who was not employed, not the row for the population as a whole, and it says so, because reading the wrong row understates the loss from the start. The <a href=\"/methods/household-services-methodology\">household services method</a> page sets out the categories and the survey the hours come from.</p>",
      },
      {
        id: "pricing-the-hours",
        heading: "Pricing the hours",
        bodyHtml:
          "<p>Each category is priced at what it costs to hire someone to do that work in the household's area: a cook's wage for meal preparation, a housekeeper's for cleaning and laundry, a childcare worker's for the care of children, a home health aide's for the care of an adult, a maintenance worker's for repairs, and so on. The wages come from the published occupational wage series for the metropolitan area or the state, and the report names the occupation and the series it used for each category. This is the replacement cost approach, and it values the work at what the household would have to pay to receive it, not at what the homemaker might have earned in some other job.</p><p>The alternative approach, valuing the hours at the wage the homemaker gave up by staying home, is sometimes argued for a person with a professional history, and it can produce a larger or a smaller figure. The economist can present it where the record supports a specific foregone wage, but the replacement cost figure is the one that measures what the household lost, and the report keeps the two apart. A generalist wage, a single blended rate for all categories, is a simpler alternative the report can show for comparison; it understates the categories that command a skilled wage and overstates the routine ones.</p>",
      },
      {
        id: "after-the-event",
        heading: "What changes after the event",
        bodyHtml:
          "<p>In a death case the entire stream is lost, and the question is how long it would have run. In an injury case the homemaker may still do some of the work, and the loss is the difference between the pre-event hours and what the person can now do, category by category. The medical evidence describes the physical and cognitive limits; the economist applies them to the categories, since a back injury may end yard work and heavy cleaning while leaving meal planning and household management intact. A person who can do a task slowly, or with help, or only on good days has a partial loss in that category, and the report states the reduction it applied and where the figure came from.</p><p>The <a href=\"/methods/mitigation-and-offsets\">mitigation and offsets</a> page describes how the post-event hours are treated. What the household has actually paid for help since the event is evidence of the loss and of the going rate, but it is not the ceiling, because a household that has gone without help has lost the services all the same.</p>",
      },
      {
        id: "the-horizon-and-the-household",
        heading: "The horizon and the changing household",
        bodyHtml:
          "<p>Household work does not stop at a retirement age, so the horizon is life expectancy from the current life tables rather than a worklife horizon, reduced in the later years by the decline in hours that the time-use data show for older people. The hours also change with the household. Childcare hours fall as children grow and end when they leave; the hours of a person caring for an aging parent end with the parent; a couple's housekeeping hours in an empty house are fewer than a family's. The report dates each change from the ages in the record and applies the hours that fit each period rather than freezing the household on the date of the event.</p><p>The value is then carried year by year, grown at the rate the replacement wages are expected to grow, and reduced to present value at a rate tied to low-risk yields, so the same conventions govern this component as the earnings component. The <a href=\"/methods/present-value-and-discounting\">present value</a> page explains the discounting, and a <a href=\"/case-types/wrongful-death/texas\">Texas wrongful death page</a> shows how the component sits inside a survivors' claim in one venue.</p>",
      },
      {
        id: "recurring-arguments",
        heading: "The arguments that recur",
        bodyHtml:
          "<p>Defense reports commonly argue that the hours are overstated, that the household has adapted so the work is being done, that the family has not hired anyone, or that a general laborer's wage should price every category. Plaintiff reports commonly overstate the hours by counting time the homemaker spent on personal activities, price routine tasks at a skilled wage, or run childcare hours past the age at which children need care. The reply to each is the same: the hours come from the family's account checked against the survey data for a person in the homemaker's circumstances, the categories are priced at the occupation that does the work, and the horizon follows the household as the record dates it. A report built that way can show the figure under the other side's assumptions as well as its own, which is the most persuasive answer to any of the arguments. The <a href=\"/guides/how-to-rebut-an-economic-damages-report\">rebuttal guide</a> collects the questions.</p>",
      },
    ],
    faqs: [
      {
        question: "Is a homemaker's loss measured by what the person could have earned in a job?",
        answer:
          "Not as the primary measure. The household lost services, and the services are valued at what it costs to replace them, category by category, from local wage data for the occupations that do the work. A foregone professional wage can be presented alongside where the record supports it, but it measures a different thing and the report keeps the two apart.",
      },
      {
        question: "Do the childcare hours run for the whole horizon?",
        answer:
          "No. Childcare hours are dated to the ages of the children in the record and fall as each child grows, ending when the youngest reaches the age at which the time-use data show the care ending. The other categories continue over life expectancy and taper in the later years.",
      },
      {
        question: "Why does the report use the time-use row for a person who was not employed?",
        answer:
          "Because the hours a person spends on the household depend heavily on whether that person also holds a job, and the survey reports the two groups separately. A full-time homemaker's hours are read from the row for a person who was not employed; reading the population average would understate the loss before any other question was reached.",
      },
    ],
    sources: refsToSources(["BLS_ATUS", "BLS_OES", "NCHS_LIFE_TABLES"]),
    related: [
      { title: "Household Services Methodology", href: "/methods/household-services-methodology" },
      { title: "Household Services Valuation", href: "/services/household-services-valuation" },
      { title: "Household Services in Personal Injury", href: "/guides/household-services-in-personal-injury" },
    ],
  },
  {
    slug: "mitigation-in-employment-cases",
    title: "Mitigation in Employment Cases: How the Economist Measures It",
    metaTitle: "Mitigation in Employment Cases",
    metaDescription: "In an employment claim the economist nets what the employee earned or could have earned after the termination against the pay lost, and shows each version.",
    tldr:
      "Mitigation in an employment case is the principle that a terminated or demoted employee's damages are reduced by what the employee earned, or with reasonable effort could have earned, after the adverse action. Whether the employee's efforts were reasonable is a question for the trier of fact; what the interim earnings were, what comparable work paid, and how the answer changes the loss are questions for the economist. This guide explains which earnings are netted, how a lower-paying or self-employed replacement is handled, what the defense's failure-to-mitigate argument looks like in numbers, and how the report presents the loss under each version so counsel on either side can argue the facts.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-09-21",
    dateModified: "2026-09-21",
    sections: [
      {
        id: "what-mitigation-means-here",
        heading: "What mitigation means in an employment claim",
        bodyHtml:
          "<p>An employee who loses a job is expected to look for another one, and the damages for the lost job are measured net of what the search produced or should have produced. The principle divides into two questions that different people answer. Whether the employee made reasonable efforts, whether a particular position was comparable enough that turning it down was unreasonable, and who bears the burden of proving either point are legal questions for counsel and the trier of fact, and the answers differ by venue and by the statute the claim is brought under. What the employee actually earned after the termination, what the positions the parties point to actually paid, and what the loss is under each answer are economic questions, and the <a href=\"/services/employment-and-wage-loss-damages\">employment and wage loss damages</a> analysis answers them without taking a side on the legal ones.</p><p>The economist's discipline is to keep the two apart on the page. The report never states that the employee mitigated or failed to; it states the interim earnings the records show, the earnings the alternative positions would have produced, and the back pay and front pay figures under each, so that whichever finding the trier of fact makes, the number that follows from it is already on the schedule. The <a href=\"/methods/mitigation-and-offsets\">mitigation and offsets</a> method page describes the general mechanics; this guide concerns the employment setting, where the offset is usually the largest single deduction in the claim.</p>",
      },
      {
        id: "which-earnings-are-netted",
        heading: "Which earnings are netted",
        bodyHtml:
          "<p>The offset is earnings from replacement employment: the wages, bonuses, and benefits of the jobs the employee held after the termination, taken from the pay records and tax returns for each year of the loss period and matched year by year against the pay of the position lost. Earnings the employee would have had anyway, such as a second job held before the termination and continued afterward, are not an offset, because they do not replace the lost pay; the report identifies them and leaves them out. Earnings from a job the employee took only because the lost position was gone are the offset the principle contemplates, and they are deducted in full.</p><p>Some receipts are not earnings and are handled separately. Unemployment compensation, severance, and benefits paid under a plan are treated differently from venue to venue and statute to statute, and whether each reduces the award is a legal question the economist does not decide. The report lists each receipt on its own line with its dates and amounts so counsel can apply the rule that governs, and the <a href=\"/guides/collateral-source-rule-explained\">collateral source guide</a> explains why the answer is not the economist's to give.</p>",
      },
      {
        id: "lower-paying-and-self-employed-work",
        heading: "Lower-paying and self-employed replacement work",
        bodyHtml:
          "<p>A replacement job that pays less than the position lost does not end the claim; it reduces it. The loss in each year is the pay of the lost position less the pay of the replacement, and the gap may narrow as the employee gains seniority in the new job or widen as the raises the old position would have carried outpace the new one. The report projects both streams on their own growth paths, from the old employer's pay scale and the new employer's, and the difference is the continuing loss. A job that pays more than the lost position ends the loss in the year the crossover occurs, and the report shows the year.</p><p>An employee who went into business rather than back to work presents a harder measurement. The business's net income is the offset, but only after the owner's labor has been separated from the return on the money and equipment put into it, and only after start-up losses in the early years have been treated consistently with the rest of the schedule. The <a href=\"/insights/what-tax-returns-add-to-a-lost-earnings-claim\">tax returns post</a> describes how the business schedule is read; the report states whether the early losses were counted against the interim earnings and why.</p>",
      },
      {
        id: "the-failure-to-mitigate-argument",
        heading: "The failure-to-mitigate argument in numbers",
        bodyHtml:
          "<p>A defense that the employee did not look hard enough, or turned down comparable work, is an argument about what the interim earnings should have been rather than what they were. In most frameworks the employer carries the burden of showing that comparable positions were available and that the employee did not reasonably pursue them, and the argument arrives with evidence: postings, offers, or the wages of the occupation in the local labor market. The economist's task is to turn that evidence into an alternative interim earnings stream, from the wages the positions actually paid, and to compute the back pay and front pay that result. The report then shows the loss under the actual interim earnings and under the constructive ones, and the trier of fact chooses between them.</p><p>The constructive stream has a start date as well as a wage. An argument that comparable work was available is an argument about when the employee could have started it, and the loss between the termination and that date is unaffected by the argument. The report dates the constructive stream from the evidence, applies the wages the record supports, and grows it on the same terms as the actual one, so the only difference between the two schedules is the point in dispute.</p>",
      },
      {
        id: "benefits-during-the-gap",
        heading: "Benefits during the gap",
        bodyHtml:
          "<p>The lost position carried benefits, and the replacement job may carry fewer or none. Health coverage is the usual gap: an employee who paid for continuation coverage or bought a policy has a documented cost, and one who went without has lost a benefit whose value the employer's cost data establish. Retirement contributions the old employer would have made, and the vesting or accrual the termination interrupted, are a loss even where the replacement job has a plan of its own, because the two are netted, not ignored. The <a href=\"/methods/fringe-benefits-valuation\">fringe benefits valuation</a> page sets out how each benefit is priced; in the employment setting the point is that the benefit side of the lost position and the benefit side of the replacement are netted with the same care as the wages.</p>",
      },
      {
        id: "on-the-schedule",
        heading: "How the schedule presents it",
        bodyHtml:
          "<p>The back pay schedule runs year by year from the termination to the date of trial, with the lost position's pay and benefits in one column, the interim earnings and benefits in the next, and the difference in the third, in the dollars of each year. The front pay schedule continues from the trial date over the period the record supports, with both streams projected and the difference discounted to present value, and the <a href=\"/compare/back-pay-vs-front-pay\">back pay versus front pay</a> comparison explains the divide. Where the failure-to-mitigate argument is live, a second pair of schedules substitutes the constructive interim earnings, and a summary page shows the four totals side by side. Counsel in a <a href=\"/case-types/wrongful-termination/new-york\">New York wrongful termination matter</a>, or in any venue, can then argue the legal question with the economic consequence of each answer already in evidence.</p><p>Opposing reports go wrong in predictable ways: an offset that includes earnings the employee would have had anyway, a replacement stream frozen at its starting wage while the lost position's stream grows, a constructive earnings figure with no start date, unemployment compensation deducted in a venue that does not allow it, and a benefit gap ignored because the replacement job had a plan. Each is visible on the schedule, and the <a href=\"/guides/how-to-rebut-an-economic-damages-report\">rebuttal guide</a> lists the questions that expose them.</p>",
      },
    ],
    faqs: [
      {
        question: "Are unemployment benefits deducted from an employment award?",
        answer:
          "That depends on the venue and the statute, and the economist does not decide it. The report lists the unemployment compensation received, with dates and amounts, on its own line, so counsel can apply the governing rule and the trier of fact can see the figure with and without the deduction.",
      },
      {
        question: "Does a lower-paying replacement job end the back pay claim?",
        answer:
          "No. It reduces the loss to the difference between the two positions in each year. The report projects the lost position's pay and the replacement's pay on their own growth paths, and the loss continues until the replacement catches up, which the schedule shows as the crossover year, or until the period the framework allows has run.",
      },
      {
        question: "What does the economist do with a claim that the employee stopped looking for work?",
        answer:
          "The economist builds a second interim earnings stream from the wages of the work the employer says was available, dated from when the evidence says it could have started, and computes the loss under that stream beside the loss under the actual earnings. Whether the employee's search was reasonable is left to the trier of fact.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_OES", "BLS_ECEC"]),
    related: [
      { title: "Employment and Wage Loss Damages", href: "/services/employment-and-wage-loss-damages" },
      { title: "Mitigation and Offsets", href: "/methods/mitigation-and-offsets" },
      { title: "Back Pay vs. Front Pay", href: "/compare/back-pay-vs-front-pay" },
    ],
  },
  {
    slug: "front-pay-vs-reinstatement",
    title: "Front Pay vs. Reinstatement: What the Economist Calculates",
    metaTitle: "Front Pay vs. Reinstatement",
    metaDescription: "Reinstatement restores the position and ends most of the future loss; front pay replaces it with a discounted projection over the period the record supports.",
    tldr:
      "When an employee wins an employment claim, the future loss can be remedied by putting the employee back in the position, by ordering front pay in its place, or by neither. Reinstatement ends the future wage loss on the day it takes effect but can leave a residual loss in seniority, pension accrual, and the gap before the return. Front pay is the discounted difference between the position lost and the employee's expected earnings without it, over a period the court fixes from the evidence. The choice between them belongs to the court; the economist's job is to calculate what each is worth so the choice is made with the numbers in view. This guide explains the inputs to the front pay figure, the residual loss that survives reinstatement, and how the report presents both.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-09-21",
    dateModified: "2026-09-21",
    sections: [
      {
        id: "two-remedies-for-one-loss",
        heading: "Two remedies for the same future loss",
        bodyHtml:
          "<p>Back pay compensates the loss up to the trial; the loss after the trial is remedied in one of two ways. Reinstatement returns the employee to the position, or to one equivalent to it, and from that day the employee earns the pay the claim was built on, so the future wage loss ends. Front pay is the substitute ordered where reinstatement is not workable: the position has been eliminated, the relationship between the parties has broken down, or the employee has moved on and a return would be impractical. It is the projected difference between what the position would have paid and what the employee will earn without it, over a stated period, reduced to present value. The <a href=\"/compare/back-pay-vs-front-pay\">back pay versus front pay</a> comparison sets the two halves of the claim side by side; this guide concerns the choice between the two future remedies and what each is worth.</p><p>In most frameworks that choice is the court's, made as a matter of equity rather than by the jury, and the <a href=\"/services/employment-and-wage-loss-damages\">employment and wage loss damages</a> analysis supplies the figures for both so the court can weigh them. The economist does not recommend one remedy over the other; the report shows the value of each on the record's facts.</p>",
      },
      {
        id: "the-front-pay-inputs",
        heading: "What goes into the front pay figure",
        bodyHtml:
          "<p>Front pay is built from four inputs. The first is the pay of the position lost, projected forward from the employer's own pay scale, with the raises, step increases, and bonuses the record shows the employee would have received. The second is the pay of the position the employee holds or can be expected to hold instead, projected on its own path from the new employer's records or, where the employee has not yet found work, from the wages of the occupation in the local labor market. The third is the benefits on each side, netted as the <a href=\"/methods/fringe-benefits-valuation\">fringe benefits</a> page describes. The fourth is the period over which the difference runs, and it is the input that decides the size of the figure.</p><p>The period is not the employee's remaining worklife by default. It is the time the record shows the employee will need to reach earnings comparable to the position lost: a matter of a few years for a younger employee in an occupation with an active market, longer for an older employee in a specialized field, and potentially the full <a href=\"/methods/worklife-expectancy\">worklife horizon</a> where the evidence shows the gap will never close. The report presents the figure under each period the parties advance, with the year-by-year schedule behind each, and states the horizon beyond which the projection has no support in the record.</p>",
      },
      {
        id: "what-reinstatement-leaves",
        heading: "The loss that survives reinstatement",
        bodyHtml:
          "<p>Reinstatement is often described as ending the future loss, and for wages it does. Three components can survive it. The first is the gap between the judgment and the day the employee actually returns, which is measured like back pay in the dollars of the period. The second is seniority: an employee returned to the position without the seniority the intervening years would have carried may face a lower place in a layoff order, a slower path to the next step, or a smaller share of overtime, and where the framework does not restore seniority the difference is a continuing loss the report projects. The third is retirement: contributions the employer did not make and years of service that did not accrue reduce the pension or the account balance at retirement, and even where the employee is returned to the plan, the missed years are a loss unless the order restores them.</p><p>The report values each residual separately, so that a reinstatement order that restores seniority and plan service leaves only the return gap, while one that does not leaves all three. Counsel drafting the terms of a proposed order can see what each term is worth, which is the practical reason to have the calculation in hand before the remedy is argued.</p>",
      },
      {
        id: "when-the-employee-has-moved-on",
        heading: "When the employee has moved on",
        bodyHtml:
          "<p>An employee who has found comparable work, relocated, or retrained is unlikely to be reinstated and may not want to be, and the front pay calculation then turns on the new position. Where the new job pays as much as the old one, front pay is small or nil and the report says so; where it pays less, the schedule projects the gap and its closing. Where the employee left the labor force after the termination, the report addresses the question the framework asks, which is whether the departure was caused by the termination or chosen independently, by showing the front pay figure under each answer. The <a href=\"/guides/mitigation-in-employment-cases\">mitigation guide</a> explains how the replacement earnings are established, and the same records drive the front pay projection.</p>",
      },
      {
        id: "presenting-both",
        heading: "Presenting both remedies",
        bodyHtml:
          "<p>The report carries a front pay schedule under each period the parties advance and a reinstatement schedule showing the residual components, with a summary that puts the totals on one page. The present value of the front pay figures is taken at the judgment date at a rate tied to low-risk yields, as the <a href=\"/methods/present-value-and-discounting\">present value</a> page describes, and the reinstatement residuals are discounted the same way where they run into the future. A court weighing the remedies in an <a href=\"/case-types/employment-discrimination/illinois\">Illinois employment discrimination matter</a>, or in any venue, then has the cost of each option in comparable terms.</p><p>The recurring errors on the front pay side are a period equal to the remaining worklife with no evidence that the gap would persist that long, a replacement stream that never grows, benefits ignored on the replacement side, and a figure that is not discounted. On the reinstatement side the error is the assumption that the loss ends entirely on the day of return, with the seniority and pension residuals left out. The <a href=\"/guides/how-to-rebut-an-economic-damages-report\">rebuttal guide</a> lists the questions that test each.</p>",
      },
    ],
    faqs: [
      {
        question: "Is there any economic loss left after an employee is reinstated?",
        answer:
          "Often some. The wage loss ends on the day of return, but the gap between the judgment and that day, any seniority the intervening years would have carried, and the retirement contributions and years of service that were missed can each remain unless the order restores them. The report values each on its own line so the terms of the order can address them.",
      },
      {
        question: "Does front pay run to retirement age?",
        answer:
          "Only where the evidence shows the gap between the lost position and the employee's alternative would never close. The period is the time the record supports for reaching comparable earnings, and the report presents the figure under each period the parties advance, with the worklife horizon as the outer limit rather than the default.",
      },
      {
        question: "How does a pension change the front pay and reinstatement figures?",
        answer:
          "On the front pay side the lost contributions or accruals are projected over the period and netted against any plan the replacement job provides. On the reinstatement side the missed years of service are a residual loss unless the order restores them, valued as the difference in the benefit at retirement, and the report shows the figure both ways.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_ECEC", "TREASURY_YIELD"]),
    related: [
      { title: "Employment and Wage Loss Damages", href: "/services/employment-and-wage-loss-damages" },
      { title: "Back Pay vs. Front Pay", href: "/compare/back-pay-vs-front-pay" },
      { title: "Mitigation in Employment Cases", href: "/guides/mitigation-in-employment-cases" },
    ],
  },
  {
    slug: "lost-profits-for-a-new-business",
    title: "Lost Profits for a New Business: How the Claim Is Built",
    metaTitle: "Lost Profits for a New Business",
    metaDescription: "A new business has no track record, so its lost profits are proven from contracts, comparable firms, and early results; here is how the economist builds them.",
    tldr:
      "A new or unestablished business can claim lost profits, but it cannot prove them from its own past results, because it has few or none. The economist builds the but-for projection from other evidence: signed contracts and orders, the early-year performance of comparable businesses, industry data for the market the business was entering, the financing the venture attracted and the terms it was offered on, and whatever operating history the business accumulated before or after the event. This guide explains which of those sources carry weight, how the projection is shaped for a business that had not reached steady state, how the risk of failure and the discount rate are handled together, when the right measure is the value of the venture rather than a stream of profits, and where opposing reports on new-business claims go wrong.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-09-28",
    dateModified: "2026-09-28",
    sections: [
      {
        id: "why-a-new-business-is-different",
        heading: "Why a new business is treated differently",
        bodyHtml:
          "<p>The ordinary lost profits analysis starts with the business's own history: the revenue and margins of the years before the wrongful act are the base from which the but-for projection is built, and the departure of actual results from that base is the loss. A business that opened months before the event, or that never opened at all, has no such base. Older frameworks treated the profits of an unestablished business as too speculative to recover at all; most now ask instead whether the profits can be shown with reasonable certainty from the evidence available, which turns the question from a bar into a matter of proof. Whether the proof meets the standard is a question for the court; what proof exists, what it supports, and what number follows from it are the questions the <a href=\"/services/lost-profits-and-commercial-damages\">lost profits and commercial damages</a> analysis answers.</p><p>The economist's method does not change. The <a href=\"/methods/lost-profits-but-for-analysis\">but-for analysis</a> still projects what the business would have earned, compares it with what it did earn, nets the costs avoided and the profits recovered by mitigating, and discounts any future portion to present value. What changes is where the inputs come from. Every figure that an established business would supply from its own ledger has to be drawn from a source outside it, and the report has to say which source, why it is comparable, and what it does not capture.</p>",
      },
      {
        id: "evidence-that-carries-weight",
        heading: "The evidence that carries weight",
        bodyHtml:
          "<p>The sources are not equal, and the report ranks them. Contracts, purchase orders, and signed leases with stated prices, quantities, and terms are the strongest evidence of revenue the business would have earned, because a counterparty had already committed to them; a letter of intent or a sales pipeline is weaker, and the report says how far it was from a binding commitment. Whatever operating history the business did accumulate, whether the months before the event or the period afterward if it survived, is the next source, and a business that reached its projected volume after a delay has itself proven what the projection assumed. Comparable businesses supply the yardstick: firms in the same line, of similar size, serving a similar market, whose early years show the ramp a new entrant in that trade actually experiences. Industry data on margins, turnover, and survival fill in what the comparables leave out.</p><p>The business plan and the financing sit last, and for different reasons. The plan's projections are the owner's expectations before the event and are useful as a statement of what the business intended to do, its capacity, and its cost structure, but they are not proof of what it would have earned, and a report that adopts them as the projection has assumed its conclusion. The financing is different: the amount lenders and investors put in, the terms they demanded, and the diligence they performed show what informed outsiders believed the venture was worth at the time, and the report uses those terms as a check on the projection rather than as its source. The <a href=\"/insights/what-tax-returns-add-to-a-lost-earnings-claim\">tax returns post</a> describes how a business's own filings are read where they exist.</p>",
      },
      {
        id: "building-the-projection",
        heading: "Building the projection without a track record",
        bodyHtml:
          "<p>A new business does not open at steady state, and the projection should not either. Revenue follows a ramp: the first months run below capacity while customers are found, staff are trained, and the operation settles, and the slope of the ramp comes from the early years of the comparable businesses, not from the plan's target. A projection that starts at the mature volume the plan hoped for overstates the loss by the whole difference between the ramp and the plateau, and it is the first thing an opposing economist looks for. Capacity caps the top of the ramp: the revenue cannot exceed what the location, the equipment, the staff, and the hours could produce, and the report states the constraint and the figure it implies.</p><p>Costs are built the same way. Fixed costs come from the leases, the loans, the insurance, and the contracts the business had signed; variable costs come from the industry margins and from whatever invoices the business incurred; and an owner who would have worked in the business is charged a market salary before any profit is counted, because the return to the owner's labor is not a profit of the business. The result is a year-by-year schedule of but-for revenue, costs, and net profit for the loss period, with each line tied to its source, so that a <a href=\"/case-types/commercial-contract-dispute\">contract dispute</a> over a supplier's breach or a landlord's default can be argued on the inputs rather than on whether a projection was possible at all.</p>",
      },
      {
        id: "risk-and-the-discount-rate",
        heading: "Risk, survival, and the discount rate",
        bodyHtml:
          "<p>An established business has already survived its early years; a new one has not, and the projection must reckon with the possibility that it would have failed for reasons unconnected to the wrongful act. There are two accepted ways to do it. The first weights each year's projected profit by the probability that a business of that age in that industry is still operating, drawn from published data on business survival, so the projection carries the risk in its expected values. The second discounts the unweighted profits at a rate high enough to reflect the risk of the venture, drawn from the returns investors require of businesses at that stage. Either is defensible; using both counts the risk twice, and using neither ignores it, and the report states which it adopted and why.</p><p>Past losses are stated in the dollars of each year and, where the venue allows, carry interest to the judgment date; future losses are reduced to present value at the judgment date as the <a href=\"/methods/present-value-and-discounting\">present value</a> page describes, at a rate that reflects the risk of the profits themselves rather than the risk-free rate a wage stream would carry. The loss period runs from the date the business would have opened or reached the interrupted milestone to the date it recovered or, where it never did, to the point where the evidence for the projection runs out, and the report says where that point is rather than projecting to a horizon no comparable supports.</p>",
      },
      {
        id: "when-the-business-never-opened",
        heading: "When the business never opened or did not survive",
        bodyHtml:
          "<p>A business that was prevented from opening, or that was destroyed before it could establish itself, presents a choice of measure. Lost profits describe a period of earnings that ended when the business recovered; a business with no recovery has no end to the period except the one the evidence imposes, and the more natural measure is often the value the venture would have had, which captures every future profit in a single figure at a single date. The <a href=\"/guides/lost-profits-vs-lost-business-value\">lost profits versus lost business value</a> guide works through the choice, and the <a href=\"/compare/lost-profits-vs-diminished-business-value\">diminished value comparison</a> draws the line where a business survived but was impaired. For a venture with no results to capitalize, the value rests on the same evidence the profits would have: the contracts, the comparables, and the terms of the financing, which are direct evidence of what investors paid for a share of the venture before the event.</p><p>Counsel sometimes frames the claim instead as the money spent in reliance on the contract or the venture: the build-out, the deposits, the inventory, the salaries paid before opening. That measure needs no projection, only the records of the expenditures and a showing that they were wasted, and the report can present it beside the lost profits or lost value figure so that a court in a <a href=\"/case-types/commercial-contract-dispute/texas\">Texas contract dispute</a>, or in any venue, can see what each theory is worth on the same record. The economist does not choose the theory; the report shows the number each one produces and the evidence each one rests on.</p>",
      },
      {
        id: "where-reports-go-wrong",
        heading: "Where new-business reports go wrong",
        bodyHtml:
          "<p>The recurring errors are visible on the schedule. A projection that begins at mature volume with no ramp. Revenue taken from the strongest comparable and costs taken from the plan, so the margin exceeds anything the industry shows. No salary for the owner's labor. A survival adjustment and a venture-level discount rate applied together, or neither applied at all. Comparables selected for their results rather than their similarity in size, market, and timing. A plan projection presented as evidence of what would have happened, when it is evidence only of what was intended. A loss period that runs to a distant horizon on the strength of a projection whose comparables cover a few years. Each of these is a question of inputs, not of whether the claim is possible, and each can be tested against the documents.</p><p>On the defense side the error runs the other way: a report that dismisses the claim as speculative without engaging the contracts and the comparables the plaintiff produced has left the projection unanswered rather than rebutted. The <a href=\"/guides/how-to-rebut-an-economic-damages-report\">rebuttal guide</a> lists the questions that expose the plaintiff-side errors, and the <a href=\"/services/expert-rebuttal-and-report-review\">report review</a> service describes how an opposing new-business projection is tested input by input.</p>",
      },
    ],
    faqs: [
      {
        question: "What evidence proves lost profits when the business has no operating history?",
        answer:
          "Contracts and purchase orders with stated terms, the early-year results of comparable businesses in the same line and market, industry data on margins and survival, and the terms on which lenders and investors financed the venture. The business plan's own projections are the owner's expectations and are tested against those sources rather than treated as proof.",
      },
      {
        question: "Does the projection for a new business begin at full capacity?",
        answer:
          "No. New businesses build volume over a ramp while customers are found and the operation settles, and the projection follows the ramp the comparable businesses show in their early years, capped by what the location, staff, and equipment could produce. Starting the projection at the plan's mature target overstates the loss by the difference between the ramp and the plateau.",
      },
      {
        question: "How does the report account for the chance the venture would have failed anyway?",
        answer:
          "By one of two methods, never both. The projected profits are weighted by the published survival rate for businesses of that age and industry, or they are discounted at a rate that carries the risk investors require of a venture at that stage. The report names the method it adopted, and a report that applies both has counted the risk twice.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "TREASURY_YIELD"]),
    related: [
      { title: "Lost Profits and Commercial Damages", href: "/services/lost-profits-and-commercial-damages" },
      { title: "Lost Profits But-For Analysis", href: "/methods/lost-profits-but-for-analysis" },
      { title: "Lost Profits vs. Lost Business Value", href: "/guides/lost-profits-vs-lost-business-value" },
    ],
  },
  {
    slug: "goodwill-in-a-divorce-valuation",
    title: "Goodwill in a Divorce Valuation: Enterprise and Personal",
    metaTitle: "Goodwill in a Divorce Valuation",
    metaDescription: "In a divorce, a business's goodwill is split between the enterprise and the owner, and that split can move the marital estate more than any other input.",
    tldr:
      "Goodwill is the part of a business's value that exceeds the value of its identifiable tangible and intangible assets, and in a divorce involving a closely held business it is often the largest and most contested component of the marital estate. Most frameworks divide it into enterprise goodwill, which belongs to the business and would transfer to a buyer, and personal goodwill, which attaches to the owner's skill, reputation, and relationships and in many states is not divisible property. Which rule applies is a legal question for counsel and the court; measuring the total goodwill, allocating it between the two kinds on evidence rather than assertion, and keeping the allocation consistent with the income used for support are the economist's tasks. This guide explains how each is done and where opposing valuations diverge.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-09-28",
    dateModified: "2026-09-28",
    sections: [
      {
        id: "what-goodwill-is",
        heading: "What goodwill is and how it is measured",
        bodyHtml:
          "<p>A business is worth what its future cash flows are worth to an owner, and that figure usually exceeds what its equipment, receivables, inventory, and identifiable intangibles such as patents or leases would fetch on their own. The excess is goodwill: the value of the business as a going concern, with its customers, its reputation, its workforce, and its systems in place. It is not measured directly. The economist values the enterprise under the <a href=\"/methods/business-valuation-approaches\">income or market approach</a>, subtracts the value of the net tangible assets and any identifiable intangibles, and the residual is the goodwill. The size of that residual depends on every input to the enterprise valuation, which is why the normalization of the owner's compensation and the choice of capitalization rate matter before the goodwill question is even reached.</p><p>In a <a href=\"/services/divorce-and-marital-financial-analysis\">divorce and marital financial analysis</a> the goodwill matters because the marital estate includes the business, or the marital share of it, at a value the court fixes, and the goodwill can be the larger part of that value for a service business or a professional practice with few hard assets. The <a href=\"/services/business-valuation\">business valuation</a> service page describes the valuation as a whole; this guide concerns the one component that the domestic relations framework treats differently from every other.</p>",
      },
      {
        id: "enterprise-vs-personal",
        heading: "Enterprise goodwill and personal goodwill",
        bodyHtml:
          "<p>Enterprise goodwill is the part that would stay with the business if the owner walked away: the location, the trade name, the trained staff, the operating systems, the contracts, and the customers who come to the business rather than to the person. Personal goodwill is the part that would leave with the owner: the reputation, the licensed skill, the referral relationships, and the client loyalty that attach to the individual and cannot be sold to anyone else without the individual's continued involvement. A buyer of the business would pay for the first; for the second, a buyer would pay only if the owner agreed to stay on or to stay out of competition, which is the practical test the allocation turns on.</p><p>States differ on what follows. Some treat all goodwill as marital property and divide it; some exclude personal goodwill as an attribute of the person rather than an asset of the marriage; some draw the line at whether the goodwill could be sold. The <a href=\"/guides/business-valuation-in-litigation\">business valuation in litigation</a> guide covers the standards of value the frameworks adopt. The valuator does not pick the rule. The report measures the total goodwill, states the allocation between enterprise and personal with the evidence for it, and presents the marital value under the rule counsel identifies, with the alternative shown where the rule is unsettled.</p>",
      },
      {
        id: "allocating-on-evidence",
        heading: "How the allocation is made on evidence",
        bodyHtml:
          "<p>An allocation stated as a percentage with nothing behind it is the weakest part of most goodwill opinions and the first target of the other side. The evidence that supports an allocation is specific. Revenue by producer shows how much of the business's income the owner personally generates against what the other professionals or the staff generate. Referral source records show whether the work comes to the firm through institutional channels or through the owner's personal relationships. Customer tenure and concentration show whether the business would keep its clients through a change of ownership. The owner's hours, the extent to which the owner is the face of the business, and whether the business has a trade name distinct from the owner's all bear on it.</p><p>Two methods put a number on the split. The first values the business twice, once with the owner in place and once as it would operate with a hired manager or professional at market compensation, and the difference is the personal goodwill; the replacement salary is the input that drives it, and it is drawn from the published wage data for the position rather than assumed. The second looks to what a buyer would pay for the owner's covenant not to compete in a sale of the business, from comparable transactions that allocate the price between the enterprise and the covenant, because the covenant is the price of the goodwill that would otherwise walk. The <a href=\"/guides/income-determination-in-divorce\">income determination guide</a> explains the normalization of owner compensation that both methods depend on.</p>",
      },
      {
        id: "professional-practices",
        heading: "Professional practices and owner-operated businesses",
        bodyHtml:
          "<p>The allocation runs to extremes in the settings that produce the most disputes. A solo professional practice with no associates, no trade name, and clients who followed the owner from a prior firm has goodwill that is largely personal, and the enterprise component may be no more than the value of an established location and a trained staff. A multi-owner firm with institutional referral sources, a firm name, and clients who are served by whoever is assigned has goodwill that is largely enterprise, and an individual partner's reputation is a small part of it. Most businesses fall between, and the evidence in the section above decides where.</p><p>A buy-sell or partnership agreement that fixes a price for a departing owner's interest is evidence of value but in many states does not bind the court in a divorce, because the spouse was not a party to it and the formula was written for a different purpose. Industry rules of thumb that price a practice at a multiple of revenue are a check on the result, not a method, and a report that rests the goodwill on one has not measured it. A court weighing a practice valuation in a <a href=\"/case-types/divorce-and-marital-dissolution/florida\">Florida dissolution</a>, or in any venue, is better served by a valuation that shows the allocation evidence and states the rule applied than by one that adopts an industry multiple and a customary percentage.</p>",
      },
      {
        id: "the-double-dip",
        heading: "Goodwill and the support calculation",
        bodyHtml:
          "<p>The same earnings can appear twice in a divorce. If the business is valued by capitalizing the income the owner earns above a market salary, and the owner's full income including that excess is then used to set support, the excess earnings have been divided once as property and paid again as support. Frameworks differ on whether that is permissible, whether it is a double count only for personal goodwill, and how it is cured, and the answer is counsel's. The economist's contribution is consistency: the market compensation deducted in the valuation and the income attributed to the owner for support are built from the same normalization, and the report states plainly which dollars are in the value, which are in the income, and where the two overlap, so the court can apply its rule to a figure it can see.</p><p>The <a href=\"/case-types/divorce-and-marital-dissolution\">divorce and marital dissolution</a> case-type page describes the analysis as a whole, from the valuation through the income determination, and the reason the two are prepared together is exactly this overlap: a valuation and a support analysis done by different people on different normalizations will not reconcile, and the inconsistency is what the other side will find.</p>",
      },
      {
        id: "where-valuations-diverge",
        heading: "Where the two sides' valuations diverge",
        bodyHtml:
          "<p>Opposing goodwill opinions diverge at predictable points. The allocation percentage is asserted rather than supported. The replacement compensation in the with-and-without method is set too low, which inflates the enterprise goodwill, or too high, which erases it. A covenant not to compete is treated as enterprise value when it is the price of the owner's personal goodwill. The valuation date is set where it favors one side and the goodwill measured as of a different date than the tangible assets. The standard of value is fair market value in a state whose case law applies a fair value concept, or the reverse, and the <a href=\"/compare/fair-market-value-vs-fair-value\">fair market value versus fair value</a> comparison explains what turns on the difference. The <a href=\"/guides/how-to-rebut-an-economic-damages-report\">rebuttal guide</a> lists the questions that test each of these, and the answers are usually in the business's own records.</p>",
      },
    ],
    faqs: [
      {
        question: "Is personal goodwill always left out of the marital estate?",
        answer:
          "No. Some states divide all of a business's goodwill, some exclude the portion that attaches to the owner personally, and some ask whether the goodwill could be sold to a buyer. The valuation reports the total goodwill and the evidence-based split between the enterprise and the owner so the court can apply whichever rule governs.",
      },
      {
        question: "How does a covenant not to compete bear on personal goodwill?",
        answer:
          "In a sale of the business, the price a buyer would pay for the owner's agreement not to compete is the price of the goodwill that would otherwise leave with the owner, so allocations of price to covenants in comparable transactions are evidence of the personal share. A valuation that treats the covenant value as enterprise goodwill has moved personal goodwill into the marital estate.",
      },
      {
        question: "Can the same business earnings count toward both the valuation and the support award?",
        answer:
          "Whether they may is a legal question that differs by state. The economist builds the market compensation deducted in the valuation and the income attributed to the owner for support from one normalization of the business's records and states where the two overlap, so the court can see the dollars in question and apply its rule.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "BLS_OES"]),
    related: [
      { title: "Divorce and Marital Financial Analysis", href: "/services/divorce-and-marital-financial-analysis" },
      { title: "Business Valuation Approaches", href: "/methods/business-valuation-approaches" },
      { title: "Income Determination in Divorce", href: "/guides/income-determination-in-divorce" },
    ],
  },
  {
    slug: "discounts-for-lack-of-marketability",
    title: "Discounts for Lack of Marketability in a Litigation Valuation",
    metaTitle: "Discounts for Lack of Marketability",
    metaDescription: "A marketability discount lowers the value of an interest that cannot be sold readily; here is how it is sized and when the standard of value allows it.",
    tldr:
      "A discount for lack of marketability reduces the indicated value of an ownership interest to reflect that it cannot be converted to cash quickly, at a known price, through an established market. Shares of a closely held company have no exchange to sell on, often carry transfer restrictions, and may wait years for a buyer, and a hypothetical purchaser pays less for them than for an otherwise identical interest that could be sold tomorrow. This guide explains what the discount measures and what it does not, which standards of value permit it and which exclude it, the evidence the economist draws on to size it for the specific interest, how it is kept separate from the discount for lack of control, how it is handled in divorce, shareholder, and damages matters, and where opposing valuations go wrong when they apply it.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-10-05",
    dateModified: "2026-10-05",
    sections: [
      {
        id: "what-the-discount-measures",
        heading: "What the discount measures",
        bodyHtml:
          "<p>Marketability is the ability to sell an interest quickly, at a price close to its indicated value, with little cost and little uncertainty about when the cash arrives. A share of a publicly traded company has it: the holder can sell at the quoted price within a day. An interest in a closely held company does not: there is no exchange, no quoted price, and no assurance that a buyer exists at any price, and the operating agreement or the shareholders' agreement may restrict to whom and on what terms the interest can be transferred. The discount for lack of marketability is the reduction a buyer demands for taking on that illiquidity, and it is applied after the <a href=\"/methods/business-valuation-approaches\">income, market, or asset approach</a> has produced a value for the interest as if it were freely tradable.</p><p>The discount is a feature of the interest, not of the company. A profitable, well run business can carry a large marketability discount on a minority block because the block cannot be sold, while the company as a whole could be sold in a transaction that takes months rather than minutes. That distinction is why the discount is applied at the level of the interest being valued, and why the report states the level of value the approaches produced before the discount was taken, so the reader can see what the discount is being applied to and whether that base already reflects some illiquidity.</p>",
      },
      {
        id: "where-the-standard-of-value-allows-it",
        heading: "Where the standard of value allows it and where it does not",
        bodyHtml:
          "<p>Whether the discount belongs in the valuation at all depends on the standard of value the law or the agreement imposes, and that is a legal question the <a href=\"/services/business-valuation\">business valuation</a> report takes from counsel rather than decides. Under fair market value, the price a hypothetical willing buyer would pay a hypothetical willing seller, the discount is ordinarily considered, because a real buyer of an illiquid interest would demand it. Under the fair value standard most states apply to dissenting shareholder appraisals and oppression buyouts, the discount is usually excluded, because the departing owner is not a willing seller to an outsider and the remaining owners are not buying a block they cannot sell. The <a href=\"/compare/fair-value-vs-fair-market-value-in-shareholder-disputes\">fair value versus fair market value</a> comparison sets out the two standards in the shareholder setting.</p><p>Divorce courts split. Some treat the marital interest at fair market value and allow the discount; others reason that the owner spouse is keeping the business, not selling it, and exclude a discount for a sale that will not happen; a third group allows it only where a sale is actually contemplated or the restrictions are real. The <a href=\"/compare/fair-market-value-vs-fair-value\">general comparison of the two standards</a> covers the definitions. Where the governing standard is unsettled, the report shows the value with and without the discount, so that the court can apply whichever rule it adopts to a number built for that rule rather than argue the law from a figure built for the other one.</p>",
      },
      {
        id: "the-evidence-that-sizes-it",
        heading: "The evidence that sizes the discount",
        bodyHtml:
          "<p>The size of the discount is not a convention; it is an estimate for the specific interest, and the report shows the evidence it rests on. The empirical base comes from two kinds of studies: comparisons of the prices at which restricted shares of public companies, which could not be sold for a holding period, traded against the same company's freely traded shares; and comparisons of the prices paid for shares in private transactions before an initial public offering against the offering price. Both measure what buyers paid to accept a period of illiquidity, and both have known limits that the report acknowledges: the restricted stock studies measure a defined holding period that a closely held interest may not have, and the pre-offering studies include companies whose offering was already in prospect.</p><p>From that base the economist moves to the interest in hand. The factors that raise the discount are a long expected holding period, transfer restrictions in the governing agreement, no history of distributions, no prospect of a sale or a public offering, a small block, a company whose earnings are volatile, and a pool of buyers limited to the other owners. The factors that lower it are a put right or a buy-sell agreement that creates a buyer at a formula price, regular distributions that pay the holder while they wait, a company being marketed for sale, and a block large enough to influence a sale. Option pricing models, which price the cost of protecting against a decline in value during the holding period, give a second, independent read on the discount from the interest's own volatility and expected holding period, and a report that reconciles the two reads has shown its work.</p>",
      },
      {
        id: "marketability-and-control",
        heading: "Marketability and control are different discounts",
        bodyHtml:
          "<p>A minority interest in a closely held company often carries two discounts, and they measure different things. The discount for lack of control reflects that the holder cannot set compensation, declare distributions, sell the company, or change its direction, and it is applied when the approaches produced a value at the control level. The discount for lack of marketability reflects that the holder cannot sell, and it applies whether or not the holder has control, though a controlling owner, who can sell the whole company, usually bears a far smaller one. The two are applied in sequence, control first and then marketability on the reduced base, because a buyer decides what the block is worth to hold before deciding what to deduct for the difficulty of selling it.</p><p>Keeping them separate matters for two reasons. First, the evidence differs: control discounts are drawn from the premiums paid in acquisitions of public companies, marketability discounts from the restricted stock and pre-offering studies, and a report that cites one body of evidence for both has priced one of them twice or not at all. Second, the law treats them differently in some settings; a court applying fair value may reject a control discount on the ground that the shareholder is entitled to a proportionate share of the whole while allowing a marketability discount at the enterprise level, or the reverse, and the report has to be able to remove either one without disturbing the other. The <a href=\"/guides/business-valuation-in-litigation\">business valuation in litigation</a> guide describes where each adjustment sits in the valuation.</p>",
      },
      {
        id: "the-settings",
        heading: "Divorce, shareholder, and damages settings",
        bodyHtml:
          "<p>In a <a href=\"/case-types/divorce-and-marital-dissolution\">divorce</a>, the discount is contested because it moves the marital estate directly and because the sale it assumes will usually not occur. The economist states the standard the venue applies, values the interest with and without the discount, and ties the factors to the agreement and the distribution history in the record. Where the business carries personal goodwill, the <a href=\"/guides/goodwill-in-a-divorce-valuation\">goodwill allocation</a> is made before any discount is considered, so that the same illiquidity is not removed twice, once as goodwill that leaves with the owner and once as a discount on what remains.</p><p>In a shareholder dispute venued in a <a href=\"/case-types/partnership-and-shareholder-dispute/new-jersey\">New Jersey</a> court, or in any venue, the fair value standard usually governs and the discount is usually excluded, but a buy-sell agreement that fixed fair market value as its measure can bring it back, and the report presents both figures. In a damages matter, where an owner's interest was destroyed or impaired, the discount enters only if the measure of loss is the value of the interest rather than a stream of lost profits, and the <a href=\"/guides/lost-profits-vs-lost-business-value\">lost profits versus lost business value</a> guide explains how that choice is made. An estate or gift tax valuation applies fair market value by definition and nearly always carries the discount, but that setting lies outside litigation and is noted here only because its case law is the source of much of the evidence the litigation reports rely on.</p>",
      },
      {
        id: "where-reports-go-wrong",
        heading: "Where reports go wrong on the discount",
        bodyHtml:
          "<p>The errors fall into a short list. A discount applied under a standard of value that excludes it, or omitted under one that requires it, with no statement of the standard. A figure asserted from a range the studies report without tying it to the interest's holding period, restrictions, distributions, or prospects for sale. A marketability discount applied to a controlling interest at the same rate as a minority block. Control and marketability discounts drawn from the same evidence, or applied in parallel to the undiscounted base rather than in sequence. A discount taken against a value the market approach already produced from transactions in illiquid private companies, so the illiquidity was removed twice. A discount applied to an interest the agreement gives a put right at a formula price, which is a buyer the discount assumes does not exist.</p><p>Each of these is visible on the face of the report and each can be tested against the agreement, the distribution history, and the studies cited. On the other side, a report that rejects every discount as speculative without engaging the evidence of illiquidity the agreement and the record show has left the question unanswered. The <a href=\"/guides/how-to-rebut-an-economic-damages-report\">rebuttal guide</a> lists the questions that expose both failures, and the <a href=\"/services/expert-rebuttal-and-report-review\">report review</a> service describes how an opposing valuation's discounts are tested one factor at a time.</p>",
      },
    ],
    faqs: [
      {
        question: "Is a marketability discount applied to a controlling interest?",
        answer:
          "Sometimes, but at a much smaller rate than for a minority block. A controlling owner can sell the whole company, so the illiquidity is the time and cost of marketing a business rather than the absence of any buyer. Whether any discount applies at the control level depends on the standard of value and the venue's case law, and the report states the treatment it adopted.",
      },
      {
        question: "What evidence supports the size of a marketability discount?",
        answer:
          "Studies of the price difference between restricted and freely traded shares of the same public company, studies of private share sales before a public offering, and option pricing models that price the cost of waiting out the holding period. The economist then moves from that base to the interest at hand on the transfer restrictions, distribution history, expected holding period, and prospects for a sale shown in the record.",
      },
      {
        question: "Does a transfer restriction in the shareholders' agreement increase the discount?",
        answer:
          "Usually, because a right of first refusal, a consent requirement, or a bar on transfer to outsiders narrows the pool of buyers and lengthens the wait. A restriction paired with a put right or a buy-sell formula can cut the other way, since it creates a buyer at a stated price, and the report reads the agreement for both effects before sizing the discount.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1","NACVA_STANDARDS"]),
    related: [
      { title: "Business Valuation", href: "/services/business-valuation" },
      { title: "Fair Value vs. Fair Market Value in Shareholder Disputes", href: "/compare/fair-value-vs-fair-market-value-in-shareholder-disputes" },
      { title: "Business Valuation Approaches", href: "/methods/business-valuation-approaches" },
    ],
  },
  {
    slug: "tracing-commingled-funds",
    title: "Tracing Commingled Funds: How the Analysis Is Built",
    metaTitle: "Tracing Commingled Funds in Litigation",
    metaDescription: "When separate and shared or diverted and legitimate money sit in one account, tracing rebuilds the flows from the records; here is how the analysis is done.",
    tldr:
      "Tracing is the reconstruction of where identified money came from and where it went, through every account it passed, from the bank, brokerage, and accounting records that recorded each movement. Funds are commingled when money with one character, a spouse's premarital savings or a sum diverted from a company, is deposited into an account that also holds money of another character, so that the balance no longer shows which dollars are which. The analysis assigns the mixed balance and every withdrawal from it under a stated convention, follows the money into the assets it bought, and states where the trail breaks and what carries it across. This guide explains what tracing is and is not, the records it is built from, the conventions used to divide a mixed account and why the choice of convention is a legal question, how the analysis differs between divorce and fraud matters, and how the result is presented so it can be tested.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-10-05",
    dateModified: "2026-10-05",
    sections: [
      {
        id: "what-tracing-is",
        heading: "What tracing is and what it is not",
        bodyHtml:
          "<p>Tracing follows specific money through a series of transactions by matching each withdrawal to a deposit and each deposit to its source, using the records that documented the transfers. It is documentary work: the analyst does not infer that money moved because it would have been convenient, but shows the deposit item, the wire detail, or the check image that moved it. The <a href=\"/services/fraud-and-asset-tracing\">fraud and asset tracing</a> service describes the engagement in which diverted funds are followed into the assets they bought, and the <a href=\"/services/divorce-and-marital-financial-analysis\">divorce financial analysis</a> service describes the same work applied to a spouse's claim that an asset was acquired with separate property.</p><p>Tracing does not decide what the money was. Whether a deposit was separate or marital, whether a transfer was authorized or a diversion, and whether a commingled account lost its separate character by the act of commingling are questions the governing law answers, and the report takes the legal framework from counsel and applies it. What the analysis supplies is the factual chain: this sum entered here on this date from this source, sat in this account alongside these other funds, and left in these amounts to these destinations. The characterization and the remedy are built on that chain, and the chain is what the opposing analyst will test.</p>",
      },
      {
        id: "the-records",
        heading: "The records the analysis is built from",
        bodyHtml:
          "<p>Bank statements are the spine, but a statement alone shows amounts and dates, not sources and destinations. The analysis needs the deposit detail behind each credit, which identifies the check or the wire that made up the deposit; the check images and the wire confirmations behind each debit, which identify the payee and the receiving account; and the account opening records, which fix who owned the account and when. Brokerage statements add the trade confirmations and the transfers between cash and securities. Closing statements for real estate, title records, loan applications, and vehicle purchase documents show what the money bought. The company's general ledger, its accounts payable detail, and its payroll register show where diverted funds left the business and under what description.</p><p>Tax returns and their schedules tie the accounts together and sometimes reveal accounts that were not produced, because interest and dividend income are reported by payer. In a <a href=\"/case-types/fraud-and-embezzlement\">fraud or embezzlement</a> matter the records come from the company, its banks, and the subpoenaed accounts of the person who took the money; in a divorce they come from both spouses and reach back to the date of marriage or the date the separate funds arrived. The request is for complete runs, not samples: a single missing statement in the middle of a chain is a gap the analysis has to bridge by assumption, and a complete run lets it bridge by evidence.</p>",
      },
      {
        id: "the-conventions",
        heading: "The conventions that divide a mixed account",
        bodyHtml:
          "<p>Once money of two characters shares one account, every withdrawal has to be assigned to one source or the other, and no rule of arithmetic makes the choice; a convention does, and the conventions give different answers. Direct tracing matches a specific withdrawal to a specific deposit by amount, timing, and stated purpose, and is the strongest where the records permit it. Where they do not, the alternatives are rules: that withdrawals for ordinary living expenses are presumed to come from marital or legitimate funds first, so that the separate or diverted balance is preserved; that the separate funds can never exceed the lowest balance the account reached after they were deposited, since money that left cannot return; that withdrawals are taken in the order deposits were made; or that each withdrawal is split in proportion to the mixture in the account at that moment.</p><p>Which convention governs is a question of law that varies by state and by the kind of claim, and the economist applies the one counsel identifies while showing what the others would produce, because the difference between them is often the whole dispute. A spouse in a <a href=\"/case-types/divorce-and-marital-dissolution\">divorce</a> who claims a down payment came from premarital savings will fare very differently under a convention that charges living expenses to marital funds first than under one that charges them in proportion, and the report that presents only the favorable one has argued rather than analyzed. Presenting the result under each convention also lets the court adopt a rule without sending the analysis back to be redone.</p>",
      },
      {
        id: "when-the-trail-breaks",
        heading: "When the trail breaks",
        bodyHtml:
          "<p>Every tracing eventually meets a point where the records stop showing where the money went. Cash withdrawals leave the banking system and reappear, if at all, as cash deposits elsewhere that cannot be matched by item. A transfer to an account that was never produced, a closed account whose statements the bank no longer holds, a payment to a third party who passed the money on, or a period of missing statements each leaves a gap. The analysis does not paper over these. It states where the trail ends, what the records show up to that point, what the money could have become, and what assumption, if any, the report makes to carry the balance forward, and it separates the portion of the conclusion that rests on documents from the portion that rests on inference.</p><p>Gaps are also evidence in their own right. A pattern of cash withdrawals that begins when the diversion is alleged to have begun, or a set of accounts that appear on the tax return but were not produced, points to where the next subpoena should go, and the report can say so without concluding what the subpoena would show. For the separate property claim, a gap usually means the separate character cannot be carried past it under the stricter conventions, and the report states that consequence so counsel can weigh the cost of pursuing the missing records against what they could recover.</p>",
      },
      {
        id: "divorce-and-fraud",
        heading: "Tracing in divorce and tracing in fraud matters",
        bodyHtml:
          "<p>The mechanics are the same in both settings; the question and the direction differ. In divorce, the analysis usually runs forward from a known separate source, an inheritance, a premarital account, a gift to one spouse, through the accounts it was mixed into and into the assets that remain at the date of division, to show how much of a present asset is attributable to the separate source. Appreciation, distributions, and the spouses' own contributions during the marriage each have a treatment under the state's law, and the report applies the one counsel identifies and shows the separate and marital portions of each asset on a schedule.</p><p>In a fraud matter the analysis usually runs in both directions: backward from a suspicious payment or asset to the company account it was drawn from, and forward from the point of diversion to the accounts, property, and third parties that received the money, to quantify the loss and to identify what can be recovered. The loss figure and the recovery figure are different numbers, and the report keeps them separate. A matter venued in a <a href=\"/case-types/fraud-and-embezzlement/florida\">Florida</a> court, or in any venue, may also need the analysis to distinguish the diverted principal from any gains it earned, because the remedies for each can differ. The <a href=\"/compare/forensic-economist-vs-forensic-accountant\">economist versus forensic accountant</a> comparison explains why this work sits at the boundary of the two disciplines and how a practice that fields both assigns it.</p>",
      },
      {
        id: "presenting-the-result",
        heading: "Presenting the tracing so it can be tested",
        bodyHtml:
          "<p>A tracing stands or falls on whether the reader can follow it, so the presentation is part of the method. The core exhibit is a schedule for each account, in date order, that lists every deposit and withdrawal in the relevant period, assigns each to a source under the stated convention, and carries a running balance for each character of funds beside the bank's own balance, which the two must reconcile to on every statement date. A source-and-use summary then collapses the account schedules into a flow from each origin to each destination, and an asset schedule shows, for each asset still in existence, how much of its cost came from each source. Every line cites the document it came from.</p><p>The narrative explains the convention applied, the alternatives and their results, the gaps and the assumptions that bridge them, and the portion of the conclusion that rests on inference. A report built this way can be checked line by line, which is what a court needs when the opposing analyst applies a different convention to the same records. The <a href=\"/guides/how-to-rebut-an-economic-damages-report\">rebuttal guide</a> lists the questions an opposing tracing will be asked, and most of them concern whether the schedules reconcile, whether the convention was applied consistently, and whether the gaps were disclosed.</p>",
      },
    ],
    faqs: [
      {
        question: "Which tracing convention does the economist apply when funds are mixed in one account?",
        answer:
          "The one the governing law prescribes for that kind of claim, which counsel identifies. Because the conventions assign the same withdrawals to different sources and can reverse the result, the report applies the governing rule and also shows what the alternatives produce, so the court can adopt a rule and read the answer off the same schedules.",
      },
      {
        question: "What happens to the tracing when a statement is missing or money leaves as cash?",
        answer:
          "The report marks the point where the documents stop, states what the records show up to it, and separates the conclusion that rests on documents from any portion carried forward by assumption. Under the stricter conventions a separate or diverted balance usually cannot be carried past an undocumented gap, and the report says so.",
      },
      {
        question: "Does a tracing analysis prove that a transfer was wrongful?",
        answer:
          "No. It establishes the chain of movements: the source, the accounts the money passed through, and the destinations, each tied to a record. Whether a movement was authorized, whether a deposit was separate or marital, and what remedy follows are legal questions decided on that chain by the court, not by the analyst.",
      },
    ],
    sources: refsToSources(["ACFE","NACVA_STANDARDS"]),
    related: [
      { title: "Fraud Investigation and Asset Tracing", href: "/services/fraud-and-asset-tracing" },
      { title: "Divorce and Marital Financial Analysis", href: "/services/divorce-and-marital-financial-analysis" },
      { title: "Forensic Economist vs. Forensic Accountant", href: "/compare/forensic-economist-vs-forensic-accountant" },
    ],
  },
  // Transfer pricing (owner request 2026-10-05). Written from the economist's
  // standpoint and neutral between taxpayer and government, plaintiff and
  // defense; no person is named and no figure, outcome, or engagement is
  // claimed. The regulations and the forums are described, never cited inline.
  {
    slug: "transfer-pricing-disputes-explained",
    title: "Transfer Pricing Disputes Explained: The Arm's Length Standard and Section 482",
    metaTitle: "Transfer Pricing Disputes and Section 482",
    metaDescription: "How transfer pricing disputes arise under section 482 and the arm's length standard, where they are heard, and what a transfer pricing expert witness does.",
    tldr:
      "A transfer pricing dispute is a disagreement over the price one company in a commonly controlled group charged another for goods, services, the use of intangibles, or financing, judged against what unrelated parties would have agreed to in the same transaction under the same circumstances. In the United States the governing rule is section 482 of the Internal Revenue Code and the Treasury regulations under it, which apply that arm's length standard through a best method rule, a comparability analysis, and an arm's length range; the tax administrations of many other countries apply or draw on the OECD Transfer Pricing Guidelines, which rest on the same principle. Disputes arise in IRS examinations and the U.S. Tax Court, in state tax audits, between the tax authorities of two countries, and in commercial, shareholder, and divorce litigation in which an intercompany price moved profit away from someone with a claim to it. This guide explains the standard, the forums, the economic analysis each side presents, what a testifying transfer pricing expert does, and where that analysis is contested.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-10-05",
    dateModified: "2026-10-05",
    sections: [
      {
        id: "what-a-transfer-pricing-dispute-is",
        heading: "What a transfer pricing dispute is",
        bodyHtml:
          "<p>A <a href=\"/case-types/tax-and-transfer-pricing-dispute\">transfer pricing dispute</a> is a disagreement about whether the price charged in a transaction between related companies is the price unrelated companies would have agreed to. Members of a multinational group sell goods to one another, provide management, research, and distribution services to one another, license patents, trademarks, software, and know-how to one another, and lend to one another and guarantee one another's debts. Each of those intercompany transactions carries a price, the transfer price, and the price decides where the group's profit is reported: a higher price for the goods a foreign parent sells to its U.S. distributor moves profit out of the United States, and a lower royalty from a foreign subsidiary for the parent's technology leaves profit offshore. Because no market sets a price between affiliates, the group sets it, and the tax authority of each country in which the group operates can test the result.</p><p>The same price matters outside tax. Where a company that is not wholly owned buys from, sells to, or licenses from an affiliate of its controlling owner, the transfer price decides how much of the profit reaches the minority owners, a joint venture partner, a buyer whose earn-out depends on the unit's earnings, or a spouse whose share of the marital estate depends on what the business earns. The economic question is the same in every forum: what an independent party would have paid for the same thing on the same terms, and what difference the actual price made. The <a href=\"/methods/transfer-pricing-methods\">transfer pricing methodology</a> page describes the methods that answer it.</p>",
      },
      {
        id: "the-arms-length-standard",
        heading: "The arm's length standard and the best method rule",
        bodyHtml:
          "<p>Section 482 of the Internal Revenue Code allows the Secretary of the Treasury to distribute, apportion, or allocate income, deductions, credits, and allowances among organizations, trades, or businesses owned or controlled by the same interests when that is necessary to prevent evasion of taxes or clearly to reflect their income. The Treasury regulations under section 482 set the standard for every case: a controlled transaction meets the arm's length standard if its results are consistent with the results that would have been realized had uncontrolled taxpayers engaged in the same transaction under the same circumstances. Because identical transactions between independent parties can rarely be found, the test runs through comparable transactions under comparable circumstances, and the regulations name the factors comparability turns on: the functions each party performs, the contractual terms, the risks each party bears, the economic conditions of the markets involved, and the property or services transferred.</p><p>The regulations do not rank the methods. The best method rule requires the arm's length result to be determined under the method that, under the facts and circumstances, provides the most reliable measure, judged chiefly by the degree of comparability between the controlled transaction and the comparables and by the quality of the data and assumptions. When the comparables are not close enough for every difference to be identified and adjusted, the result is a range narrowed by a statistical method, ordinarily the interquartile range; a taxpayer whose results fall inside the range is not adjusted, and one whose results fall outside it is ordinarily adjusted to the median. For transfers and licenses of intangibles the statute adds that the income must be commensurate with the income attributable to the intangible, which the <a href=\"/guides/intercompany-royalty-rates-in-litigation\">intercompany royalty guide</a> explains. Outside the United States, the OECD Transfer Pricing Guidelines state the same arm's length principle with a most appropriate method standard in place of the best method rule, and the two frameworks share their core methods and comparability concepts while differing in terminology and in some details.</p>",
      },
      {
        id: "tax-forums",
        heading: "Tax forums: the IRS, the Tax Court, and the states",
        bodyHtml:
          "<p>Most federal <a href=\"/case-types/tax-and-transfer-pricing-dispute\">tax and transfer pricing disputes</a> begin in an examination. The IRS's published transfer pricing examination process describes a planning phase in which the examination team, which includes economists, reviews the taxpayer's documentation and financial data; an execution phase built on information document requests, interviews, and a functional analysis of what each related company does, owns, and risks; and a resolution phase in which the team's economist prepares a report supporting any proposed adjustment and the examiners issue a notice of proposed adjustment. A taxpayer who disagrees can take the issue to the IRS Independent Office of Appeals, and where the dispute is not resolved the IRS issues a statutory notice of deficiency. The taxpayer may then petition the U.S. Tax Court without first paying the tax, or pay it and sue for a refund in a federal district court or the Court of Federal Claims.</p><p>In the Tax Court the case is tried to a judge, without a jury, and the court's rules require each retained expert to prepare a written report that states every opinion with the basis and reasons for it, the facts or data considered, the exhibits, the expert's qualifications, recent publications, and prior testimony, and the compensation. The report is received in evidence as the expert's direct testimony. It is therefore not a preview of what the expert will say but the testimony itself, read closely by the court and by opposing counsel before the expert takes the stand. Penalties raise the stakes on both sides: a large net transfer pricing adjustment can carry a penalty unless the taxpayer maintained contemporaneous documentation of a reasonably selected and reasonably applied method, which the <a href=\"/compare/transfer-pricing-documentation-vs-expert-report\">documentation versus expert report</a> comparison explains.</p><p>State tax authorities bring their own disputes. Many states that tax corporate income have authority of their own to reallocate income among related companies, often patterned on the federal provision, and some require deductions for royalties or interest paid to a related company to be added back to income unless an exception applies. The questions an economist answers in a state audit or a state tax appeal are the federal questions applied to a different allocation: whether an intercompany royalty, management fee, or interest charge reflects what an unrelated party would have paid, and whether the affiliate that received it performed the functions and bore the risks the charge assumes.</p>",
      },
      {
        id: "cross-border-disputes",
        heading: "Cross-border disputes: mutual agreement and advance pricing agreements",
        bodyHtml:
          "<p>A transfer price has two sides, and an adjustment by one country's tax authority raises the income reported there without lowering the income reported by the affiliate on the other side of the same transaction, so the group is taxed twice on the same profit. U.S. income tax treaties let a taxpayer request the mutual agreement procedure, in which the U.S. competent authority and its treaty partner negotiate to relieve taxation inconsistent with the treaty, by withdrawing the adjustment in whole or in part or by a correlative reduction of income in the other country; the IRS's own overview of the process recognizes that some double taxation can remain when the two do not fully offset. The function sits in the IRS's Advance Pricing and Mutual Agreement program, which also negotiates advance pricing agreements: agreements, unilateral with the IRS or bilateral and multilateral with treaty partners, that fix the transfer pricing method for covered transactions in future years, and where agreed in earlier open years, so that the dispute does not arise.</p><p>Each of these proceedings is an economic negotiation between tax authorities, and the analysis behind the taxpayer's position is the analysis it would present to a court: the delineation of the transactions, the functional analysis, the method, the comparables, and the range. What changes is the audience. A competent authority or an advance pricing agreement team weighs the economics directly and can agree on a point, a range, or a mechanism for adjusting results that fall outside it, while a court decides between the experts' analyses on the record. The IRS publishes an annual statutory report on its advance pricing agreement program that describes the methods, tested parties, and ranges used in the agreements it executes, which gives a public view of how the methods are applied in negotiated agreements.</p>",
      },
      {
        id: "commercial-shareholder-and-divorce-disputes",
        heading: "Transfer pricing in commercial, shareholder, and divorce disputes",
        bodyHtml:
          "<p>Transfer pricing questions reach civil courts whenever a price set between related companies decides what a party to the lawsuit receives. A supply, services, or license agreement written between affiliates can survive a sale or a spin-off and then govern a commercial relationship between companies that are no longer related, and a dispute over its price or its royalty base is a <a href=\"/case-types/commercial-contract-dispute\">commercial contract dispute</a> with an intercompany history. A joint venture partner may allege that the other partner's affiliate overcharged the venture for inputs or services; a buyer and a seller may dispute whether intercompany charges imposed after closing depressed the earnings an earn-out is measured on; a trustee in an insolvency may challenge intercompany transfers as made for less than reasonably equivalent value; and customs authorities examine whether the relationship between an importer and its foreign affiliate influenced the declared price of imported goods.</p><p>In a <a href=\"/case-types/partnership-and-shareholder-dispute\">shareholder dispute</a>, a minority owner may allege that the controlling owner moved profit out of the company through purchases from, sales to, or licenses from entities the controlling owner holds separately. The arm's length analysis measures the profit that was diverted, year by year, and the restated earnings then feed the <a href=\"/services/business-valuation\">valuation</a> of the minority interest or the damages claim, in a <a href=\"/case-types/partnership-and-shareholder-dispute/delaware\">Delaware</a> court or any other. In a <a href=\"/case-types/divorce-and-marital-dissolution\">divorce</a>, an owner spouse whose company trades with affiliates abroad controls the prices that determine the income the company reports, and both the <a href=\"/guides/income-determination-in-divorce\">income determination</a> for support and the value of the business depend on whether those prices would have been agreed by an unrelated party.</p><p>Outside a tax forum the arm's length standard is not the rule of decision. The contract, the fiduciary duty, or the support statute governs, and the arm's length result is evidence of what an unrelated party would have paid: a benchmark the court may adopt as the measure, adjust, or set aside. The economist states that distinction in the report, and treats the company's own transfer pricing documentation as a record of the policy it applied and of what it told the tax authorities, not as an answer to the question the lawsuit asks.</p>",
      },
      {
        id: "what-the-expert-does",
        heading: "What a transfer pricing expert witness does",
        bodyHtml:
          "<p>A <a href=\"/services/transfer-pricing-expert-witness\">transfer pricing expert witness</a> reconstructs the intercompany transactions and measures them against the arm's length standard, and the work follows the same sequence whether the expert is retained by a taxpayer, the government, a plaintiff, or a defendant. It begins with the delineation of the transactions: the intercompany agreements, the invoices, and the ledger entries show what was transferred and at what price, and the expert tests the written terms against what the companies actually did, because the regulations respect a contractual allocation of risk only where the parties' conduct is consistent with it. The functional analysis follows, built from interviews, organization charts, and operating records, to establish which company performed the research, manufacturing, marketing, distribution, and support functions, which owned or controlled the valuable intangibles, and which bore and managed the market, inventory, credit, and currency risks.</p><p>The expert then selects the method under the best method rule and explains why the alternatives were rejected, chooses the tested party and the profit level indicator where a one-sided method such as the comparable profits method applies, searches for comparables with stated screens, makes the adjustments the data support, and computes the range and the position of the controlled result within it. In a tax case the output is the adjustment, or the absence of one, that the analysis supports. In a commercial case the restated price is carried into a damages schedule: the difference between the price charged and the arm's length price, applied to the volumes in the record over the period at issue, which the <a href=\"/services/lost-profits-and-commercial-damages\">commercial damages</a> analysis then completes, including the <a href=\"/methods/present-value-and-discounting\">discounting</a> of any future amounts.</p><p>Much of the work is responsive. The opposing expert has made the same choices differently, and the report has to show what the result is under the other side's method, tested party, comparable set, and adjustments, and why each was accepted or rejected. The expert's independence from the documentation also matters: an expert who prepared the study under examination is defending earlier work, while an expert who did not can test it the way the other side will. The <a href=\"/knowledge/expert-witness-testimony-guide\">expert witness testimony guide</a> describes how the report, the deposition, and the trial presentation fit together.</p>",
      },
      {
        id: "where-the-analysis-is-contested",
        heading: "Where the economic analysis is contested",
        bodyHtml:
          "<p>The disagreements between transfer pricing experts fall into a short list, and nearly all of them are visible on the face of the reports. The method: a profit-based method applied where reliable comparable prices existed, or a comparable price method applied to transactions that differ in volume, terms, or market level without adjustment. The tested party: a company chosen as the simpler party when it in fact develops or owns intangibles that no independent comparable has. The comparables: screens that admit companies with different functions, or that reject loss-making companies only when the rejection helps, and a set that places the tested party inside the range only because of a single company, which the IRS's own documentation guidance treats as a reason to reconsider the comparability analysis. The profit level indicator: an operating margin that looks reasonable beside a return on assets that does not. The years: comparables' results drawn from a single year, where the regulations generally call for at least the year under review and the two years before it, or a multi-year period chosen for the average it produces. The contracts: a risk allocation written after the outcome was known, or one the parties' conduct contradicts.</p><p>For intangibles the list grows: legal ownership treated as decisive where the functions that created the value were performed elsewhere, or the reverse; a royalty that leaves the licensee with losses its routine functions cannot explain; and a valuation that ignores the alternatives the parties realistically had. Each of these can be tested against the record, and the regulations themselves provide that unadjusted industry average returns cannot establish an arm's length result. The <a href=\"/guides/how-to-rebut-an-economic-damages-report\">rebuttal guide</a> lists the questions that expose an unsupported input in any economic report, and the <a href=\"/services/expert-rebuttal-and-report-review\">report review</a> service describes how an opposing analysis is examined one choice at a time.</p>",
      },
      {
        id: "when-to-retain",
        heading: "When to bring in the economist and what to gather",
        bodyHtml:
          "<p>The earlier the <a href=\"/services/transfer-pricing-expert-witness\">transfer pricing economist</a> reads the record, the more the analysis can shape the case rather than respond to it. In an examination, an economic review before a notice of proposed adjustment issues can show whether the issue turns on the method, the comparables, or the facts, and can put the taxpayer's position in a form an appeals officer or a competent authority can weigh. In litigation, the economist's first requests are the intercompany agreements and their amendments, the transfer pricing documentation for each year at issue, the legal-entity and segmented financial statements, the general ledger detail behind the intercompany accounts, any advance pricing agreement, and the tax returns and information returns that report the related-party transactions. The <a href=\"/insights/what-intercompany-agreements-add-to-a-transfer-pricing-dispute\">intercompany agreements post</a> explains what the first of those records shows and what it leaves out.</p>",
      },
    ],
    faqs: [
      {
        question: "What does the arm's length standard require in a transfer pricing dispute?",
        answer:
          "That the price between related companies produce the result unrelated companies would have reached in the same transaction under the same circumstances. Because identical transactions are rare, the result is measured from comparable transactions, adjusted for material differences, and expressed as a range, narrowed by a statistical method when the comparables are inexact; for tax purposes a controlled result inside the range is not adjusted.",
      },
      {
        question: "Does the arm's length standard decide a shareholder or divorce case involving related-party pricing?",
        answer:
          "Not by itself. The governing contract, fiduciary duty, or support statute decides the case, and the arm's length price is evidence of what an unrelated party would have paid. A court can adopt it as the measure, adjust it, or give it limited weight, so the economist presents it as a benchmark and shows how the restated profit changes the claim.",
      },
      {
        question: "Where are federal transfer pricing disputes litigated?",
        answer:
          "In the U.S. Tax Court, which a taxpayer can petition after a statutory notice of deficiency without paying the tax first, or in a federal district court or the Court of Federal Claims if the taxpayer pays the tax and sues for a refund. Before litigation the issue can go to the IRS Independent Office of Appeals, and a cross-border adjustment can be taken to the treaty partner through the mutual agreement procedure.",
      },
    ],
    sources: refsToSources(["IRC_482", "TREAS_REG_1_482_1", "TREAS_REG_1_482_5", "TREAS_REG_1_6662_6", "IRS_TP_EXAM_PROCESS", "IRS_TP_DOCUMENTATION_FAQS", "TAX_COURT_RULE_143", "IRS_MAP_OVERVIEW", "IRS_APMA", "IRS_APMA_REPORT_2025", "OECD_TP_GUIDELINES"]),
    related: [
      { title: "Transfer Pricing Methodology", href: "/methods/transfer-pricing-methods" },
      { title: "Intercompany Royalty Rates in Litigation", href: "/guides/intercompany-royalty-rates-in-litigation" },
      { title: "Transfer Pricing Documentation vs. Expert Report", href: "/compare/transfer-pricing-documentation-vs-expert-report" },
      { title: "Transfer Pricing Expert Witness", href: "/services/transfer-pricing-expert-witness" },
      { title: "Tax and Transfer Pricing Disputes", href: "/case-types/tax-and-transfer-pricing-dispute" },
    ],
  },
  {
    slug: "intercompany-royalty-rates-in-litigation",
    title: "Intercompany Royalty Rates in Litigation: How the Rate Is Benchmarked",
    metaTitle: "Intercompany Royalty Rates in Litigation",
    metaDescription: "An intercompany royalty is tested against comparable licenses, the licensee's routine return, or a profit split; here is how the rate is set and challenged.",
    tldr:
      "An intercompany royalty is the rate one company in a group pays another for the right to use a patent, a trademark, software, know-how, or another intangible, and in a dispute it is measured against what an unrelated licensor and licensee would have agreed to for the same rights on the same terms. The rate is benchmarked in three ways: directly, from licenses of comparable intangibles between unrelated parties; indirectly, by testing whether the licensee keeps the routine return its own functions would earn after paying the royalty; and, where both sides contribute unique intangibles, by splitting the combined profit according to each side's contribution. This guide explains how the licensed rights and their owner are identified, how each benchmark is built and where it fails, the commensurate-with-income rule and the realistic alternatives the parties had, how royalty rates arise in tax, commercial, shareholder, and divorce disputes, and where opposing analyses go wrong.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-10-05",
    dateModified: "2026-10-05",
    sections: [
      {
        id: "what-is-licensed",
        heading: "What is licensed and who owns it",
        bodyHtml:
          "<p>An intercompany royalty is the payment one affiliate makes to another for the right to use an intangible, and the first task is to establish exactly what that intangible is. The Treasury regulations treat as intangibles patents, inventions, formulae, processes, designs, and know-how; copyrights; trademarks, trade names, and brand names; franchises, licenses, and contracts; methods, programs, systems, customer lists, and technical data; and similar items that derive their value from intellectual content rather than physical attributes and have substantial value independent of any individual's services. A license grants defined rights in one or more of them, and its terms set the scope a comparable has to match: the field of use, the territory, whether the grant is exclusive, its duration and termination rights, the right to sublicense, the right to improvements, and any technical support bundled with it. The royalty base matters as much as the rate, since a rate on gross sales and the same rate on net sales after returns, freight, and discounts are different prices.</p><p>Ownership is the second task. The regulations generally treat the legal owner under intellectual property law, or the holder of the rights under the license itself, as the owner, unless that ownership is inconsistent with the economic substance of the transactions. The OECD Guidelines ask, in addition, which companies perform and control the functions of developing, enhancing, maintaining, protecting, and exploiting the intangible, and allocate the return accordingly, so that legal title alone does not earn the profit the intangible produces. A royalty paid to an affiliate that holds the patents but employs no one who develops or defends them is where the two views are most likely to part, and the <a href=\"/guides/transfer-pricing-disputes-explained\">transfer pricing disputes guide</a> explains the forums in which the question is decided.</p>",
      },
      {
        id: "comparable-licenses",
        heading: "Benchmarking the rate from comparable licenses",
        bodyHtml:
          "<p>The most direct benchmark is the price unrelated parties agreed for the same or similar rights, which the regulations call the comparable uncontrolled transaction method. Its strongest form is internal: the group licenses the same intangible to an unrelated company under substantially the same circumstances, and the rate in that license is generally the most direct and reliable measure of the arm's length rate, after adjustment for any minor differences in terms. Where no internal license exists, the economist looks for licenses of comparable intangibles under comparable circumstances, and the regulations set two threshold tests: the intangibles must be used with similar products or processes in the same general industry or market, and they must have similar profit potential, which is most reliably measured by the net present value of the benefits the licensee expects from the license. Beyond the threshold, the factors that move a rate are the exclusivity and territory of the grant, the stage of development, including any regulatory approval still needed, the right to updates, the uniqueness of the intangible and how long its protection lasts, the duration and termination rights, the risks the licensee assumes, and the services or other dealings that come with the license.</p><p>The candidate licenses come from agreements between unrelated parties disclosed in public filings and collected in commercial licensing databases, and from the group's own licenses with third parties. Each candidate is read in full rather than taken from a database summary of its rate, because the summary does not show the base, the exclusivity, the bundled know-how, the minimum payments, or the upfront fees that change what the stated rate means. Licenses granted to settle infringement litigation are a weaker comparable, since their terms reflect each side's view of validity and the cost of the case as much as the value of the rights. The result is a set of rates that survive the review, adjusted where a difference can be measured, and a range against which the controlled rate is tested.</p>",
      },
      {
        id: "testing-the-licensee",
        heading: "Testing the rate through the licensee's profit",
        bodyHtml:
          "<p>Where reliable comparable licenses cannot be found, or as a check on those that were, the royalty is tested indirectly through the profit the licensee keeps. Under the comparable profits method, or its OECD counterpart, the transactional net margin method, the licensee is the tested party when it is the less complex participant: a distributor or manufacturer that performs routine functions and owns no valuable intangibles of its own. Its operating profit after paying the royalty is compared with the operating profit of independent companies that perform similar functions without licensed intangibles. If the licensee earns more than those comparables, the royalty may be too low; if it earns persistent losses its functions and markets cannot explain, the royalty may be too high. The IRS's annual report on its advance pricing agreement program describes this kind of post-royalty margin test being used to confirm a royalty set from comparable licenses.</p><p>The method works only where its premise holds. A licensee that built its own customer base, ran its own marketing, or adapted the technology to its market may hold local intangibles that the comparables lack, and treating it as routine hands the return on those intangibles to the licensor. The test also measures the whole profit of the licensee's business activity, so a downturn, a start-up phase, or a product failure moves the result for reasons unrelated to the royalty, which is one reason the comparables are measured over several years. The <a href=\"/methods/transfer-pricing-methods\">transfer pricing methodology</a> page describes the tested party and profit level indicator choices that drive the result.</p>",
      },
      {
        id: "profit-split",
        heading: "When both sides contribute unique intangibles: the profit split",
        bodyHtml:
          "<p>When licensor and licensee each contribute valuable, nonroutine intangibles, neither is a routine tested party and comparable licenses rarely capture the combination, so the profit split method takes their place. Under the residual profit split the regulations describe, the combined operating profit of the relevant business activity is allocated in two steps. First, each party receives a market return on its routine contributions, its manufacturing, distribution, and support functions, measured from comparable independent companies. Second, the residual that remains, the return to the unique intangibles, is divided according to the relative value of each party's nonroutine contributions, which the regulations allow to be measured by external market benchmarks or estimated from the capitalized cost of developing the intangibles, less amortization over their useful lives, such as accumulated research and development or marketing spending.</p><p>The method follows the economics of a joint contribution more closely than any one-sided test, but it asks more of the data. It needs reliable combined financial statements for the business activity, segmented from the parties' other operations and stated on consistent accounting and in a common currency, and its result is sensitive to the measure of relative contribution: the useful lives assigned to capitalized research and marketing spending, the years included, and the treatment of spending that created no lasting value. A royalty implied by a profit split is only as reliable as those choices, and the report shows the result under the alternatives the other side will press. The same useful-life and capitalization questions arise when the <a href=\"/methods/business-valuation-approaches\">valuation approaches</a> are applied to the intangibles themselves.</p>",
      },
      {
        id: "commensurate-with-income",
        heading: "Commensurate with income and the realistic alternatives",
        bodyHtml:
          "<p>Section 482 adds a rule for intangibles that has no counterpart for goods: the income from a transfer or license of intangible property must be commensurate with the income attributable to the intangible. Under the regulations, a royalty in an arrangement covering more than one year can be adjusted in later years so that it stays commensurate with the income the intangible actually produces, and a determination that the rate was arm's length in an earlier year does not prevent an adjustment in a later one, subject to exceptions that include a rate set from an unrelated license of the same intangible and results that stayed within a band around the projections the rate was based on. A royalty that was reasonable on the projections at signing can therefore be revisited in a tax dispute once the product's actual profitability is known.</p><p>The statute also directs that a transfer of intangibles be valued on an aggregate basis, or on the basis of the realistic alternatives to the transfer, where that is the most reliable means of valuation, and the regulations build the same principle into their unspecified methods: independent parties enter a transaction only if no realistic alternative is preferable. In economic terms, the licensor would not accept a royalty lower than what it could earn by exploiting the intangible itself, and the licensee would not pay one that leaves it less than it could earn without the license, so the arm's length rate lies within the range those two alternatives bound. The OECD Guidelines add an approach for hard-to-value intangibles under which, in defined circumstances, the outcomes actually realized can be used as evidence of what the pricing should have been at the outset. Commercial litigation sets a different question: the license agreement and the claim determine whether the parties' rate is enforced, reformed, or measured against an arm's length benchmark, which is a matter of contract and fiduciary law, and later profitability matters only to the extent the agreement or the claim makes it matter.</p>",
      },
      {
        id: "royalties-in-litigation",
        heading: "How royalty rates arise in tax, commercial, shareholder, and divorce disputes",
        bodyHtml:
          "<p>In a federal <a href=\"/case-types/tax-and-transfer-pricing-dispute\">tax dispute</a> the question is whether the royalty a U.S. company paid to a foreign affiliate, or received from one, shifted income across the border, and the analysis is presented in an examination, in the Tax Court, or to the competent authorities. State tax disputes turn on the same question at the state level, for example over royalties paid to an affiliate that holds the group's trademarks or patents, where the state disallows the deduction or requires it to be added back unless the charge is shown to be at arm's length or another exception applies.</p><p>In commercial litigation an intercompany license can outlive the relationship it was written for. A division is sold and keeps using its former parent's technology under a license drafted for tax purposes, or a joint venture partner contributes intangibles in exchange for a royalty the other partner later disputes, and a <a href=\"/case-types/commercial-contract-dispute\">contract dispute</a> over the rate, the royalty base, or the audit rights follows. The arm's length rate is then evidence of a reasonable rate where the agreement is silent, ambiguous, or terminated, and the <a href=\"/services/lost-profits-and-commercial-damages\">commercial damages</a> analysis carries the difference into the claim. A reasonable royalty for patent infringement is a different measure: it asks what the parties would have agreed in a hypothetical negotiation when the infringement began, with validity and infringement assumed, and while it draws on the same kinds of comparable licenses, it answers a question the transfer pricing analysis does not.</p><p>In a <a href=\"/case-types/partnership-and-shareholder-dispute\">shareholder dispute</a> the claim may be that the controlling owner moved intangibles into an entity it holds separately and then charged the operating company to use them; the arm's length rate measures how much of the royalty exceeded what an independent licensor could have charged, and the excess restates the company's earnings for the valuation or the damages claim. In a <a href=\"/case-types/divorce-and-marital-dissolution\">divorce</a>, royalties that the owner spouse's company pays to an affiliate the owner controls, sometimes offshore, reduce the income the company reports, and the economist restates them at an arm's length rate for the income available for support and for the <a href=\"/services/divorce-and-marital-financial-analysis\">marital financial analysis</a> of the business.</p>",
      },
      {
        id: "where-royalty-analyses-go-wrong",
        heading: "Where royalty analyses go wrong",
        bodyHtml:
          "<p>The recurring errors are visible on the face of a report. A rate taken from a database summary without reading the agreement behind it. Comparables drawn from a different industry, or from intangibles with very different profit potential, adopted without the profit potential test the regulations call for. Exclusive and nonexclusive, worldwide and single-country, and early-stage and proven licenses mixed in one set without adjustment. Settlement licenses treated as ordinary market transactions. A royalty base that differs between the controlled license and the comparables. A post-royalty margin test applied to a licensee that holds local intangibles of its own, or a royalty that leaves the licensee with years of losses its routine functions cannot explain. A profit split that measures relative contribution with a choice of years or useful lives that happens to favor the retaining side. A trademark royalty charged on top of a distributor's purchase price that already pays for the brand, so that the same intangible is paid for twice.</p><p>On the other side, a report that rejects every comparable license as different without proposing a better benchmark has left the rate unanswered, and a report that relies on legal ownership alone, without engaging the functions the record shows, has answered a question the tribunal may not ask. The <a href=\"/guides/how-to-rebut-an-economic-damages-report\">rebuttal guide</a> lists the questions that expose an unsupported input, the <a href=\"/services/expert-rebuttal-and-report-review\">report review</a> service describes how an opposing royalty analysis is tested one comparable and one assumption at a time, and the <a href=\"/services/transfer-pricing-expert-witness\">transfer pricing expert witness</a> page describes the affirmative analysis a royalty benchmark is built from.</p>",
      },
    ],
    faqs: [
      {
        question: "Can a royalty rate from patent litigation benchmark an intercompany license?",
        answer:
          "Only with care. A litigated reasonable royalty assumes validity and infringement and is shaped by the facts of that case, and a settlement license reflects the cost and risk of the litigation. Either can inform the analysis as one data point, but a transfer pricing benchmark rests on licenses agreed between unrelated parties for comparable rights in the ordinary course of business.",
      },
      {
        question: "Does an intercompany royalty have to change if the licensed product earns far more than projected?",
        answer:
          "For tax purposes it can. The commensurate-with-income rule lets the rate in a license covering several years be adjusted in later years to track the income the intangible actually produces, subject to exceptions the regulations list. In a commercial or shareholder dispute, the agreement and the claim decide whether later profitability matters at all.",
      },
      {
        question: "Who earns the return on an intangible that one affiliate owns and another develops?",
        answer:
          "Under the U.S. regulations the legal owner is generally treated as the owner unless that is inconsistent with the economic substance, and the developer is compensated for the functions it performs. The OECD Guidelines look to which companies perform and control the development, enhancement, maintenance, protection, and exploitation functions, so the two frameworks can allocate the return differently.",
      },
    ],
    sources: refsToSources(["TREAS_REG_1_482_4", "TREAS_REG_1_482_5", "TREAS_REG_1_482_6", "IRC_482", "OECD_TP_GUIDELINES", "IRS_APMA_REPORT_2025"]),
    related: [
      { title: "Transfer Pricing Methodology", href: "/methods/transfer-pricing-methods" },
      { title: "Transfer Pricing Disputes Explained", href: "/guides/transfer-pricing-disputes-explained" },
      { title: "Business Valuation Approaches", href: "/methods/business-valuation-approaches" },
      { title: "Transfer Pricing Expert Witness", href: "/services/transfer-pricing-expert-witness" },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
