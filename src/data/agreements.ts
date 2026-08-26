// 2026 KWVRS Professional Services Agreements (signable, link-only intake pages).
// Source PDFs: "KWVRS Resources/Intake Forms/PSAs (Retainer Agreements)".

export interface ConditionSection {
  num: string;
  title: string;
  paragraphs?: string[];
  subsections?: { num: string; title: string; body: string; bullets?: string[] }[];
}

export interface FeeRow {
  service: string;
  detail?: string;
  fee: string;
}

export type DocumentsRequested =
  | { kind: "list"; intro?: string; items: { label: string; sub?: string[] }[]; note?: string }
  | {
      kind: "matrix";
      columns: string[];
      rows: { label: string; sub?: string[]; marks: boolean[] }[];
      legend?: string;
      note?: string;
    };

export interface Agreement {
  slug: string;
  shortName: string;
  title: string;
  docFileName: string;
  intro: string;
  paymentNote: string;
  intake: {
    representsOptions?: string[];
    caseTypeOptions: string[];
    workProductOptions: string[];
    paymentOptions: string[];
    carrierClaimLabel: string;
    adjusterLabel: string;
    firmLabel: string;
  };
  documentsRequested: DocumentsRequested[];
  feeSchedule: { title: string; columns: [string, string]; rows: FeeRow[]; footnotes?: string[] };
  officeFooter: string;
}

export const ACKNOWLEDGMENT =
  "By signing my name below, I agree to solidify retention of KWVRS for the work products I have selected above. Additionally, I have reviewed and agree to the Conditions of Retention, including KW's policies with regards to turnaround time, payment schedule, and expert assignment. I authorize the review of the confidential records to be exchanged, and I agree that I am responsible for ensuring payment of all professional fees, 50% upon retention, and the balance prior to the release of the draft report.";

