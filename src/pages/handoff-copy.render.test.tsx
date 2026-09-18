import { describe, expect, it } from "vitest";
import Home from "./Home";
import About from "./About";
import CaseStudies from "./CaseStudies";
import Contact from "./Contact";
import Privacy from "./Privacy";
import ScheduleConsultation from "./ScheduleConsultation";
import { renderRoute, visibleText } from "@/test-utils/markup";
import { homepageFaqs } from "@/data/home-faqs.mjs";
import { FAMILY_SECTION, FAMILY_SECTION_TEXT, INTAKE_DISCLOSURE, INTAKE_POLICY_LINK_TEXT, INTAKE_ROUTING } from "@/data/intake";
import { FORM_INTAKE_NOTE } from "@/data/consultation";
import { PRIVACY_SHARING_HEADING, privacySections } from "@/data/legal-policies";
import { ORG_NAME, ORG_SHORT, ORG_EMAIL, VOC_SITE_URL, LCP_SITE_URL, VOC_SERVICE_URL, LCP_SERVICE_URL, LEGACY_BRAND_PATTERN } from "@/lib/brand";

// Site audit 2026-09-05, tasks F12 / F06 / F08: the homepage FAQ promised an
// opinion that holds "under any admissibility standard"; /case-studies made a
// pre-retention work-product representation; the homepage report checklist
// described only the earnings lane; /about left the sister practices and the
// engagement handoff implicit. These renders pin the corrected copy.

// CrossSell.tsx is the one component allowed to spell the sister names; the
// brand guard applies to everything else on the page.
const withoutCrossSell = (html: string) => html.replace(/<section aria-labelledby="cross-sell-heading"[^>]*>[^]*?<\/section>/, "");
const withoutJsonLd = (html: string) => html.replace(/<script type="application\/ld\+json">[^]*?<\/script>/g, "");
// Phrases that would mark a vocational-site or life-care-planning-site line
// carried over unedited (src/pages/off-brand-copy.test.mjs applies the same
// list to the source).
const OFF_BRAND = /vocational evaluation|vocational expert|transferable skills|labor market survey|life care planner|CLCP|CNLCP/i;
const ABSOLUTE_ADMISSION = /any admissibility standard|under any standard|in any court|every court|all courts|guarantee/i;
const hostOf = (url: string) => new URL(url).host;

describe("homepage FAQ: no blanket admissibility promise (F12)", () => {
  const faqs = homepageFaqs(ORG_NAME, ORG_SHORT);
  const sides = faqs.find((f) => /plaintiff and defense/.test(f.question))!;

  it("keeps the method-transparency point and leaves qualification to the court, matter by matter", () => {
    expect(sides).toBeDefined();
    expect(sides.answer).toMatch(/same data sources/);
    expect(sides.answer).toMatch(/same discounting conventions/);
    expect(sides.answer).toMatch(/documentation of every assumption/);
    expect(sides.answer).toMatch(/matter-specific question the court decides/);
    for (const f of faqs) {
      expect(f.answer, f.question).not.toMatch(ABSOLUTE_ADMISSION);
      expect(f.answer, f.question).not.toMatch(/[–—]/);
    }
  });

  it("renders that answer on the homepage and in the FAQPage node", () => {
    const html = renderRoute("/", "/", Home);
    expect(html.match(/matter-specific question the court decides/g)?.length).toBeGreaterThanOrEqual(2);
    expect(html).not.toMatch(ABSOLUTE_ADMISSION);
  });
});

describe("homepage report checklist covers the valuation and tracing lanes (F08)", () => {
  const html = renderRoute("/", "/", Home);
  const card = html.slice(html.indexOf("Built to be examined"), html.indexOf("See the methods"));

  it("lists the valuation and tracing deliverables beside the earnings inputs", () => {
    expect(html.match(/What Every Report States/g)?.length).toBe(1);
    for (const label of ["Question asked", "Base figures", "Projection assumptions", "Discount rate", "Tie-out to the record"]) {
      expect(card, label).toContain(`${label}.`);
    }
    expect(card).toMatch(/standard of value/);
    expect(card).toMatch(/tracing/);
    expect(card).toMatch(/profit projection/);
    expect(card).toMatch(/worklife horizon/);
    expect(html).toContain('href="/methods"');
  });

  it("describes the transparent-assumptions promise across lanes and lists the valuation and family matters at intake", () => {
    expect(html).toMatch(/standard of value where a business is valued/);
    expect(html).toMatch(/business valuation, and marital financial matters/);
  });
});

