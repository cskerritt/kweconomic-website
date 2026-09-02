// Type declarations for src/data/team-meta.mjs (shared by ExpertProfile.tsx + prerender).
export function bareName(name: string): string;
export function profileTitle(args: {
  name: string;
  jobTitle: string;
  memoriam?: boolean;
  orgName: string;
}): string;
