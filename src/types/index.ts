export interface State {
  slug: string;
  name: string;
  abbreviation: string;
  fips: string;
  type: "state" | "district" | "territory";
  region: "northeast" | "southeast" | "midwest" | "west" | "territory";
  capital: string;
  largestCity: string;
  population: number;
  phoneAreaCodes: string[];
}

export interface City {
  slug: string;
  name: string;
  stateSlug: string;
  stateAbbreviation: string;
  county: string;
  population: number;
  latitude: number;
  longitude: number;
  isStateCapital: boolean;
  msaCode?: string;
  msaName?: string;
}

export interface ServiceCost {
  range: string;
  drivers: string[];
  billingStructure: string;
}

export interface ServiceProcessStep {
  step: string;
  description: string;
}

export interface ServiceTimelinePhase {
  phase: string;
  duration: string;
}

export interface Service {
  slug: string;
  name: string;
  shortName: string;
  pillar: boolean; // false = cross-sell only, excluded from geo/case/cost enumeration
  description: string;
  icon: string;
  keywords: string[];
  caseTypes: string[];
  relevantCredentials: string[];
  externalUrl?: string; // non-pillar cross-sells link out here
  cost?: ServiceCost;
  process?: ServiceProcessStep[];
  timeline?: ServiceTimelinePhase[];
}

export interface TeamEducation {
  degree: string;
  institution: string;
  year?: number;
}

export interface TeamPublication {
  title: string;
  venue: string;
  url?: string;
  year: number;
}

export interface TeamMember {
  slug: string;
  name: string;
  title: string;
  credentials: string[];
  role: string;
  bio: string;
  specialties: string[];
  statesServed: string[];
  imageUrl?: string;
  education?: TeamEducation[];
  publications?: TeamPublication[];
  priorTestimony?: string;
  cvUrl?: string;
  fullBio?: string;
  sameAs?: string[]; // External profile URLs (LinkedIn, ABVE, ResearchGate, Google Scholar, ORCID, etc.) for sameAs Person schema
  memoriam?: boolean; // Deceased colleague honored in the team page's In Memoriam section; excluded from active-expert listings
  // Retention tier shown on the intake forms' expert picker. ABSENT means the
  // member is not offered for retention (support, operations, interns, and
  // everyone honored in memoriam). See retainableExperts() in src/data/team.ts.
  expertTier?: "senior" | "fellow";
}

export interface StateLaborData {
  stateSlug: string;
  unemploymentRate: number;
  medianHouseholdIncome: number;
  medianHourlyWage: number;
  laborForce: number;
  topIndustries: { name: string; employment: number }[];
}

export interface MetroLaborData {
  citySlug: string;
  stateSlug: string;
  msaCode: string;
  unemploymentRate: number;
  medianHourlyWage: number;
  topEmployers: string[];
  topIndustries: { name: string; employment: number }[];
}

export interface StateCourtSystem {
  stateSlug: string;
  trialCourts: { name: string; description: string }[];
  appellateCourts: { name: string; description: string }[];
  supremeCourt: string;
  federalDistricts: { name: string; abbreviation: string }[];
  filingPortalUrl?: string;
}

export interface StateRegulation {
  stateSlug: string;
  vocationalRehabAgency: string;
  /** Citation-free framing of professional credentialing for vocational experts in the state. */
  licensingRequirements: string;
}

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  /** Convenience shortcut: when true, sets robots to "noindex, nofollow". */
  noindex?: boolean;
  /** Default "index,follow,...". Pass "noindex,follow" for thin/transactional pages, NotFound, etc. Overrides `noindex` if both set. */
  robots?: string;
}
