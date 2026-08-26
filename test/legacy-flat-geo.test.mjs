import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer, request as httpRequest } from "node:http";
import { once } from "node:events";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Coverage for the Search Console 404 remediation WAVE 2 (2026-08-18): the
// legacy FLAT-SLUG geo URL scheme the 2026-07-27 sweep missed.
//
//   1. createLegacyGeoResolver (lib/legacy-flat-geo.server.mjs) - parser edge
//      cases: multi-hyphen states/cities via longest-known-slug matching,
//      unknown service/state/city fallbacks up the hierarchy, live routes
//      untouched, the /services/<case-type>/<state> upgrade.
//   2. getRedirectTarget - the wave-2 straggler prefixes (/faq, the old WP
//      earnings post, legacy uploaded PDFs).
//   3. The FULL GSC 404 list (113 unique URLs, embedded below) replayed over a
//      real ephemeral listener: every one must end non-404 - a 301 chain of at
//      most 2 hops landing on a real 200 page, or a 410 for dead assets.
//      Because the assertions run against the live requestHandler + the real
//      prerendered dist/ tree, a redirect target that does not exist would
//      fail here as a 404 - we can never ship a 301 onto a 404.
//
// Like the other server tests, this file requires a BUILT dist/ (npm run
// build) - server.js itself reads dist/index.html at import time.

import { createLegacyGeoResolver, longestSlugMatch } from "../lib/legacy-flat-geo.server.mjs";
import { getRedirectTarget, requestHandler } from "../server.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

describe("prerendered dist/ tree (test prerequisite)", () => {
  it("has the prerendered route directories these tests resolve against", () => {
    // If this fails, run `npm run build` first - the resolver's slug
    // vocabulary and page-existence checks come from dist/.
    for (const dir of ["services", "locations", "credentials", "case-types"]) {
      expect(existsSync(join(DIST, dir, "index.html")), `dist/${dir} missing - run npm run build`).toBe(true);
    }
  });
});

describe("longestSlugMatch", () => {
  const states = ["virginia", "west-virginia", "north-dakota", "northern-mariana-islands", "new-york"];
  it("picks the longest hyphen-delimited prefix", () => {
    expect(longestSlugMatch("west-virginia-martinsburg", states)).toBe("west-virginia");
    expect(longestSlugMatch("northern-mariana-islands-tinian", states)).toBe("northern-mariana-islands");
    expect(longestSlugMatch("new-york-staten-island", states)).toBe("new-york");
  });
  it("matches an exact slug with no tail", () => {
    expect(longestSlugMatch("north-dakota", states)).toBe("north-dakota");
  });
  it("never matches mid-word (hyphen boundary required)", () => {
    expect(longestSlugMatch("virginias-city", states)).toBeNull();
    expect(longestSlugMatch("newark-nj", states)).toBeNull();
  });
});

