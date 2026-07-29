import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { getDeployment } from "@/lib/services/deployment.service";

interface RouteParams {
  params: Promise<{ id: string; deploymentId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id, deploymentId } = await params;
    const deployment = await getDeployment(userId, id, deploymentId);
    return ok(deployment);
  } catch (err) {
    return fail(err);
  }
}
