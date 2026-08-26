import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import CrossSell from "./CrossSell";
import { VOC_SITE_URL } from "@/lib/brand";

describe("CrossSell", () => {
  it("links the sister practices with rel=noopener and no nofollow", () => {
    const html = renderToStaticMarkup(<MemoryRouter><CrossSell /></MemoryRouter>);
    expect(html).toContain(`href="${VOC_SITE_URL}/services/vocational-expert"`);
    expect(html).toContain(`href="${VOC_SITE_URL}/services/forensic-economics"`);
    expect(html).toContain('rel="noopener"');
    expect(html).not.toContain("nofollow");
  });
});