// Exhibit C - Conditions of Retention. Substantively shared across all 2026 PSAs.
export const CONDITIONS_OF_RETENTION: ConditionSection[] = [
  {
    num: "1",
    title: "Purpose",
    paragraphs: ["The Conditions of Retention are intended to:"],
    subsections: [
      {
        num: "",
        title: "",
        body: "",
        bullets: [
          "Ensure that KWVRS receives all records, information, and access necessary to perform retained services efficiently and professionally.",
          "Establish uniform payment, refundability, and fee-adjustment rules across all engagements.",
          "Define clear prerequisites for scheduling, report preparation, and turnaround times.",
          "Set expectations regarding cancellations, rescheduling, and communication.",
          "Preserve KWVRS's discretion over expert assignment, internal workflow, and methodology.",
          "Standardize administrative policies to minimize delays, errors, and disputes.",
        ],
      },
    ],
  },
  {
    num: "2",
    title: "Record Submission and Case Readiness",
    subsections: [
      { num: "2.1", title: "Pre-Scheduling Requirement.", body: "Client acknowledges that all requested records and materials must be submitted prior to the scheduling of interviews, evaluations, or examinations." },
      { num: "2.2", title: "Paperless Office.", body: "KWVRS is a paperless office. All records must be submitted electronically. Paper records may be returned to sender." },
      { num: "2.3", title: "Records Exchange (Defense Matters).", body: "For defense-retained Vocational Evaluations and Life Care Plans, Client agrees to provide plaintiff expert reports of the same type prior to interview scheduling. Regardless of retaining party, both plaintiff and defense expert reports should be provided when available." },
      { num: "2.4", title: "Late or Supplemental Records.", body: "Submission of records after interviews have occurred or after report drafting has begun may result in additional fees and/or extended turnaround times." },
      { num: "2.5", title: "Excessive Record Volume.", body: "Review of medical or other records exceeding established thresholds (generally 1,000 pages unless otherwise specified) will be billed at the applicable hourly rate set forth in the current fee schedule." },
    ],
  },
  {
    num: "3",
    title: "Expert Assignment",
    subsections: [
      { num: "3.1", title: "Discretion in Assignment.", body: "Client acknowledges that KWVRS retains sole discretion regarding assignment of expert(s) to each matter." },
      { num: "3.2", title: "Requested Experts.", body: "KWVRS will endeavor to honor requests for specific experts; however, availability cannot be guaranteed." },
      { num: "3.3", title: "Additional Experts.", body: "KWVRS reserves the right to involve additional experts, consultants, or analysts when their expertise will add value. Such individuals may appear as co-interviewers and/or co-signatories on reports." },
    ],
  },
  {
    num: "4",
    title: "Fees, Payment, and Fee Adjustments",
    subsections: [
      { num: "4.1", title: "Fee Schedule Applicability.", body: "Fees are governed by the fee schedule in effect at the time services are performed. Fees for services requested after initial retention are subject to increase based on the most current fee schedule." },
      { num: "4.2", title: "Payment Structure.", body: "Unless otherwise stated in writing: 50% of the total fee is due upon retention and prior to scheduling interviews, and the remaining 50% is due post-interview and prior to release of any draft or final work product." },
      { num: "4.3", title: "Commencement of Work.", body: "Work may commence prior to receipt of payment at KWVRS's discretion; however, no work product will be released until payment is received in full." },
      { num: "4.4", title: "Non-Contingent Fees.", body: "All fees are non-contingent and not dependent on case outcome, settlement, or admissibility determinations." },
      { num: "4.5", title: "Overdue Invoices.", body: "50% payment for work product invoices is due upon retention and prior to the vocational interview. The remaining 50% is due upon report completion and prior to the release of the draft report. In the event Client fails to pay an invoice upon report completion, KWVRS reserves the right to discontinue any and all other current work in progress, and/or will not be able to take in new referrals until the outstanding invoice(s) are paid in full." },
      { num: "4.6", title: "Disputed Charges.", body: "Client may dispute only clear errors appearing on the face of an invoice and must do so in writing within twenty-eight (28) days of the invoice date. Undisputed portions remain due and payable." },
    ],
  },
  {
    num: "5",
    title: "Refundability and Case Withdrawal",
    subsections: [
      { num: "5.1", title: "Case Withdrawal - Initial Period.", body: "Cases withdrawn within thirty (30) days of signing the Agreement and/or prior to the scheduling of a vocational interview are refundable less a $2,500 case intake fee." },
      { num: "5.2", title: "Case Withdrawal - After 30 Days.", body: "Cases withdrawn after (30) days the evaluee and/or after the evaluee is interviewed by the appointed expert are non-refundable." },
      { num: "5.3", title: "Testimony Refundability.", body: "Testimony fees are: 100% refundable if notice is provided seven (7) or more business days prior; 50% refundable if notice is provided four (4) to six (6) business days prior; non-refundable if notice is provided within three (3) business days of testimony, or if testimony is scheduled during KWVRS's interviewing schedule. Cancellation is non-refundable, regardless of notice, when testimony is scheduled midweek and outside the Monday or Friday court calendar." },
    ],
  },
  {
    num: "6",
    title: "Turnaround Times",
    subsections: [
      { num: "6.1", title: "Commencement of Turnaround.", body: "Turnaround times begin only after completion of the interview (if applicable), and receipt of all required records." },
      { num: "6.2", title: "Standard Timelines.", body: "Vocational Evaluations: 30 days. Life Care Plans, Economic Assessments, Loss of Household Services: 45 days." },
      { num: "6.3", title: "Comprehensive Medical Examinations.", body: "Where an Independent Medical Examination is conducted by KWVRS, turnaround may extend to 45 days." },
      { num: "6.4", title: "Expedited Requests.", body: "Expedited timelines are subject to acceptance and applicable surcharge fees." },
    ],
  },
  {
    num: "7",
    title: "Cancellations and No-Shows",
    subsections: [
      { num: "7.1", title: "Interviews.", body: "Interview cancellations or failures to appear with less than seventy-two (72) hours' notice are subject to the applicable no-show or cancellation fee." },
      { num: "7.2", title: "Testimony.", body: "Deposition and court appearance cancellations are governed by the refundability provisions set forth above and the applicable fee schedule." },
    ],
  },
  {
    num: "8",
    title: "Scope Changes, Supplemental Work, and Case Resumption",
    subsections: [
      { num: "8.1", title: "Scope Modifications.", body: "Requests for supplemental opinions, revisions, addenda, or services outside the originally retained scope are billed separately." },
      { num: "8.2", title: "Delayed Revisions.", body: "Revisions requested more than thirty (30) days after draft delivery are billable unless required to correct an internal error." },
      { num: "8.3", title: "Deferred or Dormant Matters.", body: "Reports requiring update beyond two (2) years of the original draft date are treated as new cases and invoiced at 75% of the current fee for the applicable work product." },
    ],
  },
  {
    num: "9",
    title: "Relationship to the Professional Services Agreement",
    subsections: [
      {
        num: "",
        title: "",
        body: "",
        bullets: [
          "The applicable PSA governs the legal and contractual relationship between the parties.",
          "These Conditions of Retention govern operational, administrative, and procedural requirements.",
          "In the event of inconsistency, the PSA controls unless expressly stated otherwise.",
          "Acceptance of retention constitutes acceptance of these Conditions of Retention.",
        ],
      },
    ],
  },
];

