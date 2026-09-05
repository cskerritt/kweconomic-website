// Type declarations for src/data/team-meta.mjs (shared by ExpertProfile.tsx + prerender).
export function bareName(name: string): string;
/** Degree post-nominals, the only credentials a byline or a shell prints; everything else is background from another discipline. */
export const DEGREE_CREDENTIAL: RegExp;
export function isDegreeCredential(credential: string): boolean;
export function profileTitle(args: {
  name: string;
  jobTitle: string;
  memoriam?: boolean;
  orgName: string;
}): string;
