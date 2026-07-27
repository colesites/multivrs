/**
 * Phase 1 feature test — @multivrs/static-build (the "build" stage).
 * Uses an injected command runner so we assert orchestration without shelling out.
 */
import { describe, expect, test } from "bun:test";
import { type CommandRunner, resolveBuildSettings, runBuild } from "@multivrs/static-build";

function recordingRunner(): { run: CommandRunner; commands: string[] } {
  const commands: string[] = [];
  const run: CommandRunner = async (command) => {
    commands.push(command);
    return { code: 0 };
  };
  return { run, commands };
}

describe("@multivrs/static-build settings", () => {
  test("uses the framework preset when config is absent", () => {
    expect(resolveBuildSettings("nextjs")).toEqual({
      installCommand: "bun install",
      buildCommand: "bunx @opennextjs/cloudflare build",
      outputDirectory: ".open-next",
    });
  });

  test("config overrides win; explicit null disables the build", () => {
    const settings = resolveBuildSettings("nextjs", {
      buildCommand: null,
      outputDirectory: "out",
    });
    expect(settings.buildCommand).toBeNull();
    expect(settings.outputDirectory).toBe("out");
  });

  test("unknown framework falls back to no build, root output", () => {
    expect(resolveBuildSettings(null)).toEqual({
      installCommand: "bun install",
      buildCommand: null,
      outputDirectory: ".",
    });
  });
});

describe("@multivrs/static-build runBuild", () => {
  test("runs install then build and resolves the output dir", async () => {
    const { run, commands } = recordingRunner();
    const result = await runBuild({
      dir: "/tmp/app",
      frameworkId: "nextjs",
      run,
    });
    expect(commands).toEqual(["bun install", "bunx @opennextjs/cloudflare build"]);
    expect(result.ranInstall).toBe(true);
    expect(result.ranBuild).toBe(true);
    expect(result.outputDir).toBe("/tmp/app/.open-next");
  });

  test("static (no build command) skips the build step", async () => {
    const { run, commands } = recordingRunner();
    const result = await runBuild({
      dir: "/tmp/site",
      frameworkId: "static",
      install: false,
      run,
    });
    expect(commands).toEqual([]);
    expect(result.ranBuild).toBe(false);
    // join("/tmp/site", ".") normalizes to "/tmp/site"
    expect(result.outputDir).toBe("/tmp/site");
  });

  test("throws when a command exits non-zero", async () => {
    const run: CommandRunner = async () => ({ code: 1 });
    await expect(runBuild({ dir: "/tmp/app", frameworkId: "nextjs", run })).rejects.toThrow();
  });
});
