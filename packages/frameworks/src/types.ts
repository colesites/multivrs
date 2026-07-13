/**
 * Framework preset shape. Detection (`@multivrs/fs-detectors`) matches a project
 * against these signals; the deploy pipeline reads `build` for defaults the user
 * hasn't overridden in `multivrs.json`.
 */
import type { FrameworkId } from "@multivrs/config";

/** A single detection signal — a dependency in package.json or a marker file. */
export interface FrameworkSignal {
  /** A dependency name expected in package.json `dependencies`/`devDependencies`. */
  dependency?: string;
  /** A file (relative to project root) whose presence indicates this framework. */
  file?: string;
}

export interface FrameworkBuildSettings {
  /** `null` = no build step (e.g. plain static). */
  buildCommand: string | null;
  /** Directory the build emits (served / uploaded). */
  outputDirectory: string | null;
  devCommand: string | null;
}

export interface Framework {
  id: FrameworkId;
  name: string;
  /** Matched in order; the first framework with any matching signal wins. */
  signals: FrameworkSignal[];
  build: FrameworkBuildSettings;
}
