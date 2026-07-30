import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { updateBulkRedirectSchema } from "@/lib/schemas/content-platform.schemas";
import {
  deleteBulkRedirect,
  updateBulkRedirect,
} from "@/lib/services/content-platform.service";

interface RouteParams {
  params: Promise<{ id: string; redirectId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, redirectId } = await params;
    const input = await parseBody(request, updateBulkRedirectSchema);
    return ok(
      await updateBulkRedirect(await requireUserId(), id, redirectId, input),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id, redirectId } = await params;
    await deleteBulkRedirect(await requireUserId(), id, redirectId);
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
