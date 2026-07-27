import { fail, ok } from "@/lib/api/respond";
import { verifyMailWebhook } from "@/lib/mail/mail-webhook-auth";
import { mailProviderEventSchema } from "@/lib/schemas/mail-provider.schemas";
import { recordProviderEvent } from "@/lib/services/mail-provider-event.service";

export async function POST(request: Request) {
  try {
    const body = await verifyMailWebhook(
      request,
      "MAIL_PROVIDER_WEBHOOK_SECRET",
    );
    const input = mailProviderEventSchema.parse(JSON.parse(body));
    return ok(await recordProviderEvent(input), 202);
  } catch (error) {
    return fail(error);
  }
}
