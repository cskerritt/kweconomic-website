import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createServer } from "node:http";
import { mkdirSync, existsSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Self-hosted fonts (2026-09-18 privacy pass): the CSP no longer allows the
// Google Fonts origins, and /fonts/*.woff2 is served from this origin with the
// right content type and a long-lived immutable cache header.
process.env.VITEST = "1";
delete process.env.CANONICAL_HOST;

vi.mock("../lib/raw-submissions.server.mjs", () => ({
  enabled: false,
  insertRawSubmission: vi.fn(async () => ({ id: "row" })),
}));
vi.mock("../lib/lead-mailer.server.mjs", () => ({
  sendLeadEmail: vi.fn(async () => ({ ok: true, id: "m1" })),
}));

// server.js reads dist/index.html at import time; provision a stub shell and a
// stub font when the suite runs without a build (dist/ is gitignored).
const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const distIndex = join(DIST, "index.html");
if (!existsSync(distIndex)) {
  mkdirSync(DIST, { recursive: true });
  writeFileSync(distIndex, "<!doctype html><title>test shell</title>");
}
const stubFont = join(DIST, "fonts", "vitest-stub.woff2");
mkdirSync(dirname(stubFont), { recursive: true });
writeFileSync(stubFont, "wOF2stub");

const mod = await import("../server.js");

describe("self-hosted fonts: CSP and static serving", () => {
  let server, base;
  beforeAll(async () => {
    server = mod.server ?? createServer(mod.requestHandler);
    await new Promise((r) => server.listen(0, r));
    base = `http://127.0.0.1:${server.address().port}`;
  });
  afterAll(() => {
    server.close();
    rmSync(stubFont, { force: true });
  });

  it("the CSP names no Google Fonts origin and keeps style/font sources on this origin", async () => {
    const res = await fetch(`${base}/`);
    const csp = res.headers.get("content-security-policy");
    expect(csp).not.toContain("fonts.googleapis.com");
    expect(csp).not.toContain("fonts.gstatic.com");
    expect(csp).toContain("style-src 'self' 'unsafe-inline';");
    expect(csp).toContain("font-src 'self';");
  });

  it("serves /fonts/*.woff2 with 200, font/woff2, and a one-year immutable cache header", async () => {
    const res = await fetch(`${base}/fonts/vitest-stub.woff2`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("font/woff2");
    expect(res.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
  });
});

describe("index.html and the font stylesheet", () => {
  it("make no request to Google Fonts and preload only self-hosted files", async () => {
    const { readFileSync, readdirSync } = await import("node:fs");
    const root = join(DIST, "..");
    const html = readFileSync(join(root, "index.html"), "utf-8");
    expect(html).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com/);
    const preloads = [...html.matchAll(/<link rel="preload" href="([^"]+)" as="font"/g)].map((m) => m[1]);
    expect(preloads).toEqual(["/fonts/inter-latin.woff2", "/fonts/source-serif-4-latin.woff2"]);
    const css = readFileSync(join(root, "src", "fonts.css"), "utf-8");
    expect(css).not.toMatch(/https?:\/\//);
    const files = new Set(readdirSync(join(root, "public", "fonts")));
    const urls = [...css.matchAll(/url\("\/fonts\/([^"]+)"\)/g)].map((m) => m[1]);
    expect(urls.length).toBe(8);
    for (const u of urls) expect(files.has(u), u).toBe(true);
    for (const p of preloads) expect(files.has(p.replace("/fonts/", "")), p).toBe(true);
    expect((css.match(/font-display: swap/g) ?? []).length).toBe(8);
  });
});
