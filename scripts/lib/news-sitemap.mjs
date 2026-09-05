// Google News sitemap policy, shared by scripts/generate-sitemap.mjs (which
// decides whether the sitemap index lists news-sitemap.xml) and
// scripts/generate-extra-sitemaps.mjs (which writes or removes the file and
// keeps the index and robots.txt in step with what is on disk).
//
// Google's news sitemap guidance: list only articles published in the last
// two days and remove older ones; Search Console flags older entries. Posts
// that fall out of the window stay in sitemap-core.xml with their real
// lastmod, so nothing is lost from the ordinary sitemap.
//
// publishedDate is a calendar date ("YYYY-MM-DD"), read as midnight UTC. A
// post qualifies while fewer than NEWS_WINDOW_DAYS x 24 hours have passed
// since that midnight: a post dated today or yesterday (UTC) is news, a post
// dated two calendar days ago is not, and a future or malformed date never
// qualifies. Reading the date at midnight keeps the window conservative,
// since the true publication time within the day is not recorded.

export const NEWS_SITEMAP_FILE = "news-sitemap.xml";
export const NEWS_WINDOW_DAYS = 2;
const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Whether a "YYYY-MM-DD" publication date is inside the news window at `now`. */
export function isRecentNews(publishedDate, now = new Date()) {
  const m = ISO_DATE.exec(String(publishedDate ?? ""));
  if (!m) return false;
  const published = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const age = now.getTime() - published;
  return age >= 0 && age < NEWS_WINDOW_DAYS * DAY_MS;
}

/** The posts a news sitemap built at `now` may list, in the order given. */
export function recentNewsPosts(posts, now = new Date()) {
  return posts.filter((p) => isRecentNews(p.publishedDate, now));
}

function xmlEscape(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** The news sitemap XML for `posts` ({ slug, title, publishedDate }[]). */
export function renderNewsSitemap(posts, { base, publicationName }) {
  const entries = posts
    .map(
      (post) => `  <url>
    <loc>${base}/insights/${post.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${xmlEscape(publicationName)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${post.publishedDate}</news:publication_date>
      <news:title>${xmlEscape(post.title)}</news:title>
    </news:news>
  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries}
</urlset>
`;
}

/**
 * The sitemap index with the news child listed exactly when `includeNews`:
 * any existing entry is dropped, and one is appended as the last child when
 * the news sitemap is written. Idempotent.
 */
export function syncIndexNewsSitemap(indexXml, includeNews, base) {
  const entry = `  <sitemap><loc>${base}/${NEWS_SITEMAP_FILE}</loc></sitemap>`;
  const stripped = indexXml
    .split("\n")
    .filter((line) => line.trim() !== entry.trim())
    .join("\n");
  if (!includeNews) return stripped;
  return stripped.replace(/\n<\/sitemapindex>/, `\n${entry}\n</sitemapindex>`);
}

/**
 * robots.txt with the news sitemap declared exactly when `includeNews`: the
 * `Sitemap:` line for it is removed otherwise, and added after the last
 * `Sitemap:` line (or at the end) when the news sitemap is written. Idempotent.
 */
export function syncRobotsNewsSitemap(robotsTxt, includeNews, base) {
  const line = `Sitemap: ${base}/${NEWS_SITEMAP_FILE}`;
  const lines = robotsTxt.split("\n").filter((l) => l.trim() !== line);
  if (includeNews) {
    let last = -1;
    lines.forEach((l, i) => {
      if (l.startsWith("Sitemap: ")) last = i;
    });
    const trailingBlank = lines.length && lines[lines.length - 1] === "" ? lines.length - 1 : lines.length;
    lines.splice(last === -1 ? trailingBlank : last + 1, 0, line);
  }
  return lines.join("\n");
}
