import { createServer } from "http";
import { readFileSync, existsSync, statSync, appendFileSync, mkdirSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { gzipSync } from "zlib";
import { randomUUID } from "node:crypto";
import { validateRoute } from "./validation.server.mjs";
import { verifyTurnstile, turnstileStartupState } from "./turnstile.server.mjs";
import * as rawSubs from "./lib/raw-submissions.server.mjs";
import { checkSpam } from "./lib/spam-heuristics.server.mjs";
import { sendLeadEmail, DEFAULT_LEAD_RECIPIENTS } from "./lib/lead-mailer.server.mjs";
import { resolveLegacyRedirect } from "./lib/legacy-redirects.server.mjs";
import { resolveUndeclaredPairRedirect } from "./lib/service-case-redirects.server.mjs";
import { ORG_NAME, SITE_URL } from "./lib/brand.server.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DIST = join(__dirname, "dist");

// Ensure data directory exists for form submissions
mkdirSync(join(__dirname, "data"), { recursive: true });

// Parse JSON request body (capped so a malicious client can't exhaust memory).
// Rejections carry a `status` so handlers can answer 413/400 instead of 500;
// Node's built-in requestTimeout reaps clients that keep streaming after that.
const MAX_BODY_BYTES = 1024 * 1024;

export function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;
    req.on("data", (chunk) => {
      if (tooLarge) return;
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        tooLarge = true;
        chunks.length = 0;
        reject(Object.assign(new Error("Request body too large"), { status: 413 }));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (tooLarge) return;
      let parsed;
      try {
        // Concatenate the raw Buffers and decode utf8 ONCE, so a multibyte
        // character split across chunk boundaries is not corrupted (a per-chunk
        // toString would decode each half separately into replacement chars).
        parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch {
        reject(Object.assign(new Error("Invalid JSON"), { status: 400 }));
        return;
      }
      // Every /api route expects a JSON object body. Reject null / arrays /
      // primitives with 400 up front, instead of letting a later property
      // access throw and surface as a 500 with an internal message.
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        reject(Object.assign(new Error("Invalid request body"), { status: 400 }));
        return;
      }
      resolve(parsed);
    });
  });
}

// Naive fixed-window rate limit for the form APIs - enough to blunt scripted
// spam without external dependencies. Railway fronts the app with a proxy, so
// the client IP arrives in x-forwarded-for. 10/min/IP by default, GLOBAL to
// every form API.
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateBuckets = new Map();

// Railway fronts the app with a proxy that APPENDS the real client IP to the
// RIGHT of x-forwarded-for. The leftmost entries are client-controllable - a
// spammer could forge a different first hop per request to mint unlimited
// rate-limit buckets - so we trust the rightmost entry (the one the proxy added),
// not the first. Shared by the rate-limiter and the Turnstile remoteip.
export function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    const parts = forwarded.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return req.socket?.remoteAddress || "unknown";
}

function rateLimited(req, max = RATE_LIMIT_MAX) {
  const ip = clientIp(req);
  const now = Date.now();
  if (rateBuckets.size > 10_000) {
    for (const [key, bucket] of rateBuckets) {
      if (now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) rateBuckets.delete(key);
    }
  }
  const bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(ip, { count: 1, windowStart: now });
    // max=0 is a HARD block: even the first request of a fresh window is
    // limited, not trickled through one-per-window.
    return max < 1;
  }
  bucket.count += 1;
  return bucket.count > max;
}

// Save a form submission to JSON Lines file. This is ONLY a belt-and-suspenders
// breadcrumb - the durable path is persistRawSubmission (Supabase) + the lead
// email. A write failure here (e.g. a root-owned Railway volume mounted at
// /app/data while the container runs as the non-root `node` user) must NEVER
// abort the submission, so it is caught and logged, not thrown.
function saveSubmission(type, data) {
  const entry = { type, timestamp: new Date().toISOString(), ...data };
  try {
    appendFileSync(
      join(__dirname, "data", "submissions.jsonl"),
      JSON.stringify(entry) + "\n"
    );
  } catch (err) {
    console.error(`saveSubmission breadcrumb write failed (non-fatal): ${err.message}`);
  }
}

