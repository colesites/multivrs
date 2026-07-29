import { fail, ok } from "@/lib/api/respond";
import { verifyMailWebhook } from "@/lib/mail/mail-webhook-auth";
import { reconcilePendingMailDomains } from "@/lib/services/mail-domain.service";
import { prepareDueMailJobs } from "@/lib/services/mail-scheduler.service";
import { deliverWebhookBatch } from "@/lib/services/mail-webhook-delivery.service";

export async function POST(request: Request) {
  try {
    await verifyMailWebhook(request, "MAIL_WORKER_SECRET");
    const [domains, jobs, webhooks] = await Promise.all([
      reconcilePendingMailDomains(),
      prepareDueMailJobs(),
      deliverWebhookBatch(),
    ]);
    return ok({ domains, jobs, webhooks });
  } catch (error) {
    return fail(error);
  }
}
