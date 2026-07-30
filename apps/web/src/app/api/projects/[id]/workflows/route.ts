import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createPlatformWorkflowSchema } from "@/lib/schemas/platform-workflow.schemas";
import {
  createPlatformWorkflow,
  listPlatformWorkflows,
} from "@/lib/services/platform-workflow.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    return ok(
      await listPlatformWorkflows(await requireUserId(), (await params).id),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    return ok(
      await createPlatformWorkflow(
        await requireUserId(),
        (await params).id,
        await parseBody(request, createPlatformWorkflowSchema),
      ),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}
