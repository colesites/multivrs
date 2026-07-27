import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import {
  emailRouteIdSchema,
  updateEmailRouteSchema,
} from "@/lib/schemas/email-route.schemas";
import {
  deleteEmailRoute,
  setEmailRouteEnabled,
} from "@/lib/services/email-route.service";

interface RouteParams {
  params: Promise<{ routeId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const id = emailRouteIdSchema.parse((await params).routeId);
    const input = await parseBody(request, updateEmailRouteSchema);
    await setEmailRouteEnabled(await requireUserId(), id, input.enabled);
    return ok({ updated: true });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const id = emailRouteIdSchema.parse((await params).routeId);
    await deleteEmailRoute(await requireUserId(), id);
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
