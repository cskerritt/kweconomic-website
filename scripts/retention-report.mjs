#!/usr/bin/env node
// Prints what a retention purge WOULD delete, once, and exits. Report only:
// this script does not read the purge-mode variable and calls the report-only
// entry point, so it cannot delete anything.
//
//   node scripts/retention-report.mjs            # data/submissions.jsonl + Supabase if configured
//   node scripts/retention-report.mjs --file X   # a copy of the jsonl file somewhere else
//
// Supabase is included only when PUBLIC_SUPABASE_URL and
// PUBLIC_SUPABASE_SERVICE_ROLE_KEY are set (count-only GET requests).

import { reportRetention } from "../lib/submission-retention.server.mjs";

const i = process.argv.indexOf("--file");
const file = i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : undefined;

await reportRetention({ file });
