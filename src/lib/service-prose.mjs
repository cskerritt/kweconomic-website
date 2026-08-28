// Service.shortName is a heading label ("Fraud & Tracing", "Employment
// Damages"), not a prose phrase. Every template that drops it into a sentence
// (the pillar FAQ, the geo hero sentences and geo FAQs, the credential
// sidebars, the transactional and service x case-type meta descriptions) goes
// through these helpers; headings, titles, link labels, and the CTA keep the
// short name as written.
//
// Plain ESM (with service-prose.d.mts for the type surface) so that
// src/data/geo-prose.mjs, which scripts/prerender.mjs imports without a TS
// loader, renders the same phrases the React pages do.

/**
 * Attributive prose form: lowercase with any ampersand spelled out
 * ("fraud and tracing engagements", "a full wrongful death report").
 * @param {string} shortName
 * @returns {string}
 */
export function proseName(shortName) {
  return shortName.toLowerCase().replace(/\s*&\s*/g, " and ");
}

/**
 * Short names whose bare form plus " analysis" would misname the work:
 * "personal injury analysis" reads as an analysis of the injury rather than
 * of the economic damages, so that pillar's work is spelled out in full.
 * Keyed by Service.shortName exactly as written in services.ts.
 */
const WORK_PHRASE_OVERRIDES = {
  "Personal Injury": "personal injury economic damages analysis",
};

/**
 * Noun phrase for the work a pillar performs ("wrongful death analysis").
 * Most short names are loss subjects rather than work, so they take
 * " analysis"; the ones that already end in a work noun (Divorce Financial
 * Analysis, Business Valuation, Life Care Plan Costing) are used as-is so a
 * template never prints "analysis analysis"; the ones in
 * WORK_PHRASE_OVERRIDES are spelled out.
 * @param {string} shortName
 * @returns {string}
 */
export function workPhrase(shortName) {
  const override = WORK_PHRASE_OVERRIDES[shortName];
  if (override) return override;
  const name = proseName(shortName);
  return /(analysis|valuation|costing)$/.test(name) ? name : `${name} analysis`;
}

/**
 * Prefix the indefinite article: "a lost earnings", "an employment damages".
 * Mirrors the private indefiniteArticle() in src/data/geo-prose.mjs.
 * @param {string} phrase
 * @returns {string}
 */
export function withArticle(phrase) {
  return `${/^[aeiou]/i.test(phrase) ? "an" : "a"} ${phrase}`;
}

/**
 * Sentence-initial form of a prose phrase ("Wrongful death analysis ...").
 * @param {string} text
 * @returns {string}
 */
export function capFirst(text) {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}
