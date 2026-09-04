import { describe, it, expect, vi } from "vitest";
import type { ComponentType } from "react";
import CaseTypeHub from "./templates/CaseTypeHub";
import CaseTypeState from "./templates/CaseTypeState";
import CredentialHub from "./templates/CredentialHub";
import CredentialState from "./templates/CredentialState";
import { usePageMeta } from "@/hooks/use-page-meta";
import { caseTypes, getCaseType } from "@/data/caseTypes";
import { credentials, getCredential } from "@/data/credentials";
import { states } from "@/data/states";
import { placeName } from "@/data/geo-prose.mjs";
import { caseTypeStateTitle } from "@/lib/page-titles.mjs";
import { stateRegulations, getRegulationsByState } from "@/data/regulations/state-regs";
import { stateCourts, getCourtsByState, selectTrialCourts, courtSystemLabel } from "@/data/courts/state-courts";
import { LEGACY_BRAND_PATTERN, ORG_NAME } from "@/lib/brand";
import { ORG_URL } from "@/lib/schema";
import { renderRoute, visibleText, jsonLdBlocks, DOUBLED_WORD, MIS_ARTICLE, excerpt } from "@/test-utils/markup";

// Server renders of the case-type and credential family (hub + state tiers)
// after the 2026-09-02 audit: page canonical as the Service entity, named
// byline with dates, category-gated state modules, case-type-aware court
// lists, local FAQs instead of the hub's, in-body next step, SERP-length
// titles and descriptions. usePageMeta writes from an effect that never runs
// under renderToStaticMarkup, so it is replaced with a spy and the meta each
// page would publish is read back from the call. The data guards for the
// state modules (state-regs.ts, state-courts.ts) live here because the
// state tiers are their only rendered consumer in this family.
vi.mock("@/hooks/use-page-meta", () => ({ usePageMeta: vi.fn() }));

const HUB_ROUTE = "/case-types/:slug";
const STATE_ROUTE = "/case-types/:typeSlug/:stateSlug";
const CRED_HUB_ROUTE = "/credentials/:slug";
const CRED_STATE_ROUTE = "/credentials/:credSlug/:stateSlug";

// Same patterns as credential-claims.render.test.tsx and narratives.test.ts.
const FIRM_LEVEL_CLAIM = /economists holding|holding (NAFE|AAEFE)|planners holding|(our|KW Economics) (economists|experts) (are|hold|belong)/i;
const NAMED_PERSON_LINK = /href="\/team\/[a-z-]+"/;
const DOUBLED_ARTICLE = /\b(a|an|the) (a|an|the)\b/i;
const RULE_CITE = /\b(Rule|Fed\. R\.|U\.S\.C\.|F\.3d|F\. Supp)\b/;
const SISTER_VOCABULARY = /vocational evaluation|vocational expert|transferable skills|labor market survey|life care planner|CNLCP/i;
const NAMED_STANDARD = /Daubert|Frye/;
const ADMISSIBILITY_CLAIM = /court-admissible|court-tested|our reports (are|have been) admi|has been admitted/i;
const FIGURES = /\$\d|\d+(\.\d+)?\s?%/;

function render(path: string, routePath: string, Page: ComponentType): { html: string; title: string; description: string } {
  vi.mocked(usePageMeta).mockClear();
  const html = renderRoute(path, routePath, Page);
  const meta = vi.mocked(usePageMeta).mock.calls.at(-1)?.[0];
  return { html, title: meta?.title ?? "", description: meta?.description ?? "" };
}

/** The markup of one top-level <section id="..."> (the templates do not nest sections). */
const section = (html: string, id: string): string =>
  html.match(new RegExp(`<section id="${id}"[\\s\\S]*?</section>`))?.[0] ?? "";

interface LdNode { "@type"?: string; "@id"?: string; url?: string; name?: string; author?: { "@id": string; name?: string; url?: string }; datePublished?: string; dateModified?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[]; areaServed?: { "@type": string; name: string } }
const graph = (html: string): LdNode[] => (JSON.parse(jsonLdBlocks(html)) as { "@graph": LdNode[] })["@graph"];
const node = (html: string, type: string): LdNode | undefined => graph(html).find((n) => n["@type"] === type);
const faqQuestions = (html: string): string[] => (node(html, "FAQPage")?.mainEntity ?? []).map((q) => q.name);

const H1 = /<h1[^>]*>([\s\S]*?)<\/h1>/;
const h1Of = (html: string): string => visibleText(html.match(H1)?.[1] ?? "").trim();
const nj = getRegulationsByState("new-jersey")!;
const njCourts = getCourtsByState("new-jersey")!;

// ---------------------------------------------------------------------------
// Case-type hub
// ---------------------------------------------------------------------------

