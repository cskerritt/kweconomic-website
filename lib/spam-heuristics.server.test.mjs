import { describe, it, expect } from "vitest";
import { gibberishSignals, checkSpam } from "./spam-heuristics.server.mjs";

// The two real, token-carrying-capable spam payloads received 2026-07-21
// (arrived tokenless, now blocked by Turnstile strict mode; kept here as the
// canonical gibberish fixtures for the next layer). Both must trip >=2 signals.
const SPAM_1 = {
  name: "EpDenjfTzfrRkhbCKSE eRStXqxIkBoHGNiktYx",
  email: "ra.dt.e.c.hm.om.o@gmail.com",
  message: "pPkwRavJMtaDEkeROkKcxBg",
};
const SPAM_2 = {
  name: "lOsctdwBlPlxACdyvEhWwY MBHPEidLTNlzTWbQgrkNZNmn",
  email: "y.as.az.i.qo.30.5@gmail.com",
  message: "hTrzFLcsDjRflKQiqVLI",
};

// Real leads and legitimate names that MUST NOT be flagged. These are the
// false-positive guards: several sit deliberately close to a threshold
// (Krzysztof Wszebor is 0.25 vowel density vs the 0.22 floor; Sharon
// McDonald-DiMaggio has 2 mid-word caps vs the 3 threshold; Deepankar Das is a
// real 2026-07-18 gmail lead with 1 local-part dot vs the 4-dot floor).
const LEGIT = [
  { name: "Krzysztof Wszebor", email: "kw@lawfirm.com", message: "Need an earning capacity evaluation for an upcoming trial." },
  { name: "Nguyen Thi Minh", email: "nguyen.tm@example.com", message: "Requesting a vocational assessment for a client." },
  { name: "Sharon McDonald-DiMaggio", email: "sharon@example.org", message: "Please call about a life care plan for a client." },
  { name: "Deepankar Das", email: "deepankar.das@gmail.com", message: "Hi, I would like to discuss earning capacity assessment" },
];

// Dense-but-real surnames that legitimately trip ONE signal (a >=5 consonant
// run) but must never reach the 2-signal quarantine floor: the vowel-starved
// signal is computed on the name MINUS the run token, so a single dense token
// cannot double-count (reviewer finding, 2026-07-21).
const BORDERLINE = [
  { name: "Hans Pfingstl", email: "hp@kanzlei-pfingstl.de", message: "We need a forensic economics report." },
  { name: "Krystof Pfingstl", email: "kp@example.com", message: "Vocational expert needed for a hearing." },
];

describe("gibberishSignals", () => {
  it("trips at least name-consonant-run and name-case-chaos on the real spam names", () => {
    const s1 = gibberishSignals(SPAM_1);
    expect(s1).toContain("name-consonant-run");
    expect(s1).toContain("name-case-chaos");
    const s2 = gibberishSignals(SPAM_2);
    expect(s2).toContain("name-consonant-run");
    expect(s2).toContain("name-case-chaos");
  });

  it("flags a dot-salad gmail local part (>=4 dots)", () => {
    expect(gibberishSignals({ name: "John Smith", email: "j.o.h.n.smith@gmail.com" })).toEqual(["email-dot-salad"]);
  });

  it("does not flag a 3-dot gmail address (below the 4-dot floor)", () => {
    expect(gibberishSignals({ name: "John Smith", email: "first.middle.last.jr@gmail.com" })).toEqual([]);
  });

  it("treats y as a vowel so real Slavic names are not vowel-starved", () => {
    expect(gibberishSignals({ name: "Krzysztof Wszebor" })).toEqual([]);
  });

  it("returns no signals for every legitimate lead", () => {
    for (const lead of LEGIT) {
      expect(gibberishSignals(lead)).toEqual([]);
    }
  });

  it("caps a dense-but-real surname at one signal (no vowel-starved double-count)", () => {
    for (const lead of BORDERLINE) {
      expect(gibberishSignals(lead)).toEqual(["name-consonant-run"]);
    }
  });

  it("flags a single-token gibberish message (no spaces, mid-word caps)", () => {
    expect(gibberishSignals({ name: "John Smith", message: "hTrzFLcsDjRflKQiqVLI" })).toContain("message-gibberish");
  });

  it("does not throw on missing or non-string fields", () => {
    expect(gibberishSignals()).toEqual([]);
    expect(gibberishSignals({})).toEqual([]);
    expect(gibberishSignals({ name: null, email: undefined, message: 12345 })).toEqual([]);
  });
});

