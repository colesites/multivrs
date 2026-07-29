/**
 * Upload a completed build artifact for a queued deployment.
 *
 * The CLI sends content-addressed blobs to this route; the web app owns the R2
 * credentials and persists the blobs/manifest server-side.
 */

import { createHash } from "node:crypto";
import type { Artifact } from "@multivrs/build-utils/artifact";
import { uploadDeploymentArtifactInputSchema } from "@multivrs/client";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createArtifactStore } from "@/lib/artifacts/store";
import {
  markDeploymentBuilding,
  markDeploymentError,
  markDeploymentReady,
} from "@/lib/services/deployment-lifecycle.service";
import { deploymentUrl } from "@/lib/services/serve.service";

interface RouteParams {
  params: Promise<{ id: string; deploymentId: string }>;
}

function hashBytes(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function hashArtifact(files: Artifact["files"]): string {
  const manifest = createHash("sha256");
  for (const file of files) {
    manifest.update(`${file.path}:${file.hash}\n`);
  }
  return manifest.digest("hex");
}

function assertSafePath(path: string): void {
  if (path.startsWith("/") || path.includes("..") || path.includes("\\")) {
    throw new Error(`Unsafe artifact path: ${path}`);
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  let userId: string | null = null;
  let projectId: string | null = null;
  let deploymentId: string | null = null;

  try {
    userId = await requireUserId();
    const resolvedParams = await params;
    projectId = resolvedParams.id;
    deploymentId = resolvedParams.deploymentId;
    await markDeploymentBuilding(userId, projectId, deploymentId);
    const input = await parseBody(req, uploadDeploymentArtifactInputSchema);
    const files: Artifact["files"] = [];
    const uploads: Array<{ bytes: Uint8Array; hash: string }> = [];
    for (const file of input.files) {
      assertSafePath(file.path);
      const bytes = Buffer.from(file.contentsBase64, "base64");
      if (hashBytes(bytes) !== file.hash || bytes.byteLength !== file.size) {
        throw new Error(`Artifact file integrity check failed: ${file.path}`);
      }
      files.push({ path: file.path, hash: file.hash, size: file.size });
      uploads.push({ bytes, hash: file.hash });
    }

    files.sort((a, b) => a.path.localeCompare(b.path));
    const artifact: Artifact = {
      hash: hashArtifact(files),
      files,
      output: input.output,
    };
    if (artifact.hash !== input.artifactHash) {
      throw new Error("Artifact manifest hash mismatch");
    }

    const store = createArtifactStore();
    await Promise.all(
      uploads.map(async ({ bytes, hash }) => {
        if (!(await store.has(hash))) await store.put(hash, bytes);
      }),
    );
    await store.putManifest(artifact);
    const url = deploymentUrl(deploymentId);
    return ok(
      await markDeploymentReady(userId, projectId, deploymentId, {
        artifactHash: artifact.hash,
        url,
      }),
    );
  } catch (err) {
    if (userId && projectId && deploymentId) {
      await markDeploymentError(
        userId,
        projectId,
        deploymentId,
        err instanceof Error ? err.message : "Artifact upload failed",
      ).catch(() => undefined);
    }
    return fail(err);
  }
}
