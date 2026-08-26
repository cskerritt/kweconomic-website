import { describe, expect, it } from "vitest";
import { EventEmitter } from "node:events";
import { parseBody } from "../server.js";

function mockReq(chunks) {
  const req = new EventEmitter();
  req.socket = {};
  queueMicrotask(() => {
    for (const c of chunks) req.emit("data", c);
    req.emit("end");
  });
  return req;
}

describe("parseBody", () => {
  it("decodes a multibyte UTF-8 character split across chunk boundaries", async () => {
    const buf = Buffer.from(JSON.stringify({ name: "Muñoz" }), "utf8");
    const cut = buf.indexOf(0xc3) + 1; // split between the two bytes of ñ (0xC3 0xB1)
    const data = await parseBody(mockReq([buf.subarray(0, cut), buf.subarray(cut)]));
    expect(data.name).toBe("Muñoz");
  });
  it("rejects a non-object JSON body with status 400", async () => {
    await expect(parseBody(mockReq([Buffer.from("null")]))).rejects.toMatchObject({ status: 400 });
    await expect(parseBody(mockReq([Buffer.from("[1,2]")]))).rejects.toMatchObject({ status: 400 });
    await expect(parseBody(mockReq([Buffer.from('"hi"')]))).rejects.toMatchObject({ status: 400 });
  });
  it("resolves a valid object body", async () => {
    expect(await parseBody(mockReq([Buffer.from('{"a":1}')]))).toEqual({ a: 1 });
  });
});
