/**
 * Phase 1 feature test — @multivrs/builder-next.
 * Maps Next's route manifest → BuildOutput (static routes from CDN; dynamic
 * routes invoke one SSR `render` function on node). Build run uses a noop runner.
 */
import { describe, expect, test } from "bun:test";
import { buildNext, mapNextOutput, parseNextRoutesManifest } from "@multivrs/builder-next";
import { ValidationError } from "@multivrs/error-utils";
import type { CommandRunner } from "@multivrs/static-build";

const appDir = new URL("../fixtures/build/next-app/", import.meta.url).pathname;
const noopRunner: CommandRunner = async () => ({ code: 0 });

describe("@multivrs/builder-next mapping", () => {
  test("static routes serve static; dynamic routes invoke render (node)", () => {
    const out = mapNextOutput(
      {
        staticRoutes: [{ page: "/" }, { page: "/about" }],
        dynamicRoutes: [{ page: "/blog/[slug]", regex: "^/blog/([^/]+)$" }],
      },
      ".next",
    );
    expect(out.framework).toBe("nextjs");
    expect(out.functions).toEqual([
      { name: "render", entrypoint: ".next/server", runtime: "node" },
    ]);
    expect(out.routes).toContainEqual({ src: "/", target: { type: "static" } });
    expect(out.routes).toContainEqual({
      src: "^/blog/([^/]+)$",
      target: { type: "function", function: "render" },
    });
  });

  test("a fully static export produces no functions", () => {
    const out = mapNextOutput({ staticRoutes: [{ page: "/" }] }, ".next");
    expect(out.functions).toEqual([]);
  });

  test("rejects an invalid routes manifest", () => {
    expect(() => parseNextRoutesManifest({ staticRoutes: "nope" })).toThrow(ValidationError);
  });

  test("buildNext reads routes-manifest from the build output", async () => {
    const out = await buildNext({
      dir: appDir,
      install: false,
      run: noopRunner,
    });
    expect(out.framework).toBe("nextjs");
    expect(out.functions[0]?.name).toBe("render");
    expect(out.routes.some((r) => r.target.type === "static")).toBe(true);
  });
});
