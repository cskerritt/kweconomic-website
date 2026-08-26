import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer } from "node:http";
import { once } from "node:events";

// Integration coverage for the public-server Turnstile block path (#23).
//
// server.js builds its request handler against a `createServer` instance that it
// does NOT export, and self-listens at import time only when VITEST is unset.
// Rather than re-import that module (which would either skip listening under
// vitest or self-listen on an undiscoverable ephemeral port), this test stands up
// a real ephemeral listener on port 0 wired to the exact verify-then-block logic
// server.js runs in its generic API handler, using the real verifyTurnstile module. We
// stub the global fetch so the Cloudflare siteverify call is controlled and no
// live network is touched; WORKFLOW_URL is left unset so no forward is attempted.
//
// What this proves end-to-end over HTTP:
//   - a configured-and-present token Cloudflare rejects -> 400, no saveSubmission,
//     no forward (fail-CLOSED, the only block path)
//   - no secret configured -> 200 (fail-OPEN; a real lead is never dead-ended)

import { verifyTurnstile } from "./turnstile.server.mjs";

let server;
let baseUrl;

// Mirror of the consultation/contact branch in server.js: verify Turnstile,
// 400 on a hard reject, otherwise "save" and 200. saveSubmission and
// forwardToWorkflow are spies so we can assert they are NOT called on a block.
function makeHandler({ secret, saveSubmission, forwardToWorkflow }) {
  return async (req, res) => {
    try {
      let raw = "";
      for await (const chunk of req) raw += chunk;
      const data = raw ? JSON.parse(raw) : {};
      const ts = await verifyTurnstile(data.turnstileToken, {
        secret,
        remoteip: "203.0.113.7",
      });
      if (!ts.ok) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Verification failed, please try again" }));
        return;
      }
      saveSubmission("consultation", data);
      forwardToWorkflow("consultation", data);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      res.writeHead(err.status || 500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message || "Server error" }));
    }
  };
}

async function startServer({ secret, saveSubmission, forwardToWorkflow }) {
  server = createServer(makeHandler({ secret, saveSubmission, forwardToWorkflow }));
  server.listen(0);
  await once(server, "listening");
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}/api/consultation`;
}

async function postConsultation(body) {
  const realFetch = globalThis.__realFetch;
  const res = await realFetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

beforeEach(() => {
  // Preserve the real fetch for our own HTTP calls, then stub the global so the
  // siteverify call inside verifyTurnstile is controlled (no live Cloudflare).
  globalThis.__realFetch = globalThis.fetch.bind(globalThis);
});

afterEach(async () => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete globalThis.__realFetch;
  if (server && server.listening) await new Promise((r) => server.close(r));
  server = undefined;
  baseUrl = undefined;
});

describe("public server Turnstile block path (#23 integration)", () => {
  it("blocks a configured-and-invalid token with 400 and does not save or forward", async () => {
    // siteverify reports the token invalid.
    vi.stubGlobal("fetch", vi.fn(async () => ({ json: async () => ({ success: false }) })));
    const saveSubmission = vi.fn();
    const forwardToWorkflow = vi.fn();
    await startServer({ secret: "configured-secret", saveSubmission, forwardToWorkflow });

    const { status, body } = await postConsultation({
      name: "Bot",
      email: "bot@example.com",
      turnstileToken: "present-but-invalid",
    });

    expect(status).toBe(400);
    expect(body).toMatchObject({ error: "Verification failed, please try again" });
    expect(saveSubmission).not.toHaveBeenCalled();
    expect(forwardToWorkflow).not.toHaveBeenCalled();
    // The block decision came from a real siteverify round-trip (stubbed).
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("fails open with 200 when no secret is configured (Cloudflare never called)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ json: async () => ({ success: false }) })));
    const saveSubmission = vi.fn();
    const forwardToWorkflow = vi.fn();
    await startServer({ secret: "", saveSubmission, forwardToWorkflow });

    const { status, body } = await postConsultation({
      name: "Real Lead",
      email: "lead@example.com",
      turnstileToken: "any-token",
    });

    expect(status).toBe(200);
    expect(body).toMatchObject({ success: true });
    expect(saveSubmission).toHaveBeenCalledTimes(1);
    expect(forwardToWorkflow).toHaveBeenCalledTimes(1);
    // No secret -> verifyTurnstile short-circuits, siteverify is never hit.
    expect(fetch).not.toHaveBeenCalled();
  });
});
