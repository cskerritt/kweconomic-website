/**
 * Citation-free FAQ generators for geographic page templates. Each generator
 * returns 3-4 Q&A pairs templated with state/city tokens so that every
 * geographic page (state hub, service-state, city, etc.) has its own FAQ
 * block + faqPageSchema for AEO/SERP-features eligibility.
 *
 * Citation-free by policy: answers describe KWVRS services and general
 * civil-procedure framing without citing specific rules, statutes, or case
 * law. Attorneys are responsible for confirming the governing rule.
 */

import type { Faq } from "./types";

export function stateGeographicFaqs(stateName: string): Faq[] {
  return [
    {
      question: `Does KWVRS provide expert services for ${stateName} cases?`,
      answer: `Yes. KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in ${stateName}. We support plaintiff and defense counsel across personal injury, motor vehicle, workers' compensation, wrongful-death, matrimonial, and other case types. Attorneys are responsible for confirming the governing rule and timing for their specific case.`,
    },
    {
      question: `What deliverables are available for ${stateName} matters?`,
      answer: `KWVRS provides full retained-expert reports across the Vocational, Economic, and Life Care disciplines, sized to both trial-track and settlement matters. The appropriate deliverable depends on the case posture and the disclosure framework that applies to the specific matter.`,
    },
    {
      question: `How is ${stateName}'s labor market handled in earning capacity analyses?`,
      answer: `KWVRS incorporates state-level and metro-level labor market data for ${stateName}, including wage benchmarks, top industries, and regional adjustments where the case warrants. The methodology references accepted vocational and forensic economic protocols and supports both pre-trial settlement and trial-track use depending on the engagement scope.`,
    },
    {
      question: `When is expert disclosure due in ${stateName}?`,
      answer: `Disclosure timing is typically set by the case's scheduling order or case management order. Attorneys are responsible for confirming the specific deadlines for their case against primary sources. KWVRS calibrates engagement scope and turnaround to the disclosure window.`,
    },
  ];
}

export function cityGeographicFaqs(stateName: string, cityName: string): Faq[] {
  return [
    {
      question: `Does KWVRS provide expert services for ${cityName}, ${stateName} cases?`,
      answer: `Yes. KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in ${cityName}, ${stateName}. We support plaintiff and defense counsel across the full civil case mix common to ${cityName} matters.`,
    },
    {
      question: `What does a vocational expert engagement cost for a ${cityName} case?`,
      answer: `Full retained-expert engagements are billed hourly across review, evaluation, report, and testimony phases. Specific cost depends on case complexity and engagement scope.`,
    },
    {
      question: `Does KWVRS work both plaintiff and defense in ${cityName}?`,
      answer: `Yes. KWVRS provides independent, objective analysis for plaintiff and defense counsel in ${cityName}, ${stateName} matters. The methodology is the same regardless of which side commissions the work; KWVRS provides neutral analysis grounded in accepted vocational, economic, and life care planning protocols.`,
    },
  ];
}

export function serviceStateGeographicFaqs(
  serviceName: string,
  stateName: string,
): Faq[] {
  return [
    {
      question: `Does KWVRS provide ${serviceName.toLowerCase()} in ${stateName}?`,
      answer: `Yes. KWVRS provides ${serviceName.toLowerCase()} for attorneys handling matters venued in ${stateName}. We support plaintiff and defense counsel with case-specific deliverables sized to the engagement scope.`,
    },
    {
      question: `What does a ${serviceName.toLowerCase()} engagement look like for a ${stateName} case?`,
      answer: `A complete engagement typically includes review of medical and vocational records, optional interview and testing where appropriate, written expert report, deposition preparation and testimony, and trial testimony when required. Scope and turnaround are calibrated to the case posture and the governing disclosure framework.`,
    },
    {
      question: `When is expert disclosure due in ${stateName}?`,
      answer: `Disclosure timing is typically set by the scheduling order in the case. Attorneys are responsible for confirming the specific deadlines for their case against primary sources. KWVRS calibrates engagement scope and turnaround to the disclosure window.`,
    },
  ];
}

export function serviceCityGeographicFaqs(
  serviceName: string,
  stateName: string,
  cityName: string,
): Faq[] {
  return [
    {
      question: `Does KWVRS provide ${serviceName.toLowerCase()} in ${cityName}, ${stateName}?`,
      answer: `Yes. KWVRS provides ${serviceName.toLowerCase()} for attorneys handling matters venued in ${cityName}, ${stateName}. We support plaintiff and defense counsel across the full case mix common to ${cityName} matters.`,
    },
    {
      question: `How is the ${cityName} labor market handled in the analysis?`,
      answer: `KWVRS incorporates metro-level labor market data for ${cityName}, including wage benchmarks and top-industry mix, alongside ${stateName} state-level data where appropriate. Earning capacity and economic-loss analyses use accepted vocational and forensic economic protocols.`,
    },
    {
      question: `What deliverables are available for a ${cityName} case?`,
      answer: `KWVRS provides full retained-expert reports across the Vocational, Economic, and Life Care disciplines, sized to both trial-track and settlement matters. The appropriate deliverable depends on case posture.`,
    },
  ];
}
