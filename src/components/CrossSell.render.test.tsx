import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import CrossSell from "./CrossSell";
import { VOC_SITE_URL, LCP_SITE_URL } from "@/lib/brand";

// The sister domains are read from the brand constants (never spelled here) so
// src/brand-strings.test.mjs keeps this file out of its offender list.
describe("CrossSell", () => {
  it("links both sister practices with rel=noopener and no nofollow", () => {
    const html = renderToStaticMarkup(<MemoryRouter><CrossSell /></MemoryRouter>);
    expect(html).toContain(`href="${VOC_SITE_URL}/services/vocational-evaluation"`);
    expect(html).toContain(`href="${LCP_SITE_URL}/services/life-care-planning"`);
    expect(html).toContain('rel="noopener"');
    expect(html).not.toContain("nofollow");
  });

  it("names each practice once as a card and carries no dashes", () => {
    const html = renderToStaticMarkup(<MemoryRouter><CrossSell /></MemoryRouter>);
    expect(html.match(/<a /g)?.length).toBe(2);
    expect(html).not.toMatch(/[–—]/);
  });
});
