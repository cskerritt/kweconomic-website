// Pure aggregation over the raffle ledger: the per-event totals, the
// bar-association breakdown, and the entrant list behind BOTH metrics surfaces
// (the site's GET /api/raffle-entries, which the workflow's /admin/raffle-leads
// page renders, and the offline scripts/raffle-stats.mjs). One module so the
// dashboard and the CLI can never report different numbers.
//
// Input is always FOLDED entries - lib/raffle.server.mjs's readRaffleEntries has
// already collapsed the append-only file to one current row per entryId. Lives
// in lib/ because the Docker image copies lib/ and the site route imports it.
// Spec: docs/superpowers/specs/2026-07-29-raffle-bar-association-design.md
import { normalizeEventSlug } from "./raffle.mjs";
import { BAR_ASSOCIATION_UNRECORDED, barAssociationDisplay, summarizeBarAssociations } from "./bar-associations.mjs";

/**
 * The "every event" filter. It is the EMPTY string rather than a slug because
 * normalizeEventSlug("") returns "default", which is a real event (a bare
 * /raffle QR). Running a blank filter through the slug normalizer would silently
 * show one event's numbers under an "All events" heading.
 */
export const ALL_EVENTS = "";

export function raffleEventFilter(raw) {
  const value = String(raw ?? "").trim();
  return value ? normalizeEventSlug(value) : ALL_EVENTS;
}

/** Every event in the ledger with its entry count, busiest first. */
export function raffleEvents(entries = []) {
  const counts = new Map();
  for (const entry of entries) {
    if (!entry) continue;
    const event = normalizeEventSlug(entry.event);
    counts.set(event, (counts.get(event) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([event, count]) => ({ event, count }))
    .sort((a, b) => b.count - a.count || a.event.localeCompare(b.event));
}

/**
 * The three Grow states the ledger distinguishes (guide section 6.3):
 * "delivered", "failed" (attempted, did not land), "queued" (never attempted -
 * no CLIO_GROW_INBOX_TOKEN was set, which is the resweep queue).
 */
export function growStatus(entry = {}) {
  if (entry.growDelivered === true) return "delivered";
  return entry.growAttemptedAt ? "failed" : "queued";
}

/** Headline totals for a set of entries (already scoped to the event, if any). */
export function raffleEventSummary(entries = []) {
  const emails = new Set();
  const summary = { entries: 0, attorneys: 0, growDelivered: 0, growFailed: 0, growQueued: 0 };
  for (const entry of entries) {
    if (!entry) continue;
    summary.entries += 1;
    const email = String(entry.email ?? "").trim().toLowerCase();
    if (email) emails.add(email);
    const status = growStatus(entry);
    if (status === "delivered") summary.growDelivered += 1;
    else if (status === "failed") summary.growFailed += 1;
    else summary.growQueued += 1;
  }
  summary.attorneys = emails.size;
  return summary;
}

/**
 * The entrant list, newest first, reduced to what the dashboard page shows. The
 * phone number is deliberately NOT carried: the page has no column for it, and
 * this list crosses a service boundary.
 */
export function raffleEntryRows(entries = []) {
  return [...entries]
    .filter(Boolean)
    .sort((a, b) => String(b.timestamp ?? "").localeCompare(String(a.timestamp ?? "")))
    .map((entry) => ({
      entryId: String(entry.entryId ?? ""),
      event: normalizeEventSlug(entry.event),
      name: `${String(entry.firstName ?? "").trim()} ${String(entry.lastName ?? "").trim()}`.trim(),
      firm: String(entry.firm ?? "").trim(),
      association: barAssociationDisplay(entry) || BAR_ASSOCIATION_UNRECORDED,
      email: String(entry.email ?? "").trim(),
      at: String(entry.timestamp ?? ""),
      grow: growStatus(entry),
    }));
}

/**
 * The whole payload GET /api/raffle-entries returns and the raffle-leads page
 * renders. `events` always covers the FULL ledger (so the page can offer every
 * event chip even while scoped to one), while summary/breakdown/rows are scoped
 * to `event`. An unknown event yields honest zeros, never a throw.
 */
export function raffleLeadsReport(entries = [], event, { now = new Date() } = {}) {
  const filter = raffleEventFilter(event);
  const scoped = entries.filter((e) => e && (!filter || normalizeEventSlug(e.event) === filter));
  return {
    event: filter,
    events: raffleEvents(entries),
    summary: raffleEventSummary(scoped),
    breakdown: summarizeBarAssociations(scoped),
    rows: raffleEntryRows(scoped),
    generatedAt: now.toISOString(),
  };
}
