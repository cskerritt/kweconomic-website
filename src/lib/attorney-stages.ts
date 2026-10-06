// The four attorney journey stages behind /attorneys/<stage>/<case-type>.
//
// Single source for everything the family's pages derive from the stage:
// slugs and labels (breadcrumbs, hub headings, case-type cross-links), the
// journey page heading and <title>/meta description builders, the per-stage
// index page heading/title/description/intro, the guide each stage links to,
// and the short case-type names the titles use. Consumers: the attorneys hub,
// the per-stage indexes, the journey pages, and the case-type cross-links.
// Slugs must match the `stage` values in src/data/journeys.ts.
//
// scripts/prerender.mjs writes the static shells for the same routes. It runs
// under plain Node and cannot import this module, so its journey block must
// mirror these strings (or this file should become a re-export of a shared
// src/data/attorney-stages.mjs that both sides load). src/data/journeys.test.ts
// pins the lengths and forms produced here so the two sides can be compared.
import { ORG_NAME } from "./brand";

export interface AttorneyStage {
  slug: string;
  label: string;
}

export const ATTORNEY_STAGES: AttorneyStage[] = [
  { slug: "considering", label: "Considering an Economist" },
  { slug: "retaining", label: "Retaining an Economist" },
  { slug: "preparing-deposition", label: "Preparing for Deposition" },
  { slug: "trial", label: "Trial Testimony" },
];

export const STAGE_SLUGS: string[] = ATTORNEY_STAGES.map((s) => s.slug);

export const STAGE_LABELS: Record<string, string> = Object.fromEntries(
  ATTORNEY_STAGES.map((s) => [s.slug, s.label]),
);

/** The case-type fields the builders read (a CaseType entry satisfies it). */
export interface CaseTypeName {
  slug: string;
  name: string;
  /**
   * Short form of the name for the journey headings ("Auto Accident: Is an
   * Economist Needed?"). Every CaseType entry carries one (src/data/caseTypes.ts,
   * shared with the service x case-type pair titles); each must fit
   * SHORT_NAME_MAX (journeys.test.ts checks).
   */
  shortName?: string;
  /**
   * Short form the journey headings and descriptions take in place of
   * `shortName` where the pair titles' short form leaves the journey's query
   * term out (the tax and transfer pricing dispute: "Transfer Pricing", not
   * "Tax Dispute"); must fit SHORT_NAME_MAX.
   */
  journeyShortName?: string;
  /**
   * What the trial description says the economist explains, in place of
   * "explaining present value", on a damages claim whose trial seldom turns
   * on a present value (intellectual property: "explaining the royalty").
   */
  journeyTrialFocus?: string;
  /**
   * Present on a matter that is not a damages claim (src/data/caseTypes.ts
   * CaseTypeFraming: the family-law and tax matters); the journey
   * descriptions then name the questions the analysis answers, not a loss,
   * and close on "Either side." rather than "Plaintiff and defense." (a
   * divorce has spouses, a tax dispute a taxpayer and a government).
   */
  framing?: object;
}

export function caseTypeShortName(caseType: CaseTypeName): string {
  return caseType.shortName ?? caseType.name;
}

/** The short form the journey headings and descriptions use: journeyShortName where set, else the shared short name. */
export function journeyShortName(caseType: CaseTypeName): string {
  return caseType.journeyShortName ?? caseTypeShortName(caseType);
}

/** Brand suffix every page <title> on the site carries. */
export const TITLE_SUFFIX = ` | ${ORG_NAME}`;
/**
 * Longest <title> (suffix included) a journey or stage-index page may carry:
 * the same 60-character ceiling the site's editorial, hub, case-type, and
 * credential titles pin (src/data/editorial.test.ts, src/pages/hubs.render.test.tsx).
 */
export const TITLE_MAX = 60;
/** Meta description length band for the family. */
export const DESCRIPTION_MIN = 140;
export const DESCRIPTION_MAX = 160;

// Journey page heading (the H1, the <title> before the brand suffix, and the
// Article headline). The case type leads so a truncated search snippet keeps
// the query term, and each stage phrase names the economist. The phrases are
// kept short enough that the longest case-type name (SHORT_NAME_MAX) plus the
// brand suffix still fits TITLE_MAX.
const JOURNEY_HEADINGS: Record<string, (name: string) => string> = {
  considering: (name) => `${name}: Is an Economist Needed?`,
  retaining: (name) => `${name}: Retaining an Economist`,
  "preparing-deposition": (name) => `${name}: Economist at Deposition`,
  trial: (name) => `${name}: Economist at Trial`,
};

/** Longest stage phrase (the ": ..." after the case-type name) in JOURNEY_HEADINGS. */
const STAGE_PHRASE_MAX = Math.max(...Object.values(JOURNEY_HEADINGS).map((build) => build("").length));

/**
 * Longest case-type name a journey heading can carry and still fit TITLE_MAX
 * with the brand suffix. Every CaseType shortName (and every full name that
 * stands in for a missing one) must fit it.
 */
export const SHORT_NAME_MAX = TITLE_MAX - TITLE_SUFFIX.length - STAGE_PHRASE_MAX;

// Journey page meta descriptions, before the audience tag journeyDescription
// appends. The case-type name is lowercased mid-sentence (an acronym such as
// "IP" keeps its capitals) and phrased without an indefinite article, so no
// a/an choice is needed. The trial phrase takes the case type's
// journeyTrialFocus where it sets one.
const JOURNEY_DESCRIPTIONS: Record<string, (name: string, trialFocus?: string) => string> = {
  considering: (name) =>
    `When ${name} claims need a forensic economist: the loss threshold, records to request, and what to ask before retaining.`,
  retaining: (name) =>
    `Retaining a forensic economist in ${name} matters: scope, conflict check, the records request, and the report deadline.`,
  "preparing-deposition": (name) =>
    `The economist at deposition in ${name} cases: the assumptions that get tested, the reliance file, and the common attacks.`,
  trial: (name, trialFocus = "explaining present value") =>
    `The economist at trial in ${name} cases: demonstratives, ${trialFocus}, and rebutting the opposing economist.`,
};

