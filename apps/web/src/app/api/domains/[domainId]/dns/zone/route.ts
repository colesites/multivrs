import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { enableDomainDns } from "@/lib/services/domain-dns.service";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ domainId: string }>;
}

export async function POST(_request: NextRequest, context: RouteParams) {
  try {
    const [userId, { domainId }] = await Promise.all([
      requireUserId(),
      context.params,
    ]);
    return ok(await enableDomainDns(userId, domainId), 201);
  } catch (error) {
    return fail(error);
  }
}
