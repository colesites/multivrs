import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { purgeProjectCache } from "@/lib/services/edge-settings.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    await purgeProjectCache(await requireUserId(), (await params).id);
    return ok({ purged: true });
  } catch (error) {
    return fail(error);
  }
}
