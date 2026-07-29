import { createDeploymentLogInputSchema } from "@multivrs/client";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import {
  appendDeploymentLog,
  listDeploymentLogs,
} from "@/lib/services/deployment-log.service";


interface RouteParams {
  params: Promise<{ id: string; deploymentId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id, deploymentId } = await params;
    return ok(await listDeploymentLogs(userId, id, deploymentId));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id, deploymentId } = await params;
    const input = await parseBody(request, createDeploymentLogInputSchema);
    return ok(await appendDeploymentLog(userId, id, deploymentId, input), 201);
  } catch (error) {
    return fail(error);
  }
}