describe("/about: sister practices and the combined-engagement handoff (F08, G01)", () => {
  const html = renderRoute("/about", "/about", About);
  const text = visibleText(withoutJsonLd(html));
  const section = html.slice(html.indexOf('id="family-of-practices"'), html.indexOf('aria-labelledby="cross-sell-heading"'));

  it("names the family and links each sister practice through the brand constants", () => {
    expect(section).toContain("economics and valuation practice of the Kincaid Wolstein family");
    expect(section).toContain(`href="${VOC_SITE_URL}"`);
    expect(section).toContain(`href="${LCP_SITE_URL}"`);
    expect(section).toContain(`>${hostOf(VOC_SITE_URL)}<`);
    expect(section).toContain(`>${hostOf(LCP_SITE_URL)}<`);
    expect(section).toMatch(/Vocational assessment/);
    expect(section).toMatch(/Life care plan authorship/);
    // The named cards render once, from the one component allowed to name
    // them, and link the verified sister service pages (the vocational site's
    // /services/vocational-evaluation alias answers 404).
    expect(html.match(/aria-labelledby="cross-sell-heading"/g)?.length).toBe(1);
    expect(html).toContain(`href="${VOC_SERVICE_URL}"`);
    expect(html).toContain(`href="${LCP_SERVICE_URL}"`);
    expect(html).not.toContain("/services/vocational-evaluation");
  });

  it("explains how counsel retains each practice and how one intake starts a combined engagement, from the shared copy module", () => {
    for (const phrase of ["Retain the economics practice", "Retain the vocational practice", "Retain the life care planning practice"]) {
      expect(section, phrase).toContain(phrase);
    }
    expect(text).toMatch(/retained under its own engagement agreement and bills its own work/);
    expect(text).toMatch(/starts with one intake/);
    expect(section).toContain(`href="mailto:${ORG_EMAIL}"`);
    expect(section).toContain('href="/contact"');
    // The routing claim is the documented one (the shared intake inbox,
    // brand.ts and the lead mailer; own engagement agreements, services.ts):
    // no per-practice conflict-check workflow the repository does not record.
    expect(text).toMatch(/reaches an intake inbox shared with the sister practices/);
    expect(text).toMatch(/each practice that takes part is engaged under its own agreement/);
    expect(text).not.toMatch(/its own conflict check, scope, and engagement agreement/);
    expect(text).toMatch(/reconcile with one another/);
    // Every sentence comes from src/data/intake.ts, which the static shell prints too.
    expect(section).toContain(FAMILY_SECTION.heading);
    for (const s of FAMILY_SECTION_TEXT) expect(text, s).toContain(s.trim());
  });

  it("stays inside the brand and copy guards outside the CrossSell card", () => {
    // The visible host labels and the intake address derive from brand.ts
    // (hostOf(VOC_SITE_URL), hostOf(LCP_SITE_URL), ORG_EMAIL), the way the
    // Footer prints them; with those removed no sister form may remain.
    const body = [hostOf(VOC_SITE_URL), hostOf(LCP_SITE_URL), ORG_EMAIL].reduce(
      (s, derived) => s.split(derived).join(""),
      visibleText(withoutJsonLd(withoutCrossSell(html))),
    );
    expect(body).not.toMatch(LEGACY_BRAND_PATTERN);
    expect(body).not.toMatch(OFF_BRAND);
    expect(html).not.toMatch(/[–—]/);
    expect(body).not.toMatch(/\d+\+ (years|cases|reports)/i);
    // The entity sentence and the practice links the core render test pins stay put.
    expect(html).toContain(`${ORG_NAME} is the trade name of`);
    for (const href of ["/team", "/services", "/case-studies", "/resources/faq", "/credentials"]) {
      expect(html, href).toContain(`href="${href}"`);
    }
  });
});

