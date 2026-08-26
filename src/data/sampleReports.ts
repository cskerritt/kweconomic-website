// Sample report library shown on the unlisted /samples page (noindex, slug-only).
// Files live in public/samples/<slug>.pdf. Grouped by discipline for display.
export interface SampleReport {
  slug: string;
  title: string;
  category: SampleCategory;
  summary: string;
  /** Public path to the PDF under /public. */
  file: string;
}

export type SampleCategory =
  | "Vocational Evaluation"
  | "Life Care Planning"
  | "Forensic Economics"
  | "Matrimonial"
  | "Independent Medical Evaluation";

export const SAMPLE_CATEGORIES: SampleCategory[] = [
  "Vocational Evaluation",
  "Life Care Planning",
  "Forensic Economics",
  "Matrimonial",
  "Independent Medical Evaluation",
];

const report = (
  slug: string,
  title: string,
  category: SampleCategory,
  summary: string,
): SampleReport => ({ slug, title, category, summary, file: `/samples/${slug}.pdf` });

export const SAMPLE_REPORTS: SampleReport[] = [
  report(
    "vocational-evaluation",
    "Vocational Evaluation",
    "Vocational Evaluation",
    "Earning-capacity and employability analysis with transferable-skills assessment in a personal injury matter.",
  ),
  report(
    "employability-evaluation",
    "Employability Evaluation",
    "Vocational Evaluation",
    "Labor-market access and employability assessment following an injury.",
  ),
  report(
    "child-employability-evaluation",
    "Child Employability Evaluation",
    "Vocational Evaluation",
    "Loss-of-earning-capacity analysis for an injured minor.",
  ),
  report(
    "tbi-employability-evaluation",
    "TBI Employability Evaluation",
    "Vocational Evaluation",
    "Employability and earning-capacity assessment following a traumatic brain injury.",
  ),
  report(
    "3101d-vocational-evaluation",
    "Vocational Evaluation (3101d)",
    "Vocational Evaluation",
    "Vocational assessment prepared under the 3101d evaluation framework.",
  ),
  report(
    "life-care-plan",
    "Life Care Plan",
    "Life Care Planning",
    "Comprehensive future-care cost projection for a catastrophic injury.",
  ),
  report(
    "tbi-life-care-plan",
    "TBI Life Care Plan",
    "Life Care Planning",
    "Life care plan addressing the lifetime care needs of a traumatic brain injury.",
  ),
  report(
    "3101d-life-care-plan",
    "Life Care Plan (3101d)",
    "Life Care Planning",
    "Life care plan prepared under the 3101d evaluation framework.",
  ),
  report(
    "loss-of-household-services",
    "Loss of Household Services",
    "Forensic Economics",
    "Economic valuation of lost household and family services.",
  ),
  report(
    "wrongful-death",
    "Wrongful Death Economic Loss",
    "Forensic Economics",
    "Economic loss analysis in a wrongful death matter.",
  ),
  report(
    "marital-employability-evaluation",
    "Matrimonial Employability Evaluation",
    "Matrimonial",
    "Employability and earning-capacity assessment prepared for a matrimonial matter.",
  ),
  report(
    "marital-overemployed",
    "Matrimonial - Overemployment Analysis",
    "Matrimonial",
    "Employability analysis addressing an overemployment claim.",
  ),
  report(
    "marital-underemployed",
    "Matrimonial - Underemployment Analysis",
    "Matrimonial",
    "Employability analysis addressing an underemployment / imputed-income claim.",
  ),
  report(
    "ime-report",
    "Independent Medical Evaluation (IME)",
    "Independent Medical Evaluation",
    "Independent medical evaluation report. IMEs are conducted for New York and New Jersey matters only.",
  ),
];
