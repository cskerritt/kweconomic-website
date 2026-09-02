// Profile <title> shared by the React page (src/pages/templates/ExpertProfile.tsx)
// and the static shell (scripts/prerender.mjs) so /team/:slug advertises one
// title on both sides. Plain ESM (like home-faqs.mjs) because prerender.mjs
// runs under node, not vite.
//
// The title carries the person's role, never a credential: post-nominals
// belong in the H1 and the credential chips, and the shell text is scanned for
// sister-practice credential abbreviations (scripts/prerender-meta.test.mjs).

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
 * for a colleague honored in memoriam.
 * @param {{ name: string; jobTitle: string; memoriam?: boolean; orgName: string }} args
 * @returns {string}
 */
export function profileTitle({ name, jobTitle, memoriam, orgName }) {
  const person = bareName(name);
  // A compound role ("Economics Associate / Expert Liaison") keeps its first
  // half in the title so the tag stays inside the ~60-character SERP window.
  const role = jobTitle.split(" / ")[0].trim();
  return memoriam ? `${person} | In Memoriam | ${orgName}` : `${person}, ${role} | ${orgName}`;
}
