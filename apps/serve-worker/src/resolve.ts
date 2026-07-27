import type { ArtifactManifest, ResolvedRequest } from "./types";
import { matchesRoute } from "./wasm-matcher";

function candidates(pathname: string, staticDir = "."): string[] {
  const path = pathname.replace(/^\/+/, "");
  const prefix = staticDir === "." ? "" : `${staticDir.replace(/\/$/, "")}/`;
  if (!path || path.endsWith("/")) {
    return [`${prefix}${path}index.html`];
  }
  const leaf = path.slice(path.lastIndexOf("/") + 1);
  return leaf.includes(".")
    ? [`${prefix}${path}`]
    : [`${prefix}${path}`, `${prefix}${path}.html`, `${prefix}${path}/index.html`];
}

export function resolveRequest(
  manifest: ArtifactManifest,
  pathname: string,
): ResolvedRequest | null {
  const files = new Map(manifest.files.map((file) => [file.path, file]));
  for (const path of candidates(pathname, manifest.output?.staticDir)) {
    const file = files.get(path);
    if (file) {
      return { type: "static", file };
    }
  }
  const route = manifest.output?.routes.find((item) => matchesRoute(item.src, pathname));
  const target = route?.target;
  if (target?.type === "function") {
    const fn = manifest.output?.functions.find((item) => item.name === target.function);
    return fn ? { type: "function", function: fn } : null;
  }
  const staticDir = manifest.output?.staticDir;
  const indexPath = staticDir && staticDir !== "." ? `${staticDir}/index.html` : "index.html";
  const index = target?.type === "static" ? files.get(indexPath) : null;
  return index ? { type: "static", file: index } : null;
}

export function selectAssetVariant(
  manifest: ArtifactManifest,
  file: ArtifactManifest["files"][number],
  accept: string,
): ArtifactManifest["files"][number] {
  const extension = file.path.split(".").pop()?.toLowerCase();
  const preferred =
    accept.includes("image/webp") && ["jpg", "jpeg", "png"].includes(extension ?? "")
      ? `${file.path}.webp`
      : accept.includes("video/webm") && ["mp4", "mov", "m4v"].includes(extension ?? "")
        ? `${file.path}.webm`
        : null;
  return preferred
    ? (manifest.files.find((candidate) => candidate.path === preferred) ?? file)
    : file;
}
