import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { markDomainVerified } from "@/lib/services/domain-management.service";

interface RouteParams {
  params: Promise<{ domainId: string }>;
}

export async function POST(_request: NextRequest, context: RouteParams) {
  try {
    const [userId, { domainId }] = await Promise.all([
      requireUserId(),
      context.params,
    ]);
    return ok({ verified: await markDomainVerified(userId, domainId) });
  } catch (error) {
    return fail(error);
  }
}
