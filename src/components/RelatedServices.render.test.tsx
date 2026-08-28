import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import RelatedServices from "./RelatedServices";

// CityPage passes case-type slugs; the badges must print the case-type names.
describe("RelatedServices", () => {
  it("renders matching services with case-type names, not slugs, on the badges", () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(RelatedServices, { caseTypes: ["personal-injury", "wrongful-death"], stateSlug: "texas" }),
      ),
    );
    expect(html).toContain('href="/services/');
    expect(html).toContain("/texas");
    expect(html).toContain(">Personal Injury<");
    expect(html).toContain(">Wrongful Death<");
    expect(html).not.toMatch(/>personal-injury<|>wrongful-death</);
  });

  it("renders nothing when no service shares a case type", () => {
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(RelatedServices, { caseTypes: ["no-such-type"], stateSlug: "texas" })),
    );
    expect(html).toBe("");
  });
});