// Durable lead capture: write the submission to Supabase raw_submissions BEFORE
// responding 200, independent of the email. Wrapped so a Supabase outage is
// logged loudly but never throws - the visitor still gets {success:true} and the
// jsonl breadcrumb remains the last-ditch local record. deps are injectable for
// unit testing.
export async function persistRawSubmission(id, type, data, deps = {}) {
  const _rawSubs = deps.rawSubs || rawSubs;
  // deps.forwarded marks the row forwarded AT INSERT TIME. This site has no
  // workflow forward or replay sweep, so every accepted lead is inserted
  // forwarded:true - the email IS the delivery. The key is OMITTED (not sent as
  // false) when unset, mirroring insertRawSubmission's own conditional body.
  const body =
    deps.forwarded === true
      ? { id, type, payload: data, forwarded: true }
      : { id, type, payload: data };
  try {
    await _rawSubs.insertRawSubmission(body);
    return true;
  } catch (err) {
    console.error(
      `DURABLE PERSIST FAILED (${type}) id=${id} email=${data.email || "no-email"}: ${err.message} ` +
        `- jsonl breadcrumb retained; lead NOT in raw_submissions`,
    );
    return false;
  }
}

// Durable QUARANTINE write for a spam-flagged submission. A single atomic
// insert with forwarded:true so the row can never exist in a replayable
// forwarded=false state. Stays queryable by `payload->_spam is not null`. A
// Supabase outage is swallowed (logged) so the bot still gets the normal 200
// and the jsonl breadcrumb remains. deps injectable for unit testing.
export async function persistQuarantined(id, type, data, deps = {}) {
  const _rawSubs = deps.rawSubs || rawSubs;
  try {
    await _rawSubs.insertRawSubmission({ id, type, payload: data, forwarded: true });
    return true;
  } catch (err) {
    console.error(`quarantine persist failed (${type}) id=${id}: ${err.message} - jsonl breadcrumb retained`);
    return false;
  }
}

// Lead delivery: fire-and-forget AFTER the durable write + 200, so a Resend
// outage can never affect the visitor's request or lose the lead (the
// raw_submissions row + jsonl breadcrumb remain). Never rejects. deps
// injectable for unit testing.
export function queueLeadEmail(type, data, deps = {}) {
  const send = deps.send || sendLeadEmail;
  return Promise.resolve()
    .then(() => send(type, data))
    .then((r) => {
      if (!r.ok) console.error(`lead email failed for ${type} ${data.__submissionId}: ${r.error}`);
      return r;
    })
    .catch((err) => {
      console.error(`lead email threw for ${type}: ${err.message}`);
      return { ok: false, error: err.message };
    });
}

// Form submission routes: type tag written to submissions.jsonl / raw_submissions
// plus the fields a request must include. Every route is a human-facing lead
// form, so every route is Turnstile-gated.
export const API_ROUTES = {
  "/api/contact": {
    type: "contact",
    required: ["name", "email", "phone", "message"],
    requiredMessage: "name, email, phone, and message are required",
    turnstile: true,
  },
  "/api/consultation": {
    type: "consultation",
    required: ["name", "email"],
    requiredMessage: "name and email are required",
    turnstile: true,
  },
  "/api/whitepaper": {
    type: "whitepaper",
    required: ["name", "email", "slug"],
    requiredMessage: "name, email, and slug are required",
    turnstile: true,
  },
};

// CORS headers for API responses
const API_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const COMPRESSIBLE = new Set([
  "text/html",
  "application/javascript",
  "text/css",
  "application/json",
  "image/svg+xml",
  "application/xml",
  "text/plain",
  "text/markdown",
]);

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Railway serves the site over HTTPS only; browsers ignore HSTS on plain
  // HTTP (local Docker testing), so this is a no-op outside production.
  "Strict-Transport-Security": "max-age=31536000",
  // Defense-in-depth CSP. The site is a prerendered SPA: fonts are self-hosted
  // (public/fonts/), so the only external origins are Cloudflare Turnstile (script +
  // challenge iframe) and Google Analytics, both dormant until their build args
  // are set, and the only inline JS is the tiny `js`-class bootstrap +
  // per-page JSON-LD - so script/style allow 'unsafe-inline' (a nonce-per-page
  // scheme isn't workable for the static prerender). object-src/base-uri/
  // form-action/frame-ancestors are locked down to blunt injection + clickjacking.
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data: https:",
    "connect-src 'self' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com",
    "frame-src https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
};