describe("createLegacyGeoResolver (real dist/ vocabulary)", () => {
  const resolve = createLegacyGeoResolver({ distDir: DIST });

  it("resolves flat service-state-city to the nested page when it exists", () => {
    expect(resolve("/services/vocational-expert-texas-san-antonio")).toBe("/services/vocational-expert/texas/san-antonio");
    expect(resolve("/services/forensic-economics-hawaii-east-honolulu")).toBe("/services/forensic-economics/hawaii/east-honolulu");
  });

  it("handles multi-hyphen states and cities (longest-state-match)", () => {
    expect(resolve("/services/vocational-expert-west-virginia-martinsburg")).toMatch(/^\/services\/vocational-expert\/west-virginia/);
    expect(resolve("/services/loss-of-household-services-colorado-colorado-springs")).toMatch(/^\/services\/loss-of-household-services\/colorado/);
    expect(resolve("/services/cred-phd-northern-mariana-islands")).toBe("/credentials/phd/northern-mariana-islands");
    expect(resolve("/services/city-northern-mariana-islands-tinian")).toBe("/locations/northern-mariana-islands/tinian");
    expect(resolve("/services/city-new-york-staten-island")).toBe("/locations/new-york/staten-island");
  });

  it("falls back city -> state when the service x city page does not exist", () => {
    // amarillo is a real Texas city page but NOT in the prerendered top-10
    // service x city set for vocational-expert.
    expect(existsSync(join(DIST, "locations", "texas", "amarillo", "index.html"))).toBe(true);
    expect(existsSync(join(DIST, "services", "vocational-expert", "texas", "amarillo", "index.html"))).toBe(false);
    expect(resolve("/services/vocational-expert-texas-amarillo")).toBe("/services/vocational-expert/texas");
  });

  it("falls back to the service x state page for an unknown city", () => {
    expect(resolve("/services/vocational-expert-texas-bogusville")).toBe("/services/vocational-expert/texas");
  });

  it("handles state-only flat pages (no city tail)", () => {
    expect(resolve("/services/standard-of-care-alabama")).toBe("/services/standard-of-care/alabama");
    expect(resolve("/services/loss-of-household-services-new-hampshire")).toBe("/services/loss-of-household-services/new-hampshire");
  });

  it("keeps the pillar collapse for an unparseable geo tail", () => {
    expect(resolve("/services/vocational-expert-newark-nj")).toBe("/services/vocational-expert");
  });

  it("declines unknown services entirely", () => {
    expect(resolve("/services/underwater-basket-weaving-texas-austin")).toBeNull();
    expect(resolve("/services/affidavit-report")).toBeNull();
  });

  it("maps /services/state-<state> to the location hub pages", () => {
    expect(resolve("/services/state-georgia")).toBe("/locations/georgia");
    expect(resolve("/services/state-atlantis")).toBe("/locations");
  });

  it("maps /services/city-<state>-<city> with state and hub fallbacks", () => {
    expect(resolve("/services/city-michigan-livonia")).toBe("/locations/michigan/livonia");
    expect(resolve("/services/city-michigan-bogusville")).toBe("/locations/michigan");
    expect(resolve("/services/city-atlantis-somewhere")).toBe("/locations");
  });

  it("maps /services/cred-<cred>-<state> with cred and hub fallbacks", () => {
    expect(resolve("/services/cred-clcp-florida")).toBe("/credentials/clcp/florida");
    expect(resolve("/services/cred-abve-f-northern-mariana-islands")).toBe("/credentials/abve-f/northern-mariana-islands");
    expect(resolve("/services/cred-clcp-atlantis")).toBe("/credentials/clcp");
    expect(resolve("/services/cred-zzz-florida")).toBe("/credentials");
  });

  it("upgrades /services/<case-type>/<state> to the state-specific case-type page", () => {
    expect(resolve("/services/wrongful-death/north-dakota")).toBe("/case-types/wrongful-death/north-dakota");
    expect(resolve("/services/amputation/guam")).toBe("/case-types/amputation/guam");
    expect(resolve("/services/traumatic-brain-injury/american-samoa")).toBe("/case-types/traumatic-brain-injury/american-samoa");
    expect(resolve("/services/medical-malpractice/district-of-columbia")).toBe("/case-types/medical-malpractice/district-of-columbia");
  });

  it("never touches live routes", () => {
    expect(resolve("/services/vocational-expert")).toBeNull();
    expect(resolve("/services/matrimonial")).toBeNull();
    // matrimonial is BOTH a case type and a live service - the service wins:
    expect(resolve("/services/matrimonial/georgia")).toBeNull();
    expect(resolve("/services/forensic-economics/hawaii")).toBeNull();
    expect(resolve("/services/forensic-economics/hawaii/honolulu")).toBeNull();
    expect(resolve("/services/vocational-expert/cost")).toBeNull();
    expect(resolve("/services/forensic-economics/case/personal-injury")).toBeNull();
    expect(resolve("/services")).toBeNull();
    expect(resolve("/locations/texas")).toBeNull();
  });

  it("leaves non-state case-type children to the prefix map", () => {
    expect(resolve("/services/wrongful-death/forensic-economist")).toBeNull();
    expect(resolve("/services/wrongful-death")).toBeNull();
  });

  it("normalizes trailing slashes so slash variants resolve in one hop", () => {
    expect(resolve("/services/state-georgia/")).toBe("/locations/georgia");
    expect(resolve("/services/vocational-expert-texas-san-antonio/")).toBe("/services/vocational-expert/texas/san-antonio");
  });

  it("declines everything when dist/ is missing (degraded, never mis-redirects)", () => {
    const broken = createLegacyGeoResolver({ distDir: join(DIST, "no-such-dir") });
    expect(broken("/services/state-georgia")).toBeNull();
    expect(broken("/services/vocational-expert-texas-san-antonio")).toBeNull();
  });
});

