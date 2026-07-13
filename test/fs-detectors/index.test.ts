/**
 * Phase 1 feature test — @multivrs/fs-detectors (the "detect" stage).
 * Runs the real detectors against fixture apps in test/fixtures/detect/*.
 */
import { describe, expect, test } from "bun:test";
import {
  detectFrameworkId,
  detectPackageManager,
  detectProject,
  LocalFilesystem,
} from "@multivrs/fs-detectors";

const detectDir = new URL("../fixtures/detect/", import.meta.url);

function fsFor(name: string): LocalFilesystem {
  return new LocalFilesystem(new URL(name, detectDir).pathname);
}

describe("@multivrs/fs-detectors", () => {
  test("detects framework from a dependency (next)", async () => {
    expect(await detectFrameworkId(fsFor("nextjs"))).toBe("nextjs");
  });

  test("detects swift-rust (dependency + config file)", async () => {
    expect(await detectFrameworkId(fsFor("swift-rust"))).toBe("swift-rust");
  });

  test("detects vite", async () => {
    expect(await detectFrameworkId(fsFor("vite"))).toBe("vite");
  });

  test("falls back to static for a bare index.html", async () => {
    expect(await detectFrameworkId(fsFor("static"))).toBe("static");
  });

  test("detects package managers from lockfiles (+ bun default)", async () => {
    expect(await detectPackageManager(fsFor("nextjs"))).toBe("npm");
    expect(await detectPackageManager(fsFor("vite"))).toBe("pnpm");
    expect(await detectPackageManager(fsFor("swift-rust"))).toBe("yarn");
    expect(await detectPackageManager(fsFor("static"))).toBe("bun");
  });

  test("detectProject returns framework + package manager together", async () => {
    expect(await detectProject(fsFor("nextjs"))).toEqual({
      frameworkId: "nextjs",
      packageManager: "npm",
    });
  });
});
