import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { deleteEdgeConfigEntry } from "@/lib/services/content-platform.service";

interface RouteParams {
  params: Promise<{ id: string; key: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id, key } = await params;
    await deleteEdgeConfigEntry(await requireUserId(), id, key);
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
