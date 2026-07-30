import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { updateContentSettingsSchema } from "@/lib/schemas/content-platform.schemas";
import {
  getContentPlatform,
  updateContentSettings,
} from "@/lib/services/content-platform.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    return ok(
      await getContentPlatform(await requireUserId(), (await params).id),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const input = await parseBody(request, updateContentSettingsSchema);
    return ok(
      await updateContentSettings(
        await requireUserId(),
        (await params).id,
        input,
      ),
    );
  } catch (error) {
    return fail(error);
  }
}
