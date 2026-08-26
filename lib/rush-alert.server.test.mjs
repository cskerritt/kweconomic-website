import { describe, expect, it, vi } from "vitest";
import {
  isRush, rushRecipients, buildTeamRushEmail, buildAttorneyAckEmail, dispatchRushAlerts,
} from "./rush-alert.server.mjs";

const SUB = { name: "Jane Smith", email: "jane@firm.com", phone: "(201) 555-0100", caseType: "Personal Injury", message: "Trial in 3 weeks <need> vocational eval", priority: "rush" };

describe("isRush", () => {
  it("detects the rush flag case-insensitively; ignores anything else", () => {
    expect(isRush({ priority: "rush" })).toBe(true);
    expect(isRush({ priority: "RUSH" })).toBe(true);
    expect(isRush({ priority: "normal" })).toBe(false);
    expect(isRush({})).toBe(false);
    expect(isRush(null)).toBe(false);
  });
});
describe("rushRecipients", () => {
  it("parses RUSH_RECIPIENTS, else defaults to the 5", () => {
    expect(rushRecipients({ RUSH_RECIPIENTS: "a@x.co, b@x.co" })).toEqual(["a@x.co", "b@x.co"]);
    expect(rushRecipients({})).toEqual(["dw@kwvrs.com", "jw@kwvrs.com", "mp@kwvrs.com", "sh@kwvrs.com", "pb@kwvrs.com"]);
  });
});
describe("buildTeamRushEmail", () => {
  it("targets recipients, tags the subject RUSH, escapes the body, and replies to the attorney", () => {
    const msg = buildTeamRushEmail(SUB, {});
    expect(msg.to).toContain("dw@kwvrs.com");
    expect(msg.subject).toMatch(/RUSH/);
    expect(msg.subject).toMatch(/Jane Smith/);
    expect(msg.replyTo).toBe("jane@firm.com");
    expect(msg.html).toContain("jane@firm.com");
    expect(msg.html).toContain("&lt;need&gt;");   // message HTML-escaped
    expect(msg.html).not.toContain("<need>");
  });
});
describe("buildAttorneyAckEmail", () => {
  it("acks the submitter and includes the direct line", () => {
    const msg = buildAttorneyAckEmail(SUB, {});
    expect(msg.to).toBe("jane@firm.com");
    expect(msg.html).toContain("(201) 343-0700");
    expect(msg.html).toContain("info@kwvrs.com");
  });
  it("returns null when the submitter email is invalid", () => {
    expect(buildAttorneyAckEmail({ ...SUB, email: "nope" }, {})).toBeNull();
  });
});
describe("dispatchRushAlerts", () => {
  it("sends the team alert and the attorney ack via the injected sender", async () => {
    const send = vi.fn(async () => ({ ok: true, id: "e1" }));
    const res = await dispatchRushAlerts(SUB, { sendEmail: send, env: {} });
    expect(send).toHaveBeenCalledTimes(2);
    expect(res.team.ok).toBe(true);
    expect(res.ack.ok).toBe(true);
  });
  it("never throws even if the sender throws", async () => {
    const send = vi.fn(async () => { throw new Error("boom"); });
    await expect(dispatchRushAlerts(SUB, { sendEmail: send, env: {} })).resolves.toBeTruthy();
  });
  it("skips the ack (only team) when the submitter email is invalid", async () => {
    const send = vi.fn(async () => ({ ok: true }));
    const res = await dispatchRushAlerts({ ...SUB, email: "nope" }, { sendEmail: send, env: {} });
    expect(send).toHaveBeenCalledTimes(1);
    expect(res.ack.ok).toBe(false);
  });
});