describe("CaseTypeHub /case-types/wrongful-death", () => {
  const { html, title, description } = render("/case-types/wrongful-death", HUB_ROUTE, CaseTypeHub);
  const text = visibleText(html);

  it("publishes a SERP-length title on the titleBase and the category-neutral description", () => {
    expect(title).toBe(`Wrongful Death Economist | ${ORG_NAME}`);
    expect(description).toBe(
      "Wrongful Death economic damages: loss components, the records that drive them, and how the present value is built. Plaintiff and defense.",
    );
    expect(h1Of(html)).toBe("Wrongful Death Economic Damages Analysis");
  });

  it("carries the named, dated byline and resolves the Article author to a compact Person node", () => {
    expect(html).toMatch(/<span>By <\/span><a [^>]*href="\/team\/christopher-skerritt"/);
    expect(html).toContain('<time dateTime="2026-08-27">2026-08-27</time>');
    expect(html).toContain('<time dateTime="2026-09-02">2026-09-02</time>');
    const article = node(html, "Article")!;
    expect(article.datePublished).toBe("2026-08-27");
    expect(article.dateModified).toBe("2026-09-02");
    // The author is a compact Person embedded by articleSchema (name, job
    // title, profile URL); the biography stays on the profile page and no
    // second Person node repeats it.
    const person = article.author!;
    expect(person["@id"]).toBe(`${ORG_URL}/team/christopher-skerritt#person`);
    expect(person.url).toBe(`${ORG_URL}/team/christopher-skerritt`);
    expect(person.name).toBe("Christopher Skerritt, M.Ed., MBA");
    expect(JSON.stringify(person)).not.toContain("description");
    expect(graph(html).filter((n) => n["@type"] === "Person")).toHaveLength(0);
  });

  it("renders the In short list and the four numbered steps under the method paragraph", () => {
    const inShort = section(html, "in-short");
    expect(inShort).toContain("In short");
    expect(inShort.match(/<li>/g)).toHaveLength(3);
    const analysis = section(html, "analysis");
    expect(analysis).toContain("How the analysis is built");
    expect(analysis).toContain("<ol");
    expect(analysis.match(/<li>/g)).toHaveLength(4);
    expect(analysis).toContain("Establish the decedent&#x27;s earnings and fringe benefit base");
  });

  it("links the service pages by their own names and the by-state pages with the case type in the anchor", () => {
    expect(html).not.toContain("Economic Loss for Wrongful Death");
    expect(html).toContain("Applied to wrongful death matters");
    expect(html).toContain('href="/services/wrongful-death-economic-loss/case/wrongful-death"');
    expect(section(html, "service-pages")).toContain('href="/services/wrongful-death-economic-loss"');
    expect(html).toContain("Wrongful Death in New Jersey");
    expect(html).toContain("Wrongful Death in the District of Columbia");
    expect(html).not.toContain("Wrongful Death in District of Columbia");
  });

  it("ends with an in-body next step and keeps the house typography", () => {
    expect(html).toContain("Recommended next step");
    expect(html).toContain("(wrongful death cases)");
    expect(html).toContain('href="/contact"');
    expect(html).toMatch(/href="tel:/);
    expect(text).not.toMatch(/[–—]/);
    expect(excerpt(text, DOUBLED_WORD)).toBeUndefined();
  });
});

describe("CaseTypeHub across all 14 case types", () => {
  for (const ct of caseTypes) {
    it(`/case-types/${ct.slug} names the same retainable economist and fits the SERP`, () => {
      const { html, title, description } = render(`/case-types/${ct.slug}`, HUB_ROUTE, CaseTypeHub);
      expect(section(html, "experts")).toContain('href="/team/christopher-skerritt"');
      expect(section(html, "experts")).not.toContain("zachary-sperling");
      expect(title.length).toBeLessThanOrEqual(60);
      expect(description.length).toBeLessThanOrEqual(160);
      expect(description).toMatch(/Plaintiff and defense\.$/);
      expect(section(html, "in-short").match(/<li>/g)).toHaveLength(3);
      expect(section(html, "analysis").match(/<li>/g)).toHaveLength(4);
      expect(node(html, "Article")?.dateModified).toBe(ct.dateModified);
      expect(html).toContain("Recommended next step");
      expect(visibleText(html)).not.toMatch(LEGACY_BRAND_PATTERN);
    });
  }
});

// ---------------------------------------------------------------------------
// Case-type x state
// ---------------------------------------------------------------------------

describe("CaseTypeState /case-types/wrongful-death/new-jersey", () => {
  const { html, title, description } = render("/case-types/wrongful-death/new-jersey", STATE_ROUTE, CaseTypeState);
  const text = visibleText(html);
  const url = `${ORG_URL}/case-types/wrongful-death/new-jersey`;

  it("publishes the titleBase title with the state early and a description that fits", () => {
    expect(title).toBe(`Wrongful Death Economist in New Jersey | ${ORG_NAME}`);
    expect(description).toBe(
      "Wrongful Death economic damages in New Jersey: loss components, state damages rules and venues, and how the number is built.",
    );
    expect(h1Of(html)).toBe("Wrongful Death Economic Damages Expert in New Jersey");
  });

  it("opens with the direct answer, then the definition, then the state modules, with no hub Overview", () => {
    expect(text).toContain(
      "KW Economics prepares economic damages analyses for wrongful death cases venued in New Jersey: the components the loss claim consists of, the records that drive them, and a present value built to New Jersey's damages rules and venues. Plaintiff and defense.",
    );
    expect(html).not.toContain(">Overview<");
    expect(section(html, "definition")).toContain("A wrongful death economic claim measures what the decedent would have contributed");
    expect(section(html, "definition")).toContain('href="/case-types/wrongful-death"');
    const juris = html.indexOf('<section id="jurisdictional-notes"');
    const analysis = html.indexOf('<section id="analysis"');
    expect(juris).toBeGreaterThan(-1);
    expect(analysis).toBeGreaterThan(juris);
    // The hub's three long sections are not repeated.
    expect(html).not.toContain('<section id="loss-components"');
    expect(html).not.toContain('<section id="damages-exposure"');
    expect(html).not.toContain(getCaseType("wrongful-death")!.economicImpact.slice(0, 80));
  });

  it("names the expert standard, lists only the courts that hear the case, and names the compensation forum once", () => {
    const juris = section(html, "jurisdictional-notes");
    expect(juris).toContain(nj.expertStandard.slice(0, 60).replace(/'/g, "&#x27;"));
    expect(juris).not.toContain("expert evidence standard");
    expect(juris).toContain("Superior Court, Law Division");
    expect(juris).not.toContain("Family Division");
    expect(juris).not.toContain("Chancery Division");
    expect(juris).toContain("Highest court: Supreme Court of New Jersey.");
    expect(juris).toContain("Federal venues: D.N.J.");
    expect(juris).toMatch(/Court system: <a href="https:\/\/www\.njcourts\.gov" rel="noopener" target="_blank"[^>]*>njcourts\.gov<\/a>\./);
    expect(juris).toContain("Outside the civil courts, wage-loss disputes in workers&#x27; compensation matters proceed before the <strong>New Jersey Division of Workers&#x27; Compensation</strong>.");
    expect(juris).not.toContain("Compensation forum:");
    // A death case gets the wrongful death / survival framework.
    expect(juris).toContain("Damages framework");
    expect(juris).toContain("pairs a wrongful death action for the survivors&#x27; pecuniary loss");
  });

  it("lists only the retainable economist under Experts serving", () => {
    const experts = section(html, "experts");
    expect(experts).toContain('href="/team/christopher-skerritt"');
    expect(experts).not.toContain("zachary-sperling");
    expect(experts).not.toContain("Sperling");
  });

  it("emits two local FAQs as the only FAQPage and links the hub FAQs instead of repeating them", () => {
    expect(faqQuestions(html)).toEqual([
      "Which New Jersey courts hear wrongful death cases?",
      "How does New Jersey's damages framework shape the economic analysis?",
    ]);
    const faq = node(html, "FAQPage")!;
    expect(faq["@id"]).toBe(`${url}#faq`);
    const answers = faq.mainEntity!.map((q) => q.acceptedAnswer.text);
    expect(answers[0]).toContain("the Superior Court, Law Division (General civil and criminal matters; jury trials)");
    expect(answers[0]).toContain("Final appeals run to the Supreme Court of New Jersey.");
    expect(answers[0]).toContain("Matters within federal jurisdiction proceed in the United States District Court for the District of New Jersey.");
    expect(answers[1]).toContain(nj.damagesContext);
    expect(answers[1]).toContain(nj.expertStandard);
    const hubQuestion = "How is the personal consumption deduction determined?";
    expect(faqQuestions(html)).not.toContain(hubQuestion);
    const more = section(html, "more-questions");
    expect(more).toContain(hubQuestion);
    expect(more).toContain('href="/case-types/wrongful-death#faq-heading"');
    expect(html).not.toContain(getCaseType("wrongful-death")!.faqs[0].answer.slice(0, 60));
  });

  it("points the Service entity at the page itself, not at a /services URL that 404s", () => {
    const service = node(html, "Service")!;
    expect(service["@id"]).toBe(`${url}#service`);
    expect(service.url).toBe(url);
    expect(service.dateModified).toBe("2026-09-02");
    expect(service.areaServed).toEqual({ "@type": "State", name: "New Jersey" });
    expect(html).not.toContain("/services/wrongful-death/new-jersey");
  });

  it("keeps the crawl-path links, renders the numbered steps, and ends with a next step in context", () => {
    expect(html).toContain('href="/locations/new-jersey"');
    expect(html).toContain('href="/services/wrongful-death-economic-loss/new-jersey"');
    for (const stage of ["considering", "retaining", "preparing-deposition", "trial"]) {
      expect(html).toContain(`href="/attorneys/${stage}/wrongful-death"`);
    }
    expect(section(html, "analysis").match(/<li>/g)).toHaveLength(4);
    expect(html).toContain("(wrongful death cases in New Jersey)");
    expect(html).toContain('href="/contact"');
    expect(html).toMatch(/<span>By <\/span><a [^>]*href="\/team\/christopher-skerritt"/);
    expect(html).toContain('<time dateTime="2026-09-02">');
    expect(text).not.toMatch(/[–—]/);
    expect(excerpt(text, DOUBLED_WORD)).toBeUndefined();
  });
});

describe("CaseTypeState category gates", () => {
  it("a commercial dispute gets the fault, interest, and cap paragraph, never the wrongful death framework or a compensation forum", () => {
    const { html } = render("/case-types/commercial-contract-dispute/new-jersey", STATE_ROUTE, CaseTypeState);
    const juris = section(html, "jurisdictional-notes");
    expect(juris).toContain("New Jersey reduces a negligence-based award");
    expect(juris).not.toContain("pairs a wrongful death action");
    expect(juris).not.toContain("Workers&#x27; Compensation");
    expect(juris).not.toContain("Compensation forum:");
    // Commercial selection surfaces the equity court alongside the Law Division.
    expect(juris).toContain("Superior Court, Chancery Division");
    expect(juris).toContain("Superior Court, Law Division");
    const answers = node(html, "FAQPage")!.mainEntity!.map((q) => q.acceptedAnswer.text);
    expect(answers[1]).toContain(nj.generalContext);
    expect(answers[1]).not.toContain("pairs a wrongful death action");
  });

  it("an employment matter gets the general paragraph too", () => {
    const { html } = render("/case-types/wrongful-termination/texas", STATE_ROUTE, CaseTypeState);
    const juris = section(html, "jurisdictional-notes");
    expect(juris).toContain("Texas reduces a negligence-based award");
    expect(juris).not.toContain("pairs a wrongful death action");
    expect(juris).not.toContain("Compensation forum:");
  });

  it("the workers' compensation page names the compensation forum with the third-party sentence", () => {
    const { html } = render("/case-types/workers-compensation/new-jersey", STATE_ROUTE, CaseTypeState);
    const juris = section(html, "jurisdictional-notes");
    expect(juris).toContain("<strong class=\"text-navy\">Compensation forum:</strong> New Jersey Division of Workers&#x27; Compensation.");
    expect(juris).toContain("Third-party actions arising from the same injury proceed in the civil courts listed above");
    expect(juris).not.toContain("Outside the civil courts, wage-loss disputes");
    expect(juris).toContain("Damages framework");
    // The courts FAQ names the forum first; the civil courts only for the third-party action.
    const answers = node(html, "FAQPage")!.mainEntity!.map((q) => q.acceptedAnswer.text);
    expect(answers[0]).toMatch(/^Workers' Compensation claims in New Jersey proceed before the New Jersey Division of Workers' Compensation, and third-party actions arising from the same injury are heard in the Superior Court, Law Division/);
    expect(answers[0]).not.toContain("cases venued in New Jersey are heard in");
  });

  it("the general court list never back-fills with small-claims-tier courts and keeps Georgia's State Court", () => {
    const texas = section(render("/case-types/wrongful-death/texas", STATE_ROUTE, CaseTypeState).html, "jurisdictional-notes");
    expect(texas).toContain("<strong>District Court</strong>");
    expect(texas).toContain("<strong>County Court at Law</strong>");
    expect(texas).not.toContain("Constitutional County Court");
    expect(texas).not.toContain("<strong>Justice Court</strong>");
    const georgia = section(render("/case-types/personal-injury/georgia", STATE_ROUTE, CaseTypeState).html, "jurisdictional-notes");
    expect(georgia).toContain("<strong>Superior Court</strong>");
    expect(georgia).toContain("<strong>State Court</strong>");
    expect(georgia).not.toContain("Magistrate Court");
  });

  it("the territorial federal districts keep their own names in the courts FAQ", () => {
    const cnmi = node(render("/case-types/wrongful-death/northern-mariana-islands", STATE_ROUTE, CaseTypeState).html, "FAQPage")!.mainEntity![0].acceptedAnswer.text;
    expect(cnmi).toContain("proceed in the United States District Court for the Northern Mariana Islands.");
    expect(cnmi).not.toContain("District Court for the District Court");
    const guam = node(render("/case-types/wrongful-death/guam", STATE_ROUTE, CaseTypeState).html, "FAQPage")!.mainEntity![0].acceptedAnswer.text;
    expect(guam).toContain("proceed in the United States District Court of Guam.");
    const usvi = node(render("/case-types/wrongful-death/us-virgin-islands", STATE_ROUTE, CaseTypeState).html, "FAQPage")!.mainEntity![0].acceptedAnswer.text;
    expect(usvi).toContain("proceed in the United States District Court of the Virgin Islands.");
    const texas = node(render("/case-types/wrongful-death/texas", STATE_ROUTE, CaseTypeState).html, "FAQPage")!.mainEntity![0].acceptedAnswer.text;
    expect(texas).toContain("proceed in the United States District Courts for the Northern District of Texas, Southern District of Texas, Eastern District of Texas, and Western District of Texas.");
  });

  it("a divorce page lists the family court and a wrongful death page does not", () => {
    const divorce = section(render("/case-types/divorce-and-marital-dissolution/new-york", STATE_ROUTE, CaseTypeState).html, "jurisdictional-notes");
    expect(divorce).toContain("<strong>Family Court</strong>");
    const death = section(render("/case-types/wrongful-death/new-york", STATE_ROUTE, CaseTypeState).html, "jurisdictional-notes");
    expect(death).toContain("<strong>Supreme Court</strong> - General jurisdiction trial court for major civil cases and felonies");
    expect(death).not.toContain("<strong>Family Court</strong>");
    expect(death).not.toContain("Surrogate");
    expect(death).not.toContain("confusingly");
    const njDivorce = section(render("/case-types/divorce-and-marital-dissolution/new-jersey", STATE_ROUTE, CaseTypeState).html, "jurisdictional-notes");
    expect(njDivorce).toContain("Superior Court, Family Division");
  });

  it("the District keeps its article in place slots and drops it in attributive slots", () => {
    const { html, title } = render("/case-types/wrongful-death/district-of-columbia", STATE_ROUTE, CaseTypeState);
    const text = visibleText(html);
    // The full place name plus the brand would run 67 characters, so the
    // shared builder falls back to the abbreviation in the <title> alone;
    // every heading and sentence slot below keeps the article.
    expect(title).toBe(`Wrongful Death Economist in DC | ${ORG_NAME}`);
    expect(title.length).toBeLessThanOrEqual(60);
    expect(h1Of(html)).toBe("Wrongful Death Economic Damages Expert in the District of Columbia");
    expect(text).toContain("built to the District of Columbia's damages rules and venues");
    expect(text).toContain("District of Columbia courts and expert standards");
    expect(text).toContain("Which District of Columbia courts hear wrongful death cases?");
    expect(text).toContain("How does the District of Columbia's damages framework shape the economic analysis?");
    expect(text).toContain("proceed in the United States District Court for the District of Columbia.");
    expect(text).not.toContain("District of the District");
    expect(text).not.toMatch(DOUBLED_ARTICLE);
    expect(text).not.toMatch(/in District of Columbia/);
  });

  it("American Samoa shows no federal venue line and explains the venue instead", () => {
    const { html } = render("/case-types/wrongful-death/american-samoa", STATE_ROUTE, CaseTypeState);
    const juris = section(html, "jurisdictional-notes");
    expect(juris).not.toContain("Federal venues");
    expect(juris).not.toContain("none");
    expect(juris).toContain("Highest court: High Court of American Samoa, Appellate Division.");
    expect(juris).toContain("no local U.S. district court");
    const answers = node(html, "FAQPage")!.mainEntity!.map((q) => q.acceptedAnswer.text);
    expect(answers[0]).not.toContain("Matters within federal jurisdiction");
    expect(answers[0]).toContain("no local U.S. district court");
  });
});

describe("CaseTypeState sweep of every case type x jurisdiction", () => {
  for (const ct of caseTypes) {
    it(`/case-types/${ct.slug}/* publishes fitted meta, a page-canonical Service, two local FAQs, and clean prose`, () => {
      for (const st of states) {
        const url = `${ORG_URL}/case-types/${ct.slug}/${st.slug}`;
        const { html, title, description } = render(`/case-types/${ct.slug}/${st.slug}`, STATE_ROUTE, CaseTypeState);
        const label = `${ct.slug}/${st.slug}`;
        // The shared builder: the titleBase stem, or the short name plus
        // Economist where the full stem cannot fit beside the place, with the
        // full place name wherever it fits and the abbreviation only where
        // no stem can.
        expect(title, label).toBe(caseTypeStateTitle(ct, st, ORG_NAME));
        expect([`${ct.titleBase} in `, `${ct.shortName} Economist in `].some((stem) => title.startsWith(stem)), label).toBe(true);
        expect(title.length, label).toBeLessThanOrEqual(60);
        expect(description, label).toContain(`${ct.name} economic damages in ${placeName(st.name)}:`);
        expect(description.length, label).toBeLessThanOrEqual(160);
        const service = node(html, "Service")!;
        expect(service["@id"], label).toBe(`${url}#service`);
        expect(service.url, label).toBe(url);
        expect(faqQuestions(html), label).toHaveLength(2);
        expect(section(html, "experts"), label).not.toContain("zachary-sperling");
        const text = visibleText(html);
        expect(text, label).not.toMatch(DOUBLED_ARTICLE);
        expect(excerpt(text, DOUBLED_WORD), label).toBeUndefined();
        expect(text, label).not.toMatch(/[–—]/);
        expect(html, label).not.toContain("Federal venues: none");
        // The territorial districts are named "District Court of/for ...".
        expect(text, label).not.toMatch(/for the District Court (of|for)/);
        // No small-claims-tier court back-fills the general court list (the
        // family selection may legitimately list a district court that also
        // hears small claims, as Maine's does).
        if (ct.category !== "family" && ct.category !== "commercial") {
          expect(section(html, "jurisdictional-notes"), label).not.toMatch(/small claims|smaller civil|small civil|petty/i);
        }
      }
    }, 120_000);
  }
});

// ---------------------------------------------------------------------------
// Credential hub
// ---------------------------------------------------------------------------

describe("CredentialHub", () => {
  for (const cred of credentials) {
    it(`/credentials/${cred.slug} publishes the authored meta and ends with a next step`, () => {
      const { html, title, description } = render(`/credentials/${cred.slug}`, CRED_HUB_ROUTE, CredentialHub);
      expect(title).toBe(cred.metaTitle);
      expect(description).toBe(cred.metaDescription);
      expect(description).not.toContain("…");
      expect(html).toContain("Recommended next step");
      expect(html).toContain('href="/contact"');
      expect(html).toContain('<time dateTime="2026-09-02">');
      expect(visibleText(html)).not.toMatch(/[–—]/);
    });
  }

  it("names the reviewer only where the credential names him", () => {
    for (const slug of ["forensic-economist", "graduate-economics-degree"]) {
      const { html } = render(`/credentials/${slug}`, CRED_HUB_ROUTE, CredentialHub);
      expect(html, slug).toMatch(/<span>By <\/span><a [^>]*href="\/team\/christopher-skerritt"/);
    }
    for (const slug of ["nafe-member", "aaefe-member"]) {
      const { html } = render(`/credentials/${slug}`, CRED_HUB_ROUTE, CredentialHub);
      expect(html, slug).toMatch(new RegExp(`<span>By </span><a [^>]*href="/team"[^>]*>${ORG_NAME} Editorial Team`));
      expect(html, slug).not.toMatch(NAMED_PERSON_LINK);
      expect(html, slug).not.toMatch(/Skerritt|Sperling/);
    }
  });
});

// ---------------------------------------------------------------------------
// Credential x state
// ---------------------------------------------------------------------------

describe("CredentialState /credentials/forensic-economist/new-york", () => {
  const { html, title, description } = render("/credentials/forensic-economist/new-york", CRED_STATE_ROUTE, CredentialState);
  const text = visibleText(html);
  const url = `${ORG_URL}/credentials/forensic-economist/new-york`;
  const ny = getRegulationsByState("new-york")!;

  it("publishes a category-keyed title, H1, and description", () => {
    expect(title).toBe(`Vetting a Forensic Economist in New York | ${ORG_NAME}`);
    expect(h1Of(html)).toBe("Forensic Economist Qualifications for New York Damages Cases");
    expect(description).toBe("What the forensic economist qualification establishes, how New York courts weigh it, and how to retain a forensic economist there.");
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it("leads with the state's expert standard and follows with what the credential adds", () => {
    const lead = html.match(/<p class="text-lg text-neutral-700 mb-8">([\s\S]*?)<\/p>/)![1];
    expect(visibleText(lead).trim().startsWith("New York courts ask whether the methodology behind an expert opinion is generally accepted")).toBe(true);
    expect(visibleText(lead)).toContain("The forensic economist qualification is what that inquiry examines");
    expect(text).not.toContain("what the credential establishes about a damages expert, how New York courts treat it");
  });

  it("carries a credential x state paragraph instead of the hub scope, with the pinned recognition strings", () => {
    const recognition = section(html, "recognition");
    expect(recognition).toContain("Recognized nationally; no state licensure applies");
    expect(recognition).toContain("economists apply nationally recognized methods");
    expect(recognition).toContain("there is no New York register to check");
    expect(recognition).not.toContain(getCredential("forensic-economist")!.scope.slice(0, 80));
    expect(recognition).not.toContain("pairs a wrongful death action");
    expect(recognition).not.toContain(ny.damagesContext.slice(0, 60));
  });

  it("lists the civil courts, links the state court system, and emits one local FAQ", () => {
    const courts = section(html, "courts");
    expect(courts).toContain("<strong>Supreme Court</strong> - General jurisdiction trial court for major civil cases and felonies");
    expect(courts).not.toContain("confusingly");
    expect(courts).not.toContain("<strong>Family Court</strong>");
    expect(courts).toMatch(/Court system: <a href="https:\/\/iapps\.courts\.state\.ny\.us\/nyscef" rel="noopener" target="_blank"[^>]*>iapps\.courts\.state\.ny\.us<\/a>\./);
    expect(faqQuestions(html)).toEqual(["How do New York courts qualify a forensic economist?"]);
    const answer = node(html, "FAQPage")!.mainEntity![0].acceptedAnswer.text;
    expect(answer).toContain(ny.expertStandard);
    expect(answer).toContain("Recognized nationally; no state licensure applies.");
    const more = section(html, "more-questions");
    expect(more).toContain("Is forensic economist a licensed title?");
    expect(more).toContain('href="/credentials/forensic-economist#faq-heading"');
    expect(faqQuestions(html)).not.toContain("Is forensic economist a licensed title?");
  });

  it("points the Service entity at the page itself, names the reviewer, and ends with a next step", () => {
    const service = node(html, "Service")!;
    expect(service["@id"]).toBe(`${url}#service`);
    expect(service.url).toBe(url);
    expect(html).not.toContain("cred-forensic-economist-new-york");
    expect(html).toMatch(/<span>By <\/span><a [^>]*href="\/team\/christopher-skerritt"/);
    expect(section(html, "experts")).toContain('href="/team/christopher-skerritt"');
    expect(html).toContain("Recommended next step");
    expect(text).not.toMatch(/[–—]/);
    expect(excerpt(text, DOUBLED_WORD)).toBeUndefined();
  });
});

describe("CredentialState membership and degree pages", () => {
  it("/credentials/nafe-member/texas reads as an affiliation, names nobody, and keeps the pinned strings", () => {
    const { html, title, description } = render("/credentials/nafe-member/texas", CRED_STATE_ROUTE, CredentialState);
    expect(title).toBe(`What NAFE Membership Means in Texas | ${ORG_NAME}`);
    expect(h1Of(html)).toBe("NAFE Membership and Texas Damages Testimony");
    expect(description).toBe("What NAFE membership establishes, how Texas courts weigh it, and how to retain a forensic economist there.");
    expect(html).toContain('<section id="recognition"');
    expect(html).toContain("Recognized nationally; no state licensure applies");
    expect(html).toContain("economists apply nationally recognized methods");
    expect(html).toContain("Forensic economists for Texas matters");
    expect(html).toContain("Membership is verified with the association for the year in question");
    expect(html).not.toMatch(FIRM_LEVEL_CLAIM);
    expect(html).not.toMatch(/Skerritt|Sperling/);
    expect(html).not.toMatch(NAMED_PERSON_LINK);
    expect(html).toContain(`${ORG_NAME} Editorial Team`);
    expect(html).toMatch(/"name":"Forensic Economists for Texas Damages Matters \(NAFE\)"/);
    expect(faqQuestions(html)).toEqual(["How do Texas courts qualify a forensic economist?"]);
    expect(node(html, "Service")!.url).toBe(`${ORG_URL}/credentials/nafe-member/texas`);
  });

  it("/credentials/graduate-economics-degree/district-of-columbia keeps the District's article out of attributive slots", () => {
    const { html, title } = render("/credentials/graduate-economics-degree/district-of-columbia", CRED_STATE_ROUTE, CredentialState);
    const text = visibleText(html);
    // The full place name would overrun the tag, so the <title> alone takes
    // the abbreviation; the H1 and every sentence slot keep the article.
    expect(title).toBe(`Forensic Economist Degrees in DC | ${ORG_NAME}`);
    expect(h1Of(html)).toBe("Graduate Economics Credentials for District of Columbia Damages Cases");
    expect(text).toContain("Recognition and qualification in the District of Columbia");
    expect(text).toContain("How do District of Columbia courts qualify a forensic economist?");
    expect(text).not.toMatch(DOUBLED_ARTICLE);
    expect(text).not.toMatch(/for the District of Columbia Damages/);
  });

  it("the credential paragraph differs by credential on the same state", () => {
    const recognitions = credentials.map((c) =>
      visibleText(section(render(`/credentials/${c.slug}/new-york`, CRED_STATE_ROUTE, CredentialState).html, "recognition")),
    );
    expect(new Set(recognitions).size).toBe(credentials.length);
  });
});

describe("CredentialState sweep of every credential x jurisdiction", () => {
  for (const cred of credentials) {
    it(`/credentials/${cred.slug}/* publishes fitted meta, a page-canonical Service, one local FAQ, and clean prose`, () => {
      for (const st of states) {
        const url = `${ORG_URL}/credentials/${cred.slug}/${st.slug}`;
        const { html, title, description } = render(`/credentials/${cred.slug}/${st.slug}`, CRED_STATE_ROUTE, CredentialState);
        const label = `${cred.slug}/${st.slug}`;
        expect(title.length, label).toBeLessThanOrEqual(60);
        expect(title, label).not.toContain("Credential in");
        expect(description.length, label).toBeLessThanOrEqual(160);
        const service = node(html, "Service")!;
        expect(service["@id"], label).toBe(`${url}#service`);
        expect(service.url, label).toBe(url);
        expect(faqQuestions(html), label).toHaveLength(1);
        expect(html, label).toContain("Recognized nationally; no state licensure applies");
        const text = visibleText(html);
        expect(text, label).not.toMatch(DOUBLED_ARTICLE);
        // The templated slots only: court data legitimately reads "Class A and B".
        const lead = visibleText(html.match(/<p class="text-lg text-neutral-700 mb-8">([\s\S]*?)<\/p>/)?.[1] ?? "");
        for (const slot of [title, description, h1Of(html), lead]) expect(excerpt(slot, MIS_ARTICLE), label).toBeUndefined();
        expect(excerpt(text, DOUBLED_WORD), label).toBeUndefined();
        expect(text, label).not.toMatch(/[–—]/);
        if (cred.expertSlugs.length === 0) {
          expect(html, label).not.toMatch(NAMED_PERSON_LINK);
          expect(html, label).not.toMatch(/Skerritt|Sperling/);
          expect(html, label).not.toMatch(FIRM_LEVEL_CLAIM);
        }
      }
    }, 60_000);
  }
});

// ---------------------------------------------------------------------------
// State modules consumed by the state tiers (data guards)
// ---------------------------------------------------------------------------

describe("state-regs.ts general and expert-standard fields", () => {
  it("every jurisdiction carries both fields in the house style", () => {
    expect(stateRegulations).toHaveLength(states.length);
    for (const r of stateRegulations) {
      expect(r.generalContext.length, r.stateSlug).toBeGreaterThan(200);
      expect(r.expertStandard.length, r.stateSlug).toBeGreaterThan(150);
      const text = `${r.compensationForum} ${r.damagesContext} ${r.generalContext} ${r.expertStandard}`;
      expect(text, r.stateSlug).not.toMatch(/[–—§]/);
      expect(text, r.stateSlug).not.toMatch(RULE_CITE);
      expect(text, r.stateSlug).not.toMatch(FIGURES);
      expect(text, r.stateSlug).not.toMatch(LEGACY_BRAND_PATTERN);
      expect(text, r.stateSlug).not.toMatch(SISTER_VOCABULARY);
      // Written around what the court asks, never a named standard or a claim
      // that the firm's reports are admissible.
      expect(r.expertStandard, r.stateSlug).not.toMatch(NAMED_STANDARD);
      expect(r.expertStandard, r.stateSlug).not.toMatch(ADMISSIBILITY_CLAIM);
      expect(r.expertStandard, r.stateSlug).toMatch(/qualif|training|experience/i);
      expect(r.expertStandard, r.stateSlug).toMatch(/method|reliab|accept/i);
      expect(r.generalContext, r.stateSlug).toMatch(/fault|negligence/i);
      expect(r.generalContext, r.stateSlug).toMatch(/interest/i);
      expect(r.generalContext, r.stateSlug).toMatch(/limit/i);
      // The general paragraph is for the non-injury case types: no survivor
      // measure, even where an interest rule mentions a death award in passing.
      expect(r.generalContext, r.stateSlug).not.toMatch(/survival action|pecuniary loss|decedent/i);
    }
  });

  it("the general paragraph is not the injury paragraph", () => {
    for (const r of stateRegulations) expect(r.generalContext, r.stateSlug).not.toBe(r.damagesContext);
  });
});

describe("state-courts.ts rendered court data", () => {
  it("trial-court descriptions carry no dollar thresholds, parentheticals, or statute nicknames", () => {
    expect(stateCourts).toHaveLength(states.length);
    for (const c of stateCourts) {
      for (const t of c.trialCourts) {
        expect(t.description, `${c.stateSlug}: ${t.name}`).not.toMatch(/\$[0-9]/);
        expect(t.description, `${c.stateSlug}: ${t.name}`).not.toMatch(/\(confusingly/);
        expect(t.description, `${c.stateSlug}: ${t.name}`).not.toMatch(/[()]/);
        expect(t.description, `${c.stateSlug}: ${t.name}`).not.toMatch(/Act 250/);
        expect(t.description, `${c.stateSlug}: ${t.name}`).not.toMatch(/[–—§]/);
      }
      // Puerto Rico's courts carry their official Spanish names in parentheses by design.
      if (c.stateSlug !== "puerto-rico") expect(c.supremeCourt, c.stateSlug).not.toMatch(/[()]/);
      for (const d of c.federalDistricts) expect(d.abbreviation, c.stateSlug).not.toBe("none");
    }
  });

  it("American Samoa has no federal district placeholder and explains its venue instead", () => {
    const as = getCourtsByState("american-samoa")!;
    expect(as.federalDistricts).toEqual([]);
    expect(as.supremeCourt).toBe("High Court of American Samoa, Appellate Division");
    expect(as.venueNote).toMatch(/no separate supreme court and no local U\.S\. district court/);
    expect(stateCourts.filter((c) => c.venueNote).map((c) => c.stateSlug)).toEqual(["american-samoa"]);
  });

  it("every court system URL is a well-formed https link with a readable label", () => {
    const withUrl = stateCourts.filter((c) => c.filingPortalUrl !== undefined);
    expect(withUrl.length).toBeGreaterThanOrEqual(50);
    for (const c of withUrl) {
      expect(c.filingPortalUrl, c.stateSlug).toMatch(/^https:\/\/\S+$/);
      expect(URL.canParse(c.filingPortalUrl!), c.stateSlug).toBe(true);
      expect(courtSystemLabel(c.filingPortalUrl!), c.stateSlug).not.toMatch(/^www\.|https?:/);
    }
    expect(courtSystemLabel("https://www.njcourts.gov")).toBe("njcourts.gov");
    expect(courtSystemLabel("not a url")).toBe("state court system");
  });

  it("selectTrialCourts is case-type-aware and never returns an empty list", () => {
    const ny = getCourtsByState("new-york")!;
    expect(selectTrialCourts(njCourts, "general").map((c) => c.name)).toEqual(["Superior Court, Law Division"]);
    expect(selectTrialCourts(njCourts, "family").map((c) => c.name)).toEqual([
      "Superior Court, Chancery Division",
      "Superior Court, Family Division",
      "Superior Court, Law Division",
    ]);
    expect(selectTrialCourts(njCourts, "commercial").map((c) => c.name)[0]).toBe("Superior Court, Chancery Division");
    expect(selectTrialCourts(ny, "general").map((c) => c.name)).toEqual(["Supreme Court", "County Court", "Court of Claims"]);
    expect(selectTrialCourts(getCourtsByState("texas")!, "general").map((c) => c.name)).toEqual(["District Court", "County Court at Law"]);
    expect(selectTrialCourts(getCourtsByState("georgia")!, "general").map((c) => c.name)).toEqual(["Superior Court", "State Court"]);
    expect(selectTrialCourts(ny, "family").map((c) => c.name)[0]).toBe("Family Court");
    expect(selectTrialCourts(getCourtsByState("delaware")!, "commercial").map((c) => c.name)[0]).toBe("Court of Chancery");
    // Every general-jurisdiction court survives the general selection, and no
    // small-claims-tier court back-fills behind it.
    for (const c of stateCourts) {
      const picked = selectTrialCourts(c, "general");
      expect(picked.length, c.stateSlug).toBeGreaterThan(0);
      expect(picked.length, c.stateSlug).toBeLessThanOrEqual(3);
      expect(picked[0], c.stateSlug).toBe(c.trialCourts.find((t) => /general jurisdiction|general civil/i.test(t.description)) ?? c.trialCourts[0]);
      for (const t of picked) expect(`${t.name} ${t.description}`, `${c.stateSlug}: ${t.name}`).not.toMatch(/small claims|smaller civil|small civil|petty/i);
    }
    // Nothing eligible: fall back to the first three in file order.
    const onlySpecialized = { ...njCourts, trialCourts: njCourts.trialCourts.filter((t) => /Family|Tax|Municipal/.test(t.name)) };
    expect(selectTrialCourts(onlySpecialized, "general")).toEqual(onlySpecialized.trialCourts.slice(0, 3));
  });
});
