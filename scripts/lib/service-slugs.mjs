// scripts/lib/service-slugs.mjs
//
// Text-level reader for src/data/services.ts, shared by the build scripts that
// do not load the TS module (generate-sitemap.mjs, prerender.mjs) and by
// sitemap-index.test.mjs. Mirrors `pillarServices()` in src/data/services.ts:
// only `pillar: true` entries are enumerated for routes, sitemaps, and
// prerender. A `pillar: false` entry (forensic economics) is a cross-sell card
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

/** { slug, name, pillar } for every entry, in file order. */
export function serviceEntries(content) {
  return serviceBlocks(content).map((block) => {
    const slug = block.match(/^\s*slug:\s*"([^"]+)"/m)?.[1];
    const name = block.match(/^\s*name:\s*"([^"]+)"/m)?.[1];
    if (!slug || !name) throw new Error(`service-slugs: block without slug/name:\n${block.slice(0, 200)}`);
    return { slug, name, pillar: !/^\s*pillar:\s*false\b/m.test(block) };
  });
}

/** Pillar entries only ({ slug, name }). */
export function pillarServiceEntries(content) {
  return serviceEntries(content)
    .filter((s) => s.pillar)
    .map(({ slug, name }) => ({ slug, name }));
}

/** Pillar slugs only, in file order. */
export function pillarServiceSlugs(content) {
  return pillarServiceEntries(content).map((s) => s.slug);
}
