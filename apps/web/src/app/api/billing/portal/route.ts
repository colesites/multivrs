import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { billingPortalSchema } from "@/lib/schemas/billing.schemas";
import { createBillingPortal } from "@/lib/services/billing-portal.service";

export async function POST(request: Request) {
  try {
    const input = await parseBody(request, billingPortalSchema);
    return ok(await createBillingPortal(await requireUserId(), input.scopeId));
  } catch (error) {
    return fail(error);
  }
}