describe("getRedirectTarget wave-2 stragglers", () => {
  it("maps /faq to the live FAQ route", () => {
    expect(getRedirectTarget("/faq")).toBe("/resources/faq");
    expect(getRedirectTarget("/faq/")).toBe("/resources/faq");
    // /faqs (older alias) keeps its own entry:
    expect(getRedirectTarget("/faqs")).toBe("/resources/faq");
  });

  it("maps the old WP earnings-stability post to the earning-capacity guide", () => {
    expect(getRedirectTarget("/when-stable-earnings-are-not-stable/")).toBe("/guides/earning-capacity-vs-lost-earnings");
  });

  it("maps the wave-2 legacy uploaded PDFs to their current replacements", () => {
    expect(getRedirectTarget("/content/uploads/2026/01/2026-KWVRS-Marital-PSA-1.pdf")).toBe("/documents/KWVRS-PSA-Matrimonial.pdf");
    expect(getRedirectTarget("/wp-content/uploads/2025/04/2025-PI-PSA-1.pdf")).toBe("/documents/KWVRS-PSA-Personal-Injury.pdf");
    expect(getRedirectTarget("/content/uploads/2026/02/2026-Consulting-PSA-records-requested.pdf")).toBe("/documents/KWVRS-PSA-Consulting.pdf");
    expect(getRedirectTarget("/content/uploads/2026/02/Sample-TBI-Life-Care-Plan.pdf")).toBe("/samples");
  });

  it("flat-geo resolution flows through getRedirectTarget ahead of the prefix map", () => {
    expect(getRedirectTarget("/services/wrongful-death/north-dakota")).toBe("/case-types/wrongful-death/north-dakota");
    expect(getRedirectTarget("/services/long-term-disability/alabama")).toBe("/case-types/long-term-disability/alabama");
    expect(getRedirectTarget("/services/state-georgia")).toBe("/locations/georgia");
  });
});

// ---------------------------------------------------------------------------
// The full GSC 404 sample list (Search Console export 2026-08-18, column 1,
// origin stripped; embedded here per test policy - never read from /tmp).
// Every URL must end non-404: 301 (<= 2 hops) onto a real 200, or 410.
// ---------------------------------------------------------------------------
const GSC_404_PATHS = [
  "/services/city-northern-mariana-islands-tinian",
  "/services/cred-clcp-florida",
  "/content/uploads/2026/02/Sample-TBI-Life-Care-Plan.pdf",
  "/services/cred-phd-north-dakota",
  "/services/city-michigan-livonia",
  "/services/state-georgia",
  "/services/city-wyoming-gillette",
  "/services/life-care-planning-iowa-iowa-city",
  "/services/vocational-expert-hawaii-mililani-town",
  "/services/expert-witness-testimony-vermont-montpelier",
  "/services/city-mississippi-clinton",
  "/services/long-term-disability/alabama",
  "/services/vocational-expert-texas-san-antonio",
  "/services/loss-of-household-services-iowa-davenport",
  "/services/standard-of-care-north-carolina-fayetteville",
  "/services/forensic-economics-colorado-centennial",
  "/documentation-hierarchy/",
  "/services/motor-vehicle-accident/florida",
  "/loss-of-household-services/",
  "/daubert-rule-702-readiness-checklist/",
  "/services/loss-of-household-services-iowa-iowa-city",
  "/when-stable-earnings-are-not-stable/",
  "/services/expert-witness-testimony-washington-tacoma",
  "/services/expert-witness-testimony-texas-fort-worth",
  "/services/city-puerto-rico-arecibo",
  "/services/cred-phd-missouri",
  "/services/standard-of-care-tennessee-nashville",
  "/services/forensic-economics-hawaii-east-honolulu",
  "/services/cred-crc-colorado",
  "/services/life-care-planning-delaware-newark",
  "/services/expert-witness-testimony-iowa-sioux-city",
  "/services/vocational-expert-nevada-north-las-vegas",
  "/services/vocational-expert-west-virginia-martinsburg",
  "/services/life-care-planning-alaska-homer",
  "/services/city-delaware-pike-creek",
  "/services/wrongful-death/north-dakota",
  "/services/loss-of-household-services-new-hampshire",
  "/services/city-florida-gainesville",
  "/services/vocational-expert-florida-jacksonville",
  "/services/vocational-expert-california-anaheim",
  "/services/matrimonial-georgia-roswell",
  "/services/life-care-planning-minnesota-duluth",
  "/services/matrimonial-delaware-newark",
  "/services/standard-of-care-montana-anaconda",
  "/services/cred-ipec-maine",
  "/services/standard-of-care-arizona-surprise",
  "/services/cred-md-new-mexico",
  "/services/matrimonial-nevada-reno",
  "/services/standard-of-care-montana-kalispell",
  "/services/standard-of-care-pennsylvania-allentown",
  "/services/cred-phd-kentucky",
  "/services/cred-crc-hawaii",
  "/services/standard-of-care-arkansas-rogers",
  "/faq",
  "/services/expert-witness-testimony-west-virginia-wheeling",
  "/services/forensic-economics-colorado-westminster",
  "/services/cred-cve-texas",
  "/services/loss-of-household-services-illinois-joliet",
  "/services/city-alaska-valdez",
  "/services/amputation/guam",
  "/services/standard-of-care-alabama",
  "/services/city-alaska-nome",
  "/services/expert-witness-testimony-new-jersey-paterson",
  "/services/city-missouri-florissant",
  "/services/city-rhode-island-woonsocket",
  "/services/cred-phd-connecticut",
  "/services/loss-of-household-services-colorado-westminster",
  "/services/loss-of-household-services-colorado-colorado-springs",
  "/services/life-care-planning-vermont-williston",
  "/services/traumatic-brain-injury/american-samoa",
  "/services/matrimonial-new-mexico-albuquerque",
  "/services/cred-clcp-kentucky",
  "/services/vocational-expert-maryland-columbia",
  "/services/medical-malpractice/district-of-columbia",
  "/services/motor-vehicle-accident/michigan",
  "/services/cred-cve-south-carolina",
  "/services/standard-of-care-new-hampshire",
  "/services/life-care-planning-oklahoma-oklahoma-city",
  "/services/traumatic-brain-injury/florida",
  "/services/cred-abve-f-northern-mariana-islands",
  "/services/life-care-planning-massachusetts-worcester",
  "/services/matrimonial-tennessee-knoxville",
  "/services/standard-of-care-washington-kirkland",
  "/services/expert-witness-testimony-texas-laredo",
  "/services/standard-of-care-us-virgin-islands",
  "/services/city-new-mexico-hobbs",
  "/services/matrimonial-kansas-wichita",
  "/services/vocational-expert-alabama-mobile",
  "/services/city-new-york-staten-island",
  "/services/vocational-expert-puerto-rico-arecibo",
  "/services/city-ohio-parma",
  "/services/standard-of-care-mississippi-biloxi",
  "/services/cred-phd-northern-mariana-islands",
  "/services/vocational-expert-kentucky-richmond",
  "/services/wrongful-death/washington",
  "/services/standard-of-care-new-hampshire-hudson",
  "/services/city-oregon-tigard",
  "/wp/wp-admin/admin-ajax.php?action=rest-nonce",
  "/services/cred-ceas-guam",
  "/services/city-maine-presque-isle",
  "/services/expert-witness-testimony-massachusetts-worcester",
  "/services/standard-of-care-maryland-annapolis",
  "/services/loss-of-household-services-ohio-canton",
  "/services/cred-crc-virginia",
  "/services/loss-of-household-services-arizona-mesa",
  "/services/cred-lrc-illinois",
  "/counseling_services.htm",
  "/litigation_support.htm",
  "/about_us.htm",
];

