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
