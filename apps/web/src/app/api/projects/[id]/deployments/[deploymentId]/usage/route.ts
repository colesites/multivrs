import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { deploymentUsageSchema } from "@/lib/schemas/deployment-usage.schemas";
import { recordDeploymentUsage } from "@/lib/services/deployment-usage.service";

interface RouteParams {
  params: Promise<{ deploymentId: string; id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { deploymentId, id } = await params;
    const input = await parseBody(request, deploymentUsageSchema);
    await recordDeploymentUsage(await requireUserId(), id, deploymentId, input);
    return ok({ recorded: true }, 201);
  } catch (error) {
    return fail(error);
  }
}
