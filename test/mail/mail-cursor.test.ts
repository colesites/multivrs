/**
 * mail — list cursors point at the last row shown, so the next page starts
 * after it even when newer mail arrives meanwhile.
 */
import { describe, expect, test } from "bun:test";
import { decodeMailCursor, encodeMailCursor } from "../../apps/web/src/lib/mail/mail-cursor";

describe("mail list cursors", () => {
  test("round-trip the last row's time and id", () => {
    const at = new Date("2026-10-11T09:30:00.000Z");
    const cursor = encodeMailCursor(at, "6f1c2b9e-0000-4000-8000-000000000001");
    expect(cursor).not.toContain("|");
    expect(decodeMailCursor(cursor)).toEqual({
      at,
      id: "6f1c2b9e-0000-4000-8000-000000000001",
    });
  });

  test("treat a missing or tampered cursor as the first page", () => {
    expect(decodeMailCursor(undefined)).toBeNull();
    expect(decodeMailCursor("")).toBeNull();
    expect(decodeMailCursor("not-a-cursor")).toBeNull();
    expect(decodeMailCursor(Buffer.from("yesterday|abc").toString("base64url"))).toBeNull();
  });
});