// The stages whose shared description names a loss or present value take a
// form of their own on a matter that is not a damages claim; the retaining
// and deposition descriptions already fit every matter.
const JOURNEY_DESCRIPTIONS_FRAMED: Record<string, (name: string, trialFocus?: string) => string> = {
  considering: (name) =>
    `When ${name} matters need a forensic economist: the threshold questions, the records to request, and what to ask before retaining.`,
  trial: (name) =>
    `The economist at trial in ${name} cases: demonstratives, explaining the analysis, and rebutting the opposing economist.`,
};

/** A case-type name lowercased for mid-sentence use, an all-capitals acronym ("IP") kept as written. */
const lowerName = (name: string): string =>
  name
    .split(" ")
    .map((word) => (/^[A-Z]{2,}$/.test(word) ? word : word.toLowerCase()))
    .join(" ");

/** The audience tag every journey description closes on (see CaseTypeName.framing). */
const journeySides = (caseType: CaseTypeName): string => (caseType.framing ? " Either side." : " Plaintiff and defense.");

/** H1 of /attorneys/<stage>/<case-type>; "" for an unknown stage. */
export function journeyHeading(stage: string, caseType: CaseTypeName): string {
  const build = JOURNEY_HEADINGS[stage];
  return build ? build(journeyShortName(caseType)) : "";
}

/** Full <title> of /attorneys/<stage>/<case-type>; "" for an unknown stage. */
export function journeyTitle(stage: string, caseType: CaseTypeName): string {
  const heading = journeyHeading(stage, caseType);
  return heading ? `${heading}${TITLE_SUFFIX}` : "";
}

/**
 * Meta description of /attorneys/<stage>/<case-type>. Uses the full case-type
 * name unless that runs past DESCRIPTION_MAX, then the journey's short name,
 * and closes on the audience tag.
 */
export function journeyDescription(stage: string, caseType: CaseTypeName): string {
  const build = (caseType.framing && JOURNEY_DESCRIPTIONS_FRAMED[stage]) || JOURNEY_DESCRIPTIONS[stage];
  if (!build) return "";
  const sides = journeySides(caseType);
  const full = `${build(lowerName(caseType.name), caseType.journeyTrialFocus)}${sides}`;
  return full.length <= DESCRIPTION_MAX ? full : `${build(lowerName(journeyShortName(caseType)), caseType.journeyTrialFocus)}${sides}`;
}

// Per-stage index pages (/attorneys/<stage>).
// Headings fit TITLE_MAX with the brand suffix; "forensic economist" stays in
// the description and intro below.
const STAGE_INDEX_HEADINGS: Record<string, string> = {
  considering: "When an Economist Is Needed, by Case Type",
  retaining: "How to Retain an Economist, by Case Type",
  "preparing-deposition": "The Economist at Deposition, by Case Type",
  trial: "The Economist at Trial, by Case Type",
};

const STAGE_INDEX_DESCRIPTIONS: Record<string, string> = {
  considering:
    "Whether the loss justifies a forensic economist, by case type: threshold questions, first records, and what to ask before retaining. Plaintiff and defense.",
  retaining:
    "Engaging a forensic economist, by case type: scope, the conflict check, the records request, and how the report fits with other experts. Plaintiff and defense.",
  "preparing-deposition":
    "Preparing the economist for deposition, by case type: the assumptions that get tested, the reliance file, and the common attacks. Plaintiff and defense.",
  trial:
    "Presenting economic damages at trial, by case type: demonstratives, the present value explanation, and rebutting the opposing economist. Plaintiff and defense.",
};

/** Lead paragraph of each stage index (rendered by the page and its shell). */
export const STAGE_INDEX_INTROS: Record<string, string> = {
  considering:
    "Deciding whether the loss justifies a forensic economist. Pick your case type for the threshold questions, the records to gather first, and the questions to ask before retaining.",
  retaining:
    "Engaging the economist: scope, conflict check, the records request, and how the report fits with the opinions other experts supply. Pick your case type for a step-by-step retention checklist.",
  "preparing-deposition":
    "Getting the economist and the report ready for deposition. Pick your case type for the assumptions that will be tested, the documents to assemble, and the common attacks.",
  trial:
    "Presenting economic damages at trial. Pick your case type for demonstratives, the present value explanation for the fact finder, and rebuttal of the opposing economist.",
};

export function stageIndexHeading(stage: string): string {
  return STAGE_INDEX_HEADINGS[stage] ?? "";
}

export function stageIndexTitle(stage: string): string {
  const heading = stageIndexHeading(stage);
  return heading ? `${heading}${TITLE_SUFFIX}` : "";
}

export function stageIndexDescription(stage: string): string {
  return STAGE_INDEX_DESCRIPTIONS[stage] ?? "";
}

export function stageIndexIntro(stage: string): string {
  return STAGE_INDEX_INTROS[stage] ?? "";
}

/**
 * The /guides article each stage points readers to. Slugs must exist in
 * src/data/guides.ts (journeys.test.ts checks); anchor text comes from the
 * guide's own title, never from here.
 */
export const STAGE_GUIDES: Record<string, string> = {
  considering: "when-do-you-need-an-economic-expert",
  retaining: "expert-witness-disclosure-rules",
  "preparing-deposition": "how-to-rebut-an-economic-damages-report",
  trial: "present-value-explained-for-attorneys",
};
