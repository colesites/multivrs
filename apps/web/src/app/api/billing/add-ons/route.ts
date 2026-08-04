import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { updateBillingAddOnSchema } from "@/lib/schemas/billing.schemas";
import { updateBillingAddOn } from "@/lib/services/billing-add-on.service";

export async function PUT(request: Request) {
  try {
    const input = await parseBody(request, updateBillingAddOnSchema);
    await updateBillingAddOn(await requireUserId(), input);
    return ok({ updated: true });
  } catch (error) {
    return fail(error);
  }
}
