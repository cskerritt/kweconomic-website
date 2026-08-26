import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ExpertPicker from "./ExpertPicker";
import { retainableExperts } from "@/data/team";

// Real server render (vitest runs environment: "node", so this is the same
// technique HoneypotField.render.test.tsx uses). The picker is the one place an
// attorney names the expert they want, so the contract guarded here is: every
// retainable expert is offered with a tier badge and a profile link, nobody else
// is, and the control works with a keyboard and on touch (radio group, no hover).
const html = (value = "") => renderToStaticMarkup(createElement(ExpertPicker, { value, onChange: () => {} }));

describe("ExpertPicker render", () => {
  it("puts 'No preference' first, as a real radio with an empty value", () => {
    const out = html();
    expect(out).toContain("No preference - let KWVRS assign");
    expect(out.indexOf("No preference")).toBeLessThan(out.indexOf("Daniel Wolstein"));
    // React's DOM serializer always writes checked immediately before value on an
    // input, so the optional group here is the selected state, not a second radio.
    expect(out).toMatch(/name="retainedExpert"(?: checked="")? value=""/);
  });

  it("offers every retainable expert, and only them", () => {
    const out = html();
    for (const m of retainableExperts()) {
      expect(out, m.slug).toContain(`value="${m.slug}"`);
      expect(out, m.slug).toContain(m.name);
    }
    expect(out).toContain("Sharon Hirsh, M.S.");
    expect(out).not.toContain("Charles A. Kincaid");
    expect(out).not.toContain("Zachary Sperling");
  });

  it("badges two Senior Experts and nine Fellow Experts", () => {
    const out = html();
    expect((out.match(/Senior Expert/g) || []).length).toBe(2);
    expect((out.match(/Fellow Expert/g) || []).length).toBe(9);
  });

  it("links each card to that expert's profile in a new tab", () => {
    const out = html();
    for (const m of retainableExperts()) {
      expect(out, m.slug).toContain(`href="/team/${m.slug}"`);
    }
    expect((out.match(/rel="noopener noreferrer"/g) || []).length).toBe(retainableExperts().length);
    expect((out.match(/View profile/g) || []).length).toBe(retainableExperts().length);
  });

  it("renders the photo, credentials, and specialties on each card", () => {
    const out = html();
    expect(out).toContain('src="/team/daniel-wolstein.jpg"');
    expect(out).toContain('loading="lazy"');
    expect(out).toContain("Ph.D., CRC, CLCP");
    expect(out).toContain("Earning Capacity Analysis");
  });

  it("leaves the portraits alt-empty (the name is already the adjacent label)", () => {
    const out = html();
    // A portrait alt'd with the name makes a screen reader announce the person
    // twice per card - once for the image, once for the name text beside it.
    // The photo carries no information the label does not, so it is decorative.
    const alts = [...out.matchAll(/<img[^>]*\salt="([^"]*)"/g)].map((m) => m[1]);
    expect(alts.length).toBe(retainableExperts().length);
    for (const alt of alts) expect(alt).toBe("");
    // The names themselves are still on the page, as text.
    for (const m of retainableExperts()) expect(out, m.slug).toContain(m.name);
  });

  it("keeps the bio behind a collapsed disclosure (works on touch, no hover)", () => {
    const out = html();
    expect((out.match(/<details/g) || []).length).toBe(retainableExperts().length);
    expect(out).not.toContain("<details open");
    expect(out).not.toContain("hover:block");
  });

  it("checks exactly the selected radio", () => {
    const none = html();
    expect((none.match(/checked=""/g) || []).length).toBe(1); // No preference
    const picked = html("john-may");
    expect((picked.match(/checked=""/g) || []).length).toBe(1);
    const at = picked.indexOf('value="john-may"');
    // checked is serialized BEFORE value on the same tag, so look behind it.
    expect(picked.slice(Math.max(0, at - 60), at)).toContain("checked");
  });
});
