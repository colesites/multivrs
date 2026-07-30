import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createMailWebhookSchema } from "@/lib/schemas/mail-resource.schemas";
import { createWebhook } from "@/lib/services/mail-resource.service";

// This authenticated control-plane route creates an outbound customer webhook;
// it does not receive provider webhook events or act on unsigned callbacks.
// react-doctor-disable-next-line webhook-signature-risk
export async function POST(request: Request) {
  try {
    return ok(
      await createWebhook(
        await requireUserId(),
        await parseBody(request, createMailWebhookSchema),
      ),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}
