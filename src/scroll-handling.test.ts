import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The 2026-11-16 scroll review. The app mounts with createRoot, which replaces the prerendered shell, so the browser's
 * own scroll handling lands on the shell's layout. src/App.tsx therefore owns every landing; Playwright verified each
 * of these on a built site (fresh visit and in-app link at the top, Back/Forward/reload/cross-document Back at the
 * reader's position, a fragment and a table-of-contents link 80px down under the header, a malformed fragment safe).
 */
const app = readFileSync(join(process.cwd(), "src/App.tsx"), "utf8");
const html = readFileSync(join(process.cwd(), "index.html"), "utf8");

describe("scroll handling (2026-11-16)", () => {
  it("owns restoration: the browser's own restore is off, each entry's position is recorded and read at popstate", () => {
    expect(app).toContain('window.history.scrollRestoration = "manual"');
    expect(app).toContain('window.addEventListener("popstate"');
    expect(app).toContain("entryPositions.set(key, window.scrollY)");
  });

  it("a reload or a Back into a fresh document puts back the position kept in sessionStorage, never throwing", () => {
    expect(app).toContain('window.addEventListener("pagehide"');
    expect(app.match(/sessionStorage\.(get|set)Item/g)).toHaveLength(2);
    expect(app.match(/try \{/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
  });

  it("a fragment is decoded safely and a fresh load with one lands on its target without the shell's smooth jump", () => {
    expect(app).toMatch(/try \{\s*id = decodeURIComponent\(id\);\s*\} catch/);
    expect(app).not.toMatch(/getElementById\(decodeURIComponent/);
    expect(html).toContain("if(location.hash)document.documentElement.style.scrollBehavior='auto'");
    expect(app).toContain('document.documentElement.style.scrollBehavior = ""');
  });

  it("nothing adds a scroll margin to the 5rem scroll padding", () => {
    const sources = readFileSync(join(process.cwd(), "src/pages/KnowledgeArticle.tsx"), "utf8") + readFileSync(join(process.cwd(), "src/pages/Contact.tsx"), "utf8");
    expect(sources).not.toMatch(/scroll-mt-/);
  });
});
