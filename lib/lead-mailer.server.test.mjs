import { describe, expect, it } from "vitest";
import { buildLeadEmail, buildAckEmail, sendLeadEmail, sanitizeName, DEFAULT_LEAD_FROM, DEFAULT_LEAD_RECIPIENTS } from "./lead-mailer.server.mjs";

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
    expect(buildLeadEmail("consultation", { email: "x@y.co" }).subject).toBe(
      "[KW LCP] New consultation lead: x@y.co",
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

describe("sanitizeName (ack-email reflector hardening)", () => {
  it("strips CR/LF, URLs, collapses whitespace, and caps at 80 characters", () => {
    expect(sanitizeName("Ann\r\nAttorney")).toBe("Ann Attorney");
    expect(sanitizeName("Visit https://evil.example/login now")).toBe("Visit now");
    expect(sanitizeName("see www.evil.example for a prize")).toBe("see for a prize");
    expect(sanitizeName("  lots    of \t space ")).toBe("lots of space");
    expect(sanitizeName("x".repeat(500))).toHaveLength(80);
    expect(sanitizeName(undefined)).toBe("");
    expect(sanitizeName(42)).toBe("42");
  });

  it("is applied to the ack greeting and the lead subject", () => {
    const hostile = { ...lead, name: "Dear user\r\nClick https://evil.example/reset now " + "!".repeat(200) };
    const ack = buildAckEmail("consultation", hostile);
    expect(ack.text.split("\n")[0]).not.toMatch(/https?:\/\/|www\./);
    expect(ack.text).not.toMatch(/Dear user\r?\n/);
    expect(ack.text.split("\n")[0]).toBe(`Hello ${sanitizeName(hostile.name)},`);
    const { subject } = buildLeadEmail("contact", hostile);
    expect(subject).not.toMatch(/https?:\/\/|\r|\n/);
    expect(subject.length).toBeLessThan(140);
  });
});

describe("LEAD_FROM / LEAD_RECIPIENTS env fallbacks", () => {
  const saved = { from: process.env.LEAD_FROM, to: process.env.LEAD_RECIPIENTS };
  const restore = () => {
    for (const [k, v] of [["LEAD_FROM", saved.from], ["LEAD_RECIPIENTS", saved.to]]) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
  };

  it("an empty-string LEAD_FROM / LEAD_RECIPIENTS falls back to the defaults (no from:'' 422)", async () => {
    process.env.LEAD_FROM = "";
    process.env.LEAD_RECIPIENTS = "";
    try {
      const calls = [];
      const fetchImpl = async (url, init) => { calls.push(JSON.parse(init.body)); return { ok: true, json: async () => ({ id: "m1" }) }; };
      const r = await sendLeadEmail("contact", lead, { apiKey: "k", fetch: fetchImpl });
      expect(r.ok).toBe(true);
      expect(calls[0].from).toBe(DEFAULT_LEAD_FROM);
      expect(calls[0].from).not.toBe("");
      expect(calls[0].to).toEqual(DEFAULT_LEAD_RECIPIENTS.split(","));
    } finally {
      restore();
    }
  });
});
