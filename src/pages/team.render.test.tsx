import { describe, it, expect } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Team from "./Team";
import ExpertProfile from "./templates/ExpertProfile";
import { LEGACY_BRAND_PATTERN } from "@/lib/brand";

// Server renders of the roster pages for the three-person economics team.
// usePageMeta does not run under renderToStaticMarkup, so this covers the
// synchronous body and JSON-LD only; the meta pair is pinned separately by
// scripts/prerender-meta.test.mjs.
function render(path: string, routePath: string, Page: ComponentType): string {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(Routes, null, createElement(Route, { path: routePath, element: createElement(Page) })),
    ),
  );
}

// The old roster-composition copy (planners, nurse, chronologists, plan
// administrators) that must not survive on the economics site. A background
// credential in a bio ("a Certified Life Care Planner") is allowed by the spec,
// so the planner form is matched only as the plural roster claim.
const LCP_ROSTER_COPY = /Certified Life Care Planners|nurse life care planner|medical chronolog|plan administrat|board-certified physician|doctoral-level/i;

// The Organization JSON-LD lists the sister sites in sameAs on purpose; the
// brand guard applies to the visible page, not to that block.
const withoutJsonLd = (html: string) => html.replace(/<script type="application\/ld\+json">[^]*?<\/script>/g, "");

describe("/team renders the three-person roster", () => {
  const html = render("/team", "/team", Team);

  it("lists every member on one row under one heading, leadership first", () => {
    expect(html).toContain("Our Team");
    expect(html).not.toContain(">Economics Team<");
    expect(html).toContain("lg:grid-cols-3");
    expect(html.match(/lg:grid-cols-3/g)?.length).toBe(1);
    const chris = html.indexOf('href="/team/christopher-skerritt"');
    const zach = html.indexOf('href="/team/zachary-sperling"');
    const francis = html.indexOf('href="/team/francis-kumah"');
    expect(chris).toBeGreaterThan(-1);
    expect(zach).toBeGreaterThan(chris);
    expect(francis).toBeGreaterThan(zach);
    expect(html).toContain("Forensic Accountant");
    expect(html).toContain("Chief of Economic Services");
    expect(html).toContain("Economic Associate / Expert Liaison");
  });

  it("emits no In Memoriam section and no sister-roster copy", () => {
    expect(html).not.toContain("In Memoriam");
    expect(html).not.toMatch(LCP_ROSTER_COPY);
    expect(withoutJsonLd(html)).not.toMatch(LEGACY_BRAND_PATTERN);
    expect(html).not.toMatch(/[\u2013\u2014]/);
  });

  it("publishes Person schema for both active members", () => {
    expect(html).toContain("/team/christopher-skerritt#person");
    expect(html).toContain("/team/zachary-sperling#person");
    expect(html).toContain("/team/francis-kumah#person");
  });
});

describe("/team/:slug profiles", () => {
  const chris = render("/team/christopher-skerritt", "/team/:slug", ExpertProfile);
  const zach = render("/team/zachary-sperling", "/team/:slug", ExpertProfile);
  const francis = render("/team/francis-kumah", "/team/:slug", ExpertProfile);

  it("Christopher Skerritt: full biography, education, and economics practice areas", () => {
    expect(chris).toContain('<section id="bio"');
    expect(chris).toContain("directs the practice&#x27;s forensic economic work");
    expect(chris).toContain('<section id="education"');
    expect(chris).toContain("Bryant University");
    expect(chris).toContain("Springfield College");
    expect(chris).toContain('href="/services/lost-earnings-and-earning-capacity"');
    expect(chris).toContain('href="/services/wrongful-death-economic-loss"');
    expect(chris).toContain('href="/services/business-valuation"');
    expect(chris).toContain("New Jersey, New York, Massachusetts, Virginia, Rhode Island, Connecticut, Pennsylvania");
  });

  it("Zachary Sperling: support profile with no tier badge and no education block", () => {
    expect(zach).toContain('<section id="bio"');
    expect(zach).toContain("Economic Associate and Expert Liaison");
    expect(zach).not.toContain('<section id="education"');
    expect(zach).not.toContain("Senior Expert");
    expect(zach).toContain("New Jersey, New York");
  });

  it("Francis Kumah: support profile with no tier badge", () => {
    expect(francis).toContain('<section id="bio"');
    expect(francis).toContain("forensic accountant on the economics team");
    expect(francis).not.toContain("Senior Expert");
    expect(francis).toContain("New Jersey, New York");
  });

  it("Francis Kumah's profile claims no transfer pricing work, on the page or in the Person node (review fix 2026-10-05)", () => {
    // His source roster entry lists forensic accounting, financial analysis,
    // and economic damages; nothing names transfer pricing until the owner
    // confirms it (README, facts to confirm).
    expect(withoutJsonLd(francis)).not.toMatch(/transfer pricing|intercompany/i);
    expect(francis).not.toContain('href="/services/transfer-pricing-expert-witness"');
    // The Person node's knowsAbout comes from his specialties (the
    // Organization node may list the topic; the person may not).
    const person = [...francis.matchAll(/<script type="application\/ld\+json">([^]*?)<\/script>/g)]
      .flatMap((m) => {
        const doc = JSON.parse(m[1]);
        return (doc["@graph"] ?? [doc]) as { "@type"?: string; "@id"?: string; knowsAbout?: string[] }[];
      })
      .find((n) => n["@type"] === "Person" && n["@id"]?.endsWith("/team/francis-kumah#person"));
    expect(person).toBeDefined();
    expect(person!.knowsAbout ?? []).not.toContain("Transfer Pricing");
    // The senior expert who directs the work keeps the practice area.
    expect(chris).toContain('href="/services/transfer-pricing-expert-witness"');
  });

  it("only Christopher Skerritt's profile lists intellectual property damages, on the page and in the Person node (2026-10-06)", () => {
    expect(chris).toContain('href="/services/intellectual-property-damages"');
    for (const html of [zach, francis]) {
      expect(html).not.toContain('href="/services/intellectual-property-damages"');
      expect(withoutJsonLd(html)).not.toMatch(/intellectual property|patent|trademark|copyright|trade secret/i);
    }
  });

  it("no profile carries sister-roster copy or dashes", () => {
    for (const html of [chris, zach, francis]) {
      expect(html).not.toMatch(LCP_ROSTER_COPY);
      expect(withoutJsonLd(html)).not.toMatch(LEGACY_BRAND_PATTERN);
      expect(html).not.toMatch(/[\u2013\u2014]/);
      expect(html).not.toContain("In Memoriam");
    }
  });

  it("an unknown slug renders the 404, not an empty profile", () => {
    const html = render("/team/nobody-here", "/team/:slug", ExpertProfile);
    expect(html).not.toContain('<section id="bio"');
  });
});
