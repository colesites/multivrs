/**
 * The framework catalog, in detection priority order. More specific frameworks
 * come first; `static` is the fallback (a bare `index.html` with no toolchain).
 *
 * NOTE: swift-rust signals/build settings are provisional pending the real
 * toolchain integration (PLAN.md §7 open decision #1).
 */
import type { Framework } from "./types";

export const FRAMEWORKS: readonly Framework[] = [
  {
    id: "nextjs",
    name: "Next",
    signals: [{ dependency: "next" }],
    build: {
      buildCommand: "next build",
      outputDirectory: ".next",
      devCommand: "next dev",
    },
  },
  {
    id: "swift-rust",
    name: "swift-rust",
    signals: [
      { dependency: "swift-rust" },
      { file: "swift-rust.config.ts" },
      { file: "swift-rust.config" },
    ],
    build: {
      buildCommand: "swift-rust build",
      outputDirectory: "dist",
      devCommand: "swift-rust dev",
    },
  },
  {
    id: "vite",
    name: "Vite",
    signals: [{ dependency: "vite" }, { file: "vite.config.ts" }, { file: "vite.config" }],
    build: {
      buildCommand: "vite build",
      outputDirectory: "dist",
      devCommand: "vite",
    },
  },
  {
    id: "static",
    name: "Static",
    signals: [{ file: "index.html" }],
    build: { buildCommand: null, outputDirectory: ".", devCommand: null },
  },
] as const;
