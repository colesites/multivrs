import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { removeDomain } from "@/lib/services/domain-management.service";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ domainId: string }>;
}

export async function DELETE(_request: NextRequest, context: RouteParams) {
  try {
    const [userId, { domainId }] = await Promise.all([
      requireUserId(),
      context.params,
    ]);
    await removeDomain(userId, domainId);
    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
