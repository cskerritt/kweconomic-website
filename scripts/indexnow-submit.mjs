#!/usr/bin/env node
// IndexNow submission script
// Reads dist/sitemap.xml or public/sitemap.xml, collects the page URLs it
// advertises (recursing into child sitemaps - sitemap.xml is a sitemap INDEX),
// and posts them to IndexNow.

import fs from "node:fs";
import path from "node:path";
import { collectSitemapPageUrls } from "./lib/sitemap-urls.mjs";

const KEY = process.env.INDEXNOW_KEY;
if (!KEY) {
  console.error("INDEXNOW_KEY env var not set. Aborting.");
  process.exit(1);
}

const ENDPOINT = "https://api.indexnow.org/IndexNow";

const sitemapPath = fs.existsSync(path.resolve("public/sitemap.xml"))
  ? path.resolve("public/sitemap.xml")
  : path.resolve("dist/sitemap.xml");
const allUrls = collectSitemapPageUrls(sitemapPath);
if (allUrls.length === 0) {
  console.error(`No <loc> URLs found in ${sitemapPath}. Aborting.`);
  process.exit(1);
}

// IndexNow requires the declared host + keyLocation to match every submitted URL,
// and rejects a batch that mixes hosts. Derive the host from the sitemap so this
// works on whatever domain the site is actually served from (e.g. the Railway
// *.up.railway.app host before the production DNS cutover); INDEXNOW_HOST overrides.
const hostOf = (u) => {
  try {
    return new URL(u).host;
  } catch {
    return "";
  }
};
const HOST = process.env.INDEXNOW_HOST || hostOf(allUrls[0]);
if (!HOST) {
  console.error("Could not determine the IndexNow host (set INDEXNOW_HOST). Aborting.");
  process.exit(1);
}
const urls = allUrls.filter((u) => hostOf(u) === HOST);
const skipped = allUrls.length - urls.length;
if (skipped > 0) console.warn(`Skipping ${skipped} sitemap URL(s) not on host ${HOST}.`);
if (urls.length === 0) {
  console.error(`No sitemap URLs are on host ${HOST}. Aborting.`);
  process.exit(1);
}
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// IndexNow accepts at most 10,000 URLs per request, so the sitemap is sent in
// batches of BATCH_SIZE.
const BATCH_SIZE = 10000;
const batches = Math.ceil(urls.length / BATCH_SIZE);
console.log(`Submitting ${urls.length} URLs to IndexNow (host ${HOST}) in ${batches} batch(es).`);

for (let i = 0; i < urls.length; i += BATCH_SIZE) {
  const urlList = urls.slice(i, i + BATCH_SIZE);
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  });
  console.log(`IndexNow batch ${i / BATCH_SIZE + 1}/${batches} (${urlList.length} URLs):`, res.status, res.statusText);
  if (res.status >= 400) {
    console.error(await res.text());
    process.exit(1);
  }
}
