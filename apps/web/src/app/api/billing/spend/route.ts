import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { updateSpendPolicySchema } from "@/lib/schemas/billing.schemas";
import { updateBillingSpendPolicy } from "@/lib/services/billing-spend.service";

export async function PUT(request: Request) {
  try {
    const input = await parseBody(request, updateSpendPolicySchema);
    await updateBillingSpendPolicy(await requireUserId(), input);
    return ok({ updated: true });
  } catch (error) {
    return fail(error);
  }
}
