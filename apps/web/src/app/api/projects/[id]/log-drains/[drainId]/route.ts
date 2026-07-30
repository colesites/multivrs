import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { deleteLogDrain } from "@/lib/services/log-drain.service";

interface RouteParams {
  params: Promise<{ drainId: string; id: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { drainId, id } = await params;
    await deleteLogDrain(await requireUserId(), id, drainId);
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
