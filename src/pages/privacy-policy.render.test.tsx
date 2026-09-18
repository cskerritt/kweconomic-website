import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import Privacy from "./Privacy";
import Contact from "./Contact";
import ScheduleConsultation from "./ScheduleConsultation";
import WhitePaperGate from "@/components/WhitePaperGate";
import AnalyticsOptOut from "@/components/AnalyticsOptOut";
import PrivacyNotice from "@/components/PrivacyNotice";
import { isTurnstileConfigured } from "@/components/Turnstile";
import { isAnalyticsConfigured } from "@/lib/analytics";
import { whitePapers } from "@/data/whitePapers";
import {
  PRIVACY_BUILD_FLAGS,
  PRIVACY_CHOICES_HEADING,
  PRIVACY_SHARING_HEADING,
  buildPrivacySections,
  privacySections,
  type PrivacyFlags,
} from "@/data/legal-policies";
import { renderRoute, visibleText } from "@/test-utils/markup";

// The privacy policy (2026-09-18 rewrite, draft for counsel). The statements
// that depend on the build - Google Analytics, Cloudflare Turnstile - are
// rendered from the build flags, so both branches of each are pinned here.

const render = (flags: PrivacyFlags) =>
  renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: ["/privacy"] }, createElement(Privacy, { flags })));
const textFor = (flags: PrivacyFlags) => visibleText(render(flags));
const allText = (flags: PrivacyFlags) =>
  buildPrivacySections(flags)
    .map((s) => `${s.heading}\n${s.content}`)
    .join("\n");

const OFF: PrivacyFlags = { analytics: false, turnstile: false };
const ON: PrivacyFlags = { analytics: true, turnstile: true };
const EVERY: PrivacyFlags[] = [OFF, ON, { analytics: true, turnstile: false }, { analytics: false, turnstile: true }];

describe("privacy policy: build-conditional statements", () => {
  it("the default render follows the real build flags", () => {
    expect(PRIVACY_BUILD_FLAGS).toEqual({ analytics: isAnalyticsConfigured(), turnstile: isTurnstileConfigured() });
    expect(privacySections).toEqual(buildPrivacySections(PRIVACY_BUILD_FLAGS));
    const html = renderRoute("/privacy", "/privacy", Privacy);
    for (const s of privacySections) expect(visibleText(html)).toContain(s.heading);
  });

  it("with analytics not configured: says no analytics or advertising cookies, names no Google cookie, and shows no opt-out control", () => {
    const html = render(OFF);
    const text = visibleText(html);
    expect(text).toContain("This site does not currently use analytics or advertising cookies.");
    expect(text).toContain(
      "We do not track visitors across sites, so Global Privacy Control (GPC) and Do Not Track (DNT) signals do not change how the site behaves; if analytics is later enabled it is not loaded for browsers sending them.",
    );
    expect(text).not.toMatch(/Google Analytics|_ga\b|website analytics \(Google\)/);
    expect(html).not.toContain("<button");
  });

  it("with analytics configured: describes the GA4 cookies, the switched-off advertising features, GPC / DNT, and renders the opt-out control", () => {
    const html = render(ON);
    const text = visibleText(html);
    expect(text).toMatch(/Google Analytics 4/);
    expect(text).toMatch(/_ga and _ga_ followed by our property identifier, lasting up to two years/);
    expect(text).toMatch(/Google processes this information as our service provider/);
    expect(text).toMatch(/Advertising features, Google signals, and ad personalization are switched off/);
    expect(text).toMatch(/We do not load analytics for browsers that send a Global Privacy Control \(GPC\) or Do Not Track \(DNT\) signal/);
    expect(text).toContain("website analytics (Google)");
    expect(text).not.toContain("This site does not currently use analytics or advertising cookies.");
    expect(html).toMatch(/<button[^>]*type="button"/);
  });

  it("the rendered policy never names Supabase, in any build", () => {
    for (const flags of EVERY) expect(textFor(flags)).not.toMatch(/Supabase/i);
  });

  it("with Turnstile not configured: does not mention Cloudflare", () => {
    expect(textFor(OFF)).not.toMatch(/Cloudflare|Turnstile/);
  });

  it("with Turnstile configured: describes what Cloudflare Turnstile receives and lists it as a provider", () => {
    const text = textFor({ analytics: false, turnstile: true });
    expect(text).toMatch(/Cloudflare Turnstile loads on pages with forms to block automated spam/);
    expect(text).toMatch(/receives your IP address and browser signals/);
    expect(text).toContain("spam protection (Cloudflare)");
  });
});

