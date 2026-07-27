import { z } from "zod";
import { fail, ok } from "@/lib/api/respond";
import { verifyMailWebhook } from "@/lib/mail/mail-webhook-auth";
import { deliverMailMessage } from "@/lib/services/mail-delivery.service";

const jobSchema = z.object({
  userId: z.string().min(1),
  messageId: z.uuid(),
});

export async function POST(request: Request) {
  try {
    const body = await verifyMailWebhook(request, "MAIL_WORKER_SECRET");
    const job = jobSchema.parse(JSON.parse(body));
    await deliverMailMessage(job.userId, job.messageId);
    return ok({ delivered: true });
  } catch (error) {
    return fail(error);
  }
}
