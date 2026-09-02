import { describe, it, expect } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import About from "./About";

// Attorney feedback is withdrawn from the site for now (2026-09-02): the only
// quotes on hand were representative placeholders, and a marketing page for an
// expert practice must not carry feedback it cannot attribute. The home hero
// carries a "what every report states" card in the pull-quote slot instead.
function render(path: string, Page: ComponentType): string {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(Routes, null, createElement(Route, { path, element: createElement(Page) })),
    ),
  );
}

const FEEDBACK_COPY = /What Attorneys Say|Representative feedback|Retaining attorney|testimonial|Sample - Replace/i;

describe("no attorney feedback renders anywhere", () => {
  const home = render("/", Home);
  const about = render("/about", About);

  it("home page carries no quote section, hero pull-quote, or placeholder badge", () => {
    expect(home).not.toMatch(FEEDBACK_COPY);
    expect(home).not.toContain("<blockquote");
  });

  it("about page carries no quote section", () => {
    expect(about).not.toMatch(FEEDBACK_COPY);
    expect(about).not.toContain("<blockquote");
  });

  it("home hero shows the report-contents card in the former pull-quote slot", () => {
    expect(home).toContain("What Every Report States");
    expect(home).toContain("Discount rate");
    expect(home).toContain('href="/methods"');
  });
});