// Client-side-only routes: real React routes that are intentionally NOT
// prerendered, served as the SPA shell with 200 + noindex. Nothing qualifies:
// every route on this site has a static shell, and the two cross-sell service
// slugs (vocational-evaluation, life-care-planning) are retired addresses that
// the legacy 301 map sends to the sister practices, so they are deliberately
// NOT registered here. The hook stays so a future link-only page can opt in
// without re-plumbing the fallback.
const CLIENT_ONLY_ROUTES = () => false;

// Bounded so thousands of prerendered HTML pages can't accumulate unbounded
// memory; oldest entries are evicted first (Map preserves insertion order).
const GZIP_CACHE_MAX_ENTRIES = 1000;
const gzipCache = new Map();

const indexHtml = readFileSync(join(DIST, "index.html"));
const indexHtmlGz = gzipSync(indexHtml);

// Dedicated not-found shell (scripts/prerender.mjs writes dist/404.html with
// the "Page Not Found" title, a noindex directive, no canonical, and no
// JSON-LD), so an unknown URL is never answered with the home page's head. The
// home shell stands in when a build (or the test stub) has not written it.
const notFoundPath = join(DIST, "404.html");
const notFoundHtml = existsSync(notFoundPath) ? readFileSync(notFoundPath) : indexHtml;
const notFoundHtmlGz = existsSync(notFoundPath) ? gzipSync(notFoundHtml) : indexHtmlGz;

// Whether a route has a prerendered shell in dist/ - the existence check the
// legacy 301 map uses so a redirect never lands on a 404.
function prerenderedRouteExists(pathname) {
  const file = pathname === "/" ? join(DIST, "index.html") : join(DIST, pathname, "index.html");
  return existsSync(file);
}

function getGzipped(filePath, content) {
  if (gzipCache.has(filePath)) {
    return gzipCache.get(filePath);
  }
  const gz = gzipSync(content);
  if (gzipCache.size >= GZIP_CACHE_MAX_ENTRIES) {
    gzipCache.delete(gzipCache.keys().next().value);
  }
  gzipCache.set(filePath, gz);
  return gz;
}

function acceptsGzip(req) {
  const ae = req.headers["accept-encoding"] || "";
  return ae.includes("gzip");
}

// Production sets CANONICAL_HOST to the apex host of SITE_URL ("kweconomics.com",
// lib/brand.server.mjs): every other hostname - www.kweconomics.com, the
// *.up.railway.app default domain - then 301s to it, preserving the path. The
// value is read from the environment rather than hard-coded on purpose: unset or
// empty (local dev, the Docker smoke, and the Railway staging URL before the DNS
// cutover) it is a no-op, so a fresh deploy can never bounce every request to a
// domain that does not point at it yet. Set it at cutover (README, Production).
const PRODUCTION_CANONICAL_HOST = new URL(SITE_URL).host;
const CANONICAL_HOST = process.env.CANONICAL_HOST || "";

