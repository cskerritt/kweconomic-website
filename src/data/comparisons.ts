import type { Faq, Source } from "./types";
import type { RelatedItem } from "@/components/RelatedContent";
import { refsToSources } from "./references";

export interface ComparisonRow {
  dimension: string;
  a: string;
  b: string;
}

export interface Comparison {
  slug: string;
  title: string;
  a: { label: string; summary: string; url?: string };
  b: { label: string; summary: string; url?: string };
  rows: ComparisonRow[];
  whenUseA: string;
  whenUseB: string;
  overlap: string;
  faqs: Faq[];
  sources: Source[];
  dateModified?: string;
  authorSlug?: string;
  related?: RelatedItem[];
}

export const comparisons: Comparison[] = [
  {
    slug: "vocational-expert-vs-ssa-ve",
    title: "Forensic Vocational Expert vs. Social Security VE",
    dateModified: "2026-04-21",
    a: {
      label: "Forensic Vocational Expert",
      summary: "Retained vocational expert providing opinion testimony in civil or family court litigation on [[/insights/what-is-earning-capacity-evaluation|earning capacity]], employability, and labor market issues.",
      url: "/services/life-care-planning",
    },
    b: {
      label: "Social Security Vocational Expert",
      summary: "Vocational expert who testifies at [[/guides/ssa-disability-and-vocational-evidence|SSA disability hearings]], answering hypothetical questions from the Administrative Law Judge under specific SSA rules (20 C.F.R. sec. 404.1560).",
    },
    rows: [
      { dimension: "Tribunal", a: "State or federal court", b: "SSA administrative hearing" },
      { dimension: "Governing rules", a: "Federal/state rules of evidence", b: "SSA regulations and rulings (HALLEX, POMS)" },
      { dimension: "Scope", a: "Case-specific, methodology-grounded opinion", b: "Hypothetical-question framework tied to residual functional capacity (RFC)" },
      { dimension: "Typical credential", a: "CRC/CVE/ABVE", b: "CRC or comparable with SSA roster approval" },
    ],
    whenUseA:
      "Retain a forensic vocational expert for civil litigation, workers' compensation, long-term disability, or family court matters.",
    whenUseB:
      "Engage a Social Security VE through the SSA ALJ process (HALLEX I-2-6-74) when claimants contest disability determinations.",
    overlap:
      "Many vocational experts perform both roles. The core methodology (Dictionary of Occupational Titles (DOT), O*NET, transferable skills analysis ([[/methods/transferable-skills-analysis|TSA]])) is similar; application to SSA's administrative framework differs from civil litigation.",
    faqs: [
      {
        question: "Can findings from SSA proceedings be used in civil cases?",
        answer:
          "SSA determinations can be evidentiary but are not binding in civil litigation. Civil experts must perform an independent analysis.",
      },
    ],
    sources: refsToSources(["CFR_404_1560", "SSA_HALLEX", "SSA_POMS", "CRCC"]),
    related: [
      { title: "What Is an Earning Capacity Evaluation?", href: "/insights/what-is-earning-capacity-evaluation", description: "How earning capacity is assessed and quantified." },
      { title: "Transferable Skills Analysis", href: "/methods/transferable-skills-analysis", description: "Method for identifying occupations that fit residual skills." },
      { title: "SSA Disability and Vocational Evidence", href: "/guides/ssa-disability-and-vocational-evidence", description: "Vocational evidence in Social Security disability matters." },
    ],
  },
  {
    slug: "abve-d-vs-crc",
    title: "ABVE Diplomate vs. CRC",
    dateModified: "2026-04-21",
    a: {
      label: "ABVE Diplomate (ABVE/D)",
      summary: "Advanced forensic vocational credential focused on expert testimony, [[/guides/earning-capacity-vs-lost-earnings|earning capacity]], and employability in litigation (American Board of Vocational Experts, n.d.).",
      url: "/credentials/abve-d",
    },
    b: {
      label: "Certified Rehabilitation Counselor (CRC)",
      summary: "National certification in rehabilitation counseling covering assessment, counseling, case management, and vocational opinion (Commission on Rehabilitation Counselor Certification, n.d.).",
      url: "/credentials/crc",
    },
    rows: [
      { dimension: "Focus", a: "Forensic (litigation)", b: "Rehabilitation counseling (broad)" },
      { dimension: "Issuer", a: "American Board of Vocational Experts", b: "CRCC" },
      { dimension: "Prerequisite", a: "Often CRC or equivalent + forensic experience", b: "Master's degree and passing CRC exam" },
      { dimension: "Typical holder", a: "Senior forensic vocational expert", b: "Rehabilitation counselor with or without forensic focus" },
    ],
    whenUseA:
      "Look for ABVE/D when retaining for high-stakes or complex [[/services/life-care-planning|forensic vocational work]].",
    whenUseB:
      "Require CRC as the baseline credential for any vocational role, forensic or clinical.",
    overlap:
      "Most ABVE/D holders also hold CRC. The credentials are complementary rather than alternatives.",
    faqs: [
      {
        question: "Is ABVE/D required for federal court testimony?",
        answer:
          "Not required; CRC is the more commonly expected baseline. ABVE/D adds forensic-specific credibility.",
      },
    ],
    sources: refsToSources(["ABVE", "CRCC"]),
    related: [
      { title: "Earning Capacity vs. Lost Earnings", href: "/guides/earning-capacity-vs-lost-earnings", description: "Distinguishing earning capacity from lost earnings." },
      { title: "Vocational Expert Services", href: "/services/life-care-planning", description: "Independent vocational opinion on earning capacity and employability." },
    ],
  },
  {
    slug: "lump-sum-vs-present-value",
    title: "Lump Sum vs. Present Value in Damages",
    dateModified: "2026-04-21",
    a: {
      label: "Lump Sum",
      summary: "Total undiscounted future damages stated as a single number.",
    },
    b: {
      label: "Present Value",
      summary: "Future damages discounted to today's dollars using appropriate discount and growth rates (Jones & Laughlin Steel Corp. v. Pfeifer, 1983; U.S. Department of the Treasury, n.d.).",
      url: "/methods/present-value-analysis",
    },
    rows: [
      { dimension: "Time handling", a: "Nominal future dollars", b: "Discounted to today" },
      { dimension: "Comparability", a: "Not directly comparable across horizons", b: "Directly comparable to settlement offers" },
      { dimension: "Typical use", a: "Rarely used for future damages alone", b: "Standard for future damages at trial or settlement" },
    ],
    whenUseA:
      "Rarely appropriate as the sole figure for future damages; can be a component of reporting.",
    whenUseB:
      "Standard practice for future damages projections at trial or settlement.",
    overlap:
      "A [[/services/forensic-economics|forensic economic report]] typically reports both: the underlying nominal stream and the present-value figure.",
    faqs: [
      {
        question: "Is the present value figure equivalent to settlement value?",
        answer:
          "Present value is the economist's lump-sum equivalent of future damages. Settlement values incorporate additional factors (liability risk, litigation cost).",
      },
    ],
    sources: refsToSources(["JONES_LAUGHLIN_PFEIFER", "TREASURY_YIELD"]),
    related: [
      { title: "Forensic Economics", href: "/services/forensic-economics", description: "Present-value damages analysis for litigation." },
      { title: "How Forensic Economists Calculate Damages", href: "/insights/how-forensic-economists-calculate-damages", description: "Methodology behind economic damages calculations." },
    ],
  },
  {
    slug: "life-care-plan-vs-future-cost-projection",
    title: "Life Care Plan vs. Future Cost Projection",
    dateModified: "2026-04-21",
    a: {
      label: "Life Care Plan",
      summary: "Comprehensive itemized care plan following [[/methods/life-care-plan-development|IALCP/IARP standards]] with frequencies, durations, and costs across the lifespan (International Academy of Life Care Planners, 2022).",
      url: "/services/life-care-planning",
    },
    b: {
      label: "Future Medical Cost Projection",
      summary: "Simpler projection of future medical costs that does not follow full life care planning methodology.",
      url: "/guides/future-medical-costs-in-personal-injury",
    },
    rows: [
      { dimension: "Methodology", a: "IALCP/IARP standards, treating-team grounded", b: "Variable; often summary of treating-physician testimony" },
      { dimension: "Scope", a: "Medical + non-medical categories across lifespan", b: "Typically medical categories only" },
      { dimension: "Preparer", a: "CLCP", b: "Sometimes physician or economist" },
      { dimension: "Defensibility", a: "Methodology-driven; grounded in published life-care-planning standards", b: "Variable, depends on author and method" },
    ],
    whenUseA:
      "Prefer a full life care plan when damages include long-term care across multiple categories.",
    whenUseB:
      "A simpler projection may suffice when the scope is limited to a single medical category or short horizon.",
    overlap:
      "Both project future costs. The life care plan provides comprehensive, methodology-grounded coverage across the full scope of needs (Weed & Berens, 2018).",
    faqs: [
      {
        question: "Is a future cost projection admissible without a CLCP?",
        answer:
          "In some cases, where a physician can quantify projected care costs. Broader projections typically require a CLCP.",
      },
    ],
    sources: refsToSources(["IARP_IALCP_STANDARDS", "WEED_BERENS"]),
    related: [
      { title: "Life Care Plan Development", href: "/methods/life-care-plan-development", description: "How a life care plan is researched and costed." },
      { title: "Certified Life Care Planner (CLCP)", href: "/credentials/clcp", description: "Life care planner certification." },
    ],
  },
  {
    slug: "in-person-evaluation-vs-file-review",
    title: "In-Person Evaluation vs. File Review",
    dateModified: "2026-04-21",
    a: {
      label: "In-Person Evaluation",
      summary: "Expert meets with the claimant to interview, observe, and sometimes test, supplementing record review.",
      url: "/services/life-care-planning",
    },
    b: {
      label: "File Review",
      summary: "Expert performs [[/guides/what-records-does-vocational-expert-need|records-only review]], typically used when evaluation is impractical or when the record is sufficient.",
    },
    rows: [
      { dimension: "Data source", a: "Records + direct observation + testing", b: "Records only" },
      { dimension: "Depth", a: "Typically deeper; detects inconsistencies", b: "Limited to what records show" },
      { dimension: "Cost and time", a: "Higher, requires scheduling and travel", b: "Lower, faster" },
      { dimension: "Typical use", a: "Catastrophic or contested cases", b: "Damages analysis when in-person not required" },
    ],
    whenUseA:
      "Prefer in-person evaluation in catastrophic cases, where cognitive or behavioral factors matter, or where the defense has raised consistency concerns.",
    whenUseB:
      "File review is appropriate when records are complete and direct observation adds limited value (International Association of Rehabilitation Professionals, n.d.).",
    overlap:
      "The underlying methodology (transferable skills analysis ([[/methods/transferable-skills-analysis|TSA]]), labor market survey ([[/methods/labor-market-survey|LMS]]), records review) is the same. In-person adds clinical observation and testing.",
    faqs: [
      {
        question: "Will courts give less weight to a file-review opinion?",
        answer:
          "Depends on the case. Comprehensive file-review opinions are frequently admitted when the record is complete and the methodology is documented (Fed. R. Evid. 702; Daubert v. Merrell Dow Pharmaceuticals, Inc., 1993).",
      },
    ],
    sources: refsToSources(["FRE_702", "DAUBERT", "IARP"]),
    related: [
      { title: "Transferable Skills Analysis", href: "/methods/transferable-skills-analysis", description: "Method for identifying occupations that fit residual skills." },
      { title: "Labor Market Survey", href: "/methods/labor-market-survey", description: "Surveying local labor markets for occupational availability." },
      { title: "What Records a Vocational Expert Needs", href: "/guides/what-records-does-vocational-expert-need", description: "Records a vocational expert reviews." },
    ],
  },
  {
    slug: "forensic-economist-vs-accountant",
    title: "Forensic Economist vs. Accountant",
    dateModified: "2026-04-21",
    a: {
      label: "Forensic Economist",
      summary: "A credentialed economist who quantifies damages ([[/guides/earning-capacity-vs-lost-earnings|lost earnings, earning capacity]], future care present value) for litigation.",
      url: "/services/forensic-economics",
    },
    b: {
      label: "Accountant",
      summary: "A CPA or similar professional who handles financial reporting, tax, and audit; forensic accountants focus on financial investigations and business valuations.",
    },
    rows: [
      { dimension: "Primary purpose", a: "Personal/household damages projections", b: "Financial reporting, tax, business valuation" },
      { dimension: "Credential", a: "Ph.D. or Master's + NAFE/AAEFE membership", b: "CPA, CFE for forensic accountants" },
      { dimension: "Typical output", a: "Present-value damages report", b: "Audit report, valuation report, tax opinion" },
      { dimension: "Typical case use", a: "Personal injury, wrongful death, employment", b: "Commercial litigation, business disputes" },
      { dimension: "Data sources", a: "BLS, Census, Treasury, worklife tables (Skoog et al., 2011; U.S. Bureau of Labor Statistics, n.d.; U.S. Census Bureau, n.d.)", b: "Company financials, industry comparables" },
    ],
    whenUseA:
      "Retain a forensic economist when personal damages (lost earnings, earning capacity, [[/methods/present-value-analysis|present value of future care]]) are at issue.",
    whenUseB:
      "Retain an accountant (often a forensic accountant) when business valuation, financial fraud analysis, or commercial damages are at issue.",
    overlap:
      "Both analyze financial data. Forensic economists focus on individual damages; forensic accountants focus on entity-level analyses and financial investigations.",
    faqs: [
      {
        question: "Can the same professional do both?",
        answer:
          "Some practitioners hold both credentials. Most cases benefit from subject-matter-specific experts, with a forensic economist for personal damages and a forensic accountant for business issues.",
      },
    ],
    sources: refsToSources(["SKOOG_CIECKA_KRUEGER_2011", "BLS_OEWS", "CENSUS_ACS"]),
    related: [
      { title: "Present Value Analysis", href: "/methods/present-value-analysis", description: "Discounting future losses to present value." },
      { title: "Earning Capacity vs. Lost Earnings", href: "/guides/earning-capacity-vs-lost-earnings", description: "Distinguishing earning capacity from lost earnings." },
      { title: "Worklife Expectancy", href: "/methods/worklife-expectancy", description: "Estimating remaining years of labor force participation." },
    ],
  },
  {
    slug: "fce-vs-ime",
    title: "Functional Capacity Evaluation (FCE) vs. Independent Medical Examination (IME)",
    dateModified: "2026-04-21",
    a: {
      label: "Functional Capacity Evaluation (FCE)",
      summary: "A standardized assessment of physical work capacity conducted by an OT or PT using validated protocols over 4-8 hours (Genovese & Galper, 2009).",
      url: "/methods/functional-capacity-evaluation",
    },
    b: {
      label: "Independent Medical Examination (IME)",
      summary: "A physician-led examination and records review that provides diagnostic and causation opinions, typically in a single session (American Medical Association, 2023).",
    },
    rows: [
      { dimension: "Examiner", a: "OT or PT", b: "Physician" },
      { dimension: "Duration", a: "4-8 hours, sometimes 2 days", b: "30-90 minutes, typically single session" },
      { dimension: "Primary output", a: "Safe maximum demonstrated physical capacities", b: "Diagnostic and causation opinion" },
      { dimension: "Methodology", a: "Standardized physical tests with effort/consistency measures", b: "History, examination, record review" },
      { dimension: "Typical use", a: "Establish work capacity restrictions", b: "Establish diagnosis, causation, prognosis" },
    ],
    whenUseA:
      "Use an FCE when physical work capacity must be quantified for [[/services/life-care-planning|return-to-work]] or [[/insights/what-is-earning-capacity-evaluation|vocational opinion purposes]].",
    whenUseB:
      "Use an IME when diagnostic, causation, or prognosis questions need physician-level opinion, often on behalf of the defense.",
    overlap:
      "Both examine the claimant. They answer different questions: FCE quantifies physical capacity; IME addresses medical questions. In catastrophic cases, both are often performed. KWVRS conducts IMEs for New York and New Jersey matters only.",
    faqs: [
      {
        question: "Can an IME include functional testing?",
        answer:
          "Some IME physicians perform or order functional testing, though dedicated FCEs by OTs and PTs produce more detailed and standardized physical capacity data.",
      },
    ],
    sources: refsToSources(["GENOVESE_GALPER_2009", "AMA_GUIDES_IMPAIRMENT"]),
    related: [
      { title: "Vocational Expert Services", href: "/services/life-care-planning", description: "Independent vocational opinion on earning capacity and employability." },
      { title: "What Is an Earning Capacity Evaluation?", href: "/insights/what-is-earning-capacity-evaluation", description: "How earning capacity is assessed and quantified." },
    ],
  },
  {
    slug: "crc-vs-lrc",
    title: "CRC vs. LRC: National Certification vs. State License",
    dateModified: "2026-04-21",
    a: {
      label: "Certified Rehabilitation Counselor (CRC)",
      summary: "National certification from CRCC indicating master's-level training and passing the national CRC examination (Commission on Rehabilitation Counselor Certification, n.d.).",
      url: "/credentials/crc",
    },
    b: {
      label: "Licensed Rehabilitation Counselor (LRC)",
      summary: "State license granting authority to practice rehabilitation counseling independently within the state.",
      url: "/credentials/lrc",
    },
    rows: [
      { dimension: "Type", a: "National certification", b: "State license" },
      { dimension: "Issuer", a: "CRCC (national)", b: "State licensing board" },
      { dimension: "Geographic scope", a: "National portability", b: "Limited to licensing state" },
      { dimension: "Reciprocity", a: "Recognized across states", b: "Varies by state; limited reciprocity in many states" },
      { dimension: "Typical requirement", a: "Master's degree + CRC exam", b: "Master's + supervised hours + state exam" },
    ],
    whenUseA:
      "Look for CRC certification as a minimum baseline for [[/services/life-care-planning|forensic vocational work in any jurisdiction]].",
    whenUseB:
      "Confirm state licensure when the jurisdiction requires it for practice or testimony.",
    overlap:
      "Most practicing rehabilitation counselors hold both, since licensure is required in many states to practice. Not every CRC is licensed; not every licensee is CRC-certified.",
    faqs: [
      {
        question: "Is the CRC sufficient if I am not licensed in the state?",
        answer:
          "It depends on the jurisdiction. Some states require state licensure to offer opinion testimony in state court; others accept national certification for limited forensic purposes.",
      },
    ],
    sources: refsToSources(["CRCC"]),
    related: [
      { title: "Vocational Expert Services", href: "/services/life-care-planning", description: "Independent vocational opinion on earning capacity and employability." },
      { title: "Certified Rehabilitation Counselor (CRC)", href: "/credentials/crc", description: "National rehabilitation counseling certification." },
      { title: "Licensed Rehabilitation Counselor (LRC)", href: "/credentials/lrc", description: "State rehabilitation counseling license." },
    ],
  },
  {
    slug: "work-capacity-evaluation-vs-fce",
    title: "Work Capacity Evaluation vs. Functional Capacity Evaluation",
    dateModified: "2026-04-21",
    a: {
      label: "Work Capacity Evaluation",
      summary: "A job-specific assessment comparing an individual's abilities to the demands of a specific occupation or position.",
    },
    b: {
      label: "Functional Capacity Evaluation",
      summary: "A standardized assessment of the individual's general physical work capacities expressed in [[/methods/dictionary-of-occupational-titles|DOT terminology]] (U.S. Department of Labor, 1991).",
      url: "/methods/functional-capacity-evaluation",
    },
    rows: [
      { dimension: "Scope", a: "Job- or occupation-specific", b: "General work capacity" },
      { dimension: "Output", a: "Can / cannot perform the target job", b: "Strength, tolerance, and demand profile" },
      { dimension: "Typical use", a: "Return-to-work decisions", b: "Vocational opinion foundation, Americans with Disabilities Act (ADA) analyses, earning capacity (Americans with Disabilities Act of 1990)" },
    ],
    whenUseA:
      "Use a work capacity evaluation when the target occupation is defined and the question is whether the individual can perform it.",
    whenUseB:
      "Use an FCE when general work capacity must be quantified across a range of possible occupations.",
    overlap:
      "Both involve physical testing. Work capacity evaluations often use FCE-style protocols customized to the target job's demands.",
    faqs: [
      {
        question: "Which is more useful in litigation?",
        answer:
          "Depends on the question. FCE is generally more versatile for vocational and earning capacity opinions; work capacity evaluation is useful when a specific job is the issue.",
      },
    ],
    sources: refsToSources(["DOT", "ADA_1990"]),
    related: [
      { title: "Dictionary of Occupational Titles", href: "/methods/dictionary-of-occupational-titles", description: "Occupational classification and physical-demand terminology." },
      { title: "Earning Capacity vs. Lost Earnings", href: "/guides/earning-capacity-vs-lost-earnings", description: "Distinguishing earning capacity from lost earnings." },
      { title: "Vocational Expert Services", href: "/services/life-care-planning", description: "Independent vocational opinion on earning capacity and employability." },
    ],
  },
  {
    slug: "plaintiff-expert-vs-defense-expert",
    title: "Plaintiff Expert vs. Defense Expert: Is the Methodology Different?",
    dateModified: "2026-04-21",
    a: {
      label: "Plaintiff Expert",
      summary: "A vocational, [[/services/life-care-planning|life care planning]], or [[/services/forensic-economics|economic expert]] retained by the plaintiff.",
    },
    b: {
      label: "Defense Expert",
      summary: "A vocational, life care planning, or economic expert retained by the defense.",
    },
    rows: [
      { dimension: "Methodology", a: "Same accepted methodology", b: "Same accepted methodology" },
      { dimension: "Credentials", a: "CRC, CVE, ABVE, CLCP, Ph.D. as applicable", b: "Same" },
      { dimension: "Standards", a: "CRCC/IARP/IALCP ethics + scope", b: "Same" },
      { dimension: "Typical disagreement source", a: "Input assumptions, record weighting", b: "Same" },
    ],
    whenUseA:
      "Retain when representing an injured claimant or a plaintiff in litigation.",
    whenUseB:
      "Retain when representing a defendant or insurer.",
    overlap:
      "The methodology, standards, and credentials are the same on both sides (Commission on Rehabilitation Counselor Certification, 2023). KWVRS accepts engagements from both plaintiff and defense and applies the same objective methodology regardless of retaining party (Fed. R. Evid. 702).",
    faqs: [
      {
        question: "Should I avoid an expert who has primarily worked for the other side?",
        answer:
          "Not categorically. An expert with balanced experience on both sides is often more credible under cross-examination. KWVRS retains a balanced caseload by policy.",
      },
      {
        question: "Do plaintiff and defense experts always disagree?",
        answer:
          "No. Experts frequently agree on baseline facts and disagree on specific assumptions (worklife, discount rate, severity adjustments). Transparency on assumptions is the standard of practice.",
      },
    ],
    sources: refsToSources(["CRCC_ETHICS", "FRE_702", "IARP"]),
    related: [
      { title: "Life Care Planning", href: "/services/life-care-planning", description: "Itemized projection of future care needs and costs." },
      { title: "Forensic Economics", href: "/services/forensic-economics", description: "Present-value damages analysis for litigation." },
      { title: "Worklife Expectancy", href: "/methods/worklife-expectancy", description: "Estimating remaining years of labor force participation." },
      { title: "Present Value Analysis", href: "/methods/present-value-analysis", description: "Discounting future losses to present value." },
    ],
  },
  {
    slug: "life-care-plan-vs-medical-chronology",
    title: "Life Care Plan vs. Medical Chronology",
    dateModified: "2026-04-20",
    a: {
      label: "Life Care Plan",
      summary: "Forward-looking projection of future medical and non-medical care costs across the claimant's [[/tools/life-expectancy|expected lifespan]] (Arias et al., 2025).",
      url: "/methods/life-care-plan-development",
    },
    b: {
      label: "Medical Chronology",
      summary: "Backward-looking organized summary of the claimant's medical history drawn from treatment records.",
    },
    rows: [
      { dimension: "Direction in time", a: "Future (prospective projection)", b: "Past (historical summary)" },
      { dimension: "Primary output", a: "Itemized plan with costs and frequencies", b: "Date-organized narrative summary" },
      { dimension: "Prepared by", a: "CLCP with clinical background", b: "Medical chronologist, often RN" },
      { dimension: "Typical use", a: "Damages quantification", b: "Case understanding, deposition prep, expert support" },
    ],
    whenUseA:
      "Use a life care plan to quantify future care costs for trial, settlement, or mediation in catastrophic injury or chronic disease cases (International Academy of Life Care Planners, 2022).",
    whenUseB:
      "Use a medical chronology to summarize the record for internal review, deposition preparation, or to support other experts preparing opinions.",
    overlap:
      "Both rely on careful record review, and the same clinical record is often the primary source. The life care plan and chronology are complementary: the chronology informs the plan by establishing the clinical trajectory.",
    faqs: [
      {
        question: "Should every catastrophic case have both?",
        answer:
          "Not categorically, but many benefit from both. The chronology is often assembled first and provides the clinical foundation for the life care plan.",
      },
    ],
    sources: refsToSources(["NCHS_LIFE_TABLES", "IARP_IALCP_STANDARDS"]),
    related: [
      { title: "Life Care Planning", href: "/services/life-care-planning", description: "Itemized projection of future care needs and costs." },
      { title: "Life Expectancy Lookup", href: "/tools/life-expectancy", description: "Look up life expectancy by age." },
      { title: "Certified Life Care Planner (CLCP)", href: "/credentials/clcp", description: "Life care planner certification." },
    ],
  },
  {
    slug: "vocational-expert-vs-rehabilitation-counselor",
    title: "Forensic Vocational Expert vs. Rehabilitation Counselor",
    dateModified: "2026-04-20",
    a: {
      label: "Forensic Vocational Expert",
      summary: "A credentialed professional who provides opinion testimony on earning capacity, employability, and labor market issues for litigation.",
      url: "/services/life-care-planning",
    },
    b: {
      label: "Rehabilitation Counselor",
      summary: "A CRC-credentialed professional who provides rehabilitation counseling, case management, and placement services to individuals with disabilities (Commission on Rehabilitation Counselor Certification, n.d.).",
    },
    rows: [
      { dimension: "Primary purpose", a: "Forensic opinion for litigation", b: "Rehabilitation services for clients" },
      { dimension: "Typical credential", a: "CRC + forensic experience (ABVE/D or F)", b: "CRC" },
      { dimension: "Output", a: "Expert report, deposition, trial testimony", b: "Service plan, ongoing counseling" },
      { dimension: "Independence", a: "Independent of either party's narrative", b: "Client-advocating" },
    ],
    whenUseA:
      "Retain a forensic vocational expert when [[/guides/earning-capacity-vs-lost-earnings|earning capacity, employability, or vocational damages]] are at issue in litigation.",
    whenUseB:
      "Engage a rehabilitation counselor when the goal is to help an individual return to work or access rehabilitation services outside of litigation.",
    overlap:
      "Both hold [[/credentials/crc|CRC credentials]]. The distinction is forensic role and independence. Many experts transition between both roles across careers.",
    faqs: [
      {
        question: "Can a rehabilitation counselor serve as a forensic expert?",
        answer:
          "A CRC with forensic training and experience can serve as a forensic expert (Daubert v. Merrell Dow Pharmaceuticals, Inc., 1993; Fed. R. Evid. 702). Not every CRC has forensic experience - ask about prior expert engagements, prior testimony, and admissibility history.",
      },
    ],
    sources: refsToSources(["DAUBERT", "FRE_702", "CRCC", "ABVE"]),
    related: [
      { title: "Earning Capacity vs. Lost Earnings", href: "/guides/earning-capacity-vs-lost-earnings", description: "Distinguishing earning capacity from lost earnings." },
      { title: "Certified Rehabilitation Counselor (CRC)", href: "/credentials/crc", description: "National rehabilitation counseling certification." },
      { title: "How to Hire a Vocational Expert", href: "/guides/how-to-hire-vocational-expert", description: "Considerations when retaining a vocational expert." },
    ],
  },
  {
    slug: "clcp-vs-case-manager",
    title: "Certified Life Care Planner (CLCP) vs. Case Manager",
    dateModified: "2026-04-20",
    a: {
      label: "Certified Life Care Planner (CLCP)",
      summary: "A credentialed life care planner who [[/methods/life-care-plan-development|projects future medical and non-medical care needs and costs across the lifespan]] for litigation or settlement (International Commission on Health Care Certification, n.d.).",
      url: "/credentials/clcp",
    },
    b: {
      label: "Case Manager",
      summary: "A healthcare professional who coordinates ongoing services, providers, and insurance authorizations to support day-to-day care (Case Management Society of America, 2022; Commission for Case Manager Certification, n.d.).",
    },
    rows: [
      { dimension: "Primary purpose", a: "Forensic projection of future needs", b: "Coordination of current care" },
      { dimension: "Time horizon", a: "Lifetime (expected life expectancy)", b: "Active case period" },
      { dimension: "Output", a: "Written plan with itemized costs", b: "Ongoing service coordination notes" },
      { dimension: "Certification", a: "CLCP via ICHCC, with prior clinical credential", b: "CCM (Commission for Case Manager Certification) or similar" },
      { dimension: "Litigation role", a: "Expert witness", b: "Fact witness (sometimes)" },
      { dimension: "Methodology source", a: "IALCP / IARP standards", b: "Case management standards (CMSA, etc.)" },
    ],
    whenUseA:
      "Retain a CLCP when projecting [[/services/life-care-planning|lifetime care costs for a catastrophic injury]] or chronic condition, typically for trial, mediation, or settlement purposes.",
    whenUseB:
      "Engage a case manager when coordinating active medical care, provider access, or insurance authorizations during the active treatment period.",
    overlap:
      "Both professionals may hold nursing or rehabilitation backgrounds, and CLCPs often have prior case management experience. The distinction is scope and purpose: forensic lifetime projection (CLCP) versus active care coordination (case manager).",
    faqs: [
      {
        question: "Can one person serve as both?",
        answer:
          "The same professional sometimes performs both functions at different times, though it is uncommon within the same case - the treating case manager typically does not serve as the forensic life care planner to preserve independence.",
      },
      {
        question: "Do case managers testify in litigation?",
        answer:
          "Sometimes as fact witnesses regarding coordination they performed. Expert testimony on future needs is generally the life care planner's role.",
      },
    ],
    sources: refsToSources(["ICHCC_CLCP", "CMSA_STANDARDS_2022", "CCMC"]),
    related: [
      { title: "Life Care Plan Development", href: "/methods/life-care-plan-development", description: "How a life care plan is researched and costed." },
      { title: "Life Care Planning", href: "/services/life-care-planning", description: "Itemized projection of future care needs and costs." },
      { title: "Life Expectancy Lookup", href: "/tools/life-expectancy", description: "Look up life expectancy by age." },
    ],
  },
  {
    slug: "crc-vs-cve",
    title: "CRC vs. CVE: Certified Rehabilitation Counselor vs. Certified Vocational Evaluator",
    dateModified: "2026-04-20",
    a: {
      label: "Certified Rehabilitation Counselor (CRC)",
      summary: "Broad rehabilitation counseling credential issued by CRCC covering assessment, counseling, case management, and vocational opinion.",
      url: "/credentials/crc",
    },
    b: {
      label: "Certified Vocational Evaluator (CVE)",
      summary: "Specialized vocational evaluation credential historically issued by the now-defunct CCWAVES, focused on standardized testing, work samples, and situational assessment (Commission on Rehabilitation Counselor Certification, n.d.).",
      url: "/credentials/cve",
    },
    rows: [
      { dimension: "Issuer", a: "CRCC", b: "CCWAVES (now defunct)" },
      { dimension: "Scope", a: "Counseling + vocational opinion + case management", b: "Vocational evaluation, emphasizing standardized testing" },
      { dimension: "Typical use", a: "Forensic earning capacity, employability, expert testimony", b: "In-depth vocational assessment, often alongside CRC" },
      { dimension: "Prerequisites", a: "Master's in rehabilitation counseling", b: "Master's in a relevant field + supervised eval experience" },
      { dimension: "Renewal", a: "Every 5 years with CE", b: "Historically renewed per CCWAVES requirements" },
    ],
    whenUseA:
      "Retain a CRC when the case requires [[/guides/earning-capacity-vs-lost-earnings|earning capacity opinion]], labor market analysis, employability assessment, or expert testimony on vocational issues.",
    whenUseB:
      "Retain a CVE when in-depth [[/services/life-care-planning|standardized testing, work-sample evaluation, or situational assessment]] is needed to characterize aptitudes and work behaviors.",
    overlap:
      "Many vocational experts hold both CRC and CVE credentials. The credentials are complementary: CRC provides the breadth of rehabilitation counseling, CVE adds depth in vocational evaluation methodology.",
    faqs: [
      {
        question: "Is one credential required for forensic vocational testimony?",
        answer:
          "Neither is categorically required. CRC is among the most widely recognized vocational credentials for forensic testimony; CVE is an accepted alternative or complement when testing is central to the opinion.",
      },
      {
        question: "Can a single expert hold both?",
        answer:
          "Yes, and this is common among experienced forensic vocational experts.",
      },
    ],
    sources: refsToSources(["CRCC", "CVE_STATUS"]),
    related: [
      { title: "Earning Capacity vs. Lost Earnings", href: "/guides/earning-capacity-vs-lost-earnings", description: "Distinguishing earning capacity from lost earnings." },
      { title: "Vocational Expert Services", href: "/services/life-care-planning", description: "Independent vocational opinion on earning capacity and employability." },
    ],
  },
  {
    slug: "vocational-expert-vs-career-counselor",
    title: "Vocational Expert vs. Career Counselor",
    dateModified: "2026-04-20",
    a: {
      label: "Vocational Expert",
      summary: "A credentialed forensic professional who opines on earning capacity, employability, and labor market availability for litigation.",
      url: "/services/life-care-planning",
    },
    b: {
      label: "Career Counselor",
      summary: "A professional who advises individuals on career choice, job search, and professional development.",
    },
    rows: [
      { dimension: "Primary purpose", a: "Forensic opinion for litigation", b: "Client-directed career guidance" },
      { dimension: "Output", a: "Written report + expert testimony", b: "Career plan and coaching" },
      { dimension: "Methodology basis", a: "transferable skills analysis (TSA), labor market survey (LMS), Dictionary of Occupational Titles (DOT)/O*NET, functional capacity evaluation (FCE) integration (U.S. Department of Labor, 1991; National Center for O*NET Development, n.d.)", b: "Interest inventories, goal setting, job search" },
      { dimension: "Typical credential", a: "CRC, CVE, ABVE", b: "NCC, GCDF, career coach certifications" },
      { dimension: "Audience", a: "Retaining attorney and court", b: "Individual client" },
    ],
    whenUseA:
      "Retain a vocational expert when [[/guides/earning-capacity-vs-lost-earnings|earning capacity, employability, or labor market questions]] are contested in litigation.",
    whenUseB:
      "Engage a career counselor when an individual needs help with career choice, job search, or professional transition outside of a litigation context.",
    overlap:
      "Both involve labor market knowledge and assessment. The distinction is audience and purpose: forensic opinion (vocational expert) versus personal career guidance (career counselor).",
    faqs: [
      {
        question: "Can a career counselor testify as a vocational expert?",
        answer:
          "Without forensic credentials and methodology (TSA, LMS, accepted references), a career counselor is unlikely to be qualified or persuasive as a forensic vocational expert (Daubert v. Merrell Dow Pharmaceuticals, Inc., 1993; Fed. R. Evid. 702).",
      },
    ],
    sources: refsToSources(["DAUBERT", "FRE_702", "DOT", "ONET", "CRCC"]),
    related: [
      { title: "Transferable Skills Analysis", href: "/methods/transferable-skills-analysis", description: "Method for identifying occupations that fit residual skills." },
      { title: "Labor Market Survey", href: "/methods/labor-market-survey", description: "Surveying local labor markets for occupational availability." },
      { title: "Earning Capacity vs. Lost Earnings", href: "/guides/earning-capacity-vs-lost-earnings", description: "Distinguishing earning capacity from lost earnings." },
    ],
  },
];

export function getComparison(slug: string): Comparison | undefined {
  return comparisons.find((c) => c.slug === slug);
}
