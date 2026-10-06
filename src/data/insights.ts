import type { Source } from "./types";
import type { RelatedItem } from "@/components/RelatedContent";
import { refsToSources } from "./references";

export interface InsightPost {
  slug: string;
  title: string;
  /** Shorter <title> form (target: under 60 chars with the brand suffix). The H1, cards, and the news sitemap keep `title`. */
  metaTitle?: string;
  /** Hero lead paragraph and hub card copy (not the meta description). */
  excerpt: string;
  /** Written meta description (110-160 chars, a complete sentence); never an auto-cut of `excerpt`. */
  metaDescription: string;
  category: string;
  /**
   * Body copy. Paragraphs are separated by blank lines. A paragraph that starts
   * with `## ` renders as an <h2> carrying a slug id (see insightBlocks), and
   * the headings feed the in-page contents list. Prose uses the inline-link
   * marker syntax from src/lib/richtext.tsx and is citation-free (case names
   * such as Daubert and Frye are proper nouns, not citations).
   */
  content: string;
  /** Registry-backed references, rendered by SourcesBlock at the foot of the post. */
  sources?: Source[];
  publishedDate: string;
  /** Defaults to publishedDate for E-E-A-T signaling; override when content is materially updated. */
  dateModified?: string;
  /** Team member slug for the AuthorByline. Falls back to the "<ORG_NAME> Editorial Team" byline when unset. */
  authorSlug?: string;
  /** Curated cross-links to the guide, method, service, and paper pages the post discusses. */
  related?: RelatedItem[];
}

// Related cards are built through this helper rather than object literals so
// the file carries no `title:` key text: scripts/prerender.mjs zips every
// `slug:` in this file with every `title:` positionally, and a second `title:`
// per entry would mis-pair the shells.
const link = (title: string, href: string, description: string): RelatedItem => ({ title, href, description });