// The HTTP request handler, exported so tests can drive it over a real ephemeral
// listener. server.js only self-listens outside vitest (bottom of the file), so
// importing this under test has no port side effect.
export async function requestHandler(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const filePath = join(DIST, url.pathname);

  // Lightweight healthcheck. Placed BEFORE the canonical-host redirect so
  // Railway's internal *.up.railway.app probe receives 200, not a 301. Reports
  // config state (booleans only, no secret values) so a misconfigured cutover -
  // silent lead loss when mail/durable-capture are unset - is visible.
  if (url.pathname === "/health" || url.pathname === "/healthz") {
    res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    res.end(
      JSON.stringify({
        ok: true,
        turnstile: Boolean(process.env.TURNSTILE_SECRET_KEY),
        durableCapture: rawSubs.enabled,
        mail: Boolean(process.env.RESEND_API_KEY),
      }),
    );
    return;
  }

  const host = (req.headers.host || "").split(":")[0];
  if (CANONICAL_HOST && host && host !== CANONICAL_HOST) {
    res.writeHead(301, {
      Location: `https://${CANONICAL_HOST}${url.pathname}${url.search}`,
      "Cache-Control": "no-cache",
      ...SECURITY_HEADERS,
    });
    res.end();
    return;
  }

  const isRead = req.method === "GET" || req.method === "HEAD";

  // Canonicalize trailing slashes: /about/ -> /about (301, query preserved).
  // Prerendered pages would otherwise answer 200 on BOTH forms (duplicate
  // content). GET/HEAD only (redirecting a POST would drop its body).
  if (isRead && url.pathname.length > 1 && url.pathname.endsWith("/")) {
    res.writeHead(301, {
      Location: url.pathname.replace(/\/+$/, "") + url.search,
      "Cache-Control": "no-cache",
      ...SECURITY_HEADERS,
    });
    res.end();
    return;
  }

  // Legacy 301 map (lib/legacy-redirects.server.mjs): the retired
  // kweconomics.com routes resolve to the closest page that actually has a
  // shell in dist/, or to a sister practice for the work this site does not
  // perform. Runs after host and trailing-slash canonicalization, GET/HEAD
  // only, and never touches a live route (the map returns null for those).
  if (isRead) {
    const target = resolveLegacyRedirect(url.pathname, prerenderedRouteExists);
    if (target) {
      res.writeHead(301, {
        Location: target.startsWith("https://") ? target : target + url.search,
        "Cache-Control": "no-cache",
        ...SECURITY_HEADERS,
      });
      res.end();
      return;
    }
  }

  // Service x case-type addresses the pillar does not declare have no shell
  // (scripts/prerender.mjs writes only the declared pairs). A real pillar and
  // a real case type 301 to the pillar page instead of answering 404 for the
  // retired all-pairs grid (lib/service-case-redirects.server.mjs, the same
  // shell-existence check the legacy map uses). GET/HEAD only, after the
  // legacy map, and never for a pair that has a shell.
  if (isRead) {
    const pillar = resolveUndeclaredPairRedirect(url.pathname, prerenderedRouteExists);
    if (pillar) {
      res.writeHead(301, {
        Location: pillar + url.search,
        "Cache-Control": "no-cache",
        ...SECURITY_HEADERS,
      });
      res.end();
      return;
    }
  }

  // Handle CORS preflight for API routes
  if (req.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
    res.writeHead(204, API_CORS_HEADERS);
    res.end();
    return;
  }

  // Form submission APIs - shared handler; each route saves a typed entry
  // to data/submissions.jsonl + raw_submissions after checking its required
  // fields, then emails the lead to the team.
  const apiRoute = API_ROUTES[url.pathname];
  if (req.method === "POST" && apiRoute) {
    if (rateLimited(req, RATE_LIMIT_MAX)) {
      res.writeHead(429, API_CORS_HEADERS);
      res.end(JSON.stringify({ error: "Too many requests, please try again shortly" }));
      return;
    }
    try {
      const data = await parseBody(req);
      // Anti-spam: verify the Cloudflare Turnstile token on every lead form.
      // Fail-open - only a configured-and-present token that Cloudflare rejects
      // is blocked; the IP rate-limit above is the backstop. Set
      // TURNSTILE_REQUIRE_TOKEN=true to also reject tokenless POSTs (safe once
      // every live form renders the widget - direct-to-API bots have no token).
      if (apiRoute.turnstile) {
        const ts = await verifyTurnstile(data.turnstileToken, {
          secret: process.env.TURNSTILE_SECRET_KEY,
          remoteip: clientIp(req),
          requireToken: process.env.TURNSTILE_REQUIRE_TOKEN === "true",
        });
        if (ts.skipped) {
          console.warn(`turnstile skipped (${ts.skipped}) for ${apiRoute.type}`);
        }
        if (!ts.ok) {
          res.writeHead(400, API_CORS_HEADERS);
          res.end(JSON.stringify({ error: "Verification failed, please try again" }));
          return;
        }
      }
      if (apiRoute.required.some((field) => !data[field])) {
        res.writeHead(400, API_CORS_HEADERS);
        res.end(JSON.stringify({ error: apiRoute.requiredMessage }));
        return;
      }
      const validationError = validateRoute(apiRoute.type, data);
      if (validationError) {
        res.writeHead(400, API_CORS_HEADERS);
        res.end(JSON.stringify({ error: validationError }));
        return;
      }
      const submissionId = randomUUID();
      data.__submissionId = submissionId;
      data.__clientIp = clientIp(req);
      data.__userAgent = req.headers["user-agent"] || null;
      // Anti-spam layer 2 (behind Turnstile): a filled honeypot or >=2 gibberish
      // signals. QUARANTINE, never delete - store the submission durably (jsonl
      // breadcrumb + raw_submissions) with a _spam marker, then return the SAME
      // success body a real lead receives so a bot cannot tell quarantine from
      // acceptance. No lead email.
      const spamVerdict = checkSpam(data);
      if (spamVerdict.spam) {
        console.warn(`spam quarantined (${spamVerdict.reasons.join(",")}) for ${apiRoute.type}`);
        data._spam = { reasons: spamVerdict.reasons, at: new Date().toISOString() };
        saveSubmission(apiRoute.type, data); // breadcrumb carries the _spam marker
        await persistQuarantined(submissionId, apiRoute.type, data); // durable, forwarded:true
        res.writeHead(200, API_CORS_HEADERS);
        res.end(JSON.stringify({ success: true }));
        return;
      }
      saveSubmission(apiRoute.type, data);
      await persistRawSubmission(submissionId, apiRoute.type, data, { forwarded: true });
      res.writeHead(200, API_CORS_HEADERS);
      res.end(JSON.stringify({ success: true }));
      queueLeadEmail(apiRoute.type, data);
      return;
    } catch (err) {
      res.writeHead(err.status || 500, API_CORS_HEADERS);
      res.end(JSON.stringify({ error: err.message || "Server error" }));
    }
    return;
  }

  // Resolve a static file to serve. Order:
  //   1. Exact file at filePath (e.g., /favicon.svg, /assets/foo.js)
  //   2. Prerendered HTML at filePath/index.html (e.g., /about -> dist/about/index.html)
  //   3. NOT FOUND - HTTP 404 with the not-found shell so React's NotFound renders
  // The prerendered-HTML lookup is critical: without it, every directory-style
  // route falls through to the SPA fallback and loses its per-page metadata,
  // schema, and content.
  let resolvedPath = null;
  let resolvedExt = null;
  if (existsSync(filePath) && statSync(filePath).isFile()) {
    resolvedPath = filePath;
    resolvedExt = extname(filePath);
  } else {
    // Look up dist/<route>/index.html for prerendered routes.
    const indexCandidate = join(filePath, "index.html");
    if (existsSync(indexCandidate) && statSync(indexCandidate).isFile()) {
      resolvedPath = indexCandidate;
      resolvedExt = ".html";
    }
  }

  if (resolvedPath) {
    const mime = MIME_TYPES[resolvedExt] || "application/octet-stream";
    const content = readFileSync(resolvedPath);

    // Cache control
    let cacheControl;
    // /assets/ is content-hashed by Vite. /fonts/ holds the self-hosted woff2
    // files: not hashed, but a font file is never edited in place (a new font
    // build gets a new file name), so both are safe to cache for a year.
    if (url.pathname.startsWith("/assets/") || (url.pathname.startsWith("/fonts/") && resolvedExt === ".woff2")) {
      cacheControl = "public, max-age=31536000, immutable";
    } else if (resolvedExt === ".html") {
      // no-cache (revalidate before use) rather than no-store, so prerendered
      // pages remain bfcache-eligible (instant back/forward) while still
      // re-checking freshness on each load.
      cacheControl = "no-cache";
    } else {
      cacheControl = "public, max-age=86400";
    }

    const headers = {
      "Content-Type": mime,
      "Cache-Control": cacheControl,
      ...SECURITY_HEADERS,
    };

    // Gzip compressible text-based responses. Vary is set even on identity
    // responses so shared caches key on Accept-Encoding either way.
    if (COMPRESSIBLE.has(mime)) {
      headers["Vary"] = "Accept-Encoding";
      if (acceptsGzip(req)) {
        const gz = getGzipped(resolvedPath, content);
        headers["Content-Encoding"] = "gzip";
        res.writeHead(200, headers);
        res.end(gz);
        return;
      }
    }

    res.writeHead(200, headers);
    res.end(content);
    return;
  }

  // A sitemap address with no file on disk answers 410 Gone, not 404: the
  // news sitemap (public/news-sitemap.xml) exists only while an insight post
  // is inside the Google News window and was declared in robots.txt before
  // that, so Search Console may hold it as a submitted sitemap; a 410 lets it
  // retire the entry instead of reporting "Couldn't fetch" indefinitely. A
  // sitemap file on disk is served above and never reaches this branch.
  if (/^\/[a-z0-9-]*sitemap[a-z0-9-]*\.xml$/i.test(url.pathname)) {
    res.writeHead(410, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      ...SECURITY_HEADERS,
    });
    res.end("Gone");
    return;
  }

  // Fallback - serve the not-found shell with HTTP 404 for unknown routes so
  // the React NotFound page renders with a proper status code (rather than the
  // soft-404 a 200 would create) and the head a crawler logs is the error
  // page's, not the home page's. Reaching this branch means "route not found"
  // - except for a deliberately unprerendered client-only route, which gets
  // the SPA shell with 200 + noindex.
  const clientOnly = CLIENT_ONLY_ROUTES(url.pathname);
  const status = clientOnly ? 200 : 404;
  const body = clientOnly ? indexHtml : notFoundHtml;
  const bodyGz = clientOnly ? indexHtmlGz : notFoundHtmlGz;
  const headers = {
    "Content-Type": "text/html",
    "Cache-Control": "no-cache",
    "Vary": "Accept-Encoding",
    ...SECURITY_HEADERS,
  };
  if (clientOnly) {
    headers["X-Robots-Tag"] = "noindex";
  }

  if (acceptsGzip(req)) {
    headers["Content-Encoding"] = "gzip";
    res.writeHead(status, headers);
    res.end(bodyGz);
    return;
  }

  res.writeHead(status, headers);
  res.end(body);
}

