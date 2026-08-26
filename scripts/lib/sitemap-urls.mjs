// Shared sitemap URL collection.
//
// public/sitemap.xml is a sitemap INDEX (generate-sitemap.mjs): its <loc>
// entries point at child sitemaps, not pages. Consumers that want page URLs
// (indexnow-submit.mjs, the sitemap tests) must recurse into the children,
// which are generated as sibling files in the same directory. This helper
// handles both shapes so a plain <urlset> keeps working too.

import fs from "node:fs";
import path from "node:path";

/** All <loc> values in a sitemap XML string (excludes <image:loc> etc.). */
export function extractLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

/**
 * Page URLs advertised by the sitemap file at `sitemapPath`.
 *
 * - <urlset>: its <loc> entries directly.
 * - <sitemapindex>: the union of <loc> entries across every referenced child,
 *   each resolved as a local sibling file (throws if one is missing - the
 *   generator writes them all next to the index). Deduplicated: the image
 *   sitemap re-lists page URLs that the core child already carries.
 */
export function collectSitemapPageUrls(sitemapPath) {
  const xml = fs.readFileSync(sitemapPath, "utf8");
  if (!/<sitemapindex[\s>]/.test(xml)) return extractLocs(xml);
  const dir = path.dirname(sitemapPath);
  const urls = new Set();
  for (const childLoc of extractLocs(xml)) {
    const childFile = path.join(dir, path.basename(new URL(childLoc).pathname));
    if (!fs.existsSync(childFile)) {
      throw new Error(
        `sitemap index ${sitemapPath} references ${childLoc} but ${childFile} does not exist`,
      );
    }
    for (const u of extractLocs(fs.readFileSync(childFile, "utf8"))) {
      urls.add(u);
    }
  }
  return [...urls];
}
