import type { NextRequest } from "next/server";
import { requireInternalWorkflowRequest } from "@/lib/api/internal-workflow-auth";
import { fail, ok } from "@/lib/api/respond";
import { claimDuePlatformWorkflowRuns } from "@/lib/services/platform-workflow.service";

export async function POST(request: NextRequest) {
  try {
    requireInternalWorkflowRequest(request);
    return ok({ runs: await claimDuePlatformWorkflowRuns() });
  } catch (error) {
    return fail(error);
  }
}
