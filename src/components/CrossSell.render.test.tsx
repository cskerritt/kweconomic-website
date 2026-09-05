import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import CrossSell from "./CrossSell";
import { VOC_SITE_URL, LCP_SITE_URL, VOC_SERVICE_URL, LCP_SERVICE_URL } from "@/lib/brand";

// The sister domains are read from the brand constants (never spelled here) so
// src/brand-strings.test.mjs keeps this file out of its offender list.
describe("CrossSell", () => {
  it("links both sister practices' verified service pages with rel=noopener and no nofollow", () => {
    const html = renderToStaticMarkup(<MemoryRouter><CrossSell /></MemoryRouter>);
    expect(html).toContain(`href="${VOC_SERVICE_URL}"`);
    expect(html).toContain(`href="${LCP_SERVICE_URL}"`);
    // The verified canonical paths (2026-09-05): the vocational site's
    // /services/vocational-evaluation alias answers 404 and is never linked.
    expect(VOC_SERVICE_URL).toBe(`${VOC_SITE_URL}/services/vocational-expert`);
    expect(LCP_SERVICE_URL).toBe(`${LCP_SITE_URL}/services/life-care-planning`);
    expect(html).not.toContain("/services/vocational-evaluation");
    expect(html).toContain('rel="noopener"');
    expect(html).not.toContain("nofollow");
  });

  it("names each practice once as a card and carries no dashes", () => {
    const html = renderToStaticMarkup(<MemoryRouter><CrossSell /></MemoryRouter>);
    expect(html.match(/<a /g)?.length).toBe(2);
    expect(html).not.toMatch(/[–—]/);
  });
});
