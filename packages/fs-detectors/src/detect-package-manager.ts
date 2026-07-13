/**
 * Detect the package manager from lockfiles. Defaults to `bun` (the project's
 * mandated package manager — RULES.md §1) when no lockfile is present.
 */
import type { DetectorFilesystem } from "./filesystem";

export type PackageManager = "bun" | "pnpm" | "yarn" | "npm";

const LOCKFILES: ReadonlyArray<{ file: string; pm: PackageManager }> = [
  { file: "bun.lock", pm: "bun" },
  { file: "bun.lockb", pm: "bun" },
  { file: "pnpm-lock.yaml", pm: "pnpm" },
  { file: "yarn.lock", pm: "yarn" },
  { file: "package-lock.json", pm: "npm" },
];

export async function detectPackageManager(fs: DetectorFilesystem): Promise<PackageManager> {
  for (const { file, pm } of LOCKFILES) {
    if (await fs.exists(file)) {
      return pm;
    }
  }
  return "bun";
}