const HACKENSACK_FOOTER =
  "Kincaid Wolstein Vocational and Rehabilitation Services - 1 University Plaza, Suite 302, Hackensack, New Jersey 07601 - www.kwvrs.com - info@kwvrs.com - Tel: (201) 343-0700";

const CONSULTING: Agreement = {
  slug: "consulting",
  shortName: "Consulting",
  title: "2026 Consulting Professional Services Agreement",
  docFileName: "2026 KWVRS Consulting PSA.pdf",
  intro:
    "Thank you for your interest in retaining Kincaid Wolstein Vocational and Rehabilitation Services. Please take a moment to review this document in its entirety. At your earliest convenience, kindly complete the brief intake form below, append your signature, and return it.",
  paymentNote:
    "We prefer that you send payment by check or ACH wire transfer. 50% of the invoice total is required upon retention and prior to the start of work. The remaining 50% (payment in full) is required prior to the release of all draft work products.",
  intake: {
    representsOptions: ["Plaintiff", "Defense", "Joint with Co-Counsel(s)"],
    caseTypeOptions: ["Personal Injury", "Med Mal", "WC", "MVA", "Wrongful death", "TDIU", "LTD", "Other"],
    workProductOptions: ["Business Valuation", "Life Care Plan", "IME", "Loss of Household Services", "Economic Analysis", "VE"],
    paymentOptions: ["Check", "Credit Card", "ACH"],
    carrierClaimLabel: "Carrier/Claim No. (Defense)",
    adjusterLabel: "Adjuster Name (Defense)",
    firmLabel: "Retaining Firm",
  },
  documentsRequested: [
    {
      kind: "list",
      intro: "Exhibit A: Documents Requested for Business Valuations and Economic Analyses",
      items: [
        { label: "Executed authorizations to release records", sub: ["Tax, banking, payroll, and merchant-processing authorizations (signed)"] },
        { label: "Business Profile Questionnaire", sub: ["Entity type; EIN; NAICS; locations; products/services; key personnel; ownership"] },
        { label: "Financial records (native files where possible: QuickBooks/Xero/Sage exports + chart of accounts)", sub: ["Federal & state returns with all schedules (1120/1120-S/1065/Schedule C) for last 3-5 years; monthly P&L, balance sheet, cash-flow, trial balance, general ledger (>=36-60 months pre-event through present); sales/revenue detail by month and by product/service, location, and customer; price lists/discounts; COGS details and purchase journals; vendor invoices/summaries; AR/AP aging by month; bank statements; merchant processor statements; POS/e-commerce exports; web analytics; inventory records, valuation method, counts, write-downs"] },
        { label: "Payroll & staffing records", sub: ["Payroll registers by pay period; employee-level hours/overtime/pay type; payroll taxes/benefits; 1099 summaries; staffing rosters/schedules; timesheets for the claimed loss period"] },
        { label: "Insurance, claims, and coverage", sub: ["Full BI policy (declarations, forms, endorsements, limits, waiting periods, civil-authority/ingress-egress); claim submissions; adjuster communications/reports; insurer coverage letters"] },
        { label: "Event, closure, and causation evidence", sub: ["Government orders/public-health directives; landlord/property notices; supplier/customer cancellations or delays; impacted POs/contracts/service agreements; incident reports; photos; repair logs/invoices; temporary-operations records; defined loss period (start/end) with rationale"] },
        { label: "Operations & capacity documentation" },
        { label: "Budgets, forecasts, and pipeline" },
        { label: "Market & external data (client-held)" },
        { label: "Legal/contractual materials", sub: ["Formation documents; leases; franchise agreements; supplier and customer contracts; loan agreements/covenants; litigation pleadings; discovery; deposition transcripts; other experts' reports"] },
        { label: "Mitigation & offsets" },
        { label: "Licenses & regulatory compliance (if applicable)" },
      ],
      note: "Provide native electronic files (Excel/CSV, accounting backups) whenever possible. If production exceeds 2,000 pages, review beyond that volume is billed hourly per the fee schedule. Include at least 36 months pre-event data and all post-event data to date. KWVRS is a paperless office; all records must be submitted electronically.",
    },
    {
      kind: "matrix",
      columns: ["Document(s)", "Vocational Evaluation", "Life Care Plan / IME"],
      rows: [
        { label: "Signed HIPAA Release", marks: [false, true] },
        { label: "Completed Personal History Questionnaire", marks: [true, true] },
        { label: "Medical Records (ER from date of incident; discharge summaries & operative/procedural reports; imaging/diagnostics - reports only; narrative reports; IME reports plaintiff & defense; functional capacity evaluations). Keep within 1,000 pages if possible.", marks: [true, true] },
        { label: "Legal Exhibits (bills of particulars; summons & complaints; deposition/testimony transcripts)", marks: [true, true] },
        { label: "Other Experts' Reports", marks: [true, true] },
        { label: "Employment Records (tax returns, W-2s, paystubs; SSA statement of earnings; union contracts; job descriptions; performance evaluations)", marks: [true, false] },
        { label: "Educational Records (transcripts; special certification documents)", marks: [true, false] },
        { label: "Prison Records (if applicable)", marks: [true, false] },
      ],
      legend: "Addendum A - Loss of Household Services Reports. A check indicates the document is requested for that report type.",
    },
  ],
  feeSchedule: {
    title: "Exhibit B: Compensation Schedule",
    columns: ["Service", "Fee"],
    rows: [
      { service: "Consultation", fee: "$2,500 Retainer" },
      { service: "Business Valuation Report (Stand-Alone Engagement)", fee: "$15,000 Retainer" },
      { service: "Business Valuation & Economic Damages Assessment (Combined Report)", fee: "$20,000 Retainer" },
      { service: "Economic Damages Assessment", detail: "Stand-Alone Report / In Combination with Another Report", fee: "$6,000 / $5,000" },
      { service: "Transition/Education Evaluation", fee: "$5,000 - $7,500" },
      { service: "Loss of Household Services Valuation", fee: "$4,000" },
      { service: "Court Appearance (Trial Testimony)", fee: "$6,500" },
      { service: "Deposition", detail: "Up to 4 Hours / Full Day (more than 4 hours)", fee: "$4,000 / $5,500" },
      { service: "Preparation for Court Appearance or Deposition", fee: "$550/hour" },
      { service: "Interview / Case Conference No-Show or Cancellation (under 72 hours)", fee: "$750" },
      { service: "Travel Surcharge", fee: "$550/hour" },
      { service: "Expedited Report Surcharge", detail: "1-7 / 8-14 / 15-29 Day Turnaround", fee: "$5,000 / $3,750 / $2,500" },
      { service: "Supplemental / Addendum / Revision", detail: "Edits beyond 30 days after the original draft (excluding internal error)", fee: "$550/hour" },
      { service: "Clerical Work and/or Extensive Record Summarization", detail: "Records in excess of 1,000 pages or received after the interview", fee: "$300/hour" },
    ],
  },
  officeFooter: HACKENSACK_FOOTER,
};

