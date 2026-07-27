import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { environmentVariableIdSchema } from "@/lib/schemas/environment-variable.schemas";
import { deleteEnvironmentVariable } from "@/lib/services/environment-variable.service";

interface RouteParams {
  params: Promise<{ id: string; variableId: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id, variableId } = await params;
    await deleteEnvironmentVariable(
      await requireUserId(),
      id,
      environmentVariableIdSchema.parse(variableId),
    );
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
