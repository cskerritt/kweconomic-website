#!/usr/bin/env node
// Google Search Console audit CLI for kwvrs.com (service-account auth).
//
//   node scripts/gsc-audit.mjs sitemaps [--strict]
//   node scripts/gsc-audit.mjs traffic  [--days 28] [--concurrency 6] [--json out.json]
//   node scripts/gsc-audit.mjs inspect  <url ...> | --file urls.txt | --sample 150 [--max 500] [--json out.json]
//
//   --sample N inspects N sitemap URLs chosen by ISO week (the window rotates,
//   so the whole sitemap is covered over a few months) plus the core pages,
//   and exits 1 on a FAIL verdict, a robots block, a fetch failure, or a
//   canonical mismatch on a page Google has indexed. `sitemaps --strict` exits
//   1 when a submitted sitemap reports errors or has not been read in 30 days.
//
// Auth: GOOGLE_SERVICE_ACCOUNT_JSON (the same Railway var the workflow service
// uses for Drive) or --key <path-to-service-account.json>. The service account
// psa-drive-bot@kwvrs-workflow.iam.gserviceaccount.com is a siteOwner-level
// user on the URL-prefix property https://kwvrs.com/ (added 2026-08-23) and the
// Search Console API is enabled on GCP project kwvrs-workflow.
//
// What the API can and cannot do (so nobody goes looking for more):
//   - searchAnalytics: per-page clicks/impressions - used by `traffic` to find
//     URLs Google is still SHOWING that no longer answer 200 (the ones that
//     actually cost visits). Every page is probed live.
//   - urlInspection: per-URL index status (verdict, coverage state, canonical,
//     last crawl). Quota is ~2,000 inspections/day per property; `--max` guards.
//   - sitemaps: submission status/errors.
//   - The Page-indexing report itself (the 404 / redirect / not-indexed buckets
//     and "Validate fix") is NOT exposed by the API; that still needs the UI.
//
// Exit code is 1 when `traffic` finds a page with impressions that is gone
// (404/410), 5xx, unreachable, or behind a redirect CHAIN - so it can gate a
// cron job. Single-hop 301s (legacy URLs) and noindex pages are reported but
// don't fail the run; they are the intended state.

import fs from "node:fs";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";

const SITE = "https://kwvrs.com/";
const UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

// ---------- tiny arg parser ----------
const argv = process.argv.slice(2);
const cmd = argv.shift();
const opts = {};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith("--")) {
    const k = a.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith("--")) {
      opts[k] = next;
      i++;
    } else opts[k] = true;
  } else positional.push(a);
}

// ---------- auth ----------
function loadServiceAccount() {
  const raw = opts.key ? fs.readFileSync(opts.key, "utf8") : process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.error("Missing credentials: set GOOGLE_SERVICE_ACCOUNT_JSON or pass --key <file>.");
    process.exit(2);
  }
  return JSON.parse(raw);
}

const b64url = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
let cachedToken = null;
async function accessToken() {
  if (cachedToken && cachedToken.exp > Date.now() / 1000 + 60) return cachedToken.value;
  const sa = loadServiceAccount();
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/webmasters",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${b64url({ alg: "RS256", typ: "JWT" })}.${b64url(claims)}`;
  const sig = crypto.sign("RSA-SHA256", Buffer.from(unsigned), sa.private_key).toString("base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${unsigned}.${sig}`,
  });
  const json = await res.json();
  if (!json.access_token) throw new Error("token exchange failed: " + JSON.stringify(json));
  cachedToken = { value: json.access_token, exp: now + 3600 };
  return json.access_token;
}

