// Lead-source report for the conference raffle, read from a downloaded ledger.
// The offline twin of /admin/raffle-leads: same numbers, same pure modules, no
// network and no dashboard - it works with both services down, which is exactly
// when someone needs the entrant list.
//
// This runs LOCALLY: the production image copies lib/ and dist/ but not
// scripts/, so the ledger is pulled off the Railway volume first. Guide 6.3.
//
// Run (Node 22):
//   railway ssh --service kwvrs-site "cat data/raffle-entries.jsonl" > raffle-entries.jsonl
//   RAFFLE_ENTRIES_FILE=./raffle-entries.jsonl node scripts/raffle-stats.mjs
//   RAFFLE_ENTRIES_FILE=./raffle-entries.jsonl node scripts/raffle-stats.mjs --event njaj-2026
import { accessSync, constants, statSync } from "node:fs";
import { raffleFilePath, readRaffleEntries } from "../lib/raffle.server.mjs";
import { raffleLeadsReport } from "../lib/raffle-metrics.mjs";

const i = process.argv.indexOf("--event");
const requested = i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : "";
const filePath = raffleFilePath();

// Same refusal as the draw tool, for the same reason: readRaffleEntries treats
// an unreadable file as "no entries", which is right inside a request and wrong
// here - a typo'd path would print a confident zero report.
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
if (ledgerBytes === 0) {
  console.error(`ledger at ${filePath} is empty (0 bytes) - the download likely failed; re-run the railway pull and check the remote path (see guide section 6.3)`);
  process.exit(2);
}

const entries = readRaffleEntries(filePath);
const report = raffleLeadsReport(entries, requested);
const pad = (value, width) => String(value).padEnd(width);

console.log(`ledger:  ${filePath}`);
console.log(`event:   ${report.event || "(all events)"}`);
console.log(`entries: ${report.summary.entries} scoped, ${entries.length} total in the ledger`);
console.log(`         ${report.summary.attorneys} unique attorneys`);
console.log(`grow:    ${report.summary.growDelivered} delivered, ${report.summary.growFailed} failed, ${report.summary.growQueued} queued`);

console.log("\nEVENTS");
for (const row of report.events) console.log(`  ${pad(row.event, 26)} ${row.count}`);
if (!report.events.length) console.log("  (none)");

console.log("\nBAR ASSOCIATIONS");
for (const row of report.breakdown.rows) console.log(`  ${pad(row.label, 56)} ${pad(row.count, 5)} ${row.side}/${row.scope}`);
if (!report.breakdown.rows.length) console.log("  (none)");

const r = report.breakdown.rollups;
console.log("\nROLLUPS");
console.log(`  plaintiff ${r.plaintiff}, defense ${r.defense}, plaintiff and defense ${r.both}`);
console.log(`  national ${r.national}, state ${r.state}`);
console.log(`  other ${r.other}, no membership ${r.none}, not recorded ${r.unrecorded}`);

if (report.breakdown.otherTexts.length) {
  console.log("\nTYPED UNDER OTHER");
  for (const row of report.breakdown.otherTexts) console.log(`  ${pad(row.text, 56)} ${row.count}`);
}