// F06 and the F08 /contact item: the contact form once said "We do not share
// inquiries with third parties" while the inbox it reaches (ORG_EMAIL in
// brand.ts; lib/lead-mailer.server.mjs DEFAULT_LEAD_RECIPIENTS) is the one the
// affiliated practices share, and /about then described that shared intake.
// One module (src/data/intake.ts) now feeds the contact form, the
// consultation form, /about, and the privacy policy, so the four agree.
// The forms render the note's closing "Privacy Policy" as a link, and
// visibleText() puts a delimiter at every tag, so the note is matched up to the
// link and the link itself is checked in the markup.
const NOTE_BEFORE_LINK = INTAKE_DISCLOSURE.slice(0, INTAKE_DISCLOSURE.lastIndexOf(INTAKE_POLICY_LINK_TEXT)).trim();
const POLICY_LINK = /<a[^>]*href="\/privacy"[^>]*>Privacy Policy<\/a>/;

describe("inquiry routing: the contact form, the consultation form, /about, and the privacy policy agree (F06)", () => {
  it("the contact form discloses the shared intake inbox and no longer disclaims third-party sharing", () => {
    const text = visibleText(withoutJsonLd(renderRoute("/contact", "/contact", Contact)));
    expect(text).toContain(NOTE_BEFORE_LINK);
    expect(text).not.toMatch(/We do not share inquiries with third parties/);
    // 2026-09-18: nor the later "not shared outside that family" claim, which
    // the hosting and email vendors made untrue; the note links the policy.
    expect(text).not.toMatch(/not shared outside/);
    expect(text).toMatch(/We do not sell inquiries or share them for marketing\./);
    expect(renderRoute("/contact", "/contact", Contact)).toMatch(POLICY_LINK);
    expect(text).toContain(ORG_EMAIL);
  });

  it("the consultation form carries the same note", () => {
    const text = visibleText(withoutJsonLd(renderRoute("/schedule-consultation", "/schedule-consultation", ScheduleConsultation)));
    expect(FORM_INTAKE_NOTE).toBe(INTAKE_DISCLOSURE);
    expect(text).toContain(NOTE_BEFORE_LINK);
    expect(renderRoute("/schedule-consultation", "/schedule-consultation", ScheduleConsultation)).toMatch(POLICY_LINK);
  });

  it("the privacy policy's sharing section states the same routing, in the shared module and on the page", () => {
    const sharing = privacySections.find((s) => s.heading === PRIVACY_SHARING_HEADING)!;
    expect(INTAKE_DISCLOSURE.startsWith(INTAKE_ROUTING)).toBe(true);
    expect(sharing.content).toContain(INTAKE_ROUTING);
    expect(sharing.content).toMatch(/shared with one of those affiliated practices when a matter calls for its discipline/);
    expect(sharing.content).toMatch(/retained under its own engagement agreement/);
    const text = visibleText(renderRoute("/privacy", "/privacy", Privacy));
    expect(text).toContain(INTAKE_ROUTING);
  });

  it("/about describes the same intake and names no routing the other pages do not", () => {
    const text = visibleText(withoutJsonLd(renderRoute("/about", "/about", About)));
    expect(text).toMatch(/reaches an intake inbox shared with the sister practices/);
    expect(INTAKE_DISCLOSURE).toMatch(/intake inbox shared with our affiliated vocational and life care planning practices/);
    expect(INTAKE_DISCLOSURE).not.toMatch(LEGACY_BRAND_PATTERN);
    expect(INTAKE_DISCLOSURE).not.toMatch(OFF_BRAND);
  });
});

describe("/case-studies: pre-retention confidentiality wording (F06)", () => {
  const html = renderRoute("/case-studies", "/case-studies", CaseStudies);
  const text = visibleText(withoutJsonLd(html));

  it("says pre-retention communications are handled confidentially and leaves work-product protection to the retention and the forum", () => {
    expect(text).toMatch(/Every matter opens with a conflict check\./);
    expect(text).toMatch(/Pre-retention communications are handled confidentially/);
    expect(text).toMatch(/depends on the terms of the retention and the rules of the forum/);
    expect(text).not.toMatch(/treated as confidential consulting-expert work product/);
    expect(html).not.toMatch(/[–—]/);
  });

  it("keeps the anonymized composite narratives the static shell reads from the source", () => {
    expect(text).toContain("anonymized composites");
    expect(html.match(/Illustrative engagement/g)?.length).toBe(3);
  });
});
