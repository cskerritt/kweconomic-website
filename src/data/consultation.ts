import { caseTypes } from "./caseTypes";
import { INTAKE_DISCLOSURE } from "./intake";
import { ORG_EMAIL, ORG_PHONE, ORG_PHONE_DISPLAY, ORG_PHONE_VA, ORG_PHONE_VA_DISPLAY } from "@/lib/brand";

/**
 * Copy of the consultation request page (src/pages/ScheduleConsultation.tsx),
 * shared with scripts/prerender.mjs so the /schedule-consultation shell
 * carries the process, the preparation list, the form's field labels, and the
 * office details a reader sees after hydration (site audit 2026-09-05, task
 * T01: the shell delivered an H1 and two sentences before JavaScript).
 *
 * Until the page imports from here it holds a local copy of this text, and
 * scripts/prerender-shells.test.mjs pins the two copies together by rendering
 * the page and checking every step, item, label, and office line against
 * this module. Contact details resolve from src/lib/brand.ts, as on the page.
 */

/** The hero paragraph under the H1. */
export const CONSULTATION_LEAD =
  "Use the form below to describe your matter and request a consultation. Our team will respond within one business day to confirm receipt and discuss next steps.";

export interface ConsultationStep {
  step: string;
  heading: string;
  body: string;
}

/** "What to Expect": the four steps from the form to the start of the analysis. */
export const whatToExpect: ConsultationStep[] = [
  {
    step: "1",
    heading: "Initial Contact",
    body: "After submitting the form, a member of our team will review your inquiry and reach out within one business day to confirm receipt and clarify any initial questions about the matter.",
  },
  {
    step: "2",
    heading: "Preliminary Review",
    body: "We will conduct a brief conflict check and assess whether our services align with your needs. For most matters, this takes only a few hours once we have the basic case information.",
  },
  {
    step: "3",
    heading: "Consultation Call",
    body: "We will schedule a telephone or video consultation to discuss the case in more detail - the loss claim, the earnings, benefit, or financial records available, the timeline, and whether a full damages report, a present value analysis, or a rebuttal of an opposing report fits the matter. This call is typically 30-45 minutes.",
  },
  {
    step: "4",
    heading: "Engagement and Records",
    body: "If we proceed, we will confirm scope, timeline, and fee in writing and send a records request list. Once the engagement letter is signed and materials received, the economist will begin the analysis.",
  },
];

/** The sentence that introduces the preparation list. */
export const INFO_TO_HAVE_READY_INTRO =
  "The consultation will be most productive if you can provide the following at the outset. Exact records are not required at this stage - a general summary is sufficient to get started.";

/** "Information to Have Ready". */
export const infoToHaveReady: string[] = [
  "Nature of the matter (case type and jurisdiction)",
  "Date of the injury, death, termination, breach, or other event at issue",
  "The claimant's age, occupation, and work history, or the business whose losses are at issue",
  "Earnings, tax, and benefit records or business financial statements, if available",
  "Any deadlines - trial date, discovery cutoff, or expert disclosure date",
  "Whether you need an affirmative damages report, a rebuttal of an opposing economist's report, or both",
];

export interface ConsultationFormField {
  /** The label the form shows. */
  label: string;
  required: boolean;
  /** Choices offered by a select or radio group, in form order. */
  options?: string[];
}

/** The request form's fields, in form order. The case-type choices are the case types the site covers, plus "Other". */
export const consultationFormFields: ConsultationFormField[] = [
  { label: "First Name", required: true },
  { label: "Last Name", required: true },
  { label: "Email Address", required: true },
  { label: "Phone Number", required: true },
  { label: "Firm / Organization Name", required: true },
  { label: "Case Type", required: true, options: [...caseTypes.map((ct) => ct.name), "Other"] },
  { label: "Jurisdiction / State", required: true },
  { label: "Brief Description of the Matter", required: true },
  { label: "Preferred Language", required: false, options: ["English", "Spanish"] },
  { label: "Preferred Contact Method", required: false, options: ["Email", "Phone", "Either"] },
];

export const FORM_SUBMIT_LABEL = "Submit Consultation Request";

/** The note under the submit button. */
export const FORM_FOOTNOTE =
  "All submissions are reviewed within one business day. No commitment is required at this stage.";

/** The second note under the submit button: where the request goes (shared with the contact form and the privacy policy). */
export const FORM_INTAKE_NOTE = INTAKE_DISCLOSURE;

export interface ConsultationOffice {
  heading: string;
  location: string;
  /** E.164 number for the tel: link. */
  phone: string;
  phoneDisplay: string;
  email?: string;
}

/** "Our Offices". */
export const consultationOffices: ConsultationOffice[] = [
  {
    heading: "New Jersey - Headquarters",
    location: "Hackensack, New Jersey",
    phone: ORG_PHONE,
    phoneDisplay: ORG_PHONE_DISPLAY,
    email: ORG_EMAIL,
  },
  {
    heading: "Virginia - Richmond Office",
    location: "Richmond, Virginia",
    phone: ORG_PHONE_VA,
    phoneDisplay: ORG_PHONE_VA_DISPLAY,
  },
];

export interface OfficeHours {
  days: string;
  hours: string;
}

export const OFFICE_HOURS: OfficeHours[] = [
  { days: "Monday - Friday", hours: "9:00 AM - 5:00 PM ET" },
  { days: "Saturday - Sunday", hours: "Closed" },
];

export const AFTER_HOURS_NOTE = "After-hours inquiries via email are responded to the next business day.";
