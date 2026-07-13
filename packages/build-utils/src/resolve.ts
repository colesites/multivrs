import type { Artifact, ArtifactFile } from "./artifact";
import type { BuildFunction, ServeTarget } from "./output";

export type ResolvedArtifactRequest =
  | { type: "static"; file: ArtifactFile }
  | { type: "function"; function: BuildFunction };

function cleanPath(pathname: string): string | null {
  try {
    const decoded = decodeURIComponent(pathname).replace(/^\/+/, "");
    if (decoded.includes("..") || decoded.includes("\\")) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

function fileCandidates(path: string, staticDir = "."): string[] {
  const prefix = staticDir === "." ? "" : `${staticDir.replace(/\/$/, "")}/`;
  if (!path || path.endsWith("/")) {
    return [`${prefix}${path}index.html`];
  }
  const leaf = path.slice(path.lastIndexOf("/") + 1);
  if (leaf.includes(".")) {
    return [`${prefix}${path}`];
  }
  return [`${prefix}${path}`, `${prefix}${path}.html`, `${prefix}${path}/index.html`];
}

function matches(src: string, pathname: string): boolean {
  if (src === pathname) {
    return true;
  }
  try {
    return new RegExp(`^(?:${src})$`).test(pathname);
  } catch {
    return false;
  }
}

function routeTarget(artifact: Artifact, pathname: string): ServeTarget | null {
  return artifact.output?.routes.find((route) => matches(route.src, pathname))?.target ?? null;
}

export function resolveArtifactRequest(
  artifact: Artifact,
  pathname: string,
): ResolvedArtifactRequest | null {
  const clean = cleanPath(pathname);
  if (clean === null) {
    return null;
  }
  const byPath = new Map(artifact.files.map((file) => [file.path, file]));
  for (const candidate of fileCandidates(clean, artifact.output?.staticDir)) {
    const file = byPath.get(candidate);
    if (file) {
      return { type: "static", file };
    }
  }

  const target = routeTarget(artifact, `/${clean}`);
  if (target?.type === "function") {
    const fn = artifact.output?.functions.find((item) => item.name === target.function);
    return fn ? { type: "function", function: fn } : null;
  }
  if (target?.type === "static") {
    const staticDir = artifact.output?.staticDir;
    const index = byPath.get(
      staticDir && staticDir !== "." ? `${staticDir}/index.html` : "index.html",
    );
    return index ? { type: "static", file: index } : null;
  }
  return null;
}
