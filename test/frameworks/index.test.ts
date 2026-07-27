/**
 * Phase 1 feature test — @multivrs/frameworks (the detection catalog).
 */
import { describe, expect, test } from "bun:test";
import { FRAMEWORK_IDS } from "@multivrs/config";
import { FRAMEWORKS, getFramework } from "@multivrs/frameworks";

describe("@multivrs/frameworks", () => {
  test("catalog covers the Phase 1 deploy targets", () => {
    const ids = FRAMEWORKS.map((f) => f.id);
    expect(ids).toContain("nextjs");
    expect(ids).toContain("swift-rust");
    expect(ids).toContain("static");
  });

  test("catalog covers every supported Phase 4 runtime", () => {
    expect(FRAMEWORKS.map((framework) => framework.id).sort()).toEqual([...FRAMEWORK_IDS].sort());
  });

  test("nextjs preset carries its build settings", () => {
    const next = getFramework("nextjs");
    expect(next?.build.buildCommand).toBe("bunx @opennextjs/cloudflare build");
    expect(next?.build.outputDirectory).toBe(".open-next");
  });

  test("static is the last (fallback) framework", () => {
    expect(FRAMEWORKS.at(-1)?.id).toBe("static");
  });

  test("getFramework returns undefined for an unknown id", () => {
    // @ts-expect-error — exercising the runtime guard with an invalid id
    expect(getFramework("rails")).toBeUndefined();
  });
});
