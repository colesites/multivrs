import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { runPlatformWorkflowSchema } from "@/lib/schemas/platform-workflow.schemas";
import { runPlatformWorkflow } from "@/lib/services/platform-workflow.service";

interface RouteParams {
  params: Promise<{ id: string; workflowId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, workflowId } = await params;
    const { input } = await parseBody(request, runPlatformWorkflowSchema);
    return ok(
      await runPlatformWorkflow(await requireUserId(), id, workflowId, input),
      202,
    );
  } catch (error) {
    return fail(error);
  }
}
