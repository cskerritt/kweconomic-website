// src/hydration-determinism.render.test.tsx
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import InsightsHub from "./pages/InsightsHub";
import InsightPost from "./pages/InsightPost";
import Contact from "./pages/Contact";
import SchemaOrg from "./components/SchemaOrg";
import EconomicContextWidget from "./components/EconomicContextWidget";
import { insightPosts } from "./data/insights";
import { shouldHydrate } from "./lib/hydration-mode";

// src/main.tsx hydrates the prerendered page in place; any text that differs
// between the build machine and the browser makes React throw a recoverable
// hydration error and re-render the page from scratch. The sources are read
// raw through Vite because the year, the locale and the timezone cannot be
// varied inside one process.
const SOURCES = import.meta.glob(
  [
    "/src/components/layout/Footer.tsx",
    "/src/components/SchemaOrg.tsx",
    "/src/hooks/use-state-cities.ts",
    "/src/hooks/use-page-meta.ts",
    "/src/pages/InsightPost.tsx",
    "/src/pages/InsightsHub.tsx",
    "/src/pages/Contact.tsx",
    "/src/pages/ScheduleConsultation.tsx",
    "/src/data/insights.ts",
    "/src/main.tsx",
  ],
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;
const source = (p: string) => SOURCES[p] ?? "";

const render = (path: string, pattern: string, Page: () => React.ReactElement | null) =>
  renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(Routes, null, createElement(Route, { path: pattern, element: createElement(Page) })),
    ),
  );

describe("post dates render the same calendar day on the build server and in the browser", () => {
  const post = insightPosts.find((p) => p.slug === "daubert-vs-frye-expert-testimony-standards");

  it("fixture: the Daubert post was published on 2025-02-18", () => {
    expect(post?.publishedDate).toBe("2025-02-18");
  });

  it("InsightsHub prints February 18, 2025", () => {
    const html = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: ["/insights"] }, createElement(InsightsHub)));
    expect(html).toContain("February 18, 2025");
    expect(html).not.toContain("February 17, 2025");
  });

  it("InsightPost prints the same day", () => {
    const html = render("/insights/daubert-vs-frye-expert-testimony-standards", "/insights/:slug", InsightPost);
    expect(html).toContain("February 18, 2025");
    expect(html).not.toContain("February 17, 2025");
  });

  it("every date formatter pins the calendar day to UTC in source", () => {
    expect(source("/src/data/insights.ts")).toContain('timeZone: "UTC"');
    expect(source("/src/pages/InsightsHub.tsx")).toContain('timeZone: "UTC"');
  });
});

describe("numbers are formatted with an explicit locale", () => {
  it("EconomicContextWidget renders 1,234,567 under any process locale", () => {
    const html = renderToStaticMarkup(
      createElement(EconomicContextWidget, { areaName: "Fixture", population: 1234567, medianHouseholdIncome: 70000 } as never),
    );
    expect(html).toContain("1,234,567");
  });
});

describe("Footer copyright year", () => {
  it("suppresses the hydration warning on the year (the build year stands until the next deploy)", () => {
    expect(source("/src/components/layout/Footer.tsx")).toContain("<span suppressHydrationWarning>{currentYear}</span>");
  });
});

describe("one source of truth for the head and the cities", () => {
  it("SchemaOrg is a pure render with no effect", () => {
    expect(source("/src/components/SchemaOrg.tsx")).not.toContain("useEffect");
  });

  it("useStateCities reads the preloaded context, then the inline script, in its useState initializer", () => {
    const src = source("/src/hooks/use-state-cities.ts");
    expect(src).toContain("useContext(PreloadedCitiesContext)");
    expect(src).toContain("readInlineCities(stateSlug)");
    expect(src.indexOf("useState<Loaded | undefined>(() =>")).toBeGreaterThan(-1);
  });

  it("usePageMeta hands the meta to the build's collector during render and writes the head from resolvePageHead in the effect", () => {
    const src = source("/src/hooks/use-page-meta.ts");
    expect(src).toContain("if (collect && meta) collect(meta);");
    expect(src).toContain("resolvePageHead(meta)");
  });

  it("main.tsx hydrates only a root stamped for this URL", () => {
    expect(source("/src/main.tsx")).toContain("hydrateRoot(container, app)");
    expect(shouldHydrate("/about", "/about/")).toBe(true);
    expect(shouldHydrate("/404", "/nope")).toBe(false);
    expect(shouldHydrate(null, "/")).toBe(false);
  });
});

describe("no page reads the query string or router state during render (the prerender has neither)", () => {
  const renderContact = (entry: string | { pathname: string; search?: string; state?: unknown }) =>
    renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [entry] }, createElement(Contact)));
  const plain = renderContact("/contact");

  it("/contact with a query string or router state renders the server markup of /contact", () => {
    expect(renderContact("/contact?inquiry=family-fiduciary&x=1")).toBe(plain);
    expect(renderContact({ pathname: "/contact", state: { context: "Fixture", from: "/services" } })).toBe(plain);
  });

  it("pages that could read them (Contact, ScheduleConsultation) do not, directly, in source", () => {
    for (const f of ["/src/pages/Contact.tsx", "/src/pages/ScheduleConsultation.tsx"]) {
      expect(source(f), f).not.toMatch(/useSearchParams|location\.search|location\.state|useLocation\(/);
    }
  });
});

describe("SchemaOrg escapes '<' so a string value cannot close the script element", () => {
  it("writes \\u003c for every '<' and still parses back to the same data", () => {
    const data = { "@context": "https://schema.org", name: "a </script><b>x</b>" };
    const html = renderToStaticMarkup(createElement(SchemaOrg, { data }));
    expect(html).not.toContain("</script><b>");
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    const json = html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
    expect(json).toContain("\\u003c");
    expect(JSON.parse(json)).toEqual(data);
  });
});
