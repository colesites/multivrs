import { describe, expect, test } from "bun:test";
import { parseImageRequest } from "../../apps/serve-worker/src/image";

describe("on-demand image request boundary", () => {
  test("accepts a local source with bounded dimensions", () => {
    const url = new URL("https://example.com/_image?url=/hero.png&w=960&q=85");
    expect(parseImageRequest(url)).toEqual({
      quality: 85,
      sourcePath: "/hero.png",
      width: 960,
    });
  });

  test("rejects remote, recursive, and oversized sources", () => {
    expect(
      parseImageRequest(new URL("https://example.com/_image?url=https://evil.test/x&w=200")),
    ).toBeNull();
    expect(parseImageRequest(new URL("https://example.com/_image?url=/_image&w=200"))).toBeNull();
    expect(parseImageRequest(new URL("https://example.com/_image?url=/x.png&w=9000"))).toBeNull();
  });
});
