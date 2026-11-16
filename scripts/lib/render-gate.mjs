// scripts/lib/render-gate.mjs
//
// The build-time gate. Every page the prerender renders must carry exactly one
// <h1>, no "Loading..." placeholder (src/components/Loading.tsx: a geo page
// whose cities did not resolve at build time), a resolved head, no render
// errors, no NotFound body under a real route, a <title> of at most TITLE_MAX
// characters naming the brand, and at least WORD_FLOOR (40, the floor the dist tests have always asserted) visible words in
// <main>. scripts/prerender.mjs exits 1 when any page fails, so `npm run
// build` fails.
import { mainHtml, shellText, wordCount } from "./page-head.mjs";

export const LOADING_TEXT = "Loading...";
export const NOT_FOUND_TITLE = "Page Not Found | KW Economics";
export const TITLE_MAX = 60;
/** Words of visible text in <main> below which a page counts as thin. */
export const WORD_FLOOR = 40;

export function inspectRendered({ path, template, appHtml, head, errors }) {
  const main = shellText(mainHtml(appHtml));
  return {
    path,
    template,
    h1Count: (appHtml.match(/<h1[\s>]/g) ?? []).length,
    hasLoading: main.includes(LOADING_TEXT),
    words: wordCount(main),
    hasHead: Boolean(head?.title && head?.description && head?.canonical),
    title: head?.title ?? "",
    titleLength: head?.title?.length ?? 0,
    robots: head?.robots ?? "",
    errors: errors ?? [],
  };
}

export function gateViolations(i) {
  const v = [];
  if (i.errors.length) v.push(`render errors: ${i.errors.join("; ")}`);
  if (i.h1Count !== 1) v.push(`${i.h1Count} <h1> elements (need exactly one)`);
  if (i.hasLoading) v.push(`"${LOADING_TEXT}" placeholder in <main> (its data did not resolve at build time)`);
  if (!i.hasHead) v.push("no page meta collected (usePageMeta never ran with a title, description and canonical)");
  if (i.template !== "not-found") {
    if (i.title === NOT_FOUND_TITLE || /^noindex/i.test(i.robots)) {
      v.push(`rendered the NotFound page (title "${i.title}", robots "${i.robots}") under a real route`);
    }
    if (i.words < WORD_FLOOR) v.push(`${i.words} words in <main>, floor ${WORD_FLOOR}`);
  }
  if (i.titleLength > TITLE_MAX) v.push(`title is ${i.titleLength} characters, max ${TITLE_MAX}`);
  return v;
}
