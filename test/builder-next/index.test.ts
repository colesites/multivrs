/**
 * Phase 1 feature test — @multivrs/builder-next.
 * Maps a complete OpenNext output into a Cloudflare Worker artifact.
 */
import { describe, expect, test } from "bun:test";
import { buildNext, mapNextOutput } from "@multivrs/builder-next";
import type { CommandRunner } from "@multivrs/static-build";

const appDir = new URL("../fixtures/build/next-app/", import.meta.url).pathname;
const noopRunner: CommandRunner = async () => ({ code: 0 });

describe("@multivrs/builder-next mapping", () => {
  test("all Next routes execute in the generated OpenNext Worker", () => {
    const out = mapNextOutput(".open-next");
    expect(out.framework).toBe("nextjs");
    expect(out.functions).toEqual([{ name: "server", entrypoint: "worker.js", runtime: "edge" }]);
    expect(out.routes).toContainEqual({
      src: "/(.*)",
      target: { type: "function", function: "server" },
    });
    expect(out.staticDir).toContain(".open-next/assets");
  });

  test("buildNext reads routes-manifest from the build output", async () => {
    const out = await buildNext({
      dir: appDir,
      install: false,
      run: noopRunner,
    });
    expect(out.framework).toBe("nextjs");
    expect(out.functions[0]?.name).toBe("server");
    expect(out.functions[0]?.runtime).toBe("edge");
  });
});
