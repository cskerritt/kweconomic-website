import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import CrossSell from "./CrossSell";

describe("CrossSell", () => {
  it("links the sister practices with rel=noopener and no nofollow", () => {
    const html = renderToStaticMarkup(<MemoryRouter><CrossSell /></MemoryRouter>);
    expect(html).toContain('href="https://kwvrs.com/services/vocational-expert"');
    expect(html).toContain('href="https://kwvrs.com/services/forensic-economics"');
    expect(html).toContain('rel="noopener"');
    expect(html).not.toContain("nofollow");
  });
});
