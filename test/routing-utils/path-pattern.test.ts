import { describe, expect, test } from "bun:test";
import { interpolatePath, matchPathPattern } from "@multivrs/routing-utils";

describe("safe path patterns", () => {
  test("matches named and catch-all parameters", () => {
    expect(matchPathPattern("/docs/:slug", "/docs/start")).toMatchObject({
      matched: true,
      params: { slug: "start" },
    });
    expect(matchPathPattern("/shop/:path*", "/shop/a/b")).toEqual({
      matched: true,
      params: { path: "a/b" },
      remainder: "/a/b",
    });
  });

  test("rejects invalid names and interpolates destinations", () => {
    expect(matchPathPattern("/docs/:bad-name", "/docs/a").matched).toBe(false);
    expect(interpolatePath("/guides/:slug", { slug: "start" })).toBe("/guides/start");
  });
});
