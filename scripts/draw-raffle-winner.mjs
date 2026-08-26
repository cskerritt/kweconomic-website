// Draws the raffle winner for one event from the append-only ledger. Manual,
// one run per event, no network. Uses node:crypto's randomInt (rejection
// sampled, no modulo bias), so the draw is defensible if anyone asks.
//
// This runs LOCALLY: the production image does not ship scripts/, so the ledger
// is downloaded off the Railway volume first. See guide section 6.3.
//
// Run (Node 22):
//   railway ssh --service kwvrs-site "cat data/raffle-entries.jsonl" > raffle-entries.jsonl
//   wc -l raffle-entries.jsonl   # sanity-check the row count before drawing
//   RAFFLE_ENTRIES_FILE=./raffle-entries.jsonl node scripts/draw-raffle-winner.mjs --event njaj-2026
import { accessSync, constants, statSync } from "node:fs";
import { randomInt } from "node:crypto";
import { DEFAULT_RAFFLE_EVENT, drawRaffleWinners, eligibleEntries, normalizeEventSlug } from "../lib/raffle.mjs";
import { raffleFilePath, readRaffleEntries } from "../lib/raffle.server.mjs";
import { summarizeBarAssociations } from "../lib/bar-associations.mjs";

const i = process.argv.indexOf("--event");
const event = normalizeEventSlug(i !== -1 ? process.argv[i + 1] : DEFAULT_RAFFLE_EVENT);
const filePath = raffleFilePath();

// readRaffleEntries treats an unreadable file as "no entries yet", which is the
// right posture inside the request path and exactly the wrong one here: a typo'd
// path would print a confident "No eligible entries" to a room that just scanned
// fifty badges. So the file is proven readable BEFORE anything is announced.
let ledgerBytes = 0;
try {
  const st = statSync(filePath);
  if (!st.isFile()) throw new Error("not a regular file");
  accessSync(filePath, constants.R_OK);
  ledgerBytes = st.size;
} catch {
  console.error(`ledger not found at ${filePath} - download it from the Railway volume first (see guide section 6.3)`);
  process.exit(2);
}
// A 0-byte ledger is what a failed download leaves behind (`cat missing > out`
// truncates the target BEFORE cat fails), so it gets the same refusal as a
// missing file - a genuinely empty ledger would simply never exist on disk.
if (ledgerBytes === 0) {
  console.error(`ledger at ${filePath} is empty (0 bytes) - the download likely failed; re-run the railway pull and check the remote path (see guide section 6.3)`);
  process.exit(2);
}

const entries = readRaffleEntries(filePath);
const pool = eligibleEntries(entries, event);

console.log(`ledger:  ${filePath}`);
console.log(`event:   ${event}`);
console.log(`entries: ${entries.length} total in the ledger, ${pool.length} eligible for this event`);

if (pool.length === 0) {
  console.log("No eligible entries. Nothing drawn.");
  process.exit(0);
}

const { winner, runnerUp } = drawRaffleWinners(pool, (max) => randomInt(max));
const line = (label, entry) =>
  entry
    ? `${label}: ${entry.firstName} ${entry.lastName} <${entry.email}>${entry.firm ? ` - ${entry.firm}` : ""} (entered ${entry.timestamp})`
    : `${label}: none`;
console.log(line("WINNER   ", winner));
console.log(line("RUNNER-UP", runnerUp));

const undelivered = pool.filter((e) => !e.growDelivered).length;
if (undelivered) {
  console.log(`\nNote: ${undelivered} of these entries have not reached Clio Grow (growDelivered=false).`);
}

// Where this event's pool came from, at a glance. The full report (rollups,
// entrant list, Grow states) is scripts/raffle-stats.mjs.
const top = summarizeBarAssociations(pool)
  .rows.slice(0, 5)
  .map((row) => `${row.label} (${row.count})`)
  .join("; ");
if (top) {
  console.log(`\nTop associations: ${top}`);
}
