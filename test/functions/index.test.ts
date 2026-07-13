/**
 * Phase 1 feature test — @multivrs/functions (runtime model).
 * swift-rust runs on bun (default), node, or edge.
 */
import { describe, expect, test } from "bun:test";
import {
  DEFAULT_RUNTIME,
  isRuntime,
  RUNTIMES,
  resolveRuntime,
  toFunctionConfig,
} from "@multivrs/functions";

describe("@multivrs/functions runtime model", () => {
  test("supports bun, node and edge with bun as the default", () => {
    expect([...RUNTIMES]).toEqual(["bun", "node", "edge"]);
    expect(DEFAULT_RUNTIME).toBe("bun");
  });

  test("isRuntime guards valid + invalid values", () => {
    expect(isRuntime("bun")).toBe(true);
    expect(isRuntime("edge")).toBe(true);
    expect(isRuntime("deno")).toBe(false);
    expect(isRuntime(undefined)).toBe(false);
  });

  test("resolveRuntime falls back to bun for missing/invalid input", () => {
    expect(resolveRuntime("node")).toBe("node");
    expect(resolveRuntime(null)).toBe("bun");
    expect(resolveRuntime("deno")).toBe("bun");
  });

  test("toFunctionConfig defaults runtime + regions", () => {
    expect(toFunctionConfig()).toEqual({ runtime: "bun", regions: [] });
    expect(toFunctionConfig({ runtime: "edge", regions: ["iad1"] })).toEqual({
      runtime: "edge",
      regions: ["iad1"],
    });
  });
});
