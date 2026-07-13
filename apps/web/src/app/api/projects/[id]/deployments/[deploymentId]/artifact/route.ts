/**
 * Upload a completed build artifact for a queued deployment.
 *
 * The CLI sends content-addressed blobs to this route; the web app owns the R2
 * credentials and persists the blobs/manifest server-side.
 */

import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { Artifact } from "@multivrs/build-utils";
import { uploadArtifact } from "@multivrs/build-utils";
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

export const runtime = "nodejs";

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
  let tempDir: string | null = null;
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
    tempDir = join(tmpdir(), `multivrs-upload-${deploymentId}`);
    await mkdir(tempDir, { recursive: true });

    const files: Artifact["files"] = [];
    for (const file of input.files) {
      assertSafePath(file.path);
      const bytes = Buffer.from(file.contentsBase64, "base64");
      if (hashBytes(bytes) !== file.hash || bytes.byteLength !== file.size) {
        throw new Error(`Artifact file integrity check failed: ${file.path}`);
      }
      const target = join(tempDir, file.path);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, bytes);
      files.push({ path: file.path, hash: file.hash, size: file.size });
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

    await uploadArtifact(createArtifactStore(), tempDir, artifact);
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
  } finally {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  }
}
