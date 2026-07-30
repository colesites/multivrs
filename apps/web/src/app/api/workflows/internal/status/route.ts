import type { NextRequest } from "next/server";
import { requireInternalWorkflowRequest } from "@/lib/api/internal-workflow-auth";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { internalWorkflowStatusSchema } from "@/lib/schemas/platform-workflow.schemas";
import { updatePlatformWorkflowRun } from "@/lib/services/platform-workflow.service";

export async function POST(request: NextRequest) {
  try {
    requireInternalWorkflowRequest(request);
    return ok(
      await updatePlatformWorkflowRun(
        await parseBody(request, internalWorkflowStatusSchema),
      ),
    );
  } catch (error) {
    return fail(error);
  }
}
