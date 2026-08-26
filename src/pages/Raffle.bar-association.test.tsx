import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import Raffle from "./Raffle";
import src from "./Raffle.tsx?raw";
import { BAR_ASSOCIATION_GROUPS, BAR_ASSOCIATION_NONE, BAR_ASSOCIATION_OTHER } from "../../lib/bar-associations.mjs";

// The select on /raffle. vitest runs in a node environment, so the interactive
// half (choosing Other reveals the free-text input) is pinned at source level -
// the same technique Raffle.test.mjs uses - while the initial markup is asserted
// through a real server render, like Raffle.render.test.tsx. The source is read
// through Vite's ?raw import rather than node:fs because tsc -b compiles src/
// with types: ["vite/client"] only, and a node built-in there fails the build.
const html = renderToStaticMarkup(
  createElement(MemoryRouter, { initialEntries: ["/raffle?event=njaj-2026"] }, createElement(Raffle)),
);

describe("bar-association select", () => {
  it("renders one optgroup per roster group, in order", () => {
    const positions = BAR_ASSOCIATION_GROUPS.map((g) => html.indexOf(`<optgroup label="${g.label}">`));
    for (const [i, at] of positions.entries()) {
      expect(at, BAR_ASSOCIATION_GROUPS[i].label).toBeGreaterThan(-1);
      if (i > 0) expect(at).toBeGreaterThan(positions[i - 1]);
    }
  });

  it("renders every roster option as a selectable value", () => {
    for (const group of BAR_ASSOCIATION_GROUPS) {
      for (const option of group.options) {
        // React escapes the two names carrying & and ' - assert the escaped form.
        const value = option.value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
        expect(html, option.value).toContain(`value="${value}"`);
      }
    }
  });

  it("is required, has a blank placeholder, and sits between firm and phone", () => {
    expect(html).toContain('id="rf-barAssociation"');
    expect(html).toMatch(/<select[^>]*id="rf-barAssociation"[^>]*required/);
    // React marks the option matching the controlled select's value as selected,
    // so the empty placeholder renders as `<option value="" selected="">`.
    expect(html).toMatch(/<option value=""[^>]*>Select your association<\/option>/);
    expect(html.indexOf('id="rf-firm"')).toBeLessThan(html.indexOf('id="rf-barAssociation"'));
    expect(html.indexOf('id="rf-barAssociation"')).toBeLessThan(html.indexOf('id="rf-phone"'));
  });

  it("keeps the free-text input hidden until the Other option is chosen", () => {
    expect(html).not.toContain('id="rf-barAssociationOther"');
    expect(src).toContain("fields.barAssociation === BAR_ASSOCIATION_OTHER && (");
    expect(src).toContain('id="rf-barAssociationOther"');
    expect(src).toContain("maxLength={BAR_ASSOCIATION_OTHER_MAX_LENGTH}");
  });

  it("clears stale free text when the entrant switches off the Other option", () => {
    expect(src).toContain('if (e.target.value !== BAR_ASSOCIATION_OTHER) update("barAssociationOther", "")');
  });

  it("sources its options from the shared module and validates with the shared rule", () => {
    expect(src).toContain('from "../../lib/bar-associations.mjs"');
    expect(src).toContain("BAR_ASSOCIATION_GROUPS.map(");
    expect(src).not.toContain("Association for Justice"); // no retyped roster in the page
  });

  it("focuses the association before the optional fields when a submit fails", () => {
    expect(src).toMatch(/FIELD_FOCUS_ORDER[\s\S]{0,220}"barAssociation"/);
  });

  it("names both escape options so no entrant is ever blocked", () => {
    expect(html).toContain(BAR_ASSOCIATION_NONE);
    expect(html).toContain(BAR_ASSOCIATION_OTHER);
  });

  it("uses hyphens, never em dashes (CLAUDE.md content rule)", () => {
    expect(src).not.toMatch(/[–—]/);
  });
});
