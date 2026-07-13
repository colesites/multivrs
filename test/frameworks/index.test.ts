/**
 * Phase 1 feature test — @multivrs/frameworks (the detection catalog).
 */
import { describe, expect, test } from "bun:test";
import { FRAMEWORKS, getFramework } from "@multivrs/frameworks";

describe("@multivrs/frameworks", () => {
  test("catalog covers the Phase 1 deploy targets", () => {
    const ids = FRAMEWORKS.map((f) => f.id);
    expect(ids).toContain("nextjs");
    expect(ids).toContain("swift-rust");
    expect(ids).toContain("static");
  });

  test("nextjs preset carries its build settings", () => {
    const next = getFramework("nextjs");
    expect(next?.build.buildCommand).toBe("next build");
    expect(next?.build.outputDirectory).toBe(".next");
  });

  test("static is the last (fallback) framework", () => {
    expect(FRAMEWORKS.at(-1)?.id).toBe("static");
  });

  test("getFramework returns undefined for an unknown id", () => {
    // @ts-expect-error — exercising the runtime guard with an invalid id
    expect(getFramework("rails")).toBeUndefined();
  });
});
