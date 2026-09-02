/**
 * KW Economics image + news sitemap generator
 *
 * Emits two supplementary sitemaps from source-of-truth data, so they cannot
 * drift from the live site:
 *
 *   public/image-sitemap.xml  - <image:image> entries for pages with meaningful
 *                               imagery (team headshots from team.ts, plus the
 *                               curated office photos used on core pages).
 *   public/news-sitemap.xml   - <news:news> entries for /insights/* posts.
 *
 * Note on the news sitemap: the Google News sitemap convention expects articles
 * published within the last 2 days, and Search Console may warn on older items.
 * The insights posts are evergreen, so this sitemap primarily helps general
 * and AI crawlers discover /insights/* URLs with typed publication metadata; it is
 * not intended to drive Google News inclusion. It is regenerated every build, so
 * if dated/timely posts are added they are advertised automatically.
 *
 * Runs before `vite build` so the generated files are copied from public/ to dist/.
 * Loading strategy matches scripts/generate-llms.mjs (bare Vite server + ssrLoadModule).
 *
 * Run: node scripts/generate-extra-sitemaps.mjs
 */

import { createServer } from "vite";
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { SITE_URL as BASE, ORG_NAME } from "./lib/site.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");
const PUBLICATION_NAME = `${ORG_NAME} Insights`;

// Office/stock photos and the core pages they appear on (ground truth from the
// page components; an image sitemap should only list images present on the
// page). The home page renders no photograph (its hero is a gradient; the
// hero-office-meeting file is only the site's og:image default), so it has no
// entry. scripts/sitemap-index.test.mjs pins each src here to its page source.
const PAGE_IMAGES = [
  { path: "/about", images: [{ src: "/images/mentor-trainee.jpg", title: `${ORG_NAME} forensic economics consultation` }] },
  { path: "/contact", images: [{ src: "/images/legal-contract.jpg", title: `Retain ${ORG_NAME} for economic damages analysis` }] },
  { path: "/services", images: [{ src: "/images/legal-team-discussion.jpg", title: `${ORG_NAME} forensic economics and damages services` }] },
  { path: "/schedule-consultation", images: [{ src: "/images/mentor-trainee.jpg", title: `Schedule a ${ORG_NAME} consultation` }] },
];

function xmlEscape(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function abs(path) {
  return `${BASE}${path === "/" ? "" : path}`;
}

async function main() {
  const server = await createServer({
    root: ROOT,
    configFile: false,
    logLevel: "error",
    resolve: { alias: { "@": join(ROOT, "src") } },
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
  });

  const [{ team }, { insightPosts }] = await Promise.all([
    server.ssrLoadModule("/src/data/team.ts"),
    server.ssrLoadModule("/src/data/insights.ts"),
  ]);

  await server.close();

  // ----------------------------------------------------------------------
  // image-sitemap.xml
  // ----------------------------------------------------------------------
  const imageUrls = [];

  // Core pages with curated office photography.
  for (const page of PAGE_IMAGES) {
    imageUrls.push({ loc: abs(page.path), images: page.images });
  }

  // /team hub: every member headshot on one page.
  const withPhotos = team.filter((m) => m.imageUrl);
  imageUrls.push({
    loc: abs("/team"),
    images: withPhotos.map((m) => ({ src: m.imageUrl, title: m.name })),
  });

  // Each /team/:slug profile page: that member's headshot.
  for (const m of withPhotos) {
    imageUrls.push({
      loc: abs(`/team/${m.slug}`),
      images: [{ src: m.imageUrl, title: m.name }],
    });
  }

  const imageEntries = imageUrls
    .map((u) => {
      const imgs = u.images
        .map(
          (img) =>
            `    <image:image><image:loc>${abs(img.src)}</image:loc><image:title>${xmlEscape(img.title)}</image:title></image:image>`
        )
        .join("\n");
      return `  <url>\n    <loc>${u.loc}</loc>\n${imgs}\n  </url>`;
    })
    .join("\n");

  const imageSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageEntries}
</urlset>
`;

  // ----------------------------------------------------------------------
  // news-sitemap.xml
  // ----------------------------------------------------------------------
  const newsEntries = insightPosts
    .map((post) => {
      return `  <url>
    <loc>${abs(`/insights/${post.slug}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>${xmlEscape(PUBLICATION_NAME)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${post.publishedDate}</news:publication_date>
      <news:title>${xmlEscape(post.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join("\n");

  const newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsEntries}
</urlset>
`;

  writeFileSync(join(PUBLIC, "image-sitemap.xml"), imageSitemap);
  writeFileSync(join(PUBLIC, "news-sitemap.xml"), newsSitemap);

  const imageCount = imageUrls.reduce((n, u) => n + u.images.length, 0);
  console.log(
    `Generated image-sitemap.xml (${imageUrls.length} URLs, ${imageCount} images) and news-sitemap.xml (${insightPosts.length} posts)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