function httpGet(port, path) {
  return new Promise((resolve, reject) => {
    const req = httpRequest({ host: "127.0.0.1", port, path, method: "GET" }, (res) => {
      res.resume();
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers }));
    });
    req.on("error", reject);
    req.end();
  });
}

describe("every GSC-reported 404 ends non-404 over the real requestHandler", () => {
  let server;
  let port;

  beforeAll(async () => {
    server = createServer(requestHandler);
    server.listen(0);
    await once(server, "listening");
    port = server.address().port;
  });

  afterAll(async () => {
    if (server?.listening) await new Promise((r) => server.close(r));
  });

  it.each(GSC_404_PATHS)("%s resolves (301 x<=2 -> 200, or 410)", async (path) => {
    let res = await httpGet(port, path);
    expect([301, 410], `${path} answered ${res.status}`).toContain(res.status);
    let hops = 0;
    let at = path;
    while (res.status === 301 || res.status === 302) {
      hops += 1;
      expect(hops, `${path}: more than 2 redirect hops`).toBeLessThanOrEqual(2);
      const loc = res.headers.location;
      expect(loc, `${at} redirected without a Location header`).toBeTruthy();
      expect(loc.startsWith("/"), `${at} redirected off-site to ${loc}`).toBe(true);
      at = loc;
      res = await httpGet(port, loc);
    }
    // Redirect chains must land on a real page/file; dead assets answer 410.
    expect([200, 410], `${path} ended at ${at} with ${res.status}`).toContain(res.status);
  });

  it("trailing-slash variants of flat geo URLs resolve in a single hop", async () => {
    const res = await httpGet(port, "/services/state-georgia/");
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe("/locations/georgia");
    const res2 = await httpGet(port, "/services/vocational-expert-texas-san-antonio/");
    expect(res2.status).toBe(301);
    expect(res2.headers.location).toBe("/services/vocational-expert/texas/san-antonio");
  });

  it("keeps the wp-admin family on 410 (query string included)", async () => {
    const res = await httpGet(port, "/wp/wp-admin/admin-ajax.php?action=rest-nonce");
    expect(res.status).toBe(410);
    expect(res.headers["x-robots-tag"]).toBe("noindex, nofollow");
  });

  it("leaves the live nested routes serving 200 untouched", async () => {
    for (const p of [
      "/services/vocational-expert/texas/san-antonio",
      "/services/matrimonial/georgia",
      "/locations/michigan/livonia",
      "/credentials/clcp/florida",
      "/case-types/wrongful-death/north-dakota",
    ]) {
      const res = await httpGet(port, p);
      expect(res.status, `${p} should serve 200`).toBe(200);
    }
  });
});
