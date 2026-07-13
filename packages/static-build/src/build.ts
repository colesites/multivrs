/**
 * The "build" stage: run install + the framework build command in the project
 * dir, then report where the output landed (fed to `createArtifact`). The
 * command runner is injectable so the orchestration is unit-testable without
 * actually shelling out; `defaultRunner` spawns a real shell at deploy time.
 */
import { spawn } from "node:child_process";
import { join } from "node:path";
import type { FrameworkId, MultivrsConfig } from "@multivrs/config";
import { type ResolvedBuildSettings, resolveBuildSettings } from "./settings";

export interface CommandResult {
  code: number;
}

export type CommandRunner = (command: string, cwd: string) => Promise<CommandResult>;

export interface RunBuildOptions {
  dir: string;
  frameworkId: FrameworkId | null;
  config?: MultivrsConfig;
  /** Skip the install step (e.g. deps already present). Default: run it. */
  install?: boolean;
  /** Injectable command runner (tests pass a fake). */
  run?: CommandRunner;
}

export interface BuildResult {
  settings: ResolvedBuildSettings;
  /** Absolute path to the build output to upload. */
  outputDir: string;
  ranInstall: boolean;
  ranBuild: boolean;
}

const defaultRunner: CommandRunner = (command, cwd) =>
  new Promise((resolve) => {
    const child = spawn(command, { cwd, shell: true, stdio: "inherit" });
    child.on("close", (code) => resolve({ code: code ?? 1 }));
  });

export async function runBuild(options: RunBuildOptions): Promise<BuildResult> {
  const run = options.run ?? defaultRunner;
  const settings = resolveBuildSettings(options.frameworkId, options.config);

  let ranInstall = false;
  if (options.install !== false && settings.installCommand) {
    const result = await run(settings.installCommand, options.dir);
    if (result.code !== 0) {
      throw new Error(`Install failed (exit ${result.code})`);
    }
    ranInstall = true;
  }

  let ranBuild = false;
  if (settings.buildCommand) {
    const result = await run(settings.buildCommand, options.dir);
    if (result.code !== 0) {
      throw new Error(`Build failed (exit ${result.code})`);
    }
    ranBuild = true;
  }

  return {
    settings,
    outputDir: join(options.dir, settings.outputDirectory),
    ranInstall,
    ranBuild,
  };
}
