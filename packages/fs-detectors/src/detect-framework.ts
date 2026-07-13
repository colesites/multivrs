/**
 * Detect the project framework by matching the catalog signals (a dependency in
 * package.json or a marker file) in priority order. Returns the first match, or
 * `null` if nothing matches.
 */
import type { FrameworkId } from "@multivrs/config";
import { FRAMEWORKS, type Framework } from "@multivrs/frameworks";
import type { DetectorFilesystem } from "./filesystem";

async function readPackageDeps(fs: DetectorFilesystem): Promise<Set<string>> {
  const deps = new Set<string>();
  if (!(await fs.exists("package.json"))) {
    return deps;
  }
  let raw: unknown;
  try {
    raw = JSON.parse(await fs.readFile("package.json"));
  } catch {
    return deps;
  }
  if (!raw || typeof raw !== "object") {
    return deps;
  }
  const pkg = raw as Record<string, unknown>;
  for (const key of ["dependencies", "devDependencies"]) {
    const section = pkg[key];
    if (section && typeof section === "object") {
      for (const dep of Object.keys(section)) {
        deps.add(dep);
      }
    }
  }
  return deps;
}

export async function detectFramework(fs: DetectorFilesystem): Promise<Framework | null> {
  const deps = await readPackageDeps(fs);
  for (const framework of FRAMEWORKS) {
    for (const signal of framework.signals) {
      if (signal.dependency && deps.has(signal.dependency)) {
        return framework;
      }
      if (signal.file && (await fs.exists(signal.file))) {
        return framework;
      }
    }
  }
  return null;
}

export async function detectFrameworkId(fs: DetectorFilesystem): Promise<FrameworkId | null> {
  const framework = await detectFramework(fs);
  return framework?.id ?? null;
}
