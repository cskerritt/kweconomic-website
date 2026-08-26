// Source-read guard for the footer "Staff Login" link (no jsdom/RTL in this repo -
// vitest.config.ts's environment is "node"; same pattern as src/App.routes.test.mjs
// and src/components/RetainerIntakeForm.test.mjs).
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const footerSrc = readFileSync(join(here, "Footer.tsx"), "utf8");

describe("footer 'Staff Login' link (admin-redirect entry point)", () => {
  it("renders a 'Staff Login' link pointing at /admin (relative, so it rides the server redirect)", () => {
    expect(footerSrc).toMatch(/>\s*Staff Login\s*</);
    expect(footerSrc).toMatch(/href="\/admin"/);
  });

  it("uses a plain <a> and NOT a react-router <Link> (a <Link> would client-route into the SPA 404, never hitting the server 302)", () => {
    expect(footerSrc).toMatch(/<a\b[^>]*href="\/admin"[^>]*>/);
    expect(footerSrc).not.toMatch(/<Link\b[^>]*to="\/admin"/);
  });

  it('sets rel="nofollow noopener"', () => {
    expect(footerSrc).toMatch(/rel="nofollow noopener"/);
  });

  it("keeps it unobtrusive in the bottom bar, after Terms of Service", () => {
    const termsIdx = footerSrc.indexOf("Terms of Service");
    const staffIdx = footerSrc.indexOf("Staff Login");
    expect(termsIdx).toBeGreaterThan(-1);
    expect(staffIdx).toBeGreaterThan(termsIdx);
  });
});
