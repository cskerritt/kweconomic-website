// The draw is a one-shot, high-stakes manual run: it happens once per event, in
// front of people, and the production image does NOT ship scripts/ - so it runs
// LOCALLY against a ledger downloaded from the Railway volume. The failure mode
// that matters is a wrong path silently reading as an empty ledger and the
// operator announcing "no entries" to a room that just scanned fifty badges.
// These run the real script in a child process; no network is involved.
import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "draw-raffle-winner.mjs");

const dirs = [];
function tmpDir() {
  const dir = mkdtempSync(join(tmpdir(), "kwvrs-draw-"));
  dirs.push(dir);
  return dir;
}
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function draw(ledgerPath, event = "njaj-2026") {
  const res = spawnSync(process.execPath, [SCRIPT, "--event", event], {
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
    timestamp: "2026-07-28T12:00:00.000Z",
    growDelivered: true,
    ...over,
  });

describe("draw-raffle-winner: a missing ledger is an error, not an empty draw", () => {
  it("exits 2 and names the path plus where to get the file", () => {
    const missing = join(tmpDir(), "not-downloaded-yet.jsonl");
    const { code, stdout, stderr } = draw(missing);
    expect(code).toBe(2);
    expect(stderr).toContain(`ledger not found at ${missing}`);
    expect(stderr).toContain("download it from the Railway volume first (see guide section 6.3)");
    expect(stdout).not.toMatch(/No eligible entries/i);
    expect(stdout).not.toMatch(/WINNER/);
  });

  it("exits 2 when the path is not a readable file (a directory, a typo'd mount)", () => {
    const dir = tmpDir();
    const { code, stderr } = draw(dir);
    expect(code).toBe(2);
    expect(stderr).toContain(`ledger not found at ${dir}`);
  });

  it("exits 2 on a 0-byte ledger (what a failed `cat missing > out` download leaves behind)", () => {
    const dir = tmpDir();
    const file = join(dir, "raffle-entries.jsonl");
    writeFileSync(file, "");
    const { code, stdout, stderr } = draw(file);
    expect(code).toBe(2);
    expect(stderr).toContain("is empty (0 bytes)");
    expect(stderr).toContain("the download likely failed");
    expect(stdout).not.toMatch(/No eligible entries/i);
  });
});

describe("draw-raffle-winner: a real ledger", () => {
  it("draws a winner and reports the counts the operator can check against wc -l", () => {
    const dir = tmpDir();
    const file = join(dir, "raffle-entries.jsonl");
    writeFileSync(file, [row(), row({ entryId: "e-2", email: "sam@firm.com", firstName: "Sam", lastName: "Cole" })].join("\n") + "\n");
    const { code, stdout } = draw(file);
    expect(code).toBe(0);
    expect(stdout).toContain(`ledger:  ${file}`);
    expect(stdout).toContain("entries: 2 total in the ledger, 2 eligible for this event");
    expect(stdout).toMatch(/WINNER {3}: (Dana Reyes <dana@reyeslaw\.com>|Sam Cole <sam@firm\.com>)/);
  });

  it("still reports an honest zero when the file exists but holds no eligible entry", () => {
    const dir = tmpDir();
    const file = join(dir, "raffle-entries.jsonl");
    writeFileSync(file, row({ event: "spring-seminar" }) + "\n");
    const { code, stdout } = draw(file);
    expect(code).toBe(0);
    expect(stdout).toContain("entries: 1 total in the ledger, 0 eligible for this event");
    expect(stdout).toContain("No eligible entries. Nothing drawn.");
  });
});
