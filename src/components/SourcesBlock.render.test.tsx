import { describe, it, expect } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import SourcesBlock from "./SourcesBlock";
import { renderTextWithLinks } from "@/lib/richtext";
import { refsToSources } from "@/data/references";

// Real server render inside a router context (mirrors how the SPA renders these
// components), so we verify actual output, not just types.
const html = (node: ReactNode) => renderToStaticMarkup(createElement(MemoryRouter, null, node));

describe("SourcesBlock render - APA bibliography", () => {
  it("renders the References heading, APA text, a hostname link, hanging indent and a type label", () => {
    const out = html(
      createElement(SourcesBlock, {
        sources: refsToSources(["WEED_BERENS", "DAUBERT"]),
      }),
    );
    expect(out).toContain("References</h2>");
    expect(out).toContain("Weed,");
    expect(out).toContain('href="https://doi.org/10.4324/9781315157283"');
    expect(out).toContain(">doi.org<"); // hostname link label
    expect(out).toContain("text-indent"); // hanging indent applied
    expect(out).toContain("-1.5em");
    expect(out).toContain("Peer-Reviewed");
    expect(out).toContain("Daubert v. Merrell Dow");
  });

  it("keeps the plain (non-APA) rendering for legacy hand-authored sources", () => {
    const out = html(
      createElement(SourcesBlock, {
        sources: [{ title: "SSA POMS", url: "https://secure.ssa.gov/poms.nsf/", type: "gov" }],
      }),
    );
    expect(out).toContain("References</h2>");
    expect(out).toContain(">SSA POMS</a>");
    expect(out).not.toContain("text-indent"); // decimal list, not hanging indent
  });

  it("renders nothing for an empty source list", () => {
    expect(html(createElement(SourcesBlock, { sources: [] }))).toBe("");
  });
});

describe("renderTextWithLinks render - internal anchors", () => {
  it("emits an internal <a> for a valid marker and preserves surrounding text", () => {
    const out = html(
      createElement("p", null, ...renderTextWithLinks("See [[/methods/transferable-skills-analysis|TSA]] now")),
    );
    expect(out).toContain('href="/methods/transferable-skills-analysis"');
    expect(out).toContain(">TSA</a>");
    expect(out).toContain("See ");
    expect(out).toContain(" now");
  });

  it("emits no anchor for a rejected route (literal marker preserved)", () => {
    const out = html(createElement("p", null, ...renderTextWithLinks("bad [[/Bad_Route|x]]")));
    expect(out).not.toContain("<a ");
    expect(out).toContain("[[/Bad_Route|x]]");
  });
});