const server = createServer(requestHandler);

// Under vitest the module is imported to unit-test its exported functions
// (requestHandler, persistRawSubmission, queueLeadEmail, etc.); skip binding the
// port so the import has no side effects. Production (`node server.js`) is
// unaffected.
if (!process.env.VITEST) {
  server.listen(PORT, () => {
    console.log(`${ORG_NAME} server running on port ${PORT}`);
    console.log(
      CANONICAL_HOST
        ? `canonical host: ${CANONICAL_HOST} (other hostnames 301 to it)`
        : `canonical host redirect OFF (CANONICAL_HOST unset; set CANONICAL_HOST=${PRODUCTION_CANONICAL_HOST} at cutover)`,
    );
    console.log(
      turnstileStartupState({
        siteKey: process.env.VITE_TURNSTILE_SITE_KEY,
        secret: process.env.TURNSTILE_SECRET_KEY,
      }),
    );
    console.log(
      process.env.RESEND_API_KEY
        ? `lead email: configured (to ${process.env.LEAD_RECIPIENTS || DEFAULT_LEAD_RECIPIENTS})`
        : "lead email DISABLED (RESEND_API_KEY unset) - leads land only in raw_submissions + data/submissions.jsonl",
    );
    console.log(rawSubs.enabled ? "durable capture: configured" : "durable capture disabled: PUBLIC_SUPABASE_* unset");
  });

  // Graceful shutdown: Railway sends SIGTERM on every redeploy. Stop accepting
  // new connections and let in-flight requests finish before exiting.
  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down gracefully`);
    server.close(() => process.exit(0));
    // Failsafe if connections don't drain promptly.
    setTimeout(() => process.exit(0), 10_000).unref?.();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
