import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Agreement from "./Agreement";

// Real server render (same technique as Raffle.render.test.tsx - vitest runs
// environment: "node"). The page takes no props: its "fixture" is the route
// param it reads with useParams, so it must be rendered inside a matching Route.
const render = (slug: string) =>
  renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [`/agreements/${slug}`] },
      createElement(
        Routes,
        null,
        createElement(Route, { path: "/agreements/:slug", element: createElement(Agreement) }),
      ),
    ),
  );

const html = render("personal-injury");

describe("Agreement initial render", () => {
  it("does not render the missing-info modal before a submit attempt", () => {
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain("A few required items are missing");
  });

  it("keeps the native required attributes as the no-JS backstop", () => {
    expect(html).not.toMatch(/novalidate/i);
    expect(html).toMatch(/id="individual"[^>]*required/);
    expect(html).toMatch(/id="sig"[^>]*required/);
  });

  it("renders every control the modal writes through to", () => {
    // Text/date controls are addressed by id, groups by name - both reachable
    // through form.elements.namedItem (it matches name OR id).
    for (const id of ["individual", "due-date", "invoice-to"]) {
      expect(html).toContain(`id="${id}"`);
    }
    for (const name of [
      "Type of Case",
      "Work Product(s) Authorized",
      "Retaining Counsel Represents",
      "Payment Method",
    ]) {
      expect(html).toContain(`name="${name}"`);
    }
  });

  it("a PSA with no represents row simply omits it (matrimonial)", () => {
    const marital = render("matrimonial");
    expect(marital).not.toContain('name="Retaining Counsel Represents"');
    expect(marital).toContain('name="Work Product(s) Authorized"');
  });
});
