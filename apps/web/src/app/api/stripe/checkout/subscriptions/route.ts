import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createSubscriptionCheckout } from "@/lib/services/subscription-checkout.service";

export async function POST() {
  try {
    const userId = await requireUserId();
    return ok(await createSubscriptionCheckout(userId), 201);
  } catch (error) {
    return fail(error);
  }
}
