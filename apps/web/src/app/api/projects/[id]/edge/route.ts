import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { updateEdgeSettingsSchema } from "@/lib/schemas/edge-settings.schemas";
import {
  getEdgeSettings,
  updateEdgeSettings,
} from "@/lib/services/edge-settings.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    return ok(await getEdgeSettings(await requireUserId(), (await params).id));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const input = await parseBody(request, updateEdgeSettingsSchema);
    return ok(
      await updateEdgeSettings(await requireUserId(), (await params).id, input),
    );
  } catch (error) {
    return fail(error);
  }
}
