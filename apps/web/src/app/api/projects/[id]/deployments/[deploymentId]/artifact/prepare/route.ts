import { artifactMetadataInputSchema } from "@multivrs/client";
import { ConflictError } from "@multivrs/error-utils";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createArtifactStore } from "@/lib/artifacts/store";
import { artifactFromMetadata } from "@/lib/artifacts/validation";
import { getDeployment } from "@/lib/services/deployment.service";

interface RouteParams {
  params: Promise<{ id: string; deploymentId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id, deploymentId } = await params;
    const input = await parseBody(request, artifactMetadataInputSchema);
    const deployment = await getDeployment(userId, id, deploymentId);
    if (deployment.target !== input.target) {
      throw new ConflictError("Deployment target does not match upload target");
    }
    const artifact = artifactFromMetadata(input);
    const store = createArtifactStore();
    const unique = [...new Set(artifact.files.map((file) => file.hash))];
    const present = await Promise.all(unique.map((hash) => store.has(hash)));
    const uploads = unique.flatMap((hash, index) =>
      present[index]
        ? []
        : [
            {
              hash,
              url: `/api/projects/${id}/deployments/${deploymentId}/artifact/blobs/${hash}`,
            },
          ],
    );
    return ok({ uploads });
  } catch (error) {
    return fail(error);
  }
}
