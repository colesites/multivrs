import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import {
  sandboxCommandSchema,
  sandboxIdSchema,
} from "@/lib/schemas/sandbox.schemas";
import {
  deleteProjectSandbox,
  runSandboxCommand,
} from "@/lib/services/sandbox.service";

interface RouteParams {
  params: Promise<{ id: string; sandboxId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, sandboxId } = await params;
    const input = await parseBody(request, sandboxCommandSchema);
    return ok(
      await runSandboxCommand(
        await requireUserId(),
        id,
        sandboxIdSchema.parse(sandboxId),
        input.command,
      ),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id, sandboxId } = await params;
    await deleteProjectSandbox(
      await requireUserId(),
      id,
      sandboxIdSchema.parse(sandboxId),
    );
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
