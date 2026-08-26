import { describe, expect, it } from "vitest";
import { buildLeadEmail, buildAckEmail, sendLeadEmail } from "./lead-mailer.server.mjs";

const lead = { name: "Ann Attorney", email: "ann@firm.com", phone: "2015551212", firm: "Firm LLP", message: "TBI plan needed", __submissionId: "abc" };

describe("buildLeadEmail", () => {
  it("formats a contact lead with every non-internal field", () => {
    const { subject, text } = buildLeadEmail("contact", lead);
    expect(subject).toBe("[KW LCP] New contact lead: Ann Attorney");
    expect(text).toContain("name: Ann Attorney");
    expect(text).toContain("message: TBI plan needed");
    expect(text).not.toContain("__submissionId");
    expect(text).not.toContain("turnstileToken");
  });

  it("drops internal/anti-spam keys, blanks, and labels the other lead types", () => {
    const { subject, text } = buildLeadEmail("whitepaper", {
      ...lead,
      turnstileToken: "tok",
      company_website: "",
      _spam: { reasons: [] },
      __clientIp: "1.2.3.4",
      slug: "tbi-guide",
      empty: "   ",
      nothing: null,
    });
    expect(subject).toBe("[KW LCP] New white paper download lead: Ann Attorney");
    expect(text).toContain("slug: tbi-guide");
    for (const bad of ["turnstileToken", "company_website", "_spam", "__clientIp", "empty:", "nothing:"]) {
      expect(text).not.toContain(bad);
    }
    expect(buildLeadEmail("life-expectancy", { email: "x@y.co" }).subject).toBe(
      "[KW LCP] New life expectancy lookup lead: x@y.co",
    );
  });
});

describe("buildAckEmail", () => {
  it("only consultations get an acknowledgement", () => {
    expect(buildAckEmail("contact", lead)).toBeNull();
    expect(buildAckEmail("whitepaper", lead)).toBeNull();
    const ack = buildAckEmail("consultation", lead);
    expect(ack.subject).toMatch(/received your consultation request/i);
    expect(ack.text).toContain("Hello Ann Attorney");
  });
});

describe("sendLeadEmail", () => {
  it("skips cleanly without an API key", async () => {
    const r = await sendLeadEmail("contact", lead, { apiKey: "", recipients: ["a@b.com"] });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/RESEND_API_KEY/);
  });

  it("posts to Resend with recipients, reply-to, and an ack for consultations", async () => {
    const calls = [];
    const fetchImpl = async (url, init) => { calls.push(JSON.parse(init.body)); return { ok: true, json: async () => ({ id: "m1" }) }; };
    const r = await sendLeadEmail("consultation", lead, { apiKey: "k", recipients: ["team@kwlcp.com"], from: "leads@kwlcp.com", fetch: fetchImpl });
    expect(r.ok).toBe(true);
    expect(calls).toHaveLength(2);
    expect(calls[0].to).toEqual(["team@kwlcp.com"]);
    expect(calls[0].from).toBe("leads@kwlcp.com");
    expect(calls[0].reply_to).toBe("ann@firm.com");
    expect(calls[0].subject).toBe("[KW LCP] New consultation lead: Ann Attorney");
    expect(calls[1].to).toEqual(["ann@firm.com"]);
    expect(calls[1].subject).toMatch(/received your consultation request/i);
  });

  it("sends only the team notice for a contact lead (no ack)", async () => {
    const calls = [];
    const fetchImpl = async (url, init) => { calls.push(JSON.parse(init.body)); return { ok: true, json: async () => ({ id: "m1" }) }; };
    const r = await sendLeadEmail("contact", lead, { apiKey: "k", recipients: ["team@kwlcp.com"], fetch: fetchImpl });
    expect(r.ok).toBe(true);
    expect(calls).toHaveLength(1);
  });

  it("reports a Resend rejection without throwing and skips the ack", async () => {
    let calls = 0;
    const fetchImpl = async () => { calls += 1; return { ok: false, status: 422, text: async () => "bad from" }; };
    const r = await sendLeadEmail("consultation", lead, { apiKey: "k", recipients: ["t@kwlcp.com"], fetch: fetchImpl });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/resend 422/);
    expect(calls).toBe(1);
  });
});
