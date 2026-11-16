// scripts/lib/page-head.mjs
//
// Composes one prerendered page: the vite template, the head the React page
// resolved (src/lib/page-head.ts through src/entry-server.tsx), the
// server-rendered app markup and, on the geo tiers, the state's cities as an
// inline JSON script (src/lib/preloaded-cities.ts reads it on hydration).
// Plain string work; scripts/prerender.mjs is the only writer. The reading
// helpers at the bottom serve the render gate and the dist/ tests.

export function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const ROOT_PLACEHOLDER = '<div id="root"></div>';

const DESCRIPTION_TAG = /\s*<meta\s+name="description"[\s\S]*?\/>/i;
const ROBOTS_TAG = /<meta name="robots" content="[^"]*" \/>/;
const TITLE_TAG = /<title>[^<]*<\/title>/;

/** The template's per-route Open Graph / Twitter tags: [attribute, name]. */
const OG_TAGS = {
  type: ["property", "og:type"],
  image: ["property", "og:image"],
  width: ["property", "og:image:width"],
  height: ["property", "og:image:height"],
  alt: ["property", "og:image:alt"],
  twitterImage: ["name", "twitter:image"],
};
const tagRe = ([attr, name]) => new RegExp(`\\s*<meta ${attr}="${name}" content="[^"]*" />`);

/** The template must be the pristine vite output, never a page the prerender already wrote. */
export function assertTemplate(template) {
  if (!template.includes(ROOT_PLACEHOLDER)) {
    throw new Error('prerender: the template has no empty <div id="root"></div> - use the pristine vite output (the cached copy of the vite index.html), not a page the prerender already wrote');
  }
  for (const [name, re] of [["<title>", TITLE_TAG], ["robots meta", ROBOTS_TAG], ...Object.entries(OG_TAGS).map(([k, t]) => [t[1], tagRe(t)])]) {
    if (!re.test(template)) throw new Error(`prerender: the template has no ${name}`);
  }
}

/** Replace the content attribute of a template meta tag, or drop the tag when `content` is undefined. */
function setTemplateMeta(html, tag, content) {
  const re = tagRe(tag);
  if (content === undefined || content === "") return html.replace(re, "");
  return html.replace(re, (m) => m.replace(/content="[^"]*"/, () => `content="${escapeHtml(String(content))}"`));
}

function headTags(head) {
  const t = escapeHtml(head.title);
  const d = escapeHtml(head.description);
  const c = escapeHtml(head.canonical);
  // A noindex page (the rendered 404) advertises no canonical link; it keeps og:url.
  const indexable = !/^noindex/i.test(head.robots);
  return [
    `<meta name="description" content="${d}" />`,
    ...(indexable ? [`<link rel="canonical" href="${c}" />`] : []),
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:url" content="${c}" />`,
    ...(head.articlePublished ? [`<meta property="article:published_time" content="${escapeHtml(head.articlePublished)}" />`] : []),
    ...(head.articleModified ? [`<meta property="article:modified_time" content="${escapeHtml(head.articleModified)}" />`] : []),
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
  ].join("\n    ");
}

/**
 * @param {object} args
 * @param {string} args.template   the pristine vite index.html
 * @param {string} args.path       the route ("/", "/locations/new-jersey/hackensack")
 * @param {object} args.head       ResolvedHead from src/lib/page-head.ts
 * @param {string} args.appHtml    the server-rendered markup of <App>
 * @param {string} [args.stateSlug] with `cities`: the state whose cities the render used
 * @param {object[]} [args.cities]
 */
export function composePage({ template, path, head, appHtml, stateSlug, cities }) {
  assertTemplate(template);
  const inlineCities =
    stateSlug && cities?.length
      ? `<script type="application/json" id="${escapeHtml(`kw-cities-${stateSlug}`)}">${JSON.stringify(cities).replace(/</g, "\\u003c")}</script>\n    `
      : "";
  const root = `<div id="root" data-prerender-path="${escapeHtml(path)}">${appHtml}</div>`;
  let html = template.replace(DESCRIPTION_TAG, "");
  html = setTemplateMeta(html, OG_TAGS.type, head.ogType);
  html = setTemplateMeta(html, OG_TAGS.image, head.ogImage);
  html = setTemplateMeta(html, OG_TAGS.width, head.ogImageWidth);
  html = setTemplateMeta(html, OG_TAGS.height, head.ogImageHeight);
  html = setTemplateMeta(html, OG_TAGS.alt, head.ogImageAlt);
  html = setTemplateMeta(html, OG_TAGS.twitterImage, head.ogImage);
  // Function replacers throughout: the app markup and the JSON can hold "$&",
  // "$'" or "$1", which String.replace would otherwise expand.
  return html
    .replace(ROBOTS_TAG, () => `<meta name="robots" content="${escapeHtml(head.robots)}" />`)
    .replace(TITLE_TAG, () => `<title>${escapeHtml(head.title)}</title>\n    ${headTags(head)}`)
    .replace(ROOT_PLACEHOLDER, () => `${inlineCities}${root}`);
}

// ---------------------------------------------------------------------------
// Reading side (gate, tests): the visible text of a prerendered page.
// ---------------------------------------------------------------------------

export const decodeEntities = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&middot;/g, "·")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

/** The body's visible text: scripts, styles and tags removed, entities decoded, whitespace collapsed. */
export function shellText(html) {
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] ?? html;
  return decodeEntities(
    body
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/** The inner markup of <main> (the page's own content, without the header and footer chrome); the whole markup when there is no <main>. */
export function mainHtml(html) {
  return html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? html;
}
