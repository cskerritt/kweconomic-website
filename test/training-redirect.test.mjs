import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer, request as httpRequest } from "node:http";
import { once } from "node:events";

// Coverage for the kwvrs.com /training -> Clio Training Hub redirect and the
// /learn -> education-portal (workflow /admin/learning) redirect added to
// server.js. Mirrors test/admin-redirect.test.mjs:
//
//   1. trainingRedirectTarget(pathname, search) / learnRedirectTarget(pathname)
//      - pure target computation. Bare /training lands on the configured hub
//      URL; /training/<subpath> passes through to the same path on the hub
//      origin (query preserved); /learn lands on the workflow /admin/learning
//      page; everything else is null. The TRAINING_HUB_URL override is
//      exercised with vi.resetModules() + a re-import (read at import time).
//   2. Over a REAL ephemeral listener wired to the exported requestHandler:
//      proves the 302 status, Location, X-Robots-Tag: noindex, nofollow, and
//      that the SPA catch-all is unaffected.

const DEFAULT_HUB = "https://kwvrs-clio-training-production.up.railway.app";
const DEFAULT_LEARN = "https://workflow-kwvrs-site.up.railway.app/admin/learning";

beforeEach(() => {
  // Fresh module instance so TRAINING_HUB_URL is re-read from env, and clear
  // any override left by a prior test so the default-env cases are honest.
  vi.resetModules();
  delete process.env.TRAINING_HUB_URL;
  delete process.env.ADMIN_DASHBOARD_URL;
});

describe("trainingRedirectTarget (default TRAINING_HUB_URL)", () => {
  it("sends the bare /training and /training/ to the hub", async () => {
    const { trainingRedirectTarget } = await import("../server.js");
    expect(trainingRedirectTarget("/training")).toBe(DEFAULT_HUB);
    expect(trainingRedirectTarget("/training/")).toBe(DEFAULT_HUB);
  });

  it("passes a deep /training/<subpath> through to the same path on the hub origin", async () => {
    const { trainingRedirectTarget } = await import("../server.js");
    expect(trainingRedirectTarget("/training/liaison-manual")).toBe(
      `${DEFAULT_HUB}/liaison-manual`,
    );
  });

  it("preserves the query string on a deep link", async () => {
    const { trainingRedirectTarget } = await import("../server.js");
    expect(trainingRedirectTarget("/training/search", "?q=matter")).toBe(
      `${DEFAULT_HUB}/search?q=matter`,
    );
  });

  it("returns null for non-/training paths (incl. prefix false-positives)", async () => {
    const { trainingRedirectTarget } = await import("../server.js");
    expect(trainingRedirectTarget("/")).toBeNull();
    expect(trainingRedirectTarget("/trainingfoo")).toBeNull();
    expect(trainingRedirectTarget("/train")).toBeNull();
  });
});

describe("trainingRedirectTarget honors the TRAINING_HUB_URL override", () => {
  it("uses the override for both the bare entry and deep links", async () => {
    process.env.TRAINING_HUB_URL = "https://hub.example.test";
    const { trainingRedirectTarget } = await import("../server.js");
    expect(trainingRedirectTarget("/training")).toBe("https://hub.example.test");
    expect(trainingRedirectTarget("/training/kw-way")).toBe(
      "https://hub.example.test/kw-way",
    );
  });
});

describe("learnRedirectTarget", () => {
  it("sends /learn and /learn/ to the workflow education portal", async () => {
    const { learnRedirectTarget } = await import("../server.js");
    expect(learnRedirectTarget("/learn")).toBe(DEFAULT_LEARN);
    expect(learnRedirectTarget("/learn/")).toBe(DEFAULT_LEARN);
  });

  it("returns null for anything else (deep links keep normal SPA handling)", async () => {
    const { learnRedirectTarget } = await import("../server.js");
    expect(learnRedirectTarget("/learning")).toBeNull();
    expect(learnRedirectTarget("/learn/anything")).toBeNull();
    expect(learnRedirectTarget("/")).toBeNull();
  });

  it("follows the ADMIN_DASHBOARD_URL origin override", async () => {
    process.env.ADMIN_DASHBOARD_URL = "https://dash.example.test/admin/login";
    const { learnRedirectTarget } = await import("../server.js");
    expect(learnRedirectTarget("/learn")).toBe(
      "https://dash.example.test/admin/learning",
    );
  });
});

// GET a path against the ephemeral server WITHOUT following redirects, so we
// can read the 302's status + headers.
function httpGet(port, path) {
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      { host: "127.0.0.1", port, path, method: "GET" },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body }));
      },
    );
    req.on("error", reject);
    req.end();
  });
}

describe("training + learn redirects over HTTP (real server.js requestHandler)", () => {
  let server;
  let port;

  beforeEach(async () => {
    const { requestHandler } = await import("../server.js");
    server = createServer(requestHandler);
    server.listen(0);
    await once(server, "listening");
    port = server.address().port;
  });

  afterEach(async () => {
    if (server?.listening) await new Promise((r) => server.close(r));
    server = undefined;
  });

  it("302s /training to the hub with X-Robots-Tag noindex, nofollow", async () => {
    const res = await httpGet(port, "/training");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(DEFAULT_HUB);
    expect(res.headers["x-robots-tag"]).toBe("noindex, nofollow");
    expect(res.headers["cache-control"]).toBe("no-cache");
  });

  it("302s a deep /training/<subpath> with query preserved", async () => {
    const res = await httpGet(port, "/training/liaison-manual?x=1");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(`${DEFAULT_HUB}/liaison-manual?x=1`);
    expect(res.headers["x-robots-tag"]).toBe("noindex, nofollow");
  });

  it("302s /learn to the workflow education portal", async () => {
    const res = await httpGet(port, "/learn");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(DEFAULT_LEARN);
    expect(res.headers["x-robots-tag"]).toBe("noindex, nofollow");
  });

  it("leaves the SPA catch-all unaffected: an unknown route still 404s with no redirect", async () => {
    const res = await httpGet(port, "/definitely-not-a-real-route-xyz");
    expect(res.status).toBe(404);
    expect(res.headers.location).toBeUndefined();
  });
});
