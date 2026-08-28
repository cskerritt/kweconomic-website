// Type surface for src/lib/service-prose.mjs (shared with src/data/geo-prose.mjs
// and, through it, scripts/prerender.mjs).

/** Attributive prose form of Service.shortName: lowercase, ampersand spelled out ("fraud and tracing"). */
export function proseName(shortName: string): string;
/** The work a pillar performs ("wrongful death analysis"; names ending in a work noun are kept as-is). */
export function workPhrase(shortName: string): string;
/** "a"/"an" by first letter, prefixed to the phrase. */
export function withArticle(phrase: string): string;
/** Sentence-initial form ("Wrongful death analysis ..."). */
export function capFirst(text: string): string;
