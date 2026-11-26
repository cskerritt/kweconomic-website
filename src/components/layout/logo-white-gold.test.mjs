import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// 2026-11-26: the header and footer wordmark is white text over the shared
// practice gold rule (#C77B13) beneath all of the logo text. A CSS filter such
// as brightness-0 invert would turn the gold rule white again.
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../../..");
const svg = readFileSync(join(root, "public/images/logo-white-gold.svg"), "utf8");
const header = readFileSync(join(here, "Header.tsx"), "utf8");
const footer = readFileSync(join(here, "Footer.tsx"), "utf8");

describe("white wordmark with the gold rule", () => {
  it("draws every text element white and one gold rule below the last line of text", () => {
    const texts = [...svg.matchAll(/<text[^>]*\by="(\d+)"[^>]*fill="([^"]+)"/g)];
    expect(texts.length).toBe(2);
    for (const [, , fill] of texts) expect(fill.toLowerCase()).toBe("#ffffff");
    const rects = [...svg.matchAll(/<rect[^>]*\by="(\d+)"[^>]*fill="([^"]+)"/g)];
    expect(rects.length).toBe(1);
    expect(rects[0][2].toUpperCase()).toBe("#C77B13");
    expect(Number(rects[0][1])).toBeGreaterThan(Math.max(...texts.map((t) => Number(t[1]))));
  });

  it.each([
    ["header", header],
    ["footer", footer],
  ])("the %s shows it without a color filter", (_name, src) => {
    const img = src.match(/<img[^>]*src="\/images\/logo-white-gold\.svg"[^>]*\/>/s);
    expect(img).not.toBeNull();
    expect(img[0]).not.toMatch(/brightness|invert/);
    expect(src).not.toContain('"/images/logo.svg"');
  });
});