const PERSONAL_INJURY: Agreement = {
  slug: "personal-injury",
  shortName: "Personal Injury",
  title: "2026 Personal Injury Professional Services Agreement",
  docFileName: "2026 KWVRS PI PSA.pdf",
  intro:
    "Thank you for your interest in retaining Kincaid Wolstein Vocational and Rehabilitation Services. Please take a moment to review this document in its entirety. At your earliest convenience, kindly complete the brief intake form below, append your signature, and return it.",
  paymentNote:
    "We prefer that you send payment by check or ACH wire transfer. 50% of the invoice total is required upon retention and prior to the start of work. The remaining 50% (payment in full) is required prior to the release of all draft work products.",
  intake: {
    representsOptions: ["Plaintiff", "Defense", "Joint with Co-Counsel(s)"],
    caseTypeOptions: ["Personal Injury", "Med Mal", "WC", "Wrongful Death", "MVA", "Econ"],
    workProductOptions: ["Vocational Evaluation", "Life Care Plan", "IME", "Loss of Household Services", "Economic Analysis"],
    paymentOptions: ["Check", "Credit Card", "ACH"],
    carrierClaimLabel: "Carrier/Claim No. (Defense)",
    adjusterLabel: "Adjuster Name (Defense)",
    firmLabel: "Retaining Firm",
  },
  documentsRequested: [
    {
      kind: "matrix",
      columns: ["Document(s)", "Vocational Evaluation", "Life Care or IME"],
      rows: [
        { label: "Signed HIPAA Release", marks: [false, true] },
        { label: "Completed Personal History Questionnaire", marks: [true, true] },
        { label: "Medical Records (ER from date of incident; discharge summaries & operative/procedural reports from all hospital stays; imaging/diagnostics - reports only; narrative reports; IME reports plaintiff & defense; functional capacity evaluations). Keep within 1,000 pages if possible; review of >1,000 pages billed hourly per the fee schedule.", marks: [true, true] },
        { label: "Legal Exhibits (bills of particulars; summons & complaints; deposition/testimony transcripts)", marks: [true, true] },
        { label: "Other Experts' Reports", marks: [true, true] },
        { label: "Employment Records (tax returns, W-2s, paystubs; SSA statement of earnings; union contracts; job descriptions; performance evaluations)", marks: [true, false] },
        { label: "Educational Records (transcripts demonstrating higher or specialized education; special certification documents)", marks: [true, false] },
        { label: "Prison Records (if applicable)", marks: [true, false] },
      ],
      legend: "A check indicates the document is requested for that report type.",
      note: "For additional records requested for an Economic Assessment and/or Loss of Household Services Analysis, please consult the appropriate addendum for that report type. KWVRS is a paperless office; all records must be submitted electronically.",
    },
  ],
  feeSchedule: {
    title: "Exhibit B: Compensation Schedule",
    columns: ["Work Product and Description", "Fees*"],
    rows: [
      { service: "Independent Medical Examination or Standard of Care Report", detail: "Jesse Wolstein, MD", fee: "$4,000" },
      { service: "Vocational Evaluation / Earning Capacity Analysis", detail: "D. Wolstein/M. Putts - Senior Experts / Fellow Experts", fee: "$7,500 / $6,500" },
      { service: "Life Care Plan", fee: "$8,500" },
      { service: "Vocational Evaluation / Earning Capacity Analysis & Life Care Plan", detail: "Senior Experts / Fellow Experts", fee: "$14,750 / $13,750" },
      { service: "Loss of Household Services", fee: "$4,000" },
      { service: "Economic Analysis of one Base Report (VE, LCP, or LHHS)", detail: "Additional report analyses subject to additional fees", fee: "$5,000" },
      { service: "Court Appearance", detail: "D. Wolstein/M. Putts - Senior Experts / Fellow Experts", fee: "$7,500 / $6,500" },
      { service: "Deposition - up to 4 hours", detail: "D. Wolstein/M. Putts - Senior Experts / Fellow Experts", fee: "$4,500 / $4,000" },
      { service: "Deposition - full day (more than 4 hours)", detail: "Senior / Fellow Expert rates", fee: "$6,500 / $6,000" },
      { service: "Preparation for Court Appearance or Deposition", fee: "$550/hour" },
      { service: "Interview No-Show / Cancellation (under 72 hours)", fee: "$750" },
      { service: "Travel Surcharge", fee: "$550/hour" },
      { service: "Expedited Report Surcharge (from interview date)", detail: "1-7 / 8-14 / 15-29 Day Turnaround", fee: "$5,000 / $3,750 / $2,500" },
      { service: "Supplemental / Addendum / Revision", detail: "Edits beyond 30 days after the original draft (excluding internal error)", fee: "$550/hour" },
      { service: "Clerical Work and/or Extensive / Delayed Medical Record Summarization", detail: "Records in excess of 1,000 pages or received after the interview", fee: "$300/hour" },
    ],
    footnotes: ["*Fees are governed by the fee schedule in effect at the time services are performed."],
  },
  officeFooter: HACKENSACK_FOOTER,
};

