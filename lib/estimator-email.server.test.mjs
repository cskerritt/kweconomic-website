import { describe, it, expect, vi } from "vitest";
import { buildEstimatorEmail, dispatchEstimatorEmail, scenarioFromSubmission } from "./estimator-email.server.mjs";
import { DEMO_SCENARIO } from "./damages-estimate.mjs";

const LEAD = {
  name: "Jane Sample",
  firm: "Sample & Partners LLP",
  email: "jane@firm.example",
  ...DEMO_SCENARIO,
};

describe("scenarioFromSubmission", () => {
  it("whitelists numeric fields and drops everything else", () => {
    const s = scenarioFromSubmission({ ...LEAD, evil: "<script>", annualIncome: "72000" });
    expect(s.annualIncome).toBe(72000);
    expect("evil" in s).toBe(false);
    expect("email" in s).toBe(false);
  });
});

describe("buildEstimatorEmail", () => {
  it("recomputes the estimate server-side (ignores client-sent totals)", () => {
    const msg = buildEstimatorEmail({ ...LEAD, totalEconomicDamages: 999999999 });
    // golden demo midpoint appears; the bogus client total does not
    expect(msg.html).toContain("$3,831,224");
    expect(msg.html).not.toContain("999,999,999");
  });

  it("carries the planning range in the subject and the disclaimer in the body", () => {
    const msg = buildEstimatorEmail(LEAD);
    expect(msg.subject).toContain("$3,256,541");
    expect(msg.subject).toContain("$4,597,469");
    expect(msg.html).toContain("not an expert opinion");
    expect(msg.html).toContain("plaintiff or defense");
  });

  it("uses the KWVRS sender identity with replies to the firm inbox", () => {
    const msg = buildEstimatorEmail(LEAD, {});
    expect(msg.from).toBe("KWVRS <intake@info.kwvrs.com>");
    expect(msg.replyTo).toBe("info@kwvrs.com");
    expect(msg.to).toBe("jane@firm.example");
  });

  it("escapes HTML in the attorney-supplied name", () => {
    const msg = buildEstimatorEmail({ ...LEAD, name: "<img src=x>" });
    expect(msg.html).not.toContain("<img src=x>");
    expect(msg.html).toContain("&lt;img src=x&gt;");
  });

  it("returns null for an invalid email or engine-rejected inputs", () => {
    expect(buildEstimatorEmail({ ...LEAD, email: "nope" })).toBeNull();
    expect(buildEstimatorEmail({ ...LEAD, discountRate: -1 })).toBeNull();
  });
});

describe("dispatchEstimatorEmail", () => {
  it("sends via the injected mailer and reports success", async () => {
    const send = vi.fn(async () => ({ ok: true, id: "e1" }));
    const res = await dispatchEstimatorEmail(LEAD, { sendEmail: send });
    expect(send).toHaveBeenCalledTimes(1);
    expect(res.sent).toBe(true);
  });

  it("never throws on mailer failure", async () => {
    const send = vi.fn(async () => ({ ok: false, error: "boom" }));
    const res = await dispatchEstimatorEmail(LEAD, { sendEmail: send });
    expect(res).toEqual({ sent: false, reason: "boom" });
  });

  it("skips invalid submissions without calling the mailer", async () => {
    const send = vi.fn();
    const res = await dispatchEstimatorEmail({ email: "bad" }, { sendEmail: send });
    expect(send).not.toHaveBeenCalled();
    expect(res.reason).toBe("invalid-input");
  });
});
