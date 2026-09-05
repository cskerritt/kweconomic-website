// Type surface for src/lib/page-titles.mjs (shared with scripts/prerender.mjs).
// Structural inputs: a State, City, CaseType, or Service entry satisfies them.

/** Longest <title> any page on the site may carry, brand suffix included (60). */
export const TITLE_MAX: number;

export interface TitleState {
  name: string;
  abbreviation: string;
}
export interface TitleCity {
  name: string;
}
export interface TitleCaseType {
  name: string;
  /** The hub's own stem ("<name> Economist"), the first form the state tier tries. */
  titleBase: string;
  /** Short form of the name for the pair titles and the state tier's second stem; defaults to name. */
  shortName?: string;
  /** A matter that is not a damages claim supplies its own hub stem and state-tier stems (src/data/caseTypes.ts CaseTypeFraming). */
  framing?: { titleStem?: string; stateTitleStems?: readonly string[] };
}
export interface TitleService {
  name: string;
  shortName: string;
  titleName?: string;
  titleShortName?: string;
}

/** The first candidate body whose branded title fits TITLE_MAX; the last candidate when none does. */
export function fitTitle(orgName: string, ...bodies: string[]): string;
/**
 * "<label> in <place>". Several labels (longest first) are each tried beside
 * the full place name before any takes the state abbreviation.
 */
export function placeTitle(label: string | readonly string[], state: TitleState, orgName: string): string;
/**
 * "<label> in <city>, <ST>". Several labels (longest first) are each tried
 * beside the city and its state abbreviation before any drops the abbreviation.
 */
export function cityTitle(label: string | readonly string[], city: TitleCity, state: TitleState, orgName: string): string;
/** The heading label (any ampersand spelled out), then titleShortName where the data sets one. */
export function serviceTitleLabels(service: TitleService): string[];
/** The full name, then titleName where the data sets one. */
export function serviceTitleNames(service: TitleService): string[];
/** titleBase, then "<shortName> Economist" where it differs; a framing block's stateTitleStems instead where the entry carries one. */
export function caseTypeTitleStems(caseType: TitleCaseType): string[];
/** /case-types/<case>: titleBase (or the framing block's titleStem) plus the brand. */
export function caseTypeHubTitle(caseType: TitleCaseType, orgName: string): string;

export function stateHubTitle(state: TitleState, orgName: string): string;
export function cityHubTitle(city: TitleCity, state: TitleState, orgName: string): string;
export function caseTypeStateTitle(caseType: TitleCaseType, state: TitleState, orgName: string): string;
export function serviceStateTitle(service: TitleService, state: TitleState, orgName: string): string;
export function serviceCityTitle(service: TitleService, city: TitleCity, state: TitleState, orgName: string): string;
export function pillarTitle(service: TitleService, orgName: string): string;
export function variantTitle(service: TitleService, variantLabel: string, orgName: string): string;
export function pairTitle(service: TitleService, caseType: TitleCaseType, orgName: string): string;