const MATRIMONIAL: Agreement = {
  slug: "matrimonial",
  shortName: "Matrimonial",
  title: "2026 Matrimonial Professional Services Agreement",
  docFileName: "2026 KWVRS Marital PSA.pdf",
  intro:
    "Thank you for your interest in retaining Kincaid Wolstein Vocational and Rehabilitation Services. Please take a moment to review this document in its entirety. At your earliest convenience, kindly complete the brief intake form below, append your signature, and return it.",
  paymentNote:
    "We prefer that you send payment by check. 50% of the invoice total is required upon retention and prior to the start of work. The remaining 50% (payment in full) is required prior to the release of all draft work products.",
  intake: {
    caseTypeOptions: ["Matrimonial"],
    workProductOptions: ["Vocational Evaluation"],
    paymentOptions: ["Check", "Credit Card or ACH Payment online"],
    carrierClaimLabel: "Carrier/Claim No. (Defense)",
    adjusterLabel: "Adjuster Name (Defense)",
    firmLabel: "Retaining Firm",
  },
  documentsRequested: [
    {
      kind: "list",
      intro: "Exhibit A: Documents Requested",
      items: [
        { label: "Resume(s) / Curriculum Vitae" },
        { label: "Completed Personal History Questionnaire" },
        { label: "Legal Exhibits", sub: ["Bill(s) of Particulars", "Complaint(s)", "Relevant Deposition(s)", "Case Information Statement"] },
        { label: "Employment Records", sub: ["Earnings records, including paystubs, W-2s and/or a Social Security Administration Earnings Statement", "Union Contracts", "Job Description(s)", "Performance Evaluations"] },
        { label: "Job Search Records", sub: ["Job Applications", "Job Search Logs"] },
        { label: "Education Records", sub: ["Transcripts", "Testing Results (National Tests)", "Special Certification Documents"] },
        { label: "Prison Records" },
        { label: "Other Experts' Reports" },
        { label: "Hospital and Medical Records (if applicable)", sub: ["Admission Records, ER Records, and Discharge Summaries", "Operative Reports", "Pertinent Imaging and Diagnostic Reports (reports only)", "Physician Narratives", "Independent Medical Evaluations", "Functional Capacity Evaluations"] },
      ],
      note: "KWVRS is a paperless office. All records must be submitted electronically. Paper documents forwarded to this office will be returned to sender.",
    },
  ],
  feeSchedule: {
    title: "Exhibit B: Compensation Schedule",
    columns: ["Work Product and Description", "Fees"],
    rows: [
      { service: "Vocational Evaluation / Earning Capacity Analysis - No Medical Review", detail: "Drs. Wolstein or Putts - Senior Experts / Associate Experts", fee: "$7,000 / $6,000" },
      { service: "Vocational Evaluation / Earning Capacity - with Medical Review", detail: "Senior Experts / Associate Experts", fee: "$8,000 / $7,000" },
      { service: "File preparation, medical record preparation (if applicable), proofreading, study, preparation with attorney associated with court appearance or deposition", fee: "$550/hour" },
      { service: "Court Appearance", detail: "Drs. Wolstein or Putts - Senior Experts / Associate Experts", fee: "$5,500 / $4,500" },
      { service: "Deposition - 1/2 day (up to 4 hours)", detail: "Senior Experts / Associate Experts", fee: "$4,500 / $4,000" },
      { service: "Deposition - full day (greater than 4 hours)", detail: "Senior / Associate Experts", fee: "$6,500 / $5,500" },
      { service: "Travel Surcharge", fee: "$550" },
      { service: "Interview No-Show / Cancellation (under 72 hours)", fee: "$750" },
      { service: "Expedited Report Surcharge (from interview date)", detail: "1-7 / 8-14 / 15-29 Day Turnaround", fee: "$2,600 / $2,100 / $1,600" },
      { service: "Supplemental / Addendum / Revision", detail: "Edits beyond 30 days after the original draft (excluding internal error)", fee: "$550/hour" },
      { service: "Clerical", fee: "$300/hour" },
    ],
  },
  officeFooter: HACKENSACK_FOOTER,
};

