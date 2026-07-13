/**
 * Resolve effective build settings: explicit `multivrs.json` values win, else
 * the framework preset, else sane defaults. A `null` in config is *explicit*
 * ("no build step") and is respected over the framework default.
 */
import type { FrameworkId, MultivrsConfig } from "@multivrs/config";
import { getFramework } from "@multivrs/frameworks";

export interface ResolvedBuildSettings {
  installCommand: string | null;
  buildCommand: string | null;
  outputDirectory: string;
}

const DEFAULT_INSTALL_COMMAND = "bun install";

/** Config value wins when present (even explicit `null`); otherwise fallback. */
function pick<T>(configValue: T | null | undefined, fallback: T | null): T | null {
  return configValue !== undefined ? configValue : fallback;
}

export function resolveBuildSettings(
  frameworkId: FrameworkId | null,
  config?: MultivrsConfig,
): ResolvedBuildSettings {
  const framework = frameworkId ? getFramework(frameworkId) : undefined;
  return {
    installCommand: pick(config?.installCommand, DEFAULT_INSTALL_COMMAND),
    buildCommand: pick(config?.buildCommand, framework?.build.buildCommand ?? null),
    outputDirectory: pick(config?.outputDirectory, framework?.build.outputDirectory ?? null) ?? ".",
  };
}
