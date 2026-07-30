import type { NextRequest } from "next/server";
import { requireInternalWorkflowRequest } from "@/lib/api/internal-workflow-auth";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { ingestRuntimeLogsSchema } from "@/lib/schemas/runtime-log.schemas";
import { ingestRuntimeLogs } from "@/lib/services/runtime-log.service";

export async function POST(request: NextRequest) {
  try {
    requireInternalWorkflowRequest(request);
    return ok(
      await ingestRuntimeLogs(
        await parseBody(request, ingestRuntimeLogsSchema),
      ),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}
