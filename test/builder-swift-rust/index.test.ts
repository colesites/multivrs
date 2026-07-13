/**
 * Phase 1 feature test — @multivrs/builder-swift-rust.
 * The mapping is the heart of the platform: per-route render mode → serve target
 * (wasm = static/cheap, ssr* = invoke the binary). Build run uses a noop runner;
 * the swift-rust output is provided as a fixture.
 */
import { describe, expect, test } from "bun:test";
import {
  buildSwiftRust,
  mapSwiftRustOutput,
  parseSwiftRustManifest,
} from "@multivrs/builder-swift-rust";
import { ValidationError } from "@multivrs/error-utils";
import type { CommandRunner } from "@multivrs/static-build";

const appDir = new URL("../fixtures/build/swift-rust-app/", import.meta.url).pathname;
const noopRunner: CommandRunner = async () => ({ code: 0 });

describe("@multivrs/builder-swift-rust mapping", () => {
  test("wasm routes are static; ssr* routes invoke the binary", () => {
    const out = mapSwiftRustOutput({
      binary: "server",
      staticDir: "static",
      routes: [
        { src: "/", renderMode: "ssr", runtime: "bun" },
        { src: "/about", renderMode: "wasm" },
        { src: "/feed", renderMode: "ssr-htmx" },
      ],
    });
    expect(out.framework).toBe("swift-rust");
    expect(out.functions).toEqual([{ name: "server", entrypoint: "server", runtime: "bun" }]);
    const byPath = Object.fromEntries(out.routes.map((r) => [r.src, r.target]));
    expect(byPath["/"]).toEqual({ type: "function", function: "server" });
    expect(byPath["/about"]).toEqual({ type: "static" });
    expect(byPath["/feed"]).toEqual({ type: "function", function: "server" });
  });

  test("an all-wasm app is fully static (no functions, no compute)", () => {
    const out = mapSwiftRustOutput({
      binary: "server",
      staticDir: "static",
      routes: [{ src: "/", renderMode: "wasm" }],
    });
    expect(out.functions).toEqual([]);
    expect(out.routes[0]?.target).toEqual({ type: "static" });
  });

  test("rejects an invalid build manifest", () => {
    expect(() => parseSwiftRustManifest({ binary: "x" })).toThrow(ValidationError);
  });

  test("buildSwiftRust reads the manifest from the build output", async () => {
    const out = await buildSwiftRust({
      dir: appDir,
      install: false,
      run: noopRunner,
    });
    expect(out.functions[0]?.name).toBe("server");
    expect(out.routes.find((r) => r.src === "/about")?.target).toEqual({
      type: "static",
    });
  });
});
