import type { Artifact } from "@multivrs/build-utils";
import { ValidationError } from "@multivrs/error-utils";
import { createArtifactStore } from "@/lib/artifacts/store";
import { markDeploymentReady } from "@/lib/services/deployment-lifecycle.service";
import { deploymentUrl } from "@/lib/services/serve.service";

export async function finalizeArtifact(
  userId: string,
  projectId: string,
  deploymentId: string,
  artifact: Artifact,
) {
  const store = createArtifactStore();
  const presence = await Promise.all(
    artifact.files.map((file) => store.has(file.hash)),
  );
  if (presence.some((exists) => !exists)) {
    throw new ValidationError("Artifact upload is incomplete");
  }
  await store.putManifest(artifact);
  return markDeploymentReady(userId, projectId, deploymentId, {
    artifactHash: artifact.hash,
    url: deploymentUrl(deploymentId),
  });
}