// Each entry starts with `slug` (scripts/prerender.mjs and generate-sitemap.mjs
// split entries on that line and read dateModified/publishedDate per block).
export const insightPosts: InsightPost[] = [
  {
    slug: "daubert-vs-frye-expert-testimony-standards",
    sources: refsToSources(["DAUBERT", "FRYE", "FRE_702", "KUMHO_TIRE", "GE_JOINER"]),
    authorSlug: "christopher-skerritt",
    dateModified: "2026-09-02",
    title: "Daubert vs. Frye: Admissibility Frameworks for Economic Damages Testimony",
    metaTitle: "Daubert vs. Frye: Economic Damages Testimony",
    metaDescription:
      "Daubert asks if an expert's method is reliable and reliably applied; Frye asks if it is generally accepted. Neither routinely excludes economic testimony.",
    excerpt:
      "Daubert and Frye are the two framework families that govern expert testimony in U.S. courts: Daubert asks whether a method is reliable and reliably applied, and Frye asks whether it is generally accepted in the field. Neither framework routinely excludes forensic economic testimony; challenges target inputs the record does not support.",
    category: "Legal",
    publishedDate: "2025-02-18",
    related: [
      link("Daubert vs. Frye in Federal and State Court", "/guides/federal-vs-state-court-daubert", "Which framework a venue applies and what to ask before the report is final."),
      link("Expert Witness Testimony Guide", "/knowledge/expert-witness-testimony-guide", "The report, the deposition, and the trial presentation for economic testimony."),
      link("Building a Daubert-Ready Economic Damages Report", "/white-papers/daubert-ready-economic-damages-report", "How each input is stated, sourced, and made testable."),
    ],
    content: `Daubert and Frye are the names attorneys use for the two families of expert admissibility framework in U.S. courts. Under Daubert, which federal courts and most state courts follow, the trial judge decides whether an expert's method is reliable and reliably applied to the facts of the case. Under Frye, which a smaller number of states retain, the question is whether the method is generally accepted in the relevant professional community. Which framework applies shapes how an economic damages report is written, how the economist is prepared for deposition, and how an opposing report is challenged. Attorneys are responsible for confirming the governing framework against primary sources.

## Two framework families

The two families are not two settings of the same rule. The Daubert framework lists several factors and treats general acceptance as one of them; the Frye framework asks the general-acceptance question alone. Federal courts apply Daubert, most states apply it or a close variant, and the remaining states apply Frye or a hybrid. The [[/guides/federal-vs-state-court-daubert|federal versus state court]] guide lists the questions to ask about a venue before the report is finalized.

## The reliability framework

Under the Daubert framework, the trial judge acts as a gatekeeper with an affirmative obligation to ensure that expert testimony meets threshold requirements of reliability and relevance before the jury hears it. The non-exclusive factors include whether the method has been tested, whether it has been subjected to peer review and publication, its known or potential rate of error, the existence and maintenance of controlling standards, and whether the method is generally accepted in the relevant professional community. General acceptance is one factor among several rather than the sole criterion, and the inquiry applies to technical and other specialized knowledge, including economics, not only to laboratory science.

## The general-acceptance framework

The Frye framework asks a narrower question: whether the expert's method is generally accepted in the relevant community. Courts applying it do not separately evaluate testability, peer review, or error rates. The framework is sometimes described as more conservative toward novel methods and more permissive toward established ones, and for forensic economics the practical difference is small, because the discipline's core methods are established under either test.

## Why the discipline itself is rarely excluded

What those methods are matters for the analysis. Projection of earnings from documented history with published wage growth, [[/methods/worklife-expectancy|worklife expectancy]] from published tables, replacement cost valuation of household services from time-use and occupational wage data, personal consumption deductions from household expenditure data, and [[/methods/present-value-and-discounting|discounting at low-risk yields]] are taught in the field's literature, published in its journals, and applied by economists on both sides of the bar. Challenges to economic testimony therefore seldom argue that the discipline is unreliable. They argue that the economist's inputs are unsupported by the record or that the method was not reliably applied to the facts.

## The recurring grounds for challenge

The recurring grounds are familiar. An earnings base that departs from the tax returns without explanation. A growth rate drawn from one period and a discount rate from another. A worklife horizon that assumes work to an age no table supports, or a retirement age with no basis in the record. Post-event earnings that ignore a documented return to work, or that adopt a capacity opinion no vocational or medical evidence supports. A death claim without a personal consumption deduction. A lost profits projection for a business with no operating history and no comparable. Courts have held that an opinion connected to the data only by the expert's assertion may be excluded, and each of these gaps is an example.

## The report is the defense

The defense to those challenges is the report itself. A report that states every input, identifies its source, uses published series and tables the other side can check, shows the sensitivity of the result to the contested assumptions, and stays within the economist's field is positioned to be examined on the merits rather than excluded at the threshold. The [[/knowledge/expert-witness-testimony-guide|expert witness testimony guide]] describes how the report, the deposition, and the trial presentation fit together, and the [[/guides/how-to-rebut-an-economic-damages-report|rebuttal guide]] describes how the same gaps are found in an opposing report.

## Hybrid and codified state rules

Practitioners should be aware that several states apply modified or hybrid versions of these frameworks, and some have codified their admissibility rules in evidence statutes. Counsel preparing for expert litigation in an unfamiliar jurisdiction should research the applicable framework against primary sources and the case law applying it to economic testimony in particular.`,
  },
  {
    slug: "components-of-an-economic-damages-report",
    sources: refsToSources(["BLS_CPS", "BLS_ECEC", "BLS_ATUS", "BLS_CEX", "SKOOG_CIECKA_KRUEGER_2011", "TREASURY_YIELD", "NAFE_ETHICS"]),
    authorSlug: "christopher-skerritt",
    dateModified: "2026-09-02",
    title: "Components of an Economic Damages Report",
    metaDescription:
      "A damages report's components in order: records and assumptions, earnings base, horizon, benefits, offsets, household services, present value, and sensitivity.",
    excerpt:
      "An economic damages report is a set of schedules connected by stated assumptions. This post walks through the components in the order they appear in a well-organized report, what each one rests on, and where opposing economists usually disagree, so counsel can read a report critically in an hour.",
    category: "Economics",
    publishedDate: "2026-08-27",
    related: [
      link("How to Rebut an Economic Damages Report", "/guides/how-to-rebut-an-economic-damages-report", "The same components read from the reviewing side, input by input."),
      link("Present Value and Discounting", "/methods/present-value-and-discounting", "How the future portion of each schedule is reduced to a single sum."),
      link("Expert Rebuttal and Report Review", "/services/expert-rebuttal-and-report-review", "Applying this review to an opposing report."),
    ],
    content: `An economic damages report answers one question, what the loss is worth in present dollars, through a series of components that build on each other. Reading a report component by component, with attention to the source of each input, is the fastest way to evaluate it, whether it was prepared for your side or the other. The order below follows the structure of a [[/services/personal-injury-economic-damages|personal injury]] or [[/services/wrongful-death-economic-loss|wrongful death]] report; commercial reports follow a parallel structure with revenue, costs, and the loss period in place of earnings, benefits, and worklife.

## Records reviewed and assumptions adopted

The first component is the records reviewed and the assumptions adopted from other experts. The report lists the tax returns, pay records, benefit statements, medical and vocational opinions, and, where relevant, the life care plan it relied on, and it states which facts were taken from which source. This section tells the reader what the economist knew and what the economist assumed, and it is the first place to look for a gap: a missing year of returns, a medical opinion the economist did not have, or a capacity assumption without a stated basis.

## The earnings base and projection

The second component is the earnings base. The report shows the person's earnings for several years before the event, identifies the components carried forward, such as base wages, overtime, bonuses, or self-employment income, and explains any adjustment for an unusual year. For a self-employed claimant the report separates the owner's labor from the return on the business. The [[/methods/wage-growth-and-earnings-projection|earnings projection]] then carries the base forward with a stated growth rate from a published series over a stated horizon.

## The horizon: worklife and life expectancy

The third component is the horizon. Earnings run over a [[/methods/worklife-expectancy|worklife expectancy]] drawn from published tables for the person's age, sex, education, and labor force status, and the report names the table and the edition. Household services and future care run over life expectancy from the current published life tables. A report that uses a fixed retirement age instead should explain why the record supports it.

## Fringe benefits

The fourth component is [[/methods/fringe-benefits-valuation|fringe benefits]]. The report lists the benefits the person received, values each at the employer's cost from plan documents or, where those are unavailable, from published employer cost data, and states which benefits continue post-event. The common error is a percentage add-on applied on top of wages that already included the benefit, or a published average applied where plan documents were available.

## Post-event earnings and offsets

The fifth component is the post-event stream and the offsets. The report projects post-event earnings and benefits on the same basis as the but-for stream, using pay records where the person has returned to work and the vocational and medical evidence where the person has not, and nets the two streams year by year. In a death claim the report applies a personal consumption deduction from household expenditure data for a household of the same size and income and states the percentage. Collateral payments are shown separately so counsel can apply the venue's rule. The [[/methods/mitigation-and-offsets|mitigation and offsets]] page describes each deduction.

## Household services

The sixth component is [[/methods/household-services-methodology|household services]]: the hours the person performed before the event, from the household's account and time-use data; the hours the person can perform now, from the functional evidence; and the replacement wage rates for the area, from occupational wage data. The schedule shows hours and rates by task category and runs over life expectancy with the household's composition changing over time.

## Present value

The seventh component is present value. The report states the discount rate, the instruments and period it came from, and how it relates to the growth rates applied to each stream, and it discounts each year's future loss back to the valuation date. Past losses are shown separately, in the dollars of the years they occurred, and carried forward where the governing framework allows. The [[/compare/net-vs-gross-discount-rate|net versus gross discount rate]] comparison explains the two presentations.

## Summary and sensitivity analysis

The last component is the summary and the sensitivity analysis. The summary shows past loss, future loss, and the total by category. The sensitivity analysis shows how the total changes under the alternatives most likely to be contested, usually the growth rate, the discount rate, the worklife horizon, the post-event earnings, and the consumption percentage. A report that presents its sensitivity is harder to attack, because the economist has already shown what a different input does to the number.

## Where the disputes actually are

Most disputes between opposing economists come down to a few of these inputs, not to the framework. Reading a report in this order, and asking for the source of each input as you go, narrows the disagreement to the schedules that actually differ, which is where deposition and trial preparation should concentrate. The [[/services/expert-rebuttal-and-report-review|rebuttal service]] applies this review to an opposing report.`,
  },
  {
    slug: "what-a-w-2-adds-to-a-lost-earnings-claim",
    sources: refsToSources(["BLS_CPS", "BLS_ECEC"]),
    authorSlug: "christopher-skerritt",
    dateModified: "2026-09-07",
    title: "What a W-2 Adds to a Lost Earnings Claim",
    metaDescription:
      "A W-2 fixes an employee's gross wages, retirement deferrals, and health coverage cost for one year; the economist uses it to set and check the earnings base.",
    excerpt:
      "The W-2 is the first record an economist asks for in a lost earnings claim, because it fixes what an employer actually paid a person in a year, and it says more than the wage figure most readers stop at. This post explains what each box adds to the earnings base, what the form cannot tell you, and which records fill the gaps.",
    category: "Records",
    publishedDate: "2026-09-07",
    related: [
      link("How Lost Earnings Are Calculated", "/guides/how-lost-earnings-are-calculated", "Where the earnings base sits in the full calculation."),
      link("Fringe Benefits Valuation", "/methods/fringe-benefits-valuation", "Valuing the employer contributions a W-2 only hints at."),
      link("Lost Earnings and Earning Capacity Analysis", "/services/lost-earnings-and-earning-capacity", "The analysis the W-2 feeds."),
    ],
    content: `A W-2 is the annual wage and tax statement an employer issues to each employee and files with the government, and in a [[/services/lost-earnings-and-earning-capacity|lost earnings claim]] it is the first record the economist reads. It fixes, for one calendar year, what the employer paid the person in wages, what was withheld, what the person deferred into a retirement plan, and, in several of its boxes, what the employer contributed toward benefits. A run of W-2s across the years before an injury or a termination is the backbone of the earnings base, and the boxes beyond the wage figure are where the form earns its place.

## The wage figure is three figures

The form reports wages three ways, and they differ. The wage figure subject to income tax excludes what the person deferred into a retirement plan and what was paid for health coverage through a pre-tax arrangement. The Social Security wage figure includes the retirement deferral but is capped at the annual wage base, so for a higher earner it understates the year. The Medicare wage figure includes the deferral and has no cap, which makes it the closest of the three to gross compensation. The economist starts from the Medicare figure, adds back the pre-tax health premiums the form does not show, and reconciles the result to the pay stubs, so the earnings base is gross pay and not a tax concept.

## Deferrals show what the person chose to save

The coded entries at the foot of the form report elective deferrals into a retirement plan, and the amount says two things. It is part of the wages the person earned, so it belongs in the earnings base even though the taxable wage figure leaves it out. It is also evidence of the plan itself: an employee deferring into a plan usually had an employer match, and the [[/methods/fringe-benefits-valuation|fringe benefits valuation]] treats the match as compensation lost. The form does not report the match, so the deferral is the prompt to ask for the plan statement that does.

## The health coverage box hints at a benefit the form does not value

Many employers report the total cost of employer-sponsored health coverage on the form, and the figure combines the employer's share and the employee's share. It confirms that the person had coverage and roughly what the plan cost, which is enough to know that a benefit loss exists, but not enough to value it, because the loss is the employer's share alone. The pay stubs or the benefits statement separate the two, and the economist uses the form's figure to check that the separated figures add up rather than as the value itself.

## Several years of forms make a history

One form is a snapshot; five or more are a history. Read together, the wage figures show the growth in the person's own earnings, which the economist compares with published wage growth for the occupation to decide whether the person was tracking the market, outpacing it through promotion, or falling behind it. They show whether overtime and bonuses were a regular feature or a single year's event, since a year with unusual overtime stands out against its neighbors. They show job changes, because each employer issues its own form, and a year with two forms marks a transition the record should explain. The [[/methods/wage-growth-and-earnings-projection|earnings projection]] rests on this history.

## What the form cannot tell you

The form reports totals, not hours or rates. It cannot say whether a wage figure reflects full-time work at a modest rate or part-time work at a high one, and it cannot show a mid-year raise, so the hourly rate and the schedule come from the pay stubs and the employer's records. It says nothing about self-employment income, which arrives on other forms and is analyzed differently because it mixes labor income with the return on a business. It reports the employer's health coverage cost without splitting it, and it does not report the retirement match, paid leave, or the employer's legally required contributions at all. Each gap has a record that fills it, and the W-2 is the map to those records.

## Where the disputes start

Opposing economists rarely disagree about what a W-2 says; they disagree about which figure to use and which years to include. A report built on the taxable wage figure understates the base by the retirement deferral and the pre-tax premiums. A report that projects from the highest year rather than from a representative run overstates it. A report that carries a discontinued bonus forward, or drops a bonus the record shows was routine, has made a choice the forms alone cannot defend, and the [[/guides/how-to-rebut-an-economic-damages-report|rebuttal guide]] describes how the choice is tested.

## What to produce with it

The forms are most useful with their companions: the year-end pay stub for each year, which shows the hours, the rate, the employer's premium share, and the retirement match; the retirement plan statement; the benefits statement or summary plan description; and the tax returns, which carry the self-employment and investment income the form omits. Producing the set together lets the economist build the earnings base in one pass and reconcile every figure, and it removes the most common reason a damages report is revised after deposition, which is a record that arrived late. The [[/guides/how-lost-earnings-are-calculated|lost earnings guide]] shows where each record enters the schedules.`,
  },
  {
    slug: "what-tax-returns-add-to-a-lost-earnings-claim",
    sources: refsToSources(["BLS_CPS", "BLS_ECI"]),
    authorSlug: "christopher-skerritt",
    dateModified: "2026-09-14",
    title: "What Tax Returns Add to a Lost Earnings Claim",
    metaDescription:
      "A tax return shows every income source in a year, the self-employment income no wage form reports, and the other earners; here is how the economist reads it.",
    excerpt:
      "The tax return is the one record that shows all of a person's income in a year, from every employer and every business, alongside the income of a spouse and the deductions that reveal how a business was run. This post explains what each part of the return adds to the earnings base, where it misleads, and which records it points to next.",
    category: "Records",
    publishedDate: "2026-09-14",
    related: [
      link("How Lost Earnings Are Calculated", "/guides/how-lost-earnings-are-calculated", "Where the earnings base sits in the full calculation."),
      link("Wage Growth and Earnings Projection", "/methods/wage-growth-and-earnings-projection", "Carrying the base the returns establish forward."),
      link("Lost Earnings and Earning Capacity Analysis", "/services/lost-earnings-and-earning-capacity", "The analysis the returns feed."),
    ],
    content: `A tax return is the annual statement of everything a person, or a married couple filing together, reported as income, and in a [[/services/lost-earnings-and-earning-capacity|lost earnings claim]] it is the record the economist reads second, right after the wage forms. The wage form reports one employer's payments; the return reports them all, and it reports the income no wage form ever shows: the earnings of a business the person owned, the rent and the interest the household received, the pension already being drawn, and the earnings of the other spouse. A run of returns across the years before an injury, a death, or a termination is the frame the rest of the records fit into.

## Every source of income in one place

The first page of the return lists income by type: wages, interest, dividends, business income, capital gains, retirement distributions, rental income, unemployment compensation, and the rest. For the earnings base the economist wants the labor income, the money the person earned by working, and the return separates it from the income the household's assets produced. That separation matters because an injury or a death ends the labor income and leaves the asset income in place, so a base that quietly included dividends or rent would overstate the loss. The return also confirms that no employer was missed: a year with wages from three employers shows three wage forms should be in the file, and a gap between the wage line and the forms produced means a record is missing.

## Self-employment income comes only from the return

For a person who owned a business, the return is not one record among several but the primary one, because no employer issued a wage form. The business schedule reports gross receipts, each category of expense, and the net profit, and the economist reads all three. Gross receipts show the scale of the business and its trend. The expense lines show how the business was run: a large vehicle deduction, a home office, depreciation on equipment, and payments to family members are each a fact about what the net profit means. The net profit itself mixes two things, the value of the owner's own labor and the return on the money and equipment invested in the business, and only the first is lost earnings. The [[/guides/how-lost-earnings-are-calculated|lost earnings guide]] describes how the owner's labor is separated from the return on the business, and the return supplies the figures that separation starts from.

## Several years of returns make a history

One return is a snapshot and a run of them is a history. Read together, the labor income lines show the growth of the person's own earnings, which the economist compares with the published growth of wages for the occupation to see whether the person tracked the market, outpaced it, or fell behind. They show whether a business was growing, stable, or declining before the event, which is the single most contested question in a self-employed claim, because the projection carries the trend forward and a defense report will argue the trend was already turning. They show the years a business had losses and the years it had none, and they show a change in filing status, a move, or a new dependent, each of which dates a change in the household the projection has to reflect. The [[/methods/wage-growth-and-earnings-projection|earnings projection]] rests on this history.

## Income of the spouse and the household

A joint return reports the other spouse's income alongside the person's own, and it is relevant in two ways. In a wrongful death claim the household's total income sets the row the personal consumption tables are read from, so the spouse's earnings change the deduction even though they are not part of the loss. In an injury claim the spouse's earnings are not deducted, but a change in them after the event, a spouse who left work to provide care or one who took a second job to replace the lost income, is a fact the report notes and, where the framework recognizes it, values. The return also shows dependents, which fix the household's size on the date of the event and, with their ages, date the changes to come.

## What the return cannot tell you

The return reports what was taxable, not what was earned. Retirement deferrals, pre-tax health premiums, and other salary reductions leave the wage line before it reaches the return, so the wage line understates gross pay and the wage form's Medicare figure is the better base. Fringe benefits do not appear on the return at all, and the [[/methods/fringe-benefits-valuation|fringe benefits valuation]] draws on plan documents and published employer cost data instead. Cash income that was not reported is not on the return, and a claim that argues the person earned more than was reported has a problem the economist cannot solve with a projection. The business schedule shows expenses as the tax rules define them, so a depreciation deduction is a tax concept rather than a cash outlay, and the economist adjusts it before reading the net profit as the owner's income.

## Where the disputes start

Opposing economists rarely disagree about what the returns say; they disagree about which years to use and what to do with a trend. A report built on the best year of a run overstates the base, and one built on the worst year understates it, so a representative run of years is the usual answer and the choice of years is the usual argument. A self-employed claim divides on whether the business trend was rising or falling on the date of the event and on how much of the net profit was the owner's labor. A report that reads the returns selectively, ignores a loss year, or treats the whole net profit as lost earnings is exposed on each point, and the [[/guides/how-to-rebut-an-economic-damages-report|rebuttal guide]] describes how the choice is tested.

## What to produce with it

Complete returns with every schedule, for several years before the event and for every year since, are the request. The wage forms reconcile to the wage line; the business schedule reconciles to the business's own books, the general ledger, and the bank statements; the depreciation schedule explains the deduction; and the filing status and the dependents fix the household. Producing the set together lets the economist build the earnings base in one pass, separate the labor income from the rest, and reconcile every figure to a second record, which is what keeps a damages report from being revised after deposition when a late schedule changes a number.`,
  },
  {
    slug: "what-pay-stubs-add-to-a-lost-earnings-claim",
    sources: refsToSources(["BLS_CPS", "BLS_ECEC", "BLS_ECI"]),
    authorSlug: "christopher-skerritt",
    dateModified: "2026-09-21",
    title: "What Pay Stubs Add to a Lost Earnings Claim",
    metaDescription:
      "A pay stub shows the hourly rate, the hours, the overtime, and the deductions that a year-end wage form averages away; here is how the economist reads one.",
    excerpt:
      "The pay stub is the only record that shows how a year's wages were earned: the rate, the hours, the overtime and premium pay, the raise and its date, and the deductions that reveal which benefits the person carried. This post explains what each part of the stub adds to the earnings base, where it misleads, and which records it points to next.",
    category: "Records",
    publishedDate: "2026-09-21",
    related: [
      link("How Lost Earnings Are Calculated", "/guides/how-lost-earnings-are-calculated", "Building the base from the rate and the sustainable hours."),
      link("Fringe Benefits Valuation", "/methods/fringe-benefits-valuation", "Pricing the benefits the deductions reveal."),
      link("Lost Earnings and Earning Capacity Analysis", "/services/lost-earnings-and-earning-capacity", "The analysis the stubs feed."),
    ],
    content: `A pay stub is the statement an employer issues with each payment of wages, and in a [[/services/lost-earnings-and-earning-capacity|lost earnings claim]] it is the record that explains the year-end figures. The wage form reports what a year added up to; the stub reports how it was earned, pay period by pay period: the hourly rate or the salary, the regular hours, the overtime hours and the rate they were paid at, the shift differentials and premiums, the bonus paid in a particular week, and every deduction taken before the net pay was issued. A run of stubs across the periods before an injury, a death, or a termination is how the economist gets from an annual total to a rate of pay that can be projected.

## The rate and the hours are separate facts

The wage form gives one number for the year; the stub gives the two numbers that produced it. A person who earned a given annual figure by working a regular schedule at a modest rate is in a different position from one who earned the same figure through long overtime at a lower rate, because the projection has to decide what the person would have gone on earning, and the answer depends on which of the two would have continued. The stub shows the rate, the regular hours, and the overtime hours for the period, and a run of them shows whether the overtime was a steady feature of the job or a burst in one season. The [[/guides/how-lost-earnings-are-calculated|lost earnings guide]] describes how the base is built from the rate and the sustainable hours rather than from the annual total alone.

## Overtime and premium pay are visible only here

Overtime, shift differentials, holiday premiums, on-call pay, and hazard pay are folded into the wage form's gross figure without a trace. The stub itemizes each, and the itemization matters twice. It tells the economist how much of the base depends on hours beyond the regular schedule, which is the part most open to dispute, and it tells the economist what the rate for those hours was, so the projection can carry the premium forward at the terms the employer actually paid. A union contract or an employer policy usually fixes the premium rates, and the stub confirms the contract was applied as written.

## The deductions show the benefits the person carried

The deduction lines are the part of the stub that the earnings figures do not reach. Employee contributions to a retirement plan show the person was enrolled and at what rate, which in turn establishes the employer's matching contribution the plan document describes. Health, dental, and vision premiums show which coverage the person elected and at what tier, which is the starting point for valuing the employer's share. Union dues confirm the bargaining unit and point to the contract. Contributions to a flexible spending or health savings account, life and disability insurance premiums, and garnishments each tell the economist something about the compensation package or the household. The [[/methods/fringe-benefits-valuation|fringe benefits valuation]] draws on these lines together with the plan documents and the published employer cost data to put a value on the benefits the wage figures leave out.

## Year-to-date figures date the loss

Every stub carries year-to-date totals beside the current-period figures, and the last stub before the event fixes what the person had earned in the year to that date, which the wage form cannot do. The year-to-date column also dates a raise: the stub on which the rate changed, and the size of the change, are the evidence that the person was on a rising pay path and of how steep it was. In an employment matter the stubs on either side of a demotion or a change in hours show what the adverse action cost in the pay periods that followed, and in an injury matter the stubs after a return to light duty show the reduced hours or rate the restrictions produced. The [[/methods/wage-growth-and-earnings-projection|earnings projection]] uses the dated raises to place the person on the pay scale before the event, and the [[/services/employment-and-wage-loss-damages|employment damages]] analysis uses the post-event stubs for the interim earnings offset.

## Several stubs make a pattern

One stub is a snapshot and a run of them is a pattern. Read across a year or more, the stubs show whether the hours were stable or volatile, whether overtime clustered in a season, whether a bonus recurred, and whether the rate stepped up on a schedule the employer's pay scale would predict. The pattern is what lets the economist choose a representative base rather than the best or the worst period, and it is what a defense economist will examine when arguing the base was built on an unusual stretch. A run that reconciles to the year-end wage form, period by period, is the strongest foundation an earnings base can have.

## What the stub cannot tell you

The stub reports what the employee was paid and what was deducted from it, not what the employer spent. The employer's share of health premiums, the matching retirement contribution, and the payroll taxes the employer paid are absent, and the [[/insights/what-a-w-2-adds-to-a-lost-earnings-claim|W-2 post]] and the plan documents fill that gap. A bonus paid outside the regular payroll, an expense reimbursement, or income from a second employer will not appear, and the [[/insights/what-tax-returns-add-to-a-lost-earnings-claim|tax return]] is the record that shows every source. A stub also shows nothing about why the hours were what they were: whether a low-hours period reflected the employer's schedule, a leave, or a choice is a fact the record has to establish elsewhere.

## Where the disputes start

The disputes concern which periods to average, how much overtime to carry forward, and whether a raise shown on the stubs would have continued. A base built from the highest-overtime quarter overstates, and one built from a period of reduced hours understates, so the choice of periods is the argument, and the stubs are the evidence both sides read. Overtime that the employer has since eliminated, or that depended on a project that ended, is the defense's usual target, and a report that carries it forward without addressing the employer's own records is exposed. The [[/guides/how-to-rebut-an-economic-damages-report|rebuttal guide]] describes how the choice of periods is tested.

## What to produce with it

Every stub for at least a year before the event, and every stub since, is the request, together with the wage forms they reconcile to, the employer's pay scale or the collective bargaining agreement that sets the rates, and the plan documents behind the deductions. Producing the run complete, rather than a sample, lets the economist build the rate and the sustainable hours from the whole pattern, date the raises, value the benefits from the elections the deductions show, and reconcile the base to the year-end form, which is what keeps the number from moving when the missing periods surface at deposition.`,
  },
  {
    slug: "what-union-contracts-add-to-a-lost-earnings-claim",
    sources: refsToSources(["BLS_CPS", "BLS_ECEC", "BLS_ECI"]),
    authorSlug: "christopher-skerritt",
    dateModified: "2026-09-28",
    title: "What Union Contracts Add to a Lost Earnings Claim",
    metaTitle: "What a Union Contract Adds to a Wage Claim",
    metaDescription:
      "A union contract fixes the wage scale, the steps, the premiums, and the benefit contributions an economist would otherwise estimate; here is how it is read.",
    excerpt:
      "For a union member, the collective bargaining agreement is the one record that states in advance what the person would have been paid: the wage scale and its scheduled increases, the steps and the seniority that drive them, the overtime and shift premiums, and the employer's contributions to health, pension, and annuity funds. This post explains what each article of the contract adds to the earnings projection, what the contract cannot show, and which records it points to next.",
    category: "Records",
    publishedDate: "2026-09-28",
    related: [
      link("Fringe Benefits in a Lost Earnings Claim", "/guides/fringe-benefits-in-a-lost-earnings-claim", "Pricing the fund contributions the contract sets."),
      link("Wage Growth and Earnings Projection", "/methods/wage-growth-and-earnings-projection", "Projecting from a scale instead of a guess."),
      link("Lost Earnings and Earning Capacity Analysis", "/services/lost-earnings-and-earning-capacity", "The analysis the contract feeds."),
    ],
    content: `A collective bargaining agreement is the contract between an employer and the union that represents its workers, and for a member of that unit it is the record that states in advance most of what a [[/services/lost-earnings-and-earning-capacity|lost earnings claim]] would otherwise have to estimate. The wage forms and the pay stubs show what the person was paid; the agreement shows what the person was entitled to be paid, this year and in each year of its term, at each step of the classification, for each hour of overtime and each shift outside the day, and it shows what the employer was obliged to contribute on the person's behalf to the health, pension, and annuity funds. Read with the person's classification, seniority date, and hours, it turns the projection from an inference about raises into a reading of a schedule.

## The wage scale replaces the guess about raises

For an employee without a contract, the economist projects future earnings by choosing a growth rate from the published series for the occupation and the economy, and the choice is one of the most contested inputs in the report. A union scale removes the guess for the term of the agreement. The wage article states the hourly rate for each classification in each year of the contract, so the raises for those years are not projected but read, and the report grows the rate exactly as the agreement does. Beyond the term, the economist still needs a growth rate, but the history of the prior agreements, which the union and the employer keep, shows what the negotiated increases have been over a long period and is a better starting point than a series for all workers. The [[/methods/wage-growth-and-earnings-projection|earnings projection]] method describes how the negotiated history and the published series are combined past the contract's expiration.

## Steps and seniority date the path

Most scales are not a single rate but a ladder: an apprentice or probationary rate, a set of steps tied to months or hours of service, and a journeyman or top rate reached after a stated period. Where the person stood on the ladder at the event, and when the next step would have arrived, are facts the agreement fixes from the seniority date and the hours worked, and the report places the person on the scale and moves them up it on the contract's timetable. The difference between a projection that leaves an apprentice at the apprentice rate and one that carries them to the journeyman rate on schedule is the difference the agreement resolves, and the seniority article also governs layoff order, recall rights, and shift bidding, each of which bears on how steady the hours would have been.

## The premium provisions price the overtime and the shifts

The overtime article states when the premium rate applies, by the day or by the week, and at what multiple; the shift differential article states the addition for evening and night work; and the holiday, call-in, and travel provisions state the rest. The [[/insights/what-pay-stubs-add-to-a-lost-earnings-claim|pay stubs]] show how much premium pay the person actually received; the agreement shows the terms under which it was paid and confirms that the stubs applied them correctly. For the projection, the agreement tells the economist what a continuing pattern of overtime would have been worth at the contract rate rather than at an assumed multiple, and the hours provisions and any guaranteed-hours clause bear on whether the pattern was likely to continue.

## The benefit articles show what the employer paid

For a non-union employee the value of health coverage and retirement contributions is estimated from the plan documents and the published employer cost data. A union agreement usually states the employer's contribution to the health and welfare fund and to the pension or annuity fund as a dollar amount per hour worked or per month, and the figure is the employer's cost of the benefit, which is the number the [[/methods/fringe-benefits-valuation|fringe benefits valuation]] is trying to establish. The contribution rates change with each contract year, and the schedule is on the page. The [[/guides/fringe-benefits-in-a-lost-earnings-claim|fringe benefits guide]] explains why the employer's cost rather than the plan's payout is the measure in most claims, and the agreement is the direct evidence of that cost.

## Multi-employer pensions have their own arithmetic

Many union pension plans are multi-employer defined benefit plans in which the benefit accrues by the hour or the year of covered service, at a rate the plan document states, and the employer's contribution funds the plan rather than the person's account. For those plans the lost contributions and the lost benefit are two different measures, and which one the report should use depends on the framework the venue applies. The agreement gives the contribution rate; the plan document and the person's annual statement give the accrual rate and the credited service to date; and the report states which measure it adopts and shows the other. A person who was short of vesting at the event, or who had reached a service milestone that changed the accrual, is a case where the difference between the two measures is large.

## The term and the successor agreement

An agreement runs for a stated term, and the scale it fixes ends with it. The projection therefore has two regions: the contract years, where the raises are read, and the years beyond, where they are projected. Where a successor agreement has been signed by the time of the report, its scale extends the first region and the economist uses it; where negotiations are open, the report says so and projects from the negotiated history. An expired agreement whose terms continue in force by practice or by law is treated as the last known scale, and the report explains the assumption. In a [[/case-types/workers-compensation/illinois|Illinois workers' compensation matter]], as in any venue, the years the contract actually governs are the ones least open to dispute.

## What the contract cannot tell you

The agreement states entitlements, not events. It does not show how many hours the person actually worked, whether they were laid off and recalled, whether they took the overtime offered, or whether they moved between classifications, and the pay stubs, the employer's payroll records, and the union's dispatch or hours records supply those facts. It does not show the person's individual benefit elections, the pension credit accrued, or the vesting status, which the fund statements do. And for a hiring-hall trade where the person worked for many employers under one agreement, the agreement fixes the rate but the hours come from the union's records rather than any single employer's.

## Where the disputes start

The disputes concern the hours and the path, not the rate. Whether the person would have worked the hours the projection assumes, whether the overtime pattern would have continued, whether they would have reached the top step on schedule or been laid off in a downturn, and what the scale would have done after the contract expired are the arguments, and each is about a fact the agreement does not decide. A report that reads the rate from the scale and then assumes full-time hours in a trade with seasonal layoffs has answered the easy question and skipped the hard one, and the [[/guides/how-to-rebut-an-economic-damages-report|rebuttal guide]] lists the questions that follow.

## What to produce with it

The current agreement and every prior agreement covering the person's years in the unit, the successor agreement if one exists, the wage and contribution schedules incorporated by reference, the health and pension plan documents, the person's annual fund statements, and the union's hours or dispatch records for a hiring-hall trade, together with the pay stubs and wage forms they reconcile to. Producing the set lets the economist place the person on the scale, read the raises for the contract years, price the benefits at the employer's contribution rate, and project past the term from the negotiated history rather than from a series for all workers.`,
  },
  {
    slug: "what-benefit-summaries-add-to-a-lost-earnings-claim",
    sources: refsToSources(["BLS_ECEC","BLS_ECI","BLS_CPS"]),
    authorSlug: "christopher-skerritt",
    dateModified: "2026-10-05",
    title: "What Benefit Summaries Add to a Lost Earnings Claim",
    metaTitle: "What Benefit Summaries Add to a Wage Claim",
    metaDescription:
      "The benefits summary and the plan documents behind it show what coverage the person had and what the employer paid for it; here is how an economist reads them.",
    excerpt:
      "The benefits summary an employer hands a new hire, and the summary plan descriptions and annual statements behind it, are the records that show what coverage the person actually had and what the employer paid to provide it: the health plan and the share of the premium the employer carried, the retirement plan and its matching or contribution formula, the vesting schedule, the life and disability coverage, and the paid leave. This post explains what each part of the package adds to the fringe benefit component of a lost earnings claim, what the summaries cannot show, and which records they point to next.",
    category: "Records",
    publishedDate: "2026-10-05",
    related: [
      link("Fringe Benefits in a Lost Earnings Claim", "/guides/fringe-benefits-in-a-lost-earnings-claim", "Why the employer's cost is the usual measure and how each benefit is priced."),
      link("Fringe Benefits Valuation", "/methods/fringe-benefits-valuation", "The method the summaries feed."),
      link("Lost Earnings and Earning Capacity Analysis", "/services/lost-earnings-and-earning-capacity", "The analysis the benefit component belongs to."),
    ],
    content: `A benefits summary is the document an employer gives its employees to describe the package that comes with the job: the health, dental, and vision plans and what the employee pays toward each, the retirement plan and how the employer contributes to it, the life and disability insurance, and the paid time off. Behind it sit the summary plan descriptions the law requires for each plan and the annual statements each plan sends its participants. Together they are the records that turn the fringe benefit component of a [[/services/lost-earnings-and-earning-capacity|lost earnings claim]] from an estimate drawn from national averages into a figure built from what this person actually had and what this employer actually paid for it.

## The health plan and the premium the employer paid

The largest single benefit in most packages is health coverage, and its value to the claim is the employer's cost of providing it, not the coverage's worth to the person or the premium the person would pay to replace it. The benefits summary states the plan tiers offered and the employee contribution for each; the open enrollment materials or the payroll deduction history show which tier the person elected; and the employer's premium rate sheet or the plan's annual statement shows the total premium for that tier. The employer's share is the difference, and it is the number the [[/methods/fringe-benefits-valuation|fringe benefits valuation]] carries forward. A person who elected family coverage and a person who waived coverage because a spouse's plan covered them have very different benefit losses on the same job, and only the elections show which one applies.

## The retirement plan formula and the vesting schedule

The summary plan description for a defined contribution plan states the employer's formula: a match of a stated percentage of what the employee defers up to a cap, a fixed contribution regardless of deferral, a profit-sharing allocation, or some combination. The annual participant statement shows what the employer actually contributed in each year and what the person deferred, which together fix the match the person was earning. The vesting schedule in the same document states when the employer's contributions became the person's, and a person who left before full vesting forfeited a portion that the claim has to treat correctly. For a defined benefit pension the summary states the accrual formula and the normal retirement age, and the annual benefit statement shows the credited service and the accrued benefit to date, which are the inputs to a lost pension calculation that the [[/guides/fringe-benefits-in-a-lost-earnings-claim|fringe benefits guide]] describes.

## Life, disability, and the smaller coverages

Employer-paid life insurance, short- and long-term disability coverage, and the dental and vision plans are each a cost the employer carried, and the summary states who paid for each. Where the employer paid the full premium, the plan's rate schedule gives the cost per employee and the benefit is valued at that cost. Where the coverage was employee-paid through payroll deduction, it is not a lost employer benefit at all, though the deduction history still matters because it shows what the person was spending from gross pay. Disability coverage has a second role: a plan that is now paying the person a benefit may be an offset the venue requires or forbids, and the summary plan description states whether the plan has a right to be repaid from a recovery.

## Paid leave and the question of double counting

Vacation, sick leave, and holidays appear in every benefits summary, and whether they belong in the benefit component depends on how the earnings base was built. A person paid a salary received their leave as part of it, and the pay records already carry it; adding the value of the leave again counts it twice. A person paid by the hour who was paid for holidays and vacation days not worked received that pay in the wage forms as well. The leave provisions matter chiefly for the hours assumption: a projection that assumes the person would have worked every week of the year, and then adds paid vacation on top, has made the error, and the summary is what shows how many weeks the pay actually covered.

## The summary shows the offer, the statements show the take-up

The distinction that organizes all of this is between what was offered and what was taken. The benefits summary describes the package available to everyone in the person's class; it does not show whether the person enrolled, which tier they chose, how much they deferred, or whether they were vested. The enrollment forms, the payroll deduction history, and the annual plan statements show those facts, and the benefit component of the claim rests on them. A report that values the full package from the summary alone has valued the offer, and the first question on cross will be whether the person accepted it.

## The published cost data fill the gaps

Where the plan documents are incomplete, or the employer no longer exists, or the person was between jobs at the event and the claim concerns the benefits a future employer would have provided, the published series on what employers pay for benefits as a share of wages, by industry, occupation, and region, supply the estimate. The economist states which components came from the person's own documents and which from the published averages, and does not mix the two for a single benefit. The [[/insights/what-union-contracts-add-to-a-lost-earnings-claim|union contract]] post describes the one setting where the employer's contribution is written into a contract and no estimate is needed.

## What the summaries cannot tell you

The benefits summary is a description written for employees, not a plan document, and where the two differ the plan document governs. It is dated, and the package the person had at the event may differ from the one described in the summary produced; the open enrollment materials for the relevant years are the check. It shows nothing about the person's health, their dependents, or their expected use of the coverage, none of which bear on the employer's cost. And it does not show whether the person's post-event employment carries benefits of its own, which the mitigation analysis needs and which the new employer's summary and the person's new elections supply.

## Where the disputes start

The disputes are about the measure and the take-up. Whether the employer's cost or the person's replacement cost is the right measure is a question the venue's law and the [[/guides/fringe-benefits-in-a-lost-earnings-claim|fringe benefits guide]] address; whether the person had the coverage the report values is a question the elections and statements answer. A report that applies the national average benefit share to a person whose own documents show a richer or leaner package has substituted an estimate for evidence, and a report that values a benefit the person waived has valued something that was never lost. In a [[/case-types/wrongful-termination/pennsylvania|Pennsylvania wrongful termination matter]], as anywhere, both errors are visible once the plan documents are produced.

## What to produce with it

The benefits summary for each year in the claim, the summary plan description for each plan, the person's enrollment and election forms, the annual participant statements from the retirement and pension plans, the employer's premium rate sheets or the plan's cost schedule, the payroll deduction history, and, for a person who has found new work, the same set from the new employer. Producing the set lets the economist price each benefit at the employer's actual cost, carry only the coverage the person held, treat vesting and paid leave correctly, and state exactly where the person's records end and the published averages begin.`,
  },
  // Transfer pricing (owner request 2026-10-05): the Records series applied to
  // the first record a transfer pricing dispute turns on. No person, figure,
  // or outcome is named.
  {
    slug: "what-intercompany-agreements-add-to-a-transfer-pricing-dispute",
    sources: refsToSources(["TREAS_REG_1_482_1", "TREAS_REG_1_6662_6", "IRS_TP_DOCUMENTATION_FAQS"]),
    authorSlug: "christopher-skerritt",
    dateModified: "2026-10-05",
    title: "What Intercompany Agreements Add to a Transfer Pricing Dispute",
    metaTitle: "Intercompany Agreements in Transfer Pricing",
    metaDescription:
      "An intercompany agreement states the transaction, the price, and who bears which risk; here is how an economist reads it against the conduct and the records.",
    excerpt:
      "The intercompany agreement is the record that states what one company in a group agreed to provide another, at what price, and which of them was to bear which risks: the license and its scope, the distribution or manufacturing arrangement, the services and the costs they are charged from, the loan and its terms, and any clause that resets the price after the year ends. This post explains what each part of an agreement adds to a transfer pricing dispute, how the agreement is tested against what the companies actually did, what it cannot show, and which records it points to next.",
    category: "Records",
    publishedDate: "2026-10-05",
    related: [
      link("Transfer Pricing Disputes Explained", "/guides/transfer-pricing-disputes-explained", "Where transfer pricing disputes arise and how each forum decides them."),
      link("Transfer Pricing Methodology", "/methods/transfer-pricing-methods", "The methods applied to the transactions the agreement describes."),
      link("Transfer Pricing Documentation vs. Expert Report", "/compare/transfer-pricing-documentation-vs-expert-report", "Why the tax study written around the agreement does not end the inquiry."),
    ],
    content: `An intercompany agreement is the contract between two companies in the same group that states what one will provide the other and on what terms: the goods a parent will sell to its distributor, the technology a subsidiary may use and the royalty it will pay, the services a shared service center will perform and how they will be charged, or the loan one affiliate makes to another. In a [[/guides/transfer-pricing-disputes-explained|transfer pricing dispute]] it is the first record the economist reads, because the Treasury regulations respect the written terms, including the allocation of risk between the parties, when they were agreed in writing before the transactions took place and are consistent with the economic substance of what the parties did. The agreement frames the delineation of the transactions that every method in the [[/methods/transfer-pricing-methods|transfer pricing methodology]] is applied to, and the gaps between its text and the parties' conduct are where the analysis looks first.

## The parties and the transactions it covers

The agreement names the legal entities, gives each a role, and defines the transactions: licensor and licensee, principal and limited-risk distributor, contract manufacturer and owner of the product, service provider and recipient, lender and borrower. Those roles carry economic consequences, since a limited-risk distributor is expected to earn a modest and stable return while the principal keeps the residual profit and absorbs the losses, and the economist checks each role against the legal-entity financial statements: whether the company the agreement calls the distributor actually records the sales, whether the manufacturer records the costs of production, and whether the flows on the books match the flows on paper. Master agreements with schedules, amendments, and side letters each change the picture, and the analysis needs every version in force during the years at issue.

## The pricing clause and the year-end adjustment

The pricing clause states how the price is set: a markup on the manufacturer's costs, a resale price less a distributor's margin, a royalty as a percentage of a defined base, a services charge at cost or at cost plus a markup, or an interest rate on a loan. Many agreements add a year-end adjustment clause that resets the price after the books close so that the tested party lands on a target margin or inside a range, which turns the tested party's profit into a fixed return and moves the remaining profit or loss to the other side. The economist reads the clause against the general ledger to see whether the adjustments were actually booked, in what amounts and when, and whether the method in the agreement matches the method in the documentation, since a cost plus pricing policy tested at year end on a distributor margin is a different arrangement from the one the agreement describes. The same adjustment can have consequences for the customs value declared on imported goods, which a separate body of rules governs.

## Risk allocation and the conduct that has to match it

Risk clauses allocate market, inventory, credit, currency, warranty, and product liability risk between the parties, and the allocation drives the expected return: the party that bears a risk earns the reward for bearing it. In testing whether a contractual allocation has economic substance, the regulations give the greatest weight to the parties' actual conduct, and they ask whether the pattern of conduct over time is consistent with the allocation, whether the party said to bear a risk had the financial capacity to absorb the losses it could produce, and which party exercised managerial or operational control over the activities that decide the outcome. A distributor the agreement calls limited-risk but that sets its own prices, holds inventory it cannot return, and absorbs bad debts bears more risk than its label, while a right to return unsold inventory to the supplier shifts risk the other way, which the IRS's own documentation guidance uses as an example of an allocation the analysis has to address.

## Intangibles: ownership, scope, and the royalty base

For a license the agreement fixes who owns the intangible, what rights are granted, and on what base the royalty is paid: the field of use, the territory, exclusivity, duration, rights to improvements, sublicensing, and the definition of net sales or whatever other measure the rate is applied to. The economist compares those terms with the comparable licenses the rate is benchmarked against, because a rate is comparable only to a rate on similar rights and a similar base, and with the functions the record shows, because a licensee that does its own development, marketing, or adaptation may hold intangibles of its own that the agreement never mentions. The [[/guides/intercompany-royalty-rates-in-litigation|intercompany royalty guide]] explains how the rate itself is tested.

## Services, cost bases, and intercompany loans

A services agreement defines the services, the pool of costs they draw on, the allocation key that spreads those costs among the affiliates, and whether the charge is at cost or carries a markup, and the analysis checks each element: whether the services were actually rendered and benefited the recipient, whether activities performed only in the parent's capacity as a shareholder were left out, and whether the allocation key tracks the benefit. A loan agreement states the principal, the interest rate, the maturity, the security, and the repayment terms, and the question is whether an independent lender would have extended the same credit on the same terms to the borrower as it actually stood, given its own credit standing and the support it enjoyed as a member of the group.

## When the agreement was signed

The date matters as much as the text. An agreement signed before the transactions began, and followed in practice, is the strongest evidence of the terms the parties intended. An agreement drafted years into the relationship, after an examination began, or after the results of a risky venture were known is weaker: the regulations treat an allocation of risk made after the outcome is known or reasonably knowable as lacking economic substance, and where there is no written agreement at all, terms can be imputed from the parties' course of conduct. The economist records when each agreement was executed and amended, compares the versions, and notes where the agreements filed in different countries describe the same transaction differently.

## What the agreement cannot tell you

The agreement states what the parties promised, not whether the price produced an arm's length result; that is the work of the method and the comparables. It does not show whether the conduct matched the text, which the invoices, the ledger, the operating records, and the testimony of the people who ran the business show. It does not value the intangibles it licenses or establish that the affiliate it names as owner performed the functions that created their value. And it says nothing about the commercial reality of a company with few employees to which the agreement assigns the most important decisions, a question the functional analysis answers from the record.

## Where the disputes start

In a tax case the disputes start where the label and the substance part: a limited-risk entity that bore real risk, a principal with no one to make its decisions, a year-end adjustment that moved profit after the fact, or a royalty base defined differently from the comparables'. In commercial litigation they start when an agreement drafted for tax purposes between affiliates comes to govern a relationship between companies that are no longer related, after a sale or a spin-off, and its pricing clause is asked to do work it was never written for. In a [[/case-types/partnership-and-shareholder-dispute|shareholder dispute]] they start with agreements the controlling owner caused the company to sign with entities it holds separately, and in a [[/case-types/divorce-and-marital-dissolution|divorce]] with agreements between the owner spouse's company and affiliates the owner controls. In each setting the agreement is where the analysis begins, and the [[/compare/transfer-pricing-documentation-vs-expert-report|documentation versus expert report]] comparison explains why the tax study written around it does not end the inquiry.

## What to produce with it

Every intercompany agreement in force during the years at issue, with its schedules, amendments, side letters, and the drafts and correspondence around its execution; the transfer pricing policy and the documentation reports for each year; the year-end adjustment calculations and the journal entries that booked them; the intercompany invoices and the general ledger detail of the intercompany accounts; the legal-entity and segmented financial statements; the board minutes and approvals for the agreements; the tax returns and the information returns that report transactions with related parties; any advance pricing agreement and its annual reports; and, for imported goods, the customs entries. Producing the set lets the economist delineate the transactions from the documents, test the terms against the conduct, and apply the method to the transactions the companies actually entered into.`,
  },
];