const NONMETRO: Agreement = {
  slug: "nonmetro",
  shortName: "Non-Metro",
  title: "2026 Non-Metro Professional Services Agreement",
  docFileName: "2026 KWVRS NM PSA.pdf",
  intro:
    "Thank you for your interest in retaining Kincaid Wolstein Vocational and Rehabilitation Services. Please take a moment to review this document in its entirety. At your earliest convenience, kindly complete the brief intake form below, append your signature, and return it.",
  paymentNote:
    "We prefer that you send payment by check or ACH wire transfer. 50% of the invoice total is required upon retention and prior to the start of work. The remaining 50% (payment in full) is required prior to the release of all draft work products.",
  intake: {
    representsOptions: ["Plaintiff", "Defense", "Husband", "Wife"],
    caseTypeOptions: ["Personal Injury", "Med Mal", "Wrongful termination", "WC", "Wrongful death", "Discrimination", "MVA", "Marital"],
    // CME removed 2026-08-17 (Chris: medical exams are NY/NJ-only; the
    // non-metro PSA is by definition outside them). The printed PDF keeps its
    // CME checkbox; the web form just no longer offers it.
    workProductOptions: ["Vocational Evaluation", "Life Care Plan", "Loss of Household Services", "Economic Analysis"],
    paymentOptions: ["Check", "Credit Card or ACH online"],
    carrierClaimLabel: "Carrier/Claim No. (If applicable)",
    adjusterLabel: "Adjuster Name (If applicable)",
    firmLabel: "Retaining Firm",
  },
  documentsRequested: [
    {
      kind: "matrix",
      columns: ["Document(s)", "Vocational Evaluation", "Life Care Plan"],
      rows: [
        { label: "Signed HIPAA Release", marks: [false, true] },
        { label: "Completed Personal History Questionnaire", marks: [true, true] },
        { label: "Medical Records (ER from date of incident; discharge summaries & operative/procedural reports from all hospital stays; imaging/diagnostics - reports only; narrative reports; IME reports plaintiff & defense; functional capacity evaluations). Keep within 1,000 pages if possible; review of >1,000 pages billed hourly per the fee schedule.", marks: [true, true] },
        { label: "Legal Exhibits (bills of particulars; summons & complaints; deposition/testimony transcripts)", marks: [true, true] },
        { label: "Other Experts' Reports", marks: [true, true] },
        { label: "Employment Records (tax returns, W-2s, paystubs; SSA statement of earnings; union contracts; job descriptions; performance evaluations)", marks: [true, false] },
        { label: "Educational Records (transcripts demonstrating higher or specialized education; special certification documents)", marks: [true, false] },
        { label: "Prison Records (if applicable)", marks: [true, false] },
      ],
      legend: "A check indicates the document is requested for that report type.",
      note: "KWVRS is a paperless office. All records must be submitted electronically.",
    },
  ],
  feeSchedule: {
    title: "Exhibit B: Compensation Schedule",
    columns: ["Work Product and Description", "Retainer Fees*"],
    rows: [
      { service: "Independent Medical Examination or Standard of Care Report", detail: "Jesse Wolstein, MD", fee: "$4,000" },
      { service: "Vocational Evaluation / Earning Capacity Analysis", detail: "The retainer is a deposit for work, not an estimate; the final fee may be greater than the retainer. All outstanding charges are payable before the release of the work product. If the retainer has been mostly used, it will have to be refreshed.", fee: "$5,000 / PI\n$4,000 / Marital" },
      { service: "Life Care Plan", fee: "$6,000" },
      { service: "Vocational Evaluation / Earning Capacity Analysis & Life Care Plan", fee: "$10,000" },
      { service: "Economic Assessment", detail: "Stand alone report / In combination with another report", fee: "$4,000 / $3,000" },
      { service: "Loss of Household Services", fee: "$3,000" },
      { service: "Court Appearance", detail: "If the case settles, or for any other reason the vocational expert is not needed to testify and one week (7 full days) notice is not given, then retaining firm agrees to pay for 4 hrs lost time at $375/hr ($1,500).", fee: "$4,000" },
      { service: "Deposition", detail: "Up to 4 hours / Full day (more than 4 hours)", fee: "$2,500 / $4,000" },
      { service: "Preparation for Court Appearance or Deposition", fee: "$375/hour" },
      { service: "Interview No-Show / Cancellation (under 72 hours)", fee: "$375" },
      { service: "Travel Surcharge", fee: "$375/hour" },
      { service: "Expedited Report Surcharge (from interview date)", detail: "1-7 / 8-14 / 15-29 Day Turnaround", fee: "$2,500 / $2,000 / $1,000" },
      { service: "Supplemental / Addendum / Revision", detail: "Edits beyond 30 days after the original draft (excluding internal error)", fee: "$375/hour" },
      { service: "Clerical Work and/or Extensive / Delayed Medical Record Summarization", detail: "Records in excess of 1,000 pages or received after the interview", fee: "$200/hour" },
    ],
    footnotes: [
      "*Fees for services requested after initial retainment are subject to increase provided the most current fee schedule.",
      "Refundability: Cases withdrawn within 30 days of signing this Agreement are refundable less a $2,000 case intake fee. Cases withdrawn after 30 days of signing this Agreement are nonrefundable. Testimony fees are 100% refundable if notice of cancellation/rescheduling is provided 7 or more business days before appointment date/time; $1,500 is otherwise due for cancellations provided less than 7 days.",
      "Resumption of Deferred Cases: Reports requiring update beyond two years of the original draft report date are regarded as new cases and are invoiced at 75% of the current fee for any given work product.",
    ],
  },
  officeFooter: HACKENSACK_FOOTER,
};

export const AGREEMENTS: Agreement[] = [CONSULTING, PERSONAL_INJURY, MATRIMONIAL, NONMETRO];

export function getAgreement(slug: string): Agreement | undefined {
  return AGREEMENTS.find((a) => a.slug === slug);
}