async function gsc(path, body) {
  const token = await accessToken();
  const res = await fetch("https://searchconsole.googleapis.com/" + path, {
    method: body ? "POST" : "GET",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${path}: ${text.slice(0, 400)}`);
  return JSON.parse(text);
}

// ---------- live probe ----------
// Follow up to 6 hops manually so we can report the chain; HEAD first, GET on
// 405 (the workflow origin does not answer HEAD). Transport failures (socket
// resets, DNS blips - a GitHub runner saw ~9% "fetch failed" on a 2,900-URL
// sweep that was clean from a workstation) are retried with backoff before
// being reported, so "error" means reproducibly unreachable.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function fetchWithRetry(url, attempts = 4) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try {
      let res = await fetch(url, { method: "HEAD", redirect: "manual", headers: { "user-agent": UA } });
      if (res.status === 405) res = await fetch(url, { method: "GET", redirect: "manual", headers: { "user-agent": UA } });
      if (res.status === 429 || res.status === 503) {
        last = new Error(`HTTP ${res.status}`);
      } else return res;
    } catch (err) {
      last = err;
    }
    await sleep(500 * 2 ** i);
  }
  throw last;
}

export async function probe(url) {
  const chain = [];
  let cur = url;
  for (let hop = 0; hop < 6; hop++) {
    let res;
    try {
      res = await fetchWithRetry(cur);
    } catch (err) {
      chain.push({ url: cur, status: "ERR", error: err.message });
      break;
    }
    const loc = res.headers.get("location");
    const robots = res.headers.get("x-robots-tag") || "";
    chain.push({ url: cur, status: res.status, location: loc, noindex: /noindex/i.test(robots) });
    if (res.status >= 300 && res.status < 400 && loc) cur = new URL(loc, cur).href;
    else break;
  }
  return chain;
}

// Classify a probed chain. Exported for tests.
export function classify(chain) {
  const last = chain[chain.length - 1];
  if (last.status === "ERR") return "error";
  if (last.status === 200 && chain.length === 1) return last.noindex ? "noindex" : "ok";
  if (last.status === 200) return chain.length > 2 ? "redirect-chain" : "redirect";
  if (last.status === 404 || last.status === 410) return "gone";
  if (last.status >= 500) return "server-error";
  return "other";
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    }),
  );
  return out;
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

// ---------- commands ----------
// Exported for tests: which submitted sitemaps are unhealthy (errors, or not
// read by Google within `staleDays`).
export function sitemapProblems(entries, now = Date.now(), staleDays = 30) {
  const out = [];
  for (const s of entries) {
    if (Number(s.errors) > 0) out.push(`${s.path}: ${s.errors} error(s)`);
    const read = s.lastDownloaded ? Date.parse(s.lastDownloaded) : NaN;
    if (!Number.isFinite(read) || now - read > staleDays * 86400e3) out.push(`${s.path}: not read by Google in ${staleDays} days`);
  }
  return out;
}

async function cmdSitemaps() {
  const r = await gsc(`webmasters/v3/sites/${encodeURIComponent(SITE)}/sitemaps`);
  const entries = r.sitemap || [];
  for (const s of entries) {
    const web = (s.contents || []).find((c) => c.type === "web");
    console.log(
      `${s.path}\n  submitted ${s.lastSubmitted}  downloaded ${s.lastDownloaded}  errors ${s.errors}  warnings ${s.warnings}  urls ${web?.submitted ?? "?"}${s.isPending ? "  (pending)" : ""}`,
    );
  }
  if (!entries.length) console.log("No sitemaps submitted.");
  const problems = sitemapProblems(entries);
  for (const p of problems) console.log(`PROBLEM ${p}`);
  if (opts.strict && (problems.length || !entries.length)) process.exitCode = 1;
}

// Fetch every URL in the live sitemap index (page URLs only).
async function sitemapUrls() {
  const idx = await (await fetch(`${SITE}sitemap.xml`)).text();
  const locs = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!idx.includes("<sitemapindex")) return [...new Set(locs)];
  const urls = [];
  for (const child of locs) {
    const xml = await (await fetch(child)).text();
    urls.push(...[...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  }
  return [...new Set(urls)];
}

// Exported for tests: deterministic rotating window over a sorted URL list.
export function sampleWindow(urls, n, weekIndex) {
  const sorted = [...urls].sort();
  if (!sorted.length || n <= 0) return [];
  const start = (weekIndex * n) % sorted.length;
  const out = [];
  for (let i = 0; i < Math.min(n, sorted.length); i++) out.push(sorted[(start + i) % sorted.length]);
  return out;
}

// Pages that are inspected every run regardless of the rotation.
const CORE_PAGES = ["", "services", "services/vocational-expert", "services/life-care-planning", "services/forensic-economics", "services/expert-witness-testimony", "contact", "team", "guides"].map((p) => SITE + p);

// Exported for tests: does an inspection result need attention?
export function inspectionProblem(r) {
  if (r.error) return "inspection failed: " + r.error;
  if (r.verdict === "FAIL") return "verdict FAIL (" + (r.coverage || "?") + ")";
  if (r.robots === "BLOCKED") return "blocked by robots.txt";
  if (r.fetch && r.fetch !== "SUCCESSFUL" && r.fetch !== "PAGE_FETCH_STATE_UNSPECIFIED") return "fetch " + r.fetch;
  if (r.canonicalMismatch && /indexed/i.test(r.coverage || "")) return "Google canonical differs: " + r.googleCanonical;
  return null;
}

async function cmdTraffic() {
  const days = Number(opts.days || 28);
  // GSC data lags ~2 days.
  const end = new Date(Date.now() - 2 * 86400e3);
  const start = new Date(end.getTime() - days * 86400e3);
  const r = await gsc(`webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, {
    startDate: isoDate(start),
    endDate: isoDate(end),
    dimensions: ["page"],
    rowLimit: 25000,
  });
  const rows = (r.rows || []).map((row) => ({ url: row.keys[0], clicks: row.clicks, impressions: row.impressions }));
  console.error(`${rows.length} pages with impressions ${isoDate(start)}..${isoDate(end)}; probing live...`);
  const probed = await mapLimit(rows, Number(opts.concurrency || 6), async (row) => ({ ...row, chain: await probe(row.url), }));
  for (const p of probed) p.state = classify(p.chain);

  // Second opinion for transport errors: a slow, serial re-probe with a pause
  // between requests. Bursts of socket resets from a shared runner IP were
  // landing as contiguous blocks of "error" on pages that are fine; only a
  // failure that reproduces in isolation is reported as one.
  const flaky = probed.filter((p) => p.state === "error");
  if (flaky.length) {
    console.error(`${flaky.length} transport error(s); re-verifying serially...`);
    for (const p of flaky) {
      await sleep(1500);
      p.chain = await probe(p.url);
      p.state = classify(p.chain);
    }
    console.error(`${probed.filter((p) => p.state === "error").length} still unreachable after re-verification.`);
  }

  const bad = probed.filter((p) => p.state !== "ok").sort((a, b) => b.impressions - a.impressions);
  const summary = {};
  for (const p of probed) summary[p.state] = (summary[p.state] || 0) + 1;
  console.log(`Pages by live state: ${JSON.stringify(summary)}`);
  if (bad.length) {
    console.log(`\n${bad.length} page(s) with impressions that are not a clean 200:\n`);
    for (const p of bad) {
      const hops = p.chain.map((h) => (h.location ? `${h.status} -> ${h.location}` : String(h.status))).join(" | ");
      console.log(`[${p.state}] clicks=${p.clicks} impr=${p.impressions}  ${p.url}\n    ${hops}`);
    }
  } else console.log("All pages with impressions answer a clean 200.");
  if (opts.json) fs.writeFileSync(opts.json, JSON.stringify({ start: isoDate(start), end: isoDate(end), pages: probed }, null, 1));
  const blocking = bad.filter((p) => !["noindex", "redirect"].includes(p.state));
  process.exitCode = blocking.length ? 1 : 0;
}

async function cmdInspect() {
  let urls = [...positional];
  if (opts.file) urls.push(...fs.readFileSync(opts.file, "utf8").split(/\r?\n/).map((s) => s.trim()).filter(Boolean));
  if (opts.sample) {
    const all = await sitemapUrls();
    const week = Math.floor(Date.now() / (7 * 86400e3));
    const window = sampleWindow(all, Number(opts.sample), week);
    console.error(`sampling ${window.length} of ${all.length} sitemap URLs (week ${week}) + ${CORE_PAGES.length} core pages`);
    urls.push(...CORE_PAGES, ...window);
  }
  urls = [...new Set(urls)];
  const max = Number(opts.max || 500);
  if (urls.length > max) {
    console.error(`${urls.length} URLs requested; inspecting the first ${max} (daily quota is ~2,000 - raise with --max).`);
    urls = urls.slice(0, max);
  }
  const results = await mapLimit(urls, 4, async (url) => {
    try {
      const r = await gsc("v1/urlInspection/index:inspect", { inspectionUrl: url, siteUrl: SITE });
      const i = r.inspectionResult.indexStatusResult || {};
      return {
        url,
        verdict: i.verdict,
        coverage: i.coverageState,
        fetch: i.pageFetchState,
        robots: i.robotsTxtState,
        lastCrawl: i.lastCrawlTime,
        googleCanonical: i.googleCanonical,
        userCanonical: i.userCanonical,
        canonicalMismatch: Boolean(i.googleCanonical && i.userCanonical && i.googleCanonical !== i.userCanonical),
      };
    } catch (err) {
      return { url, error: err.message };
    }
  });
  for (const r of results) {
    if (r.error) console.log(`ERR  ${r.url}  ${r.error}`);
    else
      console.log(
        `${(r.verdict || "?").padEnd(7)} ${(r.coverage || "?").padEnd(34)} last=${r.lastCrawl?.slice(0, 10) || "never"}${r.canonicalMismatch ? "  CANONICAL MISMATCH -> " + r.googleCanonical : ""}  ${r.url}`,
      );
  }
  if (opts.json) fs.writeFileSync(opts.json, JSON.stringify(results, null, 1));
  const problems = results.map((r) => ({ r, why: inspectionProblem(r) })).filter((x) => x.why);
  const counts = {};
  for (const r of results) counts[r.coverage || r.error ? r.coverage || "error" : "?"] = (counts[r.coverage || "error"] || 0) + 1;
  console.log(`\nCoverage summary: ${JSON.stringify(counts)}`);
  if (problems.length) {
    console.log(`\n${problems.length} URL(s) need attention:`);
    for (const { r, why } of problems) console.log(`  ${r.url}  - ${why}`);
    if (opts.sample) process.exitCode = 1;
  } else console.log("No inspection problems.");
}

const commands = { sitemaps: cmdSitemaps, traffic: cmdTraffic, inspect: cmdInspect };
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!commands[cmd]) {
    console.error("usage: gsc-audit.mjs <sitemaps|traffic|inspect> [options]  (see header comment)");
    process.exit(2);
  }
  commands[cmd]().catch((err) => {
    console.error(err.message);
    process.exit(2);
  });
}
