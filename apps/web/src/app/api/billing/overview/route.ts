import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { getBillingOverview } from "@/lib/services/billing-overview.service";

export async function GET() {
  try {
    return ok(await getBillingOverview(await requireUserId()));
  } catch (error) {
    return fail(error);
  }
}
