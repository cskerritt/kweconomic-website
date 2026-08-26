// Patient intake forms (PHQ + HIPAA, English + Spanish) surfaced on /forms, on
// their own pages at the original slugs, and linked from the intake email.
//
// Patient forms are download + secure-upload only (no online e-sign). The
// patient downloads the PDF, completes and signs it by hand or with a local
// tool, and returns it via the secure upload link sent in the intake email.
// PHI never touches this site.

export type FormType = "phq" | "hipaa";
export type FormLanguage = "English" | "Español";

export interface PatientForm {
  id: string;
  type: FormType;
  language: FormLanguage;
  /** Page title and listing label. */
  title: string;
  /** One-line, objective description. */
  description: string;
  /** Site route - mirrors the original site URLs. */
  slug: string;
  /** Downloadable PDF, served statically from public/documents/. */
  pdf: string;
}

export const PATIENT_FORMS: PatientForm[] = [
  {
    id: "phq-english",
    type: "phq",
    language: "English",
    title: "Personal History Questionnaire (English)",
    description:
      "Background questionnaire on health, function, and daily activities for the evaluation.",
    slug: "/phq-form-english",
    pdf: "/documents/KWVRS-PHQ-English.pdf",
  },
  {
    id: "phq-spanish",
    type: "phq",
    language: "Español",
    title: "Cuestionario de Historia Personal (Español)",
    description:
      "Cuestionario sobre salud, funcionamiento y actividades diarias para la evaluación.",
    slug: "/phq-form-spanish",
    pdf: "/documents/KWVRS-PHQ-Spanish.pdf",
  },
  {
    id: "hipaa-english",
    type: "hipaa",
    language: "English",
    title: "HIPAA Authorization (English)",
    description:
      "Authorization to release protected health information for the evaluation.",
    slug: "/hipaa-english",
    pdf: "/documents/KWVRS-HIPAA-English.pdf",
  },
  {
    id: "hipaa-spanish",
    type: "hipaa",
    language: "Español",
    title: "Autorización HIPAA (Español)",
    description:
      "Autorización para divulgar información médica protegida para la evaluación.",
    slug: "/hipaa-spanish",
    pdf: "/documents/KWVRS-HIPAA-Spanish.pdf",
  },
];

export function getPatientFormBySlug(slug: string): PatientForm | undefined {
  return PATIENT_FORMS.find((form) => form.slug === slug);
}

// Professional Services Agreements (the retainer PDFs). These are the same four
// templates the intake forms mirror and the workflow sends for e-signature
// (workflow/templates/), served here for review/download.
export interface PsaForm {
  id: string;
  title: string;
  description: string;
  /** Downloadable PDF, served statically from public/documents/. */
  pdf: string;
}

export const PSA_FORMS: PsaForm[] = [
  {
    id: "psa-personal-injury",
    title: "Personal Injury PSA",
    description:
      "Retainer agreement for personal injury, motor vehicle accident, medical malpractice, wrongful death, workers' compensation, long-term disability, and economic loss matters.",
    pdf: "/documents/KWVRS-PSA-Personal-Injury.pdf",
  },
  {
    id: "psa-matrimonial",
    title: "Matrimonial PSA",
    description: "Retainer agreement for matrimonial and family-law engagements.",
    pdf: "/documents/KWVRS-PSA-Matrimonial.pdf",
  },
  {
    id: "psa-consulting",
    title: "Consulting PSA",
    description: "Retainer agreement for consulting engagements.",
    pdf: "/documents/KWVRS-PSA-Consulting.pdf",
  },
  {
    id: "psa-nonmetro",
    title: "Non-Metro PSA",
    description: "Omnibus retainer agreement for non-metro jurisdictions and lower-fee matters.",
    pdf: "/documents/KWVRS-PSA-NonMetro.pdf",
  },
];
