import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { updateMicrofrontendRouteSchema } from "@/lib/schemas/content-platform.schemas";
import {
  deleteMicrofrontend,
  updateMicrofrontend,
} from "@/lib/services/content-platform.service";

interface RouteParams {
  params: Promise<{ id: string; routeId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, routeId } = await params;
    const input = await parseBody(request, updateMicrofrontendRouteSchema);
    return ok(
      await updateMicrofrontend(await requireUserId(), id, routeId, input),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id, routeId } = await params;
    await deleteMicrofrontend(await requireUserId(), id, routeId);
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
