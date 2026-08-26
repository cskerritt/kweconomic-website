// Dependency-free PostgREST client for the durable raw_submissions lead table.
// Mirrors workflow/lib/supabase.js exactly so the public server keeps ZERO
// third-party runtime dependencies (Node built-ins + global fetch only).
//
// Reads PUBLIC_SUPABASE_URL + PUBLIC_SUPABASE_SERVICE_ROLE_KEY (named distinctly
// because the public site and the workflow service are two Railway services
// pointing at the SAME Supabase project). When either is unset (local dev /
// Docker smoke test) `enabled` is false and every method is a logged no-op so a
// visitor still receives {success:true}.
//
// SECURITY: PUBLIC_SUPABASE_SERVICE_ROLE_KEY is full-access. It must stay
// server-side only - never import this module into src/ React code.

const URL_BASE = (process.env.PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const SERVICE_KEY = process.env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY || "";

export const enabled = Boolean(URL_BASE && SERVICE_KEY);

async function rest(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`raw_submissions ${method} ${path} failed: ${res.status} ${text}`);
    err.status = res.status;
    throw err;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/** Durably records a submission. Returns the inserted row, or null when disabled.
 * `forwarded: true` is set atomically in the insert for quarantined rows, so a
 * quarantine can never exist in the replayable forwarded=false state. */
export async function insertRawSubmission({ id, type, payload, forwarded }) {
  if (!enabled) {
    console.warn("raw_submissions disabled (PUBLIC_SUPABASE_* unset): insert no-op");
    return null;
  }
  const rows = await rest("raw_submissions", {
    method: "POST",
    body: forwarded === true ? { id, type, payload, forwarded: true } : { id, type, payload },
    headers: { Prefer: "return=representation" },
  });
  return rows && rows[0] ? rows[0] : null;
}

/** Flags a row forwarded and records the workflow case id. No-op when disabled. */
export async function markForwarded(id, { caseId } = {}) {
  if (!enabled) {
    console.warn("raw_submissions disabled: markForwarded no-op");
    return null;
  }
  return rest(`raw_submissions?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: {
      forwarded: true,
      forwarded_at: new Date().toISOString(),
      case_id: caseId || null,
    },
  });
}

/**
 * Bumps attempts and records a truncated last_error. No-op when disabled.
 *
 * CONTRACT: `attempts` is the row's CURRENT stored attempts (NOT the per-call
 * HTTP retry count from forwardToWorkflow). This writes stored+1, so attempts is
 * a monotonic per-row counter that accumulates across replay sweeps and lets the
 * REPLAY_MAX_ATTEMPTS poison-pill cap actually be reached. Callers that have no
 * row in hand (the initial forward) pass attempts:0 so the first failure writes 1.
 */
export async function recordForwardFailure(id, { error, attempts = 0 } = {}) {
  if (!enabled) {
    console.warn("raw_submissions disabled: recordForwardFailure no-op");
    return null;
  }
  return rest(`raw_submissions?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: {
      attempts: attempts + 1,
      last_error: String(error || "").slice(0, 1000),
    },
  });
}

/** Un-forwarded rows, oldest first. Returns [] when disabled. */
export async function listUnforwarded(limit = 50) {
  if (!enabled) {
    console.warn("raw_submissions disabled: listUnforwarded -> []");
    return [];
  }
  // Explicit select so `attempts` is returned: the replay sweep needs the row's
  // stored attempts to pass back to recordForwardFailure (monotonic cap).
  // `payload->_spam=is.null` is defense-in-depth: quarantined rows are inserted
  // forwarded:true, but even a row that somehow lands forwarded=false must never
  // be replayed into the workflow (case + Asana task + team notice).
  const rows = await rest(
    `raw_submissions?select=id,type,payload,attempts,last_error,received_at&forwarded=eq.false&payload->_spam=is.null&order=received_at.asc&limit=${Number(limit)}`,
  );
  return rows || [];
}
