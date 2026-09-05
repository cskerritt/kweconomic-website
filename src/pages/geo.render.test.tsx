import { describe, it, expect, vi } from "vitest";
import type { City } from "@/types";
import StateHub from "./StateHub";
import CityPage from "./CityPage";
import ServiceState from "./ServiceState";
import ServiceStateCity from "./ServiceStateCity";
import { usePageMeta } from "@/hooks/use-page-meta";
import { getCourtsByState } from "@/data/courts/state-courts";
import { REFERENCES } from "@/data/references";
import { ORG_NAME } from "@/lib/brand";
import { renderRoute, visibleText } from "@/test-utils/markup";
import { expectServiceIdentity } from "@/test-utils/jsonld";
import { ORG_URL } from "@/lib/schema";

// Server renders of the four geographic templates for what every renderer
// (a crawler, a static markup pass, a visitor without JS) sees on first paint:
//
// - The state court system panel is open by default, so the one block of
//   hand-written per-state venue content (trial courts with descriptions,
//   highest court, federal districts) is in the DOM without a click.
// - Each template renders a References block from the registry and exactly
//   zero <main> elements of its own: the layout provides the page's single
//   main landmark, and a nested one is invalid HTML.
// - The city page's H1 states the subject and matches its title.
//
// useStateCities is an effect-driven per-state chunk load that never settles
// under renderToStaticMarkup, so it is replaced with a synchronous lookup;
// usePageMeta is replaced with a spy so the meta a page would publish can be
// read back (the same arrangement as service-geo.render.test.tsx).
vi.mock("@/hooks/use-state-cities", async () => {
  const { newJerseyCities } = await import("@/data/cities/new-jersey");
  const { districtOfColumbiaCities } = await import("@/data/cities/district-of-columbia");
  const BY_STATE: Record<string, City[]> = {
    "new-jersey": newJerseyCities,
    "district-of-columbia": districtOfColumbiaCities,
  };
  return {
    useStateCities: (stateSlug?: string) => ({
      cities: (stateSlug && BY_STATE[stateSlug]) || [],
      loading: false,
    }),
  };
});
vi.mock("@/hooks/use-page-meta", () => ({ usePageMeta: vi.fn() }));

interface Rendered { html: string; title: string; description: string }

function render(path: string, routePath: string, Page: Parameters<typeof renderRoute>[2]): Rendered {
  vi.mocked(usePageMeta).mockClear();
  const html = renderRoute(path, routePath, Page);
  const meta = vi.mocked(usePageMeta).mock.calls.at(-1)?.[0];
  return { html, title: meta?.title ?? "", description: meta?.description ?? "" };
}

const PAGES = [
  { label: "StateHub", path: "/locations/new-jersey", route: "/locations/:stateSlug", Page: StateHub, courts: true },
  { label: "CityPage", path: "/locations/new-jersey/hackensack", route: "/locations/:stateSlug/:citySlug", Page: CityPage, courts: true },
  {
    label: "ServiceState",
    path: "/services/lost-earnings-and-earning-capacity/new-jersey",
    route: "/services/:serviceSlug/:stateSlug",
    Page: ServiceState,
    courts: true,
  },
  {
    label: "ServiceStateCity",
    path: "/services/lost-earnings-and-earning-capacity/new-jersey/hackensack",
    route: "/services/:serviceSlug/:stateSlug/:citySlug",
    Page: ServiceStateCity,
    courts: false,
  },
] as const;

describe("the New Jersey court system panel is in the DOM on first paint", () => {
  const courts = getCourtsByState("new-jersey")!;
  for (const { label, path, route, Page, courts: hasPanel } of PAGES.filter((p) => p.courts)) {
    it(`${label} (${path}) prints the trial courts, the highest court, and the federal districts without a click`, () => {
      expect(hasPanel).toBe(true);
      const { html } = render(path, route, Page);
      expect(html).not.toContain("Loading...");
      expect(html).toContain("New Jersey Court System");
      expect(html).toContain('aria-expanded="true"');
      expect(html).toContain("Superior Court, Law Division");
      expect(html).toContain("Federal Districts");
      expect(html).toContain("District of New Jersey");
      expect(html).toContain(courts.supremeCourt);
      for (const c of courts.trialCourts) {
        expect(html).toContain(c.name);
        expect(html).toContain(c.description.replace(/&/g, "&amp;"));
      }
    });
  }
});

