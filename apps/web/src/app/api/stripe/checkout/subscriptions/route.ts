import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createSubscriptionCheckout } from "@/lib/services/subscription-checkout.service";

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    let body: { organizationId?: string; returnSlug?: string } = {};
    try {
      body = (await request.json()) as {
        organizationId?: string;
        returnSlug?: string;
      };
    } catch {
      // Body is optional
    }
    return ok(
      await createSubscriptionCheckout(userId, {
        organizationId: body.organizationId,
        returnSlug: body.returnSlug,
      }),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}
