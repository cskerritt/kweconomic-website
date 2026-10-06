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
 * Short names whose lowercase form would not read as prose: an acronym
 * ("IP Damages" lowercases to "ip damages") is spelled out instead. Keyed by
 * Service.shortName exactly as written in services.ts.
 */
const PROSE_NAME_OVERRIDES = {
  "IP Damages": "intellectual property damages",
};

/**
 * Attributive prose form: lowercase with any ampersand spelled out
 * ("fraud and tracing engagements", "a full wrongful death report"), or the
 * spelled-out form of a short name in PROSE_NAME_OVERRIDES.
 * @param {string} shortName
 * @returns {string}
 */
export function proseName(shortName) {
  return PROSE_NAME_OVERRIDES[shortName] ?? shortName.toLowerCase().replace(/\s*&\s*/g, " and ");
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

/** The meta description band: long enough to carry the page, short enough for the SERP window. */
const DESCRIPTION_MIN = 140;
const DESCRIPTION_MAX = 160;

/**
 * Meta description of a service x case type x state page
 * (src/pages/templates/ServiceCaseTypeState.tsx and the shell block in
 * scripts/prerender.mjs): the work the pillar performs, the matter, the
 * place, and what the page covers. A matter that is not a damages claim (a
 * case type carrying a `framing` block: the family-law and tax matters) names
 * the financial questions instead of a loss claim and closes on "Either
 * side." rather than "Plaintiff and defense."; a damages claim heard first in
 * the federal courts (a `venueFraming` block: intellectual property) names
 * the federal and state courts rather than a state damages framework. The
 * candidates run from the fullest form down, the audience tag riding along
 * where it fits, and the first inside the 140-160 band wins; the first
 * inside the window stands in only where none lands in the band.
 * @param {{ shortName: string }} service
 * @param {{ name: string; framing?: object; venueFraming?: object }} caseType
 * @param {string} place the place name as geo-prose.mjs placeName() spells it
 * @returns {string}
 */
export function serviceCaseStateDescription(service, caseType, place) {
  const stem = `${capFirst(workPhrase(service.shortName))} for ${caseType.name.toLowerCase()} cases in ${place}`;
  const sides = caseType.framing ? " Either side." : " Plaintiff and defense.";
  const tails = caseType.framing
    ? [
        "the financial questions, the records that answer them, and the state framework.",
        "the financial questions, the records behind them, and the state framework.",
        "the financial questions, their records, and the state framework.",
        "financial questions, records, and state framework.",
      ]
    : caseType.venueFraming
      ? [
          "the damages claim, the records that drive it, and the federal and state courts.",
          "the damages claim, the records behind it, and the federal and state courts.",
          "the damages claim, its records, and the federal and state courts.",
          "the damages claim, its records, and the courts.",
          "damages claim, records, and courts.",
        ]
      : [
          "the loss claim, the records that drive it, and the state damages framework.",
          "the loss claim, the records behind it, and the state framework.",
          "the loss claim, its records, and the state framework.",
          "loss claim, records, and state framework.",
        ];
  const candidates = tails.flatMap((tail) => [`${stem}: ${tail}${sides}`, `${stem}: ${tail}`]);
  return (
    candidates.find((c) => c.length >= DESCRIPTION_MIN && c.length <= DESCRIPTION_MAX) ??
    candidates.find((c) => c.length <= DESCRIPTION_MAX) ??
    candidates[candidates.length - 1]
  );
}