export function getPostBySlug(slug: string): InsightPost | undefined {
  return insightPosts.find((p) => p.slug === slug);
}

/**
 * Posts to offer in the "Related Articles" sidebar. Same-category posts first;
 * when no other post shares the category (the two launch posts are Legal and
 * Economics), fall back to the other posts so the block never renders empty.
 */
export function getRelatedPosts(slug: string, category: string): InsightPost[] {
  const same = insightPosts.filter((p) => p.slug !== slug && p.category === category);
  return same.length ? same : insightPosts.filter((p) => p.slug !== slug).slice(0, 3);
}

export const insightCategories = ["All", "Legal", "Economics", "Records"];

/**
 * Human-readable publication date for an ISO `YYYY-MM-DD` string, e.g.
 * "February 18, 2025". Date-only ISO strings parse as UTC midnight, so the
 * formatting is pinned to UTC as well; otherwise every viewer west of
 * Greenwich would see the previous calendar day while the BlogPosting
 * datePublished, the byline, and the news sitemap all carried the ISO date.
 */
export function formatPublishedDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export type InsightBlock =
  | { type: "heading"; id: string; text: string }
  | { type: "paragraph"; text: string };

/** Fragment id for an in-page heading: lowercase, alphanumerics and hyphens only. */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Split a post body into renderable blocks: `## Heading` paragraphs become
 * headings with a fragment id; everything else is a paragraph. Shared by the
 * post template (which renders <h2 id> / <p>) and the contents list.
 */
export function insightBlocks(content: string): InsightBlock[] {
  return content
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => {
      if (!p.startsWith("## ")) return { type: "paragraph", text: p };
      const text = p.slice(3).trim();
      return { type: "heading", id: headingId(text), text };
    });
}

/** The post's H2 headings in document order (for the in-page contents list). */
export function insightHeadings(content: string): { id: string; text: string }[] {
  return insightBlocks(content).flatMap((b) => (b.type === "heading" ? [{ id: b.id, text: b.text }] : []));
}
