import { describe, expect, test } from "bun:test";
import { multivrsCache, withMultivrsCache } from "../../packages/functions/src";

describe("multivrs cache helpers", () => {
  test("emits ISR, SWR, and deduplicated tag headers", () => {
    const headers = multivrsCache({
      revalidate: 60.9,
      staleWhileRevalidate: 300,
      tags: ["posts", " posts ", "authors"],
    });

    expect(headers.get("cache-control")).toBe("public, s-maxage=60, stale-while-revalidate=300");
    expect(headers.get("x-multivrs-revalidate")).toBe("60");
    expect(headers.get("x-multivrs-cache-tags")).toBe("posts,authors");
  });

  test("preserves the existing response while replacing cache policy", async () => {
    const response = withMultivrsCache(
      new Response("hello", { headers: { "content-type": "text/plain" }, status: 201 }),
      { revalidate: 10 },
    );

    expect(response.status).toBe(201);
    expect(response.headers.get("content-type")).toBe("text/plain");
    expect(response.headers.get("cache-control")).toContain("s-maxage=10");
    expect(await response.text()).toBe("hello");
  });

  test("rejects invalid durations", () => {
    expect(() => multivrsCache({ revalidate: -1 })).toThrow(RangeError);
  });
});