describe("every geo template carries a References block and no nested main landmark", () => {
  for (const { label, path, route, Page } of PAGES) {
    it(`${label} (${path})`, () => {
      const { html } = render(path, route, Page);
      expect(html).not.toContain("Loading...");
      expect(html).not.toContain("<main");
      expect(html).toContain("References</h2>");
      // The lost earnings pages and the place pages both name BLS wage data.
      expect(html).toContain(`href="${REFERENCES.BLS_OES.url}"`);
      expect(html).toContain('rel="noopener"');
    });
  }

  it("the state hub and city page cite the sources the shared narrative names", () => {
    for (const { path, route, Page } of PAGES.slice(0, 2)) {
      const { html } = render(path, route, Page);
      for (const id of ["BLS_OES", "CENSUS_ACS", "BLS_ECEC", "BLS_ECI", "SKOOG_CIECKA_KRUEGER_2011", "TREASURY_YIELD"]) {
        expect(html, `${path} cites ${id}`).toContain(`href="${REFERENCES[id].url}"`);
      }
    }
  });

  it("a commercial pillar's service pages cite valuation standards, not wage data", () => {
    for (const [path, route, Page] of [
      ["/services/business-valuation/new-jersey", "/services/:serviceSlug/:stateSlug", ServiceState],
      ["/services/business-valuation/new-jersey/hackensack", "/services/:serviceSlug/:stateSlug/:citySlug", ServiceStateCity],
    ] as const) {
      const { html } = render(path, route, Page);
      expect(html).toContain(`href="${REFERENCES.AICPA_SSVS1.url}"`);
      expect(html).toContain(`href="${REFERENCES.NACVA_STANDARDS.url}"`);
      expect(html).not.toContain(`href="${REFERENCES.BLS_OES.url}"`);
      expect(html).not.toContain("<main");
    }
  });
});

// T03 (2026-09-05 audit): the browser-added Service entity on every geo
// template used to derive its url and @id from a composite slug
// (/services/state-new-jersey, /services/city-new-jersey-hackensack,
// /services/lost-earnings-and-earning-capacity-new-jersey), addresses that
// answered 404. The builder now takes the page's own canonical URL.
describe("the Service entity on every geo template is the page itself", () => {
  for (const { label, path, route, Page } of PAGES) {
    it(`${label} (${path}): Service url is the page canonical and @id is canonical#service`, () => {
      const { html } = render(path, route, Page);
      expectServiceIdentity(html, `${ORG_URL}${path}`);
    });
  }
});

describe("CityPage H1 and meta", () => {
  it("/locations/new-jersey/hackensack states the subject in the H1 and matches the title", () => {
    const { html, title, description } = render("/locations/new-jersey/hackensack", "/locations/:stateSlug/:citySlug", CityPage);
    expect(html).not.toContain("Loading...");
    expect(html).toContain('<h1 class="font-serif text-4xl lg:text-5xl font-bold mb-3">Forensic Economists in Hackensack, NJ</h1>');
    expect(title).toBe(`Forensic Economists in Hackensack, NJ | ${ORG_NAME}`);
    expect(description.startsWith("KW Economics prepares economic damages analyses for cases venued in Hackensack, New Jersey.")).toBe(true);
    // The place-name H1 alone ("Hackensack, NJ") no longer opens the page.
    expect(html).not.toContain('mb-3">Hackensack, NJ</h1>');
  });

  it("/locations/district-of-columbia/washington reads the District's abbreviation in the H1 and its article in the prose", () => {
    const { html, title } = render("/locations/district-of-columbia/washington", "/locations/:stateSlug/:citySlug", CityPage);
    const text = visibleText(html);
    expect(html).toContain('mb-3">Forensic Economists in Washington, DC</h1>');
    expect(title).toBe(`Forensic Economists in Washington, DC | ${ORG_NAME}`);
    expect(text).toContain("for cases venued in Washington, the District of Columbia.");
    // The intro reads the District as a place, names it once, and treats
    // Washington as the federal seat rather than a state capital.
    expect(text).toContain(
      "Washington is located in the District of Columbia. As the seat of the federal government, Washington is home to the District's courts and to federal agencies",
    );
    expect(text).toContain("grounded in the District of Columbia's expert evidence standards");
    expect(text).toContain("prepared for the District of Columbia's civil and compensation forums");
    expect(text).toContain("Seat of the federal government");
    expect(text).not.toContain("District of Columbia, District of Columbia");
    expect(text).not.toContain("State capital of District of Columbia");
    expect(text).not.toContain("capital of District of Columbia");
    expect(text).not.toMatch(/\b(in|throughout|across|on) District of Columbia(?=[.?!:,;]| \||$)/);
  });

  it("/locations/new-jersey/trenton reads a state capital as one", () => {
    const { html } = render("/locations/new-jersey/trenton", "/locations/:stateSlug/:citySlug", CityPage);
    const text = visibleText(html);
    expect(text).toContain("Trenton is located in Mercer County, New Jersey. As the capital of New Jersey, Trenton is home to the state's principal courts");
    expect(text).toContain("State capital of New Jersey");
  });
});
