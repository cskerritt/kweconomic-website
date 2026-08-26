import { describe, expect, it, vi } from "vitest";
import { queueRushAlerts } from "../server.js";

describe("queueRushAlerts", () => {
  it("dispatches for a rush submission", async () => {
    const dispatch = vi.fn(async () => ({ team: { ok: true }, ack: { ok: true } }));
    const p = queueRushAlerts({ priority: "rush", email: "a@b.co" }, { dispatch });
    await p;
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
  it("does nothing (returns null) for a non-rush submission", () => {
    const dispatch = vi.fn();
    expect(queueRushAlerts({ email: "a@b.co" }, { dispatch })).toBeNull();
    expect(dispatch).not.toHaveBeenCalled();
  });
  it("never rejects even if dispatch throws", async () => {
    const dispatch = vi.fn(async () => { throw new Error("mail down"); });
    await expect(queueRushAlerts({ priority: "rush" }, { dispatch })).resolves.toBeTruthy();
  });
});