describe("privacy policy: substance that holds in every build", () => {
  it("prints the effective date and the last revised date", () => {
    const html = render(OFF);
    expect(html).toMatch(/Effective Date: <time dateTime="2025-01-01">January 1, 2025<\/time>/i);
    expect(html).toMatch(/Last revised: <time dateTime="2026-09-18">September 18, 2026<\/time>/i);
  });

  it("carries every required section, in order", () => {
    for (const flags of EVERY) {
      expect(buildPrivacySections(flags).map((s) => s.heading)).toEqual([
        "Information You Give Us",
        "Information Collected Automatically",
        "Cookies and Similar Technologies",
        PRIVACY_CHOICES_HEADING,
        "How We Use Information",
        PRIVACY_SHARING_HEADING,
        "Retention",
        "Privacy Rights and Requests",
        "Health Information",
        "Visitors Outside the United States",
        "Data Security",
        "Third-Party Links",
        "Children's Privacy",
        "Changes to This Policy",
        "Contact Us",
      ]);
    }
  });

  it("states what the code does: IP and user-agent stored with a submission, no first-party cookies, the local-storage flags, no sale", () => {
    for (const flags of EVERY) {
      const text = allText(flags);
      expect(text).toContain("we store the IP address and browser user-agent with that submission for spam and abuse prevention");
      expect(text).toContain("The site itself sets no cookies.");
      expect(text).toContain("a flag remembering that you unlocked a white paper, which holds no identifier");
      expect(text).toContain("no advertising pixels, no session recording, and no cross-site tracking");
      expect(text).toContain("We do not sell personal information, and we do not share it for cross-context behavioral advertising.");
      expect(text).toContain("We respond within 45 days");
      expect(text).toContain("website hosting, including storage of form submissions (Railway), email delivery (Resend)");
      expect(text).toMatch(/You can tell us to stop at any time by replying to the message or emailing \S+@\S+\./);
      expect(text).toContain("permitted to use the information only to provide services to us");
      expect(text).toContain("can include information about other people");
    }
  });

  it("drops the claims the audit found untrue, names no task-management vendor, asserts nothing about HIPAA, and uses no em dash", () => {
    for (const flags of EVERY) {
      const text = allText(flags);
      for (const gone of [
        /Session cookies are used to enable basic site navigation/,
        /If you disable cookies, some features/,
        /anonymize IP addresses/,
        /collected in aggregate/,
        /does not identify individual visitors/,
        /where enabled/,
        /without your separate consent/,
        /subject to appropriate confidentiality agreements/,
        /Asana/i,
        // Off in production (/healthz durableCapture:false); add the provider line before enabling it.
        /Supabase/i,
        // Not verifiable in code: the policy promises a reply / email opt-out instead.
        /unsubscribe/i,
        /HIPAA/i,
        /—/,
      ]) {
        expect(text).not.toMatch(gone);
      }
    }
  });
});

describe("AnalyticsOptOut", () => {
  it("prerenders a harmless static fallback: a disabled, labelled button and a live status line, no browser state read", () => {
    const html = renderToStaticMarkup(createElement(AnalyticsOptOut));
    expect(html).toMatch(/role="status"/);
    expect(html).toMatch(/aria-live="polite"/);
    expect(html).toMatch(/<button[^>]*type="button"[^>]*disabled=""/);
    // State is announced by the live region and the changing button label, not aria-pressed.
    expect(html).not.toContain("aria-pressed");
    expect(visibleText(html)).toContain("Turn analytics off for this browser");
    expect(visibleText(html)).not.toMatch(/Analytics is (on|off) for this browser/);
  });
});

describe("privacy notice at every form", () => {
  const NOTICE = /We use this information to respond to your request\. See our\s*<a[^>]*href="\/privacy"[^>]*>Privacy Policy<\/a>\s*\./;

  it("PrivacyNotice is one line linking /privacy, with no consent wording and no checkbox", () => {
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(PrivacyNotice)));
    expect(html).toMatch(NOTICE);
    expect(html).not.toMatch(/by submitting|you agree|checkbox/i);
  });

  it("the contact form, the consultation form, and the white paper gate each carry it", () => {
    expect(renderRoute("/contact", "/contact", Contact)).toMatch(NOTICE);
    expect(renderRoute("/schedule-consultation", "/schedule-consultation", ScheduleConsultation)).toMatch(NOTICE);
    const gate = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(WhitePaperGate, { paper: whitePapers[0] })),
    );
    expect(gate).toMatch(NOTICE);
  });
});
