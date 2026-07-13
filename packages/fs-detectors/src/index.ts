import type { FrameworkId } from "@multivrs/config";
import { detectFramework } from "./detect-framework";
import { detectPackageManager, type PackageManager } from "./detect-package-manager";
import type { DetectorFilesystem } from "./filesystem";

export * from "./detect-framework";
export * from "./detect-package-manager";
export * from "./filesystem";

export interface DetectionResult {
  frameworkId: FrameworkId | null;
  packageManager: PackageManager;
}

/** Run all detectors over a project filesystem. */
export async function detectProject(fs: DetectorFilesystem): Promise<DetectionResult> {
  const [framework, packageManager] = await Promise.all([
    detectFramework(fs),
    detectPackageManager(fs),
  ]);
  return { frameworkId: framework?.id ?? null, packageManager };
}
