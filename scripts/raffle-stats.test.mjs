// The offline half of the metrics: the same numbers /admin/raffle-leads shows,
// printed from a downloaded ledger with the services down. Mirrors
// draw-raffle-winner.test.mjs - the real script in a child process, no network.
import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "raffle-stats.mjs");

const dirs = [];
function tmpDir() {
  const dir = mkdtempSync(join(tmpdir(), "kwvrs-stats-"));
  dirs.push(dir);
  return dir;
}
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function stats(ledgerPath, args = []) {
  const res = spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: "utf8",
    env: { ...process.env, RAFFLE_ENTRIES_FILE: ledgerPath },
  });
  return { code: res.status, stdout: res.stdout, stderr: res.stderr };
}

const row = (over = {}) =>
  JSON.stringify({
    kind: "raffle-entry",
    entryId: "e-1",
    event: "njaj-2026",
    firstName: "Dana",
    lastName: "Reyes",
    email: "dana@reyeslaw.com",
    firm: "Reyes & Associates",
    barAssociation: "New Jersey Association for Justice",
    barAssociationOther: "",
    timestamp: "2026-07-29T12:00:00.000Z",
    growDelivered: true,
    growAttemptedAt: "2026-07-29T12:00:01.000Z",
    ...over,
  });

function ledgerWith(...rows) {
  const file = join(tmpDir(), "raffle-entries.jsonl");
  writeFileSync(file, rows.join("\n") + "\n");
  return file;
}

describe("raffle-stats: a missing ledger is an error, not an empty report", () => {
  it("exits 2 and names the path plus where to get the file", () => {
    const missing = join(tmpDir(), "not-downloaded-yet.jsonl");
    const { code, stderr } = stats(missing);
    expect(code).toBe(2);
    expect(stderr).toContain(`ledger not found at ${missing}`);
    expect(stderr).toContain("see guide section 6.3");
  });

  it("exits 2 on a 0-byte ledger (what a failed download leaves behind)", () => {
    const file = join(tmpDir(), "raffle-entries.jsonl");
    writeFileSync(file, "");
    const { code, stderr } = stats(file);
    expect(code).toBe(2);
    expect(stderr).toContain("is empty (0 bytes)");
  });
});

describe("raffle-stats: a real ledger", () => {
  it("reports every event, then the totals and the breakdown", () => {
    const file = ledgerWith(
      row(),
      row({ entryId: "e-2", email: "sam@firm.com", barAssociation: "New Jersey Defense Association" }),
      row({ entryId: "e-3", event: "spring-seminar", email: "lee@firm.com", growDelivered: false, growAttemptedAt: null }),
    );
    const { code, stdout } = stats(file);
    expect(code).toBe(0);
    expect(stdout).toContain(`ledger:  ${file}`);
    expect(stdout).toContain("njaj-2026");
    expect(stdout).toContain("spring-seminar");
    expect(stdout).toContain("entries:");
    expect(stdout).toContain("NJ - New Jersey Association for Justice");
    expect(stdout).toContain("plaintiff");
  });

  it("scopes to one event with --event", () => {
    const file = ledgerWith(row(), row({ entryId: "e-2", event: "spring-seminar", email: "lee@firm.com" }));
    const { stdout } = stats(file, ["--event", "NJAJ 2026"]);
    expect(stdout).toContain("event:   njaj-2026");
    expect(stdout).toContain("entries: 1");
  });

  it("buckets a pre-2026-07-29 row as (not recorded) instead of dropping it", () => {
    const file = ledgerWith(
      JSON.stringify({ kind: "raffle-entry", entryId: "e-9", event: "njaj-2026", email: "old@firm.com", timestamp: "2026-07-20T12:00:00.000Z" }),
    );
    const { code, stdout } = stats(file, ["--event", "njaj-2026"]);
    expect(code).toBe(0);
    expect(stdout).toContain("(not recorded)");
  });
});
