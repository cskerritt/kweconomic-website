// Profile <title> shared by the React page (src/pages/templates/ExpertProfile.tsx)
// and the static shell (scripts/prerender.mjs) so /team/:slug advertises one
// title on both sides. Plain ESM (like home-faqs.mjs) because prerender.mjs
// runs under node, not vite.
//
// The title carries the person's role, never a credential: post-nominals
// belong in the H1 and the credential chips, and the shell text is scanned for
// sister-practice credential abbreviations (scripts/prerender-meta.test.mjs).

import { TITLE_MAX } from "../lib/page-titles.mjs";

/**
 * Display name without post-nominals: "Jane Roe, Ph.D., MBA" -> "Jane Roe".
 * @param {string} name
 * @returns {string}
 */
export function bareName(name) {
  return name.split(",")[0].trim();
}

/**
 * "<Name>, <Role> | <Org>" for an active member; "<Name> | In Memoriam | <Org>"
 * for a colleague honored in memoriam; "<Name> | <Org>" where the name and
 * the role together would overrun the 60-character SERP window (TITLE_MAX).
 * @param {{ name: string; jobTitle: string; memoriam?: boolean; orgName: string }} args
 * @returns {string}
 */
export function profileTitle({ name, jobTitle, memoriam, orgName }) {
  const person = bareName(name);
  if (memoriam) return `${person} | In Memoriam | ${orgName}`;
  // A compound role ("Economics Associate / Expert Liaison") keeps its first
  // half in the title; a role that still cannot fit beside the name and the
  // brand is dropped rather than paraphrased, so a job title never changes.
  const role = jobTitle.split(" / ")[0].trim();
  const withRole = `${person}, ${role} | ${orgName}`;
  return withRole.length <= TITLE_MAX ? withRole : `${person} | ${orgName}`;
}