describe("checkSpam", () => {
  it("quarantines the two real spam payloads on gibberish (>=2 signals)", () => {
    const v1 = checkSpam(SPAM_1);
    expect(v1.spam).toBe(true);
    expect(v1.reasons.length).toBeGreaterThanOrEqual(2);
    const v2 = checkSpam(SPAM_2);
    expect(v2.spam).toBe(true);
    expect(v2.reasons.length).toBeGreaterThanOrEqual(2);
  });

  it("quarantines on a filled honeypot regardless of an otherwise-clean payload", () => {
    const clean = LEGIT[0];
    expect(checkSpam({ ...clean, company_website: "http://spam.example" })).toEqual({ spam: true, reasons: ["honeypot"] });
  });

  it("honeypot short-circuits before the gibberish signals run", () => {
    // A filled honeypot yields exactly ["honeypot"], never the gibberish ids,
    // even when the rest of the payload would also trip signals.
    expect(checkSpam({ ...SPAM_1, company_website: "x" })).toEqual({ spam: true, reasons: ["honeypot"] });
  });

  // Regression: 2026-08-25, Ruby Khallouf (Florio Perrucci) submitted the
  // unified intake 4x from Edge; the browser autofilled the offscreen
  // company_website honeypot with her firm name and every submission was
  // silently quarantined. A honeypot value that is the submitter's own firm is
  // browser autofill, not a bot: soft signal only, never a lone quarantine.
  it("downgrades a honeypot filled with the submitter's own firm name (browser autofill) to a soft signal", () => {
    const v = checkSpam({
      name: "Ruby Khallouf",
      email: "rkhallouf@floriolaw.com",
      retainingFirm: "Florio Perrucci Steinhardt Cappelli & Tipton, LLC ",
      company_website: "Florio Perrucci Steinhardt Cappelli Tipton & Taylor",
    });
    expect(v).toEqual({ spam: false, reasons: ["honeypot-autofill"] });
  });

  it("matches the autofill tell against `firm` too (contact/consultation shapes)", () => {
    expect(checkSpam({ ...LEGIT[0], firm: "Epstein Ostrove LLC", company_website: "Epstein Ostrove" })).toEqual({
      spam: false,
      reasons: ["honeypot-autofill"],
    });
  });

  it("still quarantines a honeypot value that does not match the submitter's firm", () => {
    expect(checkSpam({ ...LEGIT[0], retainingFirm: "Smith & Jones LLP", company_website: "https://buy-seo.example" })).toEqual({
      spam: true,
      reasons: ["honeypot"],
    });
    // No firm on the payload at all -> nothing to match -> hard honeypot.
    expect(checkSpam({ name: "Jane Roe", email: "jane@example.com", company_website: "Acme Corp" })).toEqual({
      spam: true,
      reasons: ["honeypot"],
    });
  });

  it("autofill soft signal still counts toward the >=2 gibberish threshold", () => {
    const v = checkSpam({ ...SPAM_1, retainingFirm: "Zzq Ltd", company_website: "Zzq Ltd" });
    expect(v.spam).toBe(true);
    expect(v.reasons).toContain("honeypot-autofill");
  });

  it("ignores a whitespace-only honeypot value (trimmed)", () => {
    expect(checkSpam({ ...LEGIT[0], company_website: "   " })).toEqual({ spam: false, reasons: [] });
  });

  it("does not quarantine any legitimate lead", () => {
    for (const lead of LEGIT) {
      expect(checkSpam(lead)).toEqual({ spam: false, reasons: [] });
    }
    for (const lead of BORDERLINE) {
      expect(checkSpam(lead).spam).toBe(false);
    }
  });

  it("does not quarantine a single-word rush message with a normal name", () => {
    expect(checkSpam({ name: "John Smith", email: "js@firm.com", message: "URGENT" })).toEqual({ spam: false, reasons: [] });
  });

  it("passes through a single-signal payload (below the 2-signal threshold)", () => {
    const v = checkSpam({ name: "John Smith", email: "j.o.h.n.smith@gmail.com" });
    expect(v.spam).toBe(false);
    expect(v.reasons).toEqual(["email-dot-salad"]);
  });

  it("returns a not-spam verdict for an empty payload", () => {
    expect(checkSpam()).toEqual({ spam: false, reasons: [] });
    expect(checkSpam({})).toEqual({ spam: false, reasons: [] });
  });
});
