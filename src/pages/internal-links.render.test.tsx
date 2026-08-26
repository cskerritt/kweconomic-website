import { describe, it, expect } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import StateHub from "./StateHub";
import CaseTypeHub from "./templates/CaseTypeHub";
import CaseTypeState from "./templates/CaseTypeState";
import CredentialState from "./templates/CredentialState";
import JourneyStage from "./templates/JourneyStage";
import { caseTypes } from "@/data/caseTypes";
import { credentials } from "@/data/credentials";

// Server renders of the crawl-path link blocks added for the deep-tier pages
// (case-type x state, credential x state, /attorneys funnel). usePageMeta and
// useStateCities effects do not run under renderToStaticMarkup, so these
// assert the synchronous DOM: the cross-link sections must be present on
// first paint for any renderer.
function render(path: string, routePath: string, Page: ComponentType): string {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(Routes, null, createElement(Route, { path: routePath, element: createElement(Page) })),
    ),
  );
}

describe("StateHub deep-tier links", () => {
  const html = render("/locations/new-jersey", "/locations/:stateSlug", StateHub);

  it("links every case-type x state page for the state", () => {
    for (const ct of caseTypes) {
      expect(html).toContain(`href="/case-types/${ct.slug}/new-jersey"`);
    }
  });

  it("links every credential x state page for the state", () => {
    for (const cred of credentials) {
      expect(html).toContain(`href="/credentials/${cred.slug}/new-jersey"`);
    }
  });
});

describe("CaseTypeHub attorney funnel links", () => {
  const html = render("/case-types/traumatic-brain-injury", "/case-types/:slug", CaseTypeHub);

  it("links all four journey stages for the case type", () => {
    for (const stage of ["considering", "retaining", "preparing-deposition", "trial"]) {
      expect(html).toContain(`href="/attorneys/${stage}/traumatic-brain-injury"`);
    }
  });
});

describe("CaseTypeState cross-links", () => {
  const html = render(
    "/case-types/traumatic-brain-injury/new-jersey",
    "/case-types/:typeSlug/:stateSlug",
    CaseTypeState,
  );

  it("links all four journey stages for the case type", () => {
    for (const stage of ["considering", "retaining", "preparing-deposition", "trial"]) {
      expect(html).toContain(`href="/attorneys/${stage}/traumatic-brain-injury"`);
    }
  });

  it("links the other case types in the same state", () => {
    for (const ct of caseTypes.filter((c) => c.slug !== "traumatic-brain-injury")) {
      expect(html).toContain(`href="/case-types/${ct.slug}/new-jersey"`);
    }
    expect(html).not.toContain('href="/case-types/traumatic-brain-injury/new-jersey"');
  });

  it("links the state hub and the relevant service x state pages", () => {
    expect(html).toContain('href="/locations/new-jersey"');
    expect(html).toContain('href="/services/life-care-planning/new-jersey"');
  });
});

describe("CredentialState cross-links", () => {
  const html = render("/credentials/crc/new-jersey", "/credentials/:credSlug/:stateSlug", CredentialState);

  it("links the other credentials in the same state", () => {
    for (const cred of credentials.filter((c) => c.slug !== "crc")) {
      expect(html).toContain(`href="/credentials/${cred.slug}/new-jersey"`);
    }
    expect(html).not.toContain('href="/credentials/crc/new-jersey"');
  });

  it("links the state hub and the service x state pages that use the credential", () => {
    expect(html).toContain('href="/locations/new-jersey"');
    expect(html).toContain('href="/services/life-care-planning/new-jersey"');
    expect(html).toContain('href="/services/catastrophic-injury-planning/new-jersey"');
  });
});

describe("CredentialState cross-links for punctuated abbreviations", () => {
  // services.ts uses "RN"/"MD"; credentials.ts uses "R.N."/"M.D.". The
  // service x state list must still populate for these credentials.
  for (const slug of ["rn", "md"]) {
    it(`/credentials/${slug}/new-jersey lists at least one service x state page`, () => {
      const html = render(`/credentials/${slug}/new-jersey`, "/credentials/:credSlug/:stateSlug", CredentialState);
      expect(html).toMatch(/href="\/services\/[a-z-]+\/new-jersey"/);
    });
  }
});

describe("JourneyStage cross-links", () => {
  const html = render(
    "/attorneys/considering/traumatic-brain-injury",
    "/attorneys/:stage/:caseTypeSlug",
    JourneyStage,
  );

  it("links the other three stages for the same case type", () => {
    for (const stage of ["retaining", "preparing-deposition", "trial"]) {
      expect(html).toContain(`href="/attorneys/${stage}/traumatic-brain-injury"`);
    }
  });

  it("links the case-type hub", () => {
    expect(html).toContain('href="/case-types/traumatic-brain-injury"');
  });
});
