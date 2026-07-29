import { updateDeploymentStatusInputSchema } from "@multivrs/client";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { transitionDeployment } from "@/lib/services/deployment-lifecycle.service";

interface RouteParams {
  params: Promise<{ id: string; deploymentId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id, deploymentId } = await params;
    const input = await parseBody(request, updateDeploymentStatusInputSchema);
    return ok(
      await transitionDeployment(
        userId,
        id,
        deploymentId,
        input.status,
        input.message,
      ),
    );
  } catch (error) {
    return fail(error);
  }
}
