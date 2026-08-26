/**
 * Lead-form spam heuristics (pure, dependency-free).
 *
 * The second anti-spam layer behind Cloudflare Turnstile: a hidden-honeypot
 * check plus lightweight gibberish scoring for bots that DO solve Turnstile.
 * The server's generic API handler calls checkSpam after validation and
 * QUARANTINES (stores + flags, no emails, no case) any submission it flags -
 * never a hard reject, so a false positive is recoverable and a real bot sees
 * the normal success body.
 *
 * Lives in lib/ (beside intake-schema.mjs) because the production Docker image
 * ships lib/, not scripts/ or src/. Node built-ins only - never import a
 * third-party module here.
 *
 * Scoring rules (all case-insensitive; y counts as a vowel throughout; only
 * [a-zA-Z] count as letters, so digits/punctuation/spaces break a run):
 *   - name-consonant-run : a >=7-char name token with a >=5 consonant run
 *   - name-case-chaos    : >=3 mid-word lower->upper transitions across the name
 *   - name-vowel-starved : a >=8-letter name under 22% vowels
 *   - email-dot-salad    : a gmail/googlemail local part with >=4 dots
 *   - message-gibberish  : a single unspaced >=15-char run that is all
 *                          consonants or has >=3 mid-word caps
 *
 * A honeypot hit alone quarantines - except when the honeypot value is the
 * submitter's own firm name (browser autofill; see honeypotLooksAutofilled),
 * which becomes the soft signal "honeypot-autofill". Gibberish (and that soft
 * signal) needs >=2 independent signals so one quirky-but-real lead never
 * trips the wire.
 */

const VOWEL = /[aeiouy]/i;

// Longest consecutive run of consonant letters in a token. Non-letters reset
// the run so "McDonald-DiMaggio" scores the hyphen-split segments, not the whole.
const maxConsonantRun = (word) => {
  let run = 0;
  let max = 0;
  for (const ch of word) {
    if (/[a-z]/i.test(ch) && !VOWEL.test(ch)) {
      run += 1;
      max = Math.max(max, run);
    } else {
      run = 0;
    }
  }
  return max;
};

// Count of mid-word lower->upper transitions (the "eRStXqx" camel-noise tell).
const midWordCaps = (word) => (word.match(/[a-z][A-Z]/g) || []).length;

/**
 * Independent gibberish signal ids tripped by a submission. Pure: no signal is
 * emitted for a missing field, so a partial payload (e.g. the consultation
 * route posts no `message`) simply scores fewer signals.
 */
export function gibberishSignals({ name = "", email = "", message = "" } = {}) {
  const signals = [];
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  const runWords = words.filter((w) => w.length >= 7 && maxConsonantRun(w) >= 5);
  if (runWords.length) signals.push("name-consonant-run");
  if (words.reduce((n, w) => n + midWordCaps(w), 0) >= 3) signals.push("name-case-chaos");
  // Vowel starvation is judged on the name MINUS any token that already fired
  // the consonant-run signal, so one dense-but-real surname (Pfingstl) cannot
  // double-count into two signals by itself; a fully gibberish name still fires
  // both because its OTHER tokens are vowel-starved too.
  const vowelBasis = words.filter((w) => !runWords.includes(w)).join("");
  const alpha = vowelBasis.replace(/[^a-zA-Z]/g, "");
  if (alpha.length >= 8 && (alpha.match(/[aeiouy]/gi) || []).length / alpha.length < 0.22) signals.push("name-vowel-starved");
  const m = String(email).toLowerCase().match(/^([^@]+)@(gmail|googlemail)\.com$/);
  if (m && (m[1].match(/\./g) || []).length >= 4) signals.push("email-dot-salad");
  const msg = String(message).trim();
  if (msg && !/\s/.test(msg) && msg.length >= 15 && (midWordCaps(msg) >= 3 || !VOWEL.test(msg))) signals.push("message-gibberish");
  return signals;
}

// Alphanumeric tokens of a firm-ish string, minus legal-entity noise, so
// "Florio Perrucci Steinhardt Cappelli & Tipton, LLC" and the autofilled
// "Florio Perrucci Steinhardt Cappelli Tipton & Taylor" compare on real words.
const ENTITY_NOISE = new Set(["llc", "llp", "pc", "pa", "pllc", "inc", "ltd", "co", "the", "and", "of", "law", "firm", "esq"]);
const firmTokens = (s) =>
  new Set(
    String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((t) => t.length >= 2 && !ENTITY_NOISE.has(t)),
  );

/**
 * True when the honeypot value is the submitter's own firm name: browser
 * autofill (Edge/Chrome "organization" heuristic, which ignores
 * autocomplete="off") filled it, not a bot. Requires >=2 shared substantive
 * tokens, or every token of the shorter side, so "Acme" vs "Acme Corp" and
 * long multi-partner names both match while unrelated strings do not.
 * Regression 2026-08-25: a real defense attorney's 4 intake submissions were
 * silently quarantined this way.
 */
export function honeypotLooksAutofilled(data = {}) {
  const hp = firmTokens(data.company_website);
  if (!hp.size) return false;
  for (const field of ["retainingFirm", "firm", "firmName", "company", "organization"]) {
    const own = firmTokens(data[field]);
    if (!own.size) continue;
    let shared = 0;
    for (const t of hp) if (own.has(t)) shared += 1;
    if (shared >= 2 || shared === Math.min(hp.size, own.size)) return true;
  }
  return false;
}

/**
 * Spam verdict for a lead payload: a filled honeypot (`company_website`)
 * short-circuits to a certain quarantine - UNLESS the value is the submitter's
 * own firm name (browser autofill), which downgrades to the soft signal
 * "honeypot-autofill" and counts like any other gibberish signal toward the
 * >=2 threshold. Returns { spam, reasons } where reasons drives the _spam marker.
 */
export function checkSpam(data = {}) {
  const honeypotFilled = String(data.company_website || "").trim() !== "";
  if (honeypotFilled && !honeypotLooksAutofilled(data)) return { spam: true, reasons: ["honeypot"] };
  const reasons = honeypotFilled ? ["honeypot-autofill"] : [];
  reasons.push(...gibberishSignals(data));
  return { spam: reasons.length >= 2, reasons };
}
