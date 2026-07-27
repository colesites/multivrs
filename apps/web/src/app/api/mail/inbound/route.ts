import { fail, ok } from "@/lib/api/respond";
import { verifyMailWebhook } from "@/lib/mail/mail-webhook-auth";
import { inboundMailSchema } from "@/lib/schemas/mail-message.schemas";
import { receiveMail } from "@/lib/services/mail-message.service";

export async function POST(request: Request) {
  try {
    const body = await verifyMailWebhook(
      request,
      "MAIL_INBOUND_WEBHOOK_SECRET",
    );
    return ok(
      await receiveMail(inboundMailSchema.parse(JSON.parse(body))),
      202,
    );
  } catch (error) {
    return fail(error);
  }
}
