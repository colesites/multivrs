import { UnauthorizedError } from "@multivrs/error-utils";
import { fail, ok } from "@/lib/api/respond";
import { publishBillingMeterEvents } from "@/lib/services/stripe-meter.service";

async function publish(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const allowed = [process.env.CRON_SECRET, process.env.MULTIVRS_SERVE_TOKEN]
      .filter(Boolean)
      .some((token) => authorization === `Bearer ${token}`);
    if (!allowed) {
      throw new UnauthorizedError("Invalid billing worker token");
    }
    return ok(await publishBillingMeterEvents());
  } catch (error) {
    return fail(error);
  }
}

export const GET = publish;
export const POST = publish;
