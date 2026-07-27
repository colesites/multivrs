import { createHash } from "node:crypto";
import type { Artifact } from "@multivrs/build-utils/artifact";
import type { ArtifactMetadataInput } from "@multivrs/client";
import { ValidationError } from "@multivrs/error-utils";

export function assertSafeArtifactPath(path: string): void {
  if (path.startsWith("/") || path.includes("..") || path.includes("\\")) {
    throw new ValidationError(`Unsafe artifact path: ${path}`);
  }
}

export function artifactFromMetadata(input: ArtifactMetadataInput): Artifact {
  const files = [...input.files].sort((a, b) => a.path.localeCompare(b.path));
  const digest = createHash("sha256");
  for (const file of files) {
    assertSafeArtifactPath(file.path);
    digest.update(`${file.path}:${file.hash}\n`);
  }
  const hash = digest.digest("hex");
  if (hash !== input.artifactHash) {
    throw new ValidationError("Artifact manifest hash mismatch");
  }
  return { hash, files, output: input.output };
}
