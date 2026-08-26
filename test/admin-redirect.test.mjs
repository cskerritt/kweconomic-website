import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer, request as httpRequest } from "node:http";
import { once } from "node:events";

// Coverage for the kwvrs.com /admin -> internal workflow-admin-dashboard redirect
// added to server.js.
//
// Two layers:
//   1. adminRedirectTarget(pathname, search) - pure target computation. The bare
//      /admin lands on the configured login URL; /admin/<subpath> passes through to
//      the same path on the workflow origin (query preserved); everything else is
//      null (normal static/SPA handling). The ADMIN_DASHBOARD_URL override is
//      exercised with vi.resetModules() + a re-import (the value is read at import).
//   2. Over a REAL ephemeral listener wired to the exported requestHandler: proves
//      the 302 status, the Location header, X-Robots-Tag: noindex, nofollow, subpath
//      pass-through, AND that an unknown route still falls through to the SPA shell
//      (404 + HTML, no redirect) - i.e. the catch-all is unaffected.

const DEFAULT_TARGET = "https://workflow-kwvrs-site.up.railway.app/admin/login";
const DEFAULT_ORIGIN = "https://workflow-kwvrs-site.up.railway.app";

beforeEach(() => {
  // Force a fresh module instance so ADMIN_DASHBOARD_URL is re-read from env, and
  // clear any override left by a prior test so the default-env cases are honest.
  vi.resetModules();
  delete process.env.ADMIN_DASHBOARD_URL;
});

describe("adminRedirectTarget (default ADMIN_DASHBOARD_URL)", () => {
  it("sends the bare /admin and /admin/ to the workflow login page", async () => {
    const { adminRedirectTarget } = await import("../server.js");
    expect(adminRedirectTarget("/admin")).toBe(DEFAULT_TARGET);
    expect(adminRedirectTarget("/admin/")).toBe(DEFAULT_TARGET);
  });

  it("passes a deep /admin/<subpath> through to the same path on the workflow origin", async () => {
    const { adminRedirectTarget } = await import("../server.js");
    expect(adminRedirectTarget("/admin/ops-metrics")).toBe(`${DEFAULT_ORIGIN}/admin/ops-metrics`);
    expect(adminRedirectTarget("/admin/wall")).toBe(`${DEFAULT_ORIGIN}/admin/wall`);
  });

  it("preserves the query string on a deep link", async () => {
    const { adminRedirectTarget } = await import("../server.js");
    expect(adminRedirectTarget("/admin/ops-metrics", "?range=30")).toBe(
      `${DEFAULT_ORIGIN}/admin/ops-metrics?range=30`,
    );
  });

  it("returns null for non-/admin paths (incl. the /administrator prefix false-positive)", async () => {
    const { adminRedirectTarget } = await import("../server.js");
    expect(adminRedirectTarget("/")).toBeNull();
    expect(adminRedirectTarget("/about")).toBeNull();
    expect(adminRedirectTarget("/administrator")).toBeNull();
    expect(adminRedirectTarget("/admin-tools")).toBeNull();
  });
});

describe("adminRedirectTarget honors the ADMIN_DASHBOARD_URL override", () => {
  it("uses the override host for both the bare entry and deep links", async () => {
    process.env.ADMIN_DASHBOARD_URL = "https://dash.example.test/admin/login";
    const { adminRedirectTarget } = await import("../server.js");
    expect(adminRedirectTarget("/admin")).toBe("https://dash.example.test/admin/login");
    expect(adminRedirectTarget("/admin/ops-metrics")).toBe(
      "https://dash.example.test/admin/ops-metrics",
    );
  });
});

// GET a path against the ephemeral server WITHOUT following redirects (node's
// http client never auto-follows), so we can read the 302's status + headers. No
// Accept-Encoding is sent, so the SPA-shell body comes back as identity HTML.
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

describe("admin redirect over HTTP (real server.js requestHandler)", () => {
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

  it("302s /admin to the workflow login with X-Robots-Tag noindex, nofollow", async () => {
    const res = await httpGet(port, "/admin");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(DEFAULT_TARGET);
    expect(res.headers["x-robots-tag"]).toBe("noindex, nofollow");
    expect(res.headers["cache-control"]).toBe("no-cache");
  });

  it("302s a deep /admin/<subpath> to the same path on the workflow origin, query preserved", async () => {
    const res = await httpGet(port, "/admin/ops-metrics?range=30");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(`${DEFAULT_ORIGIN}/admin/ops-metrics?range=30`);
    expect(res.headers["x-robots-tag"]).toBe("noindex, nofollow");
  });

  it("leaves the SPA catch-all unaffected: an unknown route still 404s with the HTML shell and no redirect", async () => {
    const res = await httpGet(port, "/definitely-not-a-real-route-xyz");
    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/text\/html/);
    expect(res.headers.location).toBeUndefined();
    expect(res.body).toMatch(/<html|<!doctype html|id="root"/i);
  });

  it("leaves a normal route unaffected: / still serves 200 HTML with no redirect", async () => {
    const res = await httpGet(port, "/");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/html/);
    expect(res.headers.location).toBeUndefined();
  });
});
