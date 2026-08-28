// Service.shortName is a heading label ("Fraud & Tracing", "Employment
// Damages"), not a prose phrase. Every template that drops it into a sentence
// (the pillar FAQ, the geo-page credential sidebars, the transactional meta
// descriptions) goes through these helpers; headings, titles, link labels,
// and the CTA keep the short name as written.

/**
 * Attributive prose form: lowercase with any ampersand spelled out
 * ("fraud and tracing engagements", "a full wrongful death report").
 */
export function proseName(shortName: string): string {
  return shortName.toLowerCase().replace(/\s*&\s*/g, " and ");
}

/**
 * Noun phrase for the work a pillar performs ("wrongful death analysis").
 * Most short names are loss subjects rather than work, so they take
 * " analysis"; the ones that already end in a work noun (Divorce Financial
 * Analysis, Business Valuation, Life Care Plan Costing) are used as-is so a
 * template never prints "analysis analysis".
 */
export function workPhrase(shortName: string): string {
  const name = proseName(shortName);
  return /(analysis|valuation|costing)$/.test(name) ? name : `${name} analysis`;
}

/**
 * Prefix the indefinite article: "a lost earnings", "an employment damages".
 * Mirrors the private indefiniteArticle() in src/data/geo-prose.mjs.
 */
export function withArticle(phrase: string): string {
  return `${/^[aeiou]/i.test(phrase) ? "an" : "a"} ${phrase}`;
}
