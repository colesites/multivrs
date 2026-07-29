import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { domainCheckoutSchema } from "@/lib/domains/domain-checkout.schemas";
import { createDomainCheckout } from "@/lib/services/domain-checkout.service";


export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const input = await parseBody(request, domainCheckoutSchema);
    return ok(await createDomainCheckout(userId, input), 201);
  } catch (error) {
    return fail(error);
  }
}
