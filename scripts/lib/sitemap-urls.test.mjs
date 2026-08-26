import { describe, expect, it } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { collectSitemapPageUrls, extractLocs } from "./sitemap-urls.mjs";

const URLSET = (locs) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs.map((l) => `  <url><loc>${l}</loc><changefreq>monthly</changefreq></url>`).join("\n")}
</urlset>
`;

function tempDir() {
  return mkdtempSync(join(tmpdir(), "sitemap-urls-"));
}

describe("extractLocs", () => {
  it("extracts <loc> values and ignores namespaced <image:loc>", () => {
    const xml = `<urlset><url><loc>https://kwvrs.com/team</loc>
      <image:image><image:loc>https://kwvrs.com/team/x.jpg</image:loc></image:image>
    </url></urlset>`;
    expect(extractLocs(xml)).toEqual(["https://kwvrs.com/team"]);
  });
});

describe("collectSitemapPageUrls", () => {
  it("returns the <loc> entries of a plain urlset directly", () => {
    const dir = tempDir();
    const file = join(dir, "sitemap.xml");
    writeFileSync(file, URLSET(["https://kwvrs.com/", "https://kwvrs.com/about"]));
    expect(collectSitemapPageUrls(file)).toEqual([
      "https://kwvrs.com/",
      "https://kwvrs.com/about",
    ]);
  });

  it("recurses a sitemapindex into local sibling children and dedupes", () => {
    const dir = tempDir();
    writeFileSync(join(dir, "sitemap-a.xml"), URLSET(["https://kwvrs.com/a", "https://kwvrs.com/shared"]));
    writeFileSync(join(dir, "sitemap-b.xml"), URLSET(["https://kwvrs.com/b", "https://kwvrs.com/shared"]));
    writeFileSync(
      join(dir, "sitemap.xml"),
      `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://kwvrs.com/sitemap-a.xml</loc></sitemap>
  <sitemap><loc>https://kwvrs.com/sitemap-b.xml</loc></sitemap>
</sitemapindex>
`,
    );
    expect(collectSitemapPageUrls(join(dir, "sitemap.xml")).sort()).toEqual([
      "https://kwvrs.com/a",
      "https://kwvrs.com/b",
      "https://kwvrs.com/shared",
    ]);
  });

  it("throws when the index references a child that is not on disk", () => {
    const dir = tempDir();
    writeFileSync(
      join(dir, "sitemap.xml"),
      `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://kwvrs.com/sitemap-missing.xml</loc></sitemap>
</sitemapindex>
`,
    );
    expect(() => collectSitemapPageUrls(join(dir, "sitemap.xml"))).toThrow(
      /sitemap-missing\.xml/,
    );
  });
});
