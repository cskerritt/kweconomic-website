import { describe, it, expect } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CredentialHub from "./templates/CredentialHub";
import CredentialState from "./templates/CredentialState";
import { credentials } from "@/data/credentials";

// Spec 4.3: until membership is confirmed, no credential page may say that the
// firm or a named economist holds NAFE or AAEFE membership, and the JSON-LD
// may not call a membership or a degree a certification. Server renders of
// the membership pages (hub and state) plus the two other credentials for
// contrast; usePageMeta does not run under renderToStaticMarkup, so this is
// the synchronous body and JSON-LD only.
function render(path: string, routePath: string, Page: ComponentType): string {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(Routes, null, createElement(Route, { path: routePath, element: createElement(Page) })),
    ),
  );
}

const STATE_ROUTE = "/credentials/:credSlug/:stateSlug";
const HUB_ROUTE = "/credentials/:slug";

// Any phrasing that attributes the credential to the firm's economists.
const FIRM_LEVEL_CLAIM = /economists holding|holding (NAFE|AAEFE)|planners holding|(our|KW Economics) (economists|experts) (are|hold|belong)/i;
// A link to a named team member (the byline links to /team, never /team/<slug>).
const NAMED_PERSON_LINK = /href="\/team\/[a-z-]+"/;

const MEMBERSHIP_SLUGS = credentials.filter((c) => c.slug.endsWith("-member")).map((c) => c.slug);

describe("membership credential x state pages make no firm-level membership claim", () => {
  const paths = [
    "/credentials/nafe-member/new-jersey",
    "/credentials/aaefe-member/new-jersey",
    "/credentials/nafe-member/texas",
  ];
  for (const path of paths) {
    describe(path, () => {
      const html = render(path, STATE_ROUTE, CredentialState);

      it("renders the page (not the 404)", () => {
        expect(html).toContain('<section id="recognition"');
        expect(html).toContain("Recognized nationally; no state licensure applies");
      });

      it("body copy never attributes the membership to the firm or to a person", () => {
        expect(html).not.toMatch(FIRM_LEVEL_CLAIM);
        expect(html).not.toMatch(/Skerritt|Sperling/);
        expect(html).not.toMatch(NAMED_PERSON_LINK);
        expect(html).toContain("economists apply nationally recognized methods");
        expect(html).toContain("Forensic economists for");
      });

      it("JSON-LD calls the credential a membership, not a certification, and keeps the service membership-neutral", () => {
        expect(html).toMatch(/"credentialCategory":"Professional Membership"/);
        expect(html).not.toContain("Professional Certification");
        expect(html).not.toMatch(/Holding (NAFE|AAEFE)/);
        expect(html).toMatch(/"name":"Forensic Economists for (New Jersey|Texas) Damages Matters \((NAFE|AAEFE)\)"/);
      });
    });
  }
});

describe("membership credential hub pages make no firm-level membership claim", () => {
  expect(MEMBERSHIP_SLUGS.sort()).toEqual(["aaefe-member", "nafe-member"]);
  for (const slug of MEMBERSHIP_SLUGS) {
    it(`/credentials/${slug} names no member and stamps the membership category`, () => {
      const html = render(`/credentials/${slug}`, HUB_ROUTE, CredentialHub);
      expect(html).toContain('<section id="by-state"');
      expect(html).not.toMatch(FIRM_LEVEL_CLAIM);
      expect(html).not.toMatch(/Skerritt|Sperling/);
      expect(html).not.toMatch(NAMED_PERSON_LINK);
      expect(html).not.toContain("planners");
      expect(html).toMatch(/"credentialCategory":"Professional Membership"/);
      expect(html).not.toContain("Professional Certification");
    });
  }
});

describe("non-membership credential pages keep their own category", () => {
  it("/credentials/graduate-economics-degree/new-jersey is an academic degree", () => {
    const html = render("/credentials/graduate-economics-degree/new-jersey", STATE_ROUTE, CredentialState);
    expect(html).toMatch(/"credentialCategory":"Academic Degree"/);
    expect(html).not.toContain("Professional Certification");
    expect(html).not.toMatch(FIRM_LEVEL_CLAIM);
  });

  it("/credentials/forensic-economist is a professional qualification", () => {
    const html = render("/credentials/forensic-economist", HUB_ROUTE, CredentialHub);
    expect(html).toMatch(/"credentialCategory":"Professional Qualification"/);
    expect(html).not.toContain("Professional Certification");
    expect(html).not.toContain("planners");
  });
});
