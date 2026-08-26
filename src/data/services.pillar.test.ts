/// <reference types="node" />
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function walk(dir: string, out: string[] = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|mjs)$/.test(f) && !/\.test\./.test(f)) out.push(p);
  }
  return out;
}
describe("service enumerators use pillarServices()", () => {
  it("no page/component/script iterates the raw services array", () => {
    const offenders = [...walk("src/pages"), ...walk("src/components"), ...walk("scripts")]
      .filter((p) => /\bservices\.(map|forEach|filter|flatMap)\(/.test(readFileSync(p, "utf8")));
    expect(offenders).toEqual([]);
  });
});
