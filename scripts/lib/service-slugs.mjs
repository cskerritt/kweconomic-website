// scripts/lib/service-slugs.mjs
//
// Text-level reader for src/data/services.ts, shared by the build scripts that
// do not load the TS module (generate-sitemap.mjs, prerender.mjs) and by
// sitemap-index.test.mjs. Mirrors `pillarServices()` in src/data/services.ts:
// only `pillar: true` entries are enumerated for routes, sitemaps, and
// prerender. The `pillar: false` entries (vocational-evaluation, life-care-planning) are cross-sell cards
// and must never be advertised or prerendered.
//
// The file is split on top-level object boundaries: every service entry is a
// two-space-indented `{` on its own line. Nested objects (cost: {, inline
// process steps) sit deeper, so they never start a new block.

const BOUNDARY = /\n  \{\n/;

/** Raw text of every top-level service object literal, in file order. */
export function serviceBlocks(content) {
  return content
    .split(BOUNDARY)
    .slice(1) // text before the first entry (imports, comment, `export const`)
    .map((block) => block.split(/\n  \},?\n/)[0]);
}

/** { slug, name, shortName, pillar } for every entry, in file order. */
export function serviceEntries(content) {
  return serviceBlocks(content).map((block) => {
    const slug = block.match(/^\s*slug:\s*"([^"]+)"/m)?.[1];
    const name = block.match(/^\s*name:\s*"([^"]+)"/m)?.[1];
    const shortName = block.match(/^\s*shortName:\s*"([^"]+)"/m)?.[1] ?? name;
    if (!slug || !name) throw new Error(`service-slugs: block without slug/name:\n${block.slice(0, 200)}`);
    return { slug, name, shortName, pillar: !/^\s*pillar:\s*false\b/m.test(block) };
  });
}

/** Pillar entries only ({ slug, name, shortName }). */
export function pillarServiceEntries(content) {
  return serviceEntries(content)
    .filter((s) => s.pillar)
    .map(({ slug, name, shortName }) => ({ slug, name, shortName }));
}

/** Pillar slugs only, in file order. */
export function pillarServiceSlugs(content) {
  return pillarServiceEntries(content).map((s) => s.slug);
}
