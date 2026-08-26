// Server-side Cloudflare Turnstile verification for the public form endpoints.
// Deliberately FAIL-OPEN: a real lead is never dead-ended by an anti-spam
// check. We only reject when Turnstile is fully configured (a secret is set AND
// the client sent a token) and Cloudflare reports the token invalid. Missing
// secret, missing token, or any network/parse error -> accept (with a reason
// the caller can log). The IP rate-limit in server.js stays the real backstop.
const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token, { secret, fetchImpl = fetch, remoteip, requireToken = false } = {}) {
  if (!secret) return { ok: true, skipped: "no-secret" };
  // Strict mode (TURNSTILE_REQUIRE_TOKEN): every live form renders the widget,
  // so a tokenless POST can only be a direct-to-API submission - reject it.
  // Network/parse errors below still fail open either way.
  if (!token) return requireToken ? { ok: false, reason: "missing-token" } : { ok: true, skipped: "no-token" };
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteip) body.set("remoteip", remoteip);
    const res = await fetchImpl(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await res.json();
    return data && data.success ? { ok: true } : { ok: false, reason: "verification-failed" };
  } catch (err) {
    return { ok: true, skipped: "error", error: err.message };
  }
}

// Pure, redacted one-line summary of the Turnstile config for the startup log.
// Never prints key material - only whether each key is present. The SITE key is
// public (baked into the build) and the SECRET is server-side; this line lets an
// operator confirm fail-open vs fail-closed posture from the boot logs.
export function turnstileStartupState({ siteKey, secret } = {}) {
  const hasSite = typeof siteKey === "string" && siteKey.trim().length > 0;
  const hasSecret = typeof secret === "string" && secret.trim().length > 0;
  const sitePart = hasSite ? "site_key=baked" : "site_key=MISSING";
  const secretPart = hasSecret ? "secret=set" : "secret=UNSET (fail-open)";
  return `turnstile: ${sitePart} ${secretPart}`;
}
