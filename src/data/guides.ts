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
  tldr: string;
  authorSlug?: string;
  dateModified?: string;
  image?: string;
  sections?: GuideSection[];
  faqs?: Faq[];
  sources?: Source[];
  related?: RelatedItem[];
}

export const guides: Guide[] = [
  {
    slug: "expert-witness-disclosure-rules",
    title: "Expert Witness Disclosure: A Practitioner Overview",
    tldr:
      "Pre-trial expert disclosure typically requires a written statement of the expert's identity, opinions, the bases for those opinions, qualifications, prior testimony, and compensation. Content and timing requirements vary by jurisdiction. Missing a disclosure requirement is a common basis for expert exclusion. Attorneys are responsible for confirming the governing framework against primary sources.",
    dateModified: "2026-05-03",
    sections: [
      {
        id: "what-is-disclosure",
        heading: "What is pre-trial expert disclosure?",
        bodyHtml:
          "<p><a href=\"/services/expert-disclosure\">Pre-trial expert disclosure</a> is the formal statement to the opposing party of the expert's expected testimony before trial. Depending on the jurisdiction, the disclosure may take the form of a written report, an interrogatory-style answer signed by the expert, or another format set by the governing framework. The point is to identify the expert, describe what the expert will say, and provide <a href=\"/guides/federal-vs-state-court-daubert\">the basis for the opinions</a> in time for the opposing party to prepare a response.</p>",
      },
      {
        id: "common-content",
        heading: "Common content elements",
        bodyHtml:
          "<p>Most disclosure frameworks call for the expert's identity, the subject matter, the substance of opinions, the bases for those opinions, qualifications, and (in many jurisdictions) prior testimony and <a href=\"/services/vocational-expert/cost\">compensation</a> (Fed. R. Civ. P. 26(a)(2)). The exact inventory varies by jurisdiction, and trial-track engagements in federal court typically call for a more comprehensive written report than settlement-stage state-court disclosure.</p>",
      },
      {
        id: "timing",
        heading: "Timing",
        bodyHtml:
          "<p>Disclosure timing is set by the case scheduling order or by the governing framework's default deadlines. Practitioners should pull the scheduling order at the outset of the case and calendar both the disclosure deadline and the close of expert discovery.</p>",
      },
      {
        id: "supplementation",
        heading: "Supplementation",
        bodyHtml:
          "<p>Most frameworks impose a continuing duty to supplement when the disclosing party learns the prior response is incomplete or incorrect (Fed. R. Civ. P. 26(e)). Failure to supplement can support a motion to preclude the expert testimony at trial.</p>",
      },
      {
        id: "verify",
        heading: "Verify the governing framework",
        bodyHtml:
          "<p>This page provides a general overview only and does not provide legal advice. Disclosure rules vary by jurisdiction and change over time. Always confirm the governing framework, the court's scheduling order, and any local rule requirements against primary sources for the specific case.</p>",
      },
    ],
    faqs: [
      {
        question: "Does every retained expert need to produce a written report?",
        answer:
          "It depends on the jurisdiction. Federal-court trial-track engagements typically require a comprehensive written report; many state frameworks accept a substance-of-opinions statement instead, sometimes via interrogatory. Confirm the governing framework for the specific case.",
      },
      {
        question: "What counts as 'facts or data considered'?",
        answer:
          "All materials the expert reviewed in forming the opinion, including those the expert chose not to rely upon. Most jurisdictions interpret this category broadly.",
      },
    ],
    sources: refsToSources(["FRCP_26"]),
    related: [
      { title: "How to Hire a Vocational Expert", href: "/guides/how-to-hire-vocational-expert" },
    ],
  },
  {
    slug: "economic-damages-self-employed-claimants",
    title: "Economic Damages for Self-Employed Claimants",
    tldr:
      "Self-employment damages analysis reconstructs lost income from tax returns, 1099s, bank records, and business documents, adjusting for business expenses and the distinction between owner compensation and return on capital. Expect disputes about profit versus wage components.",
    dateModified: "2026-04-21",
    sections: [
      {
        id: "challenges",
        heading: "Unique challenges",
        bodyHtml:
          "<p>Self-employed earnings are often variable and may be commingled with business profits. <a href=\"/services/forensic-economics\">The economist</a> separates <a href=\"/guides/earning-capacity-vs-lost-earnings\">owner compensation</a> (replaceable by hiring) from return on capital (not lost when the owner is injured if the business continues) (Tinari, 2016).</p>",
      },
      {
        id: "documentation",
        heading: "Documentation",
        bodyHtml:
          "<p>Tax returns (Schedule C, Schedule K-1, corporate returns), bank statements, 1099s, and business operations documents establish the earnings base (Internal Revenue Service, n.d.).</p>",
      },
      {
        id: "methodology",
        heading: "Methodology",
        bodyHtml:
          "<p>Economists apply <a href=\"/tools/economic-damages-estimator\">before-and-after analysis</a>, industry benchmarks, or replacement-cost analysis depending on the business structure and the injury's effect on operations.</p>",
      },
    ],
    faqs: [
      {
        question: "How are business expenses handled?",
        answer:
          "Expenses attributable to the injured owner's labor are reduced when that labor cannot be performed. Non-labor expenses generally continue and are not a damages component.",
      },
    ],
    sources: refsToSources(["TINARI_2016", "IRS_SCHEDULE_C", "BLS_BDM"]),
    related: [
      { title: "Forensic Economics", href: "/services/forensic-economics" },
    ],
  },
  {
    slug: "standard-of-care-analysis",
    title: "Standard of Care Analysis in Medical Litigation",
    tldr:
      "Standard of care analysis establishes whether a healthcare provider's conduct met the accepted standard of practice for the specialty at the time and place of treatment. It is the threshold opinion in medical malpractice litigation and requires a qualified physician expert.",
    dateModified: "2026-04-21",
    sections: [
      {
        id: "concept",
        heading: "The concept",
        bodyHtml:
          "<p>Standard of care is the degree of skill and care that a reasonable practitioner in the same specialty would apply in the same or similar circumstances. The analysis is jurisdiction-specific (some states use a national standard, others a locality rule) (Moffett & Moore, 2011).</p>",
      },
      {
        id: "who-provides",
        heading: "Who provides the opinion",
        bodyHtml:
          "<p>A physician expert, typically board-certified in the relevant specialty (American Board of Medical Specialties, n.d.), provides the <a href=\"/services/standard-of-care\">standard of care opinion</a>. Expert qualifications are often specified by state statute.</p>",
      },
      {
        id: "coordination",
        heading: "Coordination with damages experts",
        bodyHtml:
          "<p>Standard of care and causation opinions set the framework for <a href=\"/services/vocational-expert\">vocational</a>, <a href=\"/services/life-care-planning\">life care planning</a>, and <a href=\"/services/forensic-economics\">economic damages experts</a>, who quantify the consequences of any established breach.</p>",
      },
    ],
    faqs: [
      {
        question: "Can a physician expert address standard of care outside their specialty?",
        answer:
          "Generally no, and many states have statutes requiring same-specialty standard of care experts.",
      },
    ],
    sources: refsToSources(["MOFFETT_MOORE_2011", "ABMS"]),
    related: [
      { title: "Standard of Care Service", href: "/services/standard-of-care" },
      { title: "Medical Malpractice Case Type", href: "/case-types/medical-malpractice" },
    ],
  },
  {
    slug: "ssa-disability-and-vocational-evidence",
    title: "Social Security Disability and Vocational Evidence",
    tldr:
      "SSA disability adjudication uses a sequential evaluation process ending with vocational questions at steps 4 and 5. Vocational experts apply Dictionary of Occupational Titles (DOT) terminology and SSA-specific frameworks that differ from civil-litigation vocational analysis.",
    dateModified: "2026-04-21",
    sections: [
      {
        id: "sequential-evaluation",
        heading: "The sequential evaluation",
        bodyHtml:
          "<p>SSA's five-step sequential evaluation asks: substantial gainful activity, severe impairment, listing equivalence, past relevant work, and other work (20 C.F.R. sec. 404.1520). Steps 4 and 5 rely on vocational evidence.</p>",
      },
      {
        id: "vocational-role",
        heading: "Role of the vocational expert",
        bodyHtml:
          "<p>SSA <a href=\"/services/vocational-expert\">vocational experts</a> answer hypothetical questions from the Administrative Law Judge (ALJ) regarding the claimant's ability to perform past relevant work or other work in the national economy given the residual functional capacity (SSR 00-4p).</p>",
      },
      {
        id: "civil-litigation-contrast",
        heading: "Contrast with civil-litigation vocational work",
        bodyHtml:
          "<p>Civil litigation applies open-ended methodology (transferable skills analysis (<a href=\"/methods/transferable-skills-analysis\">TSA</a>), labor market survey (LMS), <a href=\"/methods/labor-market-survey\">full labor market analysis</a>). SSA testimony is constrained by the regulatory framework, <a href=\"/methods/dictionary-of-occupational-titles\">DOT terminology</a>, and SSA rulings.</p>",
      },
    ],
    faqs: [
      {
        question: "Can an SSA decision affect a civil case?",
        answer:
          "SSA decisions are evidentiary but not binding in civil litigation. Civil vocational experts perform independent analyses.",
      },
    ],
    sources: refsToSources(["CFR_404_1520", "SSR_00_4P", "SSA_BLUEBOOK", "SSA_POMS"]),
    related: [
      { title: "CRC Credential", href: "/credentials/crc" },
      { title: "Forensic VE vs SSA VE", href: "/compare/vocational-expert-vs-ssa-ve" },
    ],
  },
  {
    slug: "vocational-rehabilitation-services-explained",
    title: "Vocational Rehabilitation Services Explained",
    tldr:
      "Vocational rehabilitation services help individuals with disabilities prepare for, obtain, maintain, or regain employment. State VR agencies provide services under the Rehabilitation Act. In litigation, vocational rehabilitation services can form part of a life care plan or workers' compensation remedy.",
    dateModified: "2026-04-21",
    sections: [
      {
        id: "public-system",
        heading: "The public VR system",
        bodyHtml:
          "<p>Each state operates a VR agency under the federal Rehabilitation Act of 1973 (29 U.S.C. sec. 701), providing assessment, counseling, training, job placement, and supported employment services.</p>",
      },
      {
        id: "private-services",
        heading: "Private VR services",
        bodyHtml:
          "<p>Private rehabilitation providers deliver the same categories of services on a fee-for-service basis, typically through workers' compensation, long-term disability, or litigation funding.</p>",
      },
      {
        id: "damages-context",
        heading: "VR services in damages analysis",
        bodyHtml:
          "<p><a href=\"/services/life-care-planning\">Life care plans</a> may include vocational rehabilitation services as part of the recovery plan when they support functional improvement. <a href=\"/case-types/workers-compensation\">Workers' compensation</a> often mandates VR services statutorily.</p>",
      },
    ],
    faqs: [
      {
        question: "Who pays for VR services in the public system?",
        answer:
          "State VR agencies fund services for eligible individuals; some services have financial participation requirements.",
      },
      {
        question: "Can VR services substitute for a vocational evaluation?",
        answer:
          "No. VR services are service delivery; vocational evaluation is an assessment and opinion process.",
      },
    ],
    sources: refsToSources(["REHAB_ACT_1973", "RSA_ED"]),
    related: [
      { title: "CRC Credential", href: "/credentials/crc" },
      { title: "Workers' Compensation", href: "/case-types/workers-compensation" },
    ],
  },
  {
    slug: "loss-of-household-services",
    title: "Loss of Household Services in Damages",
    tldr:
      "Loss of household services quantifies the unpaid work an injured person or decedent would have contributed to the household. It is valued using time-use survey data and local market wage rates for equivalent services such as childcare, home maintenance, meal preparation, and transportation.",
    dateModified: "2026-04-21",
    sections: [
      {
        id: "concept",
        heading: "The concept",
        bodyHtml:
          "<p>Even when a person does not work outside the home, they produce economic value through unpaid labor. When injury or death reduces that labor, the economic loss is compensable in most jurisdictions.</p>",
      },
      {
        id: "methodology",
        heading: "Methodology",
        bodyHtml:
          "<p>The economist uses <a href=\"/tools/household-services\">time-use data</a> (BLS American Time Use Survey) to establish typical hours by task, then applies <a href=\"/tools/household-services/methodology\">local market wage rates</a> for equivalent services (U.S. Bureau of Labor Statistics, n.d.). The projection is <a href=\"/methods/present-value-analysis\">reduced to present value</a> across the <a href=\"/tools/life-expectancy\">remaining life expectancy</a> or <a href=\"/methods/worklife-expectancy\">worklife</a> as applicable.</p>",
      },
      {
        id: "scope",
        heading: "Scope of tasks",
        bodyHtml:
          "<p>Typical categories include childcare, home maintenance, yard work, meal preparation, household management, and transportation. The scope reflects the household composition and the specific services the claimant actually performed.</p>",
      },
    ],
    faqs: [
      {
        question: "Is household services loss available in wrongful death cases?",
        answer:
          "In most jurisdictions, yes. It is often a substantial component of survivor damages.",
      },
      {
        question: "How are wage rates selected?",
        answer:
          "Rates reflect local market costs for the equivalent service (e.g., childcare providers, landscapers, housekeepers), drawn from BLS OEWS (Occupational Employment and Wage Statistics) and similar sources.",
      },
    ],
    sources: refsToSources(["BLS_ATUS", "BLS_OEWS"]),
    related: [
      { title: "Forensic Economics", href: "/services/forensic-economics" },
      { title: "Wrongful Death", href: "/case-types/wrongful-death" },
    ],
  },
  {
    slug: "what-records-does-vocational-expert-need",
    title: "What Records Does a Vocational Expert Need?",
    tldr:
      "A complete vocational evaluation typically requires medical records, educational records, employment history with wage documentation, any functional capacity evaluation, neuropsychological testing if applicable, and prior vocational testing or deposition transcripts when available.",
    dateModified: "2026-04-21",
    sections: [
      {
        id: "medical",
        heading: "Medical records",
        bodyHtml:
          "<p>All relevant pre- and post-injury medical records, imaging, and specialty consultations. Restrictions issued by treating providers are particularly important.</p>",
      },
      {
        id: "educational",
        heading: "Educational records",
        bodyHtml:
          "<p>Transcripts, degrees, certifications, and continuing education, supporting the <a href=\"/methods/transferable-skills-analysis\">pre-injury skill profile</a>.</p>",
      },
      {
        id: "employment",
        heading: "Employment history",
        bodyHtml:
          "<p>Job titles, duties, dates of employment, <a href=\"/tools/economic-damages-estimator\">wage history (W-2s, tax returns, pay stubs)</a>, and employer policies on fringe benefits. This establishes the pre-injury earnings base.</p>",
      },
      {
        id: "testing",
        heading: "Testing and prior evaluations",
        bodyHtml:
          "<p>Any <a href=\"/methods/functional-capacity-evaluation\">functional capacity evaluation</a>, neuropsychological evaluation, <a href=\"/services/vocational-expert\">prior vocational assessments</a>, and deposition transcripts from the claimant and treating providers.</p>",
      },
    ],
    faqs: [
      {
        question: "Can a vocational evaluation proceed without complete records?",
        answer:
          "It can, with clear documentation of what was and was not reviewed (Commission on Rehabilitation Counselor Certification, 2023). Material gaps may limit the opinion's scope.",
      },
    ],
    sources: refsToSources(["CRCC_ETHICS"]),
    related: [
      { title: "How to Hire a Vocational Expert", href: "/guides/how-to-hire-vocational-expert" },
    ],
  },
  {
    slug: "collateral-source-rule-explained",
    title: "The Collateral Source Rule, Explained",
    tldr:
      "The collateral source rule governs whether insurance, Medicare, Medicaid, or other third-party payments offset a defendant's liability for damages. Some jurisdictions preserve the traditional rule (no offset); others have modified or abrogated it by statute.",
    dateModified: "2026-04-21",
    sections: [
      {
        id: "traditional-rule",
        heading: "The traditional rule",
        bodyHtml:
          "<p>Under the traditional rule, a tortfeasor does not benefit from payments the plaintiff received from collateral sources such as insurance (Restatement (Second) of Torts sec. 920A). Damages are calculated without offsetting those payments.</p>",
      },
      {
        id: "modifications",
        heading: "Modifications and exceptions",
        bodyHtml:
          "<p>Many jurisdictions have modified or abrogated the rule by statute, permitting or requiring offsets for specific types of collateral payments. The specifics vary widely by state and by category of payment.</p>",
      },
      {
        id: "medicare-medicaid",
        heading: "Medicare, Medicaid, and liens",
        bodyHtml:
          "<p>Federal and state programs have separate lien and reimbursement statutes (Medicare Secondary Payer Act, state Medicaid liens) (42 U.S.C. sec. 1395y(b)). These interact with, but are distinct from, <a href=\"/methods/collateral-source\">the collateral source rule</a>.</p>",
      },
    ],
    faqs: [
      {
        question: "Does the collateral source rule apply to future damages?",
        answer:
          "Generally yes, though offsets for anticipated collateral payments are imposed in some jurisdictions. Confirm state-specific rules.",
      },
    ],
    sources: refsToSources(["RESTATEMENT_TORTS_920A", "MSP_1395Y", "CMS_MSP"]),
    related: [
      { title: "Collateral Source Analysis", href: "/methods/collateral-source" },
    ],
  },
  {
    slug: "federal-vs-state-court-daubert",
    title: "Expert Testimony Admissibility: Federal vs. State Court",
    tldr:
      "Federal courts apply a reliability-based gatekeeping framework that considers the methodology's testability, peer review, error rate, controlling standards, and general acceptance. State courts vary: some apply a similar reliability framework, others apply a narrower general-acceptance test, and several use distinctive hybrid frameworks. Experts should prepare testimony that satisfies the most demanding of the potentially applicable standards. Attorneys are responsible for confirming the governing framework against primary sources.",
    dateModified: "2026-05-03",
    sections: [
      {
        id: "federal-framework",
        heading: "Federal-court framework",
        bodyHtml:
          "<p>Federal courts apply a <a href=\"/guides/daubert-standard-vocational-experts\">reliability-based gatekeeping framework</a> (Daubert v. Merrell Dow Pharmaceuticals, Inc., 1993; Kumho Tire Co. v. Carmichael, 1999). The trial judge evaluates whether the expert's methodology is reliable and reliably applied to the case, considering factors such as testability, peer review and publication, known or potential rate of error, the existence of controlling standards, and general acceptance in the relevant field (Fed. R. Evid. 702). The factors are non-exclusive and the analysis is case specific.</p>",
      },
      {
        id: "state-frameworks",
        heading: "State-court frameworks",
        bodyHtml:
          "<p>Some states apply a similar reliability framework to the federal courts. Other states retain a <a href=\"/insights/daubert-vs-frye-expert-testimony-standards\">narrower general-acceptance framework</a> that focuses on whether the methodology is generally accepted in the relevant scientific community (Frye v. United States, 1923). Several states have <a href=\"/jurisdictions\">distinctive hybrid frameworks</a>, sometimes codified by statute or rule.</p>",
      },
      {
        id: "verify",
        heading: "Verify the governing framework",
        bodyHtml:
          "<p>Always confirm the governing admissibility framework for the specific case against primary sources before preparing expert testimony. The framework can vary by case type, by court within the same state, and over time as state law evolves.</p>",
      },
    ],
    faqs: [
      {
        question: "Do all federal courts apply the admissibility framework identically?",
        answer:
          "The framework is uniform across federal courts, but application varies by circuit and by trial judge. Prior decisions in the same district and circuit are informative for case preparation.",
      },
    ],
    sources: refsToSources(["DAUBERT", "KUMHO_TIRE", "FRYE", "FRE_702"]),
    related: [
      { title: "Vocational Expert Methodology Standards", href: "/guides/daubert-standard-vocational-experts" },
    ],
  },
  {
    slug: "hedonic-damages-explained",
    title: "Hedonic Damages, Explained",
    tldr:
      "Hedonic damages compensate loss of enjoyment of life, distinct from economic losses. Methodology typically draws on value-of-statistical-life literature, but admissibility of quantified hedonic damages varies substantially by jurisdiction. Many courts admit qualitative testimony but exclude dollar quantification.",
    dateModified: "2026-04-21",
    sections: [
      {
        id: "concept",
        heading: "Concept",
        bodyHtml:
          "<p><a href=\"/methods/hedonic-damages\">Hedonic damages</a> address the non-pecuniary value of life experiences lost due to injury or death. They are distinct from <a href=\"/guides/future-medical-costs-in-personal-injury\">medical expenses</a>, <a href=\"/guides/earning-capacity-vs-lost-earnings\">lost earnings</a>, and pain and suffering.</p>",
      },
      {
        id: "methodology",
        heading: "Methodology",
        bodyHtml:
          "<p>Quantification draws on VSL literature from EPA, DOT, and peer-reviewed studies (U.S. Environmental Protection Agency, n.d.; Viscusi & Aldy, 2003). Adjustments for the specific case context are documented. Methodology remains controversial in some courts.</p>",
      },
      {
        id: "admissibility",
        heading: "Admissibility",
        bodyHtml:
          "<p>Admissibility varies: some courts permit quantified hedonic damages testimony, others admit only qualitative testimony on loss of enjoyment of life, and some exclude the concept entirely (Mercado v. Ahmed, 1992). Confirm jurisdictional rules before relying on this category.</p>",
      },
    ],
    faqs: [
      {
        question: "Are hedonic damages part of pain and suffering?",
        answer:
          "They are distinct categories in most jurisdictions, though sometimes lumped together in jury instructions. Separation depends on jurisdictional practice.",
      },
    ],
    sources: refsToSources(["EPA_VSL", "VISCUSI_ALDY_2003", "MERCADO_V_AHMED"]),
    related: [
      { title: "Hedonic Damages Methodology", href: "/methods/hedonic-damages" },
    ],
  },
  {
    slug: "earning-capacity-vs-lost-earnings",
    title: "Earning Capacity vs. Lost Earnings: What's the Difference?",
    tldr:
      "Lost earnings are actual wages the claimant did not receive. Lost earning capacity is a vocational concept measuring the reduction in ability to earn, whether or not that capacity was fully realized before injury. Catastrophic cases often need both.",
    dateModified: "2026-04-21",
    sections: [
      {
        id: "defining-lost-earnings",
        heading: "Lost earnings",
        bodyHtml:
          "<p>Lost earnings are the wages a claimant did not receive because of injury, typically measured from pay stubs, W-2s, tax returns, and employer records. Calculation is largely arithmetic once the records are complete.</p>",
      },
      {
        id: "defining-earning-capacity",
        heading: "Lost earning capacity",
        bodyHtml:
          "<p>Earning capacity is the claimant's vocational ability to earn, based on education, training, skills, and <a href=\"/methods/labor-market-survey\">the labor market</a> (U.S. Bureau of Labor Statistics, n.d.; National Center for O*NET Development, n.d.), applied to both pre- and post-injury profiles. Lost earning capacity is the reduction in that ability, regardless of whether the claimant was fully utilizing it before injury.</p>",
      },
      {
        id: "when-each-applies",
        heading: "When each concept applies",
        bodyHtml:
          "<p>Lost earnings are typically the baseline damages category in any lost-wage case. Lost earning capacity is added when the claimant's pre-injury employment was episodic, when they were underemployed, when future career growth was interrupted, or when catastrophic injury has reduced the range of occupations available.</p>",
      },
      {
        id: "who-opines",
        heading: "Who opines on each",
        bodyHtml:
          "<p><a href=\"/services/forensic-economics\">A forensic economist</a> typically computes lost earnings arithmetically. <a href=\"/services/vocational-expert\">A vocational expert</a> opines on earning capacity. In most contested cases both experts are retained so that the economist can apply the vocational expert's earning capacity opinion to <a href=\"/methods/present-value-analysis\">the economic projection</a>.</p>",
      },
    ],
    faqs: [
      {
        question: "Does earning capacity apply when the claimant was underemployed before injury?",
        answer:
          "Yes. Earning capacity is grounded in vocational ability, not actual pre-injury earnings, though the pre-injury earnings history is relevant evidence.",
      },
      {
        question: "Do courts accept earning capacity claims?",
        answer:
          "Most jurisdictions accept earning capacity as a distinct damages category when supported by a vocational expert and, typically, a forensic economist for present-value projection.",
      },
      {
        question: "How is earning capacity measured?",
        answer:
          "Through transferable skills analysis, labor market data, applicable medical restrictions, and comparison of pre- and post-injury occupational options.",
      },
    ],
    sources: refsToSources(["BLS_OEWS", "ONET"]),
    related: [
      { title: "Transferable Skills Analysis", href: "/methods/transferable-skills-analysis" },
      { title: "The RAPEL Method", href: "/guides/rapel-method-explained" },
      { title: "Forensic Economics Service", href: "/services/forensic-economics" },
    ],
  },
  {
    slug: "what-is-transferable-skills-analysis",
    title: "What is Transferable Skills Analysis (TSA)?",
    tldr:
      "TSA identifies occupations a person could perform based on skills developed in past work, applied to current medical restrictions and labor market conditions. It is the core methodology underlying most vocational expert opinions.",
    dateModified: "2026-04-21",
    sections: [
      {
        id: "purpose",
        heading: "Purpose",
        bodyHtml:
          "<p>TSA translates a person's work history and demonstrated skills into a universe of occupations they could theoretically perform, then filters that universe through <a href=\"/methods/functional-capacity-evaluation\">current medical restrictions, functional capacity</a>, and labor market viability.</p>",
      },
      {
        id: "process",
        heading: "Process",
        bodyHtml:
          "<p>The vocational expert documents the work history with Dictionary of Occupational Titles (DOT) and <a href=\"/methods/onet-analysis\">O*NET</a> codes, identifies skills and work fields, applies medical restrictions, searches for occupations within the retained skill set and tolerated physical and cognitive demands, and confirms <a href=\"/methods/labor-market-survey\">labor market viability</a> using BLS OEWS (Occupational Employment and Wage Statistics) and local data (U.S. Bureau of Labor Statistics, n.d.).</p>",
      },
      {
        id: "dot-onet",
        heading: "DOT and O*NET as data sources",
        bodyHtml:
          "<p><a href=\"/methods/dictionary-of-occupational-titles\">The DOT</a> provides detailed physical demand and Specific Vocational Preparation (SVP) information (U.S. Department of Labor, Employment and Training Administration, 1991); O*NET provides current task and skill information (National Center for O*NET Development, n.d.). Best practice is to cross-reference both when performing TSA.</p>",
      },
    ],
    faqs: [
      {
        question: "Does a TSA guarantee placement in the identified jobs?",
        answer:
          "No. A TSA establishes theoretical transferability. Whether those occupations actually exist in a hireable form in the claimant's market is tested by a labor market survey.",
      },
      {
        question: "Are computer-based TSA tools accepted in court?",
        answer:
          "Computer-based TSA tools (SkillTRAN, OASYS) are widely used. Courts accept them when the underlying methodology is transparent and the expert can explain the results.",
      },
    ],
    sources: refsToSources(["DOT", "ONET", "BLS_OEWS"]),
    related: [
      { title: "Labor Market Survey", href: "/methods/labor-market-survey" },
      { title: "DOT and O*NET", href: "/methods/dictionary-of-occupational-titles" },
    ],
  },
  {
    slug: "future-medical-costs-in-personal-injury",
    title: "Future Medical Costs in Personal Injury Cases",
    tldr:
      "Future medical costs are typically projected in a life care plan prepared by a CLCP, then reduced to present value by a forensic economist. Methodology combines treating-team recommendations, peer-reviewed duration literature, and geographically matched cost data.",
    dateModified: "2026-04-21",
    sections: [
      {
        id: "who-prepares",
        heading: "Who prepares the projection",
        bodyHtml:
          "<p><a href=\"/credentials/clcp\">Certified Life Care Planners (CLCPs)</a> prepare <a href=\"/services/life-care-planning\">the itemized plan</a>. <a href=\"/services/forensic-economics\">Forensic economists</a> reduce the plan to present value using appropriate discount and growth rates.</p>",
      },
      {
        id: "inputs",
        heading: "Inputs to the projection",
        bodyHtml:
          "<p>Core inputs include treating team recommendations, peer-reviewed duration literature, local provider cost quotations, and published rate data (Medicare, usual-and-customary compilations) (Centers for Medicare & Medicaid Services, n.d.).</p>",
      },
      {
        id: "categories",
        heading: "Typical categories",
        bodyHtml:
          "<p>Categories include routine and specialty medical care, diagnostic testing, therapies, medications, durable medical equipment with replacement intervals, home modifications, transportation, and attendant care.</p>",
      },
      {
        id: "discounting",
        heading: "Reducing to present value",
        bodyHtml:
          "<p>The plan's annual costs are <a href=\"/methods/present-value-analysis\">reduced to present value</a> using a discount rate matched to the projection horizon and a growth rate reflecting medical cost inflation (U.S. Bureau of Labor Statistics, n.d.). Methodology is documented with sensitivity analysis.</p>",
      },
    ],
    faqs: [
      {
        question: "How far into the future do projections extend?",
        answer:
          "Projections extend across the claimant's expected life expectancy, drawing on published life tables (Arias et al., 2025) and any adjustments supported by the record.",
      },
      {
        question: "Are collateral sources deducted?",
        answer:
          "Deduction depends on the jurisdiction's collateral source rule. Some jurisdictions require offset; others do not.",
      },
    ],
    sources: refsToSources(["CMS_PFS", "BLS_CPI_MEDICAL", "NCHS_LIFE_TABLES", "IARP_IALCP_STANDARDS"]),
    related: [
      { title: "Life Care Planning Service", href: "/services/life-care-planning" },
      { title: "Life Care Plan Development", href: "/methods/life-care-plan-development" },
      { title: "Present Value Analysis", href: "/methods/present-value-analysis" },
    ],
  },
  {
    slug: "how-long-does-vocational-evaluation-take",
    title: "How Long Does a Vocational Evaluation Take?",
    tldr:
      "A complete vocational evaluation, from engagement to final report, typically runs 30-60 days depending on records volume, whether in-person evaluation is performed, and reviewer availability. Rush timelines can be accommodated when requested early.",
    dateModified: "2026-04-21",
    sections: [
      {
        id: "phases",
        heading: "Phases that make up the timeline",
        bodyHtml:
          "<p>Engagement and records intake (1-2 weeks), records review (1-3 weeks), optional in-person interview and testing (1 day plus travel), report drafting and quality review (1-2 weeks), and final delivery. Timelines overlap where possible.</p>",
      },
      {
        id: "drivers",
        heading: "What extends the timeline",
        bodyHtml:
          "<p>Incomplete records, <a href=\"/methods/functional-capacity-evaluation\">pending FCE or neuropsychological testing</a>, scheduling of the in-person evaluation, and <a href=\"/services/vocational-expert\">coordination with multiple other experts</a> each add time.</p>",
      },
      {
        id: "rush",
        heading: "Rush engagements",
        bodyHtml:
          "<p>Rush timelines are possible when records are complete and prioritized, when in-person evaluation is not required, and when the expert's schedule permits. Request rush status at engagement.</p>",
      },
    ],
    faqs: [
      {
        question: "Can we skip the in-person evaluation?",
        answer:
          "A records-only review is possible in some cases. The expert recommends in-person evaluation when direct observation, testing, or demeanor are material to the opinion.",
      },
      {
        question: "What is the fastest possible turnaround?",
        answer:
          "Expedited turnaround can sometimes be accommodated when records are complete, no in-person evaluation is required, and the expert's schedule permits. Specific timelines are confirmed case by case.",
      },
    ],
    sources: refsToSources(["IARP"]),
    related: [
      { title: "VE Cost and Engagement", href: "/guides/vocational-expert-cost-and-engagement" },
      { title: "Vocational Expert Process", href: "/services/vocational-expert/process" },
    ],
  },
  {
    slug: "worklife-expectancy-explained",
    title: "Worklife Expectancy: How Economists Project Remaining Work Years",
    tldr:
      "Worklife expectancy is the number of additional years a person of a given age, sex, education, and labor force status is expected to be economically active. Forensic economists use published tables (Skoog-Ciecka-Krueger and predecessors) as the foundation for future earnings projections.",
    dateModified: "2026-04-21",
    sections: [
      {
        id: "concept",
        heading: "The concept",
        bodyHtml:
          "<p>Rather than assuming a fixed retirement age, <a href=\"/methods/worklife-expectancy\">worklife expectancy applies transition probabilities</a> between active and inactive labor force states (Skoog et al., 2011). The result is expected remaining active years based on observed population patterns.</p>",
      },
      {
        id: "stratification",
        heading: "How it is stratified",
        bodyHtml:
          "<p>Tables are stratified by age, sex, education, and current labor force status (U.S. Bureau of Labor Statistics, n.d.). The interaction of these factors produces different expected worklives for otherwise similar claimants.</p>",
      },
      {
        id: "injury-adjustments",
        heading: "Injury-specific adjustments",
        bodyHtml:
          "<p>Peer-reviewed literature supports adjustments for catastrophic injuries including spinal cord injury (<a href=\"/case-types/spinal-cord-injury\">SCI</a>) and moderate-to-severe traumatic brain injury (<a href=\"/case-types/traumatic-brain-injury\">TBI</a>), reflecting earlier labor-force withdrawal and reduced employment probability.</p>",
      },
    ],
    faqs: [
      {
        question: "Does worklife assume the claimant will retire at 65?",
        answer:
          "No. Worklife tables reflect observed active-inactive transitions across the population, which often extend past or end before age 65 depending on stratification.",
      },
      {
        question: "Are worklife projections adjustable for individual circumstances?",
        answer:
          "Yes, when the record supports an adjustment (e.g., documented plan to work past normal retirement, severity-specific published adjustments). Documentation is essential.",
      },
    ],
    sources: refsToSources(["SKOOG_CIECKA_KRUEGER_2011", "BLS_CPS"]),
    related: [
      { title: "Worklife Expectancy (method page)", href: "/methods/worklife-expectancy" },
      { title: "Present Value Analysis", href: "/methods/present-value-analysis" },
    ],
  },
  {
    slug: "when-do-you-need-expert-witness",
    title: "When Do You Need an Expert Witness in Your Case?",
    tldr:
      "An expert witness is warranted when the case involves earning capacity, employability, life care planning, forensic economics, or medical standard of care. Courts admit expert testimony where specialized knowledge will help the trier of fact understand evidence or determine a fact in issue. Retain early so the expert can inform discovery and strategy.",
    dateModified: "2026-04-20",
    sections: [
      {
        id: "governing-rule",
        heading: "The governing rule",
        bodyHtml:
          "<p>The federal admissibility framework and analogous state frameworks permit expert testimony where specialized knowledge will help the trier of fact, the testimony is based on sufficient facts or data, it is the product of reliable principles and methods, and the expert has reliably applied those principles to the case (Daubert v. Merrell Dow Pharmaceuticals, Inc., 1993; Fed. R. Evid. 702).</p>",
      },
      {
        id: "common-categories",
        heading: "Common expert categories in civil litigation",
        bodyHtml:
          "<p><a href=\"/services/vocational-expert\">Vocational expert</a>, <a href=\"/services/life-care-planning\">life care planner</a>, <a href=\"/services/forensic-economics\">forensic economist</a>, treating physician, physical medicine and rehabilitation specialist, <a href=\"/services/standard-of-care\">standard of care expert</a>, occupational therapist or physical therapist, and vocational rehabilitation counselor each address distinct questions that together quantify damages.</p>",
      },
      {
        id: "timing",
        heading: "When to retain",
        bodyHtml:
          "<p>Retain as early as practical. Early retention allows the expert to inform records collection, suggest FCE referrals, evaluate the claimant's medical trajectory, and provide input on deposition questions. Late retention risks gaps in the record and shortened report timelines.</p>",
      },
      {
        id: "signals",
        heading: "Signals that expert testimony is warranted",
        bodyHtml:
          "<p>Consider expert retention <a href=\"/guides/earning-capacity-vs-lost-earnings\">when earning capacity is contested</a>, when a life care plan is disputed, when the case involves catastrophic injury with long-term care implications, when medical causation is at issue, when standard of care is disputed, or when the defense has retained opposing experts.</p>",
      },
    ],
    faqs: [
      {
        question: "Is a treating physician the same as an expert witness?",
        answer:
          "A treating physician can testify as both a fact witness (regarding treatment) and, in some jurisdictions, as an expert witness (regarding opinion), but limits apply. Retained experts are typically engaged specifically for expert opinion.",
      },
      {
        question: "How many experts does a typical case need?",
        answer:
          "It varies. Many catastrophic injury cases use a vocational expert, life care planner, and forensic economist together. Smaller cases may need only one or two.",
      },
      {
        question: "Can experts be designated and later withdrawn?",
        answer:
          "Yes, subject to jurisdictional disclosure rules. Early designation preserves flexibility; withdrawal procedures are governed by local rules.",
      },
    ],
    sources: refsToSources(["FRE_702", "DAUBERT"]),
    related: [
      { title: "How to Hire a Vocational Expert", href: "/guides/how-to-hire-vocational-expert" },
      { title: "Vocational Expert Methodology Standards", href: "/guides/daubert-standard-vocational-experts" },
    ],
  },
  {
    slug: "vocational-expert-cost-and-engagement",
    title: "Vocational Expert Cost and Engagement: What Attorneys Should Expect",
    tldr:
      "Vocational expert engagements are typically billed hourly across four phases: initial review, evaluation, report writing, and testimony. Total cost varies with case complexity, expert credentialing, and whether in-person evaluation and testimony are required. A written engagement letter should itemize hourly rates, retainer, and scope.",
    dateModified: "2026-04-20",
    sections: [
      {
        id: "engagement-structure",
        heading: "Engagement structure",
        bodyHtml:
          "<p>Engagements follow a typical arc: <a href=\"/services/vocational-expert\">records review, optional in-person evaluation</a>, report writing, deposition, and trial testimony. Each phase is billed hourly. A retainer is customary, with additional billing as work progresses.</p>",
      },
      {
        id: "cost-drivers",
        heading: "What drives cost",
        bodyHtml:
          "<p>Cost drivers include case complexity (catastrophic cases require more records review and more nuanced opinion), volume of records, number of depositions to review, whether an in-person evaluation is needed, travel requirements for testimony, and the expert's seniority and credentialing.</p>",
      },
      {
        id: "what-is-included",
        heading: "What an engagement typically includes",
        bodyHtml:
          "<p>A complete engagement includes review of medical and vocational records, optional interview and testing, <a href=\"/guides/expert-witness-disclosure-rules\">written report meeting the governing jurisdictional disclosure framework</a>, deposition preparation and testimony, and trial testimony when required. Rebuttal reports are scoped separately when the defense discloses its expert report.</p>",
      },
      {
        id: "budgeting",
        heading: "Budgeting considerations",
        bodyHtml:
          "<p>Ask for a written scope and <a href=\"/services/vocational-expert/cost\">fee schedule</a> before engagement. Reasonable practice includes periodic invoicing, a cap on initial review hours, and clarity on rates for deposition and trial days, including travel and standby time.</p>",
      },
    ],
    faqs: [
      {
        question: "Is there a rough range for vocational expert fees?",
        answer:
          "Fees vary widely based on seniority and credentialing. Ranges are discussed in the engagement letter, and invoices itemize time spent by phase.",
      },
      {
        question: "Are life care planner fees structured the same way?",
        answer:
          "Similarly, yes. Life care planning engagements are hourly across records review, evaluation, plan preparation, and testimony phases.",
      },
      {
        question: "Do experts take cases on contingency?",
        answer:
          "No. Expert opinions are not provided on contingency, which would create an ethical conflict (Commission on Rehabilitation Counselor Certification, 2023). Experts are paid for their time regardless of outcome.",
      },
    ],
    sources: refsToSources(["CRCC_ETHICS", "IARP"]),
    related: [
      { title: "Vocational Expert Cost Page", href: "/services/vocational-expert/cost" },
      { title: "How to Hire a Vocational Expert", href: "/guides/how-to-hire-vocational-expert" },
    ],
  },
  {
    slug: "daubert-standard-vocational-experts",
    title: "Vocational Expert Methodology Standards: A Practitioner Guide",
    tldr:
      "Vocational expert testimony must satisfy the governing court's reliability framework: testimony grounded in sufficient facts or data, derived from accepted principles and methods, and reliably applied to the facts. Well-documented transferable skills analysis, labor market survey, and use of accepted references (DOT, O*NET, BLS) routinely meet these standards. Attorneys are responsible for confirming the governing framework against primary sources.",
    dateModified: "2026-05-03",
    sections: [
      {
        id: "what-the-framework-requires",
        heading: "What the reliability framework requires",
        bodyHtml:
          "<p>Federal courts and many state courts require expert testimony to satisfy a reliability-based gatekeeping framework. The trial court evaluates whether the testimony is based on sufficient facts or data, is the product of reliable principles and methods, and whether the expert has reliably applied those principles to the case. Non-exclusive reliability factors include testability, peer review, known or potential error rate, controlling standards, and general acceptance in the relevant field (Daubert v. Merrell Dow Pharmaceuticals, Inc., 1993; Kumho Tire Co. v. Carmichael, 1999).</p>",
      },
      {
        id: "applying-to-vocational-testimony",
        heading: "How the framework applies to vocational testimony",
        bodyHtml:
          "<p>Vocational testimony is typically grounded in <a href=\"/methods/transferable-skills-analysis\">transferable skills analysis</a> (TSA), <a href=\"/methods/labor-market-survey\">labor market survey</a> (LMS), and interpretation of functional capacity. Reliability is established by citing accepted methodology widely used in the vocational rehabilitation profession, accepted references (DOT, <a href=\"/methods/onet-analysis\">O*NET</a>, BLS OEWS (Occupational Employment and Wage Statistics), SCODDOT (Selected Characteristics of Occupations Defined in the Revised Dictionary of Occupational Titles)), and documented reasoning that traces the opinion from the claimant's history and medical restrictions through to the final conclusion.</p><p>General acceptance is evidenced through credentialing bodies (CRCC, <a href=\"/credentials/abve-d\">ABVE</a>) and the relevant professional standards.</p>",
      },
      {
        id: "common-objections",
        heading: "Common objections and how to address them",
        bodyHtml:
          "<p><strong>Reliance on DOT alone.</strong> The DOT has not been comprehensively updated since 1991 (U.S. Department of Labor, Employment and Training Administration, 1991). Best practice is to cross-reference with O*NET, explicitly acknowledge the DOT's limitations, and document the reasoning for relying on both.</p><p><strong>Anecdotal labor market survey.</strong> Surveys based on limited contacts or stale data invite exclusion. Courts accept surveys when documented with contact dates, employer names, and the search's geographic scope.</p><p><strong>Failure to consider the claimant's full vocational profile.</strong> Opinions that rely on incomplete records or omit relevant transferable skills can be excluded. Reviewing all medical and vocational records and documenting the basis for weighting them addresses this concern.</p>",
      },
      {
        id: "what-attorneys-should-ask",
        heading: "What attorneys should ask their vocational expert",
        bodyHtml:
          "<p>Expect your expert to articulate the methodology used (TSA, LMS, use of DOT and O*NET), the databases and published references relied upon, any objective testing performed, how restrictions were applied, and the reasoning supporting each conclusion. An expert who cannot walk an attorney through each step of the reasoning invites a methodology challenge.</p>",
      },
    ],
    faqs: [
      {
        question: "Do state courts apply the same admissibility framework as federal courts?",
        answer:
          "Many states apply a similar reliability-based framework to federal courts; others apply a narrower general-acceptance framework or a distinctive hybrid. Always confirm the governing standard in the jurisdiction of the case against primary sources.",
      },
      {
        question: "Do all courts scrutinize vocational experts the same way?",
        answer:
          "Federal courts routinely apply the reliability framework to vocational experts. State-court practice varies. Methodology that satisfies the more demanding federal framework is a reliable baseline regardless of jurisdiction.",
      },
      {
        question: "What credentials are most persuasive for a vocational expert?",
        answer:
          "CRC is the most widely recognized vocational credential. ABVE Diplomate and Fellow designations add forensic-specific standing. CVE adds vocational-evaluation-specific expertise. Many experts hold multiple credentials.",
      },
    ],
    sources: refsToSources(["DAUBERT", "KUMHO_TIRE", "DOT", "CRCC_ETHICS", "IARP"]),
    related: [
      { title: "Certified Rehabilitation Counselor (CRC)", href: "/credentials/crc", description: "Scope, requirements, admissibility" },
      { title: "Transferable Skills Analysis", href: "/methods/transferable-skills-analysis", description: "Methodology and steps" },
      { title: "Labor Market Survey", href: "/methods/labor-market-survey", description: "How to survey the relevant market" },
    ],
  },
  {
    slug: "how-to-hire-vocational-expert",
    title: "How to Hire a Vocational Expert: A Practical Guide for Attorneys",
    tldr:
      "Selecting a vocational expert comes down to credentialing (CRC, CVE, ABVE/D or F), testifying experience in the relevant jurisdiction, case-type specialization, and clear methodology. Early retention matters. Expect a written engagement agreement, a scope that covers evaluation, report, and testimony, and defined deliverable timelines.",
    dateModified: "2026-04-20",
    sections: [
      {
        id: "when-to-retain",
        heading: "When to retain",
        bodyHtml:
          "<p>Retain a vocational expert as early as practical once earning capacity, employability, or vocational rehabilitation is likely to be at issue. Early involvement allows input on the medical record, <a href=\"/methods/functional-capacity-evaluation\">functional capacity evaluation referrals</a>, and deposition strategy.</p>",
      },
      {
        id: "credentials-to-look-for",
        heading: "Credentials to look for",
        bodyHtml:
          "<p>Core credentials include the <a href=\"/credentials/crc\">CRC (Certified Rehabilitation Counselor)</a> (Commission on Rehabilitation Counselor Certification, n.d.), <a href=\"/credentials/cve\">CVE (Certified Vocational Evaluator)</a>, and <a href=\"/credentials/abve-f\">ABVE Diplomate or Fellow designations</a> for advanced forensic work (American Board of Vocational Experts, n.d.). State licensure may be separately relevant depending on jurisdiction.</p>",
      },
      {
        id: "scope-of-engagement",
        heading: "Scope of engagement",
        bodyHtml:
          "<p>A complete engagement typically covers records review, a file review or in-person evaluation, a written report, deposition, and trial testimony if needed. Each phase has a distinct deliverable and time commitment; scope is documented in the engagement letter.</p>",
      },
      {
        id: "what-to-provide-the-expert",
        heading: "What to provide the expert",
        bodyHtml:
          "<p>Typical materials include medical records, FCE reports, prior employment records (job descriptions, wage statements, W-2s), educational records, deposition transcripts of the claimant and treating providers, and any vocational testing previously performed.</p>",
      },
      {
        id: "red-flags",
        heading: "Red flags to avoid",
        bodyHtml:
          "<p>Be cautious of experts who <a href=\"/guides/daubert-standard-vocational-experts\">cannot articulate methodology plainly</a>, rely solely on DOT without cross-referencing O*NET (U.S. Department of Labor, Employment and Training Administration, 1991; National Center for O*NET Development, n.d.), produce unsubstantiated labor market surveys, or have a history of methodology-based exclusions.</p>",
      },
    ],
    faqs: [
      {
        question: "How much does a vocational expert cost?",
        answer:
          "Fees vary by case complexity and expert seniority. Engagements typically include initial review, evaluation, report writing, and testimony, each billed hourly. Detailed ranges are available on request.",
      },
      {
        question: "How long does an evaluation take?",
        answer:
          "Most evaluations, from engagement to report, run 30-60 days depending on records availability and whether in-person examination is required. Rush timelines can be accommodated when requested early.",
      },
      {
        question: "Can a vocational expert testify remotely?",
        answer:
          "Yes. Remote deposition and trial testimony are widely accepted, subject to jurisdictional rules and opposing counsel agreement.",
      },
      {
        question: "Should I use the same expert for evaluation and testimony?",
        answer:
          "Continuity is generally preferred so the testifying expert has complete familiarity with the record and the methodology applied.",
      },
    ],
    sources: refsToSources(["CRCC", "ABVE", "DOT", "ONET", "IARP"]),
    related: [
      { title: "CRC Certification", href: "/credentials/crc" },
      { title: "Vocational Expert Methodology Standards", href: "/guides/daubert-standard-vocational-experts" },
      { title: "Vocational Expert Cost", href: "/services/vocational-expert/cost" },
    ],
  },
  {
    slug: "rapel-method-explained",
    title: "The RAPEL Method: How Vocational Experts Organize an Earning Capacity Opinion",
    tldr:
      "RAPEL is an acronym used in forensic vocational evaluation to organize the analysis of a person's post-injury work life: Rehabilitation plan, Access to the labor market, Placeability, Earning capacity, and Labor force participation. It does not produce a number by itself. It is a framework that orders the questions an evaluator must answer and ties each answer to documented evidence, so the resulting opinion can be followed and tested by either side.",
    dateModified: "2026-08-23",
    sections: [
      {
        id: "what-rapel-stands-for",
        heading: "What RAPEL stands for",
        bodyHtml:
          "<p>RAPEL is a structured approach to <a href=\"/guides/earning-capacity-vs-lost-earnings\">earning capacity</a> assessment described in the rehabilitation and life care planning literature (Weed &amp; Berens, 2018). Each letter is a question the vocational evaluation must answer in order:</p><ul><li><strong>R - Rehabilitation plan.</strong> What services, training, accommodations, or medical steps would realistically support a return to work, and what would they cost and take?</li><li><strong>A - Access to the labor market.</strong> Given the person's education, skills, work history, and documented restrictions, which occupations remain open, and which are now closed?</li><li><strong>P - Placeability.</strong> Of the occupations that remain open, how likely is the person to actually be hired, considering the local labor market and real-world barriers?</li><li><strong>E - Earning capacity.</strong> What wage range is reasonably available now and over the working life, compared with pre-injury capacity?</li><li><strong>L - Labor force participation.</strong> How consistently can the person be expected to work over time, full time, part time, or intermittently, and for how many remaining work years?</li></ul>",
      },
      {
        id: "rehabilitation-plan",
        heading: "R: Rehabilitation plan",
        bodyHtml:
          "<p>The rehabilitation plan component asks whether a realistic path back to work exists and what it requires. The evaluator considers medical recommendations, <a href=\"/methods/functional-capacity-evaluation\">functional capacity findings</a>, retraining or education options, assistive technology, and workplace accommodations. The plan is documented in terms of specific services, duration, and cost so that the same assumptions can be carried into the <a href=\"/services/forensic-economics\">economic analysis</a> and, where applicable, a <a href=\"/guides/what-is-life-care-plan\">life care plan</a>.</p>",
      },
      {
        id: "access",
        heading: "A: Access to the labor market",
        bodyHtml:
          "<p>Access is established through <a href=\"/guides/what-is-transferable-skills-analysis\">transferable skills analysis</a>: the evaluator identifies the worker traits and skills acquired through prior work and education, then compares them against occupational requirements using the Dictionary of Occupational Titles and O*NET (U.S. Department of Labor, 1991; National Center for O*NET Development, n.d.). Medical restrictions are applied to exclude occupations whose physical, cognitive, or environmental demands exceed the documented capacity. The result is a defined set of occupations the person can still perform, and a defined set that has been lost.</p>",
      },
      {
        id: "placeability",
        heading: "P: Placeability",
        bodyHtml:
          "<p>Placeability asks a different question than access. An occupation can be within a person's capacity yet be difficult to obtain because of local demand, hiring practices, licensing or certification requirements, the need for schedule flexibility, visible limitations, gaps in work history, or age. The evaluator may use a <a href=\"/methods/labor-market-survey\">labor market survey</a> and published employment data to test whether the remaining occupations are realistically attainable in the relevant geographic area. Placeability is an assessment of likelihood supported by evidence; it is not a job search and does not guarantee an outcome.</p>",
      },
      {
        id: "earning-capacity",
        heading: "E: Earning capacity",
        bodyHtml:
          "<p>Earning capacity compares what the person could reasonably earn before the injury with what remains available after it. Pre-injury capacity is grounded in actual earnings history and the occupations held or realistically attainable. Post-injury capacity is drawn from the wages of the occupations that survive the access and placeability analysis, using published wage data such as the Occupational Employment and Wage Statistics program (U.S. Bureau of Labor Statistics, n.d.). The opinion is typically expressed as a reasonable range rather than a single figure, and the difference between the two sides is the loss of earning capacity that the <a href=\"/services/forensic-economics\">forensic economist</a> then projects and discounts to present value.</p>",
      },
      {
        id: "labor-force-participation",
        heading: "L: Labor force participation",
        bodyHtml:
          "<p>The final component addresses how much of the remaining work life the person can be expected to spend working. It considers whether full-time, part-time, or intermittent participation is realistic given the condition, the expected course of treatment, and the demands of the surviving occupations. Published <a href=\"/guides/worklife-expectancy-explained\">worklife expectancy</a> tables provide the population baseline, with case-specific adjustments where the record supports them (Skoog, Ciecka, &amp; Krueger, 2011).</p>",
      },
      {
        id: "why-it-matters",
        heading: "Why the structure matters in litigation",
        bodyHtml:
          "<p>RAPEL does not favor a plaintiff or a defense position. Its value is that each conclusion is tied to a stated question, a stated method, and identifiable data, which lets the court and opposing counsel trace how the evaluator reached the opinion. Organizing the report this way also supports admissibility review, because the reliability inquiry under <a href=\"/guides/daubert-standard-vocational-experts\">Daubert and Rule 702</a> turns on whether the method is recognized and was applied consistently to the facts of the case. Professional standards for forensic vocational practice likewise call for opinions that are objective, documented, and reproducible (International Association of Rehabilitation Professionals, n.d.).</p>",
      },
      {
        id: "common-misunderstandings",
        heading: "Common misunderstandings",
        bodyHtml:
          "<p><strong>\"RAPEL produces the damages number.\"</strong> It does not. RAPEL organizes the vocational findings; the economic loss is calculated separately from those findings.</p><p><strong>\"Placeability means the expert found the person a job.\"</strong> Placeability is an evidence-based estimate of the likelihood of employment in identified occupations, not a placement service.</p><p><strong>\"A RAPEL report is only for plaintiffs.\"</strong> The same framework is used to evaluate or rebut an opposing opinion, and an evaluation may conclude that little or no capacity was lost.</p>",
      },
    ],
    faqs: [
      {
        question: "Is RAPEL a formula or a test?",
        answer:
          "Neither. RAPEL is an organizing framework for a vocational evaluation. The evidence under each heading comes from records review, interview, testing where appropriate, transferable skills analysis, labor market data, and medical restrictions.",
      },
      {
        question: "Does every vocational expert use RAPEL?",
        answer:
          "No. It is one widely recognized way to structure an earning capacity opinion. Other evaluators organize the same questions differently. What matters for admissibility is that the method is recognized, the data sources are identified, and the reasoning can be followed.",
      },
      {
        question: "How does RAPEL connect to the forensic economist's work?",
        answer:
          "The vocational evaluator supplies the pre- and post-injury earning capacity, the rehabilitation plan costs, and the expected labor force participation. The forensic economist projects those inputs over the worklife and discounts them to present value.",
      },
    ],
    sources: refsToSources(["WEED_BERENS", "IARP", "DOT", "ONET", "BLS_OEWS", "SKOOG_CIECKA_KRUEGER_2011"]),
    related: [
      { title: "Earning Capacity vs. Lost Earnings", href: "/guides/earning-capacity-vs-lost-earnings" },
      { title: "Transferable Skills Analysis", href: "/guides/what-is-transferable-skills-analysis" },
      { title: "Labor Market Survey (method page)", href: "/methods/labor-market-survey" },
      { title: "Vocational Expert Services", href: "/services/vocational-expert" },
    ],
  },
  {
    slug: "what-is-life-care-plan",
    title: "What is a Life Care Plan?",
    tldr:
      "A life care plan is a dynamic document that projects the future medical and non-medical care needs of an individual with a catastrophic injury or chronic condition, with itemized frequencies and costs across the expected lifespan. Certified life care planners follow published standards (IALCP, IARP) and build plans from treating-team recommendations, peer-reviewed duration literature, and geographically matched cost data.",
    dateModified: "2026-08-23",
    sections: [
      {
        id: "definition",
        heading: "Definition",
        bodyHtml:
          "<p>A life care plan is a comprehensive, individualized roadmap of the future medical, rehabilitation, and non-medical care a person will need to manage a <a href=\"/case-types/spinal-cord-injury\">catastrophic injury or chronic condition</a>. It quantifies the frequency, duration, and cost of each recommended item and aggregates them into <a href=\"/methods/present-value-analysis\">annual and lifetime projections</a>.</p>",
      },
      {
        id: "components",
        heading: "Components of a plan",
        bodyHtml:
          "<p>Typical categories include routine medical and specialty follow-up, diagnostic testing, therapies (PT, OT, speech, cognitive, mental health), medications, <a href=\"/methods/life-care-plan-development\">durable medical equipment with replacement intervals</a>, home modifications, transportation or vehicle modifications, and attendant care.</p>",
      },
      {
        id: "who-writes-them",
        heading: "Who writes life care plans",
        bodyHtml:
          "<p>Life care plans are typically <a href=\"/services/life-care-planning\">prepared by Certified Life Care Planners</a> (<a href=\"/credentials/clcp\">CLCPs</a>) with qualifying clinical backgrounds (RN, OT, PT, CRC, physician). The CLCP credential is issued by ICHCC (International Commission on Health Care Certification, n.d.); practice standards are published by IALCP and IARP (International Academy of Life Care Planners, 2022).</p>",
      },
      {
        id: "methodology",
        heading: "Methodology",
        bodyHtml:
          "<p>Plans follow a standardized methodology: review records, collaborate with treating team, document treating team recommendations, identify needs across categories, apply peer-reviewed duration and frequency literature, collect geographically matched cost data, and compile the plan with documented sources.</p>",
      },
      {
        id: "after-catastrophic-injury",
        heading: "Life care planning after a catastrophic injury",
        bodyHtml:
          "<p>Catastrophic injuries such as <a href=\"/case-types/spinal-cord-injury\">spinal cord injury</a>, <a href=\"/case-types/traumatic-brain-injury\">traumatic brain injury</a>, <a href=\"/case-types/amputation\">amputation</a>, and severe burns create care needs that change over the lifespan rather than ending at discharge. A life care plan for these cases typically addresses acute and follow-up medical care, rehabilitation therapies, medications and supplies, durable medical equipment with replacement intervals, home and vehicle modifications, attendant or facility care, and the periodic re-evaluations that each of these items will require (Weed &amp; Berens, 2018). Because needs and costs differ by age, condition, and location, the plan is individualized to the person and the treating team's recommendations, not drawn from a template.</p>",
      },
      {
        id: "timing-and-updates",
        heading: "When the plan is prepared and how it changes",
        bodyHtml:
          "<p>A plan is usually prepared once the medical picture is stable enough to project, which may be before maximum medical improvement when the treating team can describe the expected course. The planner gathers records, interviews the individual and family, consults treating or evaluating providers, and documents each recommendation with its source. Because a life care plan is a dynamic document, it is updated when the condition, the treatment plan, or the care setting changes, and the cost figures are refreshed so the <a href=\"/methods/present-value-analysis\">economic analysis</a> reflects current pricing. In litigation the plan is typically paired with a <a href=\"/services/forensic-economics\">forensic economic</a> projection that carries the itemized costs across the <a href=\"/guides/worklife-expectancy-explained\">expected lifespan</a> and discounts them to present value.</p>",
      },
    ],
    faqs: [
      {
        question: "How is a life care plan different from a case management plan?",
        answer:
          "A case management plan coordinates ongoing services. A life care plan projects the full scope of future needs for litigation or settlement purposes, with quantified costs across the lifespan.",
      },
      {
        question: "Who pays for the services in a life care plan?",
        answer:
          "The plan projects costs; funding is a separate question answered by settlement, judgment, insurance, or public benefits depending on the case.",
      },
      {
        question: "Are life care plans admissible?",
        answer:
          "Yes, when prepared by a qualified practitioner following accepted methodology and supported by physician recommendations.",
      },
      {
        question: "Is a life care plan only for catastrophic injuries?",
        answer:
          "No. Plans are most often prepared for catastrophic injury and chronic conditions, but the same methodology applies to any injury or illness with documented long-term care needs.",
      },
    ],
    sources: refsToSources(["ICHCC_CLCP", "IARP_IALCP_STANDARDS", "IARP", "WEED_BERENS"]),
    related: [
      { title: "CLCP Certification", href: "/credentials/clcp" },
      { title: "Life Care Plan Development Methodology", href: "/methods/life-care-plan-development" },
      { title: "Spinal Cord Injury Cases", href: "/case-types/spinal-cord-injury" },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
