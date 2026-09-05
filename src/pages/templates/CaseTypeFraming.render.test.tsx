import { describe, expect, it, vi } from "vitest";
import CaseTypeHub from "./CaseTypeHub";
import CaseTypeState from "./CaseTypeState";
import { usePageMeta } from "@/hooks/use-page-meta";
import { getCaseType } from "@/data/caseTypes";
import { getStateBySlug } from "@/data/states";
import { placeName } from "@/data/geo-prose.mjs";
import { ORG_NAME } from "@/lib/brand";
import { ORG_URL } from "@/lib/schema";
import { renderRoute, visibleText, faqLdStrings, jsonLdBlocks } from "@/test-utils/markup";

// Site audit 2026-09-05, F08 (57 pages): the divorce hub and its 56 state
// pages carried the shared economic-damages framing ("Divorce and Marital
// Dissolution Economic Damages Analysis", "Where the damages concentrate",
// "Economic damages analysis for divorce and marital dissolution matters in
// Alabama") beside a summary saying the matter is not a damages claim. The
// entry's `framing` block now reaches the title, H1, description, lead,
// section headings, framework block, local FAQ, and Service node on both
// render paths (scripts/prerender-shells.test.mjs pins the shells to these
// renders). Wrongful death stands in for the thirteen entries that keep the
// damages framing.
vi.mock("@/hooks/use-page-meta", () => ({ usePageMeta: vi.fn() }));

const HUB_ROUTE = "/case-types/:slug";
const STATE_ROUTE = "/case-types/:typeSlug/:stateSlug";
const H1 = /<h1[^>]*>([\s\S]*?)<\/h1>/;
const h1Of = (html: string) => visibleText(html.match(H1)?.[1] ?? "").trim();
const h2sOf = (html: string) => [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => visibleText(m[1]).trim());
const h3sOf = (html: string) => [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => visibleText(m[1]).trim());
const DAMAGES_FRAMING = /Economic Damages Analysis|Economic Damages Expert|economic damages in|damages framework|Where the damages concentrate|What the economic claim consists of|Economic damages analysis for/;

function render(path: string, routePath: string, Page: Parameters<typeof renderRoute>[2]) {
  vi.mocked(usePageMeta).mockClear();
  const html = renderRoute(path, routePath, Page);
  const meta = vi.mocked(usePageMeta).mock.calls.at(-1)?.[0];
  return { html, title: meta?.title ?? "", description: meta?.description ?? "", text: visibleText(html) };
}

const divorce = getCaseType("divorce-and-marital-dissolution")!;
const framing = divorce.framing!;

describe("the divorce hub takes the family-law framing", () => {
  const { html, title, description, text } = render("/case-types/divorce-and-marital-dissolution", HUB_ROUTE, CaseTypeHub);

  it("publishes the audit's proposed title, H1, and an income-valuation-tracing description", () => {
    expect(title).toBe(`Divorce Financial Analysis | ${ORG_NAME}`);
    expect(h1Of(html)).toBe("Financial Analysis for Divorce and Marital Dissolution");
    expect(description).toBe(framing.hubDescription);
    expect(description).toMatch(/^Income analysis, business valuation, and funds tracing for divorce and marital dissolution/);
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it("heads its sections for the financial assignment and keeps every damages heading off the page", () => {
    const h2s = h2sOf(html);
    expect(h2s).toContain("What the financial analysis consists of");
    expect(h2s).toContain("Which figures move the result");
    expect(h2s).toContain("How the analysis is built");
    expect(text).not.toMatch(DAMAGES_FRAMING);
    // The summary names the damages claim once, only to say the matter is not one.
    expect(text).toMatch(/rather than a damages claim/);
    expect(jsonLdBlocks(html)).toContain('"headline":"Financial Analysis for Divorce and Marital Dissolution"');
  });
});

describe("a divorce state page takes the family-law framing", () => {
  for (const stateSlug of ["alabama", "district-of-columbia"]) {
    const state = getStateBySlug(stateSlug)!;
    const place = placeName(state.name);
    const url = `${ORG_URL}/case-types/divorce-and-marital-dissolution/${stateSlug}`;
    const { html, title, description, text } = render(`/case-types/divorce-and-marital-dissolution/${stateSlug}`, STATE_ROUTE, CaseTypeState);

    it(`/${stateSlug}: title, H1, description, and lead`, () => {
      expect(title).toBe(stateSlug === "alabama" ? `Divorce Financial Expert in Alabama | ${ORG_NAME}` : `Divorce Financial Expert in DC | ${ORG_NAME}`);
      expect(h1Of(html)).toBe(`Financial Analysis for Divorce and Marital Dissolution in ${place}`);
      expect(description).toBe(framing.stateDescription.replace("{place}", place));
      expect(description.length).toBeLessThanOrEqual(160);
      expect(text).toContain(`${ORG_NAME} prepares financial analyses for divorce and marital dissolution matters venued in ${place}:`);
      expect(text).toContain("either spouse or the court can examine the figures");
      expect(text).not.toContain("Plaintiff and defense");
    });

    it(`/${stateSlug}: framework block, steps intro, local FAQ, and Service node carry no damages framing`, () => {
      expect(h3sOf(html)).toContain("Legal framework");
      expect(h3sOf(html)).not.toContain("Damages framework");
      expect(text).toContain(`Whether ${place} divides marital property equitably or as community property`);
      expect(text).toContain(`the governing framework in ${place} decides how each finding is applied`);
      expect(faqLdStrings(html)).toContain(`How does ${place}'s family-law framework shape the financial analysis?`);
      expect(text).not.toMatch(DAMAGES_FRAMING);
      expect(text).not.toMatch(/contributory negligence|comparative|prejudgment interest/);
      expect(jsonLdBlocks(html)).toContain(`"description":"${framing.stateDescription.replace("{place}", place)}"`);
      expect(jsonLdBlocks(html)).toContain(`"@id":"${url}#service"`);
      expect(text).not.toMatch(/a the |the the /);
    });
  }
});

describe("the other case types keep the economic-damages framing", () => {
  it("wrongful death hub and state page", () => {
    const hub = render("/case-types/wrongful-death", HUB_ROUTE, CaseTypeHub);
    expect(hub.title).toBe(`Wrongful Death Economist | ${ORG_NAME}`);
    expect(h1Of(hub.html)).toBe("Wrongful Death Economic Damages Analysis");
    expect(h2sOf(hub.html)).toContain("Where the damages concentrate");
    const nj = render("/case-types/wrongful-death/new-jersey", STATE_ROUTE, CaseTypeState);
    expect(nj.title).toBe(`Wrongful Death Economist in New Jersey | ${ORG_NAME}`);
    expect(h1Of(nj.html)).toBe("Wrongful Death Economic Damages Expert in New Jersey");
    expect(nj.description).toBe("Wrongful Death economic damages in New Jersey: loss components, state damages rules and venues, and how the number is built.");
    expect(h3sOf(nj.html)).toContain("Damages framework");
    expect(faqLdStrings(nj.html)).toContain("How does New Jersey's damages framework shape the economic analysis?");
    expect(jsonLdBlocks(nj.html)).toContain('"description":"Economic damages analysis for wrongful death matters in New Jersey."');
  });
});
