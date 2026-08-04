import { UnauthorizedError } from "@multivrs/error-utils";
import { fail, ok } from "@/lib/api/respond";
import { reconcileCloudflareBillingUsage } from "@/lib/services/billing-analytics-reconcile.service";

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const allowed = [process.env.CRON_SECRET, process.env.MULTIVRS_SERVE_TOKEN]
      .filter(Boolean)
      .some((token) => authorization === `Bearer ${token}`);
    if (!allowed)
      throw new UnauthorizedError("Invalid billing reconciliation token");
    return ok(await reconcileCloudflareBillingUsage());
  } catch (error) {
    return fail(error);
  }
}
