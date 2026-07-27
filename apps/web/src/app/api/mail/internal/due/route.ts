import { fail, ok } from "@/lib/api/respond";
import { verifyMailWebhook } from "@/lib/mail/mail-webhook-auth";
import { prepareDueMailJobs } from "@/lib/services/mail-scheduler.service";
import { deliverWebhookBatch } from "@/lib/services/mail-webhook-delivery.service";

export async function POST(request: Request) {
  try {
    await verifyMailWebhook(request, "MAIL_WORKER_SECRET");
    const [jobs, webhooks] = await Promise.all([
      prepareDueMailJobs(),
      deliverWebhookBatch(),
    ]);
    return ok({ jobs, webhooks });
  } catch (error) {
    return fail(error);
  }
}
