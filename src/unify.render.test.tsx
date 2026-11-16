import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import Footer from "@/components/layout/Footer";
import UsStateMap from "@/components/UsStateMap";
import { states } from "@/data/states";
import { OFFICES } from "@/lib/brand";

const footer = renderToStaticMarkup(<MemoryRouter><Footer /></MemoryRouter>);

describe("footer LinkedIn button", () => {
  const anchors = footer.match(/<a [^>]*linkedin[^>]*>/g) ?? [];
  it("is one link to the shared company page, new tab, labelled", () => {
    expect(footer.match(/linkedin\.com/g)).toHaveLength(1);
    expect(anchors).toHaveLength(1);
    const a = anchors[0];
    expect(a).toContain('href="https://www.linkedin.com/company/kwvrs"');
    expect(a).toContain('target="_blank"');
    expect(a).toContain('rel="noopener noreferrer"');
    expect(a).toContain('aria-label="Follow Kincaid Wolstein on LinkedIn (opens in a new tab)"');
    expect(a).toContain("min-h-11");
    expect(footer).toContain("Follow us on LinkedIn");
  });
  it("sits directly under the contact list in the brand column", () => {
    const mail = footer.indexOf("mailto:");
    const li = footer.indexOf("linkedin.com");
    const servicesHead = footer.indexOf(">Services<");
    expect(mail).toBeGreaterThan(-1);
    expect(li).toBeGreaterThan(mail);
    expect(li).toBeLessThan(servicesHead);
  });
  it("labels each office phone with the city the brand data states", () => {
    for (const o of OFFICES) expect(footer).toContain(`${o.addressLocality}, ${o.addressRegion}`);
  });
  it("carries no standalone credential list", () => {
    expect(footer).not.toMatch(/CRC\s*(&middot;|·|\|)\s*CLCP/);
    expect(footer).not.toMatch(/ABVE|\bCVE\b/);
  });
});

describe("home page map links", () => {
  const html = renderToStaticMarkup(<MemoryRouter><UsStateMap /></MemoryRouter>);
  const hrefs = [...new Set([...html.matchAll(/href="(\/locations\/[^"]+)"/g)].map((m) => m[1]))];
  const appSrc = readFileSync("src/App.tsx", "utf8");
  const sitemapSrc = readFileSync("scripts/generate-sitemap.mjs", "utf8");
  it("links every state and territory hub, each backed by this site's data", () => {
    const slugs = new Set(states.map((s) => s.slug));
    expect(slugs.size).toBe(56);
    expect(hrefs).toHaveLength(56);
    for (const h of hrefs) expect(slugs.has(h.replace("/locations/", "")), h).toBe(true);
  });
  it("resolves to a registered /locations/:stateSlug route that the sitemap and prerender cover", () => {
    expect(appSrc).toContain('path="/locations/:stateSlug"');
    expect(sitemapSrc).toContain("/locations/${st}");
    expect(readFileSync("scripts/lib/routes.mjs", "utf8")).toContain("for (const st of states)");
  });
});

describe("removed motion layer", () => {
  const OLD = /\bkw-(magnetic|tilt|tilt-glow|float|gradient-text|progress|page-enter|enter|enter-slow|enter-\d|underline|reveal--\w+)\b|ScrollProgress|useTilt|useMagnetic|kw-aurora-[ab]|kw-shimmer|kw-sheen|kw-fade-up/;
  function walk(d: string, out: string[] = []): string[] {
    for (const n of readdirSync(d)) {
      const p = join(d, n);
      if (statSync(p).isDirectory()) walk(p, out);
      else if (/\.(tsx?|css)$/.test(n) && !n.includes(".test.")) out.push(p);
    }
    return out;
  }
  it("leaves no removed class, keyframe or hook in src", () => {
    const hits = walk("src").filter((f) => OLD.test(readFileSync(f, "utf8")));
    expect(hits).toEqual([]);
  });
});
