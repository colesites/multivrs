import { fail, ok } from "@/lib/api/respond";
import { getPublicDeployment } from "@/lib/services/deployment.service";

interface RouteParams {
  params: Promise<{ deploymentId: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { deploymentId } = await params;
    const deployment = await getPublicDeployment(deploymentId);
    return ok({
      id: deployment.id,
      projectId: deployment.projectId,
      status: deployment.status,
      artifactHash: deployment.artifactHash,
      renderMode: deployment.renderMode,
    });
  } catch (err) {
    return fail(err);
  }
}
