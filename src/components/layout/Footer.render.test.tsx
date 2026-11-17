// src/components/layout/Footer.render.test.tsx
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import Footer from "./Footer";
import { VOC_SITE_NAME, VOC_SITE_URL, LCP_SITE_NAME, LCP_SITE_URL } from "@/lib/brand";

const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Footer)));
const SISTERS = [[VOC_SITE_NAME, VOC_SITE_URL], [LCP_SITE_NAME, LCP_SITE_URL]] as const;

describe("footer sister-practice links (the vocational site's pattern, 2026-11-17)", () => {
  const company = html.slice(html.indexOf(">Company</h3>"), html.indexOf("Bottom bar") > 0 ? html.indexOf("Bottom bar") : html.indexOf("&copy;"));

  it("has no separate family column: five columns, one Company list", () => {
    expect(html).not.toMatch(/Family/);
    expect(html).toContain("lg:grid-cols-5");
    expect(html).not.toContain("lg:grid-cols-6");
  });

  it("lists each sister practice by name at the end of Company, opening safely in a new tab", () => {
    let last = company.indexOf(">Terms<");
    expect(last).toBeGreaterThan(0);
    for (const [name, url] of SISTERS) {
      const re = new RegExp(`<a href="${url}" target="_blank" rel="noopener noreferrer"[^>]*>${name}</a>`);
      expect(company).toMatch(re);
      const at = company.indexOf(`>${name}</a>`);
      expect(at).toBeGreaterThan(last);
      last = at;
    }
  });
});
