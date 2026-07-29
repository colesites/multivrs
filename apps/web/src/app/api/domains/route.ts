import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { connectDomainSchema } from "@/lib/domains/dns.schemas";
import { connectDomain } from "@/lib/services/domain-management.service";


export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const input = await parseBody(request, connectDomainSchema);
    return ok(await connectDomain(userId, input), 201);
  } catch (error) {
    return fail(error);
  }
}
